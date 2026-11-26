import React,{useCallback,useEffect,useRef,useState} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {PDFDocument} from 'pdf-lib';
import {ArrowLeft,Upload,FileText,Download,Minimize2,CheckCircle2,AlertCircle,Loader2,ChevronLeft,ChevronRight,Target,ShieldCheck} from 'lucide-react';
import './CompressPDF.css';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString();

type LoadedPdf={file:File;bytes:Uint8Array;doc:any;pages:number};
const formatBytes=(n:number)=>n<1024?(n+' B'):n<1024*1024?(n/1024).toFixed(n<10240?1:0)+' KB':(n/1048576).toFixed(2)+' MB';
const blobFromCanvas=(canvas:HTMLCanvasElement,quality:number)=>new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not encode a PDF page.')),'image/jpeg',quality));
const profiles=[{scale:1.25,quality:.82},{scale:1.05,quality:.72},{scale:.88,quality:.62},{scale:.72,quality:.52},{scale:.58,quality:.44},{scale:.46,quality:.36},{scale:.36,quality:.29},{scale:.28,quality:.23}];

export default function CompressPDF({hi=false,onBack=()=>{}}:{hi?:boolean;onBack?:()=>void}){
 const [loaded,setLoaded]=useState<LoadedPdf|null>(null);
 const [target,setTarget]=useState('2');
 const [unit,setUnit]=useState<'KB'|'MB'>('MB');
 const [preset,setPreset]=useState('2MB');
 const [busy,setBusy]=useState(false);
 const [progress,setProgress]=useState(0);
 const [status,setStatus]=useState('');
 const [error,setError]=useState('');
 const [result,setResult]=useState<Uint8Array|null>(null);
 const [resultSize,setResultSize]=useState(0);
 const [qualityLabel,setQualityLabel]=useState('');
 const [page,setPage]=useState(1);
 const [previewMode,setPreviewMode]=useState<'result'|'original'>('original');
 const [dragging,setDragging]=useState(false);
 const inputRef=useRef<HTMLInputElement>(null);
 const originalCanvas=useRef<HTMLCanvasElement>(null);
 const resultCanvas=useRef<HTMLCanvasElement>(null);
 const previewDoc=useRef<any>(null);
 const resultDoc=useRef<any>(null);
 const tr=(en:string,hin:string)=>hi?hin:en;
 const targetBytes=Math.max(1,Number(target||0))*(unit==='MB'?1048576:1024);
 const releaseDocs=()=>{try{previewDoc.current?.destroy()}catch{}try{resultDoc.current?.destroy()}catch{}previewDoc.current=null;resultDoc.current=null;};
 const loadFile=useCallback(async(file?:File)=>{
  if(!file)return;
  setError('');setStatus('');setLoaded(null);setResult(null);setResultSize(0);setPage(1);releaseDocs();
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){setError(tr('Please select a PDF file.','कृपया PDF फाइल चुनें।'));return;}
  setBusy(true);
  try{
   const bytes=new Uint8Array(await file.arrayBuffer());
   const doc=await (pdfjsLib as any).getDocument({data:bytes.slice()}).promise;
   setLoaded({file,bytes,doc,pages:doc.numPages});
   previewDoc.current=doc;setPreviewMode('original');
   setStatus(tr('PDF ready. Choose your target size and compress.','PDF तैयार है। टारगेट साइज चुनें और कंप्रेस करें।'));
  }catch(e:any){setLoaded(null);setError(e?.message||tr('This PDF could not be opened. It may be damaged or password protected.','यह PDF नहीं खुल सकी। फाइल खराब या पासवर्ड से सुरक्षित हो सकती है।'));}
  finally{setBusy(false);}
 },[hi]);
 useEffect(()=>()=>releaseDocs(),[]);
 useEffect(()=>{
  let cancelled=false;
  const draw=async()=>{
   const doc=previewMode==='original'?previewDoc.current:resultDoc.current;
   const canvas=previewMode==='original'?originalCanvas.current:resultCanvas.current;
   if(!doc||!canvas)return;
   try{
    const pg=await doc.getPage(page);if(cancelled)return;
    const base=pg.getViewport({scale:1});const scale=Math.max(.08,Math.min(1.5,760/base.width,900/base.height));
    const viewport=pg.getViewport({scale:Math.max(.35,scale)});
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    const ctx=canvas.getContext('2d');if(!ctx)return;
    await pg.render({canvasContext:ctx,viewport}).promise;
   }catch(e){if(!cancelled)setError(tr('Preview could not be rendered for this page.','इस पेज का प्रीव्यू नहीं बन सका।'));}
  };
  draw();return()=>{cancelled=true};
 },[loaded,result,previewMode,page,hi]);
 const compress=async()=>{
  if(!loaded||busy)return;
  if(!Number.isFinite(targetBytes)||targetBytes<1024){setError(tr('Please enter a target size of at least 1 KB.','कम से कम 1 KB का टारगेट साइज डालें।'));return;}
  setBusy(true);setError('');setProgress(0);setStatus(tr('Preparing compression…','कंप्रेशन तैयार हो रहा है…'));setResult(null);setResultSize(0);setQualityLabel('');
  try{
   const source=await (pdfjsLib as any).getDocument({data:loaded.bytes.slice()}).promise;
   let best:Uint8Array|null=loaded.bytes.slice();let bestSize=loaded.bytes.length;let chosen=tr('Original retained (already smallest)','मूल PDF रखी गई (पहले से सबसे छोटी)');
   if(loaded.bytes.length<=targetBytes){const newDoc=await (pdfjsLib as any).getDocument({data:best.slice()}).promise;resultDoc.current=newDoc;setResult(best);setResultSize(best.length);setQualityLabel(chosen);setPreviewMode('result');setStatus(tr('Original PDF is already within your target size. No extra compression was needed.','मूल PDF पहले से आपके टारगेट साइज के अंदर है। अतिरिक्त कंप्रेशन की जरूरत नहीं पड़ी।'));setProgress(100);await source.destroy();return;}
   for(let pass=0;pass<profiles.length;pass++){
    const profile=profiles[pass];const out=await PDFDocument.create();
    for(let i=1;i<=source.numPages;i++){
     const srcPage=await source.getPage(i);
     const natural=srcPage.getViewport({scale:1});
     const renderScale=Math.min(profile.scale,2200/Math.max(natural.width,natural.height));
     const viewport=srcPage.getViewport({scale:Math.max(.18,renderScale)});
     const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(viewport.width));canvas.height=Math.max(1,Math.ceil(viewport.height));
     const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas is unavailable in this browser.');
     ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
     await srcPage.render({canvasContext:ctx,viewport,background:'#ffffff'}).promise;
     const blob=await blobFromCanvas(canvas,profile.quality);const jpg=new Uint8Array(await blob.arrayBuffer());
     const embedded=await out.embedJpg(jpg);const pageOut=out.addPage([natural.width,natural.height]);
     pageOut.drawImage(embedded,{x:0,y:0,width:natural.width,height:natural.height});
     canvas.width=1;canvas.height=1;try{srcPage.cleanup()}catch{}
     setProgress(Math.round(((pass*loaded.pages+i)/(profiles.length*loaded.pages))*100));
     setStatus(tr('Optimizing page ','पेज ऑप्टिमाइज़ हो रहा है ')+i+'/'+loaded.pages+' · '+tr('pass ','चरण ')+(pass+1)+'/'+profiles.length);
    }
    const bytes=await out.save({useObjectStreams:true,addDefaultPage:false});
    if(bytes.length<bestSize){best=bytes;bestSize=bytes.length;chosen=(Math.round(profile.scale*100))+'% · JPEG '+Math.round(profile.quality*100)+'%';}
    if(bytes.length<=targetBytes){best=bytes;bestSize=bytes.length;break;}
   }
   await source.destroy();
   if(!best)throw new Error('No compressed PDF could be generated.');
   setResult(best);setResultSize(best.length);setQualityLabel(chosen);
   const newDoc=await (pdfjsLib as any).getDocument({data:best.slice()}).promise;resultDoc.current=newDoc;setPage(1);setPreviewMode('result');
   setStatus(bestSize<=targetBytes?tr('Target size achieved. Your compressed PDF is ready.','टारगेट साइज मिल गया। आपकी कंप्रेस PDF तैयार है।'):tr('Best possible result from these settings is ready. The target could not be reached without more quality loss.','इन सेटिंग्स में सबसे छोटा संभव रिजल्ट तैयार है। क्वालिटी और घटाए बिना टारगेट हासिल नहीं हुआ।'));
  }catch(e:any){setError(e?.message||tr('Compression failed. Please try another PDF.','कंप्रेशन नहीं हो सका। दूसरी PDF से कोशिश करें।'));}
  finally{setBusy(false);setProgress(100);}
 };
 const download=()=>{
  if(!result)return;const blob=new Blob([result],{type:'application/pdf'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=(loaded?.file.name.replace(/\.pdf$/i,'')||'document')+'-compressed.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 };
 const choosePreset=(v:string)=>{
  setPreset(v);
  if(v==='custom')return;
  const n=parseFloat(v);const u=v.endsWith('MB')?'MB':'KB';setTarget(String(n));setUnit(u);
 };
 const reduction=loaded&&resultSize?Math.max(0,100-(resultSize/loaded.bytes.length*100)):0;
 const displayedSize=previewMode==='original'?loaded?.bytes.length:resultSize;
 return <div className="compress-pdf-tool">
  <header className="cpdf-topbar"><button className="cpdf-back" onClick={onBack}><ArrowLeft size={18}/>{tr('Back to tools','टूल्स पर वापस')}</button><div className="cpdf-brand"><span className="cpdf-brand-icon"><Minimize2 size={19}/></span><div><b>COMPRESS PDF</b><small>{tr('Smart PDF size optimizer','स्मार्ट PDF साइज ऑप्टिमाइज़र')}</small></div></div><span className="cpdf-local"><ShieldCheck size={15}/>{tr('Processed in your browser','आपके ब्राउज़र में प्रोसेस')}</span></header>
  <div className="cpdf-workspace">
   <aside className="cpdf-settings">
    <div className="cpdf-kicker">{tr('QUICK WORKFLOW','आसान वर्कफ़्लो')}</div><h1>{tr('Compress PDF','PDF कंप्रेस करें')}</h1><p className="cpdf-intro">{tr('Reduce large PDFs to a smaller file size while keeping pages readable.','बड़े PDF का साइज कम करें और पेज को पढ़ने लायक रखें।')}</p>
    <button className={'cpdf-upload '+(loaded?'has-file ':'')+(dragging?'dragging':'')} onClick={()=>inputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);loadFile(e.dataTransfer.files?.[0])}}>
     {loaded?<><span className="cpdf-upload-icon"><FileText size={25}/></span><b>{loaded.file.name}</b><small>{loaded.pages} {tr('pages','पेज')} · {formatBytes(loaded.bytes.length)}</small><span className="cpdf-change">{tr('Change PDF','PDF बदलें')}</span></>:<><span className="cpdf-upload-icon"><Upload size={25}/></span><b>{tr('Upload your PDF','अपनी PDF अपलोड करें')}</b><small>{tr('Click to browse or drag & drop here','फाइल चुनें या यहाँ ड्रैग-ड्रॉप करें')}</small><span className="cpdf-filetypes">PDF FILES ONLY</span></>}
    </button>
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={e=>{loadFile(e.target.files?.[0]);e.currentTarget.value='';}}/>
    <section className="cpdf-target">
     <div className="cpdf-section-title"><Target size={17}/><b>{tr('Target file size','टारगेट फाइल साइज')}</b></div>
     <div className="cpdf-presets">{['10KB','20KB','50KB','100KB','250KB','500KB','1MB','2MB','3MB','5MB'].map(v=><button key={v} className={preset===v?'active':''} onClick={()=>choosePreset(v)}>{v}</button>)}</div>
     <label className="cpdf-label">{tr('Custom target size','कस्टम टारगेट साइज')}</label>
     <div className="cpdf-custom"><input type="number" min="1" step="1" value={target} onChange={e=>{setPreset('custom');setTarget(e.target.value)}}/><select value={unit} onChange={e=>{setPreset('custom');setUnit(e.target.value as 'KB'|'MB')}}><option value="KB">KB</option><option value="MB">MB</option></select></div>
     <p className="cpdf-hint">{tr('The tool will try multiple quality and resolution levels to get as close as possible to your target.','टूल अलग-अलग क्वालिटी और रिज़ॉल्यूशन आज़माकर टारगेट के जितना करीब हो सकेगा पहुँचेगा।')}</p>
    </section>
    <div className="cpdf-compress-actions"><button className="cpdf-compress-btn" disabled={!loaded||busy} onClick={compress}>{busy?<><Loader2 className="spin" size={18}/>{tr('Compressing…','कंप्रेस हो रहा है…')}</>:<><Minimize2 size={18}/>{tr('COMPRESS PDF NOW','अभी PDF कंप्रेस करें')}</>}</button>{result&&<button className="cpdf-download-btn" onClick={download}><Download size={18}/>{tr('Download compressed PDF','कंप्रेस PDF डाउनलोड करें')}</button>}</div>
    {busy&&<div className="cpdf-progress"><div><span>{status}</span><b>{progress}%</b></div><i><span style={{width:progress+'%'}}/></i></div>}
    {error&&<div className="cpdf-message error"><AlertCircle size={17}/>{error}</div>}
    {status&&!busy&&!error&&<div className="cpdf-message"><CheckCircle2 size={17}/>{status}</div>}
    <div className="cpdf-note"><b>{tr('Important quality note','क्वालिटी संबंधी जरूरी जानकारी')}</b><p>{tr('To reach very small sizes, pages are converted to compressed images inside the PDF. Text selection, search and links may not be retained. Very low targets can reduce readability, especially on long or scanned PDFs.','बहुत छोटा साइज पाने के लिए PDF के पेज कंप्रेस्ड इमेज में बदले जाते हैं। टेक्स्ट सिलेक्शन, सर्च और लिंक सुरक्षित नहीं रह सकते। बहुत कम टारगेट पर खासकर लंबे या स्कैन PDF की पढ़ने की क्वालिटी घट सकती है।')}</p></div>
   </aside>
   <main className="cpdf-preview">
    <div className="cpdf-preview-head"><div><div className="cpdf-kicker">{tr('LIVE DOCUMENT PREVIEW','लाइव डॉक्यूमेंट प्रीव्यू')}</div><h2>{tr('Preview & download','प्रीव्यू और डाउनलोड')}</h2></div>{loaded&&<div className="cpdf-preview-switch"><button className={previewMode==='original'?'active':''} onClick={()=>setPreviewMode('original')}>{tr('Original','ओरिजिनल')}</button><button className={previewMode==='result'?'active':''} disabled={!result} onClick={()=>setPreviewMode('result')}>{tr('Compressed','कंप्रेस्ड')}</button></div>}</div>
    {!loaded?<div className="cpdf-empty"><div><FileText size={48}/><b>{tr('Your PDF preview will appear here','आपकी PDF का प्रीव्यू यहाँ दिखेगा')}</b><span>{tr('Upload a PDF to get started','शुरू करने के लिए PDF अपलोड करें')}</span></div></div>:<>
     <div className="cpdf-stats">
      <div><small>{tr('Original size','ओरिजिनल साइज')}</small><b>{formatBytes(loaded.bytes.length)}</b></div>
      <div><small>{tr('Compressed size','कंप्रेस्ड साइज')}</small><b>{result?formatBytes(resultSize):'—'}</b></div>
      <div><small>{tr('Saved','बचत')}</small><b className="cpdf-saved">{result?reduction.toFixed(1)+'%':'—'}</b></div>
      <div><small>{tr('Pages','पेज')}</small><b>{loaded.pages}</b></div>
     </div>
     <div className="cpdf-pagebar"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft size={17}/></button><span>{tr('Page','पेज')} {page} / {loaded.pages}</span><button disabled={page>=loaded.pages} onClick={()=>setPage(p=>Math.min(loaded.pages,p+1))}><ChevronRight size={17}/></button><span className="cpdf-preview-size">{displayedSize?formatBytes(displayedSize):''}</span></div>
     <div className="cpdf-canvas-scroll"><div className="cpdf-paper"><canvas ref={previewMode==='original'?originalCanvas:resultCanvas}/>{previewMode==='result'&&!result&&<div className="cpdf-paper-placeholder">{tr('Compress the PDF to preview the result','रिजल्ट देखने के लिए PDF कंप्रेस करें')}</div>}</div></div>
     {result&&<div className="cpdf-result-footer"><span><CheckCircle2 size={16}/>{tr('Compressed PDF ready','कंप्रेस PDF तैयार')}{qualityLabel?' · '+qualityLabel:''}</span><button onClick={download}><Download size={16}/>{tr('Download PDF','PDF डाउनलोड करें')}</button></div>}
    </>}
   </main>
  </div>
 </div>;
}
