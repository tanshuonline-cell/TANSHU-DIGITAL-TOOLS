import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,Upload,Image as ImageIcon,ZoomIn,ZoomOut,RotateCcw,Download,Printer,CheckCircle2,AlertCircle,Info} from 'lucide-react';
import './PANPhotoSignatureResizer.css';

type Kind='photo'|'signature';
type Profile='protean-dsc'|'protean-ekyc'|'custom';
const profiles={
 'protean-dsc':{label:'Protean · DSC / scanned upload',dpi:200,photo:{w:2.5,h:3.5,kb:20},signature:{w:4.5,h:2,kb:10},note:'Official Protean DSC guidance: JPEG, 200 DPI; photo 3.5 × 2.5 cm up to 20 KB; signature 2 × 4.5 cm up to 10 KB.'},
 'protean-ekyc':{label:'Protean · online e-KYC flow',dpi:200,photo:{w:2.5,h:3.5,kb:50},signature:{w:4.5,h:2,kb:50},note:'Protean online guidance lists JPG, photo 3.5 × 2.5 cm and signature 2 × 4.5 cm, maximum 50 KB each. DPI is not specified on that page; output pixels use 200 DPI as a practical setting.'}
} as const;
type Output={url:string;blob:Blob;width:number;height:number;kb:number;dpi:number};
export default function PANPhotoSignatureResizer({onBack}:{onBack?:()=>void}){
 const [profile,setProfile]=useState<Profile>('protean-dsc');
 const [kind,setKind]=useState<Kind>('photo');
 const [files,setFiles]=useState<Record<Kind,File|null>>({photo:null,signature:null});
 const [urls,setUrls]=useState<Record<Kind,string|null>>({photo:null,signature:null});
 const [outputs,setOutputs]=useState<Record<Kind,Output|null>>({photo:null,signature:null});
 const [zoom,setZoom]=useState(100);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [custom,setCustom]=useState({photoW:2.5,photoH:3.5,photoKB:20,sigW:4.5,sigH:2,sigKB:10,dpi:200});
 const fileRef=useRef<HTMLInputElement>(null);
 const spec=profile==='custom'?null:profiles[profile];
 const current=spec?spec[kind]:kind==='photo'?{w:custom.photoW,h:custom.photoH,kb:custom.photoKB}:{w:custom.sigW,h:custom.sigH,kb:custom.sigKB};
 const dpi=spec?.dpi??custom.dpi;
 useEffect(()=>()=>{Object.values(urls).forEach(u=>u&&URL.revokeObjectURL(u));Object.values(outputs).forEach(o=>o&&URL.revokeObjectURL(o.url));},[]);
 const setFile=(f:File|null)=>{setError('');setFiles(v=>({...v,[kind]:f}));setOutputs(v=>({...v,[kind]:null}));setUrls(v=>({...v,[kind]:f?URL.createObjectURL(f):null}));};
 const px=useMemo(()=>({w:Math.round(current.w/2.54*dpi),h:Math.round(current.h/2.54*dpi)}),[current.w,current.h,dpi]);
 const process=async()=>{
  const file=files[kind];if(!file){setError('पहले फोटो या सिग्नेचर अपलोड करें।');return;}
  if(!/^image\\/(jpeg|png|webp)$/i.test(file.type)){setError('कृपया JPG, PNG या WebP इमेज चुनें।');return;}
  setBusy(true);setError('');
  try{
   const img=new Image();img.src=URL.createObjectURL(file);await new Promise<void>((res,rej)=>{img.onload=()=>res();img.onerror=()=>rej(new Error('Image could not be opened'));});
   const canvas=document.createElement('canvas');canvas.width=px.w;canvas.height=px.h;
   const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
   ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
   const scale=Math.max(canvas.width/img.width,canvas.height/img.height)*(zoom/100);
   const dw=img.width*scale,dh=img.height*scale;
   ctx.drawImage(img,(canvas.width-dw)/2,(canvas.height-dh)/2,dw,dh);
   URL.revokeObjectURL(img.src);
   const maxBytes=current.kb*1024;let lo=.35,hi=.96,best:Blob|null=null;
   for(let i=0;i<14;i++){const q=(lo+hi)/2;const b=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',q));if(!b)throw new Error('JPEG export failed');if(b.size<=maxBytes){best=b;lo=q;}else hi=q;}
   if(!best){const b=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',.25));if(!b||b.size>maxBytes)throw new Error('इस फोटो को चुनी गई KB सीमा में साफ गुणवत्ता के साथ फिट नहीं किया जा सका। कम आकार की मूल फोटो चुनें या Custom में KB सीमा बढ़ाएँ।');best=b;}
   const outUrl=URL.createObjectURL(best);setOutputs(v=>({...v,[kind]:{url:outUrl,blob:best!,width:px.w,height:px.h,kb:best!.size/1024,dpi}}));
  }catch(e){setError(e instanceof Error?e.message:'Processing failed');}finally{setBusy(false);}
 };
 const download=()=>{const o=outputs[kind];if(!o)return;const a=document.createElement('a');a.href=o.url;a.download='PAN-'+kind.toUpperCase()+'-RESIZED.jpg';a.click();};
 const print=()=>{const o=outputs[kind];if(!o)return;const w=kind==='photo'?2.5:4.5,h=kind==='photo'?3.5:2;const win=window.open('','_blank');if(!win)return;win.document.write('<html><head><title>PAN '+kind+' print</title><style>@page{size:A4;margin:15mm}body{margin:0;display:flex;align-items:flex-start}img{width:'+w+'cm;height:'+h+'cm;object-fit:fill}</style></head><body><img src="'+o.url+'"></body></html>');win.document.close();win.onload=()=>{win.focus();win.print();};};
 const title=kind==='photo'?'Applicant Photo':'Applicant Signature';
 return <div className="panrs-page">
  <header className="panrs-head"><button onClick={onBack} className="panrs-back"><ArrowLeft size={17}/> Back</button><div><b>PAN PHOTO & SIGNATURE RESIZER</b><small>ACTUAL SIZE · Portal-ready image preparation</small></div><span className="panrs-tag">LOCAL PROCESSING</span></header>
  <div className="panrs-layout">
   <aside className="panrs-settings">
    <section className="panrs-card"><h3>1. Select PAN application profile</h3><select value={profile} onChange={e=>{setProfile(e.target.value as Profile);setOutputs({photo:null,signature:null});}}><option value="protean-dsc">Protean · DSC / scanned upload</option><option value="protean-ekyc">Protean · online e-KYC flow</option><option value="custom">Custom dimensions & KB</option></select><p className="panrs-note"><Info size={14}/>{spec?.note??'Enter the exact requirements displayed on the application portal. UTIITSL requirements can vary by workflow; do not assume a universal preset.'}</p></section>
    {profile==='custom'&&<section className="panrs-card"><h3>Custom requirements</h3><div className="panrs-fields">{[['Photo width (cm)','photoW'],['Photo height (cm)','photoH'],['Photo max KB','photoKB'],['Signature width (cm)','sigW'],['Signature height (cm)','sigH'],['Signature max KB','sigKB'],['Resolution (DPI)','dpi']].map(([label,key])=><label key={key}>{label}<input type="number" min="1" step="any" value={(custom as any)[key]} onChange={e=>setCustom(v=>({...v,[key]:Number(e.target.value)}))}/></label>)}</div></section>}
    <section className="panrs-card"><h3>2. Choose what to prepare</h3><div className="panrs-tabs"><button className={kind==='photo'?'active':''} onClick={()=>{setKind('photo');setError('');}}> <ImageIcon size={15}/> Photo</button><button className={kind==='signature'?'active':''} onClick={()=>{setKind('signature');setError('');}}>Signature</button></div><div className="panrs-spec"><b>{title}</b><span>{current.w} × {current.h} cm</span><span>{px.w} × {px.h} px · {dpi} DPI target</span><span>Maximum {current.kb} KB · JPG</span></div>
     <button className="panrs-upload" onClick={()=>fileRef.current?.click()}><Upload size={17}/> {files[kind]?'Change image':'Upload '+(kind==='photo'?'Photo':'Signature')}</button><input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>{files[kind]&&<small className="panrs-file">{files[kind]?.name}</small>}
     <label className="panrs-zoom-label">Crop zoom <b>{zoom}%</b></label><input className="panrs-range" type="range" min="60" max="180" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><div className="panrs-zoom-btns"><button onClick={()=>setZoom(v=>Math.max(60,v-10))}><ZoomOut size={15}/> Zoom out</button><button onClick={()=>setZoom(v=>Math.min(180,v+10))}><ZoomIn size={15}/> Zoom in</button><button onClick={()=>setZoom(100)}><RotateCcw size={14}/> Reset</button></div>
     <button className="panrs-primary" disabled={busy||!files[kind]} onClick={process}>{busy?'Preparing…':'Resize & Compress'}</button>{error&&<p className="panrs-error"><AlertCircle size={15}/>{error}</p>}
    </section>
    <section className="panrs-card"><h3>3. Download / Print</h3>{outputs[kind]?<><p className="panrs-success"><CheckCircle2 size={15}/> Ready · {outputs[kind]!.kb.toFixed(1)} KB</p><button className="panrs-primary" onClick={download}><Download size={16}/> Download JPG</button><button className="panrs-secondary" onClick={print}><Printer size={16}/> Print at actual size</button></>:<p className="panrs-muted">Resize the image to enable download and print.</p>}</section>
   </aside>
   <main className="panrs-preview"><div className="panrs-preview-top"><div><b>LIVE PREVIEW</b><small>{kind==='photo'?'Photo output':'Signature output'} · Full image visible</small></div><div className="panrs-zoom-btns"><button onClick={()=>setZoom(v=>Math.max(60,v-10))}><ZoomOut size={15}/></button><button onClick={()=>setZoom(v=>Math.min(180,v+10))}><ZoomIn size={15}/></button><button onClick={()=>setZoom(100)}><RotateCcw size={14}/></button></div></div>
    <div className="panrs-stage"><div className="panrs-paper" style={{width:kind==='photo'?Math.min(260,px.w):Math.min(340,px.w),aspectRatio:kind==='photo'?'5 / 7':'9 / 4',transform:'scale('+Math.min(1.8,zoom/100)+')'}}>{outputs[kind]?<img src={outputs[kind]!.url} alt="Processed preview"/>:urls[kind]?<img src={urls[kind]!} alt="Original preview"/>:<div className="panrs-empty"><ImageIcon size={40}/><b>Preview will appear here</b><span>Upload a {kind} to get started</span></div>}</div></div>
    <div className="panrs-metrics"><div><small>Output dimensions</small><b>{px.w} × {px.h} px</b></div><div><small>Target file size</small><b>≤ {current.kb} KB</b></div><div><small>Resolution target</small><b>{dpi} DPI</b></div><div><small>Output format</small><b>JPEG</b></div></div>
    <p className="panrs-disclaimer">Always confirm the latest dimensions and file-size limits on the exact PAN application screen before uploading. This tool prepares images; it does not submit a PAN application.</p>
   </main>
  </div>
 </div>;
}
