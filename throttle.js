// Node.js API.
var util = require('util')

// Return the first not null-like value.
var coalesce = require('extant')

var noop = require('nop')

var Window = require('./window')

function Listener (throttle, scale) {
    this._throttle = throttle
    this._scale = coalesce(scale, function () { return 1 })
}

Listener.prototype.pushed = function (node) {
    this._throttle.heft += this._scale.call(null, node)
}

Listener.prototype.shifted = function (node) {
    this._throttle.heft -= this._scale.call(null, node)
    this._throttle._enqueue()
}

function Throttle (limit, scale) {
    Window.call(this)
    this.addListener(new Listener(this, scale))
    this.limit = limit
    this.heft = 0
    this.backlog = 0
    this._backlog = []
}
util.inherits(Throttle, Window)

Throttle.prototype._enqueue = function () {
    console.log(this.heft, this.limit)
    while (this.backlog != 0 && this.heft < this.limit) {
        this.backlog--
        var backlog = this._backlog.shift()
        this.push(backlog.value)
        backlog.callback.call(null)
    }
}

Throttle.prototype.enqueue = function (value, callback) {
    if (this.heft < this.limit) {
        this.push(value)
        callback()
    } else {
        this.backlog++
        this._backlog.push({
            callback: coalesce(callback, noop),
            value: value
        })
    }
}

module.exports = Throttle
