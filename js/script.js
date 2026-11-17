const TITLES = {
  inicio:'Inicio', 'kasnet-digital':'Kasnet Digital', wallet:'Wallet',
  'kasnet-pos':'Kasnet POS', reporting:'Reporting',
  'sistema-comprobantes':'Sistema de Comprobantes',
  lotes:'Lotes', comprobantes:'Comprobantes', 'comp-detalle':'Detalle Comprobante',
  bandeja:'Bandeja de Revisión',
  anulaciones:'Anulaciones', 'prep-pagos':'Preparación de Pagos',
  'disp-pagos':'Dispersión de Pagos', mantenimiento:'Mantenimiento',
  auditoria:'Auditoría'
};

const _sectionInited = new Set();

async function navTo(id){
  // Lazy-load: si la sección aún no está en el DOM, la carga ahora
  if(!document.getElementById(id)){
    try {
      const res = await fetch(`sections/${id}.html`);
      if(res.ok){
        const html = await res.text();
        const c = document.getElementById('view-container');
        if(c) c.insertAdjacentHTML('beforeend', html);
      }
    } catch(e){ console.warn('No se pudo cargar sección:', id, e); }
  }

  // Init componentes section-específicos (una sola vez)
  if(!_sectionInited.has(id)){
    _sectionInited.add(id);
    if(id === 'lotes') initLotesComponents();
  }

  document.querySelectorAll('.sb-nav a').forEach(a=>a.classList.remove('active'));
  document.querySelectorAll('.grp-head').forEach(a=>a.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));

  const link = document.querySelector(`[data-view="${id}"]`);
  if(link){
    link.classList.add('active');
    const grp = link.closest('.grp');
    if(grp) grp.classList.add('open');
    const subgrp = link.closest('.subgrp');
    if(subgrp) subgrp.classList.add('open');
  }
  const section = document.getElementById(id);
  if(section) section.classList.add('active');
  window.scrollTo(0,0);
}
document.querySelectorAll('.sb-nav a[data-view]').forEach(a=>{
  a.addEventListener('click', ()=>{
    // si el ítem no pertenece a un grupo, contraer los grupos desplegados
    if(!a.closest('.grp')){
      document.querySelectorAll('.sb-nav .grp.open').forEach(g=>g.classList.remove('open'));
    }
    navTo(a.dataset.view);
  });
});

// -"?-"?-"? Sidebar: acordeón de grupos -"?-"?-"?
document.querySelectorAll('.sb-nav .grp-head').forEach(h=>{
  h.addEventListener('click', ()=>{
    const grp = h.parentElement;
    const willOpen = !grp.classList.contains('open');
    if(h.dataset.view) navTo(h.dataset.view); // navTo deja el grupo abierto
    grp.classList.toggle('open', willOpen);   // respeta el toggle del head
  });
});
// -"?-"?-"? Sidebar: subacordeón (nivel 2) -"?-"?-"?
document.querySelectorAll('.sb-nav .subgrp-head').forEach(h=>{
  h.addEventListener('click', ()=>{
    const sg = h.parentElement;
    const willOpen = !sg.classList.contains('open');
    // acordeón exclusivo: cerrar los demás subgrupos del mismo grupo
    const scope = sg.closest('.grp-body-inner') || sg.parentElement;
    scope.querySelectorAll('.subgrp.open').forEach(o=>{ if(o!==sg) o.classList.remove('open'); });
    sg.classList.toggle('open', willOpen);
  });
});
// mantener abierto el grupo que contiene la vista activa
document.querySelectorAll('.sb-nav .grp').forEach(grp=>{
  const link = grp.querySelector('a[data-view].active');
  if(link) grp.classList.add('open');
});
// mantener abierto el subgrupo que contiene la vista activa
document.querySelectorAll('.sb-nav .subgrp').forEach(sg=>{
  const link = sg.querySelector('a[data-view].active');
  if(link) sg.classList.add('open');
});

// -"?-"?-"? Tabs (global) -"?-"?-"?
document.addEventListener('click', e=>{
  const btn = e.target.closest('.tabs button[data-tab]');
  if(!btn) return;
  const wrap = btn.closest('.view, .panel, .pb') || btn.parentElement.parentElement;
  btn.closest('.tabs').querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const tabId = btn.dataset.tab;
  // find tab-panes in the same container
  let container = btn.closest('.pb') || btn.closest('.panel .pb') || btn.closest('.view');
  if(!container){ container = document.getElementById(tabId)?.parentElement; }
  if(container){
    container.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');
  }
});

// -"?-"?-"? Carga de planilla -"?-"?-"?
function startClasif(){
  document.getElementById('carga-panel').style.display='block';
}
function runClasif(){
  const run = document.getElementById('clasif-run');
  run.style.display='block';
  const bar = document.getElementById('clasif-bar');
  const pct = document.getElementById('clasif-pct');
  let p=0;
  const t = setInterval(()=>{
    p += Math.random()*10+4;
    if(p>=100){ p=100; clearInterval(t);
      document.getElementById('clasif-result').style.display='block';
      run.style.display='none';
    }
    bar.style.width=p+'%';
    pct.textContent = Math.round(1482*p/100).toLocaleString()+' de 1,482 registros procesados';
  }, 200);
}

// -"?-"?-"? Modals -"?-"?-"?
function openDetalle(){ document.getElementById('detalleModal').classList.add('open'); }
function closeDetalle(){ document.getElementById('detalleModal').classList.remove('open'); }
function openLote(){ document.getElementById('loteModal').classList.add('open'); }
function closeLote(){ document.getElementById('loteModal').classList.remove('open'); }
document.getElementById('detalleModal').addEventListener('click',e=>{ if(e.target.id==='detalleModal') closeDetalle(); });
document.getElementById('loteModal').addEventListener('click',e=>{ if(e.target.id==='loteModal') closeLote(); });

// -"?-"?-"? Flujo Nuevo lote: paso 0 (reglas) -"?-"?-"?
let _nlmFile = null;
function openNuevoLote(){
  document.getElementById('rulesModal').classList.add('open');
}
function closeRulesModal(){
  document.getElementById('rulesModal').classList.remove('open');
}
function selectRule(row){
  document.querySelectorAll('.rule-row').forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');
  row.querySelector('input[type="radio"]').checked = true;
}
function openNuevoLoteFromRules(){
  closeRulesModal();
  resetNuevoLoteModal();
  document.getElementById('nuevoLoteModal').classList.add('open');
}
document.getElementById('rulesModal').addEventListener('click', e => {
  if(e.target.id === 'rulesModal') closeRulesModal();
});
function closeNuevoLote(){
  document.getElementById('nuevoLoteModal').classList.remove('open');
}
function resetNuevoLoteModal(){
  _nlmFile = null;
  const drop = document.getElementById('nlm-drop-zone');
  const btn  = document.getElementById('nlm-continuar-btn');
  const main = document.getElementById('nlm-drop-main');
  const hint = document.getElementById('nlm-drop-hint');
  const inp  = document.getElementById('nlm-file-input');
  if(inp) inp.value = '';
  drop.classList.remove('has-file');
  main.innerHTML = '<span class="nlm-drop-link">Seleccionar archivo</span><span class="nlm-drop-or"> o arrastrar aquí</span>';
  hint.textContent = 'Formato: Excel (.xlsx, .xls) · Máximo 10,000 registros';
  btn.disabled = true;
  document.getElementById('nlm-step1').style.display = 'block';
  document.getElementById('nlm-step2').style.display = 'none';
}
function handleNuevoLoteFile(file){
  if(!file) return;
  _nlmFile = file;
  const drop = document.getElementById('nlm-drop-zone');
  const btn  = document.getElementById('nlm-continuar-btn');
  const main = document.getElementById('nlm-drop-main');
  const hint = document.getElementById('nlm-drop-hint');
  drop.classList.add('has-file');
  main.innerHTML = '<span class="nlm-drop-link">'+file.name+'</span>';
  hint.textContent = (file.size/1024).toFixed(0)+' KB · listo para cargar';
  btn.disabled = false;
}
function handleNuevoLoteDrop(e){
  e.preventDefault();
  document.getElementById('nlm-drop-zone').classList.remove('nlm-drag-over');
  const file = e.dataTransfer.files[0];
  if(file) handleNuevoLoteFile(file);
}
function continueNuevoLote(){
  const name = _nlmFile ? _nlmFile.name : 'Carga_2026-08.xlsx';
  const size = _nlmFile ? (_nlmFile.size/1024).toFixed(0)+' kb' : '500 kb';
  document.getElementById('nlm-s2-name').textContent = name;
  document.getElementById('nlm-s2-size').textContent = size;
  document.getElementById('nlm-step1').style.display = 'none';
  document.getElementById('nlm-step2').style.display = 'block';
}
function backToStep1(){
  document.getElementById('nlm-step2').style.display = 'none';
  document.getElementById('nlm-step1').style.display = 'block';
  resetNuevoLoteModal();
}
function runClasificacion(){
  const fileName = _nlmFile ? _nlmFile.name : 'Carga_2026-08.xlsx';
  const totalReg = 1482; // registros mock para la demo

  // formatear número con comas
  const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // resetear y poblar elementos del modal
  const fillEl  = document.getElementById('clsf-fill');
  const countEl = document.getElementById('clsf-count');
  const pctEl   = document.getElementById('clsf-pct');
  const fileEl  = document.getElementById('clsf-filename');

  if(fileEl)  fileEl.textContent  = fileName;
  if(fillEl)  fillEl.style.width  = '0%';
  if(countEl) countEl.textContent = `0 de ${fmt(totalReg)} registros`;
  if(pctEl)   pctEl.textContent   = '0%';

  closeNuevoLote();
  document.getElementById('clasifModal').classList.add('open');

  // animación de progreso
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.random() * 5 + 2;   // avance 2-7% por tick
    if(pct >= 100){
      pct = 100;
      clearInterval(timer);
      if(fillEl)  fillEl.style.width  = '100%';
      if(countEl) countEl.textContent = `${fmt(totalReg)} de ${fmt(totalReg)} registros`;
      if(pctEl)   pctEl.textContent   = '100%';
      // cerrar modal y mostrar toast
      setTimeout(() => {
        closeClasifModal();
        showToast('LOT-000071 se ha clasificado correctamente');
      }, 700);
      return;
    }
    const cur = Math.floor(totalReg * pct / 100);
    if(fillEl)  fillEl.style.width  = `${pct}%`;
    if(countEl) countEl.textContent = `${fmt(cur)} de ${fmt(totalReg)} registros`;
    if(pctEl)   pctEl.textContent   = `${Math.round(pct)}%`;
  }, 200);
}
function closeClasifModal(){
  document.getElementById('clasifModal').classList.remove('open');
}
function showToast(message){
  const c = document.getElementById('toast-container');
  if(!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="icon-check-circle"></i><span>${message}</span>`
              + `<button class="toast-close" title="Cerrar"><i class="icon-x"></i></button>`;
  t.querySelector('.toast-close').addEventListener('click', () => removeToast(t));
  c.appendChild(t);
  setTimeout(() => removeToast(t), 5000);
}
function removeToast(t){
  if(!t.isConnected) return;
  t.classList.add('toast-out');
  setTimeout(() => t.remove(), 350);
}
document.getElementById('clasifModal').addEventListener('click', e=>{
  if(e.target.id==='clasifModal') closeClasifModal();
});
document.getElementById('nuevoLoteModal').addEventListener('click', e=>{
  if(e.target.id === 'nuevoLoteModal') closeNuevoLote();
});

// -"?-"?-"? Select all -"?-"?-"?
function toggleAll(cls, on){ document.querySelectorAll('.'+cls).forEach(c=>c.checked=on); }

// -"?-"?-"? Lotes: paginación funcional -"?-"?-"?
function initLotesPagination(){
  let page = 1;
  let size = 20;

  function getRows(){ return Array.from(document.querySelectorAll('#lotes table tbody tr:not(.row-filtered)')); }

  function render(){
    const rows  = getRows();
    const total = rows.length;
    if(!total) return;
    const pages = Math.ceil(total / size);
    page = Math.max(1, Math.min(page, pages));
    const from  = (page - 1) * size;
    const to    = Math.min(from + size, total);

    // mostrar / ocultar filas
    rows.forEach((r, i) => r.style.display = (i >= from && i < to) ? '' : 'none');

    // zebra: posición visual (no DOM) \u2014 replica tr:nth-child(even)
    rows.forEach((r, i) => r.classList.toggle('row-stripe', i >= from && i < to && (i - from) % 2 !== 0));

    // pager-info
    const info = document.querySelector('#lotes .pager-info');
    if(info) info.textContent = `${from + 1}-${to} de ${total} lotes`;

    // reconstruir botones de página
    const ctrls = document.querySelector('#lotes .pager-ctrls');
    if(!ctrls) return;

    let h = `<button onclick="lotesPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    buildRange(page, pages).forEach(p => {
      if(p === '...'){
        h += '<button class="pager-ellipsis" disabled>...</button>';
      } else {
        h += `<button class="${p===page?'active':''}" onclick="lotesPage(${p})">${p}</button>`;
      }
    });
    h += `<button onclick="lotesPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML = h;
  }

  function buildRange(cur, total){
    if(total <= 7) return Array.from({length: total}, (_, i) => i + 1);
    const r = [1];
    if(cur > 3)           r.push('...');
    for(let p = Math.max(2, cur-1); p <= Math.min(total-1, cur+1); p++) r.push(p);
    if(cur < total - 2)   r.push('...');
    r.push(total);
    return r;
  }

  // exponer para onclicks inline
  window.lotesPage = function(p){
    const rows  = getRows();
    const pages = Math.ceil(rows.length / size);
    if(p < 1 || p > pages) return;
    page = p;
    render();
  };

  // items por hoja
  const sel = document.querySelector('#lotes .lotes-footer .float-fld-select select');
  if(sel){
    size = parseInt(sel.value) || 20;   // leer valor inicial del HTML
    sel.addEventListener('change', function(){
      size = parseInt(this.value) || 20;
      page = 1;
      render();
    });
  }

  render(); // estado inicial
  window.lotesRender = render; // exponer para el módulo de filtros
}

// -"?-"?-"? Lotes: filtros funcionales -"?-"?-"?
function initLotesFilters(){
  const sec = document.getElementById('lotes');
  if(!sec) return;

  const inputBuscar = sec.querySelector('.lotes-search-fld input');
  const inputPeriodo = document.getElementById('mp-value');
  const selectEstado = sec.querySelector('.float-fld-select select');
  const btnBuscar   = sec.querySelector('.lotes-buscar-btn');

  function applyFilters(){
    const txt  = (inputBuscar  ? inputBuscar.value.trim().toLowerCase()  : '');
    const per  = (inputPeriodo ? inputPeriodo.value                       : '');
    const est  = (selectEstado ? selectEstado.value.toLowerCase()         : '');

    const allRows = Array.from(document.querySelectorAll('#lotes table tbody tr'));
    allRows.forEach(row => {
      const tds     = row.querySelectorAll('td');
      if(tds.length < 6) return;
      const id      = tds[0].textContent.toLowerCase();
      const archivo = tds[1].textContent.toLowerCase();
      const periodo = tds[2].textContent.trim();
      const badge   = tds[5].querySelector('.badge');
      const bdgCls  = badge ? badge.className : '';

      let match = true;
      // filtro texto: ID lote o nombre archivo
      if(txt && !id.includes(txt) && !archivo.includes(txt)) match = false;
      // filtro período
      if(per && periodo !== per) match = false;
      // filtro estado: valor del select es "l01".."l10", clase del badge es "b-l01".."b-l10"
      if(est && !bdgCls.includes('b-' + est)) match = false;

      row.classList.toggle('row-filtered', !match);
    });

    // volver a la página 1 después del filtro
    if(window.lotesRender) window.lotesRender();
    if(window.updateLotesKPIs) window.updateLotesKPIs();
  }

  function clearFilters(){
    if(inputBuscar)  inputBuscar.value  = '';
    if(inputPeriodo) inputPeriodo.value = '';
    if(selectEstado) selectEstado.value = '';
    // resetear month picker (display + estado interno)
    const mpDisp = document.getElementById('mp-display');
    if(mpDisp) mpDisp.textContent = 'Todos';
    document.querySelectorAll('#lotes table tbody tr').forEach(r => r.classList.remove('row-filtered'));
    if(window.lotesRender)     window.lotesRender();
    if(window.updateLotesKPIs) window.updateLotesKPIs();
  }

  // exponer para onclicks inline
  window.lotesApplyFilters  = applyFilters;
  window.lotesClearFilters  = clearFilters;

  // Botón Buscar
  if(btnBuscar) btnBuscar.addEventListener('click', applyFilters);

  // Enter en el campo de texto
  if(inputBuscar) inputBuscar.addEventListener('keydown', e => { if(e.key === 'Enter') applyFilters(); });

  // Filtro inmediato al cambiar período o estado
  if(inputPeriodo) inputPeriodo.addEventListener('change', applyFilters);
  if(selectEstado) selectEstado.addEventListener('change', applyFilters);
}

// -"?-"?-"? Month Picker (Período) -"?-"?-"?
function initMonthPicker(){
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const MIN_YEAR = 2024, MAX_YEAR = 2026;

  // rango de datos: 2024-11 -?' 2026-08
  function inRange(y, m){
    if(y < MIN_YEAR || y > MAX_YEAR) return false;
    if(y === 2024 && m < 11) return false;
    if(y === 2026 && m > 8)  return false;
    return true;
  }

  const trigger  = document.getElementById('mp-trigger');
  const dropdown = document.getElementById('mp-dropdown');
  const display  = document.getElementById('mp-display');
  const hidden   = document.getElementById('mp-value');
  const yearEl   = document.getElementById('mp-year');
  const grid     = document.getElementById('mp-grid');
  const prevBtn  = document.getElementById('mp-prev');
  const nextBtn  = document.getElementById('mp-next');
  const clearBtn = document.getElementById('mp-clear');

  if(!trigger || !dropdown) return;

  let curYear = 2026;
  let selYear = null, selMonth = null;

  function renderGrid(){
    yearEl.textContent = curYear;
    prevBtn.disabled = (curYear <= MIN_YEAR);
    nextBtn.disabled = (curYear >= MAX_YEAR);
    grid.innerHTML = '';
    MONTHS.forEach((name, i) => {
      const m   = i + 1;
      const btn = document.createElement('button');
      btn.type  = 'button';
      btn.className = 'mp-month';
      btn.textContent = name;
      if(!inRange(curYear, m)){
        btn.classList.add('mp-disabled');
        btn.disabled = true;
      } else {
        if(selYear === curYear && selMonth === m) btn.classList.add('mp-selected');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selYear = curYear; selMonth = m;
          hidden.value = `${curYear}-${String(m).padStart(2,'0')}`;
          display.textContent = `${name} ${curYear}`;
          hidden.dispatchEvent(new Event('change'));
          close();
        });
      }
      grid.appendChild(btn);
    });
  }

  function open(){
    if(selYear) curYear = selYear;
    dropdown.classList.add('open');
    renderGrid();
  }
  function close(){ dropdown.classList.remove('open'); }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? close() : open();
  });
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(curYear > MIN_YEAR){ curYear--; renderGrid(); }
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(curYear < MAX_YEAR){ curYear++; renderGrid(); }
  });
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selYear = null; selMonth = null;
    hidden.value = '';
    display.textContent = 'Todos';
    hidden.dispatchEvent(new Event('change'));
    close();
  });

  // cerrar al hacer clic fuera
  document.addEventListener('click', () => close());
}

// -"?-"?-"? KPIs de lotes \u2014 cálculo desde el tbody -"?-"?-"?
function updateLotesKPIs(){
  // Contar desde las filas visibles (respeta filtros activos)
  const rows = Array.from(document.querySelectorAll('#lotes table tbody tr:not(.row-filtered)'));

  let total = rows.length;
  let enCurso = 0, errores = 0, finalizados = 0;

  rows.forEach(row => {
    const badge = row.querySelector('.badge');
    if(!badge) return;
    const cls = badge.className;
    // L-01..L-07 -?' en curso
    if(/b-l0[1-7](\s|$)/.test(cls))  enCurso++;
    // L-08 -?' completado / finalizado
    else if(cls.includes('b-l08'))    finalizados++;
    // L-09 -?' error
    else if(cls.includes('b-l09'))    errores++;
    // L-10 Cancelado: no aparece en ningún KPI
  });

  const el = id => document.getElementById(id);
  if(el('kpi-total'))      el('kpi-total').textContent      = total;
  if(el('kpi-encurso'))    el('kpi-encurso').textContent    = enCurso;
  if(el('kpi-errores'))    el('kpi-errores').textContent    = errores;
  if(el('kpi-finalizados'))el('kpi-finalizados').textContent = finalizados;
}
window.updateLotesKPIs = updateLotesKPIs;
// updateLotesKPIs() se llama tras cargar la sección lotes

// -"?-"?-"? Drawer: Gestionar lote -"?-"?-"?
const _DRW_STEPS_DONE = {
  'l01':1,'l02':1,'l03':2,'l04':2,
  'l05':3,'l06':3,'l07':4,'l08':5,
  'l09':1,  // Creado OK, falló durante Clasificación
  'l10':0
};
const _DRW_LABELS = ['0. Creado','1. Clasificado','2. Emitido','3. Pagado','4. Completado'];
const _DRW_ACTION = {
  'l01':'Clasificar lote','l02':'Clasificar lote',
  'l03':'Emitir lote',    'l04':'Emitir lote',
  'l05':'Gestionar pagos','l06':'Gestionar pagos',
  'l07':'Completar lote',
  'l09':'Volver a clasificar'
};

function openDrawer(btn){
  const tr   = btn.closest('tr');
  const tds  = tr.querySelectorAll('td');
  const lotId = tds[0].textContent.trim();
  const file  = tds[1].textContent.trim();
  const period= tds[2].textContent.trim();
  const regs  = tds[3].textContent.trim();
  const comps = tds[4].textContent.trim();
  const badge = tds[5].querySelector('.badge');
  const user  = tds[7].textContent.trim();
  const date  = tds[8].textContent.trim();
  const stCode= [...badge.classList].find(c=>/^b-l\d+$/.test(c))?.replace('b-','') || 'l01';

  // cabecera
  document.getElementById('drw-lot-id').textContent   = lotId;
  document.getElementById('drw-filename').textContent = file;
  const drwBadge = document.getElementById('drw-badge');
  drwBadge.className = badge.className;
  drwBadge.innerHTML = badge.innerHTML;

  // info
  document.getElementById('drw-info-file').textContent   = file;
  document.getElementById('drw-info-period').textContent = period;
  document.getElementById('drw-info-regs').textContent   = regs;
  document.getElementById('drw-info-comp').textContent   = comps;
  document.getElementById('drw-info-date').textContent   = date;
  document.getElementById('drw-info-user').textContent   = user;

  // isTransition: declarado aquí para ser accesible en timeline, proc section y action button
  const isTransition = stCode === 'l02' || stCode === 'l04' || stCode === 'l06';

  // timeline
  const stepsDone = _DRW_STEPS_DONE[stCode] ?? 0;
  const tl = document.getElementById('drw-timeline');
  tl.innerHTML = '';
  _DRW_LABELS.forEach((label, i) => {
    const done    = i < stepsDone;
    const isErr   = stCode === 'l09' && i === stepsDone;
    const isProc  = isTransition && i === stepsDone;       // step en curso
    const cur     = !isErr && !isProc && i === stepsDone && stepsDone < _DRW_LABELS.length;
    const last    = i === _DRW_LABELS.length - 1;
    const el      = document.createElement('div');
    el.className  = 'drw-step';
    const dotCls  = done?'done':isErr?'err':isProc?'proc':cur?'cur':'';
    const dotTxt  = done?'\u2713':isErr?'\u2022':i;
    const stTxt   = done?'Completado':isErr?'Error':isProc?'En proceso':'';
    const stCls   = done?'ok':isErr?'err-status':isProc?'proc-status':'';
    el.innerHTML  = `
      <div class="drw-step-left">
        <div class="drw-step-dot ${dotCls}">${dotTxt}</div>
        ${!last?`<div class="drw-step-line ${done?'done':''}"></div>`:''}
      </div>
      <div class="drw-step-content">
        <div class="drw-step-row">
          <span class="drw-step-title">${label}</span>
          <span class="drw-step-status ${stCls}">${stTxt}</span>
        </div>
        ${done ?`<div class="drw-step-date">${date}</div>`:''}
        ${isErr?`<div class="drw-step-date drw-step-err-msg">Falló durante la clasificación</div>`:''}
      </div>`;
    tl.appendChild(el);
  });

  // Sección de progreso (L-02 y L-04 \u2014 estados de transición)
  const procSection = document.getElementById('drw-proc-section');
  const procTitle   = document.getElementById('drw-proc-title');
  const progFill    = document.getElementById('drw-prog-fill');
  const progCount   = document.getElementById('drw-prog-count');
  const progPct     = document.getElementById('drw-prog-pct');
  // isTransition ya declarado arriba
  if(procSection){
    if(isTransition){
      const totalReg = parseInt((regs||'0').replace(/,/g,'')) || 1482;
      const lotNum   = parseInt(lotId.replace(/\D/g,'')) || 0;
      const pct      = 10 + (lotNum * 13) % 80;
      const processed= Math.floor(totalReg * pct / 100);
      const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
      procTitle.textContent = stCode === 'l02' ? 'Clasificando...' : 'Enviando a OSE...';
      progFill.style.width  = `${pct}%`;
      progCount.textContent = `${fmt(processed)} de ${fmt(totalReg)} registros`;
      progPct.textContent   = `${pct}%`;
      procSection.classList.remove('d-none');
    } else {
      procSection.classList.add('d-none');
    }
  }

  // Motivo del error (L-09)
  const _ERROR_REASONS = [
    'Timeout: el procesamiento excedió el límite de 15 minutos. El archivo puede ser muy grande.',
    'Error de clasificación: columna "Segmentación" contiene valores no reconocidos (fila 1,203).',
    'Error de DynamoDB: no se pudo persistir el lote después de 3 reintentos (ThrottlingException).',
    'Error de S3: acceso denegado al leer el archivo CSV durante la clasificación (Access Denied).',
    'Error al procesar el CSV: RUC inválido detectado en la fila 847 (20 dígitos recibidos).',
    'Validación de catálogos: 23 registros con código de ubigeo no encontrado en la tabla.',
    'Excepción no controlada en BatchLoadService: NullReferenceException en la fila 412.',
  ];
  const errorSection = document.getElementById('drw-error-section');
  const errorReason  = document.getElementById('drw-error-reason');
  if(errorSection && errorReason){
    if(stCode === 'l09'){
      const lotNum = parseInt(lotId.replace(/\D/g,'')) || 0;
      errorReason.textContent = _ERROR_REASONS[lotNum % _ERROR_REASONS.length];
      errorSection.classList.remove('d-none');
    } else {
      errorSection.classList.add('d-none');
    }
  }

  // botón de acción (oculto para estados de transición)
  const actBtn = document.getElementById('drw-btn-action');
  actBtn.textContent = _DRW_ACTION[stCode] || 'Gestionar';
  actBtn.style.display = (_DRW_ACTION[stCode] && !isTransition) ? '' : 'none';
  // Emitir -?' modal de emisión; Gestionar pagos -?' modal de pago; Completar -?' finalizar; otros -?' sin handler
  _emitirLotId = lotId;
  if(_DRW_ACTION[stCode] === 'Clasificar lote')      actBtn.onclick = openClasificarModal;
  else if(_DRW_ACTION[stCode] === 'Emitir lote')     actBtn.onclick = openEmitirModal;
  else if(_DRW_ACTION[stCode] === 'Gestionar pagos') actBtn.onclick = openPagarModal;
  else if(_DRW_ACTION[stCode] === 'Completar lote')  actBtn.onclick = openFinalizarModal;
  else                                               actBtn.onclick = null;

  // "Cancelar lote": habilitado solo cuando el lote está en Error (L-09)
  const cancelBtn = document.querySelector('.drw-btn-cancel');
  if(cancelBtn) cancelBtn.disabled = (stCode !== 'l09');

  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('lote-drawer').classList.add('open');
}

function closeDrawer(){
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById('lote-drawer').classList.remove('open');
}

function downloadLoteExcel(){
  const lotId   = document.getElementById('drawer-lot-id')?.textContent.trim() || 'lote';
  const lotFile = document.querySelector('.drawer-filename')?.textContent.trim() || 'lote.xlsx';
  showToast(`Descargando ${lotFile} (${lotId})-?-`);
}
document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

// -"?-"?-"? Carga dinámica de secciones -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
// Requiere servidor local (VS Code Live Server o `npx serve .`)
// -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
const SECTION_IDS = [
  'inicio','kasnet-digital','wallet','sistema-comprobantes',
  'lotes','comprobantes','bandeja','anulaciones',
  'prep-pagos','disp-pagos','mantenimiento','auditoria',
  'kasnet-pos','reporting'
];

async function loadSections(){
  const container = document.getElementById('view-container');
  if(!container) return;
  await Promise.all(
    SECTION_IDS.map(id =>
      fetch(`sections/${id}.html`)
        .then(r => r.ok ? r.text() : '')
        .then(html => { if(html) container.insertAdjacentHTML('beforeend', html); })
        .catch(() => {})
    )
  );
}

function initLotesComponents(){
  initLotesPagination();
  initLotesFilters();
  initMonthPicker();
  updateLotesKPIs();
}

// Startup: secciones ya están en DOM (inyectadas por scripts síncronos)
initLotesComponents();
_sectionInited.add('lotes');
initCompComponents();
_sectionInited.add('comprobantes');
initAnulacionesComponents();
initBandejaComponents();
initBandejaPagosComponents();
initPppComponents();
initPpComponents();

// ── Vista por comprobantes (pp-table) ───────────────────────
function initPpPagination(){
  if(!document.getElementById('pp-table')) return;
  let page=1, size=20;
  function getRows(){ return Array.from(document.querySelectorAll('#pp-table tbody tr:not(.row-filtered)')); }
  function render(){
    const rows=getRows(), total=rows.length;
    const pages=Math.max(1,Math.ceil(total/size));
    page=Math.max(1,Math.min(page,pages));
    const from=(page-1)*size, to=Math.min(from+size,total);
    document.querySelectorAll('#pp-table tbody tr').forEach(r=>{ if(!r.classList.contains('row-filtered')) r.style.display='none'; });
    rows.forEach((r,i)=>{ r.style.display=(i>=from&&i<to)?'':'none'; r.classList.toggle('row-stripe',i>=from&&i<to&&(i-from)%2!==0); });
    const info=document.getElementById('pp-pager-info');
    if(info) info.textContent=total?`${from+1}-${to} de ${total} comprobantes`:'0 comprobantes';
    const ctrls=document.getElementById('pp-pager-ctrls');
    if(!ctrls) return;
    function range(cur,tot){
      if(tot<=7) return Array.from({length:tot},(_,i)=>i+1);
      const r=[1]; if(cur>3) r.push('...');
      for(let p=Math.max(2,cur-1);p<=Math.min(tot-1,cur+1);p++) r.push(p);
      if(cur<tot-2) r.push('...'); r.push(tot); return r;
    }
    let h=`<button onclick="ppPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    range(page,pages).forEach(p=>{
      if(p==='...') h+='<button class="pager-ellipsis" disabled>...</button>';
      else h+=`<button class="${p===page?'active':''}" onclick="ppPage(${p})">${p}</button>`;
    });
    h+=`<button onclick="ppPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML=h;
  }
  window.ppPage=p=>{ const pages=Math.ceil(getRows().length/size); if(p<1||p>pages) return; page=p; render(); };
  const sel=document.getElementById('pp-page-size');
  if(sel){ size=parseInt(sel.value)||20; sel.addEventListener('change',function(){ size=parseInt(this.value)||20; page=1; render(); }); }
  render(); window.ppRender=render;
}

function initPpFilters(){
  if(!document.getElementById('pp-table')) return;
  const inp     = document.getElementById('pp-search');
  const selSunat= document.getElementById('pp-sunat');
  const selEst  = document.getElementById('pp-estado');
  const btnB    = document.getElementById('pp-buscar-btn');
  const btnL    = document.getElementById('pp-limpiar-btn');
  // Cols: 0=ID Lote|1=RUC|2=Agente|3=N°Comp|4=Monto sis|5=Monto SUNAT|6=IGV|7=Detrac|8=Estado|9=Retenido|10=Cruce|11=Prog|12=Acc
  function apply(){
    const txt   = inp      ? inp.value.trim().toLowerCase()   : '';
    const sunat = selSunat ? selSunat.value                   : '';
    const est   = selEst   ? selEst.value                     : '';
    document.querySelectorAll('#pp-table tbody tr').forEach(row=>{
      const tds=row.querySelectorAll('td');
      if(tds.length<9) return;
      const lote  = tds[0].textContent.toLowerCase();
      const ruc   = tds[1].textContent.toLowerCase();
      const comp  = tds[3].textContent.toLowerCase();
      const badge = tds[8].querySelector('[data-state]');
      const st    = badge ? badge.dataset.state : '';
      const sunatTxt = tds[10].textContent.trim();      let m=true;
      if(txt   && !lote.includes(txt)&&!ruc.includes(txt)&&!comp.includes(txt)) m=false;
      if(sunat && sunatTxt!==sunat)  m=false;
      if(est   && st!==est)          m=false;
      row.classList.toggle('row-filtered',!m);
    });
    if(window.ppRender) window.ppRender();
  }
  function clear(){
    if(inp)      inp.value='';
    if(selSunat) { selSunat.selectedIndex=0; selSunat.dispatchEvent(new Event('change')); }
    if(selEst)   { selEst.selectedIndex=0;   selEst.dispatchEvent(new Event('change')); }
    document.querySelectorAll('#pp-table tbody tr').forEach(r=>r.classList.remove('row-filtered'));
    if(window.ppRender) window.ppRender();
  }
  if(btnB) btnB.addEventListener('click', apply);
  if(btnL) btnL.addEventListener('click', clear);
  if(inp)  inp.addEventListener('keydown', e=>{ if(e.key==='Enter') apply(); });
  if(selSunat) selSunat.addEventListener('change', apply);
  if(selEst)   selEst.addEventListener('change', apply);
}

function initPpComponents(){
  initPpPagination();
  initPpFilters();
  applyDateBadges('#pp-table');
  applyMutedProg('#pp-table', 8, 11, function(st){ return st === 'C-16'; });
}

function openPpCompDetalle(btn){
  const row = btn.closest('tr');
  const tds = row.querySelectorAll('td');
  // Cols: 0=ID Lote|1=RUC|2=Agente|3=N°Comp|4=Monto sis|5=Monto SUNAT|6=IGV|7=Detrac|8=Estado|9=Retenido|10=Cruce|11=Prog|12=Acc
  const lote    = tds[0]?.textContent.trim() || '—';
  const ruc     = tds[1]?.textContent.trim() || '—';
  const agente  = tds[2]?.textContent.trim() || '—';
  const comp    = tds[3]?.textContent.trim() || '—';
  const monSis  = tds[4]?.textContent.trim() || '—';
  const monSun  = tds[5]?.textContent.trim() || '—';
  const igv     = tds[6]?.textContent.trim() || '—';
  const detrac  = tds[7]?.textContent.trim() || '—';
  const badge   = tds[8]?.querySelector('[data-state]');
  const estTxt  = badge?.textContent.trim() || '—';
  const reten   = tds[9]?.textContent.trim() || '—';
  const cruce   = tds[10]?.textContent.trim() || '—';
  const prog    = tds[11]?.dataset?.raw || tds[11]?.textContent.trim() || '—';

  document.getElementById('ppcd-comp').textContent   = comp;
  document.getElementById('ppcd-agente').textContent = agente;
  document.getElementById('ppcd-lote').textContent   = lote;
  document.getElementById('ppcd-num').textContent    = comp;
  document.getElementById('ppcd-ruc').textContent    = ruc;
  document.getElementById('ppcd-ag').textContent     = agente;
  document.getElementById('ppcd-monto-sis').textContent   = monSis;
  document.getElementById('ppcd-monto-sunat').textContent = monSun;
  document.getElementById('ppcd-sunat').textContent       = cruce;
  document.getElementById('ppcd-igv').textContent         = igv;
  document.getElementById('ppcd-detrac').textContent      = detrac;

  // Toggle retención
  const check = document.getElementById('ppcd-reten-check');
  const hint  = document.getElementById('ppcd-reten-hint');
  const isReten = reten === 'Retenido';
  if(check){ check.checked = isReten; }
  if(hint){
    hint.textContent = isReten
      ? 'El comprobante no avanzar\u00e1 a programaci\u00f3n mientras est\u00e9 retenido.'
      : 'El comprobante est\u00e1 aprobado para pago.';
  }
  // Mostrar/ocultar campo de motivo según estado de retención
  const motivoWrap = document.getElementById('ppcd-motivo-wrap');
  const motivoSel  = document.getElementById('ppcd-motivo-sel');
  const motivoCnt  = document.getElementById('ppcd-motivo-cnt');
  if(motivoWrap){ motivoWrap.classList.toggle('visible', isReten); }
  if(motivoSel){ motivoSel.value = ''; }
  if(motivoCnt){ motivoCnt.textContent = '00/30'; }

  const stWrap = document.getElementById('ppcd-estado-wrap');
  stWrap.innerHTML = '';
  if(badge) stWrap.appendChild(badge.cloneNode(true));

  // Reset datepicker display
  const fi = document.getElementById('ppcd-fecha');
  const fd = document.getElementById('ppcd-fecha-display');
  if(fi) fi.value = prog.match(/\d{4}-\d{2}-\d{2}/) ? prog : '';
  if(fd) fd.value = prog !== '—' && prog.match(/\d{4}-\d{2}-\d{2}/) ?
    String(new Date(prog).getDate()).padStart(2,'0') + '/' +
    String(new Date(prog).getMonth()+1).padStart(2,'0') + '/' +
    new Date(prog).getFullYear() : '';

  document.getElementById('pp-comp-drw-overlay').classList.add('open');
  document.getElementById('pp-comp-drw').classList.add('open');
  initKnDatePicker('ppcd-dp-panel', 'ppcd-fecha-display', 'ppcd-fecha');
}

function closePpCompDrawer(){
  document.getElementById('pp-comp-drw-overlay').classList.remove('open');
  document.getElementById('pp-comp-drw').classList.remove('open');
}

function toggleRetencion(chk){
  const hint = document.getElementById('ppcd-reten-hint');
  const wrap = document.getElementById('ppcd-motivo-wrap');
  if(hint){
    hint.textContent = chk.checked
      ? 'El comprobante no avanzar\u00e1 a programaci\u00f3n mientras est\u00e9 retenido.'
      : 'El comprobante est\u00e1 aprobado para pago.';
  }
  if(wrap){
    wrap.classList.toggle('visible', chk.checked);
    if(!chk.checked){
      const sel = document.getElementById('ppcd-motivo-sel');
      const cnt = document.getElementById('ppcd-motivo-cnt');
      if(sel) sel.value = '';
      if(cnt) cnt.textContent = '00/30';
    }
  }
}
function updateMotivoCounter(sel){
  const cnt = document.getElementById('ppcd-motivo-cnt');
  if(!cnt) return;
  const len = sel.value ? sel.value.length : 0;
  cnt.textContent = String(len).padStart(2,'0') + '/30';
}

function openPpCruceSunatModal(){
  const comp = document.getElementById('ppcd-comp')?.textContent || '-';
  const lotEl = document.getElementById('cruce-sunat-lot');
  if(lotEl) lotEl.textContent = comp;
  closePpCompDrawer();
  document.getElementById('cruce-sunat-modal-bg').classList.add('open');
}

function guardarPpProgramacion(){
  const fecha = document.getElementById('ppcd-fecha')?.value
             || document.getElementById('ppcd-fecha-display')?.value;
  if(!fecha){ showToast('Selecciona una fecha de programaci\u00f3n'); return; }
  const comp = document.getElementById('ppcd-comp')?.textContent || '-';
  document.getElementById('prog-confirm-lot').textContent   = comp;
  document.getElementById('prog-confirm-fecha').textContent = document.getElementById('ppcd-fecha-display')?.value || fecha;
  document.getElementById('prog-confirm-title').textContent = 'Programar fecha de pago?';
  closePpCompDrawer();
  document.getElementById('prog-confirm-modal-bg').classList.add('open');
}
function updateBandejaPagosKPIs(){
  const rows = Array.from(document.querySelectorAll('#bpag-table tbody tr:not(.row-filtered)'));
  let total=rows.length, c12=0, p03=0, p04=0;
  rows.forEach(row => {
    const badge = row.querySelector('[data-state]');
    if(!badge) return;
    const st = badge.dataset.state;
    if(st==='C-12') c12++;
    else if(st==='P-03') p03++;
    else if(st==='P-04') p04++;
  });
  const el = id => document.getElementById(id);
  if(el('bpag-kpi-total')) el('bpag-kpi-total').textContent = total;
  if(el('bpag-kpi-c12'))   el('bpag-kpi-c12').textContent   = c12;
  if(el('bpag-kpi-p03'))   el('bpag-kpi-p03').textContent   = p03;
  if(el('bpag-kpi-p04'))   el('bpag-kpi-p04').textContent   = p04;
}

function initBandejaPagosPagination(){
  if(!document.getElementById('bpag-table')) return;
  let page=1, size=10;
  function getRows(){ return Array.from(document.querySelectorAll('#bpag-table tbody tr:not(.row-filtered)')); }
  function render(){
    const rows=getRows(), total=rows.length;
    const pages=Math.max(1,Math.ceil(total/size));
    page=Math.max(1,Math.min(page,pages));
    const from=(page-1)*size, to=Math.min(from+size,total);
    document.querySelectorAll('#bpag-table tbody tr').forEach(r=>{ if(!r.classList.contains('row-filtered')) r.style.display='none'; });
    rows.forEach((r,i)=>{ r.style.display=(i>=from&&i<to)?'':'none'; r.classList.toggle('row-stripe',i>=from&&i<to&&(i-from)%2!==0); });
    const info=document.getElementById('bpag-pager-info');
    if(info) info.textContent=total?`${from+1}-${to} de ${total} comprobantes`:'0 comprobantes';
    const ctrls=document.getElementById('bpag-pager-ctrls');
    if(!ctrls) return;
    let h=`<button onclick="bpagPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    for(let p=1;p<=pages;p++) h+=`<button class="${p===page?'active':''}" onclick="bpagPage(${p})">${p}</button>`;
    h+=`<button onclick="bpagPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML=h;
  }
  window.bpagPage=p=>{ const pages=Math.ceil(getRows().length/size); if(p<1||p>pages) return; page=p; render(); };
  const sel=document.getElementById('bpag-page-size');
  if(sel){ size=parseInt(sel.value)||10; sel.addEventListener('change',function(){ size=parseInt(this.value)||10; page=1; render(); }); }
  render(); window.bpagRender=render;
}

function initBandejaPagosFilters(){
  if(!document.getElementById('bpag-table')) return;
  const inp=document.getElementById('bpag-search');
  const selEst=document.getElementById('bpag-estado');
  const selPer=document.getElementById('bpag-periodo');
  const btnB=document.getElementById('bpag-buscar-btn');
  const btnL=document.getElementById('bpag-limpiar-btn');
  // Cols: 0=ID Lote|1=RUC|2=StoreID|3=Tipo|4=Serie|5=Corr|6=Per|7=Total|8=Canal|9=Estado|10=Acc
  function apply(){
    const txt=inp?inp.value.trim().toLowerCase():'', est=selEst?selEst.value:'', per=selPer?selPer.value:'';
    document.querySelectorAll('#bpag-table tbody tr').forEach(row=>{
      const tds=row.querySelectorAll('td');
      if(tds.length<9) return;
      const ruc=tds[1].textContent.toLowerCase(), storeid=tds[2].textContent.toLowerCase();
      const serie=tds[4].textContent.toLowerCase(), corr=tds[5].textContent.toLowerCase();
      const perVal=tds[6].textContent.trim();
      const badge=tds[9].querySelector('[data-state]'), st=badge?badge.dataset.state:'';
      let m=true;
      if(txt&&!ruc.includes(txt)&&!storeid.includes(txt)&&!serie.includes(txt)&&!corr.includes(txt)) m=false;
      if(est&&st!==est) m=false;
      if(per&&perVal!==per) m=false;
      row.classList.toggle('row-filtered',!m);
    });
    updateBandejaPagosKPIs();
    if(window.bpagRender) window.bpagRender();
  }
  function clear(){
    if(inp) inp.value='';
    if(selEst) selEst.value='';
    if(selPer) selPer.value='';
    document.querySelectorAll('#bpag-table tbody tr').forEach(r=>r.classList.remove('row-filtered'));
    updateBandejaPagosKPIs();
    if(window.bpagRender) window.bpagRender();
  }
  if(btnB) btnB.addEventListener('click',apply);
  if(btnL) btnL.addEventListener('click',clear);
  if(inp)  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') apply(); });
  if(selEst) selEst.addEventListener('change',apply);
  if(selPer) selPer.addEventListener('change',apply);
}

function initBandejaPagosComponents(){
  initBandejaPagosPagination();
  initBandejaPagosFilters();
  updateBandejaPagosKPIs();
}

function openBandejaPagosDetalle(btn){
  // Reutiliza openBandejaDetalle — mismo drawer, mismo modo edición
  openBandejaDetalle(btn);
}
_sectionInited.add('anulaciones');
initCustomSelects();   // custom dropdown para todos los .float-fld-select
navTo('inicio');

// Pre-carga adicional vía fetch si hay servidor (mejora rendimiento futuro)
if(window.location.protocol !== 'file:'){
  loadSections().catch(()=>{});
}

// -"?-"?-"? Modal confirmación: Emitir / Pagar lote -"?-"?-"?
let _emitirLotId  = '';
let _confirmConfig = {};

function openConfirmModal(cfg){
  _confirmConfig = cfg;
  // ícono: asigna clase en lugar de inline styles
  const icon = document.querySelector('#emitirModal .emitir-icon');
  if(icon) icon.className = `emitir-icon ${cfg.iconClass || ''}`;
  // textos
  const titleEl = document.querySelector('#emitirModal .emitir-title');
  if(titleEl) titleEl.textContent = cfg.title;
  const subEl = document.getElementById('emitir-sub');
  if(subEl) subEl.innerHTML = cfg.sub;
  // botón confirmar
  const btn = document.getElementById('emitir-confirm-btn');
  if(btn){ btn.className = `btn emitir-confirm-btn${cfg.btnExtra ? ' '+cfg.btnExtra : ''}`; }
  document.getElementById('emitirModal').classList.add('open');
}
function openClasificarModal(){
  openConfirmModal({
    iconClass:'icon-warn',
    title:'¿Estás seguro de que deseas clasificar este lote?',
    sub:`Se procesarán los registros del lote <b>${_emitirLotId}</b> aplicando la regla configurada.`,
    btnExtra:'btn-yellow',
    toast:`${_emitirLotId} fue enviado a clasificación`
  });
}
function openEmitirModal(){
  openConfirmModal({
    iconClass:'icon-warn',
    title:'¿Estás seguro de que deseas iniciar la emisión de este lote?',
    sub:`Se enviarán los registros clasificados del lote <b>${_emitirLotId}</b> a OSE para continuar con el proceso.`,
    btnExtra: '',
    toast:`${_emitirLotId} fue enviado a la OSE correctamente`
  });
}
function openPagarModal(){
  openConfirmModal({
    iconClass:'icon-danger',
    title:'¿Estás seguro de que deseas iniciar la gestion de pagos de este lote?',
    sub:`Se iniciará el pago de los registros habilitados del lote <b>${_emitirLotId}</b>.`,
    btnExtra:'btn-yellow',
    toast:`Se inició el proceso de pago para ${_emitirLotId}`
  });
}
function openFinalizarModal(){
  openConfirmModal({
    iconClass:'icon-danger',
    title:'¿Estás seguro de que deseas finalizar este lote?',
    sub:`Al confirmar, el lote <b>${_emitirLotId}</b> pasará al estado Finalizado y se dará por concluido su procesamiento.`,
    btnExtra:'btn-yellow',
    toast:`${_emitirLotId} fue finalizado correctamente`
  });
}
function closeEmitirModal(){
  document.getElementById('emitirModal').classList.remove('open');
}
function confirmAction(){
  if(_confirmConfig.toast) showToast(_confirmConfig.toast);
  closeEmitirModal();
  closeDrawer();
}
document.getElementById('emitirModal').addEventListener('click', e=>{
  if(e.target.id === 'emitirModal') closeEmitirModal();
});

// -"?-"?-"? Gestión de Comprobantes -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?

function updateCompKPIs(){
  const rows = Array.from(document.querySelectorAll('#comp-table tbody tr:not(.row-filtered)'));
  let total = rows.length, obs = 0, rech = 0, fin = 0;
  rows.forEach(row => {
    const badge = row.querySelector('[data-state]');
    if(!badge) return;
    const st = badge.dataset.state;
    if(['C-01','C-02'].includes(st)) obs++;          // Correlativos no generados
    else if(badge && badge.classList.contains('b-bandeja')) rech++; // Todos los estados en rojo (b-bandeja)
    else if(st === 'C-17') fin++;                     // Documento Completado
  });
  const el = id => document.getElementById(id);
  if(el('comp-kpi-total')) el('comp-kpi-total').textContent = total;
  if(el('comp-kpi-obs'))   el('comp-kpi-obs').textContent   = obs;
  if(el('comp-kpi-rech'))  el('comp-kpi-rech').textContent  = rech;
  if(el('comp-kpi-fin'))   el('comp-kpi-fin').textContent   = fin;
}
window.updateCompKPIs = updateCompKPIs;

function initCompPagination(){
  let page = 1, size = 20;
  function getRows(){ return Array.from(document.querySelectorAll('#comp-table tbody tr:not(.row-filtered)')); }
  function render(){
    const rows = getRows(), total = rows.length;
    if(!total) return;
    const pages = Math.ceil(total / size);
    page = Math.max(1, Math.min(page, pages));
    const from = (page-1)*size, to = Math.min(from+size, total);
    rows.forEach((r,i) => {
      r.style.display = (i>=from && i<to)?'':'none';
      r.classList.toggle('row-stripe', i>=from && i<to && (i-from)%2!==0);
    });
    const info = document.getElementById('comp-pager-info');
    if(info) info.textContent = `${from+1}-${to} de ${total} comprobantes`;
    const ctrls = document.getElementById('comp-pager-ctrls');
    if(!ctrls) return;
    function range(cur,tot){
      if(tot<=7) return Array.from({length:tot},(_,i)=>i+1);
      const r=[1]; if(cur>3) r.push('...');
      for(let p=Math.max(2,cur-1);p<=Math.min(tot-1,cur+1);p++) r.push(p);
      if(cur<tot-2) r.push('...'); r.push(tot); return r;
    }
    let h=`<button onclick="compPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    range(page,pages).forEach(p=>{
      if(p==='...') h+='<button class="pager-ellipsis" disabled>...</button>';
      else h+=`<button class="${p===page?'active':''}" onclick="compPage(${p})">${p}</button>`;
    });
    h+=`<button onclick="compPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML=h;
  }
  window.compPage = p => {
    const pages = Math.ceil(getRows().length/size);
    if(p<1||p>pages) return;
    page=p; render();
  };
  const sel = document.getElementById('comp-page-size');
  if(sel){ size=parseInt(sel.value)||20; sel.addEventListener('change',function(){ size=parseInt(this.value)||20; page=1; render(); }); }
  render(); window.compRender = render;
}

function initCompFilters(){
  const sec = document.getElementById('comp-table');
  if(!sec) return;
  const inpBuscar  = document.getElementById('comp-search');
  const selTipo    = document.getElementById('comp-tipo');
  const selPeriodo = document.getElementById('comp-periodo');
  const selFase    = document.getElementById('comp-fase');
  const selEstado  = document.getElementById('comp-estado');
  const btnBuscar  = document.getElementById('comp-buscar-btn');
  const btnLimpiar = document.getElementById('comp-limpiar-btn');

  // Columnas: 0=ID Lote | 1=RUC | 2=Tipo | 3=Serie | 4=Correlativo
  //           5=Periodo | 6=Ubigeo | 7=IGV | 8=Total | 9=Detracción
  //           10=Fase | 11=Estado badge | 12=Progreso | 13=Fecha emisión | 14=Acciones
  function apply(){
    const txt     = inpBuscar  ? inpBuscar.value.trim().toLowerCase() : '';
    const tipo    = selTipo    ? selTipo.value    : '';
    const periodo = selPeriodo ? selPeriodo.value : '';
    const fase    = selFase    ? selFase.value    : '';
    const estado  = selEstado  ? selEstado.value  : '';

    Array.from(document.querySelectorAll('#comp-table tbody tr')).forEach(row => {
      const tds = row.querySelectorAll('td');
      if(tds.length < 12) return;

      const lotid   = tds[0].textContent.toLowerCase();
      const ruc     = tds[1].textContent.toLowerCase();
      const storeid = tds[2].textContent.toLowerCase();
      const tp      = tds[3].textContent.trim();
      const serie   = tds[4].textContent.toLowerCase();
      const corr    = tds[5].textContent.toLowerCase();
      const per     = tds[6].textContent.trim();
      const faseVal = tds[11].textContent.trim();
      const badge   = tds[12].querySelector('[data-state]');
      const st      = badge ? badge.dataset.state : '';

      let m = true;
      if(txt && !lotid.includes(txt) && !ruc.includes(txt) && !storeid.includes(txt) && !serie.includes(txt) && !corr.includes(txt)) m = false;
      if(tipo    && tp      !== tipo)    m = false;
      if(periodo && per     !== periodo) m = false;
      if(fase    && faseVal !== fase)    m = false;
      if(estado  && st      !== estado)  m = false;

      row.classList.toggle('row-filtered', !m);
    });
    if(window.compRender)     window.compRender();
    if(window.updateCompKPIs) window.updateCompKPIs();
  }

  function clear(){
    if(inpBuscar)  inpBuscar.value  = '';
    if(selTipo)  { selTipo.value    = ''; selTipo.dispatchEvent(new Event('change',{bubbles:false})); }
    if(selPeriodo){ selPeriodo.value = ''; selPeriodo.dispatchEvent(new Event('change',{bubbles:false})); }
    if(selFase)  { selFase.value    = ''; selFase.dispatchEvent(new Event('change',{bubbles:false})); }
    if(selEstado){ selEstado.value  = ''; selEstado.dispatchEvent(new Event('change',{bubbles:false})); }
    document.querySelectorAll('#comp-table tbody tr').forEach(r => r.classList.remove('row-filtered'));
    if(window.compRender)     window.compRender();
    if(window.updateCompKPIs) window.updateCompKPIs();
  }

  window.compClearFilters = clear;
  if(btnBuscar)  btnBuscar.addEventListener('click', apply);
  if(btnLimpiar) btnLimpiar.addEventListener('click', clear);
  if(inpBuscar)  inpBuscar.addEventListener('keydown', e => { if(e.key === 'Enter') apply(); });
  if(selTipo)    selTipo.addEventListener('change', apply);
  if(selPeriodo) selPeriodo.addEventListener('change', apply);
  if(selFase)    selFase.addEventListener('change', apply);
  if(selEstado)  selEstado.addEventListener('change', apply);
}

function initCompComponents(){
  // Mapa RUC -?' StoreIDs (6 dígitos, únicos globalmente) \u2014 inyectar columna ANTES de filtros e índices
  const _STORE_MAP = {
    '20481230000': ['100001','100002','100003'],
    '20567890123': ['100004','100005'],
    '20484445556': ['100006','100007','100008','100009'],
    '10987654321': ['100010'],
    '20112233445': ['100011','100012'],
    '20998877665': ['100013','100014','100015'],
    '20300400500': ['100016','100017'],
    '20111222333': ['100018'],
    '20444555666': ['100019','100020'],
  };
  // Garantizar unicidad global: asignar IDs únicos a RUCs no mapeados
  let _nextStoreId = 100021;
  const _rucStores = {};
  Object.entries(_STORE_MAP).forEach(([r,s]) => { _rucStores[r] = s; });
  document.querySelectorAll('#comp-table tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    if(tds.length < 2) return;
    const r = tds[1].textContent.trim();
    if(!_rucStores[r]){
      const count = 1 + (parseInt(r.slice(-1)||0) % 2); // 1 o 2 tiendas
      _rucStores[r] = Array.from({length:count}, () => String(_nextStoreId++));
    }
  });
  const _storeCounters = {};
  document.querySelectorAll('#comp-table tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    if(tds.length < 2) return;
    const ruc = tds[1].textContent.trim();
    const stores = _rucStores[ruc] || [String(_nextStoreId++)];
    if(_storeCounters[ruc] === undefined) _storeCounters[ruc] = 0;
    const storeId = stores[_storeCounters[ruc] % stores.length];
    _storeCounters[ruc]++;
    const td = document.createElement('td');
    td.className = 'mono-sm';
    td.textContent = storeId;
    tds[1].insertAdjacentElement('afterend', td);
  });

  initCompPagination();
  initCompFilters();
  updateCompKPIs();

  // Limpiar Serie/Correlativo para filas en fase Carga (C-01..C-04)
  const CARGA_STATES = new Set(['C-01','C-02','C-03','C-04']);
  document.querySelectorAll('#comp-table tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    if(tds.length < 13) return;
    const badge = tds[12].querySelector('[data-state]');
    if(badge && CARGA_STATES.has(badge.dataset.state)){
      tds[4].textContent = '-';
      tds[5].textContent = '-';
    }
  });

  // Reasignar ID Lote: máximo 4 distintos por período
  const LOT_MAP = {
    '2026-07': ['LOT-000067','LOT-000068','LOT-000069','LOT-000070'],
    '2026-08': ['LOT-000071','LOT-000072','LOT-000073','LOT-000074'],
    '2026-09': ['LOT-000075','LOT-000076','LOT-000077','LOT-000078'],
  };
  const idx = {};
  document.querySelectorAll('#comp-table tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    if(tds.length < 6) return;
    const per  = tds[5].textContent.trim();
    const lots = LOT_MAP[per];
    if(!lots) return;
    if(idx[per] === undefined) idx[per] = 0;
    tds[0].textContent = lots[idx[per] % 4];
    idx[per]++;
  });

  // Ordenar filas por ID Lote descendente (mayor = más reciente, arriba primero)
  const tbody = document.querySelector('#comp-table tbody');
  if(tbody){
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const numA = parseInt((a.cells[0]?.textContent || '').replace(/\D/g,''), 10) || 0;
      const numB = parseInt((b.cells[0]?.textContent || '').replace(/\D/g,''), 10) || 0;
      return numB - numA; // descendente
    });
    rows.forEach(r => tbody.appendChild(r));

    // Agregar número secuencial por lote: LOT-000078-01, LOT-000078-02, ...
    const lotCounter = {};
    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
      const cell = row.cells[0];
      if(!cell) return;
      const lotBase = cell.textContent.trim();
      if(!lotCounter[lotBase]) lotCounter[lotBase] = 0;
      lotCounter[lotBase]++;
      cell.textContent = `${lotBase}-${String(lotCounter[lotBase]).padStart(2,'0')}`;
    });
  }
}

// -"?-"?-"? Errores por estado para la vista de detalle -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
const _CD_ERRORS = {
  'C-03':'El comprobante fue observado en la etapa de Carga.\n\n1. Verifica los datos del agente en Mantenimiento > Agentes.\n2. Corrige el campo con error (RUC, cuenta o ubigeo).\n3. Usa el botón "Corregir y reenviar" para reprocesar.',
  'C-06':'La OSE observó el comprobante. Los datos del receptor pueden ser incorrectos.\n\n1. Revisa el RUC y nombre del receptor.\n2. Verifica que la cuenta de detracción sea válida.\n3. Corrige desde la Bandeja de Revisión y reenvía.',
  'C-07':'Error técnico en el envío a la OSE. Se agotaron los reintentos automáticos.\n\n1. Verifica que el servicio OSE esté disponible.\n2. Revisa que los datos del comprobante sean correctos.\n3. Usa "Reintentar envío" para reprocesar.',
  'C-09':'SUNAT rechazó el comprobante por inconsistencias detectadas.\n\n1. Verifica que la serie y correlativo no estén duplicados.\n2. Revisa que los datos del emisor y receptor sean correctos.\n3. Corrige el comprobante y reenvía a SUNAT.',
  'C-11':'El documento fue rechazado de forma definitiva.\n\n1. Consulta el detalle del rechazo en la sección SUNAT.\n2. Genera una Nota de Crédito para anular el comprobante si corresponde.\n3. Emite un nuevo comprobante con los datos corregidos.',
  'C-12':'El pago presenta una observación. Los datos bancarios del agente requieren corrección.\n\n1. Ve a Mantenimiento > Agentes y actualiza la cuenta bancaria.\n2. Verifica que el número de cuenta y banco sean correctos.\n3. Usa "Corregir y reenviar pago" para reprocesar.',
  'P-03':'El pago fue rechazado por la entidad financiera.\n\n1. Verifica el motivo del rechazo con el banco.\n2. Reprograma la fecha de pago si el problema es temporal.\n3. Usa "Reprogramar fecha" para volver el tramo a P-01.',
  'P-04':'Error en los datos bancarios del tramo de pago.\n\n1. Revisa el número de cuenta y CCI del agente.\n2. Verifica que el RUC del titular coincida con el registrado.\n3. Usa "Corregir cuenta" para actualizar y reprocesar.',
};

const _CD_REPROCESAR = {
  'C-03': 'Volver a clasificar',
  'C-06': 'Reenviar a OSE',
  'C-07': 'Reenviar a OSE',
  'C-09': 'Reenviar a SUNAT',
  'C-12': 'Corregir y reenviar pago',
  'P-03': 'Reprogramar fecha',
  'P-04': 'Corregir cuenta',
};

function openCompDetalle(btn){
  _lastCompBtn = btn;
  const row = btn.closest('tr');
  // Desactivar modo edición si venía de bandeja
  const drw = document.getElementById('comp-drw');
  if(drw) drw.classList.remove('drw-edit-mode');
  document.querySelectorAll('#comp-drw .cdtc-value').forEach(el => {
    el.removeAttribute('contenteditable');
  });
  document.getElementById('comp-drw-guardar')?.classList.add('d-none');
  const tds = row.querySelectorAll('td');

  const ruc    = tds[1]?.textContent.trim()  || '-';
  const tipo   = tds[3]?.textContent.trim()  || '-';
  const serie  = tds[4]?.textContent.trim()  || '-';
  const corr   = tds[5]?.textContent.trim()  || '-';
  const per    = tds[6]?.textContent.trim()  || '-';
  const ubigeo = tds[7]?.textContent.trim()  || '-';
  const igv    = tds[8]?.textContent.trim()  || '-';
  const total  = tds[9]?.textContent.trim()  || '-';
  const detrac = tds[10]?.textContent.trim() || '-';
  const fase   = tds[11]?.textContent.trim() || '-';
  const badge  = tds[12]?.querySelector('[data-state]');
  const st     = badge?.dataset.state || '';
  const stText = badge?.textContent.trim() || '-';
  const fecha  = tds[14]?.textContent.trim() || '-';

  const cancelSt = row.dataset.cancellationStatus || 'NONE';

  // Alerta amber: visible si hay anulación en curso
  document.getElementById('comp-drw-anul-alert')?.classList.toggle('d-none', cancelSt !== 'IN_PROGRESS');

  const nombre    = _AGENT_NAMES[ruc] || ruc;
  const serieCorr = (serie !== '-' && corr !== '-') ? `${serie}-${corr}` : '-';

  // Header drawer
  document.getElementById('comp-drw-cargada').textContent = `Fecha cargada: ${fecha}`;
  document.getElementById('comp-drw-nombre').textContent  = nombre;
  document.getElementById('comp-drw-serie').textContent   = serieCorr;
  document.getElementById('comp-drw-fase').textContent    = fase;

  const stEl = document.getElementById('comp-drw-estado');
  stEl.innerHTML = '';
  if(badge){ stEl.appendChild(badge.cloneNode(true)); } else { stEl.textContent = stText; }

  // Mapa ubigeo compartido por tabs agente y comprobante
  const _UBIGEO_MAP = {
    '150101':['Lima','Lima','Lima'],                 '150102':['Lima','Lima','Ancón'],
    '150103':['Lima','Lima','Ate'],                  '150104':['Lima','Lima','Barranco'],
    '150105':['Lima','Lima','Breña'],                '150106':['Lima','Lima','Carabayllo'],
    '150107':['Lima','Lima','Chaclacayo'],           '150108':['Lima','Lima','Chorrillos'],
    '150109':['Lima','Lima','Cieneguilla'],          '150110':['Lima','Lima','Comas'],
    '150111':['Lima','Lima','El Agustino'],          '150112':['Lima','Lima','Independencia'],
    '150113':['Lima','Lima','Jesús María'],          '150114':['Lima','Lima','La Molina'],
    '150115':['Lima','Lima','San Juan de Lurigancho'],'150116':['Lima','Lima','La Victoria'],
    '150117':['Lima','Lima','Lince'],                '150118':['Lima','Lima','San Martín de Porres'],
    '150119':['Lima','Lima','Los Olivos'],           '150120':['Lima','Lima','Lurigancho'],
    '150121':['Lima','Lima','Lurín'],                '150122':['Lima','Lima','Magdalena del Mar'],
    '150123':['Lima','Lima','Miraflores'],           '150124':['Lima','Lima','Pachacámac'],
    '150125':['Lima','Lima','Pucusana'],             '150126':['Lima','Lima','Pueblo Libre'],
    '150127':['Lima','Lima','Puente Piedra'],        '150128':['Lima','Lima','Punta Hermosa'],
    '150130':['Lima','Lima','Rímac'],                '150131':['Lima','Lima','San Bartolo'],
    '150132':['Lima','Lima','San Borja'],            '150133':['Lima','Lima','San Isidro'],
    '150134':['Lima','Lima','San Juan de Miraflores'],'150135':['Lima','Lima','San Luis'],
    '150136':['Lima','Lima','San Miguel'],           '150137':['Lima','Lima','Santa Anita'],
    '150138':['Lima','Lima','Santa María del Mar'],  '150139':['Lima','Lima','Santa Rosa'],
    '150140':['Lima','Lima','Santiago de Surco'],    '150141':['Lima','Lima','Surquillo'],
    '150142':['Lima','Lima','Villa El Salvador'],    '150143':['Lima','Lima','Villa María del Triunfo'],
    '040101':['Arequipa','Arequipa','Arequipa'],     '040102':['Arequipa','Arequipa','Alto Selva Alegre'],
    '130101':['La Libertad','Trujillo','Trujillo'],  '130102':['La Libertad','Trujillo','El Porvenir'],
    '070101':['Cusco','Cusco','Cusco'],              '020101':['Áncash','Huaraz','Huaraz'],
    '060101':['Cajamarca','Cajamarca','Cajamarca'],  '140101':['Lambayeque','Chiclayo','Chiclayo'],
    '150201':['Lima','Barranca','Barranca'],         '150301':['Lima','Cajatambo','Cajatambo'],
  };

  // Agente tab
  const _DETRAC_ACC = {
    '20481230000':'00-000-123456','20567890123':'00-000-234567',
    '20484445556':'00-000-345678','10987654321':'00-000-456789',
    '20112233445':'00-000-567890','20998877665':'00-000-678901',
  };
  const _SELFBILLING_DATE = {
    '20481230000':'01/03/2024','20567890123':'15/06/2023',
    '20484445556':'01/01/2024','10987654321':'10/09/2023',
    '20112233445':'01/07/2023','20998877665':'20/11/2022',
  };
  const rucN2  = parseInt(ruc.replace(/\D/g,'').slice(-3)) || 0;
  const fbDetracAcc  = _DETRAC_ACC[ruc]       || `00-000-${(100000 + rucN2).toString().slice(-6)}`;
  const fbSbDate     = _SELFBILLING_DATE[ruc] || `01/0${1 + rucN2 % 9}/2023`;
  const [agUbDpto, agUbProv, agUbDist] = _UBIGEO_MAP[ubigeo] || ['Lima','Lima','Lima'];
  const setA = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  setA('cdta-ruc',           ruc);
  setA('cdta-tipo',          ruc.startsWith('10') ? 'Persona Natural' : 'Persona Jurídica');
  setA('cdta-nombre',        nombre);
  setA('cdta-ubigeo',        ubigeo);
  setA('cdta-dpto',          agUbDpto);
  setA('cdta-prov',          agUbProv);
  setA('cdta-dist',          agUbDist);
  setA('cdta-selfbilling',   'Sí');
  setA('cdta-selfbilling-date', fbSbDate);
  setA('cdta-ose',           ruc.startsWith('20998') ? 'RAMGAST' : 'BIZLINKS');
  setA('cdta-detrac-acc',    fbDetracAcc);
  setA('cdta-created',       '01/01/2022');
  setA('cdta-updated',       fecha);

  // -"?-"? Datos del comprobante tab -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
  const _ENTIDAD_MAP = {
    '20481230000':'BBVA Continental','20567890123':'BCP','20484445556':'Interbank',
    '10987654321':'Scotiabank','20112233445':'BCP','20998877665':'Pichincha',
  };
  const _DIR_MAP = {
    '20481230000':'Av. República de Panamá 3055, San Isidro',
    '20567890123':'Jr. Lampa 499, Lima',
    '20484445556':'Calle Álvarez Calderón 185, San Isidro',
    '10987654321':'Av. Larco 630, Miraflores',
    '20112233445':'Av. Larco 1301, Miraflores',
    '20998877665':'Av. Javier Prado Este 490, San Isidro',
  };
  const _EMAIL_MAP = {
    '20481230000':'negocios@kasnet.pe','20567890123':'facturacion@empresa.pe',
    '20484445556':'contabilidad@agente.com','10987654321':'persona@natural.pe',
    '20112233445':'emisor@empresa.com.pe','20998877665':'admin@corporativo.pe',
  };
  const _SEGM_MAP = {
    '20481230000':'MICRO','20567890123':'PEQUE\u00d1A','20484445556':'MEDIANA',
    '10987654321':'MICRO','20112233445':'PEQUE\u00d1A','20998877665':'GRANDE',
  };
  const _ACCOUNT_MAP = {
    '20481230000':{type:'Cuenta Corriente', num:'0011-0113-0100069231', cci:'00211301000692310118', holder:'Joel Cauti Rojas'},
    '20567890123':{type:'Cuenta de Ahorros',num:'194-00123456789-0-18', cci:'00219400012345678918', holder:'María Torres López'},
    '20484445556':{type:'Cuenta Corriente', num:'200-3002761656',       cci:'00320030027616560135', holder:'Carlos Medina Ríos'},
    '10987654321':{type:'Cuenta de Ahorros',num:'000-623456',           cci:'00909800062345600000', holder:'Ana Flores Vega'},
    '20112233445':{type:'Cuenta Corriente', num:'194-01234567890-1-25', cci:'00219401234567890125', holder:'Pedro Salas Cruz'},
    '20998877665':{type:'Cuenta Corriente', num:'2100098765432100',     cci:'00921000987654321014', holder:'Empresa Corporativa SAC'},
  };
  const _STORE_NAMES = {
    '100001':'Tienda Centro Lima','100002':'Tienda Lince','100003':'Tienda SJL',
    '100004':'Tienda Miraflores','100005':'Tienda San Isidro','100006':'Tienda Chorrillos',
    '100007':'Tienda Villa el Salvador','100008':'Tienda SMP','100009':'Tienda Comas',
    '100010':'Tienda Surco','100011':'Tienda Breña','100012':'Tienda La Victoria',
    '100013':'Tienda Barranco','100014':'Tienda Pueblo Libre','100015':'Tienda Jesús María',
    '100016':'Tienda Surquillo','100017':'Tienda Magdalena','100018':'Tienda Rímac',
    '100019':'Tienda Los Olivos','100020':'Tienda Independencia',
  };
  const _QUERY_RESULT = {
    'C-10':'CDR Aceptado','C-11':'CDR Rechazado','C-12':'CDR Aceptado',
    'C-13':'CDR Aceptado','C-14':'CDR Aceptado','C-15':'CDR Aceptado',
    'C-16':'CDR Aceptado','C-17':'CDR Aceptado','C-09':'CDR Rechazado',
  };
  const _CANCEL_LABEL = {'NONE':'Sin anulación','IN_PROGRESS':'En proceso','CANCELLED':'Anulado'};

  // Fallbacks deterministas para RUCs no mapeados
  const _banks = ['BCP','BBVA Continental','Interbank','Scotiabank','BanBif','Pichincha'];
  const _segms  = ['MICRO','PEQUE\u00d1A','MEDIANA','GRANDE'];
  const _accTypes = ['Cuenta Corriente','Cuenta de Ahorros'];
  const rucN    = parseInt(ruc.replace(/\D/g,'').slice(-4)) || 0;
  const fbBank  = _ENTIDAD_MAP[ruc]  || _banks[rucN % _banks.length];
  const fbSegm  = _SEGM_MAP[ruc]     || _segms[rucN % _segms.length];
  const fbEmail = _EMAIL_MAP[ruc]    || `contacto@agente${ruc.slice(-4)}.pe`;
  const fbDir   = _DIR_MAP[ruc]      || `Av. Principal ${100 + rucN % 900}, Lima`;
  const fbAcc   = _ACCOUNT_MAP[ruc]  || {
    type: _accTypes[rucN % 2],
    num:  `${194 + rucN % 6}-${ruc.slice(-8)}-0-${rucN % 99}`.padEnd(20,'0'),
    cci:  `002${ruc.slice(-13).padStart(13,'0')}18`,
    holder: nombre,
  };

  const loteId   = tds[0]?.textContent.trim() || '-';
  const storeId  = tds[2]?.textContent.trim() || '-';
  const [ubDpto, ubProv, ubDist] = _UBIGEO_MAP[ubigeo] || ['Lima','Lima','Lima'];
  const hasDetrac = detrac && detrac !== '-';
  const opType  = hasDetrac ? '1001 \u2014 Sujeta a detracción' : '0101 \u2014 Venta interna';
  const agentType = ruc.startsWith('10') ? 'Persona Natural' : 'Persona Jurídica';

  const parseS = s => parseFloat((s||'').replace(/[^0-9.]/g,'')) || 0;
  const totalNum = parseS(total), igvNum = parseS(igv);
  const baseNum  = totalNum - igvNum;
  const fmtS = n => n > 0 ? `S/ ${n.toFixed(2)}` : '-';

  const approvedStates = new Set(['C-10','C-12','C-14','C-15','C-16','C-17']);
  const hasQuery = !!_QUERY_RESULT[st];

  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

  set('cdtc-lote',        loteId);
  set('cdtc-tipo',        tipo);
  set('cdtc-serie',       serie);
  set('cdtc-corr',        corr);
  set('cdtc-corrkey',     (ruc !== '-' && serie !== '-' && corr !== '-') ? `${ruc}#${serie}#${corr}` : '-');
  set('cdtc-fecha',       fecha);
  set('cdtc-per',         per);
  set('cdtc-optype',      opType);
  set('cdtc-storeid',     storeId);
  set('cdtc-storename',   _STORE_NAMES[storeId] || '-');
  set('cdtc-ruc',         ruc);
  set('cdtc-agenttype',   agentType);
  set('cdtc-razon',       nombre);
  set('cdtc-segm',        fbSegm);
  set('cdtc-ubigeo',      ubigeo);
  set('cdtc-dpto',        ubDpto);
  set('cdtc-prov',        ubProv);
  set('cdtc-dist',        ubDist);
  set('cdtc-dir',         fbDir);
  set('cdtc-email',       fbEmail);
  set('cdtc-entidad',     fbBank);
  set('cdtc-acctype',     fbAcc.type);
  set('cdtc-accnum',      fbAcc.num);
  set('cdtc-cci',         fbAcc.cci);
  set('cdtc-holder',      fbAcc.holder);
  set('cdtc-base',        fmtS(baseNum));
  set('cdtc-igv',         igv);
  set('cdtc-total',       total);
  set('cdtc-exo',         igvNum === 0 ? 'Sí' : 'No');
  set('cdtc-comm',        total);
  set('cdtc-bonus',       'S/ 0.00');
  set('cdtc-disc',        'S/ 0.00');
  set('cdtc-ose',         ruc.startsWith('20998') ? 'RAMGAST' : 'BIZLINKS');
  set('cdtc-intentos',    ['C-06','C-07','C-09'].includes(st) ? '3' : '1');
  set('cdtc-lastquery',   hasQuery ? fecha : '-');
  set('cdtc-queryresult', _QUERY_RESULT[st] || '-');
  set('cdtc-approved',    approvedStates.has(st) ? 'Sí' : (st === 'C-13' ? 'No \u2014 bloqueado' : '-'));
  set('cdtc-cancelst',    _CANCEL_LABEL[cancelSt] || cancelSt);

  const detracSec = document.getElementById('cdtc-detrac-section');
  if(hasDetrac){
    const detracNum = parseS(detrac);
    const detrPay   = Math.round(detracNum);
    const netAmt    = totalNum - detrPay;
    set('cdtc-detrac',      detrac);
    set('cdtc-detrac-code', '024 \u2014 Comisiones y corretajes');
    set('cdtc-detrac-rate', '10%');
    set('cdtc-detrac-pay',  `S/ ${detrPay.toFixed(2)}`);
    set('cdtc-detrac-net',  fmtS(netAmt));
    detracSec.classList.remove('d-none');
  } else {
    detracSec.classList.add('d-none');
  }

  // Steps
  const [curStep, curStatus, curClass] = _COMP_STATE_MAP[st] || [0,'-?"',''];
  const stepsEl = document.getElementById('comp-drw-steps');
  stepsEl.innerHTML = '';
  _COMP_STEPS.forEach((name, i) => {
    const done   = i < curStep;
    const isCur  = i === curStep;
    const isLast = i === _COMP_STEPS.length - 1;
    const numHtml = done ? '\u2713' : String(i + 1);
    let dotCls, stCls;
    if(done){      dotCls='done'; stCls='ok'; }
    else if(isCur){ dotCls=curClass==='err'?'cur-err':curClass==='proc'?'proc':'cur'; stCls=curClass; }
    else {          dotCls=''; stCls=''; }
    const stTxt = done?'Completado': isCur?curStatus:'Pendiente';
    const div = document.createElement('div');
    div.className = 'comp-drw-step';
    div.innerHTML = `
      <div class="comp-drw-step-left">
        <div class="cdstep-dot ${dotCls}">${numHtml}</div>
        ${!isLast?`<div class="cdstep-line ${done?'done':''}"></div>`:''}
      </div>
      <div class="cdstep-content">
        <div class="cdstep-row">
          <span class="cdstep-name">${i+1}. ${name}</span>
          <span class="cdstep-status ${stCls}">${stTxt}</span>
        </div>
        <div class="cdstep-date">${fecha} · 09:14 am</div>
      </div>`;
    stepsEl.appendChild(div);
  });

  compDrwTab(document.querySelector('#comp-drw .comp-drw-tabs button'), 'cdtab-estado');

  // Motivo + pasos de corrección (lado derecho del grid)
  const motivoBox   = document.getElementById('comp-drw-motivo');
  const motivoMsg   = document.getElementById('comp-drw-motivo-msg');
  const motivoTitle = document.getElementById('comp-drw-motivo-title');
  const hasError    = !!_CD_ERRORS[st];
  if(motivoBox && motivoMsg){
    if(hasError){
      motivoMsg.style.whiteSpace = 'pre-line';
      motivoMsg.textContent = _CD_ERRORS[st];
      if(motivoTitle) motivoTitle.textContent = `Motivo de ${stText}`;
      motivoBox.classList.remove('d-none');
    } else {
      motivoBox.classList.add('d-none');
    }
  }

  // Botón reprocesar (solo para estados con error/observación)
  const repBtn     = document.getElementById('comp-drw-reprocesar');
  const repTxt     = document.getElementById('comp-drw-reprocesar-txt');
  if(repBtn){
    if(_CD_REPROCESAR[st]){
      repTxt.textContent = _CD_REPROCESAR[st];
      repBtn.classList.remove('d-none');
    } else {
      repBtn.classList.add('d-none');
    }
  }

  // Botones PDF/XML: C-10 en adelante (incluyendo C-11 anulado)
  const SUNAT_PASS   = new Set(['C-10','C-11','C-12','C-13','C-14','C-15','C-16','C-17']);
  // Botón anular: solo estados elegibles según spec 06 (excluye C-11)
  const ANUL_ELIGIBLE = new Set(['C-10','C-12','C-13','C-14','C-15','C-16','C-17']);
  const showBtns = SUNAT_PASS.has(st) || !!_CD_REPROCESAR[st];
  const dlBtns    = document.getElementById('comp-drw-dl-btns');
  const footer    = document.getElementById('comp-drw-footer');
  const anularBtn = document.getElementById('comp-drw-anular');

  // Alerta amber: visible si anulación en curso
  const amberShown = cancelSt === 'IN_PROGRESS';

  if(dlBtns)    dlBtns.classList.toggle('d-none', !SUNAT_PASS.has(st));
  // Ocultar anulación si: estado no elegible, cancelSt != NONE, o cuadro amber visible
  if(anularBtn) anularBtn.classList.toggle('d-none', !(ANUL_ELIGIBLE.has(st) && cancelSt === 'NONE' && !amberShown));
  if(footer)    footer.classList.toggle('d-none', !showBtns);

  document.getElementById('comp-drw-overlay').classList.add('open');
  document.getElementById('comp-drw').classList.add('open');
}

function cdTab(btn, tabId){
  document.querySelectorAll('#comp-detalle .tabs button').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('#comp-detalle .tab-pane').forEach(p=>p.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const pane = document.getElementById(tabId);
  if(pane) pane.classList.add('active');
}
const _AGENT_NAMES = {
  '20484445556':'Comercio El Faro SAC',
  '20481230000':'Bodega PEQUE\u00d1A EIRL',
  '10456789013':'Maria Torres Quispe',
  '20567890123':'Distribuidora Norte SAC',
  '20678901234':'Bodega San Isidro SRL',
  '10987654321':'Carlos Quispe Rojas',
  '10238817868':'Sucre y Sale',
  '10345678901':'Ana Flores Mendoza',
};
const _COMP_STEPS = ['Carga','Emisión','SUNAT','Pago','Completado'];
// [stepIndex (0-based), displayStatus, cssClass]
const _COMP_STATE_MAP = {
  'C-01':[0,'No Aplica',''],    'C-02':[0,'No Pago',''],
  'C-03':[0,'Observado','err'], 'C-04':[1,'Pendiente',''],
  'C-05':[1,'En proceso','proc'], 'C-06':[1,'Observado','err'],
  'C-07':[1,'Error técnico','err'],'C-08':[2,'Pendiente',''],
  'C-09':[2,'Rechazado','err'], 'C-10':[3,'Pendiente',''],
  'C-11':[2,'Documento Rechazado',''],
  'C-12':[3,'Observado','err'], 'C-13':[3,'En proceso','proc'],
  'C-14':[3,'En proceso','proc'],  'C-15':[3,'En proceso','proc'],
  'C-16':[4,'Pendiente',''], 'C-17':[5,'Completado','ok'],
};

function closeCompDrawer(){
  document.getElementById('comp-drw-overlay').classList.remove('open');
  document.getElementById('comp-drw').classList.remove('open');
}

function compDrwTab(btn, tabId){
  document.querySelectorAll('#comp-drw .comp-drw-tabs button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.comp-drw-pane').forEach(p => p.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const pane = document.getElementById(tabId);
  if(pane) pane.classList.add('active');
}

// -"?-"?-"? Custom Select (todos los .float-fld-select) -"?-"?-"?
function initCustomSelects(){
  document.querySelectorAll('.float-fld-select:not([data-cs])').forEach(wrap => {
    const sel = wrap.querySelector('select');
    if(!sel) return;
    wrap.dataset.cs = '1';

    // trigger
    const trigger  = document.createElement('div');
    trigger.className = 'cs-trigger';
    const valSpan  = document.createElement('span'); valSpan.className = 'cs-value';
    const arrSpan  = document.createElement('i'); arrSpan.className = 'cs-arrow icon-chevron-down';
    trigger.append(valSpan, arrSpan);

    // dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'cs-dropdown';

    function syncValue(){
      valSpan.textContent = sel.options[sel.selectedIndex]?.text || '';
      dropdown.querySelectorAll('.cs-option').forEach((o,i) => {
        o.classList.toggle('selected', i === sel.selectedIndex);
      });
    }
    function buildOptions(){
      dropdown.innerHTML = '';
      Array.from(sel.options).forEach((opt, i) => {
        const item = document.createElement('div');
        item.className = 'cs-option' + (opt.selected ? ' selected' : '');
        item.textContent = opt.text;
        item.addEventListener('click', e => {
          e.stopPropagation();
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change'));
          syncValue();
          closeAll();
        });
        dropdown.appendChild(item);
      });
    }
    buildOptions();
    syncValue();
    // Escuchar cambios externos (p.ej. botón Limpiar) para sincronizar el display
    sel.addEventListener('change', syncValue);

    function openDrop(){
      closeAll();
      dropdown.classList.add('open');
      wrap.classList.add('cs-open');
    }
    function closeDrop(){
      dropdown.classList.remove('open');
      wrap.classList.remove('cs-open');
    }
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.contains('open') ? closeDrop() : openDrop();
    });
    dropdown.addEventListener('click', e => e.stopPropagation());

    // montar: label -?' trigger -?' select (oculto) -?' dropdown
    sel.style.display = 'none';
    const label = wrap.querySelector('.float-label');
    if(label) label.after(trigger); else wrap.prepend(trigger);
    wrap.appendChild(dropdown);

    // sincronizar si el select nativo cambia externamente
    sel.addEventListener('change', syncValue);
  });
}
function closeAll(){
  document.querySelectorAll('.cs-dropdown.open').forEach(d => {
    d.classList.remove('open');
    d.closest('.float-fld-select')?.classList.remove('cs-open');
  });
}
document.addEventListener('click', closeAll);
window.initCustomSelects = initCustomSelects;

// -"?-"?-"? Gestión de Anulaciones (Notas de Crédito) -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
function updateAnulKPIs(){
  const rows = Array.from(document.querySelectorAll('#anul-table tbody tr:not(.row-filtered)'));
  let total = rows.length, proc = 0, rech = 0, fin = 0;
  rows.forEach(row => {
    const badge = row.querySelector('[data-anul-state]');
    if(!badge) return;
    const st = badge.dataset.anulState;
    if(['C-05','C-08'].includes(st)) proc++;                       // En proceso (ámbar)
    else if(['C-06','C-07','C-09','C-11'].includes(st)) rech++;   // Observadas/Rechazadas (rojo/gris)
    else if(st === 'C-10') fin++;                                   // NC Aprobada
  });
  const el = id => document.getElementById(id);
  if(el('anul-kpi-total')) el('anul-kpi-total').textContent = total;
  if(el('anul-kpi-proc'))  el('anul-kpi-proc').textContent  = proc;
  if(el('anul-kpi-rech'))  el('anul-kpi-rech').textContent  = rech;
  if(el('anul-kpi-fin'))   el('anul-kpi-fin').textContent   = fin;
}

function initAnulPagination(){
  let page = 1, size = 20;
  function getRows(){ return Array.from(document.querySelectorAll('#anul-table tbody tr:not(.row-filtered)')); }
  function render(){
    const rows = getRows(), total = rows.length;
    if(!total) return;
    const pages = Math.max(1, Math.ceil(total / size));
    const from  = (page - 1) * size, to = Math.min(from + size, total);
    rows.forEach((r, i) => r.style.display = (i >= from && i < to) ? '' : 'none');
    const info = document.getElementById('anul-pager-info');
    if(info) info.textContent = `${from+1}-${to} de ${total} notas`;
    const ctrls = document.getElementById('anul-pager-ctrls');
    if(!ctrls) return;
    let h = `<button onclick="anulPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    for(let p = 1; p <= pages; p++)
      h += `<button class="${p===page?'active':''}" onclick="anulPage(${p})">${p}</button>`;
    h += `<button onclick="anulPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML = h;
  }
  window.anulPage = p => {
    const pages = Math.ceil(getRows().length / size);
    if(p < 1 || p > pages) return;
    page = p; render();
  };
  const sel = document.getElementById('anul-page-size');
  if(sel){ size = parseInt(sel.value)||20; sel.addEventListener('change', function(){ size = parseInt(this.value)||20; page=1; render(); }); }
  render(); window.anulRender = render;
}

function initAnulFilters(){
  const tbl       = document.getElementById('anul-table');
  if(!tbl) return;
  const inpBuscar = document.getElementById('anul-search');
  const selPer    = document.getElementById('anul-periodo');
  const selFase   = document.getElementById('anul-fase');
  const selEst    = document.getElementById('anul-estado');
  const btnBuscar = document.getElementById('anul-buscar-btn');
  const btnLimpiar= document.getElementById('anul-limpiar-btn');

  // Cols: 0=RUC|1=Store ID|2=Serie NC|3=Corr NC|4=Origen|5=Motivo|6=Total|7=Fase|8=Estado|9=Prog|10=Fecha|11=Acc
  function apply(){
    const txt  = inpBuscar ? inpBuscar.value.trim().toLowerCase() : '';
    const per  = selPer    ? selPer.value    : '';
    const fase = selFase   ? selFase.value   : '';
    const est  = selEst    ? selEst.value    : '';
    Array.from(document.querySelectorAll('#anul-table tbody tr')).forEach(row => {
      const tds   = row.querySelectorAll('td');
      if(tds.length < 8) return;
      const ruc     = tds[0].textContent.toLowerCase();
      const storeid = tds[1].textContent.toLowerCase();
      const serie   = tds[2].textContent.toLowerCase();
      const corr    = tds[3].textContent.toLowerCase();
      const orig    = tds[4].textContent.toLowerCase();
      const faseVal = tds[7].textContent.trim();
      const badge   = tds[8].querySelector('[data-anul-state]');
      const st      = badge ? badge.dataset.anulState : '';
      const fecha   = tds[10].textContent.trim();
      const perRow  = fecha.length >= 7 ? fecha.slice(6,10) + '-' + fecha.slice(3,5) : '';
      let m = true;
      if(txt  && !ruc.includes(txt) && !storeid.includes(txt) && !serie.includes(txt) && !corr.includes(txt) && !orig.includes(txt)) m = false;
      if(per  && perRow   !== per)  m = false;
      if(fase && faseVal  !== fase) m = false;
      if(est  && st       !== est)  m = false;
      row.classList.toggle('row-filtered', !m);
    });
    if(window.anulRender) window.anulRender();
    updateAnulKPIs();
  }
  function clear(){
    if(inpBuscar) inpBuscar.value = '';
    if(selPer)  { selPer.value  = ''; selPer.dispatchEvent(new Event('change',{bubbles:false})); }
    if(selFase) { selFase.value = ''; selFase.dispatchEvent(new Event('change',{bubbles:false})); }
    if(selEst)  { selEst.value  = ''; selEst.dispatchEvent(new Event('change',{bubbles:false})); }
    document.querySelectorAll('#anul-table tbody tr').forEach(r => r.classList.remove('row-filtered'));
    if(window.anulRender) window.anulRender();
    updateAnulKPIs();
  }
  if(btnBuscar)  btnBuscar.addEventListener('click', apply);
  if(btnLimpiar) btnLimpiar.addEventListener('click', clear);
  if(inpBuscar)  inpBuscar.addEventListener('keydown', e => { if(e.key==='Enter') apply(); });
  if(selPer)     selPer.addEventListener('change', apply);
  if(selFase)    selFase.addEventListener('change', apply);
  if(selEst)     selEst.addEventListener('change', apply);
}

function initAnulacionesComponents(){
  // Inyectar Store ID en la columna después de RUC
  const _ANUL_STORE = {
    '20481230000':'100001','20567890123':'100004','20484445556':'100006',
    '10987654321':'100010','20112233445':'100011','20998877665':'100013',
  };
  let _anulNextStore = 100030;
  const _anulRucStore = {..._ANUL_STORE};
  document.querySelectorAll('#anul-table tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    if(tds.length < 1) return;
    const ruc = tds[0].textContent.trim();
    if(!_anulRucStore[ruc]) _anulRucStore[ruc] = String(_anulNextStore++);
    const td = document.createElement('td');
    td.className = 'mono-sm';
    td.textContent = _anulRucStore[ruc];
    tds[0].insertAdjacentElement('afterend', td);
  });

  initAnulPagination();
  initAnulFilters();
  updateAnulKPIs();
}

// -"?-"?-"? Drawer Detalle Nota de Crédito -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
const _ANUL_STEPS = ['Emisión', 'SUNAT'];
// [stepIndex (0-based), displayStatus, cssClass]
// curStep=2 -?' ambos pasos completados (C-10)
const _ANUL_STATE_MAP = {
  'C-05':[0,'En proceso','proc'],
  'C-06':[0,'Observado','err'],
  'C-07':[0,'Error','err'],
  'C-08':[1,'En proceso','proc'],
  'C-09':[1,'Rechazado','err'],
  'C-10':[2,'Completado','ok'],
  'C-11':[1,'Rechazado','err'],
};
const _AN_ERRORS = {
  'C-06':'La nota de crédito fue observada por la OSE.\n\n1. Revisa el motivo de la observación.\n2. Corrige los datos del motivo de anulación.\n3. Reenvía la nota de crédito a la OSE.',
  'C-07':'Error técnico al enviar la NC a la OSE.\n\n1. Verifica la conectividad con la OSE.\n2. Revisa el mensaje de error en los logs.\n3. Reintenta el envío.',
  'C-09':'SUNAT rechazó la nota de crédito.\n\n1. Revisa el código de error de SUNAT.\n2. Solo es posible cerrar esta anulación.\n3. Podrás iniciar una nueva anulación una vez cerrada.',
  'C-11':'Nota de crédito rechazada definitivamente.\n\n1. La anulación no pudo completarse.\n2. El comprobante vuelve a su estado original.\n3. Puedes iniciar una nueva anulación si es necesario.',
};
const _AN_REPROCESAR = {
  'C-06':'Corregir y reenviar',
  'C-07':'Reenviar a OSE',
  'C-09':'Cerrar anulación',
};

function openAnulDetalle(btn){
  const row  = btn.closest('tr');
  const tds  = row.querySelectorAll('td');
  // Cols: 0=RUC|1=Store ID|2=Serie NC|3=Corr NC|4=Origen|5=Motivo|6=Total|7=Fase|8=Estado|9=Prog|10=Fecha
  const ruc    = tds[0]?.textContent.trim() || '-';
  const serie  = tds[2]?.textContent.trim() || '-';
  const corr   = tds[3]?.textContent.trim() || '-';
  const origen = tds[4]?.textContent.trim() || '-';
  const motivo = tds[5]?.textContent.trim() || '-';
  const total  = tds[6]?.textContent.trim() || '-';
  const fase   = tds[7]?.textContent.trim() || '-';
  const badge  = tds[8]?.querySelector('[data-anul-state]');
  const st     = badge?.dataset.anulState || '';
  const stText = badge?.textContent.trim() || '-';
  const fecha  = tds[10]?.textContent.trim() || '-';

  const nombre    = _AGENT_NAMES[ruc] || ruc;
  const serieCorr = `${serie}-${corr}`;

  // Header
  document.getElementById('anul-drw-fecha').textContent  = `Fecha emisión: ${fecha}`;
  document.getElementById('anul-drw-nombre').textContent = nombre;
  document.getElementById('anul-drw-serie').textContent  = serieCorr;
  document.getElementById('anul-drw-fase').textContent   = fase;

  // Botones PDF/XML: solo para C-10 (SUNAT aprobado)
  const anulDlBtns = document.getElementById('anul-drw-dl-btns');
  if(anulDlBtns) anulDlBtns.classList.toggle('d-none', st !== 'C-10');

  // Badge estado
  const stEl = document.getElementById('anul-drw-estado');
  stEl.innerHTML = '';
  if(badge){
    stEl.appendChild(badge.cloneNode(true));
  } else {
    stEl.textContent = stText;
  }

  // Datos agente
  document.getElementById('adta-ruc').textContent    = ruc;
  document.getElementById('adta-nombre').textContent = nombre;
  document.getElementById('adta-tipo').textContent   = ruc.startsWith('10') ? 'Persona Natural' : 'Persona Jurídica';
  document.getElementById('adta-ose').textContent    = ruc.startsWith('20998') ? 'RAMGAST' : 'BIZLINKS';

  // Datos NC \u2014 campos del modelo credit_notes
  const _REASON_CODES = {
    '01':'01 \u2014 Anulación de la operación',    '02':'02 \u2014 Anulación por error en el RUC',
    '03':'03 \u2014 Error en los datos del comprobante','04':'04 \u2014 Descuento global',
    '05':'05 \u2014 Descuento por ítem',           '06':'06 \u2014 Devolución total',
    '07':'07 \u2014 Devolución por ítem',          '08':'08 \u2014 Bonificación',
    '09':'09 \u2014 Disminución en el valor',      '10':'10 \u2014 Otros conceptos',
  };
  const rucN3   = parseInt(ruc.replace(/\D/g,'').slice(-2)) || 1;
  const rcCode  = String((rucN3 % 10) + 1).padStart(2,'0');
  // Derivar tipo de origen desde la serie NC (FC20 -?' INVOICE, BC20 -?' SALES_RECEIPT)
  const origType = serie.startsWith('FC') ? 'INVOICE' : 'SALES_RECEIPT';
  // Derivar período desde fecha emisión (dd/mm/yyyy -?' yyyy-MM)
  const per = fecha.length >= 7 ? `${fecha.slice(6,10)}-${fecha.slice(3,5)}` : '-';
  const totalNum = parseFloat((total||'').replace(/[^0-9.]/g,'')) || 0;
  const igvNum   = Math.round(totalNum / 1.18 * 0.18 * 100) / 100;
  const setN = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };

  setN('adtc-serie',      serie);
  setN('adtc-corr',       corr);
  setN('adtc-corrkey',    ruc !== '-' && serie !== '-' ? `${ruc}#${serie}#${corr}` : '-');
  setN('adtc-doctype',    serie.startsWith('FC') ? 'Factura (07)' : 'Boleta (07)');
  setN('adtc-period',     per);
  setN('adtc-fecha',      fecha);
  setN('adtc-ose',        ruc.startsWith('20998') ? 'RAMGAST' : 'BIZLINKS');
  setN('adtc-origen',     origen);
  setN('adtc-origtype',   origType);
  setN('adtc-ruc',        ruc);
  setN('adtc-reason-code',_REASON_CODES[rcCode] || motivo);
  setN('adtc-motivo',     motivo);
  setN('adtc-igv',        `S/ ${igvNum.toFixed(2)}`);
  setN('adtc-total',      total);
  setN('adtc-state',      stText);
  setN('adtc-fase',       fase);
  setN('adtc-lastquery',  st === 'C-10' ? fecha : '-');
  setN('adtc-createdby',  'joel.cauti');
  setN('adtc-created',    fecha);
  setN('adtc-updated',    fecha);

  // Steps
  const [curStep, curStatus, curClass] = _ANUL_STATE_MAP[st] || [0,'-?"',''];
  const stepsEl = document.getElementById('anul-drw-steps');
  stepsEl.innerHTML = '';
  _ANUL_STEPS.forEach((name, i) => {
    const done   = i < curStep;
    const isCur  = i === curStep;
    const isLast = i === _ANUL_STEPS.length - 1;
    const numHtml = done ? '\u2713' : String(i + 1);
    let dotCls, stCls;
    if(done){
      dotCls = 'done'; stCls = 'ok';
    } else if(isCur){
      dotCls = curClass === 'err' ? 'cur-err' : curClass === 'proc' ? 'proc' : 'cur';
      stCls  = curClass;
    } else {
      dotCls = ''; stCls = '';
    }
    const lineCls = done ? 'done' : '';
    const stTxt   = done ? 'Completado' : isCur ? curStatus : 'Pendiente';

    const div = document.createElement('div');
    div.className = 'comp-drw-step';
    div.innerHTML = `
      <div class="comp-drw-step-left">
        <div class="cdstep-dot ${dotCls}">${numHtml}</div>
        ${!isLast ? `<div class="cdstep-line ${lineCls}"></div>` : ''}
      </div>
      <div class="cdstep-content">
        <div class="cdstep-row">
          <span class="cdstep-name">${i+1}. ${name}</span>
          <span class="cdstep-status ${stCls}">${stTxt}</span>
        </div>
        <div class="cdstep-date">${fecha} · 09:14 am</div>
      </div>`;
    stepsEl.appendChild(div);
  });

  anulDrwTab(document.querySelector('#anul-drw .comp-drw-tabs button'), 'atab-estado');

  // Motivo box
  const anulMotivoBox = document.getElementById('anul-drw-motivo');
  const anulMotivoMsg = document.getElementById('anul-drw-motivo-msg');
  const anulMotivoTtl = document.getElementById('anul-drw-motivo-title');
  if(anulMotivoBox && anulMotivoMsg){
    if(_AN_ERRORS[st]){
      anulMotivoMsg.style.whiteSpace = 'pre-line';
      anulMotivoMsg.textContent = _AN_ERRORS[st];
      if(anulMotivoTtl) anulMotivoTtl.textContent = `Motivo de ${stText}`;
      anulMotivoBox.classList.remove('d-none');
    } else {
      anulMotivoBox.classList.add('d-none');
    }
  }

  // Reprocesar button
  const anulRepBtn = document.getElementById('anul-drw-reprocesar');
  const anulRepTxt = document.getElementById('anul-drw-reprocesar-txt');
  const anulFooter = document.getElementById('anul-drw-footer');
  if(anulRepBtn){
    if(_AN_REPROCESAR[st]){
      anulRepTxt.textContent = _AN_REPROCESAR[st];
      anulRepBtn.classList.remove('d-none');
    } else {
      anulRepBtn.classList.add('d-none');
    }
  }
  if(anulFooter) anulFooter.classList.toggle('d-none', !_AN_REPROCESAR[st]);
  document.getElementById('anul-drw-overlay').classList.add('open');
  document.getElementById('anul-drw').classList.add('open');
}

function closeAnulDrawer(){
  document.getElementById('anul-drw-overlay').classList.remove('open');
  document.getElementById('anul-drw').classList.remove('open');
}

function anulDrwTab(btn, tabId){
  document.querySelectorAll('#anul-drw .comp-drw-tabs button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#anul-drw .comp-drw-pane').forEach(p => p.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const pane = document.getElementById(tabId);
  if(pane) pane.classList.add('active');
}

// -"?-"? Modal Iniciar Anulación -"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?-"?
let _lastCompBtn = null; // referencia al botón "Ver detalles" del comprobante activo
function openAnulacionModal() {
  // Cierra el drawer de comprobante
  document.getElementById('comp-drw-overlay')?.classList.remove('open');
  document.getElementById('comp-drw')?.classList.remove('open');
  // Resetea y abre el modal
  document.getElementById('anlm-motivo').value = '';
  document.getElementById('anlm-detalle').value = '';
  document.getElementById('anlm-counter').textContent = '00/30';
  document.getElementById('anulacion-modal-bg').classList.add('open');
}

function closeAnulacionModal() {
  document.getElementById('anulacion-modal-bg').classList.remove('open');
}

function anlmCountChars() {
  const len = document.getElementById('anlm-detalle').value.length;
  document.getElementById('anlm-counter').textContent =
    String(len).padStart(2, '0') + '/30';
}

function confirmAnulacion() {
  const motivo = document.getElementById('anlm-motivo').value;
  if (!motivo) {
    showToast('Selecciona un motivo de anulación');
    return;
  }
  // Leer serie-correlativo del drawer para el mensaje de confirmación
  const serieCorr = document.getElementById('comp-drw-serie')?.textContent.trim() || '-';
  document.getElementById('anulacion-confirm-sub').innerHTML =
    `Al confirmar, se enviará la solicitud de anulación del comprobante <b>${serieCorr}</b> para su revisión y aprobación.`;
  // Cerrar modal de motivo y abrir confirmación
  document.getElementById('anulacion-modal-bg').classList.remove('open');
  document.getElementById('anulacion-confirm-bg').classList.add('open');
}

function closeAnulacionConfirm() {
  document.getElementById('anulacion-confirm-bg').classList.remove('open');
}

function confirmAnulacionFinal() {
  closeAnulacionConfirm();
  // Actualizar el data attribute de la fila para persistir el estado
  if (_lastCompBtn) {
    _lastCompBtn.closest('tr').dataset.cancellationStatus = 'IN_PROGRESS';
  }
  // Mostrar alerta amber y ocultar botón de anulación
  document.getElementById('comp-drw-anul-alert')?.classList.remove('d-none');
  document.getElementById('comp-drw-anular')?.classList.add('d-none');
  // Reabrir el drawer con el estado actualizado
  document.getElementById('comp-drw-overlay').classList.add('open');
  document.getElementById('comp-drw').classList.add('open');
  showToast('Anulación iniciada correctamente');
}


// ?? Bandeja de Revisi-n ?????????????????????????????????????
function updateBandejaKPIs(){
  const rows = Array.from(document.querySelectorAll('#band-table tbody tr:not(.row-filtered)'));
  let total=rows.length, carga=0, emision=0, sunat=0, pagos=0;
  rows.forEach(row => {
    const badge = row.querySelector('[data-state]');
    if(!badge) return;
    const st = badge.dataset.state;
    if(st==='C-03') carga++;
    else if(st==='C-06'||st==='C-07') emision++;
    else if(st==='C-09') sunat++;
    else if(st==='C-12') pagos++;
  });
  const el = id => document.getElementById(id);
  if(el('band-kpi-total'))   el('band-kpi-total').textContent   = total;
  if(el('band-kpi-carga'))   el('band-kpi-carga').textContent   = carga;
  if(el('band-kpi-emision')) el('band-kpi-emision').textContent = emision;
  if(el('band-kpi-sunat'))   el('band-kpi-sunat').textContent   = sunat;
  if(el('band-kpi-pagos'))   el('band-kpi-pagos').textContent   = pagos;
}

function initBandejaPagination(){
  if(!document.getElementById('band-table')) return;
  let page = 1, size = 10;
  function getRows(){ return Array.from(document.querySelectorAll('#band-table tbody tr:not(.row-filtered)')); }
  function render(){
    const rows = getRows(), total = rows.length;
    const pages = Math.max(1, Math.ceil(total / size));
    page = Math.max(1, Math.min(page, pages));
    const from = (page-1)*size, to = Math.min(from+size, total);
    document.querySelectorAll('#band-table tbody tr').forEach(r => { if(!r.classList.contains('row-filtered')) r.style.display='none'; });
    rows.forEach((r,i) => {
      r.style.display = (i>=from && i<to) ? '' : 'none';
      r.classList.toggle('row-stripe', i>=from && i<to && (i-from)%2!==0);
    });
    const info = document.getElementById('band-pager-info');
    if(info) info.textContent = total ? `${from+1}-${to} de ${total} comprobantes` : '0 comprobantes';
    const ctrls = document.getElementById('band-pager-ctrls');
    if(!ctrls) return;
    function range(cur,tot){
      if(tot<=7) return Array.from({length:tot},(_,i)=>i+1);
      const r=[1]; if(cur>3) r.push('...');
      for(let p=Math.max(2,cur-1);p<=Math.min(tot-1,cur+1);p++) r.push(p);
      if(cur<tot-2) r.push('...'); r.push(tot); return r;
    }
    let h=`<button onclick="bandPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    range(page,pages).forEach(p=>{
      if(p==='...') h+='<button class="pager-ellipsis" disabled>...</button>';
      else h+=`<button class="${p===page?'active':''}" onclick="bandPage(${p})">${p}</button>`;
    });
    h+=`<button onclick="bandPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML=h;
  }
  window.bandPage = p => { const pages=Math.ceil(getRows().length/size); if(p<1||p>pages) return; page=p; render(); };
  const sel = document.getElementById('band-page-size');
  if(sel){ size=parseInt(sel.value)||10; sel.addEventListener('change',function(){ size=parseInt(this.value)||10; page=1; render(); }); }
  render(); window.bandRender = render;
}

function initBandejaFilters(){
  if(!document.getElementById('band-table')) return;
  const inp       = document.getElementById('band-search');
  const selFase   = document.getElementById('band-fase');
  const selEstado = document.getElementById('band-estado');
  const selTipo   = document.getElementById('band-tipo');
  const selPer    = document.getElementById('band-periodo');
  const btnBuscar = document.getElementById('band-buscar-btn');
  const btnLimpiar= document.getElementById('band-limpiar-btn');
  // Cols: 0=ID Lote|1=RUC|2=StoreID|3=Tipo|4=Serie|5=Corr|6=Per|7=Total|8=Fase|9=Estado|10=Acc
  function apply(){
    const txt  = inp       ? inp.value.trim().toLowerCase() : '';
    const fase = selFase   ? selFase.value   : '';
    const est  = selEstado ? selEstado.value : '';
    const tipo = selTipo   ? selTipo.value   : '';
    const per  = selPer    ? selPer.value    : '';
    document.querySelectorAll('#band-table tbody tr').forEach(row => {
      const tds = row.querySelectorAll('td');
      if(tds.length < 10) return;
      const ruc=tds[1].textContent.toLowerCase(), storeid=tds[2].textContent.toLowerCase();
      const tipoVal=tds[3].textContent.trim();
      const serie=tds[4].textContent.toLowerCase(), corr=tds[5].textContent.toLowerCase();
      const perVal=tds[6].textContent.trim(), faseVal=tds[8].textContent.trim();
      const badge=tds[9].querySelector('[data-state]'), st=badge?badge.dataset.state:'';
      let m=true;
      if(txt  && !ruc.includes(txt)&&!storeid.includes(txt)&&!serie.includes(txt)&&!corr.includes(txt)) m=false;
      if(fase && faseVal!==fase) m=false;
      if(est  && st!==est)       m=false;
      if(tipo && tipoVal!==tipo) m=false;
      if(per  && perVal!==per)   m=false;
      row.classList.toggle('row-filtered',!m);
    });
    updateBandejaKPIs();
    if(window.bandRender) window.bandRender();
  }
  function clear(){
    if(inp) inp.value='';
    if(selFase)   { selFase.selectedIndex   = 0; selFase.dispatchEvent(new Event('change')); }
    if(selEstado) { selEstado.selectedIndex = 0; selEstado.dispatchEvent(new Event('change')); }
    if(selTipo)   { selTipo.selectedIndex   = 0; selTipo.dispatchEvent(new Event('change')); }
    if(selPer)    { selPer.selectedIndex    = 0; selPer.dispatchEvent(new Event('change')); }
    document.querySelectorAll('#band-table tbody tr').forEach(r=>r.classList.remove('row-filtered'));
    updateBandejaKPIs();
    if(window.bandRender) window.bandRender();
  }
  if(btnBuscar)  btnBuscar.addEventListener('click', apply);
  if(btnLimpiar) btnLimpiar.addEventListener('click', clear);
  if(inp)        inp.addEventListener('keydown', e=>{ if(e.key==='Enter') apply(); });
  if(selFase)    selFase.addEventListener('change', apply);
  if(selEstado)  selEstado.addEventListener('change', apply);
  if(selTipo)    selTipo.addEventListener('change', apply);
  if(selPer)     selPer.addEventListener('change', apply);
}

function initBandejaComponents(){
  initBandejaPagination();
  initBandejaFilters();
  updateBandejaKPIs();
}

function openBandejaNCDetalle(btn){
  const row=btn.closest('tr'), tds=row.querySelectorAll('td');
  const ruc=tds[1]?.textContent.trim()||'-', serie=tds[4]?.textContent.trim()||'-';
  const corr=tds[5]?.textContent.trim()||'-', per=tds[6]?.textContent.trim()||'-';
  const total=tds[7]?.textContent.trim()||'-', fase=tds[8]?.textContent.trim()||'-';
  const badge=tds[9]?.querySelector('[data-state]');
  const st=badge?.dataset.state||'', stText=badge?.textContent.trim()||'-';
  const motivo=row.dataset.motivo||'', nombre=_AGENT_NAMES[ruc]||ruc;
  const serieCorr=`${serie}-${corr}`;

  document.getElementById('anul-drw-fecha').textContent=`Per\u00edodo: ${per}`;
  document.getElementById('anul-drw-nombre').textContent=nombre;
  document.getElementById('anul-drw-serie').textContent=serieCorr;
  document.getElementById('anul-drw-fase').textContent=fase;
  document.getElementById('anul-drw-dl-btns')?.classList.add('d-none');
  const stEl=document.getElementById('anul-drw-estado'); stEl.innerHTML='';
  if(badge) stEl.appendChild(badge.cloneNode(true)); else stEl.textContent=stText;

  document.getElementById('adta-ruc').textContent=ruc;
  document.getElementById('adta-tipo').textContent=ruc.startsWith('10')?'Persona Natural':'Persona Jur\u00eddica';
  document.getElementById('adta-nombre').textContent=nombre;
  document.getElementById('adta-ose').textContent=ruc.startsWith('20998')?'RAMGAST':'BIZLINKS';

  const setN=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setN('adtc-serie',serie); setN('adtc-corr',corr);
  setN('adtc-corrkey',`${ruc}#${serie}#${corr}`);
  setN('adtc-doctype',serie.startsWith('FC')?'Factura (07)':'Boleta (07)');
  setN('adtc-period',per); setN('adtc-fecha','-');
  setN('adtc-ose',ruc.startsWith('20998')?'RAMGAST':'BIZLINKS');
  setN('adtc-origen','-'); setN('adtc-origtype',serie.startsWith('FC')?'INVOICE':'SALES_RECEIPT');
  setN('adtc-ruc',ruc); setN('adtc-motivo',motivo);
  setN('adtc-igv','-'); setN('adtc-total',total);
  setN('adtc-state',stText); setN('adtc-fase',fase);
  setN('adtc-lastquery','-'); setN('adtc-createdby','sistema');
  setN('adtc-created','-'); setN('adtc-updated','-');

  const [curStep,curStatus,curClass]=_ANUL_STATE_MAP[st]||[0,'-',''];
  const stepsEl=document.getElementById('anul-drw-steps'); stepsEl.innerHTML='';
  _ANUL_STEPS.forEach((name,i)=>{
    const done=i<curStep,isCur=i===curStep,isLast=i===_ANUL_STEPS.length-1;
    const nh=done?'\u2713':String(i+1);
    let dc='',sc='';
    if(done){dc='done';sc='ok';}
    else if(isCur){dc=curClass==='err'?'cur-err':curClass==='proc'?'proc':'cur';sc=curClass;}
    const st2=done?'Completado':isCur?curStatus:'Pendiente';
    const div=document.createElement('div'); div.className='comp-drw-step';
    div.innerHTML=`<div class="comp-drw-step-left"><div class="cdstep-dot ${dc}">${nh}</div>${!isLast?`<div class="cdstep-line ${done?'done':''}"></div>`:''}</div><div class="cdstep-content"><div class="cdstep-row"><span class="cdstep-name">${i+1}. ${name}</span><span class="cdstep-status ${sc}">${st2}</span></div><div class="cdstep-date">Sin fecha registrada</div></div>`;
    stepsEl.appendChild(div);
  });

  const repBtn=document.getElementById('anul-drw-reprocesar');
  const repTxt=document.getElementById('anul-drw-reprocesar-txt');
  const footer=document.getElementById('anul-drw-footer');
  if(repBtn){if(_AN_REPROCESAR[st]){repTxt.textContent=_AN_REPROCESAR[st];repBtn.classList.remove('d-none');}else repBtn.classList.add('d-none');}
  if(footer) footer.classList.toggle('d-none',!_AN_REPROCESAR[st]);

  anulDrwTab(document.querySelector('#anul-drw .comp-drw-tabs button'),'atab-estado');
  document.getElementById('anul-drw-overlay').classList.add('open');
  document.getElementById('anul-drw').classList.add('open');
}

function openBandejaDetalle(btn){
  _lastCompBtn = btn;
  const row = btn.closest('tr');
  const tds = row.querySelectorAll('td');

  // Bandeja cols: 0=ID Lote|1=RUC|2=StoreID|3=Tipo|4=Serie|5=Corr|6=Per|7=Total|8=Fase|9=Estado|10=Acc
  const ruc    = tds[1]?.textContent.trim() || '-';
  const tipo   = tds[3]?.textContent.trim() || '-';
  const serie  = tds[4]?.textContent.trim() || '-';
  const corr   = tds[5]?.textContent.trim() || '-';
  const per    = tds[6]?.textContent.trim() || '-';
  const total  = tds[7]?.textContent.trim() || '-';
  const fase   = tds[8]?.textContent.trim() || '-';
  const badge  = tds[9]?.querySelector('[data-state]');
  const st     = badge?.dataset.state || '';
  const stText = badge?.textContent.trim() || '-';
  const storeId= tds[2]?.textContent.trim() || '-';
  const loteId = tds[0]?.textContent.trim() || '-';
  const motivo = row.dataset.motivo || '';

  const nombre    = _AGENT_NAMES[ruc] || ruc;
  const serieCorr = (serie !== '-' && corr !== '-') ? `${serie}-${corr}` : '-';
  const cancelSt  = row.dataset.cancellationStatus || 'NONE';

  // Alerta amber
  const amberShown = cancelSt === 'IN_PROGRESS';
  document.getElementById('comp-drw-anul-alert')?.classList.toggle('d-none', !amberShown);

  // Header
  document.getElementById('comp-drw-cargada').textContent = `Per\u00edodo: ${per}`;
  document.getElementById('comp-drw-nombre').textContent  = nombre;
  document.getElementById('comp-drw-serie').textContent   = serieCorr;
  document.getElementById('comp-drw-fase').textContent    = fase;

  const stEl = document.getElementById('comp-drw-estado');
  stEl.innerHTML = '';
  if(badge){ stEl.appendChild(badge.cloneNode(true)); } else { stEl.textContent = stText; }

  // Agente tab
  const rucN2b  = parseInt(ruc.replace(/\D/g,'').slice(-3)) || 0;
  const [agUbDpto, agUbProv, agUbDist] = ['Lima','Lima','Lima'];
  const setA = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setA('cdta-ruc',           ruc);
  setA('cdta-tipo',          ruc.startsWith('10') ? 'Persona Natural' : 'Persona Jur\u00eddica');
  setA('cdta-nombre',        nombre);
  setA('cdta-ubigeo',        '150101');
  setA('cdta-dpto',          agUbDpto);
  setA('cdta-prov',          agUbProv);
  setA('cdta-dist',          agUbDist);
  setA('cdta-selfbilling',   'S\u00ed');
  setA('cdta-selfbilling-date', '01/01/2024');
  setA('cdta-ose',           ruc.startsWith('20998') ? 'RAMGAST' : 'BIZLINKS');
  setA('cdta-detrac-acc',    `00-000-${(100000+rucN2b).toString().slice(-6)}`);
  setA('cdta-created',       '01/01/2022');
  setA('cdta-updated',       per);

  // Comprobante tab - campos disponibles, resto con defaults
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  const _ENTIDAD_MAP_B = {'20481230000':'BBVA Continental','20567890123':'BCP','20484445556':'Interbank','10987654321':'Scotiabank','20112233445':'BCP','20998877665':'Pichincha'};
  const rucNb = parseInt(ruc.replace(/\D/g,'').slice(-4)) || 0;
  const fbBank = _ENTIDAD_MAP_B[ruc] || ['BCP','BBVA Continental','Interbank'][rucNb%3];
  const totalNum = parseFloat((total||'').replace(/[^0-9.]/g,'')) || 0;
  const igvNum   = Math.round(totalNum / 1.18 * 0.18 * 100) / 100;
  const baseNum  = totalNum - igvNum;
  const fmtS = n => n > 0 ? `S/ ${n.toFixed(2)}` : '-';
  set('cdtc-lote',      loteId);  set('cdtc-tipo',      tipo);
  set('cdtc-serie',     serie);   set('cdtc-corr',      corr);
  set('cdtc-corrkey',   `${ruc}#${serie}#${corr}`);
  set('cdtc-fecha',     '-');     set('cdtc-per',       per);
  set('cdtc-optype',    '0101 \u2014 Venta interna');
  set('cdtc-storeid',   storeId);
  set('cdtc-storename', '-');
  set('cdtc-ruc',       ruc);     set('cdtc-agenttype', ruc.startsWith('10') ? 'Persona Natural':'Persona Jur\u00eddica');
  set('cdtc-razon',     nombre);  set('cdtc-segm',      '-');
  set('cdtc-ubigeo',    '150101'); set('cdtc-dpto','Lima'); set('cdtc-prov','Lima'); set('cdtc-dist','Lima');
  set('cdtc-dir',       '-');     set('cdtc-email',     '-');
  set('cdtc-entidad',   fbBank);  set('cdtc-acctype',   '-');
  set('cdtc-accnum',    '-');     set('cdtc-cci',       '-');  set('cdtc-holder', nombre);
  set('cdtc-base',      fmtS(baseNum)); set('cdtc-igv', fmtS(igvNum)); set('cdtc-total', total);
  set('cdtc-exo',       'No');    set('cdtc-comm',      total); set('cdtc-bonus','S/ 0.00'); set('cdtc-disc','S/ 0.00');
  set('cdtc-ose',       ruc.startsWith('20998') ? 'RAMGAST':'BIZLINKS');
  set('cdtc-intentos',  ['C-06','C-07','C-09'].includes(st) ? '3':'1');
  set('cdtc-lastquery', '-'); set('cdtc-queryresult','-');
  set('cdtc-approved',  '-'); set('cdtc-cancelst',  'Sin anulaci\u00f3n');
  document.getElementById('cdtc-detrac-section')?.classList.add('d-none');

  // Motivo box - siempre visible en bandeja (todos los estados son error)
  const motivoBox = document.getElementById('comp-drw-motivo');
  const motivoMsg = document.getElementById('comp-drw-motivo-msg');
  const motivoTtl = document.getElementById('comp-drw-motivo-title');
  if(motivoBox && motivoMsg && motivo){
    motivoMsg.style.whiteSpace = 'pre-line';
    motivoMsg.textContent = motivo;
    if(motivoTtl) motivoTtl.textContent = `Motivo de ${stText}`;
    motivoBox.classList.remove('d-none');
  }

  // Steps
  const [curStep, curStatus, curClass] = _COMP_STATE_MAP[st] || [0,'-',''];
  const stepsEl = document.getElementById('comp-drw-steps');
  stepsEl.innerHTML = '';
  _COMP_STEPS.forEach((name, i) => {
    const done=i<curStep, isCur=i===curStep, isLast=i===_COMP_STEPS.length-1;
    const numHtml=done?'\u2713':String(i+1);
    let dotCls,stCls;
    if(done){ dotCls='done'; stCls='ok'; }
    else if(isCur){ dotCls=curClass==='err'?'cur-err':curClass==='proc'?'proc':'cur'; stCls=curClass; }
    else { dotCls=''; stCls=''; }
    const stTxt=done?'Completado':isCur?curStatus:'Pendiente';
    const div=document.createElement('div'); div.className='comp-drw-step';
    div.innerHTML=`<div class="comp-drw-step-left"><div class="cdstep-dot ${dotCls}">${numHtml}</div>${!isLast?`<div class="cdstep-line ${done?'done':''}"></div>`:''}</div><div class="cdstep-content"><div class="cdstep-row"><span class="cdstep-name">${i+1}. ${name}</span><span class="cdstep-status ${stCls}">${stTxt}</span></div><div class="cdstep-date">Sin fecha registrada</div></div>`;
    stepsEl.appendChild(div);
  });

  // Botones footer
  const SUNAT_PASS = new Set(['C-10','C-11','C-12','C-13','C-14','C-15','C-16','C-17']);
  const amberShown2 = cancelSt === 'IN_PROGRESS';
  const dlBtns  = document.getElementById('comp-drw-dl-btns');
  const footer  = document.getElementById('comp-drw-footer');
  const anularBtn = document.getElementById('comp-drw-anular');
  const repBtn  = document.getElementById('comp-drw-reprocesar');
  const repTxt  = document.getElementById('comp-drw-reprocesar-txt');
  if(dlBtns)    dlBtns.classList.add('d-none');
  if(anularBtn) anularBtn.classList.add('d-none');
  if(repBtn){
    if(_CD_REPROCESAR[st]){ repTxt.textContent=_CD_REPROCESAR[st]; repBtn.classList.remove('d-none'); }
    else repBtn.classList.add('d-none');
  }
  if(footer) footer.classList.toggle('d-none', !_CD_REPROCESAR[st]);

  // Activar modo edición en tabs comp y agente
  const drwEl = document.getElementById('comp-drw');
  if(drwEl) drwEl.classList.add('drw-edit-mode');
  document.querySelectorAll('#cdtab-comp .cdtc-value, #cdtab-agente .cdtc-value').forEach(el => {
    el.setAttribute('contenteditable', 'true');
  });
  document.getElementById('comp-drw-guardar')?.classList.remove('d-none');

  // Reset tab inicial
  compDrwTab(document.querySelector('#comp-drw .comp-drw-tabs button'), 'cdtab-estado');
  document.getElementById('comp-drw-overlay').classList.add('open');
  drwEl.classList.add('open');
}

function ppTab(btn, tabId){
  document.querySelectorAll('.pp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.pp-pane').forEach(p => p.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const pane = document.getElementById(tabId);
  if(pane) pane.classList.add('active');
}

function guardarCambiosBandeja(){
  showToast('Cambios guardados correctamente');
  document.getElementById('comp-drw-overlay').classList.remove('open');
  document.getElementById('comp-drw').classList.remove('open');
  document.getElementById('comp-drw').classList.remove('drw-edit-mode');
}


// ── Vista por lotes (ppp-table) ─────────────────────────────
function initPppPagination(){
  if(!document.getElementById('ppp-table')) return;
  let page=1, size=10;
  function getRows(){ return Array.from(document.querySelectorAll('#ppp-table tbody tr:not(.row-filtered)')); }
  function render(){
    const rows=getRows(), total=rows.length;
    const pages=Math.max(1,Math.ceil(total/size));
    page=Math.max(1,Math.min(page,pages));
    const from=(page-1)*size, to=Math.min(from+size,total);
    document.querySelectorAll('#ppp-table tbody tr').forEach(r=>{ if(!r.classList.contains('row-filtered')) r.style.display='none'; });
    rows.forEach((r,i)=>{ r.style.display=(i>=from&&i<to)?'':'none'; r.classList.toggle('row-stripe',i>=from&&i<to&&(i-from)%2!==0); });
    const info=document.getElementById('ppp-pager-info');
    if(info) info.textContent=total?`${from+1}-${to} de ${total} lotes`:'0 lotes';
    const ctrls=document.getElementById('ppp-pager-ctrls');
    if(!ctrls) return;
    let h=`<button onclick="pppPage(${page-1})"${page===1?' disabled':''}>&#8249;</button>`;
    function range(cur,tot){
      if(tot<=7) return Array.from({length:tot},(_,i)=>i+1);
      const r=[1]; if(cur>3) r.push('...');
      for(let p=Math.max(2,cur-1);p<=Math.min(tot-1,cur+1);p++) r.push(p);
      if(cur<tot-2) r.push('...'); r.push(tot); return r;
    }
    range(page,pages).forEach(p=>{
      if(p==='...') h+='<button class="pager-ellipsis" disabled>...</button>';
      else h+=`<button class="${p===page?'active':''}" onclick="pppPage(${p})">${p}</button>`;
    });
    h+=`<button onclick="pppPage(${page+1})"${page===pages?' disabled':''}>&#8250;</button>`;
    ctrls.innerHTML=h;
  }
  window.pppPage=p=>{ const pages=Math.ceil(getRows().length/size); if(p<1||p>pages) return; page=p; render(); };
  const sel=document.getElementById('ppp-page-size');
  if(sel){ size=parseInt(sel.value)||10; sel.addEventListener('change',function(){ size=parseInt(this.value)||10; page=1; render(); }); }
  render(); window.pppRender=render;
}

function initPppFilters(){
  if(!document.getElementById('ppp-table')) return;
  const inp     = document.getElementById('ppp-search');
  const selPer  = document.getElementById('ppp-periodo');
  const selEst  = document.getElementById('ppp-estado');
  const btnB    = document.getElementById('ppp-buscar-btn');
  const btnL    = document.getElementById('ppp-limpiar-btn');
  // Cols: 0=ID lote|1=Periodo|2=Total|3=SUNAT apr.|4=Pago obs.|5=Pago pend.|6=Pago prog.|7=Estado|8=Programacion|9=Acciones
  function apply(){
    const txt = inp    ? inp.value.trim().toLowerCase() : '';
    const per = selPer ? selPer.value : '';
    const est = selEst ? selEst.value : '';
    document.querySelectorAll('#ppp-table tbody tr').forEach(row=>{
      const tds=row.querySelectorAll('td');
      if(tds.length<8) return;
      const lote   = tds[0].textContent.toLowerCase();
      const perVal = tds[1].textContent.trim();
      const badge  = tds[7].querySelector('.badge-2, .badge');
      const estVal = badge ? badge.textContent.trim() : '';
      let m=true;
      if(txt && !lote.includes(txt)) m=false;
      if(per && perVal!==per) m=false;
      if(est && estVal!==est) m=false;
      row.classList.toggle('row-filtered',!m);
    });
    if(window.pppRender) window.pppRender();
  }
  function clear(){
    if(inp)    inp.value='';
    if(selPer) { selPer.selectedIndex=0; selPer.dispatchEvent(new Event('change')); }
    if(selEst) { selEst.selectedIndex=0; selEst.dispatchEvent(new Event('change')); }
    document.querySelectorAll('#ppp-table tbody tr').forEach(r=>r.classList.remove('row-filtered'));
    if(window.pppRender) window.pppRender();
  }
  if(btnB) btnB.addEventListener('click', apply);
  if(btnL) btnL.addEventListener('click', clear);
  if(inp) inp.addEventListener('keydown', e=>{ if(e.key==='Enter') apply(); });
  if(selPer) selPer.addEventListener('change', apply);
  if(selEst) selEst.addEventListener('change', apply);
}

function initPppComponents(){
  initPppPagination();
  initPppFilters();
  applyDateBadges('#ppp-table');
  applyDateBadges('#pp-table');
  applyMutedProg('#ppp-table', 7, 8, function(st, txt){ return txt === 'Pagado'; });
  applyMutedProg('#pp-table', 8, 11, function(st){ return st === 'C-16'; });
}

function applyDateBadges(tableSelector){
  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const manana = new Date(); manana.setDate(manana.getDate()+1);
  const tomorrowStr = manana.getFullYear()+'-'+String(manana.getMonth()+1).padStart(2,'0')+'-'+String(manana.getDate()).padStart(2,'0');

  // Inyectar fecha de manana en celdas marcadas con ppp-tomorrow
  document.querySelectorAll(tableSelector+' td.ppp-tomorrow').forEach(td => { td.textContent = tomorrowStr; });

  // Aplicar badge a todas las celdas con clase pp-prog-cell
  document.querySelectorAll(tableSelector+' td.pp-prog-cell, '+tableSelector+' td.ppp-tomorrow').forEach(fechaTd => {
    const txt = fechaTd.textContent.trim();
    if(txt==='-'||txt===''||txt==='\u2014') return;
    const parts = txt.split('-').map(Number); if(parts.length<3) return;
    const [y,m,d] = parts; if(!y||!m||!d) return;
    const fp = new Date(y,m-1,d); fp.setHours(0,0,0,0);
    const diff = (fp-hoy)/(1000*60*60*24);
    const lbl = d+' '+MESES[m-1];
    fechaTd.dataset.raw = txt;
    if(diff<0) fechaTd.innerHTML='<span class="pp-date-past"><i class="icon-alert-triangle"></i>'+lbl+'</span>';
    else if(diff<=1) fechaTd.innerHTML='<span class="pp-date-soon"><i class="icon-clock"></i>'+lbl+'</span>';
    else fechaTd.innerHTML='<span class="pp-date-ok"><i class="icon-calendar"></i>'+lbl+'</span>';
  });}

// ── Programación en muted para estados finales ──────────────
function applyMutedProg(tableSelector, stateColIdx, progColIdx, mutedCheck){
  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  document.querySelectorAll(tableSelector+' tbody tr').forEach(row=>{
    const tds = row.querySelectorAll('td');
    if(tds.length <= Math.max(stateColIdx, progColIdx)) return;
    const badge    = tds[stateColIdx].querySelector('[data-state]');
    const stateVal = badge ? badge.dataset.state : '';
    const stateTxt = badge ? badge.textContent.trim() : tds[stateColIdx].textContent.trim();
    if(!mutedCheck(stateVal, stateTxt)) return;
    const progTd = tds[progColIdx];
    const raw = progTd.dataset.raw || progTd.textContent.trim();
    let display = '\u2014';
    if(raw && raw !== '\u2014' && raw !== '-' && raw !== ''){
      const parts = raw.split('-').map(Number);
      if(parts.length === 3){
        const [y,m,d] = parts;
        if(y && m && d) display = d+' '+MESES[m-1];
      }
    }
    progTd.innerHTML = '<span class="pp-prog-muted"><i class="icon-check"></i>'+display+'</span>';
  });
}

// ── Drawer detalle lote en pago ─────────────────────────────
function openPppDetalle(btn){
  const row = btn.closest('tr');
  const tds = row.querySelectorAll('td');
  // Cols: 0=ID lote|1=Periodo|2=Total|3=SUNAT|4=Obs|5=Pend|6=Prog|7=Estado|8=Fecha|9=Acc
  const id    = tds[0]?.textContent.trim() || '-';
  const per   = tds[1]?.textContent.trim() || '-';
  const total = tds[2]?.textContent.trim() || '-';
  const sunat = tds[3]?.textContent.trim() || '-';
  const obs   = tds[4]?.textContent.trim() || '-';
  const pend  = tds[5]?.textContent.trim() || '-';
  const prog  = tds[6]?.textContent.trim() || '-';
  const badge = tds[7]?.querySelector('.badge, .badge-2');
  const fecha = tds[8]?.textContent.trim() || '';

  document.getElementById('ppp-drw-id').textContent  = id;
  document.getElementById('ppp-drw-period').textContent = per;
  document.getElementById('ppp-drw-total').textContent = total;
  document.getElementById('ppp-drw-sunat').textContent = sunat;
  document.getElementById('ppp-drw-obs').textContent   = obs;
  document.getElementById('ppp-drw-pend').textContent  = pend;
  document.getElementById('ppp-drw-prog').textContent  = prog;

  const stEl = document.getElementById('ppp-drw-estado');
  stEl.innerHTML = '';
  if(badge) stEl.appendChild(badge.cloneNode(true));

  // Fecha en input date (formato yyyy-MM-dd)
  const fi = document.getElementById('ppp-drw-fecha');
  if(fi){
    const rawDate = tds[8]?.dataset?.raw || '';
    fi.value = rawDate || (fecha.match(/\d{4}-\d{2}-\d{2}/) ? fecha : '');
  }

  // Texto del botón: siempre "Guardar"
  const guardarBtn = document.querySelector('#ppp-drw .drw-btn-action');
  if(guardarBtn){
    guardarBtn.innerHTML = '<i class="icon-save"></i> Guardar';
  }

  document.getElementById('ppp-drw-overlay').classList.add('open');
  document.getElementById('ppp-drw').classList.add('open');
  // Inicializar datepicker al abrir el drawer
  initKnDatePicker('ppp-dp-panel', 'ppp-drw-fecha-display', 'ppp-drw-fecha');
}

function closePppDrawer(){
  document.getElementById('ppp-drw-overlay').classList.remove('open');
  document.getElementById('ppp-drw').classList.remove('open');
}

function openCruceSunatModal(){
  const lotId = document.getElementById('ppp-drw-id')?.textContent || '-';
  const lotEl = document.getElementById('cruce-sunat-lot');
  if(lotEl) lotEl.textContent = lotId;
  closePppDrawer();
  document.getElementById('cruce-sunat-modal-bg').classList.add('open');
}

function closeCruceSunatModal(){
  document.getElementById('cruce-sunat-modal-bg').classList.remove('open');
}

function confirmCruceSunat(){
  closeCruceSunatModal();
  closePppDrawer();
  showToast('Cruce con SUNAT iniciado correctamente');
}

function guardarProgramacion(){
  const fechaISO  = document.getElementById('ppp-drw-fecha')?.value;
  const fechaDisp = document.getElementById('ppp-drw-fecha-display')?.value;
  if(!fechaISO && !fechaDisp){
    showToast('Selecciona una fecha de programaci' + String.fromCharCode(0xF3) + 'n');
    return;
  }
  const lotId = document.getElementById('ppp-drw-id')?.textContent || '-';
  const esReprog = document.querySelector('#ppp-drw .drw-btn-action')?.textContent?.trim().includes('Reprogramar');
  document.getElementById('prog-confirm-title').textContent = esReprog ? 'Reprogramar fecha de pago?' : 'Programar fecha de pago?';
  document.getElementById('prog-confirm-lot').textContent   = lotId;
  document.getElementById('prog-confirm-fecha').textContent = fechaDisp || fechaISO;
  closePppDrawer();
  document.getElementById('prog-confirm-modal-bg').classList.add('open');
}

function closeProgConfirmModal(){
  document.getElementById('prog-confirm-modal-bg').classList.remove('open');
}

function confirmProgramacion(){
  closeProgConfirmModal();
  showToast('Programaci' + String.fromCharCode(0xF3) + 'n guardada correctamente');
}

// ── KN Custom Datepicker ─────────────────────────────────────
function initKnDatePicker(panelId, displayInputId, hiddenInputId){
  const panel   = document.getElementById(panelId);
  const display = document.getElementById(displayInputId);
  const hidden  = document.getElementById(hiddenInputId);
  if(!panel || !display) return;

  // Solo inicializar una vez
  if(display.dataset.dpInit) return;
  display.dataset.dpInit = '1';

  // Mover panel al body para evitar clipping
  if(panel.parentElement !== document.body) document.body.appendChild(panel);

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DIAS  = ['Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b','Dom'];
  const MESES_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  let viewYear  = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  let selected  = null;
  const today   = new Date(); today.setHours(0,0,0,0);

  function fmtDisplay(d){ return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); }
  function fmtISO(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

  function render(){
    // First day of month (0=Sun..6=Sat) → convert to Mon-first (0=Mon..6=Sun)
    const fd = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (fd === 0) ? 6 : fd - 1; // Mon-first offset
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();

    let html = '<div class="kn-dp-panel-nav">';
    html += '<button class="kn-dp-nav-prev" data-nav="-1">&#8249;</button>';
    html += '<span class="kn-dp-month-year">' + MESES[viewMonth] + '&nbsp;&nbsp;' + viewYear + '</span>';
    html += '<button class="kn-dp-nav-next" data-nav="1">&#8250;</button>';
    html += '</div>';
    html += '<div class="kn-dp-grid">';
    html += '<div class="kn-dp-week-row">' + DIAS.map(d=>'<span>'+d+'</span>').join('') + '</div>';
    html += '<div class="kn-dp-days-grid">';

    // Prev month days
    for(let i=startOffset-1;i>=0;i--){
      const d = prevDays - i;
      html += `<button class="kn-dp-day other-month" data-y="${viewYear}" data-m="${viewMonth-1}" data-d="${d}">${d}</button>`;
    }
    // Current month days
    for(let d=1;d<=daysInMonth;d++){
      const dt = new Date(viewYear,viewMonth,d); dt.setHours(0,0,0,0);
      const isSel  = selected && dt.getTime()===selected.getTime();
      const isToday = dt.getTime()===today.getTime();
      const isPast  = dt < today;
      let cls = 'kn-dp-day';
      if(isSel) cls += ' selected';
      else if(isToday) cls += ' today';
      if(isPast) cls += ' kn-dp-disabled';
      html += `<button class="${cls}" data-y="${viewYear}" data-m="${viewMonth}" data-d="${d}"${isPast?' disabled':''}>${d}</button>`;
    }
    // Next month days
    const totalCells = startOffset + daysInMonth;
    const nextDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for(let d=1;d<=nextDays;d++){
      html += `<button class="kn-dp-day other-month" data-y="${viewYear}" data-m="${viewMonth+1}" data-d="${d}">${d}</button>`;
    }
    html += '</div></div>';
    panel.innerHTML = html;

    panel.querySelectorAll('[data-nav]').forEach(btn=>{
      btn.addEventListener('click', e=>{ e.stopPropagation();
        viewMonth += parseInt(btn.dataset.nav);
        if(viewMonth<0){viewMonth=11;viewYear--;} else if(viewMonth>11){viewMonth=0;viewYear++;}
        render();
      });
    });
    panel.querySelectorAll('[data-d]').forEach(btn=>{
      btn.addEventListener('click', e=>{ e.stopPropagation();
        const y=parseInt(btn.dataset.y), m=parseInt(btn.dataset.m), d=parseInt(btn.dataset.d);
        selected = new Date(y,m,d); selected.setHours(0,0,0,0);
        viewYear=y; viewMonth=((m%12)+12)%12;
        display.value = fmtDisplay(selected);
        if(hidden) hidden.value = fmtISO(selected);
        render(); closePanel();
      });
    });
  }

  function positionPanel(){
    const rect = display.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    panel.style.left = rect.left + 'px';
    panel.style.width = Math.max(280, rect.width) + 'px';
    if(spaceBelow >= 320){
      panel.style.top = (rect.bottom + 4) + 'px';
      panel.style.bottom = 'auto';
    } else {
      panel.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      panel.style.top = 'auto';
    }
  }

  function openPanel(){ positionPanel(); render(); panel.classList.add('open'); display.classList.add('kn-dp-active'); }
  function closePanel(){ panel.classList.remove('open'); display.classList.remove('kn-dp-active'); }
  function togglePanel(){ panel.classList.contains('open') ? closePanel() : openPanel(); }

  display.addEventListener('click', e=>{ e.stopPropagation(); togglePanel(); });
  const icon = display.parentElement ? display.parentElement.querySelector('.kn-dp-toggle') : null;
  if(icon) icon.addEventListener('click', e=>{ e.stopPropagation(); togglePanel(); });
  document.addEventListener('click', ()=>closePanel());
  panel.addEventListener('click', e=>e.stopPropagation());
}

