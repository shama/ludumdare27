var keyboard = new (require('crtrdg-keyboard'))
var EE = require('events').EventEmitter
var inherits = require('inherits')
var add = require('vectors/add')(2)
var dist = require('vectors/dist')(2)
var copy = require('vectors/copy')(2)

//var collisions = require('collide-2d-tilemap')

function Player(opts) {
  var self = this
  if (!(this instanceof Player)) return new Player(opts)
  opts = opts || {}
  this.at = opts.at || [0, 0]
  this.bounds = opts.bounds || [[0, 0], [100, 100]]
  this._keydown = false
  keyboard.on('keydown', function(key) {
    self._keydown = true
    self.emit('keydown', key)
  })
}
inherits(Player, EE)
module.exports = Player

Player.prototype.tick = function(dt) {
  if (!this._keydown) return
  var from = copy(this.at)
  if ('A' in keyboard.keysDown || '<left>' in keyboard.keysDown) add(this.at, [-1, 0])
  if ('D' in keyboard.keysDown || '<right>' in keyboard.keysDown) add(this.at, [1, 0])
  if ('W' in keyboard.keysDown || '<up>' in keyboard.keysDown) add(this.at, [0, -1])
  if ('S' in keyboard.keysDown || '<down>' in keyboard.keysDown) add(this.at, [0, 1])
  this.emit('move', this.at, from)
  this._keydown = false
}

