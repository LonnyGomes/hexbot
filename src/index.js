import css from './css/styles.css';
import { CesiumController } from './cesium.controller';

const cesium = new CesiumController();

cesium.initViewer('cesiumContainer');
