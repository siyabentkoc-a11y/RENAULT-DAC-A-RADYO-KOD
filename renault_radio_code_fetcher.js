/*
Renault/Dacia Radio Code fetcher — Node.js
Usage:
  - This is intended to be packaged as a standalone EXE using `pkg`.
  - Run as: renault_radio_code_fetcher.exe V589
Notes:
  - This script downloads a public open-source generator JS and tries to compute the unlock code.
  - Use at your own risk.
*/
const https = require('https');
const {VM} = require('vm2');

const PRECODE = process.argv[2];
if(!PRECODE){
  console.error('Usage: renault_radio_code_fetcher.js PRECODE  (e.g. V589)');
  process.exit(1);
}

const candidates = [
  'https://raw.githubusercontent.com/m-a-x-s-e-e-l-i-g/renault-radio-code-generator/main/main.js',
  'https://renault-dacia-radio-code-generator.netlify.app/main.js',
  'https://renault-dacia-radio-code-generator.netlify.app/index.js',
  'https://renault-dacia-radio-code-generator.netlify.app/assets/main.js',
  'https://raw.githubusercontent.com/mtojek/autoradio-renault/main/main.js'
];

function fetchUrl(url){
  return new Promise((resolve, reject)=>{
    https.get(url, res =>{
      if(res.statusCode !== 200){
        res.resume();
        return reject(new Error('Status code: '+res.statusCode));
      }
      let data='';
      res.on('data', chunk => data += chunk);
      res.on('end', ()=> resolve(data));
    }).on('error', reject);
  });
}

(async ()=>{
  let lastErr=null;
  for(const url of candidates){
    try{
      console.log('Trying', url);
      const js = await fetchUrl(url);
      const {VM: VM2} = require('vm2');
      const vm = new VM2({timeout:2000, sandbox:{}});
      const wrapper = `
        (function(){
          var exports = {};
          var module = {exports:exports};
          var window = {};
          var document = {};
          ${js}
          return (typeof generateCode !== 'undefined' && generateCode) || module.exports || exports || (typeof calcCode !== 'undefined' && calcCode) || (typeof precodeToCode !== 'undefined' && precodeToCode) || window.generateCode || window.calcCode || null;
        })()
      `;
      const gen = vm.run(wrapper);
      if(!gen){
        console.log('No obvious generator exported in this JS. Trying heuristic function extraction...');
        const tryNames = ['generateCode','calc','calcCode','precodeToCode','decode','compute','generate','radioCode'];
        let found=false;
        for(const name of tryNames){
          try{
            const testWrapper = `
              (function(){
                var exports = {};
                var module = {exports:exports};
                var window = {};
                var document = {};
                ${js}
                return (typeof ${name} === 'function') ? ${name} : null;
              })()
            `;
            const fn = vm.run(testWrapper);
            if(fn){
              console.log('Found function:', name);
              const out = fn(PRECODE);
              console.log('Code for',PRECODE,':',out);
              found=true;
              process.exit(0);
            }
          }catch(e){/* continue */}
        }
        if(!found) throw new Error('No generator function found in '+url);
      }

      let code=null;
      if(typeof gen === 'function'){
        code = gen(PRECODE);
      }else if(gen && typeof gen.generateCode === 'function'){
        code = gen.generateCode(PRECODE);
      }else if(gen && typeof gen.calc === 'function'){
        code = gen.calc(PRECODE);
      }else if(gen && typeof gen.default === 'function'){
        code = gen.default(PRECODE);
      }

      if(code){
        console.log('===== RESULT =====');
        console.log('Precode:', PRECODE);
        console.log('Unlock code:', String(code));
        process.exit(0);
      }else{
        throw new Error('Generator present but calling it did not return a result');
      }

    }catch(err){
      lastErr = err;
      console.error('Failed for',url,':', err.message);
    }
  }
  console.error('\\nAll candidate sources failed. Last error:\\n', lastErr && lastErr.stack ? lastErr.stack : lastErr);
  console.error('\\nIf this fails, open the official open-source generator at https://github.com/m-a-x-s-e-e-l-i-g/renault-radio-code-generator or the Netlify demo at https://renault-dacia-radio-code-generator.netlify.app and run it in your browser.');
  process.exit(2);
})();