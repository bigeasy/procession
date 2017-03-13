// One thing to note in the documentation is that this Queue and all my envelope
// based classes are unapologetically partial to `switch` statements. There
// are probably some articles out there about how they are considered harmful
// and how opaque and esoteric function dispatch lookup tables are superior.
// What is the nature of that reasoning? Because `goto` was harmful, other
// keywords are looking pretty shady now too?

// Common utilities.
var assert = require('assert')
var nop = require('nop')

// Control-flow utilities.
var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('extant')

// User specified callback wrapper.
var Operation = require('operation')

// Evented semaphore.
var Signal = require('signal')

// Serial value that wraps at `0xffffffff`.
var Identifier = require('./identifier')

// Iterator used to consume values in the evented queue.
var Shifter = require('./shifter')

// Queue entry node.
var Node = require('./node')

// Delays the invocation of a listener's `shifted` method until a node created
// after the listener was added is shifted.
var Deferred = require('./deferred')

// A listener that keeps count of the values in the queue.
var Counter = require('./counter')

// TODO Now there is a circular dependency!
// Orderly destruction of complicated objects.
// var Destructor = require('destructible')

// Exceptions with context.
var interrupt = require('interrupt').createInterrupter('procession')

// Construct a queue.

//
function Procession () {
    this._listeners = []
    this._undecorated = []
    this._consumers = []

    this._identifier = new Identifier

    this.head = new Node(this, this._identifier.next(), null, null)

    this.pushed = new Signal
    this.shifted = new Signal

    this.heft = null
    this.count = 0
    this.limit = 32

    this._backlog = []

    this.addListener(new Counter())

    this._follower = this.shifter()
}

// Node and Shifter modules reference each other so we provide this Shifter
// constructor to the Node class since it won't be able to git it using
// `require`.
// <hr>

//
Procession.prototype._Shifter = Shifter

// Add a listener that can track values as they are enqueued and dequeued. The
// listener's push and shift methods  will only be invoked for values enqueued
// after it is added to to the procession.
// <hr>

//

// We decorate the listener with a deferred decorator. We keep a parallel arrays
// of undecorated listeners do we can find its array index if we're asked to
// remove it before it undecorates itself.
Procession.prototype.addListener = function (listener) {
    listener.added(this)
    this._undecorated.push(listener)
    this._listeners.push(new Deferred(this, listener))
}

// Remove a listener.
// <hr>

//
Procession.prototype.removeListener = function (listener) {
    var index = this._undecorated.indexOf(this)
    this._undecorated.splice(index, 1)
    this._listeners.splice(index, 1)
    listener.removed(this)
}

// Create a new shifter to consume enqueued entries. Begins with entries added
// after the creation of the cosumer.
// <hr>

//
Procession.prototype.shifter = function () {
    return new Shifter(this, this.head)
}

// Push an entry or push an error or else push `null` to indicate end of stream.

//
Procession.prototype.push = function (value) {
    // You can only push an end of stream `null` after end of stream.
    if (this.endOfStream) {
        return
    }
    if (value == null) {
        this.head = this.head.next = new Node(this, null, value, null)
        this.endOfStream = true
    } else {
        // Otherwise, add the entry and notify listeners.
        this.head = this.head.next = new Node(this, this._identifier.next(), value, null)
        for (var i = 0, I = this._listeners.length; i < I; i++) {
            this._listeners[i].pushed(this, this.head)
        }
    }
    // Notify any waiting consumers, or anyone else waiting on a push.
    this.pushed.notify(null, true)
    // Shift our dummy shifter to trigger cleanup if no one else is listening.
    this._follower.shift()
}

// Called by Consumers as they advance.

//
Procession.prototype._shifted = function (node) {
    if (node.body == null) {
        return
    }
    var lesser = 0
    for (var i = 0, I = this._consumers.length; i < I; i++) {
        if (this._identifier.compare(this._consumers[i].node.id, node.id) < 0) {
            lesser++
        }
    }
    if (lesser == 0) {
        for (var i = 0, I = this._listeners.length; i < I; i++) {
            this._listeners[i].shifted(this, node)
        }
        // We null `body`, but do not get the bright idea to null `id`. It is
        // our deferred listener boundary.
        node.value = null
        this.shifted.notify(null, true)
    }
}

Procession.prototype._enqueue = function () {
    if (coalesce(this.heft, this.size) < this.limit) {
        var backlog = this._backlog.shift()
        this.push(backlog.value)
        this.callback.call(null)
    } else if (this._backlog.length != 0) {
        his.shifted.wait(this._enqueue.bind(this))
    }
}

Procession.prototype.enqueue = function (value, callback) {
    if (coalesce(this.heft, this.size) >= this.limit) {
        this._backlog.push({
            callback: coalesce(callback, nop),
            value: value
        })
        if (this._backlog.length == 1) {
            this.shifted.wait(this._enqueue.bind(this))
        }
    } else {
        this.push(value)
        callback()
    }
}

Procession.prototype.join = cadence(function (async, condition) {
    var shifter = this.shifter()
    async(function () {
        shifter.join(condition, async())
    }, function (value) {
        shifter.destroy()
        return [ value ]
    })
})

Procession.prototype.pump = function (next) {
    return this.shifter().pump(next)
}

module.exports = Procession
