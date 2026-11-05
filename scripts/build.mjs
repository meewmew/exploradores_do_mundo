await import('./prepare-ar.mjs');
await import('./validate-content.mjs');
const { build } = await import('vite');
await build();
