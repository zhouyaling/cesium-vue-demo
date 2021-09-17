<template>
  <div class="viewer">
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
      <a-button type="primary" @click="flyByAircraft">跟随视角漫游</a-button>
      <a-button type="primary" @click="cartesian3ToDegree"
        >世界坐标转经纬度</a-button
      >
      <a-button type="primary" @click="degreeToCartesian3([])"
        >经纬度转世界坐标</a-button
      >
      <a-button type="primary" @click="addImage">添加图片</a-button>
      <a-button type="primary" @click="flowWall">墙</a-button>

      <a-button type="primary" @click="loadNormalLine">加载普通线</a-button>
      <a-button type="primary" @click="htmlPanel">加载顶牌</a-button>
      <a-button type="primary" @click="loadHeatMap">加载热力图</a-button>
      <!-- <a-button type="primary" @click="loadWaveLine">加载流动线</a-button> -->
      <br /><br />
      <a-button type="primary" @click="initGltf">加载十年城gltf模型</a-button>
      <a-button type="primary" @click="loadBim">加载九曲河BIM</a-button>
      <a-button type="primary" @click="pointEntity">监控打点</a-button>
      <a-button type="primary" @click="loadPath">路径</a-button>
      <a-button type="primary" @click="flyAllowPath">第一人称漫游</a-button>
      <a-button type="primary" @click="changelyAllowPath">第三人称漫游</a-button>
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
        <!-- mapxbox ok -->
        <!-- <vc-provider-imagery-mapbox
          mapId="mapbox.streets"
        ></vc-provider-imagery-mapbox> -->

        <!-- mapxboxstyle no -->
        <!-- <vc-provider-imagery-style-mapbox
          url="https://api.mapbox.com/styles/v1"
          username="zhouyaling"
          styleId="cjrbqt0np29ov2stg4uhaul3g"
          accessToken="pk.eyJ1IjoiemhvdXlhbGluZyIsImEiOiJjanJibnQ3Y3cwNmU3NDNwNHBjNHFscWc1In0.ir-kFtEbcIM_X6HhvgByiA"
        ></vc-provider-imagery-style-mapbox> -->

        <!-- 超图 google ok-->
        <!-- <vc-provider-imagery-supermap
          ref="imageryProvider"
          url="https://www.supermapol.com/realspace/services/map-World/rest/maps/World_Google"
          @readyPromise="readyPromise"
        ></vc-provider-imagery-supermap> -->

        <!-- 天地图 no -->
        <!-- <vc-provider-imagery-tianditu
          mapStyle="img_c"
          token="436ce7e50d27eede2f2929307e6b33c0"
          :projectionTransforms="projectionTransforms1"
        ></vc-provider-imagery-tianditu> -->

        <!-- 百度地图 ok -->
        <vc-provider-imagery-baidumap
          :url="url"
          :projectionTransforms="projectionTransforms"
        ></vc-provider-imagery-baidumap>
      </vc-layer-imagery>
      <!-- 流动墙 -->
      <div v-show="showWall">
        <vc-trail-wall
          :positions="positions"
          color="yellow"
          :minimumHeights="minimumHeights"
          imageUrl="https://zouyaoji.top/vue-cesium-v2/statics/SampleData/images/colors1.png"
          ref="wall"
          :interval="5000"
        ></vc-trail-wall>
      </div>

      <!-- 增加点 -->
      <div v-show="showPoint">
        <template v-for="(item, index) in gpsList">
          <vc-entity :ref="`point${index}`" :position="item" :key="index">
            <vc-graphics-point color="red" :pixelSize="2"></vc-graphics-point>
          </vc-entity>
        </template>
      </div>

      <!-- html定牌 -->
      <vc-overlay-html
        v-if="showHtml"
        ref="htmlPanel"
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

      <!-- 普通线 -->
      <div>
        <vc-trail-polyline
          :positions="positionsLine"
          color="yellow"
          imageUrl="https://zouyaoji.top/vue-cesium-v2/statics/SampleData/images/colors1.png"
          :width="4"
          ref="line"
          :loop="true"
          :clampToGround="true"
          :interval="2000"
        ></vc-trail-polyline>
      </div>
    </vc-viewer>
  </div>
</template>

<script>
import { resultData } from '@/js/heatmap.js'
import { gpsData, flightDataS } from '@/js/gps.js'
import transferData from "@/js/transferData";
const lat = 30.598026044
const lng = 114.302312702
export default {
  name: "HelloWorld",
  data() {
    return {
      firstPerspective: true,
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
      url: "http://shangetu1.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46",
      // url:'https://www.songluck.com/map/data/maptile-baidu-chongqing/{z}/{x}/{y}.png',
      projectionTransforms: {
        form: 'BD09',
        to: 'gcj02',//'WGS84'
      },
      projectionTransforms1: { from: 'GCJ02', to: 'WGS84' },

      // 点
      showPoint: false,
      gpsList: [],

      // 路径
      showNormalPath: false,
      positionsLine: [],
      materialLine: undefined,

      // html定牌
      showHtml: false, // 展示html定牌
      position1: { lng: 106.482312, lat: 29.610641, height: 20 },
      positionModal: { lng: 106.482312, lat: 29.610641, height: 10 },

      // 流动墙
      showWall: false,
      positions: [],
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
    window.$$map = {}
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
      // // 高德 地图不能自定义地图地图样式
      // let imageryProvider = new Cesium.UrlTemplateImageryProvider({
      //     // url: "https://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",  //   // 路网
      //     url: "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",  //   // 电子街道
      // });

      // let imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
      //   url: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer", // 蓝色底图
      //   //   url: "https://lbs.amap.com/dev/mapstyle/mapshare/fb9958c3f4c97d17907059d343d1b055",
      // });

      // viewer.imageryLayers.addImageryProvider(imageryProvider);

      // this.pointLister()

    },

    // 加载线
    loadNormalLine() {
      this.positionsLine = [
        { "lat": 29.65876349, "lng": 106.4766485, "tos_equipmentName": "周界_防区1", "height": 10 },
        { "lat": 29.65845627, "lng": 106.4764876, "tos_equipmentName": "周界_防区2", "height": 10 },
        { "lat": 29.65832109, "lng": 106.4762033, "tos_equipmentName": "周界_防区3", "height": 10 },
        { "lat": 29.6581859, "lng": 106.4759351, "tos_equipmentName": "周界_防区4", "height": 10 },
        { "lat": 29.65803673, "lng": 106.4757741, "tos_equipmentName": "周界_防区5", "height": 10 },
        { "lat": 29.6575659, "lng": 106.4757741, "tos_equipmentName": "周界_防区6", "height": 10 },
        { "lat": 29.65737011, "lng": 106.4757634, "tos_equipmentName": "周界_防区7", "height": 10 },
        { "lat": 29.65727688, "lng": 106.4755649, "tos_equipmentName": "周界_防区8", "height": 10 },
        { "lat": 29.65726755, "lng": 106.4752538, "tos_equipmentName": "周界_防区9", "height": 10 },
        { "lat": 29.65710906, "lng": 106.4748622, "tos_equipmentName": "周界_防区10", "height": 10 },
        { "lat": 29.65684334, "lng": 106.4749534, "tos_equipmentName": "周界_防区11", "height": 10 },
        { "lat": 29.65647973, "lng": 106.475066, "tos_equipmentName": "周界_防区12", "height": 10 },
        { "lat": 29.6563492, "lng": 106.4755327, "tos_equipmentName": "周界_防区13", "height": 10 },
        { "lat": 29.65635386, "lng": 106.4760155, "tos_equipmentName": "周界_防区14", "height": 10 },
        { "lat": 29.65635386, "lng": 106.4764983, "tos_equipmentName": "周界_防区15", "height": 10 },
        { "lat": 29.6564704, "lng": 106.477759, "tos_equipmentName": "周界_防区16", "height": 10 },
        { "lat": 29.65771041, "lng": 106.4778502, "tos_equipmentName": "周界_防区17", "height": 10 },
        { "lat": 29.65880755, "lng": 106.4778394, "tos_equipmentName": "周界_防区18", "height": 10 },
        { "lat": 29.65876349, "lng": 106.4766485, "tos_equipmentName": "周界_防区1", "height": 10 }
      ]
    },

    // 加载流动线
    loadWaveLine() {

    },

    // 加载路径
    loadPath() {

    },

    // 加载BIM
    loadBim() {
      "use strict";

      var url = "static/changed/tileset.json";
      var tileset = new Cesium.Cesium3DTileset({
        url: url,
        luminanceAtZenith: 0.2,
        lightColor: new Cesium.Cartesian3(0.4, 0.4, 0.4)
      });
      tileset.readyPromise
        .then((tileset) => {
          this.viewer.scene.primitives.add(tileset);
          this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, 0));

          var height = 9.5;

          // 目的点弧度
          var newPosition = Cesium.Cartographic.fromCartesian(Cesium.Cartesian3.fromDegrees(106.4763485, 29.65756349, 0))

          // 模型中心点弧度
          var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);

          var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
          var offset = Cesium.Cartesian3.fromRadians(newPosition.longitude, newPosition.latitude, height);
          var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        })
        .otherwise((error) => {
          console.log(error);
        });

      if (true) {
        //允许可选中构件
        attachTileset(this.viewer, tileset);
      } else {
        //模型融合为一体
        attachTilesetX(this.viewer, tileset, "Model", "Model description.");
      }
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

    // 打点
    pointEntity() {
      this.showPoint = true;
      this.gpsList = gpsData;
    },

    // 加载html顶牌
    htmlPanel() {
      this.showHtml = true
      this.$refs.htmlPanel.createPromise.then(({ Cesium, viewer, cesiumObject }) => {
        viewer.zoomTo(viewer.entities)
      })
      // this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, 0));
    },

    // 加载流动墙
    flowWall() {
      this.showWall = true
      this.positions = [
        { lng: lng - 0.5, lat: lat - 0.5, height: 10000 },
        { lng: lng - 3, lat: lat, height: 10000 },
        { lng: lng - 3, lat: lat - 1, height: 10000 },
        { lng: lng - 1, lat: lat - 3, height: 10000 },
        { lng: lng - 0.5, lat: lat - 0.5, height: 10000 }
      ]
      this.$refs.wall.createPromise.then(({ Cesium, viewer, cesiumObject }) => {
        viewer.zoomTo(viewer.entities)
      })
    },

    // 加载模型
    initGltf() {
      // var url = "../static/models/daochu/daochu.gltf";
      var url = "../static/models/shiniancheng/shiniancheng.gltf";
      var position = Cesium.Cartesian3.fromDegrees(106.485512, 29.609141, 2);
      var heading = Cesium.Math.toRadians(89);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
      var entity = this.viewer.entities.add({
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

      this.viewer.trackedEntiti = entity;
      this.viewer.zoomTo(entity)
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

    changelyAllowPath(){
      this.firstPerspective = false
    },

    // 第一人称视角漫游
    flyAllowPath() {
      this.viewer.scene.globe.depthTestAgainstTerrain = true;

      let flightData = transferData(flightDataS);

      // 相机飞至起始位置点
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          flightData[0].longitude,
          flightData[0].latitude,
          flightData[0].altitude + 1
        ),
        orientation: {
          heading: 0, //flightData[0].heading,
          pitch: 0,//flightData[0].pitch,
          roll: 0//flightData[0].roll,
        },
      });

      // this.get_camera_height();

      // 起始 - 结束时刻
      const startTime = Cesium.JulianDate.fromDate(
        new Date(flightData[0].dateTime)
      );
      const stopTime = Cesium.JulianDate.fromDate(
        new Date(flightData[flightData.length - 1].dateTime)
      );

      // 当前时间置于起始时间
      this.viewer.clock.currentTime = startTime.clone();
      this.viewer.clock.startTime = startTime.clone();
      this.viewer.clock.stopTime = stopTime.clone();
      this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 播放到结束停止播放
      this.viewer.timeline.zoomTo(startTime, stopTime); // 时间线区间
      this.viewer.clock.multiplier = 20; // 倍速播放动画

      // 数据位置点属性
      const positionProperty = this.computePositionProperty(
        startTime,
        flightData
      );

      // 根据位置数据（positionProperty）计算飞机模型（Entity）在空中的姿态
      const orientationProperty = this.computeOrientationProperty(
        startTime,
        flightData,
        positionProperty
      );

      // 飞机姿态
      const quaternionProperty = this.computeQuaternion(startTime, flightData);
      window.$$map.quaternionProperty = quaternionProperty;
      // 添加飞机实体
      const airplaneEntity = this.addAirplaneEntity(
        startTime,
        stopTime,
        positionProperty,
        orientationProperty
      );
      // 设置相机当前跟踪的 Entity 实例
      this.viewer.trackedEntity = airplaneEntity;
      window.$$map.airplaneEntity = airplaneEntity;

      // 添加航线实体 (为后面第一人称视角隐藏飞机模型作准备)
      const airRouteEntity = this.addAirRouteEntity(
        startTime,
        stopTime,
        positionProperty
      );
      window.$$map.airRouteEntity = airRouteEntity;

      // 视图添加飞机模型实体
      const airplaneModel = this.viewer.scene.primitives.add(
        Cesium.Model.fromGltf({
          id: "plane",
          url: "static/models/Duck/Duck.gltf",//this.modelUri
          scale: 0.3
        })
        // clampAnimations: true, // 非关键帧上保持姿势
        // minimumPixelSize: 128, // 视角上的最小像素大小(这里未生效，应该是哪个模式存在冲突)
        // loop: Cesium.ModelAnimationLoop.NONE
      );
      window.$$map.airplaneModel = airplaneModel;

      // 飞机模型加载完成
      airplaneModel.readyPromise.then(model => {
        // 飞机模型加载完毕，保存视图 model
        // 以便控制动画播放（前进，后退，暂停/播放）
        window.$$map.viewModel = this.viewer.animation.viewModel;
        // 添加动画
        // model.activeAnimations.add({
        //   name: "down",
        //   startTime: window.$$map.downStartTime,
        //   delay: 0.0,
        //   stopTime: window.$$map.downStopTime,
        //   multiplier: 1.0,
        //   loop: Cesium.ModelAnimationLoop.NONE
        // });
        // model.activeAnimations.add({
        //   name: "up",
        //   startTime: window.$$map.upStartTime,
        //   delay: 0.0,
        //   stopTime: window.$$map.upStopTime,
        //   multiplier: 1.0,
        //   loop: Cesium.ModelAnimationLoop.NONE
        // });
        // model.activeAnimations.add({
        //   name: "down",
        //   startTime: window.$$map.downStartTime,
        //   delay: 0.0,
        //   stopTime: window.$$map.downStopTime,
        //   multiplier: 1.0,
        //   loop: Cesium.ModelAnimationLoop.NONE
        // });
        let _this = this;
        this.viewer.clock.onTick.addEventListener(clock => {
          console.log('---------------------')
          const mapObj = window.$$map;
          // 当前时间
          let curTime = clock.currentTime;
          // 3 维矩阵
          let rotationMatrix = new Cesium.Matrix3();
          // 4 维矩阵
          let modelMatrix = new Cesium.Matrix4();
          // 跟随视角当前时间点位置中心(笛卡尔三维坐标系坐标位置点 (x, y, z))
          const position = mapObj.airplaneEntity.position.getValue(curTime);
          // 获取当前时间点四维位置(x, y, z, w)
          // 当前飞机姿态(heading, pitch, roll计算而得)
          let quaternion = Cesium.Property.getValueOrUndefined(
            mapObj.quaternionProperty,
            curTime,
            new Cesium.Quaternion()
          );
          // 具有东北向上轴的参考帧计算4x4变换矩阵以提供的原点为中心，以提供的椭球的固定参考系为中心
          modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            position,
            undefined,
            modelMatrix
          );
          // 计算表示围绕轴旋转的四元数
          let quaternion2 = Cesium.Quaternion.fromAxisAngle(
            Cesium.Cartesian3.UNIT_Z,
            Cesium.Math.toRadians(90),
            new Cesium.Quaternion()
          );
          // 计算两个四元数的乘积，存到 quaternion 中
          Cesium.Quaternion.multiply(quaternion, quaternion2, quaternion);
          // 根据提供的四元数计算 3x3 旋转矩阵
          rotationMatrix = Cesium.Matrix3.fromQuaternion(
            quaternion,
            rotationMatrix
          );
          // 乘以一个转换矩阵（底行为 [0.0，0.0，0.0，1.0]）由3x3旋转矩阵组成
          Cesium.Matrix4.multiplyByMatrix3(
            modelMatrix,
            rotationMatrix,
            modelMatrix
          );
          // 将模型从模型转换为世界坐标的 4x4 转换矩阵 - 设置飞机 model 姿态及位置点
          mapObj.airplaneModel.modelMatrix = modelMatrix;
          // 根据飞机位置，姿态四维数组计算飞机姿态（heading，pitch，roll）
          const hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(modelMatrix);

          if (this.firstPerspective) {
            var cartographic = _this.viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            // console.log("第一人称视角position:", cartographic)
            console.log("第一人称视角position1:", lat,lng,cartographic.height)
            console.log("第一人称视角hpr:", hpr)
            // 固定视角为第一人称视角
            this.viewer.camera.setView({
              destination: position,
              orientation: hpr,
            });
            // 视角偏转至看向前方
            this.viewer.camera.rotateRight(Cesium.Math.toRadians(0.0));
            this.viewer.camera.moveUp(1);
            this.viewer.camera.moveBackward(0);
          }
        });
      });
    },
    /**
     * 添加飞机实体
     * @params {*} startTime 起始时间 :JulianDate
     * @params {*} stopTime 结束时间 :JulianDate
     * @params {*} positionProperty 每个时间点的位置属性对象
     * @params {*} orientationProperty 根据每个时间点的位置属性对象计算得到的飞机姿态对象
     */
    addAirplaneEntity(
      startTime,
      stopTime,
      positionProperty,
      orientationProperty
    ) {
      // 可根据位置属性计算得到
      orientationProperty =
        orientationProperty === undefined
          ? new Cesium.VelocityOrientationProperty(positionProperty)
          : orientationProperty;
      return this.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: startTime,
            stop: stopTime
          })
        ]),
        position: positionProperty,
        orientation: orientationProperty,
        // orientation: new Cesium.VelocityOrientationProperty(
        //   orientationProperty
        // ),
        model: {
          uri: "static/models/Duck/Duck.gltf",//Cesium_Air.glb", // this.modelUri,
          scale: 0.2// 缩小自动创建的实体至肉眼不可见的状态
        }
        // loop: Cesium.ModelAnimationLoop.NONE
      });
    },
    // 计算飞机航向
    computeQuaternion(startTime, records) {
      // Cesium.Quaternion - 一组四维坐标(x, y, z , w)，表示三维空间中的旋转
      let property = new Cesium.SampledProperty(Cesium.Quaternion);
      records.forEach(item => {
        // if (item.heading && item.pitch && item.roll) {
        const time = Cesium.JulianDate.fromDate(new Date(item.dateTime));
        // 以度为单位的角度返回一个新的 HeadingPitchRoll 实例，姿态数据
        const headingPitchRoll = Cesium.HeadingPitchRoll.fromDegrees(
          item.heading,
          item.pitch,
          item.roll
        );
        // 根据给定的航向，俯仰和横滚角计算旋转角度
        const quaternion = Cesium.Quaternion.fromHeadingPitchRoll(
          headingPitchRoll
        );
        property.addSample(time, quaternion);
        // }
      });
      return property;
    },

    // 计算飞行路径
    computeOrientationProperty(startTime, records, positionProperty) {
      if (positionProperty) {
        return new Cesium.VelocityOrientationProperty(positionProperty);
      }
      let property = new Cesium.SampledPositionProperty();
      records.forEach(item => {
        // if (item.longitude && item.latitude) {
        const time = Cesium.JulianDate.fromDate(new Date(item.dateTime));
        const position = Cesium.Cartesian3.fromDegrees(
          item.longitude,
          item.latitude,
          item.altitude || 0
        );
        property.addSample(time, position);
        // }
      });
      return property;
    },
    // 添加航线实体
    addAirRouteEntity(startTime, stopTime, positionProperty) {
      return this.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: startTime,
            stop: stopTime
          })
        ]),
        position: positionProperty,
        path: new Cesium.PathGraphics({
          width: 3,
          material: Cesium.Color.GREENYELLOW
        })
      });
    },
    // 计算每个点的属性（时间，位置）
    computePositionProperty(startTime, records) {
      // const vm = this;
      let property = new Cesium.SampledPositionProperty();
      records.forEach(item => {
        // if (item.longitude && item.latitude) {
        // }
        const time = Cesium.JulianDate.fromDate(new Date(item.dateTime));
        const position = Cesium.Cartesian3.fromDegrees(
          item.longitude,
          item.latitude,
          item.altitude || 0
        );
        // // entities 实体（航线上的数据位置点）添加描述信息
        // window.$$map.viewer.entities.add({
        //   description: `Location: (${item.longitude}, ${item.latitude}, ${item.altitude})`,
        //   position,
        //   point: { pixelSize: 10, color: Cesium.Color.GOLD }
        // });
        property.addSample(time, position);
      });
      return property;
    },

    // 跟随漫游
    flyByAircraft() {
      let newPositions = this.degreeToCartesian3(this.positionsLine);
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
      this.viewer.clock.shouldAnimate = false;

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
          maximumScale: 0.4,
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
          { lng: 106.48314, lat: 29.604911, height: 10 },
          { lng: 106.481552, lat: 29.611012, height: 10 },
          { lng: 106.484427, lat: 29.611907, height: 10 },
        ];
      }
      var newList = [];
      list.forEach((element) => {
        var item = Cesium.Cartesian3.fromDegrees(
          element.lng,
          element.lat,
          element.height
        );
        newList.push(item);
      });

      console.log("转换坐标：", newList);
      return newList;
    },

    readyPromise() {
      this.viewer.zoomTo(this.$refs.imageryProvider.providerContainer.imageryLayer)
    }
    ,


    // 打点监听
    pointLister() {
      let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      handler.setInputAction((event) => {
        var earthPosition = this.viewer.camera.pickEllipsoid(
          event.position,
          this.viewer.scene.globe.ellipsoid
        );
        if (Cesium.defined(earthPosition)) {
          let ellipsoid = this.viewer.scene.globe.ellipsoid;
          let cartographic = ellipsoid.cartesianToCartographic(earthPosition);
          let lat = Cesium.Math.toDegrees(cartographic.latitude);
          let lon = Cesium.Math.toDegrees(cartographic.longitude);
          let params = {
            id: "打点" + lon,
            name: "text",
            lon: lon,
            lat: lat,
          };
          this.AddPoint(params);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    // 添加点位文本
    AddPoint(params) {
      console.log("dddddddddd", params);
      if (params.lon === undefined || params.lat === undefined) {
        alert("请提供经纬度!");
        return;
      }
      console.log(params)
      let entity = new Cesium.Entity({
        id: params.id || `${params.lon}点`,
        name: params.name || "点",
        show: true,
        position: Cesium.Cartesian3.fromDegrees(params.lon, params.lat, 1),
        point: new Cesium.PointGraphics({
          show: true,
          pixelSize: params.pixelSize || 5,
          heightReference: params.pixelSize || Cesium.HeightReference.NONE,
          color: new Cesium.Color(243, 243, 9, 1),
          outlineColor: new Cesium.Color(0, 0, 0, 0),
          outlineWidth: params.outlineWidth || 0,
          scaleByDistance:
            params.scaleByDistance || new Cesium.NearFarScalar(0, 1, 5e10, 1),
          translucencyByDistance:
            params.translucencyByDistance ||
            new Cesium.NearFarScalar(0, 1, 5e10, 1),
          distanceDisplayCondition:
            params.translucencyByDistance ||
            new Cesium.DistanceDisplayCondition(0, 4.8e10),
        }),
        label: {
          text: params.id,
          font: "10pt Source Han Sans CN", //字体样式
          fillColor: Cesium.Color.BLACK, //字体颜色
          backgroundColor: Cesium.Color.AQUA, //背景颜色
          showBackground: true, //是否显示背景颜色
          style: Cesium.LabelStyle.FILL_AND_OUTLINE, //label样式
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT, //水平位置
        },
      });
      this.viewer.entities.add(entity);
      return entity;
    },

    // 获取当前相机高，经纬度
    get_camera_height() {
      // 获取当前镜头位置的笛卡尔坐标
      var cameraPosition = this.viewer.camera.position;
      console.log("弧度方向heading:", this.viewer.camera.heading)
      // 获取当前坐标系标准
      var ellipsoid = this.viewer.scene.globe.ellipsoid;
      // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
      var cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
      // 获取镜头的高度
      var height = cartographic.height;
      // 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
      var centerLon = parseFloat(
        Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
      );
      var centerLat = parseFloat(
        Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
      );

      return { height, centerLon, centerLat };
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
  z-index: 1;
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
