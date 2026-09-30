// Nomi dei giorni (indice 0 = Domenica, come JS Date.getDay())
export const GIORNI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

// Label per il calendario (settimana italiana: inizia da Lunedì)
export const GIORNI_HEADER = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Converte una data in stringa locale YYYY-MM-DD (senza problemi di timezone UTC)
 */
export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isToday(date) {
  return toDateString(date) === toDateString(new Date());
}

/**
 * Restituisce il nome abbreviato del giorno ('lun', 'mar', ecc.)
 */
export function getDayName(date) {
  return GIORNI[date.getDay()];
}

/**
 * Converte da getDay() (0=Dom) a indice settimana italiana (0=Lun, 6=Dom)
 */
export function toMondayIndex(jsDayIndex) {
  return jsDayIndex === 0 ? 6 : jsDayIndex - 1;
}
