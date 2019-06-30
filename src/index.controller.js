import { HexBot } from './HexBot';

export class IndexController {
    constructor() {
        this.hexBot = new HexBot();
    }

    /**
     * Retrieves geo coordinate/color pairs
     * @param {number} count total number of geocoords/colors to return, with a max of 1,000
     * @returns {Array} array of color/geocord pairs
     */
    async getGeoColors(count) {
        if (!count) {
            count = 1000;
        }

        if (isNaN(count)) {
            throw new Error('A number between 1-1,000 must be provided');
        }

        if (count < 1 || count > 1000) {
            throw new Error(
                'Invalid range provided. Numbers must be between 1 and 1000'
            );
        }

        let geoColors = null;
        try {
            const { colors } = await this.hexBot.getColors(count);
            geoColors = colors;
        } catch (error) {
            throw error;
        }

        return geoColors;
    }
}
