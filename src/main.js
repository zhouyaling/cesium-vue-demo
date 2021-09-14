// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueCesium from 'vue-cesium'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import 'vue-cesium/lib/style.css'

Vue.config.productionTip = false
Vue.use(Antd)
Vue.use(VueCesium, {
  cesiumPath: 'https://cdn.jsdelivr.net/npm/cesium@latest/Build/Cesium/Cesium.js',
  accessToken: '',
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
