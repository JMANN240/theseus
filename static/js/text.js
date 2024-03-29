const title_input = document.querySelector('#title-input');
const text_box = document.querySelector('#text');
const buttons_div = document.querySelector('#buttons');

const split_href = window.location.href.split('/');
const text_id = split_href[split_href.length-1];

let save_timeout;

const buildWordButton = (word) => {
    const button = document.createElement('button');
    button.classList.add('dark', 'rounded', 'syn');
    button.innerHTML = word;
    button.addEventListener('click', () => {
        text = text_box.value;
        const last_character = text.slice(text_box.selectionStart-3, text_box.selectionStart)
        const last_word_was_a = last_character == " a ";
        const last_word_was_A = last_character == " A ";
        const new_first_letter = word[0]
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const new_word_starts_with_vowel = vowels.includes(new_first_letter);
        if (new_word_starts_with_vowel && (last_word_was_A || last_word_was_a)) {
            text_box.value = text.slice(0, text_box.selectionStart-1) + "n " + word + text.slice(text_box.selectionEnd, text.length);
        } else {
            text_box.value = text.slice(0, text_box.selectionStart) + word + text.slice(text_box.selectionEnd, text.length);
        }
        handleTextChange();
    });
    return button;
}

const removeSynonyms = () => {
    buttons_div.innerHTML = "";
}

const populateSynonyms = async (word) => {
    const res = await fetch(`/api/thesaurus/${word}`);
    const synonyms = await res.json();
    buttons_div.innerHTML = "";
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
            console.log(def);
            def_div.appendChild(def_header);
            for (const synonym of synonyms[pos][def]) {
                def_div.appendChild(buildWordButton(synonym));
            }
            pos_div.appendChild(def_div);
        }
        buttons_div.appendChild(pos_div);
    }
}

const getText = async () => {
    const text_res = await fetch(`/api/text?id=${text_id}`, {
		method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
	});
	const text_json = await text_res.json();
	if (text_json.text != null) {
		// const text = (raw_text).slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, "\"");
		title_input.value = text_json.title;
		text_box.value = text_json.text;
	}
}

const saveText = async () => {
    text = text_box.value;
    await fetch(`/api/text`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
		body: JSON.stringify({
			id: parseInt(text_id),
			title: title_input.value,
			text: text_box.value
		})
    });
}

const handleTextChange = async () => {
    clearTimeout(save_timeout);
    save_timeout = setTimeout(async () => {
        await saveText();
    }, 1000);
}

title_input.addEventListener('input', handleTextChange)
text_box.addEventListener('input', handleTextChange)

document.addEventListener('click', () => {
    const select_start = text_box.selectionStart;
    const select_end = text_box.selectionEnd;
    const text = text_box.value;
    const active = text_box == document.activeElement;
    const selection = text.substring(select_start, select_end);
    const word = selection.trim();
    if (selection != word) {
        text_box.selectionEnd = select_end - 1;
    }
    if (word != "" && active) {
        populateSynonyms(word);
    } else {
        removeSynonyms();
    }
});

getText();