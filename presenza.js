/*
  Presenza in tempo reale — chi ha CAT Points aperto *in questo momento*.

  Non è un registro storico e non è un cancello: non tiene traccia di chi è
  entrato ieri e non impedisce a nessuno di entrare. Dice una cosa sola, quella
  che serve all'organizzatore durante il gioco: chi ha l'app davanti agli occhi
  adesso.

  Il battito parte SOLO mentre la pagina è visibile, e si ferma appena il
  telefono va in tasca. È una scelta, non un limite subìto: iOS congela i timer
  di un'app in secondo piano, quindi un battito che continuasse "quando può"
  darebbe un elenco che dipende dai capricci del browser invece che dalla
  realtà. Fermandolo di proposito, «presente» vuol dire esattamente quello che
  promette.

  Il file è deliberatamente scollegato da `app.js`: legge il nome dallo stesso
  `localStorage` in cui l'app lo salva, così non c'è nessun aggancio da
  mantenere fra i due. Si può cancellare `presenza.js` e togliere il suo
  <script> senza che una riga di `app.js` se ne accorga.
*/
(() => {
  "use strict";

  // ✏️ MODIFICA QUI — indirizzo del Worker che raccoglie le presenze, senza
  // barra finale (es. "https://cat-presenza.tuonome.workers.dev").
  // Finché resta vuoto la presenza è SPENTA: nessuna richiesta di rete,
  // nessun errore in console, l'app si comporta esattamente come prima.
  // Le istruzioni per crearlo sono in `presenza/README.md`.
  const ENDPOINT = '';

  // 30 secondi: abbastanza fitto da far comparire chi apre l'app quasi subito,
  // abbastanza rado da essere invisibile su batteria e traffico. Il server
  // considera presente chi si è fatto sentire negli ultimi 75 secondi, cioè
  // tollera un battito perso senza far sparire nessuno dall'elenco.
  const INTERVALLO_MS = 30000;

  const CHIAVE_NOME = 'mappa-player-name';
  const CHIAVE_DISPOSITIVO = 'mappa-dispositivo-id';

  if (!ENDPOINT) return;

  let timer = null;

  function leggi(chiave) {
    try {
      return localStorage.getItem(chiave) || '';
    } catch (errore) {
      return '';
    }
  }

  // L'identificativo distingue due telefoni che hanno scritto lo stesso nome.
  // È un numero casuale generato qui, non ricavato dal dispositivo: non
  // identifica nessuno fuori da questa app e sparisce svuotando i dati del
  // sito.
  function identificativoDispositivo() {
    let id = leggi(CHIAVE_DISPOSITIVO);
    if (id) return id;
    id = (crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      localStorage.setItem(CHIAVE_DISPOSITIVO, id);
    } catch (errore) {
      // Navigazione privata o spazio esaurito: l'identificativo vale solo per
      // questa sessione. La presenza funziona lo stesso, semplicemente al
      // riavvio quel telefono risulta un dispositivo nuovo.
    }
    return id;
  }

  // Etichetta grossolana, a uso di chi legge il pannello: serve a capire se
  // «Marco · iPhone» e «Marco · Android» sono la stessa persona con due
  // telefoni. Volutamente non si scende al modello.
  function tipoDispositivo() {
    const ua = navigator.userAgent;
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iPad';
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/Android/.test(ua)) return 'Android';
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows';
    return 'Altro';
  }

  function appInstallata() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function corpo() {
    return JSON.stringify({
      id: identificativoDispositivo(),
      nome: leggi(CHIAVE_NOME),
      dispositivo: tipoDispositivo(),
      installata: appInstallata()
    });
  }

  // `text/plain` invece di `application/json` di proposito: è uno dei tipi che
  // il browser considera innocui, quindi la richiesta parte diretta senza la
  // chiamata OPTIONS di verifica. Dimezza il traffico e toglie di mezzo una
  // classe intera di errori CORS. Il Worker legge il testo e lo interpreta.
  const TIPO = 'text/plain;charset=UTF-8';

  function batti() {
    if (!leggi(CHIAVE_NOME)) return;
    fetch(`${ENDPOINT}/presenza`, {
      method: 'POST',
      headers: { 'Content-Type': TIPO },
      body: corpo(),
      keepalive: true
    }).catch(() => {
      // Rete assente in mezzo alla campagna: è il caso normale, non un errore.
      // Chi non si fa sentire scade dall'elenco da solo dopo 75 secondi e
      // ricompare al primo battito che riesce a partire.
    });
  }

  function esci() {
    const dati = new Blob([corpo()], { type: TIPO });
    // `sendBeacon` è l'unico invio che il browser porta a termine mentre sta
    // già chiudendo o sospendendo la pagina. Con una `fetch` normale, qui,
    // l'uscita si perderebbe quasi sempre.
    if (!navigator.sendBeacon || !navigator.sendBeacon(`${ENDPOINT}/uscita`, dati)) {
      fetch(`${ENDPOINT}/uscita`, {
        method: 'POST',
        headers: { 'Content-Type': TIPO },
        body: corpo(),
        keepalive: true
      }).catch(() => {});
    }
  }

  function avvia() {
    if (timer) return;
    batti();
    timer = setInterval(batti, INTERVALLO_MS);
  }

  function ferma() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    esci();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') avvia();
    else ferma();
  });

  // `pagehide` copre la chiusura della scheda e il passaggio alla cache di
  // navigazione di Safari, dove `unload` non arriva.
  window.addEventListener('pagehide', ferma);

  // Al primissimo avvio il nome ancora non esiste, quindi il battito iniziale
  // non parte e senza questo aggancio bisognerebbe aspettare il tick dei 30
  // secondi: chi si è appena presentato non comparirebbe nell'elenco, e
  // l'organizzatore penserebbe che non è entrato. Il `setTimeout` a zero
  // lascia finire il gestore dell'app, che è quello che scrive il nome.
  //
  // È l'unico punto di contatto con l'app, ed è sull'HTML, non sul suo codice.
  const modulo = document.getElementById('identityForm');
  if (modulo) modulo.addEventListener('submit', () => setTimeout(batti, 0));

  // La nota all'ingresso resta nascosta nell'HTML e compare solo qui: se la
  // presenza è spenta, l'app non deve dichiarare una cosa che non fa.
  const nota = document.getElementById('presenzaNota');
  if (nota) nota.classList.remove('hidden');

  if (document.visibilityState === 'visible') avvia();
})();
