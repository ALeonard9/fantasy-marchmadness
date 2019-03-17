import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import JsonCSV from 'vue-json-csv'

Vue.component('downloadCsv', JsonCSV)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
