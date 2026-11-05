import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { PNG } from 'pngjs';
import { loadEnv } from 'vite';
import { META, IMPLEMENTED_CONTINENTS } from './config.mjs';

const env={...loadEnv('production',process.cwd(),''),...process.env};
const base=new URL(env.VITE_PUBLIC_URL || 'https://localhost:5173/');
if(base.protocol!=='https:')throw new Error('VITE_PUBLIC_URL deve usar HTTPS.');
if(!base.pathname.endsWith('/'))throw new Error('VITE_PUBLIC_URL deve terminar com /.');
base.search='';base.hash='';
await mkdir('public/markers',{recursive:true});await mkdir('public/print',{recursive:true});
function matrix(id){
  // ARToolKit 3x3: três cantos de orientação, seis bits em ordem de leitura inversa.
  // 1 = célula preta. A disposição corresponde à coleção indicada na documentação AR.js.
  return [[1,(id>>5)&1,(id>>4)&1],[(id>>3)&1,(id>>2)&1,(id>>1)&1],[1,id&1,0]];
}
const manifest=[];
function outputPdf(file,title){
  const doc=new PDFDocument({autoFirstPage:false,size:'A4',margin:42,info:{Title:title,Author:'Exploradores do Mundo',CreationDate:new Date(0)}});
  const out=createWriteStream(file);
  const done=new Promise((resolve,reject)=>{out.on('finish',resolve);out.on('error',reject);doc.on('error',reject);});
  doc.pipe(out);
  return {doc,done};
}
function addSheet(doc,id,url){
  doc.addPage();
  doc.rect(0,0,595.28,120).fill('#ffe5f0');doc.fillColor('#5c3a45').font('Helvetica').fontSize(12).text('EXPLORADORES DO MUNDO',42,30);
  doc.font('Helvetica-Bold').fontSize(36).text(META[id].nome,42,55);
  doc.font('Helvetica').fontSize(13).text('Uma folha. Uma descoberta. Um mundo para conhecer.',42,100);
  doc.fontSize(14).text('1. Leia o QR com a câmera do celular para abrir o app.',42,150,{width:511});
  doc.text('2. Toque em "Iniciar realidade aumentada" ou "Ver em RA".',42,180,{width:511});
  doc.text('3. Autorize a câmera e aponte para o marcador abaixo.',42,210,{width:511});
  doc.image(`public/markers/${id}-qr.png`,48,290,{width:190});
  // 255.12 pt = 90 mm: o quadrado preto excede o mínimo de 8 cm.
  doc.image(`public/markers/${id}-ar.png`,294,258,{width:255.12});
  doc.font('Helvetica-Bold').fontSize(14).text('QR Code: abrir o app',42,540,{width:210,align:'center'}).text('Marcador RA: 9 cm',282,540,{width:280,align:'center'});
  doc.font('Helvetica').fontSize(12).text('O QR abre o app. A RA reconhece o quadrado preto.',42,584,{width:511,align:'center'});
  doc.roundedRect(42,625,511,100,12).fill('#f2f7f4');doc.fillColor('#5c3a45').fontSize(16).text('Mantenha o marcador inteiro na câmera',60,643,{width:475,align:'center'});
  doc.fontSize(12).text('Papel fosco - impressão em tamanho real (100%)\nFolha plana - boa iluminação - sem reflexos',60,675,{width:475,align:'center',lineGap:5});
  doc.fontSize(9).text(url.href,42,748,{width:511,align:'center',link:url.href}).text(`ID: ${id} | barcode 3x3: ${Object.keys(META).indexOf(id)} | Natural Earth: domínio público`,42,783,{width:511,align:'center'});
}
const all=outputPdf('public/print/todos-continentes-A4.pdf','Exploradores do Mundo - seis continentes para testar RA');
for(const id of IMPLEMENTED_CONTINENTS){
  const code=Object.keys(META).indexOf(id),cells=matrix(code), url=new URL(base);url.searchParams.set('continente',id);
  const opts={errorCorrectionLevel:'M',margin:4,width:1200};
  await QRCode.toFile(`public/markers/${id}-qr.png`,url.href,opts);
  await writeFile(`public/markers/${id}-qr.svg`,await QRCode.toString(url.href,{...opts,type:'svg'}));
  let rects='<rect width="12" height="12" fill="black"/><rect x="3" y="3" width="6" height="6" fill="white"/>';
  cells.forEach((row,y)=>row.forEach((v,x)=>{if(v)rects+=`<rect x="${3+x*2}" y="${3+y*2}" width="2" height="2" fill="black"/>`;}));
  await writeFile(`public/markers/${id}-ar.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${rects}</svg>`);
  const png=new PNG({width:1200,height:1200});
  for(let y=0;y<1200;y++)for(let x=0;x<1200;x++){
    const inside=x>=300&&x<900&&y>=300&&y<900;
    const black=!inside||cells[Math.floor((y-300)/200)]?.[Math.floor((x-300)/200)]===1;
    const offset=(y*1200+x)*4;png.data.fill(black?0:255,offset,offset+3);png.data[offset+3]=255;
  }
  await writeFile(`public/markers/${id}-ar.png`,PNG.sync.write(png));
  const file=`public/print/${id}-A4.pdf`;
  const {doc,done}=outputPdf(file,`Exploradores do Mundo - ${META[id].nome}`);
  addSheet(doc,id,url);addSheet(all.doc,id,url);
  doc.end();await done;
  manifest.push({id,barcode:code,url:url.href,pdf:`print/${id}-A4.pdf`,markerMm:90});
  console.log(`${id}: QR + barcode ${code} + PDF A4 → ${url.href}`);
}
all.doc.end();await all.done;
console.log('PDF único com as seis folhas A4: public/print/todos-continentes-A4.pdf');
await writeFile('public/markers/manifest.json',JSON.stringify(manifest,null,2)+'\n');
if(!env.VITE_PUBLIC_URL)console.warn('Folhas locais: defina VITE_PUBLIC_URL e regenere antes de distribuir.');
