import { DRAFT_PLAYER_REQUEST } from './mutation_types'
import { postDraftPick } from '../../../../../backend/server'

const actions = {

    setPostDraftSelectionPost ({ commit }, draftSelection) {
        commit(DRAFT_PLAYER_REQUEST, draftSelection)
    }

}
export default actions
