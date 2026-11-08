// localStorage 資料層。網址和福岡版共用網域時也不會互相覆蓋（鍵名、快取名都有 tokyo- 前綴）。
const Store = (() => {
    const KEY = 'tokyo-trip-v1';
    const CHECKS_KEY = 'tokyo-trip-checks-v1';
    const memory = {};

    const read = (key) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : (memory[key] ?? null);
        } catch (e) {
            return memory[key] ?? null;
        }
    };
    const write = (key, value) => {
        memory[key] = value;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    };

    const sortItems = (day) => day.items.sort((a, b) => a.time.localeCompare(b.time));
    const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    function seedDays() {
        return TRIP.days.map((day) => ({
            ...day,
            items: day.items.map((item, i) => ({ id: `d${day.id}-${i}`, ...item })),
        }));
    }

    function isValid(doc) {
        return doc && Array.isArray(doc.days) && doc.days.length === TRIP.days.length
            && doc.days.every((d) => Array.isArray(d.items));
    }

    let doc = read(KEY);
    if (!isValid(doc) || (doc.seedVersion < TRIP.seedVersion && !doc.edited)) {
        doc = { seedVersion: TRIP.seedVersion, edited: false, days: seedDays() };
        write(KEY, doc);
    }

    let checks = read(CHECKS_KEY) || {};
    const findDay = (id) => doc.days.find((d) => d.id === id);

    function commit() {
        doc.edited = true;
        return write(KEY, doc);
    }

    return {
        days: () => doc.days,
        day: findDay,

        findItem(dayId, itemId) {
            return findDay(dayId)?.items.find((i) => i.id === itemId) ?? null;
        },

        addItem(dayId, data) {
            const item = { id: newId(), ...data };
            const day = findDay(dayId);
            day.items.push(item);
            sortItems(day);
            commit();
            return item;
        },

        updateItem(dayId, itemId, data, targetDayId = dayId) {
            const day = findDay(dayId);
            const index = day.items.findIndex((i) => i.id === itemId);
            if (index === -1) return null;
            const item = { ...day.items[index], ...data };
            if (targetDayId === dayId) {
                day.items[index] = item;
            } else {
                day.items.splice(index, 1);
                findDay(targetDayId).items.push(item);
                sortItems(findDay(targetDayId));
            }
            sortItems(day);
            commit();
            return item;
        },

        removeItem(dayId, itemId) {
            const day = findDay(dayId);
            const index = day.items.findIndex((i) => i.id === itemId);
            if (index === -1) return null;
            const [item] = day.items.splice(index, 1);
            commit();
            return item;
        },

        restoreItem(dayId, item) {
            const day = findDay(dayId);
            day.items.push(item);
            sortItems(day);
            commit();
        },

        resetItinerary() {
            doc = { seedVersion: TRIP.seedVersion, edited: false, days: seedDays() };
            write(KEY, doc);
        },

        isChecked: (id) => Boolean(checks[id]),

        toggleCheck(id) {
            if (checks[id]) delete checks[id];
            else checks[id] = true;
            write(CHECKS_KEY, checks);
            return Boolean(checks[id]);
        },
    };
})();
