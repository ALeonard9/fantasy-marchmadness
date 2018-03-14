let request = require('request');
let mysql_lib = require('./mysql');

function slack(user, text){
    return new Promise(async function (resolve, reject) {
        var slack_message = {
          "username": "Fantasy March Madness",
          "text": "*Scoreboard*\n"
        };
        var response = await mysql_lib.mysql_query("Scoreboard", "SELECT * FROM mm.scoreboard")
        for (var i = 0, length = response.length; i < length; i++) {
            var addition = `${response[i]["display_name"]} (${response[i]["name"]}): ${response[i]["total"]}\n`
            slack_message.text = slack_message.text.concat(addition)
            if (i === response.length - 1) {
                console.log(JSON.stringify(slack_message))
                resolve(slack_message);
            }
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
