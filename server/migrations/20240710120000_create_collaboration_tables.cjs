exports.up = function(knex) {
  return knex.schema
    .createTable('teams', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies').onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .createTable('team_members', table => {
      table.increments('id').primary();
      table.integer('team_id').unsigned().notNullable().references('id').inTable('teams').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('role').notNullable().defaultTo('member'); // e.g., 'admin', 'member'
      table.timestamps(true, true);
    })
    .createTable('survey_shares', table => {
      table.increments('id').primary();
      table.integer('survey_id').unsigned().notNullable().references('id').inTable('surveys').onDelete('CASCADE');
      table.integer('team_id').unsigned().references('id').inTable('teams').onDelete('CASCADE');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('permission').notNullable().defaultTo('view'); // e.g., 'view', 'edit', 'comment'
      table.timestamps(true, true);
      table.unique(['survey_id', 'team_id']);
      table.unique(['survey_id', 'user_id']);
    })
    .createTable('comments', table => {
      table.increments('id').primary();
      table.text('content').notNullable();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('survey_id').unsigned().notNullable().references('id').inTable('surveys').onDelete('CASCADE');
      table.integer('parent_comment_id').unsigned().references('id').inTable('comments').onDelete('CASCADE');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('comments')
    .dropTable('survey_shares')
    .dropTable('team_members')
    .dropTable('teams');
};
