import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      setPatients(await api.patients.list());
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim()) return;
    await api.patients.create({ displayName: name.trim() });
    setName('');
    load();
  }

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Pacientes</h2>
          <p className="muted">Elegí un paciente para ver tomas, stock y alertas.</p>
          {err && <div className="badge danger">⚠️ {err}</div>}
          <div className="list">
            {patients.map(p => (
              <div key={p.id} className="item">
                <div className="item-left">
                  <b>{p.displayName}</b>
                  <span className="muted">{p.timezone}</span>
                </div>
                <div className="item-actions">
                  <Link className="btn small primary" to={`/patients/${p.id}`}>Abrir</Link>
                </div>
              </div>
            ))}
            {!patients.length && <div className="muted">No hay pacientes todavía.</div>}
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card">
          <h2>Agregar paciente</h2>
          <p className="muted">Ej: “Tío Juan”, “Abuela”.</p>
          <div className="list">
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" />
            <button className="btn green" onClick={create}>Crear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
