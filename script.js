document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. 時計機能
    // ============================================
    const timeDisplay = document.getElementById('time-display');
    const msDisplay = document.getElementById('ms-display');
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        if (timeDisplay) {
            timeDisplay.innerText = `${h}:${m}:${s}`;
            msDisplay.innerText = `.${ms}`;
        }
        requestAnimationFrame(updateClock);
    }
    updateClock();

    // ============================================
    // 2. 設定パネル UI (背景クリック対応版)
    // ============================================
    const settingsBtn = document.getElementById('settings-btn');
    const controlPanel = document.getElementById('control-panel');
    const closeBtn = document.getElementById('close-btn');

    // パネルを開く
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            controlPanel.classList.remove('panel-hidden');
        });
    }

    const closePanel = () => controlPanel.classList.add('panel-hidden');

    // ×ボタンで閉じる
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePanel();
        });
    }

    // 外側クリックで閉じる
    document.addEventListener('click', (e) => {
        if (!controlPanel.classList.contains('panel-hidden') && 
            !controlPanel.contains(e.target) && 
            e.target !== settingsBtn) {
            closePanel();
        }
    });

    // ============================================
    // 3. カラーテーマ (無料版用: 強制Cyan)
    // ============================================
    const colorBtns = document.querySelectorAll('.color-btn');
    function applyColor(colorName) {
        document.body.classList.remove('theme-red', 'theme-green', 'theme-purple', 'theme-orange');
        if (colorName !== 'cyan') document.body.classList.add(`theme-${colorName}`);
        
        colorBtns.forEach(btn => {
            if (btn.getAttribute('data-color') === colorName) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    // 無料版のため強制Cyan (有料版では localStorage 対応に戻す)
    applyColor('cyan');

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const c = btn.getAttribute('data-color');
            applyColor(c); localStorage.setItem('hud-color', c);
        });
    });

    // ============================================
    // 4. ON/OFF (Checkbox)
    // ============================================
    const checkboxes = document.querySelectorAll('#control-panel input[type="checkbox"]');
    checkboxes.forEach(box => {
        const targetId = box.getAttribute('data-target');
        const el = document.getElementById(targetId);
        
        const saved = localStorage.getItem(targetId);
        if (saved === 'off') {
            box.checked = false; if(el) el.classList.add('hidden');
        } else {
            box.checked = true; if(el) el.classList.remove('hidden');
        }

        box.addEventListener('change', (e) => {
            if(e.target.checked) {
                if(el) el.classList.remove('hidden'); localStorage.setItem(targetId, 'on');
            } else {
                if(el) el.classList.add('hidden'); localStorage.setItem(targetId, 'off');
            }
        });
    });

    // ============================================
    // 5. スライダー (Zoom & Dimension)
    // ============================================
    function setupZoom(id, dispId, targetId, key, isIframe=false) {
        const s = document.getElementById(id), d = document.getElementById(dispId), t = document.getElementById(targetId);
        if(!s || !t) return;
        const apply = (val) => {
            if(d) d.innerText = val;
            if(isIframe) {
                const f = t.querySelector('iframe');
                if(f) { f.style.transform=`scale(${val})`; f.style.width=`${100/val}%`; f.style.height=`${100/val}%`; }
            } else {
                t.style.transform=`scale(${val})`;
                const l = t.querySelector('.label');
                if(l) {
                    if(val>=1.0) { l.style.transform=`scale(${1/val})`; l.style.marginBottom=`${5/val}px`; l.style.width=`${val*100}%`; }
                    else { l.style.transform='scale(1)'; l.style.marginBottom='5px'; l.style.width='auto'; }
                }
            }
        };
        s.addEventListener('input', e=>{ apply(e.target.value); localStorage.setItem(key, e.target.value); });
        const saved = localStorage.getItem(key); if(saved) { s.value=saved; apply(saved); }
    }

    function setupDim(id, dispId, targetId, prop, key) {
        const s = document.getElementById(id), d = document.getElementById(dispId), t = document.getElementById(targetId);
        if(!s || !t) return;
        const apply = (val) => { if(d) d.innerText = val; t.style[prop]=`${val}px`; };
        s.addEventListener('input', e=>{ apply(e.target.value); localStorage.setItem(key, e.target.value); });
        const saved = localStorage.getItem(key); if(saved) { s.value=saved; apply(saved); }
    }

    setupZoom('clock-scale', 'clock-scale-val', 'clock-module', 'scale-clock');
    setupZoom('wave-scale', 'wave-scale-val', 'wave-module', 'scale-wave');
    setupZoom('log-scale', 'log-scale-val', 'log-module', 'scale-log', true);
    setupDim('log-width', 'log-width-val', 'log-module', 'width', 'dim-log-w');
    setupDim('log-height', 'log-height-val', 'log-module', 'height', 'dim-log-h');
    
    setupZoom('ticker-scale', 'ticker-scale-val', 'ticker-module', 'scale-ticker');
    setupDim('ticker-width', 'ticker-width-val', 'ticker-module', 'width', 'dim-ticker-w');
    setupZoom('social-scale', 'social-scale-val', 'social-module', 'scale-social');

    // ============================================
    // 6. わんコメURL
    // ============================================
    const urlIn = document.getElementById('comment-url-input'), chatF = document.getElementById('chat-frame'), ph = document.getElementById('log-placeholder');
    if(urlIn) {
        const saved = localStorage.getItem('comment-url');
        if(saved) { urlIn.value=saved; chatF.src=saved; if(ph) ph.style.display='none'; }
        urlIn.addEventListener('change', ()=>{
            const v = urlIn.value; localStorage.setItem('comment-url', v); chatF.src=v;
            if(ph) ph.style.display = v ? 'none' : 'block';
        });
    }

    // ============================================
    // 7. 一言欄 (Ticker)
    // ============================================
    const tickerIn = document.getElementById('ticker-text-input'), tickerDisp = document.getElementById('ticker-display');
    if(tickerIn) {
        const saved = localStorage.getItem('ticker-text') || "Welcome to my stream!";
        tickerIn.value = saved; tickerDisp.innerText = saved;
        tickerIn.addEventListener('input', ()=>{
            const v = tickerIn.value || " ";
            tickerDisp.innerText = v; localStorage.setItem('ticker-text', v);
        });
    }

    // ============================================
    // 8. SNS (Social)
    // ============================================
    const snsInputs = { x: 'sns-x-input', insta: 'sns-insta-input', tiktok: 'sns-tiktok-input' };
    const socialList = document.getElementById('social-list');

    function updateSocial() {
        if(!socialList) return;
        socialList.innerHTML = '';
        Object.keys(snsInputs).forEach(key => {
            const input = document.getElementById(snsInputs[key]);
            const val = input.value.trim();
            localStorage.setItem(`sns-${key}`, val);
            
            if(val) {
                const div = document.createElement('div'); div.className = 'social-item';
                div.innerHTML = `<svg class="social-icon"><use href="#icon-${key}"></use></svg><span>${val}</span>`;
                socialList.appendChild(div);
            }
        });
    }
    Object.keys(snsInputs).forEach(key => {
        const input = document.getElementById(snsInputs[key]);
        const saved = localStorage.getItem(`sns-${key}`);
        if(saved) input.value = saved;
        input.addEventListener('change', updateSocial);
    });
    updateSocial();

    // ============================================
    // 9. マイク波形（ハイブリッド版：シミュレーション付き）
    // ============================================
    const waveCont = document.querySelector('.wave-container');
    const waveChk = document.querySelector('input[data-target="wave-module"]');
    
    if(waveCont) {
        waveCont.innerHTML=''; 
        const bars=[];
        for(let i=0;i<16;i++){
            const b=document.createElement('div'); 
            b.className='wave-bar'; 
            waveCont.appendChild(b); 
            bars.push(b);
        }

        let aCtx=null, anl=null, src=null, ani=null;
        let isSimulation = false;

        // ▼ 本物のマイク取得モード
        async function startAudio() {
            if(waveChk && !waveChk.checked) return;
            if(aCtx && aCtx.state === 'running') return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // 成功したらシミュレーション停止
                if(isSimulation) stopSimulation();

                const AC = window.AudioContext || window.webkitAudioContext;
                aCtx = new AC();
                anl = aCtx.createAnalyser();
                src = aCtx.createMediaStreamSource(stream);
                anl.fftSize = 64;
                src.connect(anl);
                
                const len = anl.frequencyBinCount;
                const data = new Uint8Array(len);

                function frame() {
                    if(!aCtx) return;
                    ani = requestAnimationFrame(frame);
                    anl.getByteFrequencyData(data);
                    for(let i=0; i<16; i++){
                        const idx = Math.floor(i * (len / 20));
                        const v = data[idx] || 0;
                        const pct = (v / 255) * 100;
                        bars[i].style.height = Math.max(5, pct * 1.5) + '%'; 
                        if(pct > 80) bars[i].classList.add('warning'); 
                        else bars[i].classList.remove('warning');
                    }
                }
                
                if(ani) cancelAnimationFrame(ani);
                frame();
                console.log("Mic Active (Real)");

            } catch(e) {
                console.warn("Mic failed, switching to Simulation Mode", e);
                if(!isSimulation) startSimulation();
            }
        }

        // ▼ シミュレーション（バックアップ）モード
        function startSimulation() {
            if(isSimulation) return;
            if(ani) cancelAnimationFrame(ani);
            isSimulation = true;
            console.log("Simulation Active (Fake)");
            
            function simFrame() {
                if(!isSimulation) return;
                ani = requestAnimationFrame(simFrame);
                
                const time = Date.now() * 0.003; // 時間経過（数字を小さくするともっとゆっくりになります）
                
                for(let i=0; i<16; i++){
                    // Math.sin を使って滑らかな波を作る (-1.0 〜 1.0)
                    // i * 0.4 は波の細かさ
                    const wave = Math.sin(time + i * 0.4);
                    
                    // 高さに変換 (中心30%、振れ幅20% ＝ 10%〜50%の間を行き来する)
                    let pct = 30 + (wave * 20);
                    
                    // ほんの少しだけランダムな揺らぎを足して機械っぽさを消す
                    pct += Math.random() * 5;
                    
                    bars[i].style.height = pct + '%';
                    
                    // シミュレーション中は赤色（Warning）をめったに出さない（落ち着かせる）
                    // 波が高いときだけ、たまーに光る
                    if(pct > 45 && Math.random() > 0.98) bars[i].classList.add('warning');
                    else bars[i].classList.remove('warning');
                }
            }
            simFrame();
        }

        function stopSimulation() {
            isSimulation = false;
            if(ani) cancelAnimationFrame(ani);
            ani = null;
        }

        function stopAudio() {
            stopSimulation();
            if(ani) cancelAnimationFrame(ani);
            if(src) src.disconnect();
            if(aCtx) aCtx.close();
            aCtx = null; src = null; anl = null; ani = null;
        }

        if(waveChk) {
            waveChk.addEventListener('change', () => {
                if(waveChk.checked) startAudio();
                else stopAudio();
            });
        }

        // クリックで再試行（制限なし）
        document.body.addEventListener('click', () => {
            if(waveChk && waveChk.checked) {
                if(!aCtx) {
                    // シミュレーション中でも本物を試す
                    startAudio();
                } else if(aCtx.state === 'suspended') {
                    aCtx.resume();
                }
            }
        });
        
        // 2秒後に自動開始試行
        setTimeout(() => {
            if(waveChk && waveChk.checked && !aCtx && !isSimulation) startSimulation();
        }, 2000);
    }

    // ============================================
    // 10. ドラッグ移動
    // ============================================
    const drags = ['clock-module','log-module','wave-module','ticker-module','social-module'];
    drags.forEach(id => setupDrag(document.getElementById(id)));
    function setupDrag(el) {
        if(!el)return;
        const saved=localStorage.getItem(`pos-${el.id}`);
        if(saved){ const p=JSON.parse(saved); el.style.bottom='auto'; el.style.right='auto'; el.style.left=p.left; el.style.top=p.top; }
        
        let isD=false, sx, sy, il, it;
        el.addEventListener('mousedown',e=>{
            if(['INPUT','BUTTON','SELECT'].includes(e.target.tagName))return;
            if(el.id==='log-module' && e.target.id==='chat-frame')return;
            isD=true; el.classList.add('dragging');
            const r=el.getBoundingClientRect(); sx=e.clientX; sy=e.clientY; il=r.left; it=r.top;
            el.style.bottom='auto'; el.style.right='auto'; el.style.left=`${il}px`; el.style.top=`${it}px`;
        });
        document.addEventListener('mousemove',e=>{
            if(!isD)return; e.preventDefault();
            el.style.left=`${il+(e.clientX-sx)}px`; el.style.top=`${it+(e.clientY-sy)}px`;
        });
        document.addEventListener('mouseup',()=>{
            if(!isD)return; isD=false; el.classList.remove('dragging');
            localStorage.setItem(`pos-${el.id}`, JSON.stringify({left:el.style.left, top:el.style.top}));
        });
    }

    // リセット
    const rBtn = document.getElementById('reset-pos-btn');
    if(rBtn) rBtn.addEventListener('click', ()=>{ 
        // 確認ダイアログを出さずに、押したらすぐ実行
        drags.forEach(id => localStorage.removeItem(`pos-${id}`)); 
        location.reload(); 
    });
});