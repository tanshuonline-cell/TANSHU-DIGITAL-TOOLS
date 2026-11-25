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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Admin sign-in is not configured yet.');
      if (!result.access_token) throw new Error('The authentication service returned no session.');
      sessionStorage.setItem('tanshu_admin_session', JSON.stringify(result));
      window.location.assign('/admin');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-auth-page">
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
