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

const init = async () => {
    try {
        const geoColors = await controller.getGeoColors();

        dataSource.load(geoColors);
        dataSource.seriesToDisplay = 'defaultSeries';
        viewer.dataSources.add(dataSource);
    } catch (error) {
        console.error('Error', error.message);
    }
};

init();
