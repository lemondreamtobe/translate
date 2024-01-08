const { exec } = require('child_process');
const { watch } = require('chokidar');
const path = require('path');

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing the command: ${error.message}`);
                reject(error);
            }
            if (stderr) {
                console.error(`Command stderr: ${stderr}`);
                reject(stderr);
            }
            console.log(`Command stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}


export default function translatePlugin() {
    let isTranslating = false;

    return {
        name: 'translate-plugin',
        config(config) {
            const filePath = path.join(process.cwd(), 'src/locale/cn.ts');
            const watcher = watch(filePath);

            console.log(filePath)
            watcher.on('change', async () => {

                if (!isTranslating) {
                    isTranslating = true;
                    console.log(`File ${filePath} has changed. Running "node translate" command...`);
                    await executeCommand('node translate');
                    isTranslating = false;
                    console.log('Translation complete. Restarting the Vite server...');
                }
            });
        },
        async buildStart() {
            console.log('Running "node translate" command...');
            await executeCommand('node translate');
        }
    }
}
