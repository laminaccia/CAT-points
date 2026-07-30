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
- Dopo aver centrato e fissato il punto, premere **Copia x/y** per copiare le due proprietà già formattate per il JSON.
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

- Il punto sulla mappa resta sempre oro, come il centro del mirino. **Segna questo punto** permette invece di scegliere il colore della didascalia tramite preset, nomi o codici (`#FF0000`, `rgb(255, 0, 0)`, `hsl(0, 100%, 50%)`), anche in versione bicolore. Se il testo manca compare un piccolo quadratino arrotondato del colore scelto; con il testo l’app seleziona automaticamente bianco o nero e aggiunge un contorno quando serve per mantenere il contrasto. La stessa resa viene usata nel PNG e nella cronologia.
- La mappa può essere trascinata finché ciascuno dei quattro bordi raggiunge il centro del mirino: sono quindi selezionabili anche gli angoli estremi. Oltre il bordo vero compare un fondale sfocato che non viene confuso con la carta utilizzabile.
- Gli strumenti `x/y` mostrano anche latitudine e longitudine WGS84 in gradi decimali come **stima cartografica**. Il pulsante **Copia x/y** continua intenzionalmente a copiare soltanto le coordinate normalizzate usate da `streets.json`.
- Dopo la conferma, **Segna nuovo punto** conclude quello corrente e torna al mirino mantenendo posizione e colori, ma azzerando testo ed etichetta: la conferma successiva crea una nuova voce nella cronologia. **Modifica punto** cambia colore o testo senza spostarlo; **Cambia posizione** riposiziona invece lo stesso punto già salvato.
- L’icona **Home** in alto a destra conclude il punto corrente e riporta mappa e controlli alla vista iniziale.
- Il pulsante con l’orologio nella barra di ricerca apre la cronologia locale del partecipante: ogni punto può essere riordinato, etichettato, rivisto sulla mappa, inviato nuovamente come foto o eliminato. **Esporta / invia cronologia** condivide un JSON comprensivo di coordinate x/y e geografiche stimate, ripiega su un riepilogo testuale oppure scarica il file. I dati restano soltanto in quel browser/dispositivo.
- **Condividi PNG** usa il menu nativo quando il dispositivo supporta la condivisione di file.
- **Copia immagine** copia il PNG negli appunti; su iPhone, se gli appunti immagine sono bloccati da HTTP, salva il PNG per poterlo condividere dal menu dell’iPhone.

## Nota PWA

Il service worker richiede l'esecuzione tramite HTTP/HTTPS. Non aprire direttamente `index.html` con `file://`.
