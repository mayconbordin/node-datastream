var Heap   = require('heap')

/**
 * Constants
 **/
var BIG_PRIME = 9223372036854775783;

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomParameter() {
    return getRandomInt(0, BIG_PRIME - 1);
}

function hashCode(str) {
    var hash = 0, i, ch;
    if (str.length == 0) return hash;
        for (i = 0, l = str.length; i < l; i++) {
            ch  = str.charCodeAt(i);
            hash  = ((hash<<5)-hash)+ch;
            hash |= 0; // Convert to 32bit integer
        }
    return hash;
}

function objsize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

var Sketch = function(delta, epsilon, k) {
    if (delta <= 0 || delta >= 1)
        throw new Error("delta must be between 0 and 1, exclusive");
    if (epsilon <= 0 || epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
    if (k < 1)
        throw new Error("k must be a positive integer");
    
    this.w = Math.floor(Math.ceil(Math.exp(1) / epsilon));
    this.d = Math.floor(Math.ceil(Math.log(1 / delta)));
    this.k = k;
    this.hashFunctions = [];
    this.count = [];
    this.heap  = [];
    this.topK  = {};
    
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
            var column = hashFunction(Math.abs(hashCode(key)));
            
            this.count[row][column] += increment;
        }
        
        this.updateHeap(key);
    },
    
    updateHeap: function(key) {
        var estimate = this.get(key);
        
        if (this.heap.length == 0 || estimate >= this.heap[0][0]) {
            if (key in this.topK) {
                var oldPair = this.topK[key];
                oldPair[0] = estimate;
                Heap.heapify(this.heap);
            } else {
                if (objsize(this.topK) < this.k) {
                    Heap.push(this.heap, [estimate, key]);
                    this.topK[key] = [estimate, key];
                } else {
                    var newPair = [estimate, key];
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
            var column = hashFunction(Math.abs(hashCode(key)));
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
    }
};

module.exports = {
    Sketch: Sketch
};
