require('proof')(1, prove)

function prove (assert) {
    var Heft = require('../heft')
    assert(Heft, 'require')
}
