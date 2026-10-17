'use strict';
document.documentElement.classList.add('js');
// TODO: подключить URL обработчика заявок. Пустое значение включает демонстрационный режим.
const FORM_ENDPOINT = '';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const typograph = text => text.replace(/(^|[\s(«])([А-Яа-яЁё]{1,2}) /g,'$1$2\u00a0');
const textWalker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
let textNode;
while((textNode=textWalker.nextNode())){if(!textNode.parentElement.closest('script,style,textarea,option'))textNode.textContent=typograph(textNode.textContent);}
const header = $('.header');
const menuButton = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');mobileMenu.hidden=true;document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileMenu.hidden=!open;document.body.classList.toggle('menu-open',open);if(open)$('a',mobileMenu).focus();});
$$('a',mobileMenu).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileMenu.hidden){closeMenu();menuButton.focus();}if(e.key==='Tab'&&!mobileMenu.hidden){const links=[menuButton,...$$('a',mobileMenu)];if(e.shiftKey&&document.activeElement===links[0]){e.preventDefault();links.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();links[0].focus();}}});
const sticky=$('.mobile-sticky');
let scheduled=false;
function updateScroll(){header.classList.toggle('scrolled',scrollY>80);const hero=$('.hero').getBoundingClientRect();const footer=$('footer').getBoundingClientRect();sticky.hidden=!(hero.bottom<72&&footer.top>innerHeight);scheduled=false;}
addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(updateScroll);scheduled=true;}},{passive:true});
addEventListener('resize',()=>{updateScroll();if(innerWidth>1200)closeMenu();});updateScroll();
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window&&!reduceMotion){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}});},{threshold:.07});$$('.reveal').forEach(e=>observer.observe(e));}else{$$('.reveal').forEach(e=>e.classList.add('visible'));}
const captions={matched:'Соседние плиты раскрыты, как книга: рисунок отражается и сходится на каждом шве.',mismatched:'Те же плиты без карты раскладки: рисунок обрывается на стыках, и переделать это уже нельзя.'};
const technical={matched:'Пример: плиты 01-A и 01-B из одного блока, рисунок идёт через шов без разрыва',mismatched:'Плиты разложены наугад: рисунок рвётся на каждом шве'};
const stoneWall=$('.book-wall');
function loadStone(){const url=new URL('assets/img/S1-1920.webp',document.baseURI);stoneWall.style.setProperty('--stone-image',`url("${url.href}")`);}
if('IntersectionObserver' in window){const stoneObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadStone();stoneObserver.disconnect();}},{rootMargin:'400px'});stoneObserver.observe(stoneWall);}else{loadStone();}
$$('[data-layout]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.layout;$('.book-demo').classList.toggle('is-mismatched',mode==='mismatched');$$('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#layout-caption').textContent=typograph(captions[mode]);$('.book-controls .technical').textContent=technical[mode];$('.book-wall').setAttribute('aria-label',mode==='matched'?'Четыре зеркальные панели мрамора: прожилки сходятся на швах':'Те же четыре панели: прожилки обрываются на швах');}));
const materials=[['Гранит','Самый стойкий камень: не боится воды, жира и горячего. Для фасадов, ступеней, полов и кухонь.'],['Мрамор','Самый выразительный рисунок для полов, стен, каминов и лестниц. Боится вина и лимона, поэтому на кухню лучше гранит или кварцит.'],['Кварцит','Рисунок как у мрамора и твёрдость как у гранита. Лучший выбор для кухонных столешниц и островов.'],['Травертин','Тёплый камень с порами для стен, купелей и террас. Поры заполняют, чтобы не собиралась грязь.'],['Оникс','Полупрозрачный камень. С подсветкой превращается в световую стену. Лучше всего для стен и акцентов.'],['Сланец','Слоистая фактура, которая не скользит. Для стен, полов и ландшафта.']];
let selectedMaterial=0;
function selectMaterial(index){selectedMaterial=index;$$('[data-material]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));$$('.material-image').forEach((img,i)=>img.classList.toggle('active',i===index));$('#material-name').textContent=materials[index][0];$('#material-description').textContent=typograph(materials[index][1]);}
$$('[data-material]').forEach(b=>{b.addEventListener('click',()=>selectMaterial(Number(b.dataset.material)));b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')selectMaterial(Number(b.dataset.material));});});
const form=$('#estimate-form'),success=$('#form-success');
const quizSteps=$$('.quiz-step',form),quizBack=$('#quiz-back');
let quizStep=1,quizAdvanceTimer;
function renderQuiz(){
  $$('.quiz-option',form).forEach(button=>{const selected=$('#'+button.dataset.field,form).value===button.dataset.answer;button.setAttribute('aria-pressed',String(selected));});
  const zone=$('#zone',form).value;$('#quiz-zone').hidden=!zone;$('#quiz-zone-name').textContent=typograph(zone);
  $('#quiz-step-number').textContent=quizStep;$('#quiz-progress-fill').style.width=(quizStep/5*100)+'%';$('.quiz-track',form).setAttribute('aria-valuenow',String(quizStep));$('.quiz-track',form).setAttribute('aria-label',`Шаг ${quizStep} из 5`);quizBack.hidden=quizStep===1;
}
function showQuizStep(step,focus=true){
  clearTimeout(quizAdvanceTimer);quizStep=Math.max(1,Math.min(5,step));
  quizSteps.forEach(el=>{el.hidden=Number(el.dataset.step)!==quizStep;el.classList.remove('quiz-enter');});
  const active=quizSteps[quizStep-1];void active.offsetWidth;active.classList.add('quiz-enter');renderQuiz();if(focus)$('h3',active).focus({preventScroll:true});
}
$$('.quiz-option',form).forEach(button=>button.addEventListener('click',()=>{
  clearTimeout(quizAdvanceTimer);$('#'+button.dataset.field,form).value=button.dataset.answer;
  if(button.dataset.field==='scope'&&button.dataset.answer!=='Одно изделие')$('#zone',form).value='';
  renderQuiz();const selectedStep=quizStep;quizAdvanceTimer=setTimeout(()=>{if(quizStep===selectedStep)showQuizStep(selectedStep+1);},350);
}));
quizBack.addEventListener('click',()=>showQuizStep(quizStep-1));
$$('a[href="#raschet"]').forEach(link=>link.addEventListener('click',()=>{if(form.hidden)resetQuiz();}));
$('#material-cta').addEventListener('click',()=>{clearTimeout(quizAdvanceTimer);$('#stone',form).value=materials[selectedMaterial][0];renderQuiz();});
$$('.price-link').forEach(link=>link.addEventListener('click',()=>{clearTimeout(quizAdvanceTimer);$('#zone',form).value=link.dataset.zone;$('#scope',form).value='Одно изделие';renderQuiz();}));
$('#slabs-cta').addEventListener('click',()=>{$('#scope',form).value='Только слэбы, без обработки';$('#zone',form).value='';showQuizStep(2);});
showQuizStep(1,false);
const videoPlay=$('.video-play'),videoToast=$('#production-toast');
let videoTimer;
videoPlay.addEventListener('click',()=>{clearTimeout(videoTimer);videoToast.hidden=false;videoTimer=setTimeout(()=>{videoToast.hidden=true;},3000);});
const phone=$('#phone');
function maskPhone(input){let digits=input.value.replace(/\D/g,'');if(digits[0]==='7'||digits[0]==='8')digits=digits.slice(1);digits=digits.slice(0,10);let value='+7';if(digits.length)value+=' ('+digits.slice(0,3);if(digits.length>=3)value+=') ';if(digits.length>3)value+=digits.slice(3,6);if(digits.length>6)value+='-'+digits.slice(6,8);if(digits.length>8)value+='-'+digits.slice(8,10);input.value=value;}
phone.addEventListener('input',()=>maskPhone(phone));
let files=[];
const filesInput=$('#files'),dropZone=$('#drop-zone');
function renderFiles(){const list=$('#file-list');list.replaceChildren();files.forEach((file,index)=>{const li=document.createElement('li'),name=document.createElement('span'),remove=document.createElement('button');name.textContent=file.name+', '+(file.size/1048576).toFixed(1)+' МБ';remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Удалить '+file.name);remove.addEventListener('click',()=>{files.splice(index,1);renderFiles();});li.append(name,remove);list.append(li);});}
function addFiles(incoming){const errors=[];for(const file of incoming){if(!/\.(pdf|jpe?g|png|dwg)$/i.test(file.name)){errors.push('Допустимы PDF, JPG, PNG и DWG.');continue;}if(file.size>25*1048576){errors.push('Размер файла не должен превышать 25 МБ.');continue;}if(!files.some(f=>f.name===file.name&&f.size===file.size))files.push(file);}$('#files-error').textContent=[...new Set(errors)].join(' ');renderFiles();filesInput.value='';}
filesInput.addEventListener('change',()=>addFiles(filesInput.files));
['dragenter','dragover'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();dropZone.classList.add('dragging');}));
['dragleave','drop'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();dropZone.classList.remove('dragging');}));
dropZone.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
function setError(id,message){$('#'+id+'-error').textContent=message;$('#'+id).setAttribute('aria-invalid',String(Boolean(message)));}
['name','phone','consent'].forEach(id=>$('#'+id).addEventListener('input',()=>setError(id,'')));
form.addEventListener('submit',async event=>{event.preventDefault();if(quizStep!==5)return;const errors={name:$('#name').value.trim()?'':'Укажите имя.',phone:phone.value.replace(/\D/g,'').length===11?'':'Укажите телефон полностью.',consent:$('#consent').checked?'':'Подтвердите согласие на обработку персональных данных.'};Object.entries(errors).forEach(([id,message])=>setError(id,message));const invalid=Object.keys(errors).find(key=>errors[key]);if(invalid){$('#'+invalid).focus();return;}const submit=$('.submit');submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='Отправляем…';$('#submit-error').textContent='';try{const data=new FormData(form);files.forEach(file=>data.append('files',file));if(FORM_ENDPOINT){const response=await fetch(FORM_ENDPOINT,{method:'POST',body:data});if(!response.ok)throw new Error('Request failed');}else{console.info('Демонстрационная заявка, отправка на сервер не настроена:',Object.fromEntries(data),{files:files.map(f=>({name:f.name,size:f.size}))});}form.hidden=true;success.hidden=false;goal('form_full');success.focus();}catch{$('#submit-error').textContent='Не удалось отправить заявку. Попробуйте ещё раз или позвоните: 8 (800) 600-05-31';}finally{submit.disabled=false;submit.removeAttribute('aria-busy');submit.textContent='Получить расчёт ↗';}});
const quickForm=$('#quick-form'),quickPhone=$('#quick-phone');
quickPhone.addEventListener('input',()=>{maskPhone(quickPhone);quickPhone.removeAttribute('aria-invalid');});
quickForm.addEventListener('submit',async event=>{event.preventDefault();const status=$('.quick-status',quickForm);if(quickPhone.value.replace(/\D/g,'').length!==11){quickPhone.setAttribute('aria-invalid','true');status.textContent='Укажите телефон полностью.';quickPhone.focus();return;}const data=new FormData(quickForm);data.append('source','quick-form');try{if(FORM_ENDPOINT){const response=await fetch(FORM_ENDPOINT,{method:'POST',body:data});if(!response.ok)throw new Error('Request failed');}else{console.info('Демонстрационная быстрая заявка:',Object.fromEntries(data));}quickForm.reset();status.textContent='Спасибо! Менеджер ответит за 5 минут.';goal('form_quick');}catch{status.textContent='Не удалось отправить. Позвоните: 8 (800) 600-05-31';}});
function countUp(el){const to=Number(el.dataset.to),start=performance.now();const tick=now=>{const p=Math.min((now-start)/1400,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}
if(!reduceMotion)$$('.count').forEach(el=>{el.textContent='0';setTimeout(()=>countUp(el),500);});
function resetQuiz(){form.reset();['scope','stone','stage','channel','zone'].forEach(field=>$('#'+field,form).value='');files=[];renderFiles();$$('.error',form).forEach(e=>e.textContent='');$$('[aria-invalid]',form).forEach(e=>e.removeAttribute('aria-invalid'));success.hidden=true;form.hidden=false;showQuizStep(1);}
$('#reset-form').addEventListener('click',resetQuiz);
// TODO: номер счётчика Метрики. Цели: click_phone, click_telegram, click_max, form_full, form_quick
const METRIKA_ID=0;
function goal(name){if(METRIKA_ID&&typeof window.ym==='function')window.ym(METRIKA_ID,'reachGoal',name);}
document.addEventListener('click',e=>{const el=e.target.closest('[data-goal]');if(el)goal(el.dataset.goal);});
// микроэффекты как в v5: прожектор только для мыши
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduceMotion){$$('.fear-card,.step-body,.layout-points article').forEach(el=>{el.classList.add('spot');el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',e.clientX-r.left+'px');el.style.setProperty('--my',e.clientY-r.top+'px');});});}
$$('[data-layout]').forEach(b=>b.addEventListener('click',()=>$('.segmented').classList.toggle('is-right',b.dataset.layout==='mismatched')));
