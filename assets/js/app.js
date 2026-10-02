const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const menuBtn=$('#menu-btn'),mobileMenu=$('#mobile-menu');
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{mobileMenu.classList.toggle('hidden');document.body.classList.toggle('no-scroll');menuBtn.setAttribute('aria-expanded',String(!mobileMenu.classList.contains('hidden')))});$$('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.add('hidden');document.body.classList.remove('no-scroll')}));}
const year=$('#year');if(year)year.textContent=new Date().getFullYear();
