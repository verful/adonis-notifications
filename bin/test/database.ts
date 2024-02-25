import Database from '@ioc:Adonis/Lucid/Database'

export async function createUsersTable() {
  await Database.connection().schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary()
  })
}

export async function createNotificationsTable(
  tableName = 'notifications',
  relatedTable = 'users'
) {
  await Database.connection().schema.createTableIfNotExists(tableName, (table) => {
    table.increments('id').primary()
    table
      .integer('notifiable_id')
      .unsigned()
      .references('id')
      .inTable(relatedTable)
      .onDelete('CASCADE')
    table.json('data').notNullable()
    table.timestamp('read_at', { useTz: true })
    table.timestamp('created_at', { useTz: true })
    table.timestamp('updated_at', { useTz: true })
  })
}
