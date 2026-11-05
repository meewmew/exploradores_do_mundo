import { describe, expect, it } from 'vitest';
import { applyARTransformAction, initialARTransform, updateARGesture } from '../src/services/arGestures';

describe('Manipulação local do modelo RA',()=>{
 it('acompanha arraste para girar e limita a inclinação, sem alterar escala',()=>{
  const initial=initialARTransform();
  const moved=updateARGesture(initial,[{id:1,x:20,y:20}],[{id:1,x:70,y:320}]);
  expect(moved).toEqual({scale:1,rotation:20,tilt:20});expect(initial).toEqual(initialARTransform());
 });
 it('usa a distância dos dois dedos para ampliar/reduzir entre 0,5 e 3 vezes',()=>{
  const before=[{id:1,x:0,y:0},{id:2,x:100,y:0}];
  expect(updateARGesture(initialARTransform(),before,[{id:1,x:0,y:0},{id:2,x:200,y:0}]).scale).toBe(2);
  expect(updateARGesture(initialARTransform(),before,[{id:1,x:0,y:0},{id:2,x:400,y:0}]).scale).toBe(3);
  expect(updateARGesture(initialARTransform(),before,[{id:1,x:0,y:0},{id:2,x:10,y:0}]).scale).toBe(.5);
 });
 it('gira com dois dedos sem salto ao cruzar a direção de 180 graus',()=>{
  const point=(angle:number)=>({id:2,x:100*Math.cos(angle*Math.PI/180),y:100*Math.sin(angle*Math.PI/180)});
  const origin={id:1,x:0,y:0};
  const moved=updateARGesture(initialARTransform(),[origin,point(179)],[origin,point(-179)]);
  expect(moved.rotation).toBeCloseTo(2);expect(moved.scale).toBeCloseTo(1);
 });
 it('trocar ou levantar dedos não salta a pose e permite continuar com o dedo restante',()=>{
  const current={scale:2,rotation:30,tilt:4},single=[{id:1,x:0,y:0}],pair=[...single,{id:2,x:100,y:0}];
  expect(updateARGesture(current,single,pair)).toBe(current);
  expect(updateARGesture(current,pair,[{id:2,x:100,y:0}])).toBe(current);
  expect(updateARGesture(current,single,[{id:3,x:200,y:200}])).toBe(current);
  expect(updateARGesture(current,[{id:2,x:100,y:0}],[{id:2,x:110,y:0}])).toEqual({...current,rotation:34});
 });
 it('os botões ajustam a escala atual após pinça, e restaurar recupera a pose inicial',()=>{
  const pinched={scale:2,rotation:60,tilt:10};
  expect(applyARTransformAction(pinched,'ar:set-scale',{delta:.25})).toEqual({...pinched,scale:2.25});
  expect(applyARTransformAction(pinched,'ar:set-scale',{scale:NaN})).toBe(pinched);
  expect(applyARTransformAction(pinched,'ar:reset')).toEqual(initialARTransform());
 });
});
