require('proof')(6, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var procession = new Procession()
    var consumer = procession.async()

    async(function () {
        procession.join(function (value) { return value == 1 }, async())
        procession.push(2)
        procession.push(1)
    }, function (value) {
        assert(value, 1, 'join wait')
        consumer.shift(async())
    }, function (first) {
        async(function () {
            consumer.shift(async())
        }, function (second) {
            assert([ first, second ], [ 2, 1 ], 'shift available')
        })
    }, function () {
        consumer.shift(async())
        procession.push(2)
    }, function (value) {
        assert(value, 2, 'wait shift and tidy')
        var waits = [ async(), async() ]
        var object = procession.async()
        object.pump({
            push: function (value) {
                assert(value, 3, 'pump object pumped')
                object.destroy()
                waits.shift()()
            }
        })
        var f = procession.async()
        procession.push(3)
        f.pump(function (value) {
            assert(value, 3, 'function pumped')
            object.destroy()
            waits.shift()()
        })
    }, function () {
        var original = procession.async()
        var duplicate = original.async()
        procession.push(4)
        duplicate.shift(async())
    }, function (value) {
        assert(value, 4, 'duplicate')
    })
}
