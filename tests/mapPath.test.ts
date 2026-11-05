import { expect, it } from 'vitest';
import { removeCollapsedMapRings } from '../scripts/map-path.mjs';

it('descarta apenas anéis de ponto único, preservando contornos, furos e linhas',()=>{
 const outline='M0,0L10,0L10,10L0,10Z',hole='M2,2L2,4L4,4L4,2Z',line='M1,1L2,2L1,1Z';
 expect(removeCollapsedMapRings(`M8.25,-3L8.25,-3L8.25,-3Z${outline}M0,0L0,0L0,0Z${hole}${line}`)).toBe(outline+hole+line);
 expect(removeCollapsedMapRings(outline+hole)).toBe(outline+hole);
});
