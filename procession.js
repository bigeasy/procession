var Consumer = require('./consumer')

function Procession () {
    this._consumers = []
    this._head = { next: null }
}

Procession.prototype.createConsumer = function () {
    var consumer =  new Consumer(this._head)
    this._consumers.push(consumer)
    return consumer
}

Procession.prototype.push = function (value) {
    this._head = this._head.next = { value: value, next: null }
    for (var i = 0, I = this._consumers.length; i < I; i++) {
        this._consumers[i]._nudge()
    }
}

module.exports = Procession
