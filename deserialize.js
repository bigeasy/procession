var Deserializer = require('./deserializer')
var cadence = require('cadence')

module.exports = cadence(function (async, input, inbox) {
    var deserializer = new Deserializer(input)
    async([function () {
        deserializer.destroy()
    }], function () {
        var loop = async(function () {
            async(function () {
                deserializer.dequeue(async())
            }, function (envelope) {
                if (envelope == null) {
                    return [ loop.break ]
                }
                inbox.enqueue(envelope, async())
            })
        })()
    }, function () {
        inbox.push(null)
    })
})
