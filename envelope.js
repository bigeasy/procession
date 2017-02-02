// Once enqueued into a procession, all values are wrapped in this `Envelope`
// class except for existing envelopes. When you dequeue a value it will be
// wrapped in an `Envelope` so you can use the `method` property in a `switch`
// statement.

// Sometimes you want to treat end of stream as an error -- like when it
// comes early. Envelopes now include an `error` property that is the
// actual error for an envelope containing an error, or else a typed
// error for a Conduit end of stream.

// Important to use a consistent error class for end of stream and not
// have our dear user fuss with trying to keep end of stream error
// messages consistent.

// Construct an envelope with the given `method` and `body`.

//
function Envelope (method, body, error) {
    this.module = 'conduit'
    this.method = method
    this.endOfStream = method != 'entry'
    this.body = body
    this.error = error
}

// Export as constructor.
module.exports = Envelope
