<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <h1>Leaderboard</h1>
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :pagination.sync="pagination"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.name }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.remaining }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round1 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round2 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round3 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round4 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round5 }}</td>
            <td class="text-xs-center hidden-xs-only">{{ props.item.round6 }}</td>
            <td class="text-xs-center">{{ props.item.total }}</td>
          </template>
        </v-data-table>
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
        pagination: {'sortBy': 'total', 'descending': true, 'rowsPerPage': -1},
        headers: [
          { text: 'Owner', sortable: false, align: 'left', value: 'owner'},
          { text: 'Players Remaining', value: 'remaining', class: 'hidden-xs-only' },
          { text: 'First round', value: 'round1', class: 'hidden-xs-only' },
          { text: 'Second round', value: 'round2', class: 'hidden-xs-only' },
          { text: 'Sweet Sixteen', value: 'round3', class: 'hidden-xs-only' },
          { text: 'Elite Eight', value: 'round4', class: 'hidden-xs-only' },
          { text: 'Final Four', value: 'round5', class: 'hidden-xs-only' },
          { text: 'Championship', value: 'round6', class: 'hidden-xs-only' },
          { text: 'Total', value: 'total' }
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
      this.loadLeaderboard()
      this.timer = setInterval(this.loadLeaderboard(), 180000)
    },
    methods: {
      loadLeaderboard(){
        fetch(`${process.env.backend_url}/scoreboard`, defaultOptions)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.items = [];
            data.forEach((element) => {
              var entry = {
                value: false,
                name: `${element.display_name} (${element.name})`,
                remaining: element.players_remaining,
                round1: element.round1,
                round2: element.round2,
                round3: element.round3,
                round4: element.round4,
                round5: element.round5,
                round6: element.round6,
                total: element.total
              }
              this.items.push(entry);
              this.loading = false;
            })
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
</style>
