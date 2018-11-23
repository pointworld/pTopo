import InteractiveElement from '../element/InteractiveElement'
import {getDistance, isPointInLine} from "../../shared/util"
import {getIntersectionPointObj, unsharedLinks, getSharedLinksLen} from './util'
import {zIndex_Link} from "../../shared/constants"

export default class Link extends InteractiveElement {
  constructor(nodeA, nodeZ, text) {
    super(nodeA, nodeZ, text)

    // 元素类型
    this.elementType = "link"
    // 元素 z-index 值
    this.zIndex = zIndex_Link

    if (arguments.length) {
      // 元素名
      this.text = text
      // 连线起始节点
      this.nodeA = nodeA
      this.nodeA && !this.nodeA.inLinks && (this.nodeA.inLinks = [])
      this.nodeA && !this.nodeA.outLinks && (this.nodeA.outLinks = [])
      this.nodeA && this.nodeA.outLinks.push(this)
      // 连线终止节点
      this.nodeZ = nodeZ
      this.nodeZ && !this.nodeZ.inLinks && (this.nodeZ.inLinks = [])
      this.nodeZ && !this.nodeZ.outLinks && (this.nodeZ.outLinks = [])
      this.nodeZ && this.nodeZ.inLinks.push(this)
      // 计算节点索引
      this.caculateIndex()
      // 字体
      this.font = "12px Consolas"
      // 字体颜色
      this.fontColor = "255,255,255"
      // 线宽
      this.lineWidth = 2
      // 连结合处样式
      this.lineJoin = "miter"
      // 是否可变换
      this.transformAble = false
      // 线簇偏移量
      this.bundleOffset = 20
      // 线与线之间的间距
      this.bundleGap = 12
      // 文本横向偏移量
      this.textOffsetX = 0
      // 文本纵向偏移量
      this.textOffsetY = 0
      // 箭头半径
      this.arrowsRadius = null
      // 箭头偏移量
      this.arrowsOffset = 0
      // 虚线模式
      this.dashedPattern = null
      // 线的路径
      this.path = []

      const keysArr = "text,font,fontColor,lineWidth,lineJoin".split(",")
      this.serializedProperties = this.serializedProperties.concat(keysArr)
    }
  }

  // 计算节点索引
  caculateIndex() {
    const len = getSharedLinksLen(this.nodeA, this.nodeZ)
    len && (this.nodeIndex = len - 1)
  }

  // 节点移除处理器
  removeHandler() {
    const self = this

    if (self.nodeA && self.nodeA.outLinks) {
      self.nodeA.outLinks = self.nodeA.outLinks.filter(function (outLink) {
        return outLink !== self
      })
    }

    if (self.nodeZ && self.nodeZ.inLinks) {
      self.nodeZ.inLinks = self.nodeZ.inLinks.filter(function (inLink) {
        return inLink !== self
      })
    }

    let unsharedLinksArr = unsharedLinks(self)

    unsharedLinksArr.forEach(function (unsharedLink, index) {
      unsharedLink.nodeIndex = index
    })
  }

  // 获取连线的起始位置
  getStartPosition() {
    return {x: this.nodeA.cx, y: this.nodeA.cy}
  }

  // 获取连线的终止位置
  getEndPosition() {
    let point

    this.arrowsRadius && (point = getIntersectionPointObj(this.nodeZ, this.nodeA))

    !point && (point = {
      x: this.nodeZ.cx,
      y: this.nodeZ.cy
    })

    return point
  }

  // 获取连线的路径
  getPath() {
    const pathArr = []
    const startPos = this.getStartPosition()
    const endPos = this.getEndPosition()
    const len = getSharedLinksLen(this.nodeA, this.nodeZ)

    if (this.nodeA === this.nodeZ) return [startPos, endPos]

    if (1 === len) return [startPos, endPos]

    let f = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x)
      , g = {x: startPos.x + this.bundleOffset * Math.cos(f), y: startPos.y + this.bundleOffset * Math.sin(f)}
      , h = {
      x: endPos.x + this.bundleOffset * Math.cos(f - Math.PI),
      y: endPos.y + this.bundleOffset * Math.sin(f - Math.PI)
    }
      , i = f - Math.PI / 2
      , j = f - Math.PI / 2
      , k = len * this.bundleGap / 2 - this.bundleGap / 2
      , l = this.bundleGap * this.nodeIndex
      , m = {x: g.x + l * Math.cos(i), y: g.y + l * Math.sin(i)}
      , n = {x: h.x + l * Math.cos(j), y: h.y + l * Math.sin(j)}

    m = {
      x: m.x + k * Math.cos(i - Math.PI),
      y: m.y + k * Math.sin(i - Math.PI)
    }

    n = {
      x: n.x + k * Math.cos(j - Math.PI),
      y: n.y + k * Math.sin(j - Math.PI)
    }

    pathArr.push({x: startPos.x, y: startPos.y})
    pathArr.push({x: m.x, y: m.y})
    pathArr.push({x: n.x, y: n.y})
    pathArr.push({x: endPos.x, y: endPos.y})

    return pathArr
  }

  // 绘制连线路径
  paintPath(ctx, pathArr) {
    if (this.nodeA === this.nodeZ) return void this.paintLoop(ctx)

    ctx.beginPath()
    ctx.moveTo(pathArr[0].x, pathArr[0].y)

    for (let i = 1, len = pathArr.length; i < len; i++) {
      this.dashedPattern
        ? ctx.PTopoDashedLineTo(
        pathArr[i - 1].x,
        pathArr[i - 1].y,
        pathArr[i].x,
        pathArr[i].y,
        this.dashedPattern
        )
        : ctx.lineTo(pathArr[i].x, pathArr[i].y)
    }

    ctx.stroke()
    ctx.closePath()

    if (this.arrowsRadius) {
      const d = pathArr[pathArr.length - 2]
      const e = pathArr[pathArr.length - 1]

      this.paintArrow(ctx, d, e)
    }
  }

  // 绘制环行线
  paintLoop(ctx) {
    ctx.beginPath()

    let b = this.bundleGap * (this.nodeIndex + 1) / 2

    ctx.arc(this.nodeA.x, this.nodeA.y, b, Math.PI / 2, 2 * Math.PI)
    ctx.stroke()
    ctx.closePath()
  }

  // 绘制箭头
  paintArrow(ctx, p1, p2) {
    const e = this.arrowsOffset
    const f = this.arrowsRadius / 2
    let i = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    const j = getDistance(p1, p2) - this.arrowsRadius
    const k = p1.x + (j + e) * Math.cos(i)
    const l = p1.y + (j + e) * Math.sin(i)
    const x = p2.x + e * Math.cos(i)
    const y = p2.y + e * Math.sin(i)
    i -= Math.PI / 2
    const o = {
      x: k + f * Math.cos(i),
      y: l + f * Math.sin(i)
    }
    const p = {
      x: k + f * Math.cos(i - Math.PI),
      y: l + f * Math.sin(i - Math.PI)
    }

    ctx.beginPath()
    ctx.fillStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")"
    ctx.moveTo(o.x, o.y)
    ctx.lineTo(x, y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.closePath()
  }

  // 绘制入口
  paint(ctx) {
    if (this.nodeA && this.nodeZ) {
      const path = this.getPath(this.nodeIndex)

      this.path = path
      ctx.strokeStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")"
      ctx.lineWidth = this.lineWidth
      this.paintPath(ctx, path)
      path && path.length > 0 && this.paintText(ctx, path)
    }
  }

  // 绘制文本
  paintText(ctx, path) {
    let c = path[0]
    let d = path[path.length - 1]

    if (4 === path.length) {
      c = path[1]
      d = path[2]
    }

    if (
      this.text
      && this.text.length
    ) {
      let e = (d.x + c.x) / 2 + this.textOffsetX,
        f = (d.y + c.y) / 2 + this.textOffsetY

      ctx.save()
      ctx.beginPath()
      ctx.font = this.font

      let g = ctx.measureText(this.text).width
      let h = ctx.measureText("田").width

      ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"

      if (this.nodeA === this.nodeZ) {
        let i = -(Math.PI / 2 + Math.PI / 4)
        let j = this.bundleGap * (this.nodeIndex + 1) / 2,
          e = this.nodeA.x + j * Math.cos(i),
          f = this.nodeA.y + j * Math.sin(i)

        ctx.fillText(this.text, e, f)
      }
      else {
        ctx.fillText(this.text, e - g / 2, f - h / 2)
      }

      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }
  }

  // 绘制线条被选中时的状态
  paintSelected(ctx) {
    ctx.shadowBlur = 10
    ctx.shadowColor = "rgba(0,0,0,1)"
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // 判断点是否在连线上
  isInBound(x, y) {
    if (this.nodeA === this.nodeZ) {
      const d = this.bundleGap * (this.nodeIndex + 1) / 2
      const lineLength = getDistance(this.nodeA, {
        x: x,
        y: y
      }) - d

      return Math.abs(lineLength) <= 3
    }

    let sign = false

    for (let i = 1; i < this.path.length; i++) {
      const p1 = this.path[i - 1]
      const p2 = this.path[i]

      if (isPointInLine({x: x, y: y}, p1, p2)) {
        sign = true
        break
      }
    }

    return sign
  }
}
