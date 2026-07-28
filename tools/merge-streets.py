#!/usr/bin/env python3
"""
Normalizza e unisce lotti di punti nell'indice `assets/streets.json`.

Perché esiste
-------------
L'indice nasce da due sorgenti che non si somigliano per niente:

* l'**estrazione automatica dal livello testo del PDF** — copre tutta la mappa
  ma le etichette sono grezze («c/da FRANCO», «CORSO VITT. EMANUELE»), spesso
  troncate dagli a capo del PDF («Via Sac. Giuseppe» in sei punti diversi) e
  raddoppiate (ogni «c/da X» esiste anche come «Contrada X» alle stesse
  coordinate);
* i **punti raccolti a mano** con lo strumento dell'app — etichette corrette e
  soprattutto gli alias dialettali che nessuna estrazione automatica potrà mai
  produrre («Chianipodda», «U Signuri», «A Circiara»).

Unire a mano un lotto è fattibile una volta; a ogni nuovo lotto diventa un
lavoro da rifare daccapo, e i confronti a occhio sbagliano. Da qui lo script.

Uso
---
    python3 tools/merge-streets.py            # ricostruisce assets/streets.json
    python3 tools/merge-streets.py --dry-run  # solo il rapporto, non scrive

Per aggiungere un lotto: salvare il JSON esportato da «Scarica JSON» come
`data/sorgenti/lotto-NN.json` e rilanciare. Nient'altro.

**`assets/streets.json` è un file generato: non si modifica a mano.** Le
sorgenti stanno in `data/sorgenti/` e sono le uniche cose da curare —
`estrazione-pdf.json` (l'estrazione originale, che si tiene com'è per poterla
riconfrontare) e i `lotto-NN.json` in ordine.

La ricostruzione parte sempre da zero proprio per questo: se lo script leggesse
l'indice già fuso e ci riscrivesse sopra, al lotto successivo i punti curati la
volta prima verrebbero scambiati per dati grezzi e potrebbero essere rinominati.
Rigenerare tutto rende il risultato indipendente dall'ordine in cui sono
arrivati i lotti, e ripetibile.

Non è una dipendenza del sito — è uno strumento di manutenzione. L'app resta
HTML/CSS/JS puro e legge soltanto il JSON prodotto.
"""

import argparse
import json
import math
import pathlib
import re
import sys
import unicodedata

RADICE = pathlib.Path(__file__).resolve().parent.parent
INDICE = RADICE / "assets" / "streets.json"
SORGENTI = RADICE / "data" / "sorgenti"
ESTRAZIONE = SORGENTI / "estrazione-pdf.json"

# Stessa lista di app.js: sono parole che il motore toglie dalla query, quindi
# un tag fatto solo di queste non può essere trovato in nessun modo.
PAROLE_GENERICHE = {
    "VIA", "VIALE", "CONTRADA", "CORSO", "PIAZZA", "STRADA",
    "C", "CDA", "DA", "LE", "AVV", "DOTTOR", "SS", "SP",
}

# Tre soglie, perché «stesso posto» e «stessa via» non sono la stessa domanda.
# Le distanze sono in coordinate normalizzate; la mappa è larga 7559 px, quindi
# 0.005 valgono una quarantina di pixel.
#
# Perché servono davvero: il solo nome è un giudice pessimo. «Strada Patti» e
# «Ponte Patti» condividono il tag «Patti» ma distano 0.60, mezza mappa. Al
# contrario «C/le Sciaffino» e «Cortile Schiaffino» distano 0.0026 e sono
# ovviamente lo stesso cortile, ma i nomi non combaciano per via di una lettera.
# Nome e distanza vanno usati insieme, mai da soli.

# Stesso spillo sulla mappa: è un doppione qualunque cosa dicano le etichette.
SOGLIA_STESSO_PIN = 0.005

# Stesso posto, se anche i nomi sono imparentati.
SOGLIA_STESSO_POSTO = 0.012

# Oltre questa distanza due punti con nomi imparentati non sono più lo stesso
# posto: o sono tratti lontani di una via lunga, o è una coincidenza di
# cognome. Lo script non prova a indovinare — li segnala e li lascia stare.
SOGLIA_STESSA_VIA = 0.08

# Prima parola dell'etichetta: dice *che cosa* è il posto. Una contrada non
# diventa una via né una chiesa, per quanto vicine siano e per quanto il nome
# si somigli — «Contrada Cappuccini» e «Chiesa dei Cappuccini» sono due cose.
TIPI = {
    "VIA", "VIALE", "CORSO", "PIAZZA", "PIAZZETTA", "LARGO", "CORTILE",
    "CONTRADA", "STRADA", "SALITA", "VICOLO", "PONTE", "VILLA", "CHIESA",
    "QUARTIERE", "ARCO", "PARCO", "BOSCO", "COLLE", "CASTELLO", "TEATRO",
    "MUSEO", "SCUOLA", "CENTRO", "NUCLEO", "PINETA", "BELVEDERE", "MURA",
    "DEPURATORE", "PARCHEGGIO", "ORFANOTROFIO", "CONVENTO", "SANTUARIO",
}


def normalizza(valore):
    """Identica a normalizeText() in app.js: se le due divergono, lo script
    ragiona su chiavi che il motore di ricerca non vedrà mai."""
    valore = unicodedata.normalize("NFD", valore)
    valore = "".join(c for c in valore if not unicodedata.combining(c))
    return re.sub(r"[^A-Z0-9]+", " ", valore.upper()).strip()


def ripulisci_testo(valore):
    """Spazi normalizzati e punteggiatura penzolante via: l'estrazione dal PDF
    produce code tipo «Strada Comunale Mazzaforte -»."""
    return re.sub(r"\s+", " ", valore).strip().strip("-–—,;:").strip()


def tag_utile(tag):
    """Scarta i tag che non possono funzionare, non quelli che non ci piacciono.

    Due casi, entrambi dimostrabili leggendo scoreStreet() in app.js:
    * meno di due caratteri utili — la ricerca rifiuta le query più corte di 2,
      e come token restano comunque inerti («S», «A» nati spezzando «S. Pietro»);
    * composti solo di parole generiche — il motore le toglie dalla query, che
      resta vuota e vale 0 («Via», «Contrada», «Piazza» da soli).

    Parole come «Cortile», «Chiesa» o «Quartiere» invece funzionano davvero
    (elencano tutti i cortili, tutte le chiese) e restano dove l'utente le ha
    messe: non sta a questo script decidere che siano di troppo.
    """
    n = normalizza(tag)
    if len(n) < 2:
        return False
    return any(parola not in PAROLE_GENERICHE for parola in n.split(" "))


def normalizza_voce(voce):
    """Una voce ripulita: etichetta in ordine, tag deduplicati, 6 decimali."""
    label = ripulisci_testo(voce["label"])
    tags, visti = [], set()
    # L'etichetta è sempre il primo tag: è la corrispondenza più forte che il
    # motore possa trovare (punteggio 1200 sull'uguaglianza esatta).
    for tag in [label] + list(voce.get("tags") or []):
        tag = ripulisci_testo(str(tag))
        if not tag or not tag_utile(tag):
            continue
        chiave = normalizza(tag)
        if chiave in visti:
            continue
        visti.add(chiave)
        tags.append(tag)
    return {
        "label": label,
        "x": round(float(voce["x"]), 6),
        "tags": tags,
        "y": round(float(voce["y"]), 6),
    }


def chiavi(voce):
    return {normalizza(t) for t in voce["tags"]} | {normalizza(voce["label"])}


def distanza(a, b):
    return math.dist((a["x"], a["y"]), (b["x"], b["y"]))


def e_frammento(corta, lunga):
    """«Via Antonino» è un troncamento di «Via Antonino Mucaria».

    Il PDF taglia i nomi sugli a capo, quindi il pezzo superstite è sempre un
    prefisso del nome vero, sui confini di parola — «VIA ANTON» non conta.
    """
    a, b = normalizza(corta), normalizza(lunga)
    return a != b and b.startswith(a + " ")


def tipo(label):
    """Che genere di posto è, leggendo la prima parola dell'etichetta.

    L'estrazione dal PDF abbrevia, e le abbreviazioni vanno sciolte prima di
    confrontare: «C.LE AMARI» è un cortile, «c/da FRANCO» una contrada.
    Restituisce None quando la prima parola non dice il tipo (nomi propri come
    «Museo» a sé stante, o «Dottor Biagio Gallo»): in quel caso il confronto
    per tipo non si applica e decide la sola distanza.
    """
    n = normalizza(label)
    if n.startswith("C LE "):
        return "CORTILE"
    if n.startswith("C DA "):
        return "CONTRADA"
    prima = n.split(" ")[0] if n else ""
    if prima == "EX":                      # «Ex Convento di San Francesco»
        resto = n.split(" ")[1:2]
        prima = resto[0] if resto else ""
    return prima if prima in TIPI else None


def tipi_compatibili(a, b):
    """Due tipi diversi e riconosciuti significano due posti diversi. Se anche
    uno solo dei due è ignoto non si può dire nulla, e non si blocca niente."""
    ta, tb = tipo(a["label"]), tipo(b["label"])
    return ta is None or tb is None or ta == tb


def collassa_doppioni_interni(voci):
    """Fonde le voci che stanno nello stesso identico punto.

    L'estrazione emette «c/da FRANCO» e «Contrada Franco» con le stesse
    coordinate al sesto decimale. Sopravvive l'etichetta più lunga (quella per
    esteso, più leggibile) con l'unione dei tag.
    """
    per_punto, ordine = {}, []
    for voce in voci:
        punto = (voce["x"], voce["y"])
        if punto not in per_punto:
            per_punto[punto] = voce
            ordine.append(punto)
            continue
        tenuta = per_punto[punto]
        vincente, perdente = (
            (voce, tenuta) if len(voce["label"]) > len(tenuta["label"]) else (tenuta, voce)
        )
        unione = dict(vincente)
        visti = {normalizza(t) for t in vincente["tags"]}
        unione["tags"] = vincente["tags"] + [
            t for t in perdente["tags"] if normalizza(t) not in visti
        ]
        per_punto[punto] = unione
    return [per_punto[p] for p in ordine]


def unisci(automatiche, manuali):
    """I punti curati vincono; l'estrazione sopravvive dove aggiunge posti.

    Quattro esiti per ogni voce automatica:

    * **scartata** — c'è un punto curato per lo stesso posto: doppione, e il
      nome curato è migliore. Vale sia quando i due spilli coincidono
      (SOGLIA_STESSO_PIN, qualunque cosa dicano le etichette) sia quando sono
      vicini e i nomi si somigliano (SOGLIA_STESSO_POSTO);
    * **riqualificata** — stessa via, punto diverso: tiene le sue coordinate e
      adotta etichetta e tag curati, così tutte le occorrenze si presentano
      con lo stesso nome nella lista dei risultati;
    * **da decidere** — il nome è imparentato ma il punto è troppo lontano
      (o il tipo non torna): entra nell'indice com'è e finisce nel rapporto,
      perché è esattamente il genere di cosa che deve guardare una persona;
    * **solo PDF** — posto che i lotti manuali non coprono ancora.
    """
    unite = list(manuali)
    rapporto = {"scartate": [], "riqualificate": [], "da_decidere": [],
                "tipo_diverso": [], "solo_pdf": []}

    for auto in automatiche:
        chiavi_auto = chiavi(auto)

        # Uno spillo curato nello stesso identico punto batte qualsiasi
        # ragionamento sui nomi: è la stessa cosa, scritta meglio.
        stesso_pin = [
            (distanza(auto, m), m) for m in manuali
            if distanza(auto, m) < SOGLIA_STESSO_PIN
        ]
        if stesso_pin:
            dist, migliore = min(stesso_pin, key=lambda c: c[0])
            rapporto["scartate"].append((auto, migliore, dist))
            continue

        imparentati = [
            (distanza(auto, m), m) for m in manuali
            if (chiavi_auto & chiavi(m) or e_frammento(auto["label"], m["label"]))
            and tipi_compatibili(auto, m)
        ]
        if not imparentati:
            # Prima di dichiararla nuova: c'è un punto curato lì accanto che il
            # controllo di tipo ha tenuto separato? «Via Padre Pio» e «Villa
            # Padre Pio» a 0.008 sono quasi certamente la stessa cosa, ma a
            # deciderlo dev'essere una persona che conosce il posto.
            vicini_altro_tipo = [
                (distanza(auto, m), m) for m in manuali
                if distanza(auto, m) < SOGLIA_STESSO_POSTO
                and (chiavi_auto & chiavi(m) or e_frammento(auto["label"], m["label"]))
            ]
            if vicini_altro_tipo:
                dist, migliore = min(vicini_altro_tipo, key=lambda c: c[0])
                rapporto["tipo_diverso"].append((auto, migliore, dist))
            else:
                rapporto["solo_pdf"].append(auto)
            unite.append(auto)
            continue

        dist, migliore = min(imparentati, key=lambda c: c[0])

        if dist < SOGLIA_STESSO_POSTO:
            rapporto["scartate"].append((auto, migliore, dist))
            continue

        if dist > SOGLIA_STESSA_VIA or e_frammento(auto["label"], migliore["label"]):
            # Troppo lontano per essere lo stesso posto, e un'etichetta mozza
            # non dice a quale via appartenga. Resta com'è, segnalata.
            rapporto["da_decidere"].append((auto, migliore, dist))
            unite.append(auto)
            continue

        riqualificata = {
            "label": migliore["label"],
            "x": auto["x"],
            "tags": list(migliore["tags"]),
            "y": auto["y"],
        }
        rapporto["riqualificate"].append((auto, migliore, dist))
        unite.append(riqualificata)

    return unite, rapporto


def quasi_omonimi(rimaste, manuali, somiglianza_minima=0.85, distanza_massima=0.05):
    """Nomi che si somigliano ma non combaciano, su punti vicini.

    «Via Acquanuova» del PDF e «Via Acquanova» curata distano 0.018 e cambiano
    per una lettera: quasi certamente la stessa via scritta in due modi. Troppo
    incerto per fondere da solo — la somiglianza fra stringhe non sa niente di
    toponomastica — quindi esce soltanto nel rapporto.
    """
    import difflib
    trovati = []
    for auto in rimaste:
        for man in manuali:
            d = distanza(auto, man)
            if d > distanza_massima:
                continue
            r = difflib.SequenceMatcher(
                None, normalizza(auto["label"]), normalizza(man["label"])
            ).ratio()
            if r >= somiglianza_minima:
                trovati.append((auto, man, d, r))
    return trovati


def scrivi_json(percorso, dati):
    """Stessa formattazione del file esistente: una voce per blocco, i tag su
    una riga sola. Un JSON riformattato daccapo produrrebbe un diff illeggibile."""
    voci = ",\n".join(
        "    {\n"
        f'      "label": {json.dumps(v["label"], ensure_ascii=False)},\n'
        f'      "x": {v["x"]},\n'
        f'      "tags": [{",".join(json.dumps(t, ensure_ascii=False) for t in v["tags"])}],\n'
        f'      "y": {v["y"]}\n'
        "    }"
        for v in dati["streets"]
    )
    testo = (
        "{\n"
        f'  "source": {json.dumps(dati["source"], ensure_ascii=False)},\n'
        f'  "pageWidth": {dati["pageWidth"]},\n'
        f'  "pageHeight": {dati["pageHeight"]},\n'
        '  "streets": [\n' + voci + "\n  ]\n"
        "}\n"
    )
    percorso.write_text(testo, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true",
                        help="stampa il rapporto senza riscrivere l'indice")
    args = parser.parse_args()

    if not ESTRAZIONE.exists():
        sys.exit(f"Manca {ESTRAZIONE.relative_to(RADICE)}: è l'estrazione "
                 "originale dal PDF e serve come sorgente.")
    lotti = sorted(SORGENTI.glob("lotto-*.json"))
    if not lotti:
        sys.exit(f"Nessun lotto in {SORGENTI.relative_to(RADICE)}/: "
                 "salva l'export dell'app come lotto-NN.json.")
    print("sorgenti:", ", ".join(p.name for p in [ESTRAZIONE] + lotti), "\n")

    indice = json.loads(ESTRAZIONE.read_text(encoding="utf-8"))
    automatiche = collassa_doppioni_interni(
        [normalizza_voce(v) for v in indice["streets"]]
    )

    manuali, doppi_fra_lotti = [], []
    for lotto in lotti:
        for voce in json.loads(lotto.read_text(encoding="utf-8"))["streets"]:
            voce = normalizza_voce(voce)
            gemella = next(
                (m for m in manuali
                 if normalizza(m["label"]) == normalizza(voce["label"])), None
            )
            if gemella:
                doppi_fra_lotti.append((voce, gemella, distanza(voce, gemella)))
                continue
            manuali.append(voce)

    unite, rapporto = unisci(automatiche, manuali)

    print(f"estrazione PDF   {len(indice['streets']):4d} voci"
          f"  →  {len(automatiche)} dopo il collasso dei doppioni interni")
    print(f"lotti manuali    {len(manuali):4d} voci curate")
    if doppi_fra_lotti:
        print(f"  ⚠ {len(doppi_fra_lotti)} già presenti in un lotto precedente, ignorate:")
        for v, g, d in doppi_fra_lotti:
            print(f"     «{v['label']}» (distanza dal gemello {d:.4f})")
    print()
    print(f"scartate         {len(rapporto['scartate']):4d} voci PDF sostituite da un punto curato")
    print(f"riqualificate    {len(rapporto['riqualificate']):4d} altri tratti della stessa via, rinominati")
    print(f"da decidere      {len(rapporto['da_decidere']):4d} abbinamenti dubbi, lasciati com'erano")
    print(f"tipo diverso     {len(rapporto['tipo_diverso']):4d} vicine a un punto curato ma di altro genere")
    print(f"solo PDF         {len(rapporto['solo_pdf']):4d} posti che i lotti non coprono")
    print(f"→ indice finale  {len(unite):4d} voci")

    print("\n--- riqualificate (coordinate del PDF, nome curato) ---")
    for auto, man, d in sorted(rapporto["riqualificate"], key=lambda r: -r[2]):
        print(f"  {d:.4f}  «{auto['label']}»  →  «{man['label']}»")

    print("\n--- DA DECIDERE: nome imparentato ma punto lontano ---")
    for auto, man, d in sorted(rapporto["da_decidere"], key=lambda r: -r[2]):
        print(f"  {d:.4f}  «{auto['label']}»  x={auto['x']} y={auto['y']}"
              f"   somiglia a «{man['label']}»")

    print("\n--- vicine a un punto curato, ma di tipo diverso ---")
    for auto, man, d in sorted(rapporto["tipo_diverso"], key=lambda r: r[2]):
        print(f"  {d:.4f}  «{auto['label']}»   accanto a «{man['label']}»")

    quasi = quasi_omonimi(rapporto["solo_pdf"], manuali)
    print("\n--- possibili varianti di grafia (solo segnalazione) ---")
    for auto, man, d, somiglianza in sorted(quasi, key=lambda r: -r[3]):
        print(f"  {somiglianza:.0%} simili, distanti {d:.4f}"
              f"   «{auto['label']}»  ~  «{man['label']}»")

    print("\n--- solo PDF: etichette ancora da curare ---")
    for voce in sorted(rapporto["solo_pdf"], key=lambda v: normalizza(v["label"])):
        print(f"  «{voce['label']}»  x={voce['x']} y={voce['y']}")

    if args.dry_run:
        print("\n(--dry-run: nessun file scritto)")
        return

    indice["streets"] = unite
    indice["source"] = "map-placeholder.pdf + punti raccolti a mano"
    scrivi_json(INDICE, indice)
    print(f"\nScritto {INDICE.relative_to(RADICE)}")


if __name__ == "__main__":
    main()
