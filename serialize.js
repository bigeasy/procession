var Serializer = require('./serializer')
var Pump = require('./pump')
var cadence = require('cadence')
var Staccato = require('staccato')

module.exports = cadence(function (async, shifter, output) {
    var writer = new Staccato.Writable(output)
    async([function () {
        writer.destroy()
    }], function () {
        var buffers = []
        var loop = async(function () {
            buffers.length = 0
            async(function () {
                shifter.dequeue(async())
            }, function (envelope) {
                if (envelope == null) {
                    return [ loop.break ]
                }
                Serializer.lengthEncoded(envelope, buffers)
                if (buffers.length == 2) {
                    async(function () {
                        writer.write(buffers[0], async())
                    }, function () {
                        writer.write(buffers[1], async())
                    })
                } else {
                    writer.write(buffers[0], async())
                }
            })
        })()
    }, function () {
        writer.end(async())
    })
})
