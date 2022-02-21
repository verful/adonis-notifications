import { column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import {
  NotificationContract,
  DatabaseNotificationModel,
  Notification,
  NotifiableMixin,
} from '@ioc:Verful/Notification'

import { DateTime } from 'luxon'
import DatabaseNotification from '../Models/DatabaseNotification'

/**
 * This trait is used to add the hability to notify a model using any channel
 */
const Notifiable: NotifiableMixin = (superclass) => {
  class NotifiableModel extends superclass {
    @column({ isPrimary: true })
    public id: any

    @hasMany(() => DatabaseNotification, {
      localKey: 'id',
      foreignKey: 'notifiableId',
    })
    public notifications: HasMany<DatabaseNotificationModel>

    public async readNotifications(this: NotifiableModel) {
      return this.related('notifications')
        .query()
        .whereNotNull('readAt')
        .orderBy('createdAt', 'desc')
    }

    public async unreadNotifications(this: NotifiableModel) {
      return this.related('notifications').query().whereNull('readAt').orderBy('createdAt', 'desc')
    }

    public async markNotificationsAsRead(this: NotifiableModel) {
      await this.related('notifications').query().update({ readAt: DateTime.now().toSQL() })
    }

    public async markNotificationsAsUnread(this: NotifiableModel) {
      await this.related('notifications').query().update({ readAt: null })
    }

    public async notify(notification: NotificationContract) {
      Notification.send(this, notification)
    }

    public async notifyLater(notification: NotificationContract) {
      Notification.sendLater(this, notification)
    }
  }
  return NotifiableModel
}

export default Notifiable
