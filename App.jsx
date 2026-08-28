import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = ["All", "Sarees", "Suits", "Lehengas", "Kurtis"];

const INITIAL_PRODUCTS = [
  { id: "demo-1", name: "Banarasi Silk Saree", price: 4500, category: "Sarees", description: "Pure Banarasi silk with zari border, perfect for weddings.", stock: 10, image_url: null, emoji: "🥻" },
  { id: "demo-2", name: "Anarkali Suit", price: 2800, category: "Suits", description: "Floral embroidered Anarkali with dupatta set.", stock: 7, image_url: null, emoji: "👘" },
  { id: "demo-3", name: "Lehenga Choli", price: 6200, category: "Lehengas", description: "Heavy embroidery bridal lehenga in deep red.", stock: 4, image_url: null, emoji: "🌸" },
  { id: "demo-4", name: "Chanderi Kurti", price: 950, category: "Kurtis", description: "Light chanderi fabric kurti with block prints.", stock: 15, image_url: null, emoji: "👗" }
];

const emptyForm = {
  name: "", price: "", category: "Sarees", description: "", stock: "", emoji: "🥻", image: null
};

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function ProductImage({ product }) {
  if (product.image_url) return <img src={product.image_url} alt={product.name} />;
  return <span className="emoji">{product.emoji || "🥻"}</span>;
}

function Header({ view, setView, cartCount, setCartOpen }) {
  return (
    <nav className="nav">
      <div className="logo" onClick={() => setView("shop")}>🌺 Kalakriti</div>
      <div className="nav-right">
        <button className={`nav-btn ${view === "shop" ? "active" : ""}`} onClick={() => setView("shop")}>Shop</button>
        <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>Admin</button>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>🛒 Cart{cartCount > 0 && ` (${cartCount})`}</button>
      </div>
    </nav>
  );
}

function Shop({ products, setCart, category, setCategory, search, setSearch, setCartOpen }) {
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return current;
        return current.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const filtered = products.filter(product => {
    const categoryMatch = category === "All" || product.category === category;
    const text = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();
    return categoryMatch && text.includes(search.toLowerCase());
  });

  return (
    <>
      <section className="hero">
        <div className="hero-small">— नारी शक्ति, नारी सौंदर्य —</div>
        <h1>कलाकृति</h1>
        <p>Traditional Indian Ladies Clothing</p>
        <button className="primary-btn" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>Collection Dekhein ✨</button>
      </section>

      <section className="section" id="products">
        <h2 className="section-title">Hamara Collection</h2>
        <div className="gold-line" />
        <input className="search" placeholder="🔎 Product search karein..." value={search} onChange={e => setSearch(e.target.value)} />

        <div className="filters">
          {CATEGORIES.map(item => (
            <button key={item} className={`filter ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        <div className="grid">
          {filtered.map(product => (
            <div className="card" key={product.id}>
              <div className="card-img"><ProductImage product={product} /></div>
              <div className="card-body">
                <div className="category">{product.category}</div>
                <h3>{product.name}</h3>
                <div className="description">{product.description || "Beautiful traditional Indian clothing."}</div>
                <div className="card-bottom">
                  <div>
                    <div className="price">{money(product.price)}</div>
                    {product.stock <= 0 && <div className="out">Out of stock</div>}
                  </div>
                  <button className="add" disabled={product.stock <= 0} onClick={() => addToCart(product)}>
                    {product.stock > 0 ? "+ Cart" : "Sold Out"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <p style={{ textAlign: "center", padding: 50, color: "#999" }}>Is category mein abhi koi product nahi hai.</p>}
      </section>
    </>
  );
}

function Cart({ cart, setCart, open, setOpen, setCheckoutOpen }) {
  if (!open) return null;

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  const changeQty = (id, delta) => {
    setCart(current => current.map(item =>
      item.id === id ? { ...item, qty: Math.max(0, Math.min(Number(item.stock), item.qty + delta)) } : item
    ).filter(item => item.qty > 0));
  };

  return (
    <div className="overlay" onClick={() => setOpen(false)}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head"><span>🛒 Aapka Cart</span><button className="close" onClick={() => setOpen(false)}>✕</button></div>
        <div className="cart-list">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 70, color: "#999" }}><div style={{ fontSize: 50 }}>🛒</div>Cart khali hai!</div>
          ) : cart.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="thumb"><ProductImage product={item} /></div>
              <div className="cart-info">
                <div className="cart-name">{item.name}</div>
                <div>{money(Number(item.price) * item.qty)}</div>
                <div className="qty">
                  <button onClick={() => changeQty(item.id, -1)}>−</button>
                  <strong>{item.qty}</strong>
                  <button onClick={() => changeQty(item.id, 1)}>+</button>
                  <button style={{ marginLeft: 8, border: 0, background: "none", color: "#c0392b" }} onClick={() => setCart(current => current.filter(x => x.id !== item.id))}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total"><span>Total</span><span>{money(total)}</span></div>
            <button className="full-btn" onClick={() => { setOpen(false); setCheckoutOpen(true); }}>Abhi Kharido — {money(total)}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Checkout({ open, setOpen, cart, setCart, onOrderPlaced }) {
  const [form, setForm] = useState({ name: "", mobile: "", address: "", payment: "Cash on Delivery" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  const placeOrder = async () => {
    if (!form.name.trim() || !form.mobile.trim() || !form.address.trim()) {
      alert("Please naam, mobile number aur address bharein."); return;
    }
    if (form.mobile.replace(/\D/g, "").length < 10) {
      alert("Valid mobile number dalein."); return;
    }

    try {
      setLoading(true);
      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: form.name.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        payment_method: form.payment,
        total,
        status: "New"
      }).select().single();

      if (error) throw error;

      const orderItems = cart.map(item => ({
        order_id: order.id, product_id: item.id, product_name: item.name,
        price: item.price, quantity: item.qty
      }));

      const { error: itemError } = await supabase.from("order_items").insert(orderItems);
      if (itemError) throw itemError;

      for (const item of cart) {
        await supabase.from("products").update({ stock: Math.max(0, Number(item.stock) - Number(item.qty)) }).eq("id", item.id);
      }

      setCart([]);
      setDone(true);
      onOrderPlaced();

      setTimeout(() => { setDone(false); setOpen(false); }, 3000);
    } catch (error) {
      console.error(error);
      alert("Order place nahi ho paya. Please dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-box">
        {done ? (
          <div className="success"><div style={{ fontSize: 60 }}>🎉</div><h2>Order Ho Gaya!</h2><p>Aapka order successfully confirm ho gaya.</p></div>
        ) : (
          <>
            <h2>📦 Delivery Details</h2>
            <label className="label">Pura Naam</label>
            <input className="input" placeholder="Aapka naam" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label className="label">Mobile Number</label>
            <input className="input" type="tel" placeholder="10 digit mobile number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
            <label className="label">Delivery Address</label>
            <textarea className="input" rows="4" placeholder="Ghar ka pura address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <label className="label">Payment Method</label>
            <select className="input" value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })}>
              <option>Cash on Delivery</option>
              <option>UPI</option>
            </select>
            <div className="total"><span>Total</span><span>{money(total)}</span></div>
            <button className="full-btn" disabled={loading} onClick={placeOrder}>{loading ? "Order ho raha hai..." : `✅ Order Place Karein — ${money(total)}`}</button>
            <button style={{ width: "100%", marginTop: 10, padding: 11, background: "white", border: "1px solid #ddd", borderRadius: 6 }} onClick={() => setOpen(false)}>Wapas</button>
          </>
        )}
      </div>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Email ya password galat hai.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-box">
      <h2 style={{ fontFamily: "Playfair Display", color: "#7b1c2e" }}>🔐 Admin Login</h2>
      <label className="label">Email</label>
      <input className="input" type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} />
      <label className="label">Password</label>
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="full-btn" disabled={loading} onClick={login}>{loading ? "Login..." : "Login"}</button>
    </div>
  );
}

function Admin({ products, loadProducts }) {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Sirf image upload karein."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image maximum 5MB ki honi chahiye."); return; }
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const addProduct = async () => {
    if (!form.name.trim() || !form.price) { alert("Product name aur price required hai."); return; }

    try {
      setLoading(true);
      let imageUrl = null;

      if (form.image) {
        const extension = form.image.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, form.image, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("product-images").getPublicUrl(fileName).data.publicUrl;
      }

      const { error } = await supabase.from("products").insert({
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        description: form.description.trim(),
        stock: Number(form.stock) || 0,
        emoji: form.emoji,
        image_url: imageUrl
      });
      if (error) throw error;

      alert("Product successfully add ho gaya! ✅");
      setForm(emptyForm); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Product add nahi ho paya.");
    } finally { setLoading(false); }
  };

  const deleteProduct = async product => {
    if (!confirm(`"${product.name}" delete karein?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) { console.error(error); alert("Product delete nahi ho paya."); return; }
    await loadProducts();
  };

  const logout = async () => { await supabase.auth.signOut(); };

  return (
    <div className="admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h2 className="section-title">⚙️ Admin Panel</h2><div className="gold-line" /></div>
        <button className="delete" onClick={logout}>Logout</button>
      </div>

      <div className="form-box">
        <h2 style={{ color: "#7b1c2e", fontFamily: "Playfair Display" }}>➕ Naya Product</h2>

        <div className="form-grid">
          <div>
            <label className="label">Product Name *</label>
            <input className="input" placeholder="Kanjivaram Silk Saree" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Price *</label>
            <input className="input" type="number" placeholder="3500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Sarees</option><option>Suits</option><option>Lehengas</option><option>Kurtis</option>
            </select>
          </div>
          <div>
            <label className="label">Stock</label>
            <input className="input" type="number" placeholder="10" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
        </div>

        <label className="label">Description</label>
        <textarea className="input" rows="3" placeholder="Product ke baare mein..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

        <label className="label">Product Photo</label>
        <div className="upload" onClick={() => fileRef.current?.click()}>
          {preview ? <img className="preview" src={preview} alt="preview" /> : <><div style={{ fontSize: 45 }}>📷</div><div>Phone se product photo choose karein</div><small>JPG, PNG, WEBP — max 5MB</small></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />

        {!preview && (
          <>
            <label className="label">Photo nahi hai? Emoji choose karein</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {["🥻","👘","🌸","👗","💐","✨"].map(emoji => (
                <button key={emoji} onClick={() => setForm({ ...form, emoji })} style={{ fontSize: 25, padding: 5, background: form.emoji === emoji ? "#f5e6cc" : "white", border: "1px solid #c9a84c", borderRadius: 6 }}>{emoji}</button>
              ))}
            </div>
          </>
        )}

        <button className="primary-btn" disabled={loading} onClick={addProduct}>{loading ? "Adding..." : "✅ Product Add Karein"}</button>
      </div>

      <h2 className="section-title">📦 Products ({products.length})</h2>
      <div className="gold-line" />

      <div className="table-wrap">
        <table>
          <thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Delete</th></tr></thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><div className="thumb"><ProductImage product={product} /></div></td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category}</td>
                <td>{money(product.price)}</td>
                <td>{product.stock}</td>
                <td><button className="delete" onClick={() => deleteProduct(product)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kalakriti-cart") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  const loadProducts = async () => {
    if (!supabaseUrl || !supabaseKey) { setProducts(INITIAL_PRODUCTS); return; }
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) { console.error(error); setProducts(INITIAL_PRODUCTS); return; }
    setProducts(data?.length ? data : INITIAL_PRODUCTS);
    setDbReady(true);
  };

  useEffect(() => {
    loadProducts();

    if (!supabaseUrl || !supabaseKey) { setAuthLoading(false); return; }

    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem("kalakriti-cart", JSON.stringify(cart)); }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="app">
      <Header view={view} setView={setView} cartCount={cartCount} setCartOpen={setCartOpen} />

      {view === "shop" && (
        <Shop products={products} setCart={setCart} category={category} setCategory={setCategory} search={search} setSearch={setSearch} setCartOpen={setCartOpen} />
      )}

      {view === "admin" && (
        authLoading ? <div style={{ textAlign: "center", padding: 80 }}>Loading...</div> :
        session ? <Admin products={products} loadProducts={loadProducts} /> :
        <AdminLogin />
      )}

      <Cart cart={cart} setCart={setCart} open={cartOpen} setOpen={setCartOpen} setCheckoutOpen={setCheckoutOpen} />
      <Checkout open={checkoutOpen} setOpen={setCheckoutOpen} cart={cart} setCart={setCart} onOrderPlaced={loadProducts} />

      <footer>
        <strong>🌺 Kalakriti</strong>
        Traditional Indian Ladies Clothing
        <br /><small>© 2026 Kalakriti</small>
      </footer>
    </div>
  );
}

export default App;