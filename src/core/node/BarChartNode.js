import Node from '../node/Node'

export default class BarChartNode extends Node {
  constructor() {
    super()

    this.showSelected = false
    this.width = 250
    this.height = 180
    this.colors = ["#3666B0", "#2CA8E0", "#77D1F6"]
    this.datas = [.3, .3, .4]
    this.titles = ["A", "B", "C"]
  }

  // 绘制入口
  paint(ctx) {
    const c = 3
    const w = (this.width - c) / this.datas.length

    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = "#FFFFFF"
    ctx.strokeStyle = "#FFFFFF"
    ctx.moveTo(-this.width / 2 - 1, -this.height / 2)
    ctx.lineTo(-this.width / 2 - 1, this.height / 2 + 3)
    ctx.lineTo(this.width / 2 + c + 1, this.height / 2 + 3)
    ctx.stroke()
    ctx.closePath()
    ctx.restore()

    for (let i = 0; i < this.datas.length; i++) {
      ctx.save()
      ctx.beginPath()
      ctx.fillStyle = this.colors[i]

      const h = this.datas[i]
      const x = i * (w + c) - this.width / 2
      const y = this.height - h - this.height / 2

      ctx.fillRect(x, y, w, h)

      const text = "" + parseInt(this.datas[i])
      const numTextWidth = ctx.measureText(text).width
      const cnTextWidth = ctx.measureText("田").width

      ctx.fillStyle = "#FFFFFF"
      ctx.fillText(text, x + (w - numTextWidth) / 2, y - cnTextWidth)
      ctx.fillText(this.titles[i], x + (w - numTextWidth) / 2, this.height / 2 + cnTextWidth)
      ctx.fill()
      ctx.closePath()
      ctx.restore()
    }
  }
}