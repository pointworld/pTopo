import TextNode from './TextNode'

export default class LinkNode extends TextNode {
  constructor(text, href, target) {
    super()

    // 链接文本
    this.text = text
    // 链接地址
    this.href = href
    // 链接目标
    this.target = target
    // 元素类型
    this.elementType = "LinkNode"
    // 是否被访问过
    this.isVisited = false
    // 被访问后的颜色
    this.visitedColor = null

    // 鼠标在该节点在移动时的展现
    this.mousemove(function () {
      const oCanvasArr = document.getElementsByTagName("canvas")

      if (oCanvasArr && oCanvasArr.length) {
        for (let i = 0; i < oCanvasArr.length; i++) {
          oCanvasArr[i].style.cursor = "pointer"
        }
      }
    })

    // 鼠标移除时的展现
    this.mouseout(function () {
      const oCanvasArr = document.getElementsByTagName("canvas")

      if (oCanvasArr && oCanvasArr.length) {
        for (let i = 0; i < oCanvasArr.length; i++) {
          oCanvasArr[i].style.cursor = "default"
        }
      }
    })

    // 注册点击事件
    this.click(function () {
      if (!this.isStopLinkNodeClick) {
        "_blank" === this.target
          ? window.open(this.href)
          : location = this.href

        this.isVisited = true
      }
    })
  }

  // 绘制入口
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
