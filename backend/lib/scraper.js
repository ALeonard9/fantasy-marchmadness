let request = require('request');
let cheerio = require('cheerio');
let mysql_lib = require('./mysql');

function scrape(game_param) {
    return new Promise(async function (resolve, reject) {
        var games = [];
        var round = '';
        var query_string = '';
        if(game_param){
            var response = await mysql_lib.mysql_query("Games", `SELECT home_team_id, away_team_id, g.espn_id as game_espn_id, round, p.id as player_id, full_name, p.espn_id as player_espn_id, p.team_id  FROM mm.game g, mm.player p WHERE active = 1 AND (p.team_id = home_team_id OR p.team_id = away_team_id) AND g.espn_id = ${game_param} AND p.owner_id IS NOT NULL`)
        } else {
            var response = await mysql_lib.mysql_query("Games", "SELECT home_team_id, away_team_id, g.espn_id as game_espn_id, round, p.id as player_id, full_name, p.espn_id as player_espn_id, p.team_id  FROM mm.game g, mm.player p WHERE active = 1 AND (p.team_id = home_team_id OR p.team_id = away_team_id) AND p.owner_id IS NOT NULL")
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
        request(`http://www.espn.com/mens-college-basketball/boxscore?gameId=${game_id}`, function (error, resp, html) {
            let $ = cheerio.load(html);
            $(`a[href*='${player_id}']`).each(async function (index, element) {
                var response = await mysql_lib.mysql_query(`Player ${player_id} round ${round} score ${$(element).parent().parent().find('.pts').text()} update`, "UPDATE `mm`.`player` SET `round" + round + "`='" + $(element).parent().parent().find('.pts').text() + "' WHERE `espn_id`='" + player_id + "';")
                resolve4();
            })
        })
    })
    return (p4)
}

function check_gameover(game_id) {
    let p5 = new Promise((resolve5, reject5) => {
        request(`http://www.espn.com/mens-college-basketball/boxscore?gameId=${game_id}`, function (error, resp, html) {
            let $ = cheerio.load(html);
            $('.status-detail').each(async function (index, element) {
                if ($(element).text().includes('Final')) {
                    var loser = '';
                    //    console.log($('.team.away').find('.score').text(),$('.team.away').find('.long-name').text(),$('.team.away').find('.short-name').text(),$('.team.home').find('.score').text(),$('.team.home').find('.long-name').text(),$('.team.home').find('.short-name').text())
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

function scrape_players(){
    return new Promise(async function (resolve, reject) {
        var response = await mysql_lib.mysql_query("Team espn_ids", `SELECT espn_id FROM mm.team`)
        for (var i = 0, length = response.length; i < length; i++) {
            add_players(response[i]['espn_id'])
        }
    })
}

function scrape_teams_before(){
    new Promise((resolve, reject) => {
        request('http://www.espn.com/mens-college-basketball/bracketology', function (error, resp, html) {
            let $ = cheerio.load(html);
            $('.region').each(async function (index, element){
                var region = $(element).children('h3,b').text();
                $(element).find('a').each(async function (index2, element2){
                    var rank = $(element2).siblings('span.rank').text();
                    if (rank.length > 2){
                        rank = $(element2).siblings('span.rank').text().substring(0,2);
                    }
                    var query_string = "INSERT INTO `mm`.`team` (`school`, `espn_id`, `seed`, `region`) VALUES (?, '" + $(element2).attr('href').substring( $(element2).attr('href').lastIndexOf('/') + 1) + "', '" + rank + "', '" + region + "');";
                    var response = await mysql_lib.mysql_query_param(`Team ${$(element2).text()} added`, query_string, [$(element2).text()])
                    scrape_team_mascots($(element2).attr('href').substring( $(element2).attr('href').lastIndexOf('/') + 1));
                    resolve();
                })
            })

        })
    })
}

function scrape_teams(){
    new Promise((resolve, reject) => {
        request('http://www.espn.com/mens-college-basketball/tournament/bracket', function (error, resp, html) {
            let $ = cheerio.load(html);
            $('.region').each(async function (index, element){
                var region = $(element).children('.regtitle').text();
                $(element).find('dl').each(async function (index2, element2){
                    $(element2).find('a').each(async function (index3, element3){
                        var team_name = $(element3).attr('title');
                        if (team_name === undefined){
                            return
                        }
                        var raw_url = $(element3).attr('href').split('/');
                        var espn_id = raw_url[ raw_url.length -2 ];
                        // TODO Grab RANK, scrape game

                        var query_string = "INSERT INTO `mm`.`team` (`school`, `espn_id`, `region`) VALUES (?, '" + espn_id + "', '" + region + "');";
                        var response = await mysql_lib.mysql_query_param(`Team ${team_name} added`, query_string, [team_name])
                        scrape_team_mascots(espn_id);
                        resolve();
                    })
                })
            })

        })
    })
}

function scrape_team_mascots(team_espn_id){
    new Promise((resolve, reject) => {
        request(`http://www.espn.com/mens-college-basketball/team/_/id/${team_espn_id}`, async function (error, resp, html) {
            let $ = cheerio.load(html);
            var team_name = $('li.team-name').first().children('span.link-text-short').text();
            var team_name_length = team_name.length;
            var long_name = $('li.team-name').first().children('span.link-text').text();
            var mascot = long_name.substring(team_name_length).trim();
            var query_string = "UPDATE `mm`.`team` SET `school`= ?, `mascot`= ? WHERE `espn_id`='" + team_espn_id + "';"
            var response = await mysql_lib.mysql_query_param(`Team ${team_name} mascot ${mascot} updated`, query_string, [team_name,mascot])
            resolve();

        })
    })
}

function add_players(team_id){
    new Promise((resolve, reject) => {
        request(`http://www.espn.com/mens-college-basketball/team/stats/_/id/${team_id}`, function (error, resp, html) {
            let $ = cheerio.load(html);
            $('table.tablehead').first().find('.oddrow, .evenrow').each(async function (index, element) {
                var response = await mysql_lib.mysql_query_param(`Player ${$(element).find('a').text()} added`, "INSERT INTO `mm`.`player` (`full_name`, `espn_id`, `team_id`, `scoring_average`) VALUES (?, '" + $(element).attr('class').substring( $(element).attr('class').lastIndexOf('-') + 1) + "', (SELECT t.id FROM mm.team t WHERE t.espn_id = '"+team_id+"'), " +  $(element).children('td:nth-child(4)').text() + ");", [$(element).find('a').text()])
                resolve();
            })
        })
    })
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
    scrape_team_mascots
};
