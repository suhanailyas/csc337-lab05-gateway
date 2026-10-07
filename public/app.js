(async () => {
  const out = document.getElementById('out');
  const r = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' });
  if (!r.ok) return (out.textContent = 'Not logged in');
  const { accessToken } = await r.json();
  const p = await fetch('/api/v1/employee/profile', { headers: { Authorization: 'Bearer ' + accessToken } });
  out.textContent = 'OAuth login OK\n\n' + JSON.stringify(await p.json(), null, 2);
})();