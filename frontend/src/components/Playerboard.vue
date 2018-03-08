<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <h1>Player Data</h1>

          </br>
          <v-card>
          <v-card-title>
            <div class="text-xs-center pt-2">
              <v-btn v-if="!score_filter" color="primary" @click.native="score_filter_toggle">All Players</v-btn>
              <v-btn v-if="score_filter" color="primary" @click.native="score_filter_toggle">10+ PPG Scorers</v-btn>
              <v-btn v-if="draft_filter === 0" color="primary" @click.native="draft_filter_toggle">All Players</v-btn>
              <v-btn v-if="draft_filter === 1" color="primary" @click.native="draft_filter_toggle">Drafted</v-btn>
              <v-btn v-if="draft_filter === 2" color="primary" @click.native="draft_filter_toggle">Undrafted</v-btn>
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
            <td>{{ props.item.name }}</td>
            <td class="text-xs-left">{{ props.item.full_name }}</td>
            <td class="text-xs-left dark">{{ props.item.school }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.seed }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.region }}</td>
            <td class="text-xs-center">{{ props.item.scoring_average }}</td>
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
          { text: 'Scoring', value: 'scoring_average'}
        ],
        items: []
      }
    },
    created: function () {},
    mounted: function () {
      if(window.innerWidth < 1100){
        this.mobile = true;
        console.log('Mobile')
      } else {
        this.mobile = false;
        console.log('Desktop')
      }
      this.$nextTick(function() {
        window.addEventListener('resize', function(e) {
          if(window.innerWidth < 1100){
            this.mobile = true;
            console.log('Mobile')
          } else {
            this.mobile = false;
            console.log('Desktop')
          }
        });
      })
      this.loadPlayerboard()
    },
    methods: {
      loadPlayerboard(){
        fetch(`${process.env.backend_url}/playerboard`, defaultOptions)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.items = [];
            data.forEach((element) => {
              var owner_concat = '';
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
              }
              var entry = {
                value: false,
                name: owner_concat,
                full_name: element.full_name,
                espn_id: element.espn_id,
                scoring_average: element.scoring_average,
                school: `${element.school} ${element.mascot}`,
                seed: element.seed,
                region: element.region,
                eliminated: element.eliminated
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
</style>
