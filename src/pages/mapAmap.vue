<template>
  <div>
    <vc-viewer @ready="ready">
      <div class="page-btn-action">
        <a-button type="primary" @click="changeStyle(1)">电子街道</a-button>
        <a-button type="primary" @click="changeStyle(2)"
          >自定义底图样式</a-button
        >
      </div>
    </vc-viewer>
  </div>
</template>
<script>
export default {
  methods: {
    ready(cesiumInstance) {
      const { Cesium, viewer } = cesiumInstance
      let imageryProvider = new Cesium.MapboxStyleImageryProvider({
        url: "https://webst02.istonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
        // url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
      });

      viewer.imageryLayers.addImageryProvider(imageryProvider);
      this.viewer = viewer;

    },

    changeStyle(number) {
      if (number == 1) {
        let imageryProvider = new Cesium.MapboxStyleImageryProvider({
            url: "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",

        });

        this.viewer.imageryLayers.addImageryProvider(imageryProvider);
      } else if (number == 2) {
        let imageryProvider = new Cesium.MapboxStyleImageryProvider({
          url: "https://api.mapbox.com/styles/v1",
          username: "zhouyaling",
          styleId: 'cjrbqt0np29ov2stg4uhaul3g',
          accessToken:
            "pk.eyJ1IjoiemhvdXlhbGluZyIsImEiOiJjanJibnQ3Y3cwNmU3NDNwNHBjNHFscWc1In0.ir-kFtEbcIM_X6HhvgByiA",
          scaleFactor: true,
        });

        this.viewer.imageryLayers.addImageryProvider(imageryProvider);
      }
    }

  }
}
</script>