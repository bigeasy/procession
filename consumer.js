var abend = require('abend')
var Operation = require('operation')
var assert = require('assert')
var cadence = require('cadence')
var Vestibule = require('vestibule')

var NullProcession = { _shifted: function () {} }

function Consumer (procession, head) {
    this.node = head
    this._procession = procession
    this._pushed = procession.pushed
    this._procession._consumers.push(this)
    this.endOfStream = false
}

Consumer.prototype.dequeue = cadence(function (async) {
    async(function () {
        var loop = async(function () {
            var value = this.shift()
            if (value != null || this.endOfStream) {
                return [ loop.break, value ]
            }
            this._wait = this._pushed.enter(async())
        })()
    }, function (value) {
        this._wait = null
    })
})

Consumer.prototype.shift = function () {
    if (!this.endOfStream && this.node.next) {
        this.node = this.node.next
        var value = this.node.value
        this._procession._shifted(this.node)
        return value
    }
    return null
}

Consumer.prototype.destroy = function () {
    this.endOfStream = true
    this._procession = NullProcession
    if (this._wait != null) {
        this._procession.shifted.leave(this._wait)()
    }
}

Consumer.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.dequeue(async())
    }, function (value) {
        if (this.endOfStream || condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Consumer.prototype._pump = cadence(function (async, next) {
    var asynchronous = false
    switch (typeof next) {
    case 'object':
        if (typeof next.enqueue == 'function') {
            asynchronous = true
            next = { object: next, method: 'enqueue' }
        } else {
            next = { object: next, method: 'push' }
        }
        break
    case 'function':
        asynchronous = next.length == 2
        break
    }
    next = new Operation(next)
    var loop = async(function () {
        this.dequeue(async())
    }, function (value) {
        if (this.endOfStream) {
            return [ loop.break ]
        }
        var vargs = [ value ]
        if (asynchronous) {
            vargs.push(async())
        }
        next.apply(vargs)
    })()
})

Consumer.prototype.pump = function (next) {
    this._pump(next, abend)
}

Consumer.prototype.duplicate = function () {
    return new Consumer(this._procession, this.node)
}

Consumer.prototype.peek = function () {
    return this.node.next && this.node.next.value
}

module.exports = Consumer
