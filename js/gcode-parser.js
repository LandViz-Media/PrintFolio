/**
 * PrintFolio v0.1.1
 * Responsibility: Parse ASCII G-code and extract common print metadata,
 * settings, movement geometry, and embedded thumbnails when available.
 */
(function(){
  "use strict";
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const find=(s,r)=>{const m=s.match(r);return m?num(m[1]):null};
  const time=s=>{if(!Number.isFinite(s)||s<0)return"—";s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}h ${String(m).padStart(2,"0")}m ${String(x).padStart(2,"0")}s`:`${m}m ${String(x).padStart(2,"0")}s`};

  function base(fileName,type){return{fileName:fileName||"Untitled",fileType:type||"G-code",printer:null,slicer:null,sourceModel:null,producer:null,producedOn:null,printTimeSeconds:null,filamentMeters:null,filamentGrams:null,filamentCm3:null,filamentCost:null,layerHeight:null,layerCount:0,maxLayerZ:null,gcodeFlavor:null,printSpeed:null,travelSpeed:null,nozzleTemperature:null,initialNozzleTemperature:null,bedTemperature:null,initialBedTemperature:null,fanMax:null,coolingDetected:false,extrusionMode:null,settings:{},bounds:{minX:null,maxX:null,minY:null,maxY:null,minZ:null,maxZ:null},movement:{extrusionMoves:0,travelMoves:0,retractions:0,extrusionLength:0,minFeedRate:null,maxFeedRate:null},geometry:[],thumbnailDataUrl:null,thumbnailSource:null,bedSetup:{homing:false,meshLoad:false,meshProbe:false,meshCommands:[],bedShape:null,nozzleDiameter:null,filamentDiameter:null,extruderCount:null},printSettings:{support:null,supportBuildplateOnly:null,infillDensity:null,infillPattern:null,brimWidth:null,raft:null,skirtLines:null,wallLines:null,topLayers:null,bottomLayers:null,ironing:null,adhesion:null}}}

  function applySettings(p){
    const s=p.settings;
    const sn=keys=>{for(const k of keys)if(s[k]!==undefined){const v=num(s[k]);if(v!==null)return v}return null};
    const sv=keys=>{for(const k of keys)if(s[k]!==undefined&&s[k]!=="")return s[k];return null};
    p.layerHeight??=sn(["layer_height"]);p.printSpeed??=sn(["speed_print","speed_wall","speed_infill"]);p.travelSpeed=sn(["speed_travel"]);
    p.initialBedTemperature??=sn(["material_bed_temperature_layer_0","first_layer_bed_temperature"]);p.bedTemperature??=sn(["material_bed_temperature","bed_temperature"]);
    p.initialNozzleTemperature??=sn(["material_print_temperature_layer_0","first_layer_temperature"]);p.nozzleTemperature??=sn(["material_print_temperature","temperature"]);
    p.printer??=sv(["printer_model","machine_name","printer_model_name","machine_type"]);
    p.sourceModel??=sv(["model_name"]);p.bedSetup.nozzleDiameter=sn(["nozzle_diameter"]);p.bedSetup.filamentDiameter=sn(["filament_diameter"]);p.bedSetup.extruderCount=sn(["extruders_count","extruder_count"]);
    p.bedSetup.bedShape=sv(["bed_shape"]);
    p.printSettings.support=sv(["support_material"]);p.printSettings.supportBuildplateOnly=sv(["support_material_buildplate_only"]);
    p.printSettings.infillDensity=sv(["fill_density"]);p.printSettings.infillPattern=sv(["fill_pattern"]);p.printSettings.brimWidth=sv(["brim_width"]);p.printSettings.raft=sv(["raft_layers","raft_margin"]);
    p.printSettings.skirtLines=sv(["skirt_height","skirts","skirt_line_count"]);p.printSettings.wallLines=sv(["wall_line_count","perimeters"]);p.printSettings.topLayers=sv(["top_solid_layers","top_layers"]);p.printSettings.bottomLayers=sv(["bottom_solid_layers","bottom_layers"]);p.printSettings.ironing=sv(["ironing"]);p.printSettings.adhesion=sv(["adhesion_type"]);
    if(s["support_material"]!==undefined)p.printSettings.support=String(s["support_material"]) === "1" ? "Enabled" : "Disabled";
    if(s["ironing"]!==undefined)p.printSettings.ironing=String(s["ironing"]) === "1" ? "Enabled" : "Disabled";
    if(s["raft_layers"]!==undefined)p.printSettings.raft=Number(s["raft_layers"])>0?`${s["raft_layers"]} layers`:"Disabled";
    p.dimensionSize={x:p.bounds.minX!==null&&p.bounds.maxX!==null?p.bounds.maxX-p.bounds.minX:null,y:p.bounds.minY!==null&&p.bounds.maxY!==null?p.bounds.maxY-p.bounds.minY:null,z:p.bounds.minZ!==null&&p.bounds.maxZ!==null?p.bounds.maxZ-p.bounds.minZ:null};
    p.printTimeDisplay=time(p.printTimeSeconds);
  }

  function parseAscii(text,fileName,type="G-code"){
    const p=base(fileName,type);let x=0,y=0,z=0,e=0,f=null,absXYZ=true,absE=true,layer=-1;
    const bound=(a,v)=>{if(v===null)return;p.bounds["min"+a]=p.bounds["min"+a]===null?v:Math.min(p.bounds["min"+a],v);p.bounds["max"+a]=p.bounds["max"+a]===null?v:Math.max(p.bounds["max"+a],v)};
    const move=line=>{const X=find(line,/(?:^|\s)X(-?\d+(?:\.\d+)?)/i),Y=find(line,/(?:^|\s)Y(-?\d+(?:\.\d+)?)/i),Z=find(line,/(?:^|\s)Z(-?\d+(?:\.\d+)?)/i),E=find(line,/(?:^|\s)E(-?\d+(?:\.\d+)?)/i),F=find(line,/(?:^|\s)F(-?\d+(?:\.\d+)?)/i);const nx=X===null?x:(absXYZ?X:x+X),ny=Y===null?y:(absXYZ?Y:y+Y),nz=Z===null?z:(absXYZ?Z:z+Z),ne=E===null?e:(absE?E:e+E);if(F!==null){f=F;p.movement.minFeedRate=p.movement.minFeedRate===null?F:Math.min(p.movement.minFeedRate,F);p.movement.maxFeedRate=p.movement.maxFeedRate===null?F:Math.max(p.movement.maxFeedRate,F)}bound("X",nx);bound("Y",ny);bound("Z",nz);const de=ne-e,xy=Math.hypot(nx-x,ny-y);if(de>1e-5){p.movement.extrusionMoves++;p.movement.extrusionLength+=de;p.geometry.push({x1:x,y1:y,x2:nx,y2:ny,z:nz,feedRate:f||0,layer})}else if(xy>1e-5)p.movement.travelMoves++;if(de<-1e-5)p.movement.retractions++;x=nx;y=ny;z=nz;e=ne};
    for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(!line)continue;
      let m=line.match(/^;\s*SETTING_3\s+(.+)/i);if(m)m[1].split(",").forEach(pair=>{const i=pair.indexOf("=");if(i>0)p.settings[pair.slice(0,i).trim()]=pair.slice(i+1).trim()});
      m=line.match(/^;\s*Generated with\s+(.+)/i);if(m)p.slicer=m[1].trim();m=line.match(/^;\s*TIME:\s*([\d.]+)/i);if(m)p.printTimeSeconds=num(m[1]);m=line.match(/^;\s*Filament used:\s*([\d.]+)/i);if(m)p.filamentMeters=num(m[1]);
      ["X","Y","Z"].forEach(a=>{const lo=find(line,new RegExp("MIN"+a+":\\s*(-?[\\d.]+)","i")),hi=find(line,new RegExp("MAX"+a+":\\s*(-?[\\d.]+)","i"));if(lo!==null)p.bounds["min"+a]=lo;if(hi!==null)p.bounds["max"+a]=hi});
      m=line.match(/^;\s*LAYER:(-?\d+)/i);if(m){layer=num(m[1]);if(layer!==null)p.layerCount=Math.max(p.layerCount,layer+1)}m=line.match(/^;\s*LAYER_HEIGHT:\s*([\d.]+)/i);if(m)p.layerHeight=num(m[1]);m=line.match(/^;\s*FLAVOR:\s*(.+)/i);if(m)p.gcodeFlavor=m[1].trim();
      m=line.match(/^;\s*Printer:\s*(.+)/i);if(m)p.printer=m[1].trim();m=line.match(/(?:model|object|source).*?(?:=|:)\s*([^\s;]+\.stl)\b/i);if(m&&!p.sourceModel)p.sourceModel=m[1];
      if(/^M82\b/i.test(line))p.extrusionMode="Absolute";if(/^M83\b/i.test(line))p.extrusionMode="Relative";if(/^G90\b/i.test(line))absXYZ=true;if(/^G91\b/i.test(line))absXYZ=false;if(/^M82\b/i.test(line))absE=true;if(/^M83\b/i.test(line))absE=false;
      m=line.match(/^M104\s+.*S(-?[\d.]+)/i);if(m)p.nozzleTemperature=num(m[1]);m=line.match(/^M109\s+.*S(-?[\d.]+)/i);if(m){p.initialNozzleTemperature??=num(m[1]);p.nozzleTemperature=num(m[1])};m=line.match(/^M140\s+.*S(-?[\d.]+)/i);if(m){p.initialBedTemperature??=num(m[1]);p.bedTemperature=num(m[1])};m=line.match(/^M190\s+.*S(-?[\d.]+)/i);if(m){p.initialBedTemperature??=num(m[1]);p.bedTemperature=num(m[1])};
      m=line.match(/^M106\b.*S(-?[\d.]+)/i);if(m){p.coolingDetected=true;const v=num(m[1]);if(v!==null)p.fanMax=p.fanMax===null?v:Math.max(p.fanMax,v)}if(/^M107\b/i.test(line))p.coolingDetected=true;
      if(/^G28\b/i.test(line))p.bedSetup.homing=true;if(/^G29(?:\s|\.|$)/i.test(line)){p.bedSetup.meshProbe=true;p.bedSetup.meshCommands.push("G29")};if(/^M420\b/i.test(line)){p.bedSetup.meshLoad=true;p.bedSetup.meshCommands.push(line.split(";")[0])};if(/^M421\b/i.test(line))p.bedSetup.meshCommands.push("M421");
      m=line.match(/^(G0|G1)\b/i);if(m)move(line);
      m=line.match(/;\s*thumbnail begin\s+([^\s]+)\s+(\d+)/i);if(m)p._thumb={header:m[1],size:num(m[2]),data:[]};if(p._thumb&&/^;\s*thumbnail end/i.test(line)){const b64=p._thumb.data.join("");if(b64)p.thumbnailDataUrl="data:image/png;base64,"+b64;p.thumbnailSource="embedded G-code thumbnail";delete p._thumb}else if(p._thumb&&/^;\s*/.test(line)){p._thumb.data.push(line.replace(/^;\s*/,""))}
    }
    applySettings(p);return p;
  }

  function bytesToText(bytes){return new TextDecoder("utf-8",{fatal:false}).decode(bytes)}
  function parseBgcode(bytes,fileName){
    const p=base(fileName,"BGCODE");const text=bytesToText(bytes.slice(0,Math.min(bytes.length,200000)));
    p.gcodeFlavor="Prusa BGCODE (binary G-code)";
    // The sample and current Prusa BGCODE format expose INI-like metadata blocks.
    for(const line of text.split(/\r?\n/)){const i=line.indexOf("=");if(i>0&&/^[A-Za-z_][A-Za-z0-9_ .\[\]-]*=/.test(line)){const k=line.slice(0,i).trim(),v=line.slice(i+1).trim();if(v.length<5000)p.settings[k]=v}}
    const bgValue=(key)=>{const safe=key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");const m=text.match(new RegExp(safe+"=([^\\r\\n]+)"));return m?m[1].trim():null};
    p.producer=bgValue("Producer")||p.settings.Producer||null;p.producedOn=bgValue("Produced on")||p.settings["Produced on"]||null;p.printer=bgValue("printer_model")||p.settings.printer_model||null;
    p.slicer=p.producer||"PrusaSlicer";p.layerHeight=num(bgValue("layer_height")||p.settings.layer_height);p.maxLayerZ=num(bgValue("max_layer_z")||p.settings.max_layer_z);p.bedTemperature=num(bgValue("bed_temperature")||p.settings.bed_temperature);p.nozzleTemperature=num(bgValue("temperature")||p.settings.temperature);p.filamentMeters=num(bgValue("filament used [mm]")||p.settings["filament used [mm]"])/1000;p.filamentGrams=num(bgValue("filament used [g]")||p.settings["filament used [g]"]);p.filamentCm3=num(bgValue("filament used [cm3]")||p.settings["filament used [cm3]"]);p.filamentCost=num(bgValue("filament cost")||p.settings["filament cost"]);p.printTimeSeconds=parseTimeString(bgValue("estimated printing time (normal mode)")||p.settings["estimated printing time (normal mode)"]);p.printSettings.infillDensity=bgValue("fill_density")||p.settings.fill_density;p.printSettings.support=(bgValue("support_material")||p.settings.support_material)==="1"?"Enabled":(bgValue("support_material")||p.settings.support_material)==="0"?"Disabled":(bgValue("support_material")||p.settings.support_material);p.printSettings.ironing=(bgValue("ironing")||p.settings.ironing)==="1"?"Enabled":(bgValue("ironing")||p.settings.ironing)==="0"?"Disabled":(bgValue("ironing")||p.settings.ironing);
    applySettings(p);
    const png=findEmbeddedPng(bytes);if(png){p.thumbnailDataUrl="data:image/png;base64,"+toBase64(png);p.thumbnailSource="embedded BGCODE thumbnail"}
    p.metadataOnly=true;return p;
  }
  function parseTimeString(v){if(!v)return null;const m=String(v).match(/(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i);return m?(Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0)):null}
  function findEmbeddedPng(bytes){const sig=[137,80,78,71,13,10,26,10];let i=-1;outer:for(let j=0;j<=bytes.length-sig.length;j++){for(let k=0;k<sig.length;k++)if(bytes[j+k]!==sig[k])continue outer;i=j;break}if(i<0)return null;for(let j=i+8;j<bytes.length-4;j++){if(bytes[j]===0x49&&bytes[j+1]===0x45&&bytes[j+2]===0x4e&&bytes[j+3]===0x44){return bytes.slice(i,j+8)}}return null}
  function toBase64(bytes){let s="";const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)s+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(s)}
  window.GCodeParser={parseText:parseAscii,parseBytes:(bytes,fileName)=>{const magic=bytes.slice(0,4);if(magic[0]===0x47&&magic[1]===0x43&&magic[2]===0x44&&magic[3]===0x45)return parseBgcode(bytes,fileName);return parseAscii(bytesToText(bytes),fileName,"G-code")}};
})();
