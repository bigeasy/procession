// Control-flow utilities.
var cadence = require('cadence')

// Evented stream reading and writing.
var Staccato = require('staccato')

// Return the first not null-like value.
var coalesce = require('extant')

// Once we get our hands on the `input` and `output` we own them, we're going to
// use `end` to indicate an end of stream. At the outset I'd hand a muddled
// imagining of external management of the stream, so that this interpretation
// of its contents was a "separate concern."

// Nothing more to do about ends and errors here. If things are operating
// normally, with one half of the duplex closing before the other, then we do
// want to drain the lagging half normally, waiting for its end-of-stream `null`
// message. If there is an error, the thrown error will stop the Procession's
// pumping and put an end writing. An error with a socket is going to probably
// generate two exceptions, one for read and one for write, unified in a common
// exception.

//
module.exports = function (envelope, buffers) {
    var e = envelope
    while (e.body != null && typeof e.body == 'object' && !Buffer.isBuffer(e.body)) {
        e = e.body
    }
    if (Buffer.isBuffer(e.body)) {
        var body = e.body
        e.body = null
        var packet = JSON.stringify({
            module: 'conduit',
            method: 'envelope',
            length: body.length,
            body: envelope
        }) + '\n'
        e.body = body
        buffers.push(packet)
        buffers.push(e.body)
    } else {
        buffers.push(JSON.stringify({
            module: 'conduit',
            method: 'envelope',
            body: envelope
        }) + '\n')
    }
}
