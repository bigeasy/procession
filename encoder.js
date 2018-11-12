module.exports = function (envelope, encoding) {
    var e = envelope
    while (e.body != null && typeof e.body == 'object' && !Buffer.isBuffer(e.body)) {
        e = e.body
    }
    if (Buffer.isBuffer(e.body)) {
        e.body = e.body.toString(encoding)
        return { encoding: encoding, body: envelope }
    }
    return { encoding: null, body: envelope }
}
