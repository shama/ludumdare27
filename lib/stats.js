var leveler = require('leveler')
var propup = require('propup')

function Stats() {
  this.stats = {}

  this.stats['exp'] = leveler(function(pts) {
    return Math.floor(Math.floor(25 + Math.sqrt(625 + 100 * pts)) / 50)
  })

  this.stats['hp'] = leveler(function(pts) {
    return Math.floor(Math.floor(25 + Math.sqrt(625 + 100 * pts)) / 50)
  })
}
module.exports = function() {
  return new Stats()
}
module.exports.Stats = Stats
