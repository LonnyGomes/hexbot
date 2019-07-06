import css from './css/styles.css';
import '@babel/polyfill';
import { CesiumController } from './cesium.controller';
import { IndexController } from './index.controller';
import { ColorsDataSource } from './ColorsDataSource';

const controller = new IndexController();
const cesium = new CesiumController();
const dataSource = new ColorsDataSource();

const viewer = cesium.initViewer('cesiumContainer', {
    animation: false,
    timeline: false
});

let timeoutId = null;

// DOM references
const btn = document.getElementById('clrBtn');
const colorCount = document.getElementById('clrCount');
const colorValLbl = document.getElementById('clrVal');

const updateHandler = () => {
    colorValLbl.value = `${colorCount.value} color${
        colorCount.value > 1 ? 's' : ''
    }`;
    delayedGetColors();
};
colorCount.addEventListener('input', updateHandler);

btn.addEventListener('click', () => {
    updateGlobe(colorCount.value);
});

// updates globe with new set of random colors from the HexBot API
const updateGlobe = async (count = 1000) => {
    try {
        const geoColors = await controller.getGeoColors(count);

        dataSource.load(geoColors);
        dataSource.seriesToDisplay = 'defaultSeries';
        viewer.dataSources.removeAll(true);
        viewer.dataSources.add(dataSource);
    } catch (error) {
        console.error('Error', error.message);
    }
};

// add simple debounce logic for input range
const delayedGetColors = () => {
    if (timeoutId) {
        window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => updateGlobe(colorCount.value), 500);
};

// invoke handler manually for the first time
updateHandler();
