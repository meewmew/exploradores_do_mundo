const r=new Map;function n(e,t){t!==void 0&&r.set(e,t);try{return t!==void 0&&localStorage.setItem(e,t),localStorage.getItem(e)??r.get(e)??null}catch{return r.get(e)??null}}export{n as s};
