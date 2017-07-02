var RBTree = require('bintrees').RBTree

function Index (comparator) {
    this.tree = new RBTree(comparator)
}

Index.prototype.pushed = function (node) {
    this.tree.insert(node)
}

Index.prototype.shifted = function (node) {
    this.tree.remove(node)
}

module.exports = Index
