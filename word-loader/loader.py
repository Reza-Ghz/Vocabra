from words import words

import os
import json
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=".env")
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI()
client.api_key = api_key

# Define the system prompt with the JSON schema and instructions
SYSTEM_PROMPT = """
You are an advanced linguistic assistant. For each word in the upcoming list, generate a comprehensive dictionary entry strictly following the JSON schema below.

Output Rules:
Return only a valid JSON array (even for one word).

No extra text, notes, or explanation outside the JSON.

Do not add or omit fields; follow the schema exactly.

Ensure accurate contextual translations, definitions, and examples.

Schema:
json
Copy
Edit
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Dictionary",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "word": { "type": "string" },
      "persian_translations": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "text": { "type": "string" },
            "transliteration": { "type": "string" }
          },
          "required": ["text"]
        }
      },
      "simple_form": { "type": "string" },
      "definition": { "type": "string" },
      "type": {
        "oneOf": [
          { "type": "string" },
          { "type": "array", "items": { "type": "string" } }
        ]
      },
      "other_forms": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "form": { "type": "string" },
            "pos": { "type": "string" }
          },
          "required": ["form"]
        }
      },
      "forms": {
        "type": "object",
        "patternProperties": {
          "^[A-Za-z]+$": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "additionalProperties": false
      },
      "pronunciation": { "type": "string" },
      "synonyms": {
        "type": "array",
        "items": { "type": "string" }
      },
      "antonyms": {
        "type": "array",
        "items": { "type": "string" }
      },
      "examples": {
        "type": "array",
        "items": { "type": "string" }
      },
      "learning_notes": { "type": "string" },
      "collocations": {
        "type": "array",
        "items": { "type": "string" }
      },
      "word_family": {
        "type": "array",
        "items": { "type": "string" }
      },
      "register": { "type": "string" },
      "word_meaning": { "type": "string" }
    },
    "required": ["word", "simple_form", "type", "pronunciation"],
    "additionalProperties": false
  }
}
Requirements:
Translations, collocations, and examples must match meaning and usage context.

Use natural, varied sentences for examples.

Minimums (where applicable):

Synonyms/antonyms: 5 each, if available

Collocations: 5 or more

Register: Choose from "More formal", "Neutral/all situations", "Less formal", or "Slang".

Word tone (word_meaning): Choose from "Positive", "Neutral", or "Negative".

Important Notes:
1. Follow the JSON schema exactly. Do not include extra fields.
2. Output must be a JSON array, even if only one word.
"""


def generate_dictionary_entries(words, model="o4-mini"):
    user_prompt = "List of words:\n" + "\n".join(f"- {w}" for w in words) + "\n\nReturn only the JSON array."

    messages = [
        {"role": "developer", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
    )

    reply = response.choices[0].message.content.strip()

    try:
        data = json.loads(reply)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response: {e}\n\nRaw response:\n{reply}")

    return data


def append_list_to_json_file(file_path, new_items):
    if not isinstance(new_items, list):
        raise ValueError("new_items must be a list")

    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            try:
                data = json.load(file)
                if not isinstance(data, list):
                    raise ValueError("JSON file does not contain a list")
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    data.extend(new_items)

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2)

    logger.info(f"Appended {len(new_items)} items to {file_path}")

def yield_chunks(data, chunk_size=5):
    for i in range(0, len(data), chunk_size):
        yield data[i:i + chunk_size]


DICT_PATH = "dict.json"
if __name__ == "__main__":
    processed_words = set()

    if os.path.exists(DICT_PATH):
        with open(DICT_PATH, "r", encoding="utf-8") as file:
            try:
                existing_entries = json.load(file)
                processed_words = {entry["word"].lower() for entry in existing_entries if "word" in entry}
                logger.info(f"Loaded {len(processed_words)} already processed words.")
            except json.JSONDecodeError:
                logger.warning("dict.json is not valid JSON. Starting fresh.")
                existing_entries = []
                processed_words = set()

    remaining_words = [w for w in words if w and w.lower() not in processed_words]
    logger.info(f"Remaining words to process: {len(remaining_words)}")

    chunks = list(yield_chunks(remaining_words, chunk_size=5))
    i = 0

    while i < len(chunks):
        chunk = chunks[i]
        try:
            logger.info(f"Processing chunk {i + 1}/{len(chunks)}: {chunk}")
            entries = generate_dictionary_entries(chunk)
            append_list_to_json_file(DICT_PATH, entries)
            i += 1
        except Exception as err:
            logger.error(f"Error on chunk {i + 1}/{len(chunks)}: {err}")
            logger.info("Retrying the same chunk...")