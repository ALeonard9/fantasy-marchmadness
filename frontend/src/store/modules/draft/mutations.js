import { DRAFT_PLAYER_REQUEST } from './mutation_types'

const mutations = {

    [DRAFT_PLAYER_REQUEST] (state, draftSelection) {
        state.draftSelection = draftSelection
    }

}

export default mutations