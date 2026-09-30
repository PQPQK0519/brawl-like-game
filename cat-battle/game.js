const C=document.getElementById("battle"),g=C.getContext("2d"),W=C.width,H=C.height,ground=485;
const U={
 cat:{name:"ねこ",cost:50,hp:100,atk:20,spd:43,range:55,rate:.65,size:22,emoji:"🐱",rarity:"N"},
 shield:{name:"かべねこ",cost:75,hp:360,atk:8,spd:17,range:42,rate:1,size:27,emoji:"🛡️",rarity:"N"},
 spear:{name:"やりねこ",cost:125,hp:155,atk:52,spd:35,range:90,rate:1.05,size:23,emoji:"⚔️",rarity:"R"},
 mage:{name:"魔法ねこ",cost:200,hp:120,atk:75,spd:25,range:150,rate:1.4,size:23,emoji:"✨",rarity:"R"},
 ninja:{name:"忍びねこ",cost:175,hp:190,atk:62,spd:65,range:70,rate:.7,size:24,emoji:"🥷",rarity:"SR"},
 dragon:{name:"竜ねこ",cost:350,hp:520,atk:135,spd:22,range:125,rate:1.8,size:31,emoji:"🐲",rarity:"SSR"}
};
const keys=Object.keys(U);
const defaultOwned={cat:1,shield:1,spear:1,mage:1,ninja:0,dragon:0};
let save=JSON.parse(localStorage.getItem("catBattleSave")||"null")||{gems:300,levels:{...defaultOwned},xp:0};
save.levels={...defaultOwned,...save.levels}; let gems=save.gems,xp=save.xp;
let money=150,time=0,spawn=0,units=[],foes=[],sparks=[],paused=false,over=false;
function persist(){save={gems,levels:save.levels,xp};localStorage.setItem("catBattleSave",JSON.stringify(save))}
function toast(s){document.getElementById("toast").textContent=s}
function level(k){return save.levels[k]||0}
function ui(){
 document.getElementById("money").textContent=Math.floor(money);document.getElementById("xp").textContent=xp;document.getElementById("gems").textContent=gems;
 document.querySelectorAll(".deck button[data-u]").forEach(b=>{let k=b.dataset.u;b.disabled=over||paused||!level(k)||money<U[k].cost;b.querySelector("small").textContent=level(k)?U[k].cost+" / Lv."+level(k):"🔒 ガチャ"});
 renderCollection()
}
function renderCollection(){
 const el=document.getElementById("collectionList");if(!el)return;
 el.innerHTML='<div class="collectionGrid">'+keys.map(k=>{let q=U[k],lv=level(k);return '<div class="owned"><span class="face">'+q.emoji+'</span><div><b>'+q.name+'</b><small>'+(lv?'Lv.'+lv+' ・ '+q.rarity:'未解放 🔒')+'</small></div></div>'}).join("")+'</div>'
}
function shoot(x,y,color="#ffe36a"){for(let i=0;i<8;i++)sparks.push({x,y,vx:(Math.random()-.5)*150,vy:-Math.random()*130,life:.45,color})}
function spawnFoe(){let n=Math.random(),boss=time>75&&Math.random()<.08;foes.push({x:1070,y:ground,hp:boss?700:n<.22?280:120,max:boss?700:n<.22?280:120,atk:boss?42:n<.22?25:14,spd:boss?11:n<.22?19:30,range:boss?55:42,rate:boss?1.1:1,size:boss?35:n<.22?27:21,emoji:boss?"👹":n<.22?"👾":"👿",boss})}
function add(k){let q=U[k],lv=level(k);if(over||paused||!lv||money<q.cost)return;money-=q.cost;let mult=1+(lv-1)*.08;units.push({x:150,y:ground,hp:q.hp*mult,max:q.hp*mult,atk:q.atk*mult,spd:q.spd,range:q.range,rate:q.rate,cd:0,size:q.size,emoji:q.emoji});shoot(150,ground-25,"#fff");ui()}
function update(dt){
 if(paused||over)return;time+=dt;money=Math.min(600,money+dt*13);spawn+=dt;let gap=Math.max(.7,2.15-time*.006);if(spawn>gap){spawn=0;spawnFoe()}
 for(const u of units){u.cd-=dt;let f=foes.find(e=>e.x>u.x-3&&e.x<u.x+u.range);if(f){if(u.cd<=0){f.hp-=u.atk;u.cd=u.rate;shoot(f.x,f.y,"#ffd75a")}}else u.x+=u.spd*dt}
 for(const f of foes){f.cd=(f.cd||0)-dt;let u=units.find(a=>Math.abs(a.x-f.x)<a.size+f.size+5);if(u){if(f.cd<=0){u.hp-=f.atk;f.cd=f.rate;shoot(u.x,u.y,"#ff625c")}}else f.x-=f.spd*dt;if(f.x<85){over=true;toast("城が破壊された！ ↻ で再挑戦")}}
 units=units.filter(u=>u.hp>0);for(const f of foes)if(f.hp<=0){xp+=f.boss?100:10;shoot(f.x,f.y,"#8cff9a")}
 foes=foes.filter(f=>f.hp>0&&f.x>50);if(time>=90&&foes.length===0){over=true;gems+=50;toast("🏆 勝利！ +50ネコ缶");persist()}
 sparks.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=220*dt;p.life-=dt});sparks=sparks.filter(p=>p.life>0);ui()
}
function hpbar(o,col){g.fillStyle="#142036aa";g.fillRect(o.x-o.size,o.y-53,o.size*2,6);g.fillStyle=col;g.fillRect(o.x-o.size,o.y-53,o.size*2*Math.max(0,o.hp/o.max),6)}
function castle(x,enemy){g.fillStyle=enemy?"#795349":"#e4e8ed";g.fillRect(x,ground-145,90,145);g.fillRect(x+20,ground-185,50,42);g.fillStyle="#fff";g.font="28px serif";g.fillText(enemy?"👾":"🐱",x+29,ground-148)}
function draw(){let sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#8fd8f4");sky.addColorStop(1,"#eff0bf");g.fillStyle=sky;g.fillRect(0,0,W,H);g.fillStyle="#76a753";g.fillRect(0,ground,W,H-ground);g.fillStyle="#5f9148";for(let i=0;i<W;i+=72)g.fillRect(i,ground+25,38,6);castle(30,false);castle(1080,true);units.forEach(u=>{g.textAlign="center";g.font=(u.size+15)+"px serif";g.fillText(u.emoji,u.x,u.y-8);hpbar(u,"#49d287")});foes.forEach(f=>{g.textAlign="center";g.font=(f.size+17)+"px serif";g.fillText(f.emoji,f.x,f.y-8);hpbar(f,"#ff625c")});sparks.forEach(p=>{g.globalAlpha=Math.max(0,p.life/.45);g.fillStyle=p.color;g.beginPath();g.arc(p.x,p.y,4,0,Math.PI*2);g.fill();g.globalAlpha=1});g.textAlign="left";g.fillStyle="#1a2944aa";g.fillRect(25,25,240,14);g.fillStyle="#55cbff";g.fillRect(25,25,240*Math.min(1,time/90),14);g.fillStyle="#1b2a43";g.font="bold 13px system-ui";g.fillText("ステージ進行",30,57)}
function loop(ts){if(!loop.last)loop.last=ts;let dt=Math.min(.04,(ts-loop.last)/1000);loop.last=ts;update(dt);draw();requestAnimationFrame(loop)}
function pullOne(){
 if(gems<100){toast("ネコ缶が足りない！");return null}gems-=100;let r=Math.random(),k=r<.02?"dragon":r<.12?"ninja":r<.42?"mage":r<.72?"spear":r<.87?"shield":"cat";let was=level(k);save.levels[k]=was+1;let msg=(was?"⬆️ "+U[k].name+" が Lv."+save.levels[k]+" に！":"🎉 "+U[k].rarity+" "+U[k].name+" を解放！");document.getElementById("gachaResult").textContent=msg;persist();ui();return k
}
function pullTen(){if(gems<900){toast("10連には900ネコ缶必要！");return}gems-=900;let counts={};for(let i=0;i<10;i++){let r=Math.random(),k=r<.02?"dragon":r<.12?"ninja":r<.42?"mage":r<.72?"spear":r<.87?"shield":"cat";save.levels[k]=(save.levels[k]||0)+1;counts[k]=(counts[k]||0)+1}let names=Object.keys(counts).map(k=>U[k].emoji+U[k].name+(counts[k]>1?" ×"+counts[k]:"")).join("  ");document.getElementById("gachaResult").textContent="🎉 10連結果： "+names;persist();ui()}
document.querySelectorAll(".deck button[data-u]").forEach(b=>b.onclick=()=>add(b.dataset.u));
document.onkeydown=e=>{if(e.key>="1"&&+e.key<=keys.length)add(keys[+e.key-1]);if(e.key===" ")paused=!paused;ui()};
document.getElementById("pause").onclick=()=>{paused=!paused;toast(paused?"一時停止中":"戦闘再開！");ui()};
document.getElementById("reset").onclick=()=>{money=150;time=0;spawn=0;units=[];foes=[];sparks=[];paused=false;over=false;toast("ユニットを出撃させよう！");ui()};
document.getElementById("gachaOpen").onclick=()=>{document.getElementById("gachaModal").classList.remove("hidden");renderCollection()};
document.getElementById("gachaClose").onclick=()=>document.getElementById("gachaModal").classList.add("hidden");
document.getElementById("pull1").onclick=pullOne;document.getElementById("pull10").onclick=pullTen;
document.getElementById("gachaModal").addEventListener("click",e=>{if(e.target.id==="gachaModal")e.currentTarget.classList.add("hidden")});
ui();requestAnimationFrame(loop);