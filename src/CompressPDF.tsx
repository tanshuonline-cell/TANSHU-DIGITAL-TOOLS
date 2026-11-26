import React,{useCallback,useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import * as pdfjsLib from 'pdfjs-dist';
import {PDFDocument} from 'pdf-lib';
import {ArrowLeft,Upload,FileText,Download,Minimize2,CheckCircle2,AlertCircle,Loader2,Target,ShieldCheck,FileCheck2,HardDrive,Layers3} from 'lucide-react';
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
 const [dragging,setDragging]=useState(false);
 const inputRef=useRef<HTMLInputElement>(null);
 const docRef=useRef<any>(null);
 const tr=(en:string,hin:string)=>hi?hin:en;
 const targetBytes=Math.max(1,Number(target||0))*(unit==='MB'?1048576:1024);

 useEffect(()=>{
  const old=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=old;try{docRef.current?.destroy()}catch{}};
 },[]);

 const loadFile=useCallback(async(file?:File)=>{
  if(!file)return;
  setError('');setStatus('');setLoaded(null);setResult(null);setResultSize(0);setQualityLabel('');
  try{docRef.current?.destroy()}catch{}docRef.current=null;
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){setError(tr('Please select a PDF file.','कृपया PDF फाइल चुनें।'));return;}
  setBusy(true);
  try{
   const bytes=new Uint8Array(await file.arrayBuffer());
   const doc=await (pdfjsLib as any).getDocument({data:bytes.slice()}).promise;
   docRef.current=doc;setLoaded({file,bytes,doc,pages:doc.numPages});
   setStatus(tr('Your PDF is ready. Choose a target size to begin.','आपकी PDF तैयार है। शुरू करने के लिए टारगेट साइज चुनें।'));
  }catch(e:any){setLoaded(null);setError(e?.message||tr('This PDF could not be opened. It may be damaged or password protected.','यह PDF नहीं खुल सकी। फाइल खराब या पासवर्ड से सुरक्षित हो सकती है।'));}
  finally{setBusy(false);}
 },[hi]);

 const compress=async()=>{
  if(!loaded||busy)return;
  if(!Number.isFinite(targetBytes)||targetBytes<1024){setError(tr('Please enter a target size of at least 1 KB.','कम से कम 1 KB का टारगेट साइज डालें।'));return;}
  setBusy(true);setError('');setProgress(0);setStatus(tr('Preparing compression…','कंप्रेशन तैयार हो रहा है…'));setResult(null);setResultSize(0);setQualityLabel('');
  let source:any=null;
  try{
   source=await (pdfjsLib as any).getDocument({data:loaded.bytes.slice()}).promise;
   let best:Uint8Array|null=loaded.bytes.slice();let bestSize=loaded.bytes.length;let chosen=tr('Original retained (already smallest)','मूल PDF रखी गई (पहले से सबसे छोटी)');
   if(loaded.bytes.length<=targetBytes){
    setResult(best);setResultSize(best.length);setQualityLabel(chosen);setStatus(tr('Your original PDF is already within the selected target size.','आपकी मूल PDF पहले से चुने गए टारगेट साइज में है।'));setProgress(100);return;
   }
   outer:for(let pass=0;pass<profiles.length;pass++){
    const profile=profiles[pass];const out=await PDFDocument.create();
    for(let i=1;i<=source.numPages;i++){
     const srcPage=await source.getPage(i);const natural=srcPage.getViewport({scale:1});
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
     setStatus(tr('Optimizing page ','पेज ऑप्टिमाइज़ हो रहा है ')+i+'/'+loaded.pages+' · '+tr('quality pass ','क्वालिटी चरण ')+(pass+1)+'/'+profiles.length);
    }
    const bytes=await out.save({useObjectStreams:true,addDefaultPage:false});
    if(bytes.length<bestSize){best=bytes;bestSize=bytes.length;chosen=(Math.round(profile.scale*100))+'% · JPEG '+Math.round(profile.quality*100)+'%';}
    if(bytes.length<=targetBytes)break outer;
   }
   if(!best)throw new Error('No compressed PDF could be generated.');
   setResult(best);setResultSize(best.length);setQualityLabel(chosen);
   setStatus(bestSize<=targetBytes?tr('Target size achieved. Your compressed PDF is ready.','टारगेट साइज मिल गया। आपकी कंप्रेस PDF तैयार है।'):tr('The smallest result from the available quality levels is ready. Your target could not be reached for this document.','उपलब्ध क्वालिटी स्तरों में सबसे छोटा रिजल्ट तैयार है। इस डॉक्यूमेंट के लिए टारगेट हासिल नहीं हो सका।'));
  }catch(e:any){setError(e?.message||tr('Compression failed. Please try another PDF.','कंप्रेशन नहीं हो सका। दूसरी PDF से कोशिश करें।'));}
  finally{try{await source?.destroy()}catch{}setBusy(false);setProgress(100);}
 };

 const download=()=>{
  if(!result)return;
  const blob=new Blob([result],{type:'application/pdf'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=(loaded?.file.name.replace(/\.pdf$/i,'')||'document')+'-compressed.pdf';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 };
 const choosePreset=(v:string)=>{setPreset(v);if(v==='custom')return;const n=parseFloat(v);setTarget(String(n));setUnit(v.endsWith('MB')?'MB':'KB');};
 const reduction=loaded&&resultSize?Math.max(0,100-(resultSize/loaded.bytes.length*100)):0;
 const achieved=!!result&&resultSize<=targetBytes;
 return createPortal(<div className="compress-pdf-tool">
  <header className="cpdf-topbar"><button className="cpdf-back" onClick={onBack}><ArrowLeft size={18}/>{tr('Back to tools','टूल्स पर वापस')}</button><div className="cpdf-brand"><span className="cpdf-brand-icon"><Minimize2 size={19}/></span><div><b>COMPRESS PDF</b><small>{tr('A smarter way to make PDFs smaller','PDF का साइज कम करने का स्मार्ट तरीका')}</small></div></div><span className="cpdf-local"><ShieldCheck size={15}/>{tr('Private · Browser-based','प्राइवेट · ब्राउज़र में प्रोसेस')}</span></header>
  <main className="cpdf-main">
   <section className="cpdf-hero"><div className="cpdf-hero-copy"><span className="cpdf-kicker">{tr('PDF SIZE OPTIMIZER','PDF साइज ऑप्टिमाइज़र')}</span><h1>{tr('Make your PDF lighter.','अपनी PDF का साइज घटाएँ।')}</h1><p>{tr('Upload, choose the size you need, compress and download. Simple, quick and right here in your browser.','PDF अपलोड करें, मनचाहा साइज चुनें, कंप्रेस करें और डाउनलोड करें। आसान, तेज़ और सीधे आपके ब्राउज़र में।')}</p></div><div className="cpdf-hero-art"><div className="cpdf-art-sheet"><FileText size={42}/><b>PDF</b><i/></div><div className="cpdf-art-arrow"><Minimize2 size={24}/></div><div className="cpdf-art-sheet small"><FileCheck2 size={31}/><b>PDF</b><i/></div></div></section>
   <section className="cpdf-work-card">
    <div className="cpdf-step-heading"><span>01</span><div><b>{tr('Add your PDF','अपनी PDF जोड़ें')}</b><small>{tr('Select a file from your device','अपने डिवाइस से फाइल चुनें')}</small></div></div>
    <button className={'cpdf-upload '+(loaded?'has-file ':'')+(dragging?'dragging':'')} onClick={()=>inputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);loadFile(e.dataTransfer.files?.[0])}}>
     <span className="cpdf-upload-icon">{loaded?<FileCheck2 size={27}/>:<Upload size={27}/>}</span>
     {loaded?<><b>{loaded.file.name}</b><small>{formatBytes(loaded.bytes.length)} <i>·</i> {loaded.pages} {tr('pages','पेज')}</small><span className="cpdf-change">{tr('Choose another PDF','दूसरी PDF चुनें')}</span></>:<><b>{tr('Drop your PDF here','अपनी PDF यहाँ छोड़ें')}</b><small>{tr('or click to browse files from your device','या डिवाइस से फाइल चुनने के लिए क्लिक करें')}</small><span className="cpdf-filetypes">PDF ONLY · {tr('ONE FILE AT A TIME','एक बार में एक फाइल')}</span></>}
    </button>
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={e=>{loadFile(e.target.files?.[0]);e.currentTarget.value='';}}/>
    <div className="cpdf-step-heading cpdf-target-heading"><span>02</span><div><b>{tr('Choose your target size','अपना टारगेट साइज चुनें')}</b><small>{tr('Select a ready-made size or enter your own','दिया गया साइज चुनें या खुद दर्ज करें')}</small></div></div>
    <div className="cpdf-size-grid">{['10KB','20KB','50KB','100KB','250KB','500KB','1MB','2MB','3MB','5MB'].map(v=><button key={v} className={preset===v?'active':''} onClick={()=>choosePreset(v)}>{v}</button>)}</div>
    <div className="cpdf-custom-row"><label>{tr('Custom size','कस्टम साइज')}</label><div className="cpdf-custom"><input aria-label="Target size" type="number" min="1" step="1" value={target} onChange={e=>{setPreset('custom');setTarget(e.target.value)}}/><select aria-label="Size unit" value={unit} onChange={e=>{setPreset('custom');setUnit(e.target.value as 'KB'|'MB')}}><option value="KB">KB</option><option value="MB">MB</option></select></div></div>
    <div className="cpdf-target-summary"><Target size={16}/><span>{tr('Your target','आपका टारगेट')}: <b>{target||'—'} {unit}</b></span><small>{tr('We will try the available compression levels to get as close as possible.','हम टारगेट के करीब पहुँचने के लिए उपलब्ध कंप्रेशन स्तर आज़माएँगे।')}</small></div>
    <button className="cpdf-compress-btn" disabled={!loaded||busy} onClick={compress}>{busy?<><Loader2 className="spin" size={19}/>{tr('Compressing your PDF…','PDF कंप्रेस हो रही है…')}</>:<><Minimize2 size={19}/>{tr('COMPRESS PDF','PDF कंप्रेस करें')}</>}</button>
    {busy&&<div className="cpdf-progress"><div><span>{status}</span><b>{progress}%</b></div><i><span style={{width:progress+'%'}}/></i></div>}
    {error&&<div className="cpdf-message error"><AlertCircle size={17}/>{error}</div>}
    {status&&!busy&&!error&&<div className="cpdf-message"><CheckCircle2 size={17}/>{status}</div>}
    {result&&<div className="cpdf-result">
      <div className="cpdf-result-top"><div className="cpdf-result-icon"><FileCheck2 size={25}/></div><div><b>{tr('Your compressed PDF is ready','आपकी कंप्रेस PDF तैयार है')}</b><small>{achieved?tr('Target size reached','टारगेट साइज हासिल'):tr('Best available compression result','सबसे बेहतर उपलब्ध कंप्रेशन रिजल्ट')} · {qualityLabel}</small></div><span className={achieved?'cpdf-result-state':'cpdf-result-state warning'}>{achieved?tr('SUCCESS','सफल'):tr('CLOSEST','करीबी')}</span></div>
      <div className="cpdf-result-stats"><div><small>{tr('Original','ओरिजिनल')}</small><b>{formatBytes(loaded!.bytes.length)}</b></div><div><small>{tr('Compressed','कंप्रेस्ड')}</small><b>{formatBytes(resultSize)}</b></div><div><small>{tr('Size reduced','साइज कम हुआ')}</small><b>{reduction.toFixed(1)}%</b></div></div>
      <button className="cpdf-download-btn" onClick={download}><Download size={19}/>{tr('DOWNLOAD COMPRESSED PDF','कंप्रेस PDF डाउनलोड करें')}</button>
    </div>}
   </section>
   <section className="cpdf-benefits"><div><HardDrive size={20}/><b>{tr('Actual file size','वास्तविक फाइल साइज')}</b><span>{tr('See the real output size before downloading.','डाउनलोड से पहले असली आउटपुट साइज देखें।')}</span></div><div><Layers3 size={20}/><b>{tr('Single or multi-page','एक या कई पेज')}</b><span>{tr('Compress PDFs with many pages in one go.','कई पेज वाली PDF भी एक बार में कंप्रेस करें।')}</span></div><div><ShieldCheck size={20}/><b>{tr('Browser-based processing','ब्राउज़र में प्रोसेसिंग')}</b><span>{tr('Your document is processed on your device.','आपका डॉक्यूमेंट आपके डिवाइस पर प्रोसेस होता है।')}</span></div></section>
   <p className="cpdf-quality-note">{tr('Note: Very small target sizes may not be possible for every PDF. Strong compression converts page content into images, so selectable text, links and form fields may not be preserved.','नोट: हर PDF को बहुत छोटे साइज तक लाना संभव नहीं होता। अधिक कंप्रेशन में पेज इमेज में बदलते हैं, इसलिए टेक्स्ट सिलेक्शन, लिंक और फॉर्म फील्ड सुरक्षित नहीं रह सकते।')}</p>
  </main>
 </div>,document.body);
}
