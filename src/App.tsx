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
{ id:'education',en:'EDUCATION & EXAM DESK',hi:'एजुकेशन और एग्जाम डेस्क',desc:'Student and school document workflows',icon:GraduationCap,count:9 },
{ id:'typing',en:'TYPING & CAREER',hi:'टाइपिंग और करियर',desc:'Typing utilities, resume and applications',icon:Keyboard,count:11 },
{ id:'qr',en:'QR & BARCODE TOOLS',hi:'QR और बारकोड टूल्स',desc:'Create practical codes and labels',icon:QrCode,count:7 },
{ id:'utility',en:'UTILITY & FILE TOOLS',hi:'यूटिलिटी और फाइल टूल्स',desc:'Useful everyday file helpers',icon:Wrench,count:14 },
{ id:'banking',en:'BANKING UTILITIES',hi:'बैंकिंग यूटिलिटी',desc:'Reference tools and quick calculations',icon:ShieldCheck,count:6 },
{ id:'govt',en:'GOVT PORTAL QUICK ACCESS',hi:'सरकारी पोर्टल क्विक एक्सेस',desc:'Shortcuts to official public services',icon:Globe2,count:10 },
{ id:'graphics',en:'BANNER & GRAPHIC DESIGN STUDIO',hi:'बैनर और ग्राफिक डिजाइन स्टूडियो',desc:'Flex banners, posters, pamphlets and shop creatives',icon:Image,count:18 },
{ id:'stamp',en:'STAMP & SEAL DESIGNER',hi:'मोहर और सील डिजाइनर',desc:'Authorised business stamps and office seals',icon:ShieldCheck,count:6 },
{ id:'image',en:'IMAGE EDITING & AI TOOLS',hi:'इमेज एडिटिंग और AI टूल्स',desc:'Background removal, cleanup, enhancement and crop',icon:Sparkles,count:16 },
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
{en:'Thumb Impression Resizer',hi:'अंगूठे का निशान रिसाइज़र',sub:'Clean and size thumb impressions for forms',icon:ScanLine,tag:'COUNTER USE'},
{en:'Notebook Name Sticker Maker',hi:'कॉपी नाम स्टिकर मेकर',sub:'Create printable labels for school notebooks',icon:GraduationCap,tag:''},
{en:'AI Passport Photo Studio',hi:'AI पासपोर्ट फोटो स्टूडियो',sub:'Prepare studio-style backgrounds and photo sheets',icon:Sparkles,tag:'NEW'},
{en:'Mobile Camera Document Scanner',hi:'मोबाइल कैमरा डॉक्यूमेंट स्कैनर',sub:'Capture, crop and prepare clean document scans',icon:ScanLine,tag:'NEW'}
];
const tools=[
['photo','Stamp Size Photo Maker','स्टाम्प साइज फोटो मेकर','Ready-to-print photo sizing',Image],['photo','Photo Background Studio','फोटो बैकग्राउंड स्टूडियो','Prepare a clean photo background',Sun],
['pvc','Student ID Card Maker','स्टूडेंट ID कार्ड मेकर','Editable student card layout',CreditCard],['pvc','Employee ID Card Maker','एम्प्लॉयी ID कार्ड मेकर','Workplace identity card design',CreditCard],
['docs','Application & Letter Maker','आवेदन और पत्र मेकर','Draft clean application documents',FileText],['docs','Biodata Maker','बायोडाटा मेकर','Simple personal biodata layouts',FileText],
['pdf','Merge PDF','PDF मर्ज करें','Combine multiple PDF files',FolderOpen],['pdf','Compress PDF','PDF कंप्रेस करें','Reduce PDF file size',Zap],
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
export default function App(){
const [intro,setIntro]=useState(true); const navStack=useRef<string[]>(['home']); const [lang,setLang]=useState<Lang>('en'); const [query,setQuery]=useState(''); const [section,setSection]=useState('home'); const [favorites,setFavorites]=useState<string[]>([]); const [recent,setRecent]=useState<string[]>([]); const [mobile,setMobile]=useState(false); const [dark,setDark]=useState(false); const [showLangMenu,setShowLangMenu]=useState(false); const [pendingTool,setPendingTool]=useState<{name:string;hiName:string;desc:string}|null>(null); const [openedTool,setOpenedTool]=useState<{name:string;hiName:string;desc:string}|null>(null);
useEffect(()=>{const timer=window.setTimeout(()=>setIntro(false),2300);return()=>window.clearTimeout(timer);},[]); useEffect(()=>{window.history.replaceState({tanshuApp:true,section:'home'},'',window.location.pathname+'#home');const handlePop=()=>{if(openedTool){setOpenedTool(null);}else if(pendingTool){setPendingTool(null);}else if(mobile){setMobile(false);}else if(navStack.current.length>1){const previous=navStack.current.pop()||'home';setSection(previous);}else{setSection('home');}window.history.pushState({tanshuApp:true,section:navStack.current[navStack.current.length-1]||'home'},'',window.location.pathname+'#'+(navStack.current[navStack.current.length-1]||'home'));};window.addEventListener('popstate',handlePop);return()=>window.removeEventListener('popstate',handlePop);},[openedTool,pendingTool,mobile]); const hi=lang==='hi'; const tr=(en:string,h:string)=>hi?h:en;
const filtered=useMemo(()=>tools.filter(t=>(t[1]+' '+t[2]+' '+t[3]).toLowerCase().includes(query.toLowerCase())),[query]);
const filteredMakers=useMemo(()=>makers.filter(m=>(m.en+' '+m.hi+' '+m.sub).toLowerCase().includes(query.toLowerCase())),[query]);
const filteredCategories=useMemo(()=>categories.filter(k=>(k.en+' '+k.hi+' '+k.desc).toLowerCase().includes(query.toLowerCase())),[query]);
const go=(id:string)=>{if(id!==section){navStack.current.push(section);}setSection(id);setMobile(false);setQuery('');window.history.pushState({tanshuApp:true,section:id},'',window.location.pathname+'#'+id);window.scrollTo({top:0,behavior:'smooth'})}; const goBack=()=>{if(openedTool){setOpenedTool(null);return;}if(pendingTool){setPendingTool(null);return;}const previous=navStack.current.pop()||'home';setSection(previous);setMobile(false);window.history.pushState({tanshuApp:true,section:previous},'',window.location.pathname+'#'+previous);window.scrollTo({top:0,behavior:'smooth'});};
const toggleFav=(name:string)=>setFavorites(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name]);
const soon=(name:string,hiName=name,desc='')=>{setRecent(v=>[name,...v.filter(x=>x!==name)].slice(0,5));setPendingTool({name,hiName,desc});}; const openDirectoryTool=(t:(typeof tools)[number])=>soon(t[1],t[2],t[3]);
const side=[{id:'home',label:tr('Overview','ओवरव्यू'),icon:Home},{id:'maker',label:tr('Maker Tools','मेकर टूल्स'),icon:Sparkles},{id:'csc',label:tr('CSC Center','CSC सेंटर'),icon:Landmark},{id:'cyber',label:tr('Cyber Cafe','साइबर कैफे'),icon:Globe2},{id:'all',label:tr('All Categories','सभी कैटेगरी'),icon:Grid2X2}];
const currentCat=categories.find(c=>c.id===section);
const directoryTools = section==='favorites'
  ? tools.filter(t=>favorites.includes(t[1]))
  : section==='recent'
    ? tools.filter(t=>recent.includes(t[1]))
    : filtered.filter(t=>t[0]===section || section==='maker');
return <div className={dark?'app dark':'app light'}>
<aside className={'sidebar '+(mobile?'show':'')}><div className="brand"><div className="brandmark brandmark-premium"><span>T</span><i>✦</i></div><div><b>TANSHU</b><strong>DIGITAL TOOLS</strong><small>ALL IN ONE WORKSPACE</small></div><button className="close-nav" onClick={()=>setMobile(false)}><X size={18}/></button></div>
<div className="workspace-label">{tr('WORKSPACE','वर्कस्पेस')}</div><nav>{side.map(s=><button key={s.id} className={section===s.id?'nav-item active':'nav-item'} onClick={()=>go(s.id)}><s.icon size={18}/><span>{s.label}</span>{section===s.id&&<i/>}</button>)}</nav>
<div className="sidebar-label">{tr('YOUR LIBRARY','आपकी लाइब्रेरी')}</div><button className="nav-item" onClick={()=>go('favorites')}><Star size={18}/><span>{tr('Favorites','पसंदीदा')}</span><small>{favorites.length}</small></button><button className="nav-item" onClick={()=>go('recent')}><Clock3 size={18}/><span>{tr('Recently Used','हाल में इस्तेमाल')}</span></button>
<div className="side-bottom"><div className="secure"><ShieldCheck size={18}/><div><b>{tr('Privacy first','प्राइवेसी पहले')}</b><small>{tr('Your files stay yours','आपकी फाइलें आपकी हैं')}</small></div></div><div className="profile"><div className="avatar">T</div><div><b>TANSHU DIGITAL</b><small>{tr('Workspace preview','वर्कस्पेस प्रीव्यू')}</small></div><span className="online"/></div></div></aside>
<div className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button>{section!=='home'&&<button className="page-back-button" onClick={goBack}><ChevronRight size={15}/><span>{tr('BACK','वापस')}</span></button>}<div className="crumb"><span>{tr('Workspace','वर्कस्पेस')}</span><ChevronRight size={14}/><b>{currentCat?(hi?currentCat.hi:currentCat.en):section==='home'?tr('Overview','ओवरव्यू'):section==='all'?tr('All Categories','सभी कैटेगरी'):section==='favorites'?tr('Favorites','पसंदीदा'):section==='recent'?tr('Recently Used','हाल में इस्तेमाल'):tr('Maker Tools','मेकर टूल्स')}</b></div><div className="top-actions"><div className="language-picker"><button className="language" onClick={()=>setShowLangMenu(v=>!v)}><Languages size={16}/><span>{hi?'हिंदी':'English'}</span><ChevronRight size={13} className={showLangMenu?'lang-chevron open':'lang-chevron'}/></button>{showLangMenu&&<div className="language-menu"><button className={!hi?'chosen':''} onClick={()=>{setLang('en');setShowLangMenu(false)}}><span>🇬🇧</span> English { !hi&&<b>✓</b>}</button><button className={hi?'chosen':''} onClick={()=>{setLang('hi');setShowLangMenu(false)}}><span>🇮🇳</span> हिंदी { hi&&<b>✓</b>}</button></div>}</div><button className="icon-btn" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button><div className="top-avatar">T</div></div></header>
<main><div className="welcome-row hero-panel"><div className="hero-copy"><div className="eyebrow"><span className="pulse"/> {tr('YOUR DIGITAL WORKSPACE','आपका डिजिटल वर्कस्पेस')}</div><h1>{section==='home'?<>{tr('EVERYTHING YOU NEED.','आपका हर डिजिटल काम।')} <em>{tr('ALL IN ONE PLACE.','एक ही जगह पर।')}</em></>:currentCat?(hi?currentCat.hi:currentCat.en):tr('EXPLORE YOUR TOOLS','अपने टूल्स देखें')}</h1><p>{tr('A smarter workspace for CSC centers, cyber cafés and everyday digital work.','CSC सेंटर, साइबर कैफे और रोज़मर्रा के डिजिटल काम के लिए स्मार्ट वर्कस्पेस।')}</p></div><div className="date-chip"><Command size={15}/><span>{tr('Made for digital professionals','डिजिटल प्रोफेशनल्स के लिए')}</span></div><div className="hero-visual" aria-label="CSC centre, cyber cafe and public customers"><div className="hero-visual-top">ONE WORKSPACE · EVERYONE</div><div className="hero-people"><div className="hero-person"><span className="person-head p1"></span><span className="person-body b1"></span><small>CUSTOMERS</small></div><div className="hero-person"><span className="person-head p2"></span><span className="person-body b2"></span><small>CSC CENTER</small></div><div className="hero-person"><span className="person-head p3"></span><span className="person-body b3"></span><small>CYBER CAFE</small></div></div><div className="hero-device"><i></i><i></i><i></i><b>ONLINE SERVICES</b></div></div></div>
<div className="search-wrap"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr('Search tools, makers and categories...','टूल्स, मेकर और कैटेगरी खोजें...')}/><kbd>⌘ K</kbd></div>
{query.trim().length>0&&<div className="search-suggestions"><div className="suggestion-heading">{tr('INSTANT SEARCH RESULTS','तुरंत सर्च रिज़ल्ट')} · {filtered.length+filteredMakers.length+filteredCategories.length}</div>{filtered.slice(0,7).map(t=><button className="suggestion-item" key={'tool-'+t[1]} onClick={()=>openDirectoryTool(t)}><span className="suggestion-mark"><Search size={14}/></span><span><b>{hi?t[2]:t[1]}</b><small>{t[3]}</small></span><em>{tr('TOOL','टूल')}</em></button>)}{filteredMakers.slice(0,4).map(m=><button className="suggestion-item" key={'maker-'+m.en} onClick={()=>soon(m.en,m.hi,m.sub)}><span className="suggestion-mark"><Sparkles size={14}/></span><span><b>{hi?m.hi:m.en}</b><small>{m.sub}</small></span><em>MAKER</em></button>)}{filteredCategories.slice(0,3).map(k=><button className="suggestion-item" key={'cat-'+k.id} onClick={()=>go(k.id)}><span className="suggestion-mark"><Grid2X2 size={14}/></span><span><b>{hi?k.hi:k.en}</b><small>{k.desc}</small></span><em>{tr('CATEGORY','कैटेगरी')}</em></button>)}{filtered.length+filteredMakers.length+filteredCategories.length===0&&<div className="suggestion-empty">{tr('No matching tool found yet. Try another keyword.','अभी यह टूल नहीं मिला। दूसरा शब्द खोजें।')}</div>}</div>}
{section==='home'||section==='maker'?<><div className="section-head"><div><div className="eyebrow">{tr('START CREATING','बनाना शुरू करें')}</div><h2>{tr('Instant Maker Tools','इंस्टेंट मेकर टूल्स')} <span className="count">{String(makers.length).padStart(2,'0')}</span></h2><p>{tr('Popular tools for photo, PDF, printing, students and everyday counter work.','फोटो, PDF, प्रिंटिंग, स्टूडेंट और रोज़मर्रा के काउंटर के लोकप्रिय टूल्स।')}</p></div><button className="text-link" onClick={()=>go('maker')}>{tr('View all makers','सभी मेकर देखें')} <ArrowUpRight size={16}/></button></div>
<div className="maker-grid">{makers.filter(m=>(m.en+' '+m.hi+' '+m.sub).toLowerCase().includes(query.toLowerCase())).map((m,i)=><article className={'maker-card maker-'+i} key={m.en} onClick={()=>soon(m.en,m.hi,m.sub)}><div className="maker-top"><div className="tool-icon"><m.icon size={20}/></div>{m.tag&&<span className="tag">{m.tag}</span>}<button className={'fav '+(favorites.includes(m.en)?'saved':'')} onClick={e=>{e.stopPropagation();toggleFav(m.en)}}><Star size={16} fill={favorites.includes(m.en)?'currentColor':'none'}/></button></div><h3>{tr(m.en,m.hi)}</h3><p>{m.sub}</p><div className="card-foot"><span>{tr('Explore maker','मेकर खोलें')}</span><span className="arrow"><ArrowUpRight size={16}/></span></div></article>)}</div>
<div className="quick-panels"><article className="feature-panel csc-panel" onClick={()=>go('csc')}><div className="feature-icon"><Landmark/></div><div><span>{tr('SERVICE WORKSPACE','सर्विस वर्कस्पेस')}</span><h3>CSC CENTER TOOLS</h3><p>{tr('Application prep, document resize, service desk and more.','एप्लीकेशन तैयारी, डॉक्यूमेंट रिसाइज़ और सर्विस डेस्क।')}</p><b>{tr('Open workspace','वर्कस्पेस खोलें')} <ArrowUpRight size={15}/></b></div><div className="panel-glow"/><div className="scene-art csc-scene" aria-hidden="true"><div className="scene-window"><div className="scene-top"><i/><i/><i/></div><div className="scene-person"><span/><b/><i/></div><div className="scene-screen"><span/><span/><span/><strong>CSC</strong></div><div className="scene-paper"><i/><i/><i/><b/></div></div><div className="scene-caption">APPLICATION DESK <span>LIVE WORKFLOW</span></div></div></article><article className="feature-panel cyber-panel" onClick={()=>go('cyber')}><div className="feature-icon"><Globe2/></div><div><span>{tr('BUSINESS WORKSPACE','बिज़नेस वर्कस्पेस')}</span><h3>CYBER CAFE TOOLS</h3><p>{tr('Customer jobs, typing, scan, print and billing workflows.','कस्टमर जॉब, टाइपिंग, स्कैन, प्रिंट और बिलिंग।')}</p><b>{tr('Open workspace','वर्कस्पेस खोलें')} <ArrowUpRight size={15}/></b></div><div className="panel-glow"/><div className="scene-art cyber-scene" aria-hidden="true"><div className="scene-window"><div className="scene-top"><i/><i/><i/></div><div className="scene-monitor"><div className="monitor-screen"><span/><span/><span/><b>PRINT READY</b></div><i/></div><div className="scene-keyboard"/><div className="scene-writing"><div className="writing-lines"><i/><i/><i/><i/></div><span className="pencil"/></div></div><div className="scene-caption">CUSTOMER WORKSTATION <span>DESK READY</span></div></div></article></div>
</>:null}
{(section==='all'||section==='home'||section==='csc'||section==='cyber')&&<><div className="section-head category-heading"><div><div className="eyebrow">{tr('BUILT AROUND YOUR WORK','आपके काम के अनुसार')}</div><h2>{tr('Explore categories','कैटेगरी एक्सप्लोर करें')}</h2><p>{tr('Everything organized. Find the right tool without the clutter.','हर टूल सही जगह पर—बिना किसी उलझन के।')}</p></div><span className="muted-count">{categories.length} {tr('CATEGORIES','कैटेगरी')}</span></div><div className="category-grid">{categories.filter(c=>(section==='csc'?c.id==='csc':section==='cyber'?c.id==='cyber':true)&&((c.en+' '+c.hi+' '+c.desc).toLowerCase().includes(query.toLowerCase()))).map(c=><button className="category-card" key={c.id} onClick={()=>go(c.id)}><div className={'category-icon '+c.id}><c.icon size={20}/></div><div className="category-copy"><b>{hi?c.hi:c.en}</b><small>{c.desc}</small></div><span className="category-count">{c.id==='csc'?cscNames.length:c.id==='cyber'?cyberNames.length:tools.filter(t=>t[0]===c.id).length}</span><ChevronRight className="cat-arrow" size={16}/></button>)}</div></>}
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
        <button className="tool-row tool-row-action" key={t[1]} onClick={() => openDirectoryTool(t)}>
          <div className="tool-icon">{createElement(t[4] as any, { size: 19 })}</div>
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
        <div className="tool-icon">{createElement(t[4] as any, { size: 18 })}</div>
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