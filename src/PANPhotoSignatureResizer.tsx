import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,Upload,Image as ImageIcon,ZoomIn,ZoomOut,RotateCcw,Download,Printer,CheckCircle2,AlertCircle,Info,Move} from 'lucide-react';
import './PANPhotoSignatureResizer.css';

type Kind='photo'|'signature';
type Profile='protean-dsc'|'protean-ekyc'|'custom';
const profiles={
 'protean-dsc':{label:'Protean · DSC / scanned upload',dpi:200,photo:{w:2.5,h:3.5,kb:20},signature:{w:4.5,h:2,kb:10},note:'Protean DSC scanned upload: JPEG, 200 DPI; photo 3.5 × 2.5 cm up to 20 KB; signature 2 × 4.5 cm up to 10 KB.'},
 'protean-ekyc':{label:'Protean · online e-KYC flow',dpi:200,photo:{w:2.5,h:3.5,kb:50},signature:{w:4.5,h:2,kb:50},note:'Protean online e-KYC: photo 3.5 × 2.5 cm and signature 2 × 4.5 cm, up to 50 KB each. 200 DPI is used as a practical output setting.'}
} as const;
type Output={url:string;blob:Blob;width:number;height:number;kb:number;dpi:number};
type Point={x:number;y:number};
export default function PANPhotoSignatureResizer({onBack}:{onBack?:()=>void}){
 const [profile,setProfile]=useState<Profile>('protean-dsc');
 const [kind,setKind]=useState<Kind>('photo');
 const [files,setFiles]=useState<Record<Kind,File|null>>({photo:null,signature:null});
 const [urls,setUrls]=useState<Record<Kind,string|null>>({photo:null,signature:null});
 const [outputs,setOutputs]=useState<Record<Kind,Output|null>>({photo:null,signature:null});
 const [zoom,setZoom]=useState(100);
 const [offset,setOffset]=useState<Point>({x:0,y:0});
 const [dragging,setDragging]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [custom,setCustom]=useState({photoW:2.5,photoH:3.5,photoKB:20,sigW:4.5,sigH:2,sigKB:10,dpi:200});
 const [processedBgUrls,setProcessedBgUrls]=useState<Record<Kind,string|null>>({photo:null,signature:null});
 const [bgBusy,setBgBusy]=useState(false);
 const [bgStatus,setBgStatus]=useState('');
 const [bgColor,setBgColor]=useState('#ffffff');
 const [tolerance,setTolerance]=useState(42);
 const fileRef=useRef<HTMLInputElement>(null);
 const stageRef=useRef<HTMLDivElement>(null);
 const dragRef=useRef<{x:number;y:number;ox:number;oy:number}|null>(null);
 const imageRef=useRef<HTMLImageElement|null>(null);
 const spec=profile==='custom'?null:profiles[profile];
 const current=spec?spec[kind]:kind==='photo'?{w:custom.photoW,h:custom.photoH,kb:custom.photoKB}:{w:custom.sigW,h:custom.sigH,kb:custom.sigKB};
 const dpi=spec?.dpi??custom.dpi;
 const px=useMemo(()=>({w:Math.round(current.w/2.54*dpi),h:Math.round(current.h/2.54*dpi)}),[current.w,current.h,dpi]);
 const ratio=px.w/Math.max(1,px.h);
 useEffect(()=>{return ()=>{Object.values(urls).forEach(u=>u&&URL.revokeObjectURL(u));Object.values(outputs).forEach(o=>o&&URL.revokeObjectURL(o.url));};},[]);
 useEffect(()=>{setZoom(100);setOffset({x:0,y:0});},[kind,profile]);
 useEffect(()=>{const url=processedBgUrls[kind]||urls[kind];if(!url){imageRef.current=null;return;}const img=new Image();img.onload=()=>{imageRef.current=img;setZoom(100);setOffset({x:0,y:0});};img.src=url;return()=>{imageRef.current=null;};},[urls,processedBgUrls,kind]);
 const setFile=(f:File|null)=>{setError('');setBgStatus('');const old=urls[kind];if(old)URL.revokeObjectURL(old);const oldBg=processedBgUrls[kind];if(oldBg)URL.revokeObjectURL(oldBg);const next=f?URL.createObjectURL(f):null;setFiles(v=>({...v,[kind]:f}));setOutputs(v=>({...v,[kind]:null}));setUrls(v=>({...v,[kind]:next}));setProcessedBgUrls(v=>({...v,[kind]:null}));setZoom(100);setOffset({x:0,y:0});};
 const frameSize=()=>{const stage=stageRef.current;if(!stage)return {w:260,h:Math.round(260/ratio)};const maxW=Math.max(120,stage.clientWidth-48),maxH=Math.max(150,stage.clientHeight-48);let w=Math.min(maxW,kind==='photo'?280:360),h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}return {w,h};};
 const removeBackground=async()=>{
  const source=urls[kind];if(!source){setError('पहले फोटो अपलोड करें।');return;}
  setBgBusy(true);setError('');setBgStatus('Background अलग किया जा रहा है…');
  try{
   const img=new Image();img.src=source;await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Image load नहीं हो सकी।'));});
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas उपलब्ध नहीं है।');
   ctx.drawImage(img,0,0);const image=ctx.getImageData(0,0,canvas.width,canvas.height),d=image.data,w=canvas.width,h=canvas.height;
   const corners=[[0,0],[w-1,0],[0,h-1],[w-1,h-1],[Math.floor(w/2),0],[Math.floor(w/2),h-1],[0,Math.floor(h/2)],[w-1,Math.floor(h/2)]];
   const samples=corners.map(([x,y])=>{const i=(y*w+x)*4;return [d[i],d[i+1],d[i+2]];});
   const base=samples.reduce((a,s)=>a.map((v,i)=>v+s[i]/samples.length),[0,0,0]);
   const threshold=Math.max(18,tolerance*1.35),feather=threshold+34,total=w*h,seen=new Uint8Array(total),queue=new Int32Array(total);let head=0,tail=0;
   const matches=(p:number)=>{const i=p*4,dr=d[i]-base[0],dg=d[i+1]-base[1],db=d[i+2]-base[2];return Math.sqrt(dr*dr+dg*dg+db*db)<feather;};
   const add=(p:number)=>{if(p<0||p>=total||seen[p]||!matches(p))return;seen[p]=1;queue[tail++]=p;};
   for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=1;y<h-1;y++){add(y*w);add(y*w+w-1);}
   while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0;if(x>0)add(p-1);if(x<w-1)add(p+1);if(y>0)add(p-w);if(y<h-1)add(p+w);}
   let removed=0;
   for(let p=0;p<total;p++){if(!seen[p])continue;const i=p*4,dr=d[i]-base[0],dg=d[i+1]-base[1],db=d[i+2]-base[2],dist=Math.sqrt(dr*dr+dg*dg+db*db);const alpha=Math.max(0,Math.min(1,(dist-threshold)/(feather-threshold)));d[i+3]=Math.round(d[i+3]*alpha);if(alpha<.95)removed++;}
   if(removed<total*.002)throw new Error('किनारों पर साफ़ background नहीं मिला। साफ़/एकसमान background वाली फोटो चुनें या Skip करें।');
   ctx.putImageData(image,0,0);const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/png'));if(!blob)throw new Error('Transparent PNG नहीं बन सकी।');
   const next=URL.createObjectURL(blob),old=processedBgUrls[kind];if(old)URL.revokeObjectURL(old);
   setProcessedBgUrls(v=>({...v,[kind]:next}));setBgStatus('Background हट गया। अब नीचे नया रंग चुनें और crop frame में फोटो सेट करें।');setZoom(100);setOffset({x:0,y:0});
  }catch(e){setBgStatus('');setError(e instanceof Error?e.message:'Background removal असफल रहा।');}finally{setBgBusy(false);}
 };
 const skipBackground=()=>{const old=processedBgUrls[kind];if(old)URL.revokeObjectURL(old);setProcessedBgUrls(v=>({...v,[kind]:null}));setBgStatus('Background removal skip किया गया। Original photo इस्तेमाल होगी।');setError('');setZoom(100);setOffset({x:0,y:0});};
 const drawCrop=(canvas:HTMLCanvasElement)=>{
  const img=imageRef.current;if(!img)throw new Error('पहले फोटो अपलोड करें।');
  canvas.width=px.w;canvas.height=px.h;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  ctx.fillStyle=bgColor;ctx.fillRect(0,0,px.w,px.h);
  const scale=Math.min(px.w/img.width,px.h/img.height)*(zoom/100);
  const dw=img.width*scale,dh=img.height*scale;
  const dx=(px.w-dw)/2+(offset.x/Math.max(1,frameSize().w))*px.w;
  const dy=(px.h-dh)/2+(offset.y/Math.max(1,frameSize().h))*px.h;
  const temp=document.createElement('canvas');temp.width=px.w;temp.height=px.h;const t=temp.getContext('2d');if(!t)throw new Error('Canvas unavailable');
  t.drawImage(img,dx,dy,dw,dh);
  ctx.drawImage(temp,0,0);
 };
 const process=async()=>{
  const file=files[kind];if(!file){setError('पहले फोटो या सिग्नेचर अपलोड करें।');return;}
  if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){setError('कृपया JPG, PNG या WebP इमेज चुनें।');return;}
  if(current.w<=0||current.h<=0||current.kb<=0||dpi<=0){setError('कृपया सही dimensions, KB और DPI भरें।');return;}
  setBusy(true);setError('');
  try{
   const canvas=document.createElement('canvas');drawCrop(canvas);
   const maxBytes=current.kb*1024;let lo=.25,hi=.96,best:Blob|null=null;
   for(let i=0;i<16;i++){const q=(lo+hi)/2;const b=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',q));if(!b)throw new Error('JPEG export failed');if(b.size<=maxBytes){best=b;lo=q;}else hi=q;}
   if(!best){const b=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',.18));if(!b||b.size>maxBytes)throw new Error('इस फोटो को चुनी गई KB सीमा में फिट नहीं किया जा सका। कम आकार की फोटो चुनें या KB सीमा बढ़ाएँ।');best=b;}
   const raw=new Uint8Array(await best.arrayBuffer());if(raw[0]===0xff&&raw[1]===0xd8&&raw[2]===0xff&&raw[3]===0xe0&&raw[6]===0x4a&&raw[7]===0x46&&raw[8]===0x49&&raw[9]===0x46){raw[13]=1;raw[14]=(dpi>>8)&255;raw[15]=dpi&255;raw[16]=(dpi>>8)&255;raw[17]=dpi&255;}
   best=new Blob([raw],{type:'image/jpeg'});const outUrl=URL.createObjectURL(best);setOutputs(v=>({...v,[kind]:{url:outUrl,blob:best!,width:px.w,height:px.h,kb:best!.size/1024,dpi}}));
  }catch(e){setError(e instanceof Error?e.message:'Processing failed');}finally{setBusy(false);}
 };
 const download=()=>{const o=outputs[kind];if(!o)return;const a=document.createElement('a');a.href=o.url;a.download='PAN-'+kind.toUpperCase()+'-RESIZED.jpg';a.click();};
 const print=()=>{const o=outputs[kind];if(!o)return;const win=window.open('','_blank');if(!win)return;win.document.write('<html><head><title>PAN '+kind+' print</title><style>@page{size:A4;margin:15mm}body{margin:0;display:flex;align-items:flex-start}img{width:'+current.w+'cm;height:'+current.h+'cm;object-fit:fill}</style></head><body><img src="'+o.url+'"></body></html>');win.document.close();win.onload=()=>{win.focus();win.print();};};
 const startDrag=(e:React.PointerEvent<HTMLDivElement>)=>{if(!urls[kind]||outputs[kind])return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);dragRef.current={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y};setDragging(true);};
 const moveDrag=(e:React.PointerEvent<HTMLDivElement>)=>{if(!dragRef.current)return;setOffset({x:dragRef.current.ox+e.clientX-dragRef.current.x,y:dragRef.current.oy+e.clientY-dragRef.current.y});};
 const endDrag=()=>{dragRef.current=null;setDragging(false);};
 const title=kind==='photo'?'Applicant Photo':'Applicant Signature';
 const liveStyle={width:kind==='photo'?Math.min(260,px.w):Math.min(340,px.w),aspectRatio:String(ratio),transform:'scale(1)'};
 return <div className="panrs-page">
  <header className="panrs-head"><button onClick={onBack} className="panrs-back"><ArrowLeft size={17}/> Back</button><div><b>PAN PHOTO & SIGNATURE RESIZER</b><small>ACTUAL SIZE · Portal-ready image preparation</small></div><span className="panrs-tag">LOCAL PROCESSING</span></header>
  <div className="panrs-layout">
   <aside className="panrs-settings">
    <section className="panrs-card"><h3>1. Select PAN application profile</h3><select value={profile} onChange={e=>{setProfile(e.target.value as Profile);setOutputs({photo:null,signature:null});}}><option value="protean-dsc">Protean · DSC / scanned upload</option><option value="protean-ekyc">Protean · online e-KYC flow</option><option value="custom">Custom dimensions & KB</option></select><p className="panrs-note"><Info size={14}/>{spec?.note??'UTIITSL या अन्य workflow के लिए पोर्टल पर दिख रहे exact dimensions और KB भरें।'}</p></section>
    {profile==='custom'&&<section className="panrs-card"><h3>Custom requirements</h3><div className="panrs-fields">{[['Photo width (cm)','photoW'],['Photo height (cm)','photoH'],['Photo max KB','photoKB'],['Signature width (cm)','sigW'],['Signature height (cm)','sigH'],['Signature max KB','sigKB'],['Resolution (DPI)','dpi']].map(([label,key])=><label key={key}>{label}<input type="number" min="1" step="any" value={(custom as any)[key]} onChange={e=>setCustom(v=>({...v,[key]:Number(e.target.value)}))}/></label>)}</div></section>}
    <section className="panrs-card"><h3>2. Choose what to prepare</h3><div className="panrs-tabs"><button className={kind==='photo'?'active':''} onClick={()=>{setKind('photo');setError('');}}> <ImageIcon size={15}/> Photo</button><button className={kind==='signature'?'active':''} onClick={()=>{setKind('signature');setError('');}}>Signature</button></div><div className="panrs-spec"><b>{title}</b><span>{current.w} × {current.h} cm · PAN ACTUAL RATIO</span><span>{px.w} × {px.h} px · {dpi} DPI target</span><span>Maximum {current.kb} KB · JPG</span></div>
     <button className="panrs-upload" onClick={()=>fileRef.current?.click()}><Upload size={17}/> {files[kind]?'Change image':'Upload '+(kind==='photo'?'Photo':'Signature')}</button><input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>{files[kind]&&<small className="panrs-file">{files[kind]?.name}</small>}
     <div className="panrs-crop-help"><Move size={15}/> फोटो को फ्रेम के अंदर उँगली / माउस से पकड़कर खिसकाएँ। फ्रेम के बाहर का हिस्सा crop होगा।</div>
     <label className="panrs-zoom-label">Crop zoom <b>{zoom}%</b></label><input className="panrs-range" type="range" min="50" max="250" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><div className="panrs-zoom-btns"><button onClick={()=>setZoom(v=>Math.max(50,v-10))}><ZoomOut size={15}/> Zoom out</button><button onClick={()=>setZoom(v=>Math.min(250,v+10))}><ZoomIn size={15}/> Zoom in</button><button onClick={()=>{setZoom(100);setOffset({x:0,y:0});}}><RotateCcw size={14}/> Reset</button></div>
     <div className="panrs-bg-tools"><b className="panrs-bg-title">Background tools</b><p className="panrs-bg-desc">पहले चाहें तो background हटाएँ। नहीं हटाना है तो Skip करें।</p><div className="panrs-bg-actions"><button type="button" onClick={removeBackground} disabled={bgBusy||!files[kind]}>{bgBusy?'Removing…':'Remove Background'}</button><button type="button" onClick={skipBackground} disabled={!files[kind]}>Skip Background Removal</button></div><div className="panrs-bg-row"><label>New background colour <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)}/></label><label>Edge sensitivity <input type="range" min="10" max="100" value={tolerance} onChange={e=>setTolerance(Number(e.target.value))}/></label></div>{bgStatus&&<small className="panrs-bg-status">{bgStatus}</small>}<small>Removal किनारों से जुड़े समान रंग के background को अलग करता है। बहुत जटिल या बालों के आसपास के background में नतीजा जाँचें।</small></div>
     <button className="panrs-primary" disabled={busy||!files[kind]} onClick={process}>{busy?'Preparing…':'Crop, Resize & Compress'}</button>{error&&<p className="panrs-error"><AlertCircle size={15}/>{error}</p>}
    </section>
    <section className="panrs-card"><h3>3. Download / Print</h3>{outputs[kind]?<><p className="panrs-success"><CheckCircle2 size={15}/> Ready · {outputs[kind]!.kb.toFixed(1)} KB</p><button className="panrs-primary" onClick={download}><Download size={16}/> Download JPG</button><button className="panrs-secondary" onClick={print}><Printer size={16}/> Print at actual size</button></>:<p className="panrs-muted">Crop the photo in the frame, then prepare it to enable download.</p>}</section>
   </aside>
   <main className="panrs-preview"><div className="panrs-preview-top"><div><b>PAN ACTUAL-SIZE CROP FRAME</b><small>{kind==='photo'?'Photo':'Signature'} · {current.w} × {current.h} cm · {px.w} × {px.h} px</small></div><div className="panrs-zoom-btns"><button onClick={()=>setZoom(v=>Math.max(50,v-10))}><ZoomOut size={15}/></button><button onClick={()=>setZoom(v=>Math.min(250,v+10))}><ZoomIn size={15}/></button><button onClick={()=>{setZoom(100);setOffset({x:0,y:0});}}><RotateCcw size={14}/></button></div></div>
    <div className="panrs-stage" ref={stageRef}><div className={'panrs-paper panrs-crop-frame'+(dragging?' is-dragging':'')} style={{...liveStyle,background:bgColor}} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>{outputs[kind]?<img src={outputs[kind]!.url} alt="Final PAN crop"/>:urls[kind]?<img src={urls[kind]!} alt="Crop preview" style={{width:'100%',height:'100%',objectFit:'contain',transform:'translate('+((offset.x/Math.max(1,frameSize().w))*100)+'%,'+((offset.y/Math.max(1,frameSize().h))*100)+'%) scale('+zoom/100+')'}}/>:<div className="panrs-empty"><ImageIcon size={40}/><b>Preview will appear here</b><span>Upload a {kind} to position it in PAN frame</span></div>}<span className="panrs-frame-label">PAN ACTUAL CROP</span></div></div>
    <div className="panrs-metrics"><div><small>Output dimensions</small><b>{px.w} × {px.h} px</b></div><div><small>Target file size</small><b>≤ {current.kb} KB</b></div><div><small>Resolution target</small><b>{dpi} DPI</b></div><div><small>Output format</small><b>JPEG</b></div></div>
    <p className="panrs-disclaimer">फ्रेम के अंदर दिखने वाला हिस्सा ही crop होगा। Final output तय pixel dimensions में बनेगा। Background removal एक अनुमानित colour-key प्रक्रिया है; डाउनलोड से पहले चेहरा, बाल और किनारे जाँचें।</p>
   </main>
  </div>
 </div>;
}
