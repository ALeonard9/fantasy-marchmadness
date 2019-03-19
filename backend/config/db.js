module.exports = {
    host     : process.env.mm_mysql_host || '192.168.99.100',
    user     : process.env.mm_mysql_user || 'root',
    password : process.env.mm_mysql_pass || 'abc123',
    database : process.env.mm_mysql_db || 'mm',
    multipleStatements: true
}
