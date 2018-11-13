var _ = require('lodash');
var fl = require('./readfile');
var fs = require('fs');
const argv = require('yargs').argv
var axios = require('axios');
const { exec } = require('child_process');
const program = require('commander');
program.version('0.0.1', "-v, --version")                
        .description('Autorest generation with specific controller');

program.command('gen  <swaggerUrl> [controllerName...]')
       .alias('g')
       .description('Generate autorest')
       .action((swaggerUrl, controllerName) => {
         gen(controllerName,swaggerUrl)
       });        

// program.on('--help', function(){
//         console.log('');
//         console.log('Examples:');
//         console.log('');
//         console.log('  $ custom-help --help');
//         console.log('  $ custom-help -h');
//     });
program.parse(process.argv);
if (!program.args.length) 
  program.help();


function gen(ctls,swaggerUrl){  
    axios({
      method: 'get',
      url: swaggerUrl, //'http://10.0.19.116:32133/swagger/v1/swagger.json',
      responseType: 'stream'
    })
    .then((response)=>{  
      response.data.pipe(fs.createWriteStream('data.json'));
      response.data.on('end',function(d){
          var template = fs.readFileSync('template.json','utf-8');
          var target = JSON.parse(template);

          fl.readFile('data.json').then(dt=>{
          for(var key in dt.paths){

            if (_.toLower(key).indexOf(_.toLower(ctls[0])) != -1) {
              var value = dt.paths[key];
              var allModels = [];
              let n = {};
              n[key] = value;
              _.assign(target['paths'],n);
              var refProperty = findProperty(value,'$ref');
              refProperty.forEach(i => {
                  var model = getLastPart(i['$ref'],'/');
                  var realModel = _.get(dt,'definitions.'+ model);
                  
                  var pushedData = {};
                  pushedData[model] = realModel;
                  // find child references
                  var refOfModels = _.uniq(findPropertyWithRecursion(_.get(dt,'definitions'),realModel,'$ref'));
                  refOfModels.forEach(i=>{
                    //let name = getLastPart(i['$ref'],'/');
                    let model = _.get(dt,'definitions.'+ i);  
                    let item = {};
                    item[i]= model;
                    allModels.push(item);
                  });
                  // end finding child references

                  allModels.push(pushedData);  
              }); 
              allModels.forEach(i=>{
                _.assign(target['definitions'],i)
              });
            }
          }
          console.log(JSON.stringify(target,null,4));
          var result = fs.createWriteStream('result.json',{encoding:'utf-8'});    
          result.write(JSON.stringify(target,null,4));
          result.on('end',function(d){
            result.end();
          });          
          exec('autorest --input-file=result.json  --csharp',function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
          });
        });
      });
    }); 
}
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
    return de;
  }
  return _.flattenDeep(_.map(arr, function(v) { 
    var x = _.get(fullObj,getLastPart(v[key],'/'));
    if (!x) 
      return;    
    var d = findPropertyWithRecursion(fullObj,x,key);
    if (d) {
       if (d != getLastPart(v[key],'/')){
          return [d,getLastPart(v[key],'/')];
       }else 
          return [d];
    }
  }));   
}