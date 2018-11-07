var Deserializer = require('./deserializer')
var cadence = require('cadence')
var Staccato = require('staccato')

module.exports = cadence(function (async, input, inbox, sip) {
    var reader = new Staccato.Readable(input)
    var deserializer = new Deserializer
    async([function () {
        reader.destroy()
    }], function () {
        var envelopes = []
        if (sip != null) {
            deserializer.parse(sip, envelopes)
        }
        var loop = async(function () {
            async(function () {
                async.forEach(function (envelope) {
                    inbox.enqueue(envelope, async())
                })(envelopes)
            }, function () {
                envelopes.length = 0
                async(function () {
                    reader.read(async())
                }, function (buffer) {
                    if (buffer == null) {
                        return [ loop.break ]
                    }
                    deserializer.parse(buffer, envelopes)
                })
            })
        })()
    }, function () {
        if (!deserializer.atBoundry) {
            throw new Error('truncated')
        }
        inbox.push(null)
    })
})
