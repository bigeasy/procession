require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')
    var Pumper = require('../pumper')

    var queue = new Procession()

    var pumper = new Pumper(queue.shifter(), function (value) {
        assert(value, 1, 'pushed')
    })
    pumper.pump()

    queue.push(1)
    pumper.cancel()
    queue.push(2)

    var pumper = new Pumper(queue.shifter(), function (value, callback) {
        assert(value, null, 'enqueued')
        callback()
    })
    pumper.pump()
    queue.push(null)
}
