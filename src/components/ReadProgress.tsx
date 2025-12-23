import React, { useMemo } from 'react';
import { Accordion } from 'react-bootstrap';
import { StoredWord } from '../models/word';

interface ReadProgressProps {
    storedWords: StoredWord[];
}

const ReadProgress: React.FC<ReadProgressProps> = ({ storedWords }) => {
    const { maxRead, distribution, studiedCount } = useMemo(() => {
        const max = storedWords.reduce((acc, word) => Math.max(acc, word.readCount), 0);
        const counts = Array.from({ length: max + 1 }, () => 0);

        for (const word of storedWords) {
            counts[word.readCount] += 1;
        }

        const studied = storedWords.filter(word => word.readCount > 0).length;

        return { maxRead: max, distribution: counts, studiedCount: studied };
    }, [storedWords]);

    return (
        <Accordion className="mt-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    📊 Read Progress — <strong className="ms-1">{studiedCount}/{storedWords.length}</strong>
                </Accordion.Header>
                <Accordion.Body>
                    {storedWords.length === 0 ? (
                        <div className="opacity-50">No progress yet.</div>
                    ) : (
                        <ul className="list-unstyled mb-0 justify-text">
                            {distribution.map((count, readCount) => (
                                <li
                                    key={readCount}
                                    className={`d-flex justify-content-between ${count === 0 ? 'opacity-50' : ''}`}
                                    style={{ fontFamily: 'monospace' }}
                                >
                                    <span>
                                        Read {readCount} time{readCount !== 1 ? 's' : ''}
                                    </span>
                                    <span>
                                        {count} word{count !== 1 ? 's' : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {storedWords.length > 0 && (
                        <div className="small opacity-75 mt-2">
                            Max reads on a single word: {maxRead}
                        </div>
                    )}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default ReadProgress;
