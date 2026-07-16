from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def login():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/product")
def product():
    return render_template("product.html")

@app.route("/admin")
def admin():
    return render_template("admin_login.html")


@app.route("/admin/dashboard")
def admin_dashboard():
    return render_template("admin_dashboard.html")


@app.route("/admin/add-product")
def add_product():
    return render_template("add_product.html")

if __name__ == "__main__":
    app.run(debug=True)