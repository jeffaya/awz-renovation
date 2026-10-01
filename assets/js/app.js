const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const menuBtn=$('#menu-btn'),mobileMenu=$('#mobile-menu');
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{mobileMenu.classList.toggle('hidden');document.body.classList.toggle('no-scroll');menuBtn.setAttribute('aria-expanded',String(!mobileMenu.classList.contains('hidden')))});$$('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.add('hidden');document.body.classList.remove('no-scroll')}));}
const year=$('#year');if(year)year.textContent=new Date().getFullYear();
const photos=$('#photos'),photoStatus=$('#photo-status');
if(photos&&photoStatus){photos.addEventListener('change',()=>{const files=[...photos.files];if(files.length>5){alert('Merci de sélectionner 5 photos maximum.');photos.value='';photoStatus.textContent='Appuyez ici pour choisir ou prendre des photos';return}photoStatus.textContent=files.length?files.length+' photo'+(files.length>1?'s':'')+' sélectionnée'+(files.length>1?'s':''):'Appuyez ici pour choisir ou prendre des photos'})}
