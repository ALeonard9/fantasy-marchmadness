'use strict'
var back = (process.env.mm_backend_host || 'localhost') + ':' + (process.env.mm_backend_port || '8080')
var backend_url = `"http://${back}"`
module.exports = {
  NODE_ENV: '"production"',
  backend_url: backend_url
}
