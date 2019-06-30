import css from './css/styles.css';
import { CesiumController } from './cesium.controller';
import { IndexController } from './index.controller';

const controller = new IndexController();
const cesium = new CesiumController();

cesium.initViewer('cesiumContainer');
