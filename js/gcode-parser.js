/**
 * G-Code Print Viewer v0.1.0
 * Responsibility: Parse common 3D-printer G-code into metadata and extrusion
 * geometry used by the preview renderer.
 */
(function(){
"use strict";
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const find=(s,r)=>{const m=s.match(r);return m?num(m[1]):null};
function time(s){if(!Number.isFinite(s)||s<0)return"—";s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}h ${String(m).padStart(2,"0")}m ${String(x).padStart(2,"0")}s`:`${m}m ${String(x).padStart(2,"0")}s`}
function parse(text,fileName){
const p={fileName:fileName||"Untitled.gcode",printer:null,slicer:null,sourceModel:null,printTimeSeconds:null,filamentMeters:null,layerHeight:null,layerCount:0,gcodeFlavor:null,printSpeed:null,travelSpeed:null,nozzleTemperature:null,initialNozzleTemperature:null,bedTemperature:null,initialBedTemperature:null,fanMax:null,coolingDetected:false,extrusionMode:null,settings:{},bounds:{minX:null,maxX:null,minY:null,maxY:null,minZ:null,maxZ:null},movement:{extrusionMoves:0,travelMoves:0,retractions:0,extrusionLength:0,minFeedRate:null,maxFeedRate:null},geometry:[]};
let x=0,y=0,z=0,e=0,f=null,absXYZ=true,absE=true,layer=-1;
const bound=(a,v)=>{if(v===null)return;p.bounds["min"+a]=p.bounds["min"+a]===null?v:Math.min(p.bounds["min"+a],v);p.bounds["max"+a]=p.bounds["max"+a]===null?v:Math.max(p.bounds["max"+a],v)};
const move=line=>{
const X=find(line,/(?:^|\s)X(-?\d+(?:\.\d+)?)/i),Y=find(line,/(?:^|\s)Y(-?\d+(?:\.\d+)?)/i),Z=find(line,/(?:^|\s)Z(-?\d+(?:\.\d+)?)/i),E=find(line,/(?:^|\s)E(-?\d+(?:\.\d+)?)/i),F=find(line,/(?:^|\s)F(-?\d+(?:\.\d+)?)/i);
const nx=X===null?x:(absXYZ?X:x+X),ny=Y===null?y:(absXYZ?Y:y+Y),nz=Z===null?z:(absXYZ?Z:z+Z),ne=E===null?e:(absE?E:e+E);
if(F!==null){f=F;p.movement.minFeedRate=p.movement.minFeedRate===null?F:Math.min(p.movement.minFeedRate,F);p.movement.maxFeedRate=p.movement.maxFeedRate===null?F:Math.max(p.movement.maxFeedRate,F)}
bound("X",nx);bound("Y",ny);bound("Z",nz);const de=ne-e,xy=Math.hypot(nx-x,ny-y);
if(de>1e-5){p.movement.extrusionMoves++;p.movement.extrusionLength+=de;p.geometry.push({x1:x,y1:y,x2:nx,y2:ny,z:nz,feedRate:f||0,layer})}
else if(xy>1e-5)p.movement.travelMoves++;
if(de<-1e-5)p.movement.retractions++;
x=nx;y=ny;z=nz;e=ne;
};
for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(!line)continue;
const sm=line.match(/;\s*SETTING_3\s+(.+)/i);if(sm)sm[1].split(",").forEach(pair=>{const i=pair.indexOf("=");if(i>0)p.settings[pair.slice(0,i).trim()]=pair.slice(i+1).trim()});
let m=line.match(/^;\s*Generated with\s+(.+)/i);if(m)p.slicer=m[1].trim();
if(/^;\s*TIME:/i.test(line))p.printTimeSeconds=find(line,/TIME:\s*([\d.]+)/i);
if(/^;\s*Filament used:/i.test(line))p.filamentMeters=find(line,/Filament used:\s*([\d.]+)/i);
["X","Y","Z"].forEach(a=>{const lo=find(line,new RegExp("MIN"+a+":\\s*(-?[\\d.]+)","i")),hi=find(line,new RegExp("MAX"+a+":\\s*(-?[\\d.]+)","i"));if(lo!==null)p.bounds["min"+a]=lo;if(hi!==null)p.bounds["max"+a]=hi});
m=line.match(/^;\s*LAYER:(-?\d+)/i);if(m){layer=num(m[1]);if(layer!==null)p.layerCount=Math.max(p.layerCount,layer+1)}
if(/^;\s*LAYER_HEIGHT:/i.test(line))p.layerHeight=find(line,/LAYER_HEIGHT:\s*([\d.]+)/i);
m=line.match(/^;\s*FLAVOR:\s*(.+)/i);if(m)p.gcodeFlavor=m[1].trim();
m=line.match(/^;\s*Printer:\s*(.+)/i);if(m)p.printer=m[1].trim();
m=line.match(/(?:model|object|source).*?(?:=|:)\s*([^\s;]+\.stl)\b/i);if(m&&!p.sourceModel)p.sourceModel=m[1];
if(/^M82\b/i.test(line))p.extrusionMode="Absolute";if(/^M83\b/i.test(line))p.extrusionMode="Relative";if(/^G90\b/i.test(line))absXYZ=true;if(/^G91\b/i.test(line))absXYZ=false;if(/^M82\b/i.test(line))absE=true;if(/^M83\b/i.test(line))absE=false;
m=line.match(/^M104\s+.*S(-?[\d.]+)/i);if(m)p.nozzleTemperature=num(m[1]);m=line.match(/^M109\s+.*S(-?[\d.]+)/i);if(m){p.initialNozzleTemperature??=num(m[1]);p.nozzleTemperature=num(m[1])}
m=line.match(/^M140\s+.*S(-?[\d.]+)/i);if(m){p.initialBedTemperature??=num(m[1]);p.bedTemperature=num(m[1])}m=line.match(/^M190\s+.*S(-?[\d.]+)/i);if(m){p.initialBedTemperature??=num(m[1]);p.bedTemperature=num(m[1])}
m=line.match(/^M106\b.*S(-?[\d.]+)/i);if(m){p.coolingDetected=true;const v=num(m[1]);if(v!==null)p.fanMax=p.fanMax===null?v:Math.max(p.fanMax,v)}if(/^M107\b/i.test(line))p.coolingDetected=true;
m=line.match(/^(G0|G1)\b/i);if(m)move(line);
}
const settingNumber=keys=>{for(const k of keys)if(p.settings[k]!==undefined){const v=num(p.settings[k]);if(v!==null)return v}return null};
p.layerHeight??=settingNumber(["layer_height"]);p.printSpeed??=settingNumber(["speed_print","speed_wall","speed_infill"]);p.travelSpeed=settingNumber(["speed_travel"]);
p.initialBedTemperature??=settingNumber(["material_bed_temperature_layer_0"]);p.bedTemperature??=settingNumber(["material_bed_temperature"]);
p.initialNozzleTemperature??=settingNumber(["material_print_temperature_layer_0"]);p.nozzleTemperature??=settingNumber(["material_print_temperature"]);
p.printer??=p.settings.machine_name||p.settings.printer_model||p.settings.machine_type||null;p.sourceModel??=p.settings.model_name||null;
p.dimensionSize={x:p.bounds.minX!==null&&p.bounds.maxX!==null?p.bounds.maxX-p.bounds.minX:null,y:p.bounds.minY!==null&&p.bounds.maxY!==null?p.bounds.maxY-p.bounds.minY:null,z:p.bounds.minZ!==null&&p.bounds.maxZ!==null?p.bounds.maxZ-p.bounds.minZ:null};
p.printTimeDisplay=time(p.printTimeSeconds);return p}
window.GCodeParser={parse};
})();
