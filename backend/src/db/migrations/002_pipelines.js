/**
 * @param {import('knex').Knex} knex
 */
export function up(knex) {
	return knex.schema.createTable("pipelines", (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
		table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");

		// Pipeline metadata
		table.string("title", 255).notNullable();
		table.text("summary");

		// Pipeline definition stored as JSONB
		// Contains: trigger, nodes[], pipes[]
		table.jsonb("definition").notNullable();

		// Sharing and cloning
		table.boolean("is_public").defaultTo(false);
		table.string("share_token", 50).unique();
		table.uuid("cloned_from").references("id").inTable("pipelines").onDelete("SET NULL");
		table.integer("clone_count").defaultTo(0);

		// Timestamps
		table.bigInteger("created_at").notNullable();
		table.bigInteger("updated_at").notNullable();

		// Indexes
		table.index("user_id");
		table.index("share_token");
		table.index("is_public");
		table.index("updated_at");
	});
}

/**
 * @param {import('knex').Knex} knex
 */
export function down(knex) {
	return knex.schema.dropTableIfExists("pipelines");
}
