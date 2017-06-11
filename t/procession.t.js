require('proof')(14, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')

    var queue = new Procession()
    queue.push(1)
    assert(queue.size, 0, 'zero size')
    var shifter = queue.shifter()
    queue.push(1)
    assert(queue.size, 1, 'size of 1')
    assert(shifter.peek(), 1, 'peek')
    shifter.shift()
    assert(queue.size, 0, 'size of 0')

    async(function () {
        queue.join(function (value) { return value == 1 }, async())
        queue.push(2)
        queue.push(1)
    }, function (value) {
        assert(value, 1, 'join wait')
        shifter.dequeue(async())
    }, function (first) {
        async(function () {
            shifter.dequeue(async())
        }, function (second) {
            assert([ first, second ], [ 2, 1 ], 'shift available')
        })
    }, function () {
        shifter.dequeue(async())
        queue.push(2)
    }, function (value) {
        assert(value, 2, 'wait shift and tidy')
        var waits = [ async(), async() ]
        var object = queue.shifter()
        object.pump({
            push: function (value) {
                assert(value, 3, 'pump object pumped sync')
                object.destroy()
                waits.shift()()
            }
        }, 'push')
        var f = queue.shifter()
        f.pump(function (value) {
            assert(value, 3, 'function pumped sync')
            f.destroy()
            waits.shift()()
        })
        queue.push(3)
    }, function () {
        var waits = [ async(), async() ]
        var object = queue.shifter()
        object.pump({
            enqueue: function (value, callback) {
                assert(value, 3, 'pump object pumped async')
                object.destroy()
                waits.shift()()
                callback()
            }
        }, 'enqueue')
        var f = queue.shifter()
        f.pump(function (value, callback) {
            assert(value, 3, 'function pumped async')
            f.destroy()
            waits.shift()()
            callback()
        })
        queue.push(3)
    }, function () {
        var shifter = queue.shifter()
        var duplicate = shifter.shifter()
        queue.push(4)
        assert({
            original: shifter.shift(),
            duplicate: duplicate.shift()
        }, {
            original: 4,
            duplicate: 4
        }, 'duplicate')
    }, function () {
        var shifter = queue.shifter()
        queue.push(1)
        queue.push(2)
        queue.push(3)
        shifter.destroy()
        assert(shifter.shift(), null, 'done')
        var shifter = queue.shifter()
        shifter.dequeue(function (error, envelope) {
            assert(envelope === null, 'unwait')
        })
        shifter.destroy()
    })
}
