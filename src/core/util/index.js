import Stage from '../stage/index'
import Scene from '../scene/index'
import Node from '../node/Node'
import flag from '../flag'
import Animate from '../animate/index'
import {MouseCursor} from "../../shared/constants"

const canvas = document.createElement("canvas")

// 将舞台数据序列化为 json 字符串
export function toJson(stage) {
  const scenePropertiesArr = "backgroundColor,visible,mode,rotate,alpha,scaleX,scaleY,shadow,translateX,translateY,areaSelect,paintAll".split(",")
  const nodePropertiesArr = "text,elementType,x,y,width,height,visible,alpha,rotate,scaleX,scaleY,fillColor,shadow,transformAble,zIndex,dragable,selected,showSelected,font,fontColor,textPosition,textOffsetX,textOffsetY".split(",")

  let stageJson = "{"

  stageJson += "frames:" + stage.frames
  stageJson += ", scenes:["

  for (let i = 0; i < stage.childs.length; i++) {
    const scene = stage.childs[i]

    stageJson += "{"
    stageJson += getProperties(scene, scenePropertiesArr)
    stageJson += ", elements:["

    for (let j = 0; j < scene.childs.length; j++) {
      const node = scene.childs[j]

      j > 0 && (stageJson += ",")
      stageJson += "{"
      stageJson += getProperties(node, nodePropertiesArr)
      stageJson += "}"
    }

    stageJson += "]}"
  }

  stageJson += "]"
  stageJson += "}"

  return stageJson
}
// 根据 json 数据加载当前舞台
export function loadStageFromJson(json, canvas) {
  const obj = JSON.parse(json)
  const stage = new Stage(canvas)

  for (let k in obj) {
    if ("scenes" !== k) {
      stage[k] = obj[k]
    } else {
      const scenes = obj.scenes

      for (let i = 0; i < scenes.length; i++) {
        const sceneObj = scenes[i]
        const scene = new Scene(stage)

        for (let p in sceneObj) {
          if ("elements" !== p) {
            scene[p] = sceneObj[p]
          } else {
            const nodeMap = {}
            const elements = sceneObj.elements

            for (let m = 0; m < elements.length; m++) {
              const elementObj = elements[m]
              const type = elementObj.elementType
              let element

              "Node" === type && (element = new Node)

              for (let mk in elementObj) {
                element[mk] = elementObj[mk]
              }

              nodeMap[element.text] = element
              scene.add(element)
            }
          }
        }
      }
    }
  }

  return stage
}


// 节点闪烁处理
export function nodeFlash(node, isChangeColor, isFlash, oriColor, changeColor) {
  node.nodeOriginColor = oriColor
  node.alarm = isChangeColor ? "true" : null
  node.fillAlarmNode = changeColor
  node.setImage('changeColor')

  node.flashT && clearInterval(node.flashT)

  if (isChangeColor && isFlash) {
    let i = 1
    let tag = null

    node.flashT = setInterval(function () {
      tag = ++i % 2

      node.alarm = tag ? "true" : null

      if (flag.clearAllAnimateT) {
        clearInterval(node.flashT)
      }
    }, 1000)
  }
}
export function smallNodeFlash(node, isChangeColor, isFlash, oriColor, changeColor) {
  node.smallImageOriginColor = oriColor
  node.smallImageChangeColor = changeColor
  node.smallAlarmImageTag = isChangeColor ? "true" : null

  node.setImage('changeSmallImageColor')

  node.samllflashT && clearInterval(node.samllflashT)

  if (isChangeColor && isFlash) {
    let i = 1
    let tag = null

    node.samllflashT = setInterval(function () {
      tag = ++i % 2
      node.smallAlarmImageTag = tag ? "true" : null

      if (flag.clearAllAnimateT) {
        clearInterval(node.samllflashT)
      }
    }, 1000)
  }
}

// 通过类型（如 node, link）获取元素
export function findEleByType(type) {
  return flag.curScene.childs.filter(function (child) {
    return (child.elementType === type)
  })
}


export function setPopPos($pop, _nodeId, subW, subH, $scroll) {
  const _subW = subW || 0
  const _subH = subH || 0
  const nodeId = _nodeId

  const canvas = document.getElementById('canvas')
  const left = canvas.offset().left
  const _top = canvas.offset().top

  const curSceneScaleXRate = flag.curScene.scaleX
  const canvasW = canvas.width()
  const canvasH = canvas.height()

  let targetNode = null

  let px = null
  let py = null

  const scrollTop = $scroll ? $scroll.scrollTop() : 0

  flag.curScene.childs.filter(function (child) {
    if (child.id === nodeId) {
      targetNode = child

      if (targetNode.elementType === 'link') {
        px = (targetNode.nodeA.x + targetNode.nodeZ.x) * 0.5
        py = (targetNode.nodeA.y + targetNode.nodeZ.y) * 0.5
      } else {
        px = targetNode.x + targetNode.width
        py = targetNode.y
      }
    }
  })

  const popLeft = (1 - curSceneScaleXRate) * canvasW * 0.5
    + (px + flag.curScene.translateX) * curSceneScaleXRate
    + left
    + _subW
  const popTop = (1 - curSceneScaleXRate) * canvasH * 0.5
    + (py + flag.curScene.translateY) * curSceneScaleXRate
    + _top
    + _subH
    + scrollTop

  $pop.css({
    left: popLeft,
    top: popTop,
  })
}
export function moveElePosByContainerBorder(eleObj, isOpen, callback) {
  flag.curScene.childs.forEach(function (p) {
    let subValue = eleObj.width

    if (!isOpen) {
      eleObj.x += subValue
    }

    if (
      p.elementType === 'node'
      && (p.x >= eleObj.x && p.y >= eleObj.y)
    ) {
      Animate
        .stepByStep(p, {x: p.x - subValue}, 300, false)
        .start()
    }
  })

  callback && callback()
}
// 通过元素 id 获取元素
export function findEleById(id) {
  const idTypeName = id.indexOf('front') >= 0
    ? '_id'
    : 'id'

  return flag.curScene.childs.filter(function (child) {
    return (child[idTypeName] === id)
  })[0]
}
// 鼠标光标的样式
export function setImageUrl(url) {
  flag.imageUrl = url

  if (flag.topoImgMap) {
    MouseCursor.open_hand = "default"
    MouseCursor.closed_hand = "default"
  } else {
    MouseCursor.open_hand = "url(" + url + "openhand.cur) 8 8, default"
    MouseCursor.closed_hand = "url(" + url + "closedhand.cur) 8 8, default"
  }
}
// 获取图片告警
export function getImageAlarm(imgEle, b, tarColor, oriColor) {
  !b && (b = 255)

  try {
    const image = new Image
    const alarmImage = flag.alarmImageCache[imgEle.src + 'tag' + tarColor[0] + tarColor[1] + tarColor[2]]

    if (alarmImage) {
      image.src = alarmImage

      return image
    }

    if (tarColor && oriColor) {
      image.src = changeColor(
        graphics,
        imgEle,
        tarColor[0],
        tarColor[1],
        tarColor[2],
        oriColor[0],
        oriColor[1],
        oriColor[2]
      )
    }
    else {
      image.src = changeColor(graphics, imgEle, b)
    }

    return image
  } catch (e) {
  }

  return null
}
export function changeColor(ctx, imgEle, tarR, tarG, tarB, oriR, oriG, oriB) {
  const cW = canvas.width = imgEle.width
  const cH = canvas.height = imgEle.height

  ctx.clearRect(0, 0, cW, cH)
  ctx.drawImage(imgEle, 0, 0)

  const imgData = ctx.getImageData(0, 0, cW, cH)
  const imgInnerData = imgData.data

  for (let i = 0; i < cW; i++) {
    for (let j = 0; j < cH; j++) {
      const n = 4 * (i + j * cW)

      if (
        (oriR || oriG || oriB)
        && (
          imgInnerData[n] === oriR
          && imgInnerData[n + 1] === oriG
          && imgInnerData[n + 2] === oriB
        )
      ) {
        imgInnerData[n] = tarR
        imgInnerData[n + 1] = tarG
        imgInnerData[n + 2] = tarB
      }
    }

    ctx.putImageData(imgData, 0, 0, 0, 0, imgEle.width, imgEle.height)
  }

  const url = canvas.toDataURL()

  if (
    oriR !== undefined
    || oriG !== undefined
    || oriB !== undefined
  ) {
    flag.alarmImageCache[imgEle.src + 'tag' + tarR + tarG + tarB] = url
  }

  return url
}





