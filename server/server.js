const express = require('express');
const fs = require('fs');
const historyApiFallback = require('connect-history-api-fallback');
const mongoose = require('mongoose');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const config = require('../config/config');
const webpackConfig = require('../webpack.config');

const isDev = process.env.NODE_ENV !== 'production';
const port  = process.env.PORT || 8080;


// Configuration
// ================================================================================================

// Set up Mongoose
mongoose.connect(isDev ? config.db_dev : config.db);
mongoose.Promise = global.Promise;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
require('./routes')(app);

if (isDev) {
  const compiler = webpack(webpackConfig);

  app.use(historyApiFallback({
    verbose: false
  }));

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve(__dirname, '../client/public'),
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  }));

  app.use(webpackHotMiddleware(compiler));
  app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(express.static(path.resolve(__dirname, '../dist')));
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    res.end();
  });
}


//---------
function convertToRoman(num) {
    console.log(num);
    var out = ""
    var exp_all = (""+num).length - 1;
    for(var exp = exp_all; exp >= 0; exp--){
        var str_num = parseInt((""+num)[exp_all-exp]);
        out += simpleToRoman(str_num*(Math.pow(10,exp)));        
    }
    return out;
}

function simpleToRoman(num){
    var symbols = {
        1:"I",
        5:"V",
        10:"X",
        50:"L",
        100:"C",
        500:"D",
        1000:"M",
        5000:"_V",
        10000:"_X"
    };
    
    var str_num = parseInt((""+num)[0]);
    var exp = (""+num).length - 1;
    var bar_buffer = "";
    while (exp >= 4) {
      bar_buffer += '_';
      exp -= 3;
    }
    console.log(exp);
    var one = bar_buffer + symbols[(10**exp)];
    //console.log(str_num*(10**exp));
    //console.log(one);
    var five = bar_buffer + symbols[(10**exp)*5];
    var ten = bar_buffer + symbols[(10**exp)*10];
    switch(str_num){
        case 0: return "";
        case 1: return one;
        case 2: return one+one;
        case 3: return one+one+one;
        case 4: return one+five;
        case 5: return five;
        case 6: return five+one;
        case 7: return five+one+one;
        case 8: return five+one+one+one;
        case 9: return one+ten
    }
}
app.get("/roman/:num_str?", function (req, res) {
  try{
    var num = parseInt(req.params.num_str);
    if(isNaN(num)){
      throw "Invalid num";
    }
    
    var num_roman = convertToRoman(num);
    res.json({"num" : num,  "roman" : num_roman});
  }
  catch(err){
    res.json({"error" : "Invalid num" });
  }
  
});
//---------



app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.info('>>> 🌎 Open http://0.0.0.0:%s/ in your browser.', port);
});

module.exports = app;
