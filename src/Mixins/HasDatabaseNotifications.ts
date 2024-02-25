import { HasMany } from '@ioc:Adonis/Lucid/Orm'
import {
  HasDatabaseNotificationsMixin,
  DatabaseNotificationModel,
  HasDatabaseNotificationsModel as HasDatabaseNotificationsModelContract,
} from '@ioc:Verful/Notification'
import { DateTime } from 'luxon'
import createNotificationModel from '../Models/DatabaseNotification'
import Application from '@adonisjs/core/build/services/app.js'

const { column, hasMany } = Application.container.use('Adonis/Lucid/Orm')

/**
 * This mixin is used to add the notifications relationship to the model
 */
function HasDatabaseNotifications(notificationsTable: string): HasDatabaseNotificationsMixin {
  const DatabaseNotification = createNotificationModel(notificationsTable)

  return (superclass) => {
    return class
      extends superclass
      implements HasDatabaseNotificationsModelContract
    {
      @column({ isPrimary: true })
      public id: any

      @hasMany(() => DatabaseNotification, {
        localKey: 'id',
        foreignKey: 'notifiableId',
      })
      public notifications: HasMany<DatabaseNotificationModel>

      public async readNotifications(this: HasDatabaseNotificationsModel) {
        return this.related('notifications')
          .query()
          .whereNotNull('readAt')
          .orderBy('createdAt', 'desc')
      }

      public async unreadNotifications(this: HasDatabaseNotificationsModel) {
        return this.related('notifications')
          .query()
          .whereNull('readAt')
          .orderBy('createdAt', 'desc')
      }

      public async markNotificationsAsRead(this: HasDatabaseNotificationsModel) {
        await this.related('notifications').query().update({ readAt: DateTime.now().toSQL() })
      }

      public async markNotificationsAsUnread(this: HasDatabaseNotificationsModel) {
        await this.related('notifications').query().update({ readAt: null })
      }
    }
  }
}

export default HasDatabaseNotifications
