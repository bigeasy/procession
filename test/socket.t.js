require('proof')(1, prove)

function prove (okay, callback) {
    var Destructible = require('destructible')
    var destructible = new Destructible('t/socket.t')

    destructible.completed.wait(callback)

    var expected = [function (entry) {
        console.log(entry)
    }]
    var Socket = require('../socket')(function (entry) {
        expected.shift()(entry)
    })

    var cadence = require('cadence')

    var stream = require('stream')
    var Staccato = require('staccato')

    cadence(function (async) {
        var input = new stream.PassThrough, output = new stream.PassThrough
        var readable = new Staccato.Readable(input), writable = new Staccato.Writable(output)
        destructible.destruct.wait(readable, 'destroy')
        async(function () {
            destructible.durable('socket', Socket, {}, readable, writable, Buffer.alloc(0), async())
        }, function (inbox, outbox) {
            async(function () {
                outbox.push({})
                setImmediate(async())
            }, function () {
                input.write(output.read(), async())
            }, function () {
                okay(inbox.shift(), {}, 'ready')
            })
        })
    })(destructible.durable('test'))
}
