<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
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
        <div class="text-xs-center pt-2">
          <v-btn v-if="!draft_set" color="primary" @click.native="loadDraft">Randomize</v-btn>
          <v-btn v-if="!draft_set" color="primary" @click.native="setDraft">Set Draft Order</v-btn>
          <v-btn v-if="draft_set" color="primary" @click.native="resetDraft">Clear Draft Order</v-btn>
        </div>
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
        items: []
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
              this.loading = false;
            })
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
</style>
