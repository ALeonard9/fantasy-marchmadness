import Vue from 'vue'
import Router from 'vue-router'
import Leaderboard from '@/components/Leaderboard'
import Playerboard from '@/components/Playerboard'
import Draft from '@/components/Draft'
import Owner from '@/components/Owner'

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
    },
    {
      path: '/owner/:id',
      name: 'Owner',
      component: Owner
    },
    {
      path: '/owner',
      name: 'Owner',
      component: Owner
    }
  ]
})
