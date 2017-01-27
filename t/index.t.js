require('proof/redux')(2, prove)

function prove (assert) {
    var Procession = require('..')
    var Index = require('../index')

    var queue = new Procession()
    var index = new Index(function (left, right) {
        return left.body - right.body
    })
    queue.addListener(index)
    var follower = queue.consumer()
    queue.push(1)
    queue.push(2)
    var node = index.tree.find({ body: 1 })
    assert(node.body, 1, 'found')
    assert(follower.shift(), 1, 'shifted')
}
