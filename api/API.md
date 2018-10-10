## 拓扑图开发工具包（jtopo-0.4.8.js）

- jTopo：Javascript Topology library，是一款完全基于 HTML5 Canvas 的关系、拓扑图形化界面开发工具包。
- jTopo 关注于数据的图形展示，它是面向开发人员的，需要进行二次开发。

- jTopo 特点
  - 一、完全基于 HTML5 Canvas 开发，始终站在开发者的角度设计，API 平易近人、几乎简单到了极致。
  - 二、不依赖任何其他库、执行仅需一个 Canvas，不污染你的页面、Dom 结构和代码命名空间。
  - 三、功能异常强大、灵活，可扩展性极强（为扩展而生），包装一下，就是一款很专业的图形化软件。
  - 四、体积小，压缩后仅几十KB。
  - 五、性能十分优异，可流畅地展示大量数据(经过专业优化过甚至可以展示几十万、百万级别的数据)
  - 六、免费
  - 不足：目前文档不够详细，主要通过 Demo 来熟悉。

### 舞台的实现 jTopo.Stage

jTopo.Stage: 一个抽象的舞台对象，对应一个 Canvas 和多个场景对象（Scene）

#### 属性
- frames: 设置当前舞台播放的帧数/秒
  - 默认为：24
  - frames 可以为 0，表示：不自动绘制，由用户手工调用 Stage 对象的 paint() 方法来触发
  - 如果小于 0，表示：只有键盘、鼠标有动作时才会重绘，例如：stage.frames = -24
- canvas: 对应的 Canvas 对象
- width: 舞台宽度（Canvas 的宽度）
- height: 舞台高度（Canvas 的高度）
- mode: 舞台模式，不同模式下有不同的表现（设置舞台模式，例如：stage.mode = "drag"）
  - normal[默认]：可以点击选中单个节点（按住 Ctrl 可以选中多个），点中空白处可以拖拽整个画面
  - drag: 该模式下不可以选择节点，只能拖拽整个画面
  - select: 可以框选多个节点、可以点击单个节点
  - edit: 在默认基础上增加了：选中节点时可以通过6个控制点来调整节点的宽、高
- childs: 场景对象列表
- eagleEye: 鹰眼对象
  - 显示鹰眼: stage.eagleEye.visible = true
  - 隐藏鹰眼: stage.eagleEye.visible = false
- wheelZoom: 鼠标滚轮缩放操作比例，默认为 null，不显示鹰眼
  - 启用鼠标滚轮缩放: stage.wheelZoom = 0.85; // 缩放比例为 0.85
  - 禁用鼠标滚轮缩放: stage.wheelZoom = null;

#### 方法
- add(Scene): 将一个 Scene 场景加入到舞台中（只有加入舞台才可以显示出来）
- remove(Scene): 将一个 Scene 场景从舞台中移除（不再显示）
- clear(): 将所有 Scene 场景从舞台中移除
- paint(): 执行一次绘制，如果 frames 设置为 0，可以手工调用此方法来通知 jtopo 进行一次重绘
- zoom(scale): 缩放，scale 取值范围 [0-1], 实际上本操作是调用了舞台中所有 Scene 对象的 zoom 函数
- zoomOut(scale): 放大，scale 取值范围 [0-1]，调用 zoom 实现
- zoomIn(scale): 缩小，scale 取值范围 [0-1]，调用 zoom 实现
- centerAndZoom(scale): 缩放并居中显示所有元素
- setCenter(x, y): 设置当前舞台的中心坐标（舞台平移）
- getBound(): 得到舞台中所有元素位置确定的边界大小（left、top、right、bottom）
- saveImageInfo(): 导出成 PNG 图片（在新打开的浏览器 Tab 页中）
- saveAsLocalImage(): 导出成 PNG 图片（直接弹出另存为对话框或者用下载软件下载）
- toJson(): 把当前对象的属性序列化成 json 数据

#### 事件方法
- addEventListener(eventName, eventHandler): 监听事件
  - 例如：stage.addEventListener("mousedown", function(event){});
  - 可以监听的事件有：click, dbclick, mousedown, mouseup, mouseover, mouseout, mousemove, mousedrag, mousewheel
- removeEventListener(eventName): 移除监听事件和 addEventListener 相对应
- removeAllEventListener(): 移除所有监听事件
- click(eventHandler): 监听鼠标单击事件（鼠标按下并松开），等价于：stage.addEventListener("click", eventHandler);
- dbclick(eventHandler): 监听鼠标双击事件（鼠标按下并松开），等价于：stage.addEventListener("dbclick", eventHandler);
- mousedown(eventHandler): 监听鼠标按下事件，等价于：stage.addEventListener("mousedown", eventHandler);
- mouseup(eventHandler): 监听鼠标松开事件，等价于：stage.addEventListener("mouseup", eventHandler);
- mouseover(eventHandler): 监听鼠标进入Canvas事件，等价于：stage.addEventListener("mouseover", eventHandler);
- mouseout(eventHandler): 监听鼠标离开Canvas事件，等价于：stage.addEventListener("mouseup", eventHandler);
- mousemove(eventHandler): 监听鼠标移动事件，等价于：stage.addEventListener("mousemove", eventHandler);
- mousedrag(eventHandler): 监听鼠标拖拽事件，等价于：stage.addEventListener("mousedrag", eventHandler);
- mousewheel(eventHandler): 监听鼠标滚轮事件，等价于：stage.addEventListener("mousewheel", eventHandler);

#### 序列化和反序列化
```text
  var json = '{"version":"0.4.0","frames":24,"wheelZoom":null ...}';
  var stage = JTopo.createStageFromJson(json, canvas);// 反序列化

  var jsonStr = stage.toJson();// 序列化
```

### 场景的实现 jTopo.Scene

场景对象，概念上同很多图形系统中的 Layer

#### 属性
- alpha: 场景的透明度，默认为 0，即：完全透明。所以有时候即使设置了背景颜色却不起作用
- backgroundColor: 背景颜色，设置的时候请注意 alpha 属性
- background: 设置场景的背景图片
  - 与 backgroundColor 冲突，一旦设置了该属性，backgroundColor 属性将失效
  - 例如：scene.background = "./img/bg.png";
- visible: 得到、设置场景是否可见，默认为：true
- areaSelect: 在 select 模式中，是否显示选择矩形框
- mode: 舞台模式，不同模式下有不同的表现：
  - normal[默认]：可以点击选中单个节点（按住 Ctrl 可以选中多个），点中空白处可以拖拽整个画面
  - drag: 该模式下不可以选择节点，只能拖拽整个画面
  - select: 可以框选多个节点、可以点击单个节点
  - edit: 在默认基础上增加了：选中节点时可以通过6个控制点来调整节点的宽、高
- selectedElements: 当前场景中被选中的元素对象
- translateX: 场景偏移量（水平方向），随鼠标拖拽变化
- translateY: 场景偏移量（垂直方向），随鼠标拖拽变化

#### 方法
- show(): 显示
- hide(): 隐藏  
- add(element): 添加对象到当前场景中来，例如：scene.add(new JTopo.Node()); scene.add(new JTopo.Link(nodeA, nodeZ))
- remove(element): 移除场景中的某个元素，例如：scene.remove(myNode);
- clear(): 移除场景中的所有元素
- getDisplayedElements(): 获取场景中可见并绘制出来的元素（超过 Canvas 边界）
- getDisplayedNodes(): 获取场景中可见并绘制出来的 Node 对象（超过 Canvas 边界）
- findElements(cond): 查找场景中的对象，例如：findElements(function(e) {return e.x>100;});

#### 事件方法
- addEventListener(eventName, eventHandler): 监听事件
  - 例如：stage.addEventListener("mousedown", function(event){});
  - 可以监听的事件有：click, dbclick, mousedown, mouseup, mouseover, mouseout, mousemove, mousedrag, mousewheel
- removeEventListener(eventName): 移除监听事件和 addEventListener 相对应
- removeAllEventListener(): 移除所有监听事件
- click(eventHandler): 监听鼠标单击事件（鼠标按下并松开），等价于：stage.addEventListener("click", eventHandler);
- dbclick(eventHandler): 监听鼠标双击事件（鼠标按下并松开），等价于：stage.addEventListener("dbclick", eventHandler);
- mousedown(eventHandler): 监听鼠标按下事件，等价于：stage.addEventListener("mousedown", eventHandler);
- mouseup(eventHandler): 监听鼠标松开事件，等价于：stage.addEventListener("mouseup", eventHandler);
- mouseover(eventHandler): 监听鼠标进入Canvas事件，等价于：stage.addEventListener("mouseover", eventHandler);
- mouseout(eventHandler): 监听鼠标离开Canvas事件，等价于：stage.addEventListener("mouseup", eventHandler);
- mousemove(eventHandler): 监听鼠标移动事件，等价于：stage.addEventListener("mousemove", eventHandler);
- mousedrag(eventHandler): 监听鼠标拖拽事件，等价于：stage.addEventListener("mousedrag", eventHandler);
- mousewheel(eventHandler): 监听鼠标滚轮事件，等价于：stage.addEventListener("mousewheel", eventHandler);

### jTopo.Node (普通 Node)

节点对象

#### 属性
- text: 设置节点的名字（显示文本）
- x: x 坐标值
- y: y 坐标值
- visible: 设置节点是否可见
- shadow: 是否显示阴影，例如：node.shadow = "true"
- zIndex: 大的覆盖小的，范围 [10-999]，10 以下保留占用
- dragable: 设置节点是否可以拖动
- selected: 是否被选中
- editAble: 是否可被编辑
- font: 节点字体，例如：node.font = "12px Consolas"
- fontColor: 字体颜色，例如：node.fontColor = "255,255,0"
- textPosition: 节点文本位置，例如：node.textPosition = "Bottom_Center"
- showSelected: 选中时，是否显示表示选中状态的矩形，默认为：true，显示
- rotate: 设置节点旋转的角度（弧度）
- alpha: 透明度，取值范围 [0-1]
- scaleX: 水平缩放
- scaleY: 垂直缩放
- fillColor: 设置节点的填充颜色

#### 方法
- setImage(url): 设置节点图片
- setSize(width, height): 设置节点的宽和高
- getSize(): 获取节点的宽和高
- setBound(x, y, width, height): 设置节点的坐标、宽、高
- getBound(): 获取节点的坐标、宽、高
- setLocation(x, y): 设置节点在场景中的位置坐标（左上角）
- setCenterLocation(): 设置节点在场景中的位置坐标（中心位置）

#### 事件方法
- addEventListener(eventName, eventHandler): 监听事件
  - 例如：stage.addEventListener("mousedown", function(event){});
  - 可以监听的事件有：click, dbclick, mousedown, mouseup, mouseover, mouseout, mousemove, mousedrag, mousewheel
- removeEventListener(eventName): 移除监听事件和 addEventListener 相对应
- removeAllEventListener(): 移除所有监听事件
- click(eventHandler): 监听鼠标单击事件（鼠标按下并松开），等价于：stage.addEventListener("click", eventHandler);
- dbclick(eventHandler): 监听鼠标双击事件（鼠标按下并松开），等价于：stage.addEventListener("dbclick", eventHandler);
- mousedown(eventHandler): 监听鼠标按下事件，等价于：stage.addEventListener("mousedown", eventHandler);
- mouseup(eventHandler): 监听鼠标松开事件，等价于：stage.addEventListener("mouseup", eventHandler);
- mouseover(eventHandler): 监听鼠标进入Canvas事件，等价于：stage.addEventListener("mouseover", eventHandler);
- mouseout(eventHandler): 监听鼠标离开Canvas事件，等价于：stage.addEventListener("mouseup", eventHandler);
- mousemove(eventHandler): 监听鼠标移动事件，等价于：stage.addEventListener("mousemove", eventHandler);
- mousedrag(eventHandler): 监听鼠标拖拽事件，等价于：stage.addEventListener("mousedrag", eventHandler);

### jTopo.CircleNode (圆角 Node)
```text
  circleNode.fillColor = '0, 0, 0';//填充色
  circleNode.radius = 24; // 半径
  circleNode.alpha = 0.7; // 透明度
```

### JTopo.TextNode (文本 Node)
```text
  textNode.font = 'bold 16px 微软雅黑';//设置文本节点的字体
```

### JTopo.LinkNode（超链接 Node）
```text
  var linkNode = new JTopo.LinkNode('超链接：http://www.jtopo.com');
  linkNode.href = 'http://www.jtopo.com';
  linkNode.target = '_blank'; // 新窗口打开链接
  linkNode.font = 'italic bold 16px 微软雅黑';
  linkNode.visitedColor = '0,0,255'; // 访问过的链接为蓝色
  linkNode.shadowOffsetX = 5; // 阴影设置
  linkNode.shadowOffsetY = 16;
```

### jTopo.Link（普通连线）

连线对象

#### 属性
- text: 连线的名字（文本）
- nodeA: 起始节点对象
- nodeZ: 终止节点对象
- alpha: 透明度
- style.strokeColor: 连线的颜色
- style.lineWidth: 线条的宽度（像素）

```text
  link.lineWidth = 3; // 线宽
  link.dashedPattern = 5; // 虚线 int值
  link.bundleOffset = 60; // 折线拐角处的长度
  link.bundleGap = 20; // 线条之间的间隔
  link.textOffsetY = 3; // 文本偏移量（向下3个像素）
  link.strokeColor = '0,200,255'; //连线的颜色

  
  var loop = newLink(from, from, 'loop');// Link的起始点和结束点相同，就画成一个圆
```

### JTopo.FoldLink（折线）
```text
  link.direction = 'vertical'|| 'horizontal';
  link.arrowsRadius = 15; //箭头大小
  link.lineWidth = 3; // 线宽
  link.dashedPattern = 3; // 虚线 int值
  link.bundleOffset = 60; // 折线拐角处的长度
  link.bundleGap = 20; // 线条之间的间隔
  link.textOffsetY = 3; // 文本偏移量（向下3个像素）
  link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
```

### JTopo.FlexionalLink (二次折线)
属性同普通Link和FoldLink基本一样

### JTopo.CurveLink (曲线)
属性同普通Link和FoldLink基本一样

### 容器的实现 jTopo.Container

容器对象

#### 属性
- text: 名称（文本），不会显示
- x: x 坐标值
- y: y 坐标值
- width: 容器宽度
- height: 容器高度
- alpha: 透明度
- dragble: 是否可以拖动

```text
  // 不指定布局的时候，容器的布局为自动(容器边界随元素变化）
  container.textPosition = 'Middle_Center';// 字体位置
  container.fontColor = '100,255,0';
  container.font = '18pt 微软雅黑';
  container.borderColor = '255,0,0';
  scene.add(container);
```

### JTopo.layout.FlowLayout (流式布局)
```text
  var flowLayout = JTopo.layout.FlowLayout(10, 10); //（水平、垂直间隔均为10)
```

### JTopo.layout.GridLayout (网格布局)
```text
  var gridLayout = JTopo.layout.GridLayout(4, 3);//(4行3列)
```

### JTopo.layout.TreeLayout (树形布局)
```text
  JTopo.layout.TreeLayout('down', 30, 107);
```

### 拓扑图形
```text
  // 圆形布局
  var cloudNode = new JTopo.Node('root');
  cloudNode.layout = {type: 'circle', radius: 150};

  // 树形布局
  var cloudNode = new JTopo.Node('root');
  cloudNode.layout = {type: 'tree', width:50, height: 100};
  
  // 树形布局（全自动）
  scene.doLayout(JTopo.layout.TreeLayout('down', 30, 107));// 树形布局

```

### 统计图表 -- 饼图
```text
  // 饼图
  var node = new JTopo.PieChartNode();
  node.radius = 100;           
  node.colors = ["#3666B0","#2CA8E0","#77D1F6"];
  node.datas = [0.3, 0.3, 0.4];
  node.titles = ['A', 'B', 'C'];
```

### 统计图表 -- 柱状图
```text
  var node = new JTopo.BarChartNode();     
  node.colors = ["#3666B0","#2CA8E0","#77D1F6","#12DFE5"];
  node.datas = [130, 200, 120, 180];
  node.titles = ['2010', '2012', '2013', '2014'];
```




### 容器节点的实现
### 容器分组的实现
### 自动布局的实现
### 动画和特效的实现 jTopo.Effect.Animate

### 全局通用方法 JTopo.util

#### 属性
- isFirefox
- isIE
- isChrome

#### 方法
- rotatePoint
- rotatePoints
- getDistance(a, b): 计算 a 点到 b 点的距离
- getEventPosition
- mouseCoords
- MessageBus
- clone
- isPointInRect
- isRectOverlapRect
- isPointInLine
- removeFromArray
- cloneEvent
- randomColor
- toJson
- loadStageFromJson
- getElementsBound
- getImageAlarm
- getOffsetPosition
- lineF
- intersection
- intersectionLineBound

- copy
- getUrlParam
- creatId
- setImageUrl
- setCurHandUrl
- nodeFlash
- smallNodeFlash
- getRotateAng
- findAllPrevNodesAndLinks
- findAllNextNodesAndLinks
- findEleById
- findEleByType
- setPopPos
- moveElePosByContainerBorder

### JTopo.flag
- clearAllAnimateT
- imageUrl
- graphics
- curScene
- linkConfigure
- nodeConfigure
- alarmImageCache
- topoImgMap


动画效果

#### 方法
- gravity(): 给指定的元素添加重力效果 
- stepByStep(): 通用动画效果功能，可以把一个元素对象的某些属性在指定的时间内变化到指定值

### 弹性效果的实现
```text
  // 弹性效果（引力、摩擦系数)
  var effect = JTopo.Effect.spring({
  	grivity: 10, // 引力 (可以为负值)
  	spring: 0.4, // 弹性系数
  	friction: 0.3 // 摩擦系数
  })

  // 效果作用对象(node节点以targetNode为目标，产生弹性效果)
  effect.addNode(node, targetNode);
  effect.play();// 播放
```

### gif 模拟
```text
  // 1行4列，1000毫秒播放一轮，行偏移量           
  var sprite = new JTopo.AnimateNode('./img/caizhu.png', 1, 4, 1000, 1); // caizhu.png是个sprite图
  sprite.setSize(90, 88);
  sprite.setLocation(300, 250);
  sprite.repeatPlay = true;
  sprite.play(); 
```

### 鹰眼视图的实现
### 帧动画的实现
### 通用工具的实现
### 拓展的实现



