import { useState, useEffect } from 'react';

function App() {
  const [tab, setTab] = useState('properties');
  
  // Database States
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);

  // Edit States (The 'U' in CRUD)
  const [editPropId, setEditPropId] = useState(null);
  const [editTenantId, setEditTenantId] = useState(null);

  // Form States
  const [propForm, setPropForm] = useState({ name: '', location: '', size: '', type: 'Apartment' });
  const [tenantForm, setTenantForm] = useState({ name: '', contact_number: '', email: '' });
  const [leaseForm, setLeaseForm] = useState({ property_id: '', tenant_id: '', start_date: '', end_date: '' });
  const [maintForm, setMaintForm] = useState({ lease_id: '', request_date: '', description: '' });
  const [payForm, setPayForm] = useState({ lease_id: '', amount: '', payment_date: '', payment_method: 'UPI' });

  // Fetch All Data
  const fetchData = () => {
    fetch('http://localhost:3000/api/properties').then(r => r.json()).then(setProperties);
    fetch('http://localhost:3000/api/tenants').then(r => r.json()).then(setTenants);
    fetch('http://localhost:3000/api/leases').then(r => r.json()).then(setLeases);
    fetch('http://localhost:3000/api/maintenance').then(r => r.json()).then(setMaintenance);
    fetch('http://localhost:3000/api/payments').then(r => r.json()).then(setPayments);
  };
  useEffect(() => { fetchData(); }, []);

  // --- SUBMIT HANDLERS (Create & Update) ---
  const handlePropSubmit = (e) => {
    e.preventDefault();
    const method = editPropId ? 'PUT' : 'POST';
    const url = editPropId ? `http://localhost:3000/api/properties/${editPropId}` : 'http://localhost:3000/api/properties';
    
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(propForm) })
      .then(() => { fetchData(); setPropForm({ name: '', location: '', size: '', type: 'Apartment' }); setEditPropId(null); });
  };

  const handleTenantSubmit = (e) => {
    e.preventDefault();
    const method = editTenantId ? 'PUT' : 'POST';
    const url = editTenantId ? `http://localhost:3000/api/tenants/${editTenantId}` : 'http://localhost:3000/api/tenants';

    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tenantForm) })
      .then(() => { fetchData(); setTenantForm({ name: '', contact_number: '', email: '' }); setEditTenantId(null); });
  };

  const genericPost = (endpoint, data, resetForm) => {
    fetch(`http://localhost:3000/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(() => { fetchData(); resetForm(); alert('Success!'); });
  };

  const deleteItem = (endpoint, id) => {
    if (!window.confirm("Are you sure?")) return;
    fetch(`http://localhost:3000/api/${endpoint}/${id}`, { method: 'DELETE' }).then(fetchData);
  };

  // --- UI STYLES ---
  const btnStyle = { padding: '8px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const inputStyle = { padding: '8px', flex: '1', minWidth: '150px' };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center' }}>🏢 Advanced Real Estate RDBMS</h1>
      
      {/* NAVIGATION BAR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', borderBottom: '2px solid #ddd', marginBottom: '20px', paddingBottom: '10px' }}>
        {['properties', 'tenants', 'leases', 'operations'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', color: tab === t ? '#3498db' : '#7f8c8d', borderBottom: tab === t ? '3px solid #3498db' : 'none', cursor: 'pointer' }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* --- TAB 1: PROPERTIES --- */}
      {tab === 'properties' && (
        <div>
          <form onSubmit={handlePropSubmit} style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input required style={inputStyle} type="text" placeholder="Name" value={propForm.name} onChange={e => setPropForm({...propForm, name: e.target.value})} />
            <input required style={inputStyle} type="text" placeholder="Location" value={propForm.location} onChange={e => setPropForm({...propForm, location: e.target.value})} />
            <input required style={inputStyle} type="number" placeholder="Size" value={propForm.size} onChange={e => setPropForm({...propForm, size: e.target.value})} />
            <select style={inputStyle} value={propForm.type} onChange={e => setPropForm({...propForm, type: e.target.value})}>
              <option value="Apartment">Apartment</option><option value="House">House</option><option value="Villa">Villa</option>
            </select>
            <button type="submit" style={{ ...btnStyle, background: editPropId ? '#f39c12' : '#2ecc71' }}>{editPropId ? 'Update Property' : 'Add Property'}</button>
            {editPropId && <button type="button" onClick={() => {setEditPropId(null); setPropForm({ name: '', location: '', size: '', type: 'Apartment' })}} style={{...btnStyle, background: '#95a5a6'}}>Cancel</button>}
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {properties.map(p => (
              <div key={p.property_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{p.name}</h3>
                <p>📍 {p.location} | 🏠 {p.type} | 📐 {p.size} sqft</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => { setPropForm(p); setEditPropId(p.property_id); window.scrollTo(0,0); }} style={{ ...btnStyle, background: '#f39c12', padding: '5px 10px' }}>Edit</button>
                  <button onClick={() => deleteItem('properties', p.property_id)} style={{ ...btnStyle, background: '#e74c3c', padding: '5px 10px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: TENANTS --- */}
      {tab === 'tenants' && (
        <div>
          <form onSubmit={handleTenantSubmit} style={{ background: '#fdf3e7', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <input required style={inputStyle} type="text" placeholder="Full Name" value={tenantForm.name} onChange={e => setTenantForm({...tenantForm, name: e.target.value})} />
            <input required style={inputStyle} type="text" placeholder="Phone" value={tenantForm.contact_number} onChange={e => setTenantForm({...tenantForm, contact_number: e.target.value})} />
            <input required style={inputStyle} type="email" placeholder="Email" value={tenantForm.email} onChange={e => setTenantForm({...tenantForm, email: e.target.value})} />
            <button type="submit" style={{ ...btnStyle, background: editTenantId ? '#f39c12' : '#e67e22' }}>{editTenantId ? 'Update Tenant' : 'Add Tenant'}</button>
          </form>

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#e67e22', color: 'white' }}><th style={{padding:'10px'}}>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.tenant_id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{padding:'10px'}}>{t.tenant_id}</td><td>{t.name}</td><td>{t.contact_number}</td><td>{t.email}</td>
                  <td>
                    <button onClick={() => { setTenantForm(t); setEditTenantId(t.tenant_id); }} style={{ ...btnStyle, background: '#f39c12', padding: '5px 10px', marginRight: '5px' }}>Edit</button>
                    <button onClick={() => deleteItem('tenants', t.tenant_id)} style={{ ...btnStyle, background: '#e74c3c', padding: '5px 10px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 3: LEASES --- */}
      {tab === 'leases' && (
        <div>
          <form onSubmit={(e) => { e.preventDefault(); genericPost('leases', leaseForm, () => setLeaseForm({ property_id: '', tenant_id: '', start_date: '', end_date: '' })); }} style={{ background: '#f5eef8', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <select required style={inputStyle} value={leaseForm.property_id} onChange={e => setLeaseForm({...leaseForm, property_id: e.target.value})}>
              <option value="">-- Select Property --</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.name}</option>)}
            </select>
            <select required style={inputStyle} value={leaseForm.tenant_id} onChange={e => setLeaseForm({...leaseForm, tenant_id: e.target.value})}>
              <option value="">-- Select Tenant --</option>
              {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>)}
            </select>
            <input required style={inputStyle} type="date" title="Start Date" value={leaseForm.start_date} onChange={e => setLeaseForm({...leaseForm, start_date: e.target.value})} />
            <input required style={inputStyle} type="date" title="End Date" value={leaseForm.end_date} onChange={e => setLeaseForm({...leaseForm, end_date: e.target.value})} />
            <button type="submit" style={{ ...btnStyle, background: '#8e44ad' }}>Create Lease</button>
          </form>

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#8e44ad', color: 'white' }}><th style={{padding:'10px'}}>Lease #</th><th>Property</th><th>Tenant</th><th>Start</th><th>End</th></tr></thead>
            <tbody>
              {leases.map(l => (
                <tr key={l.lease_id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{padding:'10px'}}>{l.lease_id}</td><td><strong>{l.property_name}</strong></td><td>{l.tenant_name}</td>
                  <td>{new Date(l.start_date).toLocaleDateString()}</td><td>{new Date(l.end_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 4: OPERATIONS (Payments & Maintenance) --- */}
      {tab === 'operations' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* PAYMENTS SECTION */}
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#27ae60' }}>💰 Payments</h2>
            <form onSubmit={(e) => { e.preventDefault(); genericPost('payments', payForm, () => setPayForm({ lease_id: '', amount: '', payment_date: '', payment_method: 'UPI' })); }} style={{ background: '#e9f7ef', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select required style={inputStyle} value={payForm.lease_id} onChange={e => setPayForm({...payForm, lease_id: e.target.value})}>
                <option value="">-- Select Active Lease --</option>
                {leases.map(l => <option key={l.lease_id} value={l.lease_id}>Lease #{l.lease_id} - {l.tenant_name}</option>)}
              </select>
              <input required style={inputStyle} type="number" placeholder="Amount (₹)" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />
              <input required style={inputStyle} type="date" value={payForm.payment_date} onChange={e => setPayForm({...payForm, payment_date: e.target.value})} />
              <select style={inputStyle} value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}>
                <option value="UPI">UPI</option><option value="Bank Transfer">Bank Transfer</option><option value="Cash">Cash</option>
              </select>
              <button type="submit" style={{ ...btnStyle, background: '#27ae60' }}>Record Payment</button>
            </form>
            
            {payments.map(p => (
              <div key={p.payment_id} style={{ borderLeft: '4px solid #27ae60', padding: '10px', margin: '10px 0', background: '#f9f9f9' }}>
                <strong>₹{p.amount}</strong> paid by {p.tenant_name} on {new Date(p.payment_date).toLocaleDateString()} via {p.payment_method}
              </div>
            ))}
          </div>

          {/* MAINTENANCE SECTION */}
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#c0392b' }}>🛠️ Maintenance</h2>
            <form onSubmit={(e) => { e.preventDefault(); genericPost('maintenance', maintForm, () => setMaintForm({ lease_id: '', request_date: '', description: '' })); }} style={{ background: '#fdedec', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select required style={inputStyle} value={maintForm.lease_id} onChange={e => setMaintForm({...maintForm, lease_id: e.target.value})}>
                <option value="">-- Select Property/Lease --</option>
                {leases.map(l => <option key={l.lease_id} value={l.lease_id}>{l.property_name} (Lease #{l.lease_id})</option>)}
              </select>
              <input required style={inputStyle} type="date" value={maintForm.request_date} onChange={e => setMaintForm({...maintForm, request_date: e.target.value})} />
              <textarea required style={{...inputStyle, resize: 'vertical'}} placeholder="Describe the issue..." value={maintForm.description} onChange={e => setMaintForm({...maintForm, description: e.target.value})} />
              <button type="submit" style={{ ...btnStyle, background: '#c0392b' }}>Log Issue</button>
            </form>

            {maintenance.map(m => (
              <div key={m.request_id} style={{ borderLeft: '4px solid #c0392b', padding: '10px', margin: '10px 0', background: '#f9f9f9' }}>
                <strong>{m.property_name}</strong>: {m.description} <br/>
                <small style={{color: '#7f8c8d'}}>Reported on: {new Date(m.request_date).toLocaleDateString()} | Status: {m.status}</small>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default App;