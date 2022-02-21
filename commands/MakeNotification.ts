import { join } from 'path'
import { BaseCommand, args } from '@adonisjs/core/build/standalone'

export default class MakeNotification extends BaseCommand {
  public static commandName = 'make:notification'
  public static description = 'Make a new Notification'

  /**
   * The name of the seeder file.
   */
  @args.string({ description: 'Name of the notification class' })
  public name: string

  /**
   * This command loads the application
   */
  public static settings = {
    loadApp: true,
  }

  /**
   * Execute command
   */
  public async run(): Promise<void> {
    const stub = join(__dirname, '..', 'templates', 'notification.txt')

    this.generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir('app/Notifications')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot)

    await this.generator.run()
  }
}
