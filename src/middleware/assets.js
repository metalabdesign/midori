import { readFileSync } from 'fs';
import indexBy from 'lodash/collection/indexBy';
import compose from 'lodash/function/compose';
import collect from 'webpack-assets';
import { lookup as mime } from 'mime';

/**
 * [assets description]
 * @type {Array}
 */
let assets = [ ];

/**
 * A URL index for serving all the assets in the generated webpack stats.
 * This makes it very quick to serve a particular file since it's just a single
 * dictionary lookup.
 * @type {Object}
 */
let index = { };

/**
 * Given a webpack stats object, create a new set of assets.
 * @param {[type]} stats [description]
 * @returns {[type]}       [description]
 */
function updater({ serve, base }) {
  if (serve) {
    return (stats) => {
      assets = collect(stats);
      sync(base);
    };
  }
  return (stats) => {
    assets = collect(stats);
  };
}

/**
 * Update the local asset data for serving.
 * @param {String} base Where on disk to find the assets.
 * @returns {[type]} [description]
 */
export function sync(base) {
  assets.forEach(asset => {
    asset.contents = readFileSync(base + asset.name);
    asset.contentType = mime(asset.name);
  });
  index = indexBy(assets, asset => {
    return asset.publicPath + asset.name;
  });
}

/**
 * Serve assets generated by webpack.
 * @returns {Function} Herp.
 */
export function files() {
  return function({ request }) {
    return function(req, res) {
      if (index[req.url]) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.statusCode = 405;
          res.setHeader('Allow', 'GET, HEAD');
          res.setHeader('Content-Length', '0');
          res.end();
        } else {
          const asset = index[req.url];
          res.statusCode = 200;
          res.setHeader('ETag', asset.hash);
          res.setHeader('Content-Length', asset.contents.length);
          res.setHeader('Content-Type', asset.contentType);
          res.end(asset.contents);
        }
      } else {
        request(req, res);
      }
    };
  };
}

export function request() {
  return function(app) {
    const { request } = app;
    return {
      ...app,
      request(req, res) {
        req.assets = assets;
        request(req, res);
      },
    };
  };
}

/**
 * base Path to webpack assets on disk.
 * dev Allow parent process to send new stats object via IPC.
 * serve True to serve webpack assets from publicPath, false otherwise.
 * stats Path to webpack stats JSON file.
 * @returns {Function} Middleware.
 */
export default function({ stats, serve, base, dev } = { }) {
  const update = updater({ serve, base });

  // Standard `webpack` output in production is just a single stats file, so
  // read that and use that for assets.
  if (stats) {
    update(JSON.parse(readFileSync(stats, 'utf8')));
  }

  // `webpack-udev-server` provides events to the process when new assets have
  // been generated for the client portion of the code.
  if (dev) {
    process.on('webpack-stats', update);
  }

  if (serve) {
    return compose(files(), request());
  }

  return request();
}
