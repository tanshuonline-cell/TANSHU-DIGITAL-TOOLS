import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ImagePlus, LogOut, Save, UploadCloud, ShieldCheck, Send } from 'lucide-react';

type Config = { tool_key:string; environment:'preview'|'live'; storage_path:string|null; fit:string; position_x:number; position_y:number; zoom:number; crop:unknown };
const base = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const readSession = () => { try { return JSON.parse(sessionStorage.getItem('tanshu_admin_session') || '{}'); } catch { return {}; } };

export default function AdminDashboard() {
  const session = readSession();
  const token = session.access_token as string|undefined;
  const [toolKey,setToolKey] = useState('');
  const [environment,setEnvironment] = useState<'preview'|'live'>('preview');
  const [configs,setConfigs] = useState<Config[]>([]);
  const [path,setPath] = useState('');
  const [fit,setFit] = useState('cover');
  const [x,setX] = useState(50); const [y,setY] = useState(50); const [zoom,setZoom] = useState(100);
  const [file,setFile] = useState<File|null>(null); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false);
  const headers = useMemo(()=>({apikey:key, Authorization:'Bearer '+(token||''), 'Content-Type':'application/json'}),[token]);
  async function load() {
    if(!token) return;
    const r=await fetch(base+'/rest/v1/thumbnail_configs?select=*&order=tool_key.asc',{headers});
    if(r.ok) setConfigs(await r.json());
  }
  useEffect(()=>{void load();},[token]);
  function selectConfig(c:Config){setToolKey(c.tool_key);setEnvironment(c.environment);setPath(c.storage_path||'');setFit(c.fit||'cover');setX(c.position_x??50);setY(c.position_y??50);setZoom(c.zoom??100);setFile(null);setMessage('');}
  async function save(publish=false){
    if(!token){setMessage('Session missing. Please sign in again.');return;}
    if(!toolKey.trim()){setMessage('Enter a tool key first.');return;}
    setBusy(true);setMessage('');
    try{
      let storagePath=path;
      if(file){
        storagePath=`${toolKey.trim()}/${environment}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        const up=await fetch(base+'/storage/v1/object/tool-thumbnails/'+storagePath,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':file.type,'x-upsert':'true'},body:file});
        if(!up.ok) throw new Error('Image upload failed: '+await up.text());
      }
      const row={tool_key:toolKey.trim(),environment,storage_path:storagePath||null,fit,position_x:x,position_y:y,zoom,crop:null,updated_at:new Date().toISOString()};
      const r=await fetch(base+'/rest/v1/thumbnail_configs?on_conflict=tool_key,environment',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
      if(!r.ok) throw new Error('Save failed: '+await r.text());
      setPath(storagePath); await load();
      if(publish && environment==='preview'){
        const promote=await fetch(base+'/rest/v1/thumbnail_configs?on_conflict=tool_key,environment',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({...row,environment:'live'})});
        if(!promote.ok) throw new Error('Preview saved, but promotion failed: '+await promote.text());
        await load(); setMessage('Preview saved and promoted to Live.');
      } else setMessage(environment==='preview'?'Preview configuration saved.':'Live configuration saved.');
    }catch(e){setMessage(e instanceof Error?e.message:'Operation failed.');}finally{setBusy(false);}
  }
  if(!token) return <main className="admin-auth-page"><section className="admin-auth-card"><h1>Session expired</h1><p>Please sign in again.</p><button onClick={()=>window.location.assign('/admin-login')}>Admin Login</button></section></main>;
  const imageUrl=path?base+'/storage/v1/object/public/tool-thumbnails/'+path:'';
  return <div className="admin-auth-page" style={{display:'block',padding:24}}><header style={{maxWidth:1100,margin:'0 auto 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p className="admin-auth-eyebrow">TANSHU DIGITAL TOOLS · ADMIN</p><h1>Thumbnail Manager</h1></div><button className="admin-auth-back" onClick={()=>{sessionStorage.removeItem('tanshu_admin_session');window.location.assign('/admin-login')}}><LogOut size={15}/> Sign out</button></header>
  <div style={{maxWidth:1100,margin:'auto',display:'grid',gridTemplateColumns:'minmax(220px,1fr) minmax(0,2fr)',gap:20}}>
  <section className="admin-auth-card" style={{width:'100%',padding:20}}><h2>Saved configurations</h2>{configs.length?configs.map((c,i)=><button key={c.tool_key+c.environment+i} onClick={()=>selectConfig(c)} style={{display:'block',width:'100%',textAlign:'left',padding:12,margin:'8px 0',border:'1px solid #34415b',borderRadius:9,background:'#0b1220',color:'white',cursor:'pointer'}}><b>{c.tool_key}</b><small style={{display:'block',color:'#9db7e9'}}>{c.environment}</small></button>):<p className="admin-auth-copy">No saved thumbnails yet.</p>}</section>
  <section className="admin-auth-card" style={{width:'100%',padding:24}}><h2>Configure thumbnail</h2><label>Tool key</label><input value={toolKey} onChange={e=>setToolKey(e.target.value)} placeholder="e.g. passport-photo-maker"/><label>Configuration</label><select value={environment} onChange={e=>setEnvironment(e.target.value as 'preview'|'live')} style={{width:'100%',padding:12,marginTop:8,background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:10}}><option value="preview">Preview</option><option value="live">Live</option></select>
  <label style={{display:'block',marginTop:16}}>Upload image</label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/><div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 180px',gap:16,marginTop:16}}><div><label>Fit</label><select value={fit} onChange={e=>setFit(e.target.value)} style={{width:'100%',padding:10,background:'#0b1220',color:'white',border:'1px solid #3a4861',borderRadius:8}}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option></select><label style={{display:'block',marginTop:14}}>Horizontal position: {x}%</label><input type="range" min="0" max="100" value={x} onChange={e=>setX(+e.target.value)}/><label style={{display:'block',marginTop:10}}>Vertical position: {y}%</label><input type="range" min="0" max="100" value={y} onChange={e=>setY(+e.target.value)}/><label style={{display:'block',marginTop:10}}>Zoom: {zoom}%</label><input type="range" min="50" max="200" value={zoom} onChange={e=>setZoom(+e.target.value)}/></div><div style={{aspectRatio:'4/3',overflow:'hidden',borderRadius:12,background:'#0b1220',border:'1px solid #34415b',display:'grid',placeItems:'center'}}>{(file||imageUrl)?<img src={file?URL.createObjectURL(file):imageUrl} style={{width:'100%',height:'100%',objectFit:fit as 'cover'|'contain'|'fill',objectPosition:`${x}% ${y}%`,transform:`scale(${zoom/100})`}}/>:<ImagePlus color="#718096"/>}</div></div>
  <p className="admin-auth-copy">Position and zoom are saved as configuration values. Preview and Live are separate.</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button onClick={()=>void save(false)} disabled={busy}><Save size={15}/> Save {environment}</button>{environment==='preview'&&<button onClick={()=>void save(true)} disabled={busy}><Send size={15}/> Promote Preview → Live</button>}</div>{message&&<p role="status" className="admin-auth-copy">{message}</p>}</section></div></div>;
}
