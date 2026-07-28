(() => {
  const stage = document.getElementById('mapStage');
  const viewport = document.getElementById('mapViewport');
  const image = document.getElementById('mapImage');
  const marker = document.getElementById('marker');
  const markerLabel = document.getElementById('markerLabel');
  const crosshair = document.getElementById('crosshair');
  const coordinateLabel = document.getElementById('coordinateLabel');
  const crosshairCoordinates = document.getElementById('crosshairCoordinates');
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
  const searchFeedback = document.getElementById('searchFeedback');
  const searchResults = document.getElementById('searchResults');
  const mainControlsRow = document.getElementById('mainControlsRow');
  const confirmRow = document.getElementById('confirmRow');
  const markerDialog = document.getElementById('markerDialog');
  const markerTextInput = document.getElementById('markerText');
  const playerNameButton = document.getElementById('playerNameButton');
  const identityDialog = document.getElementById('identityDialog');
  const identityForm = document.getElementById('identityForm');
  const playerNameInput = document.getElementById('playerNameInput');
  const identityFeedback = document.getElementById('identityFeedback');
  const cancelIdentityButton = document.getElementById('cancelIdentityButton');
  const colorOptions = [...document.querySelectorAll('.color-option')];
  const exportCanvas = document.getElementById('exportCanvas');
  const defaultMarkerColor = '#d9b45b';
  const manualStreetStorageKey = 'mappa-manual-streets';
  const genericSearchWords = new Set(['VIA', 'VIALE', 'CONTRADA', 'CORSO', 'PIAZZA', 'STRADA', 'C', 'CDA', 'DA', 'LE', 'AVV', 'DOTTOR', 'SS', 'SP']);
  let incrementalSearchTimer = 0;
  let pendingStreetPoint = null;

  document.body.append(streetPointDialog, streetListDialog);

  const state = {
    scale: 1,
    minScale: 1,
    maxScale: 5,
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
    playerName: ''
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function normalizeText(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  }

  function setPlayerName(value, persist = true) {
    state.playerName = value.trim().replace(/\s+/g, ' ').slice(0, 50);
    playerNameButton.textContent = state.playerName || 'Inserisci nome';
    if (persist && state.playerName) {
      try {
        localStorage.setItem('mappa-player-name', state.playerName);
      } catch (error) {
        identityFeedback.textContent = 'Nome valido solo per questa sessione.';
      }
    }
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

  function fitImage() {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const coverScale = Math.max(stage.clientWidth / image.naturalWidth, stage.clientHeight / image.naturalHeight);
    state.minScale = coverScale;
    state.maxScale = coverScale * 5;
    state.scale = coverScale;
    state.x = (stage.clientWidth - image.naturalWidth * state.scale) / 2;
    state.y = (stage.clientHeight - image.naturalHeight * state.scale) / 2;
    constrain();
    render();
  }

  function constrain() {
    const width = image.naturalWidth * state.scale;
    const height = image.naturalHeight * state.scale;
    const minX = Math.min(0, stage.clientWidth - width);
    const minY = Math.min(0, stage.clientHeight - height);
    state.x = clamp(state.x, minX, 0);
    state.y = clamp(state.y, minY, 0);
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

  function updateCrosshairCoordinates() {
    const coordinates = getCrosshairCoordinates();
    coordinateLabel.textContent = state.markerPlaced ? 'Punto fissato' : 'Coordinate mirino';
    crosshairCoordinates.value = coordinates
      ? `x ${coordinates.x.toFixed(6)} · y ${coordinates.y.toFixed(6)}`
      : 'x — · y —';
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
    streetPointCoordinates.textContent = `x ${pendingStreetPoint.x.toFixed(6)} · y ${pendingStreetPoint.y.toFixed(6)}`;
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

  function setMarkerVisual() {
    const markerBackground = state.markerColors.length === 2
      ? `linear-gradient(90deg, ${state.markerColors[0]} 0 50%, ${state.markerColors[1]} 50% 100%)`
      : state.markerColors[0] || 'transparent';
    marker.style.setProperty('--marker-background', markerBackground);
    marker.style.setProperty('--marker-border-width', state.markerColors.length === 0 ? '2px' : '0px');
    marker.style.setProperty('--marker-border-color', state.markerColors.length === 0 ? '#ffffff' : 'transparent');
    marker.style.setProperty('--marker-outline', state.markerColors.includes('#ffffff') ? '#17191f' : 'transparent');
    markerLabel.textContent = state.markerText;
    markerLabel.classList.toggle('hidden', !state.markerText);
    colorOptions.forEach((button) => {
      const selected = button.dataset.color === 'none'
        ? state.markerColors.length === 0
        : state.markerColors.includes(button.dataset.color);
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function openMarkerDialog() {
    markerTextInput.value = state.markerText;
    setMarkerVisual();
    markerDialog.classList.remove('hidden');
    markerTextInput.focus();
  }

  function closeMarkerDialog() {
    markerDialog.classList.add('hidden');
  }

  function placeMarker() {
    state.markerText = markerTextInput.value.trim().slice(0, 12);
    state.markerPlaced = true;
    setMarkerVisual();
    marker.classList.remove('hidden');
    crosshair.classList.add('hidden');
    mainControlsRow.classList.add('hidden');
    confirmRow.classList.remove('hidden');
    closeMarkerDialog();
    updateCrosshairCoordinates();
    setStatus(state.markerText ? `Punto selezionato • ${state.markerText}` : 'Punto selezionato');
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

  function resetMap() {
    state.markerPlaced = false;
    state.markerColors = [defaultMarkerColor];
    state.markerText = '';
    markerTextInput.value = '';
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
  document.getElementById('moveButton').addEventListener('click', enableMarkerMove);
  document.getElementById('resetButton').addEventListener('click', resetMap);
  document.getElementById('cancelMarkerButton').addEventListener('click', closeMarkerDialog);
  document.getElementById('cancelMarkerButtonSecondary').addEventListener('click', closeMarkerDialog);
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
  colorOptions.forEach((button) => button.addEventListener('click', () => {
    const color = button.dataset.color;
    if (color === 'none') {
      state.markerColors = [];
    } else if (state.markerColors.includes(color)) {
      state.markerColors = state.markerColors.filter((selectedColor) => selectedColor !== color);
    } else if (state.markerColors.length >= 2) {
      state.markerColors = [state.markerColors[1], color];
    } else {
      state.markerColors = [...state.markerColors, color];
    }
    setMarkerVisual();
  }));
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
    if (event.key === 'Escape' && !markerDialog.classList.contains('hidden')) closeMarkerDialog();
    if (event.key === 'Escape' && !identityDialog.classList.contains('hidden')) closeIdentityDialog();
    if (event.key === 'Escape' && !streetPointDialog.classList.contains('hidden')) closeStreetPointDialog();
    if (event.key === 'Escape' && !streetListDialog.classList.contains('hidden')) closeManualStreetPointList();
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

  function drawExportMarker(ctx, centerX, centerY) {
    if (state.markerColors.length) {
      if (state.markerColors.length === 2) {
        const gradient = ctx.createLinearGradient(centerX - 12, centerY, centerX + 12, centerY);
        gradient.addColorStop(0, state.markerColors[0]);
        gradient.addColorStop(.5, state.markerColors[0]);
        gradient.addColorStop(.5, state.markerColors[1]);
        gradient.addColorStop(1, state.markerColors[1]);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = state.markerColors[0];
      }
      ctx.strokeStyle = state.markerColors.includes('#ffffff') ? '#17191f' : 'transparent';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (state.markerText) {
      ctx.font = '700 28px sans-serif';
      const labelWidth = ctx.measureText(state.markerText).width + 34;
      const labelX = centerX - labelWidth / 2;
      const labelY = centerY - 108;
      ctx.fillStyle = 'rgba(8,11,16,.9)';
      ctx.beginPath();
      roundedRectPath(ctx, labelX, labelY, labelWidth, 52, 18);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(state.markerText, centerX, labelY + 35);
      ctx.textAlign = 'start';
    }
  }

  async function createExportBlob() {
    const outputWidth = 1400;
    const outputHeight = 1800;
    const ctx = exportCanvas.getContext('2d');
    exportCanvas.width = outputWidth;
    exportCanvas.height = outputHeight;
    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    const stageRatioX = outputWidth / stage.clientWidth;
    const stageRatioY = outputHeight / stage.clientHeight;
    ctx.drawImage(
      image,
      state.x * stageRatioX,
      state.y * stageRatioY,
      image.naturalWidth * state.scale * stageRatioX,
      image.naturalHeight * state.scale * stageRatioY
    );

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
    ctx.fillText(state.playerName || 'CACCIA AL TESORO', 54, 124);
    drawExportMarker(ctx, outputWidth / 2, outputHeight / 2);

    const now = new Date();
    ctx.fillStyle = 'rgba(8,11,16,.76)';
    ctx.beginPath();
    roundedRectPath(ctx, 48, outputHeight - 118, outputWidth - 96, 70, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 25px sans-serif';
    ctx.fillText(`Punto indicato • ${now.toLocaleDateString('it-IT')} ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`, 78, outputHeight - 74);

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
    const safeName = normalizeText(state.playerName || 'caccia al tesoro').toLowerCase().replace(/\s+/g, '-');
    return { blob, file: new File([blob], `mappa-${safeName}-${Date.now()}.png`, { type: 'image/png' }) };
  }

  document.getElementById('shareButton').addEventListener('click', async () => {
    setStatus('Preparazione immagine…');
    try {
      const { blob, file } = await exportFile();
      if (canShareFile(file)) {
        await navigator.share({ files: [file], title: `Punto sulla mappa - ${state.playerName}` });
        setStatus('Immagine condivisa');
      } else if (await copyBlobToClipboard(blob)) {
        setStatus('Immagine copiata: incollala nell’app desiderata');
      } else {
        downloadBlob(blob, file.name);
        setStatus('PNG scaricato');
      }
    } catch (error) {
      setStatus(error.name === 'AbortError' ? 'Punto selezionato' : 'Condivisione non riuscita');
    }
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
        await navigator.share({ files: [file], title: `Punto sulla mappa - ${state.playerName}` });
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
  window.addEventListener('resize', fitImage);
  setMarkerVisual();
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
