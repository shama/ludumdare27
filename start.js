var game = require('./')()
var raf = require('raf')

var stats = new (require('./stats'))
stats.domElement.style.position = 'absolute'
stats.domElement.style.left = '0px'
stats.domElement.style.top = '0px'
document.body.appendChild(stats.domElement)

// main loop
raf().on('data', function(dt) {
  stats.begin()
  game.tick(dt)
  stats.end()
})

/*tala.tic.setInterval(function() {
  //grid.set(start, Math.floor(i++ % 3))
  var x = Math.floor(Math.random()*tala.grid.data.shape[0])
  var y = Math.floor(Math.random()*tala.grid.data.shape[1])
  var p = Math.floor(Math.random()*200)+2
  tala.grid.set(x, y, p)
}, 200)*/

// run the script
//require('./lib/script')(tala)

