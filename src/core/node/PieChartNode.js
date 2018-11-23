import CircleNode from '../node/CircleNode'

export default class PieChartNode extends CircleNode {
  constructor() {
    super()

    // 半径
    this.radius = 150
    // 各部分颜色值
    this.colors = ["#3666B0", "#2CA8E0", "#77D1F6"]
    // 各部分所占比例
    this.datas = [.3, .3, .4]
    // 各部分对应的名字
    this.titles = ["A", "B", "C"]
  }

  paint(ctx) {
    this.width = 2 * this.radius
    this.height = 2 * this.radius

    let startAngle = 0

    for (let i = 0; i < this.datas.length; i++) {
      const g = this.datas[i] * Math.PI * 2

      ctx.save()
      ctx.beginPath()
      ctx.fillStyle = this.colors[i]
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, this.radius, startAngle, startAngle + g, false)
      ctx.fill()
      ctx.closePath()
      ctx.restore()
      ctx.beginPath()
      ctx.font = this.font

      const text = this.titles[i] + ": " + (100 * this.datas[i]).toFixed(2) + "%"
      const numTextWidth = ctx.measureText(text).width
      const j = (startAngle + startAngle + g) / 2

      let k = this.radius * Math.cos(j)
      const l = this.radius * Math.sin(j)

      j > Math.PI / 2 && j <= Math.PI
        ? k -= numTextWidth
        : j > Math.PI && j < 2 * Math.PI * 3 / 4
        ? k -= numTextWidth
        : j > 2 * Math.PI * .75

      ctx.fillStyle = "#FFFFFF"
      ctx.fillText(text, k, l)
      ctx.moveTo(this.radius * Math.cos(j), this.radius * Math.sin(j))

      j > Math.PI / 2 && j < 2 * Math.PI * 3 / 4 && (k -= numTextWidth)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
      startAngle += g
    }
  }
}