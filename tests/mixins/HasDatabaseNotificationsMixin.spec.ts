import { test } from '@japa/runner'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import HasDatabaseNotifications from '../../src/Mixins/HasDatabaseNotifications'
import { createNotificationsTable, createUsersTable } from '../../bin/test/database'
import { createNotification } from '../../bin/test/helpers'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('HasDatabaseNotificationsMixin', (group) => {
  group.each.setup(async () => {
    await createUsersTable()
    await createNotificationsTable()
  })

  group.each.teardown(async () => {
    await Database.connection().truncate('notifications')
    await Database.connection().truncate('users')
  })

  test('Mixin gets applied succesfuly', ({ expect }) => {
    const Mixin = HasDatabaseNotifications('notifications')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }

    expect(Model.$relationsDefinitions.get('notifications')!.relationName).toBe('notifications')
    expect(Model.prototype.markNotificationsAsRead).toEqual(expect.any(Function))
    expect(Model.prototype.markNotificationsAsUnread).toEqual(expect.any(Function))
    expect(Model.prototype.unreadNotifications).toEqual(expect.any(Function))
    expect(Model.prototype.readNotifications).toEqual(expect.any(Function))
  })

  test('Related table comes from mixin argument', ({ expect }) => {
    const Mixin = HasDatabaseNotifications('test')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }

    expect(Model.$relationsDefinitions.get('notifications')!.relatedModel().table).toBe('test')
  })

  test('Can access related notifications', async ({ expect }) => {
    const Mixin = HasDatabaseNotifications('notifications')
    class User extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    await User.boot()

    const user = await User.create({})

    for (let i = 0; i < 5; i++) {
      await createNotification(user)
    }

    await user.load('notifications')
    expect(user.notifications.length).toBe(5)
  })

  test('HasDatabaseNotifications.unreadNotifications', async ({ expect }) => {
    const Mixin = HasDatabaseNotifications('notifications')

    class User extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    await User.boot()

    const user = await User.create({})

    for (let i = 0; i < 5; i++) {
      await createNotification(user)
    }

    const unreadNotifications = await user.unreadNotifications()
    expect(unreadNotifications.length).toBe(5)
  })

  test('HasDatabaseNotifications.readNotifications with no read notifications', async ({
    expect,
  }) => {
    const Mixin = HasDatabaseNotifications('notifications')

    class User extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    await User.boot()

    const user = await User.create({})

    for (let i = 0; i < 5; i++) {
      await createNotification(user)
    }

    const readNotifications = await user.readNotifications()
    expect(readNotifications.length).toBe(0)
  })

  test('HasDatabaseNotifications.readNotifications with read notifications', async ({ expect }) => {
    const Mixin = HasDatabaseNotifications('notifications')

    class User extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    await User.boot()

    const user = await User.create({})

    for (let i = 0; i < 5; i++) {
      await createNotification(user, { readAt: DateTime.now() })
    }

    const readNotifications = await user.readNotifications()
    expect(readNotifications.length).toBe(5)
  })

  test('HasDatabaseNotifications.markNotificationsAsRead', async ({ expect }) => {
    const Mixin = HasDatabaseNotifications('notifications')

    class User extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    await User.boot()

    const user = await User.create({})

    for (let i = 0; i < 5; i++) {
      await createNotification(user)
    }

    await user.markNotificationsAsRead()

    const readNotifications = await user.readNotifications()
    expect(readNotifications.length).toBe(5)
  })

  test('HasDatabaseNotifications.markNotificationsAsUnread', async ({ expect }) => {
    const Mixin = HasDatabaseNotifications('notifications')

    class User extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    await User.boot()

    const user = await User.create({})

    for (let i = 0; i < 5; i++) {
      await createNotification(user)
    }

    await user.markNotificationsAsRead()

    const readNotifications = await user.readNotifications()
    expect(readNotifications.length).toBe(5)

    await user.markNotificationsAsUnread()

    const unreadNotifications = await user.unreadNotifications()
    expect(unreadNotifications.length).toBe(5)
  })
})
