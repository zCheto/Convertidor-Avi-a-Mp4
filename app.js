document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════════════════
    // ❄️  SNOW + SPARKLE ENGINE (HARDWARE ACCELERATED 60FPS)
    // ═══════════════════════════════════════════════════════════
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true });
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let windX = 0;
        let lastMove = 0;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const handleMove = (x, y) => {
            windX = ((x / width) - 0.5) * 1.2;
            const now = Date.now();
            if (now - lastMove > 40) {
                spawnSparkle(x, y);
                lastMove = now;
            }
        };

        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY), { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        const numFlakes = Math.min(45, Math.floor(width / 25));
        const flakes = [];
        for (let i = 0; i < numFlakes; i++) {
            flakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.2 + 1,
                speedY: Math.random() * 0.7 + 0.3,
                speedX: Math.random() * 0.3 - 0.15,
                opacity: Math.random() * 0.6 + 0.2
            });
        }

        const sparkles = [];
        function spawnSparkle(x, y) {
            if (sparkles.length < 20) {
                sparkles.push({
                    x: x + (Math.random() * 8 - 4),
                    y: y + (Math.random() * 8 - 4),
                    radius: Math.random() * 2.5 + 1.5,
                    color: Math.random() > 0.5 ? 'rgba(192, 132, 252,' : 'rgba(244, 114, 182,',
                    life: 1,
                    decay: Math.random() * 0.05 + 0.03,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2
                });
            }
        }

        function renderScene() {
            ctx.clearRect(0, 0, width, height);

            // Render flakes efficiently
            for (let i = 0; i < numFlakes; i++) {
                const f = flakes[i];
                ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();

                f.y += f.speedY;
                f.x += f.speedX + windX * 0.4;
                if (f.y > height) { f.y = -10; f.x = Math.random() * width; }
                if (f.x > width) f.x = 0;
                if (f.x < 0) f.x = width;
            }

            // Render sparkles without expensive shadowBlur
            for (let i = sparkles.length - 1; i >= 0; i--) {
                const p = sparkles[i];
                ctx.fillStyle = `${p.color}${p.life})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) sparkles.splice(i, 1);
            }

            requestAnimationFrame(renderScene);
        }
        renderScene();
    }

    // ═══════════════════════════════════════════════════════════
    // ✨  3D TILT ON CARDS
    // ═══════════════════════════════════════════════════════════
    function initTilt() {
        document.querySelectorAll('.card').forEach(card => {
            if (card.dataset.tiltInited) return;
            card.dataset.tiltInited = 'true';
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const rotX = ((e.clientY - r.top - r.height / 2) / r.height) * -6;
                const rotY = ((e.clientX - r.left - r.width / 2) / r.width) * 6;
                card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }
    initTilt();

    // ═══════════════════════════════════════════════════════════
    // 🔔  TOAST NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════
    const toastContainer = document.getElementById('toastContainer');

    function showToast(title, message = '', type = 'success', duration = 4500) {
        const icons = { success: '✅', error: '❌', info: '💜' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '📢'}</span>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-msg">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Cerrar">✕</button>
        `;
        const dismiss = () => {
            toast.classList.add('dismissing');
            setTimeout(() => toast.remove(), 350);
        };
        toast.querySelector('.toast-close').addEventListener('click', dismiss);
        setTimeout(dismiss, duration);
        toastContainer.appendChild(toast);
    }

    // ═══════════════════════════════════════════════════════════
    // 🖼️  THUMBNAIL GENERATION
    // ═══════════════════════════════════════════════════════════
    function generateThumbnail(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            video.src = url;
            video.muted = true;
            video.preload = 'metadata';

            const cleanup = () => { try { URL.revokeObjectURL(url); } catch {} };
            const giveUp = setTimeout(() => { cleanup(); resolve(null); }, 6000);

            video.addEventListener('loadeddata', () => {
                video.currentTime = Math.min(1.5, (video.duration || 2) * 0.1);
            });

            video.addEventListener('seeked', () => {
                clearTimeout(giveUp);
                try {
                    const c = document.createElement('canvas');
                    c.width = 120; c.height = 68;
                    c.getContext('2d').drawImage(video, 0, 0, 120, 68);
                    cleanup();
                    resolve(c.toDataURL('image/jpeg', 0.75));
                } catch { cleanup(); resolve(null); }
            });

            video.addEventListener('error', () => { clearTimeout(giveUp); cleanup(); resolve(null); });
            video.load();
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 📦  DOM REFERENCES
    // ═══════════════════════════════════════════════════════════
    const dropZone      = document.getElementById('dropZone');
    const fileInput     = document.getElementById('fileInput');
    const uploadCard    = document.getElementById('uploadCard');
    const batchCard     = document.getElementById('batchCard');
    const optionsCard   = document.getElementById('optionsCard');
    const progressCard  = document.getElementById('progressCard');
    const resultCard    = document.getElementById('resultCard');

    const fileCountBadge = document.getElementById('fileCountBadge');
    const totalSizeText  = document.getElementById('totalSizeText');
    const fileQueueList  = document.getElementById('fileQueueList');
    const clearAllBtn    = document.getElementById('clearAllBtn');
    const startBatchBtn  = document.getElementById('startBatchBtn');

    const progressBar    = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const currentFileName = document.getElementById('currentFileName');
    const completedCount  = document.getElementById('completedCount');
    const totalQueueCount = document.getElementById('totalQueueCount');
    const statusTitle     = document.getElementById('statusTitle');
    const speedIndicator  = document.getElementById('speedIndicator');

    const downloadListContainer = document.getElementById('downloadListContainer');
    const convertMoreBtn        = document.getElementById('convertMoreBtn');

    // Options DOM
    const optionsBackBtn    = document.getElementById('optionsBackBtn');
    const confirmConvertBtn = document.getElementById('confirmConvertBtn');
    const resolutionSelect  = document.getElementById('resolutionSelect');
    const audioOnlyCheck    = document.getElementById('audioOnlyCheck');
    const estOutputSize     = document.getElementById('estOutputSize');
    const estTime           = document.getElementById('estTime');
    const estRatio          = document.getElementById('estRatio');

    // History DOM
    const historySection  = document.getElementById('historySection');
    const historyList     = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // ═══════════════════════════════════════════════════════════
    // 🎛️  STATE
    // ═══════════════════════════════════════════════════════════
    let fileQueue       = [];
    let selectedQuality = 'high';
    let selectedRes     = 'original';
    let audioOnly       = false;

    const QUALITY_MULT = { high: 0.88, medium: 0.55, low: 0.28 };
    const AUDIO_MULT   = 0.05;
    const SECS_PER_MB  = { high: 4.5, medium: 3, low: 2 };

    // ═══════════════════════════════════════════════════════════
    // 📂  FILE INPUT & DROP
    // ═══════════════════════════════════════════════════════════
    dropZone.addEventListener('click', (e) => {
        if (e.target !== fileInput) fileInput.click();
    });
    ['dragenter', 'dragover'].forEach(n => {
        dropZone.addEventListener(n, (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(n => {
        dropZone.addEventListener(n, (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('dragover'); });
    });
    dropZone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        if (files.length) addFilesToQueue(files);
    });
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length) addFilesToQueue(files);
    });

    clearAllBtn.addEventListener('click', resetAll);
    convertMoreBtn.addEventListener('click', resetAll);

    // ═══════════════════════════════════════════════════════════
    // 📋  QUEUE MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async function addFilesToQueue(files) {
        const valid = files.filter(f =>
            f.name.toLowerCase().endsWith('.avi') ||
            f.name.toLowerCase().endsWith('.mp4') ||
            f.type.includes('video')
        );

        if (!valid.length) {
            showToast('Formato no válido', 'Selecciona videos .AVI válidos.', 'error');
            return;
        }

        const newItems = valid.map(file => ({
            id: 'f_' + Math.random().toString(36).slice(2, 10),
            file,
            status: 'pending',
            blob: null,
            blobUrl: null,
            outputSize: null,
            thumbnail: null
        }));

        fileQueue.push(...newItems);
        renderQueueList();
        uploadCard.classList.add('hidden');
        batchCard.classList.remove('hidden');
        initTilt();

        // Async thumbnail generation — updates DOM in-place
        for (const item of newItems) {
            const thumb = await generateThumbnail(item.file);
            if (!thumb) continue;
            item.thumbnail = thumb;
            const img = document.getElementById('thumb_' + item.id);
            const ph  = document.getElementById('thumbph_' + item.id);
            if (img) { img.src = thumb; img.style.display = 'block'; }
            if (ph)  ph.style.display = 'none';
        }
    }

    function renderQueueList() {
        fileQueueList.innerHTML = '';
        fileCountBadge.textContent = fileQueue.length;
        const totalBytes = fileQueue.reduce((a, c) => a + c.file.size, 0);
        totalSizeText.textContent = `Tamaño: ${formatBytes(totalBytes)}`;

        fileQueue.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'queue-item spring-item';
            div.style.animationDelay = `${idx * 0.07}s`;
            div.id = `item_${item.id}`;

            const thumbHTML = item.thumbnail
                ? `<img class="item-thumbnail" id="thumb_${item.id}" src="${item.thumbnail}" alt="Preview">`
                : `<div class="item-thumbnail-placeholder" id="thumbph_${item.id}">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <polygon points="23 7 16 12 23 17 23 7"></polygon>
                           <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                       </svg>
                   </div>
                   <img class="item-thumbnail" id="thumb_${item.id}" src="" alt="" style="display:none">`;

            div.innerHTML = `
                <div class="item-info">
                    ${thumbHTML}
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
                </div>`;
            fileQueueList.appendChild(div);
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                fileQueue = fileQueue.filter(x => x.id !== id);
                if (!fileQueue.length) resetAll();
                else renderQueueList();
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // ⚙️  OPTIONS CARD
    // ═══════════════════════════════════════════════════════════
    startBatchBtn.addEventListener('click', () => {
        batchCard.classList.add('hidden');
        optionsCard.classList.remove('hidden');
        updateEstimation();
        initTilt();
    });

    document.querySelectorAll('input[name="quality"]').forEach(r => {
        r.addEventListener('change', (e) => { selectedQuality = e.target.value; updateEstimation(); });
    });

    resolutionSelect.addEventListener('change', () => {
        selectedRes = resolutionSelect.value;
        updateEstimation();
    });

    audioOnlyCheck.addEventListener('change', () => {
        audioOnly = audioOnlyCheck.checked;
        updateEstimation();
    });

    optionsBackBtn.addEventListener('click', () => {
        optionsCard.classList.add('hidden');
        batchCard.classList.remove('hidden');
    });

    confirmConvertBtn.addEventListener('click', startConversion);

    function updateEstimation() {
        const totalBytes = fileQueue.reduce((a, c) => a + c.file.size, 0);
        const mult  = audioOnly ? AUDIO_MULT : (QUALITY_MULT[selectedQuality] || 0.55);
        const estB  = Math.round(totalBytes * mult);
        const saved = Math.round((1 - mult) * 100);
        const secs  = Math.round((totalBytes / 1048576) * (audioOnly ? 1.5 : (SECS_PER_MB[selectedQuality] || 3)));

        estOutputSize.textContent = formatBytes(estB);
        estTime.textContent = secs < 60 ? `~${secs}s` : `~${Math.round(secs / 60)}min`;
        estRatio.textContent = `-${saved}%`;
    }

    // ═══════════════════════════════════════════════════════════
    // 🔄  CONVERSION
    // ═══════════════════════════════════════════════════════════
    async function startConversion() {
        if (!fileQueue.length) return;
        optionsCard.classList.add('hidden');
        progressCard.classList.remove('hidden');

        totalQueueCount.textContent = fileQueue.length;
        completedCount.textContent  = '0';
        progressBar.style.width     = '0%';
        progressPercent.textContent = '0%';

        for (let i = 0; i < fileQueue.length; i++) {
            const item = fileQueue[i];
            item.status = 'processing';
            currentFileName.textContent = item.file.name;
            statusTitle.textContent = `Convirtiendo archivo ${i + 1} de ${fileQueue.length}...`;

            setStage('upload');

            try {
                const resultBlob = await convertServerAPI(
                    item.file,
                    (pct) => {
                        const overall = Math.round(((i + pct / 100) / fileQueue.length) * 100);
                        progressBar.style.width = `${overall}%`;
                        progressPercent.textContent = `${overall}%`;
                        if (pct < 55) setStage('upload');
                        else if (pct < 95) setStage('process');
                        else setStage('done');
                    },
                    (speed) => {
                        if (speedIndicator) speedIndicator.textContent = `↑ ${speed}`;
                    }
                );

                item.blob       = resultBlob;
                item.blobUrl    = URL.createObjectURL(resultBlob);
                item.outputSize = resultBlob.size;
                item.status     = 'completed';
            } catch (err) {
                console.error('Error durante la conversión:', err);
                item.status   = 'error';
                item.errorMsg = err.message || 'Fallo en la respuesta del servidor';
            }

            completedCount.textContent = i + 1;
        }

        finishConversion();
    }

    function setStage(stage) {
        document.querySelectorAll('.stage-pill').forEach(pill => {
            pill.classList.remove('active', 'done');
            const s = pill.dataset.stage;
            if (stage === 'upload'   && s === 'upload')   { pill.classList.add('active'); }
            if (stage === 'process') {
                if (s === 'upload')  pill.classList.add('done');
                if (s === 'process') pill.classList.add('active');
            }
            if (stage === 'done') {
                if (s === 'upload' || s === 'process') pill.classList.add('done');
                if (s === 'done')  pill.classList.add('active');
            }
        });
    }

    function convertServerAPI(file, onProgress, onSpeed) {
        return new Promise((resolve, reject) => {
            const form = new FormData();
            form.append('file', file);

            const xhr = new XMLHttpRequest();
            let lastLoaded = 0, lastTime = Date.now();

            xhr.upload.onprogress = (e) => {
                if (!e.lengthComputable) return;
                const pct = Math.round((e.loaded / e.total) * 55);
                onProgress(pct);
                const now = Date.now(), dt = (now - lastTime) / 1000;
                if (dt > 0.25) {
                    onSpeed(formatSpeed((e.loaded - lastLoaded) / dt));
                    lastLoaded = e.loaded; lastTime = now;
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) { onProgress(100); resolve(xhr.response); }
                else reject(new Error(`HTTP ${xhr.status}`));
            };
            xhr.onerror = () => reject(new Error('Error de red o conexión perdida'));
            xhr.responseType = 'blob';
            xhr.open('POST', '/api/convert');
            xhr.send(form);
        });
    }

    function finishConversion() {
        progressCard.classList.add('hidden');
        resultCard.classList.remove('hidden');
        downloadListContainer.innerHTML = '';

        const resultIconWrapper = document.getElementById('resultIconWrapper');
        const resultTitle       = document.getElementById('resultTitle');
        const resultSubtitle    = document.getElementById('resultSubtitle');

        const ext = audioOnly ? 'mp3' : 'mp4';
        let successCount = 0;
        let errorCount = 0;

        fileQueue.forEach((item, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'result-item-wrapper';

            if (item.status === 'completed') {
                successCount++;
                const baseName = item.file.name.replace(/\.[^/.]+$/, '');
                const outName  = `${baseName}.${ext}`;

                const dlBtn = document.createElement('a');
                dlBtn.className = 'btn btn-success spring-item';
                dlBtn.style.cssText = `animation-delay:${idx * 0.08}s; margin-bottom:10px; width: 100%;`;
                dlBtn.href = item.blobUrl;
                dlBtn.download = outName;
                dlBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Descargar ${outName}</span>`;

                wrapper.appendChild(dlBtn);

                if (!audioOnly) {
                    const vid = document.createElement('video');
                    vid.src = item.blobUrl; vid.controls = true;
                    vid.style.cssText = 'width:100%;border-radius:12px;max-height:220px;';
                    wrapper.appendChild(vid);
                }
            } else {
                errorCount++;
                const errBox = document.createElement('div');
                errBox.className = 'error-card-item spring-item';
                errBox.style.cssText = `animation-delay:${idx * 0.08}s;`;
                errBox.innerHTML = `
                    <div class="error-card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Error al convertir "${item.file.name}"</span>
                    </div>
                    <p class="error-card-body">No se pudo procesar este archivo. Verifica que sea un video .AVI válido y no supere el tamaño recomendado (150 MB).</p>
                `;
                wrapper.appendChild(errBox);
            }

            downloadListContainer.appendChild(wrapper);
        });

        // Set dynamic headers based on results
        if (errorCount > 0 && successCount === 0) {
            if (resultIconWrapper) {
                resultIconWrapper.innerHTML = `
                    <div class="error-icon-wrapper">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>`;
            }
            if (resultTitle) resultTitle.textContent = 'Error en la Conversión';
            if (resultSubtitle) resultSubtitle.textContent = 'No se pudo procesar el archivo seleccionado.';
        } else if (errorCount > 0 && successCount > 0) {
            if (resultIconWrapper) {
                resultIconWrapper.innerHTML = `
                    <div class="warning-icon-wrapper">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>`;
            }
            if (resultTitle) resultTitle.textContent = 'Resultado de la Conversión';
            if (resultSubtitle) resultSubtitle.textContent = 'Algunos videos se convirtieron correctamente y otros presentaron errores.';
        } else {
            if (resultIconWrapper) {
                resultIconWrapper.innerHTML = `
                    <div class="success-icon-wrapper">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>`;
            }
            if (resultTitle) resultTitle.textContent = '¡Videos Convertidos a MP4!';
            if (resultSubtitle) resultSubtitle.textContent = 'Descarga tus videos directamente a la Galería de tu celular.';
        }

        saveToHistory();
        initTilt();

        if (errorCount === 0) {
            showToast(
                `${successCount} video${successCount > 1 ? 's' : ''} convertido${successCount > 1 ? 's' : ''} correctamente`,
                `Calidad: ${selectedQuality === 'high' ? 'Alta' : selectedQuality === 'medium' ? 'Media' : 'Comprimida'}`,
                'success'
            );
        } else if (successCount > 0) {
            showToast(
                `Conversión finalizada con advertencias`,
                `${successCount} convertidos, ${errorCount} con error`,
                'info'
            );
        } else {
            showToast(
                `Error en la conversión`,
                `No se pudo procesar ningún archivo de la lista`,
                'error'
            );
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 📚  HISTORY (localStorage)
    // ═══════════════════════════════════════════════════════════
    const HIST_KEY = 'avi_converter_history';

    function saveToHistory() {
        const hist = getHistory();
        fileQueue.forEach(item => {
            if (item.status !== 'completed') return;
            hist.unshift({
                id:           item.id,
                name:         item.file.name,
                outName:      item.file.name.replace(/\.[^/.]+$/, '') + (audioOnly ? '.mp3' : '.mp4'),
                origSize:     item.file.size,
                outSize:      item.outputSize || item.file.size,
                quality:      selectedQuality,
                resolution:   selectedRes,
                audioOnly:    audioOnly,
                date:         new Date().toISOString()
            });
        });
        while (hist.length > 25) hist.pop();
        try { localStorage.setItem(HIST_KEY, JSON.stringify(hist)); } catch {}
        renderHistory();
    }

    function getHistory() {
        try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch { return []; }
    }

    function renderHistory() {
        const hist = getHistory();
        if (!hist.length) { historySection.classList.add('hidden'); return; }
        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        hist.forEach(entry => {
            const saved = entry.origSize > 0
                ? Math.round((1 - entry.outSize / entry.origSize) * 100)
                : 0;
            const d = new Date(entry.date);
            const dateStr = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
            const timeStr = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const qLabel  = entry.quality === 'high' ? 'Alta' : entry.quality === 'medium' ? 'Media' : 'Comprimida';

            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <div class="history-info">
                    <div class="history-name">${entry.outName}</div>
                    <div class="history-meta">${formatBytes(entry.origSize)} → ${formatBytes(entry.outSize)} · ${qLabel}</div>
                </div>
                <div class="history-size-saved">
                    <div class="history-saved-pct">${saved > 0 ? `-${saved}%` : '±0%'}</div>
                    <div class="history-date">${dateStr} · ${timeStr}</div>
                </div>`;
            historyList.appendChild(div);
        });

        initTilt();
    }

    clearHistoryBtn.addEventListener('click', () => {
        try { localStorage.removeItem(HIST_KEY); } catch {}
        renderHistory();
        showToast('Historial borrado', 'Se eliminaron todos los registros guardados.', 'info');
    });

    // ═══════════════════════════════════════════════════════════
    // ❓  FAQ ACCORDION
    // ═══════════════════════════════════════════════════════════
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 🔁  RESET
    // ═══════════════════════════════════════════════════════════
    function resetAll() {
        fileQueue.forEach(item => { if (item.blobUrl) URL.revokeObjectURL(item.blobUrl); });
        fileQueue = []; fileInput.value = '';
        selectedQuality = 'high'; selectedRes = 'original'; audioOnly = false;
        document.querySelectorAll('input[name="quality"]').forEach(r => { r.checked = r.value === 'high'; });
        if (resolutionSelect) resolutionSelect.value = 'original';
        if (audioOnlyCheck)  audioOnlyCheck.checked = false;
        if (speedIndicator)  speedIndicator.textContent = 'Conectando...';
        document.querySelectorAll('.stage-pill').forEach((p, i) => {
            p.classList.remove('active', 'done');
            if (i === 0) p.classList.add('active');
        });
        [batchCard, optionsCard, progressCard, resultCard].forEach(c => c.classList.add('hidden'));
        uploadCard.classList.remove('hidden');
    }

    // ═══════════════════════════════════════════════════════════
    // 🛠️  UTILITIES
    // ═══════════════════════════════════════════════════════════
    function formatBytes(bytes, dec = 2) {
        if (!bytes) return '0 Bytes';
        const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dec)) + ' ' + s[i];
    }

    function formatSpeed(bps) {
        if (bps < 1024)         return `${Math.round(bps)} B/s`;
        if (bps < 1048576)      return `${(bps / 1024).toFixed(1)} KB/s`;
        return `${(bps / 1048576).toFixed(1)} MB/s`;
    }

    // ─── Init ───
    renderHistory();
});
