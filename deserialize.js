var Deserializer = require('./deserializer')
var cadence = require('cadence')
var Staccato = require('staccato')

module.exports = cadence(function (async, reader, inbox, sip) {
    var deserializer = new Deserializer
    async([function () {
        reader.destroy()
    }], function () {
        var envelopes = []
        if (sip != null) {
            deserializer.parse(sip, envelopes)
        }
        async.loop([], function () {
            async(function () {
                async.forEach([ envelopes ], function (envelope) {
                    inbox.enqueue(envelope, async())
                })
            }, function () {
                envelopes.length = 0
                async(function () {
                    reader.read(async())
                }, function (buffer) {
                    if (buffer == null) {
                        return [ async.break ]
                    }
                    deserializer.parse(buffer, envelopes)
                })
            })
        })
    }, function () {
        if (!deserializer.atBoundry) {
            throw new Error('truncated')
        }
        inbox.push(null)
    })
})
