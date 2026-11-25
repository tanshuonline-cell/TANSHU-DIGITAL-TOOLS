import { useEffect, useMemo, useState } from 'react';
import { makers, tools } from './App';
import { ArrowLeft, ImagePlus, LogOut, Save, Send, Search, Check, MonitorPlay, Grid2X2, List, UploadCloud } from 'lucide-react';

type Config = { tool_key:string; environment:'preview'|'live'; storage_path:string|null; fit:string; position_x:number; position_y:number; zoom:number; crop:unknown };
type ToolOption = { label:string; key:string; category:string; description:string; source:'maker'|'directory'; ready:boolean };
const base = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const toolSlug = (name:string) => name.toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const readSession = () => { try { return JSON.parse(sessionStorage.getItem('tanshu_admin_session') || '{}'); } catch { return {}; } };
const categoryNames:Record<string,string> = {'site-images':'SITE IMAGES',csc:'CSC & ID SERVICES',cyber:'CYBER CAFE',maker:'INSTANT MAKERS',docs:'DOCUMENTS',print:'PRINT & SCAN',photo:'PHOTO STUDIO',pvc:'PVC & ID CARDS',pdf:'PDF TOOLS',business:'BUSINESS',education:'EDUCATION',typing:'TYPING & CAREER',qr:'QR & BARCODE',utility:'UTILITIES',banking:'BANKING',govt:'GOVERNMENT ACCESS',graphics:'GRAPHIC DESIGN',stamp:'STAMP & SEAL',image:'IMAGE EDITING',portrait:'PORTRAIT STUDIO',idprint:'ID PRINT',forms:'FORMS & CALCULATORS',web:'WEB & SOCIAL',finance:'FINANCE'};
const categoryForMaker = (name:string) => /pvc|card|id/i.test(name)?'pvc':/pdf/i.test(name)?'pdf':/photo|portrait|background|signature|image/i.test(name)?'photo':/resume|certificate|document|letter/i.test(name)?'docs':'maker';

export default function AdminDashboard() {
  const session = readSession();
  const token = session.access_token as string|undefined;
  const [toolKey,setToolKey] = useState('');
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [view,setView] = useState<'grid'|'list'>('grid');
  const [environment,setEnvironment] = useState<'preview'|'live'>('preview');
  const [configs,setConfigs] = useState<Config[]>([]);
  const [configsLoaded,setConfigsLoaded] = useState(false);
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
      const row={tool_key:toolKey.trim(),environment,storage_path:storagePath,fit,position_x:x,position_y:y,zoom:zoom/100,crop:{},updated_at:new Date().toISOString()};
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
  if(!token) return <main className="admin-auth-page"><section className="admin-auth-card"><h1>Session expired</h1><p>Please sign in again.</p><button onClick={()=>window.location.assign('/admin-login')}>Admin Login</button></section></main>;
  const imageUrl=path?base+'/storage/v1/object/public/tool-thumbnails/'+path:'';
  const previewSrc=file?URL.createObjectURL(file):imageUrl;
  const workspaceUrl=selected?'/?tool-preview='+encodeURIComponent(selected.label):'';
  const categories=[...new Set(toolOptions.map(t=>t.category))].sort((a,b)=>(categoryNames[a]||a).localeCompare(categoryNames[b]||b));
  return <div className="admin-auth-page" style={{display:'block',padding:24,minHeight:'100vh'}}>
    <header style={{maxWidth:1320,margin:'0 auto 22px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div><p className="admin-auth-eyebrow">TANSHU DIGITAL TOOLS · ADMIN WORKSPACE</p><h1 style={{marginBottom:4}}>Thumbnail Studio</h1><p className="admin-auth-copy" style={{margin:0}}>Find a website tool, inspect its thumbnail card and configure its image</p></div>
      <button className="admin-auth-back" onClick={()=>{sessionStorage.removeItem('tanshu_admin_session');window.location.assign('/admin-login')}}><LogOut size={15}/> Sign out</button>
    </header>
    <div style={{maxWidth:1320,margin:'auto',display:'grid',gridTemplateColumns:'minmax(280px,0.95fr) minmax(0,1.55fr)',gap:20,alignItems:'start'}}>
      <section className="admin-auth-card" style={{width:'100%',padding:18}}>
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
      <div style={{display:'grid',gap:20,minWidth:0}}>
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
        <section className="admin-auth-card" style={{width:'100%',padding:22}}>
          <h2 style={{marginTop:0}}>Thumbnail configuration</h2>
          <label>Configuration environment</label><select value={environment} onChange={e=>{setEnvironment(e.target.value as 'preview'|'live');const c=configFor(toolKey,e.target.value as 'preview'|'live');if(c){setPath(c.storage_path||'');setFit(c.fit||'cover');setX(c.position_x??50);setY(c.position_y??50);setZoom((c.zoom??1)*100);}else{setPath('');setFit('cover');setX(50);setY(50);setZoom(100);}setFile(null);}} style={{width:'100%',padding:11,marginTop:8,background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:9}}><option value="preview">Preview (safe draft)</option><option value="live">Live</option></select>
          <label style={{display:'block',marginTop:16}}>Upload thumbnail image</label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>
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
        <section className="admin-auth-card" style={{width:'100%',padding:20}}><h2 style={{marginTop:0}}>Saved configurations</h2>{configs.length?configs.map((c,i)=><button key={c.tool_key+c.environment+i} onClick={()=>selectConfig(c)} style={{display:'block',width:'100%',textAlign:'left',padding:11,margin:'8px 0',border:'1px solid #34415b',borderRadius:9,background:'#0b1220',color:'white',cursor:'pointer'}}><b>{toolOptions.find(t=>t.key===c.tool_key)?.label||c.tool_key}</b><small style={{display:'block',color:'#9db7e9'}}>{c.environment} · {c.storage_path?'Thumbnail uploaded':'No image'}</small></button>):<p className="admin-auth-copy">No saved thumbnails yet.</p>}</section>
      </div>
    </div>
  </div>;
}
