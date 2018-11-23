import EditableElement from '../element/EditableElement'
import {getImageAlarm} from './util'
import {zIndex_Node} from "../../shared/constants"

const imageCache = {}

export default class _Node extends EditableElement {
  constructor(text) {
    super(text)

    // 元素类型
    this.elementType = 'node'
    // 节点 zIndex 值
    this.zIndex = zIndex_Node
    // 节点名
    this.text = text
    // 节点名位置描述
    this.textPosition = 'Bottom_Center'
    // 节点名横轴方向的偏移量
    this.textOffsetX = 0
    // 节点名纵轴方向的偏移量
    this.textOffsetY = 0
    // 字体
    this.font = '12px Consolas'
    // 字体颜色
    this.fontColor = '255,255,255'
    // 节点边框宽度
    this.borderWidth = 0
    // 节点边框颜色
    this.borderColor = '255,255,255'
    // 节点边框半径
    this.borderRadius = null
    // 节点是否可拖拽
    this.dragable = true
    // 节点是否可变换
    this.transformAble = true
    // 节点的入线组成的数组
    this.inLinks = null
    // 节点的出线组成的数组
    this.outLinks = null

    const keyArr = "text,font,fontColor,textPosition,textOffsetX,textOffsetY,borderRadius".split(",")
    this.serializedProperties = this.serializedProperties.concat(keyArr)
  }

  // 绘制入口
  paint(ctx) {
    if (this.image) {
      const globalAlpha = ctx.globalAlpha
      ctx.globalAlpha = this.alpha

      if (
        this.image.alarm
        && this.alarm
      ) {
        ctx.drawImage(
          this.image.alarm,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        )
      }
      else {
        ctx.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        )
      }

      ctx.globalAlpha = globalAlpha
    }
    else {
      ctx.beginPath()

      ctx.fillStyle = "rgba(" + this.fillColor + "," + this.alpha + ")"

      !this.borderRadius
        ? ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)
        : ctx.PTopoRoundRect(-this.width / 2, -this.height / 2, this.width, this.height, this.borderRadius)

      ctx.fill()
      ctx.closePath()
    }


    this.paintText(ctx)
    this.paintBorder(ctx)
    this.paintCtrl(ctx)
    this.paintAlarmText(ctx)
  }

  // 绘制节点名
  paintText(ctx) {
    const text = this.text

    if (text) {
      ctx.beginPath()
      ctx.font = this.font

      const textW = ctx.measureText(text).width
      const defaultTextW = ctx.measureText("田").width

      ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"

      const textPosObj = this.getTextPostion(this.textPosition, textW, defaultTextW)

      ctx.fillText(text, textPosObj.x, textPosObj.y)
      ctx.closePath()
    }
  }

  // 绘制边框
  paintBorder(ctx) {
    if (this.borderWidth) {
      ctx.beginPath()
      ctx.lineWidth = this.borderWidth
      ctx.strokeStyle = "rgba(" + this.borderColor + "," + this.alpha + ")"

      const halfBW = this.borderWidth / 2

      if (!this.borderRadius) {
        ctx.rect(
          -this.width / 2 - halfBW,
          -this.height / 2 - halfBW,
          this.width + this.borderWidth,
          this.height + this.borderWidth
        )
      }
      else {
        ctx.PTopoRoundRect(
          -this.width / 2 - halfBW,
          -this.height / 2 - halfBW,
          this.width + this.borderWidth,
          this.height + this.borderWidth,
          this.borderRadius
        )
      }

      ctx.stroke()
      ctx.closePath()
    }
  }

  // 绘制告警文本
  paintAlarmText(ctx) {
    if (
      this.alarm
    ) {
      const alarmColor = this.alarmColor || '255,0,0'
      const alarmAlpha = this.alarmAlpha || .5
      const alarmTextW = ctx.measureText(this.alarm).width + 6
      const defaultTextW = ctx.measureText("田").width + 6
      const x = this.width / 2 - alarmTextW / 2
      const y = -this.height / 2 - defaultTextW - 8

      ctx.beginPath()
      ctx.font = this.alarmFont || "10px 'Microsoft Yahei'"
      ctx.strokeStyle = "rgba(" + alarmColor + ", " + alarmAlpha + ")"
      ctx.fillStyle = "rgba(" + alarmColor + ", " + alarmAlpha + ")"
      ctx.lineCap = "round"
      ctx.lineWidth = 1
      ctx.moveTo(x, y)
      ctx.lineTo(x + alarmTextW, y)
      ctx.lineTo(x + alarmTextW, y + defaultTextW)
      ctx.lineTo(x + alarmTextW / 2 + 6, y + defaultTextW)
      ctx.lineTo(x + alarmTextW / 2, y + defaultTextW + 8)
      ctx.lineTo(x + alarmTextW / 2 - 6, y + defaultTextW)
      ctx.lineTo(x, y + defaultTextW)
      ctx.lineTo(x, y)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()

      ctx.beginPath()
      ctx.strokeStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
      ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
      ctx.fillText(this.alarm, x + 2, y + defaultTextW - 4)
      ctx.closePath()
    }
  }

  // 绘制节点名位置
  getTextPostion(posDesc, w, h) {
    let textPosObj = null

    if (posDesc) {
      switch (posDesc) {
        case 'Top_Left':
          textPosObj = {
            x: -this.width / 2 - w,
            y: -this.height / 2 - h / 2
          }
          break
        case 'Top_Center':
          textPosObj = {
            x: -this.width / 2 + (this.width - w) / 2,
            y: -this.height / 2 - h / 2
          }
          break
        case 'Top_Right':
          textPosObj = {
            x: this.width / 2,
            y: -this.height / 2 - h / 2
          }
          break
        case 'Middle_Left':
          textPosObj = {
            x: -this.width / 2 - w,
            y: h / 2
          }
          break
        case 'Middle_Center':
          textPosObj = {
            x: -this.width / 2 + (this.width - w) / 2,
            y: h / 2
          }
          break
        case 'Middle_Right':
          textPosObj = {
            x: this.width / 2,
            y: h / 2
          }
          break
        case 'Bottom_Left':
          textPosObj = {
            x: -this.width / 2 - w,
            y: this.height / 2 + h
          }
          break
        case 'Bottom_Center':
          textPosObj = {
            x: -this.width / 2 + (this.width - w) / 2,
            y: this.height / 2 + h
          }
          break
        case 'Bottom_Right':
          textPosObj = {
            x: this.width / 2,
            y: this.height / 2 + h
          }
          break
      }
    }

    this.textOffsetX && (textPosObj.x += this.textOffsetX)
    this.textOffsetY && (textPosObj.y += this.textOffsetY)

    return textPosObj
  }

  // 设置节点图片
  setImage(img, c) {
    if (!img) {
      throw new Error("Node.setImage(): 参数Image对象为空!")
    }

    let self = this

    if ("string" === typeof img) {
      let image = imageCache[img]

      if (!image) {
        image = new Image

        image.src = img

        image.onload = function () {
          imageCache[img] = image

          1 == c && self.setSize(image.width, image.height)

          const alarm = getImageAlarm(image)

          alarm && (image.alarm = alarm)
          self.image = image
        }
      }
      else {
        c && this.setSize(image.width, image.height)
        this.image = image
      }

    }
    else {
      this.image = img
      1 == c && this.setSize(img.width, img.height)
    }
  }

  // 节点移除处理器
  removeHandler(node) {
    const self = this

    if (this.outLinks) {
      this.outLinks.forEach(function (outLink) {
        outLink.nodeA === self && node.remove(outLink)
      })

      this.outLinks = null
    }

    if (this.inLinks) {
      this.inLinks.forEach(function (inLink) {
        inLink.nodeZ === self && node.remove(inLink)
      })

      this.inLinks = null
    }
  }
}
