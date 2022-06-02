import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'
import MailChannel from '../../src/Channels/Mail'

test.group('MailChannel', () => {
  test('MailChannel.send', async ({ getMailer, getNotifiable, expect }) => {
    const mail = Mail.fake()

    expect.assertions(1)

    const config = {
      driver: 'mail' as const,
      mailer: 'smtp' as const,
    }

    const channel = new MailChannel(config)
    const mailer = await getMailer('MailChannel.send')
    const notifiable = await getNotifiable(undefined, false)

    await channel.send(mailer, notifiable)

    expect(mail.exists({ subject: 'MailChannel.send' })).toBe(true)
  })

  test('MailChannel.send with deferred', async ({ getMailer, getNotifiable, expect }) => {
    const mail = Mail.fake()

    expect.assertions(1)

    const config = {
      driver: 'mail' as const,
      mailer: 'smtp' as const,
    }

    const channel = new MailChannel(config)
    const mailer = await getMailer('MailChannel.send with deferred')
    const notifiable = await getNotifiable()

    await channel.send(mailer, notifiable, true)

    expect(mail.exists({ subject: 'MailChannel.send with deferred' })).toBe(true)
  })
})
