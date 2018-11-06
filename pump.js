var cadence = require('cadence')
var Operation = require('operation')

function Pump (dequeueable) {
    var vargs = Array.prototype.slice.call(arguments, 1)
    var operation = Array.isArray(vargs[0])
                  ? new Operation(vargs[0])
                  : new Operation(vargs)
    this._enqueue = operation.length == 2 ? operation : function (value, callback) {
        operation(value)
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

Pump.prototype.run = function (callback) {
    this._run(callback)
    return this
}

Pump.prototype._run = cadence(function (async) {
    async(function () {
        var loop = async(function () {
            this._dequeueable.dequeue(async())
        }, function (value) {
            if (value == null) {
                return [ loop.break ]
            }
            this._enqueue.call(null, value, async())
        })()
    }, function () {
        this._enqueue.call(null, null, async())
    })
})

Pump.prototype.destructible = cadence(function (async, destructible) {
    destructible.destruct.wait(this._dequeueable, 'destroy')
    this.run(destructible.monitor('pump'))
})

module.exports = Pump
