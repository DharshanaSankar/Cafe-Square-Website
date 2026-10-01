import { useEffect, useMemo, useRef, useState, type FormEvent, type TouchEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, Coffee, MapPin, Menu as MenuIcon, Minus, Plus, Search, ShoppingBag, Sparkles, X, Phone, MessageCircle, Utensils, Image as ImageIcon, CupSoda, Sandwich, Armchair, Heart } from 'lucide-react';
import { business } from './data/business';
import { categories, featuredItemIds, menuItems, type MenuItem } from './data/menu';
import { galleryCategories, galleryImages } from './data/gallery';
import './app.css';

type CartLine = { item: MenuItem; quantity: number };
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapSearch)}`;

function waLink(message: string) {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const cartLines = useMemo(() => Object.values(cart), [cart]);
  const count = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = `${item.name} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  }), [activeCategory, search]);
  const featuredItems = featuredItemIds.map((id) => menuItems.find((item) => item.id === id)).filter((item): item is MenuItem => Boolean(item));
  const visibleGallery = galleryImages.filter((image) => galleryFilter === 'All' || image.category === galleryFilter);
  const modalOpen = drawerOpen || cartOpen || lightboxIndex !== null;
  const hasUnknownPrice = cartLines.some(({ item }) => item.price === null);

  useEffect(() => {
    if (!modalOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = oldOverflow; };
  }, [modalOpen]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') setLightboxIndex((index) => index === null ? null : (index + 1) % visibleGallery.length);
      if (event.key === 'ArrowLeft') setLightboxIndex((index) => index === null ? null : (index - 1 + visibleGallery.length) % visibleGallery.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, visibleGallery.length]);

  useEffect(() => {
    if (!drawerOpen && !cartOpen && lightboxIndex === null) return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        setCartOpen(false);
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [drawerOpen, cartOpen, lightboxIndex]);

  const setQuantity = (item: MenuItem, quantity: number) => {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[item.id];
      else next[item.id] = { item, quantity };
      return next;
    });
  };

  const orderMessage = () => {
    const lines = cartLines.map(({ item, quantity }) => `${quantity} × ${item.name} — ${item.price === null ? '₹ — (price pending)' : `₹ ${item.price} (listed price)`}`);
    const priceNote = hasUnknownPrice ? 'Some prices are still pending.' : 'Please confirm the listed prices.';
    return `Hello Cafe Square, I'd like to check availability for:\n${lines.join('\n')}\n\n${priceNote} Please confirm the order details.`;
  };

  const goWhatsAppOrder = () => {
    if (cartLines.length) window.open(waLink(orderMessage()), '_blank', 'noopener,noreferrer');
  };

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const email = String(form.get('email') || '').trim();
    const message = String(form.get('message') || '').trim();
    const emailLine = email ? `\nMy email: ${email}` : '';
    const text = `Hello Cafe Square,\n\n${message}\n\nFrom: ${name}\nMy phone: ${phone}${emailLine}\n\nI understand this opens WhatsApp and I still need to review and send the message there.`;
    setContactSent(true);
    window.open(waLink(text), '_blank', 'noopener,noreferrer');
  };

  const onGalleryTouchStart = (event: TouchEvent) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; };
  const onGalleryTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null || lightboxIndex === null || visibleGallery.length < 2) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(delta) > 48) setLightboxIndex((lightboxIndex + (delta < 0 ? 1 : -1) + visibleGallery.length) % visibleGallery.length);
    touchStartX.current = null;
  };

  const openGalleryImage = (id: string) => setLightboxIndex(visibleGallery.findIndex((image) => image.id === id));
  const lightboxImage = lightboxIndex === null ? null : visibleGallery[lightboxIndex];
  const navItems = [['Home', '#home'], ['Menu', '#menu'], ['About', '#about'], ['Gallery', '#gallery'], ['Contact', '#contact'], ['Location', '#visit']] as const;

  const renderProductCard = (item: MenuItem, featured = false) => {
    const quantity = cart[item.id]?.quantity ?? 0;
    return (
      <article className={`product-card ${featured ? 'product-featured' : ''}`} key={item.id} data-testid={`card-menu-${item.id}`}>
        {featured && <div className="featured-label"><Sparkles size={13} aria-hidden="true" /> Featured pick</div>}
        <div className="product-image">
          {item.image
            ? <><img src={item.image} alt={`Illustrative placeholder image for ${item.name}`} loading="lazy" /><span>Illustrative image</span></>
            : <><ImageIcon size={19} aria-hidden="true" /><span>Photo to be added</span></>}
        </div>
        <div className="product-topline"><span>{item.category}</span><span className="price-label" data-testid={`text-price-${item.id}`}>{item.price === null ? '₹ —' : `₹ ${item.price}`}</span></div>
        <h3>{item.name}</h3>
        {item.description && <p>{item.description}</p>}
        <div className="product-bottom">
          <span className="price-note">{item.price === null ? 'Ask us for today’s price' : 'Confirm today’s price'}</span>
          {quantity === 0 ? (
            <button className="add-button" onClick={() => setQuantity(item, 1)} aria-label={`Add ${item.name} to cart`} data-testid={`button-add-${item.id}`}><Plus size={17} aria-hidden="true" /><span>Add</span></button>
          ) : (
            <div className="quantity-control" aria-label={`${item.name} quantity`}>
              <button aria-label={`Remove one ${item.name}`} onClick={() => setQuantity(item, quantity - 1)} data-testid={`button-decrement-${item.id}`}><Minus size={15} /></button>
              <span data-testid={`text-quantity-${item.id}`}>{quantity}</span>
              <button aria-label={`Add one ${item.name}`} onClick={() => setQuantity(item, quantity + 1)} data-testid={`button-increment-${item.id}`}><Plus size={15} /></button>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className={`site-shell grain ${count > 0 ? 'has-cart' : ''}`}>
      <header className="site-header">
        <a href="#home" className="brand" onClick={() => setDrawerOpen(false)} aria-label="Cafe Square home" data-testid="link-brand-home">
          <span className="brand-mark"><Coffee size={19} strokeWidth={1.8} /></span>
          <span className="brand-name">cafe <b>square</b><small>RAJAPALAYAM</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(([label, href]) => <a key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a>)}
        </nav>
          <a className="header-order" href="#menu" data-testid="link-header-order">Order now <ArrowUpRight size={15} /></a>
          <a className="mobile-order" href="#menu" aria-label="Order now" data-testid="link-mobile-order"><ShoppingBag size={18} /></a>
        <button className="mobile-menu-toggle" aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'} aria-controls="mobile-navigation" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(!drawerOpen)} data-testid="button-mobile-menu">{drawerOpen ? <X /> : <MenuIcon />}</button>
      </header>

      {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} data-testid="overlay-mobile-menu">
        <nav className="mobile-drawer" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Mobile navigation" onClick={(event) => event.stopPropagation()}>
          <div className="drawer-top"><span>Take a look around</span><button aria-label="Close navigation" onClick={() => setDrawerOpen(false)} data-testid="button-close-menu"><X /></button></div>
          {navItems.map(([label, href], index) => <a key={href} href={href} onClick={() => setDrawerOpen(false)} data-testid={`link-drawer-${index}`}><span>0{index + 1}</span>{label}<ArrowUpRight size={18} /></a>)}
          <div className="drawer-contact"><small>NEAR ANDAL PURAM BUS STOP</small><a href={`tel:${business.phoneLink}`}>{business.phoneDisplay}</a></div>
        </nav>
      </div>}

      <main>
        <section className="hero" id="home" aria-labelledby="hero-heading">
          <img className="hero-image" src="/images/cafe-interior.jpg" alt="Illustrative cafe interior placeholder, not a photo of Cafe Square" fetchPriority="high" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light-eyebrow"><span /> CAFE SQUARE · RAJAPALAYAM</p>
            <h1 id="hero-heading"><span className="hero-line">Good Food.</span><em><span className="hero-line">Great Drinks.</span><span className="hero-line">Better Moments.</span></em></h1>
            <p className="hero-copy">Your cozy corner in Rajapalayam for delicious bites, refreshing drinks and memorable moments.</p>
            <div className="hero-actions"><a className="button button-gold" href="#menu" data-testid="link-hero-order">Order now <ArrowDown size={16} /></a><a className="hero-text-link" href="#menu" data-testid="link-hero-menu">Explore menu <ArrowUpRight size={16} /></a></div>
            <p className="image-disclaimer">Illustrative cafe photography · replaceable image</p>
          </div>
          <a className="hero-side-note" href="#about">A GOOD PLACE TO PAUSE</a>
        </section>

        <div className="quick-strip" aria-label="Cafe details">
          <div><Clock3 size={18} /><span><small>OPENING HOURS</small>{business.hours}</span></div>
          <div><MapPin size={19} /><span><small>FIND US</small>Rajapalayam, Tamil Nadu</span></div>
          <a href={`tel:${business.phoneLink}`} data-testid="link-strip-call"><Phone size={18} /><span><small>SAY HELLO</small>{business.phoneDisplay}</span></a>
        </div>

        <section className="section featured-section" aria-labelledby="featured-heading">
          <div className="section-head"><div><p className="eyebrow">A PLACE TO START</p><h2 id="featured-heading">Featured <em>picks</em></h2></div><p className="section-aside">A few names from our menu<br />to get you browsing.</p></div>
          <div className="featured-grid">{featuredItems.map((item) => renderProductCard(item, true))}</div>
          <div className="soft-note"><span className="note-stamp">NOTE</span><p>Prices aren’t listed yet. Add something to your basket and ask us to confirm on WhatsApp.</p><a href="#menu" data-testid="link-featured-menu">See everything <ArrowRight size={15} /></a></div>
        </section>

        <section className="menu-section" id="menu" aria-labelledby="menu-heading">
          <div className="section menu-inner">
            <div className="menu-heading-row"><div><p className="eyebrow">MADE FOR YOUR MOOD</p><h2 id="menu-heading">What sounds <em>good?</em></h2></div><span className="menu-count">{menuItems.length} named items</span></div>
            <label className="search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">Search menu items</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu" data-testid="input-menu-search" /><kbd>⌕</kbd></label>
            <div className="category-scroll hide-scrollbar" role="group" aria-label="Filter menu by category" data-testid="menu-category-filters">
              {['All', ...categories].map((category) => <button className={activeCategory === category ? 'category-chip active' : 'category-chip'} key={category} onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} data-testid={`button-category-${category.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>{category}</button>)}
            </div>
            {filteredItems.length ? <div className="menu-grid">{filteredItems.map((item) => renderProductCard(item))}</div> :
              <div className="empty-menu" data-testid="status-menu-empty"><Search size={22} /><h3>Nothing by that name just yet.</h3><p>Try another search or browse all categories.</p><button onClick={() => { setSearch(''); setActiveCategory('All'); }} data-testid="button-reset-menu-search">Show the full menu</button></div>}
            <div className="menu-footnote"><span>*</span> Menu details and prices may change. Please confirm with Cafe Square before ordering.</div>
          </div>
        </section>

        <section className="about-section section" id="about" aria-labelledby="about-heading">
          <div className="about-art"><img src="/images/tea-sandwich.jpg" loading="lazy" alt="Illustrative tea and sandwich scene, not a confirmed Cafe Square dish" /><span>ILLUSTRATIVE IMAGE</span><div className="art-caption">The pause<br />is part of the plan.</div></div>
          <div className="about-copy"><p className="eyebrow">A TABLE IN THE NEIGHBOURHOOD</p><h2 id="about-heading">Good things<br />happen <em>in between.</em></h2><p>Between the plans and the errands. Between one conversation and the next. Cafe Square is a place to make a little room for yourself—and whoever you bring along.</p><p>Come by for something warm, something cool, or simply a seat for a while.</p><a className="text-link" href="#visit" data-testid="link-about-location">Find your way here <ArrowUpRight size={16} /></a><div className="about-ornament"><Utensils size={22} /><span>YOUR CORNER OF RAJAPALAYAM</span></div><div className="about-features" aria-label="Cafe Square highlights"><div><CupSoda size={17} aria-hidden="true" /><span>Drinks</span></div><div><Sandwich size={17} aria-hidden="true" /><span>Food</span></div><div><Armchair size={17} aria-hidden="true" /><span>Atmosphere</span></div><div><Heart size={17} aria-hidden="true" /><span>Good moments</span></div></div></div>
        </section>

        <section className="gallery-section" id="gallery" aria-labelledby="gallery-heading">
          <div className="section gallery-inner">
            <div className="section-head gallery-heading"><div><p className="eyebrow">LITTLE MOMENTS</p><h2 id="gallery-heading">A glimpse of <em>the mood.</em></h2></div><p className="section-aside">Illustrative image placeholders.<br />Not photos of the actual cafe.</p></div>
            <div className="gallery-filters" role="group" aria-label="Filter gallery">
              {galleryCategories.map((category) => <button key={category} className={galleryFilter === category ? 'gallery-filter selected' : 'gallery-filter'} aria-pressed={galleryFilter === category} onClick={() => { setGalleryFilter(category); setLightboxIndex(null); }} data-testid={`button-gallery-filter-${category.toLowerCase().replaceAll(' ', '-')}`}>{category}</button>)}
            </div>
            <div className="gallery-grid">{visibleGallery.map((image, index) => <button className={`gallery-tile tile-${index % 4}`} key={image.id} onClick={() => openGalleryImage(image.id)} aria-label={`View illustrative image: ${image.title}`} data-testid={`button-gallery-image-${image.id}`}><img src={image.src} alt={image.alt} loading="lazy" /><span className="gallery-tile-overlay"><span>{image.title}</span><ImageIcon size={18} /></span></button>)}</div>
            {!visibleGallery.length && <div className="gallery-empty" data-testid="status-gallery-empty">No illustrative images in this category yet. Replace or add photos in <code>public/images</code>.</div>}
            <p className="gallery-disclaimer">All generated cafe and food visuals are illustrative placeholders—not actual venue photos or confirmed dishes. Replace each image in <code>public/images</code> at any time.</p>
          </div>
        </section>

        <section className="visit-section section" id="visit" aria-labelledby="visit-heading">
          <div className="visit-copy"><p className="eyebrow light-eyebrow">YOUR NEXT STOP</p><h2 id="visit-heading">We’re just<br /><em>around the corner.</em></h2><p className="visit-address">{business.address}</p><div className="visit-hours"><Clock3 size={17} /><span><small>DISPLAYED HOURS</small>{business.hours}</span></div><p className="hours-footnote">Opening days haven’t been confirmed. Please call ahead if you’re planning a visit.</p><div className="visit-actions"><a className="button button-gold" href={mapUrl} target="_blank" rel="noreferrer" data-testid="link-map-directions"><MapPin size={17} /> Get directions <ArrowUpRight size={15} /></a><a className="visit-phone" href={`tel:${business.phoneLink}`} data-testid="link-visit-call"><Phone size={16} /> {business.phoneDisplay}</a></div></div>
          <div className="map-panel" data-testid="map-panel">
            {!mapLoaded ? <div className="map-placeholder"><div className="map-lines" /><div className="map-pin"><MapPin size={23} /></div><span className="map-place">Cafe Square</span><small>Rajapalayam · Tamil Nadu</small><button onClick={() => setMapLoaded(true)} data-testid="button-load-map">Load map <ArrowUpRight size={14} /></button><p>Map view loads from Google Maps.</p></div> :
              <iframe title="Google Maps location for Cafe Square" src={`https://maps.google.com/maps?q=${encodeURIComponent(business.mapSearch)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" data-testid="iframe-cafe-map" />}
          </div>
        </section>

        <section className="contact-section section" id="contact" aria-labelledby="contact-heading">
          <div className="contact-intro"><p className="eyebrow">A QUESTION? JUST ASK.</p><h2 id="contact-heading">Let’s <em>talk.</em></h2><p>For menu questions, price checks, or anything else—send us a note. Your message opens in WhatsApp, ready for you to review and send.</p><a className="contact-phone" href={`tel:${business.phoneLink}`}><span><Phone size={17} /></span><span><small>CALL THE CAFE</small>{business.phoneDisplay}</span><ArrowUpRight size={16} /></a></div>
          <form className="contact-form" onSubmit={submitContact} onChange={() => setContactSent(false)}>
            <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={70} placeholder="How should we address you?" data-testid="input-contact-name" /></label>
            <label>Your phone number<input name="phone" type="tel" autoComplete="tel" required pattern="[0-9+() .-]{7,20}" title="Enter a valid phone number" placeholder="+91" data-testid="input-contact-phone" /></label>
            <label>Your email address <span className="optional-label">Optional</span><input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" data-testid="input-contact-email" /></label>
            <label>Your message<textarea name="message" required minLength={4} maxLength={500} rows={3} placeholder="What would you like to know?" data-testid="input-contact-message" /></label>
            <button className="button button-dark" type="submit" data-testid="button-contact-submit">Continue in WhatsApp <ArrowUpRight size={16} /></button>
            <p className="form-note" data-testid="status-contact-notice">{contactSent ? <><Check size={14} /> WhatsApp opened. Please review and send your message there.</> : 'This opens WhatsApp with your message. It is not sent until you confirm it there.'}</p>
          </form>
        </section>

        <section className="end-note"><div className="end-icon"><Coffee size={24} /></div><p>There’s always room for one more at the table.</p><a href="#home" aria-label="Back to top" data-testid="link-back-to-top"><ArrowUpRight size={18} /></a></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark"><Coffee size={19} /></span><span className="brand-name">cafe <b>square</b><small>RAJAPALAYAM</small></span></div><p data-testid="text-footer-address">{business.address}</p><div className="footer-contact"><a href={`tel:${business.phoneLink}`} data-testid="link-footer-call">{business.phoneDisplay}</a><span>{business.hours}</span><a className="footer-order" href="#menu" data-testid="link-footer-order">Order now <ArrowUpRight size={14} /></a></div><nav aria-label="Footer navigation"><a href="#menu" data-testid="link-footer-menu">Menu</a><a href="#gallery" data-testid="link-footer-gallery">Gallery</a><a href="#visit" data-testid="link-footer-location">Find us</a><a href="#contact" data-testid="link-footer-contact">Contact</a><button onClick={() => { const text = `Let's visit Cafe Square: ${mapUrl}`; if (navigator.share) void navigator.share({ title: business.name, text, url: mapUrl }).catch(() => {}); else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer'); }} data-testid="button-share-cafe">Share Cafe Square</button></nav><div className="footer-bottom"><span>Made for the moments in between.</span><span>© Cafe Square</span></div></footer>

      {count > 0 && <div className="cart-bar-wrap" data-testid="cart-bar"><button className="cart-bar" onClick={() => setCartOpen(true)} aria-label={`Open basket with ${count} ${count === 1 ? 'item' : 'items'}`} data-testid="button-open-cart"><span className="cart-bag"><ShoppingBag size={18} /><b>{count}</b></span><span className="cart-bar-copy"><strong>Your basket</strong><small>{count} {count === 1 ? 'item' : 'items'} · prices pending</small></span><span className="cart-bar-action">Review <ArrowRight size={15} /></span></button></div>}

      {cartOpen && <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }} data-testid="overlay-cart">
        <section className="cart-sheet" role="dialog" aria-modal="true" aria-labelledby="cart-heading" data-testid="cart-sheet">
          <div className="sheet-handle" /><div className="sheet-head"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="cart-heading">Your <em>basket.</em></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close basket" data-testid="button-close-cart"><X /></button></div>
           <div className="cart-lines">{cartLines.map(({ item, quantity }) => <div className="cart-line" key={item.id} data-testid={`cart-line-${item.id}`}><div><strong>{item.name}</strong><span>{item.price === null ? '₹ — · price pending' : `₹ ${item.price} · listed price`}</span></div><div className="quantity-control"><button aria-label={`Remove one ${item.name}`} onClick={() => setQuantity(item, quantity - 1)} data-testid={`button-cart-decrement-${item.id}`}><Minus size={15} /></button><span>{quantity}</span><button aria-label={`Add one ${item.name}`} onClick={() => setQuantity(item, quantity + 1)} data-testid={`button-cart-increment-${item.id}`}><Plus size={15} /></button></div><button className="remove-line" aria-label={`Remove ${item.name} from basket`} onClick={() => setQuantity(item, 0)} data-testid={`button-remove-${item.id}`}><X size={15} /></button></div>)}</div>
          {cartLines.length === 0 ? <div className="cart-empty"><ShoppingBag size={29} /><p>Your basket is taking a breather.</p><button onClick={() => setCartOpen(false)}>Back to the menu</button></div> : <>
             <div className="price-pending" data-testid="status-price-pending"><span>ORDER TOTAL</span><strong>{hasUnknownPrice ? 'Price pending' : 'Prices listed'}</strong><p>{hasUnknownPrice ? 'Some prices are not listed. Ask the cafe to confirm before placing your order.' : 'Prices are shown per item; please confirm your order total with the cafe.'}</p></div>
            <a className="button button-whatsapp" href={waLink(orderMessage())} target="_blank" rel="noreferrer" onClick={() => setCartOpen(false)} data-testid="link-order-whatsapp"><MessageCircle size={18} /> Ask about this order <ArrowUpRight size={16} /></a>
            <a className="button button-call" href={`tel:${business.phoneLink}`} data-testid="link-order-call"><Phone size={17} /> Call Cafe Square</a>
            <p className="cart-legal">WhatsApp opens with your items and price-pending note. Review and send it there; no order is placed on this site.</p>
          </>}
        </section>
      </div>}

      {lightboxImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Illustrative gallery image" onClick={() => setLightboxIndex(null)} onTouchStart={onGalleryTouchStart} onTouchEnd={onGalleryTouchEnd} data-testid="gallery-lightbox">
        <button className="lightbox-close" aria-label="Close image" onClick={() => setLightboxIndex(null)} data-testid="button-lightbox-close"><X /></button>
        {visibleGallery.length > 1 && <button className="lightbox-nav previous" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); setLightboxIndex((lightboxIndex! - 1 + visibleGallery.length) % visibleGallery.length); }} data-testid="button-lightbox-previous"><ArrowLeft /></button>}
        <figure onClick={(event) => event.stopPropagation()}><img src={lightboxImage.src} alt={lightboxImage.alt} /><figcaption><span>{lightboxImage.title}</span><small>Illustrative placeholder · {lightboxIndex! + 1} / {visibleGallery.length}</small></figcaption></figure>
        {visibleGallery.length > 1 && <button className="lightbox-nav next" aria-label="Next image" onClick={(event) => { event.stopPropagation(); setLightboxIndex((lightboxIndex! + 1) % visibleGallery.length); }} data-testid="button-lightbox-next"><ArrowRight /></button>}
      </div>}
      <div className="mobile-actions" aria-label="Quick actions">
        <a href={`tel:${business.phoneLink}`} aria-label={`Call Cafe Square at ${business.phoneDisplay}`} data-testid="button-floating-call"><Phone size={18} /><span>Call</span></a>
        <a href={waLink('Hello Cafe Square, I have a question.')} target="_blank" rel="noreferrer" aria-label="Message Cafe Square on WhatsApp" data-testid="button-floating-whatsapp"><MessageCircle size={18} /><span>WhatsApp</span></a>
        <a href={mapUrl} target="_blank" rel="noreferrer" aria-label="Get directions to Cafe Square" data-testid="button-floating-directions"><MapPin size={18} /><span>Directions</span></a>
      </div>
      <a className="desktop-whatsapp" href={waLink('Hello Cafe Square, I have a question.')} target="_blank" rel="noreferrer" aria-label="Message Cafe Square on WhatsApp" data-testid="link-desktop-whatsapp"><MessageCircle size={18} /><span>WhatsApp</span></a>
    </div>
  );
}

export default App;