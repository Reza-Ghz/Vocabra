import {Word} from "../models/word";
import initialDict from "./v1/dict.json";
import oct2025Dict from "./v1/dict-251021.json";
import dec2025Dict from "./v1/dict-251223.json";

const wordsData: Word[] = [
    ...(initialDict as unknown as Word[]).slice().reverse(), // later words are newer
    ...(oct2025Dict as unknown as Word[]).slice().reverse(), // words from 21 OCT 2025
    ...(dec2025Dict as unknown as Word[]).slice().reverse(), // words from 23 DEC 2025
];

export default wordsData;