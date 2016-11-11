var Operation = require('operation')
var cadence = require('cadence')
var abend = require('abend')

function Consumer (procession, head) {
    this._procession = procession
    this.head = head
}

Consumer.prototype.shift = function (callback) {
    if (this.head.next) {
        this.head = this.head.next
        callback(null, this.head.value)
    } else {
        this._callback = callback
    }
}

Consumer.prototype.destroy = function () {
    this._procession = false
    this.destroyed = true
}

Consumer.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.shift(async())
    }, function (value) {
        if (condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Consumer.prototype._nudge = function () {
    if (this._callback != null) {
        var callback = [ this._callback, this._callback = null ][0]
        this.head = this.head.next
        setImmediate(callback, null, this.head.value)
    }
}

Consumer.prototype._pump = cadence(function (async, next) {
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

Consumer.prototype.pump = function (next) {
    this._pump(next, abend)
}

Consumer.prototype.duplicate = function () {
    return new Consumer(this._procession, this.head)
}

module.exports = Consumer
