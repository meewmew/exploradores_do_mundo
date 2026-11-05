import { readFile, stat } from 'node:fs/promises';
const reports=JSON.parse(await readFile('models-report.json','utf8'));
for(const r of reports){const s=await stat(`public/${r.arquivo}`);if(r.triangulos>(r.tipo==='pais'?3000:20000)||s.size>(r.tipo==='pais'?60:400)*1024)throw new Error(`Orçamento: ${r.id}`);}
console.log(`${reports.length} modelos dentro do orçamento.`);
