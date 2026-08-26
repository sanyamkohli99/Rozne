const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function fix() {
  try {
    await sql`ALTER TABLE products DISABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE collections DISABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE medias DISABLE ROW LEVEL SECURITY;`;
    
    await sql`INSERT INTO medias (id, key, alt) VALUES ('11111111-1111-1111-1111-111111111111', 'public/hero-image.jpg', 'Hero Image') ON CONFLICT DO NOTHING;`;
    await sql`INSERT INTO collections (id, title, label, description, slug, featured_image_id) VALUES ('22222222-2222-2222-2222-222222222222', 'Summer Collection', 'Summer Collection', 'Summer Collection Description', 'summer', '11111111-1111-1111-1111-111111111111') ON CONFLICT DO NOTHING;`;
    await sql`INSERT INTO products (id, name, slug, price, stock, featured, badge, collection_id, featured_image_id) VALUES ('33333333-3333-3333-3333-333333333333', 'Premium White Tee', 'premium-white-tee', 29.99, 100, true, 'new_product', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111') ON CONFLICT DO NOTHING;`;
    
    console.log("Database fixed successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();
