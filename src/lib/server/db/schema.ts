import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const parkingSpace = pgTable("parkingspace", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  deactivated: boolean("deactivated").notNull(),
  version: integer("version").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  address: text("address").notNull(),
  postNumber: text("post_number").notNull(),
  postCity: text("post_city").notNull(),
  activationTime: text("activation_time").notNull(),
  deactivationTime: text("deactivation_time"),
});
