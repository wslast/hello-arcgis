<template>
	<div class="home">
		<!--地图dom-->
		<div class="home-map" id="map"></div>
		<div class="oper">
			<div class="opers" v-for="key in allLayerContKey">
				<div class="opers-title">
					<div class="opers-title-n">{{ $data[key].name }}</div>
					<div class="opers-title-swich">
						<i-switch v-model="$data[key].visible" size="large" @on-change="layerVisibleChange(key)">
							<span slot="open">开启</span>
							<span slot="close">关闭</span>
						</i-switch>
					</div>
				</div>
				<div class="opers-btn">
					<div class="opers-btns" @click="goToLayer(key)">
						<div class="opers-btns-icon ivu-icon ivu-icon-md-pin"></div>
						<div class="opers-btns-t">定位</div>
					</div>
				</div>
				<div class="opers-m" :class="{disabled: !$data[key].visible}">
					<div class="opers-m-list">
						<div class="opers-m-list-tit">透明度</div>
						<div class="opers-m-list-cont">
							<Slider
								v-model="$data[key].opacity"
								:step="0.01"
								:min="0"
								:max="1"
								@on-change="layerOpacityChange(key)"
								@on-input="layerOpacityChange(key)"
								show-input>
							</Slider>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!--<span id="layerToggle" class="esri-widget"> <input type="checkbox" id="streetsLayer" /> Transportation </span>-->
	</div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

import {loadModules} from "esri-loader";

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
	
	private allLayerContKey: Array<string> = ["streetsControl", "housingControl"]
	
	private streetsControl: LayerControl = {
		Layer: {},
		url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
		id: "streets",
		name: '全球街道',
		visible: false,
		opacity: 1
	}
	
	private housingControl: LayerControl = {
		Layer: {},
		url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Housing_Density/MapServer",
		id: "ny-housing",
		name: '纽约住房',
		visible: true,
		opacity: 0.9
	}
	
	private view: any
	
	public mounted(): void {
		this.createMapView()
	}
	
	/**
	 * 创建地图试视图
	 * @private
	 */
	private createMapView(): void {
		const options = {
			url: "https://js.arcgis.com/4.18/",
			css: "https://js.arcgis.com/4.18/esri/themes/light/main.css"
		};
		
		loadModules(["esri/Map", "esri/views/SceneView", "esri/layers/TileLayer"], options)
			.then(
				([Map, SceneView, TileLayer]) => {
					/*****************************************************************
					 * Create two TileLayer instances. One pointing to a
					 * cached map service depicting U.S. male population and the other
					 * pointing to a layer of roads and highways.
					 *****************************************************************/
					this.streetsControl.Layer = new TileLayer({...this.streetsControl});
					
					this.housingControl.Layer = new TileLayer({...this.housingControl});
					
					/*****************************************************************
					 * Layers may be added to the map in the map's constructor
					 *****************************************************************/
					const map = new Map({
						basemap: "oceans",
						layers: [this.housingControl.Layer]
					});
					
					/*****************************************************************
					 * Or they may be added to the map using map.add()
					 *****************************************************************/
					map.add(this.streetsControl.Layer);
					
					this.view = new SceneView({
						container: "map",
						map: map
					});
					
					/*****************************************************************
					 * The map handles the layers' data while the view and layer views
					 * take care of renderering the layers
					 *****************************************************************/
					this.view.on("layerview-create", function (event: { layer: { id: string; }; layerView: any; }) {
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
					
					/*****************************************************************
					 * Layers are promises that resolve when loaded, or when all their
					 * properties may be accessed. Once the population layer has loaded,
					 * the view will animate to it's initial extent.
					 *****************************************************************/
					this.view.when(() => {
						// debugger
						this.housingControl.Layer.when(() => {
							// debugger
							this.view.goTo(this.housingControl.Layer.fullExtent)
								.catch((error: { name: string; }) => {
									if (error.name != "AbortError") {
										console.error(error);
									}
								});
						});
					});
				}
			);
	}
	
	/**
	 * switch event to change Layer Visible
	 * @param key
	 * @private
	 */
	private layerVisibleChange(key: string): void {
		this.$data[key].Layer.visible = this.$data[key].visible
	}
	
	/**
	 * 滑块dom值发生改变，切换图层透明度
	 * @param key
	 * @private
	 */
	private layerOpacityChange(key: string): void{
		this.$data[key].Layer.opacity = this.$data[key].opacity
	}
	
	/**
	 * 点击切换视图为指定图层的全幅zoom
	 * @param key
	 * @private
	 */
	private goToLayer(key: string): void {
		
		if(!this.$data[key].visible){
			return
		}
		
		this.view.goTo(this.$data[key].Layer.fullExtent)
			.catch((error: { name: string; }) => {
				if (error.name != "AbortError") {
					console.error(error);
				}
			});
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
