var Asynchronous = require('./asynchronous')
var cadence = require('cadence')

function Procession () {
    this._iterators = {}
    this._iterators._previous = this._iterators._next = this._iterators
    this.head = { next: null }
}

Procession.prototype.async = function () {
    return new Asynchronous(this._iterators, this.head)
}

Procession.prototype.push = function (value) {
    this.head = this.head.next = { value: value, next: null }
    var iterator = this._iterators
    while (iterator._next !== this._iterators) {
        iterator = iterator._next
        iterator._nudge()
    }
}

Procession.prototype.join = cadence(function (async, condition) {
    var iterator = this.async()
    async(function () {
        iterator.join(condition, async())
    }, function (value) {
        iterator.destroy()
        return [ value ]
    })
})

module.exports = Procession
