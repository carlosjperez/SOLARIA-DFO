import { u as Ft, j as s, a as Ie, b as as, Q as oy, c as dy } from "./query-D0abkBGM.js";
import { a as uy, b as my, g as fy, R as Mn, r as B, N as hy, u as $t, O as xy, c as Al, d as py, e as at, f as hp, B as gy } from "./vendor-BXhsGKj_.js";
import { c as by } from "./charts--6qEJHQB.js";
(function () { const i = document.createElement("link").relList; if (i && i.supports && i.supports("modulepreload"))
    return; for (const u of document.querySelectorAll('link[rel="modulepreload"]'))
    c(u); new MutationObserver(u => { for (const m of u)
    if (m.type === "childList")
        for (const h of m.addedNodes)
            h.tagName === "LINK" && h.rel === "modulepreload" && c(h); }).observe(document, { childList: !0, subtree: !0 }); function r(u) { const m = {}; return u.integrity && (m.integrity = u.integrity), u.referrerPolicy && (m.referrerPolicy = u.referrerPolicy), u.crossOrigin === "use-credentials" ? m.credentials = "include" : u.crossOrigin === "anonymous" ? m.credentials = "omit" : m.credentials = "same-origin", m; } function c(u) { if (u.ep)
    return; u.ep = !0; const m = r(u); fetch(u.href, m); } })();
var xd = { exports: {} }, Cn = {}, pd = { exports: {} }, gd = {}; /**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Nx;
function yy() { return Nx || (Nx = 1, (function (l) { function i(E, J) { var Q = E.length; E.push(J); e: for (; 0 < Q;) {
    var xe = Q - 1 >>> 1, ue = E[xe];
    if (0 < u(ue, J))
        E[xe] = J, E[Q] = ue, Q = xe;
    else
        break e;
} } function r(E) { return E.length === 0 ? null : E[0]; } function c(E) { if (E.length === 0)
    return null; var J = E[0], Q = E.pop(); if (Q !== J) {
    E[0] = Q;
    e: for (var xe = 0, ue = E.length, we = ue >>> 1; xe < we;) {
        var ne = 2 * (xe + 1) - 1, se = E[ne], me = ne + 1, et = E[me];
        if (0 > u(se, Q))
            me < ue && 0 > u(et, se) ? (E[xe] = et, E[me] = Q, xe = me) : (E[xe] = se, E[ne] = Q, xe = ne);
        else if (me < ue && 0 > u(et, Q))
            E[xe] = et, E[me] = Q, xe = me;
        else
            break e;
    }
} return J; } function u(E, J) { var Q = E.sortIndex - J.sortIndex; return Q !== 0 ? Q : E.id - J.id; } if (l.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
    var m = performance;
    l.unstable_now = function () { return m.now(); };
}
else {
    var h = Date, p = h.now();
    l.unstable_now = function () { return h.now() - p; };
} var b = [], y = [], v = 1, g = null, k = 3, C = !1, j = !1, w = !1, T = !1, K = typeof setTimeout == "function" ? setTimeout : null, Z = typeof clearTimeout == "function" ? clearTimeout : null, V = typeof setImmediate < "u" ? setImmediate : null; function $(E) { for (var J = r(y); J !== null;) {
    if (J.callback === null)
        c(y);
    else if (J.startTime <= E)
        c(y), J.sortIndex = J.expirationTime, i(b, J);
    else
        break;
    J = r(y);
} } function D(E) { if (w = !1, $(E), !j)
    if (r(b) !== null)
        j = !0, G || (G = !0, Se());
    else {
        var J = r(y);
        J !== null && Ue(D, J.startTime - E);
    } } var G = !1, q = -1, Y = 5, de = -1; function it() { return T ? !0 : !(l.unstable_now() - de < Y); } function Ge() { if (T = !1, G) {
    var E = l.unstable_now();
    de = E;
    var J = !0;
    try {
        e: {
            j = !1, w && (w = !1, Z(q), q = -1), C = !0;
            var Q = k;
            try {
                t: {
                    for ($(E), g = r(b); g !== null && !(g.expirationTime > E && it());) {
                        var xe = g.callback;
                        if (typeof xe == "function") {
                            g.callback = null, k = g.priorityLevel;
                            var ue = xe(g.expirationTime <= E);
                            if (E = l.unstable_now(), typeof ue == "function") {
                                g.callback = ue, $(E), J = !0;
                                break t;
                            }
                            g === r(b) && c(b), $(E);
                        }
                        else
                            c(b);
                        g = r(b);
                    }
                    if (g !== null)
                        J = !0;
                    else {
                        var we = r(y);
                        we !== null && Ue(D, we.startTime - E), J = !1;
                    }
                }
                break e;
            }
            finally {
                g = null, k = Q, C = !1;
            }
            J = void 0;
        }
    }
    finally {
        J ? Se() : G = !1;
    }
} } var Se; if (typeof V == "function")
    Se = function () { V(Ge); };
else if (typeof MessageChannel < "u") {
    var We = new MessageChannel, Je = We.port2;
    We.port1.onmessage = Ge, Se = function () { Je.postMessage(null); };
}
else
    Se = function () { K(Ge, 0); }; function Ue(E, J) { q = K(function () { E(l.unstable_now()); }, J); } l.unstable_IdlePriority = 5, l.unstable_ImmediatePriority = 1, l.unstable_LowPriority = 4, l.unstable_NormalPriority = 3, l.unstable_Profiling = null, l.unstable_UserBlockingPriority = 2, l.unstable_cancelCallback = function (E) { E.callback = null; }, l.unstable_forceFrameRate = function (E) { 0 > E || 125 < E ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Y = 0 < E ? Math.floor(1e3 / E) : 5; }, l.unstable_getCurrentPriorityLevel = function () { return k; }, l.unstable_next = function (E) { switch (k) {
    case 1:
    case 2:
    case 3:
        var J = 3;
        break;
    default: J = k;
} var Q = k; k = J; try {
    return E();
}
finally {
    k = Q;
} }, l.unstable_requestPaint = function () { T = !0; }, l.unstable_runWithPriority = function (E, J) { switch (E) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5: break;
    default: E = 3;
} var Q = k; k = E; try {
    return J();
}
finally {
    k = Q;
} }, l.unstable_scheduleCallback = function (E, J, Q) { var xe = l.unstable_now(); switch (typeof Q == "object" && Q !== null ? (Q = Q.delay, Q = typeof Q == "number" && 0 < Q ? xe + Q : xe) : Q = xe, E) {
    case 1:
        var ue = -1;
        break;
    case 2:
        ue = 250;
        break;
    case 5:
        ue = 1073741823;
        break;
    case 4:
        ue = 1e4;
        break;
    default: ue = 5e3;
} return ue = Q + ue, E = { id: v++, callback: J, priorityLevel: E, startTime: Q, expirationTime: ue, sortIndex: -1 }, Q > xe ? (E.sortIndex = Q, i(y, E), r(b) === null && E === r(y) && (w ? (Z(q), q = -1) : w = !0, Ue(D, Q - xe))) : (E.sortIndex = ue, i(b, E), j || C || (j = !0, G || (G = !0, Se()))), E; }, l.unstable_shouldYield = it, l.unstable_wrapCallback = function (E) { var J = k; return function () { var Q = k; k = J; try {
    return E.apply(this, arguments);
}
finally {
    k = Q;
} }; }; })(gd)), gd; }
var wx;
function vy() { return wx || (wx = 1, pd.exports = yy()), pd.exports; } /**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var Sx;
function jy() {
    if (Sx)
        return Cn;
    Sx = 1;
    var l = vy(), i = uy(), r = my();
    function c(e) { var t = "https://react.dev/errors/" + e; if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var a = 2; a < arguments.length; a++)
            t += "&args[]=" + encodeURIComponent(arguments[a]);
    } return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."; }
    function u(e) { return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11); }
    function m(e) { var t = e, a = e; if (e.alternate)
        for (; t.return;)
            t = t.return;
    else {
        e = t;
        do
            t = e, (t.flags & 4098) !== 0 && (a = t.return), e = t.return;
        while (e);
    } return t.tag === 3 ? a : null; }
    function h(e) { if (e.tag === 13) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null)
            return t.dehydrated;
    } return null; }
    function p(e) { if (e.tag === 31) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null)
            return t.dehydrated;
    } return null; }
    function b(e) { if (m(e) !== e)
        throw Error(c(188)); }
    function y(e) { var t = e.alternate; if (!t) {
        if (t = m(e), t === null)
            throw Error(c(188));
        return t !== e ? null : e;
    } for (var a = e, n = t;;) {
        var o = a.return;
        if (o === null)
            break;
        var d = o.alternate;
        if (d === null) {
            if (n = o.return, n !== null) {
                a = n;
                continue;
            }
            break;
        }
        if (o.child === d.child) {
            for (d = o.child; d;) {
                if (d === a)
                    return b(o), e;
                if (d === n)
                    return b(o), t;
                d = d.sibling;
            }
            throw Error(c(188));
        }
        if (a.return !== n.return)
            a = o, n = d;
        else {
            for (var f = !1, x = o.child; x;) {
                if (x === a) {
                    f = !0, a = o, n = d;
                    break;
                }
                if (x === n) {
                    f = !0, n = o, a = d;
                    break;
                }
                x = x.sibling;
            }
            if (!f) {
                for (x = d.child; x;) {
                    if (x === a) {
                        f = !0, a = d, n = o;
                        break;
                    }
                    if (x === n) {
                        f = !0, n = d, a = o;
                        break;
                    }
                    x = x.sibling;
                }
                if (!f)
                    throw Error(c(189));
            }
        }
        if (a.alternate !== n)
            throw Error(c(190));
    } if (a.tag !== 3)
        throw Error(c(188)); return a.stateNode.current === a ? e : t; }
    function v(e) { var t = e.tag; if (t === 5 || t === 26 || t === 27 || t === 6)
        return e; for (e = e.child; e !== null;) {
        if (t = v(e), t !== null)
            return t;
        e = e.sibling;
    } return null; }
    var g = Object.assign, k = Symbol.for("react.element"), C = Symbol.for("react.transitional.element"), j = Symbol.for("react.portal"), w = Symbol.for("react.fragment"), T = Symbol.for("react.strict_mode"), K = Symbol.for("react.profiler"), Z = Symbol.for("react.consumer"), V = Symbol.for("react.context"), $ = Symbol.for("react.forward_ref"), D = Symbol.for("react.suspense"), G = Symbol.for("react.suspense_list"), q = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), de = Symbol.for("react.activity"), it = Symbol.for("react.memo_cache_sentinel"), Ge = Symbol.iterator;
    function Se(e) { return e === null || typeof e != "object" ? null : (e = Ge && e[Ge] || e["@@iterator"], typeof e == "function" ? e : null); }
    var We = Symbol.for("react.client.reference");
    function Je(e) { if (e == null)
        return null; if (typeof e == "function")
        return e.$$typeof === We ? null : e.displayName || e.name || null; if (typeof e == "string")
        return e; switch (e) {
        case w: return "Fragment";
        case K: return "Profiler";
        case T: return "StrictMode";
        case D: return "Suspense";
        case G: return "SuspenseList";
        case de: return "Activity";
    } if (typeof e == "object")
        switch (e.$$typeof) {
            case j: return "Portal";
            case V: return e.displayName || "Context";
            case Z: return (e._context.displayName || "Context") + ".Consumer";
            case $:
                var t = e.render;
                return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
            case q: return t = e.displayName || null, t !== null ? t : Je(e.type) || "Memo";
            case Y:
                t = e._payload, e = e._init;
                try {
                    return Je(e(t));
                }
                catch { }
        } return null; }
    var Ue = Array.isArray, E = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, J = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Q = { pending: !1, data: null, method: null, action: null }, xe = [], ue = -1;
    function we(e) { return { current: e }; }
    function ne(e) { 0 > ue || (e.current = xe[ue], xe[ue] = null, ue--); }
    function se(e, t) { ue++, xe[ue] = e.current, e.current = t; }
    var me = we(null), et = we(null), Pt = we(null), ze = we(null);
    function fa(e, t) { switch (se(Pt, t), se(et, e), se(me, null), t.nodeType) {
        case 9:
        case 11:
            e = (e = t.documentElement) && (e = e.namespaceURI) ? Yh(e) : 0;
            break;
        default: if (e = t.tagName, t = t.namespaceURI)
            t = Yh(t), e = Xh(t, e);
        else
            switch (e) {
                case "svg":
                    e = 1;
                    break;
                case "math":
                    e = 2;
                    break;
                default: e = 0;
            }
    } ne(me), se(me, e); }
    function It() { ne(me), ne(et), ne(Pt); }
    function Rs(e) { e.memoizedState !== null && se(ze, e); var t = me.current, a = Xh(t, e.type); t !== a && (se(et, e), se(me, a)); }
    function qs(e) { et.current === e && (ne(me), ne(et)), ze.current === e && (ne(ze), Nn._currentValue = Q); }
    var Bs, vu;
    function ha(e) {
        if (Bs === void 0)
            try {
                throw Error();
            }
            catch (a) {
                var t = a.stack.trim().match(/\n( *(at )?)/);
                Bs = t && t[1] || "", vu = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
            }
        return `
` + Bs + e + vu;
    }
    var Pr = !1;
    function Ir(e, t) {
        if (!e || Pr)
            return "";
        Pr = !0;
        var a = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var n = { DetermineComponentFrameRoot: function () { try {
                    if (t) {
                        var H = function () { throw Error(); };
                        if (Object.defineProperty(H.prototype, "props", { set: function () { throw Error(); } }), typeof Reflect == "object" && Reflect.construct) {
                            try {
                                Reflect.construct(H, []);
                            }
                            catch (R) {
                                var O = R;
                            }
                            Reflect.construct(e, [], H);
                        }
                        else {
                            try {
                                H.call();
                            }
                            catch (R) {
                                O = R;
                            }
                            e.call(H.prototype);
                        }
                    }
                    else {
                        try {
                            throw Error();
                        }
                        catch (R) {
                            O = R;
                        }
                        (H = e()) && typeof H.catch == "function" && H.catch(function () { });
                    }
                }
                catch (R) {
                    if (R && O && typeof R.stack == "string")
                        return [R.stack, O.stack];
                } return [null, null]; } };
            n.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var o = Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot, "name");
            o && o.configurable && Object.defineProperty(n.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
            var d = n.DetermineComponentFrameRoot(), f = d[0], x = d[1];
            if (f && x) {
                var N = f.split(`
`), _ = x.split(`
`);
                for (o = n = 0; n < N.length && !N[n].includes("DetermineComponentFrameRoot");)
                    n++;
                for (; o < _.length && !_[o].includes("DetermineComponentFrameRoot");)
                    o++;
                if (n === N.length || o === _.length)
                    for (n = N.length - 1, o = _.length - 1; 1 <= n && 0 <= o && N[n] !== _[o];)
                        o--;
                for (; 1 <= n && 0 <= o; n--, o--)
                    if (N[n] !== _[o]) {
                        if (n !== 1 || o !== 1)
                            do
                                if (n--, o--, 0 > o || N[n] !== _[o]) {
                                    var U = `
` + N[n].replace(" at new ", " at ");
                                    return e.displayName && U.includes("<anonymous>") && (U = U.replace("<anonymous>", e.displayName)), U;
                                }
                            while (1 <= n && 0 <= o);
                        break;
                    }
            }
        }
        finally {
            Pr = !1, Error.prepareStackTrace = a;
        }
        return (a = e ? e.displayName || e.name : "") ? ha(a) : "";
    }
    function Hg(e, t) { switch (e.tag) {
        case 26:
        case 27:
        case 5: return ha(e.type);
        case 16: return ha("Lazy");
        case 13: return e.child !== t && t !== null ? ha("Suspense Fallback") : ha("Suspense");
        case 19: return ha("SuspenseList");
        case 0:
        case 15: return Ir(e.type, !1);
        case 11: return Ir(e.type.render, !1);
        case 1: return Ir(e.type, !0);
        case 31: return ha("Activity");
        default: return "";
    } }
    function ju(e) {
        try {
            var t = "", a = null;
            do
                t += Hg(e, a), a = e, e = e.return;
            while (e);
            return t;
        }
        catch (n) {
            return `
Error generating stack: ` + n.message + `
` + n.stack;
        }
    }
    var Wr = Object.prototype.hasOwnProperty, ec = l.unstable_scheduleCallback, tc = l.unstable_cancelCallback, Vg = l.unstable_shouldYield, Gg = l.unstable_requestPaint, kt = l.unstable_now, Qg = l.unstable_getCurrentPriorityLevel, Nu = l.unstable_ImmediatePriority, wu = l.unstable_UserBlockingPriority, Vn = l.unstable_NormalPriority, Kg = l.unstable_LowPriority, Su = l.unstable_IdlePriority, Yg = l.log, Xg = l.unstable_setDisableYieldValue, Dl = null, Ct = null;
    function Us(e) { if (typeof Yg == "function" && Xg(e), Ct && typeof Ct.setStrictMode == "function")
        try {
            Ct.setStrictMode(Dl, e);
        }
        catch { } }
    var At = Math.clz32 ? Math.clz32 : Fg, Zg = Math.log, Jg = Math.LN2;
    function Fg(e) { return e >>>= 0, e === 0 ? 32 : 31 - (Zg(e) / Jg | 0) | 0; }
    var Gn = 256, Qn = 262144, Kn = 4194304;
    function xa(e) { var t = e & 42; if (t !== 0)
        return t; switch (e & -e) {
        case 1: return 1;
        case 2: return 2;
        case 4: return 4;
        case 8: return 8;
        case 16: return 16;
        case 32: return 32;
        case 64: return 64;
        case 128: return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072: return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152: return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432: return e & 62914560;
        case 67108864: return 67108864;
        case 134217728: return 134217728;
        case 268435456: return 268435456;
        case 536870912: return 536870912;
        case 1073741824: return 0;
        default: return e;
    } }
    function Yn(e, t, a) { var n = e.pendingLanes; if (n === 0)
        return 0; var o = 0, d = e.suspendedLanes, f = e.pingedLanes; e = e.warmLanes; var x = n & 134217727; return x !== 0 ? (n = x & ~d, n !== 0 ? o = xa(n) : (f &= x, f !== 0 ? o = xa(f) : a || (a = x & ~e, a !== 0 && (o = xa(a))))) : (x = n & ~d, x !== 0 ? o = xa(x) : f !== 0 ? o = xa(f) : a || (a = n & ~e, a !== 0 && (o = xa(a)))), o === 0 ? 0 : t !== 0 && t !== o && (t & d) === 0 && (d = o & -o, a = t & -t, d >= a || d === 32 && (a & 4194048) !== 0) ? t : o; }
    function zl(e, t) { return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0; }
    function $g(e, t) { switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64: return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152: return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432: return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824: return -1;
        default: return -1;
    } }
    function ku() { var e = Kn; return Kn <<= 1, (Kn & 62914560) === 0 && (Kn = 4194304), e; }
    function sc(e) { for (var t = [], a = 0; 31 > a; a++)
        t.push(e); return t; }
    function Rl(e, t) { e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0); }
    function Pg(e, t, a, n, o, d) { var f = e.pendingLanes; e.pendingLanes = a, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= a, e.entangledLanes &= a, e.errorRecoveryDisabledLanes &= a, e.shellSuspendCounter = 0; var x = e.entanglements, N = e.expirationTimes, _ = e.hiddenUpdates; for (a = f & ~a; 0 < a;) {
        var U = 31 - At(a), H = 1 << U;
        x[U] = 0, N[U] = -1;
        var O = _[U];
        if (O !== null)
            for (_[U] = null, U = 0; U < O.length; U++) {
                var R = O[U];
                R !== null && (R.lane &= -536870913);
            }
        a &= ~H;
    } n !== 0 && Cu(e, n, 0), d !== 0 && o === 0 && e.tag !== 0 && (e.suspendedLanes |= d & ~(f & ~t)); }
    function Cu(e, t, a) { e.pendingLanes |= t, e.suspendedLanes &= ~t; var n = 31 - At(t); e.entangledLanes |= t, e.entanglements[n] = e.entanglements[n] | 1073741824 | a & 261930; }
    function Au(e, t) { var a = e.entangledLanes |= t; for (e = e.entanglements; a;) {
        var n = 31 - At(a), o = 1 << n;
        o & t | e[n] & t && (e[n] |= t), a &= ~o;
    } }
    function Tu(e, t) { var a = t & -t; return a = (a & 42) !== 0 ? 1 : ac(a), (a & (e.suspendedLanes | t)) !== 0 ? 0 : a; }
    function ac(e) { switch (e) {
        case 2:
            e = 1;
            break;
        case 8:
            e = 4;
            break;
        case 32:
            e = 16;
            break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            e = 128;
            break;
        case 268435456:
            e = 134217728;
            break;
        default: e = 0;
    } return e; }
    function lc(e) { return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2; }
    function Eu() { var e = J.p; return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : xx(e.type)); }
    function Mu(e, t) { var a = J.p; try {
        return J.p = e, t();
    }
    finally {
        J.p = a;
    } }
    var Ls = Math.random().toString(36).slice(2), rt = "__reactFiber$" + Ls, xt = "__reactProps$" + Ls, Ua = "__reactContainer$" + Ls, nc = "__reactEvents$" + Ls, Ig = "__reactListeners$" + Ls, Wg = "__reactHandles$" + Ls, _u = "__reactResources$" + Ls, ql = "__reactMarker$" + Ls;
    function ic(e) { delete e[rt], delete e[xt], delete e[nc], delete e[Ig], delete e[Wg]; }
    function La(e) { var t = e[rt]; if (t)
        return t; for (var a = e.parentNode; a;) {
        if (t = a[Ua] || a[rt]) {
            if (a = t.alternate, t.child !== null || a !== null && a.child !== null)
                for (e = Wh(e); e !== null;) {
                    if (a = e[rt])
                        return a;
                    e = Wh(e);
                }
            return t;
        }
        e = a, a = e.parentNode;
    } return null; }
    function Ha(e) { if (e = e[rt] || e[Ua]) {
        var t = e.tag;
        if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
            return e;
    } return null; }
    function Bl(e) { var t = e.tag; if (t === 5 || t === 26 || t === 27 || t === 6)
        return e.stateNode; throw Error(c(33)); }
    function Va(e) { var t = e[_u]; return t || (t = e[_u] = { hoistableStyles: new Map, hoistableScripts: new Map }), t; }
    function tt(e) { e[ql] = !0; }
    var Ou = new Set, Du = {};
    function pa(e, t) { Ga(e, t), Ga(e + "Capture", t); }
    function Ga(e, t) { for (Du[e] = t, e = 0; e < t.length; e++)
        Ou.add(t[e]); }
    var e0 = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), zu = {}, Ru = {};
    function t0(e) { return Wr.call(Ru, e) ? !0 : Wr.call(zu, e) ? !1 : e0.test(e) ? Ru[e] = !0 : (zu[e] = !0, !1); }
    function Xn(e, t, a) { if (t0(t))
        if (a === null)
            e.removeAttribute(t);
        else {
            switch (typeof a) {
                case "undefined":
                case "function":
                case "symbol":
                    e.removeAttribute(t);
                    return;
                case "boolean":
                    var n = t.toLowerCase().slice(0, 5);
                    if (n !== "data-" && n !== "aria-") {
                        e.removeAttribute(t);
                        return;
                    }
            }
            e.setAttribute(t, "" + a);
        } }
    function Zn(e, t, a) { if (a === null)
        e.removeAttribute(t);
    else {
        switch (typeof a) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(t);
                return;
        }
        e.setAttribute(t, "" + a);
    } }
    function hs(e, t, a, n) { if (n === null)
        e.removeAttribute(a);
    else {
        switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(a);
                return;
        }
        e.setAttributeNS(t, a, "" + n);
    } }
    function Bt(e) { switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined": return e;
        case "object": return e;
        default: return "";
    } }
    function qu(e) { var t = e.type; return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio"); }
    function s0(e, t, a) { var n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t); if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
        var o = n.get, d = n.set;
        return Object.defineProperty(e, t, { configurable: !0, get: function () { return o.call(this); }, set: function (f) { a = "" + f, d.call(this, f); } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function () { return a; }, setValue: function (f) { a = "" + f; }, stopTracking: function () { e._valueTracker = null, delete e[t]; } };
    } }
    function rc(e) { if (!e._valueTracker) {
        var t = qu(e) ? "checked" : "value";
        e._valueTracker = s0(e, t, "" + e[t]);
    } }
    function Bu(e) { if (!e)
        return !1; var t = e._valueTracker; if (!t)
        return !0; var a = t.getValue(), n = ""; return e && (n = qu(e) ? e.checked ? "true" : "false" : e.value), e = n, e !== a ? (t.setValue(e), !0) : !1; }
    function Jn(e) { if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u")
        return null; try {
        return e.activeElement || e.body;
    }
    catch {
        return e.body;
    } }
    var a0 = /[\n"\\]/g;
    function Ut(e) { return e.replace(a0, function (t) { return "\\" + t.charCodeAt(0).toString(16) + " "; }); }
    function cc(e, t, a, n, o, d, f, x) { e.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.type = f : e.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Bt(t)) : e.value !== "" + Bt(t) && (e.value = "" + Bt(t)) : f !== "submit" && f !== "reset" || e.removeAttribute("value"), t != null ? oc(e, f, Bt(t)) : a != null ? oc(e, f, Bt(a)) : n != null && e.removeAttribute("value"), o == null && d != null && (e.defaultChecked = !!d), o != null && (e.checked = o && typeof o != "function" && typeof o != "symbol"), x != null && typeof x != "function" && typeof x != "symbol" && typeof x != "boolean" ? e.name = "" + Bt(x) : e.removeAttribute("name"); }
    function Uu(e, t, a, n, o, d, f, x) { if (d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" && (e.type = d), t != null || a != null) {
        if (!(d !== "submit" && d !== "reset" || t != null)) {
            rc(e);
            return;
        }
        a = a != null ? "" + Bt(a) : "", t = t != null ? "" + Bt(t) : a, x || t === e.value || (e.value = t), e.defaultValue = t;
    } n = n ?? o, n = typeof n != "function" && typeof n != "symbol" && !!n, e.checked = x ? e.checked : !!n, e.defaultChecked = !!n, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (e.name = f), rc(e); }
    function oc(e, t, a) { t === "number" && Jn(e.ownerDocument) === e || e.defaultValue === "" + a || (e.defaultValue = "" + a); }
    function Qa(e, t, a, n) { if (e = e.options, t) {
        t = {};
        for (var o = 0; o < a.length; o++)
            t["$" + a[o]] = !0;
        for (a = 0; a < e.length; a++)
            o = t.hasOwnProperty("$" + e[a].value), e[a].selected !== o && (e[a].selected = o), o && n && (e[a].defaultSelected = !0);
    }
    else {
        for (a = "" + Bt(a), t = null, o = 0; o < e.length; o++) {
            if (e[o].value === a) {
                e[o].selected = !0, n && (e[o].defaultSelected = !0);
                return;
            }
            t !== null || e[o].disabled || (t = e[o]);
        }
        t !== null && (t.selected = !0);
    } }
    function Lu(e, t, a) { if (t != null && (t = "" + Bt(t), t !== e.value && (e.value = t), a == null)) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
    } e.defaultValue = a != null ? "" + Bt(a) : ""; }
    function Hu(e, t, a, n) { if (t == null) {
        if (n != null) {
            if (a != null)
                throw Error(c(92));
            if (Ue(n)) {
                if (1 < n.length)
                    throw Error(c(93));
                n = n[0];
            }
            a = n;
        }
        a == null && (a = ""), t = a;
    } a = Bt(t), e.defaultValue = a, n = e.textContent, n === a && n !== "" && n !== null && (e.value = n), rc(e); }
    function Ka(e, t) { if (t) {
        var a = e.firstChild;
        if (a && a === e.lastChild && a.nodeType === 3) {
            a.nodeValue = t;
            return;
        }
    } e.textContent = t; }
    var l0 = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function Vu(e, t, a) { var n = t.indexOf("--") === 0; a == null || typeof a == "boolean" || a === "" ? n ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : n ? e.setProperty(t, a) : typeof a != "number" || a === 0 || l0.has(t) ? t === "float" ? e.cssFloat = a : e[t] = ("" + a).trim() : e[t] = a + "px"; }
    function Gu(e, t, a) { if (t != null && typeof t != "object")
        throw Error(c(62)); if (e = e.style, a != null) {
        for (var n in a)
            !a.hasOwnProperty(n) || t != null && t.hasOwnProperty(n) || (n.indexOf("--") === 0 ? e.setProperty(n, "") : n === "float" ? e.cssFloat = "" : e[n] = "");
        for (var o in t)
            n = t[o], t.hasOwnProperty(o) && a[o] !== n && Vu(e, o, n);
    }
    else
        for (var d in t)
            t.hasOwnProperty(d) && Vu(e, d, t[d]); }
    function dc(e) { if (e.indexOf("-") === -1)
        return !1; switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph": return !1;
        default: return !0;
    } }
    var n0 = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]), i0 = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Fn(e) { return i0.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e; }
    function xs() { }
    var uc = null;
    function mc(e) { return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e; }
    var Ya = null, Xa = null;
    function Qu(e) { var t = Ha(e); if (t && (e = t.stateNode)) {
        var a = e[xt] || null;
        e: switch (e = t.stateNode, t.type) {
            case "input":
                if (cc(e, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name), t = a.name, a.type === "radio" && t != null) {
                    for (a = e; a.parentNode;)
                        a = a.parentNode;
                    for (a = a.querySelectorAll('input[name="' + Ut("" + t) + '"][type="radio"]'), t = 0; t < a.length; t++) {
                        var n = a[t];
                        if (n !== e && n.form === e.form) {
                            var o = n[xt] || null;
                            if (!o)
                                throw Error(c(90));
                            cc(n, o.value, o.defaultValue, o.defaultValue, o.checked, o.defaultChecked, o.type, o.name);
                        }
                    }
                    for (t = 0; t < a.length; t++)
                        n = a[t], n.form === e.form && Bu(n);
                }
                break e;
            case "textarea":
                Lu(e, a.value, a.defaultValue);
                break e;
            case "select": t = a.value, t != null && Qa(e, !!a.multiple, t, !1);
        }
    } }
    var fc = !1;
    function Ku(e, t, a) { if (fc)
        return e(t, a); fc = !0; try {
        var n = e(t);
        return n;
    }
    finally {
        if (fc = !1, (Ya !== null || Xa !== null) && (qi(), Ya && (t = Ya, e = Xa, Xa = Ya = null, Qu(t), e)))
            for (t = 0; t < e.length; t++)
                Qu(e[t]);
    } }
    function Ul(e, t) { var a = e.stateNode; if (a === null)
        return null; var n = a[xt] || null; if (n === null)
        return null; a = n[t]; e: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
            (n = !n.disabled) || (e = e.type, n = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !n;
            break e;
        default: e = !1;
    } if (e)
        return null; if (a && typeof a != "function")
        throw Error(c(231, t, typeof a)); return a; }
    var ps = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), hc = !1;
    if (ps)
        try {
            var Ll = {};
            Object.defineProperty(Ll, "passive", { get: function () { hc = !0; } }), window.addEventListener("test", Ll, Ll), window.removeEventListener("test", Ll, Ll);
        }
        catch {
            hc = !1;
        }
    var Hs = null, xc = null, $n = null;
    function Yu() { if ($n)
        return $n; var e, t = xc, a = t.length, n, o = "value" in Hs ? Hs.value : Hs.textContent, d = o.length; for (e = 0; e < a && t[e] === o[e]; e++)
        ; var f = a - e; for (n = 1; n <= f && t[a - n] === o[d - n]; n++)
        ; return $n = o.slice(e, 1 < n ? 1 - n : void 0); }
    function Pn(e) { var t = e.keyCode; return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0; }
    function In() { return !0; }
    function Xu() { return !1; }
    function pt(e) { function t(a, n, o, d, f) { this._reactName = a, this._targetInst = o, this.type = n, this.nativeEvent = d, this.target = f, this.currentTarget = null; for (var x in e)
        e.hasOwnProperty(x) && (a = e[x], this[x] = a ? a(d) : d[x]); return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? In : Xu, this.isPropagationStopped = Xu, this; } return g(t.prototype, { preventDefault: function () { this.defaultPrevented = !0; var a = this.nativeEvent; a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = In); }, stopPropagation: function () { var a = this.nativeEvent; a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = In); }, persist: function () { }, isPersistent: In }), t; }
    var ga = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function (e) { return e.timeStamp || Date.now(); }, defaultPrevented: 0, isTrusted: 0 }, Wn = pt(ga), Hl = g({}, ga, { view: 0, detail: 0 }), r0 = pt(Hl), pc, gc, Vl, ei = g({}, Hl, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: yc, button: 0, buttons: 0, relatedTarget: function (e) { return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget; }, movementX: function (e) { return "movementX" in e ? e.movementX : (e !== Vl && (Vl && e.type === "mousemove" ? (pc = e.screenX - Vl.screenX, gc = e.screenY - Vl.screenY) : gc = pc = 0, Vl = e), pc); }, movementY: function (e) { return "movementY" in e ? e.movementY : gc; } }), Zu = pt(ei), c0 = g({}, ei, { dataTransfer: 0 }), o0 = pt(c0), d0 = g({}, Hl, { relatedTarget: 0 }), bc = pt(d0), u0 = g({}, ga, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), m0 = pt(u0), f0 = g({}, ga, { clipboardData: function (e) { return "clipboardData" in e ? e.clipboardData : window.clipboardData; } }), h0 = pt(f0), x0 = g({}, ga, { data: 0 }), Ju = pt(x0), p0 = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, g0 = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, b0 = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function y0(e) { var t = this.nativeEvent; return t.getModifierState ? t.getModifierState(e) : (e = b0[e]) ? !!t[e] : !1; }
    function yc() { return y0; }
    var v0 = g({}, Hl, { key: function (e) { if (e.key) {
            var t = p0[e.key] || e.key;
            if (t !== "Unidentified")
                return t;
        } return e.type === "keypress" ? (e = Pn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? g0[e.keyCode] || "Unidentified" : ""; }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: yc, charCode: function (e) { return e.type === "keypress" ? Pn(e) : 0; }, keyCode: function (e) { return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0; }, which: function (e) { return e.type === "keypress" ? Pn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0; } }), j0 = pt(v0), N0 = g({}, ei, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Fu = pt(N0), w0 = g({}, Hl, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: yc }), S0 = pt(w0), k0 = g({}, ga, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), C0 = pt(k0), A0 = g({}, ei, { deltaX: function (e) { return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0; }, deltaY: function (e) { return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0; }, deltaZ: 0, deltaMode: 0 }), T0 = pt(A0), E0 = g({}, ga, { newState: 0, oldState: 0 }), M0 = pt(E0), _0 = [9, 13, 27, 32], vc = ps && "CompositionEvent" in window, Gl = null;
    ps && "documentMode" in document && (Gl = document.documentMode);
    var O0 = ps && "TextEvent" in window && !Gl, $u = ps && (!vc || Gl && 8 < Gl && 11 >= Gl), Pu = " ", Iu = !1;
    function Wu(e, t) { switch (e) {
        case "keyup": return _0.indexOf(t.keyCode) !== -1;
        case "keydown": return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout": return !0;
        default: return !1;
    } }
    function em(e) { return e = e.detail, typeof e == "object" && "data" in e ? e.data : null; }
    var Za = !1;
    function D0(e, t) { switch (e) {
        case "compositionend": return em(t);
        case "keypress": return t.which !== 32 ? null : (Iu = !0, Pu);
        case "textInput": return e = t.data, e === Pu && Iu ? null : e;
        default: return null;
    } }
    function z0(e, t) { if (Za)
        return e === "compositionend" || !vc && Wu(e, t) ? (e = Yu(), $n = xc = Hs = null, Za = !1, e) : null; switch (e) {
        case "paste": return null;
        case "keypress":
            if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                if (t.char && 1 < t.char.length)
                    return t.char;
                if (t.which)
                    return String.fromCharCode(t.which);
            }
            return null;
        case "compositionend": return $u && t.locale !== "ko" ? null : t.data;
        default: return null;
    } }
    var R0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
    function tm(e) { var t = e && e.nodeName && e.nodeName.toLowerCase(); return t === "input" ? !!R0[e.type] : t === "textarea"; }
    function sm(e, t, a, n) { Ya ? Xa ? Xa.push(n) : Xa = [n] : Ya = n, t = Qi(t, "onChange"), 0 < t.length && (a = new Wn("onChange", "change", null, a, n), e.push({ event: a, listeners: t })); }
    var Ql = null, Kl = null;
    function q0(e) { Lh(e, 0); }
    function ti(e) { var t = Bl(e); if (Bu(t))
        return e; }
    function am(e, t) { if (e === "change")
        return t; }
    var lm = !1;
    if (ps) {
        var jc;
        if (ps) {
            var Nc = "oninput" in document;
            if (!Nc) {
                var nm = document.createElement("div");
                nm.setAttribute("oninput", "return;"), Nc = typeof nm.oninput == "function";
            }
            jc = Nc;
        }
        else
            jc = !1;
        lm = jc && (!document.documentMode || 9 < document.documentMode);
    }
    function im() { Ql && (Ql.detachEvent("onpropertychange", rm), Kl = Ql = null); }
    function rm(e) { if (e.propertyName === "value" && ti(Kl)) {
        var t = [];
        sm(t, Kl, e, mc(e)), Ku(q0, t);
    } }
    function B0(e, t, a) { e === "focusin" ? (im(), Ql = t, Kl = a, Ql.attachEvent("onpropertychange", rm)) : e === "focusout" && im(); }
    function U0(e) { if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return ti(Kl); }
    function L0(e, t) { if (e === "click")
        return ti(t); }
    function H0(e, t) { if (e === "input" || e === "change")
        return ti(t); }
    function V0(e, t) { return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t; }
    var Tt = typeof Object.is == "function" ? Object.is : V0;
    function Yl(e, t) { if (Tt(e, t))
        return !0; if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1; var a = Object.keys(e), n = Object.keys(t); if (a.length !== n.length)
        return !1; for (n = 0; n < a.length; n++) {
        var o = a[n];
        if (!Wr.call(t, o) || !Tt(e[o], t[o]))
            return !1;
    } return !0; }
    function cm(e) { for (; e && e.firstChild;)
        e = e.firstChild; return e; }
    function om(e, t) { var a = cm(e); e = 0; for (var n; a;) {
        if (a.nodeType === 3) {
            if (n = e + a.textContent.length, e <= t && n >= t)
                return { node: a, offset: t - e };
            e = n;
        }
        e: {
            for (; a;) {
                if (a.nextSibling) {
                    a = a.nextSibling;
                    break e;
                }
                a = a.parentNode;
            }
            a = void 0;
        }
        a = cm(a);
    } }
    function dm(e, t) { return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? dm(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1; }
    function um(e) { e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window; for (var t = Jn(e.document); t instanceof e.HTMLIFrameElement;) {
        try {
            var a = typeof t.contentWindow.location.href == "string";
        }
        catch {
            a = !1;
        }
        if (a)
            e = t.contentWindow;
        else
            break;
        t = Jn(e.document);
    } return t; }
    function wc(e) { var t = e && e.nodeName && e.nodeName.toLowerCase(); return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true"); }
    var G0 = ps && "documentMode" in document && 11 >= document.documentMode, Ja = null, Sc = null, Xl = null, kc = !1;
    function mm(e, t, a) { var n = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument; kc || Ja == null || Ja !== Jn(n) || (n = Ja, "selectionStart" in n && wc(n) ? n = { start: n.selectionStart, end: n.selectionEnd } : (n = (n.ownerDocument && n.ownerDocument.defaultView || window).getSelection(), n = { anchorNode: n.anchorNode, anchorOffset: n.anchorOffset, focusNode: n.focusNode, focusOffset: n.focusOffset }), Xl && Yl(Xl, n) || (Xl = n, n = Qi(Sc, "onSelect"), 0 < n.length && (t = new Wn("onSelect", "select", null, t, a), e.push({ event: t, listeners: n }), t.target = Ja))); }
    function ba(e, t) { var a = {}; return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a; }
    var Fa = { animationend: ba("Animation", "AnimationEnd"), animationiteration: ba("Animation", "AnimationIteration"), animationstart: ba("Animation", "AnimationStart"), transitionrun: ba("Transition", "TransitionRun"), transitionstart: ba("Transition", "TransitionStart"), transitioncancel: ba("Transition", "TransitionCancel"), transitionend: ba("Transition", "TransitionEnd") }, Cc = {}, fm = {};
    ps && (fm = document.createElement("div").style, "AnimationEvent" in window || (delete Fa.animationend.animation, delete Fa.animationiteration.animation, delete Fa.animationstart.animation), "TransitionEvent" in window || delete Fa.transitionend.transition);
    function ya(e) { if (Cc[e])
        return Cc[e]; if (!Fa[e])
        return e; var t = Fa[e], a; for (a in t)
        if (t.hasOwnProperty(a) && a in fm)
            return Cc[e] = t[a]; return e; }
    var hm = ya("animationend"), xm = ya("animationiteration"), pm = ya("animationstart"), Q0 = ya("transitionrun"), K0 = ya("transitionstart"), Y0 = ya("transitioncancel"), gm = ya("transitionend"), bm = new Map, Ac = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    Ac.push("scrollEnd");
    function Wt(e, t) { bm.set(e, t), pa(t, [e]); }
    var si = typeof reportError == "function" ? reportError : function (e) { if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var t = new window.ErrorEvent("error", { bubbles: !0, cancelable: !0, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
        if (!window.dispatchEvent(t))
            return;
    }
    else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", e);
        return;
    } console.error(e); }, Lt = [], $a = 0, Tc = 0;
    function ai() { for (var e = $a, t = Tc = $a = 0; t < e;) {
        var a = Lt[t];
        Lt[t++] = null;
        var n = Lt[t];
        Lt[t++] = null;
        var o = Lt[t];
        Lt[t++] = null;
        var d = Lt[t];
        if (Lt[t++] = null, n !== null && o !== null) {
            var f = n.pending;
            f === null ? o.next = o : (o.next = f.next, f.next = o), n.pending = o;
        }
        d !== 0 && ym(a, o, d);
    } }
    function li(e, t, a, n) { Lt[$a++] = e, Lt[$a++] = t, Lt[$a++] = a, Lt[$a++] = n, Tc |= n, e.lanes |= n, e = e.alternate, e !== null && (e.lanes |= n); }
    function Ec(e, t, a, n) { return li(e, t, a, n), ni(e); }
    function va(e, t) { return li(e, null, null, t), ni(e); }
    function ym(e, t, a) { e.lanes |= a; var n = e.alternate; n !== null && (n.lanes |= a); for (var o = !1, d = e.return; d !== null;)
        d.childLanes |= a, n = d.alternate, n !== null && (n.childLanes |= a), d.tag === 22 && (e = d.stateNode, e === null || e._visibility & 1 || (o = !0)), e = d, d = d.return; return e.tag === 3 ? (d = e.stateNode, o && t !== null && (o = 31 - At(a), e = d.hiddenUpdates, n = e[o], n === null ? e[o] = [t] : n.push(t), t.lane = a | 536870912), d) : null; }
    function ni(e) { if (50 < xn)
        throw xn = 0, Lo = null, Error(c(185)); for (var t = e.return; t !== null;)
        e = t, t = e.return; return e.tag === 3 ? e.stateNode : null; }
    var Pa = {};
    function X0(e, t, a, n) { this.tag = e, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = n, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null; }
    function Et(e, t, a, n) { return new X0(e, t, a, n); }
    function Mc(e) { return e = e.prototype, !(!e || !e.isReactComponent); }
    function gs(e, t) { var a = e.alternate; return a === null ? (a = Et(e.tag, t, e.key, e.mode), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = e.flags & 65011712, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue, t = e.dependencies, a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.refCleanup = e.refCleanup, a; }
    function vm(e, t) { e.flags &= 65011714; var a = e.alternate; return a === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type, t = a.dependencies, e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), e; }
    function ii(e, t, a, n, o, d) { var f = 0; if (n = e, typeof e == "function")
        Mc(e) && (f = 1);
    else if (typeof e == "string")
        f = Pb(e, a, me.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
        e: switch (e) {
            case de: return e = Et(31, a, t, o), e.elementType = de, e.lanes = d, e;
            case w: return ja(a.children, o, d, t);
            case T:
                f = 8, o |= 24;
                break;
            case K: return e = Et(12, a, t, o | 2), e.elementType = K, e.lanes = d, e;
            case D: return e = Et(13, a, t, o), e.elementType = D, e.lanes = d, e;
            case G: return e = Et(19, a, t, o), e.elementType = G, e.lanes = d, e;
            default:
                if (typeof e == "object" && e !== null)
                    switch (e.$$typeof) {
                        case V:
                            f = 10;
                            break e;
                        case Z:
                            f = 9;
                            break e;
                        case $:
                            f = 11;
                            break e;
                        case q:
                            f = 14;
                            break e;
                        case Y:
                            f = 16, n = null;
                            break e;
                    }
                f = 29, a = Error(c(130, e === null ? "null" : typeof e, "")), n = null;
        } return t = Et(f, a, t, o), t.elementType = e, t.type = n, t.lanes = d, t; }
    function ja(e, t, a, n) { return e = Et(7, e, n, t), e.lanes = a, e; }
    function _c(e, t, a) { return e = Et(6, e, null, t), e.lanes = a, e; }
    function jm(e) { var t = Et(18, null, null, 0); return t.stateNode = e, t; }
    function Oc(e, t, a) { return t = Et(4, e.children !== null ? e.children : [], e.key, t), t.lanes = a, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t; }
    var Nm = new WeakMap;
    function Ht(e, t) { if (typeof e == "object" && e !== null) {
        var a = Nm.get(e);
        return a !== void 0 ? a : (t = { value: e, source: t, stack: ju(t) }, Nm.set(e, t), t);
    } return { value: e, source: t, stack: ju(t) }; }
    var Ia = [], Wa = 0, ri = null, Zl = 0, Vt = [], Gt = 0, Vs = null, is = 1, rs = "";
    function bs(e, t) { Ia[Wa++] = Zl, Ia[Wa++] = ri, ri = e, Zl = t; }
    function wm(e, t, a) { Vt[Gt++] = is, Vt[Gt++] = rs, Vt[Gt++] = Vs, Vs = e; var n = is; e = rs; var o = 32 - At(n) - 1; n &= ~(1 << o), a += 1; var d = 32 - At(t) + o; if (30 < d) {
        var f = o - o % 5;
        d = (n & (1 << f) - 1).toString(32), n >>= f, o -= f, is = 1 << 32 - At(t) + o | a << o | n, rs = d + e;
    }
    else
        is = 1 << d | a << o | n, rs = e; }
    function Dc(e) { e.return !== null && (bs(e, 1), wm(e, 1, 0)); }
    function zc(e) { for (; e === ri;)
        ri = Ia[--Wa], Ia[Wa] = null, Zl = Ia[--Wa], Ia[Wa] = null; for (; e === Vs;)
        Vs = Vt[--Gt], Vt[Gt] = null, rs = Vt[--Gt], Vt[Gt] = null, is = Vt[--Gt], Vt[Gt] = null; }
    function Sm(e, t) { Vt[Gt++] = is, Vt[Gt++] = rs, Vt[Gt++] = Vs, is = t.id, rs = t.overflow, Vs = e; }
    var ct = null, _e = null, be = !1, Gs = null, Qt = !1, Rc = Error(c(519));
    function Qs(e) { var t = Error(c(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")); throw Jl(Ht(t, e)), Rc; }
    function km(e) { var t = e.stateNode, a = e.type, n = e.memoizedProps; switch (t[rt] = e, t[xt] = n, a) {
        case "dialog":
            he("cancel", t), he("close", t);
            break;
        case "iframe":
        case "object":
        case "embed":
            he("load", t);
            break;
        case "video":
        case "audio":
            for (a = 0; a < gn.length; a++)
                he(gn[a], t);
            break;
        case "source":
            he("error", t);
            break;
        case "img":
        case "image":
        case "link":
            he("error", t), he("load", t);
            break;
        case "details":
            he("toggle", t);
            break;
        case "input":
            he("invalid", t), Uu(t, n.value, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name, !0);
            break;
        case "select":
            he("invalid", t);
            break;
        case "textarea": he("invalid", t), Hu(t, n.value, n.defaultValue, n.children);
    } a = n.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || n.suppressHydrationWarning === !0 || Qh(t.textContent, a) ? (n.popover != null && (he("beforetoggle", t), he("toggle", t)), n.onScroll != null && he("scroll", t), n.onScrollEnd != null && he("scrollend", t), n.onClick != null && (t.onclick = xs), t = !0) : t = !1, t || Qs(e, !0); }
    function Cm(e) { for (ct = e.return; ct;)
        switch (ct.tag) {
            case 5:
            case 31:
            case 13:
                Qt = !1;
                return;
            case 27:
            case 3:
                Qt = !0;
                return;
            default: ct = ct.return;
        } }
    function el(e) { if (e !== ct)
        return !1; if (!be)
        return Cm(e), be = !0, !1; var t = e.tag, a; if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = e.type, a = !(a !== "form" && a !== "button") || ed(e.type, e.memoizedProps)), a = !a), a && _e && Qs(e), Cm(e), t === 13) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
            throw Error(c(317));
        _e = Ih(e);
    }
    else if (t === 31) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
            throw Error(c(317));
        _e = Ih(e);
    }
    else
        t === 27 ? (t = _e, aa(e.type) ? (e = nd, nd = null, _e = e) : _e = t) : _e = ct ? Yt(e.stateNode.nextSibling) : null; return !0; }
    function Na() { _e = ct = null, be = !1; }
    function qc() { var e = Gs; return e !== null && (vt === null ? vt = e : vt.push.apply(vt, e), Gs = null), e; }
    function Jl(e) { Gs === null ? Gs = [e] : Gs.push(e); }
    var Bc = we(null), wa = null, ys = null;
    function Ks(e, t, a) { se(Bc, t._currentValue), t._currentValue = a; }
    function vs(e) { e._currentValue = Bc.current, ne(Bc); }
    function Uc(e, t, a) { for (; e !== null;) {
        var n = e.alternate;
        if ((e.childLanes & t) !== t ? (e.childLanes |= t, n !== null && (n.childLanes |= t)) : n !== null && (n.childLanes & t) !== t && (n.childLanes |= t), e === a)
            break;
        e = e.return;
    } }
    function Lc(e, t, a, n) { var o = e.child; for (o !== null && (o.return = e); o !== null;) {
        var d = o.dependencies;
        if (d !== null) {
            var f = o.child;
            d = d.firstContext;
            e: for (; d !== null;) {
                var x = d;
                d = o;
                for (var N = 0; N < t.length; N++)
                    if (x.context === t[N]) {
                        d.lanes |= a, x = d.alternate, x !== null && (x.lanes |= a), Uc(d.return, a, e), n || (f = null);
                        break e;
                    }
                d = x.next;
            }
        }
        else if (o.tag === 18) {
            if (f = o.return, f === null)
                throw Error(c(341));
            f.lanes |= a, d = f.alternate, d !== null && (d.lanes |= a), Uc(f, a, e), f = null;
        }
        else
            f = o.child;
        if (f !== null)
            f.return = o;
        else
            for (f = o; f !== null;) {
                if (f === e) {
                    f = null;
                    break;
                }
                if (o = f.sibling, o !== null) {
                    o.return = f.return, f = o;
                    break;
                }
                f = f.return;
            }
        o = f;
    } }
    function tl(e, t, a, n) { e = null; for (var o = t, d = !1; o !== null;) {
        if (!d) {
            if ((o.flags & 524288) !== 0)
                d = !0;
            else if ((o.flags & 262144) !== 0)
                break;
        }
        if (o.tag === 10) {
            var f = o.alternate;
            if (f === null)
                throw Error(c(387));
            if (f = f.memoizedProps, f !== null) {
                var x = o.type;
                Tt(o.pendingProps.value, f.value) || (e !== null ? e.push(x) : e = [x]);
            }
        }
        else if (o === ze.current) {
            if (f = o.alternate, f === null)
                throw Error(c(387));
            f.memoizedState.memoizedState !== o.memoizedState.memoizedState && (e !== null ? e.push(Nn) : e = [Nn]);
        }
        o = o.return;
    } e !== null && Lc(t, e, a, n), t.flags |= 262144; }
    function ci(e) { for (e = e.firstContext; e !== null;) {
        if (!Tt(e.context._currentValue, e.memoizedValue))
            return !0;
        e = e.next;
    } return !1; }
    function Sa(e) { wa = e, ys = null, e = e.dependencies, e !== null && (e.firstContext = null); }
    function ot(e) { return Am(wa, e); }
    function oi(e, t) { return wa === null && Sa(e), Am(e, t); }
    function Am(e, t) { var a = t._currentValue; if (t = { context: t, memoizedValue: a, next: null }, ys === null) {
        if (e === null)
            throw Error(c(308));
        ys = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    }
    else
        ys = ys.next = t; return a; }
    var Z0 = typeof AbortController < "u" ? AbortController : function () { var e = [], t = this.signal = { aborted: !1, addEventListener: function (a, n) { e.push(n); } }; this.abort = function () { t.aborted = !0, e.forEach(function (a) { return a(); }); }; }, J0 = l.unstable_scheduleCallback, F0 = l.unstable_NormalPriority, Qe = { $$typeof: V, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
    function Hc() { return { controller: new Z0, data: new Map, refCount: 0 }; }
    function Fl(e) { e.refCount--, e.refCount === 0 && J0(F0, function () { e.controller.abort(); }); }
    var $l = null, Vc = 0, sl = 0, al = null;
    function $0(e, t) { if ($l === null) {
        var a = $l = [];
        Vc = 0, sl = Yo(), al = { status: "pending", value: void 0, then: function (n) { a.push(n); } };
    } return Vc++, t.then(Tm, Tm), t; }
    function Tm() { if (--Vc === 0 && $l !== null) {
        al !== null && (al.status = "fulfilled");
        var e = $l;
        $l = null, sl = 0, al = null;
        for (var t = 0; t < e.length; t++)
            (0, e[t])();
    } }
    function P0(e, t) { var a = [], n = { status: "pending", value: null, reason: null, then: function (o) { a.push(o); } }; return e.then(function () { n.status = "fulfilled", n.value = t; for (var o = 0; o < a.length; o++)
        (0, a[o])(t); }, function (o) { for (n.status = "rejected", n.reason = o, o = 0; o < a.length; o++)
        (0, a[o])(void 0); }), n; }
    var Em = E.S;
    E.S = function (e, t) { fh = kt(), typeof t == "object" && t !== null && typeof t.then == "function" && $0(e, t), Em !== null && Em(e, t); };
    var ka = we(null);
    function Gc() { var e = ka.current; return e !== null ? e : Me.pooledCache; }
    function di(e, t) { t === null ? se(ka, ka.current) : se(ka, t.pool); }
    function Mm() { var e = Gc(); return e === null ? null : { parent: Qe._currentValue, pool: e }; }
    var ll = Error(c(460)), Qc = Error(c(474)), ui = Error(c(542)), mi = { then: function () { } };
    function _m(e) { return e = e.status, e === "fulfilled" || e === "rejected"; }
    function Om(e, t, a) { switch (a = e[a], a === void 0 ? e.push(t) : a !== t && (t.then(xs, xs), t = a), t.status) {
        case "fulfilled": return t.value;
        case "rejected": throw e = t.reason, zm(e), e;
        default:
            if (typeof t.status == "string")
                t.then(xs, xs);
            else {
                if (e = Me, e !== null && 100 < e.shellSuspendCounter)
                    throw Error(c(482));
                e = t, e.status = "pending", e.then(function (n) { if (t.status === "pending") {
                    var o = t;
                    o.status = "fulfilled", o.value = n;
                } }, function (n) { if (t.status === "pending") {
                    var o = t;
                    o.status = "rejected", o.reason = n;
                } });
            }
            switch (t.status) {
                case "fulfilled": return t.value;
                case "rejected": throw e = t.reason, zm(e), e;
            }
            throw Aa = t, ll;
    } }
    function Ca(e) { try {
        var t = e._init;
        return t(e._payload);
    }
    catch (a) {
        throw a !== null && typeof a == "object" && typeof a.then == "function" ? (Aa = a, ll) : a;
    } }
    var Aa = null;
    function Dm() { if (Aa === null)
        throw Error(c(459)); var e = Aa; return Aa = null, e; }
    function zm(e) { if (e === ll || e === ui)
        throw Error(c(483)); }
    var nl = null, Pl = 0;
    function fi(e) { var t = Pl; return Pl += 1, nl === null && (nl = []), Om(nl, e, t); }
    function Il(e, t) { t = t.props.ref, e.ref = t !== void 0 ? t : null; }
    function hi(e, t) { throw t.$$typeof === k ? Error(c(525)) : (e = Object.prototype.toString.call(t), Error(c(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e))); }
    function Rm(e) { function t(A, S) { if (e) {
        var M = A.deletions;
        M === null ? (A.deletions = [S], A.flags |= 16) : M.push(S);
    } } function a(A, S) { if (!e)
        return null; for (; S !== null;)
        t(A, S), S = S.sibling; return null; } function n(A) { for (var S = new Map; A !== null;)
        A.key !== null ? S.set(A.key, A) : S.set(A.index, A), A = A.sibling; return S; } function o(A, S) { return A = gs(A, S), A.index = 0, A.sibling = null, A; } function d(A, S, M) { return A.index = M, e ? (M = A.alternate, M !== null ? (M = M.index, M < S ? (A.flags |= 67108866, S) : M) : (A.flags |= 67108866, S)) : (A.flags |= 1048576, S); } function f(A) { return e && A.alternate === null && (A.flags |= 67108866), A; } function x(A, S, M, L) { return S === null || S.tag !== 6 ? (S = _c(M, A.mode, L), S.return = A, S) : (S = o(S, M), S.return = A, S); } function N(A, S, M, L) { var te = M.type; return te === w ? U(A, S, M.props.children, L, M.key) : S !== null && (S.elementType === te || typeof te == "object" && te !== null && te.$$typeof === Y && Ca(te) === S.type) ? (S = o(S, M.props), Il(S, M), S.return = A, S) : (S = ii(M.type, M.key, M.props, null, A.mode, L), Il(S, M), S.return = A, S); } function _(A, S, M, L) { return S === null || S.tag !== 4 || S.stateNode.containerInfo !== M.containerInfo || S.stateNode.implementation !== M.implementation ? (S = Oc(M, A.mode, L), S.return = A, S) : (S = o(S, M.children || []), S.return = A, S); } function U(A, S, M, L, te) { return S === null || S.tag !== 7 ? (S = ja(M, A.mode, L, te), S.return = A, S) : (S = o(S, M), S.return = A, S); } function H(A, S, M) { if (typeof S == "string" && S !== "" || typeof S == "number" || typeof S == "bigint")
        return S = _c("" + S, A.mode, M), S.return = A, S; if (typeof S == "object" && S !== null) {
        switch (S.$$typeof) {
            case C: return M = ii(S.type, S.key, S.props, null, A.mode, M), Il(M, S), M.return = A, M;
            case j: return S = Oc(S, A.mode, M), S.return = A, S;
            case Y: return S = Ca(S), H(A, S, M);
        }
        if (Ue(S) || Se(S))
            return S = ja(S, A.mode, M, null), S.return = A, S;
        if (typeof S.then == "function")
            return H(A, fi(S), M);
        if (S.$$typeof === V)
            return H(A, oi(A, S), M);
        hi(A, S);
    } return null; } function O(A, S, M, L) { var te = S !== null ? S.key : null; if (typeof M == "string" && M !== "" || typeof M == "number" || typeof M == "bigint")
        return te !== null ? null : x(A, S, "" + M, L); if (typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
            case C: return M.key === te ? N(A, S, M, L) : null;
            case j: return M.key === te ? _(A, S, M, L) : null;
            case Y: return M = Ca(M), O(A, S, M, L);
        }
        if (Ue(M) || Se(M))
            return te !== null ? null : U(A, S, M, L, null);
        if (typeof M.then == "function")
            return O(A, S, fi(M), L);
        if (M.$$typeof === V)
            return O(A, S, oi(A, M), L);
        hi(A, M);
    } return null; } function R(A, S, M, L, te) { if (typeof L == "string" && L !== "" || typeof L == "number" || typeof L == "bigint")
        return A = A.get(M) || null, x(S, A, "" + L, te); if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
            case C: return A = A.get(L.key === null ? M : L.key) || null, N(S, A, L, te);
            case j: return A = A.get(L.key === null ? M : L.key) || null, _(S, A, L, te);
            case Y: return L = Ca(L), R(A, S, M, L, te);
        }
        if (Ue(L) || Se(L))
            return A = A.get(M) || null, U(S, A, L, te, null);
        if (typeof L.then == "function")
            return R(A, S, M, fi(L), te);
        if (L.$$typeof === V)
            return R(A, S, M, oi(S, L), te);
        hi(S, L);
    } return null; } function P(A, S, M, L) { for (var te = null, ve = null, ee = S, ce = S = 0, ge = null; ee !== null && ce < M.length; ce++) {
        ee.index > ce ? (ge = ee, ee = null) : ge = ee.sibling;
        var je = O(A, ee, M[ce], L);
        if (je === null) {
            ee === null && (ee = ge);
            break;
        }
        e && ee && je.alternate === null && t(A, ee), S = d(je, S, ce), ve === null ? te = je : ve.sibling = je, ve = je, ee = ge;
    } if (ce === M.length)
        return a(A, ee), be && bs(A, ce), te; if (ee === null) {
        for (; ce < M.length; ce++)
            ee = H(A, M[ce], L), ee !== null && (S = d(ee, S, ce), ve === null ? te = ee : ve.sibling = ee, ve = ee);
        return be && bs(A, ce), te;
    } for (ee = n(ee); ce < M.length; ce++)
        ge = R(ee, A, ce, M[ce], L), ge !== null && (e && ge.alternate !== null && ee.delete(ge.key === null ? ce : ge.key), S = d(ge, S, ce), ve === null ? te = ge : ve.sibling = ge, ve = ge); return e && ee.forEach(function (ca) { return t(A, ca); }), be && bs(A, ce), te; } function ae(A, S, M, L) { if (M == null)
        throw Error(c(151)); for (var te = null, ve = null, ee = S, ce = S = 0, ge = null, je = M.next(); ee !== null && !je.done; ce++, je = M.next()) {
        ee.index > ce ? (ge = ee, ee = null) : ge = ee.sibling;
        var ca = O(A, ee, je.value, L);
        if (ca === null) {
            ee === null && (ee = ge);
            break;
        }
        e && ee && ca.alternate === null && t(A, ee), S = d(ca, S, ce), ve === null ? te = ca : ve.sibling = ca, ve = ca, ee = ge;
    } if (je.done)
        return a(A, ee), be && bs(A, ce), te; if (ee === null) {
        for (; !je.done; ce++, je = M.next())
            je = H(A, je.value, L), je !== null && (S = d(je, S, ce), ve === null ? te = je : ve.sibling = je, ve = je);
        return be && bs(A, ce), te;
    } for (ee = n(ee); !je.done; ce++, je = M.next())
        je = R(ee, A, ce, je.value, L), je !== null && (e && je.alternate !== null && ee.delete(je.key === null ? ce : je.key), S = d(je, S, ce), ve === null ? te = je : ve.sibling = je, ve = je); return e && ee.forEach(function (cy) { return t(A, cy); }), be && bs(A, ce), te; } function Ee(A, S, M, L) { if (typeof M == "object" && M !== null && M.type === w && M.key === null && (M = M.props.children), typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
            case C:
                e: {
                    for (var te = M.key; S !== null;) {
                        if (S.key === te) {
                            if (te = M.type, te === w) {
                                if (S.tag === 7) {
                                    a(A, S.sibling), L = o(S, M.props.children), L.return = A, A = L;
                                    break e;
                                }
                            }
                            else if (S.elementType === te || typeof te == "object" && te !== null && te.$$typeof === Y && Ca(te) === S.type) {
                                a(A, S.sibling), L = o(S, M.props), Il(L, M), L.return = A, A = L;
                                break e;
                            }
                            a(A, S);
                            break;
                        }
                        else
                            t(A, S);
                        S = S.sibling;
                    }
                    M.type === w ? (L = ja(M.props.children, A.mode, L, M.key), L.return = A, A = L) : (L = ii(M.type, M.key, M.props, null, A.mode, L), Il(L, M), L.return = A, A = L);
                }
                return f(A);
            case j:
                e: {
                    for (te = M.key; S !== null;) {
                        if (S.key === te)
                            if (S.tag === 4 && S.stateNode.containerInfo === M.containerInfo && S.stateNode.implementation === M.implementation) {
                                a(A, S.sibling), L = o(S, M.children || []), L.return = A, A = L;
                                break e;
                            }
                            else {
                                a(A, S);
                                break;
                            }
                        else
                            t(A, S);
                        S = S.sibling;
                    }
                    L = Oc(M, A.mode, L), L.return = A, A = L;
                }
                return f(A);
            case Y: return M = Ca(M), Ee(A, S, M, L);
        }
        if (Ue(M))
            return P(A, S, M, L);
        if (Se(M)) {
            if (te = Se(M), typeof te != "function")
                throw Error(c(150));
            return M = te.call(M), ae(A, S, M, L);
        }
        if (typeof M.then == "function")
            return Ee(A, S, fi(M), L);
        if (M.$$typeof === V)
            return Ee(A, S, oi(A, M), L);
        hi(A, M);
    } return typeof M == "string" && M !== "" || typeof M == "number" || typeof M == "bigint" ? (M = "" + M, S !== null && S.tag === 6 ? (a(A, S.sibling), L = o(S, M), L.return = A, A = L) : (a(A, S), L = _c(M, A.mode, L), L.return = A, A = L), f(A)) : a(A, S); } return function (A, S, M, L) { try {
        Pl = 0;
        var te = Ee(A, S, M, L);
        return nl = null, te;
    }
    catch (ee) {
        if (ee === ll || ee === ui)
            throw ee;
        var ve = Et(29, ee, null, A.mode);
        return ve.lanes = L, ve.return = A, ve;
    }
    finally { } }; }
    var Ta = Rm(!0), qm = Rm(!1), Ys = !1;
    function Kc(e) { e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, lanes: 0, hiddenCallbacks: null }, callbacks: null }; }
    function Yc(e, t) { e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, callbacks: null }); }
    function Xs(e) { return { lane: e, tag: 0, payload: null, callback: null, next: null }; }
    function Zs(e, t, a) { var n = e.updateQueue; if (n === null)
        return null; if (n = n.shared, (Ne & 2) !== 0) {
        var o = n.pending;
        return o === null ? t.next = t : (t.next = o.next, o.next = t), n.pending = t, t = ni(e), ym(e, null, a), t;
    } return li(e, n, t, a), ni(e); }
    function Wl(e, t, a) { if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
        var n = t.lanes;
        n &= e.pendingLanes, a |= n, t.lanes = a, Au(e, a);
    } }
    function Xc(e, t) { var a = e.updateQueue, n = e.alternate; if (n !== null && (n = n.updateQueue, a === n)) {
        var o = null, d = null;
        if (a = a.firstBaseUpdate, a !== null) {
            do {
                var f = { lane: a.lane, tag: a.tag, payload: a.payload, callback: null, next: null };
                d === null ? o = d = f : d = d.next = f, a = a.next;
            } while (a !== null);
            d === null ? o = d = t : d = d.next = t;
        }
        else
            o = d = t;
        a = { baseState: n.baseState, firstBaseUpdate: o, lastBaseUpdate: d, shared: n.shared, callbacks: n.callbacks }, e.updateQueue = a;
        return;
    } e = a.lastBaseUpdate, e === null ? a.firstBaseUpdate = t : e.next = t, a.lastBaseUpdate = t; }
    var Zc = !1;
    function en() { if (Zc) {
        var e = al;
        if (e !== null)
            throw e;
    } }
    function tn(e, t, a, n) { Zc = !1; var o = e.updateQueue; Ys = !1; var d = o.firstBaseUpdate, f = o.lastBaseUpdate, x = o.shared.pending; if (x !== null) {
        o.shared.pending = null;
        var N = x, _ = N.next;
        N.next = null, f === null ? d = _ : f.next = _, f = N;
        var U = e.alternate;
        U !== null && (U = U.updateQueue, x = U.lastBaseUpdate, x !== f && (x === null ? U.firstBaseUpdate = _ : x.next = _, U.lastBaseUpdate = N));
    } if (d !== null) {
        var H = o.baseState;
        f = 0, U = _ = N = null, x = d;
        do {
            var O = x.lane & -536870913, R = O !== x.lane;
            if (R ? (pe & O) === O : (n & O) === O) {
                O !== 0 && O === sl && (Zc = !0), U !== null && (U = U.next = { lane: 0, tag: x.tag, payload: x.payload, callback: null, next: null });
                e: {
                    var P = e, ae = x;
                    O = t;
                    var Ee = a;
                    switch (ae.tag) {
                        case 1:
                            if (P = ae.payload, typeof P == "function") {
                                H = P.call(Ee, H, O);
                                break e;
                            }
                            H = P;
                            break e;
                        case 3: P.flags = P.flags & -65537 | 128;
                        case 0:
                            if (P = ae.payload, O = typeof P == "function" ? P.call(Ee, H, O) : P, O == null)
                                break e;
                            H = g({}, H, O);
                            break e;
                        case 2: Ys = !0;
                    }
                }
                O = x.callback, O !== null && (e.flags |= 64, R && (e.flags |= 8192), R = o.callbacks, R === null ? o.callbacks = [O] : R.push(O));
            }
            else
                R = { lane: O, tag: x.tag, payload: x.payload, callback: x.callback, next: null }, U === null ? (_ = U = R, N = H) : U = U.next = R, f |= O;
            if (x = x.next, x === null) {
                if (x = o.shared.pending, x === null)
                    break;
                R = x, x = R.next, R.next = null, o.lastBaseUpdate = R, o.shared.pending = null;
            }
        } while (!0);
        U === null && (N = H), o.baseState = N, o.firstBaseUpdate = _, o.lastBaseUpdate = U, d === null && (o.shared.lanes = 0), Is |= f, e.lanes = f, e.memoizedState = H;
    } }
    function Bm(e, t) { if (typeof e != "function")
        throw Error(c(191, e)); e.call(t); }
    function Um(e, t) { var a = e.callbacks; if (a !== null)
        for (e.callbacks = null, e = 0; e < a.length; e++)
            Bm(a[e], t); }
    var il = we(null), xi = we(0);
    function Lm(e, t) { e = Es, se(xi, e), se(il, t), Es = e | t.baseLanes; }
    function Jc() { se(xi, Es), se(il, il.current); }
    function Fc() { Es = xi.current, ne(il), ne(xi); }
    var Mt = we(null), Kt = null;
    function Js(e) { var t = e.alternate; se(Le, Le.current & 1), se(Mt, e), Kt === null && (t === null || il.current !== null || t.memoizedState !== null) && (Kt = e); }
    function $c(e) { se(Le, Le.current), se(Mt, e), Kt === null && (Kt = e); }
    function Hm(e) { e.tag === 22 ? (se(Le, Le.current), se(Mt, e), Kt === null && (Kt = e)) : Fs(); }
    function Fs() { se(Le, Le.current), se(Mt, Mt.current); }
    function _t(e) { ne(Mt), Kt === e && (Kt = null), ne(Le); }
    var Le = we(0);
    function pi(e) { for (var t = e; t !== null;) {
        if (t.tag === 13) {
            var a = t.memoizedState;
            if (a !== null && (a = a.dehydrated, a === null || ad(a) || ld(a)))
                return t;
        }
        else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
            if ((t.flags & 128) !== 0)
                return t;
        }
        else if (t.child !== null) {
            t.child.return = t, t = t.child;
            continue;
        }
        if (t === e)
            break;
        for (; t.sibling === null;) {
            if (t.return === null || t.return === e)
                return null;
            t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
    } return null; }
    var js = 0, ie = null, Ae = null, Ke = null, gi = !1, rl = !1, Ea = !1, bi = 0, sn = 0, cl = null, I0 = 0;
    function qe() { throw Error(c(321)); }
    function Pc(e, t) { if (t === null)
        return !1; for (var a = 0; a < t.length && a < e.length; a++)
        if (!Tt(e[a], t[a]))
            return !1; return !0; }
    function Ic(e, t, a, n, o, d) { return js = d, ie = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, E.H = e === null || e.memoizedState === null ? Sf : ho, Ea = !1, d = a(n, o), Ea = !1, rl && (d = Gm(t, a, n, o)), Vm(e), d; }
    function Vm(e) { E.H = nn; var t = Ae !== null && Ae.next !== null; if (js = 0, Ke = Ae = ie = null, gi = !1, sn = 0, cl = null, t)
        throw Error(c(300)); e === null || Ye || (e = e.dependencies, e !== null && ci(e) && (Ye = !0)); }
    function Gm(e, t, a, n) { ie = e; var o = 0; do {
        if (rl && (cl = null), sn = 0, rl = !1, 25 <= o)
            throw Error(c(301));
        if (o += 1, Ke = Ae = null, e.updateQueue != null) {
            var d = e.updateQueue;
            d.lastEffect = null, d.events = null, d.stores = null, d.memoCache != null && (d.memoCache.index = 0);
        }
        E.H = kf, d = t(a, n);
    } while (rl); return d; }
    function W0() { var e = E.H, t = e.useState()[0]; return t = typeof t.then == "function" ? an(t) : t, e = e.useState()[0], (Ae !== null ? Ae.memoizedState : null) !== e && (ie.flags |= 1024), t; }
    function Wc() { var e = bi !== 0; return bi = 0, e; }
    function eo(e, t, a) { t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~a; }
    function to(e) { if (gi) {
        for (e = e.memoizedState; e !== null;) {
            var t = e.queue;
            t !== null && (t.pending = null), e = e.next;
        }
        gi = !1;
    } js = 0, Ke = Ae = ie = null, rl = !1, sn = bi = 0, cl = null; }
    function ht() { var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }; return Ke === null ? ie.memoizedState = Ke = e : Ke = Ke.next = e, Ke; }
    function He() { if (Ae === null) {
        var e = ie.alternate;
        e = e !== null ? e.memoizedState : null;
    }
    else
        e = Ae.next; var t = Ke === null ? ie.memoizedState : Ke.next; if (t !== null)
        Ke = t, Ae = e;
    else {
        if (e === null)
            throw ie.alternate === null ? Error(c(467)) : Error(c(310));
        Ae = e, e = { memoizedState: Ae.memoizedState, baseState: Ae.baseState, baseQueue: Ae.baseQueue, queue: Ae.queue, next: null }, Ke === null ? ie.memoizedState = Ke = e : Ke = Ke.next = e;
    } return Ke; }
    function yi() { return { lastEffect: null, events: null, stores: null, memoCache: null }; }
    function an(e) { var t = sn; return sn += 1, cl === null && (cl = []), e = Om(cl, e, t), t = ie, (Ke === null ? t.memoizedState : Ke.next) === null && (t = t.alternate, E.H = t === null || t.memoizedState === null ? Sf : ho), e; }
    function vi(e) { if (e !== null && typeof e == "object") {
        if (typeof e.then == "function")
            return an(e);
        if (e.$$typeof === V)
            return ot(e);
    } throw Error(c(438, String(e))); }
    function so(e) { var t = null, a = ie.updateQueue; if (a !== null && (t = a.memoCache), t == null) {
        var n = ie.alternate;
        n !== null && (n = n.updateQueue, n !== null && (n = n.memoCache, n != null && (t = { data: n.data.map(function (o) { return o.slice(); }), index: 0 })));
    } if (t == null && (t = { data: [], index: 0 }), a === null && (a = yi(), ie.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0)
        for (a = t.data[t.index] = Array(e), n = 0; n < e; n++)
            a[n] = it; return t.index++, a; }
    function Ns(e, t) { return typeof t == "function" ? t(e) : t; }
    function ji(e) { var t = He(); return ao(t, Ae, e); }
    function ao(e, t, a) { var n = e.queue; if (n === null)
        throw Error(c(311)); n.lastRenderedReducer = a; var o = e.baseQueue, d = n.pending; if (d !== null) {
        if (o !== null) {
            var f = o.next;
            o.next = d.next, d.next = f;
        }
        t.baseQueue = o = d, n.pending = null;
    } if (d = e.baseState, o === null)
        e.memoizedState = d;
    else {
        t = o.next;
        var x = f = null, N = null, _ = t, U = !1;
        do {
            var H = _.lane & -536870913;
            if (H !== _.lane ? (pe & H) === H : (js & H) === H) {
                var O = _.revertLane;
                if (O === 0)
                    N !== null && (N = N.next = { lane: 0, revertLane: 0, gesture: null, action: _.action, hasEagerState: _.hasEagerState, eagerState: _.eagerState, next: null }), H === sl && (U = !0);
                else if ((js & O) === O) {
                    _ = _.next, O === sl && (U = !0);
                    continue;
                }
                else
                    H = { lane: 0, revertLane: _.revertLane, gesture: null, action: _.action, hasEagerState: _.hasEagerState, eagerState: _.eagerState, next: null }, N === null ? (x = N = H, f = d) : N = N.next = H, ie.lanes |= O, Is |= O;
                H = _.action, Ea && a(d, H), d = _.hasEagerState ? _.eagerState : a(d, H);
            }
            else
                O = { lane: H, revertLane: _.revertLane, gesture: _.gesture, action: _.action, hasEagerState: _.hasEagerState, eagerState: _.eagerState, next: null }, N === null ? (x = N = O, f = d) : N = N.next = O, ie.lanes |= H, Is |= H;
            _ = _.next;
        } while (_ !== null && _ !== t);
        if (N === null ? f = d : N.next = x, !Tt(d, e.memoizedState) && (Ye = !0, U && (a = al, a !== null)))
            throw a;
        e.memoizedState = d, e.baseState = f, e.baseQueue = N, n.lastRenderedState = d;
    } return o === null && (n.lanes = 0), [e.memoizedState, n.dispatch]; }
    function lo(e) { var t = He(), a = t.queue; if (a === null)
        throw Error(c(311)); a.lastRenderedReducer = e; var n = a.dispatch, o = a.pending, d = t.memoizedState; if (o !== null) {
        a.pending = null;
        var f = o = o.next;
        do
            d = e(d, f.action), f = f.next;
        while (f !== o);
        Tt(d, t.memoizedState) || (Ye = !0), t.memoizedState = d, t.baseQueue === null && (t.baseState = d), a.lastRenderedState = d;
    } return [d, n]; }
    function Qm(e, t, a) { var n = ie, o = He(), d = be; if (d) {
        if (a === void 0)
            throw Error(c(407));
        a = a();
    }
    else
        a = t(); var f = !Tt((Ae || o).memoizedState, a); if (f && (o.memoizedState = a, Ye = !0), o = o.queue, ro(Xm.bind(null, n, o, e), [e]), o.getSnapshot !== t || f || Ke !== null && Ke.memoizedState.tag & 1) {
        if (n.flags |= 2048, ol(9, { destroy: void 0 }, Ym.bind(null, n, o, a, t), null), Me === null)
            throw Error(c(349));
        d || (js & 127) !== 0 || Km(n, t, a);
    } return a; }
    function Km(e, t, a) { e.flags |= 16384, e = { getSnapshot: t, value: a }, t = ie.updateQueue, t === null ? (t = yi(), ie.updateQueue = t, t.stores = [e]) : (a = t.stores, a === null ? t.stores = [e] : a.push(e)); }
    function Ym(e, t, a, n) { t.value = a, t.getSnapshot = n, Zm(t) && Jm(e); }
    function Xm(e, t, a) { return a(function () { Zm(t) && Jm(e); }); }
    function Zm(e) { var t = e.getSnapshot; e = e.value; try {
        var a = t();
        return !Tt(e, a);
    }
    catch {
        return !0;
    } }
    function Jm(e) { var t = va(e, 2); t !== null && jt(t, e, 2); }
    function no(e) { var t = ht(); if (typeof e == "function") {
        var a = e;
        if (e = a(), Ea) {
            Us(!0);
            try {
                a();
            }
            finally {
                Us(!1);
            }
        }
    } return t.memoizedState = t.baseState = e, t.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ns, lastRenderedState: e }, t; }
    function Fm(e, t, a, n) { return e.baseState = a, ao(e, Ae, typeof n == "function" ? n : Ns); }
    function eb(e, t, a, n, o) { if (Si(e))
        throw Error(c(485)); if (e = t.action, e !== null) {
        var d = { payload: o, action: e, next: null, isTransition: !0, status: "pending", value: null, reason: null, listeners: [], then: function (f) { d.listeners.push(f); } };
        E.T !== null ? a(!0) : d.isTransition = !1, n(d), a = t.pending, a === null ? (d.next = t.pending = d, $m(t, d)) : (d.next = a.next, t.pending = a.next = d);
    } }
    function $m(e, t) { var a = t.action, n = t.payload, o = e.state; if (t.isTransition) {
        var d = E.T, f = {};
        E.T = f;
        try {
            var x = a(o, n), N = E.S;
            N !== null && N(f, x), Pm(e, t, x);
        }
        catch (_) {
            io(e, t, _);
        }
        finally {
            d !== null && f.types !== null && (d.types = f.types), E.T = d;
        }
    }
    else
        try {
            d = a(o, n), Pm(e, t, d);
        }
        catch (_) {
            io(e, t, _);
        } }
    function Pm(e, t, a) { a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(function (n) { Im(e, t, n); }, function (n) { return io(e, t, n); }) : Im(e, t, a); }
    function Im(e, t, a) { t.status = "fulfilled", t.value = a, Wm(t), e.state = a, t = e.pending, t !== null && (a = t.next, a === t ? e.pending = null : (a = a.next, t.next = a, $m(e, a))); }
    function io(e, t, a) { var n = e.pending; if (e.pending = null, n !== null) {
        n = n.next;
        do
            t.status = "rejected", t.reason = a, Wm(t), t = t.next;
        while (t !== n);
    } e.action = null; }
    function Wm(e) { e = e.listeners; for (var t = 0; t < e.length; t++)
        (0, e[t])(); }
    function ef(e, t) { return t; }
    function tf(e, t) { if (be) {
        var a = Me.formState;
        if (a !== null) {
            e: {
                var n = ie;
                if (be) {
                    if (_e) {
                        t: {
                            for (var o = _e, d = Qt; o.nodeType !== 8;) {
                                if (!d) {
                                    o = null;
                                    break t;
                                }
                                if (o = Yt(o.nextSibling), o === null) {
                                    o = null;
                                    break t;
                                }
                            }
                            d = o.data, o = d === "F!" || d === "F" ? o : null;
                        }
                        if (o) {
                            _e = Yt(o.nextSibling), n = o.data === "F!";
                            break e;
                        }
                    }
                    Qs(n);
                }
                n = !1;
            }
            n && (t = a[0]);
        }
    } return a = ht(), a.memoizedState = a.baseState = t, n = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: ef, lastRenderedState: t }, a.queue = n, a = jf.bind(null, ie, n), n.dispatch = a, n = no(!1), d = fo.bind(null, ie, !1, n.queue), n = ht(), o = { state: t, dispatch: null, action: e, pending: null }, n.queue = o, a = eb.bind(null, ie, o, d, a), o.dispatch = a, n.memoizedState = e, [t, a, !1]; }
    function sf(e) { var t = He(); return af(t, Ae, e); }
    function af(e, t, a) { if (t = ao(e, t, ef)[0], e = ji(Ns)[0], typeof t == "object" && t !== null && typeof t.then == "function")
        try {
            var n = an(t);
        }
        catch (f) {
            throw f === ll ? ui : f;
        }
    else
        n = t; t = He(); var o = t.queue, d = o.dispatch; return a !== t.memoizedState && (ie.flags |= 2048, ol(9, { destroy: void 0 }, tb.bind(null, o, a), null)), [n, d, e]; }
    function tb(e, t) { e.action = t; }
    function lf(e) { var t = He(), a = Ae; if (a !== null)
        return af(t, a, e); He(), t = t.memoizedState, a = He(); var n = a.queue.dispatch; return a.memoizedState = e, [t, n, !1]; }
    function ol(e, t, a, n) { return e = { tag: e, create: a, deps: n, inst: t, next: null }, t = ie.updateQueue, t === null && (t = yi(), ie.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = e.next = e : (n = a.next, a.next = e, e.next = n, t.lastEffect = e), e; }
    function nf() { return He().memoizedState; }
    function Ni(e, t, a, n) { var o = ht(); ie.flags |= e, o.memoizedState = ol(1 | t, { destroy: void 0 }, a, n === void 0 ? null : n); }
    function wi(e, t, a, n) { var o = He(); n = n === void 0 ? null : n; var d = o.memoizedState.inst; Ae !== null && n !== null && Pc(n, Ae.memoizedState.deps) ? o.memoizedState = ol(t, d, a, n) : (ie.flags |= e, o.memoizedState = ol(1 | t, d, a, n)); }
    function rf(e, t) { Ni(8390656, 8, e, t); }
    function ro(e, t) { wi(2048, 8, e, t); }
    function sb(e) { ie.flags |= 4; var t = ie.updateQueue; if (t === null)
        t = yi(), ie.updateQueue = t, t.events = [e];
    else {
        var a = t.events;
        a === null ? t.events = [e] : a.push(e);
    } }
    function cf(e) { var t = He().memoizedState; return sb({ ref: t, nextImpl: e }), function () { if ((Ne & 2) !== 0)
        throw Error(c(440)); return t.impl.apply(void 0, arguments); }; }
    function of(e, t) { return wi(4, 2, e, t); }
    function df(e, t) { return wi(4, 4, e, t); }
    function uf(e, t) { if (typeof t == "function") {
        e = e();
        var a = t(e);
        return function () { typeof a == "function" ? a() : t(null); };
    } if (t != null)
        return e = e(), t.current = e, function () { t.current = null; }; }
    function mf(e, t, a) { a = a != null ? a.concat([e]) : null, wi(4, 4, uf.bind(null, t, e), a); }
    function co() { }
    function ff(e, t) { var a = He(); t = t === void 0 ? null : t; var n = a.memoizedState; return t !== null && Pc(t, n[1]) ? n[0] : (a.memoizedState = [e, t], e); }
    function hf(e, t) { var a = He(); t = t === void 0 ? null : t; var n = a.memoizedState; if (t !== null && Pc(t, n[1]))
        return n[0]; if (n = e(), Ea) {
        Us(!0);
        try {
            e();
        }
        finally {
            Us(!1);
        }
    } return a.memoizedState = [n, t], n; }
    function oo(e, t, a) { return a === void 0 || (js & 1073741824) !== 0 && (pe & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = a, e = xh(), ie.lanes |= e, Is |= e, a); }
    function xf(e, t, a, n) { return Tt(a, t) ? a : il.current !== null ? (e = oo(e, a, n), Tt(e, t) || (Ye = !0), e) : (js & 42) === 0 || (js & 1073741824) !== 0 && (pe & 261930) === 0 ? (Ye = !0, e.memoizedState = a) : (e = xh(), ie.lanes |= e, Is |= e, t); }
    function pf(e, t, a, n, o) { var d = J.p; J.p = d !== 0 && 8 > d ? d : 8; var f = E.T, x = {}; E.T = x, fo(e, !1, t, a); try {
        var N = o(), _ = E.S;
        if (_ !== null && _(x, N), N !== null && typeof N == "object" && typeof N.then == "function") {
            var U = P0(N, n);
            ln(e, t, U, zt(e));
        }
        else
            ln(e, t, n, zt(e));
    }
    catch (H) {
        ln(e, t, { then: function () { }, status: "rejected", reason: H }, zt());
    }
    finally {
        J.p = d, f !== null && x.types !== null && (f.types = x.types), E.T = f;
    } }
    function ab() { }
    function uo(e, t, a, n) { if (e.tag !== 5)
        throw Error(c(476)); var o = gf(e).queue; pf(e, o, t, Q, a === null ? ab : function () { return bf(e), a(n); }); }
    function gf(e) { var t = e.memoizedState; if (t !== null)
        return t; t = { memoizedState: Q, baseState: Q, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ns, lastRenderedState: Q }, next: null }; var a = {}; return t.next = { memoizedState: a, baseState: a, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ns, lastRenderedState: a }, next: null }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t; }
    function bf(e) { var t = gf(e); t.next === null && (t = e.alternate.memoizedState), ln(e, t.next.queue, {}, zt()); }
    function mo() { return ot(Nn); }
    function yf() { return He().memoizedState; }
    function vf() { return He().memoizedState; }
    function lb(e) { for (var t = e.return; t !== null;) {
        switch (t.tag) {
            case 24:
            case 3:
                var a = zt();
                e = Xs(a);
                var n = Zs(t, e, a);
                n !== null && (jt(n, t, a), Wl(n, t, a)), t = { cache: Hc() }, e.payload = t;
                return;
        }
        t = t.return;
    } }
    function nb(e, t, a) { var n = zt(); a = { lane: n, revertLane: 0, gesture: null, action: a, hasEagerState: !1, eagerState: null, next: null }, Si(e) ? Nf(t, a) : (a = Ec(e, t, a, n), a !== null && (jt(a, e, n), wf(a, t, n))); }
    function jf(e, t, a) { var n = zt(); ln(e, t, a, n); }
    function ln(e, t, a, n) { var o = { lane: n, revertLane: 0, gesture: null, action: a, hasEagerState: !1, eagerState: null, next: null }; if (Si(e))
        Nf(t, o);
    else {
        var d = e.alternate;
        if (e.lanes === 0 && (d === null || d.lanes === 0) && (d = t.lastRenderedReducer, d !== null))
            try {
                var f = t.lastRenderedState, x = d(f, a);
                if (o.hasEagerState = !0, o.eagerState = x, Tt(x, f))
                    return li(e, t, o, 0), Me === null && ai(), !1;
            }
            catch { }
            finally { }
        if (a = Ec(e, t, o, n), a !== null)
            return jt(a, e, n), wf(a, t, n), !0;
    } return !1; }
    function fo(e, t, a, n) { if (n = { lane: 2, revertLane: Yo(), gesture: null, action: n, hasEagerState: !1, eagerState: null, next: null }, Si(e)) {
        if (t)
            throw Error(c(479));
    }
    else
        t = Ec(e, a, n, 2), t !== null && jt(t, e, 2); }
    function Si(e) { var t = e.alternate; return e === ie || t !== null && t === ie; }
    function Nf(e, t) { rl = gi = !0; var a = e.pending; a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t; }
    function wf(e, t, a) { if ((a & 4194048) !== 0) {
        var n = t.lanes;
        n &= e.pendingLanes, a |= n, t.lanes = a, Au(e, a);
    } }
    var nn = { readContext: ot, use: vi, useCallback: qe, useContext: qe, useEffect: qe, useImperativeHandle: qe, useLayoutEffect: qe, useInsertionEffect: qe, useMemo: qe, useReducer: qe, useRef: qe, useState: qe, useDebugValue: qe, useDeferredValue: qe, useTransition: qe, useSyncExternalStore: qe, useId: qe, useHostTransitionStatus: qe, useFormState: qe, useActionState: qe, useOptimistic: qe, useMemoCache: qe, useCacheRefresh: qe };
    nn.useEffectEvent = qe;
    var Sf = { readContext: ot, use: vi, useCallback: function (e, t) { return ht().memoizedState = [e, t === void 0 ? null : t], e; }, useContext: ot, useEffect: rf, useImperativeHandle: function (e, t, a) { a = a != null ? a.concat([e]) : null, Ni(4194308, 4, uf.bind(null, t, e), a); }, useLayoutEffect: function (e, t) { return Ni(4194308, 4, e, t); }, useInsertionEffect: function (e, t) { Ni(4, 2, e, t); }, useMemo: function (e, t) { var a = ht(); t = t === void 0 ? null : t; var n = e(); if (Ea) {
            Us(!0);
            try {
                e();
            }
            finally {
                Us(!1);
            }
        } return a.memoizedState = [n, t], n; }, useReducer: function (e, t, a) { var n = ht(); if (a !== void 0) {
            var o = a(t);
            if (Ea) {
                Us(!0);
                try {
                    a(t);
                }
                finally {
                    Us(!1);
                }
            }
        }
        else
            o = t; return n.memoizedState = n.baseState = o, e = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: o }, n.queue = e, e = e.dispatch = nb.bind(null, ie, e), [n.memoizedState, e]; }, useRef: function (e) { var t = ht(); return e = { current: e }, t.memoizedState = e; }, useState: function (e) { e = no(e); var t = e.queue, a = jf.bind(null, ie, t); return t.dispatch = a, [e.memoizedState, a]; }, useDebugValue: co, useDeferredValue: function (e, t) { var a = ht(); return oo(a, e, t); }, useTransition: function () { var e = no(!1); return e = pf.bind(null, ie, e.queue, !0, !1), ht().memoizedState = e, [!1, e]; }, useSyncExternalStore: function (e, t, a) { var n = ie, o = ht(); if (be) {
            if (a === void 0)
                throw Error(c(407));
            a = a();
        }
        else {
            if (a = t(), Me === null)
                throw Error(c(349));
            (pe & 127) !== 0 || Km(n, t, a);
        } o.memoizedState = a; var d = { value: a, getSnapshot: t }; return o.queue = d, rf(Xm.bind(null, n, d, e), [e]), n.flags |= 2048, ol(9, { destroy: void 0 }, Ym.bind(null, n, d, a, t), null), a; }, useId: function () { var e = ht(), t = Me.identifierPrefix; if (be) {
            var a = rs, n = is;
            a = (n & ~(1 << 32 - At(n) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = bi++, 0 < a && (t += "H" + a.toString(32)), t += "_";
        }
        else
            a = I0++, t = "_" + t + "r_" + a.toString(32) + "_"; return e.memoizedState = t; }, useHostTransitionStatus: mo, useFormState: tf, useActionState: tf, useOptimistic: function (e) { var t = ht(); t.memoizedState = t.baseState = e; var a = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null }; return t.queue = a, t = fo.bind(null, ie, !0, a), a.dispatch = t, [e, t]; }, useMemoCache: so, useCacheRefresh: function () { return ht().memoizedState = lb.bind(null, ie); }, useEffectEvent: function (e) { var t = ht(), a = { impl: e }; return t.memoizedState = a, function () { if ((Ne & 2) !== 0)
            throw Error(c(440)); return a.impl.apply(void 0, arguments); }; } }, ho = { readContext: ot, use: vi, useCallback: ff, useContext: ot, useEffect: ro, useImperativeHandle: mf, useInsertionEffect: of, useLayoutEffect: df, useMemo: hf, useReducer: ji, useRef: nf, useState: function () { return ji(Ns); }, useDebugValue: co, useDeferredValue: function (e, t) { var a = He(); return xf(a, Ae.memoizedState, e, t); }, useTransition: function () { var e = ji(Ns)[0], t = He().memoizedState; return [typeof e == "boolean" ? e : an(e), t]; }, useSyncExternalStore: Qm, useId: yf, useHostTransitionStatus: mo, useFormState: sf, useActionState: sf, useOptimistic: function (e, t) { var a = He(); return Fm(a, Ae, e, t); }, useMemoCache: so, useCacheRefresh: vf };
    ho.useEffectEvent = cf;
    var kf = { readContext: ot, use: vi, useCallback: ff, useContext: ot, useEffect: ro, useImperativeHandle: mf, useInsertionEffect: of, useLayoutEffect: df, useMemo: hf, useReducer: lo, useRef: nf, useState: function () { return lo(Ns); }, useDebugValue: co, useDeferredValue: function (e, t) { var a = He(); return Ae === null ? oo(a, e, t) : xf(a, Ae.memoizedState, e, t); }, useTransition: function () { var e = lo(Ns)[0], t = He().memoizedState; return [typeof e == "boolean" ? e : an(e), t]; }, useSyncExternalStore: Qm, useId: yf, useHostTransitionStatus: mo, useFormState: lf, useActionState: lf, useOptimistic: function (e, t) { var a = He(); return Ae !== null ? Fm(a, Ae, e, t) : (a.baseState = e, [e, a.queue.dispatch]); }, useMemoCache: so, useCacheRefresh: vf };
    kf.useEffectEvent = cf;
    function xo(e, t, a, n) { t = e.memoizedState, a = a(n, t), a = a == null ? t : g({}, t, a), e.memoizedState = a, e.lanes === 0 && (e.updateQueue.baseState = a); }
    var po = { enqueueSetState: function (e, t, a) { e = e._reactInternals; var n = zt(), o = Xs(n); o.payload = t, a != null && (o.callback = a), t = Zs(e, o, n), t !== null && (jt(t, e, n), Wl(t, e, n)); }, enqueueReplaceState: function (e, t, a) { e = e._reactInternals; var n = zt(), o = Xs(n); o.tag = 1, o.payload = t, a != null && (o.callback = a), t = Zs(e, o, n), t !== null && (jt(t, e, n), Wl(t, e, n)); }, enqueueForceUpdate: function (e, t) { e = e._reactInternals; var a = zt(), n = Xs(a); n.tag = 2, t != null && (n.callback = t), t = Zs(e, n, a), t !== null && (jt(t, e, a), Wl(t, e, a)); } };
    function Cf(e, t, a, n, o, d, f) { return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(n, d, f) : t.prototype && t.prototype.isPureReactComponent ? !Yl(a, n) || !Yl(o, d) : !0; }
    function Af(e, t, a, n) { e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, n), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, n), t.state !== e && po.enqueueReplaceState(t, t.state, null); }
    function Ma(e, t) { var a = t; if ("ref" in t) {
        a = {};
        for (var n in t)
            n !== "ref" && (a[n] = t[n]);
    } if (e = e.defaultProps) {
        a === t && (a = g({}, a));
        for (var o in e)
            a[o] === void 0 && (a[o] = e[o]);
    } return a; }
    function Tf(e) { si(e); }
    function Ef(e) { console.error(e); }
    function Mf(e) { si(e); }
    function ki(e, t) { try {
        var a = e.onUncaughtError;
        a(t.value, { componentStack: t.stack });
    }
    catch (n) {
        setTimeout(function () { throw n; });
    } }
    function _f(e, t, a) { try {
        var n = e.onCaughtError;
        n(a.value, { componentStack: a.stack, errorBoundary: t.tag === 1 ? t.stateNode : null });
    }
    catch (o) {
        setTimeout(function () { throw o; });
    } }
    function go(e, t, a) { return a = Xs(a), a.tag = 3, a.payload = { element: null }, a.callback = function () { ki(e, t); }, a; }
    function Of(e) { return e = Xs(e), e.tag = 3, e; }
    function Df(e, t, a, n) { var o = a.type.getDerivedStateFromError; if (typeof o == "function") {
        var d = n.value;
        e.payload = function () { return o(d); }, e.callback = function () { _f(t, a, n); };
    } var f = a.stateNode; f !== null && typeof f.componentDidCatch == "function" && (e.callback = function () { _f(t, a, n), typeof o != "function" && (Ws === null ? Ws = new Set([this]) : Ws.add(this)); var x = n.stack; this.componentDidCatch(n.value, { componentStack: x !== null ? x : "" }); }); }
    function ib(e, t, a, n, o) { if (a.flags |= 32768, n !== null && typeof n == "object" && typeof n.then == "function") {
        if (t = a.alternate, t !== null && tl(t, a, o, !0), a = Mt.current, a !== null) {
            switch (a.tag) {
                case 31:
                case 13: return Kt === null ? Bi() : a.alternate === null && Be === 0 && (Be = 3), a.flags &= -257, a.flags |= 65536, a.lanes = o, n === mi ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = new Set([n]) : t.add(n), Go(e, n, o)), !1;
                case 22: return a.flags |= 65536, n === mi ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = { transitions: null, markerInstances: null, retryQueue: new Set([n]) }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = new Set([n]) : a.add(n)), Go(e, n, o)), !1;
            }
            throw Error(c(435, a.tag));
        }
        return Go(e, n, o), Bi(), !1;
    } if (be)
        return t = Mt.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = o, n !== Rc && (e = Error(c(422), { cause: n }), Jl(Ht(e, a)))) : (n !== Rc && (t = Error(c(423), { cause: n }), Jl(Ht(t, a))), e = e.current.alternate, e.flags |= 65536, o &= -o, e.lanes |= o, n = Ht(n, a), o = go(e.stateNode, n, o), Xc(e, o), Be !== 4 && (Be = 2)), !1; var d = Error(c(520), { cause: n }); if (d = Ht(d, a), hn === null ? hn = [d] : hn.push(d), Be !== 4 && (Be = 2), t === null)
        return !0; n = Ht(n, a), a = t; do {
        switch (a.tag) {
            case 3: return a.flags |= 65536, e = o & -o, a.lanes |= e, e = go(a.stateNode, n, e), Xc(a, e), !1;
            case 1: if (t = a.type, d = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || d !== null && typeof d.componentDidCatch == "function" && (Ws === null || !Ws.has(d))))
                return a.flags |= 65536, o &= -o, a.lanes |= o, o = Of(o), Df(o, e, a, n), Xc(a, o), !1;
        }
        a = a.return;
    } while (a !== null); return !1; }
    var bo = Error(c(461)), Ye = !1;
    function dt(e, t, a, n) { t.child = e === null ? qm(t, null, a, n) : Ta(t, e.child, a, n); }
    function zf(e, t, a, n, o) { a = a.render; var d = t.ref; if ("ref" in n) {
        var f = {};
        for (var x in n)
            x !== "ref" && (f[x] = n[x]);
    }
    else
        f = n; return Sa(t), n = Ic(e, t, a, f, d, o), x = Wc(), e !== null && !Ye ? (eo(e, t, o), ws(e, t, o)) : (be && x && Dc(t), t.flags |= 1, dt(e, t, n, o), t.child); }
    function Rf(e, t, a, n, o) { if (e === null) {
        var d = a.type;
        return typeof d == "function" && !Mc(d) && d.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = d, qf(e, t, d, n, o)) : (e = ii(a.type, null, n, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
    } if (d = e.child, !Co(e, o)) {
        var f = d.memoizedProps;
        if (a = a.compare, a = a !== null ? a : Yl, a(f, n) && e.ref === t.ref)
            return ws(e, t, o);
    } return t.flags |= 1, e = gs(d, n), e.ref = t.ref, e.return = t, t.child = e; }
    function qf(e, t, a, n, o) { if (e !== null) {
        var d = e.memoizedProps;
        if (Yl(d, n) && e.ref === t.ref)
            if (Ye = !1, t.pendingProps = n = d, Co(e, o))
                (e.flags & 131072) !== 0 && (Ye = !0);
            else
                return t.lanes = e.lanes, ws(e, t, o);
    } return yo(e, t, a, n, o); }
    function Bf(e, t, a, n) { var o = n.children, d = e !== null ? e.memoizedState : null; if (e === null && t.stateNode === null && (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), n.mode === "hidden") {
        if ((t.flags & 128) !== 0) {
            if (d = d !== null ? d.baseLanes | a : a, e !== null) {
                for (n = t.child = e.child, o = 0; n !== null;)
                    o = o | n.lanes | n.childLanes, n = n.sibling;
                n = o & ~d;
            }
            else
                n = 0, t.child = null;
            return Uf(e, t, d, a, n);
        }
        if ((a & 536870912) !== 0)
            t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && di(t, d !== null ? d.cachePool : null), d !== null ? Lm(t, d) : Jc(), Hm(t);
        else
            return n = t.lanes = 536870912, Uf(e, t, d !== null ? d.baseLanes | a : a, a, n);
    }
    else
        d !== null ? (di(t, d.cachePool), Lm(t, d), Fs(), t.memoizedState = null) : (e !== null && di(t, null), Jc(), Fs()); return dt(e, t, o, a), t.child; }
    function rn(e, t) { return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), t.sibling; }
    function Uf(e, t, a, n, o) { var d = Gc(); return d = d === null ? null : { parent: Qe._currentValue, pool: d }, t.memoizedState = { baseLanes: a, cachePool: d }, e !== null && di(t, null), Jc(), Hm(t), e !== null && tl(e, t, n, !0), t.childLanes = o, null; }
    function Ci(e, t) { return t = Ti({ mode: t.mode, children: t.children }, e.mode), t.ref = e.ref, e.child = t, t.return = e, t; }
    function Lf(e, t, a) { return Ta(t, e.child, null, a), e = Ci(t, t.pendingProps), e.flags |= 2, _t(t), t.memoizedState = null, e; }
    function rb(e, t, a) { var n = t.pendingProps, o = (t.flags & 128) !== 0; if (t.flags &= -129, e === null) {
        if (be) {
            if (n.mode === "hidden")
                return e = Ci(t, n), t.lanes = 536870912, rn(null, e);
            if ($c(t), (e = _e) ? (e = Ph(e, Qt), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Vs !== null ? { id: is, overflow: rs } : null, retryLane: 536870912, hydrationErrors: null }, a = jm(e), a.return = t, t.child = a, ct = t, _e = null)) : e = null, e === null)
                throw Qs(t);
            return t.lanes = 536870912, null;
        }
        return Ci(t, n);
    } var d = e.memoizedState; if (d !== null) {
        var f = d.dehydrated;
        if ($c(t), o)
            if (t.flags & 256)
                t.flags &= -257, t = Lf(e, t, a);
            else if (t.memoizedState !== null)
                t.child = e.child, t.flags |= 128, t = null;
            else
                throw Error(c(558));
        else if (Ye || tl(e, t, a, !1), o = (a & e.childLanes) !== 0, Ye || o) {
            if (n = Me, n !== null && (f = Tu(n, a), f !== 0 && f !== d.retryLane))
                throw d.retryLane = f, va(e, f), jt(n, e, f), bo;
            Bi(), t = Lf(e, t, a);
        }
        else
            e = d.treeContext, _e = Yt(f.nextSibling), ct = t, be = !0, Gs = null, Qt = !1, e !== null && Sm(t, e), t = Ci(t, n), t.flags |= 4096;
        return t;
    } return e = gs(e.child, { mode: n.mode, children: n.children }), e.ref = t.ref, t.child = e, e.return = t, e; }
    function Ai(e, t) { var a = t.ref; if (a === null)
        e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
        if (typeof a != "function" && typeof a != "object")
            throw Error(c(284));
        (e === null || e.ref !== a) && (t.flags |= 4194816);
    } }
    function yo(e, t, a, n, o) { return Sa(t), a = Ic(e, t, a, n, void 0, o), n = Wc(), e !== null && !Ye ? (eo(e, t, o), ws(e, t, o)) : (be && n && Dc(t), t.flags |= 1, dt(e, t, a, o), t.child); }
    function Hf(e, t, a, n, o, d) { return Sa(t), t.updateQueue = null, a = Gm(t, n, a, o), Vm(e), n = Wc(), e !== null && !Ye ? (eo(e, t, d), ws(e, t, d)) : (be && n && Dc(t), t.flags |= 1, dt(e, t, a, d), t.child); }
    function Vf(e, t, a, n, o) { if (Sa(t), t.stateNode === null) {
        var d = Pa, f = a.contextType;
        typeof f == "object" && f !== null && (d = ot(f)), d = new a(n, d), t.memoizedState = d.state !== null && d.state !== void 0 ? d.state : null, d.updater = po, t.stateNode = d, d._reactInternals = t, d = t.stateNode, d.props = n, d.state = t.memoizedState, d.refs = {}, Kc(t), f = a.contextType, d.context = typeof f == "object" && f !== null ? ot(f) : Pa, d.state = t.memoizedState, f = a.getDerivedStateFromProps, typeof f == "function" && (xo(t, a, f, n), d.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof d.getSnapshotBeforeUpdate == "function" || typeof d.UNSAFE_componentWillMount != "function" && typeof d.componentWillMount != "function" || (f = d.state, typeof d.componentWillMount == "function" && d.componentWillMount(), typeof d.UNSAFE_componentWillMount == "function" && d.UNSAFE_componentWillMount(), f !== d.state && po.enqueueReplaceState(d, d.state, null), tn(t, n, d, o), en(), d.state = t.memoizedState), typeof d.componentDidMount == "function" && (t.flags |= 4194308), n = !0;
    }
    else if (e === null) {
        d = t.stateNode;
        var x = t.memoizedProps, N = Ma(a, x);
        d.props = N;
        var _ = d.context, U = a.contextType;
        f = Pa, typeof U == "object" && U !== null && (f = ot(U));
        var H = a.getDerivedStateFromProps;
        U = typeof H == "function" || typeof d.getSnapshotBeforeUpdate == "function", x = t.pendingProps !== x, U || typeof d.UNSAFE_componentWillReceiveProps != "function" && typeof d.componentWillReceiveProps != "function" || (x || _ !== f) && Af(t, d, n, f), Ys = !1;
        var O = t.memoizedState;
        d.state = O, tn(t, n, d, o), en(), _ = t.memoizedState, x || O !== _ || Ys ? (typeof H == "function" && (xo(t, a, H, n), _ = t.memoizedState), (N = Ys || Cf(t, a, N, n, O, _, f)) ? (U || typeof d.UNSAFE_componentWillMount != "function" && typeof d.componentWillMount != "function" || (typeof d.componentWillMount == "function" && d.componentWillMount(), typeof d.UNSAFE_componentWillMount == "function" && d.UNSAFE_componentWillMount()), typeof d.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof d.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = n, t.memoizedState = _), d.props = n, d.state = _, d.context = f, n = N) : (typeof d.componentDidMount == "function" && (t.flags |= 4194308), n = !1);
    }
    else {
        d = t.stateNode, Yc(e, t), f = t.memoizedProps, U = Ma(a, f), d.props = U, H = t.pendingProps, O = d.context, _ = a.contextType, N = Pa, typeof _ == "object" && _ !== null && (N = ot(_)), x = a.getDerivedStateFromProps, (_ = typeof x == "function" || typeof d.getSnapshotBeforeUpdate == "function") || typeof d.UNSAFE_componentWillReceiveProps != "function" && typeof d.componentWillReceiveProps != "function" || (f !== H || O !== N) && Af(t, d, n, N), Ys = !1, O = t.memoizedState, d.state = O, tn(t, n, d, o), en();
        var R = t.memoizedState;
        f !== H || O !== R || Ys || e !== null && e.dependencies !== null && ci(e.dependencies) ? (typeof x == "function" && (xo(t, a, x, n), R = t.memoizedState), (U = Ys || Cf(t, a, U, n, O, R, N) || e !== null && e.dependencies !== null && ci(e.dependencies)) ? (_ || typeof d.UNSAFE_componentWillUpdate != "function" && typeof d.componentWillUpdate != "function" || (typeof d.componentWillUpdate == "function" && d.componentWillUpdate(n, R, N), typeof d.UNSAFE_componentWillUpdate == "function" && d.UNSAFE_componentWillUpdate(n, R, N)), typeof d.componentDidUpdate == "function" && (t.flags |= 4), typeof d.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof d.componentDidUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 4), typeof d.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 1024), t.memoizedProps = n, t.memoizedState = R), d.props = n, d.state = R, d.context = N, n = U) : (typeof d.componentDidUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 4), typeof d.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 1024), n = !1);
    } return d = n, Ai(e, t), n = (t.flags & 128) !== 0, d || n ? (d = t.stateNode, a = n && typeof a.getDerivedStateFromError != "function" ? null : d.render(), t.flags |= 1, e !== null && n ? (t.child = Ta(t, e.child, null, o), t.child = Ta(t, null, a, o)) : dt(e, t, a, o), t.memoizedState = d.state, e = t.child) : e = ws(e, t, o), e; }
    function Gf(e, t, a, n) { return Na(), t.flags |= 256, dt(e, t, a, n), t.child; }
    var vo = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function jo(e) { return { baseLanes: e, cachePool: Mm() }; }
    function No(e, t, a) { return e = e !== null ? e.childLanes & ~a : 0, t && (e |= Dt), e; }
    function Qf(e, t, a) { var n = t.pendingProps, o = !1, d = (t.flags & 128) !== 0, f; if ((f = d) || (f = e !== null && e.memoizedState === null ? !1 : (Le.current & 2) !== 0), f && (o = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
        if (be) {
            if (o ? Js(t) : Fs(), (e = _e) ? (e = Ph(e, Qt), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Vs !== null ? { id: is, overflow: rs } : null, retryLane: 536870912, hydrationErrors: null }, a = jm(e), a.return = t, t.child = a, ct = t, _e = null)) : e = null, e === null)
                throw Qs(t);
            return ld(e) ? t.lanes = 32 : t.lanes = 536870912, null;
        }
        var x = n.children;
        return n = n.fallback, o ? (Fs(), o = t.mode, x = Ti({ mode: "hidden", children: x }, o), n = ja(n, o, a, null), x.return = t, n.return = t, x.sibling = n, t.child = x, n = t.child, n.memoizedState = jo(a), n.childLanes = No(e, f, a), t.memoizedState = vo, rn(null, n)) : (Js(t), wo(t, x));
    } var N = e.memoizedState; if (N !== null && (x = N.dehydrated, x !== null)) {
        if (d)
            t.flags & 256 ? (Js(t), t.flags &= -257, t = So(e, t, a)) : t.memoizedState !== null ? (Fs(), t.child = e.child, t.flags |= 128, t = null) : (Fs(), x = n.fallback, o = t.mode, n = Ti({ mode: "visible", children: n.children }, o), x = ja(x, o, a, null), x.flags |= 2, n.return = t, x.return = t, n.sibling = x, t.child = n, Ta(t, e.child, null, a), n = t.child, n.memoizedState = jo(a), n.childLanes = No(e, f, a), t.memoizedState = vo, t = rn(null, n));
        else if (Js(t), ld(x)) {
            if (f = x.nextSibling && x.nextSibling.dataset, f)
                var _ = f.dgst;
            f = _, n = Error(c(419)), n.stack = "", n.digest = f, Jl({ value: n, source: null, stack: null }), t = So(e, t, a);
        }
        else if (Ye || tl(e, t, a, !1), f = (a & e.childLanes) !== 0, Ye || f) {
            if (f = Me, f !== null && (n = Tu(f, a), n !== 0 && n !== N.retryLane))
                throw N.retryLane = n, va(e, n), jt(f, e, n), bo;
            ad(x) || Bi(), t = So(e, t, a);
        }
        else
            ad(x) ? (t.flags |= 192, t.child = e.child, t = null) : (e = N.treeContext, _e = Yt(x.nextSibling), ct = t, be = !0, Gs = null, Qt = !1, e !== null && Sm(t, e), t = wo(t, n.children), t.flags |= 4096);
        return t;
    } return o ? (Fs(), x = n.fallback, o = t.mode, N = e.child, _ = N.sibling, n = gs(N, { mode: "hidden", children: n.children }), n.subtreeFlags = N.subtreeFlags & 65011712, _ !== null ? x = gs(_, x) : (x = ja(x, o, a, null), x.flags |= 2), x.return = t, n.return = t, n.sibling = x, t.child = n, rn(null, n), n = t.child, x = e.child.memoizedState, x === null ? x = jo(a) : (o = x.cachePool, o !== null ? (N = Qe._currentValue, o = o.parent !== N ? { parent: N, pool: N } : o) : o = Mm(), x = { baseLanes: x.baseLanes | a, cachePool: o }), n.memoizedState = x, n.childLanes = No(e, f, a), t.memoizedState = vo, rn(e.child, n)) : (Js(t), a = e.child, e = a.sibling, a = gs(a, { mode: "visible", children: n.children }), a.return = t, a.sibling = null, e !== null && (f = t.deletions, f === null ? (t.deletions = [e], t.flags |= 16) : f.push(e)), t.child = a, t.memoizedState = null, a); }
    function wo(e, t) { return t = Ti({ mode: "visible", children: t }, e.mode), t.return = e, e.child = t; }
    function Ti(e, t) { return e = Et(22, e, null, t), e.lanes = 0, e; }
    function So(e, t, a) { return Ta(t, e.child, null, a), e = wo(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e; }
    function Kf(e, t, a) { e.lanes |= t; var n = e.alternate; n !== null && (n.lanes |= t), Uc(e.return, t, a); }
    function ko(e, t, a, n, o, d) { var f = e.memoizedState; f === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: n, tail: a, tailMode: o, treeForkCount: d } : (f.isBackwards = t, f.rendering = null, f.renderingStartTime = 0, f.last = n, f.tail = a, f.tailMode = o, f.treeForkCount = d); }
    function Yf(e, t, a) { var n = t.pendingProps, o = n.revealOrder, d = n.tail; n = n.children; var f = Le.current, x = (f & 2) !== 0; if (x ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, se(Le, f), dt(e, t, n, a), n = be ? Zl : 0, !x && e !== null && (e.flags & 128) !== 0)
        e: for (e = t.child; e !== null;) {
            if (e.tag === 13)
                e.memoizedState !== null && Kf(e, a, t);
            else if (e.tag === 19)
                Kf(e, a, t);
            else if (e.child !== null) {
                e.child.return = e, e = e.child;
                continue;
            }
            if (e === t)
                break e;
            for (; e.sibling === null;) {
                if (e.return === null || e.return === t)
                    break e;
                e = e.return;
            }
            e.sibling.return = e.return, e = e.sibling;
        } switch (o) {
        case "forwards":
            for (a = t.child, o = null; a !== null;)
                e = a.alternate, e !== null && pi(e) === null && (o = a), a = a.sibling;
            a = o, a === null ? (o = t.child, t.child = null) : (o = a.sibling, a.sibling = null), ko(t, !1, o, a, d, n);
            break;
        case "backwards":
        case "unstable_legacy-backwards":
            for (a = null, o = t.child, t.child = null; o !== null;) {
                if (e = o.alternate, e !== null && pi(e) === null) {
                    t.child = o;
                    break;
                }
                e = o.sibling, o.sibling = a, a = o, o = e;
            }
            ko(t, !0, a, null, d, n);
            break;
        case "together":
            ko(t, !1, null, null, void 0, n);
            break;
        default: t.memoizedState = null;
    } return t.child; }
    function ws(e, t, a) { if (e !== null && (t.dependencies = e.dependencies), Is |= t.lanes, (a & t.childLanes) === 0)
        if (e !== null) {
            if (tl(e, t, a, !1), (a & t.childLanes) === 0)
                return null;
        }
        else
            return null; if (e !== null && t.child !== e.child)
        throw Error(c(153)); if (t.child !== null) {
        for (e = t.child, a = gs(e, e.pendingProps), t.child = a, a.return = t; e.sibling !== null;)
            e = e.sibling, a = a.sibling = gs(e, e.pendingProps), a.return = t;
        a.sibling = null;
    } return t.child; }
    function Co(e, t) { return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && ci(e))); }
    function cb(e, t, a) { switch (t.tag) {
        case 3:
            fa(t, t.stateNode.containerInfo), Ks(t, Qe, e.memoizedState.cache), Na();
            break;
        case 27:
        case 5:
            Rs(t);
            break;
        case 4:
            fa(t, t.stateNode.containerInfo);
            break;
        case 10:
            Ks(t, t.type, t.memoizedProps.value);
            break;
        case 31:
            if (t.memoizedState !== null)
                return t.flags |= 128, $c(t), null;
            break;
        case 13:
            var n = t.memoizedState;
            if (n !== null)
                return n.dehydrated !== null ? (Js(t), t.flags |= 128, null) : (a & t.child.childLanes) !== 0 ? Qf(e, t, a) : (Js(t), e = ws(e, t, a), e !== null ? e.sibling : null);
            Js(t);
            break;
        case 19:
            var o = (e.flags & 128) !== 0;
            if (n = (a & t.childLanes) !== 0, n || (tl(e, t, a, !1), n = (a & t.childLanes) !== 0), o) {
                if (n)
                    return Yf(e, t, a);
                t.flags |= 128;
            }
            if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), se(Le, Le.current), n)
                break;
            return null;
        case 22: return t.lanes = 0, Bf(e, t, a, t.pendingProps);
        case 24: Ks(t, Qe, e.memoizedState.cache);
    } return ws(e, t, a); }
    function Xf(e, t, a) { if (e !== null)
        if (e.memoizedProps !== t.pendingProps)
            Ye = !0;
        else {
            if (!Co(e, a) && (t.flags & 128) === 0)
                return Ye = !1, cb(e, t, a);
            Ye = (e.flags & 131072) !== 0;
        }
    else
        Ye = !1, be && (t.flags & 1048576) !== 0 && wm(t, Zl, t.index); switch (t.lanes = 0, t.tag) {
        case 16:
            e: {
                var n = t.pendingProps;
                if (e = Ca(t.elementType), t.type = e, typeof e == "function")
                    Mc(e) ? (n = Ma(e, n), t.tag = 1, t = Vf(null, t, e, n, a)) : (t.tag = 0, t = yo(null, t, e, n, a));
                else {
                    if (e != null) {
                        var o = e.$$typeof;
                        if (o === $) {
                            t.tag = 11, t = zf(null, t, e, n, a);
                            break e;
                        }
                        else if (o === q) {
                            t.tag = 14, t = Rf(null, t, e, n, a);
                            break e;
                        }
                    }
                    throw t = Je(e) || e, Error(c(306, t, ""));
                }
            }
            return t;
        case 0: return yo(e, t, t.type, t.pendingProps, a);
        case 1: return n = t.type, o = Ma(n, t.pendingProps), Vf(e, t, n, o, a);
        case 3:
            e: {
                if (fa(t, t.stateNode.containerInfo), e === null)
                    throw Error(c(387));
                n = t.pendingProps;
                var d = t.memoizedState;
                o = d.element, Yc(e, t), tn(t, n, null, a);
                var f = t.memoizedState;
                if (n = f.cache, Ks(t, Qe, n), n !== d.cache && Lc(t, [Qe], a, !0), en(), n = f.element, d.isDehydrated)
                    if (d = { element: n, isDehydrated: !1, cache: f.cache }, t.updateQueue.baseState = d, t.memoizedState = d, t.flags & 256) {
                        t = Gf(e, t, n, a);
                        break e;
                    }
                    else if (n !== o) {
                        o = Ht(Error(c(424)), t), Jl(o), t = Gf(e, t, n, a);
                        break e;
                    }
                    else {
                        switch (e = t.stateNode.containerInfo, e.nodeType) {
                            case 9:
                                e = e.body;
                                break;
                            default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
                        }
                        for (_e = Yt(e.firstChild), ct = t, be = !0, Gs = null, Qt = !0, a = qm(t, null, n, a), t.child = a; a;)
                            a.flags = a.flags & -3 | 4096, a = a.sibling;
                    }
                else {
                    if (Na(), n === o) {
                        t = ws(e, t, a);
                        break e;
                    }
                    dt(e, t, n, a);
                }
                t = t.child;
            }
            return t;
        case 26: return Ai(e, t), e === null ? (a = ax(t.type, null, t.pendingProps, null)) ? t.memoizedState = a : be || (a = t.type, e = t.pendingProps, n = Ki(Pt.current).createElement(a), n[rt] = t, n[xt] = e, ut(n, a, e), tt(n), t.stateNode = n) : t.memoizedState = ax(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
        case 27: return Rs(t), e === null && be && (n = t.stateNode = ex(t.type, t.pendingProps, Pt.current), ct = t, Qt = !0, o = _e, aa(t.type) ? (nd = o, _e = Yt(n.firstChild)) : _e = o), dt(e, t, t.pendingProps.children, a), Ai(e, t), e === null && (t.flags |= 4194304), t.child;
        case 5: return e === null && be && ((o = n = _e) && (n = Ub(n, t.type, t.pendingProps, Qt), n !== null ? (t.stateNode = n, ct = t, _e = Yt(n.firstChild), Qt = !1, o = !0) : o = !1), o || Qs(t)), Rs(t), o = t.type, d = t.pendingProps, f = e !== null ? e.memoizedProps : null, n = d.children, ed(o, d) ? n = null : f !== null && ed(o, f) && (t.flags |= 32), t.memoizedState !== null && (o = Ic(e, t, W0, null, null, a), Nn._currentValue = o), Ai(e, t), dt(e, t, n, a), t.child;
        case 6: return e === null && be && ((e = a = _e) && (a = Lb(a, t.pendingProps, Qt), a !== null ? (t.stateNode = a, ct = t, _e = null, e = !0) : e = !1), e || Qs(t)), null;
        case 13: return Qf(e, t, a);
        case 4: return fa(t, t.stateNode.containerInfo), n = t.pendingProps, e === null ? t.child = Ta(t, null, n, a) : dt(e, t, n, a), t.child;
        case 11: return zf(e, t, t.type, t.pendingProps, a);
        case 7: return dt(e, t, t.pendingProps, a), t.child;
        case 8: return dt(e, t, t.pendingProps.children, a), t.child;
        case 12: return dt(e, t, t.pendingProps.children, a), t.child;
        case 10: return n = t.pendingProps, Ks(t, t.type, n.value), dt(e, t, n.children, a), t.child;
        case 9: return o = t.type._context, n = t.pendingProps.children, Sa(t), o = ot(o), n = n(o), t.flags |= 1, dt(e, t, n, a), t.child;
        case 14: return Rf(e, t, t.type, t.pendingProps, a);
        case 15: return qf(e, t, t.type, t.pendingProps, a);
        case 19: return Yf(e, t, a);
        case 31: return rb(e, t, a);
        case 22: return Bf(e, t, a, t.pendingProps);
        case 24: return Sa(t), n = ot(Qe), e === null ? (o = Gc(), o === null && (o = Me, d = Hc(), o.pooledCache = d, d.refCount++, d !== null && (o.pooledCacheLanes |= a), o = d), t.memoizedState = { parent: n, cache: o }, Kc(t), Ks(t, Qe, o)) : ((e.lanes & a) !== 0 && (Yc(e, t), tn(t, null, null, a), en()), o = e.memoizedState, d = t.memoizedState, o.parent !== n ? (o = { parent: n, cache: n }, t.memoizedState = o, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = o), Ks(t, Qe, n)) : (n = d.cache, Ks(t, Qe, n), n !== o.cache && Lc(t, [Qe], a, !0))), dt(e, t, t.pendingProps.children, a), t.child;
        case 29: throw t.pendingProps;
    } throw Error(c(156, t.tag)); }
    function Ss(e) { e.flags |= 4; }
    function Ao(e, t, a, n, o) { if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
        if (e.flags |= 16777216, (o & 335544128) === o)
            if (e.stateNode.complete)
                e.flags |= 8192;
            else if (yh())
                e.flags |= 8192;
            else
                throw Aa = mi, Qc;
    }
    else
        e.flags &= -16777217; }
    function Zf(e, t) { if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
        e.flags &= -16777217;
    else if (e.flags |= 16777216, !cx(t))
        if (yh())
            e.flags |= 8192;
        else
            throw Aa = mi, Qc; }
    function Ei(e, t) { t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? ku() : 536870912, e.lanes |= t, fl |= t); }
    function cn(e, t) { if (!be)
        switch (e.tailMode) {
            case "hidden":
                t = e.tail;
                for (var a = null; t !== null;)
                    t.alternate !== null && (a = t), t = t.sibling;
                a === null ? e.tail = null : a.sibling = null;
                break;
            case "collapsed":
                a = e.tail;
                for (var n = null; a !== null;)
                    a.alternate !== null && (n = a), a = a.sibling;
                n === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : n.sibling = null;
        } }
    function Oe(e) { var t = e.alternate !== null && e.alternate.child === e.child, a = 0, n = 0; if (t)
        for (var o = e.child; o !== null;)
            a |= o.lanes | o.childLanes, n |= o.subtreeFlags & 65011712, n |= o.flags & 65011712, o.return = e, o = o.sibling;
    else
        for (o = e.child; o !== null;)
            a |= o.lanes | o.childLanes, n |= o.subtreeFlags, n |= o.flags, o.return = e, o = o.sibling; return e.subtreeFlags |= n, e.childLanes = a, t; }
    function ob(e, t, a) { var n = t.pendingProps; switch (zc(t), t.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14: return Oe(t), null;
        case 1: return Oe(t), null;
        case 3: return a = t.stateNode, n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), vs(Qe), It(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (e === null || e.child === null) && (el(t) ? Ss(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, qc())), Oe(t), null;
        case 26:
            var o = t.type, d = t.memoizedState;
            return e === null ? (Ss(t), d !== null ? (Oe(t), Zf(t, d)) : (Oe(t), Ao(t, o, null, n, a))) : d ? d !== e.memoizedState ? (Ss(t), Oe(t), Zf(t, d)) : (Oe(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== n && Ss(t), Oe(t), Ao(t, o, e, n, a)), null;
        case 27:
            if (qs(t), a = Pt.current, o = t.type, e !== null && t.stateNode != null)
                e.memoizedProps !== n && Ss(t);
            else {
                if (!n) {
                    if (t.stateNode === null)
                        throw Error(c(166));
                    return Oe(t), null;
                }
                e = me.current, el(t) ? km(t) : (e = ex(o, n, a), t.stateNode = e, Ss(t));
            }
            return Oe(t), null;
        case 5:
            if (qs(t), o = t.type, e !== null && t.stateNode != null)
                e.memoizedProps !== n && Ss(t);
            else {
                if (!n) {
                    if (t.stateNode === null)
                        throw Error(c(166));
                    return Oe(t), null;
                }
                if (d = me.current, el(t))
                    km(t);
                else {
                    var f = Ki(Pt.current);
                    switch (d) {
                        case 1:
                            d = f.createElementNS("http://www.w3.org/2000/svg", o);
                            break;
                        case 2:
                            d = f.createElementNS("http://www.w3.org/1998/Math/MathML", o);
                            break;
                        default: switch (o) {
                            case "svg":
                                d = f.createElementNS("http://www.w3.org/2000/svg", o);
                                break;
                            case "math":
                                d = f.createElementNS("http://www.w3.org/1998/Math/MathML", o);
                                break;
                            case "script":
                                d = f.createElement("div"), d.innerHTML = "<script><\/script>", d = d.removeChild(d.firstChild);
                                break;
                            case "select":
                                d = typeof n.is == "string" ? f.createElement("select", { is: n.is }) : f.createElement("select"), n.multiple ? d.multiple = !0 : n.size && (d.size = n.size);
                                break;
                            default: d = typeof n.is == "string" ? f.createElement(o, { is: n.is }) : f.createElement(o);
                        }
                    }
                    d[rt] = t, d[xt] = n;
                    e: for (f = t.child; f !== null;) {
                        if (f.tag === 5 || f.tag === 6)
                            d.appendChild(f.stateNode);
                        else if (f.tag !== 4 && f.tag !== 27 && f.child !== null) {
                            f.child.return = f, f = f.child;
                            continue;
                        }
                        if (f === t)
                            break e;
                        for (; f.sibling === null;) {
                            if (f.return === null || f.return === t)
                                break e;
                            f = f.return;
                        }
                        f.sibling.return = f.return, f = f.sibling;
                    }
                    t.stateNode = d;
                    e: switch (ut(d, o, n), o) {
                        case "button":
                        case "input":
                        case "select":
                        case "textarea":
                            n = !!n.autoFocus;
                            break e;
                        case "img":
                            n = !0;
                            break e;
                        default: n = !1;
                    }
                    n && Ss(t);
                }
            }
            return Oe(t), Ao(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, a), null;
        case 6:
            if (e && t.stateNode != null)
                e.memoizedProps !== n && Ss(t);
            else {
                if (typeof n != "string" && t.stateNode === null)
                    throw Error(c(166));
                if (e = Pt.current, el(t)) {
                    if (e = t.stateNode, a = t.memoizedProps, n = null, o = ct, o !== null)
                        switch (o.tag) {
                            case 27:
                            case 5: n = o.memoizedProps;
                        }
                    e[rt] = t, e = !!(e.nodeValue === a || n !== null && n.suppressHydrationWarning === !0 || Qh(e.nodeValue, a)), e || Qs(t, !0);
                }
                else
                    e = Ki(e).createTextNode(n), e[rt] = t, t.stateNode = e;
            }
            return Oe(t), null;
        case 31:
            if (a = t.memoizedState, e === null || e.memoizedState !== null) {
                if (n = el(t), a !== null) {
                    if (e === null) {
                        if (!n)
                            throw Error(c(318));
                        if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e)
                            throw Error(c(557));
                        e[rt] = t;
                    }
                    else
                        Na(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                    Oe(t), e = !1;
                }
                else
                    a = qc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), e = !0;
                if (!e)
                    return t.flags & 256 ? (_t(t), t) : (_t(t), null);
                if ((t.flags & 128) !== 0)
                    throw Error(c(558));
            }
            return Oe(t), null;
        case 13:
            if (n = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                if (o = el(t), n !== null && n.dehydrated !== null) {
                    if (e === null) {
                        if (!o)
                            throw Error(c(318));
                        if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o)
                            throw Error(c(317));
                        o[rt] = t;
                    }
                    else
                        Na(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                    Oe(t), o = !1;
                }
                else
                    o = qc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = o), o = !0;
                if (!o)
                    return t.flags & 256 ? (_t(t), t) : (_t(t), null);
            }
            return _t(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = n !== null, e = e !== null && e.memoizedState !== null, a && (n = t.child, o = null, n.alternate !== null && n.alternate.memoizedState !== null && n.alternate.memoizedState.cachePool !== null && (o = n.alternate.memoizedState.cachePool.pool), d = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (d = n.memoizedState.cachePool.pool), d !== o && (n.flags |= 2048)), a !== e && a && (t.child.flags |= 8192), Ei(t, t.updateQueue), Oe(t), null);
        case 4: return It(), e === null && Fo(t.stateNode.containerInfo), Oe(t), null;
        case 10: return vs(t.type), Oe(t), null;
        case 19:
            if (ne(Le), n = t.memoizedState, n === null)
                return Oe(t), null;
            if (o = (t.flags & 128) !== 0, d = n.rendering, d === null)
                if (o)
                    cn(n, !1);
                else {
                    if (Be !== 0 || e !== null && (e.flags & 128) !== 0)
                        for (e = t.child; e !== null;) {
                            if (d = pi(e), d !== null) {
                                for (t.flags |= 128, cn(n, !1), e = d.updateQueue, t.updateQueue = e, Ei(t, e), t.subtreeFlags = 0, e = a, a = t.child; a !== null;)
                                    vm(a, e), a = a.sibling;
                                return se(Le, Le.current & 1 | 2), be && bs(t, n.treeForkCount), t.child;
                            }
                            e = e.sibling;
                        }
                    n.tail !== null && kt() > zi && (t.flags |= 128, o = !0, cn(n, !1), t.lanes = 4194304);
                }
            else {
                if (!o)
                    if (e = pi(d), e !== null) {
                        if (t.flags |= 128, o = !0, e = e.updateQueue, t.updateQueue = e, Ei(t, e), cn(n, !0), n.tail === null && n.tailMode === "hidden" && !d.alternate && !be)
                            return Oe(t), null;
                    }
                    else
                        2 * kt() - n.renderingStartTime > zi && a !== 536870912 && (t.flags |= 128, o = !0, cn(n, !1), t.lanes = 4194304);
                n.isBackwards ? (d.sibling = t.child, t.child = d) : (e = n.last, e !== null ? e.sibling = d : t.child = d, n.last = d);
            }
            return n.tail !== null ? (e = n.tail, n.rendering = e, n.tail = e.sibling, n.renderingStartTime = kt(), e.sibling = null, a = Le.current, se(Le, o ? a & 1 | 2 : a & 1), be && bs(t, n.treeForkCount), e) : (Oe(t), null);
        case 22:
        case 23: return _t(t), Fc(), n = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== n && (t.flags |= 8192) : n && (t.flags |= 8192), n ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (Oe(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Oe(t), a = t.updateQueue, a !== null && Ei(t, a.retryQueue), a = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), n = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (n = t.memoizedState.cachePool.pool), n !== a && (t.flags |= 2048), e !== null && ne(ka), null;
        case 24: return a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), vs(Qe), Oe(t), null;
        case 25: return null;
        case 30: return null;
    } throw Error(c(156, t.tag)); }
    function db(e, t) { switch (zc(t), t.tag) {
        case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 3: return vs(Qe), It(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
        case 26:
        case 27:
        case 5: return qs(t), null;
        case 31:
            if (t.memoizedState !== null) {
                if (_t(t), t.alternate === null)
                    throw Error(c(340));
                Na();
            }
            return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 13:
            if (_t(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
                if (t.alternate === null)
                    throw Error(c(340));
                Na();
            }
            return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 19: return ne(Le), null;
        case 4: return It(), null;
        case 10: return vs(t.type), null;
        case 22:
        case 23: return _t(t), Fc(), e !== null && ne(ka), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 24: return vs(Qe), null;
        case 25: return null;
        default: return null;
    } }
    function Jf(e, t) { switch (zc(t), t.tag) {
        case 3:
            vs(Qe), It();
            break;
        case 26:
        case 27:
        case 5:
            qs(t);
            break;
        case 4:
            It();
            break;
        case 31:
            t.memoizedState !== null && _t(t);
            break;
        case 13:
            _t(t);
            break;
        case 19:
            ne(Le);
            break;
        case 10:
            vs(t.type);
            break;
        case 22:
        case 23:
            _t(t), Fc(), e !== null && ne(ka);
            break;
        case 24: vs(Qe);
    } }
    function on(e, t) { try {
        var a = t.updateQueue, n = a !== null ? a.lastEffect : null;
        if (n !== null) {
            var o = n.next;
            a = o;
            do {
                if ((a.tag & e) === e) {
                    n = void 0;
                    var d = a.create, f = a.inst;
                    n = d(), f.destroy = n;
                }
                a = a.next;
            } while (a !== o);
        }
    }
    catch (x) {
        Ce(t, t.return, x);
    } }
    function $s(e, t, a) { try {
        var n = t.updateQueue, o = n !== null ? n.lastEffect : null;
        if (o !== null) {
            var d = o.next;
            n = d;
            do {
                if ((n.tag & e) === e) {
                    var f = n.inst, x = f.destroy;
                    if (x !== void 0) {
                        f.destroy = void 0, o = t;
                        var N = a, _ = x;
                        try {
                            _();
                        }
                        catch (U) {
                            Ce(o, N, U);
                        }
                    }
                }
                n = n.next;
            } while (n !== d);
        }
    }
    catch (U) {
        Ce(t, t.return, U);
    } }
    function Ff(e) { var t = e.updateQueue; if (t !== null) {
        var a = e.stateNode;
        try {
            Um(t, a);
        }
        catch (n) {
            Ce(e, e.return, n);
        }
    } }
    function $f(e, t, a) { a.props = Ma(e.type, e.memoizedProps), a.state = e.memoizedState; try {
        a.componentWillUnmount();
    }
    catch (n) {
        Ce(e, t, n);
    } }
    function dn(e, t) { try {
        var a = e.ref;
        if (a !== null) {
            switch (e.tag) {
                case 26:
                case 27:
                case 5:
                    var n = e.stateNode;
                    break;
                case 30:
                    n = e.stateNode;
                    break;
                default: n = e.stateNode;
            }
            typeof a == "function" ? e.refCleanup = a(n) : a.current = n;
        }
    }
    catch (o) {
        Ce(e, t, o);
    } }
    function cs(e, t) { var a = e.ref, n = e.refCleanup; if (a !== null)
        if (typeof n == "function")
            try {
                n();
            }
            catch (o) {
                Ce(e, t, o);
            }
            finally {
                e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
            }
        else if (typeof a == "function")
            try {
                a(null);
            }
            catch (o) {
                Ce(e, t, o);
            }
        else
            a.current = null; }
    function Pf(e) { var t = e.type, a = e.memoizedProps, n = e.stateNode; try {
        e: switch (t) {
            case "button":
            case "input":
            case "select":
            case "textarea":
                a.autoFocus && n.focus();
                break e;
            case "img": a.src ? n.src = a.src : a.srcSet && (n.srcset = a.srcSet);
        }
    }
    catch (o) {
        Ce(e, e.return, o);
    } }
    function To(e, t, a) { try {
        var n = e.stateNode;
        Ob(n, e.type, a, t), n[xt] = t;
    }
    catch (o) {
        Ce(e, e.return, o);
    } }
    function If(e) { return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && aa(e.type) || e.tag === 4; }
    function Eo(e) { e: for (;;) {
        for (; e.sibling === null;) {
            if (e.return === null || If(e.return))
                return null;
            e = e.return;
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
            if (e.tag === 27 && aa(e.type) || e.flags & 2 || e.child === null || e.tag === 4)
                continue e;
            e.child.return = e, e = e.child;
        }
        if (!(e.flags & 2))
            return e.stateNode;
    } }
    function Mo(e, t, a) { var n = e.tag; if (n === 5 || n === 6)
        e = e.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(e, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(e), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = xs));
    else if (n !== 4 && (n === 27 && aa(e.type) && (a = e.stateNode, t = null), e = e.child, e !== null))
        for (Mo(e, t, a), e = e.sibling; e !== null;)
            Mo(e, t, a), e = e.sibling; }
    function Mi(e, t, a) { var n = e.tag; if (n === 5 || n === 6)
        e = e.stateNode, t ? a.insertBefore(e, t) : a.appendChild(e);
    else if (n !== 4 && (n === 27 && aa(e.type) && (a = e.stateNode), e = e.child, e !== null))
        for (Mi(e, t, a), e = e.sibling; e !== null;)
            Mi(e, t, a), e = e.sibling; }
    function Wf(e) { var t = e.stateNode, a = e.memoizedProps; try {
        for (var n = e.type, o = t.attributes; o.length;)
            t.removeAttributeNode(o[0]);
        ut(t, n, a), t[rt] = e, t[xt] = a;
    }
    catch (d) {
        Ce(e, e.return, d);
    } }
    var ks = !1, Xe = !1, _o = !1, eh = typeof WeakSet == "function" ? WeakSet : Set, st = null;
    function ub(e, t) { if (e = e.containerInfo, Io = Pi, e = um(e), wc(e)) {
        if ("selectionStart" in e)
            var a = { start: e.selectionStart, end: e.selectionEnd };
        else
            e: {
                a = (a = e.ownerDocument) && a.defaultView || window;
                var n = a.getSelection && a.getSelection();
                if (n && n.rangeCount !== 0) {
                    a = n.anchorNode;
                    var o = n.anchorOffset, d = n.focusNode;
                    n = n.focusOffset;
                    try {
                        a.nodeType, d.nodeType;
                    }
                    catch {
                        a = null;
                        break e;
                    }
                    var f = 0, x = -1, N = -1, _ = 0, U = 0, H = e, O = null;
                    t: for (;;) {
                        for (var R; H !== a || o !== 0 && H.nodeType !== 3 || (x = f + o), H !== d || n !== 0 && H.nodeType !== 3 || (N = f + n), H.nodeType === 3 && (f += H.nodeValue.length), (R = H.firstChild) !== null;)
                            O = H, H = R;
                        for (;;) {
                            if (H === e)
                                break t;
                            if (O === a && ++_ === o && (x = f), O === d && ++U === n && (N = f), (R = H.nextSibling) !== null)
                                break;
                            H = O, O = H.parentNode;
                        }
                        H = R;
                    }
                    a = x === -1 || N === -1 ? null : { start: x, end: N };
                }
                else
                    a = null;
            }
        a = a || { start: 0, end: 0 };
    }
    else
        a = null; for (Wo = { focusedElem: e, selectionRange: a }, Pi = !1, st = t; st !== null;)
        if (t = st, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
            e.return = t, st = e;
        else
            for (; st !== null;) {
                switch (t = st, d = t.alternate, e = t.flags, t.tag) {
                    case 0:
                        if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                            for (a = 0; a < e.length; a++)
                                o = e[a], o.ref.impl = o.nextImpl;
                        break;
                    case 11:
                    case 15: break;
                    case 1:
                        if ((e & 1024) !== 0 && d !== null) {
                            e = void 0, a = t, o = d.memoizedProps, d = d.memoizedState, n = a.stateNode;
                            try {
                                var P = Ma(a.type, o);
                                e = n.getSnapshotBeforeUpdate(P, d), n.__reactInternalSnapshotBeforeUpdate = e;
                            }
                            catch (ae) {
                                Ce(a, a.return, ae);
                            }
                        }
                        break;
                    case 3:
                        if ((e & 1024) !== 0) {
                            if (e = t.stateNode.containerInfo, a = e.nodeType, a === 9)
                                sd(e);
                            else if (a === 1)
                                switch (e.nodeName) {
                                    case "HEAD":
                                    case "HTML":
                                    case "BODY":
                                        sd(e);
                                        break;
                                    default: e.textContent = "";
                                }
                        }
                        break;
                    case 5:
                    case 26:
                    case 27:
                    case 6:
                    case 4:
                    case 17: break;
                    default: if ((e & 1024) !== 0)
                        throw Error(c(163));
                }
                if (e = t.sibling, e !== null) {
                    e.return = t.return, st = e;
                    break;
                }
                st = t.return;
            } }
    function th(e, t, a) { var n = a.flags; switch (a.tag) {
        case 0:
        case 11:
        case 15:
            As(e, a), n & 4 && on(5, a);
            break;
        case 1:
            if (As(e, a), n & 4)
                if (e = a.stateNode, t === null)
                    try {
                        e.componentDidMount();
                    }
                    catch (f) {
                        Ce(a, a.return, f);
                    }
                else {
                    var o = Ma(a.type, t.memoizedProps);
                    t = t.memoizedState;
                    try {
                        e.componentDidUpdate(o, t, e.__reactInternalSnapshotBeforeUpdate);
                    }
                    catch (f) {
                        Ce(a, a.return, f);
                    }
                }
            n & 64 && Ff(a), n & 512 && dn(a, a.return);
            break;
        case 3:
            if (As(e, a), n & 64 && (e = a.updateQueue, e !== null)) {
                if (t = null, a.child !== null)
                    switch (a.child.tag) {
                        case 27:
                        case 5:
                            t = a.child.stateNode;
                            break;
                        case 1: t = a.child.stateNode;
                    }
                try {
                    Um(e, t);
                }
                catch (f) {
                    Ce(a, a.return, f);
                }
            }
            break;
        case 27: t === null && n & 4 && Wf(a);
        case 26:
        case 5:
            As(e, a), t === null && n & 4 && Pf(a), n & 512 && dn(a, a.return);
            break;
        case 12:
            As(e, a);
            break;
        case 31:
            As(e, a), n & 4 && lh(e, a);
            break;
        case 13:
            As(e, a), n & 4 && nh(e, a), n & 64 && (e = a.memoizedState, e !== null && (e = e.dehydrated, e !== null && (a = vb.bind(null, a), Hb(e, a))));
            break;
        case 22:
            if (n = a.memoizedState !== null || ks, !n) {
                t = t !== null && t.memoizedState !== null || Xe, o = ks;
                var d = Xe;
                ks = n, (Xe = t) && !d ? Ts(e, a, (a.subtreeFlags & 8772) !== 0) : As(e, a), ks = o, Xe = d;
            }
            break;
        case 30: break;
        default: As(e, a);
    } }
    function sh(e) { var t = e.alternate; t !== null && (e.alternate = null, sh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ic(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null; }
    var De = null, gt = !1;
    function Cs(e, t, a) { for (a = a.child; a !== null;)
        ah(e, t, a), a = a.sibling; }
    function ah(e, t, a) { if (Ct && typeof Ct.onCommitFiberUnmount == "function")
        try {
            Ct.onCommitFiberUnmount(Dl, a);
        }
        catch { } switch (a.tag) {
        case 26:
            Xe || cs(a, t), Cs(e, t, a), a.memoizedState ? a.memoizedState.count-- : a.stateNode && (a = a.stateNode, a.parentNode.removeChild(a));
            break;
        case 27:
            Xe || cs(a, t);
            var n = De, o = gt;
            aa(a.type) && (De = a.stateNode, gt = !1), Cs(e, t, a), yn(a.stateNode), De = n, gt = o;
            break;
        case 5: Xe || cs(a, t);
        case 6:
            if (n = De, o = gt, De = null, Cs(e, t, a), De = n, gt = o, De !== null)
                if (gt)
                    try {
                        (De.nodeType === 9 ? De.body : De.nodeName === "HTML" ? De.ownerDocument.body : De).removeChild(a.stateNode);
                    }
                    catch (d) {
                        Ce(a, t, d);
                    }
                else
                    try {
                        De.removeChild(a.stateNode);
                    }
                    catch (d) {
                        Ce(a, t, d);
                    }
            break;
        case 18:
            De !== null && (gt ? (e = De, Fh(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, a.stateNode), jl(e)) : Fh(De, a.stateNode));
            break;
        case 4:
            n = De, o = gt, De = a.stateNode.containerInfo, gt = !0, Cs(e, t, a), De = n, gt = o;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            $s(2, a, t), Xe || $s(4, a, t), Cs(e, t, a);
            break;
        case 1:
            Xe || (cs(a, t), n = a.stateNode, typeof n.componentWillUnmount == "function" && $f(a, t, n)), Cs(e, t, a);
            break;
        case 21:
            Cs(e, t, a);
            break;
        case 22:
            Xe = (n = Xe) || a.memoizedState !== null, Cs(e, t, a), Xe = n;
            break;
        default: Cs(e, t, a);
    } }
    function lh(e, t) { if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
        e = e.dehydrated;
        try {
            jl(e);
        }
        catch (a) {
            Ce(t, t.return, a);
        }
    } }
    function nh(e, t) { if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
        try {
            jl(e);
        }
        catch (a) {
            Ce(t, t.return, a);
        } }
    function mb(e) { switch (e.tag) {
        case 31:
        case 13:
        case 19:
            var t = e.stateNode;
            return t === null && (t = e.stateNode = new eh), t;
        case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new eh), t;
        default: throw Error(c(435, e.tag));
    } }
    function _i(e, t) { var a = mb(e); t.forEach(function (n) { if (!a.has(n)) {
        a.add(n);
        var o = jb.bind(null, e, n);
        n.then(o, o);
    } }); }
    function bt(e, t) { var a = t.deletions; if (a !== null)
        for (var n = 0; n < a.length; n++) {
            var o = a[n], d = e, f = t, x = f;
            e: for (; x !== null;) {
                switch (x.tag) {
                    case 27:
                        if (aa(x.type)) {
                            De = x.stateNode, gt = !1;
                            break e;
                        }
                        break;
                    case 5:
                        De = x.stateNode, gt = !1;
                        break e;
                    case 3:
                    case 4:
                        De = x.stateNode.containerInfo, gt = !0;
                        break e;
                }
                x = x.return;
            }
            if (De === null)
                throw Error(c(160));
            ah(d, f, o), De = null, gt = !1, d = o.alternate, d !== null && (d.return = null), o.return = null;
        } if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null;)
            ih(t, e), t = t.sibling; }
    var es = null;
    function ih(e, t) { var a = e.alternate, n = e.flags; switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            bt(t, e), yt(e), n & 4 && ($s(3, e, e.return), on(3, e), $s(5, e, e.return));
            break;
        case 1:
            bt(t, e), yt(e), n & 512 && (Xe || a === null || cs(a, a.return)), n & 64 && ks && (e = e.updateQueue, e !== null && (n = e.callbacks, n !== null && (a = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = a === null ? n : a.concat(n))));
            break;
        case 26:
            var o = es;
            if (bt(t, e), yt(e), n & 512 && (Xe || a === null || cs(a, a.return)), n & 4) {
                var d = a !== null ? a.memoizedState : null;
                if (n = e.memoizedState, a === null)
                    if (n === null)
                        if (e.stateNode === null) {
                            e: {
                                n = e.type, a = e.memoizedProps, o = o.ownerDocument || o;
                                t: switch (n) {
                                    case "title":
                                        d = o.getElementsByTagName("title")[0], (!d || d[ql] || d[rt] || d.namespaceURI === "http://www.w3.org/2000/svg" || d.hasAttribute("itemprop")) && (d = o.createElement(n), o.head.insertBefore(d, o.querySelector("head > title"))), ut(d, n, a), d[rt] = e, tt(d), n = d;
                                        break e;
                                    case "link":
                                        var f = ix("link", "href", o).get(n + (a.href || ""));
                                        if (f) {
                                            for (var x = 0; x < f.length; x++)
                                                if (d = f[x], d.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && d.getAttribute("rel") === (a.rel == null ? null : a.rel) && d.getAttribute("title") === (a.title == null ? null : a.title) && d.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                                                    f.splice(x, 1);
                                                    break t;
                                                }
                                        }
                                        d = o.createElement(n), ut(d, n, a), o.head.appendChild(d);
                                        break;
                                    case "meta":
                                        if (f = ix("meta", "content", o).get(n + (a.content || ""))) {
                                            for (x = 0; x < f.length; x++)
                                                if (d = f[x], d.getAttribute("content") === (a.content == null ? null : "" + a.content) && d.getAttribute("name") === (a.name == null ? null : a.name) && d.getAttribute("property") === (a.property == null ? null : a.property) && d.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && d.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                                                    f.splice(x, 1);
                                                    break t;
                                                }
                                        }
                                        d = o.createElement(n), ut(d, n, a), o.head.appendChild(d);
                                        break;
                                    default: throw Error(c(468, n));
                                }
                                d[rt] = e, tt(d), n = d;
                            }
                            e.stateNode = n;
                        }
                        else
                            rx(o, e.type, e.stateNode);
                    else
                        e.stateNode = nx(o, n, e.memoizedProps);
                else
                    d !== n ? (d === null ? a.stateNode !== null && (a = a.stateNode, a.parentNode.removeChild(a)) : d.count--, n === null ? rx(o, e.type, e.stateNode) : nx(o, n, e.memoizedProps)) : n === null && e.stateNode !== null && To(e, e.memoizedProps, a.memoizedProps);
            }
            break;
        case 27:
            bt(t, e), yt(e), n & 512 && (Xe || a === null || cs(a, a.return)), a !== null && n & 4 && To(e, e.memoizedProps, a.memoizedProps);
            break;
        case 5:
            if (bt(t, e), yt(e), n & 512 && (Xe || a === null || cs(a, a.return)), e.flags & 32) {
                o = e.stateNode;
                try {
                    Ka(o, "");
                }
                catch (P) {
                    Ce(e, e.return, P);
                }
            }
            n & 4 && e.stateNode != null && (o = e.memoizedProps, To(e, o, a !== null ? a.memoizedProps : o)), n & 1024 && (_o = !0);
            break;
        case 6:
            if (bt(t, e), yt(e), n & 4) {
                if (e.stateNode === null)
                    throw Error(c(162));
                n = e.memoizedProps, a = e.stateNode;
                try {
                    a.nodeValue = n;
                }
                catch (P) {
                    Ce(e, e.return, P);
                }
            }
            break;
        case 3:
            if (Zi = null, o = es, es = Yi(t.containerInfo), bt(t, e), es = o, yt(e), n & 4 && a !== null && a.memoizedState.isDehydrated)
                try {
                    jl(t.containerInfo);
                }
                catch (P) {
                    Ce(e, e.return, P);
                }
            _o && (_o = !1, rh(e));
            break;
        case 4:
            n = es, es = Yi(e.stateNode.containerInfo), bt(t, e), yt(e), es = n;
            break;
        case 12:
            bt(t, e), yt(e);
            break;
        case 31:
            bt(t, e), yt(e), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, _i(e, n)));
            break;
        case 13:
            bt(t, e), yt(e), e.child.flags & 8192 && e.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Di = kt()), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, _i(e, n)));
            break;
        case 22:
            o = e.memoizedState !== null;
            var N = a !== null && a.memoizedState !== null, _ = ks, U = Xe;
            if (ks = _ || o, Xe = U || N, bt(t, e), Xe = U, ks = _, yt(e), n & 8192)
                e: for (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, o && (a === null || N || ks || Xe || _a(e)), a = null, t = e;;) {
                    if (t.tag === 5 || t.tag === 26) {
                        if (a === null) {
                            N = a = t;
                            try {
                                if (d = N.stateNode, o)
                                    f = d.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                                else {
                                    x = N.stateNode;
                                    var H = N.memoizedProps.style, O = H != null && H.hasOwnProperty("display") ? H.display : null;
                                    x.style.display = O == null || typeof O == "boolean" ? "" : ("" + O).trim();
                                }
                            }
                            catch (P) {
                                Ce(N, N.return, P);
                            }
                        }
                    }
                    else if (t.tag === 6) {
                        if (a === null) {
                            N = t;
                            try {
                                N.stateNode.nodeValue = o ? "" : N.memoizedProps;
                            }
                            catch (P) {
                                Ce(N, N.return, P);
                            }
                        }
                    }
                    else if (t.tag === 18) {
                        if (a === null) {
                            N = t;
                            try {
                                var R = N.stateNode;
                                o ? $h(R, !0) : $h(N.stateNode, !1);
                            }
                            catch (P) {
                                Ce(N, N.return, P);
                            }
                        }
                    }
                    else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
                        t.child.return = t, t = t.child;
                        continue;
                    }
                    if (t === e)
                        break e;
                    for (; t.sibling === null;) {
                        if (t.return === null || t.return === e)
                            break e;
                        a === t && (a = null), t = t.return;
                    }
                    a === t && (a = null), t.sibling.return = t.return, t = t.sibling;
                }
            n & 4 && (n = e.updateQueue, n !== null && (a = n.retryQueue, a !== null && (n.retryQueue = null, _i(e, a))));
            break;
        case 19:
            bt(t, e), yt(e), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, _i(e, n)));
            break;
        case 30: break;
        case 21: break;
        default: bt(t, e), yt(e);
    } }
    function yt(e) { var t = e.flags; if (t & 2) {
        try {
            for (var a, n = e.return; n !== null;) {
                if (If(n)) {
                    a = n;
                    break;
                }
                n = n.return;
            }
            if (a == null)
                throw Error(c(160));
            switch (a.tag) {
                case 27:
                    var o = a.stateNode, d = Eo(e);
                    Mi(e, d, o);
                    break;
                case 5:
                    var f = a.stateNode;
                    a.flags & 32 && (Ka(f, ""), a.flags &= -33);
                    var x = Eo(e);
                    Mi(e, x, f);
                    break;
                case 3:
                case 4:
                    var N = a.stateNode.containerInfo, _ = Eo(e);
                    Mo(e, _, N);
                    break;
                default: throw Error(c(161));
            }
        }
        catch (U) {
            Ce(e, e.return, U);
        }
        e.flags &= -3;
    } t & 4096 && (e.flags &= -4097); }
    function rh(e) { if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null;) {
            var t = e;
            rh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
        } }
    function As(e, t) { if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null;)
            th(e, t.alternate, t), t = t.sibling; }
    function _a(e) { for (e = e.child; e !== null;) {
        var t = e;
        switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                $s(4, t, t.return), _a(t);
                break;
            case 1:
                cs(t, t.return);
                var a = t.stateNode;
                typeof a.componentWillUnmount == "function" && $f(t, t.return, a), _a(t);
                break;
            case 27: yn(t.stateNode);
            case 26:
            case 5:
                cs(t, t.return), _a(t);
                break;
            case 22:
                t.memoizedState === null && _a(t);
                break;
            case 30:
                _a(t);
                break;
            default: _a(t);
        }
        e = e.sibling;
    } }
    function Ts(e, t, a) { for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null;) {
        var n = t.alternate, o = e, d = t, f = d.flags;
        switch (d.tag) {
            case 0:
            case 11:
            case 15:
                Ts(o, d, a), on(4, d);
                break;
            case 1:
                if (Ts(o, d, a), n = d, o = n.stateNode, typeof o.componentDidMount == "function")
                    try {
                        o.componentDidMount();
                    }
                    catch (_) {
                        Ce(n, n.return, _);
                    }
                if (n = d, o = n.updateQueue, o !== null) {
                    var x = n.stateNode;
                    try {
                        var N = o.shared.hiddenCallbacks;
                        if (N !== null)
                            for (o.shared.hiddenCallbacks = null, o = 0; o < N.length; o++)
                                Bm(N[o], x);
                    }
                    catch (_) {
                        Ce(n, n.return, _);
                    }
                }
                a && f & 64 && Ff(d), dn(d, d.return);
                break;
            case 27: Wf(d);
            case 26:
            case 5:
                Ts(o, d, a), a && n === null && f & 4 && Pf(d), dn(d, d.return);
                break;
            case 12:
                Ts(o, d, a);
                break;
            case 31:
                Ts(o, d, a), a && f & 4 && lh(o, d);
                break;
            case 13:
                Ts(o, d, a), a && f & 4 && nh(o, d);
                break;
            case 22:
                d.memoizedState === null && Ts(o, d, a), dn(d, d.return);
                break;
            case 30: break;
            default: Ts(o, d, a);
        }
        t = t.sibling;
    } }
    function Oo(e, t) { var a = null; e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== a && (e != null && e.refCount++, a != null && Fl(a)); }
    function Do(e, t) { e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Fl(e)); }
    function ts(e, t, a, n) { if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;)
            ch(e, t, a, n), t = t.sibling; }
    function ch(e, t, a, n) { var o = t.flags; switch (t.tag) {
        case 0:
        case 11:
        case 15:
            ts(e, t, a, n), o & 2048 && on(9, t);
            break;
        case 1:
            ts(e, t, a, n);
            break;
        case 3:
            ts(e, t, a, n), o & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Fl(e)));
            break;
        case 12:
            if (o & 2048) {
                ts(e, t, a, n), e = t.stateNode;
                try {
                    var d = t.memoizedProps, f = d.id, x = d.onPostCommit;
                    typeof x == "function" && x(f, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
                }
                catch (N) {
                    Ce(t, t.return, N);
                }
            }
            else
                ts(e, t, a, n);
            break;
        case 31:
            ts(e, t, a, n);
            break;
        case 13:
            ts(e, t, a, n);
            break;
        case 23: break;
        case 22:
            d = t.stateNode, f = t.alternate, t.memoizedState !== null ? d._visibility & 2 ? ts(e, t, a, n) : un(e, t) : d._visibility & 2 ? ts(e, t, a, n) : (d._visibility |= 2, dl(e, t, a, n, (t.subtreeFlags & 10256) !== 0 || !1)), o & 2048 && Oo(f, t);
            break;
        case 24:
            ts(e, t, a, n), o & 2048 && Do(t.alternate, t);
            break;
        default: ts(e, t, a, n);
    } }
    function dl(e, t, a, n, o) { for (o = o && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null;) {
        var d = e, f = t, x = a, N = n, _ = f.flags;
        switch (f.tag) {
            case 0:
            case 11:
            case 15:
                dl(d, f, x, N, o), on(8, f);
                break;
            case 23: break;
            case 22:
                var U = f.stateNode;
                f.memoizedState !== null ? U._visibility & 2 ? dl(d, f, x, N, o) : un(d, f) : (U._visibility |= 2, dl(d, f, x, N, o)), o && _ & 2048 && Oo(f.alternate, f);
                break;
            case 24:
                dl(d, f, x, N, o), o && _ & 2048 && Do(f.alternate, f);
                break;
            default: dl(d, f, x, N, o);
        }
        t = t.sibling;
    } }
    function un(e, t) { if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;) {
            var a = e, n = t, o = n.flags;
            switch (n.tag) {
                case 22:
                    un(a, n), o & 2048 && Oo(n.alternate, n);
                    break;
                case 24:
                    un(a, n), o & 2048 && Do(n.alternate, n);
                    break;
                default: un(a, n);
            }
            t = t.sibling;
        } }
    var mn = 8192;
    function ul(e, t, a) { if (e.subtreeFlags & mn)
        for (e = e.child; e !== null;)
            oh(e, t, a), e = e.sibling; }
    function oh(e, t, a) { switch (e.tag) {
        case 26:
            ul(e, t, a), e.flags & mn && e.memoizedState !== null && Ib(a, es, e.memoizedState, e.memoizedProps);
            break;
        case 5:
            ul(e, t, a);
            break;
        case 3:
        case 4:
            var n = es;
            es = Yi(e.stateNode.containerInfo), ul(e, t, a), es = n;
            break;
        case 22:
            e.memoizedState === null && (n = e.alternate, n !== null && n.memoizedState !== null ? (n = mn, mn = 16777216, ul(e, t, a), mn = n) : ul(e, t, a));
            break;
        default: ul(e, t, a);
    } }
    function dh(e) { var t = e.alternate; if (t !== null && (e = t.child, e !== null)) {
        t.child = null;
        do
            t = e.sibling, e.sibling = null, e = t;
        while (e !== null);
    } }
    function fn(e) { var t = e.deletions; if ((e.flags & 16) !== 0) {
        if (t !== null)
            for (var a = 0; a < t.length; a++) {
                var n = t[a];
                st = n, mh(n, e);
            }
        dh(e);
    } if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null;)
            uh(e), e = e.sibling; }
    function uh(e) { switch (e.tag) {
        case 0:
        case 11:
        case 15:
            fn(e), e.flags & 2048 && $s(9, e, e.return);
            break;
        case 3:
            fn(e);
            break;
        case 12:
            fn(e);
            break;
        case 22:
            var t = e.stateNode;
            e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Oi(e)) : fn(e);
            break;
        default: fn(e);
    } }
    function Oi(e) { var t = e.deletions; if ((e.flags & 16) !== 0) {
        if (t !== null)
            for (var a = 0; a < t.length; a++) {
                var n = t[a];
                st = n, mh(n, e);
            }
        dh(e);
    } for (e = e.child; e !== null;) {
        switch (t = e, t.tag) {
            case 0:
            case 11:
            case 15:
                $s(8, t, t.return), Oi(t);
                break;
            case 22:
                a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, Oi(t));
                break;
            default: Oi(t);
        }
        e = e.sibling;
    } }
    function mh(e, t) { for (; st !== null;) {
        var a = st;
        switch (a.tag) {
            case 0:
            case 11:
            case 15:
                $s(8, a, t);
                break;
            case 23:
            case 22:
                if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
                    var n = a.memoizedState.cachePool.pool;
                    n != null && n.refCount++;
                }
                break;
            case 24: Fl(a.memoizedState.cache);
        }
        if (n = a.child, n !== null)
            n.return = a, st = n;
        else
            e: for (a = e; st !== null;) {
                n = st;
                var o = n.sibling, d = n.return;
                if (sh(n), n === a) {
                    st = null;
                    break e;
                }
                if (o !== null) {
                    o.return = d, st = o;
                    break e;
                }
                st = d;
            }
    } }
    var fb = { getCacheForType: function (e) { var t = ot(Qe), a = t.data.get(e); return a === void 0 && (a = e(), t.data.set(e, a)), a; }, cacheSignal: function () { return ot(Qe).controller.signal; } }, hb = typeof WeakMap == "function" ? WeakMap : Map, Ne = 0, Me = null, fe = null, pe = 0, ke = 0, Ot = null, Ps = !1, ml = !1, zo = !1, Es = 0, Be = 0, Is = 0, Oa = 0, Ro = 0, Dt = 0, fl = 0, hn = null, vt = null, qo = !1, Di = 0, fh = 0, zi = 1 / 0, Ri = null, Ws = null, Fe = 0, ea = null, hl = null, Ms = 0, Bo = 0, Uo = null, hh = null, xn = 0, Lo = null;
    function zt() { return (Ne & 2) !== 0 && pe !== 0 ? pe & -pe : E.T !== null ? Yo() : Eu(); }
    function xh() { if (Dt === 0)
        if ((pe & 536870912) === 0 || be) {
            var e = Qn;
            Qn <<= 1, (Qn & 3932160) === 0 && (Qn = 262144), Dt = e;
        }
        else
            Dt = 536870912; return e = Mt.current, e !== null && (e.flags |= 32), Dt; }
    function jt(e, t, a) { (e === Me && (ke === 2 || ke === 9) || e.cancelPendingCommit !== null) && (xl(e, 0), ta(e, pe, Dt, !1)), Rl(e, a), ((Ne & 2) === 0 || e !== Me) && (e === Me && ((Ne & 2) === 0 && (Oa |= a), Be === 4 && ta(e, pe, Dt, !1)), os(e)); }
    function ph(e, t, a) { if ((Ne & 6) !== 0)
        throw Error(c(327)); var n = !a && (t & 127) === 0 && (t & e.expiredLanes) === 0 || zl(e, t), o = n ? gb(e, t) : Vo(e, t, !0), d = n; do {
        if (o === 0) {
            ml && !n && ta(e, t, 0, !1);
            break;
        }
        else {
            if (a = e.current.alternate, d && !xb(a)) {
                o = Vo(e, t, !1), d = !1;
                continue;
            }
            if (o === 2) {
                if (d = t, e.errorRecoveryDisabledLanes & d)
                    var f = 0;
                else
                    f = e.pendingLanes & -536870913, f = f !== 0 ? f : f & 536870912 ? 536870912 : 0;
                if (f !== 0) {
                    t = f;
                    e: {
                        var x = e;
                        o = hn;
                        var N = x.current.memoizedState.isDehydrated;
                        if (N && (xl(x, f).flags |= 256), f = Vo(x, f, !1), f !== 2) {
                            if (zo && !N) {
                                x.errorRecoveryDisabledLanes |= d, Oa |= d, o = 4;
                                break e;
                            }
                            d = vt, vt = o, d !== null && (vt === null ? vt = d : vt.push.apply(vt, d));
                        }
                        o = f;
                    }
                    if (d = !1, o !== 2)
                        continue;
                }
            }
            if (o === 1) {
                xl(e, 0), ta(e, t, 0, !0);
                break;
            }
            e: {
                switch (n = e, d = o, d) {
                    case 0:
                    case 1: throw Error(c(345));
                    case 4: if ((t & 4194048) !== t)
                        break;
                    case 6:
                        ta(n, t, Dt, !Ps);
                        break e;
                    case 2:
                        vt = null;
                        break;
                    case 3:
                    case 5: break;
                    default: throw Error(c(329));
                }
                if ((t & 62914560) === t && (o = Di + 300 - kt(), 10 < o)) {
                    if (ta(n, t, Dt, !Ps), Yn(n, 0, !0) !== 0)
                        break e;
                    Ms = t, n.timeoutHandle = Zh(gh.bind(null, n, a, vt, Ri, qo, t, Dt, Oa, fl, Ps, d, "Throttled", -0, 0), o);
                    break e;
                }
                gh(n, a, vt, Ri, qo, t, Dt, Oa, fl, Ps, d, null, -0, 0);
            }
        }
        break;
    } while (!0); os(e); }
    function gh(e, t, a, n, o, d, f, x, N, _, U, H, O, R) { if (e.timeoutHandle = -1, H = t.subtreeFlags, H & 8192 || (H & 16785408) === 16785408) {
        H = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: !0, waitingForViewTransition: !1, unsuspend: xs }, oh(t, d, H);
        var P = (d & 62914560) === d ? Di - kt() : (d & 4194048) === d ? fh - kt() : 0;
        if (P = Wb(H, P), P !== null) {
            Ms = d, e.cancelPendingCommit = P(kh.bind(null, e, t, d, a, n, o, f, x, N, U, H, null, O, R)), ta(e, d, f, !_);
            return;
        }
    } kh(e, t, d, a, n, o, f, x, N); }
    function xb(e) { for (var t = e;;) {
        var a = t.tag;
        if ((a === 0 || a === 11 || a === 15) && t.flags & 16384 && (a = t.updateQueue, a !== null && (a = a.stores, a !== null)))
            for (var n = 0; n < a.length; n++) {
                var o = a[n], d = o.getSnapshot;
                o = o.value;
                try {
                    if (!Tt(d(), o))
                        return !1;
                }
                catch {
                    return !1;
                }
            }
        if (a = t.child, t.subtreeFlags & 16384 && a !== null)
            a.return = t, t = a;
        else {
            if (t === e)
                break;
            for (; t.sibling === null;) {
                if (t.return === null || t.return === e)
                    return !0;
                t = t.return;
            }
            t.sibling.return = t.return, t = t.sibling;
        }
    } return !0; }
    function ta(e, t, a, n) { t &= ~Ro, t &= ~Oa, e.suspendedLanes |= t, e.pingedLanes &= ~t, n && (e.warmLanes |= t), n = e.expirationTimes; for (var o = t; 0 < o;) {
        var d = 31 - At(o), f = 1 << d;
        n[d] = -1, o &= ~f;
    } a !== 0 && Cu(e, a, t); }
    function qi() { return (Ne & 6) === 0 ? (pn(0), !1) : !0; }
    function Ho() { if (fe !== null) {
        if (ke === 0)
            var e = fe.return;
        else
            e = fe, ys = wa = null, to(e), nl = null, Pl = 0, e = fe;
        for (; e !== null;)
            Jf(e.alternate, e), e = e.return;
        fe = null;
    } }
    function xl(e, t) { var a = e.timeoutHandle; a !== -1 && (e.timeoutHandle = -1, Rb(a)), a = e.cancelPendingCommit, a !== null && (e.cancelPendingCommit = null, a()), Ms = 0, Ho(), Me = e, fe = a = gs(e.current, null), pe = t, ke = 0, Ot = null, Ps = !1, ml = zl(e, t), zo = !1, fl = Dt = Ro = Oa = Is = Be = 0, vt = hn = null, qo = !1, (t & 8) !== 0 && (t |= t & 32); var n = e.entangledLanes; if (n !== 0)
        for (e = e.entanglements, n &= t; 0 < n;) {
            var o = 31 - At(n), d = 1 << o;
            t |= e[o], n &= ~d;
        } return Es = t, ai(), a; }
    function bh(e, t) { ie = null, E.H = nn, t === ll || t === ui ? (t = Dm(), ke = 3) : t === Qc ? (t = Dm(), ke = 4) : ke = t === bo ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Ot = t, fe === null && (Be = 1, ki(e, Ht(t, e.current))); }
    function yh() { var e = Mt.current; return e === null ? !0 : (pe & 4194048) === pe ? Kt === null : (pe & 62914560) === pe || (pe & 536870912) !== 0 ? e === Kt : !1; }
    function vh() { var e = E.H; return E.H = nn, e === null ? nn : e; }
    function jh() { var e = E.A; return E.A = fb, e; }
    function Bi() { Be = 4, Ps || (pe & 4194048) !== pe && Mt.current !== null || (ml = !0), (Is & 134217727) === 0 && (Oa & 134217727) === 0 || Me === null || ta(Me, pe, Dt, !1); }
    function Vo(e, t, a) { var n = Ne; Ne |= 2; var o = vh(), d = jh(); (Me !== e || pe !== t) && (Ri = null, xl(e, t)), t = !1; var f = Be; e: do
        try {
            if (ke !== 0 && fe !== null) {
                var x = fe, N = Ot;
                switch (ke) {
                    case 8:
                        Ho(), f = 6;
                        break e;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        Mt.current === null && (t = !0);
                        var _ = ke;
                        if (ke = 0, Ot = null, pl(e, x, N, _), a && ml) {
                            f = 0;
                            break e;
                        }
                        break;
                    default: _ = ke, ke = 0, Ot = null, pl(e, x, N, _);
                }
            }
            pb(), f = Be;
            break;
        }
        catch (U) {
            bh(e, U);
        }
    while (!0); return t && e.shellSuspendCounter++, ys = wa = null, Ne = n, E.H = o, E.A = d, fe === null && (Me = null, pe = 0, ai()), f; }
    function pb() { for (; fe !== null;)
        Nh(fe); }
    function gb(e, t) { var a = Ne; Ne |= 2; var n = vh(), o = jh(); Me !== e || pe !== t ? (Ri = null, zi = kt() + 500, xl(e, t)) : ml = zl(e, t); e: do
        try {
            if (ke !== 0 && fe !== null) {
                t = fe;
                var d = Ot;
                t: switch (ke) {
                    case 1:
                        ke = 0, Ot = null, pl(e, t, d, 1);
                        break;
                    case 2:
                    case 9:
                        if (_m(d)) {
                            ke = 0, Ot = null, wh(t);
                            break;
                        }
                        t = function () { ke !== 2 && ke !== 9 || Me !== e || (ke = 7), os(e); }, d.then(t, t);
                        break e;
                    case 3:
                        ke = 7;
                        break e;
                    case 4:
                        ke = 5;
                        break e;
                    case 7:
                        _m(d) ? (ke = 0, Ot = null, wh(t)) : (ke = 0, Ot = null, pl(e, t, d, 7));
                        break;
                    case 5:
                        var f = null;
                        switch (fe.tag) {
                            case 26: f = fe.memoizedState;
                            case 5:
                            case 27:
                                var x = fe;
                                if (f ? cx(f) : x.stateNode.complete) {
                                    ke = 0, Ot = null;
                                    var N = x.sibling;
                                    if (N !== null)
                                        fe = N;
                                    else {
                                        var _ = x.return;
                                        _ !== null ? (fe = _, Ui(_)) : fe = null;
                                    }
                                    break t;
                                }
                        }
                        ke = 0, Ot = null, pl(e, t, d, 5);
                        break;
                    case 6:
                        ke = 0, Ot = null, pl(e, t, d, 6);
                        break;
                    case 8:
                        Ho(), Be = 6;
                        break e;
                    default: throw Error(c(462));
                }
            }
            bb();
            break;
        }
        catch (U) {
            bh(e, U);
        }
    while (!0); return ys = wa = null, E.H = n, E.A = o, Ne = a, fe !== null ? 0 : (Me = null, pe = 0, ai(), Be); }
    function bb() { for (; fe !== null && !Vg();)
        Nh(fe); }
    function Nh(e) { var t = Xf(e.alternate, e, Es); e.memoizedProps = e.pendingProps, t === null ? Ui(e) : fe = t; }
    function wh(e) { var t = e, a = t.alternate; switch (t.tag) {
        case 15:
        case 0:
            t = Hf(a, t, t.pendingProps, t.type, void 0, pe);
            break;
        case 11:
            t = Hf(a, t, t.pendingProps, t.type.render, t.ref, pe);
            break;
        case 5: to(t);
        default: Jf(a, t), t = fe = vm(t, Es), t = Xf(a, t, Es);
    } e.memoizedProps = e.pendingProps, t === null ? Ui(e) : fe = t; }
    function pl(e, t, a, n) { ys = wa = null, to(t), nl = null, Pl = 0; var o = t.return; try {
        if (ib(e, o, t, a, pe)) {
            Be = 1, ki(e, Ht(a, e.current)), fe = null;
            return;
        }
    }
    catch (d) {
        if (o !== null)
            throw fe = o, d;
        Be = 1, ki(e, Ht(a, e.current)), fe = null;
        return;
    } t.flags & 32768 ? (be || n === 1 ? e = !0 : ml || (pe & 536870912) !== 0 ? e = !1 : (Ps = e = !0, (n === 2 || n === 9 || n === 3 || n === 6) && (n = Mt.current, n !== null && n.tag === 13 && (n.flags |= 16384))), Sh(t, e)) : Ui(t); }
    function Ui(e) { var t = e; do {
        if ((t.flags & 32768) !== 0) {
            Sh(t, Ps);
            return;
        }
        e = t.return;
        var a = ob(t.alternate, t, Es);
        if (a !== null) {
            fe = a;
            return;
        }
        if (t = t.sibling, t !== null) {
            fe = t;
            return;
        }
        fe = t = e;
    } while (t !== null); Be === 0 && (Be = 5); }
    function Sh(e, t) { do {
        var a = db(e.alternate, e);
        if (a !== null) {
            a.flags &= 32767, fe = a;
            return;
        }
        if (a = e.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !t && (e = e.sibling, e !== null)) {
            fe = e;
            return;
        }
        fe = e = a;
    } while (e !== null); Be = 6, fe = null; }
    function kh(e, t, a, n, o, d, f, x, N) { e.cancelPendingCommit = null; do
        Li();
    while (Fe !== 0); if ((Ne & 6) !== 0)
        throw Error(c(327)); if (t !== null) {
        if (t === e.current)
            throw Error(c(177));
        if (d = t.lanes | t.childLanes, d |= Tc, Pg(e, a, d, f, x, N), e === Me && (fe = Me = null, pe = 0), hl = t, ea = e, Ms = a, Bo = d, Uo = o, hh = n, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Nb(Vn, function () { return Mh(), null; })) : (e.callbackNode = null, e.callbackPriority = 0), n = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || n) {
            n = E.T, E.T = null, o = J.p, J.p = 2, f = Ne, Ne |= 4;
            try {
                ub(e, t, a);
            }
            finally {
                Ne = f, J.p = o, E.T = n;
            }
        }
        Fe = 1, Ch(), Ah(), Th();
    } }
    function Ch() { if (Fe === 1) {
        Fe = 0;
        var e = ea, t = hl, a = (t.flags & 13878) !== 0;
        if ((t.subtreeFlags & 13878) !== 0 || a) {
            a = E.T, E.T = null;
            var n = J.p;
            J.p = 2;
            var o = Ne;
            Ne |= 4;
            try {
                ih(t, e);
                var d = Wo, f = um(e.containerInfo), x = d.focusedElem, N = d.selectionRange;
                if (f !== x && x && x.ownerDocument && dm(x.ownerDocument.documentElement, x)) {
                    if (N !== null && wc(x)) {
                        var _ = N.start, U = N.end;
                        if (U === void 0 && (U = _), "selectionStart" in x)
                            x.selectionStart = _, x.selectionEnd = Math.min(U, x.value.length);
                        else {
                            var H = x.ownerDocument || document, O = H && H.defaultView || window;
                            if (O.getSelection) {
                                var R = O.getSelection(), P = x.textContent.length, ae = Math.min(N.start, P), Ee = N.end === void 0 ? ae : Math.min(N.end, P);
                                !R.extend && ae > Ee && (f = Ee, Ee = ae, ae = f);
                                var A = om(x, ae), S = om(x, Ee);
                                if (A && S && (R.rangeCount !== 1 || R.anchorNode !== A.node || R.anchorOffset !== A.offset || R.focusNode !== S.node || R.focusOffset !== S.offset)) {
                                    var M = H.createRange();
                                    M.setStart(A.node, A.offset), R.removeAllRanges(), ae > Ee ? (R.addRange(M), R.extend(S.node, S.offset)) : (M.setEnd(S.node, S.offset), R.addRange(M));
                                }
                            }
                        }
                    }
                    for (H = [], R = x; R = R.parentNode;)
                        R.nodeType === 1 && H.push({ element: R, left: R.scrollLeft, top: R.scrollTop });
                    for (typeof x.focus == "function" && x.focus(), x = 0; x < H.length; x++) {
                        var L = H[x];
                        L.element.scrollLeft = L.left, L.element.scrollTop = L.top;
                    }
                }
                Pi = !!Io, Wo = Io = null;
            }
            finally {
                Ne = o, J.p = n, E.T = a;
            }
        }
        e.current = t, Fe = 2;
    } }
    function Ah() { if (Fe === 2) {
        Fe = 0;
        var e = ea, t = hl, a = (t.flags & 8772) !== 0;
        if ((t.subtreeFlags & 8772) !== 0 || a) {
            a = E.T, E.T = null;
            var n = J.p;
            J.p = 2;
            var o = Ne;
            Ne |= 4;
            try {
                th(e, t.alternate, t);
            }
            finally {
                Ne = o, J.p = n, E.T = a;
            }
        }
        Fe = 3;
    } }
    function Th() { if (Fe === 4 || Fe === 3) {
        Fe = 0, Gg();
        var e = ea, t = hl, a = Ms, n = hh;
        (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Fe = 5 : (Fe = 0, hl = ea = null, Eh(e, e.pendingLanes));
        var o = e.pendingLanes;
        if (o === 0 && (Ws = null), lc(a), t = t.stateNode, Ct && typeof Ct.onCommitFiberRoot == "function")
            try {
                Ct.onCommitFiberRoot(Dl, t, void 0, (t.current.flags & 128) === 128);
            }
            catch { }
        if (n !== null) {
            t = E.T, o = J.p, J.p = 2, E.T = null;
            try {
                for (var d = e.onRecoverableError, f = 0; f < n.length; f++) {
                    var x = n[f];
                    d(x.value, { componentStack: x.stack });
                }
            }
            finally {
                E.T = t, J.p = o;
            }
        }
        (Ms & 3) !== 0 && Li(), os(e), o = e.pendingLanes, (a & 261930) !== 0 && (o & 42) !== 0 ? e === Lo ? xn++ : (xn = 0, Lo = e) : xn = 0, pn(0);
    } }
    function Eh(e, t) { (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Fl(t))); }
    function Li() { return Ch(), Ah(), Th(), Mh(); }
    function Mh() { if (Fe !== 5)
        return !1; var e = ea, t = Bo; Bo = 0; var a = lc(Ms), n = E.T, o = J.p; try {
        J.p = 32 > a ? 32 : a, E.T = null, a = Uo, Uo = null;
        var d = ea, f = Ms;
        if (Fe = 0, hl = ea = null, Ms = 0, (Ne & 6) !== 0)
            throw Error(c(331));
        var x = Ne;
        if (Ne |= 4, uh(d.current), ch(d, d.current, f, a), Ne = x, pn(0, !1), Ct && typeof Ct.onPostCommitFiberRoot == "function")
            try {
                Ct.onPostCommitFiberRoot(Dl, d);
            }
            catch { }
        return !0;
    }
    finally {
        J.p = o, E.T = n, Eh(e, t);
    } }
    function _h(e, t, a) { t = Ht(a, t), t = go(e.stateNode, t, 2), e = Zs(e, t, 2), e !== null && (Rl(e, 2), os(e)); }
    function Ce(e, t, a) { if (e.tag === 3)
        _h(e, e, a);
    else
        for (; t !== null;) {
            if (t.tag === 3) {
                _h(t, e, a);
                break;
            }
            else if (t.tag === 1) {
                var n = t.stateNode;
                if (typeof t.type.getDerivedStateFromError == "function" || typeof n.componentDidCatch == "function" && (Ws === null || !Ws.has(n))) {
                    e = Ht(a, e), a = Of(2), n = Zs(t, a, 2), n !== null && (Df(a, n, t, e), Rl(n, 2), os(n));
                    break;
                }
            }
            t = t.return;
        } }
    function Go(e, t, a) { var n = e.pingCache; if (n === null) {
        n = e.pingCache = new hb;
        var o = new Set;
        n.set(t, o);
    }
    else
        o = n.get(t), o === void 0 && (o = new Set, n.set(t, o)); o.has(a) || (zo = !0, o.add(a), e = yb.bind(null, e, t, a), t.then(e, e)); }
    function yb(e, t, a) { var n = e.pingCache; n !== null && n.delete(t), e.pingedLanes |= e.suspendedLanes & a, e.warmLanes &= ~a, Me === e && (pe & a) === a && (Be === 4 || Be === 3 && (pe & 62914560) === pe && 300 > kt() - Di ? (Ne & 2) === 0 && xl(e, 0) : Ro |= a, fl === pe && (fl = 0)), os(e); }
    function Oh(e, t) { t === 0 && (t = ku()), e = va(e, t), e !== null && (Rl(e, t), os(e)); }
    function vb(e) { var t = e.memoizedState, a = 0; t !== null && (a = t.retryLane), Oh(e, a); }
    function jb(e, t) { var a = 0; switch (e.tag) {
        case 31:
        case 13:
            var n = e.stateNode, o = e.memoizedState;
            o !== null && (a = o.retryLane);
            break;
        case 19:
            n = e.stateNode;
            break;
        case 22:
            n = e.stateNode._retryCache;
            break;
        default: throw Error(c(314));
    } n !== null && n.delete(t), Oh(e, a); }
    function Nb(e, t) { return ec(e, t); }
    var Hi = null, gl = null, Qo = !1, Vi = !1, Ko = !1, sa = 0;
    function os(e) { e !== gl && e.next === null && (gl === null ? Hi = gl = e : gl = gl.next = e), Vi = !0, Qo || (Qo = !0, Sb()); }
    function pn(e, t) { if (!Ko && Vi) {
        Ko = !0;
        do
            for (var a = !1, n = Hi; n !== null;) {
                if (e !== 0) {
                    var o = n.pendingLanes;
                    if (o === 0)
                        var d = 0;
                    else {
                        var f = n.suspendedLanes, x = n.pingedLanes;
                        d = (1 << 31 - At(42 | e) + 1) - 1, d &= o & ~(f & ~x), d = d & 201326741 ? d & 201326741 | 1 : d ? d | 2 : 0;
                    }
                    d !== 0 && (a = !0, qh(n, d));
                }
                else
                    d = pe, d = Yn(n, n === Me ? d : 0, n.cancelPendingCommit !== null || n.timeoutHandle !== -1), (d & 3) === 0 || zl(n, d) || (a = !0, qh(n, d));
                n = n.next;
            }
        while (a);
        Ko = !1;
    } }
    function wb() { Dh(); }
    function Dh() { Vi = Qo = !1; var e = 0; sa !== 0 && zb() && (e = sa); for (var t = kt(), a = null, n = Hi; n !== null;) {
        var o = n.next, d = zh(n, t);
        d === 0 ? (n.next = null, a === null ? Hi = o : a.next = o, o === null && (gl = a)) : (a = n, (e !== 0 || (d & 3) !== 0) && (Vi = !0)), n = o;
    } Fe !== 0 && Fe !== 5 || pn(e), sa !== 0 && (sa = 0); }
    function zh(e, t) { for (var a = e.suspendedLanes, n = e.pingedLanes, o = e.expirationTimes, d = e.pendingLanes & -62914561; 0 < d;) {
        var f = 31 - At(d), x = 1 << f, N = o[f];
        N === -1 ? ((x & a) === 0 || (x & n) !== 0) && (o[f] = $g(x, t)) : N <= t && (e.expiredLanes |= x), d &= ~x;
    } if (t = Me, a = pe, a = Yn(e, e === t ? a : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), n = e.callbackNode, a === 0 || e === t && (ke === 2 || ke === 9) || e.cancelPendingCommit !== null)
        return n !== null && n !== null && tc(n), e.callbackNode = null, e.callbackPriority = 0; if ((a & 3) === 0 || zl(e, a)) {
        if (t = a & -a, t === e.callbackPriority)
            return t;
        switch (n !== null && tc(n), lc(a)) {
            case 2:
            case 8:
                a = wu;
                break;
            case 32:
                a = Vn;
                break;
            case 268435456:
                a = Su;
                break;
            default: a = Vn;
        }
        return n = Rh.bind(null, e), a = ec(a, n), e.callbackPriority = t, e.callbackNode = a, t;
    } return n !== null && n !== null && tc(n), e.callbackPriority = 2, e.callbackNode = null, 2; }
    function Rh(e, t) { if (Fe !== 0 && Fe !== 5)
        return e.callbackNode = null, e.callbackPriority = 0, null; var a = e.callbackNode; if (Li() && e.callbackNode !== a)
        return null; var n = pe; return n = Yn(e, e === Me ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), n === 0 ? null : (ph(e, n, t), zh(e, kt()), e.callbackNode != null && e.callbackNode === a ? Rh.bind(null, e) : null); }
    function qh(e, t) { if (Li())
        return null; ph(e, t, !0); }
    function Sb() { qb(function () { (Ne & 6) !== 0 ? ec(Nu, wb) : Dh(); }); }
    function Yo() { if (sa === 0) {
        var e = sl;
        e === 0 && (e = Gn, Gn <<= 1, (Gn & 261888) === 0 && (Gn = 256)), sa = e;
    } return sa; }
    function Bh(e) { return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Fn("" + e); }
    function Uh(e, t) { var a = t.ownerDocument.createElement("input"); return a.name = t.name, a.value = t.value, e.id && a.setAttribute("form", e.id), t.parentNode.insertBefore(a, t), e = new FormData(e), a.parentNode.removeChild(a), e; }
    function kb(e, t, a, n, o) { if (t === "submit" && a && a.stateNode === o) {
        var d = Bh((o[xt] || null).action), f = n.submitter;
        f && (t = (t = f[xt] || null) ? Bh(t.formAction) : f.getAttribute("formAction"), t !== null && (d = t, f = null));
        var x = new Wn("action", "action", null, n, o);
        e.push({ event: x, listeners: [{ instance: null, listener: function () { if (n.defaultPrevented) {
                        if (sa !== 0) {
                            var N = f ? Uh(o, f) : new FormData(o);
                            uo(a, { pending: !0, data: N, method: o.method, action: d }, null, N);
                        }
                    }
                    else
                        typeof d == "function" && (x.preventDefault(), N = f ? Uh(o, f) : new FormData(o), uo(a, { pending: !0, data: N, method: o.method, action: d }, d, N)); }, currentTarget: o }] });
    } }
    for (var Xo = 0; Xo < Ac.length; Xo++) {
        var Zo = Ac[Xo], Cb = Zo.toLowerCase(), Ab = Zo[0].toUpperCase() + Zo.slice(1);
        Wt(Cb, "on" + Ab);
    }
    Wt(hm, "onAnimationEnd"), Wt(xm, "onAnimationIteration"), Wt(pm, "onAnimationStart"), Wt("dblclick", "onDoubleClick"), Wt("focusin", "onFocus"), Wt("focusout", "onBlur"), Wt(Q0, "onTransitionRun"), Wt(K0, "onTransitionStart"), Wt(Y0, "onTransitionCancel"), Wt(gm, "onTransitionEnd"), Ga("onMouseEnter", ["mouseout", "mouseover"]), Ga("onMouseLeave", ["mouseout", "mouseover"]), Ga("onPointerEnter", ["pointerout", "pointerover"]), Ga("onPointerLeave", ["pointerout", "pointerover"]), pa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), pa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), pa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), pa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), pa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), pa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var gn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Tb = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(gn));
    function Lh(e, t) { t = (t & 4) !== 0; for (var a = 0; a < e.length; a++) {
        var n = e[a], o = n.event;
        n = n.listeners;
        e: {
            var d = void 0;
            if (t)
                for (var f = n.length - 1; 0 <= f; f--) {
                    var x = n[f], N = x.instance, _ = x.currentTarget;
                    if (x = x.listener, N !== d && o.isPropagationStopped())
                        break e;
                    d = x, o.currentTarget = _;
                    try {
                        d(o);
                    }
                    catch (U) {
                        si(U);
                    }
                    o.currentTarget = null, d = N;
                }
            else
                for (f = 0; f < n.length; f++) {
                    if (x = n[f], N = x.instance, _ = x.currentTarget, x = x.listener, N !== d && o.isPropagationStopped())
                        break e;
                    d = x, o.currentTarget = _;
                    try {
                        d(o);
                    }
                    catch (U) {
                        si(U);
                    }
                    o.currentTarget = null, d = N;
                }
        }
    } }
    function he(e, t) { var a = t[nc]; a === void 0 && (a = t[nc] = new Set); var n = e + "__bubble"; a.has(n) || (Hh(t, e, 2, !1), a.add(n)); }
    function Jo(e, t, a) { var n = 0; t && (n |= 4), Hh(a, e, n, t); }
    var Gi = "_reactListening" + Math.random().toString(36).slice(2);
    function Fo(e) { if (!e[Gi]) {
        e[Gi] = !0, Ou.forEach(function (a) { a !== "selectionchange" && (Tb.has(a) || Jo(a, !1, e), Jo(a, !0, e)); });
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[Gi] || (t[Gi] = !0, Jo("selectionchange", !1, t));
    } }
    function Hh(e, t, a, n) { switch (xx(t)) {
        case 2:
            var o = sy;
            break;
        case 8:
            o = ay;
            break;
        default: o = dd;
    } a = o.bind(null, t, a, e), o = void 0, !hc || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), n ? o !== void 0 ? e.addEventListener(t, a, { capture: !0, passive: o }) : e.addEventListener(t, a, !0) : o !== void 0 ? e.addEventListener(t, a, { passive: o }) : e.addEventListener(t, a, !1); }
    function $o(e, t, a, n, o) { var d = n; if ((t & 1) === 0 && (t & 2) === 0 && n !== null)
        e: for (;;) {
            if (n === null)
                return;
            var f = n.tag;
            if (f === 3 || f === 4) {
                var x = n.stateNode.containerInfo;
                if (x === o)
                    break;
                if (f === 4)
                    for (f = n.return; f !== null;) {
                        var N = f.tag;
                        if ((N === 3 || N === 4) && f.stateNode.containerInfo === o)
                            return;
                        f = f.return;
                    }
                for (; x !== null;) {
                    if (f = La(x), f === null)
                        return;
                    if (N = f.tag, N === 5 || N === 6 || N === 26 || N === 27) {
                        n = d = f;
                        continue e;
                    }
                    x = x.parentNode;
                }
            }
            n = n.return;
        } Ku(function () { var _ = d, U = mc(a), H = []; e: {
        var O = bm.get(e);
        if (O !== void 0) {
            var R = Wn, P = e;
            switch (e) {
                case "keypress": if (Pn(a) === 0)
                    break e;
                case "keydown":
                case "keyup":
                    R = j0;
                    break;
                case "focusin":
                    P = "focus", R = bc;
                    break;
                case "focusout":
                    P = "blur", R = bc;
                    break;
                case "beforeblur":
                case "afterblur":
                    R = bc;
                    break;
                case "click": if (a.button === 2)
                    break e;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                    R = Zu;
                    break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                    R = o0;
                    break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                    R = S0;
                    break;
                case hm:
                case xm:
                case pm:
                    R = m0;
                    break;
                case gm:
                    R = C0;
                    break;
                case "scroll":
                case "scrollend":
                    R = r0;
                    break;
                case "wheel":
                    R = T0;
                    break;
                case "copy":
                case "cut":
                case "paste":
                    R = h0;
                    break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                    R = Fu;
                    break;
                case "toggle":
                case "beforetoggle": R = M0;
            }
            var ae = (t & 4) !== 0, Ee = !ae && (e === "scroll" || e === "scrollend"), A = ae ? O !== null ? O + "Capture" : null : O;
            ae = [];
            for (var S = _, M; S !== null;) {
                var L = S;
                if (M = L.stateNode, L = L.tag, L !== 5 && L !== 26 && L !== 27 || M === null || A === null || (L = Ul(S, A), L != null && ae.push(bn(S, L, M))), Ee)
                    break;
                S = S.return;
            }
            0 < ae.length && (O = new R(O, P, null, a, U), H.push({ event: O, listeners: ae }));
        }
    } if ((t & 7) === 0) {
        e: {
            if (O = e === "mouseover" || e === "pointerover", R = e === "mouseout" || e === "pointerout", O && a !== uc && (P = a.relatedTarget || a.fromElement) && (La(P) || P[Ua]))
                break e;
            if ((R || O) && (O = U.window === U ? U : (O = U.ownerDocument) ? O.defaultView || O.parentWindow : window, R ? (P = a.relatedTarget || a.toElement, R = _, P = P ? La(P) : null, P !== null && (Ee = m(P), ae = P.tag, P !== Ee || ae !== 5 && ae !== 27 && ae !== 6) && (P = null)) : (R = null, P = _), R !== P)) {
                if (ae = Zu, L = "onMouseLeave", A = "onMouseEnter", S = "mouse", (e === "pointerout" || e === "pointerover") && (ae = Fu, L = "onPointerLeave", A = "onPointerEnter", S = "pointer"), Ee = R == null ? O : Bl(R), M = P == null ? O : Bl(P), O = new ae(L, S + "leave", R, a, U), O.target = Ee, O.relatedTarget = M, L = null, La(U) === _ && (ae = new ae(A, S + "enter", P, a, U), ae.target = M, ae.relatedTarget = Ee, L = ae), Ee = L, R && P)
                    t: {
                        for (ae = Eb, A = R, S = P, M = 0, L = A; L; L = ae(L))
                            M++;
                        L = 0;
                        for (var te = S; te; te = ae(te))
                            L++;
                        for (; 0 < M - L;)
                            A = ae(A), M--;
                        for (; 0 < L - M;)
                            S = ae(S), L--;
                        for (; M--;) {
                            if (A === S || S !== null && A === S.alternate) {
                                ae = A;
                                break t;
                            }
                            A = ae(A), S = ae(S);
                        }
                        ae = null;
                    }
                else
                    ae = null;
                R !== null && Vh(H, O, R, ae, !1), P !== null && Ee !== null && Vh(H, Ee, P, ae, !0);
            }
        }
        e: {
            if (O = _ ? Bl(_) : window, R = O.nodeName && O.nodeName.toLowerCase(), R === "select" || R === "input" && O.type === "file")
                var ve = am;
            else if (tm(O))
                if (lm)
                    ve = H0;
                else {
                    ve = U0;
                    var ee = B0;
                }
            else
                R = O.nodeName, !R || R.toLowerCase() !== "input" || O.type !== "checkbox" && O.type !== "radio" ? _ && dc(_.elementType) && (ve = am) : ve = L0;
            if (ve && (ve = ve(e, _))) {
                sm(H, ve, a, U);
                break e;
            }
            ee && ee(e, O, _), e === "focusout" && _ && O.type === "number" && _.memoizedProps.value != null && oc(O, "number", O.value);
        }
        switch (ee = _ ? Bl(_) : window, e) {
            case "focusin":
                (tm(ee) || ee.contentEditable === "true") && (Ja = ee, Sc = _, Xl = null);
                break;
            case "focusout":
                Xl = Sc = Ja = null;
                break;
            case "mousedown":
                kc = !0;
                break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
                kc = !1, mm(H, a, U);
                break;
            case "selectionchange": if (G0)
                break;
            case "keydown":
            case "keyup": mm(H, a, U);
        }
        var ce;
        if (vc)
            e: {
                switch (e) {
                    case "compositionstart":
                        var ge = "onCompositionStart";
                        break e;
                    case "compositionend":
                        ge = "onCompositionEnd";
                        break e;
                    case "compositionupdate":
                        ge = "onCompositionUpdate";
                        break e;
                }
                ge = void 0;
            }
        else
            Za ? Wu(e, a) && (ge = "onCompositionEnd") : e === "keydown" && a.keyCode === 229 && (ge = "onCompositionStart");
        ge && ($u && a.locale !== "ko" && (Za || ge !== "onCompositionStart" ? ge === "onCompositionEnd" && Za && (ce = Yu()) : (Hs = U, xc = "value" in Hs ? Hs.value : Hs.textContent, Za = !0)), ee = Qi(_, ge), 0 < ee.length && (ge = new Ju(ge, e, null, a, U), H.push({ event: ge, listeners: ee }), ce ? ge.data = ce : (ce = em(a), ce !== null && (ge.data = ce)))), (ce = O0 ? D0(e, a) : z0(e, a)) && (ge = Qi(_, "onBeforeInput"), 0 < ge.length && (ee = new Ju("onBeforeInput", "beforeinput", null, a, U), H.push({ event: ee, listeners: ge }), ee.data = ce)), kb(H, e, _, a, U);
    } Lh(H, t); }); }
    function bn(e, t, a) { return { instance: e, listener: t, currentTarget: a }; }
    function Qi(e, t) { for (var a = t + "Capture", n = []; e !== null;) {
        var o = e, d = o.stateNode;
        if (o = o.tag, o !== 5 && o !== 26 && o !== 27 || d === null || (o = Ul(e, a), o != null && n.unshift(bn(e, o, d)), o = Ul(e, t), o != null && n.push(bn(e, o, d))), e.tag === 3)
            return n;
        e = e.return;
    } return []; }
    function Eb(e) { if (e === null)
        return null; do
        e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27); return e || null; }
    function Vh(e, t, a, n, o) { for (var d = t._reactName, f = []; a !== null && a !== n;) {
        var x = a, N = x.alternate, _ = x.stateNode;
        if (x = x.tag, N !== null && N === n)
            break;
        x !== 5 && x !== 26 && x !== 27 || _ === null || (N = _, o ? (_ = Ul(a, d), _ != null && f.unshift(bn(a, _, N))) : o || (_ = Ul(a, d), _ != null && f.push(bn(a, _, N)))), a = a.return;
    } f.length !== 0 && e.push({ event: t, listeners: f }); }
    var Mb = /\r\n?/g, _b = /\u0000|\uFFFD/g;
    function Gh(e) {
        return (typeof e == "string" ? e : "" + e).replace(Mb, `
`).replace(_b, "");
    }
    function Qh(e, t) { return t = Gh(t), Gh(e) === t; }
    function Te(e, t, a, n, o, d) { switch (a) {
        case "children":
            typeof n == "string" ? t === "body" || t === "textarea" && n === "" || Ka(e, n) : (typeof n == "number" || typeof n == "bigint") && t !== "body" && Ka(e, "" + n);
            break;
        case "className":
            Zn(e, "class", n);
            break;
        case "tabIndex":
            Zn(e, "tabindex", n);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            Zn(e, a, n);
            break;
        case "style":
            Gu(e, n, d);
            break;
        case "data": if (t !== "object") {
            Zn(e, "data", n);
            break;
        }
        case "src":
        case "href":
            if (n === "" && (t !== "a" || a !== "href")) {
                e.removeAttribute(a);
                break;
            }
            if (n == null || typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") {
                e.removeAttribute(a);
                break;
            }
            n = Fn("" + n), e.setAttribute(a, n);
            break;
        case "action":
        case "formAction":
            if (typeof n == "function") {
                e.setAttribute(a, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                break;
            }
            else
                typeof d == "function" && (a === "formAction" ? (t !== "input" && Te(e, t, "name", o.name, o, null), Te(e, t, "formEncType", o.formEncType, o, null), Te(e, t, "formMethod", o.formMethod, o, null), Te(e, t, "formTarget", o.formTarget, o, null)) : (Te(e, t, "encType", o.encType, o, null), Te(e, t, "method", o.method, o, null), Te(e, t, "target", o.target, o, null)));
            if (n == null || typeof n == "symbol" || typeof n == "boolean") {
                e.removeAttribute(a);
                break;
            }
            n = Fn("" + n), e.setAttribute(a, n);
            break;
        case "onClick":
            n != null && (e.onclick = xs);
            break;
        case "onScroll":
            n != null && he("scroll", e);
            break;
        case "onScrollEnd":
            n != null && he("scrollend", e);
            break;
        case "dangerouslySetInnerHTML":
            if (n != null) {
                if (typeof n != "object" || !("__html" in n))
                    throw Error(c(61));
                if (a = n.__html, a != null) {
                    if (o.children != null)
                        throw Error(c(60));
                    e.innerHTML = a;
                }
            }
            break;
        case "multiple":
            e.multiple = n && typeof n != "function" && typeof n != "symbol";
            break;
        case "muted":
            e.muted = n && typeof n != "function" && typeof n != "symbol";
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref": break;
        case "autoFocus": break;
        case "xlinkHref":
            if (n == null || typeof n == "function" || typeof n == "boolean" || typeof n == "symbol") {
                e.removeAttribute("xlink:href");
                break;
            }
            a = Fn("" + n), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a);
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            n != null && typeof n != "function" && typeof n != "symbol" ? e.setAttribute(a, "" + n) : e.removeAttribute(a);
            break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
            n && typeof n != "function" && typeof n != "symbol" ? e.setAttribute(a, "") : e.removeAttribute(a);
            break;
        case "capture":
        case "download":
            n === !0 ? e.setAttribute(a, "") : n !== !1 && n != null && typeof n != "function" && typeof n != "symbol" ? e.setAttribute(a, n) : e.removeAttribute(a);
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            n != null && typeof n != "function" && typeof n != "symbol" && !isNaN(n) && 1 <= n ? e.setAttribute(a, n) : e.removeAttribute(a);
            break;
        case "rowSpan":
        case "start":
            n == null || typeof n == "function" || typeof n == "symbol" || isNaN(n) ? e.removeAttribute(a) : e.setAttribute(a, n);
            break;
        case "popover":
            he("beforetoggle", e), he("toggle", e), Xn(e, "popover", n);
            break;
        case "xlinkActuate":
            hs(e, "http://www.w3.org/1999/xlink", "xlink:actuate", n);
            break;
        case "xlinkArcrole":
            hs(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", n);
            break;
        case "xlinkRole":
            hs(e, "http://www.w3.org/1999/xlink", "xlink:role", n);
            break;
        case "xlinkShow":
            hs(e, "http://www.w3.org/1999/xlink", "xlink:show", n);
            break;
        case "xlinkTitle":
            hs(e, "http://www.w3.org/1999/xlink", "xlink:title", n);
            break;
        case "xlinkType":
            hs(e, "http://www.w3.org/1999/xlink", "xlink:type", n);
            break;
        case "xmlBase":
            hs(e, "http://www.w3.org/XML/1998/namespace", "xml:base", n);
            break;
        case "xmlLang":
            hs(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", n);
            break;
        case "xmlSpace":
            hs(e, "http://www.w3.org/XML/1998/namespace", "xml:space", n);
            break;
        case "is":
            Xn(e, "is", n);
            break;
        case "innerText":
        case "textContent": break;
        default: (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (a = n0.get(a) || a, Xn(e, a, n));
    } }
    function Po(e, t, a, n, o, d) { switch (a) {
        case "style":
            Gu(e, n, d);
            break;
        case "dangerouslySetInnerHTML":
            if (n != null) {
                if (typeof n != "object" || !("__html" in n))
                    throw Error(c(61));
                if (a = n.__html, a != null) {
                    if (o.children != null)
                        throw Error(c(60));
                    e.innerHTML = a;
                }
            }
            break;
        case "children":
            typeof n == "string" ? Ka(e, n) : (typeof n == "number" || typeof n == "bigint") && Ka(e, "" + n);
            break;
        case "onScroll":
            n != null && he("scroll", e);
            break;
        case "onScrollEnd":
            n != null && he("scrollend", e);
            break;
        case "onClick":
            n != null && (e.onclick = xs);
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref": break;
        case "innerText":
        case "textContent": break;
        default: if (!Du.hasOwnProperty(a))
            e: {
                if (a[0] === "o" && a[1] === "n" && (o = a.endsWith("Capture"), t = a.slice(2, o ? a.length - 7 : void 0), d = e[xt] || null, d = d != null ? d[a] : null, typeof d == "function" && e.removeEventListener(t, d, o), typeof n == "function")) {
                    typeof d != "function" && d !== null && (a in e ? e[a] = null : e.hasAttribute(a) && e.removeAttribute(a)), e.addEventListener(t, n, o);
                    break e;
                }
                a in e ? e[a] = n : n === !0 ? e.setAttribute(a, "") : Xn(e, a, n);
            }
    } }
    function ut(e, t, a) { switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "img":
            he("error", e), he("load", e);
            var n = !1, o = !1, d;
            for (d in a)
                if (a.hasOwnProperty(d)) {
                    var f = a[d];
                    if (f != null)
                        switch (d) {
                            case "src":
                                n = !0;
                                break;
                            case "srcSet":
                                o = !0;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML": throw Error(c(137, t));
                            default: Te(e, t, d, f, a, null);
                        }
                }
            o && Te(e, t, "srcSet", a.srcSet, a, null), n && Te(e, t, "src", a.src, a, null);
            return;
        case "input":
            he("invalid", e);
            var x = d = f = o = null, N = null, _ = null;
            for (n in a)
                if (a.hasOwnProperty(n)) {
                    var U = a[n];
                    if (U != null)
                        switch (n) {
                            case "name":
                                o = U;
                                break;
                            case "type":
                                f = U;
                                break;
                            case "checked":
                                N = U;
                                break;
                            case "defaultChecked":
                                _ = U;
                                break;
                            case "value":
                                d = U;
                                break;
                            case "defaultValue":
                                x = U;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML":
                                if (U != null)
                                    throw Error(c(137, t));
                                break;
                            default: Te(e, t, n, U, a, null);
                        }
                }
            Uu(e, d, x, N, _, f, o, !1);
            return;
        case "select":
            he("invalid", e), n = f = d = null;
            for (o in a)
                if (a.hasOwnProperty(o) && (x = a[o], x != null))
                    switch (o) {
                        case "value":
                            d = x;
                            break;
                        case "defaultValue":
                            f = x;
                            break;
                        case "multiple": n = x;
                        default: Te(e, t, o, x, a, null);
                    }
            t = d, a = f, e.multiple = !!n, t != null ? Qa(e, !!n, t, !1) : a != null && Qa(e, !!n, a, !0);
            return;
        case "textarea":
            he("invalid", e), d = o = n = null;
            for (f in a)
                if (a.hasOwnProperty(f) && (x = a[f], x != null))
                    switch (f) {
                        case "value":
                            n = x;
                            break;
                        case "defaultValue":
                            o = x;
                            break;
                        case "children":
                            d = x;
                            break;
                        case "dangerouslySetInnerHTML":
                            if (x != null)
                                throw Error(c(91));
                            break;
                        default: Te(e, t, f, x, a, null);
                    }
            Hu(e, n, o, d);
            return;
        case "option":
            for (N in a)
                if (a.hasOwnProperty(N) && (n = a[N], n != null))
                    switch (N) {
                        case "selected":
                            e.selected = n && typeof n != "function" && typeof n != "symbol";
                            break;
                        default: Te(e, t, N, n, a, null);
                    }
            return;
        case "dialog":
            he("beforetoggle", e), he("toggle", e), he("cancel", e), he("close", e);
            break;
        case "iframe":
        case "object":
            he("load", e);
            break;
        case "video":
        case "audio":
            for (n = 0; n < gn.length; n++)
                he(gn[n], e);
            break;
        case "image":
            he("error", e), he("load", e);
            break;
        case "details":
            he("toggle", e);
            break;
        case "embed":
        case "source":
        case "link": he("error", e), he("load", e);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
            for (_ in a)
                if (a.hasOwnProperty(_) && (n = a[_], n != null))
                    switch (_) {
                        case "children":
                        case "dangerouslySetInnerHTML": throw Error(c(137, t));
                        default: Te(e, t, _, n, a, null);
                    }
            return;
        default: if (dc(t)) {
            for (U in a)
                a.hasOwnProperty(U) && (n = a[U], n !== void 0 && Po(e, t, U, n, a, void 0));
            return;
        }
    } for (x in a)
        a.hasOwnProperty(x) && (n = a[x], n != null && Te(e, t, x, n, a, null)); }
    function Ob(e, t, a, n) { switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "input":
            var o = null, d = null, f = null, x = null, N = null, _ = null, U = null;
            for (R in a) {
                var H = a[R];
                if (a.hasOwnProperty(R) && H != null)
                    switch (R) {
                        case "checked": break;
                        case "value": break;
                        case "defaultValue": N = H;
                        default: n.hasOwnProperty(R) || Te(e, t, R, null, n, H);
                    }
            }
            for (var O in n) {
                var R = n[O];
                if (H = a[O], n.hasOwnProperty(O) && (R != null || H != null))
                    switch (O) {
                        case "type":
                            d = R;
                            break;
                        case "name":
                            o = R;
                            break;
                        case "checked":
                            _ = R;
                            break;
                        case "defaultChecked":
                            U = R;
                            break;
                        case "value":
                            f = R;
                            break;
                        case "defaultValue":
                            x = R;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (R != null)
                                throw Error(c(137, t));
                            break;
                        default: R !== H && Te(e, t, O, R, n, H);
                    }
            }
            cc(e, f, x, N, _, U, d, o);
            return;
        case "select":
            R = f = x = O = null;
            for (d in a)
                if (N = a[d], a.hasOwnProperty(d) && N != null)
                    switch (d) {
                        case "value": break;
                        case "multiple": R = N;
                        default: n.hasOwnProperty(d) || Te(e, t, d, null, n, N);
                    }
            for (o in n)
                if (d = n[o], N = a[o], n.hasOwnProperty(o) && (d != null || N != null))
                    switch (o) {
                        case "value":
                            O = d;
                            break;
                        case "defaultValue":
                            x = d;
                            break;
                        case "multiple": f = d;
                        default: d !== N && Te(e, t, o, d, n, N);
                    }
            t = x, a = f, n = R, O != null ? Qa(e, !!a, O, !1) : !!n != !!a && (t != null ? Qa(e, !!a, t, !0) : Qa(e, !!a, a ? [] : "", !1));
            return;
        case "textarea":
            R = O = null;
            for (x in a)
                if (o = a[x], a.hasOwnProperty(x) && o != null && !n.hasOwnProperty(x))
                    switch (x) {
                        case "value": break;
                        case "children": break;
                        default: Te(e, t, x, null, n, o);
                    }
            for (f in n)
                if (o = n[f], d = a[f], n.hasOwnProperty(f) && (o != null || d != null))
                    switch (f) {
                        case "value":
                            O = o;
                            break;
                        case "defaultValue":
                            R = o;
                            break;
                        case "children": break;
                        case "dangerouslySetInnerHTML":
                            if (o != null)
                                throw Error(c(91));
                            break;
                        default: o !== d && Te(e, t, f, o, n, d);
                    }
            Lu(e, O, R);
            return;
        case "option":
            for (var P in a)
                if (O = a[P], a.hasOwnProperty(P) && O != null && !n.hasOwnProperty(P))
                    switch (P) {
                        case "selected":
                            e.selected = !1;
                            break;
                        default: Te(e, t, P, null, n, O);
                    }
            for (N in n)
                if (O = n[N], R = a[N], n.hasOwnProperty(N) && O !== R && (O != null || R != null))
                    switch (N) {
                        case "selected":
                            e.selected = O && typeof O != "function" && typeof O != "symbol";
                            break;
                        default: Te(e, t, N, O, n, R);
                    }
            return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
            for (var ae in a)
                O = a[ae], a.hasOwnProperty(ae) && O != null && !n.hasOwnProperty(ae) && Te(e, t, ae, null, n, O);
            for (_ in n)
                if (O = n[_], R = a[_], n.hasOwnProperty(_) && O !== R && (O != null || R != null))
                    switch (_) {
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (O != null)
                                throw Error(c(137, t));
                            break;
                        default: Te(e, t, _, O, n, R);
                    }
            return;
        default: if (dc(t)) {
            for (var Ee in a)
                O = a[Ee], a.hasOwnProperty(Ee) && O !== void 0 && !n.hasOwnProperty(Ee) && Po(e, t, Ee, void 0, n, O);
            for (U in n)
                O = n[U], R = a[U], !n.hasOwnProperty(U) || O === R || O === void 0 && R === void 0 || Po(e, t, U, O, n, R);
            return;
        }
    } for (var A in a)
        O = a[A], a.hasOwnProperty(A) && O != null && !n.hasOwnProperty(A) && Te(e, t, A, null, n, O); for (H in n)
        O = n[H], R = a[H], !n.hasOwnProperty(H) || O === R || O == null && R == null || Te(e, t, H, O, n, R); }
    function Kh(e) { switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link": return !0;
        default: return !1;
    } }
    function Db() { if (typeof performance.getEntriesByType == "function") {
        for (var e = 0, t = 0, a = performance.getEntriesByType("resource"), n = 0; n < a.length; n++) {
            var o = a[n], d = o.transferSize, f = o.initiatorType, x = o.duration;
            if (d && x && Kh(f)) {
                for (f = 0, x = o.responseEnd, n += 1; n < a.length; n++) {
                    var N = a[n], _ = N.startTime;
                    if (_ > x)
                        break;
                    var U = N.transferSize, H = N.initiatorType;
                    U && Kh(H) && (N = N.responseEnd, f += U * (N < x ? 1 : (x - _) / (N - _)));
                }
                if (--n, t += 8 * (d + f) / (o.duration / 1e3), e++, 10 < e)
                    break;
            }
        }
        if (0 < e)
            return t / e / 1e6;
    } return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5; }
    var Io = null, Wo = null;
    function Ki(e) { return e.nodeType === 9 ? e : e.ownerDocument; }
    function Yh(e) { switch (e) {
        case "http://www.w3.org/2000/svg": return 1;
        case "http://www.w3.org/1998/Math/MathML": return 2;
        default: return 0;
    } }
    function Xh(e, t) { if (e === 0)
        switch (t) {
            case "svg": return 1;
            case "math": return 2;
            default: return 0;
        } return e === 1 && t === "foreignObject" ? 0 : e; }
    function ed(e, t) { return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null; }
    var td = null;
    function zb() { var e = window.event; return e && e.type === "popstate" ? e === td ? !1 : (td = e, !0) : (td = null, !1); }
    var Zh = typeof setTimeout == "function" ? setTimeout : void 0, Rb = typeof clearTimeout == "function" ? clearTimeout : void 0, Jh = typeof Promise == "function" ? Promise : void 0, qb = typeof queueMicrotask == "function" ? queueMicrotask : typeof Jh < "u" ? function (e) { return Jh.resolve(null).then(e).catch(Bb); } : Zh;
    function Bb(e) { setTimeout(function () { throw e; }); }
    function aa(e) { return e === "head"; }
    function Fh(e, t) { var a = t, n = 0; do {
        var o = a.nextSibling;
        if (e.removeChild(a), o && o.nodeType === 8)
            if (a = o.data, a === "/$" || a === "/&") {
                if (n === 0) {
                    e.removeChild(o), jl(t);
                    return;
                }
                n--;
            }
            else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&")
                n++;
            else if (a === "html")
                yn(e.ownerDocument.documentElement);
            else if (a === "head") {
                a = e.ownerDocument.head, yn(a);
                for (var d = a.firstChild; d;) {
                    var f = d.nextSibling, x = d.nodeName;
                    d[ql] || x === "SCRIPT" || x === "STYLE" || x === "LINK" && d.rel.toLowerCase() === "stylesheet" || a.removeChild(d), d = f;
                }
            }
            else
                a === "body" && yn(e.ownerDocument.body);
        a = o;
    } while (a); jl(t); }
    function $h(e, t) { var a = e; e = 0; do {
        var n = a.nextSibling;
        if (a.nodeType === 1 ? t ? (a._stashedDisplay = a.style.display, a.style.display = "none") : (a.style.display = a._stashedDisplay || "", a.getAttribute("style") === "" && a.removeAttribute("style")) : a.nodeType === 3 && (t ? (a._stashedText = a.nodeValue, a.nodeValue = "") : a.nodeValue = a._stashedText || ""), n && n.nodeType === 8)
            if (a = n.data, a === "/$") {
                if (e === 0)
                    break;
                e--;
            }
            else
                a !== "$" && a !== "$?" && a !== "$~" && a !== "$!" || e++;
        a = n;
    } while (a); }
    function sd(e) { var t = e.firstChild; for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
        var a = t;
        switch (t = t.nextSibling, a.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
                sd(a), ic(a);
                continue;
            case "SCRIPT":
            case "STYLE": continue;
            case "LINK": if (a.rel.toLowerCase() === "stylesheet")
                continue;
        }
        e.removeChild(a);
    } }
    function Ub(e, t, a, n) { for (; e.nodeType === 1;) {
        var o = a;
        if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
            if (!n && (e.nodeName !== "INPUT" || e.type !== "hidden"))
                break;
        }
        else if (n) {
            if (!e[ql])
                switch (t) {
                    case "meta":
                        if (!e.hasAttribute("itemprop"))
                            break;
                        return e;
                    case "link":
                        if (d = e.getAttribute("rel"), d === "stylesheet" && e.hasAttribute("data-precedence"))
                            break;
                        if (d !== o.rel || e.getAttribute("href") !== (o.href == null || o.href === "" ? null : o.href) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin) || e.getAttribute("title") !== (o.title == null ? null : o.title))
                            break;
                        return e;
                    case "style":
                        if (e.hasAttribute("data-precedence"))
                            break;
                        return e;
                    case "script":
                        if (d = e.getAttribute("src"), (d !== (o.src == null ? null : o.src) || e.getAttribute("type") !== (o.type == null ? null : o.type) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin)) && d && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                            break;
                        return e;
                    default: return e;
                }
        }
        else if (t === "input" && e.type === "hidden") {
            var d = o.name == null ? null : "" + o.name;
            if (o.type === "hidden" && e.getAttribute("name") === d)
                return e;
        }
        else
            return e;
        if (e = Yt(e.nextSibling), e === null)
            break;
    } return null; }
    function Lb(e, t, a) { if (t === "")
        return null; for (; e.nodeType !== 3;)
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = Yt(e.nextSibling), e === null))
            return null; return e; }
    function Ph(e, t) { for (; e.nodeType !== 8;)
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Yt(e.nextSibling), e === null))
            return null; return e; }
    function ad(e) { return e.data === "$?" || e.data === "$~"; }
    function ld(e) { return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading"; }
    function Hb(e, t) { var a = e.ownerDocument; if (e.data === "$~")
        e._reactRetry = t;
    else if (e.data !== "$?" || a.readyState !== "loading")
        t();
    else {
        var n = function () { t(), a.removeEventListener("DOMContentLoaded", n); };
        a.addEventListener("DOMContentLoaded", n), e._reactRetry = n;
    } }
    function Yt(e) { for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === 1 || t === 3)
            break;
        if (t === 8) {
            if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
                break;
            if (t === "/$" || t === "/&")
                return null;
        }
    } return e; }
    var nd = null;
    function Ih(e) { e = e.nextSibling; for (var t = 0; e;) {
        if (e.nodeType === 8) {
            var a = e.data;
            if (a === "/$" || a === "/&") {
                if (t === 0)
                    return Yt(e.nextSibling);
                t--;
            }
            else
                a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || t++;
        }
        e = e.nextSibling;
    } return null; }
    function Wh(e) { e = e.previousSibling; for (var t = 0; e;) {
        if (e.nodeType === 8) {
            var a = e.data;
            if (a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&") {
                if (t === 0)
                    return e;
                t--;
            }
            else
                a !== "/$" && a !== "/&" || t++;
        }
        e = e.previousSibling;
    } return null; }
    function ex(e, t, a) { switch (t = Ki(a), e) {
        case "html":
            if (e = t.documentElement, !e)
                throw Error(c(452));
            return e;
        case "head":
            if (e = t.head, !e)
                throw Error(c(453));
            return e;
        case "body":
            if (e = t.body, !e)
                throw Error(c(454));
            return e;
        default: throw Error(c(451));
    } }
    function yn(e) { for (var t = e.attributes; t.length;)
        e.removeAttributeNode(t[0]); ic(e); }
    var Xt = new Map, tx = new Set;
    function Yi(e) { return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument; }
    var _s = J.d;
    J.d = { f: Vb, r: Gb, D: Qb, C: Kb, L: Yb, m: Xb, X: Jb, S: Zb, M: Fb };
    function Vb() { var e = _s.f(), t = qi(); return e || t; }
    function Gb(e) { var t = Ha(e); t !== null && t.tag === 5 && t.type === "form" ? bf(t) : _s.r(e); }
    var bl = typeof document > "u" ? null : document;
    function sx(e, t, a) { var n = bl; if (n && typeof t == "string" && t) {
        var o = Ut(t);
        o = 'link[rel="' + e + '"][href="' + o + '"]', typeof a == "string" && (o += '[crossorigin="' + a + '"]'), tx.has(o) || (tx.add(o), e = { rel: e, crossOrigin: a, href: t }, n.querySelector(o) === null && (t = n.createElement("link"), ut(t, "link", e), tt(t), n.head.appendChild(t)));
    } }
    function Qb(e) { _s.D(e), sx("dns-prefetch", e, null); }
    function Kb(e, t) { _s.C(e, t), sx("preconnect", e, t); }
    function Yb(e, t, a) { _s.L(e, t, a); var n = bl; if (n && e && t) {
        var o = 'link[rel="preload"][as="' + Ut(t) + '"]';
        t === "image" && a && a.imageSrcSet ? (o += '[imagesrcset="' + Ut(a.imageSrcSet) + '"]', typeof a.imageSizes == "string" && (o += '[imagesizes="' + Ut(a.imageSizes) + '"]')) : o += '[href="' + Ut(e) + '"]';
        var d = o;
        switch (t) {
            case "style":
                d = yl(e);
                break;
            case "script": d = vl(e);
        }
        Xt.has(d) || (e = g({ rel: "preload", href: t === "image" && a && a.imageSrcSet ? void 0 : e, as: t }, a), Xt.set(d, e), n.querySelector(o) !== null || t === "style" && n.querySelector(vn(d)) || t === "script" && n.querySelector(jn(d)) || (t = n.createElement("link"), ut(t, "link", e), tt(t), n.head.appendChild(t)));
    } }
    function Xb(e, t) { _s.m(e, t); var a = bl; if (a && e) {
        var n = t && typeof t.as == "string" ? t.as : "script", o = 'link[rel="modulepreload"][as="' + Ut(n) + '"][href="' + Ut(e) + '"]', d = o;
        switch (n) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script": d = vl(e);
        }
        if (!Xt.has(d) && (e = g({ rel: "modulepreload", href: e }, t), Xt.set(d, e), a.querySelector(o) === null)) {
            switch (n) {
                case "audioworklet":
                case "paintworklet":
                case "serviceworker":
                case "sharedworker":
                case "worker":
                case "script": if (a.querySelector(jn(d)))
                    return;
            }
            n = a.createElement("link"), ut(n, "link", e), tt(n), a.head.appendChild(n);
        }
    } }
    function Zb(e, t, a) { _s.S(e, t, a); var n = bl; if (n && e) {
        var o = Va(n).hoistableStyles, d = yl(e);
        t = t || "default";
        var f = o.get(d);
        if (!f) {
            var x = { loading: 0, preload: null };
            if (f = n.querySelector(vn(d)))
                x.loading = 5;
            else {
                e = g({ rel: "stylesheet", href: e, "data-precedence": t }, a), (a = Xt.get(d)) && id(e, a);
                var N = f = n.createElement("link");
                tt(N), ut(N, "link", e), N._p = new Promise(function (_, U) { N.onload = _, N.onerror = U; }), N.addEventListener("load", function () { x.loading |= 1; }), N.addEventListener("error", function () { x.loading |= 2; }), x.loading |= 4, Xi(f, t, n);
            }
            f = { type: "stylesheet", instance: f, count: 1, state: x }, o.set(d, f);
        }
    } }
    function Jb(e, t) { _s.X(e, t); var a = bl; if (a && e) {
        var n = Va(a).hoistableScripts, o = vl(e), d = n.get(o);
        d || (d = a.querySelector(jn(o)), d || (e = g({ src: e, async: !0 }, t), (t = Xt.get(o)) && rd(e, t), d = a.createElement("script"), tt(d), ut(d, "link", e), a.head.appendChild(d)), d = { type: "script", instance: d, count: 1, state: null }, n.set(o, d));
    } }
    function Fb(e, t) { _s.M(e, t); var a = bl; if (a && e) {
        var n = Va(a).hoistableScripts, o = vl(e), d = n.get(o);
        d || (d = a.querySelector(jn(o)), d || (e = g({ src: e, async: !0, type: "module" }, t), (t = Xt.get(o)) && rd(e, t), d = a.createElement("script"), tt(d), ut(d, "link", e), a.head.appendChild(d)), d = { type: "script", instance: d, count: 1, state: null }, n.set(o, d));
    } }
    function ax(e, t, a, n) { var o = (o = Pt.current) ? Yi(o) : null; if (!o)
        throw Error(c(446)); switch (e) {
        case "meta":
        case "title": return null;
        case "style": return typeof a.precedence == "string" && typeof a.href == "string" ? (t = yl(a.href), a = Va(o).hoistableStyles, n = a.get(t), n || (n = { type: "style", instance: null, count: 0, state: null }, a.set(t, n)), n) : { type: "void", instance: null, count: 0, state: null };
        case "link":
            if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
                e = yl(a.href);
                var d = Va(o).hoistableStyles, f = d.get(e);
                if (f || (o = o.ownerDocument || o, f = { type: "stylesheet", instance: null, count: 0, state: { loading: 0, preload: null } }, d.set(e, f), (d = o.querySelector(vn(e))) && !d._p && (f.instance = d, f.state.loading = 5), Xt.has(e) || (a = { rel: "preload", as: "style", href: a.href, crossOrigin: a.crossOrigin, integrity: a.integrity, media: a.media, hrefLang: a.hrefLang, referrerPolicy: a.referrerPolicy }, Xt.set(e, a), d || $b(o, e, a, f.state))), t && n === null)
                    throw Error(c(528, ""));
                return f;
            }
            if (t && n !== null)
                throw Error(c(529, ""));
            return null;
        case "script": return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = vl(a), a = Va(o).hoistableScripts, n = a.get(t), n || (n = { type: "script", instance: null, count: 0, state: null }, a.set(t, n)), n) : { type: "void", instance: null, count: 0, state: null };
        default: throw Error(c(444, e));
    } }
    function yl(e) { return 'href="' + Ut(e) + '"'; }
    function vn(e) { return 'link[rel="stylesheet"][' + e + "]"; }
    function lx(e) { return g({}, e, { "data-precedence": e.precedence, precedence: null }); }
    function $b(e, t, a, n) { e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? n.loading = 1 : (t = e.createElement("link"), n.preload = t, t.addEventListener("load", function () { return n.loading |= 1; }), t.addEventListener("error", function () { return n.loading |= 2; }), ut(t, "link", a), tt(t), e.head.appendChild(t)); }
    function vl(e) { return '[src="' + Ut(e) + '"]'; }
    function jn(e) { return "script[async]" + e; }
    function nx(e, t, a) { if (t.count++, t.instance === null)
        switch (t.type) {
            case "style":
                var n = e.querySelector('style[data-href~="' + Ut(a.href) + '"]');
                if (n)
                    return t.instance = n, tt(n), n;
                var o = g({}, a, { "data-href": a.href, "data-precedence": a.precedence, href: null, precedence: null });
                return n = (e.ownerDocument || e).createElement("style"), tt(n), ut(n, "style", o), Xi(n, a.precedence, e), t.instance = n;
            case "stylesheet":
                o = yl(a.href);
                var d = e.querySelector(vn(o));
                if (d)
                    return t.state.loading |= 4, t.instance = d, tt(d), d;
                n = lx(a), (o = Xt.get(o)) && id(n, o), d = (e.ownerDocument || e).createElement("link"), tt(d);
                var f = d;
                return f._p = new Promise(function (x, N) { f.onload = x, f.onerror = N; }), ut(d, "link", n), t.state.loading |= 4, Xi(d, a.precedence, e), t.instance = d;
            case "script": return d = vl(a.src), (o = e.querySelector(jn(d))) ? (t.instance = o, tt(o), o) : (n = a, (o = Xt.get(d)) && (n = g({}, a), rd(n, o)), e = e.ownerDocument || e, o = e.createElement("script"), tt(o), ut(o, "link", n), e.head.appendChild(o), t.instance = o);
            case "void": return null;
            default: throw Error(c(443, t.type));
        }
    else
        t.type === "stylesheet" && (t.state.loading & 4) === 0 && (n = t.instance, t.state.loading |= 4, Xi(n, a.precedence, e)); return t.instance; }
    function Xi(e, t, a) { for (var n = a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), o = n.length ? n[n.length - 1] : null, d = o, f = 0; f < n.length; f++) {
        var x = n[f];
        if (x.dataset.precedence === t)
            d = x;
        else if (d !== o)
            break;
    } d ? d.parentNode.insertBefore(e, d.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(e, t.firstChild)); }
    function id(e, t) { e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title); }
    function rd(e, t) { e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity); }
    var Zi = null;
    function ix(e, t, a) { if (Zi === null) {
        var n = new Map, o = Zi = new Map;
        o.set(a, n);
    }
    else
        o = Zi, n = o.get(a), n || (n = new Map, o.set(a, n)); if (n.has(e))
        return n; for (n.set(e, null), a = a.getElementsByTagName(e), o = 0; o < a.length; o++) {
        var d = a[o];
        if (!(d[ql] || d[rt] || e === "link" && d.getAttribute("rel") === "stylesheet") && d.namespaceURI !== "http://www.w3.org/2000/svg") {
            var f = d.getAttribute(t) || "";
            f = e + f;
            var x = n.get(f);
            x ? x.push(d) : n.set(f, [d]);
        }
    } return n; }
    function rx(e, t, a) { e = e.ownerDocument || e, e.head.insertBefore(a, t === "title" ? e.querySelector("head > title") : null); }
    function Pb(e, t, a) { if (a === 1 || t.itemProp != null)
        return !1; switch (e) {
        case "meta":
        case "title": return !0;
        case "style":
            if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
                break;
            return !0;
        case "link":
            if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
                break;
            switch (t.rel) {
                case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
                default: return !0;
            }
        case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
            return !0;
    } return !1; }
    function cx(e) { return !(e.type === "stylesheet" && (e.state.loading & 3) === 0); }
    function Ib(e, t, a, n) { if (a.type === "stylesheet" && (typeof n.media != "string" || matchMedia(n.media).matches !== !1) && (a.state.loading & 4) === 0) {
        if (a.instance === null) {
            var o = yl(n.href), d = t.querySelector(vn(o));
            if (d) {
                t = d._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Ji.bind(e), t.then(e, e)), a.state.loading |= 4, a.instance = d, tt(d);
                return;
            }
            d = t.ownerDocument || t, n = lx(n), (o = Xt.get(o)) && id(n, o), d = d.createElement("link"), tt(d);
            var f = d;
            f._p = new Promise(function (x, N) { f.onload = x, f.onerror = N; }), ut(d, "link", n), a.instance = d;
        }
        e.stylesheets === null && (e.stylesheets = new Map), e.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (e.count++, a = Ji.bind(e), t.addEventListener("load", a), t.addEventListener("error", a));
    } }
    var cd = 0;
    function Wb(e, t) { return e.stylesheets && e.count === 0 && $i(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function (a) { var n = setTimeout(function () { if (e.stylesheets && $i(e, e.stylesheets), e.unsuspend) {
        var d = e.unsuspend;
        e.unsuspend = null, d();
    } }, 6e4 + t); 0 < e.imgBytes && cd === 0 && (cd = 62500 * Db()); var o = setTimeout(function () { if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && $i(e, e.stylesheets), e.unsuspend)) {
        var d = e.unsuspend;
        e.unsuspend = null, d();
    } }, (e.imgBytes > cd ? 50 : 800) + t); return e.unsuspend = a, function () { e.unsuspend = null, clearTimeout(n), clearTimeout(o); }; } : null; }
    function Ji() { if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
        if (this.stylesheets)
            $i(this, this.stylesheets);
        else if (this.unsuspend) {
            var e = this.unsuspend;
            this.unsuspend = null, e();
        }
    } }
    var Fi = null;
    function $i(e, t) { e.stylesheets = null, e.unsuspend !== null && (e.count++, Fi = new Map, t.forEach(ey, e), Fi = null, Ji.call(e)); }
    function ey(e, t) { if (!(t.state.loading & 4)) {
        var a = Fi.get(e);
        if (a)
            var n = a.get(null);
        else {
            a = new Map, Fi.set(e, a);
            for (var o = e.querySelectorAll("link[data-precedence],style[data-precedence]"), d = 0; d < o.length; d++) {
                var f = o[d];
                (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (a.set(f.dataset.precedence, f), n = f);
            }
            n && a.set(null, n);
        }
        o = t.instance, f = o.getAttribute("data-precedence"), d = a.get(f) || n, d === n && a.set(null, o), a.set(f, o), this.count++, n = Ji.bind(this), o.addEventListener("load", n), o.addEventListener("error", n), d ? d.parentNode.insertBefore(o, d.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(o, e.firstChild)), t.state.loading |= 4;
    } }
    var Nn = { $$typeof: V, Provider: null, Consumer: null, _currentValue: Q, _currentValue2: Q, _threadCount: 0 };
    function ty(e, t, a, n, o, d, f, x, N) { this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = sc(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = sc(0), this.hiddenUpdates = sc(null), this.identifierPrefix = n, this.onUncaughtError = o, this.onCaughtError = d, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = N, this.incompleteTransitions = new Map; }
    function ox(e, t, a, n, o, d, f, x, N, _, U, H) { return e = new ty(e, t, a, f, N, _, U, H, x), t = 1, d === !0 && (t |= 24), d = Et(3, null, null, t), e.current = d, d.stateNode = e, t = Hc(), t.refCount++, e.pooledCache = t, t.refCount++, d.memoizedState = { element: n, isDehydrated: a, cache: t }, Kc(d), e; }
    function dx(e) { return e ? (e = Pa, e) : Pa; }
    function ux(e, t, a, n, o, d) { o = dx(o), n.context === null ? n.context = o : n.pendingContext = o, n = Xs(t), n.payload = { element: a }, d = d === void 0 ? null : d, d !== null && (n.callback = d), a = Zs(e, n, t), a !== null && (jt(a, e, t), Wl(a, e, t)); }
    function mx(e, t) { if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
        var a = e.retryLane;
        e.retryLane = a !== 0 && a < t ? a : t;
    } }
    function od(e, t) { mx(e, t), (e = e.alternate) && mx(e, t); }
    function fx(e) { if (e.tag === 13 || e.tag === 31) {
        var t = va(e, 67108864);
        t !== null && jt(t, e, 67108864), od(e, 67108864);
    } }
    function hx(e) { if (e.tag === 13 || e.tag === 31) {
        var t = zt();
        t = ac(t);
        var a = va(e, t);
        a !== null && jt(a, e, t), od(e, t);
    } }
    var Pi = !0;
    function sy(e, t, a, n) { var o = E.T; E.T = null; var d = J.p; try {
        J.p = 2, dd(e, t, a, n);
    }
    finally {
        J.p = d, E.T = o;
    } }
    function ay(e, t, a, n) { var o = E.T; E.T = null; var d = J.p; try {
        J.p = 8, dd(e, t, a, n);
    }
    finally {
        J.p = d, E.T = o;
    } }
    function dd(e, t, a, n) { if (Pi) {
        var o = ud(n);
        if (o === null)
            $o(e, t, n, Ii, a), px(e, n);
        else if (ny(o, e, t, a, n))
            n.stopPropagation();
        else if (px(e, n), t & 4 && -1 < ly.indexOf(e)) {
            for (; o !== null;) {
                var d = Ha(o);
                if (d !== null)
                    switch (d.tag) {
                        case 3:
                            if (d = d.stateNode, d.current.memoizedState.isDehydrated) {
                                var f = xa(d.pendingLanes);
                                if (f !== 0) {
                                    var x = d;
                                    for (x.pendingLanes |= 2, x.entangledLanes |= 2; f;) {
                                        var N = 1 << 31 - At(f);
                                        x.entanglements[1] |= N, f &= ~N;
                                    }
                                    os(d), (Ne & 6) === 0 && (zi = kt() + 500, pn(0));
                                }
                            }
                            break;
                        case 31:
                        case 13: x = va(d, 2), x !== null && jt(x, d, 2), qi(), od(d, 2);
                    }
                if (d = ud(n), d === null && $o(e, t, n, Ii, a), d === o)
                    break;
                o = d;
            }
            o !== null && n.stopPropagation();
        }
        else
            $o(e, t, n, null, a);
    } }
    function ud(e) { return e = mc(e), md(e); }
    var Ii = null;
    function md(e) { if (Ii = null, e = La(e), e !== null) {
        var t = m(e);
        if (t === null)
            e = null;
        else {
            var a = t.tag;
            if (a === 13) {
                if (e = h(t), e !== null)
                    return e;
                e = null;
            }
            else if (a === 31) {
                if (e = p(t), e !== null)
                    return e;
                e = null;
            }
            else if (a === 3) {
                if (t.stateNode.current.memoizedState.isDehydrated)
                    return t.tag === 3 ? t.stateNode.containerInfo : null;
                e = null;
            }
            else
                t !== e && (e = null);
        }
    } return Ii = e, null; }
    function xx(e) { switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart": return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave": return 8;
        case "message": switch (Qg()) {
            case Nu: return 2;
            case wu: return 8;
            case Vn:
            case Kg: return 32;
            case Su: return 268435456;
            default: return 32;
        }
        default: return 32;
    } }
    var fd = !1, la = null, na = null, ia = null, wn = new Map, Sn = new Map, ra = [], ly = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function px(e, t) { switch (e) {
        case "focusin":
        case "focusout":
            la = null;
            break;
        case "dragenter":
        case "dragleave":
            na = null;
            break;
        case "mouseover":
        case "mouseout":
            ia = null;
            break;
        case "pointerover":
        case "pointerout":
            wn.delete(t.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture": Sn.delete(t.pointerId);
    } }
    function kn(e, t, a, n, o, d) { return e === null || e.nativeEvent !== d ? (e = { blockedOn: t, domEventName: a, eventSystemFlags: n, nativeEvent: d, targetContainers: [o] }, t !== null && (t = Ha(t), t !== null && fx(t)), e) : (e.eventSystemFlags |= n, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e); }
    function ny(e, t, a, n, o) { switch (t) {
        case "focusin": return la = kn(la, e, t, a, n, o), !0;
        case "dragenter": return na = kn(na, e, t, a, n, o), !0;
        case "mouseover": return ia = kn(ia, e, t, a, n, o), !0;
        case "pointerover":
            var d = o.pointerId;
            return wn.set(d, kn(wn.get(d) || null, e, t, a, n, o)), !0;
        case "gotpointercapture": return d = o.pointerId, Sn.set(d, kn(Sn.get(d) || null, e, t, a, n, o)), !0;
    } return !1; }
    function gx(e) { var t = La(e.target); if (t !== null) {
        var a = m(t);
        if (a !== null) {
            if (t = a.tag, t === 13) {
                if (t = h(a), t !== null) {
                    e.blockedOn = t, Mu(e.priority, function () { hx(a); });
                    return;
                }
            }
            else if (t === 31) {
                if (t = p(a), t !== null) {
                    e.blockedOn = t, Mu(e.priority, function () { hx(a); });
                    return;
                }
            }
            else if (t === 3 && a.stateNode.current.memoizedState.isDehydrated) {
                e.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
                return;
            }
        }
    } e.blockedOn = null; }
    function Wi(e) { if (e.blockedOn !== null)
        return !1; for (var t = e.targetContainers; 0 < t.length;) {
        var a = ud(e.nativeEvent);
        if (a === null) {
            a = e.nativeEvent;
            var n = new a.constructor(a.type, a);
            uc = n, a.target.dispatchEvent(n), uc = null;
        }
        else
            return t = Ha(a), t !== null && fx(t), e.blockedOn = a, !1;
        t.shift();
    } return !0; }
    function bx(e, t, a) { Wi(e) && a.delete(t); }
    function iy() { fd = !1, la !== null && Wi(la) && (la = null), na !== null && Wi(na) && (na = null), ia !== null && Wi(ia) && (ia = null), wn.forEach(bx), Sn.forEach(bx); }
    function er(e, t) { e.blockedOn === t && (e.blockedOn = null, fd || (fd = !0, l.unstable_scheduleCallback(l.unstable_NormalPriority, iy))); }
    var tr = null;
    function yx(e) { tr !== e && (tr = e, l.unstable_scheduleCallback(l.unstable_NormalPriority, function () { tr === e && (tr = null); for (var t = 0; t < e.length; t += 3) {
        var a = e[t], n = e[t + 1], o = e[t + 2];
        if (typeof n != "function") {
            if (md(n || a) === null)
                continue;
            break;
        }
        var d = Ha(a);
        d !== null && (e.splice(t, 3), t -= 3, uo(d, { pending: !0, data: o, method: a.method, action: n }, n, o));
    } })); }
    function jl(e) { function t(N) { return er(N, e); } la !== null && er(la, e), na !== null && er(na, e), ia !== null && er(ia, e), wn.forEach(t), Sn.forEach(t); for (var a = 0; a < ra.length; a++) {
        var n = ra[a];
        n.blockedOn === e && (n.blockedOn = null);
    } for (; 0 < ra.length && (a = ra[0], a.blockedOn === null);)
        gx(a), a.blockedOn === null && ra.shift(); if (a = (e.ownerDocument || e).$$reactFormReplay, a != null)
        for (n = 0; n < a.length; n += 3) {
            var o = a[n], d = a[n + 1], f = o[xt] || null;
            if (typeof d == "function")
                f || yx(a);
            else if (f) {
                var x = null;
                if (d && d.hasAttribute("formAction")) {
                    if (o = d, f = d[xt] || null)
                        x = f.formAction;
                    else if (md(o) !== null)
                        continue;
                }
                else
                    x = f.action;
                typeof x == "function" ? a[n + 1] = x : (a.splice(n, 3), n -= 3), yx(a);
            }
        } }
    function vx() { function e(d) { d.canIntercept && d.info === "react-transition" && d.intercept({ handler: function () { return new Promise(function (f) { return o = f; }); }, focusReset: "manual", scroll: "manual" }); } function t() { o !== null && (o(), o = null), n || setTimeout(a, 20); } function a() { if (!n && !navigation.transition) {
        var d = navigation.currentEntry;
        d && d.url != null && navigation.navigate(d.url, { state: d.getState(), info: "react-transition", history: "replace" });
    } } if (typeof navigation == "object") {
        var n = !1, o = null;
        return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(a, 100), function () { n = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), o !== null && (o(), o = null); };
    } }
    function hd(e) { this._internalRoot = e; }
    sr.prototype.render = hd.prototype.render = function (e) { var t = this._internalRoot; if (t === null)
        throw Error(c(409)); var a = t.current, n = zt(); ux(a, n, e, t, null, null); }, sr.prototype.unmount = hd.prototype.unmount = function () { var e = this._internalRoot; if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        ux(e.current, 2, null, e, null, null), qi(), t[Ua] = null;
    } };
    function sr(e) { this._internalRoot = e; }
    sr.prototype.unstable_scheduleHydration = function (e) { if (e) {
        var t = Eu();
        e = { blockedOn: null, target: e, priority: t };
        for (var a = 0; a < ra.length && t !== 0 && t < ra[a].priority; a++)
            ;
        ra.splice(a, 0, e), a === 0 && gx(e);
    } };
    var jx = i.version;
    if (jx !== "19.2.3")
        throw Error(c(527, jx, "19.2.3"));
    J.findDOMNode = function (e) { var t = e._reactInternals; if (t === void 0)
        throw typeof e.render == "function" ? Error(c(188)) : (e = Object.keys(e).join(","), Error(c(268, e))); return e = y(t), e = e !== null ? v(e) : null, e = e === null ? null : e.stateNode, e; };
    var ry = { bundleType: 0, version: "19.2.3", rendererPackageName: "react-dom", currentDispatcherRef: E, reconcilerVersion: "19.2.3" };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var ar = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!ar.isDisabled && ar.supportsFiber)
            try {
                Dl = ar.inject(ry), Ct = ar;
            }
            catch { }
    }
    return Cn.createRoot = function (e, t) { if (!u(e))
        throw Error(c(299)); var a = !1, n = "", o = Tf, d = Ef, f = Mf; return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (n = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (d = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = ox(e, 1, !1, null, null, a, n, null, o, d, f, vx), e[Ua] = t.current, Fo(e), new hd(t); }, Cn.hydrateRoot = function (e, t, a) { if (!u(e))
        throw Error(c(299)); var n = !1, o = "", d = Tf, f = Ef, x = Mf, N = null; return a != null && (a.unstable_strictMode === !0 && (n = !0), a.identifierPrefix !== void 0 && (o = a.identifierPrefix), a.onUncaughtError !== void 0 && (d = a.onUncaughtError), a.onCaughtError !== void 0 && (f = a.onCaughtError), a.onRecoverableError !== void 0 && (x = a.onRecoverableError), a.formState !== void 0 && (N = a.formState)), t = ox(e, 1, !0, t, a ?? null, n, o, N, d, f, x, vx), t.context = dx(null), a = t.current, n = zt(), n = ac(n), o = Xs(n), o.callback = null, Zs(a, o, n), a = n, t.current.lanes = a, Rl(t, a), os(t), e[Ua] = t.current, Fo(e), new sr(t); }, Cn.version = "19.2.3", Cn;
}
var kx;
function Ny() { if (kx)
    return xd.exports; kx = 1; function l() { if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l);
    }
    catch (i) {
        console.error(i);
    } } return l(), xd.exports = jy(), xd.exports; }
var wy = Ny();
const Sy = fy(wy), ms = Object.create(null);
ms.open = "0";
ms.close = "1";
ms.ping = "2";
ms.pong = "3";
ms.message = "4";
ms.upgrade = "5";
ms.noop = "6";
const dr = Object.create(null);
Object.keys(ms).forEach(l => { dr[ms[l]] = l; });
const Rd = { type: "error", data: "parser error" }, xp = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", pp = typeof ArrayBuffer == "function", gp = l => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(l) : l && l.buffer instanceof ArrayBuffer, $d = ({ type: l, data: i }, r, c) => xp && i instanceof Blob ? r ? c(i) : Cx(i, c) : pp && (i instanceof ArrayBuffer || gp(i)) ? r ? c(i) : Cx(new Blob([i]), c) : c(ms[l] + (i || "")), Cx = (l, i) => { const r = new FileReader; return r.onload = function () { const c = r.result.split(",")[1]; i("b" + (c || "")); }, r.readAsDataURL(l); };
function Ax(l) { return l instanceof Uint8Array ? l : l instanceof ArrayBuffer ? new Uint8Array(l) : new Uint8Array(l.buffer, l.byteOffset, l.byteLength); }
let bd;
function ky(l, i) { if (xp && l.data instanceof Blob)
    return l.data.arrayBuffer().then(Ax).then(i); if (pp && (l.data instanceof ArrayBuffer || gp(l.data)))
    return i(Ax(l.data)); $d(l, !1, r => { bd || (bd = new TextEncoder), i(bd.encode(r)); }); }
const Tx = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", _n = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let l = 0; l < Tx.length; l++)
    _n[Tx.charCodeAt(l)] = l;
const Cy = l => { let i = l.length * .75, r = l.length, c, u = 0, m, h, p, b; l[l.length - 1] === "=" && (i--, l[l.length - 2] === "=" && i--); const y = new ArrayBuffer(i), v = new Uint8Array(y); for (c = 0; c < r; c += 4)
    m = _n[l.charCodeAt(c)], h = _n[l.charCodeAt(c + 1)], p = _n[l.charCodeAt(c + 2)], b = _n[l.charCodeAt(c + 3)], v[u++] = m << 2 | h >> 4, v[u++] = (h & 15) << 4 | p >> 2, v[u++] = (p & 3) << 6 | b & 63; return y; }, Ay = typeof ArrayBuffer == "function", Pd = (l, i) => { if (typeof l != "string")
    return { type: "message", data: bp(l, i) }; const r = l.charAt(0); return r === "b" ? { type: "message", data: Ty(l.substring(1), i) } : dr[r] ? l.length > 1 ? { type: dr[r], data: l.substring(1) } : { type: dr[r] } : Rd; }, Ty = (l, i) => { if (Ay) {
    const r = Cy(l);
    return bp(r, i);
}
else
    return { base64: !0, data: l }; }, bp = (l, i) => { switch (i) {
    case "blob": return l instanceof Blob ? l : new Blob([l]);
    case "arraybuffer":
    default: return l instanceof ArrayBuffer ? l : l.buffer;
} }, yp = "", Ey = (l, i) => { const r = l.length, c = new Array(r); let u = 0; l.forEach((m, h) => { $d(m, !1, p => { c[h] = p, ++u === r && i(c.join(yp)); }); }); }, My = (l, i) => { const r = l.split(yp), c = []; for (let u = 0; u < r.length; u++) {
    const m = Pd(r[u], i);
    if (c.push(m), m.type === "error")
        break;
} return c; };
function _y() { return new TransformStream({ transform(l, i) { ky(l, r => { const c = r.length; let u; if (c < 126)
        u = new Uint8Array(1), new DataView(u.buffer).setUint8(0, c);
    else if (c < 65536) {
        u = new Uint8Array(3);
        const m = new DataView(u.buffer);
        m.setUint8(0, 126), m.setUint16(1, c);
    }
    else {
        u = new Uint8Array(9);
        const m = new DataView(u.buffer);
        m.setUint8(0, 127), m.setBigUint64(1, BigInt(c));
    } l.data && typeof l.data != "string" && (u[0] |= 128), i.enqueue(u), i.enqueue(r); }); } }); }
let yd;
function lr(l) { return l.reduce((i, r) => i + r.length, 0); }
function nr(l, i) { if (l[0].length === i)
    return l.shift(); const r = new Uint8Array(i); let c = 0; for (let u = 0; u < i; u++)
    r[u] = l[0][c++], c === l[0].length && (l.shift(), c = 0); return l.length && c < l[0].length && (l[0] = l[0].slice(c)), r; }
function Oy(l, i) { yd || (yd = new TextDecoder); const r = []; let c = 0, u = -1, m = !1; return new TransformStream({ transform(h, p) { for (r.push(h);;) {
        if (c === 0) {
            if (lr(r) < 1)
                break;
            const b = nr(r, 1);
            m = (b[0] & 128) === 128, u = b[0] & 127, u < 126 ? c = 3 : u === 126 ? c = 1 : c = 2;
        }
        else if (c === 1) {
            if (lr(r) < 2)
                break;
            const b = nr(r, 2);
            u = new DataView(b.buffer, b.byteOffset, b.length).getUint16(0), c = 3;
        }
        else if (c === 2) {
            if (lr(r) < 8)
                break;
            const b = nr(r, 8), y = new DataView(b.buffer, b.byteOffset, b.length), v = y.getUint32(0);
            if (v > Math.pow(2, 21) - 1) {
                p.enqueue(Rd);
                break;
            }
            u = v * Math.pow(2, 32) + y.getUint32(4), c = 3;
        }
        else {
            if (lr(r) < u)
                break;
            const b = nr(r, u);
            p.enqueue(Pd(m ? b : yd.decode(b), i)), c = 0;
        }
        if (u === 0 || u > l) {
            p.enqueue(Rd);
            break;
        }
    } } }); }
const vp = 4;
function Ze(l) { if (l)
    return Dy(l); }
function Dy(l) { for (var i in Ze.prototype)
    l[i] = Ze.prototype[i]; return l; }
Ze.prototype.on = Ze.prototype.addEventListener = function (l, i) { return this._callbacks = this._callbacks || {}, (this._callbacks["$" + l] = this._callbacks["$" + l] || []).push(i), this; };
Ze.prototype.once = function (l, i) { function r() { this.off(l, r), i.apply(this, arguments); } return r.fn = i, this.on(l, r), this; };
Ze.prototype.off = Ze.prototype.removeListener = Ze.prototype.removeAllListeners = Ze.prototype.removeEventListener = function (l, i) { if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this; var r = this._callbacks["$" + l]; if (!r)
    return this; if (arguments.length == 1)
    return delete this._callbacks["$" + l], this; for (var c, u = 0; u < r.length; u++)
    if (c = r[u], c === i || c.fn === i) {
        r.splice(u, 1);
        break;
    } return r.length === 0 && delete this._callbacks["$" + l], this; };
Ze.prototype.emit = function (l) { this._callbacks = this._callbacks || {}; for (var i = new Array(arguments.length - 1), r = this._callbacks["$" + l], c = 1; c < arguments.length; c++)
    i[c - 1] = arguments[c]; if (r) {
    r = r.slice(0);
    for (var c = 0, u = r.length; c < u; ++c)
        r[c].apply(this, i);
} return this; };
Ze.prototype.emitReserved = Ze.prototype.emit;
Ze.prototype.listeners = function (l) { return this._callbacks = this._callbacks || {}, this._callbacks["$" + l] || []; };
Ze.prototype.hasListeners = function (l) { return !!this.listeners(l).length; };
const Mr = typeof Promise == "function" && typeof Promise.resolve == "function" ? i => Promise.resolve().then(i) : (i, r) => r(i, 0), Zt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), zy = "arraybuffer";
function jp(l, ...i) { return i.reduce((r, c) => (l.hasOwnProperty(c) && (r[c] = l[c]), r), {}); }
const Ry = Zt.setTimeout, qy = Zt.clearTimeout;
function _r(l, i) { i.useNativeTimers ? (l.setTimeoutFn = Ry.bind(Zt), l.clearTimeoutFn = qy.bind(Zt)) : (l.setTimeoutFn = Zt.setTimeout.bind(Zt), l.clearTimeoutFn = Zt.clearTimeout.bind(Zt)); }
const By = 1.33;
function Uy(l) { return typeof l == "string" ? Ly(l) : Math.ceil((l.byteLength || l.size) * By); }
function Ly(l) { let i = 0, r = 0; for (let c = 0, u = l.length; c < u; c++)
    i = l.charCodeAt(c), i < 128 ? r += 1 : i < 2048 ? r += 2 : i < 55296 || i >= 57344 ? r += 3 : (c++, r += 4); return r; }
function Np() { return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5); }
function Hy(l) { let i = ""; for (let r in l)
    l.hasOwnProperty(r) && (i.length && (i += "&"), i += encodeURIComponent(r) + "=" + encodeURIComponent(l[r])); return i; }
function Vy(l) { let i = {}, r = l.split("&"); for (let c = 0, u = r.length; c < u; c++) {
    let m = r[c].split("=");
    i[decodeURIComponent(m[0])] = decodeURIComponent(m[1]);
} return i; }
class Gy extends Error {
    constructor(i, r, c) { super(i), this.description = r, this.context = c, this.type = "TransportError"; }
}
class Id extends Ze {
    constructor(i) { super(), this.writable = !1, _r(this, i), this.opts = i, this.query = i.query, this.socket = i.socket, this.supportsBinary = !i.forceBase64; }
    onError(i, r, c) { return super.emitReserved("error", new Gy(i, r, c)), this; }
    open() { return this.readyState = "opening", this.doOpen(), this; }
    close() { return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this; }
    send(i) { this.readyState === "open" && this.write(i); }
    onOpen() { this.readyState = "open", this.writable = !0, super.emitReserved("open"); }
    onData(i) { const r = Pd(i, this.socket.binaryType); this.onPacket(r); }
    onPacket(i) { super.emitReserved("packet", i); }
    onClose(i) { this.readyState = "closed", super.emitReserved("close", i); }
    pause(i) { }
    createUri(i, r = {}) { return i + "://" + this._hostname() + this._port() + this.opts.path + this._query(r); }
    _hostname() { const i = this.opts.hostname; return i.indexOf(":") === -1 ? i : "[" + i + "]"; }
    _port() { return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : ""; }
    _query(i) { const r = Hy(i); return r.length ? "?" + r : ""; }
}
class Qy extends Id {
    constructor() { super(...arguments), this._polling = !1; }
    get name() { return "polling"; }
    doOpen() { this._poll(); }
    pause(i) { this.readyState = "pausing"; const r = () => { this.readyState = "paused", i(); }; if (this._polling || !this.writable) {
        let c = 0;
        this._polling && (c++, this.once("pollComplete", function () { --c || r(); })), this.writable || (c++, this.once("drain", function () { --c || r(); }));
    }
    else
        r(); }
    _poll() { this._polling = !0, this.doPoll(), this.emitReserved("poll"); }
    onData(i) { const r = c => { if (this.readyState === "opening" && c.type === "open" && this.onOpen(), c.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1; this.onPacket(c); }; My(i, this.socket.binaryType).forEach(r), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll()); }
    doClose() { const i = () => { this.write([{ type: "close" }]); }; this.readyState === "open" ? i() : this.once("open", i); }
    write(i) { this.writable = !1, Ey(i, r => { this.doWrite(r, () => { this.writable = !0, this.emitReserved("drain"); }); }); }
    uri() { const i = this.opts.secure ? "https" : "http", r = this.query || {}; return this.opts.timestampRequests !== !1 && (r[this.opts.timestampParam] = Np()), !this.supportsBinary && !r.sid && (r.b64 = 1), this.createUri(i, r); }
}
let wp = !1;
try {
    wp = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest;
}
catch { }
const Ky = wp;
function Yy() { }
class Xy extends Qy {
    constructor(i) { if (super(i), typeof location < "u") {
        const r = location.protocol === "https:";
        let c = location.port;
        c || (c = r ? "443" : "80"), this.xd = typeof location < "u" && i.hostname !== location.hostname || c !== i.port;
    } }
    doWrite(i, r) { const c = this.request({ method: "POST", data: i }); c.on("success", r), c.on("error", (u, m) => { this.onError("xhr post error", u, m); }); }
    doPoll() { const i = this.request(); i.on("data", this.onData.bind(this)), i.on("error", (r, c) => { this.onError("xhr poll error", r, c); }), this.pollXhr = i; }
}
class us extends Ze {
    constructor(i, r, c) { super(), this.createRequest = i, _r(this, c), this._opts = c, this._method = c.method || "GET", this._uri = r, this._data = c.data !== void 0 ? c.data : null, this._create(); }
    _create() { var i; const r = jp(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref"); r.xdomain = !!this._opts.xd; const c = this._xhr = this.createRequest(r); try {
        c.open(this._method, this._uri, !0);
        try {
            if (this._opts.extraHeaders) {
                c.setDisableHeaderCheck && c.setDisableHeaderCheck(!0);
                for (let u in this._opts.extraHeaders)
                    this._opts.extraHeaders.hasOwnProperty(u) && c.setRequestHeader(u, this._opts.extraHeaders[u]);
            }
        }
        catch { }
        if (this._method === "POST")
            try {
                c.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
            }
            catch { }
        try {
            c.setRequestHeader("Accept", "*/*");
        }
        catch { }
        (i = this._opts.cookieJar) === null || i === void 0 || i.addCookies(c), "withCredentials" in c && (c.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (c.timeout = this._opts.requestTimeout), c.onreadystatechange = () => { var u; c.readyState === 3 && ((u = this._opts.cookieJar) === null || u === void 0 || u.parseCookies(c.getResponseHeader("set-cookie"))), c.readyState === 4 && (c.status === 200 || c.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => { this._onError(typeof c.status == "number" ? c.status : 0); }, 0)); }, c.send(this._data);
    }
    catch (u) {
        this.setTimeoutFn(() => { this._onError(u); }, 0);
        return;
    } typeof document < "u" && (this._index = us.requestsCount++, us.requests[this._index] = this); }
    _onError(i) { this.emitReserved("error", i, this._xhr), this._cleanup(!0); }
    _cleanup(i) { if (!(typeof this._xhr > "u" || this._xhr === null)) {
        if (this._xhr.onreadystatechange = Yy, i)
            try {
                this._xhr.abort();
            }
            catch { }
        typeof document < "u" && delete us.requests[this._index], this._xhr = null;
    } }
    _onLoad() { const i = this._xhr.responseText; i !== null && (this.emitReserved("data", i), this.emitReserved("success"), this._cleanup()); }
    abort() { this._cleanup(); }
}
us.requestsCount = 0;
us.requests = {};
if (typeof document < "u") {
    if (typeof attachEvent == "function")
        attachEvent("onunload", Ex);
    else if (typeof addEventListener == "function") {
        const l = "onpagehide" in Zt ? "pagehide" : "unload";
        addEventListener(l, Ex, !1);
    }
}
function Ex() { for (let l in us.requests)
    us.requests.hasOwnProperty(l) && us.requests[l].abort(); }
const Zy = (function () { const l = Sp({ xdomain: !1 }); return l && l.responseType !== null; })();
class Jy extends Xy {
    constructor(i) { super(i); const r = i && i.forceBase64; this.supportsBinary = Zy && !r; }
    request(i = {}) { return Object.assign(i, { xd: this.xd }, this.opts), new us(Sp, this.uri(), i); }
}
function Sp(l) { const i = l.xdomain; try {
    if (typeof XMLHttpRequest < "u" && (!i || Ky))
        return new XMLHttpRequest;
}
catch { } if (!i)
    try {
        return new Zt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    }
    catch { } }
const kp = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Fy extends Id {
    get name() { return "websocket"; }
    doOpen() { const i = this.uri(), r = this.opts.protocols, c = kp ? {} : jp(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity"); this.opts.extraHeaders && (c.headers = this.opts.extraHeaders); try {
        this.ws = this.createSocket(i, r, c);
    }
    catch (u) {
        return this.emitReserved("error", u);
    } this.ws.binaryType = this.socket.binaryType, this.addEventListeners(); }
    addEventListeners() { this.ws.onopen = () => { this.opts.autoUnref && this.ws._socket.unref(), this.onOpen(); }, this.ws.onclose = i => this.onClose({ description: "websocket connection closed", context: i }), this.ws.onmessage = i => this.onData(i.data), this.ws.onerror = i => this.onError("websocket error", i); }
    write(i) { this.writable = !1; for (let r = 0; r < i.length; r++) {
        const c = i[r], u = r === i.length - 1;
        $d(c, this.supportsBinary, m => { try {
            this.doWrite(c, m);
        }
        catch { } u && Mr(() => { this.writable = !0, this.emitReserved("drain"); }, this.setTimeoutFn); });
    } }
    doClose() { typeof this.ws < "u" && (this.ws.onerror = () => { }, this.ws.close(), this.ws = null); }
    uri() { const i = this.opts.secure ? "wss" : "ws", r = this.query || {}; return this.opts.timestampRequests && (r[this.opts.timestampParam] = Np()), this.supportsBinary || (r.b64 = 1), this.createUri(i, r); }
}
const vd = Zt.WebSocket || Zt.MozWebSocket;
class $y extends Fy {
    createSocket(i, r, c) { return kp ? new vd(i, r, c) : r ? new vd(i, r) : new vd(i); }
    doWrite(i, r) { this.ws.send(r); }
}
class Py extends Id {
    get name() { return "webtransport"; }
    doOpen() { try {
        this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    }
    catch (i) {
        return this.emitReserved("error", i);
    } this._transport.closed.then(() => { this.onClose(); }).catch(i => { this.onError("webtransport error", i); }), this._transport.ready.then(() => { this._transport.createBidirectionalStream().then(i => { const r = Oy(Number.MAX_SAFE_INTEGER, this.socket.binaryType), c = i.readable.pipeThrough(r).getReader(), u = _y(); u.readable.pipeTo(i.writable), this._writer = u.writable.getWriter(); const m = () => { c.read().then(({ done: p, value: b }) => { p || (this.onPacket(b), m()); }).catch(p => { }); }; m(); const h = { type: "open" }; this.query.sid && (h.data = `{"sid":"${this.query.sid}"}`), this._writer.write(h).then(() => this.onOpen()); }); }); }
    write(i) { this.writable = !1; for (let r = 0; r < i.length; r++) {
        const c = i[r], u = r === i.length - 1;
        this._writer.write(c).then(() => { u && Mr(() => { this.writable = !0, this.emitReserved("drain"); }, this.setTimeoutFn); });
    } }
    doClose() { var i; (i = this._transport) === null || i === void 0 || i.close(); }
}
const Iy = { websocket: $y, webtransport: Py, polling: Jy }, Wy = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, ev = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
function qd(l) { if (l.length > 8e3)
    throw "URI too long"; const i = l, r = l.indexOf("["), c = l.indexOf("]"); r != -1 && c != -1 && (l = l.substring(0, r) + l.substring(r, c).replace(/:/g, ";") + l.substring(c, l.length)); let u = Wy.exec(l || ""), m = {}, h = 14; for (; h--;)
    m[ev[h]] = u[h] || ""; return r != -1 && c != -1 && (m.source = i, m.host = m.host.substring(1, m.host.length - 1).replace(/;/g, ":"), m.authority = m.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), m.ipv6uri = !0), m.pathNames = tv(m, m.path), m.queryKey = sv(m, m.query), m; }
function tv(l, i) { const r = /\/{2,9}/g, c = i.replace(r, "/").split("/"); return (i.slice(0, 1) == "/" || i.length === 0) && c.splice(0, 1), i.slice(-1) == "/" && c.splice(c.length - 1, 1), c; }
function sv(l, i) { const r = {}; return i.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function (c, u, m) { u && (r[u] = m); }), r; }
const Bd = typeof addEventListener == "function" && typeof removeEventListener == "function", ur = [];
Bd && addEventListener("offline", () => { ur.forEach(l => l()); }, !1);
class da extends Ze {
    constructor(i, r) { if (super(), this.binaryType = zy, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, i && typeof i == "object" && (r = i, i = null), i) {
        const c = qd(i);
        r.hostname = c.host, r.secure = c.protocol === "https" || c.protocol === "wss", r.port = c.port, c.query && (r.query = c.query);
    }
    else
        r.host && (r.hostname = qd(r.host).host); _r(this, r), this.secure = r.secure != null ? r.secure : typeof location < "u" && location.protocol === "https:", r.hostname && !r.port && (r.port = this.secure ? "443" : "80"), this.hostname = r.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = r.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, r.transports.forEach(c => { const u = c.prototype.name; this.transports.push(u), this._transportsByName[u] = c; }), this.opts = Object.assign({ path: "/engine.io", agent: !1, withCredentials: !1, upgrade: !0, timestampParam: "t", rememberUpgrade: !1, addTrailingSlash: !0, rejectUnauthorized: !0, perMessageDeflate: { threshold: 1024 }, transportOptions: {}, closeOnBeforeunload: !1 }, r), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Vy(this.opts.query)), Bd && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => { this.transport && (this.transport.removeAllListeners(), this.transport.close()); }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => { this._onClose("transport close", { description: "network connection lost" }); }, ur.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open(); }
    createTransport(i) { const r = Object.assign({}, this.opts.query); r.EIO = vp, r.transport = i, this.id && (r.sid = this.id); const c = Object.assign({}, this.opts, { query: r, socket: this, hostname: this.hostname, secure: this.secure, port: this.port }, this.opts.transportOptions[i]); return new this._transportsByName[i](c); }
    _open() { if (this.transports.length === 0) {
        this.setTimeoutFn(() => { this.emitReserved("error", "No transports available"); }, 0);
        return;
    } const i = this.opts.rememberUpgrade && da.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0]; this.readyState = "opening"; const r = this.createTransport(i); r.open(), this.setTransport(r); }
    setTransport(i) { this.transport && this.transport.removeAllListeners(), this.transport = i, i.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", r => this._onClose("transport close", r)); }
    onOpen() { this.readyState = "open", da.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush(); }
    _onPacket(i) { if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
        switch (this.emitReserved("packet", i), this.emitReserved("heartbeat"), i.type) {
            case "open":
                this.onHandshake(JSON.parse(i.data));
                break;
            case "ping":
                this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
                break;
            case "error":
                const r = new Error("server error");
                r.code = i.data, this._onError(r);
                break;
            case "message":
                this.emitReserved("data", i.data), this.emitReserved("message", i.data);
                break;
        } }
    onHandshake(i) { this.emitReserved("handshake", i), this.id = i.sid, this.transport.query.sid = i.sid, this._pingInterval = i.pingInterval, this._pingTimeout = i.pingTimeout, this._maxPayload = i.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout(); }
    _resetPingTimeout() { this.clearTimeoutFn(this._pingTimeoutTimer); const i = this._pingInterval + this._pingTimeout; this._pingTimeoutTime = Date.now() + i, this._pingTimeoutTimer = this.setTimeoutFn(() => { this._onClose("ping timeout"); }, i), this.opts.autoUnref && this._pingTimeoutTimer.unref(); }
    _onDrain() { this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush(); }
    flush() { if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
        const i = this._getWritablePackets();
        this.transport.send(i), this._prevBufferLen = i.length, this.emitReserved("flush");
    } }
    _getWritablePackets() { if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
        return this.writeBuffer; let r = 1; for (let c = 0; c < this.writeBuffer.length; c++) {
        const u = this.writeBuffer[c].data;
        if (u && (r += Uy(u)), c > 0 && r > this._maxPayload)
            return this.writeBuffer.slice(0, c);
        r += 2;
    } return this.writeBuffer; }
    _hasPingExpired() { if (!this._pingTimeoutTime)
        return !0; const i = Date.now() > this._pingTimeoutTime; return i && (this._pingTimeoutTime = 0, Mr(() => { this._onClose("ping timeout"); }, this.setTimeoutFn)), i; }
    write(i, r, c) { return this._sendPacket("message", i, r, c), this; }
    send(i, r, c) { return this._sendPacket("message", i, r, c), this; }
    _sendPacket(i, r, c, u) { if (typeof r == "function" && (u = r, r = void 0), typeof c == "function" && (u = c, c = null), this.readyState === "closing" || this.readyState === "closed")
        return; c = c || {}, c.compress = c.compress !== !1; const m = { type: i, data: r, options: c }; this.emitReserved("packetCreate", m), this.writeBuffer.push(m), u && this.once("flush", u), this.flush(); }
    close() { const i = () => { this._onClose("forced close"), this.transport.close(); }, r = () => { this.off("upgrade", r), this.off("upgradeError", r), i(); }, c = () => { this.once("upgrade", r), this.once("upgradeError", r); }; return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => { this.upgrading ? c() : i(); }) : this.upgrading ? c() : i()), this; }
    _onError(i) { if (da.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
        return this.transports.shift(), this._open(); this.emitReserved("error", i), this._onClose("transport error", i); }
    _onClose(i, r) { if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
        if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Bd && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
            const c = ur.indexOf(this._offlineEventListener);
            c !== -1 && ur.splice(c, 1);
        }
        this.readyState = "closed", this.id = null, this.emitReserved("close", i, r), this.writeBuffer = [], this._prevBufferLen = 0;
    } }
}
da.protocol = vp;
class av extends da {
    constructor() { super(...arguments), this._upgrades = []; }
    onOpen() { if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
        for (let i = 0; i < this._upgrades.length; i++)
            this._probe(this._upgrades[i]); }
    _probe(i) { let r = this.createTransport(i), c = !1; da.priorWebsocketSuccess = !1; const u = () => { c || (r.send([{ type: "ping", data: "probe" }]), r.once("packet", g => { if (!c)
        if (g.type === "pong" && g.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", r), !r)
                return;
            da.priorWebsocketSuccess = r.name === "websocket", this.transport.pause(() => { c || this.readyState !== "closed" && (v(), this.setTransport(r), r.send([{ type: "upgrade" }]), this.emitReserved("upgrade", r), r = null, this.upgrading = !1, this.flush()); });
        }
        else {
            const k = new Error("probe error");
            k.transport = r.name, this.emitReserved("upgradeError", k);
        } })); }; function m() { c || (c = !0, v(), r.close(), r = null); } const h = g => { const k = new Error("probe error: " + g); k.transport = r.name, m(), this.emitReserved("upgradeError", k); }; function p() { h("transport closed"); } function b() { h("socket closed"); } function y(g) { r && g.name !== r.name && m(); } const v = () => { r.removeListener("open", u), r.removeListener("error", h), r.removeListener("close", p), this.off("close", b), this.off("upgrading", y); }; r.once("open", u), r.once("error", h), r.once("close", p), this.once("close", b), this.once("upgrading", y), this._upgrades.indexOf("webtransport") !== -1 && i !== "webtransport" ? this.setTimeoutFn(() => { c || r.open(); }, 200) : r.open(); }
    onHandshake(i) { this._upgrades = this._filterUpgrades(i.upgrades), super.onHandshake(i); }
    _filterUpgrades(i) { const r = []; for (let c = 0; c < i.length; c++)
        ~this.transports.indexOf(i[c]) && r.push(i[c]); return r; }
}
let lv = class extends av {
    constructor(i, r = {}) { const c = typeof i == "object" ? i : r; (!c.transports || c.transports && typeof c.transports[0] == "string") && (c.transports = (c.transports || ["polling", "websocket", "webtransport"]).map(u => Iy[u]).filter(u => !!u)), super(i, c); }
};
function nv(l, i = "", r) { let c = l; r = r || typeof location < "u" && location, l == null && (l = r.protocol + "//" + r.host), typeof l == "string" && (l.charAt(0) === "/" && (l.charAt(1) === "/" ? l = r.protocol + l : l = r.host + l), /^(https?|wss?):\/\//.test(l) || (typeof r < "u" ? l = r.protocol + "//" + l : l = "https://" + l), c = qd(l)), c.port || (/^(http|ws)$/.test(c.protocol) ? c.port = "80" : /^(http|ws)s$/.test(c.protocol) && (c.port = "443")), c.path = c.path || "/"; const m = c.host.indexOf(":") !== -1 ? "[" + c.host + "]" : c.host; return c.id = c.protocol + "://" + m + ":" + c.port + i, c.href = c.protocol + "://" + m + (r && r.port === c.port ? "" : ":" + c.port), c; }
const iv = typeof ArrayBuffer == "function", rv = l => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(l) : l.buffer instanceof ArrayBuffer, Cp = Object.prototype.toString, cv = typeof Blob == "function" || typeof Blob < "u" && Cp.call(Blob) === "[object BlobConstructor]", ov = typeof File == "function" || typeof File < "u" && Cp.call(File) === "[object FileConstructor]";
function Wd(l) { return iv && (l instanceof ArrayBuffer || rv(l)) || cv && l instanceof Blob || ov && l instanceof File; }
function mr(l, i) { if (!l || typeof l != "object")
    return !1; if (Array.isArray(l)) {
    for (let r = 0, c = l.length; r < c; r++)
        if (mr(l[r]))
            return !0;
    return !1;
} if (Wd(l))
    return !0; if (l.toJSON && typeof l.toJSON == "function" && arguments.length === 1)
    return mr(l.toJSON(), !0); for (const r in l)
    if (Object.prototype.hasOwnProperty.call(l, r) && mr(l[r]))
        return !0; return !1; }
function dv(l) { const i = [], r = l.data, c = l; return c.data = Ud(r, i), c.attachments = i.length, { packet: c, buffers: i }; }
function Ud(l, i) { if (!l)
    return l; if (Wd(l)) {
    const r = { _placeholder: !0, num: i.length };
    return i.push(l), r;
}
else if (Array.isArray(l)) {
    const r = new Array(l.length);
    for (let c = 0; c < l.length; c++)
        r[c] = Ud(l[c], i);
    return r;
}
else if (typeof l == "object" && !(l instanceof Date)) {
    const r = {};
    for (const c in l)
        Object.prototype.hasOwnProperty.call(l, c) && (r[c] = Ud(l[c], i));
    return r;
} return l; }
function uv(l, i) { return l.data = Ld(l.data, i), delete l.attachments, l; }
function Ld(l, i) { if (!l)
    return l; if (l && l._placeholder === !0) {
    if (typeof l.num == "number" && l.num >= 0 && l.num < i.length)
        return i[l.num];
    throw new Error("illegal attachments");
}
else if (Array.isArray(l))
    for (let r = 0; r < l.length; r++)
        l[r] = Ld(l[r], i);
else if (typeof l == "object")
    for (const r in l)
        Object.prototype.hasOwnProperty.call(l, r) && (l[r] = Ld(l[r], i)); return l; }
const mv = ["connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener"], fv = 5;
var ye;
(function (l) { l[l.CONNECT = 0] = "CONNECT", l[l.DISCONNECT = 1] = "DISCONNECT", l[l.EVENT = 2] = "EVENT", l[l.ACK = 3] = "ACK", l[l.CONNECT_ERROR = 4] = "CONNECT_ERROR", l[l.BINARY_EVENT = 5] = "BINARY_EVENT", l[l.BINARY_ACK = 6] = "BINARY_ACK"; })(ye || (ye = {}));
class hv {
    constructor(i) { this.replacer = i; }
    encode(i) { return (i.type === ye.EVENT || i.type === ye.ACK) && mr(i) ? this.encodeAsBinary({ type: i.type === ye.EVENT ? ye.BINARY_EVENT : ye.BINARY_ACK, nsp: i.nsp, data: i.data, id: i.id }) : [this.encodeAsString(i)]; }
    encodeAsString(i) { let r = "" + i.type; return (i.type === ye.BINARY_EVENT || i.type === ye.BINARY_ACK) && (r += i.attachments + "-"), i.nsp && i.nsp !== "/" && (r += i.nsp + ","), i.id != null && (r += i.id), i.data != null && (r += JSON.stringify(i.data, this.replacer)), r; }
    encodeAsBinary(i) { const r = dv(i), c = this.encodeAsString(r.packet), u = r.buffers; return u.unshift(c), u; }
}
function Mx(l) { return Object.prototype.toString.call(l) === "[object Object]"; }
class eu extends Ze {
    constructor(i) { super(), this.reviver = i; }
    add(i) { let r; if (typeof i == "string") {
        if (this.reconstructor)
            throw new Error("got plaintext data when reconstructing a packet");
        r = this.decodeString(i);
        const c = r.type === ye.BINARY_EVENT;
        c || r.type === ye.BINARY_ACK ? (r.type = c ? ye.EVENT : ye.ACK, this.reconstructor = new xv(r), r.attachments === 0 && super.emitReserved("decoded", r)) : super.emitReserved("decoded", r);
    }
    else if (Wd(i) || i.base64)
        if (this.reconstructor)
            r = this.reconstructor.takeBinaryData(i), r && (this.reconstructor = null, super.emitReserved("decoded", r));
        else
            throw new Error("got binary data when not reconstructing a packet");
    else
        throw new Error("Unknown type: " + i); }
    decodeString(i) { let r = 0; const c = { type: Number(i.charAt(0)) }; if (ye[c.type] === void 0)
        throw new Error("unknown packet type " + c.type); if (c.type === ye.BINARY_EVENT || c.type === ye.BINARY_ACK) {
        const m = r + 1;
        for (; i.charAt(++r) !== "-" && r != i.length;)
            ;
        const h = i.substring(m, r);
        if (h != Number(h) || i.charAt(r) !== "-")
            throw new Error("Illegal attachments");
        c.attachments = Number(h);
    } if (i.charAt(r + 1) === "/") {
        const m = r + 1;
        for (; ++r && !(i.charAt(r) === "," || r === i.length);)
            ;
        c.nsp = i.substring(m, r);
    }
    else
        c.nsp = "/"; const u = i.charAt(r + 1); if (u !== "" && Number(u) == u) {
        const m = r + 1;
        for (; ++r;) {
            const h = i.charAt(r);
            if (h == null || Number(h) != h) {
                --r;
                break;
            }
            if (r === i.length)
                break;
        }
        c.id = Number(i.substring(m, r + 1));
    } if (i.charAt(++r)) {
        const m = this.tryParse(i.substr(r));
        if (eu.isPayloadValid(c.type, m))
            c.data = m;
        else
            throw new Error("invalid payload");
    } return c; }
    tryParse(i) { try {
        return JSON.parse(i, this.reviver);
    }
    catch {
        return !1;
    } }
    static isPayloadValid(i, r) { switch (i) {
        case ye.CONNECT: return Mx(r);
        case ye.DISCONNECT: return r === void 0;
        case ye.CONNECT_ERROR: return typeof r == "string" || Mx(r);
        case ye.EVENT:
        case ye.BINARY_EVENT: return Array.isArray(r) && (typeof r[0] == "number" || typeof r[0] == "string" && mv.indexOf(r[0]) === -1);
        case ye.ACK:
        case ye.BINARY_ACK: return Array.isArray(r);
    } }
    destroy() { this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null); }
}
class xv {
    constructor(i) { this.packet = i, this.buffers = [], this.reconPack = i; }
    takeBinaryData(i) { if (this.buffers.push(i), this.buffers.length === this.reconPack.attachments) {
        const r = uv(this.reconPack, this.buffers);
        return this.finishedReconstruction(), r;
    } return null; }
    finishedReconstruction() { this.reconPack = null, this.buffers = []; }
}
const pv = Object.freeze(Object.defineProperty({ __proto__: null, Decoder: eu, Encoder: hv, get PacketType() { return ye; }, protocol: fv }, Symbol.toStringTag, { value: "Module" }));
function ss(l, i, r) { return l.on(i, r), function () { l.off(i, r); }; }
const gv = Object.freeze({ connect: 1, connect_error: 1, disconnect: 1, disconnecting: 1, newListener: 1, removeListener: 1 });
class Ap extends Ze {
    constructor(i, r, c) { super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = i, this.nsp = r, c && c.auth && (this.auth = c.auth), this._opts = Object.assign({}, c), this.io._autoConnect && this.open(); }
    get disconnected() { return !this.connected; }
    subEvents() { if (this.subs)
        return; const i = this.io; this.subs = [ss(i, "open", this.onopen.bind(this)), ss(i, "packet", this.onpacket.bind(this)), ss(i, "error", this.onerror.bind(this)), ss(i, "close", this.onclose.bind(this))]; }
    get active() { return !!this.subs; }
    connect() { return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this); }
    open() { return this.connect(); }
    send(...i) { return i.unshift("message"), this.emit.apply(this, i), this; }
    emit(i, ...r) { var c, u, m; if (gv.hasOwnProperty(i))
        throw new Error('"' + i.toString() + '" is a reserved event name'); if (r.unshift(i), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
        return this._addToQueue(r), this; const h = { type: ye.EVENT, data: r }; if (h.options = {}, h.options.compress = this.flags.compress !== !1, typeof r[r.length - 1] == "function") {
        const v = this.ids++, g = r.pop();
        this._registerAckCallback(v, g), h.id = v;
    } const p = (u = (c = this.io.engine) === null || c === void 0 ? void 0 : c.transport) === null || u === void 0 ? void 0 : u.writable, b = this.connected && !(!((m = this.io.engine) === null || m === void 0) && m._hasPingExpired()); return this.flags.volatile && !p || (b ? (this.notifyOutgoingListeners(h), this.packet(h)) : this.sendBuffer.push(h)), this.flags = {}, this; }
    _registerAckCallback(i, r) { var c; const u = (c = this.flags.timeout) !== null && c !== void 0 ? c : this._opts.ackTimeout; if (u === void 0) {
        this.acks[i] = r;
        return;
    } const m = this.io.setTimeoutFn(() => { delete this.acks[i]; for (let p = 0; p < this.sendBuffer.length; p++)
        this.sendBuffer[p].id === i && this.sendBuffer.splice(p, 1); r.call(this, new Error("operation has timed out")); }, u), h = (...p) => { this.io.clearTimeoutFn(m), r.apply(this, p); }; h.withError = !0, this.acks[i] = h; }
    emitWithAck(i, ...r) { return new Promise((c, u) => { const m = (h, p) => h ? u(h) : c(p); m.withError = !0, r.push(m), this.emit(i, ...r); }); }
    _addToQueue(i) { let r; typeof i[i.length - 1] == "function" && (r = i.pop()); const c = { id: this._queueSeq++, tryCount: 0, pending: !1, args: i, flags: Object.assign({ fromQueue: !0 }, this.flags) }; i.push((u, ...m) => c !== this._queue[0] ? void 0 : (u !== null ? c.tryCount > this._opts.retries && (this._queue.shift(), r && r(u)) : (this._queue.shift(), r && r(null, ...m)), c.pending = !1, this._drainQueue())), this._queue.push(c), this._drainQueue(); }
    _drainQueue(i = !1) { if (!this.connected || this._queue.length === 0)
        return; const r = this._queue[0]; r.pending && !i || (r.pending = !0, r.tryCount++, this.flags = r.flags, this.emit.apply(this, r.args)); }
    packet(i) { i.nsp = this.nsp, this.io._packet(i); }
    onopen() { typeof this.auth == "function" ? this.auth(i => { this._sendConnectPacket(i); }) : this._sendConnectPacket(this.auth); }
    _sendConnectPacket(i) { this.packet({ type: ye.CONNECT, data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, i) : i }); }
    onerror(i) { this.connected || this.emitReserved("connect_error", i); }
    onclose(i, r) { this.connected = !1, delete this.id, this.emitReserved("disconnect", i, r), this._clearAcks(); }
    _clearAcks() { Object.keys(this.acks).forEach(i => { if (!this.sendBuffer.some(c => String(c.id) === i)) {
        const c = this.acks[i];
        delete this.acks[i], c.withError && c.call(this, new Error("socket has been disconnected"));
    } }); }
    onpacket(i) { if (i.nsp === this.nsp)
        switch (i.type) {
            case ye.CONNECT:
                i.data && i.data.sid ? this.onconnect(i.data.sid, i.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                break;
            case ye.EVENT:
            case ye.BINARY_EVENT:
                this.onevent(i);
                break;
            case ye.ACK:
            case ye.BINARY_ACK:
                this.onack(i);
                break;
            case ye.DISCONNECT:
                this.ondisconnect();
                break;
            case ye.CONNECT_ERROR:
                this.destroy();
                const c = new Error(i.data.message);
                c.data = i.data.data, this.emitReserved("connect_error", c);
                break;
        } }
    onevent(i) { const r = i.data || []; i.id != null && r.push(this.ack(i.id)), this.connected ? this.emitEvent(r) : this.receiveBuffer.push(Object.freeze(r)); }
    emitEvent(i) { if (this._anyListeners && this._anyListeners.length) {
        const r = this._anyListeners.slice();
        for (const c of r)
            c.apply(this, i);
    } super.emit.apply(this, i), this._pid && i.length && typeof i[i.length - 1] == "string" && (this._lastOffset = i[i.length - 1]); }
    ack(i) { const r = this; let c = !1; return function (...u) { c || (c = !0, r.packet({ type: ye.ACK, id: i, data: u })); }; }
    onack(i) { const r = this.acks[i.id]; typeof r == "function" && (delete this.acks[i.id], r.withError && i.data.unshift(null), r.apply(this, i.data)); }
    onconnect(i, r) { this.id = i, this.recovered = r && this._pid === r, this._pid = r, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0); }
    emitBuffered() { this.receiveBuffer.forEach(i => this.emitEvent(i)), this.receiveBuffer = [], this.sendBuffer.forEach(i => { this.notifyOutgoingListeners(i), this.packet(i); }), this.sendBuffer = []; }
    ondisconnect() { this.destroy(), this.onclose("io server disconnect"); }
    destroy() { this.subs && (this.subs.forEach(i => i()), this.subs = void 0), this.io._destroy(this); }
    disconnect() { return this.connected && this.packet({ type: ye.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this; }
    close() { return this.disconnect(); }
    compress(i) { return this.flags.compress = i, this; }
    get volatile() { return this.flags.volatile = !0, this; }
    timeout(i) { return this.flags.timeout = i, this; }
    onAny(i) { return this._anyListeners = this._anyListeners || [], this._anyListeners.push(i), this; }
    prependAny(i) { return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(i), this; }
    offAny(i) { if (!this._anyListeners)
        return this; if (i) {
        const r = this._anyListeners;
        for (let c = 0; c < r.length; c++)
            if (i === r[c])
                return r.splice(c, 1), this;
    }
    else
        this._anyListeners = []; return this; }
    listenersAny() { return this._anyListeners || []; }
    onAnyOutgoing(i) { return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(i), this; }
    prependAnyOutgoing(i) { return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(i), this; }
    offAnyOutgoing(i) { if (!this._anyOutgoingListeners)
        return this; if (i) {
        const r = this._anyOutgoingListeners;
        for (let c = 0; c < r.length; c++)
            if (i === r[c])
                return r.splice(c, 1), this;
    }
    else
        this._anyOutgoingListeners = []; return this; }
    listenersAnyOutgoing() { return this._anyOutgoingListeners || []; }
    notifyOutgoingListeners(i) { if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
        const r = this._anyOutgoingListeners.slice();
        for (const c of r)
            c.apply(this, i.data);
    } }
}
function Tl(l) { l = l || {}, this.ms = l.min || 100, this.max = l.max || 1e4, this.factor = l.factor || 2, this.jitter = l.jitter > 0 && l.jitter <= 1 ? l.jitter : 0, this.attempts = 0; }
Tl.prototype.duration = function () { var l = this.ms * Math.pow(this.factor, this.attempts++); if (this.jitter) {
    var i = Math.random(), r = Math.floor(i * this.jitter * l);
    l = (Math.floor(i * 10) & 1) == 0 ? l - r : l + r;
} return Math.min(l, this.max) | 0; };
Tl.prototype.reset = function () { this.attempts = 0; };
Tl.prototype.setMin = function (l) { this.ms = l; };
Tl.prototype.setMax = function (l) { this.max = l; };
Tl.prototype.setJitter = function (l) { this.jitter = l; };
class Hd extends Ze {
    constructor(i, r) { var c; super(), this.nsps = {}, this.subs = [], i && typeof i == "object" && (r = i, i = void 0), r = r || {}, r.path = r.path || "/socket.io", this.opts = r, _r(this, r), this.reconnection(r.reconnection !== !1), this.reconnectionAttempts(r.reconnectionAttempts || 1 / 0), this.reconnectionDelay(r.reconnectionDelay || 1e3), this.reconnectionDelayMax(r.reconnectionDelayMax || 5e3), this.randomizationFactor((c = r.randomizationFactor) !== null && c !== void 0 ? c : .5), this.backoff = new Tl({ min: this.reconnectionDelay(), max: this.reconnectionDelayMax(), jitter: this.randomizationFactor() }), this.timeout(r.timeout == null ? 2e4 : r.timeout), this._readyState = "closed", this.uri = i; const u = r.parser || pv; this.encoder = new u.Encoder, this.decoder = new u.Decoder, this._autoConnect = r.autoConnect !== !1, this._autoConnect && this.open(); }
    reconnection(i) { return arguments.length ? (this._reconnection = !!i, i || (this.skipReconnect = !0), this) : this._reconnection; }
    reconnectionAttempts(i) { return i === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = i, this); }
    reconnectionDelay(i) { var r; return i === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = i, (r = this.backoff) === null || r === void 0 || r.setMin(i), this); }
    randomizationFactor(i) { var r; return i === void 0 ? this._randomizationFactor : (this._randomizationFactor = i, (r = this.backoff) === null || r === void 0 || r.setJitter(i), this); }
    reconnectionDelayMax(i) { var r; return i === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = i, (r = this.backoff) === null || r === void 0 || r.setMax(i), this); }
    timeout(i) { return arguments.length ? (this._timeout = i, this) : this._timeout; }
    maybeReconnectOnOpen() { !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect(); }
    open(i) { if (~this._readyState.indexOf("open"))
        return this; this.engine = new lv(this.uri, this.opts); const r = this.engine, c = this; this._readyState = "opening", this.skipReconnect = !1; const u = ss(r, "open", function () { c.onopen(), i && i(); }), m = p => { this.cleanup(), this._readyState = "closed", this.emitReserved("error", p), i ? i(p) : this.maybeReconnectOnOpen(); }, h = ss(r, "error", m); if (this._timeout !== !1) {
        const p = this._timeout, b = this.setTimeoutFn(() => { u(), m(new Error("timeout")), r.close(); }, p);
        this.opts.autoUnref && b.unref(), this.subs.push(() => { this.clearTimeoutFn(b); });
    } return this.subs.push(u), this.subs.push(h), this; }
    connect(i) { return this.open(i); }
    onopen() { this.cleanup(), this._readyState = "open", this.emitReserved("open"); const i = this.engine; this.subs.push(ss(i, "ping", this.onping.bind(this)), ss(i, "data", this.ondata.bind(this)), ss(i, "error", this.onerror.bind(this)), ss(i, "close", this.onclose.bind(this)), ss(this.decoder, "decoded", this.ondecoded.bind(this))); }
    onping() { this.emitReserved("ping"); }
    ondata(i) { try {
        this.decoder.add(i);
    }
    catch (r) {
        this.onclose("parse error", r);
    } }
    ondecoded(i) { Mr(() => { this.emitReserved("packet", i); }, this.setTimeoutFn); }
    onerror(i) { this.emitReserved("error", i); }
    socket(i, r) { let c = this.nsps[i]; return c ? this._autoConnect && !c.active && c.connect() : (c = new Ap(this, i, r), this.nsps[i] = c), c; }
    _destroy(i) { const r = Object.keys(this.nsps); for (const c of r)
        if (this.nsps[c].active)
            return; this._close(); }
    _packet(i) { const r = this.encoder.encode(i); for (let c = 0; c < r.length; c++)
        this.engine.write(r[c], i.options); }
    cleanup() { this.subs.forEach(i => i()), this.subs.length = 0, this.decoder.destroy(); }
    _close() { this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close"); }
    disconnect() { return this._close(); }
    onclose(i, r) { var c; this.cleanup(), (c = this.engine) === null || c === void 0 || c.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", i, r), this._reconnection && !this.skipReconnect && this.reconnect(); }
    reconnect() { if (this._reconnecting || this.skipReconnect)
        return this; const i = this; if (this.backoff.attempts >= this._reconnectionAttempts)
        this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
        const r = this.backoff.duration();
        this._reconnecting = !0;
        const c = this.setTimeoutFn(() => { i.skipReconnect || (this.emitReserved("reconnect_attempt", i.backoff.attempts), !i.skipReconnect && i.open(u => { u ? (i._reconnecting = !1, i.reconnect(), this.emitReserved("reconnect_error", u)) : i.onreconnect(); })); }, r);
        this.opts.autoUnref && c.unref(), this.subs.push(() => { this.clearTimeoutFn(c); });
    } }
    onreconnect() { const i = this.backoff.attempts; this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", i); }
}
const An = {};
function fr(l, i) { typeof l == "object" && (i = l, l = void 0), i = i || {}; const r = nv(l, i.path || "/socket.io"), c = r.source, u = r.id, m = r.path, h = An[u] && m in An[u].nsps, p = i.forceNew || i["force new connection"] || i.multiplex === !1 || h; let b; return p ? b = new Hd(c, i) : (An[u] || (An[u] = new Hd(c, i)), b = An[u]), r.query && !i.query && (i.query = r.queryKey), b.socket(r.path, i); }
Object.assign(fr, { Manager: Hd, Socket: Ap, io: fr, connect: fr });
const _x = l => { let i; const r = new Set, c = (y, v) => { const g = typeof y == "function" ? y(i) : y; if (!Object.is(g, i)) {
    const k = i;
    i = v ?? (typeof g != "object" || g === null) ? g : Object.assign({}, i, g), r.forEach(C => C(i, k));
} }, u = () => i, p = { setState: c, getState: u, getInitialState: () => b, subscribe: y => (r.add(y), () => r.delete(y)) }, b = i = l(c, u, p); return p; }, bv = (l => l ? _x(l) : _x), yv = l => l;
function vv(l, i = yv) { const r = Mn.useSyncExternalStore(l.subscribe, Mn.useCallback(() => i(l.getState()), [l, i]), Mn.useCallback(() => i(l.getInitialState()), [l, i])); return Mn.useDebugValue(r), r; }
const Ox = l => { const i = bv(l), r = c => vv(i, c); return Object.assign(r, i), r; }, Tp = (l => l ? Ox(l) : Ox);
function jv(l, i) { let r; try {
    r = l();
}
catch {
    return;
} return { getItem: u => { var m; const h = b => b === null ? null : JSON.parse(b, void 0), p = (m = r.getItem(u)) != null ? m : null; return p instanceof Promise ? p.then(h) : h(p); }, setItem: (u, m) => r.setItem(u, JSON.stringify(m, void 0)), removeItem: u => r.removeItem(u) }; }
const Vd = l => i => { try {
    const r = l(i);
    return r instanceof Promise ? r : { then(c) { return Vd(c)(r); }, catch(c) { return this; } };
}
catch (r) {
    return { then(c) { return this; }, catch(c) { return Vd(c)(r); } };
} }, Nv = (l, i) => (r, c, u) => { let m = { storage: jv(() => localStorage), partialize: w => w, version: 0, merge: (w, T) => ({ ...T, ...w }), ...i }, h = !1; const p = new Set, b = new Set; let y = m.storage; if (!y)
    return l((...w) => { console.warn(`[zustand persist middleware] Unable to update item '${m.name}', the given storage is currently unavailable.`), r(...w); }, c, u); const v = () => { const w = m.partialize({ ...c() }); return y.setItem(m.name, { state: w, version: m.version }); }, g = u.setState; u.setState = (w, T) => (g(w, T), v()); const k = l((...w) => (r(...w), v()), c, u); u.getInitialState = () => k; let C; const j = () => { var w, T; if (!y)
    return; h = !1, p.forEach(Z => { var V; return Z((V = c()) != null ? V : k); }); const K = ((T = m.onRehydrateStorage) == null ? void 0 : T.call(m, (w = c()) != null ? w : k)) || void 0; return Vd(y.getItem.bind(y))(m.name).then(Z => { if (Z)
    if (typeof Z.version == "number" && Z.version !== m.version) {
        if (m.migrate) {
            const V = m.migrate(Z.state, Z.version);
            return V instanceof Promise ? V.then($ => [!0, $]) : [!0, V];
        }
        console.error("State loaded from storage couldn't be migrated since no migrate function was provided");
    }
    else
        return [!1, Z.state]; return [!1, void 0]; }).then(Z => { var V; const [$, D] = Z; if (C = m.merge(D, (V = c()) != null ? V : k), r(C, !0), $)
    return v(); }).then(() => { K == null || K(C, void 0), C = c(), h = !0, b.forEach(Z => Z(C)); }).catch(Z => { K == null || K(void 0, Z); }); }; return u.persist = { setOptions: w => { m = { ...m, ...w }, w.storage && (y = w.storage); }, clearStorage: () => { y == null || y.removeItem(m.name); }, getOptions: () => m, rehydrate: () => j(), hasHydrated: () => h, onHydrate: w => (p.add(w), () => { p.delete(w); }), onFinishHydration: w => (b.add(w), () => { b.delete(w); }) }, m.skipHydration || j(), C || k; }, wv = Nv, fs = Tp()(wv(l => ({ user: null, token: null, isAuthenticated: !1, _hasHydrated: !1, login: (i, r) => l({ user: i, token: r, isAuthenticated: !0 }), logout: () => l({ user: null, token: null, isAuthenticated: !1 }), updateUser: i => l(r => ({ user: r.user ? { ...r.user, ...i } : null })), setHasHydrated: i => l({ _hasHydrated: i }) }), { name: "solaria-auth", partialize: l => ({ user: l.user, token: l.token, isAuthenticated: l.isAuthenticated }), onRehydrateStorage: () => l => { l == null || l.setHasHydrated(!0); } })), Ep = B.createContext(null), Sv = "";
function kv({ children: l }) { const i = B.useRef(null), [r, c] = B.useState(!1), u = fs(v => v.token), m = fs(v => v.isAuthenticated), h = Ft(); B.useEffect(() => { if (!m || !u) {
    i.current && (i.current.disconnect(), i.current = null, c(!1));
    return;
} i.current = fr(Sv, { auth: { token: u }, reconnection: !0, reconnectionAttempts: 5, reconnectionDelay: 1e3, reconnectionDelayMax: 5e3 }); const v = i.current; return v.on("connect", () => { console.log("[Socket] Connected:", v.id), c(!0); }), v.on("disconnect", g => { console.log("[Socket] Disconnected:", g), c(!1); }), v.on("connect_error", g => { console.error("[Socket] Connection error:", g.message), c(!1); }), v.on("agent:status", g => { h.invalidateQueries({ queryKey: ["agents"] }), g != null && g.agentId && h.invalidateQueries({ queryKey: ["agents", g.agentId] }); }), v.on("task:updated", g => { h.invalidateQueries({ queryKey: ["tasks"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), g != null && g.taskId && h.invalidateQueries({ queryKey: ["tasks", g.taskId] }), g != null && g.projectId && (h.invalidateQueries({ queryKey: ["projects", g.projectId, "tasks"] }), h.invalidateQueries({ queryKey: ["projects", g.projectId] })); }), v.on("task:created", g => { h.invalidateQueries({ queryKey: ["tasks"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), g != null && g.projectId && h.invalidateQueries({ queryKey: ["projects", g.projectId, "tasks"] }); }), v.on("task:completed", g => { h.invalidateQueries({ queryKey: ["tasks"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), g != null && g.taskId && h.invalidateQueries({ queryKey: ["tasks", g.taskId] }), g != null && g.projectId && (h.invalidateQueries({ queryKey: ["projects", g.projectId, "tasks"] }), h.invalidateQueries({ queryKey: ["projects", g.projectId] })); }), v.on("task:deleted", g => { h.invalidateQueries({ queryKey: ["tasks"] }), g != null && g.projectId && h.invalidateQueries({ queryKey: ["projects", g.projectId, "tasks"] }); }), v.on("project:updated", g => { h.invalidateQueries({ queryKey: ["projects"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), g != null && g.projectId && h.invalidateQueries({ queryKey: ["projects", g.projectId] }); }), v.on("project:progress", g => { g != null && g.projectId && (h.invalidateQueries({ queryKey: ["projects", g.projectId] }), h.invalidateQueries({ queryKey: ["projects"] })); }), v.on("memory:created", () => { h.invalidateQueries({ queryKey: ["memories"] }); }), v.on("memory:updated", g => { h.invalidateQueries({ queryKey: ["memories"] }), g != null && g.memoryId && h.invalidateQueries({ queryKey: ["memories", g.memoryId] }); }), v.on("alert:critical", () => { h.invalidateQueries({ queryKey: ["dashboard", "alerts"] }), h.invalidateQueries({ queryKey: ["dashboard"] }); }), v.on("taskItem:completed", g => { g != null && g.taskId && (h.invalidateQueries({ queryKey: ["tasks", g.taskId, "items"] }), h.invalidateQueries({ queryKey: ["tasks", g.taskId] }), h.invalidateQueries({ queryKey: ["tasks"] })); }), v.on("taskItem:created", g => { g != null && g.taskId && (h.invalidateQueries({ queryKey: ["tasks", g.taskId, "items"] }), h.invalidateQueries({ queryKey: ["tasks", g.taskId] })); }), v.on("taskItem:updated", g => { g != null && g.taskId && (h.invalidateQueries({ queryKey: ["tasks", g.taskId, "items"] }), h.invalidateQueries({ queryKey: ["tasks", g.taskId] })); }), v.on("activity:new", () => { h.invalidateQueries({ queryKey: ["activity"] }); }), () => { v.disconnect(), i.current = null; }; }, [m, u, h]); const p = B.useCallback((v, g) => { var k; (k = i.current) != null && k.connected && i.current.emit(v, g); }, []), b = B.useCallback((v, g) => { var k; return (k = i.current) == null || k.on(v, g), () => { var C; (C = i.current) == null || C.off(v, g); }; }, []), y = B.useCallback((v, g) => { var k, C; g ? (k = i.current) == null || k.off(v, g) : (C = i.current) == null || C.removeAllListeners(v); }, []); return s.jsx(Ep.Provider, { value: { socket: i.current, isConnected: r, emit: p, on: b, off: y }, children: l }); }
function Cv() { const l = B.useContext(Ep); if (!l)
    throw new Error("useSocketContext must be used within a SocketProvider"); return l; }
function Mp(l, i) { return function () { return l.apply(i, arguments); }; }
const { toString: Av } = Object.prototype, { getPrototypeOf: tu } = Object, { iterator: Or, toStringTag: _p } = Symbol, Dr = (l => i => { const r = Av.call(i); return l[r] || (l[r] = r.slice(8, -1).toLowerCase()); })(Object.create(null)), ls = l => (l = l.toLowerCase(), i => Dr(i) === l), zr = l => i => typeof i === l, { isArray: El } = Array, Cl = zr("undefined");
function zn(l) { return l !== null && !Cl(l) && l.constructor !== null && !Cl(l.constructor) && Nt(l.constructor.isBuffer) && l.constructor.isBuffer(l); }
const Op = ls("ArrayBuffer");
function Tv(l) { let i; return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? i = ArrayBuffer.isView(l) : i = l && l.buffer && Op(l.buffer), i; }
const Ev = zr("string"), Nt = zr("function"), Dp = zr("number"), Rn = l => l !== null && typeof l == "object", Mv = l => l === !0 || l === !1, hr = l => { if (Dr(l) !== "object")
    return !1; const i = tu(l); return (i === null || i === Object.prototype || Object.getPrototypeOf(i) === null) && !(_p in l) && !(Or in l); }, _v = l => { if (!Rn(l) || zn(l))
    return !1; try {
    return Object.keys(l).length === 0 && Object.getPrototypeOf(l) === Object.prototype;
}
catch {
    return !1;
} }, Ov = ls("Date"), Dv = ls("File"), zv = ls("Blob"), Rv = ls("FileList"), qv = l => Rn(l) && Nt(l.pipe), Bv = l => { let i; return l && (typeof FormData == "function" && l instanceof FormData || Nt(l.append) && ((i = Dr(l)) === "formdata" || i === "object" && Nt(l.toString) && l.toString() === "[object FormData]")); }, Uv = ls("URLSearchParams"), [Lv, Hv, Vv, Gv] = ["ReadableStream", "Request", "Response", "Headers"].map(ls), Qv = l => l.trim ? l.trim() : l.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function qn(l, i, { allOwnKeys: r = !1 } = {}) { if (l === null || typeof l > "u")
    return; let c, u; if (typeof l != "object" && (l = [l]), El(l))
    for (c = 0, u = l.length; c < u; c++)
        i.call(null, l[c], c, l);
else {
    if (zn(l))
        return;
    const m = r ? Object.getOwnPropertyNames(l) : Object.keys(l), h = m.length;
    let p;
    for (c = 0; c < h; c++)
        p = m[c], i.call(null, l[p], p, l);
} }
function zp(l, i) { if (zn(l))
    return null; i = i.toLowerCase(); const r = Object.keys(l); let c = r.length, u; for (; c-- > 0;)
    if (u = r[c], i === u.toLowerCase())
        return u; return null; }
const za = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Rp = l => !Cl(l) && l !== za;
function Gd() { const { caseless: l, skipUndefined: i } = Rp(this) && this || {}, r = {}, c = (u, m) => { const h = l && zp(r, m) || m; hr(r[h]) && hr(u) ? r[h] = Gd(r[h], u) : hr(u) ? r[h] = Gd({}, u) : El(u) ? r[h] = u.slice() : (!i || !Cl(u)) && (r[h] = u); }; for (let u = 0, m = arguments.length; u < m; u++)
    arguments[u] && qn(arguments[u], c); return r; }
const Kv = (l, i, r, { allOwnKeys: c } = {}) => (qn(i, (u, m) => { r && Nt(u) ? l[m] = Mp(u, r) : l[m] = u; }, { allOwnKeys: c }), l), Yv = l => (l.charCodeAt(0) === 65279 && (l = l.slice(1)), l), Xv = (l, i, r, c) => { l.prototype = Object.create(i.prototype, c), l.prototype.constructor = l, Object.defineProperty(l, "super", { value: i.prototype }), r && Object.assign(l.prototype, r); }, Zv = (l, i, r, c) => { let u, m, h; const p = {}; if (i = i || {}, l == null)
    return i; do {
    for (u = Object.getOwnPropertyNames(l), m = u.length; m-- > 0;)
        h = u[m], (!c || c(h, l, i)) && !p[h] && (i[h] = l[h], p[h] = !0);
    l = r !== !1 && tu(l);
} while (l && (!r || r(l, i)) && l !== Object.prototype); return i; }, Jv = (l, i, r) => { l = String(l), (r === void 0 || r > l.length) && (r = l.length), r -= i.length; const c = l.indexOf(i, r); return c !== -1 && c === r; }, Fv = l => { if (!l)
    return null; if (El(l))
    return l; let i = l.length; if (!Dp(i))
    return null; const r = new Array(i); for (; i-- > 0;)
    r[i] = l[i]; return r; }, $v = (l => i => l && i instanceof l)(typeof Uint8Array < "u" && tu(Uint8Array)), Pv = (l, i) => { const c = (l && l[Or]).call(l); let u; for (; (u = c.next()) && !u.done;) {
    const m = u.value;
    i.call(l, m[0], m[1]);
} }, Iv = (l, i) => { let r; const c = []; for (; (r = l.exec(i)) !== null;)
    c.push(r); return c; }, Wv = ls("HTMLFormElement"), e1 = l => l.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (r, c, u) { return c.toUpperCase() + u; }), Dx = (({ hasOwnProperty: l }) => (i, r) => l.call(i, r))(Object.prototype), t1 = ls("RegExp"), qp = (l, i) => { const r = Object.getOwnPropertyDescriptors(l), c = {}; qn(r, (u, m) => { let h; (h = i(u, m, l)) !== !1 && (c[m] = h || u); }), Object.defineProperties(l, c); }, s1 = l => { qp(l, (i, r) => { if (Nt(l) && ["arguments", "caller", "callee"].indexOf(r) !== -1)
    return !1; const c = l[r]; if (Nt(c)) {
    if (i.enumerable = !1, "writable" in i) {
        i.writable = !1;
        return;
    }
    i.set || (i.set = () => { throw Error("Can not rewrite read-only method '" + r + "'"); });
} }); }, a1 = (l, i) => { const r = {}, c = u => { u.forEach(m => { r[m] = !0; }); }; return El(l) ? c(l) : c(String(l).split(i)), r; }, l1 = () => { }, n1 = (l, i) => l != null && Number.isFinite(l = +l) ? l : i;
function i1(l) { return !!(l && Nt(l.append) && l[_p] === "FormData" && l[Or]); }
const r1 = l => { const i = new Array(10), r = (c, u) => { if (Rn(c)) {
    if (i.indexOf(c) >= 0)
        return;
    if (zn(c))
        return c;
    if (!("toJSON" in c)) {
        i[u] = c;
        const m = El(c) ? [] : {};
        return qn(c, (h, p) => { const b = r(h, u + 1); !Cl(b) && (m[p] = b); }), i[u] = void 0, m;
    }
} return c; }; return r(l, 0); }, c1 = ls("AsyncFunction"), o1 = l => l && (Rn(l) || Nt(l)) && Nt(l.then) && Nt(l.catch), Bp = ((l, i) => l ? setImmediate : i ? ((r, c) => (za.addEventListener("message", ({ source: u, data: m }) => { u === za && m === r && c.length && c.shift()(); }, !1), u => { c.push(u), za.postMessage(r, "*"); }))(`axios@${Math.random()}`, []) : r => setTimeout(r))(typeof setImmediate == "function", Nt(za.postMessage)), d1 = typeof queueMicrotask < "u" ? queueMicrotask.bind(za) : typeof process < "u" && process.nextTick || Bp, u1 = l => l != null && Nt(l[Or]), z = { isArray: El, isArrayBuffer: Op, isBuffer: zn, isFormData: Bv, isArrayBufferView: Tv, isString: Ev, isNumber: Dp, isBoolean: Mv, isObject: Rn, isPlainObject: hr, isEmptyObject: _v, isReadableStream: Lv, isRequest: Hv, isResponse: Vv, isHeaders: Gv, isUndefined: Cl, isDate: Ov, isFile: Dv, isBlob: zv, isRegExp: t1, isFunction: Nt, isStream: qv, isURLSearchParams: Uv, isTypedArray: $v, isFileList: Rv, forEach: qn, merge: Gd, extend: Kv, trim: Qv, stripBOM: Yv, inherits: Xv, toFlatObject: Zv, kindOf: Dr, kindOfTest: ls, endsWith: Jv, toArray: Fv, forEachEntry: Pv, matchAll: Iv, isHTMLForm: Wv, hasOwnProperty: Dx, hasOwnProp: Dx, reduceDescriptors: qp, freezeMethods: s1, toObjectSet: a1, toCamelCase: e1, noop: l1, toFiniteNumber: n1, findKey: zp, global: za, isContextDefined: Rp, isSpecCompliantForm: i1, toJSONObject: r1, isAsyncFn: c1, isThenable: o1, setImmediate: Bp, asap: d1, isIterable: u1 };
function re(l, i, r, c, u) { Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = l, this.name = "AxiosError", i && (this.code = i), r && (this.config = r), c && (this.request = c), u && (this.response = u, this.status = u.status ? u.status : null); }
z.inherits(re, Error, { toJSON: function () { return { message: this.message, name: this.name, description: this.description, number: this.number, fileName: this.fileName, lineNumber: this.lineNumber, columnNumber: this.columnNumber, stack: this.stack, config: z.toJSONObject(this.config), code: this.code, status: this.status }; } });
const Up = re.prototype, Lp = {};
["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(l => { Lp[l] = { value: l }; });
Object.defineProperties(re, Lp);
Object.defineProperty(Up, "isAxiosError", { value: !0 });
re.from = (l, i, r, c, u, m) => { const h = Object.create(Up); z.toFlatObject(l, h, function (v) { return v !== Error.prototype; }, y => y !== "isAxiosError"); const p = l && l.message ? l.message : "Error", b = i == null && l ? l.code : i; return re.call(h, p, b, r, c, u), l && h.cause == null && Object.defineProperty(h, "cause", { value: l, configurable: !0 }), h.name = l && l.name || "Error", m && Object.assign(h, m), h; };
const m1 = null;
function Qd(l) { return z.isPlainObject(l) || z.isArray(l); }
function Hp(l) { return z.endsWith(l, "[]") ? l.slice(0, -2) : l; }
function zx(l, i, r) { return l ? l.concat(i).map(function (u, m) { return u = Hp(u), !r && m ? "[" + u + "]" : u; }).join(r ? "." : "") : i; }
function f1(l) { return z.isArray(l) && !l.some(Qd); }
const h1 = z.toFlatObject(z, {}, null, function (i) { return /^is[A-Z]/.test(i); });
function Rr(l, i, r) { if (!z.isObject(l))
    throw new TypeError("target must be an object"); i = i || new FormData, r = z.toFlatObject(r, { metaTokens: !0, dots: !1, indexes: !1 }, !1, function (w, T) { return !z.isUndefined(T[w]); }); const c = r.metaTokens, u = r.visitor || v, m = r.dots, h = r.indexes, b = (r.Blob || typeof Blob < "u" && Blob) && z.isSpecCompliantForm(i); if (!z.isFunction(u))
    throw new TypeError("visitor must be a function"); function y(j) { if (j === null)
    return ""; if (z.isDate(j))
    return j.toISOString(); if (z.isBoolean(j))
    return j.toString(); if (!b && z.isBlob(j))
    throw new re("Blob is not supported. Use a Buffer instead."); return z.isArrayBuffer(j) || z.isTypedArray(j) ? b && typeof Blob == "function" ? new Blob([j]) : Buffer.from(j) : j; } function v(j, w, T) { let K = j; if (j && !T && typeof j == "object") {
    if (z.endsWith(w, "{}"))
        w = c ? w : w.slice(0, -2), j = JSON.stringify(j);
    else if (z.isArray(j) && f1(j) || (z.isFileList(j) || z.endsWith(w, "[]")) && (K = z.toArray(j)))
        return w = Hp(w), K.forEach(function (V, $) { !(z.isUndefined(V) || V === null) && i.append(h === !0 ? zx([w], $, m) : h === null ? w : w + "[]", y(V)); }), !1;
} return Qd(j) ? !0 : (i.append(zx(T, w, m), y(j)), !1); } const g = [], k = Object.assign(h1, { defaultVisitor: v, convertValue: y, isVisitable: Qd }); function C(j, w) { if (!z.isUndefined(j)) {
    if (g.indexOf(j) !== -1)
        throw Error("Circular reference detected in " + w.join("."));
    g.push(j), z.forEach(j, function (K, Z) { (!(z.isUndefined(K) || K === null) && u.call(i, K, z.isString(Z) ? Z.trim() : Z, w, k)) === !0 && C(K, w ? w.concat(Z) : [Z]); }), g.pop();
} } if (!z.isObject(l))
    throw new TypeError("data must be an object"); return C(l), i; }
function Rx(l) { const i = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+", "%00": "\0" }; return encodeURIComponent(l).replace(/[!'()~]|%20|%00/g, function (c) { return i[c]; }); }
function su(l, i) { this._pairs = [], l && Rr(l, this, i); }
const Vp = su.prototype;
Vp.append = function (i, r) { this._pairs.push([i, r]); };
Vp.toString = function (i) { const r = i ? function (c) { return i.call(this, c, Rx); } : Rx; return this._pairs.map(function (u) { return r(u[0]) + "=" + r(u[1]); }, "").join("&"); };
function x1(l) { return encodeURIComponent(l).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+"); }
function Gp(l, i, r) { if (!i)
    return l; const c = r && r.encode || x1; z.isFunction(r) && (r = { serialize: r }); const u = r && r.serialize; let m; if (u ? m = u(i, r) : m = z.isURLSearchParams(i) ? i.toString() : new su(i, r).toString(c), m) {
    const h = l.indexOf("#");
    h !== -1 && (l = l.slice(0, h)), l += (l.indexOf("?") === -1 ? "?" : "&") + m;
} return l; }
class qx {
    constructor() { this.handlers = []; }
    use(i, r, c) { return this.handlers.push({ fulfilled: i, rejected: r, synchronous: c ? c.synchronous : !1, runWhen: c ? c.runWhen : null }), this.handlers.length - 1; }
    eject(i) { this.handlers[i] && (this.handlers[i] = null); }
    clear() { this.handlers && (this.handlers = []); }
    forEach(i) { z.forEach(this.handlers, function (c) { c !== null && i(c); }); }
}
const Qp = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 }, p1 = typeof URLSearchParams < "u" ? URLSearchParams : su, g1 = typeof FormData < "u" ? FormData : null, b1 = typeof Blob < "u" ? Blob : null, y1 = { isBrowser: !0, classes: { URLSearchParams: p1, FormData: g1, Blob: b1 }, protocols: ["http", "https", "file", "blob", "url", "data"] }, au = typeof window < "u" && typeof document < "u", Kd = typeof navigator == "object" && navigator || void 0, v1 = au && (!Kd || ["ReactNative", "NativeScript", "NS"].indexOf(Kd.product) < 0), j1 = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function", N1 = au && window.location.href || "http://localhost", w1 = Object.freeze(Object.defineProperty({ __proto__: null, hasBrowserEnv: au, hasStandardBrowserEnv: v1, hasStandardBrowserWebWorkerEnv: j1, navigator: Kd, origin: N1 }, Symbol.toStringTag, { value: "Module" })), ft = { ...w1, ...y1 };
function S1(l, i) { return Rr(l, new ft.classes.URLSearchParams, { visitor: function (r, c, u, m) { return ft.isNode && z.isBuffer(r) ? (this.append(c, r.toString("base64")), !1) : m.defaultVisitor.apply(this, arguments); }, ...i }); }
function k1(l) { return z.matchAll(/\w+|\[(\w*)]/g, l).map(i => i[0] === "[]" ? "" : i[1] || i[0]); }
function C1(l) { const i = {}, r = Object.keys(l); let c; const u = r.length; let m; for (c = 0; c < u; c++)
    m = r[c], i[m] = l[m]; return i; }
function Kp(l) { function i(r, c, u, m) { let h = r[m++]; if (h === "__proto__")
    return !0; const p = Number.isFinite(+h), b = m >= r.length; return h = !h && z.isArray(u) ? u.length : h, b ? (z.hasOwnProp(u, h) ? u[h] = [u[h], c] : u[h] = c, !p) : ((!u[h] || !z.isObject(u[h])) && (u[h] = []), i(r, c, u[h], m) && z.isArray(u[h]) && (u[h] = C1(u[h])), !p); } if (z.isFormData(l) && z.isFunction(l.entries)) {
    const r = {};
    return z.forEachEntry(l, (c, u) => { i(k1(c), u, r, 0); }), r;
} return null; }
function A1(l, i, r) { if (z.isString(l))
    try {
        return (i || JSON.parse)(l), z.trim(l);
    }
    catch (c) {
        if (c.name !== "SyntaxError")
            throw c;
    } return (r || JSON.stringify)(l); }
const Bn = { transitional: Qp, adapter: ["xhr", "http", "fetch"], transformRequest: [function (i, r) { const c = r.getContentType() || "", u = c.indexOf("application/json") > -1, m = z.isObject(i); if (m && z.isHTMLForm(i) && (i = new FormData(i)), z.isFormData(i))
            return u ? JSON.stringify(Kp(i)) : i; if (z.isArrayBuffer(i) || z.isBuffer(i) || z.isStream(i) || z.isFile(i) || z.isBlob(i) || z.isReadableStream(i))
            return i; if (z.isArrayBufferView(i))
            return i.buffer; if (z.isURLSearchParams(i))
            return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), i.toString(); let p; if (m) {
            if (c.indexOf("application/x-www-form-urlencoded") > -1)
                return S1(i, this.formSerializer).toString();
            if ((p = z.isFileList(i)) || c.indexOf("multipart/form-data") > -1) {
                const b = this.env && this.env.FormData;
                return Rr(p ? { "files[]": i } : i, b && new b, this.formSerializer);
            }
        } return m || u ? (r.setContentType("application/json", !1), A1(i)) : i; }], transformResponse: [function (i) { const r = this.transitional || Bn.transitional, c = r && r.forcedJSONParsing, u = this.responseType === "json"; if (z.isResponse(i) || z.isReadableStream(i))
            return i; if (i && z.isString(i) && (c && !this.responseType || u)) {
            const h = !(r && r.silentJSONParsing) && u;
            try {
                return JSON.parse(i, this.parseReviver);
            }
            catch (p) {
                if (h)
                    throw p.name === "SyntaxError" ? re.from(p, re.ERR_BAD_RESPONSE, this, null, this.response) : p;
            }
        } return i; }], timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, maxBodyLength: -1, env: { FormData: ft.classes.FormData, Blob: ft.classes.Blob }, validateStatus: function (i) { return i >= 200 && i < 300; }, headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } } };
z.forEach(["delete", "get", "head", "post", "put", "patch"], l => { Bn.headers[l] = {}; });
const T1 = z.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]), E1 = l => {
    const i = {};
    let r, c, u;
    return l && l.split(`
`).forEach(function (h) { u = h.indexOf(":"), r = h.substring(0, u).trim().toLowerCase(), c = h.substring(u + 1).trim(), !(!r || i[r] && T1[r]) && (r === "set-cookie" ? i[r] ? i[r].push(c) : i[r] = [c] : i[r] = i[r] ? i[r] + ", " + c : c); }), i;
}, Bx = Symbol("internals");
function Tn(l) { return l && String(l).trim().toLowerCase(); }
function xr(l) { return l === !1 || l == null ? l : z.isArray(l) ? l.map(xr) : String(l); }
function M1(l) { const i = Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; let c; for (; c = r.exec(l);)
    i[c[1]] = c[2]; return i; }
const _1 = l => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(l.trim());
function jd(l, i, r, c, u) { if (z.isFunction(c))
    return c.call(this, i, r); if (u && (i = r), !!z.isString(i)) {
    if (z.isString(c))
        return i.indexOf(c) !== -1;
    if (z.isRegExp(c))
        return c.test(i);
} }
function O1(l) { return l.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (i, r, c) => r.toUpperCase() + c); }
function D1(l, i) { const r = z.toCamelCase(" " + i); ["get", "set", "has"].forEach(c => { Object.defineProperty(l, c + r, { value: function (u, m, h) { return this[c].call(this, i, u, m, h); }, configurable: !0 }); }); }
let wt = class {
    constructor(i) { i && this.set(i); }
    set(i, r, c) { const u = this; function m(p, b, y) { const v = Tn(b); if (!v)
        throw new Error("header name must be a non-empty string"); const g = z.findKey(u, v); (!g || u[g] === void 0 || y === !0 || y === void 0 && u[g] !== !1) && (u[g || b] = xr(p)); } const h = (p, b) => z.forEach(p, (y, v) => m(y, v, b)); if (z.isPlainObject(i) || i instanceof this.constructor)
        h(i, r);
    else if (z.isString(i) && (i = i.trim()) && !_1(i))
        h(E1(i), r);
    else if (z.isObject(i) && z.isIterable(i)) {
        let p = {}, b, y;
        for (const v of i) {
            if (!z.isArray(v))
                throw TypeError("Object iterator must return a key-value pair");
            p[y = v[0]] = (b = p[y]) ? z.isArray(b) ? [...b, v[1]] : [b, v[1]] : v[1];
        }
        h(p, r);
    }
    else
        i != null && m(r, i, c); return this; }
    get(i, r) { if (i = Tn(i), i) {
        const c = z.findKey(this, i);
        if (c) {
            const u = this[c];
            if (!r)
                return u;
            if (r === !0)
                return M1(u);
            if (z.isFunction(r))
                return r.call(this, u, c);
            if (z.isRegExp(r))
                return r.exec(u);
            throw new TypeError("parser must be boolean|regexp|function");
        }
    } }
    has(i, r) { if (i = Tn(i), i) {
        const c = z.findKey(this, i);
        return !!(c && this[c] !== void 0 && (!r || jd(this, this[c], c, r)));
    } return !1; }
    delete(i, r) { const c = this; let u = !1; function m(h) { if (h = Tn(h), h) {
        const p = z.findKey(c, h);
        p && (!r || jd(c, c[p], p, r)) && (delete c[p], u = !0);
    } } return z.isArray(i) ? i.forEach(m) : m(i), u; }
    clear(i) { const r = Object.keys(this); let c = r.length, u = !1; for (; c--;) {
        const m = r[c];
        (!i || jd(this, this[m], m, i, !0)) && (delete this[m], u = !0);
    } return u; }
    normalize(i) { const r = this, c = {}; return z.forEach(this, (u, m) => { const h = z.findKey(c, m); if (h) {
        r[h] = xr(u), delete r[m];
        return;
    } const p = i ? O1(m) : String(m).trim(); p !== m && delete r[m], r[p] = xr(u), c[p] = !0; }), this; }
    concat(...i) { return this.constructor.concat(this, ...i); }
    toJSON(i) { const r = Object.create(null); return z.forEach(this, (c, u) => { c != null && c !== !1 && (r[u] = i && z.isArray(c) ? c.join(", ") : c); }), r; }
    [Symbol.iterator]() { return Object.entries(this.toJSON())[Symbol.iterator](); }
    toString() {
        return Object.entries(this.toJSON()).map(([i, r]) => i + ": " + r).join(`
`);
    }
    getSetCookie() { return this.get("set-cookie") || []; }
    get [Symbol.toStringTag]() { return "AxiosHeaders"; }
    static from(i) { return i instanceof this ? i : new this(i); }
    static concat(i, ...r) { const c = new this(i); return r.forEach(u => c.set(u)), c; }
    static accessor(i) { const c = (this[Bx] = this[Bx] = { accessors: {} }).accessors, u = this.prototype; function m(h) { const p = Tn(h); c[p] || (D1(u, h), c[p] = !0); } return z.isArray(i) ? i.forEach(m) : m(i), this; }
};
wt.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
z.reduceDescriptors(wt.prototype, ({ value: l }, i) => { let r = i[0].toUpperCase() + i.slice(1); return { get: () => l, set(c) { this[r] = c; } }; });
z.freezeMethods(wt);
function Nd(l, i) { const r = this || Bn, c = i || r, u = wt.from(c.headers); let m = c.data; return z.forEach(l, function (p) { m = p.call(r, m, u.normalize(), i ? i.status : void 0); }), u.normalize(), m; }
function Yp(l) { return !!(l && l.__CANCEL__); }
function Ml(l, i, r) { re.call(this, l ?? "canceled", re.ERR_CANCELED, i, r), this.name = "CanceledError"; }
z.inherits(Ml, re, { __CANCEL__: !0 });
function Xp(l, i, r) { const c = r.config.validateStatus; !r.status || !c || c(r.status) ? l(r) : i(new re("Request failed with status code " + r.status, [re.ERR_BAD_REQUEST, re.ERR_BAD_RESPONSE][Math.floor(r.status / 100) - 4], r.config, r.request, r)); }
function z1(l) { const i = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l); return i && i[1] || ""; }
function R1(l, i) { l = l || 10; const r = new Array(l), c = new Array(l); let u = 0, m = 0, h; return i = i !== void 0 ? i : 1e3, function (b) { const y = Date.now(), v = c[m]; h || (h = y), r[u] = b, c[u] = y; let g = m, k = 0; for (; g !== u;)
    k += r[g++], g = g % l; if (u = (u + 1) % l, u === m && (m = (m + 1) % l), y - h < i)
    return; const C = v && y - v; return C ? Math.round(k * 1e3 / C) : void 0; }; }
function q1(l, i) { let r = 0, c = 1e3 / i, u, m; const h = (y, v = Date.now()) => { r = v, u = null, m && (clearTimeout(m), m = null), l(...y); }; return [(...y) => { const v = Date.now(), g = v - r; g >= c ? h(y, v) : (u = y, m || (m = setTimeout(() => { m = null, h(u); }, c - g))); }, () => u && h(u)]; }
const yr = (l, i, r = 3) => { let c = 0; const u = R1(50, 250); return q1(m => { const h = m.loaded, p = m.lengthComputable ? m.total : void 0, b = h - c, y = u(b), v = h <= p; c = h; const g = { loaded: h, total: p, progress: p ? h / p : void 0, bytes: b, rate: y || void 0, estimated: y && p && v ? (p - h) / y : void 0, event: m, lengthComputable: p != null, [i ? "download" : "upload"]: !0 }; l(g); }, r); }, Ux = (l, i) => { const r = l != null; return [c => i[0]({ lengthComputable: r, total: l, loaded: c }), i[1]]; }, Lx = l => (...i) => z.asap(() => l(...i)), B1 = ft.hasStandardBrowserEnv ? ((l, i) => r => (r = new URL(r, ft.origin), l.protocol === r.protocol && l.host === r.host && (i || l.port === r.port)))(new URL(ft.origin), ft.navigator && /(msie|trident)/i.test(ft.navigator.userAgent)) : () => !0, U1 = ft.hasStandardBrowserEnv ? { write(l, i, r, c, u, m, h) { if (typeof document > "u")
        return; const p = [`${l}=${encodeURIComponent(i)}`]; z.isNumber(r) && p.push(`expires=${new Date(r).toUTCString()}`), z.isString(c) && p.push(`path=${c}`), z.isString(u) && p.push(`domain=${u}`), m === !0 && p.push("secure"), z.isString(h) && p.push(`SameSite=${h}`), document.cookie = p.join("; "); }, read(l) { if (typeof document > "u")
        return null; const i = document.cookie.match(new RegExp("(?:^|; )" + l + "=([^;]*)")); return i ? decodeURIComponent(i[1]) : null; }, remove(l) { this.write(l, "", Date.now() - 864e5, "/"); } } : { write() { }, read() { return null; }, remove() { } };
function L1(l) { return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(l); }
function H1(l, i) { return i ? l.replace(/\/?\/$/, "") + "/" + i.replace(/^\/+/, "") : l; }
function Zp(l, i, r) { let c = !L1(i); return l && (c || r == !1) ? H1(l, i) : i; }
const Hx = l => l instanceof wt ? { ...l } : l;
function qa(l, i) { i = i || {}; const r = {}; function c(y, v, g, k) { return z.isPlainObject(y) && z.isPlainObject(v) ? z.merge.call({ caseless: k }, y, v) : z.isPlainObject(v) ? z.merge({}, v) : z.isArray(v) ? v.slice() : v; } function u(y, v, g, k) { if (z.isUndefined(v)) {
    if (!z.isUndefined(y))
        return c(void 0, y, g, k);
}
else
    return c(y, v, g, k); } function m(y, v) { if (!z.isUndefined(v))
    return c(void 0, v); } function h(y, v) { if (z.isUndefined(v)) {
    if (!z.isUndefined(y))
        return c(void 0, y);
}
else
    return c(void 0, v); } function p(y, v, g) { if (g in i)
    return c(y, v); if (g in l)
    return c(void 0, y); } const b = { url: m, method: m, data: m, baseURL: h, transformRequest: h, transformResponse: h, paramsSerializer: h, timeout: h, timeoutMessage: h, withCredentials: h, withXSRFToken: h, adapter: h, responseType: h, xsrfCookieName: h, xsrfHeaderName: h, onUploadProgress: h, onDownloadProgress: h, decompress: h, maxContentLength: h, maxBodyLength: h, beforeRedirect: h, transport: h, httpAgent: h, httpsAgent: h, cancelToken: h, socketPath: h, responseEncoding: h, validateStatus: p, headers: (y, v, g) => u(Hx(y), Hx(v), g, !0) }; return z.forEach(Object.keys({ ...l, ...i }), function (v) { const g = b[v] || u, k = g(l[v], i[v], v); z.isUndefined(k) && g !== p || (r[v] = k); }), r; }
const Jp = l => { const i = qa({}, l); let { data: r, withXSRFToken: c, xsrfHeaderName: u, xsrfCookieName: m, headers: h, auth: p } = i; if (i.headers = h = wt.from(h), i.url = Gp(Zp(i.baseURL, i.url, i.allowAbsoluteUrls), l.params, l.paramsSerializer), p && h.set("Authorization", "Basic " + btoa((p.username || "") + ":" + (p.password ? unescape(encodeURIComponent(p.password)) : ""))), z.isFormData(r)) {
    if (ft.hasStandardBrowserEnv || ft.hasStandardBrowserWebWorkerEnv)
        h.setContentType(void 0);
    else if (z.isFunction(r.getHeaders)) {
        const b = r.getHeaders(), y = ["content-type", "content-length"];
        Object.entries(b).forEach(([v, g]) => { y.includes(v.toLowerCase()) && h.set(v, g); });
    }
} if (ft.hasStandardBrowserEnv && (c && z.isFunction(c) && (c = c(i)), c || c !== !1 && B1(i.url))) {
    const b = u && m && U1.read(m);
    b && h.set(u, b);
} return i; }, V1 = typeof XMLHttpRequest < "u", G1 = V1 && function (l) { return new Promise(function (r, c) { const u = Jp(l); let m = u.data; const h = wt.from(u.headers).normalize(); let { responseType: p, onUploadProgress: b, onDownloadProgress: y } = u, v, g, k, C, j; function w() { C && C(), j && j(), u.cancelToken && u.cancelToken.unsubscribe(v), u.signal && u.signal.removeEventListener("abort", v); } let T = new XMLHttpRequest; T.open(u.method.toUpperCase(), u.url, !0), T.timeout = u.timeout; function K() { if (!T)
    return; const V = wt.from("getAllResponseHeaders" in T && T.getAllResponseHeaders()), D = { data: !p || p === "text" || p === "json" ? T.responseText : T.response, status: T.status, statusText: T.statusText, headers: V, config: l, request: T }; Xp(function (q) { r(q), w(); }, function (q) { c(q), w(); }, D), T = null; } "onloadend" in T ? T.onloadend = K : T.onreadystatechange = function () { !T || T.readyState !== 4 || T.status === 0 && !(T.responseURL && T.responseURL.indexOf("file:") === 0) || setTimeout(K); }, T.onabort = function () { T && (c(new re("Request aborted", re.ECONNABORTED, l, T)), T = null); }, T.onerror = function ($) { const D = $ && $.message ? $.message : "Network Error", G = new re(D, re.ERR_NETWORK, l, T); G.event = $ || null, c(G), T = null; }, T.ontimeout = function () { let $ = u.timeout ? "timeout of " + u.timeout + "ms exceeded" : "timeout exceeded"; const D = u.transitional || Qp; u.timeoutErrorMessage && ($ = u.timeoutErrorMessage), c(new re($, D.clarifyTimeoutError ? re.ETIMEDOUT : re.ECONNABORTED, l, T)), T = null; }, m === void 0 && h.setContentType(null), "setRequestHeader" in T && z.forEach(h.toJSON(), function ($, D) { T.setRequestHeader(D, $); }), z.isUndefined(u.withCredentials) || (T.withCredentials = !!u.withCredentials), p && p !== "json" && (T.responseType = u.responseType), y && ([k, j] = yr(y, !0), T.addEventListener("progress", k)), b && T.upload && ([g, C] = yr(b), T.upload.addEventListener("progress", g), T.upload.addEventListener("loadend", C)), (u.cancelToken || u.signal) && (v = V => { T && (c(!V || V.type ? new Ml(null, l, T) : V), T.abort(), T = null); }, u.cancelToken && u.cancelToken.subscribe(v), u.signal && (u.signal.aborted ? v() : u.signal.addEventListener("abort", v))); const Z = z1(u.url); if (Z && ft.protocols.indexOf(Z) === -1) {
    c(new re("Unsupported protocol " + Z + ":", re.ERR_BAD_REQUEST, l));
    return;
} T.send(m || null); }); }, Q1 = (l, i) => { const { length: r } = l = l ? l.filter(Boolean) : []; if (i || r) {
    let c = new AbortController, u;
    const m = function (y) { if (!u) {
        u = !0, p();
        const v = y instanceof Error ? y : this.reason;
        c.abort(v instanceof re ? v : new Ml(v instanceof Error ? v.message : v));
    } };
    let h = i && setTimeout(() => { h = null, m(new re(`timeout ${i} of ms exceeded`, re.ETIMEDOUT)); }, i);
    const p = () => { l && (h && clearTimeout(h), h = null, l.forEach(y => { y.unsubscribe ? y.unsubscribe(m) : y.removeEventListener("abort", m); }), l = null); };
    l.forEach(y => y.addEventListener("abort", m));
    const { signal: b } = c;
    return b.unsubscribe = () => z.asap(p), b;
} }, K1 = function* (l, i) { let r = l.byteLength; if (r < i) {
    yield l;
    return;
} let c = 0, u; for (; c < r;)
    u = c + i, yield l.slice(c, u), c = u; }, Y1 = async function* (l, i) { for await (const r of X1(l))
    yield* K1(r, i); }, X1 = async function* (l) { if (l[Symbol.asyncIterator]) {
    yield* l;
    return;
} const i = l.getReader(); try {
    for (;;) {
        const { done: r, value: c } = await i.read();
        if (r)
            break;
        yield c;
    }
}
finally {
    await i.cancel();
} }, Vx = (l, i, r, c) => { const u = Y1(l, i); let m = 0, h, p = b => { h || (h = !0, c && c(b)); }; return new ReadableStream({ async pull(b) { try {
        const { done: y, value: v } = await u.next();
        if (y) {
            p(), b.close();
            return;
        }
        let g = v.byteLength;
        if (r) {
            let k = m += g;
            r(k);
        }
        b.enqueue(new Uint8Array(v));
    }
    catch (y) {
        throw p(y), y;
    } }, cancel(b) { return p(b), u.return(); } }, { highWaterMark: 2 }); }, Gx = 64 * 1024, { isFunction: ir } = z, Z1 = (({ Request: l, Response: i }) => ({ Request: l, Response: i }))(z.global), { ReadableStream: Qx, TextEncoder: Kx } = z.global, Yx = (l, ...i) => { try {
    return !!l(...i);
}
catch {
    return !1;
} }, J1 = l => { l = z.merge.call({ skipUndefined: !0 }, Z1, l); const { fetch: i, Request: r, Response: c } = l, u = i ? ir(i) : typeof fetch == "function", m = ir(r), h = ir(c); if (!u)
    return !1; const p = u && ir(Qx), b = u && (typeof Kx == "function" ? (j => w => j.encode(w))(new Kx) : async (j) => new Uint8Array(await new r(j).arrayBuffer())), y = m && p && Yx(() => { let j = !1; const w = new r(ft.origin, { body: new Qx, method: "POST", get duplex() { return j = !0, "half"; } }).headers.has("Content-Type"); return j && !w; }), v = h && p && Yx(() => z.isReadableStream(new c("").body)), g = { stream: v && (j => j.body) }; u && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach(j => { !g[j] && (g[j] = (w, T) => { let K = w && w[j]; if (K)
    return K.call(w); throw new re(`Response type '${j}' is not supported`, re.ERR_NOT_SUPPORT, T); }); }); const k = async (j) => { if (j == null)
    return 0; if (z.isBlob(j))
    return j.size; if (z.isSpecCompliantForm(j))
    return (await new r(ft.origin, { method: "POST", body: j }).arrayBuffer()).byteLength; if (z.isArrayBufferView(j) || z.isArrayBuffer(j))
    return j.byteLength; if (z.isURLSearchParams(j) && (j = j + ""), z.isString(j))
    return (await b(j)).byteLength; }, C = async (j, w) => { const T = z.toFiniteNumber(j.getContentLength()); return T ?? k(w); }; return async (j) => { let { url: w, method: T, data: K, signal: Z, cancelToken: V, timeout: $, onDownloadProgress: D, onUploadProgress: G, responseType: q, headers: Y, withCredentials: de = "same-origin", fetchOptions: it } = Jp(j), Ge = i || fetch; q = q ? (q + "").toLowerCase() : "text"; let Se = Q1([Z, V && V.toAbortSignal()], $), We = null; const Je = Se && Se.unsubscribe && (() => { Se.unsubscribe(); }); let Ue; try {
    if (G && y && T !== "get" && T !== "head" && (Ue = await C(Y, K)) !== 0) {
        let we = new r(w, { method: "POST", body: K, duplex: "half" }), ne;
        if (z.isFormData(K) && (ne = we.headers.get("content-type")) && Y.setContentType(ne), we.body) {
            const [se, me] = Ux(Ue, yr(Lx(G)));
            K = Vx(we.body, Gx, se, me);
        }
    }
    z.isString(de) || (de = de ? "include" : "omit");
    const E = m && "credentials" in r.prototype, J = { ...it, signal: Se, method: T.toUpperCase(), headers: Y.normalize().toJSON(), body: K, duplex: "half", credentials: E ? de : void 0 };
    We = m && new r(w, J);
    let Q = await (m ? Ge(We, it) : Ge(w, J));
    const xe = v && (q === "stream" || q === "response");
    if (v && (D || xe && Je)) {
        const we = {};
        ["status", "statusText", "headers"].forEach(et => { we[et] = Q[et]; });
        const ne = z.toFiniteNumber(Q.headers.get("content-length")), [se, me] = D && Ux(ne, yr(Lx(D), !0)) || [];
        Q = new c(Vx(Q.body, Gx, se, () => { me && me(), Je && Je(); }), we);
    }
    q = q || "text";
    let ue = await g[z.findKey(g, q) || "text"](Q, j);
    return !xe && Je && Je(), await new Promise((we, ne) => { Xp(we, ne, { data: ue, headers: wt.from(Q.headers), status: Q.status, statusText: Q.statusText, config: j, request: We }); });
}
catch (E) {
    throw Je && Je(), E && E.name === "TypeError" && /Load failed|fetch/i.test(E.message) ? Object.assign(new re("Network Error", re.ERR_NETWORK, j, We), { cause: E.cause || E }) : re.from(E, E && E.code, j, We);
} }; }, F1 = new Map, Fp = l => { let i = l && l.env || {}; const { fetch: r, Request: c, Response: u } = i, m = [c, u, r]; let h = m.length, p = h, b, y, v = F1; for (; p--;)
    b = m[p], y = v.get(b), y === void 0 && v.set(b, y = p ? new Map : J1(i)), v = y; return y; };
Fp();
const lu = { http: m1, xhr: G1, fetch: { get: Fp } };
z.forEach(lu, (l, i) => { if (l) {
    try {
        Object.defineProperty(l, "name", { value: i });
    }
    catch { }
    Object.defineProperty(l, "adapterName", { value: i });
} });
const Xx = l => `- ${l}`, $1 = l => z.isFunction(l) || l === null || l === !1;
function P1(l, i) {
    l = z.isArray(l) ? l : [l];
    const { length: r } = l;
    let c, u;
    const m = {};
    for (let h = 0; h < r; h++) {
        c = l[h];
        let p;
        if (u = c, !$1(c) && (u = lu[(p = String(c)).toLowerCase()], u === void 0))
            throw new re(`Unknown adapter '${p}'`);
        if (u && (z.isFunction(u) || (u = u.get(i))))
            break;
        m[p || "#" + h] = u;
    }
    if (!u) {
        const h = Object.entries(m).map(([b, y]) => `adapter ${b} ` + (y === !1 ? "is not supported by the environment" : "is not available in the build"));
        let p = r ? h.length > 1 ? `since :
` + h.map(Xx).join(`
`) : " " + Xx(h[0]) : "as no adapter specified";
        throw new re("There is no suitable adapter to dispatch the request " + p, "ERR_NOT_SUPPORT");
    }
    return u;
}
const $p = { getAdapter: P1, adapters: lu };
function wd(l) { if (l.cancelToken && l.cancelToken.throwIfRequested(), l.signal && l.signal.aborted)
    throw new Ml(null, l); }
function Zx(l) { return wd(l), l.headers = wt.from(l.headers), l.data = Nd.call(l, l.transformRequest), ["post", "put", "patch"].indexOf(l.method) !== -1 && l.headers.setContentType("application/x-www-form-urlencoded", !1), $p.getAdapter(l.adapter || Bn.adapter, l)(l).then(function (c) { return wd(l), c.data = Nd.call(l, l.transformResponse, c), c.headers = wt.from(c.headers), c; }, function (c) { return Yp(c) || (wd(l), c && c.response && (c.response.data = Nd.call(l, l.transformResponse, c.response), c.response.headers = wt.from(c.response.headers))), Promise.reject(c); }); }
const Pp = "1.13.2", qr = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((l, i) => { qr[l] = function (c) { return typeof c === l || "a" + (i < 1 ? "n " : " ") + l; }; });
const Jx = {};
qr.transitional = function (i, r, c) { function u(m, h) { return "[Axios v" + Pp + "] Transitional option '" + m + "'" + h + (c ? ". " + c : ""); } return (m, h, p) => { if (i === !1)
    throw new re(u(h, " has been removed" + (r ? " in " + r : "")), re.ERR_DEPRECATED); return r && !Jx[h] && (Jx[h] = !0, console.warn(u(h, " has been deprecated since v" + r + " and will be removed in the near future"))), i ? i(m, h, p) : !0; }; };
qr.spelling = function (i) { return (r, c) => (console.warn(`${c} is likely a misspelling of ${i}`), !0); };
function I1(l, i, r) { if (typeof l != "object")
    throw new re("options must be an object", re.ERR_BAD_OPTION_VALUE); const c = Object.keys(l); let u = c.length; for (; u-- > 0;) {
    const m = c[u], h = i[m];
    if (h) {
        const p = l[m], b = p === void 0 || h(p, m, l);
        if (b !== !0)
            throw new re("option " + m + " must be " + b, re.ERR_BAD_OPTION_VALUE);
        continue;
    }
    if (r !== !0)
        throw new re("Unknown option " + m, re.ERR_BAD_OPTION);
} }
const pr = { assertOptions: I1, validators: qr }, ds = pr.validators;
let Ra = class {
    constructor(i) { this.defaults = i || {}, this.interceptors = { request: new qx, response: new qx }; }
    async request(i, r) {
        try {
            return await this._request(i, r);
        }
        catch (c) {
            if (c instanceof Error) {
                let u = {};
                Error.captureStackTrace ? Error.captureStackTrace(u) : u = new Error;
                const m = u.stack ? u.stack.replace(/^.+\n/, "") : "";
                try {
                    c.stack ? m && !String(c.stack).endsWith(m.replace(/^.+\n.+\n/, "")) && (c.stack += `
` + m) : c.stack = m;
                }
                catch { }
            }
            throw c;
        }
    }
    _request(i, r) { typeof i == "string" ? (r = r || {}, r.url = i) : r = i || {}, r = qa(this.defaults, r); const { transitional: c, paramsSerializer: u, headers: m } = r; c !== void 0 && pr.assertOptions(c, { silentJSONParsing: ds.transitional(ds.boolean), forcedJSONParsing: ds.transitional(ds.boolean), clarifyTimeoutError: ds.transitional(ds.boolean) }, !1), u != null && (z.isFunction(u) ? r.paramsSerializer = { serialize: u } : pr.assertOptions(u, { encode: ds.function, serialize: ds.function }, !0)), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), pr.assertOptions(r, { baseUrl: ds.spelling("baseURL"), withXsrfToken: ds.spelling("withXSRFToken") }, !0), r.method = (r.method || this.defaults.method || "get").toLowerCase(); let h = m && z.merge(m.common, m[r.method]); m && z.forEach(["delete", "get", "head", "post", "put", "patch", "common"], j => { delete m[j]; }), r.headers = wt.concat(h, m); const p = []; let b = !0; this.interceptors.request.forEach(function (w) { typeof w.runWhen == "function" && w.runWhen(r) === !1 || (b = b && w.synchronous, p.unshift(w.fulfilled, w.rejected)); }); const y = []; this.interceptors.response.forEach(function (w) { y.push(w.fulfilled, w.rejected); }); let v, g = 0, k; if (!b) {
        const j = [Zx.bind(this), void 0];
        for (j.unshift(...p), j.push(...y), k = j.length, v = Promise.resolve(r); g < k;)
            v = v.then(j[g++], j[g++]);
        return v;
    } k = p.length; let C = r; for (; g < k;) {
        const j = p[g++], w = p[g++];
        try {
            C = j(C);
        }
        catch (T) {
            w.call(this, T);
            break;
        }
    } try {
        v = Zx.call(this, C);
    }
    catch (j) {
        return Promise.reject(j);
    } for (g = 0, k = y.length; g < k;)
        v = v.then(y[g++], y[g++]); return v; }
    getUri(i) { i = qa(this.defaults, i); const r = Zp(i.baseURL, i.url, i.allowAbsoluteUrls); return Gp(r, i.params, i.paramsSerializer); }
};
z.forEach(["delete", "get", "head", "options"], function (i) { Ra.prototype[i] = function (r, c) { return this.request(qa(c || {}, { method: i, url: r, data: (c || {}).data })); }; });
z.forEach(["post", "put", "patch"], function (i) { function r(c) { return function (m, h, p) { return this.request(qa(p || {}, { method: i, headers: c ? { "Content-Type": "multipart/form-data" } : {}, url: m, data: h })); }; } Ra.prototype[i] = r(), Ra.prototype[i + "Form"] = r(!0); });
let W1 = class Ip {
    constructor(i) { if (typeof i != "function")
        throw new TypeError("executor must be a function."); let r; this.promise = new Promise(function (m) { r = m; }); const c = this; this.promise.then(u => { if (!c._listeners)
        return; let m = c._listeners.length; for (; m-- > 0;)
        c._listeners[m](u); c._listeners = null; }), this.promise.then = u => { let m; const h = new Promise(p => { c.subscribe(p), m = p; }).then(u); return h.cancel = function () { c.unsubscribe(m); }, h; }, i(function (m, h, p) { c.reason || (c.reason = new Ml(m, h, p), r(c.reason)); }); }
    throwIfRequested() { if (this.reason)
        throw this.reason; }
    subscribe(i) { if (this.reason) {
        i(this.reason);
        return;
    } this._listeners ? this._listeners.push(i) : this._listeners = [i]; }
    unsubscribe(i) { if (!this._listeners)
        return; const r = this._listeners.indexOf(i); r !== -1 && this._listeners.splice(r, 1); }
    toAbortSignal() { const i = new AbortController, r = c => { i.abort(c); }; return this.subscribe(r), i.signal.unsubscribe = () => this.unsubscribe(r), i.signal; }
    static source() { let i; return { token: new Ip(function (u) { i = u; }), cancel: i }; }
};
function ej(l) { return function (r) { return l.apply(null, r); }; }
function tj(l) { return z.isObject(l) && l.isAxiosError === !0; }
const Yd = { Continue: 100, SwitchingProtocols: 101, Processing: 102, EarlyHints: 103, Ok: 200, Created: 201, Accepted: 202, NonAuthoritativeInformation: 203, NoContent: 204, ResetContent: 205, PartialContent: 206, MultiStatus: 207, AlreadyReported: 208, ImUsed: 226, MultipleChoices: 300, MovedPermanently: 301, Found: 302, SeeOther: 303, NotModified: 304, UseProxy: 305, Unused: 306, TemporaryRedirect: 307, PermanentRedirect: 308, BadRequest: 400, Unauthorized: 401, PaymentRequired: 402, Forbidden: 403, NotFound: 404, MethodNotAllowed: 405, NotAcceptable: 406, ProxyAuthenticationRequired: 407, RequestTimeout: 408, Conflict: 409, Gone: 410, LengthRequired: 411, PreconditionFailed: 412, PayloadTooLarge: 413, UriTooLong: 414, UnsupportedMediaType: 415, RangeNotSatisfiable: 416, ExpectationFailed: 417, ImATeapot: 418, MisdirectedRequest: 421, UnprocessableEntity: 422, Locked: 423, FailedDependency: 424, TooEarly: 425, UpgradeRequired: 426, PreconditionRequired: 428, TooManyRequests: 429, RequestHeaderFieldsTooLarge: 431, UnavailableForLegalReasons: 451, InternalServerError: 500, NotImplemented: 501, BadGateway: 502, ServiceUnavailable: 503, GatewayTimeout: 504, HttpVersionNotSupported: 505, VariantAlsoNegotiates: 506, InsufficientStorage: 507, LoopDetected: 508, NotExtended: 510, NetworkAuthenticationRequired: 511, WebServerIsDown: 521, ConnectionTimedOut: 522, OriginIsUnreachable: 523, TimeoutOccurred: 524, SslHandshakeFailed: 525, InvalidSslCertificate: 526 };
Object.entries(Yd).forEach(([l, i]) => { Yd[i] = l; });
function Wp(l) { const i = new Ra(l), r = Mp(Ra.prototype.request, i); return z.extend(r, Ra.prototype, i, { allOwnKeys: !0 }), z.extend(r, i, null, { allOwnKeys: !0 }), r.create = function (u) { return Wp(qa(l, u)); }, r; }
const Ve = Wp(Bn);
Ve.Axios = Ra;
Ve.CanceledError = Ml;
Ve.CancelToken = W1;
Ve.isCancel = Yp;
Ve.VERSION = Pp;
Ve.toFormData = Rr;
Ve.AxiosError = re;
Ve.Cancel = Ve.CanceledError;
Ve.all = function (i) { return Promise.all(i); };
Ve.spread = ej;
Ve.isAxiosError = tj;
Ve.mergeConfig = qa;
Ve.AxiosHeaders = wt;
Ve.formToJSON = l => Kp(z.isHTMLForm(l) ? new FormData(l) : l);
Ve.getAdapter = $p.getAdapter;
Ve.HttpStatusCode = Yd;
Ve.default = Ve;
const { Axios: v4, AxiosError: j4, CanceledError: N4, isCancel: w4, CancelToken: S4, VERSION: k4, all: C4, Cancel: A4, isAxiosError: T4, spread: E4, toFormData: M4, AxiosHeaders: _4, HttpStatusCode: O4, formToJSON: D4, getAdapter: z4, mergeConfig: R4 } = Ve, sj = "/api";
function aj(l) { return l.replace(/_([a-z])/g, (i, r) => r.toUpperCase()); }
function Xd(l) { if (Array.isArray(l))
    return l.map(Xd); if (l !== null && typeof l == "object" && !(l instanceof Date)) {
    const i = {};
    for (const [r, c] of Object.entries(l)) {
        const u = aj(r);
        i[u] = Xd(c);
    }
    return i;
} return l; }
const le = Ve.create({ baseURL: sj, headers: { "Content-Type": "application/json" } });
le.interceptors.request.use(l => { const i = fs.getState().token; return i && (l.headers.Authorization = `Bearer ${i}`), l; }, l => Promise.reject(l));
le.interceptors.response.use(l => (l.data && (l.data = Xd(l.data)), l), l => { var i; return ((i = l.response) == null ? void 0 : i.status) === 401 && (fs.getState().logout(), window.location.href = "/v2/login"), Promise.reject(l); });
const eg = { login: (l, i) => le.post("/auth/login", { username: l, password: i }), verify: () => le.get("/auth/verify"), logout: () => le.post("/auth/logout") }, Br = { getAll: () => le.get("/projects"), getById: l => le.get(`/projects/${l}`), create: l => le.post("/projects", l), update: (l, i) => le.put(`/projects/${l}`, i), delete: l => le.delete(`/projects/${l}`), checkCode: l => le.get(`/projects/check-code/${l}`) }, nu = { getByProject: l => le.get(`/projects/${l}/epics`), create: (l, i) => le.post(`/projects/${l}/epics`, i), update: (l, i) => le.put(`/epics/${l}`, i), delete: l => le.delete(`/epics/${l}`) }, iu = { getByProject: l => le.get(`/projects/${l}/sprints`), create: (l, i) => le.post(`/projects/${l}/sprints`, i), update: (l, i) => le.put(`/sprints/${l}`, i), delete: l => le.delete(`/sprints/${l}`) }, ns = { getAll: l => le.get("/tasks", { params: l }), getById: l => le.get(`/tasks/${l}`), create: l => le.post("/tasks", l), update: (l, i) => le.put(`/tasks/${l}`, i), complete: (l, i) => le.put(`/tasks/${l}/complete`, { notes: i }), delete: l => le.delete(`/tasks/${l}`), getItems: l => le.get(`/tasks/${l}/items`), createItems: (l, i) => le.post(`/tasks/${l}/items`, { items: i }), completeItem: (l, i, r) => le.put(`/tasks/${l}/items/${i}/complete`, r), getTags: l => le.get(`/tasks/${l}/tags`), addTag: (l, i) => le.post(`/tasks/${l}/tags`, { tag_id: i }), addTagByName: (l, i) => le.post(`/tasks/${l}/tags`, { tag_name: i }), removeTag: (l, i) => le.delete(`/tasks/${l}/tags/${i}`) }, lj = { getAll: () => le.get("/tags"), getTasksByTag: (l, i) => le.get(`/tasks/by-tag/${l}`, { params: i }) }, nj = { getAll: () => le.get("/agents"), getById: l => le.get(`/agents/${l}`), updateStatus: (l, i, r) => le.put(`/agents/${l}/status`, { status: i, currentTask: r }), getTasks: (l, i) => le.get(`/agents/${l}/tasks`, { params: { status: i } }) }, Ur = { getAll: l => le.get("/memories", { params: l }), getById: l => le.get(`/memories/${l}`), search: (l, i) => le.get("/memories/search", { params: { q: l, tags: i == null ? void 0 : i.join(",") } }), create: l => le.post("/memories", l), update: (l, i) => le.put(`/memories/${l}`, i), delete: l => le.delete(`/memories/${l}`), boost: (l, i) => le.post(`/memories/${l}/boost`, { amount: i }), getRelated: l => le.get(`/memories/${l}/related`), getTags: () => le.get("/memories/tags"), getStats: () => le.get("/memories/stats") }, ru = { getOverview: () => le.get("/dashboard/overview"), getAlerts: () => le.get("/dashboard/alerts"), getActivity: l => le.get("/activity", { params: { limit: l } }) };
function ij() { const [l, i] = B.useState(!0), { token: r, isAuthenticated: c, logout: u, login: m, _hasHydrated: h } = fs(); return B.useEffect(() => { if (!h)
    return; async function p() { if (!r) {
    i(!1);
    return;
} try {
    const { data: b } = await eg.verify();
    b.success && b.user ? m(b.user, r) : u();
}
catch {
    u();
}
finally {
    i(!1);
} } p(); }, [h]), { isChecking: l, isAuthenticated: c }; } /**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rj = l => l.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), tg = (...l) => l.filter((i, r, c) => !!i && i.trim() !== "" && c.indexOf(i) === r).join(" ").trim(); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var cj = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }; /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const oj = B.forwardRef(({ color: l = "currentColor", size: i = 24, strokeWidth: r = 2, absoluteStrokeWidth: c, className: u = "", children: m, iconNode: h, ...p }, b) => B.createElement("svg", { ref: b, ...cj, width: i, height: i, stroke: l, strokeWidth: c ? Number(r) * 24 / Number(i) : r, className: tg("lucide", u), ...p }, [...h.map(([y, v]) => B.createElement(y, v)), ...Array.isArray(m) ? m : [m]])); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const X = (l, i) => { const r = B.forwardRef(({ className: c, ...u }, m) => B.createElement(oj, { ref: m, iconNode: i, className: tg(`lucide-${rj(l)}`, c), ...u })); return r.displayName = `${l}`, r; }; /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Dn = X("Activity", [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2", key: "169zse" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const dj = X("AlignLeft", [["path", { d: "M15 12H3", key: "6jk70r" }], ["path", { d: "M17 18H3", key: "1amg6g" }], ["path", { d: "M21 6H3", key: "1jwq7v" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gr = X("Archive", [["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }], ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }], ["path", { d: "M10 12h4", key: "a56b0p" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const sg = X("ArrowDown", [["path", { d: "M12 5v14", key: "s699le" }], ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ba = X("ArrowLeft", [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const br = X("ArrowUp", [["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }], ["path", { d: "M12 19V5", key: "x0mq9r" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ag = X("Bell", [["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326", key: "11g9vi" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Lr = X("Bot", [["path", { d: "M12 8V4H8", key: "hb8ula" }], ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }], ["path", { d: "M2 14h2", key: "vft8re" }], ["path", { d: "M20 14h2", key: "4cs60a" }], ["path", { d: "M15 13v2", key: "1xurst" }], ["path", { d: "M9 13v2", key: "rq6x2g" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Hr = X("Brain", [["path", { d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z", key: "l5xja" }], ["path", { d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z", key: "ep3f8r" }], ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }], ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }], ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }], ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }], ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }], ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }], ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cu = X("Briefcase", [["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }], ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const lg = X("Building2", [["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }], ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }], ["path", { d: "M10 6h4", key: "1itunk" }], ["path", { d: "M10 10h4", key: "tcdvrf" }], ["path", { d: "M10 14h4", key: "kelpxr" }], ["path", { d: "M10 18h4", key: "1ulq68" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const uj = X("CalendarDays", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 14h.01", key: "6423bh" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M16 14h.01", key: "1gbofw" }], ["path", { d: "M8 18h.01", key: "lrp35t" }], ["path", { d: "M12 18h.01", key: "mhygvu" }], ["path", { d: "M16 18h.01", key: "kzsmim" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ua = X("Calendar", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mj = X("Camera", [["path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z", key: "1tc9qg" }], ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fj = X("ChartColumn", [["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }], ["path", { d: "M18 17V9", key: "2bz60n" }], ["path", { d: "M13 17V5", key: "1frdt8" }], ["path", { d: "M8 17v-3", key: "17ska0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const hj = X("ChartNoAxesColumnIncreasing", [["line", { x1: "12", x2: "12", y1: "20", y2: "10", key: "1vz5eb" }], ["line", { x1: "18", x2: "18", y1: "20", y2: "4", key: "cun8e5" }], ["line", { x1: "6", x2: "6", y1: "20", y2: "16", key: "hq0ia6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xj = X("CheckCheck", [["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }], ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sl = X("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pj = X("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ng = X("ChevronLeft", [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ou = X("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const St = X("CircleAlert", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }], ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const vr = X("CircleCheckBig", [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const nt = X("CircleCheck", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gj = X("CircleDot", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ig = X("CirclePlus", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M8 12h8", key: "1wcyev" }], ["path", { d: "M12 8v8", key: "napkw2" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Fx = X("CircleX", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m15 9-6 6", key: "1uzhvr" }], ["path", { d: "m9 9 6 6", key: "z0biqf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Pe = X("Clock", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $x = X("Cloud", [["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const bj = X("Columns3", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M9 3v18", key: "fh3hqa" }], ["path", { d: "M15 3v18", key: "14nvp0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wl = X("Copy", [["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const yj = X("Database", [["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }], ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }], ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const rg = X("DollarSign", [["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }], ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Jt = X("ExternalLink", [["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "M10 14 21 3", key: "gplh6r" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sd = X("EyeOff", [["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49", key: "ct8e1f" }], ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }], ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143", key: "13bj9a" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const kd = X("Eye", [["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0", key: "1nclc0" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cg = X("FileText", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M10 9H8", key: "b1mrlr" }], ["path", { d: "M16 13H8", key: "t4e002" }], ["path", { d: "M16 17H8", key: "z1uh3a" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const vj = X("Filter", [["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const og = X("Flag", [["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", key: "i9b6wo" }], ["line", { x1: "4", x2: "4", y1: "22", y2: "15", key: "1cm3nv" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const jj = X("FlaskConical", [["path", { d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2", key: "18mbvz" }], ["path", { d: "M6.453 15h11.094", key: "3shlmq" }], ["path", { d: "M8.5 2h7", key: "csnxdl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const kl = X("FolderKanban", [["path", { d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z", key: "1fr9dc" }], ["path", { d: "M8 10v4", key: "tgpxqk" }], ["path", { d: "M12 10v2", key: "hh53o1" }], ["path", { d: "M16 10v6", key: "1d6xys" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const du = X("Folder", [["path", { d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z", key: "1kt360" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Px = X("GitBranch", [["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }], ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }], ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }], ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Nj = X("Github", [["path", { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4", key: "tonef" }], ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const uu = X("Globe", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }], ["path", { d: "M2 12h20", key: "9i4pu4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mu = X("GraduationCap", [["path", { d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z", key: "j76jl0" }], ["path", { d: "M22 10v6", key: "1lu8f3" }], ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wj = X("GripVertical", [["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }], ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }], ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }], ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }], ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }], ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const dg = X("Hourglass", [["path", { d: "M5 22h14", key: "ehvnwv" }], ["path", { d: "M5 2h14", key: "pdyrp9" }], ["path", { d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22", key: "1d314k" }], ["path", { d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2", key: "1vvvr6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ug = X("Info", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 16v-4", key: "1dtifu" }], ["path", { d: "M12 8h.01", key: "e9boi3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ix = X("Key", [["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }], ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }], ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mg = X("Laptop", [["path", { d: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16", key: "tarvll" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sj = X("Layers", [["path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z", key: "zw3jo" }], ["path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12", key: "1wduqc" }], ["path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17", key: "kqbvx6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const kj = X("LayoutDashboard", [["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }], ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }], ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }], ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Un = X("LayoutGrid", [["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }], ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }], ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }], ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fg = X("Link2", [["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }], ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }], ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fu = X("Link", [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Cj = X("ListChecks", [["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const hg = X("ListTodo", [["rect", { x: "3", y: "5", width: "6", height: "6", rx: "1", key: "1defrl" }], ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ln = X("List", [["path", { d: "M3 12h.01", key: "nlz23k" }], ["path", { d: "M3 18h.01", key: "1tta3j" }], ["path", { d: "M3 6h.01", key: "1rqtza" }], ["path", { d: "M8 12h13", key: "1za7za" }], ["path", { d: "M8 18h13", key: "1lx6n3" }], ["path", { d: "M8 6h13", key: "ik3vkj" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Re = X("LoaderCircle", [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Aj = X("Lock", [["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Tj = X("LogOut", [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }], ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xg = X("MessageSquare", [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Zd = X("Moon", [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ej = X("MousePointer", [["path", { d: "M12.586 12.586 19 19", key: "ea5xo7" }], ["path", { d: "M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z", key: "277e5u" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Wx = X("Network", [["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }], ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }], ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }], ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }], ["path", { d: "M12 12V8", key: "2874zd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pg = X("Palette", [["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }], ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }], ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }], ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }], ["path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z", key: "12rzf8" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Mj = X("PenLine", [["path", { d: "M12 20h9", key: "t2du7b" }], ["path", { d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z", key: "1ykcvy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mt = X("Plus", [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "M12 5v14", key: "s699le" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const _j = X("RectangleEllipsis", [["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }], ["path", { d: "M12 12h.01", key: "1mp3jc" }], ["path", { d: "M17 12h.01", key: "1m0b6t" }], ["path", { d: "M7 12h.01", key: "eqddd0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const hu = X("Save", [["path", { d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", key: "1c8476" }], ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }], ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Hn = X("Search", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Oj = X("Send", [["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z", key: "1ffxy3" }], ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const jr = X("Server", [["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }], ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }], ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }], ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Vr = X("Settings", [["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", key: "1qme2f" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gg = X("Shield", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xu = X("SquareChartGantt", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M9 8h7", key: "kbo1nt" }], ["path", { d: "M8 12h6", key: "ikassy" }], ["path", { d: "M11 16h5", key: "oq65wt" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Dj = X("SquareCheckBig", [["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Nr = X("SquarePen", [["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }], ["path", { d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z", key: "ohrbg2" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const zj = X("Square", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Rj = X("Star", [["path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z", key: "r04s7s" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wr = X("Sun", [["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }], ["path", { d: "M12 2v2", key: "tus03m" }], ["path", { d: "M12 20v2", key: "1lh1kg" }], ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }], ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }], ["path", { d: "M2 12h2", key: "1t8f8n" }], ["path", { d: "M20 12h2", key: "1q8mjw" }], ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }], ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pu = X("Tag", [["path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z", key: "vktsd0" }], ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const bg = X("Tags", [["path", { d: "m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19", key: "1cbfv1" }], ["path", { d: "M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z", key: "135mg7" }], ["circle", { cx: "6.5", cy: "9.5", r: ".5", fill: "currentColor", key: "5pm5xn" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qj = X("Target", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Bj = X("Terminal", [["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }], ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Gr = X("Trash2", [["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Qr = X("TrendingUp", [["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }], ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Jd = X("TriangleAlert", [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", key: "wmoenq" }], ["path", { d: "M12 9v4", key: "juzpu7" }], ["path", { d: "M12 17h.01", key: "p32p05" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Uj = X("Type", [["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }], ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }], ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ds = X("User", [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }], ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const yg = X("Users", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Lj = X("WifiOff", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }], ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }], ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }], ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }], ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Hj = X("Wifi", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }], ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const zs = X("X", [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sr = X("Zap", [["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z", key: "1xq2db" }]]), Kr = Tp(l => ({ sidebarOpen: !0, theme: "dark", toggleSidebar: () => l(i => ({ sidebarOpen: !i.sidebarOpen })), setSidebarOpen: i => l({ sidebarOpen: i }), setTheme: i => l({ theme: i }), toggleTheme: () => l(i => ({ theme: i.theme === "light" ? "dark" : "light" })) })), Vj = (l, i) => { const r = new Array(l.length + i.length); for (let c = 0; c < l.length; c++)
    r[c] = l[c]; for (let c = 0; c < i.length; c++)
    r[l.length + c] = i[c]; return r; }, Gj = (l, i) => ({ classGroupId: l, validator: i }), vg = (l = new Map, i = null, r) => ({ nextPart: l, validators: i, classGroupId: r }), kr = "-", ep = [], Qj = "arbitrary..", Kj = l => { const i = Xj(l), { conflictingClassGroups: r, conflictingClassGroupModifiers: c } = l; return { getClassGroupId: h => { if (h.startsWith("[") && h.endsWith("]"))
        return Yj(h); const p = h.split(kr), b = p[0] === "" && p.length > 1 ? 1 : 0; return jg(p, b, i); }, getConflictingClassGroupIds: (h, p) => { if (p) {
        const b = c[h], y = r[h];
        return b ? y ? Vj(y, b) : b : y || ep;
    } return r[h] || ep; } }; }, jg = (l, i, r) => { if (l.length - i === 0)
    return r.classGroupId; const u = l[i], m = r.nextPart.get(u); if (m) {
    const y = jg(l, i + 1, m);
    if (y)
        return y;
} const h = r.validators; if (h === null)
    return; const p = i === 0 ? l.join(kr) : l.slice(i).join(kr), b = h.length; for (let y = 0; y < b; y++) {
    const v = h[y];
    if (v.validator(p))
        return v.classGroupId;
} }, Yj = l => l.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => { const i = l.slice(1, -1), r = i.indexOf(":"), c = i.slice(0, r); return c ? Qj + c : void 0; })(), Xj = l => { const { theme: i, classGroups: r } = l; return Zj(r, i); }, Zj = (l, i) => { const r = vg(); for (const c in l) {
    const u = l[c];
    gu(u, r, c, i);
} return r; }, gu = (l, i, r, c) => { const u = l.length; for (let m = 0; m < u; m++) {
    const h = l[m];
    Jj(h, i, r, c);
} }, Jj = (l, i, r, c) => { if (typeof l == "string") {
    Fj(l, i, r);
    return;
} if (typeof l == "function") {
    $j(l, i, r, c);
    return;
} Pj(l, i, r, c); }, Fj = (l, i, r) => { const c = l === "" ? i : Ng(i, l); c.classGroupId = r; }, $j = (l, i, r, c) => { if (Ij(l)) {
    gu(l(c), i, r, c);
    return;
} i.validators === null && (i.validators = []), i.validators.push(Gj(r, l)); }, Pj = (l, i, r, c) => { const u = Object.entries(l), m = u.length; for (let h = 0; h < m; h++) {
    const [p, b] = u[h];
    gu(b, Ng(i, p), r, c);
} }, Ng = (l, i) => { let r = l; const c = i.split(kr), u = c.length; for (let m = 0; m < u; m++) {
    const h = c[m];
    let p = r.nextPart.get(h);
    p || (p = vg(), r.nextPart.set(h, p)), r = p;
} return r; }, Ij = l => "isThemeGetter" in l && l.isThemeGetter === !0, Wj = l => { if (l < 1)
    return { get: () => { }, set: () => { } }; let i = 0, r = Object.create(null), c = Object.create(null); const u = (m, h) => { r[m] = h, i++, i > l && (i = 0, c = r, r = Object.create(null)); }; return { get(m) { let h = r[m]; if (h !== void 0)
        return h; if ((h = c[m]) !== void 0)
        return u(m, h), h; }, set(m, h) { m in r ? r[m] = h : u(m, h); } }; }, Fd = "!", tp = ":", eN = [], sp = (l, i, r, c, u) => ({ modifiers: l, hasImportantModifier: i, baseClassName: r, maybePostfixModifierPosition: c, isExternal: u }), tN = l => { const { prefix: i, experimentalParseClassName: r } = l; let c = u => { const m = []; let h = 0, p = 0, b = 0, y; const v = u.length; for (let w = 0; w < v; w++) {
    const T = u[w];
    if (h === 0 && p === 0) {
        if (T === tp) {
            m.push(u.slice(b, w)), b = w + 1;
            continue;
        }
        if (T === "/") {
            y = w;
            continue;
        }
    }
    T === "[" ? h++ : T === "]" ? h-- : T === "(" ? p++ : T === ")" && p--;
} const g = m.length === 0 ? u : u.slice(b); let k = g, C = !1; g.endsWith(Fd) ? (k = g.slice(0, -1), C = !0) : g.startsWith(Fd) && (k = g.slice(1), C = !0); const j = y && y > b ? y - b : void 0; return sp(m, C, k, j); }; if (i) {
    const u = i + tp, m = c;
    c = h => h.startsWith(u) ? m(h.slice(u.length)) : sp(eN, !1, h, void 0, !0);
} if (r) {
    const u = c;
    c = m => r({ className: m, parseClassName: u });
} return c; }, sN = l => { const i = new Map; return l.orderSensitiveModifiers.forEach((r, c) => { i.set(r, 1e6 + c); }), r => { const c = []; let u = []; for (let m = 0; m < r.length; m++) {
    const h = r[m], p = h[0] === "[", b = i.has(h);
    p || b ? (u.length > 0 && (u.sort(), c.push(...u), u = []), c.push(h)) : u.push(h);
} return u.length > 0 && (u.sort(), c.push(...u)), c; }; }, aN = l => ({ cache: Wj(l.cacheSize), parseClassName: tN(l), sortModifiers: sN(l), ...Kj(l) }), lN = /\s+/, nN = (l, i) => { const { parseClassName: r, getClassGroupId: c, getConflictingClassGroupIds: u, sortModifiers: m } = i, h = [], p = l.trim().split(lN); let b = ""; for (let y = p.length - 1; y >= 0; y -= 1) {
    const v = p[y], { isExternal: g, modifiers: k, hasImportantModifier: C, baseClassName: j, maybePostfixModifierPosition: w } = r(v);
    if (g) {
        b = v + (b.length > 0 ? " " + b : b);
        continue;
    }
    let T = !!w, K = c(T ? j.substring(0, w) : j);
    if (!K) {
        if (!T) {
            b = v + (b.length > 0 ? " " + b : b);
            continue;
        }
        if (K = c(j), !K) {
            b = v + (b.length > 0 ? " " + b : b);
            continue;
        }
        T = !1;
    }
    const Z = k.length === 0 ? "" : k.length === 1 ? k[0] : m(k).join(":"), V = C ? Z + Fd : Z, $ = V + K;
    if (h.indexOf($) > -1)
        continue;
    h.push($);
    const D = u(K, T);
    for (let G = 0; G < D.length; ++G) {
        const q = D[G];
        h.push(V + q);
    }
    b = v + (b.length > 0 ? " " + b : b);
} return b; }, iN = (...l) => { let i = 0, r, c, u = ""; for (; i < l.length;)
    (r = l[i++]) && (c = wg(r)) && (u && (u += " "), u += c); return u; }, wg = l => { if (typeof l == "string")
    return l; let i, r = ""; for (let c = 0; c < l.length; c++)
    l[c] && (i = wg(l[c])) && (r && (r += " "), r += i); return r; }, rN = (l, ...i) => { let r, c, u, m; const h = b => { const y = i.reduce((v, g) => g(v), l()); return r = aN(y), c = r.cache.get, u = r.cache.set, m = p, p(b); }, p = b => { const y = c(b); if (y)
    return y; const v = nN(b, r); return u(b, v), v; }; return m = h, (...b) => m(iN(...b)); }, cN = [], $e = l => { const i = r => r[l] || cN; return i.isThemeGetter = !0, i; }, Sg = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, kg = /^\((?:(\w[\w-]*):)?(.+)\)$/i, oN = /^\d+\/\d+$/, dN = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, uN = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, mN = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, fN = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, hN = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Nl = l => oN.test(l), oe = l => !!l && !Number.isNaN(Number(l)), oa = l => !!l && Number.isInteger(Number(l)), Cd = l => l.endsWith("%") && oe(l.slice(0, -1)), Os = l => dN.test(l), xN = () => !0, pN = l => uN.test(l) && !mN.test(l), Cg = () => !1, gN = l => fN.test(l), bN = l => hN.test(l), yN = l => !I(l) && !W(l), vN = l => _l(l, Eg, Cg), I = l => Sg.test(l), Da = l => _l(l, Mg, pN), Ad = l => _l(l, kN, oe), ap = l => _l(l, Ag, Cg), jN = l => _l(l, Tg, bN), rr = l => _l(l, _g, gN), W = l => kg.test(l), En = l => Ol(l, Mg), NN = l => Ol(l, CN), lp = l => Ol(l, Ag), wN = l => Ol(l, Eg), SN = l => Ol(l, Tg), cr = l => Ol(l, _g, !0), _l = (l, i, r) => { const c = Sg.exec(l); return c ? c[1] ? i(c[1]) : r(c[2]) : !1; }, Ol = (l, i, r = !1) => { const c = kg.exec(l); return c ? c[1] ? i(c[1]) : r : !1; }, Ag = l => l === "position" || l === "percentage", Tg = l => l === "image" || l === "url", Eg = l => l === "length" || l === "size" || l === "bg-size", Mg = l => l === "length", kN = l => l === "number", CN = l => l === "family-name", _g = l => l === "shadow", AN = () => { const l = $e("color"), i = $e("font"), r = $e("text"), c = $e("font-weight"), u = $e("tracking"), m = $e("leading"), h = $e("breakpoint"), p = $e("container"), b = $e("spacing"), y = $e("radius"), v = $e("shadow"), g = $e("inset-shadow"), k = $e("text-shadow"), C = $e("drop-shadow"), j = $e("blur"), w = $e("perspective"), T = $e("aspect"), K = $e("ease"), Z = $e("animate"), V = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], $ = () => ["center", "top", "bottom", "left", "right", "top-left", "left-top", "top-right", "right-top", "bottom-right", "right-bottom", "bottom-left", "left-bottom"], D = () => [...$(), W, I], G = () => ["auto", "hidden", "clip", "visible", "scroll"], q = () => ["auto", "contain", "none"], Y = () => [W, I, b], de = () => [Nl, "full", "auto", ...Y()], it = () => [oa, "none", "subgrid", W, I], Ge = () => ["auto", { span: ["full", oa, W, I] }, oa, W, I], Se = () => [oa, "auto", W, I], We = () => ["auto", "min", "max", "fr", W, I], Je = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], Ue = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], E = () => ["auto", ...Y()], J = () => [Nl, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...Y()], Q = () => [l, W, I], xe = () => [...$(), lp, ap, { position: [W, I] }], ue = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }], we = () => ["auto", "cover", "contain", wN, vN, { size: [W, I] }], ne = () => [Cd, En, Da], se = () => ["", "none", "full", y, W, I], me = () => ["", oe, En, Da], et = () => ["solid", "dashed", "dotted", "double"], Pt = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], ze = () => [oe, Cd, lp, ap], fa = () => ["", "none", j, W, I], It = () => ["none", oe, W, I], Rs = () => ["none", oe, W, I], qs = () => [oe, W, I], Bs = () => [Nl, "full", ...Y()]; return { cacheSize: 500, theme: { animate: ["spin", "ping", "pulse", "bounce"], aspect: ["video"], blur: [Os], breakpoint: [Os], color: [xN], container: [Os], "drop-shadow": [Os], ease: ["in", "out", "in-out"], font: [yN], "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"], "inset-shadow": [Os], leading: ["none", "tight", "snug", "normal", "relaxed", "loose"], perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"], radius: [Os], shadow: [Os], spacing: ["px", oe], text: [Os], "text-shadow": [Os], tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"] }, classGroups: { aspect: [{ aspect: ["auto", "square", Nl, I, W, T] }], container: ["container"], columns: [{ columns: [oe, I, W, p] }], "break-after": [{ "break-after": V() }], "break-before": [{ "break-before": V() }], "break-inside": [{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] }], "box-decoration": [{ "box-decoration": ["slice", "clone"] }], box: [{ box: ["border", "content"] }], display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"], sr: ["sr-only", "not-sr-only"], float: [{ float: ["right", "left", "none", "start", "end"] }], clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }], isolation: ["isolate", "isolation-auto"], "object-fit": [{ object: ["contain", "cover", "fill", "none", "scale-down"] }], "object-position": [{ object: D() }], overflow: [{ overflow: G() }], "overflow-x": [{ "overflow-x": G() }], "overflow-y": [{ "overflow-y": G() }], overscroll: [{ overscroll: q() }], "overscroll-x": [{ "overscroll-x": q() }], "overscroll-y": [{ "overscroll-y": q() }], position: ["static", "fixed", "absolute", "relative", "sticky"], inset: [{ inset: de() }], "inset-x": [{ "inset-x": de() }], "inset-y": [{ "inset-y": de() }], start: [{ start: de() }], end: [{ end: de() }], top: [{ top: de() }], right: [{ right: de() }], bottom: [{ bottom: de() }], left: [{ left: de() }], visibility: ["visible", "invisible", "collapse"], z: [{ z: [oa, "auto", W, I] }], basis: [{ basis: [Nl, "full", "auto", p, ...Y()] }], "flex-direction": [{ flex: ["row", "row-reverse", "col", "col-reverse"] }], "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }], flex: [{ flex: [oe, Nl, "auto", "initial", "none", I] }], grow: [{ grow: ["", oe, W, I] }], shrink: [{ shrink: ["", oe, W, I] }], order: [{ order: [oa, "first", "last", "none", W, I] }], "grid-cols": [{ "grid-cols": it() }], "col-start-end": [{ col: Ge() }], "col-start": [{ "col-start": Se() }], "col-end": [{ "col-end": Se() }], "grid-rows": [{ "grid-rows": it() }], "row-start-end": [{ row: Ge() }], "row-start": [{ "row-start": Se() }], "row-end": [{ "row-end": Se() }], "grid-flow": [{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] }], "auto-cols": [{ "auto-cols": We() }], "auto-rows": [{ "auto-rows": We() }], gap: [{ gap: Y() }], "gap-x": [{ "gap-x": Y() }], "gap-y": [{ "gap-y": Y() }], "justify-content": [{ justify: [...Je(), "normal"] }], "justify-items": [{ "justify-items": [...Ue(), "normal"] }], "justify-self": [{ "justify-self": ["auto", ...Ue()] }], "align-content": [{ content: ["normal", ...Je()] }], "align-items": [{ items: [...Ue(), { baseline: ["", "last"] }] }], "align-self": [{ self: ["auto", ...Ue(), { baseline: ["", "last"] }] }], "place-content": [{ "place-content": Je() }], "place-items": [{ "place-items": [...Ue(), "baseline"] }], "place-self": [{ "place-self": ["auto", ...Ue()] }], p: [{ p: Y() }], px: [{ px: Y() }], py: [{ py: Y() }], ps: [{ ps: Y() }], pe: [{ pe: Y() }], pt: [{ pt: Y() }], pr: [{ pr: Y() }], pb: [{ pb: Y() }], pl: [{ pl: Y() }], m: [{ m: E() }], mx: [{ mx: E() }], my: [{ my: E() }], ms: [{ ms: E() }], me: [{ me: E() }], mt: [{ mt: E() }], mr: [{ mr: E() }], mb: [{ mb: E() }], ml: [{ ml: E() }], "space-x": [{ "space-x": Y() }], "space-x-reverse": ["space-x-reverse"], "space-y": [{ "space-y": Y() }], "space-y-reverse": ["space-y-reverse"], size: [{ size: J() }], w: [{ w: [p, "screen", ...J()] }], "min-w": [{ "min-w": [p, "screen", "none", ...J()] }], "max-w": [{ "max-w": [p, "screen", "none", "prose", { screen: [h] }, ...J()] }], h: [{ h: ["screen", "lh", ...J()] }], "min-h": [{ "min-h": ["screen", "lh", "none", ...J()] }], "max-h": [{ "max-h": ["screen", "lh", ...J()] }], "font-size": [{ text: ["base", r, En, Da] }], "font-smoothing": ["antialiased", "subpixel-antialiased"], "font-style": ["italic", "not-italic"], "font-weight": [{ font: [c, W, Ad] }], "font-stretch": [{ "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Cd, I] }], "font-family": [{ font: [NN, I, i] }], "fvn-normal": ["normal-nums"], "fvn-ordinal": ["ordinal"], "fvn-slashed-zero": ["slashed-zero"], "fvn-figure": ["lining-nums", "oldstyle-nums"], "fvn-spacing": ["proportional-nums", "tabular-nums"], "fvn-fraction": ["diagonal-fractions", "stacked-fractions"], tracking: [{ tracking: [u, W, I] }], "line-clamp": [{ "line-clamp": [oe, "none", W, Ad] }], leading: [{ leading: [m, ...Y()] }], "list-image": [{ "list-image": ["none", W, I] }], "list-style-position": [{ list: ["inside", "outside"] }], "list-style-type": [{ list: ["disc", "decimal", "none", W, I] }], "text-alignment": [{ text: ["left", "center", "right", "justify", "start", "end"] }], "placeholder-color": [{ placeholder: Q() }], "text-color": [{ text: Q() }], "text-decoration": ["underline", "overline", "line-through", "no-underline"], "text-decoration-style": [{ decoration: [...et(), "wavy"] }], "text-decoration-thickness": [{ decoration: [oe, "from-font", "auto", W, Da] }], "text-decoration-color": [{ decoration: Q() }], "underline-offset": [{ "underline-offset": [oe, "auto", W, I] }], "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"], "text-overflow": ["truncate", "text-ellipsis", "text-clip"], "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }], indent: [{ indent: Y() }], "vertical-align": [{ align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", W, I] }], whitespace: [{ whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"] }], break: [{ break: ["normal", "words", "all", "keep"] }], wrap: [{ wrap: ["break-word", "anywhere", "normal"] }], hyphens: [{ hyphens: ["none", "manual", "auto"] }], content: [{ content: ["none", W, I] }], "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }], "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }], "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }], "bg-position": [{ bg: xe() }], "bg-repeat": [{ bg: ue() }], "bg-size": [{ bg: we() }], "bg-image": [{ bg: ["none", { linear: [{ to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] }, oa, W, I], radial: ["", W, I], conic: [oa, W, I] }, SN, jN] }], "bg-color": [{ bg: Q() }], "gradient-from-pos": [{ from: ne() }], "gradient-via-pos": [{ via: ne() }], "gradient-to-pos": [{ to: ne() }], "gradient-from": [{ from: Q() }], "gradient-via": [{ via: Q() }], "gradient-to": [{ to: Q() }], rounded: [{ rounded: se() }], "rounded-s": [{ "rounded-s": se() }], "rounded-e": [{ "rounded-e": se() }], "rounded-t": [{ "rounded-t": se() }], "rounded-r": [{ "rounded-r": se() }], "rounded-b": [{ "rounded-b": se() }], "rounded-l": [{ "rounded-l": se() }], "rounded-ss": [{ "rounded-ss": se() }], "rounded-se": [{ "rounded-se": se() }], "rounded-ee": [{ "rounded-ee": se() }], "rounded-es": [{ "rounded-es": se() }], "rounded-tl": [{ "rounded-tl": se() }], "rounded-tr": [{ "rounded-tr": se() }], "rounded-br": [{ "rounded-br": se() }], "rounded-bl": [{ "rounded-bl": se() }], "border-w": [{ border: me() }], "border-w-x": [{ "border-x": me() }], "border-w-y": [{ "border-y": me() }], "border-w-s": [{ "border-s": me() }], "border-w-e": [{ "border-e": me() }], "border-w-t": [{ "border-t": me() }], "border-w-r": [{ "border-r": me() }], "border-w-b": [{ "border-b": me() }], "border-w-l": [{ "border-l": me() }], "divide-x": [{ "divide-x": me() }], "divide-x-reverse": ["divide-x-reverse"], "divide-y": [{ "divide-y": me() }], "divide-y-reverse": ["divide-y-reverse"], "border-style": [{ border: [...et(), "hidden", "none"] }], "divide-style": [{ divide: [...et(), "hidden", "none"] }], "border-color": [{ border: Q() }], "border-color-x": [{ "border-x": Q() }], "border-color-y": [{ "border-y": Q() }], "border-color-s": [{ "border-s": Q() }], "border-color-e": [{ "border-e": Q() }], "border-color-t": [{ "border-t": Q() }], "border-color-r": [{ "border-r": Q() }], "border-color-b": [{ "border-b": Q() }], "border-color-l": [{ "border-l": Q() }], "divide-color": [{ divide: Q() }], "outline-style": [{ outline: [...et(), "none", "hidden"] }], "outline-offset": [{ "outline-offset": [oe, W, I] }], "outline-w": [{ outline: ["", oe, En, Da] }], "outline-color": [{ outline: Q() }], shadow: [{ shadow: ["", "none", v, cr, rr] }], "shadow-color": [{ shadow: Q() }], "inset-shadow": [{ "inset-shadow": ["none", g, cr, rr] }], "inset-shadow-color": [{ "inset-shadow": Q() }], "ring-w": [{ ring: me() }], "ring-w-inset": ["ring-inset"], "ring-color": [{ ring: Q() }], "ring-offset-w": [{ "ring-offset": [oe, Da] }], "ring-offset-color": [{ "ring-offset": Q() }], "inset-ring-w": [{ "inset-ring": me() }], "inset-ring-color": [{ "inset-ring": Q() }], "text-shadow": [{ "text-shadow": ["none", k, cr, rr] }], "text-shadow-color": [{ "text-shadow": Q() }], opacity: [{ opacity: [oe, W, I] }], "mix-blend": [{ "mix-blend": [...Pt(), "plus-darker", "plus-lighter"] }], "bg-blend": [{ "bg-blend": Pt() }], "mask-clip": [{ "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"] }, "mask-no-clip"], "mask-composite": [{ mask: ["add", "subtract", "intersect", "exclude"] }], "mask-image-linear-pos": [{ "mask-linear": [oe] }], "mask-image-linear-from-pos": [{ "mask-linear-from": ze() }], "mask-image-linear-to-pos": [{ "mask-linear-to": ze() }], "mask-image-linear-from-color": [{ "mask-linear-from": Q() }], "mask-image-linear-to-color": [{ "mask-linear-to": Q() }], "mask-image-t-from-pos": [{ "mask-t-from": ze() }], "mask-image-t-to-pos": [{ "mask-t-to": ze() }], "mask-image-t-from-color": [{ "mask-t-from": Q() }], "mask-image-t-to-color": [{ "mask-t-to": Q() }], "mask-image-r-from-pos": [{ "mask-r-from": ze() }], "mask-image-r-to-pos": [{ "mask-r-to": ze() }], "mask-image-r-from-color": [{ "mask-r-from": Q() }], "mask-image-r-to-color": [{ "mask-r-to": Q() }], "mask-image-b-from-pos": [{ "mask-b-from": ze() }], "mask-image-b-to-pos": [{ "mask-b-to": ze() }], "mask-image-b-from-color": [{ "mask-b-from": Q() }], "mask-image-b-to-color": [{ "mask-b-to": Q() }], "mask-image-l-from-pos": [{ "mask-l-from": ze() }], "mask-image-l-to-pos": [{ "mask-l-to": ze() }], "mask-image-l-from-color": [{ "mask-l-from": Q() }], "mask-image-l-to-color": [{ "mask-l-to": Q() }], "mask-image-x-from-pos": [{ "mask-x-from": ze() }], "mask-image-x-to-pos": [{ "mask-x-to": ze() }], "mask-image-x-from-color": [{ "mask-x-from": Q() }], "mask-image-x-to-color": [{ "mask-x-to": Q() }], "mask-image-y-from-pos": [{ "mask-y-from": ze() }], "mask-image-y-to-pos": [{ "mask-y-to": ze() }], "mask-image-y-from-color": [{ "mask-y-from": Q() }], "mask-image-y-to-color": [{ "mask-y-to": Q() }], "mask-image-radial": [{ "mask-radial": [W, I] }], "mask-image-radial-from-pos": [{ "mask-radial-from": ze() }], "mask-image-radial-to-pos": [{ "mask-radial-to": ze() }], "mask-image-radial-from-color": [{ "mask-radial-from": Q() }], "mask-image-radial-to-color": [{ "mask-radial-to": Q() }], "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }], "mask-image-radial-size": [{ "mask-radial": [{ closest: ["side", "corner"], farthest: ["side", "corner"] }] }], "mask-image-radial-pos": [{ "mask-radial-at": $() }], "mask-image-conic-pos": [{ "mask-conic": [oe] }], "mask-image-conic-from-pos": [{ "mask-conic-from": ze() }], "mask-image-conic-to-pos": [{ "mask-conic-to": ze() }], "mask-image-conic-from-color": [{ "mask-conic-from": Q() }], "mask-image-conic-to-color": [{ "mask-conic-to": Q() }], "mask-mode": [{ mask: ["alpha", "luminance", "match"] }], "mask-origin": [{ "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"] }], "mask-position": [{ mask: xe() }], "mask-repeat": [{ mask: ue() }], "mask-size": [{ mask: we() }], "mask-type": [{ "mask-type": ["alpha", "luminance"] }], "mask-image": [{ mask: ["none", W, I] }], filter: [{ filter: ["", "none", W, I] }], blur: [{ blur: fa() }], brightness: [{ brightness: [oe, W, I] }], contrast: [{ contrast: [oe, W, I] }], "drop-shadow": [{ "drop-shadow": ["", "none", C, cr, rr] }], "drop-shadow-color": [{ "drop-shadow": Q() }], grayscale: [{ grayscale: ["", oe, W, I] }], "hue-rotate": [{ "hue-rotate": [oe, W, I] }], invert: [{ invert: ["", oe, W, I] }], saturate: [{ saturate: [oe, W, I] }], sepia: [{ sepia: ["", oe, W, I] }], "backdrop-filter": [{ "backdrop-filter": ["", "none", W, I] }], "backdrop-blur": [{ "backdrop-blur": fa() }], "backdrop-brightness": [{ "backdrop-brightness": [oe, W, I] }], "backdrop-contrast": [{ "backdrop-contrast": [oe, W, I] }], "backdrop-grayscale": [{ "backdrop-grayscale": ["", oe, W, I] }], "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [oe, W, I] }], "backdrop-invert": [{ "backdrop-invert": ["", oe, W, I] }], "backdrop-opacity": [{ "backdrop-opacity": [oe, W, I] }], "backdrop-saturate": [{ "backdrop-saturate": [oe, W, I] }], "backdrop-sepia": [{ "backdrop-sepia": ["", oe, W, I] }], "border-collapse": [{ border: ["collapse", "separate"] }], "border-spacing": [{ "border-spacing": Y() }], "border-spacing-x": [{ "border-spacing-x": Y() }], "border-spacing-y": [{ "border-spacing-y": Y() }], "table-layout": [{ table: ["auto", "fixed"] }], caption: [{ caption: ["top", "bottom"] }], transition: [{ transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", W, I] }], "transition-behavior": [{ transition: ["normal", "discrete"] }], duration: [{ duration: [oe, "initial", W, I] }], ease: [{ ease: ["linear", "initial", K, W, I] }], delay: [{ delay: [oe, W, I] }], animate: [{ animate: ["none", Z, W, I] }], backface: [{ backface: ["hidden", "visible"] }], perspective: [{ perspective: [w, W, I] }], "perspective-origin": [{ "perspective-origin": D() }], rotate: [{ rotate: It() }], "rotate-x": [{ "rotate-x": It() }], "rotate-y": [{ "rotate-y": It() }], "rotate-z": [{ "rotate-z": It() }], scale: [{ scale: Rs() }], "scale-x": [{ "scale-x": Rs() }], "scale-y": [{ "scale-y": Rs() }], "scale-z": [{ "scale-z": Rs() }], "scale-3d": ["scale-3d"], skew: [{ skew: qs() }], "skew-x": [{ "skew-x": qs() }], "skew-y": [{ "skew-y": qs() }], transform: [{ transform: [W, I, "", "none", "gpu", "cpu"] }], "transform-origin": [{ origin: D() }], "transform-style": [{ transform: ["3d", "flat"] }], translate: [{ translate: Bs() }], "translate-x": [{ "translate-x": Bs() }], "translate-y": [{ "translate-y": Bs() }], "translate-z": [{ "translate-z": Bs() }], "translate-none": ["translate-none"], accent: [{ accent: Q() }], appearance: [{ appearance: ["none", "auto"] }], "caret-color": [{ caret: Q() }], "color-scheme": [{ scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"] }], cursor: [{ cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", W, I] }], "field-sizing": [{ "field-sizing": ["fixed", "content"] }], "pointer-events": [{ "pointer-events": ["auto", "none"] }], resize: [{ resize: ["none", "", "y", "x"] }], "scroll-behavior": [{ scroll: ["auto", "smooth"] }], "scroll-m": [{ "scroll-m": Y() }], "scroll-mx": [{ "scroll-mx": Y() }], "scroll-my": [{ "scroll-my": Y() }], "scroll-ms": [{ "scroll-ms": Y() }], "scroll-me": [{ "scroll-me": Y() }], "scroll-mt": [{ "scroll-mt": Y() }], "scroll-mr": [{ "scroll-mr": Y() }], "scroll-mb": [{ "scroll-mb": Y() }], "scroll-ml": [{ "scroll-ml": Y() }], "scroll-p": [{ "scroll-p": Y() }], "scroll-px": [{ "scroll-px": Y() }], "scroll-py": [{ "scroll-py": Y() }], "scroll-ps": [{ "scroll-ps": Y() }], "scroll-pe": [{ "scroll-pe": Y() }], "scroll-pt": [{ "scroll-pt": Y() }], "scroll-pr": [{ "scroll-pr": Y() }], "scroll-pb": [{ "scroll-pb": Y() }], "scroll-pl": [{ "scroll-pl": Y() }], "snap-align": [{ snap: ["start", "end", "center", "align-none"] }], "snap-stop": [{ snap: ["normal", "always"] }], "snap-type": [{ snap: ["none", "x", "y", "both"] }], "snap-strictness": [{ snap: ["mandatory", "proximity"] }], touch: [{ touch: ["auto", "none", "manipulation"] }], "touch-x": [{ "touch-pan": ["x", "left", "right"] }], "touch-y": [{ "touch-pan": ["y", "up", "down"] }], "touch-pz": ["touch-pinch-zoom"], select: [{ select: ["none", "text", "all", "auto"] }], "will-change": [{ "will-change": ["auto", "scroll", "contents", "transform", W, I] }], fill: [{ fill: ["none", ...Q()] }], "stroke-w": [{ stroke: [oe, En, Da, Ad] }], stroke: [{ stroke: ["none", ...Q()] }], "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }] }, conflictingClassGroups: { overflow: ["overflow-x", "overflow-y"], overscroll: ["overscroll-x", "overscroll-y"], inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"], "inset-x": ["right", "left"], "inset-y": ["top", "bottom"], flex: ["basis", "grow", "shrink"], gap: ["gap-x", "gap-y"], p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"], px: ["pr", "pl"], py: ["pt", "pb"], m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"], mx: ["mr", "ml"], my: ["mt", "mb"], size: ["w", "h"], "font-size": ["leading"], "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"], "fvn-ordinal": ["fvn-normal"], "fvn-slashed-zero": ["fvn-normal"], "fvn-figure": ["fvn-normal"], "fvn-spacing": ["fvn-normal"], "fvn-fraction": ["fvn-normal"], "line-clamp": ["display", "overflow"], rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"], "rounded-s": ["rounded-ss", "rounded-es"], "rounded-e": ["rounded-se", "rounded-ee"], "rounded-t": ["rounded-tl", "rounded-tr"], "rounded-r": ["rounded-tr", "rounded-br"], "rounded-b": ["rounded-br", "rounded-bl"], "rounded-l": ["rounded-tl", "rounded-bl"], "border-spacing": ["border-spacing-x", "border-spacing-y"], "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"], "border-w-x": ["border-w-r", "border-w-l"], "border-w-y": ["border-w-t", "border-w-b"], "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"], "border-color-x": ["border-color-r", "border-color-l"], "border-color-y": ["border-color-t", "border-color-b"], translate: ["translate-x", "translate-y", "translate-none"], "translate-none": ["translate", "translate-x", "translate-y", "translate-z"], "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"], "scroll-mx": ["scroll-mr", "scroll-ml"], "scroll-my": ["scroll-mt", "scroll-mb"], "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"], "scroll-px": ["scroll-pr", "scroll-pl"], "scroll-py": ["scroll-pt", "scroll-pb"], touch: ["touch-x", "touch-y", "touch-pz"], "touch-x": ["touch"], "touch-y": ["touch"], "touch-pz": ["touch"] }, conflictingClassGroupModifiers: { "font-size": ["leading"] }, orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"] }; }, TN = rN(AN);
function F(...l) { return TN(by(l)); }
function Yr(l) { return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(l)); }
function lt(l) { const i = new Date, r = new Date(l), c = i.getTime() - r.getTime(), u = Math.floor(c / 1e3), m = Math.floor(u / 60), h = Math.floor(m / 60), p = Math.floor(h / 24); return p > 7 ? Yr(l) : p > 0 ? `hace ${p}d` : h > 0 ? `hace ${h}h` : m > 0 ? `hace ${m}m` : "ahora"; }
function Td(l) { return new Intl.NumberFormat("es-MX").format(l); }
function Og(l) { return { active: "bg-green-500", in_progress: "bg-blue-500", pending: "bg-yellow-500", completed: "bg-green-500", blocked: "bg-red-500", review: "bg-purple-500", inactive: "bg-gray-500", error: "bg-red-500", busy: "bg-orange-500" }[l] || "bg-gray-500"; }
function Dg(l) { return { critical: "text-red-500 bg-red-500/10", high: "text-orange-500 bg-orange-500/10", medium: "text-yellow-500 bg-yellow-500/10", low: "text-green-500 bg-green-500/10" }[l] || "text-gray-500 bg-gray-500/10"; }
const EN = [{ name: "Dashboard", href: "/dashboard", icon: kj }, { name: "Proyectos", href: "/projects", icon: kl }, { name: "Negocios", href: "/businesses", icon: cu }, { name: "Infraestructura", href: "/infrastructure", icon: jr }, { name: "Design Hub", href: "/design-hub", icon: pg }, { name: "Memorias", href: "/memories", icon: Hr }], MN = [{ name: "VibeSDK", href: "https://docs.vibe-sdk.com", icon: Jt, color: "text-purple-400" }];
function _N() { const { sidebarOpen: l, toggleSidebar: i } = Kr(); return s.jsxs("aside", { className: F("fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col", l ? "w-64" : "w-16"), children: [s.jsxs("div", { className: "flex h-16 items-center justify-between border-b border-border px-4", children: [l ? s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("img", { src: "/solaria-logo.png", alt: "SOLARIA", className: "h-9 w-9", onError: r => { r.currentTarget.style.display = "none"; } }), s.jsxs("div", { className: "flex flex-col", children: [s.jsx("span", { className: "font-bold text-lg solaria-text-gradient", children: "SOLARIA" }), s.jsx("span", { className: "text-[10px] text-muted-foreground -mt-1", children: "Digital Field Operations" })] })] }) : s.jsx("img", { src: "/solaria-logo.png", alt: "S", className: "h-8 w-8 mx-auto", onError: r => { r.currentTarget.style.display = "none"; } }), s.jsx("button", { onClick: i, className: "p-2 rounded-lg hover:bg-accent transition-colors", "aria-label": l ? "Colapsar sidebar" : "Expandir sidebar", children: l ? s.jsx(ng, { className: "h-5 w-5" }) : s.jsx(ou, { className: "h-5 w-5" }) })] }), s.jsxs("nav", { className: "flex flex-col gap-1 p-2 flex-1", children: [l && s.jsx("div", { className: "px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider", children: "Navegacion" }), EN.map(r => s.jsxs(hy, { to: r.href, className: ({ isActive: c }) => F("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [s.jsx(r.icon, { className: "h-5 w-5 flex-shrink-0" }), l && s.jsx("span", { children: r.name })] }, r.name)), l && s.jsx("div", { className: "my-2 border-t border-border" }), l && s.jsx("div", { className: "px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider", children: "Enlaces" }), MN.map(r => s.jsxs("a", { href: r.href, target: "_blank", rel: "noopener noreferrer", className: F("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [s.jsx(r.icon, { className: F("h-5 w-5 flex-shrink-0", r.color) }), l && s.jsxs(s.Fragment, { children: [s.jsx("span", { children: r.name }), s.jsx(Jt, { className: "h-3 w-3 ml-auto opacity-50" })] })] }, r.name))] }), l && s.jsx("div", { className: "p-4 border-t border-border", children: s.jsxs("div", { className: "rounded-lg bg-accent/50 p-3 text-center", children: [s.jsxs("div", { className: "text-xs text-muted-foreground", children: [s.jsx("span", { className: "solaria-text-gradient font-semibold", children: "SOLARIA" }), s.jsx("span", { children: " DFO" })] }), s.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "v3.2.0" })] }) })] }); }
function ON() { return Ie({ queryKey: ["dashboard", "overview"], queryFn: async () => { var r, c, u, m, h, p, b, y, v, g, k; const { data: l } = await ru.getOverview(), i = l.data || l; return { totalProjects: ((r = i.projects) == null ? void 0 : r.total_projects) || 0, activeProjects: ((c = i.projects) == null ? void 0 : c.active_projects) || 0, completedProjects: ((u = i.projects) == null ? void 0 : u.completed_projects) || 0, totalTasks: ((m = i.tasks) == null ? void 0 : m.total_tasks) || 0, completedTasks: ((h = i.tasks) == null ? void 0 : h.completed_tasks) || 0, pendingTasks: ((p = i.tasks) == null ? void 0 : p.pending_tasks) || 0, inProgressTasks: ((b = i.tasks) == null ? void 0 : b.in_progress_tasks) || 0, totalAgents: ((y = i.agents) == null ? void 0 : y.total_agents) || 0, activeAgents: ((v = i.agents) == null ? void 0 : v.active_agents) || 0, totalMemories: ((g = i.memories) == null ? void 0 : g.total_memories) || 0, criticalAlerts: ((k = i.alerts) == null ? void 0 : k.critical_alerts) || 0 }; }, refetchInterval: 3e4 }); }
function DN() { return Ie({ queryKey: ["dashboard", "alerts"], queryFn: async () => { const { data: l } = await ru.getAlerts(), i = l.data || l.alerts || l; return Array.isArray(i) ? i : []; }, refetchInterval: 15e3 }); }
function Xr() { return Ie({ queryKey: ["projects"], queryFn: async () => { const { data: l } = await Br.getAll(); return (l.projects || l.data || []).map(r => ({ ...r, tasksTotal: r.totalTasks ?? r.total_tasks ?? 0, tasksCompleted: r.completedTasks ?? r.completed_tasks ?? 0, tasksPending: r.pendingTasks ?? r.pending_tasks ?? 0, activeAgents: r.agentsAssigned ?? r.agents_assigned ?? 0, budgetAllocated: r.budget ?? r.budgetAllocated ?? 0, budgetSpent: r.actualCost ?? r.actual_cost ?? 0 })); } }); }
function Zr(l) { return Ie({ queryKey: ["projects", l], queryFn: async () => { const { data: i } = await Br.getById(l), r = i.project || i.data || i; return { ...r, tasksTotal: r.totalTasks ?? r.total_tasks ?? 0, tasksCompleted: r.completedTasks ?? r.completed_tasks ?? 0, tasksPending: r.pendingTasks ?? r.pending_tasks ?? 0, activeAgents: r.agentsAssigned ?? r.agents_assigned ?? 0, budgetAllocated: r.budget ?? r.budgetAllocated ?? 0, budgetSpent: r.actualCost ?? r.actual_cost ?? 0 }; }, enabled: !!l }); }
function bu() { const l = Ft(); return as({ mutationFn: ({ id: i, data: r }) => Br.update(i, r), onSuccess: (i, { id: r }) => { l.invalidateQueries({ queryKey: ["projects"] }), l.invalidateQueries({ queryKey: ["projects", r] }); } }); }
function Jr(l) { return Ie({ queryKey: ["tasks", l], queryFn: async () => { const { data: i } = await ns.getAll(l); return i.tasks || i.data || i || []; } }); }
function zN(l) { return Ie({ queryKey: ["tasks", l], queryFn: async () => { const { data: i } = await ns.getById(l); return i.data; }, enabled: !!l }); }
function RN() { const l = Ft(); return as({ mutationFn: i => ns.create(i), onSuccess: () => { l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function qN() { const l = Ft(); return as({ mutationFn: ({ id: i, data: r }) => ns.update(i, r), onSuccess: (i, { id: r }) => { l.invalidateQueries({ queryKey: ["tasks"] }), l.invalidateQueries({ queryKey: ["tasks", r] }); } }); }
function zg() { return Ie({ queryKey: ["agents"], queryFn: async () => { const { data: l } = await nj.getAll(); return l.agents || l.data || l || []; }, refetchInterval: 1e4 }); }
function BN(l) { return Ie({ queryKey: ["memories", l], queryFn: async () => { const { data: i } = await Ur.getAll(l); return i.memories || i.data || i || []; } }); }
function UN(l, i) { return Ie({ queryKey: ["memories", "search", l, i], queryFn: async () => { const { data: r } = await Ur.search(l, i); return r.memories || r.data || r || []; }, enabled: l.length > 2 }); }
function LN() { return Ie({ queryKey: ["memories", "tags"], queryFn: async () => { const { data: l } = await Ur.getTags(); return l.tags || l.data || l || []; } }); }
function HN() { return Ie({ queryKey: ["memories", "stats"], queryFn: async () => { const { data: l } = await Ur.getStats(); return l.data || l; } }); }
function VN(l) { return Ie({ queryKey: ["tasks", l, "items"], queryFn: async () => { const { data: i } = await ns.getItems(l); return i.items || i.data || i || []; }, enabled: !!l }); }
function GN() { const l = Ft(); return as({ mutationFn: ({ taskId: i, items: r }) => ns.createItems(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "items"] }), l.invalidateQueries({ queryKey: ["tasks", r] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function QN() { const l = Ft(); return as({ mutationFn: ({ taskId: i, itemId: r, notes: c, actualMinutes: u }) => ns.completeItem(i, r, { notes: c, actual_minutes: u }), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "items"] }), l.invalidateQueries({ queryKey: ["tasks", r] }), l.invalidateQueries({ queryKey: ["tasks"] }), l.invalidateQueries({ queryKey: ["dashboard"] }); } }); }
function KN() { return Ie({ queryKey: ["tags"], queryFn: async () => { const { data: l } = await lj.getAll(); return l.tags || l.data || l || []; }, staleTime: 1e3 * 60 * 5 }); }
function YN(l) { return Ie({ queryKey: ["tasks", l, "tags"], queryFn: async () => { const { data: i } = await ns.getTags(l); return i.tags || i.data || i || []; }, enabled: !!l }); }
function XN() { const l = Ft(); return as({ mutationFn: ({ taskId: i, tagId: r }) => ns.addTag(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "tags"] }), l.invalidateQueries({ queryKey: ["tags"] }); } }); }
function ZN() { const l = Ft(); return as({ mutationFn: ({ taskId: i, tagId: r }) => ns.removeTag(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "tags"] }), l.invalidateQueries({ queryKey: ["tags"] }); } }); }
function JN(l, i) { return Ie({ queryKey: ["projects", l, "activity", i], queryFn: async () => { const { data: r } = await ru.getActivity(i); return (r.logs || r.data || r || []).filter(u => u.projectId === l); }, enabled: !!l, refetchInterval: 15e3 }); }
function Rg(l) { return Ie({ queryKey: ["projects", l, "tasks"], queryFn: async () => { const { data: i } = await ns.getAll({ project_id: l }); return i.tasks || i.data || i || []; }, enabled: !!l, refetchInterval: 1e4 }); }
function FN(l) { return Ie({ queryKey: ["projects", "check-code", l], queryFn: async () => { const { data: i } = await Br.checkCode(l); return i; }, enabled: l.length === 3 && /^[A-Za-z]{3}$/.test(l), staleTime: 1e3 * 30 }); }
function $N(l) { return Ie({ queryKey: ["projects", l, "epics"], queryFn: async () => { const { data: i } = await nu.getByProject(l); return i.epics || i.data || i || []; }, enabled: !!l }); }
function PN() { const l = Ft(); return as({ mutationFn: ({ projectId: i, data: r }) => nu.create(i, r), onSuccess: (i, { projectId: r }) => { l.invalidateQueries({ queryKey: ["projects", r, "epics"] }); } }); }
function IN() { const l = Ft(); return as({ mutationFn: ({ id: i }) => nu.delete(i), onSuccess: (i, r) => { l.invalidateQueries({ queryKey: ["projects", r.projectId, "epics"] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function WN(l) { return Ie({ queryKey: ["projects", l, "sprints"], queryFn: async () => { const { data: i } = await iu.getByProject(l); return i.sprints || i.data || i || []; }, enabled: !!l }); }
function e2() { const l = Ft(); return as({ mutationFn: ({ projectId: i, data: r }) => iu.create(i, r), onSuccess: (i, { projectId: r }) => { l.invalidateQueries({ queryKey: ["projects", r, "sprints"] }); } }); }
function t2() { const l = Ft(); return as({ mutationFn: ({ id: i }) => iu.delete(i), onSuccess: (i, r) => { l.invalidateQueries({ queryKey: ["projects", r.projectId, "sprints"] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function s2() { const l = $t(), { user: i, logout: r } = fs(), { theme: c, toggleTheme: u } = Kr(), { data: m } = DN(), { isConnected: h } = Cv(), [p, b] = B.useState(!1), [y, v] = B.useState(!1), [g, k] = B.useState(new Set), C = B.useRef(null), j = B.useRef(null), w = (G, q) => { q.stopPropagation(), k(Y => new Set([...Y, G])); }, T = () => { const G = K.map(q => q.id); k(new Set(G)); }; B.useEffect(() => { function G(q) { C.current && !C.current.contains(q.target) && b(!1), j.current && !j.current.contains(q.target) && v(!1); } return document.addEventListener("mousedown", G), () => document.removeEventListener("mousedown", G); }, []); const K = (m || []).filter(G => !g.has(G.id)), Z = K.filter(G => G.severity === "critical" || G.severity === "high"), V = K.length, $ = () => { r(), l("/login"); }, D = G => { switch (G) {
    case "critical":
    case "high": return s.jsx(Jd, { className: "h-4 w-4 text-red-500" });
    case "medium": return s.jsx(Jd, { className: "h-4 w-4 text-yellow-500" });
    case "info": return s.jsx(ug, { className: "h-4 w-4 text-blue-500" });
    default: return s.jsx(vr, { className: "h-4 w-4 text-green-500" });
} }; return s.jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur", children: [s.jsx("div", { className: "flex items-center gap-4", children: s.jsx("h1", { className: "text-lg font-semibold", children: "Digital Field Operations" }) }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: F("flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs", h ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: h ? s.jsxs(s.Fragment, { children: [s.jsx(Hj, { className: "h-3.5 w-3.5" }), s.jsx("span", { className: "hidden sm:inline", children: "En vivo" })] }) : s.jsxs(s.Fragment, { children: [s.jsx(Lj, { className: "h-3.5 w-3.5" }), s.jsx("span", { className: "hidden sm:inline", children: "Offline" })] }) }), s.jsxs("div", { className: "relative", ref: C, children: [s.jsxs("button", { onClick: () => b(!p), className: F("relative rounded-lg p-2 transition-colors hover:bg-accent", Z.length > 0 && "text-red-500"), children: [s.jsx(ag, { className: "h-5 w-5" }), V > 0 && s.jsx("span", { className: F("absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white", Z.length > 0 ? "bg-red-500" : "bg-primary"), children: V > 9 ? "9+" : V })] }), p && s.jsxs("div", { className: "absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg", children: [s.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [s.jsx("span", { className: "font-semibold text-sm", children: "Notificaciones" }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsxs("span", { className: "text-xs text-muted-foreground", children: [V, " alertas"] }), V > 0 && s.jsx("button", { onClick: T, className: "text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Limpiar" })] })] }), s.jsx("div", { className: "max-h-80 overflow-y-auto", children: K.length > 0 ? K.slice(0, 10).map(G => s.jsxs("div", { className: "flex gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border last:border-0 group relative", children: [D(G.severity), s.jsxs("div", { className: "flex-1 min-w-0", children: [s.jsx("div", { className: "font-medium text-sm truncate", children: G.title }), s.jsx("div", { className: "text-xs text-muted-foreground truncate", children: G.message }), s.jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: lt(G.createdAt) })] }), s.jsx("button", { onClick: q => w(G.id, q), className: "opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all absolute right-2 top-2", title: "Descartar", children: s.jsx(zs, { className: "h-3.5 w-3.5 text-muted-foreground" }) })] }, G.id)) : s.jsx("div", { className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "No hay notificaciones" }) })] })] }), s.jsx("button", { onClick: u, className: "rounded-lg p-2 transition-colors hover:bg-accent", title: c === "dark" ? "Modo claro" : "Modo oscuro", children: c === "dark" ? s.jsx(wr, { className: "h-5 w-5" }) : s.jsx(Zd, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "relative", ref: j, children: [s.jsxs("button", { onClick: () => v(!y), className: "flex items-center gap-3 border-l border-border pl-4 ml-2 hover:bg-accent/50 rounded-lg pr-2 py-1 transition-colors", children: [s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground", children: s.jsx(Ds, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "text-sm text-left", children: [s.jsx("div", { className: "font-medium", children: i == null ? void 0 : i.name }), s.jsx("div", { className: "text-xs text-muted-foreground capitalize", children: i == null ? void 0 : i.role })] })] }), s.jsx(pj, { className: F("h-4 w-4 text-muted-foreground transition-transform", y && "rotate-180") })] }), y && s.jsxs("div", { className: "absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden", children: [s.jsxs("div", { className: "px-4 py-3 border-b border-border", children: [s.jsx("div", { className: "font-medium text-sm", children: i == null ? void 0 : i.name }), s.jsx("div", { className: "text-xs text-muted-foreground", children: i == null ? void 0 : i.email })] }), s.jsxs("div", { className: "py-1", children: [s.jsxs("button", { onClick: () => { v(!1), l("/settings"); }, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors", children: [s.jsx(Vr, { className: "h-4 w-4 text-muted-foreground" }), "Configuración"] }), s.jsxs("button", { onClick: u, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors", children: [c === "dark" ? s.jsx(wr, { className: "h-4 w-4 text-muted-foreground" }) : s.jsx(Zd, { className: "h-4 w-4 text-muted-foreground" }), c === "dark" ? "Modo claro" : "Modo oscuro"] })] }), s.jsx("div", { className: "border-t border-border py-1", children: s.jsxs("button", { onClick: $, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors", children: [s.jsx(Tj, { className: "h-4 w-4" }), "Cerrar sesión"] }) })] })] })] })] }); }
function a2() { const l = Kr(i => i.sidebarOpen); return s.jsxs("div", { className: "flex h-screen overflow-hidden bg-background", children: [s.jsx(_N, {}), s.jsxs("div", { className: F("flex flex-1 flex-col transition-all duration-300", l ? "ml-64" : "ml-16"), children: [s.jsx(s2, {}), s.jsx("main", { className: "flex-1 overflow-auto p-6", children: s.jsx(xy, {}) })] })] }); }
function l2() { const l = $t(), i = fs(g => g.login), [r, c] = B.useState(""), [u, m] = B.useState(""), [h, p] = B.useState(""), [b, y] = B.useState(!1), v = async (g) => { var k, C; g.preventDefault(), p(""), y(!0); try {
    const { data: j } = await eg.login(r, u);
    j.token && j.user ? (i(j.user, j.token), l("/dashboard")) : p(j.message || "Error de autenticación");
}
catch (j) {
    p(((C = (k = j.response) == null ? void 0 : k.data) == null ? void 0 : C.message) || "Error de conexión");
}
finally {
    y(!1);
} }; return s.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20", children: s.jsxs("div", { className: "w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-xl", children: [s.jsxs("div", { className: "text-center", children: [s.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full solaria-gradient", children: s.jsx(wr, { className: "h-10 w-10 text-white" }) }), s.jsx("h1", { className: "mt-4 text-2xl font-bold", children: "SOLARIA DFO" }), s.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Digital Field Operations" })] }), s.jsxs("form", { onSubmit: v, className: "mt-8 space-y-4", children: [h && s.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-sm text-destructive", children: h }), s.jsxs("div", { children: [s.jsx("label", { htmlFor: "username", className: "block text-sm font-medium mb-2", children: "Usuario" }), s.jsx("input", { id: "username", type: "text", value: r, onChange: g => c(g.target.value), className: "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Ingresa tu usuario", autoComplete: "username", required: !0 })] }), s.jsxs("div", { children: [s.jsx("label", { htmlFor: "password", className: "block text-sm font-medium mb-2", children: "Contraseña" }), s.jsx("input", { id: "password", type: "password", value: u, onChange: g => m(g.target.value), className: "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Ingresa tu contraseña", autoComplete: "current-password", required: !0 })] }), s.jsx("button", { type: "submit", disabled: b, className: "w-full rounded-lg solaria-gradient py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50", children: b ? s.jsxs("span", { className: "flex items-center justify-center gap-2", children: [s.jsx(Re, { className: "h-4 w-4 animate-spin" }), "Ingresando..."] }) : "Ingresar" })] }), s.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "© 2024-2025 SOLARIA AGENCY" })] }) }); }
function or({ title: l, value: i, icon: r, iconClass: c, onClick: u }) { return s.jsxs("div", { onClick: u, className: `stat-card ${u ? "cursor-pointer" : ""}`, title: u ? `Ver ${l.toLowerCase()}` : void 0, children: [s.jsx("div", { className: `stat-icon ${c}`, children: s.jsx(r, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: l }), s.jsx("div", { className: "stat-value", children: i })] })] }); }
function n2({ task: l, onClick: i }) { return s.jsxs("div", { className: "completed-task-item", onClick: i, children: [s.jsx("div", { className: "task-check-icon", style: { background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }, children: s.jsx(nt, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "task-content", children: [s.jsxs("div", { className: "task-title-row", children: [s.jsx("span", { className: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded mr-2", children: l.taskCode || `#${l.taskNumber}` }), s.jsx("span", { className: "task-title", children: l.title })] }), s.jsxs("div", { className: "task-meta", children: [l.projectName && s.jsxs("span", { className: "task-meta-item", children: [s.jsx(du, { className: "h-3 w-3" }), l.projectName] }), s.jsxs("span", { className: "task-meta-item", children: [s.jsx(Pe, { className: "h-3 w-3" }), lt(l.completedAt || l.updatedAt)] })] })] })] }); }
function i2({ project: l, onClick: i }) { const r = l.status === "completed" ? "low" : l.status === "active" ? "high" : "medium", c = l.tasksTotal || 0, u = l.tasksCompleted || 0, m = c > 0 ? Math.round(u / c * 100) : l.progress || 0; return s.jsxs("div", { className: "completed-task-item", onClick: i, style: { cursor: "pointer" }, children: [s.jsx("div", { className: "task-check-icon", style: { background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }, children: s.jsx(du, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "task-content", children: [s.jsxs("div", { className: "task-title-row", children: [s.jsx("span", { className: "task-title", children: l.name }), s.jsx("span", { className: `task-priority-badge ${r}`, children: l.status || "activo" })] }), s.jsxs("div", { className: "task-meta", children: [s.jsxs("span", { className: "task-meta-item", children: [s.jsx(hg, { className: "h-3 w-3" }), c, " tareas"] }), s.jsxs("span", { className: "task-meta-item", children: [s.jsx(nt, { className: "h-3 w-3" }), m, "%"] })] })] })] }); }
function r2({ task: l, onClick: i }) { const r = l.priority === "high" || l.priority === "critical" ? "high" : l.priority === "medium" ? "medium" : "low"; return s.jsxs("div", { className: "completed-task-item", onClick: i, style: { cursor: "pointer" }, children: [s.jsx("div", { className: "task-check-icon", style: { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }, children: s.jsx(ig, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "task-content", children: [s.jsxs("div", { className: "task-title-row", children: [s.jsx("span", { className: "text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded mr-2 font-semibold", children: l.taskCode || `#${l.taskNumber}` }), s.jsx("span", { className: "task-title", children: l.title }), s.jsx("span", { className: `task-priority-badge ${r}`, children: l.priority || "normal" })] }), s.jsxs("div", { className: "task-meta", children: [s.jsxs("span", { className: "task-meta-item", children: [s.jsx(Pe, { className: "h-3 w-3" }), lt(l.createdAt)] }), l.projectName && s.jsxs("span", { className: "task-meta-item", children: [s.jsx(du, { className: "h-3 w-3" }), l.projectName] })] })] })] }); }
function Ed() { return s.jsxs("div", { className: "feed-loading", children: [s.jsx(Re, { className: "h-5 w-5 animate-spin" }), s.jsx("p", { children: "Cargando..." })] }); }
function Md({ icon: l, message: i }) { return s.jsxs("div", { className: "feed-empty", children: [s.jsx(l, { className: "h-8 w-8" }), s.jsx("p", { children: i })] }); }
function c2() { const l = $t(), { data: i, isLoading: r } = ON(), { data: c, isLoading: u } = Xr(), { data: m, isLoading: h } = Jr({}), [p, b] = B.useState([]), [y, v] = B.useState([]); B.useEffect(() => { if (m) {
    const C = new Date;
    C.setDate(C.getDate() - 7);
    const j = m.filter(T => new Date(T.createdAt) >= C).slice(0, 10), w = m.filter(T => T.status === "completed").sort((T, K) => { const Z = new Date(T.completedAt || T.updatedAt); return new Date(K.completedAt || K.updatedAt).getTime() - Z.getTime(); }).slice(0, 15).map(T => { const K = c == null ? void 0 : c.find(Z => Z.id === T.projectId); return { ...T, projectName: K == null ? void 0 : K.name }; });
    b(j), v(w);
} }, [m, c]); const g = () => l("/projects"), k = C => l(`/projects/${C}`); return s.jsxs("div", { className: "space-y-6", children: [s.jsx("div", { className: "section-header", children: s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Dashboard" }), s.jsx("p", { className: "section-subtitle", children: "Vista ejecutiva del estado de operaciones" })] }) }), s.jsxs("div", { className: "dashboard-stats-row", children: [s.jsx(or, { title: "Proyectos Activos", value: r ? "-" : (i == null ? void 0 : i.activeProjects) || (c == null ? void 0 : c.length) || 0, icon: kl, iconClass: "projects", onClick: g }), s.jsx(or, { title: "Tareas Completadas", value: r ? "-" : (i == null ? void 0 : i.completedTasks) || 0, icon: nt, iconClass: "tasks" }), s.jsx(or, { title: "En Progreso", value: r ? "-" : (i == null ? void 0 : i.inProgressTasks) || 0, icon: Pe, iconClass: "active" }), s.jsx(or, { title: "Agentes Activos", value: r ? "-" : (i == null ? void 0 : i.activeAgents) || 0, icon: Lr, iconClass: "agents" })] }), s.jsxs("div", { className: "dashboard-grid", children: [s.jsxs("div", { className: "completed-tasks-widget", children: [s.jsxs("div", { className: "widget-header", children: [s.jsxs("div", { className: "widget-header-left", children: [s.jsx("div", { className: "widget-icon success", children: s.jsx(xj, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsx("div", { className: "widget-title", children: "Tareas Completadas" }), s.jsx("div", { className: "widget-subtitle", children: "Feed global en tiempo real" })] })] }), s.jsxs("button", { onClick: () => l("/tasks/archived"), className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-accent rounded-lg transition-colors", children: [s.jsx(gr, { className: "h-3.5 w-3.5" }), "Ver todas"] })] }), s.jsx("div", { className: "completed-tasks-feed", children: h ? s.jsx(Ed, {}) : y.length > 0 ? y.map(C => s.jsx(n2, { task: C, onClick: () => C.projectId && k(C.projectId) }, C.id)) : s.jsx(Md, { icon: nt, message: "No hay tareas completadas todavia" }) })] }), s.jsxs("div", { className: "completed-tasks-widget", children: [s.jsx("div", { className: "widget-header", children: s.jsxs("div", { className: "widget-header-left", children: [s.jsx("div", { className: "widget-icon info", children: s.jsx(kl, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsx("div", { className: "widget-title", children: "Proyectos Recientes" }), s.jsx("div", { className: "widget-subtitle", children: "Actividad de proyectos" })] })] }) }), s.jsx("div", { className: "completed-tasks-feed", children: u ? s.jsx(Ed, {}) : c && c.length > 0 ? c.slice(0, 5).map(C => s.jsx(i2, { project: C, onClick: () => k(C.id) }, C.id)) : s.jsx(Md, { icon: kl, message: "No hay proyectos" }) })] }), s.jsxs("div", { className: "completed-tasks-widget", children: [s.jsxs("div", { className: "widget-header", children: [s.jsxs("div", { className: "widget-header-left", children: [s.jsx("div", { className: "widget-icon warning", children: s.jsx(ig, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsx("div", { className: "widget-title", children: "Nuevas Tareas por Proyecto" }), s.jsx("div", { className: "widget-subtitle", children: "Ultimos 7 dias" })] })] }), s.jsx("div", { className: "widget-badge", children: p.length })] }), s.jsx("div", { className: "completed-tasks-feed", children: h ? s.jsx(Ed, {}) : p.length > 0 ? p.map(C => s.jsx(r2, { task: C, onClick: () => C.projectId && k(C.projectId) }, C.id)) : s.jsx(Md, { icon: St, message: "No hay tareas nuevas esta semana" }) })] })] })] }); }
const Cr = { planning: { label: "Planificacion", color: "#7c3aed" }, active: { label: "Desarrollo", color: "#0891b2" }, paused: { label: "Pausado", color: "#f59e0b" }, completed: { label: "Produccion", color: "#16a34a" }, cancelled: { label: "Cancelado", color: "#ef4444" } };
function o2({ board: l }) { const r = (c, u) => { const m = Math.min(c, 8); return Array.from({ length: 8 }, (h, p) => s.jsx("div", { className: F("trello-slot", p < m && `filled ${u}`) }, p)); }; return s.jsxs("div", { className: "mini-trello", children: [s.jsxs("div", { className: "trello-column backlog", children: [s.jsxs("div", { className: "trello-column-header", children: ["PEND (", l.backlog, ")"] }), s.jsx("div", { className: "trello-slots", children: r(l.backlog, "backlog") })] }), s.jsxs("div", { className: "trello-column todo", children: [s.jsxs("div", { className: "trello-column-header", children: ["REV (", l.todo, ")"] }), s.jsx("div", { className: "trello-slots", children: r(l.todo, "todo") })] }), s.jsxs("div", { className: "trello-column doing", children: [s.jsxs("div", { className: "trello-column-header", children: ["WIP (", l.doing, ")"] }), s.jsx("div", { className: "trello-slots", children: r(l.doing, "doing") })] }), s.jsxs("div", { className: "trello-column done", children: [s.jsxs("div", { className: "trello-column-header", children: ["DONE (", l.done, ")"] }), s.jsx("div", { className: "trello-slots", children: r(l.done, "done") })] })] }); }
function d2({ status: l }) { const i = ["planning", "active", "paused", "completed"], r = l === "completed" ? 3 : l === "paused" ? 2 : l === "active" ? 1 : 0; return s.jsx("div", { className: "progress-segments", children: i.map((c, u) => s.jsx("div", { className: F("progress-segment", u <= r ? c : "inactive") }, c)) }); }
function u2({ project: l, board: i, onClick: r }) { const c = Cr[l.status] || Cr.planning, u = l.tasksTotal || 0, m = l.tasksCompleted || 0, h = u - m, p = l.budgetAllocated ? l.budgetAllocated >= 1e3 ? `$${(l.budgetAllocated / 1e3).toFixed(0)}K` : `$${l.budgetAllocated}` : "-"; return s.jsxs("div", { className: "project-card", onClick: r, children: [s.jsxs("div", { className: "project-header", children: [s.jsx("div", { className: "project-icon-wrapper", children: s.jsx(kl, { className: "project-icon" }) }), s.jsxs("div", { className: "project-title-group", children: [s.jsx("h3", { className: "project-name", children: l.name }), s.jsx("span", { className: "project-code", children: l.code })] }), s.jsx("button", { className: "project-edit-btn", onClick: b => { b.stopPropagation(); }, title: "Editar proyecto", children: s.jsx(mt, { className: "h-4 w-4" }) })] }), s.jsxs("div", { className: "project-tags", children: [s.jsx("span", { className: "project-tag", style: { backgroundColor: `${c.color}20`, color: c.color }, children: c.label }), l.priority && s.jsx("span", { className: F("project-tag", l.priority === "critical" && "red", l.priority === "high" && "orange", l.priority === "medium" && "yellow", l.priority === "low" && "green"), children: l.priority })] }), s.jsx(o2, { board: i }), s.jsx(d2, { status: l.status }), s.jsxs("div", { className: "project-stats", children: [s.jsxs("div", { className: "stat-item", children: [s.jsx("div", { className: "stat-icon blue", children: s.jsx(nt, { className: "h-3 w-3" }) }), s.jsx("div", { className: "stat-value", children: u }), s.jsx("div", { className: "stat-label", children: "Tareas" })] }), s.jsxs("div", { className: "stat-item", children: [s.jsx("div", { className: "stat-icon yellow", children: s.jsx(Pe, { className: "h-3 w-3" }) }), s.jsx("div", { className: "stat-value", children: h }), s.jsx("div", { className: "stat-label", children: "Pend." })] }), s.jsxs("div", { className: "stat-item", children: [s.jsx("div", { className: "stat-icon green", children: s.jsx(nt, { className: "h-3 w-3" }) }), s.jsx("div", { className: "stat-value", children: m }), s.jsx("div", { className: "stat-label", children: "Compl." })] }), s.jsxs("div", { className: "stat-item", children: [s.jsx("div", { className: "stat-icon orange", children: s.jsx(rg, { className: "h-3 w-3" }) }), s.jsx("div", { className: "stat-value", children: p }), s.jsx("div", { className: "stat-label", children: "Budget" })] }), s.jsxs("div", { className: "stat-item", children: [s.jsx("div", { className: "stat-icon purple", children: s.jsx(yg, { className: "h-3 w-3" }) }), s.jsx("div", { className: "stat-value", children: l.activeAgents || 0 }), s.jsx("div", { className: "stat-label", children: "Agentes" })] }), s.jsxs("div", { className: "stat-item", children: [s.jsx("div", { className: "stat-icon indigo", children: s.jsx(ua, { className: "h-3 w-3" }) }), s.jsx("div", { className: "stat-value", children: l.endDate ? Yr(l.endDate) : "-" }), s.jsx("div", { className: "stat-label", children: "Entrega" })] })] })] }); }
function m2({ project: l, onClick: i }) { const r = Cr[l.status] || Cr.planning, c = l.tasksTotal || 0, u = l.tasksCompleted || 0, m = c - u, h = l.progress || 0, p = l.budgetAllocated ? l.budgetAllocated >= 1e3 ? `$${(l.budgetAllocated / 1e3).toFixed(0)}K` : `$${l.budgetAllocated}` : "-"; return s.jsxs("tr", { onClick: i, className: "project-row", children: [s.jsx("td", { children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "project-icon-sm", children: s.jsx(kl, { className: "h-4 w-4" }) }), s.jsxs("div", { children: [s.jsx("div", { className: "project-name-sm", children: l.name }), s.jsx("div", { className: "project-code-sm", children: l.code })] })] }) }), s.jsx("td", { children: s.jsx("span", { className: "phase-badge", style: { backgroundColor: `${r.color}20`, color: r.color }, children: r.label }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-blue", children: c }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-yellow", children: m }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-green", children: u }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-orange", children: p }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-purple", children: l.activeAgents || 0 }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-indigo", children: l.endDate ? Yr(l.endDate) : "-" }) }), s.jsxs("td", { className: "text-center", children: [s.jsx("div", { className: "progress-bar-sm", children: s.jsx("div", { className: "progress-fill", style: { width: `${h}%` } }) }), s.jsxs("span", { className: "progress-text", children: [h, "%"] })] })] }); }
function f2() { const { projectId: l } = Al(), i = $t(), { data: r, isLoading: c } = Xr(), { data: u } = Jr({}), [m, h] = B.useState("grid"), [p, b] = B.useState("name"), y = (r || []).reduce((k, C) => { const j = (u || []).filter(w => w.projectId === C.id); return k[C.id] = { backlog: j.filter(w => w.status === "pending").length, todo: j.filter(w => w.status === "review").length, doing: j.filter(w => w.status === "in_progress").length, done: j.filter(w => w.status === "completed").length, blocked: j.filter(w => w.status === "blocked").length }, k; }, {}), v = [...r || []].sort((k, C) => { switch (p) {
    case "name": return k.name.localeCompare(C.name);
    case "deadline": return new Date(k.endDate || 0).getTime() - new Date(C.endDate || 0).getTime();
    case "budget": return (C.budgetAllocated || 0) - (k.budgetAllocated || 0);
    case "completion": return (C.progress || 0) - (k.progress || 0);
    case "status": return k.status.localeCompare(C.status);
    default: return 0;
} }), g = k => { i(`/projects/${k}`); }; if (c)
    return s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }); if (l) {
    const k = r == null ? void 0 : r.find(C => C.id === parseInt(l));
    if (k)
        return s.jsxs("div", { className: "space-y-6", children: [s.jsxs("div", { className: "section-header", children: [s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: k.name }), s.jsxs("p", { className: "section-subtitle", children: [k.code, " - ", k.description] })] }), s.jsx("button", { onClick: () => i("/projects"), className: "btn-secondary", children: "Volver" })] }), s.jsx("div", { className: "bg-card border border-border rounded-xl p-6", children: s.jsx("p", { className: "text-muted-foreground", children: "Vista detallada del proyecto (en desarrollo)" }) })] });
} return s.jsxs("div", { className: "space-y-6", children: [s.jsxs("div", { className: "section-header", children: [s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Proyectos" }), s.jsxs("p", { className: "section-subtitle", children: [(r == null ? void 0 : r.length) || 0, " proyectos en el pipeline"] })] }), s.jsxs("div", { className: "section-actions", children: [s.jsxs("div", { className: "sort-buttons", children: [s.jsx("button", { className: F("sort-btn", p === "name" && "active"), onClick: () => b("name"), children: "NOMBRE" }), s.jsx("button", { className: F("sort-btn", p === "deadline" && "active"), onClick: () => b("deadline"), children: "FECHA" }), s.jsx("button", { className: F("sort-btn", p === "budget" && "active"), onClick: () => b("budget"), children: "$$$" }), s.jsx("button", { className: F("sort-btn", p === "completion" && "active"), onClick: () => b("completion"), children: "%" }), s.jsx("button", { className: F("sort-btn", p === "status" && "active"), onClick: () => b("status"), children: "FASE" })] }), s.jsxs("div", { className: "view-toggle", children: [s.jsx("button", { className: F("view-toggle-btn", m === "grid" && "active"), onClick: () => h("grid"), title: "Vista Grid", children: s.jsx(Un, { className: "h-4 w-4" }) }), s.jsx("button", { className: F("view-toggle-btn", m === "list" && "active"), onClick: () => h("list"), title: "Vista Lista", children: s.jsx(Ln, { className: "h-4 w-4" }) })] })] })] }), m === "grid" ? s.jsxs("div", { className: "projects-grid", children: [v.map(k => s.jsx(u2, { project: k, board: y[k.id] || { backlog: 0, todo: 0, doing: 0, done: 0, blocked: 0 }, onClick: () => g(k.id) }, k.id)), v.length === 0 && s.jsxs("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: [s.jsx(St, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), s.jsx("p", { children: "No hay proyectos todavia" })] })] }) : s.jsxs("div", { className: "project-card", style: { padding: 0, overflow: "hidden" }, children: [s.jsxs("table", { className: "list-table", children: [s.jsx("thead", { children: s.jsxs("tr", { children: [s.jsx("th", { style: { width: "22%" }, children: "Proyecto" }), s.jsx("th", { style: { width: "12%" }, children: "Fase" }), s.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Tareas" }), s.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Pend." }), s.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Compl." }), s.jsx("th", { style: { width: "10%", textAlign: "center" }, children: "Budget" }), s.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Agentes" }), s.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Entrega" }), s.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Progreso" })] }) }), s.jsx("tbody", { children: v.map(k => s.jsx(m2, { project: k, onClick: () => g(k.id) }, k.id)) })] }), v.length === 0 && s.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [s.jsx(St, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), s.jsx("p", { children: "No hay proyectos todavia" })] })] })] }); }
function Fr({ isOpen: l, onClose: i, title: r, children: c, maxWidth: u = "max-w-xl", className: m }) { const h = B.useCallback(p => { p.key === "Escape" && i(); }, [i]); return B.useEffect(() => (l && (document.addEventListener("keydown", h), document.body.style.overflow = "hidden"), () => { document.removeEventListener("keydown", h), document.body.style.overflow = "unset"; }), [l, h]), l ? s.jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: p => { p.target === p.currentTarget && i(); }, children: s.jsxs("div", { className: F("bg-card rounded-2xl border border-border w-full max-h-[90vh] overflow-y-auto", u, m), children: [r && s.jsxs("div", { className: "p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10", children: [s.jsx("h2", { className: "text-xl font-bold text-foreground", children: r }), s.jsx("button", { onClick: i, className: "p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: s.jsx(zs, { className: "h-5 w-5" }) })] }), !r && s.jsx("button", { onClick: i, className: "absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10", children: s.jsx(zs, { className: "h-5 w-5" }) }), c] }) }) : null; }
const h2 = [{ key: "backlog", alt: "pending", label: "BL", fullLabel: "BACKLOG", color: "#6b7280" }, { key: "todo", alt: "pending", label: "TD", fullLabel: "TODO", color: "#f59e0b" }, { key: "doing", alt: "in_progress", label: "DO", fullLabel: "DOING", color: "#3b82f6" }, { key: "done", alt: "completed", label: "DN", fullLabel: "DONE", color: "#22c55e" }], np = 8;
function x2({ label: l, fullLabel: i, count: r, color: c, showLabel: u = !0, showCount: m = !0, compact: h = !1 }) { const p = Math.min(r, np), b = []; for (let y = 0; y < np; y++) {
    const v = y < p;
    b.push(s.jsx("div", { className: F("trello-slot", v && "filled"), style: v ? { background: c, borderColor: "transparent" } : void 0 }, y));
} return s.jsxs("div", { className: "trello-column", children: [u && s.jsx("span", { className: "trello-label", children: h ? l : i }), s.jsx("div", { className: "trello-slots", children: b }), m && s.jsx("span", { className: "trello-count", children: r })] }); }
function p2({ board: l, showLabels: i = !0, showCounts: r = !0, compact: c = !1, className: u }) { const m = h => { const p = l[h.key] ?? 0, b = l[h.alt] ?? 0; return p || b; }; return s.jsx("div", { className: F("mini-trello", c && "compact", u), children: h2.map(h => s.jsx(x2, { label: h.label, fullLabel: h.fullLabel, count: m(h), color: h.color, showLabel: i, showCount: r, compact: c }, h.key)) }); }
function g2({ project: l, metrics: i, onClick: r }) { var c; return s.jsxs("div", { onClick: r, className: "bg-card rounded-xl border border-border p-4 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para ver informacion completa del proyecto", children: [s.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 sm:gap-6", children: [s.jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center shrink-0", children: s.jsx(mu, { className: "text-white h-8 w-8 sm:h-10 sm:w-10" }) }), s.jsxs("div", { className: "flex-1 min-w-0", children: [s.jsxs("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: [s.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 uppercase", children: "SAAS" }), s.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 uppercase", children: "REACT" }), s.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 uppercase", children: "B2B" })] }), s.jsx("p", { className: "text-muted-foreground text-sm line-clamp-2", children: l.description || "Sin descripcion" }), s.jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm text-muted-foreground", children: [s.jsx("span", { className: "text-solaria", children: "●" }), s.jsx("span", { children: ((c = l.client) == null ? void 0 : c.name) || "Sin cliente" })] })] }), s.jsx("div", { className: "hidden sm:flex items-start", children: s.jsx(Jt, { className: "h-5 w-5 text-muted-foreground" }) })] }), s.jsxs("div", { className: "mt-4 pt-4 border-t border-border", children: [s.jsxs("div", { className: "flex items-center justify-between mb-2", children: [s.jsx("span", { className: "text-sm text-muted-foreground", children: "Fase" }), s.jsx("span", { className: F("px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide", l.status === "active" || l.status === "development" ? "bg-solaria/20 text-solaria border border-solaria/30" : l.status === "planning" ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : l.status === "completed" || l.status === "deployment" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : l.status === "paused" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : l.status === "testing" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"), children: l.status === "active" || l.status === "development" ? "Desarrollo" : l.status === "planning" ? "Planificacion" : l.status === "completed" || l.status === "deployment" ? "Produccion" : l.status === "paused" ? "Pausado" : l.status === "testing" ? "Testing" : l.status })] }), s.jsxs("div", { className: "flex gap-1 mt-2", children: [s.jsx("div", { className: F("flex-1 h-2 rounded-full transition-colors", l.status === "planning" ? "bg-violet-500" : "bg-solaria") }), s.jsx("div", { className: F("flex-1 h-2 rounded-full transition-colors", ["active", "development", "testing", "deployment", "completed"].includes(l.status) ? "bg-solaria" : "bg-secondary") }), s.jsx("div", { className: F("flex-1 h-2 rounded-full transition-colors", ["testing", "deployment", "completed"].includes(l.status) ? "bg-blue-500" : "bg-secondary") }), s.jsx("div", { className: F("flex-1 h-2 rounded-full transition-colors", ["deployment", "completed"].includes(l.status) ? "bg-emerald-500" : "bg-secondary") })] }), s.jsxs("div", { className: "flex justify-between text-xs mt-1.5", children: [s.jsx("span", { className: F("font-medium", l.status === "planning" ? "text-violet-400" : "text-muted-foreground"), children: "PLAN" }), s.jsx("span", { className: F("font-medium", ["active", "development"].includes(l.status) ? "text-solaria" : "text-muted-foreground"), children: "DEV" }), s.jsx("span", { className: F("font-medium", l.status === "testing" ? "text-blue-400" : "text-muted-foreground"), children: "TEST" }), s.jsx("span", { className: F("font-medium", ["completed", "production"].includes(l.status) ? "text-emerald-400" : "text-muted-foreground"), children: "PROD" })] })] }), s.jsxs("div", { className: "grid grid-cols-4 gap-2 mt-4", children: [s.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [s.jsxs("p", { className: "text-lg font-bold text-foreground", children: ["$", Math.round((l.budgetAllocated || 0) / 1e3), "K"] }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Presupuesto" })] }), s.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [s.jsx("p", { className: "text-lg font-bold text-foreground", children: i.total }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Tareas" })] }), s.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [s.jsxs("p", { className: "text-lg font-bold text-green-400", children: [i.progress, "%"] }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Completado" })] }), s.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [s.jsxs("p", { className: F("text-lg font-bold", i.daysRemaining < 0 ? "text-red-400" : "text-foreground"), children: [i.daysRemaining, "d"] }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Restantes" })] })] })] }); }
function b2({ metrics: l, tasksByStatus: i, onClick: r }) { return s.jsxs("div", { onClick: r, className: "bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para gestionar tareas", children: [s.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [s.jsx(nt, { className: "h-4 w-4 text-solaria" }), "TAREAS", s.jsx(Jt, { className: "h-3 w-3 text-muted-foreground ml-auto" })] }), s.jsxs("div", { className: "grid grid-cols-4 gap-2 mb-4", children: [s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-xl font-bold text-foreground", children: l.total }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Total" })] }), s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-xl font-bold text-yellow-400", children: l.pending }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Pend" })] }), s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-xl font-bold text-blue-400", children: l.inProgress }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Doing" })] }), s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-xl font-bold text-green-400", children: l.completed }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Done" })] })] }), s.jsx(p2, { board: i, showLabels: !0, showCounts: !0, compact: !1 })] }); }
function y2({ project: l, onClick: i }) { const r = [l.productionUrl && { label: "Produccion", url: l.productionUrl }, l.stagingUrl && { label: "Staging", url: l.stagingUrl }, l.localUrl && { label: "Local", url: l.localUrl }, l.repoUrl && { label: "Repo", url: l.repoUrl }].filter(Boolean); return s.jsxs("div", { onClick: i, className: "bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para gestionar URLs", children: [s.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [s.jsx(fg, { className: "h-4 w-4 text-solaria" }), "DIRECCIONES", s.jsx(Jt, { className: "h-3 w-3 text-muted-foreground ml-auto" })] }), r.length > 0 ? s.jsxs("div", { className: "space-y-2", children: [r.slice(0, 3).map((c, u) => s.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground truncate", children: [s.jsx(Jt, { className: "h-3 w-3 shrink-0" }), s.jsxs("span", { className: "text-xs text-solaria", children: [c.label, ":"] }), s.jsx("span", { className: "truncate", children: c.url })] }, u)), r.length > 3 && s.jsxs("p", { className: "text-xs text-solaria", children: ["+", r.length - 3, " mas..."] })] }) : s.jsx("p", { className: "text-sm text-muted-foreground", children: "No hay URLs configuradas" })] }); }
function v2({ activities: l }) { const i = l.slice(0, 5), r = c => c.includes("complete") || c.includes("done") ? s.jsx(nt, { className: "h-4 w-4 text-green-400" }) : c.includes("create") || c.includes("new") ? s.jsx(mt, { className: "h-4 w-4 text-blue-400" }) : c.includes("update") || c.includes("edit") ? s.jsx(Nr, { className: "h-4 w-4 text-yellow-400" }) : s.jsx(Pe, { className: "h-4 w-4 text-muted-foreground" }); return s.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [s.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [s.jsx(Pe, { className: "h-4 w-4 text-solaria" }), "Actividad"] }), i.length > 0 ? s.jsx("div", { className: "space-y-3", children: i.map(c => s.jsxs("div", { className: "flex items-start gap-3", children: [r(c.action), s.jsxs("div", { className: "flex-1 min-w-0", children: [s.jsx("p", { className: "text-sm text-foreground truncate", children: c.description || c.action }), s.jsx("p", { className: "text-xs text-muted-foreground", children: lt(c.createdAt) })] })] }, c.id)) }) : s.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin actividad reciente" })] }); }
function j2({ notes: l, onAddNote: i }) { const [r, c] = B.useState(""), u = m => { m.preventDefault(), r.trim() && (i(r.trim()), c("")); }; return s.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [s.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [s.jsx(cg, { className: "h-4 w-4 text-solaria" }), "Notas", s.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(Agentes leen)" })] }), s.jsxs("form", { onSubmit: u, className: "flex gap-2 mb-3", children: [s.jsx("input", { type: "text", value: r, onChange: m => c(m.target.value), placeholder: "Escribe una nota...", className: "flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria" }), s.jsx("button", { type: "submit", disabled: !r.trim(), className: F("p-2 rounded-lg transition-colors", r.trim() ? "bg-solaria text-white hover:bg-solaria-dark" : "bg-secondary text-muted-foreground cursor-not-allowed"), children: s.jsx(Oj, { className: "h-4 w-4" }) })] }), l.length > 0 ? s.jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: l.map((m, h) => s.jsx("div", { className: "p-2 rounded bg-secondary/50 text-sm text-foreground", children: m }, h)) }) : s.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin notas" })] }); }
function N2({ epics: l, onCreateEpic: i, onDeleteEpic: r }) { const [c, u] = B.useState(!1), [m, h] = B.useState(""), p = B.useMemo(() => l.length === 0 ? 1 : Math.max(...l.map(k => k.epicNumber || 0)) + 1, [l]), b = `EPIC${String(p).padStart(3, "0")}`, y = () => { h(b), u(!0); }, v = () => { m.trim() && (i(m.trim()), h(""), u(!1)); }; return s.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [s.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [s.jsx(qj, { className: "h-4 w-4 text-purple-400" }), "Epics", s.jsxs("span", { className: "text-xs text-muted-foreground font-normal ml-auto", children: [l.length, " total"] })] }), s.jsxs("div", { className: "space-y-2 mb-3 max-h-40 overflow-y-auto", children: [l.map(g => s.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group", children: [s.jsx("div", { className: "w-3 h-3 rounded-full shrink-0", style: { backgroundColor: g.color || "#6366f1" } }), s.jsxs("span", { className: "flex-1 text-sm text-foreground truncate", children: ["EPIC", String(g.epicNumber).padStart(2, "0"), ": ", g.name] }), s.jsx("span", { className: F("text-xs px-1.5 py-0.5 rounded", g.status === "completed" ? "bg-green-500/20 text-green-400" : g.status === "in_progress" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"), children: g.status }), s.jsx("button", { onClick: () => r(g.id), className: "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all", children: s.jsx(Gr, { className: "h-3 w-3" }) })] }, g.id)), l.length === 0 && s.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Sin epics" })] }), c ? s.jsxs("div", { className: "flex gap-2", children: [s.jsx("input", { type: "text", value: m, onChange: g => h(g.target.value), placeholder: b, className: "flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 font-mono", autoFocus: !0, onKeyDown: g => g.key === "Enter" && v() }), s.jsx("button", { onClick: v, disabled: !m.trim(), className: "p-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed", children: s.jsx(mt, { className: "h-4 w-4" }) }), s.jsx("button", { onClick: () => { u(!1), h(""); }, className: "p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground", children: s.jsx(zs, { className: "h-4 w-4" }) })] }) : s.jsxs("button", { onClick: y, className: "w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2", children: [s.jsx(mt, { className: "h-4 w-4" }), "Crear Epic (", b, ")"] })] }); }
function w2({ sprints: l, onCreateSprint: i, onDeleteSprint: r }) { const [c, u] = B.useState(!1), [m, h] = B.useState(""), p = B.useMemo(() => l.length === 0 ? 1 : Math.max(...l.map(C => C.sprintNumber || 0)) + 1, [l]), b = `SPRINT${String(p).padStart(3, "0")}`, y = () => { h(b), u(!0); }, v = () => { m.trim() && (i(m.trim()), h(""), u(!1)); }, g = l.find(k => k.status === "active"); return s.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [s.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [s.jsx(Sr, { className: "h-4 w-4 text-yellow-400" }), "Sprints", s.jsxs("span", { className: "text-xs text-muted-foreground font-normal ml-auto", children: [l.length, " total"] })] }), g && s.jsxs("div", { className: "mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30", children: [s.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [s.jsx(Sr, { className: "h-3 w-3 text-yellow-400" }), s.jsx("span", { className: "text-yellow-400 font-medium", children: "Activo:" }), s.jsx("span", { className: "text-foreground", children: g.name })] }), g.endDate && s.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [s.jsx(uj, { className: "h-3 w-3" }), "Termina: ", new Date(g.endDate).toLocaleDateString("es-ES")] })] }), s.jsxs("div", { className: "space-y-2 mb-3 max-h-32 overflow-y-auto", children: [l.filter(k => k.id !== (g == null ? void 0 : g.id)).map(k => s.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group", children: [s.jsxs("span", { className: "text-xs font-mono text-muted-foreground", children: ["SP", String(k.sprintNumber).padStart(2, "0")] }), s.jsx("span", { className: "flex-1 text-sm text-foreground truncate", children: k.name }), s.jsx("span", { className: F("text-xs px-1.5 py-0.5 rounded", k.status === "completed" ? "bg-green-500/20 text-green-400" : k.status === "active" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"), children: k.status }), s.jsx("button", { onClick: () => r(k.id), className: "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all", children: s.jsx(Gr, { className: "h-3 w-3" }) })] }, k.id)), l.length === 0 && s.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Sin sprints" })] }), c ? s.jsxs("div", { className: "flex gap-2", children: [s.jsx("input", { type: "text", value: m, onChange: k => h(k.target.value), placeholder: b, className: "flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-yellow-500 font-mono", autoFocus: !0, onKeyDown: k => k.key === "Enter" && v() }), s.jsx("button", { onClick: v, disabled: !m.trim(), className: "p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed", children: s.jsx(mt, { className: "h-4 w-4" }) }), s.jsx("button", { onClick: () => { u(!1), h(""); }, className: "p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground", children: s.jsx(zs, { className: "h-4 w-4" }) })] }) : s.jsxs("button", { onClick: y, className: "w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-yellow-500 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2", children: [s.jsx(mt, { className: "h-4 w-4" }), "Crear Sprint (", b, ")"] })] }); }
function S2({ project: l, isOpen: i, onClose: r, onEdit: c }) { var u; return s.jsxs(Fr, { isOpen: i, onClose: r, title: "Informacion del Proyecto", maxWidth: "max-w-2xl", children: [s.jsxs("div", { className: "p-6 space-y-6", children: [s.jsxs("div", { className: "flex items-start gap-4", children: [s.jsx("div", { className: "w-16 h-16 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center", children: s.jsx(mu, { className: "text-white h-8 w-8" }) }), s.jsxs("div", { className: "flex-1", children: [s.jsx("h2", { className: "text-xl font-bold text-foreground", children: l.name }), s.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: l.code })] })] }), s.jsxs("div", { children: [s.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Descripcion" }), s.jsx("p", { className: "text-foreground", children: l.description || "Sin descripcion" })] }), s.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [s.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [s.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Cliente" }), s.jsx("p", { className: "text-foreground font-medium", children: ((u = l.client) == null ? void 0 : u.name) || "Sin cliente" })] }), s.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [s.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Presupuesto" }), s.jsxs("p", { className: "text-foreground font-medium", children: ["$", (l.budgetAllocated || 0).toLocaleString()] })] }), s.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [s.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Fecha Inicio" }), s.jsx("p", { className: "text-foreground font-medium", children: l.startDate ? new Date(l.startDate).toLocaleDateString("es-ES") : "No definida" })] }), s.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [s.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Deadline" }), s.jsx("p", { className: "text-foreground font-medium", children: l.endDate ? new Date(l.endDate).toLocaleDateString("es-ES") : "No definida" })] })] }), s.jsxs("div", { children: [s.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Stack Tecnico" }), s.jsxs("div", { className: "flex flex-wrap gap-2", children: [s.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400", children: "React 19" }), s.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400", children: "Node.js" }), s.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400", children: "PostgreSQL" }), s.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400", children: "TailwindCSS" })] })] })] }), s.jsxs("div", { className: "p-6 border-t border-border flex justify-end gap-3", children: [s.jsx("button", { onClick: r, className: "px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: "Cerrar" }), s.jsxs("button", { onClick: () => { r(), c(); }, className: "px-4 py-2 rounded-lg bg-solaria text-white hover:bg-solaria-dark transition-colors flex items-center gap-2", children: [s.jsx(Nr, { className: "h-4 w-4" }), "Editar"] })] })] }); }
function k2({ project: l, isOpen: i, onClose: r, onSave: c }) { var j, w, T, K; const [u, m] = B.useState({ name: l.name, code: l.code || "", description: l.description || "", budgetAllocated: l.budgetAllocated || 0, startDate: ((j = l.startDate) == null ? void 0 : j.split("T")[0]) || "", endDate: ((w = l.endDate) == null ? void 0 : w.split("T")[0]) || "" }), h = u.code.length === 3 && u.code.toUpperCase() !== ((T = l.code) == null ? void 0 : T.toUpperCase()), { data: p, isLoading: b } = FN(h ? u.code : ""), y = u.code.length === 3 && /^[A-Za-z]{3}$/.test(u.code), v = u.code.toUpperCase() === ((K = l.code) == null ? void 0 : K.toUpperCase()), g = v || ((p == null ? void 0 : p.available) ?? !0), k = Z => { const V = Z.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3); m({ ...u, code: V }); }, C = () => { !y || !v && !g || (c(u), r()); }; return s.jsxs(Fr, { isOpen: i, onClose: r, title: "Editar Proyecto", children: [s.jsxs("div", { className: "p-6 space-y-4", children: [s.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [s.jsxs("div", { className: "col-span-2", children: [s.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Nombre" }), s.jsx("input", { type: "text", value: u.name, onChange: Z => m({ ...u, name: Z.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Codigo (3 letras)" }), s.jsxs("div", { className: "relative", children: [s.jsx("input", { type: "text", value: u.code, onChange: k, maxLength: 3, placeholder: "ABC", className: F("w-full px-3 py-2 rounded-lg bg-secondary border text-foreground font-mono text-center uppercase tracking-wider", !y && u.code.length > 0 ? "border-red-500" : y && !b && !v && g ? "border-green-500" : y && !b && !g ? "border-red-500" : "border-border") }), b && s.jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "..." })] }), !y && u.code.length > 0 && s.jsx("p", { className: "text-xs text-red-400 mt-1", children: "Solo 3 letras A-Z" }), y && !v && !b && !g && s.jsx("p", { className: "text-xs text-red-400 mt-1", children: "Codigo en uso" }), y && !v && !b && g && s.jsx("p", { className: "text-xs text-green-400 mt-1", children: "Disponible ✓" })] })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Presupuesto" }), s.jsx("input", { type: "number", value: u.budgetAllocated, onChange: Z => m({ ...u, budgetAllocated: Number(Z.target.value) }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), s.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Fecha Inicio" }), s.jsx("input", { type: "date", value: u.startDate, onChange: Z => m({ ...u, startDate: Z.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Deadline" }), s.jsx("input", { type: "date", value: u.endDate, onChange: Z => m({ ...u, endDate: Z.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Descripcion" }), s.jsx("textarea", { value: u.description, onChange: Z => m({ ...u, description: Z.target.value }), rows: 4, className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground resize-none" })] })] }), s.jsxs("div", { className: "p-6 border-t border-border flex justify-end gap-3", children: [s.jsx("button", { onClick: r, className: "px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: "Cancelar" }), s.jsx("button", { onClick: C, disabled: !y || !v && !g || b, className: F("px-4 py-2 rounded-lg transition-colors", !y || !v && !g || b ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-solaria text-white hover:bg-solaria-dark"), children: "Guardar" })] })] }); }
function C2() { const { id: l } = Al(), i = $t(), r = Number(l), [c, u] = B.useState(!1), [m, h] = B.useState(!1), [p, b] = B.useState([]), { data: y, isLoading: v, error: g } = Zr(r), { data: k = [] } = Rg(r), { data: C = [] } = $N(r), { data: j = [] } = WN(r), { data: w = [] } = JN(r, 10), T = bu(), K = PN(), Z = IN(), V = e2(), $ = t2(), D = B.useMemo(() => { const E = k.length, J = k.filter(ne => ne.status === "pending").length, Q = k.filter(ne => ne.status === "in_progress").length, xe = k.filter(ne => ne.status === "completed").length, ue = E > 0 ? Math.round(xe / E * 100) : 0; let we = 0; if (y != null && y.endDate) {
    const ne = new Date(y.endDate), se = new Date;
    we = Math.ceil((ne.getTime() - se.getTime()) / (1e3 * 60 * 60 * 24));
} return { total: E, pending: J, inProgress: Q, completed: xe, progress: ue, daysRemaining: we }; }, [k, y]), G = B.useMemo(() => { const J = k.filter(ue => ue.status === "pending").length, Q = k.filter(ue => ue.status === "in_progress").length, xe = k.filter(ue => ue.status === "completed").length; return { backlog: 0, todo: J, doing: Q, done: xe }; }, [k]), q = B.useCallback(() => { u(!0); }, []), Y = B.useCallback(() => { i(`/projects/${r}/tasks`); }, [i, r]), de = B.useCallback(() => { i(`/projects/${r}/links`); }, [i, r]), it = B.useCallback(E => { b(J => [E, ...J]); }, []), Ge = B.useCallback(E => { T.mutate({ id: r, data: E }); }, [r, T]), Se = B.useCallback(E => { K.mutate({ projectId: r, data: { name: E } }); }, [r, K]), We = B.useCallback(E => { Z.mutate({ id: E, projectId: r }); }, [r, Z]), Je = B.useCallback(E => { V.mutate({ projectId: r, data: { name: E } }); }, [r, V]), Ue = B.useCallback(E => { $.mutate({ id: E, projectId: r }); }, [r, $]); return v ? s.jsx("div", { className: "flex items-center justify-center h-64", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-solaria" }) }) : g || !y ? s.jsxs("div", { className: "flex flex-col items-center justify-center h-64 gap-4", children: [s.jsx(St, { className: "h-12 w-12 text-red-500" }), s.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Proyecto no encontrado" }), s.jsxs("p", { className: "text-muted-foreground", children: ["El proyecto con ID ", r, " no existe o no tienes acceso."] }), s.jsxs("button", { onClick: () => i("/projects"), className: "px-4 py-2 rounded-lg bg-solaria text-white flex items-center gap-2", children: [s.jsx(Ba, { className: "h-4 w-4" }), "Volver a Proyectos"] })] }) : s.jsxs("div", { className: "p-4 sm:p-6 space-y-4 sm:space-y-6", children: [s.jsxs("div", { className: "flex items-center justify-between", children: [s.jsxs("div", { className: "flex items-center gap-4", children: [s.jsx("button", { onClick: () => i("/projects"), className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Volver al listado", children: s.jsx(Ba, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsx("h1", { className: "text-xl sm:text-2xl font-bold text-foreground", children: y.name }), s.jsx("p", { className: "text-sm text-muted-foreground", children: y.description })] })] }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsxs("button", { onClick: () => u(!0), className: "px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors", children: [s.jsx(ug, { className: "h-4 w-4" }), s.jsx("span", { className: "hidden sm:inline", children: "Info" })] }), s.jsx("button", { onClick: () => i(`/projects/${r}/settings`), className: "p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors", title: "Configuracion", children: s.jsx(Vr, { className: "h-4 w-4" }) })] })] }), s.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6", children: [s.jsxs("div", { className: "lg:col-span-2 space-y-4 sm:space-y-6", children: [s.jsx(g2, { project: y, metrics: D, onClick: q }), s.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [s.jsx(b2, { metrics: D, tasksByStatus: G, onClick: Y }), s.jsx(y2, { project: y, onClick: de })] }), s.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [s.jsx(N2, { epics: C, onCreateEpic: Se, onDeleteEpic: We }), s.jsx(w2, { sprints: j, onCreateSprint: Je, onDeleteSprint: Ue })] })] }), s.jsxs("div", { className: "space-y-4 sm:space-y-6", children: [s.jsx(v2, { activities: w.map(E => ({ id: E.id, action: E.action, description: E.message || E.action, createdAt: E.createdAt })) }), s.jsx(j2, { notes: p, onAddNote: it })] })] }), s.jsx(S2, { project: y, isOpen: c, onClose: () => u(!1), onEdit: () => h(!0) }), s.jsx(k2, { project: y, isOpen: m, onClose: () => h(!1), onSave: Ge })] }); }
function A2({ item: l, onComplete: i, disabled: r = !1, showDragHandle: c = !1 }) { const [u, m] = B.useState(!1), [h, p] = B.useState(!1), [b, y] = B.useState(""), [v, g] = B.useState(l.estimatedMinutes || 0), k = async () => { if (!(l.isCompleted || r || u)) {
    if (!h && l.estimatedMinutes) {
        p(!0);
        return;
    }
    m(!0);
    try {
        await i(l.id, b || void 0, v || void 0);
    }
    finally {
        m(!1), p(!1);
    }
} }, C = async () => { if (!(l.isCompleted || r || u)) {
    m(!0);
    try {
        await i(l.id);
    }
    finally {
        m(!1);
    }
} }; return s.jsxs("div", { className: F("task-item-row", l.isCompleted && "completed"), children: [c && s.jsx("div", { className: "task-item-handle", children: s.jsx(wj, { className: "h-4 w-4" }) }), s.jsx("button", { onClick: C, disabled: l.isCompleted || r || u, className: F("task-item-checkbox", l.isCompleted && "checked", u && "loading"), children: u ? s.jsx(Re, { className: "h-3 w-3 animate-spin" }) : l.isCompleted ? s.jsx(Sl, { className: "h-3 w-3" }) : null }), s.jsxs("div", { className: "task-item-content", children: [s.jsx("span", { className: F("task-item-title", l.isCompleted && "completed"), children: l.title }), l.description && s.jsx("span", { className: "task-item-description", children: l.description }), h && !l.isCompleted && s.jsxs("div", { className: "task-item-complete-form", children: [s.jsx("input", { type: "number", value: v, onChange: j => g(Number(j.target.value)), placeholder: "Minutos reales", className: "task-item-minutes-input", min: 0 }), s.jsx("input", { type: "text", value: b, onChange: j => y(j.target.value), placeholder: "Notas (opcional)", className: "task-item-notes-input" }), s.jsx("button", { onClick: k, disabled: u, className: "task-item-complete-btn", children: u ? s.jsx(Re, { className: "h-3 w-3 animate-spin" }) : "Completar" }), s.jsx("button", { onClick: () => p(!1), className: "task-item-cancel-btn", children: "Cancelar" })] })] }), s.jsx("div", { className: "task-item-time", children: l.isCompleted && l.completedAt ? s.jsxs("span", { className: "task-item-completed-at", children: [s.jsx(Sl, { className: "h-3 w-3" }), lt(l.completedAt)] }) : l.estimatedMinutes ? s.jsxs("span", { className: "task-item-estimate", children: [s.jsx(Pe, { className: "h-3 w-3" }), l.estimatedMinutes, "m"] }) : null })] }); }
function qg({ taskId: l, editable: i = !0, showAddForm: r = !0 }) { const { data: c, isLoading: u, error: m } = VN(l), h = GN(), p = QN(), [b, y] = B.useState([{ title: "", estimatedMinutes: 30 }]), [v, g] = B.useState(!1), [k, C] = B.useState(!1), j = (c == null ? void 0 : c.filter(G => G.isCompleted).length) || 0, w = (c == null ? void 0 : c.length) || 0, T = w > 0 ? Math.round(j / w * 100) : 0, K = () => { y([...b, { title: "", estimatedMinutes: 30 }]); }, Z = G => { b.length > 1 && y(b.filter((q, Y) => Y !== G)); }, V = (G, q, Y) => { const de = [...b]; q === "title" ? de[G].title = Y : de[G].estimatedMinutes = Y, y(de); }, $ = async () => { const G = b.filter(q => q.title.trim()); if (G.length !== 0) {
    g(!0);
    try {
        await h.mutateAsync({ taskId: l, items: G.map(q => ({ title: q.title.trim(), estimatedMinutes: q.estimatedMinutes })) }), y([{ title: "", estimatedMinutes: 30 }]), C(!1);
    }
    finally {
        g(!1);
    }
} }, D = async (G, q, Y) => { await p.mutateAsync({ taskId: l, itemId: G, notes: q, actualMinutes: Y }); }; return u ? s.jsxs("div", { className: "task-items-loading", children: [s.jsx(Re, { className: "h-5 w-5 animate-spin" }), s.jsx("span", { children: "Cargando subtareas..." })] }) : m ? s.jsx("div", { className: "task-items-error", children: "Error al cargar subtareas" }) : s.jsxs("div", { className: "task-items-list", children: [s.jsxs("div", { className: "task-items-header", children: [s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx(hg, { className: "h-4 w-4 text-muted-foreground" }), s.jsx("span", { className: "font-medium", children: "Subtareas" }), s.jsxs("span", { className: "text-xs text-muted-foreground", children: ["(", j, "/", w, ")"] })] }), w > 0 && s.jsx("div", { className: "task-items-progress-bar", children: s.jsx("div", { className: F("task-items-progress-fill", T === 100 && "complete"), style: { width: `${T}%` } }) })] }), s.jsx("div", { className: "task-items-body", children: c && c.length > 0 ? c.sort((G, q) => G.sortOrder - q.sortOrder).map(G => s.jsx(A2, { item: G, onComplete: D, disabled: !i }, G.id)) : s.jsxs("div", { className: "task-items-empty", children: [s.jsx(nt, { className: "h-8 w-8 text-muted-foreground/50" }), s.jsx("p", { children: "No hay subtareas definidas" })] }) }), i && r && s.jsx("div", { className: "task-items-add", children: k ? s.jsxs("div", { className: "add-items-form", children: [b.map((G, q) => s.jsxs("div", { className: "add-item-row", children: [s.jsx("input", { type: "text", value: G.title, onChange: Y => V(q, "title", Y.target.value), placeholder: "Titulo de la subtarea...", className: "add-item-title", autoFocus: q === b.length - 1 }), s.jsx("input", { type: "number", value: G.estimatedMinutes, onChange: Y => V(q, "estimatedMinutes", Number(Y.target.value)), className: "add-item-minutes", min: 5, step: 5 }), s.jsx("span", { className: "add-item-minutes-label", children: "min" }), b.length > 1 && s.jsx("button", { onClick: () => Z(q), className: "add-item-remove", children: "×" })] }, q)), s.jsxs("div", { className: "add-items-actions", children: [s.jsxs("button", { onClick: K, className: "add-another-btn", children: [s.jsx(mt, { className: "h-3 w-3" }), "Agregar otra"] }), s.jsxs("div", { className: "flex gap-2", children: [s.jsx("button", { onClick: () => { C(!1), y([{ title: "", estimatedMinutes: 30 }]); }, className: "cancel-btn", children: "Cancelar" }), s.jsx("button", { onClick: $, disabled: v || !b.some(G => G.title.trim()), className: "submit-items-btn", children: v ? s.jsx(Re, { className: "h-4 w-4 animate-spin" }) : "Guardar" })] })] })] }) : s.jsxs("button", { onClick: () => C(!0), className: "add-items-trigger", children: [s.jsx(mt, { className: "h-4 w-4" }), "Agregar subtareas"] }) })] }); }
const Ar = { critical: 0, high: 1, medium: 2, low: 3 }, Tr = { pending: 0, in_progress: 1, blocked: 2, completed: 3 }, On = { pending: "todo", blocked: "backlog", in_progress: "doing", review: "doing", completed: "done", cancelled: "done" }, T2 = [{ key: "backlog", label: "Backlog", color: "#64748b" }, { key: "todo", label: "Por Hacer", color: "#f59e0b" }, { key: "doing", label: "En Progreso", color: "#3b82f6" }, { key: "done", label: "Completadas", color: "#22c55e" }], ma = { critical: { color: "#ef4444", label: "P0", bg: "rgba(239, 68, 68, 0.2)" }, high: { color: "#f59e0b", label: "P1", bg: "rgba(249, 115, 22, 0.2)" }, medium: { color: "#3b82f6", label: "P2", bg: "rgba(59, 130, 246, 0.2)" }, low: { color: "#64748b", label: "P3", bg: "rgba(100, 116, 139, 0.2)" } }, $r = { pending: "Pendiente", in_progress: "En Progreso", review: "En Revision", completed: "Completada", blocked: "Bloqueada", cancelled: "Cancelada" };
function E2({ task: l, agent: i, onClick: r }) { const c = ma[l.priority] || ma.medium, u = l.status === "in_progress", m = l.taskCode || `#${l.id}`; return s.jsxs("div", { onClick: r, className: "task-card bg-secondary border border-border rounded-lg p-3 cursor-pointer transition-all hover:border-solaria hover:-translate-y-0.5", children: [s.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [s.jsxs("span", { className: "text-[13px] font-medium text-foreground leading-tight", children: [s.jsx("span", { className: "text-solaria font-semibold mr-1.5", children: m }), l.title] }), s.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [s.jsx("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase", style: { background: c.bg, color: c.color }, children: c.label }), l.estimatedHours && l.estimatedHours > 0 && s.jsxs("span", { className: "text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1", children: [s.jsx(dg, { className: "h-2.5 w-2.5" }), l.estimatedHours, "h"] })] })] }), l.description && s.jsx("p", { className: "text-[11px] text-muted-foreground mb-2.5 line-clamp-2", children: l.description }), u && l.progress > 0 && s.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [s.jsx("div", { className: "flex-1 h-1 bg-background/50 rounded overflow-hidden", children: s.jsx("div", { className: "h-full rounded transition-all", style: { width: `${l.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}dd)` } }) }), s.jsxs("span", { className: "text-[10px] font-bold min-w-[32px] text-right", style: { color: l.progress >= 100 ? "#22c55e" : c.color }, children: [l.progress, "%"] })] }), s.jsxs("div", { className: "flex items-center justify-between", children: [s.jsxs("div", { className: "flex items-center gap-2", children: [i ? s.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-solaria bg-solaria/10 px-1.5 py-0.5 rounded", children: [s.jsx(Lr, { className: "h-3 w-3" }), i.name.replace("SOLARIA-", "")] }) : s.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [s.jsx(Ds, { className: "h-3 w-3" }), "Sin asignar"] }), l.status && l.status !== "in_progress" && s.jsx("span", { className: "text-[8px] px-1 py-0.5 bg-secondary rounded text-muted-foreground", children: $r[l.status] || l.status })] }), l.createdAt && s.jsxs("span", { className: "text-[9px] text-muted-foreground flex items-center gap-1", children: [s.jsx(Pe, { className: "h-2.5 w-2.5" }), lt(l.createdAt)] })] })] }); }
function M2({ column: l, tasks: i, agents: r, onTaskClick: c, onAddTask: u }) { const m = h => r.find(p => p.id === h); return s.jsxs("div", { className: F("flex-1 min-w-0 bg-secondary/30 rounded-xl flex flex-col h-full overflow-hidden", `kanban-column-${l.key}`), children: [s.jsxs("div", { className: "px-4 py-3 flex items-center justify-between border-b border-border", children: [s.jsxs("span", { className: "text-xs font-semibold uppercase tracking-wide flex items-center gap-2", children: [s.jsx("span", { className: "w-2 h-2 rounded-full", style: { background: l.color } }), l.label] }), s.jsx("span", { className: "text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full", children: i.length })] }), s.jsxs("div", { className: "flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2", children: [i.map(h => s.jsx(E2, { task: h, agent: m(h.assignedAgentId), onClick: () => c(h.id) }, h.id)), l.key === "backlog" && u && s.jsxs("button", { onClick: u, className: "w-full p-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-xs hover:border-solaria hover:text-solaria transition-colors flex items-center justify-center gap-1.5", children: [s.jsx(mt, { className: "h-3.5 w-3.5" }), "Agregar tarea"] }), i.length === 0 && l.key !== "backlog" && s.jsx("div", { className: "text-center py-8 text-muted-foreground text-xs", children: "Sin tareas" })] })] }); }
function _2({ tasks: l, agents: i, onTaskClick: r, onCreateTask: c }) { const u = B.useMemo(() => { const m = { backlog: [], todo: [], doing: [], done: [] }; return l.forEach(h => { const p = On[h.status] || "todo"; m[p].push(h); }), m; }, [l]); return s.jsx("div", { className: "kanban-board flex gap-3 h-[calc(100vh-320px)] min-h-[400px]", children: T2.map(m => s.jsx(M2, { column: m, tasks: u[m.key] || [], agents: i, onTaskClick: r, onAddTask: m.key === "backlog" ? c : void 0 }, m.key)) }); }
function O2({ tasks: l, agents: i, sortBy: r, onTaskClick: c }) { const u = h => i.find(p => p.id === h), m = B.useMemo(() => [...l].sort((h, p) => r === "priority" ? (Ar[h.priority] ?? 3) - (Ar[p.priority] ?? 3) : r === "status" ? (Tr[h.status] ?? 0) - (Tr[p.status] ?? 0) : r === "progress" ? (p.progress || 0) - (h.progress || 0) : 0), [l, r]); return s.jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: [m.map(h => { var v; const p = u(h.assignedAgentId), b = h.status === "completed", y = ma[h.priority] || ma.medium; return s.jsxs("div", { onClick: () => c(h.id), className: "flex items-center gap-4 p-4 bg-card border-b border-border last:border-b-0 hover:bg-secondary/30 cursor-pointer transition-colors", children: [s.jsx("div", { className: "w-1 h-12 rounded-full flex-shrink-0", style: { background: y.color } }), b && s.jsx(nt, { className: "h-5 w-5 text-green-500 flex-shrink-0" }), s.jsxs("div", { className: "flex-1 min-w-0", children: [s.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [s.jsx("h4", { className: F("font-medium truncate", b && "line-through opacity-70"), children: h.title }), s.jsx("span", { className: "px-2 py-0.5 rounded text-xs", style: { background: y.bg, color: y.color }, children: $r[h.status] || h.status })] }), s.jsx("p", { className: "text-sm text-muted-foreground truncate", children: h.description || "Sin descripcion" })] }), s.jsxs("div", { className: "w-32 flex-shrink-0", children: [s.jsxs("div", { className: "flex justify-between text-xs mb-1", children: [s.jsx("span", { className: "text-muted-foreground", children: "Progreso" }), s.jsxs("span", { children: [h.progress, "%"] })] }), s.jsx("div", { className: "h-2 bg-secondary rounded-full overflow-hidden", children: s.jsx("div", { className: F("h-full rounded-full transition-all", b ? "bg-green-500" : "bg-solaria"), style: { width: `${h.progress}%` } }) })] }), s.jsxs("div", { className: "w-32 text-right flex-shrink-0", children: [s.jsx("p", { className: "text-sm", children: ((v = p == null ? void 0 : p.name) == null ? void 0 : v.replace("SOLARIA-", "")) || "Sin asignar" }), s.jsxs("p", { className: "text-xs text-muted-foreground", children: [h.estimatedHours || 0, "h"] })] }), s.jsx(ou, { className: "h-5 w-5 text-muted-foreground flex-shrink-0" })] }, h.id); }), m.length === 0 && s.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No hay tareas" })] }); }
function D2({ tasks: l, agents: i, sortBy: r, onTaskClick: c }) { const u = b => i.find(y => y.id === b), m = B.useMemo(() => [...l].sort((b, y) => r === "priority" ? (Ar[b.priority] ?? 3) - (Ar[y.priority] ?? 3) : r === "status" ? (Tr[b.status] ?? 0) - (Tr[y.status] ?? 0) : r === "progress" ? (y.progress || 0) - (b.progress || 0) : 0), [l, r]), h = B.useMemo(() => Math.max(...l.map(b => b.estimatedHours || 0), 8), [l]), p = b => { switch (b) {
    case "critical": return "linear-gradient(to right, #ef4444, #dc2626)";
    case "high": return "linear-gradient(to right, #f97316, #ea580c)";
    case "medium": return "linear-gradient(to right, #f6921d, #d97b0d)";
    case "low": return "linear-gradient(to right, #6b7280, #4b5563)";
    default: return "linear-gradient(to right, #f6921d, #d97b0d)";
} }; return s.jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: [s.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between", children: [s.jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [s.jsx(xu, { className: "h-5 w-5 text-solaria" }), "Vista Gantt"] }), s.jsxs("div", { className: "flex gap-4 text-xs", children: [s.jsxs("span", { className: "flex items-center gap-1.5", children: [s.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#ef4444" } }), "Crítica"] }), s.jsxs("span", { className: "flex items-center gap-1.5", children: [s.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#f97316" } }), "Alta"] }), s.jsxs("span", { className: "flex items-center gap-1.5", children: [s.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#f6921d" } }), "Media"] }), s.jsxs("span", { className: "flex items-center gap-1.5", children: [s.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#6b7280" } }), "Baja"] })] })] }), s.jsxs("div", { className: "flex items-center gap-4 px-4 py-2 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [s.jsx("div", { className: "w-72", children: "Tarea" }), s.jsx("div", { className: "w-24 text-center", children: "Estado" }), s.jsx("div", { className: "flex-1", children: "Timeline (horas)" })] }), s.jsxs("div", { className: "divide-y divide-border", children: [m.map(b => { var j; const y = u(b.assignedAgentId), v = b.status === "completed", g = ma[b.priority] || ma.medium, k = (b.estimatedHours || 0) / h * 100, C = b.progress || 0; return s.jsxs("div", { onClick: () => c(b.id), className: "flex items-center gap-4 py-3 px-4 hover:bg-secondary/30 cursor-pointer transition-colors", children: [s.jsxs("div", { className: "w-72 min-w-0", children: [s.jsx("p", { className: F("text-sm truncate font-medium", v && "line-through opacity-70"), children: b.title }), s.jsx("p", { className: "text-xs text-muted-foreground truncate", children: ((j = y == null ? void 0 : y.name) == null ? void 0 : j.replace("SOLARIA-", "")) || "Sin asignar" })] }), s.jsx("div", { className: "w-24 text-center", children: s.jsx("span", { className: "inline-block px-2 py-1 rounded text-xs", style: { background: g.bg, color: g.color }, children: $r[b.status] || b.status }) }), s.jsxs("div", { className: "flex-1 h-8 bg-secondary/50 rounded relative overflow-hidden", children: [k > 0 && s.jsxs("div", { className: "absolute inset-y-0 left-0 rounded flex items-center transition-all", style: { width: `${Math.max(k, 10)}%`, background: p(b.priority) }, children: [s.jsx("div", { className: "absolute inset-y-0 left-0 bg-white/30 rounded", style: { width: `${C}%` } }), s.jsxs("span", { className: "text-xs text-white px-2 font-medium relative z-10 drop-shadow", children: [b.estimatedHours || 0, "h - ", C, "%"] })] }), k === 0 && s.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Sin estimación" })] })] }, b.id); }), m.length === 0 && s.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No hay tareas" })] })] }); }
function z2({ task: l, agent: i, isOpen: r, onClose: c }) { const [u, m] = B.useState(!1), { data: h = [], isLoading: p } = YN((l == null ? void 0 : l.id) || 0), { data: b = [] } = KN(), y = XN(), v = ZN(), g = B.useMemo(() => { const K = new Set(h.map(Z => Z.id)); return b.filter(Z => !K.has(Z.id)); }, [h, b]), k = B.useCallback(K => { l && (y.mutate({ taskId: l.id, tagId: K }), m(!1)); }, [l, y]), C = B.useCallback(K => { l && v.mutate({ taskId: l.id, tagId: K }); }, [l, v]); if (!l)
    return null; const j = ma[l.priority] || ma.medium, w = $r[l.status] || l.status, T = l.taskCode || `#${l.id}`; return s.jsxs(Fr, { isOpen: r, onClose: c, title: "", maxWidth: "max-w-2xl", children: [s.jsxs("div", { className: "px-6 py-4 border-b border-border", style: { borderLeft: `4px solid ${j.color}` }, children: [s.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [s.jsx("span", { className: "px-2 py-1 rounded text-[11px] font-bold", style: { background: j.bg, color: j.color }, children: j.label }), s.jsx("span", { className: "px-2 py-1 rounded text-[11px] bg-secondary", children: w }), s.jsx("span", { className: "text-[11px] text-muted-foreground", children: T })] }), s.jsx("h3", { className: "text-lg font-semibold", children: l.title })] }), s.jsxs("div", { className: "p-6 space-y-6", children: [s.jsxs("div", { children: [s.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [s.jsx(dj, { className: "h-4 w-4 text-solaria" }), "Descripcion"] }), s.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: l.description || "Sin descripcion disponible" })] }), l.progress > 0 && s.jsxs("div", { children: [s.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [s.jsx(Cj, { className: "h-4 w-4 text-solaria" }), "Progreso"] }), s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "flex-1 h-2 bg-secondary rounded-full overflow-hidden", children: s.jsx("div", { className: "h-full rounded-full", style: { width: `${l.progress}%`, background: j.color } }) }), s.jsxs("span", { className: "text-sm font-semibold", style: { color: j.color }, children: [l.progress, "%"] })] })] }), s.jsx("div", { className: "border border-border rounded-lg p-4 bg-secondary/30", children: s.jsx(qg, { taskId: l.id, editable: l.status !== "completed", showAddForm: l.status !== "completed" }) }), s.jsxs("div", { children: [s.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [s.jsx(bg, { className: "h-4 w-4 text-solaria" }), "Etiquetas"] }), s.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [p ? s.jsx(Re, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : h.length === 0 ? s.jsx("span", { className: "text-xs text-muted-foreground", children: "Sin etiquetas" }) : h.map(K => s.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium group", style: { backgroundColor: `${K.color}20`, color: K.color }, children: [K.name, s.jsx("button", { onClick: () => C(K.id), className: "opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5", title: "Eliminar etiqueta", children: s.jsx(zs, { className: "h-3 w-3" }) })] }, K.id)), u ? s.jsx("div", { className: "relative", children: s.jsxs("div", { className: "absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] max-h-[200px] overflow-y-auto", children: [g.length === 0 ? s.jsx("p", { className: "text-xs text-muted-foreground p-2", children: "No hay etiquetas disponibles" }) : g.map(K => s.jsxs("button", { onClick: () => k(K.id), className: "w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors flex items-center gap-2", children: [s.jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: K.color } }), s.jsx("span", { className: "text-sm", children: K.name })] }, K.id)), s.jsx("button", { onClick: () => m(!1), className: "w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors text-xs text-muted-foreground mt-1 border-t border-border", children: "Cancelar" })] }) }) : s.jsx("button", { onClick: () => m(!0), className: "px-2 py-1 rounded text-xs border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-solaria hover:text-solaria transition-colors", children: "+ Agregar" })] })] }), s.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [s.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [s.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [s.jsx(Ds, { className: "h-3 w-3 text-blue-400" }), "Asignado a"] }), s.jsx("p", { className: "text-sm font-medium", children: (i == null ? void 0 : i.name) || "Sin asignar" })] }), s.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [s.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [s.jsx(dg, { className: "h-3 w-3 text-yellow-400" }), "Horas Estimadas"] }), s.jsxs("p", { className: "text-sm font-medium", children: [l.estimatedHours || 0, " horas"] })] }), s.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [s.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [s.jsx(ua, { className: "h-3 w-3 text-green-400" }), "Fecha Creacion"] }), s.jsx("p", { className: "text-sm font-medium", children: l.createdAt ? new Date(l.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "N/A" })] }), s.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [s.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [s.jsx(ua, { className: "h-3 w-3 text-red-400" }), "Ultima Actualizacion"] }), s.jsx("p", { className: "text-sm font-medium", children: l.updatedAt ? lt(l.updatedAt) : "N/A" })] })] })] }), s.jsxs("div", { className: "px-6 py-4 border-t border-border flex items-center justify-between", children: [s.jsx("button", { onClick: c, className: "px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm", children: "Cerrar" }), s.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg", children: [s.jsx(Lr, { className: "h-3.5 w-3.5" }), "Solo el agente puede completar"] })] })] }); }
function R2({ isOpen: l, onClose: i, projectId: r, onTaskCreated: c }) { const [u, m] = B.useState(""), [h, p] = B.useState(""), [b, y] = B.useState("medium"), [v, g] = B.useState(1), k = RN(), C = async (j) => { if (j.preventDefault(), !!u.trim())
    try {
        await k.mutateAsync({ projectId: r, title: u.trim(), description: h.trim(), priority: b, status: "pending", estimatedHours: v }), m(""), p(""), y("medium"), g(1), c(), i();
    }
    catch (w) {
        console.error("Error creating task:", w);
    } }; return s.jsx(Fr, { isOpen: l, onClose: i, title: "Nueva Tarea", maxWidth: "max-w-lg", children: s.jsxs("form", { onSubmit: C, className: "p-6 space-y-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium mb-2", children: "Titulo *" }), s.jsx("input", { type: "text", value: u, onChange: j => m(j.target.value), placeholder: "Nombre de la tarea...", className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none", required: !0, autoFocus: !0 })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium mb-2", children: "Descripcion" }), s.jsx("textarea", { value: h, onChange: j => p(j.target.value), placeholder: "Describe la tarea...", rows: 4, className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none resize-none" })] }), s.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium mb-2", children: "Prioridad" }), s.jsxs("select", { value: b, onChange: j => y(j.target.value), className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none", children: [s.jsx("option", { value: "low", children: "P3 - Baja" }), s.jsx("option", { value: "medium", children: "P2 - Media" }), s.jsx("option", { value: "high", children: "P1 - Alta" }), s.jsx("option", { value: "critical", children: "P0 - Critica" })] })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm font-medium mb-2", children: "Horas Estimadas" }), s.jsx("input", { type: "number", value: v, onChange: j => g(Number(j.target.value)), min: .5, step: .5, className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none" })] })] }), s.jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-border", children: [s.jsx("button", { type: "button", onClick: i, className: "px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors", children: "Cancelar" }), s.jsx("button", { type: "submit", disabled: !u.trim() || k.isPending, className: "px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: k.isPending ? "Creando..." : "Crear Tarea" })] })] }) }); }
function q2() { const { id: l } = Al(), i = $t(), r = parseInt(l || "0"), [c, u] = B.useState("kanban"), [m, h] = B.useState("priority"), [p, b] = B.useState(!1), [y, v] = B.useState(null), { data: g, isLoading: k } = Zr(r), { data: C, isLoading: j, refetch: w } = Rg(r), { data: T } = zg(), K = B.useMemo(() => C ? { backlog: C.filter(q => On[q.status] === "backlog").length, todo: C.filter(q => On[q.status] === "todo").length, doing: C.filter(q => On[q.status] === "doing").length, done: C.filter(q => On[q.status] === "done").length } : { backlog: 0, todo: 0, doing: 0, done: 0 }, [C]), Z = B.useMemo(() => !y || !C ? null : C.find(q => q.id === y) || null, [y, C]), V = B.useMemo(() => { if (!(!Z || !T))
    return T.find(q => q.id === Z.assignedAgentId); }, [Z, T]), $ = B.useCallback(q => { v(q); }, []), D = B.useCallback(() => { w(); }, [w]), G = () => { i(`/projects/${r}`); }; return k || j ? s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : g ? s.jsxs("div", { className: "h-full flex flex-col", children: [s.jsxs("div", { className: "flex items-center justify-between mb-4 flex-shrink-0", children: [s.jsxs("div", { className: "flex items-center gap-4", children: [s.jsx("button", { onClick: G, className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Volver al proyecto", children: s.jsx(Ba, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsxs("h1", { className: "text-xl font-bold", children: ["Tareas - ", g.name] }), s.jsxs("p", { className: "text-sm text-muted-foreground", children: [(C == null ? void 0 : C.length) || 0, " tareas en total"] })] })] }), s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsxs("div", { className: "flex bg-secondary rounded-lg overflow-hidden", children: [s.jsxs("button", { onClick: () => u("kanban"), className: F("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "kanban" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [s.jsx(Un, { className: "h-4 w-4" }), "Kanban"] }), s.jsxs("button", { onClick: () => u("list"), className: F("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "list" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [s.jsx(Ln, { className: "h-4 w-4" }), "Lista"] }), s.jsxs("button", { onClick: () => u("gantt"), className: F("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "gantt" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [s.jsx(xu, { className: "h-4 w-4" }), "Gantt"] })] }), (c === "list" || c === "gantt") && s.jsxs("select", { value: m, onChange: q => h(q.target.value), className: "px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:border-solaria focus:outline-none transition-colors", children: [s.jsx("option", { value: "priority", children: "Ordenar: Prioridad" }), s.jsx("option", { value: "status", children: "Ordenar: Estado" }), s.jsx("option", { value: "progress", children: "Ordenar: Progreso" })] }), s.jsxs("button", { onClick: () => b(!0), className: "px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium flex items-center gap-2 transition-colors", children: [s.jsx(mt, { className: "h-4 w-4" }), "Nueva Tarea"] })] })] }), s.jsxs("div", { className: "flex items-center gap-1 mb-3 flex-shrink-0 bg-secondary/50 rounded-lg p-2", children: [s.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [s.jsx("div", { className: "text-base font-bold", style: { color: "#64748b" }, children: K.backlog }), s.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Backlog" })] }), s.jsx("div", { className: "w-px h-8 bg-border" }), s.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [s.jsx("div", { className: "text-base font-bold", style: { color: "#f59e0b" }, children: K.todo }), s.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Por Hacer" })] }), s.jsx("div", { className: "w-px h-8 bg-border" }), s.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [s.jsx("div", { className: "text-base font-bold", style: { color: "#3b82f6" }, children: K.doing }), s.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "En Progreso" })] }), s.jsx("div", { className: "w-px h-8 bg-border" }), s.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [s.jsx("div", { className: "text-base font-bold", style: { color: "#22c55e" }, children: K.done }), s.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Completadas" })] })] }), s.jsxs("div", { className: "flex-1 min-h-0", children: [c === "kanban" && s.jsx(_2, { tasks: C || [], agents: T || [], onTaskClick: $, onCreateTask: () => b(!0) }), c === "list" && s.jsx("div", { className: "h-full overflow-auto", children: s.jsx(O2, { tasks: C || [], agents: T || [], sortBy: m, onTaskClick: $ }) }), c === "gantt" && s.jsx("div", { className: "h-full overflow-auto", children: s.jsx(D2, { tasks: C || [], agents: T || [], sortBy: m, onTaskClick: $ }) })] }), s.jsx(R2, { isOpen: p, onClose: () => b(!1), projectId: r, onTaskCreated: D }), s.jsx(z2, { task: Z, agent: V, isOpen: !!y, onClose: () => v(null) })] }) : s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx("p", { className: "text-muted-foreground", children: "Proyecto no encontrado" }) }); }
const ip = { production: { label: "Produccion", icon: uu, color: "text-emerald-400", bgColor: "bg-emerald-500/10" }, staging: { label: "Staging/Dev", icon: jr, color: "text-amber-400", bgColor: "bg-amber-500/10" }, local: { label: "Local", icon: mg, color: "text-blue-400", bgColor: "bg-blue-500/10" }, repository: { label: "Repositorio", icon: Nj, color: "text-violet-400", bgColor: "bg-violet-500/10" }, other: { label: "Otro", icon: fu, color: "text-gray-400", bgColor: "bg-gray-500/10" } };
function B2() { const { id: l } = Al(), i = $t(), { data: r, isLoading: c } = Zr(Number(l)), u = bu(), [m, h] = B.useState(!1), [p, b] = B.useState({ type: "other", label: "", url: "" }), [y, v] = B.useState(null), g = [(r == null ? void 0 : r.productionUrl) && { id: "prod", type: "production", label: "Produccion", url: r.productionUrl }, (r == null ? void 0 : r.stagingUrl) && { id: "staging", type: "staging", label: "Staging", url: r.stagingUrl }, (r == null ? void 0 : r.localUrl) && { id: "local", type: "local", label: "Local", url: r.localUrl }, (r == null ? void 0 : r.repoUrl) && { id: "repo", type: "repository", label: "GitHub", url: r.repoUrl }].filter(Boolean), k = async (w, T) => { await navigator.clipboard.writeText(w), v(T), setTimeout(() => v(null), 2e3); }, C = async () => { if (!p.url.trim())
    return; const w = { production: "productionUrl", staging: "stagingUrl", local: "localUrl", repository: "repoUrl", other: "productionUrl" }; await u.mutateAsync({ id: Number(l), data: { [w[p.type]]: p.url.trim() } }), b({ type: "other", label: "", url: "" }), h(!1); }, j = async (w) => { const T = { prod: "productionUrl", staging: "stagingUrl", local: "localUrl", repo: "repoUrl" }; T[w] && await u.mutateAsync({ id: Number(l), data: { [T[w]]: null } }); }; return c ? s.jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : r ? s.jsxs("div", { className: "p-6 max-w-4xl mx-auto", children: [s.jsxs("div", { className: "flex items-center gap-4 mb-8", children: [s.jsx("button", { onClick: () => i(`/projects/${l}`), className: "p-2 rounded-lg hover:bg-secondary transition-colors", children: s.jsx(Ba, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsx("h1", { className: "text-2xl font-bold", children: "Direcciones del Proyecto" }), s.jsx("p", { className: "text-muted-foreground", children: r.name })] })] }), s.jsx("div", { className: "space-y-3 mb-6", children: g.length === 0 ? s.jsxs("div", { className: "text-center py-12 bg-card rounded-xl border border-border", children: [s.jsx(fu, { className: "h-12 w-12 mx-auto text-muted-foreground/50 mb-4" }), s.jsx("p", { className: "text-muted-foreground mb-4", children: "No hay direcciones configuradas" }), s.jsxs("button", { onClick: () => h(!0), className: "px-4 py-2 bg-solaria text-white rounded-lg hover:bg-solaria/90 transition-colors", children: [s.jsx(mt, { className: "h-4 w-4 inline mr-2" }), "Agregar primera direccion"] })] }) : g.map(w => { const T = ip[w.type], K = T.icon; return s.jsxs("div", { className: "flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-border/80 transition-colors", children: [s.jsx("div", { className: F("p-2.5 rounded-lg", T.bgColor, T.color), children: s.jsx(K, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "flex-1 min-w-0", children: [s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("span", { className: "font-medium", children: w.label }), s.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground", children: T.label })] }), s.jsx("p", { className: "text-sm text-muted-foreground truncate", children: w.url })] }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("button", { onClick: () => k(w.url, w.id), className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Copiar URL", children: y === w.id ? s.jsx(Sl, { className: "h-4 w-4 text-emerald-400" }) : s.jsx(wl, { className: "h-4 w-4 text-muted-foreground" }) }), s.jsx("a", { href: w.url, target: "_blank", rel: "noopener noreferrer", className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Abrir en nueva pestana", children: s.jsx(Jt, { className: "h-4 w-4 text-muted-foreground" }) }), s.jsx("button", { onClick: () => j(w.id), className: "p-2 rounded-lg hover:bg-red-500/10 transition-colors", title: "Eliminar", children: s.jsx(Gr, { className: "h-4 w-4 text-red-400" }) })] })] }, w.id); }) }), g.length > 0 && !m && s.jsxs("button", { onClick: () => h(!0), className: "w-full p-4 border border-dashed border-border rounded-xl text-muted-foreground hover:border-solaria hover:text-solaria transition-colors flex items-center justify-center gap-2", children: [s.jsx(mt, { className: "h-5 w-5" }), "Agregar direccion"] }), m && s.jsxs("div", { className: "p-6 bg-card rounded-xl border border-border", children: [s.jsx("h3", { className: "font-medium mb-4", children: "Nueva Direccion" }), s.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Tipo" }), s.jsx("select", { value: p.type, onChange: w => b({ ...p, type: w.target.value }), className: "w-full p-2.5 bg-secondary rounded-lg border border-border text-sm", children: Object.entries(ip).map(([w, { label: T }]) => s.jsx("option", { value: w, children: T }, w)) })] }), s.jsxs("div", { className: "md:col-span-2", children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "URL" }), s.jsx("input", { type: "url", value: p.url, onChange: w => b({ ...p, url: w.target.value }), placeholder: "https://...", className: "w-full p-2.5 bg-secondary rounded-lg border border-border text-sm" })] })] }), s.jsxs("div", { className: "flex justify-end gap-3", children: [s.jsx("button", { onClick: () => { h(!1), b({ type: "other", label: "", url: "" }); }, className: "px-4 py-2 text-sm text-muted-foreground hover:text-foreground", children: "Cancelar" }), s.jsx("button", { onClick: C, disabled: !p.url.trim() || u.isPending, className: "px-4 py-2 bg-solaria text-white rounded-lg text-sm hover:bg-solaria/90 disabled:opacity-50", children: u.isPending ? s.jsx(Re, { className: "h-4 w-4 animate-spin" }) : "Guardar" })] })] })] }) : s.jsx("div", { className: "p-8 text-center text-muted-foreground", children: "Proyecto no encontrado" }); }
const U2 = ["React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "Node.js", "Express", "Fastify", "NestJS", "Python", "Django", "FastAPI", "Flask", "TypeScript", "JavaScript", "Go", "Rust", "PHP", "Laravel", "PostgreSQL", "MySQL", "MariaDB", "MongoDB", "Redis", "SQLite", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel", "TailwindCSS", "Sass", "styled-components", "Payload CMS", "GraphQL", "REST API", "Drizzle ORM", "Prisma"], L2 = ["SAAS", "B2B", "B2C", "E-COMMERCE", "LANDING", "DASHBOARD", "REACT", "VUE", "MOBILE", "API", "CMS", "INTERNAL", "MVP", "PRODUCTION", "STAGING", "LEGACY", "MAINTENANCE"], H2 = [{ value: "planning", label: "Planificacion", color: "bg-violet-500" }, { value: "active", label: "En Desarrollo", color: "bg-solaria" }, { value: "paused", label: "Pausado", color: "bg-amber-500" }, { value: "completed", label: "Completado", color: "bg-emerald-500" }, { value: "cancelled", label: "Cancelado", color: "bg-red-500" }], V2 = [{ value: "critical", label: "Critica", color: "text-red-400" }, { value: "high", label: "Alta", color: "text-amber-400" }, { value: "medium", label: "Media", color: "text-blue-400" }, { value: "low", label: "Baja", color: "text-gray-400" }];
function G2() { const { id: l } = Al(), i = $t(), { data: r, isLoading: c } = Zr(Number(l)), u = bu(), [m, h] = B.useState({ name: "", code: "", description: "", status: "planning", priority: "medium", budgetAllocated: 0, startDate: "", endDate: "", tags: [], stack: [], clientName: "", clientEmail: "", clientPhone: "" }), [p, b] = B.useState(!1), [y, v] = B.useState(!1), [g, k] = B.useState(""), [C, j] = B.useState(""); B.useEffect(() => { var D; if (r) {
    let G = [], q = [];
    try {
        typeof r.tags == "string" ? G = JSON.parse(r.tags) : Array.isArray(r.tags) && (G = r.tags);
    }
    catch { }
    try {
        typeof r.stack == "string" ? q = JSON.parse(r.stack) : Array.isArray(r.stack) && (q = r.stack);
    }
    catch { }
    h({ name: r.name || "", code: r.code || "", description: r.description || "", status: r.status || "planning", priority: r.priority || "medium", budgetAllocated: r.budgetAllocated || 0, startDate: r.startDate ? new Date(r.startDate).toISOString().split("T")[0] : "", endDate: r.endDate ? new Date(r.endDate).toISOString().split("T")[0] : "", tags: G, stack: q, clientName: ((D = r.client) == null ? void 0 : D.name) || "", clientEmail: "", clientPhone: "" });
} }, [r]); const w = (D, G) => { h(q => ({ ...q, [D]: G })), b(!0); }, T = () => { const D = g.trim().toUpperCase(); D && !m.tags.includes(D) && (h(G => ({ ...G, tags: [...G.tags, D] })), k(""), b(!0)); }, K = D => { h(G => ({ ...G, tags: G.tags.filter(q => q !== D) })), b(!0); }, Z = () => { const D = C.trim(); D && !m.stack.includes(D) && (h(G => ({ ...G, stack: [...G.stack, D] })), j(""), b(!0)); }, V = D => { h(G => ({ ...G, stack: G.stack.filter(q => q !== D) })), b(!0); }, $ = async () => { await u.mutateAsync({ id: Number(l), data: { name: m.name, code: m.code, description: m.description, status: m.status, priority: m.priority, budgetAllocated: Number(m.budgetAllocated), startDate: m.startDate || void 0, endDate: m.endDate || void 0, tags: m.tags, stack: m.stack } }), b(!1); }; return c ? s.jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : r ? s.jsxs("div", { className: "p-6 max-w-4xl mx-auto", children: [s.jsxs("div", { className: "flex items-center justify-between mb-8", children: [s.jsxs("div", { className: "flex items-center gap-4", children: [s.jsx("button", { onClick: () => i(`/projects/${l}`), className: "p-2 rounded-lg hover:bg-secondary transition-colors", children: s.jsx(Ba, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [s.jsx(Vr, { className: "h-6 w-6" }), "Configuracion del Proyecto"] }), s.jsx("p", { className: "text-muted-foreground", children: r.name })] })] }), p && s.jsxs("button", { onClick: $, disabled: u.isPending, className: "flex items-center gap-2 px-4 py-2 bg-solaria text-white rounded-lg hover:bg-solaria/90 disabled:opacity-50", children: [u.isPending ? s.jsx(Re, { className: "h-4 w-4 animate-spin" }) : s.jsx(hu, { className: "h-4 w-4" }), "Guardar Cambios"] })] }), s.jsxs("div", { className: "space-y-6", children: [s.jsxs("section", { className: "bg-card rounded-xl border border-border p-6", children: [s.jsx("h2", { className: "text-lg font-semibold mb-4", children: "Informacion Basica" }), s.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Nombre del Proyecto" }), s.jsx("input", { type: "text", value: m.name, onChange: D => w("name", D.target.value), className: "w-full p-3 bg-secondary rounded-lg border border-border" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Codigo" }), s.jsx("input", { type: "text", value: m.code, onChange: D => w("code", D.target.value.toUpperCase()), maxLength: 5, className: "w-full p-3 bg-secondary rounded-lg border border-border uppercase font-mono" })] }), s.jsxs("div", { className: "md:col-span-2", children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Descripcion" }), s.jsx("textarea", { value: m.description, onChange: D => w("description", D.target.value), rows: 3, className: "w-full p-3 bg-secondary rounded-lg border border-border resize-none" })] })] })] }), s.jsxs("section", { className: "bg-card rounded-xl border border-border p-6", children: [s.jsx("h2", { className: "text-lg font-semibold mb-4", children: "Estado y Prioridad" }), s.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Estado" }), s.jsx("div", { className: "flex flex-wrap gap-2", children: H2.map(D => s.jsx("button", { onClick: () => w("status", D.value), className: F("px-3 py-1.5 rounded-full text-sm font-medium transition-all", m.status === D.value ? `${D.color} text-white` : "bg-secondary text-muted-foreground hover:text-foreground"), children: D.label }, D.value)) })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Prioridad" }), s.jsx("div", { className: "flex flex-wrap gap-2", children: V2.map(D => s.jsx("button", { onClick: () => w("priority", D.value), className: F("px-3 py-1.5 rounded-full text-sm font-medium transition-all border", m.priority === D.value ? `${D.color} border-current bg-current/10` : "border-border text-muted-foreground hover:text-foreground"), children: D.label }, D.value)) })] })] })] }), s.jsxs("section", { className: "bg-card rounded-xl border border-border p-6", children: [s.jsx("h2", { className: "text-lg font-semibold mb-4", children: "Presupuesto y Fechas" }), s.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Presupuesto ($)" }), s.jsx("input", { type: "number", value: m.budgetAllocated, onChange: D => w("budgetAllocated", Number(D.target.value)), min: 0, step: 1e3, className: "w-full p-3 bg-secondary rounded-lg border border-border" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Fecha de Inicio" }), s.jsx("input", { type: "date", value: m.startDate, onChange: D => w("startDate", D.target.value), className: "w-full p-3 bg-secondary rounded-lg border border-border" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Fecha Limite" }), s.jsx("input", { type: "date", value: m.endDate, onChange: D => w("endDate", D.target.value), className: "w-full p-3 bg-secondary rounded-lg border border-border" })] })] })] }), s.jsxs("section", { className: "bg-card rounded-xl border border-border p-6", children: [s.jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [s.jsx(pu, { className: "h-5 w-5 text-blue-400" }), "Etiquetas del Proyecto"] }), s.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [m.tags.map(D => s.jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30", children: [D, s.jsx("button", { onClick: () => K(D), className: "p-0.5 hover:bg-blue-500/30 rounded-full transition-colors", children: s.jsx(zs, { className: "h-3 w-3" }) })] }, D)), m.tags.length === 0 && s.jsx("span", { className: "text-sm text-muted-foreground", children: "Sin etiquetas" })] }), s.jsxs("div", { className: "flex gap-2 mb-4", children: [s.jsx("input", { type: "text", value: g, onChange: D => k(D.target.value.toUpperCase()), onKeyDown: D => D.key === "Enter" && (D.preventDefault(), T()), placeholder: "Nueva etiqueta...", className: "flex-1 p-2 bg-secondary rounded-lg border border-border text-sm uppercase" }), s.jsx("button", { onClick: T, disabled: !g.trim(), className: "p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed", children: s.jsx(mt, { className: "h-4 w-4" }) })] }), s.jsx("div", { className: "flex flex-wrap gap-1.5", children: L2.filter(D => !m.tags.includes(D)).slice(0, 10).map(D => s.jsxs("button", { onClick: () => { h(G => ({ ...G, tags: [...G.tags, D] })), b(!0); }, className: "px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors", children: ["+ ", D] }, D)) })] }), s.jsxs("section", { className: "bg-card rounded-xl border border-border p-6", children: [s.jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [s.jsx(Sj, { className: "h-5 w-5 text-purple-400" }), "Stack Tecnico"] }), s.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [m.stack.map(D => s.jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30", children: [D, s.jsx("button", { onClick: () => V(D), className: "p-0.5 hover:bg-purple-500/30 rounded-full transition-colors", children: s.jsx(zs, { className: "h-3 w-3" }) })] }, D)), m.stack.length === 0 && s.jsx("span", { className: "text-sm text-muted-foreground", children: "Sin tecnologias definidas" })] }), s.jsxs("div", { className: "flex gap-2 mb-4", children: [s.jsx("input", { type: "text", value: C, onChange: D => j(D.target.value), onKeyDown: D => D.key === "Enter" && (D.preventDefault(), Z()), placeholder: "Nueva tecnologia...", className: "flex-1 p-2 bg-secondary rounded-lg border border-border text-sm" }), s.jsx("button", { onClick: Z, disabled: !C.trim(), className: "p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed", children: s.jsx(mt, { className: "h-4 w-4" }) })] }), s.jsx("div", { className: "flex flex-wrap gap-1.5", children: U2.filter(D => !m.stack.includes(D)).slice(0, 12).map(D => s.jsxs("button", { onClick: () => { h(G => ({ ...G, stack: [...G.stack, D] })), b(!0); }, className: "px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors", children: ["+ ", D] }, D)) })] }), s.jsxs("section", { className: "bg-card rounded-xl border border-border p-6", children: [s.jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [s.jsx(lg, { className: "h-5 w-5 text-emerald-400" }), "Informacion del Cliente"] }), s.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Nombre del Cliente/Empresa" }), s.jsx("input", { type: "text", value: m.clientName, onChange: D => w("clientName", D.target.value), placeholder: "Ej: SOLARIA Agency", className: "w-full p-3 bg-secondary rounded-lg border border-border" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Email de Contacto" }), s.jsx("input", { type: "email", value: m.clientEmail, onChange: D => w("clientEmail", D.target.value), placeholder: "cliente@ejemplo.com", className: "w-full p-3 bg-secondary rounded-lg border border-border" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-sm text-muted-foreground mb-2", children: "Telefono" }), s.jsx("input", { type: "tel", value: m.clientPhone, onChange: D => w("clientPhone", D.target.value), placeholder: "+52 555 123 4567", className: "w-full p-3 bg-secondary rounded-lg border border-border" })] })] })] }), s.jsxs("section", { className: "bg-card rounded-xl border border-red-500/20 p-6", children: [s.jsxs("h2", { className: "text-lg font-semibold text-red-400 mb-4 flex items-center gap-2", children: [s.jsx(Jd, { className: "h-5 w-5" }), "Zona de Peligro"] }), s.jsxs("div", { className: "flex items-center justify-between", children: [s.jsxs("div", { children: [s.jsx("p", { className: "font-medium", children: "Eliminar Proyecto" }), s.jsx("p", { className: "text-sm text-muted-foreground", children: "Esta accion no se puede deshacer. Se eliminaran todas las tareas asociadas." })] }), y ? s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("button", { onClick: () => v(!1), className: "px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground", children: "Cancelar" }), s.jsx("button", { className: "px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600", children: "Confirmar Eliminacion" })] }) : s.jsxs("button", { onClick: () => v(!0), className: "flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors", children: [s.jsx(Gr, { className: "h-4 w-4" }), "Eliminar"] })] })] })] })] }) : s.jsx("div", { className: "p-8 text-center text-muted-foreground", children: "Proyecto no encontrado" }); }
const rp = { critical: { color: "text-red-500", bg: "bg-red-500/10", label: "Critica" }, high: { color: "text-orange-500", bg: "bg-orange-500/10", label: "Alta" }, medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Media" }, low: { color: "text-green-500", bg: "bg-green-500/10", label: "Baja" } }, cp = { feature: { color: "text-purple-500", bg: "bg-purple-500/10", label: "Feature" }, bug: { color: "text-red-500", bg: "bg-red-500/10", label: "Bug" }, enhancement: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Mejora" }, documentation: { color: "text-gray-500", bg: "bg-gray-500/10", label: "Docs" }, research: { color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Research" }, maintenance: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Maint." } };
function Q2({ task: l, onClick: i, showProject: r = !1, compact: c = !1 }) { const u = rp[l.priority] || rp.medium, m = cp[l.type] || cp.feature, h = l.itemsTotal || 0, p = l.itemsCompleted || 0, b = h > 0 ? Math.round(p / h * 100) : 0, y = l.dueDate && new Date(l.dueDate) < new Date && l.status !== "completed"; return c ? s.jsxs("div", { onClick: i, className: "task-card-compact", children: [s.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [s.jsx("span", { className: F("task-badge", m.bg, m.color), children: m.label }), s.jsx("span", { className: "task-code", children: l.taskCode || `#${l.taskNumber}` })] }), s.jsx("div", { className: "task-title-compact", children: l.title }), h > 0 && s.jsxs("div", { className: "task-progress-mini", children: [s.jsx("div", { className: "task-progress-bar-mini", children: s.jsx("div", { className: "task-progress-fill-mini", style: { width: `${b}%` } }) }), s.jsxs("span", { className: "task-progress-text-mini", children: [p, "/", h] })] })] }) : s.jsxs("div", { onClick: i, className: F("task-card", l.status === "blocked" && "blocked", y && "overdue"), children: [s.jsxs("div", { className: "task-card-header", children: [s.jsxs("div", { className: "task-badges", children: [s.jsx("span", { className: F("task-badge", m.bg, m.color), children: m.label }), s.jsxs("span", { className: F("task-badge", u.bg, u.color), children: [s.jsx(og, { className: "h-3 w-3" }), u.label] })] }), s.jsx("span", { className: "task-code", children: l.taskCode || `#${l.taskNumber}` })] }), r && l.projectName && s.jsx("div", { className: "task-project-label", children: l.projectCode || l.projectName }), s.jsx("h4", { className: "task-card-title", children: l.title }), l.description && s.jsx("p", { className: "task-card-description", children: l.description }), h > 0 && s.jsxs("div", { className: "task-items-progress", children: [s.jsxs("div", { className: "flex items-center justify-between mb-1", children: [s.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [s.jsx(nt, { className: "h-3 w-3" }), "Subtareas"] }), s.jsxs("span", { className: "text-xs font-medium", children: [p, "/", h] })] }), s.jsx("div", { className: "task-progress-bar", children: s.jsx("div", { className: F("task-progress-fill", b === 100 && "complete"), style: { width: `${b}%` } }) })] }), s.jsxs("div", { className: "task-card-footer", children: [l.dueDate && s.jsxs("div", { className: F("task-meta", y && "text-red-500"), children: [s.jsx(ua, { className: "h-3 w-3" }), s.jsx("span", { children: lt(l.dueDate) })] }), l.estimatedHours && s.jsxs("div", { className: "task-meta", children: [s.jsx(Pe, { className: "h-3 w-3" }), s.jsxs("span", { children: [l.estimatedHours, "h"] })] }), l.notes && s.jsx("div", { className: "task-meta", children: s.jsx(xg, { className: "h-3 w-3" }) }), s.jsx("div", { className: "flex-1" }), l.agentName && s.jsxs("div", { className: "task-assignee", children: [s.jsx("div", { className: "task-assignee-avatar", children: s.jsx(Ds, { className: "h-3 w-3" }) }), s.jsx("span", { className: "task-assignee-name", children: l.agentName.split("-").pop() })] }), l.status === "blocked" && s.jsxs("div", { className: "task-blocked-badge", children: [s.jsx(St, { className: "h-3 w-3" }), "Bloqueado"] })] })] }); }
const _d = { pending: { label: "Pendiente", color: "text-gray-500", bg: "bg-gray-500/10" }, in_progress: { label: "En Progreso", color: "text-blue-500", bg: "bg-blue-500/10" }, review: { label: "En Revision", color: "text-purple-500", bg: "bg-purple-500/10" }, completed: { label: "Completada", color: "text-green-500", bg: "bg-green-500/10" }, blocked: { label: "Bloqueada", color: "text-red-500", bg: "bg-red-500/10" } }, op = { critical: { label: "Critica", color: "text-red-500", bg: "bg-red-500/10" }, high: { label: "Alta", color: "text-orange-500", bg: "bg-orange-500/10" }, medium: { label: "Media", color: "text-yellow-500", bg: "bg-yellow-500/10" }, low: { label: "Baja", color: "text-green-500", bg: "bg-green-500/10" } }, dp = { feature: { label: "Feature", color: "text-purple-500", bg: "bg-purple-500/10" }, bug: { label: "Bug", color: "text-red-500", bg: "bg-red-500/10" }, enhancement: { label: "Mejora", color: "text-blue-500", bg: "bg-blue-500/10" }, documentation: { label: "Documentacion", color: "text-gray-500", bg: "bg-gray-500/10" }, research: { label: "Investigacion", color: "text-cyan-500", bg: "bg-cyan-500/10" }, maintenance: { label: "Mantenimiento", color: "text-amber-500", bg: "bg-amber-500/10" } };
function Bg({ taskId: l, isOpen: i, onClose: r, onNavigateToProject: c }) { const { data: u, isLoading: m } = zN(l || 0), h = qN(), [p, b] = B.useState(!1), [y, v] = B.useState(""), [g, k] = B.useState(""); if (!i)
    return null; const C = () => { u && (v(u.notes || ""), k(u.status), b(!0)); }, j = async () => { u && (await h.mutateAsync({ id: u.id, data: { notes: y, status: g || void 0 } }), b(!1)); }, w = async (q) => { u && await h.mutateAsync({ id: u.id, data: { status: q } }); }, T = u ? _d[u.status] : _d.pending, K = u ? op[u.priority] : op.medium, Z = u ? dp[u.type] : dp.feature, V = (u == null ? void 0 : u.dueDate) && new Date(u.dueDate) < new Date && u.status !== "completed", $ = (u == null ? void 0 : u.itemsTotal) || 0, D = (u == null ? void 0 : u.itemsCompleted) || 0, G = $ > 0 ? Math.round(D / $ * 100) : (u == null ? void 0 : u.progress) || 0; return s.jsxs("div", { className: "drawer-container", children: [s.jsx("div", { className: F("drawer-overlay", i && "active"), onClick: r }), s.jsx("div", { className: F("drawer-panel max-w-xl", i && "active"), children: m ? s.jsx("div", { className: "flex items-center justify-center h-full", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : u ? s.jsxs(s.Fragment, { children: [s.jsxs("div", { className: "drawer-header", children: [s.jsxs("div", { className: "flex-1 min-w-0", children: [s.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [s.jsx("span", { className: F("task-badge", Z.bg, Z.color), children: Z.label }), s.jsx("span", { className: "task-code", children: u.taskCode || `#${u.taskNumber}` })] }), s.jsx("h2", { className: "drawer-title", children: u.title }), u.projectName && s.jsxs("button", { onClick: () => c == null ? void 0 : c(u.projectId), className: "drawer-subtitle flex items-center gap-1 hover:text-primary transition-colors", children: [u.projectCode || u.projectName, s.jsx(Jt, { className: "h-3 w-3" })] })] }), s.jsx("button", { onClick: r, className: "drawer-close", children: s.jsx(zs, { className: "h-5 w-5" }) })] }), s.jsxs("div", { className: "drawer-content", children: [s.jsxs("div", { className: "task-detail-section", children: [s.jsxs("div", { className: "task-detail-row", children: [s.jsxs("div", { className: "task-detail-label", children: [s.jsx(nt, { className: "h-4 w-4" }), "Estado"] }), s.jsx("div", { className: "task-detail-value", children: p ? s.jsx("select", { value: g, onChange: q => k(q.target.value), className: "task-detail-select", children: Object.entries(_d).map(([q, Y]) => s.jsx("option", { value: q, children: Y.label }, q)) }) : s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("span", { className: F("status-badge", T.bg, T.color), children: T.label }), s.jsxs("div", { className: "task-status-actions", children: [u.status === "pending" && s.jsx("button", { onClick: () => w("in_progress"), className: "status-action-btn in_progress", children: "Iniciar" }), u.status === "in_progress" && s.jsxs(s.Fragment, { children: [s.jsx("button", { onClick: () => w("review"), className: "status-action-btn review", children: "A Revision" }), s.jsx("button", { onClick: () => w("completed"), className: "status-action-btn completed", children: "Completar" })] }), u.status === "review" && s.jsx("button", { onClick: () => w("completed"), className: "status-action-btn completed", children: "Aprobar" })] })] }) })] }), s.jsxs("div", { className: "task-detail-row", children: [s.jsxs("div", { className: "task-detail-label", children: [s.jsx(og, { className: "h-4 w-4" }), "Prioridad"] }), s.jsx("div", { className: "task-detail-value", children: s.jsx("span", { className: F("priority-badge", K.bg, K.color), children: K.label }) })] }), u.agentName && s.jsxs("div", { className: "task-detail-row", children: [s.jsxs("div", { className: "task-detail-label", children: [s.jsx(Ds, { className: "h-4 w-4" }), "Asignado"] }), s.jsx("div", { className: "task-detail-value", children: s.jsxs("div", { className: "task-assignee-full", children: [s.jsx("div", { className: "task-assignee-avatar-lg", children: s.jsx(Ds, { className: "h-4 w-4" }) }), s.jsx("span", { children: u.agentName })] }) })] }), u.dueDate && s.jsxs("div", { className: "task-detail-row", children: [s.jsxs("div", { className: "task-detail-label", children: [s.jsx(ua, { className: "h-4 w-4" }), "Fecha limite"] }), s.jsxs("div", { className: F("task-detail-value", V && "text-red-500"), children: [Yr(u.dueDate), V && s.jsxs("span", { className: "ml-2 text-xs", children: [s.jsx(St, { className: "h-3 w-3 inline" }), " Vencida"] })] })] }), (u.estimatedHours || u.actualHours) && s.jsxs("div", { className: "task-detail-row", children: [s.jsxs("div", { className: "task-detail-label", children: [s.jsx(Pe, { className: "h-4 w-4" }), "Tiempo"] }), s.jsx("div", { className: "task-detail-value", children: u.actualHours ? s.jsxs("span", { children: [u.actualHours, "h / ", u.estimatedHours, "h est."] }) : s.jsxs("span", { children: [u.estimatedHours, "h estimadas"] }) })] })] }), s.jsxs("div", { className: "task-detail-section", children: [s.jsxs("div", { className: "task-detail-section-title", children: [s.jsx(pu, { className: "h-4 w-4" }), "Progreso"] }), s.jsxs("div", { className: "task-progress-display", children: [s.jsx("div", { className: "task-progress-bar-lg", children: s.jsx("div", { className: F("task-progress-fill-lg", G === 100 && "complete"), style: { width: `${G}%` } }) }), s.jsxs("span", { className: "task-progress-label", children: [G, "%"] })] })] }), u.description && s.jsxs("div", { className: "task-detail-section", children: [s.jsxs("div", { className: "task-detail-section-title", children: [s.jsx(cg, { className: "h-4 w-4" }), "Descripcion"] }), s.jsx("p", { className: "task-description-full", children: u.description })] }), s.jsx("div", { className: "task-detail-section", children: s.jsx(qg, { taskId: u.id, editable: u.status !== "completed", showAddForm: u.status !== "completed" }) }), s.jsxs("div", { className: "task-detail-section", children: [s.jsxs("div", { className: "task-detail-section-header", children: [s.jsxs("div", { className: "task-detail-section-title", children: [s.jsx(xg, { className: "h-4 w-4" }), "Notas"] }), !p && s.jsxs("button", { onClick: C, className: "edit-btn", children: [s.jsx(Mj, { className: "h-3 w-3" }), "Editar"] })] }), p ? s.jsxs("div", { className: "task-notes-edit", children: [s.jsx("textarea", { value: y, onChange: q => v(q.target.value), placeholder: "Agregar notas...", className: "task-notes-textarea", rows: 4 }), s.jsxs("div", { className: "task-notes-actions", children: [s.jsx("button", { onClick: () => b(!1), className: "cancel-btn", children: "Cancelar" }), s.jsx("button", { onClick: j, disabled: h.isPending, className: "save-btn", children: h.isPending ? s.jsx(Re, { className: "h-4 w-4 animate-spin" }) : s.jsxs(s.Fragment, { children: [s.jsx(hu, { className: "h-3 w-3" }), "Guardar"] }) })] })] }) : u.notes ? s.jsx("p", { className: "task-notes-content", children: u.notes }) : s.jsx("p", { className: "task-notes-empty", children: "Sin notas" })] }), s.jsxs("div", { className: "task-detail-meta", children: [s.jsxs("span", { children: ["Creada ", lt(u.createdAt)] }), s.jsx("span", { className: "meta-separator", children: "•" }), s.jsxs("span", { children: ["Actualizada ", lt(u.updatedAt)] }), u.completedAt && s.jsxs(s.Fragment, { children: [s.jsx("span", { className: "meta-separator", children: "•" }), s.jsxs("span", { className: "text-green-500", children: ["Completada ", lt(u.completedAt)] })] })] })] })] }) : s.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Tarea no encontrada" }) })] }); }
const K2 = { pending: "gantt-bar-pending", in_progress: "gantt-bar-in_progress", review: "gantt-bar-review", completed: "gantt-bar-completed", blocked: "gantt-bar-blocked" };
function Y2({ task: l, startDate: i, endDate: r, onClick: c }) { const u = l.createdAt ? new Date(l.createdAt) : i, m = l.dueDate ? new Date(l.dueDate) : new Date(u.getTime() + 10080 * 60 * 1e3), h = i.getTime(), p = r.getTime(), b = p - h, y = Math.max(u.getTime(), h), v = Math.min(m.getTime(), p), g = (y - h) / b * 100, k = (v - y) / b * 100; if (k <= 0 || g >= 100)
    return s.jsxs("div", { className: "gantt-row", onClick: c, children: [s.jsxs("div", { className: "gantt-row-info", children: [s.jsx("span", { className: "gantt-task-code", children: l.taskCode || `#${l.taskNumber}` }), s.jsx("span", { className: "gantt-task-title", children: l.title })] }), s.jsx("div", { className: "gantt-row-timeline", children: s.jsx("div", { className: "gantt-bar-empty", children: "Fuera del rango visible" }) })] }); const C = l.progress || 0, j = l.dueDate && new Date(l.dueDate) < new Date && l.status !== "completed"; return s.jsxs("div", { className: F("gantt-row", c && "clickable"), onClick: c, children: [s.jsxs("div", { className: "gantt-row-info", children: [s.jsx("span", { className: "gantt-task-code", children: l.taskCode || `#${l.taskNumber}` }), s.jsx("span", { className: "gantt-task-title", children: l.title }), l.agentName && s.jsxs("span", { className: "gantt-task-agent", children: [s.jsx(Ds, { className: "h-3 w-3" }), l.agentName.split("-").pop()] })] }), s.jsx("div", { className: "gantt-row-timeline", children: s.jsxs("div", { className: F("gantt-bar", K2[l.status], j && "overdue"), style: { left: `${Math.max(0, g)}%`, width: `${Math.min(k, 100 - g)}%` }, children: [s.jsx("div", { className: "gantt-bar-progress", style: { width: `${C}%` } }), s.jsxs("div", { className: "gantt-bar-content", children: [k > 10 && s.jsx("span", { className: "gantt-bar-label", children: l.title.length > 20 ? l.title.substring(0, 20) + "..." : l.title }), j && s.jsx(St, { className: "h-3 w-3 text-red-500" })] })] }) })] }); }
function X2(l) { const i = new Date(Date.UTC(l.getFullYear(), l.getMonth(), l.getDate())), r = i.getUTCDay() || 7; i.setUTCDate(i.getUTCDate() + 4 - r); const c = new Date(Date.UTC(i.getUTCFullYear(), 0, 1)); return Math.ceil(((i.getTime() - c.getTime()) / 864e5 + 1) / 7); }
function Od(l) { const i = l.getDate(), r = l.toLocaleDateString("es", { month: "short" }); return `${i} ${r}`; }
function Z2({ tasks: l, onTaskClick: i, weeksToShow: r = 8 }) { const [c, u] = B.useState(0), { startDate: m, endDate: h, weeks: p } = B.useMemo(() => { const C = new Date, j = C.getDay(), w = j === 0 ? -6 : 1 - j, T = new Date(C); T.setDate(C.getDate() + w + c * 7), T.setHours(0, 0, 0, 0); const K = new Date(T); K.setDate(T.getDate() + r * 7); const Z = []; for (let V = 0; V < r; V++) {
    const $ = new Date(T);
    $.setDate(T.getDate() + V * 7), Z.push({ start: $, label: Od($), weekNum: X2($) });
} return { startDate: T, endDate: K, weeks: Z }; }, [c, r]), b = B.useMemo(() => { const C = new Date, j = m.getTime(), w = h.getTime(), T = C.getTime(); return T < j || T > w ? null : (T - j) / (w - j) * 100; }, [m, h]), y = B.useMemo(() => [...l].sort((C, j) => { const w = C.createdAt ? new Date(C.createdAt).getTime() : 0, T = j.createdAt ? new Date(j.createdAt).getTime() : 0; return w - T; }), [l]), v = () => u(c - r), g = () => u(c + r), k = () => u(0); return s.jsxs("div", { className: "gantt-container", children: [s.jsxs("div", { className: "gantt-nav", children: [s.jsxs("div", { className: "gantt-nav-buttons", children: [s.jsx("button", { onClick: v, className: "gantt-nav-btn", children: s.jsx(ng, { className: "h-4 w-4" }) }), s.jsxs("button", { onClick: k, className: "gantt-nav-btn today", children: [s.jsx(ua, { className: "h-4 w-4" }), "Hoy"] }), s.jsx("button", { onClick: g, className: "gantt-nav-btn", children: s.jsx(ou, { className: "h-4 w-4" }) })] }), s.jsxs("div", { className: "gantt-date-range", children: [Od(m), " - ", Od(h)] })] }), s.jsxs("div", { className: "gantt-header", children: [s.jsx("div", { className: "gantt-header-info", children: "Tarea" }), s.jsx("div", { className: "gantt-header-timeline", children: p.map((C, j) => s.jsxs("div", { className: "gantt-week-column", style: { width: `${100 / r}%` }, children: [s.jsx("div", { className: "gantt-week-label", children: C.label }), s.jsxs("div", { className: "gantt-week-number", children: ["S", C.weekNum] })] }, j)) })] }), s.jsxs("div", { className: "gantt-body", children: [b !== null && s.jsx("div", { className: "gantt-today-marker", style: { left: `calc(200px + ${b}% * (100% - 200px) / 100)` }, children: s.jsx("div", { className: "gantt-today-label", children: "Hoy" }) }), s.jsx("div", { className: "gantt-grid", children: p.map((C, j) => s.jsx("div", { className: "gantt-grid-line", style: { left: `calc(200px + ${j / r * 100}% * (100% - 200px) / 100)` } }, j)) }), y.length > 0 ? y.map(C => s.jsx(Y2, { task: C, startDate: m, endDate: h, onClick: () => i == null ? void 0 : i(C) }, C.id)) : s.jsxs("div", { className: "gantt-empty", children: [s.jsx(ua, { className: "h-12 w-12 text-muted-foreground/50" }), s.jsx("p", { children: "No hay tareas para mostrar en el Gantt" })] })] }), s.jsxs("div", { className: "gantt-legend", children: [s.jsxs("div", { className: "gantt-legend-item", children: [s.jsx("div", { className: "gantt-legend-color pending" }), s.jsx("span", { children: "Pendiente" })] }), s.jsxs("div", { className: "gantt-legend-item", children: [s.jsx("div", { className: "gantt-legend-color in_progress" }), s.jsx("span", { children: "En Progreso" })] }), s.jsxs("div", { className: "gantt-legend-item", children: [s.jsx("div", { className: "gantt-legend-color review" }), s.jsx("span", { children: "En Revision" })] }), s.jsxs("div", { className: "gantt-legend-item", children: [s.jsx("div", { className: "gantt-legend-color completed" }), s.jsx("span", { children: "Completada" })] }), s.jsxs("div", { className: "gantt-legend-item", children: [s.jsx("div", { className: "gantt-legend-color blocked" }), s.jsx("span", { children: "Bloqueada" })] })] })] }); }
const Dd = [{ id: "pending", label: "Pendiente", color: "border-t-yellow-500", icon: Pe }, { id: "in_progress", label: "En Progreso", color: "border-t-blue-500", icon: Re }, { id: "review", label: "Revision", color: "border-t-purple-500", icon: Hn }, { id: "completed", label: "Completado", color: "border-t-green-500", icon: nt }, { id: "blocked", label: "Bloqueado", color: "border-t-red-500", icon: St }];
function J2({ column: l, tasks: i, onTaskClick: r }) { const c = l.icon; return s.jsxs("div", { className: "kanban-column", children: [s.jsxs("div", { className: F("kanban-column-header", l.color), children: [s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx(c, { className: F("h-4 w-4", l.id === "in_progress" && "animate-spin") }), s.jsx("h3", { className: "font-medium", children: l.label })] }), s.jsx("span", { className: "kanban-column-count", children: i.length })] }), s.jsxs("div", { className: "kanban-column-body", children: [i.map(u => s.jsx(Q2, { task: u, onClick: () => r(u), compact: !0 }, u.id)), i.length === 0 && s.jsx("div", { className: "kanban-empty", children: s.jsx("span", { children: "Sin tareas" }) })] })] }); }
function F2({ tasks: l, onTaskClick: i }) { return s.jsx("div", { className: "list-table-container", children: s.jsxs("table", { className: "list-table", children: [s.jsx("thead", { children: s.jsxs("tr", { children: [s.jsx("th", { children: "Tarea" }), s.jsx("th", { children: "Proyecto" }), s.jsx("th", { children: "Estado" }), s.jsx("th", { children: "Prioridad" }), s.jsx("th", { children: "Progreso" }), s.jsx("th", { children: "Subtareas" }), s.jsx("th", { children: "Actualizado" })] }) }), s.jsx("tbody", { children: l.map(r => s.jsxs("tr", { onClick: () => i(r), className: "cursor-pointer", children: [s.jsx("td", { children: s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: r.taskCode || `#${r.taskNumber}` }), s.jsx("span", { className: "font-medium", children: r.title })] }) }), s.jsx("td", { className: "text-muted-foreground", children: r.projectCode || r.projectName }), s.jsx("td", { children: s.jsx("span", { className: F("status-badge", Og(r.status)), children: r.status.replace("_", " ") }) }), s.jsx("td", { children: s.jsx("span", { className: F("priority-badge", Dg(r.priority)), children: r.priority }) }), s.jsx("td", { children: s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "h-1.5 w-16 rounded-full bg-muted", children: s.jsx("div", { className: "h-full rounded-full bg-primary", style: { width: `${r.progress}%` } }) }), s.jsxs("span", { className: "text-xs", children: [r.progress, "%"] })] }) }), s.jsx("td", { className: "text-center", children: s.jsxs("span", { className: "text-sm", children: [r.itemsCompleted || 0, "/", r.itemsTotal || 0] }) }), s.jsx("td", { className: "text-muted-foreground", children: lt(r.updatedAt) })] }, r.id)) })] }) }); }
function $2() { const l = $t(), [i, r] = B.useState("kanban"), [c, u] = B.useState(""), [m, h] = B.useState(""), [p, b] = B.useState(""), [y, v] = B.useState(null), { data: g, isLoading: k } = Jr(), { data: C } = Xr(), j = g == null ? void 0 : g.filter(q => { var Ge, Se; const Y = q.title.toLowerCase().includes(c.toLowerCase()) || ((Ge = q.taskCode) == null ? void 0 : Ge.toLowerCase().includes(c.toLowerCase())) || ((Se = q.description) == null ? void 0 : Se.toLowerCase().includes(c.toLowerCase())), de = !m || q.projectId.toString() === m, it = !p || q.status === p; return Y && de && it; }), w = Dd.reduce((q, Y) => (q[Y.id] = (j == null ? void 0 : j.filter(de => de.status === Y.id)) || [], q), {}), T = B.useCallback(q => { v(q.id); }, []), K = B.useCallback(() => { v(null); }, []), Z = B.useCallback(q => { l(`/projects/${q}`); }, [l]), V = (g == null ? void 0 : g.length) || 0, $ = (g == null ? void 0 : g.filter(q => q.status === "completed").length) || 0, D = (g == null ? void 0 : g.filter(q => q.status === "in_progress").length) || 0, G = (g == null ? void 0 : g.filter(q => q.status === "blocked").length) || 0; return k ? s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : s.jsxs("div", { className: "space-y-6", children: [s.jsxs("div", { className: "section-header", children: [s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Tareas" }), s.jsxs("p", { className: "section-subtitle", children: [V, " tareas • ", $, " completadas • ", D, " en progreso", G > 0 && s.jsxs("span", { className: "text-red-500", children: [" • ", G, " bloqueadas"] })] })] }), s.jsx("div", { className: "section-actions", children: s.jsxs("button", { className: "btn-primary", children: [s.jsx(mt, { className: "h-4 w-4" }), "Nueva Tarea"] }) })] }), s.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon tasks", children: s.jsx(nt, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Total Tareas" }), s.jsx("div", { className: "stat-value", children: V })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon green", children: s.jsx(nt, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Completadas" }), s.jsx("div", { className: "stat-value", children: $ })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon active", children: s.jsx(Re, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "En Progreso" }), s.jsx("div", { className: "stat-value", children: D })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon", style: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }, children: s.jsx(St, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Bloqueadas" }), s.jsx("div", { className: "stat-value", children: G })] })] })] }), s.jsxs("div", { className: "filters-row", children: [s.jsxs("div", { className: "filter-search", children: [s.jsx(Hn, { className: "filter-search-icon" }), s.jsx("input", { type: "text", placeholder: "Buscar tareas...", value: c, onChange: q => u(q.target.value), className: "filter-search-input" })] }), s.jsxs("div", { className: "filter-selects", children: [s.jsxs("div", { className: "filter-select-wrapper", children: [s.jsx(vj, { className: "h-4 w-4 text-muted-foreground" }), s.jsxs("select", { value: m, onChange: q => h(q.target.value), className: "filter-select", children: [s.jsx("option", { value: "", children: "Todos los proyectos" }), C == null ? void 0 : C.map(q => s.jsxs("option", { value: q.id, children: [q.code, " - ", q.name] }, q.id))] })] }), s.jsxs("select", { value: p, onChange: q => b(q.target.value), className: "filter-select", children: [s.jsx("option", { value: "", children: "Todos los estados" }), Dd.map(q => s.jsx("option", { value: q.id, children: q.label }, q.id))] })] }), s.jsxs("div", { className: "view-toggle", children: [s.jsx("button", { onClick: () => r("kanban"), className: F("view-toggle-btn", i === "kanban" && "active"), title: "Vista Kanban", children: s.jsx(Un, { className: "h-4 w-4" }) }), s.jsx("button", { onClick: () => r("list"), className: F("view-toggle-btn", i === "list" && "active"), title: "Vista Lista", children: s.jsx(Ln, { className: "h-4 w-4" }) }), s.jsx("button", { onClick: () => r("gantt"), className: F("view-toggle-btn", i === "gantt" && "active"), title: "Vista Gantt", children: s.jsx(xu, { className: "h-4 w-4" }) })] })] }), i === "kanban" && s.jsx("div", { className: "kanban-container", children: Dd.map(q => s.jsx(J2, { column: q, tasks: w[q.id], onTaskClick: T }, q.id)) }), i === "list" && s.jsx(F2, { tasks: j || [], onTaskClick: T }), i === "gantt" && s.jsx(Z2, { tasks: j || [], onTaskClick: T }), s.jsx(Bg, { taskId: y, isOpen: y !== null, onClose: K, onNavigateToProject: Z })] }); }
function P2() { const l = $t(), [i, r] = B.useState(""), [c, u] = B.useState(""), [m, h] = B.useState(null), { data: p, isLoading: b } = Jr(), { data: y } = Xr(), v = (p == null ? void 0 : p.filter(V => V.status === "completed")) || [], k = [...v.filter(V => { var G, q; const $ = V.title.toLowerCase().includes(i.toLowerCase()) || ((G = V.taskCode) == null ? void 0 : G.toLowerCase().includes(i.toLowerCase())) || ((q = V.description) == null ? void 0 : q.toLowerCase().includes(i.toLowerCase())), D = !c || V.projectId.toString() === c; return $ && D; })].sort((V, $) => { const D = V.completedAt ? new Date(V.completedAt).getTime() : new Date(V.updatedAt).getTime(); return ($.completedAt ? new Date($.completedAt).getTime() : new Date($.updatedAt).getTime()) - D; }), C = B.useCallback(V => { h(V.id); }, []), j = B.useCallback(() => { h(null); }, []), w = B.useCallback(V => { l(`/projects/${V}`); }, [l]), T = k.reduce((V, $) => { const D = $.projectCode || $.projectName || "Sin Proyecto"; return V[D] || (V[D] = []), V[D].push($), V; }, {}), K = v.length, Z = v.filter(V => { const $ = V.completedAt ? new Date(V.completedAt) : new Date(V.updatedAt), D = new Date; return D.setDate(D.getDate() - 7), $ >= D; }).length; return b ? s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : s.jsxs("div", { className: "space-y-6", children: [s.jsx("div", { className: "section-header", children: s.jsxs("div", { className: "flex items-center gap-4", children: [s.jsx("button", { onClick: () => l(-1), className: "p-2 hover:bg-muted rounded-lg transition-colors", children: s.jsx(Ba, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsxs("h1", { className: "section-title flex items-center gap-2", children: [s.jsx(gr, { className: "h-6 w-6 text-primary" }), "Tareas Almacenadas"] }), s.jsxs("p", { className: "section-subtitle", children: [K, " tareas completadas • ", Z, " esta semana"] })] })] }) }), s.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon green", children: s.jsx(nt, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Total Completadas" }), s.jsx("div", { className: "stat-value", children: K })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon", children: s.jsx(ua, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Esta Semana" }), s.jsx("div", { className: "stat-value", children: Z })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon projects", children: s.jsx(gr, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Proyectos" }), s.jsx("div", { className: "stat-value", children: Object.keys(T).length })] })] })] }), s.jsxs("div", { className: "filters-row", children: [s.jsxs("div", { className: "filter-search", children: [s.jsx(Hn, { className: "filter-search-icon" }), s.jsx("input", { type: "text", placeholder: "Buscar tareas completadas...", value: i, onChange: V => r(V.target.value), className: "filter-search-input" })] }), s.jsx("div", { className: "filter-selects", children: s.jsxs("select", { value: c, onChange: V => u(V.target.value), className: "filter-select", children: [s.jsx("option", { value: "", children: "Todos los proyectos" }), y == null ? void 0 : y.map(V => s.jsxs("option", { value: V.id, children: [V.code, " - ", V.name] }, V.id))] }) })] }), s.jsxs("div", { className: "space-y-6", children: [Object.entries(T).map(([V, $]) => s.jsxs("div", { className: "glass-card", children: [s.jsxs("div", { className: "p-4 border-b border-border", children: [s.jsx("h3", { className: "font-semibold text-lg", children: V }), s.jsxs("p", { className: "text-sm text-muted-foreground", children: [$.length, " tareas completadas"] })] }), s.jsx("div", { className: "divide-y divide-border", children: $.map(D => s.jsx("div", { onClick: () => C(D), className: "p-4 hover:bg-muted/50 cursor-pointer transition-colors", children: s.jsxs("div", { className: "flex items-start justify-between gap-4", children: [s.jsxs("div", { className: "flex items-start gap-3 min-w-0 flex-1", children: [s.jsx(nt, { className: "h-5 w-5 text-green-500 mt-0.5 shrink-0" }), s.jsxs("div", { className: "min-w-0", children: [s.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [s.jsx("span", { className: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded", children: D.taskCode || `#${D.taskNumber}` }), s.jsx("span", { className: F("text-xs px-1.5 py-0.5 rounded", Dg(D.priority)), children: D.priority })] }), s.jsx("h4", { className: "font-medium truncate", children: D.title }), D.description && s.jsx("p", { className: "text-sm text-muted-foreground line-clamp-1 mt-1", children: D.description })] })] }), s.jsxs("div", { className: "text-right shrink-0", children: [s.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [s.jsx(Pe, { className: "h-3 w-3" }), lt(D.completedAt || D.updatedAt)] }), D.agentName && s.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end", children: [s.jsx(Ds, { className: "h-3 w-3" }), D.agentName] })] })] }) }, D.id)) })] }, V)), k.length === 0 && s.jsxs("div", { className: "glass-card p-12 text-center", children: [s.jsx(gr, { className: "h-12 w-12 text-muted-foreground/50 mx-auto mb-4" }), s.jsx("h3", { className: "text-lg font-medium text-muted-foreground", children: "No hay tareas completadas" }), s.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Las tareas completadas apareceran aqui" })] })] }), s.jsx(Bg, { taskId: m, isOpen: m !== null, onClose: j, onNavigateToProject: w })] }); }
function I2() { var q; const l = $t(), { user: i } = fs(), { theme: r, toggleTheme: c } = Kr(), [u, m] = B.useState({ name: (i == null ? void 0 : i.name) || "", email: (i == null ? void 0 : i.email) || "" }), [h, p] = B.useState(!1), [b, y] = B.useState(null), [v, g] = B.useState({ currentPassword: "", newPassword: "", confirmPassword: "" }), [k, C] = B.useState({ current: !1, new: !1, confirm: !1 }), [j, w] = B.useState(!1), [T, K] = B.useState(null), [Z, V] = B.useState(null), $ = async (Y) => { Y.preventDefault(), p(!0), y(null); try {
    await new Promise(de => setTimeout(de, 1e3)), y({ type: "success", text: "Perfil actualizado correctamente" });
}
catch {
    y({ type: "error", text: "Error al actualizar el perfil" });
}
finally {
    p(!1);
} }, D = async (Y) => { if (Y.preventDefault(), K(null), v.newPassword !== v.confirmPassword) {
    K({ type: "error", text: "Las contrasenas no coinciden" });
    return;
} if (v.newPassword.length < 6) {
    K({ type: "error", text: "La contrasena debe tener al menos 6 caracteres" });
    return;
} w(!0); try {
    await new Promise(de => setTimeout(de, 1e3)), K({ type: "success", text: "Contrasena actualizada correctamente" }), g({ currentPassword: "", newPassword: "", confirmPassword: "" });
}
catch {
    K({ type: "error", text: "Error al actualizar la contrasena" });
}
finally {
    w(!1);
} }, G = Y => { var it; const de = (it = Y.target.files) == null ? void 0 : it[0]; if (de) {
    const Ge = new FileReader;
    Ge.onload = Se => { var We; V((We = Se.target) == null ? void 0 : We.result); }, Ge.readAsDataURL(de);
} }; return s.jsxs("div", { className: "space-y-6 max-w-4xl mx-auto", children: [s.jsx("div", { className: "section-header", children: s.jsxs("div", { className: "flex items-center gap-4", children: [s.jsx("button", { onClick: () => l(-1), className: "p-2 hover:bg-muted rounded-lg transition-colors", children: s.jsx(Ba, { className: "h-5 w-5" }) }), s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Configuracion" }), s.jsx("p", { className: "section-subtitle", children: "Gestiona tu perfil y preferencias" })] })] }) }), s.jsxs("div", { className: "grid gap-6", children: [s.jsxs("div", { className: "glass-card", children: [s.jsx("div", { className: "p-6 border-b border-border", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: s.jsx(Ds, { className: "h-5 w-5 text-primary" }) }), s.jsxs("div", { children: [s.jsx("h2", { className: "font-semibold", children: "Perfil" }), s.jsx("p", { className: "text-sm text-muted-foreground", children: "Tu informacion personal" })] })] }) }), s.jsxs("form", { onSubmit: $, className: "p-6 space-y-6", children: [s.jsxs("div", { className: "flex items-center gap-6", children: [s.jsxs("div", { className: "relative", children: [s.jsx("div", { className: "h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold overflow-hidden", children: Z ? s.jsx("img", { src: Z, alt: "Avatar", className: "h-full w-full object-cover" }) : ((q = i == null ? void 0 : i.name) == null ? void 0 : q.charAt(0).toUpperCase()) || "U" }), s.jsxs("label", { className: "absolute -bottom-1 -right-1 p-1.5 bg-muted rounded-full cursor-pointer hover:bg-accent transition-colors", children: [s.jsx(mj, { className: "h-4 w-4" }), s.jsx("input", { type: "file", accept: "image/*", onChange: G, className: "hidden" })] })] }), s.jsxs("div", { children: [s.jsx("h3", { className: "font-medium", children: i == null ? void 0 : i.name }), s.jsx("p", { className: "text-sm text-muted-foreground capitalize", children: i == null ? void 0 : i.role })] })] }), s.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [s.jsxs("div", { className: "space-y-2", children: [s.jsx("label", { className: "text-sm font-medium", children: "Nombre" }), s.jsx("input", { type: "text", value: u.name, onChange: Y => m({ ...u, name: Y.target.value }), className: "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" })] }), s.jsxs("div", { className: "space-y-2", children: [s.jsx("label", { className: "text-sm font-medium", children: "Email" }), s.jsx("input", { type: "email", value: u.email, onChange: Y => m({ ...u, email: Y.target.value }), className: "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" })] })] }), b && s.jsx("div", { className: F("px-4 py-3 rounded-lg text-sm", b.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: b.text }), s.jsx("div", { className: "flex justify-end", children: s.jsx("button", { type: "submit", disabled: h, className: "btn-primary", children: h ? s.jsx(Re, { className: "h-4 w-4 animate-spin" }) : s.jsxs(s.Fragment, { children: [s.jsx(hu, { className: "h-4 w-4" }), "Guardar cambios"] }) }) })] })] }), s.jsxs("div", { className: "glass-card", children: [s.jsx("div", { className: "p-6 border-b border-border", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "p-2 rounded-lg bg-orange-500/10", children: s.jsx(Aj, { className: "h-5 w-5 text-orange-500" }) }), s.jsxs("div", { children: [s.jsx("h2", { className: "font-semibold", children: "Seguridad" }), s.jsx("p", { className: "text-sm text-muted-foreground", children: "Cambia tu contrasena" })] })] }) }), s.jsxs("form", { onSubmit: D, className: "p-6 space-y-4", children: [s.jsxs("div", { className: "space-y-2", children: [s.jsx("label", { className: "text-sm font-medium", children: "Contrasena actual" }), s.jsxs("div", { className: "relative", children: [s.jsx("input", { type: k.current ? "text" : "password", value: v.currentPassword, onChange: Y => g({ ...v, currentPassword: Y.target.value }), className: "w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" }), s.jsx("button", { type: "button", onClick: () => C({ ...k, current: !k.current }), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: k.current ? s.jsx(Sd, { className: "h-4 w-4" }) : s.jsx(kd, { className: "h-4 w-4" }) })] })] }), s.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [s.jsxs("div", { className: "space-y-2", children: [s.jsx("label", { className: "text-sm font-medium", children: "Nueva contrasena" }), s.jsxs("div", { className: "relative", children: [s.jsx("input", { type: k.new ? "text" : "password", value: v.newPassword, onChange: Y => g({ ...v, newPassword: Y.target.value }), className: "w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" }), s.jsx("button", { type: "button", onClick: () => C({ ...k, new: !k.new }), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: k.new ? s.jsx(Sd, { className: "h-4 w-4" }) : s.jsx(kd, { className: "h-4 w-4" }) })] })] }), s.jsxs("div", { className: "space-y-2", children: [s.jsx("label", { className: "text-sm font-medium", children: "Confirmar contrasena" }), s.jsxs("div", { className: "relative", children: [s.jsx("input", { type: k.confirm ? "text" : "password", value: v.confirmPassword, onChange: Y => g({ ...v, confirmPassword: Y.target.value }), className: "w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" }), s.jsx("button", { type: "button", onClick: () => C({ ...k, confirm: !k.confirm }), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: k.confirm ? s.jsx(Sd, { className: "h-4 w-4" }) : s.jsx(kd, { className: "h-4 w-4" }) })] })] })] }), T && s.jsx("div", { className: F("px-4 py-3 rounded-lg text-sm", T.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: T.text }), s.jsx("div", { className: "flex justify-end", children: s.jsx("button", { type: "submit", disabled: j, className: "btn-primary", children: j ? s.jsx(Re, { className: "h-4 w-4 animate-spin" }) : s.jsxs(s.Fragment, { children: [s.jsx(gg, { className: "h-4 w-4" }), "Cambiar contrasena"] }) }) })] })] }), s.jsxs("div", { className: "glass-card", children: [s.jsx("div", { className: "p-6 border-b border-border", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "p-2 rounded-lg bg-blue-500/10", children: s.jsx(ag, { className: "h-5 w-5 text-blue-500" }) }), s.jsxs("div", { children: [s.jsx("h2", { className: "font-semibold", children: "Preferencias" }), s.jsx("p", { className: "text-sm text-muted-foreground", children: "Personaliza tu experiencia" })] })] }) }), s.jsxs("div", { className: "p-6 space-y-4", children: [s.jsxs("div", { className: "flex items-center justify-between", children: [s.jsxs("div", { children: [s.jsx("h3", { className: "font-medium", children: "Tema" }), s.jsx("p", { className: "text-sm text-muted-foreground", children: "Selecciona el tema de la interfaz" })] }), s.jsx("button", { onClick: c, className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors", children: r === "dark" ? s.jsxs(s.Fragment, { children: [s.jsx(Zd, { className: "h-4 w-4" }), "Oscuro"] }) : s.jsxs(s.Fragment, { children: [s.jsx(wr, { className: "h-4 w-4" }), "Claro"] }) })] }), s.jsxs("div", { className: "flex items-center justify-between", children: [s.jsxs("div", { children: [s.jsx("h3", { className: "font-medium", children: "Notificaciones" }), s.jsx("p", { className: "text-sm text-muted-foreground", children: "Recibe alertas en tiempo real" })] }), s.jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [s.jsx("input", { type: "checkbox", defaultChecked: !0, className: "sr-only peer" }), s.jsx("div", { className: "w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" })] })] })] })] })] })] }); }
const up = { active: { label: "Activo", icon: Dn }, busy: { label: "Ocupado", icon: Pe }, inactive: { label: "Inactivo", icon: St }, error: { label: "Error", icon: St }, maintenance: { label: "Mantenimiento", icon: Vr } };
function W2({ agent: l }) { const i = up[l.status] || up.inactive, r = i.icon; return s.jsxs("div", { className: "rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors", children: [s.jsxs("div", { className: "flex items-start gap-4", children: [s.jsxs("div", { className: "relative", children: [s.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10", children: l.avatar ? s.jsx("img", { src: l.avatar, alt: l.name, className: "h-16 w-16 rounded-full object-cover" }) : s.jsx(Lr, { className: "h-8 w-8 text-primary" }) }), s.jsx("span", { className: F("absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card", Og(l.status)) })] }), s.jsxs("div", { className: "flex-1", children: [s.jsx("h3", { className: "font-semibold text-lg", children: l.name }), s.jsx("p", { className: "text-sm text-muted-foreground", children: l.role }), s.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [s.jsx(r, { className: "h-3.5 w-3.5" }), s.jsx("span", { className: "text-sm capitalize", children: i.label })] })] })] }), l.currentTask && s.jsxs("div", { className: "mt-4 rounded-lg bg-muted/50 p-3", children: [s.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Tarea actual" }), s.jsx("p", { className: "text-sm font-medium", children: l.currentTask })] }), l.description && s.jsx("p", { className: "mt-4 text-sm text-muted-foreground line-clamp-2", children: l.description }), s.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4", children: [s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-2xl font-bold text-green-500", children: l.tasksCompleted || 0 }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Completadas" })] }), s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-2xl font-bold text-blue-500", children: l.tasksInProgress || 0 }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "En progreso" })] }), s.jsxs("div", { className: "text-center", children: [s.jsx("p", { className: "text-2xl font-bold", children: l.avgTaskTime ? `${l.avgTaskTime.toFixed(1)}h` : "-" }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Tiempo prom." })] })] }), s.jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground", children: [s.jsxs("span", { children: ["Última actividad: ", l.lastActivity ? lt(l.lastActivity) : "Nunca"] }), l.lastHeartbeat && s.jsxs("span", { className: "flex items-center gap-1", children: [s.jsx(Dn, { className: "h-3 w-3" }), lt(l.lastHeartbeat)] })] })] }); }
function e4({ agents: l }) { const i = l.filter(m => m.status === "active").length, r = l.filter(m => m.status === "busy").length, c = l.filter(m => m.status === "inactive").length, u = l.filter(m => m.status === "error").length; return s.jsxs("div", { className: "grid gap-4 sm:grid-cols-4", children: [s.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "rounded-lg bg-green-500/10 p-2", children: s.jsx(Dn, { className: "h-5 w-5 text-green-500" }) }), s.jsxs("div", { children: [s.jsx("p", { className: "text-2xl font-bold", children: i }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Activos" })] })] }) }), s.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "rounded-lg bg-blue-500/10 p-2", children: s.jsx(Pe, { className: "h-5 w-5 text-blue-500" }) }), s.jsxs("div", { children: [s.jsx("p", { className: "text-2xl font-bold", children: r }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Ocupados" })] })] }) }), s.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "rounded-lg bg-gray-500/10 p-2", children: s.jsx(nt, { className: "h-5 w-5 text-gray-500" }) }), s.jsxs("div", { children: [s.jsx("p", { className: "text-2xl font-bold", children: c }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Inactivos" })] })] }) }), s.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "rounded-lg bg-red-500/10 p-2", children: s.jsx(St, { className: "h-5 w-5 text-red-500" }) }), s.jsxs("div", { children: [s.jsx("p", { className: "text-2xl font-bold", children: u }), s.jsx("p", { className: "text-xs text-muted-foreground", children: "Con errores" })] })] }) })] }); }
function t4() { const { data: l, isLoading: i } = zg(); return i ? s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx("div", { className: "text-muted-foreground", children: "Cargando agentes..." }) }) : s.jsxs("div", { className: "space-y-6", children: [s.jsxs("div", { children: [s.jsx("h1", { className: "text-2xl font-bold", children: "Agentes IA" }), s.jsxs("p", { className: "text-muted-foreground", children: [(l == null ? void 0 : l.length) || 0, " agentes configurados"] })] }), s.jsx(e4, { agents: l || [] }), s.jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: l && l.length > 0 ? l.map(r => s.jsx(W2, { agent: r }, r.id)) : s.jsx("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: "No hay agentes configurados" }) })] }); }
const zd = [{ id: 1, name: "Akademate Platform", description: "Plataforma SaaS para academias con 12 tenants activos pagando suscripcion", icon: "graduation-cap", status: "active", metrics: { mrr: 48e3, arr: 576e3, clients: 12, churn: 2.5, growth: 15, ticketPromedio: 4e3 }, billing: { nextInvoice: "2024-02-01", pendingAmount: 12e3 } }, { id: 2, name: "Inscouter", description: "Plataforma de scouting deportivo con suscripciones activas", icon: "search", status: "growing", metrics: { mrr: 25e3, arr: 3e5, clients: 8, churn: 1.5, growth: 25, ticketPromedio: 3125 } }, { id: 3, name: "NazcaTrade", description: "Sistema de trading algoritmico con licencias enterprise", icon: "chart", status: "active", metrics: { mrr: 85e3, arr: 102e4, clients: 5, churn: 0, growth: 8, ticketPromedio: 17e3 } }, { id: 4, name: "SOLARIA Agency", description: "Servicios de consultoria y desarrollo web", icon: "building", status: "active", metrics: { mrr: 35e3, arr: 42e4, clients: 15, churn: 5, growth: 12, ticketPromedio: 2333 } }], Ug = { "graduation-cap": s.jsx(mu, { className: "h-6 w-6" }), search: s.jsx(Hn, { className: "h-6 w-6" }), chart: s.jsx(fj, { className: "h-6 w-6" }), building: s.jsx(lg, { className: "h-6 w-6" }) };
function Er(l) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(l); }
function s4({ metrics: l }) { const i = l || { mrr: 0, arr: 0, clients: 0, churn: 0, growth: 0 }; return s.jsxs("div", { className: "metrics-row", children: [s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "MRR" }), s.jsx("div", { className: "metric-value", children: Er(i.mrr) }), s.jsxs("span", { className: `metric-change ${i.growth > 0 ? "positive" : "negative"}`, children: [i.growth > 0 ? s.jsx(br, { className: "h-3 w-3" }) : s.jsx(sg, { className: "h-3 w-3" }), Math.abs(i.growth), "%"] })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "ARR" }), s.jsx("div", { className: "metric-value", children: Er(i.arr) })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Clientes" }), s.jsx("div", { className: "metric-value", children: i.clients })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Churn" }), s.jsxs("div", { className: "metric-value", children: [i.churn, "%"] }), s.jsx("span", { className: `metric-change ${i.churn <= 2 ? "positive" : "negative"}`, children: i.churn <= 2 ? "Saludable" : "Atención" })] })] }); }
function a4({ business: l, onClick: i }) { return s.jsxs("div", { onClick: i, className: "bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary transition-all hover:-translate-y-1", children: [s.jsxs("div", { className: "flex items-start justify-between mb-4", children: [s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary", children: Ug[l.icon] || s.jsx(cu, { className: "h-6 w-6" }) }), s.jsxs("div", { children: [s.jsx("h3", { className: "font-semibold text-base", children: l.name }), s.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: l.description })] })] }), s.jsx("span", { className: `business-status ${l.status}`, children: l.status === "active" ? "Activo" : l.status === "growing" ? "Creciendo" : "Pausado" })] }), s.jsx(s4, { metrics: l.metrics })] }); }
function mp() { const { businessId: l } = Al(), i = $t(), r = fs(C => C.token), [c, u] = B.useState([]), [m, h] = B.useState(!0), [p, b] = B.useState("grid"); B.useEffect(() => { async function C() { try {
    const j = await fetch("/api/businesses", { headers: { Authorization: `Bearer ${r}` } });
    if (j.ok) {
        const w = await j.json();
        u(w.businesses || zd);
    }
    else
        u(zd);
}
catch {
    u(zd);
}
finally {
    h(!1);
} } C(); }, [r]); const y = c.reduce((C, j) => { var w; return C + (((w = j.metrics) == null ? void 0 : w.mrr) || 0); }, 0), v = c.reduce((C, j) => { var w; return C + (((w = j.metrics) == null ? void 0 : w.clients) || 0); }, 0), g = c.length ? Math.round(c.reduce((C, j) => { var w; return C + (((w = j.metrics) == null ? void 0 : w.growth) || 0); }, 0) / c.length) : 0, k = c.filter(C => C.status === "active").length; return m ? s.jsx("div", { className: "flex items-center justify-center h-96", children: s.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : s.jsxs("div", { className: "space-y-6", children: [s.jsxs("div", { className: "section-header", children: [s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Negocios" }), s.jsxs("p", { className: "section-subtitle", children: [c.length, " negocios operativos"] })] }), s.jsxs("div", { className: "section-actions", children: [s.jsx("button", { onClick: () => b("grid"), className: `p-2 rounded-lg transition-colors ${p === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: s.jsx(Un, { className: "h-5 w-5" }) }), s.jsx("button", { onClick: () => b("list"), className: `p-2 rounded-lg transition-colors ${p === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: s.jsx(Ln, { className: "h-5 w-5" }) })] })] }), s.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon orange", children: s.jsx(rg, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "MRR Total" }), s.jsx("div", { className: "stat-value", children: Er(y) })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon green", children: s.jsx(yg, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Clientes Totales" }), s.jsx("div", { className: "stat-value", children: v })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon projects", children: s.jsx(Qr, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Crecimiento Prom" }), s.jsxs("div", { className: "stat-value", children: [g, "%"] })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon agents", children: s.jsx(gj, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Negocios Activos" }), s.jsx("div", { className: "stat-value", children: k })] })] })] }), p === "grid" ? s.jsx("div", { className: "grid grid-cols-2 gap-4", children: c.map(C => s.jsx(a4, { business: C, onClick: () => i(`/businesses/${C.id}`) }, C.id)) }) : s.jsx("div", { className: "space-y-3", children: c.map(C => { var j; return s.jsxs("div", { onClick: () => i(`/businesses/${C.id}`), className: "flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary transition-all", children: [s.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary", children: Ug[C.icon] || s.jsx(cu, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "flex-1", children: [s.jsx("h3", { className: "font-semibold", children: C.name }), s.jsx("p", { className: "text-xs text-muted-foreground", children: C.description })] }), s.jsxs("div", { className: "text-right", children: [s.jsx("div", { className: "font-bold text-primary", children: Er(((j = C.metrics) == null ? void 0 : j.mrr) || 0) }), s.jsx("div", { className: "text-xs text-muted-foreground", children: "MRR" })] }), s.jsx("span", { className: `business-status ${C.status}`, children: C.status === "active" ? "Activo" : C.status === "growing" ? "Creciendo" : "Pausado" })] }, C.id); }) })] }); }
const l4 = { vps: [{ id: 1, name: "SOLARIA Production", provider: "Hetzner", ip: "46.62.222.138", specs: "4 vCPU, 8GB RAM, 160GB SSD", status: "online", services: ["Apache", "PHP 8.4", "MariaDB", "Node.js"] }, { id: 2, name: "NEMESIS Server", provider: "Hostinger", ip: "148.230.118.124", specs: "2 vCPU, 4GB RAM, 100GB SSD", status: "online", services: ["Docker", "PM2", "Redis"] }], nemesis: [{ id: 1, name: "origin-command01", ip: "100.122.193.83", type: "macOS", status: "active" }, { id: 2, name: "Mac-Mini-DRAKE", ip: "100.79.246.5", type: "macOS (M2)", status: "active" }, { id: 3, name: "DRAKE-COMMAND01", ip: "100.64.226.80", type: "Linux", status: "active" }, { id: 4, name: "iPad-Drake-Command", ip: "100.87.12.24", type: "iOS", status: "active" }, { id: 5, name: "iPhone-400i", ip: "100.112.92.21", type: "iOS", status: "active" }], cloudflare: [{ id: 1, domain: "solaria.agency", status: "active", ssl: !0 }, { id: 2, domain: "dfo.solaria.agency", status: "active", ssl: !0 }, { id: 3, domain: "akademate.com", status: "active", ssl: !0 }], sshKeys: [{ id: 1, name: "nemesis_cmdr_key", type: "Ed25519", fingerprint: "SHA256:Gx7..." }, { id: 2, name: "id_ed25519", type: "Ed25519", fingerprint: "SHA256:Hy8..." }, { id: 3, name: "id_solaria_hetzner_prod", type: "Ed25519", fingerprint: "SHA256:Kz9..." }], databases: [{ id: 1, name: "solaria_construction", type: "MariaDB", size: "156 MB" }, { id: 2, name: "akademate_prod", type: "PostgreSQL", size: "2.4 GB" }, { id: 3, name: "cache_redis", type: "Redis", size: "128 MB" }] };
function fp({ status: l }) { const i = { online: { color: "text-green-400 bg-green-400/20", icon: vr, label: "Online" }, active: { color: "text-green-400 bg-green-400/20", icon: vr, label: "Activo" }, offline: { color: "text-red-400 bg-red-400/20", icon: Fx, label: "Offline" }, inactive: { color: "text-gray-400 bg-gray-400/20", icon: Fx, label: "Inactivo" }, maintenance: { color: "text-yellow-400 bg-yellow-400/20", icon: Pe, label: "Mantenimiento" }, pending: { color: "text-yellow-400 bg-yellow-400/20", icon: Pe, label: "Pendiente" } }, { color: r, icon: c, label: u } = i[l]; return s.jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r}`, children: [s.jsx(c, { className: "h-3 w-3" }), u] }); }
function n4({ text: l }) { const [i, r] = B.useState(!1), c = () => { navigator.clipboard.writeText(l), r(!0), setTimeout(() => r(!1), 2e3); }; return s.jsx("button", { onClick: c, className: "p-1.5 rounded hover:bg-accent transition-colors", title: "Copiar", children: i ? s.jsx(vr, { className: "h-4 w-4 text-green-400" }) : s.jsx(wl, { className: "h-4 w-4 text-muted-foreground" }) }); }
function i4() { const { vps: l, nemesis: i, cloudflare: r, sshKeys: c, databases: u } = l4, m = l.length, h = l.filter(y => y.status === "online").length, p = i.filter(y => y.status === "active").length, b = r.filter(y => y.status === "active").length; return s.jsxs("div", { className: "space-y-6", children: [s.jsx("div", { className: "section-header", children: s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Infraestructura" }), s.jsx("p", { className: "section-subtitle", children: "VPS, SSH, Cloudflare y accesos de gestion" })] }) }), s.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon green", children: s.jsx(jr, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "VPS Online" }), s.jsxs("div", { className: "stat-value", children: [h, "/", m] })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon agents", children: s.jsx(Wx, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "NEMESIS Activos" }), s.jsx("div", { className: "stat-value", children: p })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon projects", children: s.jsx($x, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Dominios CF" }), s.jsx("div", { className: "stat-value", children: b })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon orange", children: s.jsx(Ix, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Claves SSH" }), s.jsx("div", { className: "stat-value", children: c.length })] })] })] }), s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [s.jsx(jr, { className: "h-4 w-4 text-green-400" }), "SERVIDORES VPS"] }), s.jsx("div", { className: "space-y-4", children: l.map(y => s.jsxs("div", { className: "bg-accent/30 rounded-lg p-4", children: [s.jsxs("div", { className: "flex items-start justify-between mb-3", children: [s.jsxs("div", { children: [s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("h4", { className: "font-medium", children: y.name }), s.jsx("span", { className: "text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded", children: y.provider })] }), s.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: y.specs })] }), s.jsx(fp, { status: y.status })] }), s.jsxs("div", { className: "flex items-center justify-between", children: [s.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [s.jsx(uu, { className: "h-4 w-4 text-muted-foreground" }), s.jsx("code", { className: "font-mono text-primary", children: y.ip }), s.jsx(n4, { text: `ssh root@${y.ip}` })] }), s.jsx("div", { className: "flex gap-1.5", children: y.services.map(v => s.jsx("span", { className: "project-tag blue", children: v }, v)) })] })] }, y.id)) })] }), s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [s.jsx(Wx, { className: "h-4 w-4 text-purple-400" }), "RED NEMESIS (Tailscale VPN)"] }), s.jsx("div", { className: "grid grid-cols-5 gap-3", children: i.map(y => s.jsxs("div", { className: "bg-accent/30 rounded-lg p-3 text-center", children: [s.jsx("div", { className: `w-2 h-2 rounded-full mx-auto mb-2 ${y.status === "active" ? "bg-green-400" : "bg-gray-400"}` }), s.jsx("div", { className: "text-xs font-medium truncate", title: y.name, children: y.name }), s.jsx("div", { className: "text-[10px] text-muted-foreground", children: y.type }), s.jsx("code", { className: "text-[10px] text-primary font-mono", children: y.ip })] }, y.id)) })] }), s.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [s.jsx($x, { className: "h-4 w-4 text-blue-400" }), "CLOUDFLARE DOMINIOS"] }), s.jsx("div", { className: "space-y-2", children: r.map(y => s.jsxs("div", { className: "flex items-center justify-between p-2 bg-accent/30 rounded-lg", children: [s.jsxs("div", { className: "flex items-center gap-2", children: [y.ssl && s.jsx(gg, { className: "h-4 w-4 text-green-400" }), s.jsx("span", { className: "text-sm font-mono", children: y.domain })] }), s.jsx(fp, { status: y.status })] }, y.id)) })] }), s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [s.jsx(Ix, { className: "h-4 w-4 text-yellow-400" }), "CLAVES SSH"] }), s.jsx("div", { className: "space-y-2", children: c.map(y => s.jsxs("div", { className: "flex items-center justify-between p-2 bg-accent/30 rounded-lg", children: [s.jsxs("div", { children: [s.jsx("div", { className: "text-sm font-medium", children: y.name }), s.jsx("div", { className: "text-[10px] text-muted-foreground", children: y.fingerprint })] }), s.jsx("span", { className: "project-tag green", children: y.type })] }, y.id)) })] })] }), s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [s.jsx(yj, { className: "h-4 w-4 text-cyan-400" }), "BASES DE DATOS"] }), s.jsx("div", { className: "metrics-row", children: u.map(y => s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: y.type }), s.jsx("div", { className: "metric-value text-base", children: y.name }), s.jsx("span", { className: "metric-change neutral", children: y.size })] }, y.id)) })] }), s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [s.jsx(Bj, { className: "h-4 w-4 text-green-400" }), "COMANDOS RAPIDOS"] }), s.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [s.jsxs("button", { onClick: () => { navigator.clipboard.writeText("ssh root@46.62.222.138"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [s.jsx(wl, { className: "h-4 w-4" }), "SSH SOLARIA"] }), s.jsxs("button", { onClick: () => { navigator.clipboard.writeText("ssh root@148.230.118.124"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [s.jsx(wl, { className: "h-4 w-4" }), "SSH NEMESIS"] }), s.jsxs("button", { onClick: () => { navigator.clipboard.writeText("tailscale status"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [s.jsx(wl, { className: "h-4 w-4" }), "Tailscale Status"] }), s.jsxs("button", { onClick: () => { navigator.clipboard.writeText("pm2 status"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [s.jsx(wl, { className: "h-4 w-4" }), "PM2 Status"] })] })] })] }); }
function Rt({ title: l, icon: i, children: r }) { return s.jsxs("div", { className: "mb-8", children: [s.jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [s.jsx(i, { className: "h-5 w-5 text-primary" }), l] }), r] }); }
function qt({ title: l, children: i }) { return s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [l && s.jsx("h3", { className: "text-sm font-medium mb-4 text-muted-foreground", children: l }), i] }); }
function r4() { return s.jsxs("div", { className: "space-y-6 pb-8", children: [s.jsx("div", { className: "section-header", children: s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Design Hub" }), s.jsx("p", { className: "section-subtitle", children: "Componentes UI, tipografias y elementos graficos" })] }) }), s.jsxs("div", { className: "space-y-8 overflow-y-auto pr-2", children: [s.jsx(Rt, { title: "Brand Identity", icon: Rj, children: s.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [s.jsx(qt, { title: "Logo", children: s.jsx("div", { className: "text-center p-5 bg-accent rounded-lg", children: s.jsx("img", { src: "/solaria-logo.png", alt: "SOLARIA Logo", className: "w-20 h-20 mx-auto", onError: l => { l.currentTarget.style.display = "none"; } }) }) }), s.jsx(qt, { title: "Brand Colors", children: s.jsxs("div", { className: "flex gap-2 flex-wrap", children: [s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f6921d]", title: "SOLARIA Orange" }), s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#d97706]", title: "Orange Dark" }), s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#0a0a0a]", title: "Background" }), s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#141414]", title: "Secondary BG" })] }) }), s.jsx(qt, { title: "Phase Colors", children: s.jsxs("div", { className: "flex gap-2 flex-wrap", children: [s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#a855f7]", title: "Planning" }), s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#22d3ee]", title: "Development" }), s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#14b8a6]", title: "Testing" }), s.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#22c55e]", title: "Production" })] }) })] }) }), s.jsx(Rt, { title: "Typography", icon: Uj, children: s.jsxs(qt, { children: [s.jsxs("div", { className: "mb-4", children: [s.jsx("span", { className: "text-[10px] text-muted-foreground uppercase", children: "Font Family" }), s.jsx("div", { className: "text-2xl font-semibold", children: "Inter" })] }), s.jsxs("div", { className: "space-y-3", children: [s.jsxs("div", { className: "flex items-baseline gap-4", children: [s.jsx("span", { className: "text-3xl font-bold", children: "Heading H1" }), s.jsx("span", { className: "text-xs text-muted-foreground", children: "32px / 700" })] }), s.jsxs("div", { className: "flex items-baseline gap-4", children: [s.jsx("span", { className: "text-2xl font-semibold", children: "Heading H2" }), s.jsx("span", { className: "text-xs text-muted-foreground", children: "24px / 600" })] }), s.jsxs("div", { className: "flex items-baseline gap-4", children: [s.jsx("span", { className: "text-lg font-semibold", children: "Heading H3" }), s.jsx("span", { className: "text-xs text-muted-foreground", children: "18px / 600" })] }), s.jsxs("div", { className: "flex items-baseline gap-4", children: [s.jsx("span", { className: "text-sm font-medium", children: "Body Text" }), s.jsx("span", { className: "text-xs text-muted-foreground", children: "14px / 500" })] }), s.jsxs("div", { className: "flex items-baseline gap-4", children: [s.jsx("span", { className: "text-xs text-muted-foreground", children: "Small / Muted" }), s.jsx("span", { className: "text-xs text-muted-foreground", children: "12px / 400" })] }), s.jsxs("div", { className: "flex items-baseline gap-4", children: [s.jsx("span", { className: "text-[10px] uppercase font-semibold tracking-wide", children: "LABEL UPPERCASE" }), s.jsx("span", { className: "text-xs text-muted-foreground", children: "10px / 600 / Uppercase" })] })] })] }) }), s.jsx(Rt, { title: "Tags / Badges", icon: bg, children: s.jsxs(qt, { children: [s.jsxs("div", { className: "mb-4", children: [s.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Project Tags (3 Categories)" }), s.jsxs("div", { className: "flex gap-2 flex-wrap", children: [s.jsx("span", { className: "project-tag blue", children: "SaaS" }), s.jsx("span", { className: "project-tag blue", children: "Platform" }), s.jsx("span", { className: "project-tag green", children: "React" }), s.jsx("span", { className: "project-tag green", children: "Node.js" }), s.jsx("span", { className: "project-tag purple", children: "Enterprise" }), s.jsx("span", { className: "project-tag purple", children: "B2B" })] })] }), s.jsxs("div", { children: [s.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Phase Badges" }), s.jsxs("div", { className: "flex gap-2 flex-wrap", children: [s.jsx("span", { className: "progress-phase-badge planning", children: "Planificacion" }), s.jsx("span", { className: "progress-phase-badge development", children: "Desarrollo" }), s.jsx("span", { className: "progress-phase-badge testing", children: "Testing" }), s.jsx("span", { className: "progress-phase-badge production", children: "Produccion" })] })] })] }) }), s.jsx(Rt, { title: "Progress Bars", icon: hj, children: s.jsxs(qt, { children: [s.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-3", children: "Segmented Phase Progress" }), s.jsxs("div", { className: "progress-segments mb-2", children: [s.jsx("div", { className: "progress-segment planning" }), s.jsx("div", { className: "progress-segment development" }), s.jsx("div", { className: "progress-segment testing" }), s.jsx("div", { className: "progress-segment inactive" })] }), s.jsxs("div", { className: "progress-labels", children: [s.jsx("span", { className: "progress-label-item completed", children: "Planificacion" }), s.jsx("span", { className: "progress-label-item completed", children: "Desarrollo" }), s.jsx("span", { className: "progress-label-item active", children: "Testing" }), s.jsx("span", { className: "progress-label-item", children: "Produccion" })] })] }) }), s.jsx(Rt, { title: "Mini Trello (Equalizer)", icon: bj, children: s.jsx(qt, { children: s.jsxs("div", { className: "mini-trello max-w-md", children: [s.jsxs("div", { className: "trello-column", children: [s.jsx("span", { className: "trello-label", children: "BL" }), s.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => s.jsx("div", { className: `trello-slot ${i < 3 ? "filled" : ""}`, style: i < 3 ? { background: "#64748b", borderColor: "transparent" } : {} }, i)) }), s.jsx("span", { className: "trello-count", children: "3" })] }), s.jsxs("div", { className: "trello-column", children: [s.jsx("span", { className: "trello-label", children: "TD" }), s.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => s.jsx("div", { className: `trello-slot ${i < 5 ? "filled" : ""}`, style: i < 5 ? { background: "#f59e0b", borderColor: "transparent" } : {} }, i)) }), s.jsx("span", { className: "trello-count", children: "5" })] }), s.jsxs("div", { className: "trello-column", children: [s.jsx("span", { className: "trello-label", children: "DO" }), s.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => s.jsx("div", { className: `trello-slot ${i < 2 ? "filled" : ""}`, style: i < 2 ? { background: "#3b82f6", borderColor: "transparent" } : {} }, i)) }), s.jsx("span", { className: "trello-count", children: "2" })] }), s.jsxs("div", { className: "trello-column", children: [s.jsx("span", { className: "trello-label", children: "DN" }), s.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => s.jsx("div", { className: `trello-slot ${i < 7 ? "filled" : ""}`, style: i < 7 ? { background: "#22c55e", borderColor: "transparent" } : {} }, i)) }), s.jsx("span", { className: "trello-count", children: "7" })] })] }) }) }), s.jsx(Rt, { title: "Buttons", icon: Ej, children: s.jsx(qt, { children: s.jsxs("div", { className: "flex gap-3 flex-wrap items-center", children: [s.jsx("button", { className: "btn-primary", children: "Primary" }), s.jsx("button", { className: "btn-secondary", children: "Secondary" }), s.jsx("button", { className: "p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors", children: s.jsx(Nr, { className: "h-4 w-4" }) }), s.jsxs("button", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors", children: [s.jsx(Nr, { className: "h-3 w-3" }), " Editar"] }), s.jsx("button", { className: "w-7 h-7 rounded bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors", children: s.jsx(mt, { className: "h-4 w-4" }) }), s.jsx("button", { className: "px-2 py-1 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors", children: "→ Task" })] }) }) }), s.jsx(Rt, { title: "URL Items", icon: fu, children: s.jsx(qt, { children: s.jsxs("div", { className: "space-y-2 max-w-xs", children: [s.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [s.jsx("div", { className: "url-item-icon prod", children: s.jsx(uu, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "url-item-text", children: [s.jsx("div", { className: "url-item-label", children: "Prod" }), s.jsx("div", { className: "url-item-url", children: "https://example.com" })] }), s.jsx(Jt, { className: "h-3 w-3 text-muted-foreground" })] }), s.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [s.jsx("div", { className: "url-item-icon staging", children: s.jsx(jj, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "url-item-text", children: [s.jsx("div", { className: "url-item-label", children: "Staging" }), s.jsx("div", { className: "url-item-url", children: "https://staging.example.com" })] }), s.jsx(Jt, { className: "h-3 w-3 text-muted-foreground" })] }), s.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [s.jsx("div", { className: "url-item-icon local", children: s.jsx(mg, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "url-item-text", children: [s.jsx("div", { className: "url-item-label", children: "Local" }), s.jsx("div", { className: "url-item-url", children: "http://localhost:3000" })] }), s.jsx(Jt, { className: "h-3 w-3 text-muted-foreground" })] }), s.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [s.jsx("div", { className: "url-item-icon repo", children: s.jsx(Px, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "url-item-text", children: [s.jsx("div", { className: "url-item-label", children: "Repo" }), s.jsx("div", { className: "url-item-url", children: "github.com/user/repo" })] }), s.jsx(Jt, { className: "h-3 w-3 text-muted-foreground" })] })] }) }) }), s.jsx(Rt, { title: "TODO Items", icon: Dj, children: s.jsx(qt, { children: s.jsxs("div", { className: "max-w-xs", children: [s.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [s.jsx("input", { type: "text", placeholder: "Escribe una nota...", className: "flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm" }), s.jsx("button", { className: "w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center", children: s.jsx(mt, { className: "h-4 w-4" }) })] }), s.jsxs("div", { className: "space-y-2", children: [s.jsxs("div", { className: "flex items-center gap-2 p-2 bg-accent/50 rounded-lg", children: [s.jsx("div", { className: "w-4 h-4 rounded border-2 border-primary" }), s.jsx("span", { className: "flex-1 text-xs", children: "Revisar diseno del dashboard" }), s.jsx("span", { className: "text-[9px] text-muted-foreground", children: "12 dic" }), s.jsx("button", { className: "text-[10px] px-1.5 py-0.5 bg-accent rounded", children: "→" })] }), s.jsxs("div", { className: "flex items-center gap-2 p-2 bg-accent/50 rounded-lg opacity-60", children: [s.jsx("div", { className: "w-4 h-4 rounded bg-primary flex items-center justify-center", children: s.jsx(Sl, { className: "h-2.5 w-2.5 text-white" }) }), s.jsx("span", { className: "flex-1 text-xs line-through", children: "Aprobar colores del tema" }), s.jsx("span", { className: "text-[9px] text-muted-foreground", children: "08 dic" })] })] })] }) }) }), s.jsx(Rt, { title: "Activity Items", icon: Pe, children: s.jsx(qt, { children: s.jsxs("div", { className: "space-y-2 max-w-xs", children: [s.jsxs("div", { className: "flex items-start gap-2 p-2 bg-accent/50 rounded-lg", children: [s.jsx("div", { className: "w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0", children: s.jsx(Sl, { className: "h-3 w-3 text-green-400" }) }), s.jsxs("div", { className: "flex-1", children: [s.jsx("div", { className: "text-xs font-medium", children: "Tarea completada" }), s.jsx("div", { className: "text-[9px] text-muted-foreground", children: "Hace 2h" })] })] }), s.jsxs("div", { className: "flex items-start gap-2 p-2 bg-accent/50 rounded-lg", children: [s.jsx("div", { className: "w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0", children: s.jsx(Px, { className: "h-3 w-3 text-blue-400" }) }), s.jsxs("div", { className: "flex-1", children: [s.jsx("div", { className: "text-xs font-medium", children: "Nuevo commit" }), s.jsx("div", { className: "text-[9px] text-muted-foreground", children: "Hace 5h" })] })] })] }) }) }), s.jsx(Rt, { title: "Form Elements", icon: _j, children: s.jsx(qt, { children: s.jsxs("div", { className: "grid grid-cols-2 gap-4 max-w-lg", children: [s.jsxs("div", { children: [s.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Input Label" }), s.jsx("input", { type: "text", defaultValue: "Input value", className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm" })] }), s.jsxs("div", { children: [s.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Select" }), s.jsxs("select", { className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm", children: [s.jsx("option", { children: "Option 1" }), s.jsx("option", { children: "Option 2" })] })] }), s.jsxs("div", { className: "col-span-2", children: [s.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Textarea" }), s.jsx("textarea", { defaultValue: "Textarea content", className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none" })] })] }) }) }), s.jsx("div", { className: "p-5 rounded-xl border border-dashed border-primary bg-gradient-to-br from-primary/10 to-transparent", children: s.jsxs(Rt, { title: "METRICS ROW (Core Component)", icon: Qr, children: [s.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Componente central del sistema. Los cambios en CSS Variables se aplican automaticamente a todo el dashboard." }), s.jsxs("div", { className: "mb-6", children: [s.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "5 Columns - Full Width" }), s.jsxs("div", { className: "metrics-row", children: [s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Seguidores ✓" }), s.jsxs("div", { className: "metric-value", children: ["1K ", s.jsx("span", { className: "secondary", children: "/ 4.2K" })] })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Impresiones" }), s.jsx("div", { className: "metric-value", children: "4.9M" }), s.jsxs("span", { className: "metric-change positive", children: [s.jsx(br, { className: "h-3 w-3" }), " 334%"] })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Engagement" }), s.jsx("div", { className: "metric-value", children: "4.2%" }), s.jsxs("span", { className: "metric-change negative", children: [s.jsx(sg, { className: "h-3 w-3" }), " 19%"] })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Engagements" }), s.jsx("div", { className: "metric-value", children: "209.2K" }), s.jsxs("span", { className: "metric-change positive", children: [s.jsx(br, { className: "h-3 w-3" }), " 248%"] })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Profile Visits" }), s.jsx("div", { className: "metric-value", children: "18.2K" }), s.jsxs("span", { className: "metric-change positive", children: [s.jsx(br, { className: "h-3 w-3" }), " 88%"] })] })] })] }), s.jsxs("div", { children: [s.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Compact Variant (3 Columns)" }), s.jsxs("div", { className: "metrics-row compact max-w-md", children: [s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Tareas" }), s.jsx("div", { className: "metric-value", children: "24" })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Completadas" }), s.jsx("div", { className: "metric-value", children: "18" })] }), s.jsxs("div", { className: "metric-cell", children: [s.jsx("div", { className: "metric-label", children: "Progreso" }), s.jsx("div", { className: "metric-value", children: "75%" })] })] })] })] }) }), s.jsx(Rt, { title: "Stat Cards", icon: Dn, children: s.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon projects", children: s.jsx(zj, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Proyectos Activos" }), s.jsx("div", { className: "stat-value", children: "5" })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon tasks", children: s.jsx(Sl, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Tareas Completadas" }), s.jsx("div", { className: "stat-value", children: "127" })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon active", children: s.jsx(Pe, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "En Progreso" }), s.jsx("div", { className: "stat-value", children: "12" })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon agents", children: s.jsx(Dn, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Agentes Activos" }), s.jsx("div", { className: "stat-value", children: "3" })] })] })] }) }), s.jsx(Rt, { title: "CSS Variables Reference", icon: pg, children: s.jsx(qt, { children: s.jsxs("div", { className: "grid grid-cols-2 gap-6 text-xs font-mono", children: [s.jsxs("div", { children: [s.jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Colors" }), s.jsxs("div", { className: "space-y-1.5", children: [s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "w-4 h-4 rounded bg-[#f6921d]" }), s.jsx("span", { children: "--solaria-orange: #f6921d" })] }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "w-4 h-4 rounded bg-[#22c55e]" }), s.jsx("span", { children: "--color-positive: #22c55e" })] }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "w-4 h-4 rounded bg-[#ef4444]" }), s.jsx("span", { children: "--color-negative: #ef4444" })] }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "w-4 h-4 rounded bg-[#3b82f6]" }), s.jsx("span", { children: "--color-info: #3b82f6" })] }), s.jsxs("div", { className: "flex items-center gap-2", children: [s.jsx("div", { className: "w-4 h-4 rounded bg-[#f59e0b]" }), s.jsx("span", { children: "--color-warning: #f59e0b" })] })] })] }), s.jsxs("div", { children: [s.jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Metrics" }), s.jsxs("div", { className: "space-y-1.5 text-muted-foreground", children: [s.jsx("div", { children: "--metric-card-radius: 12px" }), s.jsx("div", { children: "--metric-card-padding: 16px" }), s.jsx("div", { children: "--metric-label-size: 11px" }), s.jsx("div", { children: "--metric-value-size: 24px" }), s.jsx("div", { children: "--metric-value-weight: 700" })] })] })] }) }) })] })] }); }
const yu = { decision: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }, learning: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }, context: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }, requirement: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }, bug: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }, solution: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" }, pattern: { bg: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }, config: { bg: "rgba(249, 115, 22, 0.15)", color: "#f97316" }, architecture: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }, session: { bg: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" } };
function c4({ memory: l, onClick: i }) { const r = Math.round(l.importance * 100), c = l.tags || []; return s.jsxs("div", { onClick: i, className: "memory-card", children: [s.jsxs("div", { className: "memory-header", children: [s.jsx("div", { className: "memory-icon", children: s.jsx(Hr, { className: "h-4 w-4" }) }), s.jsxs("div", { className: "memory-title-group", children: [s.jsx("h3", { className: "memory-title", children: l.summary || l.content.substring(0, 60) }), s.jsxs("span", { className: "memory-id", children: ["#", l.id] })] }), s.jsxs("div", { className: "memory-importance", children: [s.jsx(Qr, { className: "h-3 w-3" }), s.jsxs("span", { children: [r, "%"] })] })] }), s.jsx("p", { className: "memory-content", children: l.content }), c.length > 0 && s.jsx("div", { className: "memory-tags", children: c.map(u => { const m = yu[u] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }; return s.jsx("span", { className: "memory-tag", style: { backgroundColor: m.bg, color: m.color }, children: u }, u); }) }), s.jsxs("div", { className: "memory-stats", children: [s.jsxs("div", { className: "memory-stat", children: [s.jsx(Sr, { className: "h-3 w-3" }), s.jsxs("span", { children: [l.accessCount, " accesos"] })] }), l.lastAccessed && s.jsxs("div", { className: "memory-stat", children: [s.jsx(Pe, { className: "h-3 w-3" }), s.jsx("span", { children: lt(l.lastAccessed) })] }), s.jsx("div", { className: "memory-stat created", children: lt(l.createdAt) })] })] }); }
function o4({ memory: l, onClick: i }) { const r = Math.round(l.importance * 100), c = l.tags || []; return s.jsxs("tr", { onClick: i, className: "memory-row", children: [s.jsx("td", { children: s.jsxs("div", { className: "flex items-center gap-3", children: [s.jsx("div", { className: "memory-icon-sm", children: s.jsx(Hr, { className: "h-4 w-4" }) }), s.jsxs("div", { children: [s.jsx("div", { className: "memory-title-sm", children: l.summary || l.content.substring(0, 50) }), s.jsxs("div", { className: "memory-id-sm", children: ["#", l.id] })] })] }) }), s.jsx("td", { children: s.jsx("div", { className: "flex flex-wrap gap-1", children: c.slice(0, 3).map(u => { const m = yu[u] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }; return s.jsx("span", { className: "memory-tag-sm", style: { backgroundColor: m.bg, color: m.color }, children: u }, u); }) }) }), s.jsx("td", { className: "text-center", children: s.jsxs("span", { className: "stat-value-sm", children: [r, "%"] }) }), s.jsx("td", { className: "text-center", children: s.jsx("span", { className: "stat-value-sm", children: l.accessCount }) }), s.jsx("td", { className: "text-center text-muted-foreground text-sm", children: lt(l.createdAt) })] }); }
function d4() { const [l, i] = B.useState(""), [r, c] = B.useState([]), [u, m] = B.useState("grid"), { data: h, isLoading: p } = BN({ tags: r }), { data: b } = HN(), { data: y } = LN(), { data: v } = UN(l, r), g = l.length > 2 ? v : h, k = (g == null ? void 0 : g.length) || 0, C = j => { c(w => w.includes(j) ? w.filter(T => T !== j) : [...w, j]); }; return p ? s.jsx("div", { className: "flex h-full items-center justify-center", children: s.jsx(Re, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : s.jsxs("div", { className: "space-y-6", children: [s.jsxs("div", { className: "section-header", children: [s.jsxs("div", { children: [s.jsx("h1", { className: "section-title", children: "Memorias" }), s.jsx("p", { className: "section-subtitle", children: "Sistema de memoria persistente para agentes IA" })] }), s.jsx("div", { className: "section-actions", children: s.jsxs("div", { className: "view-toggle", children: [s.jsx("button", { className: F("view-toggle-btn", u === "grid" && "active"), onClick: () => m("grid"), title: "Vista Grid", children: s.jsx(Un, { className: "h-4 w-4" }) }), s.jsx("button", { className: F("view-toggle-btn", u === "list" && "active"), onClick: () => m("list"), title: "Vista Lista", children: s.jsx(Ln, { className: "h-4 w-4" }) })] }) })] }), s.jsxs("div", { className: "dashboard-stats-row", children: [s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon projects", children: s.jsx(Hr, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Total Memorias" }), s.jsx("div", { className: "stat-value", children: Td((b == null ? void 0 : b.total_memories) || 0) })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon green", children: s.jsx(Qr, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Importancia Prom." }), s.jsxs("div", { className: "stat-value", children: [(((b == null ? void 0 : b.avg_importance) || 0) * 100).toFixed(0), "%"] })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon active", children: s.jsx(Sr, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Accesos Totales" }), s.jsx("div", { className: "stat-value", children: Td((b == null ? void 0 : b.total_accesses) || 0) })] })] }), s.jsxs("div", { className: "stat-card", children: [s.jsx("div", { className: "stat-icon agents", children: s.jsx(fg, { className: "h-5 w-5" }) }), s.jsxs("div", { className: "stat-content", children: [s.jsx("div", { className: "stat-label", children: "Proyectos" }), s.jsx("div", { className: "stat-value", children: Td((b == null ? void 0 : b.projects_with_memories) || 0) })] })] })] }), s.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [s.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [s.jsxs("div", { className: "relative flex-1", children: [s.jsx(Hn, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), s.jsx("input", { type: "text", placeholder: "Buscar en memorias (min. 3 caracteres)...", value: l, onChange: j => i(j.target.value), className: "w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), s.jsxs("span", { className: "text-sm text-muted-foreground", children: [k, " memorias"] })] }), y && y.length > 0 && s.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [s.jsx(pu, { className: "h-4 w-4 text-muted-foreground" }), y.map(j => { const w = yu[j.name] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }, T = r.includes(j.name); return s.jsxs("button", { onClick: () => C(j.name), className: F("memory-tag-filter", T && "selected"), style: T ? { backgroundColor: w.color, color: "#fff" } : { backgroundColor: w.bg, color: w.color }, children: [j.name, " (", j.usageCount, ")"] }, j.name); })] })] }), u === "grid" ? s.jsx("div", { className: "memories-grid", children: g && g.length > 0 ? g.map(j => s.jsx(c4, { memory: j }, j.id)) : s.jsxs("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: [s.jsx(St, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), s.jsx("p", { children: l.length > 2 ? "No se encontraron memorias con ese criterio" : "No hay memorias registradas" })] }) }) : s.jsx("div", { className: "bg-card border border-border rounded-xl", style: { padding: 0, overflow: "hidden" }, children: s.jsxs("table", { className: "list-table", children: [s.jsx("thead", { children: s.jsxs("tr", { children: [s.jsx("th", { style: { width: "35%" }, children: "Memoria" }), s.jsx("th", { style: { width: "25%" }, children: "Tags" }), s.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Importancia" }), s.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Accesos" }), s.jsx("th", { style: { width: "16%", textAlign: "center" }, children: "Creada" })] }) }), s.jsx("tbody", { children: g && g.length > 0 ? g.map(j => s.jsx(o4, { memory: j }, j.id)) : s.jsx("tr", { children: s.jsx("td", { colSpan: 5, children: s.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [s.jsx(St, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), s.jsx("p", { children: l.length > 2 ? "No se encontraron memorias" : "No hay memorias" })] }) }) }) })] }) })] }); }
function Lg() { return s.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: s.jsxs("div", { className: "flex flex-col items-center gap-4", children: [s.jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" }), s.jsx("p", { className: "text-muted-foreground", children: "Verificando sesion..." })] }) }); }
function u4({ children: l }) { const { isAuthenticated: i, _hasHydrated: r } = fs(); return r ? i ? s.jsx(s.Fragment, { children: l }) : s.jsx(hp, { to: "/login", replace: !0 }) : s.jsx(Lg, {}); }
function m4() { const { isChecking: l } = ij(); return l ? s.jsx(Lg, {}) : s.jsxs(py, { children: [s.jsx(at, { path: "/login", element: s.jsx(l2, {}) }), s.jsxs(at, { path: "/", element: s.jsx(u4, { children: s.jsx(a2, {}) }), children: [s.jsx(at, { index: !0, element: s.jsx(hp, { to: "/dashboard", replace: !0 }) }), s.jsx(at, { path: "dashboard", element: s.jsx(c2, {}) }), s.jsx(at, { path: "projects", element: s.jsx(f2, {}) }), s.jsx(at, { path: "projects/:id", element: s.jsx(C2, {}) }), s.jsx(at, { path: "projects/:id/tasks", element: s.jsx(q2, {}) }), s.jsx(at, { path: "projects/:id/links", element: s.jsx(B2, {}) }), s.jsx(at, { path: "projects/:id/settings", element: s.jsx(G2, {}) }), s.jsx(at, { path: "tasks", element: s.jsx($2, {}) }), s.jsx(at, { path: "tasks/archived", element: s.jsx(P2, {}) }), s.jsx(at, { path: "agents", element: s.jsx(t4, {}) }), s.jsx(at, { path: "businesses", element: s.jsx(mp, {}) }), s.jsx(at, { path: "businesses/:businessId", element: s.jsx(mp, {}) }), s.jsx(at, { path: "infrastructure", element: s.jsx(i4, {}) }), s.jsx(at, { path: "design-hub", element: s.jsx(r4, {}) }), s.jsx(at, { path: "memories", element: s.jsx(d4, {}) }), s.jsx(at, { path: "settings", element: s.jsx(I2, {}) })] })] }); }
const f4 = new oy({ defaultOptions: { queries: { staleTime: 1e3 * 60 * 5, refetchOnWindowFocus: !1, retry: 1 } } });
Sy.createRoot(document.getElementById("root")).render(s.jsx(Mn.StrictMode, { children: s.jsx(dy, { client: f4, children: s.jsx(kv, { children: s.jsx(gy, { basename: "/v2", children: s.jsx(m4, {}) }) }) }) }));
//# sourceMappingURL=index-C9UC4Tck.js.map
//# sourceMappingURL=index-C9UC4Tck.js.map