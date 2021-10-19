<template>
  <div>
    <div>经纬度坐标转换</div>
    <div>
      <a-input style="width: 300px" v-model="lat" />
      <a-input style="width: 300px" v-model="lng" />
      <a-select default-value="1" @change="handleChange" style="width: 300px">
        <a-select-option value="1">
          百度经纬度坐标转国测局坐标
        </a-select-option>
        <a-select-option value="2">
          国测局坐标转百度经纬度坐标
        </a-select-option>
        <a-select-option value="3"> wgs84转国测局坐标 </a-select-option>
        <a-select-option value="4"> 国测局坐标转wgs84坐标 </a-select-option>
      </a-select>
      <a-button @click="change">转换</a-button>
    </div>
    <div>结果：{{ result }}</div>
  </div>
</template>
<script>
var util = require('./index');
export default {
  data() {
    return {
      lat: '106.4763485',
      lng: '29.65756349',
      type: '1',
      result: ''
    }
  },
  methods: {
    handleChange(value) {
      this.type = value
    },

    change() {
      switch (this.type) {
        case '1':
          //百度经纬度坐标转国测局坐标
          this.result = util.coordtransform.bd09togcj02(this.lat, this.lng);
          break;
        case '2':
          //国测局坐标转百度经纬度坐标
          this.result = util.coordtransform.gcj02tobd09(this.lat, this.lng);
          break;
        case '3':
          //wgs84转国测局坐标
          this.result = util.coordtransform.wgs84togcj02(this.lat, this.lng);
          break;
        case '4':
          //国测局坐标转wgs84坐标
          this.result = util.coordtransform.gcj02towgs84(this.lat, this.lng);
          break;

      }
    }
  }
}
</script>