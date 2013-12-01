#!/usr/local/bin/node

var fs       = require('fs')
  , readline = require('readline')
  , stream   = require('stream')
  , ds       = require('../')
  ;
  
var algorithms = {
    'countmin'        : {ref: ds.CountMinSketch, options: {delta: 1e-7, epsilon: 0.05, k: 10}},
    'spacesaving'     : {ref: ds.SpaceSaving, options: {maxEntries: 100}},
    'lossycounting'   : {ref: ds.LossyCounting, options: {epsilon: 5e-3, support: 10}},
    'lossycountingvar': {ref: ds.LossyCountingVariant, options: {epsilon: 5e-3, support: 10}},
    'stickysampling'  : {ref: ds.StickySampling, options: {epsilon:0.001, support: 0.01, delta: 10e-4}},
    'frequent'        : {ref: ds.Frequent, options: {epsilon: 1e-4}},
    'real'            : {ref: ds.RealCounting, options: {}}
};

var algorithm = process.argv[2];
var inputfile = process.argv[3];

if (!(algorithm in algorithms)) {
    console.error('Valid algorithms: ');
    for (algo in algorithms) console.error(' ', algo);
    process.exit(1);
}

var algo = algorithms[algorithm];
var inst = new algo.ref(algo.options);
var instream = fs.createReadStream(inputfile);

var rl = readline.createInterface({
    input: instream,
    terminal: false
});

rl.on('line', function(line) {
    if (line.length > 1) {
        var obj = JSON.parse(line);
        var hashtags = obj.text.match(/#(\w+)/g);
        if (hashtags && hashtags.length > 0)
            for (i in hashtags) {
                var hashtag = hashtags[i].replace('#', '').toUpperCase();
                inst.update(hashtag, 1);
            }
    }
});

rl.on('close', function() {
    var topK = inst.getTopK(10);
    
    if (!topK) return;
    
    topK.forEach(function(item) {
        console.log(item.value, item.key);
    });
});
