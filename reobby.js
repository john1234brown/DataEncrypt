const babel = require('@babel/core');
const t = require('@babel/types');
const template = require('@babel/template').default;
const esprima = require('esprima');
const fs3 = require('fs');
//const vm = require('node:vm'); //TODO: Get this to work when i do then we have full on VM module setup encrypted and Obfuscated down to the environment variables!
// Load your code
require('dotenv').config();
const code = fs3.readFileSync('./debugindex2.js', 'utf8');
//const { db, updateEncrypt, updateMaster } = require('./dbinit.js');
//Provided by Ai!
function generateRandomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';   
 // Adjust charset as needed

  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    if (i===0 && randomIndex<50){ //Make sure only character for first index since variables have to be!
        randomString += charset[randomIndex]; 
    }else if (i>=1){
        randomString += charset[randomIndex];
    }
  }


  // Ensure UTF-8 encoding (usually handled implicitly in JavaScript)
  return randomString;
}

function generateConfig(code) {
    // Explicitly set parser options for newer features like template literals
  const options = { tolerant: true, tokens: true };
  const ast = esprima.parseScript(code, options);

  const config = {
    variables: {},
    functions: {}
  };

  const envContent = fs3.readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key.startsWith('DATABASE_LOCATION')){
        acc[key.trim()] = { name: key, value: value.replaceAll('\"', "").trim() };
        return acc;
      }
      acc[key.trim()] = { name: generateRandomString(12), value: value.replaceAll('\"', '').trim() };
      return acc;
    }, {});

  config.envVars = { ...envVars };

  ast.body.forEach(node => {
    //console.log('Type:', node.type, 'What:', node);
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        console.log('Variable declarations', decl.id.name);
        if (decl.id.name == 'os' || decl.id.name == 'fs' || decl.id.name == 'fs2' || decl.id.name == 'crypto' || decl.id.name == 'path' || decl.id.name == 'argon2' || decl.id.name == 'Database'){
          // config.functions[decl.id.name] = decl.id.name;
          return;
        }
        if (decl.id.name && decl.id.name.toUpperCase() === decl.id.name) {
          config.variables[decl.id.name] = generateRandomString(12);
        } else {
          config.variables[decl.id.name] = decl.id.name;
        }
      });
    } else if (node.type === 'FunctionDeclaration') {
        console.log('Function Declaration', node.id.name);
      config.functions[node.id.name] = node.id.name;
    }else if (node.type === 'ExpressionStatement'){
        //console.log('Other:', node.type, 'Name:', node);
        //console.log('')
    }
  });

  return config;
}


const remapVariable = (name, config) => {
    if (config) {
      if (config.variables && config.variables.hasOwnProperty(name)) {
        return config.variables[name];
      } else if (config.envVars && config.envVars.hasOwnProperty(name)) {
        return config.envVars[name].name;
      }
    }
    return name;
  };
  
  const transformCode = (code) => {
    const config = generateConfig(code);
  
    // Setting environment variables for testing purposes
    Object.keys(config.envVars).forEach(key => {
      process.env[config.envVars[key].name] = config.envVars[key].value;
    });
  
    fs3.writeFileSync('config.json', JSON.stringify(config, null, 2));
  
    return babel.transformSync(code, {
      plugins: [
        {
          visitor: {
            Identifier(path) {
              const nodeName = path.node.name;  
              // Check if the identifier refers to process.env
              if (nodeName.startsWith('process.env.')) {
                const envVarName = nodeName.split('.')[2]; // Extract the variable part
                const remappedName = remapVariable(envVarName, config);
                if (typeof remappedName === 'string') {
                  path.node.name = `process.env.${remappedName}`;
                }
              } else {
                const remappedName = remapVariable(nodeName, config);
                if (typeof remappedName === 'string') {
                  path.node.name = remappedName;
                }
              }
            }
          }
        }
      ]
    }).code;
};
/*
const transformCodeRemoveConsoleLogs = (code) => {
    const config = generateConfig(code);
  
    return babel.transform(code, {
      plugins: [
        {
          visitor: {
            CallExpression(path) {
              const callee = path.node.callee;
              if (callee.type === 'MemberExpression' &&
                  callee.object.type === 'Identifier' &&
                  callee.object.name === 'console' &&
                  ['log', 'error'].includes(callee.property.name)) {*/
//                path.replaceWith(t.commentLine('/* ' + path.node.toString() + ' */')); 
/*
              }
            }
          }
        }
      ]
    }).code;
};*/
/*const transformCode = (code) => {
    const config = generateConfig(code);
  
    // Setting environment variables
    Object.keys(config.envVars).forEach(key => {
      console.log('process key:', key);
      console.log('Process', config.envVars[key].name);
      process.env[config.envVars[key].name] = config.envVars[key].value;
    });

    console.log('process environment:', process.env);
  
    fs3.writeFileSync('config.json', JSON.stringify(config));
  
    return babel.transform(code, {
      plugins: [
        {
          visitor: {
            Identifier(path) {
            const nodeName = path.node.name;
            // Check if the identifier refers to process.env
            if (nodeName.startsWith('process.env.')) {
                console.log('NodeName is:', nodeName);
            }
              const remappedName = remapVariable(nodeName, config);
              if (typeof remappedName === 'string') {
                path.node.name = remappedName;
              }
            }
          }
        }
      ]
    }).code;
};*/

/*const transformCode = (code) => {
  const config = generateConfig(code);
  fs2.writeFileSync('config.json', JSON.stringify(config));
  return babel.transform(code, {
    plugins: [
      {
        visitor: {
          Identifier(path) {
            const nodeName = path.node.name;
            if (config[nodeName]) {
              const obfuscatedValue = obfuscate(config[nodeName]);
              path.node.name = obfuscatedValue;
            }
          }
        }
      }
    ]
  }).code;
};*/

// Transform and execute
/*
const transformedCode = transformCode(code);
fs3.writeFileSync('babelifed-debug.js', transformedCode);
const fn = new Function(transformedCode);
fn();
*/
const transformedCode = transformCode(code);
fs3.writeFileSync('babelifed-debug.js', transformedCode);
//eval(transformedCode); // Try to use vm method as its more secure then eval eval is not recommended!
// Send a message from the outer scope
//sharedObject.send('Hello from outer scope');

//const transformedCode = transformCode(code);

// Execute the transformed code
eval(transformedCode);

// Receive a message from the inner scope
//const message = sharedObject.receive();
//console.log(message); // Output: "Message from inner scope"
/*
const script = new vm.Script(transformedCode);
const context = vm.createContext({ ...global, require, process });
script.runInContext(context);*/