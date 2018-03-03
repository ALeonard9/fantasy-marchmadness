let request = require('request');
let cheerio = require('cheerio');
let mysql_lib = require('./mysql')

function scrape(game_param) {
  return new Promise(async function(resolve, reject) {
    var games = [];
    var round = '';
    var query_string = '';
    if (game_param) {
      var response = await mysql_lib.mysql_query("Games", `SELECT home_team_id, away_team_id, g.espn_id as game_espn_id, round, p.id as player_id, full_name, p.espn_id as player_espn_id, p.team_id FROM mm.game g, mm.player p WHERE active = 1 AND (p.team_id = home_team_id OR p.team_id = away_team_id) AND g.espn_id = ${game_param}`)
    } else {
      var response = await mysql_lib.mysql_query("Games", "SELECT home_team_id, away_team_id, g.espn_id as game_espn_id, round, p.id as player_id, full_name, p.espn_id as player_espn_id, p.team_id FROM mm.game g, mm.player p WHERE active = 1 AND (p.team_id = home_team_id OR p.team_id = away_team_id)")
    }
    if (response.length < 1) {
      Promise.reject(new Error("No active games.")).then(resolved, rejected);
      return;
    }
    let p1 = new Promise((resolve2, reject2) => {
        for (var i = 0, length = response.length; i < length; i++) {
          row = response[i];
          round = row['round']
          if (!games.includes(row['game_espn_id'])) {
            games.push(row['game_espn_id']);
          }

          if (i === response.length - 1) {
            resolve2([games, round]);
          }
        }
      })
      .then(async ([games, round]) => {
        let p2 = new Promise((resolve3, reject3) => {
            for (var i = 0, length = games.length; i < length; i++) {
              check_gameover(games[i]);
              for (var x = 0, length = response.length; x < length; x++) {
                if (response[x]['game_espn_id'] == games[i]) {
                  game_scrape(games[i], round, response[x]['player_espn_id']);
                }
              }
              if (i === games.length - 1) {
                resolve3();
              }
            }
          })
          .then(() => {
            resolve(response);
          })
      })
  })
}

function game_scrape(game_id, round, player_id) {
  let p4 = new Promise((resolve4, reject4) => {
    request(`http://www.espn.com/mens-college-basketball/boxscore?gameId=${game_id}`, function(error, resp, html) {
      let $ = cheerio.load(html);
      $(`a[href*='${player_id}']`).each(async function(index, element) {
        var response = await mysql_lib.mysql_query(`Player ${player_id} round ${round} score ${$(element).parent().parent().find('.pts').text()} update`, "UPDATE `mm`.`player` SET `round" + round + "`='" + $(element).parent().parent().find('.pts').text() + "' WHERE `espn_id`='" + player_id + "';")
        resolve4();
      })
    })
  })
  return (p4)
}



function check_gameover(game_id) {
  let p5 = new Promise((resolve5, reject5) => {
    request(`http://www.espn.com/mens-college-basketball/boxscore?gameId=${game_id}`, function(error, resp, html) {
      let $ = cheerio.load(html);
      $('.status-detail').each(async function(index, element) {
        if ($(element).text().includes('Final')) {
          var loser = '';
          // console.log($('.team.away').find('.score').text(),$('.team.away').find('.long-name').text(),$('.team.away').find('.short-name').text(),$('.team.home').find('.score').text(),$('.team.home').find('.long-name').text(),$('.team.home').find('.short-name').text())
          if ($('.team.away').find('.score').text() > $('.team.home').find('.score').text()) {
            loser = 'home';
          } else {
            loser = 'away';
          }
          var response = await mysql_lib.mysql_query(`Updating game ${game_id} to not active and eliminating `, "UPDATE `mm`.`team` SET `eliminated`='1' WHERE `school`='" + $(`.team.${loser}`).find('.long-name').text() + "';UPDATE `mm`.`game` SET `active`='0' WHERE `espn_id`='" + game_id + "';")
          resolve5()
        }
      })
    })
  })
  return (p5)
}



function scrape_players() {
  return new Promise(async function(resolve, reject) {
    var response = await mysql_lib.mysql_query("Team espn_ids", `SELECT espn_id FROM mm.team`)
    for (var i = 0, length = response.length; i < length; i++) {
      add_players(response[i])
    }
  })
}



function add_players(team_id) {
  new Promise((resolve, reject) => {
    request(`http://www.espn.com/mens-college-basketball/team/stats/_/id/${team_id}`, function(error, resp, html) {
      let $ = cheerio.load(html);
      // PICK UP HERE MONDAY TODO
    })
  })
}



function rejected(result) {
  console.log(result);
}
function resolved(result) {
  console.log('Resolved');
}

// request('http://www.espn.com/mens-college-basketball/boxscore?gameId=401020693', function(error, response, html){
// let $ = cheerio.load(html);
// $('.team.away').each(function(index, element){
// console.log($(element).find('.long-name').text());
// console.log($(element).find('.short-name').text());
// console.log($(element).find('.score').text());
// })
// $('.team.home').each(function(index, element){
// console.log($(element).find('.long-name').text());
// console.log($(element).find('.short-name').text());
// console.log($(element).find('.score').text());
// })
// $('.col.column-one.gamepackage-away-wrap').each(function(index, element){
// console.log($(element).find("img").prop('src'));
// })
// $('.col.column-one.gamepackage-home-wrap').each(function(index, element){
// console.log($(element).find("img").prop('src'));
// })
// $("a[href*='3922040']").each(function(index, element){
// console.log($(element).parent().parent().find('.pts').text());
// })

// if final, set game to done, eliminate losing team
// $('.status-detail').each(function(index, element){
// console.log($(element).text());
// })
// })

module.exports = {
  scrape,
  scrape_players
};
