const hex=(buffer:ArrayBuffer)=>Array.from(new Uint8Array(buffer),v=>v.toString(16).padStart(2,'0')).join('');
export async function verifyOrganizerPassword(password:string,encoded:string):Promise<boolean>{
 try{
  if(encoded.split(':').length!==5)return false;
  const [scheme,algorithm,count,salt,expected]=encoded.split(':');const iterations=Number(count);
  if(scheme!=='pbkdf2'||algorithm!=='sha256'||!Number.isInteger(iterations)||iterations<100000||iterations>2000000||!/^([a-f0-9]{2}){16,64}$/.test(salt)||!/^([a-f0-9]{2}){32}$/.test(expected))return false;
  const saltBytes=Uint8Array.from(salt.match(/../g)!,s=>parseInt(s,16));
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const derived=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:saltBytes,iterations},key,256);
  const actual=hex(derived);let different=0;for(let i=0;i<actual.length;i++)different|=actual.charCodeAt(i)^expected.charCodeAt(i);return different===0;
 }catch{return false;}
}
