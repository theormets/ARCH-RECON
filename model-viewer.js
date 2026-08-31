async function startBellModel(){
  const canvas=document.getElementById('model'),status=document.getElementById('model-status');if(!canvas)return;
  try{
    const gl=canvas.getContext('webgl',{antialias:true,alpha:false});if(!gl)throw Error('3D rendering is unavailable here. Download the STL or open the engineering drawing.');
    const blob=await ResearchAssets.bytes('cad/CAD/Bell_Hook_Inner_Edge_Join.stl',true),raw=await blob.arrayBuffer(),view=new DataView(raw),count=view.getUint32(80,true);
    if(raw.byteLength!==84+count*50)throw Error('Unsupported STL layout');
    const vertices=new Float32Array(count*18);let j=0;
    for(let f=0;f<count;f++){const off=84+50*f;for(let v=0;v<3;v++){for(let a=0;a<3;a++){const p=view.getFloat32(off+12+v*12+a*4,true);vertices[j++]=(p-(a===2?4.08:0))/5;}for(let a=0;a<3;a++)vertices[j++]=view.getFloat32(off+a*4,true);}}
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('3D shader unavailable');return s;};
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec3 n;uniform vec3 u;uniform vec3 v;uniform vec3 w;uniform vec2 scale;varying vec3 normal;void main(){gl_Position=vec4(dot(p,u)*scale.x,dot(p,v)*scale.y,-dot(p,w)*0.1,1.0);normal=vec3(dot(n,u),dot(n,v),dot(n,w));}'));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 normal;void main(){vec3 N=normalize(normal);if(!gl_FrontFacing)N=-N;vec3 L=normalize(vec3(-0.4,0.65,1.0));float d=max(dot(N,L),0.0);float s=pow(max(dot(reflect(-L,N),vec3(0.0,0.0,1.0)),0.0),35.0);vec3 c=vec3(0.64,0.36,0.18)*(0.38+0.65*d)+vec3(0.35)*s;gl_FragColor=vec4(c,1.0);}'));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('3D viewer could not initialise');gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    for(const[name,offset]of[['p',0],['n',12]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,24,offset);}
    const loc={};for(const k of ['u','v','w','scale'])loc[k]=gl.getUniformLocation(program,k);
    let yaw=.55,elev=.4,zoom=.95;
    function draw(){const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.929,.941,.91,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);const c=Math.cos(yaw),s=Math.sin(yaw),ce=Math.cos(elev),se=Math.sin(elev);gl.uniform3f(loc.u,c,s,0);gl.uniform3f(loc.v,-s*se,c*se,ce);gl.uniform3f(loc.w,s*ce,-c*ce,se);gl.uniform2f(loc.scale,zoom/(w/h),zoom);gl.drawArrays(gl.TRIANGLES,0,count*3);}
    const reset=()=>{yaw=.55;elev=.4;zoom=.95;draw();};
    document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{const val=b.dataset.view;zoom=.95;if(val==='front'){yaw=0;elev=0;}else if(val==='right'){yaw=Math.PI/2;elev=0;}else if(val==='top'){yaw=0;elev=Math.PI/2;}else return reset();draw();});
    const pointers=new Map();let previousPinch=0;
    canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});previousPinch=0;};
    canvas.onpointermove=e=>{const old=pointers.get(e.pointerId);if(!old)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(previousPinch)zoom=Math.max(.35,Math.min(2.8,zoom*d/previousPinch));previousPinch=d;}else{yaw+=(e.clientX-old.x)*.01;elev=Math.max(-Math.PI/2,Math.min(Math.PI/2,elev+(e.clientY-old.y)*.01));}draw();};
    canvas.onpointerup=canvas.onpointercancel=e=>{pointers.delete(e.pointerId);previousPinch=0;};
    canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(2.8,zoom*Math.exp(-e.deltaY*.001)));draw();},{passive:false});canvas.ondblclick=reset;canvas.tabIndex=0;canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();yaw+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;elev+=e.key==='ArrowUp'?.12:e.key==='ArrowDown'?-.12:0;draw();}};
    new ResizeObserver(draw).observe(canvas);status.textContent='Approved source STL · drag to inspect · all dimensions in mm';draw();
  }catch(e){status.textContent=e.message;}
}
