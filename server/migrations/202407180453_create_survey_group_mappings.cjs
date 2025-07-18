/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('survey_group_mappings', (table) => {
    table.increments('id').primary();
    table.integer('survey_group_id').unsigned().references('id').inTable('survey_groups').onDelete('CASCADE');
    table.integer('survey_id').unsigned().references('id').inTable('surveys').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('survey_group_mappings');
};
