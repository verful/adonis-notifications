import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'
import MailChannel from '../../src/Channels/Mail'

test.group('MailChannel', (group) => {
  group.each.teardown(async () => {
    Mail.restore()
  })

  test('MailChannel.send', async ({ getMailer, getNotifiable, expect }) => {
    expect.assertions(1)

    const config = {
      driver: 'mail' as const,
      mailer: 'smtp' as const,
    }

    const channel = new MailChannel(config)
    const mailer = await getMailer('MailChannel.send')
    const notifiable = await getNotifiable(undefined, false)

    Mail.trap((message) => {
      expect(message.subject).toBe('MailChannel.send')
    })

    await channel.send(mailer, notifiable)
  })

  test('MailChannel.send with deferred', async ({ getMailer, getNotifiable, expect }) => {
    expect.assertions(1)

    const config = {
      driver: 'mail' as const,
      mailer: 'smtp' as const,
    }

    const channel = new MailChannel(config)
    const mailer = await getMailer('MailChannel.send')
    const notifiable = await getNotifiable()

    Mail.trap((message) => {
      expect(message.subject).toBe('MailChannel.send')
    })

    await channel.send(mailer, notifiable, true)
  })
})
