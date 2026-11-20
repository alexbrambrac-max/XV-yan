/* ============================================================
   CONFIGURACIÓN — pega aquí los datos de tu proyecto de Supabase
   (Supabase → Project Settings → API). La clave "anon"/"publishable"
   es pública por diseño: la seguridad la ponen las reglas de supabase/setup.sql.
   ============================================================ */
window.XV = {
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_KEY: "TU-CLAVE-ANON-O-PUBLISHABLE",
};

/* ---------- no hace falta tocar nada de aquí para abajo ---------- */
(function () {
  const script = document.currentScript;
  // Raíz del sitio (funciona en usuario.github.io/XV-yan/ y en cualquier subcarpeta)
  XV.BASE = new URL(".", script.src).href;
  XV.URL_SUBIR = XV.BASE;
  XV.listo = XV.SUPABASE_URL.indexOf("TU-PROYECTO") === -1;
  XV.db = XV.listo ? supabase.createClient(XV.SUPABASE_URL, XV.SUPABASE_KEY, { auth: { persistSession: true, storageKey: "xv-yan-sesion" } }) : null;

  /* Fotos (tabla public.fotos + bucket "fotos") */
  XV.listar = async function () {
    const { data, error } = await XV.db.from("fotos").select("id,path,nombre,mensaje,created_at").order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  };
  const firmadas = new Map(); // path → {url, vence}
  XV.urls = async function (paths) {
    const ahora = Date.now(), faltan = paths.filter((p) => !firmadas.has(p) || firmadas.get(p).vence < ahora + 3600e3);
    for (let i = 0; i < faltan.length; i += 100) {
      const lote = faltan.slice(i, i + 100);
      const { data, error } = await XV.db.storage.from("fotos").createSignedUrls(lote, 86400);
      if (error) throw error;
      data.forEach((d) => { if (d.signedUrl) firmadas.set(d.path, { url: d.signedUrl, vence: ahora + 86400e3 }); });
    }
    const out = {}; paths.forEach((p) => { if (firmadas.has(p)) out[p] = firmadas.get(p).url; }); return out;
  };
  XV.borrar = async function (foto) {
    const r1 = await XV.db.storage.from("fotos").remove([foto.path]); if (r1.error) throw r1.error;
    const r2 = await XV.db.from("fotos").delete().eq("id", foto.id); if (r2.error) throw r2.error;
  };

  /* Aviso si falta configurar Supabase */
  XV.avisoConfig = function () {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:auto 16px 16px 16px;z-index:99;padding:14px 16px;border-radius:12px;background:#2a0611;border:1px solid #d8b25a;color:#fbf3e4;font:500 14px/1.4 Montserrat,system-ui,sans-serif";
    d.textContent = "Falta configurar Supabase: edita docs/config.js con la URL y la clave de tu proyecto.";
    document.body.append(d);
  };

  /* Inicio de sesión de los dueños (pantalla, galería y panel) */
  XV.sesion = async function (alEntrar) {
    if (!XV.listo) { XV.avisoConfig(); return; }
    const { data } = await XV.db.auth.getSession();
    if (data.session) return alEntrar(data.session);
    const css = document.createElement("style");
    css.textContent = `.xv-login{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse 80% 70% at 50% 30%,#6a1830,#3d0a1a 60%,#22050f);font-family:"Cormorant Garamond",Georgia,serif;color:#fbf3e4}
.xv-login form{width:min(100%,380px);display:grid;gap:14px;text-align:center}
.xv-login .s{font-family:"Pinyon Script",cursive;font-size:72px;line-height:1;color:#e9c977}
.xv-login .c{font:600 11px Montserrat,system-ui,sans-serif;letter-spacing:.5em;color:#d8b25a}
.xv-login p{margin:0 0 6px;font-style:italic;font-size:20px}
.xv-login label{display:grid;gap:6px;text-align:left;font:600 11px Montserrat,system-ui,sans-serif;letter-spacing:.2em;color:#e9c977}
.xv-login input{height:50px;padding:0 16px;border-radius:12px;border:1.5px solid rgba(216,178,90,.55);background:rgba(251,243,228,.08);color:#fbf3e4;font:20px "Cormorant Garamond",Georgia,serif}
.xv-login button{height:54px;border:0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,#fff1c4,#d8b25a 55%,#b98a35);color:#2a0611;font:600 14px Montserrat,system-ui,sans-serif;letter-spacing:.2em}
.xv-login .e{min-height:18px;font:500 13px Montserrat,system-ui,sans-serif;color:#ffc2c2}`;
    document.head.append(css);
    const w = document.createElement("div"); w.className = "xv-login";
    w.innerHTML = `<form><div class="c">MIS XV AÑOS</div><div class="s">Yan</div><p>Acceso solo para los dueños</p>
      <label>CORREO<input type="email" id="xvCorreo" autocomplete="username" required></label>
      <label>CONTRASEÑA<input type="password" id="xvPass" autocomplete="current-password" required></label>
      <div class="e" role="alert"></div><button type="submit">ENTRAR</button></form>`;
    document.body.append(w);
    w.querySelector("form").onsubmit = async (e) => {
      e.preventDefault(); const b = w.querySelector("button"); b.disabled = true; b.textContent = "ENTRANDO…";
      const { data, error } = await XV.db.auth.signInWithPassword({ email: w.querySelector("#xvCorreo").value.trim(), password: w.querySelector("#xvPass").value });
      b.disabled = false; b.textContent = "ENTRAR";
      if (error) { w.querySelector(".e").textContent = "Correo o contraseña incorrectos."; return; }
      w.remove(); alEntrar(data.session);
    };
  };
  XV.salir = async function () { await XV.db.auth.signOut(); location.reload(); };
})();
