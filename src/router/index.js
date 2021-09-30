import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import test from '@/components/test'
import ailabel from '@/pages/ailabel'
import fengmap from '@/pages/fengmap'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
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
    }
  ]
})
