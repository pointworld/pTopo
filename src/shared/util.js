// 获取一个点被旋转后的坐标
export function rotatePoint(x1, y1, x2, y2, rad) {
  const w = x2 - x1
  const h = y2 - y1
  const l = Math.sqrt(w * w + h * h)
  const tarRad = Math.atan2(h, w) + rad

  return {
    x: x1 + Math.cos(tarRad) * l,
    y: y1 + Math.sin(tarRad) * l,
  }
}

// 获取一个点被旋转多次后的得到的多个坐标组成的数组
export function rotatePoints(p1, pointsArr, rad) {
  const tarCoordArr = []

  for (let i = 0; i < pointsArr.length; i++) {
    const tarRotatePointCoord = rotatePoint(
      p1.x,
      p1.y,
      pointsArr[i].x,
      pointsArr[i].y,
      rad
    )

    tarCoordArr.push(tarRotatePointCoord)
  }

  return tarCoordArr
}

// 获取两个点之间的距离
export function getDistance(p1, p2, c, d) {
  let w
  let h

  if (!c && !d) {
    w = p2.x - p1.x
    h = p2.y - p1.y
  }
  else {
    w = c - p1
    h = d - p2
  }

  return Math.sqrt(w * w + h * h)
}
// 判断一个点是否在一条线段上
export function isPointInLine(p1, p2, p3) {

  const d1 = getDistance(p2, p3)
  const d2 = getDistance(p2, p1)
  const d3 = getDistance(p3, p1)

  return Math.abs(d2 + d3 - d1) <= .5
}

// 拷贝事件对象
export function cloneEvent(e) {
  const eObj = {}

  for (let key in e) {
    "returnValue" !== key
    && "keyLocation" !== key
    && (eObj[key] = e[key])
  }

  return eObj
}
// 获取鼠标的坐标位置信息，并重新计算事件对象的 pageX 值和 pageY 值
export function mouseCoords(e) {
  const eObj = cloneEvent(e)

  if (!eObj.pageX) {
    eObj.pageX = eObj.clientX + document.body.scrollLeft - document.body.clientLeft
    eObj.pageY = eObj.clientY + document.body.scrollTop - document.body.clientTop
  }

  return eObj
}
// 获取事件被触发的位置信息
export function getEventPosition(e) {
  return mouseCoords(e)
}

// 判断一个点是否在一个矩形框内
export function isPointInRect(point, rect) {
  return point.x > rect.x
    && point.x < rect.x + rect.width
    && point.y > rect.y
    && point.y < rect.y + rect.height
}
// 判断两个矩形是否重叠
export function isRectOverlapRect(rect1, rect2) {
  function sugar(rect1, rect2) {
    const rect = rect1

    const leftTop = {
      x: rect.x,
      y: rect.y,
    }
    const leftBottom = {
      x: rect.x,
      y: rect.y + rect.height,
    }
    const rightTop = {
      x: rect.x + rect.width,
      y: rect.y,
    }
    const rightBottom = {
      x: rect.x + rect.width,
      y: rect.y + rect.height,
    }

    return isPointInRect(leftTop, rect2)
      || isPointInRect(leftBottom, rect2)
      || isPointInRect(rightTop, rect2)
      || isPointInRect(rightBottom, rect2)
  }

  return sugar(rect1, rect2)
    || sugar(rect2, rect1)
}

// 随机生成一个 rgb 颜色值
export function randomColor() {
  return Math.floor(255 * Math.random())
    + ","
    + Math.floor(255 * Math.random())
    + ","
    + Math.floor(255 * Math.random())
}

// 根据一个键数组，获取一个对象中所有与该数组对应的键和该键对应的值组成的一个字符串
export function getProperties(obj, keys) {
  let propertiesJson = ""

  for (let i = 0; i < keys.length; i++) {
    i > 0 && (propertiesJson += ",")

    let value = obj[keys[i]]

    "string" === typeof value
      ? value = '"' + value + '"'
      : !value && (value = null)

    propertiesJson += keys[i] + ":" + value
  }

  return propertiesJson
}

// 获取一条线段的函数
export function lineFn(x1, y1, x2, y2) {
  let k = (y2 - y1) / (x2 - x1)
  let b = y1 - x1 * k

  function sugar(x) {
    // y = kx + b
    return k * x + b
  }

  sugar.k = k
  sugar.b = b
  sugar.x1 = x1
  sugar.x2 = x2
  sugar.y1 = y1
  sugar.y2 = y2

  return sugar
}

// 判断一个值是否在某一个区间内
export function inRange(testVal, val1, val2) {
  const d1 = Math.abs(val1 - val2)
  const d2 = Math.abs(val1 - testVal)
  const d3 = Math.abs(val2 - testVal)
  const sign = Math.abs(d1 - (d2 + d3))

  return 1e-6 > sign ? !0 : !1
}
// 判断一个点是否在一条线段上
export function isPointInLineSeg(x, y, lineFn) {
  return inRange(x, lineFn.x1, lineFn.x2)
    && inRange(y, lineFn.y1, lineFn.y2)
}

// 获取两条线段的相交点
export function intersection(lineObj1, lineObj2) {
  let x
  let y

  return lineObj1.k == lineObj2.k ? null : (
    1 / 0 == lineObj1.k || lineObj1.k == -1 / 0 ? (x = lineObj1.x1,
      y = lineObj2(lineObj1.x1)) : 1 / 0 == lineObj2.k || lineObj2.k == -1 / 0 ? (x = lineObj2.x1,
      y = lineObj1(lineObj2.x1)) : (x = (lineObj2.b - lineObj1.b) / (lineObj1.k - lineObj2.k),
      y = lineObj1(x)),
      0 == isPointInLineSeg(x, y, lineObj1) ? null : 0 == isPointInLineSeg(x, y, lineObj2) ? null : {x, y}
  )
  // let x
  // let y
  //
  // if (lineFn1.k === lineFn2.k) {
  //   return null
  // }
  // else {
  //   if (
  //     1 / 0 === lineFn1.k
  //     || -1 / 0 === lineFn1.k
  //   ) {
  //     x = lineFn1.x1
  //     y = lineFn2(lineFn1.x1)
  //
  //     return {x, y}
  //   }
  //   else {
  //     if (
  //       1 / 0 === lineFn2.k
  //       || -1 / 0 === lineFn2.k
  //     ) {
  //       x = lineFn2.x1
  //       y = lineFn1(lineFn2.x1)
  //
  //       return {x, y}
  //     }
  //     else {
  //       x = (lineFn2.b - lineFn1.b) / (lineFn1.k - lineFn2.k)
  //       y = lineFn1(x)
  //
  //       if (!isPointInLineSeg(x, y, lineFn1)) {
  //         return null
  //       }
  //       else {
  //         if (isPointInLineSeg(x, y, lineFn2)) {
  //           return null
  //         }
  //         else {
  //           return {x, y}
  //         }
  //       }
  //     }
  //   }
  // }
}

// 创建一个元素的唯一 id
export function createId() {
  return "front" + (new Date).getTime() + Math.round(Math.random() * 1000000)
}

// 深拷贝一个对象
export function copy(jsonObj) {
  return JSON.parse(JSON.stringify(jsonObj))
}

export function getUrlParam(key) {
  const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)")
  const r = window.location.search.substr(1).match(reg)

  if (r) {
    return decodeURIComponent(r[2])
  }

  return null
}

// 获取旋转角度
export function getRotateAng(nodeA, nodeZ) {
  const x = nodeA.x - nodeZ.x
  const y = nodeA.y - nodeZ.y

  return Math.atan(y / x)
}

// 浅拷贝一个对象
export function clone(jsonObj) {
  const copyJsonObj = {}

  for (let key in jsonObj) {
    copyJsonObj[key] = jsonObj[key]
  }

  return copyJsonObj
}

export function findAllPrevNodesAndLinks(id, linksArr, saveObj) {
  let _saveObj = saveObj

  if (!saveObj) {
    _saveObj = {
      prevNodesId: [],
      prevLinksId: [],
    }
  }

  for (let i = 0; i < linksArr.length; i++) {
    const linkObj = linksArr[i]

    if (linkObj.nodeZ.id === id) {
      _saveObj.prevNodesId.push(linkObj.nodeA.id)
      _saveObj.prevLinksId.push(linkObj.id)

      findAllPrevNodesAndLinks(linkObj.nodeA.id, linksArr, _saveObj)
    }
  }

  return _saveObj
}
export function findAllNextNodesAndLinks(id, linksArr, saveObj) {
  let _saveObj = saveObj

  if (!saveObj) {
    _saveObj = {
      nextNodesId: [],
      nextLinksId: [],
    }
  }

  for (let i = 0; i < linksArr.length; i++) {
    const linkObj = linksArr[i]

    if (linkObj.nodeA.id === id) {
      _saveObj.nextNodesId.push(linkObj.nodeZ.id)
      _saveObj.nextLinksId.push(linkObj.id)

      findAllNextNodesAndLinks(linkObj.nodeZ.id, linksArr, _saveObj)
    }
  }

  return _saveObj
}

// 从数组中移除目标元素
export function removeFromArray(arr, tarEle) {
  for (let i = 0; i < arr.length; i++) {
    const curEle = arr[i]

    if (curEle === tarEle) {
      arr = arr.del(i)

      break
    }
  }

  return arr
}

// 获取一个元素偏移后的左上角坐标
export function getOffsetPosition(ele) {
  if (!ele) {
    return {
      left: 0,
      top: 0,
    }
  }

  let top = 0
  let left = 0

  do {
    top += ele.offsetTop || 0
    left += ele.offsetLeft || 0
    ele = ele.offsetParent
  }
  while (ele)

  return {
    top: top,
    left: left,
  }
}



