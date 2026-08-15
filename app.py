# type: ignore
import os
import random
import time
import json
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "rk_bazaar_secret_key" # Flash messages work avvadaniki secret key mandatory

# 1. Database & Folder configuration
UPLOAD_FOLDER = 'static/images/products'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///store.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Folder lekapothe automatic ga create chestundi
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db = SQLAlchemy(app)

# ================= DATABASE MODELS =================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, index=True, nullable=False)
    name = db.Column(db.String(100), nullable=True)
    logged_in = db.Column(db.Boolean, default=False)
    join_date = db.Column(db.String(100), default=lambda: time.strftime("%Y-%m-%d %H:%M:%S"))

class Product(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(100))
    price = db.Column(db.String(50))
    original_price = db.Column(db.String(50))
    category = db.Column(db.String(100))
    image = db.Column(db.String(500))
    _images = db.Column('images', db.Text)  # stored as JSON list
    rating = db.Column(db.Float, default=4.5)
    rating_count = db.Column(db.Integer, default=0)
    badge = db.Column(db.String(50))
    display_section = db.Column(db.String(50))
    stock = db.Column(db.Integer, default=50)
    description = db.Column(db.Text)

    @property
    def images(self):
        try:
            return json.loads(self._images) if self._images else []
        except Exception:
            return []

    @images.setter
    def images(self, value):
        self._images = json.dumps(value)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, index=True, nullable=False)
    user_phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    total_amount = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="Pending")
    date = db.Column(db.String(100))
    _items = db.Column('items', db.Text)  # stored as JSON list

    @property
    def items(self):
        try:
            return json.loads(self._items) if self._items else []
        except Exception:
            return []

    @items.setter
    def items(self, value):
        self._items = json.dumps(value)

# ================= INITIAL PRODUCT LIST SEED DATA =================
initial_products_list = [
    {
        "id": "iphone-16-pro",
        "name": "iPhone 16 Pro",
        "brand": "Apple",
        "price": "1,19,999",
        "original_price": "1,39,999",
        "category": "Mobiles",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        "images": [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500"
        ],
        "rating": 4.9,
        "rating_count": 12540,
        "badge": "-20%",
        "display_section": "deals",
        "stock": 35,
        "description": "Apple iPhone 16 Pro featuring a stunning titanium design, the new Camera Control, powerful A18 Pro chip, and a huge leap in battery life. 256GB Storage, Black Titanium, 5G Supported."
    },
    {
        "id": "samsung-s25-ultra",
        "name": "Samsung S25 Ultra",
        "brand": "Samsung",
        "price": "99,999",
        "original_price": "1,09,999",
        "category": "Mobiles",
        "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
        "images": [
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500"
        ],
        "rating": 4.8,
        "rating_count": 9850,
        "badge": "Best Seller",
        "display_section": "deals",
        "stock": 28,
        "description": "Samsung Galaxy S25 Ultra with integrated S Pen, 200MP camera, Snapdragon 8 Gen 4 processor, and Dynamic AMOLED 2X display. 512GB Storage, Titanium Gray, 5G Supported."
    },
    {
        "id": "hp-pavilion-gaming",
        "name": "HP Pavilion Gaming",
        "brand": "HP",
        "price": "59,999",
        "original_price": "69,999",
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
        "images": [
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
            "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"
        ],
        "rating": 4.7,
        "rating_count": 4210,
        "badge": "Top Rated",
        "display_section": "deals",
        "stock": 15,
        "description": "HP Pavilion Gaming Laptop with AMD Ryzen 5, NVIDIA GeForce GTX 1650, 8GB RAM, and 512GB SSD. 15.6-inch FHD display, backlit keyboard, Windows 11."
    },
    {
        "id": "boat-headphones",
        "name": "Boat Headphones",
        "brand": "boAt",
        "price": "2,499",
        "original_price": "3,499",
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"
        ],
        "rating": 4.9,
        "rating_count": 25430,
        "badge": "Limited",
        "display_section": "deals",
        "stock": 120,
        "description": "boAt Rockerz Bluetooth Wireless Over-Ear Headphones with up to 15 hours play time, deep bass, and comfortable ear cups. Integrated controls and voice assistant support."
    },
    {
        "id": "macbook-air-m3",
        "name": "MacBook Air M3",
        "brand": "Apple",
        "price": "1,14,999",
        "original_price": "1,34,999",
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        "images": [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500",
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"
        ],
        "rating": 5.0,
        "rating_count": 8760,
        "badge": "HOT",
        "display_section": "trending",
        "stock": 42,
        "description": "Apple MacBook Air M3 chip laptop. Superlight, under half an inch thin, up to 18 hours of battery life. Liquid Retina display, 8GB Unified Memory, 256GB SSD."
    },
    {
        "id": "sony-bravia-55-tv",
        "name": "Sony Bravia 55\" 4K TV",
        "brand": "Sony",
        "price": "54,999",
        "original_price": "74,999",
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",
        "images": [
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",
            "https://images.unsplash.com/photo-1558882224-cca16673336d?w=500",
            "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=500"
        ],
        "rating": 4.6,
        "rating_count": 6430,
        "badge": "HOT",
        "display_section": "trending",
        "stock": 18,
        "description": "Sony Bravia 55-inch Ultra HD 4K Smart LED TV with Google TV, Dolby Vision, Dolby Atmos, and Alexa compatibility. Vivid colors and crystal clear audio."
    },
    {
        "id": "nike-air-max-2026",
        "name": "Nike Air Max 2026",
        "brand": "Nike",
        "price": "7,999",
        "original_price": "11,999",
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500"
        ],
        "rating": 4.9,
        "rating_count": 14320,
        "badge": "SALE",
        "display_section": "trending",
        "stock": 85,
        "description": "Nike Air Max running shoes featuring a lightweight mesh construction, iconic Max Air cushioning for all-day comfort, and a durable rubber outsole."
    },
    {
        "id": "apple-watch-series-9",
        "name": "Apple Watch Series 9",
        "brand": "Apple",
        "price": "39,999",
        "original_price": "44,999",
        "category": "Watches",
        "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
        "images": [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
            "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500"
        ],
        "rating": 4.7,
        "rating_count": 11240,
        "badge": "HOT",
        "display_section": "trending",
        "stock": 60,
        "description": "Apple Watch Series 9 with S9 SiP chip, double tap gesture, brighter Always-On Retina display, advanced health sensors (blood oxygen, ECG, sleep tracking)."
    },
    {
        "id": "playstation-5-pro",
        "name": "PlayStation 5 Pro",
        "brand": "Sony",
        "price": "49,999",
        "original_price": "54,999",
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
        "images": [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500",
            "https://images.unsplash.com/photo-1592155977684-f7464e107c54?w=500"
        ],
        "rating": 5.0,
        "rating_count": 5430,
        "badge": "NEW",
        "display_section": "new_arrivals",
        "stock": 9,
        "description": "Sony PlayStation 5 Pro Console. Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, 3D Audio, and 4K gaming."
    },
    {
        "id": "dji-mini-4-pro-drone",
        "name": "DJI Mini 4 Pro Drone",
        "brand": "DJI",
        "price": "72,000",
        "original_price": "85,000",
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500",
        "images": [
            "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500",
            "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500",
            "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500"
        ],
        "rating": 4.8,
        "rating_count": 1890,
        "badge": "NEW",
        "display_section": "new_arrivals",
        "stock": 25,
        "description": "DJI Mini 4 Pro Drone under 249g. 4K/60fps HDR True Vertical Shooting, omnidirectional active obstacle sensing, 34-min flight time, 20km FHD video transmission."
    },
    {
        "id": "sony-alpha-ilce-7m4",
        "name": "Sony Alpha ILCE-7M4",
        "brand": "Sony",
        "price": "1,99,999",
        "original_price": "2,20,000",
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        "images": [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
            "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500"
        ],
        "rating": 4.9,
        "rating_count": 3120,
        "badge": "NEW",
        "display_section": "new_arrivals",
        "stock": 14,
        "description": "Sony Alpha 7 IV Full-frame Mirrorless Camera. 33MP Exmor R CMOS sensor, 4K 60p video, real-time autofocus tracking for humans, animals, and birds."
    },
    {
        "id": "ipad-pro-m4-2026",
        "name": "iPad Pro M4 (2026)",
        "brand": "Apple",
        "price": "99,999",
        "original_price": "1,09,999",
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
        "images": [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
            "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=500",
            "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500"
        ],
        "rating": 4.9,
        "rating_count": 2840,
        "badge": "NEW",
        "display_section": "new_arrivals",
        "stock": 31,
        "description": "Apple iPad Pro 11-inch (M4 Chip) featuring the breakthrough Ultra Retina XDR display, pro camera system with LiDAR scanner, and Thunderbolt connectivity."
    }
]

# Create tables and seed data automatically
try:
    with app.app_context():
        # Verify schema integrity for join_date column, drop and recreate if missing
        try:
            db.session.execute(db.select(User.join_date).limit(1))
        except Exception:
            print("[DATABASE] Schema update: join_date column missing. Recreating tables...")
            db.drop_all()
            
        db.create_all()
        # Seed Products
        if Product.query.count() == 0:
            for p in initial_products_list:
                prod = Product(
                    id=p["id"],
                    name=p["name"],
                    brand=p["brand"],
                    price=p["price"],
                    original_price=p["original_price"],
                    category=p["category"],
                    image=p["image"],
                    rating=p["rating"],
                    rating_count=p["rating_count"],
                    badge=p["badge"],
                    display_section=p["display_section"],
                    stock=p["stock"],
                    description=p["description"]
                )
                prod.images = p["images"]
                db.session.add(prod)
            db.session.commit()
            print("[DATABASE] Seeded 12 default products successfully.")
            
        # Seed default user
        if User.query.filter_by(phone="9876543210").first() is None:
            default_user = User(phone="9876543210", name="Rama Krishna", logged_in=False)
            db.session.add(default_user)
            db.session.commit()
            print("[DATABASE] Seeded default user successfully.")
except Exception as e:
    print(f"[DATABASE WARNING] Exception during db initialization: {e}")

# ================= ROUTES IMPLEMENTATION =================

@app.route("/")
def root():
    return render_template("login.html")

@app.route("/login", methods=['GET'])
def login():
    if 'user_phone' in session:
        return redirect(url_for('home'))
    return render_template("login.html")

# Send OTP API (Simulated)
@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    phone = data.get("phone", "").strip()
    if not phone or len(phone) < 10:
        return jsonify({"success": False, "message": "Please enter a valid 10-digit mobile number."}), 400
    
    otp = str(random.randint(1000, 9999))
    session['temp_otp'] = otp
    session['temp_phone'] = phone
    session['temp_otp_time'] = time.time()
    
    print(f"[OTP SIMULATOR - MOCK] Phone: {phone} | OTP: {otp}")
    return jsonify({"success": True, "otp": otp})

# Verify OTP API
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    otp = data.get("otp", "").strip()
    phone = data.get("phone", "").strip()
    
    if not otp or not phone:
        return jsonify({"success": False, "message": "Missing OTP or mobile number."}), 400
        
    otp_time = session.get('temp_otp_time')
    if not otp_time or (time.time() - otp_time) > 60:
        session.pop('temp_otp', None)
        session.pop('temp_phone', None)
        session.pop('temp_otp_time', None)
        return jsonify({"success": False, "message": "Verification code has expired (valid up to 1 minute). Please request a new OTP."}), 400
        
    if session.get('temp_otp') == otp and session.get('temp_phone') == phone:
        session.pop('temp_otp', None)
        session.pop('temp_phone', None)
        session.pop('temp_otp_time', None)
        
        user = User.query.filter_by(phone=phone).first()
        if user and user.name:
            session.permanent = True  # Keep logged in across restarts
            session['user_phone'] = phone
            session['user_name'] = user.name
            user.logged_in = True
            db.session.commit()
            return jsonify({"success": True, "new_user": False, "redirect": "/home"})
        else:
            session['registering_phone'] = phone
            return jsonify({"success": True, "new_user": True, "redirect": "/enter-name"})
    else:
        return jsonify({"success": False, "message": "Invalid OTP code. Please try again."}), 400

# Enter Name Route (for new users)
@app.route("/enter-name", methods=["GET", "POST"])
def enter_name():
    phone = session.get('registering_phone')
    if not phone:
        return redirect(url_for('login'))
        
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        if not name:
            flash("Name cannot be empty.", "danger")
            return render_template("enter_name.html")
            
        user = User.query.filter_by(phone=phone).first()
        if not user:
            user = User(phone=phone, name=name, logged_in=True)
            db.session.add(user)
        else:
            user.name = name
            user.logged_in = True
        db.session.commit()
        
        session.permanent = True  # Keep logged in across restarts
        session['user_phone'] = phone
        session['user_name'] = name
        session.pop('registering_phone', None)
        return redirect(url_for('home'))
        
    return render_template("enter_name.html")

# Logout Route
@app.route("/logout")
def logout():
    phone = session.get('user_phone')
    if phone:
        user = User.query.filter_by(phone=phone).first()
        if user:
            user.logged_in = False
            db.session.commit()
    session.clear()
    return redirect(url_for('login'))

@app.route("/signup")
def signup():
    return render_template("signup.html")

# Home Page Route
@app.route("/home")
def home():
    products = Product.query.all()
    return render_template("home.html", products=products)

# Search Results Route
@app.route("/search")
def search():
    query = request.args.get("q", "").lower().strip()
    
    filtered_results = Product.query.filter(
        (Product.name.like(f"%{query}%")) | 
        (Product.brand.like(f"%{query}%")) | 
        (Product.category.like(f"%{query}%"))
    ).all()

    return render_template("search.html", query=query, products=filtered_results)

# Product Details Route
@app.route("/product/<string:product_id>")
def product_details(product_id):
    product = Product.query.filter_by(id=product_id).first()
    if not product:
        product = Product.query.filter_by(name=product_id).first()
        
    if not product:
        flash("Product not found.", "danger")
        return redirect(url_for('home'))
    return render_template("product_details.html", product=product)

# Admin Panel Login
@app.route("/admin")
def admin():
    return render_template("admin_login.html")

# Admin Dashboard overview
@app.route("/admin/dashboard")
def admin_dashboard():
    total_products = Product.query.count()
    total_customers = User.query.count()
    total_orders = Order.query.count()
    
    # Calculate revenue
    all_orders = Order.query.all()
    total_revenue = 0.0
    for order in all_orders:
        try:
            amt = float(order.total_amount.replace(",", ""))
            total_revenue += amt
        except ValueError:
            pass
            
    if total_revenue >= 100000:
        revenue_str = f"₹{total_revenue / 100000:.1f}L"
    else:
        revenue_str = f"₹{total_revenue:,.0f}"
        
    return render_template(
        "admin_dashboard.html",
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        revenue=revenue_str,
        active="dashboard"
    )

# Admin Products View
@app.route("/admin/products")
def admin_products():
    products = Product.query.all()
    return render_template("admin_products.html", products_list=products, active="products")

# Delete Product Route
@app.route("/admin/delete-product/<string:product_id>")
def delete_product(product_id):
    product = Product.query.filter((Product.id == product_id) | (Product.name == product_id)).first()
    if product:
        db.session.delete(product)
        db.session.commit()
        flash("Product deleted successfully!", "success")
    return redirect(url_for("admin_products"))

# Admin Orders view
@app.route("/admin/orders")
def admin_orders():
    orders = Order.query.all()
    return render_template("admin_orders.html", orders_list=orders, active="orders")

# Update Order Status Route
@app.route("/admin/update-order-status/<string:order_id>", methods=["POST"])
def update_order_status(order_id):
    new_status = request.form.get("status")
    order = Order.query.filter_by(order_id=order_id).first()
    if order:
        order.status = new_status
        db.session.commit()
        flash(f"Order {order_id} status updated to {new_status}!", "success")
    return redirect(url_for("admin_orders"))

# Admin Customers view
@app.route("/admin/customers")
def admin_customers():
    users = User.query.all()
    return render_template("admin_customers.html", users_list=users, active="customers")

# Admin Sub Pages Placeholders
@app.route("/admin/<page_name>")
def admin_sub_pages(page_name):
    formatted_title = page_name.replace("-", " ").title()
    return render_template("admin_sub.html", title=formatted_title)

# Add Product Route
@app.route("/add-product", methods=["GET", "POST"])
def add_product():
    if request.method == "POST":
        name = request.form.get("product_name")
        brand = request.form.get("brand")
        price = request.form.get("price")
        stock = request.form.get("stock")
        category = request.form.get("category")
        description = request.form.get("description")
        display_section = request.form.get("display_section", "recent")
        
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

        # Generate unique ID slug from name
        slug = name.lower().strip()
        slug = "".join([c if c.isalnum() or c == "-" else " " for c in slug])
        slug = "-".join(slug.split())
        
        base_slug = slug
        counter = 1
        while Product.query.filter_by(id=slug).first() is not None:
            slug = f"{base_slug}-{counter}"
            counter += 1

        new_prod = Product(
            id=slug,
            name=name,
            brand=brand,
            price=price,
            original_price=None,
            stock=int(stock) if stock else 50,
            category=category,
            description=description,
            image=final_image_url,
            rating=5.0,
            rating_count=1,
            badge="NEW",
            display_section=display_section
        )
        new_prod.images = [final_image_url]
        db.session.add(new_prod)
        db.session.commit()

        return redirect(url_for("home"))

    return render_template("add_product.html", active="add_product")

# Cart Page Route
@app.route("/cart")
def cart():
    return render_template("cart.html")

# Wishlist Page Route
@app.route("/wishlist")
def wishlist():
    return render_template("wishlist.html")

# Checkout POST Route
@app.route("/checkout", methods=["POST"])
def checkout():
    if 'user_phone' not in session:
        return jsonify({"success": False, "message": "Please login to place an order."}), 401
        
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data received"}), 400

    items = data.get("items", [])
    address = data.get("address", "No address provided")

    if not items:
        return jsonify({"success": False, "message": "Cart is empty"}), 400

    total_amount = 0
    clean_items = []
    for item in items:
        price_str = str(item.get("price", "0")).replace(",", "")
        try:
            price = float(price_str)
        except ValueError:
            price = 0.0
        quantity = int(item.get("quantity", 1))
        total_amount += price * quantity
        
        clean_items.append({
            "name": item.get("name"),
            "price": f"{price:,.2f}",
            "quantity": quantity,
            "image": item.get("image")
        })

    order_id = f"RK-{random.randint(100000, 999999)}"
    
    order = Order(
        order_id=order_id,
        user_phone=session['user_phone'],
        address=address,
        total_amount=f"{total_amount:,.2f}",
        status="Processing",
        date=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    order.items = clean_items
    
    db.session.add(order)
    db.session.commit()

    return jsonify({"success": True, "order_id": order_id})

# Profile GET Route (Flipkart-style dashboard)
@app.route("/profile")
def profile():
    if 'user_phone' not in session:
        return redirect(url_for('login'))
    return render_template("profile.html")

# Profile Edit Route (GET & POST)
@app.route("/profile/edit", methods=["GET", "POST"])
def edit_profile():
    if 'user_phone' not in session:
        return redirect(url_for('login'))
        
    phone = session['user_phone']
    if request.method == "POST":
        new_name = request.form.get("name", "").strip()
        if not new_name:
            flash("Name cannot be empty.", "danger")
            return render_template("edit_profile.html")
            
        user = User.query.filter_by(phone=phone).first()
        if not user:
            user = User(phone=phone, name=new_name)
            db.session.add(user)
        else:
            user.name = new_name
        db.session.commit()
        session['user_name'] = new_name
        
        flash("Profile updated successfully!", "success")
        return redirect(url_for('profile'))
        
    return render_template("edit_profile.html")

# User orders history (GET)
@app.route("/profile/orders")
def profile_orders():
    if 'user_phone' not in session:
        return redirect(url_for('login'))
        
    user_phone = session['user_phone']
    user_specific_orders = Order.query.filter_by(user_phone=user_phone).all()
    sorted_orders = sorted(user_specific_orders, key=lambda x: x.date, reverse=True)
    return render_template("user_orders.html", orders=sorted_orders)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)