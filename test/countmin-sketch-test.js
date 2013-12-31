var nodeunit       = require('nodeunit')
  , CountMinSketch = require('../lib/counter/countmin-sketch.js')
  , fn             = require('../lib/fn.js')
  ;

exports['accuracy'] = nodeunit.testCase({
    'integer set': function (test) {
        
        var seed = 7364181;
        var numItems = 1000;
        var xs = new Array(numItems);
        var maxScale = 20;
        for (var i = 0; i < xs.length; ++i)
        {
            var scale = fn.getRandomInt(0, maxScale);
            xs[i] = fn.getRandomInt(0, 1 << scale);
        }
    
        var epsilon = 10e-7;
        var delta   = 0.005;
        
        var counter = new CountMinSketch({epsilon: epsilon, delta: delta, k: maxScale});
        xs.forEach(function(v) {
            counter.update(v, 1);
        });
        
        var actualFreq = {};
        xs.forEach(function(v) {
            if (typeof(actualFreq[v]) == 'undefined') actualFreq[v] = 1;
            else actualFreq[v]++;
        });
        
        var numErrors = 0;
        fn.foreach(actualFreq, function(v, k) {
            var ratio = 1.0 * (counter.topK[k].value - actualFreq[k]) / xs.length;
            if (ratio > 1.0001) {
                numErrors++;
            }
        });

        var pCorrect = 1 - 1.0 * numErrors / fn.objSize(actualFreq);
        
        //console.log("Confidence: required " + delta + ", reached " + pCorrect);

        test.ok(pCorrect > delta, "Confidence not reached: required " + delta + ", reached " + pCorrect);
        test.done();
    },
    
    'string set': function (test) {
        
        var seed = 7364181;
        var numItems = 100;
        var xs = new Array(numItems);
        var maxScale = 20;
        for (var i = 0; i < xs.length; ++i)
        {
            var scale = fn.getRandomInt(0, maxScale);
            xs[i] = fn.randomString(1 << scale);
        }
    
        var epsilon = 10e-7;
        var delta   = 0.005;
        
        var counter = new CountMinSketch({epsilon: epsilon, delta: delta, k: maxScale});
        xs.forEach(function(v) {
            counter.update(v, 1);
        });
        
        var actualFreq = {};
        xs.forEach(function(v) {
            if (typeof(actualFreq[v]) == 'undefined') actualFreq[v] = 1;
            else actualFreq[v]++;
        });
        
        var numErrors = 0;
        fn.foreach(actualFreq, function(v, k) {
            var ratio = 1.0 * (counter.topK[k].value - actualFreq[k]) / xs.length;
            if (ratio > 1.0001) {
                numErrors++;
            }
        });

        var pCorrect = 1 - 1.0 * numErrors / fn.objSize(actualFreq);
        
        //console.log("Confidence: required " + delta + ", reached " + pCorrect);

        test.ok(pCorrect > delta, "Confidence not reached: required " + delta + ", reached " + pCorrect);
        test.done();
    }
});
