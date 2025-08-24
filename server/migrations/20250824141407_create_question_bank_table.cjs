exports.up = function(knex) {
  return knex.schema.createTable('question_bank', function(table) {
    table.increments('id').primary();
    table.string('text').notNullable();
    table.string('type').notNullable();
    table.jsonb('options');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('question_bank');
};
