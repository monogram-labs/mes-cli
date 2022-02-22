#! /usr/bin/env node

import { Command } from 'commander'
import { $, argv, cd, chalk, fs, fetch } from 'zx'
import { DateTime } from 'luxon'

import { backupCurrentEnvFile, writeNewEnvFile } from './sync/file.mjs'

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
	.description('Sync the local environment file with the remote environment file')
	.option('-e, --env-file <filename>', 'Path to .env fgduegh dile', '.env.local')
	.action(async () => {
		// Parse options
		const options = program.opts()
		const envFileName = options.envFile || '.env.local'

		// Read the local environment file
		const envFile = await readEnvFile(envFileName)
		const envFileLines = envFile.split('\n')

		// Get the Project ID
		const mesProjectId = envFileLines
			.find((line) => line.startsWith('MES_PROJECT_ID'))
			.split('=')[1]

		// Get the API Key
		const mesApiKey = envFileLines.find((line) => line.startsWith('MES_API_KEY')).split('=')[1]

		// Get the Project Variables from the API
		const projEnvVariables = await getProjectVariables(mesApiKey, mesProjectId)
		const latestSyncedVariable = projEnvVariables?.[0]

		// Get the current environment variables from the file system
		// let currentEnvFileFS = await fs.readFile(`./${envFileName}`, 'utf8', function (err, data) {
		// 	return data.toString()
		// })

		// ------------------------------------------------------------
		const remoteLatestUpdatedAt = DateTime.fromJSDate(new Date(latestSyncedVariable.updatedAt))

		let localFileUpdatedAt = envFileLines
			.find((line) => line.startsWith('LAST_UPDATE'))
			.split('=')[1]
		localFileUpdatedAt = DateTime.fromJSDate(new Date(localFileUpdatedAt))

		// ------------------------------------------------------------

		// Is the local file updated before remote
		if (localFileUpdatedAt < remoteLatestUpdatedAt) {
			// Make a copy of the current environment variables
			backupCurrentEnvFile(envFileName)

			// Write the new environment variables to the file system
			writeNewEnvFile(envFileName, mesApiKey, mesProjectId, latestSyncedVariable?.content)
			return console.log(chalk.green('✅ Changes detected. Local file synced.'))
		} else {
			return console.log(chalk.blue('ℹ️ Local file is updated before remote, no need to sync.'))
		}
	})

program.parse()

async function readEnvFile(envFileName) {
	return await (
		await $`cat ${envFileName}`
	).stdout
}

async function getProjectVariables(apiKey, projectId) {
	let resp = await fetch(`http://localhost:4000/project/${projectId}`, {
		headers: {
			'X-Api-Key': apiKey
		}
	})

	if (resp.ok) {
		let response = await resp.text()
		response = JSON.parse(response)

		return response.envContent
	}
}
