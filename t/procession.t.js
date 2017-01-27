require('proof/redux')(11, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var queue = new Procession()
    queue.push(1)
    assert(queue.size, 0, 'zero size')
    var consumer = queue.consumer()
    queue.push(1)
    assert(queue.size, 1, 'size of 1')
    assert(consumer.peek(), 1, 'peek')
    consumer.shift()
    assert(queue.size, 0, 'size of 0')

    async(function () {
        queue.join(function (value) { return value == 1 }, async())
        queue.push(2)
        queue.push(1)
    }, function (value) {
        assert(value, 1, 'join wait')
        console.log('here', queue.size)
        consumer.dequeue(async())
    }, function (first) {
        async(function () {
            consumer.dequeue(async())
        }, function (second) {
            assert([ first, second ], [ 2, 1 ], 'shift available')
        })
    }, function () {
        consumer.dequeue(async())
        queue.push(2)
    }, function (value) {
        assert(value, 2, 'wait shift and tidy')
        var waits = [ async(), async() ]
        var object = queue.consumer()
        object.pump({
            push: function (value) {
                assert(value, 3, 'pump object pumped sync')
                object.destroy()
                waits.shift()()
            }
        })
        var f = queue.consumer()
        f.pump(function (value) {
            assert(value, 3, 'function pumped sync')
            f.destroy()
            waits.shift()()
        })
        queue.push(3)
    }, function () {
        var waits = [ async(), async() ]
        var object = queue.consumer()
        object.pump({
            enqueue: function (value, callback) {
                assert(value, 3, 'pump object pumped async')
                object.destroy()
                waits.shift()()
                callback()
            }
        })
        var f = queue.consumer()
        f.pump(function (value, callback) {
            assert(value, 3, 'function pumped async')
            f.destroy()
            waits.shift()()
            callback()
        })
        queue.push(3)
    }, function () {
        return [ async.break ]
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