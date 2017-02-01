var assert = require('assert')

var cadence = require('cadence')
var abend = require('abend')

var Operation = require('operation')

var Vestibule = require('vestibule')

var Identifier = require('./identifier')
var Shifter = require('./shifter')
var Node = require('./node')
var Deferred = require('./deferred')
var Counter = require('./counter')

var Destructor = require('nascent.destructor')

var interrupt = require('interrupt').createInterrupter('procession')

// Public Procession constructor.
function Procession (options) {
    options || (options = {})

    this._listeners = []
    this._undecorated = []
    this._consumers = []

    this._identifier = new Identifier

    this.head = new Node(this, 'reference', null, null, null)

    this.pushed = new Vestibule
    this.shifted = new Vestibule

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
        if (value == null) {
            return
        }
        throw interrupt('closed')
    }
    if (value instanceof Error) {
        // If this is an error, we can go ahead add the end of stream `null` to
        // ensure that this closes correctly. Simplifies interface on error, the
        // user doens't have to remember to send null themselves. They're not
        // able to send values after error.
        this._consumers.forEach(function (shifter) {
            shifter._purge()
        }, this)
        this.head = this.head.next = new Node(this, 'error', id, value, null)
        value = null
    }
    if (value == null) {
        // If null, we are at th end of stream.
        this.head = this.head.next = new Node(this, 'end', id, null, null)
        this.endOfStream = true
    } else {
        // Otherwise, add the entry and notify listeners.
        id = this._identifier.next()
        this.head = this.head.next = new Node(this, 'entry', id, value, null)
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
    if (node.type != 'entry') {
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
