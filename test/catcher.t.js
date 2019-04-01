require('proof')(3, require('cadence')(prove))

function prove (async, okay) {
    var expected = [function (error, context) {
        okay({
            message: error.message,
            context: context
        }, {
            message: 'message',
            context: { olio: { name: 'run', index: 0 } }
        }, 'catch one')
    }, function (error, context) {
        okay({
            message: error.message,
            context: context
        }, {
            message: 'message',
            context: { olio: { name: 'run', index: 0 } }
        }, 'catch two')
    }]
    function errored () {
        expected.shift().apply(null, Array.prototype.slice.call(arguments))
    }
    var catcher = require('../catcher')
    async(function () {
        catcher({
            label: 'catcher',
            context: { olio: { name: 'run', index: 0 } },
            error: errored,
            f: function (callback) {
                callback(new Error('message'))
            }
        }, async())
    }, function () {
        catcher({
            label: 'catcher',
            context: { olio: { name: 'run', index: 0 } },
            f: function (callback) {
                callback(new Error('message'))
            },
            error: errored,
            queue: {
                end: function () { okay('ended') }
            }
        }, async())
    })
}
