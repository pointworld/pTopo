export default class Element {
  constructor() {
    this.elementType = 'element'
    this.serializedProperties = ['elementType']
    this.propertiesStack = []
    this._id = "" + (new Date).getTime()
  }

  destory() {
  }

  removeHandler() {
  }

  attr(k, v) {
    if (k && v) {
      this[k] = v
    }
    else if (k) {
      return this[k]
    }

    return this
  }

  save() {
    const self = this
    const data = {}

    this.serializedProperties.forEach(function (key) {
      data[key] = self[key]
    })

    this.propertiesStack.push(data)
  }

  restore() {
    if (
      this.propertiesStack
      && this.propertiesStack.length
    ) {
      const self = this
      const data = self.propertiesStack.pop()

      self.serializedProperties.forEach(function (key) {
        self[key] = data[key]
      })
    }
  }

  toJson() {
    const self = this
    const len = this.serializedProperties.length
    let dataJsonStr = "{"

    this.serializedProperties.forEach(function (key, i) {
      let val = self[key]

      "string" === typeof val
      && (val = '"' + val + '"')

      dataJsonStr += '"' + key + '":' + val

      len > i + 1
      && (dataJsonStr += ",")
    })

    dataJsonStr += "}"

    return dataJsonStr
  }
}
