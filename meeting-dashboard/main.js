const gridEl = document.getElementById('grid');
const deptEl = document.getElementById('select-dept');
const countryEl = document.getElementById('select-country');
const btnMeeting = document.getElementById('btn-meeting');
const btnFullscreen = document.getElementById('btn-fullscreen');
const btnSave = document.getElementById('btn-save');
const btnReset = document.getElementById('btn-reset');
const btnAdd = document.getElementById('btn-add');
const yearEl = document.getElementById('year');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const fieldType = document.getElementById('field-type');
const fieldSize = document.getElementById('field-size');
const fieldTitle = document.getElementById('field-title');
const fieldContent = document.getElementById('field-content');

yearEl.textContent = String(new Date().getFullYear());

const STORAGE_PREFIX = 'ops_dash_v1';

const DEFAULT_VIEWS = {
  'all|global': [
    { id: generateId(), type: 'kpi', size: 'md', title: 'Total Cost Reduction (YoY)', content: { value: 6.8, unit: '%', delta: '+1.2pp' } },
    { id: generateId(), type: 'chart', size: 'lg', title: 'On-Time Delivery Trend', content: { series: [92, 93, 95, 94, 96, 97, 98], unit: '%', labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'] } },
    { id: generateId(), type: 'risk', size: 'md', title: 'Top Risks', content: [ 'Supplier X capacity constraints', 'Semiconductor lead-time volatility', 'Regulatory change in EMEA' ] },
    { id: generateId(), type: 'okr', size: 'md', title: 'Quarterly OKRs', content: [ 'Reduce COGS by 2%', 'Increase OEE to 87%', 'Launch India CoE for Analytics' ] },
  ],
  'manufacturing|india': [
    { id: generateId(), type: 'kpi', size: 'md', title: 'OEE (India plants)', content: { value: 86.4, unit: '%', delta: '+0.9pp' } },
    { id: generateId(), type: 'table', size: 'lg', title: 'Line Utilization by Plant', content: { headers: ['Plant','Utilization','Downtime (hrs)'], rows: [['Pune A','89%','12'], ['Chennai B','84%','16'], ['Noida C','81%','19']] } },
    { id: generateId(), type: 'notes', size: 'sm', title: 'Actions (VP, India)', content: '1) Approve vendor consolidation plan. 2) Kickoff TPM in Noida. 3) Align HR on upskilling budget.' },
  ],
};

let editingWidgetId = null; // for edit mode within modal

function generateId() {
  return 'w_' + Math.random().toString(36).slice(2, 10);
}

function getViewKey() {
  return `${deptEl.value}|${countryEl.value}`;
}

function storageKey() {
  return `${STORAGE_PREFIX}:${getViewKey()}`;
}

function loadView() {
  const key = storageKey();
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse stored view, resetting.', e);
      localStorage.removeItem(key);
    }
  }
  const def = DEFAULT_VIEWS[getViewKey()] || [];
  return def;
}

function saveView(widgets) {
  localStorage.setItem(storageKey(), JSON.stringify(widgets));
}

function resetView() {
  localStorage.removeItem(storageKey());
  render();
}

function parseMaybeJson(text) {
  if (!text) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function widgetSizeClass(size) {
  switch (size) {
    case 'sm': return 'col-span-1';
    case 'md': return 'col-span-1';
    case 'lg': return 'md:col-span-2 xl:col-span-3';
    default: return 'col-span-1';
  }
}

function kpiContentHtml(content) {
  const value = content?.value ?? '—';
  const unit = content?.unit ?? '';
  const delta = content?.delta ?? '';
  return `<div class="flex items-end gap-2"><div class="text-3xl font-semibold">${value}${unit}</div><div class="text-sm text-gray-500">${delta}</div></div>`;
}

function chartContentHtml(content) {
  const series = Array.isArray(content?.series) ? content.series : [];
  const max = Math.max(100, ...series);
  const labels = content?.labels || series.map((_, i) => String(i + 1));
  return `
    <div class="h-32 flex items-end gap-1">
      ${series.map(v => `<div class="flex-1 bg-brand/30" style="height:${(v/max)*100}%"></div>`).join('')}
    </div>
    <div class="mt-1 flex text-[10px] text-gray-500 justify-between">${labels.map(l=>`<span>${l}</span>`).join('')}</div>
  `;
}

function tableContentHtml(content) {
  const headers = content?.headers || [];
  const rows = content?.rows || [];
  return `
    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead><tr>${headers.map(h=>`<th class="text-left font-medium text-gray-600 pr-6 py-1">${h}</th>`).join('')}</tr></thead>
        <tbody class="divide-y">${rows.map(r=>`<tr>${r.map(c=>`<td class="pr-6 py-1">${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}

function listContentHtml(items) {
  const arr = Array.isArray(items) ? items : String(items || '').split(/\n|;|,\s*/).filter(Boolean);
  return `<ul class="list-disc pl-5 text-sm">${arr.map(i=>`<li>${i}</li>`).join('')}</ul>`;
}

function notesContentHtml(text) {
  const t = typeof text === 'string' ? text : JSON.stringify(text);
  return `<div class="prose max-w-none text-sm whitespace-pre-wrap">${escapeHtml(t)}</div>`;
}

function okrContentHtml(items) {
  return listContentHtml(items);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function render() {
  const widgets = loadView();
  gridEl.innerHTML = '';
  widgets.forEach((w) => {
    const card = document.createElement('article');
    card.className = `card bg-white border rounded-lg shadow-sm p-3 ${widgetSizeClass(w.size)}`;
    card.dataset.id = w.id;

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-2';
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="drag-handle edit-only inline-flex h-6 w-6 items-center justify-center rounded border text-gray-500 bg-white" title="Drag to reorder">↕</span>
        <h3 class="font-medium">${escapeHtml(w.title || 'Untitled')}</h3>
      </div>
      <div class="edit-only flex items-center gap-2 text-sm">
        <button class="btn-edit px-2 py-1 rounded border hover:bg-gray-50">Edit</button>
        <button class="btn-del px-2 py-1 rounded border text-red-600 hover:bg-red-50">Delete</button>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'text-sm text-gray-800';
    body.innerHTML = renderBodyHtml(w);

    card.appendChild(header);
    card.appendChild(body);
    gridEl.appendChild(card);

    // Wire actions
    header.querySelector('.btn-edit')?.addEventListener('click', () => openEditModal(w.id));
    header.querySelector('.btn-del')?.addEventListener('click', () => deleteWidget(w.id));
  });

  enableDrag();
}

function renderBodyHtml(w) {
  const c = w.content;
  switch (w.type) {
    case 'kpi': return kpiContentHtml(c);
    case 'chart': return chartContentHtml(c);
    case 'table': return tableContentHtml(c);
    case 'notes': return notesContentHtml(c);
    case 'risk': return listContentHtml(c);
    case 'okr': return okrContentHtml(c);
    default: return notesContentHtml('Unsupported type');
  }
}

function enableDrag() {
  if (typeof Sortable === 'undefined') return;
  Sortable.create(gridEl, {
    animation: 150,
    handle: '.drag-handle',
    draggable: '.card',
    onEnd: persistOrder,
  });
}

function persistOrder() {
  const order = Array.from(gridEl.querySelectorAll('.card')).map(card => card.dataset.id);
  const widgets = loadView();
  const map = Object.fromEntries(widgets.map(w => [w.id, w]));
  const reordered = order.map(id => map[id]).filter(Boolean);
  saveView(reordered);
}

function addWidget(widget) {
  const widgets = loadView();
  widgets.push(widget);
  saveView(widgets);
  render();
}

function deleteWidget(id) {
  const widgets = loadView().filter(w => w.id !== id);
  saveView(widgets);
  render();
}

function openCreateModal() {
  editingWidgetId = null;
  modalTitle.textContent = 'Add widget';
  fieldType.value = 'kpi';
  fieldSize.value = 'md';
  fieldTitle.value = '';
  fieldContent.value = '';
  openModal();
}

function openEditModal(id) {
  const widgets = loadView();
  const w = widgets.find(x => x.id === id);
  if (!w) return;
  editingWidgetId = id;
  modalTitle.textContent = 'Edit widget';
  fieldType.value = w.type;
  fieldSize.value = w.size;
  fieldTitle.value = w.title || '';
  fieldContent.value = typeof w.content === 'string' ? w.content : JSON.stringify(w.content, null, 2);
  openModal();
}

function openModal() { modal.classList.remove('hidden'); modal.classList.add('flex'); }
function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }

function saveModal() {
  const type = fieldType.value;
  const size = fieldSize.value;
  const title = fieldTitle.value.trim() || 'Untitled';
  const content = parseMaybeJson(fieldContent.value.trim());

  if (!editingWidgetId) {
    addWidget({ id: generateId(), type, size, title, content });
  } else {
    const widgets = loadView();
    const idx = widgets.findIndex(w => w.id === editingWidgetId);
    if (idx >= 0) {
      widgets[idx] = { ...widgets[idx], type, size, title, content };
      saveView(widgets);
      render();
    }
  }
  closeModal();
}

function toggleMeetingMode() {
  document.body.classList.toggle('meeting');
  const isMeeting = document.body.classList.contains('meeting');
  btnMeeting.textContent = isMeeting ? 'Exit meeting' : 'Meeting mode';
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (e) {
    console.warn('Fullscreen not available', e);
  }
}

function saveNow() { persistOrder(); /* order + widgets already in storage */ }

function hydrateDefaultIfEmpty() {
  const key = storageKey();
  if (!localStorage.getItem(key)) {
    const def = DEFAULT_VIEWS[getViewKey()] || [];
    if (def.length) localStorage.setItem(key, JSON.stringify(def));
  }
}

function init() {
  hydrateDefaultIfEmpty();
  render();
}

// Events
btnAdd.addEventListener('click', openCreateModal);
btnSave.addEventListener('click', saveNow);
btnReset.addEventListener('click', resetView);
btnMeeting.addEventListener('click', toggleMeetingMode);
btnFullscreen.addEventListener('click', toggleFullscreen);

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', saveModal);

[deptEl, countryEl].forEach(el => el.addEventListener('change', () => { init(); }));

// Initial defaults: highlight VP India leadership by defaulting country to India
countryEl.value = 'india';

document.addEventListener('DOMContentLoaded', () => {
  init();
});