var Operation = require('operation')
var cadence = require('cadence')
var abend = require('abend')
var Synchronous = require('./synchronous')

function Asynchronous (iterators, head) {
    this.head = head
    this._next = iterators._next
    this._previous = iterators
    this._next._previous = this
    this._previous._next = this
}

Asynchronous.prototype.shift = function (callback) {
    if (this.head.next) {
        this.head = this.head.next
        callback(null, this.head.value)
    } else {
        this._callback = callback
    }
}

Asynchronous.prototype.destroy = function () {
    this._previous._next = this._next
    this._next._previous = this._previous
}

Asynchronous.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.shift(async())
    }, function (value) {
        if (condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Asynchronous.prototype._nudge = function () {
    if (this._callback != null) {
        var callback = [ this._callback, this._callback = null ][0]
        this.head = this.head.next
        setImmediate(callback, null, this.head.value)
    }
}

Asynchronous.prototype._pump = cadence(function (async, next) {
    if (typeof next == 'object' && typeof next.push == 'function') {
        next = { object: next, method: 'push' }
    }
    next = new Operation(next)
    var loop = async(function () {
        this.shift(async())
    }, function (message) {
        next.apply([ message ])
    })
})

Asynchronous.prototype.pump = function (next) {
    this._pump(next, abend)
}

Asynchronous.prototype.async = function () {
    return new Asynchronous(this, this.head)
}

Asynchronous.prototype.sync = function () {
    return new Synchronous(this._procession, this.head)
}

module.exports = Asynchronous
