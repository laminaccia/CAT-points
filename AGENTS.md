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
index.html              Struttura dell'app: mappa, mirino, punto, 5 dialog
styles.css              Interfaccia e stile (tema scuro/oro)
app.js                  Pan, zoom, punto, ricerca, esportazione, condivisione
service-worker.js       Cache offline
manifest.webmanifest    Installazione PWA
assets/map-placeholder.jpg   La mappa servita (8192×5787 px, 4,7 MB)
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

1. `index.html` carica i file con un `?v=N`: oggi `styles.css?v=53` e
   `app.js?v=52`.
2. `service-worker.js` ha un nome di cache versionato, oggi
   `mappa-squadra-v70`, e precarica la lista `ASSETS` all'installazione.

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
| `esclusi.json` | punti dell'estrazione dichiarati errati, con la ragione | — |

**Gli errori del PDF si tolgono da `esclusi.json`, non cancellandoli
dall'estrazione.** `estrazione-pdf.json` è la fotografia intatta di ciò che il
livello testo conteneva: serve a poter riconfrontare, e cancellarci dentro
renderebbe la decisione invisibile. Ogni esclusione porta con sé il motivo, e
se un giorno non trova più il suo punto lo script lo segnala invece di
ignorarlo in silenzio.

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

### Come si scrivono etichette e tag — deciso con l'utente il 2026-07-29

L'etichetta è **l'unica cosa che si vede**: la lista dei risultati mostra
`label` e nient'altro. I tag non compaiono da nessuna parte, servono soltanto a
farsi trovare.

Le etichette sono **complete, con le abbreviazioni sciolte e il cognome in
MAIUSCOLO**:

    Via Arc. F. Avila        →  Via Arciprete Francesco AVILA
    C.LE AMARI               →  Cortile AMARI
    Largo Gaetano Di Blasi   →  Largo Gaetano DI BLASI

Il maiuscolo serve a «dare contesto alla ricerca e immediatezza di risultato»:
l'occhio scorre la lista e aggancia il cognome. Niente accorciamenti — «la
completezza di informazione è fondamentale» — perché sono i nomi di battesimo a
distinguere le quattro vie Gallo e le tre Simone del paese.

I tag garantiscono la **copertura**: ogni voce è cercabile col nome intero,
senza la parola generica iniziale, e col solo cognome. Non si tengono i tag che
ripetono solo la parola generica (`Cortile` su `Cortile FANFULLA`): l'etichetta
intera è già una corrispondenza per prefisso.

Tutto questo lo applica `tools/merge-streets.py` alle sorgenti, **entrambe** —
anche l'estrazione dal PDF, così le due si somigliano. Non riscrivere le
etichette a mano nell'indice: sparirebbero alla ricostruzione.

### Se si sostituisce la mappa: controllare le proporzioni

Le coordinate dell'indice sono normalizzate, quindi sopravvivono a un cambio di
risoluzione ma **non a un ritaglio diverso**. Quando la mappa è passata da
7559×5339 a 8192×5787 le proporzioni sono rimaste 1.4156: stesso inquadramento,
indice valido. Con proporzioni diverse andrebbero rifatti tutti i punti.

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

## 5-quater. Tutta la mappa deve raggiungere il mirino

Il mirino è fisso al centro. Per poter selezionare davvero coordinate da
`0,0` a `1,1`, `constrain()` consente alla mappa di scorrere finché il suo
bordo arriva al centro dello stage: i limiti sono `center - size` e `center`,
non `viewport - size` e `0`. Ripristinare il vecchio vincolo renderebbe di
nuovo irraggiungibile una fascia lungo tutti e quattro i bordi.

Quando il bordo raggiunge il mirino è inevitabile mostrare spazio oltre la
carta. Non è un errore: `.map-stage::before` usa una copia sfocata e scura
della mappa come fondale, mentre la carta vera ha un contorno visibile. Anche
il PNG riproduce questa distinzione. La vista iniziale continua invece a
coprire tutto lo schermo.

---

## 5-quinquies. Coordinate geografiche senza rompere x/y

Le coordinate `x`/`y` normalizzate restano la fonte autorevole per
`assets/streets.json`, per la ricerca e per i lotti manuali. Il pulsante
**Copia x/y** non deve cambiare formato.

L'interfaccia mostra in aggiunta latitudine e longitudine WGS84 in gradi
decimali. La scansione non è georeferenziata: `geographicCalibration` in
`app.js` applica quindi una trasformazione affine calibrata su sei riferimenti
riconoscibili nella carta e in OpenStreetMap (Crocifisso, Chiesa Madre,
PalaSegesta, Castello Eufemio, Villa Comunale/Garibaldi e Cimitero). Sui
riferimenti lo scarto rilevato resta entro circa 20 metri, ma il risultato va
sempre presentato come **stima cartografica**, mai come posizione GPS.

La cronologia continua a salvare `x`/`y`; latitudine e longitudine vengono
derivate al momento della visualizzazione o dell'esportazione. In questo modo
una futura calibrazione migliore correggerà anche i punti già salvati.

---

## 6. Identità partecipante

Il partecipante inserisce un nome al primo accesso. Il valore è salvato in
`localStorage` (`mappa-player-name`) e si modifica toccando il nome in alto a
sinistra. Anche la lista manuale dei punti vive in `localStorage`: è **legata
al browser di quel dispositivo**, non viaggia con il progetto. Per questo
esiste l'export JSON — chi raccoglie punti deve poterli portare via.

La cronologia punti usa lo stesso principio (`mappa-marker-history-v1`, chiave
mantenuta per compatibilità con i dati già salvati):
resta soltanto nel browser, è separata per nome partecipante e non si
sincronizza. Confermare un punto crea una voce; modificarlo o riposizionarlo
con **Cambia posizione** aggiorna la voce attiva invece di duplicarla.
**Segna nuovo punto** conclude esplicitamente quella voce, mantiene posizione
e colori per velocizzare l'uso sul campo, azzera testo ed etichetta e fa sì
che la conferma successiva crei una nuova voce. Reimpostare la mappa ottiene
lo stesso risultato, ma riporta anche carta e colori allo stato iniziale. Ogni
voce può avere un'etichetta facoltativa distinta dal testo visibile sul punto:
«Rivedi» la riporta sulla mappa, «Invia foto» rigenera il PNG con etichetta e
data originali e apre il normale flusso di condivisione. I nuovi punti vengono
aggiunti in fondo, quindi l'ordine iniziale cresce per `createdAt`; la scheda
mostra la data di creazione e non quella dell'ultima modifica. L'ordine si può
poi cambiare con «Su»/«Giù» e resta salvato; modificare un punto esistente non
lo sposta. La chiave `mappa-marker-history-order-v2` rende la conversione delle
vecchie cronologie dal più vecchio al più recente una migrazione una tantum.
L'esportazione prova prima la condivisione nativa del pacchetto
importabile e, se i file non sono supportati, lo scarica: non ripiega più su
un riepilogo testuale che perderebbe i dati necessari all'importazione.

La visibilità d'insieme usa `mappa-marker-history-visibility-v1`: per ogni
lista salva soltanto gli ID selezionati. Le selezioni locali e importate
convivono, restano sul dispositivo e non modificano né l'ordine né il
contenuto delle liste. **Vedi insieme** conclude l'eventuale punto attivo,
centra il gruppo compatibilmente con lo zoom minimo e lascia pan e zoom
disponibili. Rimuovere una lista o un punto elimina anche le selezioni rimaste
senza sorgente. `mappa-overview-crosshair-v1` conserva la scelta di mostrare
il mirino nella vista d'insieme: è nascosto per impostazione predefinita e il
comando centrale **Mostra mirino** lo riattiva.

Il menu delle liste contiene anche **Selezionati**, una sorgente sintetica che
riunisce i punti scelti dalla lista locale e da tutte quelle importate. Ogni
voce conserva il proprio `sourceKey` e il proprietario originale: la vista non
duplica, fonde o rende modificabile una lista ricevuta. L'ordine trasversale è
salvato separatamente in `mappa-ordine-selezione` come chiavi opache
`sourceKey` + `entryId`; i punti appena selezionati entrano in fondo, i comandi
**Su**/**Giù** li riordinano e deselezionare o rimuovere un punto ripulisce
anche la chiave rimasta senza sorgente. I collegamenti continuano a usare gli
estremi originali `{ sourceKey, entryId }`, quindi dalla lista aggregata si
possono collegare direttamente punti appartenenti a liste diverse.

La lente del mirino ha un interruttore indipendente nella posizione del vecchio
messaggio «Sposta la mappa sotto il mirino». La scelta usa
`mappa-crosshair-lens-v1`, è attiva al primo accesso e resta sul dispositivo.
Quando è spenta il canvas viene svuotato e diventa trasparente: cerchio e punto
centrale restano visibili, ma la carta non viene ingrandita. `#statusPill`
continua a mostrare gli avvisi sopra il pulsante e li nasconde dopo 2,8 secondi;
il messaggio di istruzione predefinito non viene più visualizzato.

Il dialog cronologia separa le attività in **Punti** e **Mappa e linee**; la
scheda attiva usa `mappa-marker-history-tab-v1`. La prima contiene gestione,
condivisione e importazione, la seconda un elenco compatto con selezione
singola, **Mostra tutti**, **Nessuno**, conteggio locale/globale e collegamenti.
Su desktop il dialog diventa un workspace a due colonne e la mappa usa tutta
la viewport, mentre i controlli principali restano centrati entro 760 px. Su
mobile il pannello è alto al massimo 720 px e ogni scheda gestisce il proprio
scorrimento verticale.

I collegamenti tra punti usano `mappa-marker-history-connections-v1`. Ogni
estremo conserva soltanto `{ sourceKey, entryId }`, quindi può riferirsi anche
a due liste diverse senza duplicarne i dati. Una linea viene disegnata solo
quando entrambi gli estremi sono selezionati per la vista d'insieme, ma resta
salvata se uno dei due viene temporaneamente nascosto. Rimuovere un punto o
una lista elimina automaticamente i collegamenti rimasti senza estremi.

Le cronologie condivise usano il formato `cat-points.marker-history` versione
3 e il suffisso `*.catpoints.json`. Il pacchetto non è un JSON anonimo:
contiene l'identità e l'URL di CAT-points, il proprietario responsabile della
lista, chi la sta condividendo e una catena degli inoltri. L'import accetta
anche il vecchio formato versione 2, ma lo converte subito nel modello nuovo.
Le liste ricevute vengono salvate nello stesso `localStorage`, restano
separate dalla cronologia del partecipante corrente e sono **in sola lettura**:
si possono rivedere, usare per rigenerare una foto, ricondividere o rimuovere
dal dispositivo, ma non modificare. Una nuova condivisione mantiene sempre il
proprietario originale e aggiunge il partecipante corrente alla catena.

---

## 7. Criteri di accettazione

- La vista iniziale copre lo schermo; durante il pan ciascun bordo e angolo
  della mappa può raggiungere il mirino, con il fondale sfocato oltre la carta.
- Pan e zoom sono fluidi.
- Le icone circolari sono geometricamente centrate e i controlli interattivi
  compatti mantengono un'area tattile minima di 44×44 px.
- Il punto appare al centro esatto del mirino.
- Dopo la conferma la mappa non si muove accidentalmente.
- Il PNG include mappa, partecipante, punto, data e ora, ma non i pulsanti.
- Su browser compatibili il pulsante usa Web Share API; altrimenti scarica il
  PNG.
- Il punto centrale resta sempre oro, uguale al centro del mirino. Due menu a
  tendina e il campo libero gestiscono invece il colore della didascalia,
  monocolore o bicolore, riconoscendo nomi italiani, codici HEX e i formati
  CSS RGB/HSL. Il testo usa automaticamente il bianco o il nero con il
  contrasto migliore; quando nessuno dei due basta su entrambi i colori viene
  aggiunto un contorno opposto. Senza testo compare un quadratino arrotondato
  del colore scelto, oppure solo bordato se è trasparente. La stessa regola
  vale nel PNG e nelle anteprime della cronologia. Nello stesso dialog si può
  assegnare subito l'etichetta della cronologia.
- Quando l'etichetta della cronologia è presente viene mostrata sopra la
  didascalia colorata o il quadratino; sotto resta il punto oro. Il PNG
  conserva lo stesso ordine visivo.
- Dopo la conferma il punto può essere modificato senza riposizionarlo oppure
  riportato al mirino per scegliere un nuovo punto; annullare una modifica
  ripristina colore e testo precedenti.
- **Segna nuovo punto** torna al mirino senza spostare la mappa e la conferma
  seguente crea una voce distinta; **Cambia posizione** aggiorna invece la voce
  attiva.
- Ogni conferma salva automaticamente il punto nella cronologia locale del
  partecipante; una voce può essere etichettata, rivista, condivisa nuovamente
  o eliminata.
- Le voci della cronologia possono essere riordinate e l'ordine viene
  mantenuto nell'esportazione condivisibile.
- Ogni voce, locale o importata, può essere inclusa o esclusa dalla mappa. Le
  selezioni di tutte le liste vengono mostrate contemporaneamente, restano
  salvate sul dispositivo e possono essere azzerate insieme.
- La cronologia separa chiaramente la gestione dei punti dalla selezione
  cartografica. Le due schede sono navigabili anche da tastiera e ricordano
  l'ultima scelta sul dispositivo.
- **Mappa e linee** offre selezione singola e collettiva per la lista corrente,
  mantiene visibile il totale globale e rende immediatamente riconoscibili i
  punti disponibili per un collegamento.
- La sorgente **Selezionati** riunisce i punti scelti da tutte le liste, mostra
  sempre il rispettivo proprietario e permette di riordinarli e collegarli
  senza cambiare lista; ordine, attribuzione e collegamenti sopravvivono al
  ricaricamento del browser.
- In **Vedi insieme** il mirino può essere mostrato o nascosto; la preferenza
  resta sul dispositivo e, se nascosto, il comando centrale permette di
  riattivarlo senza uscire dalla vista.
- Due punti visibili, anche di liste diverse, possono essere collegati. Le
  linee persistono sul dispositivo, vengono mostrate soltanto con entrambi gli
  estremi visibili e possono essere rimosse singolarmente.
- Da 900 px la mappa occupa l'intera viewport, i controlli restano centrati e
  la cronologia sfrutta due colonne; sotto tale soglia le funzioni restano
  complete, toccabili e prive di sovrapposizioni.
- Il controllo **Importa punti** apre tramite la sua etichetta nativa il
  selettore file del dispositivo, senza dipendere da un click JavaScript su un
  input nascosto; accetta i pacchetti `.catpoints.json` e i precedenti export
  versione 2.
- Prima di un eventuale riordino manuale, la cronologia cresce per data di
  creazione dal punto più vecchio al più recente; una modifica non sposta la
  voce e non sostituisce la data mostrata.
- Una lista `*.catpoints.json` può essere importata dal pannello cronologia;
  proprietario, condivisore e catena dei passaggi restano memorizzati. Le
  liste importate sono separate, persistenti e non modificabili.
- Gli strumenti coordinate mostrano x/y e una stima WGS84 in gradi decimali:
  **Copia x/y** è allineato alla riga normalizzata e **Copia per Maps** alla
  riga geografica; ricerca e copia JSON continuano a usare x/y.
- Lo zoom massimo è 5 volte la scala iniziale; il mirino usa un canvas
  circolare come lente 2,35× e continua a restituire le stesse coordinate x/y
  del suo punto centrale. Un pulsante persistente attiva o disattiva
  l'ingrandimento senza rimuovere il cerchio del mirino.
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

1. **La mappa pesa 4,7 MB** e il service worker la precarica all'installazione:
   il primo caricamento su rete mobile è lento proprio nel momento peggiore,
   cioè quando il giocatore è per strada. La versione attuale è stata
   rigenerata dal PDF a 8192×5787 px con JPEG progressivo di qualità 88.
2. **Il PDF è precaricato ma non serve all'app.** `assets/map-placeholder.pdf`
   (1,35 MB) è in `ASSETS`, ma nessuno lo carica a runtime: è il sorgente della
   mappa, utile alle persone, non all'app. Toglierlo da `ASSETS` libera un
   quarto del peso dell'installazione senza perdere nulla — il file resta nel
   repository.

---

## 10. Sviluppi possibili (proposte, non approvate)

- Colori distinti per squadra.
- Selettore missione o giorno.
- Punto personalizzato SVG.
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
