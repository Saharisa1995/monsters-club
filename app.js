(function(){
"use strict";

var sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
var TOTAL_WINDOW_DAYS = window.TOTAL_WINDOW_DAYS || 75;

var PERSON_COLORS = ["#4C8DF6","#3FB97B","#E8A23B","#E5594B","#9678EB","#EC6FA0","#36B3AE","#7C7C82","#D4A24C","#5BA8E0"];
var HABIT_COLORS = [
  {bg:"#4C8DF6", soft:"#EAF1FE"},{bg:"#3FB97B", soft:"#E6F7EE"},{bg:"#E8A23B", soft:"#FBF2E2"},
  {bg:"#E5594B", soft:"#FCEAE8"},{bg:"#9678EB", soft:"#F1ECFC"},{bg:"#EC6FA0", soft:"#FCEAF1"},
  {bg:"#36B3AE", soft:"#E5F6F5"},{bg:"#7C7C82", soft:"#EFEFEE"}
];
var HABIT_ICONS = ["ti-droplet","ti-run","ti-book","ti-moon","ti-yoga","ti-apple","ti-pencil","ti-meditation","ti-barbell","ti-music","ti-sun","ti-brain","ti-bike","ti-coffee-off","ti-language","ti-heart","ti-leaf","ti-bath","ti-bulb","ti-target"];

// in-memory cache, hydrated from Supabase
var cache = { session:null, me:null, people:[], habitsByOwner:{}, logsByHabit:{} };
var currentTab = "today";
var lbMode = "daily";

function todayISO(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function isoFromDate(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function last7Days(){ var arr=[]; for(var i=6;i>=0;i--){ var d=new Date(); d.setDate(d.getDate()-i); arr.push(d);} return arr; }
function lastNDays(n){ var arr=[]; for(var i=n-1;i>=0;i--){ var d=new Date(); d.setDate(d.getDate()-i); arr.push(d);} return arr; }
function dayLetter(d){ return ["S","M","T","W","T","F","S"][d.getDay()]; }
function initials(name){ var parts=name.trim().split(/\s+/); if(parts.length===1) return parts[0].slice(0,2).toUpperCase(); return (parts[0][0]+parts[1][0]).toUpperCase(); }
function escapeHtml(str){ var d=document.createElement("div"); d.textContent=str; return d.innerHTML; }
function escapeAttr(str){ return String(str).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

var toastTimer;
function showToast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 2200);
}

// ---------- Data layer (Supabase) ----------

function habitsFor(personId){ return cache.habitsByOwner[personId] || []; }
function logsFor(habitId){ return cache.logsByHabit[habitId] || {}; }

async function fetchAll(){
  var profilesRes = await sb.from("profiles").select("*").order("created_at", {ascending:true});
  if(profilesRes.error) throw profilesRes.error;
  cache.people = profilesRes.data || [];

  var habitsRes = await sb.from("habits").select("*").order("created_at", {ascending:true});
  if(habitsRes.error) throw habitsRes.error;
  cache.habitsByOwner = {};
  (habitsRes.data || []).forEach(function(h){
    if(!cache.habitsByOwner[h.owner_id]) cache.habitsByOwner[h.owner_id] = [];
    cache.habitsByOwner[h.owner_id].push(h);
  });

  var logsRes = await sb.from("habit_logs").select("habit_id, log_date");
  if(logsRes.error) throw logsRes.error;
  cache.logsByHabit = {};
  (logsRes.data || []).forEach(function(l){
    if(!cache.logsByHabit[l.habit_id]) cache.logsByHabit[l.habit_id] = {};
    cache.logsByHabit[l.habit_id][l.log_date] = true;
  });

  cache.me = cache.people.find(function(p){ return p.id === cache.session.user.id; }) || null;
}

function streakFor(habit){
  var log = logsFor(habit.id);
  var streak = 0;
  var iso = todayISO();
  var cursor = new Date();
  if(!log[iso]) cursor.setDate(cursor.getDate()-1);
  while(true){
    var ci = isoFromDate(cursor);
    if(log[ci]){ streak++; cursor.setDate(cursor.getDate()-1); } else break;
  }
  return streak;
}

function completionPctForPerson(person, dateISO){
  var habits = habitsFor(person.id);
  if(habits.length===0) return 0;
  var done = habits.filter(function(h){ return !!logsFor(h.id)[dateISO]; }).length;
  return Math.round((done/habits.length)*100);
}

function scoreForPersonOverDays(person, days){
  var habits = habitsFor(person.id);
  var total=0, possible=0;
  days.forEach(function(d){
    var iso = isoFromDate(d);
    habits.forEach(function(h){
      if(new Date(h.created_at) <= d){
        possible++;
        if(logsFor(h.id)[iso]) total++;
      }
    });
  });
  if(possible===0) return 0;
  return Math.round((total/possible)*100);
}
function weeklyScoreForPerson(p){ return scoreForPersonOverDays(p, last7Days()); }
function totalScoreForPerson(p){ return scoreForPersonOverDays(p, lastNDays(TOTAL_WINDOW_DAYS)); }
function totalCompletionsForPerson(p){
  var total=0;
  habitsFor(p.id).forEach(function(h){ total += Object.keys(logsFor(h.id)).length; });
  return total;
}

// ---------- Auth ----------

async function refreshSession(){
  var res = await sb.auth.getSession();
  cache.session = res.data.session;
}

async function boot(){
  await refreshSession();
  if(!cache.session){
    renderAuthScreen();
    return;
  }
  try{
    await fetchAll();
  }catch(e){
    renderAuthScreen("Couldn't load data: " + (e.message||"check your connection."));
    return;
  }
  if(!cache.me){
    renderCreateProfileScreen();
    return;
  }
  render();
}

sb.auth.onAuthStateChange(function(event, session){
  cache.session = session;
  if(event === "SIGNED_OUT"){
    cache.me = null;
    currentTab = "today";
    renderAuthScreen();
  }
});

// ---------- Auth screen ----------

var authMode = "signin"; // signin | signup

function renderAuthScreen(errorMsg){
  var root = document.getElementById("root");
  var html = '<div class="login-screen">';
  html += '<div class="login-logo"><div class="badge"><i class="ti ti-paw"></i></div><div class="login-title">Monsters\u2019 Club</div><div class="login-sub">Sign in to track your habits</div></div>';
  html += '<div class="auth-card">';
  html += '<div class="auth-tabs"><button class="auth-tab'+(authMode==="signin"?" active":"")+'" id="tabSignin">Sign in</button><button class="auth-tab'+(authMode==="signup"?" active":"")+'" id="tabSignup">Create account</button></div>';
  html += '<div class="auth-error'+(errorMsg?" show":"")+'" id="authError">'+(errorMsg?escapeHtml(errorMsg):"")+'</div>';
  html += '<input type="email" id="authEmail" placeholder="you@example.com" autocomplete="email">';
  html += '<input type="password" id="authPassword" placeholder="Password (min 6 characters)" autocomplete="'+(authMode==="signin"?"current-password":"new-password")+'">';
  html += '<button class="btn btn-primary" id="authSubmit" style="width:100%;margin-top:6px;">'+(authMode==="signin"?"Sign in":"Create account")+'</button>';
  html += '</div></div>';
  root.innerHTML = html;

  document.getElementById("tabSignin").addEventListener("click", function(){ authMode="signin"; renderAuthScreen(); });
  document.getElementById("tabSignup").addEventListener("click", function(){ authMode="signup"; renderAuthScreen(); });
  document.getElementById("authSubmit").addEventListener("click", submitAuth);
  document.getElementById("authPassword").addEventListener("keydown", function(e){ if(e.key==="Enter") submitAuth(); });
}

async function submitAuth(){
  var email = document.getElementById("authEmail").value.trim();
  var password = document.getElementById("authPassword").value;
  var btn = document.getElementById("authSubmit");
  var errEl = document.getElementById("authError");
  errEl.classList.remove("show");

  if(!email || !password){
    errEl.textContent = "Enter an email and password.";
    errEl.classList.add("show");
    return;
  }
  btn.disabled = true;
  btn.textContent = authMode==="signin" ? "Signing in\u2026" : "Creating account\u2026";

  try{
    if(authMode==="signin"){
      var res = await sb.auth.signInWithPassword({ email:email, password:password });
      if(res.error) throw res.error;
    } else {
      var res2 = await sb.auth.signUp({ email:email, password:password });
      if(res2.error) throw res2.error;
      if(res2.data.user && !res2.data.session){
        showToast("Check your email to confirm your account");
      }
    }
    await boot();
  }catch(e){
    errEl.textContent = e.message || "Something went wrong.";
    errEl.classList.add("show");
    btn.disabled = false;
    btn.textContent = authMode==="signin" ? "Sign in" : "Create account";
  }
}

function renderCreateProfileScreen(){
  var root = document.getElementById("root");
  var firstEver = cache.people.length === 0;
  var colorIdx = Math.floor(Math.random()*PERSON_COLORS.length);
  var html = '<div class="login-screen">';
  html += '<div class="login-logo"><div class="badge"><i class="ti ti-paw"></i></div><div class="login-title">Almost there</div><div class="login-sub">Set up your profile</div></div>';
  html += '<div class="auth-card">';
  html += '<div class="field-label">Your name</div>';
  html += '<input type="text" id="profileName" placeholder="e.g. Jamie Lee" maxlength="30">';
  html += '<div class="field-label">Color</div>';
  html += '<div class="person-color-row" id="personColorRow" style="margin-bottom:8px;"></div>';
  if(firstEver){
    html += '<div class="field-hint"><i class="ti ti-shield-check" style="font-size:13px;vertical-align:-2px"></i> You\u2019re the first member, so you\u2019ll automatically be made an admin.</div>';
  }
  html += '<button class="btn btn-primary" id="createProfileBtn" style="width:100%;margin-top:14px;">Continue</button>';
  html += '</div></div>';
  root.innerHTML = html;

  var row = document.getElementById("personColorRow");
  PERSON_COLORS.forEach(function(c,i){
    var sw = document.createElement("button");
    sw.className = "swatch" + (i===colorIdx?" selected":"");
    sw.style.background = c;
    sw.addEventListener("click", function(){
      row.querySelectorAll(".swatch").forEach(function(s){s.classList.remove("selected");});
      sw.classList.add("selected"); colorIdx = i;
    });
    row.appendChild(sw);
  });

  document.getElementById("createProfileBtn").addEventListener("click", async function(){
    var name = document.getElementById("profileName").value.trim();
    if(!name){ showToast("Enter a name"); return; }
    var btn = document.getElementById("createProfileBtn");
    btn.disabled = true; btn.textContent = "Setting up\u2026";
    try{
      var ins = await sb.from("profiles").insert({
        id: cache.session.user.id,
        name: name,
        color: PERSON_COLORS[colorIdx],
        is_admin: firstEver
      });
      if(ins.error) throw ins.error;
      await fetchAll();
      currentTab = "today";
      render();
      showToast(firstEver ? "Welcome \u2014 you\u2019re the first admin" : "Profile created");
    }catch(e){
      showToast(e.message || "Couldn't create profile");
      btn.disabled = false; btn.textContent = "Continue";
    }
  });
}

// ---------- Main app shell ----------

function appShellHtml(){
  return ''+
  '<div class="app" id="app">'+
    '<div class="header">'+
      '<div class="header-top">'+
        '<div><div class="greeting" id="greetingText">Monsters\u2019 Club</div><div class="date-sub" id="dateSub"></div></div>'+
        '<div class="header-actions">'+
          '<button class="icon-btn logout-btn" id="logoutBtn" aria-label="Log out" title="Log out"><i class="ti ti-logout-2" style="font-size:16px;line-height:1"></i><span>Log out</span></button>'+
        '</div>'+
      '</div>'+
      '<div class="me-strip" id="meStrip"></div>'+
    '</div>'+
    '<div id="mainContent"></div>'+
    '<div class="bottom-nav">'+
      '<button class="nav-btn active" data-tab="today" id="navToday"><i class="ti ti-checklist"></i><span>Today</span></button>'+
      '<button class="nav-btn" data-tab="leaderboard" id="navLeaderboard"><i class="ti ti-trophy"></i><span>Leaderboard</span></button>'+
      '<button class="nav-btn" data-tab="people" id="navPeople"><i class="ti ti-users"></i><span>People</span></button>'+
    '</div>'+
  '</div>';
}

function render(){
  var root = document.getElementById("root");
  root.innerHTML = appShellHtml();
  renderHeader();
  if(currentTab==="today") renderToday();
  else if(currentTab==="leaderboard") renderLeaderboard();
  else if(currentTab==="people") renderPeople();
  wireNav();
  updateNav();
}

function wireNav(){
  document.getElementById("navToday").addEventListener("click", function(){ currentTab="today"; render(); });
  document.getElementById("navLeaderboard").addEventListener("click", function(){ currentTab="leaderboard"; render(); });
  document.getElementById("navPeople").addEventListener("click", function(){ currentTab="people"; render(); });
  document.getElementById("logoutBtn").addEventListener("click", async function(e){
    e.preventDefault(); e.stopPropagation();
    await sb.auth.signOut();
    cache.me = null; cache.people=[]; cache.habitsByOwner={}; cache.logsByHabit={};
    currentTab="today"; lbMode="daily";
    renderAuthScreen();
  });
}

function updateNav(){
  document.querySelectorAll(".nav-btn").forEach(function(b){ b.classList.toggle("active", b.dataset.tab===currentTab); });
}

function renderHeader(){
  var me = cache.me;
  var hour = new Date().getHours();
  var greet = hour<12 ? "Good morning" : hour<18 ? "Good afternoon" : "Good evening";
  var titleEl = document.getElementById("greetingText");
  var subEl = document.getElementById("dateSub");
  if(currentTab==="today") titleEl.textContent = greet + (me.name ? ", " + me.name.split(" ")[0] : "");
  else if(currentTab==="leaderboard") titleEl.textContent = "Leaderboard";
  else titleEl.textContent = "Monsters\u2019 Club";
  subEl.textContent = new Date().toLocaleDateString(undefined, {weekday:"long", month:"long", day:"numeric"});

  var meStrip = document.getElementById("meStrip");
  meStrip.innerHTML = '<div class="avatar" style="background:'+me.color+'">'+initials(me.name)+'</div>'+
    '<div class="me-strip-info"><div class="me-strip-name">'+escapeHtml(me.name)+'</div><div class="me-strip-role">'+(me.is_admin?"Admin":"Member")+'</div></div>';
}

function ringSVG(pct, color){
  var r=31, c=2*Math.PI*r, offset = c-(pct/100)*c;
  return '<div class="ring-wrap"><svg width="74" height="74" viewBox="0 0 74 74">'+
    '<circle cx="37" cy="37" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="7"/>'+
    '<circle cx="37" cy="37" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+offset+'" style="transition:stroke-dashoffset .4s ease"/>'+
    '</svg><div class="ring-label">'+pct+'%</div></div>';
}

function renderToday(){
  var main = document.getElementById("mainContent");
  var p = cache.me;
  var iso = todayISO();
  var habits = habitsFor(p.id);
  var pct = completionPctForPerson(p, iso);
  var doneCount = habits.filter(function(h){return !!logsFor(h.id)[iso];}).length;

  var html = '';
  html += '<div class="summary-card">'+ringSVG(pct,p.color)+
    '<div class="summary-text"><div class="summary-title">Your day</div>'+
    '<div class="summary-sub">'+doneCount+' of '+habits.length+' habits done today</div>'+
    '<div class="summary-stats">'+
      '<div class="stat"><div class="stat-num">'+weeklyScoreForPerson(p)+'%</div><div class="stat-label">7-day score</div></div>'+
      '<div class="stat"><div class="stat-num">'+totalScoreForPerson(p)+'%</div><div class="stat-label">'+TOTAL_WINDOW_DAYS+'-day score</div></div>'+
    '</div></div></div>';

  html += '<div class="section-row"><div class="section-title">Today\u2019s habits</div><button class="section-action" id="addHabitBtn"><i class="ti ti-plus" style="font-size:15px"></i>Add</button></div>';

  if(habits.length===0){
    html += '<div class="empty-state"><i class="ti ti-list-check"></i><div class="empty-state-title">No habits yet</div><div class="empty-state-sub">Tap Add to create your first habit.</div></div>';
  } else {
    html += '<div class="habit-list" id="habitList">';
    var days = last7Days();
    habits.forEach(function(h){
      var col = HABIT_COLORS[h.color_idx % HABIT_COLORS.length];
      var log = logsFor(h.id);
      var doneToday = !!log[iso];
      var streak = streakFor(h);
      html += '<div class="habit-row-wrap" data-habit-id="'+h.id+'"><div class="habit-card">';
      html += '<div class="habit-color-dot" style="background:'+col.soft+'; color:'+col.bg+'"><i class="ti '+h.icon+'"></i></div>';
      html += '<div class="habit-info"><div class="habit-name">'+escapeHtml(h.name)+'</div>';
      html += '<div class="habit-streak"><i class="ti ti-flame" style="font-size:13px;color:'+(streak>0?"#E8A23B":"var(--ink-faint)")+'"></i>'+streak+' day streak</div>';
      html += '<div class="week-dots">';
      days.forEach(function(d){
        var di = isoFromDate(d), isToday = di===iso, done = !!log[di];
        html += '<button class="day-dot'+(done?" done":"")+(isToday?" today":"")+'" style="'+(done?"background:"+col.bg:"")+'" data-day="'+di+'" data-habit="'+h.id+'">'+(done?'<i class="ti ti-check" style="font-size:11px"></i>':dayLetter(d))+'</button>';
      });
      html += '</div></div>';
      html += '<button class="check-btn'+(doneToday?" done":"")+'" data-habit="'+h.id+'" data-day="'+iso+'" aria-label="Mark done today"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>';
      html += '</div></div>';
    });
    html += '</div>';
  }
  main.innerHTML = html;

  document.getElementById("addHabitBtn") && document.getElementById("addHabitBtn").addEventListener("click", function(){ openHabitSheet(null); });
  main.querySelectorAll(".check-btn").forEach(function(btn){ btn.addEventListener("click", function(){ toggleLog(btn, btn.dataset.habit, btn.dataset.day); }); });
  main.querySelectorAll(".day-dot").forEach(function(btn){ btn.addEventListener("click", function(){ toggleLog(btn, btn.dataset.habit, btn.dataset.day); }); });
  main.querySelectorAll(".habit-card").forEach(function(card){
    var wrap = card.parentElement;
    var habitId = wrap.dataset.habitId;
    var holdTimer;
    card.addEventListener("pointerdown", function(){
      holdTimer = setTimeout(function(){
        var h = habitsFor(p.id).find(function(x){return x.id===habitId;});
        openHabitSheet(h);
      }, 480);
    });
    ["pointerup","pointerleave","pointercancel"].forEach(function(ev){ card.addEventListener(ev, function(){ clearTimeout(holdTimer); }); });
  });
}

async function toggleLog(btnEl, habitId, dayISO){
  var p = cache.me;
  var h = habitsFor(p.id).find(function(x){return x.id===habitId;});
  if(!h) return;
  if(btnEl) btnEl.classList.add("loading");
  var log = logsFor(habitId);
  var isDone = !!log[dayISO];
  try{
    if(isDone){
      var del = await sb.from("habit_logs").delete().eq("habit_id", habitId).eq("log_date", dayISO);
      if(del.error) throw del.error;
      delete log[dayISO];
    } else {
      var ins = await sb.from("habit_logs").insert({ habit_id: habitId, owner_id: p.id, log_date: dayISO });
      if(ins.error) throw ins.error;
      log[dayISO] = true;
      showToast((dayISO===todayISO()?"Marked done":"Updated") + " \u2014 " + h.name);
    }
    cache.logsByHabit[habitId] = log;
    render();
  }catch(e){
    showToast(e.message || "Couldn't save \u2014 try again");
    if(btnEl) btnEl.classList.remove("loading");
  }
}

function renderLeaderboard(){
  var main = document.getElementById("mainContent");
  var me = cache.me;
  if(cache.people.length===0){
    main.innerHTML = '<div class="empty-state"><i class="ti ti-trophy"></i><div class="empty-state-title">No one to rank yet</div></div>';
    return;
  }
  var html = '<div class="lb-toggle">'+
    '<button class="lb-toggle-btn'+(lbMode==="daily"?" active":"")+'" data-mode="daily">Daily</button>'+
    '<button class="lb-toggle-btn'+(lbMode==="total"?" active":"")+'" data-mode="total">'+TOTAL_WINDOW_DAYS+'-day total</button>'+
  '</div>';

  var ranked, subLabel;
  if(lbMode==="daily"){
    var iso = todayISO();
    ranked = cache.people.map(function(p){
      return { p:p, score: completionPctForPerson(p, iso), checks: habitsFor(p.id).filter(function(h){return !!logsFor(h.id)[iso];}).length };
    });
    subLabel = "Today\u2019s completion rate";
  } else {
    ranked = cache.people.map(function(p){ return { p:p, score: totalScoreForPerson(p), checks: totalCompletionsForPerson(p) }; });
    subLabel = "Completion rate over the last "+TOTAL_WINDOW_DAYS+" days";
  }
  ranked.sort(function(a,b){ if(b.score!==a.score) return b.score-a.score; return b.checks-a.checks; });

  html += '<div class="lb-sub-label">'+subLabel+'</div><div class="leaderboard">';
  ranked.forEach(function(r,i){
    var rank=i+1, isMe = r.p.id===me.id;
    html += '<div class="lb-row'+(isMe?" me":"")+'">';
    html += '<div class="lb-rank'+(rank===1?" top1":"")+'">'+(rank===1?'<i class="ti ti-crown" style="font-size:16px"></i>':rank)+'</div>';
    html += '<div class="lb-avatar" style="background:'+r.p.color+'">'+initials(r.p.name)+'</div>';
    html += '<div class="lb-name">'+escapeHtml(r.p.name)+(isMe?" (you)":"")+'</div>';
    html += '<div class="lb-bar-track"><div class="lb-bar-fill" style="width:'+r.score+'%; background:'+r.p.color+'"></div></div>';
    html += '<div class="lb-score">'+r.score+'%</div></div>';
  });
  html += '</div>';
  main.innerHTML = html;

  main.querySelectorAll(".lb-toggle-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ lbMode = btn.dataset.mode; renderLeaderboard(); });
  });
}

function renderPeople(){
  var main = document.getElementById("mainContent");
  var me = cache.me;
  var html = '<div class="section-row"><div class="section-title">Members ('+cache.people.length+')</div>';
  if(me.is_admin) html += '<button class="section-action" id="addPersonBtn2"><i class="ti ti-plus" style="font-size:15px"></i>Add</button>';
  html += '</div>';
  if(!me.is_admin) html += '<div class="lb-sub-label" style="padding:0 20px 14px;">Only admins can add or remove members. Want a change? Ask an admin.</div>';

  if(cache.people.length===0){
    html += '<div class="empty-state"><i class="ti ti-users"></i><div class="empty-state-title">No members yet</div></div>';
  } else {
    html += '<div class="habit-list">';
    cache.people.forEach(function(p){
      html += '<div class="habit-card"><div class="avatar" style="width:44px;height:44px;background:'+p.color+'">'+initials(p.name)+'</div>';
      html += '<div class="habit-info"><div class="habit-name">'+escapeHtml(p.name)+(p.id===me.id?" (you)":"")+(p.is_admin?' <span style="font-size:10px;font-weight:700;color:#7A5212;background:var(--amber-soft);padding:2px 6px;border-radius:6px;margin-left:4px;">ADMIN</span>':"")+'</div>';
      html += '<div class="habit-streak">'+habitsFor(p.id).length+' habit'+(habitsFor(p.id).length===1?"":"s")+' \u00b7 '+weeklyScoreForPerson(p)+'% this week</div></div>';
      if(me.is_admin && p.id!==me.id){
        html += '<button class="icon-btn" data-remove-person="'+p.id+'" aria-label="Remove member" style="box-shadow:none;background:var(--red-soft);color:var(--red)"><i class="ti ti-trash" style="font-size:15px"></i></button>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  main.innerHTML = html;

  document.getElementById("addPersonBtn2") && document.getElementById("addPersonBtn2").addEventListener("click", openAddPersonSheet);
  main.querySelectorAll("[data-remove-person]").forEach(function(btn){
    btn.addEventListener("click", async function(e){
      e.stopPropagation();
      var target = cache.people.find(function(x){return x.id===btn.dataset.removePerson;});
      if(!confirm("Remove "+target.name+" and all their habit data? This can\u2019t be undone.")) return;
      try{
        var del = await sb.from("profiles").delete().eq("id", target.id);
        if(del.error) throw del.error;
        await fetchAll();
        render();
        showToast("Removed " + target.name);
      }catch(e2){ showToast(e2.message || "Couldn't remove member"); }
    });
  });
}

// ---------- Sheets ----------

var overlay = document.getElementById("overlay");
var sheetEl = document.getElementById("sheet");
function openSheet(html){ sheetEl.innerHTML = '<div class="sheet-handle"></div>'+html; overlay.classList.add("show"); }
function closeSheet(){ overlay.classList.remove("show"); }
overlay.addEventListener("click", function(e){ if(e.target===overlay) closeSheet(); });

function openAddPersonSheet(){
  showToast("Admins add members by sharing the app link \u2014 each person signs up and creates their own profile.");
}

function openHabitSheet(existingHabit){
  var isEdit = !!existingHabit;
  var nameVal = isEdit ? existingHabit.name : "";
  var iconIdx = isEdit ? HABIT_ICONS.indexOf(existingHabit.icon) : 0;
  if(iconIdx<0) iconIdx=0;
  var colorIdx = isEdit ? existingHabit.color_idx : Math.floor(Math.random()*HABIT_COLORS.length);
  var freq = isEdit ? existingHabit.freq : "daily";

  var html = '<div class="sheet-title">'+(isEdit?"Edit habit":"New habit")+'</div>';
  html += '<div class="field-label">Name</div><input type="text" id="habitNameInput" placeholder="e.g. Drink water" value="'+escapeAttr(nameVal)+'" maxlength="40">';
  html += '<div class="field-label">Icon</div><div class="icon-row" id="iconRow"></div>';
  html += '<div class="field-label">Color</div><div class="swatch-row" id="colorRow"></div>';
  html += '<div class="field-label">Frequency</div><div class="freq-row" id="freqRow">'+
    '<button class="freq-opt" data-val="daily">Daily</button>'+
    '<button class="freq-opt" data-val="weekdays">Weekdays</button>'+
    '<button class="freq-opt" data-val="weekly">Weekly</button></div>';
  html += '<div class="sheet-actions">';
  html += isEdit ? '<button class="btn btn-danger" id="deleteHabit">Delete</button>' : '<button class="btn btn-secondary" id="cancelHabit">Cancel</button>';
  html += '<button class="btn btn-primary" id="saveHabit">'+(isEdit?"Save":"Create habit")+'</button></div>';
  openSheet(html);

  var iconRow = document.getElementById("iconRow");
  HABIT_ICONS.forEach(function(ic,i){
    var btn = document.createElement("button");
    btn.className = "icon-opt"+(i===iconIdx?" selected":"");
    btn.innerHTML = '<i class="ti '+ic+'"></i>';
    btn.addEventListener("click", function(){ iconRow.querySelectorAll(".icon-opt").forEach(function(s){s.classList.remove("selected");}); btn.classList.add("selected"); iconIdx=i; });
    iconRow.appendChild(btn);
  });
  var colorRow = document.getElementById("colorRow");
  HABIT_COLORS.forEach(function(c,i){
    var sw = document.createElement("button");
    sw.className = "swatch"+(i===colorIdx?" selected":"");
    sw.style.background = c.bg;
    sw.addEventListener("click", function(){ colorRow.querySelectorAll(".swatch").forEach(function(s){s.classList.remove("selected");}); sw.classList.add("selected"); colorIdx=i; });
    colorRow.appendChild(sw);
  });
  document.getElementById("freqRow").querySelectorAll(".freq-opt").forEach(function(btn){
    if(btn.dataset.val===freq) btn.classList.add("selected");
    btn.addEventListener("click", function(){ document.querySelectorAll(".freq-opt").forEach(function(b){b.classList.remove("selected");}); btn.classList.add("selected"); freq=btn.dataset.val; });
  });
  document.getElementById("cancelHabit") && document.getElementById("cancelHabit").addEventListener("click", closeSheet);

  document.getElementById("saveHabit").addEventListener("click", async function(){
    var name = document.getElementById("habitNameInput").value.trim();
    if(!name){ showToast("Enter a habit name"); return; }
    var btn = document.getElementById("saveHabit");
    btn.disabled = true;
    try{
      if(isEdit){
        var upd = await sb.from("habits").update({ name:name, icon:HABIT_ICONS[iconIdx], color_idx:colorIdx, freq:freq }).eq("id", existingHabit.id);
        if(upd.error) throw upd.error;
        showToast("Saved");
      } else {
        var ins = await sb.from("habits").insert({ owner_id: cache.me.id, name:name, icon:HABIT_ICONS[iconIdx], color_idx:colorIdx, freq:freq });
        if(ins.error) throw ins.error;
        showToast("Habit created");
      }
      await fetchAll();
      closeSheet();
      render();
    }catch(e){
      showToast(e.message || "Couldn't save habit");
      btn.disabled = false;
    }
  });

  if(isEdit){
    document.getElementById("deleteHabit").addEventListener("click", async function(){
      if(!confirm('Delete "'+existingHabit.name+'"? This removes its history.')) return;
      try{
        var del = await sb.from("habits").delete().eq("id", existingHabit.id);
        if(del.error) throw del.error;
        await fetchAll();
        closeSheet();
        render();
        showToast("Habit deleted");
      }catch(e){ showToast(e.message || "Couldn't delete habit"); }
    });
  }
}

// ---------- PWA install + service worker ----------

if("serviceWorker" in navigator){
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  });
}

boot();

})();
