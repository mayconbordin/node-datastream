// q-digest.js
//
// Translated from:
// http://github.com/addthis/stream-lib
//

var hashes = require('hashes')
  , fifo   = require('fifo')
  , Long   = require("long")
  , fn     = require('../fn.js')
  ;
  
var LONG_ZERO = Long.fromInt(0);
var LONG_ONE  = Long.fromInt(1);
var LONG_TWO  = Long.fromInt(2);

var HashTable = function(options) {
    hashes.HashTable.call(this, options);
};
HashTable.prototype = new hashes.HashTable();
HashTable.prototype.addInc = function(key, value) {
    var obj = hashes.HashTable.prototype.get.call(this, key);
    
    if (obj) {
        hashes.HashTable.prototype.add.call(this, key, obj.value + value, true);
    } else {
        hashes.HashTable.prototype.add.call(this, key, value);
    }
};
HashTable.prototype.getSortedKeys = function() {
    var keys = [];
    
    var pairs = hashes.HashTable.prototype.getKeyValuePairs.call(this);
    pairs.forEach(function(pair) {
        keys.push(pair.key);
    });
    
    return keys.sort(function(a,b){return a-b});
};

HashTable.prototype.getKeys = function() {
    var keys = [];
    
    var pairs = hashes.HashTable.prototype.getKeyValuePairs.call(this);
    pairs.forEach(function(pair) {
        keys.push(pair.key);
    });
    
    return keys;
};

var RANGES_COMPARATOR = function(ra, rb) {
    var rightA = ra[1], rightB = rb[1], sizeA = ra[1] - ra[0], sizeB = rb[1] - rb[0];
    if (rightA < rightB) {
        return -1;
    }
    if (rightA > rightB) {
        return 1;
    }
    if (sizeA < sizeB) {
        return -1;
    }
    if (sizeA > sizeB) {
        return 1;
    }
    return 0;
};

var KEY_COMPARATOR = function(first, second) {
    return first.equals(second);
};

var QDigest = function(compressionFactor) {
    this.size              = 0;
    this.capacity          = LONG_ONE;
    this.compressionFactor = compressionFactor;
    this.node2count        = new HashTable({equal: KEY_COMPARATOR});
};

QDigest.prototype = {
    value2leaf: function(x) {
        return this.capacity.add(Long.fromInt(x));
    },

    leaf2value: function(id) {
        return id.subtract(this.capacity);
    },

    isRoot: function(id) {
        return id.equals(LONG_ONE);
    },

    isLeaf: function(id) {
        return id.greaterThanOrEqual(this.capacity);
    },

    sibling: function(id) {
        if (id.modulo(LONG_TWO).equals(LONG_ZERO)) {
            return id.add(LONG_ONE);
        } else {
            return id.subtract(LONG_ONE);
        }
    },

    parent: function(id) {
        return id.div(LONG_TWO);
    },

    leftChild: function(id) {
        return id.multiply(LONG_TWO);
    },

    rightChild: function(id) {
        return id.multiply(LONG_TWO).add(LONG_ONE);
    },

    rangeLeft: function(id) {
        while (!this.isLeaf(id)) {
            id = this.leftChild(id);
        }
        return this.leaf2value(id).toNumber();
    },

    rangeRight: function(id) {
        while (!this.isLeaf(id)) {
            id = this.rightChild(id);
        }
        return this.leaf2value(id).toNumber();
    },
    
    offer: function(value) {
        if (value < 0 || value > Number.MAX_VALUE/2) {
            throw new Error("Can only accept values in the range 0.." + Number.MAX_VALUE/2 + ", got " + value);
        }
        // Rebuild if the value is too large for the current tree height
        //if (value >= this.capacity) {
        if (this.capacity.lessThan(Long.fromInt(value))) {
            //console.log("rebuildToCapacity: ", value, " >= ", this.capacity.toNumber());
            this.rebuildToCapacity(fn.highestOneBit(value) << 1);
        }

        var leaf = this.value2leaf(value);
        this.node2count.addInc(leaf, 1);
        this.size++;
        
        // Always compress at the inserted node, and recompress fully
        // if the tree becomes too large.
        // This is one sensible strategy which both is fast and keeps
        // the tree reasonably small (within the theoretical bound of 3k nodes)
        this.compressUpward(leaf);
        if (this.node2count.count() > 3 * this.compressionFactor) {
            this.compressFully();
        }
    },
    
    rebuildToCapacity: function(newCapacity)
    {
        //console.log('rebuildToCapacity -- begin');
        var newNode2count = new HashTable({equal: KEY_COMPARATOR});
        // rebuild to newLogCapacity.
        // This means that our current tree becomes a leftmost subtree
        // of the new tree.
        // E.g. when rebuilding a tree with logCapacity = 2
        // (i.e. storing values in 0..3) to logCapacity = 5 (i.e. 0..31):
        // node 1 => 8 (+= 7 = 2^0*(2^3-1))
        // nodes 2..3 => 16..17 (+= 14 = 2^1*(2^3-1))
        // nodes 4..7 => 32..35 (+= 28 = 2^2*(2^3-1))
        // This is easy to see if you draw it on paper.
        // Process the keys by "layers" in the original tree.
        //var scaleR = Long.fromInt(newCapacity / this.capacity - 1);
        newCapacity = Long.fromInt(newCapacity);
        
        var scaleR = newCapacity.div(this.capacity).subtract(LONG_ONE);
        var keys = this.node2count.getSortedKeys();
        //var scaleL = 1;
        var scaleL = LONG_ONE; //Long.fromInt(1);
        
        for (var i=0; i<keys.length; i++) {
            //while (scaleL <= keys[i] / 2) {
            //console.log("begin while");
            while (scaleL.lessThanOrEqual(keys[i].div(LONG_TWO))) {
                //scaleL <<= 1;
                scaleL = scaleL.shiftLeft(1);
                
                //if (scaleL.greaterThan(LONG_ONE))
                //console.log((new Date()).getTime(), scaleL.toString(), "<=", keys[i].div(LONG_TWO).toString());
                //if (scaleL.equals(0)) console.log(scaleL.toString());
            }
            
            //console.log("end while");
            
            //newNode2count.add(keys[i] + scaleL * scaleR, this.node2count.get(keys[i]).value);
            //var key = keys[i].add(scaleL).multiply(scaleR);
            var key = scaleL.multiply(scaleR).add(keys[i]);
            newNode2count.add(key, this.node2count.get(keys[i]).value);
            if (key.isNegative()) console.log('NEGATIVE', key.toString());
        }
        
        this.node2count = newNode2count;
        this.capacity = newCapacity;
        //console.log("new capacity:", newCapacity.toString());
        this.compressFully();
        //console.log('rebuildToCapacity -- end');
    },
    
    compressFully: function() {
        //console.log('compressFully -- begin');
        // Restore property 2 at each node.
        var allNodes = this.node2count.getSortedKeys();
        
        for (var i=0; i<allNodes.length; i++) {
            // The root node is not compressible: it has no parent and no sibling
            if (!this.isRoot(allNodes[i]))
            {
                this.compressDownward(allNodes[i]);
            }
        }
        //console.log('compressFully -- end');
    },
    
    /**
     * Restore P2 at node and upward the spine. Note that P2 can vanish
     * at some nodes sideways as a result of this. We'll fix that later
     * in compressFully when needed.
     */
    compressUpward: function(node) {
        //console.log('compressUpward -- begin');
        var threshold = Math.floor(this.size / this.compressionFactor);
        var atNode = this.get(node);
        
        while (!this.isRoot(node)) {
            if (atNode > threshold) {
                break;
            }
            
            var atSibling = this.get(this.sibling(node));
            if (atNode + atSibling > threshold) {
                break;
            }
            
            var atParent = this.get(this.parent(node));
            if (atNode + atSibling + atParent > threshold) {
                break;
            }

            this.node2count.addInc(this.parent(node), atNode + atSibling);
            this.node2count.remove(node);
            
            if (atSibling > 0) {
                this.node2count.remove(this.sibling(node));
            }
            
            node = this.parent(node);
            atNode = atParent + atNode + atSibling;
        }
        //console.log('compressUpward -- end');
    },
    
    /**
     * Restore P2 at seedNode and guarantee that no new violations of P2 appeared.
     */
    compressDownward: function(seedNode) {
        //console.log('compressDownward -- begin');
        var threshold = Math.floor(this.size / this.compressionFactor);
        // P2 check same as above but shorter and slower (and invoked rarely)
        var q = new fifo();
        q.push(seedNode);

        while (q.length != 0) {
            //console.log((new Date()).getTime(), q.length);
            var node = q.shift();
            var atNode = this.get(node);
            var atSibling = this.get(this.sibling(node));
            

            if (atNode == 0 && atSibling == 0) {
                continue;
            }
            
            var atParent = this.get(this.parent(node));
            if (atParent + atNode + atSibling > threshold) {
                continue;
            }
            
            this.node2count.addInc(this.parent(node), atNode + atSibling);
            if (!this.node2count.remove(node)) {
                //console.log('Unable to remove node', node.toString());
                //console.log('Is negative:', node.isNegative());
            }
            if (!this.node2count.remove(this.sibling(node))) {
                //console.log('Unable to remove sibling node', this.sibling(node).toString());
            }
            
            // Now P2 could have vanished at the node's and sibling's subtrees since they decreased.
            if (!this.isLeaf(node)) {
                q.push(this.leftChild(node));
                q.push(this.leftChild(this.sibling(node)));
            }
        }
        //console.log('compressDownward -- done');
        //console.log('compressDownward -- end');
    },
    
    get: function(node) {
        var item = this.node2count.get(node);
        return (item != null) ? item.value : null;
    },
    
    getQuantile: function(q) {
        var ranges = this.toAscRanges();
        var s = 0;
        
        for (var i=0; i<ranges.length; i++) {
            s += ranges[i][2];
            if (s > q * this.size) {
                return ranges[i][1];
            }
        }
        
        return ranges[ranges.length - 1][1];
    },
    
    toAscRanges: function() {
        var ranges = [];
        
        var keys = this.node2count.getSortedKeys();
        
        for (var i=0; i<keys.length; i++) {
            ranges.push([this.rangeLeft(keys[i]), this.rangeRight(keys[i]), this.node2count.get(keys[i]).value]);
        }
        
        ranges.sort(RANGES_COMPARATOR);
        return ranges;
    },
    
    computeActualSize: function() {
        var res = 0;
        var pairs = this.node2count.getKeyValuePairs();
        
        pairs.forEach(function(pair) {
            res += pair.value;
        });
        
        return res;
    }
};

QDigest.unionOf = function(a, b) {
    if (!(a instanceof QDigest) || !(b instanceof QDigest)) {
        throw new Error('Both arguments should be instance of QDigest');
    }

    if (a.compressionFactor != b.compressionFactor) {
        throw new Error(
                "Compression factors must be the same: " +
                        "left is " + a.compressionFactor + ", " +
                        "right is " + b.compressionFactor);
    }
    
    if (a.capacity.greaterThan(b.capacity)) {
        return QDigest.unionOf(b, a);
    }

    var res = new QDigest(a.compressionFactor);
    res.capacity = a.capacity;
    res.size = a.size + b.size;
    
    a.node2count.getKeys().forEach(function(k) {
        res.node2count.addInc(k, a.get(k));
    });

    if (b.capacity.greaterThan(res.capacity)) {
        res.rebuildToCapacity(b.capacity);
    }
    
    b.node2count.getKeys().forEach(function(k) {
        res.node2count.addInc(k, b.get(k));
    });

    res.compressFully();

    return res;
};

module.exports = QDigest;
