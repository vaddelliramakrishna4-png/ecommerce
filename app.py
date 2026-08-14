import os
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "rk_bazaar_secret_key" # Flash messages work avvadaniki secret key mandatory

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
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
    },
    {
        "name": "HP Pavilion Gaming",
        "brand": "HP",
        "price": "65,000",
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"
    }
]

# Root URL open chesinappudu direct ga Login page ki velladaniki
@app.route("/")
def root():
    return render_template("login.html")

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if email and password:
            return redirect(url_for('home'))
            
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

# 3. Home Page route
@app.route("/home")
def home():
    return render_template("home.html", products=products_list)

# 🔥 SEARCH ROUTE (Redirects to Search Results Page) 🔥
@app.route("/search")
def search():
    query = request.args.get("q", "").lower().strip()
    
    # Static hardcoded deals/products + Admin dashboard nunchi add chesina products
    all_products = [
        {"name": "iPhone 16 Pro", "price": "1,19,999", "category": "Mobiles", "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"},
        {"name": "Samsung S25 Ultra", "price": "99,999", "category": "Mobiles", "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500"},
        {"name": "HP Pavilion Gaming", "price": "59,999", "category": "Laptops", "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"},
        {"name": "Boat Headphones", "price": "2,499", "category": "Electronics", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"},
        {"name": "MacBook Air M3", "price": "1,14,999", "category": "Laptops", "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"},
        {"name": "Sony Bravia 55 4K TV", "price": "54,999", "category": "Electronics", "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500"},
        {"name": "Nike Air Max 2026", "price": "7,999", "category": "Fashion", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"},
        {"name": "Apple Watch Series 9", "price": "39,999", "category": "Watches", "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500"},
        {"name": "PlayStation 5 Pro", "price": "49,999", "category": "Electronics", "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500"},
        {"name": "DJI Mini 4 Pro Drone", "price": "72,000", "category": "Electronics", "image": "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500"},
        {"name": "Sony Alpha ILCE-7M4", "price": "1,99,999", "category": "Electronics", "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"},
        {"name": "iPad Pro M4 (2026)", "price": "99,999", "category": "Laptops", "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"}
    ] + products_list

    # Match ayina products ni filter cheyyadam
    filtered_results = [p for p in all_products if query in p["name"].lower() or query in p.get("category", "").lower()]

    return render_template("search.html", query=query, products=filtered_results)

@app.route("/product")
def product():
    return render_template("product.html")

@app.route("/admin")
def admin():
    return render_template("admin_login.html")

@app.route("/admin/dashboard")
def admin_dashboard():
    return render_template("admin_dashboard.html")

# ADMIN PRODUCTS PAGE ROUTE
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
    app.run(host='0.0.0.0', port=5000, debug=True)