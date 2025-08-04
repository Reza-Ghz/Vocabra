import React from 'react';
import { Word } from '../models/word';

interface WordCardProps {
    word: Word;
}

function camelToLabel(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')   // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {

    return (
        <div className="word-card">
            <h3 className="word-title">
                📘 <span className="pronunciation">/{word.pronunciation}/</span>
            </h3>

            <p className="simple-form">🔤 <strong>{word.simple_form}</strong></p>

            {word.definition && (
                <section className="section">
                    <h3>📖 Definition</h3>
                    <p>{word.definition}</p>
                </section>
            )}

            <section className="section">
                <h3>🧬 Type</h3>
                <p>{Array.isArray(word.type) ? word.type.join(', ') : word.type}</p>
            </section>

            {word.persian_translations && (
                <section className="section">
                    <h3>🇮🇷 Persian Translations</h3>
                    <ul>
                        {word.persian_translations.map((t, i) => (
                            <li key={i}>
                                {t.text} {t.transliteration && <em>({t.transliteration})</em>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {word.other_forms?.length > 0 && (
                <section className="section">
                    <h3>🔄 Other Forms</h3>
                    <ul>
                        {word.other_forms.map((f, i) => (
                            <li key={i}>
                                {f.form} {f.pos && <em>({f.pos})</em>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {word.forms && Object.keys(word.forms).length > 0 && (
                <section className="section">
                    <h3>🔠 Verb Forms</h3>
                    <ul>
                        {Object.entries(word.forms).map(([key, forms]) => (
                            <li key={key}>
                                <strong>{camelToLabel(key)}:</strong> {forms.join(', ')}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {word.synonyms?.length > 0 && (
                <section className="section">
                    <h3>🟢 Synonyms</h3>
                    <p>{word.synonyms.join(', ')}</p>
                </section>
            )}

            {word.antonyms?.length > 0 && (
                <section className="section">
                    <h3>🔴 Antonyms</h3>
                    <p>{word.antonyms.join(', ')}</p>
                </section>
            )}

            {word.examples?.length > 0 && (
                <section className="section">
                    <h3>💬 Examples</h3>
                    <ul>
                        {word.examples.map((ex, i) => (
                            <li key={i}>“{ex}”</li>
                        ))}
                    </ul>
                </section>
            )}

            {word.collocations?.length > 0 && (
                <section className="section">
                    <h3>🧩 Collocations</h3>
                    <p>{word.collocations.join(', ')}</p>
                </section>
            )}

            {word.word_family?.length > 0 && (
                <section className="section">
                    <h3>👨‍👩‍👧 Word Family</h3>
                    <p>{word.word_family.join(', ')}</p>
                </section>
            )}

            {word.learning_notes && (
                <section className="section">
                    <h3>📝 Learning Notes</h3>
                    <p>{word.learning_notes}</p>
                </section>
            )}

            {word.register && (
                <section className="section">
                    <h3>🎯 Register</h3>
                    <p>{word.register}</p>
                </section>
            )}

            {word.word_meaning && (
                <section className="section">
                    <h3>🌈 Word Meaning</h3>
                    <p>{word.word_meaning}</p>
                </section>
            )}
        </div>
    );
};

export default WordCard;
