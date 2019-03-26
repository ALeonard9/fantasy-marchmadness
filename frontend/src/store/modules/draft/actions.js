import { SET_PLAYER_SELECTION, SET_PLAYER_OWNER, DRAFT_PLAYER_REQUEST_SENT } from './mutation_types'
import axios from 'axios'

const actions = {

    setPostDraftSelectionPost ({ commit }, draftSelection) {
        commit(SET_PLAYER_SELECTION, draftSelection)  
    },

    draftSelectedPlayer ({ commit }, {draftSelection, ownerId}) {
        console.log(draftSelection)
        console.log(ownerId)
        commit(DRAFT_PLAYER_REQUEST_SENT)
        axios.post('http://localhost:8080/draft_player', draftSelection)
        .then((response) => {
            if(response) {
                console.log(response)
                commit(SET_PLAYER_OWNER, ownerId)
            }
        })
    }

}
export default actions
