import Vue from 'vue'
import Vuex from 'vuex'
import { debug } from 'util';
import draft from './modules/draft'

Vue.use(Vuex)
Vue.config.devtools = true

const store = new Vuex.Store({
    strict: debug,
    modules: {
        draft,
    }
})

export default store