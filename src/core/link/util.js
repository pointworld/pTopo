import {lineFn,intersection} from "../../shared/util"

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

export function getIntersectionPointObj(nodeA, nodeZ) {
  const lineObj = lineFn(nodeA.cx, nodeA.cy, nodeZ.cx, nodeZ.cy)
  const bObj = nodeA.getBound()

  return intersectionLineBound(lineObj, bObj)
}

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

export function getSharedLinksLen(nodeA, nodeZ) {
  return getSharedLinks(nodeA, nodeZ).length
}