import Link from './Link'

export default class CustomLink extends Link {
   constructor(nodeA, nodeZ, text) {
     super(nodeA, nodeZ, text)
   }

   getPath() {
     const pathObj = []
     const startPos = this.getStartPosition()
     const endPos = this.getEndPosition()

     pathObj.push(startPos)
     pathObj.push({x: 100, y: 100})
     pathObj.push({x: 200, y: 150})
     pathObj.push({x: 330, y: 250})
     pathObj.push({x: 400, y: 200})
     pathObj.push(endPos)

     return pathObj
   }

   paintText(ctx, b) {
     if (this.text && this.text.length) {
       const c = b[1]
       const d = c.x + this.textOffsetX
       const e = c.y + this.textOffsetY

       ctx.save()
       ctx.beginPath()
       ctx.font = this.font

       const textW = ctx.measureText(this.text).width
       const cnW = ctx.measureText("田").width

       ctx.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")"
       ctx.fillText(this.text, d - textW / 2, e - cnW / 2)
       ctx.stroke()
       ctx.closePath()
       ctx.restore()
     }
   }
}