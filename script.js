let selectedService = "";

function bookService(service) {
    selectedService = service;
    alert("Selected: " + service);
}

function sendWhatsApp() {
    let name = document.getElementById("name").value;
    let date = document.getElementById("date").value;
    let message = document.getElementById("message").value;

    let phone = "919114955131"; // YOUR NUMBER

    let text = `Hello Numstu,%0A
Name: ${name}%0A
Service: ${selectedService}%0A
Date: ${date}%0A
Message: ${message}`;

    let url = `https://wa.me/${phone}?text=${text}`;

    window.open(url, "_blank");
}

function payNow() {
    fetch("/create-order", {method:"POST"})
    .then(res => res.json())
    .then(data => {
        var options = {
            key: "YOUR_KEY",
            amount: data.amount,
            currency: "INR",
            name: "Numstu",
            handler: function (response){
                alert("Payment Successful");
            }
        };
        var rzp = new Razorpay(options);
        rzp.open();
    });
}