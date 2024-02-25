import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { createNotificationsTable, createUsersTable } from '../../bin/test/database'
import DatabaseChannel from '../../src/Channels/Database'

test.group('DatabaseChannel', (group) => {
  group.each.setup(async () => {
    await createUsersTable()
    await createNotificationsTable()
  })

  group.each.teardown(async () => {
    await Database.connection().truncate('notifications')
    await Database.connection().truncate('users')
  })

  test('DatabaseChannel.send', async ({ getNotifiable, expect }) => {
    expect.assertions(1)

    const config = {
      driver: 'database' as const,
    }

    const channel = new DatabaseChannel(config)

    const notifiable = await getNotifiable()

    await channel.send(
      {
        title: 'DatabaseChannel.send',
      },
      notifiable
    )
    await notifiable.load('notifications')

    expect(notifiable.notifications.length).toBe(1)
  })
})
