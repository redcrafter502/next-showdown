import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const dbFilter = "next-showdown";

function generateEnumName(name: string) {
  return `${dbFilter}_${name}`;
}

export const createTable = pgTableCreator((name) => `${dbFilter}_${name}`);

export const nominationRequestState = pgEnum(
  generateEnumName("nominationRequestState"),
  ["open", "closed"],
);

export const nominationState = pgEnum(
  generateEnumName("nominationState"),
  ["open", "nominated", "revoked"], // revoked is not a really good name
);

export const nominationRequestsTable = createTable(
  "nominationRequests",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    urlId: varchar("urlId", { length: 255 })
      .notNull()
      .unique()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    listName: varchar("listName", { length: 255 }).notNull(),
    traktUserId: varchar("traktUserId", { length: 255 }).notNull(),
    nominatableSeasonCount: integer("nominatableSeasonCount").notNull(),
    state: nominationRequestState("state").default("open").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    urlIdIndex: index("urlIdIndex").on(table.urlId),
  }),
);

export const seasonsTable = createTable(
  "seasons",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nominationRequestId: integer("nominationRequestId").references(
      () => nominationRequestsTable.id,
      { onDelete: "cascade" },
    ),
    traktSeasonId: integer("traktSeasonId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    year: integer("year").notNull(),
    seasonNumber: integer("seasonNumber").notNull(),
  },
  (table) => ({
    nominationRequestIdIndex: index("nominationRequestIdIndex").on(
      table.nominationRequestId,
    ),
  }),
);

export const nominationsTable = createTable(
  "nominations",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    nominationRequestId: integer("nominationRequestId").references(
      () => nominationRequestsTable.id,
      { onDelete: "cascade" },
    ),
    nominatedSeasonId: integer("nominatedSeasonId").references(
      () => seasonsTable.id,
      { onDelete: "cascade" },
    ),
    count: integer("count").notNull(),
    userId: varchar("userId", { length: 255 }).references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    state: nominationState("nominationState").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIndex: index("userIdIndex").on(table.userId),
  }),
);

export const usersTable = createTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});
