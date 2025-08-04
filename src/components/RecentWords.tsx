import React, { useState } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import {RecentWordEntry, Word} from '../models/word';
import WordCard from './WordCard';

interface Props {
    recentWords: RecentWordEntry[];
    wordsData: Word[];
}

const RecentWords: React.FC<Props> = ({ recentWords, wordsData }) => {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    const wordData = selectedWord
        ? wordsData.find(w => w.word === selectedWord)
        : null;

    return (
        <>
            <Accordion className="my-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Recent Words</Accordion.Header>
                    <Accordion.Body>
                        {recentWords.length === 0 ? (
                            <div className="opacity-50">No recent words yet.</div>
                        ) : (
                            <div className="d-flex flex-wrap gap-2">
                                {recentWords.map(recentWord => (
                                    <Button
                                        key={recentWord.word}
                                        variant="light"
                                        size="sm"
                                        className="text-capitalize px-2 py-1"
                                        onClick={() => setSelectedWord(recentWord.word)}
                                    >
                                        {recentWord.word}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <Modal show={selectedWord !== null} onHide={() => setSelectedWord(null)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className={"text-capitalize"}>{selectedWord}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {wordData ? <WordCard word={wordData} /> : <div>Word not found.</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedWord(null)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default RecentWords;
