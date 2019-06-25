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

    describe('convertToCoords()', () => {
        test('should throw an error if no arguments are supplied', () => {
            const hexBot = new HexBot();
            expect(() => hexBot.convertToCoords()).toThrow();
        });

        test('should throw an error if an invalid color is supplied', () => {
            const hexBot = new HexBot();
            expect(() => hexBot.convertToCoords('CAFEBABE')).toThrow(
                /Invalid color/
            );
            expect(() => hexBot.convertToCoords('#CAG123')).toThrow(
                /Invalid color/
            );
            expect(() => hexBot.convertToCoords('#CAFE12')).not.toThrow();
            expect(() => hexBot.convertToCoords('#abcd12')).not.toThrow();
        });
    });
});
