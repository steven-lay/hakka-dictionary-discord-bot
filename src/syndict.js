const path = require('path');
const https = require('https');
const jsdom = require('jsdom');
const axios = require('axios');

const rootCas = require('ssl-root-cas').create();

rootCas.addFile(path.resolve(__dirname, 'intermediate_syndict.pem'));
const httpsAgent = new https.Agent({ca: rootCas});

module.exports = 
async function getResults(term) {
    const url = 'https://www.syndict.com/w2p.php?word=' + term + '&item=hak';
    const resp = await axios.default.get(encodeURI(url), { httpsAgent });
    const dom = new jsdom.JSDOM(resp.data);

    /* Check if no results could be found */
    if (dom.window.document.querySelectorAll('.tem_box1').length) {
        return '**No results found for ' + term + '**';
    }

    /* Get results group */
    const tem_groups = dom.window.document.querySelectorAll('.tem_group');

    let result_string = '';
    let i = 1;

    for (let val of tem_groups) {
        result_string += '\n**Pronunciation ' + i++ + ':**';
        
        /* Iterate through each pronunciation, remove white spaces including U+200B */
        val.querySelectorAll('.yinLi').forEach((a) => {
            result_string += '\n' + a.textContent.trim().replace(/\s+/g, " ").replace(/\u200B/g,"");
        })
        result_string += '\n';
    }
    
    return [result_string, i];
}
