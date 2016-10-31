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

Consumer.prototype._nudge = function () {
    if (this._callback != null) {
        var callback = [ this._callback, this._callback = null ][0]
        this._head = this._head.next
        callback(null, this._head.value)
    }
}

module.exports = Consumer
