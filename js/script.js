const TITLES = {
  inicio:'Inicio', 'kasnet-digital':'Kasnet Digital', wallet:'Wallet',
  lotes:'Lotes', comprobantes:'Comprobantes', bandeja:'Bandeja de Revisión',
  anulaciones:'Anulaciones', 'prep-pagos':'Preparación de Pagos',
  'disp-pagos':'Dispersión de Pagos', mantenimiento:'Mantenimiento',
  auditoria:'Auditoría'
};

function navTo(id){
  document.querySelectorAll('.sb-nav a').forEach(a=>a.classList.remove('active'));
  document.querySelectorAll('.grp-head').forEach(a=>a.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const link = document.querySelector(`[data-view="${id}"]`);
  if(link){
    link.classList.add('active');
    const grp = link.closest('.grp');
    if(grp) grp.classList.add('open');
  }
  const section = document.getElementById(id);
  if(section) section.classList.add('active');
  document.getElementById('viewTitle').textContent = TITLES[id]||id;
  document.getElementById('viewSub').textContent = '';
  window.scrollTo(0,0);
}
document.querySelectorAll('.sb-nav a[data-view]').forEach(a=>{
  a.addEventListener('click', ()=> navTo(a.dataset.view));
});

// ─── Sidebar: acordeón de grupos ───
document.querySelectorAll('.sb-nav .grp-head').forEach(h=>{
  h.addEventListener('click', ()=> h.parentElement.classList.toggle('open'));
});
// mantener abierto el grupo que contiene la vista activa
document.querySelectorAll('.sb-nav .grp').forEach(grp=>{
  const link = grp.querySelector('a[data-view].active');
  if(link) grp.classList.add('open');
});

// ─── Tabs (global) ───
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

// ─── Carga de planilla ───
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

// ─── Modals ───
function openDetalle(){ document.getElementById('detalleModal').classList.add('open'); }
function closeDetalle(){ document.getElementById('detalleModal').classList.remove('open'); }
function openLote(){ document.getElementById('loteModal').classList.add('open'); }
function closeLote(){ document.getElementById('loteModal').classList.remove('open'); }
document.getElementById('detalleModal').addEventListener('click',e=>{ if(e.target.id==='detalleModal') closeDetalle(); });
document.getElementById('loteModal').addEventListener('click',e=>{ if(e.target.id==='loteModal') closeLote(); });

// ─── Select all ───
function toggleAll(cls, on){ document.querySelectorAll('.'+cls).forEach(c=>c.checked=on); }