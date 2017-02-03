// One thing to note in the documentation is that this Queue and all my envelope
// based classes are unapologetically partial to `switch` statements. There
// are probably some articles out there about how they are considered harmful
// and how opaque and esoteric function dispatch lookup tables are superior.
// What is the nature of that reasoning? Because `goto` was harmful, other
// keywords are looking pretty shady now too?

// Control-flow utilities.
var abend = require('abend')
var cadence = require('cadence')

// User specified callback wrapper.
var Operation = require('operation')

// Evented semaphore.
var Signal = require('signal')

// Serial value that wraps at `0xffffffff`.
var Identifier = require('./identifier')

// Used to provide a switchable wrapper around queue entry values.
var Envelope = require('./envelope')

// Iterator used to consume values in the evented queue.
var Shifter = require('./shifter')

// Queue entry node.
var Node = require('./node')

// Delays the invocation of a listener's `shifted` method until a node created
// after the listener was added is shifted.
var Deferred = require('./deferred')

// A listener that keeps count of the values in the queue.
var Counter = require('./counter')

// Orderly destruction of complicated objects.
var Destructor = require('nascent.destructor')

// Exceptions with context.
var interrupt = require('interrupt').createInterrupter('procession')

// Construct a queue.

//
function Procession () {
    this._listeners = []
    this._undecorated = []
    this._consumers = []

    this._identifier = new Identifier

    this.head = new Node(this, null, null, null)

    this.pushed = new Signal
    this.shifted = new Signal

    this.addListener(new Counter())

    this._follower = this.shifter()
}

// Node and Shifter modules reference each other so we provide this Shifter
// constructor to the Node class since it won't be able to git it using
// `require`.
// <hr>

//
Procession.prototype._Shifter = Shifter

Procession.raiseError = function (envelope) {
    if (envelope.method == 'error') {
        throw envelope.body
    }
}

Procession.raiseEndOfStream = function (envelope) {
    if (envelope == null || envelope.method == 'endOfStream') {
        throw interrupt('endOfStream')
    }
}

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

// Interface development. Currently, you push en entry, an error or a `null` to
// indicate end of stream. Simpifies enqueuing. Simplifies pipes because they
// can get a switch statement and can tell the difference between an error and
// `null`.

// Push a value
//
// The values that are shifted are not the values that are pushed. See below.

// The shifted value is going to be encased in an object that can be used to
// create a swtich statement. non

//
Procession.prototype.push = function (value) {
    // You can only push an end of stream `null` after end of stream.
    var id = null
    if (this.endOfStream) {
        return null
    }
    var envelope = value
    if (!(value instanceof Envelope)) {
        if (value == null) {
            envelope = new Envelope('endOfStream', null, interrupt('endOfStream'))
        } else if (value instanceof Error) {
            envelope = new Envelope('error', value, value)
        }  else {
            envelope = new Envelope('entry', value, null)
        }
    }
    switch (envelope.method) {
    case 'endOfStream':
        this.head = this.head.next = new Node(this, id, envelope, null)
        this.endOfStream = true
        break
    case 'error':
        // If this is an error, we can go ahead add the end of stream `null` to
        // ensure that this closes correctly. Simplifies interface on error, the
        // user doens't have to remember to send null themselves. They're not
        // able to send values after error.
        this._consumers.forEach(function (shifter) {
            shifter._purge()
        }, this)
        var envelope = new Envelope('error', value)
        this.head = this.head.next = new Node(this, id, envelope, null)
        break
    case 'entry':
        // Otherwise, add the entry and notify listeners.
        id = this._identifier.next()
        this.head = this.head.next = new Node(this, id, envelope, null)
        for (var i = 0, I = this._listeners.length; i < I; i++) {
            this._listeners[i].pushed(this, this.head)
        }
        break
    }
    // Notify any waiting consumers, or anyone else waiting on a push.
    this.pushed.notify(null, true)
    // Shift our dummy shifter to trigger cleanup if no one else is listening.
    this._follower.shift()
}

// Called by Consumers as they advance.

//
Procession.prototype._shifted = function (node) {
    if (node.body.method != 'entry') {
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

Procession.prototype.enqueue = cadence(function (async, value) {
    this.push(value)
    return []
})

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
