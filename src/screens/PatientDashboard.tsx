import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

function fmt(dt?: string) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString();
}

function badgeForDays(days: number) {
  if (days <= 0) return <span className="badge danger">⛔ 0 días</span>;
  if (days <= 2) return <span className="badge danger">⚠️ {days} días</span>;
  if (days <= 5) return <span className="badge warn">🟡 {days} días</span>;
  return <span className="badge">✅ {days} días</span>;
}

export default function PatientDashboard() {
  const { patientId } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal simple (state)
  const [showNew, setShowNew] = useState(false);

  async function load() {
    if (!patientId) return;
    setErr(null);
    setLoading(true);
    try {
      setData(await api.dashboard.get(patientId));
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [patientId]);

  async function take(medId: string) {
    try {
      await api.meds.take(medId);
      await load();
    } catch (e: any) {
      alert(e.message ?? 'Error');
    }
  }

  async function addStock(medId: string) {
    const raw = prompt('¿Cuánto vas a agregar al stock? (ej 30, 10.5)');
    if (!raw) return;
    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty <= 0) return alert('Cantidad inválida');
    try {
      await api.meds.addStock(medId, qty, 'Compra');
      await load();
    } catch (e: any) {
      alert(e.message ?? 'Error');
    }
  }

  async function snooze(medId: string, minutes: number) {
    try {
      await api.meds.snooze(medId, minutes);
      await load();
    } catch (e: any) {
      alert(e.message ?? 'Error');
    }
  }

  const patient = data?.patient;
  const medications = data?.medications ?? [];

  return (
    <div className="row">
      <div className="col" style={{minWidth:320}}>
        <div className="card">
          <div className="topbar">
            <div>
              <h2 style={{marginBottom:2}}>{patient?.displayName ?? 'Paciente'}</h2>
              <div className="muted">Zona horaria: {patient?.timezone}</div>
            </div>
            <button className="btn small primary" onClick={() => setShowNew(true)}>+ Medicamento</button>
          </div>

          {err && <div className="badge danger">⚠️ {err}</div>}
          {loading && <div className="muted">Cargando...</div>}

          <h3 style={{marginTop:8}}>Contactos de alerta (email)</h3>
          <Contacts patientId={patientId!} contacts={patient?.contacts ?? []} onChanged={load} />

          <hr />
          <p className="muted" style={{margin:0}}>
            Nota: las alertas de stock se mandan cuando se marca ✅ tomado (porque el stock solo baja ahí).
          </p>
        </div>
      </div>

      <div className="col">
        <div className="card">
          <h2>Medicamentos</h2>
          <p className="muted">✅ descuenta stock y recalcula la próxima toma (cada X horas).</p>

          <div className="list">
            {medications.map((m: any) => (
              <div key={m.id} className="card" style={{padding:12}}>
                <div className="item">
                  <div className="item-left">
                    <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
                      <b style={{fontSize:16}}>{m.name}</b>
                      {badgeForDays(m.daysRemaining)}
                    </div>
                    <div className="muted">
                      Intervalo: cada <b>{m.intervalHours}h</b> • Dosis: <b>{Number(m.doseQty).toFixed(2)}</b> • Stock: <b>{Number(m.stockQty).toFixed(2)}</b>
                    </div>
                    <div className="muted">Última toma: {fmt(m.lastTakenAt)} </div>
                    <div className="muted">Próxima toma: <b>{fmt(m.nextDueAt)}</b>{m.snoozedUntil ? ` (pospuesto hasta ${fmt(m.snoozedUntil)})` : ''}</div>
                  </div>

                  <div className="item-actions">
                    <button className="btn green small" onClick={() => take(m.id)}>✅ Tomado</button>
                    <button className="btn small" onClick={() => addStock(m.id)}>+ Stock</button>
                    <button className="btn small" onClick={() => snooze(m.id, 15)}>⏰ 15m</button>
                    <button className="btn small" onClick={() => snooze(m.id, 30)}>⏰ 30m</button>
                    <button className="btn small" onClick={() => snooze(m.id, 60)}>⏰ 60m</button>
                  </div>
                </div>
              </div>
            ))}
            {!medications.length && <div className="muted">Todavía no cargaste medicamentos.</div>}
          </div>
        </div>
      </div>

      {showNew && patientId && (
        <NewMedicationModal
          patientId={patientId}
          onClose={() => setShowNew(false)}
          onCreated={async () => { setShowNew(false); await load(); }}
        />
      )}
    </div>
  );
}

function Contacts({ patientId, contacts, onChanged }: { patientId: string; contacts: any[]; onChanged: () => void }) {
  const [email, setEmail] = useState('');

  async function add() {
    if (!email.trim()) return;
    try {
      await api.patients.addContact(patientId, email.trim());
      setEmail('');
      onChanged();
    } catch (e: any) {
      alert(e.message ?? 'Error');
    }
  }

  async function remove(contactId: string) {
    if (!confirm('¿Quitar contacto?')) return;
    await api.patients.removeContact(patientId, contactId);
    onChanged();
  }

  return (
    <div className="list">
      <div className="row">
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@ejemplo.com" />
        <button className="btn small primary" onClick={add}>Agregar</button>
      </div>
      {contacts.map((c) => (
        <div key={c.id} className="item">
          <div className="item-left">
            <b>{c.email}</b>
            <span className="muted">{c.enabled ? 'activo' : 'inactivo'}</span>
          </div>
          <div className="item-actions">
            <button className="btn small red" onClick={() => remove(c.id)}>Quitar</button>
          </div>
        </div>
      ))}
      {!contacts.length && <div className="muted">No hay contactos cargados.</div>}
    </div>
  );
}

function NewMedicationModal({ patientId, onClose, onCreated }: { patientId: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [intervalHours, setIntervalHours] = useState(12);
  const [doseQty, setDoseQty] = useState(1);
  const [stockQty, setStockQty] = useState(0);
  const [firstDueAt, setFirstDueAt] = useState<string>(''); // optional
  const [notes, setNotes] = useState('');

  async function create() {
    if (!name.trim()) return alert('Nombre requerido');
    try {
      await api.meds.create({
        patientId,
        name: name.trim(),
        intervalHours: Number(intervalHours),
        doseQty: Number(doseQty),
        stockQty: Number(stockQty),
        firstDueAt: firstDueAt ? new Date(firstDueAt).toISOString() : undefined,
        notes: notes || undefined,
      });
      onCreated();
    } catch (e: any) {
      alert(e.message ?? 'Error');
    }
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16
    }}>
      <div className="card" style={{maxWidth:640, width:'100%'}}>
        <div className="topbar">
          <h2>Nuevo medicamento</h2>
          <button className="btn small" onClick={onClose}>Cerrar</button>
        </div>

        <div className="list">
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre (ej: Diusartan)" />
          <div className="row">
            <div className="col">
              <label className="muted">Cada cuántas horas</label>
              <input className="input" type="number" min={1} value={intervalHours} onChange={e=>setIntervalHours(Number(e.target.value))} />
            </div>
            <div className="col">
              <label className="muted">Dosis por toma (0.5 / 1 / 2)</label>
              <input className="input" type="number" step="0.5" min={0.5} value={doseQty} onChange={e=>setDoseQty(Number(e.target.value))} />
            </div>
            <div className="col">
              <label className="muted">Stock inicial</label>
              <input className="input" type="number" step="0.5" min={0} value={stockQty} onChange={e=>setStockQty(Number(e.target.value))} />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <label className="muted">Primera toma (opcional)</label>
              <input className="input" type="datetime-local" value={firstDueAt} onChange={e=>setFirstDueAt(e.target.value)} />
              <div className="muted" style={{fontSize:13, marginTop:6}}>
                Si no seteás nada, arranca como: <b>ahora + intervalo</b>.
              </div>
            </div>
            <div className="col">
              <label className="muted">Notas (opcional)</label>
              <input className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej: tomar con comida" />
            </div>
          </div>

          <button className="btn green" onClick={create}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
