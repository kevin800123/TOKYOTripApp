// Open-Meteo 預報，每天依當天去的地方顯示，雪場多一項降雪量。
const Weather = (() => {
    const CACHE_KEY = 'tokyo-trip-weather-v1';
    const NOW_KEY = 'tokyo-trip-weather-now-v1';
    const NOW_STALE_MS = 30 * 60 * 1000;
    const FORECAST_DAYS = 16;
    const STALE_MS = 3 * 60 * 60 * 1000;
    const COOLDOWN_MS = 5 * 60 * 1000;

    const CODES = {
        0: '晴朗', 1: '晴時多雲', 2: '多雲', 3: '陰天',
        45: '霧', 48: '霧',
        51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨', 56: '凍雨', 57: '凍雨',
        61: '小雨', 63: '雨', 65: '大雨', 66: '凍雨', 67: '凍雨',
        71: '小雪', 73: '雪', 75: '大雪', 77: '細雪',
        80: '陣雨', 81: '陣雨', 82: '強陣雨',
        85: '陣雪', 86: '強陣雪',
        95: '雷雨', 96: '雷雨', 99: '雷雨',
    };

    let cache = null;
    try {
        cache = JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (e) {
        cache = null;
    }
    let lastAttempt = 0;
    let lastFailed = false;
    let now = null;
    try {
        now = JSON.parse(localStorage.getItem(NOW_KEY));
    } catch (e) {
        now = null;
    }
    let nowAttempt = 0;

    // 現在的天氣，出發前也看得到。30 分鐘內抓過就不再抓。
    async function refreshNow() {
        const t = Date.now();
        if (!navigator.onLine || t - nowAttempt < 5 * 60 * 1000) return false;
        if (now && t - now.fetchedAt < NOW_STALE_MS) return false;
        nowAttempt = t;
        const keys = Object.keys(TRIP.places);
        const params = new URLSearchParams({
            latitude: keys.map((k) => TRIP.places[k].lat).join(','),
            longitude: keys.map((k) => TRIP.places[k].lon).join(','),
            current: 'temperature_2m,weather_code,snow_depth',
            timezone: 'Asia/Tokyo',
        });
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const list = Array.isArray(json) ? json : [json];
            const places = {};
            keys.forEach((key, i) => {
                const c = list[i].current;
                places[key] = { temp: c.temperature_2m, code: c.weather_code, depth: c.snow_depth };
            });
            now = { fetchedAt: t, places };
            try {
                localStorage.setItem(NOW_KEY, JSON.stringify(now));
            } catch (e) { /* 寫不進去就只留在記憶體 */ }
            return true;
        } catch (e) {
            return false;
        }
    }

    // 超過 3 小時的「現在」就不顯示，免得誤導。
    function current(place) {
        const c = now?.places?.[place];
        if (!c || Date.now() - now.fetchedAt > 3 * 3600 * 1000 || typeof c.temp !== 'number') return null;
        return { ...c, text: CODES[c.code] || '陰天', fetchedAt: now.fetchedAt };
    }

    const addDays = (iso, n) => {
        const date = new Date(`${iso}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + n);
        return date.toISOString().slice(0, 10);
    };

    // 今天還看不到行程內任何一天，或行程已結束時就不打 API。
    const firstForecastDate = (iso) => addDays(iso, -(FORECAST_DAYS - 1));
    const tripInWindow = (today) => today >= firstForecastDate(TRIP.start) && today <= TRIP.end;

    async function refresh(today, { force = false } = {}) {
        if (!tripInWindow(today)) return false;
        const now = Date.now();
        if (now - lastAttempt < COOLDOWN_MS) return false;
        if (!force && cache && now - cache.fetchedAt < STALE_MS) return false;
        if (!navigator.onLine) return false;
        lastAttempt = now;

        const keys = Object.keys(TRIP.places);
        const params = new URLSearchParams({
            latitude: keys.map((k) => TRIP.places[k].lat).join(','),
            longitude: keys.map((k) => TRIP.places[k].lon).join(','),
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,snowfall_sum',
            timezone: 'Asia/Tokyo',
            forecast_days: String(FORECAST_DAYS),
        });

        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const list = Array.isArray(json) ? json : [json];
            const places = {};
            keys.forEach((key, i) => {
                const d = list[i].daily;
                places[key] = {};
                d.time.forEach((date, j) => {
                    places[key][date] = {
                        code: d.weather_code[j],
                        max: d.temperature_2m_max[j],
                        min: d.temperature_2m_min[j],
                        pop: d.precipitation_probability_max[j],
                        snow: d.snowfall_sum[j],
                    };
                });
            });
            cache = { fetchedAt: now, places };
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            } catch (e) { /* 寫不進去就只留在記憶體 */ }
            lastFailed = false;
            return true;
        } catch (e) {
            lastFailed = true;
            return false;
        }
    }

    function forDay(day) {
        const data = cache?.places?.[day.place]?.[day.iso];
        if (!data) return null;
        const text = CODES[data.code] || '陰天';
        return { ...data, text, fetchedAt: cache.fetchedAt };
    }

    return { refresh, refreshNow, current, forDay, firstForecastDate, failed: () => lastFailed };
})();
