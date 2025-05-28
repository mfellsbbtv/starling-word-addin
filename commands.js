/******/ (function() { // webpackBootstrap
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/************************************************************************/
/*!**********************************!*\
  !*** ./src/commands/commands.js ***!
  \**********************************/
/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global global, Office, self, window */

Office.onReady(function () {
  // If needed, Office.js is ready to be called
});

/**
 * Shows the task pane.
 * @param event {Office.AddinCommands.Event}
 */
function showTaskpane(event) {
  // Your code goes here
  Office.ribbon.requestUpdate({
    tabs: [{
      id: "Starling.Tab1",
      controls: [{
        id: "Starling.TaskpaneButton",
        enabled: true
      }]
    }]
  });
  event.completed();
}

/**
 * Analyze contract from ribbon button
 * @param event {Office.AddinCommands.Event}
 */
function analyzeContract(event) {
  // Show task pane and trigger analysis
  Office.addin.showAsTaskpane();

  // Trigger the analysis function
  if (window.parent && window.parent.analyzeContract) {
    window.parent.analyzeContract();
  }
  event.completed();
}
function getGlobal() {
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : undefined;
}
var g = getGlobal();

// The add-in command functions need to be available in global scope
g.showTaskpane = showTaskpane;
g.analyzeContract = analyzeContract;
/******/ })()
;
//# sourceMappingURL=commands.js.map