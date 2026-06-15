-- Insert Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_CUSTOMER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_ADMIN');

-- Insert Users (Password is 'Password@123' BCrypt encrypted: $2a$10$GRLdNijSQ0UM2o6bO22aeeR9uA.89NnB3g6/F5yM./D8Z.0V16d7W)
INSERT INTO users (id, name, email, phone, password, verified) VALUES 
(1, 'Veha Admin', 'admin@veha.com', '9876543210', '$2a$10$GRLdNijSQ0UM2o6bO22aeeR9uA.89NnB3g6/F5yM./D8Z.0V16d7W', TRUE);

INSERT INTO users (id, name, email, phone, password, verified) VALUES 
(2, 'Test Customer', 'customer@veha.com', '9876543211', '$2a$10$GRLdNijSQ0UM2o6bO22aeeR9uA.89NnB3g6/F5yM./D8Z.0V16d7W', TRUE);

-- Map User Roles
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2); -- Admin has ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id) VALUES (2, 1); -- Customer has ROLE_CUSTOMER

-- Insert Carts & Wishlists for seed users
INSERT INTO carts (id, user_id) VALUES (1, 1);
INSERT INTO carts (id, user_id) VALUES (2, 2);
INSERT INTO wishlists (id, user_id) VALUES (1, 1);
INSERT INTO wishlists (id, user_id) VALUES (2, 2);

-- Insert Categories
INSERT INTO categories (id, name, slug, icon) VALUES 
(1, 'Rings', 'rings', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="32" cy="38" r="18"/><path d="M24 22l8-9 8 9z"/><path d="M32 13v9"/></svg>');

INSERT INTO categories (id, name, slug, icon) VALUES 
(2, 'Earrings', 'earrings', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 14a5 5 0 0 1 10 0c0 6-5 6-5 13"/><circle cx="27" cy="42" r="8"/><path d="M37 14a5 5 0 0 1 10 0c0 6-5 6-5 13"/><circle cx="42" cy="42" r="8"/></svg>');

INSERT INTO categories (id, name, slug, icon) VALUES 
(3, 'Necklaces', 'necklaces', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M14 16c6 16 12 22 18 22s12-6 18-22"/><path d="M32 38l-4 8h8z"/><circle cx="32" cy="50" r="3"/></svg>');

INSERT INTO categories (id, name, slug, icon) VALUES 
(4, 'Bracelets', 'bracelets', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.3"><ellipse cx="32" cy="32" rx="22" ry="14"/><ellipse cx="32" cy="32" rx="14" ry="8"/><circle cx="32" cy="18" r="3"/></svg>');

-- Insert Products
INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(1, 4, 'Aria Wave Cuff', 'aria-wave-cuff', 'Protected tarnish-resistant gold wave cuff bracelet.', 1425.00, 2499.00, 43, TRUE, TRUE, 50, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="160" rx="64" ry="11" fill="#000" opacity="0.45" filter="url(#soft)"/><path fill="url(#gold-h)" fill-rule="evenodd" d="M40,98 A60,56 0 1 0 160,98 A60,56 0 1 0 40,98 Z M58,98 A42,38 0 1 1 142,98 A42,38 0 1 1 58,98 Z"/><path d="M62,74 A40,36 0 0 1 132,68" fill="none" stroke="#FFF6D8" stroke-width="3" stroke-linecap="round" opacity="0.5"/><path d="M100,28 L112,44 L100,60 L88,44 Z" fill="url(#diamond)"/><g class="spark" style="animation-delay:.2s"><line x1="118" y1="34" x2="118" y2="46" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><line x1="112" y1="40" x2="124" y2="40" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></g></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(2, 1, 'Lumen Solitaire', 'lumen-solitaire', 'A single brilliant-cut stone raised on a slender band.', 1899.00, 2999.00, 37, TRUE, FALSE, 100, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="166" rx="46" ry="9" fill="#000" opacity="0.45" filter="url(#soft)"/><path fill="url(#gold-h)" fill-rule="evenodd" d="M54,122 A46,46 0 1 0 146,122 A46,46 0 1 0 54,122 Z M67,122 A33,33 0 1 1 133,122 A33,33 0 1 1 67,122 Z"/><path d="M88,76 L112,76 L106,90 L94,90 Z" fill="url(#gold-h)"/><path d="M100,24 L122,46 L100,72 L78,46 Z" fill="url(#diamond)"/><polyline points="78,46 100,54 122,46" fill="none" stroke="#fff" stroke-width="1" opacity="0.6"/><g class="spark"><line x1="126" y1="30" x2="126" y2="44" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="119" y1="37" x2="133" y2="37" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></g></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(3, 2, 'Seraphine Drops', 'seraphine-drops', 'Stunning hand-finished gold drops.', 1650.00, 2799.00, 41, FALSE, TRUE, 40, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="68" cy="150" rx="18" ry="4" fill="#000" opacity="0.4" filter="url(#soft)"/><ellipse cx="132" cy="150" rx="18" ry="4" fill="#000" opacity="0.4" filter="url(#soft)"/><circle cx="68" cy="54" r="6" fill="none" stroke="url(#gold-h)" stroke-width="3"/><path d="M68,62 C44,80 44,120 68,138 C92,120 92,80 68,62 Z" fill="url(#gold-h)"/><path d="M68,72 C50,86 50,116 68,130 C86,116 86,86 68,72 Z" fill="url(#gem)"/><circle cx="132" cy="54" r="6" fill="none" stroke="url(#gold-h)" stroke-width="3"/><path d="M132,62 C108,80 108,120 132,138 C156,120 156,80 132,62 Z" fill="url(#gold-h)"/><path d="M132,72 C114,86 114,116 132,130 C150,116 150,86 132,72 Z" fill="url(#gem)"/></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(4, 3, 'Mira Pendant Chain', 'mira-pendant-chain', 'Minimalist delicate gold pendant chain.', 2150.00, 3499.00, 39, TRUE, TRUE, 30, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="184" rx="26" ry="6" fill="#000" opacity="0.42" filter="url(#soft)"/><path d="M38,44 Q100,150 162,44" fill="none" stroke="url(#gold-h)" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="122" r="6" fill="none" stroke="url(#gold-h)" stroke-width="3"/><path d="M100,130 C84,144 84,168 100,178 C116,168 116,144 100,130 Z" fill="url(#gold-h)"/><path d="M100,138 C88,150 88,166 100,172 C112,166 112,150 100,138 Z" fill="url(#diamond)"/></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(5, 1, 'Celeste Halo Ring', 'celeste-halo-ring', 'Halo ring in 18k rose gold with brilliant CZ stones.', 2299.00, 3799.00, 39, FALSE, FALSE, 25, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="166" rx="46" ry="9" fill="#000" opacity="0.45" filter="url(#soft)"/><path fill="url(#gold-h)" fill-rule="evenodd" d="M54,122 A46,46 0 1 0 146,122 A46,46 0 1 0 54,122 Z M67,122 A33,33 0 1 1 133,122 A33,33 0 1 1 67,122 Z"/><circle cx="100" cy="58" r="20" fill="none" stroke="url(#gold-h)" stroke-width="3"/><path d="M100,42 L112,58 L100,74 L88,58 Z" fill="url(#diamond)"/><circle cx="84" cy="52" r="2.4" fill="url(#diamond)"/><circle cx="116" cy="52" r="2.4" fill="url(#diamond)"/><circle cx="84" cy="66" r="2.4" fill="url(#diamond)"/><circle cx="116" cy="66" r="2.4" fill="url(#diamond)"/></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(6, 2, 'Aurelia Hoops', 'aurelia-hoops', 'Classic silver hoops finished in 925 sterling silver.', 1299.00, 2099.00, 38, FALSE, FALSE, 80, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="70" cy="150" rx="14" ry="4" fill="#000" opacity="0.4" filter="url(#soft)"/><ellipse cx="130" cy="150" rx="14" ry="4" fill="#000" opacity="0.4" filter="url(#soft)"/><circle cx="70" cy="92" r="34" fill="none" stroke="url(#gold-h)" stroke-width="7"/><circle cx="70" cy="92" r="34" fill="none" stroke="#FFF6D8" stroke-width="1.6" opacity="0.4"/><circle cx="130" cy="92" r="34" fill="none" stroke="url(#gold-h)" stroke-width="7"/><circle cx="130" cy="92" r="34" fill="none" stroke="#FFF6D8" stroke-width="1.6" opacity="0.4"/></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(7, 4, 'Noor Tennis Bracelet', 'noor-tennis-bracelet', 'Stunning 925 silver tennis bracelet.', 2899.00, 4499.00, 36, FALSE, TRUE, 15, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="150" rx="60" ry="10" fill="#000" opacity="0.4" filter="url(#soft)"/><path d="M30,100 Q100,70 170,100" fill="none" stroke="url(#gold-h)" stroke-width="6" stroke-linecap="round"/><path d="M30,100 Q100,130 170,100" fill="none" stroke="url(#gold-h)" stroke-width="6" stroke-linecap="round"/><circle cx="52" cy="92" r="5" fill="url(#diamond)"/><circle cx="76" cy="82" r="5.5" fill="url(#diamond)"/><circle cx="100" cy="79" r="6" fill="url(#diamond)"/><circle cx="124" cy="82" r="5.5" fill="url(#diamond)"/><circle cx="148" cy="92" r="5" fill="url(#diamond)"/><g class="spark" style="animation-delay:.5s"><line x1="100" y1="68" x2="100" y2="78" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/><line x1="95" y1="73" x2="105" y2="73" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></g></svg>');

INSERT INTO products (id, category_id, name, slug, description, price, was_price, discount_percent, featured, bestseller, stock, svg_render) VALUES
(8, 3, 'Vela Layered Necklace', 'vela-layered-necklace', 'Multi-layered 18k rose gold necklace.', 2499.00, 3999.00, 38, FALSE, FALSE, 20, 
'<svg class="render" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="180" rx="30" ry="6" fill="#000" opacity="0.4" filter="url(#soft)"/><path d="M44,46 Q100,120 156,46" fill="none" stroke="url(#gold-h)" stroke-width="4" stroke-linecap="round"/><path d="M52,54 Q100,135 148,54" fill="none" stroke="url(#gold-h)" stroke-width="4" stroke-linecap="round"/><path d="M60,62 Q100,150 140,62" fill="none" stroke="url(#gold-h)" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="150" r="5" fill="url(#diamond)"/></svg>');

-- Insert Variants for Lumen Solitaire
INSERT INTO product_variants (id, product_id, variant_type, variant_value, additional_price) VALUES
(1, 2, 'METAL', '22k Yellow Gold', 0.00),
(2, 2, 'METAL', '18k Rose Gold', 150.00),
(3, 2, 'METAL', '925 Silver', -300.00),
(4, 2, 'SIZE', '10', 0.00),
(5, 2, 'SIZE', '12', 0.00),
(6, 2, 'SIZE', '14', 50.00),
(7, 2, 'SIZE', '16', 100.00),
(8, 2, 'SIZE', '18', 150.00);

-- Insert Coupons
INSERT INTO coupons (id, code, discount_value, discount_type, min_amount, expiry_date, active) VALUES
(1, 'VEHA10', 10.00, 'PERCENTAGE', 500.00, '2030-12-31', TRUE);
