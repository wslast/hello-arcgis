import "@arcgis/core/interfaces";
/**
 * 对图层进行渲染控制
 */
export interface ILayerProperties extends __esri.FeatureLayerProperties{
    // Layer 类型
    layerType: string,
    // Layer示例对象
    Layer: any,
    // Layer图层名称
    name: string,
}
