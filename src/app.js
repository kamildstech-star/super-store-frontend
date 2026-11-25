const svgPaths = {
  register:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/>',
  basket:'<path d="m4 10 2 10h12l2-10H4Zm3 0 5-7 5 7m-7 4v3m4-3v3"/>',
  user:'<circle cx="12" cy="8" r="3.3"/><path d="M5 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>',
  note:'<path d="M5 3h11l3 3v15H5V3Zm10 0v4h4M8 11h8m-8 4h8"/>',
  backspace:'<path d="M2 12 8 5h13a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-6-7Zm10-3 6 6m0-6-6 6"/>',
  card:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 9h18m-14 6h4"/>',
  search:'<circle cx="10.7" cy="10.7" r="6.2"/><path d="m15.3 15.3 4 4"/>',
  grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  drink:'<path d="M7 9h10l-1 11H8L7 9Zm-2 0h14m-6 0 2-6h3"/>',
  snack:'<path d="M5 4h14l-1 3v10l1 3H5l1-3V7L5 4Zm3 5h8m-8 6h8"/>',
  pantry:'<path d="M5 8h14v12H5zM4 4h16v4H4zm6 8h4"/>',
  produce:'<path d="M12 8c-3-3-9-1-8 4 1 5 4 9 8 7 4 2 7-2 8-7 1-5-5-7-8-4Zm0 0V4m0 3c1-3 3-4 5-4"/>'
};
const categories = [
  {id:'all',name:'All products',icon:'grid',color:'#87657f'},
  {id:'drinks',name:'Beverages',icon:'drink',color:'#568eab'},
  {id:'snacks',name:'Snacks',icon:'snack',color:'#bd8548'},
  {id:'grocery',name:'Grocery',icon:'pantry',color:'#aa6d92'},
  {id:'produce',name:'Fresh Produce',icon:'produce',color:'#699177'}
];
const catalog = [
  ['MIN-01','Mineral Water','drinks','piece',60,'bottle','#5bb4e6','#e3f1f7','PURE'],
  ['COL-02','Cola Can','drinks','piece',110,'can','#b8293b','#f5e8eb','COLA'],
  ['MAN-03','Mango Juice','drinks','pack',125,'carton','#d78626','#f9efdb','MANGO'],
  ['MKT-04','Milk 1 L','drinks','pack',280,'carton','#5694bf','#e9f0f7','MILK'],
  ['CHP-05','Salted Chips','snacks','pack',95,'bag','#d8942d','#fbf2df','CHIPS'],
  ['BIS-06','Chocolate Biscuits','snacks','pack',150,'bag','#8c4f3b','#f6ebe5','CHOCO'],
  ['NUT-07','Mixed Nuts','snacks','pack',260,'bag','#a16645','#f5ede3','NUTS'],
  ['POP-08','Caramel Popcorn','snacks','pack',180,'bag','#b6627a','#f8eaf0','POP'],
  ['RIC-09','Basmati Rice','grocery','kg',340,'bag','#739059','#edf1e6','RICE'],
  ['FLR-10','Wheat Flour','grocery','kg',165,'bag','#bf8b58','#f6eee1','FLOUR'],
  ['OIL-11','Cooking Oil 1 L','grocery','bottle',540,'bottle','#d09a39','#f8f0dd','OIL'],
  ['TEA-12','Black Tea','grocery','box',420,'box','#367c79','#e8f2ed','TEA'],
  ['APL-13','Red Apples','produce','kg',320,'apple','#bf374a','#faeaeb',''],
  ['BAN-14','Bananas','produce','dozen',230,'banana','#d7a833','#faf2dd',''],
  ['TOM-15','Tomatoes','produce','kg',190,'tomato','#d64a3d','#f8eae4',''],
  ['ORA-16','Oranges','produce','kg',245,'orange','#e29335','#faecdd','']
].map(([id,name,category,unit,price,shape,ink,tone,label])=>({id,name,category,unit,price:price*100,shape,ink,tone,label}));

function art({shape,ink:c,label:l}) {
 const outline='#271f2c';
 const text=(y,size=7)=>'<text x="65" y="'+y+'" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="850" font-size="'+size+'" letter-spacing=".7" fill="white">'+l+'</text>';
 const packageShapes={
  bottle:'<path d="M56 24h18v14q3 7 9 12 5 4 5 12v39q0 7-8 7H50q-8 0-8-7V62q0-8 5-12 6-5 9-12Z" fill="'+c+'" fill-opacity=".44"/><rect x="54" y="17" width="22" height="11" rx="2" fill="'+c+'"/><path d="M49 59h32v27H49z" fill="'+c+'"/><path d="M49 95h30m-30 5h30M51 54l8-9" fill="none" stroke="white" stroke-opacity=".65"/>'+text(75),
  can:'<rect x="42" y="20" width="46" height="87" rx="9" fill="'+c+'"/><path d="M42 26q23 9 46 0M43 101q22-8 44 0" stroke="#e9dfe3" stroke-width="3" fill="none"/><path d="M43 77c16 0 24-23 45-26v10c-20 5-25 30-45 31Z" fill="white" opacity=".27"/><path d="M47 40v21" stroke="white" opacity=".44" stroke-width="3" stroke-linecap="round"/>'+text(58,10),
  carton:'<path d="M40 42 51 21h39l-9 21v65H40z" fill="'+c+'"/><path d="M81 42l9-21 8 19v61l-17 6Z" fill="'+c+'" style="filter:brightness(.78)"/><path d="M51 21h39l-9 21H40z" fill="#fff" opacity=".64"/><path d="M40 54h41v25H40z" fill="white" opacity=".23"/><circle cx="63" cy="88" r="8" fill="white" opacity=".66"/><path d="M54 20h33v-5H54z" fill="'+c+'"/><g transform="translate(-5 0)">'+text(68,8)+'</g>',
  bag:'<path d="M37 20h56l-3 9 4 70-3 7H39l-3-7 4-70z" fill="'+c+'"/><path d="M38 29h54m-54 69h54" stroke="white" opacity=".6" stroke-dasharray="2 2"/><path d="M38 45c21-14 37 12 54 0v37c-18 13-36-13-54 0Z" fill="white" opacity=".23"/><ellipse cx="64" cy="79" rx="15" ry="8" fill="white" opacity=".50"/><path d="m52 83 9-9m2 11 9-10m1 9 6-6" stroke="'+c+'" fill="none"/>'+text(61,8),
  box:'<path d="M38 37 51 23h46L84 37v63H38Z" fill="'+c+'"/><path d="M84 37l13-14v62l-13 15Z" fill="'+c+'" style="filter:brightness(.73)"/><path d="M38 37 51 23h46L84 37Z" fill="white" opacity=".39"/><rect x="42" y="48" width="38" height="35" rx="2" fill="white" opacity=".25"/><g transform="translate(-4 0)">'+text(67,10)+'</g><path d="M53 75h16" stroke="white" opacity=".7"/>',
  apple:'<path d="M66 49q-1-14 6-20" fill="none" stroke="#664b3a" stroke-width="3"/><path d="M68 44q5-16 21-10-7 12-21 10" fill="#749b59"/><path d="M66 53c-23-15-37-1-34 17 2 19 15 37 34 30 18 7 32-11 34-30 3-18-12-32-34-17Z" fill="'+c+'"/><path d="M41 66q4-12 13-11" stroke="white" opacity=".47" stroke-width="3" fill="none" stroke-linecap="round"/>',
  banana:'<path d="M38 42c-5 29 16 34 41 15 6-4 8-12 10-20l9 1c2 25-16 50-37 53-26 5-40-22-30-43Z" fill="#cf9830"/><path d="M36 42c-1 28 22 38 50 21 7-4 12-10 16-19l6 5c-10 35-40 55-63 42-16-10-21-29-16-48Z" fill="'+c+'"/><path d="M36 53c0 25 26 36 51 22" stroke="#fff2ab" fill="none" stroke-width="3"/><path d="M29 41h9v7h-9z" fill="#876839"/>',
  tomato:'<path d="M38 61c9-12 19-12 28-10 12-2 24 0 31 12 11 19-5 39-31 39-28 0-41-21-28-41Z" fill="'+c+'"/><path d="m66 53 10-10-4 11 16 4-17 3-5 9-3-9-13-4 12-3-4-8z" fill="#698751"/><path d="M46 75q3-8 9-8" stroke="white" opacity=".45" stroke-width="3" stroke-linecap="round" fill="none"/>',
  orange:'<circle cx="65" cy="72" r="31" fill="'+c+'"/><path d="M66 44q3-17 22-11-3 12-22 11" fill="#779454"/><path d="M67 45q-3-6-8-8" fill="none" stroke="#735031" stroke-width="2"/><path d="M44 66q3-10 12-13" stroke="white" opacity=".48" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M50 79h1m13 10h1m15-17h1m-8 8h1m-5-22h1" stroke="#b47135" stroke-width="2" stroke-linecap="round" opacity=".53"/>'
 };
 return '<svg viewBox="0 0 130 124" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="65" cy="110" rx="36" ry="4.5" fill="'+outline+'" opacity=".12"/>'+packageShapes[shape]+'</svg>';
}

const format = new Intl.NumberFormat('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
const createLine = (p,qty=1)=>({...p,qty,discount:0});
const dialogs = {clear:'Clear order?',new:'New order?',customer:'Customer',note:'Order note',payment:'Payment preview',help:'Keyboard shortcuts'};
const app = Vue.createApp({
 render: registerRender,
 data:()=>({categories,catalog,category:'all',query:'',lines:[],selected:null,orderNumber:'001',mode:'Qty',buffer:'',mobile:'catalog',menu:false,dialogName:'',dialogTitles:dialogs,customer:'',note:'',draftNote:'',keys:['1','2','3','Qty','4','5','6','% Disc','7','8','9','Price','−','0','.','Delete'],modes:['Qty','% Disc','Price']}),
 computed:{
   categoryName(){return this.categories.find(c=>c.id===this.category).name;},
   filtered(){const q=this.query.trim().toLowerCase();return this.catalog.filter(p=>(this.category==='all'||p.category===this.category)&&(!q||[p.name,p.id,p.unit].some(s=>s.toLowerCase().includes(q))));},
   activeLine(){return this.lines.find(l=>l.id===this.selected);},
   total(){return this.lines.reduce((sum,l)=>sum+this.lineTotal(l),0);}
 },
 mounted(){this.loadSample();window.addEventListener('keydown',this.keyboard);},
 beforeUnmount(){window.removeEventListener('keydown',this.keyboard);},
 methods:{
   art,
   money(cents){return 'Rs. '+format.format(cents/100);},
   quantity(value){return new Intl.NumberFormat('en-PK',{maximumFractionDigits:3}).format(value);},
   lineTotal(line){return Math.round(line.qty*line.price*(100-line.discount)/100);},
   inCart(id){return this.lines.find(l=>l.id===id)?.qty||0;},
   select(id){this.selected=id;this.mode='Qty';this.buffer='';},
   add(p){const line=this.lines.find(l=>l.id===p.id); if(line){line.qty=Math.min(9999,Math.round((line.qty+1)*1000)/1000);}else{this.lines.push(createLine(p));}this.select(p.id);},
   clearSearch(){this.query='';this.$nextTick(()=>document.querySelector('#search')?.focus());},
   addMatch(){if(this.filtered.length===1)this.add(this.filtered[0]);},
   loadSample(){this.clearOrder();this.lines=[createLine(catalog[0],2),createLine(catalog[4]),createLine(catalog[12],0.5)];this.select(this.lines[2].id);this.menu=false;},
   clearOrder(){this.lines=[];this.select(null);this.customer='';this.note='';},
   newOrder(){this.menu=false;if(this.lines.length||this.note||this.customer){this.openDialog('new');}else this.startNew();},
   startNew(){this.clearOrder();this.orderNumber=String(Number(this.orderNumber)+1).padStart(3,'0');this.mobile='catalog';},
   remove(){const i=this.lines.findIndex(l=>l.id===this.selected);if(i<0)return;this.lines.splice(i,1);this.select(this.lines[Math.min(i,this.lines.length-1)]?.id??null);},
   press(key){
     const l=this.activeLine;if(!l)return;
     if(this.modes.includes(key)){this.mode=key;this.buffer='';return;}
     if(key==='−'){this.remove();return;}
     if(key==='Delete'){
       if(!this.buffer){this.remove();return;}
       this.buffer=this.buffer.slice(0,-1);
     }else{
       if(key==='.'&&(this.buffer.includes('.')||(this.mode==='Qty'&&l.unit!=='kg')))return;
       if(this.buffer.length>=9)return;
       const next=(this.buffer==='0'&&key!=='.'?'':this.buffer)+key;
       const decimals=this.mode==='Qty'?3:2;
       if((next.split('.')[1]||'').length>decimals)return;
       this.buffer=next;
     }
     const n=Number(this.buffer)||0;
     if(this.mode==='Qty'){if(n>0&&n<=9999)l.qty=n;}
     else if(this.mode==='% Disc'){l.discount=Math.min(100,n);}
     else {l.price=Math.round(Math.min(999999,n)*100);}
   },
   openDialog(name){this.menu=false;this.dialogName=name;this.draftNote=this.note;this.$nextTick(()=>{const d=document.getElementById('dialog');if(d&&!d.open)d.showModal();});},
   closeDialog(){document.getElementById('dialog')?.close();},
   keyboard(e){
     if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this.dialogName||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName))return;
     if(e.key==='/'){e.preventDefault();document.getElementById('search')?.focus();}
     else if(this.activeLine && /^[0-9.]$/.test(e.key)){e.preventDefault();this.press(e.key);}
     else if(this.activeLine && ['Backspace','Delete'].includes(e.key)){e.preventDefault();this.press(e.key==='Delete'?'−':'Delete');}
   }
 }
});
app.component('svg-icon',{
 props:{name:String},
 render(){return Vue.h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':1.7,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':true,innerHTML:svgPaths[this.name]||''});}
});
app.mount('#app');
