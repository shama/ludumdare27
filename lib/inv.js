function Inv(items) {
  if (!(this instanceof Inv)) return new Inv(items)
  this.items = items || Object.create(null)
  this.slots = []
  for (var i = 0; i < 10; i++) this.slots[i] = [false, 0]
  this.slots[0] = [true, 99999999999999]
}
module.exports = Inv

Inv.prototype.add = function(item, amt) {
  for (var i = 0; i < this.slots.length; i++) {
    if (this.slots[i][0] === false) {
      this.slots[i] = [item, amt || 1]
      break
    }
  }
  this.draw()
}

Inv.prototype.use = function(which, fn) {
  var slot = this.slots[which]
  if (!slot[0] || slot[1] < 1) return
  var arr = this.items[slot[0]]
  if (!arr) return
  fn(arr, which)
  this.slots[which][1]--
  if (this.slots[which][1] < 1) this.slots[which] = [false, 0]
  this.draw()
}

Inv.prototype.draw = function() {
  var el = document.getElementById('inv')
  var items = ''
  for (var i = 1; i < this.slots.length; i++) {
    if (this.slots[i][0] === false) continue
    items += '<b>#' + i + '</b>: ' + this.slots[i][0] + ' x' + this.slots[i][1] + '<br/>'
  }
  el.innerHTML = items
}
