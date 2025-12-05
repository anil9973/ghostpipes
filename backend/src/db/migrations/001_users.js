/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
	return knex.schema.createTable("users", (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
		table.string("email", 255).notNullable().unique();
		table.string("password_hash", 255).notNullable();
		table.string("display_name", 100);
		table.timestamps(true, true);
		table.index("email");
	});
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
	return knex.schema.dropTableIfExists("users");
}
