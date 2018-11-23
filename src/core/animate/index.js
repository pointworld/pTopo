import Node from '../node/Node'
import {getDistance} from "../../shared/util"
import EventEmitter from '../events/index'

function bbb(fn, interval) {
  let timer
  let eventEmitter = null

  return {
    stop: function () {
      if (timer) {
        clearInterval(timer)
        eventEmitter && eventEmitter.publish("stop")
      }

      return this
    },
    start: function () {
      const self = this

      timer = setInterval(function () {
        fn.call(self)
      }, interval)

      return this
    },
    onStop: function (fn) {
      !eventEmitter && (eventEmitter = new EventEmitter)
      eventEmitter.subscribe("stop", fn)

      return this
    }
  }
}

// 是否停止所有动画
let isStopAll = false

export default class Animate {
  constructor() {
  }

  // 匀速效果
  stepByStep(node, attrs, time, isNeedCycle, isNeedReverseCycle) {
    const interval = 1000 / 24
    const h = {}

    for (let attr in attrs) {
      const val = attrs[attr]
      const distance = val - node[attr]

      h[attr] = {
        oldValue: node[attr],
        targetValue: val,
        step: distance / time * interval,
        isDone: function (attr) {
          if (this.step > 0) {
            return node[attr] >= this.targetValue
          }
          else if (this.step < 0) {
            return node[attr] <= this.targetValue
          }
        }
      }
    }

    return new bbb(function () {
      let b = true

      for (let attr in attrs) {
        if (!h[attr].isDone(attr)) {
          node[attr] += h[attr].step
          b = false
        }
      }

      if (b) {
        if (!isNeedCycle) return this.stop()

        for (let attr in attrs) {
          if (isNeedReverseCycle) {
            const g = h[attr].targetValue

            h[attr].targetValue = h[attr].oldValue
            h[attr].oldValue = g
            h[attr].step = -h[attr].step
          }
          else {
            node[attr] = h[attr].oldValue
          }
        }
      }

      return this
    }, interval)
  }

  // 旋转效果
  rotate(a, b) {
    let timer = null
    const obj = {}
    let v = b.v

    obj.run = function () {
      timer = setInterval(function () {
        if (isStopAll) {
          return void obj.stop()
        }
        else {
          a.rotate += v || .2

          return void a.rotate > 2 * Math.PI
          && (a.rotate = 0)
        }
      }, 100)

      return obj
    }
    obj.stop = function () {
      clearInterval(timer)
      obj.onStop && obj.onStop(a)

      return obj
    }
    obj.onStop = function (cb) {
      obj.onStop = cb

      return obj
    }

    return obj
  }

  // 缩放效果
  scale(a, b) {
    let scale = b.scale || 1
      , f = .06
      , scaleX = a.scaleX
      , scaleY = a.scaleY
      , obj = {}
      , timer = null

    obj.onStop = function (cb) {
      obj.onStop = cb
      return obj
    }
    obj.run = function () {
      timer = setInterval(function () {
        a.scaleX += f
        a.scaleY += f
        a.scaleX >= scale && obj.stop()
      }, 100)
      return obj
    }
    obj.stop = function () {
      obj.onStop && obj.onStop(a)
      a.scaleX = scaleX
      a.scaleY = scaleY
      clearInterval(timer)
    }

    return obj
  }

  // 移动
  move(a, b) {
    let position = b.position
      , easing = b.easing || .2
      , obj = {}
      , timer = null

    obj.onStop = function (cb) {
      obj.onStop = cb
      return obj
    }
    obj.run = function () {
      timer = setInterval(function () {
        if (isStopAll) {
          return void obj.stop()
        }

        let b = position.x - a.x
          , c = position.y - a.y
          , h = b * easing
          , i = c * easing

        a.x += h
        a.y += i
        .01 > h && .1 > i && obj.stop()
      }, 100)

      return obj
    }
    obj.stop = function () {
      clearInterval(timer)
    }

    return obj
  }

  cycle(b, c) {
    let p1 = c.p1
      , p2 = c.p2
      , h = p1.x + (p2.x - p1.x) / 2
      , i = p1.y + (p2.y - p1.y) / 2
      , j = getDistance(p1, p2) / 2
      , k = Math.atan2(i, h)
      , speed = c.speed || .2
      , obj = {}
      , timer = null

    obj.run = function () {
      timer = setInterval(function () {
        if (isStopAll) {
          obj.stop()

          return
        }

        const a = p1.y + h + Math.sin(k) * j

        b.setLocation(b.x, a)

        k += speed
      }, 100)

      return obj
    }
    obj.stop = function () {
      clearInterval(timer)
    }

    return obj
  }

  repeatThrow(a, b) {
    let f = .8,
      context = b.context,
      timer = null,
      obj = {}

    function c(a) {
      a.visible = !0
      a.rotate = Math.random()

      const b = context.stage.canvas.width / 2

      a.x = b + Math.random() * (b - 100) - Math.random() * (b - 100)
      a.y = context.stage.canvas.height
      a.vx = 5 * Math.random() - 5 * Math.random()
      a.vy = -25
    }

    obj.onStop = function (cb) {
      obj.onStop = cb
      return obj
    }
    obj.run = function d() {
      c(a)
      timer = setInterval(function () {
        if (isStopAll) {
          obj.stop()
        } else {
          a.vy += f
          a.x += a.vx
          a.y += a.vy

          if (
            a.x < 0
            || a.x > context.stage.canvas.width
            || a.y > context.stage.canvas.height
          ) {
            if (obj.onStop) {
              obj.onStop(a)
              c(a)
            }
          }
        }
      }, 50)
      return obj
    }
    obj.stop = function e() {
      clearInterval(timer)
    }

    return obj
  }

  // 将一个节点切成两片
  dividedTwoPiece(b, c) {
    const self = this
    let context = c.context
      , obj = {}

    function d(x, y, radius, startAngle, endAngle) {
      const node = new Node

      node.setImage(b.image)
      node.setSize(b.width, b.height)
      node.setLocation(x, y)
      node.showSelected = !1
      node.dragable = !1
      node.paint = function (ctx) {
        ctx.save()
        ctx.arc(0, 0, radius, startAngle, endAngle)
        ctx.clip()
        ctx.beginPath()

        if (this.image) {
          ctx.drawImage(this.image, -this.width / 2, -this.height / 2)
        } else {
          ctx.fillStyle = "rgba(" + this.style.fillStyle + "," + this.alpha + ")"
          ctx.rect(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2)
          ctx.fill()
        }

        ctx.closePath()
        ctx.restore()
      }

      return node
    }

    function e(angle, context) {
      let startAngle = angle
        , endAngle = angle + Math.PI
        , h = d(b.x, b.y, b.width, startAngle, endAngle)
        , j = d(b.x - 2 + 4 * Math.random(), b.y, b.width, startAngle + Math.PI, startAngle)

      b.visible = !1

      context.add(h)
      context.add(j)

      self
        .gravity(h, {
          context: context,
          dx: .3
        })
        .run()
        .onStop(function () {
          context.remove(h)
          context.remove(j)
          obj.stop()
        })

      self
        .gravity(j, {
          context: context,
          dx: -.2
        })
        .run()
    }

    obj.onStop = function (cb) {
      obj.onStop = cb

      return obj
    }
    obj.run = function () {
      e(c.angle, context)

      return obj
    }
    obj.stop = function () {
      obj.onStop && obj.onStop(b)

      return obj
    }

    return obj
  }

  // 重力效果
  gravity(a, b) {
    let context = b.context
      , gravity = b.gravity || .1
      , timer = null
      , obj = {}

    obj.run = function () {
      const dx = b.dx || 0
      let dy = b.dy || 2

      timer = setInterval(function () {
        if (isStopAll) {
          return void obj.stop()
        }
        else {
          dy += gravity

          if (a.y + a.height < context.stage.canvas.height) {
            return void a.setLocation(a.x + dx, a.y + dy)
          }
          else {
            dy = 0
            return void stop()
          }
        }
      }, 20)

      return obj
    }
    obj.stop = function () {
      clearInterval(timer)
      obj.onStop && obj.onStop(a)

      return obj
    }
    obj.onStop = function (a) {
      obj.onStop = a

      return obj
    }

    return obj
  }

  // 开始所有动画
  startAll() {
    isStopAll = false
  }

  // 停止所有动画
  stopAll() {
    isStopAll = true
  }
}