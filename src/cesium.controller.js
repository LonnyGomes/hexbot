// styles
require('cesium/Widgets/widgets.css');

// load Cesium viewer
import Cesium from 'cesium/Cesium';

export class CesiumController {
    constructor() {
        this.viewer = null;
    }

    initViewer(idName) {
        this.viewer = new Cesium.Viewer(idName);
    }
}
