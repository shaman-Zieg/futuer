import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
export const wishes = sqliteTable('wishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: text('request_id').notNull().unique(),
  content: text('content').notNull(),
  day: text('day').notNull(),
});
