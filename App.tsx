import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, RefreshCw, Zap } from 'lucide-react';
import { fetchFlights } from './services/geminiService';
import { Flight, FlightStatus } from './types';
import { FlightCard } from './components/FlightCard';
import { NotificationToast } from './components/NotificationToast';

enum Tab {
  Today = 'Today',
  Tomorrow = 'Tomorrow'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Today);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Helper to get dates
  const getToday = () => new Date();
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  };

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const date = activeTab === Tab.Today ? getToday() : getTomorrow();
    
    try {
      const data = await fetchFlights(date);
      setFlights(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simulation Logic: Randomly delay a flight to demonstrate notifications
  const simulateDelay = () => {
    const onTimeFlights = flights.filter(f => f.status === FlightStatus.OnTime || f.status === FlightStatus.Scheduled);
    
    if (onTimeFlights.length === 0) {
      setNotification("Нет рейсов для симуляции задержки.");
      return;
    }

    const randomFlightIndex = Math.floor(Math.random() * onTimeFlights.length);
    const flightToDelay = onTimeFlights[randomFlightIndex];
    
    // Create new estimated time (add 2 hours)
    const oldTime = new Date(flightToDelay.scheduledTime);
    const newTime = new Date(oldTime.getTime() + 2 * 60 * 60 * 1000);

    const updatedFlight: Flight = {
      ...flightToDelay,
      status: FlightStatus.Delayed,
      estimatedTime: newTime.toISOString()
    };

    setFlights(prev => prev.map(f => f.id === flightToDelay.id ? updatedFlight : f));
    
    // Trigger notification
    setNotification(`Внимание! Рейс ${updatedFlight.flightNumber} (${updatedFlight.origin}) задерживается. Расчетное время: ${newTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}`);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-200 relative max-w-md mx-auto shadow-2xl shadow-black overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800/60 pt-6 pb-4 px-4 sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Аэропорт Кемерово</h1>
            <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
              <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-500 tracking-wider">KEJ</span>
              <span>•</span>
              <span>Прилет</span>
            </div>
          </div>
          <button 
            onClick={() => loadData(true)} 
            className="p-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition active:scale-95 text-slate-400 hover:text-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-emerald-500" : ""} />
          </button>
        </div>

        {/* Date Selector / Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab(Tab.Today)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              activeTab === Tab.Today ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Сегодня
          </button>
          <button
            onClick={() => setActiveTab(Tab.Tomorrow)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              activeTab === Tab.Tomorrow ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Завтра
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 py-4 z-20 relative min-h-[60vh]">
        <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Calendar size={12} />
               {activeTab === Tab.Today ? formatDateDisplay(getToday()) : formatDateDisplay(getTomorrow())}
            </h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 h-20 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                   <div className="h-8 w-12 bg-slate-800 rounded"></div>
                   <div className="h-8 w-px bg-slate-800"></div>
                   <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-slate-800 rounded"></div>
                      <div className="h-2 w-16 bg-slate-800 rounded"></div>
                   </div>
                </div>
                <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {flights.length > 0 ? (
              flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            ) : (
              <div className="text-center py-20 text-slate-600">
                <p>Рейсов не найдено</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Simulation Control (Demo Feature) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={simulateDelay}
          className="bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-full shadow-lg shadow-black/50 transition-all active:scale-90 flex items-center justify-center"
          title="Симулировать задержку рейса"
        >
          <Zap size={20} fill="currentColor" />
        </button>
      </div>

      <NotificationToast 
        message={notification} 
        onClose={() => setNotification(null)} 
      />
      
    </div>
  );
};

export default App;