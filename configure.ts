import type Configure from '@adonisjs/core/commands/configure'

import { stubsRoot } from './stubs/main.js'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  // Publish config file
  await codemods.makeUsingStub(stubsRoot, 'config/config.stub', {})

  await codemods.updateRcFile((rcFile) => {
    // Add provider to rc file
  })
}
