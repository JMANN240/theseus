const word_input = document.querySelector('#word');
const synonyms_div = document.querySelector('#synonyms');

const buildWordButton = (word) => {
    const button = document.createElement('button');
    button.classList.add('dark', 'rounded', 'syn');
    button.innerHTML = word;
    return button;
}

const populateSynonyms = async (word) => {
    const res = await fetch(`/api/thesaurus/${word}`);
    const synonyms = await res.json();
    synonyms_div.innerHTML = "";
    for (const pos in synonyms) {
        const pos_div = document.createElement('div');
        pos_div.classList.add('dark', 'rounded', 'flex', 'column', 'start', 'cross-start');
        const pos_header = document.createElement('h1');
        pos_header.classList.add('dark', 'rounded', 'flex', 'pos');
        pos_header.innerHTML = pos;
        pos_div.appendChild(pos_header);
        for (const def in synonyms[pos]) {
            const def_div = document.createElement('div');
            def_div.classList.add('dark', 'rounded', 'flex', 'row', 'wrap', 'start');
            const def_header = document.createElement('h1');
            def_header.classList.add('dark', 'rounded', 'flex', 'def');
            def_header.innerHTML = def.replace(/ {it}/g, "&nbsp;<i>").replace(/{\/it}/g, "</i>");
            def_div.appendChild(def_header);
            for (const synonym of synonyms[pos][def]) {
                def_div.appendChild(buildWordButton(synonym));
            }
            pos_div.appendChild(def_div);
        }
        synonyms_div.appendChild(pos_div);
    }
    if (Object.keys(synonyms).length == 0) {
        advancePointer();
    }
}

let populate_synonyms_timeout;

word_input.addEventListener('input', () => {
    clearTimeout(populate_synonyms_timeout);
    if (word_input.value != "") {
        populate_synonyms_timeout = setTimeout(populateSynonyms, 1000, word_input.value);
    } else {
        populate_synonyms_timeout = setTimeout(() => {
            synonyms_div.innerHTML = "";
        }, 1000);
    }
});