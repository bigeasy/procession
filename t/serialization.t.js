require('proof')(8, require('cadence')(prove))

function prove (async, okay) {
    var Procession = require('..')
    var Pump = require('../pump')

    var Serializer = require('../serializer')
    var Deserializer = require('../deserializer')

    var stream = require('stream')
    var abend = require('abend')

    var input = new stream.PassThrough
    var output = new stream.PassThrough

    var serialize = require('../serialize')
    var deserialize = require('../deserialize')

    var outbox = new Procession
    var inbox = new Procession

    var buffers = [], envelopes = []

    serialize(outbox.shifter(), output, function (error) {
        if (error) {
            // Here is where you would catch an I/O error, isolating I/O errors
            // from unrelated errors and possibly reconnecting.
            throw error
        }
    })

    var done
    deserialize(input, inbox, function (error) {
        if (error) {
            // Here is where you would catch an I/O error, isolating I/O errors
            // from unrelated errors and possibly reconnecting.
            okay(error.message, 'truncated', 'truncated')
            done()
        }
    })

    var shifter = inbox.shifter()
    async(function () {
        shifter.dequeue(async())
        outbox.push(1)
        outbox.push(2)
        input.write(output.read())
    }, function (value) {
        okay(value, 1, 'serialized')
        shifter.dequeue(async())
    }, function (value) {
        okay(value, 2, 'off queue')
        shifter.dequeue(async())
        outbox.push({ value: 1, body: { body: Buffer.from('abcd') } })
        var buffer = output.read()
        async(function () {
            input.write(buffer.slice(0, 2))
            setImmediate(async())
        }, function () {
            input.write(buffer.slice(2, buffer.length - 2))
            setImmediate(async())
        }, function () {
            input.write(buffer.slice(buffer.length - 2))
        })
    }, function (value) {
        okay(value.value, 1, 'header')
        okay(value.body.body.toString(), 'abcd', 'body')
        shifter.dequeue(async())
        outbox.push({ body: { body: Buffer.from('abcd') } })
        input.write(output.read())
    }, function (value) {
        okay(value.body.body.toString(), 'abcd', 'body at once')
        outbox.push(null)
        okay(output.read(), null, 'eos')
        input.write('{')
        done = async()
        async([function () {
            input.end()
        }, function (error) {
            okay(error.message, 'truncated', 'truncated')
        }])
    }, function (value) {
        var inbox = new Procession
        var input = new stream.PassThrough
        inbox.shifter().dequeue(async())
        deserialize(input, inbox, Buffer.alloc(0), async())
        input.end()
    }, function (value) {
        okay(value, null, 'eop')
    })
}
