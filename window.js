// Node.js API.
var assert = require('assert')
var util = require('util')

var Procession = require('./procession')
var Deferred = require('./deferred')

var abend = require('abend')

function Window () {
    Procession.call(this)
    this.trailer = this.shifter(this, '_shift')
    this._header = this.shifter()
    this._undecorated = []
    this._listeners = []
    this._header.pump(this, '_push')
}
util.inherits(Window, Procession)

// Add a listener that can track values as they are enqueued and dequeued. The
// listener's push and shift methods  will only be invoked for values enqueued
// after it is added to to the procession.
// <hr>

//

// We decorate the listener with a deferred decorator. We keep a parallel arrays
// of undecorated listeners do we can find its array index if we're asked to
// remove it before it undecorates itself.
Window.prototype.addListener = function (listener) {
    this._undecorated.push(listener)
    this._listeners.push(new Deferred(this._listeners, listener))
}

// Remove a listener.
// <hr>

//
Window.prototype.removeListener = function (listener) {
    var index = this._undecorated.indexOf(this)
    this._undecorated.splice(index, 1)
    this._listeners.splice(index, 1)
}

Window.prototype._push = function (value) {
    if (value != null) {
        assert(this._header.node == this.head)
        for (var i = 0, I = this._listeners.length; i < I; i++) {
            this._listeners[i].pushed(this._header.node)
        }
    }
}

Window.prototype._shift = function (node) {
    if (node.body != null) {
        for (var i = 0, I = this._listeners.length; i < I; i++) {
            this._listeners[i].shifted(node)
        }
    }
}

module.exports = Window
