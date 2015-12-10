require('proof')(2, prove)

function prove (assert) {
    var Procession = require('../..')

    var node = { next: null }

    var procession = new Procession(function (memento) {
        return memento.next
    })

    function put (memento) {
        if (memento.event.name == 'put') {
            return [ null, memento.event.data ]
        }
        return null
    }

    function get (memento) {
        if (memento.event.name == 'get') {
            return [ null, memento.event.query ]
        }
        return null
    }

    function disconnect (memento) {
        if (memento.event.name == 'disconnect') {
            return [ new Error('disconnected') ]
        }
        return null
    }

    var interceptors = [ put, get, disconnect ]

    procession.join(node, interceptors, function (error, result) {
        assert(result, 'putted', 'put')
    })

    procession.advance()

    node.next = {
        event: { name: 'put', data: 'putted' },
        next: null
    }

    procession.advance()

    node.next.next = {
        event: { name: 'disconnect' },
        next: null
    }

    procession.join(node.next, interceptors, function (error) {
        assert(error.message, 'disconnected', 'put')
    })

    procession.advance()
}
