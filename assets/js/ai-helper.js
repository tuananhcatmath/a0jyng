// ============================================================
// ai-helper.js — AI Text Selection Helper
// Bôi đen/xanh bất kỳ đoạn văn → AI giải thích ngay
// Import vào mọi trang: <script type="module" src="assets/js/ai-helper.js"></script>
// ============================================================
import { GEMINI_API_KEY, GEMINI_MODE, GEMINI_MODEL } from './supabase-config.js';

const TOOLTIP_ID = 'ai-selection-tooltip';

// ── Inject styles ────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
#${TOOLTIP_ID} {
  position: fixed;
  z-index: 99999;
  background: #1E40AF;
  color: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  max-width: 360px;
  min-width: 200px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  display: none;
  overflow: hidden;
  animation: aiFadeIn 0.2s ease;
}
@keyframes aiFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
#${TOOLTIP_ID} .ai-tip-header {
  background: #1E40AF;
  padding: 10px 14px 8px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}
#${TOOLTIP_ID} .ai-tip-header span { font-weight:700; font-size:12px; letter-spacing:0.5px; }
#${TOOLTIP_ID} .ai-tip-close { cursor:pointer; opacity:0.7; font-size:16px; line-height:1; }
#${TOOLTIP_ID} .ai-tip-close:hover { opacity:1; }
#${TOOLTIP_ID} .ai-tip-actions {
  display: flex; gap: 6px; padding: 8px 10px;
  background: rgba(255,255,255,0.08);
  flex-wrap: wrap;
}
#${TOOLTIP_ID} .ai-tip-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: white; border-radius: 20px;
  padding: 4px 12px; font-size: 11px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap;
}
#${TOOLTIP_ID} .ai-tip-btn:hover { background: rgba(255,255,255,0.3); }
#${TOOLTIP_ID} .ai-tip-btn.accent { background: #F97316; border-color: #F97316; }
#${TOOLTIP_ID} .ai-tip-result {
  background: white; color: #1e293b;
  padding: 12px 14px; max-height: 220px;
  overflow-y: auto; line-height: 1.6; font-size: 13px;
  display: none;
}
#${TOOLTIP_ID} .ai-tip-loading {
  background: white; color: #64748b;
  padding: 12px 14px; text-align: center;
  display: none;
}
#${TOOLTIP_ID} .ai-tip-loading span { display: inline-block; animation: pulse 1s ease infinite; }
@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
`;
document.head.appendChild(style);

// ── Create tooltip element ───────────────────────────────────
const tooltip = document.createElement('div');
tooltip.id = TOOLTIP_ID;
tooltip.innerHTML = `
  <div class="ai-tip-header">
    <span>🤖 AI a0jyng</span>
    <span class="ai-tip-close" onclick="document.getElementById('${TOOLTIP_ID}').style.display='none'">×</span>
  </div>
  <div class="ai-tip-actions" id="ai-tip-actions">
    <button class="ai-tip-btn accent" onclick="aiAsk('explain')">💡 Giải thích</button>
    <button class="ai-tip-btn" onclick="aiAsk('example')">📌 Ví dụ</button>
    <button class="ai-tip-btn" onclick="aiAsk('simplify')">🔤 Đơn giản hóa</button>
    <button class="ai-tip-btn" onclick="aiAsk('translate')">🌐 Dịch</button>
  </div>
  <div class="ai-tip-loading" id="ai-tip-loading"><span>🤖 AI đang suy nghĩ...</span></div>
  <div class="ai-tip-result" id="ai-tip-result"></div>
`;
document.body.appendChild(tooltip);

// ── Track selected text ──────────────────────────────────────
let _selectedText = '';

document.addEventListener('mouseup', (e) => {
  const sel  = window.getSelection();
  const text = sel?.toString().trim();

  if (!text || text.length < 3) {
    // Don't hide if clicking inside tooltip
    if (!tooltip.contains(e.target)) {
      tooltip.style.display = 'none';
    }
    return;
  }
  if (tooltip.contains(e.target)) return;

  _selectedText = text.slice(0, 600); // max 600 chars

  // Reset result area
  document.getElementById('ai-tip-result').style.display  = 'none';
  document.getElementById('ai-tip-loading').style.display = 'none';
  document.getElementById('ai-tip-actions').style.display = 'flex';

  // Position tooltip
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  const tX   = Math.min(rect.left + window.scrollX, window.innerWidth - 380);
  const tY   = rect.top + window.scrollY - 10;

  tooltip.style.display = 'block';
  tooltip.style.left    = Math.max(8, tX) + 'px';
  tooltip.style.top     = (tY - tooltip.offsetHeight - 8) + 'px';

  // Re-position if goes off top
  if (tY - tooltip.offsetHeight < window.scrollY) {
    tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
  }
});

// Close on scroll
window.addEventListener('scroll', () => { tooltip.style.display = 'none'; }, { passive: true });

// ── AI Ask ───────────────────────────────────────────────────
const PROMPTS = {
  explain:  (t) => `Giải thích ngắn gọn bằng tiếng Việt (3-5 câu) đoạn văn sau dành cho học sinh THPT:\n"${t}"`,
  example:  (t) => `Cho 2-3 ví dụ thực tế ngắn gọn liên quan đến:\n"${t}"\nViết bằng tiếng Việt.`,
  simplify: (t) => `Diễn đạt lại đoạn sau bằng ngôn ngữ đơn giản hơn cho học sinh hiểu:\n"${t}"`,
  translate:(t) => `Dịch đoạn sau sang tiếng Anh học thuật, giữ nguyên nghĩa:\n"${t}"`,
};

window.aiAsk = async function(type) {
  if (!_selectedText) return;

  document.getElementById('ai-tip-actions').style.display = 'none';
  document.getElementById('ai-tip-result').style.display  = 'none';
  document.getElementById('ai-tip-loading').style.display = 'block';

  const resultEl = document.getElementById('ai-tip-result');

  try {
    let answer = '';

    if (GEMINI_MODE) {
      // ── Real Gemini API ──
      const prompt = PROMPTS[type](_selectedText);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 400 } })
        }
      );
      const data = await res.json();
      answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi.';
    } else {
      // ── Demo fallback ──
      await new Promise(r => setTimeout(r, 800));
      const demos = {
        explain:  `📘 **Giải thích:** "${_selectedText.slice(0,50)}..." là một khái niệm quan trọng trong chương trình THPT. Để hiểu rõ hơn, bạn có thể xem lại lý thuyết trong bài học tương ứng. (Demo — cần Gemini API key để dùng AI thật)`,
        example:  `📌 **Ví dụ thực tế:**\n1. Ứng dụng trong đời sống...\n2. Bài toán điển hình...\n(Demo — cần Gemini API key)`,
        simplify: `🔤 **Đơn giản hóa:** ${_selectedText.slice(0,60)}... Hiểu đơn giản là: đây là khái niệm mô tả mối quan hệ giữa các đại lượng. (Demo)`,
        translate:`🌐 **English:** "${_selectedText.slice(0,60)}..." This is a key concept in Vietnamese high school curriculum. (Demo)`,
      };
      answer = demos[type] || 'Demo response';
    }

    document.getElementById('ai-tip-loading').style.display = 'none';
    resultEl.innerHTML = answer.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    resultEl.style.display = 'block';

    // Add "Ask more" button
    resultEl.innerHTML += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0">
      <button onclick="document.getElementById('ai-tip-actions').style.display='flex';document.getElementById('ai-tip-result').style.display='none'"
        style="font-size:11px;color:#3B82F6;background:none;border:none;cursor:pointer">← Hỏi thêm</button>
      <button onclick="document.getElementById('${TOOLTIP_ID}').style.display='none'"
        style="float:right;font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer">Đóng</button>
    </div>`;

  } catch (err) {
    document.getElementById('ai-tip-loading').style.display = 'none';
    resultEl.innerHTML = `<span style="color:#ef4444">⚠️ Lỗi: ${err.message || 'Không kết nối được AI'}</span>`;
    resultEl.style.display = 'block';
  }
};
