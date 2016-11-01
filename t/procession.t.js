require('proof')(3, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var procession = new Procession()
    var consumer = procession.createConsumer()

    async(function () {
        procession.join(function (value) { return value == 1 }, async())
        procession.push(2)
        procession.push(1)
    }, function (value) {
        assert(value, 1, 'join wait')
        consumer.shift(async())
        consumer.shift(async())
    }, function (first, second) {
        assert([ first, second ], [ 2, 1 ], 'shift available')
        consumer.shift(async())
        procession.push(2)
    }, function (value) {
        assert(value, 2, 'wait shift and tidy')
    })
}
