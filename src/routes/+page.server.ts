import { fail } from '@sveltejs/kit';
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
			console.log('Output path:', outputPath);
			// const command = `scanimage --format=pdf > ${outputPath}`;
			const command = `
                # 1. Alle Seiten als PNG scannen
                scanimage --source "ADF Duplex" --resolution 300 --format png --page-height 300 \
                    --batch="${outputPath}_%03d.png"
        
                # 2. Zu einem einzelnen PDF zusammenfügen
                img2pdf ${outputPath}_*.png -o ${outputPath}.pdf
        
                # 3. Temporäre PNG-Dateien aufräumen
                rm ${outputPath}_*.png
                `;

			const { stderr } = await execAsync(command);

			if (stderr) {
				return {
					success: false,
					error: stderr
				};
			}

			// return json({ success: true, filename });
			return {
				success: true,
				filename,
				output: `Scan \`${filename}\` erfolgreich durchgeführt`
			};
		} catch (error) {
			return {
				success: false,
				error: error.message
			};
		}
	}
} satisfies Actions;
