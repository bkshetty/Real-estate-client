import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Building2, Users, FileText, Wrench, LayoutDashboard,
  Plus, Pencil, Trash2, MapPin, Maximize2, Home,
  CreditCard, AlertCircle, ChevronRight, DollarSign,
  Phone, Mail, Calendar, Hash, ArrowUpDown, Search, Filter
} from 'lucide-react';
import Modal, { ConfirmModal } from './Modal';
import LandingPage from './LandingPage';

gsap.registerPlugin(useGSAP);

/* ─── helpers ─────────────────────────────────────────────── */
const API = 'http://localhost:3000/api';

const typeColors = {
  Apartment: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  House:     'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  Villa:     'bg-purple-500/10 text-purple-300 border border-purple-500/20',
};

const methodColors = {
  UPI:           'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'Bank Transfer':'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  Cash:           'bg-amber-500/10 text-amber-300 border border-amber-500/20',
};

const statusColors = {
  Pending:  'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  Resolved: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
};

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
      <div className="p-4 rounded-full bg-white/5 ring-1 ring-white/10 shadow-xl">
        <Icon size={48} strokeWidth={1} className="text-amber-200/50" />
      </div>
      <p className="text-xl font-playfair text-white tracking-wide">{title}</p>
      <p className="text-sm font-outfit text-slate-400 max-w-sm text-center">{sub}</p>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 font-outfit">
      {label && <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{label}</label>}
      <input
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm
                   placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 hover:bg-white/10 transition-all font-outfit shadow-inner"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 font-outfit">
      {label && <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{label}</label>}
      <select
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#161b22] text-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 hover:bg-white/10 transition-all shadow-inner appearance-none cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function TextareaField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 font-outfit">
      {label && <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{label}</label>}
      <textarea
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm
                   placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 hover:bg-white/10 transition-all resize-vertical shadow-inner"
        {...props}
      />
    </div>
  );
}

const navItems = [
  { id: 'properties', label: 'Properties',  icon: Building2 },
  { id: 'tenants',    label: 'Tenants',     icon: Users },
  { id: 'leases',     label: 'Leases',      icon: FileText },
  { id: 'operations', label: 'Operations',  icon: Wrench },
];

/* ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [tab, setTab] = useState('properties');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── data states ── */
  const [properties,  setProperties]  = useState([]);
  const [tenants,     setTenants]     = useState([]);
  const [leases,      setLeases]      = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments,    setPayments]    = useState([]);

  /* ── filter/sort states ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType]   = useState('All');
  const [sortBy, setSortBy]           = useState('name_asc');

  /* ── modal open flags ── */
  const [showPropModal,   setShowPropModal]   = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showLeaseModal,  setShowLeaseModal]  = useState(false);
  const [showPayModal,    setShowPayModal]    = useState(false);
  const [showMaintModal,  setShowMaintModal]  = useState(false);

  /* ── confirm delete ── */
  const [confirmPayload, setConfirmPayload] = useState(null);

  /* ── edit IDs ── */
  const [editPropId,   setEditPropId]   = useState(null);
  const [editTenantId, setEditTenantId] = useState(null);

  /* ── form states ── */
  const [propForm,   setPropForm]   = useState({ name: '', location: '', size: '', type: 'Apartment' });
  const [tenantForm, setTenantForm] = useState({ name: '', contact_number: '', email: '' });
  const [leaseForm,  setLeaseForm]  = useState({ property_id: '', tenant_id: '', start_date: '', end_date: '' });
  const [maintForm,  setMaintForm]  = useState({ lease_id: '', request_date: '', description: '' });
  const [payForm,    setPayForm]    = useState({ lease_id: '', amount: '', payment_date: '', payment_method: 'UPI' });

  /* ── GSAP Refs ── */
  const mainRef = useRef(null);
  const sidebarRef = useRef(null);

  useGSAP(() => {
    if(!showLanding) {
      gsap.fromTo('.nav-item', 
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2, clearProps: 'all' }
      );
    }
  }, [showLanding]);

  useGSAP(() => {
    if(!showLanding) {
      gsap.fromTo('.tab-content', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' }
      );
    }
  }, [tab, showLanding]);

  /* ── fetch ── */
  const fetchData = () => {
    fetch(`${API}/properties`).then(r => r.json()).then(setProperties).catch(() => {});
    fetch(`${API}/tenants`).then(r => r.json()).then(setTenants).catch(() => {});
    fetch(`${API}/leases`).then(r => r.json()).then(setLeases).catch(() => {});
    fetch(`${API}/maintenance`).then(r => r.json()).then(setMaintenance).catch(() => {});
    fetch(`${API}/payments`).then(r => r.json()).then(setPayments).catch(() => {});
  };
  useEffect(() => { fetchData(); }, []);

  /* ── submit: property ── */
  const handlePropSubmit = (e) => {
    e.preventDefault();
    const method = editPropId ? 'PUT' : 'POST';
    const url    = editPropId ? `${API}/properties/${editPropId}` : `${API}/properties`;
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(propForm) })
      .then(() => {
        fetchData();
        setPropForm({ name: '', location: '', size: '', type: 'Apartment' });
        setEditPropId(null);
        setShowPropModal(false);
        toast.success(editPropId ? 'Property updated!' : 'Property added!');
      })
      .catch(() => toast.error('Something went wrong.'));
  };

  /* ── submit: tenant ── */
  const handleTenantSubmit = (e) => {
    e.preventDefault();
    const method = editTenantId ? 'PUT' : 'POST';
    const url    = editTenantId ? `${API}/tenants/${editTenantId}` : `${API}/tenants`;
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tenantForm) })
      .then(() => {
        fetchData();
        setTenantForm({ name: '', contact_number: '', email: '' });
        setEditTenantId(null);
        setShowTenantModal(false);
        toast.success(editTenantId ? 'Tenant updated!' : 'Tenant added!');
      })
      .catch(() => toast.error('Something went wrong.'));
  };

  /* ── generic POST ── */
  const genericPost = (endpoint, data, resetForm, closeModal, label) => {
    fetch(`${API}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(() => { fetchData(); resetForm(); closeModal(false); toast.success(`${label} recorded!`); })
      .catch(() => toast.error('Something went wrong.'));
  };

  /* ── delete ── */
  const deleteItem = (endpoint, id) => {
    fetch(`${API}/${endpoint}/${id}`, { method: 'DELETE' })
      .then(() => { fetchData(); toast.success('Deleted successfully.'); })
      .catch(() => toast.error('Delete failed.'));
  };

  /* ── open edit prop ── */
  const openEditProp = (p) => {
    setPropForm({ name: p.name, location: p.location, size: p.size, type: p.type });
    setEditPropId(p.property_id);
    setShowPropModal(true);
  };

  /* ── open edit tenant ── */
  const openEditTenant = (t) => {
    setTenantForm({ name: t.name, contact_number: t.contact_number, email: t.email });
    setEditTenantId(t.tenant_id);
    setShowTenantModal(true);
  };

  const currentSection = navItems.find(n => n.id === tab);

  const filteredProperties = properties
    .filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.location || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'All' || p.type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'size_asc') return Number(a.size || 0) - Number(b.size || 0);
      if (sortBy === 'size_desc') return Number(b.size || 0) - Number(a.size || 0);
      return 0;
    });

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex w-full h-screen bg-slate-950/95 overflow-hidden font-outfit text-slate-200">
      
      {/* Background Texture for Luxury Feel */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-slate-950"></div>

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontFamily: 'Outfit, sans-serif' } }} />

      <ConfirmModal
        isOpen={!!confirmPayload}
        onClose={() => setConfirmPayload(null)}
        onConfirm={() => deleteItem(confirmPayload.endpoint, confirmPayload.id)}
        title="Confirm Deletion"
        message={`Are you positive you wish to remove "${confirmPayload?.label}" from the directory?`}
      />

      {/* ══ SIDEBAR ══ */}
      <aside
        ref={sidebarRef}
        className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-slate-950 shadow-2xl z-20 border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* brand */}
        <div 
          onClick={() => setShowLanding(true)}
          className="flex items-center gap-4 px-5 py-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform duration-300">
            <LayoutDashboard size={18} className="text-slate-900" />
          </div>
          {sidebarOpen && (
            <span className="font-playfair text-lg font-semibold tracking-wide text-white whitespace-nowrap overflow-hidden">
              RE Elite
            </span>
          )}
        </div>

        {/* nav */}
        <nav className="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`nav-item w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                ${tab === id
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap tracking-wide">{label}</span>}
              {sidebarOpen && tab === id && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </button>
          ))}
        </nav>

        {/* collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="m-4 p-3 rounded-xl border border-white/5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center backdrop-blur-md"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          <ChevronRight size={18} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* ══ MAIN ══ */}
      <main ref={mainRef} className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* top header */}
        <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-playfair font-medium text-white flex items-center gap-3 tracking-wide">
              {currentSection && <currentSection.icon size={22} className="text-amber-400" />}
              {currentSection?.label}
            </h1>
            <p className="text-xs text-slate-400 mt-1 tracking-widest uppercase font-semibold">Premium Portfolio Management</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {tab === 'properties' && (
              <button 
                onClick={() => { setEditPropId(null); setPropForm({ name: '', location: '', size: '', type: 'Apartment' }); setShowPropModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              >
                <Plus size={16} /> Add Property
              </button>
            )}
            {tab === 'tenants' && (
              <button 
                onClick={() => { setEditTenantId(null); setTenantForm({ name: '', contact_number: '', email: '' }); setShowTenantModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)]"
              >
                <Plus size={16} /> Register Client
              </button>
            )}
            {tab === 'leases' && (
              <button 
                onClick={() => setShowLeaseModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)]"
              >
                <Plus size={16} /> Draft Agreement
              </button>
            )}
            {tab === 'operations' && (
              <>
                <button 
                  onClick={() => setShowPayModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs tracking-wider uppercase font-bold transition-all"
                >
                  <DollarSign size={14} /> Log Deposit
                </button>
                <button 
                  onClick={() => setShowMaintModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs tracking-wider uppercase font-bold transition-all"
                >
                  <Wrench size={14} /> Lodge Issue
                </button>
              </>
            )}
          </div>
        </header>

        {/* content area */}
        <div className="tab-content flex-1 overflow-y-auto p-8">

          {/* ─── PROPERTIES ─── */}
          {tab === 'properties' && (
            <>
              {/* Premium Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                  <input
                    type="text"
                    placeholder="Search premium estates by name or locale..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-5 py-3 bg-slate-900 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-white placeholder-slate-500 shadow-inner"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="pl-11 pr-9 py-3 bg-slate-900 border border-white/5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-white shadow-inner cursor-pointer"
                    >
                      <option value="All">All Estates</option>
                      <option value="Apartment">Apartments</option>
                      <option value="House">Houses</option>
                      <option value="Villa">Villas</option>
                    </select>
                  </div>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="pl-11 pr-9 py-3 bg-slate-900 border border-white/5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-white shadow-inner cursor-pointer"
                    >
                      <option value="name_asc">Name (A-Z)</option>
                      <option value="name_desc">Name (Z-A)</option>
                      <option value="size_asc">Size (Smallest)</option>
                      <option value="size_desc">Size (Largest)</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredProperties.length === 0
                ? <EmptyState icon={Building2} title={properties.length === 0 ? "Portfolio Empty" : "No Matches"} sub={properties.length === 0 ? "Begin curating your empire by adding a property." : "We couldn't locate any estates matching your parameters."} />
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProperties.map(p => (
                      <div key={p.property_id}
                        className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-playfair font-medium text-white text-lg tracking-wide">{p.name}</h3>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${typeColors[p.type] || 'bg-white/10 text-slate-300'}`}>
                            {p.type}
                          </span>
                        </div>
                        <div className="space-y-2.5 text-sm text-slate-400 font-light flex-1">
                          <div className="flex items-center gap-2.5"><MapPin size={14} className="text-amber-200/50" /> {p.location}</div>
                          <div className="flex items-center gap-2.5"><Maximize2 size={14} className="text-amber-200/50" /> {p.size} <span className="text-xs text-slate-500">SQ FT</span></div>
                          <div className="flex items-center gap-2.5"><Home size={14} className="text-amber-200/50" /> {p.type}</div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-white/5">
                          <button
                            onClick={() => openEditProp(p)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 transition-colors">
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setConfirmPayload({ endpoint: 'properties', id: p.property_id, label: p.name })}
                            className="flex items-center justify-center p-2 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                            title="Delete Estate">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}

          {/* ─── TENANTS ─── */}
          {tab === 'tenants' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {tenants.length === 0
                ? <EmptyState icon={Users} title="No Clients Yet" sub="Register your first esteemed tenant to begin." />
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-white/10">
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">ID</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Client Name</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Contact</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Email</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {tenants.map(t => (
                          <tr key={t.tenant_id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{t.tenant_id}</td>
                            <td className="px-6 py-4 font-playfair text-base text-white">{t.name}</td>
                            <td className="px-6 py-4 text-slate-400 font-light">{t.contact_number}</td>
                            <td className="px-6 py-4 text-slate-400 font-light">{t.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditTenant(t)}
                                  className="p-2 rounded-lg text-amber-200/70 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setConfirmPayload({ endpoint: 'tenants', id: t.tenant_id, label: t.name })}
                                  className="p-2 rounded-lg text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* ─── LEASES ─── */}
          {tab === 'leases' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {leases.length === 0
                ? <EmptyState icon={FileText} title="No Active Agreements" sub="Draft a lease contract linking a client to a property." />
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-white/10">
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Contract #</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Estate</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Lessee</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-widest text-slate-400">Timeline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leases.map(l => (
                          <tr key={l.lease_id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-5 text-slate-500 font-mono text-xs">#{l.lease_id}</td>
                            <td className="px-6 py-5 font-playfair text-base text-white">{l.property_name}</td>
                            <td className="px-6 py-5 text-slate-300 font-light">{l.tenant_name}</td>
                            <td className="px-6 py-5 text-slate-400 font-light flex items-center gap-3">
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{new Date(l.start_date).toLocaleDateString()}</span>
                              <ChevronRight size={12} className="text-slate-600" />
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{new Date(l.end_date).toLocaleDateString()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* ─── OPERATIONS ─── */}
          {tab === 'operations' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

              {/* Payments */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[70vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/40">
                  <h2 className="font-playfair text-lg text-white font-medium tracking-wide flex items-center gap-2"><DollarSign size={18} className="text-emerald-400" /> Financial Ledger</h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">{payments.length} Records</span>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {payments.length === 0
                    ? <EmptyState icon={CreditCard} title="Ledger Empty" sub="Transactions will appear here once logged." />
                    : (
                      <div className="divide-y divide-white/5">
                        {payments.map(p => (
                          <div key={p.payment_id} className="flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors rounded-xl mx-2 my-1">
                            <div>
                              <p className="font-playfair text-lg text-white">₹{Number(p.amount).toLocaleString()}</p>
                              <p className="text-xs text-slate-400 font-light mt-1 uppercase tracking-wide">{p.tenant_name} • {new Date(p.payment_date).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${methodColors[p.payment_method] || 'bg-white/5 text-slate-400 border border-white/10'}`}>
                              {p.payment_method}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Maintenance */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[70vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/40">
                  <h2 className="font-playfair text-lg text-white font-medium tracking-wide flex items-center gap-2"><Wrench size={18} className="text-rose-400" /> Service Desk</h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">{maintenance.length} Open</span>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {maintenance.length === 0
                    ? <EmptyState icon={AlertCircle} title="No Active Issues" sub="Maintenance tickets will queue up here." />
                    : (
                      <div className="divide-y divide-white/5">
                        {maintenance.map(m => (
                          <div key={m.request_id} className="flex items-start justify-between px-4 py-4 hover:bg-white/5 transition-colors rounded-xl mx-2 my-1 gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-playfair text-white text-base truncate">{m.property_name}</p>
                              <p className="text-sm text-slate-400 font-light leading-relaxed mt-1 line-clamp-2">{m.description}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">{new Date(m.request_date).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex-shrink-0 ${statusColors[m.status] || 'bg-white/5 text-slate-400 border border-white/10'}`}>
                              {m.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ══ MODALS ══ */}

      <Modal isOpen={showPropModal} onClose={() => { setShowPropModal(false); setEditPropId(null); }} title={editPropId ? 'Modify Estate Details' : 'Add New Estate'}>
        <form onSubmit={handlePropSubmit} className="space-y-5">
          <InputField label="Estate Designation" required placeholder="e.g. Palazzo Infinity" value={propForm.name} onChange={e => setPropForm({ ...propForm, name: e.target.value })} />
          <InputField label="Locale" required placeholder="e.g. Monaco, French Riviera" value={propForm.location} onChange={e => setPropForm({ ...propForm, location: e.target.value })} />
          <InputField label="Footprint (sq ft)" required type="number" placeholder="e.g. 5200" value={propForm.size} onChange={e => setPropForm({ ...propForm, size: e.target.value })} />
          <SelectField label="Architecture Typology" value={propForm.type} onChange={e => setPropForm({ ...propForm, type: e.target.value })}>
            <option value="Apartment">Luxury Apartment</option>
            <option value="House">Townhouse</option>
            <option value="Villa">Estate / Villa</option>
          </SelectField>
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => { setShowPropModal(false); setEditPropId(null); }}
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              {editPropId ? 'Apply Updates' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showTenantModal} onClose={() => { setShowTenantModal(false); setEditTenantId(null); }} title={editTenantId ? 'Update Client Record' : 'Register New Client'}>
        <form onSubmit={handleTenantSubmit} className="space-y-5">
          <InputField label="Full Legal Name" required placeholder="e.g. Arthur Pendragon" value={tenantForm.name} onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })} />
          <InputField label="Direct Contact" required placeholder="e.g. +44 20 7946 0958" value={tenantForm.contact_number} onChange={e => setTenantForm({ ...tenantForm, contact_number: e.target.value })} />
          <InputField label="Private Email" required type="email" placeholder="e.g. contact@domain.com" value={tenantForm.email} onChange={e => setTenantForm({ ...tenantForm, email: e.target.value })} />
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => { setShowTenantModal(false); setEditTenantId(null); }}
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              {editTenantId ? 'Update Ledger' : 'Register Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Other modals follow same style */}
      <Modal isOpen={showLeaseModal} onClose={() => setShowLeaseModal(false)} title="Draft Agreement">
        <form onSubmit={(e) => { e.preventDefault(); genericPost('leases', leaseForm, () => setLeaseForm({ property_id: '', tenant_id: '', start_date: '', end_date: '' }), setShowLeaseModal, 'Lease'); }} className="space-y-5">
          <SelectField label="Estate" required value={leaseForm.property_id} onChange={e => setLeaseForm({ ...leaseForm, property_id: e.target.value })}>
            <option value="">-- Select Estate --</option>
            {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.name}</option>)}
          </SelectField>
          <SelectField label="Client" required value={leaseForm.tenant_id} onChange={e => setLeaseForm({ ...leaseForm, tenant_id: e.target.value })}>
            <option value="">-- Select Client --</option>
            {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>)}
          </SelectField>
          <InputField label="Commencement" required type="date" value={leaseForm.start_date} onChange={e => setLeaseForm({ ...leaseForm, start_date: e.target.value })} />
          <InputField label="Conclusion" required type="date" value={leaseForm.end_date} onChange={e => setLeaseForm({ ...leaseForm, end_date: e.target.value })} />
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setShowLeaseModal(false)}
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">Ratify Agreement</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Log Transaction">
        <form onSubmit={(e) => { e.preventDefault(); genericPost('payments', payForm, () => setPayForm({ lease_id: '', amount: '', payment_date: '', payment_method: 'UPI' }), setShowPayModal, 'Payment'); }} className="space-y-5">
          <SelectField label="Contract Reference" required value={payForm.lease_id} onChange={e => setPayForm({ ...payForm, lease_id: e.target.value })}>
            <option value="">-- Select Contract --</option>
            {leases.map(l => <option key={l.lease_id} value={l.lease_id}>Contract #{l.lease_id} — {l.tenant_name}</option>)}
          </SelectField>
          <InputField label="Capital (₹)" required type="number" placeholder="e.g. 250000" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} />
          <InputField label="Date Received" required type="date" value={payForm.payment_date} onChange={e => setPayForm({ ...payForm, payment_date: e.target.value })} />
          <SelectField label="Transfer Protocol" value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Wire / Bank Transfer</option>
            <option value="Cash">Physical Tender</option>
          </SelectField>
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setShowPayModal(false)}
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-emerald-900 bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all">Log Deposit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMaintModal} onClose={() => setShowMaintModal(false)} title="Lodge Service Request">
        <form onSubmit={(e) => { e.preventDefault(); genericPost('maintenance', maintForm, () => setMaintForm({ lease_id: '', request_date: '', description: '' }), setShowMaintModal, 'Request'); }} className="space-y-5">
          <SelectField label="Asset Registry" required value={maintForm.lease_id} onChange={e => setMaintForm({ ...maintForm, lease_id: e.target.value })}>
            <option value="">-- Select Asset --</option>
            {leases.map(l => <option key={l.lease_id} value={l.lease_id}>{l.property_name} (Contract #{l.lease_id})</option>)}
          </SelectField>
          <InputField label="Date Discovered" required type="date" value={maintForm.request_date} onChange={e => setMaintForm({ ...maintForm, request_date: e.target.value })} />
          <TextareaField label="Detail Logs" required placeholder="Outline the required concierge service..." value={maintForm.description} onChange={e => setMaintForm({ ...maintForm, description: e.target.value })} />
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setShowMaintModal(false)}
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest font-bold text-rose-900 bg-rose-400 hover:bg-rose-300 shadow-[0_0_15px_rgba(251,113,133,0.3)] transition-all">Submit Ticket</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}