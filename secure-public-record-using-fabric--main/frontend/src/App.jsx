import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Blocks,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
  FileCheck2,
  FileSearch,
  Fingerprint,
  GitBranch,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  UploadCloud
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "./api/client.js";

const roles = ["Admin", "Government Officer", "Verifier"];
const recordTypes = [
  "Birth Certificate",
  "Income Certificate",
  "Educational Certificate",
  "Land Record",
  "Property Document",
  "Caste Certificate"
];
const securityModes = ["Traditional", "AES", "AES + ZKP"];
const securityModeDetails = [
  {
    name: "Traditional",
    icon: ShieldCheck,
    color: "text-coral",
    bg: "bg-red-50",
    summary: "Fast hash-based integrity check.",
    technical:
      "The system generates a SHA-256 fingerprint of the document and stores it on the ledger. It is lightweight and quick, but it does not encrypt file content or hide sensitive metadata."
  },
  {
    name: "AES",
    icon: KeyRound,
    color: "text-mint",
    bg: "bg-emerald-50",
    summary: "Hashing plus confidentiality layer.",
    technical:
      "AES represents symmetric encryption before secure storage. It adds processing time because data must be encrypted/decrypted, but it protects the document content from unauthorized viewing."
  },
  {
    name: "AES + ZKP",
    icon: Layers3,
    color: "text-violet",
    bg: "bg-violet-50",
    summary: "Privacy-preserving verification model.",
    technical:
      "AES protects confidentiality, while ZKP proves validity without exposing the underlying private data. This has the highest computation cost, but gives the strongest privacy and trust guarantee."
  }
];

const presentationKeywords = ["Tamper Evidence", "Duplicate Detection", "SHA-256", "Permissioned Blockchain", "Role Access", "Audit Trail"];

function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem("secure-records-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [view, setView] = useState("Dashboard");
  const [showLogin, setShowLogin] = useState(false);

  if (!auth) {
    return showLogin ? <LoginScreen onLogin={setAuth} onBack={() => setShowLogin(false)} /> : <WelcomeScreen onContinue={() => setShowLogin(true)} />;
  }

  return (
    <div className="app-shell min-h-screen text-ink">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_13%_8%,rgba(0,168,132,0.2),transparent_26%),radial-gradient(circle_at_92%_8%,rgba(249,115,91,0.2),transparent_28%),radial-gradient(circle_at_55%_90%,rgba(124,58,237,0.15),transparent_30%),linear-gradient(135deg,#eefdf8,#f7f8fb_45%,#f3f0ff)]" />
      <div className="flex min-h-screen">
        <Sidebar user={auth} view={view} setView={setView} onLogout={() => logout(setAuth)} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Topbar title={view} user={auth} />
          <MobileNav view={view} setView={setView} />
          {view === "Dashboard" && <Dashboard />}
          {view === "Project Blueprint" && <ProjectBlueprint />}
          {view === "Upload" && <UploadRecord />}
          {view === "Admin Panel" && <AdminPanel />}
          {view === "Verification" && <Verification />}
          {view === "Performance" && <Performance />}
          {view === "Explorer" && <Explorer />}
        </main>
      </div>
    </div>
  );
}

function WelcomeScreen({ onContinue }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] px-4 py-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,168,132,0.34),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(249,115,91,0.26),transparent_30%),linear-gradient(135deg,#07111f,#111827_52%,#172033)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />
      <main className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-xl">
            <Sparkles size={18} className="text-coral" /> Final Year Blockchain Security Project
          </div>
          <div>
            <h1 className="max-w-5xl text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              Secure Public Record Management & Verification System
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
              A full-stack platform for uploading government records, generating SHA-256 hashes, anchoring verification data on Hyperledger Fabric, and detecting duplicate or tampered documents.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {presentationKeywords.map(keyword => (
              <span key={keyword} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-slate-100 backdrop-blur-xl">
                {keyword}
              </span>
            ))}
          </div>
          <button onClick={onContinue} className="group inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-white to-emerald-100 px-5 py-4 font-extrabold text-ink shadow-2xl transition hover:-translate-y-0.5 hover:shadow-emerald-500/20">
            Continue to Login <ArrowRight size={20} className="transition group-hover:translate-x-1" />
          </button>
        </motion.section>

        <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="grid gap-4">
          {[
            ["Upload", "PDF, JPEG, PNG records are hashed and checked for duplicates.", UploadCloud],
            ["Anchor", "Record hash, timestamp, status, and transaction ID are stored on Fabric.", Network],
            ["Verify", "Record ID or SHA-256 hash proves whether a record exists on the ledger.", FileSearch]
          ].map(([title, text, Icon], index) => (
            <div key={title} className="welcome-card rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur-2xl" style={{ animationDelay: `${index * 120}ms` }}>
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-lg bg-gradient-to-br from-white to-emerald-100 p-3 text-ink"><Icon size={24} /></div>
                <span className="font-mono text-sm text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="text-2xl font-extrabold">{title}</h3>
              <p className="mt-2 leading-7 text-slate-300">{text}</p>
            </div>
          ))}
        </motion.section>
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, onBack }) {
  const [form, setForm] = useState({ email: "admin@secure-records.gov", password: "Admin@12345", role: "Admin" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", form);
      localStorage.setItem("secure-records-token", data.token);
      localStorage.setItem("secure-records-user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#101827] px-4 py-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(0,168,132,0.24),transparent_28%),radial-gradient(circle_at_90%_5%,rgba(124,58,237,0.24),transparent_26%),linear-gradient(135deg,#101827,#172033_48%,#08251f)]" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-sm backdrop-blur-xl">
            <ShieldCheck size={18} /> Government record integrity platform
          </div>
          <div>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-6xl">
              Secure Public Record Management & Verification System
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Register public documents, anchor tamper-evident hashes, and verify certificates through a clean role-based enterprise workflow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["JWT access", "SHA-256 hashing", "Fabric ledger"].map(item => (
              <div key={item} className="rounded-lg border border-white/15 bg-white/10 px-4 py-4 text-sm font-semibold text-white backdrop-blur-xl">
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="rounded-lg border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-ink p-3 text-white">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Role Login</h2>
              <p className="text-sm text-graphite">Use the seeded development accounts.</p>
            </div>
          </div>
          <Field label="Email" value={form.email} onChange={email => setForm({ ...form, email })} />
          <Field label="Password" type="password" value={form.password} onChange={password => setForm({ ...form, password })} />
          <label className="mb-4 block text-sm font-semibold text-graphite">
            Role
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-ink outline-none focus:border-mint"
              value={form.role}
              onChange={event => setForm({ ...form, role: event.target.value })}
            >
              {roles.map(role => <option key={role}>{role}</option>)}
            </select>
          </label>
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-bold text-white transition hover:bg-black" disabled={loading}>
            <ShieldCheck size={18} /> {loading ? "Authenticating..." : "Enter Dashboard"}
          </button>
          <button type="button" onClick={onBack} className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-graphite transition hover:border-mint hover:text-ink">
            Back to Welcome
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function Sidebar({ user, view, setView, onLogout }) {
  const items = [
    ["Dashboard", LayoutDashboard],
    ["Project Blueprint", BookOpen],
    ["Upload", UploadCloud],
    ["Admin Panel", FileCheck2],
    ["Verification", FileSearch],
    ["Performance", BarChart3],
    ["Explorer", Blocks]
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#101827]/95 p-4 text-white shadow-2xl backdrop-blur-xl lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="rounded-lg bg-gradient-to-br from-mint to-violet p-2 text-white"><ShieldCheck size={22} /></div>
        <div>
          <p className="font-extrabold">Secure Records</p>
          <p className="text-xs font-medium text-slate-300">{user.role}</p>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map(([item, Icon]) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${view === item ? "bg-white text-ink shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
          >
            <Icon size={18} /> {item}
          </button>
        ))}
      </nav>
      <button onClick={onLogout} className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}

function Topbar({ title, user }) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-mint">Secure Public Records</p>
        <h2 className="text-2xl font-extrabold tracking-normal">{title}</h2>
      </div>
      <div className="glass rounded-lg px-4 py-3 text-sm font-semibold">
        {user.name} <span className="text-graphite">/ {user.role}</span>
      </div>
    </header>
  );
}

function MobileNav({ view, setView }) {
  const views = ["Dashboard", "Project Blueprint", "Upload", "Admin Panel", "Verification", "Performance", "Explorer"];
  return (
    <div className="mb-5 block lg:hidden">
      <select
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-ink shadow-sm outline-none focus:border-mint"
        value={view}
        onChange={event => setView(event.target.value)}
      >
        {views.map(item => <option key={item}>{item}</option>)}
      </select>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/dashboard").then(res => setData(res.data));
  }, []);

  if (!data) return <SkeletonGrid />;

  const stats = [
    ["Total Public Records", data.stats.totalPublicRecords, FileCheck2, "from-emerald-500 to-teal-600"],
    ["Verified Records", data.stats.verifiedRecords, CheckCircle2, "from-blue-500 to-violet-600"],
    ["Pending Records", data.stats.pendingRecords, Activity, "from-coral to-amber-500"],
    ["Blockchain Transactions", data.stats.blockchainTransactions, Blocks, "from-slate-800 to-slate-950"]
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <section className="relative overflow-hidden rounded-lg bg-ink p-7 text-white shadow-glass">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,168,132,0.42),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(249,115,91,0.32),transparent_30%),linear-gradient(135deg,#101827,#172033)]" />
        <div className="relative">
          <p className="text-sm font-extrabold uppercase text-mint">Secure Public Record Management & Verification System</p>
          <h3 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight lg:text-4xl">
            Blockchain-backed public record verification with secure digital proof.
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Every upload becomes a trusted digital fingerprint for duplicate detection, verification, and audit tracking.
          </p>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon, color]) => (
          <motion.div whileHover={{ y: -6, scale: 1.01 }} key={label} className={`stat-card rounded-lg bg-gradient-to-br ${color} p-5 text-white shadow-glass`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white/80">{label}</p>
              <div className="rounded-lg bg-white/15 p-2 backdrop-blur-xl"><Icon size={22} /></div>
            </div>
            <p className="mt-4 text-4xl font-extrabold">{value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectBlueprint() {
  const sections = [
    {
      id: "architecture",
      title: "System Architecture",
      icon: Server,
      points: [
        "React with Vite is used for the frontend because it gives a fast development server, reusable components, and a responsive dashboard UI.",
        "Express.js is used for REST APIs. It receives login requests, file uploads, verification requests, dashboard data, record table data, graph data, and explorer data.",
        "MongoDB stores searchable metadata such as citizen name, record type, record number, upload date, file hash, verification status, and blockchain transaction ID.",
        "Hyperledger Fabric stores the trusted record proof: record ID, SHA-256 hash, transaction ID, timestamp, verification status, and selected security method.",
        "Docker is used to run MongoDB and Fabric services in isolated containers so the environment is repeatable."
      ]
    },
    {
      id: "workflow",
      title: "Record Workflow",
      icon: GitBranch,
      points: [
        "The user logs in as Admin, Government Officer, or Verifier. JWT protects API calls and bcrypt protects stored passwords.",
        "During upload, the backend accepts PDF, JPEG, or PNG using Multer.",
        "The file content is streamed through SHA-256. The resulting hash is the digital fingerprint of the file.",
        "Before creating a new record, MongoDB is checked for the same hash. If it already exists, upload is blocked as Duplicate.",
        "If the file is new, metadata is saved in MongoDB and the hash proof is anchored through the Fabric chaincode.",
        "Verification can be done using Record ID or SHA-256 hash. If the proof exists, the system shows Verified. If not, it shows Tampered."
      ]
    },
    {
      id: "security",
      title: "Security Modes",
      icon: ShieldCheck,
      points: [
        "Traditional mode uses SHA-256 hashing. It is fastest because it only performs integrity checking, but it does not add confidentiality.",
        "AES mode represents encryption before secure storage. It is slower than Traditional because encryption and decryption add computation, but it protects document content.",
        "AES + ZKP mode represents the strongest privacy model. AES protects the document, and ZKP allows proof of validity without revealing sensitive data.",
        "AES + ZKP has higher latency and lower throughput because proof generation and verification require more computation.",
        "Even though AES + ZKP is slower, it gets the highest security score because privacy, confidentiality, and trust are strongest."
      ]
    },
    {
      id: "fabric",
      title: "Fabric + Docker + MongoDB",
      icon: Blocks,
      points: [
        "Hyperledger Fabric is a permissioned blockchain, suitable for government systems because only authorized organizations can participate.",
        "The Fabric peer stores ledger data and runs chaincode. The orderer orders transactions and creates blocks. The channel keeps communication private.",
        "The chaincode public-records has functions such as createRecord, readRecord, updateVerificationStatus, and queryAllRecords.",
        "MongoDB is not replaced by blockchain. MongoDB gives fast search and dashboard views, while Fabric gives tamper-evident trust.",
        "Docker containers run MongoDB, peers, orderer, and chaincode so the project can be demonstrated in a controlled environment."
      ]
    },
    {
      id: "viva",
      title: "Presentation Notes",
      icon: Fingerprint,
      points: [
        "If a file is renamed, the hash remains the same because hashing depends on content, not filename.",
        "If a file is copied and uploaded again, the system detects duplicate because the copied file has the same content hash.",
        "If even one pixel or byte changes, the SHA-256 hash changes completely, so the system treats it as a different or tampered file.",
        "We store only the hash on blockchain, not the full file. This protects privacy and avoids storing large documents on the ledger.",
        "The final decision is: Traditional is best for speed, AES is balanced for confidentiality, and AES + ZKP is best for advanced privacy and trust."
      ]
    }
  ];
  const [active, setActive] = useState(sections[0].id);
  const current = sections.find(section => section.id === active);
  const CurrentIcon = current.icon;

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="colored-panel rounded-lg p-4">
        <p className="mb-3 px-2 text-sm font-extrabold uppercase text-mint">Project Blueprint</p>
        <div className="space-y-2">
          {sections.map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-extrabold transition ${active === id ? "bg-ink text-white shadow-lg" : "bg-white/70 text-graphite hover:bg-emerald-50 hover:text-ink"}`}
            >
              <Icon size={18} /> {title}
            </button>
          ))}
        </div>
      </div>
      <motion.section key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-ink p-6 text-white shadow-glass">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,168,132,0.34),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(124,58,237,0.28),transparent_30%)]" />
        <div className="relative">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-ink">
            <CurrentIcon size={26} />
          </div>
          <h3 className="text-3xl font-extrabold">{current.title}</h3>
          <div className="mt-6 space-y-3">
            {current.points.map((point, index) => (
              <div key={point} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm font-mono text-mint">Step {String(index + 1).padStart(2, "0")}</p>
                <p className="mt-2 leading-7 text-slate-100">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function SecurityModeGrid() {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {securityModeDetails.map(({ name, icon: Icon, color, bg, summary, technical }) => (
        <motion.div whileHover={{ y: -6, rotate: -0.4 }} key={name} className="security-card rounded-lg p-5">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${bg} ${color} shadow-sm`}>
            <Icon size={23} />
          </div>
          <h3 className="text-xl font-extrabold">{name}</h3>
          <p className="mt-2 text-sm font-bold text-graphite">{summary}</p>
          <p className="mt-3 leading-7 text-graphite">{technical}</p>
        </motion.div>
      ))}
    </div>
  );
}

function UploadRecord() {
  const [form, setForm] = useState({
    citizenName: "",
    recordType: recordTypes[0],
    recordNumber: "",
    securityMethod: securityModes[0],
    file: null
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    setDuplicate(null);
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => value && body.append(key, value));
    try {
      const { data } = await api.post("/api/records", body);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please check the backend terminal for details.");
      setDuplicate(err.response?.data?.duplicate || null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="colored-panel rounded-lg p-4">
      <form onSubmit={submit} className="grid gap-2 lg:grid-cols-2">
        <Field label="Citizen Name" value={form.citizenName} onChange={citizenName => setForm({ ...form, citizenName })} />
        <Field label="Record Number" value={form.recordNumber} onChange={recordNumber => setForm({ ...form, recordNumber })} />
        <Select label="Record Type" value={form.recordType} options={recordTypes} onChange={recordType => setForm({ ...form, recordType })} />
        <Select label="Security Mode" value={form.securityMethod} options={securityModes} onChange={securityMethod => setForm({ ...form, securityMethod })} />
        <label className="block text-sm font-semibold text-graphite lg:col-span-2">
          Record File
          <input className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3" type="file" accept="application/pdf,image/jpeg,image/png" onChange={event => setForm({ ...form, file: event.target.files[0] })} required />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 lg:col-span-2">{error}</p>}
        {duplicate && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800 lg:col-span-2">
          Existing Record ID: <span className="font-mono">{duplicate.recordId}</span>
        </div>}
        <button disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 lg:col-span-2">
          <UploadCloud size={18} /> {loading ? "Uploading..." : "Upload and Anchor Hash"}
        </button>
      </form>
      {result && <ResultCard title="Record Uploaded" tone="success" rows={[
        ["Record ID", result.record.recordId],
        ["SHA-256 Hash", result.record.hash],
        ["Transaction ID", result.blockchain.transactionId],
        ["Security Method", result.record.securityMethod],
        ["Blockchain Framework", result.record.blockchainFramework || "Hyperledger Fabric"]
      ]} />}
    </div>
  );
}

function AdminPanel() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/api/records", { params: { search, verificationStatus: status } }).then(res => setRecords(res.data.records));
  }, [search, status]);

  return (
    <div className="colored-panel overflow-hidden rounded-lg">
      <div className="flex flex-wrap gap-3 border-b border-white/50 p-4">
        <input className="min-w-64 flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-mint" placeholder="Search records" value={search} onChange={event => setSearch(event.target.value)} />
        <select className="rounded-lg border border-slate-200 px-3 py-2" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Tampered</option>
        </select>
      </div>
      <div className="overflow-auto">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-ink text-xs uppercase text-white">
            <tr>{["Record ID", "Citizen Name", "Record Type", "Upload Date", "Security Method", "Blockchain Framework", "Verification Status", "Blockchain Transaction ID"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.recordId} className="border-t border-slate-100 bg-white/70 transition hover:bg-emerald-50/80">
                <td className="px-4 py-3 font-bold">{record.recordId}</td>
                <td className="px-4 py-3">{record.citizenName}</td>
                <td className="px-4 py-3">{record.recordType}</td>
                <td className="px-4 py-3">{new Date(record.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{record.securityMethod}</td>
                <td className="px-4 py-3 font-bold text-violet-700">{record.blockchainFramework || "Hyperledger Fabric"}</td>
                <td className="px-4 py-3"><StatusPill status={record.verificationStatus} /></td>
                <td className="px-4 py-3 font-mono text-xs">{record.blockchainTransactionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Verification() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/api/verify", { identifier });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
      <form onSubmit={submit} className="colored-panel rounded-lg p-5">
        <Field label="Record ID or SHA-256 Hash" value={identifier} onChange={setIdentifier} />
        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-bold text-white">
          <FileSearch size={18} /> Verify Record
        </button>
      </form>
      <div className="colored-panel rounded-lg p-5">
        {result ? (
          <ResultCard title={result.result} tone={result.result === "Verified" ? "success" : "danger"} rows={[
            ["Transaction ID", result.transactionId || "Not found"],
            ["Timestamp", result.timestamp ? new Date(result.timestamp).toLocaleString() : "Not found"],
            ["Original Hash", result.originalHash || "Not found"],
            ["Submitted Value", result.currentHash],
            ["Security Method", result.securityMethod || "Unknown"]
          ]} />
        ) : (
          <p className="text-sm font-medium text-graphite">Enter a record ID or SHA-256 hash to verify whether it exists on the ledger.</p>
        )}
      </div>
    </div>
  );
}

function Performance() {
  const [data, setData] = useState([]);
  const [performanceInfo, setPerformanceInfo] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFrameworkInfo, setShowFrameworkInfo] = useState(false);
  const [graphZoom, setGraphZoom] = useState(100);
  const [selectedGraph, setSelectedGraph] = useState("latency");
  const graphOptions = [
    { key: "latency", title: "Latency", unit: performanceInfo?.units?.latency || "ms/transaction", color: "#14B8A6" },
    { key: "throughput", title: "Throughput", unit: performanceInfo?.units?.throughput || "transactions/min", color: "#F9735B" },
    { key: "scalability", title: "Scalability", unit: performanceInfo?.units?.scalability || "score/100", color: "#7C3AED" },
    { key: "securityScore", title: "Security Score", unit: performanceInfo?.units?.securityScore || "score/100", color: "#111827" },
    { key: "combined", title: "Combined Comparison", unit: "mixed units", color: "#00A884" },
    { key: "framework", title: "Framework Comparison", unit: "score/100", color: "#7C3AED" }
  ];
  const activeGraph = graphOptions.find(option => option.key === selectedGraph) || graphOptions[0];
  useEffect(() => {
    api.get("/api/performance").then(res => {
      setData(res.data.data);
      setPerformanceInfo(res.data);
    });
  }, []);

  return (
    <div className="relative space-y-5">
      <section className="colored-panel rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase text-mint">Performance Analysis</p>
            <h3 className="mt-1 text-2xl font-extrabold">Security Method Intelligence Matrix</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm font-extrabold text-graphite">
              View {graphZoom}%
              <input
                className="ml-3 align-middle accent-emerald-600"
                min="10"
                max="100"
                step="10"
                type="range"
                value={graphZoom}
                onChange={event => setGraphZoom(Number(event.target.value))}
              />
            </label>
            <button
              onClick={() => setShowExplanation(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-black"
            >
              Explain Graph <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setShowFrameworkInfo(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-3 text-sm font-extrabold text-white transition hover:bg-violet-800"
            >
              Ganache vs Fabric <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-5">
        {graphOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setSelectedGraph(option.key)}
            className={`rounded-lg px-4 py-3 text-sm font-extrabold transition ${selectedGraph === option.key ? "bg-ink text-white shadow-lg" : "bg-white/75 text-graphite hover:bg-emerald-50 hover:text-ink"}`}
          >
            {option.title}
          </button>
        ))}
      </div>
      <div className="performance-stage rounded-lg border border-white/60 p-3">
        <div className="origin-top-left" style={{ transform: `scale(${graphZoom / 100})`, width: `${10000 / graphZoom}%` }}>
          <div className="colored-panel rounded-lg p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">{activeGraph.title}</h3>
                <p className="mt-1 text-sm font-extrabold text-mint">Unit: {activeGraph.unit}</p>
              </div>
              {selectedGraph === "combined" && (
                <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Best security: AES + ZKP
                </div>
              )}
              {selectedGraph === "framework" && (
                <div className="rounded-lg bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700">
                  Best framework: Hyperledger Fabric
                </div>
              )}
            </div>
            {selectedGraph === "combined" && (
              <div className="mb-4 grid gap-2 text-xs font-extrabold text-graphite sm:grid-cols-4">
                <span className="rounded-lg bg-white/80 px-3 py-2">Latency: {performanceInfo?.units?.latency || "ms/transaction"}</span>
                <span className="rounded-lg bg-white/80 px-3 py-2">Throughput: {performanceInfo?.units?.throughput || "transactions/min"}</span>
                <span className="rounded-lg bg-white/80 px-3 py-2">Scalability: {performanceInfo?.units?.scalability || "score/100"}</span>
                <span className="rounded-lg bg-white/80 px-3 py-2">Security: {performanceInfo?.units?.securityScore || "score/100"}</span>
              </div>
            )}
            <div className="h-[32rem] rounded-lg border border-white/60 bg-white/70 p-3">
            <ResponsiveContainer>
              <BarChart data={selectedGraph === "framework" ? performanceInfo?.frameworkComparison || [] : data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe5ee" />
                <XAxis dataKey={selectedGraph === "framework" ? "framework" : "method"} />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  const units = performanceInfo?.units || {};
                  if (selectedGraph === "framework") return [`${value} score/100`, name];
                  const unit = selectedGraph === "combined" ? units[name] || units.securityScore || "" : activeGraph.unit;
                  return [`${value} ${unit}`, name];
                }} />
                {(selectedGraph === "combined" || selectedGraph === "framework") && <Legend />}
                {selectedGraph === "framework" ? (
                  <>
                    <Bar dataKey="privacy" fill="#14B8A6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="governance" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="throughput" fill="#F9735B" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="auditability" fill="#2563EB" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="suitability" fill="#111827" radius={[8, 8, 0, 0]} />
                  </>
                ) : selectedGraph === "combined" ? (
                  <>
                    <Bar dataKey="latency" fill="#14B8A6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="throughput" fill="#F9735B" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="scalability" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="securityScore" name="security score" fill="#111827" radius={[8, 8, 0, 0]} />
                  </>
                ) : (
                  <Bar dataKey={activeGraph.key} fill={activeGraph.color} radius={[10, 10, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {showExplanation && <GraphExplanationDrawer performanceInfo={performanceInfo} onClose={() => setShowExplanation(false)} />}
      {showFrameworkInfo && <FrameworkExplanationDrawer performanceInfo={performanceInfo} onClose={() => setShowFrameworkInfo(false)} />}
    </div>
  );
}

function GraphExplanationDrawer({ performanceInfo, onClose }) {
  return (
    <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm">
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        className="ml-auto h-full w-full max-w-xl overflow-auto bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase text-mint">Graph Explanation</p>
            <h3 className="text-2xl font-extrabold">How the decision is made</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-extrabold text-graphite hover:border-ink hover:text-ink">
            Close
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Latency", performanceInfo?.units?.latency || "ms/transaction", Timer],
            ["Throughput", performanceInfo?.units?.throughput || "transactions/min", Activity],
            ["Scalability", performanceInfo?.units?.scalability || "score/100", Network],
            ["Security Score", performanceInfo?.units?.securityScore || "score/100", ShieldCheck]
          ].map(([label, unit, Icon]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Icon size={20} className="text-mint" />
              <p className="mt-3 text-sm font-extrabold text-graphite">{label}</p>
              <p className="font-mono text-sm text-ink">{unit}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {securityModeDetails.map(({ name, summary, technical }) => (
            <div key={name} className="rounded-lg border border-slate-200 p-4">
              <h4 className="font-extrabold">{name}</h4>
              <p className="mt-1 text-sm font-bold text-mint">{summary}</p>
              <p className="mt-3 text-sm leading-6 text-graphite">{technical}</p>
            </div>
          ))}
        </div>

        {performanceInfo?.decision && (
          <div className="mt-6 rounded-lg border border-violet-200 bg-violet-50 p-5 text-sm font-semibold leading-7 text-violet-900">
            Decision: {performanceInfo.decision}
          </div>
        )}
      </motion.aside>
    </div>
  );
}

function FrameworkExplanationDrawer({ performanceInfo, onClose }) {
  const comparison = [
    ["Network Type", "Local Ethereum-style test blockchain", "Permissioned enterprise blockchain"],
    ["Identity", "Wallet/address based", "Certificate and MSP based identity"],
    ["Privacy", "Lower privacy for government-style records", "Private channels and controlled participants"],
    ["Governance", "Good for testing smart contracts", "Strong organization-based governance"],
    ["Use Case Fit", "Best for Ethereum DApp testing", "Best for government/public record verification"]
  ];

  return (
    <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm">
      <motion.aside
        initial={{ x: 460, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="ml-auto h-full w-full max-w-2xl overflow-auto bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase text-violet">Blockchain Framework Theory</p>
            <h3 className="text-2xl font-extrabold">Ganache Ethereum vs Hyperledger Fabric</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-extrabold text-graphite hover:border-ink hover:text-ink">
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
            <h4 className="text-lg font-extrabold text-orange-800">Ganache Ethereum</h4>
            <p className="mt-3 leading-7 text-orange-900">
              Ganache is mainly used as a local Ethereum blockchain for development and testing. It is useful for Solidity smart contracts and quick DApp experiments, but it represents a public Ethereum-style model where privacy, identity governance, and organization-level control are not as strong for government records.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h4 className="text-lg font-extrabold text-emerald-800">Hyperledger Fabric</h4>
            <p className="mt-3 leading-7 text-emerald-900">
              Hyperledger Fabric is permissioned and enterprise-focused. It supports certificate identities, private channels, organization policies, and controlled access. That makes it better for public record verification because government departments need privacy, auditability, and trusted participants.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink text-white">
              <tr>
                {["Point", "Ganache Ethereum", "Hyperledger Fabric"].map(head => <th key={head} className="px-4 py-3">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparison.map(row => (
                <tr key={row[0]} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-extrabold">{row[0]}</td>
                  <td className="px-4 py-3 text-graphite">{row[1]}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-800">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-lg border border-violet-200 bg-violet-50 p-5 text-sm font-semibold leading-7 text-violet-900">
          Decision: {performanceInfo?.frameworkDecision || "Hyperledger Fabric is best for this project because it is permissioned, private, identity-based, and suitable for enterprise/government governance."}
        </div>
      </motion.aside>
    </div>
  );
}

function Explorer() {
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    api.get("/api/explorer").then(res => setBlocks(res.data.blocks));
  }, []);

  return (
    <div className="colored-panel overflow-hidden rounded-lg">
      <div className="overflow-auto">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead className="bg-ink text-xs uppercase text-white">
            <tr>{["Block Number", "Transaction ID", "Channel", "Timestamp", "Hash", "Status"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {blocks.map(block => (
              <tr key={block.transactionId} className="border-t border-slate-100 bg-white/70 transition hover:bg-violet-50/80">
                <td className="px-4 py-3 font-bold">{block.blockNumber}</td>
                <td className="px-4 py-3 font-mono text-xs">{block.transactionId}</td>
                <td className="px-4 py-3">{block.channel}</td>
                <td className="px-4 py-3">{new Date(block.timestamp).toLocaleString()}</td>
                <td className="max-w-sm truncate px-4 py-3 font-mono text-xs">{block.hash}</td>
                <td className="px-4 py-3"><StatusPill status={block.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChartCard({ title, unit, data, metric, color }) {
  return (
    <div className="chart-panel rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="text-xs font-bold uppercase text-graphite">{unit}</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" />
            <YAxis />
            <Tooltip formatter={value => [`${value} ${unit}`, title]} />
            <Bar dataKey={metric} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = true }) {
  return (
    <label className="mb-4 block text-sm font-semibold text-graphite">
      {label}
      <input className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-ink outline-none focus:border-mint" type={type} value={value} onChange={event => onChange(event.target.value)} required={required} />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="mb-4 block text-sm font-semibold text-graphite">
      {label}
      <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-ink outline-none focus:border-mint" value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function InfoPanel({ title, items, horizontal }) {
  return (
    <div className="glass rounded-lg p-5">
      <h3 className="mb-4 text-lg font-extrabold">{title}</h3>
      <div className={horizontal ? "flex flex-wrap gap-2" : "space-y-3"}>
        {items.map(item => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-graphite">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ title, rows, tone = "neutral" }) {
  const toneClass = tone === "success" ? "border-emerald-200 bg-emerald-50" : tone === "danger" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white";
  return (
    <div className={`mt-5 rounded-lg border p-4 ${toneClass}`}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
        <CheckCircle2 className={title === "Tampered" ? "text-red-600" : "text-mint"} size={22} /> {title}
      </h3>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 rounded-lg bg-slate-50 p-3 text-sm md:grid-cols-[170px_1fr]">
            <span className="font-bold text-graphite">{label}</span>
            <span className="break-all font-mono text-xs">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const color = status === "Verified" || status === "VALID" ? "bg-emerald-50 text-emerald-700" : status === "Tampered" || status === "INVALID" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${color}`}>{status}</span>;
}

function SkeletonGrid() {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-lg" />)}</div>;
}

function logout(setAuth) {
  localStorage.removeItem("secure-records-token");
  localStorage.removeItem("secure-records-user");
  setAuth(null);
}

export default App;
