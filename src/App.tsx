import {createElement,useEffect,useMemo,useRef,useState} from 'react';
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
{ id:'recordform',en:'ALL SOFT RECORD & FORM',hi:'ऑल सॉफ्ट रिकॉर्ड एवं फॉर्म',desc:'Shop records, customer forms, payment receipts and online service assistance',icon:Briefcase,count:0 },
{ id:'education',en:'EDUCATION & EXAM DESK',hi:'एजुकेशन और एग्जाम डेस्क',desc:'Student and school document workflows',icon:GraduationCap,count:9 },
{ id:'typing',en:'TYPING & CAREER',hi:'टाइपिंग और करियर',desc:'Typing utilities, resume and applications',icon:Keyboard,count:11 },
{ id:'qr',en:'QR & BARCODE TOOLS',hi:'QR और बारकोड टूल्स',desc:'Create practical codes and labels',icon:QrCode,count:7 },
{ id:'utility',en:'UTILITY & FILE TOOLS',hi:'यूटिलिटी और फाइल टूल्स',desc:'Useful everyday file helpers',icon:Wrench,count:14 },
{ id:'banking',en:'BANKING UTILITIES',hi:'बैंकिंग यूटिलिटी',desc:'Reference tools and quick calculations',icon:ShieldCheck,count:6 },
{ id:'govt',en:'GOVT PORTAL QUICK ACCESS',hi:'सरकारी पोर्टल क्विक एक्सेस',desc:'Shortcuts to official public services',icon:Globe2,count:10 },
{ id:'graphics',en:'BANNER & GRAPHIC DESIGN STUDIO',hi:'बैनर और ग्राफिक डिजाइन स्टूडियो',desc:'Flex banners, posters, pamphlets and shop creatives',icon:Image,count:18 },
{ id:'stamp',en:'STAMP & SEAL DESIGNER',hi:'मोहर और सील डिजाइनर',desc:'Authorised business stamps and office seals',icon:ShieldCheck,count:6 },
{ id:'image',en:'IMAGE EDITING & AI TOOLS',hi:'इमेज एडिटिंग और AI टूल्स',desc:'Background removal, cleanup, enhancement and crop',icon:Sparkles,count:16 },
{ id:'portrait',en:'PORTRAIT & BEAUTY STUDIO',hi:'पोर्ट्रेट और ब्यूटी स्टूडियो',desc:'Portrait retouch, skin tone, HD face and beauty adjustments',icon:Heart,count:0 },
{ id:'idprint',en:'GOVERNMENT ID CROP & PRINT',hi:'सरकारी ID क्रॉप और प्रिंट',desc:'Prepare user-provided cards for personal printing',icon:CreditCard,count:12 },
{ id:'forms',en:'FORMS, LETTERS & LOCAL UTILITIES',hi:'फॉर्म, पत्र और स्थानीय यूटिलिटी',desc:'Application templates, calculators and service helpers',icon:FileText,count:16 },
{ id:'web',en:'WEB, SOCIAL & DIGITAL CREATOR TOOLS',hi:'वेब, सोशल और डिजिटल क्रिएटर टूल्स',desc:'QR, social creatives, thumbnails and web utilities',icon:Globe2,count:12 },
{ id:'finance',en:'FINANCE & CALCULATORS',hi:'फाइनेंस और कैलकुलेटर',desc:'Salary, savings, tax, loan and everyday calculations',icon:Landmark,count:12 }
];
const makers=[
{en:'Passport Photo Maker',hi:'पासपोर्ट फोटो मेकर',sub:'Print-ready photo sizes',icon:Image,tag:'MOST USED'},
{en:'PVC Card Maker',hi:'PVC कार्ड मेकर',sub:'Design front and back layouts',icon:CreditCard,tag:'POPULAR'},
{en:'Instant Card Maker',hi:'इंस्टेंट कार्ड मेकर',sub:'ID, student, employee and membership',icon:LayoutDashboard,tag:''},
{en:'Card Cover Maker',hi:'कार्ड कवर मेकर',sub:'Create front & back card artwork',icon:Sparkles,tag:''},
{en:'Photo Sheet Maker',hi:'फोटो शीट मेकर',sub:'Arrange multiple photos on one page',icon:Grid2X2,tag:''},
{en:'Signature Maker',hi:'सिग्नेचर मेकर',sub:'Crop and prepare signature images',icon:Zap,tag:''},
{en:'Visiting Card Maker',hi:'विजिटिंग कार्ड मेकर',sub:'Clean business card designs',icon:Briefcase,tag:''},
{en:'Resume Maker',hi:'रिज्यूमे मेकर',sub:'Professional resume layouts',icon:FileText,tag:''},
{en:'PDF 4 Pages Per Sheet',hi:'PDF एक शीट पर 4 पेज',sub:'Fit four PDF pages on one A4 sheet',icon:Grid2X2,tag:'STUDENT PICK'},
{en:'Photo & Signature Resizer',hi:'फोटो और सिग्नेचर रिसाइज़र',sub:'Prepare form-ready photo and signature',icon:Image,tag:'MOST USED'},
{en:'JPG to PDF Maker',hi:'JPG से PDF मेकर',sub:'Combine photos and scans into PDF',icon:FileText,tag:'POPULAR'},
{en:'PDF Compress & Resize',hi:'PDF कंप्रेस और रिसाइज़',sub:'Reduce size for online applications',icon:Zap,tag:'POPULAR'},
{en:'Hindi PDF Editor',hi:'हिंदी PDF एडिटर',sub:'Edit PDF text and pages with Hindi typing and Devanagari font support',icon:FileText,tag:'NEW'},
{en:'English PDF Editor',hi:'इंग्लिश PDF एडिटर',sub:'Edit PDF text, fonts, pages and layout in English',icon:FileText,tag:'NEW'},
{en:'PDF Merge & Split',hi:'PDF मर्ज और स्प्लिट',sub:'Combine or separate document pages',icon:FolderOpen,tag:''},
{en:'A4 Multiple Photo Sheet',hi:'A4 मल्टीपल फोटो शीट',sub:'Arrange several photos for one print',icon:Printer,tag:''},
{en:'Scan to PDF Maker',hi:'स्कैन से PDF मेकर',sub:'Prepare scanned pages for sharing',icon:ScanLine,tag:''},
{en:'Aadhaar Card Crop & Print',hi:'आधार कार्ड क्रॉप और प्रिंट',sub:'Arrange front and back for personal print',icon:CreditCard,tag:'DAILY USE'},
{en:'PAN Card Crop & Print',hi:'PAN कार्ड क्रॉप और प्रिंट',sub:'Prepare PAN card PDF for wallet-size print',icon:CreditCard,tag:'DAILY USE'},
{en:'WhatsApp Print Editor',hi:'व्हाट्सऐप प्रिंट एडिटर',sub:'Straighten chat images and fit to A4',icon:Printer,tag:'DAILY USE'},
{en:'Background Remover',hi:'बैकग्राउंड रिमूवर',sub:'Remove photo background and export PNG',icon:Image,tag:'POPULAR'},
{en:'Document Perspective Fix',hi:'डॉक्यूमेंट पर्सपेक्टिव फिक्स',sub:'Drag four corners to straighten angled photos',icon:ScanLine,tag:'POPULAR'},
{en:'Rubber Stamp / Seal Designer',hi:'रबर मोहर / सील डिजाइनर',sub:'Create authorised business stamps only',icon:ShieldCheck,tag:'NEW'},
{en:'Exact KB Photo Compressor',hi:'फोटो को तय KB में कंप्रेस करें',sub:'Target 20KB, 50KB, 100KB and custom sizes',icon:Zap,tag:'DAILY USE'},
{en:'Photo Background Changer',hi:'फोटो बैकग्राउंड चेंजर',sub:'Set clean white, blue or custom backgrounds',icon:Sun,tag:''},
{en:'Photo Enhancer & Upscaler',hi:'फोटो एन्हांसर और अपस्केलर',sub:'Improve clarity and enlarge low-resolution photos',icon:Sparkles,tag:''},
{en:'Bulk Photo Cropper',hi:'बल्क फोटो क्रॉपर',sub:'Crop multiple images with consistent dimensions',icon:Grid2X2,tag:''},
{en:'Screenshot Text Editor',hi:'स्क्रीनशॉट टेक्स्ट एडिटर',sub:'Edit or replace text inside screenshots and images',icon:Image,tag:'NEW'},
{en:'Thumb Impression Resizer',hi:'अंगूठे का निशान रिसाइज़र',sub:'Clean and size thumb impressions for forms',icon:ScanLine,tag:'COUNTER USE'},
{en:'Notebook Name Sticker Maker',hi:'कॉपी नाम स्टिकर मेकर',sub:'Create printable labels for school notebooks',icon:GraduationCap,tag:''},
{en:'AI Passport Photo Studio',hi:'AI पासपोर्ट फोटो स्टूडियो',sub:'Prepare studio-style backgrounds and photo sheets',icon:Sparkles,tag:'NEW'},
{en:'Mobile Camera Document Scanner',hi:'मोबाइल कैमरा डॉक्यूमेंट स्कैनर',sub:'Capture, crop and prepare clean document scans',icon:ScanLine,tag:'NEW'},
{en:'Background Swap Studio',hi:'बैकग्राउंड स्वैप स्टूडियो',sub:'Replace a photo background with a new scene',icon:Image,tag:'NEW'},
{en:'Photo Cutout & Selection',hi:'फोटो कटआउट और सिलेक्शन',sub:'Select and cut out people or objects with refined edges',icon:ScanLine,tag:'NEW'},
{en:'Photo Cartoon Maker',hi:'फोटो कार्टून मेकर',sub:'Turn portraits into creative cartoon-style artwork',icon:Sparkles,tag:'NEW'},
{en:'Photo Collage Maker',hi:'फोटो कोलाज मेकर',sub:'Combine multiple photos in stylish layouts',icon:Grid2X2,tag:'POPULAR'},
{en:'Photo Fit & DP Maker',hi:'फोटो फिट और DP मेकर',sub:'Fit small photos into square or portrait layouts with blur fill',icon:Image,tag:'NEW'},
{en:'Photo Border & Frame Studio',hi:'फोटो बॉर्डर और फ्रेम स्टूडियो',sub:'Add clean borders, decorative frames and edge styles',icon:LayoutDashboard,tag:'NEW'},
{en:'Shape Mask & Cutout Studio',hi:'शेप मास्क और कटआउट स्टूडियो',sub:'Mask photos into circles, squares, stars and custom shapes',icon:Grid2X2,tag:'NEW'},
{en:'Photo Adjust & Preset Studio',hi:'फोटो एडजस्ट और प्रीसेट स्टूडियो',sub:'Tune light, colour, tone and apply preset looks',icon:Sun,tag:'NEW'},
{en:'HD Portrait & Skin Tone Studio',hi:'HD पोर्ट्रेट और स्किन टोन स्टूडियो',sub:'Portrait clarity, natural skin tone and face enhancement',icon:Heart,tag:'NEW'},
{en:'AI Photo Expand & Enhance',hi:'AI फोटो एक्सपैंड और एन्हांस',sub:'Extend image canvas and improve photo detail with AI',icon:Sparkles,tag:'NEW'},
{en:'Clone & Object Cleanup',hi:'क्लोन और ऑब्जेक्ट क्लीनअप',sub:'Retouch selected areas and remove distractions',icon:Wrench,tag:''},
{en:'Photo Shapes & Brush Effects',hi:'फोटो शेप्स और ब्रश इफेक्ट्स',sub:'Draw outlines, glow, circles, stars and freehand marks',icon:Sparkles,tag:''}
];
const tools=[
['csc','Aadhaar Card Crop & Print','आधार कार्ड क्रॉप और प्रिंट','Arrange user-provided Aadhaar front and back for personal print',CreditCard],['csc','PAN Card Crop & Print','PAN कार्ड क्रॉप और प्रिंट','Prepare user-provided PAN card for wallet-size print',CreditCard],
 ['photo','Stamp Size Photo Maker','स्टाम्प साइज फोटो मेकर','Ready-to-print photo sizing',Image],['photo','Photo Background Studio','फोटो बैकग्राउंड स्टूडियो','Prepare a clean photo background',Sun],
['pvc','Student ID Card Maker','स्टूडेंट ID कार्ड मेकर','Editable student card layout',CreditCard],['pvc','Employee ID Card Maker','एम्प्लॉयी ID कार्ड मेकर','Workplace identity card design',CreditCard],
['docs','Application & Letter Maker','आवेदन और पत्र मेकर','Draft clean application documents',FileText],['docs','Biodata Maker','बायोडाटा मेकर','Simple personal biodata layouts',FileText],
['pdf','Merge PDF','PDF मर्ज करें','Combine multiple PDF files',FolderOpen],['pdf','Compress PDF','PDF कंप्रेस करें','Reduce PDF file size',Zap],
['pdf','Hindi PDF Editor','हिंदी PDF एडिटर','Edit supported PDF text and pages with Hindi typing, Devanagari fonts and text placement',FileText],
['pdf','English PDF Editor','इंग्लिश PDF एडिटर','Edit supported PDF text, fonts, pages and layout in English',FileText],
['print','A4 Print Layout','A4 प्रिंट लेआउट','Set margins, orientation and scale',Printer],['print','Scan to PDF','स्कैन से PDF','Prepare scanned pages as PDF',ScanLine],
['business','Invoice Maker','इनवॉइस मेकर','Create a simple business invoice',Briefcase],['qr','QR Code Maker','QR कोड मेकर','Create QR codes for useful links',QrCode],
['education','Certificate Template Studio','सर्टिफिकेट टेम्पलेट स्टूडियो','Authorized sample layouts only',GraduationCap],['typing','Hindi Typing Workspace','हिंदी टाइपिंग वर्कस्पेस','A focused bilingual typing area',Keyboard],
['pdf','PDF 4 Pages Per Sheet (4-up)','एक शीट पर PDF के 4 पेज','Place four PDF pages on one A4 sheet; choose reading order and margins',Grid2X2],
['pdf','PDF 2 / 4 / 6 / 9 Pages Per Sheet','PDF 2 / 4 / 6 / 9 पेज प्रति शीट','Save paper with multi-page handout layouts',Printer],
['pdf','Split PDF by Page Range','पेज रेंज से PDF स्प्लिट','Extract selected page ranges',FolderOpen],
['pdf','Delete & Extract PDF Pages','PDF पेज हटाएँ और निकालें','Remove unwanted pages or export selected pages',FileText],
['pdf','Rotate & Reorder PDF','PDF घुमाएँ और क्रम बदलें','Fix orientation and arrange page order',Zap],
['pdf','PDF to JPG / PNG','PDF से JPG / PNG','Export pages as image files',Image],
['pdf','Word to PDF','Word से PDF','Convert documents into print-ready PDF',FileText],
['pdf','PDF to Word / Text','PDF से Word / टेक्स्ट','Extract editable text from supported PDFs',FileText],
['pdf','Add Page Numbers & Watermark','पेज नंबर और वॉटरमार्क','Add page numbering or a text watermark',FileText],
['pdf','Protect PDF with Password','PDF पासवर्ड से सुरक्षित करें','Set a password on your own PDF',ShieldCheck],
['photo','Photo Resize to Exact KB','फोटो को तय KB में रिसाइज़ करें','Prepare image files for application upload',Image],
['photo','Signature Resize to Exact KB','सिग्नेचर को तय KB में रिसाइज़ करें','Resize and optimize signature images',Zap],
['photo','Photo & Signature Joiner','फोटो और सिग्नेचर जोड़ें','Place photo and signature on one canvas',Grid2X2],
['photo','Passport Photo A4 Sheet','पासपोर्ट फोटो A4 शीट','Arrange multiple passport photos for printing',Printer],
['print','A4 / A3 / Legal Print Setup','A4 / A3 / लीगल प्रिंट सेटअप','Set paper size, margins, copies and orientation',Printer],
['print','Multiple Images on One A4','एक A4 पर कई इमेज','Arrange 2, 4, 6 or 8 images on a page',Grid2X2],
['print','PDF Booklet & Duplex Layout','PDF बुकलेट और डुप्लेक्स लेआउट','Prepare booklet and two-sided print order',FileText],
['print','Print Preview & Page Scaling','प्रिंट प्रीव्यू और पेज स्केलिंग','Preview fit, fill and custom scaling',ScanLine],
['docs','Application & Letter Templates','आवेदन और पत्र टेम्पलेट','Hindi and English application drafts',FileText],
['docs','Resume & Biodata Templates','रिज्यूमे और बायोडाटा टेम्पलेट','Create clean career documents',FileText],
['education','Student Notes & Formula Sheet','स्टूडेंट नोट्स और फॉर्मूला शीट','Arrange study notes for compact printing',GraduationCap],
['education','Exam Photo & Signature Prep','एग्जाम फोटो और सिग्नेचर तैयारी','Prepare images to a form specification',Image],
['business','Receipt & Bill Maker','रसीद और बिल मेकर','Create simple customer receipts',Briefcase],
['utility','Image Format Converter','इमेज फॉर्मेट कन्वर्टर','Convert common image formats',Image],
['utility','Image Compressor','इमेज कंप्रेसर','Reduce image file size',Zap],
['qr','QR Code & Barcode Maker','QR कोड और बारकोड मेकर','Create QR codes and simple barcodes',QrCode],
['graphics','Flex Banner Maker','फ्लेक्स बैनर मेकर','Large-format shop, event and service banners',Image],
['graphics','Poster & Pamphlet Designer','पोस्टर और पैम्फलेट डिजाइनर','A4/A3 promotional posters and handbills',Image],
['graphics','Shop Board & Signboard Maker','दुकान बोर्ड और साइनबोर्ड मेकर','Design print-ready shop boards and signs',Image],
['graphics','Social Media Post Maker','सोशल मीडिया पोस्ट मेकर','Square posts, stories and WhatsApp status',Image],
['graphics','YouTube Thumbnail Maker','YouTube थंबनेल मेकर','Create channel thumbnails and cover art',Image],
['graphics','Wedding & Invitation Card Maker','शादी और निमंत्रण कार्ड मेकर','Invitation, birthday and event card layouts',Heart],
['graphics','Letterhead & Envelope Designer','लेटरहेड और लिफाफा डिजाइनर','Business letterheads and envelope layouts',FileText],
['graphics','Logo & Brand Kit Maker','लोगो और ब्रांड किट मेकर','Basic logos, colours and brand assets',Sparkles],
['graphics','Flex Banner Size & DPI Calculator','फ्लेक्स बैनर साइज और DPI कैलकुलेटर','Calculate print dimensions and resolution',Grid2X2],
['stamp','Round Rubber Stamp Maker','गोल रबर मोहर मेकर','Curved text and transparent PNG for authorised use',ShieldCheck],
['stamp','Rectangle Stamp Maker','आयताकार मोहर मेकर','Business name, address and registration layout',ShieldCheck],
['stamp','Oval Stamp Maker','ओवल मोहर मेकर','Oval authorised business seal design',ShieldCheck],
['stamp','Digital Stamp & Watermark','डिजिटल स्टाम्प और वॉटरमार्क','Add a clearly labelled business watermark',ShieldCheck],
['image','AI Background Remover','AI बैकग्राउंड रिमूवर','Remove photo background and keep transparent edges',Image],
['image','White / Blue Background Maker','सफेद / नीला बैकग्राउंड मेकर','Create common application photo backgrounds',Image],
['image','Object & Spot Remover','ऑब्जेक्ट और स्पॉट रिमूवर','Clean unwanted objects from permitted images',Sparkles],
['image','Photo Retouch & Blemish Fix','फोटो रीटच और ब्लेमिश फिक्स','Basic portrait cleanup and skin blemish correction',Image],
['image','Old Photo Restore & Colourize','पुरानी फोटो रिस्टोर और कलराइज','Restore faded photos and add colour',Sun],
['image','Image Upscaler & Sharpener','इमेज अपस्केलर और शार्पनर','Enlarge and sharpen low-resolution images',Sparkles],
['image','Perspective Crop & Document Flatten','पर्सपेक्टिव क्रॉप और डॉक्यूमेंट फ्लैटन','Four-corner crop and perspective correction',ScanLine],
['image','Photo Deskew & Auto Straighten','फोटो डेस्क्यू और ऑटो स्ट्रेटन','Straighten tilted scans and photographs',ScanLine],
['image','Bulk Image Crop & Resize','बल्क इमेज क्रॉप और रिसाइज़','Process a batch with the same dimensions',Grid2X2],
['image','Image Watermark & Text Overlay','इमेज वॉटरमार्क और टेक्स्ट ओवरले','Add authorised text, logo and date overlays',FileText],
['image','Screenshot Text Editor','स्क्रीनशॉट टेक्स्ट एडिटर','Edit, cover, replace and add text in screenshots and images while preserving the visual layout',Image],
['image','Swap Photo Background','फोटो बैकग्राउंड स्वैप करें','Replace the existing background with a selected scene or image',Image],
['image','Fix Blurry Photo','धुंधली फोटो ठीक करें','Improve sharpness and clarity of soft or blurry photos',Sparkles],
['image','Photo to Cartoon','फोटो से कार्टून बनाएं','Create a cartoon-style version of a selected photo',Sparkles],
['image','Photo Collage Maker','फोटो कोलाज मेकर','Combine multiple photos using ready-made collage layouts',Grid2X2],
['image','Smart Cutout — Person & Object','स्मार्ट कटआउट — व्यक्ति और ऑब्जेक्ट','Select a person or object and create a refined transparent cutout',ScanLine],
['image','Photo Fit & DP Background','फोटो फिट और DP बैकग्राउंड','Fit small photos into DP layouts with blur, solid or matching backgrounds',Image],
['image','Photo Border Maker','फोटो बॉर्डर मेकर','Add adjustable colour, width, rounded or decorative photo borders',LayoutDashboard],
['image','Shape Mask Studio','शेप मास्क स्टूडियो','Mask images into circles, squares, stars, triangles and custom shapes',Grid2X2],
['image','Photo Frame Studio','फोटो फ्रेम स्टूडियो','Add portrait, event and decorative photo frames',Image],
['image','Photo Clone & Object Cleanup','फोटो क्लोन और ऑब्जेक्ट क्लीनअप','Clone selected areas and retouch unwanted distractions',Wrench],
['image','Dispersion Effect Studio','डिस्पर्शन इफेक्ट स्टूडियो','Create a directional particle-dispersion effect from a photo',Sparkles],
['image','Photo Perspective & Tilt Shift','फोटो पर्सपेक्टिव और टिल्ट शिफ्ट','Correct perspective or create selective-focus tilt-shift effects',ScanLine],
['image','Photo Flip & Rotate','फोटो फ्लिप और रोटेट','Flip horizontally or vertically and rotate by custom angles',Image],
['image','AI Photo Expand','AI फोटो एक्सपैंड','Extend the canvas and generate matching image surroundings',Sparkles],
['image','AI Photo Enhance','AI फोटो एन्हांस','Improve detail, clarity, resolution and overall image quality',Sparkles],
['image','Photo Selection & Brush Tools','फोटो सिलेक्शन और ब्रश टूल्स','Select areas and refine them with brush, outline and shape tools',ScanLine],
['image','Photo Adjust & Colour Controls','फोटो एडजस्ट और कलर कंट्रोल','Adjust exposure, brightness, contrast, highlights, shadows and colour',Sun],
['image','Photo Presets & Filters','फोटो प्रीसेट और फिल्टर','Apply editable colour presets and creative filter looks',Sun],
['image','Photo Shape & Glow Effects','फोटो शेप और ग्लो इफेक्ट्स','Add circle, square, star, triangle, outline and glow effects',Sparkles],
['portrait','HD Portrait Enhancer','HD पोर्ट्रेट एन्हांसर','Improve portrait detail while keeping a natural appearance',Heart],
['portrait','Skin Tone & Colour Studio','स्किन टोन और कलर स्टूडियो','Refine skin tone and portrait colour with adjustable controls',Sun],
['portrait','Portrait Retouch Studio','पोर्ट्रेट रीटच स्टूडियो','Retouch portraits with blemish, tone and detail controls',Image],
['portrait','Face & Beauty Adjustments','फेस और ब्यूटी एडजस्टमेंट','Fine-tune portrait appearance with subtle adjustable effects',Sparkles],
['idprint','e-Aadhaar Front & Back Print','ई-आधार फ्रंट और बैक प्रिंट','Arrange user-provided e-Aadhaar pages for print',CreditCard],
['idprint','e-PAN Card Crop & Print','ई-PAN कार्ड क्रॉप और प्रिंट','Crop front and back from user-provided PDF',CreditCard],
['idprint','Voter ID Crop & Print','वोटर ID क्रॉप और प्रिंट','Prepare user-provided voter card for print',CreditCard],
['idprint','Driving Licence Crop & Print','ड्राइविंग लाइसेंस क्रॉप और प्रिंट','Prepare a personal DL copy for printing',CreditCard],
['idprint','Ayushman Card Print Layout','आयुष्मान कार्ड प्रिंट लेआउट','Arrange user-provided card for personal print',CreditCard],
['idprint','ID Card Front & Back to A4','ID कार्ड फ्रंट और बैक A4 पर','Place both sides accurately on one A4 sheet',Printer],
['idprint','Aadhaar Masking Tool','आधार मास्किंग टूल','Hide sensitive Aadhaar digits before sharing',ShieldCheck],
['forms','Age & Date Calculator','उम्र और तारीख कैलकुलेटर','Calculate age, date difference and deadlines',Clock3],
['forms','Percentage & Marks Calculator','प्रतिशत और अंक कैलकुलेटर','Student marks, percentage and grade helper',GraduationCap],
['forms','GST & Invoice Calculator','GST और इनवॉइस कैलकुलेटर','Calculate tax-inclusive and tax-exclusive totals',Briefcase],
['forms','EMI & Interest Calculator','EMI और ब्याज कैलकुलेटर','Basic loan instalment estimates',Landmark],
['forms','Bihar Land Measurement Calculator','बिहार भूमि माप कैलकुलेटर','Common local land-unit conversions',Grid2X2],
['forms','Hindi Application & Affidavit Drafts','हिंदी आवेदन और शपथपत्र ड्राफ्ट','Editable general-purpose document templates',FileText],
['forms','Typing Test & Speed Calculator','टाइपिंग टेस्ट और स्पीड कैलकुलेटर','Practice and calculate typing speed',Keyboard],
['forms','Name, Date & Photo Label Maker','नाम, तारीख और फोटो लेबल मेकर','Create labels for documents and print jobs',FileText],
['web','UPI QR Code Maker','UPI QR कोड मेकर','Create a QR from user-entered payment details',QrCode],
['web','Barcode & Product Label Maker','बारकोड और प्रोडक्ट लेबल मेकर','Create labels and standard barcodes',QrCode],
['web','Favicon & App Icon Generator','फेविकॉन और ऐप आइकन जनरेटर','Prepare icons in common sizes',Image],
['web','Website Screenshot & Page to PDF','वेबसाइट स्क्रीनशॉट और PDF','Save accessible pages as print-ready PDFs',Globe2],
['business','Salary Slip Generator','सैलरी स्लिप जनरेटर','Prepare a clear monthly salary statement for authorised records',Briefcase],
['typing','Cover Letter Builder','कवर लेटर बिल्डर','Create a role-specific job application letter',FileText],
['education','Admit Card & Hall Ticket Organizer','एडमिट कार्ड और हॉल टिकट मैनेजर','Organize and print candidate admit-card details',GraduationCap],
['education','Question Paper Builder','प्रश्न-पत्र निर्माता','Arrange questions, marks and sections into a printable paper',FileText],
['education','CGPA & GPA Calculator','CGPA और GPA कैलकुलेटर','Convert grades and calculate semester averages',GraduationCap],
['finance','Gold & Silver Rate Calculator','सोना और चाँदी कैलकुलेटर','Estimate metal value by weight, purity and entered rate',Landmark],
['education','MPESB Exam Form & Document Helper','MPESB परीक्षा फॉर्म और डॉक्यूमेंट हेल्पर','Organize application details and supporting documents for MP exams',FileText],
['photo','PAN Application Photo & Signature Presets','PAN आवेदन फोटो और सिग्नेचर प्रीसेट','Prepare photo and signature files to selected PAN form specifications',Image],
['web','WhatsApp Media & Print Toolkit','व्हाट्सऐप मीडिया और प्रिंट टूलकिट','Prepare customer-shared images and documents for printing',Printer],
['graphics','Notebook Name Sticker Designer','कॉपी नाम स्टिकर डिजाइनर','Create school notebook labels with name, class and subject',GraduationCap],
['stamp','Stamp Paper Document Formatter','स्टाम्प पेपर डॉक्यूमेंट फॉर्मेटर','Format user-provided legal text for authorised stamp-paper use; does not issue e-stamps',FileText],
['pvc','Multi ID Card Sheet Printer','मल्टी ID कार्ड शीट प्रिंटर','Arrange multiple authorised ID cards on one print sheet',CreditCard],
['idprint','Farmer ID Front & Back Print Layout','किसान ID फ्रंट और बैक प्रिंट लेआउट','Arrange a user-provided farmer card for personal printing',CreditCard],
['photo','Thumb Impression Resizer','अंगूठे का निशान रिसाइज़र','Crop, clean and resize thumb impressions for form uploads',ScanLine],
['photo','AI Passport Photo Lab','AI पासपोर्ट फोटो लैब','Prepare portrait lighting, background and standard photo layouts',Sparkles],
['docs','Agreement Format & Draft Builder','एग्रीमेंट फॉर्मेट और ड्राफ्ट बिल्डर','Create editable general agreement drafts for review',FileText],
['docs','Bank Application Letter Maker','बैंक आवेदन पत्र मेकर','Prepare common bank request and service letters',FileText],
['docs','AI Biodata Draft Assistant','AI बायोडाटा ड्राफ्ट असिस्टेंट','Turn supplied details into a polished biodata draft',Sparkles],
['graphics','AI Invitation Card Studio','AI निमंत्रण कार्ड स्टूडियो','Create original invitation concepts for personal events',Sparkles],
['graphics','AI Poster Concept Studio','AI पोस्टर कॉन्सेप्ट स्टूडियो','Generate original poster concepts and editable layouts',Sparkles],
['print','Mobile Camera Document Scanner','मोबाइल कैमरा डॉक्यूमेंट स्कैनर','Capture pages, adjust corners and export clean scans',ScanLine],
['pdf','ID Card to PDF Print Maker','ID कार्ड से PDF प्रिंट मेकर','Place authorised card images into a print-ready PDF',FileText],
['business','CSC Service Rate List Maker','CSC सर्विस रेट लिस्ट मेकर','Create a clear service and price list for your own centre',Briefcase],
['docs','Mini Document Album Builder','मिनी डॉक्यूमेंट एल्बम बिल्डर','Combine selected document images into an organized mini album',FolderOpen],
['pvc','ID Card Album Cover Designer','ID कार्ड एल्बम कवर डिजाइनर','Design a cover page for customer ID-card print collections',CreditCard],
['pvc','Epson PVC Card Print Setup','Epson PVC कार्ड प्रिंट सेटअप','Prepare CR80 card artwork and printer-alignment sheets',Printer],
['print','Smart CSC Scan & Clean Studio','स्मार्ट CSC स्कैन और क्लीन स्टूडियो','Capture, deskew, clean and organize counter documents',ScanLine],
['photo','Passport Photo Join & Sheet Composer','पासपोर्ट फोटो जॉइन और शीट कंपोज़र','Combine selected portraits into a standard print sheet',Image],
['photo','AI Family Portrait Composer','AI फैमिली पोर्ट्रेट कंपोज़र','Create a family portrait composition from consented photos',Heart],
['finance','Salary, Tax & Deduction Calculator','सैलरी, टैक्स और कटौती कैलकुलेटर','Estimate take-home pay from entered salary components',Landmark],
['finance','Savings & Interest Calculator','बचत और ब्याज कैलकुलेटर','Estimate simple and compound interest over time',Landmark],
['finance','Gold Purity & Making Charge Calculator','सोने की शुद्धता और मेकिंग चार्ज कैलकुलेटर','Estimate jewellery cost from purity, weight and charges',Landmark],
['finance','Silver Purity & Value Calculator','चाँदी की शुद्धता और कीमत कैलकुलेटर','Estimate silver value from weight, purity and entered rate',Landmark],

['govt','Aadhaar Official Portal','आधार आधिकारिक पोर्टल','Open the official UIDAI service portal',Globe2],
['govt','PAN / Income Tax Portal','PAN / इनकम टैक्स पोर्टल','Open official Income Tax and PAN services',Globe2],
['govt','Voter Services Portal','वोटर सेवा पोर्टल','Open official voter registration and services',Globe2],
['govt','DigiLocker Portal','डिजिलॉकर पोर्टल','Access the official DigiLocker service',Globe2],
['govt','Ayushman Bharat Portal','आयुष्मान भारत पोर्टल','Open official Ayushman Bharat services',Globe2],
['govt','Bihar RTPS Service Portal','बिहार RTPS सेवा पोर्टल','Open Bihar online public service applications',Globe2],
['govt','EPFO Member Portal','EPFO मेंबर पोर्टल','Open official EPFO member services',Globe2],
['govt','Passport Seva Portal','पासपोर्ट सेवा पोर्टल','Open official Passport Seva services',Globe2],
['govt','Driving Licence / Sarathi Portal','ड्राइविंग लाइसेंस / सारथी पोर्टल','Open official Parivahan Sarathi services',Globe2],
['govt','UMANG Government Services','उमंग सरकारी सेवाएँ','Open the official UMANG services platform',Globe2],
['pdf','JPG / PNG to PDF Maker','JPG / PNG से PDF मेकर','Combine image files into a PDF document',FileText],
['pdf','PDF Page Crop & Margins','PDF पेज क्रॉप और मार्जिन','Adjust page boundaries and print margins',FileText],
['pdf','PDF Metadata Viewer','PDF मेटाडेटा व्यूअर','Inspect basic metadata in your PDF files',FileText],
['pdf','PDF Image Extractor','PDF इमेज एक्सट्रैक्टर','Extract embedded images from supported PDFs',Image],
['pdf','PDF Text Extractor','PDF टेक्स्ट एक्सट्रैक्टर','Extract selectable text from PDF documents',FileText],
['pdf','PDF Page Labels & Bookmarks','PDF पेज लेबल और बुकमार्क','Organize long PDFs with page labels and bookmarks',FolderOpen],
['pdf','PDF Compare & Page Checker','PDF तुलना और पेज चेकर','Compare page counts and document structure',FileText]
] as const;

function DemoThumb({title}:{title:string}){
 const n=title.toLowerCase();
 const kind=/background|remove|transparent/.test(n)?'remove':/passport|photo|portrait|family|signature|thumb|image|crop|resize|enhance|upscal|retouch/.test(n)?'photo':/aadhaar|pan card|voter|driving|id card|pvc|card|farmer/.test(n)?'card':/pdf|document|scan|letter|application|resume|biodata|certificate|admit|question|agreement|stamp paper/.test(n)?'doc':/banner|poster|pamphlet|logo|social|youtube|invitation|visiting|sticker|design|graphic/.test(n)?'design':/calculator|salary|interest|gold|silver|gst|emi|percentage|age|date|rate|tax/.test(n)?'calc':/qr|barcode/.test(n)?'qr':/stamp|seal/.test(n)?'stamp':/print|sheet|layout|compress|convert|merge|split|watermark/.test(n)?'print':'utility';
 return <div className={'demo-thumb demo-'+kind} aria-label={title+' demo thumbnail'}>
  <svg viewBox="0 0 120 76" role="img" aria-hidden="true">
   <defs><linearGradient id="thbg" x2="1" y2="1"><stop stopColor="#eff6f0"/><stop offset="1" stopColor="#cbded0"/></linearGradient><linearGradient id="thgreen" x2="1" y2="1"><stop stopColor="#17452f"/><stop offset="1" stopColor="#5b8967"/></linearGradient></defs>
   <rect width="120" height="76" rx="10" fill="url(#thbg)"/>
   {kind==='remove'?<><rect x="0" y="0" width="60" height="76" fill="#d9c9b5"/><path d="M0 13h60M0 27h60M0 41h60M0 55h60" stroke="#c5b39e" strokeWidth="1.5"/><path d="M60 0h60v76H60z" fill="#f7fbf8"/>{Array.from({length:6},(_,i)=><rect key={i} x={60+(i%2)*15} y={Math.floor(i/2)*19} width="15" height="19" fill={i%2?'#dce9df':'#f8fcf9'}/>)}<path d="M60 0v76" stroke="#fff" strokeWidth="2"/><circle cx="60" cy="26" r="11" fill="#b87955"/><path d="M43 69q1-28 17-28t17 28" fill="#244b38"/><path d="M60 15v53" stroke="#fff" strokeDasharray="2 2" strokeWidth="1.5"/><path d="M55 8l5 5 5-5" fill="none" stroke="#fff" strokeWidth="2"/></>:
   kind==='photo'?<><rect x="12" y="8" width="96" height="60" rx="6" fill="#fff" stroke="#a9c5b0"/><circle cx="60" cy="29" r="12" fill="#c98b68"/><path d="M40 65q2-25 20-25t20 25" fill="url(#thgreen)"/><rect x="16" y="12" width="88" height="52" rx="4" fill="none" stroke="#d7b66d" strokeDasharray="3 3"/></>:
   kind==='card'?<><rect x="16" y="9" width="88" height="58" rx="7" fill="#fff" stroke="#b4c9b8"/><rect x="16" y="9" width="88" height="13" rx="6" fill="url(#thgreen)"/><circle cx="37" cy="42" r="10" fill="#d4a080"/><path d="M25 59q1-13 12-13t12 13" fill="#416d50"/><path d="M57 34h35M57 43h28M57 52h32" stroke="#9ab2a0" strokeWidth="3" strokeLinecap="round"/><path d="M60 9v58" stroke="#e4e9e4" strokeDasharray="2 3"/></>:
   kind==='doc'?<><path d="M34 7h39l17 17v45H34z" fill="#fff" stroke="#a9c3ae"/><path d="M73 7v17h17" fill="#e6f0e8" stroke="#a9c3ae"/><path d="M45 34h33M45 42h33M45 50h25M45 58h29" stroke="#9eb6a4" strokeWidth="3" strokeLinecap="round"/><rect x="12" y="50" width="24" height="17" rx="4" fill="url(#thgreen)"/><path d="M18 58h12" stroke="#fff" strokeWidth="2"/></>:
   kind==='design'?<><rect x="10" y="9" width="100" height="58" rx="5" fill="#fff" stroke="#abc4b0"/><rect x="15" y="14" width="90" height="48" rx="3" fill="url(#thgreen)"/><circle cx="85" cy="27" r="12" fill="#d8b66d"/><path d="M22 49l20-20 16 13 13-10 25 19z" fill="#e9f1e8"/><path d="M23 21h34M23 27h23" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></>:
   kind==='calc'?<><rect x="36" y="5" width="48" height="66" rx="7" fill="#fff" stroke="#9fb9a5" strokeWidth="2"/><rect x="43" y="12" width="34" height="14" rx="3" fill="#dceade"/><path d="M48 19h23" stroke="#315f43" strokeWidth="2"/>{Array.from({length:9},(_,i)=><rect key={i} x={44+(i%3)*12} y={32+Math.floor(i/3)*11} width="8" height="7" rx="2" fill={i===8?'#d7b66d':'#d8e5da'}/>)}</>:
   kind==='qr'?<><rect x="27" y="7" width="66" height="62" rx="5" fill="#fff" stroke="#a9c3ae"/>{[0,1,2].map((v)=><g key={v}><rect x={34+(v===1?36:0)} y={14+(v===2?34:0)} width="18" height="18" fill="none" stroke="#28553b" strokeWidth="4"/><rect x={40+(v===1?36:0)} y={20+(v===2?34:0)} width="6" height="6" fill="#28553b"/></g>)}<path d="M58 18h8v8h-8zM58 36h8v8h-8zM72 49h8v8h-8z" fill="#28553b"/></>:
   kind==='stamp'?<><circle cx="60" cy="38" r="26" fill="#fff" stroke="#a77e35" strokeWidth="3"/><circle cx="60" cy="38" r="20" fill="none" stroke="#a77e35" strokeWidth="1.5"/><path d="M45 38h30M50 32h20M50 44h20" stroke="#315f43" strokeWidth="2"/><path d="M49 9h22l-4 8H53z" fill="#d7b66d"/></>:
   kind==='print'?<><rect x="28" y="7" width="64" height="43" rx="4" fill="#fff" stroke="#9eb8a3"/><path d="M39 18h42M39 25h42M39 32h28" stroke="#b3c8b7" strokeWidth="3"/><rect x="20" y="39" width="80" height="25" rx="5" fill="url(#thgreen)"/><path d="M37 47h46v10H37z" fill="#fff"/><path d="M44 51h32" stroke="#9ab39f" strokeWidth="2"/></>:
   <><rect x="17" y="10" width="86" height="56" rx="7" fill="#fff" stroke="#a9c3ae"/><path d="M28 49l15-20 12 12 13-18 25 27z" fill="#d7e8da"/><circle cx="81" cy="24" r="7" fill="#d7b66d"/><path d="M28 57h64" stroke="#a7bdaa" strokeWidth="2"/></>}
  </svg>
 </div>;
}

export default function App(){
const [intro,setIntro]=useState(true); const navStack=useRef<string[]>(['home']); const [lang,setLang]=useState<Lang>('en'); const [query,setQuery]=useState(''); const [section,setSection]=useState('home'); const [favorites,setFavorites]=useState<string[]>([]); const [recent,setRecent]=useState<string[]>([]); const [mobile,setMobile]=useState(false); const [dark,setDark]=useState(false); const [showLangMenu,setShowLangMenu]=useState(false); const [pendingTool,setPendingTool]=useState<{name:string;hiName:string;desc:string}|null>(null); const [openedTool,setOpenedTool]=useState<{name:string;hiName:string;desc:string}|null>(null); const [recordStep,setRecordStep]=useState(0); const [recordBusiness,setRecordBusiness]=useState('Mobile / Electronics Repair'); const [recordCustomer,setRecordCustomer]=useState(''); const [recordPhone,setRecordPhone]=useState(''); const [recordItem,setRecordItem]=useState(''); const [recordWork,setRecordWork]=useState(''); const [recordAmount,setRecordAmount]=useState(''); const [recordPaid,setRecordPaid]=useState(''); const [recordMode,setRecordMode]=useState('UPI'); const [recordTxn,setRecordTxn]=useState(''); const [recordDue,setRecordDue]=useState(''); const [recordPhoto,setRecordPhoto]=useState(''); const [recordSignature,setRecordSignature]=useState(''); const [recordConsent,setRecordConsent]=useState(false);
useEffect(()=>{const timer=window.setTimeout(()=>setIntro(false),2300);return()=>window.clearTimeout(timer);},[]); useEffect(()=>{window.history.replaceState({tanshuApp:true,section:'home'},'',window.location.pathname+'#home');},[]); useEffect(()=>{const handlePop=()=>{if(openedTool){setOpenedTool(null);}else if(pendingTool){setPendingTool(null);}else if(mobile){setMobile(false);}else if(navStack.current.length>1){const previous=navStack.current.pop()||'home';setSection(previous);}else{setSection('home');}window.history.pushState({tanshuApp:true,section:navStack.current[navStack.current.length-1]||'home'},'',window.location.pathname+'#'+(navStack.current[navStack.current.length-1]||'home'));};window.addEventListener('popstate',handlePop);return()=>window.removeEventListener('popstate',handlePop);},[openedTool,pendingTool,mobile]); const hi=lang==='hi'; const tr=(en:string,h:string)=>hi?h:en;
const filtered=useMemo(()=>tools.filter(t=>(t[1]+' '+t[2]+' '+t[3]).toLowerCase().includes(query.toLowerCase())),[query]);
const filteredMakers=useMemo(()=>makers.filter(m=>(m.en+' '+m.hi+' '+m.sub).toLowerCase().includes(query.toLowerCase())),[query]);
const filteredCategories=useMemo(()=>categories.filter(k=>(k.en+' '+k.hi+' '+k.desc).toLowerCase().includes(query.toLowerCase())),[query]);
const go=(id:string)=>{if(id!==section){navStack.current.push(section);}setSection(id);setMobile(false);setQuery('');window.history.pushState({tanshuApp:true,section:id},'',window.location.pathname+'#'+id);window.scrollTo({top:0,behavior:'smooth'})}; const goBack=()=>{if(openedTool){setOpenedTool(null);return;}if(pendingTool){setPendingTool(null);return;}setMobile(false);if(navStack.current.length>1){window.history.back();}else{setSection('home');window.scrollTo({top:0,behavior:'smooth'});}};
const toggleFav=(name:string)=>setFavorites(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name]);
const soon=(name:string,hiName=name,desc='')=>{setRecent(v=>[name,...v.filter(x=>x!==name)].slice(0,5));setPendingTool({name,hiName,desc});}; const openDirectoryTool=(t:(typeof tools)[number])=>soon(t[1],t[2],t[3]);
const side=[{id:'home',label:tr('Overview','ओवरव्यू'),icon:Home},{id:'maker',label:tr('Maker Tools','मेकर टूल्स'),icon:Sparkles},{id:'csc',label:tr('CSC Center','CSC सेंटर'),icon:Landmark},{id:'cyber',label:tr('Cyber Cafe','साइबर कैफे'),icon:Globe2},{id:'all',label:tr('All Categories','सभी कैटेगरी'),icon:Grid2X2}];
const currentCat=categories.find(c=>c.id===section);
const cscNames=['Application & Letter Maker','Biodata Maker','Aadhaar Card Crop & Print','PAN Card Crop & Print','e-Aadhaar Front & Back Print','e-PAN Card Crop & Print','Voter ID Crop & Print','Driving Licence Crop & Print','Ayushman Card Print Layout','Aadhaar Masking Tool','Bihar Land Measurement Calculator','Age & Date Calculator','Hindi Application & Affidavit Drafts','CSC Service Rate List Maker','Round Rubber Stamp Maker','Mobile Camera Document Scanner','Smart CSC Scan & Clean Studio','Bank Application Letter Maker'];
 const cyberNames=['Hindi Typing Workspace','Typing Test & Speed Calculator','Resume & Biodata Templates','Cover Letter Builder','Image Format Converter','Image Compressor','Merge PDF','Compress PDF','PDF 4 Pages Per Sheet (4-up)','PDF 2 / 4 / 6 / 9 Pages Per Sheet','Split PDF by Page Range','Delete & Extract PDF Pages','Rotate & Reorder PDF','PDF to JPG / PNG','Word to PDF','PDF to Word / Text'];
 const directoryTools = section==='favorites' ? tools.filter(t=>favorites.includes(t[1])) : section==='recent' ? tools.filter(t=>recent.includes(t[1])) : section==='csc' ? tools.filter(t=>cscNames.includes(t[1])) : section==='cyber' ? tools.filter(t=>cyberNames.includes(t[1])) : filtered.filter(t=>t[0]===section || section==='maker');
return <div className={dark?'app dark':'app light'}>
<aside className={'sidebar '+(mobile?'show':'')}><div className="brand"><div className="brandmark brandmark-premium"><span>T</span><i>✦</i></div><div><b>TANSHU</b><strong>DIGITAL TOOLS</strong><small>ALL IN ONE WORKSPACE</small></div><button className="close-nav" onClick={()=>setMobile(false)}><X size={18}/></button></div>
<div className="workspace-label">{tr('WORKSPACE','वर्कस्पेस')}</div><nav>{side.map(s=><button key={s.id} className={section===s.id?'nav-item active':'nav-item'} onClick={()=>go(s.id)}><s.icon size={18}/><span>{s.label}</span>{section===s.id&&<i/>}</button>)}</nav>
<div className="sidebar-label">{tr('YOUR LIBRARY','आपकी लाइब्रेरी')}</div><button className="nav-item" onClick={()=>go('favorites')}><Star size={18}/><span>{tr('Favorites','पसंदीदा')}</span><small>{favorites.length}</small></button><button className="nav-item" onClick={()=>go('recent')}><Clock3 size={18}/><span>{tr('Recently Used','हाल में इस्तेमाल')}</span></button>
<div className="side-bottom"><div className="secure"><ShieldCheck size={18}/><div><b>{tr('Privacy first','प्राइवेसी पहले')}</b><small>{tr('Your files stay yours','आपकी फाइलें आपकी हैं')}</small></div></div><div className="profile"><div className="avatar">T</div><div><b>TANSHU DIGITAL</b><small>{tr('Workspace preview','वर्कस्पेस प्रीव्यू')}</small></div><span className="online"/></div></div></aside>
{mobile&&<button className="mobile-nav-scrim" aria-label="Close navigation" onClick={()=>setMobile(false)}/>}
<div className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button>{section!=='home'&&<button className="page-back-button" onClick={goBack}><ChevronRight size={15}/><span>{tr('BACK','वापस')}</span></button>}<div className="crumb"><span>{tr('Workspace','वर्कस्पेस')}</span><ChevronRight size={14}/><b>{currentCat?(hi?currentCat.hi:currentCat.en):section==='home'?tr('Overview','ओवरव्यू'):section==='all'?tr('All Categories','सभी कैटेगरी'):section==='favorites'?tr('Favorites','पसंदीदा'):section==='recent'?tr('Recently Used','हाल में इस्तेमाल'):tr('Maker Tools','मेकर टूल्स')}</b></div><div className="top-actions"><div className="language-picker"><button className="language" onClick={()=>setShowLangMenu(v=>!v)}><Languages size={16}/><span>{hi?'हिंदी':'English'}</span><ChevronRight size={13} className={showLangMenu?'lang-chevron open':'lang-chevron'}/></button>{showLangMenu&&<div className="language-menu"><button className={!hi?'chosen':''} onClick={()=>{setLang('en');setShowLangMenu(false)}}><span>🇬🇧</span> English { !hi&&<b>✓</b>}</button><button className={hi?'chosen':''} onClick={()=>{setLang('hi');setShowLangMenu(false)}}><span>🇮🇳</span> हिंदी { hi&&<b>✓</b>}</button></div>}</div><button className="icon-btn" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button><div className="top-avatar">T</div></div></header>
<main><div className="welcome-row hero-panel"><div className="hero-copy"><div className="eyebrow"><span className="pulse"/> {tr('YOUR DIGITAL WORKSPACE','आपका डिजिटल वर्कस्पेस')}</div><h1>{section==='home'?<>{tr('EVERYTHING YOU NEED.','आपका हर डिजिटल काम।')} <em>{tr('ALL IN ONE PLACE.','एक ही जगह पर।')}</em></>:currentCat?(hi?currentCat.hi:currentCat.en):tr('EXPLORE YOUR TOOLS','अपने टूल्स देखें')}</h1><p>{tr('A smarter workspace for CSC centers, cyber cafés and everyday digital work.','CSC सेंटर, साइबर कैफे और रोज़मर्रा के डिजिटल काम के लिए स्मार्ट वर्कस्पेस।')}</p></div><div className="date-chip"><Command size={15}/><span>{tr('Made for digital professionals','डिजिटल प्रोफेशनल्स के लिए')}</span></div><div className="hero-visual" aria-label="CSC centre, cyber cafe and public customers"><div className="hero-visual-top">ONE WORKSPACE · EVERYONE</div><div className="hero-people"><div className="hero-person"><span className="person-head p1"></span><span className="person-body b1"></span><small>CUSTOMERS</small></div><div className="hero-person"><span className="person-head p2"></span><span className="person-body b2"></span><small>CSC CENTER</small></div><div className="hero-person"><span className="person-head p3"></span><span className="person-body b3"></span><small>CYBER CAFE</small></div></div><div className="hero-device"><i></i><i></i><i></i><b>ONLINE SERVICES</b></div></div></div>
<div className="search-wrap"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr('Search tools, makers and categories...','टूल्स, मेकर और कैटेगरी खोजें...')}/><kbd>⌘ K</kbd></div>
{query.trim().length>0&&<div className="search-suggestions"><div className="suggestion-heading">{tr('INSTANT SEARCH RESULTS','तुरंत सर्च रिज़ल्ट')} · {filtered.length+filteredMakers.length+filteredCategories.length}</div>{filtered.slice(0,7).map(t=><button className="suggestion-item" key={'tool-'+t[1]} onClick={()=>openDirectoryTool(t)}><span className="suggestion-mark"><Search size={14}/></span><span><b>{hi?t[2]:t[1]}</b><small>{t[3]}</small></span><em>{tr('TOOL','टूल')}</em></button>)}{filteredMakers.slice(0,4).map(m=><button className="suggestion-item" key={'maker-'+m.en} onClick={()=>soon(m.en,m.hi,m.sub)}><span className="suggestion-mark"><Sparkles size={14}/></span><span><b>{hi?m.hi:m.en}</b><small>{m.sub}</small></span><em>MAKER</em></button>)}{filteredCategories.slice(0,3).map(k=><button className="suggestion-item" key={'cat-'+k.id} onClick={()=>go(k.id)}><span className="suggestion-mark"><Grid2X2 size={14}/></span><span><b>{hi?k.hi:k.en}</b><small>{k.desc}</small></span><em>{tr('CATEGORY','कैटेगरी')}</em></button>)}{filtered.length+filteredMakers.length+filteredCategories.length===0&&<div className="suggestion-empty">{tr('No matching tool found yet. Try another keyword.','अभी यह टूल नहीं मिला। दूसरा शब्द खोजें।')}</div>}</div>}
{section!=='recordform'&&<div className="quick-panels"><article className="feature-panel csc-panel" onClick={()=>go('csc')}><div className="feature-icon"><Landmark/></div><div><span>{tr('SERVICE WORKSPACE','सर्विस वर्कस्पेस')}</span><h3>CSC CENTER TOOLS</h3><p>{tr('Application prep, document resize, service desk and more.','एप्लीकेशन तैयारी, डॉक्यूमेंट रिसाइज़ और सर्विस डेस्क।')}</p><b>{tr('Open workspace','वर्कस्पेस खोलें')} <ArrowUpRight size={15}/></b></div><div className="panel-glow"/><div className="scene-art csc-scene" aria-hidden="true"><div className="scene-window"><div className="scene-top"><i/><i/><i/></div><div className="scene-person"><span/><b/><i/></div><div className="scene-screen"><span/><span/><span/><strong>CSC</strong></div><div className="scene-paper"><i/><i/><i/><b/></div></div><div className="scene-caption">APPLICATION DESK <span>LIVE WORKFLOW</span></div></div></article><article className="feature-panel cyber-panel" onClick={()=>go('cyber')}><div className="feature-icon"><Globe2/></div><div><span>{tr('BUSINESS WORKSPACE','बिज़नेस वर्कस्पेस')}</span><h3>CYBER CAFE TOOLS</h3><p>{tr('Customer jobs, typing, scan, print and billing workflows.','कस्टमर जॉब, टाइपिंग, स्कैन, प्रिंट और बिलिंग।')}</p><b>{tr('Open workspace','वर्कस्पेस खोलें')} <ArrowUpRight size={15}/></b></div><div className="panel-glow"/><div className="scene-art cyber-scene" aria-hidden="true"><div className="scene-window"><div className="scene-top"><i/><i/><i/></div><div className="scene-monitor"><div className="monitor-screen"><span/><span/><span/><b>PRINT READY</b></div><i/></div><div className="scene-keyboard"/><div className="scene-writing"><div className="writing-lines"><i/><i/><i/><i/></div><span className="pencil"/></div></div><div className="scene-caption">CUSTOMER WORKSTATION <span>DESK READY</span></div></div></article></div>}

{section==='recordform'&&<section className="record-form-page">
<div className="record-form-intro"><div><div className="eyebrow">{tr('SHOP RECORDS · CUSTOMER FORMS · ONLINE SERVICES','दुकान का रिकॉर्ड · ग्राहक फॉर्म · ऑनलाइन सेवाएँ')}</div><h2>{tr('ALL SOFT RECORD & FORM','ऑल सॉफ्ट रिकॉर्ड एवं फॉर्म')}</h2><p>{tr('Shop records, customer forms, payment receipts and online service assistance — organised category-wise.','दुकान का रिकॉर्ड, ग्राहक फॉर्म, भुगतान रसीद और ऑनलाइन सेवा सहायता — पूरी तरह कैटेगरी-वाइज।')}</p></div><span className="record-demo-tag">{tr('INTERACTIVE DEMO','इंटरैक्टिव डेमो')}</span></div>
<div className="record-feature-strip"><div><b>{tr('CUSTOMER & SHOP RECORD','ग्राहक और दुकान का रिकॉर्ड')}</b><small>{tr('Work · item · approval · payment','काम · सामान · मंजूरी · भुगतान')}</small></div><div><b>{tr('PRINT / DOWNLOAD','प्रिंट / डाउनलोड')}</b><small>{tr('A4 form · shop copy · customer copy','A4 फॉर्म · दुकान कॉपी · ग्राहक कॉपी')}</small></div><div><b>{tr('ONLINE APPLICATION LOG','ऑनलाइन आवेदन रिकॉर्ड')}</b><small>{tr('Application · reference · status','आवेदन · रेफरेंस · स्थिति')}</small></div></div>
<div className="record-layout"><div className="record-main-card">
<div className="record-stepper">{['Business','Customer','Work & Payment','Approval'].map((n,i)=><button key={n} className={recordStep===i?'active':recordStep>i?'done':''} onClick={()=>setRecordStep(i)}><span>{recordStep>i?'✓':i+1}</span><small>{hi?['व्यापार','ग्राहक','काम और भुगतान','मंजूरी'][i]:n}</small></button>)}</div>
{recordStep===0&&<div className="record-step-content"><div className="record-step-title"><span>01</span><div><h3>{tr('Select business category','व्यापार की कैटेगरी चुनें')}</h3><p>{tr('Choose a shop or service type. The full release will show matching forms.','दुकान या सर्विस का प्रकार चुनें। पूर्ण संस्करण में उसी के अनुसार फॉर्म दिखेंगे।')}</p></div></div><label>{tr('BUSINESS / SHOP TYPE','दुकान या काम का प्रकार')}</label><select value={recordBusiness} onChange={e=>setRecordBusiness(e.target.value)}>{['Mobile / Electronics Repair','Bike / Scooter Garage','Car / Tractor Workshop','Retail Shop / Customer Credit','Kirana / Wholesale Supplier','Rental / Tent House / Equipment','Electrician / Plumber / Home Service','Furniture / Carpenter / Fabrication','Tailor / Boutique / Custom Order','Jewellery Repair / Custom Order','Transport / Goods Delivery','Coaching / Tuition / Membership','Other Business'].map(x=><option key={x}>{x}</option>)}</select><div className="record-choice-grid">{[{a:'REPAIR & SERVICE',b:'Device, vehicle, appliance and field service'},{a:'SHOP & UDHAAR',b:'Customer ledger, credit and payments'},{a:'RENTAL & DEPOSIT',b:'Issued item, return and damage record'},{a:'ORDER & DELIVERY',b:'Custom work, advance and handover'}].map(x=><div key={x.a}><b>{x.a}</b><small>{x.b}</small></div>)}</div></div>}
{recordStep===1&&<div className="record-step-content"><div className="record-step-title"><span>02</span><div><h3>{tr('Customer details & item identity','ग्राहक और सामान की जानकारी')}</h3><p>{tr('Collect only information needed for this transaction.','सिर्फ इस लेन-देन के लिए जरूरी जानकारी लें।')}</p></div></div><div className="record-fields"><div><label>{tr('CUSTOMER FULL NAME','ग्राहक का पूरा नाम')}</label><input value={recordCustomer} onChange={e=>setRecordCustomer(e.target.value)} placeholder={tr('Enter customer name','ग्राहक का नाम लिखें')}/></div><div><label>{tr('MOBILE NUMBER','मोबाइल नंबर')}</label><input value={recordPhone} onChange={e=>setRecordPhone(e.target.value)} inputMode="numeric" placeholder="10-digit mobile number"/></div><div className="wide"><label>{tr('ITEM / VEHICLE / DEVICE DETAILS','सामान / वाहन / डिवाइस का विवरण')}</label><input value={recordItem} onChange={e=>setRecordItem(e.target.value)} placeholder={tr('Brand, model, colour, serial / registration (only if needed)','ब्रांड, मॉडल, रंग, सीरियल / रजिस्ट्रेशन (जरूरत हो तभी)')}/></div><div className="wide"><label>{tr('ITEM PHOTO / EXISTING CONDITION (OPTIONAL)','सामान या पहले की स्थिति की फोटो (वैकल्पिक)')}</label><input type="file" accept="image/*" onChange={e=>setRecordPhoto(e.target.files?.[0]?.name||'')}/><small>{recordPhoto||tr('Add item, vehicle or damage photos','सामान, वाहन या डैमेज की फोटो जोड़ें')}</small></div></div><p className="record-privacy-note">{tr('Never collect passwords or OTPs. Record IMEI, serial or registration details only when relevant, lawful and explained to the customer. Avoid unnecessary identity documents.','पासवर्ड या OTP कभी न लें। IMEI, सीरियल या रजिस्ट्रेशन तभी दर्ज करें जब जरूरी हो और ग्राहक को बताया गया हो। गैर-जरूरी पहचान दस्तावेज न लें।')}</p></div>}
{recordStep===2&&<div className="record-step-content"><div className="record-step-title"><span>03</span><div><h3>{tr('Work details & payment record','काम और भुगतान का रिकॉर्ड')}</h3><p>{tr('Record the agreed work, amount received and payment reference.','तय काम, प्राप्त रकम और भुगतान रेफरेंस दर्ज करें।')}</p></div></div><div className="record-fields"><div className="wide"><label>{tr('WORK / GOODS / SERVICE DESCRIPTION','काम / सामान / सर्विस का विवरण')}</label><textarea value={recordWork} onChange={e=>setRecordWork(e.target.value)} placeholder={tr('Customer request, fault, items, quantity and agreed work...','ग्राहक की मांग, खराबी, सामान, मात्रा और तय काम...')}/></div><div><label>{tr('TOTAL AMOUNT (₹)','कुल रकम (₹)')}</label><input type="number" min="0" value={recordAmount} onChange={e=>setRecordAmount(e.target.value)} placeholder="0.00"/></div><div><label>{tr('AMOUNT RECEIVED (₹)','प्राप्त रकम (₹)')}</label><input type="number" min="0" value={recordPaid} onChange={e=>setRecordPaid(e.target.value)} placeholder="0.00"/></div><div><label>{tr('PAYMENT METHOD','भुगतान का माध्यम')}</label><select value={recordMode} onChange={e=>setRecordMode(e.target.value)}>{['Cash','UPI','Bank Transfer','Debit / Credit Card','Cheque','Other'].map(x=><option key={x}>{x}</option>)}</select></div><div><label>{tr('TRANSACTION ID / UTR (OPTIONAL)','ट्रांजेक्शन ID / UTR (वैकल्पिक)')}</label><input value={recordTxn} onChange={e=>setRecordTxn(e.target.value)} placeholder="UPI Ref / UTR / Receipt No."/></div><div className="wide"><label>{tr('BALANCE / DUE DATE / DELIVERY NOTE','बाकी रकम / भुगतान तारीख / डिलीवरी नोट')}</label><input value={recordDue} onChange={e=>setRecordDue(e.target.value)} placeholder={tr('Balance due date or expected completion / handover','बाकी भुगतान की तारीख या काम पूरा / सुपुर्दगी का समय')}/></div></div></div>}
{recordStep===3&&<div className="record-step-content"><div className="record-step-title"><span>04</span><div><h3>{tr('Customer approval & signatures','ग्राहक की मंजूरी और हस्ताक्षर')}</h3><p>{tr('Review the details before preparing copies.','कॉपी तैयार करने से पहले विवरण जाँचें।')}</p></div></div><div className="record-fields"><div className="wide"><label>{tr('CUSTOMER SIGNATURE / THUMB IMPRESSION (OPTIONAL)','ग्राहक का हस्ताक्षर / अंगूठे का निशान (वैकल्पिक)')}</label><input type="file" accept="image/*" onChange={e=>setRecordSignature(e.target.files?.[0]?.name||'')}/><small>{recordSignature||tr('Upload a signature image or print the form for handwritten signature','हस्ताक्षर की फोटो जोड़ें या प्रिंट करके हाथ से हस्ताक्षर लें')}</small></div><div className="wide"><label>{tr('SHOP / TECHNICIAN SIGNATURE','दुकानदार / टेक्नीशियन का हस्ताक्षर')}</label><div className="record-sign-box">{tr('Signature / stamp area','हस्ताक्षर / मोहर का स्थान')}</div></div></div><label className="record-consent"><input type="checkbox" checked={recordConsent} onChange={e=>setRecordConsent(e.target.checked)}/><span>{tr('I confirm that the work, amount, payment and applicable terms have been explained and agreed.','मैं पुष्टि करता/करती हूँ कि काम, रकम, भुगतान और लागू शर्तें समझाई गई हैं और सहमति ली गई है।')}</span></label><p className="record-privacy-note">{tr('For loans, pledged goods, major contracts or regulated services, use a lawyer-reviewed format and follow applicable state and sector rules.','कर्ज, गिरवी, बड़े अनुबंध या नियंत्रित सेवाओं के लिए वकील से जाँचा गया फॉर्म और लागू नियम अपनाएँ।')}</p></div>}
<div className="record-actions"><button className="record-secondary" disabled={recordStep===0} onClick={()=>setRecordStep(Math.max(0,recordStep-1))}>{tr('PREVIOUS','पिछला')}</button>{recordStep<3?<button className="record-primary" onClick={()=>setRecordStep(recordStep+1)}>{tr('SAVE & CONTINUE','सेव करें और आगे बढ़ें')} <ArrowUpRight size={16}/></button>:<button className="record-primary" onClick={()=>window.print()}>{tr('PRINT / SAVE AS PDF','प्रिंट / PDF के रूप में सेव करें')} <Printer size={16}/></button>}</div>
</div>
<aside className="record-preview-card"><div className="eyebrow">{tr('LIVE FORM PREVIEW','फॉर्म का प्रीव्यू')}</div><h3>{tr('CUSTOMER JOB / TRANSACTION RECORD','ग्राहक जॉब / लेन-देन रिकॉर्ड')}</h3><div className="record-preview-photo">{recordPhoto?'PHOTO ATTACHED':tr('PHOTO / ITEM IMAGE','फोटो / सामान की तस्वीर')}</div><div className="record-preview-line"><span>{tr('CUSTOMER','ग्राहक')}</span><b>{recordCustomer||'—'}</b></div><div className="record-preview-line"><span>{tr('MOBILE','मोबाइल')}</span><b>{recordPhone||'—'}</b></div><div className="record-preview-line"><span>{tr('BUSINESS','व्यापार')}</span><b>{recordBusiness}</b></div><div className="record-preview-line"><span>{tr('ITEM / DEVICE','सामान / डिवाइस')}</span><b>{recordItem||'—'}</b></div><div className="record-preview-line"><span>{tr('TOTAL / RECEIVED','कुल / प्राप्त')}</span><b>₹{recordAmount||'0'} / ₹{recordPaid||'0'}</b></div><div className="record-preview-line"><span>{tr('PAYMENT','भुगतान')}</span><b>{recordMode}</b></div><div className="record-preview-line"><span>{tr('TRANSACTION REF','ट्रांजेक्शन रेफरेंस')}</span><b>{recordTxn||'—'}</b></div><div className="record-preview-sign"><div>{recordSignature?'SIGNATURE ATTACHED':'CUSTOMER SIGNATURE'}</div><div>SHOP SIGN / STAMP</div></div><small>{tr('Demo preview. Automatic record number and secure account history are planned for the full release.','डेमो प्रीव्यू। ऑटो रिकॉर्ड नंबर और सुरक्षित अकाउंट हिस्ट्री पूर्ण संस्करण में जोड़ी जाएगी।')}</small></aside></div>
<div className="record-catalog"><div className="section-head"><div><div className="eyebrow">{tr('BUSINESS-WISE FORM LIBRARY','व्यापार के अनुसार फॉर्म')}</div><h3>{tr('Choose a ready-made form','तैयार फॉर्म चुनें')}</h3></div></div><div className="record-catalog-grid">{[{a:'SHOP & CUSTOMER CREDIT',b:'उधारी खाता, भुगतान रसीद, बकाया स्टेटमेंट'},{a:'MOBILE / ELECTRONICS REPAIR',b:'डिवाइस जमा, कंडीशन फोटो, जॉब कार्ड'},{a:'BIKE / CAR / TRACTOR GARAGE',b:'वाहन रिसीविंग, जॉब कार्ड, टेस्ट और डिलीवरी'},{a:'RENTAL / TENT / EQUIPMENT',b:'सामान सूची, सिक्योरिटी, किराया और वापसी'},{a:'ORDER / TAILOR / FURNITURE',b:'ऑर्डर, नाप, डिजाइन मंजूरी, एडवांस और डिलीवरी'},{a:'HOME SERVICE / TECHNICIAN',b:'साइट विजिट, काम की फोटो, मंजूरी और भुगतान'},{a:'JEWELLERY / CUSTOM WORK',b:'विवरण, मरम्मत, ग्राहक स्वीकृति और सुपुर्दगी'},{a:'TRANSPORT / GOODS DELIVERY',b:'माल सूची, बुकिंग, प्राप्तकर्ता और डिलीवरी प्रमाण'}].map(x=><div key={x.a}><b>{x.a}</b><small>{x.b}</small></div>)}</div></div>
<div className="record-online"><div><div className="eyebrow">{tr('ONLINE APPLICATION ASSISTANCE','ऑनलाइन आवेदन सहायता')}</div><h3>{tr('Common online work for digital service counters','डिजिटल सेवा केंद्रों के आम ऑनलाइन काम')}</h3><p>{tr('Prepare a customer checklist, record service charges and application reference, then continue only on the official portal.','ग्राहक की चेकलिस्ट बनाएँ, सेवा शुल्क और आवेदन रेफरेंस दर्ज करें, फिर आधिकारिक पोर्टल पर आगे बढ़ें।')}</p></div><div className="record-online-grid">{[{n:'Passport application & tracking',h:'पासपोर्ट आवेदन और ट्रैकिंग',u:'https://www.passportindia.gov.in/'},{n:'MSME / Udyam registration',h:'MSME / उद्यम रजिस्ट्रेशन',u:'https://udyamregistration.gov.in/'},{n:'Government service directory',h:'सरकारी सेवाओं की डायरेक्टरी',u:'https://www.india.gov.in/'},{n:'UMANG services',h:'UMANG सरकारी सेवाएँ',u:'https://web.umang.gov.in/'},{n:'GST portal services',h:'GST पोर्टल सेवाएँ',u:'https://www.gst.gov.in/'},{n:'Scholarship & education forms',h:'स्कॉलरशिप और शिक्षा फॉर्म',u:'https://scholarships.gov.in/'}].map(x=><a key={x.n} href={x.u} target="_blank" rel="noreferrer"><b>{hi?x.h:x.n}</b><span>{tr('OPEN OFFICIAL PORTAL','आधिकारिक पोर्टल खोलें')} ↗</span></a>)}</div><p className="record-privacy-note">{tr('This workspace prepares records and checklists; it is not a government portal. Never save customer passwords or OTPs. Verify the official website before payment or submission.','यह वर्कस्पेस रिकॉर्ड और चेकलिस्ट तैयार करता है; यह सरकारी पोर्टल नहीं है। ग्राहक का पासवर्ड या OTP सेव न करें। भुगतान या आवेदन से पहले आधिकारिक वेबसाइट जाँचें।')}</p></div>
</section>}

{section==='home'||section==='maker'?<><div className="section-head"><div><div className="eyebrow">{tr('START CREATING','बनाना शुरू करें')}</div><h2>{tr('INSTANT MAKER TOOLS','इंस्टेंट मेकर टूल्स')} <span className="count">{String(makers.length).padStart(2,'0')}</span></h2><p>{tr('Popular tools for photo, PDF, printing, students and everyday counter work.','फोटो, PDF, प्रिंटिंग, स्टूडेंट और रोज़मर्रा के काउंटर के लोकप्रिय टूल्स।')}</p></div><button className="text-link" onClick={()=>go('maker')}>{tr('View all makers','सभी मेकर देखें')} <ArrowUpRight size={16}/></button></div>
<div className="maker-grid">{makers.filter(m=>(m.en+' '+m.hi+' '+m.sub).toLowerCase().includes(query.toLowerCase())).map((m,i)=><article className={'maker-card maker-'+i} key={m.en} onClick={()=>soon(m.en,m.hi,m.sub)}><DemoThumb title={m.en}/><div className="maker-top"><div className="tool-icon"><m.icon size={20}/></div>{m.tag&&<span className="tag">{m.tag}</span>}<button className={'fav '+(favorites.includes(m.en)?'saved':'')} onClick={e=>{e.stopPropagation();toggleFav(m.en)}}><Star size={16} fill={favorites.includes(m.en)?'currentColor':'none'}/></button></div><h3>{tr(m.en,m.hi)}</h3><p>{m.sub}</p><div className="card-foot"><span>{tr('Explore maker','मेकर खोलें')}</span><span className="arrow"><ArrowUpRight size={16}/></span></div></article>)}</div>

</>:null}
{(section==='all'||section==='home'||section==='csc'||section==='cyber')&&<><div className="section-head category-heading"><div><div className="eyebrow">{tr('BUILT AROUND YOUR WORK','आपके काम के अनुसार')}</div><h2>{tr('Explore categories','कैटेगरी एक्सप्लोर करें')}</h2><p>{tr('Everything organized. Find the right tool without the clutter.','हर टूल सही जगह पर—बिना किसी उलझन के।')}</p></div><span className="muted-count">{categories.length} {tr('CATEGORIES','कैटेगरी')}</span></div><div className="category-grid">{categories.filter(c=>(section==='csc'?c.id==='csc':section==='cyber'?c.id==='cyber':true)&&((c.en+' '+c.hi+' '+c.desc).toLowerCase().includes(query.toLowerCase()))).map(c=><button className="category-card" key={c.id} onClick={()=>go(c.id)}><DemoThumb title={c.en}/><div className={'category-icon '+c.id}><c.icon size={20}/></div><div className="category-copy"><b>{hi?c.hi:c.en}</b><small>{c.desc}</small></div><span className="category-count">{c.id==='csc'?cscNames.length:c.id==='cyber'?cyberNames.length:c.id==='maker'?makers.length:c.id==='recordform'?8:tools.filter(t=>t[0]===c.id).length}</span><ChevronRight className="cat-arrow" size={16}/></button>)}</div></>}
{(currentCat && section!=='recordform' || section === 'favorites' || section === 'recent') && (
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
        <button className="tool-row tool-row-action" key={t[1]} onClick={() => openDirectoryTool(t)}>
          <DemoThumb title={t[1]}/><div className="tool-icon">{createElement(t[4] as any, { size: 19 })}</div>
          <div className="tool-info"><b>{hi ? t[2] : t[1]}</b><small>{t[3]}</small></div>
          <span className="coming">{tr('COMING SOON','जल्द आ रहा है')}</span>
          <span className="tool-open-hint">{tr('OPEN TOOL','टूल खोलें')} <ArrowUpRight size={15}/></span>
          <span className="tool-fav" onClick={(e) => {e.stopPropagation();toggleFav(t[1]);}}><Star size={16} fill={favorites.includes(t[1]) ? 'currentColor' : 'none'} /></span>
        </button>
      ))}
    </div>
  </>
)}
{query.length > 0 && (
  <div className="search-results">
    <div className="eyebrow">{tr('SEARCH RESULTS','सर्च रिज़ल्ट')}</div>
    <h2>{filtered.length} {tr('matching tools','मिलते-जुलते टूल')}</h2>
    {filtered.map((t) => (
      <button className="tool-row tool-row-action" key={t[1]} onClick={() => openDirectoryTool(t)}>
        <DemoThumb title={t[1]}/><div className="tool-icon">{createElement(t[4] as any, { size: 18 })}</div>
        <div className="tool-info"><b>{hi ? t[2] : t[1]}</b><small>{t[3]}</small></div>
        <span className="coming">{tr('IN DEVELOPMENT','निर्माणाधीन')}</span>
        <span className="tool-open-hint">{tr('OPEN TOOL','टूल खोलें')} <ArrowUpRight size={15}/></span>
      </button>
    ))}
  </div>
)}
{intro&&<div className="intro-splash"><div className="intro-logo"><span>T</span><i>✦</i></div><div className="intro-brand">TANSHU <b>DIGITAL TOOLS</b></div><div className="intro-tagline">ALL IN ONE DIGITAL WORKSPACE</div><div className="intro-loader"><i/></div></div>}{pendingTool&&<div className="tool-status-backdrop" role="presentation"><section className="tool-status-modal" role="dialog" aria-modal="true" aria-labelledby="tool-status-title"><div className="tool-status-icon"><Clock3 size={24}/></div><div className="eyebrow">{tr('TOOL STATUS','टूल की स्थिति')}</div><h2 id="tool-status-title">{hi?pendingTool.hiName:pendingTool.name}</h2><p>{hi?'यह टूल अभी पूरी तरह तैयार नहीं है। हमारी टीम इस पर काम कर रही है। तैयार होते ही इसे यहीं उपलब्ध कराया जाएगा।':'This tool is not fully ready yet. We are working on it and will make it available here as soon as it is complete.'}</p>{pendingTool.desc&&<small>{pendingTool.desc}</small>}<button className="tool-status-primary" onClick={()=>{setOpenedTool(pendingTool);setPendingTool(null);}}>{tr('OK, CONTINUE','ठीक है, आगे बढ़ें')} <ArrowUpRight size={16}/></button></section></div>}{openedTool&&<div className="tool-page-panel"><button className="tool-page-back" onClick={()=>setOpenedTool(null)}><ChevronRight size={16}/> {tr('BACK TO TOOLS','टूल्स पर वापस')}</button><div className="tool-status-icon"><Clock3 size={24}/></div><div className="eyebrow">{tr('IN DEVELOPMENT','निर्माणाधीन')}</div><h2>{hi?openedTool.hiName:openedTool.name}</h2><p>{hi?'यह टूल अभी निर्माणाधीन है। इस पर काम पूरा होने के बाद इसका पूरा फीचर इसी जगह उपलब्ध होगा।':'This tool is currently in development. Its complete features will appear here once the work is finished.'}</p><span className="coming">{tr('COMING SOON','जल्द आ रहा है')}</span></div>}<footer><span>© 2026 <b>TANSHU DIGITAL TOOLS</b></span><span>{tr('ALL IN ONE DIGITAL WORKSPACE','हर डिजिटल काम, एक ही जगह।')}</span><span className="footer-safe"><ShieldCheck size={14}/> {tr('Privacy-conscious by design','प्राइवेसी का ध्यान')}</span></footer>
</main></div><nav className="mobile-bottom">{[{id:'home',icon:Home,label:tr('Home','होम')},{id:'maker',icon:Sparkles,label:tr('Makers','मेकर')},{id:'all',icon:Grid2X2,label:tr('Explore','एक्सप्लोर')},{id:'favorites',icon:Star,label:tr('Saved','सेव्ड')}].map(n=><button key={n.id} className={section===n.id?'selected':''} onClick={()=>go(n.id)}><n.icon size={19}/><small>{n.label}</small></button>)}</nav></div>
}