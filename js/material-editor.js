/**
 * PrintFolio v0.1.7
 * Responsibility: Render and manage the shared Material Library pane; the same module can also support the standalone editor page.
 */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const materials=()=>{try{const d=JSON.parse(localStorage.getItem("printfolio.materials")||"[]");return Array.isArray(d)?d:[]}catch(_){return []}};
  const profiles=()=>{try{const d=JSON.parse(localStorage.getItem("printfolio.materialProfiles")||"[]");return Array.isArray(d)?d:[]}catch(_){return []}};
  const save=v=>localStorage.setItem("printfolio.materials",JSON.stringify(v));
  const esc=v=>String(v??"—").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  function render(){
    const list=materials();
    $("list").innerHTML=list.length?list.map((m,i)=>
      "<tr><td>"+esc(m.brand)+"</td><td>"+esc(m.material)+"</td><td>"+esc(m.color)+"</td><td>"+esc(m.diameter)+" mm</td><td>"+esc(m.density)+" g/cm³</td><td>"+esc(m.purchased||"—")+"</td><td>"+esc(m.opened||"Unknown")+"</td><td>"+Number(m.totalWeight||0).toFixed(0)+" g</td><td>$"+Number(m.totalCost||0).toFixed(2)+"</td><td><button data-remove=\""+i+"\">Delete</button></td></tr>"
    ).join(""):"<tr><td colspan=\"10\" class=\"note\">No materials saved.</td></tr>";
  }

  function exportJson(){const blob=new Blob([JSON.stringify({version:1,materials:materials(),profiles:profiles()},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="printfolio-material-library.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$("status2").textContent="Library exported."}
  async function importJson(f){try{const d=JSON.parse(await f.text()),m=Array.isArray(d)?d:d.materials;if(!Array.isArray(m))throw new Error("JSON must contain a materials array.");save(m);if(Array.isArray(d.profiles))localStorage.setItem("printfolio.materialProfiles",JSON.stringify(d.profiles));render();$("status2").textContent=`Imported ${m.length} materials.`}catch(e){$("status2").textContent="Import failed: "+e.message}}
  $("list").addEventListener("click",e=>{const i=e.target.dataset.remove;if(i===undefined)return;const m=materials(),removed=m[Number(i)];if(!confirm(`Delete ${removed?.brand||"this material"} ${removed?.material||""}?`))return;m.splice(Number(i),1);save(m);localStorage.setItem("printfolio.materialProfiles",JSON.stringify(profiles().filter(p=>p.materialId!==removed?.id)));render();$("status2").textContent="Material deleted."});
  $("export").addEventListener("click",exportJson);$("import").addEventListener("change",e=>{const f=e.target.files?.[0];if(f)importJson(f);e.target.value=""});if($("closeEditor"))$("closeEditor").addEventListener("click",()=>window.close());render();
})();