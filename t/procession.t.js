require('proof/redux')(11, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var queue = new Procession()
    var consumer = queue.consumer()

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
        var object = queue.consumer()
        object.pump({
            push: function (value) {
                assert(value, 3, 'pump object pumped')
                object.destroy()
                waits.shift()()
            }
        })
        var f = queue.consumer()
        queue.push(3)
        f.pump(function (value) {
            assert(value, 3, 'function pumped')
            object.destroy()
            waits.shift()()
        })
    }, function () {
        var original = queue.consumer()
        var copies = {
            consumer: original.consumer(),
            memento: original.memento()
        }
        async(function () {
            queue.push(4)
            copies.consumer.shift(async())
            assert(copies.memento.shift(), 4, 'async sync copy shift')
        }, function (value) {
            assert(copies.memento.shift(), null, 'async sync copy shift empty')
            assert(value, 4, 'async async copy shift')
            copies.consumer.destroy()
            copies.memento.destroy()
        })
    }, function () {
        var original = queue.consumer()
        var copies = {
            consumer: original.consumer(),
            memento: original.memento()
        }
        async(function () {
            queue.push(4)
            copies.consumer.shift(async())
            assert(copies.memento.shift(), 4, 'sync sync copy shift')
        }, function (value) {
            assert(copies.memento.shift(), null, 'sync sync copy shift empty')
            assert(value, 4, 'sync async copy shift')
            copies.consumer.destroy()
            copies.memento.destroy()
        })
    })
}
