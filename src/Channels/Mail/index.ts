import type MailManager from '@ioc:Adonis/Addons/Mail'
import type { BaseMailer } from '@ioc:Adonis/Addons/Mail'
import { MailChannelConfig, MailChannelContract, NotifiableModel } from '@ioc:Verful/Notification'

const Mail = globalThis[Symbol.for('ioc.use')]('Adonis/Addons/Mail') as typeof MailManager

class MailChannel implements MailChannelContract {
  constructor(private config: MailChannelConfig) {}

  public async send(
    message: InstanceType<typeof BaseMailer>,
    _notifiable: NotifiableModel,
    deferred: boolean = false
  ) {
    message.mailer = Mail.use(this.config.mailer)
    if (deferred) {
      await message.sendLater()
    } else {
      await message.send()
    }
  }
}

export default MailChannel
