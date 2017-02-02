var abend = require('abend')
var Operation = require('operation')
var assert = require('assert')
var cadence = require('cadence')
var Node = require('./node')

var Envelope = require('./envelope')

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
        if (value != null) {
            return [ loop.break, value ]
        }
        this._wait = this._procession.pushed.enter(async())
    })()
})

Shifter.prototype.get = cadence(function (async, endOfStreamAsError) {
    var loop = async(function () {
        this._wait = null
        var value = this.shift()
        if (value == null) {
            this._wait = this._procession.pushed.enter(async())
        } else {
            switch (envelope.method) {
            case 'endOfStream':
                throw interrupt('endOfStream')
                break
            case 'error':
                throw envelope.body
                break
            case 'entry':
                return [ loop.break, value ]
                break
            }
        }
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
        this.endOfStream = this.node.body.endOfStream
        var body = this.node.body
        this._procession._shifted(this.node)
        return body
    }
    return null
}

Shifter.prototype.destroy = function (value) {
    this._purge()
    this._pumper = new Pumper(function () {})
    this.endOfStream = true
    this.node = new Node(this._procession, null, new Envelope('endOfStream', null), null)
    if (this._wait != null) {
        this._procession.pushed.leave(this._wait)()
    }
    this._procession._consumers.splice(this._procession._consumers.indexOf(this), 1)
}

Shifter.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.dequeue(async())
    }, function (envelope) {
        switch (envelope.method) {
        case 'endOfStream':
            throw interrupt('endOfStream')
        case 'error':
            throw envelope.body
        case 'entry':
            if (condition(envelope.body)) {
                return [ loop.break, envelope ]
            }
            break
        }
    })()
})

function Pumper (operation) {
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
    this._asynchronous = asynchronous
    this._operation = new Operation(operation)
}

Pumper.prototype.enqueue = cadence(function (async, body) {
    async(function () {
        var vargs = [ body ]
        if (this._asynchronous) {
            vargs.push(async())
        }
        this._operation.apply(vargs)
    }, function () {
        return [ body ]
    })
})

Shifter.prototype._pump = cadence(function (async, next) {
    this._pumper = new Pumper(next)
    var loop = async(function (envelope) {
        if (envelope.terminal) {
            return [ loop.break ]
        }
        this.dequeue(async())
    }, function (body) {
        this._pumper.enqueue(body, async())
    })({ terminal: false })
})

Shifter.prototype.pump = function (next) {
    this._pump(next, abend)
    return next
}

Shifter.prototype.consumer = function () {
    return new Shifter(this._procession, this.node)
}

Shifter.prototype.peek = function () {
    return this.node.next && this.node.next.body.body
}

module.exports = Shifter
