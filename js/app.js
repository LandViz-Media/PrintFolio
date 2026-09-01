/**
 * G-Code Print Viewer v0.1.0
 * Responsibility: Connect file loading, parsing, rendering, tabs, and panels.
 */
(function(){
"use strict";const $=id=>document.getElementById(id),state={parsed:null},file=$("file"),canvas=$("canvas");
const esc=v=>String(v??"—").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"),dash=v=>v===null||v===undefined||v===""?"—":v;
const mm=v=>Number.isFinite(v)?v.toFixed(2)+" mm":"—",temp=v=>Number.isFinite(v)?v.toFixed(0)+" °C":"—",speed=v=>Number.isFinite(v)?(v/60).toFixed(1)+" mm/s":"—",meters=v=>Number.isFinite(v)?v.toFixed(2)+" m":"—";
function table(title,rows){return `<div class="metric"><h3>${esc(title)}</h3><table><tbody>${rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(dash(r[1]))}</td></tr>`).join("")}</tbody></table></div>`}
function update(p){
$("basic").innerHTML=[["Print",p.fileName],["Printer",p.printer],["Slicer",p.slicer],["Source Model",p.sourceModel],["Print Time",p.printTimeDisplay],["Filament",meters(p.filamentMeters)]].map(r=>`<div><dt>${esc(r[0])}</dt><dd>${esc(dash(r[1]))}</dd></div>`).join("");
$("dimensionsContent").innerHTML=table("Overall Size",[["X",mm(p.dimensionSize.x)],["Y",mm(p.dimensionSize.y)],["Z",mm(p.dimensionSize.z)],["Layer Height",mm(p.layerHeight)],["Layers",p.layerCount]])+table("Bounding Box",[["X Minimum",mm(p.bounds.minX)],["X Maximum",mm(p.bounds.maxX)],["Y Minimum",mm(p.bounds.minY)],["Y Maximum",mm(p.bounds.maxY)],["Z Minimum",mm(p.bounds.minZ)],["Z Maximum",mm(p.bounds.maxZ)]]);
$("temperaturesContent").innerHTML=table("Nozzle",[["Initial / warm-up",temp(p.initialNozzleTemperature)],["Print temperature",temp(p.nozzleTemperature)]])+table("Build Plate",[["Initial / first layer",temp(p.initialBedTemperature)],["Print temperature",temp(p.bedTemperature)]]);
$("speedsContent").innerHTML=table("Configured Speeds",[["Print speed",speed(p.printSpeed*60)],["Travel speed",speed(p.travelSpeed*60)],["Minimum G-code feed rate",speed(p.movement.minFeedRate)],["Maximum G-code feed rate",speed(p.movement.maxFeedRate)]])+table("Movement Summary",[["Extrusion moves",p.movement.extrusionMoves.toLocaleString()],["Travel moves",p.movement.travelMoves.toLocaleString()]]);
$("filamentContent").innerHTML=table("Filament",[["Reported filament used",meters(p.filamentMeters)],["Parsed extrusion",p.movement.extrusionLength.toFixed(2)+" G-code units"],["Extrusion mode",p.extrusionMode],["Extrusion moves",p.movement.extrusionMoves.toLocaleString()],["Retractions",p.movement.retractions.toLocaleString()]])+table("Notes",[["Purpose","Preview and inspection only"],["Slicing","Not performed by this application"]]);
$("coolingContent").innerHTML=table("Fan Cooling",[["Cooling commands detected",p.coolingDetected?"Yes":"No"],["Maximum fan command",p.fanMax===null?"—":p.fanMax+" / 255"]])+table("G-code",[["G-code flavor",p.gcodeFlavor],["Application","Preview and inspection only"]]);
}
function empty(){const html='<div class="emptyPanel">Open a G-code file to populate this section.</div>';["dimensionsContent","temperaturesContent","speedsContent","filamentContent","coolingContent"].forEach(id=>$(id).innerHTML=html)}
function clear(){state.parsed=null;const c=canvas.getContext("2d");c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle="#edf2f4";c.fillRect(0,0,canvas.width,canvas.height);$("empty").hidden=false;$("fileLabel").textContent="No file loaded";$("previewFile").textContent="No file loaded.";$("status").textContent="Open a G-code file to begin."; $("basic").innerHTML=[["Print","—"],["Printer","—"],["Slicer","—"],["Source Model","—"],["Print Time","—"],["Filament","—"]].map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("");empty()}
file.addEventListener("change",()=>{const f=file.files?.[0];if(!f)return;$("status").textContent="Reading "+f.name+"…";const r=new FileReader();r.onload=e=>{try{const p=GCodeParser.parse(String(e.target.result||""),f.name);state.parsed=p;GCodeRenderer.renderThumbnail(canvas,p);$("empty").hidden=true;$("fileLabel").textContent=f.name;$("previewFile").textContent=f.name;update(p);$("status").textContent=`Loaded ${f.name} • ${p.geometry.length.toLocaleString()} extrusion segments • ${p.layerCount} layers detected.`}catch(err){$("status").textContent="Could not parse the file: "+err.message}};r.onerror=()=>$("status").textContent="The file could not be read.";r.readAsText(f)});
$("clear").addEventListener("click",()=>{file.value="";clear()});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));document.querySelectorAll(".panel").forEach(x=>{const on=x.id===t.dataset.tab;x.hidden=!on;x.classList.toggle("active",on)})}));
clear();
})();
