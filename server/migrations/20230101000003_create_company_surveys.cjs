exports.up = function(knex) {
  return knex.schema.createTable('company_surveys', table => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('survey_id').unsigned().notNullable().references('id').inTable('surveys').onDelete('CASCADE');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('company_surveys');
};
