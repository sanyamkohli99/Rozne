import db from "../db";
import * as schema from "../schema";

const collections = [
  {
    id: "1",
    label: "Sweaters",
    slug: "sweaters",
    title: "Timeless Knit Sweaters",
    description:
      "Experience ultimate warmth with our premium merino and cashmere sweaters. Handcrafted for comfort and durability.",
    featuredImageId: "1",
  },
  {
    id: "2",
    label: "Cardigans",
    title: "Elegant Textured Cardigans",
    slug: "cardigans",
    description: "Versatile layers for every season. Our cardigans blend classic styles with modern textures.",
    featuredImageId: "2",
  },
  {
    id: "3",
    label: "Hosiery",
    title: "Fine Knit Hosiery",
    slug: "hosiery",
    description: "Soft, breathable, and built to last. Explore our range of fine hosiery crafted from the best yarns.",
    featuredImageId: "3",
    order: 9,
  },
  {
    id: "4",
    label: "Accessories",
    title: "Cozy Knit Accessories",
    slug: "accessories",
    description: "The perfect finishing touch. Shop our collection of beanies, scarves, and mittens.",
    featuredImageId: "4",
  },
];

const seedCollections = async () => {
  try {
    await db.delete(schema.collections);

    const insertedCollections = await db
      .insert(schema.collections)
      .values(collections)
      .onConflictDoNothing()
      .returning();
    if (insertedCollections != null)
      console.log(`collections are added to the DB.`);
  } catch (err) {
    console.log("Error happen while inserting collections", err);
  }
};

export default seedCollections;
