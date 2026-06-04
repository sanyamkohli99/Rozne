import db from "../db";
import * as schema from "../schema";

const medias = [
  {
    id: "1",
    key: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800",
    alt: "Premium Knit Sweaters",
  },
  {
    id: "2",
    key: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
    alt: "Textured Cardigans",
  },
  {
    id: "3",
    key: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
    alt: "Fine Hosiery",
  },
  {
    id: "4",
    key: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800",
    alt: "Knit Accessories",
  },
];

const seedMedias = async () => {
  try {
    await db.delete(schema.medias);
    const insertedMedia = await db
      .insert(schema.medias)
      .values(medias)
      .returning();
    console.log(`Medias are added to the DB.`, insertedMedia);
  } catch (err) {
    console.log("Error happen while inserting Media", err);
  }
};
export default seedMedias;
