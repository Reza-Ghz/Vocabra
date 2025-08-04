export interface Word {
    word: string;
    persian_translations: {
        text: string;
        transliteration: string;
    }[];
    simple_form: string;
    definition: string;
    type: string | string[];
    other_forms: {
        form: string;
        pos: string;
    }[];
    forms: {
        [key: string]: string[];
    };
    pronunciation: string;
    synonyms: string[];
    antonyms: string[];
    examples: string[];
    learning_notes: string;
    collocations: string[];
    word_family: string[];
    register: string;
    word_meaning: string;
}

export interface StoredWord {
    word: string;
    know: boolean | null;
    readCount: number;
}

export interface RecentWordEntry {
    word: string;
    timestamp: string;
}