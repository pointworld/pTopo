import Link from './Link'
import {getSharedLinksLen} from './util'

export default class FoldLink extends Link {
  constructor(nodeA, nodeZ, text) {
    super(nodeA, nodeZ, text)

    // 折线的方向：horizontal: 水平，vertical: 垂直
    this.direction = "horizontal"
  }

  // 获取折线开始位置
  getStartPosition() {
    const startPos = {
      x: this.nodeA.cx,
      y: this.nodeA.cy
    }

    if ("horizontal" === this.direction) {
      this.nodeZ.cx > startPos.x
        ? startPos.x += this.nodeA.width / 2
        : startPos.x -= this.nodeA.width / 2
    }
    else {
      this.nodeZ.cy > startPos.y
        ? startPos.y += this.nodeA.height / 2
        : startPos.y -= this.nodeA.height / 2
    }

    return startPos
  }

  // 获取折线结束位置
  getEndPosition() {
    const endPos = {
      x: this.nodeZ.cx,
      y: this.nodeZ.cy
    }

    if ("horizontal" === this.direction) {
      this.nodeA.cy < endPos.y
        ? endPos.y -= this.nodeZ.height / 2
        : endPos.y += this.nodeZ.height / 2
    }
    else {
      endPos.x = this.nodeA.cx < endPos.x
        ? this.nodeZ.x
        : this.nodeZ.x + this.nodeZ.width
    }

    return endPos
  }

  // 获取折线路径
  getPath(a) {
    const pathObj = []
    const startPos = this.getStartPosition()
    const endPos = this.getEndPosition()

    if (this.nodeA === this.nodeZ) return [startPos, endPos]

    let f
    let g
    const length = getSharedLinksLen(this.nodeA, this.nodeZ)
    const i = (length - 1) * this.bundleGap
    const j = this.bundleGap * a - i / 2

    if ("horizontal" === this.direction) {
      f = endPos.x + j
      g = startPos.y - j
      pathObj.push({x: startPos.x, y: g})
      pathObj.push({x: f, y: g})
      pathObj.push({x: f, y: endPos.y})
    }
    else {
      f = startPos.x + j
      g = endPos.y - j
      pathObj.push({x: f, y: startPos.y})
      pathObj.push({x: f, y: g})
      pathObj.push({x: endPos.x, y: g})
    }

    return pathObj
  }

  // 绘制折线名称
  paintText(ctx, b) {
    if (
      this.text
      && this.text.length
    ) {
      const c = b[1]
      const d = c.x + this.textOffsetX
      const e = c.y + this.textOffsetY

      ctx.save()
      ctx.beginPath()
      ctx.font = this.font

      const textW = ctx.measureText(this.text).width
      const cnW = ctx.measureText("田").width

      ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
      ctx.fillText(this.text, d - textW / 2, e - cnW / 2)
      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }
  }
}
