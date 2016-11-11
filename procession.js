var Consumer = require('./consumer')
var cadence = require('cadence')

function Procession () {
    this._consumers = []
    this._head = { next: null }
}

Procession.prototype.createConsumer = function () {
    var consumer =  new Consumer(this, this._head)
    this._consumers.push(consumer)
    return consumer
}

Procession.prototype.push = function (value) {
    this._head = this._head.next = { value: value, next: null }
    for (var i = 0, I = this._consumers.length; i < I;) {
        if (this._consumers[i].destroyed) {
            this._consumers.splice(i, 1)
            I--
        } else {
            this._consumers[i++]._nudge()
        }
    }
}

Procession.prototype.join = cadence(function (async, condition) {
    var consumer = this.createConsumer()
    async(function () {
        consumer.join(condition, async())
    }, function (value) {
        consumer.destroy()
        return [ value ]
    })
})

module.exports = Procession
