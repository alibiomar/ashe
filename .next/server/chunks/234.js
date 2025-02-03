"use strict";exports.id=234,exports.ids=[234],exports.modules={234:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{default:()=>v});var i=r(8732),n=r(2015),o=r(3070),l=e([o]);o=(l.then?(await l)():l)[0];let u=`
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,s=`
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}`,v=({grid:e=15,mouse:t=.1,strength:r=.15,relaxation:a=.9,imageSrc:l,className:v=""})=>{let d=(0,n.useRef)(null),m=(0,n.useRef)(1),p=(0,n.useRef)(null),f=(0,n.useRef)(null);return(0,n.useEffect)(()=>{if(!d.current)return;let i=d.current,n=new o.Scene,v=new o.WebGLRenderer({antialias:!0,alpha:!0,powerPreference:"high-performance"});v.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.appendChild(v.domElement);let c=new o.OrthographicCamera(0,0,0,0,-1e3,1e3);c.position.z=2,p.current=c;let h={time:{value:0},resolution:{value:new o.Vector4},uTexture:{value:null},uDataTexture:{value:null}};new o.TextureLoader().load(l,e=>{e.minFilter=o.LinearFilter,m.current=e.image.width/e.image.height,h.uTexture.value=e,y()});let x=new Float32Array(4*e*e);for(let t=0;t<e*e;t++)x[4*t]=255*Math.random()-125,x[4*t+1]=255*Math.random()-125;f.current=new Float32Array(x);let w=new o.DataTexture(x,e,e,o.RGBAFormat,o.FloatType);w.needsUpdate=!0,h.uDataTexture.value=w;let g=new o.ShaderMaterial({side:o.DoubleSide,uniforms:h,vertexShader:u,fragmentShader:s}),M=new o.PlaneGeometry(1,1,e-1,e-1),T=new o.Mesh(M,g);n.add(T);let y=()=>{let e=i.offsetWidth,t=i.offsetHeight,r=e/t,a=m.current;v.setSize(e,t);let n=Math.max(r/a,1);T.scale.set(a*n,n,1);let o=1*r;c.left=-o/2,c.right=o/2,c.top=.5,c.bottom=-.5,c.updateProjectionMatrix(),h.resolution.value.set(e,t,1,1)},D={x:0,y:0,prevX:0,prevY:0,vX:0,vY:0},L=e=>{let t=i.getBoundingClientRect(),r=(e.clientX-t.left)/t.width,a=1-(e.clientY-t.top)/t.height;D.vX=r-D.prevX,D.vY=a-D.prevY,Object.assign(D,{x:r,y:a,prevX:r,prevY:a})},R=()=>{w.needsUpdate=!0,Object.assign(D,{x:0,y:0,prevX:0,prevY:0,vX:0,vY:0})};i.addEventListener("mousemove",L),i.addEventListener("mouseleave",R),window.addEventListener("resize",y),y();let X=()=>{requestAnimationFrame(X),h.time.value+=.05;let i=w.image.data;for(let t=0;t<e*e;t++)i[4*t]*=a,i[4*t+1]*=a;let o=e*D.x,l=e*D.y,u=e*t;for(let t=0;t<e;t++)for(let a=0;a<e;a++){let n=Math.pow(o-t,2)+Math.pow(l-a,2);if(n<u*u){let o=4*(t+e*a),l=Math.min(u/Math.sqrt(n),10);i[o]+=100*r*D.vX*l,i[o+1]-=100*r*D.vY*l}}w.needsUpdate=!0,v.render(n,c)};return X(),()=>{i.removeEventListener("mousemove",L),i.removeEventListener("mouseleave",R),window.removeEventListener("resize",y),v.dispose(),M.dispose(),g.dispose(),w.dispose(),h.uTexture.value&&h.uTexture.value.dispose()}},[e,t,r,a,l]),(0,i.jsx)("div",{ref:d,className:`w-full h-full overflow-hidden ${v}`})};a()}catch(e){a(e)}})}};