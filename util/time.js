export function fmt(n) { return new Intl.NumberFormat().format(n); }
export function todayISO(){ return new Date().toISOString().slice(0,10); }
