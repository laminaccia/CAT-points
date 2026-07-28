# Mappa Squadra — istruzioni per Claude

Le regole del progetto sono condivise con Codex e stanno in un unico file,
importato qui sotto. **Le modifiche alle regole vanno scritte in `AGENTS.md`,
non in questo file**, altrimenti Codex non le vede.

@AGENTS.md

---

## Specifico dell'harness Claude Code

**Non avviare mai il server con Bash.** Usare `preview_start` con
`{name: "mappa-squadra"}`. La configurazione è nel `launch.json` della
directory di lavoro **primaria** (`caccia_site_v32/.claude/launch.json`) —
`preview_start` legge quella, non il `launch.json` di questo progetto — e serve
questa cartella sulla **porta 8010** via `--directory`, per non collidere con
il sito archivio che occupa la 8000.

`javascript_tool` gira in contesto non-module e non-async: il `await` top-level
fallisce. Avvolgere sempre in una IIFE asincrona:
`(async () => { ... })();`

**Verificare nel browser, non delegare all'utente.** Dopo una modifica
visibile: ricaricare, controllare console e rete, e chiudere con uno
screenshot come prova. Per l'app conviene `resize_window` con preset `mobile`
(375×812): è un'app da telefono, provarla a larghezza desktop non dimostra
niente.

**Attenzione al service worker durante le verifiche.** Resta attivo tra un
ricaricamento e l'altro e serve i file dalla cache: se una modifica sembra non
avere effetto, controllare il `?v=N` e il nome di `CACHE` (vedi §5 di
`AGENTS.md`) prima di cercare il problema nel codice.
