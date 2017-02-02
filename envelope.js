// Once enqueued into a procession, all values are wrapped in this `Envelope`
// class except for existing envelopes. When you dequeue a value it will be
// wrapped in an `Envelope` so you can use the `method` property in a `switch`
// statement.

// Constuct an envelope with the given `method` and `body`.

//
function Envelope (method, body) {
    this.module = 'conduit'
    this.method = method
    this.body = body
}

// Export as constructor.
module.exports = Envelope
