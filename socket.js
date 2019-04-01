var cadence = require('cadence')

var Procession = require('.')

var serialize = require('./serialize')
var deserialize = require('./deserialize')

var catcher = require('./catcher')

module.exports = function (errored) {
    return cadence(function (async, destructible, context, readable, writable, sip) {
        var inbox = new Procession, outbox = new Procession, shifter = inbox.shifter()
        var oshifter = outbox.shifter()
        catcher({
            label: 'deserialize',
            queue: inbox,
            context: context,
            error: errored,
            f: function (callback) { deserialize(readable, inbox, sip, callback) }
        }, destructible.durable('deserialize'))
        catcher({
            label: 'serialize',
            queue: null,
            context: context,
            error: errored,
            f: function (callback) { serialize(oshifter, writable, callback) }
        }, destructible.durable('serialize'))
        destructible.destruct.wait(oshifter, 'destroy')
        destructible.destruct.wait(inbox, 'end')
        return [ shifter, outbox ]
    })
}
