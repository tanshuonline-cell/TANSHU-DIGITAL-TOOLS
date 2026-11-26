import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft,Upload,Image as ImageIcon,Download,Minimize2,CheckCircle2,AlertCircle,Loader2,Target,ShieldCheck,FileCheck2,HardDrive,Layers3,RefreshCw} from 'lucide-react';
import './PhotoCompressor.css';
type ImgFile={file:File;url:string;width:number;height:number;bytes:ArrayBuffer};
const fmt=(n:number)=>n<1024?n+' B':n<1048576?(n/1024).toFixed(n<10240?1:0)+' KB':(n/1048576).toFixed(2)+' MB';
const scales=[1,.9,.8,.7,.6,.5,.42,.34,.27,.21,.16];
const qualities=[.92,.86,.8,.74,.68,.62,.56,.5,.44,.38,.32,.26,.2];
const makeBlob=(canvas:HTMLCanvasElement,mime:string,q:number)=>new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not create the compressed image.')),mime,q));
export default function PhotoCompressor({hi=false,onBack=()=>{}}:{hi?:boolean;onBack?:()=>void}){
 const [loaded,setLoaded]=useState<ImgFile|null>(null),[target,setTarget]=useState('50'),[unit,setUnit]=useState<'KB'|'MB'>('KB'),[preset,setPreset]=useState('50KB');
 const [busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[status,setStatus]=useState(''),[error,setError]=useState('');
 const [result,setResult]=useState<Blob|null>(null),[resultUrl,setResultUrl]=useState(''),[resultSize,setResultSize]=useState(0),[resultType,setResultType]=useState('');
 const inputRef=useRef<HTMLInputElement>(null);const [dragging,setDragging]=useState(false);
 const tr=(en:string,h:string)=>hi?h:en;const targetBytes=Math.max(1,Number(target||0))*(unit==='MB'?1048576:1024);
 useEffect(()=>{const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;if(loaded?.url)URL.revokeObjectURL(loaded.url);if(resultUrl)URL.revokeObjectURL(resultUrl)};},[]);
 const clearResult=()=>{if(resultUrl)URL.revokeObjectURL(resultUrl);setResult(null);setResultUrl('');setResultSize(0);setResultType('');};
 const load=async(file?:File)=>{
  if(!file)return;setError('');setStatus('');clearResult();
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError(tr('Please choose a JPG, PNG or WebP image.','कृपया JPG, PNG या WebP फोटो चुनें।'));return;}
  if(loaded?.url)URL.revokeObjectURL(loaded.url);
  const url=URL.createObjectURL(file);setBusy(true);
  try{const img=new Image();img.src=url;await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Image could not be opened.'));});const bytes=await file.arrayBuffer();setLoaded({file,url,width:img.naturalWidth,height:img.naturalHeight,bytes});setStatus(tr('Image ready. Choose your target size.','फोटो तैयार है। अपना टारगेट साइज चुनें।'));}
  catch(e:any){URL.revokeObjectURL(url);setLoaded(null);setError(e?.message||tr('This image could not be opened.','यह फोटो नहीं खुल सकी।'));}
  finally{setBusy(false);}
 };
 const compress=async()=>{
  if(!loaded||busy)return;
  if(!Number.isFinite(targetBytes)||targetBytes<1024){setError(tr('Please enter a target size of at least 1 KB.','कम से कम 1 KB का टारगेट साइज डालें।'));return;}
  setBusy(true);setError('');setStatus(tr('Optimizing your image…','फोटो ऑप्टिमाइज़ हो रही है…'));setProgress(0);clearResult();
  try{
   if(loaded.bytes.byteLength<=targetBytes){const blob=new Blob([loaded.bytes],{type:loaded.file.type});const url=URL.createObjectURL(blob);setResult(blob);setResultUrl(url);setResultSize(blob.size);setResultType(loaded.file.type);setProgress(100);setStatus(tr('Your original image is already within the selected target size.','आपकी मूल फोटो पहले से चुने गए टारगेट साइज में है।'));return;}
   const img=new Image();img.src=loaded.url;await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Image could not be decoded.'));});
   const mime=loaded.file.type;let best:Blob|null=null;let bestSize=loaded.bytes.byteLength;let chosen='';
   const total=scales.length*(mime==='image/png'?1:qualities.length);let step=0;
   for(const scale of scales){
    const w=Math.max(1,Math.round(loaded.width*scale)),h=Math.max(1,Math.round(loaded.height*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:mime==='image/png'});if(!ctx)throw new Error('Canvas is not available in this browser.');
    if(mime!=='image/png'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);}
    ctx.drawImage(img,0,0,w,h);
    const qs=mime==='image/png'?[1]:qualities;
    for(const q of qs){
     const blob=await makeBlob(canvas,mime,q);step++;setProgress(Math.round(step/total*100));
     if(blob.type!==mime)throw new Error('This browser cannot export the selected image format. Please try another browser.');
     if(blob.size<bestSize){best=blob;bestSize=blob.size;chosen=w+' × '+h+(mime==='image/png'?' · PNG':' · '+Math.round(q*100)+'% quality');}
     if(blob.size<=targetBytes)break;
    }
    canvas.width=1;canvas.height=1;
    if(best&&best.size<=targetBytes)break;
   }
   if(!best)throw new Error(tr('The image could not be reduced further.','फोटो का साइज और कम नहीं हो सका।'));
   const url=URL.createObjectURL(best);setResult(best);setResultUrl(url);setResultSize(best.size);setResultType(mime);
   setStatus(best.size<=targetBytes?tr('Target size achieved. Your compressed image is ready.','टारगेट साइज हासिल। आपकी कंप्रेस फोटो तैयार है।'):tr('The smallest available result is ready, but this image could not reach your exact target.','सबसे छोटा उपलब्ध रिजल्ट तैयार है, लेकिन फोटो आपका exact टारगेट हासिल नहीं कर सकी।')+' · '+chosen);
  }catch(e:any){setError(e?.message||tr('Compression failed. Please try another image.','कंप्रेशन नहीं हो सका। दूसरी फोटो से कोशिश करें।'));}
  finally{setBusy(false);setProgress(100);}
 };
 const choose=(v:string)=>{setPreset(v);if(v==='custom')return;setTarget(String(parseFloat(v)));setUnit(v.endsWith('MB')?'MB':'KB');};
 const download=()=>{if(!result)return;const ext=resultType==='image/png'?'png':resultType==='image/webp'?'webp':'jpg';const a=document.createElement('a');a.href=resultUrl;a.download=(loaded?.file.name.replace(/\.[^.]+$/,'')||'photo')+'-compressed.'+ext;document.body.appendChild(a);a.click();a.remove();};
 const achieved=!!result&&resultSize<=targetBytes;const reduction=loaded&&resultSize?Math.max(0,100-resultSize/loaded.bytes.byteLength*100):0;
 return createPortal(<div className="photo-compressor-tool">
  <header className="pc-topbar"><button className="pc-back" onClick={onBack}><ArrowLeft size={18}/>{tr('Back to tools','टूल्स पर वापस')}</button><div className="pc-brand"><span className="pc-brand-icon"><Minimize2 size={19}/></span><div><b>PHOTO COMPRESSOR</b><small>Exact KB Photo Compressor</small></div></div><span className="pc-local"><ShieldCheck size={15}/>{tr('Private · Browser-based','प्राइवेट · ब्राउज़र में प्रोसेस')}</span></header>
  <main className="pc-main">
   <section className="pc-hero"><div><span className="pc-kicker">{tr('SMART IMAGE SIZE OPTIMIZER','स्मार्ट इमेज साइज ऑप्टिमाइज़र')}</span><h1>{tr('Your photo. Your size.','आपकी फोटो। आपका साइज।')}</h1><p>{tr('Compress JPG, PNG and WebP images to the file size you need. Upload, set your KB target and download.','JPG, PNG और WebP फोटो को अपनी जरूरत के साइज में कंप्रेस करें। अपलोड करें, KB टारगेट चुनें और डाउनलोड करें।')}</p></div><div className="pc-art"><div><ImageIcon size={38}/><b>IMAGE</b></div><span><Minimize2 size={21}/></span><div className="pc-art-small"><FileCheck2 size={29}/><b>KB</b></div></div></section>
   <section className="pc-card">
    <div className="pc-step"><span>01</span><div><b>{tr('Upload your photo','अपनी फोटो अपलोड करें')}</b><small>{tr('JPG, PNG or WebP · One image at a time','JPG, PNG या WebP · एक बार में एक फोटो')}</small></div></div>
    <button className={'pc-upload '+(loaded?'has-file ':'')+(dragging?'dragging':'')} onClick={()=>inputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);load(e.dataTransfer.files?.[0])}}>
     {loaded?<><img className="pc-thumb" src={loaded.url} alt="Selected photo"/><b>{loaded.file.name}</b><small>{fmt(loaded.bytes.byteLength)} · {loaded.width} × {loaded.height} px</small><span className="pc-change">{tr('Choose another photo','दूसरी फोटो चुनें')}</span></>:<><span className="pc-upload-icon"><Upload size={27}/></span><b>{tr('Drop your photo here','अपनी फोटो यहाँ छोड़ें')}</b><small>{tr('or click to browse your device','या डिवाइस से फोटो चुनें')}</small><span className="pc-filetypes">JPG · PNG · WEBP</span></>}
    </button><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{load(e.target.files?.[0]);e.currentTarget.value='';}}/>
    <div className="pc-step pc-target-step"><span>02</span><div><b>{tr('Choose exact target size','एक्ज़ैक्ट टारगेट साइज चुनें')}</b><small>{tr('Select a preset or enter a custom KB / MB value','दिया गया साइज चुनें या अपना KB / MB दर्ज करें')}</small></div></div>
    <div className="pc-presets">{['10KB','20KB','30KB','50KB','100KB','150KB','200KB','250KB','500KB','1MB','2MB','5MB'].map(v=><button key={v} className={preset===v?'active':''} onClick={()=>choose(v)}>{v}</button>)}</div>
    <div className="pc-custom-row"><label>{tr('Custom target size','कस्टम टारगेट साइज')}</label><div className="pc-custom"><input aria-label="Target size" type="number" min="1" step="1" value={target} onChange={e=>{setPreset('custom');setTarget(e.target.value)}}/><select aria-label="Size unit" value={unit} onChange={e=>{setPreset('custom');setUnit(e.target.value as 'KB'|'MB')}}><option value="KB">KB</option><option value="MB">MB</option></select></div></div>
    <div className="pc-target-summary"><Target size={16}/><span>{tr('Your target','आपका टारगेट')}: <b>{target||'—'} {unit}</b></span><small>{tr('We test image dimensions and quality to get as close as possible.','टारगेट के करीब पहुँचने के लिए फोटो का साइज और क्वालिटी ऑप्टिमाइज़ होगी।')}</small></div>
    <button className="pc-compress" disabled={!loaded||busy} onClick={compress}>{busy?<><Loader2 className="pc-spin" size={19}/>{tr('Compressing photo…','फोटो कंप्रेस हो रही है…')}</>:<><Minimize2 size={19}/>{tr('COMPRESS PHOTO','फोटो कंप्रेस करें')}</>}</button>
    {busy&&<div className="pc-progress"><div><span>{status}</span><b>{progress}%</b></div><i><span style={{width:progress+'%'}}/></i></div>}
    {error&&<div className="pc-message error"><AlertCircle size={17}/>{error}</div>}
    {status&&!busy&&!error&&<div className="pc-message"><CheckCircle2 size={17}/>{status}</div>}
    {result&&<div className="pc-result"><div className="pc-result-head"><div className="pc-result-icon"><FileCheck2 size={24}/></div><div><b>{tr('Compressed photo is ready','कंप्रेस फोटो तैयार है')}</b><small>{achieved?tr('Target size reached','टारगेट साइज हासिल'):tr('Best available result','सबसे बेहतर उपलब्ध रिजल्ट')}</small></div><span className={achieved?'pc-pill':'pc-pill warning'}>{achieved?'SUCCESS':'CLOSEST'}</span></div>
     <div className="pc-result-body"><img src={resultUrl} alt="Compressed preview"/><div className="pc-stats"><div><small>{tr('Original','ओरिजिनल')}</small><b>{fmt(loaded!.bytes.byteLength)}</b></div><div><small>{tr('Compressed','कंप्रेस्ड')}</small><b>{fmt(resultSize)}</b></div><div><small>{tr('Size reduced','साइज कम हुआ')}</small><b>{reduction.toFixed(1)}%</b></div></div></div>
     <button className="pc-download" onClick={download}><Download size={19}/>{tr('DOWNLOAD COMPRESSED PHOTO','कंप्रेस फोटो डाउनलोड करें')}</button>
    </div>}
   </section>
   <section className="pc-benefits"><div><HardDrive size={20}/><b>{tr('Real output size','वास्तविक आउटपुट साइज')}</b><span>{tr('See the actual file size before download.','डाउनलोड से पहले वास्तविक साइज देखें।')}</span></div><div><Layers3 size={20}/><b>{tr('JPG · PNG · WebP','JPG · PNG · WebP')}</b><span>{tr('Keep the original image format.','मूल इमेज फॉर्मेट बरकरार रखें।')}</span></div><div><ShieldCheck size={20}/><b>{tr('Private processing','प्राइवेट प्रोसेसिंग')}</b><span>{tr('Your photo stays on your device.','आपकी फोटो आपके डिवाइस पर ही रहती है।')}</span></div></section>
   <p className="pc-note">{tr('Note: Exact target sizes cannot be guaranteed for every image. PNG uses lossless encoding and may need significant resizing; JPG and WebP can use lossy quality optimization.','नोट: हर फोटो में exact target size की गारंटी नहीं है। PNG में lossless compression होता है, इसलिए साइज घटाने के लिए रिज़ॉल्यूशन कम करना पड़ सकता है; JPG और WebP में क्वालिटी भी ऑप्टिमाइज़ की जाती है।')}</p>
  </main>
 </div>,document.body);
}
