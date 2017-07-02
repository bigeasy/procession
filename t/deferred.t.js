require('proof')(3, prove)

function prove (assert) {
    var Deferred = require('../deferred')
    var expect = [{
        node: { value: 1 },
        message: 'pushed set sentry'
    }, {
        node: { value: 2 },
        message: 'pushed sentry set'
    }]
    var listeners = []
    var deferred = new Deferred(listeners, {
        pushed: function (node) {
            var expected = expect.shift()
            assert(node, expected.node, expected.message)
        },
        shifted: function (node) {
            assert(node, { value: 1 }, 'shifted')
        }
    })
    var node = { value: 1 }
    deferred.pushed(node)
    deferred.pushed({ value: 2 })
    deferred.shifted({})
    deferred.shifted(node)
}
