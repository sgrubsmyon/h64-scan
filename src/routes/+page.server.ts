import type { Actions } from './$types';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const filename = formData.get('filename')?.toString()?.trim() || `scan_${Date.now()}`; // Default filename with timestamp if not provided

		console.log('Scanning with filename:', filename);

		try {
			const outputPath = join(process.cwd(), 'static', `${filename}`);
			const command = `
                # 1. Alle Seiten als PNG scannen
                scanimage --source "ADF Duplex" --resolution 300 --format png --page-height 300 \
                    --batch="${outputPath}_%03d.png"
        
                # 2. Zu einem einzelnen PDF zusammenfügen
                img2pdf ${outputPath}_*.png -o ${outputPath}.pdf
        
                # 3. Temporäre PNG-Dateien aufräumen
                rm ${outputPath}_*.png
                `;

			const { stdout, stderr } = await execAsync(command);

      // It seems, stdout is always empty, but normal output goes into stderr, so we should not treat it as an error. Instead, we can check for specific error messages in stderr.
			// if (stderr) {
			// 	return {
			// 		success: false,
			// 		error: stderr
			// 	};
			// }

      if (stderr.includes(' 0 pages scanned')) {
        return {
          success: false,
          error: 'Keine Seiten gescannt'
        };
      }

      if (/error/i.test(stderr)) {
        return {
          success: false,
          error: 'Fehler beim Scannen:\n\n' + stderr
        };
      }

			return {
				success: true,
				filename,
				output: `Scan erfolgreich unter \`${filename}\`.pdf gespeichert!\n\n${stdout}${stdout ? '\n' : ''}\n${stderr}`
			};
		} catch (error) {
			return {
				success: false,
				error: error.message
			};
		}
	}
} satisfies Actions;
