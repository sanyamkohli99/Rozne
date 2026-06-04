import db from "../db";
import * as schema from "../schema";
import { InsertProducts } from "../schema";

const products: InsertProducts[] = [
  {
    id: "1",
    name: "Classic Merino Crewneck",
    slug: "classic-merino-crewneck",
    description: "Our signature crewneck sweater, knit from 100% extra-fine merino wool. Lightweight yet exceptionally warm, perfect for layering or wearing on its own.",
    featured: true,
    badge: "new_product",
    rating: "4.8",
    tags: ["merino", "sweater", "warmth"],
    featuredImageId: "1",
    collectionId: "1",
    stock: 20,
    price: "85.00",
  },
  {
    id: "2",
    name: "Textured Cable Cardigan",
    slug: "textured-cable-cardigan",
    description: "A timeless cable-knit cardigan with a relaxed fit. Features sustainable wood buttons and a thick, cozy texture that feels like a warm hug.",
    rating: "4.5",
    featured: true,
    featuredImageId: "2",
    collectionId: "2",
    badge: "featured",
    stock: 32,
    price: "120.00",
  },
  {
    id: "3",
    name: "Fisherman Rib Sweater",
    slug: "fisherman-rib-sweater",
    featured: true,
    description: "Inspired by traditional maritime knits, this heavy-duty rib sweater is built for the coldest days. Crafted from a durable wool-alpaca blend.",
    rating: "5",
    featuredImageId: "1",
    collectionId: "1",
    stock: 30,
    price: "110.00",
  },
  {
    id: "4",
    name: "Soft Cotton Blend Socks",
    slug: "soft-cotton-blend-socks",
    featured: true,
    description: "The ultimate everyday socks. Reinforced heel and toe for durability, with a soft cotton blend that keeps your feet comfortable all day.",
    rating: "4.2",
    featuredImageId: "3",
    collectionId: "3",
    badge: "best_sale",
    stock: 50,
    price: "15.00",
  },
  {
    id: "5",
    name: "Alpaca Blend Beanie",
    slug: "alpaca-blend-beanie",
    featured: true,
    description: "A soft, slouchy beanie knit from a luxurious alpaca blend. Naturally insulating and incredibly soft against the skin.",
    rating: "5",
    featuredImageId: "4",
    collectionId: "4",
    badge: "best_sale",
    stock: 15,
    price: "35.00",
  },
];

const seedProducts = async () => {
  try {
    await db.delete(schema.products);
    await db
      .insert(schema.products)
      .values(products)
      .onConflictDoNothing()
      .returning();
  } catch (err) {
    console.log("Error happen while inserting collections", err);
  }
};

export default seedProducts;
