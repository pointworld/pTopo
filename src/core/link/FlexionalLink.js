import Link from './Link'
import {getSharedLinksLen} from "./util"

export default class FlexionalLink extends Link {
  constructor(nodeA, nodeZ, text) {
    super(nodeA, nodeZ, text)

    this.direction = "vertical"
    this.offsetGap = 44
  }

  // 获取二次折线起始位置
  getStartPosition() {
    const startPos = {x: this.nodeA.cx, y: this.nodeA.cy}

    if ("horizontal" === this.direction) {
      startPos.x = this.nodeZ.cx < startPos.x
        ? this.nodeA.x
        : this.nodeA.x + this.nodeA.width
    }
    else {
      startPos.y = this.nodeZ.cy < startPos.y
        ? this.nodeA.y
        : this.nodeA.y + this.nodeA.height
    }

    return startPos
  }

  // 获取二次折线结束位置
  getEndPosition() {
    const endPos = {
      x: this.nodeZ.cx,
      y: this.nodeZ.cy
    }

    if ("horizontal" === this.direction) {
      endPos.x = this.nodeA.cx < endPos.x
        ? this.nodeZ.x
        : this.nodeZ.x + this.nodeZ.width
    }
    else {
      endPos.y = this.nodeA.cy < endPos.y
        ? this.nodeZ.y
        : this.nodeZ.y + this.nodeZ.height
    }

    return endPos
  }

  // 获取二次折线路径
  getPath(a) {
    const startPos = this.getStartPosition()
    const endPos = this.getEndPosition()

    if (this.nodeA === this.nodeZ) return [startPos, endPos]

    const pathObj = []

    const length = getSharedLinksLen(this.nodeA, this.nodeZ)
    const g = (length - 1) * this.bundleGap
    const h = this.bundleGap * a - g / 2

    let i = this.offsetGap

    if ("horizontal" === this.direction) {
      this.nodeA.cx > this.nodeZ.cx && (i = -i)

      pathObj.push({x: startPos.x, y: startPos.y + h})
      pathObj.push({x: startPos.x + i, y: startPos.y + h})
      pathObj.push({x: endPos.x - i, y: endPos.y + h})
      pathObj.push({x: endPos.x, y: endPos.y + h
      })
    }
    else {
      this.nodeA.cy > this.nodeZ.cy && (i = -i)

      pathObj.push({x: startPos.x + h, y: startPos.y})
      pathObj.push({x: startPos.x + h, y: startPos.y + i})
      pathObj.push({x: endPos.x + h, y: endPos.y - i})
      pathObj.push({x: endPos.x + h, y: endPos.y})
    }

    return pathObj
  }
}