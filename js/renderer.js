/**
 * PrintFolio v0.1.4
 * Responsibility: Render print thumbnails. Prefer embedded slicer thumbnails;
 * otherwise render G-code extrusion geometry or 3MF model geometry with a
 * bright, colorblind-conscious isometric presentation.
 */
(function(){
  "use strict";

  const palette = {
    outer: "#f28c28",   // orange
    inner: "#1976a3",   // blue
    infill: "#20a39e",  // turquoise
    skin: "#d95f9f",    // pink
    support: "#4a4a4a", // neutral dark gray
    other: "#4169a1"    // blue fallback so unknown features never become a dark silhouette
  };

  function draw(canvas,p){
    const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
    c.clearRect(0,0,w,h);
    c.fillStyle="#f8fbfc";
    c.fillRect(0,0,w,h);

    if(p?.thumbnailDataUrl){
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min((w-26)/img.width,(h-26)/img.height);
        const iw=img.width*scale,ih=img.height*scale;
        c.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih);
      };
      img.src=p.thumbnailDataUrl;
      return;
    }
    if(p?.previewGeometry?.length){drawGcode(c,w,h,p);return}
    if(p?.modelGeometry?.length){drawModel(c,w,h,p);return}
    c.fillStyle="#536169";
    c.font="14px Arial";
    c.textAlign="center";
    c.fillText("No preview geometry available",w/2,h/2);
    c.textAlign="left";
  }

  function project(x,y,z){return[(x-y)*.7071,(x+y)*.3536-z*.85]}

  function boundsOf(points){
    let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;
    for(const q of points){
      minU=Math.min(minU,q[0]); maxU=Math.max(maxU,q[0]);
      minV=Math.min(minV,q[1]); maxV=Math.max(maxV,q[1]);
    }
    return {minU,maxU,minV,maxV,sw:Math.max(maxU-minU,1),sh:Math.max(maxV-minV,1)};
  }

  function fit(points,w,h,pad=45){
    const b=boundsOf(points);
    const scale=Math.min((w-pad*2)/b.sw,(h-pad*2)/b.sh);
    const ox=(w-b.sw*scale)/2,oy=(h-b.sh*scale)/2;
    return q=>[ox+(q[0]-b.minU)*scale,oy+(q[1]-b.minV)*scale];
  }

  function drawBed(c,w,h,P,b){
    // A subtle projected grid gives the G-code preview the visual language of
    // a real slicer without making the grid compete with the print itself.
    const step=Math.max(b.sw,b.sh)/6;
    c.save();
    c.lineWidth=0.7;
    c.strokeStyle="#c8d1d5";
    for(let i=-6;i<=12;i++){
      const x=i*step;
      const a=P([x-b.sw*.25,-b.sh*.35]);
      const d=P([x+b.sh*1.25,b.sh*1.65]);
      c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(d[0],d[1]);c.stroke();
    }
    for(let i=-6;i<=12;i++){
      const y=i*step;
      const a=P([-b.sw*.25,y-b.sh*.35]);
      const d=P([b.sw*1.65,y+b.sw*1.25]);
      c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(d[0],d[1]);c.stroke();
    }
    c.restore();
  }

  function featureColor(type){
    const t=String(type||"").toUpperCase();
    if(t.includes("WALL-OUTER")||t.includes("PERIMETER"))return palette.outer;
    if(t.includes("WALL-INNER")||t.includes("WALL"))return palette.inner;
    if(t.includes("FILL")||t.includes("INFILL"))return palette.infill;
    if(t.includes("SKIN")||t.includes("TOP"))return palette.skin;
    if(t.includes("SUPPORT"))return palette.support;
    return palette.other;
  }

  function drawGcode(c,w,h,p){
    const pts=[];
    for(const g of (p.previewGeometry||p.geometry)){
      pts.push(project(g.x1,g.y1,g.z),project(g.x2,g.y2,g.z));
    }
    const P=fit(pts,w,h,38),b=boundsOf(pts);
    drawBed(c,w,h,P,b);

    // A light underlay keeps dense Cura toolpaths readable even when a feature
    // type is missing or unusual. The feature colors are then drawn on top.
    c.save();
    c.strokeStyle="#8fb6c9";
    c.lineWidth=3.4;
    c.globalAlpha=.22;
    c.lineCap="round";
    for(const g of (p.previewGeometry||p.geometry)){const a=P(project(g.x1,g.y1,g.z)),b2=P(project(g.x2,g.y2,g.z));c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b2[0],b2[1]);c.stroke()}
    c.restore();

    // Draw in file order so lower layers naturally sit behind later layers.
    for(const g of (p.previewGeometry||p.geometry)){
      const a=P(project(g.x1,g.y1,g.z)),b2=P(project(g.x2,g.y2,g.z));
      const t=String(g.type||"").toUpperCase();
      c.strokeStyle=featureColor(t);
      c.lineWidth=t.includes("WALL-OUTER")?2.6:(t.includes("WALL")?2.0:1.5);
      c.lineCap="round";
      c.globalAlpha=t.includes("TRAVEL")?0.18:0.94;
      c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b2[0],b2[1]);c.stroke();
    }
    c.globalAlpha=1;
    label(c,"45° G-CODE VIEW");
  }

  function drawModel(c,w,h,p){
    const pts=p.modelGeometry.map(v=>project(v[0],v[1],v[2])),P=fit(pts,w,h,38),b=boundsOf(pts);
    drawBed(c,w,h,P,b);
    c.fillStyle=palette.outer;
    c.globalAlpha=.78;
    for(const q of pts){const a=P(q);c.fillRect(a[0]-1,a[1]-1,2,2)}
    c.globalAlpha=1;
    label(c,"45° MODEL VIEW");
  }

  function label(c,text){
    c.fillStyle="#536169";
    c.font="bold 11px Arial";
    c.fillText(text,10,17);
  }

  window.GCodeRenderer={renderThumbnail:draw};
})();
