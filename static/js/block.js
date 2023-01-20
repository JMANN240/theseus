const text_box = document.querySelector('#text');
const buttons_div = document.querySelector('#buttons');

let advancePointer = () => {
    word_index += 1;
    displayCurrentWords();
}

const buildGoButton = () => {
    const go_button = document.createElement('button');
    go_button.classList.add('dark', 'rounded', 'syn');
    go_button.innerHTML = "Go";

    go_button.addEventListener('click', () => {
        original_text = text_box.value.trim();
        words = getWords(original_text);
        spaces = getSpaces(original_text);
        displayCurrentWords();
    });

    return go_button;
}

const buildNoChangeButton = (word) => {
    const button = document.createElement('button');
    button.classList.add('dark', 'rounded', 'syn');
    button.innerHTML = '____';
    button.addEventListener('click', () => {
        advancePointer();
    });
    return button;
}

const buildWordButton = (word) => {
    const button = document.createElement('button');
    button.classList.add('dark', 'rounded', 'syn');
    button.innerHTML = word;
    button.addEventListener('click', () => {
        const not_first_word = word_index > 0;
        if (not_first_word) {
            const new_first_letter = word[0]
            const vowels = ['a', 'e', 'i', 'o', 'u'];
            const new_word_starts_with_vowel = vowels.includes(new_first_letter);
            const last_word_was_a = words[word_index-1] == "a";
            const last_word_was_A = words[word_index-1] == "A";
            if (new_word_starts_with_vowel) {
                if (last_word_was_A) {
                    words[word_index-1] = "An";
                } else if (last_word_was_a) {
                    words[word_index-1] = "an";
                }
            }
        }
        words[word_index] = word;
        advancePointer();
    });
    return button;
}

const populateGoButton = () => {
    buttons_div.innerHTML = "";
    buttons_div.appendChild(buildGoButton());
}

const populateSynonyms = async (word) => {
    const res = await fetch(`/api/thesaurus/${word}`);
    const synonyms = await res.json();
    buttons_div.innerHTML = "";
    buttons_div.appendChild(buildNoChangeButton());
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
        buttons_div.appendChild(pos_div);
    }
    if (Object.keys(synonyms).length == 0) {
        advancePointer();
    }
}

const getWords = (text) => {
    return text.split(/\W+/).filter(w => w != '')??[];
}

const getSpaces = (text) => {
    return text.match(/\W+/g)??[];
}

const zip = (left, right) => {
    let l = left.slice();
    let r = right.slice();
    let result = [];
    while (l.length > 0 || r.length > 0) {
        if (l.length > 0) {
            result.push(l.shift());
        }
        if (r.length > 0) {
            result.push(r.shift());
        }
    }
    return result;
}

let word_index = 0;
let original_text;
let words;
let spaces;

let displayCurrentWords = () => {
    if (word_index < words.length) {
        const display_words = words.slice();
        display_words[word_index] = `[${display_words[word_index]}]`;
        const displayed_text = zip(display_words, spaces).join('');
        text_box.value = displayed_text;
        populateSynonyms(words[word_index]);
    } else {
        const displayed_text = zip(words, spaces).join('');
        text_box.value = displayed_text;
        word_index = 0;
        populateGoButton();
    }
}

populateGoButton();