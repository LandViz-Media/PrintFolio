/**
 * PrintFolio v0.1.8
 * Responsibility: Manage the in-page Material Library, including add, edit,
 * delete, import, export, and preservation of printer-specific profiles.
 */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const materials=()=>{try{const d=JSON.parse(localStorage.getItem("printfolio.materials")||"[]");return Array.isArray(d)?d:[]}catch(_){return []}};
  const profiles=()=>{try{const d=JSON.parse(localStorage.getItem("printfolio.materialProfiles")||"[]");return Array.isArray(d)?d:[]}catch(_){return []}};
  const save=v=>localStorage.setItem("printfolio.materials",JSON.stringify(v));
  const saveProfiles=v=>localStorage.setItem("printfolio.materialProfiles",JSON.stringify(v));
  const esc=v=>String(v??"—").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const slug=s=>String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  function render(){
    const list=materials();
    $("list").innerHTML=list.length?list.map((m,i)=>
      `<tr><td>${esc(m.brand)}</td><td>${esc(m.material)}</td><td>${esc(m.color)}</td><td>${esc(m.diameter)} mm</td><td>${esc(m.density)} g/cm³</td><td>${esc(m.purchased||"—")}</td><td>${esc(m.opened||"Unknown")}</td><td>${Number(m.totalWeight||0).toFixed(0)} g</td><td>$${Number(m.totalCost||0).toFixed(2)}</td><td class="rowActions"><button type="button" data-edit="${i}">Edit</button><button type="button" data-remove="${i}">Delete</button></td></tr>`
    ).join(""):"<tr><td colspan=\"10\" class=\"note\">No materials saved.</td></tr>";
  }
  function resetForm(){
    $("materialForm").reset(); $("materialEditIndex").value=""; $("saveMaterial").textContent="Add Material"; $("cancelMaterialEdit").hidden=true;
  }
  function editMaterial(i){
    const m=materials()[Number(i)]; if(!m)return;
    $("materialEditIndex").value=String(i); $("matBrand").value=m.brand||""; $("matType").value=m.material||""; $("matColor").value=m.color||"";
    $("matDiameter").value=m.diameter??""; $("matDensity").value=m.density??""; $("matPurchased").value=m.purchased||""; $("matOpened").value=m.opened||"";
    $("matWeight").value=m.totalWeight??""; $("matCost").value=m.totalCost??""; $("saveMaterial").textContent="Save Changes"; $("cancelMaterialEdit").hidden=false; $("matBrand").focus();
  }
  function submit(e){
    e.preventDefault();
    const list=materials(), rawIndex=$("materialEditIndex").value, idx=rawIndex===""?null:Number(rawIndex);
    const old=idx===null?null:list[idx];
    const brand=$("matBrand").value.trim(), material=$("matType").value.trim(), color=$("matColor").value.trim();
    const record={id:old?.id||`${slug(brand)}-${slug(material)}-${slug(color)}-${Date.now()}`,brand,material,color,diameter:Number($("matDiameter").value),density:Number($("matDensity").value),purchased:$("matPurchased").value||null,opened:$("matOpened").value||null,totalWeight:Number($("matWeight").value),totalCost:Number($("matCost").value)};
    if(idx===null) list.push(record); else list[idx]=record; save(list); render(); resetForm(); $("status2").textContent=idx===null?"Material added.":"Material updated.";
  }
  function exportJson(){const blob=new Blob([JSON.stringify({version:1,materials:materials(),profiles:profiles()},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="printfolio-material-library.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$("status2").textContent="Library exported."}
  async function importJson(f){try{const d=JSON.parse(await f.text()),m=Array.isArray(d)?d:d.materials;if(!Array.isArray(m))throw new Error("JSON must contain a materials array.");save(m);if(Array.isArray(d.profiles))saveProfiles(d.profiles);render();resetForm();$("status2").textContent=`Imported ${m.length} materials.`}catch(e){$("status2").textContent="Import failed: "+e.message}}
  $("list").addEventListener("click",e=>{
    const edit=e.target.dataset.edit, remove=e.target.dataset.remove;
    if(edit!==undefined){editMaterial(edit);return}
    if(remove===undefined)return;
    const m=materials(),removed=m[Number(remove)]; if(!confirm(`Delete ${removed?.brand||"this material"} ${removed?.material||""}?`))return;
    m.splice(Number(remove),1);save(m);saveProfiles(profiles().filter(p=>p.materialId!==removed?.id));render();$("status2").textContent="Material deleted.";
  });
  $("materialForm").addEventListener("submit",submit);$("cancelMaterialEdit").addEventListener("click",resetForm);$("export").addEventListener("click",exportJson);
  $("import").addEventListener("change",e=>{const f=e.target.files?.[0];if(f)importJson(f);e.target.value=""});render();
})();
