// The node for the underlying linked list. You, dear user, are welcome to
// iterate the linked list implemented by this node class and create new
// shifters from it.
//
// This is useful when you're treating the queue as a log and holding on a
// shifter at an earlier position in the queue so you can replay the log from a
// certain checkpoint. Thus, when you want to replay the log, you can start from
// your checkpoint shifter, grab its node and iterate forward to just before the
// node to begin replaying and create a new shifter.
// <hr>

// Requirements.
// <hr>

//
var assert = require('assert')
var Consumer = require('./consumer')

// Construct a node for the given Procession.
//
// The `module` property is a convention I follow for creating objects that
// envelop other objects. We're using the word `body` instead of `value` for the
// node value becasue I consider this an envelope.
// <hr>

//
function Node (procession, type, id, body, next) {
    this.module = 'procession'
    this._procession = procession
    this.type = type
    this.id = id
    this.next = next
    this.body = body
}

// Peek at the value of the next node if there is a next node.
// <hr>

//
Node.prototype.peek = function () {
    return this.next && this.next.body
}

// Create a new shifter whose next shifted value is the value of the next node.
// <hr>

//
Node.prototype.consumer = function () {
    assert(this.type == 'entry', 'not an entry node')
    assert(this.body != null, 'node expired')
    return new this._procession._Consumer(this._procession, this)
}

// Export as constructor function.
module.exports = Node
