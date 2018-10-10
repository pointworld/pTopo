const canvas = document.createElement('canvas')

export default {
  canvas,
  graphics: canvas.getContext('2d'),
  clearAllAnimateT: false,
  curScene: null,
  linkConfigure: {
    textIsTilt: false,
    textIsNearToNodeZ: false,
  },
  nodeConfigure: {
    hoverBg: "rgba(168, 202, 255, 0.5)",
  },
  alarmImageCache: {},
  topoImgMap: null,
}
