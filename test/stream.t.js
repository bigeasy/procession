require('proof')(2, require('cadence')(prove))

function prove (async, okay) {
    var Reader = require('../reader')
    var Writer = require('../writer')
    var stream = require('stream')

    var through = new stream.PassThrough
    var reader = new Reader(through)
    var writer = new Writer(through)

    writer.outbox.push({ key: 1 })
    writer.outbox.push(null)

    var inbox = reader.inbox.shifter()

    reader.read(function (error) {
        if (error) throw error
    })
    writer.write(function (error) {
        if (error) throw error
    })

    async(function () {
        inbox.dequeue(async())
    }, function (envelope) {
        okay(envelope, { key: 1 }, 'serialized')
        inbox.dequeue(async())
    }, function (envelope) {
        okay(envelope, null, 'eoq')
        reader.raise()
        writer.raise()
    })
}
