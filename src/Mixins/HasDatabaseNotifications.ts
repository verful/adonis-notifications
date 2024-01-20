import { HasMany } from '@ioc:Adonis/Lucid/Orm'
import {
  HasDatabaseNotificationsMixin,
  DatabaseNotificationModel,
  HasDatabaseNotificationsModel as HasDatabaseNotificationsModelContract,
} from '@ioc:Verful/Notification'
import { DateTime } from 'luxon'
import createNotificationModel from '../Models/DatabaseNotification'

/**
 * This mixin is used to add the notifications relationship to the model
 */
function HasDatabaseNotifications(notificationsTable: string): HasDatabaseNotificationsMixin {
  const DatabaseNotification = createNotificationModel(notificationsTable)

  return (superclass) => {
    return class extends superclass implements HasDatabaseNotificationsModelContract {
      public static boot() {
        if (this.booted) return
        super.boot()

        this.$addNotificationsRelation()
      }

      private static $addNotificationsRelation() {
        const relatedModel = () => DatabaseNotification
        this.$addRelation('notifications', 'hasMany', relatedModel, {
          localKey: 'id',
          foreignKey: 'notifiableId',
        })
      }

      public notifications: HasMany<DatabaseNotificationModel>

      public async readNotifications(this: HasDatabaseNotificationsModelContract) {
        return this.related('notifications')
          .query()
          .whereNotNull('readAt')
          .orderBy('createdAt', 'desc')
      }

      public async unreadNotifications(this: HasDatabaseNotificationsModelContract) {
        return this.related('notifications')
          .query()
          .whereNull('readAt')
          .orderBy('createdAt', 'desc')
      }

      public async markNotificationsAsRead(this: HasDatabaseNotificationsModelContract) {
        await this.related('notifications').query().update({ readAt: DateTime.now().toSQL() })
      }

      public async markNotificationsAsUnread(this: HasDatabaseNotificationsModelContract) {
        await this.related('notifications').query().update({ readAt: null })
      }
    }
  }
}

export default HasDatabaseNotifications
