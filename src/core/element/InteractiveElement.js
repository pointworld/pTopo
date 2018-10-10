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

  paintMouseover(ctx) {
    return this.paintSelected(ctx)
  }

  isInBound(x, y) {
    return x > this.x
      && x < this.x + this.width * Math.abs(this.scaleX)
      && y > this.y
      && y < this.y + this.height * Math.abs(this.scaleY)
  }

  addEventListener(type, fn) {
    const self = this
    const listener = function (args) {
      fn.call(self, args)
    }

    this.eventEmitter || (this.eventEmitter = new EventEmitter)

    this.eventEmitter.subscribe(type, listener)

    return this
  }

  dispatchEvent(type, e) {
    if (this.eventEmitter) {
      this.eventEmitter.publish(type, e)

      return this
    }
    else {
      return null
    }
  }

  selectedHandler() {
    this.selected = true

    this.selectedLocation = {
      x: this.x,
      y: this.y
    }
  }

  unselectedHandler() {
    this.selected = false
    this.selectedLocation = null
  }

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

  removeEventListener(type) {
    this.eventEmitter.unsubscribe(type)
  }

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
