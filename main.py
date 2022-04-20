import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.environ['DICTIONARY_API_KEY']

thesaurus_filename = 'thesaurus.json'

app = FastAPI()
api = FastAPI()

app.mount('/static', StaticFiles(directory='static'), name='static')
app.mount('/api', api)

templates = Jinja2Templates(directory='templates')

thesaurus = {}
with open(thesaurus_filename) as thesaurus_file:
    thesaurus = json.load(thesaurus_file)

def addMerriamWebsterWord(word):
    global thesaurus

    res = requests.get(f'https://dictionaryapi.com/api/v3/references/thesaurus/json/{word}?key={API_KEY}')
    res_json = res.json()

    print(res_json)

    try:
        res_words = [word_data for word_data in res_json if word_data['meta']['id'] == word]
    except TypeError as e:
        print(e)
        thesaurus[word] = {}
        with open(thesaurus_filename, 'w') as thesaurus_file:
            json.dump(thesaurus, thesaurus_file, indent=4)
        return thesaurus[word]


    with open(thesaurus_filename) as thesaurus_file:
        thesaurus = json.load(thesaurus_file)

    thesaurus[word] = {res_word['fl']: {definition[0][1]['dt'][0][1]: synonyms for definition, synonyms in zip(res_word['def'][0]['sseq'], res_word['meta']['syns'])} for res_word in res_words}

    with open(thesaurus_filename, 'w') as thesaurus_file:
        json.dump(thesaurus, thesaurus_file, indent=4)
    
    return thesaurus[word]

@app.get('/')
async def index(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@api.get('/thesaurus/{word}')
async def get_synonym(word: str):
    synonyms = thesaurus.get(word.lower(), None)
    if synonyms is None:
        print("We don't have that word yet, asking Merriam-Webster!")
        synonyms = addMerriamWebsterWord(word.lower())
    else:
        print("We have that word, getting it from out local thesaurus")
    return synonyms