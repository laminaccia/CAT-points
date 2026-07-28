# Come mettere online Mappa Squadra

Procedura per pubblicare l'app. È un sito statico senza backend, quindi il
lavoro vero è poco: la parte delicata è una sola, l'HTTPS.

---

## Il vincolo da cui dipende tutto: serve HTTPS

**Il service worker non si registra su HTTP semplice** (l'unica eccezione è
`localhost`). Senza HTTPS:

- niente installazione come app sul telefono,
- niente funzionamento offline,
- su iPhone resta bloccata anche la copia dell'immagine negli appunti — è la
  stessa limitazione già annotata nel README.

Tutti gli host elencati qui sotto danno HTTPS automatico e gratuito. Non serve
comprare né configurare certificati.

L'app è già pronta per essere servita da qualunque percorso, anche da una
sottocartella tipo `utente.github.io/map-marker-pwa/`: il manifest usa solo
percorsi relativi e il service worker riconosce la mappa con `endsWith`.
Nessuna modifica al codice, qualunque host si scelga.

---

## Dove pubblicare

| Host | Dominio gratuito incluso | Note |
|------|--------------------------|------|
| **Cloudflare Pages** | `nome.pages.dev` | CDN migliore: conta, con 5,6 MB da scaricare al primo accesso |
| **GitHub Pages** | `nome.github.io` | Pubblicare diventa `git push`, il repo è già pronto |
| Netlify | `nome.netlify.app` | Equivalente |
| Vercel | `nome.vercel.app` | Equivalente |

**Consigliato: Cloudflare Pages**, per il peso della mappa. La differenza si
sente quando trenta persone aprono il link nello stesso momento all'inizio del
gioco.

### Cloudflare Pages, senza git

1. Account gratuito su `dash.cloudflare.com`.
2. **Workers & Pages → Create → Pages → Upload assets**.
3. Trascinare **il contenuto** della cartella del progetto (non la cartella
   stessa): `index.html` deve stare alla radice.
4. Scegliere il nome del progetto: diventa `nome.pages.dev`.
5. Deploy. Online in meno di un minuto, HTTPS già attivo.

Per aggiornare: stessa schermata, **Create new deployment**, si ricarica.

Cosa **non** caricare: `data/`, `tools/`, `AGENTS.md`, `CLAUDE.md`,
`CODEX.md`, `HANDOFF.md`, `PUBBLICARE.md`, `.claude/`. Non fanno male, ma sono
materiale di lavoro e resterebbero pubblici. Serve solo: `index.html`,
`styles.css`, `app.js`, `service-worker.js`, `manifest.webmanifest`, `assets/`.

### Cloudflare Pages, collegato a git

Richiede prima di caricare il repository su GitHub o GitLab (vedi sotto).
Poi **Create → Pages → Connect to Git**, si sceglie il repo, si lascia vuoto
il comando di build (non c'è build) e si mette `/` come directory di output.
Da lì ogni `git push` ripubblica da solo.

### GitHub Pages

`gh` non è installato su questa macchina, quindi il repository va creato dal
sito.

1. Su `github.com` creare un repository **vuoto** (senza README).
2. Dalla cartella del progetto:

   ```bash
   git remote add origin https://github.com/UTENTE/NOME.git
   git push -u origin main
   ```

3. **Settings → Pages → Source: Deploy from a branch**, ramo `main`,
   cartella `/ (root)`. Salvare.
4. Dopo un paio di minuti è su `https://UTENTE.github.io/NOME/`.

Attenzione: un repository pubblico rende pubblici anche i file di lavoro e
tutta la storia dei commit. Se non va bene, o si usa un repo privato (GitHub
Pages funziona anche così sui piani a pagamento) oppure si preferisce il
caricamento manuale su Cloudflare.

---

## Il dominio

Chiariamo un equivoco: **non esistono domini «pubblici» da prendere
liberamente**. `.xyz` è solo un'estensione economica — il primo anno costa
pochi euro da registrar come Cloudflare Registrar, Porkbun o Namecheap, ma al
rinnovo torna sull'ordine dei 10-15 € l'anno. I prezzi cambiano spesso:
verificarli al momento dell'acquisto.

Quello che è **davvero gratuito** è il sottodominio dell'host
(`mappacaccia.pages.dev`), HTTPS incluso, zero rinnovi da ricordare. Per un
link che passa nelle chat durante una caccia al tesoro è più che sufficiente:
nessuno lo digita a mano, lo tocca e basta.

Un dominio proprio conviene solo se deve restare stabile negli anni ed essere
**dettabile a voce**. In quel caso sceglierlo corto: `mappacaccia.xyz` si detta
al telefono, `caccia-al-tesoro-calatafimi-segesta.xyz` no.

Collegarlo è poi banale: su Cloudflare Pages **Custom domains → Set up a
domain**, e i record DNS li configura da solo se il dominio è registrato lì.

---

## Prima di pubblicare

- [x] **L'offline funziona** — corretto il 2026-07-29 e verificato col server
      spento. Era il punto critico: quest'app serve in strada, dove il segnale
      cade.
- [ ] **Alleggerire il primo caricamento.** Oggi sono 5,6 MB. Togliere
      `assets/map-placeholder.pdf` da `ASSETS` nel service worker ne libera
      1,35: è il sorgente della mappa, l'app non lo apre mai. Restano 4,2 MB,
      quasi tutti la locandina — comprimibile (vedi `AGENTS.md` §9).
- [ ] **Verificare i diritti sulla mappa.** Pubblicare significa distribuirla.
      Se la base cartografica viene da un fornitore terzo o dal Comune, va
      controllato di poterla diffondere online. È l'unica cosa di questa lista
      che nessuno può verificare al posto di chi pubblica.
- [ ] **Provarla su un telefono vero**, non solo sul simulatore: pan, zoom,
      «Condividi PNG» verso WhatsApp, e l'installazione dalla schermata Home.

---

## Dopo ogni aggiornamento

Ricaricare i file **non basta**: il service worker serve dalla cache. Vale la
regola di `AGENTS.md` §5 — bumpare il `?v=N` del file modificato in
`index.html` **e** il numero in `CACHE` dentro `service-worker.js`. Senza il
secondo, chi ha già aperto l'app continua a vedere la versione vecchia.

Lo stesso vale per l'indice delle vie: dopo `tools/merge-streets.py` va sempre
bumpato `CACHE`.
