import { pgTable, serial, varchar, integer, timestamp, text, jsonb, uuid, primaryKey, boolean, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  avatar_url: varchar('avatar_url', { length: 255 }),
  bio: text('bio'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const scenarios = pgTable('scenarios', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  difficulty: varchar('difficulty', { length: 32 }), // 'easy', 'medium', 'hard'
  category: varchar('category', { length: 64 }), // 'phishing', 'malware', 'insider_threat', etc.
  estimated_duration_minutes: integer('estimated_duration_minutes'),
  learning_objectives: jsonb('learning_objectives'), // array of strings
  start_node: varchar('start_node', { length: 64 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const scenario_nodes = pgTable('scenario_nodes', {
  id: varchar('id', { length: 64 }).primaryKey(),
  scenario_id: varchar('scenario_id', { length: 64 }).notNull().references(() => scenarios.id),
  type: varchar('type', { length: 32 }).notNull(), // 'decision', 'info', 'end'
  text: text('text').notNull(),
  context: text('context'), // additional narrative context
  options: jsonb('options').notNull(), // array of {id, text, next_node, risk_change, feedback_id}
  created_at: timestamp('created_at').defaultNow(),
});

export const user_sessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: integer('user_id').notNull().references(() => users.id),
  scenario_id: varchar('scenario_id', { length: 64 }).notNull().references(() => scenarios.id),
  started_at: timestamp('started_at').defaultNow(),
  ended_at: timestamp('ended_at'),
  current_node: varchar('current_node', { length: 64 }),
  status: varchar('status', { length: 32 }).default('in_progress'), // 'in_progress', 'completed', 'abandoned'
});

export const user_decisions = pgTable('user_decisions', {
  id: serial('id').primaryKey(),
  session_id: uuid('session_id').notNull().references(() => user_sessions.id),
  node_id: varchar('node_id', { length: 64 }).notNull(),
  option_id: varchar('option_id', { length: 64 }).notNull(),
  made_at: timestamp('made_at').defaultNow(),
  risk_change: integer('risk_change').notNull(),
  feedback_id: varchar('feedback_id', { length: 64 }),
  feedback_text: text('feedback_text'),
});

export const user_progress = pgTable('user_progress', {
  user_id: integer('user_id').notNull().references(() => users.id),
  scenario_id: varchar('scenario_id', { length: 64 }).notNull().references(() => scenarios.id),
  completed_at: timestamp('completed_at'),
  final_score: integer('final_score'),
  total_risk: integer('total_risk'),
  decision_count: integer('decision_count'),
  time_taken_seconds: integer('time_taken_seconds'),
  passed: boolean('passed').default(false),
  primaryKey: primaryKey({ columns: ['user_id', 'scenario_id'] })
});

export const action_logs = pgTable('action_logs', {
  id: serial('id').primaryKey(),
  session_id: uuid('session_id').notNull().references(() => user_sessions.id),
  event_type: varchar('event_type', { length: 50 }).notNull(), // 'decision_made', 'node_reached', 'session_started', etc.
  node_id: varchar('node_id', { length: 64 }),
  details: jsonb('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const feedback_library = pgTable('feedback_library', {
  id: varchar('id', { length: 64 }).primaryKey(),
  scenario_id: varchar('scenario_id', { length: 64 }).references(() => scenarios.id),
  feedback_type: varchar('feedback_type', { length: 32 }), // 'immediate', 'summary', 'learning'
  trigger_id: varchar('trigger_id', { length: 64 }), // node_id or option_id that triggers this
  content: text('content').notNull(),
  learning_insights: text('learning_insights'),
  created_at: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(user_sessions),
  progress: many(user_progress),
}));

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  nodes: many(scenario_nodes),
  sessions: many(user_sessions),
}));

export const scenario_nodesRelations = relations(scenario_nodes, ({ one }) => ({
  scenario: one(scenarios, { fields: [scenario_nodes.scenario_id], references: [scenarios.id] }),
}));

export const user_sessionsRelations = relations(user_sessions, ({ one, many }) => ({
  user: one(users, { fields: [user_sessions.user_id], references: [users.id] }),
  scenario: one(scenarios, { fields: [user_sessions.scenario_id], references: [scenarios.id] }),
  decisions: many(user_decisions),
  logs: many(action_logs),
}));

export const user_decisionsRelations = relations(user_decisions, ({ one }) => ({
  session: one(user_sessions, { fields: [user_decisions.session_id], references: [user_sessions.id] }),
});
