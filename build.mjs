import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { compile } from '@vue/compiler-dom';
const remixIconPaths = {
 register:'Device/computer', orders:'Document/receipt', products:'Others/box-3',
 categories:'Finance/price-tag-3', units:'Design/ruler-2', suppliers:'Map/truck',
 logout:'System/logout-box-r', menu:'System/menu', trash:'System/delete-bin',
 basket:'Finance/shopping-basket', user:'User & Faces/user-3', note:'Document/file-text',
 backspace:'System/delete-back-2', card:'Finance/bank-card', search:'System/search',
 grid:'System/apps-2', drink:'Food/goblet', snack:'Food/cake-3', pantry:'Others/box-3',
 produce:'Others/leaf', archive:'Business/archive', view:'System/eye',
 edit:'Design/pencil', add:'System/add', close:'System/close', remove:'System/subtract',
 refresh:'System/refresh', back:'Arrows/arrow-left', barcode:'Device/barcode',
};
const remixIcons = Object.fromEntries(Object.entries(remixIconPaths).map(([name, path]) => {
 const svg = readFileSync('node_modules/remixicon/icons/'+path+'-line.svg', 'utf8');
 const markup = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]?.trim();
 if (!markup) throw new Error('Could not compile Remix Icon: '+name);
 return [name, markup];
}));
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
copyFileSync('node_modules/remixicon/License','dist/remixicon-LICENSE.txt');
execFileSync(process.execPath,['node_modules/tailwindcss/lib/cli.js','-i','src/style.css','-o','dist/style.css','--content','src/index.html,src/app.js','--minify'],{stdio:'inherit'});
