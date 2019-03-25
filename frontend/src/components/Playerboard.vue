<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <h1>Player Data</h1>
        <!-- <v-btn color="primary" @click.native="testSomething">Load Data</v-btn> -->
      <div>
        <vue-good-table :columns="columns" :rows="playerDataRows"  @on-row-click="onRowClick" 
          :search-options="{enabled: true, trigger: 'enter',placeholder: 'What are you looking for?'}" 
          :pagination-options="{enabled:true, mode:'pages'}" theme="black-rhino"
        />
      </div>
        
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
  import { VueGoodTable } from 'vue-good-table'
  import 'vue-good-table/dist/vue-good-table.css'
  
  import { mapGetters, mapActions } from 'vuex'

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
    components: {
      VueGoodTable
    },
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
          // { text: 'Sweet Sixteen', value: 'round3', class: 'hidden-xs-only'},
          // { text: 'Elite Eight', value: 'round4', class: 'hidden-xs-only'},
          // { text: 'Final Four', value: 'round5', class: 'hidden-xs-only'},
          // { text: 'Championship', value: 'round6'},
          { text: 'Total', value: 'total'}
        ],
        items: [],

        columns: [
          {
            label: 'Owner',
            field: 'owner'
          },
          {
            label: 'Player',
            field: 'full_name'
          },
          {
            label: 'School',
            field: 'school'
          },
          {
            label: 'Seed',
            field: 'seed',
            type: 'number',
          },
          {
            label: 'Region',
            field: 'region'
          },
          {
            label: 'Avg. PPG',
            field: 'scoring_average',
            type: 'number',
          },
        ],
        playerDataRows: []
      }
    },
    created: function () {
      this.loadPlayerStats()
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
      // this.loadPlayerboard()
      this.interval1 = setInterval(function(){
        // this.loadPlayerboard()
      }.bind(this), 180000);
    },
    methods: {
      ...mapActions([
        'sendDraftSelectionPost'
      ]),
      onRowClick (params) {
        this.sendDraftSelectionPost(params.row)
      },
      loadPlayerStats() {
        fetch(`http://localhost:8080/playerboard`, defaultOptions)
          .then((response) => {
            return response.json()
            .then((playerInfo) => {
              playerInfo.forEach(player => {
                this.playerDataRows.push(player)
              })
            })
          })
      },
      loadPlayerboard(){
        fetch(`http://localhost:8080/playerboard`, defaultOptions)
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

<style>
.vgt-inner-wrap {
  width: 70em;
}
</style>
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
