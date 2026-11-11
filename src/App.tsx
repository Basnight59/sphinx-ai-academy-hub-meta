import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Compass, FileText, Landmark, Scale, ShieldCheck, Sparkles, Users, Menu, X, ChevronRight, ExternalLink, Quote } from "lucide-react";

type Page = "home"|"method"|"ttl"|"curriculum"|"reentry"|"certification"|"research";
type ApiRecord = { id:string; value:Record<string,unknown> };

const PAGES: {id:Page; label:string}[] = [
  {id:"home", label:"Home"},
  {id:"method", label:"The Method"},
  {id:"ttl", label:"TTL + GIGO"},
  {id:"curriculum", label:"Curriculum"},
  {id:"reentry", label:"Scarlet Letter F + Re-entry"},
  {id:"certification", label:"Certification"},
  {id:"research", label:"Research / Evidence"},
];

async function api(action:string, args:Record<string,unknown>){
  const res = await fetch("actions", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({action, args})});
  const json = await res.json().catch(()=>({}));
  if(!res.ok || json.error) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data;
}
function keyFor(collection:string, item:string){ return `${collection}::${item}`; }

function useChecklist(collection:string, items:string[]){
  const [checked, setChecked] = useState<Record<string,boolean>>({});
  const [recordIds, setRecordIds] = useState<Record<string,string>>({});
  const [status, setStatus] = useState("");
  const [available, setAvailable] = useState(true);
  useEffect(()=>{
    let live=true;
    api("records.list", {collection}).then((data:any)=>{
      if(!live) return;
      const c:Record<string,boolean>={}; const ids:Record<string,string>={};
      for(const r of (data?.records||[]) as ApiRecord[]){ const k=String(r.value?.item||""); if(items.includes(k)){ c[k]=Boolean(r.value?.checked); ids[k]=r.id; } }
      setChecked(c); setRecordIds(ids);
    }).catch(()=>{ if(live) setAvailable(false); });
    return ()=>{live=false};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[collection]);
  async function toggle(item:string){
    const next=!checked[item];
    const prevChecked={...checked}; const prevIds={...recordIds};
    setChecked({...checked,[item]:next}); setStatus("Saving…");
    try{
      if(next){
        const rec:any = await api("records.create", {collection, value:{item, checked:true}, idempotency_key:keyFor(collection,item)});
        setRecordIds({...prevIds,[item]:rec.id}); setStatus(`Saved: ${item} marked complete.`);
      } else if(prevIds[item]){
        await api("records.delete", {collection, id:prevIds[item]});
        const n={...prevIds}; delete n[item]; setRecordIds(n); setStatus(`Saved: ${item} unmarked.`);
      } else setStatus("Updated.");
    } catch(e){ setChecked(prevChecked); setStatus(e instanceof Error? e.message : "Save did not complete. Your change was not saved."); }
  }
  return {checked, toggle, status, available, count: Object.values(checked).filter(Boolean).length};
}

const modules = [
  {id:"M1", level:"Level 1 · Foundational", title:"Human Agency and AI Literacy", goal:"Name what a model can and cannot decide for you.", ttl:"Truth begins with human judgment.", deliverable:"Agency statement in your own words"},
  {id:"M2", level:"Level 1 · Foundational", title:"GIGO and Human Orchestrator Spectrum", goal:"Diagnose input quality across six dimensions.", ttl:"Trace output quality back to process quality.", deliverable:"GIGO self-map + improvement plan"},
  {id:"M3", level:"Level 1 · Foundational", title:"Multimodal Interrogation", goal:"Use typed, spoken, and audio review together.", ttl:"Review is embodied, not only a checkbox.", deliverable:"Speech-to-text transcript + playback notes"},
  {id:"M4", level:"Level 2 · Practitioner", title:"Multi-Model Interrogation and Adversarial Comparison", goal:"Stage deliberate disagreement between models.", ttl:"Agreement is not proof.", deliverable:"Conflict table with named sources"},
  {id:"M5", level:"Level 2 · Practitioner", title:"Source Verification and Truth", goal:"Check every material claim against a primary source.", ttl:"No primary source, no certified claim.", deliverable:"Source-verified claim set"},
  {id:"M6", level:"Level 2 · Practitioner", title:"Human Review and Adjudication", goal:"Write a signed adjudication memo in your own words.", ttl:"The human decides; the record shows why.", deliverable:"Adjudication memo"},
  {id:"M7", level:"Level 3 · Adjudicator / Legacy", title:"Transparency and Decision Log", goal:"Make the whole process readable by a stranger.", ttl:"Transparency is a readable record.", deliverable:"Complete decision log"},
  {id:"M8", level:"Level 3 · Adjudicator / Legacy", title:"Legacy, Preservation, Teachable Artifacts", goal:"Preserve reasoning so it can be taught later.", ttl:"Legacy outlives the session.", deliverable:"Citable portfolio artifact"},
  {id:"CAP", level:"Capstone", title:"TTL-Verified Record", goal:"Produce one record that can be checked, reproduced, and taught.", ttl:"Evidence, decision, and accountability in one artifact.", deliverable:"Capstone record + teaching note"},
];

const scenarios = [
  {id:"claim", title:"A bold historical claim", manual:"A researcher writes from memory, then looks for sources that support the draft.", agentic:"An agent gathers sources, drafts the claim, and asks for one approval.", sphinx:"Two or more models are asked to challenge the claim. The human checks primary sources, preserves disagreement, and writes why the claim stands or falls."},
  {id:"business", title:"A business idea", manual:"A founder polishes a plan in a document and seeks feedback at the end.", agentic:"An agent produces market copy, projections, and a deck in one run.", sphinx:"Models test the idea from different angles. The human verifies assumptions, rejects unsupported claims, and keeps the surviving reasoning as the record."},
  {id:"lesson", title:"A lesson for learners", manual:"A teacher writes slides from prior notes and adds an AI summary.", agentic:"An agent builds the full lesson, quiz, and handouts automatically.", sphinx:"Models propose competing explanations and common misconceptions. The human adjudicates, checks sources, and preserves what was rejected and why."},
];

const certItems = [
  {id:"Independent interrogation", evidence:"Outputs from 2+ providers; 3 for a contested claim.", group:"Truth"},
  {id:"Deliberate disagreement", evidence:"At least one staged conflict and how it was handled.", group:"Truth"},
  {id:"Primary source verification", evidence:"A primary source for every material claim.", group:"Truth"},
  {id:"Uncertainty preserved", evidence:"Open questions and limits stated in the record.", group:"Truth"},
  {id:"Adjudication memo", evidence:"Signed, dated memo in the human’s own words.", group:"Truth"},
  {id:"Full prompts + outputs", evidence:"Complete prompts and model outputs preserved.", group:"Transparency"},
  {id:"Decision log", evidence:"Each choice, rejection, and reason recorded.", group:"Transparency"},
  {id:"Human vs. model contribution", evidence:"Separated contributions, not blended prose.", group:"Transparency"},
  {id:"Reproducibility note", evidence:"Enough detail for a stranger to repeat one claim.", group:"Transparency"},
  {id:"Provenance chain", evidence:"Sources, versions, and changes traceable.", group:"Transparency"},
  {id:"Teaching note", evidence:"What a future learner should take from the record.", group:"Legacy"},
  {id:"Named accountability", evidence:"A named person accepts responsibility.", group:"Legacy"},
  {id:"Preservation plan", evidence:"Where and how the artifact will be kept.", group:"Legacy"},
  {id:"Input Quality Disclosure", evidence:"What went in, including limits.", group:"GIGO"},
  {id:"Expertise Disclosure", evidence:"Formal, professional, and lived experience — plus limitations.", group:"GIGO"},
  {id:"GIGO assessment", evidence:"A paragraph assessing process quality.", group:"GIGO"},
  {id:"Human Review Evidence", evidence:"Transcripts, playback markers, edit history, attestation.", group:"Human Review"},
];

function SectionHead({eyebrow,title,summary}:{eyebrow:string;title:string;summary:string}){
  return <div className="max-w-[820px]"><p className="eyebrow">{eyebrow}</p><h1 className="text-[clamp(2.1rem,5vw,4rem)] mt-3">{title}</h1><div className="gold-rule my-5"/><p className="text-lg md:text-xl text-[var(--ink-2)]">{summary}</p></div>
}
function Takeaway({children}:{children:React.ReactNode}){ return <div className="takeaway my-8"><p className="kicker !text-[var(--gold-soft)]">Key takeaway</p><p className="text-lg md:text-xl font-medium mt-2 leading-relaxed">{children}</p></div> }
function NextStep({page,setPage,label}:{page:Page;setPage:(p:Page)=>void;label:string}){ const i=PAGES.findIndex(p=>p.id===page); const next=PAGES[Math.min(i+1,PAGES.length-1)]; return <div className="nextstep"><div><p className="kicker">Next step</p><p className="font-semibold text-lg">{label}</p></div><button onClick={()=>setPage(next.id)} className="bg-[var(--green)] text-white px-5 py-3 rounded-full font-semibold inline-flex items-center gap-2">Continue <ArrowRight size={18}/></button></div> }
function Pillars(){ return <div className="grid md:grid-cols-3 gap-4 my-8">{[
  {t:"Truth", d:"Verifiable, traceable truth. Competing claims are tested against independent evidence. Uncertainty stays visible.", icon:<Scale/>},
  {t:"Transparency", d:"Visible governance. What was asked, who responded, what conflicted, what was rejected — and why.", icon:<FileText/>},
  {t:"Legacy", d:"Built to outlast the creator. Reasoning, accountability, and continuity are preserved for the next learner.", icon:<Landmark/>},
].map(x=><article key={x.t} className="card p-6"><div className="text-[var(--gold)]">{x.icon}</div><h3 className="text-2xl mt-4">{x.t}</h3><p className="mt-2 text-[var(--ink-2)]">{x.d}</p></article>)}</div> }

function Home({setPage}:{setPage:(p:Page)=>void}){
  const roles=[
    {t:"I am a Learner", d:"Start with agency, GIGO, and multimodal review. Build a portfolio one verifiable record at a time.", target:"curriculum", cta:"Begin Level 1"},
    {t:"I am an Educator", d:"Use the eight modules, demonstration pairs, and seeded-error practice. Teach adjudication, not prompting tricks.", target:"curriculum", cta:"See the curriculum"},
    {t:"I am an Institution", d:"Review the proposed TTL Standard, SCORM + portfolio delivery, and pilot measures before adopting anything.", target:"certification", cta:"Review certification"},
    {t:"I am a Re-entry Program", d:"Start with digital reintegration and continuity: method and portfolio, not only access to a tool.", target:"reentry", cta:"See the re-entry track"},
  ] as const;
  return <div>
    <section className="bg-[var(--green)] text-white rounded-[22px] overflow-hidden">
      <div className="p-6 sm:p-10 lg:p-14 grid lg:grid-cols-[1.25fr_.75fr] gap-10 items-end">
        <div><p className="kicker text-[#e7d6a6]">Sphinx AI Academy for Recovery · Educational Hub</p><h1 className="text-[clamp(2.6rem,6vw,5.2rem)] mt-5 leading-[.98]">Learn to govern<br/><em className="text-[#e7d6a6]">the machine,</em><br/>not merely use it.</h1><p className="mt-6 max-w-[700px] text-lg text-[#e8e4d6]">This hub teaches the Sphinx Method and the TTL Protocol: Truth, Transparency, Legacy. It is for people who want their work to be checked, taught, and trusted — including people returning from incarceration and rebuilding economic life.</p><div className="flex flex-wrap gap-3 mt-8"><button onClick={()=>setPage("method")} className="bg-[#e7d6a6] text-[#173f33] px-6 py-3 rounded-full font-bold">Explore the Method</button><button onClick={()=>setPage("curriculum")} className="border border-white/40 px-6 py-3 rounded-full font-semibold">Explore the curriculum</button></div></div>
        <div className="bg-white/10 border border-white/15 rounded-2xl p-6"><p className="kicker text-[#e7d6a6]">The governing question</p><p className="serif text-2xl leading-snug mt-4">“Can another person check how this was made — and learn from it?”</p><p className="mt-4 text-white/75">If the answer is no, the record is not finished. That is the whole discipline.</p><div className="mt-6 pt-5 border-t border-white/15 text-sm text-white/70">Proposed SGE Standard · v0.2 · Pilot discussion draft<br/>Academy status: In Development / Coming Online Soon</div></div>
      </div>
    </section>
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 mt-10"><div><p className="eyebrow">Who this is for</p><h2 className="text-3xl md:text-4xl mt-3">Four doors. One discipline.</h2><p className="mt-3 text-[var(--ink-2)] text-lg">Choose the pathway closest to your role. The core is the same: human judgment, tested claims, and a record someone else can follow.</p></div><div className="card p-5 self-start"><p className="kicker">At a glance</p><ul className="mt-3 space-y-2 text-sm"><li>• 8 modules + capstone</li><li>• 3 learner levels</li><li>• 4 vertical tracks</li><li>• 1 governing protocol: TTL</li></ul></div></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">{roles.map(r=><article key={r.t} className="card p-6 flex flex-col"><h3 className="text-xl">{r.t}</h3><p className="text-[var(--ink-2)] mt-2 flex-1">{r.d}</p><button onClick={()=>setPage(r.target as Page)} className="mt-5 text-left font-bold inline-flex items-center gap-2 text-[var(--green)]">{r.cta} <ArrowRight size={17}/></button></article>)}</div>
    <Pillars/>
    <div className="card p-6 md:p-8 my-8 grid lg:grid-cols-[1fr_.8fr] gap-8"><div><p className="eyebrow">GIGO, in one line</p><h2 className="text-3xl md:text-4xl mt-3">Garbage In, Garbage Out.<br/>Gold In, Gold Out.</h2><p className="mt-4 text-[var(--ink-2)] text-lg">Output quality is bounded by input quality plus human expertise. It is not a judgment of a person’s worth. Formal education is one factor. Practical expertise, lived experience, and disciplined observation count.</p><button onClick={()=>setPage("ttl")} className="mt-5 bg-[var(--ink)] text-[var(--paper)] px-5 py-3 rounded-full font-semibold">Try the GIGO explorer</button></div><div className="bg-[var(--surface-2)] rounded-xl p-5"><p className="kicker">The spectrum</p><div className="mt-4 space-y-3">{["Question quality","Sources","Models","Interrogation","Verification","Adjudication"].map((x,i)=><div key={x}><div className="flex justify-between text-sm font-semibold"><span>{x}</span><span>{["Starting","Forming","Testing","Strong","Gold"][Math.min(4,i)]}</span></div><div className="h-2 bg-[var(--line)] rounded-full mt-1"><div className="h-2 bg-[var(--gold)] rounded-full" style={{width:`${22+i*15}%`}}/></div></div>)}</div></div></div>
    <section className="my-8"><h2 className="text-3xl">What you will be able to do</h2><div className="grid md:grid-cols-3 gap-4 mt-5">{[["Ask better questions","Frame a question so models must show their reasoning, not only an answer."],["Stage disagreement","Use two or more models to expose conflict instead of hiding it."],["Leave a checkable record","Produce a record a stranger can verify, reproduce, and teach from."]].map(([t,d])=><div key={t} className="card p-6"><CheckCircle2 className="text-[var(--green)]"/><h3 className="text-xl mt-3">{t}</h3><p className="mt-2 text-[var(--ink-2)]">{d}</p></div>)}</div></section>
    <div className="bg-[#fff3cd] border border-[#d8cdb4] rounded-xl p-5 text-sm"><strong>Important label:</strong> SGE Certification is a proposed standard, version 0.2, for pilot discussion. It is not an already-established accredited standard. This hub is an educational draft.</div>
    <Takeaway>TTL is not a nicer audit trail. It is a way of working: a human investigates, decides, and leaves evidence another human can use.</Takeaway>
    <NextStep page="home" setPage={setPage} label="Learn how Sphinx differs from agentic and manual work."/>
  </div>
}

function Method({setPage}:{setPage:(p:Page)=>void}){
  const [scenario,setScenario]=useState(scenarios[0]);
  return <div><SectionHead eyebrow="Page 2 · The Method" title="Governed production, not faster completion" summary="Sphinx governs production prospectively — while the work is being made. The human directs, interrogates, and decides at the gate."/>
  <div className="overflow-x-auto mt-8"><table className="w-full min-w-[720px] text-left border-collapse"><thead><tr className="bg-[var(--green)] text-white"><th className="p-4 rounded-tl-xl">Approach</th><th className="p-4">What it optimizes</th><th className="p-4">Human role</th><th className="p-4 rounded-tr-xl">What survives</th></tr></thead><tbody>{[
    ["Sphinx Method","Governed production","Directs, interrogates, adjudicates","Evidence, conflict, decision, teaching artifact"],
    ["Agentic workflow","Execution + completion","Approves an output","Often only the finished artifact"],
    ["Manual orchestration","Retrospective documentation","Records production after the fact","A description of work already done"],
  ].map((r,i)=><tr key={r[0]} className={i%2?"bg-[var(--surface-2)]":"bg-[var(--surface)]"}>{r.map(c=><td key={c} className="p-4 border-t border-[var(--line)] align-top">{c}</td>)}</tr>)}</tbody></table></div>
  <div className="grid md:grid-cols-3 gap-4 my-8">{[["Council of Five","Five model perspectives are orchestrated to surface variance, not to vote for a winner."],["Variance detection","When models disagree, that disagreement is treated as information — not noise to smooth away."],["Fail-closed governance","If a material claim cannot be verified, it does not pass. The record stops, rather than guessing."],["Human at the gate","No material passage passes without human review, judgment, and a signed reason."],["Traceability","Prompts, outputs, sources, rejections, and decisions remain connected."],["Accountability","A named human is responsible for the final record."]].map(([t,d])=><article key={t} className="card p-5"><ShieldCheck className="text-[var(--gold)]"/><h3 className="text-xl mt-3">{t}</h3><p className="mt-2 text-[var(--ink-2)]">{d}</p></article>)}</div>
  <section className="card p-6 md:p-8"><p className="eyebrow">Interactive · Choose a scenario</p><h2 className="text-3xl mt-3">Same task. Three different records.</h2><div className="flex flex-wrap gap-2 mt-5">{scenarios.map(s=><button key={s.id} onClick={()=>setScenario(s)} className={`pill ${scenario.id===s.id?"bg-[var(--green)] text-white":""}`}>{s.title}</button>)}</div><div className="grid md:grid-cols-3 gap-4 mt-6"><div className="p-5 bg-[var(--surface-2)] rounded-xl"><p className="kicker">Manual</p><p className="mt-3">{scenario.manual}</p></div><div className="p-5 bg-[var(--surface-2)] rounded-xl"><p className="kicker">Agentic</p><p className="mt-3">{scenario.agentic}</p></div><div className="p-5 bg-[var(--green)] text-white rounded-xl"><p className="kicker text-[#e7d6a6]">Sphinx</p><p className="mt-3">{scenario.sphinx}</p></div></div></section>
  <section className="my-10"><h2 className="text-3xl">The human at the gate</h2><div className="flex flex-col md:flex-row items-stretch gap-2 mt-6 text-center">{["Question","Multiple models","Conflict surfaces","Human review","Adjudication","Teachable record"].map((s,i)=><div key={s} className="flex-1"><div className={`p-4 rounded-xl border ${i===3?"bg-[var(--gold)] text-[#17201b] font-bold":"bg-[var(--surface)]"}`}>{s}</div>{i<5&&<ChevronRight className="mx-auto my-1 md:hidden"/>}</div>)}</div><p className="mt-4 text-[var(--ink-2)]">API calls, logs, and traces can support TTL. They cannot by themselves establish it. A log shows that something happened. TTL shows what was asked, what conflicted, what was rejected, and who decided.</p></section>
  <Takeaway>Automation can complete a task. Only a human can take responsibility for whether it is true.</Takeaway><NextStep page="method" setPage={setPage} label="Go deeper on Truth, Transparency, Legacy — and test the GIGO spectrum."/>
  </div>
}

function TTL({setPage}:{setPage:(p:Page)=>void}){
  const [vals,setVals]=useState({Question:55,Sources:45,Models:60,Interrogation:50,Verification:40,Adjudication:50});
  const avg=Math.round(Object.values(vals).reduce((a,b)=>a+b,0)/6);
  const level= avg<30?"Garbage zone":avg<55?"Mixed — fragile":avg<75?"Strong, with gaps":"Gold-leaning";
  const desc= avg<30?"The record looks finished but cannot be checked. Claims rest on weak inputs, hidden disagreement, or missing sources.":avg<55?"Some parts can be checked. The weakest dimension limits the whole record — fix that first.":avg<75?"The process is disciplined. Add one stronger verification step or one more deliberate disagreement to raise the ceiling.":"The record is explicit, checkable, and teachable. Keep the evidence; do not let polish hide uncertainty.";
  const weakest=(Object.entries(vals) as [string,number][]).sort((a,b)=>a[1]-b[1])[0][0];
  return <div><SectionHead eyebrow="Page 3 · TTL + GIGO" title="Truth, Transparency, Legacy — with evidence" summary="TTL is not a label. It is a test: can another person check the claim, follow the process, and learn from the record?" />
  <div className="grid lg:grid-cols-3 gap-4 my-8">{[
    ["Truth","Human investigates competing claims against independent evidence. Uncertainty is preserved. Model agreement is never proof.","Pass: A contested claim has primary-source support and a named limit. Fail: Models agree, but no source is shown."],
    ["Transparency","A human-readable record: what was asked, which models responded, what conflicted, sources consulted, what was rejected and why.","Pass: A stranger can retrace the decision. Fail: Only the final answer survives."],
    ["Legacy","Preserved intellectual development, reasoning, accountability, and historical continuity. A citable, teachable artifact that outlives the session.","Pass: A future learner can use the record. Fail: The insight dies with the chat window."],
  ].map(([t,d,ex])=><article key={t} className="card p-6"><p className="eyebrow">{t}</p><p className="mt-4 text-[var(--ink-2)]">{d}</p><div className="mt-4 bg-[var(--surface-2)] rounded-lg p-4 text-sm">{ex}</div></article>)}</div>
  <section className="card p-6 md:p-8"><div className="flex flex-wrap justify-between gap-4 items-end"><div><p className="eyebrow">Interactive · GIGO Spectrum Explorer</p><h2 className="text-3xl mt-2">Move the process. Watch the output change.</h2><p className="mt-2 text-[var(--ink-2)]">These sliders describe process quality — not personal worth.</p></div><div className="text-right"><p className="text-4xl font-bold serif">{avg}<span className="text-lg"> / 100</span></p><p className="font-bold text-[var(--green)]">{level}</p></div></div>
  <div className="grid md:grid-cols-2 gap-x-8 gap-y-5 mt-7">{(Object.entries(vals) as [string,number][]).map(([k,v])=><label key={k} className="block"><span className="flex justify-between font-semibold"><span>{k}</span><span>{v}</span></span><input className="range" type="range" min="0" max="100" value={v} onChange={e=>setVals({...vals,[k]:Number(e.target.value)})} aria-label={`${k} quality`}/><span className="text-sm text-[var(--muted)]">{v<30?"Weak or missing":v<55?"Partly present":v<75?"Solid": "Strong and documented"}</span></label>)}</div>
  <div className="bg-[var(--surface-2)] rounded-xl p-5 mt-7"><p className="font-bold">What this record would look like</p><p className="mt-2">{desc}</p><p className="mt-3"><strong>Improve first:</strong> {weakest}. Ask one sharper question, find one stronger source, or write one clearer reason for a rejection.</p></div></section>
  <section className="my-10"><h2 className="text-3xl">The Human Orchestrator</h2><p className="mt-3 text-[var(--ink-2)]">The determining variable is not the model. It is the human’s practice across seven capabilities.</p><div className="overflow-x-auto mt-5"><table className="w-full min-w-[680px] text-left"><thead><tr className="bg-[var(--surface-2)]"><th className="p-4">Capability</th><th className="p-4">In a Gold record</th><th className="p-4">In a Garbage record</th></tr></thead><tbody>{[
    ["Subject knowledge","Knows enough to spot a false claim","Accepts confident prose as truth"],
    ["Question formulation","Asks questions that expose assumptions","Asks for a finished answer"],
    ["Critical thinking","Tests alternatives and counter-evidence","Seeks confirmation"],
    ["Source evaluation","Prefers primary sources","Cites a summary of a summary"],
    ["Cross-model orchestration","Stages disagreement on purpose","Uses one model, once"],
    ["Multimodal engagement","Reads, speaks, listens, revises","Skims only the final text"],
    ["Documentation","Records decisions and rejections","Keeps no decision trail"],
  ].map((r,i)=><tr key={r[0]} className={i%2?"bg-[var(--surface)]":"bg-[var(--surface-2)]"}>{r.map(c=><td key={c} className="p-4 border-t border-[var(--line)] align-top">{c}</td>)}</tr>)}</tbody></table></div></section>
  <div className="card p-6"><h3 className="text-2xl">Why multimodal review matters</h3><p className="mt-3 text-[var(--ink-2)]">The orchestrator reviews material passages by reading and listening. Typed prompts, speech-to-text interrogation, and audio playback reveal repetition, hedging, and logical jumps that skimming hides. Agentic flows often lose this through compression, batching, and no embodied review.</p></div>
  <Takeaway>GIGO describes the quality of the process. A person’s starting point is not their ceiling — the objective is movement toward Gold.</Takeaway><NextStep page="ttl" setPage={setPage} label="See the full curriculum built from this method."/>
  </div>
}

function Curriculum({setPage}:{setPage:(p:Page)=>void}){
  const tracker=useChecklist("academy_progress", modules.map(m=>m.id));
  const pct=Math.round((tracker.count/modules.length)*100);
  const [track,setTrack]=useState("Academic Research");
  const caps:Record<string,string>={ "Academic Research":"A source-verified research record with a reproducibility note.","Educator":"A teachable module with guided practice and a TTL rubric.","Professional":"A decision record an organization can audit.","Entrepreneurial":"A business idea tested with verification, not only polished." };
  return <div><SectionHead eyebrow="Page 4 · Curriculum / Academy" title="Eight modules. One portfolio. One discipline." summary="Each module follows the same assessment pattern: concept, demonstration, guided practice, performance task, and self-assessment against the TTL rubric."/>
  <div className="card p-6 md:p-8 my-8"><div className="flex flex-wrap justify-between gap-4"><div><p className="eyebrow">Module progress tracker · Demo</p><h2 className="text-3xl mt-2">Your portfolio checklist</h2><p className="mt-2 text-[var(--ink-2)]">Tick a module when its deliverable is complete. Progress is saved through the hub’s records.</p></div><div className="text-right"><p className="serif text-5xl">{pct}%</p><p className="text-sm text-[var(--muted)]">{tracker.count} of {modules.length} complete</p></div></div><div className="h-3 bg-[var(--line)] rounded-full mt-5 overflow-hidden"><div className="h-3 bg-[var(--gold)] rounded-full transition-all" style={{width:`${pct}%`}}/></div><p className="text-sm mt-3 min-h-[1.25rem]" aria-live="polite">{tracker.status || (tracker.available ? "Progress will save when you tick an item." : "Saving is unavailable in this preview. Your ticks are visible here for this visit.")}</p><div className="mt-3">{modules.map(m=><label key={m.id} className="check-row cursor-pointer"><input type="checkbox" checked={!!tracker.checked[m.id]} onChange={()=>tracker.toggle(m.id)}/><span className="flex-1"><span className="font-bold">{m.id} · {m.title}</span><span className="block text-sm text-[var(--muted)]">{m.level} — Deliverable: {m.deliverable}</span></span></label>)}</div></div>
  <div className="grid lg:grid-cols-3 gap-4">{["Level 1 · Foundational","Level 2 · Practitioner","Level 3 · Adjudicator / Legacy"].map((level,i)=><section key={level} className="card p-6"><p className="eyebrow">{level}</p><h3 className="text-2xl mt-3">{["Learn to direct","Learn to test","Learn to preserve"][i]}</h3><div className="mt-5 space-y-5">{modules.filter(m=>m.level===level).map(m=><article key={m.id}><p className="font-bold">{m.title}</p><p className="text-sm text-[var(--ink-2)] mt-1"><strong>Goal:</strong> {m.goal}</p><p className="text-sm text-[var(--ink-2)]"><strong>TTL:</strong> {m.ttl}</p></article>)}</div></section>)}</div>
  <section className="card p-6 md:p-8 my-8"><p className="eyebrow">Vertical tracks</p><h2 className="text-3xl mt-3">Same core. Different capstone.</h2><div className="flex flex-wrap gap-2 mt-5">{Object.keys(caps).map(t=><button key={t} onClick={()=>setTrack(t)} className={`pill ${track===t?"bg-[var(--green)] text-white":""}`}>{t}</button>)}</div><p className="mt-5 text-lg"><strong>{track} capstone:</strong> {caps[track]}</p></section>
  <section className="my-8"><h2 className="text-3xl">How delivery works</h2><div className="grid md:grid-cols-2 gap-4 mt-5"><div className="card p-6"><BookOpen className="text-[var(--gold)]"/><h3 className="text-xl mt-3">SCORM handles delivery</h3><p className="mt-2 text-[var(--ink-2)]">SCORM 2004 4th Edition, with 1.2 fallback, for Canvas, Blackboard, and Moodle. It handles delivery, completion, and quizzes. Optional xAPI can record listening and revision events.</p></div><div className="card p-6"><FileText className="text-[var(--gold)]"/><h3 className="text-xl mt-3">Portfolio handles TTL</h3><p className="mt-2 text-[var(--ink-2)]">The portfolio holds the real evidence: prompts, outputs, sources, decisions, adjudication, and teaching notes. A quiz score cannot prove a record is truthful.</p></div></div></section>
  <Takeaway>A module is not finished when a video ends. It is finished when the learner leaves a checkable artifact.</Takeaway><NextStep page="curriculum" setPage={setPage} label="Understand the Scarlet Letter F and the re-entry track."/>
  </div>
}

function Reentry({setPage}:{setPage:(p:Page)=>void}){
  return <div><SectionHead eyebrow="Page 5 · Scarlet Letter F + Re-entry" title="F is not only Felon." summary="The manuscript examines stigma, institutional barriers, and the consequences of incarceration. The Academy is one practical intervention — and the two questions must stay separate."/>
  <div className="grid md:grid-cols-3 gap-4 my-8">{[
    ["1 · Imposed","Felon / Felony / Formerly incarcerated","A legal classification and file. It follows a person into applications, checks, and records."],
    ["2 · Systemic","Filing, Flagging, Filtering","Background checks, licensing bars, housing screens, and algorithmic filtering turn a file into repeated exclusion."],
    ["3 · Reclaimed","Founder, Future, Freedom","A full record authored through verifiable work. The person becomes the author of evidence, not only the subject of a file."],
  ].map(([n,t,d])=><article key={t} className="card p-6"><p className="eyebrow">{n}</p><h3 className="text-2xl mt-3">{t}</h3><p className="mt-3 text-[var(--ink-2)]">{d}</p></article>)}</div>
  <section><h2 className="text-3xl">Problems, and the Academy’s response</h2><div className="overflow-x-auto mt-5"><table className="w-full min-w-[680px] text-left"><thead><tr className="bg-[var(--green)] text-white"><th className="p-4">Problem</th><th className="p-4">Academy response</th></tr></thead><tbody>{[
    ["Stigma","Entrepreneurship, legal literacy, self-direction"],
    ["Digital divide","Foundational digital literacy, AI literacy, guided training"],
    ["Loss of economic opportunity","Business planning, marketing, financial literacy, credentials, enterprise development"],
  ].map((r,i)=><tr key={r[0]} className={i%2?"bg-[var(--surface-2)]":"bg-[var(--surface)]"}><td className="p-4 border-t border-[var(--line)] font-semibold">{r[0]}</td><td className="p-4 border-t border-[var(--line)]">{r[1]}</td></tr>)}</tbody></table></div></section>
  <section className="my-10"><h2 className="text-3xl">Re-entry track · Seven phases</h2><ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 list-none">{["Digital Reintegration","AI Foundations","GIGO and Critical Thinking","Sphinx Method and TTL","Entrepreneurial Fundamentals","Enterprise Operations","Applied Capstone"].map((t,i)=><li key={t} className="card p-5"><span className="serif text-4xl text-[var(--gold)]">{i+1}</span><h3 className="text-lg mt-3">{t}</h3></li>)}</ol></section>
  <section className="grid md:grid-cols-2 gap-4"><div className="card p-6"><p className="eyebrow">Stage 1 · Inside</p><h3 className="text-2xl mt-3">Controlled / offline</h3><ul className="mt-4 space-y-2 text-[var(--ink-2)]"><li>• Instructor-led demonstrations</li><li>• Printed exercises</li><li>• Prerecorded audio where permitted</li><li>• Simulated model comparisons</li><li>• Offline materials</li><li>• No assumption of live AI</li></ul></div><div className="card p-6 bg-[var(--green)] text-white"><p className="kicker text-[#e7d6a6]">Stage 2 · After release</p><h3 className="text-2xl mt-3">Supervised live AI</h3><ul className="mt-4 space-y-2 text-white/85"><li>• Speech-to-text interrogation</li><li>• Audio playback review</li><li>• Cross-model orchestration</li><li>• Portfolio building</li></ul><p className="mt-5 pt-4 border-t border-white/20"><strong>Continuity is method + portfolio, not LMS.</strong></p></div></section>
  <div className="card p-6 md:p-8 my-8"><h2 className="text-3xl">The missed epoch</h2><p className="mt-4 text-lg text-[var(--ink-2)]">A person entering custody in 2008 or 2012 can miss the shift from smartphone to AI. That is not a small gap in tools. It is a missed epoch in how information, work, and opportunity are organized. Re-entry education must treat digital reintegration as a continuum — not as one workshop on one chatbot.</p></div>
  <div className="card p-6"><h3 className="text-2xl">Entrepreneurship through TTL</h3><p className="mt-3 text-[var(--ink-2)]">A business idea is tested with verification, not only polished into a plan. What is the claim? What evidence supports it? What was rejected? A learner who can answer those questions has a stronger enterprise — and a record that can be checked.</p><p className="mt-4 text-sm"><strong>Person-first language note:</strong> Use “person returning from incarceration” or “formerly incarcerated person,” not labels that reduce a person to a file.</p></div>
  <div className="bg-[#fff3cd] border border-[#d8cdb4] rounded-xl p-5 my-8 text-sm"><strong>Two separate questions:</strong> (1) The manuscript explains the problem. (2) Academy effectiveness must be proven with learner outcomes and follow-up evidence. Do not treat a compelling explanation as proof of impact.</div>
  <p className="text-[var(--ink-2)]"><strong>For outreach:</strong> correctional education administrators, Maryland workforce agencies, community colleges, and re-entry organizations. Frame this as a continuum of digital reintegration and entrepreneurship education.</p>
  <Takeaway>The goal is not access to a tool. It is the ability to produce verifiable work that opens economic life.</Takeaway><NextStep page="reentry" setPage={setPage} label="Check what SGE Certification would — and would not — certify."/>
  </div>
}

function Certification({setPage}:{setPage:(p:Page)=>void}){
  const list=useChecklist("cert_checklist", certItems.map(i=>i.id));
  const pct=Math.round((list.count/certItems.length)*100);
  const [group,setGroup]=useState("All");
  const shown= group==="All"?certItems:certItems.filter(i=>i.group===group);
  return <div><SectionHead eyebrow="Page 6 · Certification / SGE" title="What SGE certifies is a record — not a person or a tool." summary="Proposed TTL Standard v0.2, for discussion. SGE certifies a specific version of a specific record. That precision is the point."/>
  <div className="bg-[#fff3cd] border border-[#d8cdb4] rounded-xl p-5 my-6 text-sm"><strong>Pilot label:</strong> This is a proposed standard, version 0.2. It is not an already-established accredited standard.</div>
  <section className="grid md:grid-cols-3 gap-4 my-8">{[
    ["TTL-Recorded","The record is preserved with prompts, outputs, and decisions."],
    ["TTL-Verified","The record passes source checks and the mandatory gates."],
    ["TTL-Certified","A stranger reproduces one claim and the human passes an adjudication interview."],
  ].map(([t,d])=><article key={t} className="card p-6"><ShieldCheck className="text-[var(--gold)]"/><h3 className="text-xl mt-3">{t}</h3><p className="mt-2 text-[var(--ink-2)]">{d}</p></article>)}</section>
  <p className="text-[var(--ink-2)]"><strong>Learner track is separate:</strong> Foundational · Practitioner · Adjudicator. A learner level describes capability. A record level describes evidence.</p>
  <section className="card p-6 md:p-8 my-8"><div className="flex flex-wrap justify-between gap-4"><div><p className="eyebrow">Interactive · Evidence checklist</p><h2 className="text-3xl mt-2">Build the certification packet</h2><p className="mt-2 text-[var(--ink-2)]">Tick only what you can show. A tick without evidence is not TTL.</p></div><div className="text-right"><p className="serif text-5xl">{pct}%</p><p className="text-sm">{list.count} of {certItems.length}</p></div></div><div className="flex flex-wrap gap-2 mt-5">{["All","Truth","Transparency","Legacy","GIGO","Human Review"].map(g=><button key={g} onClick={()=>setGroup(g)} className={`pill ${group===g?"bg-[var(--green)] text-white":""}`}>{g}</button>)}</div><p className="text-sm mt-4 min-h-[1.25rem]" aria-live="polite">{list.status || (list.available ? "Checklist progress saves through the hub’s records." : "Saving is unavailable in this preview.")}</p><div>{shown.map(item=><label key={item.id} className="check-row cursor-pointer"><input type="checkbox" checked={!!list.checked[item.id]} onChange={()=>list.toggle(item.id)}/><span className="flex-1"><span className="font-bold">{item.id}</span> <span className="text-xs bg-[var(--surface-2)] px-2 py-1 rounded-full ml-1">{item.group}</span><span className="block text-sm text-[var(--ink-2)] mt-1">Evidence: {item.evidence}</span></span></label>)}</div></section>
  <section className="my-8"><h2 className="text-3xl">Mandatory gates — any missing item is a fail</h2><div className="grid md:grid-cols-2 gap-3 mt-5">{["Missing primary source verification","Missing adjudication memo","Missing full prompts / outputs","Missing decision log","Missing named signature"].map(x=><div key={x} className="card p-5 flex gap-3"><X className="text-red-700 shrink-0"/><strong>{x} = fail</strong></div>)}</div></section>
  <section className="grid lg:grid-cols-2 gap-4"><div className="card p-6"><h3 className="text-2xl">Assessment process</h3><ol className="mt-4 space-y-3 text-[var(--ink-2)]"><li><strong>1 · Submission:</strong> Versioned record + evidence packet.</li><li><strong>2 · Source spot check:</strong> Material claims checked against primary sources.</li><li><strong>3 · Reproducibility test:</strong> A stranger repeats one claim.</li><li><strong>4 · Adjudication interview:</strong> The human defends decisions in their own words.</li><li><strong>5 · Registry:</strong> The certified version is recorded.</li></ol></div><div className="card p-6"><h3 className="text-2xl">What does NOT qualify</h3><ul className="mt-4 space-y-2 text-[var(--ink-2)]"><li>• A polished final answer with no process record</li><li>• Model agreement with no primary source</li><li>• A log file with no human adjudication</li><li>• A certificate for a person, tool, or company</li><li>• A record with hidden uncertainty</li></ul></div></section>
  <section className="card p-6 md:p-8 my-8"><h2 className="text-3xl">Evaluation pilot design</h2><p className="mt-3 text-[var(--ink-2)]">Pilot evaluation should not rely on one measure. Use three separate measures at three moments.</p><div className="grid md:grid-cols-3 gap-4 mt-5"><div className="p-5 bg-[var(--surface-2)] rounded-xl"><p className="kicker">Baseline</p><p className="mt-2">Measure before training.</p></div><div className="p-5 bg-[var(--surface-2)] rounded-xl"><p className="kicker">Post-training</p><p className="mt-2">Measure immediately after.</p></div><div className="p-5 bg-[var(--surface-2)] rounded-xl"><p className="kicker">30-day follow-up</p><p className="mt-2">Measure retention and use.</p></div></div><p className="mt-5"><strong>Three measures:</strong> (1) orchestration skill · (2) domain knowledge · (3) record quality.</p></section>
  <Takeaway>Certification does not say “this person is trustworthy.” It says “this version of this record can be checked.”</Takeaway><NextStep page="research" setPage={setPage} label="Connect this method to the 400-year evidence chain."/>
  </div>
}

function Research({setPage}:{setPage:(p:Page)=>void}){
  const [active,setActive]=useState(0);
  const timeline=[
    ["1452–1493","Papal Bulls / Romanus Pontifex","Early legal and theological instruments used to justify exclusion and appropriation."],
    ["1609–1865","Slavery 1.0","A system of forced labor and legal exclusion, documented through records, law, and testimony."],
    ["1865–present","Reload Mechanism / 13th Amendment exception clause","Formal abolition with an exception clause — the mechanism reloads in new institutional forms."],
    ["1884–1885","Berlin Conference","Governance without consent as a template: decisions about people made without their participation."],
    ["2017–present","Digital Apartheid","Epistemic exclusion by design in LLM training data, researcher demographics, annotation labor, and K-12 deployment."],
  ];
  return <div><SectionHead eyebrow="Page 7 · Research / Evidence" title="Evidence is the Argument." summary="The Academy’s method has a research home. Sphinx Analysis documents epistemic exclusion across a 400+ year evidence chain — and applies the same standards it teaches."/>
  <section className="card p-6 md:p-8 my-8"><p className="eyebrow">Interactive · Evidence chain</p><h2 className="text-3xl mt-3">Five periods. One pattern to test.</h2><div className="flex flex-wrap gap-2 mt-5">{timeline.map((t,i)=><button key={t[0]} onClick={()=>setActive(i)} className={`pill ${active===i?"bg-[var(--green)] text-white":""}`}>{t[0]}</button>)}</div><div className="mt-6 bg-[var(--surface-2)] rounded-xl p-6"><p className="serif text-4xl">{timeline[active][0]}</p><h3 className="text-2xl mt-2">{timeline[active][1]}</h3><p className="mt-3 text-[var(--ink-2)] text-lg">{timeline[active][2]}</p></div><div className="timeline mt-8 space-y-6">{timeline.map((t,i)=><div key={t[0]} className="relative"><span className="dot"/><button onClick={()=>setActive(i)} className="text-left"><strong>{t[0]}</strong> — {t[1]}</button></div>)}</div></section>
  <section className="grid md:grid-cols-2 gap-4"><div className="card p-6"><h3 className="text-2xl">Digital Apartheid thesis</h3><p className="mt-3 text-[var(--ink-2)]">Epistemic exclusion by design: whose knowledge is included, whose labor is used, whose perspective governs deployment — and whose exclusion is treated as normal. The thesis is tested through evidence, not asserted through rhetoric.</p></div><div className="card p-6"><h3 className="text-2xl">Research standards</h3><ul className="mt-3 space-y-2 text-[var(--ink-2)]"><li>• Primary source grounding</li><li>• SPHINX Method validation</li><li>• HOB audit trail</li><li>• Cross-disciplinary scope</li><li>• Documented priority date</li><li>• IP-protected output</li></ul></div></section>
  <section className="my-8"><h2 className="text-3xl">Publications</h2><div className="grid md:grid-cols-2 gap-4 mt-5"><article className="card p-6"><Quote className="text-[var(--gold)]"/><h3 className="text-2xl mt-3">Enemies of the Original Man</h3><p className="mt-2 text-[var(--ink-2)]">Abdullah Hakim Kenneth Basnight<br/>ISBN 979-8-905503-16-0</p></article><article className="card p-6"><BookOpen className="text-[var(--gold)]"/><h3 className="text-2xl mt-3">The Diaspora Debate</h3><p className="mt-2 text-[var(--ink-2)]">Serialized work. Read through the research arm and test its claims against primary sources — that is the method in practice.</p></article></div></section>
  <section className="card p-6 md:p-8 my-8"><p className="eyebrow">TTL in practice · Verification audit lesson</p><h2 className="text-3xl mt-3">Why a marketing page is not a syllabus</h2><p className="mt-4 text-[var(--ink-2)] text-lg">Marketing pages describe intention. A syllabus shows commitments, evidence, dates, and limits. When this hub was checked against the parent sites, dates drifted and claims needed qualification. That is not a failure of the method — it is the reason for it.</p><div className="grid md:grid-cols-3 gap-4 mt-6">{[["Dates drift","Re-check dates against primary records. Do not carry a date forward because it appeared once."],["Marketing ≠ syllabus","Treat a homepage as a claim to verify, not as evidence."],["Negative findings need search","“No evidence found” requires a systematic search — not one missed page."]].map(([t,d])=><div key={t} className="bg-[var(--surface-2)] rounded-xl p-5"><h3 className="text-lg">{t}</h3><p className="mt-2 text-sm text-[var(--ink-2)]">{d}</p></div>)}</div><p className="mt-5 text-sm"><strong>PTCS note:</strong> The PTCS Framework (Post-Traumatic Colonization Syndrome) is a proposed framework. It is <strong>not</strong> a diagnosis currently recognized by DSM.</p></section>
  <div className="grid md:grid-cols-2 gap-4"><a href="https://sphinxglobalenterprisescorp.com" target="_blank" rel="noopener" className="card p-6 flex justify-between items-center hover:border-[var(--gold)]"><span><span className="kicker">Parent company</span><span className="block text-xl font-bold mt-2">SPHINX Global Enterprises Corp.</span><span className="text-sm text-[var(--muted)]">sphinxglobalenterprisescorp.com</span></span><ExternalLink/></a><a href="https://sphinxanalysis.com" target="_blank" rel="noopener" className="card p-6 flex justify-between items-center hover:border-[var(--gold)]"><span><span className="kicker">Research arm</span><span className="block text-xl font-bold mt-2">Sphinx Analysis</span><span className="text-sm text-[var(--muted)]">sphinxanalysis.com</span></span><ExternalLink/></a></div>
  <Takeaway>Do not inherit a claim because it shares your values. Check it, preserve the check, and teach someone else to repeat it.</Takeaway>
  <div className="nextstep"><div><p className="kicker">Next step</p><p className="font-semibold text-lg">Return to Home and choose a pathway.</p></div><button onClick={()=>setPage("home")} className="bg-[var(--green)] text-white px-5 py-3 rounded-full font-semibold inline-flex items-center gap-2">Back to Home <ArrowRight size={18}/></button></div>
  </div>
}

export default function App(){
  const [page,setPage]=useState<Page>("home");
  const [menu,setMenu]=useState(false);
  const [savedNote,setSavedNote]=useState("");
  useEffect(()=>{ window.scrollTo({top:0}); },[page]);
  function go(p:Page){ setPage(p); setMenu(false); }
  const pageContent=useMemo(()=>{
    switch(page){
      case "method": return <Method setPage={go}/>;
      case "ttl": return <TTL setPage={go}/>;
      case "curriculum": return <Curriculum setPage={go}/>;
      case "reentry": return <Reentry setPage={go}/>;
      case "certification": return <Certification setPage={go}/>;
      case "research": return <Research setPage={go}/>;
      default: return <Home setPage={go}/>;
    }
  },[page]);
  return <div data-safe-area-inset-root style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)", minHeight:"100vh", background:"var(--paper)"}} className="overflow-x-clip">
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
    <header data-safe-area-sticky-top style={{top:"var(--safe-area-inset-top)"}} className="sticky z-40 bg-[var(--paper)]/95 backdrop-blur border-b border-[var(--line)]">
      <div className="page-shell flex items-center justify-between gap-4 py-3">
        <button onClick={()=>go("home")} className="flex items-center gap-3 text-left"><span className="w-10 h-10 rounded-full bg-[var(--green)] text-white grid place-items-center serif text-xl">S</span><span><span className="block font-bold leading-none serif text-lg">SPHINX AI ACADEMY</span><span className="block text-[.68rem] tracking-[.16em] uppercase text-[var(--muted)] mt-1">Truth · Transparency · Legacy</span></span></button>
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">{PAGES.map(p=><button key={p.id} onClick={()=>go(p.id)} className={`px-3 py-2 rounded-full text-sm font-semibold ${page===p.id?"bg-[var(--ink)] text-[var(--paper)]":"hover:bg-[var(--surface-2)]"}`}>{p.label}</button>)}</nav>
        <div className="flex items-center gap-2"><span className="hidden xl:inline pill !py-1">Proposed SGE v0.2 · Pilot</span><button className="lg:hidden p-2 border rounded-lg" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button></div>
      </div>
      {menu&&<nav className="lg:hidden border-t border-[var(--line)] px-4 py-3 grid gap-1" aria-label="Mobile">{PAGES.map((p,i)=><button key={p.id} onClick={()=>go(p.id)} className={`text-left px-3 py-3 rounded-lg font-semibold ${page===p.id?"bg-[var(--surface-2)]":""}`}>{i+1}. {p.label}</button>)}</nav>}
    </header>
    <div className="bg-[var(--navy)] text-white"><div className="page-shell py-2 flex flex-wrap gap-x-6 gap-y-1 text-xs"><span>Innovation, Ethics, Economic Sovereignty</span><span>Parent: SPHINX Global Enterprises Corp. · Delaware holding company, est. 2025</span><span>Academy: In Development / Coming Online Soon</span></div></div>
    <main id="main" className="page-shell py-8 md:py-12">{pageContent}</main>
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] mt-6"><div className="page-shell py-10 grid md:grid-cols-3 gap-8">
      <div><p className="serif text-2xl">SPHINX AI Academy for Recovery</p><p className="mt-3 text-[var(--ink-2)]">Transforming recovery into creation — through AI literacy and entrepreneurship for populations historically excluded.</p><p className="mt-4 font-bold">TTL Protocol — Truth, Transparency, Legacy</p></div>
      <nav aria-label="Footer"><p className="kicker">Hub pages</p><div className="grid grid-cols-2 gap-2 mt-4">{PAGES.map(p=><button key={p.id} onClick={()=>go(p.id)} className="text-left text-sm hover:underline">{p.label}</button>)}</div></nav>
      <div><p className="kicker">Official sites</p><a href="https://sphinxglobalenterprisescorp.com" target="_blank" rel="noopener" className="mt-4 flex items-center gap-2 text-sm font-semibold">SPHINX Global Enterprises Corp. <ExternalLink size={15}/></a><a href="https://sphinxanalysis.com" target="_blank" rel="noopener" className="mt-2 flex items-center gap-2 text-sm font-semibold">Sphinx Analysis <ExternalLink size={15}/></a><p className="text-xs text-[var(--muted)] mt-5">Framework suite: SPHINX Method · TTL Protocol · PTCS Framework (proposed, not DSM-recognized) · HOB Block · KAT Score · Digital Apartheid.</p></div>
    </div><div className="border-t border-[var(--line)]"><div className="page-shell py-4 text-xs text-[var(--muted)] flex flex-wrap justify-between gap-2"><span>This Hub is an educational draft for pilot discussion.</span><span>Storage is limited to 1,000 records across the app.</span></div></div></footer>
  </div>
}
