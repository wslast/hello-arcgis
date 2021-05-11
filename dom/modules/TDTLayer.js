define([
    "esri/layers/TileInfo",
    "esri/layers/TiledMapServiceLayer",
    'esri/geometry/Extent',
    "esri/geometry/Point",
    "esri/SpatialReference",
    "dojo/_base/lang",
    "dojo/_base/declare"
], function(
    TileInfo,
    TiledMapServiceLayer,
    Extent,
    Point,
    SpatialReference,
    lang,
    declare
){
    return declare([TiledMapServiceLayer], {
        constructor: function() {
            this.spatialReference = new SpatialReference({ wkid:4326 });
            
            this.initialExtent = (this.fullExtent = new Extent(-180.0,
                -90.0, 180.0, 90.0, this.spatialReference));
            
            this.tileInfo = new TileInfo({
                "rows" : 256,
                "cols" : 256,
                "origin" : {
                    "x" : -180,
                    "y" : 90
                },
                "spatialReference" : {
                    "wkid" : 4326
                },
                "lods": [
                    {"level": "1", "scale": 295829355.45, "resolution": 0.703125},
                    {"level": "2", "scale": 147914677.725, "resolution": 0.3515625},
                    {"level": "3", "scale": 73957338.8625, "resolution": 0.17578125},
                    {"level": "4", "scale": 36978669.43125, "resolution": 0.087890625},
                    {"level": "5", "scale": 18489334.715625, "resolution": 0.0439453125},
                    {"level": "6", "scale": 9244667.3578125, "resolution": 0.02197265625},
                    {"level": "7", "scale": 4622333.67890625, "resolution": 0.010986328125},
                    {"level": "8", "scale": 2311166.839453125, "resolution": 0.0054931640625},
                    {"level": "9", "scale": 1155583.4197265625, "resolution": 0.00274658203125},
                    {"level": "10", "scale": 577791.7098632812, "resolution": 0.001373291015625},
                    {"level": "11", "scale": 288895.8549316406, "resolution": 0.0006866455078125},
                    {"level": "12", "scale": 144447.9274658203, "resolution": 0.00034332275390625},
                    {"level": "13", "scale": 72223.96373291015, "resolution": 0.000171661376953125},
                    {"level": "14", "scale": 36111.98186645508, "resolution": 0.0000858306884765625},
                    {"level": "15", "scale": 18055.99093322754, "resolution": 0.00004291534423828125},
                    {"level": "16", "scale": 9027.99546661377, "resolution": 0.000021457672119140625},
                    {"level": "17", "scale": 4513.997733306885, "resolution": 0.000010728836059570312},
                    {"level": "18", "scale": 2256.9988666534423, "resolution": 0.000005364418029785156},
                    {"level": "19", "scale": 1128.4994333267211, "resolution": 0.000002682209014892578}
                ]
            });
            this.loaded = true;
            this.onLoad(this);
        },
        getTileUrl: function (level, row, col) {
            return "http://t0.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL="+ col + "&FORMAT=tiles"+"&tk=02bfaceb68be37589fe97da1f860c873";
        }
    });
});
