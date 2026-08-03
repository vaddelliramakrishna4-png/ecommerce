import os
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# 1. Images save avvadaniki folder configuration
UPLOAD_FOLDER = 'static/images/products'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Folder lekapothe automatic ga create chestundi
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 2. Temporary Database (Memory List)
products_list = [
    {
        "name": "iPhone 16 Pro",
        "brand": "Apple",
        "price": "1,19,999",
        "category": "Mobiles",
        "image": "https://via.placeholder.com/200"
    },
    {
        "name": "HP Pavilion Gaming",
        "brand": "HP",
        "price": "65,000",
        "category": "Laptops",
        "image": "https://via.placeholder.com/200"
    }
]

# 🔥 FIX: Root URL open chesinappudu direct ga Login page ki velladaniki 🔥
@app.route("/")
def root():
    return render_template("login.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

# 3. Home Page route
@app.route("/home")
def home():
    return render_template("home.html", products=products_list)

@app.route("/product")
def product():
    return render_template("product.html")

@app.route("/admin")
def admin():
    return render_template("admin_login.html")

@app.route("/admin/dashboard")
def admin_dashboard():
    return render_template("admin_dashboard.html")

# 🔥 ADMIN PRODUCTS PAGE ROUTE 🔥
@app.route("/admin/products")
def admin_products():
    return render_template("admin_products.html", products_list=products_list, active="products")

# Delete Product Route
@app.route("/admin/delete-product/<string:product_name>")
def delete_product(product_name):
    global products_list
    products_list = [p for p in products_list if p["name"] != product_name]
    return redirect(url_for("admin_products"))

# SINGLE DYNAMIC ADMIN ROUTE
@app.route("/admin/<page_name>")
def admin_sub_pages(page_name):
    formatted_title = page_name.replace("-", " ").title()
    return render_template("admin_sub.html", title=formatted_title)

# Add Product GET & POST handling
@app.route("/add-product", methods=["GET", "POST"])
def add_product():
    if request.method == "POST":
        name = request.form.get("product_name")
        brand = request.form.get("brand")
        price = request.form.get("price")
        stock = request.form.get("stock")
        category = request.form.get("category")
        description = request.form.get("description")
        
        if category == "Other":
            category = request.form.get("manual_category")

        image_file = request.files.get("product_image")
        if image_file and image_file.filename != '':
            image_name = image_file.filename
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_name)
            image_file.save(image_path)
            final_image_url = url_for('static', filename='images/products/' + image_name)
        else:
            final_image_url = "https://via.placeholder.com/200"

        new_prod = {
            "name": name,
            "brand": brand,
            "price": price,
            "stock": stock,
            "category": category,
            "description": description,
            "image": final_image_url
        }
        products_list.append(new_prod)

        return redirect(url_for("home"))

    return render_template("add_product.html")

# Cart Page Route
@app.route("/cart")
def cart():
    return render_template("cart.html")

# Wishlist Page Route
@app.route("/wishlist")
def wishlist():
    return render_template("wishlist.html")

if __name__ == "__main__":
    app.run(debug=True)