import https from 'https';
import jsdom from 'jsdom';
import axios from 'axios';
import sslrootCas from 'ssl-root-cas';

const rootCas = sslrootCas.create();
rootCas.addFile('./src/intermediate_syndict.pem');
const httpsAgent = new https.Agent({ ca: rootCas });

async function getResults(term) {
	const url = `https://www.syndict.com/w2p.php?word=${term}&item=hak`;
	const resp = await axios.get(encodeURI(url), { httpsAgent });
	const dom = new jsdom.JSDOM(resp.data);

	/* Check if no results could be found */
	if (dom.window.document.querySelectorAll('.tem_box1').length) {
		return `**No results found for ${term}**`;
	}

	/* Get results group */
	const tem_groups = dom.window.document.querySelectorAll('.tem_group');

	let results = [];
	let i = 1;

	for (let val of tem_groups) {
		let result_string = `\n**Pronunciation ${i++}:**`;

		/* Iterate through each pronunciation, remove white spaces */
		val.querySelectorAll('.yinLi').forEach((a) => {
			result_string +=
				'\n' +
				a.textContent
					.trim()
					.replace(/\s+/g, ' ')
					.replace(/\u200B/g, '');
		});
		result_string += '\n';
		results.push(result_string);
	}

	return results;
}

export default getResults;
