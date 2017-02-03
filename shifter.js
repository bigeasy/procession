var abend = require('abend')
var Operation = require('operation')
var assert = require('assert')
var cadence = require('cadence')
var Node = require('./node')

var interrupt = require('interrupt').createInterrupter('conduit')

function Shifter (procession, head) {
    this.node = head
    this._procession = procession
    this._procession._consumers.push(this)
    this.endOfStream = false
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
    this._consumer = function (vargs, callback) { callback() }
    this.endOfStream = true
    this.node = new Node(this._procession, null, null, null)
    if (this._wait != null) {
        this._procession.pushed.cancel(this._wait)()
    }
    this._procession._consumers.splice(this._procession._consumers.indexOf(this), 1)
}

Shifter.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.dequeue(async())
    }, function (value) {
        if (value == null) {
            throw interrupt('endOfStream')
        }
        if (condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Shifter.prototype._pump = cadence(function (async, body) {
    var loop = async(function (value) {
        this.dequeue(async())
    }, function (value) {
        async(function () {
            if (this._wait) throw new Error
            this._consumer.call(null, [ value, async() ])
        }, function () {
            if (value == null) {
                return [ loop.break ]
            }
        })
    })({})
})

Shifter.prototype.pump = function (operation) {
    var asynchronous = false
    switch (typeof operation) {
    case 'object':
        if (typeof operation.enqueue == 'function') {
            asynchronous = true
            operation = { object: operation, method: 'enqueue' }
        } else {
            operation = { object: operation, method: 'push' }
        }
        break
    case 'function':
        asynchronous = operation.length == 2
        break
    }
    operation = new Operation(operation)
    if (asynchronous) {
        this._consumer = operation.apply.bind(operation)
    } else {
        this._consumer = function (vargs) {
            operation.apply(vargs[0])
            vargs[1]()
        }
    }
    this._pump(abend)
    return operation
}

Shifter.prototype.consumer = function () {
    return new Shifter(this._procession, this.node)
}

Shifter.prototype.peek = function () {
    return this.node.next && this.node.next.body
}

module.exports = Shifter
