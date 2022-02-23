import { NotificationContract, RoutesNotificationsMixin } from '@ioc:Verful/Notification'

/**
 * This mixin is used to add the hability to notify a model using any channel, except database
 */
const RoutesNotifications: RoutesNotificationsMixin = (superclass) => {
  return class RoutesNotificationsModel extends superclass {
    public async notify(notification: NotificationContract) {
      const Notification = globalThis[Symbol.for('ioc.use')]('Verful/Notification')
      await Notification.send(this, notification)
    }

    public async notifyLater(notification: NotificationContract) {
      const Notification = globalThis[Symbol.for('ioc.use')]('Verful/Notification')
      await Notification.sendLater(this, notification)
    }
  }
}

export default RoutesNotifications
