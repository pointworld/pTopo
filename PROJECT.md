# pTopo

## 目录结构
```text
pTopo/
|
+- api/ <-- API 文档
|
+- demo/ <-- pTopo 相关 demo
|
+- dist/ <-- 存放打包时生成的 pTopo.js 文件
|
+- scripts/ <-- 存放和 rollup 相关的打包脚本
|
+-  src/ <-- pTopo 项目的源文件
|  |
|  +- core/ <-- 存放处理后的 CSS 文件
|  |  |
|  |  +- animate/ <-- 动画的实现
|  |  |
|  |  +- container/ <-- 容器的实现
|  |  |
|  |  +- effect/ <-- 特效的实现
|  |  |
|  |  +- element/ <-- 元素的实现
|  |  |  |
|  |  |  +- DisplayElement.js <-- DisplayElement 的实现
|  |  |  |
|  |  |  +- EditableElement.js <-- EditableElement 的实现
|  |  |  |
|  |  |  +- Element.js <-- Element 的实现
|  |  |  |
|  |  |  +- index.js <-- 入口
|  |  |  |
|  |  |  +- InteractiveElement.js <-- InteractiveElement 的实现
|  |  |
|  |  +- events/ <-- 事件机制
|  |  |
|  |  +- group/ <-- 组的实现（未实现，和容器 Container 是一个东西）
|  |  |
|  |  +- layout/ <-- 布局的实现
|  |  |
|  |  +- link/ <-- 连线的实现
|  |  |  |
|  |  |  +- CurveLink.js <-- 曲线
|  |  |  |
|  |  |  +- FlexionalLink.js <-- 二次折线
|  |  |  |
|  |  |  +- FoldLink.js <-- 折线
|  |  |  |
|  |  |  +- index.js <-- 入口
|  |  |  |
|  |  |  +- Link.js <-- 普通连线
|  |  |  |
|  |  |  +- util.js <-- 连线相关工具函数
|  |  |
|  |  +- node/ <-- 节点的实现
|  |  |  |
|  |  |  +- _Node.js <-- 节点
|  |  |  |
|  |  |  +- AnimateNode.js <-- 动画节点
|  |  |  |
|  |  |  +- BarChartNode.js <-- 条形图节点
|  |  |  |
|  |  |  +- CircleNode.js <-- 圆形节点
|  |  |  |
|  |  |  +- index.js <-- 入口
|  |  |  |
|  |  |  +- LinkNode.js <-- 链接节点
|  |  |  |
|  |  |  +- Node.js <-- 普通节点
|  |  |  |
|  |  |  +- PieChartNode.js <-- 饼状图节点
|  |  |  |
|  |  |  +- TextNode.js <-- 文本节点
|  |  |  |
|  |  |  +- util.js <-- 节点相关工具函数的实现
|  |  |
|  |  +- scene/ <-- 场景的实现
|  |  |  |
|  |  |  +- index.js <-- 入口
|  |  |  |
|  |  |  +- util.js <-- 场景相关工具函数的实现
|  |  |
|  |  +- stage/ <-- 舞台的实现
|  |  |
|  |  +- util/ <-- 工具函数的实现（需要依赖其他文件）
|  |  |
|  |  +- flag.js <-- 存放...对象
|  |  |
|  |  +- init.js <-- 存放和初始化相关的数据（在 String、Array、CanvasRenderingContext2D 的原型上扩展一些方法）
|  |
|  +- shared/ <-- 用于存放全局的常量和工具函数
|  |  |
|  |  +- constants.js <-- 定义全局用到的常量
|  |  |
|  |  +- util.js <-- 定义全局用到的工具函数
|  |
|  +- main.js <-- 项目入口文件
|
+- package.json <-- 项目描述文件
|
+- node_modules/ <-- npm 安装的所有依赖包
|
+- .babelrc
|
+- .gitignore
|
+- .npmignore
|
+- package.json
|
+- README.md
|
+- PROJECT.md
```
