import Element from '../element/Element'
import EventEmitter from '../events/index'
import InteractiveElement from "../element/InteractiveElement"
import {removeFromArray, clone} from "../../shared/util"
import {getElementsBound} from "./util"
import Node from '../node/Node'
import Link from '../link/Link'
import {MouseCursor, SceneMode} from '../../shared/constants'

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
    this.elementType = "scene"
    this.childs = []
    this.zIndexMap = {}
    this.zIndexArray = []
    this.backgroundColor = "255, 255, 255"
    this.visible = true
    this.alpha = 0
    this.scaleX = 1
    this.scaleY = 1
    this.mode = SceneMode.normal
    this.translate = true
    this.translateX = 0
    this.translateY = 0
    this.lastTranslateX = 0
    this.lastTranslateY = 0
    this.mouseDown = false
    this.mouseDownX = null
    this.mouseDownY = null
    this.mouseDownEvent = null
    this.areaSelect = true
    this.operations = []
    this.selectedElements = []
    this.paintAll = false

    const properties = "background,backgroundColor,mode,paintAll,areaSelect,translate,translateX,translateY,lastTranslatedX,lastTranslatedY,alpha,visible,scaleX,scaleY".split(",")

    this.serializedProperties = this.serializedProperties.concat(properties)

    if (stage) {
      stage.add(this)
      this.addTo(stage)
    }
  }

  setBackground(url) {
    this.background = url
  }

  addTo(stage) {
    this.stage !== stage
    && stage
    && (this.stage = stage)
  }

  show() {
    this.visible = true
  }

  hide() {
    this.visible = false
  }

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

  repaint(ctx) {
    this.visible && this.paint(ctx)
  }

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

  paintOperations(ctx, operations) {
    operations.forEach(function (operation) {
      operation(ctx)
    })
  }

  findElements(cb) {
    let eleArr = []

    this.childs.forEach(function (child) {
      cb(child) && eleArr.push(child)
    })

    return eleArr
  }

  getElementsByClass(ClassName) {
    return this.findElements(function (ele) {
      return ele instanceof ClassName
    })
  }

  addOperation(operation) {
    this.operations.push(operation)

    return this
  }

  clearOperations() {
    this.operations = []

    return this
  }

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

  remove(ele) {
    this.childs = removeFromArray(this.childs, ele)

    const c = this.zIndexMap[ele.zIndex]

    c && (this.zIndexMap[ele.zIndex] = removeFromArray(c, ele))

    ele.removeHandler(this)
  }

  clear() {
    this.childs.forEach(function (child) {
      child.removeHandler(this)
    })

    this.childs = []
    this.operations = []
    this.zIndexArray = []
    this.zIndexMap = {}
  }

  addToSelected(ele) {
    this.selectedElements.push(ele)
  }

  cancelAllSelected(a) {
    for (let i = 0, len = this.selectedElements.length; i < len; i++) {
      this.selectedElements[i].unselectedHandler(a)
    }

    this.selectedElements = []
  }

  notInSelectedNodes(a) {
    for (let i = 0, len = this.selectedElements.length; i < len; i++) {
      if (a === this.selectedElements[i]) return false
    }

    return true
  }

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

  mousedownHandler(eObj) {
    const e = this.toSceneEvent(eObj)

    this.mouseDown = !0
    this.mouseDownX = e.x
    this.mouseDownY = e.y
    this.mouseDownEvent = e

    switch (this.mode) {
      case SceneMode.normal:
        this.selectElement(e)

        if (
          !this.currentElement
          || this.currentElement instanceof Link
          && this.translate
        ) {
          this.lastTranslateX = this.translateX
          this.lastTranslateY = this.translateY
        }

        break
      case SceneMode.drag:
        if (this.translate) {
          this.lastTranslateX = this.translateX
          this.lastTranslateY = this.translateY
          return
        }
        break
      case SceneMode.select:
        this.selectElement(e)
        break
      case SceneMode.edit:
        this.selectElement(e)

        if (
          !this.currentElement
          || this.currentElement instanceof Link
          && this.translate
        ) {
          this.lastTranslateX = this.translateX
          this.lastTranslateY = this.translateY
        }
        break
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

  dispatchEvent(eName, eObj) {
    this.eventEmitter.publish(eName, eObj)

    return this
  }

  zoom(scaleX, scaleY) {
    scaleX && (this.scaleX = scaleX)
    scaleY && (this.scaleY = scaleY)
  }

  zoomOut(scale) {
    if (scale) {
      this.scaleX /= scale
      this.scaleY /= scale
    } else {
      this.scaleX /= .8
      this.scaleY /= .8
    }
  }

  zoomIn(scale) {
    if (scale) {
      this.scaleX *= scale
      this.scaleY *= scale
    } else {
      this.scaleX *= .8
      this.scaleY *= .8
    }
  }

  zoomReset() {
    this.scaleX = 1
    this.scaleY = 1
  }

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

  getElementsBound() {
    return getElementsBound(this.childs)
  }

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

  setCenter(x, y) {
    let translateX = x - this.stage.canvas.width / 2
    let translateY = y - this.stage.canvas.height / 2

    this.translateX = -translateX
    this.translateY = -translateY
  }

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

  getCenterLocation() {
    return {
      x: this.stage.canvas.width / 2,
      y: this.stage.canvas.height / 2
    }
  }

  doLayout(fn) {
    fn && fn(this, this.childs)
  }

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

  get background() {
    return this._background
  }

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
