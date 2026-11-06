import { expect,it } from 'vitest';
import { applyBrazilViewerAppearance, type ViewerPBRMaterial } from '../src/services/brazilViewerAppearance';
function material(name:string,metal:number|undefined,rough:number|undefined){
 let color=[1,1,1,1],metallic=metal,roughness=rough;
 const pbr:ViewerPBRMaterial={get baseColorFactor(){return color;},get metallicFactor(){return metallic;},get roughnessFactor(){return roughness;},setBaseColorFactor(value){color=[...value];},setMetallicFactor(value){metallic=value;},setRoughnessFactor(value){roughness=value;}};
 return {name,pbrMetallicRoughness:pbr};
}
it('a aparência da instância é reversível e não deixa cores/metais alterados no cache',()=>{
 const terrain=material('Terreno DEM',1,.95),base=material('Base cartográfica',1,1),river=material('Default',undefined,undefined),untouched=material('Outro material',1,.95);
 const model={materials:[terrain,base,river,untouched]};
 const restore=applyBrazilViewerAppearance(model);
 expect(terrain.pbrMetallicRoughness.metallicFactor).toBe(0);
 expect(base.pbrMetallicRoughness.metallicFactor).toBe(0);
 expect(river.pbrMetallicRoughness.metallicFactor).toBeUndefined();
 expect(river.pbrMetallicRoughness.baseColorFactor).not.toEqual([1,1,1,1]);
 expect(untouched.pbrMetallicRoughness.baseColorFactor).toEqual([1,1,1,1]);
 expect(untouched.pbrMetallicRoughness.metallicFactor).toBe(1);
 restore();
 for(const item of model.materials)expect(item.pbrMetallicRoughness.baseColorFactor).toEqual([1,1,1,1]);
 expect(terrain.pbrMetallicRoughness.metallicFactor).toBe(1);
 expect(terrain.pbrMetallicRoughness.roughnessFactor).toBe(.95);
 expect(river.pbrMetallicRoughness.roughnessFactor).toBeUndefined();
});
