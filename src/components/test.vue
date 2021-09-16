<template>
  <div class="viewer">
    <!-- 配置 -->
    <div v-if="showAction" class="demo-action">
      <a-button type="primary" @click="flyAllowPath">第一人称漫游</a-button>
    </div>
    <vc-viewer
      ref="vcViewer"
      :animation="animation"
      :fullscreenButton="fullscreenButton"
      :homeButton="homeButton"
      :infoBox="infoBox"
      :baseLayerPicker="baseLayerPicker"
      :vrButton="vrButton"
      :geocoder="geocoder"
      :timeline="timeline"
      :sceneModePicker="true"
      :autoSortImageryLayers="false"
      @ready="ready"
    >
      <!-- 影像图层 -->
      <vc-layer-imagery
        :alpha="alpha"
        :brightness="brightness"
        :contrast="contrast"
        :sortOrder="20"
      >
        <!-- 百度地图 ok -->
        <vc-provider-imagery-baidumap
          :url="url"
          :projectionTransforms="projectionTransforms"
        ></vc-provider-imagery-baidumap>
      </vc-layer-imagery>
    </vc-viewer>
  </div>
</template>
<script>
import { resultData } from '@/js/heatmap.js'
import { gpsData, flightData } from '@/js/gps.js'
import transferData from "@/js/transferData";
const lat = 30.598026044
const lng = 114.302312702
export default {
  name: "HelloWorld",
  data() {
    return {
      modelUri: "static/models/Cesium_Air.glb",
      $$map: {},
      showAction: false,
      viewer: null,
      // 容器配置
      animation: true,
      fullscreenButton: true,
      homeButton: true,
      infoBox: true,
      baseLayerPicker: true,
      vrButton: true,
      geocoder: true,
      timeline: true,
      // 影像图层配置
      alpha: 1,
      brightness: 1,
      contrast: 1,
      url: "http://shangetu1.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46", //'https://www.songluck.com/map/data/maptile-baidu-chongqing/{z}/{x}/{y}.png',
      projectionTransforms: {
        form: 'BD09',
        to: 'gcj02',//'WGS84'
      },
      projectionTransforms1: { from: 'GCJ02', to: 'WGS84' },
    }
  },
  methods: {
    // 回调函数
    ready(cesiumInstance) {
      const { Cesium, viewer } = cesiumInstance;
      this.viewer = viewer;
      // 设置颜色
      this.viewer.scene.globe.depthTestAgainstTerrain = true;
      this.viewer.scene.globe.imageryLayers.get(0).alpha = 0.0;
      this.viewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0); //默认为蓝色，这里改成绿色
      this.showAction = true;
    },

    flyAllowPath(){
      
    }
  }
}
</script>