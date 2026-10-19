'use strict';
document.querySelectorAll('[data-password]').forEach(button=>{
 button.addEventListener('click',()=>{const input=document.getElementById(button.dataset.password);const reveal=input.type==='password';input.type=reveal?'text':'password';button.setAttribute('aria-pressed',String(reveal));button.textContent=reveal?'Masquer le mot de passe':'Afficher le mot de passe';});
});
const topButton=document.createElement('button');topButton.type='button';topButton.className='scroll-top';topButton.textContent='↑';topButton.setAttribute('aria-label','Revenir en haut de la page');topButton.hidden=true;document.body.append(topButton);
topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
window.addEventListener('scroll',()=>{topButton.hidden=window.scrollY<650},{passive:true});
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('interface-reveal');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.card,.pathway-strip article').forEach(card=>observer.observe(card));}
const spaceLink=document.querySelector('.header-nav a[href="#authSection"]');
spaceLink.addEventListener('click',event=>{if(currentUser){event.preventDefault();showHome();document.getElementById('homeSection').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}});
