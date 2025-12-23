import React, { useMemo, useState } from 'react';
import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import { Word } from '../models/word';
import WordCard from './WordCard';

interface SearchWordsProps {
    wordsData: Word[];
}

const MAX_RESULTS = 50;

const buildSearchText = (word: Word): string => {
    const values: string[] = [
        word.word,
        word.simple_form,
        word.definition,
        word.pronunciation,
        word.register,
        word.word_meaning,
        word.learning_notes,
    ];

    const typeValue = Array.isArray(word.type) ? word.type.join(' ') : word.type;
    if (typeValue) values.push(typeValue);

    if (word.persian_translations?.length) {
        values.push(...word.persian_translations.map(t => t.text).filter(Boolean));
        values.push(...word.persian_translations.map(t => t.transliteration).filter(Boolean));
    }

    if (word.other_forms?.length) {
        values.push(...word.other_forms.map(f => f.form).filter(Boolean));
        values.push(...word.other_forms.map(f => f.pos).filter(Boolean));
    }

    if (word.forms && Object.keys(word.forms).length > 0) {
        values.push(...Object.values(word.forms).flat().filter(Boolean));
    }

    if (word.synonyms?.length) values.push(...word.synonyms.filter(Boolean));
    if (word.antonyms?.length) values.push(...word.antonyms.filter(Boolean));
    if (word.examples?.length) values.push(...word.examples.filter(Boolean));
    if (word.collocations?.length) values.push(...word.collocations.filter(Boolean));
    if (word.word_family?.length) values.push(...word.word_family.filter(Boolean));

    return values.join(' ').toLowerCase();
};

const SearchWords: React.FC<SearchWordsProps> = ({ wordsData }) => {
    const [query, setQuery] = useState<string>('');
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);

    const searchableWords = useMemo(() => (
        wordsData.map(word => ({
            word,
            searchText: buildSearchText(word),
        }))
    ), [wordsData]);

    const normalizedQuery = query.trim().toLowerCase();

    const { matches, matchCount } = useMemo(() => {
        if (!normalizedQuery) {
            return { matches: [] as Word[], matchCount: 0 };
        }

        const results: Word[] = [];
        let count = 0;

        for (const entry of searchableWords) {
            if (entry.searchText.includes(normalizedQuery)) {
                count += 1;
                if (results.length < MAX_RESULTS) {
                    results.push(entry.word);
                }
            }
        }

        return { matches: results, matchCount: count };
    }, [normalizedQuery, searchableWords]);

    const showResults = normalizedQuery.length > 0;

    return (
        <>
            <Accordion className="my-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Search Words</Accordion.Header>
                    <Accordion.Body>
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex flex-column flex-sm-row gap-2">
                                <Form.Control
                                    type="search"
                                    placeholder="Search by word, definition, translation..."
                                    value={query}
                                    onChange={event => setQuery(event.target.value)}
                                    aria-label="Search words"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setQuery('')}
                                    disabled={!query.trim()}
                                >
                                    Clear
                                </Button>
                            </div>

                            {!showResults && (
                                <div className="opacity-50">
                                    Start typing to search across words, definitions, and translations.
                                </div>
                            )}

                            {showResults && matchCount === 0 && (
                                <div className="opacity-50">No matches found.</div>
                            )}

                            {showResults && matchCount > 0 && (
                                <>
                                    <div className="small opacity-75">
                                        Showing {matches.length} of {matchCount} matches.
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {matches.map(word => (
                                            <Button
                                                key={word.word}
                                                variant="light"
                                                size="sm"
                                                className="text-capitalize px-2 py-1"
                                                onClick={() => setSelectedWord(word)}
                                            >
                                                {word.word}
                                            </Button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <Modal show={selectedWord !== null} onHide={() => setSelectedWord(null)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="text-capitalize">{selectedWord?.word}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedWord ? <WordCard word={selectedWord} /> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedWord(null)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SearchWords;
