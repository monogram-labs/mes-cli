import { fs } from 'zx'
import { DateTime } from 'luxon'

function backupCurrentEnvFile(envFileName) {
	// Make a copy of the current environment variables
	fs.copyFile(`./${envFileName}`, `./${envFileName}.bak`, (err) => {
		if (err) console.log('Error making a backup of the current envrionment variable: ', err)
	})
}

/**
 * Write the new environment variables to the file system
 * @param {*} envFileName
 * @param {*} mesApiKey
 * @param {*} mesProjectId
 * @param {*} latestSyncedVariable
 */
function writeNewEnvFile(envFileName, mesApiKey, mesProjectId, latestSyncedVariable) {
	// Do not modify the spacing inside this block
	let newEnvFile = `### MES - NOSYNC ###
MES_API_KEY=${mesApiKey}
MES_PROJECT_ID=${mesProjectId}
LAST_UPDATE=${DateTime.now().toISO()}
### MES - NOSYNC ###

${latestSyncedVariable}`

	// Finally write the file
	fs.writeFile(`./${envFileName}`, newEnvFile, (err) => {
		if (err) console.log('Error writing new file: ', err)
	})
}

export { backupCurrentEnvFile, writeNewEnvFile }
