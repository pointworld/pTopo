import Node from './Node'

export default class TextNode extends Node {
  constructor(text) {
    super()

    this.text = text
    this.elementType = "TextNode"
  }

  paint(ctx) {
    ctx.beginPath()
    ctx.font = this.font

    this.width = ctx.measureText(this.text).width
    this.height = ctx.measureText("田").width

    ctx.strokeStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
    ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
    ctx.fillText(this.text, -this.width / 2, this.height / 2)
    ctx.closePath()

    this.paintBorder(ctx)
    this.paintCtrl(ctx)
  }
}
