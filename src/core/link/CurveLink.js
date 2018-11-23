import Link from './Link'

export default class CurveLink extends Link {
  constructor(nodeA, nodeZ, text) {
    super(nodeA, nodeZ, text)
  }

  // 绘制曲线路径
  paintPath(ctx, pathArr) {
    if (this.nodeA === this.nodeZ) return void this.paintLoop(ctx)

    ctx.beginPath()
    ctx.moveTo(pathArr[0].x, pathArr[0].y)

    for (let i = 1; i < pathArr.length; i++) {
      const p1 = pathArr[i - 1]
      const p2 = pathArr[i]
      const cpx = (p1.x + p2.x) / 2
      let cpy = (p1.y + p2.y) / 2

      cpy += (p2.y - p1.y) / 2

      ctx.strokeStyle = "rgba(" + this.strokeColor + "," + this.alpha + ")"
      ctx.lineWidth = this.lineWidth
      ctx.moveTo(p1.x, p1.cy)
      ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y)
      ctx.stroke()
    }

    ctx.stroke()
    ctx.closePath()

    if (this.arrowsRadius) {
      const p1 = pathArr[pathArr.length - 2]
      const p2 = pathArr[pathArr.length - 1]

      this.paintArrow(ctx, p1, p2)
    }
  }

}