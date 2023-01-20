const texts_box = document.querySelector('#texts');
const new_text_button = document.querySelector('#new-text-button');

const getTexts = async () => {
    const texts_res = await fetch(`/api/texts`);
    const texts = await texts_res.json();
    for (const text of texts) {
		const outer_div = document.createElement('div');
		outer_div.classList.add('m0', 'p0', 'flex')
        const text_button = document.createElement('button');
        text_button.classList.add('dark', 'rounded', 'grow');
		text_button.innerHTML = text.title != '' ? text.title : 'Untitled Text';
		text_button.addEventListener('click', () => {
			window.location.href = `/text/${text.id}`
		});
		outer_div.appendChild(text_button)
		const delete_button = document.createElement('button');
		delete_button.classList.add('dark', 'rounded');
		delete_button.innerHTML = "X";
		delete_button.addEventListener('click', async () => {
			console.log("d");
			await fetch(`/api/text`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: parseInt(text.id)
				})
			});
			location.reload();
		});
		outer_div.appendChild(delete_button)
        texts_box.appendChild(outer_div);
    }
}

const populateSynonyms = async (word) => {
    const res = await fetch(`/api/thesaurus/${word}`);
    const synonyms = await res.json();
    
}

new_text_button.addEventListener('click', async () => {
	const new_text_response = await fetch("/api/text/create", {
		method: "POST"
	});
	
	const new_text = await new_text_response.json();
	console.log(new_text);

	window.location.href = `/text/${new_text.id}`
});

getTexts();