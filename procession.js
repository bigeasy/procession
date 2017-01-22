var Operation = require('operation')
var cadence = require('cadence')
var abend = require('abend')
var Identifier = require('./identifier')
var Consumer = require('./consumer')
var Node = require('./node')
var Vestibule = require('vestibule')
var Deferred = require('./deferred')
var Counter = require('./counter')

function Procession (options) {
    options || (options = {})
    this._listeners = []
    this._undecorated = []
    this._consumers = []
    this._identifier = new Identifier
    this.pushed = new Vestibule
    this.shifted = new Vestibule
    this.head = new Node(this, this._identifier.next(), null, null)
    this._property = options.property || 'size'
    this.addListener(new Counter())
    this._follower = this.consumer()
    this.EndOfStream = Procession.EndOfStream
}

Procession.EndOfStream = { derp: 1 }

// TODO Add a decorator that will ensure that the listener is only activated for
// values greater than the least value, the current value of the head. Once the
// older values are shifted, the decorator is removed.
Procession.prototype.addListener = function (listener) {
    listener.added(this)
    this._undecorated.push(listener)
    this._listeners.push(new Deferred(this, listener))
}

Procession.prototype.removeListener = function (listener) {
    var index = this._undecorated.indexOf(this)
    this._undecorated.splice(index, 1)
    this._listeners.splice(index, 1)
    listener.removed(procession)
}

Procession.prototype.consumer = function () {
    return new Consumer(this, this.head)
}

Procession.prototype.push = function (value) {
    this.head = this.head.next = new Node(this, this._identifier.next(), value, null)
    for (var i = 0, I = this._listeners.length; i < I; i++) {
        this._listeners[i].pushed(this, this.head)
    }
    this.pushed.notify(null, true)
    this._follower.shift()
}

Procession.prototype._shifted = function (node) {
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
        // node.id = null No! Defer uses this. It is a boundry we must maintain.
        node.value = null
        this.shifted.notify(null, true)
    }
}

Procession.prototype.enqueue = cadence(function (async, value) {
    this.push(value)
})

Procession.prototype.join = cadence(function (async, condition) {
    var consumer = this.consumer()
    async(function () {
        consumer.join(condition, async())
    }, function (value) {
        consumer.destroy()
        return [ value ]
    })
})

Procession.prototype.pump = function (next) {
    return this.consumer().pump(next)
}

module.exports = Procession
