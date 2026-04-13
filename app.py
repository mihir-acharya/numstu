from flask import Flask, request, jsonify
import razorpay
from openai import OpenAI
import os
from twilio.rest import Client as TwilioClient

app = Flask(__name__)

# Razorpay setup
razorpay_client = razorpay.Client(auth=("YOUR_KEY", "YOUR_SECRET"))

# OpenAI
client = OpenAI(api_key="YOUR_OPENAI_KEY")

# ------------------------
# 📅 Booking API
# ------------------------
@app.route("/book", methods=["POST"])
def book():
    data = request.json

    # send WhatsApp notification if Twilio creds present
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM")  # e.g. "whatsapp:+14155238886"
    # default to your business WhatsApp if not provided
    whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO", "whatsapp:+919114955131")

    sent = False
    error_msg = None
    if sid and token and whatsapp_from and whatsapp_to:
        try:
            tw_client = TwilioClient(sid, token)
            body = f"नई बुकिंग: सेवा: {data.get('service')} | तारीख: {data.get('date')}\nName: {data.get('name', 'N/A')}"
            msg = tw_client.messages.create(
                from_=whatsapp_from,
                to=whatsapp_to,
                body=body
            )
            sent = True if msg.sid else False
        except Exception as e:
            error_msg = str(e)

    response = {"status": "बुकिंग सफल", "data": data, "whatsapp_sent": sent}
    if error_msg:
        response["whatsapp_error"] = error_msg

    return jsonify(response)

# ------------------------
# 💳 Payment API
# ------------------------
@app.route("/create-order", methods=["POST"])
def create_order():
    order = razorpay_client.order.create({
        "amount": 300,
        "currency": "INR"
    })
    return jsonify(order)

# ------------------------
# 🤖 AI Chatbot
# ------------------------
@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json["message"]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": "You are a numerology expert"
        },{
            "role": "user",
            "content": user_msg
        }]
    )

    return {"reply": response.choices[0].message.content}

if __name__ == "__main__":
    app.run(debug=True)
