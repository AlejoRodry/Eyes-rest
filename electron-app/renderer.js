// Elementos del DOM
const timerDisplay = document.getElementById('timerDisplay');
const statusIndicator = document.getElementById('statusIndicator');
const toggleBtn = document.getElementById('toggleBtn');
const testBtn = document.getElementById('testBtn');

// Constantes de tiempo
const WORK_DURATION = 20 * 60; // 20 minutos en segundos
const REST_DURATION = 20;      // 20 segundos

// Estado de la app
let timeLeft = WORK_DURATION;
let isWorking = true;
let isPaused = false;
let timerInterval = null;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateUI() {
    timerDisplay.textContent = formatTime(timeLeft);
    
    if (isPaused) {
        statusIndicator.textContent = 'Pausado';
        statusIndicator.classList.add('paused');
        toggleBtn.textContent = 'Reanudar Temporizador';
    } else {
        statusIndicator.classList.remove('paused');
        toggleBtn.textContent = 'Pausar Temporizador';
        
        if (isWorking) {
            statusIndicator.textContent = 'Protección Activa';
            statusIndicator.style.color = 'var(--success-color)';
            statusIndicator.style.backgroundColor = 'rgba(3, 218, 198, 0.2)';
        } else {
            statusIndicator.textContent = '¡Descansando vista!';
            statusIndicator.style.color = 'var(--primary-color)';
            statusIndicator.style.backgroundColor = 'rgba(187, 134, 252, 0.2)';
        }
    }
}

function notifyAndSwitchPhase() {
    if (isWorking) {
        // Acaba de terminar el trabajo (20 min), iniciar descanso (20 s)
        isWorking = false;
        timeLeft = REST_DURATION;
        // Llamar a la notificación nativa usando el Bridge
        window.electronAPI.testNotification();
    } else {
        // Acaba de terminar el descanso, volver a trabajar
        isWorking = true;
        timeLeft = WORK_DURATION;
    }
    updateUI();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            
            if (timeLeft < 0) {
                notifyAndSwitchPhase();
            } else {
                updateUI();
            }
        }
    }, 1000);
}

// Listeners de botones
toggleBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    updateUI();
});

testBtn.addEventListener('click', () => {
    window.electronAPI.testNotification();
});

// Inicializar la aplicación
updateUI();
startTimer();
