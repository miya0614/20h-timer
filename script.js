console.log('script.js loaded successfully!');

class Timer20H {
    constructor() {
        this.totalSeconds = 20 * 60 * 60;
        this.remainingSeconds = this.totalSeconds;
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
        this.currentSessionStart = null;
        this.sessions = [];
        this.oneHourWarningShown = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.updateStats();
        this.updateRecordsTable();
        
        console.log('Timer20H initialized successfully');
    }
    
    initializeElements() {
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.progressFill = document.getElementById('progress-fill');
        this.progressPercent = document.getElementById('progress-percent');
        
        this.totalStudyTimeEl = document.getElementById('total-study-time');
        this.sessionsCountEl = document.getElementById('sessions-count');
        this.avgSessionTimeEl = document.getElementById('avg-session-time');
        this.remainingTimeEl = document.getElementById('remaining-time');
        this.recordsTbody = document.getElementById('records-tbody');
        
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notification-text');
        this.notificationClose = document.getElementById('notification-close');
        this.completionModal = document.getElementById('completion-modal');
        this.celebrationClose = document.getElementById('celebration-close');
    }
    
    bindEvents() {
        this.startBtn.onclick = () => this.start();
        this.pauseBtn.onclick = () => this.pause();
        this.resetBtn.onclick = () => this.reset();
        
        if (this.notificationClose) {
            this.notificationClose.onclick = () => this.hideNotification();
        }
        if (this.celebrationClose) {
            this.celebrationClose.onclick = () => this.hideCompletionModal();
        }
    }
    
    start() {
        console.log('Start called, state:', { isRunning: this.isRunning, isPaused: this.isPaused });
        
        if (this.isPaused) {
            console.log('Resuming timer...');
            this.isRunning = true;
            this.isPaused = false;
            this.currentSessionStart = new Date();
            
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.startBtn.innerHTML = '<span class="btn-icon">▶</span>一時停止';
            
            this.interval = setInterval(() => this.tick(), 1000);
            this.showNotification('タイマーを再開しました！');
            console.log('Timer resumed');
        }
        else if (!this.isRunning) {
            console.log('Starting new timer...');
            this.isRunning = true;
            this.isPaused = false;
            this.currentSessionStart = new Date();
            
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.interval = setInterval(() => this.tick(), 1000);
            this.showNotification('タイマーを開始しました！頑張ってください！');
            console.log('Timer started');
        }
    }
    
    pause() {
        if (this.isRunning && !this.isPaused) {
            console.log('Pausing timer...');
            this.isPaused = true;
            clearInterval(this.interval);
            
            const sessionDuration = Math.floor((new Date() - this.currentSessionStart) / 1000);
            if (sessionDuration > 0) {
                this.sessions.push({
                    date: new Date().toLocaleDateString('ja-JP'),
                    startTime: this.currentSessionStart.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                    duration: sessionDuration,
                    progress: ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds * 100).toFixed(1)
                });
                this.updateRecordsTable();
                this.updateStats();
            }
            
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.innerHTML = '<span class="btn-icon">▶</span>再開';
            this.showNotification('タイマーを一時停止しました');
            console.log('Timer paused');
        }
    }
    
    reset() {
        if (confirm('本当にリセットしますか？現在の進捗と記録がすべて失われます。')) {
            this.isRunning = false;
            this.isPaused = false;
            clearInterval(this.interval);
            
            // すべての記録をクリア
            this.sessions = [];
            this.currentSessionStart = null;
            this.remainingSeconds = this.totalSeconds;
            this.oneHourWarningShown = false;
            
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.innerHTML = '<span class="btn-icon">▶</span>スタート';
            
            this.updateDisplay();
            this.updateStats();
            this.updateRecordsTable();
            this.showNotification('タイマーと記録をリセットしました');
            console.log('Timer and records reset');
        }
    }
    
    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            this.updateDisplay();
            this.updateStats();
            
            if (this.remainingSeconds === 3600 && !this.oneHourWarningShown) {
                this.oneHourWarningShown = true;
                this.showNotification('⚠️ 残り1時間です！ファイトです！');
                this.playSound('warning');
            }
            
            if (this.remainingSeconds === 0) {
                this.complete();
            }
        }
    }
    
    complete() {
        this.isRunning = false;
        clearInterval(this.interval);
        
        if (this.currentSessionStart) {
            const sessionDuration = Math.floor((new Date() - this.currentSessionStart) / 1000);
            if (sessionDuration > 0) {
                this.sessions.push({
                    date: new Date().toLocaleDateString('ja-JP'),
                    startTime: this.currentSessionStart.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                    duration: sessionDuration,
                    progress: 100
                });
            }
        }
        
        this.updateRecordsTable();
        this.updateStats();
        
        this.showCompletionModal();
        this.playSound('completion');
        this.createCelebrationEffect();
    }
    
    updateDisplay() {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;
        
        this.hoursEl.textContent = hours.toString().padStart(2, '0');
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        const progress = ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
        this.progressFill.style.width = progress + '%';
        this.progressPercent.textContent = progress.toFixed(1);
    }
    
    updateStats() {
        const studiedSeconds = this.totalSeconds - this.remainingSeconds;
        const studiedHours = Math.floor(studiedSeconds / 3600);
        const studiedMinutes = Math.floor((studiedSeconds % 3600) / 60);
        
        this.totalStudyTimeEl.textContent = `${studiedHours}時間${studiedMinutes}分`;
        
        const remainingHours = Math.floor(this.remainingSeconds / 3600);
        const remainingMinutes = Math.floor((this.remainingSeconds % 3600) / 60);
        this.remainingTimeEl.textContent = `${remainingHours}時間${remainingMinutes}分`;
        
        this.sessionsCountEl.textContent = this.sessions.length;
        
        if (this.sessions.length > 0) {
            const totalSessionTime = this.sessions.reduce((sum, session) => sum + session.duration, 0);
            const avgMinutes = Math.floor(totalSessionTime / this.sessions.length / 60);
            this.avgSessionTimeEl.textContent = `${avgMinutes}分`;
        } else {
            this.avgSessionTimeEl.textContent = '0分';
        }
    }
    
    updateRecordsTable() {
        if (this.sessions.length === 0) {
            this.recordsTbody.innerHTML = '<tr class="empty-message"><td colspan="4">まだ学習記録がありません</td></tr>';
            return;
        }
        
        const recentSessions = this.sessions.slice(-10).reverse();
        this.recordsTbody.innerHTML = recentSessions.map(session => {
            const durationHours = Math.floor(session.duration / 3600);
            const durationMinutes = Math.floor((session.duration % 3600) / 60);
            const durationText = durationHours > 0 ? 
                `${durationHours}時間${durationMinutes}分` : 
                `${durationMinutes}分`;
            
            return `
                <tr>
                    <td>${session.date}</td>
                    <td>${session.startTime}</td>
                    <td>${durationText}</td>
                    <td>${session.progress}%</td>
                </tr>
            `;
        }).join('');
    }
    
    showNotification(message) {
        if (this.notification && this.notificationText) {
            this.notificationText.textContent = message;
            this.notification.classList.remove('hidden');
            setTimeout(() => this.hideNotification(), 5000);
        }
    }
    
    hideNotification() {
        if (this.notification) {
            this.notification.classList.add('hidden');
        }
    }
    
    showCompletionModal() {
        if (this.completionModal) {
            this.completionModal.classList.remove('hidden');
            const finalDays = new Set(this.sessions.map(s => s.date)).size || 1;
            const finalTotalTime = document.getElementById('final-total-time');
            const finalDaysEl = document.getElementById('final-days');
            if (finalTotalTime) finalTotalTime.textContent = '20時間0分';
            if (finalDaysEl) finalDaysEl.textContent = finalDays;
        }
    }
    
    hideCompletionModal() {
        if (this.completionModal) {
            this.completionModal.classList.add('hidden');
        }
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'warning') {
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } else if (type === 'completion') {
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, index) => {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
                        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                        osc.start(audioContext.currentTime);
                        osc.stop(audioContext.currentTime + 0.5);
                    }, index * 200);
                });
            }
        } catch (error) {
            console.log('音声再生エラー:', error);
        }
    }
    
    createCelebrationEffect() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = ['🎉', '🎊', '⭐', '✨'][Math.floor(Math.random() * 4)];
                particle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight}px;
                    font-size: ${Math.random() * 30 + 20}px;
                    z-index: 3000;
                    animation: fall 3s ease-out forwards;
                `;
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 3000);
            }, i * 100);
        }
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Timer20H();
    console.log('Perfect 20H Timer loaded successfully');
});