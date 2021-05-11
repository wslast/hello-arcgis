<template>
	<div class="home">
		<!--地图dom-->
		<div class="home-map" id="map"></div>
		<div class="oper">
			<!--			<div class="opers" v-for="key in allLayerContKey">-->
			<!--				<div class="opers-title">-->
			<!--					<div class="opers-title-n">{{ $data[key].name }}</div>-->
			<!--					<div class="opers-title-swich">-->
			<!--						<i-switch v-model="$data[key].visible" size="large" @on-change="layerVisibleChange(key)">-->
			<!--							<span slot="open">开启</span>-->
			<!--							<span slot="close">关闭</span>-->
			<!--						</i-switch>-->
			<!--					</div>-->
			<!--				</div>-->
			<!--				<div class="opers-btn">-->
			<!--					<div class="opers-btns" @click="goToLayer(key)">-->
			<!--						<div class="opers-btns-icon ivu-icon ivu-icon-md-pin"></div>-->
			<!--						<div class="opers-btns-t">定位</div>-->
			<!--					</div>-->
			<!--				</div>-->
			<!--				<div class="opers-m" :class="{disabled: !$data[key].visible}">-->
			<!--					<div class="opers-m-list">-->
			<!--						<div class="opers-m-list-tit">透明度</div>-->
			<!--						<div class="opers-m-list-cont">-->
			<!--							<Slider-->
			<!--								v-model="$data[key].opacity"-->
			<!--								:step="0.01"-->
			<!--								:min="0"-->
			<!--								:max="1"-->
			<!--								@on-change="layerOpacityChange(key)"-->
			<!--								@on-input="layerOpacityChange(key)"-->
			<!--								show-input>-->
			<!--							</Slider>-->
			<!--						</div>-->
			<!--					</div>-->
			<!--				</div>-->
			<!--			</div>-->
		</div>
		<!--<span id="layerToggle" class="esri-widget"> <input type="checkbox" id="streetsLayer" /> Transportation </span>-->
	</div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

import { loadModules} from "esri-loader";

interface LayerControl {
	// Layer示例对象
	Layer: any,
	// Layer服务地址
	url: string,
	// Layer唯一表示
	id: string,
	// Layer图层名称
	name: string,
	// Layer透明度
	opacity: Number,
	// Layer是否展示
	visible?: Boolean,
}

@Component({
	components: {
		HelloWorld,
	}
})
export default class Home extends Vue {
	
	public mounted(): void {
		this.LoadM()
	}
	
	// ArcGIS相关API
	private ArcGIS: any = {}
	// ArcGIS将引入的板块
	private ArcGISKeys: Array<string> = [
		"esri/map",
		"esri/config",
		"esri/tasks/ServiceAreaTask",
		"esri/tasks/ServiceAreaParameters",
		"esri/tasks/FeatureSet",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/geometry/Point",
		"esri/graphic",
		"dojo/parser",
		"dojo/dom",
		"dijit/registry",
		"esri/Color",
		"dojo/_base/array"
	]
	// 实例地图对象
	private map: any = null
	// 示例地图服务区
	private serviceAreaTask: any = null
	// 调用服务区参数
	private params: any = null
	
	/**
	 * 创建地图试视图
	 * @private
	 */
	private createMapView(): void {
		//This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to
		//replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic
		//for details on setting up a proxy page.
		// esriConfig.defaults.io.proxyUrl = "/proxy/";
		
		// 实例化地图
		this.map = new this.ArcGIS.map("map", {
			basemap: "streets",
			center: [-122.447, 37.781],
			zoom: 15
		});
		
		// 为地图添加点击时间
		this.map.on("click", (e: { mapPoint: { x: any; y: any; }; }) => this.mapClickHandler(e));
		
		// 实例化服务区
		this.createServiceA()
	}
	
	/**
	 * 加载资源
	 * @constructor
	 * @private
	 */
	private LoadM() {
		const options = {
			url: "https://js.arcgis.com/3.36/",
			css: "https://js.arcgis.com/3.36/esri/css/esri.css"
		};
		
		loadModules(["esri/map",
			"esri/config",
			"esri/tasks/ServiceAreaTask",
			"esri/tasks/ServiceAreaParameters",
			"esri/tasks/FeatureSet",
			"esri/symbols/SimpleMarkerSymbol",
			"esri/symbols/SimpleLineSymbol",
			"esri/symbols/SimpleFillSymbol",
			"esri/geometry/Point",
			"esri/graphic",
			"dojo/parser",
			"dojo/dom",
			"dijit/registry",
			"esri/Color",
			"dojo/_base/array"], options)
			.then(this.setLoadModules)
			.then(() => this.createMapView())
	}
	
	/**
	 * 实例化服务区
	 * @private
	 */
	private createServiceA() {
		// 实例化服务区
		this.serviceAreaTask = new this.ArcGIS.ServiceAreaTask("https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Service Area");
		
		// 实例化服务区参数
		this.params = new this.ArcGIS.ServiceAreaParameters();
		this.params.defaultBreaks = [1];
		this.params.outSpatialReference = this.map.spatialReference;
		
		this.params.returnFacilities = false;
	}
	
	
	setLoadModules(args: { [x: string]: any; }) {
		// 将 ArcGIS 的每个功能模块都存放到 ArcGIS 中
		for (let k in args) {
			let name = this.ArcGISKeys[Number(k)].split('/').pop() || 'n'
			name = 'domReady!' === name ? "arrayUtils" : name
			this.ArcGIS[name] = args[k]
		}
	}
	
	private mapClickHandler(evt: { mapPoint: { x: any; y: any; }; }) {
		// 清除现有图形graphics
		this.map.graphics.clear();
		
		const iconSvgPath = "M815.4624 0A279.6544 279.6544 0 0 0 537.6 283.5968c0 118.8864 75.6736 253.8496 139.9808 345.2416 50.5344 70.9632 103.3216 130.3552 126.2592 157.8496a19.456 19.456 0 0 0 11.52 6.8096 15.7184 15.7184 0 0 0 11.4176-6.8096 1751.04 1751.04 0 0 0 126.2592-157.8496c64.256-91.392 140.032-226.4064 140.032-345.2416A279.7056 279.7056 0 0 0 815.36 0z m0 396.7488a119.04 119.04 0 1 1 119.04-119.04 119.3472 119.3472 0 0 1-119.04 119.04z m-119.1424 350.72l-615.7824-32.8704 71.68-250.88a28.3136 28.3136 0 0 1 26.5728-21.6064l317.44-10.24a981.2992 981.2992 0 0 0 76.1856 157.9008 1757.8496 1757.8496 0 0 0 123.904 157.696z m-200.1408 276.48l-464.896-2.7648a24.6272 24.6272 0 0 1-24.2176-11.9808C0 1004.4928 0 994.816 0 985.1392l62.8224-218.7776 598.6304 39.8336L496.64 1023.8976z m574.6688-182.6816l-185.088-17.152q58.9312-72.2944 115.3536-146.6368c2.3552-9.5232 9.6768-14.3872 14.4384-23.9616z m36.5056 139.008c0 2.3552 2.4576 7.2192 2.4576 9.6256a31.7952 31.7952 0 0 1-31.4368 31.2832H543.9488l168.6016-204.8 368.3328 67.9424 26.6752 96.1024z";
		
		// 点Symbol
		let pointSymbol = new this.ArcGIS.SimpleMarkerSymbol();
		pointSymbol.setPath(iconSvgPath)
		pointSymbol.setColor("#ff3030");
		pointSymbol.setOutline(null);
		pointSymbol.setSize("32");
		
		// 通过点击实例化点位
		let inPoint = new this.ArcGIS.Point(evt.mapPoint.x, evt.mapPoint.y, this.map.spatialReference);
		// 实例化Graphic
		let location = new this.ArcGIS.graphic(inPoint, pointSymbol);
		
		this.map.graphics.add(location);
		console.log(this.map.graphics)
		
		// 实例化特征
		let facilities = new this.ArcGIS.FeatureSet();
		facilities.features = [location];
		this.params.facilities = facilities;
		
		//solve
		this.serviceAreaTask.solve(this.params, (solveResult: { serviceAreaPolygons: any; }) => {
			// 实例化多变形Symbol
			let polygonSymbol = new this.ArcGIS.SimpleFillSymbol(
				"solid",
				null,
				new this.ArcGIS.Color('rgba(73,255,41,0.62)'),
			);
			console.log(this.ArcGIS.array)
			this.ArcGIS.array.forEach(solveResult.serviceAreaPolygons, (serviceArea: { setSymbol: (arg0: any) => void; }) => {
				serviceArea.setSymbol(polygonSymbol);
				this.map.graphics.add(serviceArea);
			});
			
		}, () => {});
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
}

.oper {
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
		
		&-m {
			padding: 10px;
			background-color: var(--weui-BG-2);
			border-radius: 8px;
			overflow: hidden;
			
			&.disabled {
				opacity: 0.6;
			}
			
			&-list {
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
	}
}
</style>
