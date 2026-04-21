// Drizzle ORM schema definitions

import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const scenarios = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const scenario_nodes = pgTable('scenario_nodes', {
    id: serial('id').primaryKey(),
    scenarioId: serial('scenario_id'),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const user_sessions = pgTable('user_sessions', {
    id: serial('id').primaryKey(),
    userId: serial('user_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const user_decisions = pgTable('user_decisions', {
    id: serial('id').primaryKey(),
    sessionId: serial('session_id'),
    decision: text('decision'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const user_progress = pgTable('user_progress', {
    id: serial('id').primaryKey(),
    userId: serial('user_id'),
    scenarioId: serial('scenario_id'),
    progress: text('progress'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const action_logs = pgTable('action_logs', {
    id: serial('id').primaryKey(),
    userId: serial('user_id'),
    action: text('action'),
    createdAt: timestamp('created_at').defaultNow(),
});
