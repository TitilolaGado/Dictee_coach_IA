'use strict';
(()=>{
 const $=id=>document.getElementById(id),queue=$('paperQueue'),items=[];let busy=false;
 function openPaper(){if(!requireRole('enseignant'))return;hideAllAppSections();$('paperCopiesSection').classList.remove('hidden-section');$('paperCopiesSection').scrollIntoView({block:'start'});}
 $('showPaperCopiesBtn').onclick=openPaper;
 function clear(){if(busy){$('paperStatus').textContent='Attendez la fin de la lecture en cours.';return;}if(items.length&&!confirm('Retirer les imports temporaires et leurs transcriptions non enregistrées ?'))return;items.forEach(x=>{if(x.url)URL.revokeObjectURL(x.url)});items.length=0;queue.replaceChildren();$('paperFiles').value='';$('paperCamera').value='';$('paperStatus').textContent='Imports retirés. Les corrections déjà enregistrées sont conservées.';}
 $('clearPaperQueue').onclick=clear;
 function add(file){
  if(items.length>=20){$('paperStatus').textContent='Limite de 20 imports atteinte.';return;}
  if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>15*1024*1024){$('paperStatus').textContent='Fichier refusé : utilisez JPEG, PNG, WebP ou PDF de 15 Mo maximum.';return;}
  const item={url:URL.createObjectURL(file),file,saved:false};items.push(item);
  const card=document.createElement('article');card.className='paper-copy';
  const header=document.createElement('h3');header.textContent=file.name;card.append(header);
  const layout=document.createElement('div');layout.className='paper-layout';const preview=document.createElement('div');
  if(file.type==='application/pdf'){const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener';a.textContent='Ouvrir le scan PDF pour le relire';preview.append(a);}
  else{const img=document.createElement('img');img.src=item.url;img.alt='Copie à relire : '+file.name;preview.append(img);const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener';a.textContent='Agrandir la copie';preview.append(a);}
  const form=document.createElement('div');const prefix='paper_'+items.length+'_'+Date.now();
  form.innerHTML=`<label for="${prefix}_evaluation">Évaluation concernée</label><select id="${prefix}_evaluation"></select><label for="${prefix}_name">Nom et prénom de l’élève</label><input id="${prefix}_name" type="text" placeholder="Identité de l’élève"/><label for="${prefix}_class">Classe</label><input id="${prefix}_class" type="text"/><button type="button" class="secondary" id="${prefix}_read">Tenter la lecture automatique</button><p role="status" id="${prefix}_status"></p><label for="${prefix}_text">Transcription fidèle de la copie, fautes comprises</label><textarea id="${prefix}_text" spellcheck="false"></textarea><label class="paper-validation"><input type="checkbox" id="${prefix}_verified"/> J’ai comparé la transcription à la copie et conservé les erreurs de l’élève.</label><button type="button" id="${prefix}_save">Valider et corriger cette copie</button>`;
  const field=name=>form.querySelector('#'+prefix+'_'+name);const select=field('evaluation');
  evaluations.filter(e=>e.teacherId===currentUser.id).forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.title+' · '+e.classe;select.append(o)});
  if(!select.options.length){const o=document.createElement('option');o.value='';o.textContent='Créez d’abord une évaluation';select.append(o);}
  const selected=()=>evaluations.find(e=>e.id===select.value&&e.teacherId===currentUser.id);
  select.onchange=()=>{field('class').value=selected()?.classe||'';field('verified').checked=false};select.onchange();
  field('read').disabled=file.type==='application/pdf';
  field('text').oninput=()=>field('verified').checked=false;
  field('read').onclick=async()=>{
   if(busy){field('status').textContent='Une autre lecture est en cours. Patientez.';return;}
   if(field('text').value.trim()&&!confirm('Remplacer la transcription actuelle par une nouvelle lecture ?'))return;
   busy=true;field('read').disabled=true;field('verified').checked=false;
   try{field('status').textContent='Chargement du moteur français… Une connexion Internet peut être nécessaire.';field('text').value=cleanOCRText(await extractTextFromImage(file,field('status')));field('status').textContent='Texte proposé. Vérifiez chaque mot avec l’image : une mauvaise lecture peut créer de fausses erreurs.';}
   catch(e){field('status').textContent='Lecture indisponible ou impossible. Vous pouvez retranscrire la copie manuellement.';}
   finally{busy=false;field('read').disabled=false;}
  };
  field('save').onclick=()=>{
   if(item.saved)return;if(!requireRole('enseignant'))return;
   const e=selected(),name=field('name').value.trim(),classe=field('class').value.trim(),text=field('text').value.trim();
   if(!e||!name||!classe||!text||!field('verified').checked){field('status').textContent='Choisissez l’évaluation, indiquez l’élève et la classe, puis vérifiez et validez la transcription.';return;}
   if(splitWords(text).length>1500||splitWords(e.referenceText).length>1500){field('status').textContent='Maximum 1 500 mots pour le modèle et la copie.';return;}
   // Reuse the existing correction and follow-up pipeline after explicit transcription validation.
   $('evaluationSelect').value=e.id;$('studentFullName').value=name;$('studentClass').value=classe;$('studentText').value=text;
   const before=e.copies.length;correctAndSaveCopy();if(e.copies.length>before){item.saved=true;field('save').disabled=true;field('save').textContent='✓ Copie corrigée et enregistrée';field('status').textContent='Correction enregistrée. Complétez ci-dessous l’appréciation et le suivi.';e.copies[e.copies.length-1].source='papier';saveEvaluations();}
  };
  layout.append(preview,form);card.append(layout);queue.append(card);$('paperStatus').textContent=items.length+' copie(s) importée(s), à identifier et vérifier.';
 }
 for(const id of ['paperFiles','paperCamera'])$(id).onchange=event=>{if(!requireRole('enseignant'))return;Array.from(event.target.files).forEach(f=>add(f));event.target.value='';};
 window.addEventListener('pagehide',()=>items.forEach(x=>{if(x.url)URL.revokeObjectURL(x.url)}));
})();
