<template>
  <div>
    <vc-viewer @ready="ready">
      <div id="info"></div>
    </vc-viewer>
    <div class="page-btn-action">
      <a-button type="primary" @click="addLine">设置飞线</a-button>
      <a-button type="primary" @click="drawWall">设置流动墙</a-button>
      <a-button type="primary" @click="editWall">修改墙面颜色</a-button>
    </div>
  </div>
</template>
<script>
import { degreeToCartesian3 } from '@/js/transferData.js'
export default {
  data() {
    return {
      viewer: null,
      wyoming: null,
    }
  },
  methods: {
    ready(instance) {
      const { Cesium, viewer } = instance
      this.viewer = viewer;
    },
    editWall() {
      this.viewer.entities.removed(this.wyoming)
    },

    drawWall() {
      let lat = 30.598026044;
      let lng = 114.302312702;

      let positions = [
        { lng: lng - 0.5, lat: lat - 0.5, height: 10000 },
        { lng: lng - 3, lat: lat, height: 10000 },
        { lng: lng - 3, lat: lat - 1, height: 10000 },
        { lng: lng - 1, lat: lat - 3, height: 10000 },
        { lng: lng - 0.5, lat: lat - 0.5, height: 10000 }
      ];

      let newPositions = degreeToCartesian3(positions)

      var alp = 1;
      var num = 0;
      //绘制墙
      this.wyoming = this.viewer.entities.add({
        name: "动态立体墙",
        wall: {
          show: true,
          positions: newPositions,
          material: new Cesium.ImageMaterialProperty({
            image: require("../assets/images/wall.png"),
            transparent: true,
            color: new Cesium.CallbackProperty(function () {

              if ((num % 2) === 0) {
                alp -= 0.005;
              } else {
                alp += 0.005;
              }

              if (alp <= 0.3) {
                num++;
              } else if (alp >= 1) {
                num++;
              }
              return Cesium.Color.WHITE.withAlpha(alp)
              //entity的颜色透明 并不影响材质，并且 entity也会透明
            }, false)
          })
        }
      });
      this.viewer.zoomTo(this.wyoming);//相机到entity的位置
    },

    addLine() {
      // 自定义流动纹理材质
      let material = new Cesium.PolylineFlowMaterialProperty({
        color: Cesium.Color.ORANGE,
        duration: 200
      })

      // 创建OD线
      const url = "../../static/jsonData/china.json";
      let promise = Cesium.GeoJsonDataSource.load(url);
      promise.then((dataSource) => {
        let entities = dataSource.entities.getValue()
        for (let o = 0; o < entities.length; o++) {
          let r = entities[o];
          r.polyline.material = material;
          r.polyline.width = 5;
        }
      })

    },
  }
}
</script>