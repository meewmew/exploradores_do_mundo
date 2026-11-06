// Procedural studio lighting only; contains no geographic or elevation data. MIT.
import { mkdir,writeFile } from 'node:fs/promises';
const width=64,height=32,data=[],sun=[-.65,.67,.36];
const length=Math.hypot(...sun);for(let i=0;i<3;i++)sun[i]/=length;
for(let y=0;y<height;y++){
 const channels=[[],[],[],[]];
 for(let x=0;x<width;x++){
  const phi=(x+.5)/width*2*Math.PI-Math.PI,theta=(y+.5)/height*Math.PI;
  const direction=[Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi)];
  const angle=Math.acos(Math.min(1,Math.max(-1,direction.reduce((n,v,i)=>n+v*sun[i],0))));
  const key=7*Math.exp(-angle*angle/(2*.26*.26)),ambient=direction[1]>0?.16:.055;
  const rgb=[ambient+key,ambient*.98+key*.95,ambient*.93+key*.85],exponent=Math.ceil(Math.log2(Math.max(...rgb))),scale=256/2**exponent;
  for(let c=0;c<3;c++)channels[c].push(Math.min(255,Math.floor(rgb[c]*scale)));channels[3].push(exponent+128);
 }
 data.push(2,2,0,width);for(const channel of channels)data.push(width,...channel);
}
await mkdir('public/lighting',{recursive:true});
await writeFile('public/lighting/brazil-soft-key.hdr',Buffer.concat([Buffer.from(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`),Buffer.from(data)]));
