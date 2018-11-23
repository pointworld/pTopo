export default class Element {
  constructor() {
    // 元素类型
    this.elementType = 'element'
    // 序列化属性
    this.serializedProperties = ['elementType']
    // 属性栈
    this.propertiesStack = []
    // 元素 id
    this._id = "" + (new Date).getTime()
  }

  destory() {
  }

  removeHandler() {
  }

  // 设置或获取元素属性
  attr(k, v) {
    if (k && v) {
      this[k] = v
    }
    else if (k) {
      return this[k]
    }

    return this
  }

  // 保存当前状态数据到数组 propertiesStack 中
  save() {
    const self = this
    const data = {}

    this.serializedProperties.forEach(function (key) {
      data[key] = self[key]
    })

    this.propertiesStack.push(data)
  }

  // 从数组 propertiesStack 中取出最后一个元素来恢复当前状态
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

  // 将当前的 Element 实例对象转换为 JSON 字符串
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
