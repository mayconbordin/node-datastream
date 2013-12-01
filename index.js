var countmin         = require('./lib/counter/countmin-sketch.js')
  , spacesaving      = require('./lib/counter/spacesaving.js')
  , lossy            = require('./lib/counter/lossy.js')
  , lossyvar         = require('./lib/counter/lossy-variant.js')
  , stickysampling   = require('./lib/counter/sticky-sampling.js')
  , frequent         = require('./lib/counter/frequent.js')
  , real             = require('./lib/counter/real.js')
  ;

module.exports = {
    CountMinSketch: countmin,
    SpaceSaving: spacesaving,
    LossyCounting: lossy,
    LossyCountingVariant: lossyvar,
    StickySampling: stickysampling,
    Frequent: frequent,
    RealCounting: real
};
