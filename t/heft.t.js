require('proof/redux')(1, prove)

function prove (assert) {
    var Heft = require('../heft')
    assert(Heft, 'require')
}
