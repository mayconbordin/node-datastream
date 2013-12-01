// frequent.js
//
// The Frequent algorithm is a generalization of the Majority algorithm
//
// References:
// R. Karp, C. Papadimitriou, and S. Shenker. A simple algorithm for ﬁnding 
//   frequent elements in sets and bags. ACM Transactions on Database Systems,
//   28:51–55, 2003.
// E. Demaine, A. Lopez-Ortiz, and J. I. Munro. Frequency estimation of internet
//   packet streams with limited space. In European Symposium on Algorithms
//   (ESA), 2002.
//

var hashes = require('hashes');

/**
 * @class Frequent
 * @classdesc A generalization of the Majority algorithm
 *
 * @param {object} options The error threshold (epsilon), such that 
 *                         k=1/epsilon, with each item at most epsilon * n below
 *                         the true value at termination, where k is the number
 *                         of items to be stored, and n the number of items 
 *                         received.
 **/
var Frequent = function(options) {
    if (options.epsilon <= 0 || options.epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
        
    this.k     = 1/options.epsilon;
    this.items = new hashes.HashTable();
};

Frequent.prototype = {
    update: function(key, increment) {
        var item = this.items.get(key);
        
        if (item)
            this.items.add(key, (item.value + increment), true);
        else if (this.items.count() < this.k)
            this.items.add(key, increment);
        else
            this.trim();
    },
    
    trim: function() {
        var self = this;
        
        this.items.getKeyValuePairs().forEach(function(item) {
            self.items.add(item.key, --item.value, true);
            if (item.value == 0) {
                self.items.remove(item.key);
            }
        });
    },
    
    getTopK: function(k) {
        var k = (typeof(k) == 'number') ? k : this.k;
        var res = this.items.getKeyValuePairs();
        
        //console.log(res);

        res.sort(function(a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        return res.slice(0, k);
    }
};

module.exports = Frequent;
