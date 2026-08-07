from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login/ar")
def login_ar():
    return render_template("login_ar.html")

@app.route("/login/tr")
def login_tr():
    return render_template("login_tr.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/room")
def room():
    return render_template("room.html")
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
