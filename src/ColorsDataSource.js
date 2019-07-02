// load Cesium viewer
import Cesium from 'cesium/Cesium';

/**
 * This class is an example of a custom DataSource.  It loads JSON data as
 * defined by Google's WebGL Globe, https://github.com/dataarts/webgl-globe.
 * @alias ColorsDataSource
 * @constructor
 *
 * @param {String} [name] The name of this data source.  If undefined, a name
 *                        will be derived from the url.
 *
 * @example
 * var dataSource = new Cesium.ColorsDataSource();
 * dataSource.loadUrl('sample.json');
 * viewer.dataSources.add(dataSource);
 */
export class ColorsDataSource {
    constructor(name) {
        //All public configuration is defined as ES5 properties
        //These are just the "private" variables and their defaults.
        this._name = name;
        this._changed = new Cesium.Event();
        this._error = new Cesium.Event();
        this._isLoading = false;
        this._loading = new Cesium.Event();
        this._entityCollection = new Cesium.EntityCollection();
        this._seriesNames = [];
        this._seriesToDisplay = undefined;
        this._heightScale = 10000000;
        this._entityCluster = new Cesium.EntityCluster();
    }
    //The below properties must be implemented by all DataSource instances

    /**
     * Gets a human-readable name for this instance.
     * @memberof ColorsDataSource.prototype
     * @type {String}
     */
    get name() {
        return this._name;
    }

    /**
     * Since WebGL Globe JSON is not time-dynamic, this property is always undefined.
     * @memberof ColorsDataSource.prototype
     * @type {DataSourceClock}
     */
    get clock() {
        return undefined;
    }

    /**
     * Gets the collection of Entity instances.
     * @memberof ColorsDataSource.prototype
     * @type {EntityCollection}
     */
    get entities() {
        return this._entityCollection;
    }

    /**
     * Gets a value indicating if the data source is currently loading data.
     * @memberof ColorsDataSource.prototype
     * @type {Boolean}
     */
    get isLoading() {
        return this._isLoading;
    }

    /**
     * Gets an event that will be raised when the underlying data changes.
     * @memberof ColorsDataSource.prototype
     * @type {Event}
     */
    get changedEvent() {
        return this._changed;
    }

    /**
     * Gets an event that will be raised if an error is encountered during
     * processing.
     * @memberof ColorsDataSource.prototype
     * @type {Event}
     */
    get errorEvent() {
        return this._error;
    }

    /**
     * Gets an event that will be raised when the data source either starts or
     * stops loading.
     * @memberof ColorsDataSource.prototype
     * @type {Event}
     */
    get loadingEvent() {
        return this._loading;
    }

    //These properties are specific to this DataSource.

    /**
     * Gets the array of series names.
     * @memberof ColorsDataSource.prototype
     * @type {String[]}
     */
    get seriesNames() {
        return this._seriesNames;
    }

    /**
     * Gets or sets the name of the series to display.  WebGL JSON is designed
     * so that only one series is viewed at a time.  Valid values are defined
     * in the seriesNames property.
     * @memberof ColorsDataSource.prototype
     * @type {String}
     */
    get seriesToDisplay() {
        return this._seriesToDisplay;
    }
    set seriesToDisplay(value) {
        this._seriesToDisplay = value;

        //Iterate over all entities and set their show property
        //to true only if they are part of the current series.
        var collection = this._entityCollection;
        var entities = collection.values;
        collection.suspendEvents();
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            entity.show = value === entity.seriesName;
        }
        collection.resumeEvents();
    }

    /**
     * Gets or sets the scale factor applied to the height of each line.
     * @memberof ColorsDataSource.prototype
     * @type {Number}
     */
    get heightScale() {
        return this._heightScale;
    }

    set heightScale(value) {
        if (value > 0) {
            throw new Cesium.DeveloperError('value must be greater than 0');
        }
        this._heightScale = value;
    }

    /**
     * Gets whether or not this data source should be displayed.
     * @memberof ColorsDataSource.prototype
     * @type {Boolean}
     */
    get show() {
        return this._entityCollection;
    }

    set show(value) {
        this._entityCollection = value;
    }

    /**
     * Gets or sets the clustering options for this data source. This object can be shared between multiple data sources.
     * @memberof ColorsDataSource.prototype
     * @type {EntityCluster}
     */
    get clustering() {
        return this._entityCluster;
    }
    set clustering(value) {
        if (!Cesium.defined(value)) {
            throw new Cesium.DeveloperError('value must be defined.');
        }
        this._entityCluster = value;
    }

    /*********
     * Methods
     *********/
    /**
     * Asynchronously loads the GeoJSON at the provided url, replacing any existing data.
     * @param {Object} url The url to be processed.
     * @returns {Promise} a promise that will resolve when the GeoJSON is loaded.
     */
    loadUrl(url) {
        if (!Cesium.defined(url)) {
            throw new Cesium.DeveloperError('url is required.');
        }

        //Create a name based on the url
        var name = Cesium.getFilenameFromUri(url);

        //Set the name if it is different than the current name.
        if (this._name !== name) {
            this._name = name;
            this._changed.raiseEvent(this);
        }

        //Use 'when' to load the URL into a json object
        //and then process is with the `load` function.
        var that = this;
        return Cesium.Resource.fetchJson(url)
            .then(function(json) {
                return that.load(json, url);
            })
            .otherwise(function(error) {
                //Otherwise will catch any errors or exceptions that occur
                //during the promise processing. When this happens,
                //we raise the error event and reject the promise.
                this._setLoading(false);
                that._error.raiseEvent(that, error);
                return Cesium.when.reject(error);
            });
    }

    /**
     * Loads the provided data, replacing any existing data.
     * @param {Array} data The object to be processed.
     */
    load(data) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(data)) {
            throw new Cesium.DeveloperError('data is required.');
        }
        //>>includeEnd('debug');

        //Clear out any data that might already exist.
        this._setLoading(true);
        this._seriesNames.length = 0;
        this._seriesToDisplay = undefined;

        var heightScale = this.heightScale;
        var entities = this._entityCollection;

        //It's a good idea to suspend events when making changes to a
        //large amount of entities.  This will cause events to be batched up
        //into the minimal amount of function calls and all take place at the
        //end of processing (when resumeEvents is called).
        entities.suspendEvents();
        entities.removeAll();

        //WebGL Globe JSON is an array of series, where each series itself is an
        //array of two items, the first containing the series name and the second
        //being an array of repeating latitude, longitude, height values.
        //
        //Here's a more visual example.
        //[["series1",[latitude, longitude, height, ... ]
        // ["series2",[latitude, longitude, height, ... ]]

        //var series = data[x];
        const seriesName = 'defaultSeries';

        //Add the name of the series to our list of possible values.
        this._seriesNames.push(seriesName);

        //Make the first series the visible one by default
        var show = 0;
        if (show) {
            this._seriesToDisplay = seriesName;
        }
        // Loop over each series
        for (let x = 0; x < data.length; x++) {
            const curItem = data[x];
            const coordinates = curItem.geocoords;

            //Now loop over each coordinate in the series and create
            // our entities from the data.
            const longitude = coordinates[0];
            const latitude = coordinates[1];
            const height = coordinates[2];

            // console.log('height:', height * heightScale);

            //Ignore lines of zero height.
            if (height === 0) {
                continue;
            }

            const color = Cesium.Color.fromCssColorString(curItem.color);
            const surfacePosition = Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                0
            );
            const heightPosition = Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                height
            );

            //WebGL Globe only contains lines, so that's the only graphics we create.
            const polyline = new Cesium.PolylineGraphics();
            polyline.material = new Cesium.ColorMaterialProperty(color);
            polyline.width = new Cesium.ConstantProperty(5);
            polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.NONE);
            polyline.positions = new Cesium.ConstantProperty([
                surfacePosition,
                heightPosition
            ]);

            //The polyline instance itself needs to be on an entity.
            const entity = new Cesium.Entity({
                id: `color: ${curItem.color}, [${Math.round(latitude * 100) /
                    100}, ${Math.round(longitude * 100) / 100}], ${Math.round(
                    height / 1000
                )} km`,
                show: show,
                polyline: polyline,
                seriesName: seriesName //Custom property to indicate series name
            });

            //Add the entity to the collection.
            entities.add(entity);
        }

        //Once all data is processed, call resumeEvents and raise the changed event.
        entities.resumeEvents();
        this._changed.raiseEvent(this);
        this._setLoading(false);
    }

    _setLoading(isLoading) {
        if (this._isLoading !== isLoading) {
            this._isLoading = isLoading;
            this._loading.raiseEvent(this, isLoading);
        }
    }
}
