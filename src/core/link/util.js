import {lineFn,intersection} from "../../shared/util"

/**
 * 使两条线相交：即，尝试旋转线条角度，使两条线最终能够相交
 *
 * @param {Object} lineFn1
 * @param {Object} bObj
 * @return {false | Object} - 返回 false 或交点信息
 */
function intersectionLineBound(lineFn1, bObj) {
  let lineFn2 =lineFn(bObj.left, bObj.top, bObj.left, bObj.bottom)
  let ipObj = intersection(lineFn1, lineFn2)

  if (!ipObj) {
    lineFn2 = lineFn(bObj.left, bObj.top, bObj.right, bObj.top)
    ipObj = intersection(lineFn1, lineFn2)

    if (!ipObj) {
      lineFn2 = lineFn(bObj.right, bObj.top, bObj.right, bObj.bottom)
      ipObj = intersection(lineFn1, lineFn2)

      if (!ipObj) {
        lineFn2 = lineFn(bObj.left, bObj.bottom, bObj.right, bObj.bottom)
        ipObj = intersection(lineFn1, lineFn2)
      }
    }
  }

  return ipObj
}

// 获取相交点
export function getIntersectionPointObj(nodeA, nodeZ) {
  const lineObj = lineFn(nodeA.cx, nodeA.cy, nodeZ.cx, nodeZ.cy)
  const bObj = nodeA.getBound()

  return intersectionLineBound(lineObj, bObj)
}

// 获取两个节点间的共享连线组成的数组
function getSharedLinks(nodeA, nodeZ) {
  function sugar(nodeA, nodeZ) {
    const links = []

    if (!nodeA || !nodeZ) return links

    if (nodeA && nodeZ && nodeA.outLinks && nodeZ.inLinks) {
      for (let i = 0; i < nodeA.outLinks.length; i++) {
        const outLink = nodeA.outLinks[i]
        for (let j = 0; j < nodeZ.inLinks.length; j++) {
          const inLink = nodeZ.inLinks[j]
          outLink === inLink && links.push(inLink)
        }
      }
    }

    return links
  }

  const a_zLinks = sugar(nodeA, nodeZ)
  const z_aLinks = sugar(nodeZ, nodeA)

  return a_zLinks.concat(z_aLinks)
}

export function unsharedLinks(link) {
  let sharedLinks = getSharedLinks(link.nodeA, link.nodeZ)

  return sharedLinks.filter(function (sharedLink) {
    return link !== sharedLink
  })
}

// 获取两个节点节共享的连线数
export function getSharedLinksLen(nodeA, nodeZ) {
  return getSharedLinks(nodeA, nodeZ).length
}