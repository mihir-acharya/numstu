const date = document.getElementById('date')?.value || '';
// make sure selectedService is defined in scope
const msg = `New Booking: ${selectedService} on ${date}`;
window.open(`https://wa.me/919114955131?text=${encodeURIComponent(msg)}`);
