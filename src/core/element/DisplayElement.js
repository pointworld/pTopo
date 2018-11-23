import Element from './Element'

export default class DisplayElement extends Element {
  constructor() {
    super()

    this.elementType = 'displayElement'
    this.x = 0
    this.y = 0
    this.width = 32
    this.height = 32
    this.visible = true
    this.alpha = 1
    this.rotate = 0
    this.scaleX = 1
    this.scaleY = 1
    this.strokeColor = '22, 124, 255'
    this.borderColor = '22, 124, 255'
    this.fillColor = '22,124,255'
    this.shadow = false
    this.shadowBlur = 5
    this.shadowColor = 'rgba(0,0,0,.5)'
    this.shadowOffsetX = 3
    this.shadowOffsetY = 6
    this.transformAble = false
    this.zIndex = 0

    const keyArr = "x,y,width,height,visible,alpha,rotate,scaleX,scaleY,strokeColor,fillColor,shadow,shadowColor,shadowOffsetX,shadowOffsetY,transformAble,zIndex".split(",")

    this.serializedProperties = this.serializedProperties.concat(keyArr)
  }

  // 绘制当前元素
  paint(ctx) {
    ctx.beginPath()
    ctx.fillStyle = 'rgba(' + this.fillColor + ',' + this.alpha + ')'
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
  }

  // 获取当前元素左上角位置
  getLocation() {
    return {
      x: this.x,
      y: this.y
    }
  }

  // 设置当前元素位置
  setLocation(x, y) {
    this.x = x
    this.y = y

    return this
  }

  // 获取当前元素中心点位置
  getCenterLocation() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }

  // 设置当前元素中心点位置
  setCenterLocation(x, y) {
    this.x = x - this.width / 2
    this.y = y - this.height / 2

    return this
  }

  // 获取当前元素大小
  getSize() {
    return {
      width: this.width,
      height: this.height
    }
  }

  // 设置当前元素大小
  setSize(w, h) {
    this.width = w
    this.height = h

    return this
  }

  // 获取当前元素的边界
  getBound() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height,
      width: this.width,
      height: this.height
    }
  }

  // 设置当前元素的边界
  setBound(x, y, w, h) {
    this.setLocation(x, y)
    this.setSize(w, h)

    return this
  }

  // 获取当前元素可展示的边界
  getDisplayBound() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.width * this.scaleX,
      bottom: this.y + this.height * this.scaleY
    }
  }

  // 设置当前元素可展示的大小
  getDisplaySize() {
    return {
      width: this.width * this.scaleX,
      height: this.height * this.scaleY
    }
  }

  // 根据位置描述符获取元素上对应的位置坐标
  getPosition(posDesc) {
    let x
    let y
    const boundObj = this.getBound()

    switch (posDesc) {
      case 'Top_Left':
        x = boundObj.left
        y = boundObj.top
        break
      case 'Top_Center':
        x = this.cx
        y = boundObj.top
        break
      case 'Top_right':
        x = boundObj.right
        y = boundObj.top
        break
      case 'Middle_left':
        x = boundObj.left
        y = boundObj.cy
        break
      case 'Middle_Center':
        x = boundObj.cx
        y = boundObj.cy
        break
      case 'Middle_Right':
        x = boundObj.right
        y = boundObj.cy
        break
      case 'Bottom_Left':
        x = boundObj.left
        y = boundObj.bottom
        break
      case 'Bottom_Center':
        x = this.cx
        y = boundObj.bottom
        break
      case 'Bottom_Right':
        x = boundObj.right
        y = boundObj.bottom
        break
    }

    return {x, y}
  }

  // 获取元素中心点的横坐标
  get cx() {
    return this.x + this.width / 2
  }

  // 设置元素中心点的横坐标
  set cx(cx) {
    this.x = cx - this.width / 2
  }

  // 获取元素中心点的纵坐标
  get cy() {
    return this.y + this.height / 2
  }

  // 设置元素中心点的纵坐标
  set cy(cy) {
    this.y = cy - this.height / 2
  }
}
