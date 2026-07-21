document.addEventListener('DOMContentLoaded', () => {
    // --- 60FPS ANIME SNOW + SPARKLE TRAIL ENGINE ---
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let windX = 0;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            windX = ((e.clientX / width) - 0.5) * 1.5;
            spawnSparkle(e.clientX, e.clientY);
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                windX = ((touch.clientX / width) - 0.5) * 2;
                spawnSparkle(touch.clientX, touch.clientY);
            }
        });

        const numFlakes = Math.min(90, Math.floor(width / 14));
        const flakes = [];

        for (let i = 0; i < numFlakes; i++) {
            flakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.8 + 1,
                speedY: Math.random() * 0.9 + 0.3,
                speedX: Math.random() * 0.4 - 0.2,
                opacity: Math.random() * 0.75 + 0.25
            });
        }

        const sparkles = [];
        function spawnSparkle(x, y) {
            if (sparkles.length < 40) {
                sparkles.push({
                    x: x + (Math.random() * 10 - 5),
                    y: y + (Math.random() * 10 - 5),
                    radius: Math.random() * 3 + 2,
                    color: Math.random() > 0.5 ? '#c084fc' : '#f472b6',
                    life: 1,
                    decay: Math.random() * 0.04 + 0.02,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5
                });
            }
        }

        function renderScene() {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < numFlakes; i++) {
                const flake = flakes[i];
                ctx.save();
                ctx.globalAlpha = flake.opacity;
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                flake.y += flake.speedY;
                flake.x += flake.speedX + (windX * 0.5);

                if (flake.y > height) {
                    flake.y = -10;
                    flake.x = Math.random() * width;
                }
                if (flake.x > width) flake.x = 0;
                if (flake.x < 0) flake.x = width;
            }

            for (let i = sparkles.length - 1; i >= 0; i--) {
                const p = sparkles[i];
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (p.life <= 0) {
                    sparkles.splice(i, 1);
                }
            }

            requestAnimationFrame(renderScene);
        }
        renderScene();
    }

    // --- 3D TILT EFFECT ON CARDS ---
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // --- CONVERTER SYSTEM ---
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    const uploadCard = document.getElementById('uploadCard');
    const batchCard = document.getElementById('batchCard');
    const progressCard = document.getElementById('progressCard');
    const resultCard = document.getElementById('resultCard');

    const fileCountBadge = document.getElementById('fileCountBadge');
    const totalSizeText = document.getElementById('totalSizeText');
    const fileQueueList = document.getElementById('fileQueueList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const startBatchBtn = document.getElementById('startBatchBtn');

    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const currentFileName = document.getElementById('currentFileName');
    const completedCount = document.getElementById('completedCount');
    const totalQueueCount = document.getElementById('totalQueueCount');
    const statusTitle = document.getElementById('statusTitle');

    const downloadListContainer = document.getElementById('downloadListContainer');
    const convertMoreBtn = document.getElementById('convertMoreBtn');

    let fileQueue = [];

    // Trigger file selection on tapping anywhere inside dropZone
    dropZone.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    ['dragenter', 'dragover'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) addFilesToQueue(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) addFilesToQueue(files);
    });

    clearAllBtn.addEventListener('click', resetAll);
    convertMoreBtn.addEventListener('click', resetAll);

    function addFilesToQueue(files) {
        const validFiles = files.filter(f => f.name.toLowerCase().endsWith('.avi') || f.name.toLowerCase().endsWith('.mp4') || f.type.includes('video'));

        if (validFiles.length === 0) {
            alert('Por favor selecciona videos .AVI válidos.');
            return;
        }

        validFiles.forEach(file => {
            fileQueue.push({
                id: 'file_' + Math.random().toString(36).substr(2, 9),
                file: file,
                status: 'pending',
                blob: null,
                blobUrl: null
            });
        });

        renderQueueList();
        uploadCard.classList.add('hidden');
        batchCard.classList.remove('hidden');
    }

    function renderQueueList() {
        fileQueueList.innerHTML = '';
        fileCountBadge.textContent = fileQueue.length;

        const totalBytes = fileQueue.reduce((acc, curr) => acc + curr.file.size, 0);
        totalSizeText.textContent = `Tamaño: ${formatBytes(totalBytes)}`;

        fileQueue.forEach((item, index) => {
            const queueItemDiv = document.createElement('div');
            queueItemDiv.className = 'queue-item spring-item';
            queueItemDiv.style.animationDelay = `${index * 0.07}s`;
            queueItemDiv.id = `item_${item.id}`;

            queueItemDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <div class="item-text">
                        <div class="item-title">${item.file.name}</div>
                        <div class="item-size">${formatBytes(item.file.size)}</div>
                    </div>
                </div>
                <div class="item-status">
                    <span class="status-badge badge-pending">En espera</span>
                    <button class="btn-remove-item" data-id="${item.id}" title="Eliminar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;

            fileQueueList.appendChild(queueItemDiv);
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                fileQueue = fileQueue.filter(x => x.id !== id);
                if (fileQueue.length === 0) resetAll();
                else renderQueueList();
            });
        });
    }

    startBatchBtn.addEventListener('click', async () => {
        if (fileQueue.length === 0) return;

        batchCard.classList.add('hidden');
        progressCard.classList.remove('hidden');

        totalQueueCount.textContent = fileQueue.length;
        completedCount.textContent = '0';
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';

        for (let i = 0; i < fileQueue.length; i++) {
            const item = fileQueue[i];
            item.status = 'processing';
            currentFileName.textContent = `Procesando: ${item.file.name}`;
            statusTitle.textContent = `Recodificando a MP4 H.264 (${i + 1}/${fileQueue.length})...`;

            try {
                const mp4Blob = await convertServerAPI(item.file, (percent) => {
                    const overallPercent = Math.round(((i + (percent / 100)) / fileQueue.length) * 100);
                    progressBar.style.width = `${overallPercent}%`;
                    progressPercent.textContent = `${overallPercent}%`;
                });

                item.blob = mp4Blob;
                item.blobUrl = URL.createObjectURL(mp4Blob);
                item.status = 'completed';
            } catch (err) {
                console.error('API Error:', err);
                item.blob = item.file;
                item.blobUrl = URL.createObjectURL(item.file);
                item.status = 'completed';
            }

            completedCount.textContent = i + 1;
        }

        finishConversion();
    });

    async function convertServerAPI(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        onProgress(30);
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        onProgress(80);
        if (!response.ok) throw new Error('Conversion failed');

        const mp4Blob = await response.blob();
        onProgress(100);
        return mp4Blob;
    }

    function finishConversion() {
        progressCard.classList.add('hidden');
        resultCard.classList.remove('hidden');

        downloadListContainer.innerHTML = '';

        fileQueue.forEach((item, idx) => {
            const cleanName = item.file.name.replace(/\.[^/.]+$/, "");
            const finalFilename = `${cleanName}.mp4`;

            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.marginBottom = '20px';

            const dlBtn = document.createElement('a');
            dlBtn.className = 'btn btn-success acrylic-btn spring-item';
            dlBtn.style.animationDelay = `${idx * 0.08}s`;
            dlBtn.style.marginBottom = '10px';
            dlBtn.href = item.blobUrl;
            dlBtn.download = finalFilename;
            dlBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Descargar ${finalFilename}</span>
            `;

            const videoElem = document.createElement('video');
            videoElem.src = item.blobUrl;
            videoElem.controls = true;
            videoElem.style.width = '100%';
            videoElem.style.borderRadius = '12px';
            videoElem.style.maxHeight = '220px';

            wrapperDiv.appendChild(dlBtn);
            wrapperDiv.appendChild(videoElem);

            downloadListContainer.appendChild(wrapperDiv);
        });
    }

    function resetAll() {
        fileQueue.forEach(item => {
            if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
        });
        fileQueue = [];
        fileInput.value = '';

        uploadCard.classList.remove('hidden');
        batchCard.classList.add('hidden');
        progressCard.classList.add('hidden');
        resultCard.classList.add('hidden');
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
