/**
 * Signal Ledger design system: editorial, candid, and accountable.
 * This file intentionally labels all browser-local prototype behavior rather than impersonating live AI, billing, or identity services.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Database,
  FilePenLine,
  FolderOpen,
  Gauge,
  Info,
  LayoutDashboard,
  Lightbulb,
  ListFilter,
  LockKeyhole,
  Menu,
  Megaphone,
  MoreHorizontal,
  MousePointer2,
  PanelsTopLeft,
  PlayCircle,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type PlanId = "free" | "starter" | "professional" | "enterprise";
type WorkspaceUser = { name: string; email: string; plan: PlanId; credits: number; demo?: boolean };
type ContentKind = "Text" | "Image" | "Video";
type ToastKind = "info" | "success" | "warning";
type Toast = { text: string; kind: ToastKind } | null;
type CheckoutStep = "payment" | "review" | "confirmed";
type TimelineEventType = "plan_change" | "checkout" | "credit_usage";
type TimelineEvent = { id: string; occurredAt: number; type: TimelineEventType; title: string; description: string; planId: PlanId; creditDelta: number; creditBalance: number; baseline?: boolean };
type TimelineEventInput = Omit<TimelineEvent, "id" | "occurredAt"> & { occurredAt?: number };

const PLANS: Record<PlanId, { label: string; price: string; credits: number; description: string; features: string[] }> = {
  free: {
    label: "Free", price: "$0", credits: 100, description: "A safe starting point for evaluating the workflow.",
    features: ["100 browser-demo credits", "Local text drafts", "3 campaign records", "Core workspace tools"],
  },
  starter: {
    label: "Starter", price: "$45", credits: 1000, description: "For small teams preparing a provider-connected workspace.",
    features: ["1,000 monthly credits", "Campaign templates", "Audience segments", "Standard reporting"],
  },
  professional: {
    label: "Professional", price: "$800", credits: 10000, description: "For teams that need advanced operations and governance.",
    features: ["10,000 monthly credits", "Approval controls", "Advanced measurement", "Provider integration readiness"],
  },
  enterprise: {
    label: "Enterprise", price: "$3,600", credits: 50000, description: "For multi-team operations and custom integration programs.",
    features: ["50,000 monthly credits", "Workspace governance", "Integration planning", "Priority onboarding"],
  },
};

const PLAN_DETAILS: Record<PlanId, { bestFor: string; workflow: string; review: string; reporting: string; onboarding: string }> = {
  free: {
    bestFor: "Individuals mapping a responsible content workflow.",
    workflow: "Core local workspace with 3 campaign records.",
    review: "Single-workspace review notes.",
    reporting: "Illustrative workspace signals.",
    onboarding: "Self-guided local prototype.",
  },
  starter: {
    bestFor: "Small teams preparing a provider-connected operating model.",
    workflow: "Campaign templates and local audience records.",
    review: "Shared-ready review checkpoints.",
    reporting: "Standard illustrative reporting views.",
    onboarding: "Guided rollout checklist.",
  },
  professional: {
    bestFor: "Marketing operations teams requiring structured governance.",
    workflow: "Advanced campaign and content operating patterns.",
    review: "Approval controls and release readiness.",
    reporting: "Advanced measurement design readiness.",
    onboarding: "Implementation planning session.",
  },
  enterprise: {
    bestFor: "Multi-team organizations planning custom integrations.",
    workflow: "Governed multi-workspace operating model.",
    review: "Custom governance and audit planning.",
    reporting: "Custom data-contract planning.",
    onboarding: "Priority rollout and integration planning.",
  },
};

const PLAN_COMPARISON = [
  { label: "Browser-demo credit allocation", values: ["100", "1,000", "10,000", "50,000"] },
  { label: "Campaign planning", values: ["3 local records", "Templates + local records", "Advanced operating patterns", "Governed multi-workspace model"] },
  { label: "Audience workflow", values: ["Core local segments", "Segment planning", "Approval-ready definitions", "Custom governance planning"] },
  { label: "Content review", values: ["Single-workspace review", "Shared-ready checkpoints", "Structured approvals", "Custom review policy"] },
  { label: "Reporting mode", values: ["Illustrative signals", "Standard illustrations", "Advanced measurement design", "Custom data-contract plan"] },
  { label: "Implementation support", values: ["Self-guided prototype", "Rollout checklist", "Implementation session", "Priority integration planning"] },
] as const;

function createInitialTimeline(user: WorkspaceUser): TimelineEvent[] {
  return [{ id: `baseline-${Date.now()}`, occurredAt: Date.now() - 60_000, type: "plan_change", title: `${PLANS[user.plan].label} allocation established`, description: "Illustrative opening balance for this browser-local activity record. It is not a purchased credit grant or live billing event.", planId: user.plan, creditDelta: user.credits, creditBalance: user.credits, baseline: true }];
}

function formatTimelineTime(occurredAt: number) {
  const elapsed = Math.max(0, Date.now() - occurredAt);
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} min ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(occurredAt);
}

const NAV = [
  { path: "/overview", label: "Overview", icon: LayoutDashboard },
  { path: "/studio", label: "Content studio", icon: WandSparkles },
  { path: "/campaigns", label: "Campaigns", icon: Megaphone },
  { path: "/insights", label: "Insights", icon: Activity },
  { path: "/audiences", label: "Audiences", icon: UsersRound },
  { path: "/library", label: "Content library", icon: FolderOpen },
];

const initialCampaigns = [
  { id: 1, name: "Retention sequence / Northstar", channel: "Email", status: "In review", segment: "High-intent evaluators", budget: "$2,400", progress: 67 },
  { id: 2, name: "Product note / Fall release", channel: "LinkedIn", status: "Draft", segment: "Current customers", budget: "$1,200", progress: 32 },
  { id: 3, name: "Reactivation / Inactive 90d", channel: "Email", status: "Approved", segment: "Dormant accounts", budget: "$900", progress: 84 },
];

function SignalMark({ small = false }: { small?: boolean }) {
  return <img className={small ? "signal-mark signal-mark--small" : "signal-mark"} src="/manus-storage/hyperpersona-signal-mark_59c6863b.png" alt="HyperPersona signal mark" />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function ToastBanner({ toast, dismiss }: { toast: Toast; dismiss: () => void }) {
  if (!toast) return null;
  return <div className={`toast toast--${toast.kind}`} role="status">
    <Info size={16} />
    <span>{toast.text}</span>
    <button onClick={dismiss} aria-label="Dismiss notification"><X size={16} /></button>
  </div>;
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "coral" | "green" | "blue" }) {
  return <span className={`status status--${tone}`}><span className="status-dot" />{children}</span>;
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: React.ElementType }) {
  return <article className="metric-card">
    <div className="metric-card__top"><span>{label}</span><Icon size={18} /></div>
    <strong>{value}</strong>
    <p>{detail}</p>
  </article>;
}

function App() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [library, setLibrary] = useState<{ id: number; title: string; type: ContentKind; summary: string; created: string }[]>([]);
  const [segments, setSegments] = useState([
    { id: 1, name: "High-intent evaluators", rule: "Pricing page + demo page in 14 days", people: 1260, state: "Active" },
    { id: 2, name: "Dormant accounts", rule: "No product event for 90 days", people: 894, state: "Active" },
    { id: 3, name: "New trial teams", rule: "Trial started in last 7 days", people: 472, state: "Active" },
  ]);

  useEffect(() => {
    const saved = window.localStorage.getItem("hyperpersona-prototype-user");
    if (saved) {
      try { const restored = JSON.parse(saved) as WorkspaceUser; setUser(restored); setTimeline(createInitialTimeline(restored)); } catch { window.localStorage.removeItem("hyperpersona-prototype-user"); }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (user) window.localStorage.setItem("hyperpersona-prototype-user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (text: string, kind: ToastKind = "info") => setToast({ text, kind });
  const recordTimeline = (event: TimelineEventInput) => setTimeline(previous => [{ ...event, id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`, occurredAt: event.occurredAt ?? Date.now() }, ...previous].slice(0, 40));
  const changePlan = (plan: PlanId, source: "direct" | "checkout" = "direct") => {
    if (!user) return;
    const current = PLANS[plan];
    const previousPlan = PLANS[user.plan];
    setUser({ ...user, plan, credits: current.credits });
    recordTimeline({ type: "plan_change", title: `${current.label} selected locally`, description: source === "checkout" ? `The mock checkout confirmation updated the browser-local allocation from ${previousPlan.label} to ${current.label}.` : `A direct browser-local plan selection updated the allocation from ${previousPlan.label} to ${current.label}.`, planId: plan, creditDelta: current.credits - user.credits, creditBalance: current.credits });
    notify(`${current.label} is now selected locally. No payment was charged; connect billing before live use.`, "success");
  };
  const enterWorkspace = (next: WorkspaceUser) => { setUser(next); setTimeline(createInitialTimeline(next)); setLocation("/overview"); };
  const logout = () => { window.localStorage.removeItem("hyperpersona-prototype-user"); setUser(null); setTimeline([]); setLocation("/"); notify("Local workspace session cleared."); };

  if (!ready) return <div className="boot"><SignalMark /><span>Loading local workspace…</span></div>;
  if (!user && location === "/access") return <AccessPage onEnter={enterWorkspace} />;
  if (!user && location !== "/access") return <Landing onNavigate={setLocation} />;

  return <Workspace
    location={location}
    setLocation={setLocation}
    user={user!}
    setUser={setUser}
    railOpen={railOpen}
    setRailOpen={setRailOpen}
    toast={toast}
    notify={notify}
    dismissToast={() => setToast(null)}
    logout={logout}
    campaigns={campaigns}
    setCampaigns={setCampaigns}
    library={library}
    setLibrary={setLibrary}
    segments={segments}
    setSegments={setSegments}
    timeline={timeline}
    recordTimeline={recordTimeline}
    changePlan={changePlan}
  />;
}

function Landing({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <div className="public-shell">
    <header className="public-nav">
      <button className="brand" onClick={() => onNavigate("/")}><SignalMark small /><span>HyperPersona</span><em>Content operations</em></button>
      <div className="public-nav__links"><a href="#how">How it works</a><a href="#plans">Plans</a><button className="button button--ink" onClick={() => onNavigate("/access")}>Access workspace <ArrowRight size={15} /></button></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero__copy">
          <Eyebrow>Accountable AI marketing operations</Eyebrow>
          <h1>Personalize the message.<br /><i>Keep the judgment.</i></h1>
          <p>HyperPersona gives your marketing team one place to brief, review, organize, and measure content operations—with transparent usage controls from the first draft.</p>
          <div className="hero__actions"><button className="button button--coral" onClick={() => onNavigate("/access")}>Create local workspace <ArrowRight size={17} /></button><a className="text-link" href="#plans">See plans <ArrowUpRight size={16} /></a></div>
          <p className="microcopy"><LockKeyhole size={13} /> Prototype disclosure: account, plan, and credit data live in this browser only. No payment or AI provider is connected.</p>
        </div>
        <div className="hero__visual"><img src="/manus-storage/hyperpersona-hero-editorial_1beb00b9.png" alt="Editorial illustration of content signals becoming a campaign brief" /><div className="visual-note"><span className="coral-pip" />Signal received<br /><strong>Brief → Review → Release</strong></div></div>
      </section>
      <section className="proof-strip"><div><b>1.</b><span>Write a clear campaign brief</span></div><div><b>2.</b><span>Review each output and assumption</span></div><div><b>3.</b><span>Connect providers when you are ready</span></div></section>
      <section className="capabilities" id="how">
        <div className="section-heading"><Eyebrow>Operating model</Eyebrow><h2>One composed system for content work.</h2><p>Every workspace keeps the line between planning, local prototype behavior, and a real provider-backed operation visible.</p></div>
        <div className="capability-layout">
          <article className="feature feature--wide"><div className="feature__icon"><FilePenLine /></div><h3>Brief before generation</h3><p>Capture the audience, channel, tone, and specific prompt before a draft is made. Local drafts use the exact prompt you write.</p><span>Content studio <ArrowUpRight size={14} /></span></article>
          <article className="feature"><div className="feature__icon"><CircleDollarSign /></div><h3>Credits made legible</h3><p>See the plan, allocation, and prototype status in one clear billing surface.</p></article>
          <article className="feature"><div className="feature__icon"><ShieldCheck /></div><h3>Human review stays central</h3><p>Approval language replaces implied autonomous distribution.</p></article>
          <article className="feature feature--image"><img src="/manus-storage/hyperpersona-audience-map_2cb61926.png" alt="Abstract audience signal map" /><div><Eyebrow>Audience signals</Eyebrow><h3>Organize segments without losing context.</h3></div></article>
        </div>
      </section>
      <section className="plans-section" id="plans">
        <div className="section-heading section-heading--split"><div><Eyebrow>Workspace plans</Eyebrow><h2>Choose the operating scale.</h2></div><p>Plan selection works as a local demonstration in this prototype. Connecting a payment processor is a separate implementation step.</p></div>
        <div className="plan-grid">{(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, plan]) => <article className={`plan-card ${id === "professional" ? "plan-card--featured" : ""}`} key={id}>{id === "professional" && <span className="plan-flag">Most complete workflow</span>}<Eyebrow>{plan.label}</Eyebrow><h3>{plan.price}<small>/mo</small></h3><p>{plan.description}</p><ul>{plan.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul><button className={id === "professional" ? "button button--coral button--full" : "button button--paper button--full"} onClick={() => onNavigate("/access")}>{id === "enterprise" ? "Plan a rollout" : "Choose in workspace"}<ArrowRight size={15} /></button></article>)}</div>
      </section>
      <section className="closing"><div><Eyebrow>Build with control</Eyebrow><h2>Make the next message more considered.</h2></div><button className="button button--ink" onClick={() => onNavigate("/access")}>Open the workspace <ArrowRight size={16} /></button></section>
    </main>
    <footer className="public-footer"><div className="brand"><SignalMark small /><span>HyperPersona</span></div><span>Interactive browser-local prototype · No live billing or AI model calls.</span></footer>
  </div>;
}

function AccessPage({ onEnter }: { onEnter: (u: WorkspaceUser) => void }) {
  const [mode, setMode] = useState<"register" | "sign-in">("register");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); setError(""); if (!email.includes("@") || password.length < 6 || (mode === "register" && name.trim().length < 2)) { setError("Use a valid email, a six-character password, and a display name."); return; } onEnter({ name: mode === "register" ? name.trim() : "Workspace member", email, plan: "free", credits: 100 }); };
  return <div className="access-shell"><div className="access-aside"><button className="brand" onClick={() => window.history.back()}><SignalMark small /><span>HyperPersona</span></button><div><Eyebrow>Browser-local workspace</Eyebrow><h1>Start with a clear record of what is—and is not—live.</h1><p>Registration creates a local workspace record on this device. It does not create a secure production account, charge a card, or connect to generation providers.</p></div><div className="access-checks"><span><Check /> Local profile & preferences</span><span><Check /> Plan & credit demonstration</span><span><Check /> Prompt-aware local text draft</span></div></div><main className="access-form-wrap"><div className="access-form"><div className="form-tabs"><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button><button className={mode === "sign-in" ? "active" : ""} onClick={() => setMode("sign-in")}>Sign in</button></div><h2>{mode === "register" ? "Create a local workspace" : "Return to local workspace"}</h2><p>{mode === "register" ? "You will begin on the Free plan with 100 demonstration credits." : "Enter any valid local credentials to continue the prototype."}</p><form onSubmit={submit}>{mode === "register" && <div className="field"><Label htmlFor="name">Display name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" /></div>}<div className="field"><Label htmlFor="email">Work email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" /></div><div className="field"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></div>{error && <p className="form-error">{error}</p>}<Button type="submit" className="button button--coral button--full">{mode === "register" ? "Create local workspace" : "Open workspace"}<ArrowRight size={16} /></Button></form><div className="form-divider"><span>or</span></div><button className="button button--paper button--full" onClick={() => onEnter({ name: "Demo workspace", email: "demo@local", plan: "starter", credits: 1000, demo: true })}>Enter sample workspace <PlayCircle size={16} /></button><p className="form-note"><Info size={14} /> This prototype does not validate identity. Do not enter a real password.</p></div></main></div>;
}

type WorkspaceProps = { location: string; setLocation: (path: string) => void; user: WorkspaceUser; setUser: React.Dispatch<React.SetStateAction<WorkspaceUser | null>>; railOpen: boolean; setRailOpen: (open: boolean) => void; toast: Toast; notify: (text: string, kind?: ToastKind) => void; dismissToast: () => void; logout: () => void; campaigns: typeof initialCampaigns; setCampaigns: React.Dispatch<React.SetStateAction<typeof initialCampaigns>>; library: { id: number; title: string; type: ContentKind; summary: string; created: string }[]; setLibrary: React.Dispatch<React.SetStateAction<{ id: number; title: string; type: ContentKind; summary: string; created: string }[]>>; segments: { id: number; name: string; rule: string; people: number; state: string }[]; setSegments: React.Dispatch<React.SetStateAction<{ id: number; name: string; rule: string; people: number; state: string }[]>>; timeline: TimelineEvent[]; recordTimeline: (event: TimelineEventInput) => void; changePlan: (p: PlanId, source?: "direct" | "checkout") => void };

function Workspace(props: WorkspaceProps) {
  const page = props.location.replace("/", "") || "overview";
  const titleMap: Record<string, { eyebrow: string; title: string; note: string }> = {
    overview: { eyebrow: "Workspace overview", title: "Your content operating desk.", note: "Illustrative workspace data — not measured production performance." },
    studio: { eyebrow: "Content studio", title: "Start with the specific message.", note: "Local draft mode is active; no model calls will be made." },
    campaigns: { eyebrow: "Campaign register", title: "A record for every release.", note: "Campaigns remain local to this browser until connected to a delivery service." },
    insights: { eyebrow: "Performance notebook", title: "Read the signal, then decide.", note: "Charts below are illustrative examples, not live analytics." },
    audiences: { eyebrow: "Audience ledger", title: "Segments with their context intact.", note: "Audience records are browser-local examples only." },
    library: { eyebrow: "Content library", title: "Keep drafts close to their brief.", note: "Saved items live locally in this demo session." },
    plans: { eyebrow: "Plans & credits", title: "Usage without ambiguity.", note: "Plan selection is a visual prototype. No card is charged." },
    settings: { eyebrow: "Workspace settings", title: "Control the operating rules.", note: "These settings save only in this browser." },
  };
  const meta = titleMap[page] || titleMap.overview;
  return <div className="app-shell">
    <aside className={`rail ${props.railOpen ? "rail--open" : ""}`}><div className="rail__top"><button className="brand" onClick={() => props.setLocation("/overview")}><SignalMark small /><span>HyperPersona</span></button><button className="rail__close" onClick={() => props.setRailOpen(false)}><X size={18} /></button></div><nav>{NAV.map(item => { const Icon = item.icon; const active = props.location === item.path; return <button key={item.path} onClick={() => { props.setLocation(item.path); props.setRailOpen(false); }} className={`nav-item ${active ? "nav-item--active" : ""}`}><Icon size={17} /><span>{item.label}</span></button>; })}</nav><div className="rail__divider" /><p className="rail__label">Workspace</p><nav><button onClick={() => props.setLocation("/plans")} className={`nav-item ${page === "plans" ? "nav-item--active" : ""}`}><CreditCard size={17} /><span>Plans & credits</span></button><button onClick={() => props.setLocation("/settings")} className={`nav-item ${page === "settings" ? "nav-item--active" : ""}`}><Settings2 size={17} /><span>Settings</span></button></nav><div className="rail__plan"><span><span className="coral-pip" />{PLANS[props.user.plan].label} plan</span><strong>{props.user.credits.toLocaleString()} <small>credits</small></strong><button onClick={() => props.setLocation("/plans")}>View allocation <ArrowRight size={13} /></button></div><button className="rail__user" onClick={props.logout}><span className="avatar">{props.user.name.slice(0, 1).toUpperCase()}</span><span><b>{props.user.name}</b><small>{props.user.email}</small></span><MoreHorizontal size={17} /></button></aside>
    {props.railOpen && <button className="rail-backdrop" onClick={() => props.setRailOpen(false)} aria-label="Close navigation" />}
    <main className="workspace"><header className="workspace-header"><button className="mobile-menu" onClick={() => props.setRailOpen(true)}><Menu size={19} /></button><div><Eyebrow>{meta.eyebrow}</Eyebrow><h1>{meta.title}</h1></div><div className="header-actions"><button className="notification-button" onClick={() => props.notify("There are no new workspace notifications.")}><Bell size={18} /><span /></button><button className="avatar avatar--button" onClick={() => props.setLocation("/settings")}>{props.user.name.slice(0, 1).toUpperCase()}</button></div></header><div className="prototype-banner"><Info size={15} /><span>{meta.note}</span><button onClick={() => props.setLocation("/settings")}>Prototype details <ArrowRight size={14} /></button></div><section className="workspace-content">{page === "overview" && <Overview {...props} />}{page === "studio" && <Studio {...props} />}{page === "campaigns" && <Campaigns {...props} />}{page === "insights" && <Insights />}{page === "audiences" && <Audiences {...props} />}{page === "library" && <Library {...props} />}{page === "plans" && <Plans {...props} />}{page === "settings" && <Settings {...props} />}</section></main><ToastBanner toast={props.toast} dismiss={props.dismissToast} /></div>;
}

function Overview({ user, setLocation, campaigns, library, segments }: WorkspaceProps) {
  const plan = PLANS[user.plan];
  return <><section className="overview-top"><div className="welcome-card"><Eyebrow>Today’s focus</Eyebrow><h2>Make the next campaign brief specific enough to review.</h2><p>Use the studio to build a prompt with an audience, channel, and tone. In this prototype, text drafts are visibly local and provider-free.</p><button className="button button--coral" onClick={() => setLocation("/studio")}>Open content studio <ArrowRight size={16} /></button><div className="welcome-card__rule"><span>01</span><p>Define the message <b>before</b> choosing the format.</p></div></div><div className="signal-panel"><div className="signal-panel__header"><span>Workspace signal</span><StatusPill tone="green">Healthy setup</StatusPill></div><div className="signal-orbit"><div><strong>{user.credits.toLocaleString()}</strong><span>local credits</span></div></div><div className="signal-list"><span><i className="dot dot--coral" />Plan configured</span><span><i className="dot dot--blue" />{segments.length} audience segments</span><span><i className="dot dot--ink" />{campaigns.length} campaign records</span></div></div></section><section className="metric-grid"><Metric label="Credits available" value={user.credits.toLocaleString()} detail={`${plan.label} browser-demo allocation`} icon={Zap} /><Metric label="Campaign records" value={`${campaigns.length}`} detail="Local planning workspace" icon={Megaphone} /><Metric label="Saved content" value={`${library.length}`} detail="Prompt-aware local drafts" icon={BookOpen} /><Metric label="Audience segments" value={`${segments.length}`} detail="Illustrative local records" icon={UsersRound} /></section><section className="split-section"><article className="panel panel--tall"><div className="panel__heading"><div><Eyebrow>Next actions</Eyebrow><h2>Keep the workflow honest.</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="action-list"><button onClick={() => setLocation("/studio")}><span className="action-number">01</span><span><b>Write a content brief</b><small>Use a specific prompt in local draft mode.</small></span><ArrowUpRight size={17} /></button><button onClick={() => setLocation("/audiences")}><span className="action-number">02</span><span><b>Check the audience definition</b><small>Confirm the behavioral rule before use.</small></span><ArrowUpRight size={17} /></button><button onClick={() => setLocation("/plans")}><span className="action-number">03</span><span><b>Review plan assumptions</b><small>Local plan changes never charge a card.</small></span><ArrowUpRight size={17} /></button></div></article><article className="panel panel--image"><img src="/manus-storage/hyperpersona-content-studio_b90b9bfe.png" alt="Editorial content studio tools" /><div className="panel--image__caption"><Eyebrow>Studio discipline</Eyebrow><h2>Context makes content reviewable.</h2><p>Keep prompts, channel choices, and intended audiences together in one work record.</p><button className="text-link" onClick={() => setLocation("/studio")}>Start a brief <ArrowRight size={15} /></button></div></article></section></>;
}

function Studio({ user, setUser, notify, setLibrary, setLocation, recordTimeline }: WorkspaceProps) {
  const [kind, setKind] = useState<ContentKind>("Text"); const [audience, setAudience] = useState("High-intent evaluators"); const [channel, setChannel] = useState("Email"); const [tone, setTone] = useState("Measured and helpful"); const [prompt, setPrompt] = useState(""); const [draft, setDraft] = useState<{ title: string; body: string; type: ContentKind } | null>(null);
  const createDraft = () => {
    if (!prompt.trim()) { notify("Add the specific content prompt before creating a draft.", "warning"); return; }
    if (kind !== "Text") { setDraft({ title: `${kind} request recorded`, body: `Your exact request is recorded: “${prompt.trim()}”\n\nNo ${kind.toLowerCase()} provider is connected in this browser-local prototype, so no media asset is generated and no credit is charged. Connect an approved provider through a secure server-side integration before enabling live ${kind.toLowerCase()} creation.`, type: kind }); notify(`No ${kind.toLowerCase()} was generated. The request was recorded without a provider call or credit charge.`, "warning"); return; }
    if (user.credits < 3) { notify("This browser-local allocation needs at least three demonstration credits for a text draft. Change the local plan to continue.", "warning"); return; }
    const headline = prompt.trim().replace(/[.?!]+$/, "");
    const body = `Subject: ${headline}\n\nFor ${audience}:\n\n${headline}.\n\nThis local draft preserves your exact prompt as its central message and frames it for ${channel.toLowerCase()} in a ${tone.toLowerCase()} voice. Before publishing, review the claim, add approved product details, and verify the audience context.\n\nNext step: invite the reader to review the relevant product or campaign detail.`;
    const nextBalance = user.credits - 3;
    setDraft({ title: headline, body, type: kind }); setUser({ ...user, credits: nextBalance }); recordTimeline({ type: "credit_usage", title: "Local text draft created", description: `Three demonstration credits were used for a prompt-aware local text draft for ${audience}. No model provider was called.`, planId: user.plan, creditDelta: -3, creditBalance: nextBalance }); notify("A local text draft was created using your exact prompt. Three demonstration credits were reduced locally.", "success");
  };
  const saveDraft = () => { if (!draft) return; setLibrary(prev => [{ id: Date.now(), title: draft.title, type: draft.type, summary: draft.body.slice(0, 126), created: "Just now" }, ...prev]); notify("Draft saved to the browser-local content library.", "success"); setLocation("/library"); };
  return <div className="studio-layout"><section className="studio-form panel"><div className="panel__heading"><div><Eyebrow>Brief builder</Eyebrow><h2>Set the parameters.</h2></div><StatusPill tone="coral">Local mode</StatusPill></div><div className="field"><Label>Content type</Label><div className="segmented">{(["Text", "Image", "Video"] as ContentKind[]).map(value => <button key={value} className={kind === value ? "selected" : ""} onClick={() => setKind(value)}>{value === "Text" ? <FilePenLine size={15} /> : value === "Image" ? <PanelsTopLeft size={15} /> : <PlayCircle size={15} />}{value}</button>)}</div></div><div className="form-row"><div className="field"><Label htmlFor="audience">Audience</Label><select id="audience" value={audience} onChange={e => setAudience(e.target.value)}><option>High-intent evaluators</option><option>Current customers</option><option>Dormant accounts</option><option>New trial teams</option></select></div><div className="field"><Label htmlFor="channel">Channel</Label><select id="channel" value={channel} onChange={e => setChannel(e.target.value)}><option>Email</option><option>LinkedIn</option><option>Landing page</option><option>In-app message</option></select></div></div><div className="field"><Label htmlFor="tone">Tone & style</Label><select id="tone" value={tone} onChange={e => setTone(e.target.value)}><option>Measured and helpful</option><option>Direct and technical</option><option>Warm and concise</option><option>Confident and practical</option></select></div><div className="field"><Label htmlFor="prompt">Content prompt <span className="required">Required</span></Label><Textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Write the exact message you want the draft to center. Example: Introduce our usage dashboard to trial teams who have not invited a teammate." rows={7} /><p className="field-help">This input is not ignored: text drafts reuse your exact prompt. Image and video requests are recorded only until a real provider is connected.</p></div><div className="field"><Label htmlFor="brand">Brand guidance <span>Optional</span></Label><Textarea id="brand" placeholder="Approved phrases, voice constraints, or things to avoid…" rows={3} /></div><button className="button button--coral button--full" onClick={createDraft}>{kind === "Text" ? "Create local text draft" : `Record ${kind.toLowerCase()} request`}<ArrowRight size={16} /></button><p className="form-note"><Info size={14} /> Text draft: 3 local demonstration credits. Media requests: 0 credits without a connected provider.</p></section><section className="draft-panel"><div className="draft-panel__heading"><div><Eyebrow>Output preview</Eyebrow><h2>{draft ? "Review the result." : "The prompt will appear here."}</h2></div>{draft && <div className="draft-actions"><button className="icon-button" onClick={() => navigator.clipboard?.writeText(draft.body).then(() => notify("Draft copied to clipboard.", "success"))}><Copy size={17} /></button><button className="button button--paper" onClick={saveDraft}>Save draft</button></div>}</div>{draft ? <article className={`draft-result draft-result--${draft.type.toLowerCase()}`}><div className="draft-result__meta"><StatusPill tone={draft.type === "Text" ? "green" : "coral"}>{draft.type === "Text" ? "Local text draft" : "Provider required"}</StatusPill><span>{draft.type === "Text" ? "Prompt-aware prototype" : "No generation request sent"}</span></div><h3>{draft.title}</h3><pre>{draft.body}</pre></article> : <div className="draft-empty"><WandSparkles size={29} /><h3>No draft yet.</h3><p>Complete the brief at left. The preview will state exactly whether it produced a local text draft or merely recorded a provider-required media request.</p></div>}<aside className="notice-card"><Lightbulb size={17} /><div><b>Before live generation</b><p>Connect authentication, server-side model keys, moderation, consent controls, and billing before allowing customer-facing or paid content operations.</p></div></aside></section></div>;
}

function Campaigns({ campaigns, setCampaigns, notify }: WorkspaceProps) {
  const [showCreate, setShowCreate] = useState(false); const [name, setName] = useState(""); const [channel, setChannel] = useState("Email");
  const addCampaign = () => { if (!name.trim()) { notify("Give the campaign a working name first.", "warning"); return; } setCampaigns(prev => [{ id: Date.now(), name: name.trim(), channel, status: "Draft", segment: "Not assigned", budget: "Not set", progress: 0 }, ...prev]); setName(""); setShowCreate(false); notify("Campaign record added locally. Nothing has been scheduled or distributed.", "success"); };
  return <><section className="page-toolbar"><div className="toolbar-note"><Target size={17} /><span>{campaigns.length} local campaign records</span></div><button className="button button--coral" onClick={() => setShowCreate(true)}><Plus size={16} />New campaign</button></section>{showCreate && <section className="inline-form panel"><div><Eyebrow>New local campaign</Eyebrow><h2>Start a campaign record.</h2></div><div className="inline-form__fields"><div className="field"><Label>Campaign name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Retention sequence / Q4" /></div><div className="field"><Label>Primary channel</Label><select value={channel} onChange={e => setChannel(e.target.value)}><option>Email</option><option>LinkedIn</option><option>Landing page</option><option>In-app message</option></select></div><button className="button button--ink" onClick={addCampaign}>Add record</button><button className="button button--quiet" onClick={() => setShowCreate(false)}>Cancel</button></div></section>}<section className="campaign-table panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Filter local campaign records" /></div><button className="button button--paper"><ListFilter size={15} />Filter</button></div><div className="table-head"><span>Campaign</span><span>Channel</span><span>Audience</span><span>Status</span><span>Readiness</span><span /></div>{campaigns.map(c => <div className="campaign-row" key={c.id}><div><b>{c.name}</b><small>Budget note: {c.budget}</small></div><span>{c.channel}</span><span>{c.segment}</span><StatusPill tone={c.status === "Approved" ? "green" : c.status === "Draft" ? "coral" : "blue"}>{c.status}</StatusPill><div className="readiness"><span><i style={{ width: `${c.progress}%` }} /></span><b>{c.progress}%</b></div><button className="icon-button" onClick={() => notify(`Campaign “${c.name}” is a local planning record; no delivery is configured.`)}><MoreHorizontal size={18} /></button></div>)}</section><section className="campaign-footnote"><Info size={16} /><p><b>Distribution guardrail:</b> this prototype cannot send email, post to social channels, or collect customer data. Those workflows require consent, provider accounts, secure server-side credentials, and review controls.</p></section></>;
}

function Insights() { const values = [36, 48, 43, 61, 54, 68, 76, 71, 83, 88, 79, 95]; return <><section className="metric-grid"><Metric label="Illustrative reach" value="28.4k" detail="Sample reporting value" icon={MousePointer2} /><Metric label="Illustrative CTR" value="4.8%" detail="Sample reporting value" icon={Gauge} /><Metric label="Illustrative conversion" value="2.6%" detail="Sample reporting value" icon={Target} /><Metric label="Review queue" value="5" detail="Local workflow example" icon={Clock3} /></section><section className="insight-layout"><article className="panel chart-panel"><div className="panel__heading"><div><Eyebrow>Illustrative trend</Eyebrow><h2>Campaign response index</h2></div><select><option>Last 12 periods</option><option>Last 30 days</option></select></div><div className="chart-legend"><span><i />Local example data</span><span>Not connected to analytics</span></div><div className="bar-chart">{values.map((v, i) => <div key={i}><span style={{ height: `${v}%` }} /><small>{i + 1}</small></div>)}</div></article><article className="panel"><Eyebrow>Read before action</Eyebrow><h2>What this screen does not claim.</h2><div className="insight-notes"><div><BadgeCheck /><p><b>No live attribution</b><span>There is no tag, warehouse, CRM, or analytics connection in this prototype.</span></p></div><div><BadgeCheck /><p><b>No predictive scoring</b><span>Scores are not inferred from real customer behavior or model output.</span></p></div><div><BadgeCheck /><p><b>Ready for a data contract</b><span>Production reporting begins with explicit sources, permissions, and definitions.</span></p></div></div></article></section></> }

function Audiences({ segments, setSegments, notify }: WorkspaceProps) { const [name, setName] = useState(""); const [rule, setRule] = useState(""); const add = () => { if (!name || !rule) { notify("Name the segment and describe the rule.", "warning"); return; } setSegments(prev => [{ id: Date.now(), name, rule, people: 0, state: "Draft" }, ...prev]); setName(""); setRule(""); notify("Audience segment saved locally. It does not query customer data.", "success"); }; return <><section className="audience-hero panel"><div><Eyebrow>Segment context</Eyebrow><h2>Rules before reach.</h2><p>Use explicit, reviewable definitions. This prototype does not scrape browsing histories, ingest customer data, or attach location signals.</p></div><img src="/manus-storage/hyperpersona-audience-map_2cb61926.png" alt="Abstract conceptual audience signal map" /></section><section className="segment-builder panel"><div><Eyebrow>New local segment</Eyebrow><h2>Write an audience rule.</h2></div><div className="segment-builder__controls"><div className="field"><Label>Segment name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Returning trial users" /></div><div className="field field--wide"><Label>Rule in plain language</Label><Input value={rule} onChange={e => setRule(e.target.value)} placeholder="e.g. Trial started in last 14 days and no teammate invited" /></div><button className="button button--coral" onClick={add}><Plus size={16} />Save local segment</button></div></section><section className="segment-grid">{segments.map(s => <article className="segment-card" key={s.id}><div><StatusPill tone={s.state === "Active" ? "green" : "coral"}>{s.state}</StatusPill><button className="icon-button" onClick={() => notify("Segment editing is deliberately limited to local prototype records.")}><MoreHorizontal size={17} /></button></div><h3>{s.name}</h3><p>{s.rule}</p><footer><span><UsersRound size={15} />{s.people.toLocaleString()} <small>illustrative people</small></span><ArrowUpRight size={16} /></footer></article>)}</section></> }

function Library({ library, setLocation, notify }: WorkspaceProps) { return <>{library.length === 0 ? <section className="library-empty panel"><BookOpen size={30} /><Eyebrow>Local library</Eyebrow><h2>No saved drafts yet.</h2><p>Content made in the studio can be saved here with its type and prompt-aware summary.</p><button className="button button--coral" onClick={() => setLocation("/studio")}>Open content studio <ArrowRight size={16} /></button></section> : <section className="library-grid">{library.map(item => <article className="library-card" key={item.id}><div className="library-card__top"><StatusPill tone={item.type === "Text" ? "green" : "coral"}>{item.type}</StatusPill><button className="icon-button" onClick={() => notify("This local library item can be reviewed, copied, or removed after a production storage system is connected.")}><MoreHorizontal size={18} /></button></div><h2>{item.title}</h2><p>{item.summary}…</p><footer><span>Saved {item.created}</span><ArrowUpRight size={16} /></footer></article>)}</section>}<section className="library-notice"><Database size={16} /><p><b>Storage boundary:</b> these items are kept only for the current browser-local prototype session. A production content library needs protected storage, access control, retention, and audit rules.</p></section></> }

function AllocationTimeline({ user, timeline }: Pick<WorkspaceProps, "user" | "timeline">) {
  const labels: Record<TimelineEventType, string> = { plan_change: "Plan update", checkout: "Mock checkout", credit_usage: "Credit usage" };
  const tones: Record<TimelineEventType, "coral" | "blue" | "green"> = { plan_change: "coral", checkout: "blue", credit_usage: "green" };
  const icons: Record<TimelineEventType, React.ElementType> = { plan_change: CreditCard, checkout: ShieldCheck, credit_usage: Zap };
  return <section className="allocation-timeline panel" aria-labelledby="allocation-timeline-title"><header className="allocation-timeline__header"><div><Eyebrow>Allocation change record</Eyebrow><h2 id="allocation-timeline-title">Every local movement, in context.</h2><p>Plan changes, mock checkout confirmations, and credited text drafts appear here while this browser session is open.</p></div><div className="allocation-timeline__balance"><span>Current local balance</span><strong>{user.credits.toLocaleString()}</strong><small>{PLANS[user.plan].label} allocation</small></div></header><div className="allocation-timeline__boundary"><Info size={16} /><p><b>Prototype activity only.</b> Times use this device and entries are held in browser memory for the active session. They are not invoices, provider logs, or a live billing ledger.</p></div><ol className="timeline-events">{timeline.map(event => { const Icon = icons[event.type]; const delta = event.creditDelta === 0 ? "No credit movement" : `${event.creditDelta > 0 ? "+" : "−"}${Math.abs(event.creditDelta).toLocaleString()} credits`; return <li className={`timeline-event timeline-event--${event.type}`} key={event.id}><div className="timeline-event__marker"><Icon size={15} /></div><article><div className="timeline-event__top"><div><StatusPill tone={event.baseline ? "blue" : tones[event.type]}>{event.baseline ? "Illustrative baseline" : labels[event.type]}</StatusPill><span>{formatTimelineTime(event.occurredAt)}</span></div><strong>{delta}</strong></div><h3>{event.title}</h3><p>{event.description}</p><footer><span>{PLANS[event.planId].label} context</span><b>Balance after: {event.creditBalance.toLocaleString()} credits</b></footer></article></li>; })}</ol></section>;
}

function Plans({ user, changePlan, setLocation, timeline, recordTimeline }: WorkspaceProps) {
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);
  const choosePlan = (id: PlanId) => {
    if (id === "free") { changePlan(id); return; }
    setCheckoutPlan(id);
  };
  return <>
    <section className="billing-hero">
      <div><Eyebrow>Current workspace allocation</Eyebrow><h2>{PLANS[user.plan].label} <span>·</span> {user.credits.toLocaleString()} credits</h2><p>Changing a plan here updates only this browser-local demonstration. It never opens a checkout, charges a card, or commits a subscription.</p></div>
      <div className="billing-hero__icon"><CreditCard size={29} /></div>
    </section>
    <AllocationTimeline user={user} timeline={timeline} />
    <section className="plan-intro">
      <div><Eyebrow>Tier comparison</Eyebrow><h2>Choose the operating depth, not just the credit count.</h2></div>
      <p>Hover or focus a tier to bring its operating model forward. Every value below describes prototype planning scope; no provider, payment, or entitlement is activated by selection.</p>
    </section>
    <section className="plan-grid plan-grid--app plan-grid--detailed">
      {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, plan]) => {
        const detail = PLAN_DETAILS[id];
        const isSelected = user.plan === id;
        return <article className={`plan-card plan-card--interactive ${isSelected ? "plan-card--selected" : ""} ${id === "professional" ? "plan-card--recommended" : ""}`} key={id} tabIndex={0}>
          {isSelected && <span className="plan-flag">Selected locally</span>}
          {!isSelected && id === "professional" && <span className="plan-flag">Recommended for governance</span>}
          <div className="plan-card__heading"><Eyebrow>{plan.label}</Eyebrow><span className="plan-card__tier">{id === "free" ? "Explore" : id === "starter" ? "Prepare" : id === "professional" ? "Operate" : "Scale"}</span></div>
          <h3>{plan.price}<small>/mo</small></h3>
          <p className="plan-card__description">{plan.description}</p>
          <div className="plan-card__credit"><Zap size={15} /><span><b>{plan.credits.toLocaleString()}</b> browser-demo credits</span></div>
          <div className="plan-card__detail"><span>Best for</span><p>{detail.bestFor}</p></div>
          <ul>{plan.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul>
          <div className="plan-card__reveal" aria-label={`${plan.label} additional feature details`}>
            <div><span>Workflow</span><b>{detail.workflow}</b></div>
            <div><span>Review</span><b>{detail.review}</b></div>
            <div><span>Reporting</span><b>{detail.reporting}</b></div>
            <div><span>Support</span><b>{detail.onboarding}</b></div>
          </div>
          <button className={isSelected ? "button button--quiet button--full" : id === "professional" ? "button button--coral button--full" : "button button--paper button--full"} disabled={isSelected} onClick={() => choosePlan(id)}>{isSelected ? "Current local plan" : id === "free" ? "Switch to Free" : "Continue to mock checkout"}<ArrowRight size={15} /></button>
        </article>;
      })}
    </section>
    <section className="comparison-panel panel">
      <div className="comparison-panel__heading"><div><Eyebrow>At-a-glance comparison</Eyebrow><h2>What changes across the tiers.</h2></div><p>These rows are transparent planning descriptions for this browser-local prototype, not a live service-level agreement.</p></div>
      <div className="comparison-table" role="region" aria-label="Plan feature comparison" tabIndex={0}>
        <div className="comparison-table__head"><span>Capability</span>{(Object.keys(PLANS) as PlanId[]).map(id => <span key={id}>{PLANS[id].label}</span>)}</div>
        {PLAN_COMPARISON.map(row => <div className="comparison-table__row" key={row.label}><span>{row.label}</span>{row.values.map((value, index) => <span key={`${row.label}-${index}`}><Check size={13} />{value}</span>)}</div>)}
      </div>
    </section>
    <section className="payment-boundary panel"><div><ShieldCheck size={21} /><div><Eyebrow>Payment boundary</Eyebrow><h2>Billing is not configured.</h2><p>The checkout preview uses only fixed demonstration information. It does not request, validate, retain, or transmit card data; plan activation updates this browser-local workspace only.</p></div></div><button className="button button--ink" onClick={() => setCheckoutPlan("professional")}>Preview mock checkout <ArrowRight size={16} /></button></section>
    {checkoutPlan && <MockCheckout planId={checkoutPlan} user={user} onClose={() => setCheckoutPlan(null)} onComplete={(method) => { recordTimeline({ type: "checkout", title: "Mock checkout confirmation recorded", description: `The ${PLANS[checkoutPlan].label} test checkout was confirmed with ${method}. No payment data was collected or transmitted.`, planId: checkoutPlan, creditDelta: 0, creditBalance: PLANS[checkoutPlan].credits }); changePlan(checkoutPlan, "checkout"); }} onReturn={() => setLocation("/overview")} />}
  </>;
}

function MockCheckout({ planId, user, onClose, onComplete, onReturn }: { planId: PlanId; user: WorkspaceUser; onClose: () => void; onComplete: (method: string) => void; onReturn: () => void }) {
  const [step, setStep] = useState<CheckoutStep>("payment");
  const [method, setMethod] = useState<"card" | "invoice">("card");
  const plan = PLANS[planId];
  const planDetail = PLAN_DETAILS[planId];
  const methodLabel = method === "card" ? "Test card •••• 4242" : "Invoice preview";
  const activate = () => { onComplete(methodLabel); setStep("confirmed"); };
  return <div className="checkout-overlay" role="presentation">
    <section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header className="checkout-dialog__header">
        <div><Eyebrow>Browser-local checkout preview</Eyebrow><h2 id="checkout-title">{step === "confirmed" ? "Local plan updated." : `Prepare ${plan.label}.`}</h2></div>
        {step !== "confirmed" && <button className="icon-button" onClick={onClose} aria-label="Close mock checkout"><X size={18} /></button>}
      </header>
      {step !== "confirmed" && <div className="checkout-steps" aria-label="Checkout progress"><span className={step === "payment" ? "active" : "complete"}>1 <b>Payment preview</b></span><span className={step === "review" ? "active" : ""}>2 <b>Review</b></span><span>3 <b>Confirmation</b></span></div>}
      {step === "payment" && <div className="checkout-body">
        <div className="checkout-notice"><LockKeyhole size={16} /><p><b>No payment details are collected.</b> This UI uses fixed test methods only and sends nothing to a payment processor.</p></div>
        <div className="checkout-summary"><span>Selected local plan</span><strong>{plan.label}</strong><b>{plan.price}<small>/mo</small></b><p>{plan.credits.toLocaleString()} browser-demo credits after confirmation</p></div>
        <div className="checkout-methods"><span className="checkout-label">Choose a test payment preview</span><button className={`checkout-method ${method === "card" ? "selected" : ""}`} onClick={() => setMethod("card")}><CreditCard size={18} /><span><b>Test card •••• 4242</b><small>Fixed non-chargeable demo method</small></span><Check size={16} /></button><button className={`checkout-method ${method === "invoice" ? "selected" : ""}`} onClick={() => setMethod("invoice")}><FilePenLine size={18} /><span><b>Invoice preview</b><small>Fixed demonstration invoice flow</small></span><Check size={16} /></button></div>
        <div className="checkout-account"><span>Workspace contact</span><b>{user.name}</b><small>{user.email}</small></div>
        <footer className="checkout-actions"><button className="button button--paper" onClick={onClose}>Cancel</button><button className="button button--coral" onClick={() => setStep("review")}>Review mock order <ArrowRight size={16} /></button></footer>
      </div>}
      {step === "review" && <div className="checkout-body">
        <div className="checkout-review"><Eyebrow>Review local change</Eyebrow><h3>{plan.label} workspace allocation</h3><div><span>Mock payment method</span><b>{methodLabel}</b></div><div><span>Plan price</span><b>{plan.price}/mo</b></div><div><span>Updated local credit balance</span><b>{plan.credits.toLocaleString()} credits</b></div><div><span>Payment processing</span><b>Not connected</b></div></div>
        <div className="checkout-notice checkout-notice--coral"><Info size={16} /><p><b>Simulation only.</b> Confirming changes the local plan allocation in this browser. It does not charge, create a subscription, or issue an invoice.</p></div>
        <footer className="checkout-actions"><button className="button button--paper" onClick={() => setStep("payment")}>Back</button><button className="button button--coral" onClick={activate}>Simulate plan activation <ArrowRight size={16} /></button></footer>
      </div>}
      {step === "confirmed" && <div className="checkout-confirmation"><div className="checkout-confirmation__mark"><Check size={28} /></div><Eyebrow>Simulation complete</Eyebrow><h3>{plan.label} is selected locally.</h3><p>Your workspace now reflects the selected browser-demo allocation. No payment was charged, no subscription exists, and no payment information was handled.</p><section className="checkout-confirmation__allocation" aria-label="Activated credit allocation"><div><span>Activated plan</span><b>{plan.label}</b></div><div><span>Browser-demo credits</span><b>{plan.credits.toLocaleString()}</b></div><div><span>Billing period preview</span><b>Monthly</b></div><div><span>Plan price preview</span><b>{plan.price}/mo</b></div></section><section className="checkout-confirmation__features" aria-label={`${plan.label} included local features`}><div><Eyebrow>Activated local workspace coverage</Eyebrow><h4>Included in this simulated allocation</h4></div><ul>{plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul></section><section className="checkout-confirmation__operating" aria-label="Activated operating support"><div><span>Workflow</span><b>{planDetail.workflow}</b></div><div><span>Review</span><b>{planDetail.review}</b></div><div><span>Reporting</span><b>{planDetail.reporting}</b></div><div><span>Support</span><b>{planDetail.onboarding}</b></div></section><div className="checkout-confirmation__boundary"><ShieldCheck size={16} /><p><b>Local-only activation.</b> These credits and capabilities are visual prototype settings, not purchased credits or live provider entitlements.</p></div><div className="checkout-confirmation__receipt"><span>Reference</span><b>LOCAL-{planId.toUpperCase()}-{String(plan.credits).slice(0, 3)}</b><span>Method</span><b>{methodLabel}</b></div><button className="button button--ink" onClick={() => { onClose(); onReturn(); }}>Return to workspace <ArrowRight size={16} /></button></div>}
    </section>
  </div>;
}

function Settings({ user, setUser, notify }: WorkspaceProps) { const [name, setName] = useState(user.name); const [emailUpdates, setEmailUpdates] = useState(false); const save = () => { if (name.trim().length < 2) { notify("Use a display name with at least two characters.", "warning"); return; } setUser({ ...user, name: name.trim() }); notify("Local workspace preferences saved.", "success"); }; return <div className="settings-layout"><section className="panel"><Eyebrow>Workspace profile</Eyebrow><h2>Who is working here?</h2><div className="settings-fields"><div className="field"><Label>Display name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div><div className="field"><Label>Workspace email</Label><Input value={user.email} disabled /></div><button className="button button--coral" onClick={save}>Save local changes <Check size={16} /></button></div></section><section className="panel"><Eyebrow>Prototype behavior</Eyebrow><h2>Be explicit with integrations.</h2><div className="setting-line"><div><b>Local-only data</b><p>Current profile, plan selection, and example records use browser storage.</p></div><StatusPill tone="coral">Active</StatusPill></div><div className="setting-line"><div><b>AI generation provider</b><p>No model key or server integration is configured.</p></div><StatusPill>Not connected</StatusPill></div><div className="setting-line"><div><b>Payment processor</b><p>No checkout, payment method, or subscription record exists.</p></div><StatusPill>Not connected</StatusPill></div></section><section className="panel"><Eyebrow>Communication preference</Eyebrow><h2>Workspace notices</h2><div className="setting-line"><div><b>Example email updates</b><p>This toggle only demonstrates preference UI; no emails are sent.</p></div><Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} /></div></section></div> }

export default App;
