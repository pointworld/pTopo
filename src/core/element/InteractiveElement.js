import DisplayElement from './DisplayElement'
import EventEmitter from '../events/index'

export default class InteractiveElement extends DisplayElement {
  constructor() {
    super()

    this.elementType = 'interactiveElement'
    this.dragable = false
    this.selected = false
    this.showSelected = true
    this.selectedLocation = null
    this.isMouseOver = false

    const keyArr = "dragable,selected,showSelected,isMouseOver".split(",")

    this.serializedProperties = this.serializedProperties.concat(keyArr)
  }

  // 绘制被选中的元素
  paintSelected(ctx) {
    if (this.showSelected) {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(168,202,255,.9)'
      ctx.fillStyle = 'rgba(168,202,236,0.7)'
      ctx.rect(-this.width / 2 - 3, -this.height / 2 - 3, this.width + 6, this.height + 6)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }
  }

  // 绘制鼠标悬浮在元素上时元素的样式
  paintMouseover(ctx) {
    return this.paintSelected(ctx)
  }

  // 判断某个点是否在元素内
  isInBound(x, y) {
    return x > this.x
      && x < this.x + this.width * Math.abs(this.scaleX)
      && y > this.y
      && y < this.y + this.height * Math.abs(this.scaleY)
  }

  // 添加事件监听器
  addEventListener(type, fn) {
    const self = this
    const listener = function (args) {
      fn.call(self, args)
    }

    this.eventEmitter || (this.eventEmitter = new EventEmitter)

    this.eventEmitter.subscribe(type, listener)

    return this
  }

  // 分配事件
  dispatchEvent(type, e) {
    if (this.eventEmitter) {
      this.eventEmitter.publish(type, e)

      return this
    }
    else {
      return null
    }
  }

  // 被选中时的处理器
  selectedHandler() {
    this.selected = true

    this.selectedLocation = {
      x: this.x,
      y: this.y
    }
  }

  // 不被选中时的处理器
  unselectedHandler() {
    this.selected = false
    this.selectedLocation = null
  }

  // 元素被点击时的处理器
  clickHandler(e) {
    this.dispatchEvent('click', e)
  }

  dbclickHandler(e) {
    this.dispatchEvent("dbclick", e)
  }

  mousedownHander(e) {
    this.dispatchEvent("mousedown", e)
  }

  mouseupHandler (e) {
    this.dispatchEvent("mouseup", e)
  }

  mouseoverHandler(e) {
    this.isMouseOver = true
    this.dispatchEvent("mouseover", e)
  }

  mousemoveHandler(e) {
    this.dispatchEvent("mousemove", e)
  }

  mouseoutHandler(e) {
    this.isMouseOver = false
    this.dispatchEvent("mouseout", e)
  }

  mousedragHandler(e) {
    const x = this.selectedLocation.x + e.dx
    const y = this.selectedLocation.y + e.dy

    this.setLocation(x, y)
    this.dispatchEvent("mousedrag", e)
  }

  // 移除当前元素上指定的事件监听器
  removeEventListener(type) {
    this.eventEmitter.unsubscribe(type)
  }

  // 移除当前元素上的所有监听器
  removeAllEventListener() {
    this.eventEmitter = new EventEmitter
  }

  click(fn) {
    fn
      ? this.addEventListener('click', fn)
      : this.dispatchEvent('click')
  }

  dbclick(fn) {
    fn
      ? this.addEventListener('dbclick', fn)
      : this.dispatchEvent('dbclick')
  }

  mousedown(fn) {
    fn
      ? this.addEventListener('mousedown', fn)
      : this.dispatchEvent('mousedown')
  }

  mouseup(fn) {
    fn
      ? this.addEventListener('mouseup', fn)
      : this.dispatchEvent('mouseup')
  }

  mouseover(fn) {
    fn
      ? this.addEventListener('mouseover', fn)
      : this.dispatchEvent('mouseover')
  }

  mouseout(fn) {
    fn
      ? this.addEventListener('mouseout', fn)
      : this.dispatchEvent('mouseout')
  }

  mousemove(fn) {
    fn
      ? this.addEventListener('mousemove', fn)
      : this.dispatchEvent('mousemove')
  }

  mousedrag(fn) {
    fn
      ? this.addEventListener('mousedrag', fn)
      : this.dispatchEvent('mousedrag')
  }

  touchstart(fn) {
    fn
      ? this.addEventListener('touchstart', fn)
      : this.dispatchEvent('touchstart')
  }

  touchmove(fn) {
    fn
      ? this.addEventListener('touchmove', fn)
      : this.dispatchEvent('touchmove')
  }

  touchend(fn) {
    fn
      ? this.addEventListener('touchend', fn)
      : this.dispatchEvent('touchend')
  }
}
