//var leveler = require('leveler')
//var propup = require('propup')
var fs = require('fs')
var createTic = require('tic')
var createStats = require('./lib/stats')
var fill = require('ndarray-fill')
var ndarray = require('ndarray')
var add = require('vectors/add')(2)
//var createWorld = require('./lib/worldmap')

var createTiles = require('dom-tiles')
var createTileMap = require('dom-tilemap')
var createPlayer = require('./lib/player')
var createText = require('./lib/text')
var createSound = require('./lib/sound')
var createInv = require('./lib/inv')
var createLevels = require('./lib/levels')

var terrain = require('isabella-texture-pack')

function Game(opts) {
  var self = this
  if (!(this instanceof Game)) return new Game(opts)
  opts = opts || {}

  this.tic = createTic()

  // init inventory
  this.inv = createInv({
    tnt: (function() {
      var arr = ndarray(new Uint8Array(3 * 3), [3, 3])
      fill(arr, function(x, y) {
        return 10
      })
      return arr
    }()),
    bigbomb: (function() {
      var arr = ndarray(new Uint8Array(5 * 5), [5, 5])
      fill(arr, function(x, y) {
        return 2
      })
      return arr
    }()),
    laser: (function() {
      var arr = ndarray(new Uint8Array(64 * 64), [64, 64])
      fill(arr, function(x, y) {
        return (x === 32 || y === 32) ? 2 : 0
      })
      return arr
    }()),
  })

  // init tiles
  var tiles = opts.tiles || {
    air: {},
    /* 1 */  player: { tilemap: [12, 7] },
    /* 2 */  touched: { tilemap: [10, 8] },
    /* 3 */  ground: { tilemap: [7, 10] },
    /* 4 */  wood: { tilemap: [4, 1] },
    /* 5 */  brick: { tilemap: [7, 0] },
    /* 6 */  stone: { tilemap: [0, 1] },
    /* 7 */  start: { tilemap: [3, 13] },
    /* 8 */  tnt: { tilemap: [8, 0] },
    /* 9 */  gravel: { tilemap: [0, 0] },
    /* 10 */ fire: { tilemap: [15, 2] },
  }
  this.tiles = createTiles({tiles: tiles, tilemap: terrain})

  // init tilemap
  this.map = createTileMap({
    tiles: Object.keys(this.tiles.index),
    width: window.innerWidth - 300
  })
  document.body.appendChild(this.map.element)

  // init levels
  this.levels = createLevels([{
    map: require('./img/level1.json'),
    items: [
      [10, 3, 8]
    ]
  }])

  // init worldmap
  var map = require('./img/map.json')
  this.worldmap = require('./lib/worldmap')(map, function(r, g, b, a) {
    var idx = (r * 3 * 3) + (g * 3) + b
    return (idx > 1000) ? Math.floor(((255*3*3)+(255*3)+255) / idx) + 195 : 0
  })
  //this.worldmap.draw(this.map.data, [10, 20])

  // init vars
  this.score = 0
  this.playerid = 1
  this.walls = [0, 4, 5, 6]
  this.items = [8]
  this.touchCount = 0
  this.clock = 10 * 1000
  this.clockElement = document.getElementById('clock')

  // init player
  this.player = createPlayer()

  // Use inventory item
  function useInv(pattern, which) {
    var w = Math.floor(pattern.shape[0] / 2)
    var h = Math.floor(pattern.shape[1] / 2)
    for (var x = 0; x < pattern.shape[0]; x++) {
      for (var y = 0; y < pattern.shape[1]; y++) {
        var pos = [(x - w) + self.player.at[0], (y - h) + self.player.at[1]]
        var tile = pattern.get(x, y)
        if (tile > 0) self.map.set(pos, tile)
      }
    }
  }
  this.player.on('keydown', function(key) {
    var n = parseInt(key)
    if (!isNaN(n) && n > -1 && n < 10) {
      self.inv.use(key, useInv)
    }
  })

  var lastPos = false
  this.player.on('move', function(to, from) {
    var totile = self.map.get(to)

    // pick up items
    for (var i = 0; i < self.items.length; i++) {
      if (totile === self.items[i]) {
        self.inv.add('tnt', 1)
        self.map.set(to, 3)
        break
      }
    }

    // if hit a wall
    for (var i = 0; i < self.walls.length; i++) {
      if (totile === self.walls[i]) {
        self.player.at = from
        return
      }
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

    if (lastPos) self.map.set(lastPos)
    else self.map.set(from, 7)
    lastPos = self.player.at.concat(self.map.get(self.player.at))
    self.touchCount++
    //self.clock += 500
    //self.map.set(from, 2)
    self.map.set(to, self.playerid)

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

  /*this.menu = require('./lib/menu')(this.map, this.tiles.index)
  this.menu.show([5, 5, 20, 10], [
    'A one',
    'B two',
  ])*/

  // update the entire grid once
  this.reset()

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

Game.prototype.reset = function() {
  this.worldmap.draw(this.map.data, [10, 20])
  this.levels.draw(0, this.map)

  var start = [Math.floor(this.map.data.shape[0]/2), Math.floor(this.map.data.shape[1]/2)]
  this.player.at = start
  this.map.data.set(start[0], start[1], this.playerid)

  this.map.updateAll()
}

Game.prototype.updateClock = function() {
  var self = this

  var s = Math.floor(this.clock / 1000).toFixed(0)
  var m = (Math.floor(this.clock % 1000) / 100).toFixed(0)
  if (String(m).length === 2) m = '0'
  this.clockElement.innerHTML = s + '.' + m + 's'
  if (this.clock <= 0) this.clockElement.style.color = '#000'
  else this.clockElement.style.color = '#ddd'

  document.getElementById('score').innerHTML = this.score

  this.sound.speed = 8 - (this.clock / 1000)
  if (this.sound.speed < 1) this.sound.speed = 1
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
