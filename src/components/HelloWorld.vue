<template>
  <div class="viewer">
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
      @ready="ready"
    >
      <!-- 影像图层 -->
      <vc-layer-imagery
        :alpha="alpha"
        :brightness="brightness"
        :contrast="contrast"
      >
        <vc-provider-imagery-tianditu
          mapStyle="img_c"
          token="436ce7e50d27eede2f2929307e6b33c0"
        ></vc-provider-imagery-tianditu>
      </vc-layer-imagery>
      <!-- 流动墙 -->
      <vc-trail-wall
        v-show="showWall"
        :positions="positions"
        color="yellow"
        :minimumHeights="minimumHeights"
        imageUrl="https://zouyaoji.top/vue-cesium-v2/statics/SampleData/images/colors1.png"
        ref="wall"
        :interval="5000"
      ></vc-trail-wall>

      <!-- 增加点 -->
      <template v-if="showPoint">
        <template v-for="(item, index) in gpsList">
          <vc-entity ref="point" :position="item" :key="index">
            <vc-graphics-point color="red" :pixelSize="2"></vc-graphics-point>
          </vc-entity>
        </template>
      </template>

      <!-- html定牌 -->
      <vc-overlay-html
        v-if="showHtml"
        :position="positionModal"
        :pixelOffset="{ x: 0, y: -89 }"
      >
        <div class="vc-dialog">
          <div class="main">
            <div class="">金科服务</div>
          </div>
          <div class="line"></div>
        </div>
      </vc-overlay-html>

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

      <!-- 流动线 -->
      <!-- <vc-trail-polyline
        :positions="positionsLine"
        color="yellow"
        imageUrl="./statics/SampleData/images/colors1.png"
        :width="5"
        ref="line"
        :loop="false"
        clampToGround
      ></vc-trail-polyline> -->
    </vc-viewer>

    <!-- 配置 -->
    <div v-if="showAction" class="demo-action">
      <div class="demo-tool">
        <span>透明度</span>
        <a-slider v-model="alpha" :min="0" :max="1" :step="0.01" />
        <span>亮度</span>
        <a-slider v-model="brightness" :min="0" :max="3" :step="0.01" />
        <span>对比度</span>
        <a-slider v-model="contrast" :min="0" :max="3" :step="0.01" />
      </div>
      <a-button type="primary" @click="addImage">添加图片</a-button>
      <a-button type="primary" @click="initGltf">加载模型场景</a-button>
      <a-button type="primary" @click="flyByAircraft">跟随视角漫游</a-button>
      <a-button type="primary" @click="cartesian3ToDegree"
        >世界坐标转经纬度</a-button
      >
      <a-button type="primary" @click="degreeToCartesian3([])"
        >经纬度转世界坐标</a-button
      >
      <a-button type="primary" @click="flowWall">墙</a-button>
      <a-button type="primary" @click="pointEntity">加载点</a-button>
      <a-button type="primary" @click="htmlPanel">加载顶牌</a-button>
      <a-button type="primary" @click="loadHeatMap">加载热力图</a-button>
      <a-button type="primary" @click="loadLine">加载流动线</a-button>
    </div>
  </div>
</template>

<script>
import { resultData } from '@/js/heatmap.js'
import { gpsData } from '@/js/gps.js'
const lat = 30.598026044
const lng = 114.302312702
export default {
  name: "HelloWorld",
  data() {
    return {

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

      // 点
      showPoint: false,
      gpsList: gpsData,

      // html定牌
      showHtml: false, // 展示html定牌
      position1: { lng: 106.482312, lat: 29.610641, height: 20 },
      positionModal: { lng: 106.482312, lat: 29.610641, height: 10 },

      // 流动墙
      showWall: false,
      positions: [
        { lng: lng - 0.5, lat: lat - 0.5, height: 10000 },
        { lng: lng - 3, lat: lat, height: 10000 },
        { lng: lng - 3, lat: lat - 1, height: 10000 },
        { lng: lng - 1, lat: lat - 3, height: 10000 },
        { lng: lng - 0.5, lat: lat - 0.5, height: 10000 }
      ],
      minimumHeights: [0, 0, 0, 0, 0],

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
      max: 0
    };
  },
  mounted() {
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
    // 加载流动线
    loadLine() {

    },

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
    getData(data) {
      var result = []
      let rows = data.rows
      let cols = data.cols
      let cellX = (data.right - data.left) / cols
      let cellY = (data.top - data.bottom) / rows
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let x = data.left + i * cellX
          let y = data.bottom + j * cellY
          let value = data.dvalues[i * cols + j]
          if (value !== data.noDataValue) {
            result.push({ x: x, y: y, value: value })
          }
        }
      }
      return result
    },

    // 增加点
    pointEntity() {
      this.showPoint = true;
      this.$refs.point.createPromise.then(({ Cesium, viewer, cesiumObject }) => {
        viewer.zoomTo(viewer.entities)
      })
    },

    // 加载html顶牌
    htmlPanel() {
      this.showHtml = true
    },

    // 加载流动墙
    flowWall() {
      this.showWall = true
      this.$refs.wall.createPromise.then(({ Cesium, viewer, cesiumObject }) => {
        viewer.zoomTo(viewer.entities)
      })
    },

    // 加载模型
    initGltf() {
      var _this = this;
      var url = "../static/models/daochu/daochu.gltf";
      // var url = "../static/models/九曲河/九曲河.gltf";
      var position = Cesium.Cartesian3.fromDegrees(106.482312, 29.610641, 0);
      var heading = Cesium.Math.toRadians(0);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
      var entity = _this.viewer.entities.add({
        name: url,
        position: position,
        orientation: orientation,
        model: {
          uri: url,
          minimumPixelSize: 128,
          maximumScale: 20000,
          scale: 1,
        },
      });

      _this.viewer.trackedEntiti = entity;
      _this.viewer.zoomTo(entity)
    },

    // 添加图片
    addImage() {
      var entityImage = new Cesium.Entity({
        position: Cesium.Cartesian3.fromDegrees(106.482312, 29.610641, 100),
        billboard: {
          image: require("../assets/images/tq-logo.jpg"),
          show: true, // default
          pixelOffset: new Cesium.Cartesian2(0, -50), // default: (0, 0)
          eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
          scale: 2.0, // default: 1.0
          //   color: Cesium.Color.LIME, // default: WHITE
          //   rotation: Cesium.Math.PI_OVER_FOUR, // default: 0.0
          //   alignedAxis: Cesium.Cartesian3.ZERO, // default
          width: 68, // default: undefined
          height: 23, // default: undefined
        },
      });

      this.viewer.entities.add(entityImage);
      this.viewer.zoomTo(entityImage)

    },

    flyByAircraft() {
      let newPositions = this.degreeToCartesian3();
      let ALLLength = this.getPositionsLength(newPositions);
      let eachStep = 0.05;

      //Set the random number seed for consistent results.
      Cesium.Math.setRandomNumberSeed(3);
      //Set bounds of our simulation time
      let start = Cesium.JulianDate.now();
      let stop = Cesium.JulianDate.addSeconds(
        start,
        ALLLength * eachStep,
        new Cesium.JulianDate()
      );

      //Make sure viewer is at the desired time.
      this.viewer.clock.startTime = start.clone();
      this.viewer.clock.stopTime = stop.clone();
      this.viewer.clock.currentTime = start.clone();
      this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
      this.viewer.clock.multiplier = 1;
      this.viewer.clock.shouldAnimate = true;
      let position = new Cesium.SampledPositionProperty();
      for (let i = 0; i < newPositions.length; i++) {
        let first = Array.from(newPositions);
        let moveArray = first.slice(0, i + 1);
        let moveLength = this.getPositionsLength(moveArray);
        let time = Cesium.JulianDate.addSeconds(
          start,
          moveLength * eachStep,
          new Cesium.JulianDate()
        ); //时间递增
        position.addSample(time, newPositions[i]);
      }
      let entity = this.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: start,
            stop: stop,
          }),
        ]),
        model: {
          uri: "static/models/Cesium_Air.glb",
          minimumPixelSize: 1,
          maximumScale: 1,
        },
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
      });
      this.viewer.trackedEntity = entity;
    },

    getPositionsLength(centerline_cartesian) {
      let _this = this;
      if (centerline_cartesian && centerline_cartesian.length > 1) {
        let newPosition = centerline_cartesian.map((p) =>
          _this.cartesian2lonlat(p)
        );
        let line = turf.lineString(newPosition);
        let options = { units: "kilometers" };
        let kiloLength = turf.length(line, options);
        return parseFloat(kiloLength * 1000);
      } else {
        return 0;
      }
    },
    cartesian2lonlat(cartesian) {
      let ellipsoid = Cesium.Ellipsoid.WGS84;
      let cartographic = ellipsoid.cartesianToCartographic(cartesian);
      let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
      let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
      return [longitudeString, latitudeString];
    },

    // 世界坐标转换为经纬度
    cartesian3ToDegree() {
      var ellipsoid = this.viewer.scene.globe.ellipsoid;
      var list = [
        { x: -1836325.2395491807, y: 5148166.491233011, z: 3276618.910605113 },
        { x: -1835597.4399745292, y: 5148701.172107532, z: 3276189.4552097474 },
        { x: -1834869.5952150826, y: 5149235.726666775, z: 3275759.9185746373 },
        { x: -1834141.7052953872, y: 5149770.154884838, z: 3275330.300726121 },
        { x: -1833413.7702399974, y: 5150304.456735839, z: 3274900.6016905494 },
        { x: -1832685.7900734725, y: 5150838.6321939025, z: 3274470.821494278 },
        { x: -1831957.7648203738, y: 5151372.68123317, z: 3274040.9601636706 },
        { x: -1831229.6945052668, y: 5151906.603827793, z: 3273611.0177251017 },
        { x: -1830501.579152726, y: 5152440.399951934, z: 3273180.9942049477 },
        { x: -1829773.4187873278, y: 5152974.069579769, z: 3272750.8896296015 },
        { x: -1829045.2134336494, y: 5153507.612685489, z: 3272320.7040254585 },
        { x: -1828316.9631162782, y: 5154041.029243291, z: 3271890.437418924 },
        { x: -1827588.6678598027, y: 5154574.319227392, z: 3271460.0898364084 },
        { x: -1826860.327688816, y: 5155107.4826120185, z: 3271029.6613043346 },
        { x: -1826823.0284855259, y: 5155134.782277407, z: 3271007.617061297 },
        { x: -1826815.7433521205, y: 5155140.112605474, z: 3271003.3140896126 },
        { x: -1826808.455251766, y: 5155145.4417167455, z: 3270999.0146382796 },
        { x: -1826801.1641866972, y: 5155150.769609597, z: 3270994.7187086088 },
        { x: -1826793.8701591422, y: 5155156.096282392, z: 3270990.426301919 },
        { x: -1826786.5731713395, y: 5155161.421733502, z: 3270986.1374195213 },
        { x: -1826779.273225524, y: 5155166.745961299, z: 3270981.8520627273 },
        { x: -1826771.9703239305, y: 5155172.068964153, z: 3270977.5702328435 },
        { x: -1826764.6644687997, y: 5155177.390740435, z: 3270973.291931181 },
        { x: -1826757.3556623682, y: 5155182.711288518, z: 3270969.0171590447 },
        { x: -1826750.043906879, y: 5155188.030606775, z: 3270964.7459177384 },
        { x: -1826742.7292045727, y: 5155193.3486935785, z: 3270960.478208567 },
        { x: -1826735.411557694, y: 5155198.665547302, z: 3270956.214032832 },
        { x: -1826728.0909684855, y: 5155203.98116632, z: 3270951.9533918323 },
        { x: -1826720.7674391968, y: 5155209.295549008, z: 3270947.6962868655 },
        { x: -1826713.440972072, y: 5155214.608693739, z: 3270943.4427192323 },
        { x: -1826706.1115693587, y: 5155219.920598893, z: 3270939.1926902253 },
        { x: -1826698.779233308, y: 5155225.231262843, z: 3270934.9462011396 },
        { x: -1826691.4439661717, y: 5155230.540683969, z: 3270930.703253266 },
        { x: -1826684.1057702021, y: 5155235.848860645, z: 3270926.4638478984 },
        { x: -1826676.7646476508, y: 5155241.155791251, z: 3270922.2279863213 },
        { x: -1826669.4206007742, y: 5155246.461474165, z: 3270917.995669828 },
        { x: -1826662.0736318293, y: 5155251.765907767, z: 3270913.7668996975 },
        { x: -1826654.7237430706, y: 5155257.069090438, z: 3270909.5416772235 },
        { x: -1826647.3709367602, y: 5155262.371020555, z: 3270905.3200036823 },
        { x: -1826640.015215156, y: 5155267.671696498, z: 3270901.1018803585 },
        { x: -1826632.6565805196, y: 5155272.971116655, z: 3270896.8873085296 },
        { x: -1826625.2950351117, y: 5155278.269279401, z: 3270892.676289476 },
        { x: -1826617.9305811995, y: 5155283.566183122, z: 3270888.468824474 },
        { x: -1826610.563221047, y: 5155288.861826201, z: 3270884.2649147995 },
        { x: -1826603.1934496614, y: 5155294.157597704, z: 3270880.0654500206 },
        { x: -1826595.8219175953, y: 5155299.455325728, z: 3270875.8716001157 },
        { x: -1826588.4486304417, y: 5155304.755018092, z: 3270871.683372376 },
        { x: -1826581.0735904528, y: 5155310.056673168, z: 3270867.5007680436 },
        { x: -1826573.6967998757, y: 5155315.360289325, z: 3270863.3237883598 },
        { x: -1826566.318260956, y: 5155320.665864936, z: 3270859.152434571 },
        { x: -1826558.9379759475, y: 5155325.973398367, z: 3270854.986707911 },
        { x: -1826551.5559471003, y: 5155331.282887985, z: 3270850.8266096166 },
        { x: -1826544.1721766659, y: 5155336.594332161, z: 3270846.6721409257 },
        { x: -1826536.786666897, y: 5155341.907729262, z: 3270842.523303068 },
        { x: -1826529.3994200467, y: 5155347.223077654, z: 3270838.380097271 },
      ];

      let newList = [];
      list.forEach((element) => {
        var cartographic = ellipsoid.cartesianToCartographic(element);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        newList.push({ lat, lng, alt });
      });
      console.log("转换坐标：", newList);
    },

    // 经纬度坐标转世界坐标
    degreeToCartesian3(list) {
      if (!list || list.length <= 0) {
        list = [
          [106.48314, 29.604911, 10],
          [106.481552, 29.611012, 10],
          [106.484427, 29.611907, 10],
        ];
      }
      var newList = [];
      list.forEach((element) => {
        var item = Cesium.Cartesian3.fromDegrees(
          element[0],
          element[1],
          element[2]
        );
        newList.push(item);
      });

      console.log("转换坐标：", newList);
      return newList;
    },
  },
};
</script>

<style scoped>
.viewer {
  width: 100%;
  height: 100%;
  position: relative;
  color: #ffffff;
}

.demo-action {
  position: absolute;
  left: 0;
  top: 1%;
  width: 20%;
  text-align: left;
}

.demo-action button {
  margin-bottom: 6px;
}

.demo-tool {
  width: 100%;
}

.vc-box {
  width: 220px;
  line-height: 150px;
  background: url(../assets/images/img_pop_line.png) no-repeat center;
  background-size: 100% 100%;
  /* background-color: rgba(0, 0, 0, 0.8); */
  color: #fff;
  /* padding: 8px 16px; */
}

.vc-dialog {
  /*重要*/
  user-select: none; /*禁止选中*/
  pointer-events: none; /*鼠标穿透*/
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  position: relative;
  z-index: 99999;
}
.vc-dialog .line {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 89px;
  background: url(../assets/images/img_pop_line.png) no-repeat center;
  background-size: 100% 100%;
  animation: goLine 0.5s forwards;
}
@keyframes goLine {
  from {
    width: 0;
  }
  to {
    width: 140px;
  }
}
.vc-dialog .main {
  position: absolute;
  width: 240px;
  height: 100px;
  top: -90px;
  left: 138px;
  background: url("../assets/images/img_pop.png") no-repeat center;
  background-size: 100% 100%;
  color: white;
  font-size: 14px;
  user-select: text;
  pointer-events: auto;
  opacity: 0;
  animation: goDynamicLayer 0.5s forwards;
  animation-delay: 0.5s;
  padding-top: 10px;
  box-sizing: border-box;
}
@keyframes goDynamicLayer {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.vc-dialog .light {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
}
</style>
