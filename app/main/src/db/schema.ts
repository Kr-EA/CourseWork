import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Product = sqliteTable('Product', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    units_bought_amount: integer('units_bought_amount').notNull(),
    units_amount: integer('units_amount').notNull(),
    unit_capacity: text('unit_capacity').notNull(),
    unit_bought_price: real('unit_bought_price').generatedAlwaysAs(
        sql`bought_price * 1.0 / units_bought_amount`
    ),
    bought_price: integer('bought_price').notNull(),
    bought_date: integer('bought_date', {mode: 'timestamp'}).notNull().$defaultFn(() => new Date()),
    expiration_date: integer('expiration_date', {mode: 'timestamp'}).notNull(),
})

export const Sell = sqliteTable('Sell', {
    id: integer('id').primaryKey({autoIncrement: true}),
    sell_date: integer('sell_date', {mode: 'timestamp'}).notNull(),
    sell_price: integer('sell_price').generatedAlwaysAs(sql`sell_unit_price * amount`),
    sell_unit_price: real('sell_unit_price').notNull(),
    amount: integer('amount').notNull(),
    product_id: integer('product').references(() => Product.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
})

export const SellRelation = relations(Sell, ({one}) => ({
    product: one(Product, {
        fields: [Sell.product_id],
        references: [Product.id]
    })
}))

export const ProductRelation = relations(Product, ({many}) => ({
    sells: many(Sell)
}))

export type DB_TNewProduct = typeof Product.$inferInsert
export type DB_TProduct = typeof Product.$inferSelect
export type DB_TNewSell = typeof Sell.$inferInsert
export type DB_TSell = typeof Sell.$inferSelect