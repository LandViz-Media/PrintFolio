/**
 * PrintFolio v0.1.6
 * Responsibility: Connect file loading, parsing, thumbnail rendering, tabs,
 * material-cost tracking, JSON import/export, and future reprint planning.
 */
(function(){
  "use strict";
  const $=id=>document.getElementById(id),state={parsed:null},file=$("file"),canvas=$("canvas");
  const esc=v=>String(v??"—").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"),dash=v=>v===null||v===undefined||v===""?"—":v;
  const mm=v=>Number.isFinite(v)?v.toFixed(2)+" mm":"—",temp=v=>Number.isFinite(v)?v.toFixed(0)+" °C":"—",speed=v=>Number.isFinite(v)?(v/60).toFixed(1)+" mm/s":"—",meters=v=>Number.isFinite(v)?v.toFixed(2)+" m":"—",grams=v=>Number.isFinite(v)?v.toFixed(2)+" g":"—";
  function table(title,rows){return `<div class="metric"><h3>${esc(title)}</h3><table><tbody>${rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(dash(r[1]))}</td></tr>`).join("")}</tbody></table></div>`}

  const defaultMaterials=[
    {id:"overture-pla-digital-blue-2025-12-20",brand:"Overture",material:"PLA",color:"Digital Blue",diameter:1.75,density:1.24,purchased:"2025-12-20",opened:"2025-12-30",totalWeight:1000,totalCost:17.68},
    {id:"hatchbox-petg-orange-2023-01-15",brand:"Hatchbox",material:"PETG",color:"Orange",diameter:1.75,density:1.27,purchased:"2023-01-15",opened:null,totalWeight:1000,totalCost:25.50},
    {id:"hatchbox-pla-grey-2020-04-15",brand:"Hatchbox",material:"PLA",color:"Grey",diameter:1.75,density:1.24,purchased:"2020-04-15",opened:null,totalWeight:1000,totalCost:25.00}
  ];
  const defaultProfiles=[
    {materialId:"overture-pla-digital-blue-2025-12-20",printer:"Creality Ender-3 Pro",nozzleTemperature:212,bedTemperature:55,printSpeed:80,notes:"Temp 212°C, bed 55°C, speed 80 mm/s on Ender-3 Pro"},
    {materialId:"hatchbox-petg-orange-2023-01-15",printer:"Creality Ender-3 Pro",nozzleTemperature:243,bedTemperature:60,printSpeed:80,notes:"Temp 243°C, bed 60°C, speed 80 mm/s on Ender-3 Pro"},
    {materialId:"hatchbox-pla-grey-2020-04-15",printer:"Creality Ender-3 Pro",nozzleTemperature:208,bedTemperature:55,printSpeed:80,notes:"Temp 208°C, bed 55°C, speed 80 mm/s on Ender-3 Pro"}
  ];

  function materialLibrary(){try{const v=JSON.parse(localStorage.getItem("printfolio.materials")||"null");return Array.isArray(v)?v:defaultMaterials.map(x=>({...x}))}catch(_){return defaultMaterials.map(x=>({...x}))}}
  function materialProfiles(){try{const v=JSON.parse(localStorage.getItem("printfolio.materialProfiles")||"null");return Array.isArray(v)?v:defaultProfiles.map(x=>({...x}))}catch(_){return defaultProfiles.map(x=>({...x}))}}
  function saveMaterials(v){localStorage.setItem("printfolio.materials",JSON.stringify(v))}
  function saveProfiles(v){localStorage.setItem("printfolio.materialProfiles",JSON.stringify(v))}
  function ensureSeeded(){
    if(localStorage.getItem("printfolio.materials")===null) saveMaterials(defaultMaterials.map(x=>({...x})));
    else {
      const current=materialLibrary(),migrated=current.map(m=>({...m}));
      let changed=false;
      for(const m of migrated){
        if(!Number.isFinite(Number(m.density))){
          const t=String(m.material||"").toUpperCase();
          const d=t.includes("PETG")?1.27:t.includes("PLA")?1.24:null;
          if(d!==null){m.density=d;changed=true}
        }
      }
      if(changed)saveMaterials(migrated);
    }
    if(localStorage.getItem("printfolio.materialProfiles")===null)saveProfiles(defaultProfiles.map(x=>({...x})));
  }
  function materialEstimate(p,m){if(!m||!Number.isFinite(m.totalWeight)||m.totalWeight<=0||!Number.isFinite(m.totalCost))return null;let grams=p.filamentGrams,source="reported weight";if(!Number.isFinite(grams)&&Number.isFinite(p.filamentMeters)&&Number.isFinite(m.diameter)&&Number.isFinite(m.density)){const radiusCm=(m.diameter/10)/2,lengthCm=p.filamentMeters*100;grams=Math.PI*radiusCm*radiusCm*lengthCm*m.density;source="estimated from length, diameter, and density"}if(!Number.isFinite(grams))return null;return{grams,cost:grams/m.totalWeight*m.totalCost,source,rate:m.totalCost/m.totalWeight}}
  function materialLabel(m){return `${m.brand||"Unknown brand"} — ${m.material||"Unknown material"}${m.color?" — "+m.color:""}`}

  function renderMaterials(){
    const list=materialLibrary(),sel=$("materialSelect");
    sel.innerHTML=`<option value="">Select material…</option>`+list.map((m,i)=>`<option value="${i}">${esc(materialLabel(m))}</option>`).join("");
    updateCost();
  }

  function updateProfiles(materialIndex){
    const list=materialLibrary(),profiles=materialProfiles(),m=list[Number(materialIndex)];
    const relevant=m?profiles.filter(p=>p.materialId===m.id):[];
    $("profileList").innerHTML=relevant.length?relevant.map(p=>`<div class="profile"><b>${esc(p.printer||"Printer profile")}</b><span>Nozzle ${esc(p.nozzleTemperature??"—")} °C</span><span>Bed ${esc(p.bedTemperature??"—")} °C</span><span>Speed ${esc(p.printSpeed??"—")} mm/s</span>${p.notes?`<span>${esc(p.notes)}</span>`:""}</div>`).join(""):`<div class="note">Select a material to see printer-specific notes. A future version will let you add, edit, and remove profiles here.</div>`;
  }

  function updateCost(){
    const p=state.parsed,idx=$("materialSelect")?.value,list=materialLibrary(),m=idx!==""?list[Number(idx)]:null,est=p&&m?materialEstimate(p,m):null;
    $("costResult").innerHTML=p&&m?(est?`Estimated weight: <b>${est.grams.toFixed(2)} g</b><br>Estimated material cost: <b>$${est.cost.toFixed(2)}</b><br><span class="note">${esc(est.source)} · $${est.rate.toFixed(4)}/g</span>`:"This file does not contain enough filament information for a weight/cost estimate."):"Select a material to estimate print cost.";
    updateProfiles(idx);
  }

  function update(p){
    $("basic").innerHTML=[["Print",p.fileName],["File Type",p.fileType],["Printer",p.printer],["Slicer",p.slicer],["Source Model",p.sourceModel],["Material",p.materialType],["Print Time",p.printTimeDisplay],["Filament",p.filamentMeters!==null?meters(p.filamentMeters):grams(p.filamentGrams)]].map(r=>`<div><dt>${esc(r[0])}</dt><dd>${esc(dash(r[1]))}</dd></div>`).join("");
    const zNote=p.dimensionNotes?.length?p.dimensionNotes.join(" "):null;
    $("dimensionsContent").innerHTML=table("Overall Size",[["X",mm(p.dimensionSize.x)],["Y",mm(p.dimensionSize.y)],["Z",mm(p.dimensionSize.z!==null?p.dimensionSize.z:p.maxLayerZ)],["Layer Height",mm(p.layerHeight)],["Layers",p.layerCount||"—"]])+(zNote?`<div class="metric noteBox"><b>Dimension note</b><p>${esc(zNote)}</p></div>`:"")+table("Bounding Box",[["X Minimum",mm(p.bounds.minX)],["X Maximum",mm(p.bounds.maxX)],["Y Minimum",mm(p.bounds.minY)],["Y Maximum",mm(p.bounds.maxY)],["Z Minimum",mm(p.bounds.minZ)],["Z Maximum",mm(p.bounds.maxZ)]]);
    $("temperaturesContent").innerHTML=table("Nozzle",[["Initial / warm-up",temp(p.initialNozzleTemperature)],["Print temperature",temp(p.nozzleTemperature)]])+table("Build Plate",[["Initial / first layer",temp(p.initialBedTemperature)],["Print temperature",temp(p.bedTemperature)]]);
    $("speedsContent").innerHTML=table("Configured Speeds",[["Print speed",Number.isFinite(p.printSpeed)?speed(p.printSpeed):"—"],["Travel speed",Number.isFinite(p.travelSpeed)?speed(p.travelSpeed):"—"],["Minimum G-code feed rate",speed(p.movement.minFeedRate)],["Maximum G-code feed rate",speed(p.movement.maxFeedRate)]])+table("Movement Summary",[["Extrusion moves",p.movement.extrusionMoves.toLocaleString()],["Travel moves",p.movement.travelMoves.toLocaleString()]]);
    $("filamentContent").innerHTML=table("Filament",[["Reported length",meters(p.filamentMeters)],["Reported weight",grams(p.filamentGrams)],["Reported volume",p.filamentCm3!==null?p.filamentCm3.toFixed(2)+" cm³":"—"],["File-reported filament cost",p.filamentCost!==null?"$"+p.filamentCost.toFixed(2):"—"],["Extrusion mode",p.extrusionMode],["Retractions",p.movement.retractions.toLocaleString()]])+table("Scope",[["Purpose","Preview and inspection only"],["Slicing","Not performed by PrintFolio"]]);
    $("coolingContent").innerHTML=table("Fan Cooling",[["Cooling commands detected",p.coolingDetected?"Yes":"No"],["Maximum fan command",p.fanMax===null?"—":p.fanMax+" / 255"]])+table("File",[["G-code flavor",p.gcodeFlavor],["Thumbnail source",p.thumbnailSource||"PrintFolio renderer"]]);
    $("bedsetupContent").innerHTML=table("Bed / Leveling",[["Homing detected",p.bedSetup.homing?"Yes":"Not detected"],["Mesh probing detected",p.bedSetup.meshProbe?"Yes":"Not detected"],["Mesh load detected",p.bedSetup.meshLoad?"Yes":"Not detected"],["Leveling commands",p.bedSetup.meshCommands.length?p.bedSetup.meshCommands.join(", "):"—"],["Bed shape",p.bedSetup.bedShape]])+table("Printer Setup",[["Printer",p.printer],["Nozzle diameter",p.bedSetup.nozzleDiameter!==null?p.bedSetup.nozzleDiameter+" mm":"—"],["Filament diameter",p.bedSetup.filamentDiameter!==null?p.bedSetup.filamentDiameter+" mm":"—"],["Extruder count",p.bedSetup.extruderCount]]);
    $("settingsContent").innerHTML=table("Supports & Infill",[["Supports",p.printSettings.support],["Support build plate only",p.printSettings.supportBuildplateOnly],["Infill density",p.printSettings.infillDensity],["Infill pattern",p.printSettings.infillPattern]])+table("Shell & Adhesion",[["Wall / perimeter lines",p.printSettings.wallLines],["Top layers",p.printSettings.topLayers],["Bottom layers",p.printSettings.bottomLayers],["Brim width",p.printSettings.brimWidth!==null?p.printSettings.brimWidth+" mm":null],["Raft",p.printSettings.raft],["Skirt lines / height",p.printSettings.skirtLines],["Ironing",p.printSettings.ironing],["Adhesion",p.printSettings.adhesion]])+`<div class="metric future"><h3>Future: Reprint Planning</h3><p>PrintFolio will eventually let you create a new print plan from this file—changing material, temperature, speed, fan cooling, supports, infill, and other settings while preserving the original print record.</p><p class="note">v0.1.x is intentionally read-only.</p></div>`;
    $("materialFileSummary").innerHTML=table("Current Print",[["Material in file",p.materialType],["Color in file",p.materialColor],["Filament used",p.filamentGrams!==null?grams(p.filamentGrams):meters(p.filamentMeters)],["Cost from file",p.filamentCost!==null?"$"+p.filamentCost.toFixed(2):"Not reported"]]);
    renderMaterials();
    const list=materialLibrary();
    const matchIndex=p.materialType?list.findIndex(m=>String(m.material||"").toLowerCase()===String(p.materialType).toLowerCase()):-1;
    if(matchIndex>=0){$("materialSelect").value=String(matchIndex);updateCost()}
  }

  function empty(){const html='<div class="emptyPanel">Open a G-code, BGCODE, or 3MF file to populate this section.</div>';["dimensionsContent","temperaturesContent","speedsContent","filamentContent","coolingContent","bedsetupContent","settingsContent","materialFileSummary"].forEach(id=>$(id).innerHTML=html);renderMaterials()}

  function clear(){
    state.parsed=null;
    const c=canvas.getContext("2d");c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle="#f4f7f8";c.fillRect(0,0,canvas.width,canvas.height);
    $("empty").hidden=false;$("empty").style.display="flex";$("fileLabel").textContent="No file loaded";$("previewFile").textContent="No file loaded.";$("status").textContent="Open a G-code, BGCODE, or 3MF file to begin.";
    $("basic").innerHTML=[["Print","—"],["File Type","—"],["Printer","—"],["Slicer","—"],["Source Model","—"],["Material","—"],["Print Time","—"],["Filament","—"]].map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("");empty();
  }


  ensureSeeded();
  file.addEventListener("change",()=>{const f=file.files?.[0];if(!f)return;$("status").textContent="Reading "+f.name+"…";const r=new FileReader();r.onload=async e=>{try{const p=await GCodeParser.parseBytes(new Uint8Array(e.target.result),f.name);state.parsed=p;GCodeRenderer.renderThumbnail(canvas,p);const empty=$("empty");empty.hidden=true;empty.style.display="none";$("fileLabel").textContent=f.name;$("previewFile").textContent=f.name;update(p);const extra=p.fileType==="BGCODE"?" • embedded metadata read":p.fileType==="3MF"?" • project metadata/model read":"";$("status").textContent=`Loaded ${f.name} • ${p.fileType}${extra}.`;}catch(err){console.error(err);$("status").textContent="Could not parse the file: "+err.message}};r.onerror=()=>$("status").textContent="The file could not be read.";r.readAsArrayBuffer(f)});
  $("clear").addEventListener("click",()=>{file.value="";clear()});
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));document.querySelectorAll(".panel").forEach(x=>{const on=x.id===t.dataset.tab;x.hidden=!on;x.classList.toggle("active",on)})}));
  $("materialSelect").addEventListener("change",updateCost);
  $("openMaterialEditor").addEventListener("click",()=>window.open("material-editor.html","printfolio-material-editor","width=1200,height=800,resizable=yes,scrollbars=yes"));
  clear();
})();
