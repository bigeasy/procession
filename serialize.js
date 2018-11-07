var Serializer = require('./serializer')
var Pump = require('./pump')
var cadence = require('cadence')

module.exports = cadence(function (async, shifter, output) {
    var serializer = new Serializer(output)
    async([function () {
        serializer.destroy()
    }], function () {
        var loop = async(function () {
            async(function () {
                shifter.dequeue(async())
            }, function (envelope) {
                if (envelope == null) {
                    return [ loop.break ]
                }
                serializer.enqueue(envelope, async())
            })
        })()
    }, function () {
        serializer.enqueue(null, async())
    })
})
