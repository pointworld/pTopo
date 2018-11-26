const canvas = document.createElement('canvas')

export default {
  canvas,
  graphics: canvas.getContext('2d'),
  // 是否清除所有动画
  clearAllAnimateT: false,
  // 当前场景
  curScene: null,
  // 线条配置
  linkConfigure: {
    // 文字是否倾斜显示
    textIsTilt: false,
    // 线条名字是否靠近 NodeZ
    textIsNearToNodeZ: false,
  },
  // 节点配置
  nodeConfigure: {
    // 鼠标在节点上 hover 是的背景
    hoverBg: "rgba(168, 202, 255, 0.5)",
  },
  // 告警图片缓存
  alarmImageCache: {},
  // 拓扑图片映射
  topoImgMap: null,
}
