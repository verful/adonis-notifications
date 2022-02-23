import { DatabaseNotificationRow, HasDatabaseNotificationsModel } from '@ioc:Verful/Notification'

export async function createNotification(
  model: HasDatabaseNotificationsModel,
  overrides?: Partial<DatabaseNotificationRow>
) {
  return model.related('notifications').create({
    data: { title: 'test' },
    ...overrides,
  })
}
