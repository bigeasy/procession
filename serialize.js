var Serializer = require('./serializer')
var Pump = require('./pump')
var cadence = require('cadence')
var Staccato = require('staccato')

module.exports = cadence(function (async, shifter, writable) {
    async([function () {
        writable.destroy()
    }], function () {
        var buffers = []
        async.loop([], function () {
            buffers.length = 0
            async(function () {
                shifter.dequeue(async())
            }, function (envelope) {
                if (envelope == null) {
                    return [ async.break ]
                }
                Serializer(envelope, buffers)
                writable.write(buffers.join(''), async())
            })
        })
    }, function () {
        writable.end(async())
    })
})
