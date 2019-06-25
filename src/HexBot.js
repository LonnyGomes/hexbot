import axios from 'axios';

const END_POINT = 'https://api.noopschallenge.com/hexbot';

export class HexBot {
    constructor() {}

    getColors(count = 1) {
        const url = END_POINT;

        return axios.get(url).then(results => results.data);
    }
}
