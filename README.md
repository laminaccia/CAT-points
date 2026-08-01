# Mappa Squadra

Prototipo locale di web app/PWA per indicare un punto su una mappa JPG e condividere il risultato come PNG.

La mappa visualizzata è la versione raster di `assets/map-placeholder.pdf`; le vie ricercabili, i tag di ricerca e le loro coordinate sono in `assets/streets.json`.

Se una via compare più volte nella mappa, la ricerca mostra tutte le occorrenze numerate e non sceglie automaticamente la prima.

## Avvio locale

Da terminale, nella cartella del progetto:

```bash
python3 -m http.server 8000
```

Poi aprire:

```text
http://localhost:8000
```

Su un altro dispositivo nella stessa rete usare l'indirizzo IP del computer, per esempio:

```text
http://192.168.1.20:8000
```

## Personalizzazione rapida

1. Sostituire `assets/map-placeholder.pdf` e la relativa immagine `assets/map-placeholder.jpg`.
2. Aggiornare `assets/streets.json` con `label`, `tags` e coordinate normalizzate per ogni punto. `label` è il testo mostrato nei risultati, mentre `tags` contiene le parole e gli alias ricercabili.
3. Aprire l’app e inserire nome e cognome del partecipante; il nome resta salvato su quel dispositivo e può essere modificato toccandolo in alto a sinistra.
4. Modificare colori e testi in `styles.css` e `index.html`.

## Coordinate delle vie

- Gli strumenti coordinate sono nascosti al primo accesso; premere **x/y** in alto a destra per mostrarli.
- Il pannello sotto il mirino mostra in tempo reale le coordinate normalizzate `x` e `y` usate da `assets/streets.json`.
- **Copia x/y**, sulla stessa riga dei valori normalizzati, copia le due proprietà già formattate per il JSON. **Copia per Maps**, allineato con latitudine e longitudine, copia invece una coppia in gradi decimali pronta da incollare in Google Maps, Apple Maps, OpenStreetMap o Waze.
- I valori vanno da `0` a `1`: `x` cresce da sinistra a destra e `y` dall’alto verso il basso.

## Lista manuale dei nuovi punti

1. Spostare il mirino sulla posizione da registrare.
2. Premere **Aggiungi punto** e inserire la label mostrata nel menu.
3. Inserire uno o più tag separati da virgole, quindi premere **Continua**.
4. Controllare il riepilogo e premere **Conferma aggiunta**.
5. Aprire **Lista** per controllare o eliminare i punti raccolti.
6. Usare **Copia JSON** oppure **Scarica JSON** per ottenere `manual-streets.json`.

La lista manuale è separata da `assets/streets.json` e viene salvata nel browser utilizzato. Il file esportato ha già la struttura `{ "streets": [...] }` e può essere unito all’indice principale.

## Punti e condivisione

- Il punto sulla mappa resta sempre oro, come il centro del mirino. **Segna questo punto** permette invece di scegliere il colore della didascalia tramite preset, nomi o codici (`#FF0000`, `rgb(255, 0, 0)`, `hsl(0, 100%, 50%)`), anche in versione bicolore. Se il testo manca compare un piccolo quadratino arrotondato del colore scelto; con il testo l’app seleziona automaticamente bianco o nero e aggiunge un contorno quando serve per mantenere il contrasto. Quando è presente, l’etichetta della cronologia compare sopra la didascalia colorata: l’ordine visivo è quindi etichetta, colore/testo e punto oro. La stessa resa viene usata nel PNG e nella cronologia.
- La mappa può essere trascinata finché ciascuno dei quattro bordi raggiunge il centro del mirino: sono quindi selezionabili anche gli angoli estremi. Oltre il bordo vero compare un fondale sfocato che non viene confuso con la carta utilizzabile.
- Gli strumenti `x/y` mostrano anche latitudine e longitudine WGS84 in gradi decimali come **stima cartografica**. **Copia x/y** continua intenzionalmente a copiare soltanto le coordinate normalizzate usate da `streets.json`, mentre **Copia per Maps** copia la posizione geografica stimata.
- Dopo la conferma, **Segna nuovo punto** conclude quello corrente e torna al mirino mantenendo posizione e colori, ma azzerando testo ed etichetta: la conferma successiva crea una nuova voce nella cronologia. **Modifica punto** cambia colore o testo senza spostarlo; **Cambia posizione** riposiziona invece lo stesso punto già salvato.
- L’icona **Home** in alto a destra conclude il punto corrente e riporta mappa e controlli alla vista iniziale.
- Il pulsante con l’orologio nella barra di ricerca apre la cronologia locale del partecipante, ora divisa in due schede. **Punti** raccoglie riordino, etichette, revisione, foto, eliminazione, importazione ed export; **Mappa e linee** è uno spazio dedicato alla selezione cartografica e ai collegamenti. I punti partono dal più vecchio e crescono secondo la data di creazione; modificarne uno non ne cambia la posizione. **Condividi questa lista** genera un pacchetto `*.catpoints.json` legato esplicitamente a questo sito: contiene URL e istruzioni di importazione, proprietario originale, persona che sta condividendo e catena dei passaggi. **Importa punti** conserva le liste ricevute separate e in sola lettura. Tutti i dati restano soltanto nel browser/dispositivo.
- In **Mappa e linee**, **Mostra tutti** e **Nessuno** agiscono sulla lista visualizzata. La voce **Selezionati** del menu riunisce invece i punti scelti da tutte le liste, indica sempre il proprietario e permette di riordinarli con **Su**/**Giù** o collegarli senza saltare da una lista all’altra. L’ordine resta salvato sul dispositivo senza modificare le cronologie originali. **Vedi insieme** inquadra il gruppo e l’opzione dedicata decide se mantenere visibile il mirino.
- Due punti visibili, anche appartenenti a liste diverse, possono essere uniti dal pannello con **Collega** e **Collega qui** oppure direttamente sulla carta: **Vedi insieme** → **Collega punti** → tocco dei due estremi. Ogni linea ha un piccolo punto di presa centrale che apre l’editor per curvarla, raddrizzarla o eliminarla. Le linee restano salvate sul dispositivo e compaiono solo quando entrambi i punti sono visibili. Nella lista **Mappa e linee**, etichetta e testo/tag vengono mostrati insieme quando sono entrambi presenti.
- Su desktop la mappa usa tutta la larghezza disponibile mantenendo i controlli centrati; la cronologia si apre come workspace ampio, con griglia a due colonne nella scheda **Punti** e selezione/linee affiancate nella scheda cartografica. Su mobile le stesse funzioni restano in un pannello più basso e scorrono senza sovrapporsi.
- Lo zoom massimo è limitato a 5× rispetto alla vista iniziale, più affidabile sui dispositivi mobili. Al posto del precedente messaggio fisso, il pulsante **Lente attiva/disattivata** abilita la lente 2,35× del mirino; la scelta resta salvata sul dispositivo. Quando è spenta rimangono il cerchio trasparente e il punto oro, senza ingrandimento. Gli avvisi dell’app compaiono temporaneamente subito sopra il pulsante.
- **Condividi PNG** usa il menu nativo quando il dispositivo supporta la condivisione di file.
- **Copia immagine** copia il PNG negli appunti; su iPhone, se gli appunti immagine sono bloccati da HTTP, salva il PNG per poterlo condividere dal menu dell’iPhone.

## Nota PWA

Il service worker richiede l'esecuzione tramite HTTP/HTTPS. Non aprire direttamente `index.html` con `file://`.
