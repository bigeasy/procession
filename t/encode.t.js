require('proof')(2, prove)

function prove (okay) {
    var Encoder = require('../encoder')
    var Decoder = require('../decoder')

    var envelope = Decoder(Encoder({ body: { body: Buffer.from('abc') } }, 'utf8'))
    okay(envelope.body.body.toJSON(), { type: 'Buffer', data: [ 0x61, 0x62, 0x63 ] }, 'encoded buffer')
    var envelope = Decoder(Encoder({ body: { body: 'abc' } }, 'utf8'))
    okay(envelope, { body: { body: 'abc' } }, 'encoded not necessary')
}
