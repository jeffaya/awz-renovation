const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const menuBtn=$('#menu-btn'),mobileMenu=$('#mobile-menu');
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{mobileMenu.classList.toggle('hidden');document.body.classList.toggle('no-scroll');menuBtn.setAttribute('aria-expanded',String(!mobileMenu.classList.contains('hidden')))});$$('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.add('hidden');document.body.classList.remove('no-scroll')}));}
$$('.comparison').forEach(c=>{const input=$('input',c),after=$('.after',c),handle=$('.handle',c);if(input){const update=()=>{after.style.width=input.value+'%';handle.style.left=input.value+'%';};input.addEventListener('input',update);update();}});
$$('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{const filter=btn.dataset.filter;$$('[data-filter]').forEach(b=>b.classList.remove('bg-[#14362e]','text-white'));btn.classList.add('bg-[#14362e]','text-white');$$('[data-project]').forEach(card=>{card.classList.toggle('hidden',filter!=='all'&&card.dataset.project!==filter)});}));
const y=$('#year');if(y)y.textContent=new Date().getFullYear();

const contactForm=$('#contact-form');
if(contactForm){
  contactForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const data=new FormData(contactForm);
    const subject=encodeURIComponent('Demande de devis AWZ-Rénovation - '+(data.get('Nom')||'Nouveau contact'));
    const body=encodeURIComponent(
      'Nom : '+(data.get('Nom')||'')+'\n'+
      'Téléphone : '+(data.get('Téléphone')||'')+'\n'+
      'Email : '+(data.get('Email')||'')+'\n'+
      'Code postal : '+(data.get('Code postal')||'')+'\n'+
      'Type de travaux : '+(data.get('Type de travaux')||'')+'\n\n'+
      'Projet :\n'+(data.get('Message')||'')
    );
    window.location.href='mailto:antonywouenzell@yahoo.fr?subject='+subject+'&body='+body;
  });
}
