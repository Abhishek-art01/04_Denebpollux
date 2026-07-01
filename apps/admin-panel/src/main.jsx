import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./supabase.js";
import "./styles.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Users" },
  { id: "apps", label: "Apps" },
  { id: "settings", label: "Settings" },
];

const STAT_CARDS = [
  { label: "Active users", value: "1", hint: "Supabase session" },
  { label: "Apps linked", value: "8", hint: "Monorepo frontends" },
  { label: "Pending approvals", value: "0", hint: "Ready for workflow" },
  { label: "Auth provider", value: "Supabase", hint: "Email sign-in" },
];

function getRole(user) {
  return user?.app_metadata?.role || user?.user_metadata?.role || "admin";
}

function AppShell({ session, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const user = session.user;
  const role = useMemo(() => getRole(user), [user]);

  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">DP</div>
          <div className="brand-copy">
            <strong>Admin Panel</strong>
            <span>Supabase Auth</span>
          </div>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{(user.email || user.id || "U").slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{user.email || "Signed in"}</strong>
              <small>{role}</small>
            </div>
          </div>
          <button className="secondary-button" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <main className="workspace-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">Denebpollux</span>
            <h1>{NAV_ITEMS.find((item) => item.id === active)?.label || "Dashboard"}</h1>
          </div>
          <div className="status-pill">Authenticated</div>
        </header>

        <section className="page-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Session</span>
                <h2>Current access</h2>
              </div>
            </div>
            <dl className="info-list">
              <div>
                <dt>Email</dt>
                <dd>{user.email || "-"}</dd>
              </div>
              <div>
                <dt>User ID</dt>
                <dd>{user.id}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{role}</dd>
              </div>
              <div>
                <dt>Last sign in</dt>
                <dd>{new Date(user.last_sign_in_at || Date.now()).toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Operations</span>
                <h2>Work queue</h2>
              </div>
            </div>
            <div className="queue-list">
              <div className="queue-item">
                <strong>Vendor payment approvals</strong>
                <span>Pending rules, deduction checks, and CFO sign-off.</span>
              </div>
              <div className="queue-item">
                <strong>Portal access</strong>
                <span>Use Supabase roles to control who can open each app.</span>
              </div>
              <div className="queue-item">
                <strong>Audit trail</strong>
                <span>Connect this panel to the shared backend logs next.</span>
              </div>
            </div>
          </section>

          <section className="cards-row">
            {STAT_CARDS.map((card) => (
              <article className="metric-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, busy, error, setError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div>
          <span className="eyebrow">Denebpollux</span>
          <h1>Admin Panel</h1>
          <p>Supabase login for access to the shared portal system.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="helper-text">
          Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel or your local env.
        </p>
      </section>
    </main>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setBusy(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setBusy(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(email, password) {
    setBusy(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (loginError) throw loginError;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (busy && !session) {
    return <main className="login-page"><div className="loading-card">Loading Supabase session...</div></main>;
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} busy={busy} error={error} setError={setError} />;
  }

  return <AppShell session={session} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
