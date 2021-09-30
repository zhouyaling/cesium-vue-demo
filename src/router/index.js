import Vue from 'vue'
import Router from 'vue-router'
import index from '@/pages/index' // 首页
import HelloWorld from '@/components/HelloWorld' // 嵌入tos
import test from '@/components/test' // 测试
import ailabel from '@/pages/ailabel' // 图片编辑
import fengmap from '@/pages/fengmap' // 蜂鸟云
import mapBase from '@/pages/mapBase' // 基础底图
import mapAmap from '@/pages/mapAmap' // gaode
import bmap from '@/pages/mapBmap' // gaode
import billboard from '@/pages/billboard' // 广告牌

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/tos',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/test',
      name: 'test',
      component: test
    }
    ,
    {
      path: '/ailabel',
      name: 'ailabel',
      component: ailabel
    },
    {
      path: '/fengmap',
      name: 'fengmap',
      component: fengmap
    },
    {
      path: '/mapBase',
      name: 'mapBase',
      component: mapBase
    },
    ,
    {
      path: '/amap',
      name: 'amap',
      component: mapAmap
    }
    ,
    {
      path: '/bmap',
      name: 'bmap',
      component: bmap
    },
    {
      path: '/billboard',
      name: 'billboard',
      component: billboard
    }
  ]
})
