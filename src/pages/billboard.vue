<template>
  <div>
    <vc-viewer @ready="ready">
      <div id="info"></div>
    </vc-viewer>
    <div class="page-btn-action">
      <a-button type="primary" @click="addMark">设置广告牌</a-button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      viewer: null,
    }
  },
  methods: {
    ready(instance) {
      const { Cesium, viewer } = instance
      this.viewer = viewer;
      const imageryProvider = new Cesium.MapboxStyleImageryProvider({
        url: "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
      });

      this.viewer.imageryLayers.addImageryProvider(imageryProvider)
    },
    addMark() {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          106.48289044313123,
          29.61231013622676,
          10
        ),
        duration: 2,
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-10),
          roll: 0,
        },
      });

      var id = 'id' + new Date().getTime();
      console.log("id = " + id);
      var billboard = this.viewer.entities.add({
        id: id,
        name: 'billboard',
        description: '这是一个广告牌',
        position: new Cesium.Cartesian3.fromDegrees(106.48289044313123, 29.61231013622676, 10),
        label: {
          text: 'teateq',
          color: Cesium.Color.fromCssColorString('#fff'),
          font: 'normal 32px MicroSoft YaHei',
          showBackground: true,
          scale: 1,
          scaleByDistance: new Cesium.NearFarScalar(100, 2, 500, 0.0),
        },
        // billboard: {
        //   image: require('../assets/images/marker.png'),
        //   width: 32,
        //   height: 32
        // }
      });
    }
  }
}
</script>
<style scoped>
#info {
  position: absolute;
  width: 100px;
  height: 100px;
  z-index: 1000;
  display: none;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid greenyellow;
  border-radius: 4px;
}
</style>