require('proof')(2, require('cadence')(prove))

function prove (async, okay) {
    var Procession = require('..')
    var Destructible = require('destructible')
    var Pump = require('../pump')
    var abend = require('abend')

    var destructible = new Destructible('t/pump.t.js')
    var queue = new Procession()

    var next = new Procession()
    var pumpify = queue.shifter().pumpify(next)
    next = next.shifter()

    var pump = new Pump(queue.shifter(), [function (value) {
        okay(value, 1, 'pushed')
    }])
    pump.pumpify(abend)

    queue.push(1)
    pump.shifter.destroy()
    queue.push(2)

    var pumper = new Pump(queue.shifter(), [function (value, callback) {
        okay(value, null, 'enqueued')
        callback()
    }])
    async(function () {
        destructible.monitor('pump', pump, 'monitor', async())
    }, function () {
        queue.push(null)

        okay(next.shift(), 1, 'pumpify')

        destructible.destroy()
    })
}
