/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
	return knex.schema.createTable("webhooks", (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
		table.uuid("pipeline_id").notNullable().references("id").inTable("pipelines").onDelete("CASCADE");
		table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
		table.string("webhook_token", 100).notNullable().unique();
		table.string("method", 10).notNullable().defaultTo("POST");
		table.boolean("is_active").defaultTo(true);
		table.jsonb("last_request");
		table.timestamp("last_triggered_at");
		table.integer("trigger_count").defaultTo(0);
		table.timestamps(true, true);
		table.index("webhook_token");
		table.index("pipeline_id");
		table.index("user_id");
	});
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
	return knex.schema.dropTableIfExists("webhooks");
}
