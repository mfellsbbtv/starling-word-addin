function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i.return && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), c(GeneratorFunctionPrototype, u, GeneratorFunction.displayName = "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, catch: function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Configuration - following augment-guidelines: environment-specific URLs
var API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' ? 'https://api.starling-demo.com/v1' // Demo API endpoint
  : 'http://localhost:8000/api/v1',
  // Local development API
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
    // Note: Authentication will be handled via secure token exchange
  }
};
Office.onReady(function (info) {
  if (info.host === Office.HostType.Word) {
    document.getElementById("analyze-contract").onclick = analyzeContract;
    document.getElementById("generate-summary").onclick = generateSummary;
    document.getElementById("highlight-risks").onclick = highlightRisks;
    document.getElementById("suggest-changes").onclick = suggestChanges;
    document.getElementById("check-compliance").onclick = checkCompliance;

    // Set status as ready
    updateStatus("Ready to analyze your contract", "info");
  }
});

// Function to analyze the contract
function analyzeContract() {
  return _analyzeContract.apply(this, arguments);
} // API call function - Demo mode with mock data
function _analyzeContract() {
  _analyzeContract = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var documentText, analysisResult;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          updateStatus("Analyzing contract...", "info");
          showProgressSection("Extracting document content...");
          _context2.prev = 2;
          _context2.next = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(context) {
              var body;
              return _regeneratorRuntime().wrap(function _callee$(_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    body = context.document.body;
                    body.load("text");
                    _context.next = 4;
                    return context.sync();
                  case 4:
                    return _context.abrupt("return", body.text);
                  case 5:
                  case "end":
                    return _context.stop();
                }
              }, _callee);
            }));
            return function (_x2) {
              return _ref.apply(this, arguments);
            };
          }());
        case 5:
          documentText = _context2.sent;
          if (!(!documentText || documentText.trim().length === 0)) {
            _context2.next = 8;
            break;
          }
          throw new Error("No content found in document");
        case 8:
          showProgressSection("Sending to AI for analysis...");

          // Call the API
          _context2.next = 11;
          return callAnalysisAPI(documentText);
        case 11:
          analysisResult = _context2.sent;
          // Display results
          displayAnalysisResults(analysisResult);
          updateStatus("Analysis complete", "success");
          hideProgressSection();
          _context2.next = 20;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](2);
          handleError(_context2.t0);
        case 20:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[2, 17]]);
  }));
  return _analyzeContract.apply(this, arguments);
}
function callAnalysisAPI(_x) {
  return _callAnalysisAPI.apply(this, arguments);
} // Display analysis results
function _callAnalysisAPI() {
  _callAnalysisAPI = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(content) {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 2000);
          });
        case 2:
          return _context3.abrupt("return", {
            summary: "This contract appears to be a standard service agreement with moderate risk factors. Key areas of concern include liability limitations and termination clauses.",
            compliance_score: 78,
            risks: [{
              severity: "high",
              category: "Liability",
              description: "Liability cap may be insufficient for the scope of services",
              location: "Section 8.2",
              suggestion: "Consider increasing liability cap to 2x annual contract value"
            }, {
              severity: "medium",
              category: "Termination",
              description: "Termination notice period is shorter than industry standard",
              location: "Section 12.1",
              suggestion: "Extend notice period to 60 days"
            }, {
              severity: "low",
              category: "Payment",
              description: "Payment terms could be more favorable",
              location: "Section 4.3",
              suggestion: "Negotiate for Net 30 instead of Net 15"
            }],
            recommendations: ["Review and strengthen indemnification clauses", "Add force majeure provisions", "Include data protection and privacy terms", "Clarify intellectual property ownership"]
          });
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _callAnalysisAPI.apply(this, arguments);
}
function displayAnalysisResults(result) {
  var resultsSection = document.getElementById("results-section");
  var resultsContent = document.getElementById("results-content");
  var html = "\n    <div class=\"analysis-summary\">\n      <h3>Analysis Summary</h3>\n      <p>".concat(result.summary, "</p>\n      <p><strong>Compliance Score:</strong> ").concat(result.compliance_score, "/100</p>\n    </div>\n\n    <div class=\"risks-section\">\n      <h3>Identified Risks (").concat(result.risks.length, ")</h3>\n      ").concat(result.risks.map(function (risk) {
    return "\n        <div class=\"risk-item ".concat(risk.severity, "\">\n          <div class=\"risk-header\">\n            <span class=\"severity-badge ").concat(risk.severity, "\">").concat(risk.severity.toUpperCase(), "</span>\n            <span class=\"category\">").concat(risk.category, "</span>\n          </div>\n          <p class=\"description\">").concat(risk.description, "</p>\n          <p class=\"location\"><strong>Location:</strong> ").concat(risk.location, "</p>\n          ").concat(risk.suggestion ? "<p class=\"suggestion\"><strong>Suggestion:</strong> ".concat(risk.suggestion, "</p>") : '', "\n        </div>\n      ");
  }).join(''), "\n    </div>\n\n    <div class=\"recommendations-section\">\n      <h3>Recommendations</h3>\n      <ul>\n        ").concat(result.recommendations.map(function (rec) {
    return "<li>".concat(rec, "</li>");
  }).join(''), "\n      </ul>\n    </div>\n  ");
  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}

// Helper functions
function updateStatus(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
  var statusElement = document.getElementById("status-message");
  statusElement.textContent = message;
  statusElement.className = "status-message ".concat(type);
}
function showProgressSection(message) {
  document.getElementById("progress-section").style.display = "block";
  document.getElementById("progress-text").textContent = message;
  simulateProgress();
}
function hideProgressSection() {
  document.getElementById("progress-section").style.display = "none";
}
function showResults(message) {
  var resultsSection = document.getElementById("results-section");
  var resultsContent = document.getElementById("results-content");
  resultsSection.style.display = "block";
  resultsContent.innerHTML = "<p>".concat(message, "</p>");
}
function simulateProgress() {
  var width = 0;
  var progressFill = document.getElementById("progress-fill");
  var interval = setInterval(function () {
    if (width >= 100) {
      clearInterval(interval);
    } else {
      width += 5;
      progressFill.style.width = width + "%";
    }
  }, 100);
}
function handleError(error) {
  console.error(error);
  updateStatus("Error: ".concat(error.message), "error");
  hideProgressSection();
}

// Display functions for different result types
function displaySummaryResults() {
  var resultsSection = document.getElementById("results-section");
  var resultsContent = document.getElementById("results-content");
  var html = "\n    <div class=\"summary-results\">\n      <h3>Executive Summary</h3>\n      <div class=\"summary-content\">\n        <p><strong>Document Type:</strong> Service Agreement</p>\n        <p><strong>Parties:</strong> Service Provider and Client</p>\n        <p><strong>Term:</strong> 12 months with auto-renewal</p>\n        <p><strong>Value:</strong> Estimated $50,000 annually</p>\n\n        <h4>Key Terms:</h4>\n        <ul>\n          <li>Monthly service fees with quarterly reviews</li>\n          <li>Standard liability limitations apply</li>\n          <li>30-day termination notice required</li>\n          <li>Intellectual property remains with respective parties</li>\n          <li>Confidentiality obligations for both parties</li>\n        </ul>\n\n        <h4>Notable Provisions:</h4>\n        <ul>\n          <li>Force majeure clause included</li>\n          <li>Dispute resolution through arbitration</li>\n          <li>Governing law specified</li>\n        </ul>\n      </div>\n    </div>\n  ";
  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}
function displayRiskHighlightResults() {
  var resultsSection = document.getElementById("results-section");
  var resultsContent = document.getElementById("results-content");
  var html = "\n    <div class=\"highlight-results\">\n      <h3>Risk Highlighting Complete</h3>\n      <p>\u2705 <strong>5 risk terms</strong> have been highlighted in yellow in your document:</p>\n      <ul>\n        <li><span style=\"background-color: #ffeb3b; font-weight: bold;\">Liability</span> - Found 3 instances</li>\n        <li><span style=\"background-color: #ffeb3b; font-weight: bold;\">Indemnification</span> - Found 2 instances</li>\n        <li><span style=\"background-color: #ffeb3b; font-weight: bold;\">Termination</span> - Found 4 instances</li>\n        <li><span style=\"background-color: #ffeb3b; font-weight: bold;\">Penalty</span> - Found 1 instance</li>\n        <li><span style=\"background-color: #ffeb3b; font-weight: bold;\">Damages</span> - Found 2 instances</li>\n      </ul>\n      <p><em>Review the highlighted terms carefully as they represent potential risk areas that may require legal attention.</em></p>\n    </div>\n  ";
  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}

// Generate Summary function
function generateSummary() {
  return _generateSummary.apply(this, arguments);
} // Highlight Risks function
function _generateSummary() {
  _generateSummary = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
    var documentText;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          updateStatus("Generating summary...", "info");
          showProgressSection("Extracting document content...");
          _context5.prev = 2;
          _context5.next = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(context) {
              var body;
              return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    body = context.document.body;
                    body.load("text");
                    _context4.next = 4;
                    return context.sync();
                  case 4:
                    return _context4.abrupt("return", body.text);
                  case 5:
                  case "end":
                    return _context4.stop();
                }
              }, _callee4);
            }));
            return function (_x3) {
              return _ref2.apply(this, arguments);
            };
          }());
        case 5:
          documentText = _context5.sent;
          if (!(!documentText || documentText.trim().length === 0)) {
            _context5.next = 8;
            break;
          }
          throw new Error("No content found in document");
        case 8:
          showProgressSection("Generating executive summary...");

          // Simulate processing delay
          _context5.next = 11;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 2000);
          });
        case 11:
          // Display summary results
          displaySummaryResults();
          updateStatus("Summary generated successfully", "success");
          hideProgressSection();
          _context5.next = 19;
          break;
        case 16:
          _context5.prev = 16;
          _context5.t0 = _context5["catch"](2);
          handleError(_context5.t0);
        case 19:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[2, 16]]);
  }));
  return _generateSummary.apply(this, arguments);
}
function highlightRisks() {
  return _highlightRisks.apply(this, arguments);
} // Suggest Changes function
function _highlightRisks() {
  _highlightRisks = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          updateStatus("Highlighting risks...", "info");
          showProgressSection("Analyzing document for risks...");
          _context7.prev = 2;
          _context7.next = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(context) {
              var body, riskTerms, _i, _riskTerms, term, searchResults;
              return _regeneratorRuntime().wrap(function _callee6$(_context6) {
                while (1) switch (_context6.prev = _context6.next) {
                  case 0:
                    body = context.document.body;
                    body.load("text");
                    _context6.next = 4;
                    return context.sync();
                  case 4:
                    if (!(!body.text || body.text.trim().length === 0)) {
                      _context6.next = 6;
                      break;
                    }
                    throw new Error("No content found in document");
                  case 6:
                    showProgressSection("Identifying risk areas...");

                    // Simulate processing delay
                    _context6.next = 9;
                    return new Promise(function (resolve) {
                      return setTimeout(resolve, 1500);
                    });
                  case 9:
                    // Search for common risk terms and highlight them
                    riskTerms = ["liability", "indemnification", "termination", "penalty", "damages"];
                    _i = 0, _riskTerms = riskTerms;
                  case 11:
                    if (!(_i < _riskTerms.length)) {
                      _context6.next = 21;
                      break;
                    }
                    term = _riskTerms[_i];
                    searchResults = body.search(term, {
                      matchCase: false,
                      matchWholeWord: false
                    });
                    searchResults.load("font");
                    _context6.next = 17;
                    return context.sync();
                  case 17:
                    searchResults.items.forEach(function (item) {
                      item.font.highlightColor = "#ffeb3b"; // Yellow highlight
                      item.font.bold = true;
                    });
                  case 18:
                    _i++;
                    _context6.next = 11;
                    break;
                  case 21:
                    _context6.next = 23;
                    return context.sync();
                  case 23:
                  case "end":
                    return _context6.stop();
                }
              }, _callee6);
            }));
            return function (_x4) {
              return _ref3.apply(this, arguments);
            };
          }());
        case 5:
          displayRiskHighlightResults();
          updateStatus("Risk highlighting completed", "success");
          hideProgressSection();
          _context7.next = 13;
          break;
        case 10:
          _context7.prev = 10;
          _context7.t0 = _context7["catch"](2);
          handleError(_context7.t0);
        case 13:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[2, 10]]);
  }));
  return _highlightRisks.apply(this, arguments);
}
function suggestChanges() {
  return _suggestChanges.apply(this, arguments);
} // Check Compliance function
function _suggestChanges() {
  _suggestChanges = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
    var documentText;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          updateStatus("Suggesting changes...", "info");
          showProgressSection("Analyzing contract clauses...");
          _context9.prev = 2;
          _context9.next = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(context) {
              var body;
              return _regeneratorRuntime().wrap(function _callee8$(_context8) {
                while (1) switch (_context8.prev = _context8.next) {
                  case 0:
                    body = context.document.body;
                    body.load("text");
                    _context8.next = 4;
                    return context.sync();
                  case 4:
                    return _context8.abrupt("return", body.text);
                  case 5:
                  case "end":
                    return _context8.stop();
                }
              }, _callee8);
            }));
            return function (_x5) {
              return _ref4.apply(this, arguments);
            };
          }());
        case 5:
          documentText = _context9.sent;
          if (!(!documentText || documentText.trim().length === 0)) {
            _context9.next = 8;
            break;
          }
          throw new Error("No content found in document");
        case 8:
          showProgressSection("Generating improvement suggestions...");

          // Simulate processing delay
          _context9.next = 11;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 2500);
          });
        case 11:
          // Display suggestions
          displaySuggestionResults();
          updateStatus("Change suggestions generated", "success");
          hideProgressSection();
          _context9.next = 19;
          break;
        case 16:
          _context9.prev = 16;
          _context9.t0 = _context9["catch"](2);
          handleError(_context9.t0);
        case 19:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[2, 16]]);
  }));
  return _suggestChanges.apply(this, arguments);
}
function checkCompliance() {
  return _checkCompliance.apply(this, arguments);
}
function _checkCompliance() {
  _checkCompliance = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee1() {
    var documentText;
    return _regeneratorRuntime().wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          updateStatus("Checking compliance...", "info");
          showProgressSection("Scanning for compliance issues...");
          _context1.prev = 2;
          _context1.next = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee0(context) {
              var body;
              return _regeneratorRuntime().wrap(function _callee0$(_context0) {
                while (1) switch (_context0.prev = _context0.next) {
                  case 0:
                    body = context.document.body;
                    body.load("text");
                    _context0.next = 4;
                    return context.sync();
                  case 4:
                    return _context0.abrupt("return", body.text);
                  case 5:
                  case "end":
                    return _context0.stop();
                }
              }, _callee0);
            }));
            return function (_x6) {
              return _ref5.apply(this, arguments);
            };
          }());
        case 5:
          documentText = _context1.sent;
          if (!(!documentText || documentText.trim().length === 0)) {
            _context1.next = 8;
            break;
          }
          throw new Error("No content found in document");
        case 8:
          showProgressSection("Checking regulatory compliance...");

          // Simulate processing delay
          _context1.next = 11;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 2000);
          });
        case 11:
          // Display compliance results
          displayComplianceResults();
          updateStatus("Compliance check completed", "success");
          hideProgressSection();
          _context1.next = 19;
          break;
        case 16:
          _context1.prev = 16;
          _context1.t0 = _context1["catch"](2);
          handleError(_context1.t0);
        case 19:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[2, 16]]);
  }));
  return _checkCompliance.apply(this, arguments);
}
function displaySuggestionResults() {
  var resultsSection = document.getElementById("results-section");
  var resultsContent = document.getElementById("results-content");
  var html = "\n    <div class=\"suggestions-results\">\n      <h3>Contract Improvement Suggestions</h3>\n\n      <div class=\"suggestion-item high-priority\">\n        <h4>\uD83D\uDD34 High Priority</h4>\n        <p><strong>Liability Cap Enhancement</strong></p>\n        <p>Current liability limitation may be insufficient. Consider increasing from current amount to 2x annual contract value or $100,000, whichever is greater.</p>\n        <p><em>Location: Section 8.2 - Limitation of Liability</em></p>\n      </div>\n\n      <div class=\"suggestion-item medium-priority\">\n        <h4>\uD83D\uDFE1 Medium Priority</h4>\n        <p><strong>Termination Notice Period</strong></p>\n        <p>Extend termination notice from 30 days to 60 days to provide better transition planning for both parties.</p>\n        <p><em>Location: Section 12.1 - Termination</em></p>\n      </div>\n\n      <div class=\"suggestion-item medium-priority\">\n        <h4>\uD83D\uDFE1 Medium Priority</h4>\n        <p><strong>Force Majeure Clause</strong></p>\n        <p>Add specific language covering pandemic, cyber attacks, and supply chain disruptions to modernize force majeure provisions.</p>\n        <p><em>Location: Section 15 - Force Majeure</em></p>\n      </div>\n\n      <div class=\"suggestion-item low-priority\">\n        <h4>\uD83D\uDFE2 Low Priority</h4>\n        <p><strong>Payment Terms Optimization</strong></p>\n        <p>Consider negotiating payment terms from Net 15 to Net 30 to improve cash flow management.</p>\n        <p><em>Location: Section 4.3 - Payment Terms</em></p>\n      </div>\n    </div>\n  ";
  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}
function displayComplianceResults() {
  var resultsSection = document.getElementById("results-section");
  var resultsContent = document.getElementById("results-content");
  var html = "\n    <div class=\"compliance-results\">\n      <h3>Compliance Check Results</h3>\n\n      <div class=\"compliance-score\">\n        <h4>Overall Compliance Score: <span style=\"color: #4caf50; font-size: 1.2em;\">82/100</span></h4>\n      </div>\n\n      <div class=\"compliance-section\">\n        <h4>\u2705 Compliant Areas</h4>\n        <ul>\n          <li><strong>Data Protection:</strong> GDPR-compliant privacy clauses present</li>\n          <li><strong>Intellectual Property:</strong> Clear IP ownership and licensing terms</li>\n          <li><strong>Dispute Resolution:</strong> Proper arbitration procedures defined</li>\n          <li><strong>Governing Law:</strong> Jurisdiction clearly specified</li>\n        </ul>\n      </div>\n\n      <div class=\"compliance-section\">\n        <h4>\u26A0\uFE0F Areas Needing Attention</h4>\n        <ul>\n          <li><strong>Accessibility Compliance:</strong> Missing ADA/WCAG compliance requirements</li>\n          <li><strong>Cybersecurity Standards:</strong> Should reference specific security frameworks (SOC 2, ISO 27001)</li>\n          <li><strong>Record Retention:</strong> Unclear data retention and deletion policies</li>\n        </ul>\n      </div>\n\n      <div class=\"compliance-section\">\n        <h4>\uD83D\uDCCB Recommended Actions</h4>\n        <ol>\n          <li>Add accessibility compliance clause referencing WCAG 2.1 AA standards</li>\n          <li>Include cybersecurity framework requirements and audit rights</li>\n          <li>Define specific data retention periods and deletion procedures</li>\n          <li>Consider adding ESG (Environmental, Social, Governance) compliance terms</li>\n        </ol>\n      </div>\n    </div>\n  ";
  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}