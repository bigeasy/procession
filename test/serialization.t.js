require('proof')(7, require('cadence')(prove))

function prove (async, okay) {
    var Serializer = require('../serializer')
    var Deserializer = require('../deserializer')

    var buffers = []
    Serializer({ key: 1 }, buffers)
    var envelope = Buffer.concat(buffers)
    okay(JSON.parse(envelope.toString()), {
        module: 'conduit',
        method: 'envelope',
        body: { key: 1 }
    }, 'no buffer envelope')
    buffers.length = 0
    Serializer({ body: { body: Buffer.from('abcdefghi\n') } }, buffers)
    var buffered = Buffer.concat(buffers)
    var lines = buffered.toString().split('\n')
    okay(JSON.parse(lines[0]), {
        module: 'conduit',
        method: 'envelope',
        length: 10,
        body: { body: { body: null } }
    }, 'buffer envelope')
    okay(lines[1], 'abcdefghi', 'buffer body')


    var deserializer = new Deserializer
    var envelopes = []

    buffers.length = 0

    deserializer.parse(buffered.slice(0, 5), envelopes)
    deserializer.parse(buffered.slice(5, 87), envelopes)
    deserializer.parse(buffered.slice(87), envelopes)

    okay(envelopes[0].body.body.toString(), 'abcdefghi\n', 'buffer from bits')
    envelopes[0].body.body = null
    okay(envelopes, [{ body: { body: null } }], 'deserialized from bits')

    envelopes.length = 0

    deserializer.parse(buffered, envelopes)

    okay(envelopes[0].body.body.toString(), 'abcdefghi\n', 'buffer entire')
    envelopes[0].body.body = null
    okay(envelopes, [{ body: { body: null } }], 'deserialized entire')
}
