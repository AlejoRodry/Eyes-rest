/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

const WORK_DURATION = 20 * 60; // 20 minutos
const REST_DURATION = 20;      // 20 segundos

export default function App() {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isWorking, setIsWorking] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const triggerNotification = useCallback(() => {
    // Intentamos usar la API de notificaciones del navegador para la previsualización web
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification('⏱️ Tiempo de descanso', {
          body: 'Mira a un objeto a 6 metros (20 pies) de distancia durante 20 segundos.'
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification('⏱️ Tiempo de descanso', {
              body: 'Mira a un objeto a 6 metros (20 pies) de distancia durante 20 segundos.'
            });
          }
        });
      } else {
        alert("⏱️ Tiempo de descanso\nMira a un objeto a 6 metros (20 pies) de distancia durante 20 segundos.");
      }
    } else {
      alert("⏱️ Tiempo de descanso\nMira a un objeto a 6 metros (20 pies) de distancia durante 20 segundos.");
    }
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isWorking) {
            triggerNotification();
            setIsWorking(false);
            return REST_DURATION; // Cambia a descanso
          } else {
            setIsWorking(true);
            return WORK_DURATION; // Vuelve a trabajo
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isWorking, triggerNotification]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] flex flex-col items-center justify-center font-sans select-none">
      <div className="bg-[#1e1e1e] py-10 px-8 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.4)] text-center w-4/5 max-w-[320px]">
        <h2 className="mt-0 text-xl font-medium tracking-wide mb-6">Regla 20-20-20</h2>
        
        <div className={`inline-block px-4 py-1.5 rounded-full text-[0.85rem] font-bold mb-6 transition-all duration-300 ${
          isPaused 
            ? 'bg-[#cf667933] text-[#cf6679]' 
            : isWorking 
              ? 'bg-[#03dac633] text-[#03dac6]' 
              : 'bg-[#bb86fc33] text-[#bb86fc]'
        }`}>
          {isPaused ? 'Pausado' : isWorking ? 'Protección Activa' : '¡Descansando vista!'}
        </div>
        
        <div className="text-6xl font-bold my-6 tabular-nums">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex flex-col gap-3 mt-8">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="bg-[#bb86fc] text-[#121212] border border-[#bb86fc] px-4 py-3 rounded-lg text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-[#a06ee1] hover:border-[#a06ee1] outline-none"
          >
            {isPaused ? 'Reanudar Temporizador' : 'Pausar Temporizador'}
          </button>
          <button 
            onClick={triggerNotification}
            className="bg-transparent text-[#bb86fc] border border-[#bb86fc] px-4 py-3 rounded-lg text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-[#bb86fc1a] outline-none"
          >
            Probar Notificación
          </button>
        </div>
      </div>
    </div>
  );
}
