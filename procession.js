var Consumer = require('./consumer')
var cadence = require('cadence')

function Procession () {
    this._consumers = {}
    this._consumers._previous = this._consumers._next = this._consumers
    this.head = { next: null }
}

Procession.prototype.createConsumer = function () {
    var consumer =  new Consumer(this, this.head)
    consumer._next = this._consumers._next
    consumer._previous = this._consumers
    consumer._next._previous = consumer
    consumer._previous._next = consumer
    return consumer
}

Procession.prototype.push = function (value) {
    this.head = this.head.next = { value: value, next: null }
    var consumer = this._consumers
    while (consumer._next !== this._consumers) {
        consumer = consumer._next
        consumer._nudge()
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
