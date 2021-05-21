# WebGis - ArcGis  开发指引

## 核心概念

### [`Map & View | 地图和视图`](https://developers.arcgis.com/javascript/latest/maps-and-views/)

Map(地图)是用于管理Layer(图层)和Basemap(基图)引用的容器。View(视图)用于**显示地图层**并处理用户**交互**、**Popups(弹出窗口)**、**Widgets(小部件)**和**Location(地图位置)**。

* 创建Map
* 赋值于View
* 利用View处理用户事件
* 将小组件添加至View

### [`Layers & Data | 图层和数据`](https://developers.arcgis.com/javascript/latest/layers-and-data/)

#### Layer是可在Map中使用的**数据集合(collections)**

通俗的理解是将功能数据转换为Layer服务,每个功能数据包含一种几何形状（点、多线或多边形）；可利用WebGis可视化通提供查询、过滤和编辑的功能。

### 关系图谱

#### 将View实例与DOM绑定

#### Widgets在View实例中添加、移除、控制

#### Map在View实例中添加、移除、控制

#### Layer通过在Map实例中添加、移除、移除、控制

![未标题-1](C:\Users\WSLAS\Desktop\MAP_DOM\未标题-1.jpg)

## ArcGis依赖引入

```javascript
// ArcGis 引入
cnpm i arcgis-js-api --S

// 个别板块载入
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
....
```



## View 视图

### 视图创建

```javascript
const map = new Map({
	basemap: "oceans"
});
// 创建视图
const view = new SceneView({
	container: "map",
	map: map
});
```

### 视图操作

#### 中心点

```javascript
view.center = [-112, 38]; 
```

#### zoom/缩放尺度

```javascript
view.zoom = 13; 
```

#### ......

### 视图方法

#### 视图加载完成

```javascript
// 视图
view.when(()=>{
    // Do something
})
```



## Map地图

### 创建地图

```javascript
this.map = new Map({
			basemap: "hybrid",    // 通过官方提供的固定底图名称载入
			// basemap: basemap,    // 通过将Basemap提供和底图
			/*****************************************************************
			 * 可以在地图的构造函数中将图层添加到地图
			 *****************************************************************/
			// layers: [new MapImageLayer()]
		});
```



## Layer图层

图层服务有多种类别[FeatureLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html)、[ImageryLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryLayer.html)、[ImageryTileLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryTileLayer.html)分别对应不同的图层类型，以南京市房产为例主要有[FeatureLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html)、[ImageryLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryLayer.html)两种类型的图层数据、可只重点了解以上两种图层的使用

### 创建图层

```javascript
const housingLayer = new TileLayer({
	url:"https://layer",
	id: "ny-housing",
	opacity: 0.9
});
```

#### 方法一、添加于地图的构造函数中

```javascript
const map = new Map({
	basemap: "oceans",
	layers: [housingLayer]
});
```

#### 方法二、通过`map.add`添加至地图

```javascript
map.add(housingLayer);
```

### 图层属性|操作

| 名称                                                         | Type    | 概括                   | 备注 |
| ------------------------------------------------------------ | ------- | ---------------------- | ---- |
| [id](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html#id) | String  | 设置图层id（标记图层） |      |
| [opacity](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html#opacity) | Number  | 设置图层可视化透明度   |      |
| [visible](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html#visible) | Boolean | 控制图层展示           |      |
| ....                                                         |         |                        |      |

### 图层控制

#### 直接修改Layer实例对象的属性

```javascript
// 修改图层的透明度为50%
housingLayer.opacity = 0.5;
// 修改图层是否可见
housingLayer.opacity = 0.5;
```



### 图层方法

| Name                                                         | Return Type | 概述                  | 备注 |
| ------------------------------------------------------------ | ----------- | --------------------- | ---- |
| [cancelLoad()](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html#cancelLoad) |             | 取消**加载中**的Layer |      |
| [when()](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html#when) | Promise     | Layer创建成功后调用   |      |
| [load()](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html#load) | Promise     | 加载Layer资源         |      |
| .....                                                        |             |                       |      |

## [widgets 组件](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html)

例如添加zoom缩放，搜索栏，圈画工具都数据一个单独的小组件，每个小组件的DOM属性、方法和数据是分开的；通过`view.ui.add()`添加至页面；