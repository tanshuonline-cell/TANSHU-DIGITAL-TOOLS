import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {PDFDocument} from 'pdf-lib';
import {ArrowLeft,Upload,FileText,Download,Trash2,ChevronUp,ChevronDown,Loader2,CheckCircle2,AlertCircle,ShieldCheck,Files,Merge,FilePlus2} from 'lucide-react';
import './PdfMerger.css';
type Entry={id:string;file:File;pages:number};
const fmt=(n:number)=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';
export default function PdfMerger({hi=false,onBack=()=>{}}:{hi?:boolean;onBack?:()=>void}){
 const [files,setFiles]=useState<Entry[]>([]),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[pdfUrl,setPdfUrl]=useState(''),[pdfSize,setPdfSize]=useState(0),[pageCount,setPageCount]=useState(0),[error,setError]=useState(''),[status,setStatus]=useState(''),[drag,setDrag]=useState(false);
 const input=useRef<HTMLInputElement>(null),pdfUrlRef=useRef('');
 const tr=(en:string,h:string)=>hi?h:en,totalPages=files.reduce((n,f)=>n+f.pages,0);
 useEffect(()=>{const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;if(pdfUrlRef.current)URL.revokeObjectURL(pdfUrlRef.current)};},[]);
 const clearPdf=()=>{if(pdfUrlRef.current)URL.revokeObjectURL(pdfUrlRef.current);pdfUrlRef.current='';setPdfUrl('');setPdfSize(0);setPageCount(0);};
 const addFiles=async(list:FileList|File[])=>{
  const selected=Array.from(list);if(!selected.length)return;setError('');setStatus('');clearPdf();
  const valid=selected.filter(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));
  if(valid.length!==selected.length)setError(tr('Only PDF files are accepted.','यहाँ केवल PDF फाइलें स्वीकार हैं।'));
  const added:Entry[]=[];
  for(const file of valid){try{const source=await PDFDocument.load(await file.arrayBuffer(),{updateMetadata:false});added.push({id:crypto.randomUUID(),file,pages:source.getPageCount()});}catch(e:any){setError(tr(file.name+' could not be read. It may be damaged or password-protected.','फाइल '+file.name+' नहीं खुल सकी। यह खराब या पासवर्ड से सुरक्षित हो सकती है।'));}}
  if(added.length)setFiles(v=>[...v,...added]);
 };
 const remove=(id:string)=>{setFiles(v=>v.filter(x=>x.id!==id));clearPdf();setStatus('');};
 const move=(index:number,delta:number)=>{const next=index+delta;if(next<0||next>=files.length)return;setFiles(v=>{const a=[...v];[a[index],a[next]]=[a[next],a[index]];return a;});clearPdf();setStatus('');};
 const merge=async()=>{
  if(files.length<2||busy)return;setBusy(true);setProgress(0);setError('');setStatus(tr('Combining your PDF files…','आपकी PDF फाइलें जोड़ी जा रही हैं…'));clearPdf();
  try{const output=await PDFDocument.create();output.setTitle('Merged PDF');output.setCreator('TANSHU DIGITAL TOOLS');output.setProducer('TANSHU DIGITAL TOOLS');
   let done=0;for(const entry of files){const source=await PDFDocument.load(await entry.file.arrayBuffer(),{updateMetadata:false});const pages=await output.copyPages(source,source.getPageIndices());pages.forEach(page=>output.addPage(page));done++;setProgress(Math.round(done/files.length*85));}
   const bytes=await output.save({useObjectStreams:true}),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob);pdfUrlRef.current=url;setPdfUrl(url);setPdfSize(blob.size);setPageCount(output.getPageCount());setProgress(100);setStatus(tr('PDF files merged successfully. Preview below and download your combined PDF.','PDF फाइलें सफलतापूर्वक मर्ज हो गईं। नीचे प्रीव्यू देखें और संयुक्त PDF डाउनलोड करें।'));
  }catch(e:any){setError(e?.message||tr('The PDFs could not be merged. Please check the files and try again.','PDF मर्ज नहीं हो सकीं। फाइलें जाँचकर दोबारा कोशिश करें।'));}
  finally{setBusy(false);}
 };
 const download=()=>{if(!pdfUrl)return;const a=document.createElement('a');a.href=pdfUrl;a.download='merged.pdf';document.body.appendChild(a);a.click();a.remove();};
 return createPortal(<div className="pdfmerge-tool">
  <header className="pm-top"><button className="pm-back" onClick={onBack}><ArrowLeft size={18}/>{tr('Back to tools','टूल्स पर वापस')}</button><div className="pm-brand"><span><Files size={20}/></span><div><b>PDF MERGER</b><small>{tr('Combine multiple PDFs into one','कई PDF को एक में जोड़ें')}</small></div></div><div className="pm-private"><ShieldCheck size={15}/>{tr('Private · Browser-based','प्राइवेट · ब्राउज़र में')}</div></header>
  <main className="pm-main"><section className="pm-hero"><div><small>{tr('SIMPLE PDF WORKFLOW','आसान PDF वर्कफ़्लो')}</small><h1>{tr('ALL PDFs INTO ONE PDF','सभी PDF को एक PDF में जोड़ें')}</h1><p>{tr('Add multiple PDF files, arrange their order and combine every page into one single PDF document.','कई PDF फाइलें जोड़ें, उनका क्रम तय करें और सभी पेज एक ही PDF डॉक्यूमेंट में जोड़ें।')}</p></div><div className="pm-hero-art"><FileText size={43}/><span>+</span><Files size={43}/></div></section>
  <div className="pm-grid"><section className="pm-card"><div className="pm-step"><span>01</span><div><b>{tr('Add your PDF files','अपनी PDF फाइलें जोड़ें')}</b><small>PDF · {tr('Select two or more files','दो या अधिक फाइलें चुनें')}</small></div></div>
   <button className={'pm-drop '+(drag?'drag':'')} onClick={()=>input.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files)}}><span><Upload size={27}/></span><b>{tr('Drop PDF files here','PDF फाइलें यहाँ छोड़ें')}</b><small>{tr('or click to browse your device','या डिवाइस से चुनें')}</small><em>PDF FILES ONLY</em></button><input ref={input} hidden type="file" multiple accept="application/pdf,.pdf" onChange={e=>{if(e.target.files)addFiles(e.target.files);e.currentTarget.value='';}}/>
   <div className="pm-list-head"><b>{tr('Selected PDF files','चुनी गई PDF फाइलें')}</b><span>{files.length} {tr('file(s)','फाइलें')} · {totalPages} {tr('pages','पेज')}</span></div>
   {files.length===0?<div className="pm-empty"><FileText size={22}/>{tr('Your selected PDFs will appear here.','आपकी चुनी हुई PDF फाइलें यहाँ दिखेंगी।')}</div>:<div className="pm-files">{files.map((f,i)=><div className="pm-file" key={f.id}><span className="pm-file-icon"><FileText size={21}/></span><div className="pm-file-info"><b>{i+1}. {f.file.name}</b><small>{fmt(f.file.size)} · {f.pages} {tr('page(s)','पेज')}</small></div><div className="pm-file-actions"><button disabled={i===0} onClick={()=>move(i,-1)} title="Move up"><ChevronUp size={16}/></button><button disabled={i===files.length-1} onClick={()=>move(i,1)} title="Move down"><ChevronDown size={16}/></button><button onClick={()=>remove(f.id)} title="Remove"><Trash2 size={16}/></button></div></div>)}</div>}
   <div className="pm-step pm-summary"><span>02</span><div><b>{tr('Merge order & summary','मर्ज क्रम और सारांश')}</b><small>{tr('The files above will be combined in this exact order.','ऊपर दी गई फाइलें इसी क्रम में जोड़ी जाएँगी।')}</small></div></div>
   <div className="pm-stats"><div><b>{files.length}</b><small>{tr('PDF FILES','PDF फाइलें')}</small></div><div><b>{totalPages}</b><small>{tr('TOTAL PAGES','कुल पेज')}</small></div><div><b>{files.length>1?'READY':'ADD 2+'}</b><small>{tr('MERGE STATUS','मर्ज स्थिति')}</small></div></div>
   <button className="pm-create" disabled={files.length<2||busy} onClick={merge}>{busy?<><Loader2 className="pm-spin" size={19}/>{tr('Merging PDFs…','PDF मर्ज हो रही हैं…')}</>:<><Merge size={19}/>{tr('MERGE ALL PDFs','सभी PDF मर्ज करें')}</>}</button>
   {busy&&<div className="pm-progress"><span>{status}</span><b>{progress}%</b><i><span style={{width:progress+'%'}}/></i></div>}
   {error&&<div className="pm-msg error"><AlertCircle size={17}/>{error}</div>}
   {status&&!busy&&pdfUrl&&<div className="pm-msg"><CheckCircle2 size={17}/>{status}</div>}
  </section>
  <aside className="pm-preview"><div className="pm-preview-title"><small>{tr('MERGED PDF RESULT','मर्ज PDF रिजल्ट')}</small><h2>{tr('Preview & download','प्रीव्यू और डाउनलोड')}</h2></div>{pdfUrl?<><div className="pm-pdf-meta"><b>{fmt(pdfSize)}</b><span>{pageCount} {tr('page(s)','पेज')}</span></div><iframe src={pdfUrl+'#toolbar=0&navpanes=0'} title="Merged PDF preview"/><button className="pm-download" onClick={download}><Download size={18}/>{tr('DOWNLOAD MERGED PDF','मर्ज PDF डाउनलोड करें')}</button></>:<div className="pm-preview-empty"><Files size={44}/><b>{tr('Your merged PDF preview will appear here','मर्ज की गई PDF का प्रीव्यू यहाँ दिखेगा')}</b><small>{tr('Add at least two PDF files and merge them to see the result.','कम से कम दो PDF फाइलें जोड़ें और रिजल्ट देखने के लिए मर्ज करें।')}</small></div>}<div className="pm-preview-foot"><ShieldCheck size={15}/>{tr('Files are processed on this device.','फाइलें इसी डिवाइस पर प्रोसेस होती हैं।')}</div></aside></div>
  <section className="pm-benefits"><div><Files size={20}/><b>{tr('Combine multiple PDFs','कई PDF जोड़ें')}</b><small>{tr('One continuous PDF document','एक ही PDF डॉक्यूमेंट')}</small></div><div><FilePlus2 size={20}/><b>{tr('Keep page order','पेज क्रम बनाए रखें')}</b><small>{tr('Reorder files before merging','मर्ज से पहले क्रम बदलें')}</small></div><div><ShieldCheck size={20}/><b>{tr('Private conversion','प्राइवेट कन्वर्ज़न')}</b><small>{tr('No upload to a server','सर्वर पर अपलोड नहीं')}</small></div></section>
  </main></div>,document.body);
}
