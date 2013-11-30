// spacesaving.js
//
// Implementation of the SpaceSaving algorithm described by Metwally et. al. [2005].
//
// Ref.: Metwally, Ahmed, Divyakant Agrawal, and Amr El Abbadi. "Efficient computation of frequent and top-k elements in data streams." Database Theory-ICDT 2005. Springer Berlin Heidelberg, 2005. 398-412.
//
// Based on: https://github.com/tomsoft1/SpaceSaving
//

var hashes = require('hashes');

var HashTable = function() {
    this.minKey = null;
    this.minVal = Number.MAX_VALUE;
};

HashTable.prototype = new hashes.HashTable();

HashTable.prototype.add = function(key, value, overwriteIfExists) {
    hashes.HashTable.prototype.add.call(this, key, value, overwriteIfExists);
    
    if (value < this.minVal) {
        this.minVal = value;
        this.minKey = key;
    }
};

var SpaceSaving = function(options) {
    this.maxEntries = options.maxEntries;
    this.counts = new HashTable();
    this.errors = new hashes.HashTable();
};

SpaceSaving.prototype = {
    update: function(key, increment) {
        var count = this.counts.contains(key) ? this.counts.get(key).value : null;
        
        if (!count) {
            if (this.counts.count() >= this.maxEntries) {
                var min = this.counts.minVal;
                var old = this.counts.minKey;
                
                this.counts.remove(old);
                this.errors.remove(old);
                this.errors.add(key, min);
                count = min;
            } else {
                count = 0;
            }
        }
        
        this.counts.add(key, (count+increment), true);
    },
    
    getTopK: function(k) {
        var k = (typeof(k) == 'number') ? k : this.maxEntries;
        var res = this.counts.getKeyValuePairs();

        res.sort(function(a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        return res.slice(0, k);
    }
};

module.exports = SpaceSaving;
