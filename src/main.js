// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueCesium from 'vue-cesium'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import 'vue-cesium/lib/style.css'
import './style/common.css'

Vue.config.productionTip = false
Vue.use(Antd)
Vue.use(VueCesium, {
  // 1.83
  // cesiumPath: 'https://cdn.jsdelivr.net/npm/cesium@latest/Build/Cesium/Cesium.js',
  // cesiumPath: 'https://unpkg.com/cesium/Build/Cesium/Cesium.js',
  cesiumPath: '/static/Cesium/Cesium.js',
  accessToken:  'pk.eyJ1IjoiemhvdXlhbGluZyIsImEiOiJjanJibnQ3Y3cwNmU3NDNwNHBjNHFscWc1In0.ir-kFtEbcIM_X6HhvgByiA'//'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTUwOTMxNS1jNjhmLTRiM2MtYTdlMi0wYzYzMDY3YWI4NDkiLCJpZCI6NjE3MTcsImlhdCI6MTYyNjMxMjEzOX0.B0lgtVKkGd_RK-snHBqDf_4VdBrjwk9YiyJWJRkm79U',
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
