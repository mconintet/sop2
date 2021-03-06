define({
    name: 'sop.Application',
    requires: ['sop.Url'],
    init: function (Url) {
        /**
         * @memberof sop
         * @class
         */
        var Application = function () {
            sop.Observable.call(this);
            this.stages = {};

            this.registerEvents([
                'stagesReady',
                'ready'
            ]);

            this._baseUrl = '';

            this.notReadyStage = 0;

            this.previousStage = null;
            this.currentStage = null;

            this.defaultRoute = '';
        };

        sop.extendProto(Application, sop.Observable);

        /**
         * Gets current route, the route is a part of hash string in current url
         *
         * @returns {String} Path string
         */
        Application.prototype.getCurrentRoute = function () {
            var hash = window.location.hash, p = Url.parseHash(hash);
            return p['path'];
        };

        /**
         * Gets viewport
         *
         * @returns {HTMLElement}
         */
        Application.prototype.getViewport = function () {
            return sop.$one('div.viewport');
        };

        /**
         * Dispatches route, shows the stage associative with given route
         *
         * @param route {String} Route string
         */
        Application.prototype.dispatch = function (route) {
            route = route === '' ? this.defaultRoute || '' : route;
            var stage = this.stages[route];
            if (!stage) {
                throw new Error('the stage assorted with route: ' + route + ' does not exist');
            }

            this.previousStage = this.currentStage;
            this.currentStage = stage;

            if (this.previousStage) {
                this.previousStage.fire('beforeHide');
                this.previousStage.fire('afterHide');
            }

            this.currentStage.fire('beforeShow');

            var viewPort = this.getViewport();
            viewPort = viewPort ? viewPort : document.body;

            if (viewPort === document.body) {
                viewPort.innerHTML = stage.render();
            } else {
                var tmpDiv = document.createElement('div');
                tmpDiv.innerHTML = stage.render();
                var newViewport = sop.$one('.viewport', tmpDiv);

                if (!newViewport) {
                    throw new Error('fail to get new viewport');
                }

                viewPort.style.display = 'none';
                viewPort.parentNode.insertBefore(newViewport, viewPort);
                viewPort.parentNode.removeChild(viewPort);
            }

            this.currentStage.fire('afterShow');
        };

        Application.prototype.setBaseUrl = function (url) {
            return this._baseUrl = sop.sTrimR(url, '\\/');
        };

        Application.prototype.getBaseUrl = function () {
            return this._baseUrl;
        };

        /**
         * Registers stage with application, application will init the registered stage automatically
         *
         * @param stage
         */
        Application.prototype.registerStage = function (stage) {
            stage.baseUrl = this._baseUrl + '/views';

            this.stages[stage.route] = stage;
            this.notReadyStage++;

            stage.on('ready', function () {
                this.notReadyStage--;

                if (this.notReadyStage === 0) {
                    this.fire('stagesReady');
                }
            }.bind(this));
        };

        Application.prototype._initStages = function () {
            sop.oForEach(this.stages, function (stage) {
                stage.init();
            });
        };

        Application.prototype._run = function () {
            var me = this;

            var viewport = sop.$one('.viewport');
            if (!viewport) {
                viewport = document.createElement('div');
                viewport.className = 'viewport';
                document.body.appendChild(viewport);
            }


            me.dispatch(me.getCurrentRoute());

            window.addEventListener('hashchange', (function () {
                this.dispatch(this.getCurrentRoute());
            }).bind(this));

            this.fire('ready');

            return this;
        };

        Application.prototype.getStage = function (route) {
            return this.stages[route];
        };

        /**
         * Runs application itself, it will observe 'hashchange' event once all resources are ready
         *
         * @returns {sop.Application}
         */
        Application.prototype.run = function () {
            this.on('stagesReady', (function () {
                this._run();
            }).bind(this));

            this._initStages();

            return this;
        };

        /**
         * @memberof sop
         * @type {sop.Application}
         */
        sop.App = new Application();

        return sop.App;
    }
});