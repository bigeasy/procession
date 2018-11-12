// Note that decoding will manipulate the body of the given envelope. We're
// going to say that the principle of the matter is that we created the envelope
// wrapping to minimize the intrusion into the user's JSON object, but the user
// did ask us to encode and decode the body so we're going to make that change
// in place and not perform excessive copying for the sake of the immutability
// shibboleth.
module.exports = function (envelope) {
    if (envelope.encoding != null) {
        var e = envelope.body
        while (typeof e.body != 'string') {
            e = e.body
        }
        e.body = Buffer.from(e.body, envelope.encoding)
    }
    return envelope.body
}
