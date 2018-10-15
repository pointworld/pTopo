export default class Line {
  constructor (opts) {
    // dashed, curve, fold, straight, parabola ...
    this.lineType = opts.lineType || 'default'
    this.lineStyle = opts.lineStyle || ''
    this.lineWidth = opts.lineWidth || 2
    this.lineColor = opts.lineColor || '0,0,0'
    this.lineDirection = opts.lineDirection || 'horizontal'
    this.linePaths = opts.linePaths || []
    this.lineFn = opts.lineFn || null

  }

  paintLine(ctx) {}
}