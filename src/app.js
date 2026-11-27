import * as Vue from 'vue';
import UApp from '@nuxt/ui/components/App.vue';
import nuxtUi from '@nuxt/ui/vue-plugin';
import { render as registerRender } from 'virtual:pos-render';
import { remixIcons } from './vendor/remixicon/icons.mjs';
import { usePosNotifications } from './notifications.js';
import './toast.css';

const posApiBaseUrl = __POS_API_BASE_URL__;
const allProducts = {id:'all', name:'All products', icon:'grid', color:'#87657f'};
const sampleOrder = [['MIN-01',2], ['CHP-05',1], ['APL-13',0.5]];
const allowedShapes = new Set(['bottle','can','carton','bag','box','apple','banana','tomato','orange']);
const safeColor = (value, fallback) => typeof value==='string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
function productImageUrl(path) {
 return typeof path==='string' && /^\/api\/pos\/product-images\/\d+\/[A-Za-z0-9]{40}\.(?:jpe?g|png|webp)$/.test(path)
   ? posApiBaseUrl+path : null;
}
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
       image:productImageUrl(p.image_url),code:typeof p.internal_code==='string'?p.internal_code:'', barcode:typeof p.barcode==='string'?p.barcode:'',
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
 products:{title:'Products',single:'Product',columns:['Image','Internal code','Name','Barcode','Retail Price','Sale Price','Preferred supplier','Status'],
   fields:[
     {key:'name',label:'Name'},
     {key:'internal_code',label:'Internal code (4 digits)',code:true},
     {key:'barcode',label:'Barcode (optional)',hint:'Scan into this field or type the code. Product details are entered separately.'},
     {key:'retailPrice',label:'Retail Price (PKR)',hint:'Regular shelf price.',type:'number',min:0,max:999999.99,step:0.01},
     {key:'salePrice',label:'Sale Price (PKR)',hint:'Default price charged at the POS.',type:'number',min:0,max:999999.99,step:0.01},
     {key:'category_id',label:'Category',options:'categories'},
     {key:'unit_id',label:'Unit',options:'units'},
     {key:'supplier_id',label:'Preferred supplier (optional)',options:'suppliers',optional:true,hint:'Default supplier. Stock can still be received from another supplier.'},
     {key:'is_active',label:'Available in POS',type:'checkbox'},
   ]},
 categories:{title:'Categories',single:'Category',columns:['Name','Key'],fields:[
   {key:'name',label:'Name'},{key:'slug',label:'Category key (e.g. frozen-food)',creationOnly:true,keyFormat:true}]},
 units:{title:'Units',single:'Unit',columns:['Name','Code','Decimal places'],fields:[
   {key:'name',label:'Name'},{key:'code',label:'Unit code (e.g. kg)',creationOnly:true,keyFormat:true},
   {key:'quantity_precision',label:'Decimal places',type:'number',min:0,max:3,step:1}]},
 customers:{title:'Customers',single:'Customer',icon:'user',columns:['Name','Email','Phone'],fields:[
   {key:'name',label:'Name',maxlength:120},{key:'email',label:'Email (optional)',type:'email',maxlength:254,optional:true},
   {key:'phone',label:'Phone (optional)',type:'tel',maxlength:40,optional:true}]},
 suppliers:{title:'Suppliers',single:'Supplier',columns:['Name','Email','Phone','Linked products'],fields:[
   {key:'name',label:'Name'},{key:'email',label:'Email (optional)',type:'email',optional:true},
   {key:'phone',label:'Phone (optional)',type:'tel',optional:true}]},
};
const purchaseStorageKey='super-store.pos.purchase.v1:';
let purchaseLineId=0;
const purchaseLine=()=>({key:++purchaseLineId,productId:'',quantity:'',cost:''});
const decimalMinor=(value,places)=>{
 const match=/^(\d+)(?:\.(\d+))?$/.exec(String(value).trim());
 if(!match || (match[2]?.length??0)>places)return null;
 const scale=10**places;
 const amount=Number(match[1])*scale+Number((match[2]??'').padEnd(places,'0'));
 return Number.isSafeInteger(amount)?amount:null;
};
const emptyManagement=()=>({categories:[],units:[],suppliers:[]});
const emptyReportFilters=()=>({period:'today',from:'',to:'',cashier:''});
const reportInteger=new Intl.NumberFormat('en-PK',{maximumFractionDigits:0});
const emptyPage=()=>({page:1,last_page:1,total:0,from:null,to:null});

async function posRequest(path,{method='GET',body,csrf}={}) {
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),12000);
 try {
   const headers={Accept:'application/json'};
   const multipart=body instanceof FormData;
   if(body!==undefined&&!multipart)headers['Content-Type']='application/json';
   if(csrf)headers['X-CSRF-TOKEN']=csrf;
   const response=await fetch(posApiBaseUrl+path,{method,headers,credentials:'include',
     body:body===undefined||multipart?body:JSON.stringify(body),signal:controller.signal});
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

const pages = [{id:'register',label:'Register'}, {id:'orders',label:'Orders'}, {id:'inventory',label:'Inventory',icon:'archive'}, {id:'purchases',label:'Purchases',icon:'basket'},
  {id:'reports',label:'Reports',icon:'grid'}, {id:'drawer',label:'Cash drawer',icon:'cash'}, ...Object.entries(manager).map(([id,item])=>({id,label:item.title,icon:item.icon}))];
const maxCashMinor=9000000000000000;
const cashStorageKey='super-store.pos.cash.v1:';
const parseCash=value=>{
 const raw=String(value).trim();
 if(!/^\d+(?:\.\d{1,2})?$/.test(raw))return null;
 const [rupees,paisa='']=raw.split('.');
 const minor=Number(rupees)*100+Number(paisa.padEnd(2,'0'));
 return Number.isSafeInteger(minor)&&minor<=maxCashMinor?minor:null;
};
const snapshotLines=lines=>lines.map(({id,name,unit,precision,qty,price,discount})=>({id,name,unit,precision,qty,price,discount}));
const receiptTime=new Intl.DateTimeFormat('en-PK',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Karachi'});
const receiptPrintDay=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Karachi'});
const receiptPrintClock=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'Asia/Karachi'});
const cartStorageKey='super-store.pos.register.v1';
const dialogs = {recover:'Resolve last submission',scan:'Scan barcode',park:'Park order',clear:'Clear order?',new:'New order?',note:'Order note',payment:'Checkout',update:'Save order changes?',discard:'Discard order changes?',help:'Keyboard shortcuts'};
const PosRegister = Vue.defineComponent({
 render: registerRender,
 setup: usePosNotifications,
 data:()=>({page:'register',manager,pages,profile:false,managementData:emptyManagement(),
   managementBusy:false,managementError:'',managementForm:null,managementDelete:null,productImageFile:null,productImagePreview:'',productImageRemove:false,productImageError:'',optionsState:'idle',optionsRequest:0,listRows:[],listMeta:emptyPage(),listQuery:'',listSize:15,listBusy:false,listError:'',listTimer:null,listRequest:0,actionDialog:'',managementView:null,previewedOrder:null,previewOrderId:null,previewError:'',
   user:null,authState:'loading',authBusy:false,authError:'',csrf:'',loginForm:{email:'',password:''},
   reportForm:emptyReportFilters(),reportApplied:emptyReportFilters(),report:null,reportKind:'sales',reportPinned:null,
   paymentDrawer:null,paymentDrawerRequest:0,paymentDrawerError:'',
   cashNotice:'',cashPending:null,cashSubmitting:false,
   drawer:null,drawerHistory:null,drawerMovements:null,drawerMovementSession:null,viewedShift:null,drawerBusy:false,drawerRequest:0,
   openingCash:'',drawerMove:{kind:'in',amount:'',reason:''},closeShift:null,countedCash:'',
   returnOrderId:null,returnOrderReference:null,returnOrderBusinessDate:null,returnRows:[],returnHistory:null,returnReason:'',returnError:'',returnQuote:null,returnDrawer:null,returnBusy:false,returnRequest:0,
   purchaseSupplier:'',productSupplier:'',purchaseOptions:[],purchaseOptionsState:'idle',purchaseOptionRequest:0,
   purchaseForm:null,purchaseError:'',purchaseDetail:null,purchaseDetailId:null,purchaseDetailRequest:0,purchaseDetailBusy:false,purchasePending:null,
   customerChoice:null,customerCandidates:[],customerLookupRequest:0,customerLookupTimer:null,customerSearch:'',customerLookupBusy:false,
   customerLookupError:false,customerHasMore:false,customerCreateForm:null,customerCreateError:'',
   inventoryLow:false,inventoryStatus:'',inventoryItem:null,stockForm:null,stockError:'',
   stockHistory:[],stockHistoryMeta:emptyPage(),stockHistoryBusy:false,stockHistoryRequest:0,
   stockTypes:{opening:'Opening stock',receipt:'Supplier receipt',adjustment:'Stock adjustment',damage:'Damage',sale:'Sale',return:'Return restock'},
   paymentMethods:{cash:'Cash',card:'Card',bank_transfer:'Bank transfer'},cashReceived:'',receiptOrder:null,pendingSubmission:null,
   viewedOrder:null,orderDetailBusy:false,orderDetailRequest:0,
   cartScope:null,cartReady:false,cartStorageError:false,scanCode:'',
   orderRequestId:null,orderSaving:false,orderSaveError:'',editingOrder:null,parkedDraft:null,editExitPage:'orders',categories:[allProducts],catalog:[],catalogState:'loading',category:'all',query:'',lines:[],selected:null,mode:'Qty',buffer:'',mobile:'catalog',menu:false,dialogName:'',dialogTitles:dialogs,customer:'',customerId:null,note:'',draftNote:'',keys:['1','2','3','Qty','4','5','6','% Disc','7','8','9','Price','−','0','.','Delete'],modes:['Qty','% Disc','Price']}),
 computed:{
   workingCart(){
     const cart=this.editingOrder ? this.parkedDraft : this;
     return this.cartReady&&this.cartScope&&cart ? JSON.stringify({
       scope:this.cartScope,requestId:cart.orderRequestId,
       customer:cart.customer,customerId:cart.customerId,note:cart.note,
       lines:snapshotLines(cart.lines),pending:this.pendingSubmission
     }) : null;
   },
   cashMinor(){return parseCash(this.cashReceived);},
   openingMinor(){return parseCash(this.openingCash);},
   movementMinor(){return parseCash(this.drawerMove.amount);},
   countedMinor(){return parseCash(this.countedCash);},
   canFinalize(){return !this.cashPending&&this.paymentDrawer!==null&&(!this.paymentDrawer.tracking_enabled||Boolean(this.paymentDrawer.active))&&this.cashMinor!==null&&this.cashMinor>=this.total;},
   purchaseLookup(){return new Map(this.purchaseOptions.map(product=>[String(product.id),product]));},
   purchaseRankedOptions(){
     const supplier=String(this.purchaseForm?.supplier_id);
     return this.purchaseOptions.map(p=>{
       const preferred=String(p.supplier_id)===supplier;
       return {...p,code:p.internal_code,detail:[p.barcode,p.sku,p.unit.code,
         preferred?'Preferred supplier':p.supplier_id?'Different preferred supplier':'No preferred supplier'].filter(Boolean).join(' · '),preferred};
     }).sort((a,b)=>Number(b.preferred)-Number(a.preferred));
   },
   purchaseTotal(){
     return this.purchaseForm?.lines.reduce((sum,line)=>sum+this.purchaseLineTotal(line),0n)??0n;
   },
   actionTitle(){
     if(this.actionDialog==='customer')return this.customerCreateForm?'Add customer':'Customer';
     if(this.actionDialog==='purchase-form')return 'Receive stock';
     if(this.actionDialog==='purchase-detail')return 'Purchase receipt '+this.purchaseRef(this.purchaseDetailId);
     if(this.actionDialog==='stock')return 'Update stock · '+this.inventoryItem?.name;
     if(this.actionDialog==='stock-history')return 'Stock history · '+this.inventoryItem?.name;
     if(this.actionDialog==='order')return this.previewedOrder?'Order '+this.orderRef(this.previewedOrder):'Order details';
     if(this.actionDialog==='view')return this.managementView?.name ?? 'Record details';
     if(this.actionDialog==='remove')return (this.archivable?'Archive ':'Delete ')+(this.managementDelete?.name??'record')+'?';
     return (this.managementForm?.id?'Edit ':'New ')+(this.manage?.single??'record');
   },
   actionIcon(){return ({customer:'user',order:'orders',view:'view',form:this.managementForm?.id?'edit':'add',remove:'trash',stock:'archive','stock-history':'orders','purchase-form':'archive','purchase-detail':'orders'})[this.actionDialog];},
   archivable(){return ['products','customers'].includes(this.page);},
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
   saleOrderRef(){const order=this.viewedOrder??this.editingOrder;return order?this.orderRef(order):null;},
   displayedTotal(){return this.viewedOrder?.total_minor ?? this.total;}
 },
 watch:{workingCart(snapshot){if(snapshot!==null)this.persistCart(snapshot);}},
 mounted(){
   void this.restoreSession();
   window.addEventListener('keydown',this.keyboard);
   document.addEventListener('pointerdown',this.closeOutsideHeader);
   document.addEventListener('focusin',this.closeOutsideHeader);
 },
 beforeUnmount(){
   clearTimeout(this.listTimer);clearTimeout(this.customerLookupTimer);
   window.removeEventListener('keydown',this.keyboard);
   document.removeEventListener('pointerdown',this.closeOutsideHeader);
   document.removeEventListener('focusin',this.closeOutsideHeader);
 },
 methods:{
   art,
   restoreCart(scope){
     if(this.cartReady&&this.cartScope===scope)return;
     this.cartReady=false;
     this.cartScope=scope;

     try{
       const raw=sessionStorage.getItem(cartStorageKey);
       if(raw){
         const saved=JSON.parse(raw);
         if(!scope||saved.scope!==scope||!Array.isArray(saved.lines)){
           sessionStorage.removeItem(cartStorageKey);
         }else{
           this.lines=saved.lines.map(line=>({...line,locked:true}));
           this.customer=saved.customer??'';this.customerId=saved.customerId??null;this.note=saved.note;
           this.orderRequestId=saved.requestId;
           this.select(this.lines[0]?.id??null);
           if(this.lines.length||this.customer||this.note)this.notify('info','Unsaved cart restored in this tab.','Cart restored','cart-restored');
           this.pendingSubmission=saved.pending??null;
           if(this.pendingSubmission?.edit){
             const {order,lines,customer,customerId,note}=this.pendingSubmission.edit;
             this.parkedDraft={lines:this.lines,selected:this.selected,customer:this.customer,customerId:this.customerId,note:this.note,orderRequestId:this.orderRequestId,mobile:this.mobile,mode:this.mode,buffer:this.buffer};
             this.editingOrder=order;
             this.lines=lines.map(line=>({...line,locked:true}));this.customer=customer;this.customerId=customerId??null;this.note=note;
             this.select(this.lines[0]?.id??null);
             this.mobile='order';
           }
         }
       }
     }catch{this.cartStorageError=true;}
     this.cartReady=Boolean(scope);
   },
   persistCart(snapshot){
     try{
       const cart=JSON.parse(snapshot);
       if(cart.lines.length||cart.customer||cart.note||cart.pending)sessionStorage.setItem(cartStorageKey,snapshot);
       else sessionStorage.removeItem(cartStorageKey);
       this.cartStorageError=false;
     }catch{this.cartStorageError=true;}
   },
   async restoreSession(){
     this.authState='loading';this.authError='';
     try{
       const data=await posRequest('/api/pos/auth/session');
       this.csrf=data.csrf_token;
       this.user=data.user;
       this.restoreCart(data.cart_scope);
       this.readCashRecovery();
       this.readPurchaseRecovery();
       this.authState=this.user?'ready':'guest';
       if(this.user)await this.loadCatalog();
     }catch(err){this.authState='unavailable';this.authError=err.message;}
   },
   async login(){
     this.authBusy=true;this.authError='';
     try{
       const data=await posRequest('/api/pos/auth/login',{method:'POST',csrf:this.csrf,body:this.loginForm});
       this.user=data.user;this.csrf=data.csrf_token;this.authState='ready';
       this.restoreCart(data.cart_scope);
       this.readCashRecovery();
       this.readPurchaseRecovery();
       this.loginForm={email:'',password:''};
       await this.loadCatalog();
     }catch(err){
       this.loginForm.password='';
       this.authError=err.message;
       if(err.status===419){await this.restoreSession();this.authError=err.message;}
     }finally{this.authBusy=false;}
   },
   async logout(){
     if(this.purchasePending){this.notify('warning','Confirm the pending receipt before logging out.','Receiving pending');return;}
     if(this.cashPending){this.notify('warning','Resolve the pending cash action before logging out.','Cash action pending');return;}
     if(this.editingOrder){this.requestEditExit('logout');return;}
     this.authBusy=true;this.authError='';
     try{
       const data=await posRequest('/api/pos/auth/logout',{method:'POST',csrf:this.csrf});
       this.csrf=data.csrf_token;
       this.resetAuth();this.restoreCart(null);
     }catch(err){if(err.status===401||err.status===419){this.resetAuth();await this.restoreSession();}else this.notify('error',err.message,'Could not log out');}
     finally{this.authBusy=false;}
   },
   resetAuth(){
     this.clearNotifications();
     this.closeActionDialog(true);
     document.getElementById('return-dialog')?.close();
     this.returnRequest++;this.drawerRequest++;this.paymentDrawerRequest++;this.cashPending=null;this.cashNotice='';
     this.drawer=null;this.viewedShift=null;this.drawerHistory=null;this.drawerMovements=null;this.closeShift=null;this.returnQuote=null;this.returnRows=[];
     this.cartReady=false;this.cartScope=null;this.purchasePending=null;
     this.user=null;this.authState='guest';this.profile=false;this.menu=false;
     this.page='register';this.managementData=emptyManagement();this.managementForm=null;this.managementDelete=null;
     this.authError='';this.catalog=[];this.categories=[allProducts];this.category='all';this.query='';
     this.pendingSubmission=null;this.orderSaveError='';this.dialogName='';document.getElementById('dialog')?.close();
     this.closeReceipt();this.editingOrder=null;this.parkedDraft=null;
     this.clearOrder();this.resetListing();
     this.viewedOrder=null;this.orderDetailRequest++;this.orderDetailBusy=false;
   },
   async expireSession(err){
     if(err.status!==401&&err.status!==419)return false;
     this.resetAuth();await this.restoreSession();
     if(!this.user)this.notify('warning','Sign in again to continue.','Session ended');
     return true;
   },
   async goPage(page){
     if(this.managementBusy||this.pendingSubmission)return;
     if(this.editingOrder){if(page!=='register')this.requestEditExit(page);return;}
     this.closeActionDialog(true);
     this.page=page;this.menu=false;this.profile=false;this.viewedOrder=null;this.orderDetailRequest++;this.orderDetailBusy=false;
     this.managementForm=null;this.managementDelete=null;this.managementError='';
     this.resetListing();
     if(page==='register'){await this.loadCatalog();return;}
     if(page==='drawer'){this.closeShift=null;this.viewedShift=null;await this.loadDrawer();return;}
     await Promise.all([this.loadListing(1), ...(['products','purchases'].includes(page)?[this.loadProductOptions()]:[]), ...(page==='purchases'?[this.loadPurchaseOptions()]:[])]);
   },
   resetListing(){
     clearTimeout(this.listTimer);this.listRequest++;this.optionsRequest++;
     this.listRows=[];this.listMeta=emptyPage();this.listQuery='';this.listBusy=false;this.listError='';
     this.reportForm=emptyReportFilters();this.reportApplied=emptyReportFilters();this.report=null;this.reportKind='sales';this.reportPinned=null;
     this.managementData=emptyManagement();this.optionsState='idle';this.inventoryLow=false;this.inventoryStatus='';
     this.purchaseSupplier='';this.productSupplier='';this.purchaseOptionRequest++;this.purchaseOptions=[];this.purchaseOptionsState='idle';
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
     const path=resource==='reports'?'/api/pos/reports/sales':['orders','inventory','purchases'].includes(resource)?'/api/pos/'+resource:'/api/pos/management/'+resource;
     const params=new URLSearchParams({page:String(page),per_page:String(this.listSize),q:this.listQuery.trim()});
     if(resource==='reports'){
       const {period,from,to,cashier}=this.reportApplied;
       params.set('period',this.reportPinned?'custom':period);
       if(this.reportPinned||period==='custom'){
         params.set('from',this.reportPinned?.from??from);params.set('to',this.reportPinned?.to??to);
       }
       params.set('kind',this.reportKind);
       if(cashier)params.set('cashier_id',cashier);
     }
     if(resource==='purchases'&&this.purchaseSupplier)params.set('supplier_id',this.purchaseSupplier);
     if(resource==='products'&&this.productSupplier)params.set('supplier_id',this.productSupplier);
     if(resource==='inventory'){
       if(this.inventoryLow)params.set('low_stock','1');
       if(this.inventoryStatus)params.set('status',this.inventoryStatus);
     }
     this.listBusy=true;this.listError='';
     try{
       const result=await posRequest(path+'?'+params);
       if(request!==this.listRequest)return;
       if(resource==='reports')this.reportPinned=result.range;
       if(page>result.meta.last_page){await this.loadListing(result.meta.last_page);return;}
       this.listRows=result.data;this.listMeta=result.meta;
       if(resource==='reports')this.report=result;
     }catch(err){
       if(request!==this.listRequest)return;
       if(!(await this.expireSession(err))){this.listError=true;this.listRows=[];this.listMeta=emptyPage();this.notify('error',err.message,'Could not load '+resource);}
     }finally{
       if(request===this.listRequest)this.listBusy=false;
     }
   },
   reportPeriodChanged(){
     if(this.reportForm.period==='custom'&&!this.reportForm.from&&!this.reportForm.to&&this.report?.range){
       this.reportForm.from=this.report.range.from;
       this.reportForm.to=this.report.range.to;
     }
     this.reportForm.cashier='';
   },
   applyReport(){
     this.reportPinned=null;this.reportApplied={...this.reportForm};
     return this.loadListing(1);
   },
   reportMoney(amount){
     const minor=BigInt(amount);
     const abs=minor<0n?-minor:minor;
     return (minor<0n?'−':'')+'Rs. '+reportInteger.format(abs/100n)+'.'+String(abs%100n).padStart(2,'0');
   },
   methodLabel(method){return this.paymentMethods[method]??'Not recorded';},
   readCashRecovery(){
     if(!this.user)return;
     try {
       const raw=sessionStorage.getItem(cashStorageKey+this.user.email);
       this.cashPending=raw?JSON.parse(raw):null;
       if(this.cashPending)this.cashNotice='A cash action is awaiting confirmation. Retry its original submission.';
     }catch{this.notify('warning','This browser cannot restore cash actions in this tab.','Cash recovery unavailable');}
   },
   async loadPaymentDrawer(){
     const sequence=++this.paymentDrawerRequest;
     this.paymentDrawer=null;this.paymentDrawerError='';
     try{
       const status=await posRequest('/api/pos/cash-drawer');
       if(sequence===this.paymentDrawerRequest)this.paymentDrawer=status;
     }catch(err){
       if(sequence===this.paymentDrawerRequest&&!(await this.expireSession(err)))this.paymentDrawerError=err.message;
     }
   },
   async loadDrawer(page=1, session=null, movementPage=1){
     const sequence=++this.drawerRequest;
     this.drawerBusy=true;
     try{
       const [status,history]=await Promise.all([posRequest('/api/pos/cash-drawer'),posRequest('/api/pos/cash-drawer/history?page='+page)]);
       if(sequence!==this.drawerRequest)return;
       this.drawer=status;this.drawerHistory=history;
       const target=session??status.active?.id;
       this.drawerMovementSession=target??null;
       this.drawerMovements=null;
       if(target){
         const result=await posRequest('/api/pos/cash-drawer/'+target+'/movements?page='+movementPage);
         if(sequence===this.drawerRequest)this.drawerMovements=result;
       }
     }catch(err){if(sequence===this.drawerRequest&&!(await this.expireSession(err)))this.notify('error',err.message,'Could not load the cash drawer');}
     finally{if(sequence===this.drawerRequest)this.drawerBusy=false;}
   },
   viewShift(shift){
     this.viewedShift=shift;return this.loadDrawer(this.drawerHistory.current_page,shift.id);
   },
   beginDrawerClose(){
     if(!this.drawer?.active||this.cashPending||this.pendingSubmission)return;
     this.closeShift={...this.drawer.active};this.countedCash='';
   },
   submitDrawer(kind){
     if(this.cashPending||this.pendingSubmission)return;
     const session=this.drawer?.active?.id;
     let path='/api/pos/cash-drawer/open', body={request_id:crypto.randomUUID()};
     if(kind==='open'){
       body.opening_minor=parseCash(this.openingCash);
       if(body.opening_minor===null)return;
     }else if(kind==='move'){
       if(!session)return;
       path='/api/pos/cash-drawer/'+session+'/movements';
       Object.assign(body,{kind:this.drawerMove.kind,amount_minor:parseCash(this.drawerMove.amount),reason:this.drawerMove.reason.trim()});
       if(!body.amount_minor||!body.reason)return;
     }else{
       if(!this.closeShift)return;
       path='/api/pos/cash-drawer/'+this.closeShift.id+'/close';
       Object.assign(body,{counted_minor:parseCash(this.countedCash),revision:this.closeShift.revision});
       if(body.counted_minor===null)return;
     }

     return this.startCashAction({kind,path,body});
   },
   async openReturn(order){
     const orderId=order.id;
     this.closeActionDialog(true);
     const sequence=++this.returnRequest;
     this.returnOrderId=orderId;this.returnOrderReference=this.orderRef(order);this.returnOrderBusinessDate=order.business_date;this.returnRows=[];this.returnHistory=null;
     this.returnReason='';this.returnError='';this.returnQuote=null;this.returnDrawer=null;this.returnBusy=true;
     await this.$nextTick();
     if(sequence!==this.returnRequest)return;
     const dialog=document.getElementById('return-dialog');
     if(dialog&&!dialog.open)dialog.showModal();
     try{
       const [options, history, status]=await Promise.all([
         posRequest('/api/pos/orders/'+orderId+'/return-options'),
         posRequest('/api/pos/orders/'+orderId+'/refunds'),
         posRequest('/api/pos/cash-drawer'),
       ]);
       if(sequence!==this.returnRequest)return;
       this.returnOrderReference=options.order_reference??this.returnOrderReference;
       this.returnOrderBusinessDate=options.order_business_date??this.returnOrderBusinessDate;
       this.returnRows=options.lines.map(row=>({...row,quantity:'',restock:false}));
       this.returnHistory=history;this.returnDrawer=status;
     }catch(err){if(sequence===this.returnRequest&&!(await this.expireSession(err)))this.returnError=err.message;}
     finally{if(sequence===this.returnRequest)this.returnBusy=false;}
   },
   async refundHistoryPage(page){
     const sequence=this.returnRequest;
     try{
       const result=await posRequest('/api/pos/orders/'+this.returnOrderId+'/refunds?page='+page);
       if(sequence===this.returnRequest)this.returnHistory=result;
     }catch(err){if(sequence===this.returnRequest&&!(await this.expireSession(err)))this.returnError=err.message;}
   },
   fillReturn(){
     this.returnQuote=null;
     for(const row of this.returnRows)row.quantity=row.remaining_milli?String(row.remaining_milli/1000):'';
   },
   async previewReturn(){
     if(this.cashPending||this.pendingSubmission||this.returnBusy)return;
     this.returnQuote=null;this.returnError='';
     const lines=[];
     for(const row of this.returnRows){
       const raw=String(row.quantity).trim();
       if(!raw)continue;
       const qty=/^\d+(?:\.\d{1,3})?$/.test(raw)?Math.round(Number(raw)*1000):NaN;
       if(qty===0)continue;
       if(!Number.isSafeInteger(qty)||qty>row.remaining_milli||qty%row.step_milli!==0){
         this.returnError='Check the quantity for '+row.name+'.';return;
       }
       lines.push({line:row.line,qty_milli:qty,restock:row.restock});
     }
     if(!lines.length||!this.returnReason.trim()){this.returnError='Enter a return quantity and reason.';return;}
     const sequence=this.returnRequest;
     this.returnBusy=true;
     try{
       const quote=await posRequest('/api/pos/orders/'+this.returnOrderId+'/refund-preview',{method:'POST',csrf:this.csrf,body:{lines}});
       if(sequence===this.returnRequest)this.returnQuote={...quote,submissionLines:lines,reason:this.returnReason.trim()};
     }catch(err){if(sequence===this.returnRequest&&!(await this.expireSession(err)))this.returnError=err.message;}
     finally{if(sequence===this.returnRequest)this.returnBusy=false;}
   },
   confirmReturn(){
     if(!this.returnQuote||this.cashPending||this.pendingSubmission||!this.returnDrawer||
        (this.returnDrawer.tracking_enabled&&!this.returnDrawer.active))return;
     const quote=this.returnQuote;
     return this.startCashAction({kind:'refund',path:'/api/pos/orders/'+this.returnOrderId+'/refunds',
       orderId:this.returnOrderId,total:quote.total_minor,body:{request_id:crypto.randomUUID(),quote:quote.quote,
         reason:quote.reason,lines:quote.submissionLines,cash_session_id:this.returnDrawer.active?.id??null}});
   },
   startCashAction(attempt){
     if(!this.user||this.cashPending||this.pendingSubmission)return;
     try{sessionStorage.setItem(cashStorageKey+this.user.email,JSON.stringify(attempt));}
     catch{this.notify('error','This browser cannot save a retry reference. Nothing was submitted.','Cash action not submitted');return;}
     this.cashPending=attempt;
     return this.retryCashAction();
   },
   async retryCashAction(){
     const attempt=this.cashPending, actor=this.user?.email;
     if(!attempt||!actor||this.cashSubmitting)return;
     this.cashSubmitting=true;this.cashNotice='';
     try{
       const result=await posRequest(attempt.path,{method:'POST',csrf:this.csrf,body:attempt.body});
       if(!result?.id||(attempt.kind==='refund'&&(!Array.isArray(result.lines)||result.order_id!==attempt.orderId))||
          (attempt.kind==='close'&&!result.closed_at))throw new Error('The server did not confirm the original cash action.');
       if(this.user?.email!==actor)return;
       this.clearCashAction(actor);
       if(attempt.kind==='refund'){
         document.getElementById('return-dialog')?.close();
         this.notify('success','Refund '+this.refundRef(result.id)+' recorded.','Cash refund recorded');
         this.openRefundReceipt(result,true);
         if(this.page==='reports')void this.loadListing();
       }else{
         this.viewedShift=attempt.kind==='close'?result:null;
         this.closeShift=null;this.openingCash='';this.countedCash='';this.drawerMove={kind:'in',amount:'',reason:''};
         this.notify('success',attempt.kind==='open'?'Drawer shift '+this.recordRef(result.id)+' confirmed.':
           attempt.kind==='close'?'Shift '+this.recordRef(result.id)+' closed. Variance: '+this.reportMoney(result.variance_minor)+'.':
           'Cash movement '+this.recordRef(result.id)+' recorded.','Cash drawer');
         if(this.page==='drawer')await this.loadDrawer(1,attempt.kind==='close'?result.id:null);
       }
     }catch(err){
       if(await this.expireSession(err))return;
       if([400,403,404,409,422].includes(err.status)){
         this.clearCashAction(actor);
         if(attempt.kind==='refund'){this.returnQuote=null;}
         else if(this.page==='drawer'){
           this.closeShift=null;this.countedCash='';
           await this.loadDrawer();
         }
         this.notify('error',err.message,attempt.kind==='refund'?'Refund not recorded':'Cash action not recorded');
       }else{
         this.cashNotice='Not confirmed. Retry the original action before recording it again or handing out cash.';
         this.returnError=this.cashNotice;
       }
     }finally{this.cashSubmitting=false;}
   },
   clearCashAction(actor){
     try{sessionStorage.removeItem(cashStorageKey+actor);}catch{}
     this.cashPending=null;
   },
   refundRef(id){return 'RF-'+String(id).padStart(3,'0');},
   async showRefund(id){
     const actor=this.user?.email;
     try{const refund=await posRequest('/api/pos/refunds/'+id);if(this.user?.email===actor)this.openRefundReceipt(refund);}
     catch(err){if(!(await this.expireSession(err)))this.notify('error',err.message,'Could not open refund receipt');}
   },
   openRefundReceipt(refund,payoutReminder=false){
     this.receiptOrder={refund,payoutReminder};
     this.$nextTick(()=>{const d=document.getElementById('receipt-dialog');if(d&&!d.open)d.showModal();});
   },
   setReportKind(kind){
     if(this.reportKind===kind)return;
     this.reportKind=kind;
     return this.loadListing(1);
   },
   async loadProductOptions(){
     const request=++this.optionsRequest;
     this.optionsState='loading';
     try{
       const data=await posRequest('/api/pos/management/options');
       if(request===this.optionsRequest){this.managementData=data;this.optionsState='ready';}
     }catch(err){
       if(request!==this.optionsRequest)return;
       if(!(await this.expireSession(err))){this.optionsState='error';this.notify('error',err.message,'Could not load form options');}
     }
   },
   openCustomer(){
     this.customerChoice=this.customer?{id:this.customerId??'legacy',name:this.customer}:null;
     this.customerCreateForm=null;this.customerCreateError='';this.openActionDialog('customer');
     this.queueCustomerLookup('');
   },
   queueCustomerLookup(term){
     const seq=++this.customerLookupRequest;
     clearTimeout(this.customerLookupTimer);
     this.customerSearch=term;this.customerCandidates=[];this.customerLookupBusy=true;this.customerLookupError=false;this.customerHasMore=false;
     this.customerLookupTimer=setTimeout(()=>this.loadCustomers(seq,term),term?230:0);
   },
   async loadCustomers(seq,term){
     try{
       const result=await posRequest('/api/pos/management/customers?'+new URLSearchParams({q:term.trim(),per_page:'30'}));
       if(seq!==this.customerLookupRequest)return;
       this.customerCandidates=result.data;this.customerHasMore=result.meta.total>result.data.length;
     }catch(err){
       if(seq===this.customerLookupRequest&&!(await this.expireSession(err))){
         this.customerLookupError=true;this.notify('error',err.message,'Could not load customers');
       }
     }finally{if(seq===this.customerLookupRequest)this.customerLookupBusy=false;}
   },
   pickCustomer(id){
     this.customerChoice=id?this.customerCandidates.find(row=>String(row.id)===String(id))??this.customerChoice:null;
   },
   useCustomer(){
     this.customer=this.customerChoice?.name??'';
     this.customerId=typeof this.customerChoice?.id==='number'?this.customerChoice.id:null;
     this.closeActionDialog();
   },
   startCustomerCreate(){
     this.customerCreateError='';this.customerCreateForm={name:'',email:'',phone:''};
     this.$nextTick(()=>document.getElementById('quick-customer-name')?.focus());
   },
   async createRegisterCustomer(){
     if(this.managementBusy||!this.customerCreateForm)return;
     this.managementBusy=true;this.customerCreateError='';
     const form=this.customerCreateForm;
     try{
       const record=await posRequest('/api/pos/management/customers',{method:'POST',csrf:this.csrf,
         body:{name:form.name.trim(),email:form.email.trim()||null,phone:form.phone.trim()||null}});
       this.customerChoice=record;this.managementBusy=false;
       this.useCustomer();
       this.notify('success',record.name+' was added and selected for this order.','Customer added');
     }catch(err){
       if(!(await this.expireSession(err)))this.customerCreateError=err.status&&err.status<500?err.message:
         'Could not confirm the new customer. Go back and search for the name before trying again.';
     }finally{this.managementBusy=false;}
   },
   purchaseRef(id){return 'PR-'+String(id).padStart(4,'0');},
   purchaseKey(){return purchaseStorageKey+posApiBaseUrl+':'+this.user.email;},
   readPurchaseRecovery(){
     if(!this.user)return;
     try{this.purchasePending=JSON.parse(sessionStorage.getItem(this.purchaseKey())??'null');}
     catch{this.notify('warning','This browser cannot restore receiving submissions.','Receiving recovery unavailable');}
   },
   async loadPurchaseOptions(){
     const seq=++this.purchaseOptionRequest;
     this.purchaseOptionsState='loading';
     try{
       const options=await posRequest('/api/pos/purchases/products');
       if(seq===this.purchaseOptionRequest){this.purchaseOptions=options;this.purchaseOptionsState='ready';}
     }catch(err){
       if(seq===this.purchaseOptionRequest&&!(await this.expireSession(err))){
         this.purchaseOptionsState='error';this.notify('error',err.message,'Could not load products for receiving');
       }
     }
   },
   purchaseProduct(id){return this.purchaseLookup.get(String(id));},
   purchaseLineOptions(line){
     const selected=new Set(this.purchaseForm.lines.filter(row=>row!==line).map(row=>String(row.productId)));
     return this.purchaseRankedOptions.filter(p=>!selected.has(String(p.id)));
   },
   choosePurchaseProduct(line,id){
     if(String(line.productId)===String(id))return;
     line.productId=id;line.quantity='';line.cost='';
   },
   purchaseQuantity(line){
     const p=this.purchaseProduct(line.productId);
     const parsed=p?decimalMinor(line.quantity,p.unit.quantity_precision):null;
     return parsed===null?null:parsed*10**(3-p.unit.quantity_precision);
   },
   purchaseLineTotal(line){
     const quantity=this.purchaseQuantity(line), cost=decimalMinor(line.cost,2);
     return quantity>0&&quantity<=1000000000&&cost!==null&&cost<=99999999?(BigInt(quantity)*BigInt(cost)+500n)/1000n:0n;
   },
   startPurchase(){
     if(this.purchasePending||this.optionsState!=='ready'||this.purchaseOptionsState!=='ready')return;
     this.purchaseForm={supplier_id:this.purchaseSupplier,invoice_reference:'',note:'',lines:[purchaseLine()]};
     this.purchaseError='';this.openActionDialog('purchase-form');
   },
   addPurchaseLine(){if(this.purchaseForm.lines.length<50)this.purchaseForm.lines.push(purchaseLine());},
   async showPurchase(id){
     this.purchaseDetailId=id;this.purchaseDetail=null;this.purchaseError='';
     this.openActionDialog('purchase-detail');
     return this.loadPurchaseDetail(id);
   },
   async loadPurchaseDetail(id){
     const seq=++this.purchaseDetailRequest;
     this.purchaseDetailBusy=true;this.purchaseError='';
     try{
       const detail=await posRequest('/api/pos/purchases/'+id);
       if(seq===this.purchaseDetailRequest)this.purchaseDetail=detail;
     }catch(err){
       if(seq===this.purchaseDetailRequest&&!(await this.expireSession(err)))this.purchaseError=err.message;
     }finally{if(seq===this.purchaseDetailRequest)this.purchaseDetailBusy=false;}
   },
   async savePurchase(){
     if(this.purchasePending||this.managementBusy)return;
     const form=this.purchaseForm;
     const lines=form.lines.map(line=>({
       product_id:Number(line.productId),unit_id:this.purchaseProduct(line.productId)?.unit_id,
       quantity_milli:this.purchaseQuantity(line),unit_cost_minor:decimalMinor(line.cost,2),
     }));
     if(!form.supplier_id||lines.some(l=>!l.unit_id||!(l.quantity_milli>0)||l.quantity_milli>1000000000||
          l.unit_cost_minor===null||l.unit_cost_minor>99999999)){
       this.purchaseError='Select a supplier and product, enter a positive quantity in the listed unit, and enter a valid unit cost for each line.';return;
     }
     try{
       const pending={request_id:crypto.randomUUID(),supplier_id:Number(form.supplier_id),
         invoice_reference:form.invoice_reference||null,note:form.note||null,lines};
       sessionStorage.setItem(this.purchaseKey(),JSON.stringify(pending));
       this.purchasePending=pending;
     }catch{
       this.purchaseError='This tab could not save a retry copy. No stock was posted. Try a browser with session storage enabled.';return;
     }
     await this.submitPurchase();
   },
   async submitPurchase(){
     if(!this.purchasePending||this.managementBusy)return;
     const pending=this.purchasePending,key=this.purchaseKey();
     this.managementBusy=true;this.purchaseError='';
     try{
       const receipt=await posRequest('/api/pos/purchases',{method:'POST',body:pending,csrf:this.csrf});
       this.purchasePending=null;
       try{sessionStorage.removeItem(key);}catch{}
       if(this.actionDialog==='purchase-form')this.closeActionDialog(true);
       this.notify('success',this.purchaseRef(receipt.id)+' posted. Stock updated.','Purchase received');
       if(this.page==='purchases'){
         await this.loadListing(1);
         await this.showPurchase(receipt.id);
       }else if(this.page==='register'){await this.loadCatalog();}
       else if(this.page==='inventory'){await this.loadListing();}
     }catch(err){
       if(err.status===422){
         this.purchasePending=null;
         try{sessionStorage.removeItem(key);}catch{}
         if(this.actionDialog==='purchase-form')this.purchaseError=err.message;
         else this.notify('error',err.message,'Purchase was not posted');
       }else if(!(await this.expireSession(err))){
         if(this.actionDialog==='purchase-form')this.purchaseError='Posting not confirmed. Retry this exact receipt before entering it again. '+err.message;
         else this.notify('warning',err.message,'Purchase posting not confirmed');
       }
     }finally{this.managementBusy=false;}
   },
   stockFormTypes(item){
     return item.is_active?['opening','adjustment','damage']:['adjustment','damage'];
   },
   startStock(item,type='adjustment'){
     this.inventoryItem=item;this.stockError='';
     this.stockForm={type,quantity:type==='threshold'?item.low_stock_milli/1000:'',reason:'',requestId:null};
     this.openActionDialog('stock');
   },
   async saveStock(){
     this.managementBusy=true;this.stockError='';
     const form=this.stockForm, item=this.inventoryItem;
     const threshold=form.type==='threshold';
     try{
       if(!threshold)form.requestId??=crypto.randomUUID();
       const body=threshold?{quantity:form.quantity}:{request_id:form.requestId,type:form.type,quantity:form.quantity,reason:form.reason};
       await posRequest('/api/pos/inventory/'+item.id+(threshold?'/threshold':'/movements'),{method:threshold?'PUT':'POST',body,csrf:this.csrf});
       this.closeActionDialog(true);
       this.notify('success',threshold?'Low-stock threshold saved.':'Stock movement recorded for '+item.name+'.','Inventory updated');
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
     if(this.actionDialog==='customer'){
       clearTimeout(this.customerLookupTimer);this.customerLookupRequest++;
       this.customerCandidates=[];this.customerChoice=null;this.customerCreateForm=null;this.customerCreateError='';
     }
     this.purchaseDetailRequest++;this.purchaseDetailBusy=false;this.purchaseDetail=null;this.purchaseForm=null;this.purchaseError='';
     this.resetProductImage();
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
   async showOrder(id,preview=false,edit=false,receipt=false){
     if(preview){
       this.previewedOrder=null;this.previewOrderId=id;this.previewError='';
       this.openActionDialog('order');
     }
     const request=++this.orderDetailRequest;
     this.orderDetailBusy=true;
     try{
       const order=await posRequest('/api/pos/orders/'+id);
       if(request!==this.orderDetailRequest)return;
       if(receipt)this.openReceipt(order);
       else if(preview)this.previewedOrder=order;
       else if(edit){
         if(order.finalized_at){this.notify('warning','Finalized sales cannot be edited.','Order already finalized');return;}
         await this.loadCatalog();
         if(request===this.orderDetailRequest)this.openOrderEditor(order);
       }else this.openSavedOrder(order);
     }catch(err){
       if(request!==this.orderDetailRequest||await this.expireSession(err))return;
       if(preview)this.previewError=true;
       this.notify('error',err.message,'Could not open order');
     }finally{if(request===this.orderDetailRequest)this.orderDetailBusy=false;}
   },
   openOrderEditor(order){
     this.closeActionDialog(true);
     this.parkedDraft={
       lines:this.lines,selected:this.selected,customer:this.customer,customerId:this.customerId,note:this.note,
       orderRequestId:this.orderRequestId,mobile:this.mobile,mode:this.mode,buffer:this.buffer,
     };
     this.editingOrder={id:order.id,reference:order.reference,business_date:order.business_date,revision:order.revision};
     this.viewedOrder=null;this.page='register';this.mobile='order';
     this.customer=order.customer??'';this.customerId=order.customer_id??null;this.note=order.note??'';
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
   saveOrder(finalize=false){
     if(this.pendingSubmission||this.orderSaving||!this.lines.length||(finalize&&!this.canFinalize))return;
     const edit=this.editingOrder;
     const body={
       ...(edit?{revision:edit.revision,[finalize?'checkout_id':'update_id']:crypto.randomUUID()}:{request_id:this.orderRequestId??=crypto.randomUUID()}),
       ...(finalize?{payment_method:'cash',cash_received_minor:this.cashMinor,cash_session_id:this.paymentDrawer.active?.id??null}:{}),
       customer:this.customer||null,customer_id:this.customerId,note:this.note||null,
       lines:this.lines.map(l=>({sku:l.id,qty:l.qty,price_minor:l.price,discount:l.discount})),
     };

     this.pendingSubmission={
       path:finalize?(edit?'/api/pos/orders/'+edit.id+'/checkout':'/api/pos/checkout'):'/api/pos/orders'+(edit?'/'+edit.id:''),
       method:edit&&!finalize?'PUT':'POST',body,finalize,parking:this.dialogName==='park',
       total:this.total, edit:edit?{order:{...edit},lines:snapshotLines(this.lines),customer:this.customer,customerId:this.customerId,note:this.note}:null,
     };
     return this.submitPendingOrder();
   },
   async submitPendingOrder(){
     const attempt=this.pendingSubmission;
     if(this.orderSaving||!attempt)return;
     // Persist the immutable request before sending so reload can replay the original operation.
     if(this.workingCart)this.persistCart(this.workingCart);
     this.orderSaving=true;this.orderSaveError='';
     try{
       const saved=await posRequest(attempt.path,{method:attempt.method,csrf:this.csrf,body:attempt.body});
       if(!saved?.id||!Array.isArray(saved.lines)||(attempt.finalize&&!saved.finalized_at))throw new Error('The server did not confirm the expected order.');
       this.pendingSubmission=null;
       if(attempt.edit)this.restoreParkedDraft();
       else this.startNew();
       const closed=this.waitForOrderDialogClose();
       this.orderSaving=false;this.closeDialog();
       if(this.workingCart)this.persistCart(this.workingCart);
       await closed;
       if(attempt.parking&&!saved.finalized_at){
         this.notify('success','Order '+this.orderRef(saved)+' can be reopened from Orders.','Order parked');
         this.$nextTick(()=>document.getElementById('search')?.focus());
       }else{
         await this.goPage('orders');
         if(saved.finalized_at){
           this.openReceipt(saved);
           this.notify('success','Order '+this.orderRef(saved)+' paid in cash.','Sale finalized');
         }else{
           this.notify('success','Order '+this.orderRef(saved)+' '+(attempt.edit?'updated.':'saved as a draft.'),attempt.edit?'Draft updated':'Draft saved');
         }
       }
     }catch(err){
       this.orderSaving=false;
       if(await this.expireSession(err))return;
       if([403,404,409,422].includes(err.status)){
         this.pendingSubmission=null;
         if(!attempt.edit&&err.status!==409)this.orderRequestId=null;
         if(this.dialogName==='recover'){
           this.closeDialog();this.notify('error',err.message,'Order not saved');
         }else this.orderSaveError=err.message;
       }else{
         this.dialogName='recover';
         this.orderSaveError='Save not confirmed. Retry the original submission before starting or changing a sale.';
       }
       if(this.workingCart)this.persistCart(this.workingCart);
     }finally{this.orderSaving=false;}
   },
   waitForOrderDialogClose(){
     const d=document.getElementById('dialog');
     return d?.open?new Promise(resolve=>d.addEventListener('close',resolve,{once:true})):Promise.resolve();
   },
   openReceipt(order){
     if(!order?.finalized_at)return;
     this.closeActionDialog(true);
     this.receiptOrder=order;
     this.$nextTick(()=>{const d=document.getElementById('receipt-dialog');if(d&&!d.open)d.showModal();});
   },
   closeReceipt(){document.getElementById('receipt-dialog')?.close();},
   printReceipt(){if(this.receiptOrder&&document.getElementById('receipt-dialog')?.open)window.print();},
   receiptDate(date){return receiptTime.format(new Date(date));},
   receiptPrintDate(date){
     const stamp=new Date(date);
     return receiptPrintDay.format(stamp)+' '+receiptPrintClock.format(stamp).replace(/[\u00a0\u202f]/g,' ');
   },
   recordRef(id){return '#'+String(id).padStart(3,'0');},
   orderRef(order){return order.reference??this.recordRef(order.id);},
   managementStart(row=null){
     this.managementError='';this.managementDelete=null;
     this.managementForm=row?{...row,
       retailPrice:row.price_minor===undefined?'':((row.retail_price_minor??row.price_minor)/100).toFixed(2),
       salePrice:row.price_minor===undefined?'':(row.price_minor/100).toFixed(2)}:
       {name:'',internal_code:'',barcode:'',retailPrice:'',salePrice:'',category_id:'',unit_id:'',supplier_id:'',
        is_active:true,slug:'',code:'',quantity_precision:0,email:'',phone:''};
     this.resetProductImage();
     this.openActionDialog('form');
   },
   productImageUrl,
   resetProductImage(){
     if(this.productImagePreview)URL.revokeObjectURL(this.productImagePreview);
     this.productImageFile=null;this.productImagePreview='';this.productImageRemove=false;this.productImageError='';
   },
   selectProductImage(event){
     const file=event.target.files?.[0];
     if(!file)return;
     if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){
       this.productImageError='Choose a JPG, PNG or WebP image no larger than 2 MB.';
       event.target.value='';
       return;
     }
     this.resetProductImage();
     this.productImageFile=file;
     this.productImagePreview=URL.createObjectURL(file);
   },
   removeProductImage(){
     this.resetProductImage();
     this.productImageRemove=Boolean(this.managementForm?.image_url);
     const input=document.getElementById('management-product-image');
     if(input)input.value='';
   },
   managementShow(row){
     this.managementView=row;
     this.openActionDialog('view');
   },
   managementConfirm(row){
     this.managementDelete=row;this.managementError='';
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
     this.managementBusy=true;this.managementError='';
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
     if(['suppliers','customers'].includes(resource)){body.email=form.email?.trim()||null;body.phone=form.phone?.trim()||null;}
     try{
       let payload=body;
       let method=form.id?'PUT':'POST';
       if(resource==='products'&&this.productImageRemove)body.remove_image=true;
       if(resource==='products'&&this.productImageFile){
         payload=new FormData();
         for(const [key,value] of Object.entries(body)){
           payload.append(key,typeof value==='boolean'?(value?'1':'0'):String(value??''));
         }
         payload.append('image',this.productImageFile);
         if(form.id){payload.append('_method','PUT');method='POST';}
       }
       const record=await posRequest('/api/pos/management/'+resource+(form.id?'/'+form.id:''),{method,body:payload,csrf:this.csrf});
       this.closeActionDialog(true);
       this.notify('success',record.name+(resource==='products'?' · code '+record.internal_code:'')+'.',this.manage.single+(form.id?' updated':' created'));
       await this.loadListing();
     }catch(err){if(!(await this.expireSession(err)))this.managementError=err.message;}
     finally{this.managementBusy=false;}
   },
   async managementRemove(){
     const row=this.managementDelete;
     if(!row||this.managementBusy)return;
     this.managementBusy=true;this.managementError='';
     const resource=this.page;
     try{
       await posRequest('/api/pos/management/'+resource+'/'+row.id,{method:'DELETE',csrf:this.csrf});
       this.closeActionDialog(true);
       this.notify('success',row.name+'.',this.manage.single+(this.archivable?' archived':' deleted'));
       await this.loadListing();
     }catch(err){if(!(await this.expireSession(err)))this.managementError=err.message;}
     finally{this.managementBusy=false;}
   },
   rowValues(row){
     if(this.page==='products')return [row.internal_code,row.name,row.barcode||'—',this.money(row.retail_price_minor??row.price_minor),this.money(row.price_minor),row.supplier?.name??'—',row.is_active?'Active':'Archived'];
     if(this.page==='categories')return [row.name,row.slug];
     if(this.page==='units')return [row.name,row.code,row.quantity_precision];
     const contact=[row.name,row.email||'—',row.phone||'—'];
     return this.page==='suppliers'?[...contact,row.products_count??0]:contact;
   },
   async loadCatalog(){
     const scope=this.cartScope;
     this.catalogState='loading';
     try {
       const result=normalizeCatalog(await posRequest('/api/pos/catalog'));
       if(scope!==this.cartScope)return;
       this.categories=result.categories;
       this.catalog=result.products;
       const bySku=new Map(this.catalog.map(product=>[product.id,product]));
       for(const line of [...this.lines,...(this.parkedDraft?.lines??[])]){
         const p=bySku.get(line.id);
         line.locked=!p||p.unit!==line.unit;
         if(!line.locked)line.precision=p.precision;
       }
       if(!this.categories.some(c=>c.id===this.category))this.category='all';
       this.catalogState='ready';
     } catch (err) {
       if(scope===this.cartScope&&!(await this.expireSession(err))){this.catalogState='error';this.notify('error',err.message,'Catalog unavailable');}
     }
   },
   money(cents){return 'Rs. '+format.format(cents/100);},
   quantity(value){return new Intl.NumberFormat('en-PK',{maximumFractionDigits:3}).format(value);},
   lineTotal(line){
     if(line.savedTotal!==undefined)return line.savedTotal;
     const scaled=BigInt(Math.round(line.qty*1000))*BigInt(line.price)*BigInt(10000-Math.round(line.discount*100));
     return Number((scaled+5000000n)/10000000n);
   },
   inCart(id){return this.lines.find(l=>l.id===id)?.qty||0;},
   select(id){this.selected=id;this.mode='Qty';this.buffer='';},
   warnRegisterStock(message){
     this.notify('warning',message,'Stock check','register-stock');
   },
   canSetRegisterQuantity(product,qty){
     if(!product||product.stock===null){
       this.warnRegisterStock('Stock could not be verified. Refresh the catalog before adding more.');
       return false;
     }
     if(Math.round(qty*1000)>Math.round(product.stock*1000)){
       this.warnRegisterStock('Insufficient stock for '+product.name+'. '+this.quantity(product.stock)+' '+product.unit+' available.');
       return false;
     }
     return true;
   },
   add(p){
     const line=this.lines.find(l=>l.id===p.id);
     if(line?.locked){this.warnRegisterStock('Remove the unavailable line before adding this product again.');return false;}
     if(line?.qty>=9999){this.warnRegisterStock('The quantity limit for this item is 9,999.');return false;}
     // A small remaining weight can still be sold without adding more than is on hand.
     const firstQty=p.precision>0&&p.stock>0?Math.min(1,p.stock):1;
     const qty=line?Math.min(9999,Math.round((line.qty+1)*1000)/1000):firstQty;
     if(!this.canSetRegisterQuantity(p,qty))return false;

     if(line)line.qty=qty;
     else this.lines.push(createLine(p,qty));
     this.select(p.id);
     return true;
   },
   clearSearch(){this.query='';this.$nextTick(()=>document.querySelector('#search')?.focus());},
   addMatch(){
     const query=this.query.trim().toLowerCase();
     if(!query||this.catalogState!=='ready')return;
     const exact=this.catalog.filter(p=>[p.id,p.code,p.barcode].some(v=>v&&v.toLowerCase()===query));
     const matches=exact;
     if(matches.length!==1){
       this.notify('info',matches.length||this.filtered.length?'Pick a product from the list, or use Scan barcode.':'No matching products.','Product search','product-search');
       document.querySelector('#search')?.select();
       return;
     }
     if(!this.add(matches[0])){
       document.getElementById('search')?.select();
       return;
     }
     this.notify('success',matches[0].name+' added to the order.','Product added','product-'+matches[0].id);this.clearSearch();
   },
   openScanner(){
     this.scanCode='';
     this.openDialog('scan');
   },
   scanBarcode(){
     const code=this.scanCode.trim().toUpperCase();
     if(!code)return;
     const product=this.catalogState==='ready'&&this.catalog.find(p=>p.barcode.toUpperCase()===code);
     if(!product){
       this.notify('warning',this.catalogState==='ready'?'Barcode not found. No item was added.':'Close this window and refresh the catalog.','Barcode scan','barcode-not-found');
     }else if(this.add(product)){
       this.notify('success',product.name+' · Quantity: '+this.quantity(this.inCart(product.id)), 'Product scanned','product-'+product.id);
     }
     this.scanCode='';
     document.getElementById('barcode-scan-input')?.focus();
   },
   loadSample(){
     this.clearOrder();
     this.lines=sampleOrder.flatMap(([sku,qty])=>{
       const p=this.catalog.find(item=>item.id===sku);
       if(!p)return [];
       const count=p.precision===0?Math.ceil(qty):qty;
       return this.canSetRegisterQuantity(p,count)?[createLine(p,count)]:[];
     });
     this.select(this.lines.at(-1)?.id??null);this.menu=false;
   },
   clearOrder(){this.orderRequestId=null;this.lines=[];this.select(null);this.customer='';this.customerId=null;this.note='';},
   newOrder(){this.menu=false;if(this.lines.length||this.note||this.customer){this.openDialog('new');}else this.startNew();},
   startNew(){this.clearOrder();this.mobile='catalog';},
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
     if(this.mode==='Qty'){
       const product=this.catalog.find(item=>item.id===l.id);
       if(n>0&&n<=9999&&(n<=l.qty||this.canSetRegisterQuantity(product,n))){
         l.qty=n;

       }
     }
     else if(this.mode==='% Disc'){l.discount=Math.min(100,n);}
     else {l.price=Math.round(Math.min(999999,n)*100);}
   },
   openDialog(name){this.orderSaveError='';if(['payment','update'].includes(name)){this.cashReceived='';void this.loadPaymentDrawer();}this.menu=false;this.dialogName=name;this.draftNote=this.note;this.$nextTick(()=>{const d=document.getElementById('dialog');if(d&&!d.open)d.showModal();});},
   closeDialog(){if(this.orderSaving)return;document.getElementById('dialog')?.close();},
   closeOutsideHeader(event){
     if(this.menu&&!event.target.closest?.('[data-header-popover="menu"]'))this.menu=false;
     if(this.profile&&!event.target.closest?.('[data-header-popover="profile"]'))this.profile=false;
   },
   registerTargets(area){
     return [...document.querySelectorAll('[data-register-keys="'+area+'"] [data-key-target]:not(:disabled)')]
       .filter(target=>target.getClientRects().length);
   },
   focusRegisterArea(area,choose=null){
     this.mobile=['cart','keypad'].includes(area)?'order':'catalog';
     this.$nextTick(()=>{
       const targets=this.registerTargets(area);
       (choose?.(targets)??targets[0])?.focus();
     });
   },
   focusRegisterCart(){
     if(this.lines.length)this.focusRegisterArea('cart',items=>items.find(item=>item.getAttribute('aria-pressed')==='true'));
   },
   focusRegisterKeypad(){
     if(this.activeLine)this.focusRegisterArea('keypad',items=>items.find(item=>item.textContent.trim()===this.mode));
   },
   focusRegisterProducts(){
     const area=document.querySelector('[data-register-keys="products"]')?'products':'search';
     this.focusRegisterArea(area);
   },
   focusRegisterCategories(){
     this.focusRegisterArea('categories',items=>items.find(item=>item.getAttribute('aria-pressed')==='true'));
   },
   navigateRegister(event){
     const key=event.key;
     const target=event.target?.closest?.('[data-key-target], .cart-remove');
     const area=target?.closest('[data-register-keys]')?.dataset.registerKeys;
     if(!area){
       if(event.target!==document.body && event.target?.id!=='sale-order-title')return;
       const initial=this.registerTargets('search')[0]??this.registerTargets('cart')[0];
       if(initial){event.preventDefault();initial.focus();}
       return;
     }
     if(area==='search'){
       // Do not take over the caret or selections while a cashier is typing.
       if(target.id==='search'&&(key==='ArrowLeft'||key==='ArrowRight')&&(target.value||event.shiftKey))return;
       if(key==='ArrowUp'){event.preventDefault();this.focusTopBar();return;}
       event.preventDefault();
       if(key==='ArrowDown')this.focusRegisterCategories();
       if(key==='ArrowLeft'){
         if(target.id==='search')this.focusRegisterCart();
         else this.registerTargets('search')[0]?.focus();
       }
       if(key==='ArrowRight'&&target.id==='search')this.registerTargets('search').at(-1)?.focus();
       return;
     }
     event.preventDefault();
     const items=this.registerTargets(area);
     if(area==='categories'){
       if(key==='ArrowUp'){this.focusRegisterArea('search');return;}
       if(key==='ArrowDown'){this.focusRegisterProducts();return;}
       const next=items[items.indexOf(target)+(key==='ArrowLeft'?-1:1)];
       if(next)next.focus();
       else if(key==='ArrowLeft')this.focusRegisterCart();
       return;
     }
     if(area==='cart'){
       const row=target.closest('.cart-row');
       const line=row.querySelector('.order-line');
       if(key==='ArrowRight'){
         if(target!==line)line.focus();
         else this.focusRegisterProducts();
         return;
       }
       if(key==='ArrowLeft'){row.querySelector('.cart-remove')?.focus();return;}
       const next=items[items.indexOf(line)+(key==='ArrowUp'?-1:1)];
       if(next)next.focus();
       else if(key==='ArrowDown')this.focusRegisterKeypad();
       else this.focusRegisterArea('search');
       return;
     }
     const rect=target.getBoundingClientRect();
     const x=rect.left+rect.width/2;
     const y=rect.top+rect.height/2;
     const vertical=key==='ArrowUp'||key==='ArrowDown';
     const sign=key==='ArrowUp'||key==='ArrowLeft'?-1:1;
     const candidates=items.filter(item=>item!==target).map(item=>{
       const bounds=item.getBoundingClientRect();
       const dx=bounds.left+bounds.width/2-x;
       const dy=bounds.top+bounds.height/2-y;
       return {item,primary:sign*(vertical?dy:dx),cross:Math.abs(vertical?dx:dy)};
     }).filter(({primary,cross})=>primary>2&&(vertical||cross<4))
       .sort((a,b)=>Math.abs(a.primary-b.primary)<4?a.cross-b.cross:a.primary-b.primary);
     if(candidates.length){candidates[0].item.focus();return;}
     if(area==='products'&&key==='ArrowLeft')this.focusRegisterCart();
     if(area==='products'&&key==='ArrowUp')this.focusRegisterCategories();
     if(area==='keypad'&&key==='ArrowRight')this.focusRegisterProducts();
     if(area==='keypad'&&key==='ArrowUp')this.focusRegisterCart();
   },
   removeFromCart(id){
     const index=this.lines.findIndex(line=>line.id===id);
     this.remove(id);
     if(this.lines.length)this.focusRegisterArea('cart',items=>items[Math.min(index,items.length-1)]);
     else this.focusRegisterArea('search');
   },
   focusTopBar(){
     const items=this.registerTargets('topbar');
     this.focusTopBarItem(items.find(item=>item.getAttribute('aria-current')==='page')??items[0]);
   },
   focusTopBarItem(target){
     target?.focus();
     if(target?.closest('.top-pages'))target.scrollIntoView({block:'nearest',inline:'nearest'});
   },
   navigateTopBar(event){
     const trigger=event.target?.closest?.('.topbar [data-key-target]');
     const popup=event.target?.closest?.('.topbar .pos-dropdown');
     if(!trigger&&!popup)return false;
     const key=event.key;
     event.preventDefault();
     if(popup){
       const keys=[...popup.querySelectorAll('button:not(:disabled)')];
       const index=keys.indexOf(event.target);
       if(key==='ArrowDown'||key==='ArrowUp'){
         const offset=key==='ArrowDown'?1:-1;
         keys[(index+offset+keys.length)%keys.length]?.focus();
       }else popup.parentElement.querySelector('button[data-key-target]')?.focus();
       return true;
     }
     if(key==='ArrowLeft'||key==='ArrowRight'){
       const items=this.registerTargets('topbar');
       const offset=key==='ArrowLeft'?-1:1;
       this.focusTopBarItem(items[(items.indexOf(trigger)+offset+items.length)%items.length]);
     }else if(key==='ArrowDown'){
       const popupId=trigger.getAttribute('aria-controls');
       const first=trigger.getAttribute('aria-expanded')==='true'&&popupId
         ?document.getElementById(popupId)?.querySelector('button:not(:disabled)'):null;
       if(first)first.focus();
       else if(this.page==='register'&&!this.viewedOrder)this.focusRegisterArea('search');
       else document.querySelector('main .mg-page-head button:not(:disabled), main .saved-order-info button')?.focus();
     }
     return true;
   },
   keyboard(e){
     if(e.key==='Escape'&&(this.menu||this.profile)){
       const trigger=document.querySelector('[data-header-popover="'+(this.menu?'menu':'profile')+'"] > button');
       this.menu=false;this.profile=false;
       trigger?.focus();
       e.preventDefault();
       return;
     }
     if(!this.user||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||this.dialogName||this.actionDialog||this.receiptOrder||this.returnOrderId||this.pendingSubmission||e.target?.isContentEditable)return;
     if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
       if(this.navigateTopBar(e))return;
       if(this.page==='register'&&!this.viewedOrder&&(e.target?.id==='search'||!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)))this.navigateRegister(e);
       return;
     }
     if(this.page!=='register'||this.viewedOrder||e.target?.closest?.('.topbar'))return;
     if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName))return;
     if(e.key==='/'){e.preventDefault();this.focusRegisterArea('search');}
     else if(this.activeLine && /^[0-9.]$/.test(e.key)){e.preventDefault();this.press(e.key);}
     else if(this.activeLine && ['Backspace','Delete'].includes(e.key)){e.preventDefault();this.press(e.key==='Delete'?'−':'Delete');}
   }
 }
});
// Native modal dialogs are in the browser top layer. Move the single Nuxt toast viewport
// into the active dialog so its controls are neither hidden nor made inert by the dialog.
const app = Vue.createApp({
  setup() {
    const portal = Vue.ref('body');
    const mobile = window.matchMedia('(max-width: 650px)');
    const position = Vue.ref(mobile.matches ? 'top-center' : 'bottom-right');
    const updatePortal = () => {
      const dialogs = document.querySelectorAll('#app dialog:modal');
      portal.value = dialogs.length ? '#' + dialogs[dialogs.length - 1].id : 'body';
    };
    const updatePosition = () => { position.value = mobile.matches ? 'top-center' : 'bottom-right'; };
    const observer = new MutationObserver(updatePortal);
    Vue.onMounted(() => {
      observer.observe(document.getElementById('app'), { subtree: true, attributes: true, attributeFilter: ['open'] });
      mobile.addEventListener('change', updatePosition);
    });
    Vue.onBeforeUnmount(() => {
      observer.disconnect();
      mobile.removeEventListener('change', updatePosition);
    });
    return () => Vue.h(UApp, {
      toaster: { portal: portal.value, position: position.value, class: 'pos-toast-viewport', expand: true, max: 5 },
    }, { default: () => Vue.h(PosRegister) });
  },
});

app.component('pos-icon',{
 props:{name:String},
 render(){return Vue.h('svg',{viewBox:'0 0 24 24',fill:'currentColor','aria-hidden':true,focusable:'false',class:'remix-icon',innerHTML:Object.hasOwn(remixIcons,this.name)?remixIcons[this.name]:remixIcons.grid});}
});
const optionMeta = option => [option.slug ?? option.code, option.email, option.phone, option.detail].filter(Boolean).join(' · ');
const searchText = text => String(text ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
app.component('pos-search-select',{
 props:{
   inputId:{type:String,required:true}, label:{type:String,required:true}, modelValue:[Number,String],
   options:{type:Array,required:true}, required:Boolean, disabled:Boolean,
   remote:Boolean, loading:Boolean, retained:Object, more:Boolean,
 },
 emits:['update:modelValue','search'],
 data:()=>({open:false,query:'',active:-1}),
 computed:{
   selected(){return this.options.find(option=>String(option.id)===String(this.modelValue))??(String(this.retained?.id)===String(this.modelValue)?this.retained:null);},
   matches(){
     if(this.remote)return this.loading?[]:this.options;
     const words=searchText(this.query).trim().split(/\s+/).filter(Boolean);
     return this.options.filter(option=>{
       const haystack=searchText(option.name+' '+optionMeta(option));
       return words.every(word=>haystack.includes(word));
     });
   },
   listId(){return this.inputId+'-options';},
 },
   watch:{options(){if(this.remote&&this.open)this.move(this.matches.length?0:-1);}},
 mounted(){this.syncValidity();},
 updated(){this.syncValidity();},
 beforeUnmount(){this.stopTracking();},
 methods:{
   syncValidity(){this.$refs.input.setCustomValidity(this.required&&!this.selected?'Select a '+this.label.toLowerCase()+' from the list.':'');},
   start(){
     if(this.disabled||this.open)return;
     this.open=true;this.query='';this.active=this.matches.indexOf(this.selected);
     if(this.remote)this.$emit('search','');
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
     if(this.remote)this.$emit('search','');
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
         ref:'input',id:this.inputId,type:'text',role:'combobox',autocomplete:'off',spellcheck:false,maxlength:this.remote?100:undefined,
         disabled:this.disabled,required:this.required,
         'aria-expanded':String(this.open),'aria-controls':this.open?this.listId:undefined,'aria-autocomplete':'list',
         'aria-activedescendant':this.open&&this.active>=0?this.listId+'-'+this.active:undefined,
         value:this.open?this.query:this.selected?.name??'',
         placeholder:this.open?'Type to search…':'Select '+label.toLowerCase()+(this.required?'':' (optional)'),
         onFocus:this.start,onClick:this.start,
         onInput:event=>{const text=event.target.value;this.start();this.query=text;if(this.remote)this.$emit('search',text);this.move(this.matches.length?0:-1);},
         onKeydown:this.onKey,
       }),
       this.selected&&!this.required?h('button',{
         type:'button',class:'icon-button pos-picker-clear','aria-label':'Clear '+label.toLowerCase(),title:'Clear '+label.toLowerCase(),disabled:this.disabled,
         onMousedown:event=>event.preventDefault(),onClick:this.clear,
       },[h(icon,{name:'close'})]):null,
       h(icon,{name:'back',class:'pos-picker-chevron'}),
     ]),
     this.open?h(Vue.Teleport,{to:'#picker-overlays'},[h('div',{ref:'panel',class:'pos-picker-panel'},[
       h('div',{class:'pos-picker-caption',role:'status'},this.loading?'Searching…':this.more?'Refine your search for more results':this.matches.length?
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
app.use(nuxtUi);
app.mount('#app');
