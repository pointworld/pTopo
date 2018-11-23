import InteractiveElement from './InteractiveElement'
import {SceneMode} from "../../shared/constants"

// 位置数组
const posArr = ["Top_Left", "Top_Center", "Top_Right", "Middle_Left", "Middle_Right", "Bottom_Left", "Bottom_Center", "Bottom_Top", "Bottom_Right"]

export default class EditableElement extends InteractiveElement {
  constructor() {
    super()

    this.editAble = false
    this.selectedPoint = null
  }

  // 根据位置描述符获取被控制元素相关位置信息
  getCtrlPosition(posDesc) {
    const dx = 5
    const dy = 5
    const posObj = this.getPosition(posDesc)

    return {
      left: posObj.x - dx,
      top: posObj.y - dy,
      right: posObj.x + dx,
      bottom: posObj.y + dy
    }
  }

  // 元素被选中时的处理函数
  selectedHandler(b) {
    super.selectedHandler.apply(this, arguments)

    this.selectedSize = {
      width: this.width,
      height: this.height
    }

    b.scene.mode === SceneMode.edit
    && (this.editAble = true)
  }

  // 元素未被选中时的处理函数
  unselectedHandler() {
    super.unselectedHandler.apply(this, arguments)

    this.selectedSize = null
    this.editAble = false
  }

  // 绘制处于控制状态下的元素
  paintCtrl(ctx) {
    if (this.editAble) {
      ctx.save()

      for (let i=0; i < posArr.length; i++) {
        const ctrlPosObj = this.getCtrlPosition(posArr[i])

        ctrlPosObj.left -= this.cx
        ctrlPosObj.right -= this.cx
        ctrlPosObj.top -= this.cy
        ctrlPosObj.bottom -= this.cy

        const w = ctrlPosObj.right - ctrlPosObj.left
        const h = ctrlPosObj.bottom - ctrlPosObj.top

        ctx.beginPath()
        ctx.strokeStyle = 'rgba(0,0,0,.8)'
        ctx.rect(ctrlPosObj.left, ctrlPosObj.top, w, h)
        ctx.stroke()
        ctx.closePath()

        ctx.beginPath()
        ctx.strokeStyle = 'rgba(255,255,255,.3)'
        ctx.rect(ctrlPosObj.left + 1, ctrlPosObj.top + 1, w-2,h-2)
        ctx.stroke()
        ctx.closePath()
      }

      ctx.restore()
    }
  }

  // 判断某个点是否在元素内
  isInBound(x, y) {
    this.selectedPoint = null

    if (this.editAble) {
      for (let i = 0; i < posArr.length; i++) {
        const ctrlPosObj = this.getCtrlPosition(posArr[i])

        if (
          x > ctrlPosObj.left
          && x < ctrlPosObj.right
          && y > ctrlPosObj.top
          && y < ctrlPosObj.bottom
        ) {
          this.selectedPoint = posArr[i]

          return true
        }
      }
    }

    return super.isInBound.apply(this, arguments)
  }

  // 鼠标拖拽处理器
  mousedragHandler(e) {
    if (!this.selectedPoint) {
      let x = this.selectedLocation.x + e.dx
      let y = this.selectedLocation.y + e.dy

      this.setLocation(x, y)
      this.dispatchEvent('mousedrag', e)
    }
    else {
      let w = this.selectedSize.width - e.dx
      let w1 = this.selectedSize.width + e.dx
      let h = this.selectedSize.height - e.dy
      let h1 = this.selectedSize.height + e.dy
      let x = this.selectedLocation.x + e.dx
      let y = this.selectedLocation.y + e.dy

      switch (this.selectedPoint) {
        case 'Top_Left':
          if (x < this.x + this.width) {
            this.x = x
            this.width = w
          }
          if (y < this.y + this.height) {
            this.y = y
            this.height = h
          }
          break
        case 'Top_Center':
          if (y < this.y + this.height) {
            this.y = y
            this.height = h
          }
          break
        case 'Top_Right':
          if (y < this.y + this.height) {
            this.y = y
            this.height = this.selectedSize.height - e.dy
          }
          w1 > 1 && (this.width = w1)
          break
        case 'Middle_Left':
          x < this.x + this.width && (this.x = x)
          w > 1 && (this.width = w)
          break
        case 'Middle_Right':
          w1 > 1 && (this.width = w1)
          break
        case 'Bottom_Left':
          if (w > 1) {
            this.x = x
            this.width = w
          }
          h1 > 1 && (this.height = h1)
          break
        case 'Bottom_Center':
          h1 > 1 && (this.height = h1)
          break
        case 'Bottom_Top':
          h1 > 1 && (this.height = h1)
          break
        case 'Bottom_Right':
          w1 > 1 && (this.width = w1)
          h1 > 1 && (this.height = h1)
          break
      }

      this.dispatchEvent("resize", e)
    }
  }
}
