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
				<div class="opers-btn">
					<div class="opers-btns" @click="goToLayer(control)">
						<div class="opers-btns-icon ivu-icon ivu-icon-md-pin"></div>
						<div class="opers-btns-t">定位</div>
					</div>
					<div class="opers-btns" v-if="index !== 0" @click="goInUp(control,index)">
						<div class="opers-btns-icon iconfont icon-shangyi"></div>
						<div class="opers-btns-t">上移</div>
					</div>
					<div class="opers-btns" v-if="index !== (allLayersControl.length -1) " @click="goInDown(control,index)">
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
import SceneView from "@arcgis/core/views/SceneView";
import TileLayer from "@arcgis/core/layers/TileLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

@Component({
	components: {
		HelloWorld,
	}
})
export default class Home extends Vue {
	
	private allLayersControl: Array<ILayerProperties> = [
		{
			layerType:'Tile',
			Layer: {},
			url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Housing_Density/MapServer",
			id: "ny-housing",
			name: '纽约住房',
			visible: true,
			opacity: 0.9
		},
		{
			layerType:'Tile',
			Layer: {},
			url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
			id: "streets",
			name: '全球街道',
			visible: true,
			opacity: 1
		},
		{
			layerType:'Feature',
			Layer: {},
			url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0",
			id: "FeatureServer",
			name: '服务层',
			visible: false,
			opacity: 1
		},
	]
	
	private sceneView: any
	private map: any
	
	public mounted(): void {
		this.createMapView()
	}
	
	/**
	 * 创建地图试视图
	 * @private
	 */
	private createMapView(): void {
		/*****************************************************************
		 统一创建Layer
		 *****************************************************************/
		this.allLayersControl = this.createTileLayers(this.allLayersControl)
		
		
		this.map = new Map({
			basemap: "oceans",
			/*****************************************************************
			 * 可以在地图的构造函数中将图层添加到地图
			 *****************************************************************/
			// layers: [Layer实体]
		});
		
		/*****************************************************************
		 * 或者通过 map.add() 方法对地图添加图层
		 *****************************************************************/
		// map.add(this.streetsControl.Layer);
		
		this.addLayers(this.allLayersControl)
		
		this.sceneView = new SceneView({
			container: "map",
			map: this.map
		});
		
		/*****************************************************************
		 * The map handles the layers' data while the view and layer views
		 * take care of renderering the layers
		 *****************************************************************/
		this.sceneView.on("layerview-create", function (event: { layer: { id: string; }; layerView: any; }) {
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
		 * 跳转至第一个视图的中心
		 * Layer会在SceneView加载完成后加载成功
		 *****************************************************************/
		this.sceneView.when(() => {
			const firstLayerControl = this.allLayersControl[0];
			firstLayerControl.Layer.when(() => {
				this.sceneView.goTo(firstLayerControl.Layer.fullExtent)
					.catch((error: { name: string; }) => {
						if (error.name != "AbortError") {
							console.error(error);
						}
					});
			});
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
		
		this.sceneView.goTo(control.Layer.fullExtent)
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
			
			switch (layerControl.layerType){
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
	goInUp(control: ILayerProperties,index: number): void {
		this.allLayersControl[index] = this.allLayersControl.splice(index-1, 1, this.allLayersControl[index])[0];
		this.refreshLayerIndex()
	}
	
	/**
	 * 下移图层
	 * @param control
	 * @param index
	 */
	goInDown(control: ILayerProperties,index:number): void {
		this.allLayersControl[index] = this.allLayersControl.splice(index+1, 1, this.allLayersControl[index])[0];
		this.refreshLayerIndex()
	}
	
	/**
	 * 刷新图层顺序
	 */
	refreshLayerIndex(){
		this.allLayersControl.map((c:ILayerProperties,index:number) => {
			this.map.reorder(c.Layer, this.allLayersControl.length - index - 1)
		})
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
	}
}
</style>
