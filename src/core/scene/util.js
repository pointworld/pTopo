import Link from "../link/Link"

// 获取当前场景中所有元素的边界
export function getElementsBound(eleArr) {
  let ebObj = {
    left: Number.MAX_VALUE,
    right: Number.MIN_VALUE,
    top: Number.MAX_VALUE,
    bottom: Number.MIN_VALUE,
  }

  for (let i = 0; i < eleArr.length; i++) {
    const node = eleArr[i]

    if (!(node instanceof Link)) {
      if (ebObj.left > node.x) {
        ebObj.left = node.x
        ebObj.leftNode = node
      }

      if (ebObj.right < node.x + node.width) {
        ebObj.right = node.x + node.width
        ebObj.rightNode = node
      }

      if (ebObj.top > node.y) {
        ebObj.top = node.y
        ebObj.topNode = node
      }

      if (ebObj.bottom < node.y + node.height) {
        ebObj.bottom = node.y + node.height
        ebObj.bottomNode = node
      }
    }
  }

  ebObj.width = ebObj.right - ebObj.left
  ebObj.height = ebObj.bottom - ebObj.top

  return ebObj
}