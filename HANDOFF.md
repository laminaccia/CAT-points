# Passaggi di consegne

Registro degli interventi, il più recente in testa. Ogni agente scrive qui
prima di chiudere: cosa ha cambiato, cosa ha scoperto, cosa resta aperto.

---

## 2026-07-28 — Il progetto passa sotto git; regole condivise Claude/Codex

*Agente: Claude. Nessuna modifica al codice dell'app.*

Il progetto non era un repository git: nessuno storico, nessun modo di vedere
chi avesse cambiato cosa, nessun rollback. Con due agenti che lavorano sugli
stessi file era la prima cosa da sistemare.

- `git init` sul ramo `main` e **primo commit dello stato esistente**
  (`66a174b`), fatto *prima* di toccare qualsiasi cosa: quel commit è la base
  di partenza, il lavoro di Codex così com'era.
- `.gitignore`: `.DS_Store`, `.claude/settings.local.json`, `.impeccable/`.

### Un'unica fonte di verità per le regole

`CODEX.md` era l'unico documento di istruzioni e non era leggibile da Claude.
Invece di affiancargli un `CLAUDE.md` gemello — due file che divergono nel giro
di poche sessioni — le regole sono state unificate:

- **`AGENTS.md`** (nuovo) — tutte le regole. È il nome che Codex legge da
  convenzione.
- **`CLAUDE.md`** (nuovo) — importa `AGENTS.md` con `@AGENTS.md`, e aggiunge
  solo ciò che riguarda l'harness di Claude (preview sulla 8010, IIFE per
  `javascript_tool`, verifica in browser).
- **`CODEX.md`** — ora è un rimando ad `AGENTS.md`. Il suo testo originale è
  interamente confluito lì e resta comunque nel primo commit.

`AGENTS.md` documenta anche quello che il codice fa ma nessun documento
diceva: ricerca vie su `assets/streets.json`, pannello coordinate e lista
manuale dei punti (strumenti per chi *prepara* il gioco, non per chi ci gioca),
`localStorage` legato al singolo dispositivo.

### Scoperto verificando in browser

Tre problemi reali, **nessuno corretto** — sono in `AGENTS.md` §9 e vanno
decisi con l'utente, perché toccano la cache e quindi i telefoni su cui l'app
è già installata.

1. **L'offline non funziona.** Il service worker mette in cache `./styles.css`
   e `./app.js` senza query, ma `index.html` li chiede come `styles.css?v=13` e
   `app.js?v=17`, e `caches.match()` considera la query parte dell'identità.
   Verificato in console: `match('/styles.css?v=13')` → `false`, con
   `{ignoreSearch: true}` → `true`. Online la richiesta cade su rete e tutto
   sembra a posto; offline CSS e JS non arrivano e resta un guscio HTML nudo.
   Il criterio di accettazione «la PWA si apre anche offline» oggi è falso.
2. **La mappa pesa 4,4 MB** ed è precaricata all'installazione.
3. **Il PDF (1,35 MB) è precaricato ma non serve all'app:** nessun riferimento
   a runtime, è solo il sorgente della mappa. Toglierlo da `ASSETS` è guadagno
   netto.

### Modifiche ai file

- `AGENTS.md`, `CLAUDE.md`, `HANDOFF.md`, `.gitignore`, `.claude/launch.json`
  (nuovi); `CODEX.md` (svuotato, ora rimanda).
- Nessun file dell'app toccato: `index.html`, `styles.css`, `app.js`,
  `service-worker.js`, `manifest.webmanifest`, `assets/` invariati.
- Fuori progetto: aggiunta la configurazione `mappa-squadra` (porta 8010) a
  `caccia_site_v32/.claude/launch.json`, perché `preview_start` legge il
  `launch.json` della directory di lavoro primaria e non quello di questo
  progetto.

### Da valutare

- I tre problemi qui sopra, in ordine: l'offline è il più grave perché
  contraddice un criterio di accettazione dichiarato.
- Il pannello coordinate e la lista manuale sono strumenti da organizzatore
  mostrati a tutti, giocatori compresi. Se l'app va in mano ai partecipanti,
  vale la pena chiedersi se nasconderli dietro un gesto o un parametro.
