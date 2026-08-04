/*
  Sala presenze di CAT Points — Cloudflare Worker + Durable Object.

  Risponde a una domanda sola: chi ha l'app aperta adesso.

  Non c'è database, ed è voluto. La presenza è un'informazione che vive
  settantacinque secondi e poi non vale più niente: tenerla in memoria dentro
  un Durable Object basta e avanza. Se l'oggetto viene riavviato l'elenco si
  ricostruisce da solo al giro di battiti successivo, cioè entro mezzo minuto.

  Con un archivio vero, per giunta, si sbatterebbe contro un muro: trenta
  persone per tre ore di gioco fanno circa diecimila battiti, e il piano
  gratuito di Cloudflare KV ne scrive mille al giorno.
*/

// Chi non si fa sentire da 75 secondi è considerato uscito. Sono due battiti e
// mezzo: un pacchetto perso non fa sparire nessuno dall'elenco.
const TTL_MS = 75000;

// Un'unica sala per tutti. Il nome è fisso perché il gioco è uno solo.
const NOME_SALA = 'cat-points';

export class SalaPresenze {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.presenti = new Map();
  }

  ripulisci() {
    const limite = Date.now() - TTL_MS;
    for (const [id, voce] of this.presenti) {
      if (voce.visto < limite) this.presenti.delete(id);
    }
  }

  async leggiCorpo(request) {
    try {
      return JSON.parse(await request.text());
    } catch (errore) {
      return null;
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    this.ripulisci();

    if (url.pathname === '/presenza') {
      const dati = await this.leggiCorpo(request);
      const id = testo(dati && dati.id, 64);
      const nome = testo(dati && dati.nome, 50);
      // Senza identificativo non si saprebbe chi aggiornare; senza nome non
      // ci sarebbe niente da mostrare. In entrambi i casi si tace.
      if (!id || !nome) return new Response(null, { status: 204 });

      const precedente = this.presenti.get(id);
      this.presenti.set(id, {
        nome,
        dispositivo: testo(dati.dispositivo, 20),
        installata: dati.installata === true,
        // «Da quando è aperta» sopravvive ai singoli battiti, ma non a
        // un'uscita: chi chiude e riapre riparte da zero, che è quello che
        // l'organizzatore si aspetta di leggere.
        aperta: (precedente && precedente.aperta) || Date.now(),
        visto: Date.now()
      });
      return new Response(null, { status: 204 });
    }

    if (url.pathname === '/uscita') {
      const dati = await this.leggiCorpo(request);
      const id = testo(dati && dati.id, 64);
      if (id) this.presenti.delete(id);
      return new Response(null, { status: 204 });
    }

    if (url.pathname === '/presenti') {
      const adesso = Date.now();
      const elenco = [];
      for (const [id, voce] of this.presenti) {
        elenco.push({
          // Solo un frammento dell'identificativo: al pannello serve per
          // distinguere due telefoni, non per seguirne uno.
          id: id.slice(0, 6),
          nome: voce.nome,
          dispositivo: voce.dispositivo,
          installata: voce.installata,
          apertaDaSecondi: Math.round((adesso - voce.aperta) / 1000),
          vistoSecondiFa: Math.round((adesso - voce.visto) / 1000)
        });
      }
      elenco.sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }));
      return Response.json({ elenco });
    }

    return new Response('non trovato', { status: 404 });
  }
}

function testo(valore, massimo) {
  if (typeof valore !== 'string') return '';
  return valore.trim().slice(0, massimo);
}

function intestazioniCors(env) {
  return {
    // Va impostato in wrangler.toml sull'origine da cui l'app è servita.
    // L'asterisco è la rete di sicurezza per non lasciare il Worker muto se
    // qualcuno lo pubblica prima di configurarlo.
    'Access-Control-Allow-Origin': env.ORIGINE_APP || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Cat-Token',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = intestazioniCors(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/' || url.pathname === '/pannello') {
      return new Response(PANNELLO, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          // Il pannello non deve finire in nessuna cache intermedia: è una
          // pagina protetta da token.
          'Cache-Control': 'no-store'
        }
      });
    }

    if (url.pathname === '/presenti') {
      const atteso = env.TOKEN_AMMINISTRATORE;
      if (!atteso || request.headers.get('X-Cat-Token') !== atteso) {
        return new Response('non autorizzato', { status: 401, headers: cors });
      }
    }

    if (url.pathname === '/presenza' || url.pathname === '/uscita' || url.pathname === '/presenti') {
      const sala = env.SALA.get(env.SALA.idFromName(NOME_SALA));
      const risposta = await sala.fetch(new Request(url, request));
      const intestazioni = new Headers(risposta.headers);
      for (const [chiave, valore] of Object.entries(cors)) intestazioni.set(chiave, valore);
      return new Response(risposta.body, { status: risposta.status, headers: intestazioni });
    }

    return new Response('non trovato', { status: 404, headers: cors });
  }
};

// Il pannello dell'organizzatore. Sta qui dentro invece che nell'app perché i
// partecipanti non devono nemmeno sapere che indirizzo ha.
//
// Il token si digita in un campo e resta nella memoria della scheda, non
// nell'indirizzo: una URL con dentro la password finirebbe nella cronologia,
// nei log e nel primo messaggio in cui si condivide il link.
const PANNELLO = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>CAT Points · chi è collegato</title>
<style>
  :root {
    --bg: #090b10; --text: #f5f7fb; --muted: #9ba4b5; --accent: #d9b45b;
    --accent-2: #f5db8b; --surface: #10151d; --line: rgba(255,255,255,.14);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px 18px calc(env(safe-area-inset-bottom) + 32px);
    background: var(--bg); color: var(--text);
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  main { max-width: 560px; margin: 0 auto; }
  .eyebrow { margin: 0; color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: .16em; }
  h1 { margin: 6px 0 2px; font-size: 24px; letter-spacing: -.02em; }
  .sub { margin: 0 0 22px; color: var(--muted); font-size: 13px; line-height: 1.5; }
  form { display: flex; gap: 8px; flex-wrap: wrap; }
  input {
    flex: 1 1 200px; min-height: 46px; padding: 0 14px; border: 1px solid var(--line);
    border-radius: 12px; background: var(--surface); color: var(--text); font: inherit;
  }
  input:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 2px; }
  button {
    min-height: 46px; padding: 0 20px; border: 0; border-radius: 12px;
    background: var(--accent); color: #17191f; font: inherit; font-weight: 700; cursor: pointer;
  }
  button:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 2px; }
  .conteggio { margin: 0 0 4px; font-size: 34px; font-weight: 800; letter-spacing: -.03em; }
  .conteggio span { color: var(--accent-2); }
  .aggiornato { margin: 0 0 20px; color: var(--muted); font-size: 12px; }
  ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
  li {
    display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
    padding: 14px 16px; border: 1px solid var(--line); border-left: 2px solid var(--accent);
    border-radius: 12px; background: var(--surface);
  }
  .nome { font-size: 16px; font-weight: 700; }
  .dettaglio { color: var(--muted); font-size: 12px; }
  .vuoto { padding: 28px 18px; border: 1px dashed var(--line); border-radius: 12px; color: var(--muted); font-size: 14px; line-height: 1.55; text-align: center; }
  .errore { color: #ff5c65; font-size: 13px; }
  .nota { margin: 24px 0 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
  .hidden { display: none !important; }
</style>
</head>
<body>
<main>
  <p class="eyebrow">CAT POINTS</p>
  <h1>Chi è collegato adesso</h1>
  <p class="sub">Chi ha l'app aperta e davanti agli occhi in questo momento. Il telefono in tasca con lo schermo spento non compare: non è un errore, è cosa vuol dire «collegato».</p>

  <form id="accesso">
    <label class="hidden" for="token">Token</label>
    <input id="token" type="password" placeholder="Token di amministratore" autocomplete="current-password" required>
    <button type="submit">Entra</button>
  </form>
  <p class="errore hidden" id="errore" role="status" aria-live="polite"></p>

  <div class="hidden" id="pannello">
    <p class="conteggio"><span id="numero">0</span> collegati</p>
    <p class="aggiornato" id="aggiornato">—</p>
    <ul id="elenco" aria-live="polite"></ul>
    <div class="vuoto hidden" id="vuoto">Nessuno ha l'app aperta in questo momento.</div>
    <p class="nota">L'elenco si aggiorna da solo ogni 10 secondi. I nomi sono quelli che ciascuno ha scelto nell'app: non sono verificati.</p>
  </div>
</main>
<script>
(() => {
  "use strict";
  const accesso = document.getElementById('accesso');
  const campoToken = document.getElementById('token');
  const errore = document.getElementById('errore');
  const pannello = document.getElementById('pannello');
  const numero = document.getElementById('numero');
  const aggiornato = document.getElementById('aggiornato');
  const elenco = document.getElementById('elenco');
  const vuoto = document.getElementById('vuoto');
  let token = sessionStorage.getItem('cat-token') || '';
  let timer = null;

  function durata(secondi) {
    if (secondi < 60) return 'da meno di un minuto';
    const minuti = Math.round(secondi / 60);
    if (minuti < 60) return 'da ' + minuti + ' min';
    return 'da ' + Math.floor(minuti / 60) + ' h ' + (minuti % 60) + ' min';
  }

  function disegna(dati) {
    const voci = dati.elenco || [];
    numero.textContent = voci.length;
    vuoto.classList.toggle('hidden', voci.length > 0);
    elenco.replaceChildren();
    for (const voce of voci) {
      const riga = document.createElement('li');
      const nome = document.createElement('span');
      nome.className = 'nome';
      nome.textContent = voce.nome;
      const dettaglio = document.createElement('span');
      dettaglio.className = 'dettaglio';
      dettaglio.textContent = [
        voce.dispositivo,
        voce.installata ? 'app installata' : 'browser',
        'aperta ' + durata(voce.apertaDaSecondi),
        '#' + voce.id
      ].join(' · ');
      riga.append(nome, dettaglio);
      elenco.append(riga);
    }
    aggiornato.textContent = 'Aggiornato alle ' + new Date().toLocaleTimeString('it-IT');
  }

  async function carica() {
    try {
      const risposta = await fetch('/presenti', { headers: { 'X-Cat-Token': token }, cache: 'no-store' });
      if (risposta.status === 401) {
        fermati();
        sessionStorage.removeItem('cat-token');
        token = '';
        pannello.classList.add('hidden');
        accesso.classList.remove('hidden');
        mostraErrore('Token non valido.');
        return;
      }
      if (!risposta.ok) throw new Error(risposta.status);
      disegna(await risposta.json());
      errore.classList.add('hidden');
    } catch (e) {
      mostraErrore('Non riesco a leggere le presenze. Riprovo tra poco.');
    }
  }

  function mostraErrore(testo) {
    errore.textContent = testo;
    errore.classList.remove('hidden');
  }

  function fermati() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function entra() {
    accesso.classList.add('hidden');
    pannello.classList.remove('hidden');
    carica();
    fermati();
    timer = setInterval(carica, 10000);
  }

  accesso.addEventListener('submit', (evento) => {
    evento.preventDefault();
    token = campoToken.value.trim();
    if (!token) return;
    sessionStorage.setItem('cat-token', token);
    campoToken.value = '';
    entra();
  });

  document.addEventListener('visibilitychange', () => {
    if (!token) return;
    if (document.visibilityState === 'visible') entra();
    else fermati();
  });

  if (token) entra();
})();
</script>
</body>
</html>`;
