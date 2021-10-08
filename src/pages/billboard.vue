<template>
  <div>
    <vc-viewer @ready="ready">
      <div id="info"></div>
      <!-- 热力图 -->
      <vc-heatmap
        v-if="showHeatMap"
        ref="heatMap"
        :bounds="bounds"
        :options="options"
        :min="min"
        :max="max"
        :data="data"
        :type="1"
        @ready="subReady"
      >
      </vc-heatmap>
    </vc-viewer>
    <div class="page-btn-action">
      <a-button type="primary" @click="addMark">设置文本</a-button>
      <a-button type="primary" @click="addMarkImage">设置点位</a-button>
      <a-button type="primary" @click="addMarkHtml">添加html</a-button>
      <a-button type="primary" @click="loadHeatMap">加载热力图</a-button>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import { resultData } from '@/js/heatmap.js'

let Popup = null;

export default {
  data() {
    return {
      viewer: null,
      showHeatMap: false,
      // 热力图
      showHeatMap: false,
      bounds: { west: 80.0, south: 30.0, east: 109.0, north: 50.0 },
      options: {
        backgroundColor: 'rgba(0,0,0,0)',
        gradient: {
          // enter n keys between 0 and 1 here
          // for gradient color customization
          '0.9': 'red',
          '0.8': 'orange',
          '0.7': 'yellow',
          '0.5': 'blue',
          '0.3': 'green'
        },
        // minCanvasSize: 10,
        // maxCanvasSize: 100,
        radius: 250,
        maxOpacity: 0.5,
        minOpacity: 0,
        blur: 0.75
      },
      data: [],
      min: 0,
      max: 0,
      positionsParabola: [],
    }
  },
  mounted() {
    this.initPopup();
  },
  methods: {
    // 加载热力图
    loadHeatMap() {
      this.showHeatMap = true
      let data = resultData;
      this.bounds = {
        west: data.left,
        south: data.bottom,
        east: data.right,
        north: data.top
      }
      this.min = data.min
      this.max = data.max
      this.data = data.datas

      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          103.6875,
          32.0625,
          260000
        ),
        duration: 2,
        orientation: {
          heading: Cesium.Math.toRadians(1.0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });


    },

    subReady({ Cesium, viewer, cesiumObject }) {
      this.$refs.heatmap.$refs.childRef.createPromise.then(({ Cesium, viewer, cesiumObject }) => {
        console.log(cesiumObject)
        if (cesiumObject instanceof Cesium.GroundPrimitive) {
          setTimeout(() => {
            const geometry = cesiumObject.geometryInstances.geometry.constructor.createGeometry(cesiumObject.geometryInstances.geometry)
            viewer.scene.camera.flyToBoundingSphere(geometry.boundingSphere)
          }, 500)
        } else if (cesiumObject instanceof Cesium.Entity) {
          viewer.flyTo(cesiumObject)
        } else {
          viewer.camera.flyTo({ destination: cesiumObject.imageryProvider.rectangle })
        }
      })
    },

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
          106.491032, 29.613683,
          6000
        ),
        duration: 2,
        orientation: {
          heading: Cesium.Math.toRadians(1.0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });

      var id = 'id' + new Date().getTime();
      console.log("id = " + id);
      var billboard = this.viewer.entities.add({
        id: id,
        name: 'billboard',
        description: '这是信达国际',
        position: new Cesium.Cartesian3.fromDegrees(106.491032, 29.613683, 10),
        label: {
          text: '信达国际',
          color: Cesium.Color.fromCssColorString('#fff'),
          font: 'normal 40px MicroSoft YaHei',
          showBackground: true,
          scale: 1,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1, 5000, 1.0),
        },
        // billboard: {
        //   image: require('../assets/images/marker.png'),
        //   width: 32,
        //   height: 32
        // }
      });
    },

    addMarkImage() {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          106.48289044313123,
          29.61001016623676,
          6000
        ),
        duration: 2,
        orientation: {
          heading: Cesium.Math.toRadians(1.0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });

      var id = 'id' + new Date().getTime();
      console.log("id = " + id);
      var billboard = this.viewer.entities.add({
        id: id,
        name: 'billboard',
        description: '这是一个广告牌图片',
        position: new Cesium.Cartesian3.fromDegrees(106.48289044313123, 29.61031016623676, 0),
        billboard: {
          image: require('../assets/images/marker.png'),
          width: 32,
          height: 32
        }
      });
    },

    // 初始化弹窗对象
    initPopup() {
      // 创建弹窗对象的方法
      Popup = function (info) {
        this.constructor(info);
      }
      Popup.prototype.id = 0;
      Popup.prototype.constructor = function (info) {
        var _this = this;
        _this.viewer = info.viewer;//弹窗创建的viewer
        _this.geometry = info.geometry;//弹窗挂载的位置
        _this.id = "popup_" + _this.__proto__.id++;
        _this.ctn = $("<div class='bx-popup-ctn' id =  '" + _this.id + "'>");
        $(_this.viewer.container).append(_this.ctn);
        //测试弹窗内容
        var testConfig = {
          header: info.name,
          content: "<div>这里是" + info.name + "</div>",
        }
        _this.ctn.append(_this.createHtml(testConfig.header, testConfig.content));

        _this.render(_this.geometry);
        _this.eventListener = _this.viewer.clock.onTick.addEventListener(function (clock) {
          _this.render(_this.geometry);
        })
      }
      // 实时刷新
      Popup.prototype.render = function (geometry) {
        var _this = this;
        var position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_this.viewer.scene, geometry)
        _this.ctn.css("left", position.x - _this.ctn.get(0).offsetWidth / 2);
        _this.ctn.css("top", position.y - _this.ctn.get(0).offsetHeight - 10);
      }
      // 动态生成内容
      Popup.prototype.createHtml = function (header, content) {
        var html = '<div class="bx-popup-header-ctn">' +
          header +
          '</div>' +
          '<div class="bx-popup-content-ctn" >' +
          '<div class="bx-popup-content" >' +
          content +
          '</div>' +
          '</div>' +
          '<div class="bx-popup-tip-container" >' +
          '<div class="bx-popup-tip" >' +
          '</div>' +
          '</div>' +
          '';
        return html;
      }
      // 关闭弹窗按钮
      Popup.prototype.close = function () {
        var _this = this;
        _this.ctn.remove();
        _this.viewer.clock.onTick.removeEventListener(_this.eventListener);
      }
    },

    addMarkHtml() {
      var list = [
        {
          lat: '29.61001016623676',
          lng: '106.48289044313123',
          name: '金科十年城'
        },
        {
          lat: 29.65681,
          lng: 106.478565,
          name: '金科九曲河'
        },
        {
          lat: 29.627946,
          lng: 106.528741,
          name: '金科天湖美镇'
        },
        {
          lat: 40.174509,
          lng: 116.424372,
          name: '北京金科王府'
        },
        {
          lat: 30.560355,
          lng: 104.178038,
          name: '金科东方雅郡'
        }, {
          lat: 28.752897,
          lng: 115.821129,
          name: '金科·集美阳光'
        },
      ]

      list.forEach(element => {
        var viewer = this.viewer;
        var cartesian = Cesium.Cartesian3.fromDegrees(element.lng, element.lat, 0)

        // 调用弹窗方法
        var popup = new Popup({
          viewer: viewer,
          geometry: cartesian,
          name: element.name
        })
      });



      // var handler3D = new Cesium.ScreenSpaceEventHandler(
      //   viewer.scene.canvas);
      // handler3D.setInputAction(function (click) {
      //   console.log("click-------")
      //   var pick = new Cesium.Cartesian2(click.position.x, click.position.y);
      //   if (pick) {
      //     // 获取点击位置坐标
      //     var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(pick), viewer.scene);
      //     console.log(cartesian)
      //     if (cartesian) {
      //       // 调用弹窗方法
      //       var popup = new Popup({
      //         viewer: viewer,
      //         geometry: cartesian
      //       })
      //     }
      //   }
      // }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

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
<style>
.bx-popup-ctn {
  position: absolute;
  z-index: 999;
  background: #fff;
}
.bx-popup-tip-container {
  width: 40px;
  height: 20px;
  position: absolute;
  left: 50%;
  margin-left: -20px;
  overflow: hidden;
  pointer-events: none;
}
.bx-popup-tip {
  width: 17px;
  background: #fff;
  height: 17px;
  padding: 1px;
  margin: -10px auto 0;
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
.bx-popup-header-ctn {
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 15px;
  padding: 4px;
  text-align: center;
}
.bx-popup-content-ctn {
  padding: 15px;
}
.leaflet-popup-close-button {
  user-select: auto;
  position: absolute;
  right: 0;
  top: 0;
  color: #fff;
  cursor: pointer;
}
</style>