import React, { useState } from 'react';
import { api, setToken } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [groupName, setGroupName] = useState('Mi familia');
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.auth.login({ email, password })
        : await api.auth.register({ email, password, groupName, name });

      setToken(res.accessToken);
      nav('/patients');
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{maxWidth:560, margin:'0 auto'}}>
      <h2>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h2>
      <p className="muted" style={{marginTop:0}}>
        {mode === 'login' ? 'Entrá con tu usuario y contraseña.' : 'Te crea un grupo familiar y te deja como admin.'}
      </p>

      <div className="row" style={{marginBottom:10}}>
        <button className={`btn small ${mode==='login'?'primary':''}`} onClick={()=>setMode('login')}>Login</button>
        <button className={`btn small ${mode==='register'?'primary':''}`} onClick={()=>setMode('register')}>Registro</button>
      </div>

      <form onSubmit={submit} className="list">
        {mode === 'register' && (
          <>
            <input className="input" placeholder="Tu nombre (opcional)" value={name} onChange={e=>setName(e.target.value)} />
            <input className="input" placeholder="Nombre del grupo (ej: Familia Maidana)" value={groupName} onChange={e=>setGroupName(e.target.value)} />
          </>
        )}
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Contraseña (mín 6)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="badge danger">⚠️ {err}</div>}
        <button className="btn primary" disabled={loading}>{loading ? '...' : (mode==='login'?'Entrar':'Crear cuenta')}</button>
      </form>

      <hr />
      <p className="muted" style={{margin:0}}>
        Tip: en producción, poné HTTPS y un dominio para el backend. GitHub Pages es solo frontend.
      </p>
    </div>
  );
}
