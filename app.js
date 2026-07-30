(() => {
  const stage = document.getElementById('mapStage');
  const viewport = document.getElementById('mapViewport');
  const image = document.getElementById('mapImage');
  const marker = document.getElementById('marker');
  const markerLabel = document.getElementById('markerLabel');
  const markerHistoryLabelVisual = document.getElementById('markerHistoryLabelVisual');
  const crosshair = document.getElementById('crosshair');
  const coordinatePanel = document.getElementById('coordinatePanel');
  const toggleCoordinatesButton = document.getElementById('toggleCoordinatesButton');
  const coordinateLabel = document.getElementById('coordinateLabel');
  const crosshairCoordinates = document.getElementById('crosshairCoordinates');
  const geographicCoordinates = document.getElementById('geographicCoordinates');
  const copyCoordinatesButton = document.getElementById('copyCoordinatesButton');
  const addStreetPointButton = document.getElementById('addStreetPointButton');
  const openStreetPointListButton = document.getElementById('openStreetPointListButton');
  const streetPointCount = document.getElementById('streetPointCount');
  const streetPointDialog = document.getElementById('streetPointDialog');
  const streetPointForm = document.getElementById('streetPointForm');
  const streetPointLabelInput = document.getElementById('streetPointLabel');
  const streetPointTagsInput = document.getElementById('streetPointTags');
  const streetPointCoordinates = document.getElementById('streetPointCoordinates');
  const streetPointConfirmPanel = document.getElementById('streetPointConfirmPanel');
  const streetPointConfirmSummary = document.getElementById('streetPointConfirmSummary');
  const streetListDialog = document.getElementById('streetListDialog');
  const streetListItems = document.getElementById('streetListItems');
  const copyStreetListButton = document.getElementById('copyStreetListButton');
  const downloadStreetListButton = document.getElementById('downloadStreetListButton');
  const statusPill = document.getElementById('statusPill');
  const searchForm = document.getElementById('searchForm');
  const streetSearch = document.getElementById('streetSearch');
  const searchButton = document.getElementById('searchButton');
  const historyButton = document.getElementById('historyButton');
  const historyCount = document.getElementById('historyCount');
  const markerHistoryDialog = document.getElementById('markerHistoryDialog');
  const markerHistoryList = document.getElementById('markerHistoryList');
  const markerHistoryDescription = document.getElementById('markerHistoryDescription');
  const closeMarkerHistoryButton = document.getElementById('closeMarkerHistoryButton');
  const exportMarkerHistoryButton = document.getElementById('exportMarkerHistoryButton');
  const markerHistorySourceSelect = document.getElementById('markerHistorySourceSelect');
  const markerHistoryImportFeedback = document.getElementById('markerHistoryImportFeedback');
  const markerHistoryFooterActions = document.getElementById('markerHistoryFooterActions');
  const importMarkerHistoryButton = document.getElementById('importMarkerHistoryButton');
  const importMarkerHistoryInput = document.getElementById('importMarkerHistoryInput');
  const removeImportedMarkerHistoryButton = document.getElementById('removeImportedMarkerHistoryButton');
  const searchFeedback = document.getElementById('searchFeedback');
  const searchResults = document.getElementById('searchResults');
  const mainControlsRow = document.getElementById('mainControlsRow');
  const confirmRow = document.getElementById('confirmRow');
  const markerDialog = document.getElementById('markerDialog');
  const markerTextInput = document.getElementById('markerText');
  const markerHistoryLabelInput = document.getElementById('markerHistoryLabelInput');
  const cancelMarkerButton = document.getElementById('cancelMarkerButton');
  const editMarkerButton = document.getElementById('editMarkerButton');
  const primaryColorSelect = document.getElementById('primaryColorSelect');
  const secondaryColorSelect = document.getElementById('secondaryColorSelect');
  const colorNameBox = document.getElementById('colorNameBox');
  const colorNameLabel = document.getElementById('colorNameLabel');
  const colorNameForm = document.getElementById('colorNameForm');
  const markerColorInput = document.getElementById('markerColorInput');
  const colorNamePreview = document.getElementById('colorNamePreview');
  const colorNameFeedback = document.getElementById('colorNameFeedback');
  const playerNameButton = document.getElementById('playerNameButton');
  const identityDialog = document.getElementById('identityDialog');
  const identityForm = document.getElementById('identityForm');
  const playerNameInput = document.getElementById('playerNameInput');
  const identityFeedback = document.getElementById('identityFeedback');
  const cancelIdentityButton = document.getElementById('cancelIdentityButton');
  const exportCanvas = document.getElementById('exportCanvas');
  const fixedPointColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d9b45b';
  const defaultMarkerColor = fixedPointColor;
  const manualStreetStorageKey = 'mappa-manual-streets';
  const markerHistoryStorageKey = 'mappa-marker-history-v1';
  const markerHistorySourcesStorageKey = 'mappa-marker-history-sources-v1';
  const markerHistoryLimit = 100;
  const markerHistoryFormat = 'cat-points.marker-history';
  const markerHistoryFormatVersion = 3;
  const catPointsSiteUrl = 'https://laminaccia.github.io/CAT-points/';
  // La scansione non contiene metadati geografici. Questa trasformazione
  // affine WGS84 è stata calibrata su sei riferimenti riconoscibili sia nella
  // carta sia in OpenStreetMap; mantiene x/y come coordinate autorevoli per
  // la ricerca e aggiunge una posizione reale indicativa, con scarti rilevati
  // nell'ordine di 20 metri sui punti usati per il controllo.
  const geographicCalibration = {
    latitude: [37.92057130985965, 0.000258450654538076, -0.014228378541362083],
    longitude: [12.849077256251567, 0.025174821053030778, 0.00012416415904424602]
  };
  const italianColorAliases = new Map(Object.entries({
    bianco: '#ffffff',
    nero: '#17191f',
    rosso: '#e53935',
    verde: '#43a047',
    giallo: '#fdd835',
    blu: '#1e88e5',
    viola: '#8e44ad',
    azzurro: '#29b6f6',
    celeste: '#81d4fa',
    arancione: '#fb8c00',
    marrone: '#795548',
    grigio: '#9e9e9e',
    oro: '#d9b45b',
    argento: '#c0c0c0',
    bronzo: '#cd7f32',
    rosa: '#ec4899',
    fucsia: '#d81b60',
    magenta: '#ff00ff',
    ciano: '#00bcd4',
    turchese: '#26a69a',
    beige: '#d7ccc8',
    bordeaux: '#800020',
    lime: '#cddc39',
    corallo: '#ff7043',
    salmone: '#fa8072',
    indaco: '#3f51b5',
    lavanda: '#b39ddb',
    ocra: '#c99700',
    panna: '#fff3d4',
    'verde acqua': '#26a69a',
    'blu notte': '#0d1b3d',
    'blu elettrico': '#0066ff',
    'rosa antico': '#d58c9d',
    'verde oliva': '#808000',
    'verde smeraldo': '#2e8b57',
    'grigio perla': '#c7c9c7',
    'grigio antracite': '#36454f',
    'testa di moro': '#4b2e20',
    'terra di siena': '#a0522d',
    'rosso mattone': '#b55239',
    'giallo ocra': '#c99700',
    trasparente: 'none',
    nessuno: 'none',
    'senza colore': 'none'
  }));
  const genericSearchWords = new Set(['VIA', 'VIALE', 'CONTRADA', 'CORSO', 'PIAZZA', 'STRADA', 'C', 'CDA', 'DA', 'LE', 'AVV', 'DOTTOR', 'SS', 'SP']);
  let incrementalSearchTimer = 0;
  let pendingStreetPoint = null;
  let markerDialogSnapshot = null;
  let markerHistoryStore = {};
  let markerHistorySources = {};
  let markerHistoryViewKey = '';
  let activeHistoryEntryId = null;
  let activeHistoryLabel = '';
  let activeHistoryCreatedAt = null;
  let activeMarkerOwner = '';
  let customColorTarget = 'primary';

  document.body.append(streetPointDialog, streetListDialog, markerHistoryDialog);

  const state = {
    scale: 1,
    minScale: 1,
    maxScale: 6,
    x: 0,
    y: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    pinchDistance: 0,
    markerPlaced: false,
    markerColors: [defaultMarkerColor],
    markerText: '',
    streetIndex: [],
    manualStreetPoints: [],
    playerName: '',
    coordinateToolsVisible: false
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function normalizeText(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  }

  function normalizeColorName(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function markerHistoryPlayerKey(value = state.playerName) {
    return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('it-IT');
  }

  function normalizeHistoryLabel(value) {
    return String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 40);
  }

  function normalizeParticipantName(value) {
    return String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 50);
  }

  function createLocalId(prefix) {
    const randomId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${randomId}`;
  }

  function normalizeIsoDate(value, fallback = new Date().toISOString()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
  }

  function loadMarkerHistoryStore() {
    try {
      const savedStore = JSON.parse(localStorage.getItem(markerHistoryStorageKey) || '{}');
      markerHistoryStore = savedStore && typeof savedStore === 'object' && !Array.isArray(savedStore)
        ? savedStore
        : {};
    } catch (error) {
      markerHistoryStore = {};
    }
  }

  function persistMarkerHistoryStore() {
    try {
      localStorage.setItem(markerHistoryStorageKey, JSON.stringify(markerHistoryStore));
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadMarkerHistorySources() {
    try {
      const savedSources = JSON.parse(localStorage.getItem(markerHistorySourcesStorageKey) || '{}');
      markerHistorySources = savedSources && typeof savedSources === 'object' && !Array.isArray(savedSources)
        ? savedSources
        : {};
    } catch (error) {
      markerHistorySources = {};
    }
  }

  function persistMarkerHistorySources() {
    try {
      localStorage.setItem(markerHistorySourcesStorageKey, JSON.stringify(markerHistorySources));
      return true;
    } catch (error) {
      return false;
    }
  }

  function ensureLocalMarkerHistorySource() {
    const playerKey = markerHistoryPlayerKey();
    if (!playerKey) return null;
    const existing = markerHistorySources[playerKey];
    const ownerName = normalizeParticipantName(state.playerName);
    if (existing?.type === 'local') {
      if (existing.ownerName !== ownerName) {
        existing.ownerName = ownerName;
        persistMarkerHistorySources();
      }
      return existing;
    }
    const existingEntries = Array.isArray(markerHistoryStore[playerKey]) ? markerHistoryStore[playerKey] : [];
    const source = {
      type: 'local',
      listId: createLocalId('lista'),
      ownerName,
      createdAt: normalizeIsoDate(existingEntries[existingEntries.length - 1]?.createdAt)
    };
    markerHistorySources[playerKey] = source;
    persistMarkerHistorySources();
    return source;
  }

  function getCurrentMarkerHistory() {
    const playerKey = markerHistoryPlayerKey();
    return Array.isArray(markerHistoryStore[playerKey]) ? markerHistoryStore[playerKey] : [];
  }

  function getVisibleMarkerHistorySource() {
    const localKey = markerHistoryPlayerKey();
    const selectedKey = markerHistoryViewKey && markerHistorySources[markerHistoryViewKey]
      ? markerHistoryViewKey
      : localKey;
    const source = selectedKey === localKey
      ? ensureLocalMarkerHistorySource()
      : markerHistorySources[selectedKey];
    return {
      key: selectedKey,
      type: source?.type === 'imported' ? 'imported' : 'local',
      listId: source?.listId || createLocalId('lista'),
      ownerName: normalizeParticipantName(source?.ownerName || state.playerName),
      sharedBy: normalizeParticipantName(source?.sharedBy),
      sharingChain: Array.isArray(source?.sharingChain) ? source.sharingChain : [],
      createdAt: source?.createdAt || null,
      exportedAt: source?.exportedAt || null,
      importedAt: source?.importedAt || null,
      sourceUrl: source?.sourceUrl || catPointsSiteUrl,
      entries: Array.isArray(markerHistoryStore[selectedKey]) ? markerHistoryStore[selectedKey] : []
    };
  }

  function updateMarkerHistoryCount() {
    const count = state.playerName ? getCurrentMarkerHistory().length : 0;
    historyCount.textContent = count > 99 ? '99+' : String(count);
    historyButton.setAttribute('aria-label', `Apri cronologia punti, ${count} salvati`);
  }

  function formatMarkerHistoryTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data non disponibile';
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function createHistoryMarkerSwatch(colors) {
    const swatch = document.createElement('span');
    swatch.className = 'history-marker-swatch';
    if (!colors.length) {
      swatch.classList.add('no-color');
      return swatch;
    }
    const background = colors.length === 2
      ? `linear-gradient(90deg, ${colors[0]} 0 50%, ${colors[1]} 50% 100%)`
      : colors[0];
    swatch.style.setProperty('--history-background', background);
    return swatch;
  }

  function closeMarkerHistory() {
    markerHistoryDialog.classList.add('hidden');
  }

  function restoreMarkerHistoryEntry(entry, source = getVisibleMarkerHistorySource()) {
    const x = Number(entry.x);
    const y = Number(entry.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    state.markerColors = Array.isArray(entry.colors) ? [...entry.colors].slice(0, 2) : [defaultMarkerColor];
    state.markerText = typeof entry.text === 'string' ? entry.text.slice(0, 12) : '';
    activeHistoryEntryId = source.type === 'imported' ? null : entry.id;
    activeHistoryLabel = normalizeHistoryLabel(entry.label);
    activeHistoryCreatedAt = entry.createdAt || entry.updatedAt || null;
    activeMarkerOwner = normalizeParticipantName(source.ownerName || state.playerName);
    zoomToMapPoint(x, y);
    state.markerPlaced = true;
    setMarkerVisual();
    marker.classList.remove('hidden');
    crosshair.classList.add('hidden');
    mainControlsRow.classList.add('hidden');
    confirmRow.classList.remove('hidden');
    closeMarkerHistory();
    updateCrosshairCoordinates();
    const restoredName = activeHistoryLabel || state.markerText;
    const sourceLabel = source.type === 'imported' ? `Importato da ${activeMarkerOwner}` : 'Punto ripristinato';
    setStatus(restoredName ? `${sourceLabel} • ${restoredName}` : sourceLabel);
  }

  function deleteMarkerHistoryEntry(entryId) {
    const playerKey = markerHistoryPlayerKey();
    markerHistoryStore[playerKey] = getCurrentMarkerHistory().filter((entry) => entry.id !== entryId);
    if (activeHistoryEntryId === entryId) {
      activeHistoryEntryId = null;
      activeHistoryLabel = '';
      activeHistoryCreatedAt = null;
    }
    const persisted = persistMarkerHistoryStore();
    updateMarkerHistoryCount();
    renderMarkerHistory();
    setStatus(persisted ? 'Punto eliminato dalla cronologia' : 'Eliminato solo per questa sessione');
  }

  function updateMarkerHistoryLabel(entryId, value) {
    const playerKey = markerHistoryPlayerKey();
    const entries = getCurrentMarkerHistory();
    const entry = entries.find((historyEntry) => historyEntry.id === entryId);
    if (!entry) return;
    entry.label = normalizeHistoryLabel(value);
    entry.labelUpdatedAt = new Date().toISOString();
    markerHistoryStore[playerKey] = entries;
    if (activeHistoryEntryId === entryId) {
      activeHistoryLabel = entry.label;
      setMarkerVisual();
    }
    const persisted = persistMarkerHistoryStore();
    renderMarkerHistory();
    closeMarkerHistoryButton.focus({ preventScroll: true });
    const action = entry.label ? 'Etichetta salvata' : 'Etichetta rimossa';
    setStatus(persisted ? action : `${action} solo per questa sessione`);
  }

  function moveMarkerHistoryEntry(entryId, offset) {
    const playerKey = markerHistoryPlayerKey();
    const entries = [...getCurrentMarkerHistory()];
    const currentIndex = entries.findIndex((entry) => entry.id === entryId);
    const targetIndex = currentIndex + offset;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= entries.length) return;
    [entries[currentIndex], entries[targetIndex]] = [entries[targetIndex], entries[currentIndex]];
    markerHistoryStore[playerKey] = entries;
    const persisted = persistMarkerHistoryStore();
    renderMarkerHistory();
    setStatus(persisted ? 'Ordine cronologia aggiornato' : 'Ordine valido solo per questa sessione');
  }

  function openMarkerHistoryLabelEditor(item, actions, entry, triggerButton) {
    actions.classList.add('hidden');
    const form = document.createElement('form');
    form.className = 'marker-history-label-form';
    const label = document.createElement('label');
    label.className = 'sr-only';
    label.textContent = 'Etichetta del punto';
    const input = document.createElement('input');
    input.id = `marker-history-label-${entry.id}`;
    input.type = 'text';
    input.maxLength = 40;
    input.autocomplete = 'off';
    input.placeholder = 'Es. Tappa 3 o Piazza';
    input.value = normalizeHistoryLabel(entry.label);
    label.htmlFor = input.id;
    const controls = document.createElement('div');
    controls.className = 'marker-history-label-actions';
    const cancelButton = document.createElement('button');
    cancelButton.className = 'secondary-wide';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Annulla';
    const saveButton = document.createElement('button');
    saveButton.className = 'primary-button';
    saveButton.type = 'submit';
    saveButton.textContent = 'Salva etichetta';
    controls.append(cancelButton, saveButton);
    form.append(label, input, controls);
    item.append(form);

    cancelButton.addEventListener('click', () => {
      form.remove();
      actions.classList.remove('hidden');
      triggerButton.focus({ preventScroll: true });
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      updateMarkerHistoryLabel(entry.id, input.value);
    });
    input.focus({ preventScroll: true });
    input.select();
  }

  function renderMarkerHistorySourceOptions(activeSource) {
    markerHistorySourceSelect.replaceChildren();
    const localSource = ensureLocalMarkerHistorySource();
    const localKey = markerHistoryPlayerKey();
    const localOption = document.createElement('option');
    localOption.value = localKey;
    localOption.textContent = `La mia lista · ${localSource?.ownerName || state.playerName}`;
    markerHistorySourceSelect.append(localOption);

    Object.entries(markerHistorySources)
      .filter(([sourceKey, source]) => sourceKey !== localKey
        && source?.type === 'imported'
        && Array.isArray(markerHistoryStore[sourceKey]))
      .sort(([, first], [, second]) => String(second.importedAt || '').localeCompare(String(first.importedAt || '')))
      .forEach(([sourceKey, source]) => {
        const option = document.createElement('option');
        option.value = sourceKey;
        const count = markerHistoryStore[sourceKey].length;
        option.textContent = `Importata · ${source.ownerName || 'Senza autore'} (${count})`;
        markerHistorySourceSelect.append(option);
      });

    markerHistorySourceSelect.value = activeSource.key;
  }

  function renderMarkerHistory() {
    markerHistoryList.replaceChildren();
    const source = getVisibleMarkerHistorySource();
    const isImported = source.type === 'imported';
    renderMarkerHistorySourceOptions(source);
    markerHistoryFooterActions.classList.toggle('local-view', !isImported);
    removeImportedMarkerHistoryButton.classList.toggle('hidden', !isImported);
    exportMarkerHistoryButton.textContent = isImported
      ? `Condividi lista di ${source.ownerName}`
      : 'Condividi questa lista';
    markerHistoryDescription.textContent = isImported
      ? `Lista di ${source.ownerName}, condivisa da ${source.sharedBy || source.ownerName}. È conservata in sola lettura per non perderne l’attribuzione.`
      : `Cronologia di ${state.playerName}: riordina, rivedi o invia nuovamente i punti.`;
    const entries = source.entries;
    exportMarkerHistoryButton.disabled = entries.length === 0;
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'marker-history-empty';
      empty.textContent = isImported
        ? 'Questa lista importata non contiene punti validi.'
        : 'Nessun punto salvato. Il primo verrà aggiunto automaticamente quando confermi un punto.';
      markerHistoryList.append(empty);
      return;
    }
    entries.forEach((entry, index) => {
      const item = document.createElement('article');
      item.className = 'marker-history-item';
      item.append(createHistoryMarkerSwatch(Array.isArray(entry.colors) ? entry.colors : []));

      const copy = document.createElement('div');
      copy.className = 'marker-history-copy';
      const title = document.createElement('strong');
      const historyLabel = normalizeHistoryLabel(entry.label);
      title.textContent = historyLabel || entry.text || 'Punto senza etichetta';
      if (historyLabel && entry.text) {
        const markerText = document.createElement('span');
        markerText.textContent = `Testo punto: ${entry.text}`;
        copy.append(markerText);
      }
      const meta = document.createElement('small');
      const normalizedCoordinates = { x: Number(entry.x), y: Number(entry.y) };
      const realCoordinates = getGeographicCoordinates(normalizedCoordinates);
      meta.textContent = `${formatMarkerHistoryTime(entry.updatedAt || entry.createdAt)} · x ${normalizedCoordinates.x.toFixed(4)} · y ${normalizedCoordinates.y.toFixed(4)}`
        + (realCoordinates ? ` · ${realCoordinates.latitude.toFixed(5)}°, ${realCoordinates.longitude.toFixed(5)}° ≈` : '');
      copy.prepend(title);
      copy.append(meta);
      item.append(copy);

      if (!isImported) {
        const order = document.createElement('div');
        order.className = 'marker-history-order';
        const orderLabel = document.createElement('span');
        orderLabel.textContent = `Posizione ${index + 1} di ${entries.length}`;
        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'secondary-wide';
        moveUpButton.type = 'button';
        moveUpButton.textContent = 'Su';
        moveUpButton.disabled = index === 0;
        moveUpButton.setAttribute('aria-label', `Sposta ${historyLabel || entry.text || 'punto'} verso l'alto`);
        moveUpButton.addEventListener('click', () => moveMarkerHistoryEntry(entry.id, -1));
        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'secondary-wide';
        moveDownButton.type = 'button';
        moveDownButton.textContent = 'Giù';
        moveDownButton.disabled = index === entries.length - 1;
        moveDownButton.setAttribute('aria-label', `Sposta ${historyLabel || entry.text || 'punto'} verso il basso`);
        moveDownButton.addEventListener('click', () => moveMarkerHistoryEntry(entry.id, 1));
        order.append(orderLabel, moveUpButton, moveDownButton);
        item.append(order);
      }

      const actions = document.createElement('div');
      actions.className = 'marker-history-item-actions';
      const restoreButton = document.createElement('button');
      restoreButton.className = 'secondary-wide';
      restoreButton.type = 'button';
      restoreButton.textContent = 'Rivedi';
      restoreButton.addEventListener('click', () => restoreMarkerHistoryEntry(entry, source));
      const shareButton = document.createElement('button');
      shareButton.className = 'primary-button';
      shareButton.type = 'button';
      shareButton.textContent = 'Invia foto';
      shareButton.addEventListener('click', async () => {
        restoreMarkerHistoryEntry(entry, source);
        await shareCurrentMarker();
      });

      if (isImported) {
        const importedOrder = document.createElement('div');
        importedOrder.className = 'marker-history-imported-order';
        importedOrder.textContent = `Posizione ${index + 1} di ${entries.length} · autore ${source.ownerName}`;
        item.append(importedOrder);
        actions.append(restoreButton, shareButton);
        item.append(actions);
        markerHistoryList.append(item);
        return;
      }

      const labelButton = document.createElement('button');
      labelButton.className = 'secondary-wide';
      labelButton.type = 'button';
      labelButton.textContent = historyLabel ? 'Modifica etichetta' : 'Etichetta';
      labelButton.addEventListener('click', () => openMarkerHistoryLabelEditor(item, actions, entry, labelButton));
      const deleteButton = document.createElement('button');
      deleteButton.className = 'marker-history-delete';
      deleteButton.type = 'button';
      deleteButton.textContent = 'Elimina';
      deleteButton.addEventListener('click', () => deleteMarkerHistoryEntry(entry.id));
      actions.append(restoreButton, shareButton, labelButton, deleteButton);
      item.append(actions);
      markerHistoryList.append(item);
    });
  }

  function buildMarkerHistoryExport() {
    const source = getVisibleMarkerHistorySource();
    const sharedAt = new Date().toISOString();
    const sharedBy = normalizeParticipantName(state.playerName) || source.ownerName;
    const previousSharingChain = source.sharingChain
      .map((event) => ({
        name: normalizeParticipantName(event?.name),
        at: normalizeIsoDate(event?.at, '')
      }))
      .filter((event) => event.name && event.at);
    const sharingChain = [...previousSharingChain, { name: sharedBy, at: sharedAt }].slice(-20);
    return {
      format: markerHistoryFormat,
      version: markerHistoryFormatVersion,
      app: {
        id: 'cat-points',
        name: 'CAT-points',
        url: catPointsSiteUrl,
        importInstructions: 'Apri CAT-points, entra nella Cronologia punti e usa “Importa lista JSON”.'
      },
      list: {
        id: source.listId,
        owner: {
          name: source.ownerName
        },
        responsibility: `Questa lista completa resta attribuita a ${source.ownerName}.`,
        createdAt: source.createdAt || source.entries[source.entries.length - 1]?.createdAt || sharedAt,
        exportedAt: sharedAt,
        markers: source.entries.map((entry, index) => {
          const normalizedCoordinates = { x: Number(entry.x), y: Number(entry.y) };
          const realCoordinates = getGeographicCoordinates(normalizedCoordinates);
          return {
            id: entry.id,
            order: index + 1,
            label: normalizeHistoryLabel(entry.label),
            markerText: typeof entry.text === 'string' ? entry.text : '',
            colors: Array.isArray(entry.colors) ? entry.colors : [],
            x: normalizedCoordinates.x,
            y: normalizedCoordinates.y,
            latitude: realCoordinates ? Number(realCoordinates.latitude.toFixed(6)) : null,
            longitude: realCoordinates ? Number(realCoordinates.longitude.toFixed(6)) : null,
            createdAt: entry.createdAt || null,
            updatedAt: entry.updatedAt || null
          };
        })
      },
      sharing: {
        sharedBy: {
          name: sharedBy
        },
        sharedAt,
        chain: sharingChain
      },
      coordinateSystems: {
        normalized: 'x/y della mappa, intervallo 0–1',
        geographic: 'WGS84 (EPSG:4326), stima cartografica'
      }
    };
  }

  function buildMarkerHistoryShareText(payload) {
    const ownerName = payload.list.owner.name;
    const sharedBy = payload.sharing.sharedBy.name;
    return [
      `Lista CAT-points di ${ownerName}.`,
      `Condivisa da ${sharedBy}; l’attribuzione originale resta salvata nel file.`,
      `Per aprirla: ${catPointsSiteUrl} → Cronologia punti → Importa lista JSON.`
    ].join('\n');
  }

  async function exportAndShareMarkerHistory() {
    const payload = buildMarkerHistoryExport();
    if (!payload.list.markers.length) {
      setStatus('Nessun punto da esportare');
      return;
    }
    const json = JSON.stringify(payload, null, 2);
    const ownerName = payload.list.owner.name;
    const safeName = normalizeText(ownerName || 'partecipante').toLowerCase().replace(/\s+/g, '-');
    const fileName = `cat-points-${safeName}-${Date.now()}.catpoints.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const file = typeof File === 'function' ? new File([blob], fileName, { type: blob.type }) : null;
    const title = `Lista CAT-points di ${ownerName}`;
    setStatus('Preparazione cronologia…');
    exportMarkerHistoryButton.disabled = true;
    try {
      if (file && canShareFile(file)) {
        await navigator.share({ files: [file], title, text: buildMarkerHistoryShareText(payload) });
        setStatus(`Lista di ${ownerName} condivisa`);
      } else {
        downloadBlob(blob, fileName);
        setStatus('File CAT-points scaricato: può essere importato dal sito');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatus('Esportazione annullata');
      } else {
        downloadBlob(blob, fileName);
        setStatus('Condivisione non disponibile: file CAT-points scaricato');
      }
    } finally {
      exportMarkerHistoryButton.disabled = false;
    }
  }

  function sanitizeImportedMarker(entry, index) {
    const x = Number(entry?.x);
    const y = Number(entry?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null;
    const colors = (Array.isArray(entry.colors) ? entry.colors : [])
      .map((color) => resolveMarkerColor(String(color)))
      .filter((color) => color && color !== 'none')
      .slice(0, 2);
    const now = new Date().toISOString();
    return {
      id: String(entry.id || '').slice(0, 100) || createLocalId(`importato-${index + 1}`),
      x: Number(x.toFixed(6)),
      y: Number(y.toFixed(6)),
      colors,
      text: String(entry.markerText ?? entry.text ?? '').trim().slice(0, 12),
      label: normalizeHistoryLabel(entry.label),
      createdAt: normalizeIsoDate(entry.createdAt, now),
      updatedAt: normalizeIsoDate(entry.updatedAt || entry.createdAt, now)
    };
  }

  function parseMarkerHistoryPackage(payload) {
    const isCatPointsPackage = payload?.format === markerHistoryFormat
      && Number(payload.version) === markerHistoryFormatVersion
      && payload.app?.id === 'cat-points';
    const isLegacyExport = Number(payload?.version) === 2
      && typeof payload?.participant === 'string'
      && Array.isArray(payload?.markers);
    if (!isCatPointsPackage && !isLegacyExport) {
      throw new Error('Questo JSON non è una lista esportata da CAT-points.');
    }

    const ownerName = normalizeParticipantName(isCatPointsPackage
      ? payload.list?.owner?.name
      : payload.participant);
    if (!ownerName) throw new Error('Nel file manca il nome del responsabile della lista.');

    const rawMarkers = isCatPointsPackage ? payload.list?.markers : payload.markers;
    if (!Array.isArray(rawMarkers) || !rawMarkers.length) {
      throw new Error('La lista non contiene punti.');
    }
    const entries = rawMarkers
      .slice(0, markerHistoryLimit)
      .map(sanitizeImportedMarker)
      .filter(Boolean);
    if (!entries.length) throw new Error('La lista non contiene coordinate valide per questa mappa.');

    const exportedAt = normalizeIsoDate(
      isCatPointsPackage ? payload.list?.exportedAt || payload.sharing?.sharedAt : payload.exportedAt
    );
    const listId = String(isCatPointsPackage
      ? payload.list?.id || createLocalId('lista-importata')
      : `legacy-${markerHistoryPlayerKey(ownerName)}-${exportedAt}`).slice(0, 180);
    const sharedBy = normalizeParticipantName(isCatPointsPackage
      ? payload.sharing?.sharedBy?.name
      : ownerName) || ownerName;
    const sharingChain = isCatPointsPackage && Array.isArray(payload.sharing?.chain)
      ? payload.sharing.chain.map((event) => ({
        name: normalizeParticipantName(event?.name),
        at: normalizeIsoDate(event?.at, '')
      })).filter((event) => event.name && event.at).slice(-20)
      : [{ name: ownerName, at: exportedAt }];

    return {
      listId,
      ownerName,
      sharedBy,
      sharingChain,
      createdAt: normalizeIsoDate(isCatPointsPackage ? payload.list?.createdAt : entries[entries.length - 1]?.createdAt),
      exportedAt,
      sourceUrl: isCatPointsPackage && /^https:\/\//.test(payload.app?.url)
        ? payload.app.url
        : catPointsSiteUrl,
      entries
    };
  }

  async function importMarkerHistoryFile(file) {
    markerHistoryImportFeedback.classList.remove('error');
    markerHistoryImportFeedback.textContent = 'Controllo del file…';
    if (!file || file.size > 2_000_000) {
      throw new Error('Il file è troppo grande. Seleziona un JSON CAT-points sotto 2 MB.');
    }
    const payload = JSON.parse(await file.text());
    const imported = parseMarkerHistoryPackage(payload);
    const existingSource = Object.entries(markerHistorySources)
      .find(([, source]) => source?.type === 'imported' && source.listId === imported.listId);
    const sourceKey = existingSource?.[0] || createLocalId('import');
    const importedAt = new Date().toISOString();
    markerHistoryStore[sourceKey] = imported.entries;
    markerHistorySources[sourceKey] = {
      type: 'imported',
      listId: imported.listId,
      ownerName: imported.ownerName,
      sharedBy: imported.sharedBy,
      sharingChain: imported.sharingChain,
      createdAt: imported.createdAt,
      exportedAt: imported.exportedAt,
      importedAt,
      sourceUrl: imported.sourceUrl
    };
    const persisted = persistMarkerHistoryStore() && persistMarkerHistorySources();
    markerHistoryViewKey = sourceKey;
    renderMarkerHistory();
    const message = existingSource
      ? `Lista di ${imported.ownerName} aggiornata`
      : `Lista di ${imported.ownerName} importata`;
    markerHistoryImportFeedback.textContent = persisted
      ? `${message}. L’autore originale resta associato a tutti i punti.`
      : `${message} solo per questa sessione.`;
    setStatus(message);
  }

  function removeImportedMarkerHistory() {
    const source = getVisibleMarkerHistorySource();
    if (source.type !== 'imported') return;
    if (!window.confirm(`Rimuovere dal dispositivo la lista importata di ${source.ownerName}?`)) return;
    delete markerHistoryStore[source.key];
    delete markerHistorySources[source.key];
    const persisted = persistMarkerHistoryStore() && persistMarkerHistorySources();
    markerHistoryViewKey = '';
    renderMarkerHistory();
    markerHistoryImportFeedback.textContent = persisted
      ? `Lista importata di ${source.ownerName} rimossa.`
      : 'Lista rimossa solo per questa sessione.';
    setStatus('Lista importata rimossa');
  }

  function openMarkerHistory() {
    markerHistoryImportFeedback.classList.remove('error');
    markerHistoryImportFeedback.textContent = '';
    renderMarkerHistory();
    markerHistoryDialog.classList.remove('hidden');
    closeMarkerHistoryButton.focus({ preventScroll: true });
  }

  function saveCurrentMarkerToHistory() {
    const coordinates = getCrosshairCoordinates();
    const playerKey = markerHistoryPlayerKey();
    if (!coordinates || !playerKey) return true;
    const now = new Date().toISOString();
    const entries = getCurrentMarkerHistory();
    const existing = entries.find((entry) => entry.id === activeHistoryEntryId);
    const entry = {
      id: existing?.id || createLocalId('punto'),
      x: Number(coordinates.x.toFixed(6)),
      y: Number(coordinates.y.toFixed(6)),
      colors: [...state.markerColors],
      text: state.markerText,
      label: normalizeHistoryLabel(activeHistoryLabel),
      createdAt: existing?.createdAt || activeHistoryCreatedAt || now,
      updatedAt: now
    };
    activeHistoryEntryId = entry.id;
    activeHistoryLabel = entry.label;
    activeHistoryCreatedAt = entry.createdAt;
    markerHistoryStore[playerKey] = existing
      ? entries.map((historyEntry) => historyEntry.id === entry.id ? entry : historyEntry)
      : [entry, ...entries].slice(0, markerHistoryLimit);
    const persisted = persistMarkerHistoryStore();
    updateMarkerHistoryCount();
    return persisted;
  }

  function setPlayerName(value, persist = true) {
    const previousHistoryKey = markerHistoryPlayerKey(state.playerName);
    state.playerName = normalizeParticipantName(value);
    if (previousHistoryKey && previousHistoryKey !== markerHistoryPlayerKey()) {
      activeHistoryEntryId = null;
      activeHistoryLabel = '';
      activeHistoryCreatedAt = null;
      markerHistoryViewKey = '';
    }
    if (!state.markerPlaced) activeMarkerOwner = state.playerName;
    ensureLocalMarkerHistorySource();
    playerNameButton.textContent = state.playerName || 'Inserisci nome';
    if (persist && state.playerName) {
      try {
        localStorage.setItem('mappa-player-name', state.playerName);
      } catch (error) {
        identityFeedback.textContent = 'Nome valido solo per questa sessione.';
      }
    }
    updateMarkerHistoryCount();
  }

  function openIdentityDialog() {
    playerNameInput.value = state.playerName;
    identityFeedback.textContent = '';
    cancelIdentityButton.classList.toggle('hidden', !state.playerName);
    identityDialog.classList.remove('hidden');
    playerNameInput.focus();
  }

  function closeIdentityDialog() {
    if (!state.playerName) return;
    identityDialog.classList.add('hidden');
  }

  function loadPlayerName() {
    let savedName = '';
    try {
      savedName = localStorage.getItem('mappa-player-name') || '';
    } catch (error) {
      savedName = '';
    }
    if (savedName) setPlayerName(savedName, false);
    else openIdentityDialog();
  }

  // Il pannello coordinate, «Aggiungi punto» e «Lista» servono a chi *prepara*
  // il gioco, non a chi ci gioca: mentre si costruisce l'indice delle vie
  // devono poter sparire, per provare l'app come la vedrà un partecipante.
  // La scelta resta sul dispositivo, come il nome: chi ha spento gli strumenti
  // non se li ritrova addosso al ricaricamento.
  function setCoordinateToolsVisible(visible, persist = true) {
    state.coordinateToolsVisible = visible;
    coordinatePanel.classList.toggle('hidden', !visible);
    toggleCoordinatesButton.setAttribute('aria-pressed', String(visible));
    toggleCoordinatesButton.setAttribute(
      'aria-label',
      visible ? 'Nascondi gli strumenti coordinate' : 'Mostra gli strumenti coordinate'
    );
    if (!persist) return;
    try {
      localStorage.setItem('mappa-strumenti-coordinate', visible ? '1' : '0');
    } catch (error) {
      /* Spazio esaurito o navigazione privata: la scelta vale per questa sessione. */
    }
  }

  function loadCoordinateToolsPreference() {
    let salvata = null;
    try {
      salvata = localStorage.getItem('mappa-strumenti-coordinate');
    } catch (error) {
      salvata = null;
    }
    // Al primo accesso prevale la vista del partecipante; chi prepara la mappa
    // può riattivare gli strumenti e ritrovarli visibili ai caricamenti seguenti.
    setCoordinateToolsVisible(salvata === '1', false);
  }

  function fitImage() {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const coverScale = Math.max(stage.clientWidth / image.naturalWidth, stage.clientHeight / image.naturalHeight);
    state.minScale = coverScale;
    state.maxScale = coverScale * 6;
    state.scale = coverScale;
    state.x = (stage.clientWidth - image.naturalWidth * state.scale) / 2;
    state.y = (stage.clientHeight - image.naturalHeight * state.scale) / 2;
    constrain();
    render();
  }

  function constrain() {
    const width = image.naturalWidth * state.scale;
    const height = image.naturalHeight * state.scale;
    const centerX = stage.clientWidth / 2;
    const centerY = stage.clientHeight / 2;
    // Il mirino è fisso al centro: se fermassimo la mappa sul bordo dello
    // schermo, come faceva il vecchio vincolo, una fascia lungo tutti e
    // quattro i lati non potrebbe mai raggiungerlo. I nuovi estremi portano
    // invece ogni bordo esattamente sotto il mirino, quindi l'intervallo
    // normalizzato completo 0–1 resta realmente utilizzabile.
    state.x = clamp(state.x, centerX - width, centerX);
    state.y = clamp(state.y, centerY - height, centerY);
  }

  function render() {
    viewport.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    updateCrosshairCoordinates();
  }

  function getCrosshairCoordinates() {
    if (!image.naturalWidth || !image.naturalHeight || !state.scale) return null;
    return {
      x: clamp((stage.clientWidth / 2 - state.x) / (image.naturalWidth * state.scale), 0, 1),
      y: clamp((stage.clientHeight / 2 - state.y) / (image.naturalHeight * state.scale), 0, 1)
    };
  }

  function getGeographicCoordinates(coordinates = getCrosshairCoordinates()) {
    if (!coordinates || !Number.isFinite(coordinates.x) || !Number.isFinite(coordinates.y)) return null;
    const [latitudeOrigin, latitudeX, latitudeY] = geographicCalibration.latitude;
    const [longitudeOrigin, longitudeX, longitudeY] = geographicCalibration.longitude;
    return {
      latitude: latitudeOrigin + latitudeX * coordinates.x + latitudeY * coordinates.y,
      longitude: longitudeOrigin + longitudeX * coordinates.x + longitudeY * coordinates.y
    };
  }

  function updateCrosshairCoordinates() {
    const coordinates = getCrosshairCoordinates();
    const realCoordinates = getGeographicCoordinates(coordinates);
    coordinateLabel.textContent = state.markerPlaced ? 'Punto fissato' : 'Coordinate mirino';
    crosshairCoordinates.value = coordinates
      ? `x ${coordinates.x.toFixed(6)} · y ${coordinates.y.toFixed(6)}`
      : 'x — · y —';
    geographicCoordinates.value = realCoordinates
      ? `Lat ${realCoordinates.latitude.toFixed(5)}° · Lon ${realCoordinates.longitude.toFixed(5)}° ≈`
      : 'Lat — · Lon —';
    copyCoordinatesButton.disabled = !coordinates;
  }

  function coordinateJsonLines() {
    const coordinates = getCrosshairCoordinates();
    if (!coordinates) return '';
    return `"x": ${coordinates.x.toFixed(6)},\n"y": ${coordinates.y.toFixed(6)}`;
  }

  function copyTextFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }
    textarea.remove();
    return copied;
  }

  async function copyPlainText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        return copyTextFallback(text);
      }
    }
    return copyTextFallback(text);
  }

  async function copyCoordinateJson() {
    const text = coordinateJsonLines();
    if (!text) return;
    const copied = await copyPlainText(text);
    if (!copied) {
      window.prompt('Copia queste coordinate:', text);
      setStatus('Seleziona e copia le coordinate mostrate');
      return;
    }
    copyCoordinatesButton.textContent = 'Copiato';
    setStatus('Coordinate x/y copiate per streets.json');
    window.setTimeout(() => {
      copyCoordinatesButton.textContent = 'Copia x/y';
    }, 1400);
  }

  function updateManualStreetPointCount() {
    streetPointCount.textContent = String(state.manualStreetPoints.length);
    const hasPoints = state.manualStreetPoints.length > 0;
    copyStreetListButton.disabled = !hasPoints;
    downloadStreetListButton.disabled = !hasPoints;
  }

  function loadManualStreetPoints() {
    try {
      const saved = JSON.parse(localStorage.getItem(manualStreetStorageKey) || '[]');
      state.manualStreetPoints = Array.isArray(saved)
        ? saved.filter((point) => (
          point
          && typeof point.label === 'string'
          && Array.isArray(point.tags)
          && Number.isFinite(point.x)
          && Number.isFinite(point.y)
        ))
        : [];
    } catch (error) {
      state.manualStreetPoints = [];
      setStatus('Lista manuale non leggibile: ne è stata creata una nuova');
    }
    updateManualStreetPointCount();
  }

  function saveManualStreetPoints() {
    try {
      localStorage.setItem(manualStreetStorageKey, JSON.stringify(state.manualStreetPoints));
      return true;
    } catch (error) {
      setStatus('Punto aggiunto solo per questa sessione');
      return false;
    }
  }

  function parseStreetTags(value) {
    const uniqueTags = new Map();
    value.split(/[,;\n]+/).forEach((tag) => {
      const cleanTag = tag.trim().replace(/\s+/g, ' ');
      const key = normalizeText(cleanTag);
      if (key && !uniqueTags.has(key)) uniqueTags.set(key, cleanTag);
    });
    return [...uniqueTags.values()];
  }

  function openStreetPointDialog() {
    const coordinates = getCrosshairCoordinates();
    if (!coordinates) {
      setStatus('Attendi il caricamento della mappa');
      return;
    }
    pendingStreetPoint = {
      x: Number(coordinates.x.toFixed(6)),
      y: Number(coordinates.y.toFixed(6))
    };
    const realCoordinates = getGeographicCoordinates(pendingStreetPoint);
    streetPointCoordinates.textContent = `x ${pendingStreetPoint.x.toFixed(6)} · y ${pendingStreetPoint.y.toFixed(6)}`
      + (realCoordinates ? `\nLat ${realCoordinates.latitude.toFixed(5)}° · Lon ${realCoordinates.longitude.toFixed(5)}° (stima)` : '');
    streetPointLabelInput.value = '';
    streetPointTagsInput.value = '';
    streetPointForm.classList.remove('hidden');
    streetPointConfirmPanel.classList.add('hidden');
    streetPointDialog.classList.remove('hidden');
    streetPointLabelInput.focus();
  }

  function closeStreetPointDialog() {
    streetPointDialog.classList.add('hidden');
    pendingStreetPoint = null;
  }

  function showStreetPointConfirmation(event) {
    event.preventDefault();
    if (!pendingStreetPoint) return;
    const label = streetPointLabelInput.value.trim().replace(/\s+/g, ' ');
    const tags = parseStreetTags(streetPointTagsInput.value);
    if (!label || !tags.length) {
      setStatus('Inserisci una label e almeno un tag');
      return;
    }
    pendingStreetPoint = {
      label,
      x: pendingStreetPoint.x,
      tags,
      y: pendingStreetPoint.y
    };
    const summaryRows = [
      ['Label', pendingStreetPoint.label],
      ['Tag', pendingStreetPoint.tags.join(', ')],
      ['Coordinate', `x ${pendingStreetPoint.x.toFixed(6)} · y ${pendingStreetPoint.y.toFixed(6)}`]
    ];
    streetPointConfirmSummary.replaceChildren();
    summaryRows.forEach(([term, description]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = description;
      streetPointConfirmSummary.append(dt, dd);
    });
    streetPointForm.classList.add('hidden');
    streetPointConfirmPanel.classList.remove('hidden');
  }

  function editPendingStreetPoint() {
    streetPointConfirmPanel.classList.add('hidden');
    streetPointForm.classList.remove('hidden');
    streetPointLabelInput.focus();
  }

  function confirmPendingStreetPoint() {
    if (!pendingStreetPoint?.label || !pendingStreetPoint.tags?.length) return;
    state.manualStreetPoints.push({ ...pendingStreetPoint });
    saveManualStreetPoints();
    updateManualStreetPointCount();
    const addedLabel = pendingStreetPoint.label;
    closeStreetPointDialog();
    setStatus(`Punto aggiunto alla lista: ${addedLabel}`);
  }

  function serializeManualStreetPoints() {
    return JSON.stringify({ streets: state.manualStreetPoints }, null, 2);
  }

  function renderManualStreetPointList() {
    streetListItems.replaceChildren();
    if (!state.manualStreetPoints.length) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'street-list-empty';
      emptyMessage.textContent = 'La lista è ancora vuota.';
      streetListItems.append(emptyMessage);
      updateManualStreetPointCount();
      return;
    }
    state.manualStreetPoints.forEach((point, index) => {
      const item = document.createElement('article');
      item.className = 'street-list-item';
      const title = document.createElement('strong');
      title.textContent = `${index + 1}. ${point.label}`;
      const coordinates = document.createElement('code');
      coordinates.textContent = `x ${point.x.toFixed(6)} · y ${point.y.toFixed(6)}`;
      const tags = document.createElement('small');
      tags.textContent = `Tag: ${point.tags.join(', ')}`;
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Elimina';
      deleteButton.addEventListener('click', () => {
        if (!window.confirm(`Eliminare "${point.label}" dalla lista manuale?`)) return;
        state.manualStreetPoints.splice(index, 1);
        saveManualStreetPoints();
        renderManualStreetPointList();
        setStatus(`Punto eliminato: ${point.label}`);
      });
      item.append(title, coordinates, tags, deleteButton);
      streetListItems.append(item);
    });
    updateManualStreetPointCount();
  }

  function openManualStreetPointList() {
    renderManualStreetPointList();
    streetListDialog.classList.remove('hidden');
  }

  function closeManualStreetPointList() {
    streetListDialog.classList.add('hidden');
  }

  async function copyManualStreetPointList() {
    const text = serializeManualStreetPoints();
    if (!state.manualStreetPoints.length) return;
    if (await copyPlainText(text)) {
      setStatus('Lista manuale copiata come JSON');
      return;
    }
    window.prompt('Copia la lista JSON:', text);
    setStatus('Seleziona e copia la lista JSON mostrata');
  }

  function downloadManualStreetPointList() {
    if (!state.manualStreetPoints.length) return;
    const blob = new Blob([serializeManualStreetPoints()], { type: 'application/json' });
    downloadBlob(blob, 'manual-streets.json');
    setStatus('File manual-streets.json scaricato');
  }

  function zoomAt(factor, centerX = stage.clientWidth / 2, centerY = stage.clientHeight / 2) {
    const oldScale = state.scale;
    const nextScale = clamp(oldScale * factor, state.minScale, state.maxScale);
    const imageX = (centerX - state.x) / oldScale;
    const imageY = (centerY - state.y) / oldScale;
    state.scale = nextScale;
    state.x = centerX - imageX * nextScale;
    state.y = centerY - imageY * nextScale;
    constrain();
    render();
  }

  function zoomToMapPoint(x, y) {
    const targetScale = clamp(Math.max(state.minScale * 3, state.scale), state.minScale, state.maxScale);
    state.scale = targetScale;
    state.x = stage.clientWidth / 2 - image.naturalWidth * x * targetScale;
    state.y = stage.clientHeight / 2 - image.naturalHeight * y * targetScale;
    constrain();
    render();
  }

  function pointDistance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function setStatus(message) {
    statusPill.textContent = message;
  }

  function setColorSelectValue(select, value, customLabel) {
    [...select.options].filter((option) => option.dataset.dynamic === 'true').forEach((option) => option.remove());
    const hasPreset = [...select.options].some((option) => option.value === value);
    if (value && !hasPreset) {
      const customOption = document.createElement('option');
      customOption.value = value;
      customOption.dataset.dynamic = 'true';
      customOption.textContent = `${customLabel} (${value.toUpperCase()})`;
      select.insertBefore(customOption, select.options[select.options.length - 1]);
    }
    select.value = value;
  }

  function syncMarkerColorSelects() {
    const primaryColor = state.markerColors[0] || 'none';
    const secondaryColor = state.markerColors[1] || '';
    setColorSelectValue(primaryColorSelect, primaryColor, 'Personalizzato');
    setColorSelectValue(secondaryColorSelect, secondaryColor, 'Personalizzato');
    secondaryColorSelect.disabled = state.markerColors.length === 0;
  }

  function markerCaptionBackground(colors) {
    if (colors.length === 2) {
      return `linear-gradient(90deg, ${colors[0]} 0 50%, ${colors[1]} 50% 100%)`;
    }
    return colors[0] || 'rgba(8,11,16,.9)';
  }

  function colorLuminance(color) {
    const channels = /^#([0-9a-f]{6})$/i.exec(color)?.[1].match(/.{2}/g)?.map((channel) => parseInt(channel, 16) / 255);
    if (!channels) return null;
    const linearChannels = channels.map((channel) => channel <= .04045
      ? channel / 12.92
      : ((channel + .055) / 1.055) ** 2.4);
    return .2126 * linearChannels[0] + .7152 * linearChannels[1] + .0722 * linearChannels[2];
  }

  function contrastRatio(firstLuminance, secondLuminance) {
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);
    return (lighter + .05) / (darker + .05);
  }

  function markerCaptionPalette(colors) {
    const backgroundLuminances = colors.map(colorLuminance).filter((value) => value !== null);
    if (!backgroundLuminances.length) {
      return {
        text: '#ffffff',
        outline: '#17191f',
        needsOutline: false
      };
    }
    const darkText = '#111318';
    const lightText = '#ffffff';
    const darkLuminance = colorLuminance(darkText);
    const lightLuminance = colorLuminance(lightText);
    const darkScore = Math.min(...backgroundLuminances.map((value) => contrastRatio(value, darkLuminance)));
    const lightScore = Math.min(...backgroundLuminances.map((value) => contrastRatio(value, lightLuminance)));
    const useDarkText = darkScore >= lightScore;
    return {
      text: useDarkText ? darkText : lightText,
      outline: useDarkText ? lightText : '#111318',
      needsOutline: Math.max(darkScore, lightScore) < 4.5
    };
  }

  function setMarkerVisual() {
    const captionPalette = markerCaptionPalette(state.markerColors);
    const captionShadow = captionPalette.needsOutline
      ? `-1px -1px 0 ${captionPalette.outline}, 1px -1px 0 ${captionPalette.outline}, -1px 1px 0 ${captionPalette.outline}, 1px 1px 0 ${captionPalette.outline}`
      : '0 1px 2px rgba(0,0,0,.3)';
    marker.style.setProperty('--marker-background', fixedPointColor);
    marker.style.setProperty('--marker-border-color', '#17191f');
    markerLabel.style.setProperty('--marker-caption-background', markerCaptionBackground(state.markerColors));
    markerLabel.style.setProperty('--marker-caption-color', captionPalette.text);
    markerLabel.style.setProperty('--marker-caption-border', '#17191f');
    markerLabel.style.setProperty('--marker-caption-shadow', captionShadow);
    markerLabel.textContent = state.markerText;
    markerLabel.classList.toggle('marker-label--swatch', !state.markerText);
    markerLabel.classList.toggle('marker-label--no-color', !state.markerColors.length);
    marker.classList.toggle('marker--swatch', !state.markerText);
    markerHistoryLabelVisual.textContent = activeHistoryLabel;
    markerHistoryLabelVisual.classList.toggle('hidden', !activeHistoryLabel);
    syncMarkerColorSelects();
  }

  function openMarkerDialog() {
    markerDialogSnapshot = {
      colors: [...state.markerColors],
      text: state.markerText
    };
    markerTextInput.value = state.markerText;
    markerHistoryLabelInput.value = activeHistoryLabel;
    customColorTarget = 'primary';
    markerColorInput.value = '';
    colorNameBox.classList.add('hidden');
    updateColorNamePreview();
    setMarkerVisual();
    markerDialog.classList.remove('hidden');
    cancelMarkerButton.focus({ preventScroll: true });
  }

  function closeMarkerDialog() {
    markerDialogSnapshot = null;
    markerDialog.classList.add('hidden');
  }

  function cancelMarkerDialog() {
    if (markerDialogSnapshot) {
      state.markerColors = [...markerDialogSnapshot.colors];
      state.markerText = markerDialogSnapshot.text;
      setMarkerVisual();
    }
    closeMarkerDialog();
  }

  function placeMarker() {
    const markerWasPlaced = state.markerPlaced;
    state.markerText = markerTextInput.value.trim().slice(0, 12);
    activeHistoryLabel = normalizeHistoryLabel(markerHistoryLabelInput.value);
    activeMarkerOwner = normalizeParticipantName(state.playerName);
    state.markerPlaced = true;
    setMarkerVisual();
    marker.classList.remove('hidden');
    crosshair.classList.add('hidden');
    mainControlsRow.classList.add('hidden');
    confirmRow.classList.remove('hidden');
    closeMarkerDialog();
    updateCrosshairCoordinates();
    const historyPersisted = saveCurrentMarkerToHistory();
    if (!historyPersisted) {
      setStatus('Punto salvato solo per questa sessione');
      return;
    }
    const markerName = activeHistoryLabel || state.markerText;
    if (markerWasPlaced) setStatus(markerName ? `Punto aggiornato • ${markerName}` : 'Punto aggiornato');
    else setStatus(markerName ? `Punto selezionato • ${markerName}` : 'Punto selezionato');
  }

  function enableMarkerMove() {
    state.markerPlaced = false;
    marker.classList.add('hidden');
    crosshair.classList.remove('hidden');
    mainControlsRow.classList.remove('hidden');
    confirmRow.classList.add('hidden');
    updateCrosshairCoordinates();
    setStatus('Sposta la mappa sotto il mirino');
  }

  function startNewPoint() {
    state.markerPlaced = false;
    state.markerText = '';
    activeHistoryEntryId = null;
    activeHistoryLabel = '';
    activeHistoryCreatedAt = null;
    activeMarkerOwner = normalizeParticipantName(state.playerName);
    markerTextInput.value = '';
    markerHistoryLabelInput.value = '';
    marker.classList.add('hidden');
    crosshair.classList.remove('hidden');
    mainControlsRow.classList.remove('hidden');
    confirmRow.classList.add('hidden');
    setMarkerVisual();
    updateCrosshairCoordinates();
    setStatus('Sposta la mappa e segna un nuovo punto');
  }

  function resetMap() {
    state.markerPlaced = false;
    state.markerColors = [defaultMarkerColor];
    state.markerText = '';
    activeHistoryEntryId = null;
    activeHistoryLabel = '';
    activeHistoryCreatedAt = null;
    activeMarkerOwner = normalizeParticipantName(state.playerName);
    markerTextInput.value = '';
    markerHistoryLabelInput.value = '';
    marker.classList.add('hidden');
    crosshair.classList.remove('hidden');
    mainControlsRow.classList.remove('hidden');
    confirmRow.classList.add('hidden');
    setMarkerVisual();
    searchFeedback.textContent = '';
    searchResults.replaceChildren();
    searchResults.classList.add('hidden');
    streetSearch.value = '';
    setStatus('Sposta la mappa sotto il mirino');
    fitImage();
  }

  function scoreStreet(query, street) {
    const normalizedQuery = normalizeText(query);
    const queryTokens = normalizedQuery.split(' ').filter((token) => !genericSearchWords.has(token));
    if (!queryTokens.length) return 0;
    const tags = (Array.isArray(street.tags) && street.tags.length ? street.tags : [street.label])
      .map(normalizeText)
      .filter(Boolean);
    let bestScore = 0;
    tags.forEach((tag) => {
      const tagTokens = tag.split(' ');
      if (tag === normalizedQuery) bestScore = Math.max(bestScore, 1200);
      else if (tag.startsWith(normalizedQuery)) bestScore = Math.max(bestScore, 980);
      else if (tag.includes(normalizedQuery)) bestScore = Math.max(bestScore, 820);

      const exactTokenMatches = queryTokens.filter((token) => tagTokens.includes(token)).length;
      if (exactTokenMatches === queryTokens.length) bestScore = Math.max(bestScore, 760 + queryTokens.length * 10);

      const partialTokenMatches = queryTokens.filter((token) => tagTokens.some((tagToken) => tagToken.includes(token))).length;
      if (queryTokens.length === 1 && partialTokenMatches) bestScore = Math.max(bestScore, partialTokenMatches * 100);
      if (queryTokens.length > 1 && partialTokenMatches === queryTokens.length) bestScore = Math.max(bestScore, 400 + queryTokens.length * 10);
    });
    return bestScore;
  }

  function selectStreet(street, index, total) {
    zoomToMapPoint(street.x, street.y);
    clearSearchResults();
    searchFeedback.textContent = total > 1 ? `Scelta ${index + 1} di ${total}: ${street.label}` : `Trovata: ${street.label}`;
    setStatus(`Mappa centrata su ${street.label}`);
  }

  function showSearchResults(matches) {
    searchResults.replaceChildren();
    matches.slice(0, 12).forEach((match, index) => {
      const resultButton = document.createElement('button');
      resultButton.type = 'button';
      resultButton.className = 'search-result';
      const title = document.createElement('strong');
      title.textContent = match.street.label;
      const detail = document.createElement('span');
      detail.textContent = `Punto ${index + 1} di ${matches.length}`;
      resultButton.append(title, detail);
      resultButton.addEventListener('click', () => selectStreet(match.street, index, matches.length));
      searchResults.append(resultButton);
    });
    if (matches.length > 12) {
      const remaining = document.createElement('span');
      remaining.className = 'search-result-count';
      remaining.textContent = `Altri ${matches.length - 12} risultati: restringi la ricerca.`;
      searchResults.append(remaining);
    }
    searchResults.classList.toggle('hidden', !matches.length);
    streetSearch.setAttribute('aria-expanded', String(Boolean(matches.length)));
  }

  function clearSearchResults() {
    searchResults.replaceChildren();
    searchResults.classList.add('hidden');
    streetSearch.setAttribute('aria-expanded', 'false');
  }

  function searchStreet(query, { selectSingle = true, announce = true } = {}) {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      searchFeedback.textContent = announce && cleanQuery ? 'Inserisci almeno 2 caratteri.' : '';
      clearSearchResults();
      return;
    }
    if (!state.streetIndex.length) {
      searchFeedback.textContent = 'Indice vie non disponibile. Riprova tra poco.';
      clearSearchResults();
      return;
    }
    const matches = state.streetIndex
      .map((street) => ({ street, score: scoreStreet(cleanQuery, street) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!matches.length) {
      searchFeedback.textContent = announce ? 'Via non trovata. Controlla il nome e riprova.' : 'Nessuna corrispondenza.';
      clearSearchResults();
      if (announce) setStatus('Nessuna via trovata');
      return;
    }
    if (matches.length > 1 || !selectSingle) {
      searchFeedback.textContent = matches.length === 1
        ? 'Trovata 1 corrispondenza: scegli il punto.'
        : `Trovate ${matches.length} corrispondenze: scegli il punto.`;
      showSearchResults(matches);
      if (announce) setStatus('Scegli una posizione dalla lista');
      return;
    }
    selectStreet(matches[0].street, 0, 1);
  }

  async function loadStreetIndex() {
    try {
      const response = await fetch('./assets/streets.json');
      if (!response.ok) throw new Error('street-index-unavailable');
      const payload = await response.json();
      state.streetIndex = Array.isArray(payload.streets)
        ? payload.streets.map((street) => ({ ...street, tags: Array.isArray(street.tags) ? street.tags : [] }))
        : [];
    } catch (error) {
      state.streetIndex = [];
      if (location.protocol !== 'file:') searchFeedback.textContent = 'Ricerca vie non disponibile offline.';
    }
  }

  stage.addEventListener('pointerdown', (event) => {
    const clickedControl = event.target.closest?.('button, input, form, .search-results, .coordinate-panel, .marker-dialog, .identity-dialog');
    if (state.markerPlaced || clickedControl) return;
    stage.setPointerCapture(event.pointerId);
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  });

  stage.addEventListener('pointermove', (event) => {
    if (!state.dragging || state.markerPlaced) return;
    state.x += event.clientX - state.lastX;
    state.y += event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    constrain();
    render();
  });

  stage.addEventListener('pointerup', () => { state.dragging = false; });
  stage.addEventListener('pointercancel', () => { state.dragging = false; });

  stage.addEventListener('wheel', (event) => {
    // I pannelli che scorrono per conto loro tengono la rotella: senza questo
    // controllo l'evento risaliva fino a qui, veniva annullato, e girare la
    // rotella sopra l'elenco dei risultati zoomava la mappa invece di scorrere
    // la lista — le voci oltre le prime restavano irraggiungibili. È lo stesso
    // riguardo che il gestore pointerdown ha già per i controlli sovrapposti.
    if (event.target.closest?.('.search-results, .street-list-items, .dialog-card')) return;
    event.preventDefault();
    if (state.markerPlaced) return;
    zoomAt(event.deltaY < 0 ? 1.12 : 0.89, event.clientX, event.clientY);
  }, { passive: false });

  stage.addEventListener('touchmove', (event) => {
    if (state.markerPlaced || event.touches.length !== 2) return;
    const distance = pointDistance(event.touches[0], event.touches[1]);
    if (state.pinchDistance) {
      const rect = stage.getBoundingClientRect();
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;
      zoomAt(distance / state.pinchDistance, centerX, centerY);
    }
    state.pinchDistance = distance;
  }, { passive: false });
  stage.addEventListener('touchend', () => { state.pinchDistance = 0; });

  document.getElementById('zoomInButton').addEventListener('click', () => zoomAt(1.25));
  document.getElementById('zoomOutButton').addEventListener('click', () => zoomAt(0.8));
  document.getElementById('placeButton').addEventListener('click', openMarkerDialog);
  document.getElementById('newPointButton').addEventListener('click', startNewPoint);
  document.getElementById('moveButton').addEventListener('click', enableMarkerMove);
  editMarkerButton.addEventListener('click', openMarkerDialog);
  historyButton.addEventListener('click', openMarkerHistory);
  closeMarkerHistoryButton.addEventListener('click', closeMarkerHistory);
  exportMarkerHistoryButton.addEventListener('click', exportAndShareMarkerHistory);
  markerHistorySourceSelect.addEventListener('change', () => {
    markerHistoryViewKey = markerHistorySourceSelect.value === markerHistoryPlayerKey()
      ? ''
      : markerHistorySourceSelect.value;
    markerHistoryImportFeedback.classList.remove('error');
    markerHistoryImportFeedback.textContent = '';
    renderMarkerHistory();
  });
  importMarkerHistoryButton.addEventListener('click', () => importMarkerHistoryInput.click());
  importMarkerHistoryInput.addEventListener('change', async () => {
    const [file] = importMarkerHistoryInput.files || [];
    try {
      await importMarkerHistoryFile(file);
    } catch (error) {
      markerHistoryImportFeedback.classList.add('error');
      markerHistoryImportFeedback.textContent = error instanceof SyntaxError
        ? 'Il file non contiene un JSON valido.'
        : error.message || 'Importazione non riuscita.';
      setStatus('Importazione non riuscita');
    } finally {
      importMarkerHistoryInput.value = '';
    }
  });
  removeImportedMarkerHistoryButton.addEventListener('click', removeImportedMarkerHistory);
  document.getElementById('resetButton').addEventListener('click', resetMap);
  toggleCoordinatesButton.addEventListener('click', () => {
    setCoordinateToolsVisible(!state.coordinateToolsVisible);
    setStatus(state.coordinateToolsVisible
      ? 'Strumenti coordinate mostrati'
      : 'Strumenti coordinate nascosti');
  });
  cancelMarkerButton.addEventListener('click', cancelMarkerDialog);
  document.getElementById('cancelMarkerButtonSecondary').addEventListener('click', cancelMarkerDialog);
  document.getElementById('confirmMarkerButton').addEventListener('click', placeMarker);
  copyCoordinatesButton.addEventListener('click', copyCoordinateJson);
  addStreetPointButton.addEventListener('click', openStreetPointDialog);
  openStreetPointListButton.addEventListener('click', openManualStreetPointList);
  document.getElementById('closeStreetPointDialogButton').addEventListener('click', closeStreetPointDialog);
  document.getElementById('cancelStreetPointButton').addEventListener('click', closeStreetPointDialog);
  streetPointForm.addEventListener('submit', showStreetPointConfirmation);
  document.getElementById('editStreetPointButton').addEventListener('click', editPendingStreetPoint);
  document.getElementById('confirmStreetPointButton').addEventListener('click', confirmPendingStreetPoint);
  document.getElementById('closeStreetListDialogButton').addEventListener('click', closeManualStreetPointList);
  copyStreetListButton.addEventListener('click', copyManualStreetPointList);
  downloadStreetListButton.addEventListener('click', downloadManualStreetPointList);
  playerNameButton.addEventListener('click', openIdentityDialog);
  cancelIdentityButton.addEventListener('click', closeIdentityDialog);
  identityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = playerNameInput.value.trim().replace(/\s+/g, ' ');
    if (!value) {
      identityFeedback.textContent = 'Inserisci un testo breve.';
      return;
    }
    setPlayerName(value);
    closeIdentityDialog();
  });
  function applyMarkerColor(target, color) {
    if (target === 'primary') {
      if (color === 'none') {
        state.markerColors = [];
      } else {
        const secondaryColor = state.markerColors[1];
        state.markerColors = secondaryColor ? [color, secondaryColor] : [color];
      }
    } else if (!color || color === 'none') {
      state.markerColors = state.markerColors[0] ? [state.markerColors[0]] : [];
    } else {
      state.markerColors = [state.markerColors[0] || defaultMarkerColor, color];
    }
    setMarkerVisual();
  }

  function openCustomColorInput(target) {
    customColorTarget = target;
    colorNameLabel.textContent = target === 'primary'
      ? 'Colore principale personalizzato'
      : 'Secondo colore personalizzato';
    markerColorInput.value = '';
    colorNameBox.classList.remove('hidden');
    updateColorNamePreview();
    markerColorInput.focus({ preventScroll: true });
  }

  function resolveMarkerColor(value) {
    const normalizedName = normalizeColorName(value);
    if (!normalizedName) return null;
    if (italianColorAliases.has(normalizedName)) return italianColorAliases.get(normalizedName);
    if (/^(inherit|initial|unset|revert|currentcolor|var\s*\()/i.test(normalizedName)) return null;
    const probe = document.createElement('span');
    probe.style.color = value.trim();
    if (!probe.style.color) return null;
    probe.hidden = true;
    document.body.append(probe);
    const computedColor = getComputedStyle(probe).color;
    probe.remove();
    const channels = computedColor.match(/[\d.]+/g)?.map(Number);
    if (!channels || channels.length < 3) return null;
    if (channels.length > 3 && channels[3] === 0) return 'none';
    return `#${channels.slice(0, 3).map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
  }

  function updateColorNamePreview() {
    const value = markerColorInput.value.trim();
    const resolvedColor = resolveMarkerColor(value);
    colorNamePreview.classList.remove('invalid', 'no-color');
    colorNameFeedback.classList.remove('error');
    if (!value) {
      const currentColor = customColorTarget === 'secondary'
        ? state.markerColors[1] || state.markerColors[0] || defaultMarkerColor
        : state.markerColors[0] || defaultMarkerColor;
      colorNamePreview.style.setProperty('--typed-color', currentColor);
      colorNameFeedback.textContent = 'Scrivi un nome o usa uno degli esempi.';
      return null;
    }
    if (!resolvedColor) {
      colorNamePreview.classList.add('invalid');
      colorNameFeedback.classList.add('error');
      colorNameFeedback.textContent = 'Colore non riconosciuto. Prova “rosa”, “blu notte” o #FF0000.';
      return null;
    }
    if (resolvedColor === 'none') {
      colorNamePreview.classList.add('no-color');
      colorNamePreview.style.removeProperty('--typed-color');
      colorNameFeedback.textContent = 'Riconosciuto: senza colore.';
    } else {
      colorNamePreview.style.setProperty('--typed-color', resolvedColor);
      colorNameFeedback.textContent = `Riconosciuto: ${resolvedColor.toUpperCase()}.`;
    }
    return resolvedColor;
  }

  primaryColorSelect.addEventListener('change', () => {
    if (primaryColorSelect.value === 'custom') {
      openCustomColorInput('primary');
      return;
    }
    colorNameBox.classList.add('hidden');
    applyMarkerColor('primary', primaryColorSelect.value);
  });
  secondaryColorSelect.addEventListener('change', () => {
    if (secondaryColorSelect.value === 'custom') {
      openCustomColorInput('secondary');
      return;
    }
    colorNameBox.classList.add('hidden');
    applyMarkerColor('secondary', secondaryColorSelect.value);
  });
  markerColorInput.addEventListener('input', updateColorNamePreview);
  colorNameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const resolvedColor = updateColorNamePreview();
    if (!resolvedColor) {
      markerColorInput.focus();
      return;
    }
    applyMarkerColor(customColorTarget, resolvedColor);
    colorNameFeedback.textContent = resolvedColor === 'none'
      ? 'Applicato: senza colore.'
      : `Applicato: ${resolvedColor.toUpperCase()}.`;
    markerColorInput.blur();
    colorNameBox.classList.add('hidden');
  });
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(incrementalSearchTimer);
    searchStreet(streetSearch.value);
  });
  searchButton.addEventListener('click', () => {
    clearTimeout(incrementalSearchTimer);
    searchStreet(streetSearch.value);
  });
  streetSearch.addEventListener('input', () => {
    clearTimeout(incrementalSearchTimer);
    const query = streetSearch.value.trim();
    if (query.length < 2) {
      searchFeedback.textContent = '';
      clearSearchResults();
      return;
    }
    incrementalSearchTimer = window.setTimeout(() => {
      searchStreet(query, { selectSingle: false, announce: false });
    }, 160);
  });
  streetSearch.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    clearTimeout(incrementalSearchTimer);
    searchStreet(streetSearch.value);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !markerDialog.classList.contains('hidden')) cancelMarkerDialog();
    if (event.key === 'Escape' && !identityDialog.classList.contains('hidden')) closeIdentityDialog();
    if (event.key === 'Escape' && !streetPointDialog.classList.contains('hidden')) closeStreetPointDialog();
    if (event.key === 'Escape' && !streetListDialog.classList.contains('hidden')) closeManualStreetPointList();
    if (event.key === 'Escape' && !markerHistoryDialog.classList.contains('hidden')) closeMarkerHistory();
  });

  function roundedRectPath(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function setExportCaptionFill(ctx, colors, startX, width) {
    if (colors.length === 2) {
      const gradient = ctx.createLinearGradient(startX, 0, startX + width, 0);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(.5, colors[0]);
      gradient.addColorStop(.5, colors[1]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      return;
    }
    ctx.fillStyle = colors[0] || 'rgba(8,11,16,.9)';
  }

  function drawExportMarker(ctx, centerX, centerY) {
    ctx.fillStyle = fixedPointColor;
    ctx.strokeStyle = '#17191f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    let coloredElementTop;
    if (state.markerText) {
      const captionPalette = markerCaptionPalette(state.markerColors);
      ctx.font = '700 28px sans-serif';
      const labelWidth = ctx.measureText(state.markerText).width + 34;
      const labelX = centerX - labelWidth / 2;
      const labelY = centerY - 108;
      coloredElementTop = labelY;
      setExportCaptionFill(ctx, state.markerColors, labelX, labelWidth);
      ctx.beginPath();
      roundedRectPath(ctx, labelX, labelY, labelWidth, 52, 18);
      ctx.fill();
      ctx.strokeStyle = '#17191f';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.fillStyle = captionPalette.text;
      ctx.textAlign = 'center';
      if (captionPalette.needsOutline) {
        ctx.strokeStyle = captionPalette.outline;
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.strokeText(state.markerText, centerX, labelY + 35);
      }
      ctx.fillText(state.markerText, centerX, labelY + 35);
      ctx.restore();
    } else {
      const swatchSize = 44;
      const swatchX = centerX - swatchSize / 2;
      const swatchY = centerY - 88;
      coloredElementTop = swatchY;
      ctx.beginPath();
      roundedRectPath(ctx, swatchX, swatchY, swatchSize, swatchSize, 12);
      if (state.markerColors.length) {
        setExportCaptionFill(ctx, state.markerColors, swatchX, swatchSize);
        ctx.fill();
      }
      ctx.strokeStyle = '#17191f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (!activeHistoryLabel) return;
    ctx.save();
    ctx.font = '700 22px sans-serif';
    const historyLabelWidth = Math.min(ctx.measureText(activeHistoryLabel).width + 32, 520);
    const historyLabelHeight = 42;
    const historyLabelX = centerX - historyLabelWidth / 2;
    const historyLabelY = coloredElementTop - historyLabelHeight - 12;
    ctx.fillStyle = 'rgba(8,11,16,.94)';
    ctx.beginPath();
    roundedRectPath(ctx, historyLabelX, historyLabelY, historyLabelWidth, historyLabelHeight, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,219,139,.72)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(activeHistoryLabel, centerX, historyLabelY + 28, historyLabelWidth - 20);
    ctx.restore();
  }

  async function createExportBlob() {
    const stageRatio = Math.min(1400 / stage.clientWidth, 2400 / stage.clientHeight);
    const outputWidth = Math.round(stage.clientWidth * stageRatio);
    const outputHeight = Math.round(stage.clientHeight * stageRatio);
    const ctx = exportCanvas.getContext('2d');
    exportCanvas.width = outputWidth;
    exportCanvas.height = outputHeight;
    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // Quando si segna un punto sul bordo, metà vista può trovarsi oltre la
    // carta vera. Lo stesso fondale sfocato dell'interfaccia evita un vuoto
    // nero nel PNG, mentre il contorno successivo rende inequivocabile dove
    // termina la mappa utilizzabile.
    const backdropScale = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight) * 1.08;
    const backdropWidth = image.naturalWidth * backdropScale;
    const backdropHeight = image.naturalHeight * backdropScale;
    ctx.save();
    ctx.filter = 'blur(28px) brightness(.58)';
    ctx.drawImage(
      image,
      (outputWidth - backdropWidth) / 2,
      (outputHeight - backdropHeight) / 2,
      backdropWidth,
      backdropHeight
    );
    ctx.restore();
    ctx.fillStyle = 'rgba(9,11,16,.28)';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    const mapX = state.x * stageRatio;
    const mapY = state.y * stageRatio;
    const mapWidth = image.naturalWidth * state.scale * stageRatio;
    const mapHeight = image.naturalHeight * state.scale * stageRatio;
    ctx.drawImage(
      image,
      mapX,
      mapY,
      mapWidth,
      mapHeight
    );
    ctx.strokeStyle = 'rgba(255,255,255,.34)';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

    const gradient = ctx.createLinearGradient(0, 0, 0, outputHeight);
    gradient.addColorStop(0, 'rgba(4,7,12,.70)');
    gradient.addColorStop(.2, 'rgba(4,7,12,0)');
    gradient.addColorStop(.72, 'rgba(4,7,12,0)');
    gradient.addColorStop(1, 'rgba(4,7,12,.82)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.fillStyle = '#f5db8b';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('CACCIA AL TESORO', 54, 74);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 42px sans-serif';
    ctx.fillText(activeMarkerOwner || state.playerName || 'CACCIA AL TESORO', 54, 124);
    drawExportMarker(ctx, outputWidth / 2, outputHeight / 2);

    const historicalDate = activeHistoryCreatedAt ? new Date(activeHistoryCreatedAt) : null;
    const now = historicalDate && !Number.isNaN(historicalDate.getTime()) ? historicalDate : new Date();
    const footerLabel = normalizeHistoryLabel(activeHistoryLabel) || 'Punto indicato';
    ctx.fillStyle = 'rgba(8,11,16,.76)';
    ctx.beginPath();
    roundedRectPath(ctx, 48, outputHeight - 118, outputWidth - 96, 70, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 25px sans-serif';
    ctx.fillText(`${footerLabel} • ${now.toLocaleDateString('it-IT')} ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`, 78, outputHeight - 74);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('export-timeout')), 5000);
      exportCanvas.toBlob((blob) => {
        clearTimeout(timeout);
        if (blob) resolve(blob);
        else reject(new Error('export-empty'));
      }, 'image/png', 0.95);
    });
  }

  async function copyBlobToClipboard(blob) {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return false;
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return true;
  }

  function canShareFile(file) {
    try {
      return typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
    } catch (error) {
      return false;
    }
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportFile() {
    const blob = await createExportBlob();
    const ownerName = activeMarkerOwner || state.playerName;
    const safeName = normalizeText(ownerName || 'caccia al tesoro').toLowerCase().replace(/\s+/g, '-');
    return { blob, file: new File([blob], `mappa-${safeName}-${Date.now()}.png`, { type: 'image/png' }) };
  }

  async function shareCurrentMarker() {
    setStatus('Preparazione immagine…');
    try {
      const { blob, file } = await exportFile();
      if (canShareFile(file)) {
        const shareLabel = normalizeHistoryLabel(activeHistoryLabel);
        const ownerName = activeMarkerOwner || state.playerName;
        const title = shareLabel
          ? `${shareLabel} - ${ownerName}`
          : `Punto sulla mappa - ${ownerName}`;
        await navigator.share({ files: [file], title });
        setStatus('Immagine condivisa');
      } else {
        let copied = false;
        try {
          copied = await copyBlobToClipboard(blob);
        } catch (error) {
          copied = false;
        }
        if (copied) {
          setStatus('Immagine copiata: incollala nell’app desiderata');
          return;
        }
        downloadBlob(blob, file.name);
        setStatus('PNG scaricato');
      }
    } catch (error) {
      setStatus(error.name === 'AbortError' ? 'Punto selezionato' : 'Condivisione non riuscita');
    }
  }

  document.getElementById('shareButton').addEventListener('click', async () => {
    await shareCurrentMarker();
  });

  document.getElementById('copyButton').addEventListener('click', async () => {
    setStatus('Copia immagine…');
    try {
      const { blob, file } = await exportFile();
      let copied = false;
      try {
        copied = await copyBlobToClipboard(blob);
      } catch (error) {
        copied = false;
      }
      if (copied) setStatus('Immagine copiata: ora puoi incollarla');
      else if (canShareFile(file)) {
        await navigator.share({ files: [file], title: `Punto sulla mappa - ${activeMarkerOwner || state.playerName}` });
        setStatus('Menu di condivisione aperto');
      } else if (!window.isSecureContext) {
        downloadBlob(blob, file.name);
        setStatus('PNG salvato: aprilo e condividilo dal menu iPhone');
      } else {
        setStatus('Copia immagine non disponibile: usa Condividi PNG');
      }
    } catch (error) {
      setStatus(error.name === 'AbortError' ? 'Punto selezionato' : 'Copia non riuscita');
    }
  });

  image.addEventListener('load', fitImage);
  // Questo script è deferred, quindi parte a parsing finito: quando la mappa
  // arriva dalla cache — cioè sempre, dalla seconda visita in poi e in tutta
  // l'esperienza offline — è già completa prima di adesso e il suo evento
  // 'load' non scatterà mai. Senza questa chiamata la mappa resterebbe non
  // inquadrata: si vedrebbe l'angolo dell'immagine a grandezza naturale, che
  // è campagna vuota, e il mirino non avrebbe coordinate.
  if (image.complete && image.naturalWidth) fitImage();
  window.addEventListener('resize', fitImage);
  setMarkerVisual();
  loadCoordinateToolsPreference();
  loadMarkerHistoryStore();
  loadMarkerHistorySources();
  loadPlayerName();
  loadStreetIndex();
  loadManualStreetPoints();

  if (location.protocol === 'file:') {
    searchFeedback.textContent = 'Apri l’app tramite http:// per attivare la ricerca e la PWA.';
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
  }
})();
