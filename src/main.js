import '../src/core/init'
import * as Element from './core/element/index'
import * as Link from './core/link/index'
import * as Node from './core/node/index'
import Container from './core/container/index'
import Scene from './core/scene/index'
import Stage from './core/stage/index'
import Layout from './core/layout/index'
import Effect from './core/effect/index'
import Animate from './core/animate/index'
import EventEmitter from './core/events/index'
import * as util from './shared/util'
import {version} from '../package.json'

const PTopo = Object.assign({
  version: version,
  createStageFromJson(jsonStr, canvas) {
    const jsonObj = JSON.parse(jsonStr)

    const stage = new Stage(canvas)

    for (let key in jsonObj) {
      'childs' !== key
      && (stage[key] = jsonObj[key])
    }

    const scenes = jsonObj.childs

    scenes.forEach(function (scene) {
      const sceneInstance = new Scene(stage)

      for (let key1 in scene) {
        "childs" !== key1
        && (sceneInstance[key1] = scene[key1])

        "background" === key1
        && (sceneInstance.background = scene[key1])
      }

      const nodes = scene.childs

      nodes.forEach(function (node) {
        let newNode = null
        const elementType = node.elementType

        'node' === elementType
          ? newNode = new Node
          : 'CircleNode' === elementType && (newNode = new CircleNode)

        for (let i in node) {
          newNode[i] = node[i]
        }

        sceneInstance.add(newNode)
      })
    })

    return stage
  }
}, {
  EventEmitter,
  util,
  ...Element,
  ...Link,
  ...Node,
  Container,
  Scene,
  Stage,
  Layout,
  Effect,
  Animate,
})

window.PTopo = PTopo
