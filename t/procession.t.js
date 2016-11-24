require('proof')(11, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var queue = new Procession()
    var consumer = queue.async()

    async(function () {
        queue.join(function (value) { return value == 1 }, async())
        queue.push(2)
        queue.push(1)
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
        queue.push(2)
    }, function (value) {
        assert(value, 2, 'wait shift and tidy')
        var waits = [ async(), async() ]
        var object = queue.async()
        object.pump({
            push: function (value) {
                assert(value, 3, 'pump object pumped')
                object.destroy()
                waits.shift()()
            }
        })
        var f = queue.async()
        queue.push(3)
        f.pump(function (value) {
            assert(value, 3, 'function pumped')
            object.destroy()
            waits.shift()()
        })
    }, function () {
        var original = queue.async()
        var copies = {
            async: original.async(),
            sync: original.sync()
        }
        async(function () {
            queue.push(4)
            copies.async.shift(async())
            assert(copies.sync.shift(), 4, 'async sync copy shift')
        }, function (value) {
            assert(copies.sync.shift(), null, 'async sync copy shift empty')
            assert(value, 4, 'async async copy shift')
            copies.async.destroy()
            copies.sync.destroy()
        })
    }, function () {
        var original = queue.sync()
        var copies = {
            async: original.async(),
            sync: original.sync()
        }
        async(function () {
            queue.push(4)
            copies.async.shift(async())
            assert(copies.sync.shift(), 4, 'sync sync copy shift')
        }, function (value) {
            assert(copies.sync.shift(), null, 'sync sync copy shift empty')
            assert(value, 4, 'sync async copy shift')
            copies.async.destroy()
            copies.sync.destroy()
        })
    })
}
