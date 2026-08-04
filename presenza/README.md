# Presenza — chi ha CAT Points aperto adesso

Questa cartella **non fa parte del sito**: non va caricata insieme all'app. È
il pezzo di server che risponde a una domanda sola — chi ha l'app aperta e
davanti agli occhi in questo momento.

Non tiene un archivio degli accessi passati e non impedisce a nessuno di
entrare. Se un giorno servisse una di queste due cose, sono lavori diversi.

---

## Come è fatto

```
presenza/
  wrangler.toml    configurazione
  src/index.js     Worker + Durable Object + pannello dell'organizzatore
```

Il dispositivo, ogni 30 secondi e **solo mentre la pagina è visibile**, manda
`{id, nome, dispositivo}` a `/presenza`. Chi non si fa sentire da 75 secondi
esce dall'elenco da solo. Quando l'app va in secondo piano il client manda
`/uscita` e sparisce subito.

L'organizzatore apre l'indirizzo del Worker, digita il token e vede l'elenco,
che si aggiorna ogni 10 secondi.

Niente database: la presenza vale settantacinque secondi, tenerla in memoria
basta. Se il Durable Object viene riavviato, l'elenco si ricostruisce da solo
entro mezzo minuto.

---

## Pubblicarlo (una volta sola, ~10 minuti)

Serve un account Cloudflare gratuito e Node installato.

**1. Entrare nella cartella e collegare l'account.**

```bash
cd presenza && npx wrangler login
```

Si apre il browser, si autorizza, si torna al terminale.

**2. Scegliere il token di amministratore.**

È la password con cui si apre il pannello. Va inventata lunga (una frase, non
una parola) e conservata nel gestore di password — non finisce da nessuna parte
in questo repository.

```bash
npx wrangler secret put TOKEN_AMMINISTRATORE
```

Il comando lo chiede e non lo mostra a schermo.

**3. Pubblicare.**

```bash
npx wrangler deploy
```

Alla fine stampa l'indirizzo, del tipo
`https://cat-presenza.<nome-account>.workers.dev`. **Va copiato.**

**4. Accendere la presenza nell'app.**

In `presenza.js`, alla riga marcata `✏️ MODIFICA QUI`, incollare l'indirizzo
**senza barra finale**:

```js
const ENDPOINT = 'https://cat-presenza.<nome-account>.workers.dev';
```

Finché quella riga resta vuota la presenza è spenta: nessuna richiesta di rete,
nessun errore, l'app si comporta come prima. È il motivo per cui si può
pubblicare l'app anche prima di aver creato il Worker.

**5. Bumpare le versioni e ripubblicare l'app**, come per qualunque modifica a
un JS: `presenza.js?v=N` in `index.html` e la costante `CACHE` in
`service-worker.js` (vedi §5 di `AGENTS.md`).

---

## Usarlo

Aprire l'indirizzo del Worker, digitare il token. Il token resta nella memoria
della scheda finché non la si chiude, e non passa mai dall'indirizzo: una URL
con dentro la password finirebbe nella cronologia, nei log del server e nel
primo messaggio in cui si condivide il link.

---

## Costi

Zero, ampiamente dentro i piani gratuiti. Trenta persone per tre ore fanno
circa 10.000 richieste; il piano gratuito dei Worker ne concede 100.000 al
giorno.

---

## Cosa questo strumento **non** dice

- **Non dice dove si trova nessuno.** La posizione di «Localizzami» resta sul
  telefono e non viene mai mandata qui.
- **Non verifica i nomi.** Sono quelli che ciascuno ha scritto nell'app: due
  persone possono chiamarsi entrambe «Marco», e chiunque abbia il link può
  presentarsi come chi vuole. Per questo l'elenco mostra anche il tipo di
  dispositivo e un frammento di identificativo: due telefoni con lo stesso nome
  si vedono.
- **Non è un cancello.** L'app e la mappa restano raggiungibili da chiunque
  conosca l'indirizzo.
- **Non ricorda niente.** Chiuso il gioco, non resta traccia di chi c'era.
