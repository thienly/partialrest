var diff = require('deep-diff');
var observableDiff = require('deep-diff').observableDiff;
var applyChange = require('deep-diff').applyChange;
var _ = require('lodash');
var fl = require('./readfile');
var fs = require('fs');
var JsDiff = require('diff');
/**
Extracting the detta and generate autorest based on that.
 */

// var allModels = [];

// var promise1 = fl.readFile('swagger1.json');
// var promise2 = fl.readFile('swagger2.json');
// var template = fs.readFileSync('template.json','utf-8');

// promise1.then(x=>{
//   promise2.then(y=>{    
//        var target = JSON.parse(template);  
//        var allModels=[];
//        var allPaths ={};   
//        observableDiff(x, y, function (d) {
         
//            if (d.path.indexOf('paths') !== -1){
//             if (d.kind == 'N' || d.kind == 'E'){
//               let fullCtlr = d.path[d.path.length -1];
//               if (fullCtlr == '/api/v0.1/CycleCount/CheckCycleCount'){
//                 console.log(fullCtlr);
//               }
//               let spl = fullCtlr.split('/');
//               let ctl = spl[spl.length - 2];
//               allPaths = _.transform(y.paths,function(result, value, key) {                
//                 if (key.indexOf(ctl) !== -1){
//                   result[key] = value;    
//                 }
//               }, {});      
//               for(let k in allPaths){
//                 let p = allPaths[k];
//                 if (p) {
//                   var refProperty = findProperty(p,'$ref');
//                   refProperty.forEach(i => {
//                      var model = getLastPart(i['$ref'],'/');
//                      var realModel = _.get(y,'definitions.'+ model);
                     
//                      var pushedData = {};
//                      pushedData[model] = realModel;
//                      // find child references
//                      var refOfModels = findPropertyWithRecursion(_.get(y,'definitions'),realModel,'$ref');
//                      refOfModels.forEach(i=>{
//                        //let name = getLastPart(i['$ref'],'/');
//                        let model = _.get(y,'definitions.'+ i);  
//                        let item = {};
//                        item[i]= model;
//                        allModels.push(item);
//                      });
//                      // end finding child references
   
//                      allModels.push(pushedData);  
//                   });               
//                 }
//               };                     
//             }} else if (d.kind == 'A'){
//               let path = _.join(d.path,'.');              
//               var rValue = _.get(y,path);
//               applyChange(target, y, d);        
//               _.set(target,path,rValue);
//            } else {                 
//             applyChange(target, y, d);        
//           }   
//       });

//       allModels.forEach(i=>{
//         _.assign(target['definitions'],i)
//       });
//       _.assign(target['paths'],allPaths);
//       console.log(JSON.stringify(target,null,4));
      
//       var file = fs.createWriteStream('result.json');
//       file.write(JSON.stringify(target,null,4));
//       file.end();          
//   });
// });


function findProperty(obj, key) {
  if (_.has(obj, key)) // or just (key in obj)
      return [obj];

  return _.flatten(_.map(obj, function(v) {
      return typeof v == "object" ? findProperty(v, key) : [];
  }), true);
}
function getLastPart(str,delimeter){
  var len = str.split(delimeter).length - 1;
  return str.split(delimeter)[len];
}

function findPropertyWithRecursion(fullObj,obj,key){
  var arr = findProperty(obj,key);
  if (arr.length == 0){
    var de = _.findKey(fullObj,obj);
    return [de];
  }
  return _.flatten(_.map(arr, function(v) {
    //var x = _.get(fullObj,'definitions.'+ v[getLastPart(key)]);
    var x = _.get(fullObj,getLastPart(v[key],'/'));
    if (!x) 
      return [];
    return findPropertyWithRecursion(fullObj,x,key)
  }));   
}


var t1 = fs.readFileSync('testing.json',{encoding:'utf-8'});
t1 = JSON.parse(t1);
var xxxx = _.get(t1,'GenerateReadyBinItemModel');

var fdata = findPropertyWithRecursion(t1,xxxx,'$ref');
console.log(fdata);