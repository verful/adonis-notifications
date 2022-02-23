import { Expect } from '@japa/expect'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import {
  NotifiableModel,
  NotificationChannelsList,
  NotificationContract,
} from '@ioc:Verful/Notification'
import { BaseMailer } from '@ioc:Adonis/Addons/Mail'

declare module '@japa/runner' {
  interface TestContext {
    // notify TypeScript about custom context properties
    expect: Expect
    app: ApplicationContract
    getNotifiable(
      tableName?: string,
      persisted?: boolean
    ): Promise<NotifiableModel & { id: number }>
    getNotification(
      channels?: (keyof NotificationChannelsList)[],
      toDatabase?: Record<string, any>,
      toMail?: InstanceType<typeof BaseMailer>
    ): NotificationContract
    getMailer(subject?: string, target?: string): Promise<InstanceType<typeof BaseMailer>>
  }

  interface Test<Context, TestData> {
    // notify TypeScript about custom test properties
  }
}
