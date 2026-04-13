let selectedService = null;

function selectService(service) {
    selectedService = service;
    document.querySelectorAll('.card').forEach(card => {
        card.classList.toggle('selected', card.textContent.includes(service));
    });
    // optional visual feedback
    let sel = document.getElementById('selectedService');
    if (!sel) {
        sel = document.createElement('div');
        sel.id = 'selectedService';
        sel.style.margin = '8px 0';
        const bookingEl = document.querySelector('.booking');
        bookingEl.insertBefore(sel, bookingEl.firstChild);
    }
    sel.textContent = 'Selected: ' + service;
}

async function book(){
  // clear previous styles/messages
  const msgEl = document.getElementById('bookingMsg');
  msgEl.style.color = '';
  msgEl.textContent = '';
  const fields = [
    { id: 'custName', label: 'Name' },
    { id: 'custMobile', label: 'Mobile' },
    { id: 'custLocation', label: 'Location' },
    { id: 'date', label: 'Date' }
  ];

  // remove previous error styles
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if(el) el.style.borderColor = '';
  });

  // validate
  for(const f of fields){
    const el = document.getElementById(f.id);
    if(!el) continue;
    const val = el.value.trim();
    if(!val){
      el.style.borderColor = '#dc2626';
      el.focus();
      msgEl.style.color = '#dc2626';
      msgEl.textContent = `Please enter ${f.label}. All fields are mandatory.`;
      return;
    }
    // extra mobile pattern check
    if(f.id === 'custMobile'){
      const re = /^\+?\d{10,15}$/;
      if(!re.test(val)){
        el.style.borderColor = '#dc2626';
        el.focus();
        msgEl.style.color = '#dc2626';
        msgEl.textContent = 'Please enter a valid mobile number (digits, optional +, 10–15 chars).';
        return;
      }
    }
  }

  if(!selectedService){
    msgEl.style.color = '#dc2626';
    msgEl.textContent = 'Please select a service before booking.';
    return;
  }

  // collect values
  const payload = {
    service: selectedService,
    name: document.getElementById('custName').value.trim(),
    mobile: document.getElementById('custMobile').value.trim(),
    location: document.getElementById('custLocation').value.trim(),
    date: document.getElementById('date').value
  };

  try{
    const res = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if(json.whatsapp_sent){
      msgEl.style.color = '#16a34a';
      msgEl.textContent = `Booked "${selectedService}" for ${payload.date}. WhatsApp notification sent.`;
    } else {
      msgEl.style.color = '#f59e0b';
      msgEl.textContent = `Booked "${selectedService}" for ${payload.date}. WhatsApp not sent: ${json.whatsapp_error || 'server not configured'}.`;
    }

    // reset UI
    selectedService = null;
    document.getElementById('custName').value = '';
    document.getElementById('custMobile').value = '';
    document.getElementById('custLocation').value = '';
    document.getElementById('date').value = '';
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    document.getElementById('selectedService')?.remove();

  }catch(err){
    console.error(err);
    msgEl.style.color = '#dc2626';
    msgEl.textContent = 'Booking failed (server unreachable). Opening WhatsApp as fallback — you must send the message manually.';
    const msg = `New Booking: ${selectedService} on ${payload.date}\nName: ${payload.name}\nMobile: ${payload.mobile}\nLocation: ${payload.location}`;
    window.open(`https://wa.me/919114955131?text=${encodeURIComponent(msg)}`);
  }
}

function chat() {
    const input = document.getElementById('chatInput');
    const box = document.getElementById('chatBox');
    if (!input.value.trim()) return;
    const userMsg = document.createElement('div');
    userMsg.textContent = 'You: ' + input.value;
    box.appendChild(userMsg);

    const reply = document.createElement('div');
    reply.textContent = 'AI: (demo) I can help with basic numerology questions.';
    box.appendChild(reply);
    input.value = '';
}
