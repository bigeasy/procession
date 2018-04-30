// Node.js API.
var assert = require('assert')

// Contextualized callbacks and event handlers.
var Operation = require('operation/variadic')

// Control-flow libraries.
var cadence = require('cadence')

var abend = require('abend')

// Do nothing.
var noop = require('nop')

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

Shifter.prototype.pumpify = function () {
    var shifter = this.shifter()
    shifter._pump(Array.prototype.slice.call(arguments))
    return shifter
}

// You where confused. You created a generic pumping function that would take
// values from a shifter and submit them to any error-first callback function.
// That error-first callback function could error, so you felt that you needed
// to have controlled error handling. You could not just give it to `abend`.
// This is true and useful for all the Conduit classes that read the shifter and
// respond to events. It is not true for the common case of moving messages from
// one procession another procession. We know that this is going to be an error
// free and synchronous operation. We can use `abend`. Requiring that the user
// handle an error here, when there will never be one, is silly, but it also
// means that the user now has to listen and if they are waiting for the end,
// they have to ensure that all shifters shutdown, so all shifters have to get
// an end-of-stream or else they are to be explicitly destroyed. This is a fine
// academic exercise at some point, but not now. Who cares that the link between
// two processions terminates correctly with an end-of-stream. We can leave them
// linked and waiting when we exit the program.
//
// Upshot is that a push of a message from one procession to another is not a
// first-class error-first callback stack. We're only using Cadence here because
// the pump is already implemented for use elsewhere as a first-class
// error-first-callback stack. We could just have a listener function that takes
// the new message as a push or else checks the `shift` function. Nothing
// error-first about it.

//
Shifter.prototype._pump = function (vargs) {
    var terminate
    if (
        vargs.length == 1 &&
        typeof vargs[0] == 'object' &&
        vargs[0].constructor.name == 'Procession' &&
        typeof vargs[0].enqueue == 'function'
    ) {
        this._pump([ vargs[0], 'enqueue', abend ])
    } else {
        if (typeof vargs[0] == 'boolean') {
            terminate = vargs.shift()
        } else {
            terminate = true
        }
        // TODO If it is just a function, can `Operation` return as is?
        var operation = Operation(vargs)
        if (operation.length == 2) {
            this.__pump(terminate, operation, vargs.shift())
        } else {
            this._pump([ terminate, function (value, callback) {
                operation.call(null, value)
                callback()
            }, vargs.shift() ])
        }
    }
}

Shifter.prototype.__pump = cadence(function (async, terminate, operation) {
    async(function () {
        var loop = async(function () {
            this.dequeue(async())
        }, function (value) {
            if (value == null) {
                return [ loop.break ]
            }
            operation.call(null, value, async())
        })()
    }, function () {
        if (terminate && !this.destroyed) {
            operation.call(null, null, async())
        }
    })
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
        if (value == null || condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Shifter.prototype.shifter = function () {
    return new Shifter(this.procession, this.node, Array.prototype.slice.call(arguments))
}

Shifter.prototype.peek = function () {
    return this.node.next && this.node.next.body
}

module.exports = Shifter
