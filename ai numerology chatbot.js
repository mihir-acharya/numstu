(function(){
  // inject styles
  const css = `
  .ai-widget-btn{ position:fixed; right:18px; bottom:18px; z-index:9999;
    background:linear-gradient(90deg,#0757c8,#3b82f6); color:#fff; border:none;
    padding:12px 14px; border-radius:999px; box-shadow:0 8px 20px rgba(3,105,255,0.18); cursor:pointer; font-weight:700}
  .ai-panel{ position:fixed; right:18px; bottom:78px; width:360px; max-width:92vw; z-index:9999;
    background:#fff; border-radius:12px; box-shadow:0 20px 50px rgba(16,24,40,0.12); overflow:hidden; display:flex; flex-direction:column; }
  .ai-panel header{ padding:12px 14px; background:linear-gradient(90deg,#0757c8,#3b82f6); color:#fff; font-weight:700; display:flex; justify-content:space-between; align-items:center }
  .ai-panel .close{ cursor:pointer; opacity:.9 }
  .ai-panel .messages{ padding:12px; height:300px; overflow:auto; background:#fbfdff; display:flex; flex-direction:column; gap:8px }
  .ai-msg.user{ align-self:flex-end; background:linear-gradient(90deg,#eef5ff,#dbefff); padding:8px 10px; border-radius:10px; max-width:85% }
  .ai-msg.ai{ align-self:flex-start; background:#fff; padding:8px 10px; border-radius:10px; box-shadow:0 6px 18px rgba(12,20,40,0.04); max-width:85% }
  .ai-panel .composer{ padding:10px; display:flex; gap:8px; align-items:center }
  .ai-panel input{ flex:1; padding:10px 12px; border-radius:10px; border:1px solid #e6e9ef }
  .ai-panel button.send{ background:#0757c8; color:#fff; border:none; padding:8px 12px; border-radius:10px; cursor:pointer }
  .ai-chart{ padding:10px; border-top:1px solid #f1f5f9; display:flex; justify-content:center }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // create UI
  const btn = document.createElement('button');
  btn.className = 'ai-widget-btn';
  btn.title = 'Ask Numerology AI';
  btn.textContent = 'Ask AI';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'ai-panel';
  panel.style.display = 'none';
  panel.innerHTML = `
    <header><span>Numerology AI</span><span class="close">✕</span></header>
    <div class="messages" id="aiMessages"></div>
    <div class="ai-chart"><canvas id="aiChart" width="300" height="80"></canvas></div>
    <div class="composer">
      <input id="aiInput" placeholder="Ask something about numerology or vastu..." />
      <button class="send">Send</button>
    </div>
  `;
  document.body.appendChild(panel);

  const openPanel = ()=> panel.style.display = 'flex';
  const closePanel = ()=> panel.style.display = 'none';
  btn.addEventListener('click', openPanel);
  panel.querySelector('.close').addEventListener('click', closePanel);

  const msgsEl = panel.querySelector('#aiMessages');
  const inputEl = panel.querySelector('#aiInput');
  const sendBtn = panel.querySelector('button.send');

  let history = []; // {role:'user'|'ai', text:''}

  // load Chart.js dynamically
  function loadChart(next){
    if(window.Chart) return next();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    s.onload = next;
    document.head.appendChild(s);
  }

  let chart;
  function renderChart(){
    loadChart(()=>{
      const ctx = document.getElementById('aiChart').getContext('2d');
      const userCount = history.filter(h=>h.role==='user').length;
      const aiCount = history.filter(h=>h.role==='ai').length;
      const labels = ['You','AI'];
      const data = { labels, datasets:[{ label:'Messages', data:[userCount, aiCount], backgroundColor:['#0757c8','#3b82f6'] }] };
      if(chart) { chart.data = data; chart.update(); return; }
      chart = new Chart(ctx, { type:'bar', data, options:{ responsive:true, maintainAspectRatio:false, indexAxis:'y', plugins:{legend:{display:false}} } });
    });
  }

  function appendMessage(role, text){
    history.push({role,text});
    const el = document.createElement('div');
    el.className = 'ai-msg ' + (role==='user'?'user':'ai');
    el.textContent = text;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    renderChart();
  }

  async function sendMessage(){
    const txt = inputEl.value.trim();
    if(!txt) return;
    appendMessage('user', txt);
    inputEl.value = '';
    sendBtn.disabled = true;
    // show typing placeholder
    const loading = document.createElement('div');
    loading.className = 'ai-msg ai';
    loading.textContent = 'AI is typing...';
    msgsEl.appendChild(loading);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    try{
      const res = await fetch('/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message: txt })
      });
      const json = await res.json();
      const reply = (json.reply || json?.choices?.[0]?.message?.content) || 'No reply';
      loading.remove();
      appendMessage('ai', reply);
    }catch(err){
      loading.remove();
      appendMessage('ai', 'Error contacting server. Try again later.');
      console.error(err);
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e)=> { if(e.key==='Enter') sendMessage(); });

  // expose a function to prefill/contextualize chart with customer details
  window.aiNumerology = {
    open: openPanel,
    addContext: (customer) => {
      // customer = {name, mobile, location, service}
      const ctxMsg = `Customer: ${customer.name || '-'} | ${customer.mobile || '-'} | ${customer.location || '-'} | Service: ${customer.service || '-'}`;
      appendMessage('ai', 'Context added — ' + ctxMsg);
    }
  };
})();
