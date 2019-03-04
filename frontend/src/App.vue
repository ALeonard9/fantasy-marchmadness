<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <v-list-tile>
          <v-list-tile-title v-if="!miniVariant" v-text="menu_title"></v-list-tile-title>
          <v-btn icon @click.stop="miniVariant = !miniVariant">
            <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
          </v-btn>
        </v-list-tile>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
        >
          <router-link v-bind:to="item.path">
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </router-link>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: true,
      drawer: false,
      fixed: false,
      items: [{
        icon: 'bubble_chart',
        title: 'Leaderboard',
        path: '/leaderboard'
      },
      {
        icon: 'accessibility',
        title: 'Player Data',
        path: '/playerboard'
      },
      {
        icon: 'assignment',
        title: 'Owners',
        path: '/owner'
      },
      {
        icon: 'swap_horiz',
        title: 'Draft',
        path: '/draft'
      }],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Fantasy March Madness',
      menu_title: 'Menu'
    }
  },
  name: 'App'
}
</script>

<style>
    li a {
    text-decoration: none;
    }
</style>
