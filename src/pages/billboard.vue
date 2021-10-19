<template>
  <div>
    <vc-viewer
      :logo="false"
      :infoBox="false"
      :selectionIndicator="false"
      @ready="ready"
    >
      <div id="info"></div>
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
      <a-button type="primary" @click="addShiNianChengArea"
        >加载十年城区域</a-button
      >
      <a-button type="primary" @click="drawWall()"
        >加载小区边界围栏效果</a-button
      >
      <a-button type="primary" @click="addChinaArea">加载中国区域</a-button>
      <a-button type="primary" @click="addCountryLine">加载国界线</a-button>
      <a-button type="primary" @click="hideArea()">隐藏界限</a-button>
      <a-button type="primary" @click="earthRotate">地球自转</a-button>
      <a-button type="primary" @click="addRoad">添加路线</a-button>
      <a-button type="primary" @click="addMark">设置文本</a-button>
      <a-button type="primary" @click="addMarkImage">设置点位</a-button>
      <a-button type="primary" @click="addLine">设置飞线</a-button>
      <a-button type="primary" @click="loadHeatMap">加载热力图</a-button>
      <a-button type="primary" @click="addMarkHtml">添加html</a-button>
      <a-button type="primary" @click="addHeatMap1">加载热力图1</a-button>
      <a-button type="primary" @click="senceMove">场景转动</a-button>

      <br /><br />
      <a-button type="primary" @click="addMarkImage">人员实时分布</a-button>
      <a-button type="primary" @click="createParticleFire">火焰</a-button>
    </div>
  </div>
</template>

<script>
import { degreeToCartesian3 } from '@/js/transferData.js'
import { shiNianChengZhouJieData } from '@/js/gps.js'
import $ from 'jquery'
// import Heatmap from 'heatmap.js'
// let CesiumHeatmap = require('../js/cesium-heatmap/CesiumHeatmap')
import { resultData } from '@/js/heatmap.js'
let coordtransformUtil = require('../js/index');

let Popup = null;

export default {
  data() {
    return {
      handler: null, //鼠标事件
      showMark: false,
      pointMark: null,//文本实体
      imageMark: null,// 图标实体
      alpha: 1,
      brightness: 1,
      contrast: 1,
      url: 'http://api0.map.bdimg.com/customimage/tile?=&x={x}&y={y}&z={z}&scale=1&customid=midnight',
      projectionTransforms: {
        form: 'BD09',
        to: 'WGS84'
      },
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
      gravityScratch: null,
    }
  },
  mounted() {
    this.initPopup();
  },
  methods: {
    // 创建火焰
    // const d = this.viewer.entities.add({
    //   id: 111,
    //   name: '西区点位',
    //   description: '这是一个点位',
    //   position: new Cesium.Cartesian3.fromDegrees(106.4793100996493, 29.610230390624693, 70),
    //   billboard: {
    //     image: require('../assets/images/marker.png'),
    //     width: 1,
    //     height: 1
    //   }
    // });position: new Cesium.Cartesian3.fromDegrees(106.4793100996493, 29.610230390624693, 70),


    createParticleFire() {
      let fire = {
        position: new Cesium.Cartesian3.fromDegrees(106.4793100996493, 29.610230390624693, 70),
        image: "https://staticfile-service.oss-cn-shanghai.aliyuncs.com/fire%20%281%29.png",  // require('../assets/images/fire.png'),
      }
      var entity = this.viewer.entities.add({ position: fire.position, label: { text: " '' " } });

      var computeModelMatrix = function (entity, time) {
        var position = Cesium.Property.getValueOrUndefined(entity.position);
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        return modelMatrix;
      }

      var computeEmitterModelMatrix = function () {
        var hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0, 0);
        var trs = new Cesium.TranslationRotationScale();
        trs.translation = Cesium.Cartesian3.fromElements(2.5, 4, 1);
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr);
        var result = Cesium.Matrix4.fromTranslationRotationScale(trs);
        return result;
      }


      var viewModel = {
        emissionRate: 50.0,
        gravity: 0.0,
        minimumParticleLife: 500.0,
        maximumParticleLife: 500.0,
        minimumSpeed: 1.0,
        maximumSpeed: 1.0,
        startScale: 1.0,
        endScale: 4.0,
        particleSize: 200.0,
        transX: 2.5,
        transY: 4.0,
        transZ: 1.0,
        heading: 0.0,
        pitch: 0.0,
        roll: 0.0,
        fly: true,
        spin: true,
        show: true,
      };

      var primitive = this.viewer.scene.primitives.add(
        new Cesium.ParticleSystem({
          speed: 5.0,
          image: 'https://staticfile-service.oss-cn-shanghai.aliyuncs.com/fire%20%281%29.png',// fire.image,
          startColor: Cesium.Color.RED.withAlpha(0.7), //粒子出生时的颜色
          endColor: Cesium.Color.YELLOW.withAlpha(0.3), //当粒子死亡时的颜色
          startScale: viewModel.startScale, //粒子出生时的比例，相对于原始大小
          endScale: viewModel.endScale, //粒子在死亡时的比例
          minimumParticleLife: viewModel.minimumParticleLife, //设置粒子寿命的可能持续时间的最小界限（以秒为单位），粒子的实际寿命将随机生成
          maximumParticleLife: viewModel.maximumParticleLife, //设置粒子寿命的可能持续时间的最大界限（以秒为单位），粒子的实际寿命将随机生成
          minimumSpeed: viewModel.minimumSpeed, //设置以米/秒为单位的最小界限，超过该最小界限，随机选择粒子的实际速度。
          maximumSpeed: viewModel.maximumSpeed, //设置以米/秒为单位的最大界限，超过该最大界限，随机选择粒子的实际速度。
          imageSize: new Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize), //如果设置该属性，将会覆盖 minimumImageSize和maximumImageSize属性，以像素为单位缩放image的大小
          emissionRate: viewModel.emissionRate, //每秒发射的粒子数。

          lifetime: 16.0, //多长时间的粒子系统将以秒为单位发射粒子
          emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(30)), //此系统的粒子发射器  共有 圆形、锥体、球体、长方体 ( BoxEmitter,CircleEmitter,ConeEmitter,SphereEmitter ) 几类
          modelMatrix: computeModelMatrix(entity, Cesium.JulianDate.now()), // 4x4转换矩阵，可将粒子系统从模型转换为世界坐标
          emitterModelMatrix: computeEmitterModelMatrix() // 4x4转换矩阵，用于在粒子系统本地坐标系中转换粒子系统发射器
        })
      );

      entity.remove = () => {
        this.viewer.entities.remove(entity);
        this.viewer.scene.primitives.remove(primitive);
      };
      return entity;
    },


    // 添加路线
    addRoad() {
      var yellowLine = this.viewer.entities.add({
        name: 'Red line on the surface',
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            106.48040503458591, 29.609066387343137, 49.74977860280294,
            106.4808865318865, 29.6092944160095, 49.74740115164969,
            106.48070492732727, 29.60970624839725, 49.90957696869697,
            106.4813112131824, 29.610018217488896, 49.907960754791404,
            106.48066641648786, 29.611070492197175, 49.844180558381765,
            106.48004133359285, 29.610746192136414, 49.86424036174831

          ]),
          width: 2,
          material: Cesium.Color.YELLOW
        }
      });
      this.addMarkImage()
    },

    // 画围墙
    drawWall() {

      let positions = shiNianChengZhouJieData;
      positions.map((element, index) => {
        let pointMark = this.viewer.entities.add({
          id: index + 1,
          name: 'billboard',
          description: '这是信达国际',
          position: new Cesium.Cartesian3.fromDegrees(element.lng, element.lat, 60),
          label: {
            text: element.name,
            color: Cesium.Color.fromCssColorString('#fff'),
            font: 'normal 20px MicroSoft YaHei',
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
      })

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
              // return Cesium.Color.BLACK.withAlpha(alp)
              return Cesium.Color.fromCssColorString(
                "rgba(255,255,255, 0)"
              ).withAlpha(alp)
              //entity的颜色透明 并不影响材质，并且 entity也会透明
            }, false)
          })
        }
      });
      // this.viewer.zoomTo(this.wyoming);//相机到entity的位置
    },

    // 隐藏
    hideArea() {
      var primitives = this.viewer.scene.primitives;
      var length = primitives.length;
      for (var i = 0; i < length; ++i) {
        var p = primitives.get(i);
        p.show = !p.show;
      }

      var dataSource = this.viewer.dataSources;
      for (var i = 0; i < dataSource.length; ++i) {
        var p = dataSource.get(i);
        p.show = !p.show;
      }


      // this.viewer.entities.remove(this.pointMark)
      // this.viewer.entities.remove(this.imageMark)

      // this.viewer.dataSources.removeAll();
      // this.viewer.scene.primitives.removeAll();

      // let data1 = this.viewer.dataSources.getByName('china.json')
      // this.viewer.dataSources.remove(data1[0])

      // let data2 = this.viewer.dataSources.getByName('countriesGeo.json')
      // this.viewer.dataSources.remove(data2[0])
    },

    // 加载国界限
    addCountryLine() {
      // // this.viewer._cesiumWidget._creditContainer.style.display = "none";
      // this.viewer.dataSources.get(0).show = false;

      const url1 = "../../static/jsonData/countriesGeo.json";
      const countryDataSource = this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load(url1, {
        stroke: Cesium.Color.BLUE,
        // fill:new Cesium.Color(0,0,0,0),
      }));
    },

    // 自转
    earthRotate() {
      var initialPosition = new Cesium.Cartesian3.fromDegrees(113.42, 34.16, 16000000);
      var homeCameraView = {
        destination: initialPosition,
      };
      this.viewer.scene.camera.setView(homeCameraView);

      var x = 113;
      window.setInterval(() => {
        x = x + 0.3;
        if (x >= 178.5) {
          x = -180
        }
        this.viewer.scene.camera.setView({
          destination: new Cesium.Cartesian3.fromDegrees(x, 30, 16000000)
        });
      }, 16)

      this.viewer.scene.sun.destroy(); //去掉太阳
      this.viewer.scene.sun = undefined; //去掉太阳
      this.viewer.scene.moon.destroy(); //去掉月亮
      this.viewer.scene.moon = undefined; //去掉月亮
      this.viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(112.42, 34.16),
        ellipse: {
          coordinates: Cesium.Rectangle.fromDegrees(112.42, 34.16, 50.0),
          semiMinorAxis: 55000.0, //半小轴
          semiMajorAxis: 55000.0, //半长轴
          material: Cesium.Color.WHITE
        }
      });
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(116.42, 40.16),
        ellipse: {
          semiMinorAxis: 25000.0, //半小轴
          semiMajorAxis: 25000.0, //半长轴
          material: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 1)
        }
      });

    },

    // 加载十年城区域
    addShiNianChengArea() {
      const url = "../../static/jsonData/shiniancheng.json";
      var promise = Cesium.GeoJsonDataSource.load(url, {
        stroke: Cesium.Color.fromCssColorString(
          "rgba(8,48,75, 0.6)"
        ),
        fill: Cesium.Color.fromCssColorString(
          "rgba(40,134,140, 0.4)"
        )// "rgba(24,144,255, 0.2)"
      });
      promise.then((dataSource) => {
        this.viewer.dataSources.add(dataSource)
        let entities = dataSource.entities.values;
        var colorHash = {};
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          var name = entity.name;
          var color = colorHash[name];
          if (!color) {
            color = Cesium.Color.fromRandom({
              alpha: 1.0
            });
            colorHash[name] = color;
            entity.polygon.extrudedHeight = 60; //Math.floor(Math.random() * 50 + 50) //20000~60000的随机数，单位是米
            this.viewer.zoomTo(promise);
          }
        }
      })

      // window.setTimeout(() => {

      // 15.670442376011646 -52.97217517278311 15.205007175789923
      // 0.004773489723496967 -0.016136247321622735 0.004631710053727515

      // var rectangle = this.viewer.camera.computeViewRectangle();
      // var west = rectangle.west / Math.PI * 180;
      // var north = rectangle.north / Math.PI * 180;
      // var east = rectangle.east / Math.PI * 180;
      // var south = rectangle.south / Math.PI * 180;
      // var centerx = (west + east) / 2;
      // var cnetery = (north + south) / 2;



      // }, 100)


    },

    // 场景转动
    senceMove() {
      const d = this.viewer.entities.add({
        id: 111,
        name: '西区点位',
        description: '这是一个点位',
        position: new Cesium.Cartesian3.fromDegrees(106.4793100996493, 29.610230390624693, 0),
        billboard: {
          image: require('../assets/images/marker.png'),
          width: 1,
          height: 1
        }
      });
      this.viewer.zoomTo(d);
      this.doFly(new Cesium.Cartesian3.fromDegrees(106.4793100996493, 29.610230390624693, 0));
    },

    // 
    doFly(position) {

      console.log(this.viewer.camera)
      var q = this.viewer.camera;
      var direction = this.viewer.camera._direction;
      var x = Cesium.Math.toRadians(direction.x);
      var y = Cesium.Math.toRadians(direction.y);
      var z = Cesium.Math.toRadians(direction.z);
      console.log('摄像头角度', x, y, z)


      this.flyExtent(position)

    },

    // 旋转
    flyExtent(position) {
      var pitch = Cesium.Math.toRadians(-52.97217517278311);
      var angle = 360 / 720;
      var distance = 1500.768394547849;
      var startTime = Cesium.JulianDate.fromDate(new Date());
      var stopTime = Cesium.JulianDate.addSeconds(startTime, 1000, new Cesium.JulianDate());
      this.viewer.clock.startTime = startTime.clone();
      this.viewer.clock.stopTime = stopTime.clone();
      this.viewer.clock.currentTime = startTime.clone(); // 当前时间
      this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED; // 行为方式
      this.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
      var initialHeading = 0.004631710053727515; // this.viewer.camera.heading;
      var Exection = () => {
        var delTime = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.viewer.clock.startTime);
        var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
        // console.log("旋转",heading,position)
        this.viewer.scene.camera.setView({
          destination: position, // 点的坐标
          orientation: {
            heading: heading,
            pitch: pitch,
          }
        });
        this.viewer.scene.camera.moveBackward(distance);
        if (Cesium.JulianDate.compare(this.viewer.clock.currentTime, this.viewer.clock.stopTime) >= 0) {
          this.viewer.clock.onTick.removeEventListener(Exection);
        }

      };
      this.viewer.clock.onTick.addEventListener(Exection);

    },

    // 加载中国区域
    addChinaArea() {
      const url = "../../static/jsonData/china.json";
      let dataSource = this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load(url, {
        // stroke: Cesium.Color.BLUE,
        fill: new Cesium.Color(0, 0, 0, 0),
      }));
    },

    createHeatMap(max, data) {
      // 创建元素
      var heatDoc = document.createElement("div");
      heatDoc.setAttribute("style", "width:1000px;height:1000px;margin: 0px;display: none;");
      document.body.appendChild(heatDoc);
      // 创建热力图对象
      var heatmap = Heatmap.create({
        container: heatDoc,
        radius: 20,
        maxOpacity: .5,
        minOpacity: 0,
        blur: .75,
        gradient: {
          '0.9': 'red',
          '0.8': 'orange',
          '0.7': 'yellow',
          '0.5': 'blue',
          '0.3': 'green',
        },
      });
      // 添加数据
      heatmap.setData({
        max: max,
        data: data
      });
      return heatmap;
    },

    createRectangle(coordinate, heatMap) {
      var enti = this.viewer.entities.add({
        name: '热力图',
        show: true,
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(coordinate[0], coordinate[1], coordinate[2], coordinate[3]),
          material: heatMap._renderer.canvas // 核心语句，填充热力图
        }
      });

      this.viewer.zoomTo(enti);//相机到entity的位置
    },

    getData(len) {
      //构建一些随机数据点
      var points = [];
      var max = 0;
      var width = 1000;
      var height = 1000;
      // while (len--) {
      //   var val = Math.floor(Math.random() * 10);
      //   max = Math.max(max, val);
      //   var point = {
      //     x: Math.floor(Math.random() * width),
      //     y: Math.floor(Math.random() * height),
      //     value: val
      //   };
      //   points.push(point);
      // }
      // [106.48005436, 29.61339187, 106.48105436, 29.61439187];
      points.push({ x: 0, y: 0, value: 1 })
      points.push({ x: 106.48005436, y: 29.61339187, value: 10 })
      points.push({ x: 1000, y: 1000, value: 5 })
      points.push({ x: 1000, y: 0, value: 5 })
      points.push({ x: 0, y: 500, value: 7 })
      return { max: 10, data: points }
    },

    // 加载热力图
    addHeatMap1() {
      // this.viewer.entities.add({
      //   id: 111,
      //   name: '西区点位',
      //   description: '这是一个点位',
      //   position: new Cesium.Cartesian3.fromDegrees(106.48005436, 29.61339187, 0),
      //   billboard: {
      //     image: require('../assets/images/marker.png'),
      //     width: 32,
      //     height: 32
      //   }
      // });

      // this.viewer.entities.add({
      //   id: 222,
      //   name: '西区点位1',
      //   description: '这是一个点位',
      //   position: new Cesium.Cartesian3.fromDegrees(106.48105436, 29.61439187, 0),
      //   billboard: {
      //     image: require('../assets/images/marker.png'),
      //     width: 32,
      //     height: 32
      //   }
      // });

      // this.viewer.entities.add({
      //   id: 333,
      //   name: '西区点位1',
      //   description: '这是一个点位',
      //   position: new Cesium.Cartesian3.fromDegrees(106.48005436, 29.61439187, 0),
      //   billboard: {
      //     image: require('../assets/images/marker.png'),
      //     width: 32,
      //     height: 32
      //   }
      // });

      // this.viewer.entities.add({
      //   id: 444,
      //   name: '西区点位1',
      //   description: '这是一个点位',
      //   position: new Cesium.Cartesian3.fromDegrees(106.48105436, 29.61339187, 0),
      //   billboard: {
      //     image: require('../assets/images/marker.png'),
      //     width: 32,
      //     height: 32
      //   }
      // });

      let bounds = {
        west: 147.13833844,
        east: 147.13856899,
        south: -41.43606916,
        north: -41.43582929
      };

      // init heatmap
      let myViewer = this.viewer;
      debugger
      let heatMap = CesiumHeatmap.create(
        this.viewer,
        bounds, // bounds for heatmap layer
        {
          // heatmap.js options go here
          // maxOpacity: 0.3
        }
      );

      // random example data
      let data = [{ "x": 147.1383442264, "y": -41.4360048372, "value": 76 }, { "x": 147.1384363011, "y": -41.4360298848, "value": 63 }, { "x": 147.138368102, "y": -41.4358360603, "value": 1 }, { "x": 147.1385627739, "y": -41.4358799123, "value": 21 }, { "x": 147.1385138501, "y": -41.4359327669, "value": 28 }, { "x": 147.1385031219, "y": -41.4359730105, "value": 41 }, { "x": 147.1384127393, "y": -41.435928255, "value": 75 }, { "x": 147.1384551136, "y": -41.4359450132, "value": 3 }, { "x": 147.1384927196, "y": -41.4359158649, "value": 45 }, { "x": 147.1384938639, "y": -41.4358498311, "value": 45 }, { "x": 147.1385183299, "y": -41.4360213794, "value": 93 }, { "x": 147.1384007925, "y": -41.4359860133, "value": 46 }, { "x": 147.1383604844, "y": -41.4358298672, "value": 54 }, { "x": 147.13851025, "y": -41.4359098303, "value": 39 }, { "x": 147.1383874733, "y": -41.4358511035, "value": 34 }, { "x": 147.1384981796, "y": -41.4359355403, "value": 81 }, { "x": 147.1384504107, "y": -41.4360332348, "value": 39 }, { "x": 147.1385582664, "y": -41.4359788335, "value": 20 }, { "x": 147.1383967364, "y": -41.4360581999, "value": 35 }, { "x": 147.1383839615, "y": -41.436016316, "value": 47 }, { "x": 147.1384082712, "y": -41.4358423338, "value": 36 }, { "x": 147.1385092651, "y": -41.4358577623, "value": 69 }, { "x": 147.138360356, "y": -41.436046789, "value": 90 }, { "x": 147.138471893, "y": -41.4359184292, "value": 88 }, { "x": 147.1385605689, "y": -41.4360271359, "value": 81 }, { "x": 147.1383585714, "y": -41.4359362476, "value": 32 }, { "x": 147.1384939114, "y": -41.4358844253, "value": 67 }, { "x": 147.138466724, "y": -41.436019121, "value": 17 }, { "x": 147.1385504355, "y": -41.4360614056, "value": 49 }, { "x": 147.1383883832, "y": -41.4358733544, "value": 82 }, { "x": 147.1385670669, "y": -41.4359650236, "value": 25 }, { "x": 147.1383416534, "y": -41.4359310876, "value": 82 }, { "x": 147.138525285, "y": -41.4359394661, "value": 66 }, { "x": 147.1385487719, "y": -41.4360137656, "value": 73 }, { "x": 147.1385496029, "y": -41.4359187277, "value": 73 }, { "x": 147.1383989222, "y": -41.4358556562, "value": 61 }, { "x": 147.1385499424, "y": -41.4359149305, "value": 67 }, { "x": 147.138404523, "y": -41.4359563326, "value": 90 }, { "x": 147.1383883675, "y": -41.4359794855, "value": 78 }, { "x": 147.1383967187, "y": -41.435891185, "value": 15 }, { "x": 147.1384610005, "y": -41.4359044797, "value": 15 }, { "x": 147.1384688489, "y": -41.4360396127, "value": 91 }, { "x": 147.1384431875, "y": -41.4360684409, "value": 8 }, { "x": 147.1385411067, "y": -41.4360645847, "value": 42 }, { "x": 147.1385237178, "y": -41.4358843181, "value": 31 }, { "x": 147.1384406464, "y": -41.4360003831, "value": 51 }, { "x": 147.1384679169, "y": -41.4359950456, "value": 96 }, { "x": 147.1384194314, "y": -41.4358419739, "value": 22 }, { "x": 147.1385049792, "y": -41.4359574813, "value": 44 }, { "x": 147.1384097378, "y": -41.4358598672, "value": 82 }, { "x": 147.1384993219, "y": -41.4360352975, "value": 84 }, { "x": 147.1383640499, "y": -41.4359839518, "value": 81 }];
      let valueMin = 0;
      let valueMax = 100;

      // add data to heatmap
      heatMap.setWGS84Data(valueMin, valueMax, data);

      // var coordinate1 = [106.48005436, 29.61339187, 106.48105436, 29.61439187];
      // const res = this.getData(10)
      // console.log(res)
      // var heatMap1 = this.createHeatMap(res.max, res.data);
      // this.createRectangle(coordinate1, heatMap1);
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

    // 基础底图回调函数
    ready(instance) {
      const { Cesium, viewer } = instance
      this.viewer = viewer;

      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      // const imageryProvider = new Cesium.MapboxStyleImageryProvider({
      //   url: "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
      // });

      // this.viewer.imageryLayers.addImageryProvider(imageryProvider)

      // this.alpha = 0;
      // this.brightness = 0;
      // this.contrast = 0;
      // this.viewer.scene.globe.baseColor = Cesium.Color.BLACK; //默认为蓝色，这里改成绿色
      // this.viewer.imageryLayers.get(0).show = false;//不显示底图

      // this.viewer.scene.globe.enableLighting = false;
      // this.viewer.scene.skyAtmosphere = false;
      // this.viewer.skyBox = new Cesium.SkyBox({
      //   show: false
      // });

      this.addChinaArea()
      this.addLine();

      this.handler.setInputAction((click) => {
        console.log('左键单击事件：', click.position);
        var pick = this.viewer.scene.pick(click.position);

        var cartesian3 = this.viewer.scene.pickPosition(click.position);
        var cartesian = cartesian3; //Cesium.Cartesian3.fromDegrees(element.lng, element.lat, 0)
        var ellipsoid = this.viewer.scene.globe.ellipsoid;
        var cartographic = ellipsoid.cartesianToCartographic(cartesian)
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        if (pick && pick.id) {
          // 调用弹窗方法 pick.id.properties.cityname._value 
          // [lng, lat, alt]
          var popup = new Popup({
            viewer: this.viewer,
            geometry: cartesian,
            name: pick.id.name,
            detailInfo: "<div>经度：" + [lng, lat] + "<br />屏幕坐标：" + click.position.x + ',' + click.position.y + "</div>"
          })
        }
        else {
          var popup = new Popup({
            viewer: this.viewer,
            geometry: cartesian,
            name: '其他区域',
            detailInfo: "<div>经度：" + [lng, lat] + "<br />屏幕坐标：" + click.position.x + ',' + click.position.y + "</div>"
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },

    // 添加标点
    addMark() {
      var id = 'id' + new Date().getTime();
      console.log("id = " + id);
      this.pointMark = this.viewer.entities.add({
        id: id,
        name: '金科十年城',
        description: '这是金科十年城',
        position: new Cesium.Cartesian3.fromDegrees(106.47799044313123, 29.60901016623676, 80),
        label: {
          text: '金科十年城',
          color: Cesium.Color.fromCssColorString('#fff'),
          font: 'normal 30px MicroSoft YaHei',
          showBackground: true,
          scale: 1,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1, 5000, 1.0),
        },
      });
    },

    // 添加图片标点
    addMarkImage() {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          106.47799044313123,
          29.60901016623676,
          3000
        ),
        duration: 2,
        orientation: {
          heading: Cesium.Math.toRadians(1.0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      }); // 0.95 + 0.5 = 1.45
      //      
      // 16.26 + 9.4629  =  25.72
      var list = [
        [106.48040503458591, 29.609066387343137, 64],
        [106.4808865318865, 29.6092944160095, 64],
        [106.48070492732727, 29.60970624839725, 64],
        [106.4813112131824, 29.610018217488896, 64],
        [106.48066641648786, 29.611070492197175, 64],
        [106.48004133359285, 29.610746192136414, 64]
      ]

      list.forEach((element, index) => {
        var id = 'imageid' + index;
        this.viewer.entities.add({
          id: id,
          name: '西区点位' + id,
          description: '这是一个点位',
          position: new Cesium.Cartesian3.fromDegrees(element[0], element[1], element[2]),
          billboard: {
            image: require('../assets/images/marker.png'),
            width: 32,
            height: 32
          }
        });
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
          content: info.detailInfo,
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

    // 添加顶牌html
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

    },


    // 添加飞线
    addLine() {
      var center = Cesium.Cartesian3.fromDegrees(106.491032, 29.613683, 3000); // 位置
      var heading = Cesium.Math.toRadians(0.0);
      var pitch = Cesium.Math.toRadians(-45);
      var range = 5660000;
      this.viewer.camera.lookAt(
        center,
        new Cesium.HeadingPitchRange(heading, pitch, range)
      );

      let list = [
        {
          point1: [106.491032, 29.613683],
          point2: [100.491032, 31.613683]
        },
        {
          point1: [106.491032, 29.613683],
          point2: [116.957262, 38.882041]
        },
        {
          point1: [106.491032, 29.613683],
          point2: [111.508043, 38.332595]
        },
        {
          point1: [106.491032, 29.613683],
          point2: [116.957262, 31.418805]
        },
        {
          point1: [106.491032, 29.613683],
          point2: [119.066637, 25.075136]
        },
        {
          point1: [106.491032, 29.613683],
          point2: [88.304918, 43.889567]
        }
      ]
      list.forEach(element => {
        //这里通过算法得到曲线
        let mm = this.parabola([element.point1[0], element.point1[1], element.point2[0], element.point2[1]])
        var polyline = new Cesium.PolylineGeometry({
          positions: mm,
          width: 2
        });
        const instance = new Cesium.GeometryInstance({
          geometry: polyline,
          id: 'flyline',
        })

        //添加至场景
        this.viewer.scene.primitives.add(
          new Cesium.Primitive({
            geometryInstances: [instance],
            appearance: this.getFlylineMaterial(),
            releaseGeometryInstances: true,
            compressVertices: true,
          })
        )

      });


    },

    parabola(twoPoints) {  //抛物线绘制
      let s = []
      let startPoint = [twoPoints[0], twoPoints[1], 0]; //起点的经度、纬度
      s = s.concat(startPoint)
      let step = 10;  //线的多少，越多则越平滑(但过多浏览器缓存也会占用越多)
      let heightProportion = 0.125; //最高点和总距离的比值
      let dLon = (twoPoints[2] - startPoint[0]) / step;  //经度差值
      let dLat = (twoPoints[3] - startPoint[1]) / step;  //纬度差值
      let deltaLon = dLon * Math.abs(111000 * Math.cos(twoPoints[1]));  //经度差(米级)
      let deltaLat = dLat * 111000;  //纬度差(米),1纬度相差约111000米
      let endPoint = [0, 0, 0];  //定义一个端点（后面将进行startPoint和endPoint两点画线）
      let heigh = (step * Math.sqrt(deltaLon * deltaLon + deltaLat * deltaLat) * heightProportion).toFixed(0) * 2;
      let x2 = (10000 * Math.sqrt(dLon * dLon + dLat * dLat)); //小数点扩大10000倍，提高精确度
      let a = (heigh / (x2 * x2));
      function y(x, height) { return height - a * x * x; }
      for (var i = 1; i <= step; i++) {  //逐“帧”画线
        endPoint[0] = startPoint[0] + dLon; //更新end点经度
        endPoint[1] = startPoint[1] + dLat; //更新end点纬度
        let x = x2 * (2 * i / step - 1);  //求抛物线函数x
        endPoint[2] = (y(x, heigh)).toFixed(0) * 1;  //求end点高度
        s = s.concat(endPoint)

        // end点变为start点
        startPoint[0] = endPoint[0];
        startPoint[1] = endPoint[1];
        startPoint[2] = endPoint[2];
      }
      return Cesium.Cartesian3.fromDegreesArrayHeights(s)
    },
    getFlylineMaterial() {
      // 创建材质，在MaterialAppearance中若不添加基础材质，模型将会透明
      var material = new Cesium.Material.fromType('Color')
      material.uniforms.color = Cesium.Color.RED;
      // 飞线效果-飞线间隔，宽度2
      let fragmentShaderSource = `         
                     varying vec2 v_st;    
                        varying float v_width;    
                        varying float v_polylineAngle;
                        varying vec4 v_positionEC;
                        varying vec3 v_normalEC;
                        void main()
                        {
                            vec2 st = v_st;

                            float num = 4.0;
                            float xx = fract(st.s*num - czm_frameNumber/60.0);
                            float r = xx;
                            float g = 0.7;
                            float b = 0.3;
                            float a = xx;
                            if(fract(st.s*num/4.0 - czm_frameNumber/240.0)<0.75){
                                a=0.0;
                            }

                            gl_FragColor = vec4(r,g,b,a);
                        }
                `
      // 自定义材质
      const aper = new Cesium.PolylineMaterialAppearance({
        material: material,
        translucent: true,
        vertexShaderSource: `
                        #define CLIP_POLYLINE 
                        void clipLineSegmentToNearPlane(
                            vec3 p0,
                            vec3 p1,
                            out vec4 positionWC,
                            out bool clipped,
                            out bool culledByNearPlane,
                            out vec4 clippedPositionEC)
                        {
                            culledByNearPlane = false;
                            clipped = false;
                            vec3 p0ToP1 = p1 - p0;
                            float magnitude = length(p0ToP1);
                            vec3 direction = normalize(p0ToP1);
                            float endPoint0Distance =  czm_currentFrustum.x + p0.z;
                            float denominator = -direction.z;
                            if (endPoint0Distance > 0.0 && abs(denominator) < czm_epsilon7)
                            {
                                culledByNearPlane = true;
                            }
                            else if (endPoint0Distance > 0.0)
                            {
                                float t = endPoint0Distance / denominator;
                                if (t < 0.0 || t > magnitude)
                                {
                                    culledByNearPlane = true;
                                }
                                else
                                {
                                    p0 = p0 + t * direction;
                                    p0.z = min(p0.z, -czm_currentFrustum.x);
                                    clipped = true;
                                }
                            }
                            clippedPositionEC = vec4(p0, 1.0);
                            positionWC = czm_eyeToWindowCoordinates(clippedPositionEC);
                        }
                        vec4 getPolylineWindowCoordinatesEC(vec4 positionEC, vec4 prevEC, vec4 nextEC, float expandDirection, float width, bool usePrevious, out float angle)
                        {
                            #ifdef POLYLINE_DASH
                            vec4 positionWindow = czm_eyeToWindowCoordinates(positionEC);
                            vec4 previousWindow = czm_eyeToWindowCoordinates(prevEC);
                            vec4 nextWindow = czm_eyeToWindowCoordinates(nextEC);
                            vec2 lineDir;
                            if (usePrevious) {
                                lineDir = normalize(positionWindow.xy - previousWindow.xy);
                            }
                            else {
                                lineDir = normalize(nextWindow.xy - positionWindow.xy);
                            }
                            angle = atan(lineDir.x, lineDir.y) - 1.570796327;
                            angle = floor(angle / czm_piOverFour + 0.5) * czm_piOverFour;
                            #endif
                            vec4 clippedPrevWC, clippedPrevEC;
                            bool prevSegmentClipped, prevSegmentCulled;
                            clipLineSegmentToNearPlane(prevEC.xyz, positionEC.xyz, clippedPrevWC, prevSegmentClipped, prevSegmentCulled, clippedPrevEC);
                            vec4 clippedNextWC, clippedNextEC;
                            bool nextSegmentClipped, nextSegmentCulled;
                            clipLineSegmentToNearPlane(nextEC.xyz, positionEC.xyz, clippedNextWC, nextSegmentClipped, nextSegmentCulled, clippedNextEC);
                            bool segmentClipped, segmentCulled;
                            vec4 clippedPositionWC, clippedPositionEC;
                            clipLineSegmentToNearPlane(positionEC.xyz, usePrevious ? prevEC.xyz : nextEC.xyz, clippedPositionWC, segmentClipped, segmentCulled, clippedPositionEC);
                            if (segmentCulled)
                            {
                                return vec4(0.0, 0.0, 0.0, 1.0);
                            }
                            vec2 directionToPrevWC = normalize(clippedPrevWC.xy - clippedPositionWC.xy);
                            vec2 directionToNextWC = normalize(clippedNextWC.xy - clippedPositionWC.xy);
                            if (prevSegmentCulled)
                            {
                                directionToPrevWC = -directionToNextWC;
                            }
                            else if (nextSegmentCulled)
                            {
                                directionToNextWC = -directionToPrevWC;
                            }
                            vec2 thisSegmentForwardWC, otherSegmentForwardWC;
                            if (usePrevious)
                            {
                                thisSegmentForwardWC = -directionToPrevWC;
                                otherSegmentForwardWC = directionToNextWC;
                            }
                            else
                            {
                                thisSegmentForwardWC = directionToNextWC;
                                otherSegmentForwardWC =  -directionToPrevWC;
                            }
                            vec2 thisSegmentLeftWC = vec2(-thisSegmentForwardWC.y, thisSegmentForwardWC.x);
                            vec2 leftWC = thisSegmentLeftWC;
                            float expandWidth = width * 0.5;
                            if (!czm_equalsEpsilon(prevEC.xyz - positionEC.xyz, vec3(0.0), czm_epsilon1) && !czm_equalsEpsilon(nextEC.xyz - positionEC.xyz, vec3(0.0), czm_epsilon1))
                            {
                                vec2 otherSegmentLeftWC = vec2(-otherSegmentForwardWC.y, otherSegmentForwardWC.x);
                                vec2 leftSumWC = thisSegmentLeftWC + otherSegmentLeftWC;
                                float leftSumLength = length(leftSumWC);
                                leftWC = leftSumLength < czm_epsilon6 ? thisSegmentLeftWC : (leftSumWC / leftSumLength);
                                vec2 u = -thisSegmentForwardWC;
                                vec2 v = leftWC;
                                float sinAngle = abs(u.x * v.y - u.y * v.x);
                                expandWidth = clamp(expandWidth / sinAngle, 0.0, width * 2.0);
                            }
                            vec2 offset = leftWC * expandDirection * expandWidth * czm_pixelRatio;
                            return vec4(clippedPositionWC.xy + offset, -clippedPositionWC.z, 1.0) * (czm_projection * clippedPositionEC).w;
                        }
                        vec4 getPolylineWindowCoordinates(vec4 position, vec4 previous, vec4 next, float expandDirection, float width, bool usePrevious, out float angle)
                        {
                            vec4 positionEC = czm_modelViewRelativeToEye * position;
                            vec4 prevEC = czm_modelViewRelativeToEye * previous;
                            vec4 nextEC = czm_modelViewRelativeToEye * next;
                            return getPolylineWindowCoordinatesEC(positionEC, prevEC, nextEC, expandDirection, width, usePrevious, angle);
                        }

                        attribute vec3 position3DHigh;
                        attribute vec3 position3DLow;
                        attribute vec3 prevPosition3DHigh;
                        attribute vec3 prevPosition3DLow;
                        attribute vec3 nextPosition3DHigh;
                        attribute vec3 nextPosition3DLow;
                        attribute vec2 expandAndWidth;
                        attribute vec2 st;
                        attribute float batchId;

                        varying float v_width;
                        varying vec2 v_st;
                        varying float v_polylineAngle;
                        
                        varying vec4 v_positionEC;
                        varying vec3 v_normalEC;
                        void main()
                        {
                        float expandDir = expandAndWidth.x;
                        float width = abs(expandAndWidth.y) + 0.5;
                        bool usePrev = expandAndWidth.y < 0.0;

                        vec4 p = czm_computePosition();
                        vec4 prev = czm_computePrevPosition();
                        vec4 next = czm_computeNextPosition();
                        
                        float angle;
                        vec4 positionWC = getPolylineWindowCoordinates(p, prev, next, expandDir, width, usePrev, angle);
                        gl_Position = czm_viewportOrthographic * positionWC;
                        
                        v_width = width;
                        v_st.s = st.s;
                        v_st.t = st.t;
                        // v_st.t = czm_writeNonPerspective(st.t, gl_Position.w);
                        v_polylineAngle = angle;


                        
                        vec4 eyePosition = czm_modelViewRelativeToEye * p;
                        v_positionEC =  czm_inverseModelView * eyePosition;      // position in eye coordinates
                        //v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                        }

                    `,
        fragmentShaderSource: fragmentShaderSource
      })
      return aper;
    },
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
  background: rgba(3, 20, 35, 0.5);
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
  background: rgba(3, 20, 35, 0.5);
  height: 17px;
  padding: 1px;
  margin: -10px auto 0;
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
.bx-popup-header-ctn {
  background: rgba(3, 20, 35, 0.5);
  color: #ffffff;
  font-size: 15px;
  padding: 4px;
  text-align: center;
}
.bx-popup-content-ctn {
  padding: 15px;
  color: #fff;
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