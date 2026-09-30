import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  Cookie, 
  ListTodo, 
  Store, 
  Home, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Croissant,
  Coffee,
  CakeSlice
} from 'lucide-react';

// Firebase Setup
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Utility to get today's date string (YYYY-MM-DD)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const DAYS_OF_WEEK = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

export default function CookieHabitTracker() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('oggi'); // 'oggi', 'forno', 'negozio'
  
  // Data State
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [todayCompletedTasks, setTodayCompletedTasks] = useState([]);

  // Auth Effect
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching Effect
  useEffect(() => {
    if (!user) return;

    const userId = user.uid;
    const todayStr = getTodayString();

    // 1. Fetch Balance
    const balanceRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
    const unsubBalance = onSnapshot(balanceRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().cookies || 0);
      } else {
        setDoc(balanceRef, { cookies: 0 }); // Initialize if not exists
      }
    }, (err) => console.error("Balance fetch error:", err));

    // 2. Fetch Tasks
    const tasksRef = collection(db, 'artifacts', appId, 'users', userId, 'tasks');
    const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
    }, (err) => console.error("Tasks fetch error:", err));

    // 3. Fetch Rewards
    const rewardsRef = collection(db, 'artifacts', appId, 'users', userId, 'rewards');
    const unsubRewards = onSnapshot(rewardsRef, (snapshot) => {
      const fetchedRewards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRewards(fetchedRewards);
    }, (err) => console.error("Rewards fetch error:", err));

    // 4. Fetch Today's Completed Tasks
    const todayRef = doc(db, 'artifacts', appId, 'users', userId, 'days', todayStr);
    const unsubToday = onSnapshot(todayRef, (docSnap) => {
      if (docSnap.exists()) {
        setTodayCompletedTasks(docSnap.data().completed || []);
      } else {
        setDoc(todayRef, { completed: [] });
      }
    }, (err) => console.error("Today fetch error:", err));

    return () => {
      unsubBalance();
      unsubTasks();
      unsubRewards();
      unsubToday();
    };
  }, [user]);

  const completeTask = async (task) => {
    if (!user || todayCompletedTasks.includes(task.id)) return;

    const userId = user.uid;
    const todayStr = getTodayString();
    
    // Update balance
    const balanceRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
    await setDoc(balanceRef, { cookies: balance + Number(task.cookieValue) }, { merge: true });

    // Update today's completions
    const todayRef = doc(db, 'artifacts', appId, 'users', userId, 'days', todayStr);
    await setDoc(todayRef, { completed: [...todayCompletedTasks, task.id] }, { merge: true });
  };

  const uncompleteTask = async (task) => {
    if (!user || !todayCompletedTasks.includes(task.id)) return;

    const userId = user.uid;
    const todayStr = getTodayString();
    
    // Update balance (prevent going below 0 logically, though it's allowed in this economy if needed)
    const newBalance = Math.max(0, balance - Number(task.cookieValue));
    const balanceRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
    await setDoc(balanceRef, { cookies: newBalance }, { merge: true });

    // Update today's completions
    const todayRef = doc(db, 'artifacts', appId, 'users', userId, 'days', todayStr);
    const newCompleted = todayCompletedTasks.filter(id => id !== task.id);
    await setDoc(todayRef, { completed: newCompleted }, { merge: true });
  };

  const buyReward = async (reward) => {
    if (!user || balance < reward.cost) return;

    const userId = user.uid;
    
    // Deduct balance
    const balanceRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
    await setDoc(balanceRef, { cookies: balance - Number(reward.cost) }, { merge: true });

    // Optional: Could log history of purchases here, but keeping it simple for now.
  };

  const addTask = async (newTask) => {
    if (!user) return;
    const tasksRef = collection(db, 'artifacts', appId, 'users', user.uid, 'tasks');
    await addDoc(tasksRef, { ...newTask, createdAt: new Date().toISOString() });
  };

  const deleteTask = async (taskId) => {
    if (!user) return;
    const taskRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskRef);
  };

  const addReward = async (newReward) => {
    if (!user) return;
    const rewardsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'rewards');
    await addDoc(rewardsRef, { ...newReward, createdAt: new Date().toISOString() });
  };

  const deleteReward = async (rewardId) => {
    if (!user) return;
    const rewardRef = doc(db, 'artifacts', appId, 'users', user.uid, 'rewards', rewardId);
    await deleteDoc(rewardRef);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#8A5A44]">
        <div className="animate-pulse flex flex-col items-center">
          <Cookie size={48} className="mb-4 text-[#D4A373]" />
          <p className="text-xl font-medium">Sfornando l'app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#8A5A44] font-sans flex flex-col">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EACBB] p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Croissant className="text-[#D4A373]" />
          Biscottiere
        </h1>
        <div className="flex items-center gap-2 bg-[#FFF6EE] px-4 py-2 rounded-full border border-[#D4A373]/30 shadow-inner">
          <Cookie className="text-[#D4A373] animate-bounce-slow" />
          <span className="text-xl font-bold text-[#8A5A44]">{balance}</span>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'oggi' && (
          <TabOggi 
            tasks={tasks} 
            todayCompletedTasks={todayCompletedTasks} 
            onComplete={completeTask} 
            onUncomplete={uncompleteTask} 
          />
        )}
        {activeTab === 'forno' && (
          <TabForno 
            tasks={tasks} 
            onAdd={addTask} 
            onDelete={deleteTask} 
          />
        )}
        {activeTab === 'negozio' && (
          <TabNegozio 
            rewards={rewards} 
            balance={balance}
            onBuy={buyReward} 
            onAdd={addReward} 
            onDelete={deleteReward} 
          />
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#EACBB] flex justify-around p-3 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <NavButton 
          icon={<Home />} label="Oggi" 
          active={activeTab === 'oggi'} 
          onClick={() => setActiveTab('oggi')} 
        />
        <NavButton 
          icon={<ListTodo />} label="Forno" 
          active={activeTab === 'forno'} 
          onClick={() => setActiveTab('forno')} 
        />
        <NavButton 
          icon={<Store />} label="Negozio" 
          active={activeTab === 'negozio'} 
          onClick={() => setActiveTab('negozio')} 
        />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 transition-all duration-300 ${
        active ? 'text-[#D4A373] -translate-y-1' : 'text-[#A07A65] hover:text-[#8A5A44]'
      }`}
    >
      <div className={`p-2 rounded-full ${active ? 'bg-[#FFF6EE]' : ''}`}>
        {icon}
      </div>
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
}

function TabOggi({ tasks, todayCompletedTasks, onComplete, onUncomplete }) {
  const currentDayIndex = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)

  // Filter tasks relevant for today
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.type === 'daily') return true;
      if (task.type === 'weekly' && task.daysOfWeek?.includes(currentDayIndex)) return true;
      return false;
    });
  }, [tasks, currentDayIndex]);

  if (todaysTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center mt-20 opacity-70">
        <Coffee size={64} className="text-[#D4A373] mb-4" />
        <h2 className="text-xl font-bold mb-2">Tutto fatto!</h2>
        <p>Aggiungi nuove attività nel Forno.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Le infornate di oggi
      </h2>
      <div className="space-y-3">
        {todaysTasks.map(task => {
          const isCompleted = todayCompletedTasks.includes(task.id);
          return (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-[#F2E8DF] border-transparent opacity-60' 
                  : 'bg-white border-[#EACBB] shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => isCompleted ? onUncomplete(task) : onComplete(task)}
                  className={`flex-shrink-0 transition-colors ${
                    isCompleted ? 'text-[#8A5A44]' : 'text-[#D4A373] hover:text-[#C58B55]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <div>
                  <h3 className={`font-medium ${isCompleted ? 'line-through text-[#A07A65]' : 'text-[#8A5A44]'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#A07A65]">
                    {task.type === 'daily' ? 'Tutti i giorni' : 'Oggi'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#FFF6EE] px-2 py-1 rounded-lg text-sm font-bold text-[#D4A373]">
                +{task.cookieValue} <Cookie size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabForno({ tasks, onAdd, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [cookieValue, setCookieValue] = useState(5);
  const [type, setType] = useState('daily'); // 'daily' or 'weekly'
  const [daysOfWeek, setDaysOfWeek] = useState([1,2,3,4,5]); // Default Mon-Fri

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title,
      cookieValue: Number(cookieValue),
      type,
      daysOfWeek: type === 'weekly' ? daysOfWeek : []
    });
    
    setTitle('');
    setCookieValue(5);
    setIsAdding(false);
  };

  const toggleDay = (dayIndex) => {
    setDaysOfWeek(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Le tue Ricette (Attività)</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#D4A373] text-white p-2 rounded-full shadow-md hover:bg-[#C58B55] transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-[#EACBB] shadow-md mb-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Cosa devi fare?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Bere 2L d'acqua"
              className="w-full bg-[#FAEDE5] p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#D4A373] transition-all"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Ricompensa</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={cookieValue}
                  onChange={(e) => setCookieValue(e.target.value)}
                  min="1"
                  className="w-full bg-[#FAEDE5] p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-[#D4A373]"
                />
                <Cookie size={18} className="absolute left-3 top-3.5 text-[#D4A373]" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Frequenza</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#FAEDE5] p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#D4A373]"
              >
                <option value="daily">Tutti i giorni</option>
                <option value="weekly">Settimanale</option>
              </select>
            </div>
          </div>

          {type === 'weekly' && (
            <div>
              <label className="block text-sm font-bold mb-2">Quali giorni?</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      daysOfWeek.includes(idx) 
                        ? 'bg-[#D4A373] text-white' 
                        : 'bg-[#FAEDE5] text-[#A07A65]'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-[#A07A65] hover:bg-[#FAEDE5] transition-colors"
            >
              Annulla
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#8A5A44] text-white font-bold hover:bg-[#6b4534] transition-colors"
            >
              Inforna Attività
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white border border-[#EACBB] p-4 rounded-2xl flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-xs text-[#A07A65]">
                {task.type === 'daily' ? 'Tutti i giorni' : `Giorni specifici`} • {task.cookieValue} 🍪
              </p>
            </div>
            <button 
              onClick={() => onDelete(task.id)}
              className="text-[#D4A373]/50 hover:text-red-400 transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && !isAdding && (
          <p className="text-center text-[#A07A65] mt-10">Il forno è vuoto. Aggiungi la tua prima ricetta!</p>
        )}
      </div>
    </div>
  );
}

function TabNegozio({ rewards, balance, onBuy, onAdd, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title,
      cost: Number(cost)
    });
    
    setTitle('');
    setCost(50);
    setIsAdding(false);
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-[#FFF6EE] border border-[#D4A373]/30 p-5 rounded-3xl mb-6 text-center shadow-inner">
        <h2 className="text-lg font-bold mb-1">Il tuo salvadanaio goloso</h2>
        <div className="text-3xl font-black text-[#8A5A44] flex items-center justify-center gap-2">
          {balance} <Cookie size={32} className="text-[#D4A373]" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CakeSlice size={20} /> I tuoi Premi
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#8A5A44] text-white p-2 rounded-full shadow-md hover:bg-[#6b4534] transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-[#EACBB] shadow-md mb-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nome del premio</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. 1 ora di videogioco"
              className="w-full bg-[#FAEDE5] p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#D4A373]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Costo (Biscotti)</label>
            <div className="relative">
              <input 
                type="number" 
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="1"
                className="w-full bg-[#FAEDE5] p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-[#D4A373]"
              />
              <Cookie size={18} className="absolute left-3 top-3.5 text-[#D4A373]" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-[#A07A65] hover:bg-[#FAEDE5]"
            >
              Annulla
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#D4A373] text-white font-bold hover:bg-[#C58B55]"
            >
              Aggiungi
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {rewards.map(reward => {
          const canAfford = balance >= reward.cost;
          return (
            <div key={reward.id} className={`relative bg-white rounded-3xl p-4 border shadow-sm flex flex-col items-center text-center transition-all ${
              canAfford ? 'border-[#D4A373] hover:shadow-md' : 'border-[#EACBB] opacity-70 grayscale-[30%]'
            }`}>
              <button 
                onClick={() => onDelete(reward.id)}
                className="absolute top-2 right-2 text-[#A07A65]/40 hover:text-red-400 p-1"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="w-16 h-16 bg-[#FFF6EE] rounded-full flex items-center justify-center mb-3">
                <Store size={28} className="text-[#8A5A44]" />
              </div>
              <h3 className="font-bold text-sm h-10 line-clamp-2 mb-2 leading-tight">{reward.title}</h3>
              
              <button 
                onClick={() => canAfford && onBuy(reward)}
                disabled={!canAfford}
                className={`w-full py-2 rounded-xl font-bold flex justify-center items-center gap-1 transition-colors ${
                  canAfford 
                    ? 'bg-[#8A5A44] text-white hover:bg-[#6b4534]' 
                    : 'bg-[#EACBB] text-[#A07A65] cursor-not-allowed'
                }`}
              >
                {reward.cost} <Cookie size={14} />
              </button>
            </div>
          );
        })}
      </div>
      {rewards.length === 0 && !isAdding && (
        <p className="text-center text-[#A07A65] mt-10 col-span-2">Non ci sono premi nel negozio. Aggiungine uno!</p>
      )}
    </div>
  );
}

// We use a small style block directly injected to handle simple animations not native in Tailwind core without config
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  @keyframes bounceSlow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  .animate-bounce-slow {
    animation: bounceSlow 3s ease-in-out infinite;
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 1rem);
  }
`;
document.head.appendChild(style);