import test from 'japa'

import { cleanup, setup } from '../test-helpers'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Notification from '../src/Notification'

let app: ApplicationContract

test.group('NotificationManager', (group) => {
  group.beforeEach(async () => {
    app = await setup()
  })

  group.after(async () => {
    await cleanup(app)
  })

  test('can get default mapping name', (assert) => {
    const config = {
      channel: 'test',
      channels: {
        test: {
          driver: 'test',
        },
      },
    }
    const manager = new Notification(app, config as any)

    assert.deepEqual(manager['getDefaultMappingName'](), 'test')
  })

  test('can extend manager', (assert) => {
    const config = {
      channel: 'test',
      channels: {
        test: {
          driver: 'test',
        },
      },
    }
    const manager = new Notification(app, config as any)
    const testChannel = {
      async send(_message: any) {},
    }

    manager.extend('test', () => testChannel)

    assert.deepEqual(manager['getMappingConfig']('test'), { driver: 'test' })
    assert.deepEqual(manager['makeExtendedDriver']('test', 'test'), testChannel)
  })
})
