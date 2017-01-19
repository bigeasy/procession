var Consumer = require('./consumer')

function Node (procession, id, value) {
    this._procession = procession
    this.value = value
    this.next = null
    this.id = id
}

Node.prototype.peek = function () {
    return this.next && this.next.value
}

Node.prototype.consumer = function () {
    new Consumer(this._procession, this.head)
}

module.exports = Node
