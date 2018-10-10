import Node from '../node/Node'
import Link from "../link/Link"
import {getElementsBound} from '../scene/util'
import Animate from "../animate/index"

function h(a) {
  let b = 0
  let c = 0

  a.forEach(function (a) {
    b += a.width
    c += a.height
  })
  return {
    width: b / a.length,
    height: c / a.length
  }
}

function i(a, b, c, d) {
  b.x += c
  b.y += d

  const e = PTopo.Layout.getNodeChilds(a, b)

  for (let f = 0; f < e.length; f++) {
    i(a, e[f], c, d)
  }

}

function j(links, node) {
  function sugar(node, e) {
    const nodeChildsArr = PTopo.Layout.getNodeChilds(links, node)

    if (!d[e]) {
      d[e] = {}
      d[e].nodes = []
      d[e].childs = []
    }

    d[e].nodes.push(node)
    d[e].childs.push(nodeChildsArr)

    for (let i = 0; i < nodeChildsArr.length; i++) {
      sugar(nodeChildsArr[i], e + 1)
      nodeChildsArr[i].parent = node
    }

  }

  let d = []

  sugar(node, 0)

  return d
}

function m(x, y, rows, cols, horizontal, vertical) {
  let pointsArr = []

  for (let i = 0; rows > i; i++) {
    for (let j = 0; cols > j; j++) {
      pointsArr.push({
        x: x + j * horizontal,
        y: y + i * vertical
      })
    }
  }

  return pointsArr
}

function getRotatePoints(x, y, len, r, beginAngle, endAngle) {
  let beginA = beginAngle ? beginAngle : 0
  const endA = endAngle ? endAngle : 2 * Math.PI
  const angle = endA - beginA
  const j = angle / len
  const rotatePoints = []

  beginA += j / 2

  for (let i = beginA; endA >= i; i += j) {
    const rotatePointX = x + Math.cos(i) * r
    const rotatePointY = y + Math.sin(i) * r

    rotatePoints.push({
      x: rotatePointX,
      y: rotatePointY
    })
  }

  return rotatePoints
}

function o(x, y, len, w, h, dir) {
  const direction = dir || "bottom"
  const pointsArr = []

  if ("bottom" === direction) {
    let i = x - len / 2 * w + w / 2

    for (let j = 0; len >= j; j++) {
      pointsArr.push({
        x: i + j * w,
        y: y + h
      })
    }
  }
  else if ("top" === direction) {
    let i = x - len / 2 * w + w / 2

    for (let j = 0; len >= j; j++) {
      pointsArr.push({
        x: i + j * w,
        y: y - h
      })
    }
  }
  else if ("right" === direction) {
    let i = y - len / 2 * w + w / 2

    for (let j = 0; len >= j; j++) {
      pointsArr.push({
        x: x + h,
        y: i + j * w
      })
    }
  }
  else if ("left" === direction) {
    let i = y - len / 2 * w + w / 2

    for (let j = 0; len >= j; j++) {
      pointsArr.push({
        x: x - h,
        y: i + j * w
      })
    }
  }

  return pointsArr
}

export default {
  layoutNode: function (scene, node, bool) {
    const nodeChildsArr = this.getNodeChilds(scene.childs, node)

    if (!nodeChildsArr.length) return null

    this.adjustPosition(node, nodeChildsArr)

    if (bool) {
      for (let i = 0; i < nodeChildsArr.length; i++) {
        this.layoutNode(scene, nodeChildsArr[i], bool)
      }
    }

    return null
  },
  getNodeChilds: function (eles, node) {
    let eleChildsArr = []

    for (let i = 0; i < eles.length; i++) {

      eles[i] instanceof Link
      && eles[i].nodeA === node
      && eleChildsArr.push(eles[i].nodeZ)
    }

    return eleChildsArr
  },
  adjustPosition: function (node, nodeChildsArr) {
    if (node.layout) {
      const layout = node.layout
      const layoutType = layout.type
      let pointsArr = null

      if ("circle" === layoutType) {
        const layoutRadius = layout.radius || Math.max(node.width, node.height)

        pointsArr = getRotatePoints(node.cx, node.cy, nodeChildsArr.length, layoutRadius, node.layout.beginAngle, node.layout.endAngle)
      }
      else if ("tree" === layoutType) {
        const w = layout.width || 50
        const h = layout.height || 50
        const direction = layout.direction

        pointsArr = o(node.cx, node.cy, nodeChildsArr.length, w, h, direction)
      }
      else {
        if ("grid" !== layoutType) return

        pointsArr = m(node.x, node.y, layout.rows, layout.cols, layout.horizontal || 0, layout.vertical || 0)
      }

      for (let i = 0; i < nodeChildsArr.length; i++)
        nodeChildsArr[i].setCenterLocation(pointsArr[i].x, pointsArr[i].y)
    }
  },
  getTreeDeep: function (links, node) {
    let deep = 0
    const self = this
    function c(links, node, e) {
      const nodeChildsArr = self.getNodeChilds(links, node)

      e > deep && (deep = e)

      for (let i = 0; i < nodeChildsArr.length; i++)
        c(links, nodeChildsArr[i], e + 1)
    }

    c(links, node, 0)

    return deep
  },
  getRootNodes: function (nodes) {
    const nonLinkNodes = []

    const linkNodes = nodes.filter(function (node) {
      if (node instanceof Link) {
        return !0
      } else {
        nonLinkNodes.push(node)
        return !1
      }
    })

    let nonNodeZArrInNonLinkNodes = nonLinkNodes.filter(function (nonLinkNode) {
      for (let i = 0; i < linkNodes.length; i++) {
        if (linkNodes[i].nodeZ === nonLinkNode) return !1
      }

      return !0
    })

    return nonNodeZArrInNonLinkNodes.filter(function (node) {
      for (let i = 0; i < linkNodes.length; i++) {
        if (linkNodes[i].nodeA === node) return !0
      }

      return !1
    })
  },
  getNodesCenter: function (nodes) {
    let b = 0
    let c = 0

    nodes.forEach(function (node) {
      b += node.cx
      c += node.cy
    })

    return {
      x: b / nodes.length,
      y: c / nodes.length
    }
  },
  springLayout: function (ele, scene) {
    let f = .01
    let g = .95
    let h = -5
    let i = 0
    let j = 0
    let k = 0
    // get elementArr by ClassName in scene, every element is instance of the ClassName
    let eleArr = scene.getElementsByClass(Node)

    function d(ele1, ele2) {
      const dx = ele1.x - ele2.x
      const dy = ele1.y - ele2.y

      i += dx * f
      j += dy * f
      i *= g
      j *= g
      j += h
      ele2.x += i
      ele2.y += j
    }

    function fn() {
      if (!(++k > 150)) {
        for (let i = 0; i < eleArr.length; i++) {
          eleArr[i] !== ele && d(ele, eleArr[i], eleArr)
        }

        setTimeout(fn, 1e3 / 24)
      }
    }

    fn()
  },
  GridLayout: function (a, b) {
    return function (c) {
      const d = c.childs

      if (!(d.length <= 0)) {
        const boundaryObj = c.getBound()
        const f = d[0]
        const g = (boundaryObj.width - f.width) / b
        const h = (boundaryObj.height - f.height) / a
        let i = 0

        for (let j = 0; a > j; j++) {
          for (let k = 0; b > k; k++) {
            const l = d[i++]
            const x = boundaryObj.left + g / 2 + k * g
            const y = boundaryObj.top + h / 2 + j * h

            l.setLocation(x, y)

            if (i >= d.length) return
          }
        }
      }
    }
  },
  FlowLayout: function (a, b) {
    !a && (a = 0)
    !b && (b = 0)

    return function (c) {
      const childsArr = c.childs

      if (!(childsArr.length <= 0)) {
        const boundaryObj = c.getBound()
        let bLeft = boundaryObj.left
        let bTop = boundaryObj.top

        for (let i = 0; i < childsArr.length; i++) {
          const child = childsArr[i]

          if (bLeft + child.width >= boundaryObj.right) {
            bLeft = boundaryObj.left
            bTop += b + child.height
          }

          child.setLocation(bLeft + a / 2, bTop + b / 2)
          bLeft += a + child.width
        }
      }
    }
  },
  AutoBoundLayout: function () {
    return function (a, b) {
      if (b.length) {
        let x = 1e7
        let d = -1e7
        let y = 1e7
        let f = -1e7
        let w = d - x
        let h = f - y

        for (let i = 0; i < b.length; i++) {
          const j = b[i]

          j.x <= x && (x = j.x)
          j.x >= d && (d = j.x)
          j.y <= y && (y = j.y)
          j.y >= f && (f = j.y)

          w = d - x + j.width
          h = f - y + j.height
        }

        a.x = x
        a.y = y
        a.width = w
        a.height = h
      }
    }
  },
  CircleLayout: function (b) {
    const self = this
    return function (ele) {
      function sugar(eleChilds, rootNode, e) {
        const nodeChildsArr = self.getNodeChilds(eleChilds, rootNode)

        if (nodeChildsArr.length) {
          !e && (e = b)

          const g = 2 * Math.PI / nodeChildsArr.length

          nodeChildsArr.forEach(function (node, index) {
            const x = rootNode.x + e * Math.cos(g * index)
            const y = rootNode.y + e * Math.sin(g * index)

            node.setLocation(x, y)

            sugar(eleChilds, node, e / 2)
          })
        }
      }

      console.log(self)
      let rootNodes = self.getRootNodes(ele.childs)

      if (rootNodes.length > 0) {
        sugar(ele.childs, rootNodes[0])

        let eleBoundaryObj = getElementsBound(ele.childs)

        let centerLocOfEle = ele.getCenterLocation()
        let x = centerLocOfEle.x - (eleBoundaryObj.left + eleBoundaryObj.right) / 2
        let y = centerLocOfEle.y - (eleBoundaryObj.top + eleBoundaryObj.bottom) / 2

        ele.childs.forEach(function (node) {
          if (node instanceof Node) {
            node.x += x
            node.y += y
          }
        })
      }
    }
  },
  TreeLayout: function (b, c, d) {
    const self = this
    return function (e) {
      function f(links, node) {
        let h = self.getTreeDeep(links, node)
        let k = j(links, node)
        let l = k["" + h].nodes

        for (let m = 0; m < l.length; m++) {
          const n = l[m]

          let o = (m + 1) * (c + 10)
          let p = h * d

          if ("down" !== b) {
            if ("up" === b) {
              p = -p
            }
            else {
              if ("left" === b) {
                o = -h * d
                p = (m + 1) * (c + 10)
              }
              else {
                if ("right" === b) {
                  o = h * d
                  p = (m + 1) * (c + 10)
                }
              }
            }
          }

          n.setLocation(o, p)
        }

        for (let q = h - 1; q >= 0; q--) {

          let r = k["" + q].nodes
          let s = k["" + q].childs

          for (let m = 0; m < r.length; m++) {
            const t = r[m]
            const u = s[m]

            "down" === b
              ? t.y = q * d
              : "up" == b ? t.y = -q * d : "left" == b ? t.x = -q * d : "right" == b && (t.x = q * d)

            if (u.length) {
              "down" === b || "up" === b
                ? t.x = (u[0].x + u[u.length - 1].x) / 2
                : ("left" === b || "right" === b) && (t.y = (u[0].y + u[u.length - 1].y) / 2)
            }
            else {
              if (m > 0) {
                "down" === b || "up" === b
                  ? t.x = r[m - 1].x + r[m - 1].width + c
                  : ("left" === b || "right" === b) && (t.y = r[m - 1].y + r[m - 1].height + c)
              }
            }

            if (m > 0) {
              if ("down" === b || "up" === b) {
                if (t.x < r[m - 1].x + r[m - 1].width) {
                  let v = r[m - 1].x + r[m - 1].width + c
                  let w = Math.abs(v - t.x)

                  for (let x = m; x < r.length; x++) {
                    i(e.childs, r[x], w, 0)
                  }
                }
              }
              else if (
                ("left" === b || "right" === b)
                && t.y < r[m - 1].y + r[m - 1].height
              ) {
                let y = r[m - 1].y + r[m - 1].height + c
                let z = Math.abs(y - t.y)

                for (let x = m; x < r.length; x++) {
                  i(e.childs, r[x], 0, z)
                }
              }
            }
          }
        }
      }

      let g = null

      if (!c) {
        g = h(e.childs)
        c = g.width

        "left" === b
        || "right" === b
        && (c = g.width + 10)
      }

      if (!d) {
        !g && (g = h(e.childs))
        d = 2 * g.height
      }

      !b && (b = "down")

      let k = self.getRootNodes(e.childs)

      if (k.length > 0) {
        f(e.childs, k[0])

        let l = getElementsBound(e.childs)
        let m = e.getCenterLocation()
        let n = m.x - (l.left + l.right) / 2
        let o = m.y - (l.top + l.bottom) / 2

        e.childs.forEach(function (b) {
          if (b instanceof Node) {
            b.x += n
            b.y += o
          }
        })
      }
    }
  },
  circleLayoutNodes: function (c, d) {
    !d && (d = {})

    let cx = d.cx
    let cy = d.cy
    let minRadius = d.minRadius
    let nodeDiameter = d.nodeDiameter
    let hScale = d.hScale || 1
    let vScale = d.vScale || 1

    if (!cx || !cy) {
      const cPointOfNodes = this.getNodesCenter(c)

      cx = cPointOfNodes.x
      cy = cPointOfNodes.y
    }

    let l = 0
    const m = []
    const n = []

    c.forEach(function (a) {
      if (!d.nodeDiameter) {
        a.diameter && (nodeDiameter = a.diameter)

        nodeDiameter = a.radius
          ? 2 * a.radius
          : Math.sqrt(2 * a.width * a.height)

        n.push(nodeDiameter)
      } else {

        n.push(nodeDiameter)
        l += nodeDiameter
      }
    })

    c.forEach(function (a, b) {
      const c = n[b] / l
      m.push(Math.PI * c)
    })

    const o = m[0] + m[1]
    const p = n[0] / 2 + n[1] / 2

    let q = p / 2 / Math.sin(o / 2)

    minRadius && minRadius > q && (q = minRadius)

    const r = q * hScale
    const s = q * vScale
    const t = d.animate

    if (t) {
      let u = t.time || 1e3
      let v = 0

      c.forEach(function (b, c) {
        v += 0 === c ? m[c] : m[c - 1] + m[c]

        const d = cx + Math.cos(v) * r
        const g = cy + Math.sin(v) * s

        Animate
          .stepByStep(b, {
            x: d - b.width / 2,
            y: g - b.height / 2
          }, u)
          .start()
      })
    }
    else {
      let v = 0

      c.forEach(function (a, i) {
        v += 0 === i ? m[i] : m[i - 1] + m[i]

        const c = cx + Math.cos(v) * r
        const d = cy + Math.sin(v) * s

        a.cx = c
        a.cy = d
      })
    }

    return {
      cx: cx,
      cy: cy,
      radius: r,
      radiusA: r,
      radiusB: s
    }
  }
}
