import {Word} from "../models/word";
import wordsDictV1 from "./v1/dict.json";

const wordsData: Word[] = [
    ...(wordsDictV1 as unknown as Word[]).slice().reverse(), // later words are newer
];

export default wordsData;