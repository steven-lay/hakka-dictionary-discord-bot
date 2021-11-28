import { parseHTML } from 'linkedom';
import https from 'https';
import axios from 'axios';
import sslrootCas from 'ssl-root-cas';

export async function getSyndictResults(term) {
	const rootCas = sslrootCas.create();
	rootCas.addFile('./src/intermediate_syndict.pem');
	const httpsAgent = new https.Agent({ ca: rootCas });

	const url = `https://www.syndict.com/w2p.php?word=${term}&item=hak`;
	const resp = await axios.get(encodeURI(url), { httpsAgent });
	const { document } = parseHTML(resp.data);

	/* Check if no results could be found */
	if (document.querySelectorAll('.tem_box1').length) {
		return null;
	}

	/* Get results group */
	const temGroups = document.querySelectorAll('.tem_group');

	const results = [];
	let i = 1;

	for (const val of temGroups) {
		let resultString = `\n**Pronunciation ${i++}:**`;

		/* Iterate through each pronunciation, remove white spaces */
		val.querySelectorAll('.yinLi').forEach((a) => {
			resultString += `\n${a.textContent
				.trim()
				.replace(/\s+/g, ' ')
				.replace(/\u200B/g, '')}`;
		});
		resultString += '\n';
		results.push(resultString);
	}

	return results;
}
