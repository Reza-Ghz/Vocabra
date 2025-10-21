import {Word} from "../models/word";
import initialDict from "./v1/dict.json";
import octDict from "./v1/dict-251021.json";

const wordsData: Word[] = [
    ...(initialDict as unknown as Word[]).slice().reverse(), // later words are newer
    ...(octDict as unknown as Word[]).slice().reverse(), // words from 21 OCT 2025
];

export default wordsData;