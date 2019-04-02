var Deserializer = require('./deserializer')
var cadence = require('cadence')
var Staccato = require('staccato')
var coalesce = require('extant')

function Reader (inbox, stream, sip) {
    this.truncated = false
    this.error = null
    this.readable = new Staccato.Readable(stream)
    this._sip = coalesce(sip, Buffer.alloc(0))
    this.inbox = inbox.shifter()
    this._inbox = inbox
    this.state = 'created'
}

Reader.prototype.destroy = function () {
    this.readable.destroy()
    this.destroyed = true
}

Reader.prototype.read = cadence(function (async) {
    var deserializer = new Deserializer
    async(function () {
        var envelopes = []
        deserializer.parse(this._sip, envelopes)
        async.loop([], function () {
            async(function () {
                async.forEach([ envelopes ], function (envelope) {
                    this.state = 'enqueuing'
                    this._inbox.enqueue(envelope, async())
                })
            }, function () {
                envelopes.length = 0
                async(function () {
                    this.state = 'reading'
                    this.readable.read(async())
                }, function (buffer) {
                    if (buffer == null) {
                        this.error = this.readable.error
                        return [ async.break ]
                    }
                    deserializer.parse(buffer, envelopes)
                })
            })
        })
    }, function () {
        this.truncated = !deserializer.atBoundry
        this._inbox.push(null)
        this.destroy()
        this.state = 'compeleted'
        return []
    })
})

Reader.prototype.raise = function () {
    this.readable.raise()
}

module.exports = Reader
