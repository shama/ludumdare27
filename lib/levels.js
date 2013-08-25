var decodeBase64 = require('base64-js').toByteArray
var ndarray = require('ndarray')
var lum = require('luminance')
var add = require('vectors/add')(2)

function Levels(levels) {
  if (!(this instanceof Levels)) return new Levels(levels)
  this.levels = levels.map(function(level) {
    var arr = ndarray(new Uint8Array(decodeBase64(level.map.data)), level.map.shape, level.map.stride, level.map.offset)
    level.map = lum(arr)
    return level
  })
  this.key = [
    [0, 100, 5],
    [101, 200, 6],
    [201, 240, 9],
    [241, 255, 3],
  ]
}
module.exports = Levels

Levels.prototype.draw = function(id, map) {
  var level = this.levels[id]
  if (!level) return false
  var center = [
    Math.floor(map.data.shape[0] / 2) - Math.floor(level.map.shape[0] / 2),
    Math.floor(map.data.shape[1] / 2) - Math.floor(level.map.shape[1] / 2)
  ]
  for (var x = 0; x < level.map.shape[0]; x++) {
    for (var y = 0; y < level.map.shape[1]; y++) {
      var a = level.map.get(x, y, 0)
      var tile = 0
      for (var i = 0; i < this.key.length; i++) {
        if (a >= this.key[i][0] && a <= this.key[i][1]) {
          tile = this.key[i][2]
          break
        }
      }
      map.set(x + center[0], y + center[1], tile)
    }
  }

  // set items
  for (var i = 0; i < level.items.length; i++) {
    var pos = level.items[i].slice(0, 2)
    map.set(add(pos, center), level.items[i][2])
  }

}

/*
Levels.prototype.draw = function(id, map) {
  var level = this.levels[id]
  if (!level) return false
  level = level.split('\n').map(function(line) { return line.split('') })
  var offset = [
    Math.floor(map.data.shape[0] / 2) - Math.floor(level[0].length/2),
    Math.floor(map.data.shape[1] / 2) - Math.floor(level.length/2)
  ]
  for (var y = 0; y < level[0].length; y++) {
    for (var x = 0; x < level.length; x++) {
      map.set(y + offset[1], x + offset[0], this.key[level[x][y]])
    }
  }
}*/
