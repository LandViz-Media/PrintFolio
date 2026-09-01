/**
 * PrintFolio v0.1.2
 * Responsibility: Render print thumbnails. Prefer embedded slicer thumbnails;
 * otherwise render parsed G-code extrusion geometry or 3MF model geometry.
 */
(function(){
  "use strict";
  function draw(canvas,p){
    const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.fillStyle="#edf2f4";c.fillRect(0,0,w,h);
    if(p?.thumbnailDataUrl){const img=new Image();img.onload=()=>{const scale=Math.min((w-30)/img.width,(h-30)/img.height);const iw=img.width*scale,ih=img.height*scale;c.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih)};img.src=p.thumbnailDataUrl;return}
    if(p?.geometry?.length){drawGcode(c,w,h,p);return}
    if(p?.modelGeometry?.length){drawModel(c,w,h,p);return}
    c.fillStyle="#68757d";c.font="14px Arial";c.textAlign="center";c.fillText("No preview geometry available",w/2,h/2);c.textAlign="left";
  }
  function project(x,y,z){return[(x-y)*.7071,(x+y)*.3536-z*.85]}
  function fit(points,w,h){let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;for(const q of points){minU=Math.min(minU,q[0]);maxU=Math.max(maxU,q[0]);minV=Math.min(minV,q[1]);maxV=Math.max(maxV,q[1])}const sw=Math.max(maxU-minU,1),sh=Math.max(maxV-minV,1),scale=Math.min((w-50)/sw,(h-50)/sh),ox=(w-sw*scale)/2,oy=(h-sh*scale)/2;return q=>[ox+(q[0]-minU)*scale,oy+(q[1]-minV)*scale]}
  function drawGcode(c,w,h,p){const pts=[];for(const g of p.geometry){pts.push(project(g.x1,g.y1,g.z),project(g.x2,g.y2,g.z))}const P=fit(pts,w,h);c.strokeStyle="#1d2529";c.lineWidth=1.2;c.lineCap="round";for(const g of p.geometry){const a=P(project(g.x1,g.y1,g.z)),b=P(project(g.x2,g.y2,g.z));c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}label(c,"45° VIEW")}
  function drawModel(c,w,h,p){const pts=p.modelGeometry.map(v=>project(v[0],v[1],v[2])),P=fit(pts,w,h);c.fillStyle="#38434a";for(const q of pts){const a=P(q);c.fillRect(a[0],a[1],1.5,1.5)}label(c,"45° MODEL VIEW")}
  function label(c,text){c.fillStyle="#68757d";c.font="12px Arial";c.fillText(text,10,18)}
  window.GCodeRenderer={renderThumbnail:draw};
})();
