require('proof')(2, prove)

function prove (okay, callback) {
    var Destructible = require('destructible')
    var destructible = new Destructible('t/pump.t')

    destructible.completed.wait(callback)

    var Procession = require('..')

    var Pump = require('../pump')

    var cadence = require('cadence')

    cadence(function (async) {
        async(function () {
            var inbox = new Procession
            var outbox = new Procession
            var shifter = outbox.shifter()
            new Pump(inbox.shifter(), outbox, 'enqueue').destroy()
            shifter.dequeue(async())
            destructible.monitor('enqueue', new Pump(inbox.shifter(), outbox, 'enqueue'), 'destructible', null)
            inbox.push(1)
        }, function (value) {
            okay(value, 1, 'enqueued')
            var inbox = new Procession
            var outbox = new Procession
            var shifter = outbox.shifter()
            shifter.dequeue(async())
            destructible.monitor('push', new Pump(inbox.shifter(), outbox, 'push'), 'destructible', null)
            inbox.push(1)
        }, function (value) {
            okay(value, 1, 'pushed')
        })
    })(destructible.monitor('destructible'))
}
