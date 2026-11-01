/* KAVACH partner onboarding module. Adds registration flows to the existing Kavach Circle site.
   Drop-in: needs only <script src="kavach-partners.js"></script> before </body> in index.html. */
(function(){
  var SHEET_URL="https://script.google.com/macros/s/AKfycbzTpXwyJugWvFT4GdwO6S3mI3EvoMjlnIJiZ_G4A09iqRaDv---F5fWNDDu2I_aujy1/exec";
  var COMMON=[["name","Name","text",1],["city","City","text",1],["pin","PIN code (optional)","text",0],["contact","Email or phone","text",1]];
  var FLOWS={
    dashcam:{t:"Vehicle or dashcam owner",d:"Register your vehicle and dashcam.",f:[
      ["vehicle","Vehicle type","select",1,["Car","Two-wheeler","Auto or taxi","Truck or commercial","Other"]],
      ["make","Dashcam make","text",0],["model","Dashcam model","text",0],
      ["deviceId","Device ID or serial (optional, leave blank if unsure)","text",0],
      ["connected","Does the dashcam have an app, cloud or Wi-Fi feature?","select",0,["Yes","No","Not sure"]]],
      consent:["I understand that registering a device does not give KAVACH access to any recording. Footage would only ever be shared by me, voluntarily, with separate consent."]},
    fleet:{t:"Fleet or organisation",d:"Register a fleet operator, company or institution.",f:[
      ["org","Organisation name","text",1],
      ["fleetSize","Approximate number of vehicles","select",0,["1–10","11–50","51–200","200+","No vehicles"]],
      ["cameras","Do your vehicles have cameras?","select",0,["Yes, most","Some","No","Not sure"]],
      ["about","What would you like to explore with KAVACH?","textarea",0]]},
    property:{t:"Property or infrastructure partner",d:"Offer a location or infrastructure as a partner.",f:[
      ["org","Property or organisation name","text",1],
      ["ptype","Type of property","select",1,["Shop or business","Petrol pump","Housing society","Campus","Public infrastructure","Other"]],
      ["area","Area or locality (no full street address needed)","text",0],
      ["about","How could this location help?","textarea",0]]},
    capability:{t:"Offer a capability",d:"Technical, design or manufacturing skills.",f:[
      ["kind","What are you offering?","select",1,["Software or technical","Electronics or manufacturing","Research or design","Other"]],
      ["about","Describe it","textarea",1]]}
  };
  function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
  function save(rec){
    try{var a=JSON.parse(localStorage.getItem("kavach_partner_registrations")||"[]");a.push(rec);localStorage.setItem("kavach_partner_registrations",JSON.stringify(a))}catch(e){}
    try{fetch(SHEET_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({sheet:"Partner Registrations",payload:rec})}).catch(function(){})}catch(e){}
  }
  function fieldHTML(f,pre){
    var id=pre+f[0],req=f[3]?" required":"",lab='<label for="'+id+'">'+esc(f[1])+"</label>";
    if(f[2]==="select")return'<div class="field">'+lab+'<select id="'+id+'"'+req+'><option value="">Choose…</option>'+f[4].map(function(o){return"<option>"+esc(o)+"</option>"}).join("")+"</select></div>";
    if(f[2]==="textarea")return'<div class="field">'+lab+'<textarea id="'+id+'"'+req+"></textarea></div>";
    return'<div class="field">'+lab+'<input type="text" id="'+id+'"'+req+"></div>";
  }
  function viewFor(k){
    var F=FLOWS[k],pre="p_"+k+"_",h='<section class="block"><button class="btn btn-quiet" type="button" onclick="showView(\'partners\')">← Back</button><h2 style="margin-top:18px">'+esc(F.t)+'</h2>'+
      '<div class="disclaimer-box">KAVACH is a prototype, not an emergency service, and does not alert anyone. In an emergency in India call <b>112</b>. Please don’t enter Aadhaar, bank details, your exact home address or live location. We don’t need them.</div><form id="'+pre+'form" novalidate>';
    COMMON.concat(F.f).forEach(function(f){h+=fieldHTML(f,pre)});
    h+='<div class="consent-list">';
    (F.consent||[]).forEach(function(c){h+='<label class="consent-item"><input type="checkbox" class="'+pre+'c"> <span>'+esc(c)+"</span></label>"});
    h+='<label class="consent-item"><input type="checkbox" class="'+pre+'c"> <span>I agree that KAVACH may store these details and contact me about this registration. I can ask for deletion at any time.</span></label></div>'+
      '<p class="field-hint" id="'+pre+'err" role="alert" style="color:var(--alarm)"></p><button class="btn btn-primary btn-block" type="submit">Submit registration</button></form>'+
      '<div id="'+pre+'done" style="display:none" class="disclaimer-box"></div></section>';
    var v=document.createElement("section");v.className="view";v.id="view-p-"+k;v.innerHTML=h;document.querySelector("main").appendChild(v);
    document.getElementById(pre+"form").addEventListener("submit",function(e){
      e.preventDefault();var err=document.getElementById(pre+"err");err.textContent="";
      var missing=COMMON.concat(F.f).filter(function(f){return f[3]&&!document.getElementById(pre+f[0]).value.trim()});
      var unchecked=Array.prototype.some.call(document.querySelectorAll("."+pre+"c"),function(c){return!c.checked});
      if(missing.length||unchecked){err.textContent="Please fill the required fields and tick every consent box.";return}
      var rec={type:F.t,status:"new",submittedAt:new Date().toISOString(),consent:"yes"};
      COMMON.concat(F.f).forEach(function(f){rec[f[0]]=document.getElementById(pre+f[0]).value.trim().slice(0,1000)});
      save(rec);
      document.getElementById(pre+"form").style.display="none";
      var d=document.getElementById(pre+"done");d.style.display="block";
      d.innerHTML="<strong>Thank you, "+esc(rec.name)+".</strong> Your registration has been submitted for review. Nothing is live and nobody has been contacted yet. We will reach out if there is a next step.<div style=\"margin-top:12px\"><button class=\"btn btn-outline\" type=\"button\" onclick=\"showView('home')\">Back to home</button></div>";
      if(window.showBanner)showBanner("Registration submitted");
    });
  }
  // hub view
  var hub='<section class="block"><h2>Partner with KAVACH</h2><p class="lede">Register interest as a vehicle owner, fleet, property partner or capability provider. This is a beta: registering is interest, not an agreement, and nothing is promised in advance, including hardware or earnings.</p><div class="action-grid">';
  Object.keys(FLOWS).forEach(function(k){hub+='<button class="action-card" onclick="showView(\'p-'+k+'\')"><span class="label">'+esc(FLOWS[k].t)+'</span><p class="desc">'+esc(FLOWS[k].d)+'</p><span class="go">Register →</span></button>'});
  hub+="</div></section>";
  var hv=document.createElement("section");hv.className="view";hv.id="view-partners";hv.innerHTML=hub;document.querySelector("main").appendChild(hv);
  Object.keys(FLOWS).forEach(viewFor);
  // entry points: home card + menu item
  var grid=document.querySelector("#view-home .action-grid");
  if(grid){var c=document.createElement("button");c.className="action-card";c.onclick=function(){showView("partners")};c.innerHTML='<span class="label">Partner with KAVACH</span><p class="desc">Vehicle, fleet, property or capability partners.</p><span class="go">Start →</span>';grid.appendChild(c)}
  var dr=document.getElementById("drawer");
  if(dr){var b=document.createElement("button");b.className="drawer-item";b.textContent="Partner with KAVACH";b.onclick=function(){navTo("partners")};var items=dr.querySelectorAll(".drawer-item");items[items.length-1].after(b)}
})();
