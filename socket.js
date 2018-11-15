var cadence = require('cadence')

var Procession = require('.')

var serialize = require('./serialize')
var deserialize = require('./deserialize')

var catcher = require('./catcher')

module.exports = function (errored) {
    return cadence(function (async, destructible, readable, writable, sip) {
        var inbox = new Procession, outbox = new Procession, shifter = inbox.shifter()
        catcher({
            label: 'deserialize',
            queue: inbox,
            error: errored,
            f: function (callback) { deserialize(readable, inbox, sip, callback) }
        }, destructible.monitor('deserialize'))
        catcher({
            label: 'serialize',
            queue: null,
            error: errored,
            f: function (callback) { serialize(outbox.shifter(), writable, callback) }
        }, destructible.monitor('serialize'))
        destructible.destruct.wait(outbox, 'end')
        destructible.destruct.wait(inbox, 'end')
        return [ shifter, outbox ]
    })
}
