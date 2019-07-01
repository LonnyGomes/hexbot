import { HexBot } from './HexBot';

export class IndexController {
    constructor() {
        this.hexBot = new HexBot();
    }

    /**
     * Retrieves geo coordinate/color pairs
     * @param {number} count total number of geocoords/colors to return, with a max of 1,000
     * @returns {Array} array of color/geocoord pairs in for format `{color: '#XXXXXX', gecoords: [0,0,0]}`
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
            geoColors = colors.map(curObj => {
                const rgb = this.hexBot.extractRGB(curObj.value);
                return {
                    color: curObj.value,
                    geocoords: this.hexBot.rgbToCoords(rgb)
                };
            });
        } catch (error) {
            throw error;
        }

        return geoColors;
    }
}
