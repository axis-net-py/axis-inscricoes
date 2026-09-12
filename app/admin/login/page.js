export default async function Login({ searchParams }) {
  const q = await searchParams;
  return (
    <main className="admin-shell admin-login" lang="pt-BR">
      <section className="admin-login-card" aria-labelledby="login-title">
        <span className="admin-kicker">ÁREA ADMINISTRATIVA</span>
        <h1 id="login-title">AXIS <em>CRM</em></h1>
        <p>Acesse suas inscrições e contatos.</p>
        <form method="post" action="/api/admin/login">
          <div className="field">
            <label htmlFor="admin-password">Senha administrativa</label>
            <input id="admin-password" name="password" type="password"
              autoComplete="current-password" required
              aria-invalid={q?.error ? true : undefined}
              aria-describedby={q?.error ? 'login-error' : undefined} />
          </div>
          {q?.error && <p id="login-error" className="admin-login-error" role="alert">Senha inválida. Tente novamente.</p>}
          <button className="admin-login-submit" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
