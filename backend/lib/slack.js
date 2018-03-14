let request = require('request');
let mysql_lib = require('./mysql');

function slack(user, text){
    console.log(user, text)
    var slack_message = {
      "username": "Fantasy March Madness",
      "text": "*Scoreboard*\n"
    };
    return new Promise(async function (resolve, reject) {
        var response = await mysql_lib.mysql_query("Scoreboard", "SELECT * FROM mm.scoreboard")
        for (var i = 0, length = response.length; i < length; i++) {
            slack_message.concat(`${response[i]["display_name"]} (${response[i]["name"]}): ${response[i]["total"]}\n`)
        }
    })
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
