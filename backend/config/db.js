module.exports = {
  host: process.env.mm_mysql_host || '127.0.0.1',
  user: process.env.mm_mysql_user || 'root',
  password: process.env.mm_mysql_pass || 'abc123',
  databse: process.env.mm_mysql_db || 'mm',
  multipleStatements: true
}
