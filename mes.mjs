#! /usr/bin/env node

import { Command } from 'commander'
import { $, argv, cd, chalk, fs, fetch } from 'zx'
$.verbose = false

let packageJson = await fs.readFile('./package.json')
packageJson = JSON.parse(packageJson)

// Commander
const program = new Command()
program
	.name('string-util')
	.description('Monogram Env Sync (`mes`) CLI')
	.version(packageJson.version)
program
	.option(
		'-i, --init <orgId> <apikey>',
		'Initialize a new environment file as ".env.local" using the provided org ID and API key'
	)
	.option('-e, --env-file <filename>', 'Path to .env file', '.env.local')
	.option('-s, --sync', 'Sync the .env file to the environment with the server')
program.parse()

// START HERE
const envFile = await readEnvFile()
const envFileLines = envFile.split('\n')

// Get the API Key
const menvApiKey = envFileLines.find((line) => line.startsWith('MES_API_KEY')).split('=')[1]

async function readEnvFile() {
	const envFileName = options.envFile || '.env.local'
	return await (
		await $`cat ${envFileName}`
	).stdout
}

console.log(menvApiKey)

async function getProjectDetails() {
	let resp = await fetch(`https://api.menv.com/v1/projects/${argv.projectId}`, {
		headers: {
			'X-Api-Key': menvApiKey
		}
	})
}

// let resp = await fetch('https://api.chucknorris.io/jokes/random')
// if (resp.ok) {
// 	console.log((await resp.json()).value)
// }
