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
	.description('Sync the local environment file with the remote environment file')
	.option('-e, --env-file <filename>', 'Path to .env file', '.env.local')
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
		const latestSyncedVariable = projEnvVariables?.[0]?.content

		// Get the current environment variables from the file system
		let currentEnvFileFS = await fs.readFile(`./${envFileName}`, 'utf8', function (err, data) {
			return data.toString()
		})

		// Make a copy of the current environment variables
		fs.copyFile(`./${envFileName}`, `./${envFileName}.bak`, (err) => {
			if (err) console.log('Error making a backup of the current envrionment variable: ', err)
		})

		// Write the new environment variables to the file system
		let newEnvFile = `### MES - NOSYNC ###
MES_API_KEY=${mesApiKey}
MES_PROJECT_ID=${mesProjectId}
LAST_UPDATE=${new Date().toISOString()}
### MES - NOSYNC ###

${latestSyncedVariable}`

		fs.writeFile(`./${envFileName}`, newEnvFile, (err) => {
			if (err) console.log('Error writing new file: ', err)
		})

		// currentEnvFile = currentEnvFileFS
		console.log('latestSyncedVariable', latestSyncedVariable)
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
