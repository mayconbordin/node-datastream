// cmsketch.js
//
// An implementation of count-min sketching from the paper due to Cormode and
// Muthukrishnan [2005]
//
// Ref.: Cormode, Graham, and S. Muthukrishnan. "An improved data stream summary: the count-min sketch and its applications." Journal of Algorithms 55.1 (2005): 58-75.
//
// Translated from: https://tech.shareaholic.com/2012/12/03/the-count-min-sketch-how-to-count-over-large-keyspaces-when-about-right-is-good-enough/
//

var Heap = require('heap')
  , fn   = require('./fn.js');

/**
 * Constants
 **/
var BIG_PRIME = 9223372036854775783;

function randomParameter() {
    return fn.getRandomInt(0, BIG_PRIME - 1);
}

var Sketch = function(options) {
    if (options.delta <= 0 || options.delta >= 1)
        throw new Error("delta must be between 0 and 1, exclusive");
    if (options.epsilon <= 0 || options.epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
    if (options.k < 1)
        throw new Error("k must be a positive integer");
    
    this.w = Math.floor(Math.ceil(Math.exp(1) / options.epsilon));
    this.d = Math.floor(Math.ceil(Math.log(1 / options.delta)));
    this.k = options.k;
    this.hashFunctions = [];
    this.count = [];
    this.heap  = [];
    this.topK  = {};
    this.topKSize = 0;
    
    this.init();
};

Sketch.prototype = {
    init: function() {
        for (var i=0; i<this.d; i++)
            this.hashFunctions.push(this.generateHashFunction());
        
        for (var i=0; i<this.d; i++) {
            this.count.push([]);
            for (var j=0; j<this.w; j++)
                this.count[i].push(0);
        }
    },
    
    update: function(key, increment) {
        for (row in this.hashFunctions) {
            var hashFunction = this.hashFunctions[row];
            var column = hashFunction(Math.abs(fn.hashCode(key)));
            
            this.count[row][column] += increment;
        }
        
        this.updateHeap(key);
    },

    updateHeap: function(key) {
        var estimate = this.get(key);
        
        if (this.heap.length == 0 || estimate >= this.heap[0].value) {
            if (key in this.topK) {
                var oldPair = this.topK[key];
                oldPair.value = estimate;
                Heap.heapify(this.heap);
            } else {
                if (fn.objSize(this.topK) < this.k) {
                    Heap.push(this.heap, {key: key, value: estimate});
                    this.topK[key] = {key: key, value: estimate};
                    this.topKSize++;
                } else {
                    var newPair = {key: key, value: estimate};
                    var oldPair = Heap.pushpop(this.heap, newPair);
                    delete this.topK[oldPair[1]];
                    this.topK[key] = newPair;
                }
            }
        }
    },
    
    get: function(key) {
        var value = Number.MAX_VALUE;
        
        for (row in this.hashFunctions) {
            var hashFunction = this.hashFunctions[row];
            var column = hashFunction(Math.abs(fn.hashCode(key)));
            value = Math.min(this.count[row][column], value);
        }
        
        return value;
    },
    
    generateHashFunction: function() {
        var self = this;
        var a = randomParameter();
        var b = randomParameter();
        
        return function(x) {
            return (a * x + b) % BIG_PRIME % self.w;
        };
    },
    
    getTopK: function(k) {
        var k = (typeof(k) == 'number') ? k : this.k;
        
        var res = [];
        for (key in this.topK)
            res.push(this.topK[key]);

        res.sort(function(a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        return res.slice(0, k);
    }
};

module.exports = Sketch;
