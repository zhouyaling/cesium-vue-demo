<template>
  <div>
    <vc-viewer @ready="ready">
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
    </vc-viewer>
    <div class="page-btn-action">
      <a-button type="primary" @click="changeStyle(1)">矢量瓦片</a-button>
      <a-button type="primary" @click="changeStyle(3)">矢量瓦片-浅色</a-button>
      <a-button type="primary" @click="changeStyle(2)">影像瓦片</a-button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      alpha: 1,
      brightness: 1,
      contrast: 1,
      url: 'http://api0.map.bdimg.com/customimage/tile?=&x={x}&y={y}&z={z}&scale=1&customid=midnight',
      projectionTransforms: {
        form: 'BD09',
        to: 'WGS84'
      },
    }
  },
  methods: {
    ready(cesiumInstance) {
      const { Cesium, viewer } = cesiumInstance
    },
    changeStyle(number) {
      if (number == 1) {
        this.url = "http://api0.map.bdimg.com/customimage/tile?=&x={x}&y={y}&z={z}&scale=1&customid=midnight"
      } else if (number == 2) {
        this.url = "http://shangetu1.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46"
      } else if (number ==3) {
        this.url = "http://{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1"
      }
    }

  }
}
</script>