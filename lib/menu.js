var ndarray = require('ndarray')
var fill = require('ndarray-fill')
var createText = require('./text')

function Menu(map, tiles) {
  if (!(this instanceof Menu)) return new Menu(map, tiles)
  this.map = map
  this.text = createText(tiles)
}
module.exports = Menu

Menu.prototype.show = function(at, menu, opts) {
  var self = this

  menu = menu || []
  opts = opts || {}
  var border = opts.border || 102
  var corner = opts.corner || border
  var bg = opts.bg || 103

  var w = at[2]-1
  var h = at[3]-1

  var p = 0
  menu = menu.map(function(m) {
    return self.text(m, [2, p+=2])
  })

  for (var x = 0; x < at[2]; x++) {
    for (var y = 0; y < at[3]; y++) {
      var tile = bg
      
      if (x === 0 || y === 0 || x === w || y === h) {
        if ((x === 0 && y === 0) || (x === 0 && y === h) || (x === w && y === 0) || (x === w && y === h)) tile = corner
        tile = border
      }

      for (var i = 0; i < menu.length; i++) {
        for (var j = 0; j < menu[i].length; j++) {
          if (x === menu[i][j][0] && y === menu[i][j][1]) {
            tile = menu[i][j][2]
          }
        }
      }

      this.map.set(x + at[0], y + at[1], tile)
    }
  }
}
