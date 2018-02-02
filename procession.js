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

// TODO Now there is a circular dependency!
// Orderly destruction of complicated objects.
// var Destructor = require('destructible')

// Exceptions with context.
var interrupt = require('interrupt').createInterrupter('procession')

// Construct a queue.

//
function Procession () {
    this.head = { body: null, next: null }
    this.pushed = new Signal
}

// Create a new shifter to consume enqueued entries. Begins with entries added
// after the creation of the cosumer.
// <hr>

//
Procession.prototype.shifter = function () {
    return new Shifter(this, this.head, Array.prototype.slice.call(arguments))
}

// Push an entry or push an error or else push `null` to indicate end of stream.

//
Procession.prototype.push = function (value) {
    // You can only push an end of stream `null` after end of stream.
    if (this.endOfStream) {
        return
    }
    if (value == null) {
        this.head = this.head.next = { body: null, next: null }
        this.endOfStream = true
    } else {
        // Otherwise, add the entry and notify listeners.
        this.head = this.head.next = { body: value, next: null }
    }
    // Notify any waiting shifters, or anyone else waiting on a push.
    this.pushed.notify()
}

Procession.prototype.enqueue = function (value, callback) {
    this.push(value)
    callback()
}

module.exports = Procession
