import axios from 'axios';
jest.mock('axios');

import { HexBot } from '../src/HexBot';

const RESULT_1 = { colors: [{ value: '#09D2FC' }] };

describe('HexBot', () => {
    describe('getColors()', () => {
        test('should retrieve one color when arguments are supplied', async () => {
            expect.assertions(2);
            axios.get.mockResolvedValue({ data: RESULT_1 });
            const hexBot = new HexBot();
            const results = await hexBot.getColors();

            expect(results).toBe(RESULT_1);
            expect(results.colors.length).toBe(1);
        });
    });
});
