var leveler = require('leveler')
var propup = require('propup')
var createTic = require('tic')
var createStats = require('./lib/stats')
//var createWorld = require('./lib/worldmap')

var createTiles = require('dom-tiles')
var createTileMap = require('dom-tilemap')
var createPlayer = require('./lib/player')
var createText = require('./lib/text')
var createSound = require('./lib/sound')

var terrain = require('isabella-texture-pack')

function Game(opts) {
  var self = this
  if (!(this instanceof Game)) return new Game(opts)
  opts = opts || {}

  this.tic = createTic()

  // init tiles
  var tiles = opts.tiles || {
    air: {},
    player: { tilemap: [12, 7] },
    touched: { tilemap: [10, 8] },
  }
  this.tiles = createTiles({tiles: tiles, tilemap: terrain})

  // init tilemap
  this.map = createTileMap({
    tiles: Object.keys(this.tiles.index),
    width: window.innerWidth - 300
  })
  document.body.appendChild(this.map.element)

  // init worldmap
  var map = require('./img/map.json')
  this.worldmap = require('./lib/worldmap')(map, function(r, g, b, a) {
    var idx = (r * 3 * 3) + (g * 3) + b
    return (idx > 1000) ? Math.floor(((255*3*3)+(255*3)+255) / idx) + 200 : 0
  })
  this.worldmap.draw(this.map.data, [10, 20])

  // wall types
  this.walls = [0]
  this.touchCount = 0
  this.clock = 10 * 1000
  this.clockElement = document.getElementById('clock')

  // init player
  var start = [Math.floor(this.map.data.shape[0]/2), Math.floor(this.map.data.shape[1]/2)]
  var playerid = 1
  this.player = createPlayer({at: start})
  this.map.data.set(start[0], start[1], playerid)
  var lastPos = start.concat(0)
  this.player.on('move', function(to, from) {
    var totile = self.map.get(to)

    // if hit a wall
    var blocked = false
    for (var i = 0; i < self.walls.length; i++) {
      if (totile === self.walls[i]) {
        blocked = true
        break
      }
    }
    if (blocked) {
      self.player.at = from
      return
    }

    if (to[0] === 0) {
      to = self.player.at = [self.map.data.shape[0], to[1]]
    } else if (to[1] === 0) {
      to = self.player.at = [to[0], self.map.data.shape[1]]
    } else if (to[0] === self.map.data.shape[0]) { // shift map right
      to = self.player.at = [0, to[1]]
    } else if (to[1] === self.map.data.shape[1]) { // shift map down
      to = self.player.at = [to[0], 0]
    }

    //if (lastPos) self.map.set(lastPos)
    //lastPos = self.player.at.concat(self.map.get(self.player.at))
    self.touchCount++
    self.map.set(from, 2)
    self.map.set(to, playerid)

    // shift the map - its slow
    //self.worldmap.draw(self.map.data, to)
    //self.map.set([Math.floor(self.map.data.shape[0]/2), Math.floor(self.map.data.shape[1]/2)], playerid)
    //self.map.updateAll()
  })

  // init text engine
  this.text = createText(this.tiles.index)

  // init sound
  this.sound = createSound()
  var notes = 'ABCDEFG'.split('')
  this.sound.load('A B D A B D C B D C F D'.split(' '))
  var track = []
  for (var i = 0; i < 99; i++) {
    track.push(notes[Math.floor(Math.random()*notes.length)])
  }
  this.sound.load(track)

  /*this.menu = require('./lib/menu')(this.map, this.tiles.index)
  this.menu.show([5, 5, 20, 10], [
    'A one',
    'B two',
  ])*/

  // update the entire grid once
  this.map.updateAll()

  this.tic.setInterval(this.updateClock.bind(this), 100)
}
module.exports = Game

Game.prototype.tick = function(dt) {
  this.clock -= dt
  if (this.clock <= 0) this.clock = 0
  this.player.tick(dt)
  this.tic.tick(dt)
  this.map.tick(dt)
}

Game.prototype.updateClock = function() {
  var self = this

  var s = Math.floor(this.clock / 1000).toFixed(0)
  var m = (Math.floor(this.clock % 1000) / 100).toFixed(0)
  if (String(m).length === 2) m = '0'
  this.clockElement.innerHTML = s + '.' + m + 's'
  if (this.clock <= 0) this.clockElement.style.color = '#000'
  else this.clockElement.style.color = '#ddd'

  this.sound.speed = 10 - s
  if (this.clock <= 0) {
    this.sound.speed = 40
    this.tic.setTimeout(function() {
      self.sound.speed = 1
      self.sound.paused = true
    }, 500)
  } else {
    self.sound.paused = false
  }
}
