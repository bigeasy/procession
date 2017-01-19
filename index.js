var RBTree = require('bintrees').RBTree

function Index (comparator) {
    this.tree = new RBTree(comparator)
}

Index.prototype.added = function () {
}

Index.prototype.pushed = function (procession, node) {
    this.tree.insert(node)
}

Index.prototype.shifted = function (procession, node) {
    this.tree.remove(node)
}

Index.prototype.removed = function () {
    this.tree.clear()
}
