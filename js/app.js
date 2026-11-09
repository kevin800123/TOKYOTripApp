(() => {
    const MARKS = { 飲食: '食', 景點: '景', 購物: '買', 交通: '移', 滑雪: '雪', 體驗: '体', 住宿: '宿', 其他: '他' };
    const NTH = ['一', '二', '三', '四', '五', '六', '七'];
    const openLabel = (name) => (/^[A-Za-z]/.test(name) ? `打開 ${name}` : `打開${name}`);
    const CATEGORIES = Object.keys(MARKS);

    const state = { view: 'plan', dayId: 1, nextId: null };
    const $ = (sel) => document.querySelector(sel);
    const main = $('#main');
    const sheet = $('#sheet');
    const sheetBody = $('#sheet-body');

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

    // 不管手機時區設在哪，都用日本時間判斷「今天」和「下一站」。
    function jstNow() {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(new Date()).map((p) => [p.type, p.value]));
        return { iso: `${parts.year}-${parts.month}-${parts.day}`, hm: `${parts.hour}:${parts.minute}` };
    }

    const daysBetween = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
    const shortDate = (iso) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;

    function currentDay() {
        return Store.day(state.dayId);
    }

    function nextItemId(day) {
        const now = jstNow();
        if (now.iso !== day.iso) return null;
        return day.items.find((item) => item.time >= now.hm)?.id ?? null;
    }

    function tripStatus() {
        const today = jstNow().iso;
        if (today < TRIP.start) return `還有 ${daysBetween(today, TRIP.start)} 天出發`;
        if (today > TRIP.end) return '旅程已結束';
        return `第 ${daysBetween(TRIP.start, today) + 1} 天`;
    }

    function dueChip(task) {
        const left = daysBetween(jstNow().iso, task.due);
        if (Store.isChecked(task.id)) return '';
        if (task.hard) {
            if (left < 0) return '<span class="chip urgent">已截止</span>';
            if (left === 0) return '<span class="chip urgent">今天截止</span>';
            return `<span class="chip ${left <= 30 ? 'urgent' : ''}">${shortDate(task.due)} 截止，剩 ${left} 天</span>`;
        }
        if (left < 0) return '<span class="chip urgent">該處理了</span>';
        return `<span class="chip">建議 ${shortDate(task.due)} 前</span>`;
    }

    function openTaskCount() {
        return TRIP.tasks.filter((t) => !Store.isChecked(t.id)).length;
    }

    /* ---------- 畫面 ---------- */

    function renderChrome() {
        $('#trip-status').textContent = tripStatus();
        document.querySelectorAll('.tab').forEach((tab) => {
            const active = tab.dataset.view === state.view;
            tab.toggleAttribute('aria-current', active);
            if (active) tab.setAttribute('aria-current', 'page');
        });
        const count = openTaskCount();
        const badge = $('#task-count');
        badge.textContent = count;
        badge.hidden = count === 0;
        $('#fab').hidden = state.view !== 'plan';
        $('#days').hidden = state.view !== 'plan';
    }

    function renderDayTabs() {
        const today = jstNow().iso;
        $('#days').innerHTML = `<ol>${Store.days().map((day) => `
            <li>
                <button class="day-tab ${day.iso === today ? 'is-today' : ''}" data-action="day" data-day="${day.id}" ${day.id === state.dayId ? 'aria-current="true"' : ''}>
                    <span class="day-date">${day.date}</span>
                    <span class="day-name">${esc(day.station)}</span>
                </button>
            </li>`).join('')}</ol>`;
    }

    function weatherHtml(day) {
        const today = jstNow().iso;
        const w = Weather.forDay(day);
        const place = TRIP.places[day.place].label;
        if (w) {
            const stale = Date.now() - w.fetchedAt > 6 * 3600 * 1000 || !navigator.onLine;
            const fetched = new Date(w.fetchedAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
            return `
                <div class="weather">
                    <div class="weather-main">
                        <strong>${esc(w.text)}　${Math.round(w.min)}° 到 ${Math.round(w.max)}°C</strong>
                        <span>${esc(place)}，降雨 ${w.pop ?? '?'}%${w.snow > 0 ? `，降雪 ${Math.round(w.snow)} 公分` : ''}</span>
                        ${stale ? `<span class="weather-stale">這是 ${fetched} 的資料</span>` : ''}
                    </div>
                    <button class="link-btn" data-action="weather">更新</button>
                </div>`;
        }
        const opens = Weather.firstForecastDate(day.iso);
        const message = today < opens
            ? `${esc(place)}的預報 ${shortDate(opens)} 起才看得到`
            : (Weather.failed() ? '抓不到天氣，確認網路後再試' : `目前沒有${esc(place)}這天的預報`);
        return `
            <div class="weather weather-empty">
                <span>${message}</span>
                ${today >= opens && today <= TRIP.end ? '<button class="link-btn" data-action="weather">重新抓取</button>' : ''}
            </div>`;
    }

    function itemHtml(item) {
        const spot = SPOTS[item.spot];
        const isTransit = item.category === '交通' && !item.fixed && !spot;
        const task = item.task ? TRIP.tasks.find((t) => t.id === item.task) : null;
        const taskBadge = task ? (Store.isChecked(task.id)
            ? '<span class="badge done">已訂</span>'
            : '<span class="badge todo">待訂</span>') : '';
        const tags = (item.tags || []).map((t) => `<span class="badge">${esc(t)}</span>`).join('');
        const isNext = item.id === state.nextId;
        return `
            <li class="row ${isTransit ? 'row-transit' : ''} ${isNext ? 'row-next' : ''}">
                <button class="row-btn" data-action="detail" data-item="${esc(item.id)}">
                    <time class="row-time">${esc(item.time)}</time>
                    <span class="mark" aria-hidden="true">${esc(item.mark || MARKS[item.category] || '他')}</span>
                    <span class="row-body">
                        ${isNext ? '<span class="next-label">下一站</span>' : ''}
                        <span class="row-title">${esc(item.name)}${item.transit ? `<span class="row-transit-time">${esc(item.transit)}</span>` : ''}</span>
                        ${item.notes && !isTransit ? `<span class="row-notes">${esc(item.notes.split('\n')[0])}</span>` : ''}
                        ${taskBadge || tags ? `<span class="row-badges">${taskBadge}${tags}</span>` : ''}
                    </span>
                    ${spot ? `<img class="row-thumb" src="${esc(spot.photo)}" alt="" width="72" height="72" loading="lazy" decoding="async">` : ''}
                </button>
            </li>`;
    }

    function dayStepButton(target, label, path) {
        const attrs = target
            ? `data-action="day" data-day="${target.id}" aria-label="${label}：${esc(target.date)} ${esc(target.station)}"`
            : `disabled aria-label="${label}：沒有了"`;
        return `<button class="day-step-btn" ${attrs}><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg></button>`;
    }

    function renderPlan() {
        const days = Store.days();
        const index = days.findIndex((d) => d.id === state.dayId);
        const day = days[index];
        const [month, date] = day.date.split('/');
        state.nextId = nextItemId(day);

        main.innerHTML = `
            <div class="plan">
                <div class="plan-head">
                    <section class="hero">
                        <div class="hero-text">
                            <p class="hero-date">${month}月${date}日 週${day.dow}</p>
                            <p class="hero-roman">${esc(day.roman)}</p>
                            <p class="hero-theme">${esc(day.theme).split('，').join('，<br>')}${day.holiday ? `<span class="holiday">日本假日：${esc(day.holiday)}</span>` : ''}</p>
                        </div>
                        <div class="hero-title">
                            <h1 class="hero-name">${esc(day.station)}</h1>
                            <span class="hero-kana">${esc(day.kana)}</span>
                            <span class="seal">${NTH[index]}日目</span>
                        </div>
                    </section>
                    <div class="wave" aria-hidden="true"></div>
                    ${weatherHtml(day)}
                </div>
                <div class="plan-list">
                    ${day.items.length ? `<ol class="timeline">${day.items.map(itemHtml).join('')}</ol>`
                        : '<div class="empty"><p>這天還沒有行程</p><button class="btn solid" data-action="add">新增第一個行程</button></div>'}
                    <p class="stay">今晚住：${esc(day.stay)}</p>
                </div>
                <nav class="day-step" aria-label="切換前後天">
                    ${dayStepButton(days[index - 1], '前一天', 'M4 11l5-5 5 5')}
                    ${dayStepButton(days[index + 1], '後一天', 'M4 7l5 5 5-5')}
                </nav>
            </div>`;
    }

    function renderPrep() {
        const tasks = [...TRIP.tasks].sort((a, b) =>
            (Store.isChecked(a.id) - Store.isChecked(b.id)) || a.due.localeCompare(b.due));
        const done = TRIP.tasks.length - openTaskCount();
        main.innerHTML = `
            <div class="page">
                <h1>出發前準備</h1>
                <section>
                    <h2>要訂的東西<span class="count">${done} / ${TRIP.tasks.length}</span></h2>
                    <ul class="checks">${tasks.map((t) => `
                        <li class="check ${Store.isChecked(t.id) ? 'is-done' : ''}">
                            <label>
                                <input type="checkbox" data-action="check" data-task="${t.id}" ${Store.isChecked(t.id) ? 'checked' : ''}>
                                <span class="check-title">${esc(t.title)}</span>
                            </label>
                            <div class="check-more">
                                ${dueChip(t)}
                                <p>${esc(t.detail)}</p>
                                ${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(openLabel(t.urlLabel))}</a>` : ''}
                            </div>
                        </li>`).join('')}
                    </ul>
                </section>
                ${TRIP.packing.map((group, g) => `
                    <section>
                        <h2>打包：${esc(group.group)}</h2>
                        <ul class="checks compact">${group.items.map((name, i) => {
                            const id = `pack-${g}-${i}`;
                            return `<li class="check ${Store.isChecked(id) ? 'is-done' : ''}"><label><input type="checkbox" data-action="check" data-task="${id}" ${Store.isChecked(id) ? 'checked' : ''}><span class="check-title">${esc(name)}</span></label></li>`;
                        }).join('')}</ul>
                    </section>`).join('')}
            </div>`;
    }

    function renderInfo() {
        main.innerHTML = `
            <div class="page">
                <h1>旅程資訊</h1>
                <section>
                    <h2>航班</h2>
                    <div class="flight"><b>2/7（日）去程</b><span>台灣虎航，19:35 抵成田第 2 航廈</span></div>
                    <div class="flight"><b>2/13（六）回程</b><span>樂桃，16:35 成田第 1 航廈北翼起飛，20:00 抵桃園</span></div>
                    <p class="note">航廈查自 2026 年 10 月的指南，以機票上的資訊為準。</p>
                </section>
                <section>
                    <h2>緊急電話</h2>
                    <ul class="phones">
                        <li><a href="tel:110">報警 110</a></li>
                        <li><a href="tel:119">救護車、火警 119</a></li>
                        <li><a href="tel:0800085095">外交部旅外急難 0800-085-095</a></li>
                    </ul>
                    <p class="note">0800 這支是外交部公告的專線，從日本撥得通與否還沒確認，出發前請向外交部或代表處問清楚。<a href="https://www.boca.gov.tw/" target="_blank" rel="noopener">領事事務局</a></p>
                </section>
                <section>
                    <h2>帶回台灣</h2>
                    <ul class="plain">
                        <li><b>酒：</b>每人免稅 1.5 公升，滿 18 歲。威士忌要放託運行李。</li>
                        <li><b>肉：</b>含肉零食不能帶，最高罰 100 萬元。泡麵看成分，有肉塊的不行。</li>
                        <li><b>手提：</b>樂桃約 7 公斤、2 件含免稅品，以官網為準。</li>
                    </ul>
                </section>
                <section>
                    <h2>關於這份行程</h2>
                    <p class="note">時間都是建議值，訂好票後點開行程按「編輯」改成實際時間。票價與營業資訊查於 ${TRIP.checkedOn}。資料只存在這支手機，同行的人要各裝一份，勾選和編輯不會同步。</p>
                    <button class="btn danger-outline" id="reset-btn" data-action="reset">把行程重設成預設內容</button>
                </section>
            </div>`;
    }

    function render() {
        if (state.view === 'plan') {
            renderDayTabs();
            renderPlan();
        } else if (state.view === 'prep') {
            renderPrep();
        } else {
            renderInfo();
        }
        renderChrome();
    }

    function switchDay(id) {
        state.dayId = id;
        render();
        window.scrollTo({ top: 0 });
    }

    /* ---------- 詳情與表單 ---------- */

    function openSheet() {
        if (!sheet.open) sheet.showModal();
        sheetBody.scrollTop = 0;
    }

    function closeSheet() {
        if (sheet.open) sheet.close();
    }

    function showDetail(itemId) {
        const item = Store.findItem(state.dayId, itemId);
        if (!item) return;
        const task = item.task ? TRIP.tasks.find((t) => t.id === item.task) : null;
        const destination = encodeURIComponent(item.location || item.name);
        const spot = SPOTS[item.spot];
        sheetBody.innerHTML = `
            ${spot ? `
                <figure class="sheet-photo">
                    <img src="${esc(spot.photo)}" alt="${esc(spot.name)}" width="800" height="450">
                    <figcaption>${esc(spot.name)}${spot.sample ? '（示意照片）' : ''}<a href="${esc(spot.credit.url)}" target="_blank" rel="noopener">照片：${esc(spot.credit.author)}／${esc(spot.credit.license)}</a></figcaption>
                </figure>` : ''}
            <header class="sheet-head">
                <div>
                    <p class="sheet-time">${esc(item.time)}　${esc(item.category)}${item.transit ? `　${esc(item.transit)}` : ''}</p>
                    <h2>${esc(item.name)}</h2>
                </div>
                <button class="close" data-action="close" aria-label="關閉">×</button>
            </header>
            ${spot ? `<p class="sheet-intro">${esc(spot.intro)}</p>` : ''}
            ${item.notes ? `<p class="sheet-notes">${esc(item.notes)}</p>` : ''}
            ${task ? `
                <label class="sheet-task">
                    <input type="checkbox" data-action="check" data-task="${task.id}" ${Store.isChecked(task.id) ? 'checked' : ''}>
                    <span>${esc(task.title)}${!Store.isChecked(task.id) && task.hard ? `<small>${shortDate(task.due)} 截止</small>` : ''}</span>
                </label>
                ${task.url ? `<a class="btn" href="${esc(task.url)}" target="_blank" rel="noopener">${esc(openLabel(task.urlLabel))}</a>` : ''}` : ''}
            <a class="btn solid" href="https://www.google.com/maps/dir/?api=1&destination=${destination}" target="_blank" rel="noopener">用 Google Maps 導航</a>
            <div class="sheet-actions">
                <button class="btn" data-action="edit" data-item="${esc(item.id)}">編輯</button>
                <button class="btn danger-outline" data-action="delete" data-item="${esc(item.id)}">刪除</button>
            </div>`;
        openSheet();
    }

    function showForm(item = null) {
        const days = Store.days();
        sheetBody.innerHTML = `
            <header class="sheet-head">
                <h2>${item ? '編輯行程' : '新增行程'}</h2>
                <button class="close" data-action="close" aria-label="關閉">×</button>
            </header>
            <form id="item-form" novalidate data-item="${esc(item?.id ?? '')}">
                <div class="form-row">
                    <label>日期
                        <select name="day">${days.map((d) => `<option value="${d.id}" ${d.id === state.dayId ? 'selected' : ''}>${d.date} ${esc(d.station)}</option>`).join('')}</select>
                    </label>
                    <label>時間
                        <input type="time" name="time" value="${esc(item?.time ?? '')}" required>
                    </label>
                </div>
                <label>類別
                    <select name="category">${CATEGORIES.map((c) => `<option value="${c}" ${(item?.category ?? '飲食') === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
                </label>
                <label>名稱
                    <input type="text" name="name" value="${esc(item?.name ?? '')}" required>
                </label>
                <label>地圖搜尋關鍵字
                    <input type="text" name="location" value="${esc(item?.location ?? '')}" placeholder="留空就用名稱搜尋">
                </label>
                <label>照片與介紹
                    <select name="spot">
                        <option value="">不顯示</option>
                        ${Object.entries(SPOTS).map(([key, s]) => `<option value="${key}" ${item?.spot === key ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
                    </select>
                </label>
                <label>備註
                    <textarea name="notes" rows="4">${esc(item?.notes ?? '')}</textarea>
                </label>
                <p class="form-error" id="form-error" role="alert" hidden></p>
                <button class="btn solid" type="submit">${item ? '儲存變更' : '新增行程'}</button>
            </form>`;
        openSheet();
    }

    function submitForm(form) {
        const data = Object.fromEntries(new FormData(form).entries());
        const name = data.name.trim();
        const error = form.querySelector('#form-error');
        if (!data.time || !name) {
            error.textContent = !data.time ? '請填時間' : '請填名稱';
            error.hidden = false;
            return;
        }
        const payload = { time: data.time, category: data.category, name, location: data.location.trim(), notes: data.notes.trim(), spot: data.spot };
        const target = Number(data.day);
        const itemId = form.dataset.item;
        if (itemId) {
            Store.updateItem(state.dayId, itemId, payload, target);
            toast('已儲存變更');
        } else {
            Store.addItem(target, payload);
            toast('已新增行程');
        }
        closeSheet();
        state.dayId = target;
        render();
    }

    function deleteItem(itemId) {
        const dayId = state.dayId;
        const item = Store.removeItem(dayId, itemId);
        if (!item) return;
        closeSheet();
        render();
        toast(`已刪除「${item.name}」`, {
            label: '復原',
            run() {
                Store.restoreItem(dayId, item);
                render();
            },
        });
    }

    /* ---------- 提示 ---------- */

    let toastTimer = null;
    function toast(message, action = null) {
        const box = $('#toast');
        box.innerHTML = `<span>${esc(message)}</span>${action ? `<button>${esc(action.label)}</button>` : ''}`;
        box.hidden = false;
        if (action) {
            box.querySelector('button').addEventListener('click', () => {
                action.run();
                box.hidden = true;
            }, { once: true });
        }
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { box.hidden = true; }, action ? 7000 : 2800);
    }

    /* ---------- 事件 ---------- */

    let resetArmedUntil = 0;

    const actions = {
        day: (el) => switchDay(Number(el.dataset.day)),
        detail: (el) => showDetail(el.dataset.item),
        add: () => showForm(),
        edit: (el) => showForm(Store.findItem(state.dayId, el.dataset.item)),
        delete: (el) => deleteItem(el.dataset.item),
        close: closeSheet,
        async weather(el) {
            el.textContent = '更新中';
            el.disabled = true;
            const ok = await Weather.refresh(jstNow().iso, { force: true });
            if (!ok) toast(navigator.onLine ? '剛更新過，或暫時抓不到，等幾分鐘再試' : '目前離線，顯示上次的資料');
            render();
        },
        reset(el) {
            if (Date.now() > resetArmedUntil) {
                resetArmedUntil = Date.now() + 4000;
                el.textContent = '再按一次確認重設';
                return;
            }
            Store.resetItinerary();
            resetArmedUntil = 0;
            render();
            toast('已重設成預設行程');
        },
    };

    document.addEventListener('click', (event) => {
        const tab = event.target.closest('.tab');
        if (tab) {
            state.view = tab.dataset.view;
            render();
            window.scrollTo({ top: 0 });
            return;
        }
        if (event.target === sheet) {
            closeSheet();
            return;
        }
        const el = event.target.closest('[data-action]');
        if (el && el.dataset.action !== 'check') actions[el.dataset.action]?.(el);
    });

    document.addEventListener('change', (event) => {
        const el = event.target;
        if (el.dataset?.action !== 'check') return;
        Store.toggleCheck(el.dataset.task);
        if (sheet.open) {
            renderChrome();
            if (state.view === 'plan') renderPlan();
        } else {
            render();
        }
    });

    document.addEventListener('submit', (event) => {
        if (event.target.id !== 'item-form') return;
        event.preventDefault();
        submitForm(event.target);
    });

    // 照片載不到時直接拿掉，不留破圖示。error 事件不會冒泡，要用捕獲階段。
    document.addEventListener('error', (event) => {
        if (event.target.tagName === 'IMG') event.target.remove();
    }, true);

    $('#fab').addEventListener('click', () => showForm());

    window.addEventListener('online', async () => {
        toast('網路已恢復');
        if (await Weather.refresh(jstNow().iso)) render();
    });
    window.addEventListener('offline', () => toast('目前離線，行程仍可查看'));

    // 每分鐘檢查「下一站」，有變才重畫。
    setInterval(() => {
        if (state.view !== 'plan' || sheet.open) return;
        if (nextItemId(currentDay()) !== state.nextId) render();
    }, 60000);

    /* ---------- 啟動 ---------- */

    const todayDay = Store.days().find((d) => d.iso === jstNow().iso);
    if (todayDay) state.dayId = todayDay.id;
    render();

    Weather.refresh(jstNow().iso).then((changed) => {
        if (changed && !sheet.open) render();
    });
})();
