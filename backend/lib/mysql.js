const winston = require('winston');
const chalk = require('chalk');
const mysql_config = require('../config/db');
const mysql = require('mysql');
const request = require('request');
const async = require('async');

// winston.log('info', chalk.yellow(JSON.stringify(mysql_config)));

function mysql_query (identifier, query_string) {
    return new Promise(function(resolve, reject){
        winston.log('info', chalk.yellow(`${identifier} request received`));
        var connection = mysql.createConnection(mysql_config);
        connection.connect(function(err) {
          if (!err) {
              connection.query(query_string,
                  function(err, results) {
                      if (!err) {
                          winston.log('info', chalk.yellow('Results: ' + JSON.stringify(results)));
                          connection.end();
                          resolve(results);
                      } else {
                          reject(err);
                          error_handler('Query error: ' + err);
                      }
                  });
          } else {
              error_handler('Database connection error: ' + err.message);
          }
        });
    })
}
function mysql_query_param (identifier, query_string, param) {
    return new Promise(function(resolve, reject){
        winston.log('info', chalk.yellow(`${identifier} ${JSON.stringify(param)} request received`));
        var connection = mysql.createConnection(mysql_config);
        connection.connect(function(err) {
          if (!err) {
              connection.query(query_string, param,
                  function(err, results) {
                      if (!err) {
                          winston.log('info', chalk.yellow('Results: ' + JSON.stringify(results)));
                          connection.end();
                          resolve(results);
                      } else {
                          reject(err);
                          error_handler('Query error: ' + err);
                      }
                  });
          } else {
              error_handler('Database connection error: ' + err.message);
          }
        });
    })
}
function mysql_query_post (identifier, query_string, hash) {
    return new Promise(function(resolve, reject){
        winston.log('info', chalk.yellow(`${identifier} ${param} post received`));
        var connection = mysql.createConnection(mysql_config);
        connection.connect(function(err) {
          if (!err) {
              connection.query(query_string, [param],
                  function(err, results) {
                      if (!err) {
                          winston.log('info', chalk.yellow('Results: ' + JSON.stringify(results)));
                          connection.end();
                          resolve(results);
                      } else {
                          reject(err);
                          error_handler('Query error: ' + err);
                      }
                  });
          } else {
              error_handler('Database connection error: ' + err.message);
          }
        });
    })
}
function error_handler (message) {
    winston.log('error', chalk.red(message));  
  }
  
module.exports = {mysql_query, mysql_query_param}