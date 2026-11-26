const allProducts = {id:'all', name:'All products', icon:'grid', color:'#87657f'};
const sampleOrder = [['MIN-01',2], ['CHP-05',1], ['APL-13',0.5]];
const allowedShapes = new Set(['bottle','can','carton','bag','box','apple','banana','tomato','orange']);
const safeColor = (value, fallback) => typeof value==='string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
function normalizeCatalog(data) {
 const {currency,categories,units,products} = data;
 if(currency!=='PKR' || !Array.isArray(categories) || !Array.isArray(units) || !Array.isArray(products))
   throw new Error('The catalog response has the wrong format.');
 const categoryIds = new Set(categories.map(c=>c.slug));
 const unitByCode = new Map(units.map(u=>[u.code,u]));
 return {
   categories:[allProducts,...categories.map(c=>({id:c.slug,name:c.name,icon:c.icon,color:safeColor(c.color,'#87657f')}))],
   products:products.map(p=>{
     const unit=unitByCode.get(p.unit);
     if(typeof p.sku!=='string' || typeof p.name!=='string' || !categoryIds.has(p.category) || !unit ||
        !Number.isInteger(unit.quantity_precision) || unit.quantity_precision<0 || unit.quantity_precision>3 ||
        !Number.isSafeInteger(p.price_minor) || p.price_minor<0) throw new Error('The catalog contains an invalid product.');
     const art=p.art??{};
     return {id:p.sku,name:p.name,category:p.category,unit:p.unit,precision:unit.quantity_precision,price:p.price_minor,stock:Number.isSafeInteger(p.stock_milli)?p.stock_milli/1000:null,
       code:typeof p.internal_code==='string'?p.internal_code:'', barcode:typeof p.barcode==='string'?p.barcode:'',
       shape:allowedShapes.has(art.shape)?art.shape:'box',ink:safeColor(art.ink,'#87657f'),
       tone:safeColor(art.tone,'#f4edf3'),label:typeof art.label==='string' && /^[A-Z0-9 ]{0,12}$/.test(art.label)?art.label:''};
   })
 };
}

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
const manager = {
 products:{title:'Products',single:'Product',columns:['Internal code','Name','Barcode','Retail Price','Sale Price','Status'],
   fields:[
     {key:'name',label:'Name'},
     {key:'internal_code',label:'Internal code (4 digits)',code:true},
     {key:'barcode',label:'Barcode (optional)'},
     {key:'retailPrice',label:'Retail Price (PKR)',hint:'Regular shelf price.',type:'number',min:0,max:999999.99,step:0.01},
     {key:'salePrice',label:'Sale Price (PKR)',hint:'Default price charged at the POS.',type:'number',min:0,max:999999.99,step:0.01},
     {key:'category_id',label:'Category',options:'categories'},
     {key:'unit_id',label:'Unit',options:'units'},
     {key:'supplier_id',label:'Supplier (optional)',options:'suppliers',optional:true},
     {key:'is_active',label:'Available in POS',type:'checkbox'},
   ]},
 categories:{title:'Categories',single:'Category',columns:['Name','Key'],fields:[
   {key:'name',label:'Name'},{key:'slug',label:'Category key (e.g. frozen-food)',creationOnly:true,keyFormat:true}]},
 units:{title:'Units',single:'Unit',columns:['Name','Code','Decimal places'],fields:[
   {key:'name',label:'Name'},{key:'code',label:'Unit code (e.g. kg)',creationOnly:true,keyFormat:true},
   {key:'quantity_precision',label:'Decimal places',type:'number',min:0,max:3,step:1}]},
 suppliers:{title:'Suppliers',single:'Supplier',columns:['Name','Email','Phone'],fields:[
   {key:'name',label:'Name'},{key:'email',label:'Email (optional)',type:'email',optional:true},
   {key:'phone',label:'Phone (optional)',type:'tel',optional:true}]},
};
const emptyManagement=()=>({categories:[],units:[],suppliers:[]});
const emptyPage=()=>({page:1,last_page:1,total:0,from:null,to:null});

async function posRequest(path,{method='GET',body,csrf}={}) {
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),12000);
 try {
   const headers={Accept:'application/json'};
   if(body!==undefined)headers['Content-Type']='application/json';
   if(csrf)headers['X-CSRF-TOKEN']=csrf;
   const response=await fetch(posApiBaseUrl+path,{method,headers,credentials:'include',
     body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
   if(response.status===204)return null;
   const data=await response.json().catch(()=>null);
   if(!response.ok){
     const message=Object.values(data?.errors??{}).flat().join(' ')||data?.message||'The POS API returned '+response.status+'.';
     const err=new Error(response.status===419?'Your session expired. Reload and sign in again.':message);
     err.status=response.status;
     throw err;
   }
   if(data===null)throw new Error('The POS backend did not return JSON.');
   return data;
 } catch (err) {
   if(err instanceof TypeError||err.name==='AbortError')throw new Error('Could not reach Laravel. Check that the backend is running.');
   throw err;
 } finally {clearTimeout(timer);}
}

const pages = [{id:'register',label:'Register'}, {id:'orders',label:'Orders'}, {id:'inventory',label:'Inventory',icon:'archive'},
  ...Object.entries(manager).map(([id,item])=>({id,label:item.title}))];
const dialogs = {clear:'Clear order?',new:'New order?',customer:'Customer',note:'Order note',payment:'Checkout',update:'Save order changes?',discard:'Discard order changes?',help:'Keyboard shortcuts'};
const app = Vue.createApp({
 render: registerRender,
 data:()=>({page:'register',manager,pages,profile:false,managementData:emptyManagement(),
   managementBusy:false,managementError:'',managementNotice:'',managementForm:null,managementDelete:null,optionsState:'idle',optionsRequest:0,listRows:[],listMeta:emptyPage(),listQuery:'',listSize:15,listBusy:false,listError:'',listTimer:null,listRequest:0,actionDialog:'',managementView:null,previewedOrder:null,previewOrderId:null,previewError:'',
   user:null,authState:'loading',authBusy:false,authError:'',csrf:'',loginForm:{email:'',password:''},
   inventoryLow:false,inventoryNotice:'',inventoryItem:null,stockForm:null,stockError:'',
   stockHistory:[],stockHistoryMeta:emptyPage(),stockHistoryBusy:false,stockHistoryRequest:0,
   stockTypes:{opening:'Opening stock',receipt:'Supplier receipt',adjustment:'Stock adjustment',damage:'Damage',sale:'Sale'},
   paymentMethods:{cash:'Cash',card:'Card',bank_transfer:'Bank transfer'},paymentMethod:'',saleFinalized:false,
   ordersError:'',viewedOrder:null,orderDetailBusy:false,orderDetailRequest:0,
   orderRequestId:null,orderSaving:false,orderSaveError:'',savedOrderId:null,savedOrderEdited:false,editingOrder:null,parkedDraft:null,editExitPage:'orders',searchStatus:'',categories:[allProducts],catalog:[],catalogState:'loading',category:'all',query:'',lines:[],selected:null,orderNumber:'001',mode:'Qty',buffer:'',mobile:'catalog',menu:false,dialogName:'',dialogTitles:dialogs,customer:'',note:'',draftNote:'',keys:['1','2','3','Qty','4','5','6','% Disc','7','8','9','Price','−','0','.','Delete'],modes:['Qty','% Disc','Price']}),
 computed:{
   actionTitle(){
     if(this.actionDialog==='stock')return 'Update stock · '+this.inventoryItem?.name;
     if(this.actionDialog==='stock-history')return 'Stock history · '+this.inventoryItem?.name;
     if(this.actionDialog==='order')return 'Order '+this.orderRef(this.previewedOrder?.id ?? this.previewOrderId);
     if(this.actionDialog==='view')return this.managementView?.name ?? 'Record details';
     if(this.actionDialog==='remove')return (this.page==='products'?'Archive ':'Delete ')+(this.managementDelete?.name??'record')+'?';
     return (this.managementForm?.id?'Edit ':'New ')+(this.manage?.single??'record');
   },
   actionIcon(){return ({order:'orders',view:'view',form:this.managementForm?.id?'edit':'add',remove:'trash',stock:'archive','stock-history':'orders'})[this.actionDialog];},
   categoryName(){return this.categories.find(c=>c.id===this.category)?.name??'All products';},
   manage(){return this.manager[this.page];},
   productOptionsReady(){return this.page!=='products'||this.optionsState==='ready';},
   initials(){return this.user?.name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase()||'U';},
   filtered(){const q=this.query.trim().toLowerCase();return this.catalog.filter(p=>(this.category==='all'||p.category===this.category)&&(!q||[p.name,p.id,p.unit,p.code,p.barcode].some(s=>s.toLowerCase().includes(q))));},
   activeLine(){return this.lines.find(l=>l.id===this.selected);},
   total(){return this.lines.reduce((sum,l)=>sum+this.lineTotal(l),0);},
   displayedLines(){
     return this.viewedOrder
       ? this.viewedOrder.lines.map(l=>({id:l.sku,name:l.name,unit:l.unit,qty:l.qty,price:l.price_minor,discount:l.discount,savedTotal:l.total_minor}))
       : this.lines;
   },
   saleOrderRef(){return this.viewedOrder ? this.orderRef(this.viewedOrder.id) : this.editingOrder ? this.orderRef(this.editingOrder.id) : '#'+this.orderNumber;},
   displayedTotal(){return this.viewedOrder?.total_minor ?? this.total;}
 },
 mounted(){
   void this.restoreSession();
   window.addEventListener('keydown',this.keyboard);
   document.addEventListener('pointerdown',this.closeOutsideHeader);
   document.addEventListener('focusin',this.closeOutsideHeader);
 },
 beforeUnmount(){
   clearTimeout(this.listTimer);
   window.removeEventListener('keydown',this.keyboard);
   document.removeEventListener('pointerdown',this.closeOutsideHeader);
   document.removeEventListener('focusin',this.closeOutsideHeader);
 },
 methods:{
   art,
   async restoreSession(){
     this.authState='loading';this.authError='';
     try{
       const data=await posRequest('/api/pos/auth/session');
       this.csrf=data.csrf_token;
       this.user=data.user;
       this.authState=this.user?'ready':'guest';
       if(this.user)await this.loadCatalog();
     }catch(err){this.authState='unavailable';this.authError=err.message;}
   },
   async login(){
     this.authBusy=true;this.authError='';
     try{
       const data=await posRequest('/api/pos/auth/login',{method:'POST',csrf:this.csrf,body:this.loginForm});
       this.user=data.user;this.csrf=data.csrf_token;this.authState='ready';
       this.loginForm={email:'',password:''};
       await this.loadCatalog();
     }catch(err){
       this.loginForm.password='';
       this.authError=err.message;
       if(err.status===419){await this.restoreSession();this.authError=err.message;}
     }finally{this.authBusy=false;}
   },
   async logout(){
     if(this.editingOrder){this.requestEditExit('logout');return;}
     this.authBusy=true;this.authError='';
     try{
       const data=await posRequest('/api/pos/auth/logout',{method:'POST',csrf:this.csrf});
       this.csrf=data.csrf_token;
       this.resetAuth();
     }catch(err){if(err.status===401||err.status===419){this.resetAuth();await this.restoreSession();}else this.authError=err.message;}
     finally{this.authBusy=false;}
   },
   resetAuth(){
     this.closeActionDialog(true);
     this.user=null;this.authState='guest';this.profile=false;this.menu=false;
     this.page='register';this.managementData=emptyManagement();this.managementForm=null;this.managementDelete=null;
     this.authError='';this.catalog=[];this.categories=[allProducts];this.category='all';this.query='';this.searchStatus='';
     this.editingOrder=null;this.parkedDraft=null;this.savedOrderEdited=false;this.saleFinalized=false;
     this.clearOrder();this.orderNumber='001';this.resetListing();this.ordersError='';
     this.viewedOrder=null;this.orderDetailRequest++;this.orderDetailBusy=false;this.savedOrderId=null;
   },
   async expireSession(err){
     if(err.status!==401&&err.status!==419)return false;
     this.resetAuth();await this.restoreSession();
     if(!this.user)this.authError='Your session ended. Sign in again.';
     return true;
   },
   async goPage(page){
     if(this.editingOrder){if(page!=='register')this.requestEditExit(page);return;}
     this.closeActionDialog(true);
     this.page=page;this.menu=false;this.profile=false;this.viewedOrder=null;this.orderDetailRequest++;this.orderDetailBusy=false;
     this.managementForm=null;this.managementDelete=null;this.managementError='';this.managementNotice='';
     this.resetListing();this.ordersError='';
     if(page==='register'){await this.loadCatalog();return;}
     await Promise.all([this.loadListing(1), ...(['products','inventory'].includes(page)?[this.loadProductOptions()]:[])]);
   },
   resetListing(){
     clearTimeout(this.listTimer);this.listRequest++;this.optionsRequest++;
     this.listRows=[];this.listMeta=emptyPage();this.listQuery='';this.listBusy=false;this.listError='';
     this.managementData=emptyManagement();this.optionsState='idle';this.inventoryLow=false;this.inventoryNotice='';
   },
   listingSearch(query){
     this.listQuery=query;this.listRequest++;
     clearTimeout(this.listTimer);this.listBusy=true;
     this.listTimer=setTimeout(()=>this.loadListing(1),300);
   },
   listingSize(value){
     this.listSize=Number(value);
     return this.loadListing(1);
   },
   async loadListing(page=this.listMeta.page){
     clearTimeout(this.listTimer);
     const resource=this.page, request=++this.listRequest;
     const path=['orders','inventory'].includes(resource)?'/api/pos/'+resource:'/api/pos/management/'+resource;
     const params=new URLSearchParams({page:String(page),per_page:String(this.listSize),q:this.listQuery.trim()});
     if(resource==='inventory'&&this.inventoryLow)params.set('low_stock','1');
     this.listBusy=true;this.listError='';
     try{
       const result=await posRequest(path+'?'+params);
       if(request!==this.listRequest)return;
       if(page>result.meta.last_page){await this.loadListing(result.meta.last_page);return;}
       this.listRows=result.data;this.listMeta=result.meta;
     }catch(err){
       if(request!==this.listRequest)return;
       if(!(await this.expireSession(err))){this.listError=err.message;this.listRows=[];this.listMeta=emptyPage();}
     }finally{
       if(request===this.listRequest)this.listBusy=false;
     }
   },
   async loadProductOptions(){
     const request=++this.optionsRequest;
     this.optionsState='loading';
     try{
       const data=await posRequest('/api/pos/management/options');
       if(request===this.optionsRequest){this.managementData=data;this.optionsState='ready';}
     }catch(err){
       if(request!==this.optionsRequest)return;
       if(!(await this.expireSession(err)))this.optionsState='error';
     }
   },
   startStock(item,type='adjustment'){
     this.inventoryItem=item;this.stockError='';
     this.stockForm={type,quantity:type==='threshold'?item.low_stock_milli/1000:'',supplier_id:item.supplier_id??'',reason:'',requestId:null};
     this.openActionDialog('stock');
   },
   async saveStock(){
     this.managementBusy=true;this.stockError='';
     const form=this.stockForm, item=this.inventoryItem;
     const threshold=form.type==='threshold';
     try{
       if(!threshold)form.requestId??=crypto.randomUUID();
       const body=threshold?{quantity:form.quantity}:{request_id:form.requestId,type:form.type,quantity:form.quantity,reason:form.reason,
         ...(form.type==='receipt'?{supplier_id:Number(form.supplier_id)}:{})};
       await posRequest('/api/pos/inventory/'+item.id+(threshold?'/threshold':'/movements'),{method:threshold?'PUT':'POST',body,csrf:this.csrf});
       this.closeActionDialog(true);
       this.inventoryNotice=threshold?'Low-stock threshold saved.':'Stock movement recorded for '+item.name+'.';
       await this.loadListing();
     }catch(err){if(!(await this.expireSession(err)))this.stockError=err.message;}
     finally{this.managementBusy=false;}
   },
   showStockHistory(item){
     this.inventoryItem=item;this.stockHistory=[];this.stockHistoryMeta=emptyPage();
     this.openActionDialog('stock-history');return this.loadStockHistory(1);
   },
   async loadStockHistory(page=this.stockHistoryMeta.page){
     const request=++this.stockHistoryRequest;
     this.stockError='';this.stockHistoryBusy=true;
     try{
       const result=await posRequest('/api/pos/inventory/'+this.inventoryItem.id+'/movements?page='+page+'&per_page='+this.listSize);
       if(request===this.stockHistoryRequest){this.stockHistory=result.data;this.stockHistoryMeta=result.meta;}
     }catch(err){
       if(request===this.stockHistoryRequest&&!(await this.expireSession(err)))this.stockError=err.message;
     }finally{if(request===this.stockHistoryRequest)this.stockHistoryBusy=false;}
   },
   stockHistorySize(size){this.listSize=Number(size);return this.loadStockHistory(1);},
   openActionDialog(type){
     this.actionDialog=type;
     this.profile=false;this.menu=false;
     this.$nextTick(()=>{
       if(this.actionDialog!==type)return;
       const dialog=document.getElementById('action-dialog');
       if(dialog&&!dialog.open){
         dialog.showModal();
         dialog.querySelector('[data-start-focus]')?.focus();
       }
     });
   },
   closeActionDialog(force=false){
     if(!this.actionDialog||(!force&&this.managementBusy))return;
     if(this.actionDialog==='order'){
       this.orderDetailRequest++;
       this.orderDetailBusy=false;
     }
     document.getElementById('action-dialog')?.close();
     this.inventoryItem=null;this.stockForm=null;this.stockError='';this.stockHistoryRequest++;
     this.actionDialog='';this.managementForm=null;this.managementDelete=null;
     this.managementView=null;this.previewedOrder=null;this.previewOrderId=null;
     this.managementError='';this.previewError='';
   },
   openSavedOrder(order){
     if(!order)return;
     this.closeActionDialog(true);
     this.viewedOrder=order;
     this.page='register';
     this.profile=false;this.menu=false;
     this.$nextTick(()=>document.getElementById('sale-order-title')?.focus());
   },
   async showOrder(id,preview=false,edit=false){
     if(preview){
       this.previewedOrder=null;this.previewOrderId=id;this.previewError='';
       this.openActionDialog('order');
     }
     const request=++this.orderDetailRequest;
     this.orderDetailBusy=true;this.ordersError='';
     try{
       const order=await posRequest('/api/pos/orders/'+id);
       if(request!==this.orderDetailRequest)return;
       if(preview)this.previewedOrder=order;
       else if(edit){
         if(order.finalized_at){this.ordersError='Finalized sales cannot be edited.';return;}
         await this.loadCatalog();
         if(request===this.orderDetailRequest)this.openOrderEditor(order);
       }else this.openSavedOrder(order);
     }catch(err){
       if(request!==this.orderDetailRequest||await this.expireSession(err))return;
       if(preview)this.previewError=err.message;
       else this.ordersError=err.message;
     }finally{if(request===this.orderDetailRequest)this.orderDetailBusy=false;}
   },
   openOrderEditor(order){
     this.closeActionDialog(true);
     this.parkedDraft={
       lines:this.lines,selected:this.selected,customer:this.customer,note:this.note,
       orderRequestId:this.orderRequestId,mobile:this.mobile,mode:this.mode,buffer:this.buffer,
     };
     this.editingOrder={id:order.id,revision:order.revision,checkoutId:null};
     this.viewedOrder=null;this.page='register';this.mobile='order';
     this.customer=order.customer??'';this.note=order.note??'';
     this.lines=order.lines.map(line=>{
       const current=this.catalog.find(product=>product.id===line.sku);
       return {id:line.sku,name:line.name,unit:line.unit,price:line.price_minor,
         qty:line.qty,discount:line.discount,precision:current?.precision??3,locked:!current};
     });
     this.select(this.lines[0]?.id??null);
     this.$nextTick(()=>document.getElementById('sale-order-title')?.focus());
   },
   requestEditExit(page='orders'){this.editExitPage=page;this.openDialog('discard');},
   restoreParkedDraft(){
     if(this.parkedDraft)Object.assign(this,this.parkedDraft);
     this.parkedDraft=null;this.editingOrder=null;
   },
   discardOrderEdit(){
     const page=this.editExitPage;
     this.restoreParkedDraft();
     this.closeDialog();
     if(page==='logout')return this.logout();
     return this.goPage(page);
   },
   async saveOrder(finalize=false){
     if(this.orderSaving||!this.lines.length||(finalize&&!this.paymentMethod))return;
     this.orderSaving=true;this.orderSaveError='';
     const edit=this.editingOrder;
     try{
       if(!edit)this.orderRequestId??=crypto.randomUUID();
       if(edit&&finalize)edit.checkoutId??=crypto.randomUUID();
       const path=finalize?(edit?'/api/pos/orders/'+edit.id+'/checkout':'/api/pos/checkout'):'/api/pos/orders'+(edit?'/'+edit.id:'');
       const saved=await posRequest(path,{method:edit&&!finalize?'PUT':'POST',csrf:this.csrf,body:{
         ...(edit?{revision:edit.revision}:{request_id:this.orderRequestId}),
         ...(finalize?{payment_method:this.paymentMethod,...(edit?{checkout_id:edit.checkoutId}:{})}:{}),
         customer:this.customer||null,note:this.note||null,
         lines:this.lines.map(l=>({sku:l.id,qty:l.qty,price_minor:l.price,discount:l.discount}))
       }});
       if(edit)this.restoreParkedDraft();
       else this.startNew();
       this.savedOrderId=saved.id;this.savedOrderEdited=Boolean(edit);this.saleFinalized=Boolean(saved.finalized_at);this.orderSaving=false;this.closeDialog();
       await this.goPage('orders');
     }catch(err){
       if(await this.expireSession(err)){this.orderSaving=false;this.closeDialog();}
       else this.orderSaveError=err.message;
     }finally{this.orderSaving=false;}
   },
   orderRef(id){return '#'+String(id).padStart(3,'0');},
   orderDate(value){return new Intl.DateTimeFormat('en-PK',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));},
   managementStart(row=null){
     this.managementError='';this.managementNotice='';this.managementDelete=null;
     this.managementForm=row?{...row,
       retailPrice:row.price_minor===undefined?'':((row.retail_price_minor??row.price_minor)/100).toFixed(2),
       salePrice:row.price_minor===undefined?'':(row.price_minor/100).toFixed(2)}:
       {name:'',internal_code:'',barcode:'',retailPrice:'',salePrice:'',category_id:'',unit_id:'',supplier_id:'',
        is_active:true,slug:'',code:'',quantity_precision:0,email:'',phone:''};
     this.openActionDialog('form');
   },
   managementShow(row){
     this.managementView=row;
     this.openActionDialog('view');
   },
   managementConfirm(row){
     this.managementDelete=row;this.managementError='';this.managementNotice='';
     this.openActionDialog('remove');
   },
   managementDetails(row){
     if(!row)return [];
     return this.manage.fields.map(field=>{
       const raw=row[field.key];
       const value=field.key==='retailPrice'?this.money(row.retail_price_minor??row.price_minor):
         field.key==='salePrice'?this.money(row.price_minor):
         field.type==='checkbox'?(raw?'Yes':'No'):
         field.options?this.managementData[field.options].find(option=>option.id===raw)?.name:raw;
       return {label:field.label.replace(/ \(.*\)$/, ''),value:value===null||value===undefined||value===''?'—':value};
     });
   },
   async managementSave(){
     const form=this.managementForm;
     if(!form||this.managementBusy)return;
     this.managementBusy=true;this.managementError='';this.managementNotice='';
     const resource=this.page;
     const body={name:form.name.trim()};
     if(resource==='products')Object.assign(body,{
       internal_code:form.internal_code?.trim()||null,barcode:form.barcode?.trim()||null,
       retail_price_minor:Math.round(Number(form.retailPrice)*100),
       price_minor:Math.round(Number(form.salePrice)*100),category_id:Number(form.category_id),unit_id:Number(form.unit_id),
       supplier_id:form.supplier_id?Number(form.supplier_id):null,is_active:Boolean(form.is_active),
     });
     if(resource==='categories'&&!form.id)body.slug=form.slug.trim().toLowerCase();
     if(resource==='units'){body.quantity_precision=Number(form.quantity_precision);if(!form.id)body.code=form.code.trim().toLowerCase();}
     if(resource==='suppliers'){body.email=form.email?.trim()||null;body.phone=form.phone?.trim()||null;}
     try{
       const record=await posRequest('/api/pos/management/'+resource+(form.id?'/'+form.id:''),{method:form.id?'PUT':'POST',body,csrf:this.csrf});
       this.closeActionDialog(true);
       this.managementNotice='Saved '+record.name+(resource==='products'?' · code '+record.internal_code:'')+'.';
       await this.loadListing();
     }catch(err){if(!(await this.expireSession(err)))this.managementError=err.message;}
     finally{this.managementBusy=false;}
   },
   async managementRemove(){
     const row=this.managementDelete;
     if(!row||this.managementBusy)return;
     this.managementBusy=true;this.managementError='';this.managementNotice='';
     const resource=this.page;
     try{
       await posRequest('/api/pos/management/'+resource+'/'+row.id,{method:'DELETE',csrf:this.csrf});
       this.closeActionDialog(true);
       this.managementNotice=(resource==='products'?'Archived ':'Deleted ')+row.name+'.';
       await this.loadListing();
     }catch(err){if(!(await this.expireSession(err)))this.managementError=err.message;}
     finally{this.managementBusy=false;}
   },
   rowValues(row){
     if(this.page==='products')return [row.internal_code,row.name,row.barcode||'—',this.money(row.retail_price_minor??row.price_minor),this.money(row.price_minor),row.is_active?'Active':'Archived'];
     if(this.page==='categories')return [row.name,row.slug];
     if(this.page==='units')return [row.name,row.code,row.quantity_precision];
     return [row.name,row.email||'—',row.phone||'—'];
   },
   async loadCatalog(){
     this.catalogState='loading';
     try {
       const result=normalizeCatalog(await posRequest('/api/pos/catalog'));
       this.categories=result.categories;
       this.catalog=result.products;
       if(!this.categories.some(c=>c.id===this.category))this.category='all';
       this.catalogState='ready';
     } catch (err) {
       if(!(await this.expireSession(err)))this.catalogState='error';
     }
   },
   money(cents){return 'Rs. '+format.format(cents/100);},
   quantity(value){return new Intl.NumberFormat('en-PK',{maximumFractionDigits:3}).format(value);},
   lineTotal(line){return line.savedTotal ?? Math.round(line.qty*line.price*(100-line.discount)/100);},
   inCart(id){return this.lines.find(l=>l.id===id)?.qty||0;},
   select(id){this.selected=id;this.mode='Qty';this.buffer='';},
   add(p){const line=this.lines.find(l=>l.id===p.id); if(line){line.qty=Math.min(9999,Math.round((line.qty+1)*1000)/1000);}else{this.lines.push(createLine(p));}this.select(p.id);},
   clearSearch(keepStatus=false){this.query='';if(!keepStatus)this.searchStatus='';this.$nextTick(()=>document.querySelector('#search')?.focus());},
   addMatch(){
     const query=this.query.trim().toLowerCase();
     if(!query||this.catalogState!=='ready')return;
     const exact=this.catalog.filter(p=>[p.id,p.code,p.barcode].some(v=>v&&v.toLowerCase()===query));
     const matches=exact.length?exact:this.filtered;
     if(matches.length!==1){
       this.searchStatus=matches.length?'Multiple matches. Pick a product from the list.':'No product found for that code or barcode.';
       document.querySelector('#search')?.select();
       return;
     }
     this.add(matches[0]);this.searchStatus='Added '+matches[0].name+'.';this.clearSearch(true);
   },
   loadSample(){this.clearOrder();this.lines=sampleOrder.flatMap(([sku,qty])=>{const p=this.catalog.find(p=>p.id===sku);return p?[createLine(p,p.precision===0?Math.ceil(qty):qty)]:[];});this.select(this.lines.at(-1)?.id??null);this.menu=false;},
   clearOrder(){this.orderRequestId=null;this.lines=[];this.select(null);this.customer='';this.note='';},
   newOrder(){this.menu=false;if(this.lines.length||this.note||this.customer){this.openDialog('new');}else this.startNew();},
   startNew(){this.clearOrder();this.orderNumber=String(Number(this.orderNumber)+1).padStart(3,'0');this.mobile='catalog';},
   remove(id=this.selected){
     const i=this.lines.findIndex(line=>line.id===id);
     if(i<0)return;
     this.lines.splice(i,1);
     if(id===this.selected)this.select(this.lines[Math.min(i,this.lines.length-1)]?.id??null);
   },
   press(key){
     const l=this.activeLine;if(!l)return;
     if(l.locked){if(key==='−'||key==='Delete')this.remove();return;}
     if(this.modes.includes(key)){this.mode=key;this.buffer='';return;}
     if(key==='−'){this.remove();return;}
     if(key==='Delete'){
       if(!this.buffer){this.remove();return;}
       this.buffer=this.buffer.slice(0,-1);
     }else{
       if(key==='.'&&(this.buffer.includes('.')||(this.mode==='Qty'&&l.precision===0)))return;
       if(this.buffer.length>=9)return;
       const next=(this.buffer==='0'&&key!=='.'?'':this.buffer)+key;
       const decimals=this.mode==='Qty'?l.precision:2;
       if((next.split('.')[1]||'').length>decimals)return;
       this.buffer=next;
     }
     const n=Number(this.buffer)||0;
     if(this.mode==='Qty'){if(n>0&&n<=9999)l.qty=n;}
     else if(this.mode==='% Disc'){l.discount=Math.min(100,n);}
     else {l.price=Math.round(Math.min(999999,n)*100);}
   },
   openDialog(name){this.orderSaveError='';if(['payment','update'].includes(name))this.paymentMethod='';this.menu=false;this.dialogName=name;this.draftNote=this.note;this.$nextTick(()=>{const d=document.getElementById('dialog');if(d&&!d.open)d.showModal();});},
   closeDialog(){if(this.orderSaving)return;document.getElementById('dialog')?.close();},
   closeOutsideHeader(event){
     if(this.menu&&!event.target.closest?.('[data-header-popover="menu"]'))this.menu=false;
     if(this.profile&&!event.target.closest?.('[data-header-popover="profile"]'))this.profile=false;
   },
   keyboard(e){
     if(e.key==='Escape'&&(this.menu||this.profile)){
       const trigger=document.querySelector('[data-header-popover="'+(this.menu?'menu':'profile')+'"] > button');
       this.menu=false;this.profile=false;
       trigger?.focus();
       e.preventDefault();
       return;
     }
     if(e.target?.closest?.('[data-header-popover] .pos-dropdown'))return;
     if(!this.user||this.page!=='register'||this.viewedOrder||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this.dialogName||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName))return;
     if(e.key==='/'){e.preventDefault();document.getElementById('search')?.focus();}
     else if(this.activeLine && /^[0-9.]$/.test(e.key)){e.preventDefault();this.press(e.key);}
     else if(this.activeLine && ['Backspace','Delete'].includes(e.key)){e.preventDefault();this.press(e.key==='Delete'?'−':'Delete');}
   }
 }
});
app.component('pos-icon',{
 props:{name:String},
 render(){return Vue.h('svg',{viewBox:'0 0 24 24',fill:'currentColor','aria-hidden':true,focusable:'false',class:'remix-icon',innerHTML:Object.hasOwn(remixIcons,this.name)?remixIcons[this.name]:remixIcons.grid});}
});
const optionMeta = option => [option.slug ?? option.code, option.email, option.phone].filter(Boolean).join(' · ');
const searchText = text => String(text ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
app.component('pos-search-select',{
 props:{
   inputId:{type:String,required:true}, label:{type:String,required:true}, modelValue:[Number,String],
   options:{type:Array,required:true}, required:Boolean, disabled:Boolean,
 },
 emits:['update:modelValue'],
 data:()=>({open:false,query:'',active:-1}),
 computed:{
   selected(){return this.options.find(option=>String(option.id)===String(this.modelValue));},
   matches(){
     const words=searchText(this.query).trim().split(/\s+/).filter(Boolean);
     return this.options.filter(option=>{
       const haystack=searchText(option.name+' '+optionMeta(option));
       return words.every(word=>haystack.includes(word));
     });
   },
   listId(){return this.inputId+'-options';},
 },
 mounted(){this.syncValidity();},
 updated(){this.syncValidity();},
 beforeUnmount(){this.stopTracking();},
 methods:{
   syncValidity(){this.$refs.input.setCustomValidity(this.required&&!this.selected?'Select a '+this.label.toLowerCase()+' from the list.':'');},
   start(){
     if(this.disabled||this.open)return;
     this.open=true;this.query='';this.active=this.matches.indexOf(this.selected);
     document.addEventListener('scroll',this.reposition,true);
     document.addEventListener('pointerdown',this.closeOutside,true);
     window.addEventListener('resize',this.reposition);
     window.visualViewport?.addEventListener('resize',this.reposition);
     window.visualViewport?.addEventListener('scroll',this.reposition);
     this.$nextTick(this.reposition);
   },
   stopTracking(){
     document.removeEventListener('scroll',this.reposition,true);
     document.removeEventListener('pointerdown',this.closeOutside,true);
     window.removeEventListener('resize',this.reposition);
     window.visualViewport?.removeEventListener('resize',this.reposition);
     window.visualViewport?.removeEventListener('scroll',this.reposition);
   },
   close(){
     if(!this.open)return;
     this.open=false;this.query='';this.active=-1;this.stopTracking();
   },
   contains(target){return target instanceof Node && (this.$el.contains(target)||this.$refs.panel?.contains(target));},
   closeOutside(event){if(!this.contains(event.target))this.close();},
   reposition(event){
     const panel=this.$refs.panel;
     if(!this.open||!panel||panel.contains(event?.target instanceof Node?event.target:null))return;
     const control=this.$refs.control;
     const anchor=control.getBoundingClientRect();
     const host=panel.parentElement.getBoundingClientRect();
     const body=control.closest('.pos-modal-body').getBoundingClientRect();
     const viewport=window.visualViewport;
     const top=Math.max(host.top+7,viewport?.offsetTop??0);
     const bottom=Math.min(host.bottom-7,viewport?viewport.offsetTop+viewport.height:window.innerHeight);
     if(anchor.bottom<=Math.max(body.top,top)||anchor.top>=Math.min(body.bottom,bottom)){this.close();return;}
     const gap=5;
     const below=Math.max(0,bottom-anchor.bottom-gap);
     const above=Math.max(0,anchor.top-top-gap);
     const opensUp=below<190&&above>below;
     const room=opensUp?above:below;
     if(room<34){this.close();return;}
     Object.assign(panel.style,{
       left:(anchor.left-host.left)+'px',width:anchor.width+'px',
       top:opensUp?'':(anchor.bottom-host.top+gap)+'px',
       bottom:opensUp?(host.bottom-anchor.top+gap)+'px':'',
       maxHeight:Math.min(room,196)+'px',visibility:'visible',
     });
   },
   choose(option){this.$emit('update:modelValue',option.id);this.close();},
   clear(){
     this.$emit('update:modelValue','');
     this.$refs.input.focus();this.start();this.query='';this.active=-1;
   },
   move(index){
     this.active=index;
     this.$nextTick(()=>{
       const list=this.$refs.list, option=list?.children[index];
       if(!option)return;
       const bounds=list.getBoundingClientRect(), item=option.getBoundingClientRect();
       if(item.top<bounds.top)list.scrollTop-=bounds.top-item.top;
       else if(item.bottom>bounds.bottom)list.scrollTop+=item.bottom-bounds.bottom;
     });
   },
   onKey(event){
     if(this.disabled||event.isComposing)return;
     if(event.key==='Escape'&&this.open){event.preventDefault();event.stopPropagation();this.close();return;}
     if(event.key==='ArrowDown'||event.key==='ArrowUp'){
       event.preventDefault();
       this.start();
       const last=this.matches.length-1;
       if(last<0)return;
       this.move(event.key==='ArrowDown'?(this.active===last?0:this.active+1):(this.active<=0?last:this.active-1));
     }else if(event.key==='Enter'&&this.open){
       event.preventDefault();
       const option=this.matches[this.active] ?? (this.matches.length===1?this.matches[0]:null);
       if(option)this.choose(option);
     }
   },
 },
 render(){
   const h=Vue.h, icon=Vue.resolveComponent('pos-icon');
   const label=this.label.replace(/ \(optional\)$/i,'');
   return h('div',{class:'pos-picker',onFocusout:event=>{if(!this.contains(event.relatedTarget))this.close();}},[
     h('div',{ref:'control',class:{'pos-picker-control':true,'pos-picker-open':this.open}},[
       h(icon,{name:'search'}),
       h('input',{
         ref:'input',id:this.inputId,type:'text',role:'combobox',autocomplete:'off',spellcheck:false,
         disabled:this.disabled,required:this.required,
         'aria-expanded':String(this.open),'aria-controls':this.open?this.listId:undefined,'aria-autocomplete':'list',
         'aria-activedescendant':this.open&&this.active>=0?this.listId+'-'+this.active:undefined,
         value:this.open?this.query:this.selected?.name??'',
         placeholder:this.open?'Type to search…':'Select '+label.toLowerCase()+(this.required?'':' (optional)'),
         onFocus:this.start,onClick:this.start,
         onInput:event=>{const text=event.target.value;this.start();this.query=text;this.move(this.matches.length?0:-1);},
         onKeydown:this.onKey,
       }),
       this.selected&&!this.required?h('button',{
         type:'button',class:'icon-button pos-picker-clear','aria-label':'Clear '+label.toLowerCase(),title:'Clear '+label.toLowerCase(),disabled:this.disabled,
         onMousedown:event=>event.preventDefault(),onClick:this.clear,
       },[h(icon,{name:'close'})]):null,
       h(icon,{name:'back',class:'pos-picker-chevron'}),
     ]),
     this.open?h(Vue.Teleport,{to:'#picker-overlays'},[h('div',{ref:'panel',class:'pos-picker-panel'},[
       h('div',{class:'pos-picker-caption',role:'status'},this.matches.length?
         this.matches.length+' '+(this.matches.length===1?'option':'options'):
         this.options.length?'No matching options':'No options available'),
       h('ul',{id:this.listId,ref:'list',role:'listbox','aria-label':label},this.open?this.matches.map((option,index)=>{
         const selected=this.selected===option;
         return h('li',{
           id:this.listId+'-'+index,key:option.id,role:'option','aria-selected':String(selected),
           class:{'pos-picker-option':true,'pos-picker-active':index===this.active},
           onMousedown:event=>event.preventDefault(),onClick:()=>this.choose(option),
         },[
           h('span',[h('strong',option.name),optionMeta(option)?h('small',optionMeta(option)):null]),
           selected?h('span',{class:'pos-picker-selected','aria-hidden':'true'},'Selected'):null,
         ]);
       }):[]),
     ])]):null,
   ]);
 },
});
app.component('pos-table-pagination',{
 props:{meta:{type:Object,required:true},size:{type:Number,required:true},busy:Boolean},
 emits:['page','size'],
 render(){
   const h=Vue.h, meta=this.meta;
   return h('nav',{class:'pos-pagination','aria-label':'Listing pagination'},[
     h('label',{class:'pos-page-size'},['Rows per page',h('select',{
       value:this.size,disabled:this.busy,onChange:event=>this.$emit('size',event.target.value),
     },[15,30,60].map(size=>h('option',{value:size},String(size))))]),
     h('span',{class:'pos-page-range',role:'status'},this.busy?'Loading…':meta.total?meta.from+'–'+meta.to+' of '+meta.total:'0 records'),
     h('div',{class:'pos-page-buttons'},[
       h('button',{class:'secondary',type:'button',disabled:this.busy||meta.page<=1,onClick:()=>this.$emit('page',meta.page-1)},'Previous'),
       h('span',{'aria-current':'page'},'Page '+meta.page+' of '+meta.last_page),
       h('button',{class:'secondary',type:'button',disabled:this.busy||meta.page>=meta.last_page,onClick:()=>this.$emit('page',meta.page+1)},'Next'),
     ]),
   ]);
 },
});
app.mount('#app');
