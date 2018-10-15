export default class LinKEnd {
  constructor (opts) {
    // default, arrow, circle, triangle, user-defined, ...
    this.linkEndType = opts.linkEndType || 'default'
    this.linkEndStyle = opts.linkEndStyle || ''
    this.linkEndColor = opts.linkEndColor || ''
    this.linkEndWidth = opts.linkEndWidth || ''
    this.linkEndColor = opts.linkEndColor || ''
  }

  paintLinkEnd(ctx) {
    switch (this.linkEndType) {
      case 'arrow':
        this.paintArrow(ctx)
        break
      case 'circle':
        this.paintCircle(ctx)
        break
      case 'triangle':
        this.paintTriangle(ctx)
        break
      default:
    }
  }

  paintArrow(ctx) {}

  paintCircle(ctx) {}

  paintTriangle(ctx) {}
}