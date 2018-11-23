import Node from './Node'

export default class CircleNode extends Node {
  constructor(text) {
    super(text)

    this.text = text
    this._radius = 20
    this.beginDegree = 0
    this.endDegree = 2 * Math.PI
  }

  // 绘制
  paint(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")"
    ctx.arc(0, 0, this.radius, this.beginDegree, this.endDegree, true)
    ctx.fill()
    ctx.closePath()
    ctx.restore()

    this.paintText(ctx)
    this.paintBorder(ctx)
    this.paintCtrl(ctx)
    this.paintAlarmText(ctx)
  }

  // 绘制被选中状态
  paintSelected(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = "rgba(168, 202, 255, 0.9)"
    ctx.fillStyle = "rgba(168, 202, 236, 0.7)"
    ctx.arc(0, 0, this.radius + 3, this.beginDegree, this.endDegree, true)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }

  // 获取半径
  get radius() {
    return this._radius
  }

  // 设置半径
  set radius(r) {
    this._radius = r

    this.width = 2 * this.radius
    this.height = 2 * this.radius
  }

  // 获取宽度
  get width() {
    return this._width
  }

  // 设置宽度
  set width(w) {
    this._radius = w / 2
    this._width = w
  }

  // 获取高度
  get height() {
    return this._height
  }

  // 设置高度
  set height(h) {
    this._radius = h / 2
    this._height = h
  }
}
