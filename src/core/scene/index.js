import Element from '../element/Element'
import EventEmitter from '../events/index'
import InteractiveElement from "../element/InteractiveElement"
import {removeFromArray, clone} from "../../shared/util"
import {getElementsBound} from "./util"
import Node from '../node/Node'
import Link from '../link/Link'
import {MouseCursor, SceneMode} from '../../shared/constants'

// 返回一个矩形的绘制函数
function DrawRect(x, y, w, h) {
  return function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = "rgba(0, 0, 236, 0.5)"
    ctx.fillStyle = "rgba(0, 0, 236, 0.1)"
    ctx.rect(x, y, w, h)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
  }
}

export default class Scene extends Element {
  constructor(stage) {
    super(stage)

    this.eventEmitter = new EventEmitter
    // 元素类型
    this.elementType = "scene"
    // 场景子元素
    this.childs = []
    // zIndex 值与某一类型的元素的映射关系，如 {2: [Link, Link, ..] 3: [Node, Node, ..]}
    this.zIndexMap = {}
    // zIndex 值组成的数组，如 [2, 3]，2表示连线、3表示节点
    this.zIndexArray = []
    // 场景背景颜色
    this.backgroundColor = "255, 255, 255"
    // 场景是否可见
    this.visible = true
    // 场景透明度
    this.alpha = 0
    // 场景 X 轴偏移量
    this.scaleX = 1
    // 场景 Y 轴偏移量
    this.scaleY = 1
    // 场景模式
    this.mode = SceneMode.normal
    // 场景是否可平移或纵移
    this.translate = true
    this.translateX = 0
    this.translateY = 0
    this.lastTranslateX = 0
    this.lastTranslateY = 0
    this.mouseDown = false
    this.mouseDownX = null
    this.mouseDownY = null
    this.mouseDownEvent = null
    // 框选区域
    this.areaSelect = false
    // 操作数组
    this.operations = []
    // 由被选中元素组成的数组
    this.selectedElements = []
    // 是否绘制所有
    this.paintAll = false

    const properties = "background,backgroundColor,mode,paintAll,areaSelect,translate,translateX,translateY,lastTranslatedX,lastTranslatedY,alpha,visible,scaleX,scaleY".split(",")

    this.serializedProperties = this.serializedProperties.concat(properties)

    if (stage) {
      stage.add(this)
      this.addTo(stage)
    }
  }

  // 设置场景背景
  setBackground(url) {
    this.background = url
  }

  // 添加到舞台
  addTo(stage) {
    this.stage !== stage
    && stage
    && (this.stage = stage)
  }

  // 展示当前场景
  show() {
    this.visible = true
  }

  // 隐藏当前场景
  hide() {
    this.visible = false
  }

  // 绘制入口
  paint(ctx) {
    if (this.visible && this.stage) {
      ctx.save()
      this.paintBackground(ctx)
      ctx.restore()
      ctx.save()
      ctx.scale(this.scaleX, this.scaleY)

      if (this.translate) {
        const offsetTransObj = this.getOffsetTranslate(ctx)

        ctx.translate(offsetTransObj.translateX, offsetTransObj.translateY)
      }

      this.paintChilds(ctx)
      ctx.restore()
      ctx.save()
      this.paintOperations(ctx, this.operations)
      ctx.restore()
    }
  }

  // 场景重绘
  repaint(ctx) {
    this.visible && this.paint(ctx)
  }

  // 绘制场景背景
  paintBackground(ctx) {
    if (this.background) {
      ctx.drawImage(this.background, 0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    else {
      ctx.beginPath()
      ctx.fillStyle = "rgba(" + this.backgroundColor + "," + this.alpha + ")"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.closePath()
    }
  }

  // 获取可展示的元素
  getDisplayedElements() {
    let displayedEleArr = []

    for (
      let i = 0, len = this.zIndexArray.length;
      i < len;
      i++
    ) {
      const c = this.zIndexArray[i]
      const eleArr = this.zIndexMap[c]

      for (let j = 0; j < eleArr.length; j++) {
        const ele = eleArr[j]

        this.isVisiable(ele) && displayedEleArr.push(ele)
      }
    }

    return displayedEleArr
  }

  // 获取可展示的节点
  getDisplayedNodes() {
    let displayedNodeArr = []

    for (let i = 0; i < this.childs.length; i++) {
      const ele = this.childs[i]

      ele instanceof Node
      && this.isVisiable(ele)
      && displayedNodeArr.push(ele)
    }

    return displayedNodeArr
  }

  // 绘制元素
  paintChilds(ctx) {
    for (let i = 0, len = this.zIndexArray.length; i < len; i++) {
      const zIndex = this.zIndexArray[i]
      const eleArr = this.zIndexMap[zIndex]

      for (let j = 0, len = eleArr.length; j < len; j++) {
        const ele = eleArr[j]

        if (
          this.paintAll
          || this.isVisiable(ele)
        ) {
          ctx.save()

          if (
            ele.transformAble
          ) {
            const h = ele.getCenterLocation()

            ctx.translate(h.x, h.y)

            if (ele.rotate) {
              ctx.rotate(ele.rotate)

              if (ele.scaleX && ele.scaleY) {
                ctx.scale(ele.scaleX, ele.scaleY)
              } else {
                ele.scaleX
                  ? ctx.scale(ele.scaleX, 1)
                  : ele.scaleY && ctx.scale(1, ele.scaleY)
              }
            }
          }

          if (ele.shadow) {
            ctx.shadowBlur = ele.shadowBlur
            ctx.shadowColor = ele.shadowColor
            ctx.shadowOffsetX = ele.shadowOffsetX
            ctx.shadowOffsetY = ele.shadowOffsetY
          }

          if (ele instanceof InteractiveElement) {
            ele.selected
            && ele.showSelected
            && ele.paintSelected(ctx)

            ele.isMouseOver && ele.paintMouseover(ctx)
          }

          ele.paint(ctx)
          ctx.restore()
        }
      }
    }
  }

  // 获取场景偏移量
  getOffsetTranslate(a) {
    let w = this.stage.canvas.width
    let h = this.stage.canvas.height

    if (
      a
      && "move" !== a
    ) {
      w = a.canvas.width
      h = a.canvas.height
    }

    let x = w / this.scaleX / 2
    let y = h / this.scaleY / 2

    return {
      translateX: this.translateX + (x - x * this.scaleX),
      translateY: this.translateY + (y - y * this.scaleY)
    }
  }

  // 判断元素在当前场景的可视区域内是否可见
  isVisiable(ele) {
    if (!ele.visible) return false

    if (ele instanceof Link) return true

    const offsetTranslateObj = this.getOffsetTranslate()
    let x = ele.x + offsetTranslateObj.translateX
    let y = ele.y + offsetTranslateObj.translateY

    x *= this.scaleX
    y *= this.scaleY

    const f = x + ele.width * this.scaleX
    const g = y + ele.height * this.scaleY

    return !(x > this.stage.canvas.width
      || y > this.stage.canvas.height
      || 0 > f
      || 0 > g)
  }

  // 绘制操作
  paintOperations(ctx, operations) {
    operations.forEach(function (operation) {
      operation(ctx)
    })
  }

  // 通过传入一个处理函数找到场景中的某些元素
  findElements(cb) {
    let eleArr = []

    this.childs.forEach(function (child) {
      cb(child) && eleArr.push(child)
    })

    return eleArr
  }

  // 通过元素类型名获取元素
  getElementsByClass(ClassName) {
    return this.findElements(function (ele) {
      return ele instanceof ClassName
    })
  }

  // 添加操作
  addOperation(operation) {
    this.operations.push(operation)

    return this
  }

  // 清除操作
  clearOperations() {
    this.operations = []

    return this
  }

  // 通过 x, y 坐标获取元素
  getElementByXY(x, y) {
    let d = null

    for (let i = this.zIndexArray.length - 1; i >= 0; i--) {
      const zIndex = this.zIndexArray[i]
      const eleArr = this.zIndexMap[zIndex]

      for (let j = eleArr.length - 1; j >= 0; j--) {
        const ele = eleArr[j]

        if (
          ele instanceof InteractiveElement
          && this.isVisiable(ele)
          && ele.isInBound(x, y)
        ) {
          return d = ele
        }

      }
    }

    return d
  }

  // 添加元素到场景中
  add(ele) {
    this.childs.push(ele)

    if (!this.zIndexMap[ele.zIndex]) {
      this.zIndexMap[ele.zIndex] = []
      this.zIndexArray.push(ele.zIndex)
      this.zIndexArray.sort(function (a, b) {
        return a - b
      })
    }

    this.zIndexMap["" + ele.zIndex].push(ele)
  }

  // 从当前场景中移除元素
  remove(ele) {
    this.childs = removeFromArray(this.childs, ele)

    const c = this.zIndexMap[ele.zIndex]

    c && (this.zIndexMap[ele.zIndex] = removeFromArray(c, ele))

    ele.removeHandler(this)
  }

  // 清除场景中的所有元素
  clear() {
    this.childs.forEach(function (child) {
      child.removeHandler(this)
    })

    this.childs = []
    this.operations = []
    this.zIndexArray = []
    this.zIndexMap = {}
  }

  // 添加某个元素到被选中的元素数组中
  addToSelected(ele) {
    this.selectedElements.push(ele)
  }

  // 取消所有被选中的元素的选中状态
  cancelAllSelected(a) {
    for (let i = 0, len = this.selectedElements.length; i < len; i++) {
      this.selectedElements[i].unselectedHandler(a)
    }

    this.selectedElements = []
  }

  // 判断某个节点是否在被选中的元素列表中
  notInSelectedNodes(a) {
    for (let i = 0, len = this.selectedElements.length; i < len; i++) {
      if (a === this.selectedElements[i]) return false
    }

    return true
  }

  // 从被选中的元素列表中移除某个元素
  removeFromSelected(a) {
    for (let i = 0, len = this.selectedElements.length; i < len; i++) {
      a === this.selectedElements[i]
      && (this.selectedElements = this.selectedElements.del(i))
    }
  }

  toSceneEvent(e) {
    const eObj = clone(e)

    eObj.x /= this.scaleX
    eObj.y /= this.scaleY

    if (this.translate) {
      const offsetTranslateObj = this.getOffsetTranslate()

      eObj.x -= offsetTranslateObj.translateX
      eObj.y -= offsetTranslateObj.translateY
    }

    if (eObj.dx) {
      eObj.dx /= this.scaleX
      eObj.dy /= this.scaleY
    }

    this.currentElement && (eObj.target = this.currentElement)
    eObj.scene = this

    return eObj
  }

  // 选中某个元素
  selectElement(eObj) {
    const ele = this.getElementByXY(eObj.x, eObj.y)

    if (ele) {
      eObj.target = ele
      ele.mousedownHander(eObj)
      ele.selectedHandler(eObj)

      if (this.notInSelectedNodes(ele)) {
        eObj.ctrlKey || this.cancelAllSelected()

        this.addToSelected(ele)
      }
      else {
        if (1 === eObj.ctrlKey) {
          ele.unselectedHandler()
          this.removeFromSelected(ele)
        }

        this.selectedElements.forEach(ele => ele.selectedHandler(eObj))
      }
    }
    else {
      eObj.ctrlKey || this.cancelAllSelected()
    }

    this.currentElement = ele
  }

  // 鼠标在场景中按下的处理函数
  mousedownHandler(eObj) {
    const e = this.toSceneEvent(eObj)

    this.mouseDown = !0
    this.mouseDownX = e.x
    this.mouseDownY = e.y
    this.mouseDownEvent = e

    if (this.mode === SceneMode.normal) {
      this.selectElement(e)

      if (
        !this.currentElement
        || this.currentElement instanceof Link
        && this.translate
      ) {
        this.lastTranslateX = this.translateX
        this.lastTranslateY = this.translateY
      }
    }
    else {
      if (
        this.mode === SceneMode.drag
        && this.translate
      ) {
        this.lastTranslateX = this.translateX
        this.lastTranslateY = this.translateY
        return
      }

      if (this.mode === SceneMode.select) {
        this.selectElement(e)
      }
      else {
        if (this.mode === SceneMode.edit) {
          this.selectElement(e)

          if (
            !this.currentElement
            || this.currentElement instanceof Link
            && this.translate
          ) {
            this.lastTranslateX = this.translateX
            this.lastTranslateY = this.translateY
          }
        }
      }
    }

    this.dispatchEvent("mousedown", e)
  }

  mouseupHandler(eObj) {
    this.stage.cursor !== MouseCursor.normal
    && (this.stage.cursor = MouseCursor.normal)

    this.clearOperations()

    const e = this.toSceneEvent(eObj)

    if (this.currentElement) {
      e.target = this.currentElement
      this.currentElement.mouseupHandler(e)
    }

    this.dispatchEvent("mouseup", e)
    this.mouseDown = false
  }

  dragElements(eObj) {
    if (
      this.currentElement
      && this.currentElement.dragable
    ) {
      for (let i = 0; i < this.selectedElements.length; i++) {
        const selectedEle = this.selectedElements[i]

        if (selectedEle.dragable) {
          const e = clone(eObj)

          e.target = selectedEle
          selectedEle.mousedragHandler(e)
        }
      }
    }
  }

  mousedragHandler(eObj) {
    const e = this.toSceneEvent(eObj)

    switch (this.mode) {
      case SceneMode.normal:
        if (
          !this.currentElement
          || this.currentElement instanceof Link
        ) {
          if (this.translate) {
            this.stage.cursor = MouseCursor.closed_hand
            this.translateX = this.lastTranslateX + e.dx
            this.translateY = this.lastTranslateY + e.dy
          }
        }
        else {
          this.dragElements(e)
        }
        break
      case SceneMode.drag:
        if (this.translate) {
          this.stage.cursor = MouseCursor.closed_hand
          this.translateX = this.lastTranslateX + e.dx
          this.translateY = this.lastTranslateY + e.dy
        }
        break
      case SceneMode.select:
        this.currentElement
          ? this.currentElement.dragable && this.dragElements(e)
          : this.areaSelect && this.areaSelectHandle(e)
        break
      case SceneMode.edit:
        if (
          !this.currentElement
          || this.currentElement instanceof Link
        ) {
          if (this.translate) {
            this.stage.cursor = MouseCursor.closed_hand
            this.translateX = this.lastTranslateX + e.dx
            this.translateY = this.lastTranslateY + e.dy
          }
        }
        else {
          this.dragElements(e)
        }
        break
    }

    this.dispatchEvent("mousedrag", e)
  }

  areaSelectHandle(e) {
    let b = e.offsetLeft
    let c = e.offsetTop
    let f = this.mouseDownEvent.offsetLeft
    let g = this.mouseDownEvent.offsetTop
    let x = b >= f ? f : b
    let y = c >= g ? g : c
    let w = Math.abs(e.dx) * this.scaleX
    let h = Math.abs(e.dy) * this.scaleY

    const l = new DrawRect(x, y, w, h)

    this.clearOperations().addOperation(l)
    b = e.x
    c = e.y
    f = this.mouseDownEvent.x
    g = this.mouseDownEvent.y
    x = b >= f ? f : b
    y = c >= g ? g : c
    w = Math.abs(e.dx)
    h = Math.abs(e.dy)

    const m = x + w
    const n = y + h

    for (let i = 0; i < this.childs.length; i++) {
      const p = this.childs[i]

      if (
        p.x > x
        && p.x + p.width < m
        && p.y > y
        && p.y + p.height < n
        && this.notInSelectedNodes(p)
      ) {
        p.selectedHandler(e)
        this.addToSelected(p)
      }
    }
  }

  mousemoveHandler(eObj) {
    this.mousecoord = {
      x: eObj.x,
      y: eObj.y
    }

    const e = this.toSceneEvent(eObj)

    if (this.mode === SceneMode.drag) {
      this.stage.cursor = MouseCursor.open_hand
      return
    }

    if (this.mode === SceneMode.normal) {
      this.stage.cursor = MouseCursor.normal
    } else {
      this.mode === SceneMode.select
      && (this.stage.cursor = MouseCursor.normal)
    }

    const ele = this.getElementByXY(e.x, e.y)

    if (ele) {
      if (
        this.mouseOverelement
        && this.mouseOverelement !== ele
      ) {
        e.target = ele
        this.mouseOverelement.mouseoutHandler(e)
      }

      this.mouseOverelement = ele

      if (!ele.isMouseOver) {
        e.target = ele
        ele.mouseoverHandler(e)
        this.dispatchEvent("mouseover", e)
      } else {
        e.target = ele
        ele.mousemoveHandler(e)
        this.dispatchEvent("mousemove", e)
      }
    } else {
      if (this.mouseOverelement) {
        e.target = ele
        this.mouseOverelement.mouseoutHandler(e)
        this.mouseOverelement = null
        this.dispatchEvent("mouseout", e)
      } else {
        e.target = null
        this.dispatchEvent("mousemove", e)
      }
    }
  }

  mouseoverHandler(eObj) {
    const e = this.toSceneEvent(eObj)
    this.dispatchEvent("mouseover", e)
  }

  mouseoutHandler(eObj) {
    const e = this.toSceneEvent(eObj)
    this.dispatchEvent("mouseout", e)
  }

  clickHandler(eObj) {
    const e = this.toSceneEvent(eObj)

    if (this.currentElement) {
      e.target = this.currentElement
      this.currentElement.clickHandler(e)
    }

    this.dispatchEvent("click", e)
  }

  dbclickHandler(eObj) {
    const e = this.toSceneEvent(eObj)

    if (this.currentElement) {
      e.target = this.currentElement
      this.currentElement.dbclickHandler(e)
    } else {
      this.cancelAllSelected()
      this.dispatchEvent("dbclick", e)
    }
  }

  mousewheelHandler(eObj) {
    const e = this.toSceneEvent(eObj)
    this.dispatchEvent("mousewheel", e)
  }

  keydownHandler(eObj) {
    this.dispatchEvent("keydown", eObj)
  }

  keyupHandler(eObj) {
    this.dispatchEvent("keyup", eObj)
  }

  addEventListener(eName, cb) {
    const fn = function (eName) {
      cb.call(this, eName)
    }

    this.eventEmitter.subscribe(eName, fn)

    return this
  }

  removeEventListener(eName) {
    this.eventEmitter.unsubscribe(eName)
  }

  removeAllEventListener() {
    this.eventEmitter = new EventEmitter
  }

  // 分配事件
  dispatchEvent(eName, eObj) {
    this.eventEmitter.publish(eName, eObj)

    return this
  }

  // 场景缩放
  zoom(scaleX, scaleY) {
    scaleX && (this.scaleX = scaleX)
    scaleY && (this.scaleY = scaleY)
  }

  // 场景放大
  zoomOut(scale) {
    if (scale) {
      this.scaleX /= scale
      this.scaleY /= scale
    } else {
      this.scaleX /= .8
      this.scaleY /= .8
    }
  }

  // 场景缩小
  zoomIn(scale) {
    if (scale) {
      this.scaleX *= scale
      this.scaleY *= scale
    } else {
      this.scaleX *= .8
      this.scaleY *= .8
    }
  }

  // 缩放重置
  zoomReset() {
    this.scaleX = 1
    this.scaleY = 1
  }

  // 获取舞台的边界
  getBound() {
    return {
      left: 0,
      top: 0,
      right: this.stage.canvas.width,
      bottom: this.stage.canvas.height,
      width: this.stage.canvas.width,
      height: this.stage.canvas.height
    }
  }

  // 获取场景内所有元素的边界
  getElementsBound() {
    return getElementsBound(this.childs)
  }

  // 设置场景的偏移量为舞台中心点
  translateToCenter(a) {
    const bObj = this.getElementsBound()

    let x = this.stage.canvas.width / 2 - (bObj.left + bObj.right) / 2
    let y = this.stage.canvas.height / 2 - (bObj.top + bObj.bottom) / 2

    if (a) {
      x = a.canvas.width / 2 - (bObj.left + bObj.right) / 2
      y = a.canvas.height / 2 - (bObj.top + bObj.bottom) / 2
    }

    this.translateX = x
    this.translateY = y
  }

  // 设置舞台中心点
  setCenter(x, y) {
    let translateX = x - this.stage.canvas.width / 2
    let translateY = y - this.stage.canvas.height / 2

    this.translateX = -translateX
    this.translateY = -translateY
  }

  // 居中和缩放场景
  centerAndZoom(a, b, c) {
    if (a === 'toCenter') {
      this.translateToCenter(c)

      return
    }

    this.translateToCenter(c)

    if (!a || !b) {
      const bObj = this.getElementsBound()

      let w = bObj.right - bObj.left
      let h = bObj.bottom - bObj.top
      let scaleW = this.stage.canvas.width / w
      let scaleH = this.stage.canvas.height / h

      if (c) {
        const canvasObj = document.getElementById('canvas')
        const canvasWidth = canvasObj.width
        const canvasHeight = canvasObj.height

        w < canvasWidth && (w = canvasWidth)
        h < canvasWidth && (h = canvasHeight)

        scaleW = c.canvas.width / w
        scaleH = c.canvas.height / h
      }

      const min = Math.min(scaleW, scaleH)

      if (min > 1) return

      this.zoom(min, min)
    }

    this.zoom(a, b)
  }

  // 获取舞台中心点坐标
  getCenterLocation() {
    return {
      x: this.stage.canvas.width / 2,
      y: this.stage.canvas.height / 2
    }
  }

  // 场景布局
  doLayout(fn) {
    fn && fn(this, this.childs)
  }

  // 将场景中的所有节点信息序列化为 JSON
  toJson() {
    let self = this
    let jsonStr = "{"

    this.serializedProperties.forEach(function (key) {
      "background" === key && (self[key] = self._background.src)
      "string" === typeof self[key]
      && (self[key] = '"' + self[key] + '"')
      jsonStr += '"' + key + '":' + self[key] + ","
    })

    jsonStr += '"childs":['

    let len = this.childs.length

    this.childs.forEach(function (key, index) {
      jsonStr += key.toJson()
      len > index + 1 && (jsonStr += ",")
    })
    jsonStr += "]"
    jsonStr += "}"

    return jsonStr
  }

  // 获取背景
  get background() {
    return this._background
  }

  // 设置背景
  set background(a) {
    let cc = {}

    if ("string" === typeof a) {
      let b = cc[a]

      if (!b) {
        b = new Image
        b.src = a
        b.onload = function () {
          cc[a] = b
        }
      }

      this._background = b
    }
    else {
      this._background = a
    }
  }

  click(fn) {
    fn
      ? this.addEventListener('click', fn)
      : this.dispatchEvent('click')
  }

  dbclick(fn) {
    fn
      ? this.addEventListener('dbclick', fn)
      : this.dispatchEvent('dbclick')
  }

  mousedown(fn) {
    fn
      ? this.addEventListener('mousedown', fn)
      : this.dispatchEvent('mousedown')
  }

  mouseup(fn) {
    fn
      ? this.addEventListener('mouseup', fn)
      : this.dispatchEvent('mouseup')
  }

  mouseover(fn) {
    fn
      ? this.addEventListener('mouseover', fn)
      : this.dispatchEvent('mouseover')
  }

  mouseout(fn) {
    fn
      ? this.addEventListener('mouseout', fn)
      : this.dispatchEvent('mouseout')
  }

  mousemove(fn) {
    fn
      ? this.addEventListener('mousemove', fn)
      : this.dispatchEvent('mousemove')
  }

  mousedrag(fn) {
    fn
      ? this.addEventListener('mousedrag', fn)
      : this.dispatchEvent('mousedrag')
  }

  mousewheel(fn) {
    fn
      ? this.addEventListener('mousewheel', fn)
      : this.dispatchEvent('mousewheel')
  }

  touchstart(fn) {
    fn
      ? this.addEventListener('touchstart', fn)
      : this.dispatchEvent('touchstart')
  }

  touchmove(fn) {
    fn
      ? this.addEventListener('touchmove', fn)
      : this.dispatchEvent('touchmove')
  }

  touchend(fn) {
    fn
      ? this.addEventListener('touchend', fn)
      : this.dispatchEvent('touchend')
  }

  keydown(fn) {
    fn
      ? this.addEventListener('keydown', fn)
      : this.dispatchEvent('keydown')
  }

  keyup(fn) {
    fn
      ? this.addEventListener('keyup', fn)
      : this.dispatchEvent('keyup')
  }
}
