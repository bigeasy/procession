var Consumer = require('./consumer')

function Node (procession, id, value, next) {
    this._procession = procession
    this.id = id
    this.value = value
    this.next = next
}

Node.prototype.peek = function () {
    return this.next && this.next.value
}

Node.prototype.consumer = function () {
    new Consumer(this._procession, new Node(this._procession, null, null, this.head))
}

module.exports = Node
