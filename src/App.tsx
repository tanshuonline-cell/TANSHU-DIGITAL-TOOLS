import {createElement,useMemo,useState} from 'react';
import {Search,Grid2X2,Star,Clock3,Home,Image,FileText,Printer,CreditCard,Briefcase,GraduationCap,Keyboard,QrCode,Landmark,Wrench,Globe2,Sun,Moon,ChevronRight,Sparkles,ArrowUpRight,Menu,X,Languages,LayoutDashboard,ScanLine,FolderOpen,ShieldCheck, Zap, Heart, Command} from 'lucide-react';
type Lang='en'|'hi';
const categories=[
{ id:'csc',en:'CSC CENTER TOOLS',hi:'CSC सेंटर टूल्स',desc:'Everyday services and assisted workflows',icon:Landmark,count:18 },
{ id:'cyber',en:'CYBER CAFE TOOLS',hi:'साइबर कैफे टूल्स',desc:'A complete counter and customer workbench',icon:Globe2,count:16 },
{ id:'maker',en:'INSTANT MAKER TOOLS',hi:'इंस्टेंट मेकर टूल्स',desc:'Create print-ready designs in a few steps',icon:Sparkles,count:24,hot:true },
{ id:'docs',en:'DOCUMENT & CERTIFICATE STUDIO',hi:'डॉक्यूमेंट और सर्टिफिकेट स्टूडियो',desc:'Clean, editable document layouts',icon:FileText,count:14 },
{ id:'print',en:'PRINT & SCAN CENTER',hi:'प्रिंट और स्कैन सेंटर',desc:'Print setup, scan and page preparation',icon:Printer,count:12 },
{ id:'photo',en:'PHOTO STUDIO',hi:'फोटो स्टूडियो',desc:'Photo sizing, cleanup and print sheets',icon:Image,count:15 },
{ id:'pvc',en:'PVC & ID CARD STUDIO',hi:'PVC और ID कार्ड स्टूडियो',desc:'Professional card layouts and sheets',icon:CreditCard,count:13 },
{ id:'pdf',en:'PDF MASTER',hi:'PDF मास्टर',desc:'Organize, convert and prepare PDFs',icon:FolderOpen,count:20 },
{ id:'business',en:'BUSINESS & INVOICE',hi:'बिज़नेस और इनवॉइस',desc:'Simple billing and business documents',icon:Briefcase,count:10 },
{ id:'education',en:'EDUCATION & EXAM DESK',hi:'एजुकेशन और एग्जाम डेस्क',desc:'Student and school document workflows',icon:GraduationCap,count:9 },
{ id:'typing',en:'TYPING & CAREER',hi:'टाइपिंग और करियर',desc:'Typing utilities, resume and applications',icon:Keyboard,count:11 },
{ id:'qr',en:'QR & BARCODE TOOLS',hi:'QR और बारकोड टूल्स',desc:'Create practical codes and labels',icon:QrCode,count:7 },
{ id:'utility',en:'UTILITY & FILE TOOLS',hi:'यूटिलिटी और फाइल टूल्स',desc:'Useful everyday file helpers',icon:Wrench,count:14 },
{ id:'banking',en:'BANKING UTILITIES',hi:'बैंकिंग यूटिलिटी',desc:'Reference tools and quick calculations',icon:ShieldCheck,count:6 },
{ id:'govt',en:'GOVT PORTAL QUICK ACCESS',hi:'सरकारी पोर्टल क्विक एक्सेस',desc:'Shortcuts to official public services',icon:Globe2,count:10 }
];
const makers=[
{en:'Passport Photo Maker',hi:'पासपोर्ट फोटो मेकर',sub:'Print-ready photo sizes',icon:Image,tag:'MOST USED'},
{en:'PVC Card Maker',hi:'PVC कार्ड मेकर',sub:'Design front and back layouts',icon:CreditCard,tag:'POPULAR'},
{en:'Instant Card Maker',hi:'इंस्टेंट कार्ड मेकर',sub:'ID, student, employee and membership',icon:LayoutDashboard,tag:''},
{en:'Card Cover Maker',hi:'कार्ड कवर मेकर',sub:'Create front & back card artwork',icon:Sparkles,tag:''},
{en:'Photo Sheet Maker',hi:'फोटो शीट मेकर',sub:'Arrange multiple photos on one page',icon:Grid2X2,tag:''},
{en:'Signature Maker',hi:'सिग्नेचर मेकर',sub:'Crop and prepare signature images',icon:Zap,tag:''},
{en:'Visiting Card Maker',hi:'विजिटिंग कार्ड मेकर',sub:'Clean business card designs',icon:Briefcase,tag:''},
{en:'Resume Maker',hi:'रिज्यूमे मेकर',sub:'Professional resume layouts',icon:FileText,tag:''}
];
const tools=[
['photo','Stamp Size Photo Maker','स्टाम्प साइज फोटो मेकर','Ready-to-print photo sizing',Image],['photo','Photo Background Studio','फोटो बैकग्राउंड स्टूडियो','Prepare a clean photo background',Sun],
['pvc','Student ID Card Maker','स्टूडेंट ID कार्ड मेकर','Editable student card layout',CreditCard],['pvc','Employee ID Card Maker','एम्प्लॉयी ID कार्ड मेकर','Workplace identity card design',CreditCard],
['docs','Application & Letter Maker','आवेदन और पत्र मेकर','Draft clean application documents',FileText],['docs','Biodata Maker','बायोडाटा मेकर','Simple personal biodata layouts',FileText],
['pdf','Merge PDF','PDF मर्ज करें','Combine multiple PDF files',FolderOpen],['pdf','Compress PDF','PDF कंप्रेस करें','Reduce PDF file size',Zap],
['print','A4 Print Layout','A4 प्रिंट लेआउट','Set margins, orientation and scale',Printer],['print','Scan to PDF','स्कैन से PDF','Prepare scanned pages as PDF',ScanLine],
['business','Invoice Maker','इनवॉइस मेकर','Create a simple business invoice',Briefcase],['qr','QR Code Maker','QR कोड मेकर','Create QR codes for useful links',QrCode],
['education','Certificate Template Studio','सर्टिफिकेट टेम्पलेट स्टूडियो','Authorized sample layouts only',GraduationCap],['typing','Hindi Typing Workspace','हिंदी टाइपिंग वर्कस्पेस','A focused bilingual typing area',Keyboard]
] as const;
export default function App(){
const [lang,setLang]=useState<Lang>('en'); const [query,setQuery]=useState(''); const [section,setSection]=useState('home'); const [favorites,setFavorites]=useState<string[]>([]); const [recent,setRecent]=useState<string[]>([]); const [mobile,setMobile]=useState(false); const [dark,setDark]=useState(false); const [showLangMenu,setShowLangMenu]=useState(false);
const hi=lang==='hi'; const tr=(en:string,h:string)=>hi?h:en;
const filtered=useMemo(()=>tools.filter(t=>(t[1]+' '+t[2]+' '+t[3]).toLowerCase().includes(query.toLowerCase())),[query]);
const go=(id:string)=>{setSection(id);setMobile(false);window.scrollTo({top:0,behavior:'smooth'})};
const toggleFav=(name:string)=>setFavorites(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name]);
const soon=(name:string)=>{setRecent(v=>[name,...v.filter(x=>x!==name)].slice(0,5));window.alert(hi?name+' — यह टूल अगले चरण में उपलब्ध होगा।':' '+name+' — This tool will be enabled in a later phase.');};
const side=[{id:'home',label:tr('Overview','ओवरव्यू'),icon:Home},{id:'maker',label:tr('Maker Tools','मेकर टूल्स'),icon:Sparkles},{id:'csc',label:tr('CSC Center','CSC सेंटर'),icon:Landmark},{id:'cyber',label:tr('Cyber Cafe','साइबर कैफे'),icon:Globe2},{id:'all',label:tr('All Categories','सभी कैटेगरी'),icon:Grid2X2}];
const currentCat=categories.find(c=>c.id===section);
const directoryTools = section==='favorites'
  ? tools.filter(t=>favorites.includes(t[1]))
  : section==='recent'
    ? tools.filter(t=>recent.includes(t[1]))
    : filtered.filter(t=>t[0]===section || section==='maker');
return <div className={dark?'app dark':'app light'}>
<aside className={'sidebar '+(mobile?'show':'')}><div className="brand"><div className="brandmark">T<span>.</span></div><div><b>TANSHU</b><strong>DIGITAL TOOLS</strong><small>ALL IN ONE WORKSPACE</small></div><button className="close-nav" onClick={()=>setMobile(false)}><X size={18}/></button></div>
<div className="workspace-label">{tr('WORKSPACE','वर्कस्पेस')}</div><nav>{side.map(s=><button key={s.id} className={section===s.id?'nav-item active':'nav-item'} onClick={()=>go(s.id)}><s.icon size={18}/><span>{s.label}</span>{section===s.id&&<i/>}</button>)}</nav>
<div className="sidebar-label">{tr('YOUR LIBRARY','आपकी लाइब्रेरी')}</div><button className="nav-item" onClick={()=>go('favorites')}><Star size={18}/><span>{tr('Favorites','पसंदीदा')}</span><small>{favorites.length}</small></button><button className="nav-item" onClick={()=>go('recent')}><Clock3 size={18}/><span>{tr('Recently Used','हाल में इस्तेमाल')}</span></button>
<div className="side-bottom"><div className="secure"><ShieldCheck size={18}/><div><b>{tr('Privacy first','प्राइवेसी पहले')}</b><small>{tr('Your files stay yours','आपकी फाइलें आपकी हैं')}</small></div></div><div className="profile"><div className="avatar">T</div><div><b>TANSHU DIGITAL</b><small>{tr('Workspace preview','वर्कस्पेस प्रीव्यू')}</small></div><span className="online"/></div></div></aside>
<div className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb"><span>{tr('Workspace','वर्कस्पेस')}</span><ChevronRight size={14}/><b>{currentCat?(hi?currentCat.hi:currentCat.en):section==='home'?tr('Overview','ओवरव्यू'):section==='all'?tr('All Categories','सभी कैटेगरी'):section==='favorites'?tr('Favorites','पसंदीदा'):section==='recent'?tr('Recently Used','हाल में इस्तेमाल'):tr('Maker Tools','मेकर टूल्स')}</b></div><div className="top-actions"><div className="language-picker"><button className="language" onClick={()=>setShowLangMenu(v=>!v)}><Languages size={16}/><span>{hi?'हिंदी':'English'}</span><ChevronRight size={13} className={showLangMenu?'lang-chevron open':'lang-chevron'}/></button>{showLangMenu&&<div className="language-menu"><button className={!hi?'chosen':''} onClick={()=>{setLang('en');setShowLangMenu(false)}}><span>🇬🇧</span> English { !hi&&<b>✓</b>}</button><button className={hi?'chosen':''} onClick={()=>{setLang('hi');setShowLangMenu(false)}}><span>🇮🇳</span> हिंदी { hi&&<b>✓</b>}</button></div>}</div><button className="icon-btn" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button><div className="top-avatar">T</div></div></header>
<main><div className="welcome-row"><div><div className="eyebrow"><span className="pulse"/> {tr('YOUR DIGITAL WORKSPACE','आपका डिजिटल वर्कस्पेस')}</div><h1>{section==='home'?<>{tr('EVERYTHING YOU NEED.','आपका हर डिजिटल काम।')} <em>{tr('ALL IN ONE PLACE.','एक ही जगह पर।')}</em></>:currentCat?(hi?currentCat.hi:currentCat.en):tr('EXPLORE YOUR TOOLS','अपने टूल्स देखें')}</h1><p>{tr('A smarter workspace for CSC centers, cyber cafés and everyday digital work.','CSC सेंटर, साइबर कैफे और रोज़मर्रा के डिजिटल काम के लिए स्मार्ट वर्कस्पेस।')}</p></div><div className="date-chip"><Command size={15}/><span>{tr('Made for digital professionals','डिजिटल प्रोफेशनल्स के लिए')}</span></div></div>
<div className="search-wrap"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr('Search tools, makers and categories...','टूल्स, मेकर और कैटेगरी खोजें...')}/><kbd>⌘ K</kbd></div>
{section==='home'||section==='maker'?<><div className="section-head"><div><div className="eyebrow">{tr('START CREATING','बनाना शुरू करें')}</div><h2>{tr('Instant Maker Tools','इंस्टेंट मेकर टूल्स')} <span className="count">08</span></h2><p>{tr('Your most useful creation tools, right at your fingertips.','आपके सबसे उपयोगी क्रिएशन टूल्स, बस एक क्लिक दूर।')}</p></div><button className="text-link" onClick={()=>go('maker')}>{tr('View all makers','सभी मेकर देखें')} <ArrowUpRight size={16}/></button></div>
<div className="maker-grid">{makers.filter(m=>(m.en+' '+m.hi+' '+m.sub).toLowerCase().includes(query.toLowerCase())).map((m,i)=><article className={'maker-card maker-'+i} key={m.en} onClick={()=>soon(m.en)}><div className="maker-top"><div className="tool-icon"><m.icon size={20}/></div>{m.tag&&<span className="tag">{m.tag}</span>}<button className={'fav '+(favorites.includes(m.en)?'saved':'')} onClick={e=>{e.stopPropagation();toggleFav(m.en)}}><Star size={16} fill={favorites.includes(m.en)?'currentColor':'none'}/></button></div><h3>{tr(m.en,m.hi)}</h3><p>{m.sub}</p><div className="card-foot"><span>{tr('Explore maker','मेकर खोलें')}</span><span className="arrow"><ArrowUpRight size={16}/></span></div></article>)}</div>
<div className="quick-panels"><article className="feature-panel csc-panel" onClick={()=>go('csc')}><div className="feature-icon"><Landmark/></div><div><span>{tr('SERVICE WORKSPACE','सर्विस वर्कस्पेस')}</span><h3>CSC CENTER TOOLS</h3><p>{tr('Application prep, document resize, service desk and more.','एप्लीकेशन तैयारी, डॉक्यूमेंट रिसाइज़ और सर्विस डेस्क।')}</p><b>{tr('Open workspace','वर्कस्पेस खोलें')} <ArrowUpRight size={15}/></b></div><div className="panel-glow"/><div className="scene-art csc-scene" aria-hidden="true"><div className="scene-window"><div className="scene-top"><i/><i/><i/></div><div className="scene-person"><span/><b/><i/></div><div className="scene-screen"><span/><span/><span/><strong>CSC</strong></div><div className="scene-paper"><i/><i/><i/><b/></div></div><div className="scene-caption">APPLICATION DESK <span>LIVE WORKFLOW</span></div></div></article><article className="feature-panel cyber-panel" onClick={()=>go('cyber')}><div className="feature-icon"><Globe2/></div><div><span>{tr('BUSINESS WORKSPACE','बिज़नेस वर्कस्पेस')}</span><h3>CYBER CAFE TOOLS</h3><p>{tr('Customer jobs, typing, scan, print and billing workflows.','कस्टमर जॉब, टाइपिंग, स्कैन, प्रिंट और बिलिंग।')}</p><b>{tr('Open workspace','वर्कस्पेस खोलें')} <ArrowUpRight size={15}/></b></div><div className="panel-glow"/><div className="scene-art cyber-scene" aria-hidden="true"><div className="scene-window"><div className="scene-top"><i/><i/><i/></div><div className="scene-monitor"><div className="monitor-screen"><span/><span/><span/><b>PRINT READY</b></div><i/></div><div className="scene-keyboard"/><div className="scene-writing"><div className="writing-lines"><i/><i/><i/><i/></div><span className="pencil"/></div></div><div className="scene-caption">CUSTOMER WORKSTATION <span>DESK READY</span></div></div></article></div>
</>:null}
{(section==='all'||section==='home'||section==='csc'||section==='cyber')&&<><div className="section-head category-heading"><div><div className="eyebrow">{tr('BUILT AROUND YOUR WORK','आपके काम के अनुसार')}</div><h2>{tr('Explore categories','कैटेगरी एक्सप्लोर करें')}</h2><p>{tr('Everything organized. Find the right tool without the clutter.','हर टूल सही जगह पर—बिना किसी उलझन के।')}</p></div><span className="muted-count">15 {tr('CATEGORIES','कैटेगरी')}</span></div><div className="category-grid">{categories.filter(c=>(section==='csc'?c.id==='csc':section==='cyber'?c.id==='cyber':true)&&((c.en+' '+c.hi+' '+c.desc).toLowerCase().includes(query.toLowerCase()))).map(c=><button className="category-card" key={c.id} onClick={()=>go(c.id)}><div className={'category-icon '+c.id}><c.icon size={20}/></div><div className="category-copy"><b>{hi?c.hi:c.en}</b><small>{c.desc}</small></div><span className="category-count">{c.count}</span><ChevronRight className="cat-arrow" size={16}/></button>)}</div></>}
{(currentCat || section === 'favorites' || section === 'recent') && (
  <>
    <div className="section-head tools-heading">
      <div>
        <div className="eyebrow">{tr('TOOL DIRECTORY','टूल डायरेक्टरी')}</div>
        <h2>{section === 'favorites' ? tr('Your favorites','आपके पसंदीदा') : section === 'recent' ? tr('Recently used','हाल में इस्तेमाल') : tr('Available tools & workflows','उपलब्ध टूल्स और वर्कफ़्लो')}</h2>
        <p>{tr('Tools are being added in planned phases.','टूल्स को चरणबद्ध तरीके से जोड़ा जा रहा है।')}</p>
      </div>
    </div>
    <div className="tool-list">
      {directoryTools.map((t) => (
        <div className="tool-row" key={t[1]}>
          <div className="tool-icon">{createElement(t[4] as any, { size: 19 })}</div>
          <div className="tool-info"><b>{hi ? t[2] : t[1]}</b><small>{t[3]}</small></div>
          <span className="coming">{tr('COMING SOON','जल्द आ रहा है')}</span>
          <button className="fav" onClick={() => toggleFav(t[1])}><Star size={16} fill={favorites.includes(t[1]) ? 'currentColor' : 'none'} /></button>
        </div>
      ))}
    </div>
  </>
)}
{query.length > 0 && (
  <div className="search-results">
    <div className="eyebrow">{tr('SEARCH RESULTS','सर्च रिज़ल्ट')}</div>
    <h2>{filtered.length} {tr('matching tools','मिलते-जुलते टूल')}</h2>
    {filtered.map((t) => (
      <div className="tool-row" key={t[1]}>
        <div className="tool-icon">{createElement(t[4] as any, { size: 18 })}</div>
        <div className="tool-info"><b>{hi ? t[2] : t[1]}</b><small>{t[3]}</small></div>
        <span className="coming">{tr('COMING SOON','जल्द आ रहा है')}</span>
      </div>
    ))}
  </div>
)}
<footer><span>© 2026 <b>TANSHU DIGITAL TOOLS</b></span><span>{tr('ALL IN ONE DIGITAL WORKSPACE','हर डिजिटल काम, एक ही जगह।')}</span><span className="footer-safe"><ShieldCheck size={14}/> {tr('Privacy-conscious by design','प्राइवेसी का ध्यान')}</span></footer>
</main></div><nav className="mobile-bottom">{[{id:'home',icon:Home,label:tr('Home','होम')},{id:'maker',icon:Sparkles,label:tr('Makers','मेकर')},{id:'all',icon:Grid2X2,label:tr('Explore','एक्सप्लोर')},{id:'favorites',icon:Star,label:tr('Saved','सेव्ड')}].map(n=><button key={n.id} className={section===n.id?'selected':''} onClick={()=>go(n.id)}><n.icon size={19}/><small>{n.label}</small></button>)}</nav></div>
}