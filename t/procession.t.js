require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var procession = new Procession()
    var consumer = procession.createConsumer()

    async(function () {
        procession.push(1)
        consumer.shift(async())
    }, function (value) {
        assert(value, 1, 'shift available')
        consumer.shift(async())
        procession.push(2)
    }, function (value) {
        assert(value, 2, 'shift wait')
    })
}
