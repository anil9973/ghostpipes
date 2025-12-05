/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
	return knex.schema.createTable("push_subscriptions", (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
		table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
		table.text("endpoint").notNullable();
		table.text("p256dh_key").notNullable();
		table.text("auth_key").notNullable();
		table.string("user_agent", 500);
		table.timestamp("last_used_at");
		table.timestamps(true, true);
		table.unique(["user_id", "endpoint"]);
		table.index("user_id");
	});
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
	return knex.schema.dropTableIfExists("push_subscriptions");
}
