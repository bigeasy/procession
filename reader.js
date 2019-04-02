var Deserializer = require('./deserializer')
var cadence = require('cadence')
var Staccato = require('staccato')
var coalesce = require('extant')

function Reader (inbox, stream, sip) {
    this.truncated = false
    this.error = null
    this._readable = new Staccato.Readable(stream)
    this._sip = coalesce(sip, Buffer.alloc(0))
    this.inbox = inbox.shifter()
    this._inbox = inbox
}

Reader.prototype.destroy = function () {
    this._readable.destroy()
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
                    this._inbox.enqueue(envelope, async())
                })
            }, function () {
                envelopes.length = 0
                async(function () {
                    this._readable.read(async())
                }, function (buffer) {
                    if (buffer == null) {
                        this.error = this._readable.error
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
        return []
    })
})

Reader.prototype.raise = function () {
    this._readable.raise()
}

module.exports = Reader
