import {getEventPosition, getOffsetPosition, cloneEvent} from '../../shared/util'
import EventEmitter from '../events/index'
import Scene from '../scene/index'
import {version} from '../../../package.json'

export default class Stage {
  constructor(canvas) {
    // 鹰眼的实现
    function eagleEye(stage) {
      return {
        hgap: 16,
        visible: false,
        exportCanvas: document.createElement("canvas"),
        // 获取鹰眼图像
        getImage(width, height) {
          const boundary = stage.getBound()
          let scaleWidth = 1
          let scaleHeight = 1

          this.exportCanvas.width = stage.canvas.width
          this.exportCanvas.height = stage.canvas.height

          if (width && height) {
            this.exportCanvas.width = width
            this.exportCanvas.height = height
            scaleWidth = width / boundary.width
            scaleHeight = height / boundary.height
          }
          else {
            boundary.width > stage.canvas.width
            && (this.exportCanvas.width = boundary.width)
            boundary.height > stage.canvas.height
            && (this.exportCanvas.height = boundary.height)
          }

          const ctx = this.exportCanvas.getContext("2d")

          if (stage.childs.length) {
            ctx.save()
            ctx.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height)

            stage.childs.forEach(function (scene) {
              if (scene.visible) {
                scene.save()
                scene.translateX = 0
                scene.translateY = 0
                scene.scaleX = 1
                scene.scaleY = 1
                ctx.scale(scaleWidth, scaleHeight)
                boundary.left < 0 && (scene.translateX = Math.abs(boundary.left))
                boundary.top < 0 && (scene.translateY = Math.abs(boundary.top))
                scene.paintAll = true
                scene.repaint(ctx)
                scene.paintAll = false
                scene.restore()
              }
            })

            ctx.restore()

            return this.exportCanvas.toDataURL("image/png")
          }
        },
        canvas: document.createElement("canvas"),
        // 更新鹰眼图像的数据
        update() {
          this.eagleImageDatas = this.getData(stage)
        },
        // 设置鹰眼区域的大小
        setSize(w, h) {
          this.width = this.canvas.width = w
          this.height = this.canvas.height = h
        },
        // 获取鹰眼图像的数据
        getData(w, h) {
          const ctx = this.canvas.getContext("2d")

          w && h
            ? this.setSize(w, h)
            : this.setSize(200, 160)

          function getTranslateObj(scene) {
            const canvasW = scene.stage.canvas.width
            const canvasH = scene.stage.canvas.height
            const x = canvasW / scene.scaleX / 2
            const y = canvasH / scene.scaleY / 2

            return {
              translateX: scene.translateX + x - x * scene.scaleX,
              translateY: scene.translateY + y - y * scene.scaleY,
            }
          }

          if (stage.childs.length) {
            ctx.save()
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            stage.childs.forEach(function (scene) {
              if (scene.visible) {
                scene.save()
                scene.centerAndZoom(null, null, ctx)
                scene.repaint(ctx, 'eagleEye')
                scene.restore()
              }
            })

            let translateObj = getTranslateObj(stage.childs[0])

            let translateX = translateObj.translateX
              * (this.canvas.width / stage.canvas.width)
              * stage.childs[0].scaleX
            let translateY = translateObj.translateY
              * (this.canvas.height / stage.canvas.height)
              * stage.childs[0].scaleY

            let stageBoundary = stage.getBound()

            let w = stage.canvas.width
              / stage.childs[0].scaleX
              / stageBoundary.width

            let h = stage.canvas.height
              / stage.childs[0].scaleY
              / stageBoundary.height

            w > 1 && (w = 1)
            h > 1 && (h = 1)

            translateX *= w
            translateY *= h

            stageBoundary.left < 0
            && (
              translateX -= Math.abs(stageBoundary.left)
                * (this.width / stageBoundary.width)
            )

            stageBoundary.top < 0
            && (
              translateY -= Math.abs(stageBoundary.top)
                * (this.height / stageBoundary.height)
            )

            ctx.save()
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(255,0,0,1)'
            ctx.strokeRect(
              -translateX,
              -translateY,
              this.canvas.width * w,
              this.canvas.height * h
            )
            ctx.restore()

            let imgData = null

            try {
              imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
            } catch (err) {

            }

            return imgData
          }

          return null
        },
        // 将获取的鹰眼图像数据绘制到一个创建好的 canvas 上
        paint() {
          if (this.eagleImageDatas) {
            const ctx = stage.graphics

            ctx.save()
            ctx.fillStyle = "rgba(211,211,211,0.3)"

            ctx.fillRect(
              stage.canvas.width - this.canvas.width - 2 * this.hgap,
              stage.canvas.height - this.canvas.height - 1,
              stage.canvas.width - this.canvas.height,
              this.canvas.height + 1
            )

            ctx.fill()
            ctx.save()

            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(0,0,0,1)'

            ctx.rect(
              stage.canvas.width - this.canvas.width - 2 * this.hgap,
              stage.canvas.height - this.canvas.height - 1,
              stage.canvas.width - this.canvas.height,
              this.canvas.height + 1
            )

            ctx.stroke()

            ctx.restore()

            ctx.putImageData(
              this.eagleImageDatas,
              stage.canvas.width - this.canvas.width - this.hgap,
              stage.canvas.height - this.canvas.height
            )

            ctx.restore()
          }
          else {
            this.eagleImageDatas = this.getData(stage)
          }
        },
        // 事件处理器
        eventHandler(eName, eObj, stage) {
          let eX = eObj.x
          let eY = eObj.y

          if (
            eX > stage.canvas.width - this.canvas.width
            && eY > stage.canvas.height - this.canvas.height
          ) {
            eX = eObj.x - this.canvas.width
            eY = eObj.y - this.canvas.height

            if ("mousedown" === eName) {
              this.lastTranslateX = stage.childs[0].translateX
              this.lastTranslateY = stage.childs[0].translateY
            }

            if (
              "mousedrag" === eName
              && stage.childs.length > 0
            ) {
              const dx = eObj.dx
              const dy = eObj.dy
              const stageBoundary = stage.getBound()
              const x = this.canvas.width / stage.childs[0].scaleX / stageBoundary.width
              const y = this.canvas.height / stage.childs[0].scaleY / stageBoundary.height

              stage.childs[0].translateX = this.lastTranslateX - dx / x
              stage.childs[0].translateY = this.lastTranslateY - dy / y
            }
          }
        },
      }
    }

    if (canvas) {
      this.initEvent(canvas)
      this.canvas = canvas
      this.graphics = canvas.getContext("2d")
      this.childs = []
      this.frames = 24
      this.eventEmitter = new EventEmitter
      this.eagleEye = eagleEye(this)
      this.wheelZoom = null
      this.mouseDownX = 0
      this.mouseDownY = 0
      this.mouseDown = false
      this.mouseOver = false
      this.needRepaint = true
      this.serializedProperties = ["frames", "wheelZoom"]
      this.mode = ''
    }
  }

  // 初始化事件
  initEvent(ele) {
    const self = this
    let timer = null
    let isShowContextmenu = true

    document.oncontextmenu = function () {
      return isShowContextmenu
    }

    function getEventObj(e) {
      const eObj = getEventPosition(e)
      const offsetPosObj = getOffsetPosition(canvas)

      eObj.offsetLeft = eObj.pageX - offsetPosObj.left
      eObj.offsetTop = eObj.pageY - offsetPosObj.top
      eObj.x = eObj.offsetLeft
      eObj.y = eObj.offsetTop
      eObj.target = null

      return eObj
    }

    ele.addEventListener("mouseout", function (e) {
      timer = setTimeout(function () {
        isShowContextmenu = true
      }, 500)

      document.onselectstart = function () {
        return true
      }

      const eObj = getEventObj(e)

      self.dispatchEventToScenes("mouseout", eObj)
      self.dispatchEvent("mouseout", eObj)
      self.needRepaint = !!self.animate
    })
    ele.addEventListener("mouseover", function (e) {
      document.onselectstart = function () {
        return false
      }

      self.mouseOver = true

      const eventObj = getEventObj(e)

      self.dispatchEventToScenes("mouseover", eventObj)
      self.dispatchEvent("mouseover", eventObj)
    })
    ele.addEventListener("mousedown", function (e) {
      const eObj = getEventObj(e)

      self.mouseDown = true
      self.mouseDownX = eObj.x
      self.mouseDownY = eObj.y
      self.dispatchEventToScenes("mousedown", eObj)
      self.dispatchEvent("mousedown", eObj)
    })
    ele.addEventListener("mouseup", function (e) {
      const eObj = getEventObj(e)

      self.dispatchEventToScenes("mouseup", eObj)
      self.dispatchEvent("mouseup", eObj)
      self.mouseDown = false
      self.needRepaint = !!self.animate
    })
    ele.addEventListener("mousemove", function (e) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      isShowContextmenu = false

      const eObj = getEventObj(e)

      if (self.mouseDown) {
        if (0 === e.button) {
          eObj.dx = eObj.x - self.mouseDownX
          eObj.dy = eObj.y - self.mouseDownY
          self.dispatchEventToScenes("mousedrag", eObj)
          self.dispatchEvent("mousedrag", eObj)

          self.eagleEye.visible && self.eagleEye.update()
        }
      }
      else {
        self.dispatchEventToScenes("mousemove", eObj)
        self.dispatchEvent("mousemove", eObj)
      }
    })
    ele.addEventListener("click", function (e) {
      const eObj = getEventObj(e)

      self.dispatchEventToScenes("click", eObj)
      self.dispatchEvent("click", eObj)
    })
    ele.addEventListener("dblclick", function (e) {
      const eObj = getEventObj(e)

      self.dispatchEventToScenes("dbclick", eObj)
      self.dispatchEvent("dbclick", eObj)
    })
    ele.addEventListener("mousewheel", function (e) {
      const eObj = getEventObj(e)

      self.dispatchEventToScenes("mousewheel", eObj)
      self.dispatchEvent("mousewheel", eObj)

      if (self.wheelZoom) {
        if (e.preventDefault) {
          e.preventDefault()
        }
        else {
          e = e || window.event
          e.returnValue = false
        }

        self.eagleEye.visible && self.eagleEye.update()
      }
    })

    window.addEventListener("keydown", function (e) {
      self.dispatchEventToScenes("keydown", cloneEvent(e))

      const keyCode = e.keyCode

      if (
        37 === keyCode
        || 38 === keyCode
        || 39 === keyCode
        || 40 === keyCode
      ) {
        if (e.preventDefault) {
          e.preventDefault()
        }
        else {
          e = e || window.event
          e.returnValue = false
        }
      }

    }, true)
    window.addEventListener("keyup", function (e) {
      self.dispatchEventToScenes("keyup", cloneEvent(e))

      const keyCode = e.keyCode

      if (
        37 === keyCode
        || 38 === keyCode
        || 39 === keyCode
        || 40 === keyCode
      ) {
        if (e.preventDefault) {
          e.preventDefault()
        }
        else {
          e = e || window.event
          e.returnValue = false
        }
      }
    }, true)

    // TODO: need to optimizate
    !(function hahaha() {
      if (!self.frames) {
        setTimeout(hahaha, 100)
      }
      else {
        if (self.frames < 0) {
          self.repaint()
          setTimeout(hahaha, 1e3 / -self.frames)
        }
        else {
          self.repaint()
          setTimeout(hahaha, 1e3 / self.frames)
        }
      }
    })()

    setTimeout(function () {
      self.mousewheel(function (a) {
        let b = !a.wheelDelta
          ? a.detail
          : a.wheelDelta

        this.wheelZoom && (
          b > 0
            ? this.zoomIn(this.wheelZoom)
            : this.zoomOut(this.wheelZoom)
        )
      })
      self.paint()
    }, 300)
    setTimeout(function () {
      self.paint()
    }, 1e3)
    setTimeout(function () {
      self.paint()
    }, 3e3)
  }

  // 给场景分配事件
  dispatchEventToScenes(eName, eObj) {
    this.frames && (this.needRepaint = true)

    if (
      this.eagleEye.visible
      && -1 !== eName.indexOf("mouse")
    ) {
      let eX = eObj.x
      let eY = eObj.y

      if (
        eX > this.width - this.eagleEye.width
        && eY > this.height - this.eagleEye.height
      ) {
        this.eagleEye.eventHandler(eName, eObj, this)

        return
      }
    }

    this.childs.forEach(function (scene) {
      if (scene.visible) {
        const eHandler = scene[eName + "Handler"]

        if (!eHandler) {
          throw new Error("Function not found:" + eName + "Handler")
        }

        eHandler.call(scene, eObj)
      }
    })
  }

  // 添加场景到舞台
  add(scene) {
    for (let i = 0, len = this.childs.length; i < len; i++) {
      if (this.childs[i] === scene) return
    }

    scene.addTo(this)
    this.childs.push(scene)
  }

  // 从舞台中移除某个场景
  remove(scene) {
    if (!scene) {
      throw new Error("the argument of Stage.remove cannot be null!")
    }

    for (let i = 0, len = this.childs.length; i < len; i++) {
      if (this.childs[i] === scene) {
        scene.stage = null
        this.childs = this.childs.del(i)
      }
    }

    return this
  }

  // 清除所有场景
  clear() {
    this.childs = []
  }

  addEventListener(eName, cb) {
    const self = this
    const fn = function (eObj) {
      cb.call(self, eObj)
    }

    this.eventEmitter.subscribe(eName, fn)

    return this
  }

  removeEventListener(eName) {
    this.eventEmitter.unsubscribe(eName)
  }

  removeAllEventListener() {
    this.eventEmitter = new EventEmitter
  }

  dispatchEvent(eName, eObj) {
    this.eventEmitter.publish(eName, eObj)

    return this
  }

  // 保存图片信息（即导出当前 canvas 到一个新的页面）
  saveImageInfo(w, h) {
    const dataUrl = this.eagleEye.getImage(w, h)
    const newWindow = window.open("about:blank")

    newWindow.document.write("<img src='" + dataUrl + "' alt='from canvas'/>")

    return this
  }

  // 将当前 canvas 保存为本地图片
  saveAsLocalImage(w, h) {
    const dataUrl = this.eagleEye.getImage(w, h)

    dataUrl.replace("image/png", "image/octet-stream")
    window.location.href = dataUrl

    return this
  }

  paint() {
    let self = this

    if (self.canvas) {
      self.graphics.save()
      self.graphics.clearRect(0, 0, self.width, self.height)
      self.childs.forEach(function (scene) {
        scene.visible && scene.repaint(self.graphics)
      })
      self.eagleEye.visible && self.eagleEye.paint(self)
      self.graphics.restore()
    }
  }

  repaint() {
    if (this.frames) {
      if (
        this.frames
        || this.needRepaint
      ) {
        this.paint()
        this.frames < 0 && (this.needRepaint = false)
      }
    }
  }

  // 缩放当前场景
  zoom(scale) {
    this.childs.forEach(function (scene) {
      scene.visible && scene.zoom(scale)
    })
  }

  // 放大当前场景
  zoomOut(scale) {
    this.childs.forEach(function (scene) {
      scene.visible && scene.zoomOut(scale)
    })
  }

  // 缩小当前场景
  zoomIn(scale) {
    this.childs.forEach(function (scene) {
      scene.visible && scene.zoomIn(scale)
    })
  }

  // 重置当前场景的缩放比
  zoomReset() {
    this.childs.forEach(function (scene) {
      scene.visible && scene.zoomReset()
    })
  }

  // 居中和缩放当前场景
  centerAndZoom() {
    this.childs.forEach(function (scene) {
      scene.visible && scene.centerAndZoom()
    })
  }

  // 设置场景偏移量到舞台中心点
  setCenter(x, y) {
    this.childs.forEach(function (scene) {
      let translateX = x - this.canvas.width / 2
      let translateY = y - this.canvas.height / 2

      scene.translateX = -translateX
      scene.translateY = -translateY
    })
  }

  // 获取舞台中所有场景元素的边界
  getBound() {
    const allSceneBoundary = {
      left: Number.MAX_VALUE,
      right: Number.MIN_VALUE,
      top: Number.MAX_VALUE,
      bottom: Number.MIN_VALUE,
    }

    this.childs.forEach(function (scene) {
      const allEleBoundary = scene.getElementsBound()

      if (allEleBoundary.left < allSceneBoundary.left) {
        allSceneBoundary.left = allEleBoundary.left
        allSceneBoundary.leftNode = allEleBoundary.leftNode
      }

      if (allEleBoundary.top < allSceneBoundary.top) {
        allSceneBoundary.top = allEleBoundary.top
        allSceneBoundary.topNode = allEleBoundary.topNode
      }

      if (allEleBoundary.right > allSceneBoundary.right) {
        allSceneBoundary.right = allEleBoundary.right
        allSceneBoundary.rightNode = allEleBoundary.rightNode
      }

      if (allEleBoundary.bottom > allSceneBoundary.bottom) {
        allSceneBoundary.bottom = allEleBoundary.bottom
        allSceneBoundary.bottomNode = allEleBoundary.bottomNode
      }
    })

    allSceneBoundary.width = allSceneBoundary.right - allSceneBoundary.left
    allSceneBoundary.height = allSceneBoundary.bottom - allSceneBoundary.top

    return allSceneBoundary
  }

  // 序列化舞台，并返回一个 json 字符串
  toJson() {
    let self = this
    let jsonStr = '{"version":"' + version + '",'

    this.serializedProperties.forEach(function (prop) {
      let val = self[prop]

      "string" === typeof val && (val = '"' + val + '"')
      jsonStr += '"' + prop + '":' + val + ","
    })

    jsonStr += '"childs":['
    this.childs.forEach(function (a) {
      jsonStr += a.toJson()
    })
    jsonStr += "]"
    jsonStr += "}"

    return jsonStr
  }

  // 搜索并返回舞台中找到的场景
  find(cbOrCond) {
    let eNameArr1 = "click,mousedown,mouseup,mouseover,mouseout,mousedrag,keydown,keyup".split(",")

    function getFilteredScenes(scenes, filterCond) {
      let arr = []

      if (!scenes.length) return arr

      let reArr = filterCond.match(/^\s*(\w+)\s*$/)

      if (reArr) {
        let result = scenes.filter(function (scene) {
          return scene.elementType === reArr[1]
        })

        result && result.length && (arr = arr.concat(result))
      }
      else {
        let sign = false

        reArr = filterCond.match(/\s*(\w+)\s*\[\s*(\w+)\s*([>=<])\s*['"](\S+)['"]\s*]\s*/)

        if (
          !reArr
          || reArr.length < 5
        ) {
          reArr = filterCond.match(/\s*(\w+)\s*\[\s*(\w+)\s*([>=<])\s*(\d+(\.\d+)?)\s*]\s*/)
          sign = true
        }

        if (reArr && reArr.length >= 5) {
          const eleType = reArr[1]
          const h = reArr[2]
          const i = reArr[3]
          const j = reArr[4]

          eNameArr1 = scenes.filter(function (scene) {
            if (scene.elementType !== eleType) return false

            let b = scene[h]

            sign && (b = parseInt(b))

            switch (i) {
              case '=':
                return b === j
              case '>':
                return b > j
              case '<':
                return j > b
              case '<=':
                return j >= b
              case '>=':
                return b >= j
              case '!=':
                return b !== j
              default:
                return false
            }
          })

          eNameArr1
          && eNameArr1.length
          && (arr = arr.concat(eNameArr1))
        }
      }

      return arr
    }

    function getFinalFilteredScenes(filteredScenes) {
      filteredScenes.find = function (scene) {
        return find.call(this, scene)
      }

      eNameArr1.forEach(function (eName) {
        filteredScenes[eName] = function (a) {

          for (let i = 0; i < this.length; i++) {
            this[i][eName](a)
          }

          return this
        }
      })

      if (filteredScenes.length) {
        let firstScene = filteredScenes[0]

        for (let k in firstScene) {
          let v = firstScene[k]

          "function" === typeof v
          && !function (fn) {
            filteredScenes[k] = function () {
              let c = []

              for (let i = 0; i < filteredScenes.length; i++) {
                c.push(fn.apply(filteredScenes[i], arguments))
              }

              return c
            }
          }(v)
        }
      }

      filteredScenes.attr = function (k, v) {
        if (k && v) {
          for (let i = 0; i < this.length; i++) {
            this[i][k] = v
          }
        }
        else {
          if (k && "string" === typeof k) {
            let d = []

            for (let i = 0; i < this.length; i++) {
              d.push(this[i][k])
            }

            return d
          }

          if (k) {
            for (let i = 0; i < this.length; i++) {
              for (let e in k) {
                this[i][e] = k[e]
              }
            }
          }
        }

        return this
      }

      return filteredScenes
    }

    let scenes = []
    let scenes1 = []

    if (this instanceof Stage) {
      scenes = this.childs
      scenes1 = scenes1.concat(scenes)
    }
    else {
      this instanceof Scene
        ? scenes = [this]
        : scenes1 = this

      scenes.forEach(function (a) {
        scenes1 = scenes1.concat(a.childs)
      })
    }

    let filteredScenes = "function" === typeof cbOrCond
      ? scenes1.filter(cbOrCond)
      : getFilteredScenes(scenes1, cbOrCond)

    return getFinalFilteredScenes(filteredScenes)
  }

  // 获取舞台宽度
  get width() {
    return this.canvas.width
  }

  // 获取舞台高度
  get height() {
    return this.canvas.height
  }

  // 设置鼠标显示样式
  set cursor(shape) {
    this.canvas.style.cursor = shape
  }

  // 返回鼠标显示样式
  get cursor() {
    return this.canvas.style.cursor
  }

  // 设置场景模式
  set mode(m) {
    this.childs.forEach(function (scene) {
      scene.mode = m
    })
  }

  click(fn) {
    fn
      ? this.addEventListener('click', fn)
      : this.dispatchEvent('click')
  }

  dbclick(fn) {
    fn
      ? this.addEventListener('dbclick', fn)
      : this.dispatchEvent('dbclick')
  }

  mousedown(fn) {
    fn
      ? this.addEventListener('mousedown', fn)
      : this.dispatchEvent('mousedown')
  }

  mouseup(fn) {
    fn
      ? this.addEventListener('mouseup', fn)
      : this.dispatchEvent('mouseup')
  }

  mouseover(fn) {
    fn
      ? this.addEventListener('mouseover', fn)
      : this.dispatchEvent('mouseover')
  }

  mouseout(fn) {
    fn
      ? this.addEventListener('mouseout', fn)
      : this.dispatchEvent('mouseout')
  }

  mousemove(fn) {
    fn
      ? this.addEventListener('mousemove', fn)
      : this.dispatchEvent('mousemove')
  }

  mousedrag(fn) {
    fn
      ? this.addEventListener('mousedrag', fn)
      : this.dispatchEvent('mousedrag')
  }

  mousewheel(fn) {
    fn
      ? this.addEventListener('mousewheel', fn)
      : this.dispatchEvent('mousewheel')
  }

  touchstart(fn) {
    fn
      ? this.addEventListener('touchstart', fn)
      : this.dispatchEvent('touchstart')
  }

  touchmove(fn) {
    fn
      ? this.addEventListener('touchmove', fn)
      : this.dispatchEvent('touchmove')
  }

  touchend(fn) {
    fn
      ? this.addEventListener('touchend', fn)
      : this.dispatchEvent('touchend')
  }

  keydown(fn) {
    fn
      ? this.addEventListener('keydown', fn)
      : this.dispatchEvent('keydown')
  }

  keyup(fn) {
    fn
      ? this.addEventListener('keyup', fn)
      : this.dispatchEvent('keyup')
  }
}
