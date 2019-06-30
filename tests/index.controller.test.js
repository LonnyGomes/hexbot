import { IndexController } from '../src/index.controller';

describe('IndexController', () => {
    describe('constructor', () => {
        test('should instantiate HexBot', () => {
            const controller = new IndexController();

            expect(controller.hexBot).toBeDefined();
        });
    });

    describe('getGeoColors()', () => {
        test('should throw error if a non-number is provided', async () => {
            const controller = new IndexController();
            const errMsg = /A number between/;

            expect.assertions(2);
            try {
                await controller.getGeoColors('number');
            } catch (e) {
                expect(e.message).toMatch(errMsg);
            }

            try {
                await controller.getGeoColors([1, 2, 3]);
            } catch (e) {
                expect(e.message).toMatch(errMsg);
            }
        });

        test('should throw an error if number is out of bounds', async () => {
            const controller = new IndexController();
            const errMsg = /Invalid range provided/;

            expect.assertions(2);
            try {
                await controller.getGeoColors(-1);
            } catch (e) {
                expect(e.message).toMatch(errMsg);
            }

            try {
                await controller.getGeoColors(1001);
            } catch (e) {
                expect(e.message).toMatch(errMsg);
            }
        });

        test('should retrieve colors/geo coordinate pairs', async () => {
            const controller = new IndexController();

            controller.hexBot.getColors = jest.fn();

            controller.hexBot.getColors.mockResolvedValue({
                colors: [
                    { value: '#8CD7F3' },
                    { value: '#1DF195' },
                    { value: '#64BF06' },
                    { value: '#7ED6DC' },
                    { value: '#CE5220' },
                    { value: '#C6736D' },
                    { value: '#16E2AF' },
                    { value: '#DDD5EF' },
                    { value: '#FFC427' },
                    { value: '#0069C6' }
                ]
            });

            const geoColors = await controller.getGeoColors();
            expect(geoColors.length).toEqual(10);
        });
    });
});
