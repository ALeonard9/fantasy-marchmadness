import { SET_PLAYER_SELECTION, SET_PLAYER_OWNER, DRAFT_PLAYER_REQUEST_SENT, REQUEST_PLAYER_DATA, RECEIVED_PLAYER_DATA } from './mutation_types'
import axios from 'axios'

const actions = {

    setPostDraftSelectionPost ({ commit }, draftSelection) {
        commit(SET_PLAYER_SELECTION, draftSelection)  
    },

    draftSelectedPlayer ({ commit }, {draftSelection, ownerId}) {
        commit(DRAFT_PLAYER_REQUEST_SENT)
        axios.post('http://localhost:8080/draft_player', draftSelection)
        .then((response) => {
            if(response) {
                commit(SET_PLAYER_OWNER, ownerId)
            }
        })
    },
    retrievePlayerboardData( { commit }) {
        commit(REQUEST_PLAYER_DATA)
        axios.get('http://localhost:8080/playerboard')
        .then(response => {
            if (response) {
                commit(RECEIVED_PLAYER_DATA, response.data)
            }
        })
    }

}
export default actions
