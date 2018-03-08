'strict';

const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');
const asyncP = require('async-promises');
const winston = require('winston');
const chalk = require('chalk');
const mysql_lib = require('./lib/mysql');
const scraper = require('./lib/scraper');
const cors = require('cors');
const cron = require('node-cron');

var today = new Date();
var environment =  process.env.environment || 'local'
winston.level =  process.env.winston || 'info';
winston.info(chalk.yellow('Starting:' + today));

// Constants
const PORT = process.env.mmbackendport || 8080;
const HOST = '0.0.0.0';

cron.schedule('* * * * *'), function() {
  console.log('Cronning!')
}

// App
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({origin: '*'}));
app.use(function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    // Website you wish to allow to connect
    // var origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'OPTIONS');

    // Request headers you wish to allow
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/', (req, res) => {
  winston.log('info', chalk.yellow('Connection established.'));
  res.send(JSON.stringify({success: true}))
});
app.route('/owners')
  .get(async (req, res) => {
    var response = await mysql_lib.mysql_query("Owner", "SELECT id, name, display_name, draft_position FROM mm.owner")
    res.send(JSON.stringify(response));
  })
app.get('/owners/:id', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Owner", "SELECT * FROM mm.owner WHERE id = ?", [req.params.id])
    res.send(JSON.stringify(response));
});
app.get('/owners/:id/players', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Owner players", "SELECT * FROM mm.owner o, mm.player p WHERE o.id = ? AND o.id = p.team_id", [req.params.id])
    res.send(JSON.stringify(response));
});
app.get('/players', async (req, res) => {
    var response = await mysql_lib.mysql_query("Player", "SELECT * FROM mm.player")
    res.send(JSON.stringify(response));
});
app.get('/players/:id', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Player", "SELECT * FROM mm.player WHERE id = ?", [req.params.id])
    res.send(JSON.stringify(response));
});
app.get('/teams', async (req, res) => {
    var response = await mysql_lib.mysql_query("Team", "SELECT * FROM mm.team")
    res.send(JSON.stringify(response));
});
app.get('/teams/:id', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Team ", "SELECT * FROM mm.team WHERE id = ?", [req.params.id])
    res.send(JSON.stringify(response));
});
app.get('/teams/:id/players', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Team player", "SELECT * FROM mm.team t, mm.player p WHERE t.id = ? AND t.id = p.team_id", req.params.id)
    res.send(JSON.stringify(response));
});
app.get('/everything', async (req, res) => {
    var response = await mysql_lib.mysql_query("Everything", "SELECT * FROM mm.team t, mm.player p, mm.owner  o WHERE o.id = p.owner_id AND t.id = p.team_id")
    res.send(JSON.stringify(response));
});
app.get('/everything/owner/:id', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Everything owner", "SELECT * FROM mm.team t, mm.player p, mm.owner  o WHERE o.id = ? AND o.id = p.owner_id AND t.id = p.team_id", [req.params.id])
    res.send(JSON.stringify(response));
});
app.get('/everything/team/:id', async (req, res) => {
    var response = await mysql_lib.mysql_query_param("Everything team", "SELECT * FROM mm.team t, mm.player p, mm.owner  o WHERE t.id = ? AND o.id = p.owner_id AND t.id = p.team_id", [req.params.id])
    res.send(JSON.stringify(response));
});
app.get('/draft/reset', async (req, res) => {
    var response = await mysql_lib.mysql_query("Draft reset", "Update owner set draft_position = NULL WHERE id >0")
    res.send(JSON.stringify(response));
});
app.get('/draft/randomizer', async (req, res) => {
    var response = await mysql_lib.mysql_query("Draft randomizer", "SELECT * FROM mm.draft_randomizer")
    res.send(JSON.stringify(response));
});
app.post('/draft', async (req, res) => {
    var query_string = '';
    let p1 = new Promise((resolve, reject) => {
        var keys = Object.keys (req.body);
        for(var i =0, length = keys.length; i< length; i++){
            query_string += "UPDATE `mm`.`owner` SET `draft_position` = '" + keys[i] + "' WHERE `id` = '" + req.body[keys[i]] + "'; "
            if (i === keys.length -1 ){
                resolve();
            }
        }
    })
    .then(async () => {
        var response = await mysql_lib.mysql_query("Draft set", query_string)
        res.send(JSON.stringify(response));
    })
});
app.get('/top_player', async (req, res) => {
    var response = await mysql_lib.mysql_query("Top player", "SELECT * FROM mm.top_player")
    res.send(JSON.stringify(response));
});
app.get('/scoreboard', async (req, res) => {
    var response = await mysql_lib.mysql_query("Scoreboard", "SELECT * FROM mm.scoreboard")
    res.send(JSON.stringify(response));
});
app.get('/playerboard', async (req, res) => {
    var response = await mysql_lib.mysql_query("Playerboard", "SELECT o.display_name, o.name, o.id, p.full_name, p.espn_id, p.scoring_average, p.round1, p.round2, p.round3, p.round4, p.round5, p.round6, t.school, t.mascot, t.id as team_id, t.seed, t.region, t. eliminated FROM mm.team t, mm.player p LEFT JOIN mm.owner o ON p.owner_id = o.id WHERE  t.id = p.team_id ORDER BY seed, school, scoring_average desc;")
    res.send(JSON.stringify(response));
});
app.get('/scrape_all', async (req, res) => {
    var response = await scraper.scrape();
    res.send(JSON.stringify(response));
});
app.get('/scrape_players', async (req, res) => {
    var response = await scraper.scrape_players();
    res.send(JSON.stringify(response));
});
app.get('/scrape_teams', async (req, res) => {
    var response = await scraper.scrape_teams();
    res.send(JSON.stringify(response));
});
app.get('/scrape_team_mascots/:id', async (req, res) => {
    var response = await scraper.scrape_team_mascots(req.params.id);
    res.send(JSON.stringify(response));
});
app.get('/scrape/:id', async (req, res) => {
    var response = await scraper.scrape(req.params.id);
    res.send(JSON.stringify(response));
});

app.listen(PORT, HOST);
winston.info(chalk.yellow(`Running on http://${HOST}:${PORT}`));
