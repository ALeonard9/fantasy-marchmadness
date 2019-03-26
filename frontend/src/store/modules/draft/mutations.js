import { SET_PLAYER_SELECTION, DRAFT_PLAYER_REQUEST_SENT, SET_PLAYER_OWNER } from './mutation_types'

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
    }

}

export default mutations