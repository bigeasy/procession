require('proof')(2, prove)

function prove (assert) {
    var Procession = require('..')
    var Indexer = require('../indexer')

    var queue = new Procession()
    var indexer = new Indexer(function (left, right) {
        return left.body - right.body
    })
    queue.addListener(indexer)
    var shifter = queue.shifter()
    queue.push(1)
    queue.push(2)
    var node = indexer.tree.find({ body: 1 })
    assert(node.body, 1, 'found')
    assert(shifter.shift(), 1, 'shifted')

    queue.removeListener(indexer)
}
