# Passaggi di consegne

Registro degli interventi, il più recente in testa. Ogni agente scrive qui
prima di chiudere: cosa ha cambiato, cosa ha scoperto, cosa resta aperto.

---

## 2026-08-04 — Nuova identità CAT Points e icona cartografica

*Agente: Codex con skill Design e Impeccable. Toccati `index.html`,
`manifest.webmanifest`, `app.js`, `service-worker.js`, `README.md`, `AGENTS.md`
e `assets/icons/`.*

L'app si chiama ora **CAT Points** nel titolo del browser, nei metadati iOS,
nel manifest PWA, nell'interfaccia, nel PNG condiviso e nei pacchetti esportati.
L'icona deriva dalla planimetria fornita dall'utente nell'area di Piazza
Falcone e Borsellino. La geometria reale delle strade e degli edifici è stata
semplificata in linee oro su fondo nero, eliminando scritte e retini che a 192
px sarebbero diventati rumore. Un punto chiaro identifica il centro della
piazza e richiama il nome del prodotto. La sorgente raster ad alta risoluzione
è conservata in `assets/icons/cat-points-map.png`; i PNG 192 e 512 sono stati
rigenerati e restano dichiarati `any maskable` nel manifest.

La mappa non è stata ricampionata, compressa o modificata: resta il JPEG
8192×5787 con hash SHA-256
`eef1179ccd843296014f5138e82c4cf7b447156766ad05e8efcfb89277e93538`.
Verificati manifest, dimensioni dei PNG, sintassi JavaScript, resa a 320×568,
assenza di sovrapposizioni e controllo Impeccable senza rilievi. Versioni
pubblicate dopo l'approvazione dell'utente: `styles.css?v=60`, `app.js?v=56`,
cache `mappa-squadra-v83`.

## 2026-08-04 — Anteprima locale della posizione del dispositivo

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`.*

È stato aggiunto **Localizzami** come quarto comando circolare della barra
superiore. Parte soltanto dopo un tocco esplicito, mostra un punto blu distinto
dai punti oro della caccia e usa l'inversa della calibrazione geografica già
presente per collocarlo sulla scansione. Il primo rilevamento valido centra la
mappa; i successivi aggiornano soltanto il punto. Un secondo tocco interrompe
`watchPosition()` e rimuove l'indicatore.

La posizione non viene salvata, esportata, condivisa o inserita nel PNG. Sono
gestiti HTTPS mancante, browser incompatibile, permesso negato, timeout,
posizione indisponibile e stima fuori dalla carta. Verificati assenza di errori
JavaScript, conversione affine inversa, stato di permesso negato e layout a
320×568, 390×844 e 1200×800 senza sovrapposizioni. Il controllo Impeccable non
ha rilevato regressioni. Versioni pronte per l'anteprima:
`styles.css?v=60`, `app.js?v=55`, cache `mappa-squadra-v79`. Il commit resta
locale e non va pubblicato finché l'utente non approva l'anteprima.

## 2026-08-02 — Rimossa un'occorrenza ridondante di Via Silvio Pellico

*Agente: Codex. Toccati `data/sorgenti/esclusi.json`,
`assets/streets.json`, `service-worker.js`, `AGENTS.md`.*

Il punto PDF `x=0.529620`, `y=0.202832` è stato dichiarato ridondante
dall'utente. La rimozione non è rimasta una modifica manuale del file generato:
è registrata con motivazione in `esclusi.json`, mentre
`estrazione-pdf.json` conserva correttamente la fotografia originale.

`tools/merge-streets.py` ha ricostruito l'indice da zero: 420 voci finali e
nessuna ricomparsa del punto escluso; le altre occorrenze di Via Silvio Pellico
restano. Prima dell'intervento è stato verificato che locale e `origin/main`
coincidessero sul commit `dd592ba`. Cache pubblicabile:
`mappa-squadra-v78`.

## 2026-08-02 — Interruttore lente accanto alle coordinate

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`service-worker.js`, `README.md`, `AGENTS.md`.*

Il comando della lente non è più una pillola sovrapposta alla mappa: è ora un
pulsante circolare nella barra superiore, tra **x/y** e Home. Lo stato continua
a usare `aria-pressed`, il nome accessibile dinamico e la preferenza locale già
esistente; il testo visivo è nascosto perché l'icona della lente identifica il
comando senza sottrarre spazio alla mappa.

Per i telefoni da 320 px i tre pulsanti passano a 44 px e mantengono 6 px di
distanza. Il nome del partecipante si tronca con ellissi invece di invadere i
comandi. Verificati 320×568, 390×844 e 1200×800 senza sovrapposizioni; provati
anche spegnimento e riattivazione effettivi della lente. Versioni pubblicabili:
`styles.css?v=59`, `app.js?v=54`, cache `mappa-squadra-v77`.

## 2026-08-02 — Overlay mobili e scroll cronologia corretti alla radice

*Agente: Codex con skill Impeccable. Toccati `styles.css`, `index.html`,
`service-worker.js`, `AGENTS.md`.*

Coordinate, lente, toast, ricerca e comandi non usano più ancoraggi mobili
indipendenti. In portrait lente e messaggi stanno sopra il mirino; sui viewport
bassi il pannello coordinate conserva le righe tattili da 44 px riducendo solo
padding e interlinea. In landscape da 520 px ricerca e coordinate si
affiancano ai lati del mirino, compreso l'iPhone compatto da 568×320. Durante
ricerca e modifica dei collegamenti gli strumenti concorrenti vengono nascosti
senza cambiare le preferenze salvate.

La cronologia aveva due cause distinte. In **Punti** il footer fisso era più
alto dello spazio residuo e riduceva la lista a 0 px: su mobile ora scorre
l'intera scheda, footer compreso, mentre da desktop resta lo scroll interno
della lista. In **Mappa e linee** il workspace cresceva all'altezza dei suoi
contenuti dentro un genitore che li tagliava; ora occupa l'altezza disponibile
e gestisce correttamente il proprio overflow.

Collaudo con una lista importata di otto punti: a 320×568 la scheda **Punti**
ha 216 px visibili su 1852 px e accetta lo scroll; **Mappa e linee** ha 216 px
visibili su 916 px e scorre indipendentemente. Su desktop 1200×800 la lista
resta in due colonne con footer visibile. Verificati senza sovrapposizioni
320×568, 375×667, 390×844, 568×320, 667×375 e 844×390. Versioni pubblicabili:
`styles.css?v=58`, `app.js?v=54`, cache `mappa-squadra-v76`.

## 2026-08-01 — Collegamenti creati e modificati direttamente sulla mappa

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`.*

La vista d'insieme mostra ora **Collega punti**: attiva una modalità esplicita
in cui i punti visibili diventano bersagli tattili da 44 px e il primo estremo
resta evidenziato fino alla scelta del secondo. Il flusso riusa gli stessi
collegamenti del pannello cronologia, quindi funziona anche tra liste diverse e
non duplica coppie già presenti.

Le linee sono passate da segmenti SVG a tracciati quadratici. Ogni collegamento
salva un campo facoltativo `curve` tra -1 e 1; le vecchie voci senza campo
restano dritte. Un punto di presa centrale, visibile e toccabile, apre l'editor
per regolare la curvatura in tempo reale, tornare alla linea dritta o eliminarla.
Lo stesso editor si apre con **Modifica** nel riepilogo **Linee tra punti**.

Accolta anche la correzione emersa durante il collaudo: in **Mappa e linee**,
quando un punto ha etichetta e testo, il testo/tag compare sotto l'etichetta
come nella scheda **Punti**, invece di sparire.

Collaudo locale con due punti personali e due importati: creazione diretta,
curva al 60%, persistenza dopo ricarica, riapertura dal punto di presa ed
eliminazione. Verificati 390×844 e 1280×900 senza overflow; console senza
errori. Versioni pubblicabili: `styles.css?v=54`, `app.js?v=54`, cache
`mappa-squadra-v72`.

## 2026-08-01 — Lista trasversale dei selezionati e copie coordinate riallineate

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`.*

Ripresa la traccia lasciata da Claude nel passaggio precedente. Il menu
**Lista visualizzata** contiene ora **Selezionati · tutte le liste (N)**: non è
una nuova cronologia e non copia dati, ma costruisce una sorgente sintetica in
cui ogni voce porta il proprio `sourceKey`, il proprietario e il tipo della
lista originale. Le liste importate restano quindi attribuite e in sola
lettura.

La sorgente aggregata permette di togliere una spunta, collegare direttamente
punti di liste diverse e riordinarli con **Su**/**Giù**. L'ordine trasversale
usa `mappa-ordine-selezione` e chiavi opache composte da lista e ID del punto;
un nuovo selezionato entra in fondo, deselezionare o cancellare ripulisce la
chiave e il rendering della mappa segue lo stesso ordine. L'export resta
volutamente legato alle liste originali: una selezione con più responsabili non
viene mascherata da lista autonoma.

Nel pannello del mirino **Copia x/y** è ora sulla riga dei valori normalizzati;
**Copia per Maps** sta sotto, perfettamente centrato sulla riga Lat/Lon. A
390×844 gli assi verticali coincidono al decimo di pixel; entrambi i pulsanti
mantengono 44 px di altezza.

Collaudo con due punti locali e due importati: selezione da sorgenti diverse,
riordino, collegamento incrociato, deselezione dalla vista aggregata e ricarica.
Ordine e linea persistono; console pulita. Verificati 390×844 e 1440×900 senza
overflow; sul desktop il riepilogo resta impilato nella colonna stretta per non
ridurre il testo a una parola per riga.

Chiuso anche il caso cambio identità: un punto locale scelto sotto un altro
nome può restare nella selezione trasversale, ma viene trattato in sola lettura
come una lista non corrente. Ripristinarlo non lo rende modificabile sotto il
nuovo partecipante e non espone azioni che cancellerebbero la cronologia
sbagliata.

Versioni pubblicabili: `styles.css?v=53`, `app.js?v=52`, cache
`mappa-squadra-v70`.

---

## 2026-08-01 — Passaggio con Impeccable 4.0.4 e una trappola di stato chiusa

*Agente: Claude. Toccato `app.js`.*

Aggiornata la skill a 4.0.4 e ripassati i file cambiati. **Il rilevatore
meccanico non trova nulla**, e i contrasti misurati compositando davvero i
colori semitrasparenti sul fondo stanno fra 6,5 e 10,5 contro una soglia di
4,5: il nome del luogo 10,53, gli alias 10,53, «Modificato» 6,59, la riga di
stato 6,51, «Svuota la selezione» 6,51, «Copia x/y» 6,70.

Il controllo che è servito davvero non è automatico ma sugli **stati limite**,
e ha trovato una trappola vera introdotta ieri: la sequenza **nascondi →
svuota la selezione → riseleziona un punto** lasciava la mappa vuota. Lo stato
«nascosto» sopravviveva a una selezione che non esisteva più e restava in
agguato per quella dopo: sceglievi un punto e non compariva niente.

Risolta alla radice: **svuotare la selezione azzera anche «nascosto»**.
Nascondere serve a sgombrare una selezione che esiste, non a mettere un filtro
permanente. Verificato che l'altro comportamento regge ancora: nascondere
continua a non toccare le spunte.

`app.js?v=49`, `CACHE` a `mappa-squadra-v66`.

---

## 2026-08-01 — Coordinate per Maps, scheda punto completa, selezione ≠ visibilità

*Agente: Claude. Toccati `index.html`, `styles.css`, `app.js`.*

Quattro richieste dell'utente. **Tre fatte e verificate, la quarta no** — vedi
in fondo, non è stata iniziata per non lasciarla a metà.

### 1. «Copia per Maps» invece delle sole x/y

Il pulsante copiava `"x": 0.61, "y": 0.49`, utile solo a chi costruisce
`streets.json`. Ora ci sono **due copie con due destinazioni dichiarate**:

* **Copia per Maps** → `37.91359, 12.86173`, gradi decimali separati da
  virgola. È il formato che Google Maps, Apple Maps, OSM e Waze accettano
  incollato nella barra di ricerca. Niente simbolo di grado: non serve e c'è
  chi lo rifiuta. Cinque decimali ≈ un metro, ben oltre la precisione di una
  trasformazione stimata su sei riferimenti.
* **Copia x/y** → invariato, perché l'indice delle vie non è finito e quello
  strumento serve ancora.

Sfrutta `getGeographicCoordinates()` che Codex aveva già calibrato.

### 2. La scheda di un punto dice dove si trova

Scoperta che ha deciso l'interpretazione: **i punti salvati non hanno tag** —
né i locali né gli importati; il formato porta solo `id, x, y, colors, text,
label, createdAt, updatedAt`. Gli unici tag del sistema sono quelli
dell'indice delle vie. Quindi «vedere anche i tag» è stato letto come: *dire
su quale luogo cade il punto e come lo chiamano*.

Ogni scheda ora porta una riga in più: il luogo dell'indice più vicino (entro
~40 m, oltre sarebbe una bugia), la distanza, e i soprannomi. Vale sia per i
punti locali sia per quelli delle liste importate — stesso codice.

Il filtro sugli alias conta: nell'indice i tag servono a *farsi trovare*, quindi
contengono anche i pezzi del nome stesso («Via Brandis», «Arciprete», «BRANDIS»).
Ripeterli sotto un nome già scritto due righe sopra è rumore. Restano i
soprannomi veri, quelli che il nome non contiene — ed è lì che escono
**Chianipodda, Chianu di Podda, Piano Perollo** per Piazza Dottor Nicolò
MAZZARA. Sono l'unica cosa che l'etichetta non dice già.

Aggiunta anche la riga «Modificato», che compare solo quando `updatedAt`
differisce da `createdAt`: chi riceve un punto sa se guarda la prima versione
o l'ultima.

### 3 e 4. Nascondere non cancella più la selezione

Causa del difetto segnalato: **`markerHistoryVisibility` faceva da selezione
*e* da visibilità**. Erano lo stesso oggetto, quindi «Nascondi tutti» buttava
via le spunte insieme al disegno, e chi voleva sgombrare la mappa per un attimo
doveva poi rifare tutto.

Separati. `markerHistoryVisibility` resta *quali* punti hai scelto; il nuovo
`markerHistoryPointsHidden` (persistito in `mappa-punti-nascosti`) dice solo se
in questo momento vanno disegnati. Di conseguenza l'interfaccia distingue i due
verbi, che prima erano confusi in un pulsante solo:

* **Nascondi sulla mappa / Mostra sulla mappa** — interruttore, non tocca la
  selezione. Le linee spariscono coi punti che uniscono.
* **Svuota la selezione** — l'azione distruttiva, ora chiamata col suo nome,
  su una riga a parte e in tono minore. Prima stava accanto alle altre ed era
  già un incidente.
* **Vedi insieme** riaccende i punti se erano nascosti, invece di restare
  inerte: il pulsante promette di mostrarli.

La riga di stato dice sempre dove sei — «Ora nascosti: la selezione resta» —
perché altrimenti «0 punti» e «punti nascosti» sono indistinguibili guardando
la mappa.

### Un difetto d'impaginazione trovato mentre verificavo

Con tre azioni la colonna dei pulsanti non lasciava più larghezza al testo: a
375px «3 punti selezionati» andava a capo **una parola per riga** e la
descrizione finiva sotto i pulsanti. Il riquadro ora è impilato di norma e si
affianca solo sopra i 480px. La regola dedicata sotto i 350px non serve più.

### Verificato

Da cache e service worker azzerati, a 375×812, con quattro punti di prova:

* copia geografica: il gestore produce `37.91359, 12.86173` (intercettato il
  ripiego su `prompt`, perché un click sintetico non è "fidato" per la
  clipboard — con un dito vero passa dalla stessa `copyPlainText` che l'app usa
  altrove);
* nascondi/mostra: selezione `["p1","p2","p3"]` **intatta** in memoria, punti
  disegnati 3 → 0 → 3, etichetta e `aria-pressed` che si invertono;
* schede: ogni punto nomina il suo luogo, gli alias dialettali compaiono dove
  esistono, «Modificato» solo dove serve;
* aree tattili 44px su entrambi i pulsanti di copia;
* detector Impeccable senza rilievi, console pulita.

`styles.css?v=51`, `app.js?v=48`, `CACHE` a `mappa-squadra-v65`.

### Non fatto: la lista «Selezionati» (richiesta 3)

Una lista trasversale che raccolga i punti scelti da *tutte* le liste e
permetta di ordinarli e collegarli senza cambiare lista. **Non l'ho iniziata**:
richiede di rendere `renderMarkerHistoryMapList()` capace di lavorare su una
sorgente sintetica in cui ogni voce porta la *propria* `sourceKey` — oggi i
gestori la prendono dalla sorgente, non dalla voce — più un ordinamento
trasversale da memorizzare a parte, perché le voci vivono in array separati per
lista. Metterne dentro metà avrebbe lasciato un'app pubblicata con una lista che
ordina o collega la cosa sbagliata.

Traccia per chi la riprende: aggiungere una voce «Selezionati» a
`markerHistorySourceSelect`, far restituire a `getVisibleMarkerHistorySource()`
una sorgente aggregata con `entries` arricchite di `sourceKey` e `ownerName`, e
un array `mappa-ordine-selezione` di chiavi `sourceKey::entryId` per l'ordine.
Le connessioni sono già pronte: `normalizeHistoryConnectionEndpoint` lavora per
`{sourceKey, entryId}`, quindi collegare fra liste diverse funziona già.

---

## 2026-08-01 — Verificati i due commit locali prima della pubblicazione

*Agente: Codex. Verificati i commit `ea2b33e` e `6bfd364`; nessuna modifica al
codice applicativo necessaria.*

Controllati sintassi Python e JavaScript, validità dei tre JSON coinvolti,
riproducibilità di `assets/streets.json` tramite `tools/merge-streets.py`, 421
coordinate nell'intervallo previsto, presenza dei tag e rimozione mirata delle
due esclusioni. Il dry-run conferma due esclusioni riconosciute e nessuna regola
orfana; rigenerare l'indice non produce differenze.

Provata inoltre l'app locale a 390×844 e 1440×900: la pillola con il nome
completo va a capo, resta entro lo schermo e mantiene 8 px di distanza dal
pulsante della lente. La ricerca di `gallo` mostra quattro ricorrenze distinte
con i nuovi nomi completi. Console pulita e detector Impeccable senza rilievi.

---

## 2026-07-29 — Tolti due errori del PDF, con la ragione scritta accanto

*Agente: Claude. Toccati `assets/streets.json` (rigenerato),
`tools/merge-streets.py`, `data/sorgenti/esclusi.json` (nuovo).*

L'utente ha confermato la cancellazione dei due punti che avevo segnalato:

* **`Via Acquanuova`** (0.50805, 0.379187) — grafia alternativa di
  `Via Acquanova`, curata nel lotto 01 a 0.018 di distanza: la stessa via
  scritta in due modi.
* **`Via Palermo`** (0.115774, 0.073224) — angolo in alto a sinistra, a 0.78
  dalla Via Palermo del paese: è l'indicazione stradale *per* Palermo letta dal
  livello testo del PDF. Le altre due occorrenze, accanto alla via vera,
  restano.

**Non le ho cancellate da `estrazione-pdf.json`.** Quel file è la fotografia
intatta di ciò che il PDF conteneva e serve a poter riconfrontare; cancellarci
dentro avrebbe reso la decisione invisibile e irreversibile. È nato invece
`data/sorgenti/esclusi.json`: ogni voce si identifica con label più coordinate
esatte e porta scritto il motivo, che lo script stampa a ogni ricostruzione.
Se un'esclusione non trova più il suo bersaglio viene segnalata — vuol dire che
la sorgente è cambiata sotto e la regola va riletta.

Indice: **423 → 421 voci**. Il rapporto sulle varianti di grafia è ora vuoto.
`CACHE` a `mappa-squadra-v59`; nessun CSS o JS toccato, quindi nessun `?v=N`
da muovere.

Verificato nell'app da cache azzerata: `acquan` trova solo `Via ACQUANOVA` (e
`Largo Duca degli ABRUZZI`, che ha *l'acquanova* fra gli alias dialettali —
funzionano ancora), `palermo` dà tre punti tutti raccolti lungo la via vera,
e nessuna voce Palermo sopravvive nell'angolo della mappa. Console pulita.

---

## 2026-07-29 — Secondo lotto; etichette col cognome in risalto

*Agente: Claude. Toccati `assets/streets.json` (rigenerato), `tools/merge-streets.py`,
`styles.css`. Nessun file di Codex riscritto.*

### Prima di tutto: il repository si era mosso sotto i piedi

Riprendendo il lavoro la cronologia git non era più quella lasciata al commit
`91d1e8c`: sopra c'erano **26 commit di Codex** (lente, vista d'insieme,
cronologia marker, liste condivise CAT-points) e il progetto era stato
**pubblicato** (`d66fc81`). Nessun lavoro perso, ma la copia in memoria di
`styles.css`, `app.js` e `index.html` era vecchia di ore.

Verificato prima di scrivere una riga:

* `assets/streets.json` **non toccato da Codex** → la rigenerazione non pesta
  niente;
* la loro unica modifica a `tools/merge-streets.py` era un commento (mappa da
  7559 a 8192 px) e **sopravvive** nella copia attuale;
* la **mappa è stata sostituita** — 8192×5787 contro 7559×5339. Le proporzioni
  però coincidono (1.4156 contro 1.4158): stesso inquadramento, solo più
  risoluzione, quindi **le coordinate normalizzate restano valide**. Se un
  domani la mappa venisse *ritagliata* diversamente, tutto l'indice andrebbe
  rifatto: vale la pena controllare le proporzioni a ogni sostituzione.

Le regole di §8 hanno funzionato in entrambe le direzioni: Codex ha tenuto
`HANDOFF.md` (+489 righe) e `AGENTS.md` (+192).

### Il lotto 2

121 punti, la parte destra della mappa e i buchi rimasti. Con questi le voci
con etichetta ancora grezza scendono **da 68 a 33**, e si chiudono da sole
diverse voci «da decidere» del giro precedente: `Dottor Biagio Gallo` era una
persona vera e ora ha la sua via, `Via Gaetano Cangemi` pure.

Totale: **423 voci**. Corretto anche un doppione dentro il lotto — `Cortile
Giuseppe PATANIA` inserito due volte a 0.0004 di distanza. La regola sui
doppioni ora distingue: stesso nome *e* stesso spillo è un errore di
inserimento, stesso nome ma punti lontani sono due tratti della stessa via
(`Via Stefano VIRGILIO` compare legittimamente in due punti).

### Le etichette, come le vuole l'utente

Decisione: **complete, abbreviazioni sciolte, cognome in MAIUSCOLO**. Serve a
«dare contesto alla ricerca e immediatezza di risultato» — l'occhio scorre la
lista e trova il cognome. Niente accorciamenti: «la completezza di informazione
è fondamentale».

    Via Arc. F. Avila        →  Via Arciprete Francesco AVILA
    C.LE AMARI               →  Cortile AMARI
    Largo Gaetano Di Blasi   →  Largo Gaetano DI BLASI
    Via Federico II          →  Via FEDERICO II

Il valore vero si vede sui quattro Gallo, prima indistinguibili a colpo
d'occhio: `Via Dottor Benedetto GALLO`, `Via Avvocato Giovanni GALLO`,
`Via Avvocato Leonardo GALLO`, `Via Dottor Biagio GALLO`.

Dettagli non ovvi, tutti nello script: le particelle del cognome vanno in
maiuscolo con lui (`DI BLASI` spezzato in `Di BLASI` si leggerebbe come due
cose), un ordinale in coda fa parte del nome (`FEDERICO II`) mentre un epiteto
no (`San SILVESTRO Papa`), e i token con maiuscole interne volute — `PalaSegesta`,
`D'Azeglio` — non si toccano.

### I tag

Standardizzati: grafia uniforme, e soprattutto **copertura garantita** — ogni
voce è ora cercabile col nome intero, senza la parola generica iniziale, e col
solo cognome. Prima era a caso: certe voci avevano il cognome sciolto fra i
tag, altre no, e la ricerca sembrava capricciosa senza motivo.

Tolte le ridondanze: un tag che ripete solo la parola generica («Cortile» su
«Cortile FANFULLA») non aggiunge niente, perché l'etichetta intera è già una
corrispondenza per prefisso. **I tag non si vedono da nessuna parte** — la
lista dei risultati mostra solo `label` — quindi la loro grafia è questione di
ordine nel file, non di interfaccia.

### La pillola di stato troncava i nomi

Con i nomi per esteso, `Mappa centrata su Chiesa dell'Immacolata CONCEZIONE`
finiva nei puntini di sospensione: spariva proprio il nome, l'unica cosa che il
messaggio doveva dire. Tolto il troncamento.

Non è bastato: il testo andava a capo dentro **188px su cinque righe**. Il
motivo è che con `left: 50%` più `transform: translateX(-50%)` la larghezza
disponibile per il calcolo è solo la metà destra dello schermo — la traslazione
ricentra dopo, a larghezza già decisa. Prima non si vedeva perché `nowrap`
ignorava il vincolo. Ancorata ai due lati con `width: fit-content` e margini
automatici: stesso centraggio, tutta la riga a disposizione, **tre righe invece
di cinque**.

### Verificato

Da cache e service worker azzerati, a 375×812: 423 voci, `mappa-squadra-v58`,
console pulita. Ricerche: `brandis` → tre tratti tutti con lo stesso nome
curato, `gallo` → quattro vie distinte, `patania` → una sola, `di blasi`,
`ruisi`, `cincinnato`, `cimitero` → due, `chianipodda` → gli alias dialettali
reggono. Pillola: testo intero, 343px, centrata, non troncata.

`styles.css?v=46`, `CACHE` a `mappa-squadra-v58`. **Non ho fatto push**: ora
c'è un remote e il sito è pubblicato, quindi la pubblicazione la decide l'utente.

### Da valutare

- **33 etichette ancora grezze.** Le contrade a est e sud (Affacciatura,
  Cannizza, Franco, Granatello, Margi, Rina, S. Pietro, Mazzaforte) sono
  campagna, forse fuori area di gioco. Ma dentro il paese restano scoperte
  `Cortile CANOVA`, `Cortile FARINI`, `Piazza CANNOLICCHIO`, `Via CRUCIS`,
  `Via MONTI`, `Via PASQUALE`, `Via STROZZI`, `Viale EUROPA`, `Via ACQUANUOVA`,
  `Via A. DE GASPERI` ×3, `Strada COMUNALE` ×2 e `Via BEN.` (nome troncato dal
  PDF, irrecuperabile senza guardare la mappa).
- **`Via PALERMO` a (0.116, 0.073)**, angolo in alto a sinistra, lontanissima
  dalla Via Palermo vera: quasi certamente un cartello stradale letto dal PDF,
  non una via del paese. Da cancellare?
- `Via ACQUANUOVA` ~ `Via ACQUANOVA`, 96% simili a 0.018 di distanza: stessa
  via scritta in due modi, probabilmente da fondere.
- `Via Padre PIO` accanto a `Villa Padre PIO` (0.0078), tenute separate dal
  controllo sul tipo.

---

## 2026-07-30 — Interruttore persistente per la lente

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Il messaggio fisso «Sposta la mappa sotto il mirino» è stato sostituito dal
pulsante **Lente attiva/disattivata**. Lo stato usa
`mappa-crosshair-lens-v1`, resta sul dispositivo e aggiorna testo,
`aria-pressed` e nome accessibile. Quando la lente è spenta, il canvas viene
svuotato: il cerchio trasparente e il punto oro restano visibili senza
ingrandire la mappa.

Gli avvisi non competono con il nuovo controllo: `#statusPill` compare
temporaneamente subito sopra e si nasconde dopo 2,8 secondi. Il pulsante viene
nascosto quando il punto è già confermato, perché in quella fase anche il
mirino non è operativo.

Verificati viewport 390×844 e 1440×900, attivazione/disattivazione,
persistenza dopo ricaricamento, avviso separato, centratura con i controlli e
assenza di errori console.

Bumpati `styles.css?v=44`, `app.js?v=44` e `mappa-squadra-v56`.

## 2026-07-30 — Cronologia a schede e workspace desktop

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

La cronologia è stata separata in due schede accessibili e persistenti:
**Punti** contiene revisione, riordino, etichette, foto, import/export ed
eliminazione; **Mappa e linee** raccoglie esclusivamente selezione e
collegamenti. La scheda attiva usa `mappa-marker-history-tab-v1` ed è
navigabile anche con frecce, Home ed End.

La selezione cartografica usa righe compatte con checkbox e pulsante
**Collega**, conteggio della lista corrente e totale globale. **Mostra tutti**
e **Nessuno** agiscono sulla lista visualizzata, **Nascondi tutti** su tutte le
liste. La logica persistente di visibilità e linee non cambia.

Da 900 px la mappa occupa tutta la viewport, i controlli restano centrati entro
760 px e il dialog cronologia raggiunge 1120 px: **Punti** usa una griglia a
due colonne, mentre **Mappa e linee** affianca elenco e pannello collegamenti.
Su mobile il dialog è stato ridotto a massimo 720 px e le sezioni scorrono
senza sovrapposizioni.

Verificati viewport 390×844 e 1440×900: quattro punti, selezione singola e
collettiva, collegamento/rimozione, persistenza della scheda, navigazione da
tastiera, mappa desktop a piena larghezza e assenza di errori console.

Bumpati `styles.css?v=43`, `app.js?v=43` e `mappa-squadra-v55`.

## 2026-07-30 — Mirino opzionale e linee tra punti

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

La vista **Vedi insieme** offre ora una preferenza persistente per mostrare o
nascondere contemporaneamente mirino e lente. La modalità pulita è quella
predefinita; quando è attiva, il comando centrale diventa **Mostra mirino** e
riporta entrambi senza uscire dalla vista d'insieme. La scelta usa
`mappa-overview-crosshair-v1`.

I punti selezionati possono essere collegati anche tra liste diverse:
**Collega** sceglie il primo estremo, **Collega qui** completa la linea e il
riepilogo globale **Linee tra punti** permette di rimuoverla con **Togli**. I
collegamenti usano riferimenti stabili alla lista e al punto, persistono in
`mappa-marker-history-connections-v1` e vengono ripuliti se un estremo non
esiste più. Una linea resta memorizzata quando un punto viene nascosto, ma si
disegna solo quando entrambi gli estremi sono visibili.

Verificati su viewport mobile: collegamento tra punto locale e importato,
persistenza dopo ricaricamento, rimozione singola, due segmenti SVG per la resa
con contorno, mirino/lente visibili insieme o entrambi nascosti e assenza di
errori console.

Bumpati `styles.css?v=39`, `app.js?v=42` e `mappa-squadra-v51`.

## 2026-07-30 — Vista d'insieme selettiva e mirino con lente

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Ogni punto della cronologia ha ora **Mostra sulla mappa**. La selezione è
separata per sorgente ma viene resa come un unico insieme: si possono quindi
combinare punti della lista personale e di più liste importate senza
modificarle. La scelta persiste in
`mappa-marker-history-visibility-v1`; cancellare un punto o una lista ripulisce
anche i riferimenti rimasti. Il riepilogo globale mostra il totale,
**Nascondi** azzera tutto e **Vedi insieme** chiude l'eventuale punto attivo,
centra il gruppo e restituisce pan e zoom.

I punti d'insieme conservano etichetta, didascalia/quadratino colorato e punto
oro, ma compensano la scala della mappa per rimanere leggibili a ogni zoom.
Verificata su viewport 393×852 una selezione composta da un punto locale e uno
importato, la persistenza dopo ricaricamento e l'azzeramento collettivo.

Il massimo zoom torna da 6× a 5×, valore precedente all'aumento che non era
stabile su tutti i dispositivi. Il cerchio del mirino è ora un canvas che
disegna in tempo reale una lente 2,35× sulla porzione esatta della mappa; il
punto oro centrale e le coordinate normalizzate non cambiano. Verificato che
la scala passa da `0.147227` a `0.736133`, rapporto 5 esatto, senza errori
console.

Bumpati `styles.css?v=38`, `app.js?v=39` e `mappa-squadra-v48`.

## 2026-07-30 — Cronologia crescente e importazione nativa

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

I nuovi punti vengono ora aggiunti in fondo alla cronologia invece che in
testa: l'ordine predefinito va quindi dal più vecchio al più recente secondo
`createdAt`. Modificare un punto continua ad aggiornare la voce sul posto e
non ne cambia la posizione. Nella scheda viene mostrata esplicitamente la data
di creazione, non `updatedAt`.

Le cronologie già salvate vengono ordinate una sola volta al primo avvio di
questa versione; la chiave `mappa-marker-history-order-v2` impedisce che la
migrazione si ripeta e sovrascriva successivi riordini manuali. Le liste
importate conservano invece l'ordine stabilito dal proprietario.

Il controllo è stato rinominato **Importa punti** e trasformato in
un'etichetta collegata direttamente all'input file: su touch apre il selettore
nativo senza dipendere da un click JavaScript su un input con `display:none`,
che è meno affidabile su iPhone. Mostra formato atteso, icona, stato
«Importazione…», errori nel pannello e accetta anche JSON con BOM.

Bumpati `styles.css?v=37`, `app.js?v=38` e `mappa-squadra-v47`.

## 2026-07-30 — Etichetta sul punto e liste CAT-points importabili

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Quando un punto ha un'etichetta cronologia, la mappa e il PNG mostrano ora
questa gerarchia: etichetta neutra in alto, didascalia o quadratino colorato al
centro, punto oro in basso. Verificato su viewport iPhone con «Busta 1» e
«A1»: i tre elementi non si sovrappongono.

La condivisione cronologia genera ora un pacchetto
`cat-points.marker-history` versione 3 con suffisso `*.catpoints.json`.
Contiene l'URL ufficiale del sito e le istruzioni per importarlo, un ID stabile
della lista, il proprietario responsabile, chi la sta condividendo e una
catena degli inoltri. Ricondividere una lista ricevuta conserva il proprietario
e aggiunge il partecipante corrente alla catena. Se Web Share non supporta il
file, viene scaricato il pacchetto importabile invece di condividere un
riepilogo testuale che perderebbe i dati.

La cronologia offre **Importa lista JSON** e un selettore tra lista personale e
liste ricevute. Le importazioni sono persistenti, separate e in sola lettura:
permettono solo «Rivedi», «Invia foto», ricondivisione e rimozione completa.
Sono accettati anche i vecchi export versione 2, convertiti al nuovo modello.
Verificato importando due punti attribuiti a Mario Rossi e condivisi da Luigi
Bianchi, persistenza dopo ricaricamento e assenza di errori console.

Bumpati `styles.css?v=36`, `app.js?v=37` e `mappa-squadra-v46`.

## 2026-07-30 — Punto oro e colore applicato alla didascalia

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Il punto centrale è ora sempre oro, uguale al centro del mirino. Il colore
scelto dall'utente viene applicato alla didascalia del testo; se il testo manca
compare sopra il punto un quadratino arrotondato monocolore, bicolore o solo
bordato quando si sceglie il trasparente.

Il contrasto viene calcolato sulla luminanza dei colori: l'app sceglie bianco
o nero e, nei casi misti in cui nessuno dei due raggiunge un buon contrasto su
entrambe le metà, aggiunge un contorno opposto. La stessa resa è usata nel PNG.
Le anteprime della cronologia mostrano il colore della didascalia come
quadratino e il punto oro al centro.

Verificati su viewport iPhone quadratino rosso senza testo, didascalia gialla
con testo nero e didascalia nero/bianca con contorno; nessun errore console.
Bumpati `styles.css?v=35`, `app.js?v=36` e `mappa-squadra-v45`.

## 2026-07-30 — Flusso esplicito per segnare più punti

*Agente: Codex. Toccati `index.html`, `styles.css`, `app.js`,
`service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Dopo la conferma compare ora **Segna nuovo punto**: conclude la voce attiva,
lascia la mappa nella posizione raggiunta e conserva i colori, ma svuota testo
ed etichetta. La conferma successiva crea quindi una nuova voce nella
cronologia. **Cambia posizione** mantiene invece il significato precedente:
riposiziona e aggiorna lo stesso punto.

Il nuovo comando occupa una riga intera per essere evidente e il messaggio di
stato si alza quando sono visibili i controlli successivi alla conferma, senza
sovrapporsi su mobile. Bumpati `styles.css?v=34`, `app.js?v=35` e
`mappa-squadra-v44`.

## 2026-07-30 — Punti bordati, mappa più nitida e coordinate geografiche

*Agente: Codex con skill Impeccable e PDF. Toccati `assets/map-placeholder.jpg`,
`app.js`, `styles.css`, `index.html`, `service-worker.js`,
`tools/merge-streets.py`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Il punto ha ora un bordo nero sottile con qualunque colore, anche bicolore,
bianco o trasparente; lo stesso bordo viene disegnato nel PNG e nelle anteprime
della cronologia. Tutte le stringhe visibili usano «Punto» al posto di
«Marker», senza rinominare identificatori e chiavi di storage per non perdere
la cronologia esistente.

La mappa è stata rigenerata dal PDF a 8192×5787 px, JPEG progressivo qualità
88: risulta più netta con un aumento contenuto da 4,4 a 4,7 MB. Lo zoom massimo
passa da 5× a 6× rispetto alla vista iniziale.

Gli strumenti coordinate mostrano anche latitudine e longitudine WGS84
stimate. La trasformazione affine usa sei riferimenti OpenStreetMap e resta
entro circa 20 metri sui punti di controllo. `x`/`y` non cambiano: continuano
a guidare ricerca, lotti manuali e **Copia x/y**. La cronologia deriva le
coordinate geografiche al volo e le include negli export.

Bumpati `styles.css?v=33`, `app.js?v=34` e `mappa-squadra-v43`.

## 2026-07-30 — Intera area della mappa raggiungibile

*Agente: Codex con skill Impeccable. Toccati `app.js`, `styles.css`,
`index.html`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Il vecchio `constrain()` obbligava l'immagine a coprire sempre lo stage:
poiché il mirino è fisso al centro, i bordi si fermavano sul bordo dello
schermo e una fascia della carta non poteva mai arrivare sotto il punto.

I limiti di pan sono ora `center - imageSize` e `center`, quindi il mirino può
raggiungere coordinate normalizzate esatte da 0 a 1 su entrambi gli assi. Lo
spazio inevitabilmente esposto oltre la carta usa un fondale sfocato e scuro;
un contorno sottile distingue sempre la mappa vera. L'export PNG applica lo
stesso fondale e lo stesso contorno, evitando grandi zone nere quando si
condivide un marker vicino a un bordo.

Bumpati `styles.css?v=32`, `app.js?v=33` e `mappa-squadra-v42`.

## 2026-07-30 — Menu desktop leggibili, ordine ed export cronologia

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

Le `<option>` dei due selettori colore dichiarano ora esplicitamente testo
chiaro e sfondo scuro: su desktop non dipendono più dal popup bianco imposto
dal browser.

Ogni scheda della cronologia mostra «Posizione N di M» e i pulsanti «Su» e
«Giù». Lo scambio modifica direttamente l'array del partecipante in
`mappa-marker-history-v1`; anche la modifica successiva di un marker conserva
la posizione scelta invece di riportarlo in testa.

«Esporta / invia cronologia» costruisce un JSON ordinato con partecipante,
etichette, testo marker, colori, coordinate e date. Se Web Share accetta il
file lo invia direttamente; altrimenti prova un riepilogo testuale condiviso,
oppure scarica il JSON su browser senza condivisione.

Bumpati `styles.css?v=31`, `app.js?v=32` e `mappa-squadra-v41`.

## 2026-07-29 — Audit definitivo di icone e aree tattili

*Agente: Codex con skill Impeccable (`audit`). Toccati `index.html`,
`styles.css`, `service-worker.js`, `AGENTS.md`, `HANDOFF.md`.*

L'audit dei controlli circolari ha trovato lo stesso difetto della cronologia
anche su ricerca e zoom: i simboli `◷`, `⌕`, `−`, `＋` e le `×` dipendevano
dalle metriche del font. Cronologia, ricerca e zoom usano ora SVG con
`viewBox` centrato; tutte le chiusure dei dialog usano la stessa croce CSS
geometrica già collaudata sulla cronologia.

Il controllo ha incluso anche le aree tattili: ricerca e chiusure sono ora
44×44 px, e i pulsanti compatti di coordinate, lista manuale e cronologia
hanno `min-height: 44px`. Restano testuali soltanto controlli per cui il testo
è informazione reale (`x/y`, nomi delle azioni), non un'icona improvvisata.

Bumpati `styles.css?v=30` e `mappa-squadra-v40`; il JavaScript resta
`app.js?v=31`.

## 2026-07-29 — Etichetta immediata, colori a tendina e Home

*Agente: Codex con skill Impeccable. Toccati `index.html`, `styles.css`,
`app.js`, `service-worker.js`, `README.md`, `AGENTS.md`, `HANDOFF.md`.*

«Personalizza il marker» espone ora il campo «Etichetta cronologia» insieme al
testo breve: l'etichetta viene salvata alla conferma senza dover riaprire la
cronologia. La selezione a pallini è stata sostituita da due menu nativi,
«Colore principale» e «Secondo colore», così il bicolore resta disponibile ma
occupa meno spazio su telefono.

L'opzione «Personalizzato…» apre soltanto quando richiesta il campo che
riconosce nomi, HEX, RGB e HSL; i colori personalizzati già salvati vengono
mostrati come opzioni dinamiche. Il pulsante `↺` in alto è stato sostituito da
un'icona Home SVG, mantenendo la stessa funzione di ritorno alla vista
iniziale.

Bumpati `styles.css?v=29`, `app.js?v=31` e `mappa-squadra-v39`.

## 2026-07-29 — Chiusura cronologia centrata geometricamente

*Agente: Codex con skill Impeccable. Toccati `styles.css`, `index.html`,
`service-worker.js`, `AGENTS.md`, `HANDOFF.md`.*

La `×` testuale del pulsante di chiusura della cronologia risultava
otticamente decentrata per le metriche del glifo. Solo su
`#closeMarkerHistoryButton` viene ora disegnata con due segmenti CSS centrati
al 50% del cerchio, senza cambiare gli altri dialog.

Bumpati `styles.css?v=28` e `mappa-squadra-v38`; il JavaScript resta
`app.js?v=30`.

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
