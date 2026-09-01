/**
 * PrintFolio v0.1.1
 * Responsibility: Render a print thumbnail. Prefer an embedded slicer
 * thumbnail when available; otherwise render parsed extrusion geometry using
 * an isometric/diagonal projection suitable for the future full renderer.
 */
(function(){
  "use strict";
  function draw(canvas,p){
    const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.fillStyle="#edf2f4";c.fillRect(0,0,w,h);
    if(p?.thumbnailDataUrl){const img=new Image();img.onload=()=>{const scale=Math.min((w-30)/img.width,(h-30)/img.height);const iw=img.width*scale,ih=img.height*scale;c.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih)};img.src=p.thumbnailDataUrl;return}
    if(!p?.geometry?.length)return;
    const b=p.bounds,xs=Math.max((b.maxX??1)-(b.minX??0),1),ys=Math.max((b.maxY??1)-(b.minY??0),1),zs=Math.max((b.maxZ??0)-(b.minZ??0),0);const pts=[];
    const project=(x,y,z)=>{const u=(x-y)*.7071,v=(x+y)*.3536-z*.85;return[u,v]};
    for(const g of p.geometry){pts.push(project(g.x1,g.y1,g.z),project(g.x2,g.y2,g.z))}let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;for(const q of pts){minU=Math.min(minU,q[0]);maxU=Math.max(maxU,q[0]);minV=Math.min(minV,q[1]);maxV=Math.max(maxV,q[1])}const sw=Math.max(maxU-minU,1),sh=Math.max(maxV-minV,1),scale=Math.min((w-45)/sw,(h-45)/sh);const ox=(w-sw*scale)/2,oy=(h-sh*scale)/2;const P=q=>[ox+(q[0]-minU)*scale,oy+(q[1]-minV)*scale];c.strokeStyle="#1d2529";c.lineWidth=Math.max(1,Math.min(3,scale*.18));c.lineCap="round";for(const g of p.geometry){const a=P(project(g.x1,g.y1,g.z)),b2=P(project(g.x2,g.y2,g.z));c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b2[0],b2[1]);c.stroke()}c.fillStyle="#68757d";c.font="12px Arial";c.fillText("45° VIEW",10,18)
  }
  window.GCodeRenderer={renderThumbnail:draw};
})();
