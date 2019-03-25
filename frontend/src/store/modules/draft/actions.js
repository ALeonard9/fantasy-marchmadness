import { DRAFT_PLAYER_REQUEST } from "./mutation_types"

const actions = {

    sendDraftSelectionPost ({ commit }) {
        commit(DRAFT_PLAYER_REQUEST)
    }

}

export default actions