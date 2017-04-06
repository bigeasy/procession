require('proof')(1, prove)

function prove (assert) {
    var Procession = require('..')
    var queue = new Procession()
    var shifter = queue.shifter()
    queue.push(1)
    queue.push(2)
    queue.push(3)
    var node = shifter.node
    while (node.peek() != 2) {
        node = node.next
    }
    var clone = node.shifter()
    assert(clone.shift(), 2, 'duplicated')
}
