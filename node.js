var Consumer = require('./consumer')

// You're welcome to iterate the linked list implemented by this node class and
// create new consumers from it. Helpful if you're treating the queue a log or
// atomic log and holding  on an earlier position in the queue so you can replay
// the log from a certain point. You must use a consumer to hold onto the log,
// but if you where to create a new consumer from that consumer, it would begin
// at the next node of the consumer's node, not at the point held by the
// consumer. Probably need a diagram.

//
function Node (procession, type, id, body, next) {
    this.module = 'procession'
    this._procession = procession
    this.type = type
    this.id = id
    this.body = body
    this.next = next
}

Node.prototype.peek = function () {
    return this.next && this.next.value
}

Node.prototype.consumer = function () {
    assert(node.type == 'entry', 'not an entry node')
    assert(node.body != null, 'node expired')
    new Consumer(this._procession, new Node(this._procession, null, null, this.head))
}

module.exports = Node
