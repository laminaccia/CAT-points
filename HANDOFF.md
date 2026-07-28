# Passaggi di consegne

Registro degli interventi, il più recente in testa. Ogni agente scrive qui
prima di chiudere: cosa ha cambiato, cosa ha scoperto, cosa resta aperto.

---

## 2026-07-29 — L'offline funziona davvero; procedura di pubblicazione

*Agente: Claude. Toccati `service-worker.js`, `app.js`, `index.html`.*

L'utente vuole pubblicare l'app e ha chiesto di correggere prima l'offline,
lasciando a lui i passi della pubblicazione.

### La correzione dell'offline

In `AGENTS.md` §9 avevo annotato due rimedi possibili; **nessuno dei due era
buono**. Elencare in `ASSETS` gli URL versionati costringe ad aggiornare la
lista a ogni bump (tre numeri da tenere allineati a mano, destinati a
divergere); usare `ignoreSearch: true` al posto della ricerca esatta avrebbe
tolto al `?v=N` la sua unica funzione, servendo il CSS vecchio a chi ha appena
pubblicato il nuovo.

La soluzione adottata è una terza: il gestore `fetch` prova **in ordine**
corrispondenza esatta → rete (mettendo in cache la URL esatta scaricata) →
corrispondenza ignorando la query. L'ultimo passo scatta solo quando la rete è
fallita, quindi il `?v=N` conserva intatto il suo valore di cache-buster e
offline si ripiega su una versione vecchia soltanto quando l'alternativa è non
mostrare niente. Nessun numero in più da tenere allineato.

### Un secondo bug, preesistente, che l'offline ha fatto emergere

Corretto l'aggancio della cache, offline arrivavano CSS e JS ma **la mappa
restava bianca**. Non era la cache: l'immagine era caricata (`naturalWidth`
7559). `app.js` è deferred, quindi parte a parsing finito, e quando la mappa
arriva dalla cache è già completa a quel punto: l'evento `load` a cui era
appeso `fitImage()` non scatta più e la mappa non veniva mai inquadrata — si
vedeva l'angolo dell'immagine a grandezza naturale, che è campagna vuota.

Una riga: `if (image.complete && image.naturalWidth) fitImage();`. Il bug
c'era da sempre e colpiva **anche online dalla seconda visita in poi**; è
emerso solo ora perché prima, offline, non si arrivava nemmeno a caricare il JS.

### Verificato col server spento

Non simulato: `preview_stop`, conferma che la rete rifiuta le richieste, poi
ricarica. Mappa inquadrata, coordinate del mirino attive, ricerca funzionante
(`chianipodda` → Piazza dottor Nicolò Mazzara, dall'indice in cache), nessun
errore in console. Screenshot agli atti.

Versioni: `app.js?v=18` in `index.html`, `CACHE` a `mappa-squadra-v20`.

### Pubblicazione

Scritto `PUBBLICARE.md` su richiesta dell'utente, che preferisce eseguire i
passi da sé. In sintesi: **serve HTTPS obbligatoriamente** (senza, niente
service worker, niente PWA, niente offline); l'app gira già da qualunque
sottocartella senza modifiche perché manifest e percorsi sono relativi;
consigliato Cloudflare Pages per via dei 5,6 MB del primo caricamento.

Sui domini: `.xyz` non è gratuito, è solo economico — i sottodomini `.pages.dev`
o `.github.io` sì, e per un link che gira su WhatsApp bastano.

### Da valutare

- **Peso del primo caricamento: 5,6 MB.** Il PDF da 1,35 MB è precaricato e
  non serve all'app: toglierlo da `ASSETS` è guadagno netto.
- **Diritti sulla mappa**: pubblicare la distribuisce. Da verificare prima.
- `gh` non è installato: il repository remoto va creato dal sito.

---

## 2026-07-29 — Primo lotto di punti curati fuso nell'indice delle vie

*Agente: Claude. Toccati `assets/streets.json` (rigenerato) e `CACHE` nel
service worker.*

L'utente ha passato un lotto di **216 punti raccolti a mano** con lo strumento
dell'app, chiedendo di pulirli, confrontarli con `assets/streets.json` e
unificarli — annunciando che ne arriveranno altri. Da qui la scelta di scrivere
uno strumento invece di fare il lavoro una volta sola a mano.

### Com'è cambiato l'impianto

`assets/streets.json` **non si modifica più a mano: è generato.** Le sorgenti
stanno in `data/sorgenti/` (`estrazione-pdf.json` intoccata + `lotto-NN.json`) e
`tools/merge-streets.py` ricostruisce l'indice da zero a ogni lancio.

La ricostruzione da zero non è un dettaglio: la prima versione dello script
leggeva `assets/streets.json` e ci riscriveva sopra, e al secondo lotto i punti
curati la volta prima sarebbero stati trattati come dati grezzi — quindi
rinominabili. Ora il risultato non dipende dall'ordine dei lotti ed è ripetibile
(verificato: due lanci di fila danno lo stesso file).

### Risultato

161 voci PDF (145 dopo aver collassato i doppioni interni) + 216 curate →
**321 voci**. Nessuna voce curata persa, verificato.

- **40 scartate** — l'estrazione aveva lo stesso posto con un nome peggiore.
- **18 riqualificate** — altri tratti della stessa via: tengono le coordinate
  del PDF e adottano il nome curato, così le occorrenze compaiono tutte con
  la stessa etichetta.
- **68 solo PDF** — tutta la zona est e sud che i lotti non coprono ancora
  (contrade Affacciatura, Cannizza, Franco, Granatello, Margi, Rina, Vignazzi,
  Piazza Cannolicchio, Viale Europa, i cortili Amari/Anello/Canova/Etna/
  Farini/Genovese/Gianni/Milana).

### Decisione presa con l'utente

**Vince sempre il lotto manuale**: «il PDF ha errori che io ho corretto».
Scritto in `AGENTS.md` §5-bis.

### Due errori di metodo, corretti prima di scrivere l'indice

1. **Abbinare per solo nome è troppo grossolano.** «Strada Patti» finiva su
   «Ponte Patti» perché condividono il tag *Patti*: distano 0.60, mezza mappa.
   Stessa cosa per «Contrada Cappuccini» → «Chiesa dei Cappuccini».
2. **Abbinare per sola distanza non basta.** «C/le Sciaffino» non si agganciava
   alla «Cortile Schiaffino» curata a 0.0026, per via di una `h`.

Rimedio: nome e distanza insieme, tre soglie (stesso spillo / stesso posto /
stessa via) e un controllo sul **tipo** di luogo — una contrada non diventa una
via né una chiesa. Tutto commentato nello script.

### Consegna: attenzione al service worker

Aggiornare `assets/streets.json` **da solo non serve a niente**: il service
worker lo serve dalla cache. Bumpato `CACHE` a `mappa-squadra-v18`. Va fatto a
ogni ricostruzione dell'indice.

### Verificato in browser

321 voci caricate, cache `mappa-squadra-v18` attiva, nessun errore in console.
Ricerche provate: `chianipodda` → Piazza dottor Nicolò Mazzara, `u signuri` →
Chiesa del Santissimo Crocifisso, `cassara` → Cortile Pietro Cassarà (accenti
ok), `granatello` e `cannolicchio` (solo PDF) trovati, `via` → nessun risultato
com'è giusto, `gallo` → 4 punti numerati distinti nell'interfaccia.

### Da valutare

- **18 voci «da decidere»**: nome imparentato ma punto lontano. I casi veri:
  `Dottor Biagio Gallo` è una persona diversa da Leonardo Gallo (via mancante
  dai lotti, non un doppione); `Via Garibaldi` ×3 e `Corso Vittorio Emanuele`
  ×2 potrebbero essere tratti lontani o vie distinte; `Via Autuori` ×2 sta fra
  Giovanni e Fernando. `python3 tools/merge-streets.py --dry-run` li rielenca.
- **`Via Padre Pio` accanto a `Villa Padre Pio`** (0.0078): quasi certamente la
  stessa cosa, tenute separate dal controllo sul tipo.
- **`Via Acquanuova` ~ `Via Acquanova`** (96% simili, distanti 0.018): variante
  di grafia, probabilmente da fondere.
- Le **68 etichette solo-PDF** restano grezze finché un lotto non le copre.

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
