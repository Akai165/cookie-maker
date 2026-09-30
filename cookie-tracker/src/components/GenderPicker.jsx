/**
 * Schermata di selezione sesso — mostrata al primo accesso
 * per personalizzare i pronomi nell'app.
 */
export default function GenderPicker({ onSelect }) {
  return (
    <div className="min-h-screen bg-[#FFF8EE] flex flex-col items-center justify-center p-6">
      <div className="text-7xl mb-6">🍪</div>

      <h1 className="text-2xl font-black text-orange-900 mb-2 text-center">
        Benvenuto su Cookie Tracker!
      </h1>
      <p className="text-orange-600 mb-10 text-center">
        Come vuoi essere chiamato/a?
      </p>

      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={() => onSelect('M')}
          className="flex-1 flex flex-col items-center gap-3 bg-white hover:bg-blue-50 text-blue-900 font-bold py-6 px-4 rounded-2xl shadow-lg border-2 border-blue-200 transition-all active:scale-95 hover:shadow-xl"
        >
          <span className="text-4xl">👦</span>
          <span className="text-lg">Ragazzo</span>
        </button>

        <button
          onClick={() => onSelect('F')}
          className="flex-1 flex flex-col items-center gap-3 bg-white hover:bg-pink-50 text-pink-900 font-bold py-6 px-4 rounded-2xl shadow-lg border-2 border-pink-200 transition-all active:scale-95 hover:shadow-xl"
        >
          <span className="text-4xl">👧</span>
          <span className="text-lg">Ragazza</span>
        </button>
      </div>

      <p className="mt-8 text-sm text-orange-400 text-center">
        Serve solo per i pronomi — puoi cambiarlo dopo ✨
      </p>
    </div>
  );
}
