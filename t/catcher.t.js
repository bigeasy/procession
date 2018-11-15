require('proof')(3, require('cadence')(prove))

function prove (async, okay) {
    var expected = [function (entry) {
        okay(entry, {
            message: 'message',
        }, 'no end')
    }, function (entry) {
        okay(entry, {
            message: 'message',
        }, 'no end')
    }]
    function errored () {
        expected.shift().apply(null, Array.prototype.slice.call(arguments))
    }
    var catcher = require('../catcher')
    async(function () {
        catcher({
            label: 'catcher',
            entry: { olio: { name: 'run', index: 0 } },
            error: errored,
            f: function (callback) {
                callback(new Error('message'))
            }
        }, async())
    }, function () {
        catcher({
            label: 'catcher',
            entry: { olio: { name: 'run', index: 0 } },
            f: function (callback) {
                callback(new Error('message'))
            },
            error: errored,
            queue: {
                end: function () { okay(true, 'ended') }
            }
        }, async())
    })
}
