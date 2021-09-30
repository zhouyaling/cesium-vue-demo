<template>
  <div class="page-box">
    <div id="fengmap"></div>
    <div class="page-action">
      <button @click="addTilelayer">矢量瓦片</button><br />
      <button @click="addTilelayerAMAP">卫星影像</button><br />
      <button @click="show">隐藏/显示</button><br />
      <button @click="deleteMarker">删除</button>
    </div>
  </div>
</template>
<script>
// import fengmap from "@/assets/lib/fengmap.map.min"; //核心包
// import "@/assets/lib/fengmap.analyser.min"; //分析器
// import "@/assets/lib/fengmap.plugin.min"; //插件包
// import "@/assets/lib/fengmap.effect.min"; //特效包

let tileLayer;
let tileLayerAMAP;
let flag;
export default {
  data() {
    return {
      map: null,
    }
  },
  mounted() {
    var options = {
      // appName: '可视化',
      // key: 'e776f9ff58f2871418750a387e97c990',
      // mapID: '1443106857163644929',

      appName: '蜂鸟研发SDK_2_0',
      key: '57c7f309aca507497d028a9c00207cf8',
      mapID: '1321274646113083394',

      mapURL: 'static/data/data/',
      themeURL: 'static/data/data/',
      themeID: '1351477465818427393',
      backgroundAlpha: 0.00,
      mapZoom: 21,
      zoomRange: [19, 23],
      tiltAngle: 60,

      container: document.getElementById('fengmap'),
    }
    this.map = new fengmap.FMMap(options);

    this.map.on('loaded', () => {
      this.addTilelayer();

    });
  },
  methods: {
    addTilelayer() {

      if (tileLayer != null) {
        tileLayer.remove(this.map);
        tileLayer = null;
      }

      if (tileLayerAMAP != null) {
        tileLayerAMAP.remove(this.map);
        tileLayerAMAP = null;
      }

      tileLayer = new fengmap.FMTileLayer({
        //百度矢量图替换BAIDU_VECTOR
        mode: fengmap.FMTileProvider.AMAP_VECTOR,
        offset: 1.0,
      })

      tileLayer.addTo(this.map);
      flag = true;
    },
    addTilelayerAMAP() {
      if (tileLayer != null) {
        tileLayer.remove(this.map);
        tileLayer = null;
      }
      if (tileLayerAMAP != null) {
        tileLayerAMAP.remove(this.map);
        tileLayer = null;
      }
      tileLayerAMAP = new fengmap.FMTileLayer({
        //百度卫星图替换BAIDU_SATELLITE  
        mode: fengmap.FMTileProvider.AMAP_SATELLITE,
        offset: 1.0
      })

      tileLayerAMAP.addTo(this.map);
      flag = false;
    },

    //删除
    deleteMarker() {

      if (flag) {
        tileLayer.remove(this.map);
        tileLayer = null;
      } else {
        tileLayerAMAP.remove(this.map);
        tileLayerAMAP = null;
      }
    },

    //隐藏、显示
     show() {
      if (flag) {
        tileLayer.visible = !tileLayer.visible;
      } else {
        tileLayerAMAP.visible = !tileLayerAMAP.visible;
      }
    }
  }
}
</script>
<style scoped>
.page-box {
  width: 100%;
  height: 100%;
  position: relative;
}

.page-box .page-action {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
<style >
.page-box canvas {
  left: 0 !important;
}
</style>