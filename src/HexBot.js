import axios from 'axios';

const END_POINT = 'https://api.noopschallenge.com/hexbot';
const EXOSPHERE_DISTANCE = 100000; // in kilometers

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

    extractRGB(hexColor) {
        const re = /^\#[A-Fa-f0-9]{6}$/;

        if (!hexColor) {
            throw new Error('Must supply a hex color');
        }

        if (!hexColor.match(re)) {
            throw new Error('Invalid color');
        }

        const colorVal = parseInt(hexColor.replace(/#/, '0x'));

        const red = colorVal >> 16;
        const green = (colorVal >> 8) & 0xff;
        const blue = colorVal & 0xff;

        return [red, green, blue];
    }

    rgbToCoords(rgb) {
        if (!rgb) {
            throw new Error('Must supply array of rgb coords');
        }

        if (!Array.isArray(rgb)) {
            throw new Error('Must supply an array');
        }

        if (rgb.length !== 3) {
            throw new Error('Array length should be 3');
        }

        const longitude = (rgb[0] / 255) * 180 - 90;
        const latitude = (rgb[1] / 255) * 360 - 180;
        const altitude = (rgb[2] / 255) * EXOSPHERE_DISTANCE;

        return [longitude, latitude, altitude];
    }
}
