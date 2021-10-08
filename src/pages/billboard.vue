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
      <a-button type="primary" @click="addLine">设置飞线</a-button>
      <a-button type="primary" @click="loadHeatMap">加载热力图</a-button>
      <a-button type="primary" @click="addMarkHtml">添加html</a-button>
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

    },


    addLine() {

      var center = Cesium.Cartesian3.fromDegrees(106.491032, 29.613683, 3000); // 位置
      var heading = Cesium.Math.toRadians(0.0);
      var pitch = Cesium.Math.toRadians(-45);
      var range = 5660000;
      this.viewer.camera.lookAt(
        center,
        new Cesium.HeadingPitchRange(heading, pitch, range)
      );

      // this.viewer.camera.flyTo({
      //   destination: Cesium.Cartesian3.fromDegrees(
      //     106.491032, 29.613683,
      //     3660000
      //   ),
      //   duration: 2,
      //   orientation: {
      //     heading: Cesium.Math.toRadians(-90),
      //     pitch: Cesium.Math.toRadians(-60),
      //     roll: 0,
      //   },
      // });

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
            releaseGeometryInstances: false,
            compressVertices: false,
          })
        )

      });


    },

    computeFlyline(
      point1 = [106.491032, 29.613683],
      point2 = [100.491032, 31.613683],
      h = 500000
    ) {
      let flyline = getBSRxyz(...point1, ...point2, h)
      return flyline
      // 将数据转换为cesium polyline positions格式
      function getBSRxyz(x1, y1, x2, y2, h) {
        let arr3d = getBSRPoints(x1, y1, x2, y2, h)
        let arrAll = []
        for (let ite of arr3d) {
          arrAll.push(ite[0])
          arrAll.push(ite[1])
          arrAll.push(ite[2])
        }
        return Cesium.Cartesian3.fromDegreesArrayHeights(arrAll)
      }
      function getBSRPoints(x1, y1, x2, y2, h) {
        let point1 = [y1, 0]
        let point2 = [(y2 + y1) / 2, h]
        let point3 = [y2, 0]
        let arr = getBSR(point1, point2, point3)
        let arr3d = []
        for (let i = 0; i < arr.length; i++) {
          let x = ((x2 - x1) * (arr[i][0] - y1)) / (y2 - y1) + x1
          arr3d.push([x, arr[i][0], arr[i][1]])
        }
        return arr3d
      }
      // 生成贝塞尔曲线
      function getBSR(point1, point2, point3) {
        var ps = [
          { x: point1[0], y: point1[1] },
          { x: point2[0], y: point2[1] },
          { x: point3[0], y: point3[1] }
        ]
        // 100 每条线由100个点组成
        let guijipoints = CreateBezierPoints(ps, 100)
        return guijipoints
      }
      // 贝赛尔曲线算法
      // 参数：
      // anchorpoints: [{ x: 116.30, y: 39.60 }, { x: 37.50, y: 40.25 }, { x: 39.51, y: 36.25 }]
      function CreateBezierPoints(anchorpoints, pointsAmount) {
        var points = []
        for (var i = 0; i < pointsAmount; i++) {
          var point = MultiPointBezier(anchorpoints, i / pointsAmount)
          points.push([point.x, point.y])
        }
        return points
      }
      function MultiPointBezier(points, t) {
        var len = points.length
        var x = 0,
          y = 0
        var erxiangshi = function (start, end) {
          var cs = 1,
            bcs = 1
          while (end > 0) {
            cs *= start
            bcs *= end
            start--
            end--
          }
          return cs / bcs
        }
        for (var i = 0; i < len; i++) {
          var point = points[i]
          x +=
            point.x *
            Math.pow(1 - t, len - 1 - i) *
            Math.pow(t, i) *
            erxiangshi(len - 1, i)
          y +=
            point.y *
            Math.pow(1 - t, len - 1 - i) *
            Math.pow(t, i) *
            erxiangshi(len - 1, i)
        }
        return { x: x, y: y }
      }
    },
    parabola(twoPoints) {  //抛物线绘制
      let s = []
      let startPoint = [twoPoints[0], twoPoints[1], 0]; //起点的经度、纬度
      s = s.concat(startPoint)
      let step = 80;  //线的多少，越多则越平滑(但过多浏览器缓存也会占用越多)
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
      material.uniforms.color = Cesium.Color.ORANGE
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
                            // 箭头飞线，宽度 8
                            float xx = fract(st.s*10.0 + st.t  - czm_frameNumber/60.0);
                            if (st.t<0.5) {
                                xx = fract(st.s*10.0 - st.t - czm_frameNumber/60.0);
                            }
                            float r = 0.0;
                            float g = xx;
                            float b = xx;
                            float a = xx;

                            // 飞线边框
                            if (st.t>0.8||st.t<0.2) {
                                g = 1.0;
                                b = 1.0;
                                a = 0.4;
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