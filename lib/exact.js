// exact.js
//
// Uses a hash table to maintain a count of items and thus has an unbounded memory
// requirement.
//

var hashes = require('hashes');

var Exact = function() {
    this.hash = new hashes.HashTable();
};

Exact.prototype = {
    update: function(key, increment) {
        var count = this.hash.contains(key) ? this.hash.get(key).value : null;

        if (count) count += increment;
        else count = increment;
        
        this.hash.add(key, count, true);
    },
    
    getTopK: function(k) {
        var res = this.hash.getKeyValuePairs();

        res.sort(function(a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        return res.slice(0, k);
    }
};

module.exports = Exact;
