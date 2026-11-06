export interface ViewerPBRMaterial {
 readonly baseColorFactor:readonly number[];
 readonly metallicFactor:number|undefined;
 readonly roughnessFactor:number|undefined;
 setBaseColorFactor(value:number[]):void;
 setMetallicFactor(value:number):void;
 setRoughnessFactor(value:number):void;
}
export interface ViewerModel {materials:{name:string;pbrMetallicRoughness:ViewerPBRMaterial}[]}
export const COUNTRY_VIEWER_APPEARANCE={
 environment:'lighting/brazil-soft-key.hdr',
 orbit:'0deg 42deg 105%',
 exposure:'1',shadowIntensity:'0.18',shadowSoftness:'0.65',
} as const;
// Style only the displayed instance. Restore materials on teardown so the
// viewer's shared model cache and the AR scene keep their original appearance.
export function applyCountryViewerAppearance(model:ViewerModel):()=>void {
 const restore:(()=>void)[]=[];
 for(const material of model.materials){
  const pbr=material.pbrMetallicRoughness;
  const terrain=material.name==='Terreno DEM',base=material.name==='Base cartográfica',river=material.name==='Default';
  if(!terrain&&!base&&!river)continue;
  const color=[...pbr.baseColorFactor],metallic=pbr.metallicFactor,roughness=pbr.roughnessFactor;
  restore.push(()=>{pbr.setBaseColorFactor(color);if(typeof metallic==='number')pbr.setMetallicFactor(metallic);if(typeof roughness==='number')pbr.setRoughnessFactor(roughness);});
  if(typeof metallic==='number')pbr.setMetallicFactor(0);
  if(typeof roughness==='number')pbr.setRoughnessFactor(terrain ? 0.94 : 1);
  pbr.setBaseColorFactor(terrain?[.9,.95,.85,1]:base?[.32,.4,.42,1]:[.85,.48,.32,1]);
 }
 return ()=>{for(const reset of restore)reset();};
}

// Keep the original exports for existing callers while the profile is shared.
export const BRAZIL_VIEWER_APPEARANCE=COUNTRY_VIEWER_APPEARANCE;
export const applyBrazilViewerAppearance=applyCountryViewerAppearance;
