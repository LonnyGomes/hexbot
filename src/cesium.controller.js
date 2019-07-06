// styles
require('cesium/Widgets/widgets.css');

// load Cesium viewer
import Cesium from 'cesium/Cesium';

export class CesiumController {
    constructor() {
        this.viewer = null;
    }

    initViewer(idName, opts) {
        return (this.viewer = new Cesium.Viewer(idName, opts));
    }

    updateDataSource(dataSource) {
        dataSource.seriesToDisplay = 'defaultSeries';
        this.viewer.dataSources.removeAll(true);
        this.viewer.dataSources.add(dataSource);
    }
}
