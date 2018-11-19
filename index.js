#!/usr/bin/env node
var _ = require('lodash');
var fl = require('./readfile');
var fs = require('fs');
var axios = require('axios');
const { exec } = require('child_process');
const program = require('commander');
const inquirer = require('inquirer');
const target = require('./template/template');
var validUrl = require('valid-url');

const questions = [  
  {
    type : 'input',
    name : 'swaggerurl',
    message : 'Enter swagger url ...(example: http://localhost/swagger/v1/swagger.json)',    
    validate: function(value) {
      var pass = validUrl.isUri(value);
      if (pass) {
        return true;
      }

      return 'Please enter correct http url';
    }
  },
  {
    type : 'input',
    name : 'ctls',
    message : 'Enter controller name (seperated by ,: example: /api/v0.1/Aisle)'  
  },
  {
    type: 'list',
    message: 'Select namespaces',
    name: 'ns',
    choices: [
      new inquirer.Separator(' = Select namespaces = '),
      {
        name: 'Eton.Wms.ClientCentral.Services.RestClient'
      },
      {
        name: 'Eton.Wms.Admin.Services.RestClient.NetCore'
      },
      {
        name: 'Eton.Wms.Operations.Services.RestClient.NetCore'
      }            
    ],
    validate: function(answer) {
      if (answer.length < 1) {
        return 'You must choose at least one topping.';
      }
      return true;
    }
  },
  {
    type : 'input',
    name : 'oFolder',
    message : 'Enter the path of output folder (optional)'  
  },

];
program.version('0.0.1', "-v, --version")                
        .description('Autorest generation with specific controller');

program.command('gen')
       .alias('g')
       .description('Generate autorest')
       .action((swaggerUrl, controllerName) => {
        inquirer.prompt(questions).then(answer=>{           
           var swagger = answer.swaggerurl;
           var ctls = answer.ctls.split(',');                    
           gen(ctls,swagger,answer.ns,answer.oFolder)
         })
         
       });        

program.parse(process.argv);
if (!program.args.length) 
  program.help();

function gen(ctls,swaggerUrl,ns,outputFolder){  
    axios({
      method: 'get',
      url: swaggerUrl, //'http://10.0.19.116:32133/swagger/v1/swagger.json',
      responseType: 'stream'
    })
    .then((response)=>{  
      response.data.pipe(fs.createWriteStream('data.json'));
      response.data.on('end',function(d){         
          fl.readFile('data.json').then(dt=>{
          for(var key in dt.paths){

            var isExisted = _.findIndex(ctls, function(o) { 
                return _.toLower(key).indexOf(_.toLower(o)) != -1;
            });

            if (isExisted != -1) {
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
          var cmd = 'autorest --input-file=result.json --csharp  ';
          if (ns){
            cmd += `--namespace=${ns}  `;
          }
          if (outputFolder){
            cmd += `--output-folder=${outputFolder} `;
          }        
          exec(cmd,function (error, stdout, stderr) {
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