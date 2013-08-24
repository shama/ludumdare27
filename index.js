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
    player: { tilemap: [7, 7] },
    enemy: { text: '%', color: '#ddd', bg: '#333' }
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
    return (idx > 1000) ? Math.floor(((255*3*3)+(255*3)+255) / idx) + 100 : 0
  })
  this.worldmap.draw(this.map.data, [10, 20])

  // init player
  var start = [Math.floor(this.map.data.shape[0]/2), Math.floor(this.map.data.shape[1]/2)]
  var playerid = 1
  this.player = createPlayer({at: start})
  this.map.data.set(start[0], start[1], playerid)
  var lastPos = start.concat(0)
  this.player.on('move', function(to, from) {
    if (lastPos) self.map.set(lastPos)
    lastPos = self.player.at.concat(self.map.get(self.player.at))

    if (to[0] === 0) { // shift map left
      self.worldmap.draw(self.map.data, [-self.map.data.shape[0], 0])
      self.player.at = [self.map.data.shape[0], to[1]]
      self.map.set(self.player.at, playerid)
      self.map.updateAll()
    } else if (to[1] === 0) { // shift map up
      self.worldmap.draw(self.map.data, [0, -self.map.data.shape[1]])
      self.player.at = [to[0], self.map.data.shape[1]]
      self.map.set(self.player.at, playerid)
      self.map.updateAll()
    } else if (to[0] === self.map.data.shape[0]) { // shift map right
      self.worldmap.draw(self.map.data, [self.map.data.shape[0], 0])
      self.player.at = [0, to[1]]
      self.map.set(self.player.at, playerid)
      self.map.updateAll()
    } else if (to[1] === self.map.data.shape[1]) { // shift map down
      self.worldmap.draw(self.map.data, [0, self.map.data.shape[1]])
      self.player.at = [to[0], 0]
      self.map.set(self.player.at, playerid)
      self.map.updateAll()
    } else {
      self.map.set(to, playerid)
    }

    // shift the map - its slow
    //self.worldmap.draw(self.map.data, to)
    //self.map.set([Math.floor(self.map.data.shape[0]/2), Math.floor(self.map.data.shape[1]/2)], playerid)
    //self.map.updateAll()
  })

  // init text engine
  this.text = createText(this.tiles.index)

  // init sound
  this.sound = createSound()
  /*var notes = 'ABCDEFG'.split('')
  this.sound.load('A B D A B D C B D C F D'.split(' '))
  var track = []
  for (var i = 0; i < 99; i++) {
    track.push(notes[Math.floor(Math.random()*notes.length)])
  }
  this.sound.load(track)*/

  this.menu = require('./lib/menu')(this.map, this.tiles.index)
  this.menu.show([5, 5, 20, 10], [
    'A one',
    'B two',
  ])

  // update the entire grid once
  this.map.updateAll()
}
module.exports = Game

Game.prototype.tick = function(dt) {
  this.player.tick(dt)
  this.tic.tick(dt)
  this.map.tick(dt)
}
