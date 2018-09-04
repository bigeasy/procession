// One thing to note in the documentation is that this Queue and all my envelope
// based classes are unapologetically partial to `switch` statements. There are
// probably some articles out there about how they are considered harmful and
// how opaque and esoteric function dispatch lookup tables are superior. What is
// the nature of that reasoning? Because `goto` was harmful, other keywords are
// looking pretty shady now too?

// Common utilities.
var assert = require('assert')
var nop = require('nop')

// Control-flow utilities.
var cadence = require('cadence')
var coalesce = require('extant')

// Evented semaphore.
var Signal = require('signal')

// Iterator used to consume values in the evented queue.
var Shifter = require('./shifter')

// Construct a queue.

//
function Procession () {
    this.head = { body: null, next: null }
    this.pushed = new Signal
}

// Create a new shifter to consume enqueued entries. Begins with entries added
// after the creation of the consumer.
// <hr>

//
Procession.prototype.shifter = function () {
    return new Shifter(this, this.head, Array.prototype.slice.call(arguments))
}

Procession.prototype.pump = function () {
    var shifter = this.shifter()
    shifter._pump(Array.prototype.slice.call(arguments))
    return shifter
}

// Push an entry or push an error or else push `null` to indicate end of stream.

//
Procession.prototype.push = function (value) {
    if (value == null) {
        this.head = this.head.next = { body: null, next: null }
    } else {
        // Otherwise, add the entry and notify listeners.
        this.head = this.head.next = { body: value, next: null }
    }
    // Notify any waiting shifters, or anyone else waiting on a push.
    this.pushed.notify()
}

Procession.prototype.end = function () {
    this.push(null)
}

Procession.prototype.enqueue = function (value, callback) {
    this.push(value)
    callback()
}

module.exports = Procession
