require('proof')(1, require('cadence')(prove))

function prove (async, okay) {
    var Procession = require('..')
    var Pump = require('../pump')
    var abend = require('abend')

    var queue = new Procession()

    var pump = new Pump(queue.shifter(), [function (value) {
        okay(value, 1, 'pushed')
    }])
    pump.pump(abend)

    queue.push(1)
    pump.shifter.destroy()
    queue.push(2)

    var pumper = new Pump(queue.shifter(), [function (value, callback) {
        okay(value, null, 'enqueued')
        callback()
    }])
    pump.pump(abend)
    queue.push(null)
}
