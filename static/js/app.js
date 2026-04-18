// ================================================
// static/js/app.js - Pure Vanilla JavaScript
// ================================================

// 1. AI Motion Background
const canvas = document.getElementById('ai-bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3.5 + 1;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.speedY = Math.random() * 0.8 - 0.4;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = '#00d4aa';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00d4aa';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < 85; i++) particles.push(new Particle());
    }

    function connect() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.hypot(dx, dy);
                if (distance < 130) {
                    ctx.strokeStyle = `rgba(0, 212, 170, ${1 - distance / 130})`;
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connect();
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
}

// 2. Dashboard Table (Columns & Rows)
async function loadDashboard() {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#888;">Loading tasks...</td></tr>`;

    try {
        // Refresh the whole page to load latest tasks from Jinja
        window.location.reload();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444;">Failed to load dashboard</td></tr>`;
    }
}

// 3. Update status (called from the <select> in the table)
window.updateStatus = async function(taskCode, newStatus, selectElement) {
    try {
        const res = await fetch('/update_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_code: taskCode, status: newStatus })
        });

        if (res.ok) {
            showToast(`Status updated to ${newStatus}`, 'success');
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
};

// 4. Toast notification
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = 'position:fixed; bottom:20px; right:20px; padding:12px 20px; border-radius:8px; color:white; z-index:9999;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#00d4aa' : '#ef4444';
    toast.style.display = 'block';

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🌍 Vunoh AI - Vanilla JS Loaded', 'color:#00d4aa; font-weight:bold');

    // Load dashboard if we are on dashboard tab
    const dashboardTab = document.querySelector('.nav-btn[data-view="dashboard"]');
    if (dashboardTab) {
        dashboardTab.addEventListener('click', loadDashboard);
    }

    // Auto-resize textarea
    const input = document.getElementById('userInput');
    if (input) {
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 160) + 'px';
        });
    }
});