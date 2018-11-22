import InteractiveElement from '../element/InteractiveElement'
import {getDistance, isPointInLine} from "../../shared/util"
import {getIntersectionPointObj, unsharedLinks, getSharedLinksLen} from './util'
import {zIndex_Link} from "../../shared/constants"

export default class Link extends InteractiveElement {
  constructor(nodeA, nodeZ, text, opts) {

    !opts && (opts = {})

    super(nodeA, nodeZ, text, opts)

    this.elementType = "link"
    this.zIndex = zIndex_Link
    this.text = text
    this.nodeA = nodeA
    this.nodeA && !this.nodeA.inLinks && (this.nodeA.inLinks = [])
    this.nodeA && !this.nodeA.outLinks && (this.nodeA.outLinks = [])
    this.nodeA && this.nodeA.outLinks.push(this)
    this.nodeZ = nodeZ
    this.nodeZ && !this.nodeZ.inLinks && (this.nodeZ.inLinks = [])
    this.nodeZ && !this.nodeZ.outLinks && (this.nodeZ.outLinks = [])
    this.nodeZ && this.nodeZ.inLinks.push(this)
    this.caculateIndex()
    this.font = opts.font || "12px Consolas"
    this.fontColor = opts.fontColor || "255,255,255"
    this.lineWidth = opts.lineWidth || 2
    this.lineJoin = opts.lineJoin || "miter"
    this.transformAble = false
    this.bundleOffset = opts.bundleOffset || 20
    this.bundleGap = opts.bundleGap || 12
    this.textOffsetX = opts.textOffsetX || 0
    this.textOffsetY = opts.textOffsetY || 0
    this.arrowsRadius = opts.arrowsRadius || null
    this.arrowsOffset = opts.arrowsOffset || 0
    this.dashedPattern = opts.dashedPattern || null
    this.path = opts.path || []

    const keysArr = "text,font,fontColor,lineWidth,lineJoin".split(",")
    this.serializedProperties = this.serializedProperties.concat(keysArr)

  }

  caculateIndex() {
    const len = getSharedLinksLen(this.nodeA, this.nodeZ)
    len && (this.nodeIndex = len - 1)
  }

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

  getStartPosition() {
    return {x: this.nodeA.cx, y: this.nodeA.cy}
  }

  getEndPosition() {
    let point

    this.arrowsRadius && (point = getIntersectionPointObj(this.nodeZ, this.nodeA))

    !point && (point = {
      x: this.nodeZ.cx,
      y: this.nodeZ.cy
    })

    return point
  }

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

  paintLoop(ctx) {
    ctx.beginPath()

    let b = this.bundleGap * (this.nodeIndex + 1) / 2

    ctx.arc(this.nodeA.x, this.nodeA.y, b, Math.PI / 2, 2 * Math.PI)
    ctx.stroke()
    ctx.closePath()
  }

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

  paintSelected(ctx) {
    ctx.shadowBlur = 10
    ctx.shadowColor = "rgba(0,0,0,1)"
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

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
