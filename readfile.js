var fs = require('fs'),
  JSONStream = require('JSONStream'),
  es = require('event-stream');

function readFile(fileName){
    var promise = new Promise(function(resolve,reject){
      var swagger = function () {
        var stream = fs.createReadStream(fileName, {encoding: 'utf8',start:3}),
            parser = JSONStream.parse();
            return stream.pipe(parser);
      };  
      var data1 ={};  
      swagger().pipe(es.mapSync(function(x){
        data1 = x;
        return x;
      })).on('end',function(xx){
        resolve(data1);
      });
    });
    return promise;    
  }

 module.exports = {readFile}; 