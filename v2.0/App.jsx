import { useState, useEffect, useRef } from "react";

// ─── WebSocket connection ──────────────────────────────────────────────────
const WS_URL  = "ws://localhost:8000/ws/simulation";
const API_URL = "http://localhost:8000";

// ─── Helpers ───────────────────────────────────────────────────────────────
function statusLabel(survival) {
  if (survival < 0.25) return { label: "CRITICAL", color: "#ff2b2b", bg: "rgba(255,43,43,0.12)" };
  if (survival < 0.50) return { label: "DANGER",   color: "#ff8c00", bg: "rgba(255,140,0,0.10)" };
  if (survival < 0.75) return { label: "MODERATE", color: "#f5c518", bg: "rgba(245,197,24,0.10)" };
  return                       { label: "STABLE",   color: "#39ff78", bg: "rgba(57,255,120,0.10)" };
}

function Bar({ value, color }) {
  return (
    <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value * 100}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
    </div>
  );
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 0.01;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

function Blink() {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setOn(v => !v), 600); return () => clearInterval(t); }, []);
  return <span style={{ opacity: on ? 1 : 0, color: "#ff2b2b" }}>●</span>;
}

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span>{t.toLocaleTimeString("en-IN", { hour12: false })}</span>;
}

// ─── Worker Card ───────────────────────────────────────────────────────────
function WorkerCard({ worker, selected, onClick }) {
  const st = statusLabel(worker.survival_probability);
  return (
    <div onClick={onClick} style={{
      background: selected ? "rgba(255,140,0,0.08)" : st.bg,
      border: `1px solid ${selected ? "#ff8c00" : st.color}44`,
      borderLeft: `3px solid ${st.color}`,
      borderRadius: 6, padding: "12px 14px", cursor: "pointer", marginBottom: 8,
      transition: "border-color 0.2s, background 0.2s",
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "monospace", fontSize: 10, color: "#ffffff33", letterSpacing: 2 }}>
        #{worker.priority}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: st.color, letterSpacing: 3, fontWeight: 700 }}>{st.label}</span>
        {!worker.conscious && <span style={{ fontFamily: "monospace", fontSize: 9, color: "#ff2b2b", border: "1px solid #ff2b2b44", padding: "1px 4px", borderRadius: 2 }}>UNCONSCIOUS</span>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ece0", marginBottom: 4 }}>{worker.name}</div>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#ffffff44", marginBottom: 8 }}>{worker.zone} · {worker.depth}m</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#ffffff66" }}>SURVIVAL</span>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: st.color, fontWeight: 700 }}>{(worker.survival_probability * 100).toFixed(1)}%</span>
      </div>
      <Bar value={worker.survival_probability} color={st.color} />
      <div style={{ marginTop: 6 }}>
        <Sparkline data={worker.survival_history} color={st.color} />
      </div>
    </div>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────
function DetailPanel({ worker, zone, onRescue }) {
  if (!worker) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#ffffff22", fontFamily: "monospace", fontSize: 12, letterSpacing: 2 }}>
      SELECT A WORKER
    </div>
  );
  const st = statusLabel(worker.survival_probability);

  const vitals = [
    { label: "HEART RATE",   value: `${worker.heart_rate} bpm`,         warn: worker.heart_rate > 100 || worker.heart_rate < 55 },
    { label: "IMMOBILE",     value: `${worker.immobile_minutes.toFixed(0)} min`, warn: worker.immobile_minutes > 20 },
    { label: "GAS EXPOSURE", value: `${worker.gas_exposure_minutes.toFixed(0)} min`, warn: worker.gas_exposure_minutes > 15 },
    { label: "HYPOXIA TIME", value: `${worker.hypoxia_minutes.toFixed(0)} min`, warn: worker.hypoxia_minutes > 15 },
    { label: "STRESS",       value: `${(worker.stress_level * 100).toFixed(0)}%`, warn: worker.stress_level > 0.6 },
    { label: "CONSCIOUS",    value: worker.conscious ? "YES" : "NO",     warn: !worker.conscious },
  ];

  const zoneVitals = zone ? [
    { label: "O₂ LEVEL",    value: `${zone.oxygen_percent}%`,     warn: zone.oxygen_percent < 16 },
    { label: "CO",          value: `${zone.co_ppm} ppm`,           warn: zone.co_ppm > 150 },
    { label: "CH₄",         value: `${zone.ch4_ppm} ppm`,          warn: zone.ch4_ppm > 100 },
    { label: "TEMPERATURE", value: `${zone.temperature_c}°C`,      warn: zone.temperature_c > 38 },
    { label: "VENTILATION", value: `${(zone.ventilation_rate*100).toFixed(0)}%`, warn: zone.ventilation_rate < 0.3 },
    { label: "RESCUE ETA",  value: `${zone.rescue_distance_m.toFixed(0)}m away`, warn: zone.rescue_distance_m > 80 },
  ] : [];

  return (
    <div style={{ padding: "20px 16px", overflowY: "auto", height: "100%" }}>
      <div style={{ borderBottom: "1px solid #ffffff0d", paddingBottom: 14, marginBottom: 16 }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: st.color, letterSpacing: 4, marginBottom: 6 }}>
          PRIORITY #{worker.priority} · {st.label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#f0ece0", marginBottom: 4 }}>{worker.name}</div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#ffffff44" }}>{worker.id} · {worker.zone}</div>
      </div>

      {/* Survival gauge */}
      <div style={{ background: "#0d0d0d", border: `1px solid ${st.color}33`, borderRadius: 6, padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "#ffffff33", letterSpacing: 3, marginBottom: 6 }}>SURVIVAL PROBABILITY</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: st.color, fontFamily: "monospace", lineHeight: 1 }}>
          {(worker.survival_probability * 100).toFixed(1)}%
        </div>
        <div style={{ marginTop: 10 }}><Bar value={worker.survival_probability} color={st.color} /></div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
          <Sparkline data={worker.survival_history} color={st.color} />
        </div>
      </div>

      {/* Worker vitals */}
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#ffffff33", letterSpacing: 3, marginBottom: 8 }}>WORKER VITALS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {vitals.map(v => (
          <div key={v.label} style={{ background: v.warn ? "rgba(255,80,0,0.07)" : "#0d0d0d", border: `1px solid ${v.warn ? "#ff500033" : "#ffffff0d"}`, borderRadius: 4, padding: "8px 10px" }}>
            <div style={{ fontSize: 8, color: "#ffffff33", letterSpacing: 2, marginBottom: 3 }}>{v.label}</div>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: v.warn ? "#ff8c00" : "#f0ece0", fontWeight: 600 }}>{v.value}</div>
          </div>
        ))}
      </div>

      {/* Zone conditions */}
      {zone && <>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "#ffffff33", letterSpacing: 3, marginBottom: 8 }}>ZONE CONDITIONS · {zone.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
          {zoneVitals.map(v => (
            <div key={v.label} style={{ background: v.warn ? "rgba(255,80,0,0.07)" : "#0d0d0d", border: `1px solid ${v.warn ? "#ff500033" : "#ffffff0d"}`, borderRadius: 4, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: "#ffffff33", letterSpacing: 2, marginBottom: 3 }}>{v.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: v.warn ? "#ff8c00" : "#f0ece0", fontWeight: 600 }}>{v.value}</div>
            </div>
          ))}
        </div>
      </>}

      <button onClick={() => onRescue(worker.id)} style={{
        width: "100%", padding: "11px 0",
        background: st.color, color: "#080808",
        border: "none", borderRadius: 4,
        fontFamily: "monospace", fontWeight: 700,
        fontSize: 11, letterSpacing: 3, cursor: "pointer",
      }}>
        ✓ MARK AS RESCUED
      </button>
    </div>
  );
}

// ─── Events Log ───────────────────────────────────────────────────────────
function EventsLog({ events }) {
  return (
    <div style={{ padding: "0 12px 12px" }}>
      {[...events].reverse().slice(0, 6).map((e, i) => (
        <div key={i} style={{
          borderLeft: `2px solid ${e.critical ? "#ff2b2b" : "#ffffff22"}`,
          paddingLeft: 8, marginBottom: 8,
        }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: e.critical ? "#ff8c00" : "#ffffff44", marginBottom: 2 }}>
            T+{e.sim_time}min · {e.type.replace(/_/g, " ").toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: e.critical ? "#f0ece0" : "#ffffff66" }}>{e.message}</div>
        </div>
      ))}
      {events.length === 0 && <div style={{ fontFamily: "monospace", fontSize: 10, color: "#ffffff22", letterSpacing: 2 }}>NO EVENTS YET</div>}
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────
function StatsBar({ summary }) {
  if (!summary) return null;
  const items = [
    { label: "TRAPPED",  val: summary.total,        color: "#f0ece0" },
    { label: "CRITICAL", val: summary.critical,     color: "#ff2b2b" },
    { label: "DANGER",   val: summary.danger,       color: "#ff8c00" },
    { label: "STABLE",   val: summary.stable,       color: "#39ff78" },
    { label: "AVG SURV", val: `${((summary.avg_survival||0)*100).toFixed(0)}%`, color: "#f5c518" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "#ffffff0d", borderRadius: 5, overflow: "hidden", marginBottom: 14 }}>
      {items.map(s => (
        <div key={s.label} style={{ background: "#0d0d0d", padding: "10px 4px", textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: "#ffffff33", letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Mine Map ─────────────────────────────────────────────────────────────
function MineMap({ workers, zones, selected, onSelect }) {
  const positions = {
    "W-001": { x: 200, y: 210 }, "W-002": { x: 140, y: 155 },
    "W-003": { x: 480, y: 175 }, "W-004": { x: 335, y: 315 },
    "W-005": { x: 335, y: 375 }, "W-006": { x: 430, y: 255 },
    "W-007": { x: 200, y: 310 }, "W-008": { x: 140, y: 375 },
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#060606", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #ffffff0d", fontFamily: "monospace", fontSize: 9, color: "#ffffff33", letterSpacing: 3 }}>
        MINE SCHEMATIC · SECTOR 7 · LIVE POSITIONS
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 640 480" width="100%" height="100%">
          {/* Grid */}
          {[...Array(13)].map((_,i) => <line key={`v${i}`} x1={i*50+15} y1={0} x2={i*50+15} y2={480} stroke="#ffffff03" strokeWidth={1}/>)}
          {[...Array(10)].map((_,i) => <line key={`h${i}`} x1={0} y1={i*50+15} x2={640} y2={i*50+15} stroke="#ffffff03" strokeWidth={1}/>)}

          {/* Surface */}
          <line x1={60} y1={75} x2={580} y2={75} stroke="#ffffff14" strokeWidth={1} strokeDasharray="4 4"/>
          <text x={64} y={68} fill="#ffffff22" fontSize={9} fontFamily="monospace" letterSpacing={2}>SURFACE</text>

          {/* Tunnels */}
          {[[130,150,480,150],[130,250,480,250],[130,350,480,350]].map(([x1,y1,x2,y2],i) =>
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff0a" strokeWidth={10} strokeLinecap="round"/>
          )}

          {/* Shafts */}
          {[["A-1",130],["A-2",210],["B-4",335],["C-1",480]].map(([name,x]) => (
            <g key={name}>
              <line x1={x} y1={75} x2={x} y2={420} stroke="#ffffff14" strokeWidth={10} strokeLinecap="round"/>
              <text x={x} y={65} fill="#ffffff22" fontSize={8} fontFamily="monospace" textAnchor="middle" letterSpacing={1}>SHAFT {name}</text>
            </g>
          ))}

          {/* Zone O2 indicators */}
          {zones && Object.values(zones).map((z, i) => {
            const xMap = {"Shaft A-1":130,"Shaft A-2":210,"Shaft B-4":335,"Shaft C-1":480};
            const x = xMap[z.name];
            if (!x) return null;
            const o2color = z.oxygen_percent < 12 ? "#ff2b2b" : z.oxygen_percent < 16 ? "#ff8c00" : "#39ff78";
            return <text key={z.name} x={x} y={430} fill={o2color} fontSize={8} fontFamily="monospace" textAnchor="middle">O₂ {z.oxygen_percent}%</text>;
          })}

          {/* Workers */}
          {workers.map(w => {
            const pos = positions[w.id];
            if (!pos) return null;
            const st = statusLabel(w.survival_probability);
            const isSel = selected === w.id;
            return (
              <g key={w.id} onClick={() => onSelect(w.id === selected ? null : w.id)} style={{ cursor: "pointer" }}>
                <circle cx={pos.x} cy={pos.y} r={isSel ? 22 : 16} fill="none" stroke={st.color} strokeWidth={1} opacity={0.25}>
                  <animate attributeName="r" values={`${isSel?22:16};${isSel?28:22};${isSel?22:16}`} dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx={pos.x} cy={pos.y} r={isSel ? 10 : 7} fill={st.color} opacity={w.conscious ? 0.9 : 0.4}/>
                <circle cx={pos.x} cy={pos.y} r={isSel ? 10 : 7} fill="none" stroke="#000" strokeWidth={1.5}/>
                <rect x={pos.x+8} y={pos.y-18} width={16} height={12} rx={2} fill="#000000cc"/>
                <text x={pos.x+16} y={pos.y-9} fill={st.color} fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">#{w.priority}</text>
                {isSel && <>
                  <rect x={pos.x-40} y={pos.y+13} width={80} height={14} rx={2} fill="#000000cc"/>
                  <text x={pos.x} y={pos.y+23} fill="#f0ece0" fontSize={9} fontFamily="monospace" textAnchor="middle">{w.name.split(" ")[0]}</text>
                </>}
              </g>
            );
          })}

          {/* Legend */}
          {[["#ff2b2b","CRITICAL"],["#ff8c00","DANGER"],["#f5c518","MODERATE"],["#39ff78","STABLE"]].map(([c,l],i) => (
            <g key={l}>
              <circle cx={75} cy={430+i*12} r={4} fill={c}/>
              <text x={84} y={434+i*12} fill="#ffffff44" fontSize={8} fontFamily="monospace">{l}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [simState, setSimState]   = useState(null);
  const [selected, setSelected]   = useState(null);
  const [wsStatus, setWsStatus]   = useState("CONNECTING");
  const [speed, setSpeed]         = useState(1);
  const wsRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen    = () => setWsStatus("LIVE");
      ws.onclose   = () => { setWsStatus("RECONNECTING"); setTimeout(connect, 3000); };
      ws.onerror   = () => setWsStatus("ERROR");
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "ping") return;
        setSimState(data);
      };
    };
    connect();
    return () => wsRef.current?.close();
  }, []);

  const apiCall = (path, method = "POST") =>
    fetch(`${API_URL}${path}`, { method }).catch(console.error);

  const handleRescue = (workerId) => {
    fetch(`${API_URL}/api/sim/rescue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_id: workerId }),
    });
    setSelected(null);
  };

  const handleSpeed = (s) => {
    setSpeed(s);
    fetch(`${API_URL}/api/sim/speed?multiplier=${s}`, { method: "POST" });
  };

  const workers   = simState?.workers  || [];
  const zones     = simState?.zones    || {};
  const summary   = simState?.summary  || {};
  const events    = simState?.events_log || [];
  const selWorker = workers.find(w => w.id === selected) || null;
  const selZone   = selWorker ? zones[selWorker.zone] : null;

  const wsColor = wsStatus === "LIVE" ? "#39ff78" : wsStatus === "CONNECTING" ? "#f5c518" : "#ff2b2b";

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f0ece0", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 50, borderBottom: "1px solid #ffffff0d", background: "#050505" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 14, letterSpacing: 4, color: "#ff2b2b" }}>LASTBREATH</div>
          <div style={{ width: 1, height: 18, background: "#ffffff11" }}/>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#ffffff33", letterSpacing: 3 }}>RESCUE PRIORITY ENGINE v2.0</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Speed control */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#ffffff33", letterSpacing: 2, marginRight: 4 }}>SPEED</span>
            {[1, 2, 5].map(s => (
              <button key={s} onClick={() => handleSpeed(s)} style={{
                background: speed === s ? "#ffffff15" : "transparent",
                border: `1px solid ${speed === s ? "#ffffff44" : "#ffffff15"}`,
                color: speed === s ? "#f0ece0" : "#ffffff44",
                fontFamily: "monospace", fontSize: 10, padding: "2px 8px", borderRadius: 3, cursor: "pointer",
              }}>{s}x</button>
            ))}
          </div>

          <button onClick={() => apiCall("/api/sim/pause")}   style={{ background: "transparent", border: "1px solid #ffffff15", color: "#ffffff44", fontFamily: "monospace", fontSize: 9, padding: "3px 10px", borderRadius: 3, cursor: "pointer", letterSpacing: 2 }}>PAUSE</button>
          <button onClick={() => apiCall("/api/sim/resume")}  style={{ background: "transparent", border: "1px solid #ffffff15", color: "#ffffff44", fontFamily: "monospace", fontSize: 9, padding: "3px 10px", borderRadius: 3, cursor: "pointer", letterSpacing: 2 }}>RESUME</button>
          <button onClick={() => apiCall("/api/sim/start")}   style={{ background: "transparent", border: "1px solid #ff2b2b44", color: "#ff2b2b", fontFamily: "monospace", fontSize: 9, padding: "3px 10px", borderRadius: 3, cursor: "pointer", letterSpacing: 2 }}>RESET</button>

          <div style={{ fontFamily: "monospace", fontSize: 10, color: wsColor, letterSpacing: 2 }}>
            ● {wsStatus}
            {simState && <span style={{ color: "#ffffff33", marginLeft: 8 }}>T+{simState.sim_minutes_elapsed}min</span>}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#ffffff44" }}><Clock /></div>
        </div>
      </div>

      {/* ── Critical alerts ── */}
      {events.filter(e => e.critical).slice(-1).map((e, i) => (
        <div key={i} style={{ background: "rgba(255,43,43,0.07)", borderBottom: "1px solid #ff2b2b22", padding: "5px 20px", fontFamily: "monospace", fontSize: 10, color: "#ff8c00", letterSpacing: 1 }}>
          ⚠ {e.message}
        </div>
      ))}

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left panel */}
        <div style={{ width: 300, borderRight: "1px solid #ffffff0d", display: "flex", flexDirection: "column", background: "#080808" }}>
          <div style={{ padding: "12px 12px 0", borderBottom: "1px solid #ffffff0d", paddingBottom: 10 }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "#ffffff33", letterSpacing: 3, marginBottom: 10 }}>RESCUE QUEUE · SORTED BY URGENCY</div>
            <StatsBar summary={summary} />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
            {workers.map(w => (
              <WorkerCard key={w.id} worker={w} selected={selected === w.id} onClick={() => setSelected(w.id === selected ? null : w.id)} />
            ))}
          </div>
          {/* Events log */}
          <div style={{ borderTop: "1px solid #ffffff0d" }}>
            <div style={{ padding: "8px 12px 6px", fontFamily: "monospace", fontSize: 8, color: "#ffffff33", letterSpacing: 3 }}>EVENTS LOG</div>
            <EventsLog events={events} />
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <MineMap workers={workers} zones={zones} selected={selected} onSelect={setSelected} />
        </div>

        {/* Right detail */}
        <div style={{ width: 290, borderLeft: "1px solid #ffffff0d", background: "#080808", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #ffffff0d" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "#ffffff33", letterSpacing: 3 }}>WORKER DETAIL</div>
          </div>
          <DetailPanel worker={selWorker} zone={selZone} onRescue={handleRescue} />
        </div>

      </div>
    </div>
  );
}
