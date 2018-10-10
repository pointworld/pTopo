String.prototype.getChineseNum = function () {
  let len = 0

  for (let i = 0; i < this.length; i++) {
    if (
      this.charCodeAt(i) > 127
      || this.charCodeAt(i) === 94
    ) {
      len += 1
    }
  }

  return len
}
Array.prototype.del = function (indexOrValue) {
  if ("number" !== typeof indexOrValue) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === indexOrValue) {
        return this
          .slice(0, i)
          .concat(this.slice(i + 1, this.length))
      }
    }

    return this
  }

  return 0 > indexOrValue
    ? this
    : this
      .slice(0, indexOrValue)
      .concat(this.slice(indexOrValue + 1, this.length))
}
Array.prototype.unique = function () {
  this.sort()

  const res = [this[0]]

  for (let i = 1; i < this.length; i++) {
    if (this[i] !== res[res.length - 1]) {
      res.push(this[i])
    }
  }

  return res
}

CanvasRenderingContext2D.prototype.PwRoundRect = function (x, y, w, h, borderRadius, borderDashed) {
  !borderRadius && (borderRadius = 5)

  if (borderDashed) {
    this.beginPath()

    this.PwDashedLineTo(x + borderRadius, y, x + w - borderRadius, y)
    this.quadraticCurveTo(x + w, y, x + w, y + borderRadius)

    this.PwDashedLineTo(x + w, y + borderRadius, x + w, y + h - borderRadius)
    this.quadraticCurveTo(x + w, y + h, x + w - borderRadius, y + h)

    this.PwDashedLineTo(x + w - borderRadius, y + h, x + borderRadius, y + h)
    this.quadraticCurveTo(x, y + h, x, y + h - borderRadius)

    this.PwDashedLineTo(x, y + h - borderRadius, x, y + borderRadius)
    this.quadraticCurveTo(x, y, x + borderRadius, y)
    this.PwDashedLineTo(x, y, x + borderRadius, y)

    this.closePath()
  }
  else {
    this.beginPath()
    this.moveTo(x + borderRadius, y)
    this.lineTo(x + w - borderRadius, y)
    this.quadraticCurveTo(x + w, y, x + w, y + borderRadius)
    this.lineTo(x + w, y + h - borderRadius)
    this.quadraticCurveTo(x + w, y + h, x + w - borderRadius, y + h)
    this.lineTo(x + borderRadius, y + h)
    this.quadraticCurveTo(x, y + h, x, y + h - borderRadius)
    this.lineTo(x, y + borderRadius)
    this.quadraticCurveTo(x, y, x + borderRadius, y)
    this.closePath()
  }
}
CanvasRenderingContext2D.prototype.PwDashedLineTo = function (x1, y1, x2, y2, dashedLineSpacing) {
  !dashedLineSpacing && (dashedLineSpacing = 5)

  const w = x2 - x1
  const h = y2 - y1

  const len = Math.floor(Math.sqrt(w * w + h * h))
  const dashedLineSpacingAmount = 0 >= dashedLineSpacing
    ? len
    : len / dashedLineSpacing

  const dashedLineSpacingH = h / len * dashedLineSpacing
  const dashedLineSpacingW = w / len * dashedLineSpacing

  this.beginPath()

  for (
    let stepAmount = 0;
    dashedLineSpacingAmount > stepAmount;
    stepAmount++
  ) {
    stepAmount % 2
      ? this.lineTo(x1 + stepAmount * dashedLineSpacingW, y1 + stepAmount * dashedLineSpacingH)
      : this.moveTo(x1 + stepAmount * dashedLineSpacingW, y1 + stepAmount * dashedLineSpacingH)
  }

  this.stroke()
}
CanvasRenderingContext2D.prototype.PwDrawPointPath = function (x1, y1, x2, y2, strokeStyle, PointPathColor) {
  const animSpeed = (new Date()) / 10

  const w = x2 - x1
  const h = y2 - y1

  const l = Math.floor(Math.sqrt(w * w + h * h))
  const pointPathLen = 50

  let wLen
  let hLen

  if (l === 0) {
    wLen = 0
    hLen = 0
  } else {
    wLen = w / l
    hLen = h / l
  }

  const colorpoint = animSpeed % (l + pointPathLen) - pointPathLen

  for (let i = 0; i < l; i++) {
    if (
      i > colorpoint
      && i < (colorpoint + pointPathLen)
    ) {
      this.beginPath()
      this.strokeStyle = strokeStyle
      this.moveTo(x1 + (i - 1) * wLen, y1 + (i - 1) * hLen)
      this.lineTo(x1 + i * wLen, y1 + i * hLen)
      this.stroke()
    }
    else {
      this.beginPath()
      this.strokeStyle = PointPathColor
      this.moveTo(x1 + (i - 1) * wLen, y1 + (i - 1) * hLen)
      this.lineTo(x1 + i * wLen, y1 + i * hLen)
      this.stroke()
    }
  }
}
