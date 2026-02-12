// js/calendar.js
import { db, collection, getDocs, setDoc, deleteDoc, doc } from "./firebase.js";

const holidays = { "2026-1-1":"元日","2026-1-13":"成人の日", /* ...省略... */ "2026-11-23":"勤労感謝の日" };
let current = new Date(), selectedDate = null, memoCache = {}, selectedWeekdays = [];

const daysEl = document.getElementById("days");
const title = document.getElementById("cal-title");
const memoText = document.getElementById("memo-text");
const memoDate = document.getElementById("memo-date");
const statusMsg = document.getElementById("status-msg");

// ステータス表示
function showStatus(text) { 
    statusMsg.textContent = text; 
    setTimeout(() => statusMsg.textContent = "", 2000); 
}

// 曜日選択
document.querySelectorAll("#weekdays div").forEach(d => { 
    d.onclick = () => { 
        const w = parseInt(d.dataset.dow); 
        if (selectedWeekdays.includes(w)) { 
            selectedWeekdays = selectedWeekdays.filter(x => x !== w); 
            d.classList.remove("selected-week"); 
        } else { 
            selectedWeekdays.push(w); 
            d.classList.add("selected-week"); 
        } 
    }; 
});

// メモ読み込みとカレンダー描画
export async function loadMemos() { 
    memoCache = {}; 
    const snap = await getDocs(collection(db, "memos")); 
    snap.forEach(d => memoCache[d.id] = d.data()); 
    renderCalendar();
    updateTopTodayMemo(); // 今日のメモバー更新
}

function renderCalendar() {
    daysEl.innerHTML = ""; 
    const y = current.getFullYear(), m = current.getMonth(); 
    title.textContent = `${y}年 ${m+1}月`; 
    
    const first = new Date(y, m, 1).getDay();
    const last = new Date(y, m + 1, 0).getDate();
    const today = new Date(); 

    for (let i = 0; i < first; i++) daysEl.appendChild(document.createElement("div")); 
    
    for (let d = 1; d <= last; d++) { 
        const el = document.createElement("div"); 
        el.textContent = d; 
        const key = `${y}-${m+1}-${d}`;
        const dow = new Date(y, m, d).getDay(); 

        if (dow === 0) el.classList.add("sunday"); 
        if (dow === 6) el.classList.add("saturday"); 
        if (holidays[key]) { 
            el.classList.add("holiday"); 
            el.innerHTML +=`<div class="holiday-label">${holidays[key]}</div>`; 
        } 
        if (memoCache[key] && memoCache[key].important) el.classList.add("memo-day-important"); 
        if (d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) el.classList.add("today"); 
        
        el.onclick = () => { 
            document.querySelectorAll(".days div").forEach(e => e.classList.remove("selected")); 
            el.classList.add("selected"); 
            selectedDate = key; 
            memoDate.textContent = key; 
            memoText.value = memoCache[key] ? memoCache[key].text : ""; 
        }; 
        daysEl.appendChild(el); 
    } 
}

// 今日のメモバー更新ロジック
function updateTopTodayMemo() {
    const headerEl = document.getElementById("today-memo-top-header");
    if (!headerEl) return;
    const textEl = headerEl.querySelector(".today-bar-text");
    const btn = headerEl.querySelector(".today-more-btn");
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    
    const memoData = memoCache[key];
    const rawText = memoData?.text || "";

    if (!rawText.trim()) {
        headerEl.style.display = "none";
        return;
    }
    const lines = rawText.split("\n");
    textEl.textContent = lines[0];
    headerEl.classList.remove("open");

    if (lines.length > 1) {
        btn.style.display = "inline-block";
        btn.textContent = "もっと見る";
        btn.onclick = (e) => {
            e.preventDefault();
            const isOpen = headerEl.classList.toggle("open");
            textEl.textContent = isOpen ? rawText : lines[0];
            btn.textContent = isOpen ? "元に戻す" : "もっと見る";
        };
    } else {
        btn.style.display = "none";
    }
    headerEl.style.display = "flex";
}

// イベントリスナー設定
document.getElementById("save-btn").onclick = () => handleSave(false);
document.getElementById("important-btn").onclick = () => handleSave(true);
document.getElementById("delete-btn").onclick = async () => {
    if(!selectedDate) return;
    await deleteDoc(doc(db,"memos",selectedDate));
    await loadMemos();
    showStatus("削除しました");
};
document.getElementById("prev").onclick = () => { current.setMonth(current.getMonth()-1); loadMemos(); };
document.getElementById("next").onclick = () => { current.setMonth(current.getMonth()+1); loadMemos(); };

async function handleSave(isImportant) {
    if(!selectedDate || !memoText.value.trim()) return;
    const text = memoText.value.trim();
    const [y,m] = selectedDate.split("-").map(Number);
    const repeat = document.getElementById("repeat-checkbox").checked;
    const data = { text, important: isImportant };

    if(!repeat || selectedWeekdays.length===0){
        await setDoc(doc(db,"memos",selectedDate), data);
    } else {
        for(let mo=m-1; mo<m+2; mo++){
            const yy = y + Math.floor(mo/12);
            const mm = (mo+12)%12;
            const last = new Date(yy, mm+1, 0).getDate();
            for(let d=1; d<=last; d++) {
                if(selectedWeekdays.includes(new Date(yy,mm,d).getDay())) {
                    await setDoc(doc(db,"memos",`${yy}-${mm+1}-${d}`), data);
                }
            }
        }
    }
    await loadMemos();
    showStatus(isImportant ? "大事に保存しました" : "保存しました");
}
