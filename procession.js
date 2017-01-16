var Operation = require('operation')
var cadence = require('cadence')
var abend = require('abend')

function Memento (iterators, head) {
    this.head = head
    this._next = iterators._next
    this._previous = iterators
    this._next._previous = this
    this._previous._next = this
}

Memento.prototype.shift = function (callback) {
    if (this.head.next) {
        this.head = this.head.next
        return this.head.value
    }
    return null
}

Memento.prototype._nudge = function () {
}

Memento.prototype.destroy = function () {
    this._previous._next = this._next
    this._next._previous = this._previous
}

Memento.prototype.consumer = function () {
    return new Consumer(this, this.head)
}

Memento.prototype.memento = function () {
    return new Memento(this, this.head)
}

function Consumer (iterators, head) {
    this.head = head
    this._next = iterators._next
    this._previous = iterators
    this._next._previous = this
    this._previous._next = this
}

Consumer.prototype.shift = function (callback) {
    if (this.head.next) {
        this.head = this.head.next
        callback(null, this.head.value)
    } else {
        this._callback = callback
    }
}

Consumer.prototype.destroy = function () {
    this._previous._next = this._next
    this._next._previous = this._previous
}

Consumer.prototype.join = cadence(function (async, condition) {
    var loop = async(function () {
        this.shift(async())
    }, function (value) {
        if (condition(value)) {
            return [ loop.break, value ]
        }
    })()
})

Consumer.prototype._nudge = function () {
    if (this._callback != null) {
        var callback = [ this._callback, this._callback = null ][0]
        this.head = this.head.next
        setImmediate(callback, null, this.head.value)
    }
}

Consumer.prototype._pump = cadence(function (async, next) {
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

Consumer.prototype.pump = function (next) {
    this._pump(next, abend)
}

Consumer.prototype.consumer = function () {
    return new Consumer(this, this.head)
}

Consumer.prototype.memento = function () {
    return new Memento(this, this.head)
}


function Procession () {
    this._iterators = {}
    this._iterators._previous = this._iterators._next = this._iterators
    this.head = { next: null }
}

Procession.prototype.consumer = function () {
    return new Consumer(this._iterators, this.head)
}

Procession.prototype.memento = function () {
    return new Memento(this._iterators, this.head)
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
    var consumer = this.consumer()
    async(function () {
        consumer.join(condition, async())
    }, function (value) {
        consumer.destroy()
        return [ value ]
    })
})

module.exports = Procession
