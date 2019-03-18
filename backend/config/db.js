module.exports = {
    host     : process.env.mm_mysql_host || 'localhost',
    user     : process.env.mm_mysql_user || 'root',
    password : process.env.mm_mysql_pass || 'abc123',
    database : process.env.mm_mysql_db || 'mm',
    multipleStatements: true
}
