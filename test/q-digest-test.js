var nodeunit = require('nodeunit')
  , MersenneTwister = require('mersennetwister')
  , QDigest  = require('../lib/quantile/q-digest.js')
  , fn = require('../lib/fn.js')
  ;
  
function actualRankOf(x, ys) {
    var numSmaller = 0;
    var numEqual   = 0;
    
    ys.forEach(function(y) {
        if (y < x) numSmaller++;
        if (y == x) numEqual++;
    });
    
    return [
        1.0 * numSmaller / ys.length,
        1.0 * (numSmaller + numEqual) / ys.length
    ];
}

function arraycopy(src, srcPos, dest, destPos, length) {
    for (var i=srcPos, j=destPos; i<length; i++, j++) {
        dest[j] = src[i];
    }
}

exports['qdigest'] = nodeunit.testCase({
    'test comprehensive on mixture': function (test) {
        var r = new MersenneTwister();
        var dists = [
            [100, 50],
            [150, 20],
            [500, 300],
            [10000, 10000]
        ];
        
        [1, 10, 100, 1000].forEach(function(numSamples) {
            var samples = new Array(dists.length);
            
            for(var i = 0; i < dists.length; ++i) {
                samples[i] = new Array(numSamples);
                for (var j = 0; j < samples[i].length; ++j) {
                    var num = fn.getRandNormalDistNumber(dists[i][0], dists[i][1], function(){return r.rnd()});
                    samples[i][j] = Math.floor(Math.max(0, num));
                }
            }
            
            var compressionFactor = 1000;
            var logCapacity = 1;
            var max = 0;
            
            samples.forEach(function(s) {
                s.forEach(function(x) {
                    max = Math.max(max, x);
                });
            });
            
            for (var scale = 1; scale < max; scale *= 2, logCapacity++) {
                ;
            }
            
            var eps = logCapacity / compressionFactor;
            
            var digests = new Array(dists.length);
            for (var i = 0; i < digests.length; ++i) {
                digests[i] = new QDigest(compressionFactor);
                
                samples[i].forEach(function(x) {
                    digests[i].offer(x);
                });

                test.equal(samples[i].length, digests[i].computeActualSize());
            }
            
            var numTotal = 0;
            for (var i = 0; i < digests.length; ++i) {
                for (var q = 0; q <= 1; q += 0.01) {
                    var res = digests[i].getQuantile(q);
                    var actualRank = actualRankOf(res, samples[i]);
                    test.ok(q >= actualRank[0] - eps && q <= actualRank[1] + eps,
                            actualRank[0] + " .. " + actualRank[1] + " outside error bound for  " + q);
                }

                // Test the same on the union of all distributions up to i-th
                numTotal += samples[i].length;
                var total = new Array(numTotal);
                var offset = 0;
                var totalDigest = new QDigest(compressionFactor);
                var expectedSize = 0;
                for (var j = 0; j <= i; ++j) {
                    arraycopy(samples[j], 0, total, offset, samples[j].length);
                    offset += samples[j].length;
                    totalDigest = QDigest.unionOf(totalDigest, digests[j]);
                    expectedSize += samples[j].length;
                }
                
                test.equal(expectedSize, totalDigest.computeActualSize());
                
                for (var q = 0; q <= 1; q += 0.01) {
                    var res = totalDigest.getQuantile(q);
                    var actualRank = actualRankOf(res, total);
                    test.ok(q >= actualRank[0] - eps && q <= actualRank[1] + eps,
                            actualRank[0] + " .. " + actualRank[1] + " outside error bound for  " + q);
                }
            }
        });
        
        test.done();
    },
    
    'test merge': function (test) {
        var compressionFactor = 2;

        var aSamples = [0,0,1,0,1,1];
        var bSamples = [0,1,0,0,0,3];
        var allSamples = aSamples.concat(bSamples);

        var a = new QDigest(compressionFactor);
        var b = new QDigest(compressionFactor);
        var c = new QDigest(compressionFactor);
        
        aSamples.forEach(function(x) {
            a.offer(x);
        });
        
        bSamples.forEach(function(x) {
            b.offer(x);
        });
        
        allSamples.forEach(function(x) {
            c.offer(x);
        });
        
        var ab = QDigest.unionOf(a, b);

        test.equal(allSamples.length, c.computeActualSize());

        var logCapacity = 1;
        var max = 0;
        
        allSamples.forEach(function(x) {
            max = Math.max(max, x);
        });
        
        for (var scale = 1; scale < max; scale *= compressionFactor, logCapacity++) {}

        var eps = logCapacity / compressionFactor;
        for (var q = 0; q <= 1; q += 0.01)
        {
            var res = c.getQuantile(q);
            var actualRank = actualRankOf(res, allSamples);
            test.ok(q >= actualRank[0] - eps && q <= actualRank[1] + eps,
                    actualRank[0] + " .. " + actualRank[1] + " outside error bound for  " + q);
        }
        
        test.done();
    }
});
