import { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';

type AdminPortalProps = { onBack: () => void };

export default function AdminPortal({ onBack }: AdminPortalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
      if (!supabaseUrl || !publishableKey) {
        throw new Error('Admin login is not configured for this preview build. Supabase URL or publishable key is missing.');
      }
      const response = await fetch(`${supabaseUrl.replace(/\\/$/, '')}/functions/v1/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: publishableKey },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Admin sign-in is not configured yet.');
      if (!result.access_token) throw new Error('The authentication service returned no session.');
      sessionStorage.setItem('tanshu_admin_session', JSON.stringify(result));
      window.location.assign('/admin');
    } catch (e) {
      setError(e instanceof TypeError
        ? 'The admin server could not be reached from this preview. Its exact preview URL may need to be added to the Supabase admin-login CORS allow-list.'
        : e instanceof Error ? e.message : 'Unable to sign in.');
    } finally { setBusy(false); }
  }

  return <main className="admin-auth-page">
    <style>{`
      .admin-auth-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 15% 10%,#253b63 0,transparent 45%),#090d18;color:#f8fafc;font-family:inherit}
      .admin-auth-card{width:min(100%,430px);padding:36px;border:1px solid #34415b;border-radius:22px;background:#111827;box-shadow:0 24px 80px #0008}
      .admin-auth-mark{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#243b63;color:#a9c7ff}
      .admin-auth-eyebrow{margin:22px 0 8px;color:#9db7e9;font-size:11px;font-weight:800;letter-spacing:.16em}
      .admin-auth-card h1{margin:0;font-size:32px;letter-spacing:-.04em}
      .admin-auth-copy{margin:12px 0 26px;color:#aab5c8;line-height:1.6}
      .admin-auth-card form{display:grid;gap:10px}
      .admin-auth-card label{margin-top:6px;font-size:13px;font-weight:700;color:#dce5f5}
      .admin-auth-card input{width:100%;box-sizing:border-box;border:1px solid #3a4861;border-radius:10px;background:#0b1220;color:white;padding:13px 14px;font:inherit;outline:none}
      .admin-auth-card input:focus{border-color:#86aefb;box-shadow:0 0 0 3px #86aefb22}
      .admin-auth-card form button{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:12px;border:0;border-radius:10px;padding:14px;background:#a9c7ff;color:#101827;font-weight:800;cursor:pointer}
      .admin-auth-card form button:disabled{opacity:.6;cursor:wait}
      .admin-auth-error{margin:4px 0;color:#ffaaa8;font-size:13px}
      .admin-auth-note{display:flex;align-items:center;gap:8px;color:#8e9bb0;font-size:12px;margin:20px 0}
      .admin-auth-back{border:0;background:transparent;color:#a9c7ff;padding:6px 0;cursor:pointer}
    `}</style>
    <section className="admin-auth-card">
      <div className="admin-auth-mark"><ShieldCheck size={24}/></div>
      <p className="admin-auth-eyebrow">TANSHU DIGITAL TOOLS · ADMIN</p>
      <h1>Admin Login</h1>
      <p className="admin-auth-copy">Sign in to manage thumbnail previews and publish approved thumbnail changes.</p>
      <form onSubmit={signIn}>
        <label htmlFor="admin-username">Admin username</label>
        <input id="admin-username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <p className="admin-auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}><LogIn size={16}/>{busy ? 'Signing in…' : 'Sign in securely'}</button>
      </form>
      <p className="admin-auth-note"><LockKeyhole size={14}/> Admin access is verified by the server.</p>
      <button className="admin-auth-back" type="button" onClick={onBack}>Back to website</button>
    </section>
  </main>;
}
