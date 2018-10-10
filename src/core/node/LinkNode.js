import TextNode from './TextNode'

export default class LinkNode extends TextNode {
  constructor(text, href, target) {
    super()

    this.text = text
    this.href = href
    this.target = target
    this.elementType = "LinkNode"
    this.isVisited = false
    this.visitedColor = null

    this.mousemove(function () {
      const oCanvasArr = document.getElementsByTagName("canvas")

      if (oCanvasArr && oCanvasArr.length) {
        for (let i = 0; i < oCanvasArr.length; i++) {
          oCanvasArr[i].style.cursor = "pointer"
        }
      }
    })

    this.mouseout(function () {
      const oCanvasArr = document.getElementsByTagName("canvas")

      if (oCanvasArr && oCanvasArr.length) {
        for (let i = 0; i < oCanvasArr.length; i++) {
          oCanvasArr[i].style.cursor = "default"
        }
      }
    })

    this.click(function () {
      if (!this.isStopLinkNodeClick) {
        "_blank" === this.target
          ? window.open(this.href)
          : location = this.href

        this.isVisited = true
      }
    })
  }

  paint(ctx) {
    ctx.beginPath()
    ctx.font = this.font

    this.width = ctx.measureText(this.text).width
    this.height = ctx.measureText("田").width

    if (
      this.isVisited
      && this.visitedColor
    ) {
      ctx.strokeStyle = "rgba(" + this.visitedColor + ", " + this.alpha + ")"
      ctx.fillStyle = "rgba(" + this.visitedColor + ", " + this.alpha + ")"
    }
    else {
      ctx.strokeStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
      ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
    }

    ctx.fillText(
      this.text,
      - this.width / 2,
      this.height / 2
    )

    if (this.isMouseOver) {
      ctx.moveTo(-this.width / 2, this.height)
      ctx.lineTo(this.width / 2, this.height)
      ctx.stroke()
    }

    ctx.closePath()

    this.paintBorder(ctx)
    this.paintCtrl(ctx)
  }
}
