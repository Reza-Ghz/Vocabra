import React, {useEffect, useState} from 'react';
import './App.scss';
import {Accordion, Button} from 'react-bootstrap';
import wordsDict from './data/v1/dict.json';
import {RecentWordEntry, StoredWord, Word} from "./models/word";
import WordCard from "./components/WordCard";
import RecentWords from "./components/RecentWords";
import SpecialActions from './components/SpecialActions';
import {HISTORY_SIZE, RECENT_WORDS_KEY, RECENT_WORDS_SIZE, STORED_WORDS_KEY} from "./constants";
import {AccordionEventKey} from "react-bootstrap/AccordionContext";
import WeeklyStats from './components/WeeklyStats';

const wordsData = (wordsDict as unknown as Word[]).slice().reverse(); // later words are newer

const enrichWithMeta = (words: Word[]): StoredWord[] =>
    words.map(w => ({
        word: w.word,
        know: null,
        readCount: 0,
    }));

const getInitialDarkMode = (): boolean => {
    return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const App: React.FC = () => {
    const [storedWords, setStoredWords] = useState<StoredWord[]>([]);
    const [activeKey, setActiveKey] = useState<AccordionEventKey | null>(null);
    const [recentWords, setRecentWords] = useState<RecentWordEntry[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode());

    useEffect(() => {
        if (darkMode == null) return;
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    // Respond to system theme changes in real time
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setDarkMode(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem(STORED_WORDS_KEY);
        let merged: StoredWord[];

        if (stored) {
            try {
                const persisted: StoredWord[] = JSON.parse(stored);
                const persistMap = new Map(persisted.map(w => [w.word, w]));
                merged = wordsData.map((w: Word) => {
                    const existing = persistMap.get(w.word);
                    // Add StoredWord properties
                    return existing || {...w, know: null, readCount: 0};
                });
            } catch (e) {
                console.error('Falling back with enrich method. Failed to parse stored words:', e);
                merged = enrichWithMeta(wordsData);
            }
        } else {
            merged = enrichWithMeta(wordsData);
        }
        setStoredWords(sortWords(merged));

        const storedRecent = localStorage.getItem(RECENT_WORDS_KEY);
        if (storedRecent) {
            try {
                const parsed = JSON.parse(storedRecent);
                if (Array.isArray(parsed)) {
                    setRecentWords(parsed.slice(0, HISTORY_SIZE));
                }
            } catch (e) {
                console.error("Failed to parse recent words from localStorage", e);
            }
        }

    }, []);

    useEffect(() => {
        if (storedWords.length) {
            localStorage.setItem(STORED_WORDS_KEY, JSON.stringify(storedWords));
        }
    }, [storedWords]);

    useEffect(() => {
        if (recentWords.length) {
            localStorage.setItem(RECENT_WORDS_KEY, JSON.stringify(recentWords));
        }
    }, [recentWords]);

    const sortWords = (list: StoredWord[]): StoredWord[] =>
        [...list].sort((a, b) => {
            const getMultiplierBasedOnKnow = (word: StoredWord): number => {
                if (word.know === null) return 1; // unread words have the highest priority
                if (!word.know) return 2;
                return 3; // known words have the lowest priority
            };

            const aScore = a.readCount * getMultiplierBasedOnKnow(a);
            const bScore = b.readCount * getMultiplierBasedOnKnow(b);

            return aScore - bScore; // lower score = higher priority
        });


    const handleKnow = (isKnown: boolean) => {
        setStoredWords(prevList => {
            const updated = prevList.map((item, idx) =>
                idx === 0
                    ? {...item, know: isKnown, readCount: item.readCount + 1}
                    : item
            );

            const currentWord = prevList[0].word;
            setRecentWords(prev => {
                const now = new Date().toISOString();
                const newEntry: RecentWordEntry = { word: currentWord, timestamp: now };
                const filtered = prev.filter(entry => entry.word !== currentWord);
                return [newEntry, ...filtered].slice(0, HISTORY_SIZE);
            });


            return sortWords(updated);
        });
        setActiveKey(null);
    };


    const handleAccordionToggle = (key: AccordionEventKey | null): void => {
        setActiveKey(prevKey => (prevKey === key ? null : key));
    };

    if (!storedWords.length) {
        return <div>Loading...</div>;
    }

    const currentStoredWord: StoredWord = storedWords[0];
    const currentWord: Word | undefined = wordsData.find(w => w.word === currentStoredWord.word);

    if (!currentWord) {
        // Handle error or fallback logic
        console.error('Word not found', currentStoredWord);
        return (<div className="container-fluid">Cannot find information for word: {currentStoredWord.word}</div>);
    }

    const buttons = (showDetailsToggle: boolean) => (
        <div>
            <div className="d-flex justify-content-between mt-4 gap-2">
                <Button variant="success" size="sm" onClick={() => handleKnow(true)}>
                    Know
                </Button>

                {showDetailsToggle && (
                    <Button variant="info" size="sm" onClick={() => setActiveKey(null)}>
                        {activeKey ? 'Hide Details' : 'Load Details'}
                    </Button>
                )}

                <Button variant="danger" size="sm" onClick={() => handleKnow(false)}>
                    Don't Know
                </Button>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="my-3" style={{maxWidth: '600px', margin: '0 auto'}}>
                    <div
                        className="flashcard d-flex flex-column justify-content-between border rounded p-3"
                    >
                        <div>

                            <div
                                className="d-flex flex-column flex-sm-row-reverse justify-content-between align-items-start align-items-sm-center mb-2 gap-2">
                                <div className="d-flex align-items-center justify-content-end w-100">
                                    <span className="fw-light h5 m-0 me-2">Total: {wordsData.length}</span>
                                    <button
                                        onClick={() => setDarkMode(prev => !prev)}
                                        aria-label="Toggle Dark Mode"
                                        type="button"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.5rem',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            padding: '0.25rem',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {darkMode ? '🌔' : '🌒'}
                                    </button>
                                </div>
                                <div className={"w-100"}>
                                    <span className="text-capitalize h2 m-0">{currentStoredWord.word} </span>
                                    <span className="fw-light h5 m-0">(Read: {currentStoredWord.readCount})</span>
                                </div>
                            </div>


                            {buttons(false)}
                            <hr className="my-3"/>
                            <Accordion className={"my-3"} activeKey={activeKey} onSelect={handleAccordionToggle}>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Show Word Details</Accordion.Header>
                                    <Accordion.Body>
                                        <WordCard word={currentWord}/>
                                        <hr className="my-3"/>
                                        {buttons(true)}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            <hr className="my-3"/>
                            <SpecialActions/>
                            <RecentWords recentWords={recentWords.slice(0, RECENT_WORDS_SIZE)} wordsData={wordsData}/>
                            <WeeklyStats recentWords={recentWords} />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
