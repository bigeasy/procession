// Control-flow utilities.
var cadence = require('cadence')

// Evented stream reading and writing.
var Staccato = require('staccato')

// JSON for use in packets.
var Jacket = require('nascent.jacket')

// Return the first not null-like value.
var coalesce = require('extant')

// Once we get our hands on the `input` and `output` we own them, we're going to
// use `end` to indicate an end of stream. At the outset I'd hand a muddled
// imagining of external management of the stream, so that this interpretation
// of its contents was a "separate concern."

//
function Deserializer (input, buffer) {
    this.destroyed = false
    this._input = new Staccato.Readable(input)

    this._queue = []

    this._slices = []
    this._record = new Jacket

    this._parse(coalesce(buffer, Buffer.alloc(0)))
}

Deserializer.prototype.destroy = function () {
    this.destroyed = true
    this._input.destroy()
}

Deserializer.prototype._buffer = function (buffer, start, end) {
    var length = Math.min(buffer.length - start, this._chunk.length)
    var slice = buffer.slice(start, start + length)
    start += length
    this._chunk.length -= length
    // If chunk length is zero we have gathered up all of our chunks so
    // assemble them, but if not then save the slice for eventual assembly.

    //
    if (this._chunk.length === 0) {
        // If we've gathered slices, assemble them, otherwise make a copy of
        // the buffered slice (TODO what? but why? is it necessary?)
        if (this._slices.length == 0) {
            slice = Buffer.from(slice)
        } else {
            this._slices.push(slice)
            slice = Buffer.concat(this._slices)
            this._slices.length = 0
        }

        // The buffer body can be nested arbitrarily deep in envelopes.
        var envelope = this._chunk.body
        var e = envelope
        while (e.body != null) {
            e = e.body
        }
        e.body = slice

        // Reset to read next record.
        this._chunk = null
        this._record = new Jacket

        // Enqueue the parsed envelope.
        this._queue.push(envelope)
    } else {
        this._slices.push(Buffer.from(slice))
    }
    return start
}

Deserializer.prototype._json = function (buffer, start, end) {
    start = this._record.parse(buffer, start, end)
    if (this._record.object != null) {
        var envelope = this._record.object
        switch (envelope.method) {
        case 'envelope':
            this._queue.push(envelope.body)
            break
        case 'chunk':
            this._chunk = this._record.object
            break
        }
        this._record = new Jacket
    }
    return start
}

Deserializer.prototype._parse = function (buffer) {
    var start = 0
    while (start != buffer.length) {
        if (this._chunk != null) {
            start = this._buffer(buffer, start, buffer.length)
        } else {
            start = this._json(buffer, start, buffer.length)
        }
    }
}

Deserializer.prototype.dequeue = cadence(function (async) {
    if (this._queue.length != 0) {
        return this._queue.shift()
    }
    var read = async(function () {
        async(function () {
            this._input.read(async())
        }, function (buffer) {
            if (buffer == null) {
                return [ read.break, null ]
            }
            this._parse(buffer)
            if (this._queue.length != 0) {
                return [ read.break, this._queue.shift() ]
            }
        })
    })()
})

module.exports = Deserializer
