import Notification from '../src/Notification'
import test from 'japa'

import { cleanup, setup } from '../test-helpers'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

let app: ApplicationContract

test.group('Provider', (group) => {
  group.beforeEach(async () => {
    app = await setup()
  })

  group.after(async () => {
    await cleanup(app)
  })

  test('notification is binded', async (assert) => {
    const notification = app.container.use('Verful/Notification')
    assert.instanceOf(notification, Notification)
  })

  test('notifiable is binded', async (assert) => {
    const { default: Notifiable } = await import('../src/Traits/Notifiable')
    const notifiable = app.container.use('Verful/Notification/Mixin')
    assert.equal(Notifiable, notifiable)
  })
})
