import Node from './Node'

function _Animate1_Node(frameImages, interv, c) {
  this.frameImages = frameImages || []
  this.frameIndex = 0
  this.isStop = true

  const interval = interv || 1e3

  this.repeatPlay = false

  const self = this

  this.nextFrame = function () {
    if (
      !self.isStop
      && self.frameImages
    ) {
      self.frameIndex++

      if (self.frameIndex >= self.frameImages.length) {
        if (!self.repeatPlay) return

        self.frameIndex = 0
      }

      self.setImage(self.frameImages[self.frameIndex], c)

      setTimeout(self.nextFrame, interval / frameImages.length)
    }
  }
}
_Animate1_Node.prototype = new Node

function _Animate2_Node(image, row, col, interv, rOffset) {
  this.setImage(image)
  this.frameIndex = 0
  this.isPause = true
  this.repeatPlay = false

  const interval = interv || 1e3
  const rowOffset = rOffset || 0

  const self = this

  this.paint = function (ctx) {
    if (self.image) {
      let w = self.width
      let h = self.height
      const dstX = Math.floor(self.frameIndex % col) * w
      const dstY = (Math.floor(self.frameIndex / col) + rowOffset) * h

      ctx.save()

      ctx.beginPath()
      ctx.fillStyle = "rgba(" + self.fillColor + "," + self.alpha + ")"
      ctx.drawImage(self.image, dstX, dstY, w, h, -w / 2, -h / 2, w, h)
      ctx.fill()
      ctx.closePath()

      ctx.restore()

      self.paintText(ctx)
      self.paintBorder(ctx)
      self.paintCtrl(ctx)
    }
  }

  this.nextFrame = function () {
    if (!self.isStop) {
      self.frameIndex++

      if (self.frameIndex >= row * col) {
        if (!self.repeatPlay) return

        self.frameIndex = 0
      }

      setTimeout(function () {
        self.isStop || self.nextFrame()
      }, interval / (row * col))
    }
  }
}
_Animate2_Node.prototype = new Node

export default class AnimateNode extends Node {
  constructor() {
    super()

    const animNode = arguments.length <= 3
      ? new _Animate1_Node(arguments[0], arguments[1], arguments[2])
      : new _Animate2_Node(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])

    animNode.stop = function () {
      animNode.isStop = true
    }
    animNode.play = function () {
      animNode.isStop = false
      animNode.frameIndex = 0
      animNode.nextFrame()
    }

    return animNode
  }
}