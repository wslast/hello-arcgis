<template>
	<div class="home">
		<!--地图dom-->
		<div class="home-map" id="map"></div>
		<div class="oper">
			<div class="opers" v-for="(control,index) in allLayersControl" :key="control.id">
				<div class="opers-title">
					<div class="opers-title-n">{{ control.name }}</div>
					<div class="opers-title-swich">
						<i-switch v-model="control.visible" size="large" @on-change="layerVisibleChange(control)">
							<span slot="open">开启</span>
							<span slot="close">关闭</span>
						</i-switch>
					</div>
				</div>
				<template v-if="control.visible">
					<div class="opers-btn">
						<div class="opers-btns" @click="goToLayer(control)">
							<div class="opers-btns-icon ivu-icon ivu-icon-md-pin"></div>
							<div class="opers-btns-t">全览</div>
						</div>
						<div class="opers-btns" v-if="index !== 0" @click="goInUp(control,index)">
							<div class="opers-btns-icon iconfont icon-shangyi"></div>
							<div class="opers-btns-t">上移</div>
						</div>
						<div class="opers-btns" v-if="index !== (allLayersControl.length -1) "
						     @click="goInDown(control,index)">
							<div class="opers-btns-icon iconfont icon-xiayi"></div>
							<div class="opers-btns-t">下移</div>
						</div>
					</div>
					<div class="opers-m" :class="{disabled: !control.visible}">
						<div class="opers-m-list">
							<div class="opers-m-list-tit">透明度</div>
							<div class="opers-m-list-cont">
								<Slider
									v-model="control.opacity"
									:step="0.01"
									:min="0"
									:max="1"
									@on-change="layerOpacityChange(control)"
									@on-input="layerOpacityChange(control)"
									show-input>
								</Slider>
							</div>
						</div>
					</div>
					<div class="opers-sketch">
						<div class="opers-tit">
							<div class="opers-tit-n">区域查询</div>
							<div class="opers-tit-btn">
								<Button v-if="!control.sketch.show" type="primary" size="small" @click="sketchCreateAndEvent(index)">
									绘制区域并查询
								</Button>
								<Button v-else type="warning" size="small" @click="destroySketch(index)">
									取消绘制
								</Button>
							</div>
						</div>
						<div class="featureC">
							<div class="featureCs"
							     v-for="(feature,index) in control.sketch.queryData.features">
								<div class="featureCs-num">
									{{ index + 1 }}
								</div>
								<div class="featureCs-name">
									{{ feature.attributes[control.featureNameKey] }}
								</div>
								<div class="featureCs-btn">
									<div class="featureCs-btns" @click="addQueryGeometry(feature)">
										<div class="featureCs-btns-icon ivu-icon ivu-icon-md-pin"></div>
										<div class="featureCs-btns-t">全览</div>
									</div>
								</div>
							</div>
						</div>
						<div class="tool">
							<Button
								icon="logo-facebook"
								v-if="control.sketch.queryData.features"
								@click="removeSketchQue(index)"
								type="error"
								size="small">
								移除选取
							</Button>
						</div>
					</div>
					<div class="opers-feature">
						<div class="opers-tit">
							<div class="opers-tit-n">节点-Feature</div>
							<div class="opers-tit-btn">
								<Button type="text" :disabled="control.queryData.features"
								        @click="queryFeaturesAndSet(control,index)">
									{{ control.queryData.features ? `${control.queryData.features.length}个节点已加载` : '加载节点' }}
								</Button>
							</div>
						</div>
						<div class="featureC">
							<div class="featureCs"
							     v-for="(feature,index) in control.queryData.features">
								<div class="featureCs-num">
									{{ index + 1 }}
								</div>
								<div class="featureCs-name">
									{{ feature.attributes[control.featureNameKey] }}
								</div>
								<div class="featureCs-btn">
									<div class="featureCs-btns" @click="addQueryGeometry(feature)">
										<div class="featureCs-btns-icon ivu-icon ivu-icon-md-pin"></div>
										<div class="featureCs-btns-t">全览</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</template>
			</div>
		</div>
		<!--<span id="layerToggle" class="esri-widget"> <input type="checkbox" id="streetsLayer" /> Transportation </span>-->
	</div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

import {ILayerProperties} from "@/types/Layer"

import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import TileLayer from "@arcgis/core/layers/TileLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Query from "@arcgis/core/tasks/support/Query";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import Circle from "@arcgis/core/geometry/Circle";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {__jh} from "@/interfaces";
// import urlUtils from "@arcgis/core/core/urlUtils";
// import ArcGISDynamicMapServiceLayer from "@arcgis/core/layers/ArcGISDynamicMapServiceLayer";

@Component({
	components: {
		HelloWorld,
	}
})
export default class Home extends Vue {
	
	private allLayersControl: Array<ILayerProperties> = [
		{
			layerType: 'Feature',
			name: "南京市房产测绘行政区划信息",
			url: "http://192.168.253.28:6080/arcgis/rest/services/WXService/MapServer/4",
			Layer: {},
			opacity: 1,
			outFields: ["*"],
			queryData: {},
			loading: false,
			visible: true,
			featureNameKey: '板块',
			popupTemplate: {
				title: "{板块}",
				content: [
					{
						type: "fields",
						fieldInfos: [
							{
								fieldName: "区域范围",
								label: "区域范围",
							},
							{
								fieldName: "毛坯价格",
								label: "毛坯价格",
							},
							{
								fieldName: "装修价格",
								label: "行政区划",
							},
							{
								fieldName: "行政区划",
								label: "装修价格",
							},
						]
					}]
			},
			labelingInfo: [
				{
					symbol: {
						type: "text",
						color: [255, 255, 255, 0.85],
						font: {
							family: "Playfair Display",
							size: 12,
							weight: "bold"
						}
					},
					labelPlacement: "above-center",
					labelExpressionInfo: {
						expression: "$feature.板块"
					}
				}
			],
			sketch: {
				show: false,
				queryData: {}
			}
		},
		{
			layerType: 'Feature',
			name: "南京市房产测绘街道办信息",
			url: "http://192.168.253.28:6080/arcgis/rest/services/WXService/MapServer/2",
			Layer: {},
			opacity: 1,
			outFields: ["*"],
			queryData: {},
			loading: false,
			visible: false,
			featureNameKey: 'NAME',
			labelingInfo: [
				{
					symbol: {
						type: "text",
						color: [0, 0, 0, 0.7],
						font: {
							family: "Playfair Display",
							size: 12,
							weight: "bold"
						}
					},
					labelPlacement: "above-center",
					labelExpressionInfo: {
						expression: "$feature.name"
					}
				}
			],
			sketch: {
				show: false,
				queryData: {}
			}
		},
		{
			layerType: 'Feature',
			name: "南京市房产物业小区图层",
			url: "http://192.168.253.28:6080/arcgis/rest/services/WXService/MapServer/3",
			Layer: {},
			opacity: 1,
			outFields: ["*"],
			queryData: {},
			loading: false,
			visible: false,
			featureNameKey: '小区名称',
			labelingInfo: [
				{
					symbol: {
						type: "text",
						color: [0, 0, 0, 0.7],
						font: {
							family: "Playfair Display",
							size: 12,
							weight: "bold"
						}
					},
					labelPlacement: "above-center",
					labelExpressionInfo: {
						expression: "$feature.小区名称"
					}
				}
			],
			sketch: {
				show: false,
				queryData: {}
			}
		},
		{
			layerType: 'Feature',
			name: "南京市房产板块图层",
			url: "http://192.168.253.28:6080/arcgis/rest/services/WXService/MapServer/5",
			Layer: {},
			opacity: 1,
			outFields: ["*"],
			queryData: {},
			loading: false,
			visible: false,
			featureNameKey: 'DISTRICTNA',
			labelingInfo: [
				{
					symbol: {
						type: "text",
						color: [0, 0, 0, 0.7],
						font: {
							family: "Playfair Display",
							size: 12,
							weight: "bold"
						}
					},
					labelPlacement: "above-center",
					labelExpressionInfo: {
						expression: "$feature.DISTRICTNA"
					}
				}
			],
			sketch: {
				show: false,
				queryData: {}
			}
		},
		{
			layerType: 'Feature',
			name: "南京市房产测绘道路中心线信息",
			url: "http://192.168.253.28:6080/arcgis/rest/services/WXService/MapServer/1",
			Layer: {},
			opacity: 1,
			outFields: ["*"],
			queryData: {},
			loading: false,
			visible: false,
			featureNameKey: 'DISTRICTNA',
			labelingInfo: [
				{
					symbol: {
						type: "text",
						color: [0, 0, 0, 0.7],
						font: {
							family: "Playfair Display",
							size: 12,
							weight: "bold"
						}
					},
					labelPlacement: "above-center",
					labelExpressionInfo: {
						expression: "$feature.DISTRICTNA"
					}
				}
			],
			sketch: {
				show: false,
				queryData: {}
			}
		},
		{
			layerType: 'Feature',
			name: "南京市房产测绘房屋幢信息",
			url: "http://192.168.253.28:6080/arcgis/rest/services/WXService/MapServer/0",
			Layer: {},
			opacity: 1,
			outFields: ["*"],
			queryData: {},
			loading: false,
			visible: false,
			featureNameKey: 'DISTRICTNA',
			labelingInfo: [
				{
					symbol: {
						type: "text",
						color: [0, 0, 0, 0.7],
						font: {
							family: "Playfair Display",
							size: 12,
							weight: "bold"
						}
					},
					labelPlacement: "above-center",
					labelExpressionInfo: {
						expression: "$feature.DISTRICTNA"
					}
				}
			],
			sketch: {
				show: false,
				queryData: {}
			}
		},
		// {
		// 	layerType:'Tile',
		// 	Layer: {},
		// 	url: "http://192.168.253.28:6080/arcgis/rest/services/FC_google_all/MapServer",
		// 	id: "streets",
		// 	name: '全球街道',
		// 	visible: true,
		// 	opacity: 1
		// },
	
	]
	
	private view: any
	private map: any
	// 绘制图层
	private graphicsLayer: any
	// Sketch绘制工具
	private mapSketch: any
	// 比例尺
	private scaleBar: any
	
	private rings = [
		[389929.3086989581,3581228.763640235],
		[390022.3324162555,3581193.780361935],
		[390004.04570259876,3581078.494558447],
		[389905.4564637536,3581108.707389706],
		[389929.3086989581,3581228.763640235]
	]
	
	public mounted(): void {
		this.createMapView()
	}
	
	/**
	 * 创建地图试视图
	 * @private
	 */
	private createMapView(): void {
		
		// urlUtils.addProxyRule({
		// 	urlPrefix:'http://192.168.253.28:6080/',
		// 	proxyUrl:'http://192.168.253.28:6080/'
		// })
		
		/*****************************************************************
		 统一创建Layer
		 *****************************************************************/
		this.allLayersControl = this.createTileLayers(this.allLayersControl)
		
		let basemap = new Basemap({
			baseLayers: [
				new MapImageLayer({url: 'http://192.168.253.28:6080/arcgis/rest/services/FC_google_all/MapServer'})
			],
		});
		
		this.map = new Map({
			// basemap: "hybrid",
			basemap: basemap,
			/*****************************************************************
			 * 可以在地图的构造函数中将图层添加到地图
			 *****************************************************************/
			// layers: [new MapImageLayer({url: 'http://192.168.253.28:6080/arcgis/rest/services/FC_google_all/MapServer'})]
		});
		
		this.addLayers(this.allLayersControl)
		
		this.view = new MapView({
			container: "map",
			zoom: 9,
			center: [118.780, 32.045],
			map: this.map
		});
		
		this.view.constraints = {
			maxZoom: 9,
		};
		
		this.view.on("layerview-create", (event: { layer: { id: string; }; layerView: any; }) =>{
			if (event.layer.id === "ny-housing") {
				// Explore the properties of the population layer's layer view here
				console.log("LayerView for male population created!", event.layerView);
			}
			if (event.layer.id === "streets") {
				// Explore the properties of the transportation layer's layer view here
				// Explore the properties of the transportation layer's layer view here
				console.log("LayerView for streets created!", event.layerView);
			}
		});
		
		// 在view加点击事件
		this.view.on("click", this.makeCircle)
		
		/*****************************************************************
		 * 跳转至第一个视图的中心
		 * Layer会在SceneView加载完成后加载成功
		 *****************************************************************/
		this.view.when(() => {
			this.toQueryAllFeatures()
			
			// 初始化Graphics图层
			this.initGraphics()
			
			// 加载比例尺
			this.initScaleBar()
		});
	}
	
	/**
	 * switch event to change Layer Visible
	 * @param control
	 * @private
	 */
	private layerVisibleChange(control: ILayerProperties): void {
		control.Layer.visible = control.visible
	}
	
	/**
	 * 滑块dom值发生改变，切换图层透明度
	 * @param control
	 * @private
	 */
	private layerOpacityChange(control: ILayerProperties): void {
		control.Layer.opacity = control.opacity
	}
	
	/**
	 * 点击切换视图为指定图层的全幅zoom
	 * @param control
	 * @private
	 */
	private goToLayer(control: ILayerProperties): void {
		if (!control.visible) {
			return
		}
		
		this.view.goTo(control.Layer.fullExtent)
			.catch((error: { name: string; }) => {
				if (error.name != "AbortError") {
					console.error(error);
				}
			});
	}
	
	/**
	 * 实例化图层
	 * @param layerControls
	 * @private
	 */
	private createTileLayers(layerControls: Array<ILayerProperties>): Array<ILayerProperties> {
		return layerControls.map((layerControl: ILayerProperties) => {
			
			switch (layerControl.layerType) {
				case "Tile":
					layerControl.Layer = new TileLayer(layerControl);
					break;
				case "Feature":
					layerControl.Layer = new FeatureLayer(layerControl);
					break;
			}
			
			return layerControl
		})
	}
	
	/**
	 * 向地图示例添加layer
	 * @param layerControls
	 */
	addLayers(layerControls: Array<ILayerProperties>) {
		layerControls.map(({Layer}: ILayerProperties, index: number) => {
			// 倒序添加图层 为了和页面保持一致
			this.map.add(Layer, layerControls.length - index - 1);
		})
	}
	
	/**
	 * 上移图层
	 * @param control
	 * @param index
	 */
	goInUp(control: ILayerProperties, index: number): void {
		this.allLayersControl[index] = this.allLayersControl.splice(index - 1, 1, this.allLayersControl[index])[0];
		this.refreshLayerIndex()
	}
	
	/**
	 * 下移图层
	 * @param control
	 * @param index
	 */
	goInDown(control: ILayerProperties, index: number): void {
		this.allLayersControl[index] = this.allLayersControl.splice(index + 1, 1, this.allLayersControl[index])[0];
		this.refreshLayerIndex()
	}
	
	/**
	 * 刷新图层顺序
	 */
	refreshLayerIndex() {
		this.allLayersControl.map((c: ILayerProperties, index: number) => {
			this.map.reorder(c.Layer, this.allLayersControl.length - index - 1)
		})
	}
	
	/**
	 * 对所有图层数据进行查询
	 */
	toQueryAllFeatures() {
		
		this.allLayersControl.map((layersControl: ILayerProperties, index: number) => {
			layersControl.Layer.when(() => {
				// 图层数据查询
				// this.queryFeaturesAndSet(layersControl, index)
				// 首个图层进行跳转
				if (!index) {
					this.view.goTo(layersControl.Layer.fullExtent)
						.catch((error: { name: string; }) => {
							// fixme 给出友好提示，并做好相应交互
							if (error.name != "AbortError") {
								console.error(error);
							}
						});
				}
			})
		})
	}
	
	/**
	 * 查询图层数据并赋值控制器
	 */
	queryFeaturesAndSet(layersControl: ILayerProperties, index: number) {
		this.allLayersControl[index].loading = true;
		layersControl.Layer.queryFeatures()
			.then((res: any) => {
				this.allLayersControl[index].loading = false;
				
				this.allLayersControl[index].queryData = res
				console.log(res)
			})
			.catch((err: Error) => {
				this.allLayersControl[index].loading = false;
				// fixme 给出友好提示，并做好相应交互
			})
	}
	
	/**
	 * 添加覆盖图层已有的Geometry
	 * @param feature
	 */
	addQueryGeometry(feature: any) {
		// this.view.graphics.add(new Polygon(geometry));
		this.view.goTo(feature.geometry)
			.then(() => {
				console.log(feature)
				this.addGraphicsByLayer(feature.geometry)
			})
			.catch((error: { name: string; }) => {
				// fixme 给出友好提示，并做好相应交互
				if (error.name != "AbortError") {
					console.error(error);
				}
			});
	}
	
	/**
	 * 初始化Sketch 用于选取查询
	 */
	initGraphics() {
		// 创建GraphicsLayer图层并添加到地图
		this.graphicsLayer = new GraphicsLayer();
		this.map.add(this.graphicsLayer);
	}
	
	
	sketchCreateAndEvent(layerControlIndex: number) {
		
		this.allLayersControl[layerControlIndex].sketch.show = true;
		
		// 移除绘制图层数据
		this.graphicsLayer.removeAll();
		
		// 地图上添加Sketch
		this.mapSketch = new Sketch({
			view: this.view,
			layer: this.graphicsLayer,
			//保留多边形，正方形，圆形
			availableCreateTools: ["polygon", "rectangle", "circle"],
		});
		
		// 添加Sketch操作栏至View
		this.view.ui.add(this.mapSketch, "bottom-right");
		
		// 为Sketch绑定事件 监听Sketch完成绘图后执行查询
		this.mapSketch.on("create", (event: { state: string; graphic: { geometry: any; }; }) => {
			if (event.state === "complete") {
				//使用graphic.geometry 去查询相交特征
				//console.log(event.graphic.geometry);
				
				//使用geometry（QueryTask）
				this.queryTask(event.graphic.geometry, layerControlIndex);
				
				// 移除工具
				this.destroySketch(layerControlIndex);
				
				// todo 将查询到的数据高光叠加
			}
		});
	}
	
	/**
	 * 通过图层区域数据进行查询0
	 * @param geometry
	 * @param layerControlIndex
	 */
	queryTask(geometry: any, layerControlIndex: number) {
		const query = new Query({
			returnGeometry: true,
			outFields: ["*"], //结果要素包含的属性字段
		});
		query.geometry = geometry;
		
		this.allLayersControl[layerControlIndex].Layer.queryFeatures(query)
			.then((res: any) => {
				
				// 添加loading
				this.allLayersControl[layerControlIndex].sketch.queryData = res
			})
			.catch((err: any) => {
				// todo 给出提示
			})
	}
	
	/**
	 * 注销区域选择
	 * @param layerControlIndex
	 */
	destroySketch(layerControlIndex: number){
		// this.view.ui.remove(this.mapSketch)
		this.mapSketch.destroy()
		this.allLayersControl[layerControlIndex].sketch.show = false;
	}
	
	/**
	 * 移除查询选取
	 * @param layerControlIndex
	 */
	removeSketchQue(layerControlIndex: number){
		this.mapSketch.destroy()
		this.allLayersControl[layerControlIndex].sketch.show = false;
		this.allLayersControl[layerControlIndex].sketch.queryData = {};
		// 移除绘制图层数据
		this.graphicsLayer.removeAll();
		
		// todo 移除自定义叠加的图层
	}
	
	/**
	 * 初始化比例尺
	 */
	initScaleBar(){
		
		this.scaleBar = new ScaleBar({
			view: this.view
		});
		
		// 显示比例尺
		this.view.ui.add(this.scaleBar, {
			position: "bottom-left"
		});
	}
	
	/**
	 * 绘制来自图层的局部
	 * @param geometry
	 */
	addGraphicsByLayer(geometry:any){
		this.view.graphics.removeAll()
		
		// Create a symbol for rendering the graphic
		const fillSymbol = {
			type: "simple-fill", // autocasts as new SimpleFillSymbol()
			color: [227, 139, 79, 0.8],
			outline: {
				// autocasts as new SimpleLineSymbol()
				color: [255, 255, 255],
				width: 1
			}
		};
		
		// Add the geometry and symbol to a new graphic
		const polygonGraphic = new Graphic({
			geometry,
			symbol: fillSymbol
		});
		
		// Add the graphics to the view's graphics layer
		this.view.graphics.addMany([ polygonGraphic]);
	}
	
	makeCircle(event){
		var circle:any = new Circle({
			center : [event.longitude, event.latitude],//中心点坐标就是 [经度,纬度]
			numberOfPoints  : 80,//沿圆弧曲线的点数
			geodesic : true,//不考虑地形因素
			radius : 60//半径单位M
		});
		
		this.graphicsLayer.add(new Graphic({
			geometry:circle,
			symbol:  {
				type: "simple-fill", // autocasts as new SimpleFillSymbol()
				color: [227, 139, 79, 0.8],
				outline: {
					// autocasts as new SimpleLineSymbol()
					color: [255, 255, 255],
					width: 1
				}
			}
		}));
	}
}

</script>

<style lang="scss">
.home {
	display: flex;
	width: 100%;
	height: 100%;
	
	&-map {
		width: 100%;
		height: 100%;
	}
	
	/* 去掉地图聚焦边框 */
	.esri-view-surface--inset-outline:focus::after {
		outline: none !important;
	}
}

.oper {
	height: 100%;
	overflow-y: auto;
	min-width: 400px;
	padding: 15px;
	flex-grow: 0;
	flex-shrink: 0;
	
	&s {
		padding: 8px 12px 12px;
		margin-bottom: 20px;
		background-color: var(--weui-BG-0);
		border-radius: 10px;
		
		&-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 40px;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 8px;
		}
		
		&-tit {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 18px;
			margin-bottom: 6px;
		}
		
		&-m {
			padding: 10px;
			background-color: var(--weui-BG-2);
			border-radius: 8px;
			overflow: hidden;
			margin-bottom: 12px;
			
			&.disabled {
				opacity: 0.6;
			}
			
			&-list {
				&-tit {
					font-size: 18px;
				}
				
				&-cont {
					padding-left: 7px;
					
				}
			}
		}
		
		&-btn {
			display: flex;
			margin-bottom: 12px;
			
			&s {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 30px;
				border-radius: 20px;
				background-color: var(--weui-BG-2);
				cursor: pointer;
				padding: 0 10px 0 8px;
				margin-right: 10px;
				
				&-icon {
					font-size: 16px;
					padding-right: 3px;
				}
				
				&:hover {
					background-color: var(--weui-BLUE);
					color: var(--weui-BG-2);
				}
			}
		}
		
		&-feature {
			border-radius: 8px;
			padding: 12px 12px;
			background-color: var(--weui-BG-2);
		}
		
		&-sketch {
			border-radius: 8px;
			padding: 12px 12px;
			background-color: var(--weui-BG-2);
			margin-bottom: 12px;
		}
		
	}
}

.featureC {
	max-height: 400px;
	overflow-y: auto;
	
	&s {
		display: flex;
		background-color: var(--weui-BG-0);
		margin-bottom: 10px;
		cursor: pointer;
		padding: 12px 10px;
		border-radius: 6px;
		
		&:hover {
			background-color: #2d8cf0;
			color: #fff;
		}
		
		&-num {
			display: flex;
			justify-content: center;
			align-items: center;
			min-width: 20px;
			height: 20px;
			flex-shrink: 0;
			flex-grow: 0;
			padding: 0 5px;
			background-color: var(--weui-YELLOW);
			border-radius: 15px;
			color: #fff;
			margin-right: 10px;
		}
		
		&-name {
			width: 100%;
			flex-grow: 1;
			flex-shrink: 1;
		}
		
		&-btn {
			flex-grow: 0;
			flex-shrink: 0;
			display: flex;
			
			&s {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 24px;
				border-radius: 20px;
				color: var(--weui-FG-0);
				background-color: var(--weui-BG-3);
				cursor: pointer;
				padding: 0 10px 0 8px;
				margin-right: 10px;
				
				&-icon {
					font-size: 16px;
					padding-right: 3px;
				}
				
				&:hover {
					background-color: var(--weui-FG-2);
					color: var(--weui-BG-2);
				}
			}
		}
	}
}

.tool {
	display: flex;
	justify-content: flex-end;
	
	&s {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 3px 5px;
		border-radius: 5px;
		color: var(--weui-FG-HALF);
		border: 1px solid var(--weui-FG-3);
		cursor: pointer;
		
		&.red {
			&:hover {
				background-color: var(--weui-RED);
				color: var(--weui-BG);
			}
		}
		
		&-icon {
			padding: 5px 0;
			font-size: 24px;
		}
		
		&-label {
			font-size: 12px;
		}
	}
}
</style>
