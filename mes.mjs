#! /usr/bin/env node

import { Command } from 'commander'
import { $, argv, cd, chalk, fs, fetch } from 'zx'
$.verbose = false

let packageJson = await fs.readFile('./package.json')
packageJson = JSON.parse(packageJson)

// Commander
const program = new Command()
program.name('mes').description('Monogram Env Sync (`mes`) CLI').version(packageJson.version)

program
	.command('init')
	.description('Initialize a new project')
	.argument('<orgId>', 'Organization ID')
	.argument('<apikey>', "Organization's API Key")
	.action(async (orgId, apikey) => {
		console.log(orgId, apikey)
	})

program
	.command('sync')
	.description('Sync the local environment file with the remote environment file.')
	.option('-e, --env-file <filename>', 'Path to .env file', '.env.local')
	.option('-s, --sync', 'Sync the .env file to the environment with the server')
	.action(async () => {
		// Parse options
		const options = program.opts()
		const envFileName = options.envFile || '.env.local'

		// Read the local environment file
		const envFile = await readEnvFile(envFileName)
		const envFileLines = envFile.split('\n')

		// Get the API Key
		const menvApiKey = envFileLines.find((line) => line.startsWith('MES_API_KEY')).split('=')[1]

		console.log(menvApiKey)
	})

program.parse()

async function readEnvFile(envFileName) {
	return await (
		await $`cat ${envFileName}`
	).stdout
}

async function getProjectDetails() {
	let resp = await fetch(`https://api.menv.com/v1/projects/${argv.projectId}`, {
		headers: {
			'X-Api-Key': menvApiKey
		}
	})
}
