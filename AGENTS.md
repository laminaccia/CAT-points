# Mappa Squadra — regole condivise

**Questa è la fonte unica di verità del progetto.** `CLAUDE.md` e `CODEX.md`
non contengono regole: puntano qui. Chi impara qualcosa di nuovo sul progetto
lo scrive **in questo file**, così l'altro agente lo trova al prossimo avvio.

Lingua di testi, commenti e messaggi di commit: **italiano**.

---

## 1. Obiettivo

Web app mobile-first per una caccia al tesoro. Il giocatore deve:

1. visualizzare una mappa fornita come immagine JPG;
2. spostarla e ingrandirla;
3. posizionare un punto tramite mirino centrale;
4. generare un PNG della vista con il marker;
5. condividerlo tramite il menu nativo del telefono, soprattutto WhatsApp.

L'app ha anche una **seconda funzione, per chi prepara il gioco**: il pannello
coordinate e la lista manuale servono a costruire `assets/streets.json`
segnando i punti direttamente sulla mappa, invece di calcolarli a mano. Sono
strumenti da cartografo, non da giocatore.

Convivono nella stessa schermata, ma **si spengono**: il pulsante `x/y` in alto
a destra nasconde il pannello coordinate — e con esso «Copia x/y», «Aggiungi
punto» e «Lista» — lasciando l'app come la vede un partecipante. La scelta è
salvata in `localStorage` (`mappa-strumenti-coordinate`), quindi chi li ha
spenti non se li ritrova al ricaricamento. Senza preferenza restano nascosti:
al primo accesso prevale la schermata pulita del partecipante.

Chi aggiunge altri strumenti di preparazione li metta **dentro
`#coordinatePanel`**, così seguono l'interruttore invece di richiederne un
altro.

---

## 2. Vincoli

- Progetto statico: HTML, CSS e JavaScript puro.
- Nessun backend, login, database o geolocalizzazione.
- Deve funzionare su iPhone e Android.
- Deve poter essere installato come PWA e funzionare offline dopo il primo
  caricamento.
- Interfaccia scura, minimale, immersiva, ottimizzata per uso verticale.
- Non introdurre dipendenze npm o build step senza necessità esplicita.

---

## 3. Struttura

```
index.html              Struttura dell'app: mappa, mirino, marker, 4 dialog
styles.css              Interfaccia e stile (tema scuro/oro)
app.js                  Pan, zoom, marker, ricerca, esportazione, condivisione
service-worker.js       Cache offline
manifest.webmanifest    Installazione PWA
assets/map-placeholder.jpg   La mappa servita (4,4 MB)
assets/map-placeholder.pdf   Sorgente con livello testuale ricercabile
assets/streets.json          Indice dei punti — GENERATO, vedi §5-bis
assets/icons/                icon-192.png, icon-512.png
data/sorgenti/               Le sorgenti dell'indice, curate a mano
tools/merge-streets.py       Ricostruisce assets/streets.json dalle sorgenti
```

Per sostituire la mappa: cambiare `assets/map-placeholder.jpg` mantenendo lo
stesso nome, oppure aggiornare il riferimento in `index.html` **e** in
`service-worker.js` (compare in due punti: `MAP_PATH` e `ASSETS`).

`assets/streets.json` alimenta la ricerca. Ogni voce ha `label` (il testo
mostrato nei risultati), `tags` (le parole e gli alias su cui si cerca) e
coordinate **normalizzate** `x`/`y` da 0 a 1 — `x` cresce da sinistra a destra,
`y` dall'alto verso il basso. Se una via compare più volte sulla mappa, la
ricerca mostra tutte le occorrenze numerate e non ne sceglie una
automaticamente: è voluto.

---

## 4. Come si avvia

Server statico Python. Il service worker richiede HTTP/HTTPS: **non aprire
`index.html` con `file://`**, l'app non si registra come PWA.

```bash
python3 -m http.server 8000
```

Da un altro dispositivo sulla stessa rete si usa l'IP del computer
(`http://192.168.1.20:8000`) — è così che si prova davvero, perché pan, zoom e
condivisione nativa hanno senso solo su telefono.

> Per Claude Code la porta è la **8010**, non la 8000: vedi `CLAUDE.md`.

---

## 5. Versionamento e cache — REGOLA CRITICA

Ci sono **due meccanismi di cache sovrapposti** e vanno mossi insieme.

1. `index.html` carica i file con un `?v=N`: oggi `styles.css?v=16` e
   `app.js?v=22`.
2. `service-worker.js` ha un nome di cache versionato, oggi
   `mappa-squadra-v25`, e precarica la lista `ASSETS` all'installazione.

**Chi modifica `styles.css` o `app.js` deve incrementare il suo `?v=N` in
`index.html` E il numero in `CACHE`**, altrimenti il vecchio service worker
resta attivo e continua a servire i file vecchi.

### Come stanno insieme il `?v=N` e la cache

`ASSETS` elenca i file **senza** query (`'./styles.css'`), ma la pagina li
chiede **con** query (`styles.css?v=13`), e `caches.match()` di default
considera la query parte dell'identità della risorsa:

| Richiesta | Trova la voce precaricata? |
|-----------|----------------------------|
| `/styles.css` | sì |
| `/styles.css?v=13` | **no** |
| `/styles.css?v=13` con `{ ignoreSearch: true }` | sì |

È questa asimmetria a far funzionare il cache-busting: online la richiesta
versionata manca la cache, cade su `fetch()` e prende il file nuovo.

Fino al 2026-07-29 la stessa asimmetria **rompeva l'offline** — senza rete il
`fetch` falliva e CSS e JS non arrivavano, lasciando un guscio HTML nudo.
Il gestore `fetch` ora fa tre tentativi in quest'ordine:

1. **corrispondenza esatta** in cache — il `?v=N` conserva tutto il suo valore
   di cache-buster, una versione nuova non la trova e va in rete;
2. **rete**, e quello che scarica lo mette in cache *con la sua URL esatta*,
   così dalla volta dopo è disponibile anche senza rete;
3. **corrispondenza ignorando la query**, solo se la rete è fallita: si ripiega
   su una versione vecchia soltanto quando l'alternativa è non mostrare niente.

Il punto 3 sta in fondo, e non al posto del punto 1, di proposito: invertirli
significherebbe servire il vecchio CSS a chi ha appena bumpato la versione.

### Il precaricamento deve scavalcare la cache HTTP

`cache.addAll()` fa richieste normali, che **passano dalla cache HTTP del
browser**. Il 2026-07-29 è successo questo: bumpati regolarmente `?v=N` e
`CACHE`, il nuovo service worker si è installato e ha precaricato… l'`index.html`
vecchio, che chiedeva ancora `styles.css?v=13`. Aggiornamento pubblicato,
nessuno che lo riceve, e nessun errore da nessuna parte.

Per questo l'install costruisce le richieste con `new Request(url, { cache:
'reload' })`, che obbliga a passare dalla rete. **Non togliere quell'opzione**:
senza, il bump di `CACHE` smette di garantire alcunché.

In verifica, ricordarsi che questo vale anche per te: se una modifica sembra
non avere effetto, azzerare service worker e cache (`getRegistrations()` →
`unregister()`, `caches.keys()` → `delete()`) e ricaricare, invece di cercare
il problema nel codice.

---

## 5-bis. L'indice delle vie — `assets/streets.json` è generato

**Non modificarlo a mano: la modifica sparisce alla prima ricostruzione.** Le
sorgenti stanno in `data/sorgenti/` e sono due tipi di file molto diversi.

| Sorgente | Che cos'è | Qualità |
|----------|-----------|---------|
| `estrazione-pdf.json` | i 161 punti estratti dal livello testo del PDF | grezza |
| `lotto-NN.json` | i punti segnati a mano con lo strumento dell'app | curata |

L'estrazione copre tutta la mappa, ma le etichette sono come le ha lasciate il
PDF: abbreviate («c/da FRANCO», «C.LE AMARI»), troncate sugli a capo («Via Sac.
Giuseppe» in sei punti diversi, «Via Ben.») e raddoppiate — ogni «c/da X»
esisteva anche come «Contrada X» alle stesse identiche coordinate.

I lotti manuali contengono invece i nomi giusti e, soprattutto, **gli alias
dialettali che nessuna estrazione automatica potrà mai produrre**:
*Chianipodda* per Piazza Nicolò Mazzara, *U Signuri* per la chiesa del
Santissimo Crocifisso, *A Circiara*, *Lu Burgo*, *l'acquanova*. Sono quelli che
un calatafimese digiterebbe davvero.

**Decisione presa con l'utente il 2026-07-29: vince sempre il lotto manuale.**
L'estrazione dal PDF contiene errori che l'utente ha corretto a mano, quindi
dove i due si contraddicono la versione curata è quella buona. L'estrazione
sopravvive solo dove *aggiunge* un posto che i lotti non coprono ancora.

### Aggiungere un lotto

1. Nell'app: **Aggiungi punto** per ogni luogo, poi **Scarica JSON**.
2. Salvare il file come `data/sorgenti/lotto-NN.json` (numero successivo).
3. `python3 tools/merge-streets.py` — ricostruisce l'indice da zero.
4. **Bumpare `CACHE` in `service-worker.js`** (vedi §5): senza quello il
   service worker continua a servire l'indice vecchio dalla cache e il lavoro
   non arriva a nessuno.

`--dry-run` stampa il rapporto senza scrivere. La ricostruzione riparte sempre
da zero: se leggesse l'indice già fuso, al lotto successivo i punti curati la
volta prima verrebbero scambiati per dati grezzi. Così invece il risultato non
dipende dall'ordine dei lotti ed è ripetibile.

### Cosa decide lo script, e cosa lascia decidere a te

Il criterio è che **nome e distanza vanno usati insieme, mai da soli**: solo il
nome faceva finire «Strada Patti» su «Ponte Patti», distanti mezza mappa; sola
la distanza non riconosceva «C/le Sciaffino» come la «Cortile Schiaffino»
curata a 0.0026, per via di una lettera. Le soglie e il controllo sul tipo di
luogo (una contrada non diventa una chiesa) sono commentati nello script.

Il rapporto separa quello che ha deciso da solo — **scartate**, **riqualificate**
— da quello che vuole occhi umani: **da decidere** (nome imparentato ma punto
lontano), **tipo diverso**, **possibili varianti di grafia**, **solo PDF**
(etichette grezze ancora da curare). Quelle voci restano nell'indice com'erano:
meglio un nome brutto che un posto sparito.

---

## 5-ter. I pannelli che scorrono dentro la mappa

`.map-stage` ha `touch-action: none` perché pan e pinch della mappa sono gestiti
a mano in JS, e il gestore `wheel` annulla l'evento per zoomare. Sono decisioni
giuste per la mappa, e **sbagliate per qualunque pannello sovrapposto che debba
scorrere per conto suo** — che sta comunque dentro `.map-stage`.

È già costato un bug: l'elenco dei risultati aveva `max-height` e
`overflow-y: auto`, ma non si scorreva né col dito né con la rotella. Il
messaggio annunciava «Trovate 6 corrispondenze» e se ne raggiungevano quattro.

Chi aggiunge un pannello scorrevole dentro `.map-stage` deve fare **tre** cose:

1. `touch-action: pan-y` sul pannello, altrimenti il dito non lo scorre;
2. `overscroll-behavior: contain`, perché arrivati in fondo lo scorrimento non
   prosegua sulla pagina sotto;
3. aggiungerne il selettore alla guardia del gestore `wheel` in `app.js`, così
   la rotella non viene rubata dallo zoom della mappa. Esiste già una guardia
   gemella su `pointerdown` per non trascinare la mappa quando si tocca un
   controllo: **le due liste di selettori vanno tenute allineate.**

---

## 6. Identità partecipante

Il partecipante inserisce un nome al primo accesso. Il valore è salvato in
`localStorage` (`mappa-player-name`) e si modifica toccando il nome in alto a
sinistra. Anche la lista manuale dei punti vive in `localStorage`: è **legata
al browser di quel dispositivo**, non viaggia con il progetto. Per questo
esiste l'export JSON — chi raccoglie punti deve poterli portare via.

---

## 7. Criteri di accettazione

- La mappa copre sempre lo schermo senza lasciare spazi vuoti.
- Pan e zoom sono fluidi.
- Il marker appare al centro esatto del mirino.
- Dopo la conferma la mappa non si muove accidentalmente.
- Il PNG include mappa, partecipante, marker, data e ora, ma non i pulsanti.
- Su browser compatibili il pulsante usa Web Share API; altrimenti scarica il
  PNG.
- Il marker permette di scegliere colore e testo breve.
- Il pulsante di copia usa Clipboard API quando disponibile.
- La PWA si apre anche offline dopo il primo caricamento. *(verificato il
  2026-07-29 col server spento: mappa, ricerca e mirino funzionano)*

---

## 8. Come lavoriamo in due

Il progetto è passato sotto git il 2026-07-28 proprio per questo: due agenti
sugli stessi file, senza storico, non possono lavorare in sicurezza.

**Prima di toccare qualsiasi cosa:**

```bash
git status
```

Se ci sono modifiche non committate, **sono di qualcun altro**: non
sovrascriverle e non committarle a nome proprio. Chiedere all'utente.

**Alla fine di ogni intervento:**

1. Un commit con messaggio in italiano che spiega **il perché**, non l'elenco
   delle righe cambiate (il diff quello lo dice già).
2. Una voce in `HANDOFF.md`, in testa, con la data: cosa è cambiato, cosa si è
   scoperto, cosa resta aperto. È il file che l'altro agente legge per capire
   dove eravamo rimasti.

**Regole di convivenza:**

- Non riscrivere il lavoro dell'altro perché «si farebbe meglio così». Se una
  scelta sembra sbagliata, scriverlo in `HANDOFF.md` sotto *Da valutare* e
  lasciare decidere all'utente.
- Le decisioni prese con l'utente si scrivono qui o in `HANDOFF.md`: se restano
  nella chat, per l'altro agente non esistono.
- Le proposte non confermate stanno in §10 e **non si implementano** finché
  l'utente non le approva.

---

## 9. Problemi noti, aperti

Restano aperti dal 2026-07-28 — **nessuno dei due corretto**. Vanno discussi
con l'utente prima di intervenire, perché toccano la cache e quindi il
comportamento sui telefoni su cui l'app è già installata.

*(L'offline, che era il terzo, è stato corretto il 2026-07-29: vedi §5.)*

1. **La mappa pesa 4,4 MB** e il service worker la precarica all'installazione:
   il primo caricamento su rete mobile è lento proprio nel momento peggiore,
   cioè quando il giocatore è per strada. Su questa macchina è disponibile solo
   `sips` per le immagini — niente ImageMagick, niente `cwebp`.
2. **Il PDF è precaricato ma non serve all'app.** `assets/map-placeholder.pdf`
   (1,35 MB) è in `ASSETS`, ma nessuno lo carica a runtime: è il sorgente della
   mappa, utile alle persone, non all'app. Toglierlo da `ASSETS` libera un
   quarto del peso dell'installazione senza perdere nulla — il file resta nel
   repository.

---

## 10. Sviluppi possibili (proposte, non approvate)

- Colori distinti per squadra.
- Selettore missione o giorno.
- Marker personalizzato SVG.
- Cornice grafica dedicata all'evento.
- Memorizzazione locale dell'ultima posizione.
- Più mappe selezionabili.

---

## 11. Convenzioni di codice

- Nessun framework, nessun bundler, nessuna dipendenza a runtime.
- JS in IIFE, niente moduli ES.
- Commenti in italiano, discorsivi, che spiegano **il perché** di una scelta:
  il *cosa* si legge già nel codice.
- HTML accessibile: `role="dialog"` e `aria-modal` sui dialog, `aria-label`
  sui pulsanti-icona, `aria-live` sui messaggi di stato, `.sr-only` sulle
  etichette visivamente nascoste. Non regredire su questo.
