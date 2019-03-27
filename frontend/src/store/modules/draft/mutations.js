import { SET_PLAYER_SELECTION, DRAFT_PLAYER_REQUEST_SENT, SET_PLAYER_OWNER, REQUEST_PLAYER_DATA, RECEIVED_PLAYER_DATA } from './mutation_types'

const mutations = {

    [SET_PLAYER_SELECTION] (state, draftSelection) {
        state.draftSelection = draftSelection
    },
    [DRAFT_PLAYER_REQUEST_SENT] (state) {
        state.requestSent = true
    },
    [SET_PLAYER_OWNER] (state, ownerId) {
        state.requestSent = false
        state.reqeustProcessed = true
        state.draftSelection.owner_id = ownerId
    },
    [REQUEST_PLAYER_DATA] (state) {
        state.requestSent = true
    },
    [RECEIVED_PLAYER_DATA] (state, playerboardData) {
        state.requestSent = false
        state.allPlayerboardData = playerboardData
        state.requestProcessed = true
    }

}

export default mutations