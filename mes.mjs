#! /usr/bin/env node

import { $, argv, cd, chalk, fs, question, fetch } from 'zx'
$.verbose = false

const envFile = await readEnvFile()
const envFileLines = envFile.split('\n')

// Get the API Key
const menvApiKey = envFileLines.find((line) => line.startsWith('MNV_API_KEY')).split('=')[1]

async function readEnvFile() {
	const envFileName = argv.env || '.env.local'
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
