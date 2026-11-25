import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { compile } from '@vue/compiler-dom';
import { remixIcons } from './src/vendor/remixicon/icons.mjs';
const html = readFileSync('src/index.html','utf8');
const template = html.match(/<div id="app" v-cloak>([\s\S]+)<\/div>\s*<noscript>/)[1];
const code = compile(template,{mode:'function',whitespace:'condense'}).code;
mkdirSync('dist',{recursive:true});
writeFileSync('dist/index.html',html.replace(template,''));
const configuredBase=process.env.POS_API_BASE_URL?.trim();
let apiBase='';
if(configuredBase){
 const url=new URL(configuredBase);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash){
  throw new Error('POS_API_BASE_URL must be an HTTP(S) base URL without credentials, query or fragment.');
 }
 apiBase=url.toString().replace(/\/+$/,'');
}
writeFileSync('dist/app.js','const remixIcons = '+JSON.stringify(remixIcons)+';\nconst posApiBaseUrl = '+JSON.stringify(apiBase)+';\nconst registerRender = (() => {\n'+code+'\n})();\n'+readFileSync('src/app.js','utf8'));
copyFileSync('node_modules/vue/dist/vue.runtime.global.prod.js','dist/vue.global.prod.js');
copyFileSync('node_modules/vue/LICENSE','dist/vue-LICENSE.txt');
copyFileSync(new URL('./src/vendor/remixicon/LICENSE.txt',import.meta.url),'dist/remixicon-LICENSE.txt');
execFileSync(process.execPath,['node_modules/tailwindcss/lib/cli.js','-i','src/style.css','-o','dist/style.css','--content','src/index.html,src/app.js','--minify'],{stdio:'inherit'});
