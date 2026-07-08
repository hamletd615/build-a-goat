// Mobile-only screen organization. This does not mutate build, spin, or renderer state.
function setMobileViewTab(tab){
 const app=document.getElementById("app");
 const spin=document.getElementById("mobileSpinTab");
 const build=document.getElementById("mobileBuildTab");
 const next=tab==="build"?"build":"spin";
 if(!app)return;

 app.classList.toggle("mobile-tab-spin",next==="spin");
 app.classList.toggle("mobile-tab-build",next==="build");

 if(spin){
  spin.classList.toggle("active",next==="spin");
  spin.setAttribute("aria-pressed",next==="spin"?"true":"false");
 }

 if(build){
  build.classList.toggle("active",next==="build");
  build.setAttribute("aria-pressed",next==="build"?"true":"false");
 }

 if(next==="build"){
  requestAnimationFrame(()=>{
   if(typeof drawCallouts==="function")drawCallouts();
  });
 }
}

window.setMobileViewTab=setMobileViewTab;
