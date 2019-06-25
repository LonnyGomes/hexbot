import axios from 'axios';

const END_POINT = 'https://api.noopschallenge.com/hexbot';

export class HexBot {
    constructor() {}

    getColors(count = 1) {
        if (isNaN(count)) {
            throw new Error('A number must be supplied');
        }

        if (count < 1 || count > 1000) {
            throw new Error('Invalid value. Values must be between 1-1000');
        }
        const url = `${END_POINT}?count=${count}`;

        return axios.get(url).then(results => results.data);
    }

    convertToCoords(hexColor) {
        const re = /^\#[A-Fa-f0-9]{6}$/;

        if (!hexColor) {
            throw new Error('Must supply a hex color');
        }

        if (!hexColor.match(re)) {
            throw new Error('Invalid color');
        }

        return [0, 0, 0];
    }
}
