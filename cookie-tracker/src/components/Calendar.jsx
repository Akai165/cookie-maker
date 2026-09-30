import { useState } from 'react';
import { MESI, GIORNI_HEADER, toDateString, isToday, toMondayIndex } from '../utils/dateUtils';

/**
 * Calendario mensile con settimana che parte dal Lunedì (stile italiano).
 * Mostra un 🍪 nei giorni con almeno un completamento.
 *
 * Props:
 *   - selectedDate: Date — il giorno selezionato
 *   - onSelectDate: (Date) => void
 *   - completedDays: Set<string> — set di date "YYYY-MM-DD" con completamenti
 */
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
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 mb-6">
      {/* Header: mese e frecce */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-orange-50 text-orange-500 transition-colors text-lg font-bold"
          aria-label="Mese precedente"
        >
          ‹
        </button>

        <button
          onClick={goToToday}
          className="text-lg font-bold text-orange-900 hover:text-orange-600 transition-colors"
        >
          {MESI[month]} {year}
        </button>

        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-orange-50 text-orange-500 transition-colors text-lg font-bold"
          aria-label="Mese successivo"
        >
          ›
        </button>
      </div>

      {/* Intestazione giorni della settimana */}
      <div className="grid grid-cols-7 mb-1">
        {GIORNI_HEADER.map((g) => (
          <div key={g} className="text-center text-xs font-semibold text-orange-400 py-1">
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
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative
                ${isSelected
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : isTodayDate
                    ? 'bg-orange-100 text-orange-900 ring-2 ring-orange-300'
                    : 'hover:bg-orange-50 text-orange-800'
                }
              `}
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
