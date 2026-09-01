/**
 * G-Code Print Viewer v0.1.0
 * Responsibility: Render parsed extrusion geometry as a top-down thumbnail.
 * This is separated from parsing so it can become the future full renderer.
 */
(function(){
"use strict";
function render(canvas,p){const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.fillStyle="#edf2f4";c.fillRect(0,0,w,h);if(!p?.geometry?.length)return;
const b=p.bounds,sx=Math.max((b.maxX??1)-(b.minX??0),1),sy=Math.max((b.maxY??1)-(b.minY??0),1),pad=34,scale=Math.min((w-2*pad)/sx,(h-2*pad)/sy),ox=(w-sx*scale)/2,oy=(h-sy*scale)/2;
const X=x=>ox+(x-b.minX)*scale,Y=y=>h-oy-(y-b.minY)*scale;c.strokeStyle="#c5d0d5";c.lineWidth=1;c.strokeRect(ox,h-oy-sy*scale,sx*scale,sy*scale);
c.strokeStyle="#1d2529";c.lineWidth=Math.max(1,Math.min(3.2,scale*.2));c.lineCap="round";c.lineJoin="round";
for(const g of p.geometry){c.beginPath();c.moveTo(X(g.x1),Y(g.y1));c.lineTo(X(g.x2),Y(g.y2));c.stroke()}c.fillStyle="#68757d";c.font="12px Arial";c.fillText("TOP",10,18)}
window.GCodeRenderer={renderThumbnail:render};
})();
