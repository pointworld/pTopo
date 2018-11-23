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
|  |  |
|  |  +- events/ <-- 事件机制
|  |  |
|  |  +- group/ <-- 组的实现
|  |  |
|  |  +- layout/ <-- 布局的实现
|  |  |
|  |  +- node/ <-- 节点的实现
|  |  |
|  |  +- scene/ <-- 场景的实现
|  |  |
|  |  +- stage/ <-- 舞台的实现
|  |  |
|  |  +- util/ <-- 工具函数的实现（需要依赖其他文件）
|  |  |
|  |  +- flag.js <-- 存放...对象
|  |  |
|  |  +- init.js <-- 
|  |
|  +- shared/ <-- 用于存放全局的常量和工具函数
|  |  |
|  |  +- constants.js <-- 定义全局用到的常量
|  |  |
|  |  +- util.js <-- 定义全局用到的工具函数
|  |
|  +- main.js <-- 项目入口文件
|
+- gulpfile.js <-- gulp 主文件
|
+- md_to_html.js <-- 用于将 md 文件转换为 html 文件 
|
+- package.json <-- 项目描述文件
|
+- node_modules/ <-- npm 安装的所有依赖包
|
+- README.md
```
