let selectedService = "";

function bookService(service) {
    selectedService = service;
    alert("Service Selected: " + service);
}

function sendWhatsApp() {
    let name = document.getElementById("name").value;
    let date = document.getElementById("date").value;

    if (!selectedService) {
        alert("Please select a service first!");
        return;
    }

    let phone = "919114955131";

    let text = `Hello Numstu,%0AName: ${name}%0AService: ${selectedService}%0ADate: ${date}`;

    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
}
