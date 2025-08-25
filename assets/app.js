export function parseNumber(value) {
  if (value == null) return 0;
  value = String(value).trim().replace(/\s+/g, '').toLowerCase();
  if (value === '') return 0;
  value = value.replace(/,/g, '.');

  const suffixes = {
    'k': 1e3, 'm': 1e6, 'b': 1e9, 't': 1e12,
    'qa': 1e15, 'qd': 1e15,
    'qi': 1e18, 'qn': 1e18,
    'sx': 1e21, 'sp': 1e24,
    'oc': 1e27, 'no': 1e30
  };

  const m = value.match(/^([\d.]+)([a-z]{0,3})$/);
  if (!m) return Number(value) || 0;
  const num = parseFloat(m[1]);
  const suf = m[2] || '';
  return num * (suffixes[suf] || 1);
}

export function formatNumber(n) {
  if (!isFinite(n)) return '—';
  const neg = n < 0;
  if (neg) n = -n;

  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000; i++;
  }
  const s = n.toFixed(2).replace(/\.00$/, '');
  return (neg ? '-' : '') + s + units[i];
}

export function parseTime(value) {
  if (!value) return 0;
  value = String(value).toLowerCase();
  const parts = value.match(/(\d+)\s*(d|h|m|s)/gi);
  if (!parts) return 0;

  let sec = 0;
  for (const p of parts) {
    const mm = p.match(/(\d+)\s*(d|h|m|s)/i);
    if (!mm) continue;
    const num = parseInt(mm[1], 10);
    const unit = mm[2].toLowerCase();
    if (unit === 'd') sec += num * 86400;
    else if (unit === 'h') sec += num * 3600;
    else if (unit === 'm') sec += num * 60;
    else if (unit === 's') sec += num;
  }
  return sec;
}

export function formatTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const d = Math.floor(sec / 86400); sec %= 86400;
  const h = Math.floor(sec / 3600); sec %= 3600;
  const m = Math.floor(sec / 60); const s = sec % 60;

  const parts = [];
  if (d) parts.push(d + 'd');
  if (h || d) parts.push(h + 'h');
  if (m || h || d) parts.push(m + 'm');
  parts.push(s + 's');
  return parts.join(' ');
}

export function saveForm() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    localStorage.setItem(input.id, input.type === 'checkbox' ? input.checked : input.value);
  });
}

export function loadForm() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    const value = localStorage.getItem(input.id);
    if (value !== null) {
      if (input.type === 'checkbox') input.checked = value === 'true';
      else input.value = value;
    }
  });
}

export function updateCustomCheckboxes() {
  document.querySelectorAll('input[type=checkbox]').forEach(input => {
    const box = document.getElementById(input.id + '-box');
    if (box) box.classList.toggle('checked', input.checked);
  });
}

export function updateCustomSelects() {
  document.querySelectorAll('.custom-select').forEach(select => {
    const selected = select.querySelector('.selected');
    const hiddenInput = select.nextElementSibling;
    if (selected && hiddenInput) {
      selected.textContent = hiddenInput.value;
    }
  });
}

function hasBgImage(bgUrlRaw) {
  if (!bgUrlRaw) return false;
  const bgUrl = String(bgUrlRaw).trim();
  if (!bgUrl || bgUrl.toLowerCase() === 'none') return false;

  const m = bgUrl.match(/^url\((['"]?)(.*)\1\)$/i);
  if (!m) return false;
  return m[2].trim().length > 0;
}

export function updateBackgroundClass() {
  const body = document.body;
  const raw = getComputedStyle(body).getPropertyValue('--bg-url');
  if (hasBgImage(raw)) {
    body.classList.remove('no-bg');
  } else {
    body.classList.add('no-bg');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateBackgroundClass();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => console.log('SW registered'))
    .catch(e => console.warn('SW reg fail', e));
}
