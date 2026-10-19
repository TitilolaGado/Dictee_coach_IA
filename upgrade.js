'use strict';
const practiceTexts = [
  'Les enfants jouent dans la cour de leur école.',
  'Chaque matin, Aïcha prépare ses cahiers avec soin. Elle aime apprendre et partager ses découvertes.',
  'Elles se sont donné rendez-vous près du marché. Leurs amies, qui les attendaient déjà, leur ont proposé de nouvelles activités.'
];
const practiceFeedback=document.getElementById('practiceFeedback');
function stopPractice(){if('speechSynthesis' in window) window.speechSynthesis.cancel();}
document.getElementById('listenPractice').addEventListener('click',()=>{
 if(!('speechSynthesis' in window)){practiceFeedback.textContent='La lecture vocale est indisponible dans ce navigateur. Essayez un navigateur compatible.';return;}
 stopPractice();const utterance=new SpeechSynthesisUtterance(practiceTexts[Number(document.getElementById('practiceLevel').value)]);
 utterance.lang='fr-FR';utterance.rate=Number(document.getElementById('speechRate').value);
 const voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('fr'));if(voice) utterance.voice=voice;
 utterance.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted') practiceFeedback.textContent='Lecture impossible. Vérifiez la disponibilité d’une voix française et réessayez.';};
 window.speechSynthesis.speak(utterance);
});
document.getElementById('stopSpeech').addEventListener('click',stopPractice);
function resetPractice(){stopPractice();document.getElementById('practiceAnswer').value='';practiceFeedback.replaceChildren();}
document.getElementById('resetPractice').addEventListener('click',resetPractice);
document.getElementById('practiceLevel').addEventListener('change',resetPractice);
document.getElementById('checkPractice').addEventListener('click',()=>{
 const answer=document.getElementById('practiceAnswer').value.trim();
 if(!answer){practiceFeedback.textContent='Écrivez votre dictée avant de la vérifier.';return;}
 if(splitWords(answer).length>1500){practiceFeedback.textContent='Le texte dépasse la limite de 1 500 mots.';return;}
 stopPractice();const reference=practiceTexts[Number(document.getElementById('practiceLevel').value)];const r=compareTexts(reference,answer);
 practiceFeedback.innerHTML=`<p class="practice-score">${r.score} % · ${r.errors.length} erreur(s)</p><p>${escapeHTML(getAppreciation(r.score))}</p><div class="correction-output">${r.outputHTML}</div><details><summary>Relire le texte de référence</summary><p>${escapeHTML(reference)}</p></details><p class="hint">Vert : mot correct · rouge : votre réponse · orange : mot attendu. Réécoutez, puis reprenez les mots à renforcer.</p>`;
});
window.addEventListener('pagehide',stopPractice);

// Local achievements count only completed checks; repeating an unchanged answer
// does not create extra attempts. Earned stars are based on each level's best score.
const journeyKey='dicteeCoachJourneyV1';
function readJourney(){
 try{const x=JSON.parse(localStorage.getItem(journeyKey));
 if(x&&Number.isSafeInteger(x.attempts)&&x.attempts>=0&&Array.isArray(x.best)&&x.best.length===3&&x.best.every(n=>Number.isFinite(n)&&n>=0&&n<=100))return x;
 }catch(_){}return {attempts:0,best:[0,0,0]};
}
let journey=readJourney(),lastChecked='';
function renderJourney(){
 document.getElementById('journeyAttempts').textContent=journey.attempts;
 document.getElementById('journeyBest').textContent=journey.attempts?Math.max(...journey.best)+' %':'—';
 document.getElementById('journeyStars').textContent=journey.best.filter(n=>n>=80).length+' / 3';
 document.getElementById('badgeFirst').classList.toggle('earned',journey.attempts>0);
 document.getElementById('badgeExplorer').classList.toggle('earned',journey.best.every(n=>n>=80));
 document.getElementById('badgeMaster').classList.toggle('earned',journey.best.some(n=>n===100));
}
renderJourney();
document.getElementById('checkPractice').addEventListener('click',()=>{
 const answer=document.getElementById('practiceAnswer').value.trim();if(!answer||splitWords(answer).length>1500)return;
 const level=Number(document.getElementById('practiceLevel').value),fingerprint=level+'|'+answer;
 const result=compareTexts(practiceTexts[level],answer);
 if(fingerprint!==lastChecked){journey.attempts++;journey.best[level]=Math.max(journey.best[level],result.score);lastChecked=fingerprint;try{localStorage.setItem(journeyKey,JSON.stringify(journey));}catch(_){}}
 renderJourney();const note=document.createElement('p');note.className='practice-feedback-note';
 note.textContent=result.score===100?'★ Sans faute ! Savourez cette réussite, puis explorez un autre niveau.':result.score>=80?'✦ Une étoile de plus dans votre parcours ! Reprenez les derniers mots pour aller encore plus loin.':'✦ Bravo pour cet essai ! Choisissez un mot à améliorer, réécoutez et tentez à nouveau.';
 practiceFeedback.prepend(note);practiceFeedback.classList.remove('celebrate');void practiceFeedback.offsetWidth;practiceFeedback.classList.add('celebrate');
});
