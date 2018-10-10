import InteractiveElement from '../element/InteractiveElement'
import Layout from "../layout/index"
import {zIndex_Container} from "../../shared/constants"

export default class Container extends InteractiveElement {
  constructor(text) {
    super()

    this.elementType = "container"
    this.zIndex = zIndex_Container
    this.width = 100
    this.height = 100
    this.childs = []
    this.childDragble = true
    this.alpha = .5
    this.dragable = true
    this.visible = true
    this.fillColor = "10,100,80"
    this.borderWidth = 0
    this.borderColor = "255,255,255"
    this.borderRadius = null
    this.font = "12px Consolas"
    this.fontColor = "255,255,255"
    this.text = text
    this.textPosition = "Bottom_Center"
    this.textOffsetX = 0
    this.textOffsetY = 0
    this.layout = new Layout.AutoBoundLayout
  }

  add(ele) {
    this.childs.push(ele)

    ele.dragable = this.childDragble
  }

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

  removeAll() {
    this.childs = []
  }

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

  doLayout(cb) {
    cb && cb(this, this.childs)
  }

  paint(ctx) {
    if (this.visible) {
      this.layout && this.layout(this, this.childs)

      ctx.beginPath()
      ctx.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")"

      !this.borderRadius
        ? ctx.rect(this.x, this.y, this.width, this.height)
        : ctx.PwRoundRect(this.x, this.y, this.width, this.height, this.borderRadius)

      ctx.fill()
      ctx.closePath()
      this.paintBorder(ctx)
      this.paintText(ctx)
    }
  }

  paintBorder(ctx) {
    if (this.borderWidth) {
      ctx.beginPath()
      ctx.lineWidth = this.borderWidth
      ctx.strokeStyle = "rgba(" + this.borderColor + "," + this.alpha + ")"

      const b = this.borderWidth / 2

      !this.borderRadius
        ? ctx.rect(this.x - b, this.y - b, this.width + this.borderWidth, this.height + this.borderWidth)
        : ctx.PwRoundRect(this.x - b, this.y - b, this.width + this.borderWidth, this.height + this.borderWidth, this.borderRadius)

      ctx.stroke()
      ctx.closePath()
    }
  }

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

  paintMouseover() {

  }

  paintSelected(self) {
    self.shadowBlur = 10
    self.shadowColor = "rgba(0,0,0,1)"
    self.shadowOffsetX = 0
    self.shadowOffsetY = 0
  }
}
