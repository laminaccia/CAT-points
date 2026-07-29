# Passaggi di consegne

Registro degli interventi, il più recente in testa. Ogni agente scrive qui
prima di chiudere: cosa ha cambiato, cosa ha scoperto, cosa resta aperto.

---

## 2026-07-29 — Campo etichetta nuovamente visibile

*Agente: Codex con skill Impeccable. Toccati `app.js`, `index.html`,
`service-worker.js`, `AGENTS.md`, `HANDOFF.md`.*

Il campo dell'editor etichetta era stato inserito dentro un `<label>` con
classe `.sr-only`: la classe nascondeva correttamente il testo accessibile, ma
anche tutto il campo annidato. Ora label e input sono elementi fratelli,
collegati tramite `for`/`id`, quindi il campo è visibile senza perdere
l'associazione per i lettori di schermo.

Bumpati `app.js?v=30` e `mappa-squadra-v37`; il CSS resta `styles.css?v=27`.

## 2026-07-29 — Etichette, revisione e reinvio dalla cronologia

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Ogni voce della cronologia offre ora quattro azioni: «Rivedi» ripristina il
marker sulla mappa, «Invia foto» lo ripristina e apre direttamente il flusso
di condivisione, «Etichetta» apre un editor inline, «Elimina» mantiene il
comportamento precedente. L'etichetta è facoltativa, lunga al massimo 40
caratteri e separata dal testo breve disegnato accanto al marker.

Quando una voce viene rivista, la foto rigenerata usa l'etichetta nel riquadro
inferiore e conserva la data di prima creazione del marker invece di fingere
che sia stato segnato adesso. I record già presenti restano compatibili:
l'assenza del nuovo campo `label` equivale a nessuna etichetta.

Bumpati `styles.css?v=27`, `app.js?v=29` e `mappa-squadra-v36`.

## 2026-07-29 — Cronologia marker locale per partecipante

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

La barra di ricerca ha ora un pulsante `◷` con contatore. Apre una cronologia
separata per nome partecipante e salvata in `localStorage`
(`mappa-marker-history-v1`): nessun dato viene inviato o sincronizzato.

Ogni prima conferma crea una voce con coordinate normalizzate, colori, testo e
data; «Modifica marker» e «Cambia posizione» aggiornano la voce attiva, mentre
il reset conclude quel marker e la conferma successiva ne crea uno nuovo.
Ogni voce può essere ripristinata sulla mappa o eliminata. La lista è limitata
agli ultimi 100 marker per partecipante; se `localStorage` non è disponibile,
la cronologia continua a funzionare solo per la sessione corrente.

Bumpati `styles.css?v=26`, `app.js?v=28` e `mappa-squadra-v35`.

## 2026-07-29 — Modifica marker e ritorno al mirino

*Agente: Codex. Toccati `index.html`, `styles.css`, `app.js`,
`service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Dopo la prima conferma compaiono quattro azioni in una griglia 2×2:
«Cambia posizione», «Modifica marker», «Copia immagine» e «Condividi PNG».
«Cambia posizione» torna al mirino e riattiva pan e zoom della mappa;
«Modifica marker» riapre colore e testo lasciando il punto dov'è.

All'apertura del dialog viene salvata una copia del marker corrente. Se
l'utente cambia colori e poi preme «Annulla», chiude con la `×` o usa Escape,
colore e testo precedenti vengono ripristinati. Solo «Conferma punto» rende
effettive le modifiche e mostra lo stato «Marker aggiornato».

Bumpati `styles.css?v=25`, `app.js?v=27` e `mappa-squadra-v34`.

## 2026-07-29 — Esempi per HEX, RGB e HSL

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Il campo colore indicava i formati accettati senza mostrare come scriverli.
Ora sotto il campo restano sempre visibili tre esempi completi ed equivalenti:
`#FF0000`, `rgb(255, 0, 0)` e `hsl(0, 100%, 50%)`. Sono separati dal
messaggio dinamico di riconoscimento o errore, quindi non spariscono mentre
l'utente digita. Il campo li annuncia anche come descrizione accessibile.

Bumpati `styles.css?v=23`, `app.js?v=26` e `mappa-squadra-v32`.

## 2026-07-29 — Controlli circolari e gerarchia più pulita

*Agente: Codex con skill Impeccable. Toccati `styles.css`, `index.html`,
`service-worker.js`, `AGENTS.md`, `HANDOFF.md`.*

Safari conservava parte dell'aspetto nativo dei pulsanti e la regola globale
`min-height: 52px` deformava i controlli che dichiaravano solo larghezza e
altezza. Inoltre, sotto i 350 px, i campioni colore passavano a 42 px di
larghezza ma restavano alti 44 px: erano davvero ovali.

I controlli iconici ora dichiarano sempre larghezza, altezza, `aspect-ratio`,
padding e raggio circolare: `x/y`, reset, ricerca, zoom, chiusura dialog e
campioni colore rimangono quindi tondi anche su Safari e sugli schermi più
stretti. Il resto dell'interfaccia è stato rifinito con superfici più coerenti,
ombre con profondità, focus visibile singolo, azioni primarie più nette e
raggi meno gonfi. Il campione del colore scritto è ora circolare come i preset.

Bumpati `styles.css?v=21` e `mappa-squadra-v30`; il JavaScript resta
`app.js?v=24`.

## 2026-07-29 — Il colore si può scrivere

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

La rotella non era abbastanza immediata per l'utente ed è stata rimossa. Al
suo posto c'è un campo «Scrivi un colore» con anteprima: riconosce i nomi
italiani più comuni e varianti come «rosa antico», «blu notte», «verde acqua»
e «testa di moro». Accetta anche i nomi CSS in inglese, codici HEX e i formati
RGB/HSL.

Il messaggio sotto il campo distingue valore riconosciuto ed errore e suggerisce
come correggerlo. «Usa» o Invio applicano il colore e chiudono la tastiera
mobile; la prima scelta resta monocolore e una seconda scelta crea il bicolore.
I nove campioni principali e il trasparente restano disponibili.

Bumpati `styles.css?v=18`, `app.js?v=24` e `mappa-squadra-v27`.

## 2026-07-29 — Colori essenziali e rotella mobile

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

I sedici campioni occupavano troppo spazio nel dialog su telefono. Restano
nove scelte immediate, disposte su due righe anche negli schermi più stretti:
bianco, nero, rosso, giallo, verde, blu, viola, arancione e trasparente.

La palette nativa è stata sostituita da una rotella espandibile: trascinando
si scelgono tonalità e saturazione, mentre un cursore regola la luminosità.
Il controllo è utilizzabile anche da tastiera, resta chiuso finché non serve e
non apre la tastiera virtuale. La prima scelta sostituisce il colore corrente;
le successive mantengono la possibilità del marker bicolore. Il dialog può
scorrere sui telefoni bassi senza trascinare o zoomare la mappa.

Bumpati `styles.css?v=17`, `app.js?v=23` e `mappa-squadra-v26`.

## 2026-07-29 — Palette libera e avvio pulito per il partecipante

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Il marker mantiene i colori rapidi e aggiunge un controllo nativo
`input[type=color]`, così l'utente può scegliere qualsiasi colore senza
perdere il bicolore. Aprendo «Segna questo punto» il focus va al pulsante di
chiusura invece che al campo testo: su telefono non compare più subito la
tastiera che copriva mappa e palette.

Il marker senza riempimento usa ora un bordo nero sottile sia nell'app sia nel
PNG esportato. Gli strumenti `x/y` partono nascosti quando non esiste ancora
una preferenza; l'HTML nasce già nello stato spento per evitare un lampo del
pannello prima del caricamento JavaScript. Una scelta salvata continua a
prevalere. Bumpati `styles.css?v=16`, `app.js?v=22` e
`mappa-squadra-v25`.

## 2026-07-29 — Il PNG conserva le proporzioni della vista

*Agente: Codex. Toccati `app.js`, `index.html`, `service-worker.js`,
`HANDOFF.md`.*

La condivisione generava sempre un canvas `1400×1800` e adattava la vista con
due rapporti distinti, uno orizzontale e uno verticale. Su uno schermo con
proporzioni diverse la mappa veniva quindi deformata e sembrava inclinata o in
prospettiva.

L'esportazione ora calcola una sola scala, limitata a `1400` pixel di larghezza
e `2400` di altezza, e ricava entrambe le dimensioni del PNG dalle proporzioni
reali della schermata. Mappa e marker restano così frontali e non vengono
schiacciati. Bumpati `app.js?v=21` e `mappa-squadra-v24`.

## 2026-07-29 — Primo collegamento a GitHub

*Agente: Codex. Toccato `HANDOFF.md`; nessuna modifica al codice dell’app.*

Il repository locale è stato collegato come `origin` a
`https://github.com/laminaccia/CAT-points.git`. Il remoto era vuoto al momento
della verifica, quindi il ramo locale `main` resta la fonte completa dello
storico e può essere inviato senza fusioni o sovrascritture.

Il primo push è riuscito e GitHub Pages è stato attivato sul ramo `main`, dalla
cartella `/(root)`. Il sito pubblico è
`https://laminaccia.github.io/CAT-points/`; verificati via HTTPS con risposta
`200` anche `app.js?v=20` e `assets/streets.json`.

## 2026-07-29 — Interruttore per gli strumenti da cartografo

*Agente: Claude. Toccati `index.html`, `styles.css`, `app.js`.*

L'utente sta completando l'indice delle vie (oggi la parte destra della mappa)
e ha chiesto di poter nascondere il pannello coordinate «così nel frattempo
posso anche utilizzare il resto»: cioè provare l'app come la vedrà un
partecipante, senza gli strumenti di preparazione addosso.

Aggiunto il pulsante `x/y` nella barra in alto, accanto a quello di
reimpostazione — **fuori** dal pannello che nasconde, altrimenti non si
potrebbe riaccendere. Nasconde `#coordinatePanel` per intero, quindi anche
«Copia x/y», «Aggiungi punto» e «Lista». La scelta vive in `localStorage`
(`mappa-strumenti-coordinate`) come il nome del giocatore; senza preferenza
gli strumenti restano visibili, che è lo stato in cui l'app è sempre stata.

Dettagli: `aria-pressed` e `aria-controls` sul pulsante, `aria-label` che si
inverte fra «Nascondi» e «Mostra», e il pulsante spento che si smorza invece
di sparire. Usa la classe `.hidden` già esistente (`display: none`), quindi i
controlli escono anche dall'albero di accessibilità e non restano raggiungibili
da tastiera — verificato.

Il `?v=N` del CSS e del JS e `CACHE` sono stati bumpati: `styles.css?v=15`,
`app.js?v=20`, `mappa-squadra-v23`.

### Sul font

L'utente ha confermato che il carattere non è una priorità («l'importante è che
sia comprensibile»), quindi la segnalazione `overused-font` su `Inter` è
registrata come esenzione in `.impeccable/config.json`. Vale la pena sapere
*perché* è innocua: `Inter` è dichiarata ma **non viene mai caricata** — nessun
`@font-face`, nessun link a Google Fonts — quindi sui telefoni cade sempre su
`-apple-system`/`ui-sans-serif`, cioè il font di sistema. Se un giorno si
volesse un carattere con personalità servirebbe caricarlo davvero, con il costo
di rete che comporta.

Corretto anche il `.gitignore`: escludeva tutta `.impeccable/`, e quindi anche
il `config.json` condiviso. Ora l'esenzione viaggia col repository — è una
decisione presa con l'utente, deve valere anche per Codex.

### Da valutare

- Il pannello si nasconde tutto o niente. Se in futuro «Lista» servisse anche a
  gioco iniziato, andrà separata dagli strumenti di misura.

---

## 2026-07-29 — L'elenco dei risultati si scorre; e il precaricamento era bugiardo

*Agente: Claude. Toccati `styles.css`, `app.js`, `service-worker.js`,
`index.html`.*

Segnalazione dell'utente: cercando «seg» il messaggio dice sei corrispondenze
ma se ne vedono quattro.

### Il bug segnalato

Tutte e sei erano nel DOM: altezza visibile 218px, contenuto 328px. La lista
aveva già `max-height` e `overflow-y: auto`, ma **non si scorreva in nessun
modo**, per due cause indipendenti che si sommavano:

* `.map-stage` ha `touch-action: none` per gestire pan e pinch a mano, e
  `.search-results` ci sta dentro: il dito non riusciva a scorrerla;
* il gestore `wheel` su `.map-stage` faceva `preventDefault()` senza guardare
  il bersaglio, quindi la rotella sopra l'elenco zoomava la mappa.

Corretti entrambi (`touch-action: pan-y`, `overscroll-behavior: contain`, una
guardia sul `wheel` gemella di quella che già esisteva su `pointerdown`) e
alzato il tetto da `220px` a `min(52vh, 360px)`: le sei voci di «seg» ora ci
stanno **tutte senza scorrere**, e quando la lista sfora comunque — «cortile»
dà 19 corrispondenze, 12 mostrate — si arriva in fondo davvero. Regola scritta
in `AGENTS.md` §5-ter.

### Il bug che è saltato fuori verificando, più grave

La correzione non si vedeva. Motivo: la cache `v22`… conteneva un `index.html`
che chiedeva ancora `styles.css?v=13`. **`cache.addAll()` passa dalla cache HTTP
del browser**, quindi il precaricamento del nuovo service worker aveva
riportato dentro proprio i file vecchi che il bump di `CACHE` doveva sostituire.

Tradotto in produzione: si pubblica un aggiornamento, si bumpano
diligentemente tutte le versioni, e agli utenti non arriva niente — senza un
errore da nessuna parte. L'install ora costruisce le richieste con
`new Request(url, { cache: 'reload' })`. Scritto in `AGENTS.md` §5.

### Verificato

Da cache e service worker azzerati, come un telefono che non ha mai visto
l'app: cache `v22`, l'`index.html` precaricato chiede `?v=14`/`?v=19`, sei voci
su sei visibili a 375×812, rotella non più rubata dalla mappa, `touch-action:
pan-y` e `overscroll-behavior: contain` attivi, console pulita.

Versioni: `styles.css?v=14`, `app.js?v=19`, `CACHE` a `mappa-squadra-v22`.

### Da valutare

- `showSearchResults()` taglia a 12 risultati con la nota «restringi la
  ricerca». Ora che la lista scorre davvero, quel tetto si può alzare — ma è
  una scelta di prodotto, non l'ho toccata.
- Restano aperti il peso del primo caricamento e i diritti sulla mappa
  (vedi la voce precedente e `PUBBLICARE.md`).

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
