function book() {
    let date = document.getElementById("date").value;

    fetch("/book", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({date: date, service: selectedService})
    });

    alert("Booking Confirmed!");
}