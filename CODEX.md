# Mappa Squadra — istruzioni per Codex

## Obiettivo
Web app mobile-first per una caccia al tesoro. Il giocatore deve:
1. visualizzare una mappa fornita come immagine JPG;
2. spostarla e ingrandirla;
3. posizionare un punto tramite mirino centrale;
4. generare un PNG della vista con il marker;
5. condividerlo tramite il menu nativo del telefono, soprattutto WhatsApp.

## Vincoli
- Progetto statico: HTML, CSS e JavaScript puro.
- Nessun backend, login, database o geolocalizzazione.
- Deve funzionare su iPhone e Android.
- Deve poter essere installato come PWA e funzionare offline dopo il primo caricamento.
- Interfaccia scura, minimale, immersiva, ottimizzata per uso verticale.
- Non introdurre dipendenze npm o build step senza necessità esplicita.

## File principali
- `index.html`: struttura dell'app.
- `styles.css`: interfaccia e stile.
- `app.js`: pan, zoom, marker, esportazione e condivisione.
- `service-worker.js`: cache offline.
- `manifest.webmanifest`: installazione PWA.
- `assets/map-placeholder.jpg`: sostituire con la mappa definitiva mantenendo lo stesso nome, oppure aggiornare il riferimento in `index.html` e `service-worker.js`.
- `assets/map-placeholder.pdf`: sorgente della mappa con livello testuale ricercabile.
- `assets/streets.json`: indice locale dei punti, con `label` mostrata nei risultati, `tags` ricercabili e coordinate normalizzate sulla mappa.

## Identità partecipante
Il partecipante inserisce nome e cognome al primo accesso. Il valore viene salvato in `localStorage` sul dispositivo e può essere modificato toccando il nome in alto a sinistra.

## Criteri di accettazione
- La mappa copre sempre lo schermo senza lasciare spazi vuoti.
- Pan e zoom sono fluidi.
- Il marker appare al centro esatto del mirino.
- Dopo la conferma la mappa non si muove accidentalmente.
- Il PNG include mappa, partecipante, marker, data e ora, ma non i pulsanti.
- Su browser compatibili il pulsante usa Web Share API; altrimenti scarica il PNG.
- Il marker permette di scegliere colore e testo breve.
- Il pulsante di copia usa Clipboard API quando disponibile.
- La PWA si apre anche offline dopo il primo caricamento.

## Sviluppi successivi possibili
- Colori distinti per squadra.
- Selettore missione o giorno.
- Marker personalizzato SVG.
- Cornice grafica dedicata all'evento.
- Memorizzazione locale dell'ultima posizione.
- Più mappe selezionabili.
