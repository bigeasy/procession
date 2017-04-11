var abend = require('abend')
var Operation = require('operation/variadic')
var assert = require('assert')
var cadence = require('cadence')
var Node = require('./node')

var interrupt = require('interrupt').createInterrupter('procession')

function Shifter (procession, head) {
    this.node = head
    this._procession = procession
    this._procession._shifters.push(this)
    this.endOfStream = false
    this._consumers = []
}

Shifter.prototype.dequeue = cadence(function (async) {
    var loop = async(function () {
        this._wait = null
        var value = this.shift()
        if (value != null || this.endOfStream) {
            return [ loop.break, value ]
        }
        this._wait = this._procession.pushed.wait(async())
    })()
})

Shifter.prototype._purge = function () {
    while (this.node.next) {
        this._procession._shifted(this.node = this.node.next)
    }
}

Shifter.prototype.shift = function () {
    if (!this.endOfStream && this.node.next) {
        this.node = this.node.next
        this.endOfStream = this.node.body == null
        var body = this.node.body
        this._procession._shifted(this.node)
        return body
    }
    return null
}

Shifter.prototype.destroy = function (value) {
    this._purge()
    // We do this so that we do not pump the end of stream, we assume that
    // destroy means to quit without continuning to take any actions.
    this._consumers = []
    this.endOfStream = true
    this.node = new Node(this._procession, null, null, null)
    if (this._wait != null) {
        this._procession.pushed.cancel(this._wait)()
    }
    this._procession._shifters.splice(this._procession._shifters.indexOf(this), 1)
}

Shifter.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.dequeue(async())
    }, function (value) {
        if (condition(value)) {
            return [ loop.break, value ]
        } else if (value == null) {
            throw interrupt('endOfStream')
        }
    })()
})

// The destroy method will cause the pumping to stop. When dequeue is hit again
// it will return `null` because it will be end of stream. `_consumers` will be
// an empty array so that null will not be forwarded.

//
Shifter.prototype._pump = cadence(function (async, body) {
    var loop = async(function (value) {
        this.dequeue(async())
    }, function (value) {
        async(function () {
            assert(!this._wait)
            async.forEach(function (consumer) {
                consumer(value, async())
            })(this._consumers)
        }, function () {
            if (value == null) {
                return [ loop.break ]
            }
        })
    })({})
})

function operator (vargs, maybeProcession) {
    return { operation: operation, asynchronous: asynchronous }
}

// Further use of Operation variadic.

//
Shifter.prototype.pump = function () {
    var asynchronous = false
    var vargs = Array.prototype.slice.call(arguments)
    var options = {}
    while (vargs.length != 0) {
        var operation = Operation(vargs)
        var consumer = operation.length == 2
                     ? operation
                     : function (value, callback) {
                           operation(value)
                           callback()
                       }
        this._consumers.push(consumer)
    }
    this._pump(abend)
}

Shifter.prototype.shifter = function () {
    return new Shifter(this._procession, this.node)
}

Shifter.prototype.peek = function () {
    return this.node.next && this.node.next.body
}

module.exports = Shifter
