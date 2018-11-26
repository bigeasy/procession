var cadence = require('cadence')
var operation = require('operation')

function Pump () {
    var dequeueable, vargs
    if (Array.isArray(arguments[0])) {
        dequeueable = arguments[0][0]
        vargs = arguments[0][1]
    } else {
        vargs = []
        vargs.push.apply(vargs, arguments)
        dequeueable = vargs.shift()
    }
    var f = operation.shift(vargs)
    this._enqueue = f.length == 2 ? f : function (value, callback) {
        f(value)
        callback()
    }
    this._dequeueable = dequeueable
}

/*
shifter.pump(this, '_enqueue'), 'destructible'

shifter.pump(this, '_enqueue').run(async())

destructible.monitor('inbox', shifter.pump(this, '_enqueue').destructible(), null)

destructible.monitor('inbox', shifter.pump(this, '_enqueue'), 'destructible', null)

destructible.destroyable('pump', new Pump(conduit.inbox.shifter(), this, '_enqueue').destructible())
destructible.destroyable('pump', conduit.inbox.pump(this, '_enqueue'))

destructible.monitor('inbox', Pump.dequeuable, conduit.inbox, this, '_enqueue', null)

destructible.destroyable('outbox', this, function (callback) {
}, null)

shifter.link(outbox)
*/

Pump.prototype.destroy = function () {
    this._dequeueable.destroy()
}

Pump.prototype.run = function (callback) {
    this._run(callback)
    return this
}

Pump.prototype._run = cadence(function (async) {
    async(function () {
        async.loop([], function () {
            this._dequeueable.dequeue(async())
        }, function (value) {
            if (value == null) {
                return [ async.break ]
            }
            this._enqueue.call(null, value, async())
        })
    }, function () {
        this._enqueue.call(null, null, async())
    })
})

Pump.prototype.destructible = cadence(function (async, destructible) {
    destructible.destruct.wait(this._dequeueable, 'destroy')
    this.run(destructible.monitor('pump'))
})

module.exports = Pump
