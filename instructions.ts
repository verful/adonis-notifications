import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import pluralize from 'pluralize'
import { join } from 'path'

type InstructionsState = {
  notificationsTableName: string
  notificationsSchemaName: string
  notifiableTableName: string
  channels: ('database' | 'mail')[]
  hasChannel: {
    database: boolean
    mail: boolean
  }
}

const CONTRACTS_PARTIALS_BASE = './contract/partials'

const CONFIG_PARTIALS_BASE = './config/partials'

const CHANNEL_PROMPT_CHOICES = [
  {
    name: 'database' as const,
    message: 'Database',
    hint: '(Stores notifications in a database table)',
  },
  {
    name: 'mail' as const,
    message: 'Mail',
    hint: '(Sends notifications via mail)',
  },
]

function getStub(...paths: string[]) {
  return join(__dirname, 'templates', ...paths)
}

function makeNotificationsMigration(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const migrationsDirectory = app.directoriesMap.get('migrations') || 'database'
  const migrationPath = join(
    migrationsDirectory,
    `${Date.now()}_${state.notificationsTableName}.ts`
  )

  const template = new sink.files.MustacheFile(projectRoot, migrationPath, getStub('migration.txt'))
  if (template.exists()) {
    sink.logger.action('create').skipped(`${migrationPath} file already exists`)
    return
  }

  template.apply(state).commit()
  sink.logger.action('create').succeeded(migrationPath)
}

function makeContract(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const contractsDirectory = app.directoriesMap.get('contracts') || 'contracts'
  const contractPath = join(contractsDirectory, 'notification.ts')

  const template = new sink.files.MustacheFile(
    projectRoot,
    contractPath,
    getStub('contract/contract.txt')
  )
  template.overwrite = true

  const partials: any = {}

  state.channels.forEach((channel) => {
    partials[`${channel}_channel`] = getStub(CONTRACTS_PARTIALS_BASE, `${channel}-channel.txt`)
  })

  template.apply(state).partials(partials).commit()
  sink.logger.action('create').succeeded(contractPath)
}

function makeConfig(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const configDirectory = app.directoriesMap.get('config') || 'config'
  const configPath = join(configDirectory, 'notification.ts')

  const template = new sink.files.MustacheFile(
    projectRoot,
    configPath,
    getStub('config/config.txt')
  )
  template.overwrite = true

  const partials: any = {}

  state.channels.forEach((channel) => {
    partials[`${channel}_channel`] = getStub(CONFIG_PARTIALS_BASE, `${channel}-channel.txt`)
  })

  template.apply(state).partials(partials).commit()
  sink.logger.action('create').succeeded(configPath)
}

async function getChannels(sink: typeof sinkStatic) {
  return sink
    .getPrompt()
    .multiple(
      'Select which channels you want to use for notifications (select using space)',
      CHANNEL_PROMPT_CHOICES,
      {
        validate(choices) {
          return choices && choices.length
            ? true
            : 'Select one or more channels for notifying users'
        },
      }
    )
}

async function getMigrationConsent(sink: typeof sinkStatic): Promise<boolean> {
  return sink.getPrompt().confirm(`You want to create a notifications table?`)
}

async function getNotificationTableName(
  sink: typeof sinkStatic,
  notifiableTableName: string
): Promise<string> {
  const singularNotifiableTableName = pluralize.singular(notifiableTableName)

  return sink.getPrompt().ask('Enter the notifications table name', {
    default: `${singularNotifiableTableName}_notifications`,
    validate(value) {
      return !!value.trim().length
    },
  })
}

async function getNotifiableTableName(sink: typeof sinkStatic): Promise<string> {
  return sink.getPrompt().ask('Enter the table name of the model you want to notify', {
    default: 'users',
    validate(value) {
      return !!value.trim().length
    },
  })
}

export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  const state: InstructionsState = {
    notificationsSchemaName: 'Notifications',
    notificationsTableName: '',
    notifiableTableName: '',
    channels: [],
    hasChannel: {
      database: false,
      mail: false,
    },
  }

  state.channels = await getChannels(sink)
  state.channels.forEach((channel) => (state.hasChannel[channel] = true))

  if (state.hasChannel.database) {
    const notificationMigrationConsent = await getMigrationConsent(sink)

    if (notificationMigrationConsent) {
      state.notifiableTableName = await getNotifiableTableName(sink)
      state.notificationsTableName = await getNotificationTableName(sink, state.notifiableTableName)
      makeNotificationsMigration(projectRoot, app, sink, state)
    }
  }

  makeContract(projectRoot, app, sink, state)
  makeConfig(projectRoot, app, sink, state)
}
