// Node.js API.
var assert = require('assert')

// Contextualized callbacks and event handlers.
var Operation = require('operation/variadic')

// Control-flow libraries.
var cadence = require('cadence')

// Do nothing.
var noop = require('nop')

var interrupt = require('interrupt').createInterrupter('procession')

var Pumper = require('./pumper')

function Shifter (procession, head, vargs) {
    this.node = head
    this.endOfStream = false
    this._operation = vargs.length ? Operation(vargs) : noop
    this.procession = procession
}

Shifter.prototype.dequeue = cadence(function (async) {
    var loop = async(function () {
        this._wait = null
        var value = this.shift()
        if (value != null || this.endOfStream) {
            return [ loop.break, value ]
        }
        this._wait = this.procession.pushed.wait(async())
    })()
})

Shifter.prototype.shift = function () {
    if (!this.endOfStream && this.node.next) {
        this.node = this.node.next
        this.endOfStream = this.node.body == null
        var body = this.node.body
        this._operation.call(null, this.node)
        return body
    }
    return null
}

Shifter.prototype.destroy = function (value) {
    if (!this.destroyed) {
        this.destroyed = true
        this.endOfStream = true
        this.node = { body: null, next: null }
        if (this._wait != null) {
            this.procession.pushed.cancel(this._wait)()
        }
    }
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

Shifter.prototype.pump = function () {
    return new Pumper(this, Array.prototype.slice.call(arguments))
}

Shifter.prototype.shifter = function () {
    return new Shifter(this.procession, this.node, Array.prototype.slice.call(arguments))
}

Shifter.prototype.peek = function () {
    return this.node.next && this.node.next.body
}

module.exports = Shifter
