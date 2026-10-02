// MR Estética Automotiva · interações do site
const WHATSAPP = '5561981363678';
const SERVICOS_CASA = ['Sofás e Estofados', 'Tapetes'];
const PORTES = {
  P: 'P (hatch ou sedã compacto)',
  M: 'M (sedã médio ou SUV compacto)',
  G: 'G (SUV grande, picape ou van)',
};

// Cabeçalho: fundo ao rolar e menu no celular
const topo = document.getElementById('topo');
const menuBotao = document.getElementById('menu-botao');
const whatsFlutuante = document.querySelector('.whats-flutuante');
const agendar = document.getElementById('agendar');

function aoRolar() {
  topo.classList.toggle('rolado', window.scrollY > 40);
}
aoRolar();
window.addEventListener('scroll', aoRolar, { passive: true });

function fecharMenu() {
  document.body.classList.remove('menu-aberto');
  menuBotao.setAttribute('aria-expanded', 'false');
  menuBotao.setAttribute('aria-label', 'Abrir menu');
}
menuBotao.addEventListener('click', () => {
  const aberto = document.body.classList.toggle('menu-aberto');
  menuBotao.setAttribute('aria-expanded', String(aberto));
  menuBotao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});
document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', fecharMenu));

// Esconde o botão flutuante quando o formulário já está na tela
new IntersectionObserver(([e]) => whatsFlutuante.classList.toggle('escondido', e.isIntersecting), { threshold: .2 })
  .observe(agendar);

// Filtro de serviços
const filtros = document.querySelectorAll('.filtro');
const cartoes = document.querySelectorAll('.cartao');
const porte = document.querySelector('.porte');
filtros.forEach(botao => botao.addEventListener('click', () => {
  const f = botao.dataset.filtro;
  filtros.forEach(b => {
    b.classList.toggle('ativo', b === botao);
    b.setAttribute('aria-selected', String(b === botao));
  });
  cartoes.forEach(c => { c.hidden = f !== 'todos' && c.dataset.cat !== f; });
  porte.hidden = f === 'casa';
}));

// Antes e depois
document.querySelectorAll('.comparar').forEach(fig => {
  const controle = fig.querySelector('.comparar__controle');
  controle.addEventListener('input', () => fig.style.setProperty('--pos', controle.value + '%'));
});

// Formulário → mensagem pronta no WhatsApp
const form = document.getElementById('form-agendar');
const servico = document.getElementById('f-servico');
const local = document.getElementById('f-local');
const porteGrupo = document.getElementById('f-porte-grupo');
const regiaoGrupo = document.getElementById('f-regiao-grupo');
const erro = document.getElementById('form-erro');
const linkWhats = document.getElementById('form-link');

const hoje = new Date();
hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
['f-data1', 'f-data2'].forEach(id => { document.getElementById(id).min = hoje.toISOString().slice(0, 10); });

function atualizarCampos() {
  const casa = SERVICOS_CASA.includes(servico.value);
  porteGrupo.hidden = casa;
  // Sofás e tapetes são sempre no endereço do cliente
  local.querySelector('option[value="Estúdio no Park Way"]').disabled = casa;
  if (casa && local.value === 'Estúdio no Park Way') local.value = 'A domicílio (DF)';
  regiaoGrupo.hidden = local.value === 'Estúdio no Park Way';
}
servico.addEventListener('change', atualizarCampos);
local.addEventListener('change', atualizarCampos);

// "Agendar" nos cartões: preenche o serviço e leva ao formulário
document.querySelectorAll('.cartao__acao').forEach(botao => botao.addEventListener('click', () => {
  if (botao.dataset.servico) {
    servico.value = botao.dataset.servico;
    atualizarCampos();
  }
  agendar.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => servico.focus({ preventScroll: true }), 500);
}));

const formatarData = iso => iso ? iso.split('-').reverse().join('/') : '';

form.addEventListener('submit', evento => {
  evento.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const casa = SERVICOS_CASA.includes(d.servico);

  const faltando = [];
  if (!d.servico) faltando.push(servico);
  if (!casa && !d.porte) faltando.push(porteGrupo);
  if (!d.data1) faltando.push(document.getElementById('f-data1'));
  if (!d.nome || !d.nome.trim()) faltando.push(document.getElementById('f-nome'));
  form.querySelectorAll('.invalido').forEach(el => el.classList.remove('invalido'));
  if (faltando.length) {
    faltando.forEach(el => (el.matches('fieldset') ? el.querySelectorAll('.opcao span') : [el]).forEach(x => x.classList.add('invalido')));
    erro.textContent = 'Preencha os campos destacados para continuar.';
    erro.hidden = false;
    (faltando[0].matches('fieldset') ? faltando[0].querySelector('input') : faltando[0]).focus();
    return;
  }
  erro.hidden = true;

  const linhas = [
    `Olá! Meu nome é ${d.nome.trim()} e gostaria de agendar:`,
    '',
    `Serviço: ${d.servico}`,
  ];
  if (!casa) linhas.push(`Porte: ${PORTES[d.porte]}`);
  linhas.push(`Onde: ${d.local}${d.regiao && d.local !== 'Estúdio no Park Way' ? ` · ${d.regiao.trim()}` : ''}`);
  linhas.push(`Data: ${formatarData(d.data1)}${d.data2 ? ` ou ${formatarData(d.data2)}` : ''} · ${d.periodo.toLowerCase()}`);
  if (d.obs && d.obs.trim()) linhas.push('', `Observações: ${d.obs.trim()}`);

  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(linhas.join('\n'))}`;
  const janela = window.open(url, '_blank');
  if (janela) {
    janela.opener = null;
  } else {
    // Navegador bloqueou a nova aba: mostra um link para a pessoa tocar
    linkWhats.href = url;
    linkWhats.hidden = false;
    linkWhats.focus();
  }
});

atualizarCampos();
