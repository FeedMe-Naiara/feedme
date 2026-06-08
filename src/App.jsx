import { useState, useEffect, useRef } from "react";

const BLACK = "#0A0A0A";
const WHITE = "#FFFFFF";
const GRAY50 = "#F9FAFB";
const GRAY100 = "#F3F4F6";
const GRAY200 = "#E5E7EB";
const GRAY400 = "#9CA3AF";
const GRAY600 = "#4B5563";
const GRAY900 = "#111827";
const ACCENT = "#6366F1";
const FONT = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";

const PALETTES = [
  { bg:"#EEF2FF", accent:"#6366F1", text:"#3730A3" },
  { bg:"#F0FDF4", accent:"#22C55E", text:"#14532D" },
  { bg:"#FFF7ED", accent:"#F97316", text:"#7C2D12" },
  { bg:"#EFF6FF", accent:"#3B82F6", text:"#1E3A8A" },
  { bg:"#FDF4FF", accent:"#A855F7", text:"#581C87" },
  { bg:"#FFF1F2", accent:"#F43F5E", text:"#881337" },
];

const CATEGORIES = [
  { id:"finance",       label:"Finance",       icon:"📈", subs:["Personal finance","Investing","Crypto","Real estate","Side hustles"] },
  { id:"fitness",       label:"Fitness",        icon:"💪", subs:["Gym & weights","Running","Yoga","Nutrition","Mental health"] },
  { id:"tech",          label:"Tech",           icon:"🤖", subs:["AI & tools","Coding","Gadgets","Cybersecurity","Startups"] },
  { id:"business",      label:"Business",       icon:"🚀", subs:["Entrepreneurship","Marketing","Leadership","Productivity","E-commerce"] },
  { id:"science",       label:"Science",        icon:"🔬", subs:["Space","Biology","Physics","Climate","Psychology"] },
  { id:"knowledge",     label:"Knowledge",      icon:"📚", subs:["History","Philosophy","Economics","Politics","Linguistics"] },
  { id:"languages",     label:"Languages",      icon:"🌍", subs:["English","Spanish","French","Mandarin","Other"] },
  { id:"food",          label:"Food",           icon:"🍳", subs:["Quick recipes","Baking","Healthy eating","World cuisine","Drinks"] },
  { id:"creative",      label:"Creative",       icon:"🎨", subs:["Graphic design","Photography","Video editing","Fashion","Architecture"] },
  { id:"music",         label:"Music",          icon:"🎵", subs:["Theory","Production","Instruments","Songwriting","Industry"] },
  { id:"travel",        label:"Travel",         icon:"✈️", subs:["Europe","Asia","Americas","Budget travel","Solo travel"] },
  { id:"mindset",       label:"Mindset",        icon:"🧠", subs:["Stoicism","Habits","Relationships","Parenting","Self-improvement"] },
  { id:"entertainment", label:"Entertainment",  icon:"😂", subs:["Comedy","Pop culture","True crime","Sports","Gaming"] },
  { id:"diy",           label:"DIY & Home",     icon:"🔧", subs:["Home improvement","Gardening","Crafts","Minimalism","Sustainability"] },
  { id:"trends",        label:"Trends",         icon:"✨", subs:["Fashion","Beauty & skincare","Wellness","Interior design","Food trends"] },
  { id:"relationships", label:"Relationships",  icon:"💬", subs:["Dating","Friendships","Family dynamics","Communication","Boundaries"] },
  { id:"petcare",       label:"Pets",           icon:"🐾", subs:["Dogs","Cats","Training","Pet health","Exotic pets"] },
];

function buildHashUrl(h) { return "https://www.tiktok.com/tag/" + h.replace(/^#/, ""); }
function buildHandleUrl(h) { return "https://www.tiktok.com/@" + h.replace(/^@/, ""); }
function buildSearchUrl(card) {
  if (card.hashtags && card.hashtags.length > 0) return "https://www.tiktok.com/tag/" + card.hashtags[0].replace(/^#/, "");
  return "https://www.tiktok.com/search?q=" + encodeURIComponent(card.title);
}

async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
  });
  const d = await res.json();
  const t = (d.content || []).map(function(i) { return i.text || ""; }).join("");
  return JSON.parse(t.replace(/```json|```/g, "").trim());
}

function fetchCards(topic, count) {
  count = count || 5;
  return callClaude("TikTok curator. Generate " + count + " video recommendations specifically about \"" + topic + "\". Return ONLY a JSON array. Each item: title (max 8 words), handle (real TikTok creator no @), duration (e.g. \"1:24\"), emoji, hashtags (2 real no #).");
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={BLACK}/>
      <rect x="8" y="9" width="3" height="10" rx="1.5" fill="white"/>
      <rect x="12.5" y="12" width="3" height="7" rx="1.5" fill="white"/>
      <rect x="17" y="10" width="3" height="9" rx="1.5" fill="white"/>
      <circle cx="20.5" cy="9" r="1.5" fill={ACCENT}/>
    </svg>
  );
}

function LogoLarge() {
  return (
    <svg width="56" height="56" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={BLACK}/>
      <rect x="8" y="9" width="3" height="10" rx="1.5" fill="white"/>
      <rect x="12.5" y="12" width="3" height="7" rx="1.5" fill="white"/>
      <rect x="17" y="10" width="3" height="9" rx="1.5" fill="white"/>
      <circle cx="20.5" cy="9" r="1.5" fill={ACCENT}/>
    </svg>
  );
}

function Pattern(props) {
  var topic = props.topic;
  var pal = props.pal;
  var size = props.size || 54;
  var h = 0;
  for (var i = 0; i < topic.length; i++) h += topic.charCodeAt(i);
  var idx = h % 5;
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ display:"block", flexShrink:0 }}>
      <rect width={size} height={size} fill={pal.bg}/>
      {idx === 0 && (
        <g>
          <circle cx={size*0.3} cy={size*0.35} r={size*0.18} fill={pal.accent} opacity="0.4"/>
          <circle cx={size*0.68} cy={size*0.62} r={size*0.22} fill={pal.text} opacity="0.25"/>
          <circle cx={size*0.7} cy={size*0.28} r={size*0.1} fill={pal.accent} opacity="0.6"/>
        </g>
      )}
      {idx === 1 && (
        <g>
          <polygon points={size*0.15+","+size*0.75+" "+size*0.45+","+size*0.2+" "+size*0.75+","+size*0.75} fill={pal.accent} opacity="0.4"/>
          <polygon points={size*0.55+","+size*0.55+" "+size*0.75+","+size*0.2+" "+size*0.95+","+size*0.55} fill={pal.text} opacity="0.25"/>
        </g>
      )}
      {idx === 2 && (
        <g>
          <line x1={size*0} y1="0" x2={size*-0.4} y2={size} stroke={pal.accent} strokeWidth="2.5" opacity="0.15"/>
          <line x1={size*0.22} y1="0" x2={size*-0.18} y2={size} stroke={pal.accent} strokeWidth="2.5" opacity="0.23"/>
          <line x1={size*0.44} y1="0" x2={size*0.04} y2={size} stroke={pal.accent} strokeWidth="2.5" opacity="0.31"/>
          <line x1={size*0.66} y1="0" x2={size*0.26} y2={size} stroke={pal.accent} strokeWidth="2.5" opacity="0.39"/>
          <line x1={size*0.88} y1="0" x2={size*0.48} y2={size} stroke={pal.accent} strokeWidth="2.5" opacity="0.47"/>
          <circle cx={size*0.7} cy={size*0.4} r={size*0.15} fill={pal.text} opacity="0.3"/>
        </g>
      )}
      {idx === 3 && (
        <g>
          <circle cx={size*0.2} cy={size*0.25} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.2} cy={size*0.55} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.2} cy={size*0.8} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.5} cy={size*0.25} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.5} cy={size*0.55} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.5} cy={size*0.8} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.8} cy={size*0.25} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.8} cy={size*0.55} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <circle cx={size*0.8} cy={size*0.8} r={size*0.055} fill={pal.accent} opacity="0.45"/>
          <rect x={size*0.3} y={size*0.3} width={size*0.4} height={size*0.4} rx="3" fill="none" stroke={pal.text} strokeWidth="1.5" opacity="0.25"/>
        </g>
      )}
      {idx === 4 && (
        <g>
          <line x1={size*0.5} y1={size*0.1} x2={size*0.5} y2={size*0.9} stroke={pal.accent} strokeWidth="2" opacity="0.35"/>
          <line x1={size*0.1} y1={size*0.5} x2={size*0.9} y2={size*0.5} stroke={pal.accent} strokeWidth="2" opacity="0.35"/>
          <circle cx={size*0.5} cy={size*0.5} r={size*0.2} fill="none" stroke={pal.text} strokeWidth="2" opacity="0.3"/>
          <circle cx={size*0.5} cy={size*0.5} r={size*0.08} fill={pal.accent} opacity="0.55"/>
        </g>
      )}
    </svg>
  );
}

function VideoCard(props) {
  var card = props.card, pal = props.pal, saved = props.saved, onSave = props.onSave, onWatch = props.onWatch;
  var firstHash = card.hashtags && card.hashtags.length > 0 ? card.hashtags[0] : "tiktok";
  return (
    <div style={{ background:WHITE, border:"1px solid "+GRAY200, borderRadius:10, overflow:"hidden", display:"flex", alignItems:"stretch", fontFamily:FONT }}>
      <Pattern topic={card.title} pal={pal} size={56}/>
      <div style={{ flex:1, padding:"10px 12px", minWidth:0 }}>
        <p style={{ margin:"0 0 5px", fontSize:13, fontWeight:500, lineHeight:1.35, color:GRAY900 }}>{card.title}</p>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <a href={buildHandleUrl(card.handle)} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:GRAY400, textDecoration:"none" }}>{"@"+card.handle}</a>
          <span style={{ fontSize:10, color:GRAY400, background:GRAY100, padding:"1px 7px", borderRadius:999 }}>{card.duration}</span>
          {(card.hashtags||[]).map(function(h) {
            return <a key={h} href={buildHashUrl(h)} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, color:pal.accent, textDecoration:"none", fontWeight:500 }}>{"#"+h}</a>;
          })}
        </div>
        <p style={{ margin:"4px 0 0", fontSize:10, color:GRAY200 }}>{"▶ opens #"+firstHash}</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", borderLeft:"1px solid "+GRAY100 }}>
        {onSave && (
          <button onClick={onSave} style={{ flex:1, width:40, background:saved?pal.bg:"transparent", border:"none", borderBottom:"1px solid "+GRAY100, cursor:"pointer", fontSize:14, color:saved?pal.accent:GRAY200 }}>{saved?"♥":"♡"}</button>
        )}
        <a href={buildSearchUrl(card)} target="_blank" rel="noopener noreferrer" onClick={onWatch||undefined}
          style={{ flex:1, width:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:GRAY400, textDecoration:"none" }}>▶</a>
      </div>
    </div>
  );
}

function SubSection(props) {
  var subId = props.subId, topic = props.topic, pal = props.pal, saved = props.saved, onSave = props.onSave;
  var [cards, setCards] = useState([]);
  var [loading, setLoading] = useState(true);
  var [loadingMore, setLoadingMore] = useState(false);
  useEffect(function() {
    fetchCards(topic, 4).then(function(c) { setCards(c); setLoading(false); }).catch(function() { setLoading(false); });
  }, [topic]);
  function loadMore() {
    setLoadingMore(true);
    fetchCards(topic, 3).then(function(m) { setCards(function(p) { return p.concat(m); }); setLoadingMore(false); }).catch(function() { setLoadingMore(false); });
  }
  if (loading) return (
    <div style={{ marginBottom:16 }}>
      <div style={{ height:12, width:100, borderRadius:6, background:GRAY100, marginBottom:10 }}/>
      <div style={{ height:58, borderRadius:10, background:GRAY100, marginBottom:7 }}/>
      <div style={{ height:58, borderRadius:10, background:GRAY100, marginBottom:7 }}/>
    </div>
  );
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:600, color:pal.text, background:pal.bg, padding:"3px 10px", borderRadius:999 }}>{topic}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {cards.map(function(card, i) {
          var key = subId+"-"+i;
          return <VideoCard key={key} card={card} pal={pal} saved={saved.has(key)} onSave={function() { onSave(key, card); }}/>;
        })}
      </div>
      <button onClick={loadMore} disabled={loadingMore} style={{ marginTop:8, padding:"7px 16px", borderRadius:6, border:"1px solid "+GRAY200, background:WHITE, cursor:loadingMore?"wait":"pointer", fontSize:11, color:GRAY400, fontFamily:FONT }}>
        {loadingMore?"Loading…":"Load more ↓"}
      </button>
    </div>
  );
}

function ChannelsHome(props) {
  var savedCards = props.savedCards, selected = props.selected, watched = props.watched, onOpenChannel = props.onOpenChannel;
  var channels = Object.entries(selected).filter(function(e) { return e[1].length > 0; }).map(function(e) {
    var id = e[0], subs = e[1];
    var cat = CATEGORIES.find(function(c) { return c.id === id; });
    var keys = Object.keys(savedCards).filter(function(k) { return k.startsWith(id); });
    return { id:id, label:cat?cat.label:"", icon:cat?cat.icon:"", subs:subs, total:keys.length, unwatched:keys.filter(function(k) { return !watched.has(k); }).length };
  });
  if (channels.length === 0) return (
    <div style={{ textAlign:"center", padding:"4rem 0", fontFamily:FONT }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
      <p style={{ fontSize:14, fontWeight:500, color:GRAY900, marginBottom:4 }}>No channels yet</p>
      <p style={{ fontSize:13, color:GRAY400 }}>Go to Discover and save some videos</p>
    </div>
  );
  return (
    <div style={{ fontFamily:FONT }}>
      <p style={{ fontSize:15, fontWeight:600, margin:"0 0 4px", color:GRAY900 }}>My channels</p>
      <p style={{ fontSize:13, color:GRAY400, margin:"0 0 20px" }}>Your saved content, organised by topic</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(148px,1fr))", gap:10 }}>
        {channels.map(function(ch, i) {
          var pal = PALETTES[i%PALETTES.length];
          var label = ch.unwatched > 0 ? ch.unwatched+" to watch" : "All watched ✓";
          return (
            <button key={ch.id} onClick={function() { onOpenChannel(ch.id); }} style={{ padding:"16px 14px", borderRadius:14, border:"1.5px solid "+GRAY200, background:WHITE, cursor:"pointer", textAlign:"left", fontFamily:FONT }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{ch.icon}</div>
              <div style={{ fontSize:12, fontWeight:600, color:GRAY900, marginBottom:3 }}>{"FeedMe_"+ch.label}</div>
              <div style={{ fontSize:10, color:GRAY400, marginBottom:10, lineHeight:1.4 }}>{ch.subs.slice(0,3).join(", ")}{ch.subs.length>3?"…":""}</div>
              {ch.total > 0
                ? <div style={{ display:"inline-flex", fontSize:11, fontWeight:500, color:pal.text, background:pal.bg, padding:"3px 8px", borderRadius:999 }}>{label}</div>
                : <div style={{ fontSize:11, color:GRAY400 }}>Nothing saved yet</div>
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChannelView(props) {
  var channelId = props.channelId, savedCards = props.savedCards, selected = props.selected;
  var onBack = props.onBack, watched = props.watched, onToggleWatched = props.onToggleWatched;
  var cat = CATEGORIES.find(function(c) { return c.id === channelId; });
  var keys = Object.keys(selected).filter(function(k) { return (selected[k]||[]).length > 0; });
  var idx = keys.indexOf(channelId);
  var pal = PALETTES[Math.max(idx,0) % PALETTES.length];
  var entries = Object.entries(savedCards).filter(function(e) { return e[0].startsWith(channelId); });
  var unwatched = entries.filter(function(e) { return !watched.has(e[0]); });
  var done = entries.filter(function(e) { return watched.has(e[0]); });
  var pendingWatch = useRef(null), leaveTime = useRef(null);
  function handleOpen(key) { leaveTime.current = Date.now(); pendingWatch.current = key; }
  useEffect(function() {
    function onFocus() {
      if (!pendingWatch.current || !leaveTime.current) return;
      if (Date.now() - leaveTime.current >= 15000 && !watched.has(pendingWatch.current)) onToggleWatched(pendingWatch.current);
      pendingWatch.current = null; leaveTime.current = null;
    }
    window.addEventListener("focus", onFocus);
    return function() { window.removeEventListener("focus", onFocus); };
  }, [watched, onToggleWatched]);

  function Section(sProps) {
    var items = sProps.items, title = sProps.title;
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom:"1.5rem" }}>
        <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:GRAY400, margin:"0 0 10px" }}>{title}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {items.map(function(e) {
            var k = e[0], card = e[1], isWatched = watched.has(k);
            return (
              <div key={k} style={{ display:"flex", alignItems:"stretch", background:WHITE, border:"1px solid "+GRAY200, borderRadius:10, overflow:"hidden", opacity:isWatched?0.5:1 }}>
                <Pattern topic={card.title} pal={pal} size={56}/>
                <div style={{ flex:1, padding:"10px 12px", minWidth:0 }}>
                  <p style={{ margin:"0 0 5px", fontSize:13, fontWeight:500, lineHeight:1.35, color:GRAY900, textDecoration:isWatched?"line-through":"none" }}>{card.title}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <a href={buildHandleUrl(card.handle)} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:GRAY400, textDecoration:"none" }}>{"@"+card.handle}</a>
                    <span style={{ fontSize:10, color:GRAY400, background:GRAY100, padding:"1px 7px", borderRadius:999 }}>{card.duration}</span>
                    {(card.hashtags||[]).map(function(h) {
                      return <a key={h} href={buildHashUrl(h)} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, color:pal.accent, textDecoration:"none", fontWeight:500 }}>{"#"+h}</a>;
                    })}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", borderLeft:"1px solid "+GRAY100 }}>
                  <button onClick={function() { onToggleWatched(k); }} style={{ flex:1, width:40, border:"none", borderBottom:"1px solid "+GRAY100, background:isWatched?pal.bg:WHITE, cursor:"pointer", fontSize:13, color:isWatched?pal.accent:GRAY200 }}>{isWatched?"✓":"○"}</button>
                  <a href={buildSearchUrl(card)} target="_blank" rel="noopener noreferrer" onClick={function() { handleOpen(k); }} style={{ flex:1, width:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:GRAY400, textDecoration:"none" }}>▶</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:FONT }}>
      <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:GRAY400, padding:0, marginBottom:16, fontFamily:FONT }}>← My channels</button>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, paddingBottom:12, borderBottom:"1.5px solid "+GRAY200 }}>
        <span style={{ fontSize:20 }}>{cat?cat.icon:""}</span>
        <span style={{ fontSize:15, fontWeight:600, color:GRAY900 }}>{"FeedMe_"+(cat?cat.label:"")}</span>
        <span style={{ fontSize:11, fontWeight:500, color:pal.text, background:pal.bg, padding:"2px 8px", borderRadius:999 }}>{unwatched.length+" to watch"}</span>
        {done.length > 0 && <span style={{ fontSize:11, color:GRAY400, background:GRAY100, padding:"2px 8px", borderRadius:999 }}>{done.length+" watched"}</span>}
      </div>
      <p style={{ fontSize:11, color:GRAY200, margin:"0 0 16px" }}>○ mark manually · ▶ auto-marks after 15s</p>
      {entries.length === 0
        ? <p style={{ fontSize:13, color:GRAY400 }}>Nothing saved yet.</p>
        : <div><Section items={unwatched} title="To watch"/><Section items={done} title="Watched"/></div>
      }
    </div>
  );
}

function CustomSearch(props) {
  var selected = props.selected, setSelected = props.setSelected;
  var [input, setInput] = useState("");
  var [suggestions, setSuggestions] = useState([]);
  var [loadingSugg, setLoadingSugg] = useState(false);
  var debounceRef = useRef(null);
  var customs = Object.entries(selected).filter(function(e) { return e[0].startsWith("custom_"); }).map(function(e) { return { id:e[0], label:e[1][0] }; });

  function add(val) {
    var v = (val||input).trim(); if (!v) return;
    var id = "custom_"+v.toLowerCase().replace(/\s+/g,"_")+"_"+Date.now();
    setSelected(function(prev) { var n = Object.assign({},prev); n[id]=[v]; return n; });
    setInput(""); setSuggestions([]);
  }
  function remove(id) { setSelected(function(prev) { var n=Object.assign({},prev); delete n[id]; return n; }); }
  function handleInput(val) {
    setInput(val); setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;
    debounceRef.current = setTimeout(function() {
      setLoadingSugg(true);
      callClaude("Suggest 5 short TikTok topic ideas (1-3 words) matching \""+val+"\". Return ONLY a JSON array of strings.")
        .then(function(s) { setSuggestions(s.slice(0,5)); setLoadingSugg(false); })
        .catch(function() { setLoadingSugg(false); });
    }, 400);
  }
  return (
    <div style={{ marginTop:"1.5rem", borderRadius:14, border:"1px solid "+GRAY200, background:GRAY50, overflow:"hidden", fontFamily:FONT }}>
      <div style={{ padding:"14px 16px" }}>
        <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:600, color:GRAY900 }}>Search anything</p>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={function(e) { handleInput(e.target.value); }}
            onKeyDown={function(e) { if(e.key==="Enter") add(); if(e.key==="Escape") setSuggestions([]); }}
            placeholder="e.g. sourdough, k-pop, stoicism…"
            style={{ flex:1, padding:"9px 12px", borderRadius:6, border:"1px solid "+GRAY200, background:WHITE, fontSize:13, outline:"none", fontFamily:FONT, color:GRAY900 }}/>
          <button onClick={function() { add(); }} disabled={!input.trim()} style={{ padding:"9px 18px", borderRadius:6, border:"none", background:input.trim()?BLACK:GRAY200, color:input.trim()?WHITE:GRAY400, fontSize:13, fontWeight:500, cursor:input.trim()?"pointer":"not-allowed", flexShrink:0, fontFamily:FONT }}>Add</button>
        </div>
      </div>
      {(loadingSugg||suggestions.length>0) && (
        <div style={{ borderTop:"1px solid "+GRAY200 }}>
          {loadingSugg&&suggestions.length===0&&<div style={{ padding:"9px 16px", fontSize:12, color:GRAY400 }}>Thinking…</div>}
          {suggestions.map(function(s,i) {
            return <button key={i} onClick={function() { add(s); }} style={{ display:"block", width:"100%", padding:"9px 16px", textAlign:"left", background:WHITE, border:"none", borderBottom:i<suggestions.length-1?"1px solid "+GRAY100:"none", fontSize:13, cursor:"pointer", color:GRAY900, fontFamily:FONT }}>{"+ "+s}</button>;
          })}
        </div>
      )}
      {customs.length > 0 && (
        <div style={{ padding:"10px 16px", borderTop:"1px solid "+GRAY200, display:"flex", flexWrap:"wrap", gap:6 }}>
          {customs.map(function(c) {
            return (
              <span key={c.id} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, padding:"4px 10px", borderRadius:999, background:BLACK, color:WHITE }}>
                {c.label}
                <button onClick={function() { remove(c.id); }} style={{ background:"none", border:"none", color:WHITE, cursor:"pointer", fontSize:12, padding:0, lineHeight:1, opacity:0.6 }}>✕</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Welcome(props) {
  var onStart = props.onStart;
  var previews = ["📈 FeedMe_Finance","💪 FeedMe_Fitness","🤖 FeedMe_Tech","✨ FeedMe_Trends"];
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:FONT, background:WHITE }}>
      <div style={{ maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}><LogoLarge/></div>
        <h1 style={{ fontSize:32, fontWeight:700, color:GRAY900, margin:"0 0 12px", letterSpacing:"-0.02em" }}>FeedMe</h1>
        <p style={{ fontSize:16, color:GRAY600, margin:"0 0 8px", lineHeight:1.6 }}>Your personal TikTok learning feed.</p>
        <p style={{ fontSize:14, color:GRAY400, margin:"0 0 40px", lineHeight:1.6 }}>Pick your interests, get a curated feed of videos worth watching — organised by topic, saved for later.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:40 }}>
          {previews.map(function(t) {
            return <div key={t} style={{ padding:"10px 16px", borderRadius:10, border:"1px solid "+GRAY200, background:GRAY50, fontSize:13, color:GRAY600, textAlign:"left" }}>{t}</div>;
          })}
        </div>
        <button onClick={onStart} style={{ width:"100%", padding:"14px", borderRadius:10, border:"none", background:BLACK, color:WHITE, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:FONT }}>Get hungry →</button>
        <p style={{ marginTop:14, fontSize:11, color:GRAY200 }}>No account needed · Free to use</p>
      </div>
    </div>
  );
}

export default function App() {
  var [screen, setScreen] = useState("welcome");
  var [tab, setTab] = useState("discover");
  var [discoverStep, setDiscoverStep] = useState(0);
  var [selected, setSelected] = useState({});
  var [expanded, setExpanded] = useState(null);
  var [savedCards, setSavedCards] = useState({});
  var [watched, setWatched] = useState(new Set());
  var [openChannel, setOpenChannel] = useState(null);

  useEffect(function() {
    try {
      var p = localStorage.getItem("feedme_v9");
      if (p) {
        var d = JSON.parse(p);
        if (d.selected) setSelected(d.selected);
        if (d.savedCards) setSavedCards(d.savedCards);
        if (d.started) setScreen("app");
      }
    } catch(e) {}
  }, []);

  function persist(sel, sc) {
    try { localStorage.setItem("feedme_v9", JSON.stringify({ selected:sel, savedCards:sc, started:true })); } catch(e) {}
  }
  function handleStart() { setScreen("app"); persist(selected, savedCards); }
  function toggleSub(catId, sub) {
    setSelected(function(prev) {
      var cur = prev[catId]||[], next = cur.includes(sub)?cur.filter(function(x){return x!==sub;}):cur.concat([sub]);
      var n = Object.assign({},prev); n[catId]=next; return n;
    });
  }
  var totalTopics = Object.values(selected).flat().length;
  function handleBuild() { persist(selected, savedCards); setDiscoverStep(1); }
  function handleSave(key, card) {
    setSavedCards(function(prev) {
      var next = Object.assign({},prev);
      if (next[key]) { delete next[key]; } else { next[key]=card; }
      persist(selected, next); return next;
    });
  }
  function toggleWatched(key) {
    setWatched(function(prev) { var n=new Set(prev); n.has(key)?n.delete(key):n.add(key); return n; });
  }

  var savedSet = new Set(Object.keys(savedCards));
  var activeChannels = Object.entries(selected).filter(function(e){return e[1].length>0;}).map(function(e) {
    var id=e[0], subs=e[1], cat=CATEGORIES.find(function(c){return c.id===id;});
    return { id:id, subs:subs, label:cat?cat.label:"", icon:cat?cat.icon:"" };
  });

  if (screen==="welcome") return <Welcome onStart={handleStart}/>;

  return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"1.25rem 1rem 4rem", fontFamily:FONT }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo/>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:GRAY900, letterSpacing:"-0.02em" }}>FeedMe</div>
            <div style={{ fontSize:9, color:GRAY400, letterSpacing:"0.04em" }}>FeedMe_Finance · FeedMe_Fitness · FeedMe_Trends</div>
          </div>
        </div>
        {discoverStep===1&&tab==="discover"&&(
          <button onClick={function(){setDiscoverStep(0);}} style={{ fontSize:12, padding:"5px 12px", borderRadius:6, border:"1px solid "+GRAY200, background:WHITE, cursor:"pointer", color:GRAY600, fontFamily:FONT }}>← Interests</button>
        )}
      </div>

      <div style={{ display:"flex", marginBottom:"1.75rem", borderBottom:"1px solid "+GRAY200 }}>
        {[{id:"discover",label:"Discover"},{id:"channels",label:"My channels"+(savedSet.size>0?" · "+savedSet.size:"")}].map(function(t) {
          return <button key={t.id} onClick={function(){setTab(t.id);setOpenChannel(null);}} style={{ padding:"9px 18px", background:"transparent", border:"none", borderBottom:tab===t.id?"2px solid "+BLACK:"2px solid transparent", cursor:"pointer", fontSize:13, fontWeight:tab===t.id?600:400, color:tab===t.id?GRAY900:GRAY400, marginBottom:"-1px", fontFamily:FONT }}>{t.label}</button>;
        })}
      </div>

      {tab==="discover"&&discoverStep===0&&(
        <div>
          <p style={{ fontSize:16, fontWeight:600, margin:"0 0 4px", color:GRAY900 }}>What do you want to learn?</p>
          <p style={{ fontSize:13, color:GRAY400, margin:"0 0 20px" }}>Tap a topic, then pick subtopics</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px,1fr))", gap:8, marginBottom:"1.5rem" }}>
            {CATEGORIES.map(function(cat) {
              var catSubs=selected[cat.id]||[], isExp=expanded===cat.id, hasSel=catSubs.length>0;
              return (
                <div key={cat.id} style={{ gridColumn:isExp?"1 / -1":"auto" }}>
                  {!isExp ? (
                    <button onClick={function(){setExpanded(cat.id);}} style={{ width:"100%", padding:"12px 10px", borderRadius:10, border:"1px solid "+(hasSel?BLACK:GRAY200), background:hasSel?BLACK:WHITE, color:hasSel?WHITE:GRAY900, cursor:"pointer", textAlign:"left", fontFamily:FONT }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{cat.icon}</div>
                      <div style={{ fontSize:12, fontWeight:500 }}>{cat.label}</div>
                      {hasSel&&<div style={{ fontSize:10, marginTop:2, opacity:0.6 }}>{catSubs.join(", ")}</div>}
                    </button>
                  ) : (
                    <div style={{ border:"1.5px solid "+BLACK, borderRadius:10, padding:"12px 14px", background:WHITE }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <span style={{ fontSize:16 }}>{cat.icon}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:GRAY900 }}>{cat.label}</span>
                        </div>
                        <button onClick={function(){setExpanded(null);}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:GRAY400, padding:0 }}>✕</button>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {cat.subs.map(function(sub) {
                          var on=catSubs.includes(sub);
                          return <button key={sub} onClick={function(){toggleSub(cat.id,sub);}} style={{ padding:"6px 13px", borderRadius:999, fontSize:12, cursor:"pointer", border:"1px solid "+(on?BLACK:GRAY200), background:on?BLACK:WHITE, color:on?WHITE:GRAY600, fontWeight:on?500:400, fontFamily:FONT }}>{sub}</button>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.25rem" }}>
            <button onClick={handleBuild} disabled={totalTopics===0} style={{ padding:"11px 28px", borderRadius:10, border:"none", background:totalTopics>0?BLACK:GRAY100, color:totalTopics>0?WHITE:GRAY400, fontSize:14, fontWeight:600, cursor:totalTopics>0?"pointer":"not-allowed", fontFamily:FONT }}>
              {totalTopics>0?"Build my feed — "+totalTopics+" topic"+(totalTopics>1?"s":"")+" →":"Select at least one topic"}
            </button>
            {totalTopics>0&&<button onClick={function(){setSelected({});setExpanded(null);}} style={{ padding:"11px 14px", borderRadius:10, border:"1px solid "+GRAY200, background:WHITE, color:GRAY400, fontSize:13, cursor:"pointer", fontFamily:FONT }}>Clear</button>}
          </div>
          <CustomSearch selected={selected} setSelected={setSelected}/>
        </div>
      )}

      {tab==="discover"&&discoverStep===1&&(
        <div>
          {activeChannels.map(function(ch, idx) {
            var pal=PALETTES[idx%PALETTES.length];
            return (
              <div key={ch.id} style={{ marginBottom:"2.5rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:10, borderBottom:"2px solid "+pal.accent }}>
                  <span style={{ fontSize:18 }}>{ch.icon}</span>
                  <span style={{ fontSize:15, fontWeight:600, color:GRAY900 }}>{"FeedMe_"+ch.label}</span>
                </div>
                {ch.subs.map(function(sub, si) {
                  return <SubSection key={ch.id+"-"+sub} subId={ch.id+"-"+si} topic={sub} pal={pal} saved={savedSet} onSave={handleSave}/>;
                })}
              </div>
            );
          })}
        </div>
      )}

      {tab==="channels"&&!openChannel&&<ChannelsHome savedCards={savedCards} selected={selected} watched={watched} onOpenChannel={setOpenChannel}/>}
      {tab==="channels"&&openChannel&&<ChannelView channelId={openChannel} savedCards={savedCards} selected={selected} onBack={function(){setOpenChannel(null);}} watched={watched} onToggleWatched={toggleWatched}/>}
    </div>
  );
}
