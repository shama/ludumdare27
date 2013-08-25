var master = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext)
var jsynth = require('jsynth')
var tune = require('tune')

function Sound() {
  var self = this
  if (!(this instanceof Sound)) return new Sound()
  this.tracks = []
  this.paused = false
  this.speed = 1
  var synth = jsynth(master, function(t) {
    if (self.paused) return 0
    t *= self.speed
    var o = 0
    for (var i = 0; i < self.tracks.length; i++) {
      o += self.tracks[i](t)
    }
    return o
  })
  setTimeout(function() {
    synth.connect(master.destination)
  }, 500)
}
module.exports = Sound

Sound.prototype.load = function(track) {
  if (typeof track !== 'function') track = tune(track)
  this.tracks.push(track)
}
