import { useEffect, useMemo, useRef, useState } from 'react';
import VideoStudio from './VideoStudio';
import { makers, tools } from './App';
import { ArrowLeft, ImagePlus, LogOut, Save, Send, Search, Check, MonitorPlay, Grid2X2, List, UploadCloud } from 'lucide-react';

type Config = { tool_key:string; environment:'preview'|'live'; storage_path:string|null; fit:string; position_x:number; position_y:number; zoom:number; crop:unknown; is_enabled:boolean };
type ToolOption = { label:string; key:string; category:string; description:string; source:'maker'|'directory'; ready:boolean };
const base = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const toolSlug = (name:string) => name.toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const readSession = () => { try { return JSON.parse(sessionStorage.getItem('tanshu_admin_session') || '{}'); } catch { return {}; } };
const categoryNames:Record<string,string> = {'site-images':'SITE IMAGES',csc:'CSC & ID SERVICES',cyber:'CYBER CAFE',maker:'INSTANT MAKERS',docs:'DOCUMENTS',print:'PRINT & SCAN',photo:'PHOTO STUDIO',pvc:'PVC & ID CARDS',pdf:'PDF TOOLS',business:'BUSINESS',education:'EDUCATION',typing:'TYPING & CAREER',qr:'QR & BARCODE',utility:'UTILITIES',banking:'BANKING',govt:'GOVERNMENT ACCESS',graphics:'GRAPHIC DESIGN',stamp:'STAMP & SEAL',image:'IMAGE EDITING',portrait:'PORTRAIT STUDIO',idprint:'ID PRINT',forms:'FORMS & CALCULATORS',web:'WEB & SOCIAL',finance:'FINANCE'};
const categoryForMaker = (name:string) => /pvc|card|id/i.test(name)?'pvc':/pdf/i.test(name)?'pdf':/photo|portrait|background|signature|image/i.test(name)?'photo':/resume|certificate|document|letter/i.test(name)?'docs':'maker';

export default function AdminDashboard() {
  const session = readSession();
  const [showVideoStudio,setShowVideoStudio] = useState(false);
  const token = session.access_token as string|undefined;
  const [toolKey,setToolKey] = useState('');
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [view,setView] = useState<'grid'|'list'>('grid');
  const [environment,setEnvironment] = useState<'preview'|'live'>('preview');
  const [configs,setConfigs] = useState<Config[]>([]);
  const [configsLoaded,setConfigsLoaded] = useState(false);
  const [showAllConfigs,setShowAllConfigs] = useState(false);
  const configSectionRef = useRef<HTMLElement|null>(null);
  const fileInputRef = useRef<HTMLInputElement|null>(null);
  const [path,setPath] = useState('');
  const [fit,setFit] = useState('cover');
  const [x,setX] = useState(50); const [y,setY] = useState(50); const [zoom,setZoom] = useState(100);
  const [file,setFile] = useState<File|null>(null); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false);
  const headers = useMemo(()=>({apikey:key, Authorization:'Bearer '+(token||''), 'Content-Type':'application/json'}),[token]);
  const toolOptions = useMemo<ToolOption[]>(() => {
    const imageSlots:ToolOption[] = [
      {label:'Home Hero Image (16:9)',key:'site-home-hero',category:'site-images',description:'Homepage hero/banner image',source:'directory',ready:true},
      {label:'CSS Center Workspace Thumbnail (16:9)',key:'site-css-center',category:'site-images',description:'CSS Center workspace feature image',source:'directory',ready:true},
      {label:'Cyber Cafe Workspace Thumbnail (16:9)',key:'site-cyber-cafe',category:'site-images',description:'Cyber Cafe workspace feature image',source:'directory',ready:true},
      {label:'Website / App Profile Photo (1:1)',key:'site-profile-photo',category:'site-images',description:'Profile avatar image',source:'directory',ready:true},
      {label:'Intro Slide 1 (16:9)',key:'site-intro-slide-1',category:'site-images',description:'First intro splash image',source:'directory',ready:true},
      {label:'Intro Slide 2 (16:9)',key:'site-intro-slide-2',category:'site-images',description:'Second intro splash image',source:'directory',ready:true},
      {label:'Intro Slide 3 (16:9)',key:'site-intro-slide-3',category:'site-images',description:'Third intro splash image',source:'directory',ready:true},
      ...['csc','cyber','maker','docs','print','photo','pvc','pdf','business','recordform','education','typing','qr','utility','banking','govt','graphics','stamp','image','portrait','idprint','forms','web','finance'].map(id=>({label:'Explore Category — '+(categoryNames[id]||id)+' (16:9)',key:'site-category-'+id,category:'site-images',description:'Explore Category card image',source:'directory' as const,ready:true}))
    ];
    const options:ToolOption[] = [
      ...imageSlots,
      ...tools.map(t => ({label:String(t[1]),key:toolSlug(String(t[1])),category:String(t[0]),description:String(t[3]||''),source:'directory' as const,ready:false})),
      ...makers.map(m => ({label:m.en,key:toolSlug(m.en),category:categoryForMaker(m.en),description:String(m.sub||''),source:'maker' as const,ready:!!m.ready}))
    ];
    const unique = new Map<string,ToolOption>();
    options.forEach(option => { if(option.key && !unique.has(option.key)) unique.set(option.key,option); });
    return [...unique.values()].sort((a,b)=>a.label.localeCompare(b.label));
  },[]);
  const selected = toolOptions.find(t=>t.key===toolKey) || null;
  const filtered = useMemo(()=>toolOptions.filter(t=>{
    const q=search.trim().toLowerCase();
    const matchesSearch=!q || (t.label+' '+t.description+' '+(categoryNames[t.category]||t.category)).toLowerCase().includes(q);
    return matchesSearch && (category==='all'||t.category===category);
  }),[toolOptions,search,category]);
  const configFor = (tool:string,env: 'preview'|'live'=environment) => configs.find(c=>c.tool_key===tool&&c.environment===env);
  async function load():Promise<Config[]> {
    if(!token) throw new Error('Admin session missing. Please sign in again.');
    const r=await fetch(base+'/rest/v1/thumbnail_configs?select=*&order=tool_key.asc',{headers});
    if(!r.ok) throw new Error('Could not load saved thumbnails: '+await r.text());
    const rows=await r.json() as Config[];
    setConfigs(rows);setConfigsLoaded(true);
    return rows;
  }
  useEffect(()=>{let active=true;load().catch(e=>{if(active)setMessage(e instanceof Error?e.message:'Could not load saved thumbnails.');});return()=>{active=false;};},[token]);
  async function selectTool(t:ToolOption){
    setToolKey(t.key);setSearch(search);setPath('');setFile(null);setMessage('');
    try {
      const rows=configsLoaded?configs:await load();
      const saved=rows.find(c=>c.tool_key===t.key&&c.environment===environment);
      if(saved){setPath(saved.storage_path||'');setFit(saved.fit||'cover');setX(saved.position_x??50);setY(saved.position_y??50);setZoom((saved.zoom??1)*100);}
      else {setFit('cover');setX(50);setY(50);setZoom(100);}
    } catch(e) {setMessage(e instanceof Error?e.message:'Could not load saved configuration.');}
  }
  function selectConfig(c:Config){
    setToolKey(c.tool_key);setEnvironment(c.environment);setPath(c.storage_path||'');setFit(c.fit||'cover');setX(c.position_x??50);setY(c.position_y??50);setZoom((c.zoom??1)*100);setFile(null);setMessage('');
  }
  function replaceConfig(c:Config){
    if(c.environment!=='preview'){setMessage('Live configuration is read-only in this Preview workspace.');return;}
    selectConfig(c);
    configSectionRef.current?.scrollIntoView({behavior:'smooth',block:'center'});
    fileInputRef.current?.click();
  }
  async function setConfigEnabled(c:Config,enabled:boolean){
    if(c.environment!=='preview'){setMessage('Live configuration is read-only in this Preview workspace.');return;}
    setBusy(true);setMessage('');
    try{
      const r=await fetch(base+'/rest/v1/thumbnail_configs?tool_key=eq.'+encodeURIComponent(c.tool_key)+'&environment=eq.preview',{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({is_enabled:enabled,updated_at:new Date().toISOString()})});
      if(!r.ok)throw new Error('Could not update thumbnail status: '+await r.text());
      await load();setMessage(enabled?'Preview thumbnail enabled.':'Preview thumbnail disabled on the website; its saved configuration is kept.');
    }catch(e){setMessage(e instanceof Error?e.message:'Could not update thumbnail status.');}finally{setBusy(false);}
  }
  async function deleteConfig(c:Config){
    if(c.environment!=='preview'){setMessage('Live configuration is read-only in this Preview workspace.');return;}
    if(!window.confirm('Delete this saved Preview thumbnail configuration? The uploaded image file itself will be kept as a backup.'))return;
    setBusy(true);setMessage('');
    try{
      const r=await fetch(base+'/rest/v1/thumbnail_configs?tool_key=eq.'+encodeURIComponent(c.tool_key)+'&environment=eq.preview',{method:'DELETE',headers});
      if(!r.ok)throw new Error('Could not delete configuration: '+await r.text());
      await load();
      if(toolKey===c.tool_key&&environment==='preview'){setPath('');setFile(null);}
      setMessage('Preview configuration deleted from the saved list and website.');
    }catch(e){setMessage(e instanceof Error?e.message:'Could not delete configuration.');}finally{setBusy(false);}
  }
  async function save(publish=false){
    if(!token){setMessage('Session missing. Please sign in again.');return;}
    if(!toolKey.trim()){setMessage('Choose a website tool first.');return;}
    setBusy(true);setMessage('');
    try{
      let storagePath=path;
      if(file){
        storagePath=`${toolKey.trim()}/${environment}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        const up=await fetch(base+'/storage/v1/object/tool-thumbnails/'+storagePath,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':file.type,'x-upsert':'true'},body:file});
        if(!up.ok) throw new Error('Image upload failed: '+await up.text());
      }
      if(!storagePath) throw new Error('Please upload a thumbnail image before saving this tool.');
      const row={tool_key:toolKey.trim(),environment,storage_path:storagePath,fit,position_x:x,position_y:y,zoom:zoom/100,crop:{},is_enabled:true,updated_at:new Date().toISOString()};
      const r=await fetch(base+'/rest/v1/thumbnail_configs?on_conflict=tool_key,environment',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
      if(!r.ok) throw new Error('Save failed: '+await r.text());
      setPath(storagePath);await load();
      if(publish&&environment==='preview'){
        const promote=await fetch(base+'/rest/v1/thumbnail_configs?on_conflict=tool_key,environment',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({...row,environment:'live'})});
        if(!promote.ok) throw new Error('Preview saved, but promotion failed: '+await promote.text());
        await load();setMessage('Preview saved and promoted to Live.');
      }else setMessage(environment==='preview'?'Preview configuration saved.':'Live configuration saved.');
    }catch(e){setMessage(e instanceof Error?e.message:'Operation failed.');}finally{setBusy(false);}
  }
  if(showVideoStudio) return <main className="admin-auth-page" style={{display:'block',padding:24,minHeight:'100vh'}}><VideoStudio onBack={()=>setShowVideoStudio(false)}/></main>;
  if(!token) return <main className="admin-auth-page"><section className="admin-auth-card"><h1>Session expired</h1><p>Please sign in again.</p><button onClick={()=>window.location.assign('/admin-login')}>Admin Login</button></section></main>;
  const imageUrl=path?base+'/storage/v1/object/public/tool-thumbnails/'+path:'';
  const previewSrc=file?URL.createObjectURL(file):imageUrl;
  const workspaceUrl=selected?'/?tool-preview='+encodeURIComponent(selected.label):'';
  const categories=[...new Set(toolOptions.map(t=>t.category))].sort((a,b)=>(categoryNames[a]||a).localeCompare(categoryNames[b]||b));
  const visibleConfigs=showAllConfigs?configs:configs.slice(0,5);
  return <div className="admin-auth-page admin-dashboard-page" style={{display:'block',padding:24,minHeight:'100vh'}}>
    <style>{`
      .admin-dashboard-page{box-sizing:border-box;width:100%;max-width:100%;overflow-x:hidden}
      .admin-dashboard-grid{width:100%;min-width:0}
      .admin-dashboard-grid>section,.admin-dashboard-grid>div{min-width:0;max-width:100%;box-sizing:border-box}
      .admin-dashboard-right{min-width:0;max-width:100%;width:100%}
      .admin-dashboard-config{min-width:0;max-width:100%;overflow:hidden;scroll-margin-top:16px}
      .admin-dashboard-config input[type=file]{display:block;width:100%;max-width:100%;box-sizing:border-box;margin-top:8px;color:#dce5f5;font-size:13px}
      .admin-dashboard-config input[type=range]{display:block;width:100%;max-width:100%;margin:9px 0 3px;accent-color:#a9c7ff}
      .admin-dashboard-config label{display:block;color:#dce5f5;font-size:13px;font-weight:700;line-height:1.45;overflow-wrap:anywhere}
      .admin-dashboard-config select{max-width:100%;box-sizing:border-box}
      .admin-dashboard-config button{max-width:100%;white-space:normal;line-height:1.35}
      @media(max-width:900px){
        .admin-dashboard-page{padding:12px!important;padding-bottom:calc(24px + env(safe-area-inset-bottom))!important}
        .admin-dashboard-page>header{gap:10px!important;margin-bottom:14px!important}
        .admin-dashboard-page>header h1{font-size:23px!important;line-height:1.2!important}
        .admin-dashboard-page>header .admin-auth-copy{font-size:12px!important;line-height:1.45!important}
        .admin-dashboard-grid{grid-template-columns:minmax(0,1fr)!important;gap:14px!important;align-items:stretch!important}
        .admin-dashboard-grid>.admin-dashboard-left{order:0;position:relative;min-width:0}
        .admin-dashboard-grid>.admin-dashboard-right{order:1;display:grid;grid-template-columns:minmax(0,1fr);gap:14px!important}
        .admin-dashboard-left>div[style*="maxHeight"]{max-height:250px!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .admin-dashboard-config{padding:15px!important}
        .admin-dashboard-config>div[style*="grid-template-columns"]{grid-template-columns:minmax(0,1fr)!important;gap:12px!important}
        .admin-dashboard-config>div[style*="grid-template-columns"]>div:last-child{width:100%;max-width:360px;justify-self:center;aspect-ratio:16/9!important}
        .admin-dashboard-config>div[style*="display:flex"]{gap:8px!important}
        .admin-dashboard-config button{min-height:40px;padding:9px 11px!important}
      }
      @media(max-width:480px){
        .admin-dashboard-page{padding:9px!important}
        .admin-dashboard-page>header{align-items:flex-start!important}
        .admin-dashboard-page>header>div:last-child{width:100%;display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important}
        .admin-dashboard-page>header>div:last-child button{justify-content:center;min-height:40px}
        .admin-dashboard-grid .admin-auth-card{padding:13px!important;border-radius:15px!important}
        .admin-dashboard-config h2{font-size:19px!important;line-height:1.3!important}
        .admin-dashboard-config input[type=file]{font-size:12px}
        .admin-dashboard-config>div[style*="display:flex"] button{flex:1 1 100%;justify-content:center}
      }
    `}</style>
    <header style={{maxWidth:1320,margin:'0 auto 22px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div><p className="admin-auth-eyebrow">TANSHU DIGITAL TOOLS · ADMIN WORKSPACE</p><h1 style={{marginBottom:4}}>Thumbnail Studio</h1><p className="admin-auth-copy" style={{margin:0}}>Find a website tool, inspect its thumbnail card and configure its image</p></div>
      <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><button onClick={()=>setShowVideoStudio(true)}><MonitorPlay size={15}/> Video Studio</button><button className="admin-auth-back" onClick={()=>{sessionStorage.removeItem('tanshu_admin_session');window.location.assign('/admin-login')}}><LogOut size={15}/> Sign out</button></div>
    </header>
    <div className="admin-dashboard-grid" style={{maxWidth:1320,margin:'auto',display:'grid',gridTemplateColumns:'minmax(280px,0.95fr) minmax(0,1.55fr)',gap:20,alignItems:'start'}}>
      <section className="admin-auth-card admin-dashboard-left" style={{width:'100%',padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><h2 style={{margin:0}}>Website tools</h2><span className="admin-auth-copy">{toolOptions.length} available</span></div>
        <div style={{position:'relative',marginTop:14}}><Search size={17} style={{position:'absolute',left:12,top:13,color:'#9db7e9'}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tool name..." aria-label="Search website tools" style={{width:'100%',boxSizing:'border-box',padding:'12px 12px 12px 38px',background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:10}}/></div>
        <div style={{display:'flex',gap:8,marginTop:10,alignItems:'center'}}><select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)} style={{flex:1,minWidth:0,padding:10,background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:9}}><option value="all">All categories</option>{categories.map(c=><option key={c} value={c}>{categoryNames[c]||c}</option>)}</select><button type="button" onClick={()=>setView(v=>v==='grid'?'list':'grid')} title="Toggle list or grid" style={{padding:10,background:'#17243a',color:'white',border:'1px solid #3a4861',borderRadius:9}}>{view==='grid'?<List size={17}/>:<Grid2X2 size={17}/>}</button></div>
        <p className="admin-auth-copy" style={{margin:'12px 0 8px'}}>{filtered.length} matching tools · Select one to configure</p>
        <div style={{display:'grid',gridTemplateColumns:view==='grid'?'repeat(2,minmax(0,1fr))':'1fr',gap:9,maxHeight:650,overflowY:'auto',paddingRight:3}}>
          {filtered.map(t=>{
            const saved=configFor(t.key);
            const active=t.key===toolKey;
            const thumb=saved?.storage_path?base+'/storage/v1/object/public/tool-thumbnails/'+saved.storage_path:'';
            return <button key={t.key} type="button" onClick={()=>selectTool(t)} aria-pressed={active} style={{textAlign:'left',padding:9,border:active?'2px solid #72a7ff':'1px solid #34415b',borderRadius:11,background:active?'#172b48':'#0b1220',color:'white',cursor:'pointer',minWidth:0}}>
              <div style={{aspectRatio:'16/9',borderRadius:7,overflow:'hidden',background:'linear-gradient(135deg,#182a42,#263b55)',display:'grid',placeItems:'center',marginBottom:8}}>{thumb?<img src={thumb} alt={t.label+' thumbnail'} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{textAlign:'center',padding:6}}><ImagePlus size={22} color="#9db7e9"/><div style={{fontSize:10,color:'#c7d6eb',marginTop:4}}>THUMBNAIL NOT SET</div></div>}</div>
              <b style={{fontSize:12,lineHeight:1.35,display:'block'}}>{t.label}</b><small style={{display:'block',color:'#9db7e9',marginTop:4}}>{categoryNames[t.category]||t.category}{saved?' · thumbnail saved':''}</small>
            </button>;
          })}
          {!filtered.length&&<p className="admin-auth-copy">No tools match that search. Try a shorter name.</p>}
        </div>
      </section>
      <div className="admin-dashboard-right" style={{display:'grid',gap:20,minWidth:0}}>
        <section className="admin-auth-card" style={{width:'100%',padding:22}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><p className="admin-auth-eyebrow" style={{marginBottom:5}}>SELECTED TOOL</p><h2 style={{margin:0}}>{selected?.label||'Choose a website tool'}</h2><p className="admin-auth-copy" style={{margin:'6px 0 0'}}>{selected?.description||'Search or select a tool from the directory to see its thumbnail preview.'}</p></div>{selected&&<span style={{fontSize:11,color:'#a9c9ff',border:'1px solid #3d5d86',borderRadius:20,padding:'6px 10px'}}> {selected.ready?'READY TOOL':'DIRECTORY TOOL'}</span>}</div>
          <div style={{marginTop:18,border:'1px solid #34415b',borderRadius:14,overflow:'hidden',background:'#0b1220'}}>
            <div style={{padding:'9px 13px',borderBottom:'1px solid #34415b',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:11,color:'#9db7e9',letterSpacing:1}}>THUMBNAIL CARD PREVIEW</span><MonitorPlay size={16} color="#9db7e9"/></div>
            <div style={{padding:16,display:'grid',gridTemplateColumns:'minmax(0,1.1fr) minmax(130px,.9fr)',gap:16,alignItems:'center'}}>
              <div style={{aspectRatio:'16/9',borderRadius:10,overflow:'hidden',background:'#182a42',display:'grid',placeItems:'center'}}>{previewSrc?<img src={previewSrc} alt="Selected thumbnail preview" style={{width:'100%',height:'100%',objectFit:fit as 'cover'|'contain'|'fill',objectPosition:`${x}% ${y}%`,transform:`scale(${zoom/100})`}}/>:<div style={{textAlign:'center',color:'#c7d6eb'}}><ImagePlus size={34}/><p style={{fontSize:12}}>Upload a thumbnail to preview it here</p></div>}</div>
              <div><b style={{display:'block',fontSize:16}}>{selected?.label||'Tool name'}</b><p style={{fontSize:12,color:'#9db7e9',lineHeight:1.5}}>{selected?.description||'Tool description will appear here.'}</p><small style={{color:'#8fa3bf'}}>Website card · 16:9 image area</small></div>
            </div>
          </div>
          <p className="admin-auth-copy" style={{marginBottom:0}}>ऊपर वाला भाग वेबसाइट की listing card का preview है। नीचे उसी चुने हुए tool का वास्तविक website workspace खुलता है।</p>
        </section>
        <section className="admin-auth-card" style={{width:'100%',padding:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:12}}>
            <div><p className="admin-auth-eyebrow" style={{marginBottom:5}}>LIVE WEBSITE WORKSPACE</p><h2 style={{margin:0}}>Actual tool preview</h2><p className="admin-auth-copy" style={{margin:'5px 0 0'}}>यह वेबसाइट में खुलने वाले उसी tool का वास्तविक workspace है। यहाँ आप उसके controls और layout जाँच सकते हैं।</p></div>
            {selected&&<a href={workspaceUrl} target="_blank" rel="noreferrer" style={{color:'#a9c9ff',fontSize:13,textDecoration:'underline'}}>Open in new tab ↗</a>}
          </div>
          {selected?<iframe key={selected.key} title={selected.label+' actual workspace preview'} src={workspaceUrl} style={{display:'block',width:'100%',height:780,border:'1px solid #34415b',borderRadius:12,background:'#fff'}}/>:<div style={{padding:40,textAlign:'center',border:'1px dashed #52627b',borderRadius:12,color:'#9db7e9'}}>पहले बाईं ओर से कोई website tool चुनें।</div>}
          <p className="admin-auth-copy" style={{margin:'10px 0 0'}}>नोट: जो tool अभी वेबसाइट पर निर्माणाधीन है, उसका वही उपलब्ध status screen दिखेगा। यह preview tool की मौजूदा functionality को नहीं बदलता।</p>
        </section>
        <section ref={configSectionRef} className="admin-auth-card admin-dashboard-config" style={{width:'100%',padding:22}}>
          <h2 style={{marginTop:0}}>Thumbnail configuration</h2>
          <label>Configuration environment</label><select value={environment} onChange={e=>{setEnvironment(e.target.value as 'preview'|'live');const c=configFor(toolKey,e.target.value as 'preview'|'live');if(c){setPath(c.storage_path||'');setFit(c.fit||'cover');setX(c.position_x??50);setY(c.position_y??50);setZoom((c.zoom??1)*100);}else{setPath('');setFit('cover');setX(50);setY(50);setZoom(100);}setFile(null);}} style={{width:'100%',padding:11,marginTop:8,background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:9}}><option value="preview">Preview (safe draft)</option><option value="live">Live</option></select>
          <label style={{display:'block',marginTop:16}}>Upload thumbnail image</label><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>
          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 170px',gap:16,marginTop:16}}>
            <div><label>Fit</label><select value={fit} onChange={e=>setFit(e.target.value)} style={{width:'100%',padding:10,background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:8}}><option value="cover">Cover</option><option value="contain">Contain</option></select>
              <label style={{display:'block',marginTop:14}}>Horizontal position: {x}%</label><input type="range" min="0" max="100" value={x} onChange={e=>setX(+e.target.value)}/>
              <label style={{display:'block',marginTop:10}}>Vertical position: {y}%</label><input type="range" min="0" max="100" value={y} onChange={e=>setY(+e.target.value)}/>
              <label style={{display:'block',marginTop:10}}>Zoom: {zoom}%</label><input type="range" min="50" max="200" value={zoom} onChange={e=>setZoom(+e.target.value)}/>
            </div>
            <div style={{aspectRatio:'4/3',overflow:'hidden',borderRadius:12,background:'#0b1220',border:'1px solid #34415b',display:'grid',placeItems:'center'}}>{previewSrc?<img src={previewSrc} alt="Crop preview" style={{width:'100%',height:'100%',objectFit:fit as 'cover'|'contain'|'fill',objectPosition:`${x}% ${y}%`,transform:`scale(${zoom/100})`}}/>:<ImagePlus color="#718096"/>}</div>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}><button onClick={()=>void save(false)} disabled={busy||!toolKey}><Save size={15}/> Save {environment}</button>{environment==='preview'&&<button onClick={()=>void save(true)} disabled={busy||!toolKey}><Send size={15}/> Promote Preview → Live</button>}</div>
          {message&&<p role="status" className="admin-auth-copy">{message}</p>}
        </section>
        <section className="admin-auth-card" style={{width:'100%',padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <div><h2 style={{marginTop:0,marginBottom:4}}>Saved configurations</h2><p className="admin-auth-copy" style={{margin:'0 0 8px'}}>All saved thumbnails · {configs.length} configurations</p></div>
            {configs.length>5&&<button type="button" onClick={()=>setShowAllConfigs(v=>!v)} style={{padding:'8px 12px',border:'1px solid #52627b',borderRadius:9,background:'#17243a',color:'#fff',cursor:'pointer'}}>{showAllConfigs?'Show less ↑':'More ↓'}</button>}
          </div>
          {configs.length?visibleConfigs.map((c,i)=>{
            const option=toolOptions.find(t=>t.key===c.tool_key);
            const image=c.storage_path?base+'/storage/v1/object/public/tool-thumbnails/'+c.storage_path:'';
            const previewOnly=c.environment==='preview';
            return <div key={c.tool_key+c.environment+i} style={{padding:12,margin:'9px 0',border:'1px solid #d7e0ec',borderRadius:12,background:'#f8fafc'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
                <div style={{width:92,flex:'0 0 92px',aspectRatio:'16/9',overflow:'hidden',borderRadius:8,background:'#e6edf5',display:'grid',placeItems:'center'}}>{image?<img src={image} alt={(option?.label||c.tool_key)+' saved thumbnail'} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:10,color:'#526174'}}>NO IMAGE</span>}</div>
                <div style={{minWidth:0,flex:1}}>
                  <b style={{display:'block',color:'#172033',fontSize:13,overflowWrap:'anywhere'}}>{option?.label||c.tool_key}</b>
                  <small style={{display:'block',color:'#526174',marginTop:4}}>{c.environment.toUpperCase()} · {c.storage_path?'Thumbnail uploaded':'No image'} · {c.is_enabled===false?'Disabled':'Enabled'}</small>
                </div>
              </div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:11}}>
                <button type="button" onClick={()=>replaceConfig(c)} disabled={busy||!previewOnly} style={{padding:'7px 10px',borderRadius:8,border:'1px solid #9bb6d8',background:previewOnly?'#e8f1ff':'#edf0f4',color:'#18385f',cursor:previewOnly?'pointer':'not-allowed',opacity:previewOnly?1:.55}}>Replace</button>
                <button type="button" onClick={()=>{selectConfig(c);configSectionRef.current?.scrollIntoView({behavior:'smooth',block:'center'});}} disabled={!previewOnly} style={{padding:'7px 10px',borderRadius:8,border:'1px solid #cbd5e1',background:'#fff',color:'#26364b',cursor:previewOnly?'pointer':'not-allowed',opacity:previewOnly?1:.55}}>Change settings</button>
                <button type="button" onClick={()=>void setConfigEnabled(c,c.is_enabled===false)} disabled={busy||!previewOnly} style={{padding:'7px 10px',borderRadius:8,border:'1px solid #cbd5e1',background:'#fff',color:c.is_enabled===false?'#166534':'#8a4b12',cursor:previewOnly?'pointer':'not-allowed',opacity:previewOnly?1:.55}}>{c.is_enabled===false?'Enable':'Disable'}</button>
                <button type="button" onClick={()=>void deleteConfig(c)} disabled={busy||!previewOnly} style={{padding:'7px 10px',borderRadius:8,border:'1px solid #f0b9b9',background:'#fff7f7',color:'#a12c2c',cursor:previewOnly?'pointer':'not-allowed',opacity:previewOnly?1:.55}}>Delete</button>
                {!previewOnly&&<small style={{alignSelf:'center',color:'#8b5d1a'}}>Live item is read-only here</small>}
              </div>
            </div>;
          }):<p className="admin-auth-copy">No saved thumbnails yet.</p>}
          {configs.length>5&&<button type="button" onClick={()=>setShowAllConfigs(v=>!v)} style={{display:'block',width:'100%',marginTop:10,padding:10,border:'1px solid #52627b',borderRadius:9,background:'#17243a',color:'#fff',cursor:'pointer'}}>{showAllConfigs?'Show less ↑':'Show all saved thumbnails ↓'}</button>}
          {message&&<p role="status" className="admin-auth-copy">{message}</p>}
        </section>
      </div>
    </div>
  </div>;
}

