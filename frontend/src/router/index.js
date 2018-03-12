import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Leaderboard from '@/components/Leaderboard'
import Playerboard from '@/components/Playerboard'
import Draft from '@/components/Draft'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Leaderboard',
      component: Leaderboard
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      component: Leaderboard
    },
    {
      path: '/playerboard',
      name: 'Playerboard',
      component: Playerboard
    },
    {
      path: '/draft',
      name: 'Draft',
      component: Draft
    }
  ]
})
