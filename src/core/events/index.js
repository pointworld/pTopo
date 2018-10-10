export default class EventEmitter {
  constructor(type) {
    this.name = type
    this.messageMap = {}
    this.messageCount = 0
  }

  subscribe(type, listener) {
    const handler = this.messageMap[type]

    !handler
    && (this.messageMap[type] = [])

    this.messageMap[type].push(listener)

    this.messageCount++
  }

  unsubscribe(type) {
    const handler = this.messageMap[type]

    if (handler) {
      this.messageMap[type] = null

      delete this.messageMap[type]

      this.messageCount--
    }
  }

  publish(type, eObj, sign) {
    const handler = this.messageMap[type]

    handler
    && handler.forEach(listener => {
      sign
        ? !function (listener, eObj) {
          setTimeout(function () {
            listener(eObj)
          }, 10)
        }(listener, eObj)
        : listener(eObj)
    })
  }

  on(type, eObj) {
  }

  emit(type, args) {
  }

  off(type) {
  }

  once(type, eObj) {
  }
}
