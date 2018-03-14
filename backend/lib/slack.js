let request = require('request');
let mysql_lib = require('./mysql');

function slack(user, text){
    console.log(user, text)
    return {
      "text": "Got it"
    }
    // return new Promise(async function (resolve, reject) {
    //     var response = await mysql_lib.mysql_query("Team espn_ids", `SELECT espn_id FROM mm.team`)
    //     for (var i = 0, length = response.length; i < length; i++) {
    //         add_players(response[i]['espn_id'])
    //     }
    // })
}


function rejected(result) {
    console.log(result);
}
function resolved(result) {
    console.log('Resolved');
}

module.exports = {
    slack
};
