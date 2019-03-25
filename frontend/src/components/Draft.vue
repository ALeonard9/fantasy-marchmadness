<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <v-flex xs12 sm6 justify-center>
          <h1>Draft Order</h1>
          <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :pagination.sync="pagination"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>{{ props.item.name }}</td>
              <td class="text-xs-center">{{ props.item.draft_position }}</td>
              <td v-if="!draft_set" class="text-xs-center">{{ props.item.new_draft_position }}</td>
             </template>
          </v-data-table>
          <!--  REMOVE AFTER DRAFT -->
          <!-- <div class="text-xs-center pt-2">
            <v-btn v-if="!draft_set" color="primary" @click.native="loadDraft">Randomize</v-btn>
            <v-btn v-if="!draft_set" color="primary" @click.native="setDraft">Set Draft Order</v-btn>
            <v-btn v-if="draft_set" color="primary" @click.native="resetDraft">Clear Draft Order</v-btn>
          </div> -->
        </v-flex>
        <v-flex xs12 sm6 justify-center>
          <h1>Draft Results</h1>
          <v-data-table
            :headers="drafted_player_headers"
            :items="drafted_players"
            :loading="drafted_player_loading"
            :pagination.sync="drafted_player_pagination"
            :no-data-text="drafted_players_no_data_text"
            item-key="player_id"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td><router-link :to="{ name: 'Owner', params: {id: props.item.id } }">{{ props.item.name }}</router-link></td>
              <td class="text-xs-left" v-bind:class="{  eliminated: props.item.eliminated }">#{{ props.item.jersey }} {{ props.item.full_name }}</td>
              <td class="text-xs-left " v-bind:class="{ eliminated: props.item.eliminated }">{{ props.item.school }}</td>
              <!-- <td class="text-xs-center hidden-xs-only" v-bind:class="{ eliminated: props.item.eliminated }">{{ props.item.seed }}</td>
              <td class="text-xs-center hidden-xs-only" v-bind:class="{ eliminated: props.item.eliminated }">{{ props.item.region }}</td> -->
              <td class="text-xs-left hidden-xs-only">{{ props.item.drafted_round }}</td>
              <td class="text-xs-left">{{ props.item.draft_pick }}</td>
              <td class="text-xs-center hidden-xs-only">{{ props.item.scoring_average }}</td>
              <td class="text-xs-center hidden-xs-only">{{ props.item.projected_score }}</td>
              <td class="text-xs-left">{{ props.item.total }}</td>
             </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
  var defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  var defaultOptions = {
    method: 'GET',
    headers: defaultHeaders,
    mode: 'cors',
  };
  export default {
    data () {
      return {
        mobile: true,
        loading: true,
        draft_set: false,
        pagination: {},
        headers: [],
        items: [],
        drafted_players: [],
        drafted_player_loading: true,
        drafted_player_pagination: {},
        drafted_player_headers: [],
        drafted_players_no_data_text: "No players drafted."
      }
    },
    created: function () {},
    mounted: function () {
      if(window.innerWidth < 1100){
        this.mobile = true;
      } else {
        this.mobile = false;
      }
      this.$nextTick(function() {
        window.addEventListener('resize', function() {
          if(window.innerWidth < 1100){
            this.mobile = true;
          } else {
            this.mobile = false;
          }
        });
      })
      this.loadDraft()
      this.loadDraftedPlayers()
    },
    methods: {
      loadDraft(){
        fetch(`${process.env.VUE_APP_BACKEND_URL}/draft/randomizer`, defaultOptions)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.items = [];
            if (data[0].draft_position){
              this.draft_set = true;
              this.pagination = {'sortBy': 'draft_position', 'ascending': true, 'rowsPerPage': -1};
              this.headers = [
                { text: 'Owner', sortable: false, align: 'left', value: 'owner'},
                { text: 'Current Draft Position', value: 'draft_position' }
              ];
             } else {
                this.draft_set = false;
                this.pagination = {'sortBy': 'new_draft_position', 'ascending': true, 'rowsPerPage': -1};
                this.headers = [
                  { text: 'Owner', sortable: false, align: 'left', value: 'owner'},
                  { text: 'Current Draft Position', value: 'draft_position' },
                  { text: 'Proposed Draft Position', value: 'new_draft_position' }
                ];
             }
            var proposed = 0;
            data.forEach((element) => {
              proposed += 1;
              var entry = {
                value: false,
                name: `${element.display_name} (${element.name})`,
                id: element.id,
                draft_position: element.draft_position,
                new_draft_position: proposed
              }
              this.items.push(entry);
            })
            this.loading = false;
          })
      },
      loadDraftedPlayers(){
        fetch(`${process.env.VUE_APP_BACKEND_URL}/draft/results`, defaultOptions)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.drafted_players = [];
            this.drafted_player_pagination = {'sortBy': 'draft_pick', 'ascending': true, 'rowsPerPage': -1};
            this.drafted_player_headers = [
              { text: 'Owner', align: 'left', value: 'owner'},
              { text: 'Player', value: 'full_name' },
              { text: 'School', value: 'school', class: 'hidden-xs-only'},
              // { text: 'Seed', value: 'seed', class: 'hidden-xs-only' },
              // { text: 'Region', value: 'region', class: 'hidden-xs-only' },
              { text: 'Round', value: 'drafted_round', class: 'hidden-xs-only'},
              { text: 'Pick', value: 'draft_pick'},
              { text: 'Scoring', value: 'scoring_average', class: 'hidden-xs-only'},
              { text: 'Projection', value: 'projected_score', class: 'hidden-xs-only'},
              { text: 'Total', value: 'total'}
            ];
            data.forEach((element) => {
              var eliminated_player = false;
              if (element.eliminated > 0 ){
                eliminated_player = true;
              }
              var entry = {
                value: false,
                name: `${element.display_name} (${element.name})`,
                id: element.id,
                player_id: element.player_id,
                full_name: element.full_name,
                scoring_average: element.scoring_average,
                projected_score: element.projected_score,
                school: `${element.school} ${element.mascot}`,
                seed: element.seed,
                region: element.region,
                jersey: element.jersey,
                draft_pick: element.draft_pick,
                drafted_round: element.drafted_round,
                eliminated: eliminated_player,
                total: element.total
              }
              this.drafted_players.push(entry);
            })
            this.drafted_player_loading = false;
          })
      },
      setDraft(){
        var draft_entry = {};
        this.items.forEach((element) => {
          draft_entry[element.new_draft_position] = element.id;
        })
        fetch(`${process.env.VUE_APP_BACKEND_URL}/draft`, {
          ...defaultOptions,
          method: 'POST',
          body: JSON.stringify(draft_entry)
        })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          this.draft_set = true;
          this.loadDraft();
        })
      },
      resetDraft(){
        fetch(`${process.env.VUE_APP_BACKEND_URL}/draft/reset`, defaultOptions)
          .then((response) => {
            return response.json();
          })
          .then(() => {
            this.draft_set = false;
            this.loadDraft();
          })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.eliminated {
  background-color: IndianRed !important;
}
</style>
