/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE9, IE10 and IE11 requires all of the following polyfills. **/
import 'core-js/es/symbol';
import 'core-js/es/object';
import 'core-js/es/function';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/math';
import 'core-js/es/string';
import 'core-js/es/date';
import 'core-js/es/array';
import 'core-js/es/regexp';
import 'core-js/es/map';
import 'core-js/es/set';

// polyfill all `core-js` features, including early-stage proposals:
import "core-js";
// or:
import "core-js/full";
// polyfill all actual features - stable ES, web standards and stage 3 ES proposals:
import "core-js/actual";
import 'core-js/actual/array/from';
import 'core-js/actual/array/group';
import 'core-js/actual/set';        
import 'core-js/actual/promise';    
import 'core-js/actual/structured-clone';
import 'core-js/actual/queue-microtask';
// polyfill only stable features - ES and web standards:
import "core-js/stable";
// polyfill only stable ES features:
import "core-js/es";

// if you want to polyfill `Set`:
// all `Set`-related features, with early-stage ES proposals:
import "core-js/full/set";
// (DOM collections iterator in this case):
import "core-js/stable/set";
// only stable ES features required for `Set`:
import "core-js/es/set";

// if you want to polyfill just required methods:
import "core-js/full/set/intersection";
import "core-js/actual/array/find-last";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// polyfill iterator helpers proposal:
import "core-js/proposals/iterator-helpers";
// polyfill all stage 2+ proposals:
import "core-js/stage/2";

import 'core-js/es';
import 'core-js/proposals/set-methods';
import 'core-js/full/set/map';

import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/esnext.set.difference";
import "core-js/modules/esnext.set.intersection";
import "core-js/modules/esnext.set.is-disjoint-from";
import "core-js/modules/esnext.set.is-subset-of";
import "core-js/modules/esnext.set.is-superset-of";
import "core-js/modules/esnext.set.map";
import "core-js/modules/esnext.set.symmetric-difference";
import "core-js/modules/esnext.set.union";

import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.set';
import 'core-js/modules/es.array.of';
import 'core-js/features/object/entries';

import 'regenerator-runtime/runtime';

import 'promise-polyfill/src/polyfill';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
import 'classlist.js'; // Run `npm install --save classlist.js`.

/** IE10 and IE11 requires the following to support `@angular/animation`. */
import 'web-animations-js'; // Run `npm install --save web-animations-js`.

/** Evergreen browsers require these. **/
import 'core-js/es/reflect';

/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js/dist/zone'; // Included with Angular CLI.

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

/**
 * Date, currency, decimal and percent pipes.
 * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
 */
import 'intl'; // Run `npm install --save intl`.

import 'whatwg-fetch';  //Run npm install whatwg-fetch --save; 
