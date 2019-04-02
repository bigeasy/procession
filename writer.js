var Serializer = require('./serializer')
var cadence = require('cadence')
var Staccato = require('staccato')

function Writer (outbox, stream) {
    this.writable = new Staccato.Writable(stream)
    this.outbox = outbox
    this._shifter = this.outbox.shifter()
    this.state = 'created'
}

Writer.prototype.destroy = function () {
    this.destroyed = true
    this.writable.destroy()
    this._shifter.destroy()
}

Writer.prototype.write = cadence(function (async) {
    async(function () {
        var buffers = []
        async.loop([], function () {
            buffers.length = 0
            async(function () {
                this.state = 'shifting'
                this._shifter.dequeue(async())
            }, function (envelope) {
                if (envelope == null) {
                    return [ async.break ]
                }
                Serializer(envelope, buffers)
                /*
                // Nice to have. Serializer would have to return length of the
                // serialized.
                var length = Serializer(envelope, buffers)
                while (length < this._highWaterMark && (envelope = shifter.shift())) {
                    length += Serializer(envelope, buffers)
                }
                 */
                this.state = 'writing'
                this.writable.write(Buffer.concat(buffers), async())
            })
        })
    }, function () {
        this.state = 'ending'
        this.writable.end(async())
        this.error = this.writable.error
        this.destroy()
    }, function () {
        this.state = 'completed'
        return []
    })
})

Writer.prototype.raise = function () {
    this.writable.raise()
}

module.exports = Writer
