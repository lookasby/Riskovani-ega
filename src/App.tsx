import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import { getISOWeek, getYear, setISOWeek, startOfISOWeek, endOfISOWeek, format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { weekDescriptions, people, getPraiseForPerson } from './lib/data';

type AppState = Record<number, Record<string, boolean>>;

const getWeekDateRange = (weekNum: number) => {
  try {
    const baseDate = setISOWeek(new Date(2026, 0, 4), weekNum);
    const start = startOfISOWeek(baseDate);
    const end = endOfISOWeek(baseDate);
    return `${format(start, 'd. M.', { locale: cs })} – ${format(end, 'd. M.', { locale: cs })}`;
  } catch (e) {
    return "";
  }
};

export default function App() {
  const currentYear = getYear(new Date());
  const currentWeekNum = currentYear === 2026 ? getISOWeek(new Date()) : getISOWeek(new Date());

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('egoTrackerAuth') === 'true';
  });
  const [passcode, setPasscode] = useState('');

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('egoTrackerState');
    return saved ? JSON.parse(saved) : {};
  });

  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('egoTrackerDescriptions');
    return saved ? JSON.parse(saved) : {};
  });

  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([currentWeekNum]);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('egoTrackerState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('egoTrackerDescriptions', JSON.stringify(customDescriptions));
  }, [customDescriptions]);

  useEffect(() => {
    // Scroll to current week on mount if authenticated
    if (isAuthenticated && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '68') {
      setIsAuthenticated(true);
      localStorage.setItem('egoTrackerAuth', 'true');
    } else {
      toast.error('Špatný kód!');
      setPasscode('');
    }
  };

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => 
      prev.includes(weekNum) 
        ? prev.filter(w => w !== weekNum)
        : [...prev, weekNum]
    );
  };

  const handleEditStart = (weekNum: number, currentDesc: string) => {
    setEditingWeek(weekNum);
    setEditValue(currentDesc);
  };

  const handleEditSave = (weekNum: number) => {
    setCustomDescriptions(prev => ({
      ...prev,
      [weekNum]: editValue
    }));
    setEditingWeek(null);
  };

  const togglePerson = (weekNum: number, person: string) => {
    const isCurrentlyChecked = state[weekNum]?.[person] || false;
    
    setState(prev => ({
      ...prev,
      [weekNum]: {
        ...(prev[weekNum] || {}),
        [person]: !isCurrentlyChecked
      }
    }));

    if (!isCurrentlyChecked) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#8b5cf6', '#10b981']
      });
      toast.success(getPraiseForPerson(person));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-6 px-4 md:py-10 md:px-10 app-bg font-sans flex items-center justify-center">
        <Toaster position="top-right" toastOptions={{
          success: { style: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 40px rgba(16,185,129,0.3)', fontWeight: 600, fontSize: '14px', padding: '16px 24px' } },
          error: { style: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 40px rgba(239,68,68,0.3)', fontWeight: 600, fontSize: '14px', padding: '16px 24px' } }
        }} />
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-8 md:p-12 backdrop-blur-[20px] text-center shadow-[0_0_40px_rgba(99,102,241,0.15)] mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight title-gradient mb-2">Přístup odepřen</h2>
          <p className="text-slate-400 mb-8 font-medium">Zadejte přístupový kód pro Bravery Council.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-[10px] text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/20"
              placeholder="••"
              maxLength={4}
              autoFocus
            />
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold tracking-wide uppercase py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-[0_10px_30px_rgba(99,102,241,0.4)]"
            >
              Vstoupit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 md:py-10 md:px-10 app-bg font-sans">
      <Toaster position="top-right" toastOptions={{
        success: { style: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 40px rgba(16,185,129,0.3)', fontWeight: 600, fontSize: '14px', padding: '16px 24px' } },
        error: { style: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 40px rgba(239,68,68,0.3)', fontWeight: 600, fontSize: '14px', padding: '16px 24px' } }
      }} />
      
      <div className="max-w-5xl mx-auto flex flex-col h-full relative">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <div className="text-sm md:text-lg font-semibold tracking-[8px] md:tracking-[10px] text-indigo-500 uppercase mb-2">Dvacet dvacet šest</div>
            <h1 className="text-5xl md:text-[82px] font-black leading-[0.85] uppercase tracking-[-2px] md:tracking-[-4px] title-gradient">
              Riskování<br/>Ega
            </h1>
          </div>
          <div className="text-left md:text-right mt-6 md:mt-0 items-start md:items-end flex flex-col justify-end">
            <p className="text-base md:text-lg text-slate-400 max-w-sm font-medium leading-relaxed mb-4">
              Nepohodlí je cena za růst.<br/>52 týdnů. 5 lidí. Žádné výmluvy.
            </p>
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem('egoTrackerAuth');
              }}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Odhlásit se
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-4 md:space-y-6">
          {weekDescriptions.map((defaultDesc, idx) => {
            const weekNum = idx + 1;
            const weekState = state[weekNum] || {};
            const isCurrentWeek = weekNum === currentWeekNum;
            const isExpanded = expandedWeeks.includes(weekNum);
            const displayDesc = customDescriptions[weekNum] || defaultDesc;

            return (
              <section 
                key={weekNum} 
                ref={isCurrentWeek ? scrollRef : null}
                className={`bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-[20px] transition-all duration-500 flex flex-col 
                  ${isCurrentWeek ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.15)] my-8' : 'hover:bg-white/10'}`}
              >
                <div 
                  className={`px-4 sm:px-6 md:px-10 cursor-pointer flex justify-between items-center transition-all ${isExpanded ? 'pt-6 md:pt-10' : 'py-5 md:py-8'}`}
                  onClick={() => toggleWeek(weekNum)}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                       <div className="text-xs sm:text-sm uppercase tracking-[2px] text-indigo-400 font-semibold">
                         Týden {weekNum} {isCurrentWeek && "— Aktuální"}
                       </div>
                       <div className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide uppercase bg-black/20 px-3 py-1 rounded-full w-fit border border-white/5">
                         {getWeekDateRange(weekNum)}
                       </div>
                    </div>
                    <h2 className={`font-bold tracking-tight text-white transition-all w-full
                      ${isExpanded ? 'text-xl sm:text-2xl md:text-[32px] mb-0' : 'text-base sm:text-lg md:text-xl text-slate-300 truncate'}`}>
                      {isExpanded ? 'Mise týdne' : displayDesc}
                    </h2>
                  </div>
                  <div className={`transform transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div 
                  className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-4 sm:px-6 pb-6 md:px-10 md:pb-10 pt-4">
                    {editingWeek === weekNum ? (
                      <div className="mb-8 max-w-[600px]">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-black/20 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500/50 resize-y"
                          rows={3}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-3 mt-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditSave(weekNum); }}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                          >
                            Uložit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingWeek(null); }}
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 mb-8">
                        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-[600px]">
                          {displayDesc}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditStart(weekNum, displayDesc); }}
                          className="text-slate-500 hover:text-white p-2 transition-colors -ml-2"
                          title="Upravit popis"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                      {people.map(person => {
                        const isChecked = weekState[person] || false;
                        return (
                          <button
                            key={person}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePerson(weekNum, person);
                            }}
                            className={`rounded-[20px] p-6 text-center transition-all duration-300 cursor-pointer border
                              ${isChecked 
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent shadow-[0_10px_30px_rgba(99,102,241,0.4)] transform -translate-y-1' 
                                : 'bg-black/20 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                          >
                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-4 transition-colors
                              ${isChecked ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
                              {person.charAt(0)}
                            </div>
                            <div className={`text-sm font-semibold tracking-[0.5px] ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                              {person}
                            </div>
                            <div className={`text-[10px] uppercase mt-2 font-bold tracking-wider transition-opacity duration-300
                              ${isChecked ? 'opacity-100 text-indigo-100' : 'opacity-50 text-slate-500'}`}>
                              {isChecked ? 'Hotovo' : 'Čeká'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </main>
        <footer className="mt-8 flex justify-between items-center opacity-40 text-xs font-semibold uppercase tracking-[1px] text-white">
          <div>Lokální úložiště aktivní</div>
          <div>Made for the Bravery Council</div>
        </footer>
      </div>
    </div>
  );
}

