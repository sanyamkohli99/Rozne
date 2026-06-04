import { createId } from "@paralleldrive/cuid2";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").notNull().primaryKey(),
  name: text("name"),
  is_admin: boolean("is_admin"),
  email: text("email").unique(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});

export type SelectUserProfiles = InferSelectModel<typeof profiles>;
export type InsertUserProfiles = InferInsertModel<typeof profiles>;

export const carts = pgTable(
  "carts",
  {
    quantity: integer("quantity").notNull(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    selectedSize: text("selected_size"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pkWithCustomName: primaryKey({
        name: "user_poduct_cart_id",
        columns: [table.userId, table.productId],
      }),
      product: foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "cart_to_product",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

export const cartsRelations = relations(carts, ({ one }) => ({
  product: one(products, {
    fields: [carts.productId],
    references: [products.id],
  }),
}));

export const wishlist = pgTable(
  "wishlist",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pkWithCustomName: primaryKey({
        name: "user_wishlist_pk",
        columns: [table.userId, table.productId],
      }),
      product: foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "wishlist_product_fk",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

export type SelectWishlist = InferSelectModel<typeof wishlist>;
export type InsertWishlist = InferInsertModel<typeof wishlist>;

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    profileId: uuid("profileId")
      .notNull()
      .references(() => profiles.id),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      product: foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "comment_to_product",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),

      profile: foreignKey({
        columns: [table.profileId],
        foreignColumns: [profiles.id],
        name: "comment_to_profile",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

export const products = pgTable(
  "products",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    featured: boolean("featured").default(false),
    badge: text("badge", { enum: ["new_product", "best_sale", "featured"] }),
    rating: decimal("rating", { precision: 2, scale: 1 })
      .notNull()
      .default("4"),
    tags: json("tags").$type<string[]>().default([]).notNull(),
    images: json("images").$type<string[]>().default([]).notNull(),
    sizes: json("sizes").$type<string[]>().default([]).notNull(),
    price: decimal("price", { precision: 8, scale: 2 })
      .notNull()
      .default("0.00"),
    totalComments: integer("totalComments").default(0).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    stock: integer("stock").default(8),
    collectionId: text("collection_id").references(() => collections.id, {
      onDelete: "set null",
    }),
    featuredImageId: text("featured_image_id")
      .notNull()
      .references(() => medias.id, { onDelete: "restrict" }),
  },
  (table) => {
    return {
      featuredImage: foreignKey({
        columns: [table.featuredImageId],
        foreignColumns: [medias.id],
        name: "featured_image",
      }),
      collection: foreignKey({
        columns: [table.collectionId],
        foreignColumns: [collections.id],
        name: "collection",
      }),
    };
  },
);

export const productsRelations = relations(products, ({ one, many }) => ({
  featuredImageMedia: one(medias, {
    fields: [products.featuredImageId],
    references: [medias.id],
  }),
  galleryImages: many(productMedias),
}));

export type PaymentStatus = "paid" | "unpaid" | "no_payment_required";

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    email: text("email"),
    name: text("name"),
    user_id: uuid("user_id").references(() => profiles.id, {
      onDelete: "no action",
    }),
    order_status: text("order_status"),
    addressId: text("addressId"),
    stripe_payment_intent_id: text("stripe_payment_intent_id"),
    payment_status: text("payment_status", {
      enum: ["paid", "unpaid", "no_payment_required"],
    }).notNull(),
    payment_method: text("payment_method"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      profile: foreignKey({
        columns: [table.user_id],
        foreignColumns: [profiles.id],
        name: "orders_profiles_fk",
      }),
    };
  },
);

export type SelectOrders = InferSelectModel<typeof orders>;
export type InsertOrders = InferInsertModel<typeof orders>;
export const ordersRelations = relations(orders, ({ one }) => ({
  address: one(address, {
    fields: [orders.addressId],
    references: [address.id],
  }),
}));

export const orderLines = pgTable(
  "order_lines",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    orderId: text("orderId")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 8, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      product: foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "order_lines_to_product",
      })
        .onDelete("restrict")
        .onUpdate("cascade"),
      order: foreignKey({
        columns: [table.orderId],
        foreignColumns: [orders.id],
        name: "order_lines_to_shop_orders",
      })
        .onDelete("restrict")
        .onUpdate("cascade"),
    };
  },
);

export type SelectOrderLines = InferSelectModel<typeof orderLines>;
export type InsertOrderLines = InferInsertModel<typeof orderLines>;

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  product: one(products, {
    fields: [orderLines.productId],
    references: [products.id],
  }),
  orderId: one(orders, {
    fields: [orderLines.productId],
    references: [orders.id],
  }),
}));

export const address = pgTable("address", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  city: text("city"),
  country: text("country"),
  line1: text("line1"),
  line2: text("line2"),
  postal_code: text("postal_code"),
  state: text("state"),
  userProfileId: uuid("userProfileId").references(() => profiles.id, {
    onDelete: "cascade",
  }),
});

export const addressRelations = relations(address, ({ one }) => ({
  profile: one(profiles, {
    fields: [address.userProfileId],
    references: [profiles.id],
  }),
}));
export type InsertAddress = InferInsertModel<typeof address>;

export const productMedias = pgTable(
  "product_medias",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: text("mediaId")
      .notNull()
      .references(() => medias.id, { onDelete: "cascade" }),
    priority: integer("priority"),
  },
  (table) => {
    return {
      product: foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "product_media_to_product",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      media: foreignKey({
        columns: [table.mediaId],
        foreignColumns: [medias.id],
        name: "product_media_to_media",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

export const productMediasRelations = relations(productMedias, ({ one }) => ({
  product: one(products, {
    fields: [productMedias.productId],
    references: [products.id],
  }),
  media: one(medias, {
    fields: [productMedias.mediaId],
    references: [medias.id],
  }),
}));

export type BadgeType = "best_sale" | "featured" | "new_product";

export type SelectProducts = InferSelectModel<typeof products>;
export type InsertProducts = InferInsertModel<typeof products>;

export const collections = pgTable(
  "collections",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    label: varchar("label", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description").notNull(),
    order: integer("order"),
    featuredImageId: text("featured_image_id")
      .notNull()
      .references(() => medias.id, { onDelete: "restrict" }),
  },
  (table) => {
    return {
      featuredImage: foreignKey({
        columns: [table.featuredImageId],
        foreignColumns: [medias.id],
        name: "featured_image",
      }),
    };
  },
);

export type SelectCollection = InferSelectModel<typeof collections>;
export type InsertCollection = InferInsertModel<typeof collections>;

export const medias = pgTable("medias", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  key: varchar("key", { length: 255 }).notNull(),
  alt: varchar("alt", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export type SelectMedia = InferSelectModel<typeof medias>;
export type InsertMedia = InferInsertModel<typeof medias>;
