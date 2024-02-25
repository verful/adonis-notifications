import type { BaseMailer } from '@ioc:Adonis/Addons/Mail'
import { MailChannelConfig, MailChannelContract, NotifiableModel } from '@ioc:Verful/Notification'

class MailChannel implements MailChannelContract {
  constructor(_config: MailChannelConfig) {}

  public async send(
    message: InstanceType<typeof BaseMailer>,
    _notifiable: NotifiableModel,
    deferred: boolean = false
  ) {
    if (deferred) {
      await message.sendLater()
    } else {
      await message.send()
    }
  }
}

export default MailChannel
