require('proof')(5, prove)

function prove (assert) {
    var Identifier = require('../identifier')
    var identifier = new Identifier
    var compare = identifier.compare.bind(identifier)
    var ids = []
    ids.push(identifier.next())
    assert(ids[0], 0xfffffffe, 'about to wrap')
    ids.push(identifier.next())
    assert(compare(ids[0], ids[0]), 0, 'equal')
    assert(compare(ids[0], ids[1]) < 0, 'less than by one')
    ids.push(identifier.next())
    assert(compare(ids[0], ids[2]) < 0, 'less than wrapped')
    assert(ids[2], 0, 'wrapped')
}
