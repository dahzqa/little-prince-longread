(function(){
  'use strict';
  gsap.registerPlugin(ScrollTrigger);

  var INK='#3d3d3d';
  var YELLOW='#e1cc2e';
  var root=document.documentElement;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.from((c||document).querySelectorAll(s))}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  function fit(){
    var s=innerWidth<=767?1:Math.min(innerWidth/1046,innerHeight/587);
    root.style.setProperty('--s',s);
  }
  fit();
  addEventListener('resize',fit,{passive:true});

  function wrapWords(el){
    if(!el||el.dataset.wrapped==='1')return;
    function walk(node){
      Array.from(node.childNodes).forEach(function(ch){
        if(ch.nodeType===3){
          var text=ch.nodeValue;
          if(!text)return;
          var frag=document.createDocumentFragment();
          text.split(/(\s+)/).forEach(function(part){
            if(!part)return;
            if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));}
            else{
              var sp=document.createElement('span');
              sp.className='reveal-word';
              sp.textContent=part;
              frag.appendChild(sp);
            }
          });
          ch.parentNode.replaceChild(frag,ch);
        }else if(ch.nodeType===1 && ch.tagName!=='BR') walk(ch);
      });
    }
    walk(el);
    el.dataset.wrapped='1';
  }

  function splitTitlePrecisely(){
    $$('.title-line').forEach(function(line){
      var text=line.textContent;
      if(!text||line.dataset.split==='1')return;
      var tn=line.firstChild;
      var lineRect=line.getBoundingClientRect();
      var cs=getComputedStyle(line);
      var lineHeight=parseFloat(cs.lineHeight)||56;
      var stageScale=innerWidth<=767?1:(parseFloat(getComputedStyle(root).getPropertyValue('--s'))||1);
      var positions=[];
      for(var i=0;i<text.length;i++){
        var range=document.createRange();
        range.setStart(tn,i);range.setEnd(tn,i+1);
        var r=range.getBoundingClientRect();
        positions.push({left:(r.left-lineRect.left)/stageScale});
      }
      line.style.width=(lineRect.width/stageScale)+'px';
      line.style.height=lineHeight+'px';
      line.textContent='';
      var isMobile=innerWidth<=767;
      var mobileTitleTightness=isMobile?1:1;
      var princeBreak=(isMobile&&text.indexOf('принцем')!==-1)?text.indexOf('принцем'):-1;
      var princeBase=princeBreak>=0?positions[princeBreak].left:0;
      positions.forEach(function(pos,i){
        if(text[i]===' ')return;
        var sp=document.createElement('span');
        var left=pos.left;
        var top=0;
        if(princeBreak>=0&&i>=princeBreak){
          left=pos.left-princeBase;
          top=lineHeight;
        }
        sp.className='hero-char';
        sp.textContent=text[i];
        sp.style.left=(left*mobileTitleTightness)+'px';
        sp.style.top=top+'px';
        line.appendChild(sp);
      });
      if(isMobile){
        line.style.width=(lineRect.width*mobileTitleTightness)+'px';
        if(princeBreak>=0)line.style.height=(lineHeight*2)+'px';
      }
      line.dataset.split='1';
    });
  }

  function gentlePhoto(sel,delay){
    var el=$(sel);if(!el)return;
    var parts=$$('.frame,.photo',el);
    gsap.to(parts,{y:-2.4,rotation:'+=0.55',duration:3.9,repeat:-1,yoyo:true,ease:'sine.inOut',delay:delay||0});
  }
  function gentleCharacter(sel,delay){
    var el=$(sel);if(!el)return;
    gsap.to(el,{x:1.1,y:-2.4,duration:4.2,repeat:-1,yoyo:true,ease:'sine.inOut',delay:delay||0});
  }
  function gentleBox(sel,delay,amount){
    var el=$(sel);if(!el)return;
    gsap.to(el,{y:-(amount||2.5),rotation:'+=0.45',duration:4.2,repeat:-1,yoyo:true,ease:'sine.inOut',delay:delay||0});
  }

  function makeWordPin(sectionSel,contentSel,id,length,after){
    var content=$(contentSel);if(!content)return;
    wrapWords(content);
    var words=$$('.reveal-word',content);
    gsap.set(words,{opacity:0});
    var tl=gsap.timeline({scrollTrigger:{id:id,trigger:sectionSel,start:'top top',end:function(){return '+='+Math.round(innerHeight*length)},pin:true,scrub:1,invalidateOnRefresh:true}});
    tl.to(words,{opacity:1,duration:.9,stagger:{each:.035},ease:'none'},.03);
    if(after)after(tl,words);
    tl.to({}, {duration:.18});
    return tl;
  }

  function initAnimations(){
    fit();
    splitTitlePrecisely();

    /* Existing approved part: s1-s6 */
    $$('.hero-char').forEach(function(ch,i){
      gsap.to(ch,{x:(i%2?-1.15:1.15),y:(i%3?-0.55:0.55),rotation:(i%3?-0.42:0.42),duration:2.8+(i%5)*.12,repeat:-1,yoyo:true,ease:'sine.inOut',delay:i*.018});
    });
    gsap.to('.hint span',{y:8,duration:1.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
    gsap.timeline({scrollTrigger:{id:'heroPin',trigger:'#s1',start:'top top',end:function(){return '+='+Math.round(innerHeight*1.8)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.author,.curator',{opacity:0,y:-8,duration:.3,ease:'none'},.08)
      .to('.hint',{opacity:0,y:20,duration:.35,ease:'none'},.48)
      .to({}, {duration:.25});

    makeWordPin('#s2','#s2 .intro','introPin',2.4);

    gsap.set('.castle',{x:innerWidth<=767?-82:-235});
    gsap.set('.g1',{opacity:1});
    gsap.set('.q0,.q1,.q2a,.q2b,.d31,.d32',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'dialogueOnePin',trigger:'#s3',start:'top top',end:function(){return '+='+Math.round(innerHeight*3.45)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.castle',{x:0,duration:.34,ease:'none'},.05)
      .to('.q0',{opacity:1,duration:.17,ease:'none'},.26)
      .to('.d31',{opacity:1,duration:.05,ease:'none'},.48)
      .to('.q1',{opacity:1,duration:.15,ease:'none'},.52)
      .to('.d32',{opacity:1,duration:.05,ease:'none'},.68)
      .to('.q2a',{opacity:1,duration:.15,ease:'none'},.72)
      .to('.q2b',{opacity:1,duration:.15,ease:'none'},.84)
      .to({}, {duration:.14});
    gentlePhoto('.castle',.2);gentleCharacter('.g1',.4);

    gsap.set('#s4 .m1',{y:171});gsap.set('#s4 .memory-photo',{opacity:0,y:12});
    gsap.timeline({scrollTrigger:{id:'memoryOnePin',trigger:'#s4',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.9)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('#s4 .memory-mark',{color:YELLOW,duration:.30,ease:'none'},.08)
      .to('#s4 .m1',{y:0,duration:.20,ease:'none'},.43)
      .to('#s4 .selfie',{opacity:1,y:0,duration:.21,ease:'none'},.64)
      .to('#s4 .ground',{opacity:1,y:0,duration:.21,ease:'none'},.80)
      .to({}, {duration:.17});
    gentlePhoto('.selfie',.1);gentlePhoto('.ground',.45);

    gsap.set('#s5 .m2',{y:182});gsap.set('#s5 .memory2-photo',{opacity:0,y:12});
    gsap.timeline({scrollTrigger:{id:'memoryTwoPin',trigger:'#s5',start:'top top',end:function(){return '+='+Math.round(innerHeight*3.35)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('#s5 .memory-mark',{color:YELLOW,duration:.28,ease:'none'},.07)
      .to('#s5 .m2',{y:0,duration:.19,ease:'none'},.39)
      .to('#s5 .art',{opacity:1,y:0,duration:.13,ease:'none'},.59)
      .to('#s5 .catbench',{opacity:1,y:0,duration:.13,ease:'none'},.68)
      .to('#s5 .sea',{opacity:1,y:0,duration:.13,ease:'none'},.77)
      .to('#s5 .woods',{opacity:1,y:0,duration:.13,ease:'none'},.86)
      .to({}, {duration:.16});
    gentlePhoto('.art',0);gentlePhoto('.catbench',.22);gentlePhoto('.sea',.4);gentlePhoto('.woods',.58);

    var unique=$('#unique-word');var text=unique.textContent;unique.textContent='';var letters=[];
    Array.from(text).forEach(function(c){var sp=document.createElement('span');sp.className='paint-letter';sp.textContent=c;unique.appendChild(sp);letters.push(sp)});
    gsap.set('#s6 .unique-memory-photo',{opacity:1});
    gsap.timeline({scrollTrigger:{id:'uniquePin',trigger:'#s6',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.55)},pin:true,scrub:1,invalidateOnRefresh:true,onUpdate:function(self){
      var p=clamp((self.progress-.38)/.42,0,1);letters.forEach(function(l,i){var lp=clamp((p*(letters.length+2)-i)/2,0,1);l.style.color=lp>.5?YELLOW:INK});
    }}})
      .to('#s6 .unique-memory-photo',{opacity:0,duration:.28,stagger:.035,ease:'none'},.18)
      .to({}, {duration:.48});

    /* Updated s7: girl -> prince -> both replies change. */
    gsap.set('.g2,.prince,.d71,.d72,.r1a,.r1b,.r2a,.r2b',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'dialogueTwoPin',trigger:'#s7',start:'top top',end:function(){return '+='+Math.round(innerHeight*3.6)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.g2',{opacity:1,duration:.12,ease:'none'},.05)
      .to('.d71,.r1a',{opacity:1,duration:.16,ease:'none'},.15)
      .to('.prince',{opacity:1,duration:.14,ease:'none'},.33)
      .to('.d72,.r2a',{opacity:1,duration:.15,ease:'none'},.43)
      .to('.r1a,.r2a',{opacity:0,duration:.12,ease:'none'},.61)
      .to('.r1b,.r2b',{opacity:1,duration:.18,ease:'none'},.70)
      .to({}, {duration:.18});
    gentleCharacter('.g2',.1);gentleCharacter('.prince',.35);

    makeWordPin('#s8','#s8 .reflection','reflectionPin',2.25);

    /* s9 is now a real video; no extra visual animation. */
    var vid=$('.memory-video');if(vid){vid.muted=true;var play=function(){var p=vid.play();if(p&&p.catch)p.catch(function(){})};addEventListener('load',play,{once:true});}

    gsap.timeline({scrollTrigger:{id:'sciencePin',trigger:'#science-horizontal',start:'top top',end:function(){return '+='+Math.round(innerWidth*2.45)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.science-track',{x:function(){return -2*innerWidth},duration:1,ease:'none'});

    gsap.set('.g3,.question,.d13,.question-prince,.question-prince-dash,.question-prince-copy',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'questionPin',trigger:'#s13',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.8)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.g3',{opacity:1,duration:.14,ease:'none'},.08)
      .to('.d13,.question',{opacity:1,duration:.17,ease:'none'},.28)
      .to('.question-prince',{opacity:1,duration:.14,ease:'none'},.55)
      .to('.question-prince-dash,.question-prince-copy',{opacity:1,duration:.17,ease:'none'},.66)
      .to({}, {duration:.18});
    gentleCharacter('.g3',.25);gentleCharacter('.question-prince',.42);

    makeWordPin('#s14','#s14 .final','finalPin',3.0,function(tl){tl.to('.final-mark',{color:YELLOW,duration:.28,ease:'none'},'>')});

    /* ---------- NEW PART ---------- */

    /* s15: three states on one pinned screen. */
    gsap.set('.possession-prince,.possession-dash-prince,.possession-prince-rep,.garden-state,.possession-girl-state',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'possessionPin',trigger:'#s15',start:'top top',end:function(){return '+='+Math.round(innerHeight*4.35)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.possession-prince',{opacity:1,duration:.12,ease:'none'},.05)
      .to('.possession-dash-prince,.possession-prince-rep',{opacity:1,duration:.17,ease:'none'},.14)
      .to('.possession-prince,.possession-dash-prince,.possession-prince-rep',{opacity:0,duration:.16,ease:'none'},.34)
      .to('.garden-state',{opacity:1,duration:.22,ease:'none'},.43)
      .to('.possession-girl-state',{opacity:1,duration:.22,ease:'none'},.68)
      .to('.garden-state,.possession-girl-state',{opacity:0,duration:.22,ease:'none'},.88)
      .to({}, {duration:.12});
    gentleCharacter('.possession-prince',.1);gentleCharacter('.possession-girl',.3);

    /* s16: photograph comes from right, text softly appears. */
    gsap.set('.worn-photo-card',{x:520,opacity:1});gsap.set('.worn-photo-copy',{opacity:0,y:10});
    gsap.timeline({scrollTrigger:{id:'wornPhotoPin',trigger:'#s16',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.35)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.worn-photo-card',{x:0,duration:.55,ease:'none'},.08)
      .to('.worn-photo-copy',{opacity:1,y:0,duration:.34,ease:'none'},.30)
      .to({}, {duration:.20});
    gentleBox('.worn-photo-card',.35,2);

    /* s17: narration then the three visual anchors. */
    wrapWords($('.rose-care-copy'));var roseWords=$$('.rose-care-copy .reveal-word');gsap.set(roseWords,{opacity:0});gsap.set('.rose-care-girl,.rose-care-rose,.rose-care-prince',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'roseCarePin',trigger:'#s17',start:'top top',end:function(){return '+='+Math.round(innerHeight*3.0)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to(roseWords,{opacity:1,duration:.65,stagger:.025,ease:'none'},.04)
      .to('.rose-care-girl',{opacity:1,duration:.18,ease:'none'},.50)
      .to('.rose-care-rose',{opacity:1,duration:.22,ease:'none'},.62)
      .to('.rose-care-prince',{opacity:1,duration:.18,ease:'none'},.75)
      .to({}, {duration:.18});
    gsap.to('.rose-care-girl',{y:-1.2,duration:4.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
    gsap.to('.rose-care-prince',{y:-1.1,duration:5.1,repeat:-1,yoyo:true,ease:'sine.inOut',delay:.4});
    gsap.to('.rose-care-rose',{y:-1.0,duration:5.4,repeat:-1,yoyo:true,ease:'sine.inOut',delay:.2});

    gsap.timeline({scrollTrigger:{id:'attachmentHorizontalPin',trigger:'#attachment-horizontal',start:'top top',end:function(){return '+='+Math.round(innerWidth*4.5)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.attachment-track',{x:function(){return -4*innerWidth},duration:1,ease:'none'});

    /* s19: two photos enter, then the right one loses colour. */
    gsap.set('.compare-left',{opacity:0,x:-120});gsap.set('.compare-color',{opacity:0,x:120});gsap.set('.compare-bw',{opacity:0,x:0});
    gsap.timeline({scrollTrigger:{id:'comparePin',trigger:'#s19',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.8)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.compare-left',{opacity:1,x:0,duration:.28,ease:'none'},.08)
      .to('.compare-color',{opacity:1,x:0,duration:.28,ease:'none'},.23)
      .to('.compare-color',{opacity:0,duration:.25,ease:'none'},.58)
      .to('.compare-bw',{opacity:1,duration:.25,ease:'none'},.58)
      .to({}, {duration:.18});
    gentleBox('.compare-left',.1,2);gentleBox('.compare-bw',.3,2);

    makeWordPin('#s20','#s20 .restore-copy','restorePin',2.45);

    gsap.set('.garden-intro-girl,.garden-intro-dash,.garden-intro-copy',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'gardenIntroPin',trigger:'#s21',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.1)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.garden-intro-girl',{opacity:1,duration:.15,ease:'none'},.08)
      .to('.garden-intro-dash,.garden-intro-copy',{opacity:1,duration:.20,ease:'none'},.38)
      .to({}, {duration:.18});
    gentleCharacter('.garden-intro-girl',.15);

    makeWordPin('#s22','#s22 .quote-copy','quotePin',4.0);

    gsap.set('.fox-girl,.fox-dash-girl,.fox-girl-copy,.fox-prince,.fox-dash-prince,.fox-prince-copy',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'foxDialoguePin',trigger:'#s23',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.8)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.fox-girl',{opacity:1,duration:.13,ease:'none'},.07)
      .to('.fox-dash-girl,.fox-girl-copy',{opacity:1,duration:.18,ease:'none'},.20)
      .to('.fox-prince',{opacity:1,duration:.14,ease:'none'},.48)
      .to('.fox-dash-prince,.fox-prince-copy',{opacity:1,duration:.19,ease:'none'},.61)
      .to({}, {duration:.18});
    gentleCharacter('.fox-girl',.12);gentleCharacter('.fox-prince',.36);

    /* s24: collage grows from three photos to the full six-photo state. */
    gsap.set('.travel',{opacity:0,y:12,scale:.99});
    gsap.timeline({scrollTrigger:{id:'travelCollagePin',trigger:'#s24',start:'top top',end:function(){return '+='+Math.round(innerHeight*3.55)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.travel.p1',{opacity:1,y:0,scale:1,duration:.17,ease:'none'},.22)
      .to('.travel.p2',{opacity:1,y:0,scale:1,duration:.17,ease:'none'},.34)
      .to('.travel.p3',{opacity:1,y:0,scale:1,duration:.17,ease:'none'},.46)
      .to('.travel.p4',{opacity:1,y:0,scale:1,duration:.17,ease:'none'},.58)
      .to('.travel.p5',{opacity:1,y:0,scale:1,duration:.17,ease:'none'},.70)
      .to('.travel.p6',{opacity:1,y:0,scale:1,duration:.17,ease:'none'},.82)
      .to({}, {duration:.14});
    ['.travel.p1','.travel.p2','.travel.p3','.travel.p4','.travel.p5','.travel.p6'].forEach(function(s,i){gentleBox(s,i*.11,2)});

    /* s25: main idea -> prince -> girl. */
    wrapWords($('.fear-main'));var fearWords=$$('.fear-main .reveal-word');gsap.set(fearWords,{opacity:0});gsap.set('.fear-prince,.fear-dash-prince,.fear-prince-copy,.fear-girl,.fear-dash-girl,.fear-girl-copy',{opacity:0});
    gsap.timeline({scrollTrigger:{id:'fearPin',trigger:'#s25',start:'top top',end:function(){return '+='+Math.round(innerHeight*3.65)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to(fearWords,{opacity:1,duration:.8,stagger:.025,ease:'none'},.03)
      .to('.fear-prince',{opacity:1,duration:.13,ease:'none'},.43)
      .to('.fear-dash-prince,.fear-prince-copy',{opacity:1,duration:.18,ease:'none'},.52)
      .to('.fear-girl',{opacity:1,duration:.13,ease:'none'},.69)
      .to('.fear-dash-girl,.fear-girl-copy',{opacity:1,duration:.18,ease:'none'},.78)
      .to({}, {duration:.16});
    gentleCharacter('.fear-prince',.25);gentleCharacter('.fear-girl',.1);

    makeWordPin('#s26','#s26 .people-copy','peoplePin',2.85);

    /* s27: one person -> fox/prince line -> remembered details -> final yellow phrase. */
    gsap.set('.human-girl,.human-dash,.human-r1,.human-prince,.human-dash-prince,.human-r2,.human-r3,.human-r4,.human-photo',{opacity:0});
    gsap.set('.human-photo',{y:10,scale:.985});
    gsap.timeline({scrollTrigger:{id:'humanPin',trigger:'#s27',start:'top top',end:function(){return '+='+Math.round(innerHeight*5.2)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.human-girl',{opacity:1,duration:.11,ease:'none'},.03)
      .to('.human-dash,.human-r1',{opacity:1,duration:.15,ease:'none'},.11)
      .to('.human-prince',{opacity:1,duration:.12,ease:'none'},.27)
      .to('.human-dash-prince,.human-r2',{opacity:1,duration:.16,ease:'none'},.35)
      .to('.human-prince,.human-dash-prince,.human-r1,.human-r2',{opacity:0,duration:.14,ease:'none'},.50)
      .to('.human-r3',{opacity:1,duration:.18,ease:'none'},.57)
      .to('.human-r3',{opacity:0,duration:.12,ease:'none'},.68)
      .to('.human-r4',{opacity:1,duration:.18,ease:'none'},.72)
      .to('.hp1',{opacity:1,y:0,scale:1,duration:.16,ease:'none'},.81)
      .to('.hp2',{opacity:1,y:0,scale:1,duration:.16,ease:'none'},.87)
      .to('.hp3',{opacity:1,y:0,scale:1,duration:.16,ease:'none'},.93)
      .to({}, {duration:.10});
    gentleCharacter('.human-girl',.12);gentleCharacter('.human-prince',.36);

    makeWordPin('#s28','#s28 .prince-story-copy','princeStoryPin',2.8);

    /* s29: four symbols of the story assemble one after another. */
    gsap.set('.synthesis-girl,.synthesis-photo,.synthesis-rose,.synthesis-prince',{opacity:0,y:10});
    gsap.timeline({scrollTrigger:{id:'synthesisPin',trigger:'#s29',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.8)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.synthesis-girl',{opacity:1,y:0,duration:.16,ease:'none'},.08)
      .to('.synthesis-photo',{opacity:1,y:0,duration:.18,ease:'none'},.29)
      .to('.synthesis-rose',{opacity:1,y:0,duration:.18,ease:'none'},.50)
      .to('.synthesis-prince',{opacity:1,y:0,duration:.16,ease:'none'},.70)
      .to({}, {duration:.18});
    gentleCharacter('.synthesis-girl',.08);gentleBox('.synthesis-photo',.22,2);gentleBox('.synthesis-rose',.35,2);gentleCharacter('.synthesis-prince',.45);

    makeWordPin('#s30','#s30 .rose-unique-copy','roseUniquePin',2.75);

    /* s31: final thesis appears line by line, then gently lives. */
    var thesisLines=$$('.thesis-title span');gsap.set(thesisLines,{opacity:0,y:12});
    gsap.timeline({scrollTrigger:{id:'thesisPin',trigger:'#s31',start:'top top',end:function(){return '+='+Math.round(innerHeight*2.35)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to(thesisLines,{opacity:1,y:0,duration:.45,stagger:.17,ease:'none'},.08)
      .to({}, {duration:.20});
    thesisLines.forEach(function(el,i){gsap.to(el,{x:i%2?.45:-.45,y:i%2?1.4:-1.4,duration:5.6+i*.28,repeat:-1,yoyo:true,ease:'sine.inOut',delay:.9+i*.12})});

    /* s32: finale collage grows in waves, then the conclusion and return arrow. */
    gsap.set('.finale-scene .mini-pol,.finale-main-photo,.finale-girl,.finale-prince,.finale-copy,.to-start,.finale-note',{opacity:0});
    gsap.set('.finale-scene .mini-pol',{scale:.96,y:10});
    gsap.timeline({scrollTrigger:{id:'finalePin',trigger:'#s32',start:'top top',end:function(){return '+='+Math.round(innerHeight*4.2)},pin:true,scrub:1,invalidateOnRefresh:true}})
      .to('.finale-main-photo',{opacity:1,duration:.16,ease:'none'},.05)
      .to('.finale-girl,.finale-prince',{opacity:1,duration:.16,stagger:.08,ease:'none'},.18)
      .to('.finale-left .mini-pol',{opacity:1,scale:1,y:0,duration:.24,stagger:.05,ease:'none'},.34)
      .to('.finale-right .mini-pol',{opacity:1,scale:1,y:0,duration:.24,stagger:.04,ease:'none'},.47)
      .to('.finale-copy',{opacity:1,duration:.18,ease:'none'},.73)
      .to('.to-start,.finale-note',{opacity:1,duration:.16,ease:'none'},.83)
      .to({}, {duration:.16});
    gsap.to('.to-start span',{y:-7,duration:1.7,repeat:-1,yoyo:true,ease:'sine.inOut'});
    $('.to-start').addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});

    initStar();
    ScrollTrigger.refresh();
  }

  function initStar(){
    var star=$('.star');if(!star)return;
    var keys=[];
    function maxScroll(){return Math.max(1,root.scrollHeight-innerHeight)}
    function add(list,s,xPct,yPct,sc){list.push({s:clamp(s,0,maxScroll()),x:xPct/100*innerWidth,y:yPct/100*innerHeight,sc:sc||1})}
    function trigRange(id){var st=ScrollTrigger.getById(id);return st?{start:st.start,end:st.end}:null}
    function centerOf(sel){var el=$(sel);if(!el)return 0;var r=el.getBoundingClientRect();return r.top+scrollY+r.height/2-innerHeight/2}
    function addMid(list,id,x,y,sc){var r=trigRange(id);if(r)add(list,r.start+(r.end-r.start)*.52,x,y,sc||1)}
    function computeKeys(){
      var list=[],r,len;
      function addAt(id,t,x,y,sc){
        r=trigRange(id);
        if(r)add(list,r.start+(r.end-r.start)*t,x,y,sc||1);
      }

      /* A calmer route: the star mostly travels around the free areas and follows the reader section by section. */
      r=trigRange('heroPin');
      if(r){len=r.end-r.start;add(list,0,68,14,1.05);add(list,r.start+len*.40,76,18,1.08);add(list,r.end,82,29,1.02)}
      addAt('introPin',.55,82,54,1.03);
      addAt('dialogueOnePin',.52,78,50,1.00);
      r=trigRange('memoryOnePin');
      if(r){len=r.end-r.start;add(list,r.start+len*.16,78,24,1.02);add(list,r.start+len*.54,71,67,1.00);add(list,r.end,60,74,1.00)}
      r=trigRange('memoryTwoPin');
      if(r){len=r.end-r.start;add(list,r.start+len*.15,49,74,1.00);add(list,r.start+len*.55,30,60,1.04);add(list,r.end,29,34,1.00)}
      r=trigRange('uniquePin');
      if(r){len=r.end-r.start;add(list,r.start+len*.18,30,24,1.02);add(list,r.start+len*.48,46,18,1.05);add(list,r.end,74,23,1.02)}
      addAt('dialogueTwoPin',.52,78,56,1.00);
      addAt('reflectionPin',.58,76,24,1.00);
      add(list,centerOf('#s9'),70,18,1.00);
      r=trigRange('sciencePin');
      if(r){len=r.end-r.start;add(list,r.start+len*.04,68,18,1.00);add(list,r.start+len*.22,44,22,1.00);add(list,r.start+len*.42,20,26,1.00);add(list,r.start+len*.64,22,58,1.04);add(list,r.end,56,64,1.02)}
      addAt('questionPin',.54,72,40,1.00);
      addAt('finalPin',.62,56,68,1.02);

      addAt('possessionPin',.50,74,24,1.00);
      addAt('wornPhotoPin',.56,83,56,1.02);
      addAt('roseCarePin',.52,76,68,1.00);
      r=trigRange('attachmentHorizontalPin');
      if(r){len=r.end-r.start;add(list,r.start+len*.03,69,20,1.00);add(list,r.start+len*.20,42,22,1.00);add(list,r.start+len*.38,18,24,1.00);add(list,r.start+len*.58,18,56,1.02);add(list,r.start+len*.78,42,62,1.02);add(list,r.end,70,58,1.00)}
      addAt('comparePin',.50,81,53,1.03);
      addAt('restorePin',.55,73,24,1.00);
      addAt('gardenIntroPin',.52,74,38,.99);
      addAt('quotePin',.52,84,32,1.00);
      addAt('foxDialoguePin',.54,76,65,1.00);
      addAt('travelCollagePin',.55,52,73,1.03);
      addAt('fearPin',.54,71,26,1.00);
      addAt('peoplePin',.57,78,56,1.00);
      addAt('humanPin',.64,83,30,1.01);
      addAt('princeStoryPin',.56,70,22,1.00);
      addAt('synthesisPin',.58,56,63,1.03);
      addAt('roseUniquePin',.55,76,28,1.00);
      addAt('thesisPin',.56,72,40,1.02);
      r=trigRange('finalePin');
      if(r){len=r.end-r.start;add(list,r.start+len*.15,70,16,1.02);add(list,r.start+len*.65,50,74,1.08);add(list,r.end,50,18,1.03)}

      list.sort(function(a,b){return a.s-b.s});
      keys=list.filter(function(k,i){return i===0||k.s>list[i-1].s+1});
    }
    function cr(p0,p1,p2,p3,t){return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)}
    function target(s){var n=keys.length,i=0;if(!n)return{x:-100,y:-100,sc:1};while(i<n-2&&s>=keys[i+1].s)i++;var a=keys[i],b=keys[Math.min(i+1,n-1)],p0=keys[Math.max(i-1,0)],p3=keys[Math.min(i+2,n-1)];var t=b.s===a.s?0:clamp((s-a.s)/(b.s-a.s),0,1),e=t*t*(3-2*t);return{x:cr(p0.x,a.x,b.x,p3.x,e),y:cr(p0.y,a.y,b.y,p3.y,e),sc:a.sc+(b.sc-a.sc)*e}}
    var sparks=[];for(var i=0;i<9;i++){var d=document.createElement('span');d.className='spark';var sz=14-i*1.2;d.style.width=d.style.height=sz+'px';d.style.opacity=(.75-i*.07).toFixed(2);document.body.appendChild(d);sparks.push({el:d,x:-100,y:-100})}
    var cur={x:innerWidth*.70,y:innerHeight*.11,sc:1.05,rot:-20};sparks.forEach(function(sp){sp.x=cur.x;sp.y=cur.y});gsap.set(sparks.map(function(sp){return sp.el}),{opacity:0});gsap.to(star,{opacity:1,duration:1.6,delay:.35,ease:'power1.out'});gsap.to(sparks.map(function(sp){return sp.el}),{opacity:function(k){return .75-k*.07},duration:1.6,delay:.75});
    var lastS=scrollY;
    gsap.ticker.add(function(){var s=scrollY,tg=target(s),dS=s-lastS;lastS=s;cur.x+=(tg.x-cur.x)*.085;cur.y+=(tg.y-cur.y)*.085;cur.sc+=(tg.sc-cur.sc)*.1;cur.rot+=.35+dS*.12;var t=performance.now()/1000,bx=Math.sin(t*1.3)*7,by=Math.cos(t*1.7)*6,x=cur.x+bx,y=cur.y+by;star.style.transform='translate3d('+x+'px,'+y+'px,0) translate(-50%,-50%) rotate('+cur.rot+'deg) scale('+cur.sc+')';var px=x,py=y;sparks.forEach(function(sp,k){var f=.3-k*.018;sp.x+=(px-sp.x)*f;sp.y+=(py-sp.y)*f;sp.el.style.transform='translate3d('+sp.x+'px,'+sp.y+'px,0) translate(-50%,-50%)';px=sp.x;py=sp.y})});
    ScrollTrigger.addEventListener('refresh',function(){requestAnimationFrame(computeKeys)});addEventListener('resize',function(){clearTimeout(window.__starResize);window.__starResize=setTimeout(function(){fit();ScrollTrigger.refresh();computeKeys()},160)},{passive:true});computeKeys();
  }

  function start(){
    $$('.reveal-words').forEach(wrapWords);
    initAnimations();
  }
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(start)}else{addEventListener('load',start)}
})();
