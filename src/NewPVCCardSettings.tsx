import React from 'react';

const groups=[
 {name:'Education & Other',items:[['labour-worker','Labour / Construction Worker Card',85.6,53.98],['apaar','APAAR / ABC Academic ID',85.6,53.98],['student','School / College / Student ID',85.6,53.98],['company','Company / Organization ID',85.6,53.98],['other-dept','Other State / Department Card',0,0]]},
 {name:'Identity & Government',items:[['aadhaar','Aadhaar PVC',86,54],['voter','Voter ID / EPIC',86,54],['pan','PAN Card',85.6,53.98],['dl','Driving Licence',85.6,53.98],['rc','Vehicle RC',85.6,53.98],['udid','UDID Disability ID',85.6,53.98],['npr','NPR / MNIC',85.6,53.98],['gov-employee','Government Employee / Pension ID',85.6,53.98]]},
 {name:'Health & Welfare',items:[['ayushman','Ayushman / PM-JAY',85.6,53.98],['abha','ABHA Health ID',85.6,53.98],['health','CGHS / ECHS / State Health Card',85.6,53.98]]},
 {name:'Labour, Agriculture & Property',items:[['eshram','e-Shram / UAN',85.6,53.98],['mgnrega','MGNREGA Job Card',85.6,53.98],['kisan','Kisan Credit / Farmer Card',85.6,53.98],['ration','Ration / Family Card',0,0],['svamitva','SVAMITVA / Property Card',0,0]]}
] as const;
type Props={cardType:string;setCardType:(v:string)=>void;onSize:(w:number,h:number)=>void;printMode:string;setPrintMode:(v:string)=>void;cornerMode:string;setCornerMode:(v:string)=>void;radius:number;setRadius:(v:number)=>void;border:boolean;setBorder:(v:boolean)=>void;borderColor:string;setBorderColor:(v:string)=>void;borderWidth:number;setBorderWidth:(v:number)=>void;media:string;setMedia:(v:string)=>void;content:string;setContent:(v:string)=>void;template:string;setTemplate:(v:string)=>void;preset:string;setPreset:(v:string)=>void;colorBase:string;setColorBase:(v:string)=>void};
export default function NewPVCCardSettings(p:Props){
 const field=(label:string,child:React.ReactNode)=><label className="np-select">{label}{child}</label>;
 const select=(value:string,onChange:(v:string)=>void,options:[string,string][])=> <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o[0]} value={o[0]}>{o[1]}</option>)}</select>;
 const setType=(id:string)=>{p.setCardType(id);const item=groups.flatMap(g=>g.items).find(v=>v[0]===id);if(item&&item[2]>0)p.onSize(item[2],item[3]);};
 return <section className="np-card-profile"><h3>2. Card profile &amp; print settings</h3>
 {field('Card type',<select value={p.cardType} onChange={e=>setType(e.target.value)}><option value="none">None / No card type</option><option value="svamitva-custom">SVAMITVA / Property Card · Custom size</option>{groups.map(g=><optgroup key={g.name} label={g.name}>{g.items.map(i=><option key={i[0]} value={i[0]}>{i[1]}{i[2]>0?' · '+i[2]+' × '+i[3]+' mm':' · Custom size'}</option>)}</optgroup>)}</select>)}
 <div className="np-fields">{field('Print mode',select(p.printMode,p.setPrintMode,[['normal','Normal Print'],['pvc','PVC Card']]))}{field('Card edge / finish',select(p.cornerMode,p.setCornerMode,[['square','Original / Square edge'],['rounded','PVC Rounded corner']]))}</div>
 {p.cornerMode==='rounded'&&<label className="np-range"><span>Corner radius <b>{p.radius.toFixed(1)} mm</b></span><input type="range" min=".5" max="5" step=".1" value={p.radius} onChange={e=>p.setRadius(Number(e.target.value))}/></label>}
 <label className="np-check"><input type="checkbox" checked={p.border} onChange={e=>p.setBorder(e.target.checked)}/>Print card border</label>
 {p.border&&<div className="np-fields">{field('Border color',select(p.borderColor,p.setBorderColor,[['#111827','Black'],['#dc2626','Red'],['#f97316','Orange'],['#2563eb','Blue']]))}{field('Thickness (mm)',<input type="number" min=".1" max="5" step=".1" value={p.borderWidth} onChange={e=>p.setBorderWidth(Math.max(.1,Math.min(5,Number(e.target.value)||.1)))}/>)}</div>}
 {field('Print media',select(p.media,p.setMedia,[['pvc','PVC Card Sheet'],['dragon','Dragon Sheet'],['inkjet','Inkjet Printable Sheet'],['magnetic','Magnetic Printable Sheet'],['proof','A4 Paper Proof'],['photo','Photo Paper'],['easy','Easy Card · extended grip / trim area']]))}
 {field('Sheet content',select(p.content,p.setContent,[['both','Front + Back · two PDF pages'],['front','Front side only'],['back','Back side only']]))}
 <div className="np-fields">{field('Card template',select(p.template,p.setTemplate,[['blank','Blank custom card'],['generic','Generic ID sample'],['sample','Sample layout guide']]))}{field('Card preset',select(p.preset,v=>{p.setPreset(v);if(v==='aadhaar')p.onSize(86,54);if(v==='cr80')p.onSize(85.6,54);if(v==='id1')p.onSize(85.6,53.98)},[['aadhaar','Aadhaar PVC DIY · 86 × 54'],['cr80','CR80 · 85.6 × 54'],['id1','ISO ID-1 · 85.60 × 53.98'],['custom','Custom dimensions']]))}</div>
 {field('Card color base',select(p.colorBase,p.setColorBase,[['original','Original photo / image'],['white','White base / matte'],['lightblue','Light blue sample base'],['pastel','Soft pastel'],['metallic','Metallic grey preview']]))}
 <p className="np-muted">Print-layout controls only. These do not reproduce official holograms, seals, security marks or authenticate an identity document. Confirm media compatibility and printer feed settings with the sheet manufacturer.</p>
 </section>;
}
