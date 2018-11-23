import InteractiveElement from '../element/InteractiveElement'
import Layout from "../layout/index"
import {zIndex_Container} from "../../shared/constants"

export default class Container extends InteractiveElement {
  constructor(text) {
    super()

    // 元素类型
    this.elementType = "container"
    // 容器的 zIndex 值
    this.zIndex = zIndex_Container
    // 容器的宽度
    this.width = 100
    // 容器的高度
    this.height = 100
    // 容器的子元素
    this.childs = []
    // 容器的子元素是否可以拖动
    this.childDragble = true
    // 容器节点的透明度
    this.alpha = .5
    // 容器本身是否可拖动
    this.dragable = true
    // 容器本身是否可见
    this.visible = true
    // 填充颜色
    this.fillColor = "10,100,80"
    // 容器边框宽度
    this.borderWidth = 0
    // 容器边框颜色
    this.borderColor = "255,255,255"
    // 容器边框四个角的半径
    this.borderRadius = null
    // 字体
    this.font = "12px Consolas"
    // 字体颜色
    this.fontColor = "255,255,255"
    // 容器名
    this.text = text
    // 容器名的位置
    this.textPosition = "Bottom_Center"
    // 容器名的横向偏移量
    this.textOffsetX = 0
    // 容器名的纵向偏移量
    this.textOffsetY = 0
    // 容器的布局
    this.layout = new Layout.AutoBoundLayout
  }

  // 添加子元素到容器
  add(ele) {
    this.childs.push(ele)

    ele.dragable = this.childDragble
  }

  // 从容器中移除某个元素
  remove(ele) {
    for (let i = 0, len = this.childs.length; i < len; i++) {
      if (this.childs[i] === ele) {
        ele.parentContainer = null

        this.childs = this.childs.del(i)

        ele.lastParentContainer = this

        break
      }
    }
  }

  // 从容器中移除所有元素
  removeAll() {
    this.childs = []
  }

  // 设置容器的位置
  setLocation(x, y) {
    const dx = x - this.x
    const dy = y - this.y

    this.x = x
    this.y = y

    for (let i = 0; i < this.childs.length; i++) {
      const ele = this.childs[i]

      ele.setLocation(ele.x + dx, ele.y + dy)
    }
  }

  // 布局容器
  doLayout(cb) {
    cb && cb(this, this.childs)
  }

  // 绘制
  paint(ctx) {
    if (this.visible) {
      this.layout && this.layout(this, this.childs)

      ctx.beginPath()
      ctx.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")"

      !this.borderRadius
        ? ctx.rect(this.x, this.y, this.width, this.height)
        : ctx.PTopoRoundRect(this.x, this.y, this.width, this.height, this.borderRadius)

      ctx.fill()
      ctx.closePath()
      this.paintBorder(ctx)
      this.paintText(ctx)
    }
  }

  // 绘制容器边框
  paintBorder(ctx) {
    if (this.borderWidth) {
      ctx.beginPath()
      ctx.lineWidth = this.borderWidth
      ctx.strokeStyle = "rgba(" + this.borderColor + "," + this.alpha + ")"

      const b = this.borderWidth / 2

      !this.borderRadius
        ? ctx.rect(this.x - b, this.y - b, this.width + this.borderWidth, this.height + this.borderWidth)
        : ctx.PTopoRoundRect(this.x - b, this.y - b, this.width + this.borderWidth, this.height + this.borderWidth, this.borderRadius)

      ctx.stroke()
      ctx.closePath()
    }
  }

  // 绘制容器名
  paintText(ctx) {
    const text = this.text

    if (text) {
      ctx.beginPath()
      ctx.font = this.font
      ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"

      const textW = ctx.measureText(text).width
      const cnW = ctx.measureText("田").width
      const textPos = this.getTextPostion(this.textPosition, textW, cnW)

      ctx.fillText(text, textPos.x, textPos.y)
      ctx.closePath()
    }
  }

  // 获取容器名位置
  getTextPostion(posDesc, e, h) {
    let textPos = null

    switch (posDesc) {
      case 'Top_Left':
        textPos = {
          x: this.x,
          y: this.y - h / 2
        }
        break
      case 'Top_Center':
        textPos = {
          x: this.x + this.width / 2 - e / 2,
          y: this.y - h / 2
        }
        break
      case 'Top_Right':
        textPos = {
          x: this.x + this.width - e,
          y: this.y - h / 2
        }
        break
      case 'Bottom_Left':
        textPos = {
          x: this.x,
          y: this.y + this.height + h
        }
        break
      case 'Bottom_Center':
        textPos = {
          x: this.x + this.width / 2 - e / 2,
          y: this.y + this.height + h
        }
        break
      case 'Bottom_Right':
        textPos = {
          x: this.x + this.width - e,
          y: this.y + this.height + h
        }
        break
      case 'Middle_Left':
        textPos = {
          x: this.x,
          y: this.y + this.height / 2 + h / 2
        }
        break
      case 'Middle_Center':
        textPos = {
          x: this.x + this.width / 2 - e / 2,
          y: this.y + this.height / 2 + h / 2
        }
        break
      case 'Middle_Right':
        textPos = {
          x: this.x + this.width - e,
          y: this.y + this.height / 2 + h / 2
        }
        break
    }

    this.textOffsetX && (textPos.x += this.textOffsetX)
    this.textOffsetY && (textPos.y += this.textOffsetY)

    return textPos
  }

  // 绘制鼠标移入容器时，容器的呈现
  paintMouseover() {

  }

  // 绘制容器被选中时的状态
  paintSelected(self) {
    self.shadowBlur = 10
    self.shadowColor = "rgba(0,0,0,1)"
    self.shadowOffsetX = 0
    self.shadowOffsetY = 0
  }
}
