import axios from 'axios';
jest.mock('axios');

import { HexBot } from '../src/HexBot';

const RESULT_1 = { colors: [{ value: '#09D2FC' }] };
const RESULT_3 = {
    colors: [{ value: '#C4FE32' }, { value: '#8FA1E9' }, { value: '#B4BE38' }]
};

describe('HexBot', () => {
    describe('getColors()', () => {
        test('should retrieve one color when no arguments are supplied', async () => {
            expect.assertions(2);
            axios.get.mockResolvedValue({ data: RESULT_1 });
            const hexBot = new HexBot();
            const results = await hexBot.getColors();

            expect(results).toBe(RESULT_1);
            expect(results.colors.length).toBe(1);
        });

        test('should retrieve multiple colors when an argument is supplied', async () => {
            expect.assertions(2);
            axios.get.mockResolvedValue({ data: RESULT_3 });
            const hexBot = new HexBot();
            const results = await hexBot.getColors(3);

            expect(results).toBe(RESULT_3);
            expect(results.colors.length).toBe(3);
        });

        test('should throw an error if a non-number is supplied', async () => {
            axios.get.mockResolvedValue({ data: RESULT_3 });

            const hexBot = new HexBot();
            expect(() => hexBot.getColors('number')).toThrow(
                /A number must be supplied/
            );
        });

        test('should throw an error if a negative value is supplied', async () => {
            axios.get.mockResolvedValue({ data: RESULT_3 });

            const hexBot = new HexBot();
            expect(() => hexBot.getColors(-10)).toThrow();
        });

        test('should throw an error if a value above 1000 is supplied', async () => {
            axios.get.mockResolvedValue({ data: RESULT_3 });

            const hexBot = new HexBot();
            expect(() => hexBot.getColors(1000)).not.toThrow();
            expect(() => hexBot.getColors(1001)).toThrow(/Invalid value/);
        });
    });

    describe('extractRGB()', () => {
        test('should throw an error if no arguments are supplied', () => {
            const hexBot = new HexBot();
            expect(() => hexBot.extractRGB()).toThrow();
        });

        test('should throw an error if an invalid color is supplied', () => {
            const hexBot = new HexBot();
            expect(() => hexBot.extractRGB('CAFEBABE')).toThrow(
                /Invalid color/
            );
            expect(() => hexBot.extractRGB('#CAG123')).toThrow(/Invalid color/);
            expect(() => hexBot.extractRGB('#CAFE12')).not.toThrow();
            expect(() => hexBot.extractRGB('#abcd12')).not.toThrow();
        });

        test('should convert hexColor to reg, green, blue', () => {
            const hexBot = new HexBot();

            expect(hexBot.extractRGB('#000000')).toEqual([0, 0, 0]);
            expect(hexBot.extractRGB('#202020')).toEqual([32, 32, 32]);
            expect(hexBot.extractRGB('#FF0A10')).toEqual([255, 10, 16]);
        });
    });

    describe('rgbToCoords()', () => {
        test('should convert rbg values to lat, lon, and altitude', () => {
            const hexBot = new HexBot();

            expect(hexBot.rgbToCoords([0, 0, 0])).toEqual([-180, -90, 0]);
            expect(hexBot.rgbToCoords([255, 255, 255])).toEqual([
                180,
                90,
                100000
            ]);

            const halfResults = hexBot.rgbToCoords([127.5, 127.5, 127.5]);

            expect(halfResults[0]).toEqual(0);
            expect(halfResults[1]).toEqual(0);
            expect(halfResults[2]).toEqual(50000);
        });

        test('should throw an error if no arguments are supplied', () => {
            const hexBot = new HexBot();

            expect(() => hexBot.rgbToCoords()).toThrow(
                /Must supply array of rgb coords/
            );
        });

        test('should throw an error if array is not supplied', () => {
            const hexBot = new HexBot();

            expect(() => hexBot.rgbToCoords('array')).toThrow(
                /Must supply an array/
            );
        });

        test('should throw an error if array length is not 3', () => {
            const hexBot = new HexBot();

            expect(() => hexBot.rgbToCoords([0, 0])).toThrow(
                /Array length should be 3/
            );
            expect(() => hexBot.rgbToCoords([0, 0, 0])).not.toThrow();
        });
    });
});
