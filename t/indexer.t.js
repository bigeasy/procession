require('proof')(2, prove)

function prove (assert) {
    var Indexer = require('../indexer')

    var indexer = new Indexer(function (left, right) {
        return left.body - right.body
    })

    indexer.pushed({ body: 1 })
    assert(indexer.tree.size, 1, 'pushed')
    indexer.shifted({ body: 1 })
    assert(indexer.tree.size, 0, 'shifted')
}
