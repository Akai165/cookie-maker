/**
 * Calendario mensile con settimana che parte dal Lunedì (stile italiano).
 * Mostra un 🍪 nei giorni con almeno un completamento.
 *
 * Props:
 *   - selectedDate: Date — il giorno selezionato
 *   - onSelectDate: (Date) => void
 *   - completedDays: Set<string> — set di date "YYYY-MM-DD" con completamenti
 */
import { useState } from 'react';
import { MESI, GIORNI_HEADER, toDateString, isToday, toMondayIndex } from '../utils/dateUtils';

export default function Calendar({ selectedDate, onSelectDate, completedDays }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigazione mesi
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onSelectDate(today);
  };

  // Genera la griglia del mese
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = toMondayIndex(firstDay.getDay()); // quante celle vuote prima del 1°
  const totalDays = lastDay.getDate();

  const cells = [];

  // Celle vuote prima del 1° giorno
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  // Giorni del mese
  for (let d = 1; d <= totalDays; d++) {
    cells.push(new Date(year, month, d));
  }

  const selectedStr = toDateString(selectedDate);

  return (
    <div
      className="rounded-2xl shadow-sm p-4 mb-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
    >
      {/* Header: mese e frecce */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl transition-colors text-lg font-bold"
          style={{ color: 'var(--primary)' }}
          aria-label="Mese precedente"
        >
          ‹
        </button>

        <button
          onClick={goToToday}
          className="text-lg font-bold transition-colors"
          style={{ color: 'var(--text)' }}
        >
          {MESI[month]} {year}
        </button>

        <button
          onClick={nextMonth}
          className="p-2 rounded-xl transition-colors text-lg font-bold"
          style={{ color: 'var(--primary)' }}
          aria-label="Mese successivo"
        >
          ›
        </button>
      </div>

      {/* Intestazione giorni della settimana */}
      <div className="grid grid-cols-7 mb-1">
        {GIORNI_HEADER.map((g) => (
          <div key={g} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-faint)' }}>
            {g}
          </div>
        ))}
      </div>

      {/* Griglia giorni */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = toDateString(date);
          const isSelected = dateStr === selectedStr;
          const isTodayDate = isToday(date);
          const hasCompletion = completedDays.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(date)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative"
              style={
                isSelected
                  ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transform: 'scale(1.05)' }
                  : isTodayDate
                    ? { background: 'var(--primary-light)', color: 'var(--text)', outline: '2px solid var(--primary-muted)', outlineOffset: '-2px' }
                    : { color: 'var(--text-mid)' }
              }
            >
              <span>{date.getDate()}</span>
              {hasCompletion && (
                <span className={`text-[10px] leading-none ${isSelected ? '' : 'opacity-70'}`}>
                  🍪
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
