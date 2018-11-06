var stream = require('stream')
var util = require('util')
var coalesce = require('extant')

function Writable (outbox, options) {
    stream.Writable.call(this, coalesce(options, {}))
    this._outbox = outbox
    this.once('finish', function () { outbox.push(null) })
}
util.inherits(Writable, stream.Writable)

Writable.prototype._write = function (chunk, encoding, callback) {
    this._outbox.enqueue({ body: chunk }, callback)
}

module.exports = Writable
