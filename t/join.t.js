require('proof/redux')(5, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')
    var Transformer = require('../transformer')
    var queue

    queue = new Procession
    queue.shifter().join(function (value) {
        return value == 2
    }, function (error, value) {
        assert(error, null, 'join value error')
        assert(value, 2, 'join value value')
    })
    queue.push(1)
    queue.push(2)
    queue.push(null)

    queue = new Procession
    queue.shifter().join(function (value) {
        return value == null
    }, function (error, value) {
        assert(error, null, 'join end error')
        assert(value, null, 'join end value')
    })
    queue.push(1)
    queue.push(null)

    queue = new Procession
    queue.shifter().join(function (value) {
        return value == 2
    }, function (error, value) {
        assert(/^procession#endOfStream$/m.test(error.message),'join eos error')
    })
    queue.push(1)
    queue.push(null)
}
