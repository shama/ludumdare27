module.exports = function(tiles) {
  return function(str, pos) {
    var res = []
    pos = pos || [0,0]
    pos.push(0)
    str.split('').forEach(function(letter, i) {
      if (!tiles[letter]) return
      var p = pos.slice(0)
      p[2] = tiles[letter].index
      p[0] += i
      res.push(p)
    })
    return res
  }
}

