var Operation = require('operation')
var cadence = require('cadence')
var abend = require('abend')

function Synchronous (iterators, head) {
    this.head = head
    this._next = iterators._next
    this._previous = iterators
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

Synchronous.prototype._nudge = function () {
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

function Asynchronous (iterators, head) {
    this.head = head
    this._next = iterators._next
    this._previous = iterators
    this._next._previous = this
    this._previous._next = this
}

Asynchronous.prototype.shift = function (callback) {
    if (this.head.next) {
        this.head = this.head.next
        callback(null, this.head.value)
    } else {
        this._callback = callback
    }
}

Asynchronous.prototype.destroy = function () {
    this._previous._next = this._next
    this._next._previous = this._previous
}

Asynchronous.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.shift(async())
    }, function (value) {
        if (condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Asynchronous.prototype._nudge = function () {
    if (this._callback != null) {
        var callback = [ this._callback, this._callback = null ][0]
        this.head = this.head.next
        setImmediate(callback, null, this.head.value)
    }
}

Asynchronous.prototype._pump = cadence(function (async, next) {
    if (typeof next == 'object' && typeof next.push == 'function') {
        next = { object: next, method: 'push' }
    }
    next = new Operation(next)
    var loop = async(function () {
        this.shift(async())
    }, function (message) {
        next.apply([ message ])
    })
})

Asynchronous.prototype.pump = function (next) {
    this._pump(next, abend)
}

Asynchronous.prototype.async = function () {
    return new Asynchronous(this, this.head)
}

Asynchronous.prototype.sync = function () {
    return new Synchronous(this, this.head)
}


function Procession () {
    this._iterators = {}
    this._iterators._previous = this._iterators._next = this._iterators
    this.head = { next: null }
}

Procession.prototype.async = function () {
    return new Asynchronous(this._iterators, this.head)
}

Procession.prototype.sync = function () {
    return new Synchronous(this._iterators, this.head)
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
