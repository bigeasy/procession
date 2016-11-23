var Operation = require('operation')
var cadence = require('cadence')
var abend = require('abend')
var Asynchronous = require('./asynchronous')

function Synchronous (iterators, head) {
    this.head = head
    this.next = iterators.next
    this.previous = iterators
    this._next._previous = this
    this._previous._next = this
}

Synchronous.prototype.shift = function (callback) {
    if (this.head.next) {
        this.head = this.head.next
        return this.head.value
    }
    return null
}

Synchronous.prototype.destroy = function () {
    this._previous._next = this._next
    this._next._previous = this._previous
}

Synchronous.prototype.async = function () {
    return new Asynchronous(this, this.head)
}

Synchronous.prototype.sync = function () {
    return new Synchronous(this, this.head)
}

module.exports = Synchronous
