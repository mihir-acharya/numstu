from flask import Flask, request, jsonify
import razorpay
from openai import OpenAI

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
    return {"status": "बुकिंग सफल", "data": data}

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