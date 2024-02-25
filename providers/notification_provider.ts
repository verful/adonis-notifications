import type { ApplicationService } from '@adonisjs/core/types'

export default class NotificationProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton('notification', async () => {
      const config = this.app.container.resolveBinding('Adonis/Core/Config').get('notification', {})
      const { default: Notification } = await import('../src/notification')
      return new Notification(this.app, config)
    })
    
    this.app.container.singleton('notification.mixins', async () => {
      return {
        Notifiable: require('../src/mixins/notifiable').default,
        RoutesNotifications: require('../src/mixins/routesNotifications').default,
        HasDatabaseNotifications: require('../src/mixins/has_database_notifications').default,
      }
    })
  }
}