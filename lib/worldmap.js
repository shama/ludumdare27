var ndarray = require('ndarray')
var decodeBase64 = require('base64-js').toByteArray
var add = require('vectors/add')(2)

function WorldMap(map, fn) {
  if (!(this instanceof WorldMap)) return new WorldMap(map, fn)
  this.data = ndarray(new Uint8Array(decodeBase64(map.data)), map.shape, map.stride, map.offset)
  this.fn = fn
  this.at = [0, 0]
}
module.exports = WorldMap

WorldMap.prototype.draw = function(map, offset) {
  offset = add(this.at, offset || [0, 0])
  var view = this.data.lo(offset[0], offset[1]).hi(map.shape[0], map.shape[1])
  for (var x = 0; x < view.shape[0]; x++) {
    for (var y = 0; y < view.shape[1]; y++) {
      map.set(x, y, this.fn(view.get(x, y, 0), view.get(x, y, 1), view.get(x, y, 2), view.get(x, y, 3)))
    }
  }
}
