'use strict';

const request = require('request');
const cheerio = require('cheerio');
const mysql_lib = require('./mysql');

function scrape(game_param) {
  return new Promise(async function(resolve, reject) {
    var games = [];
    var round = '';
    var response = '';
    if (game_param){
      response = await mysql_lib.mysql_query('Games', `SELECT home_team_id, away_team_id, g.espn_id as game_espn_id, round, p.id as player_id, full_name, p.espn_id as player_espn_id, p.team_id  FROM mm.game g, mm.player p WHERE active = 1 AND (p.team_id = (select id from mm.team where espn_id = home_team_id) OR p.team_id = (select id from mm.team where espn_id = away_team_id)) AND g.espn_id = ${game_param} AND p.owner_id IS NOT NULL`);
    } else {
      response = await mysql_lib.mysql_query('Games', 'SELECT home_team_id, away_team_id, g.espn_id as game_espn_id, round, p.id as player_id, full_name, p.espn_id as player_espn_id, p.team_id  FROM mm.game g, mm.player p WHERE active = 1 AND (p.team_id = (select id from mm.team where espn_id = home_team_id) OR p.team_id = (select id from mm.team where espn_id = away_team_id)) AND p.owner_id IS NOT NULL');
    }
    if (response.length < 1) {
      Promise.reject(new Error('No active games.')).then(resolved, rejected);
      return;
    }
    new Promise((resolve2, reject2) => {
      for (var i = 0, length = response.length; i < length; i++) {
        var row = response[i];
        round = row['round'];
        if (!games.includes(row['game_espn_id'])) {
          games.push(row['game_espn_id']);
        }
        if (i === response.length - 1) {
          resolve2([games, round]);
        }

      }
    })
      .then(async([games, round]) => {
        new Promise((resolve3, reject3) => {
          for (var i = 0, length = games.length; i < length; i++) {
            check_gameover(games[i]);
            for (var x = 0, length2 = response.length; x < length2; x++) {
              if (response[x]['game_espn_id'] === games[i]) {
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
          });

      });
  });
}

function game_scrape(game_id, round, player_id) {
  let p4 = new Promise((resolve4, reject4) => {
    request(`http://www.espn.com/mens-college-basketball/boxscore?gameId=${game_id}`, function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      let $ = cheerio.load(html);
      $(`a[href*='${player_id}']`).each(async function(index, element) {
        await mysql_lib.mysql_query(`Player ${player_id} round ${round} score ${$(element).parent().parent().find('.pts').text()} update`, 'UPDATE `mm`.`player` SET `round' + round + "`='" + $(element).parent().parent().find('.pts').text() + "' WHERE `espn_id`='" + player_id + "';");
        resolve4();
      });
    });
  });
  return (p4);
}

function update_player_draft_position(player_param) {
  return new Promise(async function(resolve, reject) {
    var response = '';
    if (player_param){
      response = await mysql_lib.mysql_query(`Player ${player_param} query for draft`, `SELECT p.id, p.drafted_round, o.draft_position, (select count(DISTINCT owner_id) from mm.player) as num_of_owners FROM mm.player p, mm.owner o where p.owner_id = o.id and p.owner_id is not null and p.drafted_round is not null and o.draft_position is not null AND p.id = ${player_param};`);
    } else {
      response = await mysql_lib.mysql_query('All players query for draft', 'SELECT p.id, p.drafted_round, o.draft_position, (select count(DISTINCT owner_id) from mm.player) as num_of_owners FROM mm.player p, mm.owner o where p.owner_id = o.id and p.owner_id is not null and p.drafted_round is not null and o.draft_position is not null;');
    }
    if (response.length < 1) {
      Promise.reject(new Error('No players drafted.')).then(resolved, rejected);
      return;
    }
    let p1 = new Promise((resolve2, reject2) => {
      for (var i = 0, length = response.length; i < length; i++) {
        var row = response[i];
        update_player_draft_position_single(row['id'], row['drafted_round'], row['draft_position'], row['num_of_owners']);
        if (i === length - 1) {
          resolve2();
        }
      }
    });
    resolve();
    return (p1);
  });
}

function update_player_draft_position_single(player_id, drafted_round, draft_position, num_of_owners) {
  let p4 = new Promise((resolve4, reject4) => {
    let draft_pick = '';
    // If oddeven is 0, it is even. If 1, it is odd. Used for snake draft to determine position.
    let oddeven = drafted_round % 2;
    let adder = '';
    if (oddeven === 1){
      adder = draft_position;
    } else if (oddeven === 0) {
      adder = num_of_owners - draft_position + 1;
    } else {
      reject4('Drafted round not picking up.');
    }
    draft_pick = ((drafted_round - 1) * num_of_owners) + adder;
    mysql_lib.mysql_query(`Updating player ${player_id} to draft_pick ${draft_pick} `, `UPDATE mm.player SET draft_pick = '${draft_pick}' WHERE (id = '${player_id}');`);
    resolve4();
  });
  return (p4);
}

function check_gameover(game_id) {
  let p5 = new Promise((resolve5, reject5) => {
    request(`http://www.espn.com/mens-college-basketball/boxscore?gameId=${game_id}`, function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      let $ = cheerio.load(html);
      $('.status-detail').each(async function(index, element) {
        if ($(element).text().includes('Final')) {
          var loser = '';
          //    console.log($('.team.away').find('.score').text(),$('.team.away').find('.long-name').text(),$('.team.away').find('.short-name').text(),$('.team.home').find('.score').text(),$('.team.home').find('.long-name').text(),$('.team.home').find('.short-name').text())
          if ($('.team.away').find('.score').text() > $('.team.home').find('.score').text()) {
            loser = 'home';
          } else {
            loser = 'away';
          }
          await mysql_lib.mysql_query(`Updating game ${game_id} to not active and eliminating `, "UPDATE `mm`.`team` SET `eliminated`='1' WHERE `school`='" + $(`.team.${loser}`).find('.long-name').text() + "';UPDATE `mm`.`game` SET `active`='0' WHERE `espn_id`='" + game_id + "';");
          resolve5();
        }
      });
    });
  });
  return (p5);
}

function scrape_players(team_id){
  return new Promise(async function(resolve, reject) {
    var response = '';
    if (team_id){
      response = await mysql_lib.mysql_query('Team espn_ids', `SELECT espn_id FROM mm.team WHERE id = ${team_id}`);
    } else {
      response = await mysql_lib.mysql_query('Team espn_ids', 'SELECT espn_id FROM mm.team');
    }
    for (var i = 0, length = response.length; i < length; i++) {
      add_players(response[i]['espn_id']);
      resolve();
    }
  });
}
function add_projections(player_id){
  return new Promise(async function(resolve, reject) {
    var response = '';
    if (player_id){
      response = await mysql_lib.mysql_query('Team espn_ids', `SELECT p.id, p.scoring_average, t.seed FROM mm.player p, mm.team t WHERE p.team_id = t.id AND p.id = ${player_id}`);
    } else {
      response = await mysql_lib.mysql_query('Team espn_ids', 'SELECT p.id, p.scoring_average, t.seed FROM mm.player p, mm.team t WHERE p.team_id = t.id and projected_score IS NULL');
    }
    for (var i = 0, length = response.length; i < length; i++) {
      add_player_projections(response[i]['id'], response[i]['scoring_average'], response[i]['seed']);
      resolve();
    }
  });
}

function add_player_projections(id, avg, seed){
  var avg_games = '0';
  var projection = '0.0';
  switch (true) {
    case seed === 1:
      avg_games = '5';
      break;
    case seed === 2:
      avg_games = '4.5';
      break;
    case seed === 3:
      avg_games = '4';
      break;
    case seed === 4:
      avg_games = '2.8';
      break;
    case seed === 5:
      avg_games = '2.5';
      break;
    case seed === 6:
      avg_games = '2.3';
      break;
    case seed === 7:
      avg_games = '2';
      break;
    case seed === 8:
      avg_games = '1.7';
      break;
    case seed === 9:
      avg_games = '1.5';
      break;
    case seed === 10:
      avg_games = '1.4';
      break;
    case seed === 11:
      avg_games = '1.3';
      break;
    case seed === 12:
      avg_games = '1.25';
      break;
    case seed === 13:
      avg_games = '1.2';
      break;
    case seed === 14:
      avg_games = '1.1';
      break;
    case seed === 15:
      avg_games = '1';
      break;
    case seed === 16:
      avg_games = '1';
      break;
  }
  projection = avg_games * avg;
  var query_string = "UPDATE `mm`.`player` SET `projected_score` = '" + projection + "' WHERE (`id` = '" + id + "')";
  mysql_lib.mysql_query(`Updating player ${id} to have projection ${projection} `, query_string);
}

function update_player_info(player_id) {
  return new Promise(async function(resolve, reject) {
    var espn_player_id = [];
    var response = '';
    if (player_id){
      response = await mysql_lib.mysql_query('Players', `SELECT espn_id FROM mm.player WHERE espn_id = ${player_id}`);
    } else {
      response = await mysql_lib.mysql_query('Players', 'SELECT espn_id FROM mm.player WHERE jersey IS NULL');
    }
    if (response.length < 1) {
      Promise.reject(new Error('No players.')).then(resolved, rejected);
      return;
    }
    new Promise((resolve2, reject2) => {
      for (var i = 0, length = response.length; i < length; i++) {
        var row = response[i];
        if (!espn_player_id.includes(row['espn_id'])) {
          espn_player_id.push(row['espn_id']);
        }
        if (i === response.length - 1) {
          resolve2([espn_player_id]);
        }

      }
    })
      .then(async([espn_player_id]) => {
        new Promise((resolve3, reject3) => {
          for (var i = 0, length = espn_player_id.length; i < length; i++) {

            scrape_player_info(espn_player_id[i]);

            if (i === espn_player_id.length - 1) {
              resolve3();
            }
          }
        })
          .then(() => {
            resolve(response);
          });

      });
  });
}

function scrape_player_info(espn_player_id){
  Promise((resolve, reject) => {
    request(`http://www.espn.com/mens-college-basketball/player/_/id/${espn_player_id}`, function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      if (html) {
        let $ = cheerio.load(html);
        var info = $('.general-info').eq(0).text().split(' ');
        var jersey = info[0].substr(1, info[0].length);


        // if (isNaN(jersey) || !jersey || jersey.includes("'")){
        //   console.log("CAUGHT IT1")
        //   var query_string = `DELETE FROM mm.player WHERE espn_id = '${espn_player_id}';`;
        //   mysql_lib.mysql_query(`Player ${espn_player_id} deleted`, query_string)
        //   resolve();
        // }
        var position = $('.general-info').children('li').first().text().split(' ').slice(-1)[0];
        var class1 = $('.general-info').children('li:nth-child(2)').text();

        // if (isNaN(class1) || !class1 || class1.includes("'")){
        //   console.log("CAUGHT IT2")
        //   var query_string = `DELETE FROM mm.player WHERE espn_id = '${espn_player_id}';`;
        //   mysql_lib.mysql_query(`Player ${espn_player_id} deleted`, query_string)
        //   resolve();
        // }
        var query_string = `UPDATE mm.player SET jersey = '${jersey}', position = '${position}', class = '${class1}' WHERE espn_id = '${espn_player_id}';`;
        mysql_lib.mysql_query(`Player ${espn_player_id} info updated`, query_string);
        resolve();
      } else {
        // This is really bad, but works. circular reference. Unsure why they fall out the first time.
        console.log("DIDN'T WORK" + espn_player_id);
        scrape_player_info(espn_player_id);
      }

    });
  });
}

function scrape_teams_before(){
  Promise((resolve, reject) => {
    request('http://www.espn.com/mens-college-basketball/bracketology', function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      let $ = cheerio.load(html);
      $('.region').each(async function(index, element){
        var preregion = $(element).children('h3,b').text();
        var region = preregion.substr(0, preregion.indexOf('(') - 1);
        $(element).find('a').each(async function(index2, element2){
          var seed = $(element2).siblings('span.rank').text();
          if (seed.length > 2){
            seed = $(element2).siblings('span.rank').text().substring(0, 2);
          }
          var espn_id = $(element2).attr('href').split('/').slice(-2)[0];
          var team_name = $(element2).text();
          var query_string = "INSERT INTO `mm`.`team` (`school`, `espn_id`, `seed`, `region`) VALUES (?, '" + espn_id + "', '" + seed + "', '" + region + "');";
          await mysql_lib.mysql_query_param(`Team ${team_name} added`, query_string, [team_name]);
          scrape_team_mascots(espn_id);
          resolve();
        });
      });

    });
  });
}

function scrape_teams(){
  Promise((resolve, reject) => {
    request('http://www.espn.com/mens-college-basketball/tournament/bracket', function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      let $ = cheerio.load(html);
      $('.region').each(async function(index, element){
        var region = $(element).children('.regtitle').text();
        $(element).find('dl').each(async function(index2, element2){
          var seed = $(element2).text().split(' ').slice(0)[0];
          var x = 0;
          $(element2).find('a').each(async function(index3, element3){
            var team_name = $(element3).attr('title');
            if (team_name === undefined){
              team_name = $(element3).text();
            }
            var raw_url = $(element3).attr('href').split('/');
            var espn_id = raw_url[ raw_url.length - 2 ];
            if (x === 1) {
              seed = 17 - seed;
            }
            x = x + 1;
            var query_string = "INSERT INTO `mm`.`team` (`school`, `espn_id`, `region`, `seed`) VALUES (?, '" + espn_id + "', '" + region + "', '" + seed + "');";
            await mysql_lib.mysql_query_param(`Team ${team_name} added`, query_string, [team_name]);
            scrape_team_mascots(espn_id);
            resolve();
          });
        });
      });

    });
  });
}

function scrape_team_mascots(team_espn_id){

  Promise((resolve, reject) => {
    var options = {
      url: `http://www.espn.com/mens-college-basketball/team/_/id/${team_espn_id}`,
      timeout: 8000,
      pool: {
        maxSockets: Infinity,
      },
    };
    request(options, async function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      if (html){
        let $ = cheerio.load(html);
        var team_name = $('span.ClubhouseHeader__Location').text();
        var mascot = $('span.ClubhouseHeader__DisplayName').text();
        if (mascot === null){
          console.log(html);
        } else {
          var query_string = "UPDATE `mm`.`team` SET `school`= ?, `mascot`= ? WHERE `espn_id`='" + team_espn_id + "';";
          await mysql_lib.mysql_query_param(`Team ${team_name} mascot ${mascot} updated`, query_string, [team_name, mascot]);
        }
      } else {

        // This is really bad, but works. circular reference. Unsure why they fall out the first time.
        console.log("DIDN'T WORK" + team_espn_id);
        scrape_team_mascots(team_espn_id);
      }
      resolve();
    });
  });
}

function add_players(team_id){
  Promise((resolve, reject) => {
    request(`http://www.espn.com/mens-college-basketball/team/stats/_/id/${team_id}`, function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      let $ = cheerio.load(html);
      var min_scoring_avg = 0.0;
      var number_of_players = $('table.Table2__table__wrapper tbody tr td table tbody').first().find('tr').length - 1;
      $('table.Table2__table__wrapper tbody tr td table tbody').first().find('tr').each(async function(index, element) {
        if (index === number_of_players) {
          resolve();
        } else {
          // Cheerio uses same syntax as jquery if you need to test in browser with dev tools.
          var data_idx = $(element).attr('data-idx');
          var full_name = $(element).find('td span a').text();
          var espn_id = $(element).find('td span a').attr('href').split('/').slice(-1)[0];
          var scoring_avg = $(`tr[data-idx='${data_idx}']`).eq(1).find('td span').eq(2).text();
          if (scoring_avg > min_scoring_avg){
            await mysql_lib.mysql_query_param(`Player ${full_name} added`, "INSERT INTO `mm`.`player` (`full_name`, `espn_id`, `team_id`, `scoring_average`) VALUES (?, '" + espn_id + "', (SELECT t.id FROM mm.team t WHERE t.espn_id = '" + team_id + "'), " + scoring_avg + ');', [full_name]);
            resolve();
          } else {
            resolve();
          }
        }
      });

    });
  });
}

function scrape_schedule(date_var){
  Promise((resolve, reject) => {
    request(`http://www.espn.com/mens-college-basketball/schedule/_/date/${date_var}`, function(error, resp, html) {
      if (error) {
        console.log(error.stack);
      }
      let $ = cheerio.load(html);
      $('tbody').first().find('tr').each(async function(index, element){
        var visitor_id = $(element).first().find('a').attr('href').split('/').slice(-2)[0];
        var home_id = $(element).find('td:nth-child(2)').find('a').attr('href').split('/').slice(-2)[0];
        var espn_id = $(element).find('td:nth-child(3)').find('a').attr('href').split('=').slice(-1)[0];
        var round = '';
        switch (true) {
          case date_var < 20190323:
            round = '1';
            break;
          case date_var >= 20190323 && date_var <= 20190324:
            round = '2';
            break;
          case date_var >= 20190328 && date_var <= 20190329:
            round = '3';
            break;
          case date_var >= 20190330 && date_var <= 20190331:
            round = '4';
            break;
          case date_var === 20190406:
            round = '5';
            break;
          case date_var === 20190408:
            round = '6';
            break;
        }

        var query_string = "INSERT INTO `mm`.`game` (`home_team_id`, `away_team_id`, `espn_id`, `round`, `active`) VALUES ('" + home_id + "', '" + visitor_id + "', '" + espn_id + "', '" + round + "', '1');";
        await mysql_lib.mysql_query(`Game ${espn_id} added for round ${round}`, query_string);
        resolve();
      });

    });
  });
}

function rejected(result) {
  console.log(result);
}
function resolved(result) {
  console.log('Resolved');
}

module.exports = {
  scrape,
  scrape_players,
  scrape_teams,
  scrape_team_mascots,
  scrape_teams_before,
  add_players,
  update_player_info,
  scrape_schedule,
  add_projections,
  update_player_draft_position,
};
