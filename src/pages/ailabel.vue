<template>
  <div class="wrapper">
    <div id="map"></div>
    <div class="zoom-icon-wrapper">
      <div class="zoom-icon-plus" @click="zoomIn">+</div>
      <div class="zoom-icon-minus" @click="zoomOut">-</div>
    </div>
    <div class="button-wrap">
      <a-button class="btn btn-default" @click="setMode('PAN')">平移</a-button>
      <a-button class="btn btn-default" @click="setMode('MARKER')"
        >注记</a-button
      >
      &nbsp;&nbsp;
      <a-button class="btn btn-default" @click="setMode('POINT')">点</a-button>
      <a-button class="btn btn-default" @click="setMode('LINE')">线段</a-button>
      <a-button class="btn btn-default" @click="setMode('POLYLINE')"
        >多段线</a-button
      >
      <a-button class="btn btn-default" @click="setMode('CIRCLE')">圆</a-button>
      <a-button class="btn btn-default" @click="setMode('RECT')">矩形</a-button>
      <a-button class="btn btn-default" @click="setMode('POLYGON')"
        >多边形</a-button
      >
      <a-button class="btn btn-default" @click="getFeatures()"
        >获取标注数据</a-button
      >
      <a-button class="btn btn-default" @click="exportImage('base64')"
        >导出base64图片</a-button
      >
      <a-button class="btn btn-default" @click="exportImage('blob')"
        >导出blob图片</a-button
      >
      &nbsp;&nbsp;
      <a-button class="btn btn-default" @click="setMode('DRAWMASK')"
        >涂抹</a-button
      >
      <a-button class="btn btn-default" @click="setMode('CLEARMASK')"
        >擦除</a-button
      >
      <a-button class="btn btn-default" @click="getRle()">获取rle数据</a-button>
      &nbsp;&nbsp;
      <a href="./label/index.html" target="_blank">>>标注demo</a>
    </div>
  </div>
</template>
<script>
import AILabel from 'ailabel'
let drawingStyle = {};
let dpr = window.devicePixelRatio;
let gFirstFeatureLayer = null;
let gFirstMaskLayer = null;
export default {
  components: {},
  props: {},
  data() {
    return {
      gMap: null,

    }
  },
  methods: {

  },
  mounted() {
    // let drawingStyle = {}; // 绘制过程中样式
    // const dpr = window.devicePixelRatio;

    // 声明容器
    this.gMap = new AILabel.Map('map', {
      center: { x: 540, y: 360 },
      zoom: 800,
      mode: 'PAN', // 绘制线段
      refreshDelayWhenZooming: true, // 缩放时是否允许刷新延时，性能更优
      zoomWhenDrawing: true,
      panWhenDrawing: true,
      zoomWheelRatio: 0, // 控制滑轮缩放缩率[0, 10), 值越小，则缩放越快，反之越慢
      withHotKeys: false // 关闭快捷键
    });

    // click单击事件
    this.gMap.events.on('click', point => {
      // console.log('--click--', point);
    });

    this.gMap.events.on('drawDone', (type, data, data1) => {
      console.log('--type, data--', type, data);
      if (type === 'MARKER') {
        const marker = new AILabel.Marker(
          `${+new Date()}`, // id
          {
            src: require('../assets/images/marker.png'),
            position: data,
            offset: {
              x: -16,
              y: 32
            }
          }, // markerInfo
          { name: '第一个marker注记' } // props
        );
        marker.events.on('click', marker => {
          console.log('marker click');
          this.gMap.markerLayer.removeMarkerById(marker.id);
        });
        this.gMap.markerLayer.addMarker(marker);
      }
      else if (type === 'POINT') {
        const pointFeature = new AILabel.Feature.Point(
          `${+new Date()}`, // id
          { ...data, sr: 3 }, // shape
          { name: '第一个矢量图层' }, // props
          drawingStyle // style
        );
        gFirstFeatureLayer.addFeature(pointFeature);
      }
      else if (type === 'CIRCLE') {
        // data 代表r半径shape；data1代表sr半径shape
        const circleFeature = new AILabel.Feature.Circle(
          `${+new Date()}`, // id
          data, // data1代表屏幕坐标 shape
          { name: '第一个矢量图层' }, // props
          { fillStyle: '#F4A460', strokeStyle: '#D2691E', lineWidth: 2 } // style
        );
        gFirstFeatureLayer.addFeature(circleFeature);
      }
      else if (type === 'LINE') {
        const scale = this.gMap.getScale();
        const width = drawingStyle.lineWidth / scale;
        const lineFeature = new AILabel.Feature.Line(
          `${+new Date()}`, // id
          { ...data, width }, // shape
          { name: '第一个矢量图层' }, // props
          drawingStyle // style
        );
        gFirstFeatureLayer.addFeature(lineFeature);
      }
      else if (type === 'POLYLINE') {
        const scale = this.gMap.getScale();
        const width = drawingStyle.lineWidth / scale;
        const polylineFeature = new AILabel.Feature.Polyline(
          `${+new Date()}`, // id
          { points: data, width }, // shape
          { name: '第一个矢量图层' }, // props
          drawingStyle // style
        );
        gFirstFeatureLayer.addFeature(polylineFeature);
      }
      else if (type === 'RECT') {
        const rectFeature = new AILabel.Feature.Rect(
          `${+new Date()}`, // id
          data, // shape
          { name: '矢量图形' }, // props
          drawingStyle // style
        );
        gFirstFeatureLayer.addFeature(rectFeature);
      }
      else if (type === 'POLYGON') {
        const polygonFeature = new AILabel.Feature.Polygon(
          `${+new Date()}`, // id
          { points: data }, // shape
          { name: '矢量图形' }, // props
          drawingStyle // style
        );
        gFirstFeatureLayer.addFeature(polygonFeature);
      }
      else if (type === 'DRAWMASK') {
        const scale = this.gMap.getScale();
        const width = drawingStyle.lineWidth / scale;
        const drawMaskAction = new AILabel.Mask.Draw(
          `${+new Date()}`, // id
          '铅笔',
          { points: data, width }, // shape
          { name: '港币', price: '1元' }, // props
          drawingStyle // style
        );
        gFirstMaskLayer.addAction(drawMaskAction);
      }
      else if (type === 'CLEARMASK') {
        const scale = this.gMap.getScale();
        const width = drawingStyle.lineWidth / scale;
        const clearMaskAction = new AILabel.Mask.Clear(
          `${+new Date()}`, // id
          { points: data, width } // shape
        );
        gFirstMaskLayer.addAction(clearMaskAction);
      }
    });
    this.gMap.events.on('boundsChanged', data => {
      // console.log('--map boundsChanged--');
      return 2222;
    });
    this.gMap.events.on('featureSelected', feature => {
      // console.log('--map featureSelected--', feature);
      this.gMap.setActiveFeature(feature);
    });
    this.gMap.events.on('featureUnselected', () => {
      // 取消featureSelected
      this.gMap.setActiveFeature(null);
    });
    this.gMap.events.on('featureUpdated', (feature, shape) => {
      feature.updateShape(shape);
    });
    this.gMap.events.on('featureDeleted', ({ id: featureId }) => {
      gFirstFeatureLayer.removeFeatureById(featureId);
    });


    // 显示一张图片
    const gFirstImageLayer = new AILabel.Layer.Image(
      'first-layer-image', // id
      {
        src: require('../assets/images/1.jpg'),
        width: 1080,
        height: 700,
        position: { // 图片左上角坐标
          x: 0,
          y: 0
        },
        grid: { // 3 * 3
          columns: [{ color: '#9370DB' }, { color: '#FF6347' }],
          rows: [{ color: '#9370DB' }, { color: '#FF6347' }]
        },
      }, // imageInfo
      { name: '第一个图片图层' }, // props
      { zIndex: 5 } // style
    );

    // 图片层相关事件监听
    gFirstImageLayer.events.on('loadStart', (a, b) => {
      console.log('--loadStart--', a, b);
    });
    gFirstImageLayer.events.on('loadEnd', (a, b) => {
      console.log('--loadEnd--', a, b);
    });
    gFirstImageLayer.events.on('loadError', (a, b) => {
      console.log('--loadError--', a, b);
    });

    this.gMap.addLayer(gFirstImageLayer);

    // 添加矢量图层（用于展示矢量图形）
    gFirstFeatureLayer = new AILabel.Layer.Feature(
      'first-layer-feature', // id
      { name: '第一个矢量图层' }, // props
      { zIndex: 10 } // style
    );
    this.gMap.addLayer(gFirstFeatureLayer);
    gFirstMaskLayer = new AILabel.Layer.Mask(
      'first-layer-mask', // id
      { name: '第一个涂抹图层' }, // props
      { zIndex: 11, opacity: .5 } // style
    );
    this.gMap.addLayer(gFirstMaskLayer);
    const gFirstMaskImageAction = new AILabel.Mask.Image(
      'first-image-action', // id
      '钢笔',
      {
        src: require('../assets/images/mask_min.png'),
        width: 500,
        height: 354,
        position: { // 左上角相对中心点偏移量
          x: 0,
          y: 0
        }
      }, // imageInfo
    );
    gFirstMaskLayer.addAction(gFirstMaskImageAction);

    const gFirstTextLayer = new AILabel.Layer.Text(
      'first-layer-text', // id
      { name: '第一个文本图层' }, // props
      { zIndex: 12, opacity: 1 } // style
    );
    this.gMap.addLayer(gFirstTextLayer);

    const gFirstText = new AILabel.Text(
      'first-text', // id
      { text: '中华人民共和国', position: { x: 300, y: 300 }, offset: { x: 0, y: 0 } }, // shape
      { name: '第一个文本对象' }, // props
      { fillStyle: '#F4A460', strokeStyle: '#D2691E', background: true, globalAlpha: 1, fontColor: '#0f0' } // style
    );
    gFirstTextLayer.addText(gFirstText);

    const gFirstFeaturePoint = new AILabel.Feature.Point(
      'first-feature-point', // id
      { x: 250, y: 177, sr: 3 }, // shape
      { name: '第一个矢量图层' }, // props
      { fillStyle: '#f00', lineCap: 'round' } // style
    );
    gFirstFeatureLayer.addFeature(gFirstFeaturePoint);

    const gFirstFeatureCircle = new AILabel.Feature.Circle(
      'first-feature-circle', // id
      { cx: 100, cy: 100, sr: 20 }, // shape
      { name: '第一个矢量图层' }, // props
      { fillStyle: '#F4A460', strokeStyle: '#00f', lineWidth: 1, stroke: true, fill: false } // style
    );
    gFirstFeatureLayer.addFeature(gFirstFeatureCircle);

    const gFirstFeatureLine = new AILabel.Feature.Line(
      'first-feature-line', // id
      { start: { x: 100, y: 150 }, end: { x: 200, y: 250 }, width: 10 }, // shape
      { name: '第一个矢量图层' }, // props
      { strokeStyle: '#FF4500', lineCap: 'round' } // style
    );
    gFirstFeatureLayer.addFeature(gFirstFeatureLine);
    const gFirstFeatureRect = new AILabel.Feature.Rect(
      'first-feature-rect', // id
      { x: 200, y: 50, width: 100, height: 100 }, // shape
      { name: '第一个矢量图层' }, // props
      { strokeStyle: '#00f', lineWidth: 1, fillStyle: '#00f', globalAlpha: .3, fill: true } // style
    );
    gFirstFeatureLayer.addFeature(gFirstFeatureRect);
    const gFirstFeaturePolygon = new AILabel.Feature.Polygon(
      'first-feature-polygon', // id
      {
        points: [
          { x: 367, y: 161 }, { x: 371, y: 220 }, { x: 412, y: 241 },
          { x: 474, y: 210 }, { x: 467, y: 151 }, { x: 426, y: 124 }
        ]
      }, // shape
      { name: '第一个多边形' }, // props
      { strokeStyle: '#0000FF', lineWidth: 1 } // style
    );
    gFirstFeatureLayer.addFeature(gFirstFeaturePolygon);

    const gFirstMarker = new AILabel.Marker(
      'first-marker', // id
      {
        src: require('../assets/images/marker.png'),
        position: { // 左上角相对中心点偏移量
          x: 250,
          y: 177
        },
        offset: {
          x: -16,
          y: 32
        }
      }, // markerInfo
      { name: '第一个marker注记' } // props
    );
    gFirstMarker.events.on('mouseDown', marker => {
      console.log('marker mouseDown');
    });
    gFirstMarker.events.on('mouseUp', marker => {
      console.log('marker mouseUp');
    });
    gFirstMarker.events.on('mouseOver', marker => {
      console.log('marker mouseOver');
    });
    gFirstMarker.events.on('mouseOut', marker => {
      console.log('marker mouseOut');
    });
    gFirstMarker.events.on('dragStart', marker => {
      console.log('marker dragStart');
    });
    gFirstMarker.events.on('dragging', marker => {
      console.log('marker dragging');
    });
    gFirstMarker.events.on('dragEnd', (marker, newPosition) => {
      console.log('marker dragEnd');
      marker.updatePosition(newPosition);
    });
    gFirstMarker.events.on('rightClick', marker => {
      console.log('marker click');
      this.gMap.markerLayer.removeMarkerById(marker.id);
    });
    gFirstMarker.enableDragging();
    this.gMap.markerLayer.addMarker(gFirstMarker);

    window.onresize = () => {
      this.gMap && this.gMap.resize();
    }
  },
  methods: {
    zoomIn() {
      this.gMap.zoomIn();
    },
    zoomOut() {
      this.gMap.zoomOut();
    },
    getRle() {
      const rleData = gFirstMaskLayer.getRleData({ x: 0, y: 0, width: 500, height: 354 });
      console.log('--rleData--', rleData);
    },
    setMode(mode) {
      this.gMap.setMode(mode);
      // 后续对应模式处理
      switch (this.gMap.mode) {
        case 'PAN': {
          break;
        }
        case 'MARKER': {
          // 忽略
          break;
        }
        case 'POINT': {
          drawingStyle = { fillStyle: '#9370DB' };
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'CIRCLE': {
          drawingStyle = { fillStyle: '#9370DB', strokeStyle: '#0000FF', lineWidth: 2 };
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'LINE': {
          drawingStyle = { strokeStyle: '#FF00FF', lineJoin: 'round', lineCap: 'round', lineWidth: 10 };
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'POLYLINE': {
          drawingStyle = { strokeStyle: '#FF1493', lineJoin: 'round', lineCap: 'round', lineWidth: 10 }
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'RECT': {
          drawingStyle = { strokeStyle: '#0f0', lineWidth: 1 }
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'POLYGON': {
          drawingStyle = { strokeStyle: '#00f', fillStyle: '#0f0', globalAlpha: .3, lineWidth: 1, fill: true, stroke: true }
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'DRAWMASK': {
          drawingStyle = { strokeStyle: 'rgba(255, 0, 0, .5)', fillStyle: '#00f', lineWidth: 50 }
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case 'CLEARMASK': {
          drawingStyle = { fillStyle: '#00f', lineWidth: 30 }
          this.gMap.setDrawingStyle(drawingStyle);
          break;
        }
        default:
          break;
      }
    },

    // 导出图片上护具
    async exportImage(type) {
      const imagedata = await this.gMap.exportLayersToImage(
        { x: 0, y: 0, width: 500, height: 354 },
        { type, format: 'image/png' }
      );

      const imageDom = new Image();
      if (type === 'base64') {
        // 导出base64格式
        imageDom.src = imagedata;
      }
      else {
        // 导出blob格式
        const url = URL.createObjectURL(imagedata);
        imageDom.src = url;
        imageDom.onload = () => { URL.revokeObjectURL(url); }
      }

      let aLink = document.createElement('a');
      aLink.style.display = 'none';
      aLink.href = imageDom.src;
      aLink.download = 'export.png';
      // 触发点击-然后移除
      document.body.appendChild(aLink);
      aLink.click();
      document.body.removeChild(aLink);
    },

    // 获取所有features
    getFeatures() {
      const allFeatures = gFirstFeatureLayer.getAllFeatures();
      console.log('--allFeatures--', allFeatures);
    },

    // 实例销毁
    destroy() {
      this.gMap.destroy();
    }
  }
}
</script>
<style  scoped>
#map {
  width: 1080px;
  height: 720px;
  border: 1px solid red;
  position: relative;
  cursor: pointer;
}
</style>