/*
 * Copyright (c) 2011 Vinay Pulim <vinay@milewise.com>
 * MIT Licensed
 */

"use strict";

var Client = require('./client').Client,
  Server = require('./server').Server,
  HttpClient = require('./http'),
  security = require('./security'),
  passwordDigest = require('./utils').passwordDigest,
  wsdl = require('./wsdl'),
  WSDL = require('./wsdl').WSDL;

function createCache() {
  var cache: any = {};
  return function (key:any, load:any, callback:any) {
    if (!cache[key]) {
      load(function (err:any, result:any) {
        if (err) {
          return callback(err);
        }
        cache[key] = result;
        callback(null, result);
      });
    } else {
      process.nextTick(function () {
        callback(null, cache[key]);
      });
    }
  };
}
var getFromCache = createCache();

function _requestWSDL(url:any, options:any, callback:any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var openWsdl = wsdl.open_wsdl.bind(null, url, options);

  if (options.disableCache === true) {
    openWsdl(callback);
  } else {
    getFromCache(url, openWsdl, callback);
  }
}

function createClient(url: any, options:any, callback:any, endpoint?:any) {
  if (typeof options === 'function') {
    endpoint = callback;
    callback = options;
    options = {};
  }
  endpoint = options.endpoint || endpoint;
  _requestWSDL(url, options, function(err:any, wsdl:any) {
    callback(err, wsdl && new Client(wsdl, endpoint, options));
  });
}

function listen(server:any, pathOrOptions:any, services:any, xml:any) {
  var options: any = {},
    path = pathOrOptions,
    uri = null;

  if (typeof pathOrOptions === 'object') {
    options = pathOrOptions;
    path = options.path;
    services = options.services;
    xml = options.xml;
    uri = options.uri;
  }

  var wsdl = new WSDL(xml || services, uri, options);
  return new Server(server, path, services, wsdl, options);
}

exports.security = security;
exports.BasicAuthSecurity = security.BasicAuthSecurity;
exports.WSSecurity = security.WSSecurity;
exports.WSSecurityCert = security.WSSecurityCert;
exports.ClientSSLSecurity = security.ClientSSLSecurity;
exports.ClientSSLSecurityPFX = security.ClientSSLSecurityPFX;
exports.BearerSecurity = security.BearerSecurity;
exports.createClient = createClient;
exports.passwordDigest = passwordDigest;
exports.listen = listen;
exports.WSDL = WSDL;

// Export Client and Server to allow customization
exports.Server = Server;
exports.Client = Client;
exports.HttpClient = HttpClient;

var soap = {
  createClient: createClient
}
export default soap;