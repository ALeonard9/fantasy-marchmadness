import  actions  from './actions'
import getters from './getters'
import mutations from './mutations'

const state = {
    draftSelection: {},
    requestSent: false,
    reqeustProcessed: false
}

export default { state, mutations, getters, actions }