<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <h1>Player Data</h1>

          <v-card>
          <v-card-title>
            <div class="text-xs-center pt-2">
              <v-btn v-if="!score_filter" color="primary" @click.native="score_filter_toggle">All Players</v-btn>
              <v-btn v-if="score_filter" color="primary" @click.native="score_filter_toggle">10+ PPG Scorers</v-btn>
              <v-btn v-if="draft_filter === 0" color="primary" @click.native="draft_filter_toggle">All Players</v-btn>
              <v-btn v-if="draft_filter === 1" color="primary" @click.native="draft_filter_toggle">Drafted</v-btn>
              <v-btn v-if="draft_filter === 2" color="primary" @click.native="draft_filter_toggle">Undrafted</v-btn>
              <download-csv
                  class = "v-btn theme--light primary"
                  name = "fantasymarchmadness2019.csv"
                  :data   = "items">
                  Download
              </download-csv>
            </div>
            <v-spacer></v-spacer>
            <v-text-field
              append-icon="search"
              label="Search"
              single-line
              hide-details
              v-model="search"
            ></v-text-field>
          </v-card-title>
        <v-data-table
          :search="search"
          :headers="headers"
          :items="items"
          :loading="loading"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td  v-bind:class="{ drafted: props.item.drafted }"><router-link :to="{ name: 'Owner', params: {id: props.item.id } }">{{ props.item.name }}</router-link></td>
            <td class="text-xs-left" v-bind:class="{ drafted: props.item.drafted, eliminated: props.item.eliminated }">#{{ props.item.jersey }} {{ props.item.full_name }}</td>
            <td class="text-xs-left " v-bind:class="{ drafted: props.item.drafted, eliminated: props.item.eliminated }">{{ props.item.school }}</td>
            <td class="text-xs-center hidden-xs-only" v-bind:class="{ drafted: props.item.drafted, eliminated: props.item.eliminated }">{{ props.item.seed }}</td>
            <td class="text-xs-center hidden-xs-only" v-bind:class="{ drafted: props.item.drafted, eliminated: props.item.eliminated }">{{ props.item.region }}</td>
            <td class="text-xs-center hidden-xs-only" v-bind:class="{ eliminated: props.item.eliminated, drafted: props.item.drafted }">{{ props.item.scoring_average }}</td>
            <!-- <td class="text-xs-center hidden-xs-only" v-bind:class="{ eliminated: props.item.eliminated, drafted: props.item.drafted }">{{ props.item.projected_score }}</td> -->

            <td class="text-xs-center hidden-xs-only">{{ props.item.round1 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round2 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round3 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round4 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round5 }}</td>
            <td class="text-xs-center">{{ props.item.round6 }}</td>
            <td class="text-xs-center">{{ props.item.total }}</td>
          </template>

          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
        </v-card>
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
        search: '',
        score_filter: true,
        draft_filter: 0,
        mobile: true,
        loading: true,
        headers: [
          { text: 'Owner', align: 'left', value: 'owner'},
          { text: 'Player', value: 'full_name' },
          { text: 'School', value: 'school'},
          { text: 'Seed', value: 'seed', class: 'hidden-xs-only' },
          { text: 'Region', value: 'region', class: 'hidden-xs-only' },
          { text: 'Scoring', value: 'scoring_average', class: 'hidden-xs-only'},
          // { text: 'Projection', value: 'projected_score', class: 'hidden-xs-only'}
          { text: 'Round 1', value: 'round1', class: 'hidden-xs-only'},
          { text: 'Round 2', value: 'round2', class: 'hidden-xs-only'},
          { text: 'Sweet Sixteen', value: 'round3', class: 'hidden-xs-only'},
          { text: 'Elite Eight', value: 'round4', class: 'hidden-xs-only'},
          { text: 'Final Four', value: 'round5', class: 'hidden-xs-only'},
          { text: 'Championship', value: 'round6'},
          { text: 'Total', value: 'total'}
        ],
        items: []
      }
    },
    created: function () {
    },
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
      this.loadPlayerboard()
      this.interval1 = setInterval(function(){
        this.loadPlayerboard()
      }.bind(this), 180000);
    },
    methods: {
      loadPlayerboard(){
        fetch(`${process.env.VUE_APP_BACKEND_URL}/playerboard`, defaultOptions)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.items = [];
            data.forEach((element) => {
              var owner_concat = '';
              var eliminated_player = false;
              var drafted = false;
              switch (this.draft_filter) {
                case 1:
                  if(!element.name) { return }
                  break;
                case 2:
                  if(element.name) { return }
                  break;
              }
              if (this.score_filter){
                if (element.scoring_average < 10.0){ return }
              }
              if (element.name) {
                owner_concat = `${element.display_name} (${element.name})`;
                drafted = true;
              }
              if (element.eliminated > 0 ){
                eliminated_player = true;
              }
              var entry = {
                value: false,
                name: owner_concat,
                id: element.id,
                drafted: drafted,
                full_name: element.full_name,
                espn_id: element.espn_id,
                scoring_average: element.scoring_average,
                projected_score: element.projected_score,
                school: `${element.school} ${element.mascot}`,
                seed: element.seed,
                region: element.region,
                jersey: element.jersey,
                draft_pick: element.draft_pick,
                drafted_round: element.drafted_round,
                position: element.position,
                class: element.class,
                eliminated: eliminated_player,
                round1: element.round1,
                round2: element.round2,
                round3: element.round3,
                round4: element.round4,
                round5: element.round5,
                round6: element.round6,
                total: element.total,
              }
              this.items.push(entry);
              this.loading = false;
            })
          })
      },
      score_filter_toggle(){
        this.score_filter= !this.score_filter
        this.loadPlayerboard()
      },
      draft_filter_toggle(){
        if(this.draft_filter === 2){
          this.draft_filter = 0;
        } else {
          this.draft_filter += 1;
        }
        this.loadPlayerboard()
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
.drafted {
  background-color: lightyellow;
}
</style>
