var cadence = require('cadence')

function Consumer (head) {
    this._head = head
}

Consumer.prototype.shift = function (callback) {
    if (this._head.next) {
        this._head = this._head.next
        callback(null, this._head.value)
    } else {
        this._callback = callback
    }
}

Consumer.prototype.destroy = function () {
    this.destroyed = true
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
        this._head = this._head.next
        setImmediate(callback, null, this._head.value)
    }
}

module.exports = Consumer
