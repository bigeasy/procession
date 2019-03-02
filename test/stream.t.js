require('proof')(3, require('cadence')(prove))

function prove (async, okay) {
    var Procession = require('..')

    var Readable = require('../readable')
    var Writable = require('../writable')

    var queue = new Procession

    var writable = new Writable(queue)
    var readable = new Readable(queue.shifter(), { highWaterMark: 4 })
    writable.write(Buffer.from('abcdef'))
    okay(readable.read().toString(), 'abcdef', 'high water')
    writable.write(Buffer.from('abc'))
    okay(readable.read().toString(), 'abc', 'low water')
    readable.read()
    writable.end()

    var unreadable
    var readable = new Readable({
        dequeue: function (callback) { unreadable = callback }
    })
    readable.on('error', function (error) {
        okay(error.message, 'unreadable', 'error')
    })
    unreadable(new Error('unreadable'))
}
