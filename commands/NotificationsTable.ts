import { join } from 'path'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class NotificationsTable extends BaseCommand {
  public static commandName = 'notifications:table'
  public static description = 'Create the notifications table'

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
    const stub = join(__dirname, '..', 'templates', 'migration.txt')

    const name = await this.prompt.ask('Enter the notifications table name', {
      default: 'notifications',
      validate(value) {
        return !!value.trim().length
      },
    })

    const notifiable = await this.prompt.ask(
      'Enter the table name of the model you want to notify',
      {
        default: 'users',
        validate(value) {
          return !!value.trim().length
        },
      }
    )

    this.generator
      .addFile(`${Date.now()}_${name}`)
      .appRoot(this.application.appRoot)
      .destinationDir(this.application.directoriesMap.get('migrations') || 'database')
      .useMustache()
      .stub(stub)
      .apply({
        notificationsSchemaName: 'Notifications',
        notificationsTableName: name,
        notifiableTableName: notifiable,
      })

    await this.generator.run()
  }
}
