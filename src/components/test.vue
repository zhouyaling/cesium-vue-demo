<template>
  <div class="viewer">
    <!-- 配置 -->
    <div class="demo-action">
      <a-button type="primary" @click="addFire">加载火焰</a-button>
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
      <vc-layer-imagery
        :alpha="alpha"
        :brightness="brightness"
        :contrast="contrast"
        :sortOrder="10"
      >
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
      url: 'http://api0.map.bdimg.com/customimage/tile?=&x={x}&y={y}&z={z}&scale=1&customid=midnight',
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
      this.showAction = true;

      const p = new Cesium.Cartesian3.fromDegrees(106.4793100996493, 29.610230390624693, 0)
    },

    // 
    addFire() {

    },
  }
}
</script>