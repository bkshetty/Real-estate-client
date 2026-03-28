import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Building2, Users, FileText, Wrench, LayoutDashboard,
  Plus, Pencil, Trash2, MapPin, Maximize2, Home,
  CreditCard, AlertCircle, ChevronRight, DollarSign,
  Phone, Mail, Calendar, Hash
} from 'lucide-react';
import Modal, { ConfirmModal } from './Modal';

/* ─── helpers ─────────────────────────────────────────────── */
const API = 'http://localhost:3000/api';

const typeColors = {
  Apartment: 'bg-blue-100 text-blue-700',
  House:     'bg-emerald-100 text-emerald-700',
  Villa:     'bg-purple-100 text-purple-700',
};

const methodColors = {
  UPI:           'bg-blue-100 text-blue-700',
  'Bank Transfer':'bg-indigo-100 text-indigo-700',
  Cash:           'bg-yellow-100 text-yellow-700',
};

const statusColors = {
  Pending:  'bg-rose-100 text-rose-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
      <Icon size={48} strokeWidth={1.2} />
      <p className="text-lg font-semibold text-slate-500">{title}</p>
      <p className="text-sm">{sub}</p>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>}
      <input
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>}
      <select
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function TextareaField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>}
      <textarea
        rows={3}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-vertical"
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
  const [tab, setTab] = useState('properties');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── data states ── */
  const [properties,  setProperties]  = useState([]);
  const [tenants,     setTenants]     = useState([]);
  const [leases,      setLeases]      = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments,    setPayments]    = useState([]);

  /* ── modal open flags ── */
  const [showPropModal,   setShowPropModal]   = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showLeaseModal,  setShowLeaseModal]  = useState(false);
  const [showPayModal,    setShowPayModal]    = useState(false);
  const [showMaintModal,  setShowMaintModal]  = useState(false);

  /* ── confirm delete ── */
  const [confirmPayload, setConfirmPayload] = useState(null); // { endpoint, id, label }

  /* ── edit IDs ── */
  const [editPropId,   setEditPropId]   = useState(null);
  const [editTenantId, setEditTenantId] = useState(null);

  /* ── form states ── */
  const [propForm,   setPropForm]   = useState({ name: '', location: '', size: '', type: 'Apartment' });
  const [tenantForm, setTenantForm] = useState({ name: '', contact_number: '', email: '' });
  const [leaseForm,  setLeaseForm]  = useState({ property_id: '', tenant_id: '', start_date: '', end_date: '' });
  const [maintForm,  setMaintForm]  = useState({ lease_id: '', request_date: '', description: '' });
  const [payForm,    setPayForm]    = useState({ lease_id: '', amount: '', payment_date: '', payment_method: 'UPI' });

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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' } }} />

      {/* ── CONFIRM MODAL ── */}
      <ConfirmModal
        isOpen={!!confirmPayload}
        onClose={() => setConfirmPayload(null)}
        onConfirm={() => deleteItem(confirmPayload.endpoint, confirmPayload.id)}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${confirmPayload?.label}"? This action cannot be undone.`}
      />

      {/* ══ SIDEBAR ══ */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={16} />
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sm leading-tight whitespace-nowrap overflow-hidden">
              RE Dashboard
            </span>
          )}
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${tab === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
              {sidebarOpen && tab === id && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </button>
          ))}
        </nav>

        {/* collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="m-3 p-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          <ChevronRight size={18} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* top header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {currentSection && <currentSection.icon size={20} className="text-indigo-500" />}
              {currentSection?.label}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Real Estate Management System</p>
          </div>
          {/* Add button per section */}
          {tab === 'properties' && (
            <button id="add-property-btn" onClick={() => { setEditPropId(null); setPropForm({ name: '', location: '', size: '', type: 'Apartment' }); setShowPropModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
              <Plus size={16} /> Add Property
            </button>
          )}
          {tab === 'tenants' && (
            <button id="add-tenant-btn" onClick={() => { setEditTenantId(null); setTenantForm({ name: '', contact_number: '', email: '' }); setShowTenantModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
              <Plus size={16} /> Add Tenant
            </button>
          )}
          {tab === 'leases' && (
            <button id="add-lease-btn" onClick={() => setShowLeaseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
              <Plus size={16} /> New Lease
            </button>
          )}
          {tab === 'operations' && (
            <div className="flex gap-2">
              <button id="add-payment-btn" onClick={() => setShowPayModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">
                <DollarSign size={15} /> Payment
              </button>
              <button id="add-maintenance-btn" onClick={() => setShowMaintModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 active:scale-95 transition-all shadow-sm">
                <Wrench size={15} /> Maintenance
              </button>
            </div>
          )}
        </header>

        {/* content area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ─── PROPERTIES ─── */}
          {tab === 'properties' && (
            <>
              {properties.length === 0
                ? <EmptyState icon={Building2} title="No properties yet" sub="Click 'Add Property' to get started." />
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {properties.map(p => (
                      <div key={p.property_id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-800 text-base">{p.name}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${typeColors[p.type] || 'bg-slate-100 text-slate-600'}`}>
                            {p.type}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-slate-500">
                          <div className="flex items-center gap-2"><MapPin size={13} className="text-slate-400" /> {p.location}</div>
                          <div className="flex items-center gap-2"><Maximize2 size={13} className="text-slate-400" /> {p.size} sq ft</div>
                          <div className="flex items-center gap-2"><Home size={13} className="text-slate-400" /> {p.type}</div>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-100 mt-auto">
                          <button id={`edit-prop-${p.property_id}`}
                            onClick={() => openEditProp(p)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">
                            <Pencil size={12} /> Edit
                          </button>
                          <button id={`delete-prop-${p.property_id}`}
                            onClick={() => setConfirmPayload({ endpoint: 'properties', id: p.property_id, label: p.name })}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                            <Trash2 size={12} /> Delete
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {tenants.length === 0
                ? <EmptyState icon={Users} title="No tenants yet" sub="Click 'Add Tenant' to register a tenant." />
                : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-5 py-3 text-left font-semibold text-slate-600"><Hash size={13} className="inline mr-1" />ID</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600">Name</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600"><Phone size={13} className="inline mr-1" />Phone</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600"><Mail size={13} className="inline mr-1" />Email</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((t, i) => (
                        <tr key={t.tenant_id} className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/60'}`}>
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{t.tenant_id}</td>
                          <td className="px-5 py-3.5 font-medium text-slate-800">{t.name}</td>
                          <td className="px-5 py-3.5 text-slate-500">{t.contact_number}</td>
                          <td className="px-5 py-3.5 text-slate-500">{t.email}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              <button id={`edit-tenant-${t.tenant_id}`}
                                onClick={() => openEditTenant(t)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">
                                <Pencil size={11} /> Edit
                              </button>
                              <button id={`delete-tenant-${t.tenant_id}`}
                                onClick={() => setConfirmPayload({ endpoint: 'tenants', id: t.tenant_id, label: t.name })}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                <Trash2 size={11} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* ─── LEASES ─── */}
          {tab === 'leases' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {leases.length === 0
                ? <EmptyState icon={FileText} title="No leases yet" sub="Click 'New Lease' to create a lease agreement." />
                : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-5 py-3 text-left font-semibold text-slate-600">Lease #</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600">Property</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600">Tenant</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600"><Calendar size={13} className="inline mr-1" />Start</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-600"><Calendar size={13} className="inline mr-1" />End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leases.map((l, i) => (
                        <tr key={l.lease_id} className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/60'}`}>
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{l.lease_id}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-800">{l.property_name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{l.tenant_name}</td>
                          <td className="px-5 py-3.5 text-slate-500">{new Date(l.start_date).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-slate-500">{new Date(l.end_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* ─── OPERATIONS ─── */}
          {tab === 'operations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Payments */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-700 flex items-center gap-2"><DollarSign size={17} className="text-emerald-500" /> Payments</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{payments.length} entries</span>
                </div>
                {payments.length === 0
                  ? <EmptyState icon={CreditCard} title="No payments" sub="Record a payment to see it here." />
                  : (
                    <div className="divide-y divide-slate-100">
                      {payments.map(p => (
                        <div key={p.payment_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                          <div>
                            <p className="font-bold text-slate-800 text-base">₹{Number(p.amount).toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{p.tenant_name} · {new Date(p.payment_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${methodColors[p.payment_method] || 'bg-slate-100 text-slate-600'}`}>
                            {p.payment_method}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Maintenance */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-700 flex items-center gap-2"><Wrench size={17} className="text-rose-500" /> Maintenance</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{maintenance.length} requests</span>
                </div>
                {maintenance.length === 0
                  ? <EmptyState icon={AlertCircle} title="No requests" sub="Log a maintenance issue to see it here." />
                  : (
                    <div className="divide-y divide-slate-100">
                      {maintenance.map(m => (
                        <div key={m.request_id} className="flex items-start justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{m.property_name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.description}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(m.request_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[m.status] || 'bg-slate-100 text-slate-600'}`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ══ MODALS ══ */}

      {/* Property Modal */}
      <Modal isOpen={showPropModal} onClose={() => { setShowPropModal(false); setEditPropId(null); }} title={editPropId ? 'Edit Property' : 'Add Property'}>
        <form onSubmit={handlePropSubmit} className="space-y-4">
          <InputField label="Property Name" required placeholder="e.g. Sunshine Apartments 3B" value={propForm.name} onChange={e => setPropForm({ ...propForm, name: e.target.value })} />
          <InputField label="Location" required placeholder="e.g. Mumbai, Maharashtra" value={propForm.location} onChange={e => setPropForm({ ...propForm, location: e.target.value })} />
          <InputField label="Size (sq ft)" required type="number" placeholder="e.g. 1200" value={propForm.size} onChange={e => setPropForm({ ...propForm, size: e.target.value })} />
          <SelectField label="Type" value={propForm.type} onChange={e => setPropForm({ ...propForm, type: e.target.value })}>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
          </SelectField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowPropModal(false); setEditPropId(null); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              {editPropId ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Tenant Modal */}
      <Modal isOpen={showTenantModal} onClose={() => { setShowTenantModal(false); setEditTenantId(null); }} title={editTenantId ? 'Edit Tenant' : 'Add Tenant'}>
        <form onSubmit={handleTenantSubmit} className="space-y-4">
          <InputField label="Full Name" required placeholder="e.g. Rahul Sharma" value={tenantForm.name} onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })} />
          <InputField label="Phone" required placeholder="e.g. 9876543210" value={tenantForm.contact_number} onChange={e => setTenantForm({ ...tenantForm, contact_number: e.target.value })} />
          <InputField label="Email" required type="email" placeholder="e.g. rahul@email.com" value={tenantForm.email} onChange={e => setTenantForm({ ...tenantForm, email: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowTenantModal(false); setEditTenantId(null); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              {editTenantId ? 'Save Changes' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lease Modal */}
      <Modal isOpen={showLeaseModal} onClose={() => setShowLeaseModal(false)} title="Create New Lease">
        <form onSubmit={(e) => { e.preventDefault(); genericPost('leases', leaseForm, () => setLeaseForm({ property_id: '', tenant_id: '', start_date: '', end_date: '' }), setShowLeaseModal, 'Lease'); }} className="space-y-4">
          <SelectField label="Property" required value={leaseForm.property_id} onChange={e => setLeaseForm({ ...leaseForm, property_id: e.target.value })}>
            <option value="">-- Select Property --</option>
            {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.name}</option>)}
          </SelectField>
          <SelectField label="Tenant" required value={leaseForm.tenant_id} onChange={e => setLeaseForm({ ...leaseForm, tenant_id: e.target.value })}>
            <option value="">-- Select Tenant --</option>
            {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>)}
          </SelectField>
          <InputField label="Start Date" required type="date" value={leaseForm.start_date} onChange={e => setLeaseForm({ ...leaseForm, start_date: e.target.value })} />
          <InputField label="End Date" required type="date" value={leaseForm.end_date} onChange={e => setLeaseForm({ ...leaseForm, end_date: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowLeaseModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Create Lease</button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment">
        <form onSubmit={(e) => { e.preventDefault(); genericPost('payments', payForm, () => setPayForm({ lease_id: '', amount: '', payment_date: '', payment_method: 'UPI' }), setShowPayModal, 'Payment'); }} className="space-y-4">
          <SelectField label="Lease" required value={payForm.lease_id} onChange={e => setPayForm({ ...payForm, lease_id: e.target.value })}>
            <option value="">-- Select Lease --</option>
            {leases.map(l => <option key={l.lease_id} value={l.lease_id}>Lease #{l.lease_id} — {l.tenant_name}</option>)}
          </SelectField>
          <InputField label="Amount (₹)" required type="number" placeholder="e.g. 25000" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} />
          <InputField label="Payment Date" required type="date" value={payForm.payment_date} onChange={e => setPayForm({ ...payForm, payment_date: e.target.value })} />
          <SelectField label="Payment Method" value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </SelectField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowPayModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">Record Payment</button>
          </div>
        </form>
      </Modal>

      {/* Maintenance Modal */}
      <Modal isOpen={showMaintModal} onClose={() => setShowMaintModal(false)} title="Log Maintenance Request">
        <form onSubmit={(e) => { e.preventDefault(); genericPost('maintenance', maintForm, () => setMaintForm({ lease_id: '', request_date: '', description: '' }), setShowMaintModal, 'Request'); }} className="space-y-4">
          <SelectField label="Property / Lease" required value={maintForm.lease_id} onChange={e => setMaintForm({ ...maintForm, lease_id: e.target.value })}>
            <option value="">-- Select Lease --</option>
            {leases.map(l => <option key={l.lease_id} value={l.lease_id}>{l.property_name} (Lease #{l.lease_id})</option>)}
          </SelectField>
          <InputField label="Request Date" required type="date" value={maintForm.request_date} onChange={e => setMaintForm({ ...maintForm, request_date: e.target.value })} />
          <TextareaField label="Description" required placeholder="Describe the issue in detail..." value={maintForm.description} onChange={e => setMaintForm({ ...maintForm, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowMaintModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors">Log Issue</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}