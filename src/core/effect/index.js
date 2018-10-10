import EventEmitter from '../events/index'

function b(fn, interval) {
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

export default class Effect {
  constructor() {}

  spring(obj) {
    !obj && (obj = {})

    const spring = obj.spring || .1
    const friction = obj.friction || .8
    const grivity = obj.grivity || 0
    const minLength = obj.minLength || 0

    return {
      items: [],
      timer: null,
      isPause: false,
      addNode: function (node, targetNode) {
        const item = {
          node: node,
          target: targetNode,
          vx: 0,
          vy: 0
        }

        this.items.push(item)

        return this
      },
      play: function (time) {
        this.stop()

        time = time ? time : 1e3 / 24

        const self = this

        this.timer = setInterval(function () {
          self.nextFrame()
        }, time)
      },
      stop: function () {
        this.timer && clearInterval(this.timer)
      },
      nextFrame: function () {
        for (let i = 0; i < this.items.length; i++) {
          const item = this.items[i]
          const node = item.node
          const target = item.target
          let vx = item.vx
          let vy = item.vy
          const x = target.x - node.x
          const y = target.y - node.y
          const m = Math.atan2(y, x)

          if (minLength) {
            const n = target.x - Math.cos(m) * minLength
            const o = target.y - Math.sin(m) * minLength

            vx += (n - node.x) * spring
            vy += (o - node.y) * spring
          }
          else {
            vx += x * spring
            vy += y * spring
          }

          vx *= friction
          vy *= friction
          vy += grivity
          node.x += vx
          node.y += vy
          item.vx = vx
          item.vy = vy
        }
      }
    }
  }

  gravity(a, c) {
    c = c || {}

    const d = c.gravity || .1
    const e = c.dx || 0
    let f = c.dy || 5
    const g = c.stop
    const interval = c.interval || 30

    return new b(function () {
      if (g && g()) {
        f = .5
        this.stop()
      } else {
        f += d
        a.setLocation(a.x + e, a.y + f)
      }
    }, interval)
  }
}