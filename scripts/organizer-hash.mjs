import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
const terminal=createInterface({input:process.stdin,output:process.stdout});
const password=await terminal.question('Escolha a senha do Organizador (não será salva): ');terminal.close();
if(password.length<8)throw new Error('Use pelo menos 8 caracteres.');
const salt=randomBytes(16).toString('hex'),iterations=210000;
const hash=pbkdf2Sync(password,Buffer.from(salt,'hex'),iterations,32,'sha256').toString('hex');
console.log(`\nCopie o valor abaixo para VITE_ORGANIZER_PASSWORD_HASH no .env.local ou nas variáveis do GitHub:\npbkdf2:sha256:${iterations}:${salt}:${hash}`);
