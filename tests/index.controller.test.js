import { IndexController } from '../src/index.controller';

describe('IndexController', () => {
    describe('constructor', () => {
        test('should instantiate HexBot', () => {
            const controller = new IndexController();

            expect(controller.hexBot).toBeDefined();
        });
    });
});
