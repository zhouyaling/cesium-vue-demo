<template>
  <div class="viewer">
    <vc-viewer @ready="ready">
      <vc-layer-imagery>
        <vc-provider-imagery-tianditu
          mapStyle="img_c"
          token="436ce7e50d27eede2f2929307e6b33c0"
        ></vc-provider-imagery-tianditu>
      </vc-layer-imagery>
    </vc-viewer>
  </div>
</template>
<script>
export default {
  data() {
    return {
      viewer: null
    }
  },
  mounted() {

  },
  methods: {
    ready(cesiumInstance) {
      const { Cesium, viewer } = cesiumInstance;
     
      this.viewer = viewer

      //    viewer.entities.add({
      //     id: '成都欢迎你',
      //     position: Cesium.Cartesian3.fromDegrees(104.06, 30.67, 100),
      //     billboard: new Cesium.BillboardGraphics({
      //       image: 'https://zouyaoji.top/vue-cesium/favicon.png',
      //       scale: 0.1
      //     }),
      //     label: new Cesium.LabelGraphics({
      //       text: 'Hello Cesium',
      //       font: '24px sans-serif',
      //       horizontalOrigin: 1,
      //       outlineColor: new Cesium.Color(0, 0, 0, 1),
      //       outlineWidth: 2,
      //       pixelOffset: new Cesium.Cartesian2(17, -5),
      //       style: Cesium.LabelStyle.FILL
      //     })
      //   })
    }
  }
}
</script>
<style scoped>
.index-page {
  width: 100%;
  height: 100%;
  background-color: #000;
}
</style>