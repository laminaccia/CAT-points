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

## Marker e condivisione

- **Segna questo punto** offre i colori principali, un campo che riconosce nomi e codici colore (`#FF0000`, `rgb(255, 0, 0)`, `hsl(0, 100%, 50%)`) e un testo facoltativo, per esempio `A12`.
- Dopo la conferma, **Modifica marker** cambia colore o testo senza spostare il punto; **Cambia posizione** torna al mirino per scegliere nuovamente il punto.
- **Condividi PNG** usa il menu nativo quando il dispositivo supporta la condivisione di file.
- **Copia immagine** copia il PNG negli appunti; su iPhone, se gli appunti immagine sono bloccati da HTTP, salva il PNG per poterlo condividere dal menu dell’iPhone.

## Nota PWA

Il service worker richiede l'esecuzione tramite HTTP/HTTPS. Non aprire direttamente `index.html` con `file://`.
