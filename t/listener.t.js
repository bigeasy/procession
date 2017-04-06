require('proof')(6, prove)

function prove (assert) {
    var Procession = require('..')
    var queue = new Procession()
    var shifter = queue.shifter()
    queue.push(1)
    var listener = {
        pushCount: 0,
        shiftCount: 0,
        added: function (procession) {
            assert(procession === queue, 'added')
        },
        pushed: function (procession, node) {
            assert(node.body, 2, 'pushed body')
            assert(this.pushCount++, 0, 'pushed')
        },
        shifted: function (procession, node) {
            assert(node.body, 2, 'shifted body')
            assert(this.shiftCount++, 0, 'shifted')
        },
        removed: function (procession) {
            assert(procession === queue, 'removed')
        }
    }
    queue.addListener(listener)
    queue.push(2)
    shifter.shift()
    shifter.shift()
    queue.removeListener(listener)
    queue.push(3)
}
