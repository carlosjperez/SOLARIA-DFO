import { u as Jt, j as a, a as lt, b as ss, Q as sb, c as ab } from "./query-D0abkBGM.js";
import { a as lb, b as nb, g as ib, R as An, r as U, N as rb, u as ms, O as cb, c as Tr, d as ob, e as dt, f as nx, B as ub } from "./vendor-BXhsGKj_.js";
import { c as db } from "./charts--6qEJHQB.js";
(function () { const i = document.createElement("link").relList; if (i && i.supports && i.supports("modulepreload"))
    return; for (const d of document.querySelectorAll('link[rel="modulepreload"]'))
    c(d); new MutationObserver(d => { for (const m of d)
    if (m.type === "childList")
        for (const h of m.addedNodes)
            h.tagName === "LINK" && h.rel === "modulepreload" && c(h); }).observe(document, { childList: !0, subtree: !0 }); function r(d) { const m = {}; return d.integrity && (m.integrity = d.integrity), d.referrerPolicy && (m.referrerPolicy = d.referrerPolicy), d.crossOrigin === "use-credentials" ? m.credentials = "include" : d.crossOrigin === "anonymous" ? m.credentials = "omit" : m.credentials = "same-origin", m; } function c(d) { if (d.ep)
    return; d.ep = !0; const m = r(d); fetch(d.href, m); } })();
var du = { exports: {} }, Nn = {}, fu = { exports: {} }, mu = {}; /**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var mp;
function fb() { return mp || (mp = 1, (function (l) { function i(z, Z) { var V = z.length; z.push(Z); e: for (; 0 < V;) {
    var ce = V - 1 >>> 1, je = z[ce];
    if (0 < d(je, Z))
        z[ce] = Z, z[V] = je, V = ce;
    else
        break e;
} } function r(z) { return z.length === 0 ? null : z[0]; } function c(z) { if (z.length === 0)
    return null; var Z = z[0], V = z.pop(); if (V !== Z) {
    z[0] = V;
    e: for (var ce = 0, je = z.length, ye = je >>> 1; ce < ye;) {
        var pe = 2 * (ce + 1) - 1, le = z[pe], de = pe + 1, Pe = z[de];
        if (0 > d(le, V))
            de < je && 0 > d(Pe, le) ? (z[ce] = Pe, z[de] = V, ce = de) : (z[ce] = le, z[pe] = V, ce = pe);
        else if (de < je && 0 > d(Pe, V))
            z[ce] = Pe, z[de] = V, ce = de;
        else
            break e;
    }
} return Z; } function d(z, Z) { var V = z.sortIndex - Z.sortIndex; return V !== 0 ? V : z.id - Z.id; } if (l.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
    var m = performance;
    l.unstable_now = function () { return m.now(); };
}
else {
    var h = Date, x = h.now();
    l.unstable_now = function () { return h.now() - x; };
} var g = [], y = [], v = 1, b = null, A = 3, S = !1, N = !1, C = !1, _ = !1, Q = typeof setTimeout == "function" ? setTimeout : null, X = typeof clearTimeout == "function" ? clearTimeout : null, H = typeof setImmediate < "u" ? setImmediate : null; function J(z) { for (var Z = r(y); Z !== null;) {
    if (Z.callback === null)
        c(y);
    else if (Z.startTime <= z)
        c(y), Z.sortIndex = Z.expirationTime, i(g, Z);
    else
        break;
    Z = r(y);
} } function $(z) { if (C = !1, J(z), !N)
    if (r(g) !== null)
        N = !0, Y || (Y = !0, ke());
    else {
        var Z = r(y);
        Z !== null && he($, Z.startTime - z);
    } } var Y = !1, R = -1, G = 5, ue = -1; function nt() { return _ ? !0 : !(l.unstable_now() - ue < G); } function Ve() { if (_ = !1, Y) {
    var z = l.unstable_now();
    ue = z;
    var Z = !0;
    try {
        e: {
            N = !1, C && (C = !1, X(R), R = -1), S = !0;
            var V = A;
            try {
                t: {
                    for (J(z), b = r(g); b !== null && !(b.expirationTime > z && nt());) {
                        var ce = b.callback;
                        if (typeof ce == "function") {
                            b.callback = null, A = b.priorityLevel;
                            var je = ce(b.expirationTime <= z);
                            if (z = l.unstable_now(), typeof je == "function") {
                                b.callback = je, J(z), Z = !0;
                                break t;
                            }
                            b === r(g) && c(g), J(z);
                        }
                        else
                            c(g);
                        b = r(g);
                    }
                    if (b !== null)
                        Z = !0;
                    else {
                        var ye = r(y);
                        ye !== null && he($, ye.startTime - z), Z = !1;
                    }
                }
                break e;
            }
            finally {
                b = null, A = V, S = !1;
            }
            Z = void 0;
        }
    }
    finally {
        Z ? ke() : Y = !1;
    }
} } var ke; if (typeof H == "function")
    ke = function () { H(Ve); };
else if (typeof MessageChannel < "u") {
    var Ie = new MessageChannel, Ze = Ie.port2;
    Ie.port1.onmessage = Ve, ke = function () { Ze.postMessage(null); };
}
else
    ke = function () { Q(Ve, 0); }; function he(z, Z) { R = Q(function () { z(l.unstable_now()); }, Z); } l.unstable_IdlePriority = 5, l.unstable_ImmediatePriority = 1, l.unstable_LowPriority = 4, l.unstable_NormalPriority = 3, l.unstable_Profiling = null, l.unstable_UserBlockingPriority = 2, l.unstable_cancelCallback = function (z) { z.callback = null; }, l.unstable_forceFrameRate = function (z) { 0 > z || 125 < z ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : G = 0 < z ? Math.floor(1e3 / z) : 5; }, l.unstable_getCurrentPriorityLevel = function () { return A; }, l.unstable_next = function (z) { switch (A) {
    case 1:
    case 2:
    case 3:
        var Z = 3;
        break;
    default: Z = A;
} var V = A; A = Z; try {
    return z();
}
finally {
    A = V;
} }, l.unstable_requestPaint = function () { _ = !0; }, l.unstable_runWithPriority = function (z, Z) { switch (z) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5: break;
    default: z = 3;
} var V = A; A = z; try {
    return Z();
}
finally {
    A = V;
} }, l.unstable_scheduleCallback = function (z, Z, V) { var ce = l.unstable_now(); switch (typeof V == "object" && V !== null ? (V = V.delay, V = typeof V == "number" && 0 < V ? ce + V : ce) : V = ce, z) {
    case 1:
        var je = -1;
        break;
    case 2:
        je = 250;
        break;
    case 5:
        je = 1073741823;
        break;
    case 4:
        je = 1e4;
        break;
    default: je = 5e3;
} return je = V + je, z = { id: v++, callback: Z, priorityLevel: z, startTime: V, expirationTime: je, sortIndex: -1 }, V > ce ? (z.sortIndex = V, i(y, z), r(g) === null && z === r(y) && (C ? (X(R), R = -1) : C = !0, he($, V - ce))) : (z.sortIndex = je, i(g, z), N || S || (N = !0, Y || (Y = !0, ke()))), z; }, l.unstable_shouldYield = nt, l.unstable_wrapCallback = function (z) { var Z = A; return function () { var V = A; A = Z; try {
    return z.apply(this, arguments);
}
finally {
    A = V;
} }; }; })(mu)), mu; }
var hp;
function mb() { return hp || (hp = 1, fu.exports = fb()), fu.exports; } /**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var pp;
function hb() {
    if (pp)
        return Nn;
    pp = 1;
    var l = mb(), i = lb(), r = nb();
    function c(e) { var t = "https://react.dev/errors/" + e; if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var s = 2; s < arguments.length; s++)
            t += "&args[]=" + encodeURIComponent(arguments[s]);
    } return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."; }
    function d(e) { return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11); }
    function m(e) { var t = e, s = e; if (e.alternate)
        for (; t.return;)
            t = t.return;
    else {
        e = t;
        do
            t = e, (t.flags & 4098) !== 0 && (s = t.return), e = t.return;
        while (e);
    } return t.tag === 3 ? s : null; }
    function h(e) { if (e.tag === 13) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null)
            return t.dehydrated;
    } return null; }
    function x(e) { if (e.tag === 31) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null)
            return t.dehydrated;
    } return null; }
    function g(e) { if (m(e) !== e)
        throw Error(c(188)); }
    function y(e) { var t = e.alternate; if (!t) {
        if (t = m(e), t === null)
            throw Error(c(188));
        return t !== e ? null : e;
    } for (var s = e, n = t;;) {
        var o = s.return;
        if (o === null)
            break;
        var u = o.alternate;
        if (u === null) {
            if (n = o.return, n !== null) {
                s = n;
                continue;
            }
            break;
        }
        if (o.child === u.child) {
            for (u = o.child; u;) {
                if (u === s)
                    return g(o), e;
                if (u === n)
                    return g(o), t;
                u = u.sibling;
            }
            throw Error(c(188));
        }
        if (s.return !== n.return)
            s = o, n = u;
        else {
            for (var f = !1, p = o.child; p;) {
                if (p === s) {
                    f = !0, s = o, n = u;
                    break;
                }
                if (p === n) {
                    f = !0, n = o, s = u;
                    break;
                }
                p = p.sibling;
            }
            if (!f) {
                for (p = u.child; p;) {
                    if (p === s) {
                        f = !0, s = u, n = o;
                        break;
                    }
                    if (p === n) {
                        f = !0, n = u, s = o;
                        break;
                    }
                    p = p.sibling;
                }
                if (!f)
                    throw Error(c(189));
            }
        }
        if (s.alternate !== n)
            throw Error(c(190));
    } if (s.tag !== 3)
        throw Error(c(188)); return s.stateNode.current === s ? e : t; }
    function v(e) { var t = e.tag; if (t === 5 || t === 26 || t === 27 || t === 6)
        return e; for (e = e.child; e !== null;) {
        if (t = v(e), t !== null)
            return t;
        e = e.sibling;
    } return null; }
    var b = Object.assign, A = Symbol.for("react.element"), S = Symbol.for("react.transitional.element"), N = Symbol.for("react.portal"), C = Symbol.for("react.fragment"), _ = Symbol.for("react.strict_mode"), Q = Symbol.for("react.profiler"), X = Symbol.for("react.consumer"), H = Symbol.for("react.context"), J = Symbol.for("react.forward_ref"), $ = Symbol.for("react.suspense"), Y = Symbol.for("react.suspense_list"), R = Symbol.for("react.memo"), G = Symbol.for("react.lazy"), ue = Symbol.for("react.activity"), nt = Symbol.for("react.memo_cache_sentinel"), Ve = Symbol.iterator;
    function ke(e) { return e === null || typeof e != "object" ? null : (e = Ve && e[Ve] || e["@@iterator"], typeof e == "function" ? e : null); }
    var Ie = Symbol.for("react.client.reference");
    function Ze(e) { if (e == null)
        return null; if (typeof e == "function")
        return e.$$typeof === Ie ? null : e.displayName || e.name || null; if (typeof e == "string")
        return e; switch (e) {
        case C: return "Fragment";
        case Q: return "Profiler";
        case _: return "StrictMode";
        case $: return "Suspense";
        case Y: return "SuspenseList";
        case ue: return "Activity";
    } if (typeof e == "object")
        switch (e.$$typeof) {
            case N: return "Portal";
            case H: return e.displayName || "Context";
            case X: return (e._context.displayName || "Context") + ".Consumer";
            case J:
                var t = e.render;
                return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
            case R: return t = e.displayName || null, t !== null ? t : Ze(e.type) || "Memo";
            case G:
                t = e._payload, e = e._init;
                try {
                    return Ze(e(t));
                }
                catch { }
        } return null; }
    var he = Array.isArray, z = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Z = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, V = { pending: !1, data: null, method: null, action: null }, ce = [], je = -1;
    function ye(e) { return { current: e }; }
    function pe(e) { 0 > je || (e.current = ce[je], ce[je] = null, je--); }
    function le(e, t) { je++, ce[je] = e.current, e.current = t; }
    var de = ye(null), Pe = ye(null), Ft = ye(null), Re = ye(null);
    function fa(e, t) { switch (le(Ft, t), le(Pe, e), le(de, null), t.nodeType) {
        case 9:
        case 11:
            e = (e = t.documentElement) && (e = e.namespaceURI) ? qh(e) : 0;
            break;
        default: if (e = t.tagName, t = t.namespaceURI)
            t = qh(t), e = Bh(t, e);
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
    } pe(de), le(de, e); }
    function $t() { pe(de), pe(Pe), pe(Ft); }
    function Ds(e) { e.memoizedState !== null && le(Re, e); var t = de.current, s = Bh(t, e.type); t !== s && (le(Pe, e), le(de, s)); }
    function Rs(e) { Pe.current === e && (pe(de), pe(Pe)), Re.current === e && (pe(Re), yn._currentValue = V); }
    var qs, dd;
    function ma(e) {
        if (qs === void 0)
            try {
                throw Error();
            }
            catch (s) {
                var t = s.stack.trim().match(/\n( *(at )?)/);
                qs = t && t[1] || "", dd = -1 < s.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < s.stack.indexOf("@") ? "@unknown:0:0" : "";
            }
        return `
` + qs + e + dd;
    }
    var Zr = !1;
    function Jr(e, t) {
        if (!e || Zr)
            return "";
        Zr = !0;
        var s = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var n = { DetermineComponentFrameRoot: function () { try {
                    if (t) {
                        var L = function () { throw Error(); };
                        if (Object.defineProperty(L.prototype, "props", { set: function () { throw Error(); } }), typeof Reflect == "object" && Reflect.construct) {
                            try {
                                Reflect.construct(L, []);
                            }
                            catch (D) {
                                var M = D;
                            }
                            Reflect.construct(e, [], L);
                        }
                        else {
                            try {
                                L.call();
                            }
                            catch (D) {
                                M = D;
                            }
                            e.call(L.prototype);
                        }
                    }
                    else {
                        try {
                            throw Error();
                        }
                        catch (D) {
                            M = D;
                        }
                        (L = e()) && typeof L.catch == "function" && L.catch(function () { });
                    }
                }
                catch (D) {
                    if (D && M && typeof D.stack == "string")
                        return [D.stack, M.stack];
                } return [null, null]; } };
            n.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var o = Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot, "name");
            o && o.configurable && Object.defineProperty(n.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
            var u = n.DetermineComponentFrameRoot(), f = u[0], p = u[1];
            if (f && p) {
                var j = f.split(`
`), E = p.split(`
`);
                for (o = n = 0; n < j.length && !j[n].includes("DetermineComponentFrameRoot");)
                    n++;
                for (; o < E.length && !E[o].includes("DetermineComponentFrameRoot");)
                    o++;
                if (n === j.length || o === E.length)
                    for (n = j.length - 1, o = E.length - 1; 1 <= n && 0 <= o && j[n] !== E[o];)
                        o--;
                for (; 1 <= n && 0 <= o; n--, o--)
                    if (j[n] !== E[o]) {
                        if (n !== 1 || o !== 1)
                            do
                                if (n--, o--, 0 > o || j[n] !== E[o]) {
                                    var q = `
` + j[n].replace(" at new ", " at ");
                                    return e.displayName && q.includes("<anonymous>") && (q = q.replace("<anonymous>", e.displayName)), q;
                                }
                            while (1 <= n && 0 <= o);
                        break;
                    }
            }
        }
        finally {
            Zr = !1, Error.prepareStackTrace = s;
        }
        return (s = e ? e.displayName || e.name : "") ? ma(s) : "";
    }
    function zg(e, t) { switch (e.tag) {
        case 26:
        case 27:
        case 5: return ma(e.type);
        case 16: return ma("Lazy");
        case 13: return e.child !== t && t !== null ? ma("Suspense Fallback") : ma("Suspense");
        case 19: return ma("SuspenseList");
        case 0:
        case 15: return Jr(e.type, !1);
        case 11: return Jr(e.type.render, !1);
        case 1: return Jr(e.type, !0);
        case 31: return ma("Activity");
        default: return "";
    } }
    function fd(e) {
        try {
            var t = "", s = null;
            do
                t += zg(e, s), s = e, e = e.return;
            while (e);
            return t;
        }
        catch (n) {
            return `
Error generating stack: ` + n.message + `
` + n.stack;
        }
    }
    var Fr = Object.prototype.hasOwnProperty, $r = l.unstable_scheduleCallback, Wr = l.unstable_cancelCallback, Dg = l.unstable_shouldYield, Rg = l.unstable_requestPaint, St = l.unstable_now, qg = l.unstable_getCurrentPriorityLevel, md = l.unstable_ImmediatePriority, hd = l.unstable_UserBlockingPriority, Hn = l.unstable_NormalPriority, Bg = l.unstable_LowPriority, pd = l.unstable_IdlePriority, Ug = l.log, Lg = l.unstable_setDisableYieldValue, El = null, kt = null;
    function Bs(e) { if (typeof Ug == "function" && Lg(e), kt && typeof kt.setStrictMode == "function")
        try {
            kt.setStrictMode(El, e);
        }
        catch { } }
    var At = Math.clz32 ? Math.clz32 : Qg, Hg = Math.log, Vg = Math.LN2;
    function Qg(e) { return e >>>= 0, e === 0 ? 32 : 31 - (Hg(e) / Vg | 0) | 0; }
    var Vn = 256, Qn = 262144, Gn = 4194304;
    function ha(e) { var t = e & 42; if (t !== 0)
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
    function Kn(e, t, s) { var n = e.pendingLanes; if (n === 0)
        return 0; var o = 0, u = e.suspendedLanes, f = e.pingedLanes; e = e.warmLanes; var p = n & 134217727; return p !== 0 ? (n = p & ~u, n !== 0 ? o = ha(n) : (f &= p, f !== 0 ? o = ha(f) : s || (s = p & ~e, s !== 0 && (o = ha(s))))) : (p = n & ~u, p !== 0 ? o = ha(p) : f !== 0 ? o = ha(f) : s || (s = n & ~e, s !== 0 && (o = ha(s)))), o === 0 ? 0 : t !== 0 && t !== o && (t & u) === 0 && (u = o & -o, s = t & -t, u >= s || u === 32 && (s & 4194048) !== 0) ? t : o; }
    function Ml(e, t) { return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0; }
    function Gg(e, t) { switch (e) {
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
    function xd() { var e = Gn; return Gn <<= 1, (Gn & 62914560) === 0 && (Gn = 4194304), e; }
    function Ir(e) { for (var t = [], s = 0; 31 > s; s++)
        t.push(e); return t; }
    function _l(e, t) { e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0); }
    function Kg(e, t, s, n, o, u) { var f = e.pendingLanes; e.pendingLanes = s, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= s, e.entangledLanes &= s, e.errorRecoveryDisabledLanes &= s, e.shellSuspendCounter = 0; var p = e.entanglements, j = e.expirationTimes, E = e.hiddenUpdates; for (s = f & ~s; 0 < s;) {
        var q = 31 - At(s), L = 1 << q;
        p[q] = 0, j[q] = -1;
        var M = E[q];
        if (M !== null)
            for (E[q] = null, q = 0; q < M.length; q++) {
                var D = M[q];
                D !== null && (D.lane &= -536870913);
            }
        s &= ~L;
    } n !== 0 && gd(e, n, 0), u !== 0 && o === 0 && e.tag !== 0 && (e.suspendedLanes |= u & ~(f & ~t)); }
    function gd(e, t, s) { e.pendingLanes |= t, e.suspendedLanes &= ~t; var n = 31 - At(t); e.entangledLanes |= t, e.entanglements[n] = e.entanglements[n] | 1073741824 | s & 261930; }
    function yd(e, t) { var s = e.entangledLanes |= t; for (e = e.entanglements; s;) {
        var n = 31 - At(s), o = 1 << n;
        o & t | e[n] & t && (e[n] |= t), s &= ~o;
    } }
    function bd(e, t) { var s = t & -t; return s = (s & 42) !== 0 ? 1 : Pr(s), (s & (e.suspendedLanes | t)) !== 0 ? 0 : s; }
    function Pr(e) { switch (e) {
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
    function ec(e) { return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2; }
    function vd() { var e = Z.p; return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : ip(e.type)); }
    function jd(e, t) { var s = Z.p; try {
        return Z.p = e, t();
    }
    finally {
        Z.p = s;
    } }
    var Us = Math.random().toString(36).slice(2), it = "__reactFiber$" + Us, ht = "__reactProps$" + Us, Ba = "__reactContainer$" + Us, tc = "__reactEvents$" + Us, Yg = "__reactListeners$" + Us, Xg = "__reactHandles$" + Us, Nd = "__reactResources$" + Us, Ol = "__reactMarker$" + Us;
    function sc(e) { delete e[it], delete e[ht], delete e[tc], delete e[Yg], delete e[Xg]; }
    function Ua(e) { var t = e[it]; if (t)
        return t; for (var s = e.parentNode; s;) {
        if (t = s[Ba] || s[it]) {
            if (s = t.alternate, t.child !== null || s !== null && s.child !== null)
                for (e = Kh(e); e !== null;) {
                    if (s = e[it])
                        return s;
                    e = Kh(e);
                }
            return t;
        }
        e = s, s = e.parentNode;
    } return null; }
    function La(e) { if (e = e[it] || e[Ba]) {
        var t = e.tag;
        if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
            return e;
    } return null; }
    function zl(e) { var t = e.tag; if (t === 5 || t === 26 || t === 27 || t === 6)
        return e.stateNode; throw Error(c(33)); }
    function Ha(e) { var t = e[Nd]; return t || (t = e[Nd] = { hoistableStyles: new Map, hoistableScripts: new Map }), t; }
    function et(e) { e[Ol] = !0; }
    var wd = new Set, Sd = {};
    function pa(e, t) { Va(e, t), Va(e + "Capture", t); }
    function Va(e, t) { for (Sd[e] = t, e = 0; e < t.length; e++)
        wd.add(t[e]); }
    var Zg = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), kd = {}, Ad = {};
    function Jg(e) { return Fr.call(Ad, e) ? !0 : Fr.call(kd, e) ? !1 : Zg.test(e) ? Ad[e] = !0 : (kd[e] = !0, !1); }
    function Yn(e, t, s) { if (Jg(t))
        if (s === null)
            e.removeAttribute(t);
        else {
            switch (typeof s) {
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
            e.setAttribute(t, "" + s);
        } }
    function Xn(e, t, s) { if (s === null)
        e.removeAttribute(t);
    else {
        switch (typeof s) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(t);
                return;
        }
        e.setAttribute(t, "" + s);
    } }
    function hs(e, t, s, n) { if (n === null)
        e.removeAttribute(s);
    else {
        switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(s);
                return;
        }
        e.setAttributeNS(t, s, "" + n);
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
    function Cd(e) { var t = e.type; return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio"); }
    function Fg(e, t, s) { var n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t); if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
        var o = n.get, u = n.set;
        return Object.defineProperty(e, t, { configurable: !0, get: function () { return o.call(this); }, set: function (f) { s = "" + f, u.call(this, f); } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function () { return s; }, setValue: function (f) { s = "" + f; }, stopTracking: function () { e._valueTracker = null, delete e[t]; } };
    } }
    function ac(e) { if (!e._valueTracker) {
        var t = Cd(e) ? "checked" : "value";
        e._valueTracker = Fg(e, t, "" + e[t]);
    } }
    function Td(e) { if (!e)
        return !1; var t = e._valueTracker; if (!t)
        return !0; var s = t.getValue(), n = ""; return e && (n = Cd(e) ? e.checked ? "true" : "false" : e.value), e = n, e !== s ? (t.setValue(e), !0) : !1; }
    function Zn(e) { if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u")
        return null; try {
        return e.activeElement || e.body;
    }
    catch {
        return e.body;
    } }
    var $g = /[\n"\\]/g;
    function Ut(e) { return e.replace($g, function (t) { return "\\" + t.charCodeAt(0).toString(16) + " "; }); }
    function lc(e, t, s, n, o, u, f, p) { e.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.type = f : e.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Bt(t)) : e.value !== "" + Bt(t) && (e.value = "" + Bt(t)) : f !== "submit" && f !== "reset" || e.removeAttribute("value"), t != null ? nc(e, f, Bt(t)) : s != null ? nc(e, f, Bt(s)) : n != null && e.removeAttribute("value"), o == null && u != null && (e.defaultChecked = !!u), o != null && (e.checked = o && typeof o != "function" && typeof o != "symbol"), p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" ? e.name = "" + Bt(p) : e.removeAttribute("name"); }
    function Ed(e, t, s, n, o, u, f, p) { if (u != null && typeof u != "function" && typeof u != "symbol" && typeof u != "boolean" && (e.type = u), t != null || s != null) {
        if (!(u !== "submit" && u !== "reset" || t != null)) {
            ac(e);
            return;
        }
        s = s != null ? "" + Bt(s) : "", t = t != null ? "" + Bt(t) : s, p || t === e.value || (e.value = t), e.defaultValue = t;
    } n = n ?? o, n = typeof n != "function" && typeof n != "symbol" && !!n, e.checked = p ? e.checked : !!n, e.defaultChecked = !!n, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (e.name = f), ac(e); }
    function nc(e, t, s) { t === "number" && Zn(e.ownerDocument) === e || e.defaultValue === "" + s || (e.defaultValue = "" + s); }
    function Qa(e, t, s, n) { if (e = e.options, t) {
        t = {};
        for (var o = 0; o < s.length; o++)
            t["$" + s[o]] = !0;
        for (s = 0; s < e.length; s++)
            o = t.hasOwnProperty("$" + e[s].value), e[s].selected !== o && (e[s].selected = o), o && n && (e[s].defaultSelected = !0);
    }
    else {
        for (s = "" + Bt(s), t = null, o = 0; o < e.length; o++) {
            if (e[o].value === s) {
                e[o].selected = !0, n && (e[o].defaultSelected = !0);
                return;
            }
            t !== null || e[o].disabled || (t = e[o]);
        }
        t !== null && (t.selected = !0);
    } }
    function Md(e, t, s) { if (t != null && (t = "" + Bt(t), t !== e.value && (e.value = t), s == null)) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
    } e.defaultValue = s != null ? "" + Bt(s) : ""; }
    function _d(e, t, s, n) { if (t == null) {
        if (n != null) {
            if (s != null)
                throw Error(c(92));
            if (he(n)) {
                if (1 < n.length)
                    throw Error(c(93));
                n = n[0];
            }
            s = n;
        }
        s == null && (s = ""), t = s;
    } s = Bt(t), e.defaultValue = s, n = e.textContent, n === s && n !== "" && n !== null && (e.value = n), ac(e); }
    function Ga(e, t) { if (t) {
        var s = e.firstChild;
        if (s && s === e.lastChild && s.nodeType === 3) {
            s.nodeValue = t;
            return;
        }
    } e.textContent = t; }
    var Wg = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function Od(e, t, s) { var n = t.indexOf("--") === 0; s == null || typeof s == "boolean" || s === "" ? n ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : n ? e.setProperty(t, s) : typeof s != "number" || s === 0 || Wg.has(t) ? t === "float" ? e.cssFloat = s : e[t] = ("" + s).trim() : e[t] = s + "px"; }
    function zd(e, t, s) { if (t != null && typeof t != "object")
        throw Error(c(62)); if (e = e.style, s != null) {
        for (var n in s)
            !s.hasOwnProperty(n) || t != null && t.hasOwnProperty(n) || (n.indexOf("--") === 0 ? e.setProperty(n, "") : n === "float" ? e.cssFloat = "" : e[n] = "");
        for (var o in t)
            n = t[o], t.hasOwnProperty(o) && s[o] !== n && Od(e, o, n);
    }
    else
        for (var u in t)
            t.hasOwnProperty(u) && Od(e, u, t[u]); }
    function ic(e) { if (e.indexOf("-") === -1)
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
    var Ig = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]), Pg = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Jn(e) { return Pg.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e; }
    function ps() { }
    var rc = null;
    function cc(e) { return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e; }
    var Ka = null, Ya = null;
    function Dd(e) { var t = La(e); if (t && (e = t.stateNode)) {
        var s = e[ht] || null;
        e: switch (e = t.stateNode, t.type) {
            case "input":
                if (lc(e, s.value, s.defaultValue, s.defaultValue, s.checked, s.defaultChecked, s.type, s.name), t = s.name, s.type === "radio" && t != null) {
                    for (s = e; s.parentNode;)
                        s = s.parentNode;
                    for (s = s.querySelectorAll('input[name="' + Ut("" + t) + '"][type="radio"]'), t = 0; t < s.length; t++) {
                        var n = s[t];
                        if (n !== e && n.form === e.form) {
                            var o = n[ht] || null;
                            if (!o)
                                throw Error(c(90));
                            lc(n, o.value, o.defaultValue, o.defaultValue, o.checked, o.defaultChecked, o.type, o.name);
                        }
                    }
                    for (t = 0; t < s.length; t++)
                        n = s[t], n.form === e.form && Td(n);
                }
                break e;
            case "textarea":
                Md(e, s.value, s.defaultValue);
                break e;
            case "select": t = s.value, t != null && Qa(e, !!s.multiple, t, !1);
        }
    } }
    var oc = !1;
    function Rd(e, t, s) { if (oc)
        return e(t, s); oc = !0; try {
        var n = e(t);
        return n;
    }
    finally {
        if (oc = !1, (Ka !== null || Ya !== null) && (Ri(), Ka && (t = Ka, e = Ya, Ya = Ka = null, Dd(t), e)))
            for (t = 0; t < e.length; t++)
                Dd(e[t]);
    } }
    function Dl(e, t) { var s = e.stateNode; if (s === null)
        return null; var n = s[ht] || null; if (n === null)
        return null; s = n[t]; e: switch (t) {
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
        return null; if (s && typeof s != "function")
        throw Error(c(231, t, typeof s)); return s; }
    var xs = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), uc = !1;
    if (xs)
        try {
            var Rl = {};
            Object.defineProperty(Rl, "passive", { get: function () { uc = !0; } }), window.addEventListener("test", Rl, Rl), window.removeEventListener("test", Rl, Rl);
        }
        catch {
            uc = !1;
        }
    var Ls = null, dc = null, Fn = null;
    function qd() { if (Fn)
        return Fn; var e, t = dc, s = t.length, n, o = "value" in Ls ? Ls.value : Ls.textContent, u = o.length; for (e = 0; e < s && t[e] === o[e]; e++)
        ; var f = s - e; for (n = 1; n <= f && t[s - n] === o[u - n]; n++)
        ; return Fn = o.slice(e, 1 < n ? 1 - n : void 0); }
    function $n(e) { var t = e.keyCode; return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0; }
    function Wn() { return !0; }
    function Bd() { return !1; }
    function pt(e) { function t(s, n, o, u, f) { this._reactName = s, this._targetInst = o, this.type = n, this.nativeEvent = u, this.target = f, this.currentTarget = null; for (var p in e)
        e.hasOwnProperty(p) && (s = e[p], this[p] = s ? s(u) : u[p]); return this.isDefaultPrevented = (u.defaultPrevented != null ? u.defaultPrevented : u.returnValue === !1) ? Wn : Bd, this.isPropagationStopped = Bd, this; } return b(t.prototype, { preventDefault: function () { this.defaultPrevented = !0; var s = this.nativeEvent; s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Wn); }, stopPropagation: function () { var s = this.nativeEvent; s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Wn); }, persist: function () { }, isPersistent: Wn }), t; }
    var xa = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function (e) { return e.timeStamp || Date.now(); }, defaultPrevented: 0, isTrusted: 0 }, In = pt(xa), ql = b({}, xa, { view: 0, detail: 0 }), e0 = pt(ql), fc, mc, Bl, Pn = b({}, ql, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: pc, button: 0, buttons: 0, relatedTarget: function (e) { return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget; }, movementX: function (e) { return "movementX" in e ? e.movementX : (e !== Bl && (Bl && e.type === "mousemove" ? (fc = e.screenX - Bl.screenX, mc = e.screenY - Bl.screenY) : mc = fc = 0, Bl = e), fc); }, movementY: function (e) { return "movementY" in e ? e.movementY : mc; } }), Ud = pt(Pn), t0 = b({}, Pn, { dataTransfer: 0 }), s0 = pt(t0), a0 = b({}, ql, { relatedTarget: 0 }), hc = pt(a0), l0 = b({}, xa, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), n0 = pt(l0), i0 = b({}, xa, { clipboardData: function (e) { return "clipboardData" in e ? e.clipboardData : window.clipboardData; } }), r0 = pt(i0), c0 = b({}, xa, { data: 0 }), Ld = pt(c0), o0 = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, u0 = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, d0 = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function f0(e) { var t = this.nativeEvent; return t.getModifierState ? t.getModifierState(e) : (e = d0[e]) ? !!t[e] : !1; }
    function pc() { return f0; }
    var m0 = b({}, ql, { key: function (e) { if (e.key) {
            var t = o0[e.key] || e.key;
            if (t !== "Unidentified")
                return t;
        } return e.type === "keypress" ? (e = $n(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? u0[e.keyCode] || "Unidentified" : ""; }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: pc, charCode: function (e) { return e.type === "keypress" ? $n(e) : 0; }, keyCode: function (e) { return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0; }, which: function (e) { return e.type === "keypress" ? $n(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0; } }), h0 = pt(m0), p0 = b({}, Pn, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Hd = pt(p0), x0 = b({}, ql, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: pc }), g0 = pt(x0), y0 = b({}, xa, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), b0 = pt(y0), v0 = b({}, Pn, { deltaX: function (e) { return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0; }, deltaY: function (e) { return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0; }, deltaZ: 0, deltaMode: 0 }), j0 = pt(v0), N0 = b({}, xa, { newState: 0, oldState: 0 }), w0 = pt(N0), S0 = [9, 13, 27, 32], xc = xs && "CompositionEvent" in window, Ul = null;
    xs && "documentMode" in document && (Ul = document.documentMode);
    var k0 = xs && "TextEvent" in window && !Ul, Vd = xs && (!xc || Ul && 8 < Ul && 11 >= Ul), Qd = " ", Gd = !1;
    function Kd(e, t) { switch (e) {
        case "keyup": return S0.indexOf(t.keyCode) !== -1;
        case "keydown": return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout": return !0;
        default: return !1;
    } }
    function Yd(e) { return e = e.detail, typeof e == "object" && "data" in e ? e.data : null; }
    var Xa = !1;
    function A0(e, t) { switch (e) {
        case "compositionend": return Yd(t);
        case "keypress": return t.which !== 32 ? null : (Gd = !0, Qd);
        case "textInput": return e = t.data, e === Qd && Gd ? null : e;
        default: return null;
    } }
    function C0(e, t) { if (Xa)
        return e === "compositionend" || !xc && Kd(e, t) ? (e = qd(), Fn = dc = Ls = null, Xa = !1, e) : null; switch (e) {
        case "paste": return null;
        case "keypress":
            if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                if (t.char && 1 < t.char.length)
                    return t.char;
                if (t.which)
                    return String.fromCharCode(t.which);
            }
            return null;
        case "compositionend": return Vd && t.locale !== "ko" ? null : t.data;
        default: return null;
    } }
    var T0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
    function Xd(e) { var t = e && e.nodeName && e.nodeName.toLowerCase(); return t === "input" ? !!T0[e.type] : t === "textarea"; }
    function Zd(e, t, s, n) { Ka ? Ya ? Ya.push(n) : Ya = [n] : Ka = n, t = Qi(t, "onChange"), 0 < t.length && (s = new In("onChange", "change", null, s, n), e.push({ event: s, listeners: t })); }
    var Ll = null, Hl = null;
    function E0(e) { Mh(e, 0); }
    function ei(e) { var t = zl(e); if (Td(t))
        return e; }
    function Jd(e, t) { if (e === "change")
        return t; }
    var Fd = !1;
    if (xs) {
        var gc;
        if (xs) {
            var yc = "oninput" in document;
            if (!yc) {
                var $d = document.createElement("div");
                $d.setAttribute("oninput", "return;"), yc = typeof $d.oninput == "function";
            }
            gc = yc;
        }
        else
            gc = !1;
        Fd = gc && (!document.documentMode || 9 < document.documentMode);
    }
    function Wd() { Ll && (Ll.detachEvent("onpropertychange", Id), Hl = Ll = null); }
    function Id(e) { if (e.propertyName === "value" && ei(Hl)) {
        var t = [];
        Zd(t, Hl, e, cc(e)), Rd(E0, t);
    } }
    function M0(e, t, s) { e === "focusin" ? (Wd(), Ll = t, Hl = s, Ll.attachEvent("onpropertychange", Id)) : e === "focusout" && Wd(); }
    function _0(e) { if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return ei(Hl); }
    function O0(e, t) { if (e === "click")
        return ei(t); }
    function z0(e, t) { if (e === "input" || e === "change")
        return ei(t); }
    function D0(e, t) { return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t; }
    var Ct = typeof Object.is == "function" ? Object.is : D0;
    function Vl(e, t) { if (Ct(e, t))
        return !0; if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1; var s = Object.keys(e), n = Object.keys(t); if (s.length !== n.length)
        return !1; for (n = 0; n < s.length; n++) {
        var o = s[n];
        if (!Fr.call(t, o) || !Ct(e[o], t[o]))
            return !1;
    } return !0; }
    function Pd(e) { for (; e && e.firstChild;)
        e = e.firstChild; return e; }
    function ef(e, t) { var s = Pd(e); e = 0; for (var n; s;) {
        if (s.nodeType === 3) {
            if (n = e + s.textContent.length, e <= t && n >= t)
                return { node: s, offset: t - e };
            e = n;
        }
        e: {
            for (; s;) {
                if (s.nextSibling) {
                    s = s.nextSibling;
                    break e;
                }
                s = s.parentNode;
            }
            s = void 0;
        }
        s = Pd(s);
    } }
    function tf(e, t) { return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? tf(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1; }
    function sf(e) { e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window; for (var t = Zn(e.document); t instanceof e.HTMLIFrameElement;) {
        try {
            var s = typeof t.contentWindow.location.href == "string";
        }
        catch {
            s = !1;
        }
        if (s)
            e = t.contentWindow;
        else
            break;
        t = Zn(e.document);
    } return t; }
    function bc(e) { var t = e && e.nodeName && e.nodeName.toLowerCase(); return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true"); }
    var R0 = xs && "documentMode" in document && 11 >= document.documentMode, Za = null, vc = null, Ql = null, jc = !1;
    function af(e, t, s) { var n = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument; jc || Za == null || Za !== Zn(n) || (n = Za, "selectionStart" in n && bc(n) ? n = { start: n.selectionStart, end: n.selectionEnd } : (n = (n.ownerDocument && n.ownerDocument.defaultView || window).getSelection(), n = { anchorNode: n.anchorNode, anchorOffset: n.anchorOffset, focusNode: n.focusNode, focusOffset: n.focusOffset }), Ql && Vl(Ql, n) || (Ql = n, n = Qi(vc, "onSelect"), 0 < n.length && (t = new In("onSelect", "select", null, t, s), e.push({ event: t, listeners: n }), t.target = Za))); }
    function ga(e, t) { var s = {}; return s[e.toLowerCase()] = t.toLowerCase(), s["Webkit" + e] = "webkit" + t, s["Moz" + e] = "moz" + t, s; }
    var Ja = { animationend: ga("Animation", "AnimationEnd"), animationiteration: ga("Animation", "AnimationIteration"), animationstart: ga("Animation", "AnimationStart"), transitionrun: ga("Transition", "TransitionRun"), transitionstart: ga("Transition", "TransitionStart"), transitioncancel: ga("Transition", "TransitionCancel"), transitionend: ga("Transition", "TransitionEnd") }, Nc = {}, lf = {};
    xs && (lf = document.createElement("div").style, "AnimationEvent" in window || (delete Ja.animationend.animation, delete Ja.animationiteration.animation, delete Ja.animationstart.animation), "TransitionEvent" in window || delete Ja.transitionend.transition);
    function ya(e) { if (Nc[e])
        return Nc[e]; if (!Ja[e])
        return e; var t = Ja[e], s; for (s in t)
        if (t.hasOwnProperty(s) && s in lf)
            return Nc[e] = t[s]; return e; }
    var nf = ya("animationend"), rf = ya("animationiteration"), cf = ya("animationstart"), q0 = ya("transitionrun"), B0 = ya("transitionstart"), U0 = ya("transitioncancel"), of = ya("transitionend"), uf = new Map, wc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    wc.push("scrollEnd");
    function Wt(e, t) { uf.set(e, t), pa(t, [e]); }
    var ti = typeof reportError == "function" ? reportError : function (e) { if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var t = new window.ErrorEvent("error", { bubbles: !0, cancelable: !0, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
        if (!window.dispatchEvent(t))
            return;
    }
    else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", e);
        return;
    } console.error(e); }, Lt = [], Fa = 0, Sc = 0;
    function si() { for (var e = Fa, t = Sc = Fa = 0; t < e;) {
        var s = Lt[t];
        Lt[t++] = null;
        var n = Lt[t];
        Lt[t++] = null;
        var o = Lt[t];
        Lt[t++] = null;
        var u = Lt[t];
        if (Lt[t++] = null, n !== null && o !== null) {
            var f = n.pending;
            f === null ? o.next = o : (o.next = f.next, f.next = o), n.pending = o;
        }
        u !== 0 && df(s, o, u);
    } }
    function ai(e, t, s, n) { Lt[Fa++] = e, Lt[Fa++] = t, Lt[Fa++] = s, Lt[Fa++] = n, Sc |= n, e.lanes |= n, e = e.alternate, e !== null && (e.lanes |= n); }
    function kc(e, t, s, n) { return ai(e, t, s, n), li(e); }
    function ba(e, t) { return ai(e, null, null, t), li(e); }
    function df(e, t, s) { e.lanes |= s; var n = e.alternate; n !== null && (n.lanes |= s); for (var o = !1, u = e.return; u !== null;)
        u.childLanes |= s, n = u.alternate, n !== null && (n.childLanes |= s), u.tag === 22 && (e = u.stateNode, e === null || e._visibility & 1 || (o = !0)), e = u, u = u.return; return e.tag === 3 ? (u = e.stateNode, o && t !== null && (o = 31 - At(s), e = u.hiddenUpdates, n = e[o], n === null ? e[o] = [t] : n.push(t), t.lane = s | 536870912), u) : null; }
    function li(e) { if (50 < dn)
        throw dn = 0, Ro = null, Error(c(185)); for (var t = e.return; t !== null;)
        e = t, t = e.return; return e.tag === 3 ? e.stateNode : null; }
    var $a = {};
    function L0(e, t, s, n) { this.tag = e, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = n, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null; }
    function Tt(e, t, s, n) { return new L0(e, t, s, n); }
    function Ac(e) { return e = e.prototype, !(!e || !e.isReactComponent); }
    function gs(e, t) { var s = e.alternate; return s === null ? (s = Tt(e.tag, t, e.key, e.mode), s.elementType = e.elementType, s.type = e.type, s.stateNode = e.stateNode, s.alternate = e, e.alternate = s) : (s.pendingProps = t, s.type = e.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = e.flags & 65011712, s.childLanes = e.childLanes, s.lanes = e.lanes, s.child = e.child, s.memoizedProps = e.memoizedProps, s.memoizedState = e.memoizedState, s.updateQueue = e.updateQueue, t = e.dependencies, s.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, s.sibling = e.sibling, s.index = e.index, s.ref = e.ref, s.refCleanup = e.refCleanup, s; }
    function ff(e, t) { e.flags &= 65011714; var s = e.alternate; return s === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = s.childLanes, e.lanes = s.lanes, e.child = s.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = s.memoizedProps, e.memoizedState = s.memoizedState, e.updateQueue = s.updateQueue, e.type = s.type, t = s.dependencies, e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), e; }
    function ni(e, t, s, n, o, u) { var f = 0; if (n = e, typeof e == "function")
        Ac(e) && (f = 1);
    else if (typeof e == "string")
        f = Ky(e, s, de.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
        e: switch (e) {
            case ue: return e = Tt(31, s, t, o), e.elementType = ue, e.lanes = u, e;
            case C: return va(s.children, o, u, t);
            case _:
                f = 8, o |= 24;
                break;
            case Q: return e = Tt(12, s, t, o | 2), e.elementType = Q, e.lanes = u, e;
            case $: return e = Tt(13, s, t, o), e.elementType = $, e.lanes = u, e;
            case Y: return e = Tt(19, s, t, o), e.elementType = Y, e.lanes = u, e;
            default:
                if (typeof e == "object" && e !== null)
                    switch (e.$$typeof) {
                        case H:
                            f = 10;
                            break e;
                        case X:
                            f = 9;
                            break e;
                        case J:
                            f = 11;
                            break e;
                        case R:
                            f = 14;
                            break e;
                        case G:
                            f = 16, n = null;
                            break e;
                    }
                f = 29, s = Error(c(130, e === null ? "null" : typeof e, "")), n = null;
        } return t = Tt(f, s, t, o), t.elementType = e, t.type = n, t.lanes = u, t; }
    function va(e, t, s, n) { return e = Tt(7, e, n, t), e.lanes = s, e; }
    function Cc(e, t, s) { return e = Tt(6, e, null, t), e.lanes = s, e; }
    function mf(e) { var t = Tt(18, null, null, 0); return t.stateNode = e, t; }
    function Tc(e, t, s) { return t = Tt(4, e.children !== null ? e.children : [], e.key, t), t.lanes = s, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t; }
    var hf = new WeakMap;
    function Ht(e, t) { if (typeof e == "object" && e !== null) {
        var s = hf.get(e);
        return s !== void 0 ? s : (t = { value: e, source: t, stack: fd(t) }, hf.set(e, t), t);
    } return { value: e, source: t, stack: fd(t) }; }
    var Wa = [], Ia = 0, ii = null, Gl = 0, Vt = [], Qt = 0, Hs = null, ns = 1, is = "";
    function ys(e, t) { Wa[Ia++] = Gl, Wa[Ia++] = ii, ii = e, Gl = t; }
    function pf(e, t, s) { Vt[Qt++] = ns, Vt[Qt++] = is, Vt[Qt++] = Hs, Hs = e; var n = ns; e = is; var o = 32 - At(n) - 1; n &= ~(1 << o), s += 1; var u = 32 - At(t) + o; if (30 < u) {
        var f = o - o % 5;
        u = (n & (1 << f) - 1).toString(32), n >>= f, o -= f, ns = 1 << 32 - At(t) + o | s << o | n, is = u + e;
    }
    else
        ns = 1 << u | s << o | n, is = e; }
    function Ec(e) { e.return !== null && (ys(e, 1), pf(e, 1, 0)); }
    function Mc(e) { for (; e === ii;)
        ii = Wa[--Ia], Wa[Ia] = null, Gl = Wa[--Ia], Wa[Ia] = null; for (; e === Hs;)
        Hs = Vt[--Qt], Vt[Qt] = null, is = Vt[--Qt], Vt[Qt] = null, ns = Vt[--Qt], Vt[Qt] = null; }
    function xf(e, t) { Vt[Qt++] = ns, Vt[Qt++] = is, Vt[Qt++] = Hs, ns = t.id, is = t.overflow, Hs = e; }
    var rt = null, Oe = null, be = !1, Vs = null, Gt = !1, _c = Error(c(519));
    function Qs(e) { var t = Error(c(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")); throw Kl(Ht(t, e)), _c; }
    function gf(e) { var t = e.stateNode, s = e.type, n = e.memoizedProps; switch (t[it] = e, t[ht] = n, s) {
        case "dialog":
            me("cancel", t), me("close", t);
            break;
        case "iframe":
        case "object":
        case "embed":
            me("load", t);
            break;
        case "video":
        case "audio":
            for (s = 0; s < mn.length; s++)
                me(mn[s], t);
            break;
        case "source":
            me("error", t);
            break;
        case "img":
        case "image":
        case "link":
            me("error", t), me("load", t);
            break;
        case "details":
            me("toggle", t);
            break;
        case "input":
            me("invalid", t), Ed(t, n.value, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name, !0);
            break;
        case "select":
            me("invalid", t);
            break;
        case "textarea": me("invalid", t), _d(t, n.value, n.defaultValue, n.children);
    } s = n.children, typeof s != "string" && typeof s != "number" && typeof s != "bigint" || t.textContent === "" + s || n.suppressHydrationWarning === !0 || Dh(t.textContent, s) ? (n.popover != null && (me("beforetoggle", t), me("toggle", t)), n.onScroll != null && me("scroll", t), n.onScrollEnd != null && me("scrollend", t), n.onClick != null && (t.onclick = ps), t = !0) : t = !1, t || Qs(e, !0); }
    function yf(e) { for (rt = e.return; rt;)
        switch (rt.tag) {
            case 5:
            case 31:
            case 13:
                Gt = !1;
                return;
            case 27:
            case 3:
                Gt = !0;
                return;
            default: rt = rt.return;
        } }
    function Pa(e) { if (e !== rt)
        return !1; if (!be)
        return yf(e), be = !0, !1; var t = e.tag, s; if ((s = t !== 3 && t !== 27) && ((s = t === 5) && (s = e.type, s = !(s !== "form" && s !== "button") || $o(e.type, e.memoizedProps)), s = !s), s && Oe && Qs(e), yf(e), t === 13) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
            throw Error(c(317));
        Oe = Gh(e);
    }
    else if (t === 31) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
            throw Error(c(317));
        Oe = Gh(e);
    }
    else
        t === 27 ? (t = Oe, sa(e.type) ? (e = tu, tu = null, Oe = e) : Oe = t) : Oe = rt ? Yt(e.stateNode.nextSibling) : null; return !0; }
    function ja() { Oe = rt = null, be = !1; }
    function Oc() { var e = Vs; return e !== null && (bt === null ? bt = e : bt.push.apply(bt, e), Vs = null), e; }
    function Kl(e) { Vs === null ? Vs = [e] : Vs.push(e); }
    var zc = ye(null), Na = null, bs = null;
    function Gs(e, t, s) { le(zc, t._currentValue), t._currentValue = s; }
    function vs(e) { e._currentValue = zc.current, pe(zc); }
    function Dc(e, t, s) { for (; e !== null;) {
        var n = e.alternate;
        if ((e.childLanes & t) !== t ? (e.childLanes |= t, n !== null && (n.childLanes |= t)) : n !== null && (n.childLanes & t) !== t && (n.childLanes |= t), e === s)
            break;
        e = e.return;
    } }
    function Rc(e, t, s, n) { var o = e.child; for (o !== null && (o.return = e); o !== null;) {
        var u = o.dependencies;
        if (u !== null) {
            var f = o.child;
            u = u.firstContext;
            e: for (; u !== null;) {
                var p = u;
                u = o;
                for (var j = 0; j < t.length; j++)
                    if (p.context === t[j]) {
                        u.lanes |= s, p = u.alternate, p !== null && (p.lanes |= s), Dc(u.return, s, e), n || (f = null);
                        break e;
                    }
                u = p.next;
            }
        }
        else if (o.tag === 18) {
            if (f = o.return, f === null)
                throw Error(c(341));
            f.lanes |= s, u = f.alternate, u !== null && (u.lanes |= s), Dc(f, s, e), f = null;
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
    function el(e, t, s, n) { e = null; for (var o = t, u = !1; o !== null;) {
        if (!u) {
            if ((o.flags & 524288) !== 0)
                u = !0;
            else if ((o.flags & 262144) !== 0)
                break;
        }
        if (o.tag === 10) {
            var f = o.alternate;
            if (f === null)
                throw Error(c(387));
            if (f = f.memoizedProps, f !== null) {
                var p = o.type;
                Ct(o.pendingProps.value, f.value) || (e !== null ? e.push(p) : e = [p]);
            }
        }
        else if (o === Re.current) {
            if (f = o.alternate, f === null)
                throw Error(c(387));
            f.memoizedState.memoizedState !== o.memoizedState.memoizedState && (e !== null ? e.push(yn) : e = [yn]);
        }
        o = o.return;
    } e !== null && Rc(t, e, s, n), t.flags |= 262144; }
    function ri(e) { for (e = e.firstContext; e !== null;) {
        if (!Ct(e.context._currentValue, e.memoizedValue))
            return !0;
        e = e.next;
    } return !1; }
    function wa(e) { Na = e, bs = null, e = e.dependencies, e !== null && (e.firstContext = null); }
    function ct(e) { return bf(Na, e); }
    function ci(e, t) { return Na === null && wa(e), bf(e, t); }
    function bf(e, t) { var s = t._currentValue; if (t = { context: t, memoizedValue: s, next: null }, bs === null) {
        if (e === null)
            throw Error(c(308));
        bs = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    }
    else
        bs = bs.next = t; return s; }
    var H0 = typeof AbortController < "u" ? AbortController : function () { var e = [], t = this.signal = { aborted: !1, addEventListener: function (s, n) { e.push(n); } }; this.abort = function () { t.aborted = !0, e.forEach(function (s) { return s(); }); }; }, V0 = l.unstable_scheduleCallback, Q0 = l.unstable_NormalPriority, Qe = { $$typeof: H, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
    function qc() { return { controller: new H0, data: new Map, refCount: 0 }; }
    function Yl(e) { e.refCount--, e.refCount === 0 && V0(Q0, function () { e.controller.abort(); }); }
    var Xl = null, Bc = 0, tl = 0, sl = null;
    function G0(e, t) { if (Xl === null) {
        var s = Xl = [];
        Bc = 0, tl = Vo(), sl = { status: "pending", value: void 0, then: function (n) { s.push(n); } };
    } return Bc++, t.then(vf, vf), t; }
    function vf() { if (--Bc === 0 && Xl !== null) {
        sl !== null && (sl.status = "fulfilled");
        var e = Xl;
        Xl = null, tl = 0, sl = null;
        for (var t = 0; t < e.length; t++)
            (0, e[t])();
    } }
    function K0(e, t) { var s = [], n = { status: "pending", value: null, reason: null, then: function (o) { s.push(o); } }; return e.then(function () { n.status = "fulfilled", n.value = t; for (var o = 0; o < s.length; o++)
        (0, s[o])(t); }, function (o) { for (n.status = "rejected", n.reason = o, o = 0; o < s.length; o++)
        (0, s[o])(void 0); }), n; }
    var jf = z.S;
    z.S = function (e, t) { lh = St(), typeof t == "object" && t !== null && typeof t.then == "function" && G0(e, t), jf !== null && jf(e, t); };
    var Sa = ye(null);
    function Uc() { var e = Sa.current; return e !== null ? e : _e.pooledCache; }
    function oi(e, t) { t === null ? le(Sa, Sa.current) : le(Sa, t.pool); }
    function Nf() { var e = Uc(); return e === null ? null : { parent: Qe._currentValue, pool: e }; }
    var al = Error(c(460)), Lc = Error(c(474)), ui = Error(c(542)), di = { then: function () { } };
    function wf(e) { return e = e.status, e === "fulfilled" || e === "rejected"; }
    function Sf(e, t, s) { switch (s = e[s], s === void 0 ? e.push(t) : s !== t && (t.then(ps, ps), t = s), t.status) {
        case "fulfilled": return t.value;
        case "rejected": throw e = t.reason, Af(e), e;
        default:
            if (typeof t.status == "string")
                t.then(ps, ps);
            else {
                if (e = _e, e !== null && 100 < e.shellSuspendCounter)
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
                case "rejected": throw e = t.reason, Af(e), e;
            }
            throw Aa = t, al;
    } }
    function ka(e) { try {
        var t = e._init;
        return t(e._payload);
    }
    catch (s) {
        throw s !== null && typeof s == "object" && typeof s.then == "function" ? (Aa = s, al) : s;
    } }
    var Aa = null;
    function kf() { if (Aa === null)
        throw Error(c(459)); var e = Aa; return Aa = null, e; }
    function Af(e) { if (e === al || e === ui)
        throw Error(c(483)); }
    var ll = null, Zl = 0;
    function fi(e) { var t = Zl; return Zl += 1, ll === null && (ll = []), Sf(ll, e, t); }
    function Jl(e, t) { t = t.props.ref, e.ref = t !== void 0 ? t : null; }
    function mi(e, t) { throw t.$$typeof === A ? Error(c(525)) : (e = Object.prototype.toString.call(t), Error(c(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e))); }
    function Cf(e) { function t(k, w) { if (e) {
        var T = k.deletions;
        T === null ? (k.deletions = [w], k.flags |= 16) : T.push(w);
    } } function s(k, w) { if (!e)
        return null; for (; w !== null;)
        t(k, w), w = w.sibling; return null; } function n(k) { for (var w = new Map; k !== null;)
        k.key !== null ? w.set(k.key, k) : w.set(k.index, k), k = k.sibling; return w; } function o(k, w) { return k = gs(k, w), k.index = 0, k.sibling = null, k; } function u(k, w, T) { return k.index = T, e ? (T = k.alternate, T !== null ? (T = T.index, T < w ? (k.flags |= 67108866, w) : T) : (k.flags |= 67108866, w)) : (k.flags |= 1048576, w); } function f(k) { return e && k.alternate === null && (k.flags |= 67108866), k; } function p(k, w, T, B) { return w === null || w.tag !== 6 ? (w = Cc(T, k.mode, B), w.return = k, w) : (w = o(w, T), w.return = k, w); } function j(k, w, T, B) { var te = T.type; return te === C ? q(k, w, T.props.children, B, T.key) : w !== null && (w.elementType === te || typeof te == "object" && te !== null && te.$$typeof === G && ka(te) === w.type) ? (w = o(w, T.props), Jl(w, T), w.return = k, w) : (w = ni(T.type, T.key, T.props, null, k.mode, B), Jl(w, T), w.return = k, w); } function E(k, w, T, B) { return w === null || w.tag !== 4 || w.stateNode.containerInfo !== T.containerInfo || w.stateNode.implementation !== T.implementation ? (w = Tc(T, k.mode, B), w.return = k, w) : (w = o(w, T.children || []), w.return = k, w); } function q(k, w, T, B, te) { return w === null || w.tag !== 7 ? (w = va(T, k.mode, B, te), w.return = k, w) : (w = o(w, T), w.return = k, w); } function L(k, w, T) { if (typeof w == "string" && w !== "" || typeof w == "number" || typeof w == "bigint")
        return w = Cc("" + w, k.mode, T), w.return = k, w; if (typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
            case S: return T = ni(w.type, w.key, w.props, null, k.mode, T), Jl(T, w), T.return = k, T;
            case N: return w = Tc(w, k.mode, T), w.return = k, w;
            case G: return w = ka(w), L(k, w, T);
        }
        if (he(w) || ke(w))
            return w = va(w, k.mode, T, null), w.return = k, w;
        if (typeof w.then == "function")
            return L(k, fi(w), T);
        if (w.$$typeof === H)
            return L(k, ci(k, w), T);
        mi(k, w);
    } return null; } function M(k, w, T, B) { var te = w !== null ? w.key : null; if (typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint")
        return te !== null ? null : p(k, w, "" + T, B); if (typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
            case S: return T.key === te ? j(k, w, T, B) : null;
            case N: return T.key === te ? E(k, w, T, B) : null;
            case G: return T = ka(T), M(k, w, T, B);
        }
        if (he(T) || ke(T))
            return te !== null ? null : q(k, w, T, B, null);
        if (typeof T.then == "function")
            return M(k, w, fi(T), B);
        if (T.$$typeof === H)
            return M(k, w, ci(k, T), B);
        mi(k, T);
    } return null; } function D(k, w, T, B, te) { if (typeof B == "string" && B !== "" || typeof B == "number" || typeof B == "bigint")
        return k = k.get(T) || null, p(w, k, "" + B, te); if (typeof B == "object" && B !== null) {
        switch (B.$$typeof) {
            case S: return k = k.get(B.key === null ? T : B.key) || null, j(w, k, B, te);
            case N: return k = k.get(B.key === null ? T : B.key) || null, E(w, k, B, te);
            case G: return B = ka(B), D(k, w, T, B, te);
        }
        if (he(B) || ke(B))
            return k = k.get(T) || null, q(w, k, B, te, null);
        if (typeof B.then == "function")
            return D(k, w, T, fi(B), te);
        if (B.$$typeof === H)
            return D(k, w, T, ci(w, B), te);
        mi(w, B);
    } return null; } function W(k, w, T, B) { for (var te = null, Ne = null, ee = w, re = w = 0, ge = null; ee !== null && re < T.length; re++) {
        ee.index > re ? (ge = ee, ee = null) : ge = ee.sibling;
        var we = M(k, ee, T[re], B);
        if (we === null) {
            ee === null && (ee = ge);
            break;
        }
        e && ee && we.alternate === null && t(k, ee), w = u(we, w, re), Ne === null ? te = we : Ne.sibling = we, Ne = we, ee = ge;
    } if (re === T.length)
        return s(k, ee), be && ys(k, re), te; if (ee === null) {
        for (; re < T.length; re++)
            ee = L(k, T[re], B), ee !== null && (w = u(ee, w, re), Ne === null ? te = ee : Ne.sibling = ee, Ne = ee);
        return be && ys(k, re), te;
    } for (ee = n(ee); re < T.length; re++)
        ge = D(ee, k, re, T[re], B), ge !== null && (e && ge.alternate !== null && ee.delete(ge.key === null ? re : ge.key), w = u(ge, w, re), Ne === null ? te = ge : Ne.sibling = ge, Ne = ge); return e && ee.forEach(function (ra) { return t(k, ra); }), be && ys(k, re), te; } function se(k, w, T, B) { if (T == null)
        throw Error(c(151)); for (var te = null, Ne = null, ee = w, re = w = 0, ge = null, we = T.next(); ee !== null && !we.done; re++, we = T.next()) {
        ee.index > re ? (ge = ee, ee = null) : ge = ee.sibling;
        var ra = M(k, ee, we.value, B);
        if (ra === null) {
            ee === null && (ee = ge);
            break;
        }
        e && ee && ra.alternate === null && t(k, ee), w = u(ra, w, re), Ne === null ? te = ra : Ne.sibling = ra, Ne = ra, ee = ge;
    } if (we.done)
        return s(k, ee), be && ys(k, re), te; if (ee === null) {
        for (; !we.done; re++, we = T.next())
            we = L(k, we.value, B), we !== null && (w = u(we, w, re), Ne === null ? te = we : Ne.sibling = we, Ne = we);
        return be && ys(k, re), te;
    } for (ee = n(ee); !we.done; re++, we = T.next())
        we = D(ee, k, re, we.value, B), we !== null && (e && we.alternate !== null && ee.delete(we.key === null ? re : we.key), w = u(we, w, re), Ne === null ? te = we : Ne.sibling = we, Ne = we); return e && ee.forEach(function (tb) { return t(k, tb); }), be && ys(k, re), te; } function Me(k, w, T, B) { if (typeof T == "object" && T !== null && T.type === C && T.key === null && (T = T.props.children), typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
            case S:
                e: {
                    for (var te = T.key; w !== null;) {
                        if (w.key === te) {
                            if (te = T.type, te === C) {
                                if (w.tag === 7) {
                                    s(k, w.sibling), B = o(w, T.props.children), B.return = k, k = B;
                                    break e;
                                }
                            }
                            else if (w.elementType === te || typeof te == "object" && te !== null && te.$$typeof === G && ka(te) === w.type) {
                                s(k, w.sibling), B = o(w, T.props), Jl(B, T), B.return = k, k = B;
                                break e;
                            }
                            s(k, w);
                            break;
                        }
                        else
                            t(k, w);
                        w = w.sibling;
                    }
                    T.type === C ? (B = va(T.props.children, k.mode, B, T.key), B.return = k, k = B) : (B = ni(T.type, T.key, T.props, null, k.mode, B), Jl(B, T), B.return = k, k = B);
                }
                return f(k);
            case N:
                e: {
                    for (te = T.key; w !== null;) {
                        if (w.key === te)
                            if (w.tag === 4 && w.stateNode.containerInfo === T.containerInfo && w.stateNode.implementation === T.implementation) {
                                s(k, w.sibling), B = o(w, T.children || []), B.return = k, k = B;
                                break e;
                            }
                            else {
                                s(k, w);
                                break;
                            }
                        else
                            t(k, w);
                        w = w.sibling;
                    }
                    B = Tc(T, k.mode, B), B.return = k, k = B;
                }
                return f(k);
            case G: return T = ka(T), Me(k, w, T, B);
        }
        if (he(T))
            return W(k, w, T, B);
        if (ke(T)) {
            if (te = ke(T), typeof te != "function")
                throw Error(c(150));
            return T = te.call(T), se(k, w, T, B);
        }
        if (typeof T.then == "function")
            return Me(k, w, fi(T), B);
        if (T.$$typeof === H)
            return Me(k, w, ci(k, T), B);
        mi(k, T);
    } return typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint" ? (T = "" + T, w !== null && w.tag === 6 ? (s(k, w.sibling), B = o(w, T), B.return = k, k = B) : (s(k, w), B = Cc(T, k.mode, B), B.return = k, k = B), f(k)) : s(k, w); } return function (k, w, T, B) { try {
        Zl = 0;
        var te = Me(k, w, T, B);
        return ll = null, te;
    }
    catch (ee) {
        if (ee === al || ee === ui)
            throw ee;
        var Ne = Tt(29, ee, null, k.mode);
        return Ne.lanes = B, Ne.return = k, Ne;
    }
    finally { } }; }
    var Ca = Cf(!0), Tf = Cf(!1), Ks = !1;
    function Hc(e) { e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, lanes: 0, hiddenCallbacks: null }, callbacks: null }; }
    function Vc(e, t) { e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, callbacks: null }); }
    function Ys(e) { return { lane: e, tag: 0, payload: null, callback: null, next: null }; }
    function Xs(e, t, s) { var n = e.updateQueue; if (n === null)
        return null; if (n = n.shared, (Se & 2) !== 0) {
        var o = n.pending;
        return o === null ? t.next = t : (t.next = o.next, o.next = t), n.pending = t, t = li(e), df(e, null, s), t;
    } return ai(e, n, t, s), li(e); }
    function Fl(e, t, s) { if (t = t.updateQueue, t !== null && (t = t.shared, (s & 4194048) !== 0)) {
        var n = t.lanes;
        n &= e.pendingLanes, s |= n, t.lanes = s, yd(e, s);
    } }
    function Qc(e, t) { var s = e.updateQueue, n = e.alternate; if (n !== null && (n = n.updateQueue, s === n)) {
        var o = null, u = null;
        if (s = s.firstBaseUpdate, s !== null) {
            do {
                var f = { lane: s.lane, tag: s.tag, payload: s.payload, callback: null, next: null };
                u === null ? o = u = f : u = u.next = f, s = s.next;
            } while (s !== null);
            u === null ? o = u = t : u = u.next = t;
        }
        else
            o = u = t;
        s = { baseState: n.baseState, firstBaseUpdate: o, lastBaseUpdate: u, shared: n.shared, callbacks: n.callbacks }, e.updateQueue = s;
        return;
    } e = s.lastBaseUpdate, e === null ? s.firstBaseUpdate = t : e.next = t, s.lastBaseUpdate = t; }
    var Gc = !1;
    function $l() { if (Gc) {
        var e = sl;
        if (e !== null)
            throw e;
    } }
    function Wl(e, t, s, n) { Gc = !1; var o = e.updateQueue; Ks = !1; var u = o.firstBaseUpdate, f = o.lastBaseUpdate, p = o.shared.pending; if (p !== null) {
        o.shared.pending = null;
        var j = p, E = j.next;
        j.next = null, f === null ? u = E : f.next = E, f = j;
        var q = e.alternate;
        q !== null && (q = q.updateQueue, p = q.lastBaseUpdate, p !== f && (p === null ? q.firstBaseUpdate = E : p.next = E, q.lastBaseUpdate = j));
    } if (u !== null) {
        var L = o.baseState;
        f = 0, q = E = j = null, p = u;
        do {
            var M = p.lane & -536870913, D = M !== p.lane;
            if (D ? (xe & M) === M : (n & M) === M) {
                M !== 0 && M === tl && (Gc = !0), q !== null && (q = q.next = { lane: 0, tag: p.tag, payload: p.payload, callback: null, next: null });
                e: {
                    var W = e, se = p;
                    M = t;
                    var Me = s;
                    switch (se.tag) {
                        case 1:
                            if (W = se.payload, typeof W == "function") {
                                L = W.call(Me, L, M);
                                break e;
                            }
                            L = W;
                            break e;
                        case 3: W.flags = W.flags & -65537 | 128;
                        case 0:
                            if (W = se.payload, M = typeof W == "function" ? W.call(Me, L, M) : W, M == null)
                                break e;
                            L = b({}, L, M);
                            break e;
                        case 2: Ks = !0;
                    }
                }
                M = p.callback, M !== null && (e.flags |= 64, D && (e.flags |= 8192), D = o.callbacks, D === null ? o.callbacks = [M] : D.push(M));
            }
            else
                D = { lane: M, tag: p.tag, payload: p.payload, callback: p.callback, next: null }, q === null ? (E = q = D, j = L) : q = q.next = D, f |= M;
            if (p = p.next, p === null) {
                if (p = o.shared.pending, p === null)
                    break;
                D = p, p = D.next, D.next = null, o.lastBaseUpdate = D, o.shared.pending = null;
            }
        } while (!0);
        q === null && (j = L), o.baseState = j, o.firstBaseUpdate = E, o.lastBaseUpdate = q, u === null && (o.shared.lanes = 0), Ws |= f, e.lanes = f, e.memoizedState = L;
    } }
    function Ef(e, t) { if (typeof e != "function")
        throw Error(c(191, e)); e.call(t); }
    function Mf(e, t) { var s = e.callbacks; if (s !== null)
        for (e.callbacks = null, e = 0; e < s.length; e++)
            Ef(s[e], t); }
    var nl = ye(null), hi = ye(0);
    function _f(e, t) { e = Es, le(hi, e), le(nl, t), Es = e | t.baseLanes; }
    function Kc() { le(hi, Es), le(nl, nl.current); }
    function Yc() { Es = hi.current, pe(nl), pe(hi); }
    var Et = ye(null), Kt = null;
    function Zs(e) { var t = e.alternate; le(Ue, Ue.current & 1), le(Et, e), Kt === null && (t === null || nl.current !== null || t.memoizedState !== null) && (Kt = e); }
    function Xc(e) { le(Ue, Ue.current), le(Et, e), Kt === null && (Kt = e); }
    function Of(e) { e.tag === 22 ? (le(Ue, Ue.current), le(Et, e), Kt === null && (Kt = e)) : Js(); }
    function Js() { le(Ue, Ue.current), le(Et, Et.current); }
    function Mt(e) { pe(Et), Kt === e && (Kt = null), pe(Ue); }
    var Ue = ye(0);
    function pi(e) { for (var t = e; t !== null;) {
        if (t.tag === 13) {
            var s = t.memoizedState;
            if (s !== null && (s = s.dehydrated, s === null || Po(s) || eu(s)))
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
    var js = 0, ne = null, Te = null, Ge = null, xi = !1, il = !1, Ta = !1, gi = 0, Il = 0, rl = null, Y0 = 0;
    function qe() { throw Error(c(321)); }
    function Zc(e, t) { if (t === null)
        return !1; for (var s = 0; s < t.length && s < e.length; s++)
        if (!Ct(e[s], t[s]))
            return !1; return !0; }
    function Jc(e, t, s, n, o, u) { return js = u, ne = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, z.H = e === null || e.memoizedState === null ? pm : oo, Ta = !1, u = s(n, o), Ta = !1, il && (u = Df(t, s, n, o)), zf(e), u; }
    function zf(e) { z.H = tn; var t = Te !== null && Te.next !== null; if (js = 0, Ge = Te = ne = null, xi = !1, Il = 0, rl = null, t)
        throw Error(c(300)); e === null || Ke || (e = e.dependencies, e !== null && ri(e) && (Ke = !0)); }
    function Df(e, t, s, n) { ne = e; var o = 0; do {
        if (il && (rl = null), Il = 0, il = !1, 25 <= o)
            throw Error(c(301));
        if (o += 1, Ge = Te = null, e.updateQueue != null) {
            var u = e.updateQueue;
            u.lastEffect = null, u.events = null, u.stores = null, u.memoCache != null && (u.memoCache.index = 0);
        }
        z.H = xm, u = t(s, n);
    } while (il); return u; }
    function X0() { var e = z.H, t = e.useState()[0]; return t = typeof t.then == "function" ? Pl(t) : t, e = e.useState()[0], (Te !== null ? Te.memoizedState : null) !== e && (ne.flags |= 1024), t; }
    function Fc() { var e = gi !== 0; return gi = 0, e; }
    function $c(e, t, s) { t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~s; }
    function Wc(e) { if (xi) {
        for (e = e.memoizedState; e !== null;) {
            var t = e.queue;
            t !== null && (t.pending = null), e = e.next;
        }
        xi = !1;
    } js = 0, Ge = Te = ne = null, il = !1, Il = gi = 0, rl = null; }
    function mt() { var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }; return Ge === null ? ne.memoizedState = Ge = e : Ge = Ge.next = e, Ge; }
    function Le() { if (Te === null) {
        var e = ne.alternate;
        e = e !== null ? e.memoizedState : null;
    }
    else
        e = Te.next; var t = Ge === null ? ne.memoizedState : Ge.next; if (t !== null)
        Ge = t, Te = e;
    else {
        if (e === null)
            throw ne.alternate === null ? Error(c(467)) : Error(c(310));
        Te = e, e = { memoizedState: Te.memoizedState, baseState: Te.baseState, baseQueue: Te.baseQueue, queue: Te.queue, next: null }, Ge === null ? ne.memoizedState = Ge = e : Ge = Ge.next = e;
    } return Ge; }
    function yi() { return { lastEffect: null, events: null, stores: null, memoCache: null }; }
    function Pl(e) { var t = Il; return Il += 1, rl === null && (rl = []), e = Sf(rl, e, t), t = ne, (Ge === null ? t.memoizedState : Ge.next) === null && (t = t.alternate, z.H = t === null || t.memoizedState === null ? pm : oo), e; }
    function bi(e) { if (e !== null && typeof e == "object") {
        if (typeof e.then == "function")
            return Pl(e);
        if (e.$$typeof === H)
            return ct(e);
    } throw Error(c(438, String(e))); }
    function Ic(e) { var t = null, s = ne.updateQueue; if (s !== null && (t = s.memoCache), t == null) {
        var n = ne.alternate;
        n !== null && (n = n.updateQueue, n !== null && (n = n.memoCache, n != null && (t = { data: n.data.map(function (o) { return o.slice(); }), index: 0 })));
    } if (t == null && (t = { data: [], index: 0 }), s === null && (s = yi(), ne.updateQueue = s), s.memoCache = t, s = t.data[t.index], s === void 0)
        for (s = t.data[t.index] = Array(e), n = 0; n < e; n++)
            s[n] = nt; return t.index++, s; }
    function Ns(e, t) { return typeof t == "function" ? t(e) : t; }
    function vi(e) { var t = Le(); return Pc(t, Te, e); }
    function Pc(e, t, s) { var n = e.queue; if (n === null)
        throw Error(c(311)); n.lastRenderedReducer = s; var o = e.baseQueue, u = n.pending; if (u !== null) {
        if (o !== null) {
            var f = o.next;
            o.next = u.next, u.next = f;
        }
        t.baseQueue = o = u, n.pending = null;
    } if (u = e.baseState, o === null)
        e.memoizedState = u;
    else {
        t = o.next;
        var p = f = null, j = null, E = t, q = !1;
        do {
            var L = E.lane & -536870913;
            if (L !== E.lane ? (xe & L) === L : (js & L) === L) {
                var M = E.revertLane;
                if (M === 0)
                    j !== null && (j = j.next = { lane: 0, revertLane: 0, gesture: null, action: E.action, hasEagerState: E.hasEagerState, eagerState: E.eagerState, next: null }), L === tl && (q = !0);
                else if ((js & M) === M) {
                    E = E.next, M === tl && (q = !0);
                    continue;
                }
                else
                    L = { lane: 0, revertLane: E.revertLane, gesture: null, action: E.action, hasEagerState: E.hasEagerState, eagerState: E.eagerState, next: null }, j === null ? (p = j = L, f = u) : j = j.next = L, ne.lanes |= M, Ws |= M;
                L = E.action, Ta && s(u, L), u = E.hasEagerState ? E.eagerState : s(u, L);
            }
            else
                M = { lane: L, revertLane: E.revertLane, gesture: E.gesture, action: E.action, hasEagerState: E.hasEagerState, eagerState: E.eagerState, next: null }, j === null ? (p = j = M, f = u) : j = j.next = M, ne.lanes |= L, Ws |= L;
            E = E.next;
        } while (E !== null && E !== t);
        if (j === null ? f = u : j.next = p, !Ct(u, e.memoizedState) && (Ke = !0, q && (s = sl, s !== null)))
            throw s;
        e.memoizedState = u, e.baseState = f, e.baseQueue = j, n.lastRenderedState = u;
    } return o === null && (n.lanes = 0), [e.memoizedState, n.dispatch]; }
    function eo(e) { var t = Le(), s = t.queue; if (s === null)
        throw Error(c(311)); s.lastRenderedReducer = e; var n = s.dispatch, o = s.pending, u = t.memoizedState; if (o !== null) {
        s.pending = null;
        var f = o = o.next;
        do
            u = e(u, f.action), f = f.next;
        while (f !== o);
        Ct(u, t.memoizedState) || (Ke = !0), t.memoizedState = u, t.baseQueue === null && (t.baseState = u), s.lastRenderedState = u;
    } return [u, n]; }
    function Rf(e, t, s) { var n = ne, o = Le(), u = be; if (u) {
        if (s === void 0)
            throw Error(c(407));
        s = s();
    }
    else
        s = t(); var f = !Ct((Te || o).memoizedState, s); if (f && (o.memoizedState = s, Ke = !0), o = o.queue, ao(Uf.bind(null, n, o, e), [e]), o.getSnapshot !== t || f || Ge !== null && Ge.memoizedState.tag & 1) {
        if (n.flags |= 2048, cl(9, { destroy: void 0 }, Bf.bind(null, n, o, s, t), null), _e === null)
            throw Error(c(349));
        u || (js & 127) !== 0 || qf(n, t, s);
    } return s; }
    function qf(e, t, s) { e.flags |= 16384, e = { getSnapshot: t, value: s }, t = ne.updateQueue, t === null ? (t = yi(), ne.updateQueue = t, t.stores = [e]) : (s = t.stores, s === null ? t.stores = [e] : s.push(e)); }
    function Bf(e, t, s, n) { t.value = s, t.getSnapshot = n, Lf(t) && Hf(e); }
    function Uf(e, t, s) { return s(function () { Lf(t) && Hf(e); }); }
    function Lf(e) { var t = e.getSnapshot; e = e.value; try {
        var s = t();
        return !Ct(e, s);
    }
    catch {
        return !0;
    } }
    function Hf(e) { var t = ba(e, 2); t !== null && vt(t, e, 2); }
    function to(e) { var t = mt(); if (typeof e == "function") {
        var s = e;
        if (e = s(), Ta) {
            Bs(!0);
            try {
                s();
            }
            finally {
                Bs(!1);
            }
        }
    } return t.memoizedState = t.baseState = e, t.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ns, lastRenderedState: e }, t; }
    function Vf(e, t, s, n) { return e.baseState = s, Pc(e, Te, typeof n == "function" ? n : Ns); }
    function Z0(e, t, s, n, o) { if (wi(e))
        throw Error(c(485)); if (e = t.action, e !== null) {
        var u = { payload: o, action: e, next: null, isTransition: !0, status: "pending", value: null, reason: null, listeners: [], then: function (f) { u.listeners.push(f); } };
        z.T !== null ? s(!0) : u.isTransition = !1, n(u), s = t.pending, s === null ? (u.next = t.pending = u, Qf(t, u)) : (u.next = s.next, t.pending = s.next = u);
    } }
    function Qf(e, t) { var s = t.action, n = t.payload, o = e.state; if (t.isTransition) {
        var u = z.T, f = {};
        z.T = f;
        try {
            var p = s(o, n), j = z.S;
            j !== null && j(f, p), Gf(e, t, p);
        }
        catch (E) {
            so(e, t, E);
        }
        finally {
            u !== null && f.types !== null && (u.types = f.types), z.T = u;
        }
    }
    else
        try {
            u = s(o, n), Gf(e, t, u);
        }
        catch (E) {
            so(e, t, E);
        } }
    function Gf(e, t, s) { s !== null && typeof s == "object" && typeof s.then == "function" ? s.then(function (n) { Kf(e, t, n); }, function (n) { return so(e, t, n); }) : Kf(e, t, s); }
    function Kf(e, t, s) { t.status = "fulfilled", t.value = s, Yf(t), e.state = s, t = e.pending, t !== null && (s = t.next, s === t ? e.pending = null : (s = s.next, t.next = s, Qf(e, s))); }
    function so(e, t, s) { var n = e.pending; if (e.pending = null, n !== null) {
        n = n.next;
        do
            t.status = "rejected", t.reason = s, Yf(t), t = t.next;
        while (t !== n);
    } e.action = null; }
    function Yf(e) { e = e.listeners; for (var t = 0; t < e.length; t++)
        (0, e[t])(); }
    function Xf(e, t) { return t; }
    function Zf(e, t) { if (be) {
        var s = _e.formState;
        if (s !== null) {
            e: {
                var n = ne;
                if (be) {
                    if (Oe) {
                        t: {
                            for (var o = Oe, u = Gt; o.nodeType !== 8;) {
                                if (!u) {
                                    o = null;
                                    break t;
                                }
                                if (o = Yt(o.nextSibling), o === null) {
                                    o = null;
                                    break t;
                                }
                            }
                            u = o.data, o = u === "F!" || u === "F" ? o : null;
                        }
                        if (o) {
                            Oe = Yt(o.nextSibling), n = o.data === "F!";
                            break e;
                        }
                    }
                    Qs(n);
                }
                n = !1;
            }
            n && (t = s[0]);
        }
    } return s = mt(), s.memoizedState = s.baseState = t, n = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Xf, lastRenderedState: t }, s.queue = n, s = fm.bind(null, ne, n), n.dispatch = s, n = to(!1), u = co.bind(null, ne, !1, n.queue), n = mt(), o = { state: t, dispatch: null, action: e, pending: null }, n.queue = o, s = Z0.bind(null, ne, o, u, s), o.dispatch = s, n.memoizedState = e, [t, s, !1]; }
    function Jf(e) { var t = Le(); return Ff(t, Te, e); }
    function Ff(e, t, s) { if (t = Pc(e, t, Xf)[0], e = vi(Ns)[0], typeof t == "object" && t !== null && typeof t.then == "function")
        try {
            var n = Pl(t);
        }
        catch (f) {
            throw f === al ? ui : f;
        }
    else
        n = t; t = Le(); var o = t.queue, u = o.dispatch; return s !== t.memoizedState && (ne.flags |= 2048, cl(9, { destroy: void 0 }, J0.bind(null, o, s), null)), [n, u, e]; }
    function J0(e, t) { e.action = t; }
    function $f(e) { var t = Le(), s = Te; if (s !== null)
        return Ff(t, s, e); Le(), t = t.memoizedState, s = Le(); var n = s.queue.dispatch; return s.memoizedState = e, [t, n, !1]; }
    function cl(e, t, s, n) { return e = { tag: e, create: s, deps: n, inst: t, next: null }, t = ne.updateQueue, t === null && (t = yi(), ne.updateQueue = t), s = t.lastEffect, s === null ? t.lastEffect = e.next = e : (n = s.next, s.next = e, e.next = n, t.lastEffect = e), e; }
    function Wf() { return Le().memoizedState; }
    function ji(e, t, s, n) { var o = mt(); ne.flags |= e, o.memoizedState = cl(1 | t, { destroy: void 0 }, s, n === void 0 ? null : n); }
    function Ni(e, t, s, n) { var o = Le(); n = n === void 0 ? null : n; var u = o.memoizedState.inst; Te !== null && n !== null && Zc(n, Te.memoizedState.deps) ? o.memoizedState = cl(t, u, s, n) : (ne.flags |= e, o.memoizedState = cl(1 | t, u, s, n)); }
    function If(e, t) { ji(8390656, 8, e, t); }
    function ao(e, t) { Ni(2048, 8, e, t); }
    function F0(e) { ne.flags |= 4; var t = ne.updateQueue; if (t === null)
        t = yi(), ne.updateQueue = t, t.events = [e];
    else {
        var s = t.events;
        s === null ? t.events = [e] : s.push(e);
    } }
    function Pf(e) { var t = Le().memoizedState; return F0({ ref: t, nextImpl: e }), function () { if ((Se & 2) !== 0)
        throw Error(c(440)); return t.impl.apply(void 0, arguments); }; }
    function em(e, t) { return Ni(4, 2, e, t); }
    function tm(e, t) { return Ni(4, 4, e, t); }
    function sm(e, t) { if (typeof t == "function") {
        e = e();
        var s = t(e);
        return function () { typeof s == "function" ? s() : t(null); };
    } if (t != null)
        return e = e(), t.current = e, function () { t.current = null; }; }
    function am(e, t, s) { s = s != null ? s.concat([e]) : null, Ni(4, 4, sm.bind(null, t, e), s); }
    function lo() { }
    function lm(e, t) { var s = Le(); t = t === void 0 ? null : t; var n = s.memoizedState; return t !== null && Zc(t, n[1]) ? n[0] : (s.memoizedState = [e, t], e); }
    function nm(e, t) { var s = Le(); t = t === void 0 ? null : t; var n = s.memoizedState; if (t !== null && Zc(t, n[1]))
        return n[0]; if (n = e(), Ta) {
        Bs(!0);
        try {
            e();
        }
        finally {
            Bs(!1);
        }
    } return s.memoizedState = [n, t], n; }
    function no(e, t, s) { return s === void 0 || (js & 1073741824) !== 0 && (xe & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = s, e = ih(), ne.lanes |= e, Ws |= e, s); }
    function im(e, t, s, n) { return Ct(s, t) ? s : nl.current !== null ? (e = no(e, s, n), Ct(e, t) || (Ke = !0), e) : (js & 42) === 0 || (js & 1073741824) !== 0 && (xe & 261930) === 0 ? (Ke = !0, e.memoizedState = s) : (e = ih(), ne.lanes |= e, Ws |= e, t); }
    function rm(e, t, s, n, o) { var u = Z.p; Z.p = u !== 0 && 8 > u ? u : 8; var f = z.T, p = {}; z.T = p, co(e, !1, t, s); try {
        var j = o(), E = z.S;
        if (E !== null && E(p, j), j !== null && typeof j == "object" && typeof j.then == "function") {
            var q = K0(j, n);
            en(e, t, q, zt(e));
        }
        else
            en(e, t, n, zt(e));
    }
    catch (L) {
        en(e, t, { then: function () { }, status: "rejected", reason: L }, zt());
    }
    finally {
        Z.p = u, f !== null && p.types !== null && (f.types = p.types), z.T = f;
    } }
    function $0() { }
    function io(e, t, s, n) { if (e.tag !== 5)
        throw Error(c(476)); var o = cm(e).queue; rm(e, o, t, V, s === null ? $0 : function () { return om(e), s(n); }); }
    function cm(e) { var t = e.memoizedState; if (t !== null)
        return t; t = { memoizedState: V, baseState: V, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ns, lastRenderedState: V }, next: null }; var s = {}; return t.next = { memoizedState: s, baseState: s, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ns, lastRenderedState: s }, next: null }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t; }
    function om(e) { var t = cm(e); t.next === null && (t = e.alternate.memoizedState), en(e, t.next.queue, {}, zt()); }
    function ro() { return ct(yn); }
    function um() { return Le().memoizedState; }
    function dm() { return Le().memoizedState; }
    function W0(e) { for (var t = e.return; t !== null;) {
        switch (t.tag) {
            case 24:
            case 3:
                var s = zt();
                e = Ys(s);
                var n = Xs(t, e, s);
                n !== null && (vt(n, t, s), Fl(n, t, s)), t = { cache: qc() }, e.payload = t;
                return;
        }
        t = t.return;
    } }
    function I0(e, t, s) { var n = zt(); s = { lane: n, revertLane: 0, gesture: null, action: s, hasEagerState: !1, eagerState: null, next: null }, wi(e) ? mm(t, s) : (s = kc(e, t, s, n), s !== null && (vt(s, e, n), hm(s, t, n))); }
    function fm(e, t, s) { var n = zt(); en(e, t, s, n); }
    function en(e, t, s, n) { var o = { lane: n, revertLane: 0, gesture: null, action: s, hasEagerState: !1, eagerState: null, next: null }; if (wi(e))
        mm(t, o);
    else {
        var u = e.alternate;
        if (e.lanes === 0 && (u === null || u.lanes === 0) && (u = t.lastRenderedReducer, u !== null))
            try {
                var f = t.lastRenderedState, p = u(f, s);
                if (o.hasEagerState = !0, o.eagerState = p, Ct(p, f))
                    return ai(e, t, o, 0), _e === null && si(), !1;
            }
            catch { }
            finally { }
        if (s = kc(e, t, o, n), s !== null)
            return vt(s, e, n), hm(s, t, n), !0;
    } return !1; }
    function co(e, t, s, n) { if (n = { lane: 2, revertLane: Vo(), gesture: null, action: n, hasEagerState: !1, eagerState: null, next: null }, wi(e)) {
        if (t)
            throw Error(c(479));
    }
    else
        t = kc(e, s, n, 2), t !== null && vt(t, e, 2); }
    function wi(e) { var t = e.alternate; return e === ne || t !== null && t === ne; }
    function mm(e, t) { il = xi = !0; var s = e.pending; s === null ? t.next = t : (t.next = s.next, s.next = t), e.pending = t; }
    function hm(e, t, s) { if ((s & 4194048) !== 0) {
        var n = t.lanes;
        n &= e.pendingLanes, s |= n, t.lanes = s, yd(e, s);
    } }
    var tn = { readContext: ct, use: bi, useCallback: qe, useContext: qe, useEffect: qe, useImperativeHandle: qe, useLayoutEffect: qe, useInsertionEffect: qe, useMemo: qe, useReducer: qe, useRef: qe, useState: qe, useDebugValue: qe, useDeferredValue: qe, useTransition: qe, useSyncExternalStore: qe, useId: qe, useHostTransitionStatus: qe, useFormState: qe, useActionState: qe, useOptimistic: qe, useMemoCache: qe, useCacheRefresh: qe };
    tn.useEffectEvent = qe;
    var pm = { readContext: ct, use: bi, useCallback: function (e, t) { return mt().memoizedState = [e, t === void 0 ? null : t], e; }, useContext: ct, useEffect: If, useImperativeHandle: function (e, t, s) { s = s != null ? s.concat([e]) : null, ji(4194308, 4, sm.bind(null, t, e), s); }, useLayoutEffect: function (e, t) { return ji(4194308, 4, e, t); }, useInsertionEffect: function (e, t) { ji(4, 2, e, t); }, useMemo: function (e, t) { var s = mt(); t = t === void 0 ? null : t; var n = e(); if (Ta) {
            Bs(!0);
            try {
                e();
            }
            finally {
                Bs(!1);
            }
        } return s.memoizedState = [n, t], n; }, useReducer: function (e, t, s) { var n = mt(); if (s !== void 0) {
            var o = s(t);
            if (Ta) {
                Bs(!0);
                try {
                    s(t);
                }
                finally {
                    Bs(!1);
                }
            }
        }
        else
            o = t; return n.memoizedState = n.baseState = o, e = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: o }, n.queue = e, e = e.dispatch = I0.bind(null, ne, e), [n.memoizedState, e]; }, useRef: function (e) { var t = mt(); return e = { current: e }, t.memoizedState = e; }, useState: function (e) { e = to(e); var t = e.queue, s = fm.bind(null, ne, t); return t.dispatch = s, [e.memoizedState, s]; }, useDebugValue: lo, useDeferredValue: function (e, t) { var s = mt(); return no(s, e, t); }, useTransition: function () { var e = to(!1); return e = rm.bind(null, ne, e.queue, !0, !1), mt().memoizedState = e, [!1, e]; }, useSyncExternalStore: function (e, t, s) { var n = ne, o = mt(); if (be) {
            if (s === void 0)
                throw Error(c(407));
            s = s();
        }
        else {
            if (s = t(), _e === null)
                throw Error(c(349));
            (xe & 127) !== 0 || qf(n, t, s);
        } o.memoizedState = s; var u = { value: s, getSnapshot: t }; return o.queue = u, If(Uf.bind(null, n, u, e), [e]), n.flags |= 2048, cl(9, { destroy: void 0 }, Bf.bind(null, n, u, s, t), null), s; }, useId: function () { var e = mt(), t = _e.identifierPrefix; if (be) {
            var s = is, n = ns;
            s = (n & ~(1 << 32 - At(n) - 1)).toString(32) + s, t = "_" + t + "R_" + s, s = gi++, 0 < s && (t += "H" + s.toString(32)), t += "_";
        }
        else
            s = Y0++, t = "_" + t + "r_" + s.toString(32) + "_"; return e.memoizedState = t; }, useHostTransitionStatus: ro, useFormState: Zf, useActionState: Zf, useOptimistic: function (e) { var t = mt(); t.memoizedState = t.baseState = e; var s = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null }; return t.queue = s, t = co.bind(null, ne, !0, s), s.dispatch = t, [e, t]; }, useMemoCache: Ic, useCacheRefresh: function () { return mt().memoizedState = W0.bind(null, ne); }, useEffectEvent: function (e) { var t = mt(), s = { impl: e }; return t.memoizedState = s, function () { if ((Se & 2) !== 0)
            throw Error(c(440)); return s.impl.apply(void 0, arguments); }; } }, oo = { readContext: ct, use: bi, useCallback: lm, useContext: ct, useEffect: ao, useImperativeHandle: am, useInsertionEffect: em, useLayoutEffect: tm, useMemo: nm, useReducer: vi, useRef: Wf, useState: function () { return vi(Ns); }, useDebugValue: lo, useDeferredValue: function (e, t) { var s = Le(); return im(s, Te.memoizedState, e, t); }, useTransition: function () { var e = vi(Ns)[0], t = Le().memoizedState; return [typeof e == "boolean" ? e : Pl(e), t]; }, useSyncExternalStore: Rf, useId: um, useHostTransitionStatus: ro, useFormState: Jf, useActionState: Jf, useOptimistic: function (e, t) { var s = Le(); return Vf(s, Te, e, t); }, useMemoCache: Ic, useCacheRefresh: dm };
    oo.useEffectEvent = Pf;
    var xm = { readContext: ct, use: bi, useCallback: lm, useContext: ct, useEffect: ao, useImperativeHandle: am, useInsertionEffect: em, useLayoutEffect: tm, useMemo: nm, useReducer: eo, useRef: Wf, useState: function () { return eo(Ns); }, useDebugValue: lo, useDeferredValue: function (e, t) { var s = Le(); return Te === null ? no(s, e, t) : im(s, Te.memoizedState, e, t); }, useTransition: function () { var e = eo(Ns)[0], t = Le().memoizedState; return [typeof e == "boolean" ? e : Pl(e), t]; }, useSyncExternalStore: Rf, useId: um, useHostTransitionStatus: ro, useFormState: $f, useActionState: $f, useOptimistic: function (e, t) { var s = Le(); return Te !== null ? Vf(s, Te, e, t) : (s.baseState = e, [e, s.queue.dispatch]); }, useMemoCache: Ic, useCacheRefresh: dm };
    xm.useEffectEvent = Pf;
    function uo(e, t, s, n) { t = e.memoizedState, s = s(n, t), s = s == null ? t : b({}, t, s), e.memoizedState = s, e.lanes === 0 && (e.updateQueue.baseState = s); }
    var fo = { enqueueSetState: function (e, t, s) { e = e._reactInternals; var n = zt(), o = Ys(n); o.payload = t, s != null && (o.callback = s), t = Xs(e, o, n), t !== null && (vt(t, e, n), Fl(t, e, n)); }, enqueueReplaceState: function (e, t, s) { e = e._reactInternals; var n = zt(), o = Ys(n); o.tag = 1, o.payload = t, s != null && (o.callback = s), t = Xs(e, o, n), t !== null && (vt(t, e, n), Fl(t, e, n)); }, enqueueForceUpdate: function (e, t) { e = e._reactInternals; var s = zt(), n = Ys(s); n.tag = 2, t != null && (n.callback = t), t = Xs(e, n, s), t !== null && (vt(t, e, s), Fl(t, e, s)); } };
    function gm(e, t, s, n, o, u, f) { return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(n, u, f) : t.prototype && t.prototype.isPureReactComponent ? !Vl(s, n) || !Vl(o, u) : !0; }
    function ym(e, t, s, n) { e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(s, n), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(s, n), t.state !== e && fo.enqueueReplaceState(t, t.state, null); }
    function Ea(e, t) { var s = t; if ("ref" in t) {
        s = {};
        for (var n in t)
            n !== "ref" && (s[n] = t[n]);
    } if (e = e.defaultProps) {
        s === t && (s = b({}, s));
        for (var o in e)
            s[o] === void 0 && (s[o] = e[o]);
    } return s; }
    function bm(e) { ti(e); }
    function vm(e) { console.error(e); }
    function jm(e) { ti(e); }
    function Si(e, t) { try {
        var s = e.onUncaughtError;
        s(t.value, { componentStack: t.stack });
    }
    catch (n) {
        setTimeout(function () { throw n; });
    } }
    function Nm(e, t, s) { try {
        var n = e.onCaughtError;
        n(s.value, { componentStack: s.stack, errorBoundary: t.tag === 1 ? t.stateNode : null });
    }
    catch (o) {
        setTimeout(function () { throw o; });
    } }
    function mo(e, t, s) { return s = Ys(s), s.tag = 3, s.payload = { element: null }, s.callback = function () { Si(e, t); }, s; }
    function wm(e) { return e = Ys(e), e.tag = 3, e; }
    function Sm(e, t, s, n) { var o = s.type.getDerivedStateFromError; if (typeof o == "function") {
        var u = n.value;
        e.payload = function () { return o(u); }, e.callback = function () { Nm(t, s, n); };
    } var f = s.stateNode; f !== null && typeof f.componentDidCatch == "function" && (e.callback = function () { Nm(t, s, n), typeof o != "function" && (Is === null ? Is = new Set([this]) : Is.add(this)); var p = n.stack; this.componentDidCatch(n.value, { componentStack: p !== null ? p : "" }); }); }
    function P0(e, t, s, n, o) { if (s.flags |= 32768, n !== null && typeof n == "object" && typeof n.then == "function") {
        if (t = s.alternate, t !== null && el(t, s, o, !0), s = Et.current, s !== null) {
            switch (s.tag) {
                case 31:
                case 13: return Kt === null ? qi() : s.alternate === null && Be === 0 && (Be = 3), s.flags &= -257, s.flags |= 65536, s.lanes = o, n === di ? s.flags |= 16384 : (t = s.updateQueue, t === null ? s.updateQueue = new Set([n]) : t.add(n), Uo(e, n, o)), !1;
                case 22: return s.flags |= 65536, n === di ? s.flags |= 16384 : (t = s.updateQueue, t === null ? (t = { transitions: null, markerInstances: null, retryQueue: new Set([n]) }, s.updateQueue = t) : (s = t.retryQueue, s === null ? t.retryQueue = new Set([n]) : s.add(n)), Uo(e, n, o)), !1;
            }
            throw Error(c(435, s.tag));
        }
        return Uo(e, n, o), qi(), !1;
    } if (be)
        return t = Et.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = o, n !== _c && (e = Error(c(422), { cause: n }), Kl(Ht(e, s)))) : (n !== _c && (t = Error(c(423), { cause: n }), Kl(Ht(t, s))), e = e.current.alternate, e.flags |= 65536, o &= -o, e.lanes |= o, n = Ht(n, s), o = mo(e.stateNode, n, o), Qc(e, o), Be !== 4 && (Be = 2)), !1; var u = Error(c(520), { cause: n }); if (u = Ht(u, s), un === null ? un = [u] : un.push(u), Be !== 4 && (Be = 2), t === null)
        return !0; n = Ht(n, s), s = t; do {
        switch (s.tag) {
            case 3: return s.flags |= 65536, e = o & -o, s.lanes |= e, e = mo(s.stateNode, n, e), Qc(s, e), !1;
            case 1: if (t = s.type, u = s.stateNode, (s.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || u !== null && typeof u.componentDidCatch == "function" && (Is === null || !Is.has(u))))
                return s.flags |= 65536, o &= -o, s.lanes |= o, o = wm(o), Sm(o, e, s, n), Qc(s, o), !1;
        }
        s = s.return;
    } while (s !== null); return !1; }
    var ho = Error(c(461)), Ke = !1;
    function ot(e, t, s, n) { t.child = e === null ? Tf(t, null, s, n) : Ca(t, e.child, s, n); }
    function km(e, t, s, n, o) { s = s.render; var u = t.ref; if ("ref" in n) {
        var f = {};
        for (var p in n)
            p !== "ref" && (f[p] = n[p]);
    }
    else
        f = n; return wa(t), n = Jc(e, t, s, f, u, o), p = Fc(), e !== null && !Ke ? ($c(e, t, o), ws(e, t, o)) : (be && p && Ec(t), t.flags |= 1, ot(e, t, n, o), t.child); }
    function Am(e, t, s, n, o) { if (e === null) {
        var u = s.type;
        return typeof u == "function" && !Ac(u) && u.defaultProps === void 0 && s.compare === null ? (t.tag = 15, t.type = u, Cm(e, t, u, n, o)) : (e = ni(s.type, null, n, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
    } if (u = e.child, !No(e, o)) {
        var f = u.memoizedProps;
        if (s = s.compare, s = s !== null ? s : Vl, s(f, n) && e.ref === t.ref)
            return ws(e, t, o);
    } return t.flags |= 1, e = gs(u, n), e.ref = t.ref, e.return = t, t.child = e; }
    function Cm(e, t, s, n, o) { if (e !== null) {
        var u = e.memoizedProps;
        if (Vl(u, n) && e.ref === t.ref)
            if (Ke = !1, t.pendingProps = n = u, No(e, o))
                (e.flags & 131072) !== 0 && (Ke = !0);
            else
                return t.lanes = e.lanes, ws(e, t, o);
    } return po(e, t, s, n, o); }
    function Tm(e, t, s, n) { var o = n.children, u = e !== null ? e.memoizedState : null; if (e === null && t.stateNode === null && (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), n.mode === "hidden") {
        if ((t.flags & 128) !== 0) {
            if (u = u !== null ? u.baseLanes | s : s, e !== null) {
                for (n = t.child = e.child, o = 0; n !== null;)
                    o = o | n.lanes | n.childLanes, n = n.sibling;
                n = o & ~u;
            }
            else
                n = 0, t.child = null;
            return Em(e, t, u, s, n);
        }
        if ((s & 536870912) !== 0)
            t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && oi(t, u !== null ? u.cachePool : null), u !== null ? _f(t, u) : Kc(), Of(t);
        else
            return n = t.lanes = 536870912, Em(e, t, u !== null ? u.baseLanes | s : s, s, n);
    }
    else
        u !== null ? (oi(t, u.cachePool), _f(t, u), Js(), t.memoizedState = null) : (e !== null && oi(t, null), Kc(), Js()); return ot(e, t, o, s), t.child; }
    function sn(e, t) { return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), t.sibling; }
    function Em(e, t, s, n, o) { var u = Uc(); return u = u === null ? null : { parent: Qe._currentValue, pool: u }, t.memoizedState = { baseLanes: s, cachePool: u }, e !== null && oi(t, null), Kc(), Of(t), e !== null && el(e, t, n, !0), t.childLanes = o, null; }
    function ki(e, t) { return t = Ci({ mode: t.mode, children: t.children }, e.mode), t.ref = e.ref, e.child = t, t.return = e, t; }
    function Mm(e, t, s) { return Ca(t, e.child, null, s), e = ki(t, t.pendingProps), e.flags |= 2, Mt(t), t.memoizedState = null, e; }
    function ey(e, t, s) { var n = t.pendingProps, o = (t.flags & 128) !== 0; if (t.flags &= -129, e === null) {
        if (be) {
            if (n.mode === "hidden")
                return e = ki(t, n), t.lanes = 536870912, sn(null, e);
            if (Xc(t), (e = Oe) ? (e = Qh(e, Gt), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Hs !== null ? { id: ns, overflow: is } : null, retryLane: 536870912, hydrationErrors: null }, s = mf(e), s.return = t, t.child = s, rt = t, Oe = null)) : e = null, e === null)
                throw Qs(t);
            return t.lanes = 536870912, null;
        }
        return ki(t, n);
    } var u = e.memoizedState; if (u !== null) {
        var f = u.dehydrated;
        if (Xc(t), o)
            if (t.flags & 256)
                t.flags &= -257, t = Mm(e, t, s);
            else if (t.memoizedState !== null)
                t.child = e.child, t.flags |= 128, t = null;
            else
                throw Error(c(558));
        else if (Ke || el(e, t, s, !1), o = (s & e.childLanes) !== 0, Ke || o) {
            if (n = _e, n !== null && (f = bd(n, s), f !== 0 && f !== u.retryLane))
                throw u.retryLane = f, ba(e, f), vt(n, e, f), ho;
            qi(), t = Mm(e, t, s);
        }
        else
            e = u.treeContext, Oe = Yt(f.nextSibling), rt = t, be = !0, Vs = null, Gt = !1, e !== null && xf(t, e), t = ki(t, n), t.flags |= 4096;
        return t;
    } return e = gs(e.child, { mode: n.mode, children: n.children }), e.ref = t.ref, t.child = e, e.return = t, e; }
    function Ai(e, t) { var s = t.ref; if (s === null)
        e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
        if (typeof s != "function" && typeof s != "object")
            throw Error(c(284));
        (e === null || e.ref !== s) && (t.flags |= 4194816);
    } }
    function po(e, t, s, n, o) { return wa(t), s = Jc(e, t, s, n, void 0, o), n = Fc(), e !== null && !Ke ? ($c(e, t, o), ws(e, t, o)) : (be && n && Ec(t), t.flags |= 1, ot(e, t, s, o), t.child); }
    function _m(e, t, s, n, o, u) { return wa(t), t.updateQueue = null, s = Df(t, n, s, o), zf(e), n = Fc(), e !== null && !Ke ? ($c(e, t, u), ws(e, t, u)) : (be && n && Ec(t), t.flags |= 1, ot(e, t, s, u), t.child); }
    function Om(e, t, s, n, o) { if (wa(t), t.stateNode === null) {
        var u = $a, f = s.contextType;
        typeof f == "object" && f !== null && (u = ct(f)), u = new s(n, u), t.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, u.updater = fo, t.stateNode = u, u._reactInternals = t, u = t.stateNode, u.props = n, u.state = t.memoizedState, u.refs = {}, Hc(t), f = s.contextType, u.context = typeof f == "object" && f !== null ? ct(f) : $a, u.state = t.memoizedState, f = s.getDerivedStateFromProps, typeof f == "function" && (uo(t, s, f, n), u.state = t.memoizedState), typeof s.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (f = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), f !== u.state && fo.enqueueReplaceState(u, u.state, null), Wl(t, n, u, o), $l(), u.state = t.memoizedState), typeof u.componentDidMount == "function" && (t.flags |= 4194308), n = !0;
    }
    else if (e === null) {
        u = t.stateNode;
        var p = t.memoizedProps, j = Ea(s, p);
        u.props = j;
        var E = u.context, q = s.contextType;
        f = $a, typeof q == "object" && q !== null && (f = ct(q));
        var L = s.getDerivedStateFromProps;
        q = typeof L == "function" || typeof u.getSnapshotBeforeUpdate == "function", p = t.pendingProps !== p, q || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (p || E !== f) && ym(t, u, n, f), Ks = !1;
        var M = t.memoizedState;
        u.state = M, Wl(t, n, u, o), $l(), E = t.memoizedState, p || M !== E || Ks ? (typeof L == "function" && (uo(t, s, L, n), E = t.memoizedState), (j = Ks || gm(t, s, j, n, M, E, f)) ? (q || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof u.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = n, t.memoizedState = E), u.props = n, u.state = E, u.context = f, n = j) : (typeof u.componentDidMount == "function" && (t.flags |= 4194308), n = !1);
    }
    else {
        u = t.stateNode, Vc(e, t), f = t.memoizedProps, q = Ea(s, f), u.props = q, L = t.pendingProps, M = u.context, E = s.contextType, j = $a, typeof E == "object" && E !== null && (j = ct(E)), p = s.getDerivedStateFromProps, (E = typeof p == "function" || typeof u.getSnapshotBeforeUpdate == "function") || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (f !== L || M !== j) && ym(t, u, n, j), Ks = !1, M = t.memoizedState, u.state = M, Wl(t, n, u, o), $l();
        var D = t.memoizedState;
        f !== L || M !== D || Ks || e !== null && e.dependencies !== null && ri(e.dependencies) ? (typeof p == "function" && (uo(t, s, p, n), D = t.memoizedState), (q = Ks || gm(t, s, q, n, M, D, j) || e !== null && e.dependencies !== null && ri(e.dependencies)) ? (E || typeof u.UNSAFE_componentWillUpdate != "function" && typeof u.componentWillUpdate != "function" || (typeof u.componentWillUpdate == "function" && u.componentWillUpdate(n, D, j), typeof u.UNSAFE_componentWillUpdate == "function" && u.UNSAFE_componentWillUpdate(n, D, j)), typeof u.componentDidUpdate == "function" && (t.flags |= 4), typeof u.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof u.componentDidUpdate != "function" || f === e.memoizedProps && M === e.memoizedState || (t.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && M === e.memoizedState || (t.flags |= 1024), t.memoizedProps = n, t.memoizedState = D), u.props = n, u.state = D, u.context = j, n = q) : (typeof u.componentDidUpdate != "function" || f === e.memoizedProps && M === e.memoizedState || (t.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && M === e.memoizedState || (t.flags |= 1024), n = !1);
    } return u = n, Ai(e, t), n = (t.flags & 128) !== 0, u || n ? (u = t.stateNode, s = n && typeof s.getDerivedStateFromError != "function" ? null : u.render(), t.flags |= 1, e !== null && n ? (t.child = Ca(t, e.child, null, o), t.child = Ca(t, null, s, o)) : ot(e, t, s, o), t.memoizedState = u.state, e = t.child) : e = ws(e, t, o), e; }
    function zm(e, t, s, n) { return ja(), t.flags |= 256, ot(e, t, s, n), t.child; }
    var xo = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function go(e) { return { baseLanes: e, cachePool: Nf() }; }
    function yo(e, t, s) { return e = e !== null ? e.childLanes & ~s : 0, t && (e |= Ot), e; }
    function Dm(e, t, s) { var n = t.pendingProps, o = !1, u = (t.flags & 128) !== 0, f; if ((f = u) || (f = e !== null && e.memoizedState === null ? !1 : (Ue.current & 2) !== 0), f && (o = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
        if (be) {
            if (o ? Zs(t) : Js(), (e = Oe) ? (e = Qh(e, Gt), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Hs !== null ? { id: ns, overflow: is } : null, retryLane: 536870912, hydrationErrors: null }, s = mf(e), s.return = t, t.child = s, rt = t, Oe = null)) : e = null, e === null)
                throw Qs(t);
            return eu(e) ? t.lanes = 32 : t.lanes = 536870912, null;
        }
        var p = n.children;
        return n = n.fallback, o ? (Js(), o = t.mode, p = Ci({ mode: "hidden", children: p }, o), n = va(n, o, s, null), p.return = t, n.return = t, p.sibling = n, t.child = p, n = t.child, n.memoizedState = go(s), n.childLanes = yo(e, f, s), t.memoizedState = xo, sn(null, n)) : (Zs(t), bo(t, p));
    } var j = e.memoizedState; if (j !== null && (p = j.dehydrated, p !== null)) {
        if (u)
            t.flags & 256 ? (Zs(t), t.flags &= -257, t = vo(e, t, s)) : t.memoizedState !== null ? (Js(), t.child = e.child, t.flags |= 128, t = null) : (Js(), p = n.fallback, o = t.mode, n = Ci({ mode: "visible", children: n.children }, o), p = va(p, o, s, null), p.flags |= 2, n.return = t, p.return = t, n.sibling = p, t.child = n, Ca(t, e.child, null, s), n = t.child, n.memoizedState = go(s), n.childLanes = yo(e, f, s), t.memoizedState = xo, t = sn(null, n));
        else if (Zs(t), eu(p)) {
            if (f = p.nextSibling && p.nextSibling.dataset, f)
                var E = f.dgst;
            f = E, n = Error(c(419)), n.stack = "", n.digest = f, Kl({ value: n, source: null, stack: null }), t = vo(e, t, s);
        }
        else if (Ke || el(e, t, s, !1), f = (s & e.childLanes) !== 0, Ke || f) {
            if (f = _e, f !== null && (n = bd(f, s), n !== 0 && n !== j.retryLane))
                throw j.retryLane = n, ba(e, n), vt(f, e, n), ho;
            Po(p) || qi(), t = vo(e, t, s);
        }
        else
            Po(p) ? (t.flags |= 192, t.child = e.child, t = null) : (e = j.treeContext, Oe = Yt(p.nextSibling), rt = t, be = !0, Vs = null, Gt = !1, e !== null && xf(t, e), t = bo(t, n.children), t.flags |= 4096);
        return t;
    } return o ? (Js(), p = n.fallback, o = t.mode, j = e.child, E = j.sibling, n = gs(j, { mode: "hidden", children: n.children }), n.subtreeFlags = j.subtreeFlags & 65011712, E !== null ? p = gs(E, p) : (p = va(p, o, s, null), p.flags |= 2), p.return = t, n.return = t, n.sibling = p, t.child = n, sn(null, n), n = t.child, p = e.child.memoizedState, p === null ? p = go(s) : (o = p.cachePool, o !== null ? (j = Qe._currentValue, o = o.parent !== j ? { parent: j, pool: j } : o) : o = Nf(), p = { baseLanes: p.baseLanes | s, cachePool: o }), n.memoizedState = p, n.childLanes = yo(e, f, s), t.memoizedState = xo, sn(e.child, n)) : (Zs(t), s = e.child, e = s.sibling, s = gs(s, { mode: "visible", children: n.children }), s.return = t, s.sibling = null, e !== null && (f = t.deletions, f === null ? (t.deletions = [e], t.flags |= 16) : f.push(e)), t.child = s, t.memoizedState = null, s); }
    function bo(e, t) { return t = Ci({ mode: "visible", children: t }, e.mode), t.return = e, e.child = t; }
    function Ci(e, t) { return e = Tt(22, e, null, t), e.lanes = 0, e; }
    function vo(e, t, s) { return Ca(t, e.child, null, s), e = bo(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e; }
    function Rm(e, t, s) { e.lanes |= t; var n = e.alternate; n !== null && (n.lanes |= t), Dc(e.return, t, s); }
    function jo(e, t, s, n, o, u) { var f = e.memoizedState; f === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: n, tail: s, tailMode: o, treeForkCount: u } : (f.isBackwards = t, f.rendering = null, f.renderingStartTime = 0, f.last = n, f.tail = s, f.tailMode = o, f.treeForkCount = u); }
    function qm(e, t, s) { var n = t.pendingProps, o = n.revealOrder, u = n.tail; n = n.children; var f = Ue.current, p = (f & 2) !== 0; if (p ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, le(Ue, f), ot(e, t, n, s), n = be ? Gl : 0, !p && e !== null && (e.flags & 128) !== 0)
        e: for (e = t.child; e !== null;) {
            if (e.tag === 13)
                e.memoizedState !== null && Rm(e, s, t);
            else if (e.tag === 19)
                Rm(e, s, t);
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
            for (s = t.child, o = null; s !== null;)
                e = s.alternate, e !== null && pi(e) === null && (o = s), s = s.sibling;
            s = o, s === null ? (o = t.child, t.child = null) : (o = s.sibling, s.sibling = null), jo(t, !1, o, s, u, n);
            break;
        case "backwards":
        case "unstable_legacy-backwards":
            for (s = null, o = t.child, t.child = null; o !== null;) {
                if (e = o.alternate, e !== null && pi(e) === null) {
                    t.child = o;
                    break;
                }
                e = o.sibling, o.sibling = s, s = o, o = e;
            }
            jo(t, !0, s, null, u, n);
            break;
        case "together":
            jo(t, !1, null, null, void 0, n);
            break;
        default: t.memoizedState = null;
    } return t.child; }
    function ws(e, t, s) { if (e !== null && (t.dependencies = e.dependencies), Ws |= t.lanes, (s & t.childLanes) === 0)
        if (e !== null) {
            if (el(e, t, s, !1), (s & t.childLanes) === 0)
                return null;
        }
        else
            return null; if (e !== null && t.child !== e.child)
        throw Error(c(153)); if (t.child !== null) {
        for (e = t.child, s = gs(e, e.pendingProps), t.child = s, s.return = t; e.sibling !== null;)
            e = e.sibling, s = s.sibling = gs(e, e.pendingProps), s.return = t;
        s.sibling = null;
    } return t.child; }
    function No(e, t) { return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && ri(e))); }
    function ty(e, t, s) { switch (t.tag) {
        case 3:
            fa(t, t.stateNode.containerInfo), Gs(t, Qe, e.memoizedState.cache), ja();
            break;
        case 27:
        case 5:
            Ds(t);
            break;
        case 4:
            fa(t, t.stateNode.containerInfo);
            break;
        case 10:
            Gs(t, t.type, t.memoizedProps.value);
            break;
        case 31:
            if (t.memoizedState !== null)
                return t.flags |= 128, Xc(t), null;
            break;
        case 13:
            var n = t.memoizedState;
            if (n !== null)
                return n.dehydrated !== null ? (Zs(t), t.flags |= 128, null) : (s & t.child.childLanes) !== 0 ? Dm(e, t, s) : (Zs(t), e = ws(e, t, s), e !== null ? e.sibling : null);
            Zs(t);
            break;
        case 19:
            var o = (e.flags & 128) !== 0;
            if (n = (s & t.childLanes) !== 0, n || (el(e, t, s, !1), n = (s & t.childLanes) !== 0), o) {
                if (n)
                    return qm(e, t, s);
                t.flags |= 128;
            }
            if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), le(Ue, Ue.current), n)
                break;
            return null;
        case 22: return t.lanes = 0, Tm(e, t, s, t.pendingProps);
        case 24: Gs(t, Qe, e.memoizedState.cache);
    } return ws(e, t, s); }
    function Bm(e, t, s) { if (e !== null)
        if (e.memoizedProps !== t.pendingProps)
            Ke = !0;
        else {
            if (!No(e, s) && (t.flags & 128) === 0)
                return Ke = !1, ty(e, t, s);
            Ke = (e.flags & 131072) !== 0;
        }
    else
        Ke = !1, be && (t.flags & 1048576) !== 0 && pf(t, Gl, t.index); switch (t.lanes = 0, t.tag) {
        case 16:
            e: {
                var n = t.pendingProps;
                if (e = ka(t.elementType), t.type = e, typeof e == "function")
                    Ac(e) ? (n = Ea(e, n), t.tag = 1, t = Om(null, t, e, n, s)) : (t.tag = 0, t = po(null, t, e, n, s));
                else {
                    if (e != null) {
                        var o = e.$$typeof;
                        if (o === J) {
                            t.tag = 11, t = km(null, t, e, n, s);
                            break e;
                        }
                        else if (o === R) {
                            t.tag = 14, t = Am(null, t, e, n, s);
                            break e;
                        }
                    }
                    throw t = Ze(e) || e, Error(c(306, t, ""));
                }
            }
            return t;
        case 0: return po(e, t, t.type, t.pendingProps, s);
        case 1: return n = t.type, o = Ea(n, t.pendingProps), Om(e, t, n, o, s);
        case 3:
            e: {
                if (fa(t, t.stateNode.containerInfo), e === null)
                    throw Error(c(387));
                n = t.pendingProps;
                var u = t.memoizedState;
                o = u.element, Vc(e, t), Wl(t, n, null, s);
                var f = t.memoizedState;
                if (n = f.cache, Gs(t, Qe, n), n !== u.cache && Rc(t, [Qe], s, !0), $l(), n = f.element, u.isDehydrated)
                    if (u = { element: n, isDehydrated: !1, cache: f.cache }, t.updateQueue.baseState = u, t.memoizedState = u, t.flags & 256) {
                        t = zm(e, t, n, s);
                        break e;
                    }
                    else if (n !== o) {
                        o = Ht(Error(c(424)), t), Kl(o), t = zm(e, t, n, s);
                        break e;
                    }
                    else {
                        switch (e = t.stateNode.containerInfo, e.nodeType) {
                            case 9:
                                e = e.body;
                                break;
                            default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
                        }
                        for (Oe = Yt(e.firstChild), rt = t, be = !0, Vs = null, Gt = !0, s = Tf(t, null, n, s), t.child = s; s;)
                            s.flags = s.flags & -3 | 4096, s = s.sibling;
                    }
                else {
                    if (ja(), n === o) {
                        t = ws(e, t, s);
                        break e;
                    }
                    ot(e, t, n, s);
                }
                t = t.child;
            }
            return t;
        case 26: return Ai(e, t), e === null ? (s = Jh(t.type, null, t.pendingProps, null)) ? t.memoizedState = s : be || (s = t.type, e = t.pendingProps, n = Gi(Ft.current).createElement(s), n[it] = t, n[ht] = e, ut(n, s, e), et(n), t.stateNode = n) : t.memoizedState = Jh(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
        case 27: return Ds(t), e === null && be && (n = t.stateNode = Yh(t.type, t.pendingProps, Ft.current), rt = t, Gt = !0, o = Oe, sa(t.type) ? (tu = o, Oe = Yt(n.firstChild)) : Oe = o), ot(e, t, t.pendingProps.children, s), Ai(e, t), e === null && (t.flags |= 4194304), t.child;
        case 5: return e === null && be && ((o = n = Oe) && (n = _y(n, t.type, t.pendingProps, Gt), n !== null ? (t.stateNode = n, rt = t, Oe = Yt(n.firstChild), Gt = !1, o = !0) : o = !1), o || Qs(t)), Ds(t), o = t.type, u = t.pendingProps, f = e !== null ? e.memoizedProps : null, n = u.children, $o(o, u) ? n = null : f !== null && $o(o, f) && (t.flags |= 32), t.memoizedState !== null && (o = Jc(e, t, X0, null, null, s), yn._currentValue = o), Ai(e, t), ot(e, t, n, s), t.child;
        case 6: return e === null && be && ((e = s = Oe) && (s = Oy(s, t.pendingProps, Gt), s !== null ? (t.stateNode = s, rt = t, Oe = null, e = !0) : e = !1), e || Qs(t)), null;
        case 13: return Dm(e, t, s);
        case 4: return fa(t, t.stateNode.containerInfo), n = t.pendingProps, e === null ? t.child = Ca(t, null, n, s) : ot(e, t, n, s), t.child;
        case 11: return km(e, t, t.type, t.pendingProps, s);
        case 7: return ot(e, t, t.pendingProps, s), t.child;
        case 8: return ot(e, t, t.pendingProps.children, s), t.child;
        case 12: return ot(e, t, t.pendingProps.children, s), t.child;
        case 10: return n = t.pendingProps, Gs(t, t.type, n.value), ot(e, t, n.children, s), t.child;
        case 9: return o = t.type._context, n = t.pendingProps.children, wa(t), o = ct(o), n = n(o), t.flags |= 1, ot(e, t, n, s), t.child;
        case 14: return Am(e, t, t.type, t.pendingProps, s);
        case 15: return Cm(e, t, t.type, t.pendingProps, s);
        case 19: return qm(e, t, s);
        case 31: return ey(e, t, s);
        case 22: return Tm(e, t, s, t.pendingProps);
        case 24: return wa(t), n = ct(Qe), e === null ? (o = Uc(), o === null && (o = _e, u = qc(), o.pooledCache = u, u.refCount++, u !== null && (o.pooledCacheLanes |= s), o = u), t.memoizedState = { parent: n, cache: o }, Hc(t), Gs(t, Qe, o)) : ((e.lanes & s) !== 0 && (Vc(e, t), Wl(t, null, null, s), $l()), o = e.memoizedState, u = t.memoizedState, o.parent !== n ? (o = { parent: n, cache: n }, t.memoizedState = o, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = o), Gs(t, Qe, n)) : (n = u.cache, Gs(t, Qe, n), n !== o.cache && Rc(t, [Qe], s, !0))), ot(e, t, t.pendingProps.children, s), t.child;
        case 29: throw t.pendingProps;
    } throw Error(c(156, t.tag)); }
    function Ss(e) { e.flags |= 4; }
    function wo(e, t, s, n, o) { if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
        if (e.flags |= 16777216, (o & 335544128) === o)
            if (e.stateNode.complete)
                e.flags |= 8192;
            else if (uh())
                e.flags |= 8192;
            else
                throw Aa = di, Lc;
    }
    else
        e.flags &= -16777217; }
    function Um(e, t) { if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
        e.flags &= -16777217;
    else if (e.flags |= 16777216, !Ph(t))
        if (uh())
            e.flags |= 8192;
        else
            throw Aa = di, Lc; }
    function Ti(e, t) { t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? xd() : 536870912, e.lanes |= t, fl |= t); }
    function an(e, t) { if (!be)
        switch (e.tailMode) {
            case "hidden":
                t = e.tail;
                for (var s = null; t !== null;)
                    t.alternate !== null && (s = t), t = t.sibling;
                s === null ? e.tail = null : s.sibling = null;
                break;
            case "collapsed":
                s = e.tail;
                for (var n = null; s !== null;)
                    s.alternate !== null && (n = s), s = s.sibling;
                n === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : n.sibling = null;
        } }
    function ze(e) { var t = e.alternate !== null && e.alternate.child === e.child, s = 0, n = 0; if (t)
        for (var o = e.child; o !== null;)
            s |= o.lanes | o.childLanes, n |= o.subtreeFlags & 65011712, n |= o.flags & 65011712, o.return = e, o = o.sibling;
    else
        for (o = e.child; o !== null;)
            s |= o.lanes | o.childLanes, n |= o.subtreeFlags, n |= o.flags, o.return = e, o = o.sibling; return e.subtreeFlags |= n, e.childLanes = s, t; }
    function sy(e, t, s) { var n = t.pendingProps; switch (Mc(t), t.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14: return ze(t), null;
        case 1: return ze(t), null;
        case 3: return s = t.stateNode, n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), vs(Qe), $t(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), (e === null || e.child === null) && (Pa(t) ? Ss(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Oc())), ze(t), null;
        case 26:
            var o = t.type, u = t.memoizedState;
            return e === null ? (Ss(t), u !== null ? (ze(t), Um(t, u)) : (ze(t), wo(t, o, null, n, s))) : u ? u !== e.memoizedState ? (Ss(t), ze(t), Um(t, u)) : (ze(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== n && Ss(t), ze(t), wo(t, o, e, n, s)), null;
        case 27:
            if (Rs(t), s = Ft.current, o = t.type, e !== null && t.stateNode != null)
                e.memoizedProps !== n && Ss(t);
            else {
                if (!n) {
                    if (t.stateNode === null)
                        throw Error(c(166));
                    return ze(t), null;
                }
                e = de.current, Pa(t) ? gf(t) : (e = Yh(o, n, s), t.stateNode = e, Ss(t));
            }
            return ze(t), null;
        case 5:
            if (Rs(t), o = t.type, e !== null && t.stateNode != null)
                e.memoizedProps !== n && Ss(t);
            else {
                if (!n) {
                    if (t.stateNode === null)
                        throw Error(c(166));
                    return ze(t), null;
                }
                if (u = de.current, Pa(t))
                    gf(t);
                else {
                    var f = Gi(Ft.current);
                    switch (u) {
                        case 1:
                            u = f.createElementNS("http://www.w3.org/2000/svg", o);
                            break;
                        case 2:
                            u = f.createElementNS("http://www.w3.org/1998/Math/MathML", o);
                            break;
                        default: switch (o) {
                            case "svg":
                                u = f.createElementNS("http://www.w3.org/2000/svg", o);
                                break;
                            case "math":
                                u = f.createElementNS("http://www.w3.org/1998/Math/MathML", o);
                                break;
                            case "script":
                                u = f.createElement("div"), u.innerHTML = "<script><\/script>", u = u.removeChild(u.firstChild);
                                break;
                            case "select":
                                u = typeof n.is == "string" ? f.createElement("select", { is: n.is }) : f.createElement("select"), n.multiple ? u.multiple = !0 : n.size && (u.size = n.size);
                                break;
                            default: u = typeof n.is == "string" ? f.createElement(o, { is: n.is }) : f.createElement(o);
                        }
                    }
                    u[it] = t, u[ht] = n;
                    e: for (f = t.child; f !== null;) {
                        if (f.tag === 5 || f.tag === 6)
                            u.appendChild(f.stateNode);
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
                    t.stateNode = u;
                    e: switch (ut(u, o, n), o) {
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
            return ze(t), wo(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, s), null;
        case 6:
            if (e && t.stateNode != null)
                e.memoizedProps !== n && Ss(t);
            else {
                if (typeof n != "string" && t.stateNode === null)
                    throw Error(c(166));
                if (e = Ft.current, Pa(t)) {
                    if (e = t.stateNode, s = t.memoizedProps, n = null, o = rt, o !== null)
                        switch (o.tag) {
                            case 27:
                            case 5: n = o.memoizedProps;
                        }
                    e[it] = t, e = !!(e.nodeValue === s || n !== null && n.suppressHydrationWarning === !0 || Dh(e.nodeValue, s)), e || Qs(t, !0);
                }
                else
                    e = Gi(e).createTextNode(n), e[it] = t, t.stateNode = e;
            }
            return ze(t), null;
        case 31:
            if (s = t.memoizedState, e === null || e.memoizedState !== null) {
                if (n = Pa(t), s !== null) {
                    if (e === null) {
                        if (!n)
                            throw Error(c(318));
                        if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e)
                            throw Error(c(557));
                        e[it] = t;
                    }
                    else
                        ja(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                    ze(t), e = !1;
                }
                else
                    s = Oc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = s), e = !0;
                if (!e)
                    return t.flags & 256 ? (Mt(t), t) : (Mt(t), null);
                if ((t.flags & 128) !== 0)
                    throw Error(c(558));
            }
            return ze(t), null;
        case 13:
            if (n = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                if (o = Pa(t), n !== null && n.dehydrated !== null) {
                    if (e === null) {
                        if (!o)
                            throw Error(c(318));
                        if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o)
                            throw Error(c(317));
                        o[it] = t;
                    }
                    else
                        ja(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                    ze(t), o = !1;
                }
                else
                    o = Oc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = o), o = !0;
                if (!o)
                    return t.flags & 256 ? (Mt(t), t) : (Mt(t), null);
            }
            return Mt(t), (t.flags & 128) !== 0 ? (t.lanes = s, t) : (s = n !== null, e = e !== null && e.memoizedState !== null, s && (n = t.child, o = null, n.alternate !== null && n.alternate.memoizedState !== null && n.alternate.memoizedState.cachePool !== null && (o = n.alternate.memoizedState.cachePool.pool), u = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (u = n.memoizedState.cachePool.pool), u !== o && (n.flags |= 2048)), s !== e && s && (t.child.flags |= 8192), Ti(t, t.updateQueue), ze(t), null);
        case 4: return $t(), e === null && Yo(t.stateNode.containerInfo), ze(t), null;
        case 10: return vs(t.type), ze(t), null;
        case 19:
            if (pe(Ue), n = t.memoizedState, n === null)
                return ze(t), null;
            if (o = (t.flags & 128) !== 0, u = n.rendering, u === null)
                if (o)
                    an(n, !1);
                else {
                    if (Be !== 0 || e !== null && (e.flags & 128) !== 0)
                        for (e = t.child; e !== null;) {
                            if (u = pi(e), u !== null) {
                                for (t.flags |= 128, an(n, !1), e = u.updateQueue, t.updateQueue = e, Ti(t, e), t.subtreeFlags = 0, e = s, s = t.child; s !== null;)
                                    ff(s, e), s = s.sibling;
                                return le(Ue, Ue.current & 1 | 2), be && ys(t, n.treeForkCount), t.child;
                            }
                            e = e.sibling;
                        }
                    n.tail !== null && St() > zi && (t.flags |= 128, o = !0, an(n, !1), t.lanes = 4194304);
                }
            else {
                if (!o)
                    if (e = pi(u), e !== null) {
                        if (t.flags |= 128, o = !0, e = e.updateQueue, t.updateQueue = e, Ti(t, e), an(n, !0), n.tail === null && n.tailMode === "hidden" && !u.alternate && !be)
                            return ze(t), null;
                    }
                    else
                        2 * St() - n.renderingStartTime > zi && s !== 536870912 && (t.flags |= 128, o = !0, an(n, !1), t.lanes = 4194304);
                n.isBackwards ? (u.sibling = t.child, t.child = u) : (e = n.last, e !== null ? e.sibling = u : t.child = u, n.last = u);
            }
            return n.tail !== null ? (e = n.tail, n.rendering = e, n.tail = e.sibling, n.renderingStartTime = St(), e.sibling = null, s = Ue.current, le(Ue, o ? s & 1 | 2 : s & 1), be && ys(t, n.treeForkCount), e) : (ze(t), null);
        case 22:
        case 23: return Mt(t), Yc(), n = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== n && (t.flags |= 8192) : n && (t.flags |= 8192), n ? (s & 536870912) !== 0 && (t.flags & 128) === 0 && (ze(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ze(t), s = t.updateQueue, s !== null && Ti(t, s.retryQueue), s = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (s = e.memoizedState.cachePool.pool), n = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (n = t.memoizedState.cachePool.pool), n !== s && (t.flags |= 2048), e !== null && pe(Sa), null;
        case 24: return s = null, e !== null && (s = e.memoizedState.cache), t.memoizedState.cache !== s && (t.flags |= 2048), vs(Qe), ze(t), null;
        case 25: return null;
        case 30: return null;
    } throw Error(c(156, t.tag)); }
    function ay(e, t) { switch (Mc(t), t.tag) {
        case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 3: return vs(Qe), $t(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
        case 26:
        case 27:
        case 5: return Rs(t), null;
        case 31:
            if (t.memoizedState !== null) {
                if (Mt(t), t.alternate === null)
                    throw Error(c(340));
                ja();
            }
            return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 13:
            if (Mt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
                if (t.alternate === null)
                    throw Error(c(340));
                ja();
            }
            return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 19: return pe(Ue), null;
        case 4: return $t(), null;
        case 10: return vs(t.type), null;
        case 22:
        case 23: return Mt(t), Yc(), e !== null && pe(Sa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 24: return vs(Qe), null;
        case 25: return null;
        default: return null;
    } }
    function Lm(e, t) { switch (Mc(t), t.tag) {
        case 3:
            vs(Qe), $t();
            break;
        case 26:
        case 27:
        case 5:
            Rs(t);
            break;
        case 4:
            $t();
            break;
        case 31:
            t.memoizedState !== null && Mt(t);
            break;
        case 13:
            Mt(t);
            break;
        case 19:
            pe(Ue);
            break;
        case 10:
            vs(t.type);
            break;
        case 22:
        case 23:
            Mt(t), Yc(), e !== null && pe(Sa);
            break;
        case 24: vs(Qe);
    } }
    function ln(e, t) { try {
        var s = t.updateQueue, n = s !== null ? s.lastEffect : null;
        if (n !== null) {
            var o = n.next;
            s = o;
            do {
                if ((s.tag & e) === e) {
                    n = void 0;
                    var u = s.create, f = s.inst;
                    n = u(), f.destroy = n;
                }
                s = s.next;
            } while (s !== o);
        }
    }
    catch (p) {
        Ce(t, t.return, p);
    } }
    function Fs(e, t, s) { try {
        var n = t.updateQueue, o = n !== null ? n.lastEffect : null;
        if (o !== null) {
            var u = o.next;
            n = u;
            do {
                if ((n.tag & e) === e) {
                    var f = n.inst, p = f.destroy;
                    if (p !== void 0) {
                        f.destroy = void 0, o = t;
                        var j = s, E = p;
                        try {
                            E();
                        }
                        catch (q) {
                            Ce(o, j, q);
                        }
                    }
                }
                n = n.next;
            } while (n !== u);
        }
    }
    catch (q) {
        Ce(t, t.return, q);
    } }
    function Hm(e) { var t = e.updateQueue; if (t !== null) {
        var s = e.stateNode;
        try {
            Mf(t, s);
        }
        catch (n) {
            Ce(e, e.return, n);
        }
    } }
    function Vm(e, t, s) { s.props = Ea(e.type, e.memoizedProps), s.state = e.memoizedState; try {
        s.componentWillUnmount();
    }
    catch (n) {
        Ce(e, t, n);
    } }
    function nn(e, t) { try {
        var s = e.ref;
        if (s !== null) {
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
            typeof s == "function" ? e.refCleanup = s(n) : s.current = n;
        }
    }
    catch (o) {
        Ce(e, t, o);
    } }
    function rs(e, t) { var s = e.ref, n = e.refCleanup; if (s !== null)
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
        else if (typeof s == "function")
            try {
                s(null);
            }
            catch (o) {
                Ce(e, t, o);
            }
        else
            s.current = null; }
    function Qm(e) { var t = e.type, s = e.memoizedProps, n = e.stateNode; try {
        e: switch (t) {
            case "button":
            case "input":
            case "select":
            case "textarea":
                s.autoFocus && n.focus();
                break e;
            case "img": s.src ? n.src = s.src : s.srcSet && (n.srcset = s.srcSet);
        }
    }
    catch (o) {
        Ce(e, e.return, o);
    } }
    function So(e, t, s) { try {
        var n = e.stateNode;
        ky(n, e.type, s, t), n[ht] = t;
    }
    catch (o) {
        Ce(e, e.return, o);
    } }
    function Gm(e) { return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && sa(e.type) || e.tag === 4; }
    function ko(e) { e: for (;;) {
        for (; e.sibling === null;) {
            if (e.return === null || Gm(e.return))
                return null;
            e = e.return;
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
            if (e.tag === 27 && sa(e.type) || e.flags & 2 || e.child === null || e.tag === 4)
                continue e;
            e.child.return = e, e = e.child;
        }
        if (!(e.flags & 2))
            return e.stateNode;
    } }
    function Ao(e, t, s) { var n = e.tag; if (n === 5 || n === 6)
        e = e.stateNode, t ? (s.nodeType === 9 ? s.body : s.nodeName === "HTML" ? s.ownerDocument.body : s).insertBefore(e, t) : (t = s.nodeType === 9 ? s.body : s.nodeName === "HTML" ? s.ownerDocument.body : s, t.appendChild(e), s = s._reactRootContainer, s != null || t.onclick !== null || (t.onclick = ps));
    else if (n !== 4 && (n === 27 && sa(e.type) && (s = e.stateNode, t = null), e = e.child, e !== null))
        for (Ao(e, t, s), e = e.sibling; e !== null;)
            Ao(e, t, s), e = e.sibling; }
    function Ei(e, t, s) { var n = e.tag; if (n === 5 || n === 6)
        e = e.stateNode, t ? s.insertBefore(e, t) : s.appendChild(e);
    else if (n !== 4 && (n === 27 && sa(e.type) && (s = e.stateNode), e = e.child, e !== null))
        for (Ei(e, t, s), e = e.sibling; e !== null;)
            Ei(e, t, s), e = e.sibling; }
    function Km(e) { var t = e.stateNode, s = e.memoizedProps; try {
        for (var n = e.type, o = t.attributes; o.length;)
            t.removeAttributeNode(o[0]);
        ut(t, n, s), t[it] = e, t[ht] = s;
    }
    catch (u) {
        Ce(e, e.return, u);
    } }
    var ks = !1, Ye = !1, Co = !1, Ym = typeof WeakSet == "function" ? WeakSet : Set, tt = null;
    function ly(e, t) { if (e = e.containerInfo, Jo = $i, e = sf(e), bc(e)) {
        if ("selectionStart" in e)
            var s = { start: e.selectionStart, end: e.selectionEnd };
        else
            e: {
                s = (s = e.ownerDocument) && s.defaultView || window;
                var n = s.getSelection && s.getSelection();
                if (n && n.rangeCount !== 0) {
                    s = n.anchorNode;
                    var o = n.anchorOffset, u = n.focusNode;
                    n = n.focusOffset;
                    try {
                        s.nodeType, u.nodeType;
                    }
                    catch {
                        s = null;
                        break e;
                    }
                    var f = 0, p = -1, j = -1, E = 0, q = 0, L = e, M = null;
                    t: for (;;) {
                        for (var D; L !== s || o !== 0 && L.nodeType !== 3 || (p = f + o), L !== u || n !== 0 && L.nodeType !== 3 || (j = f + n), L.nodeType === 3 && (f += L.nodeValue.length), (D = L.firstChild) !== null;)
                            M = L, L = D;
                        for (;;) {
                            if (L === e)
                                break t;
                            if (M === s && ++E === o && (p = f), M === u && ++q === n && (j = f), (D = L.nextSibling) !== null)
                                break;
                            L = M, M = L.parentNode;
                        }
                        L = D;
                    }
                    s = p === -1 || j === -1 ? null : { start: p, end: j };
                }
                else
                    s = null;
            }
        s = s || { start: 0, end: 0 };
    }
    else
        s = null; for (Fo = { focusedElem: e, selectionRange: s }, $i = !1, tt = t; tt !== null;)
        if (t = tt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
            e.return = t, tt = e;
        else
            for (; tt !== null;) {
                switch (t = tt, u = t.alternate, e = t.flags, t.tag) {
                    case 0:
                        if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                            for (s = 0; s < e.length; s++)
                                o = e[s], o.ref.impl = o.nextImpl;
                        break;
                    case 11:
                    case 15: break;
                    case 1:
                        if ((e & 1024) !== 0 && u !== null) {
                            e = void 0, s = t, o = u.memoizedProps, u = u.memoizedState, n = s.stateNode;
                            try {
                                var W = Ea(s.type, o);
                                e = n.getSnapshotBeforeUpdate(W, u), n.__reactInternalSnapshotBeforeUpdate = e;
                            }
                            catch (se) {
                                Ce(s, s.return, se);
                            }
                        }
                        break;
                    case 3:
                        if ((e & 1024) !== 0) {
                            if (e = t.stateNode.containerInfo, s = e.nodeType, s === 9)
                                Io(e);
                            else if (s === 1)
                                switch (e.nodeName) {
                                    case "HEAD":
                                    case "HTML":
                                    case "BODY":
                                        Io(e);
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
                    e.return = t.return, tt = e;
                    break;
                }
                tt = t.return;
            } }
    function Xm(e, t, s) { var n = s.flags; switch (s.tag) {
        case 0:
        case 11:
        case 15:
            Cs(e, s), n & 4 && ln(5, s);
            break;
        case 1:
            if (Cs(e, s), n & 4)
                if (e = s.stateNode, t === null)
                    try {
                        e.componentDidMount();
                    }
                    catch (f) {
                        Ce(s, s.return, f);
                    }
                else {
                    var o = Ea(s.type, t.memoizedProps);
                    t = t.memoizedState;
                    try {
                        e.componentDidUpdate(o, t, e.__reactInternalSnapshotBeforeUpdate);
                    }
                    catch (f) {
                        Ce(s, s.return, f);
                    }
                }
            n & 64 && Hm(s), n & 512 && nn(s, s.return);
            break;
        case 3:
            if (Cs(e, s), n & 64 && (e = s.updateQueue, e !== null)) {
                if (t = null, s.child !== null)
                    switch (s.child.tag) {
                        case 27:
                        case 5:
                            t = s.child.stateNode;
                            break;
                        case 1: t = s.child.stateNode;
                    }
                try {
                    Mf(e, t);
                }
                catch (f) {
                    Ce(s, s.return, f);
                }
            }
            break;
        case 27: t === null && n & 4 && Km(s);
        case 26:
        case 5:
            Cs(e, s), t === null && n & 4 && Qm(s), n & 512 && nn(s, s.return);
            break;
        case 12:
            Cs(e, s);
            break;
        case 31:
            Cs(e, s), n & 4 && Fm(e, s);
            break;
        case 13:
            Cs(e, s), n & 4 && $m(e, s), n & 64 && (e = s.memoizedState, e !== null && (e = e.dehydrated, e !== null && (s = my.bind(null, s), zy(e, s))));
            break;
        case 22:
            if (n = s.memoizedState !== null || ks, !n) {
                t = t !== null && t.memoizedState !== null || Ye, o = ks;
                var u = Ye;
                ks = n, (Ye = t) && !u ? Ts(e, s, (s.subtreeFlags & 8772) !== 0) : Cs(e, s), ks = o, Ye = u;
            }
            break;
        case 30: break;
        default: Cs(e, s);
    } }
    function Zm(e) { var t = e.alternate; t !== null && (e.alternate = null, Zm(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && sc(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null; }
    var De = null, xt = !1;
    function As(e, t, s) { for (s = s.child; s !== null;)
        Jm(e, t, s), s = s.sibling; }
    function Jm(e, t, s) { if (kt && typeof kt.onCommitFiberUnmount == "function")
        try {
            kt.onCommitFiberUnmount(El, s);
        }
        catch { } switch (s.tag) {
        case 26:
            Ye || rs(s, t), As(e, t, s), s.memoizedState ? s.memoizedState.count-- : s.stateNode && (s = s.stateNode, s.parentNode.removeChild(s));
            break;
        case 27:
            Ye || rs(s, t);
            var n = De, o = xt;
            sa(s.type) && (De = s.stateNode, xt = !1), As(e, t, s), pn(s.stateNode), De = n, xt = o;
            break;
        case 5: Ye || rs(s, t);
        case 6:
            if (n = De, o = xt, De = null, As(e, t, s), De = n, xt = o, De !== null)
                if (xt)
                    try {
                        (De.nodeType === 9 ? De.body : De.nodeName === "HTML" ? De.ownerDocument.body : De).removeChild(s.stateNode);
                    }
                    catch (u) {
                        Ce(s, t, u);
                    }
                else
                    try {
                        De.removeChild(s.stateNode);
                    }
                    catch (u) {
                        Ce(s, t, u);
                    }
            break;
        case 18:
            De !== null && (xt ? (e = De, Hh(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, s.stateNode), vl(e)) : Hh(De, s.stateNode));
            break;
        case 4:
            n = De, o = xt, De = s.stateNode.containerInfo, xt = !0, As(e, t, s), De = n, xt = o;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            Fs(2, s, t), Ye || Fs(4, s, t), As(e, t, s);
            break;
        case 1:
            Ye || (rs(s, t), n = s.stateNode, typeof n.componentWillUnmount == "function" && Vm(s, t, n)), As(e, t, s);
            break;
        case 21:
            As(e, t, s);
            break;
        case 22:
            Ye = (n = Ye) || s.memoizedState !== null, As(e, t, s), Ye = n;
            break;
        default: As(e, t, s);
    } }
    function Fm(e, t) { if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
        e = e.dehydrated;
        try {
            vl(e);
        }
        catch (s) {
            Ce(t, t.return, s);
        }
    } }
    function $m(e, t) { if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
        try {
            vl(e);
        }
        catch (s) {
            Ce(t, t.return, s);
        } }
    function ny(e) { switch (e.tag) {
        case 31:
        case 13:
        case 19:
            var t = e.stateNode;
            return t === null && (t = e.stateNode = new Ym), t;
        case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Ym), t;
        default: throw Error(c(435, e.tag));
    } }
    function Mi(e, t) { var s = ny(e); t.forEach(function (n) { if (!s.has(n)) {
        s.add(n);
        var o = hy.bind(null, e, n);
        n.then(o, o);
    } }); }
    function gt(e, t) { var s = t.deletions; if (s !== null)
        for (var n = 0; n < s.length; n++) {
            var o = s[n], u = e, f = t, p = f;
            e: for (; p !== null;) {
                switch (p.tag) {
                    case 27:
                        if (sa(p.type)) {
                            De = p.stateNode, xt = !1;
                            break e;
                        }
                        break;
                    case 5:
                        De = p.stateNode, xt = !1;
                        break e;
                    case 3:
                    case 4:
                        De = p.stateNode.containerInfo, xt = !0;
                        break e;
                }
                p = p.return;
            }
            if (De === null)
                throw Error(c(160));
            Jm(u, f, o), De = null, xt = !1, u = o.alternate, u !== null && (u.return = null), o.return = null;
        } if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null;)
            Wm(t, e), t = t.sibling; }
    var It = null;
    function Wm(e, t) { var s = e.alternate, n = e.flags; switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            gt(t, e), yt(e), n & 4 && (Fs(3, e, e.return), ln(3, e), Fs(5, e, e.return));
            break;
        case 1:
            gt(t, e), yt(e), n & 512 && (Ye || s === null || rs(s, s.return)), n & 64 && ks && (e = e.updateQueue, e !== null && (n = e.callbacks, n !== null && (s = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = s === null ? n : s.concat(n))));
            break;
        case 26:
            var o = It;
            if (gt(t, e), yt(e), n & 512 && (Ye || s === null || rs(s, s.return)), n & 4) {
                var u = s !== null ? s.memoizedState : null;
                if (n = e.memoizedState, s === null)
                    if (n === null)
                        if (e.stateNode === null) {
                            e: {
                                n = e.type, s = e.memoizedProps, o = o.ownerDocument || o;
                                t: switch (n) {
                                    case "title":
                                        u = o.getElementsByTagName("title")[0], (!u || u[Ol] || u[it] || u.namespaceURI === "http://www.w3.org/2000/svg" || u.hasAttribute("itemprop")) && (u = o.createElement(n), o.head.insertBefore(u, o.querySelector("head > title"))), ut(u, n, s), u[it] = e, et(u), n = u;
                                        break e;
                                    case "link":
                                        var f = Wh("link", "href", o).get(n + (s.href || ""));
                                        if (f) {
                                            for (var p = 0; p < f.length; p++)
                                                if (u = f[p], u.getAttribute("href") === (s.href == null || s.href === "" ? null : s.href) && u.getAttribute("rel") === (s.rel == null ? null : s.rel) && u.getAttribute("title") === (s.title == null ? null : s.title) && u.getAttribute("crossorigin") === (s.crossOrigin == null ? null : s.crossOrigin)) {
                                                    f.splice(p, 1);
                                                    break t;
                                                }
                                        }
                                        u = o.createElement(n), ut(u, n, s), o.head.appendChild(u);
                                        break;
                                    case "meta":
                                        if (f = Wh("meta", "content", o).get(n + (s.content || ""))) {
                                            for (p = 0; p < f.length; p++)
                                                if (u = f[p], u.getAttribute("content") === (s.content == null ? null : "" + s.content) && u.getAttribute("name") === (s.name == null ? null : s.name) && u.getAttribute("property") === (s.property == null ? null : s.property) && u.getAttribute("http-equiv") === (s.httpEquiv == null ? null : s.httpEquiv) && u.getAttribute("charset") === (s.charSet == null ? null : s.charSet)) {
                                                    f.splice(p, 1);
                                                    break t;
                                                }
                                        }
                                        u = o.createElement(n), ut(u, n, s), o.head.appendChild(u);
                                        break;
                                    default: throw Error(c(468, n));
                                }
                                u[it] = e, et(u), n = u;
                            }
                            e.stateNode = n;
                        }
                        else
                            Ih(o, e.type, e.stateNode);
                    else
                        e.stateNode = $h(o, n, e.memoizedProps);
                else
                    u !== n ? (u === null ? s.stateNode !== null && (s = s.stateNode, s.parentNode.removeChild(s)) : u.count--, n === null ? Ih(o, e.type, e.stateNode) : $h(o, n, e.memoizedProps)) : n === null && e.stateNode !== null && So(e, e.memoizedProps, s.memoizedProps);
            }
            break;
        case 27:
            gt(t, e), yt(e), n & 512 && (Ye || s === null || rs(s, s.return)), s !== null && n & 4 && So(e, e.memoizedProps, s.memoizedProps);
            break;
        case 5:
            if (gt(t, e), yt(e), n & 512 && (Ye || s === null || rs(s, s.return)), e.flags & 32) {
                o = e.stateNode;
                try {
                    Ga(o, "");
                }
                catch (W) {
                    Ce(e, e.return, W);
                }
            }
            n & 4 && e.stateNode != null && (o = e.memoizedProps, So(e, o, s !== null ? s.memoizedProps : o)), n & 1024 && (Co = !0);
            break;
        case 6:
            if (gt(t, e), yt(e), n & 4) {
                if (e.stateNode === null)
                    throw Error(c(162));
                n = e.memoizedProps, s = e.stateNode;
                try {
                    s.nodeValue = n;
                }
                catch (W) {
                    Ce(e, e.return, W);
                }
            }
            break;
        case 3:
            if (Xi = null, o = It, It = Ki(t.containerInfo), gt(t, e), It = o, yt(e), n & 4 && s !== null && s.memoizedState.isDehydrated)
                try {
                    vl(t.containerInfo);
                }
                catch (W) {
                    Ce(e, e.return, W);
                }
            Co && (Co = !1, Im(e));
            break;
        case 4:
            n = It, It = Ki(e.stateNode.containerInfo), gt(t, e), yt(e), It = n;
            break;
        case 12:
            gt(t, e), yt(e);
            break;
        case 31:
            gt(t, e), yt(e), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, Mi(e, n)));
            break;
        case 13:
            gt(t, e), yt(e), e.child.flags & 8192 && e.memoizedState !== null != (s !== null && s.memoizedState !== null) && (Oi = St()), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, Mi(e, n)));
            break;
        case 22:
            o = e.memoizedState !== null;
            var j = s !== null && s.memoizedState !== null, E = ks, q = Ye;
            if (ks = E || o, Ye = q || j, gt(t, e), Ye = q, ks = E, yt(e), n & 8192)
                e: for (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, o && (s === null || j || ks || Ye || Ma(e)), s = null, t = e;;) {
                    if (t.tag === 5 || t.tag === 26) {
                        if (s === null) {
                            j = s = t;
                            try {
                                if (u = j.stateNode, o)
                                    f = u.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                                else {
                                    p = j.stateNode;
                                    var L = j.memoizedProps.style, M = L != null && L.hasOwnProperty("display") ? L.display : null;
                                    p.style.display = M == null || typeof M == "boolean" ? "" : ("" + M).trim();
                                }
                            }
                            catch (W) {
                                Ce(j, j.return, W);
                            }
                        }
                    }
                    else if (t.tag === 6) {
                        if (s === null) {
                            j = t;
                            try {
                                j.stateNode.nodeValue = o ? "" : j.memoizedProps;
                            }
                            catch (W) {
                                Ce(j, j.return, W);
                            }
                        }
                    }
                    else if (t.tag === 18) {
                        if (s === null) {
                            j = t;
                            try {
                                var D = j.stateNode;
                                o ? Vh(D, !0) : Vh(j.stateNode, !1);
                            }
                            catch (W) {
                                Ce(j, j.return, W);
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
                        s === t && (s = null), t = t.return;
                    }
                    s === t && (s = null), t.sibling.return = t.return, t = t.sibling;
                }
            n & 4 && (n = e.updateQueue, n !== null && (s = n.retryQueue, s !== null && (n.retryQueue = null, Mi(e, s))));
            break;
        case 19:
            gt(t, e), yt(e), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, Mi(e, n)));
            break;
        case 30: break;
        case 21: break;
        default: gt(t, e), yt(e);
    } }
    function yt(e) { var t = e.flags; if (t & 2) {
        try {
            for (var s, n = e.return; n !== null;) {
                if (Gm(n)) {
                    s = n;
                    break;
                }
                n = n.return;
            }
            if (s == null)
                throw Error(c(160));
            switch (s.tag) {
                case 27:
                    var o = s.stateNode, u = ko(e);
                    Ei(e, u, o);
                    break;
                case 5:
                    var f = s.stateNode;
                    s.flags & 32 && (Ga(f, ""), s.flags &= -33);
                    var p = ko(e);
                    Ei(e, p, f);
                    break;
                case 3:
                case 4:
                    var j = s.stateNode.containerInfo, E = ko(e);
                    Ao(e, E, j);
                    break;
                default: throw Error(c(161));
            }
        }
        catch (q) {
            Ce(e, e.return, q);
        }
        e.flags &= -3;
    } t & 4096 && (e.flags &= -4097); }
    function Im(e) { if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null;) {
            var t = e;
            Im(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
        } }
    function Cs(e, t) { if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null;)
            Xm(e, t.alternate, t), t = t.sibling; }
    function Ma(e) { for (e = e.child; e !== null;) {
        var t = e;
        switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                Fs(4, t, t.return), Ma(t);
                break;
            case 1:
                rs(t, t.return);
                var s = t.stateNode;
                typeof s.componentWillUnmount == "function" && Vm(t, t.return, s), Ma(t);
                break;
            case 27: pn(t.stateNode);
            case 26:
            case 5:
                rs(t, t.return), Ma(t);
                break;
            case 22:
                t.memoizedState === null && Ma(t);
                break;
            case 30:
                Ma(t);
                break;
            default: Ma(t);
        }
        e = e.sibling;
    } }
    function Ts(e, t, s) { for (s = s && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null;) {
        var n = t.alternate, o = e, u = t, f = u.flags;
        switch (u.tag) {
            case 0:
            case 11:
            case 15:
                Ts(o, u, s), ln(4, u);
                break;
            case 1:
                if (Ts(o, u, s), n = u, o = n.stateNode, typeof o.componentDidMount == "function")
                    try {
                        o.componentDidMount();
                    }
                    catch (E) {
                        Ce(n, n.return, E);
                    }
                if (n = u, o = n.updateQueue, o !== null) {
                    var p = n.stateNode;
                    try {
                        var j = o.shared.hiddenCallbacks;
                        if (j !== null)
                            for (o.shared.hiddenCallbacks = null, o = 0; o < j.length; o++)
                                Ef(j[o], p);
                    }
                    catch (E) {
                        Ce(n, n.return, E);
                    }
                }
                s && f & 64 && Hm(u), nn(u, u.return);
                break;
            case 27: Km(u);
            case 26:
            case 5:
                Ts(o, u, s), s && n === null && f & 4 && Qm(u), nn(u, u.return);
                break;
            case 12:
                Ts(o, u, s);
                break;
            case 31:
                Ts(o, u, s), s && f & 4 && Fm(o, u);
                break;
            case 13:
                Ts(o, u, s), s && f & 4 && $m(o, u);
                break;
            case 22:
                u.memoizedState === null && Ts(o, u, s), nn(u, u.return);
                break;
            case 30: break;
            default: Ts(o, u, s);
        }
        t = t.sibling;
    } }
    function To(e, t) { var s = null; e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (s = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== s && (e != null && e.refCount++, s != null && Yl(s)); }
    function Eo(e, t) { e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Yl(e)); }
    function Pt(e, t, s, n) { if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;)
            Pm(e, t, s, n), t = t.sibling; }
    function Pm(e, t, s, n) { var o = t.flags; switch (t.tag) {
        case 0:
        case 11:
        case 15:
            Pt(e, t, s, n), o & 2048 && ln(9, t);
            break;
        case 1:
            Pt(e, t, s, n);
            break;
        case 3:
            Pt(e, t, s, n), o & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Yl(e)));
            break;
        case 12:
            if (o & 2048) {
                Pt(e, t, s, n), e = t.stateNode;
                try {
                    var u = t.memoizedProps, f = u.id, p = u.onPostCommit;
                    typeof p == "function" && p(f, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
                }
                catch (j) {
                    Ce(t, t.return, j);
                }
            }
            else
                Pt(e, t, s, n);
            break;
        case 31:
            Pt(e, t, s, n);
            break;
        case 13:
            Pt(e, t, s, n);
            break;
        case 23: break;
        case 22:
            u = t.stateNode, f = t.alternate, t.memoizedState !== null ? u._visibility & 2 ? Pt(e, t, s, n) : rn(e, t) : u._visibility & 2 ? Pt(e, t, s, n) : (u._visibility |= 2, ol(e, t, s, n, (t.subtreeFlags & 10256) !== 0 || !1)), o & 2048 && To(f, t);
            break;
        case 24:
            Pt(e, t, s, n), o & 2048 && Eo(t.alternate, t);
            break;
        default: Pt(e, t, s, n);
    } }
    function ol(e, t, s, n, o) { for (o = o && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null;) {
        var u = e, f = t, p = s, j = n, E = f.flags;
        switch (f.tag) {
            case 0:
            case 11:
            case 15:
                ol(u, f, p, j, o), ln(8, f);
                break;
            case 23: break;
            case 22:
                var q = f.stateNode;
                f.memoizedState !== null ? q._visibility & 2 ? ol(u, f, p, j, o) : rn(u, f) : (q._visibility |= 2, ol(u, f, p, j, o)), o && E & 2048 && To(f.alternate, f);
                break;
            case 24:
                ol(u, f, p, j, o), o && E & 2048 && Eo(f.alternate, f);
                break;
            default: ol(u, f, p, j, o);
        }
        t = t.sibling;
    } }
    function rn(e, t) { if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;) {
            var s = e, n = t, o = n.flags;
            switch (n.tag) {
                case 22:
                    rn(s, n), o & 2048 && To(n.alternate, n);
                    break;
                case 24:
                    rn(s, n), o & 2048 && Eo(n.alternate, n);
                    break;
                default: rn(s, n);
            }
            t = t.sibling;
        } }
    var cn = 8192;
    function ul(e, t, s) { if (e.subtreeFlags & cn)
        for (e = e.child; e !== null;)
            eh(e, t, s), e = e.sibling; }
    function eh(e, t, s) { switch (e.tag) {
        case 26:
            ul(e, t, s), e.flags & cn && e.memoizedState !== null && Yy(s, It, e.memoizedState, e.memoizedProps);
            break;
        case 5:
            ul(e, t, s);
            break;
        case 3:
        case 4:
            var n = It;
            It = Ki(e.stateNode.containerInfo), ul(e, t, s), It = n;
            break;
        case 22:
            e.memoizedState === null && (n = e.alternate, n !== null && n.memoizedState !== null ? (n = cn, cn = 16777216, ul(e, t, s), cn = n) : ul(e, t, s));
            break;
        default: ul(e, t, s);
    } }
    function th(e) { var t = e.alternate; if (t !== null && (e = t.child, e !== null)) {
        t.child = null;
        do
            t = e.sibling, e.sibling = null, e = t;
        while (e !== null);
    } }
    function on(e) { var t = e.deletions; if ((e.flags & 16) !== 0) {
        if (t !== null)
            for (var s = 0; s < t.length; s++) {
                var n = t[s];
                tt = n, ah(n, e);
            }
        th(e);
    } if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null;)
            sh(e), e = e.sibling; }
    function sh(e) { switch (e.tag) {
        case 0:
        case 11:
        case 15:
            on(e), e.flags & 2048 && Fs(9, e, e.return);
            break;
        case 3:
            on(e);
            break;
        case 12:
            on(e);
            break;
        case 22:
            var t = e.stateNode;
            e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, _i(e)) : on(e);
            break;
        default: on(e);
    } }
    function _i(e) { var t = e.deletions; if ((e.flags & 16) !== 0) {
        if (t !== null)
            for (var s = 0; s < t.length; s++) {
                var n = t[s];
                tt = n, ah(n, e);
            }
        th(e);
    } for (e = e.child; e !== null;) {
        switch (t = e, t.tag) {
            case 0:
            case 11:
            case 15:
                Fs(8, t, t.return), _i(t);
                break;
            case 22:
                s = t.stateNode, s._visibility & 2 && (s._visibility &= -3, _i(t));
                break;
            default: _i(t);
        }
        e = e.sibling;
    } }
    function ah(e, t) { for (; tt !== null;) {
        var s = tt;
        switch (s.tag) {
            case 0:
            case 11:
            case 15:
                Fs(8, s, t);
                break;
            case 23:
            case 22:
                if (s.memoizedState !== null && s.memoizedState.cachePool !== null) {
                    var n = s.memoizedState.cachePool.pool;
                    n != null && n.refCount++;
                }
                break;
            case 24: Yl(s.memoizedState.cache);
        }
        if (n = s.child, n !== null)
            n.return = s, tt = n;
        else
            e: for (s = e; tt !== null;) {
                n = tt;
                var o = n.sibling, u = n.return;
                if (Zm(n), n === s) {
                    tt = null;
                    break e;
                }
                if (o !== null) {
                    o.return = u, tt = o;
                    break e;
                }
                tt = u;
            }
    } }
    var iy = { getCacheForType: function (e) { var t = ct(Qe), s = t.data.get(e); return s === void 0 && (s = e(), t.data.set(e, s)), s; }, cacheSignal: function () { return ct(Qe).controller.signal; } }, ry = typeof WeakMap == "function" ? WeakMap : Map, Se = 0, _e = null, fe = null, xe = 0, Ae = 0, _t = null, $s = !1, dl = !1, Mo = !1, Es = 0, Be = 0, Ws = 0, _a = 0, _o = 0, Ot = 0, fl = 0, un = null, bt = null, Oo = !1, Oi = 0, lh = 0, zi = 1 / 0, Di = null, Is = null, Je = 0, Ps = null, ml = null, Ms = 0, zo = 0, Do = null, nh = null, dn = 0, Ro = null;
    function zt() { return (Se & 2) !== 0 && xe !== 0 ? xe & -xe : z.T !== null ? Vo() : vd(); }
    function ih() { if (Ot === 0)
        if ((xe & 536870912) === 0 || be) {
            var e = Qn;
            Qn <<= 1, (Qn & 3932160) === 0 && (Qn = 262144), Ot = e;
        }
        else
            Ot = 536870912; return e = Et.current, e !== null && (e.flags |= 32), Ot; }
    function vt(e, t, s) { (e === _e && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null) && (hl(e, 0), ea(e, xe, Ot, !1)), _l(e, s), ((Se & 2) === 0 || e !== _e) && (e === _e && ((Se & 2) === 0 && (_a |= s), Be === 4 && ea(e, xe, Ot, !1)), cs(e)); }
    function rh(e, t, s) { if ((Se & 6) !== 0)
        throw Error(c(327)); var n = !s && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Ml(e, t), o = n ? uy(e, t) : Bo(e, t, !0), u = n; do {
        if (o === 0) {
            dl && !n && ea(e, t, 0, !1);
            break;
        }
        else {
            if (s = e.current.alternate, u && !cy(s)) {
                o = Bo(e, t, !1), u = !1;
                continue;
            }
            if (o === 2) {
                if (u = t, e.errorRecoveryDisabledLanes & u)
                    var f = 0;
                else
                    f = e.pendingLanes & -536870913, f = f !== 0 ? f : f & 536870912 ? 536870912 : 0;
                if (f !== 0) {
                    t = f;
                    e: {
                        var p = e;
                        o = un;
                        var j = p.current.memoizedState.isDehydrated;
                        if (j && (hl(p, f).flags |= 256), f = Bo(p, f, !1), f !== 2) {
                            if (Mo && !j) {
                                p.errorRecoveryDisabledLanes |= u, _a |= u, o = 4;
                                break e;
                            }
                            u = bt, bt = o, u !== null && (bt === null ? bt = u : bt.push.apply(bt, u));
                        }
                        o = f;
                    }
                    if (u = !1, o !== 2)
                        continue;
                }
            }
            if (o === 1) {
                hl(e, 0), ea(e, t, 0, !0);
                break;
            }
            e: {
                switch (n = e, u = o, u) {
                    case 0:
                    case 1: throw Error(c(345));
                    case 4: if ((t & 4194048) !== t)
                        break;
                    case 6:
                        ea(n, t, Ot, !$s);
                        break e;
                    case 2:
                        bt = null;
                        break;
                    case 3:
                    case 5: break;
                    default: throw Error(c(329));
                }
                if ((t & 62914560) === t && (o = Oi + 300 - St(), 10 < o)) {
                    if (ea(n, t, Ot, !$s), Kn(n, 0, !0) !== 0)
                        break e;
                    Ms = t, n.timeoutHandle = Uh(ch.bind(null, n, s, bt, Di, Oo, t, Ot, _a, fl, $s, u, "Throttled", -0, 0), o);
                    break e;
                }
                ch(n, s, bt, Di, Oo, t, Ot, _a, fl, $s, u, null, -0, 0);
            }
        }
        break;
    } while (!0); cs(e); }
    function ch(e, t, s, n, o, u, f, p, j, E, q, L, M, D) { if (e.timeoutHandle = -1, L = t.subtreeFlags, L & 8192 || (L & 16785408) === 16785408) {
        L = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: !0, waitingForViewTransition: !1, unsuspend: ps }, eh(t, u, L);
        var W = (u & 62914560) === u ? Oi - St() : (u & 4194048) === u ? lh - St() : 0;
        if (W = Xy(L, W), W !== null) {
            Ms = u, e.cancelPendingCommit = W(xh.bind(null, e, t, u, s, n, o, f, p, j, q, L, null, M, D)), ea(e, u, f, !E);
            return;
        }
    } xh(e, t, u, s, n, o, f, p, j); }
    function cy(e) { for (var t = e;;) {
        var s = t.tag;
        if ((s === 0 || s === 11 || s === 15) && t.flags & 16384 && (s = t.updateQueue, s !== null && (s = s.stores, s !== null)))
            for (var n = 0; n < s.length; n++) {
                var o = s[n], u = o.getSnapshot;
                o = o.value;
                try {
                    if (!Ct(u(), o))
                        return !1;
                }
                catch {
                    return !1;
                }
            }
        if (s = t.child, t.subtreeFlags & 16384 && s !== null)
            s.return = t, t = s;
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
    function ea(e, t, s, n) { t &= ~_o, t &= ~_a, e.suspendedLanes |= t, e.pingedLanes &= ~t, n && (e.warmLanes |= t), n = e.expirationTimes; for (var o = t; 0 < o;) {
        var u = 31 - At(o), f = 1 << u;
        n[u] = -1, o &= ~f;
    } s !== 0 && gd(e, s, t); }
    function Ri() { return (Se & 6) === 0 ? (fn(0), !1) : !0; }
    function qo() { if (fe !== null) {
        if (Ae === 0)
            var e = fe.return;
        else
            e = fe, bs = Na = null, Wc(e), ll = null, Zl = 0, e = fe;
        for (; e !== null;)
            Lm(e.alternate, e), e = e.return;
        fe = null;
    } }
    function hl(e, t) { var s = e.timeoutHandle; s !== -1 && (e.timeoutHandle = -1, Ty(s)), s = e.cancelPendingCommit, s !== null && (e.cancelPendingCommit = null, s()), Ms = 0, qo(), _e = e, fe = s = gs(e.current, null), xe = t, Ae = 0, _t = null, $s = !1, dl = Ml(e, t), Mo = !1, fl = Ot = _o = _a = Ws = Be = 0, bt = un = null, Oo = !1, (t & 8) !== 0 && (t |= t & 32); var n = e.entangledLanes; if (n !== 0)
        for (e = e.entanglements, n &= t; 0 < n;) {
            var o = 31 - At(n), u = 1 << o;
            t |= e[o], n &= ~u;
        } return Es = t, si(), s; }
    function oh(e, t) { ne = null, z.H = tn, t === al || t === ui ? (t = kf(), Ae = 3) : t === Lc ? (t = kf(), Ae = 4) : Ae = t === ho ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, _t = t, fe === null && (Be = 1, Si(e, Ht(t, e.current))); }
    function uh() { var e = Et.current; return e === null ? !0 : (xe & 4194048) === xe ? Kt === null : (xe & 62914560) === xe || (xe & 536870912) !== 0 ? e === Kt : !1; }
    function dh() { var e = z.H; return z.H = tn, e === null ? tn : e; }
    function fh() { var e = z.A; return z.A = iy, e; }
    function qi() { Be = 4, $s || (xe & 4194048) !== xe && Et.current !== null || (dl = !0), (Ws & 134217727) === 0 && (_a & 134217727) === 0 || _e === null || ea(_e, xe, Ot, !1); }
    function Bo(e, t, s) { var n = Se; Se |= 2; var o = dh(), u = fh(); (_e !== e || xe !== t) && (Di = null, hl(e, t)), t = !1; var f = Be; e: do
        try {
            if (Ae !== 0 && fe !== null) {
                var p = fe, j = _t;
                switch (Ae) {
                    case 8:
                        qo(), f = 6;
                        break e;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        Et.current === null && (t = !0);
                        var E = Ae;
                        if (Ae = 0, _t = null, pl(e, p, j, E), s && dl) {
                            f = 0;
                            break e;
                        }
                        break;
                    default: E = Ae, Ae = 0, _t = null, pl(e, p, j, E);
                }
            }
            oy(), f = Be;
            break;
        }
        catch (q) {
            oh(e, q);
        }
    while (!0); return t && e.shellSuspendCounter++, bs = Na = null, Se = n, z.H = o, z.A = u, fe === null && (_e = null, xe = 0, si()), f; }
    function oy() { for (; fe !== null;)
        mh(fe); }
    function uy(e, t) { var s = Se; Se |= 2; var n = dh(), o = fh(); _e !== e || xe !== t ? (Di = null, zi = St() + 500, hl(e, t)) : dl = Ml(e, t); e: do
        try {
            if (Ae !== 0 && fe !== null) {
                t = fe;
                var u = _t;
                t: switch (Ae) {
                    case 1:
                        Ae = 0, _t = null, pl(e, t, u, 1);
                        break;
                    case 2:
                    case 9:
                        if (wf(u)) {
                            Ae = 0, _t = null, hh(t);
                            break;
                        }
                        t = function () { Ae !== 2 && Ae !== 9 || _e !== e || (Ae = 7), cs(e); }, u.then(t, t);
                        break e;
                    case 3:
                        Ae = 7;
                        break e;
                    case 4:
                        Ae = 5;
                        break e;
                    case 7:
                        wf(u) ? (Ae = 0, _t = null, hh(t)) : (Ae = 0, _t = null, pl(e, t, u, 7));
                        break;
                    case 5:
                        var f = null;
                        switch (fe.tag) {
                            case 26: f = fe.memoizedState;
                            case 5:
                            case 27:
                                var p = fe;
                                if (f ? Ph(f) : p.stateNode.complete) {
                                    Ae = 0, _t = null;
                                    var j = p.sibling;
                                    if (j !== null)
                                        fe = j;
                                    else {
                                        var E = p.return;
                                        E !== null ? (fe = E, Bi(E)) : fe = null;
                                    }
                                    break t;
                                }
                        }
                        Ae = 0, _t = null, pl(e, t, u, 5);
                        break;
                    case 6:
                        Ae = 0, _t = null, pl(e, t, u, 6);
                        break;
                    case 8:
                        qo(), Be = 6;
                        break e;
                    default: throw Error(c(462));
                }
            }
            dy();
            break;
        }
        catch (q) {
            oh(e, q);
        }
    while (!0); return bs = Na = null, z.H = n, z.A = o, Se = s, fe !== null ? 0 : (_e = null, xe = 0, si(), Be); }
    function dy() { for (; fe !== null && !Dg();)
        mh(fe); }
    function mh(e) { var t = Bm(e.alternate, e, Es); e.memoizedProps = e.pendingProps, t === null ? Bi(e) : fe = t; }
    function hh(e) { var t = e, s = t.alternate; switch (t.tag) {
        case 15:
        case 0:
            t = _m(s, t, t.pendingProps, t.type, void 0, xe);
            break;
        case 11:
            t = _m(s, t, t.pendingProps, t.type.render, t.ref, xe);
            break;
        case 5: Wc(t);
        default: Lm(s, t), t = fe = ff(t, Es), t = Bm(s, t, Es);
    } e.memoizedProps = e.pendingProps, t === null ? Bi(e) : fe = t; }
    function pl(e, t, s, n) { bs = Na = null, Wc(t), ll = null, Zl = 0; var o = t.return; try {
        if (P0(e, o, t, s, xe)) {
            Be = 1, Si(e, Ht(s, e.current)), fe = null;
            return;
        }
    }
    catch (u) {
        if (o !== null)
            throw fe = o, u;
        Be = 1, Si(e, Ht(s, e.current)), fe = null;
        return;
    } t.flags & 32768 ? (be || n === 1 ? e = !0 : dl || (xe & 536870912) !== 0 ? e = !1 : ($s = e = !0, (n === 2 || n === 9 || n === 3 || n === 6) && (n = Et.current, n !== null && n.tag === 13 && (n.flags |= 16384))), ph(t, e)) : Bi(t); }
    function Bi(e) { var t = e; do {
        if ((t.flags & 32768) !== 0) {
            ph(t, $s);
            return;
        }
        e = t.return;
        var s = sy(t.alternate, t, Es);
        if (s !== null) {
            fe = s;
            return;
        }
        if (t = t.sibling, t !== null) {
            fe = t;
            return;
        }
        fe = t = e;
    } while (t !== null); Be === 0 && (Be = 5); }
    function ph(e, t) { do {
        var s = ay(e.alternate, e);
        if (s !== null) {
            s.flags &= 32767, fe = s;
            return;
        }
        if (s = e.return, s !== null && (s.flags |= 32768, s.subtreeFlags = 0, s.deletions = null), !t && (e = e.sibling, e !== null)) {
            fe = e;
            return;
        }
        fe = e = s;
    } while (e !== null); Be = 6, fe = null; }
    function xh(e, t, s, n, o, u, f, p, j) { e.cancelPendingCommit = null; do
        Ui();
    while (Je !== 0); if ((Se & 6) !== 0)
        throw Error(c(327)); if (t !== null) {
        if (t === e.current)
            throw Error(c(177));
        if (u = t.lanes | t.childLanes, u |= Sc, Kg(e, s, u, f, p, j), e === _e && (fe = _e = null, xe = 0), ml = t, Ps = e, Ms = s, zo = u, Do = o, nh = n, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, py(Hn, function () { return jh(), null; })) : (e.callbackNode = null, e.callbackPriority = 0), n = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || n) {
            n = z.T, z.T = null, o = Z.p, Z.p = 2, f = Se, Se |= 4;
            try {
                ly(e, t, s);
            }
            finally {
                Se = f, Z.p = o, z.T = n;
            }
        }
        Je = 1, gh(), yh(), bh();
    } }
    function gh() { if (Je === 1) {
        Je = 0;
        var e = Ps, t = ml, s = (t.flags & 13878) !== 0;
        if ((t.subtreeFlags & 13878) !== 0 || s) {
            s = z.T, z.T = null;
            var n = Z.p;
            Z.p = 2;
            var o = Se;
            Se |= 4;
            try {
                Wm(t, e);
                var u = Fo, f = sf(e.containerInfo), p = u.focusedElem, j = u.selectionRange;
                if (f !== p && p && p.ownerDocument && tf(p.ownerDocument.documentElement, p)) {
                    if (j !== null && bc(p)) {
                        var E = j.start, q = j.end;
                        if (q === void 0 && (q = E), "selectionStart" in p)
                            p.selectionStart = E, p.selectionEnd = Math.min(q, p.value.length);
                        else {
                            var L = p.ownerDocument || document, M = L && L.defaultView || window;
                            if (M.getSelection) {
                                var D = M.getSelection(), W = p.textContent.length, se = Math.min(j.start, W), Me = j.end === void 0 ? se : Math.min(j.end, W);
                                !D.extend && se > Me && (f = Me, Me = se, se = f);
                                var k = ef(p, se), w = ef(p, Me);
                                if (k && w && (D.rangeCount !== 1 || D.anchorNode !== k.node || D.anchorOffset !== k.offset || D.focusNode !== w.node || D.focusOffset !== w.offset)) {
                                    var T = L.createRange();
                                    T.setStart(k.node, k.offset), D.removeAllRanges(), se > Me ? (D.addRange(T), D.extend(w.node, w.offset)) : (T.setEnd(w.node, w.offset), D.addRange(T));
                                }
                            }
                        }
                    }
                    for (L = [], D = p; D = D.parentNode;)
                        D.nodeType === 1 && L.push({ element: D, left: D.scrollLeft, top: D.scrollTop });
                    for (typeof p.focus == "function" && p.focus(), p = 0; p < L.length; p++) {
                        var B = L[p];
                        B.element.scrollLeft = B.left, B.element.scrollTop = B.top;
                    }
                }
                $i = !!Jo, Fo = Jo = null;
            }
            finally {
                Se = o, Z.p = n, z.T = s;
            }
        }
        e.current = t, Je = 2;
    } }
    function yh() { if (Je === 2) {
        Je = 0;
        var e = Ps, t = ml, s = (t.flags & 8772) !== 0;
        if ((t.subtreeFlags & 8772) !== 0 || s) {
            s = z.T, z.T = null;
            var n = Z.p;
            Z.p = 2;
            var o = Se;
            Se |= 4;
            try {
                Xm(e, t.alternate, t);
            }
            finally {
                Se = o, Z.p = n, z.T = s;
            }
        }
        Je = 3;
    } }
    function bh() { if (Je === 4 || Je === 3) {
        Je = 0, Rg();
        var e = Ps, t = ml, s = Ms, n = nh;
        (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Je = 5 : (Je = 0, ml = Ps = null, vh(e, e.pendingLanes));
        var o = e.pendingLanes;
        if (o === 0 && (Is = null), ec(s), t = t.stateNode, kt && typeof kt.onCommitFiberRoot == "function")
            try {
                kt.onCommitFiberRoot(El, t, void 0, (t.current.flags & 128) === 128);
            }
            catch { }
        if (n !== null) {
            t = z.T, o = Z.p, Z.p = 2, z.T = null;
            try {
                for (var u = e.onRecoverableError, f = 0; f < n.length; f++) {
                    var p = n[f];
                    u(p.value, { componentStack: p.stack });
                }
            }
            finally {
                z.T = t, Z.p = o;
            }
        }
        (Ms & 3) !== 0 && Ui(), cs(e), o = e.pendingLanes, (s & 261930) !== 0 && (o & 42) !== 0 ? e === Ro ? dn++ : (dn = 0, Ro = e) : dn = 0, fn(0);
    } }
    function vh(e, t) { (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Yl(t))); }
    function Ui() { return gh(), yh(), bh(), jh(); }
    function jh() { if (Je !== 5)
        return !1; var e = Ps, t = zo; zo = 0; var s = ec(Ms), n = z.T, o = Z.p; try {
        Z.p = 32 > s ? 32 : s, z.T = null, s = Do, Do = null;
        var u = Ps, f = Ms;
        if (Je = 0, ml = Ps = null, Ms = 0, (Se & 6) !== 0)
            throw Error(c(331));
        var p = Se;
        if (Se |= 4, sh(u.current), Pm(u, u.current, f, s), Se = p, fn(0, !1), kt && typeof kt.onPostCommitFiberRoot == "function")
            try {
                kt.onPostCommitFiberRoot(El, u);
            }
            catch { }
        return !0;
    }
    finally {
        Z.p = o, z.T = n, vh(e, t);
    } }
    function Nh(e, t, s) { t = Ht(s, t), t = mo(e.stateNode, t, 2), e = Xs(e, t, 2), e !== null && (_l(e, 2), cs(e)); }
    function Ce(e, t, s) { if (e.tag === 3)
        Nh(e, e, s);
    else
        for (; t !== null;) {
            if (t.tag === 3) {
                Nh(t, e, s);
                break;
            }
            else if (t.tag === 1) {
                var n = t.stateNode;
                if (typeof t.type.getDerivedStateFromError == "function" || typeof n.componentDidCatch == "function" && (Is === null || !Is.has(n))) {
                    e = Ht(s, e), s = wm(2), n = Xs(t, s, 2), n !== null && (Sm(s, n, t, e), _l(n, 2), cs(n));
                    break;
                }
            }
            t = t.return;
        } }
    function Uo(e, t, s) { var n = e.pingCache; if (n === null) {
        n = e.pingCache = new ry;
        var o = new Set;
        n.set(t, o);
    }
    else
        o = n.get(t), o === void 0 && (o = new Set, n.set(t, o)); o.has(s) || (Mo = !0, o.add(s), e = fy.bind(null, e, t, s), t.then(e, e)); }
    function fy(e, t, s) { var n = e.pingCache; n !== null && n.delete(t), e.pingedLanes |= e.suspendedLanes & s, e.warmLanes &= ~s, _e === e && (xe & s) === s && (Be === 4 || Be === 3 && (xe & 62914560) === xe && 300 > St() - Oi ? (Se & 2) === 0 && hl(e, 0) : _o |= s, fl === xe && (fl = 0)), cs(e); }
    function wh(e, t) { t === 0 && (t = xd()), e = ba(e, t), e !== null && (_l(e, t), cs(e)); }
    function my(e) { var t = e.memoizedState, s = 0; t !== null && (s = t.retryLane), wh(e, s); }
    function hy(e, t) { var s = 0; switch (e.tag) {
        case 31:
        case 13:
            var n = e.stateNode, o = e.memoizedState;
            o !== null && (s = o.retryLane);
            break;
        case 19:
            n = e.stateNode;
            break;
        case 22:
            n = e.stateNode._retryCache;
            break;
        default: throw Error(c(314));
    } n !== null && n.delete(t), wh(e, s); }
    function py(e, t) { return $r(e, t); }
    var Li = null, xl = null, Lo = !1, Hi = !1, Ho = !1, ta = 0;
    function cs(e) { e !== xl && e.next === null && (xl === null ? Li = xl = e : xl = xl.next = e), Hi = !0, Lo || (Lo = !0, gy()); }
    function fn(e, t) { if (!Ho && Hi) {
        Ho = !0;
        do
            for (var s = !1, n = Li; n !== null;) {
                if (e !== 0) {
                    var o = n.pendingLanes;
                    if (o === 0)
                        var u = 0;
                    else {
                        var f = n.suspendedLanes, p = n.pingedLanes;
                        u = (1 << 31 - At(42 | e) + 1) - 1, u &= o & ~(f & ~p), u = u & 201326741 ? u & 201326741 | 1 : u ? u | 2 : 0;
                    }
                    u !== 0 && (s = !0, Ch(n, u));
                }
                else
                    u = xe, u = Kn(n, n === _e ? u : 0, n.cancelPendingCommit !== null || n.timeoutHandle !== -1), (u & 3) === 0 || Ml(n, u) || (s = !0, Ch(n, u));
                n = n.next;
            }
        while (s);
        Ho = !1;
    } }
    function xy() { Sh(); }
    function Sh() { Hi = Lo = !1; var e = 0; ta !== 0 && Cy() && (e = ta); for (var t = St(), s = null, n = Li; n !== null;) {
        var o = n.next, u = kh(n, t);
        u === 0 ? (n.next = null, s === null ? Li = o : s.next = o, o === null && (xl = s)) : (s = n, (e !== 0 || (u & 3) !== 0) && (Hi = !0)), n = o;
    } Je !== 0 && Je !== 5 || fn(e), ta !== 0 && (ta = 0); }
    function kh(e, t) { for (var s = e.suspendedLanes, n = e.pingedLanes, o = e.expirationTimes, u = e.pendingLanes & -62914561; 0 < u;) {
        var f = 31 - At(u), p = 1 << f, j = o[f];
        j === -1 ? ((p & s) === 0 || (p & n) !== 0) && (o[f] = Gg(p, t)) : j <= t && (e.expiredLanes |= p), u &= ~p;
    } if (t = _e, s = xe, s = Kn(e, e === t ? s : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), n = e.callbackNode, s === 0 || e === t && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null)
        return n !== null && n !== null && Wr(n), e.callbackNode = null, e.callbackPriority = 0; if ((s & 3) === 0 || Ml(e, s)) {
        if (t = s & -s, t === e.callbackPriority)
            return t;
        switch (n !== null && Wr(n), ec(s)) {
            case 2:
            case 8:
                s = hd;
                break;
            case 32:
                s = Hn;
                break;
            case 268435456:
                s = pd;
                break;
            default: s = Hn;
        }
        return n = Ah.bind(null, e), s = $r(s, n), e.callbackPriority = t, e.callbackNode = s, t;
    } return n !== null && n !== null && Wr(n), e.callbackPriority = 2, e.callbackNode = null, 2; }
    function Ah(e, t) { if (Je !== 0 && Je !== 5)
        return e.callbackNode = null, e.callbackPriority = 0, null; var s = e.callbackNode; if (Ui() && e.callbackNode !== s)
        return null; var n = xe; return n = Kn(e, e === _e ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), n === 0 ? null : (rh(e, n, t), kh(e, St()), e.callbackNode != null && e.callbackNode === s ? Ah.bind(null, e) : null); }
    function Ch(e, t) { if (Ui())
        return null; rh(e, t, !0); }
    function gy() { Ey(function () { (Se & 6) !== 0 ? $r(md, xy) : Sh(); }); }
    function Vo() { if (ta === 0) {
        var e = tl;
        e === 0 && (e = Vn, Vn <<= 1, (Vn & 261888) === 0 && (Vn = 256)), ta = e;
    } return ta; }
    function Th(e) { return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Jn("" + e); }
    function Eh(e, t) { var s = t.ownerDocument.createElement("input"); return s.name = t.name, s.value = t.value, e.id && s.setAttribute("form", e.id), t.parentNode.insertBefore(s, t), e = new FormData(e), s.parentNode.removeChild(s), e; }
    function yy(e, t, s, n, o) { if (t === "submit" && s && s.stateNode === o) {
        var u = Th((o[ht] || null).action), f = n.submitter;
        f && (t = (t = f[ht] || null) ? Th(t.formAction) : f.getAttribute("formAction"), t !== null && (u = t, f = null));
        var p = new In("action", "action", null, n, o);
        e.push({ event: p, listeners: [{ instance: null, listener: function () { if (n.defaultPrevented) {
                        if (ta !== 0) {
                            var j = f ? Eh(o, f) : new FormData(o);
                            io(s, { pending: !0, data: j, method: o.method, action: u }, null, j);
                        }
                    }
                    else
                        typeof u == "function" && (p.preventDefault(), j = f ? Eh(o, f) : new FormData(o), io(s, { pending: !0, data: j, method: o.method, action: u }, u, j)); }, currentTarget: o }] });
    } }
    for (var Qo = 0; Qo < wc.length; Qo++) {
        var Go = wc[Qo], by = Go.toLowerCase(), vy = Go[0].toUpperCase() + Go.slice(1);
        Wt(by, "on" + vy);
    }
    Wt(nf, "onAnimationEnd"), Wt(rf, "onAnimationIteration"), Wt(cf, "onAnimationStart"), Wt("dblclick", "onDoubleClick"), Wt("focusin", "onFocus"), Wt("focusout", "onBlur"), Wt(q0, "onTransitionRun"), Wt(B0, "onTransitionStart"), Wt(U0, "onTransitionCancel"), Wt(of, "onTransitionEnd"), Va("onMouseEnter", ["mouseout", "mouseover"]), Va("onMouseLeave", ["mouseout", "mouseover"]), Va("onPointerEnter", ["pointerout", "pointerover"]), Va("onPointerLeave", ["pointerout", "pointerover"]), pa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), pa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), pa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), pa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), pa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), pa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var mn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), jy = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mn));
    function Mh(e, t) { t = (t & 4) !== 0; for (var s = 0; s < e.length; s++) {
        var n = e[s], o = n.event;
        n = n.listeners;
        e: {
            var u = void 0;
            if (t)
                for (var f = n.length - 1; 0 <= f; f--) {
                    var p = n[f], j = p.instance, E = p.currentTarget;
                    if (p = p.listener, j !== u && o.isPropagationStopped())
                        break e;
                    u = p, o.currentTarget = E;
                    try {
                        u(o);
                    }
                    catch (q) {
                        ti(q);
                    }
                    o.currentTarget = null, u = j;
                }
            else
                for (f = 0; f < n.length; f++) {
                    if (p = n[f], j = p.instance, E = p.currentTarget, p = p.listener, j !== u && o.isPropagationStopped())
                        break e;
                    u = p, o.currentTarget = E;
                    try {
                        u(o);
                    }
                    catch (q) {
                        ti(q);
                    }
                    o.currentTarget = null, u = j;
                }
        }
    } }
    function me(e, t) { var s = t[tc]; s === void 0 && (s = t[tc] = new Set); var n = e + "__bubble"; s.has(n) || (_h(t, e, 2, !1), s.add(n)); }
    function Ko(e, t, s) { var n = 0; t && (n |= 4), _h(s, e, n, t); }
    var Vi = "_reactListening" + Math.random().toString(36).slice(2);
    function Yo(e) { if (!e[Vi]) {
        e[Vi] = !0, wd.forEach(function (s) { s !== "selectionchange" && (jy.has(s) || Ko(s, !1, e), Ko(s, !0, e)); });
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[Vi] || (t[Vi] = !0, Ko("selectionchange", !1, t));
    } }
    function _h(e, t, s, n) { switch (ip(t)) {
        case 2:
            var o = Fy;
            break;
        case 8:
            o = $y;
            break;
        default: o = iu;
    } s = o.bind(null, t, s, e), o = void 0, !uc || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), n ? o !== void 0 ? e.addEventListener(t, s, { capture: !0, passive: o }) : e.addEventListener(t, s, !0) : o !== void 0 ? e.addEventListener(t, s, { passive: o }) : e.addEventListener(t, s, !1); }
    function Xo(e, t, s, n, o) { var u = n; if ((t & 1) === 0 && (t & 2) === 0 && n !== null)
        e: for (;;) {
            if (n === null)
                return;
            var f = n.tag;
            if (f === 3 || f === 4) {
                var p = n.stateNode.containerInfo;
                if (p === o)
                    break;
                if (f === 4)
                    for (f = n.return; f !== null;) {
                        var j = f.tag;
                        if ((j === 3 || j === 4) && f.stateNode.containerInfo === o)
                            return;
                        f = f.return;
                    }
                for (; p !== null;) {
                    if (f = Ua(p), f === null)
                        return;
                    if (j = f.tag, j === 5 || j === 6 || j === 26 || j === 27) {
                        n = u = f;
                        continue e;
                    }
                    p = p.parentNode;
                }
            }
            n = n.return;
        } Rd(function () { var E = u, q = cc(s), L = []; e: {
        var M = uf.get(e);
        if (M !== void 0) {
            var D = In, W = e;
            switch (e) {
                case "keypress": if ($n(s) === 0)
                    break e;
                case "keydown":
                case "keyup":
                    D = h0;
                    break;
                case "focusin":
                    W = "focus", D = hc;
                    break;
                case "focusout":
                    W = "blur", D = hc;
                    break;
                case "beforeblur":
                case "afterblur":
                    D = hc;
                    break;
                case "click": if (s.button === 2)
                    break e;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                    D = Ud;
                    break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                    D = s0;
                    break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                    D = g0;
                    break;
                case nf:
                case rf:
                case cf:
                    D = n0;
                    break;
                case of:
                    D = b0;
                    break;
                case "scroll":
                case "scrollend":
                    D = e0;
                    break;
                case "wheel":
                    D = j0;
                    break;
                case "copy":
                case "cut":
                case "paste":
                    D = r0;
                    break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                    D = Hd;
                    break;
                case "toggle":
                case "beforetoggle": D = w0;
            }
            var se = (t & 4) !== 0, Me = !se && (e === "scroll" || e === "scrollend"), k = se ? M !== null ? M + "Capture" : null : M;
            se = [];
            for (var w = E, T; w !== null;) {
                var B = w;
                if (T = B.stateNode, B = B.tag, B !== 5 && B !== 26 && B !== 27 || T === null || k === null || (B = Dl(w, k), B != null && se.push(hn(w, B, T))), Me)
                    break;
                w = w.return;
            }
            0 < se.length && (M = new D(M, W, null, s, q), L.push({ event: M, listeners: se }));
        }
    } if ((t & 7) === 0) {
        e: {
            if (M = e === "mouseover" || e === "pointerover", D = e === "mouseout" || e === "pointerout", M && s !== rc && (W = s.relatedTarget || s.fromElement) && (Ua(W) || W[Ba]))
                break e;
            if ((D || M) && (M = q.window === q ? q : (M = q.ownerDocument) ? M.defaultView || M.parentWindow : window, D ? (W = s.relatedTarget || s.toElement, D = E, W = W ? Ua(W) : null, W !== null && (Me = m(W), se = W.tag, W !== Me || se !== 5 && se !== 27 && se !== 6) && (W = null)) : (D = null, W = E), D !== W)) {
                if (se = Ud, B = "onMouseLeave", k = "onMouseEnter", w = "mouse", (e === "pointerout" || e === "pointerover") && (se = Hd, B = "onPointerLeave", k = "onPointerEnter", w = "pointer"), Me = D == null ? M : zl(D), T = W == null ? M : zl(W), M = new se(B, w + "leave", D, s, q), M.target = Me, M.relatedTarget = T, B = null, Ua(q) === E && (se = new se(k, w + "enter", W, s, q), se.target = T, se.relatedTarget = Me, B = se), Me = B, D && W)
                    t: {
                        for (se = Ny, k = D, w = W, T = 0, B = k; B; B = se(B))
                            T++;
                        B = 0;
                        for (var te = w; te; te = se(te))
                            B++;
                        for (; 0 < T - B;)
                            k = se(k), T--;
                        for (; 0 < B - T;)
                            w = se(w), B--;
                        for (; T--;) {
                            if (k === w || w !== null && k === w.alternate) {
                                se = k;
                                break t;
                            }
                            k = se(k), w = se(w);
                        }
                        se = null;
                    }
                else
                    se = null;
                D !== null && Oh(L, M, D, se, !1), W !== null && Me !== null && Oh(L, Me, W, se, !0);
            }
        }
        e: {
            if (M = E ? zl(E) : window, D = M.nodeName && M.nodeName.toLowerCase(), D === "select" || D === "input" && M.type === "file")
                var Ne = Jd;
            else if (Xd(M))
                if (Fd)
                    Ne = z0;
                else {
                    Ne = _0;
                    var ee = M0;
                }
            else
                D = M.nodeName, !D || D.toLowerCase() !== "input" || M.type !== "checkbox" && M.type !== "radio" ? E && ic(E.elementType) && (Ne = Jd) : Ne = O0;
            if (Ne && (Ne = Ne(e, E))) {
                Zd(L, Ne, s, q);
                break e;
            }
            ee && ee(e, M, E), e === "focusout" && E && M.type === "number" && E.memoizedProps.value != null && nc(M, "number", M.value);
        }
        switch (ee = E ? zl(E) : window, e) {
            case "focusin":
                (Xd(ee) || ee.contentEditable === "true") && (Za = ee, vc = E, Ql = null);
                break;
            case "focusout":
                Ql = vc = Za = null;
                break;
            case "mousedown":
                jc = !0;
                break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
                jc = !1, af(L, s, q);
                break;
            case "selectionchange": if (R0)
                break;
            case "keydown":
            case "keyup": af(L, s, q);
        }
        var re;
        if (xc)
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
            Xa ? Kd(e, s) && (ge = "onCompositionEnd") : e === "keydown" && s.keyCode === 229 && (ge = "onCompositionStart");
        ge && (Vd && s.locale !== "ko" && (Xa || ge !== "onCompositionStart" ? ge === "onCompositionEnd" && Xa && (re = qd()) : (Ls = q, dc = "value" in Ls ? Ls.value : Ls.textContent, Xa = !0)), ee = Qi(E, ge), 0 < ee.length && (ge = new Ld(ge, e, null, s, q), L.push({ event: ge, listeners: ee }), re ? ge.data = re : (re = Yd(s), re !== null && (ge.data = re)))), (re = k0 ? A0(e, s) : C0(e, s)) && (ge = Qi(E, "onBeforeInput"), 0 < ge.length && (ee = new Ld("onBeforeInput", "beforeinput", null, s, q), L.push({ event: ee, listeners: ge }), ee.data = re)), yy(L, e, E, s, q);
    } Mh(L, t); }); }
    function hn(e, t, s) { return { instance: e, listener: t, currentTarget: s }; }
    function Qi(e, t) { for (var s = t + "Capture", n = []; e !== null;) {
        var o = e, u = o.stateNode;
        if (o = o.tag, o !== 5 && o !== 26 && o !== 27 || u === null || (o = Dl(e, s), o != null && n.unshift(hn(e, o, u)), o = Dl(e, t), o != null && n.push(hn(e, o, u))), e.tag === 3)
            return n;
        e = e.return;
    } return []; }
    function Ny(e) { if (e === null)
        return null; do
        e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27); return e || null; }
    function Oh(e, t, s, n, o) { for (var u = t._reactName, f = []; s !== null && s !== n;) {
        var p = s, j = p.alternate, E = p.stateNode;
        if (p = p.tag, j !== null && j === n)
            break;
        p !== 5 && p !== 26 && p !== 27 || E === null || (j = E, o ? (E = Dl(s, u), E != null && f.unshift(hn(s, E, j))) : o || (E = Dl(s, u), E != null && f.push(hn(s, E, j)))), s = s.return;
    } f.length !== 0 && e.push({ event: t, listeners: f }); }
    var wy = /\r\n?/g, Sy = /\u0000|\uFFFD/g;
    function zh(e) {
        return (typeof e == "string" ? e : "" + e).replace(wy, `
`).replace(Sy, "");
    }
    function Dh(e, t) { return t = zh(t), zh(e) === t; }
    function Ee(e, t, s, n, o, u) { switch (s) {
        case "children":
            typeof n == "string" ? t === "body" || t === "textarea" && n === "" || Ga(e, n) : (typeof n == "number" || typeof n == "bigint") && t !== "body" && Ga(e, "" + n);
            break;
        case "className":
            Xn(e, "class", n);
            break;
        case "tabIndex":
            Xn(e, "tabindex", n);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            Xn(e, s, n);
            break;
        case "style":
            zd(e, n, u);
            break;
        case "data": if (t !== "object") {
            Xn(e, "data", n);
            break;
        }
        case "src":
        case "href":
            if (n === "" && (t !== "a" || s !== "href")) {
                e.removeAttribute(s);
                break;
            }
            if (n == null || typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") {
                e.removeAttribute(s);
                break;
            }
            n = Jn("" + n), e.setAttribute(s, n);
            break;
        case "action":
        case "formAction":
            if (typeof n == "function") {
                e.setAttribute(s, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                break;
            }
            else
                typeof u == "function" && (s === "formAction" ? (t !== "input" && Ee(e, t, "name", o.name, o, null), Ee(e, t, "formEncType", o.formEncType, o, null), Ee(e, t, "formMethod", o.formMethod, o, null), Ee(e, t, "formTarget", o.formTarget, o, null)) : (Ee(e, t, "encType", o.encType, o, null), Ee(e, t, "method", o.method, o, null), Ee(e, t, "target", o.target, o, null)));
            if (n == null || typeof n == "symbol" || typeof n == "boolean") {
                e.removeAttribute(s);
                break;
            }
            n = Jn("" + n), e.setAttribute(s, n);
            break;
        case "onClick":
            n != null && (e.onclick = ps);
            break;
        case "onScroll":
            n != null && me("scroll", e);
            break;
        case "onScrollEnd":
            n != null && me("scrollend", e);
            break;
        case "dangerouslySetInnerHTML":
            if (n != null) {
                if (typeof n != "object" || !("__html" in n))
                    throw Error(c(61));
                if (s = n.__html, s != null) {
                    if (o.children != null)
                        throw Error(c(60));
                    e.innerHTML = s;
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
            s = Jn("" + n), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", s);
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            n != null && typeof n != "function" && typeof n != "symbol" ? e.setAttribute(s, "" + n) : e.removeAttribute(s);
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
            n && typeof n != "function" && typeof n != "symbol" ? e.setAttribute(s, "") : e.removeAttribute(s);
            break;
        case "capture":
        case "download":
            n === !0 ? e.setAttribute(s, "") : n !== !1 && n != null && typeof n != "function" && typeof n != "symbol" ? e.setAttribute(s, n) : e.removeAttribute(s);
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            n != null && typeof n != "function" && typeof n != "symbol" && !isNaN(n) && 1 <= n ? e.setAttribute(s, n) : e.removeAttribute(s);
            break;
        case "rowSpan":
        case "start":
            n == null || typeof n == "function" || typeof n == "symbol" || isNaN(n) ? e.removeAttribute(s) : e.setAttribute(s, n);
            break;
        case "popover":
            me("beforetoggle", e), me("toggle", e), Yn(e, "popover", n);
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
            Yn(e, "is", n);
            break;
        case "innerText":
        case "textContent": break;
        default: (!(2 < s.length) || s[0] !== "o" && s[0] !== "O" || s[1] !== "n" && s[1] !== "N") && (s = Ig.get(s) || s, Yn(e, s, n));
    } }
    function Zo(e, t, s, n, o, u) { switch (s) {
        case "style":
            zd(e, n, u);
            break;
        case "dangerouslySetInnerHTML":
            if (n != null) {
                if (typeof n != "object" || !("__html" in n))
                    throw Error(c(61));
                if (s = n.__html, s != null) {
                    if (o.children != null)
                        throw Error(c(60));
                    e.innerHTML = s;
                }
            }
            break;
        case "children":
            typeof n == "string" ? Ga(e, n) : (typeof n == "number" || typeof n == "bigint") && Ga(e, "" + n);
            break;
        case "onScroll":
            n != null && me("scroll", e);
            break;
        case "onScrollEnd":
            n != null && me("scrollend", e);
            break;
        case "onClick":
            n != null && (e.onclick = ps);
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref": break;
        case "innerText":
        case "textContent": break;
        default: if (!Sd.hasOwnProperty(s))
            e: {
                if (s[0] === "o" && s[1] === "n" && (o = s.endsWith("Capture"), t = s.slice(2, o ? s.length - 7 : void 0), u = e[ht] || null, u = u != null ? u[s] : null, typeof u == "function" && e.removeEventListener(t, u, o), typeof n == "function")) {
                    typeof u != "function" && u !== null && (s in e ? e[s] = null : e.hasAttribute(s) && e.removeAttribute(s)), e.addEventListener(t, n, o);
                    break e;
                }
                s in e ? e[s] = n : n === !0 ? e.setAttribute(s, "") : Yn(e, s, n);
            }
    } }
    function ut(e, t, s) { switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "img":
            me("error", e), me("load", e);
            var n = !1, o = !1, u;
            for (u in s)
                if (s.hasOwnProperty(u)) {
                    var f = s[u];
                    if (f != null)
                        switch (u) {
                            case "src":
                                n = !0;
                                break;
                            case "srcSet":
                                o = !0;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML": throw Error(c(137, t));
                            default: Ee(e, t, u, f, s, null);
                        }
                }
            o && Ee(e, t, "srcSet", s.srcSet, s, null), n && Ee(e, t, "src", s.src, s, null);
            return;
        case "input":
            me("invalid", e);
            var p = u = f = o = null, j = null, E = null;
            for (n in s)
                if (s.hasOwnProperty(n)) {
                    var q = s[n];
                    if (q != null)
                        switch (n) {
                            case "name":
                                o = q;
                                break;
                            case "type":
                                f = q;
                                break;
                            case "checked":
                                j = q;
                                break;
                            case "defaultChecked":
                                E = q;
                                break;
                            case "value":
                                u = q;
                                break;
                            case "defaultValue":
                                p = q;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML":
                                if (q != null)
                                    throw Error(c(137, t));
                                break;
                            default: Ee(e, t, n, q, s, null);
                        }
                }
            Ed(e, u, p, j, E, f, o, !1);
            return;
        case "select":
            me("invalid", e), n = f = u = null;
            for (o in s)
                if (s.hasOwnProperty(o) && (p = s[o], p != null))
                    switch (o) {
                        case "value":
                            u = p;
                            break;
                        case "defaultValue":
                            f = p;
                            break;
                        case "multiple": n = p;
                        default: Ee(e, t, o, p, s, null);
                    }
            t = u, s = f, e.multiple = !!n, t != null ? Qa(e, !!n, t, !1) : s != null && Qa(e, !!n, s, !0);
            return;
        case "textarea":
            me("invalid", e), u = o = n = null;
            for (f in s)
                if (s.hasOwnProperty(f) && (p = s[f], p != null))
                    switch (f) {
                        case "value":
                            n = p;
                            break;
                        case "defaultValue":
                            o = p;
                            break;
                        case "children":
                            u = p;
                            break;
                        case "dangerouslySetInnerHTML":
                            if (p != null)
                                throw Error(c(91));
                            break;
                        default: Ee(e, t, f, p, s, null);
                    }
            _d(e, n, o, u);
            return;
        case "option":
            for (j in s)
                if (s.hasOwnProperty(j) && (n = s[j], n != null))
                    switch (j) {
                        case "selected":
                            e.selected = n && typeof n != "function" && typeof n != "symbol";
                            break;
                        default: Ee(e, t, j, n, s, null);
                    }
            return;
        case "dialog":
            me("beforetoggle", e), me("toggle", e), me("cancel", e), me("close", e);
            break;
        case "iframe":
        case "object":
            me("load", e);
            break;
        case "video":
        case "audio":
            for (n = 0; n < mn.length; n++)
                me(mn[n], e);
            break;
        case "image":
            me("error", e), me("load", e);
            break;
        case "details":
            me("toggle", e);
            break;
        case "embed":
        case "source":
        case "link": me("error", e), me("load", e);
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
            for (E in s)
                if (s.hasOwnProperty(E) && (n = s[E], n != null))
                    switch (E) {
                        case "children":
                        case "dangerouslySetInnerHTML": throw Error(c(137, t));
                        default: Ee(e, t, E, n, s, null);
                    }
            return;
        default: if (ic(t)) {
            for (q in s)
                s.hasOwnProperty(q) && (n = s[q], n !== void 0 && Zo(e, t, q, n, s, void 0));
            return;
        }
    } for (p in s)
        s.hasOwnProperty(p) && (n = s[p], n != null && Ee(e, t, p, n, s, null)); }
    function ky(e, t, s, n) { switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "input":
            var o = null, u = null, f = null, p = null, j = null, E = null, q = null;
            for (D in s) {
                var L = s[D];
                if (s.hasOwnProperty(D) && L != null)
                    switch (D) {
                        case "checked": break;
                        case "value": break;
                        case "defaultValue": j = L;
                        default: n.hasOwnProperty(D) || Ee(e, t, D, null, n, L);
                    }
            }
            for (var M in n) {
                var D = n[M];
                if (L = s[M], n.hasOwnProperty(M) && (D != null || L != null))
                    switch (M) {
                        case "type":
                            u = D;
                            break;
                        case "name":
                            o = D;
                            break;
                        case "checked":
                            E = D;
                            break;
                        case "defaultChecked":
                            q = D;
                            break;
                        case "value":
                            f = D;
                            break;
                        case "defaultValue":
                            p = D;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (D != null)
                                throw Error(c(137, t));
                            break;
                        default: D !== L && Ee(e, t, M, D, n, L);
                    }
            }
            lc(e, f, p, j, E, q, u, o);
            return;
        case "select":
            D = f = p = M = null;
            for (u in s)
                if (j = s[u], s.hasOwnProperty(u) && j != null)
                    switch (u) {
                        case "value": break;
                        case "multiple": D = j;
                        default: n.hasOwnProperty(u) || Ee(e, t, u, null, n, j);
                    }
            for (o in n)
                if (u = n[o], j = s[o], n.hasOwnProperty(o) && (u != null || j != null))
                    switch (o) {
                        case "value":
                            M = u;
                            break;
                        case "defaultValue":
                            p = u;
                            break;
                        case "multiple": f = u;
                        default: u !== j && Ee(e, t, o, u, n, j);
                    }
            t = p, s = f, n = D, M != null ? Qa(e, !!s, M, !1) : !!n != !!s && (t != null ? Qa(e, !!s, t, !0) : Qa(e, !!s, s ? [] : "", !1));
            return;
        case "textarea":
            D = M = null;
            for (p in s)
                if (o = s[p], s.hasOwnProperty(p) && o != null && !n.hasOwnProperty(p))
                    switch (p) {
                        case "value": break;
                        case "children": break;
                        default: Ee(e, t, p, null, n, o);
                    }
            for (f in n)
                if (o = n[f], u = s[f], n.hasOwnProperty(f) && (o != null || u != null))
                    switch (f) {
                        case "value":
                            M = o;
                            break;
                        case "defaultValue":
                            D = o;
                            break;
                        case "children": break;
                        case "dangerouslySetInnerHTML":
                            if (o != null)
                                throw Error(c(91));
                            break;
                        default: o !== u && Ee(e, t, f, o, n, u);
                    }
            Md(e, M, D);
            return;
        case "option":
            for (var W in s)
                if (M = s[W], s.hasOwnProperty(W) && M != null && !n.hasOwnProperty(W))
                    switch (W) {
                        case "selected":
                            e.selected = !1;
                            break;
                        default: Ee(e, t, W, null, n, M);
                    }
            for (j in n)
                if (M = n[j], D = s[j], n.hasOwnProperty(j) && M !== D && (M != null || D != null))
                    switch (j) {
                        case "selected":
                            e.selected = M && typeof M != "function" && typeof M != "symbol";
                            break;
                        default: Ee(e, t, j, M, n, D);
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
            for (var se in s)
                M = s[se], s.hasOwnProperty(se) && M != null && !n.hasOwnProperty(se) && Ee(e, t, se, null, n, M);
            for (E in n)
                if (M = n[E], D = s[E], n.hasOwnProperty(E) && M !== D && (M != null || D != null))
                    switch (E) {
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (M != null)
                                throw Error(c(137, t));
                            break;
                        default: Ee(e, t, E, M, n, D);
                    }
            return;
        default: if (ic(t)) {
            for (var Me in s)
                M = s[Me], s.hasOwnProperty(Me) && M !== void 0 && !n.hasOwnProperty(Me) && Zo(e, t, Me, void 0, n, M);
            for (q in n)
                M = n[q], D = s[q], !n.hasOwnProperty(q) || M === D || M === void 0 && D === void 0 || Zo(e, t, q, M, n, D);
            return;
        }
    } for (var k in s)
        M = s[k], s.hasOwnProperty(k) && M != null && !n.hasOwnProperty(k) && Ee(e, t, k, null, n, M); for (L in n)
        M = n[L], D = s[L], !n.hasOwnProperty(L) || M === D || M == null && D == null || Ee(e, t, L, M, n, D); }
    function Rh(e) { switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link": return !0;
        default: return !1;
    } }
    function Ay() { if (typeof performance.getEntriesByType == "function") {
        for (var e = 0, t = 0, s = performance.getEntriesByType("resource"), n = 0; n < s.length; n++) {
            var o = s[n], u = o.transferSize, f = o.initiatorType, p = o.duration;
            if (u && p && Rh(f)) {
                for (f = 0, p = o.responseEnd, n += 1; n < s.length; n++) {
                    var j = s[n], E = j.startTime;
                    if (E > p)
                        break;
                    var q = j.transferSize, L = j.initiatorType;
                    q && Rh(L) && (j = j.responseEnd, f += q * (j < p ? 1 : (p - E) / (j - E)));
                }
                if (--n, t += 8 * (u + f) / (o.duration / 1e3), e++, 10 < e)
                    break;
            }
        }
        if (0 < e)
            return t / e / 1e6;
    } return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5; }
    var Jo = null, Fo = null;
    function Gi(e) { return e.nodeType === 9 ? e : e.ownerDocument; }
    function qh(e) { switch (e) {
        case "http://www.w3.org/2000/svg": return 1;
        case "http://www.w3.org/1998/Math/MathML": return 2;
        default: return 0;
    } }
    function Bh(e, t) { if (e === 0)
        switch (t) {
            case "svg": return 1;
            case "math": return 2;
            default: return 0;
        } return e === 1 && t === "foreignObject" ? 0 : e; }
    function $o(e, t) { return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null; }
    var Wo = null;
    function Cy() { var e = window.event; return e && e.type === "popstate" ? e === Wo ? !1 : (Wo = e, !0) : (Wo = null, !1); }
    var Uh = typeof setTimeout == "function" ? setTimeout : void 0, Ty = typeof clearTimeout == "function" ? clearTimeout : void 0, Lh = typeof Promise == "function" ? Promise : void 0, Ey = typeof queueMicrotask == "function" ? queueMicrotask : typeof Lh < "u" ? function (e) { return Lh.resolve(null).then(e).catch(My); } : Uh;
    function My(e) { setTimeout(function () { throw e; }); }
    function sa(e) { return e === "head"; }
    function Hh(e, t) { var s = t, n = 0; do {
        var o = s.nextSibling;
        if (e.removeChild(s), o && o.nodeType === 8)
            if (s = o.data, s === "/$" || s === "/&") {
                if (n === 0) {
                    e.removeChild(o), vl(t);
                    return;
                }
                n--;
            }
            else if (s === "$" || s === "$?" || s === "$~" || s === "$!" || s === "&")
                n++;
            else if (s === "html")
                pn(e.ownerDocument.documentElement);
            else if (s === "head") {
                s = e.ownerDocument.head, pn(s);
                for (var u = s.firstChild; u;) {
                    var f = u.nextSibling, p = u.nodeName;
                    u[Ol] || p === "SCRIPT" || p === "STYLE" || p === "LINK" && u.rel.toLowerCase() === "stylesheet" || s.removeChild(u), u = f;
                }
            }
            else
                s === "body" && pn(e.ownerDocument.body);
        s = o;
    } while (s); vl(t); }
    function Vh(e, t) { var s = e; e = 0; do {
        var n = s.nextSibling;
        if (s.nodeType === 1 ? t ? (s._stashedDisplay = s.style.display, s.style.display = "none") : (s.style.display = s._stashedDisplay || "", s.getAttribute("style") === "" && s.removeAttribute("style")) : s.nodeType === 3 && (t ? (s._stashedText = s.nodeValue, s.nodeValue = "") : s.nodeValue = s._stashedText || ""), n && n.nodeType === 8)
            if (s = n.data, s === "/$") {
                if (e === 0)
                    break;
                e--;
            }
            else
                s !== "$" && s !== "$?" && s !== "$~" && s !== "$!" || e++;
        s = n;
    } while (s); }
    function Io(e) { var t = e.firstChild; for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
        var s = t;
        switch (t = t.nextSibling, s.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
                Io(s), sc(s);
                continue;
            case "SCRIPT":
            case "STYLE": continue;
            case "LINK": if (s.rel.toLowerCase() === "stylesheet")
                continue;
        }
        e.removeChild(s);
    } }
    function _y(e, t, s, n) { for (; e.nodeType === 1;) {
        var o = s;
        if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
            if (!n && (e.nodeName !== "INPUT" || e.type !== "hidden"))
                break;
        }
        else if (n) {
            if (!e[Ol])
                switch (t) {
                    case "meta":
                        if (!e.hasAttribute("itemprop"))
                            break;
                        return e;
                    case "link":
                        if (u = e.getAttribute("rel"), u === "stylesheet" && e.hasAttribute("data-precedence"))
                            break;
                        if (u !== o.rel || e.getAttribute("href") !== (o.href == null || o.href === "" ? null : o.href) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin) || e.getAttribute("title") !== (o.title == null ? null : o.title))
                            break;
                        return e;
                    case "style":
                        if (e.hasAttribute("data-precedence"))
                            break;
                        return e;
                    case "script":
                        if (u = e.getAttribute("src"), (u !== (o.src == null ? null : o.src) || e.getAttribute("type") !== (o.type == null ? null : o.type) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin)) && u && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                            break;
                        return e;
                    default: return e;
                }
        }
        else if (t === "input" && e.type === "hidden") {
            var u = o.name == null ? null : "" + o.name;
            if (o.type === "hidden" && e.getAttribute("name") === u)
                return e;
        }
        else
            return e;
        if (e = Yt(e.nextSibling), e === null)
            break;
    } return null; }
    function Oy(e, t, s) { if (t === "")
        return null; for (; e.nodeType !== 3;)
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !s || (e = Yt(e.nextSibling), e === null))
            return null; return e; }
    function Qh(e, t) { for (; e.nodeType !== 8;)
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Yt(e.nextSibling), e === null))
            return null; return e; }
    function Po(e) { return e.data === "$?" || e.data === "$~"; }
    function eu(e) { return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading"; }
    function zy(e, t) { var s = e.ownerDocument; if (e.data === "$~")
        e._reactRetry = t;
    else if (e.data !== "$?" || s.readyState !== "loading")
        t();
    else {
        var n = function () { t(), s.removeEventListener("DOMContentLoaded", n); };
        s.addEventListener("DOMContentLoaded", n), e._reactRetry = n;
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
    var tu = null;
    function Gh(e) { e = e.nextSibling; for (var t = 0; e;) {
        if (e.nodeType === 8) {
            var s = e.data;
            if (s === "/$" || s === "/&") {
                if (t === 0)
                    return Yt(e.nextSibling);
                t--;
            }
            else
                s !== "$" && s !== "$!" && s !== "$?" && s !== "$~" && s !== "&" || t++;
        }
        e = e.nextSibling;
    } return null; }
    function Kh(e) { e = e.previousSibling; for (var t = 0; e;) {
        if (e.nodeType === 8) {
            var s = e.data;
            if (s === "$" || s === "$!" || s === "$?" || s === "$~" || s === "&") {
                if (t === 0)
                    return e;
                t--;
            }
            else
                s !== "/$" && s !== "/&" || t++;
        }
        e = e.previousSibling;
    } return null; }
    function Yh(e, t, s) { switch (t = Gi(s), e) {
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
    function pn(e) { for (var t = e.attributes; t.length;)
        e.removeAttributeNode(t[0]); sc(e); }
    var Xt = new Map, Xh = new Set;
    function Ki(e) { return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument; }
    var _s = Z.d;
    Z.d = { f: Dy, r: Ry, D: qy, C: By, L: Uy, m: Ly, X: Vy, S: Hy, M: Qy };
    function Dy() { var e = _s.f(), t = Ri(); return e || t; }
    function Ry(e) { var t = La(e); t !== null && t.tag === 5 && t.type === "form" ? om(t) : _s.r(e); }
    var gl = typeof document > "u" ? null : document;
    function Zh(e, t, s) { var n = gl; if (n && typeof t == "string" && t) {
        var o = Ut(t);
        o = 'link[rel="' + e + '"][href="' + o + '"]', typeof s == "string" && (o += '[crossorigin="' + s + '"]'), Xh.has(o) || (Xh.add(o), e = { rel: e, crossOrigin: s, href: t }, n.querySelector(o) === null && (t = n.createElement("link"), ut(t, "link", e), et(t), n.head.appendChild(t)));
    } }
    function qy(e) { _s.D(e), Zh("dns-prefetch", e, null); }
    function By(e, t) { _s.C(e, t), Zh("preconnect", e, t); }
    function Uy(e, t, s) { _s.L(e, t, s); var n = gl; if (n && e && t) {
        var o = 'link[rel="preload"][as="' + Ut(t) + '"]';
        t === "image" && s && s.imageSrcSet ? (o += '[imagesrcset="' + Ut(s.imageSrcSet) + '"]', typeof s.imageSizes == "string" && (o += '[imagesizes="' + Ut(s.imageSizes) + '"]')) : o += '[href="' + Ut(e) + '"]';
        var u = o;
        switch (t) {
            case "style":
                u = yl(e);
                break;
            case "script": u = bl(e);
        }
        Xt.has(u) || (e = b({ rel: "preload", href: t === "image" && s && s.imageSrcSet ? void 0 : e, as: t }, s), Xt.set(u, e), n.querySelector(o) !== null || t === "style" && n.querySelector(xn(u)) || t === "script" && n.querySelector(gn(u)) || (t = n.createElement("link"), ut(t, "link", e), et(t), n.head.appendChild(t)));
    } }
    function Ly(e, t) { _s.m(e, t); var s = gl; if (s && e) {
        var n = t && typeof t.as == "string" ? t.as : "script", o = 'link[rel="modulepreload"][as="' + Ut(n) + '"][href="' + Ut(e) + '"]', u = o;
        switch (n) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script": u = bl(e);
        }
        if (!Xt.has(u) && (e = b({ rel: "modulepreload", href: e }, t), Xt.set(u, e), s.querySelector(o) === null)) {
            switch (n) {
                case "audioworklet":
                case "paintworklet":
                case "serviceworker":
                case "sharedworker":
                case "worker":
                case "script": if (s.querySelector(gn(u)))
                    return;
            }
            n = s.createElement("link"), ut(n, "link", e), et(n), s.head.appendChild(n);
        }
    } }
    function Hy(e, t, s) { _s.S(e, t, s); var n = gl; if (n && e) {
        var o = Ha(n).hoistableStyles, u = yl(e);
        t = t || "default";
        var f = o.get(u);
        if (!f) {
            var p = { loading: 0, preload: null };
            if (f = n.querySelector(xn(u)))
                p.loading = 5;
            else {
                e = b({ rel: "stylesheet", href: e, "data-precedence": t }, s), (s = Xt.get(u)) && su(e, s);
                var j = f = n.createElement("link");
                et(j), ut(j, "link", e), j._p = new Promise(function (E, q) { j.onload = E, j.onerror = q; }), j.addEventListener("load", function () { p.loading |= 1; }), j.addEventListener("error", function () { p.loading |= 2; }), p.loading |= 4, Yi(f, t, n);
            }
            f = { type: "stylesheet", instance: f, count: 1, state: p }, o.set(u, f);
        }
    } }
    function Vy(e, t) { _s.X(e, t); var s = gl; if (s && e) {
        var n = Ha(s).hoistableScripts, o = bl(e), u = n.get(o);
        u || (u = s.querySelector(gn(o)), u || (e = b({ src: e, async: !0 }, t), (t = Xt.get(o)) && au(e, t), u = s.createElement("script"), et(u), ut(u, "link", e), s.head.appendChild(u)), u = { type: "script", instance: u, count: 1, state: null }, n.set(o, u));
    } }
    function Qy(e, t) { _s.M(e, t); var s = gl; if (s && e) {
        var n = Ha(s).hoistableScripts, o = bl(e), u = n.get(o);
        u || (u = s.querySelector(gn(o)), u || (e = b({ src: e, async: !0, type: "module" }, t), (t = Xt.get(o)) && au(e, t), u = s.createElement("script"), et(u), ut(u, "link", e), s.head.appendChild(u)), u = { type: "script", instance: u, count: 1, state: null }, n.set(o, u));
    } }
    function Jh(e, t, s, n) { var o = (o = Ft.current) ? Ki(o) : null; if (!o)
        throw Error(c(446)); switch (e) {
        case "meta":
        case "title": return null;
        case "style": return typeof s.precedence == "string" && typeof s.href == "string" ? (t = yl(s.href), s = Ha(o).hoistableStyles, n = s.get(t), n || (n = { type: "style", instance: null, count: 0, state: null }, s.set(t, n)), n) : { type: "void", instance: null, count: 0, state: null };
        case "link":
            if (s.rel === "stylesheet" && typeof s.href == "string" && typeof s.precedence == "string") {
                e = yl(s.href);
                var u = Ha(o).hoistableStyles, f = u.get(e);
                if (f || (o = o.ownerDocument || o, f = { type: "stylesheet", instance: null, count: 0, state: { loading: 0, preload: null } }, u.set(e, f), (u = o.querySelector(xn(e))) && !u._p && (f.instance = u, f.state.loading = 5), Xt.has(e) || (s = { rel: "preload", as: "style", href: s.href, crossOrigin: s.crossOrigin, integrity: s.integrity, media: s.media, hrefLang: s.hrefLang, referrerPolicy: s.referrerPolicy }, Xt.set(e, s), u || Gy(o, e, s, f.state))), t && n === null)
                    throw Error(c(528, ""));
                return f;
            }
            if (t && n !== null)
                throw Error(c(529, ""));
            return null;
        case "script": return t = s.async, s = s.src, typeof s == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = bl(s), s = Ha(o).hoistableScripts, n = s.get(t), n || (n = { type: "script", instance: null, count: 0, state: null }, s.set(t, n)), n) : { type: "void", instance: null, count: 0, state: null };
        default: throw Error(c(444, e));
    } }
    function yl(e) { return 'href="' + Ut(e) + '"'; }
    function xn(e) { return 'link[rel="stylesheet"][' + e + "]"; }
    function Fh(e) { return b({}, e, { "data-precedence": e.precedence, precedence: null }); }
    function Gy(e, t, s, n) { e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? n.loading = 1 : (t = e.createElement("link"), n.preload = t, t.addEventListener("load", function () { return n.loading |= 1; }), t.addEventListener("error", function () { return n.loading |= 2; }), ut(t, "link", s), et(t), e.head.appendChild(t)); }
    function bl(e) { return '[src="' + Ut(e) + '"]'; }
    function gn(e) { return "script[async]" + e; }
    function $h(e, t, s) { if (t.count++, t.instance === null)
        switch (t.type) {
            case "style":
                var n = e.querySelector('style[data-href~="' + Ut(s.href) + '"]');
                if (n)
                    return t.instance = n, et(n), n;
                var o = b({}, s, { "data-href": s.href, "data-precedence": s.precedence, href: null, precedence: null });
                return n = (e.ownerDocument || e).createElement("style"), et(n), ut(n, "style", o), Yi(n, s.precedence, e), t.instance = n;
            case "stylesheet":
                o = yl(s.href);
                var u = e.querySelector(xn(o));
                if (u)
                    return t.state.loading |= 4, t.instance = u, et(u), u;
                n = Fh(s), (o = Xt.get(o)) && su(n, o), u = (e.ownerDocument || e).createElement("link"), et(u);
                var f = u;
                return f._p = new Promise(function (p, j) { f.onload = p, f.onerror = j; }), ut(u, "link", n), t.state.loading |= 4, Yi(u, s.precedence, e), t.instance = u;
            case "script": return u = bl(s.src), (o = e.querySelector(gn(u))) ? (t.instance = o, et(o), o) : (n = s, (o = Xt.get(u)) && (n = b({}, s), au(n, o)), e = e.ownerDocument || e, o = e.createElement("script"), et(o), ut(o, "link", n), e.head.appendChild(o), t.instance = o);
            case "void": return null;
            default: throw Error(c(443, t.type));
        }
    else
        t.type === "stylesheet" && (t.state.loading & 4) === 0 && (n = t.instance, t.state.loading |= 4, Yi(n, s.precedence, e)); return t.instance; }
    function Yi(e, t, s) { for (var n = s.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), o = n.length ? n[n.length - 1] : null, u = o, f = 0; f < n.length; f++) {
        var p = n[f];
        if (p.dataset.precedence === t)
            u = p;
        else if (u !== o)
            break;
    } u ? u.parentNode.insertBefore(e, u.nextSibling) : (t = s.nodeType === 9 ? s.head : s, t.insertBefore(e, t.firstChild)); }
    function su(e, t) { e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title); }
    function au(e, t) { e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity); }
    var Xi = null;
    function Wh(e, t, s) { if (Xi === null) {
        var n = new Map, o = Xi = new Map;
        o.set(s, n);
    }
    else
        o = Xi, n = o.get(s), n || (n = new Map, o.set(s, n)); if (n.has(e))
        return n; for (n.set(e, null), s = s.getElementsByTagName(e), o = 0; o < s.length; o++) {
        var u = s[o];
        if (!(u[Ol] || u[it] || e === "link" && u.getAttribute("rel") === "stylesheet") && u.namespaceURI !== "http://www.w3.org/2000/svg") {
            var f = u.getAttribute(t) || "";
            f = e + f;
            var p = n.get(f);
            p ? p.push(u) : n.set(f, [u]);
        }
    } return n; }
    function Ih(e, t, s) { e = e.ownerDocument || e, e.head.insertBefore(s, t === "title" ? e.querySelector("head > title") : null); }
    function Ky(e, t, s) { if (s === 1 || t.itemProp != null)
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
    function Ph(e) { return !(e.type === "stylesheet" && (e.state.loading & 3) === 0); }
    function Yy(e, t, s, n) { if (s.type === "stylesheet" && (typeof n.media != "string" || matchMedia(n.media).matches !== !1) && (s.state.loading & 4) === 0) {
        if (s.instance === null) {
            var o = yl(n.href), u = t.querySelector(xn(o));
            if (u) {
                t = u._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Zi.bind(e), t.then(e, e)), s.state.loading |= 4, s.instance = u, et(u);
                return;
            }
            u = t.ownerDocument || t, n = Fh(n), (o = Xt.get(o)) && su(n, o), u = u.createElement("link"), et(u);
            var f = u;
            f._p = new Promise(function (p, j) { f.onload = p, f.onerror = j; }), ut(u, "link", n), s.instance = u;
        }
        e.stylesheets === null && (e.stylesheets = new Map), e.stylesheets.set(s, t), (t = s.state.preload) && (s.state.loading & 3) === 0 && (e.count++, s = Zi.bind(e), t.addEventListener("load", s), t.addEventListener("error", s));
    } }
    var lu = 0;
    function Xy(e, t) { return e.stylesheets && e.count === 0 && Fi(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function (s) { var n = setTimeout(function () { if (e.stylesheets && Fi(e, e.stylesheets), e.unsuspend) {
        var u = e.unsuspend;
        e.unsuspend = null, u();
    } }, 6e4 + t); 0 < e.imgBytes && lu === 0 && (lu = 62500 * Ay()); var o = setTimeout(function () { if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Fi(e, e.stylesheets), e.unsuspend)) {
        var u = e.unsuspend;
        e.unsuspend = null, u();
    } }, (e.imgBytes > lu ? 50 : 800) + t); return e.unsuspend = s, function () { e.unsuspend = null, clearTimeout(n), clearTimeout(o); }; } : null; }
    function Zi() { if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
        if (this.stylesheets)
            Fi(this, this.stylesheets);
        else if (this.unsuspend) {
            var e = this.unsuspend;
            this.unsuspend = null, e();
        }
    } }
    var Ji = null;
    function Fi(e, t) { e.stylesheets = null, e.unsuspend !== null && (e.count++, Ji = new Map, t.forEach(Zy, e), Ji = null, Zi.call(e)); }
    function Zy(e, t) { if (!(t.state.loading & 4)) {
        var s = Ji.get(e);
        if (s)
            var n = s.get(null);
        else {
            s = new Map, Ji.set(e, s);
            for (var o = e.querySelectorAll("link[data-precedence],style[data-precedence]"), u = 0; u < o.length; u++) {
                var f = o[u];
                (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (s.set(f.dataset.precedence, f), n = f);
            }
            n && s.set(null, n);
        }
        o = t.instance, f = o.getAttribute("data-precedence"), u = s.get(f) || n, u === n && s.set(null, o), s.set(f, o), this.count++, n = Zi.bind(this), o.addEventListener("load", n), o.addEventListener("error", n), u ? u.parentNode.insertBefore(o, u.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(o, e.firstChild)), t.state.loading |= 4;
    } }
    var yn = { $$typeof: H, Provider: null, Consumer: null, _currentValue: V, _currentValue2: V, _threadCount: 0 };
    function Jy(e, t, s, n, o, u, f, p, j) { this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ir(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ir(0), this.hiddenUpdates = Ir(null), this.identifierPrefix = n, this.onUncaughtError = o, this.onCaughtError = u, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = j, this.incompleteTransitions = new Map; }
    function ep(e, t, s, n, o, u, f, p, j, E, q, L) { return e = new Jy(e, t, s, f, j, E, q, L, p), t = 1, u === !0 && (t |= 24), u = Tt(3, null, null, t), e.current = u, u.stateNode = e, t = qc(), t.refCount++, e.pooledCache = t, t.refCount++, u.memoizedState = { element: n, isDehydrated: s, cache: t }, Hc(u), e; }
    function tp(e) { return e ? (e = $a, e) : $a; }
    function sp(e, t, s, n, o, u) { o = tp(o), n.context === null ? n.context = o : n.pendingContext = o, n = Ys(t), n.payload = { element: s }, u = u === void 0 ? null : u, u !== null && (n.callback = u), s = Xs(e, n, t), s !== null && (vt(s, e, t), Fl(s, e, t)); }
    function ap(e, t) { if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
        var s = e.retryLane;
        e.retryLane = s !== 0 && s < t ? s : t;
    } }
    function nu(e, t) { ap(e, t), (e = e.alternate) && ap(e, t); }
    function lp(e) { if (e.tag === 13 || e.tag === 31) {
        var t = ba(e, 67108864);
        t !== null && vt(t, e, 67108864), nu(e, 67108864);
    } }
    function np(e) { if (e.tag === 13 || e.tag === 31) {
        var t = zt();
        t = Pr(t);
        var s = ba(e, t);
        s !== null && vt(s, e, t), nu(e, t);
    } }
    var $i = !0;
    function Fy(e, t, s, n) { var o = z.T; z.T = null; var u = Z.p; try {
        Z.p = 2, iu(e, t, s, n);
    }
    finally {
        Z.p = u, z.T = o;
    } }
    function $y(e, t, s, n) { var o = z.T; z.T = null; var u = Z.p; try {
        Z.p = 8, iu(e, t, s, n);
    }
    finally {
        Z.p = u, z.T = o;
    } }
    function iu(e, t, s, n) { if ($i) {
        var o = ru(n);
        if (o === null)
            Xo(e, t, n, Wi, s), rp(e, n);
        else if (Iy(o, e, t, s, n))
            n.stopPropagation();
        else if (rp(e, n), t & 4 && -1 < Wy.indexOf(e)) {
            for (; o !== null;) {
                var u = La(o);
                if (u !== null)
                    switch (u.tag) {
                        case 3:
                            if (u = u.stateNode, u.current.memoizedState.isDehydrated) {
                                var f = ha(u.pendingLanes);
                                if (f !== 0) {
                                    var p = u;
                                    for (p.pendingLanes |= 2, p.entangledLanes |= 2; f;) {
                                        var j = 1 << 31 - At(f);
                                        p.entanglements[1] |= j, f &= ~j;
                                    }
                                    cs(u), (Se & 6) === 0 && (zi = St() + 500, fn(0));
                                }
                            }
                            break;
                        case 31:
                        case 13: p = ba(u, 2), p !== null && vt(p, u, 2), Ri(), nu(u, 2);
                    }
                if (u = ru(n), u === null && Xo(e, t, n, Wi, s), u === o)
                    break;
                o = u;
            }
            o !== null && n.stopPropagation();
        }
        else
            Xo(e, t, n, null, s);
    } }
    function ru(e) { return e = cc(e), cu(e); }
    var Wi = null;
    function cu(e) { if (Wi = null, e = Ua(e), e !== null) {
        var t = m(e);
        if (t === null)
            e = null;
        else {
            var s = t.tag;
            if (s === 13) {
                if (e = h(t), e !== null)
                    return e;
                e = null;
            }
            else if (s === 31) {
                if (e = x(t), e !== null)
                    return e;
                e = null;
            }
            else if (s === 3) {
                if (t.stateNode.current.memoizedState.isDehydrated)
                    return t.tag === 3 ? t.stateNode.containerInfo : null;
                e = null;
            }
            else
                t !== e && (e = null);
        }
    } return Wi = e, null; }
    function ip(e) { switch (e) {
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
        case "message": switch (qg()) {
            case md: return 2;
            case hd: return 8;
            case Hn:
            case Bg: return 32;
            case pd: return 268435456;
            default: return 32;
        }
        default: return 32;
    } }
    var ou = !1, aa = null, la = null, na = null, bn = new Map, vn = new Map, ia = [], Wy = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function rp(e, t) { switch (e) {
        case "focusin":
        case "focusout":
            aa = null;
            break;
        case "dragenter":
        case "dragleave":
            la = null;
            break;
        case "mouseover":
        case "mouseout":
            na = null;
            break;
        case "pointerover":
        case "pointerout":
            bn.delete(t.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture": vn.delete(t.pointerId);
    } }
    function jn(e, t, s, n, o, u) { return e === null || e.nativeEvent !== u ? (e = { blockedOn: t, domEventName: s, eventSystemFlags: n, nativeEvent: u, targetContainers: [o] }, t !== null && (t = La(t), t !== null && lp(t)), e) : (e.eventSystemFlags |= n, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e); }
    function Iy(e, t, s, n, o) { switch (t) {
        case "focusin": return aa = jn(aa, e, t, s, n, o), !0;
        case "dragenter": return la = jn(la, e, t, s, n, o), !0;
        case "mouseover": return na = jn(na, e, t, s, n, o), !0;
        case "pointerover":
            var u = o.pointerId;
            return bn.set(u, jn(bn.get(u) || null, e, t, s, n, o)), !0;
        case "gotpointercapture": return u = o.pointerId, vn.set(u, jn(vn.get(u) || null, e, t, s, n, o)), !0;
    } return !1; }
    function cp(e) { var t = Ua(e.target); if (t !== null) {
        var s = m(t);
        if (s !== null) {
            if (t = s.tag, t === 13) {
                if (t = h(s), t !== null) {
                    e.blockedOn = t, jd(e.priority, function () { np(s); });
                    return;
                }
            }
            else if (t === 31) {
                if (t = x(s), t !== null) {
                    e.blockedOn = t, jd(e.priority, function () { np(s); });
                    return;
                }
            }
            else if (t === 3 && s.stateNode.current.memoizedState.isDehydrated) {
                e.blockedOn = s.tag === 3 ? s.stateNode.containerInfo : null;
                return;
            }
        }
    } e.blockedOn = null; }
    function Ii(e) { if (e.blockedOn !== null)
        return !1; for (var t = e.targetContainers; 0 < t.length;) {
        var s = ru(e.nativeEvent);
        if (s === null) {
            s = e.nativeEvent;
            var n = new s.constructor(s.type, s);
            rc = n, s.target.dispatchEvent(n), rc = null;
        }
        else
            return t = La(s), t !== null && lp(t), e.blockedOn = s, !1;
        t.shift();
    } return !0; }
    function op(e, t, s) { Ii(e) && s.delete(t); }
    function Py() { ou = !1, aa !== null && Ii(aa) && (aa = null), la !== null && Ii(la) && (la = null), na !== null && Ii(na) && (na = null), bn.forEach(op), vn.forEach(op); }
    function Pi(e, t) { e.blockedOn === t && (e.blockedOn = null, ou || (ou = !0, l.unstable_scheduleCallback(l.unstable_NormalPriority, Py))); }
    var er = null;
    function up(e) { er !== e && (er = e, l.unstable_scheduleCallback(l.unstable_NormalPriority, function () { er === e && (er = null); for (var t = 0; t < e.length; t += 3) {
        var s = e[t], n = e[t + 1], o = e[t + 2];
        if (typeof n != "function") {
            if (cu(n || s) === null)
                continue;
            break;
        }
        var u = La(s);
        u !== null && (e.splice(t, 3), t -= 3, io(u, { pending: !0, data: o, method: s.method, action: n }, n, o));
    } })); }
    function vl(e) { function t(j) { return Pi(j, e); } aa !== null && Pi(aa, e), la !== null && Pi(la, e), na !== null && Pi(na, e), bn.forEach(t), vn.forEach(t); for (var s = 0; s < ia.length; s++) {
        var n = ia[s];
        n.blockedOn === e && (n.blockedOn = null);
    } for (; 0 < ia.length && (s = ia[0], s.blockedOn === null);)
        cp(s), s.blockedOn === null && ia.shift(); if (s = (e.ownerDocument || e).$$reactFormReplay, s != null)
        for (n = 0; n < s.length; n += 3) {
            var o = s[n], u = s[n + 1], f = o[ht] || null;
            if (typeof u == "function")
                f || up(s);
            else if (f) {
                var p = null;
                if (u && u.hasAttribute("formAction")) {
                    if (o = u, f = u[ht] || null)
                        p = f.formAction;
                    else if (cu(o) !== null)
                        continue;
                }
                else
                    p = f.action;
                typeof p == "function" ? s[n + 1] = p : (s.splice(n, 3), n -= 3), up(s);
            }
        } }
    function dp() { function e(u) { u.canIntercept && u.info === "react-transition" && u.intercept({ handler: function () { return new Promise(function (f) { return o = f; }); }, focusReset: "manual", scroll: "manual" }); } function t() { o !== null && (o(), o = null), n || setTimeout(s, 20); } function s() { if (!n && !navigation.transition) {
        var u = navigation.currentEntry;
        u && u.url != null && navigation.navigate(u.url, { state: u.getState(), info: "react-transition", history: "replace" });
    } } if (typeof navigation == "object") {
        var n = !1, o = null;
        return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(s, 100), function () { n = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), o !== null && (o(), o = null); };
    } }
    function uu(e) { this._internalRoot = e; }
    tr.prototype.render = uu.prototype.render = function (e) { var t = this._internalRoot; if (t === null)
        throw Error(c(409)); var s = t.current, n = zt(); sp(s, n, e, t, null, null); }, tr.prototype.unmount = uu.prototype.unmount = function () { var e = this._internalRoot; if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        sp(e.current, 2, null, e, null, null), Ri(), t[Ba] = null;
    } };
    function tr(e) { this._internalRoot = e; }
    tr.prototype.unstable_scheduleHydration = function (e) { if (e) {
        var t = vd();
        e = { blockedOn: null, target: e, priority: t };
        for (var s = 0; s < ia.length && t !== 0 && t < ia[s].priority; s++)
            ;
        ia.splice(s, 0, e), s === 0 && cp(e);
    } };
    var fp = i.version;
    if (fp !== "19.2.3")
        throw Error(c(527, fp, "19.2.3"));
    Z.findDOMNode = function (e) { var t = e._reactInternals; if (t === void 0)
        throw typeof e.render == "function" ? Error(c(188)) : (e = Object.keys(e).join(","), Error(c(268, e))); return e = y(t), e = e !== null ? v(e) : null, e = e === null ? null : e.stateNode, e; };
    var eb = { bundleType: 0, version: "19.2.3", rendererPackageName: "react-dom", currentDispatcherRef: z, reconcilerVersion: "19.2.3" };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var sr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!sr.isDisabled && sr.supportsFiber)
            try {
                El = sr.inject(eb), kt = sr;
            }
            catch { }
    }
    return Nn.createRoot = function (e, t) { if (!d(e))
        throw Error(c(299)); var s = !1, n = "", o = bm, u = vm, f = jm; return t != null && (t.unstable_strictMode === !0 && (s = !0), t.identifierPrefix !== void 0 && (n = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (u = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = ep(e, 1, !1, null, null, s, n, null, o, u, f, dp), e[Ba] = t.current, Yo(e), new uu(t); }, Nn.hydrateRoot = function (e, t, s) { if (!d(e))
        throw Error(c(299)); var n = !1, o = "", u = bm, f = vm, p = jm, j = null; return s != null && (s.unstable_strictMode === !0 && (n = !0), s.identifierPrefix !== void 0 && (o = s.identifierPrefix), s.onUncaughtError !== void 0 && (u = s.onUncaughtError), s.onCaughtError !== void 0 && (f = s.onCaughtError), s.onRecoverableError !== void 0 && (p = s.onRecoverableError), s.formState !== void 0 && (j = s.formState)), t = ep(e, 1, !0, t, s ?? null, n, o, j, u, f, p, dp), t.context = tp(null), s = t.current, n = zt(), n = Pr(n), o = Ys(n), o.callback = null, Xs(s, o, n), s = n, t.current.lanes = s, _l(t, s), cs(t), e[Ba] = t.current, Yo(e), new tr(t); }, Nn.version = "19.2.3", Nn;
}
var xp;
function pb() { if (xp)
    return du.exports; xp = 1; function l() { if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l);
    }
    catch (i) {
        console.error(i);
    } } return l(), du.exports = hb(), du.exports; }
var xb = pb();
const gb = ib(xb), ds = Object.create(null);
ds.open = "0";
ds.close = "1";
ds.ping = "2";
ds.pong = "3";
ds.message = "4";
ds.upgrade = "5";
ds.noop = "6";
const or = Object.create(null);
Object.keys(ds).forEach(l => { or[ds[l]] = l; });
const _u = { type: "error", data: "parser error" }, ix = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", rx = typeof ArrayBuffer == "function", cx = l => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(l) : l && l.buffer instanceof ArrayBuffer, Xu = ({ type: l, data: i }, r, c) => ix && i instanceof Blob ? r ? c(i) : gp(i, c) : rx && (i instanceof ArrayBuffer || cx(i)) ? r ? c(i) : gp(new Blob([i]), c) : c(ds[l] + (i || "")), gp = (l, i) => { const r = new FileReader; return r.onload = function () { const c = r.result.split(",")[1]; i("b" + (c || "")); }, r.readAsDataURL(l); };
function yp(l) { return l instanceof Uint8Array ? l : l instanceof ArrayBuffer ? new Uint8Array(l) : new Uint8Array(l.buffer, l.byteOffset, l.byteLength); }
let hu;
function yb(l, i) { if (ix && l.data instanceof Blob)
    return l.data.arrayBuffer().then(yp).then(i); if (rx && (l.data instanceof ArrayBuffer || cx(l.data)))
    return i(yp(l.data)); Xu(l, !1, r => { hu || (hu = new TextEncoder), i(hu.encode(r)); }); }
const bp = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Cn = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let l = 0; l < bp.length; l++)
    Cn[bp.charCodeAt(l)] = l;
const bb = l => { let i = l.length * .75, r = l.length, c, d = 0, m, h, x, g; l[l.length - 1] === "=" && (i--, l[l.length - 2] === "=" && i--); const y = new ArrayBuffer(i), v = new Uint8Array(y); for (c = 0; c < r; c += 4)
    m = Cn[l.charCodeAt(c)], h = Cn[l.charCodeAt(c + 1)], x = Cn[l.charCodeAt(c + 2)], g = Cn[l.charCodeAt(c + 3)], v[d++] = m << 2 | h >> 4, v[d++] = (h & 15) << 4 | x >> 2, v[d++] = (x & 3) << 6 | g & 63; return y; }, vb = typeof ArrayBuffer == "function", Zu = (l, i) => { if (typeof l != "string")
    return { type: "message", data: ox(l, i) }; const r = l.charAt(0); return r === "b" ? { type: "message", data: jb(l.substring(1), i) } : or[r] ? l.length > 1 ? { type: or[r], data: l.substring(1) } : { type: or[r] } : _u; }, jb = (l, i) => { if (vb) {
    const r = bb(l);
    return ox(r, i);
}
else
    return { base64: !0, data: l }; }, ox = (l, i) => { switch (i) {
    case "blob": return l instanceof Blob ? l : new Blob([l]);
    case "arraybuffer":
    default: return l instanceof ArrayBuffer ? l : l.buffer;
} }, ux = "", Nb = (l, i) => { const r = l.length, c = new Array(r); let d = 0; l.forEach((m, h) => { Xu(m, !1, x => { c[h] = x, ++d === r && i(c.join(ux)); }); }); }, wb = (l, i) => { const r = l.split(ux), c = []; for (let d = 0; d < r.length; d++) {
    const m = Zu(r[d], i);
    if (c.push(m), m.type === "error")
        break;
} return c; };
function Sb() { return new TransformStream({ transform(l, i) { yb(l, r => { const c = r.length; let d; if (c < 126)
        d = new Uint8Array(1), new DataView(d.buffer).setUint8(0, c);
    else if (c < 65536) {
        d = new Uint8Array(3);
        const m = new DataView(d.buffer);
        m.setUint8(0, 126), m.setUint16(1, c);
    }
    else {
        d = new Uint8Array(9);
        const m = new DataView(d.buffer);
        m.setUint8(0, 127), m.setBigUint64(1, BigInt(c));
    } l.data && typeof l.data != "string" && (d[0] |= 128), i.enqueue(d), i.enqueue(r); }); } }); }
let pu;
function ar(l) { return l.reduce((i, r) => i + r.length, 0); }
function lr(l, i) { if (l[0].length === i)
    return l.shift(); const r = new Uint8Array(i); let c = 0; for (let d = 0; d < i; d++)
    r[d] = l[0][c++], c === l[0].length && (l.shift(), c = 0); return l.length && c < l[0].length && (l[0] = l[0].slice(c)), r; }
function kb(l, i) { pu || (pu = new TextDecoder); const r = []; let c = 0, d = -1, m = !1; return new TransformStream({ transform(h, x) { for (r.push(h);;) {
        if (c === 0) {
            if (ar(r) < 1)
                break;
            const g = lr(r, 1);
            m = (g[0] & 128) === 128, d = g[0] & 127, d < 126 ? c = 3 : d === 126 ? c = 1 : c = 2;
        }
        else if (c === 1) {
            if (ar(r) < 2)
                break;
            const g = lr(r, 2);
            d = new DataView(g.buffer, g.byteOffset, g.length).getUint16(0), c = 3;
        }
        else if (c === 2) {
            if (ar(r) < 8)
                break;
            const g = lr(r, 8), y = new DataView(g.buffer, g.byteOffset, g.length), v = y.getUint32(0);
            if (v > Math.pow(2, 21) - 1) {
                x.enqueue(_u);
                break;
            }
            d = v * Math.pow(2, 32) + y.getUint32(4), c = 3;
        }
        else {
            if (ar(r) < d)
                break;
            const g = lr(r, d);
            x.enqueue(Zu(m ? g : pu.decode(g), i)), c = 0;
        }
        if (d === 0 || d > l) {
            x.enqueue(_u);
            break;
        }
    } } }); }
const dx = 4;
function Xe(l) { if (l)
    return Ab(l); }
function Ab(l) { for (var i in Xe.prototype)
    l[i] = Xe.prototype[i]; return l; }
Xe.prototype.on = Xe.prototype.addEventListener = function (l, i) { return this._callbacks = this._callbacks || {}, (this._callbacks["$" + l] = this._callbacks["$" + l] || []).push(i), this; };
Xe.prototype.once = function (l, i) { function r() { this.off(l, r), i.apply(this, arguments); } return r.fn = i, this.on(l, r), this; };
Xe.prototype.off = Xe.prototype.removeListener = Xe.prototype.removeAllListeners = Xe.prototype.removeEventListener = function (l, i) { if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this; var r = this._callbacks["$" + l]; if (!r)
    return this; if (arguments.length == 1)
    return delete this._callbacks["$" + l], this; for (var c, d = 0; d < r.length; d++)
    if (c = r[d], c === i || c.fn === i) {
        r.splice(d, 1);
        break;
    } return r.length === 0 && delete this._callbacks["$" + l], this; };
Xe.prototype.emit = function (l) { this._callbacks = this._callbacks || {}; for (var i = new Array(arguments.length - 1), r = this._callbacks["$" + l], c = 1; c < arguments.length; c++)
    i[c - 1] = arguments[c]; if (r) {
    r = r.slice(0);
    for (var c = 0, d = r.length; c < d; ++c)
        r[c].apply(this, i);
} return this; };
Xe.prototype.emitReserved = Xe.prototype.emit;
Xe.prototype.listeners = function (l) { return this._callbacks = this._callbacks || {}, this._callbacks["$" + l] || []; };
Xe.prototype.hasListeners = function (l) { return !!this.listeners(l).length; };
const Er = typeof Promise == "function" && typeof Promise.resolve == "function" ? i => Promise.resolve().then(i) : (i, r) => r(i, 0), Zt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Cb = "arraybuffer";
function fx(l, ...i) { return i.reduce((r, c) => (l.hasOwnProperty(c) && (r[c] = l[c]), r), {}); }
const Tb = Zt.setTimeout, Eb = Zt.clearTimeout;
function Mr(l, i) { i.useNativeTimers ? (l.setTimeoutFn = Tb.bind(Zt), l.clearTimeoutFn = Eb.bind(Zt)) : (l.setTimeoutFn = Zt.setTimeout.bind(Zt), l.clearTimeoutFn = Zt.clearTimeout.bind(Zt)); }
const Mb = 1.33;
function _b(l) { return typeof l == "string" ? Ob(l) : Math.ceil((l.byteLength || l.size) * Mb); }
function Ob(l) { let i = 0, r = 0; for (let c = 0, d = l.length; c < d; c++)
    i = l.charCodeAt(c), i < 128 ? r += 1 : i < 2048 ? r += 2 : i < 55296 || i >= 57344 ? r += 3 : (c++, r += 4); return r; }
function mx() { return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5); }
function zb(l) { let i = ""; for (let r in l)
    l.hasOwnProperty(r) && (i.length && (i += "&"), i += encodeURIComponent(r) + "=" + encodeURIComponent(l[r])); return i; }
function Db(l) { let i = {}, r = l.split("&"); for (let c = 0, d = r.length; c < d; c++) {
    let m = r[c].split("=");
    i[decodeURIComponent(m[0])] = decodeURIComponent(m[1]);
} return i; }
class Rb extends Error {
    constructor(i, r, c) { super(i), this.description = r, this.context = c, this.type = "TransportError"; }
}
class Ju extends Xe {
    constructor(i) { super(), this.writable = !1, Mr(this, i), this.opts = i, this.query = i.query, this.socket = i.socket, this.supportsBinary = !i.forceBase64; }
    onError(i, r, c) { return super.emitReserved("error", new Rb(i, r, c)), this; }
    open() { return this.readyState = "opening", this.doOpen(), this; }
    close() { return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this; }
    send(i) { this.readyState === "open" && this.write(i); }
    onOpen() { this.readyState = "open", this.writable = !0, super.emitReserved("open"); }
    onData(i) { const r = Zu(i, this.socket.binaryType); this.onPacket(r); }
    onPacket(i) { super.emitReserved("packet", i); }
    onClose(i) { this.readyState = "closed", super.emitReserved("close", i); }
    pause(i) { }
    createUri(i, r = {}) { return i + "://" + this._hostname() + this._port() + this.opts.path + this._query(r); }
    _hostname() { const i = this.opts.hostname; return i.indexOf(":") === -1 ? i : "[" + i + "]"; }
    _port() { return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : ""; }
    _query(i) { const r = zb(i); return r.length ? "?" + r : ""; }
}
class qb extends Ju {
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
        return this.onClose({ description: "transport closed by the server" }), !1; this.onPacket(c); }; wb(i, this.socket.binaryType).forEach(r), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll()); }
    doClose() { const i = () => { this.write([{ type: "close" }]); }; this.readyState === "open" ? i() : this.once("open", i); }
    write(i) { this.writable = !1, Nb(i, r => { this.doWrite(r, () => { this.writable = !0, this.emitReserved("drain"); }); }); }
    uri() { const i = this.opts.secure ? "https" : "http", r = this.query || {}; return this.opts.timestampRequests !== !1 && (r[this.opts.timestampParam] = mx()), !this.supportsBinary && !r.sid && (r.b64 = 1), this.createUri(i, r); }
}
let hx = !1;
try {
    hx = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest;
}
catch { }
const Bb = hx;
function Ub() { }
class Lb extends qb {
    constructor(i) { if (super(i), typeof location < "u") {
        const r = location.protocol === "https:";
        let c = location.port;
        c || (c = r ? "443" : "80"), this.xd = typeof location < "u" && i.hostname !== location.hostname || c !== i.port;
    } }
    doWrite(i, r) { const c = this.request({ method: "POST", data: i }); c.on("success", r), c.on("error", (d, m) => { this.onError("xhr post error", d, m); }); }
    doPoll() { const i = this.request(); i.on("data", this.onData.bind(this)), i.on("error", (r, c) => { this.onError("xhr poll error", r, c); }), this.pollXhr = i; }
}
class us extends Xe {
    constructor(i, r, c) { super(), this.createRequest = i, Mr(this, c), this._opts = c, this._method = c.method || "GET", this._uri = r, this._data = c.data !== void 0 ? c.data : null, this._create(); }
    _create() { var i; const r = fx(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref"); r.xdomain = !!this._opts.xd; const c = this._xhr = this.createRequest(r); try {
        c.open(this._method, this._uri, !0);
        try {
            if (this._opts.extraHeaders) {
                c.setDisableHeaderCheck && c.setDisableHeaderCheck(!0);
                for (let d in this._opts.extraHeaders)
                    this._opts.extraHeaders.hasOwnProperty(d) && c.setRequestHeader(d, this._opts.extraHeaders[d]);
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
        (i = this._opts.cookieJar) === null || i === void 0 || i.addCookies(c), "withCredentials" in c && (c.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (c.timeout = this._opts.requestTimeout), c.onreadystatechange = () => { var d; c.readyState === 3 && ((d = this._opts.cookieJar) === null || d === void 0 || d.parseCookies(c.getResponseHeader("set-cookie"))), c.readyState === 4 && (c.status === 200 || c.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => { this._onError(typeof c.status == "number" ? c.status : 0); }, 0)); }, c.send(this._data);
    }
    catch (d) {
        this.setTimeoutFn(() => { this._onError(d); }, 0);
        return;
    } typeof document < "u" && (this._index = us.requestsCount++, us.requests[this._index] = this); }
    _onError(i) { this.emitReserved("error", i, this._xhr), this._cleanup(!0); }
    _cleanup(i) { if (!(typeof this._xhr > "u" || this._xhr === null)) {
        if (this._xhr.onreadystatechange = Ub, i)
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
        attachEvent("onunload", vp);
    else if (typeof addEventListener == "function") {
        const l = "onpagehide" in Zt ? "pagehide" : "unload";
        addEventListener(l, vp, !1);
    }
}
function vp() { for (let l in us.requests)
    us.requests.hasOwnProperty(l) && us.requests[l].abort(); }
const Hb = (function () { const l = px({ xdomain: !1 }); return l && l.responseType !== null; })();
class Vb extends Lb {
    constructor(i) { super(i); const r = i && i.forceBase64; this.supportsBinary = Hb && !r; }
    request(i = {}) { return Object.assign(i, { xd: this.xd }, this.opts), new us(px, this.uri(), i); }
}
function px(l) { const i = l.xdomain; try {
    if (typeof XMLHttpRequest < "u" && (!i || Bb))
        return new XMLHttpRequest;
}
catch { } if (!i)
    try {
        return new Zt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    }
    catch { } }
const xx = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Qb extends Ju {
    get name() { return "websocket"; }
    doOpen() { const i = this.uri(), r = this.opts.protocols, c = xx ? {} : fx(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity"); this.opts.extraHeaders && (c.headers = this.opts.extraHeaders); try {
        this.ws = this.createSocket(i, r, c);
    }
    catch (d) {
        return this.emitReserved("error", d);
    } this.ws.binaryType = this.socket.binaryType, this.addEventListeners(); }
    addEventListeners() { this.ws.onopen = () => { this.opts.autoUnref && this.ws._socket.unref(), this.onOpen(); }, this.ws.onclose = i => this.onClose({ description: "websocket connection closed", context: i }), this.ws.onmessage = i => this.onData(i.data), this.ws.onerror = i => this.onError("websocket error", i); }
    write(i) { this.writable = !1; for (let r = 0; r < i.length; r++) {
        const c = i[r], d = r === i.length - 1;
        Xu(c, this.supportsBinary, m => { try {
            this.doWrite(c, m);
        }
        catch { } d && Er(() => { this.writable = !0, this.emitReserved("drain"); }, this.setTimeoutFn); });
    } }
    doClose() { typeof this.ws < "u" && (this.ws.onerror = () => { }, this.ws.close(), this.ws = null); }
    uri() { const i = this.opts.secure ? "wss" : "ws", r = this.query || {}; return this.opts.timestampRequests && (r[this.opts.timestampParam] = mx()), this.supportsBinary || (r.b64 = 1), this.createUri(i, r); }
}
const xu = Zt.WebSocket || Zt.MozWebSocket;
class Gb extends Qb {
    createSocket(i, r, c) { return xx ? new xu(i, r, c) : r ? new xu(i, r) : new xu(i); }
    doWrite(i, r) { this.ws.send(r); }
}
class Kb extends Ju {
    get name() { return "webtransport"; }
    doOpen() { try {
        this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    }
    catch (i) {
        return this.emitReserved("error", i);
    } this._transport.closed.then(() => { this.onClose(); }).catch(i => { this.onError("webtransport error", i); }), this._transport.ready.then(() => { this._transport.createBidirectionalStream().then(i => { const r = kb(Number.MAX_SAFE_INTEGER, this.socket.binaryType), c = i.readable.pipeThrough(r).getReader(), d = Sb(); d.readable.pipeTo(i.writable), this._writer = d.writable.getWriter(); const m = () => { c.read().then(({ done: x, value: g }) => { x || (this.onPacket(g), m()); }).catch(x => { }); }; m(); const h = { type: "open" }; this.query.sid && (h.data = `{"sid":"${this.query.sid}"}`), this._writer.write(h).then(() => this.onOpen()); }); }); }
    write(i) { this.writable = !1; for (let r = 0; r < i.length; r++) {
        const c = i[r], d = r === i.length - 1;
        this._writer.write(c).then(() => { d && Er(() => { this.writable = !0, this.emitReserved("drain"); }, this.setTimeoutFn); });
    } }
    doClose() { var i; (i = this._transport) === null || i === void 0 || i.close(); }
}
const Yb = { websocket: Gb, webtransport: Kb, polling: Vb }, Xb = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Zb = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
function Ou(l) { if (l.length > 8e3)
    throw "URI too long"; const i = l, r = l.indexOf("["), c = l.indexOf("]"); r != -1 && c != -1 && (l = l.substring(0, r) + l.substring(r, c).replace(/:/g, ";") + l.substring(c, l.length)); let d = Xb.exec(l || ""), m = {}, h = 14; for (; h--;)
    m[Zb[h]] = d[h] || ""; return r != -1 && c != -1 && (m.source = i, m.host = m.host.substring(1, m.host.length - 1).replace(/;/g, ":"), m.authority = m.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), m.ipv6uri = !0), m.pathNames = Jb(m, m.path), m.queryKey = Fb(m, m.query), m; }
function Jb(l, i) { const r = /\/{2,9}/g, c = i.replace(r, "/").split("/"); return (i.slice(0, 1) == "/" || i.length === 0) && c.splice(0, 1), i.slice(-1) == "/" && c.splice(c.length - 1, 1), c; }
function Fb(l, i) { const r = {}; return i.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function (c, d, m) { d && (r[d] = m); }), r; }
const zu = typeof addEventListener == "function" && typeof removeEventListener == "function", ur = [];
zu && addEventListener("offline", () => { ur.forEach(l => l()); }, !1);
class oa extends Xe {
    constructor(i, r) { if (super(), this.binaryType = Cb, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, i && typeof i == "object" && (r = i, i = null), i) {
        const c = Ou(i);
        r.hostname = c.host, r.secure = c.protocol === "https" || c.protocol === "wss", r.port = c.port, c.query && (r.query = c.query);
    }
    else
        r.host && (r.hostname = Ou(r.host).host); Mr(this, r), this.secure = r.secure != null ? r.secure : typeof location < "u" && location.protocol === "https:", r.hostname && !r.port && (r.port = this.secure ? "443" : "80"), this.hostname = r.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = r.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, r.transports.forEach(c => { const d = c.prototype.name; this.transports.push(d), this._transportsByName[d] = c; }), this.opts = Object.assign({ path: "/engine.io", agent: !1, withCredentials: !1, upgrade: !0, timestampParam: "t", rememberUpgrade: !1, addTrailingSlash: !0, rejectUnauthorized: !0, perMessageDeflate: { threshold: 1024 }, transportOptions: {}, closeOnBeforeunload: !1 }, r), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Db(this.opts.query)), zu && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => { this.transport && (this.transport.removeAllListeners(), this.transport.close()); }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => { this._onClose("transport close", { description: "network connection lost" }); }, ur.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open(); }
    createTransport(i) { const r = Object.assign({}, this.opts.query); r.EIO = dx, r.transport = i, this.id && (r.sid = this.id); const c = Object.assign({}, this.opts, { query: r, socket: this, hostname: this.hostname, secure: this.secure, port: this.port }, this.opts.transportOptions[i]); return new this._transportsByName[i](c); }
    _open() { if (this.transports.length === 0) {
        this.setTimeoutFn(() => { this.emitReserved("error", "No transports available"); }, 0);
        return;
    } const i = this.opts.rememberUpgrade && oa.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0]; this.readyState = "opening"; const r = this.createTransport(i); r.open(), this.setTransport(r); }
    setTransport(i) { this.transport && this.transport.removeAllListeners(), this.transport = i, i.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", r => this._onClose("transport close", r)); }
    onOpen() { this.readyState = "open", oa.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush(); }
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
        const d = this.writeBuffer[c].data;
        if (d && (r += _b(d)), c > 0 && r > this._maxPayload)
            return this.writeBuffer.slice(0, c);
        r += 2;
    } return this.writeBuffer; }
    _hasPingExpired() { if (!this._pingTimeoutTime)
        return !0; const i = Date.now() > this._pingTimeoutTime; return i && (this._pingTimeoutTime = 0, Er(() => { this._onClose("ping timeout"); }, this.setTimeoutFn)), i; }
    write(i, r, c) { return this._sendPacket("message", i, r, c), this; }
    send(i, r, c) { return this._sendPacket("message", i, r, c), this; }
    _sendPacket(i, r, c, d) { if (typeof r == "function" && (d = r, r = void 0), typeof c == "function" && (d = c, c = null), this.readyState === "closing" || this.readyState === "closed")
        return; c = c || {}, c.compress = c.compress !== !1; const m = { type: i, data: r, options: c }; this.emitReserved("packetCreate", m), this.writeBuffer.push(m), d && this.once("flush", d), this.flush(); }
    close() { const i = () => { this._onClose("forced close"), this.transport.close(); }, r = () => { this.off("upgrade", r), this.off("upgradeError", r), i(); }, c = () => { this.once("upgrade", r), this.once("upgradeError", r); }; return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => { this.upgrading ? c() : i(); }) : this.upgrading ? c() : i()), this; }
    _onError(i) { if (oa.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
        return this.transports.shift(), this._open(); this.emitReserved("error", i), this._onClose("transport error", i); }
    _onClose(i, r) { if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
        if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), zu && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
            const c = ur.indexOf(this._offlineEventListener);
            c !== -1 && ur.splice(c, 1);
        }
        this.readyState = "closed", this.id = null, this.emitReserved("close", i, r), this.writeBuffer = [], this._prevBufferLen = 0;
    } }
}
oa.protocol = dx;
class $b extends oa {
    constructor() { super(...arguments), this._upgrades = []; }
    onOpen() { if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
        for (let i = 0; i < this._upgrades.length; i++)
            this._probe(this._upgrades[i]); }
    _probe(i) { let r = this.createTransport(i), c = !1; oa.priorWebsocketSuccess = !1; const d = () => { c || (r.send([{ type: "ping", data: "probe" }]), r.once("packet", b => { if (!c)
        if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", r), !r)
                return;
            oa.priorWebsocketSuccess = r.name === "websocket", this.transport.pause(() => { c || this.readyState !== "closed" && (v(), this.setTransport(r), r.send([{ type: "upgrade" }]), this.emitReserved("upgrade", r), r = null, this.upgrading = !1, this.flush()); });
        }
        else {
            const A = new Error("probe error");
            A.transport = r.name, this.emitReserved("upgradeError", A);
        } })); }; function m() { c || (c = !0, v(), r.close(), r = null); } const h = b => { const A = new Error("probe error: " + b); A.transport = r.name, m(), this.emitReserved("upgradeError", A); }; function x() { h("transport closed"); } function g() { h("socket closed"); } function y(b) { r && b.name !== r.name && m(); } const v = () => { r.removeListener("open", d), r.removeListener("error", h), r.removeListener("close", x), this.off("close", g), this.off("upgrading", y); }; r.once("open", d), r.once("error", h), r.once("close", x), this.once("close", g), this.once("upgrading", y), this._upgrades.indexOf("webtransport") !== -1 && i !== "webtransport" ? this.setTimeoutFn(() => { c || r.open(); }, 200) : r.open(); }
    onHandshake(i) { this._upgrades = this._filterUpgrades(i.upgrades), super.onHandshake(i); }
    _filterUpgrades(i) { const r = []; for (let c = 0; c < i.length; c++)
        ~this.transports.indexOf(i[c]) && r.push(i[c]); return r; }
}
let Wb = class extends $b {
    constructor(i, r = {}) { const c = typeof i == "object" ? i : r; (!c.transports || c.transports && typeof c.transports[0] == "string") && (c.transports = (c.transports || ["polling", "websocket", "webtransport"]).map(d => Yb[d]).filter(d => !!d)), super(i, c); }
};
function Ib(l, i = "", r) { let c = l; r = r || typeof location < "u" && location, l == null && (l = r.protocol + "//" + r.host), typeof l == "string" && (l.charAt(0) === "/" && (l.charAt(1) === "/" ? l = r.protocol + l : l = r.host + l), /^(https?|wss?):\/\//.test(l) || (typeof r < "u" ? l = r.protocol + "//" + l : l = "https://" + l), c = Ou(l)), c.port || (/^(http|ws)$/.test(c.protocol) ? c.port = "80" : /^(http|ws)s$/.test(c.protocol) && (c.port = "443")), c.path = c.path || "/"; const m = c.host.indexOf(":") !== -1 ? "[" + c.host + "]" : c.host; return c.id = c.protocol + "://" + m + ":" + c.port + i, c.href = c.protocol + "://" + m + (r && r.port === c.port ? "" : ":" + c.port), c; }
const Pb = typeof ArrayBuffer == "function", ev = l => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(l) : l.buffer instanceof ArrayBuffer, gx = Object.prototype.toString, tv = typeof Blob == "function" || typeof Blob < "u" && gx.call(Blob) === "[object BlobConstructor]", sv = typeof File == "function" || typeof File < "u" && gx.call(File) === "[object FileConstructor]";
function Fu(l) { return Pb && (l instanceof ArrayBuffer || ev(l)) || tv && l instanceof Blob || sv && l instanceof File; }
function dr(l, i) { if (!l || typeof l != "object")
    return !1; if (Array.isArray(l)) {
    for (let r = 0, c = l.length; r < c; r++)
        if (dr(l[r]))
            return !0;
    return !1;
} if (Fu(l))
    return !0; if (l.toJSON && typeof l.toJSON == "function" && arguments.length === 1)
    return dr(l.toJSON(), !0); for (const r in l)
    if (Object.prototype.hasOwnProperty.call(l, r) && dr(l[r]))
        return !0; return !1; }
function av(l) { const i = [], r = l.data, c = l; return c.data = Du(r, i), c.attachments = i.length, { packet: c, buffers: i }; }
function Du(l, i) { if (!l)
    return l; if (Fu(l)) {
    const r = { _placeholder: !0, num: i.length };
    return i.push(l), r;
}
else if (Array.isArray(l)) {
    const r = new Array(l.length);
    for (let c = 0; c < l.length; c++)
        r[c] = Du(l[c], i);
    return r;
}
else if (typeof l == "object" && !(l instanceof Date)) {
    const r = {};
    for (const c in l)
        Object.prototype.hasOwnProperty.call(l, c) && (r[c] = Du(l[c], i));
    return r;
} return l; }
function lv(l, i) { return l.data = Ru(l.data, i), delete l.attachments, l; }
function Ru(l, i) { if (!l)
    return l; if (l && l._placeholder === !0) {
    if (typeof l.num == "number" && l.num >= 0 && l.num < i.length)
        return i[l.num];
    throw new Error("illegal attachments");
}
else if (Array.isArray(l))
    for (let r = 0; r < l.length; r++)
        l[r] = Ru(l[r], i);
else if (typeof l == "object")
    for (const r in l)
        Object.prototype.hasOwnProperty.call(l, r) && (l[r] = Ru(l[r], i)); return l; }
const nv = ["connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener"], iv = 5;
var ve;
(function (l) { l[l.CONNECT = 0] = "CONNECT", l[l.DISCONNECT = 1] = "DISCONNECT", l[l.EVENT = 2] = "EVENT", l[l.ACK = 3] = "ACK", l[l.CONNECT_ERROR = 4] = "CONNECT_ERROR", l[l.BINARY_EVENT = 5] = "BINARY_EVENT", l[l.BINARY_ACK = 6] = "BINARY_ACK"; })(ve || (ve = {}));
class rv {
    constructor(i) { this.replacer = i; }
    encode(i) { return (i.type === ve.EVENT || i.type === ve.ACK) && dr(i) ? this.encodeAsBinary({ type: i.type === ve.EVENT ? ve.BINARY_EVENT : ve.BINARY_ACK, nsp: i.nsp, data: i.data, id: i.id }) : [this.encodeAsString(i)]; }
    encodeAsString(i) { let r = "" + i.type; return (i.type === ve.BINARY_EVENT || i.type === ve.BINARY_ACK) && (r += i.attachments + "-"), i.nsp && i.nsp !== "/" && (r += i.nsp + ","), i.id != null && (r += i.id), i.data != null && (r += JSON.stringify(i.data, this.replacer)), r; }
    encodeAsBinary(i) { const r = av(i), c = this.encodeAsString(r.packet), d = r.buffers; return d.unshift(c), d; }
}
function jp(l) { return Object.prototype.toString.call(l) === "[object Object]"; }
class $u extends Xe {
    constructor(i) { super(), this.reviver = i; }
    add(i) { let r; if (typeof i == "string") {
        if (this.reconstructor)
            throw new Error("got plaintext data when reconstructing a packet");
        r = this.decodeString(i);
        const c = r.type === ve.BINARY_EVENT;
        c || r.type === ve.BINARY_ACK ? (r.type = c ? ve.EVENT : ve.ACK, this.reconstructor = new cv(r), r.attachments === 0 && super.emitReserved("decoded", r)) : super.emitReserved("decoded", r);
    }
    else if (Fu(i) || i.base64)
        if (this.reconstructor)
            r = this.reconstructor.takeBinaryData(i), r && (this.reconstructor = null, super.emitReserved("decoded", r));
        else
            throw new Error("got binary data when not reconstructing a packet");
    else
        throw new Error("Unknown type: " + i); }
    decodeString(i) { let r = 0; const c = { type: Number(i.charAt(0)) }; if (ve[c.type] === void 0)
        throw new Error("unknown packet type " + c.type); if (c.type === ve.BINARY_EVENT || c.type === ve.BINARY_ACK) {
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
        c.nsp = "/"; const d = i.charAt(r + 1); if (d !== "" && Number(d) == d) {
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
        if ($u.isPayloadValid(c.type, m))
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
        case ve.CONNECT: return jp(r);
        case ve.DISCONNECT: return r === void 0;
        case ve.CONNECT_ERROR: return typeof r == "string" || jp(r);
        case ve.EVENT:
        case ve.BINARY_EVENT: return Array.isArray(r) && (typeof r[0] == "number" || typeof r[0] == "string" && nv.indexOf(r[0]) === -1);
        case ve.ACK:
        case ve.BINARY_ACK: return Array.isArray(r);
    } }
    destroy() { this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null); }
}
class cv {
    constructor(i) { this.packet = i, this.buffers = [], this.reconPack = i; }
    takeBinaryData(i) { if (this.buffers.push(i), this.buffers.length === this.reconPack.attachments) {
        const r = lv(this.reconPack, this.buffers);
        return this.finishedReconstruction(), r;
    } return null; }
    finishedReconstruction() { this.reconPack = null, this.buffers = []; }
}
const ov = Object.freeze(Object.defineProperty({ __proto__: null, Decoder: $u, Encoder: rv, get PacketType() { return ve; }, protocol: iv }, Symbol.toStringTag, { value: "Module" }));
function es(l, i, r) { return l.on(i, r), function () { l.off(i, r); }; }
const uv = Object.freeze({ connect: 1, connect_error: 1, disconnect: 1, disconnecting: 1, newListener: 1, removeListener: 1 });
class yx extends Xe {
    constructor(i, r, c) { super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = i, this.nsp = r, c && c.auth && (this.auth = c.auth), this._opts = Object.assign({}, c), this.io._autoConnect && this.open(); }
    get disconnected() { return !this.connected; }
    subEvents() { if (this.subs)
        return; const i = this.io; this.subs = [es(i, "open", this.onopen.bind(this)), es(i, "packet", this.onpacket.bind(this)), es(i, "error", this.onerror.bind(this)), es(i, "close", this.onclose.bind(this))]; }
    get active() { return !!this.subs; }
    connect() { return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this); }
    open() { return this.connect(); }
    send(...i) { return i.unshift("message"), this.emit.apply(this, i), this; }
    emit(i, ...r) { var c, d, m; if (uv.hasOwnProperty(i))
        throw new Error('"' + i.toString() + '" is a reserved event name'); if (r.unshift(i), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
        return this._addToQueue(r), this; const h = { type: ve.EVENT, data: r }; if (h.options = {}, h.options.compress = this.flags.compress !== !1, typeof r[r.length - 1] == "function") {
        const v = this.ids++, b = r.pop();
        this._registerAckCallback(v, b), h.id = v;
    } const x = (d = (c = this.io.engine) === null || c === void 0 ? void 0 : c.transport) === null || d === void 0 ? void 0 : d.writable, g = this.connected && !(!((m = this.io.engine) === null || m === void 0) && m._hasPingExpired()); return this.flags.volatile && !x || (g ? (this.notifyOutgoingListeners(h), this.packet(h)) : this.sendBuffer.push(h)), this.flags = {}, this; }
    _registerAckCallback(i, r) { var c; const d = (c = this.flags.timeout) !== null && c !== void 0 ? c : this._opts.ackTimeout; if (d === void 0) {
        this.acks[i] = r;
        return;
    } const m = this.io.setTimeoutFn(() => { delete this.acks[i]; for (let x = 0; x < this.sendBuffer.length; x++)
        this.sendBuffer[x].id === i && this.sendBuffer.splice(x, 1); r.call(this, new Error("operation has timed out")); }, d), h = (...x) => { this.io.clearTimeoutFn(m), r.apply(this, x); }; h.withError = !0, this.acks[i] = h; }
    emitWithAck(i, ...r) { return new Promise((c, d) => { const m = (h, x) => h ? d(h) : c(x); m.withError = !0, r.push(m), this.emit(i, ...r); }); }
    _addToQueue(i) { let r; typeof i[i.length - 1] == "function" && (r = i.pop()); const c = { id: this._queueSeq++, tryCount: 0, pending: !1, args: i, flags: Object.assign({ fromQueue: !0 }, this.flags) }; i.push((d, ...m) => c !== this._queue[0] ? void 0 : (d !== null ? c.tryCount > this._opts.retries && (this._queue.shift(), r && r(d)) : (this._queue.shift(), r && r(null, ...m)), c.pending = !1, this._drainQueue())), this._queue.push(c), this._drainQueue(); }
    _drainQueue(i = !1) { if (!this.connected || this._queue.length === 0)
        return; const r = this._queue[0]; r.pending && !i || (r.pending = !0, r.tryCount++, this.flags = r.flags, this.emit.apply(this, r.args)); }
    packet(i) { i.nsp = this.nsp, this.io._packet(i); }
    onopen() { typeof this.auth == "function" ? this.auth(i => { this._sendConnectPacket(i); }) : this._sendConnectPacket(this.auth); }
    _sendConnectPacket(i) { this.packet({ type: ve.CONNECT, data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, i) : i }); }
    onerror(i) { this.connected || this.emitReserved("connect_error", i); }
    onclose(i, r) { this.connected = !1, delete this.id, this.emitReserved("disconnect", i, r), this._clearAcks(); }
    _clearAcks() { Object.keys(this.acks).forEach(i => { if (!this.sendBuffer.some(c => String(c.id) === i)) {
        const c = this.acks[i];
        delete this.acks[i], c.withError && c.call(this, new Error("socket has been disconnected"));
    } }); }
    onpacket(i) { if (i.nsp === this.nsp)
        switch (i.type) {
            case ve.CONNECT:
                i.data && i.data.sid ? this.onconnect(i.data.sid, i.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                break;
            case ve.EVENT:
            case ve.BINARY_EVENT:
                this.onevent(i);
                break;
            case ve.ACK:
            case ve.BINARY_ACK:
                this.onack(i);
                break;
            case ve.DISCONNECT:
                this.ondisconnect();
                break;
            case ve.CONNECT_ERROR:
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
    ack(i) { const r = this; let c = !1; return function (...d) { c || (c = !0, r.packet({ type: ve.ACK, id: i, data: d })); }; }
    onack(i) { const r = this.acks[i.id]; typeof r == "function" && (delete this.acks[i.id], r.withError && i.data.unshift(null), r.apply(this, i.data)); }
    onconnect(i, r) { this.id = i, this.recovered = r && this._pid === r, this._pid = r, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0); }
    emitBuffered() { this.receiveBuffer.forEach(i => this.emitEvent(i)), this.receiveBuffer = [], this.sendBuffer.forEach(i => { this.notifyOutgoingListeners(i), this.packet(i); }), this.sendBuffer = []; }
    ondisconnect() { this.destroy(), this.onclose("io server disconnect"); }
    destroy() { this.subs && (this.subs.forEach(i => i()), this.subs = void 0), this.io._destroy(this); }
    disconnect() { return this.connected && this.packet({ type: ve.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this; }
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
function Sl(l) { l = l || {}, this.ms = l.min || 100, this.max = l.max || 1e4, this.factor = l.factor || 2, this.jitter = l.jitter > 0 && l.jitter <= 1 ? l.jitter : 0, this.attempts = 0; }
Sl.prototype.duration = function () { var l = this.ms * Math.pow(this.factor, this.attempts++); if (this.jitter) {
    var i = Math.random(), r = Math.floor(i * this.jitter * l);
    l = (Math.floor(i * 10) & 1) == 0 ? l - r : l + r;
} return Math.min(l, this.max) | 0; };
Sl.prototype.reset = function () { this.attempts = 0; };
Sl.prototype.setMin = function (l) { this.ms = l; };
Sl.prototype.setMax = function (l) { this.max = l; };
Sl.prototype.setJitter = function (l) { this.jitter = l; };
class qu extends Xe {
    constructor(i, r) { var c; super(), this.nsps = {}, this.subs = [], i && typeof i == "object" && (r = i, i = void 0), r = r || {}, r.path = r.path || "/socket.io", this.opts = r, Mr(this, r), this.reconnection(r.reconnection !== !1), this.reconnectionAttempts(r.reconnectionAttempts || 1 / 0), this.reconnectionDelay(r.reconnectionDelay || 1e3), this.reconnectionDelayMax(r.reconnectionDelayMax || 5e3), this.randomizationFactor((c = r.randomizationFactor) !== null && c !== void 0 ? c : .5), this.backoff = new Sl({ min: this.reconnectionDelay(), max: this.reconnectionDelayMax(), jitter: this.randomizationFactor() }), this.timeout(r.timeout == null ? 2e4 : r.timeout), this._readyState = "closed", this.uri = i; const d = r.parser || ov; this.encoder = new d.Encoder, this.decoder = new d.Decoder, this._autoConnect = r.autoConnect !== !1, this._autoConnect && this.open(); }
    reconnection(i) { return arguments.length ? (this._reconnection = !!i, i || (this.skipReconnect = !0), this) : this._reconnection; }
    reconnectionAttempts(i) { return i === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = i, this); }
    reconnectionDelay(i) { var r; return i === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = i, (r = this.backoff) === null || r === void 0 || r.setMin(i), this); }
    randomizationFactor(i) { var r; return i === void 0 ? this._randomizationFactor : (this._randomizationFactor = i, (r = this.backoff) === null || r === void 0 || r.setJitter(i), this); }
    reconnectionDelayMax(i) { var r; return i === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = i, (r = this.backoff) === null || r === void 0 || r.setMax(i), this); }
    timeout(i) { return arguments.length ? (this._timeout = i, this) : this._timeout; }
    maybeReconnectOnOpen() { !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect(); }
    open(i) { if (~this._readyState.indexOf("open"))
        return this; this.engine = new Wb(this.uri, this.opts); const r = this.engine, c = this; this._readyState = "opening", this.skipReconnect = !1; const d = es(r, "open", function () { c.onopen(), i && i(); }), m = x => { this.cleanup(), this._readyState = "closed", this.emitReserved("error", x), i ? i(x) : this.maybeReconnectOnOpen(); }, h = es(r, "error", m); if (this._timeout !== !1) {
        const x = this._timeout, g = this.setTimeoutFn(() => { d(), m(new Error("timeout")), r.close(); }, x);
        this.opts.autoUnref && g.unref(), this.subs.push(() => { this.clearTimeoutFn(g); });
    } return this.subs.push(d), this.subs.push(h), this; }
    connect(i) { return this.open(i); }
    onopen() { this.cleanup(), this._readyState = "open", this.emitReserved("open"); const i = this.engine; this.subs.push(es(i, "ping", this.onping.bind(this)), es(i, "data", this.ondata.bind(this)), es(i, "error", this.onerror.bind(this)), es(i, "close", this.onclose.bind(this)), es(this.decoder, "decoded", this.ondecoded.bind(this))); }
    onping() { this.emitReserved("ping"); }
    ondata(i) { try {
        this.decoder.add(i);
    }
    catch (r) {
        this.onclose("parse error", r);
    } }
    ondecoded(i) { Er(() => { this.emitReserved("packet", i); }, this.setTimeoutFn); }
    onerror(i) { this.emitReserved("error", i); }
    socket(i, r) { let c = this.nsps[i]; return c ? this._autoConnect && !c.active && c.connect() : (c = new yx(this, i, r), this.nsps[i] = c), c; }
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
        const c = this.setTimeoutFn(() => { i.skipReconnect || (this.emitReserved("reconnect_attempt", i.backoff.attempts), !i.skipReconnect && i.open(d => { d ? (i._reconnecting = !1, i.reconnect(), this.emitReserved("reconnect_error", d)) : i.onreconnect(); })); }, r);
        this.opts.autoUnref && c.unref(), this.subs.push(() => { this.clearTimeoutFn(c); });
    } }
    onreconnect() { const i = this.backoff.attempts; this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", i); }
}
const wn = {};
function fr(l, i) { typeof l == "object" && (i = l, l = void 0), i = i || {}; const r = Ib(l, i.path || "/socket.io"), c = r.source, d = r.id, m = r.path, h = wn[d] && m in wn[d].nsps, x = i.forceNew || i["force new connection"] || i.multiplex === !1 || h; let g; return x ? g = new qu(c, i) : (wn[d] || (wn[d] = new qu(c, i)), g = wn[d]), r.query && !i.query && (i.query = r.queryKey), g.socket(r.path, i); }
Object.assign(fr, { Manager: qu, Socket: yx, io: fr, connect: fr });
const Np = l => { let i; const r = new Set, c = (y, v) => { const b = typeof y == "function" ? y(i) : y; if (!Object.is(b, i)) {
    const A = i;
    i = v ?? (typeof b != "object" || b === null) ? b : Object.assign({}, i, b), r.forEach(S => S(i, A));
} }, d = () => i, x = { setState: c, getState: d, getInitialState: () => g, subscribe: y => (r.add(y), () => r.delete(y)) }, g = i = l(c, d, x); return x; }, dv = (l => l ? Np(l) : Np), fv = l => l;
function mv(l, i = fv) { const r = An.useSyncExternalStore(l.subscribe, An.useCallback(() => i(l.getState()), [l, i]), An.useCallback(() => i(l.getInitialState()), [l, i])); return An.useDebugValue(r), r; }
const wp = l => { const i = dv(l), r = c => mv(i, c); return Object.assign(r, i), r; }, bx = (l => l ? wp(l) : wp);
function hv(l, i) { let r; try {
    r = l();
}
catch {
    return;
} return { getItem: d => { var m; const h = g => g === null ? null : JSON.parse(g, void 0), x = (m = r.getItem(d)) != null ? m : null; return x instanceof Promise ? x.then(h) : h(x); }, setItem: (d, m) => r.setItem(d, JSON.stringify(m, void 0)), removeItem: d => r.removeItem(d) }; }
const Bu = l => i => { try {
    const r = l(i);
    return r instanceof Promise ? r : { then(c) { return Bu(c)(r); }, catch(c) { return this; } };
}
catch (r) {
    return { then(c) { return this; }, catch(c) { return Bu(c)(r); } };
} }, pv = (l, i) => (r, c, d) => { let m = { storage: hv(() => localStorage), partialize: C => C, version: 0, merge: (C, _) => ({ ..._, ...C }), ...i }, h = !1; const x = new Set, g = new Set; let y = m.storage; if (!y)
    return l((...C) => { console.warn(`[zustand persist middleware] Unable to update item '${m.name}', the given storage is currently unavailable.`), r(...C); }, c, d); const v = () => { const C = m.partialize({ ...c() }); return y.setItem(m.name, { state: C, version: m.version }); }, b = d.setState; d.setState = (C, _) => (b(C, _), v()); const A = l((...C) => (r(...C), v()), c, d); d.getInitialState = () => A; let S; const N = () => { var C, _; if (!y)
    return; h = !1, x.forEach(X => { var H; return X((H = c()) != null ? H : A); }); const Q = ((_ = m.onRehydrateStorage) == null ? void 0 : _.call(m, (C = c()) != null ? C : A)) || void 0; return Bu(y.getItem.bind(y))(m.name).then(X => { if (X)
    if (typeof X.version == "number" && X.version !== m.version) {
        if (m.migrate) {
            const H = m.migrate(X.state, X.version);
            return H instanceof Promise ? H.then(J => [!0, J]) : [!0, H];
        }
        console.error("State loaded from storage couldn't be migrated since no migrate function was provided");
    }
    else
        return [!1, X.state]; return [!1, void 0]; }).then(X => { var H; const [J, $] = X; if (S = m.merge($, (H = c()) != null ? H : A), r(S, !0), J)
    return v(); }).then(() => { Q == null || Q(S, void 0), S = c(), h = !0, g.forEach(X => X(S)); }).catch(X => { Q == null || Q(void 0, X); }); }; return d.persist = { setOptions: C => { m = { ...m, ...C }, C.storage && (y = C.storage); }, clearStorage: () => { y == null || y.removeItem(m.name); }, getOptions: () => m, rehydrate: () => N(), hasHydrated: () => h, onHydrate: C => (x.add(C), () => { x.delete(C); }), onFinishHydration: C => (g.add(C), () => { g.delete(C); }) }, m.skipHydration || N(), S || A; }, xv = pv, fs = bx()(xv(l => ({ user: null, token: null, isAuthenticated: !1, login: (i, r) => l({ user: i, token: r, isAuthenticated: !0 }), logout: () => l({ user: null, token: null, isAuthenticated: !1 }), updateUser: i => l(r => ({ user: r.user ? { ...r.user, ...i } : null })) }), { name: "solaria-auth", partialize: l => ({ user: l.user, token: l.token, isAuthenticated: l.isAuthenticated }) })), vx = U.createContext(null), gv = "";
function yv({ children: l }) { const i = U.useRef(null), [r, c] = U.useState(!1), d = fs(v => v.token), m = fs(v => v.isAuthenticated), h = Jt(); U.useEffect(() => { if (!m || !d) {
    i.current && (i.current.disconnect(), i.current = null, c(!1));
    return;
} i.current = fr(gv, { auth: { token: d }, reconnection: !0, reconnectionAttempts: 5, reconnectionDelay: 1e3, reconnectionDelayMax: 5e3 }); const v = i.current; return v.on("connect", () => { console.log("[Socket] Connected:", v.id), c(!0); }), v.on("disconnect", b => { console.log("[Socket] Disconnected:", b), c(!1); }), v.on("connect_error", b => { console.error("[Socket] Connection error:", b.message), c(!1); }), v.on("agent:status", b => { h.invalidateQueries({ queryKey: ["agents"] }), b != null && b.agentId && h.invalidateQueries({ queryKey: ["agents", b.agentId] }); }), v.on("task:updated", b => { h.invalidateQueries({ queryKey: ["tasks"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.taskId && h.invalidateQueries({ queryKey: ["tasks", b.taskId] }), b != null && b.projectId && (h.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }), h.invalidateQueries({ queryKey: ["projects", b.projectId] })); }), v.on("task:created", b => { h.invalidateQueries({ queryKey: ["tasks"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.projectId && h.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }); }), v.on("task:completed", b => { h.invalidateQueries({ queryKey: ["tasks"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.taskId && h.invalidateQueries({ queryKey: ["tasks", b.taskId] }), b != null && b.projectId && (h.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }), h.invalidateQueries({ queryKey: ["projects", b.projectId] })); }), v.on("task:deleted", b => { h.invalidateQueries({ queryKey: ["tasks"] }), b != null && b.projectId && h.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }); }), v.on("project:updated", b => { h.invalidateQueries({ queryKey: ["projects"] }), h.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.projectId && h.invalidateQueries({ queryKey: ["projects", b.projectId] }); }), v.on("project:progress", b => { b != null && b.projectId && (h.invalidateQueries({ queryKey: ["projects", b.projectId] }), h.invalidateQueries({ queryKey: ["projects"] })); }), v.on("memory:created", () => { h.invalidateQueries({ queryKey: ["memories"] }); }), v.on("memory:updated", b => { h.invalidateQueries({ queryKey: ["memories"] }), b != null && b.memoryId && h.invalidateQueries({ queryKey: ["memories", b.memoryId] }); }), v.on("alert:critical", () => { h.invalidateQueries({ queryKey: ["dashboard", "alerts"] }), h.invalidateQueries({ queryKey: ["dashboard"] }); }), v.on("taskItem:completed", b => { b != null && b.taskId && (h.invalidateQueries({ queryKey: ["tasks", b.taskId, "items"] }), h.invalidateQueries({ queryKey: ["tasks", b.taskId] }), h.invalidateQueries({ queryKey: ["tasks"] })); }), v.on("taskItem:created", b => { b != null && b.taskId && (h.invalidateQueries({ queryKey: ["tasks", b.taskId, "items"] }), h.invalidateQueries({ queryKey: ["tasks", b.taskId] })); }), v.on("taskItem:updated", b => { b != null && b.taskId && (h.invalidateQueries({ queryKey: ["tasks", b.taskId, "items"] }), h.invalidateQueries({ queryKey: ["tasks", b.taskId] })); }), v.on("activity:new", () => { h.invalidateQueries({ queryKey: ["activity"] }); }), () => { v.disconnect(), i.current = null; }; }, [m, d, h]); const x = U.useCallback((v, b) => { var A; (A = i.current) != null && A.connected && i.current.emit(v, b); }, []), g = U.useCallback((v, b) => { var A; return (A = i.current) == null || A.on(v, b), () => { var S; (S = i.current) == null || S.off(v, b); }; }, []), y = U.useCallback((v, b) => { var A, S; b ? (A = i.current) == null || A.off(v, b) : (S = i.current) == null || S.removeAllListeners(v); }, []); return a.jsx(vx.Provider, { value: { socket: i.current, isConnected: r, emit: x, on: g, off: y }, children: l }); }
function bv() { const l = U.useContext(vx); if (!l)
    throw new Error("useSocketContext must be used within a SocketProvider"); return l; }
function jx(l, i) { return function () { return l.apply(i, arguments); }; }
const { toString: vv } = Object.prototype, { getPrototypeOf: Wu } = Object, { iterator: _r, toStringTag: Nx } = Symbol, Or = (l => i => { const r = vv.call(i); return l[r] || (l[r] = r.slice(8, -1).toLowerCase()); })(Object.create(null)), as = l => (l = l.toLowerCase(), i => Or(i) === l), zr = l => i => typeof i === l, { isArray: kl } = Array, wl = zr("undefined");
function zn(l) { return l !== null && !wl(l) && l.constructor !== null && !wl(l.constructor) && jt(l.constructor.isBuffer) && l.constructor.isBuffer(l); }
const wx = as("ArrayBuffer");
function jv(l) { let i; return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? i = ArrayBuffer.isView(l) : i = l && l.buffer && wx(l.buffer), i; }
const Nv = zr("string"), jt = zr("function"), Sx = zr("number"), Dn = l => l !== null && typeof l == "object", wv = l => l === !0 || l === !1, mr = l => { if (Or(l) !== "object")
    return !1; const i = Wu(l); return (i === null || i === Object.prototype || Object.getPrototypeOf(i) === null) && !(Nx in l) && !(_r in l); }, Sv = l => { if (!Dn(l) || zn(l))
    return !1; try {
    return Object.keys(l).length === 0 && Object.getPrototypeOf(l) === Object.prototype;
}
catch {
    return !1;
} }, kv = as("Date"), Av = as("File"), Cv = as("Blob"), Tv = as("FileList"), Ev = l => Dn(l) && jt(l.pipe), Mv = l => { let i; return l && (typeof FormData == "function" && l instanceof FormData || jt(l.append) && ((i = Or(l)) === "formdata" || i === "object" && jt(l.toString) && l.toString() === "[object FormData]")); }, _v = as("URLSearchParams"), [Ov, zv, Dv, Rv] = ["ReadableStream", "Request", "Response", "Headers"].map(as), qv = l => l.trim ? l.trim() : l.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Rn(l, i, { allOwnKeys: r = !1 } = {}) { if (l === null || typeof l > "u")
    return; let c, d; if (typeof l != "object" && (l = [l]), kl(l))
    for (c = 0, d = l.length; c < d; c++)
        i.call(null, l[c], c, l);
else {
    if (zn(l))
        return;
    const m = r ? Object.getOwnPropertyNames(l) : Object.keys(l), h = m.length;
    let x;
    for (c = 0; c < h; c++)
        x = m[c], i.call(null, l[x], x, l);
} }
function kx(l, i) { if (zn(l))
    return null; i = i.toLowerCase(); const r = Object.keys(l); let c = r.length, d; for (; c-- > 0;)
    if (d = r[c], i === d.toLowerCase())
        return d; return null; }
const za = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ax = l => !wl(l) && l !== za;
function Uu() { const { caseless: l, skipUndefined: i } = Ax(this) && this || {}, r = {}, c = (d, m) => { const h = l && kx(r, m) || m; mr(r[h]) && mr(d) ? r[h] = Uu(r[h], d) : mr(d) ? r[h] = Uu({}, d) : kl(d) ? r[h] = d.slice() : (!i || !wl(d)) && (r[h] = d); }; for (let d = 0, m = arguments.length; d < m; d++)
    arguments[d] && Rn(arguments[d], c); return r; }
const Bv = (l, i, r, { allOwnKeys: c } = {}) => (Rn(i, (d, m) => { r && jt(d) ? l[m] = jx(d, r) : l[m] = d; }, { allOwnKeys: c }), l), Uv = l => (l.charCodeAt(0) === 65279 && (l = l.slice(1)), l), Lv = (l, i, r, c) => { l.prototype = Object.create(i.prototype, c), l.prototype.constructor = l, Object.defineProperty(l, "super", { value: i.prototype }), r && Object.assign(l.prototype, r); }, Hv = (l, i, r, c) => { let d, m, h; const x = {}; if (i = i || {}, l == null)
    return i; do {
    for (d = Object.getOwnPropertyNames(l), m = d.length; m-- > 0;)
        h = d[m], (!c || c(h, l, i)) && !x[h] && (i[h] = l[h], x[h] = !0);
    l = r !== !1 && Wu(l);
} while (l && (!r || r(l, i)) && l !== Object.prototype); return i; }, Vv = (l, i, r) => { l = String(l), (r === void 0 || r > l.length) && (r = l.length), r -= i.length; const c = l.indexOf(i, r); return c !== -1 && c === r; }, Qv = l => { if (!l)
    return null; if (kl(l))
    return l; let i = l.length; if (!Sx(i))
    return null; const r = new Array(i); for (; i-- > 0;)
    r[i] = l[i]; return r; }, Gv = (l => i => l && i instanceof l)(typeof Uint8Array < "u" && Wu(Uint8Array)), Kv = (l, i) => { const c = (l && l[_r]).call(l); let d; for (; (d = c.next()) && !d.done;) {
    const m = d.value;
    i.call(l, m[0], m[1]);
} }, Yv = (l, i) => { let r; const c = []; for (; (r = l.exec(i)) !== null;)
    c.push(r); return c; }, Xv = as("HTMLFormElement"), Zv = l => l.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (r, c, d) { return c.toUpperCase() + d; }), Sp = (({ hasOwnProperty: l }) => (i, r) => l.call(i, r))(Object.prototype), Jv = as("RegExp"), Cx = (l, i) => { const r = Object.getOwnPropertyDescriptors(l), c = {}; Rn(r, (d, m) => { let h; (h = i(d, m, l)) !== !1 && (c[m] = h || d); }), Object.defineProperties(l, c); }, Fv = l => { Cx(l, (i, r) => { if (jt(l) && ["arguments", "caller", "callee"].indexOf(r) !== -1)
    return !1; const c = l[r]; if (jt(c)) {
    if (i.enumerable = !1, "writable" in i) {
        i.writable = !1;
        return;
    }
    i.set || (i.set = () => { throw Error("Can not rewrite read-only method '" + r + "'"); });
} }); }, $v = (l, i) => { const r = {}, c = d => { d.forEach(m => { r[m] = !0; }); }; return kl(l) ? c(l) : c(String(l).split(i)), r; }, Wv = () => { }, Iv = (l, i) => l != null && Number.isFinite(l = +l) ? l : i;
function Pv(l) { return !!(l && jt(l.append) && l[Nx] === "FormData" && l[_r]); }
const e1 = l => { const i = new Array(10), r = (c, d) => { if (Dn(c)) {
    if (i.indexOf(c) >= 0)
        return;
    if (zn(c))
        return c;
    if (!("toJSON" in c)) {
        i[d] = c;
        const m = kl(c) ? [] : {};
        return Rn(c, (h, x) => { const g = r(h, d + 1); !wl(g) && (m[x] = g); }), i[d] = void 0, m;
    }
} return c; }; return r(l, 0); }, t1 = as("AsyncFunction"), s1 = l => l && (Dn(l) || jt(l)) && jt(l.then) && jt(l.catch), Tx = ((l, i) => l ? setImmediate : i ? ((r, c) => (za.addEventListener("message", ({ source: d, data: m }) => { d === za && m === r && c.length && c.shift()(); }, !1), d => { c.push(d), za.postMessage(r, "*"); }))(`axios@${Math.random()}`, []) : r => setTimeout(r))(typeof setImmediate == "function", jt(za.postMessage)), a1 = typeof queueMicrotask < "u" ? queueMicrotask.bind(za) : typeof process < "u" && process.nextTick || Tx, l1 = l => l != null && jt(l[_r]), O = { isArray: kl, isArrayBuffer: wx, isBuffer: zn, isFormData: Mv, isArrayBufferView: jv, isString: Nv, isNumber: Sx, isBoolean: wv, isObject: Dn, isPlainObject: mr, isEmptyObject: Sv, isReadableStream: Ov, isRequest: zv, isResponse: Dv, isHeaders: Rv, isUndefined: wl, isDate: kv, isFile: Av, isBlob: Cv, isRegExp: Jv, isFunction: jt, isStream: Ev, isURLSearchParams: _v, isTypedArray: Gv, isFileList: Tv, forEach: Rn, merge: Uu, extend: Bv, trim: qv, stripBOM: Uv, inherits: Lv, toFlatObject: Hv, kindOf: Or, kindOfTest: as, endsWith: Vv, toArray: Qv, forEachEntry: Kv, matchAll: Yv, isHTMLForm: Xv, hasOwnProperty: Sp, hasOwnProp: Sp, reduceDescriptors: Cx, freezeMethods: Fv, toObjectSet: $v, toCamelCase: Zv, noop: Wv, toFiniteNumber: Iv, findKey: kx, global: za, isContextDefined: Ax, isSpecCompliantForm: Pv, toJSONObject: e1, isAsyncFn: t1, isThenable: s1, setImmediate: Tx, asap: a1, isIterable: l1 };
function ie(l, i, r, c, d) { Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = l, this.name = "AxiosError", i && (this.code = i), r && (this.config = r), c && (this.request = c), d && (this.response = d, this.status = d.status ? d.status : null); }
O.inherits(ie, Error, { toJSON: function () { return { message: this.message, name: this.name, description: this.description, number: this.number, fileName: this.fileName, lineNumber: this.lineNumber, columnNumber: this.columnNumber, stack: this.stack, config: O.toJSONObject(this.config), code: this.code, status: this.status }; } });
const Ex = ie.prototype, Mx = {};
["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(l => { Mx[l] = { value: l }; });
Object.defineProperties(ie, Mx);
Object.defineProperty(Ex, "isAxiosError", { value: !0 });
ie.from = (l, i, r, c, d, m) => { const h = Object.create(Ex); O.toFlatObject(l, h, function (v) { return v !== Error.prototype; }, y => y !== "isAxiosError"); const x = l && l.message ? l.message : "Error", g = i == null && l ? l.code : i; return ie.call(h, x, g, r, c, d), l && h.cause == null && Object.defineProperty(h, "cause", { value: l, configurable: !0 }), h.name = l && l.name || "Error", m && Object.assign(h, m), h; };
const n1 = null;
function Lu(l) { return O.isPlainObject(l) || O.isArray(l); }
function _x(l) { return O.endsWith(l, "[]") ? l.slice(0, -2) : l; }
function kp(l, i, r) { return l ? l.concat(i).map(function (d, m) { return d = _x(d), !r && m ? "[" + d + "]" : d; }).join(r ? "." : "") : i; }
function i1(l) { return O.isArray(l) && !l.some(Lu); }
const r1 = O.toFlatObject(O, {}, null, function (i) { return /^is[A-Z]/.test(i); });
function Dr(l, i, r) { if (!O.isObject(l))
    throw new TypeError("target must be an object"); i = i || new FormData, r = O.toFlatObject(r, { metaTokens: !0, dots: !1, indexes: !1 }, !1, function (C, _) { return !O.isUndefined(_[C]); }); const c = r.metaTokens, d = r.visitor || v, m = r.dots, h = r.indexes, g = (r.Blob || typeof Blob < "u" && Blob) && O.isSpecCompliantForm(i); if (!O.isFunction(d))
    throw new TypeError("visitor must be a function"); function y(N) { if (N === null)
    return ""; if (O.isDate(N))
    return N.toISOString(); if (O.isBoolean(N))
    return N.toString(); if (!g && O.isBlob(N))
    throw new ie("Blob is not supported. Use a Buffer instead."); return O.isArrayBuffer(N) || O.isTypedArray(N) ? g && typeof Blob == "function" ? new Blob([N]) : Buffer.from(N) : N; } function v(N, C, _) { let Q = N; if (N && !_ && typeof N == "object") {
    if (O.endsWith(C, "{}"))
        C = c ? C : C.slice(0, -2), N = JSON.stringify(N);
    else if (O.isArray(N) && i1(N) || (O.isFileList(N) || O.endsWith(C, "[]")) && (Q = O.toArray(N)))
        return C = _x(C), Q.forEach(function (H, J) { !(O.isUndefined(H) || H === null) && i.append(h === !0 ? kp([C], J, m) : h === null ? C : C + "[]", y(H)); }), !1;
} return Lu(N) ? !0 : (i.append(kp(_, C, m), y(N)), !1); } const b = [], A = Object.assign(r1, { defaultVisitor: v, convertValue: y, isVisitable: Lu }); function S(N, C) { if (!O.isUndefined(N)) {
    if (b.indexOf(N) !== -1)
        throw Error("Circular reference detected in " + C.join("."));
    b.push(N), O.forEach(N, function (Q, X) { (!(O.isUndefined(Q) || Q === null) && d.call(i, Q, O.isString(X) ? X.trim() : X, C, A)) === !0 && S(Q, C ? C.concat(X) : [X]); }), b.pop();
} } if (!O.isObject(l))
    throw new TypeError("data must be an object"); return S(l), i; }
function Ap(l) { const i = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+", "%00": "\0" }; return encodeURIComponent(l).replace(/[!'()~]|%20|%00/g, function (c) { return i[c]; }); }
function Iu(l, i) { this._pairs = [], l && Dr(l, this, i); }
const Ox = Iu.prototype;
Ox.append = function (i, r) { this._pairs.push([i, r]); };
Ox.toString = function (i) { const r = i ? function (c) { return i.call(this, c, Ap); } : Ap; return this._pairs.map(function (d) { return r(d[0]) + "=" + r(d[1]); }, "").join("&"); };
function c1(l) { return encodeURIComponent(l).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+"); }
function zx(l, i, r) { if (!i)
    return l; const c = r && r.encode || c1; O.isFunction(r) && (r = { serialize: r }); const d = r && r.serialize; let m; if (d ? m = d(i, r) : m = O.isURLSearchParams(i) ? i.toString() : new Iu(i, r).toString(c), m) {
    const h = l.indexOf("#");
    h !== -1 && (l = l.slice(0, h)), l += (l.indexOf("?") === -1 ? "?" : "&") + m;
} return l; }
class Cp {
    constructor() { this.handlers = []; }
    use(i, r, c) { return this.handlers.push({ fulfilled: i, rejected: r, synchronous: c ? c.synchronous : !1, runWhen: c ? c.runWhen : null }), this.handlers.length - 1; }
    eject(i) { this.handlers[i] && (this.handlers[i] = null); }
    clear() { this.handlers && (this.handlers = []); }
    forEach(i) { O.forEach(this.handlers, function (c) { c !== null && i(c); }); }
}
const Dx = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 }, o1 = typeof URLSearchParams < "u" ? URLSearchParams : Iu, u1 = typeof FormData < "u" ? FormData : null, d1 = typeof Blob < "u" ? Blob : null, f1 = { isBrowser: !0, classes: { URLSearchParams: o1, FormData: u1, Blob: d1 }, protocols: ["http", "https", "file", "blob", "url", "data"] }, Pu = typeof window < "u" && typeof document < "u", Hu = typeof navigator == "object" && navigator || void 0, m1 = Pu && (!Hu || ["ReactNative", "NativeScript", "NS"].indexOf(Hu.product) < 0), h1 = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function", p1 = Pu && window.location.href || "http://localhost", x1 = Object.freeze(Object.defineProperty({ __proto__: null, hasBrowserEnv: Pu, hasStandardBrowserEnv: m1, hasStandardBrowserWebWorkerEnv: h1, navigator: Hu, origin: p1 }, Symbol.toStringTag, { value: "Module" })), ft = { ...x1, ...f1 };
function g1(l, i) { return Dr(l, new ft.classes.URLSearchParams, { visitor: function (r, c, d, m) { return ft.isNode && O.isBuffer(r) ? (this.append(c, r.toString("base64")), !1) : m.defaultVisitor.apply(this, arguments); }, ...i }); }
function y1(l) { return O.matchAll(/\w+|\[(\w*)]/g, l).map(i => i[0] === "[]" ? "" : i[1] || i[0]); }
function b1(l) { const i = {}, r = Object.keys(l); let c; const d = r.length; let m; for (c = 0; c < d; c++)
    m = r[c], i[m] = l[m]; return i; }
function Rx(l) { function i(r, c, d, m) { let h = r[m++]; if (h === "__proto__")
    return !0; const x = Number.isFinite(+h), g = m >= r.length; return h = !h && O.isArray(d) ? d.length : h, g ? (O.hasOwnProp(d, h) ? d[h] = [d[h], c] : d[h] = c, !x) : ((!d[h] || !O.isObject(d[h])) && (d[h] = []), i(r, c, d[h], m) && O.isArray(d[h]) && (d[h] = b1(d[h])), !x); } if (O.isFormData(l) && O.isFunction(l.entries)) {
    const r = {};
    return O.forEachEntry(l, (c, d) => { i(y1(c), d, r, 0); }), r;
} return null; }
function v1(l, i, r) { if (O.isString(l))
    try {
        return (i || JSON.parse)(l), O.trim(l);
    }
    catch (c) {
        if (c.name !== "SyntaxError")
            throw c;
    } return (r || JSON.stringify)(l); }
const qn = { transitional: Dx, adapter: ["xhr", "http", "fetch"], transformRequest: [function (i, r) { const c = r.getContentType() || "", d = c.indexOf("application/json") > -1, m = O.isObject(i); if (m && O.isHTMLForm(i) && (i = new FormData(i)), O.isFormData(i))
            return d ? JSON.stringify(Rx(i)) : i; if (O.isArrayBuffer(i) || O.isBuffer(i) || O.isStream(i) || O.isFile(i) || O.isBlob(i) || O.isReadableStream(i))
            return i; if (O.isArrayBufferView(i))
            return i.buffer; if (O.isURLSearchParams(i))
            return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), i.toString(); let x; if (m) {
            if (c.indexOf("application/x-www-form-urlencoded") > -1)
                return g1(i, this.formSerializer).toString();
            if ((x = O.isFileList(i)) || c.indexOf("multipart/form-data") > -1) {
                const g = this.env && this.env.FormData;
                return Dr(x ? { "files[]": i } : i, g && new g, this.formSerializer);
            }
        } return m || d ? (r.setContentType("application/json", !1), v1(i)) : i; }], transformResponse: [function (i) { const r = this.transitional || qn.transitional, c = r && r.forcedJSONParsing, d = this.responseType === "json"; if (O.isResponse(i) || O.isReadableStream(i))
            return i; if (i && O.isString(i) && (c && !this.responseType || d)) {
            const h = !(r && r.silentJSONParsing) && d;
            try {
                return JSON.parse(i, this.parseReviver);
            }
            catch (x) {
                if (h)
                    throw x.name === "SyntaxError" ? ie.from(x, ie.ERR_BAD_RESPONSE, this, null, this.response) : x;
            }
        } return i; }], timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, maxBodyLength: -1, env: { FormData: ft.classes.FormData, Blob: ft.classes.Blob }, validateStatus: function (i) { return i >= 200 && i < 300; }, headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } } };
O.forEach(["delete", "get", "head", "post", "put", "patch"], l => { qn.headers[l] = {}; });
const j1 = O.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]), N1 = l => {
    const i = {};
    let r, c, d;
    return l && l.split(`
`).forEach(function (h) { d = h.indexOf(":"), r = h.substring(0, d).trim().toLowerCase(), c = h.substring(d + 1).trim(), !(!r || i[r] && j1[r]) && (r === "set-cookie" ? i[r] ? i[r].push(c) : i[r] = [c] : i[r] = i[r] ? i[r] + ", " + c : c); }), i;
}, Tp = Symbol("internals");
function Sn(l) { return l && String(l).trim().toLowerCase(); }
function hr(l) { return l === !1 || l == null ? l : O.isArray(l) ? l.map(hr) : String(l); }
function w1(l) { const i = Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; let c; for (; c = r.exec(l);)
    i[c[1]] = c[2]; return i; }
const S1 = l => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(l.trim());
function gu(l, i, r, c, d) { if (O.isFunction(c))
    return c.call(this, i, r); if (d && (i = r), !!O.isString(i)) {
    if (O.isString(c))
        return i.indexOf(c) !== -1;
    if (O.isRegExp(c))
        return c.test(i);
} }
function k1(l) { return l.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (i, r, c) => r.toUpperCase() + c); }
function A1(l, i) { const r = O.toCamelCase(" " + i); ["get", "set", "has"].forEach(c => { Object.defineProperty(l, c + r, { value: function (d, m, h) { return this[c].call(this, i, d, m, h); }, configurable: !0 }); }); }
let Nt = class {
    constructor(i) { i && this.set(i); }
    set(i, r, c) { const d = this; function m(x, g, y) { const v = Sn(g); if (!v)
        throw new Error("header name must be a non-empty string"); const b = O.findKey(d, v); (!b || d[b] === void 0 || y === !0 || y === void 0 && d[b] !== !1) && (d[b || g] = hr(x)); } const h = (x, g) => O.forEach(x, (y, v) => m(y, v, g)); if (O.isPlainObject(i) || i instanceof this.constructor)
        h(i, r);
    else if (O.isString(i) && (i = i.trim()) && !S1(i))
        h(N1(i), r);
    else if (O.isObject(i) && O.isIterable(i)) {
        let x = {}, g, y;
        for (const v of i) {
            if (!O.isArray(v))
                throw TypeError("Object iterator must return a key-value pair");
            x[y = v[0]] = (g = x[y]) ? O.isArray(g) ? [...g, v[1]] : [g, v[1]] : v[1];
        }
        h(x, r);
    }
    else
        i != null && m(r, i, c); return this; }
    get(i, r) { if (i = Sn(i), i) {
        const c = O.findKey(this, i);
        if (c) {
            const d = this[c];
            if (!r)
                return d;
            if (r === !0)
                return w1(d);
            if (O.isFunction(r))
                return r.call(this, d, c);
            if (O.isRegExp(r))
                return r.exec(d);
            throw new TypeError("parser must be boolean|regexp|function");
        }
    } }
    has(i, r) { if (i = Sn(i), i) {
        const c = O.findKey(this, i);
        return !!(c && this[c] !== void 0 && (!r || gu(this, this[c], c, r)));
    } return !1; }
    delete(i, r) { const c = this; let d = !1; function m(h) { if (h = Sn(h), h) {
        const x = O.findKey(c, h);
        x && (!r || gu(c, c[x], x, r)) && (delete c[x], d = !0);
    } } return O.isArray(i) ? i.forEach(m) : m(i), d; }
    clear(i) { const r = Object.keys(this); let c = r.length, d = !1; for (; c--;) {
        const m = r[c];
        (!i || gu(this, this[m], m, i, !0)) && (delete this[m], d = !0);
    } return d; }
    normalize(i) { const r = this, c = {}; return O.forEach(this, (d, m) => { const h = O.findKey(c, m); if (h) {
        r[h] = hr(d), delete r[m];
        return;
    } const x = i ? k1(m) : String(m).trim(); x !== m && delete r[m], r[x] = hr(d), c[x] = !0; }), this; }
    concat(...i) { return this.constructor.concat(this, ...i); }
    toJSON(i) { const r = Object.create(null); return O.forEach(this, (c, d) => { c != null && c !== !1 && (r[d] = i && O.isArray(c) ? c.join(", ") : c); }), r; }
    [Symbol.iterator]() { return Object.entries(this.toJSON())[Symbol.iterator](); }
    toString() {
        return Object.entries(this.toJSON()).map(([i, r]) => i + ": " + r).join(`
`);
    }
    getSetCookie() { return this.get("set-cookie") || []; }
    get [Symbol.toStringTag]() { return "AxiosHeaders"; }
    static from(i) { return i instanceof this ? i : new this(i); }
    static concat(i, ...r) { const c = new this(i); return r.forEach(d => c.set(d)), c; }
    static accessor(i) { const c = (this[Tp] = this[Tp] = { accessors: {} }).accessors, d = this.prototype; function m(h) { const x = Sn(h); c[x] || (A1(d, h), c[x] = !0); } return O.isArray(i) ? i.forEach(m) : m(i), this; }
};
Nt.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
O.reduceDescriptors(Nt.prototype, ({ value: l }, i) => { let r = i[0].toUpperCase() + i.slice(1); return { get: () => l, set(c) { this[r] = c; } }; });
O.freezeMethods(Nt);
function yu(l, i) { const r = this || qn, c = i || r, d = Nt.from(c.headers); let m = c.data; return O.forEach(l, function (x) { m = x.call(r, m, d.normalize(), i ? i.status : void 0); }), d.normalize(), m; }
function qx(l) { return !!(l && l.__CANCEL__); }
function Al(l, i, r) { ie.call(this, l ?? "canceled", ie.ERR_CANCELED, i, r), this.name = "CanceledError"; }
O.inherits(Al, ie, { __CANCEL__: !0 });
function Bx(l, i, r) { const c = r.config.validateStatus; !r.status || !c || c(r.status) ? l(r) : i(new ie("Request failed with status code " + r.status, [ie.ERR_BAD_REQUEST, ie.ERR_BAD_RESPONSE][Math.floor(r.status / 100) - 4], r.config, r.request, r)); }
function C1(l) { const i = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l); return i && i[1] || ""; }
function T1(l, i) { l = l || 10; const r = new Array(l), c = new Array(l); let d = 0, m = 0, h; return i = i !== void 0 ? i : 1e3, function (g) { const y = Date.now(), v = c[m]; h || (h = y), r[d] = g, c[d] = y; let b = m, A = 0; for (; b !== d;)
    A += r[b++], b = b % l; if (d = (d + 1) % l, d === m && (m = (m + 1) % l), y - h < i)
    return; const S = v && y - v; return S ? Math.round(A * 1e3 / S) : void 0; }; }
function E1(l, i) { let r = 0, c = 1e3 / i, d, m; const h = (y, v = Date.now()) => { r = v, d = null, m && (clearTimeout(m), m = null), l(...y); }; return [(...y) => { const v = Date.now(), b = v - r; b >= c ? h(y, v) : (d = y, m || (m = setTimeout(() => { m = null, h(d); }, c - b))); }, () => d && h(d)]; }
const yr = (l, i, r = 3) => { let c = 0; const d = T1(50, 250); return E1(m => { const h = m.loaded, x = m.lengthComputable ? m.total : void 0, g = h - c, y = d(g), v = h <= x; c = h; const b = { loaded: h, total: x, progress: x ? h / x : void 0, bytes: g, rate: y || void 0, estimated: y && x && v ? (x - h) / y : void 0, event: m, lengthComputable: x != null, [i ? "download" : "upload"]: !0 }; l(b); }, r); }, Ep = (l, i) => { const r = l != null; return [c => i[0]({ lengthComputable: r, total: l, loaded: c }), i[1]]; }, Mp = l => (...i) => O.asap(() => l(...i)), M1 = ft.hasStandardBrowserEnv ? ((l, i) => r => (r = new URL(r, ft.origin), l.protocol === r.protocol && l.host === r.host && (i || l.port === r.port)))(new URL(ft.origin), ft.navigator && /(msie|trident)/i.test(ft.navigator.userAgent)) : () => !0, _1 = ft.hasStandardBrowserEnv ? { write(l, i, r, c, d, m, h) { if (typeof document > "u")
        return; const x = [`${l}=${encodeURIComponent(i)}`]; O.isNumber(r) && x.push(`expires=${new Date(r).toUTCString()}`), O.isString(c) && x.push(`path=${c}`), O.isString(d) && x.push(`domain=${d}`), m === !0 && x.push("secure"), O.isString(h) && x.push(`SameSite=${h}`), document.cookie = x.join("; "); }, read(l) { if (typeof document > "u")
        return null; const i = document.cookie.match(new RegExp("(?:^|; )" + l + "=([^;]*)")); return i ? decodeURIComponent(i[1]) : null; }, remove(l) { this.write(l, "", Date.now() - 864e5, "/"); } } : { write() { }, read() { return null; }, remove() { } };
function O1(l) { return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(l); }
function z1(l, i) { return i ? l.replace(/\/?\/$/, "") + "/" + i.replace(/^\/+/, "") : l; }
function Ux(l, i, r) { let c = !O1(i); return l && (c || r == !1) ? z1(l, i) : i; }
const _p = l => l instanceof Nt ? { ...l } : l;
function Ra(l, i) { i = i || {}; const r = {}; function c(y, v, b, A) { return O.isPlainObject(y) && O.isPlainObject(v) ? O.merge.call({ caseless: A }, y, v) : O.isPlainObject(v) ? O.merge({}, v) : O.isArray(v) ? v.slice() : v; } function d(y, v, b, A) { if (O.isUndefined(v)) {
    if (!O.isUndefined(y))
        return c(void 0, y, b, A);
}
else
    return c(y, v, b, A); } function m(y, v) { if (!O.isUndefined(v))
    return c(void 0, v); } function h(y, v) { if (O.isUndefined(v)) {
    if (!O.isUndefined(y))
        return c(void 0, y);
}
else
    return c(void 0, v); } function x(y, v, b) { if (b in i)
    return c(y, v); if (b in l)
    return c(void 0, y); } const g = { url: m, method: m, data: m, baseURL: h, transformRequest: h, transformResponse: h, paramsSerializer: h, timeout: h, timeoutMessage: h, withCredentials: h, withXSRFToken: h, adapter: h, responseType: h, xsrfCookieName: h, xsrfHeaderName: h, onUploadProgress: h, onDownloadProgress: h, decompress: h, maxContentLength: h, maxBodyLength: h, beforeRedirect: h, transport: h, httpAgent: h, httpsAgent: h, cancelToken: h, socketPath: h, responseEncoding: h, validateStatus: x, headers: (y, v, b) => d(_p(y), _p(v), b, !0) }; return O.forEach(Object.keys({ ...l, ...i }), function (v) { const b = g[v] || d, A = b(l[v], i[v], v); O.isUndefined(A) && b !== x || (r[v] = A); }), r; }
const Lx = l => { const i = Ra({}, l); let { data: r, withXSRFToken: c, xsrfHeaderName: d, xsrfCookieName: m, headers: h, auth: x } = i; if (i.headers = h = Nt.from(h), i.url = zx(Ux(i.baseURL, i.url, i.allowAbsoluteUrls), l.params, l.paramsSerializer), x && h.set("Authorization", "Basic " + btoa((x.username || "") + ":" + (x.password ? unescape(encodeURIComponent(x.password)) : ""))), O.isFormData(r)) {
    if (ft.hasStandardBrowserEnv || ft.hasStandardBrowserWebWorkerEnv)
        h.setContentType(void 0);
    else if (O.isFunction(r.getHeaders)) {
        const g = r.getHeaders(), y = ["content-type", "content-length"];
        Object.entries(g).forEach(([v, b]) => { y.includes(v.toLowerCase()) && h.set(v, b); });
    }
} if (ft.hasStandardBrowserEnv && (c && O.isFunction(c) && (c = c(i)), c || c !== !1 && M1(i.url))) {
    const g = d && m && _1.read(m);
    g && h.set(d, g);
} return i; }, D1 = typeof XMLHttpRequest < "u", R1 = D1 && function (l) { return new Promise(function (r, c) { const d = Lx(l); let m = d.data; const h = Nt.from(d.headers).normalize(); let { responseType: x, onUploadProgress: g, onDownloadProgress: y } = d, v, b, A, S, N; function C() { S && S(), N && N(), d.cancelToken && d.cancelToken.unsubscribe(v), d.signal && d.signal.removeEventListener("abort", v); } let _ = new XMLHttpRequest; _.open(d.method.toUpperCase(), d.url, !0), _.timeout = d.timeout; function Q() { if (!_)
    return; const H = Nt.from("getAllResponseHeaders" in _ && _.getAllResponseHeaders()), $ = { data: !x || x === "text" || x === "json" ? _.responseText : _.response, status: _.status, statusText: _.statusText, headers: H, config: l, request: _ }; Bx(function (R) { r(R), C(); }, function (R) { c(R), C(); }, $), _ = null; } "onloadend" in _ ? _.onloadend = Q : _.onreadystatechange = function () { !_ || _.readyState !== 4 || _.status === 0 && !(_.responseURL && _.responseURL.indexOf("file:") === 0) || setTimeout(Q); }, _.onabort = function () { _ && (c(new ie("Request aborted", ie.ECONNABORTED, l, _)), _ = null); }, _.onerror = function (J) { const $ = J && J.message ? J.message : "Network Error", Y = new ie($, ie.ERR_NETWORK, l, _); Y.event = J || null, c(Y), _ = null; }, _.ontimeout = function () { let J = d.timeout ? "timeout of " + d.timeout + "ms exceeded" : "timeout exceeded"; const $ = d.transitional || Dx; d.timeoutErrorMessage && (J = d.timeoutErrorMessage), c(new ie(J, $.clarifyTimeoutError ? ie.ETIMEDOUT : ie.ECONNABORTED, l, _)), _ = null; }, m === void 0 && h.setContentType(null), "setRequestHeader" in _ && O.forEach(h.toJSON(), function (J, $) { _.setRequestHeader($, J); }), O.isUndefined(d.withCredentials) || (_.withCredentials = !!d.withCredentials), x && x !== "json" && (_.responseType = d.responseType), y && ([A, N] = yr(y, !0), _.addEventListener("progress", A)), g && _.upload && ([b, S] = yr(g), _.upload.addEventListener("progress", b), _.upload.addEventListener("loadend", S)), (d.cancelToken || d.signal) && (v = H => { _ && (c(!H || H.type ? new Al(null, l, _) : H), _.abort(), _ = null); }, d.cancelToken && d.cancelToken.subscribe(v), d.signal && (d.signal.aborted ? v() : d.signal.addEventListener("abort", v))); const X = C1(d.url); if (X && ft.protocols.indexOf(X) === -1) {
    c(new ie("Unsupported protocol " + X + ":", ie.ERR_BAD_REQUEST, l));
    return;
} _.send(m || null); }); }, q1 = (l, i) => { const { length: r } = l = l ? l.filter(Boolean) : []; if (i || r) {
    let c = new AbortController, d;
    const m = function (y) { if (!d) {
        d = !0, x();
        const v = y instanceof Error ? y : this.reason;
        c.abort(v instanceof ie ? v : new Al(v instanceof Error ? v.message : v));
    } };
    let h = i && setTimeout(() => { h = null, m(new ie(`timeout ${i} of ms exceeded`, ie.ETIMEDOUT)); }, i);
    const x = () => { l && (h && clearTimeout(h), h = null, l.forEach(y => { y.unsubscribe ? y.unsubscribe(m) : y.removeEventListener("abort", m); }), l = null); };
    l.forEach(y => y.addEventListener("abort", m));
    const { signal: g } = c;
    return g.unsubscribe = () => O.asap(x), g;
} }, B1 = function* (l, i) { let r = l.byteLength; if (r < i) {
    yield l;
    return;
} let c = 0, d; for (; c < r;)
    d = c + i, yield l.slice(c, d), c = d; }, U1 = async function* (l, i) { for await (const r of L1(l))
    yield* B1(r, i); }, L1 = async function* (l) { if (l[Symbol.asyncIterator]) {
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
} }, Op = (l, i, r, c) => { const d = U1(l, i); let m = 0, h, x = g => { h || (h = !0, c && c(g)); }; return new ReadableStream({ async pull(g) { try {
        const { done: y, value: v } = await d.next();
        if (y) {
            x(), g.close();
            return;
        }
        let b = v.byteLength;
        if (r) {
            let A = m += b;
            r(A);
        }
        g.enqueue(new Uint8Array(v));
    }
    catch (y) {
        throw x(y), y;
    } }, cancel(g) { return x(g), d.return(); } }, { highWaterMark: 2 }); }, zp = 64 * 1024, { isFunction: nr } = O, H1 = (({ Request: l, Response: i }) => ({ Request: l, Response: i }))(O.global), { ReadableStream: Dp, TextEncoder: Rp } = O.global, qp = (l, ...i) => { try {
    return !!l(...i);
}
catch {
    return !1;
} }, V1 = l => { l = O.merge.call({ skipUndefined: !0 }, H1, l); const { fetch: i, Request: r, Response: c } = l, d = i ? nr(i) : typeof fetch == "function", m = nr(r), h = nr(c); if (!d)
    return !1; const x = d && nr(Dp), g = d && (typeof Rp == "function" ? (N => C => N.encode(C))(new Rp) : async (N) => new Uint8Array(await new r(N).arrayBuffer())), y = m && x && qp(() => { let N = !1; const C = new r(ft.origin, { body: new Dp, method: "POST", get duplex() { return N = !0, "half"; } }).headers.has("Content-Type"); return N && !C; }), v = h && x && qp(() => O.isReadableStream(new c("").body)), b = { stream: v && (N => N.body) }; d && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach(N => { !b[N] && (b[N] = (C, _) => { let Q = C && C[N]; if (Q)
    return Q.call(C); throw new ie(`Response type '${N}' is not supported`, ie.ERR_NOT_SUPPORT, _); }); }); const A = async (N) => { if (N == null)
    return 0; if (O.isBlob(N))
    return N.size; if (O.isSpecCompliantForm(N))
    return (await new r(ft.origin, { method: "POST", body: N }).arrayBuffer()).byteLength; if (O.isArrayBufferView(N) || O.isArrayBuffer(N))
    return N.byteLength; if (O.isURLSearchParams(N) && (N = N + ""), O.isString(N))
    return (await g(N)).byteLength; }, S = async (N, C) => { const _ = O.toFiniteNumber(N.getContentLength()); return _ ?? A(C); }; return async (N) => { let { url: C, method: _, data: Q, signal: X, cancelToken: H, timeout: J, onDownloadProgress: $, onUploadProgress: Y, responseType: R, headers: G, withCredentials: ue = "same-origin", fetchOptions: nt } = Lx(N), Ve = i || fetch; R = R ? (R + "").toLowerCase() : "text"; let ke = q1([X, H && H.toAbortSignal()], J), Ie = null; const Ze = ke && ke.unsubscribe && (() => { ke.unsubscribe(); }); let he; try {
    if (Y && y && _ !== "get" && _ !== "head" && (he = await S(G, Q)) !== 0) {
        let ye = new r(C, { method: "POST", body: Q, duplex: "half" }), pe;
        if (O.isFormData(Q) && (pe = ye.headers.get("content-type")) && G.setContentType(pe), ye.body) {
            const [le, de] = Ep(he, yr(Mp(Y)));
            Q = Op(ye.body, zp, le, de);
        }
    }
    O.isString(ue) || (ue = ue ? "include" : "omit");
    const z = m && "credentials" in r.prototype, Z = { ...nt, signal: ke, method: _.toUpperCase(), headers: G.normalize().toJSON(), body: Q, duplex: "half", credentials: z ? ue : void 0 };
    Ie = m && new r(C, Z);
    let V = await (m ? Ve(Ie, nt) : Ve(C, Z));
    const ce = v && (R === "stream" || R === "response");
    if (v && ($ || ce && Ze)) {
        const ye = {};
        ["status", "statusText", "headers"].forEach(Pe => { ye[Pe] = V[Pe]; });
        const pe = O.toFiniteNumber(V.headers.get("content-length")), [le, de] = $ && Ep(pe, yr(Mp($), !0)) || [];
        V = new c(Op(V.body, zp, le, () => { de && de(), Ze && Ze(); }), ye);
    }
    R = R || "text";
    let je = await b[O.findKey(b, R) || "text"](V, N);
    return !ce && Ze && Ze(), await new Promise((ye, pe) => { Bx(ye, pe, { data: je, headers: Nt.from(V.headers), status: V.status, statusText: V.statusText, config: N, request: Ie }); });
}
catch (z) {
    throw Ze && Ze(), z && z.name === "TypeError" && /Load failed|fetch/i.test(z.message) ? Object.assign(new ie("Network Error", ie.ERR_NETWORK, N, Ie), { cause: z.cause || z }) : ie.from(z, z && z.code, N, Ie);
} }; }, Q1 = new Map, Hx = l => { let i = l && l.env || {}; const { fetch: r, Request: c, Response: d } = i, m = [c, d, r]; let h = m.length, x = h, g, y, v = Q1; for (; x--;)
    g = m[x], y = v.get(g), y === void 0 && v.set(g, y = x ? new Map : V1(i)), v = y; return y; };
Hx();
const ed = { http: n1, xhr: R1, fetch: { get: Hx } };
O.forEach(ed, (l, i) => { if (l) {
    try {
        Object.defineProperty(l, "name", { value: i });
    }
    catch { }
    Object.defineProperty(l, "adapterName", { value: i });
} });
const Bp = l => `- ${l}`, G1 = l => O.isFunction(l) || l === null || l === !1;
function K1(l, i) {
    l = O.isArray(l) ? l : [l];
    const { length: r } = l;
    let c, d;
    const m = {};
    for (let h = 0; h < r; h++) {
        c = l[h];
        let x;
        if (d = c, !G1(c) && (d = ed[(x = String(c)).toLowerCase()], d === void 0))
            throw new ie(`Unknown adapter '${x}'`);
        if (d && (O.isFunction(d) || (d = d.get(i))))
            break;
        m[x || "#" + h] = d;
    }
    if (!d) {
        const h = Object.entries(m).map(([g, y]) => `adapter ${g} ` + (y === !1 ? "is not supported by the environment" : "is not available in the build"));
        let x = r ? h.length > 1 ? `since :
` + h.map(Bp).join(`
`) : " " + Bp(h[0]) : "as no adapter specified";
        throw new ie("There is no suitable adapter to dispatch the request " + x, "ERR_NOT_SUPPORT");
    }
    return d;
}
const Vx = { getAdapter: K1, adapters: ed };
function bu(l) { if (l.cancelToken && l.cancelToken.throwIfRequested(), l.signal && l.signal.aborted)
    throw new Al(null, l); }
function Up(l) { return bu(l), l.headers = Nt.from(l.headers), l.data = yu.call(l, l.transformRequest), ["post", "put", "patch"].indexOf(l.method) !== -1 && l.headers.setContentType("application/x-www-form-urlencoded", !1), Vx.getAdapter(l.adapter || qn.adapter, l)(l).then(function (c) { return bu(l), c.data = yu.call(l, l.transformResponse, c), c.headers = Nt.from(c.headers), c; }, function (c) { return qx(c) || (bu(l), c && c.response && (c.response.data = yu.call(l, l.transformResponse, c.response), c.response.headers = Nt.from(c.response.headers))), Promise.reject(c); }); }
const Qx = "1.13.2", Rr = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((l, i) => { Rr[l] = function (c) { return typeof c === l || "a" + (i < 1 ? "n " : " ") + l; }; });
const Lp = {};
Rr.transitional = function (i, r, c) { function d(m, h) { return "[Axios v" + Qx + "] Transitional option '" + m + "'" + h + (c ? ". " + c : ""); } return (m, h, x) => { if (i === !1)
    throw new ie(d(h, " has been removed" + (r ? " in " + r : "")), ie.ERR_DEPRECATED); return r && !Lp[h] && (Lp[h] = !0, console.warn(d(h, " has been deprecated since v" + r + " and will be removed in the near future"))), i ? i(m, h, x) : !0; }; };
Rr.spelling = function (i) { return (r, c) => (console.warn(`${c} is likely a misspelling of ${i}`), !0); };
function Y1(l, i, r) { if (typeof l != "object")
    throw new ie("options must be an object", ie.ERR_BAD_OPTION_VALUE); const c = Object.keys(l); let d = c.length; for (; d-- > 0;) {
    const m = c[d], h = i[m];
    if (h) {
        const x = l[m], g = x === void 0 || h(x, m, l);
        if (g !== !0)
            throw new ie("option " + m + " must be " + g, ie.ERR_BAD_OPTION_VALUE);
        continue;
    }
    if (r !== !0)
        throw new ie("Unknown option " + m, ie.ERR_BAD_OPTION);
} }
const pr = { assertOptions: Y1, validators: Rr }, os = pr.validators;
let Da = class {
    constructor(i) { this.defaults = i || {}, this.interceptors = { request: new Cp, response: new Cp }; }
    async request(i, r) {
        try {
            return await this._request(i, r);
        }
        catch (c) {
            if (c instanceof Error) {
                let d = {};
                Error.captureStackTrace ? Error.captureStackTrace(d) : d = new Error;
                const m = d.stack ? d.stack.replace(/^.+\n/, "") : "";
                try {
                    c.stack ? m && !String(c.stack).endsWith(m.replace(/^.+\n.+\n/, "")) && (c.stack += `
` + m) : c.stack = m;
                }
                catch { }
            }
            throw c;
        }
    }
    _request(i, r) { typeof i == "string" ? (r = r || {}, r.url = i) : r = i || {}, r = Ra(this.defaults, r); const { transitional: c, paramsSerializer: d, headers: m } = r; c !== void 0 && pr.assertOptions(c, { silentJSONParsing: os.transitional(os.boolean), forcedJSONParsing: os.transitional(os.boolean), clarifyTimeoutError: os.transitional(os.boolean) }, !1), d != null && (O.isFunction(d) ? r.paramsSerializer = { serialize: d } : pr.assertOptions(d, { encode: os.function, serialize: os.function }, !0)), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), pr.assertOptions(r, { baseUrl: os.spelling("baseURL"), withXsrfToken: os.spelling("withXSRFToken") }, !0), r.method = (r.method || this.defaults.method || "get").toLowerCase(); let h = m && O.merge(m.common, m[r.method]); m && O.forEach(["delete", "get", "head", "post", "put", "patch", "common"], N => { delete m[N]; }), r.headers = Nt.concat(h, m); const x = []; let g = !0; this.interceptors.request.forEach(function (C) { typeof C.runWhen == "function" && C.runWhen(r) === !1 || (g = g && C.synchronous, x.unshift(C.fulfilled, C.rejected)); }); const y = []; this.interceptors.response.forEach(function (C) { y.push(C.fulfilled, C.rejected); }); let v, b = 0, A; if (!g) {
        const N = [Up.bind(this), void 0];
        for (N.unshift(...x), N.push(...y), A = N.length, v = Promise.resolve(r); b < A;)
            v = v.then(N[b++], N[b++]);
        return v;
    } A = x.length; let S = r; for (; b < A;) {
        const N = x[b++], C = x[b++];
        try {
            S = N(S);
        }
        catch (_) {
            C.call(this, _);
            break;
        }
    } try {
        v = Up.call(this, S);
    }
    catch (N) {
        return Promise.reject(N);
    } for (b = 0, A = y.length; b < A;)
        v = v.then(y[b++], y[b++]); return v; }
    getUri(i) { i = Ra(this.defaults, i); const r = Ux(i.baseURL, i.url, i.allowAbsoluteUrls); return zx(r, i.params, i.paramsSerializer); }
};
O.forEach(["delete", "get", "head", "options"], function (i) { Da.prototype[i] = function (r, c) { return this.request(Ra(c || {}, { method: i, url: r, data: (c || {}).data })); }; });
O.forEach(["post", "put", "patch"], function (i) { function r(c) { return function (m, h, x) { return this.request(Ra(x || {}, { method: i, headers: c ? { "Content-Type": "multipart/form-data" } : {}, url: m, data: h })); }; } Da.prototype[i] = r(), Da.prototype[i + "Form"] = r(!0); });
let X1 = class Gx {
    constructor(i) { if (typeof i != "function")
        throw new TypeError("executor must be a function."); let r; this.promise = new Promise(function (m) { r = m; }); const c = this; this.promise.then(d => { if (!c._listeners)
        return; let m = c._listeners.length; for (; m-- > 0;)
        c._listeners[m](d); c._listeners = null; }), this.promise.then = d => { let m; const h = new Promise(x => { c.subscribe(x), m = x; }).then(d); return h.cancel = function () { c.unsubscribe(m); }, h; }, i(function (m, h, x) { c.reason || (c.reason = new Al(m, h, x), r(c.reason)); }); }
    throwIfRequested() { if (this.reason)
        throw this.reason; }
    subscribe(i) { if (this.reason) {
        i(this.reason);
        return;
    } this._listeners ? this._listeners.push(i) : this._listeners = [i]; }
    unsubscribe(i) { if (!this._listeners)
        return; const r = this._listeners.indexOf(i); r !== -1 && this._listeners.splice(r, 1); }
    toAbortSignal() { const i = new AbortController, r = c => { i.abort(c); }; return this.subscribe(r), i.signal.unsubscribe = () => this.unsubscribe(r), i.signal; }
    static source() { let i; return { token: new Gx(function (d) { i = d; }), cancel: i }; }
};
function Z1(l) { return function (r) { return l.apply(null, r); }; }
function J1(l) { return O.isObject(l) && l.isAxiosError === !0; }
const Vu = { Continue: 100, SwitchingProtocols: 101, Processing: 102, EarlyHints: 103, Ok: 200, Created: 201, Accepted: 202, NonAuthoritativeInformation: 203, NoContent: 204, ResetContent: 205, PartialContent: 206, MultiStatus: 207, AlreadyReported: 208, ImUsed: 226, MultipleChoices: 300, MovedPermanently: 301, Found: 302, SeeOther: 303, NotModified: 304, UseProxy: 305, Unused: 306, TemporaryRedirect: 307, PermanentRedirect: 308, BadRequest: 400, Unauthorized: 401, PaymentRequired: 402, Forbidden: 403, NotFound: 404, MethodNotAllowed: 405, NotAcceptable: 406, ProxyAuthenticationRequired: 407, RequestTimeout: 408, Conflict: 409, Gone: 410, LengthRequired: 411, PreconditionFailed: 412, PayloadTooLarge: 413, UriTooLong: 414, UnsupportedMediaType: 415, RangeNotSatisfiable: 416, ExpectationFailed: 417, ImATeapot: 418, MisdirectedRequest: 421, UnprocessableEntity: 422, Locked: 423, FailedDependency: 424, TooEarly: 425, UpgradeRequired: 426, PreconditionRequired: 428, TooManyRequests: 429, RequestHeaderFieldsTooLarge: 431, UnavailableForLegalReasons: 451, InternalServerError: 500, NotImplemented: 501, BadGateway: 502, ServiceUnavailable: 503, GatewayTimeout: 504, HttpVersionNotSupported: 505, VariantAlsoNegotiates: 506, InsufficientStorage: 507, LoopDetected: 508, NotExtended: 510, NetworkAuthenticationRequired: 511, WebServerIsDown: 521, ConnectionTimedOut: 522, OriginIsUnreachable: 523, TimeoutOccurred: 524, SslHandshakeFailed: 525, InvalidSslCertificate: 526 };
Object.entries(Vu).forEach(([l, i]) => { Vu[i] = l; });
function Kx(l) { const i = new Da(l), r = jx(Da.prototype.request, i); return O.extend(r, Da.prototype, i, { allOwnKeys: !0 }), O.extend(r, i, null, { allOwnKeys: !0 }), r.create = function (d) { return Kx(Ra(l, d)); }, r; }
const He = Kx(qn);
He.Axios = Da;
He.CanceledError = Al;
He.CancelToken = X1;
He.isCancel = qx;
He.VERSION = Qx;
He.toFormData = Dr;
He.AxiosError = ie;
He.Cancel = He.CanceledError;
He.all = function (i) { return Promise.all(i); };
He.spread = Z1;
He.isAxiosError = J1;
He.mergeConfig = Ra;
He.AxiosHeaders = Nt;
He.formToJSON = l => Rx(O.isHTMLForm(l) ? new FormData(l) : l);
He.getAdapter = Vx.getAdapter;
He.HttpStatusCode = Vu;
He.default = He;
const { Axios: u4, AxiosError: d4, CanceledError: f4, isCancel: m4, CancelToken: h4, VERSION: p4, all: x4, Cancel: g4, isAxiosError: y4, spread: b4, toFormData: v4, AxiosHeaders: j4, HttpStatusCode: N4, formToJSON: w4, getAdapter: S4, mergeConfig: k4 } = He, F1 = "/api";
function $1(l) { return l.replace(/_([a-z])/g, (i, r) => r.toUpperCase()); }
function Qu(l) { if (Array.isArray(l))
    return l.map(Qu); if (l !== null && typeof l == "object" && !(l instanceof Date)) {
    const i = {};
    for (const [r, c] of Object.entries(l)) {
        const d = $1(r);
        i[d] = Qu(c);
    }
    return i;
} return l; }
const ae = He.create({ baseURL: F1, headers: { "Content-Type": "application/json" } });
ae.interceptors.request.use(l => { const i = fs.getState().token; return i && (l.headers.Authorization = `Bearer ${i}`), l; }, l => Promise.reject(l));
ae.interceptors.response.use(l => (l.data && (l.data = Qu(l.data)), l), l => { var i; return ((i = l.response) == null ? void 0 : i.status) === 401 && (fs.getState().logout(), window.location.href = "/v2/login"), Promise.reject(l); });
const Yx = { login: (l, i) => ae.post("/auth/login", { username: l, password: i }), verify: () => ae.get("/auth/verify"), logout: () => ae.post("/auth/logout") }, qr = { getAll: () => ae.get("/projects"), getById: l => ae.get(`/projects/${l}`), create: l => ae.post("/projects", l), update: (l, i) => ae.put(`/projects/${l}`, i), delete: l => ae.delete(`/projects/${l}`), checkCode: l => ae.get(`/projects/check-code/${l}`) }, td = { getByProject: l => ae.get(`/projects/${l}/epics`), create: (l, i) => ae.post(`/projects/${l}/epics`, i), update: (l, i) => ae.put(`/epics/${l}`, i), delete: l => ae.delete(`/epics/${l}`) }, sd = { getByProject: l => ae.get(`/projects/${l}/sprints`), create: (l, i) => ae.post(`/projects/${l}/sprints`, i), update: (l, i) => ae.put(`/sprints/${l}`, i), delete: l => ae.delete(`/sprints/${l}`) }, ls = { getAll: l => ae.get("/tasks", { params: l }), getById: l => ae.get(`/tasks/${l}`), create: l => ae.post("/tasks", l), update: (l, i) => ae.put(`/tasks/${l}`, i), complete: (l, i) => ae.put(`/tasks/${l}/complete`, { notes: i }), delete: l => ae.delete(`/tasks/${l}`), getItems: l => ae.get(`/tasks/${l}/items`), createItems: (l, i) => ae.post(`/tasks/${l}/items`, { items: i }), completeItem: (l, i, r) => ae.put(`/tasks/${l}/items/${i}/complete`, r), getTags: l => ae.get(`/tasks/${l}/tags`), addTag: (l, i) => ae.post(`/tasks/${l}/tags`, { tag_id: i }), addTagByName: (l, i) => ae.post(`/tasks/${l}/tags`, { tag_name: i }), removeTag: (l, i) => ae.delete(`/tasks/${l}/tags/${i}`) }, W1 = { getAll: () => ae.get("/tags"), getTasksByTag: (l, i) => ae.get(`/tasks/by-tag/${l}`, { params: i }) }, I1 = { getAll: () => ae.get("/agents"), getById: l => ae.get(`/agents/${l}`), updateStatus: (l, i, r) => ae.put(`/agents/${l}/status`, { status: i, currentTask: r }), getTasks: (l, i) => ae.get(`/agents/${l}/tasks`, { params: { status: i } }) }, Br = { getAll: l => ae.get("/memories", { params: l }), getById: l => ae.get(`/memories/${l}`), search: (l, i) => ae.get("/memories/search", { params: { q: l, tags: i == null ? void 0 : i.join(",") } }), create: l => ae.post("/memories", l), update: (l, i) => ae.put(`/memories/${l}`, i), delete: l => ae.delete(`/memories/${l}`), boost: (l, i) => ae.post(`/memories/${l}/boost`, { amount: i }), getRelated: l => ae.get(`/memories/${l}/related`), getTags: () => ae.get("/memories/tags"), getStats: () => ae.get("/memories/stats") }, Xx = { getOverview: () => ae.get("/dashboard/overview"), getAlerts: () => ae.get("/dashboard/alerts"), getActivity: l => ae.get("/activity", { params: { limit: l } }) };
function P1() { const [l, i] = U.useState(!0), { token: r, isAuthenticated: c, logout: d, login: m } = fs(); return U.useEffect(() => { async function h() { if (!r) {
    i(!1);
    return;
} try {
    const { data: x } = await Yx.verify();
    x.success && x.user ? m(x.user, r) : d();
}
catch {
    d();
}
finally {
    i(!1);
} } h(); }, []), { isChecking: l, isAuthenticated: c }; } /**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ej = l => l.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Zx = (...l) => l.filter((i, r, c) => !!i && i.trim() !== "" && c.indexOf(i) === r).join(" ").trim(); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var tj = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }; /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const sj = U.forwardRef(({ color: l = "currentColor", size: i = 24, strokeWidth: r = 2, absoluteStrokeWidth: c, className: d = "", children: m, iconNode: h, ...x }, g) => U.createElement("svg", { ref: g, ...tj, width: i, height: i, stroke: l, strokeWidth: c ? Number(r) * 24 / Number(i) : r, className: Zx("lucide", d), ...x }, [...h.map(([y, v]) => U.createElement(y, v)), ...Array.isArray(m) ? m : [m]])); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const K = (l, i) => { const r = U.forwardRef(({ className: c, ...d }, m) => U.createElement(sj, { ref: m, iconNode: i, className: Zx(`lucide-${ej(l)}`, c), ...d })); return r.displayName = `${l}`, r; }; /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const _n = K("Activity", [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2", key: "169zse" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const aj = K("AlignLeft", [["path", { d: "M15 12H3", key: "6jk70r" }], ["path", { d: "M17 18H3", key: "1amg6g" }], ["path", { d: "M21 6H3", key: "1jwq7v" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xr = K("Archive", [["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }], ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }], ["path", { d: "M10 12h4", key: "a56b0p" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Jx = K("ArrowDown", [["path", { d: "M12 5v14", key: "s699le" }], ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const On = K("ArrowLeft", [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gr = K("ArrowUp", [["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }], ["path", { d: "M12 19V5", key: "x0mq9r" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Fx = K("Bell", [["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326", key: "11g9vi" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ur = K("Bot", [["path", { d: "M12 8V4H8", key: "hb8ula" }], ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }], ["path", { d: "M2 14h2", key: "vft8re" }], ["path", { d: "M20 14h2", key: "4cs60a" }], ["path", { d: "M15 13v2", key: "1xurst" }], ["path", { d: "M9 13v2", key: "rq6x2g" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Lr = K("Brain", [["path", { d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z", key: "l5xja" }], ["path", { d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z", key: "ep3f8r" }], ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }], ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }], ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }], ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }], ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }], ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }], ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ad = K("Briefcase", [["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }], ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const lj = K("Building2", [["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }], ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }], ["path", { d: "M10 6h4", key: "1itunk" }], ["path", { d: "M10 10h4", key: "tcdvrf" }], ["path", { d: "M10 14h4", key: "kelpxr" }], ["path", { d: "M10 18h4", key: "1ulq68" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const nj = K("CalendarDays", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 14h.01", key: "6423bh" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M16 14h.01", key: "1gbofw" }], ["path", { d: "M8 18h.01", key: "lrp35t" }], ["path", { d: "M12 18h.01", key: "mhygvu" }], ["path", { d: "M16 18h.01", key: "kzsmim" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ua = K("Calendar", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ij = K("Camera", [["path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z", key: "1tc9qg" }], ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const rj = K("ChartColumn", [["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }], ["path", { d: "M18 17V9", key: "2bz60n" }], ["path", { d: "M13 17V5", key: "1frdt8" }], ["path", { d: "M8 17v-3", key: "17ska0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cj = K("ChartNoAxesColumnIncreasing", [["line", { x1: "12", x2: "12", y1: "20", y2: "10", key: "1vz5eb" }], ["line", { x1: "18", x2: "18", y1: "20", y2: "4", key: "cun8e5" }], ["line", { x1: "6", x2: "6", y1: "20", y2: "16", key: "hq0ia6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const oj = K("CheckCheck", [["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }], ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Mn = K("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const uj = K("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $x = K("ChevronLeft", [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ld = K("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wt = K("CircleAlert", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }], ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const br = K("CircleCheckBig", [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const at = K("CircleCheck", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const dj = K("CircleDot", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Wx = K("CirclePlus", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M8 12h8", key: "1wcyev" }], ["path", { d: "M12 8v8", key: "napkw2" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Hp = K("CircleX", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m15 9-6 6", key: "1uzhvr" }], ["path", { d: "m9 9 6 6", key: "z0biqf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $e = K("Clock", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Vp = K("Cloud", [["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fj = K("Columns3", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M9 3v18", key: "fh3hqa" }], ["path", { d: "M15 3v18", key: "14nvp0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Tn = K("Copy", [["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mj = K("Database", [["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }], ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }], ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ix = K("DollarSign", [["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }], ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ts = K("ExternalLink", [["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "M10 14 21 3", key: "gplh6r" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const vu = K("EyeOff", [["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49", key: "ct8e1f" }], ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }], ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143", key: "13bj9a" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ju = K("Eye", [["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0", key: "1nclc0" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Px = K("FileText", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M10 9H8", key: "b1mrlr" }], ["path", { d: "M16 13H8", key: "t4e002" }], ["path", { d: "M16 17H8", key: "z1uh3a" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const hj = K("Filter", [["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const eg = K("Flag", [["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", key: "i9b6wo" }], ["line", { x1: "4", x2: "4", y1: "22", y2: "15", key: "1cm3nv" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pj = K("FlaskConical", [["path", { d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2", key: "18mbvz" }], ["path", { d: "M6.453 15h11.094", key: "3shlmq" }], ["path", { d: "M8.5 2h7", key: "csnxdl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Nl = K("FolderKanban", [["path", { d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z", key: "1fr9dc" }], ["path", { d: "M8 10v4", key: "tgpxqk" }], ["path", { d: "M12 10v2", key: "hh53o1" }], ["path", { d: "M16 10v6", key: "1d6xys" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const nd = K("Folder", [["path", { d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z", key: "1kt360" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Qp = K("GitBranch", [["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }], ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }], ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }], ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const tg = K("Globe", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }], ["path", { d: "M2 12h20", key: "9i4pu4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const id = K("GraduationCap", [["path", { d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z", key: "j76jl0" }], ["path", { d: "M22 10v6", key: "1lu8f3" }], ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xj = K("GripVertical", [["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }], ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }], ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }], ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }], ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }], ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const sg = K("Hourglass", [["path", { d: "M5 22h14", key: "ehvnwv" }], ["path", { d: "M5 2h14", key: "pdyrp9" }], ["path", { d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22", key: "1d314k" }], ["path", { d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2", key: "1vvvr6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ag = K("Info", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 16v-4", key: "1dtifu" }], ["path", { d: "M12 8h.01", key: "e9boi3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Gp = K("Key", [["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }], ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }], ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gj = K("Laptop", [["path", { d: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16", key: "tarvll" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const yj = K("LayoutDashboard", [["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }], ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }], ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }], ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Bn = K("LayoutGrid", [["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }], ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }], ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }], ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const lg = K("Link2", [["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }], ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }], ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const bj = K("Link", [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const vj = K("ListChecks", [["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ng = K("ListTodo", [["rect", { x: "3", y: "5", width: "6", height: "6", rx: "1", key: "1defrl" }], ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Un = K("List", [["path", { d: "M3 12h.01", key: "nlz23k" }], ["path", { d: "M3 18h.01", key: "1tta3j" }], ["path", { d: "M3 6h.01", key: "1rqtza" }], ["path", { d: "M8 12h13", key: "1za7za" }], ["path", { d: "M8 18h13", key: "1lx6n3" }], ["path", { d: "M8 6h13", key: "ik3vkj" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const We = K("LoaderCircle", [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const jj = K("Lock", [["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Nj = K("LogOut", [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }], ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ig = K("MessageSquare", [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Gu = K("Moon", [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wj = K("MousePointer", [["path", { d: "M12.586 12.586 19 19", key: "ea5xo7" }], ["path", { d: "M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z", key: "277e5u" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Kp = K("Network", [["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }], ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }], ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }], ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }], ["path", { d: "M12 12V8", key: "2874zd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const rg = K("Palette", [["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }], ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }], ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }], ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }], ["path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z", key: "12rzf8" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sj = K("PenLine", [["path", { d: "M12 20h9", key: "t2du7b" }], ["path", { d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z", key: "1ykcvy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qt = K("Plus", [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "M12 5v14", key: "s699le" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const kj = K("RectangleEllipsis", [["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }], ["path", { d: "M12 12h.01", key: "1mp3jc" }], ["path", { d: "M17 12h.01", key: "1m0b6t" }], ["path", { d: "M7 12h.01", key: "eqddd0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cg = K("Save", [["path", { d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", key: "1c8476" }], ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }], ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ln = K("Search", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Aj = K("Send", [["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z", key: "1ffxy3" }], ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ku = K("Server", [["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }], ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }], ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }], ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const rd = K("Settings", [["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", key: "1qme2f" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const og = K("Shield", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cd = K("SquareChartGantt", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M9 8h7", key: "kbo1nt" }], ["path", { d: "M8 12h6", key: "ikassy" }], ["path", { d: "M11 16h5", key: "oq65wt" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Cj = K("SquareCheckBig", [["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const vr = K("SquarePen", [["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }], ["path", { d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z", key: "ohrbg2" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Tj = K("Square", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ej = K("Star", [["path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z", key: "r04s7s" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const jr = K("Sun", [["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }], ["path", { d: "M12 2v2", key: "tus03m" }], ["path", { d: "M12 20v2", key: "1lh1kg" }], ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }], ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }], ["path", { d: "M2 12h2", key: "1t8f8n" }], ["path", { d: "M20 12h2", key: "1q8mjw" }], ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }], ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ug = K("Tag", [["path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z", key: "vktsd0" }], ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const dg = K("Tags", [["path", { d: "m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19", key: "1cbfv1" }], ["path", { d: "M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z", key: "135mg7" }], ["circle", { cx: "6.5", cy: "9.5", r: ".5", fill: "currentColor", key: "5pm5xn" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Mj = K("Target", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const _j = K("Terminal", [["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }], ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fg = K("Trash2", [["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Hr = K("TrendingUp", [["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }], ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Yp = K("TriangleAlert", [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", key: "wmoenq" }], ["path", { d: "M12 9v4", key: "juzpu7" }], ["path", { d: "M12 17h.01", key: "p32p05" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Oj = K("Type", [["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }], ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }], ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const zs = K("User", [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }], ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mg = K("Users", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const zj = K("WifiOff", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }], ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }], ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }], ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }], ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Dj = K("Wifi", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }], ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qa = K("X", [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Nr = K("Zap", [["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z", key: "1xq2db" }]]), Vr = bx(l => ({ sidebarOpen: !0, theme: "dark", toggleSidebar: () => l(i => ({ sidebarOpen: !i.sidebarOpen })), setSidebarOpen: i => l({ sidebarOpen: i }), setTheme: i => l({ theme: i }), toggleTheme: () => l(i => ({ theme: i.theme === "light" ? "dark" : "light" })) })), Rj = (l, i) => { const r = new Array(l.length + i.length); for (let c = 0; c < l.length; c++)
    r[c] = l[c]; for (let c = 0; c < i.length; c++)
    r[l.length + c] = i[c]; return r; }, qj = (l, i) => ({ classGroupId: l, validator: i }), hg = (l = new Map, i = null, r) => ({ nextPart: l, validators: i, classGroupId: r }), wr = "-", Xp = [], Bj = "arbitrary..", Uj = l => { const i = Hj(l), { conflictingClassGroups: r, conflictingClassGroupModifiers: c } = l; return { getClassGroupId: h => { if (h.startsWith("[") && h.endsWith("]"))
        return Lj(h); const x = h.split(wr), g = x[0] === "" && x.length > 1 ? 1 : 0; return pg(x, g, i); }, getConflictingClassGroupIds: (h, x) => { if (x) {
        const g = c[h], y = r[h];
        return g ? y ? Rj(y, g) : g : y || Xp;
    } return r[h] || Xp; } }; }, pg = (l, i, r) => { if (l.length - i === 0)
    return r.classGroupId; const d = l[i], m = r.nextPart.get(d); if (m) {
    const y = pg(l, i + 1, m);
    if (y)
        return y;
} const h = r.validators; if (h === null)
    return; const x = i === 0 ? l.join(wr) : l.slice(i).join(wr), g = h.length; for (let y = 0; y < g; y++) {
    const v = h[y];
    if (v.validator(x))
        return v.classGroupId;
} }, Lj = l => l.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => { const i = l.slice(1, -1), r = i.indexOf(":"), c = i.slice(0, r); return c ? Bj + c : void 0; })(), Hj = l => { const { theme: i, classGroups: r } = l; return Vj(r, i); }, Vj = (l, i) => { const r = hg(); for (const c in l) {
    const d = l[c];
    od(d, r, c, i);
} return r; }, od = (l, i, r, c) => { const d = l.length; for (let m = 0; m < d; m++) {
    const h = l[m];
    Qj(h, i, r, c);
} }, Qj = (l, i, r, c) => { if (typeof l == "string") {
    Gj(l, i, r);
    return;
} if (typeof l == "function") {
    Kj(l, i, r, c);
    return;
} Yj(l, i, r, c); }, Gj = (l, i, r) => { const c = l === "" ? i : xg(i, l); c.classGroupId = r; }, Kj = (l, i, r, c) => { if (Xj(l)) {
    od(l(c), i, r, c);
    return;
} i.validators === null && (i.validators = []), i.validators.push(qj(r, l)); }, Yj = (l, i, r, c) => { const d = Object.entries(l), m = d.length; for (let h = 0; h < m; h++) {
    const [x, g] = d[h];
    od(g, xg(i, x), r, c);
} }, xg = (l, i) => { let r = l; const c = i.split(wr), d = c.length; for (let m = 0; m < d; m++) {
    const h = c[m];
    let x = r.nextPart.get(h);
    x || (x = hg(), r.nextPart.set(h, x)), r = x;
} return r; }, Xj = l => "isThemeGetter" in l && l.isThemeGetter === !0, Zj = l => { if (l < 1)
    return { get: () => { }, set: () => { } }; let i = 0, r = Object.create(null), c = Object.create(null); const d = (m, h) => { r[m] = h, i++, i > l && (i = 0, c = r, r = Object.create(null)); }; return { get(m) { let h = r[m]; if (h !== void 0)
        return h; if ((h = c[m]) !== void 0)
        return d(m, h), h; }, set(m, h) { m in r ? r[m] = h : d(m, h); } }; }, Yu = "!", Zp = ":", Jj = [], Jp = (l, i, r, c, d) => ({ modifiers: l, hasImportantModifier: i, baseClassName: r, maybePostfixModifierPosition: c, isExternal: d }), Fj = l => { const { prefix: i, experimentalParseClassName: r } = l; let c = d => { const m = []; let h = 0, x = 0, g = 0, y; const v = d.length; for (let C = 0; C < v; C++) {
    const _ = d[C];
    if (h === 0 && x === 0) {
        if (_ === Zp) {
            m.push(d.slice(g, C)), g = C + 1;
            continue;
        }
        if (_ === "/") {
            y = C;
            continue;
        }
    }
    _ === "[" ? h++ : _ === "]" ? h-- : _ === "(" ? x++ : _ === ")" && x--;
} const b = m.length === 0 ? d : d.slice(g); let A = b, S = !1; b.endsWith(Yu) ? (A = b.slice(0, -1), S = !0) : b.startsWith(Yu) && (A = b.slice(1), S = !0); const N = y && y > g ? y - g : void 0; return Jp(m, S, A, N); }; if (i) {
    const d = i + Zp, m = c;
    c = h => h.startsWith(d) ? m(h.slice(d.length)) : Jp(Jj, !1, h, void 0, !0);
} if (r) {
    const d = c;
    c = m => r({ className: m, parseClassName: d });
} return c; }, $j = l => { const i = new Map; return l.orderSensitiveModifiers.forEach((r, c) => { i.set(r, 1e6 + c); }), r => { const c = []; let d = []; for (let m = 0; m < r.length; m++) {
    const h = r[m], x = h[0] === "[", g = i.has(h);
    x || g ? (d.length > 0 && (d.sort(), c.push(...d), d = []), c.push(h)) : d.push(h);
} return d.length > 0 && (d.sort(), c.push(...d)), c; }; }, Wj = l => ({ cache: Zj(l.cacheSize), parseClassName: Fj(l), sortModifiers: $j(l), ...Uj(l) }), Ij = /\s+/, Pj = (l, i) => { const { parseClassName: r, getClassGroupId: c, getConflictingClassGroupIds: d, sortModifiers: m } = i, h = [], x = l.trim().split(Ij); let g = ""; for (let y = x.length - 1; y >= 0; y -= 1) {
    const v = x[y], { isExternal: b, modifiers: A, hasImportantModifier: S, baseClassName: N, maybePostfixModifierPosition: C } = r(v);
    if (b) {
        g = v + (g.length > 0 ? " " + g : g);
        continue;
    }
    let _ = !!C, Q = c(_ ? N.substring(0, C) : N);
    if (!Q) {
        if (!_) {
            g = v + (g.length > 0 ? " " + g : g);
            continue;
        }
        if (Q = c(N), !Q) {
            g = v + (g.length > 0 ? " " + g : g);
            continue;
        }
        _ = !1;
    }
    const X = A.length === 0 ? "" : A.length === 1 ? A[0] : m(A).join(":"), H = S ? X + Yu : X, J = H + Q;
    if (h.indexOf(J) > -1)
        continue;
    h.push(J);
    const $ = d(Q, _);
    for (let Y = 0; Y < $.length; ++Y) {
        const R = $[Y];
        h.push(H + R);
    }
    g = v + (g.length > 0 ? " " + g : g);
} return g; }, eN = (...l) => { let i = 0, r, c, d = ""; for (; i < l.length;)
    (r = l[i++]) && (c = gg(r)) && (d && (d += " "), d += c); return d; }, gg = l => { if (typeof l == "string")
    return l; let i, r = ""; for (let c = 0; c < l.length; c++)
    l[c] && (i = gg(l[c])) && (r && (r += " "), r += i); return r; }, tN = (l, ...i) => { let r, c, d, m; const h = g => { const y = i.reduce((v, b) => b(v), l()); return r = Wj(y), c = r.cache.get, d = r.cache.set, m = x, x(g); }, x = g => { const y = c(g); if (y)
    return y; const v = Pj(g, r); return d(g, v), v; }; return m = h, (...g) => m(eN(...g)); }, sN = [], Fe = l => { const i = r => r[l] || sN; return i.isThemeGetter = !0, i; }, yg = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, bg = /^\((?:(\w[\w-]*):)?(.+)\)$/i, aN = /^\d+\/\d+$/, lN = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, nN = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, iN = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, rN = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, cN = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, jl = l => aN.test(l), oe = l => !!l && !Number.isNaN(Number(l)), ca = l => !!l && Number.isInteger(Number(l)), Nu = l => l.endsWith("%") && oe(l.slice(0, -1)), Os = l => lN.test(l), oN = () => !0, uN = l => nN.test(l) && !iN.test(l), vg = () => !1, dN = l => rN.test(l), fN = l => cN.test(l), mN = l => !I(l) && !P(l), hN = l => Cl(l, wg, vg), I = l => yg.test(l), Oa = l => Cl(l, Sg, uN), wu = l => Cl(l, bN, oe), Fp = l => Cl(l, jg, vg), pN = l => Cl(l, Ng, fN), ir = l => Cl(l, kg, dN), P = l => bg.test(l), kn = l => Tl(l, Sg), xN = l => Tl(l, vN), $p = l => Tl(l, jg), gN = l => Tl(l, wg), yN = l => Tl(l, Ng), rr = l => Tl(l, kg, !0), Cl = (l, i, r) => { const c = yg.exec(l); return c ? c[1] ? i(c[1]) : r(c[2]) : !1; }, Tl = (l, i, r = !1) => { const c = bg.exec(l); return c ? c[1] ? i(c[1]) : r : !1; }, jg = l => l === "position" || l === "percentage", Ng = l => l === "image" || l === "url", wg = l => l === "length" || l === "size" || l === "bg-size", Sg = l => l === "length", bN = l => l === "number", vN = l => l === "family-name", kg = l => l === "shadow", jN = () => { const l = Fe("color"), i = Fe("font"), r = Fe("text"), c = Fe("font-weight"), d = Fe("tracking"), m = Fe("leading"), h = Fe("breakpoint"), x = Fe("container"), g = Fe("spacing"), y = Fe("radius"), v = Fe("shadow"), b = Fe("inset-shadow"), A = Fe("text-shadow"), S = Fe("drop-shadow"), N = Fe("blur"), C = Fe("perspective"), _ = Fe("aspect"), Q = Fe("ease"), X = Fe("animate"), H = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], J = () => ["center", "top", "bottom", "left", "right", "top-left", "left-top", "top-right", "right-top", "bottom-right", "right-bottom", "bottom-left", "left-bottom"], $ = () => [...J(), P, I], Y = () => ["auto", "hidden", "clip", "visible", "scroll"], R = () => ["auto", "contain", "none"], G = () => [P, I, g], ue = () => [jl, "full", "auto", ...G()], nt = () => [ca, "none", "subgrid", P, I], Ve = () => ["auto", { span: ["full", ca, P, I] }, ca, P, I], ke = () => [ca, "auto", P, I], Ie = () => ["auto", "min", "max", "fr", P, I], Ze = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], he = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], z = () => ["auto", ...G()], Z = () => [jl, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...G()], V = () => [l, P, I], ce = () => [...J(), $p, Fp, { position: [P, I] }], je = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }], ye = () => ["auto", "cover", "contain", gN, hN, { size: [P, I] }], pe = () => [Nu, kn, Oa], le = () => ["", "none", "full", y, P, I], de = () => ["", oe, kn, Oa], Pe = () => ["solid", "dashed", "dotted", "double"], Ft = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], Re = () => [oe, Nu, $p, Fp], fa = () => ["", "none", N, P, I], $t = () => ["none", oe, P, I], Ds = () => ["none", oe, P, I], Rs = () => [oe, P, I], qs = () => [jl, "full", ...G()]; return { cacheSize: 500, theme: { animate: ["spin", "ping", "pulse", "bounce"], aspect: ["video"], blur: [Os], breakpoint: [Os], color: [oN], container: [Os], "drop-shadow": [Os], ease: ["in", "out", "in-out"], font: [mN], "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"], "inset-shadow": [Os], leading: ["none", "tight", "snug", "normal", "relaxed", "loose"], perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"], radius: [Os], shadow: [Os], spacing: ["px", oe], text: [Os], "text-shadow": [Os], tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"] }, classGroups: { aspect: [{ aspect: ["auto", "square", jl, I, P, _] }], container: ["container"], columns: [{ columns: [oe, I, P, x] }], "break-after": [{ "break-after": H() }], "break-before": [{ "break-before": H() }], "break-inside": [{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] }], "box-decoration": [{ "box-decoration": ["slice", "clone"] }], box: [{ box: ["border", "content"] }], display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"], sr: ["sr-only", "not-sr-only"], float: [{ float: ["right", "left", "none", "start", "end"] }], clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }], isolation: ["isolate", "isolation-auto"], "object-fit": [{ object: ["contain", "cover", "fill", "none", "scale-down"] }], "object-position": [{ object: $() }], overflow: [{ overflow: Y() }], "overflow-x": [{ "overflow-x": Y() }], "overflow-y": [{ "overflow-y": Y() }], overscroll: [{ overscroll: R() }], "overscroll-x": [{ "overscroll-x": R() }], "overscroll-y": [{ "overscroll-y": R() }], position: ["static", "fixed", "absolute", "relative", "sticky"], inset: [{ inset: ue() }], "inset-x": [{ "inset-x": ue() }], "inset-y": [{ "inset-y": ue() }], start: [{ start: ue() }], end: [{ end: ue() }], top: [{ top: ue() }], right: [{ right: ue() }], bottom: [{ bottom: ue() }], left: [{ left: ue() }], visibility: ["visible", "invisible", "collapse"], z: [{ z: [ca, "auto", P, I] }], basis: [{ basis: [jl, "full", "auto", x, ...G()] }], "flex-direction": [{ flex: ["row", "row-reverse", "col", "col-reverse"] }], "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }], flex: [{ flex: [oe, jl, "auto", "initial", "none", I] }], grow: [{ grow: ["", oe, P, I] }], shrink: [{ shrink: ["", oe, P, I] }], order: [{ order: [ca, "first", "last", "none", P, I] }], "grid-cols": [{ "grid-cols": nt() }], "col-start-end": [{ col: Ve() }], "col-start": [{ "col-start": ke() }], "col-end": [{ "col-end": ke() }], "grid-rows": [{ "grid-rows": nt() }], "row-start-end": [{ row: Ve() }], "row-start": [{ "row-start": ke() }], "row-end": [{ "row-end": ke() }], "grid-flow": [{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] }], "auto-cols": [{ "auto-cols": Ie() }], "auto-rows": [{ "auto-rows": Ie() }], gap: [{ gap: G() }], "gap-x": [{ "gap-x": G() }], "gap-y": [{ "gap-y": G() }], "justify-content": [{ justify: [...Ze(), "normal"] }], "justify-items": [{ "justify-items": [...he(), "normal"] }], "justify-self": [{ "justify-self": ["auto", ...he()] }], "align-content": [{ content: ["normal", ...Ze()] }], "align-items": [{ items: [...he(), { baseline: ["", "last"] }] }], "align-self": [{ self: ["auto", ...he(), { baseline: ["", "last"] }] }], "place-content": [{ "place-content": Ze() }], "place-items": [{ "place-items": [...he(), "baseline"] }], "place-self": [{ "place-self": ["auto", ...he()] }], p: [{ p: G() }], px: [{ px: G() }], py: [{ py: G() }], ps: [{ ps: G() }], pe: [{ pe: G() }], pt: [{ pt: G() }], pr: [{ pr: G() }], pb: [{ pb: G() }], pl: [{ pl: G() }], m: [{ m: z() }], mx: [{ mx: z() }], my: [{ my: z() }], ms: [{ ms: z() }], me: [{ me: z() }], mt: [{ mt: z() }], mr: [{ mr: z() }], mb: [{ mb: z() }], ml: [{ ml: z() }], "space-x": [{ "space-x": G() }], "space-x-reverse": ["space-x-reverse"], "space-y": [{ "space-y": G() }], "space-y-reverse": ["space-y-reverse"], size: [{ size: Z() }], w: [{ w: [x, "screen", ...Z()] }], "min-w": [{ "min-w": [x, "screen", "none", ...Z()] }], "max-w": [{ "max-w": [x, "screen", "none", "prose", { screen: [h] }, ...Z()] }], h: [{ h: ["screen", "lh", ...Z()] }], "min-h": [{ "min-h": ["screen", "lh", "none", ...Z()] }], "max-h": [{ "max-h": ["screen", "lh", ...Z()] }], "font-size": [{ text: ["base", r, kn, Oa] }], "font-smoothing": ["antialiased", "subpixel-antialiased"], "font-style": ["italic", "not-italic"], "font-weight": [{ font: [c, P, wu] }], "font-stretch": [{ "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Nu, I] }], "font-family": [{ font: [xN, I, i] }], "fvn-normal": ["normal-nums"], "fvn-ordinal": ["ordinal"], "fvn-slashed-zero": ["slashed-zero"], "fvn-figure": ["lining-nums", "oldstyle-nums"], "fvn-spacing": ["proportional-nums", "tabular-nums"], "fvn-fraction": ["diagonal-fractions", "stacked-fractions"], tracking: [{ tracking: [d, P, I] }], "line-clamp": [{ "line-clamp": [oe, "none", P, wu] }], leading: [{ leading: [m, ...G()] }], "list-image": [{ "list-image": ["none", P, I] }], "list-style-position": [{ list: ["inside", "outside"] }], "list-style-type": [{ list: ["disc", "decimal", "none", P, I] }], "text-alignment": [{ text: ["left", "center", "right", "justify", "start", "end"] }], "placeholder-color": [{ placeholder: V() }], "text-color": [{ text: V() }], "text-decoration": ["underline", "overline", "line-through", "no-underline"], "text-decoration-style": [{ decoration: [...Pe(), "wavy"] }], "text-decoration-thickness": [{ decoration: [oe, "from-font", "auto", P, Oa] }], "text-decoration-color": [{ decoration: V() }], "underline-offset": [{ "underline-offset": [oe, "auto", P, I] }], "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"], "text-overflow": ["truncate", "text-ellipsis", "text-clip"], "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }], indent: [{ indent: G() }], "vertical-align": [{ align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", P, I] }], whitespace: [{ whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"] }], break: [{ break: ["normal", "words", "all", "keep"] }], wrap: [{ wrap: ["break-word", "anywhere", "normal"] }], hyphens: [{ hyphens: ["none", "manual", "auto"] }], content: [{ content: ["none", P, I] }], "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }], "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }], "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }], "bg-position": [{ bg: ce() }], "bg-repeat": [{ bg: je() }], "bg-size": [{ bg: ye() }], "bg-image": [{ bg: ["none", { linear: [{ to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] }, ca, P, I], radial: ["", P, I], conic: [ca, P, I] }, yN, pN] }], "bg-color": [{ bg: V() }], "gradient-from-pos": [{ from: pe() }], "gradient-via-pos": [{ via: pe() }], "gradient-to-pos": [{ to: pe() }], "gradient-from": [{ from: V() }], "gradient-via": [{ via: V() }], "gradient-to": [{ to: V() }], rounded: [{ rounded: le() }], "rounded-s": [{ "rounded-s": le() }], "rounded-e": [{ "rounded-e": le() }], "rounded-t": [{ "rounded-t": le() }], "rounded-r": [{ "rounded-r": le() }], "rounded-b": [{ "rounded-b": le() }], "rounded-l": [{ "rounded-l": le() }], "rounded-ss": [{ "rounded-ss": le() }], "rounded-se": [{ "rounded-se": le() }], "rounded-ee": [{ "rounded-ee": le() }], "rounded-es": [{ "rounded-es": le() }], "rounded-tl": [{ "rounded-tl": le() }], "rounded-tr": [{ "rounded-tr": le() }], "rounded-br": [{ "rounded-br": le() }], "rounded-bl": [{ "rounded-bl": le() }], "border-w": [{ border: de() }], "border-w-x": [{ "border-x": de() }], "border-w-y": [{ "border-y": de() }], "border-w-s": [{ "border-s": de() }], "border-w-e": [{ "border-e": de() }], "border-w-t": [{ "border-t": de() }], "border-w-r": [{ "border-r": de() }], "border-w-b": [{ "border-b": de() }], "border-w-l": [{ "border-l": de() }], "divide-x": [{ "divide-x": de() }], "divide-x-reverse": ["divide-x-reverse"], "divide-y": [{ "divide-y": de() }], "divide-y-reverse": ["divide-y-reverse"], "border-style": [{ border: [...Pe(), "hidden", "none"] }], "divide-style": [{ divide: [...Pe(), "hidden", "none"] }], "border-color": [{ border: V() }], "border-color-x": [{ "border-x": V() }], "border-color-y": [{ "border-y": V() }], "border-color-s": [{ "border-s": V() }], "border-color-e": [{ "border-e": V() }], "border-color-t": [{ "border-t": V() }], "border-color-r": [{ "border-r": V() }], "border-color-b": [{ "border-b": V() }], "border-color-l": [{ "border-l": V() }], "divide-color": [{ divide: V() }], "outline-style": [{ outline: [...Pe(), "none", "hidden"] }], "outline-offset": [{ "outline-offset": [oe, P, I] }], "outline-w": [{ outline: ["", oe, kn, Oa] }], "outline-color": [{ outline: V() }], shadow: [{ shadow: ["", "none", v, rr, ir] }], "shadow-color": [{ shadow: V() }], "inset-shadow": [{ "inset-shadow": ["none", b, rr, ir] }], "inset-shadow-color": [{ "inset-shadow": V() }], "ring-w": [{ ring: de() }], "ring-w-inset": ["ring-inset"], "ring-color": [{ ring: V() }], "ring-offset-w": [{ "ring-offset": [oe, Oa] }], "ring-offset-color": [{ "ring-offset": V() }], "inset-ring-w": [{ "inset-ring": de() }], "inset-ring-color": [{ "inset-ring": V() }], "text-shadow": [{ "text-shadow": ["none", A, rr, ir] }], "text-shadow-color": [{ "text-shadow": V() }], opacity: [{ opacity: [oe, P, I] }], "mix-blend": [{ "mix-blend": [...Ft(), "plus-darker", "plus-lighter"] }], "bg-blend": [{ "bg-blend": Ft() }], "mask-clip": [{ "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"] }, "mask-no-clip"], "mask-composite": [{ mask: ["add", "subtract", "intersect", "exclude"] }], "mask-image-linear-pos": [{ "mask-linear": [oe] }], "mask-image-linear-from-pos": [{ "mask-linear-from": Re() }], "mask-image-linear-to-pos": [{ "mask-linear-to": Re() }], "mask-image-linear-from-color": [{ "mask-linear-from": V() }], "mask-image-linear-to-color": [{ "mask-linear-to": V() }], "mask-image-t-from-pos": [{ "mask-t-from": Re() }], "mask-image-t-to-pos": [{ "mask-t-to": Re() }], "mask-image-t-from-color": [{ "mask-t-from": V() }], "mask-image-t-to-color": [{ "mask-t-to": V() }], "mask-image-r-from-pos": [{ "mask-r-from": Re() }], "mask-image-r-to-pos": [{ "mask-r-to": Re() }], "mask-image-r-from-color": [{ "mask-r-from": V() }], "mask-image-r-to-color": [{ "mask-r-to": V() }], "mask-image-b-from-pos": [{ "mask-b-from": Re() }], "mask-image-b-to-pos": [{ "mask-b-to": Re() }], "mask-image-b-from-color": [{ "mask-b-from": V() }], "mask-image-b-to-color": [{ "mask-b-to": V() }], "mask-image-l-from-pos": [{ "mask-l-from": Re() }], "mask-image-l-to-pos": [{ "mask-l-to": Re() }], "mask-image-l-from-color": [{ "mask-l-from": V() }], "mask-image-l-to-color": [{ "mask-l-to": V() }], "mask-image-x-from-pos": [{ "mask-x-from": Re() }], "mask-image-x-to-pos": [{ "mask-x-to": Re() }], "mask-image-x-from-color": [{ "mask-x-from": V() }], "mask-image-x-to-color": [{ "mask-x-to": V() }], "mask-image-y-from-pos": [{ "mask-y-from": Re() }], "mask-image-y-to-pos": [{ "mask-y-to": Re() }], "mask-image-y-from-color": [{ "mask-y-from": V() }], "mask-image-y-to-color": [{ "mask-y-to": V() }], "mask-image-radial": [{ "mask-radial": [P, I] }], "mask-image-radial-from-pos": [{ "mask-radial-from": Re() }], "mask-image-radial-to-pos": [{ "mask-radial-to": Re() }], "mask-image-radial-from-color": [{ "mask-radial-from": V() }], "mask-image-radial-to-color": [{ "mask-radial-to": V() }], "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }], "mask-image-radial-size": [{ "mask-radial": [{ closest: ["side", "corner"], farthest: ["side", "corner"] }] }], "mask-image-radial-pos": [{ "mask-radial-at": J() }], "mask-image-conic-pos": [{ "mask-conic": [oe] }], "mask-image-conic-from-pos": [{ "mask-conic-from": Re() }], "mask-image-conic-to-pos": [{ "mask-conic-to": Re() }], "mask-image-conic-from-color": [{ "mask-conic-from": V() }], "mask-image-conic-to-color": [{ "mask-conic-to": V() }], "mask-mode": [{ mask: ["alpha", "luminance", "match"] }], "mask-origin": [{ "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"] }], "mask-position": [{ mask: ce() }], "mask-repeat": [{ mask: je() }], "mask-size": [{ mask: ye() }], "mask-type": [{ "mask-type": ["alpha", "luminance"] }], "mask-image": [{ mask: ["none", P, I] }], filter: [{ filter: ["", "none", P, I] }], blur: [{ blur: fa() }], brightness: [{ brightness: [oe, P, I] }], contrast: [{ contrast: [oe, P, I] }], "drop-shadow": [{ "drop-shadow": ["", "none", S, rr, ir] }], "drop-shadow-color": [{ "drop-shadow": V() }], grayscale: [{ grayscale: ["", oe, P, I] }], "hue-rotate": [{ "hue-rotate": [oe, P, I] }], invert: [{ invert: ["", oe, P, I] }], saturate: [{ saturate: [oe, P, I] }], sepia: [{ sepia: ["", oe, P, I] }], "backdrop-filter": [{ "backdrop-filter": ["", "none", P, I] }], "backdrop-blur": [{ "backdrop-blur": fa() }], "backdrop-brightness": [{ "backdrop-brightness": [oe, P, I] }], "backdrop-contrast": [{ "backdrop-contrast": [oe, P, I] }], "backdrop-grayscale": [{ "backdrop-grayscale": ["", oe, P, I] }], "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [oe, P, I] }], "backdrop-invert": [{ "backdrop-invert": ["", oe, P, I] }], "backdrop-opacity": [{ "backdrop-opacity": [oe, P, I] }], "backdrop-saturate": [{ "backdrop-saturate": [oe, P, I] }], "backdrop-sepia": [{ "backdrop-sepia": ["", oe, P, I] }], "border-collapse": [{ border: ["collapse", "separate"] }], "border-spacing": [{ "border-spacing": G() }], "border-spacing-x": [{ "border-spacing-x": G() }], "border-spacing-y": [{ "border-spacing-y": G() }], "table-layout": [{ table: ["auto", "fixed"] }], caption: [{ caption: ["top", "bottom"] }], transition: [{ transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", P, I] }], "transition-behavior": [{ transition: ["normal", "discrete"] }], duration: [{ duration: [oe, "initial", P, I] }], ease: [{ ease: ["linear", "initial", Q, P, I] }], delay: [{ delay: [oe, P, I] }], animate: [{ animate: ["none", X, P, I] }], backface: [{ backface: ["hidden", "visible"] }], perspective: [{ perspective: [C, P, I] }], "perspective-origin": [{ "perspective-origin": $() }], rotate: [{ rotate: $t() }], "rotate-x": [{ "rotate-x": $t() }], "rotate-y": [{ "rotate-y": $t() }], "rotate-z": [{ "rotate-z": $t() }], scale: [{ scale: Ds() }], "scale-x": [{ "scale-x": Ds() }], "scale-y": [{ "scale-y": Ds() }], "scale-z": [{ "scale-z": Ds() }], "scale-3d": ["scale-3d"], skew: [{ skew: Rs() }], "skew-x": [{ "skew-x": Rs() }], "skew-y": [{ "skew-y": Rs() }], transform: [{ transform: [P, I, "", "none", "gpu", "cpu"] }], "transform-origin": [{ origin: $() }], "transform-style": [{ transform: ["3d", "flat"] }], translate: [{ translate: qs() }], "translate-x": [{ "translate-x": qs() }], "translate-y": [{ "translate-y": qs() }], "translate-z": [{ "translate-z": qs() }], "translate-none": ["translate-none"], accent: [{ accent: V() }], appearance: [{ appearance: ["none", "auto"] }], "caret-color": [{ caret: V() }], "color-scheme": [{ scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"] }], cursor: [{ cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", P, I] }], "field-sizing": [{ "field-sizing": ["fixed", "content"] }], "pointer-events": [{ "pointer-events": ["auto", "none"] }], resize: [{ resize: ["none", "", "y", "x"] }], "scroll-behavior": [{ scroll: ["auto", "smooth"] }], "scroll-m": [{ "scroll-m": G() }], "scroll-mx": [{ "scroll-mx": G() }], "scroll-my": [{ "scroll-my": G() }], "scroll-ms": [{ "scroll-ms": G() }], "scroll-me": [{ "scroll-me": G() }], "scroll-mt": [{ "scroll-mt": G() }], "scroll-mr": [{ "scroll-mr": G() }], "scroll-mb": [{ "scroll-mb": G() }], "scroll-ml": [{ "scroll-ml": G() }], "scroll-p": [{ "scroll-p": G() }], "scroll-px": [{ "scroll-px": G() }], "scroll-py": [{ "scroll-py": G() }], "scroll-ps": [{ "scroll-ps": G() }], "scroll-pe": [{ "scroll-pe": G() }], "scroll-pt": [{ "scroll-pt": G() }], "scroll-pr": [{ "scroll-pr": G() }], "scroll-pb": [{ "scroll-pb": G() }], "scroll-pl": [{ "scroll-pl": G() }], "snap-align": [{ snap: ["start", "end", "center", "align-none"] }], "snap-stop": [{ snap: ["normal", "always"] }], "snap-type": [{ snap: ["none", "x", "y", "both"] }], "snap-strictness": [{ snap: ["mandatory", "proximity"] }], touch: [{ touch: ["auto", "none", "manipulation"] }], "touch-x": [{ "touch-pan": ["x", "left", "right"] }], "touch-y": [{ "touch-pan": ["y", "up", "down"] }], "touch-pz": ["touch-pinch-zoom"], select: [{ select: ["none", "text", "all", "auto"] }], "will-change": [{ "will-change": ["auto", "scroll", "contents", "transform", P, I] }], fill: [{ fill: ["none", ...V()] }], "stroke-w": [{ stroke: [oe, kn, Oa, wu] }], stroke: [{ stroke: ["none", ...V()] }], "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }] }, conflictingClassGroups: { overflow: ["overflow-x", "overflow-y"], overscroll: ["overscroll-x", "overscroll-y"], inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"], "inset-x": ["right", "left"], "inset-y": ["top", "bottom"], flex: ["basis", "grow", "shrink"], gap: ["gap-x", "gap-y"], p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"], px: ["pr", "pl"], py: ["pt", "pb"], m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"], mx: ["mr", "ml"], my: ["mt", "mb"], size: ["w", "h"], "font-size": ["leading"], "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"], "fvn-ordinal": ["fvn-normal"], "fvn-slashed-zero": ["fvn-normal"], "fvn-figure": ["fvn-normal"], "fvn-spacing": ["fvn-normal"], "fvn-fraction": ["fvn-normal"], "line-clamp": ["display", "overflow"], rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"], "rounded-s": ["rounded-ss", "rounded-es"], "rounded-e": ["rounded-se", "rounded-ee"], "rounded-t": ["rounded-tl", "rounded-tr"], "rounded-r": ["rounded-tr", "rounded-br"], "rounded-b": ["rounded-br", "rounded-bl"], "rounded-l": ["rounded-tl", "rounded-bl"], "border-spacing": ["border-spacing-x", "border-spacing-y"], "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"], "border-w-x": ["border-w-r", "border-w-l"], "border-w-y": ["border-w-t", "border-w-b"], "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"], "border-color-x": ["border-color-r", "border-color-l"], "border-color-y": ["border-color-t", "border-color-b"], translate: ["translate-x", "translate-y", "translate-none"], "translate-none": ["translate", "translate-x", "translate-y", "translate-z"], "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"], "scroll-mx": ["scroll-mr", "scroll-ml"], "scroll-my": ["scroll-mt", "scroll-mb"], "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"], "scroll-px": ["scroll-pr", "scroll-pl"], "scroll-py": ["scroll-pt", "scroll-pb"], touch: ["touch-x", "touch-y", "touch-pz"], "touch-x": ["touch"], "touch-y": ["touch"], "touch-pz": ["touch"] }, conflictingClassGroupModifiers: { "font-size": ["leading"] }, orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"] }; }, NN = tN(jN);
function F(...l) { return NN(db(l)); }
function Qr(l) { return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(l)); }
function st(l) { const i = new Date, r = new Date(l), c = i.getTime() - r.getTime(), d = Math.floor(c / 1e3), m = Math.floor(d / 60), h = Math.floor(m / 60), x = Math.floor(h / 24); return x > 7 ? Qr(l) : x > 0 ? `hace ${x}d` : h > 0 ? `hace ${h}h` : m > 0 ? `hace ${m}m` : "ahora"; }
function Su(l) { return new Intl.NumberFormat("es-MX").format(l); }
function Ag(l) { return { active: "bg-green-500", in_progress: "bg-blue-500", pending: "bg-yellow-500", completed: "bg-green-500", blocked: "bg-red-500", review: "bg-purple-500", inactive: "bg-gray-500", error: "bg-red-500", busy: "bg-orange-500" }[l] || "bg-gray-500"; }
function Cg(l) { return { critical: "text-red-500 bg-red-500/10", high: "text-orange-500 bg-orange-500/10", medium: "text-yellow-500 bg-yellow-500/10", low: "text-green-500 bg-green-500/10" }[l] || "text-gray-500 bg-gray-500/10"; }
const wN = [{ name: "Dashboard", href: "/dashboard", icon: yj }, { name: "Proyectos", href: "/projects", icon: Nl }, { name: "Negocios", href: "/businesses", icon: ad }, { name: "Infraestructura", href: "/infrastructure", icon: Ku }, { name: "Design Hub", href: "/design-hub", icon: rg }, { name: "Memorias", href: "/memories", icon: Lr }], SN = [{ name: "VibeSDK", href: "https://docs.vibe-sdk.com", icon: ts, color: "text-purple-400" }];
function kN() { const { sidebarOpen: l, toggleSidebar: i } = Vr(); return a.jsxs("aside", { className: F("fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col", l ? "w-64" : "w-16"), children: [a.jsxs("div", { className: "flex h-16 items-center justify-between border-b border-border px-4", children: [l ? a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("img", { src: "/solaria-logo.png", alt: "SOLARIA", className: "h-9 w-9", onError: r => { r.currentTarget.style.display = "none"; } }), a.jsxs("div", { className: "flex flex-col", children: [a.jsx("span", { className: "font-bold text-lg solaria-text-gradient", children: "SOLARIA" }), a.jsx("span", { className: "text-[10px] text-muted-foreground -mt-1", children: "Digital Field Operations" })] })] }) : a.jsx("img", { src: "/solaria-logo.png", alt: "S", className: "h-8 w-8 mx-auto", onError: r => { r.currentTarget.style.display = "none"; } }), a.jsx("button", { onClick: i, className: "p-2 rounded-lg hover:bg-accent transition-colors", "aria-label": l ? "Colapsar sidebar" : "Expandir sidebar", children: l ? a.jsx($x, { className: "h-5 w-5" }) : a.jsx(ld, { className: "h-5 w-5" }) })] }), a.jsxs("nav", { className: "flex flex-col gap-1 p-2 flex-1", children: [l && a.jsx("div", { className: "px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider", children: "Navegacion" }), wN.map(r => a.jsxs(rb, { to: r.href, className: ({ isActive: c }) => F("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [a.jsx(r.icon, { className: "h-5 w-5 flex-shrink-0" }), l && a.jsx("span", { children: r.name })] }, r.name)), l && a.jsx("div", { className: "my-2 border-t border-border" }), l && a.jsx("div", { className: "px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider", children: "Enlaces" }), SN.map(r => a.jsxs("a", { href: r.href, target: "_blank", rel: "noopener noreferrer", className: F("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [a.jsx(r.icon, { className: F("h-5 w-5 flex-shrink-0", r.color) }), l && a.jsxs(a.Fragment, { children: [a.jsx("span", { children: r.name }), a.jsx(ts, { className: "h-3 w-3 ml-auto opacity-50" })] })] }, r.name))] }), l && a.jsx("div", { className: "p-4 border-t border-border", children: a.jsxs("div", { className: "rounded-lg bg-accent/50 p-3 text-center", children: [a.jsxs("div", { className: "text-xs text-muted-foreground", children: [a.jsx("span", { className: "solaria-text-gradient font-semibold", children: "SOLARIA" }), a.jsx("span", { children: " DFO" })] }), a.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "v3.2.0" })] }) })] }); }
function AN() { return lt({ queryKey: ["dashboard", "overview"], queryFn: async () => { var r, c, d, m, h, x, g, y, v, b, A; const { data: l } = await Xx.getOverview(), i = l.data || l; return { totalProjects: ((r = i.projects) == null ? void 0 : r.total_projects) || 0, activeProjects: ((c = i.projects) == null ? void 0 : c.active_projects) || 0, completedProjects: ((d = i.projects) == null ? void 0 : d.completed_projects) || 0, totalTasks: ((m = i.tasks) == null ? void 0 : m.total_tasks) || 0, completedTasks: ((h = i.tasks) == null ? void 0 : h.completed_tasks) || 0, pendingTasks: ((x = i.tasks) == null ? void 0 : x.pending_tasks) || 0, inProgressTasks: ((g = i.tasks) == null ? void 0 : g.in_progress_tasks) || 0, totalAgents: ((y = i.agents) == null ? void 0 : y.total_agents) || 0, activeAgents: ((v = i.agents) == null ? void 0 : v.active_agents) || 0, totalMemories: ((b = i.memories) == null ? void 0 : b.total_memories) || 0, criticalAlerts: ((A = i.alerts) == null ? void 0 : A.critical_alerts) || 0 }; }, refetchInterval: 3e4 }); }
function CN() { return lt({ queryKey: ["dashboard", "alerts"], queryFn: async () => { const { data: l } = await Xx.getAlerts(); return l.data || l.alerts || l || []; }, refetchInterval: 15e3 }); }
function Gr() { return lt({ queryKey: ["projects"], queryFn: async () => { const { data: l } = await qr.getAll(); return l.projects || l.data || []; } }); }
function Tg(l) { return lt({ queryKey: ["projects", l], queryFn: async () => { const { data: i } = await qr.getById(l); return i.project || i.data || i; }, enabled: !!l }); }
function TN() { const l = Jt(); return ss({ mutationFn: ({ id: i, data: r }) => qr.update(i, r), onSuccess: (i, { id: r }) => { l.invalidateQueries({ queryKey: ["projects"] }), l.invalidateQueries({ queryKey: ["projects", r] }); } }); }
function Kr(l) { return lt({ queryKey: ["tasks", l], queryFn: async () => { const { data: i } = await ls.getAll(l); return i.tasks || i.data || i || []; } }); }
function EN(l) { return lt({ queryKey: ["tasks", l], queryFn: async () => { const { data: i } = await ls.getById(l); return i.data; }, enabled: !!l }); }
function MN() { const l = Jt(); return ss({ mutationFn: i => ls.create(i), onSuccess: () => { l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function _N() { const l = Jt(); return ss({ mutationFn: ({ id: i, data: r }) => ls.update(i, r), onSuccess: (i, { id: r }) => { l.invalidateQueries({ queryKey: ["tasks"] }), l.invalidateQueries({ queryKey: ["tasks", r] }); } }); }
function Eg() { return lt({ queryKey: ["agents"], queryFn: async () => { const { data: l } = await I1.getAll(); return l.agents || l.data || l || []; }, refetchInterval: 1e4 }); }
function ON(l) { return lt({ queryKey: ["memories", l], queryFn: async () => { const { data: i } = await Br.getAll(l); return i.memories || i.data || i || []; } }); }
function zN(l, i) { return lt({ queryKey: ["memories", "search", l, i], queryFn: async () => { const { data: r } = await Br.search(l, i); return r.memories || r.data || r || []; }, enabled: l.length > 2 }); }
function DN() { return lt({ queryKey: ["memories", "tags"], queryFn: async () => { const { data: l } = await Br.getTags(); return l.tags || l.data || l || []; } }); }
function RN() { return lt({ queryKey: ["memories", "stats"], queryFn: async () => { const { data: l } = await Br.getStats(); return l.data || l; } }); }
function qN(l) { return lt({ queryKey: ["tasks", l, "items"], queryFn: async () => { const { data: i } = await ls.getItems(l); return i.items || i.data || i || []; }, enabled: !!l }); }
function BN() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, items: r }) => ls.createItems(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "items"] }), l.invalidateQueries({ queryKey: ["tasks", r] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function UN() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, itemId: r, notes: c, actualMinutes: d }) => ls.completeItem(i, r, { notes: c, actual_minutes: d }), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "items"] }), l.invalidateQueries({ queryKey: ["tasks", r] }), l.invalidateQueries({ queryKey: ["tasks"] }), l.invalidateQueries({ queryKey: ["dashboard"] }); } }); }
function LN() { return lt({ queryKey: ["tags"], queryFn: async () => { const { data: l } = await W1.getAll(); return l.tags || l.data || l || []; }, staleTime: 1e3 * 60 * 5 }); }
function HN(l) { return lt({ queryKey: ["tasks", l, "tags"], queryFn: async () => { const { data: i } = await ls.getTags(l); return i.tags || i.data || i || []; }, enabled: !!l }); }
function VN() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, tagId: r }) => ls.addTag(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "tags"] }), l.invalidateQueries({ queryKey: ["tags"] }); } }); }
function QN() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, tagId: r }) => ls.removeTag(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "tags"] }), l.invalidateQueries({ queryKey: ["tags"] }); } }); }
function Mg(l) { return lt({ queryKey: ["projects", l, "tasks"], queryFn: async () => { const { data: i } = await ls.getAll({ project_id: l }); return i.tasks || i.data || i || []; }, enabled: !!l, refetchInterval: 1e4 }); }
function GN(l) { return lt({ queryKey: ["projects", "check-code", l], queryFn: async () => { const { data: i } = await qr.checkCode(l); return i; }, enabled: l.length === 3 && /^[A-Za-z]{3}$/.test(l), staleTime: 1e3 * 30 }); }
function KN(l) { return lt({ queryKey: ["projects", l, "epics"], queryFn: async () => { const { data: i } = await td.getByProject(l); return i.epics || i.data || i || []; }, enabled: !!l }); }
function YN() { const l = Jt(); return ss({ mutationFn: ({ projectId: i, data: r }) => td.create(i, r), onSuccess: (i, { projectId: r }) => { l.invalidateQueries({ queryKey: ["projects", r, "epics"] }); } }); }
function XN() { const l = Jt(); return ss({ mutationFn: ({ id: i }) => td.delete(i), onSuccess: (i, r) => { l.invalidateQueries({ queryKey: ["projects", r.projectId, "epics"] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function ZN(l) { return lt({ queryKey: ["projects", l, "sprints"], queryFn: async () => { const { data: i } = await sd.getByProject(l); return i.sprints || i.data || i || []; }, enabled: !!l }); }
function JN() { const l = Jt(); return ss({ mutationFn: ({ projectId: i, data: r }) => sd.create(i, r), onSuccess: (i, { projectId: r }) => { l.invalidateQueries({ queryKey: ["projects", r, "sprints"] }); } }); }
function FN() { const l = Jt(); return ss({ mutationFn: ({ id: i }) => sd.delete(i), onSuccess: (i, r) => { l.invalidateQueries({ queryKey: ["projects", r.projectId, "sprints"] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function $N() { const l = ms(), { user: i, logout: r } = fs(), { theme: c, toggleTheme: d } = Vr(), { data: m } = CN(), { isConnected: h } = bv(), [x, g] = U.useState(!1), [y, v] = U.useState(!1), [b, A] = U.useState(new Set), S = U.useRef(null), N = U.useRef(null), C = (Y, R) => { R.stopPropagation(), A(G => new Set([...G, Y])); }, _ = () => { const Y = Q.map(R => R.id); A(new Set(Y)); }; U.useEffect(() => { function Y(R) { S.current && !S.current.contains(R.target) && g(!1), N.current && !N.current.contains(R.target) && v(!1); } return document.addEventListener("mousedown", Y), () => document.removeEventListener("mousedown", Y); }, []); const Q = (m || []).filter(Y => !b.has(Y.id)), X = Q.filter(Y => Y.severity === "critical" || Y.severity === "high"), H = Q.length, J = () => { r(), l("/login"); }, $ = Y => { switch (Y) {
    case "critical":
    case "high": return a.jsx(Yp, { className: "h-4 w-4 text-red-500" });
    case "medium": return a.jsx(Yp, { className: "h-4 w-4 text-yellow-500" });
    case "info": return a.jsx(ag, { className: "h-4 w-4 text-blue-500" });
    default: return a.jsx(br, { className: "h-4 w-4 text-green-500" });
} }; return a.jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur", children: [a.jsx("div", { className: "flex items-center gap-4", children: a.jsx("h1", { className: "text-lg font-semibold", children: "Digital Field Operations" }) }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: F("flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs", h ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: h ? a.jsxs(a.Fragment, { children: [a.jsx(Dj, { className: "h-3.5 w-3.5" }), a.jsx("span", { className: "hidden sm:inline", children: "En vivo" })] }) : a.jsxs(a.Fragment, { children: [a.jsx(zj, { className: "h-3.5 w-3.5" }), a.jsx("span", { className: "hidden sm:inline", children: "Offline" })] }) }), a.jsxs("div", { className: "relative", ref: S, children: [a.jsxs("button", { onClick: () => g(!x), className: F("relative rounded-lg p-2 transition-colors hover:bg-accent", X.length > 0 && "text-red-500"), children: [a.jsx(Fx, { className: "h-5 w-5" }), H > 0 && a.jsx("span", { className: F("absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white", X.length > 0 ? "bg-red-500" : "bg-primary"), children: H > 9 ? "9+" : H })] }), x && a.jsxs("div", { className: "absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg", children: [a.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [a.jsx("span", { className: "font-semibold text-sm", children: "Notificaciones" }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsxs("span", { className: "text-xs text-muted-foreground", children: [H, " alertas"] }), H > 0 && a.jsx("button", { onClick: _, className: "text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Limpiar" })] })] }), a.jsx("div", { className: "max-h-80 overflow-y-auto", children: Q.length > 0 ? Q.slice(0, 10).map(Y => a.jsxs("div", { className: "flex gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border last:border-0 group relative", children: [$(Y.severity), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsx("div", { className: "font-medium text-sm truncate", children: Y.title }), a.jsx("div", { className: "text-xs text-muted-foreground truncate", children: Y.message }), a.jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: st(Y.createdAt) })] }), a.jsx("button", { onClick: R => C(Y.id, R), className: "opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all absolute right-2 top-2", title: "Descartar", children: a.jsx(qa, { className: "h-3.5 w-3.5 text-muted-foreground" }) })] }, Y.id)) : a.jsx("div", { className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "No hay notificaciones" }) })] })] }), a.jsx("button", { onClick: d, className: "rounded-lg p-2 transition-colors hover:bg-accent", title: c === "dark" ? "Modo claro" : "Modo oscuro", children: c === "dark" ? a.jsx(jr, { className: "h-5 w-5" }) : a.jsx(Gu, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "relative", ref: N, children: [a.jsxs("button", { onClick: () => v(!y), className: "flex items-center gap-3 border-l border-border pl-4 ml-2 hover:bg-accent/50 rounded-lg pr-2 py-1 transition-colors", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground", children: a.jsx(zs, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "text-sm text-left", children: [a.jsx("div", { className: "font-medium", children: i == null ? void 0 : i.name }), a.jsx("div", { className: "text-xs text-muted-foreground capitalize", children: i == null ? void 0 : i.role })] })] }), a.jsx(uj, { className: F("h-4 w-4 text-muted-foreground transition-transform", y && "rotate-180") })] }), y && a.jsxs("div", { className: "absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden", children: [a.jsxs("div", { className: "px-4 py-3 border-b border-border", children: [a.jsx("div", { className: "font-medium text-sm", children: i == null ? void 0 : i.name }), a.jsx("div", { className: "text-xs text-muted-foreground", children: i == null ? void 0 : i.email })] }), a.jsxs("div", { className: "py-1", children: [a.jsxs("button", { onClick: () => { v(!1), l("/settings"); }, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors", children: [a.jsx(rd, { className: "h-4 w-4 text-muted-foreground" }), "Configuración"] }), a.jsxs("button", { onClick: d, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors", children: [c === "dark" ? a.jsx(jr, { className: "h-4 w-4 text-muted-foreground" }) : a.jsx(Gu, { className: "h-4 w-4 text-muted-foreground" }), c === "dark" ? "Modo claro" : "Modo oscuro"] })] }), a.jsx("div", { className: "border-t border-border py-1", children: a.jsxs("button", { onClick: J, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors", children: [a.jsx(Nj, { className: "h-4 w-4" }), "Cerrar sesión"] }) })] })] })] })] }); }
function WN() { const l = Vr(i => i.sidebarOpen); return a.jsxs("div", { className: "flex h-screen overflow-hidden bg-background", children: [a.jsx(kN, {}), a.jsxs("div", { className: F("flex flex-1 flex-col transition-all duration-300", l ? "ml-64" : "ml-16"), children: [a.jsx($N, {}), a.jsx("main", { className: "flex-1 overflow-auto p-6", children: a.jsx(cb, {}) })] })] }); }
function IN() { const l = ms(), i = fs(b => b.login), [r, c] = U.useState(""), [d, m] = U.useState(""), [h, x] = U.useState(""), [g, y] = U.useState(!1), v = async (b) => { var A, S; b.preventDefault(), x(""), y(!0); try {
    const { data: N } = await Yx.login(r, d);
    N.token && N.user ? (i(N.user, N.token), l("/dashboard")) : x(N.message || "Error de autenticación");
}
catch (N) {
    x(((S = (A = N.response) == null ? void 0 : A.data) == null ? void 0 : S.message) || "Error de conexión");
}
finally {
    y(!1);
} }; return a.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20", children: a.jsxs("div", { className: "w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-xl", children: [a.jsxs("div", { className: "text-center", children: [a.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full solaria-gradient", children: a.jsx(jr, { className: "h-10 w-10 text-white" }) }), a.jsx("h1", { className: "mt-4 text-2xl font-bold", children: "SOLARIA DFO" }), a.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Digital Field Operations" })] }), a.jsxs("form", { onSubmit: v, className: "mt-8 space-y-4", children: [h && a.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-sm text-destructive", children: h }), a.jsxs("div", { children: [a.jsx("label", { htmlFor: "username", className: "block text-sm font-medium mb-2", children: "Usuario" }), a.jsx("input", { id: "username", type: "text", value: r, onChange: b => c(b.target.value), className: "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Ingresa tu usuario", required: !0 })] }), a.jsxs("div", { children: [a.jsx("label", { htmlFor: "password", className: "block text-sm font-medium mb-2", children: "Contraseña" }), a.jsx("input", { id: "password", type: "password", value: d, onChange: b => m(b.target.value), className: "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Ingresa tu contraseña", required: !0 })] }), a.jsx("button", { type: "submit", disabled: g, className: "w-full rounded-lg solaria-gradient py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50", children: g ? a.jsxs("span", { className: "flex items-center justify-center gap-2", children: [a.jsx(We, { className: "h-4 w-4 animate-spin" }), "Ingresando..."] }) : "Ingresar" })] }), a.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "© 2024-2025 SOLARIA AGENCY" })] }) }); }
function cr({ title: l, value: i, icon: r, iconClass: c, onClick: d }) { return a.jsxs("div", { onClick: d, className: `stat-card ${d ? "cursor-pointer" : ""}`, title: d ? `Ver ${l.toLowerCase()}` : void 0, children: [a.jsx("div", { className: `stat-icon ${c}`, children: a.jsx(r, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: l }), a.jsx("div", { className: "stat-value", children: i })] })] }); }
function PN({ task: l, onClick: i }) { return a.jsxs("div", { className: "completed-task-item", onClick: i, children: [a.jsx("div", { className: "task-check-icon", style: { background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }, children: a.jsx(at, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "task-content", children: [a.jsxs("div", { className: "task-title-row", children: [a.jsx("span", { className: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded mr-2", children: l.taskCode || `#${l.taskNumber}` }), a.jsx("span", { className: "task-title", children: l.title })] }), a.jsxs("div", { className: "task-meta", children: [l.projectName && a.jsxs("span", { className: "task-meta-item", children: [a.jsx(nd, { className: "h-3 w-3" }), l.projectName] }), a.jsxs("span", { className: "task-meta-item", children: [a.jsx($e, { className: "h-3 w-3" }), st(l.completedAt || l.updatedAt)] })] })] })] }); }
function e2({ project: l, onClick: i }) { const r = l.status === "completed" ? "low" : l.status === "active" ? "high" : "medium", c = l.tasksTotal || 0, d = l.tasksCompleted || 0, m = c > 0 ? Math.round(d / c * 100) : l.progress || 0; return a.jsxs("div", { className: "completed-task-item", onClick: i, style: { cursor: "pointer" }, children: [a.jsx("div", { className: "task-check-icon", style: { background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }, children: a.jsx(nd, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "task-content", children: [a.jsxs("div", { className: "task-title-row", children: [a.jsx("span", { className: "task-title", children: l.name }), a.jsx("span", { className: `task-priority-badge ${r}`, children: l.status || "activo" })] }), a.jsxs("div", { className: "task-meta", children: [a.jsxs("span", { className: "task-meta-item", children: [a.jsx(ng, { className: "h-3 w-3" }), c, " tareas"] }), a.jsxs("span", { className: "task-meta-item", children: [a.jsx(at, { className: "h-3 w-3" }), m, "%"] })] })] })] }); }
function t2({ task: l, onClick: i }) { const r = l.priority === "high" || l.priority === "critical" ? "high" : l.priority === "medium" ? "medium" : "low"; return a.jsxs("div", { className: "completed-task-item", onClick: i, style: { cursor: "pointer" }, children: [a.jsx("div", { className: "task-check-icon", style: { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }, children: a.jsx(Wx, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "task-content", children: [a.jsxs("div", { className: "task-title-row", children: [a.jsx("span", { className: "text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded mr-2 font-semibold", children: l.taskCode || `#${l.taskNumber}` }), a.jsx("span", { className: "task-title", children: l.title }), a.jsx("span", { className: `task-priority-badge ${r}`, children: l.priority || "normal" })] }), a.jsxs("div", { className: "task-meta", children: [a.jsxs("span", { className: "task-meta-item", children: [a.jsx($e, { className: "h-3 w-3" }), st(l.createdAt)] }), l.projectName && a.jsxs("span", { className: "task-meta-item", children: [a.jsx(nd, { className: "h-3 w-3" }), l.projectName] })] })] })] }); }
function ku() { return a.jsxs("div", { className: "feed-loading", children: [a.jsx(We, { className: "h-5 w-5 animate-spin" }), a.jsx("p", { children: "Cargando..." })] }); }
function Au({ icon: l, message: i }) { return a.jsxs("div", { className: "feed-empty", children: [a.jsx(l, { className: "h-8 w-8" }), a.jsx("p", { children: i })] }); }
function s2() { const l = ms(), { data: i, isLoading: r } = AN(), { data: c, isLoading: d } = Gr(), { data: m, isLoading: h } = Kr({}), [x, g] = U.useState([]), [y, v] = U.useState([]); U.useEffect(() => { if (m) {
    const S = new Date;
    S.setDate(S.getDate() - 7);
    const N = m.filter(_ => new Date(_.createdAt) >= S).slice(0, 10), C = m.filter(_ => _.status === "completed").sort((_, Q) => { const X = new Date(_.completedAt || _.updatedAt); return new Date(Q.completedAt || Q.updatedAt).getTime() - X.getTime(); }).slice(0, 15).map(_ => { const Q = c == null ? void 0 : c.find(X => X.id === _.projectId); return { ..._, projectName: Q == null ? void 0 : Q.name }; });
    g(N), v(C);
} }, [m, c]); const b = () => l("/projects"), A = S => l(`/projects/${S}`); return a.jsxs("div", { className: "space-y-6", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Dashboard" }), a.jsx("p", { className: "section-subtitle", children: "Vista ejecutiva del estado de operaciones" })] }) }), a.jsxs("div", { className: "dashboard-stats-row", children: [a.jsx(cr, { title: "Proyectos Activos", value: r ? "-" : (i == null ? void 0 : i.activeProjects) || (c == null ? void 0 : c.length) || 0, icon: Nl, iconClass: "projects", onClick: b }), a.jsx(cr, { title: "Tareas Completadas", value: r ? "-" : (i == null ? void 0 : i.completedTasks) || 0, icon: at, iconClass: "tasks" }), a.jsx(cr, { title: "En Progreso", value: r ? "-" : (i == null ? void 0 : i.inProgressTasks) || 0, icon: $e, iconClass: "active" }), a.jsx(cr, { title: "Agentes Activos", value: r ? "-" : (i == null ? void 0 : i.activeAgents) || 0, icon: Ur, iconClass: "agents" })] }), a.jsxs("div", { className: "dashboard-grid", children: [a.jsxs("div", { className: "completed-tasks-widget", children: [a.jsxs("div", { className: "widget-header", children: [a.jsxs("div", { className: "widget-header-left", children: [a.jsx("div", { className: "widget-icon success", children: a.jsx(oj, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "widget-title", children: "Tareas Completadas" }), a.jsx("div", { className: "widget-subtitle", children: "Feed global en tiempo real" })] })] }), a.jsxs("button", { onClick: () => l("/tasks/archived"), className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-accent rounded-lg transition-colors", children: [a.jsx(xr, { className: "h-3.5 w-3.5" }), "Ver todas"] })] }), a.jsx("div", { className: "completed-tasks-feed", children: h ? a.jsx(ku, {}) : y.length > 0 ? y.map(S => a.jsx(PN, { task: S, onClick: () => S.projectId && A(S.projectId) }, S.id)) : a.jsx(Au, { icon: at, message: "No hay tareas completadas todavia" }) })] }), a.jsxs("div", { className: "completed-tasks-widget", children: [a.jsx("div", { className: "widget-header", children: a.jsxs("div", { className: "widget-header-left", children: [a.jsx("div", { className: "widget-icon info", children: a.jsx(Nl, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "widget-title", children: "Proyectos Recientes" }), a.jsx("div", { className: "widget-subtitle", children: "Actividad de proyectos" })] })] }) }), a.jsx("div", { className: "completed-tasks-feed", children: d ? a.jsx(ku, {}) : c && c.length > 0 ? c.slice(0, 5).map(S => a.jsx(e2, { project: S, onClick: () => A(S.id) }, S.id)) : a.jsx(Au, { icon: Nl, message: "No hay proyectos" }) })] }), a.jsxs("div", { className: "completed-tasks-widget", children: [a.jsxs("div", { className: "widget-header", children: [a.jsxs("div", { className: "widget-header-left", children: [a.jsx("div", { className: "widget-icon warning", children: a.jsx(Wx, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "widget-title", children: "Nuevas Tareas por Proyecto" }), a.jsx("div", { className: "widget-subtitle", children: "Ultimos 7 dias" })] })] }), a.jsx("div", { className: "widget-badge", children: x.length })] }), a.jsx("div", { className: "completed-tasks-feed", children: h ? a.jsx(ku, {}) : x.length > 0 ? x.map(S => a.jsx(t2, { task: S, onClick: () => S.projectId && A(S.projectId) }, S.id)) : a.jsx(Au, { icon: wt, message: "No hay tareas nuevas esta semana" }) })] })] })] }); }
const Sr = { planning: { label: "Planificacion", color: "#7c3aed" }, active: { label: "Desarrollo", color: "#0891b2" }, paused: { label: "Pausado", color: "#f59e0b" }, completed: { label: "Produccion", color: "#16a34a" }, cancelled: { label: "Cancelado", color: "#ef4444" } };
function a2({ board: l }) { const r = (c, d) => { const m = Math.min(c, 8); return Array.from({ length: 8 }, (h, x) => a.jsx("div", { className: F("trello-slot", x < m && `filled ${d}`) }, x)); }; return a.jsxs("div", { className: "mini-trello", children: [a.jsxs("div", { className: "trello-column backlog", children: [a.jsxs("div", { className: "trello-column-header", children: ["PEND (", l.backlog, ")"] }), a.jsx("div", { className: "trello-slots", children: r(l.backlog, "backlog") })] }), a.jsxs("div", { className: "trello-column todo", children: [a.jsxs("div", { className: "trello-column-header", children: ["REV (", l.todo, ")"] }), a.jsx("div", { className: "trello-slots", children: r(l.todo, "todo") })] }), a.jsxs("div", { className: "trello-column doing", children: [a.jsxs("div", { className: "trello-column-header", children: ["WIP (", l.doing, ")"] }), a.jsx("div", { className: "trello-slots", children: r(l.doing, "doing") })] }), a.jsxs("div", { className: "trello-column done", children: [a.jsxs("div", { className: "trello-column-header", children: ["DONE (", l.done, ")"] }), a.jsx("div", { className: "trello-slots", children: r(l.done, "done") })] })] }); }
function l2({ status: l }) { const i = ["planning", "active", "paused", "completed"], r = l === "completed" ? 3 : l === "paused" ? 2 : l === "active" ? 1 : 0; return a.jsx("div", { className: "progress-segments", children: i.map((c, d) => a.jsx("div", { className: F("progress-segment", d <= r ? c : "inactive") }, c)) }); }
function n2({ project: l, board: i, onClick: r }) { const c = Sr[l.status] || Sr.planning, d = l.tasksTotal || 0, m = l.tasksCompleted || 0, h = d - m, x = l.budgetAllocated ? l.budgetAllocated >= 1e3 ? `$${(l.budgetAllocated / 1e3).toFixed(0)}K` : `$${l.budgetAllocated}` : "-"; return a.jsxs("div", { className: "project-card", onClick: r, children: [a.jsxs("div", { className: "project-header", children: [a.jsx("div", { className: "project-icon-wrapper", children: a.jsx(Nl, { className: "project-icon" }) }), a.jsxs("div", { className: "project-title-group", children: [a.jsx("h3", { className: "project-name", children: l.name }), a.jsx("span", { className: "project-code", children: l.code })] }), a.jsx("button", { className: "project-edit-btn", onClick: g => { g.stopPropagation(); }, title: "Editar proyecto", children: a.jsx(qt, { className: "h-4 w-4" }) })] }), a.jsxs("div", { className: "project-tags", children: [a.jsx("span", { className: "project-tag", style: { backgroundColor: `${c.color}20`, color: c.color }, children: c.label }), l.priority && a.jsx("span", { className: F("project-tag", l.priority === "critical" && "red", l.priority === "high" && "orange", l.priority === "medium" && "yellow", l.priority === "low" && "green"), children: l.priority })] }), a.jsx(a2, { board: i }), a.jsx(l2, { status: l.status }), a.jsxs("div", { className: "project-stats", children: [a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon blue", children: a.jsx(at, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: d }), a.jsx("div", { className: "stat-label", children: "Tareas" })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon yellow", children: a.jsx($e, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: h }), a.jsx("div", { className: "stat-label", children: "Pend." })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(at, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: m }), a.jsx("div", { className: "stat-label", children: "Compl." })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon orange", children: a.jsx(Ix, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: x }), a.jsx("div", { className: "stat-label", children: "Budget" })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon purple", children: a.jsx(mg, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: l.activeAgents || 0 }), a.jsx("div", { className: "stat-label", children: "Agentes" })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon indigo", children: a.jsx(ua, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: l.endDate ? Qr(l.endDate) : "-" }), a.jsx("div", { className: "stat-label", children: "Entrega" })] })] })] }); }
function i2({ project: l, onClick: i }) { const r = Sr[l.status] || Sr.planning, c = l.tasksTotal || 0, d = l.tasksCompleted || 0, m = c - d, h = l.progress || 0, x = l.budgetAllocated ? l.budgetAllocated >= 1e3 ? `$${(l.budgetAllocated / 1e3).toFixed(0)}K` : `$${l.budgetAllocated}` : "-"; return a.jsxs("tr", { onClick: i, className: "project-row", children: [a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "project-icon-sm", children: a.jsx(Nl, { className: "h-4 w-4" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "project-name-sm", children: l.name }), a.jsx("div", { className: "project-code-sm", children: l.code })] })] }) }), a.jsx("td", { children: a.jsx("span", { className: "phase-badge", style: { backgroundColor: `${r.color}20`, color: r.color }, children: r.label }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-blue", children: c }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-yellow", children: m }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-green", children: d }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-orange", children: x }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-purple", children: l.activeAgents || 0 }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-indigo", children: l.endDate ? Qr(l.endDate) : "-" }) }), a.jsxs("td", { className: "text-center", children: [a.jsx("div", { className: "progress-bar-sm", children: a.jsx("div", { className: "progress-fill", style: { width: `${h}%` } }) }), a.jsxs("span", { className: "progress-text", children: [h, "%"] })] })] }); }
function r2() { const { projectId: l } = Tr(), i = ms(), { data: r, isLoading: c } = Gr(), { data: d } = Kr({}), [m, h] = U.useState("grid"), [x, g] = U.useState("name"), y = (r || []).reduce((A, S) => { const N = (d || []).filter(C => C.projectId === S.id); return A[S.id] = { backlog: N.filter(C => C.status === "pending").length, todo: N.filter(C => C.status === "review").length, doing: N.filter(C => C.status === "in_progress").length, done: N.filter(C => C.status === "completed").length, blocked: N.filter(C => C.status === "blocked").length }, A; }, {}), v = [...r || []].sort((A, S) => { switch (x) {
    case "name": return A.name.localeCompare(S.name);
    case "deadline": return new Date(A.endDate || 0).getTime() - new Date(S.endDate || 0).getTime();
    case "budget": return (S.budgetAllocated || 0) - (A.budgetAllocated || 0);
    case "completion": return (S.progress || 0) - (A.progress || 0);
    case "status": return A.status.localeCompare(S.status);
    default: return 0;
} }), b = A => { i(`/projects/${A}`); }; if (c)
    return a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }); if (l) {
    const A = r == null ? void 0 : r.find(S => S.id === parseInt(l));
    if (A)
        return a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: A.name }), a.jsxs("p", { className: "section-subtitle", children: [A.code, " - ", A.description] })] }), a.jsx("button", { onClick: () => i("/projects"), className: "btn-secondary", children: "Volver" })] }), a.jsx("div", { className: "bg-card border border-border rounded-xl p-6", children: a.jsx("p", { className: "text-muted-foreground", children: "Vista detallada del proyecto (en desarrollo)" }) })] });
} return a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Proyectos" }), a.jsxs("p", { className: "section-subtitle", children: [(r == null ? void 0 : r.length) || 0, " proyectos en el pipeline"] })] }), a.jsxs("div", { className: "section-actions", children: [a.jsxs("div", { className: "sort-buttons", children: [a.jsx("button", { className: F("sort-btn", x === "name" && "active"), onClick: () => g("name"), children: "NOMBRE" }), a.jsx("button", { className: F("sort-btn", x === "deadline" && "active"), onClick: () => g("deadline"), children: "FECHA" }), a.jsx("button", { className: F("sort-btn", x === "budget" && "active"), onClick: () => g("budget"), children: "$$$" }), a.jsx("button", { className: F("sort-btn", x === "completion" && "active"), onClick: () => g("completion"), children: "%" }), a.jsx("button", { className: F("sort-btn", x === "status" && "active"), onClick: () => g("status"), children: "FASE" })] }), a.jsxs("div", { className: "view-toggle", children: [a.jsx("button", { className: F("view-toggle-btn", m === "grid" && "active"), onClick: () => h("grid"), title: "Vista Grid", children: a.jsx(Bn, { className: "h-4 w-4" }) }), a.jsx("button", { className: F("view-toggle-btn", m === "list" && "active"), onClick: () => h("list"), title: "Vista Lista", children: a.jsx(Un, { className: "h-4 w-4" }) })] })] })] }), m === "grid" ? a.jsxs("div", { className: "projects-grid", children: [v.map(A => a.jsx(n2, { project: A, board: y[A.id] || { backlog: 0, todo: 0, doing: 0, done: 0, blocked: 0 }, onClick: () => b(A.id) }, A.id)), v.length === 0 && a.jsxs("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: "No hay proyectos todavia" })] })] }) : a.jsxs("div", { className: "project-card", style: { padding: 0, overflow: "hidden" }, children: [a.jsxs("table", { className: "list-table", children: [a.jsx("thead", { children: a.jsxs("tr", { children: [a.jsx("th", { style: { width: "22%" }, children: "Proyecto" }), a.jsx("th", { style: { width: "12%" }, children: "Fase" }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Tareas" }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Pend." }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Compl." }), a.jsx("th", { style: { width: "10%", textAlign: "center" }, children: "Budget" }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Agentes" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Entrega" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Progreso" })] }) }), a.jsx("tbody", { children: v.map(A => a.jsx(i2, { project: A, onClick: () => b(A.id) }, A.id)) })] }), v.length === 0 && a.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: "No hay proyectos todavia" })] })] })] }); }
function Yr({ isOpen: l, onClose: i, title: r, children: c, maxWidth: d = "max-w-xl", className: m }) { const h = U.useCallback(x => { x.key === "Escape" && i(); }, [i]); return U.useEffect(() => (l && (document.addEventListener("keydown", h), document.body.style.overflow = "hidden"), () => { document.removeEventListener("keydown", h), document.body.style.overflow = "unset"; }), [l, h]), l ? a.jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: x => { x.target === x.currentTarget && i(); }, children: a.jsxs("div", { className: F("bg-card rounded-2xl border border-border w-full max-h-[90vh] overflow-y-auto", d, m), children: [r && a.jsxs("div", { className: "p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10", children: [a.jsx("h2", { className: "text-xl font-bold text-foreground", children: r }), a.jsx("button", { onClick: i, className: "p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: a.jsx(qa, { className: "h-5 w-5" }) })] }), !r && a.jsx("button", { onClick: i, className: "absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10", children: a.jsx(qa, { className: "h-5 w-5" }) }), c] }) }) : null; }
const c2 = [{ key: "backlog", alt: "pending", label: "BL", fullLabel: "BACKLOG", color: "#6b7280" }, { key: "todo", alt: "pending", label: "TD", fullLabel: "TODO", color: "#f59e0b" }, { key: "doing", alt: "in_progress", label: "DO", fullLabel: "DOING", color: "#3b82f6" }, { key: "done", alt: "completed", label: "DN", fullLabel: "DONE", color: "#22c55e" }], Wp = 8;
function o2({ label: l, fullLabel: i, count: r, color: c, showLabel: d = !0, showCount: m = !0, compact: h = !1 }) { const x = Math.min(r, Wp), g = []; for (let y = 0; y < Wp; y++) {
    const v = y < x;
    g.push(a.jsx("div", { className: F("trello-slot", v && "filled"), style: v ? { background: c, borderColor: "transparent" } : void 0 }, y));
} return a.jsxs("div", { className: "trello-column", children: [d && a.jsx("span", { className: "trello-label", children: h ? l : i }), a.jsx("div", { className: "trello-slots", children: g }), m && a.jsx("span", { className: "trello-count", children: r })] }); }
function u2({ board: l, showLabels: i = !0, showCounts: r = !0, compact: c = !1, className: d }) { const m = h => { const x = l[h.key] ?? 0, g = l[h.alt] ?? 0; return x || g; }; return a.jsx("div", { className: F("mini-trello", c && "compact", d), children: c2.map(h => a.jsx(o2, { label: h.label, fullLabel: h.fullLabel, count: m(h), color: h.color, showLabel: i, showCount: r, compact: c }, h.key)) }); }
function d2({ project: l, metrics: i, onClick: r }) { var c; return a.jsxs("div", { onClick: r, className: "bg-card rounded-xl border border-border p-4 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para ver informacion completa del proyecto", children: [a.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 sm:gap-6", children: [a.jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center shrink-0", children: a.jsx(id, { className: "text-white h-8 w-8 sm:h-10 sm:w-10" }) }), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: [a.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 uppercase", children: "SAAS" }), a.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 uppercase", children: "REACT" }), a.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 uppercase", children: "B2B" })] }), a.jsx("p", { className: "text-muted-foreground text-sm line-clamp-2", children: l.description || "Sin descripcion" }), a.jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm text-muted-foreground", children: [a.jsx("span", { className: "text-solaria", children: "●" }), a.jsx("span", { children: ((c = l.client) == null ? void 0 : c.name) || "Sin cliente" })] })] }), a.jsx("div", { className: "hidden sm:flex items-start", children: a.jsx(ts, { className: "h-5 w-5 text-muted-foreground" }) })] }), a.jsxs("div", { className: "mt-4 pt-4 border-t border-border", children: [a.jsxs("div", { className: "flex items-center justify-between mb-2", children: [a.jsx("span", { className: "text-sm text-muted-foreground", children: "Fase" }), a.jsx("span", { className: F("px-3 py-1 rounded-full text-xs font-medium uppercase", l.status === "active" ? "bg-green-500/20 text-green-400" : l.status === "planning" ? "bg-yellow-500/20 text-yellow-400" : l.status === "completed" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"), children: l.status === "active" ? "Desarrollo" : l.status === "planning" ? "Planificacion" : l.status === "completed" ? "Produccion" : l.status })] }), a.jsxs("div", { className: "flex gap-1 mt-2", children: [a.jsx("div", { className: F("flex-1 h-1.5 rounded-full", l.status !== "planning" ? "bg-solaria" : "bg-secondary") }), a.jsx("div", { className: F("flex-1 h-1.5 rounded-full", l.status === "active" || l.status === "completed" ? "bg-solaria" : "bg-secondary") }), a.jsx("div", { className: F("flex-1 h-1.5 rounded-full", l.status === "completed" ? "bg-solaria" : "bg-secondary") }), a.jsx("div", { className: F("flex-1 h-1.5 rounded-full", l.status === "completed" ? "bg-solaria" : "bg-secondary") })] }), a.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mt-1", children: [a.jsx("span", { children: "PLAN" }), a.jsx("span", { children: "DEV" }), a.jsx("span", { children: "TEST" }), a.jsx("span", { children: "PROD" })] })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-2 mt-4", children: [a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsxs("p", { className: "text-lg font-bold text-foreground", children: ["$", Math.round((l.budgetAllocated || 0) / 1e3), "K"] }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Presupuesto" })] }), a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-lg font-bold text-foreground", children: i.total }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Tareas" })] }), a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsxs("p", { className: "text-lg font-bold text-green-400", children: [i.progress, "%"] }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Completado" })] }), a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsxs("p", { className: F("text-lg font-bold", i.daysRemaining < 0 ? "text-red-400" : "text-foreground"), children: [i.daysRemaining, "d"] }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Restantes" })] })] })] }); }
function f2({ metrics: l, tasksByStatus: i, onClick: r }) { return a.jsxs("div", { onClick: r, className: "bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para gestionar tareas", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(at, { className: "h-4 w-4 text-solaria" }), "TAREAS", a.jsx(ts, { className: "h-3 w-3 text-muted-foreground ml-auto" })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-2 mb-4", children: [a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-foreground", children: l.total }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Total" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-yellow-400", children: l.pending }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Pend" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-blue-400", children: l.inProgress }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Doing" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-green-400", children: l.completed }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Done" })] })] }), a.jsx(u2, { board: i, showLabels: !0, showCounts: !0, compact: !1 })] }); }
function m2({ onClick: l }) { const i = []; return a.jsxs("div", { onClick: l, className: "bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para gestionar URLs", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(lg, { className: "h-4 w-4 text-solaria" }), "DIRECCIONES", a.jsx(ts, { className: "h-3 w-3 text-muted-foreground ml-auto" })] }), i.length > 0 ? a.jsxs("div", { className: "space-y-2", children: [i.slice(0, 3).map((r, c) => a.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground truncate", children: [a.jsx(ts, { className: "h-3 w-3 shrink-0" }), a.jsx("span", { className: "truncate", children: r })] }, c)), i.length > 3 && a.jsxs("p", { className: "text-xs text-solaria", children: ["+", i.length - 3, " mas..."] })] }) : a.jsx("p", { className: "text-sm text-muted-foreground", children: "No hay URLs" })] }); }
function h2({ activities: l }) { const i = l.slice(0, 5), r = c => c.includes("complete") || c.includes("done") ? a.jsx(at, { className: "h-4 w-4 text-green-400" }) : c.includes("create") || c.includes("new") ? a.jsx(qt, { className: "h-4 w-4 text-blue-400" }) : c.includes("update") || c.includes("edit") ? a.jsx(vr, { className: "h-4 w-4 text-yellow-400" }) : a.jsx($e, { className: "h-4 w-4 text-muted-foreground" }); return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx($e, { className: "h-4 w-4 text-solaria" }), "Actividad"] }), i.length > 0 ? a.jsx("div", { className: "space-y-3", children: i.map(c => a.jsxs("div", { className: "flex items-start gap-3", children: [r(c.action), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsx("p", { className: "text-sm text-foreground truncate", children: c.description || c.action }), a.jsx("p", { className: "text-xs text-muted-foreground", children: st(c.createdAt) })] })] }, c.id)) }) : a.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin actividad reciente" })] }); }
function p2({ notes: l, onAddNote: i }) { const [r, c] = U.useState(""), d = m => { m.preventDefault(), r.trim() && (i(r.trim()), c("")); }; return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(Px, { className: "h-4 w-4 text-solaria" }), "Notas", a.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(Agentes leen)" })] }), a.jsxs("form", { onSubmit: d, className: "flex gap-2 mb-3", children: [a.jsx("input", { type: "text", value: r, onChange: m => c(m.target.value), placeholder: "Escribe una nota...", className: "flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria" }), a.jsx("button", { type: "submit", disabled: !r.trim(), className: F("p-2 rounded-lg transition-colors", r.trim() ? "bg-solaria text-white hover:bg-solaria-dark" : "bg-secondary text-muted-foreground cursor-not-allowed"), children: a.jsx(Aj, { className: "h-4 w-4" }) })] }), l.length > 0 ? a.jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: l.map((m, h) => a.jsx("div", { className: "p-2 rounded bg-secondary/50 text-sm text-foreground", children: m }, h)) }) : a.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin notas" })] }); }
function x2({ epics: l, onCreateEpic: i, onDeleteEpic: r }) { const [c, d] = U.useState(!1), [m, h] = U.useState(""), x = () => { m.trim() && (i(m.trim()), h(""), d(!1)); }; return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(Mj, { className: "h-4 w-4 text-purple-400" }), "Epics", a.jsxs("span", { className: "text-xs text-muted-foreground font-normal ml-auto", children: [l.length, " total"] })] }), a.jsxs("div", { className: "space-y-2 mb-3 max-h-40 overflow-y-auto", children: [l.map(g => a.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group", children: [a.jsx("div", { className: "w-3 h-3 rounded-full shrink-0", style: { backgroundColor: g.color || "#6366f1" } }), a.jsxs("span", { className: "flex-1 text-sm text-foreground truncate", children: ["EPIC", String(g.epicNumber).padStart(2, "0"), ": ", g.name] }), a.jsx("span", { className: F("text-xs px-1.5 py-0.5 rounded", g.status === "completed" ? "bg-green-500/20 text-green-400" : g.status === "in_progress" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"), children: g.status }), a.jsx("button", { onClick: () => r(g.id), className: "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all", children: a.jsx(fg, { className: "h-3 w-3" }) })] }, g.id)), l.length === 0 && a.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Sin epics" })] }), c ? a.jsxs("div", { className: "flex gap-2", children: [a.jsx("input", { type: "text", value: m, onChange: g => h(g.target.value), placeholder: "Nombre del epic...", className: "flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria", autoFocus: !0, onKeyDown: g => g.key === "Enter" && x() }), a.jsx("button", { onClick: x, disabled: !m.trim(), className: "p-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed", children: a.jsx(qt, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => { d(!1), h(""); }, className: "p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground", children: a.jsx(qa, { className: "h-4 w-4" }) })] }) : a.jsxs("button", { onClick: () => d(!0), className: "w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2", children: [a.jsx(qt, { className: "h-4 w-4" }), "Crear Epic"] })] }); }
function g2({ sprints: l, onCreateSprint: i, onDeleteSprint: r }) { const [c, d] = U.useState(!1), [m, h] = U.useState(""), x = () => { m.trim() && (i(m.trim()), h(""), d(!1)); }, g = l.find(y => y.status === "active"); return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(Nr, { className: "h-4 w-4 text-yellow-400" }), "Sprints", a.jsxs("span", { className: "text-xs text-muted-foreground font-normal ml-auto", children: [l.length, " total"] })] }), g && a.jsxs("div", { className: "mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30", children: [a.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [a.jsx(Nr, { className: "h-3 w-3 text-yellow-400" }), a.jsx("span", { className: "text-yellow-400 font-medium", children: "Activo:" }), a.jsx("span", { className: "text-foreground", children: g.name })] }), g.endDate && a.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [a.jsx(nj, { className: "h-3 w-3" }), "Termina: ", new Date(g.endDate).toLocaleDateString("es-ES")] })] }), a.jsxs("div", { className: "space-y-2 mb-3 max-h-32 overflow-y-auto", children: [l.filter(y => y.id !== (g == null ? void 0 : g.id)).map(y => a.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group", children: [a.jsxs("span", { className: "text-xs font-mono text-muted-foreground", children: ["SP", String(y.sprintNumber).padStart(2, "0")] }), a.jsx("span", { className: "flex-1 text-sm text-foreground truncate", children: y.name }), a.jsx("span", { className: F("text-xs px-1.5 py-0.5 rounded", y.status === "completed" ? "bg-green-500/20 text-green-400" : y.status === "active" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"), children: y.status }), a.jsx("button", { onClick: () => r(y.id), className: "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all", children: a.jsx(fg, { className: "h-3 w-3" }) })] }, y.id)), l.length === 0 && a.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Sin sprints" })] }), c ? a.jsxs("div", { className: "flex gap-2", children: [a.jsx("input", { type: "text", value: m, onChange: y => h(y.target.value), placeholder: "Nombre del sprint...", className: "flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria", autoFocus: !0, onKeyDown: y => y.key === "Enter" && x() }), a.jsx("button", { onClick: x, disabled: !m.trim(), className: "p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed", children: a.jsx(qt, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => { d(!1), h(""); }, className: "p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground", children: a.jsx(qa, { className: "h-4 w-4" }) })] }) : a.jsxs("button", { onClick: () => d(!0), className: "w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-yellow-500 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2", children: [a.jsx(qt, { className: "h-4 w-4" }), "Crear Sprint"] })] }); }
function y2({ project: l, isOpen: i, onClose: r, onEdit: c }) { var d; return a.jsxs(Yr, { isOpen: i, onClose: r, title: "Informacion del Proyecto", maxWidth: "max-w-2xl", children: [a.jsxs("div", { className: "p-6 space-y-6", children: [a.jsxs("div", { className: "flex items-start gap-4", children: [a.jsx("div", { className: "w-16 h-16 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center", children: a.jsx(id, { className: "text-white h-8 w-8" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("h2", { className: "text-xl font-bold text-foreground", children: l.name }), a.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: l.code })] })] }), a.jsxs("div", { children: [a.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Descripcion" }), a.jsx("p", { className: "text-foreground", children: l.description || "Sin descripcion" })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Cliente" }), a.jsx("p", { className: "text-foreground font-medium", children: ((d = l.client) == null ? void 0 : d.name) || "Sin cliente" })] }), a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Presupuesto" }), a.jsxs("p", { className: "text-foreground font-medium", children: ["$", (l.budgetAllocated || 0).toLocaleString()] })] }), a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Fecha Inicio" }), a.jsx("p", { className: "text-foreground font-medium", children: l.startDate ? new Date(l.startDate).toLocaleDateString("es-ES") : "No definida" })] }), a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Deadline" }), a.jsx("p", { className: "text-foreground font-medium", children: l.endDate ? new Date(l.endDate).toLocaleDateString("es-ES") : "No definida" })] })] }), a.jsxs("div", { children: [a.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Stack Tecnico" }), a.jsxs("div", { className: "flex flex-wrap gap-2", children: [a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400", children: "React 19" }), a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400", children: "Node.js" }), a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400", children: "PostgreSQL" }), a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400", children: "TailwindCSS" })] })] })] }), a.jsxs("div", { className: "p-6 border-t border-border flex justify-end gap-3", children: [a.jsx("button", { onClick: r, className: "px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: "Cerrar" }), a.jsxs("button", { onClick: () => { r(), c(); }, className: "px-4 py-2 rounded-lg bg-solaria text-white hover:bg-solaria-dark transition-colors flex items-center gap-2", children: [a.jsx(vr, { className: "h-4 w-4" }), "Editar"] })] })] }); }
function b2({ project: l, isOpen: i, onClose: r, onSave: c }) { var N, C, _, Q; const [d, m] = U.useState({ name: l.name, code: l.code || "", description: l.description || "", budgetAllocated: l.budgetAllocated || 0, startDate: ((N = l.startDate) == null ? void 0 : N.split("T")[0]) || "", endDate: ((C = l.endDate) == null ? void 0 : C.split("T")[0]) || "" }), h = d.code.length === 3 && d.code.toUpperCase() !== ((_ = l.code) == null ? void 0 : _.toUpperCase()), { data: x, isLoading: g } = GN(h ? d.code : ""), y = d.code.length === 3 && /^[A-Za-z]{3}$/.test(d.code), v = d.code.toUpperCase() === ((Q = l.code) == null ? void 0 : Q.toUpperCase()), b = v || ((x == null ? void 0 : x.available) ?? !0), A = X => { const H = X.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3); m({ ...d, code: H }); }, S = () => { !y || !v && !b || (c(d), r()); }; return a.jsxs(Yr, { isOpen: i, onClose: r, title: "Editar Proyecto", children: [a.jsxs("div", { className: "p-6 space-y-4", children: [a.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [a.jsxs("div", { className: "col-span-2", children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Nombre" }), a.jsx("input", { type: "text", value: d.name, onChange: X => m({ ...d, name: X.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Codigo (3 letras)" }), a.jsxs("div", { className: "relative", children: [a.jsx("input", { type: "text", value: d.code, onChange: A, maxLength: 3, placeholder: "ABC", className: F("w-full px-3 py-2 rounded-lg bg-secondary border text-foreground font-mono text-center uppercase tracking-wider", !y && d.code.length > 0 ? "border-red-500" : y && !g && !v && b ? "border-green-500" : y && !g && !b ? "border-red-500" : "border-border") }), g && a.jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "..." })] }), !y && d.code.length > 0 && a.jsx("p", { className: "text-xs text-red-400 mt-1", children: "Solo 3 letras A-Z" }), y && !v && !g && !b && a.jsx("p", { className: "text-xs text-red-400 mt-1", children: "Codigo en uso" }), y && !v && !g && b && a.jsx("p", { className: "text-xs text-green-400 mt-1", children: "Disponible ✓" })] })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Presupuesto" }), a.jsx("input", { type: "number", value: d.budgetAllocated, onChange: X => m({ ...d, budgetAllocated: Number(X.target.value) }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Fecha Inicio" }), a.jsx("input", { type: "date", value: d.startDate, onChange: X => m({ ...d, startDate: X.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Deadline" }), a.jsx("input", { type: "date", value: d.endDate, onChange: X => m({ ...d, endDate: X.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Descripcion" }), a.jsx("textarea", { value: d.description, onChange: X => m({ ...d, description: X.target.value }), rows: 4, className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground resize-none" })] })] }), a.jsxs("div", { className: "p-6 border-t border-border flex justify-end gap-3", children: [a.jsx("button", { onClick: r, className: "px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: "Cancelar" }), a.jsx("button", { onClick: S, disabled: !y || !v && !b || g, className: F("px-4 py-2 rounded-lg transition-colors", !y || !v && !b || g ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-solaria text-white hover:bg-solaria-dark"), children: "Guardar" })] })] }); }
function v2() { const { id: l } = Tr(), i = ms(), r = Number(l), [c, d] = U.useState(!1), [m, h] = U.useState(!1), [x, g] = U.useState([]), { data: y, isLoading: v, error: b } = Tg(r), { data: A = [] } = Mg(r), { data: S = [] } = KN(r), { data: N = [] } = ZN(r), C = TN(), _ = YN(), Q = XN(), X = JN(), H = FN(), J = U.useMemo(() => { const he = A.length, z = A.filter(ye => ye.status === "pending").length, Z = A.filter(ye => ye.status === "in_progress").length, V = A.filter(ye => ye.status === "completed").length, ce = he > 0 ? Math.round(V / he * 100) : 0; let je = 0; if (y != null && y.endDate) {
    const ye = new Date(y.endDate), pe = new Date;
    je = Math.ceil((ye.getTime() - pe.getTime()) / (1e3 * 60 * 60 * 24));
} return { total: he, pending: z, inProgress: Z, completed: V, progress: ce, daysRemaining: je }; }, [A, y]), $ = U.useMemo(() => { const z = A.filter(ce => ce.status === "pending").length, Z = A.filter(ce => ce.status === "in_progress").length, V = A.filter(ce => ce.status === "completed").length; return { backlog: 0, todo: z, doing: Z, done: V }; }, [A]), Y = U.useCallback(() => { d(!0); }, []), R = U.useCallback(() => { i(`/projects/${r}/tasks`); }, [i, r]), G = U.useCallback(() => { console.log("Direcciones clicked"); }, []), ue = U.useCallback(he => { g(z => [he, ...z]); }, []), nt = U.useCallback(he => { C.mutate({ id: r, data: he }); }, [r, C]), Ve = U.useCallback(he => { _.mutate({ projectId: r, data: { name: he } }); }, [r, _]), ke = U.useCallback(he => { Q.mutate({ id: he, projectId: r }); }, [r, Q]), Ie = U.useCallback(he => { X.mutate({ projectId: r, data: { name: he } }); }, [r, X]), Ze = U.useCallback(he => { H.mutate({ id: he, projectId: r }); }, [r, H]); return v ? a.jsx("div", { className: "flex items-center justify-center h-64", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-solaria" }) }) : b || !y ? a.jsxs("div", { className: "flex flex-col items-center justify-center h-64 gap-4", children: [a.jsx(wt, { className: "h-12 w-12 text-red-500" }), a.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Proyecto no encontrado" }), a.jsxs("p", { className: "text-muted-foreground", children: ["El proyecto con ID ", r, " no existe o no tienes acceso."] }), a.jsxs("button", { onClick: () => i("/projects"), className: "px-4 py-2 rounded-lg bg-solaria text-white flex items-center gap-2", children: [a.jsx(On, { className: "h-4 w-4" }), "Volver a Proyectos"] })] }) : a.jsxs("div", { className: "p-4 sm:p-6 space-y-4 sm:space-y-6", children: [a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { className: "flex items-center gap-4", children: [a.jsx("button", { onClick: () => i("/projects"), className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Volver al listado", children: a.jsx(On, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("h1", { className: "text-xl sm:text-2xl font-bold text-foreground", children: y.name }), a.jsx("p", { className: "text-sm text-muted-foreground", children: y.description })] })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsxs("button", { onClick: () => d(!0), className: "px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors", children: [a.jsx(ag, { className: "h-4 w-4" }), a.jsx("span", { className: "hidden sm:inline", children: "Info" })] }), a.jsx("button", { onClick: () => h(!0), className: "p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors", title: "Configuracion", children: a.jsx(rd, { className: "h-4 w-4" }) })] })] }), a.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6", children: [a.jsxs("div", { className: "lg:col-span-2 space-y-4 sm:space-y-6", children: [a.jsx(d2, { project: y, metrics: J, onClick: Y }), a.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [a.jsx(f2, { metrics: J, tasksByStatus: $, onClick: R }), a.jsx(m2, { onClick: G })] }), a.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [a.jsx(x2, { epics: S, onCreateEpic: Ve, onDeleteEpic: ke }), a.jsx(g2, { sprints: N, onCreateSprint: Ie, onDeleteSprint: Ze })] })] }), a.jsxs("div", { className: "space-y-4 sm:space-y-6", children: [a.jsx(h2, { activities: [] }), a.jsx(p2, { notes: x, onAddNote: ue })] })] }), a.jsx(y2, { project: y, isOpen: c, onClose: () => d(!1), onEdit: () => h(!0) }), a.jsx(b2, { project: y, isOpen: m, onClose: () => h(!1), onSave: nt })] }); }
const kr = { critical: 0, high: 1, medium: 2, low: 3 }, Ar = { pending: 0, in_progress: 1, blocked: 2, completed: 3 }, En = { pending: "todo", blocked: "backlog", in_progress: "doing", review: "doing", completed: "done", cancelled: "done" }, j2 = [{ key: "backlog", label: "Backlog", color: "#64748b" }, { key: "todo", label: "Por Hacer", color: "#f59e0b" }, { key: "doing", label: "En Progreso", color: "#3b82f6" }, { key: "done", label: "Completadas", color: "#22c55e" }], da = { critical: { color: "#ef4444", label: "P0", bg: "rgba(239, 68, 68, 0.2)" }, high: { color: "#f59e0b", label: "P1", bg: "rgba(249, 115, 22, 0.2)" }, medium: { color: "#3b82f6", label: "P2", bg: "rgba(59, 130, 246, 0.2)" }, low: { color: "#64748b", label: "P3", bg: "rgba(100, 116, 139, 0.2)" } }, Xr = { pending: "Pendiente", in_progress: "En Progreso", review: "En Revision", completed: "Completada", blocked: "Bloqueada", cancelled: "Cancelada" };
function N2({ task: l, agent: i, onClick: r }) { const c = da[l.priority] || da.medium, d = l.status === "in_progress", m = l.taskCode || `#${l.id}`; return a.jsxs("div", { onClick: r, className: "task-card bg-secondary border border-border rounded-lg p-3 cursor-pointer transition-all hover:border-solaria hover:-translate-y-0.5", children: [a.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [a.jsxs("span", { className: "text-[13px] font-medium text-foreground leading-tight", children: [a.jsx("span", { className: "text-solaria font-semibold mr-1.5", children: m }), l.title] }), a.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [a.jsx("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase", style: { background: c.bg, color: c.color }, children: c.label }), l.estimatedHours && l.estimatedHours > 0 && a.jsxs("span", { className: "text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1", children: [a.jsx(sg, { className: "h-2.5 w-2.5" }), l.estimatedHours, "h"] })] })] }), l.description && a.jsx("p", { className: "text-[11px] text-muted-foreground mb-2.5 line-clamp-2", children: l.description }), d && l.progress > 0 && a.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [a.jsx("div", { className: "flex-1 h-1 bg-background/50 rounded overflow-hidden", children: a.jsx("div", { className: "h-full rounded transition-all", style: { width: `${l.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}dd)` } }) }), a.jsxs("span", { className: "text-[10px] font-bold min-w-[32px] text-right", style: { color: l.progress >= 100 ? "#22c55e" : c.color }, children: [l.progress, "%"] })] }), a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [i ? a.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-solaria bg-solaria/10 px-1.5 py-0.5 rounded", children: [a.jsx(Ur, { className: "h-3 w-3" }), i.name.replace("SOLARIA-", "")] }) : a.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [a.jsx(zs, { className: "h-3 w-3" }), "Sin asignar"] }), l.status && l.status !== "in_progress" && a.jsx("span", { className: "text-[8px] px-1 py-0.5 bg-secondary rounded text-muted-foreground", children: Xr[l.status] || l.status })] }), l.createdAt && a.jsxs("span", { className: "text-[9px] text-muted-foreground flex items-center gap-1", children: [a.jsx($e, { className: "h-2.5 w-2.5" }), st(l.createdAt)] })] })] }); }
function w2({ column: l, tasks: i, agents: r, onTaskClick: c, onAddTask: d }) { const m = h => r.find(x => x.id === h); return a.jsxs("div", { className: F("flex-1 min-w-0 bg-secondary/30 rounded-xl flex flex-col h-full overflow-hidden", `kanban-column-${l.key}`), children: [a.jsxs("div", { className: "px-4 py-3 flex items-center justify-between border-b border-border", children: [a.jsxs("span", { className: "text-xs font-semibold uppercase tracking-wide flex items-center gap-2", children: [a.jsx("span", { className: "w-2 h-2 rounded-full", style: { background: l.color } }), l.label] }), a.jsx("span", { className: "text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full", children: i.length })] }), a.jsxs("div", { className: "flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2", children: [i.map(h => a.jsx(N2, { task: h, agent: m(h.assignedAgentId), onClick: () => c(h.id) }, h.id)), l.key === "backlog" && d && a.jsxs("button", { onClick: d, className: "w-full p-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-xs hover:border-solaria hover:text-solaria transition-colors flex items-center justify-center gap-1.5", children: [a.jsx(qt, { className: "h-3.5 w-3.5" }), "Agregar tarea"] }), i.length === 0 && l.key !== "backlog" && a.jsx("div", { className: "text-center py-8 text-muted-foreground text-xs", children: "Sin tareas" })] })] }); }
function S2({ tasks: l, agents: i, onTaskClick: r, onCreateTask: c }) { const d = U.useMemo(() => { const m = { backlog: [], todo: [], doing: [], done: [] }; return l.forEach(h => { const x = En[h.status] || "todo"; m[x].push(h); }), m; }, [l]); return a.jsx("div", { className: "kanban-board flex gap-3 h-[calc(100vh-320px)] min-h-[400px]", children: j2.map(m => a.jsx(w2, { column: m, tasks: d[m.key] || [], agents: i, onTaskClick: r, onAddTask: m.key === "backlog" ? c : void 0 }, m.key)) }); }
function k2({ tasks: l, agents: i, sortBy: r, onTaskClick: c }) { const d = h => i.find(x => x.id === h), m = U.useMemo(() => [...l].sort((h, x) => r === "priority" ? (kr[h.priority] ?? 3) - (kr[x.priority] ?? 3) : r === "status" ? (Ar[h.status] ?? 0) - (Ar[x.status] ?? 0) : r === "progress" ? (x.progress || 0) - (h.progress || 0) : 0), [l, r]); return a.jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: [m.map(h => { var v; const x = d(h.assignedAgentId), g = h.status === "completed", y = da[h.priority] || da.medium; return a.jsxs("div", { onClick: () => c(h.id), className: "flex items-center gap-4 p-4 bg-card border-b border-border last:border-b-0 hover:bg-secondary/30 cursor-pointer transition-colors", children: [a.jsx("div", { className: "w-1 h-12 rounded-full flex-shrink-0", style: { background: y.color } }), g && a.jsx(at, { className: "h-5 w-5 text-green-500 flex-shrink-0" }), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("h4", { className: F("font-medium truncate", g && "line-through opacity-70"), children: h.title }), a.jsx("span", { className: "px-2 py-0.5 rounded text-xs", style: { background: y.bg, color: y.color }, children: Xr[h.status] || h.status })] }), a.jsx("p", { className: "text-sm text-muted-foreground truncate", children: h.description || "Sin descripcion" })] }), a.jsxs("div", { className: "w-32 flex-shrink-0", children: [a.jsxs("div", { className: "flex justify-between text-xs mb-1", children: [a.jsx("span", { className: "text-muted-foreground", children: "Progreso" }), a.jsxs("span", { children: [h.progress, "%"] })] }), a.jsx("div", { className: "h-2 bg-secondary rounded-full overflow-hidden", children: a.jsx("div", { className: F("h-full rounded-full transition-all", g ? "bg-green-500" : "bg-solaria"), style: { width: `${h.progress}%` } }) })] }), a.jsxs("div", { className: "w-32 text-right flex-shrink-0", children: [a.jsx("p", { className: "text-sm", children: ((v = x == null ? void 0 : x.name) == null ? void 0 : v.replace("SOLARIA-", "")) || "Sin asignar" }), a.jsxs("p", { className: "text-xs text-muted-foreground", children: [h.estimatedHours || 0, "h"] })] }), a.jsx(ld, { className: "h-5 w-5 text-muted-foreground flex-shrink-0" })] }, h.id); }), m.length === 0 && a.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No hay tareas" })] }); }
function A2({ tasks: l, agents: i, sortBy: r, onTaskClick: c }) { const d = g => i.find(y => y.id === g), m = U.useMemo(() => [...l].sort((g, y) => r === "priority" ? (kr[g.priority] ?? 3) - (kr[y.priority] ?? 3) : r === "status" ? (Ar[g.status] ?? 0) - (Ar[y.status] ?? 0) : r === "progress" ? (y.progress || 0) - (g.progress || 0) : 0), [l, r]), h = U.useMemo(() => Math.max(...l.map(g => g.estimatedHours || 0), 8), [l]), x = g => { switch (g) {
    case "critical": return "linear-gradient(to right, #ef4444, #dc2626)";
    case "high": return "linear-gradient(to right, #f97316, #ea580c)";
    case "medium": return "linear-gradient(to right, #f6921d, #d97b0d)";
    case "low": return "linear-gradient(to right, #6b7280, #4b5563)";
    default: return "linear-gradient(to right, #f6921d, #d97b0d)";
} }; return a.jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: [a.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between", children: [a.jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [a.jsx(cd, { className: "h-5 w-5 text-solaria" }), "Vista Gantt"] }), a.jsxs("div", { className: "flex gap-4 text-xs", children: [a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#ef4444" } }), "Crítica"] }), a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#f97316" } }), "Alta"] }), a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#f6921d" } }), "Media"] }), a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#6b7280" } }), "Baja"] })] })] }), a.jsxs("div", { className: "flex items-center gap-4 px-4 py-2 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [a.jsx("div", { className: "w-72", children: "Tarea" }), a.jsx("div", { className: "w-24 text-center", children: "Estado" }), a.jsx("div", { className: "flex-1", children: "Timeline (horas)" })] }), a.jsxs("div", { className: "divide-y divide-border", children: [m.map(g => { var N; const y = d(g.assignedAgentId), v = g.status === "completed", b = da[g.priority] || da.medium, A = (g.estimatedHours || 0) / h * 100, S = g.progress || 0; return a.jsxs("div", { onClick: () => c(g.id), className: "flex items-center gap-4 py-3 px-4 hover:bg-secondary/30 cursor-pointer transition-colors", children: [a.jsxs("div", { className: "w-72 min-w-0", children: [a.jsx("p", { className: F("text-sm truncate font-medium", v && "line-through opacity-70"), children: g.title }), a.jsx("p", { className: "text-xs text-muted-foreground truncate", children: ((N = y == null ? void 0 : y.name) == null ? void 0 : N.replace("SOLARIA-", "")) || "Sin asignar" })] }), a.jsx("div", { className: "w-24 text-center", children: a.jsx("span", { className: "inline-block px-2 py-1 rounded text-xs", style: { background: b.bg, color: b.color }, children: Xr[g.status] || g.status }) }), a.jsxs("div", { className: "flex-1 h-8 bg-secondary/50 rounded relative overflow-hidden", children: [A > 0 && a.jsxs("div", { className: "absolute inset-y-0 left-0 rounded flex items-center transition-all", style: { width: `${Math.max(A, 10)}%`, background: x(g.priority) }, children: [a.jsx("div", { className: "absolute inset-y-0 left-0 bg-white/30 rounded", style: { width: `${S}%` } }), a.jsxs("span", { className: "text-xs text-white px-2 font-medium relative z-10 drop-shadow", children: [g.estimatedHours || 0, "h - ", S, "%"] })] }), A === 0 && a.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Sin estimación" })] })] }, g.id); }), m.length === 0 && a.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No hay tareas" })] })] }); }
function C2({ task: l, agent: i, isOpen: r, onClose: c }) { const [d, m] = U.useState(!1), { data: h = [], isLoading: x } = HN((l == null ? void 0 : l.id) || 0), { data: g = [] } = LN(), y = VN(), v = QN(), b = U.useMemo(() => { const Q = new Set(h.map(X => X.id)); return g.filter(X => !Q.has(X.id)); }, [h, g]), A = U.useCallback(Q => { l && (y.mutate({ taskId: l.id, tagId: Q }), m(!1)); }, [l, y]), S = U.useCallback(Q => { l && v.mutate({ taskId: l.id, tagId: Q }); }, [l, v]); if (!l)
    return null; const N = da[l.priority] || da.medium, C = Xr[l.status] || l.status, _ = l.taskCode || `#${l.id}`; return a.jsxs(Yr, { isOpen: r, onClose: c, title: "", maxWidth: "max-w-2xl", children: [a.jsxs("div", { className: "px-6 py-4 border-b border-border", style: { borderLeft: `4px solid ${N.color}` }, children: [a.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [a.jsx("span", { className: "px-2 py-1 rounded text-[11px] font-bold", style: { background: N.bg, color: N.color }, children: N.label }), a.jsx("span", { className: "px-2 py-1 rounded text-[11px] bg-secondary", children: C }), a.jsx("span", { className: "text-[11px] text-muted-foreground", children: _ })] }), a.jsx("h3", { className: "text-lg font-semibold", children: l.title })] }), a.jsxs("div", { className: "p-6 space-y-6", children: [a.jsxs("div", { children: [a.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [a.jsx(aj, { className: "h-4 w-4 text-solaria" }), "Descripcion"] }), a.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: l.description || "Sin descripcion disponible" })] }), l.progress > 0 && a.jsxs("div", { children: [a.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [a.jsx(vj, { className: "h-4 w-4 text-solaria" }), "Progreso"] }), a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "flex-1 h-2 bg-secondary rounded-full overflow-hidden", children: a.jsx("div", { className: "h-full rounded-full", style: { width: `${l.progress}%`, background: N.color } }) }), a.jsxs("span", { className: "text-sm font-semibold", style: { color: N.color }, children: [l.progress, "%"] })] })] }), a.jsxs("div", { children: [a.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [a.jsx(dg, { className: "h-4 w-4 text-solaria" }), "Etiquetas"] }), a.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [x ? a.jsx(We, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : h.length === 0 ? a.jsx("span", { className: "text-xs text-muted-foreground", children: "Sin etiquetas" }) : h.map(Q => a.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium group", style: { backgroundColor: `${Q.color}20`, color: Q.color }, children: [Q.name, a.jsx("button", { onClick: () => S(Q.id), className: "opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5", title: "Eliminar etiqueta", children: a.jsx(qa, { className: "h-3 w-3" }) })] }, Q.id)), d ? a.jsx("div", { className: "relative", children: a.jsxs("div", { className: "absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] max-h-[200px] overflow-y-auto", children: [b.length === 0 ? a.jsx("p", { className: "text-xs text-muted-foreground p-2", children: "No hay etiquetas disponibles" }) : b.map(Q => a.jsxs("button", { onClick: () => A(Q.id), className: "w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors flex items-center gap-2", children: [a.jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: Q.color } }), a.jsx("span", { className: "text-sm", children: Q.name })] }, Q.id)), a.jsx("button", { onClick: () => m(!1), className: "w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors text-xs text-muted-foreground mt-1 border-t border-border", children: "Cancelar" })] }) }) : a.jsx("button", { onClick: () => m(!0), className: "px-2 py-1 rounded text-xs border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-solaria hover:text-solaria transition-colors", children: "+ Agregar" })] })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(zs, { className: "h-3 w-3 text-blue-400" }), "Asignado a"] }), a.jsx("p", { className: "text-sm font-medium", children: (i == null ? void 0 : i.name) || "Sin asignar" })] }), a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(sg, { className: "h-3 w-3 text-yellow-400" }), "Horas Estimadas"] }), a.jsxs("p", { className: "text-sm font-medium", children: [l.estimatedHours || 0, " horas"] })] }), a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(ua, { className: "h-3 w-3 text-green-400" }), "Fecha Creacion"] }), a.jsx("p", { className: "text-sm font-medium", children: l.createdAt ? new Date(l.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "N/A" })] }), a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(ua, { className: "h-3 w-3 text-red-400" }), "Ultima Actualizacion"] }), a.jsx("p", { className: "text-sm font-medium", children: l.updatedAt ? st(l.updatedAt) : "N/A" })] })] })] }), a.jsxs("div", { className: "px-6 py-4 border-t border-border flex items-center justify-between", children: [a.jsx("button", { onClick: c, className: "px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm", children: "Cerrar" }), a.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg", children: [a.jsx(Ur, { className: "h-3.5 w-3.5" }), "Solo el agente puede completar"] })] })] }); }
function T2({ isOpen: l, onClose: i, projectId: r, onTaskCreated: c }) { const [d, m] = U.useState(""), [h, x] = U.useState(""), [g, y] = U.useState("medium"), [v, b] = U.useState(1), A = MN(), S = async (N) => { if (N.preventDefault(), !!d.trim())
    try {
        await A.mutateAsync({ projectId: r, title: d.trim(), description: h.trim(), priority: g, status: "pending", estimatedHours: v }), m(""), x(""), y("medium"), b(1), c(), i();
    }
    catch (C) {
        console.error("Error creating task:", C);
    } }; return a.jsx(Yr, { isOpen: l, onClose: i, title: "Nueva Tarea", maxWidth: "max-w-lg", children: a.jsxs("form", { onSubmit: S, className: "p-6 space-y-4", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Titulo *" }), a.jsx("input", { type: "text", value: d, onChange: N => m(N.target.value), placeholder: "Nombre de la tarea...", className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none", required: !0, autoFocus: !0 })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Descripcion" }), a.jsx("textarea", { value: h, onChange: N => x(N.target.value), placeholder: "Describe la tarea...", rows: 4, className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none resize-none" })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Prioridad" }), a.jsxs("select", { value: g, onChange: N => y(N.target.value), className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none", children: [a.jsx("option", { value: "low", children: "P3 - Baja" }), a.jsx("option", { value: "medium", children: "P2 - Media" }), a.jsx("option", { value: "high", children: "P1 - Alta" }), a.jsx("option", { value: "critical", children: "P0 - Critica" })] })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Horas Estimadas" }), a.jsx("input", { type: "number", value: v, onChange: N => b(Number(N.target.value)), min: .5, step: .5, className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none" })] })] }), a.jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-border", children: [a.jsx("button", { type: "button", onClick: i, className: "px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors", children: "Cancelar" }), a.jsx("button", { type: "submit", disabled: !d.trim() || A.isPending, className: "px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: A.isPending ? "Creando..." : "Crear Tarea" })] })] }) }); }
function E2() { const { id: l } = Tr(), i = ms(), r = parseInt(l || "0"), [c, d] = U.useState("kanban"), [m, h] = U.useState("priority"), [x, g] = U.useState(!1), [y, v] = U.useState(null), { data: b, isLoading: A } = Tg(r), { data: S, isLoading: N, refetch: C } = Mg(r), { data: _ } = Eg(), Q = U.useMemo(() => S ? { backlog: S.filter(R => En[R.status] === "backlog").length, todo: S.filter(R => En[R.status] === "todo").length, doing: S.filter(R => En[R.status] === "doing").length, done: S.filter(R => En[R.status] === "done").length } : { backlog: 0, todo: 0, doing: 0, done: 0 }, [S]), X = U.useMemo(() => !y || !S ? null : S.find(R => R.id === y) || null, [y, S]), H = U.useMemo(() => { if (!(!X || !_))
    return _.find(R => R.id === X.assignedAgentId); }, [X, _]), J = U.useCallback(R => { v(R); }, []), $ = U.useCallback(() => { C(); }, [C]), Y = () => { i(`/projects/${r}`); }; return A || N ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : b ? a.jsxs("div", { className: "h-full flex flex-col", children: [a.jsxs("div", { className: "flex items-center justify-between mb-4 flex-shrink-0", children: [a.jsxs("div", { className: "flex items-center gap-4", children: [a.jsx("button", { onClick: Y, className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Volver al proyecto", children: a.jsx(On, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsxs("h1", { className: "text-xl font-bold", children: ["Tareas - ", b.name] }), a.jsxs("p", { className: "text-sm text-muted-foreground", children: [(S == null ? void 0 : S.length) || 0, " tareas en total"] })] })] }), a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsxs("div", { className: "flex bg-secondary rounded-lg overflow-hidden", children: [a.jsxs("button", { onClick: () => d("kanban"), className: F("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "kanban" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [a.jsx(Bn, { className: "h-4 w-4" }), "Kanban"] }), a.jsxs("button", { onClick: () => d("list"), className: F("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "list" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [a.jsx(Un, { className: "h-4 w-4" }), "Lista"] }), a.jsxs("button", { onClick: () => d("gantt"), className: F("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "gantt" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [a.jsx(cd, { className: "h-4 w-4" }), "Gantt"] })] }), (c === "list" || c === "gantt") && a.jsxs("select", { value: m, onChange: R => h(R.target.value), className: "px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:border-solaria focus:outline-none transition-colors", children: [a.jsx("option", { value: "priority", children: "Ordenar: Prioridad" }), a.jsx("option", { value: "status", children: "Ordenar: Estado" }), a.jsx("option", { value: "progress", children: "Ordenar: Progreso" })] }), a.jsxs("button", { onClick: () => g(!0), className: "px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium flex items-center gap-2 transition-colors", children: [a.jsx(qt, { className: "h-4 w-4" }), "Nueva Tarea"] })] })] }), a.jsxs("div", { className: "flex items-center gap-1 mb-3 flex-shrink-0 bg-secondary/50 rounded-lg p-2", children: [a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#64748b" }, children: Q.backlog }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Backlog" })] }), a.jsx("div", { className: "w-px h-8 bg-border" }), a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#f59e0b" }, children: Q.todo }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Por Hacer" })] }), a.jsx("div", { className: "w-px h-8 bg-border" }), a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#3b82f6" }, children: Q.doing }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "En Progreso" })] }), a.jsx("div", { className: "w-px h-8 bg-border" }), a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#22c55e" }, children: Q.done }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Completadas" })] })] }), a.jsxs("div", { className: "flex-1 min-h-0", children: [c === "kanban" && a.jsx(S2, { tasks: S || [], agents: _ || [], onTaskClick: J, onCreateTask: () => g(!0) }), c === "list" && a.jsx("div", { className: "h-full overflow-auto", children: a.jsx(k2, { tasks: S || [], agents: _ || [], sortBy: m, onTaskClick: J }) }), c === "gantt" && a.jsx("div", { className: "h-full overflow-auto", children: a.jsx(A2, { tasks: S || [], agents: _ || [], sortBy: m, onTaskClick: J }) })] }), a.jsx(T2, { isOpen: x, onClose: () => g(!1), projectId: r, onTaskCreated: $ }), a.jsx(C2, { task: X, agent: H, isOpen: !!y, onClose: () => v(null) })] }) : a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx("p", { className: "text-muted-foreground", children: "Proyecto no encontrado" }) }); }
const Ip = { critical: { color: "text-red-500", bg: "bg-red-500/10", label: "Critica" }, high: { color: "text-orange-500", bg: "bg-orange-500/10", label: "Alta" }, medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Media" }, low: { color: "text-green-500", bg: "bg-green-500/10", label: "Baja" } }, Pp = { feature: { color: "text-purple-500", bg: "bg-purple-500/10", label: "Feature" }, bug: { color: "text-red-500", bg: "bg-red-500/10", label: "Bug" }, enhancement: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Mejora" }, documentation: { color: "text-gray-500", bg: "bg-gray-500/10", label: "Docs" }, research: { color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Research" }, maintenance: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Maint." } };
function M2({ task: l, onClick: i, showProject: r = !1, compact: c = !1 }) { const d = Ip[l.priority] || Ip.medium, m = Pp[l.type] || Pp.feature, h = l.itemsTotal || 0, x = l.itemsCompleted || 0, g = h > 0 ? Math.round(x / h * 100) : 0, y = l.dueDate && new Date(l.dueDate) < new Date && l.status !== "completed"; return c ? a.jsxs("div", { onClick: i, className: "task-card-compact", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("span", { className: F("task-badge", m.bg, m.color), children: m.label }), a.jsx("span", { className: "task-code", children: l.taskCode || `#${l.taskNumber}` })] }), a.jsx("div", { className: "task-title-compact", children: l.title }), h > 0 && a.jsxs("div", { className: "task-progress-mini", children: [a.jsx("div", { className: "task-progress-bar-mini", children: a.jsx("div", { className: "task-progress-fill-mini", style: { width: `${g}%` } }) }), a.jsxs("span", { className: "task-progress-text-mini", children: [x, "/", h] })] })] }) : a.jsxs("div", { onClick: i, className: F("task-card", l.status === "blocked" && "blocked", y && "overdue"), children: [a.jsxs("div", { className: "task-card-header", children: [a.jsxs("div", { className: "task-badges", children: [a.jsx("span", { className: F("task-badge", m.bg, m.color), children: m.label }), a.jsxs("span", { className: F("task-badge", d.bg, d.color), children: [a.jsx(eg, { className: "h-3 w-3" }), d.label] })] }), a.jsx("span", { className: "task-code", children: l.taskCode || `#${l.taskNumber}` })] }), r && l.projectName && a.jsx("div", { className: "task-project-label", children: l.projectCode || l.projectName }), a.jsx("h4", { className: "task-card-title", children: l.title }), l.description && a.jsx("p", { className: "task-card-description", children: l.description }), h > 0 && a.jsxs("div", { className: "task-items-progress", children: [a.jsxs("div", { className: "flex items-center justify-between mb-1", children: [a.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [a.jsx(at, { className: "h-3 w-3" }), "Subtareas"] }), a.jsxs("span", { className: "text-xs font-medium", children: [x, "/", h] })] }), a.jsx("div", { className: "task-progress-bar", children: a.jsx("div", { className: F("task-progress-fill", g === 100 && "complete"), style: { width: `${g}%` } }) })] }), a.jsxs("div", { className: "task-card-footer", children: [l.dueDate && a.jsxs("div", { className: F("task-meta", y && "text-red-500"), children: [a.jsx(ua, { className: "h-3 w-3" }), a.jsx("span", { children: st(l.dueDate) })] }), l.estimatedHours && a.jsxs("div", { className: "task-meta", children: [a.jsx($e, { className: "h-3 w-3" }), a.jsxs("span", { children: [l.estimatedHours, "h"] })] }), l.notes && a.jsx("div", { className: "task-meta", children: a.jsx(ig, { className: "h-3 w-3" }) }), a.jsx("div", { className: "flex-1" }), l.agentName && a.jsxs("div", { className: "task-assignee", children: [a.jsx("div", { className: "task-assignee-avatar", children: a.jsx(zs, { className: "h-3 w-3" }) }), a.jsx("span", { className: "task-assignee-name", children: l.agentName.split("-").pop() })] }), l.status === "blocked" && a.jsxs("div", { className: "task-blocked-badge", children: [a.jsx(wt, { className: "h-3 w-3" }), "Bloqueado"] })] })] }); }
function _2({ item: l, onComplete: i, disabled: r = !1, showDragHandle: c = !1 }) { const [d, m] = U.useState(!1), [h, x] = U.useState(!1), [g, y] = U.useState(""), [v, b] = U.useState(l.estimatedMinutes || 0), A = async () => { if (!(l.isCompleted || r || d)) {
    if (!h && l.estimatedMinutes) {
        x(!0);
        return;
    }
    m(!0);
    try {
        await i(l.id, g || void 0, v || void 0);
    }
    finally {
        m(!1), x(!1);
    }
} }, S = async () => { if (!(l.isCompleted || r || d)) {
    m(!0);
    try {
        await i(l.id);
    }
    finally {
        m(!1);
    }
} }; return a.jsxs("div", { className: F("task-item-row", l.isCompleted && "completed"), children: [c && a.jsx("div", { className: "task-item-handle", children: a.jsx(xj, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: S, disabled: l.isCompleted || r || d, className: F("task-item-checkbox", l.isCompleted && "checked", d && "loading"), children: d ? a.jsx(We, { className: "h-3 w-3 animate-spin" }) : l.isCompleted ? a.jsx(Mn, { className: "h-3 w-3" }) : null }), a.jsxs("div", { className: "task-item-content", children: [a.jsx("span", { className: F("task-item-title", l.isCompleted && "completed"), children: l.title }), l.description && a.jsx("span", { className: "task-item-description", children: l.description }), h && !l.isCompleted && a.jsxs("div", { className: "task-item-complete-form", children: [a.jsx("input", { type: "number", value: v, onChange: N => b(Number(N.target.value)), placeholder: "Minutos reales", className: "task-item-minutes-input", min: 0 }), a.jsx("input", { type: "text", value: g, onChange: N => y(N.target.value), placeholder: "Notas (opcional)", className: "task-item-notes-input" }), a.jsx("button", { onClick: A, disabled: d, className: "task-item-complete-btn", children: d ? a.jsx(We, { className: "h-3 w-3 animate-spin" }) : "Completar" }), a.jsx("button", { onClick: () => x(!1), className: "task-item-cancel-btn", children: "Cancelar" })] })] }), a.jsx("div", { className: "task-item-time", children: l.isCompleted && l.completedAt ? a.jsxs("span", { className: "task-item-completed-at", children: [a.jsx(Mn, { className: "h-3 w-3" }), st(l.completedAt)] }) : l.estimatedMinutes ? a.jsxs("span", { className: "task-item-estimate", children: [a.jsx($e, { className: "h-3 w-3" }), l.estimatedMinutes, "m"] }) : null })] }); }
function O2({ taskId: l, editable: i = !0, showAddForm: r = !0 }) { const { data: c, isLoading: d, error: m } = qN(l), h = BN(), x = UN(), [g, y] = U.useState([{ title: "", estimatedMinutes: 30 }]), [v, b] = U.useState(!1), [A, S] = U.useState(!1), N = (c == null ? void 0 : c.filter(Y => Y.isCompleted).length) || 0, C = (c == null ? void 0 : c.length) || 0, _ = C > 0 ? Math.round(N / C * 100) : 0, Q = () => { y([...g, { title: "", estimatedMinutes: 30 }]); }, X = Y => { g.length > 1 && y(g.filter((R, G) => G !== Y)); }, H = (Y, R, G) => { const ue = [...g]; R === "title" ? ue[Y].title = G : ue[Y].estimatedMinutes = G, y(ue); }, J = async () => { const Y = g.filter(R => R.title.trim()); if (Y.length !== 0) {
    b(!0);
    try {
        await h.mutateAsync({ taskId: l, items: Y.map(R => ({ title: R.title.trim(), estimatedMinutes: R.estimatedMinutes })) }), y([{ title: "", estimatedMinutes: 30 }]), S(!1);
    }
    finally {
        b(!1);
    }
} }, $ = async (Y, R, G) => { await x.mutateAsync({ taskId: l, itemId: Y, notes: R, actualMinutes: G }); }; return d ? a.jsxs("div", { className: "task-items-loading", children: [a.jsx(We, { className: "h-5 w-5 animate-spin" }), a.jsx("span", { children: "Cargando subtareas..." })] }) : m ? a.jsx("div", { className: "task-items-error", children: "Error al cargar subtareas" }) : a.jsxs("div", { className: "task-items-list", children: [a.jsxs("div", { className: "task-items-header", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx(ng, { className: "h-4 w-4 text-muted-foreground" }), a.jsx("span", { className: "font-medium", children: "Subtareas" }), a.jsxs("span", { className: "text-xs text-muted-foreground", children: ["(", N, "/", C, ")"] })] }), C > 0 && a.jsx("div", { className: "task-items-progress-bar", children: a.jsx("div", { className: F("task-items-progress-fill", _ === 100 && "complete"), style: { width: `${_}%` } }) })] }), a.jsx("div", { className: "task-items-body", children: c && c.length > 0 ? c.sort((Y, R) => Y.sortOrder - R.sortOrder).map(Y => a.jsx(_2, { item: Y, onComplete: $, disabled: !i }, Y.id)) : a.jsxs("div", { className: "task-items-empty", children: [a.jsx(at, { className: "h-8 w-8 text-muted-foreground/50" }), a.jsx("p", { children: "No hay subtareas definidas" })] }) }), i && r && a.jsx("div", { className: "task-items-add", children: A ? a.jsxs("div", { className: "add-items-form", children: [g.map((Y, R) => a.jsxs("div", { className: "add-item-row", children: [a.jsx("input", { type: "text", value: Y.title, onChange: G => H(R, "title", G.target.value), placeholder: "Titulo de la subtarea...", className: "add-item-title", autoFocus: R === g.length - 1 }), a.jsx("input", { type: "number", value: Y.estimatedMinutes, onChange: G => H(R, "estimatedMinutes", Number(G.target.value)), className: "add-item-minutes", min: 5, step: 5 }), a.jsx("span", { className: "add-item-minutes-label", children: "min" }), g.length > 1 && a.jsx("button", { onClick: () => X(R), className: "add-item-remove", children: "×" })] }, R)), a.jsxs("div", { className: "add-items-actions", children: [a.jsxs("button", { onClick: Q, className: "add-another-btn", children: [a.jsx(qt, { className: "h-3 w-3" }), "Agregar otra"] }), a.jsxs("div", { className: "flex gap-2", children: [a.jsx("button", { onClick: () => { S(!1), y([{ title: "", estimatedMinutes: 30 }]); }, className: "cancel-btn", children: "Cancelar" }), a.jsx("button", { onClick: J, disabled: v || !g.some(Y => Y.title.trim()), className: "submit-items-btn", children: v ? a.jsx(We, { className: "h-4 w-4 animate-spin" }) : "Guardar" })] })] })] }) : a.jsxs("button", { onClick: () => S(!0), className: "add-items-trigger", children: [a.jsx(qt, { className: "h-4 w-4" }), "Agregar subtareas"] }) })] }); }
const Cu = { pending: { label: "Pendiente", color: "text-gray-500", bg: "bg-gray-500/10" }, in_progress: { label: "En Progreso", color: "text-blue-500", bg: "bg-blue-500/10" }, review: { label: "En Revision", color: "text-purple-500", bg: "bg-purple-500/10" }, completed: { label: "Completada", color: "text-green-500", bg: "bg-green-500/10" }, blocked: { label: "Bloqueada", color: "text-red-500", bg: "bg-red-500/10" } }, ex = { critical: { label: "Critica", color: "text-red-500", bg: "bg-red-500/10" }, high: { label: "Alta", color: "text-orange-500", bg: "bg-orange-500/10" }, medium: { label: "Media", color: "text-yellow-500", bg: "bg-yellow-500/10" }, low: { label: "Baja", color: "text-green-500", bg: "bg-green-500/10" } }, tx = { feature: { label: "Feature", color: "text-purple-500", bg: "bg-purple-500/10" }, bug: { label: "Bug", color: "text-red-500", bg: "bg-red-500/10" }, enhancement: { label: "Mejora", color: "text-blue-500", bg: "bg-blue-500/10" }, documentation: { label: "Documentacion", color: "text-gray-500", bg: "bg-gray-500/10" }, research: { label: "Investigacion", color: "text-cyan-500", bg: "bg-cyan-500/10" }, maintenance: { label: "Mantenimiento", color: "text-amber-500", bg: "bg-amber-500/10" } };
function _g({ taskId: l, isOpen: i, onClose: r, onNavigateToProject: c }) { const { data: d, isLoading: m } = EN(l || 0), h = _N(), [x, g] = U.useState(!1), [y, v] = U.useState(""), [b, A] = U.useState(""); if (!i)
    return null; const S = () => { d && (v(d.notes || ""), A(d.status), g(!0)); }, N = async () => { d && (await h.mutateAsync({ id: d.id, data: { notes: y, status: b || void 0 } }), g(!1)); }, C = async (R) => { d && await h.mutateAsync({ id: d.id, data: { status: R } }); }, _ = d ? Cu[d.status] : Cu.pending, Q = d ? ex[d.priority] : ex.medium, X = d ? tx[d.type] : tx.feature, H = (d == null ? void 0 : d.dueDate) && new Date(d.dueDate) < new Date && d.status !== "completed", J = (d == null ? void 0 : d.itemsTotal) || 0, $ = (d == null ? void 0 : d.itemsCompleted) || 0, Y = J > 0 ? Math.round($ / J * 100) : (d == null ? void 0 : d.progress) || 0; return a.jsxs("div", { className: "drawer-container", children: [a.jsx("div", { className: F("drawer-overlay", i && "active"), onClick: r }), a.jsx("div", { className: F("drawer-panel max-w-xl", i && "active"), children: m ? a.jsx("div", { className: "flex items-center justify-center h-full", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : d ? a.jsxs(a.Fragment, { children: [a.jsxs("div", { className: "drawer-header", children: [a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("span", { className: F("task-badge", X.bg, X.color), children: X.label }), a.jsx("span", { className: "task-code", children: d.taskCode || `#${d.taskNumber}` })] }), a.jsx("h2", { className: "drawer-title", children: d.title }), d.projectName && a.jsxs("button", { onClick: () => c == null ? void 0 : c(d.projectId), className: "drawer-subtitle flex items-center gap-1 hover:text-primary transition-colors", children: [d.projectCode || d.projectName, a.jsx(ts, { className: "h-3 w-3" })] })] }), a.jsx("button", { onClick: r, className: "drawer-close", children: a.jsx(qa, { className: "h-5 w-5" }) })] }), a.jsxs("div", { className: "drawer-content", children: [a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(at, { className: "h-4 w-4" }), "Estado"] }), a.jsx("div", { className: "task-detail-value", children: x ? a.jsx("select", { value: b, onChange: R => A(R.target.value), className: "task-detail-select", children: Object.entries(Cu).map(([R, G]) => a.jsx("option", { value: R, children: G.label }, R)) }) : a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("span", { className: F("status-badge", _.bg, _.color), children: _.label }), a.jsxs("div", { className: "task-status-actions", children: [d.status === "pending" && a.jsx("button", { onClick: () => C("in_progress"), className: "status-action-btn in_progress", children: "Iniciar" }), d.status === "in_progress" && a.jsxs(a.Fragment, { children: [a.jsx("button", { onClick: () => C("review"), className: "status-action-btn review", children: "A Revision" }), a.jsx("button", { onClick: () => C("completed"), className: "status-action-btn completed", children: "Completar" })] }), d.status === "review" && a.jsx("button", { onClick: () => C("completed"), className: "status-action-btn completed", children: "Aprobar" })] })] }) })] }), a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(eg, { className: "h-4 w-4" }), "Prioridad"] }), a.jsx("div", { className: "task-detail-value", children: a.jsx("span", { className: F("priority-badge", Q.bg, Q.color), children: Q.label }) })] }), d.agentName && a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(zs, { className: "h-4 w-4" }), "Asignado"] }), a.jsx("div", { className: "task-detail-value", children: a.jsxs("div", { className: "task-assignee-full", children: [a.jsx("div", { className: "task-assignee-avatar-lg", children: a.jsx(zs, { className: "h-4 w-4" }) }), a.jsx("span", { children: d.agentName })] }) })] }), d.dueDate && a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(ua, { className: "h-4 w-4" }), "Fecha limite"] }), a.jsxs("div", { className: F("task-detail-value", H && "text-red-500"), children: [Qr(d.dueDate), H && a.jsxs("span", { className: "ml-2 text-xs", children: [a.jsx(wt, { className: "h-3 w-3 inline" }), " Vencida"] })] })] }), (d.estimatedHours || d.actualHours) && a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx($e, { className: "h-4 w-4" }), "Tiempo"] }), a.jsx("div", { className: "task-detail-value", children: d.actualHours ? a.jsxs("span", { children: [d.actualHours, "h / ", d.estimatedHours, "h est."] }) : a.jsxs("span", { children: [d.estimatedHours, "h estimadas"] }) })] })] }), a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-section-title", children: [a.jsx(ug, { className: "h-4 w-4" }), "Progreso"] }), a.jsxs("div", { className: "task-progress-display", children: [a.jsx("div", { className: "task-progress-bar-lg", children: a.jsx("div", { className: F("task-progress-fill-lg", Y === 100 && "complete"), style: { width: `${Y}%` } }) }), a.jsxs("span", { className: "task-progress-label", children: [Y, "%"] })] })] }), d.description && a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-section-title", children: [a.jsx(Px, { className: "h-4 w-4" }), "Descripcion"] }), a.jsx("p", { className: "task-description-full", children: d.description })] }), a.jsx("div", { className: "task-detail-section", children: a.jsx(O2, { taskId: d.id, editable: d.status !== "completed", showAddForm: d.status !== "completed" }) }), a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-section-header", children: [a.jsxs("div", { className: "task-detail-section-title", children: [a.jsx(ig, { className: "h-4 w-4" }), "Notas"] }), !x && a.jsxs("button", { onClick: S, className: "edit-btn", children: [a.jsx(Sj, { className: "h-3 w-3" }), "Editar"] })] }), x ? a.jsxs("div", { className: "task-notes-edit", children: [a.jsx("textarea", { value: y, onChange: R => v(R.target.value), placeholder: "Agregar notas...", className: "task-notes-textarea", rows: 4 }), a.jsxs("div", { className: "task-notes-actions", children: [a.jsx("button", { onClick: () => g(!1), className: "cancel-btn", children: "Cancelar" }), a.jsx("button", { onClick: N, disabled: h.isPending, className: "save-btn", children: h.isPending ? a.jsx(We, { className: "h-4 w-4 animate-spin" }) : a.jsxs(a.Fragment, { children: [a.jsx(cg, { className: "h-3 w-3" }), "Guardar"] }) })] })] }) : d.notes ? a.jsx("p", { className: "task-notes-content", children: d.notes }) : a.jsx("p", { className: "task-notes-empty", children: "Sin notas" })] }), a.jsxs("div", { className: "task-detail-meta", children: [a.jsxs("span", { children: ["Creada ", st(d.createdAt)] }), a.jsx("span", { className: "meta-separator", children: "•" }), a.jsxs("span", { children: ["Actualizada ", st(d.updatedAt)] }), d.completedAt && a.jsxs(a.Fragment, { children: [a.jsx("span", { className: "meta-separator", children: "•" }), a.jsxs("span", { className: "text-green-500", children: ["Completada ", st(d.completedAt)] })] })] })] })] }) : a.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Tarea no encontrada" }) })] }); }
const z2 = { pending: "gantt-bar-pending", in_progress: "gantt-bar-in_progress", review: "gantt-bar-review", completed: "gantt-bar-completed", blocked: "gantt-bar-blocked" };
function D2({ task: l, startDate: i, endDate: r, onClick: c }) { const d = l.createdAt ? new Date(l.createdAt) : i, m = l.dueDate ? new Date(l.dueDate) : new Date(d.getTime() + 10080 * 60 * 1e3), h = i.getTime(), x = r.getTime(), g = x - h, y = Math.max(d.getTime(), h), v = Math.min(m.getTime(), x), b = (y - h) / g * 100, A = (v - y) / g * 100; if (A <= 0 || b >= 100)
    return a.jsxs("div", { className: "gantt-row", onClick: c, children: [a.jsxs("div", { className: "gantt-row-info", children: [a.jsx("span", { className: "gantt-task-code", children: l.taskCode || `#${l.taskNumber}` }), a.jsx("span", { className: "gantt-task-title", children: l.title })] }), a.jsx("div", { className: "gantt-row-timeline", children: a.jsx("div", { className: "gantt-bar-empty", children: "Fuera del rango visible" }) })] }); const S = l.progress || 0, N = l.dueDate && new Date(l.dueDate) < new Date && l.status !== "completed"; return a.jsxs("div", { className: F("gantt-row", c && "clickable"), onClick: c, children: [a.jsxs("div", { className: "gantt-row-info", children: [a.jsx("span", { className: "gantt-task-code", children: l.taskCode || `#${l.taskNumber}` }), a.jsx("span", { className: "gantt-task-title", children: l.title }), l.agentName && a.jsxs("span", { className: "gantt-task-agent", children: [a.jsx(zs, { className: "h-3 w-3" }), l.agentName.split("-").pop()] })] }), a.jsx("div", { className: "gantt-row-timeline", children: a.jsxs("div", { className: F("gantt-bar", z2[l.status], N && "overdue"), style: { left: `${Math.max(0, b)}%`, width: `${Math.min(A, 100 - b)}%` }, children: [a.jsx("div", { className: "gantt-bar-progress", style: { width: `${S}%` } }), a.jsxs("div", { className: "gantt-bar-content", children: [A > 10 && a.jsx("span", { className: "gantt-bar-label", children: l.title.length > 20 ? l.title.substring(0, 20) + "..." : l.title }), N && a.jsx(wt, { className: "h-3 w-3 text-red-500" })] })] }) })] }); }
function R2(l) { const i = new Date(Date.UTC(l.getFullYear(), l.getMonth(), l.getDate())), r = i.getUTCDay() || 7; i.setUTCDate(i.getUTCDate() + 4 - r); const c = new Date(Date.UTC(i.getUTCFullYear(), 0, 1)); return Math.ceil(((i.getTime() - c.getTime()) / 864e5 + 1) / 7); }
function Tu(l) { const i = l.getDate(), r = l.toLocaleDateString("es", { month: "short" }); return `${i} ${r}`; }
function q2({ tasks: l, onTaskClick: i, weeksToShow: r = 8 }) { const [c, d] = U.useState(0), { startDate: m, endDate: h, weeks: x } = U.useMemo(() => { const S = new Date, N = S.getDay(), C = N === 0 ? -6 : 1 - N, _ = new Date(S); _.setDate(S.getDate() + C + c * 7), _.setHours(0, 0, 0, 0); const Q = new Date(_); Q.setDate(_.getDate() + r * 7); const X = []; for (let H = 0; H < r; H++) {
    const J = new Date(_);
    J.setDate(_.getDate() + H * 7), X.push({ start: J, label: Tu(J), weekNum: R2(J) });
} return { startDate: _, endDate: Q, weeks: X }; }, [c, r]), g = U.useMemo(() => { const S = new Date, N = m.getTime(), C = h.getTime(), _ = S.getTime(); return _ < N || _ > C ? null : (_ - N) / (C - N) * 100; }, [m, h]), y = U.useMemo(() => [...l].sort((S, N) => { const C = S.createdAt ? new Date(S.createdAt).getTime() : 0, _ = N.createdAt ? new Date(N.createdAt).getTime() : 0; return C - _; }), [l]), v = () => d(c - r), b = () => d(c + r), A = () => d(0); return a.jsxs("div", { className: "gantt-container", children: [a.jsxs("div", { className: "gantt-nav", children: [a.jsxs("div", { className: "gantt-nav-buttons", children: [a.jsx("button", { onClick: v, className: "gantt-nav-btn", children: a.jsx($x, { className: "h-4 w-4" }) }), a.jsxs("button", { onClick: A, className: "gantt-nav-btn today", children: [a.jsx(ua, { className: "h-4 w-4" }), "Hoy"] }), a.jsx("button", { onClick: b, className: "gantt-nav-btn", children: a.jsx(ld, { className: "h-4 w-4" }) })] }), a.jsxs("div", { className: "gantt-date-range", children: [Tu(m), " - ", Tu(h)] })] }), a.jsxs("div", { className: "gantt-header", children: [a.jsx("div", { className: "gantt-header-info", children: "Tarea" }), a.jsx("div", { className: "gantt-header-timeline", children: x.map((S, N) => a.jsxs("div", { className: "gantt-week-column", style: { width: `${100 / r}%` }, children: [a.jsx("div", { className: "gantt-week-label", children: S.label }), a.jsxs("div", { className: "gantt-week-number", children: ["S", S.weekNum] })] }, N)) })] }), a.jsxs("div", { className: "gantt-body", children: [g !== null && a.jsx("div", { className: "gantt-today-marker", style: { left: `calc(200px + ${g}% * (100% - 200px) / 100)` }, children: a.jsx("div", { className: "gantt-today-label", children: "Hoy" }) }), a.jsx("div", { className: "gantt-grid", children: x.map((S, N) => a.jsx("div", { className: "gantt-grid-line", style: { left: `calc(200px + ${N / r * 100}% * (100% - 200px) / 100)` } }, N)) }), y.length > 0 ? y.map(S => a.jsx(D2, { task: S, startDate: m, endDate: h, onClick: () => i == null ? void 0 : i(S) }, S.id)) : a.jsxs("div", { className: "gantt-empty", children: [a.jsx(ua, { className: "h-12 w-12 text-muted-foreground/50" }), a.jsx("p", { children: "No hay tareas para mostrar en el Gantt" })] })] }), a.jsxs("div", { className: "gantt-legend", children: [a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color pending" }), a.jsx("span", { children: "Pendiente" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color in_progress" }), a.jsx("span", { children: "En Progreso" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color review" }), a.jsx("span", { children: "En Revision" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color completed" }), a.jsx("span", { children: "Completada" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color blocked" }), a.jsx("span", { children: "Bloqueada" })] })] })] }); }
const Eu = [{ id: "pending", label: "Pendiente", color: "border-t-yellow-500", icon: $e }, { id: "in_progress", label: "En Progreso", color: "border-t-blue-500", icon: We }, { id: "review", label: "Revision", color: "border-t-purple-500", icon: Ln }, { id: "completed", label: "Completado", color: "border-t-green-500", icon: at }, { id: "blocked", label: "Bloqueado", color: "border-t-red-500", icon: wt }];
function B2({ column: l, tasks: i, onTaskClick: r }) { const c = l.icon; return a.jsxs("div", { className: "kanban-column", children: [a.jsxs("div", { className: F("kanban-column-header", l.color), children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx(c, { className: F("h-4 w-4", l.id === "in_progress" && "animate-spin") }), a.jsx("h3", { className: "font-medium", children: l.label })] }), a.jsx("span", { className: "kanban-column-count", children: i.length })] }), a.jsxs("div", { className: "kanban-column-body", children: [i.map(d => a.jsx(M2, { task: d, onClick: () => r(d), compact: !0 }, d.id)), i.length === 0 && a.jsx("div", { className: "kanban-empty", children: a.jsx("span", { children: "Sin tareas" }) })] })] }); }
function U2({ tasks: l, onTaskClick: i }) { return a.jsx("div", { className: "list-table-container", children: a.jsxs("table", { className: "list-table", children: [a.jsx("thead", { children: a.jsxs("tr", { children: [a.jsx("th", { children: "Tarea" }), a.jsx("th", { children: "Proyecto" }), a.jsx("th", { children: "Estado" }), a.jsx("th", { children: "Prioridad" }), a.jsx("th", { children: "Progreso" }), a.jsx("th", { children: "Subtareas" }), a.jsx("th", { children: "Actualizado" })] }) }), a.jsx("tbody", { children: l.map(r => a.jsxs("tr", { onClick: () => i(r), className: "cursor-pointer", children: [a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: r.taskCode || `#${r.taskNumber}` }), a.jsx("span", { className: "font-medium", children: r.title })] }) }), a.jsx("td", { className: "text-muted-foreground", children: r.projectCode || r.projectName }), a.jsx("td", { children: a.jsx("span", { className: F("status-badge", Ag(r.status)), children: r.status.replace("_", " ") }) }), a.jsx("td", { children: a.jsx("span", { className: F("priority-badge", Cg(r.priority)), children: r.priority }) }), a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "h-1.5 w-16 rounded-full bg-muted", children: a.jsx("div", { className: "h-full rounded-full bg-primary", style: { width: `${r.progress}%` } }) }), a.jsxs("span", { className: "text-xs", children: [r.progress, "%"] })] }) }), a.jsx("td", { className: "text-center", children: a.jsxs("span", { className: "text-sm", children: [r.itemsCompleted || 0, "/", r.itemsTotal || 0] }) }), a.jsx("td", { className: "text-muted-foreground", children: st(r.updatedAt) })] }, r.id)) })] }) }); }
function L2() { const l = ms(), [i, r] = U.useState("kanban"), [c, d] = U.useState(""), [m, h] = U.useState(""), [x, g] = U.useState(""), [y, v] = U.useState(null), { data: b, isLoading: A } = Kr(), { data: S } = Gr(), N = b == null ? void 0 : b.filter(R => { var Ve, ke; const G = R.title.toLowerCase().includes(c.toLowerCase()) || ((Ve = R.taskCode) == null ? void 0 : Ve.toLowerCase().includes(c.toLowerCase())) || ((ke = R.description) == null ? void 0 : ke.toLowerCase().includes(c.toLowerCase())), ue = !m || R.projectId.toString() === m, nt = !x || R.status === x; return G && ue && nt; }), C = Eu.reduce((R, G) => (R[G.id] = (N == null ? void 0 : N.filter(ue => ue.status === G.id)) || [], R), {}), _ = U.useCallback(R => { v(R.id); }, []), Q = U.useCallback(() => { v(null); }, []), X = U.useCallback(R => { l(`/projects/${R}`); }, [l]), H = (b == null ? void 0 : b.length) || 0, J = (b == null ? void 0 : b.filter(R => R.status === "completed").length) || 0, $ = (b == null ? void 0 : b.filter(R => R.status === "in_progress").length) || 0, Y = (b == null ? void 0 : b.filter(R => R.status === "blocked").length) || 0; return A ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Tareas" }), a.jsxs("p", { className: "section-subtitle", children: [H, " tareas • ", J, " completadas • ", $, " en progreso", Y > 0 && a.jsxs("span", { className: "text-red-500", children: [" • ", Y, " bloqueadas"] })] })] }), a.jsx("div", { className: "section-actions", children: a.jsxs("button", { className: "btn-primary", children: [a.jsx(qt, { className: "h-4 w-4" }), "Nueva Tarea"] }) })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon tasks", children: a.jsx(at, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Total Tareas" }), a.jsx("div", { className: "stat-value", children: H })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(at, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Completadas" }), a.jsx("div", { className: "stat-value", children: J })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon active", children: a.jsx(We, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "En Progreso" }), a.jsx("div", { className: "stat-value", children: $ })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon", style: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }, children: a.jsx(wt, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Bloqueadas" }), a.jsx("div", { className: "stat-value", children: Y })] })] })] }), a.jsxs("div", { className: "filters-row", children: [a.jsxs("div", { className: "filter-search", children: [a.jsx(Ln, { className: "filter-search-icon" }), a.jsx("input", { type: "text", placeholder: "Buscar tareas...", value: c, onChange: R => d(R.target.value), className: "filter-search-input" })] }), a.jsxs("div", { className: "filter-selects", children: [a.jsxs("div", { className: "filter-select-wrapper", children: [a.jsx(hj, { className: "h-4 w-4 text-muted-foreground" }), a.jsxs("select", { value: m, onChange: R => h(R.target.value), className: "filter-select", children: [a.jsx("option", { value: "", children: "Todos los proyectos" }), S == null ? void 0 : S.map(R => a.jsxs("option", { value: R.id, children: [R.code, " - ", R.name] }, R.id))] })] }), a.jsxs("select", { value: x, onChange: R => g(R.target.value), className: "filter-select", children: [a.jsx("option", { value: "", children: "Todos los estados" }), Eu.map(R => a.jsx("option", { value: R.id, children: R.label }, R.id))] })] }), a.jsxs("div", { className: "view-toggle", children: [a.jsx("button", { onClick: () => r("kanban"), className: F("view-toggle-btn", i === "kanban" && "active"), title: "Vista Kanban", children: a.jsx(Bn, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => r("list"), className: F("view-toggle-btn", i === "list" && "active"), title: "Vista Lista", children: a.jsx(Un, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => r("gantt"), className: F("view-toggle-btn", i === "gantt" && "active"), title: "Vista Gantt", children: a.jsx(cd, { className: "h-4 w-4" }) })] })] }), i === "kanban" && a.jsx("div", { className: "kanban-container", children: Eu.map(R => a.jsx(B2, { column: R, tasks: C[R.id], onTaskClick: _ }, R.id)) }), i === "list" && a.jsx(U2, { tasks: N || [], onTaskClick: _ }), i === "gantt" && a.jsx(q2, { tasks: N || [], onTaskClick: _ }), a.jsx(_g, { taskId: y, isOpen: y !== null, onClose: Q, onNavigateToProject: X })] }); }
function H2() { const l = ms(), [i, r] = U.useState(""), [c, d] = U.useState(""), [m, h] = U.useState(null), { data: x, isLoading: g } = Kr(), { data: y } = Gr(), v = (x == null ? void 0 : x.filter(H => H.status === "completed")) || [], A = [...v.filter(H => { var Y, R; const J = H.title.toLowerCase().includes(i.toLowerCase()) || ((Y = H.taskCode) == null ? void 0 : Y.toLowerCase().includes(i.toLowerCase())) || ((R = H.description) == null ? void 0 : R.toLowerCase().includes(i.toLowerCase())), $ = !c || H.projectId.toString() === c; return J && $; })].sort((H, J) => { const $ = H.completedAt ? new Date(H.completedAt).getTime() : new Date(H.updatedAt).getTime(); return (J.completedAt ? new Date(J.completedAt).getTime() : new Date(J.updatedAt).getTime()) - $; }), S = U.useCallback(H => { h(H.id); }, []), N = U.useCallback(() => { h(null); }, []), C = U.useCallback(H => { l(`/projects/${H}`); }, [l]), _ = A.reduce((H, J) => { const $ = J.projectCode || J.projectName || "Sin Proyecto"; return H[$] || (H[$] = []), H[$].push(J), H; }, {}), Q = v.length, X = v.filter(H => { const J = H.completedAt ? new Date(H.completedAt) : new Date(H.updatedAt), $ = new Date; return $.setDate($.getDate() - 7), J >= $; }).length; return g ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { className: "flex items-center gap-4", children: [a.jsx("button", { onClick: () => l(-1), className: "p-2 hover:bg-muted rounded-lg transition-colors", children: a.jsx(On, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsxs("h1", { className: "section-title flex items-center gap-2", children: [a.jsx(xr, { className: "h-6 w-6 text-primary" }), "Tareas Almacenadas"] }), a.jsxs("p", { className: "section-subtitle", children: [Q, " tareas completadas • ", X, " esta semana"] })] })] }) }), a.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(at, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Total Completadas" }), a.jsx("div", { className: "stat-value", children: Q })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon", children: a.jsx(ua, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Esta Semana" }), a.jsx("div", { className: "stat-value", children: X })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(xr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Proyectos" }), a.jsx("div", { className: "stat-value", children: Object.keys(_).length })] })] })] }), a.jsxs("div", { className: "filters-row", children: [a.jsxs("div", { className: "filter-search", children: [a.jsx(Ln, { className: "filter-search-icon" }), a.jsx("input", { type: "text", placeholder: "Buscar tareas completadas...", value: i, onChange: H => r(H.target.value), className: "filter-search-input" })] }), a.jsx("div", { className: "filter-selects", children: a.jsxs("select", { value: c, onChange: H => d(H.target.value), className: "filter-select", children: [a.jsx("option", { value: "", children: "Todos los proyectos" }), y == null ? void 0 : y.map(H => a.jsxs("option", { value: H.id, children: [H.code, " - ", H.name] }, H.id))] }) })] }), a.jsxs("div", { className: "space-y-6", children: [Object.entries(_).map(([H, J]) => a.jsxs("div", { className: "glass-card", children: [a.jsxs("div", { className: "p-4 border-b border-border", children: [a.jsx("h3", { className: "font-semibold text-lg", children: H }), a.jsxs("p", { className: "text-sm text-muted-foreground", children: [J.length, " tareas completadas"] })] }), a.jsx("div", { className: "divide-y divide-border", children: J.map($ => a.jsx("div", { onClick: () => S($), className: "p-4 hover:bg-muted/50 cursor-pointer transition-colors", children: a.jsxs("div", { className: "flex items-start justify-between gap-4", children: [a.jsxs("div", { className: "flex items-start gap-3 min-w-0 flex-1", children: [a.jsx(at, { className: "h-5 w-5 text-green-500 mt-0.5 shrink-0" }), a.jsxs("div", { className: "min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("span", { className: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded", children: $.taskCode || `#${$.taskNumber}` }), a.jsx("span", { className: F("text-xs px-1.5 py-0.5 rounded", Cg($.priority)), children: $.priority })] }), a.jsx("h4", { className: "font-medium truncate", children: $.title }), $.description && a.jsx("p", { className: "text-sm text-muted-foreground line-clamp-1 mt-1", children: $.description })] })] }), a.jsxs("div", { className: "text-right shrink-0", children: [a.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [a.jsx($e, { className: "h-3 w-3" }), st($.completedAt || $.updatedAt)] }), $.agentName && a.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end", children: [a.jsx(zs, { className: "h-3 w-3" }), $.agentName] })] })] }) }, $.id)) })] }, H)), A.length === 0 && a.jsxs("div", { className: "glass-card p-12 text-center", children: [a.jsx(xr, { className: "h-12 w-12 text-muted-foreground/50 mx-auto mb-4" }), a.jsx("h3", { className: "text-lg font-medium text-muted-foreground", children: "No hay tareas completadas" }), a.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Las tareas completadas apareceran aqui" })] })] }), a.jsx(_g, { taskId: m, isOpen: m !== null, onClose: N, onNavigateToProject: C })] }); }
function V2() { var R; const l = ms(), { user: i } = fs(), { theme: r, toggleTheme: c } = Vr(), [d, m] = U.useState({ name: (i == null ? void 0 : i.name) || "", email: (i == null ? void 0 : i.email) || "" }), [h, x] = U.useState(!1), [g, y] = U.useState(null), [v, b] = U.useState({ currentPassword: "", newPassword: "", confirmPassword: "" }), [A, S] = U.useState({ current: !1, new: !1, confirm: !1 }), [N, C] = U.useState(!1), [_, Q] = U.useState(null), [X, H] = U.useState(null), J = async (G) => { G.preventDefault(), x(!0), y(null); try {
    await new Promise(ue => setTimeout(ue, 1e3)), y({ type: "success", text: "Perfil actualizado correctamente" });
}
catch {
    y({ type: "error", text: "Error al actualizar el perfil" });
}
finally {
    x(!1);
} }, $ = async (G) => { if (G.preventDefault(), Q(null), v.newPassword !== v.confirmPassword) {
    Q({ type: "error", text: "Las contrasenas no coinciden" });
    return;
} if (v.newPassword.length < 6) {
    Q({ type: "error", text: "La contrasena debe tener al menos 6 caracteres" });
    return;
} C(!0); try {
    await new Promise(ue => setTimeout(ue, 1e3)), Q({ type: "success", text: "Contrasena actualizada correctamente" }), b({ currentPassword: "", newPassword: "", confirmPassword: "" });
}
catch {
    Q({ type: "error", text: "Error al actualizar la contrasena" });
}
finally {
    C(!1);
} }, Y = G => { var nt; const ue = (nt = G.target.files) == null ? void 0 : nt[0]; if (ue) {
    const Ve = new FileReader;
    Ve.onload = ke => { var Ie; H((Ie = ke.target) == null ? void 0 : Ie.result); }, Ve.readAsDataURL(ue);
} }; return a.jsxs("div", { className: "space-y-6 max-w-4xl mx-auto", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { className: "flex items-center gap-4", children: [a.jsx("button", { onClick: () => l(-1), className: "p-2 hover:bg-muted rounded-lg transition-colors", children: a.jsx(On, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Configuracion" }), a.jsx("p", { className: "section-subtitle", children: "Gestiona tu perfil y preferencias" })] })] }) }), a.jsxs("div", { className: "grid gap-6", children: [a.jsxs("div", { className: "glass-card", children: [a.jsx("div", { className: "p-6 border-b border-border", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: a.jsx(zs, { className: "h-5 w-5 text-primary" }) }), a.jsxs("div", { children: [a.jsx("h2", { className: "font-semibold", children: "Perfil" }), a.jsx("p", { className: "text-sm text-muted-foreground", children: "Tu informacion personal" })] })] }) }), a.jsxs("form", { onSubmit: J, className: "p-6 space-y-6", children: [a.jsxs("div", { className: "flex items-center gap-6", children: [a.jsxs("div", { className: "relative", children: [a.jsx("div", { className: "h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold overflow-hidden", children: X ? a.jsx("img", { src: X, alt: "Avatar", className: "h-full w-full object-cover" }) : ((R = i == null ? void 0 : i.name) == null ? void 0 : R.charAt(0).toUpperCase()) || "U" }), a.jsxs("label", { className: "absolute -bottom-1 -right-1 p-1.5 bg-muted rounded-full cursor-pointer hover:bg-accent transition-colors", children: [a.jsx(ij, { className: "h-4 w-4" }), a.jsx("input", { type: "file", accept: "image/*", onChange: Y, className: "hidden" })] })] }), a.jsxs("div", { children: [a.jsx("h3", { className: "font-medium", children: i == null ? void 0 : i.name }), a.jsx("p", { className: "text-sm text-muted-foreground capitalize", children: i == null ? void 0 : i.role })] })] }), a.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [a.jsxs("div", { className: "space-y-2", children: [a.jsx("label", { className: "text-sm font-medium", children: "Nombre" }), a.jsx("input", { type: "text", value: d.name, onChange: G => m({ ...d, name: G.target.value }), className: "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" })] }), a.jsxs("div", { className: "space-y-2", children: [a.jsx("label", { className: "text-sm font-medium", children: "Email" }), a.jsx("input", { type: "email", value: d.email, onChange: G => m({ ...d, email: G.target.value }), className: "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" })] })] }), g && a.jsx("div", { className: F("px-4 py-3 rounded-lg text-sm", g.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: g.text }), a.jsx("div", { className: "flex justify-end", children: a.jsx("button", { type: "submit", disabled: h, className: "btn-primary", children: h ? a.jsx(We, { className: "h-4 w-4 animate-spin" }) : a.jsxs(a.Fragment, { children: [a.jsx(cg, { className: "h-4 w-4" }), "Guardar cambios"] }) }) })] })] }), a.jsxs("div", { className: "glass-card", children: [a.jsx("div", { className: "p-6 border-b border-border", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "p-2 rounded-lg bg-orange-500/10", children: a.jsx(jj, { className: "h-5 w-5 text-orange-500" }) }), a.jsxs("div", { children: [a.jsx("h2", { className: "font-semibold", children: "Seguridad" }), a.jsx("p", { className: "text-sm text-muted-foreground", children: "Cambia tu contrasena" })] })] }) }), a.jsxs("form", { onSubmit: $, className: "p-6 space-y-4", children: [a.jsxs("div", { className: "space-y-2", children: [a.jsx("label", { className: "text-sm font-medium", children: "Contrasena actual" }), a.jsxs("div", { className: "relative", children: [a.jsx("input", { type: A.current ? "text" : "password", value: v.currentPassword, onChange: G => b({ ...v, currentPassword: G.target.value }), className: "w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" }), a.jsx("button", { type: "button", onClick: () => S({ ...A, current: !A.current }), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: A.current ? a.jsx(vu, { className: "h-4 w-4" }) : a.jsx(ju, { className: "h-4 w-4" }) })] })] }), a.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [a.jsxs("div", { className: "space-y-2", children: [a.jsx("label", { className: "text-sm font-medium", children: "Nueva contrasena" }), a.jsxs("div", { className: "relative", children: [a.jsx("input", { type: A.new ? "text" : "password", value: v.newPassword, onChange: G => b({ ...v, newPassword: G.target.value }), className: "w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" }), a.jsx("button", { type: "button", onClick: () => S({ ...A, new: !A.new }), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: A.new ? a.jsx(vu, { className: "h-4 w-4" }) : a.jsx(ju, { className: "h-4 w-4" }) })] })] }), a.jsxs("div", { className: "space-y-2", children: [a.jsx("label", { className: "text-sm font-medium", children: "Confirmar contrasena" }), a.jsxs("div", { className: "relative", children: [a.jsx("input", { type: A.confirm ? "text" : "password", value: v.confirmPassword, onChange: G => b({ ...v, confirmPassword: G.target.value }), className: "w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" }), a.jsx("button", { type: "button", onClick: () => S({ ...A, confirm: !A.confirm }), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: A.confirm ? a.jsx(vu, { className: "h-4 w-4" }) : a.jsx(ju, { className: "h-4 w-4" }) })] })] })] }), _ && a.jsx("div", { className: F("px-4 py-3 rounded-lg text-sm", _.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: _.text }), a.jsx("div", { className: "flex justify-end", children: a.jsx("button", { type: "submit", disabled: N, className: "btn-primary", children: N ? a.jsx(We, { className: "h-4 w-4 animate-spin" }) : a.jsxs(a.Fragment, { children: [a.jsx(og, { className: "h-4 w-4" }), "Cambiar contrasena"] }) }) })] })] }), a.jsxs("div", { className: "glass-card", children: [a.jsx("div", { className: "p-6 border-b border-border", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "p-2 rounded-lg bg-blue-500/10", children: a.jsx(Fx, { className: "h-5 w-5 text-blue-500" }) }), a.jsxs("div", { children: [a.jsx("h2", { className: "font-semibold", children: "Preferencias" }), a.jsx("p", { className: "text-sm text-muted-foreground", children: "Personaliza tu experiencia" })] })] }) }), a.jsxs("div", { className: "p-6 space-y-4", children: [a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { children: [a.jsx("h3", { className: "font-medium", children: "Tema" }), a.jsx("p", { className: "text-sm text-muted-foreground", children: "Selecciona el tema de la interfaz" })] }), a.jsx("button", { onClick: c, className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors", children: r === "dark" ? a.jsxs(a.Fragment, { children: [a.jsx(Gu, { className: "h-4 w-4" }), "Oscuro"] }) : a.jsxs(a.Fragment, { children: [a.jsx(jr, { className: "h-4 w-4" }), "Claro"] }) })] }), a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { children: [a.jsx("h3", { className: "font-medium", children: "Notificaciones" }), a.jsx("p", { className: "text-sm text-muted-foreground", children: "Recibe alertas en tiempo real" })] }), a.jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [a.jsx("input", { type: "checkbox", defaultChecked: !0, className: "sr-only peer" }), a.jsx("div", { className: "w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" })] })] })] })] })] })] }); }
const sx = { active: { label: "Activo", icon: _n }, busy: { label: "Ocupado", icon: $e }, inactive: { label: "Inactivo", icon: wt }, error: { label: "Error", icon: wt }, maintenance: { label: "Mantenimiento", icon: rd } };
function Q2({ agent: l }) { const i = sx[l.status] || sx.inactive, r = i.icon; return a.jsxs("div", { className: "rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors", children: [a.jsxs("div", { className: "flex items-start gap-4", children: [a.jsxs("div", { className: "relative", children: [a.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10", children: l.avatar ? a.jsx("img", { src: l.avatar, alt: l.name, className: "h-16 w-16 rounded-full object-cover" }) : a.jsx(Ur, { className: "h-8 w-8 text-primary" }) }), a.jsx("span", { className: F("absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card", Ag(l.status)) })] }), a.jsxs("div", { className: "flex-1", children: [a.jsx("h3", { className: "font-semibold text-lg", children: l.name }), a.jsx("p", { className: "text-sm text-muted-foreground", children: l.role }), a.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [a.jsx(r, { className: "h-3.5 w-3.5" }), a.jsx("span", { className: "text-sm capitalize", children: i.label })] })] })] }), l.currentTask && a.jsxs("div", { className: "mt-4 rounded-lg bg-muted/50 p-3", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Tarea actual" }), a.jsx("p", { className: "text-sm font-medium", children: l.currentTask })] }), l.description && a.jsx("p", { className: "mt-4 text-sm text-muted-foreground line-clamp-2", children: l.description }), a.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4", children: [a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-2xl font-bold text-green-500", children: l.tasksCompleted || 0 }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Completadas" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-2xl font-bold text-blue-500", children: l.tasksInProgress || 0 }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "En progreso" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-2xl font-bold", children: l.avgTaskTime ? `${l.avgTaskTime.toFixed(1)}h` : "-" }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Tiempo prom." })] })] }), a.jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground", children: [a.jsxs("span", { children: ["Última actividad: ", l.lastActivity ? st(l.lastActivity) : "Nunca"] }), l.lastHeartbeat && a.jsxs("span", { className: "flex items-center gap-1", children: [a.jsx(_n, { className: "h-3 w-3" }), st(l.lastHeartbeat)] })] })] }); }
function G2({ agents: l }) { const i = l.filter(m => m.status === "active").length, r = l.filter(m => m.status === "busy").length, c = l.filter(m => m.status === "inactive").length, d = l.filter(m => m.status === "error").length; return a.jsxs("div", { className: "grid gap-4 sm:grid-cols-4", children: [a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-green-500/10 p-2", children: a.jsx(_n, { className: "h-5 w-5 text-green-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: i }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Activos" })] })] }) }), a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-blue-500/10 p-2", children: a.jsx($e, { className: "h-5 w-5 text-blue-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: r }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Ocupados" })] })] }) }), a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-gray-500/10 p-2", children: a.jsx(at, { className: "h-5 w-5 text-gray-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: c }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Inactivos" })] })] }) }), a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-red-500/10 p-2", children: a.jsx(wt, { className: "h-5 w-5 text-red-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: d }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Con errores" })] })] }) })] }); }
function K2() { const { data: l, isLoading: i } = Eg(); return i ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx("div", { className: "text-muted-foreground", children: "Cargando agentes..." }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "text-2xl font-bold", children: "Agentes IA" }), a.jsxs("p", { className: "text-muted-foreground", children: [(l == null ? void 0 : l.length) || 0, " agentes configurados"] })] }), a.jsx(G2, { agents: l || [] }), a.jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: l && l.length > 0 ? l.map(r => a.jsx(Q2, { agent: r }, r.id)) : a.jsx("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: "No hay agentes configurados" }) })] }); }
const Mu = [{ id: 1, name: "Akademate Platform", description: "Plataforma SaaS para academias con 12 tenants activos pagando suscripcion", icon: "graduation-cap", status: "active", metrics: { mrr: 48e3, arr: 576e3, clients: 12, churn: 2.5, growth: 15, ticketPromedio: 4e3 }, billing: { nextInvoice: "2024-02-01", pendingAmount: 12e3 } }, { id: 2, name: "Inscouter", description: "Plataforma de scouting deportivo con suscripciones activas", icon: "search", status: "growing", metrics: { mrr: 25e3, arr: 3e5, clients: 8, churn: 1.5, growth: 25, ticketPromedio: 3125 } }, { id: 3, name: "NazcaTrade", description: "Sistema de trading algoritmico con licencias enterprise", icon: "chart", status: "active", metrics: { mrr: 85e3, arr: 102e4, clients: 5, churn: 0, growth: 8, ticketPromedio: 17e3 } }, { id: 4, name: "SOLARIA Agency", description: "Servicios de consultoria y desarrollo web", icon: "building", status: "active", metrics: { mrr: 35e3, arr: 42e4, clients: 15, churn: 5, growth: 12, ticketPromedio: 2333 } }], Og = { "graduation-cap": a.jsx(id, { className: "h-6 w-6" }), search: a.jsx(Ln, { className: "h-6 w-6" }), chart: a.jsx(rj, { className: "h-6 w-6" }), building: a.jsx(lj, { className: "h-6 w-6" }) };
function Cr(l) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(l); }
function Y2({ metrics: l }) { const i = l || { mrr: 0, arr: 0, clients: 0, churn: 0, growth: 0 }; return a.jsxs("div", { className: "metrics-row", children: [a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "MRR" }), a.jsx("div", { className: "metric-value", children: Cr(i.mrr) }), a.jsxs("span", { className: `metric-change ${i.growth > 0 ? "positive" : "negative"}`, children: [i.growth > 0 ? a.jsx(gr, { className: "h-3 w-3" }) : a.jsx(Jx, { className: "h-3 w-3" }), Math.abs(i.growth), "%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "ARR" }), a.jsx("div", { className: "metric-value", children: Cr(i.arr) })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Clientes" }), a.jsx("div", { className: "metric-value", children: i.clients })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Churn" }), a.jsxs("div", { className: "metric-value", children: [i.churn, "%"] }), a.jsx("span", { className: `metric-change ${i.churn <= 2 ? "positive" : "negative"}`, children: i.churn <= 2 ? "Saludable" : "Atención" })] })] }); }
function X2({ business: l, onClick: i }) { return a.jsxs("div", { onClick: i, className: "bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary transition-all hover:-translate-y-1", children: [a.jsxs("div", { className: "flex items-start justify-between mb-4", children: [a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary", children: Og[l.icon] || a.jsx(ad, { className: "h-6 w-6" }) }), a.jsxs("div", { children: [a.jsx("h3", { className: "font-semibold text-base", children: l.name }), a.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: l.description })] })] }), a.jsx("span", { className: `business-status ${l.status}`, children: l.status === "active" ? "Activo" : l.status === "growing" ? "Creciendo" : "Pausado" })] }), a.jsx(Y2, { metrics: l.metrics })] }); }
function ax() { const { businessId: l } = Tr(), i = ms(), r = fs(S => S.token), [c, d] = U.useState([]), [m, h] = U.useState(!0), [x, g] = U.useState("grid"); U.useEffect(() => { async function S() { try {
    const N = await fetch("/api/businesses", { headers: { Authorization: `Bearer ${r}` } });
    if (N.ok) {
        const C = await N.json();
        d(C.businesses || Mu);
    }
    else
        d(Mu);
}
catch {
    d(Mu);
}
finally {
    h(!1);
} } S(); }, [r]); const y = c.reduce((S, N) => { var C; return S + (((C = N.metrics) == null ? void 0 : C.mrr) || 0); }, 0), v = c.reduce((S, N) => { var C; return S + (((C = N.metrics) == null ? void 0 : C.clients) || 0); }, 0), b = c.length ? Math.round(c.reduce((S, N) => { var C; return S + (((C = N.metrics) == null ? void 0 : C.growth) || 0); }, 0) / c.length) : 0, A = c.filter(S => S.status === "active").length; return m ? a.jsx("div", { className: "flex items-center justify-center h-96", children: a.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Negocios" }), a.jsxs("p", { className: "section-subtitle", children: [c.length, " negocios operativos"] })] }), a.jsxs("div", { className: "section-actions", children: [a.jsx("button", { onClick: () => g("grid"), className: `p-2 rounded-lg transition-colors ${x === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: a.jsx(Bn, { className: "h-5 w-5" }) }), a.jsx("button", { onClick: () => g("list"), className: `p-2 rounded-lg transition-colors ${x === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: a.jsx(Un, { className: "h-5 w-5" }) })] })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon orange", children: a.jsx(Ix, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "MRR Total" }), a.jsx("div", { className: "stat-value", children: Cr(y) })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(mg, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Clientes Totales" }), a.jsx("div", { className: "stat-value", children: v })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Hr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Crecimiento Prom" }), a.jsxs("div", { className: "stat-value", children: [b, "%"] })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(dj, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Negocios Activos" }), a.jsx("div", { className: "stat-value", children: A })] })] })] }), x === "grid" ? a.jsx("div", { className: "grid grid-cols-2 gap-4", children: c.map(S => a.jsx(X2, { business: S, onClick: () => i(`/businesses/${S.id}`) }, S.id)) }) : a.jsx("div", { className: "space-y-3", children: c.map(S => { var N; return a.jsxs("div", { onClick: () => i(`/businesses/${S.id}`), className: "flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary transition-all", children: [a.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary", children: Og[S.icon] || a.jsx(ad, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("h3", { className: "font-semibold", children: S.name }), a.jsx("p", { className: "text-xs text-muted-foreground", children: S.description })] }), a.jsxs("div", { className: "text-right", children: [a.jsx("div", { className: "font-bold text-primary", children: Cr(((N = S.metrics) == null ? void 0 : N.mrr) || 0) }), a.jsx("div", { className: "text-xs text-muted-foreground", children: "MRR" })] }), a.jsx("span", { className: `business-status ${S.status}`, children: S.status === "active" ? "Activo" : S.status === "growing" ? "Creciendo" : "Pausado" })] }, S.id); }) })] }); }
const Z2 = { vps: [{ id: 1, name: "SOLARIA Production", provider: "Hetzner", ip: "46.62.222.138", specs: "4 vCPU, 8GB RAM, 160GB SSD", status: "online", services: ["Apache", "PHP 8.4", "MariaDB", "Node.js"] }, { id: 2, name: "NEMESIS Server", provider: "Hostinger", ip: "148.230.118.124", specs: "2 vCPU, 4GB RAM, 100GB SSD", status: "online", services: ["Docker", "PM2", "Redis"] }], nemesis: [{ id: 1, name: "origin-command01", ip: "100.122.193.83", type: "macOS", status: "active" }, { id: 2, name: "Mac-Mini-DRAKE", ip: "100.79.246.5", type: "macOS (M2)", status: "active" }, { id: 3, name: "DRAKE-COMMAND01", ip: "100.64.226.80", type: "Linux", status: "active" }, { id: 4, name: "iPad-Drake-Command", ip: "100.87.12.24", type: "iOS", status: "active" }, { id: 5, name: "iPhone-400i", ip: "100.112.92.21", type: "iOS", status: "active" }], cloudflare: [{ id: 1, domain: "solaria.agency", status: "active", ssl: !0 }, { id: 2, domain: "dfo.solaria.agency", status: "active", ssl: !0 }, { id: 3, domain: "akademate.com", status: "active", ssl: !0 }], sshKeys: [{ id: 1, name: "nemesis_cmdr_key", type: "Ed25519", fingerprint: "SHA256:Gx7..." }, { id: 2, name: "id_ed25519", type: "Ed25519", fingerprint: "SHA256:Hy8..." }, { id: 3, name: "id_solaria_hetzner_prod", type: "Ed25519", fingerprint: "SHA256:Kz9..." }], databases: [{ id: 1, name: "solaria_construction", type: "MariaDB", size: "156 MB" }, { id: 2, name: "akademate_prod", type: "PostgreSQL", size: "2.4 GB" }, { id: 3, name: "cache_redis", type: "Redis", size: "128 MB" }] };
function lx({ status: l }) { const i = { online: { color: "text-green-400 bg-green-400/20", icon: br, label: "Online" }, active: { color: "text-green-400 bg-green-400/20", icon: br, label: "Activo" }, offline: { color: "text-red-400 bg-red-400/20", icon: Hp, label: "Offline" }, inactive: { color: "text-gray-400 bg-gray-400/20", icon: Hp, label: "Inactivo" }, maintenance: { color: "text-yellow-400 bg-yellow-400/20", icon: $e, label: "Mantenimiento" }, pending: { color: "text-yellow-400 bg-yellow-400/20", icon: $e, label: "Pendiente" } }, { color: r, icon: c, label: d } = i[l]; return a.jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r}`, children: [a.jsx(c, { className: "h-3 w-3" }), d] }); }
function J2({ text: l }) { const [i, r] = U.useState(!1), c = () => { navigator.clipboard.writeText(l), r(!0), setTimeout(() => r(!1), 2e3); }; return a.jsx("button", { onClick: c, className: "p-1.5 rounded hover:bg-accent transition-colors", title: "Copiar", children: i ? a.jsx(br, { className: "h-4 w-4 text-green-400" }) : a.jsx(Tn, { className: "h-4 w-4 text-muted-foreground" }) }); }
function F2() { const { vps: l, nemesis: i, cloudflare: r, sshKeys: c, databases: d } = Z2, m = l.length, h = l.filter(y => y.status === "online").length, x = i.filter(y => y.status === "active").length, g = r.filter(y => y.status === "active").length; return a.jsxs("div", { className: "space-y-6", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Infraestructura" }), a.jsx("p", { className: "section-subtitle", children: "VPS, SSH, Cloudflare y accesos de gestion" })] }) }), a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(Ku, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "VPS Online" }), a.jsxs("div", { className: "stat-value", children: [h, "/", m] })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(Kp, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "NEMESIS Activos" }), a.jsx("div", { className: "stat-value", children: x })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Vp, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Dominios CF" }), a.jsx("div", { className: "stat-value", children: g })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon orange", children: a.jsx(Gp, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Claves SSH" }), a.jsx("div", { className: "stat-value", children: c.length })] })] })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Ku, { className: "h-4 w-4 text-green-400" }), "SERVIDORES VPS"] }), a.jsx("div", { className: "space-y-4", children: l.map(y => a.jsxs("div", { className: "bg-accent/30 rounded-lg p-4", children: [a.jsxs("div", { className: "flex items-start justify-between mb-3", children: [a.jsxs("div", { children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("h4", { className: "font-medium", children: y.name }), a.jsx("span", { className: "text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded", children: y.provider })] }), a.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: y.specs })] }), a.jsx(lx, { status: y.status })] }), a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [a.jsx(tg, { className: "h-4 w-4 text-muted-foreground" }), a.jsx("code", { className: "font-mono text-primary", children: y.ip }), a.jsx(J2, { text: `ssh root@${y.ip}` })] }), a.jsx("div", { className: "flex gap-1.5", children: y.services.map(v => a.jsx("span", { className: "project-tag blue", children: v }, v)) })] })] }, y.id)) })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Kp, { className: "h-4 w-4 text-purple-400" }), "RED NEMESIS (Tailscale VPN)"] }), a.jsx("div", { className: "grid grid-cols-5 gap-3", children: i.map(y => a.jsxs("div", { className: "bg-accent/30 rounded-lg p-3 text-center", children: [a.jsx("div", { className: `w-2 h-2 rounded-full mx-auto mb-2 ${y.status === "active" ? "bg-green-400" : "bg-gray-400"}` }), a.jsx("div", { className: "text-xs font-medium truncate", title: y.name, children: y.name }), a.jsx("div", { className: "text-[10px] text-muted-foreground", children: y.type }), a.jsx("code", { className: "text-[10px] text-primary font-mono", children: y.ip })] }, y.id)) })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Vp, { className: "h-4 w-4 text-blue-400" }), "CLOUDFLARE DOMINIOS"] }), a.jsx("div", { className: "space-y-2", children: r.map(y => a.jsxs("div", { className: "flex items-center justify-between p-2 bg-accent/30 rounded-lg", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [y.ssl && a.jsx(og, { className: "h-4 w-4 text-green-400" }), a.jsx("span", { className: "text-sm font-mono", children: y.domain })] }), a.jsx(lx, { status: y.status })] }, y.id)) })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Gp, { className: "h-4 w-4 text-yellow-400" }), "CLAVES SSH"] }), a.jsx("div", { className: "space-y-2", children: c.map(y => a.jsxs("div", { className: "flex items-center justify-between p-2 bg-accent/30 rounded-lg", children: [a.jsxs("div", { children: [a.jsx("div", { className: "text-sm font-medium", children: y.name }), a.jsx("div", { className: "text-[10px] text-muted-foreground", children: y.fingerprint })] }), a.jsx("span", { className: "project-tag green", children: y.type })] }, y.id)) })] })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(mj, { className: "h-4 w-4 text-cyan-400" }), "BASES DE DATOS"] }), a.jsx("div", { className: "metrics-row", children: d.map(y => a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: y.type }), a.jsx("div", { className: "metric-value text-base", children: y.name }), a.jsx("span", { className: "metric-change neutral", children: y.size })] }, y.id)) })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(_j, { className: "h-4 w-4 text-green-400" }), "COMANDOS RAPIDOS"] }), a.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("ssh root@46.62.222.138"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "SSH SOLARIA"] }), a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("ssh root@148.230.118.124"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "SSH NEMESIS"] }), a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("tailscale status"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "Tailscale Status"] }), a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("pm2 status"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "PM2 Status"] })] })] })] }); }
function Dt({ title: l, icon: i, children: r }) { return a.jsxs("div", { className: "mb-8", children: [a.jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [a.jsx(i, { className: "h-5 w-5 text-primary" }), l] }), r] }); }
function Rt({ title: l, children: i }) { return a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [l && a.jsx("h3", { className: "text-sm font-medium mb-4 text-muted-foreground", children: l }), i] }); }
function $2() { return a.jsxs("div", { className: "space-y-6 pb-8", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Design Hub" }), a.jsx("p", { className: "section-subtitle", children: "Componentes UI, tipografias y elementos graficos" })] }) }), a.jsxs("div", { className: "space-y-8 overflow-y-auto pr-2", children: [a.jsx(Dt, { title: "Brand Identity", icon: Ej, children: a.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [a.jsx(Rt, { title: "Logo", children: a.jsx("div", { className: "text-center p-5 bg-accent rounded-lg", children: a.jsx("img", { src: "/solaria-logo.png", alt: "SOLARIA Logo", className: "w-20 h-20 mx-auto", onError: l => { l.currentTarget.style.display = "none"; } }) }) }), a.jsx(Rt, { title: "Brand Colors", children: a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f6921d]", title: "SOLARIA Orange" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#d97706]", title: "Orange Dark" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#0a0a0a]", title: "Background" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#141414]", title: "Secondary BG" })] }) }), a.jsx(Rt, { title: "Phase Colors", children: a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#a855f7]", title: "Planning" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#22d3ee]", title: "Development" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#14b8a6]", title: "Testing" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#22c55e]", title: "Production" })] }) })] }) }), a.jsx(Dt, { title: "Typography", icon: Oj, children: a.jsxs(Rt, { children: [a.jsxs("div", { className: "mb-4", children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase", children: "Font Family" }), a.jsx("div", { className: "text-2xl font-semibold", children: "Inter" })] }), a.jsxs("div", { className: "space-y-3", children: [a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-3xl font-bold", children: "Heading H1" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "32px / 700" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-2xl font-semibold", children: "Heading H2" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "24px / 600" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-lg font-semibold", children: "Heading H3" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "18px / 600" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-sm font-medium", children: "Body Text" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "14px / 500" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-xs text-muted-foreground", children: "Small / Muted" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "12px / 400" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-[10px] uppercase font-semibold tracking-wide", children: "LABEL UPPERCASE" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "10px / 600 / Uppercase" })] })] })] }) }), a.jsx(Dt, { title: "Tags / Badges", icon: dg, children: a.jsxs(Rt, { children: [a.jsxs("div", { className: "mb-4", children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Project Tags (3 Categories)" }), a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("span", { className: "project-tag blue", children: "SaaS" }), a.jsx("span", { className: "project-tag blue", children: "Platform" }), a.jsx("span", { className: "project-tag green", children: "React" }), a.jsx("span", { className: "project-tag green", children: "Node.js" }), a.jsx("span", { className: "project-tag purple", children: "Enterprise" }), a.jsx("span", { className: "project-tag purple", children: "B2B" })] })] }), a.jsxs("div", { children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Phase Badges" }), a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("span", { className: "progress-phase-badge planning", children: "Planificacion" }), a.jsx("span", { className: "progress-phase-badge development", children: "Desarrollo" }), a.jsx("span", { className: "progress-phase-badge testing", children: "Testing" }), a.jsx("span", { className: "progress-phase-badge production", children: "Produccion" })] })] })] }) }), a.jsx(Dt, { title: "Progress Bars", icon: cj, children: a.jsxs(Rt, { children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-3", children: "Segmented Phase Progress" }), a.jsxs("div", { className: "progress-segments mb-2", children: [a.jsx("div", { className: "progress-segment planning" }), a.jsx("div", { className: "progress-segment development" }), a.jsx("div", { className: "progress-segment testing" }), a.jsx("div", { className: "progress-segment inactive" })] }), a.jsxs("div", { className: "progress-labels", children: [a.jsx("span", { className: "progress-label-item completed", children: "Planificacion" }), a.jsx("span", { className: "progress-label-item completed", children: "Desarrollo" }), a.jsx("span", { className: "progress-label-item active", children: "Testing" }), a.jsx("span", { className: "progress-label-item", children: "Produccion" })] })] }) }), a.jsx(Dt, { title: "Mini Trello (Equalizer)", icon: fj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "mini-trello max-w-md", children: [a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "BL" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 3 ? "filled" : ""}`, style: i < 3 ? { background: "#64748b", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "3" })] }), a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "TD" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 5 ? "filled" : ""}`, style: i < 5 ? { background: "#f59e0b", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "5" })] }), a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "DO" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 2 ? "filled" : ""}`, style: i < 2 ? { background: "#3b82f6", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "2" })] }), a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "DN" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 7 ? "filled" : ""}`, style: i < 7 ? { background: "#22c55e", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "7" })] })] }) }) }), a.jsx(Dt, { title: "Buttons", icon: wj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "flex gap-3 flex-wrap items-center", children: [a.jsx("button", { className: "btn-primary", children: "Primary" }), a.jsx("button", { className: "btn-secondary", children: "Secondary" }), a.jsx("button", { className: "p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors", children: a.jsx(vr, { className: "h-4 w-4" }) }), a.jsxs("button", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors", children: [a.jsx(vr, { className: "h-3 w-3" }), " Editar"] }), a.jsx("button", { className: "w-7 h-7 rounded bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors", children: a.jsx(qt, { className: "h-4 w-4" }) }), a.jsx("button", { className: "px-2 py-1 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors", children: "→ Task" })] }) }) }), a.jsx(Dt, { title: "URL Items", icon: bj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "space-y-2 max-w-xs", children: [a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon prod", children: a.jsx(tg, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Prod" }), a.jsx("div", { className: "url-item-url", children: "https://example.com" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] }), a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon staging", children: a.jsx(pj, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Staging" }), a.jsx("div", { className: "url-item-url", children: "https://staging.example.com" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] }), a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon local", children: a.jsx(gj, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Local" }), a.jsx("div", { className: "url-item-url", children: "http://localhost:3000" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] }), a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon repo", children: a.jsx(Qp, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Repo" }), a.jsx("div", { className: "url-item-url", children: "github.com/user/repo" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] })] }) }) }), a.jsx(Dt, { title: "TODO Items", icon: Cj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "max-w-xs", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [a.jsx("input", { type: "text", placeholder: "Escribe una nota...", className: "flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm" }), a.jsx("button", { className: "w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center", children: a.jsx(qt, { className: "h-4 w-4" }) })] }), a.jsxs("div", { className: "space-y-2", children: [a.jsxs("div", { className: "flex items-center gap-2 p-2 bg-accent/50 rounded-lg", children: [a.jsx("div", { className: "w-4 h-4 rounded border-2 border-primary" }), a.jsx("span", { className: "flex-1 text-xs", children: "Revisar diseno del dashboard" }), a.jsx("span", { className: "text-[9px] text-muted-foreground", children: "12 dic" }), a.jsx("button", { className: "text-[10px] px-1.5 py-0.5 bg-accent rounded", children: "→" })] }), a.jsxs("div", { className: "flex items-center gap-2 p-2 bg-accent/50 rounded-lg opacity-60", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-primary flex items-center justify-center", children: a.jsx(Mn, { className: "h-2.5 w-2.5 text-white" }) }), a.jsx("span", { className: "flex-1 text-xs line-through", children: "Aprobar colores del tema" }), a.jsx("span", { className: "text-[9px] text-muted-foreground", children: "08 dic" })] })] })] }) }) }), a.jsx(Dt, { title: "Activity Items", icon: $e, children: a.jsx(Rt, { children: a.jsxs("div", { className: "space-y-2 max-w-xs", children: [a.jsxs("div", { className: "flex items-start gap-2 p-2 bg-accent/50 rounded-lg", children: [a.jsx("div", { className: "w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0", children: a.jsx(Mn, { className: "h-3 w-3 text-green-400" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("div", { className: "text-xs font-medium", children: "Tarea completada" }), a.jsx("div", { className: "text-[9px] text-muted-foreground", children: "Hace 2h" })] })] }), a.jsxs("div", { className: "flex items-start gap-2 p-2 bg-accent/50 rounded-lg", children: [a.jsx("div", { className: "w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0", children: a.jsx(Qp, { className: "h-3 w-3 text-blue-400" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("div", { className: "text-xs font-medium", children: "Nuevo commit" }), a.jsx("div", { className: "text-[9px] text-muted-foreground", children: "Hace 5h" })] })] })] }) }) }), a.jsx(Dt, { title: "Form Elements", icon: kj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "grid grid-cols-2 gap-4 max-w-lg", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Input Label" }), a.jsx("input", { type: "text", defaultValue: "Input value", className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm" })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Select" }), a.jsxs("select", { className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm", children: [a.jsx("option", { children: "Option 1" }), a.jsx("option", { children: "Option 2" })] })] }), a.jsxs("div", { className: "col-span-2", children: [a.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Textarea" }), a.jsx("textarea", { defaultValue: "Textarea content", className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none" })] })] }) }) }), a.jsx("div", { className: "p-5 rounded-xl border border-dashed border-primary bg-gradient-to-br from-primary/10 to-transparent", children: a.jsxs(Dt, { title: "METRICS ROW (Core Component)", icon: Hr, children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Componente central del sistema. Los cambios en CSS Variables se aplican automaticamente a todo el dashboard." }), a.jsxs("div", { className: "mb-6", children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "5 Columns - Full Width" }), a.jsxs("div", { className: "metrics-row", children: [a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Seguidores ✓" }), a.jsxs("div", { className: "metric-value", children: ["1K ", a.jsx("span", { className: "secondary", children: "/ 4.2K" })] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Impresiones" }), a.jsx("div", { className: "metric-value", children: "4.9M" }), a.jsxs("span", { className: "metric-change positive", children: [a.jsx(gr, { className: "h-3 w-3" }), " 334%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Engagement" }), a.jsx("div", { className: "metric-value", children: "4.2%" }), a.jsxs("span", { className: "metric-change negative", children: [a.jsx(Jx, { className: "h-3 w-3" }), " 19%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Engagements" }), a.jsx("div", { className: "metric-value", children: "209.2K" }), a.jsxs("span", { className: "metric-change positive", children: [a.jsx(gr, { className: "h-3 w-3" }), " 248%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Profile Visits" }), a.jsx("div", { className: "metric-value", children: "18.2K" }), a.jsxs("span", { className: "metric-change positive", children: [a.jsx(gr, { className: "h-3 w-3" }), " 88%"] })] })] })] }), a.jsxs("div", { children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Compact Variant (3 Columns)" }), a.jsxs("div", { className: "metrics-row compact max-w-md", children: [a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Tareas" }), a.jsx("div", { className: "metric-value", children: "24" })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Completadas" }), a.jsx("div", { className: "metric-value", children: "18" })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Progreso" }), a.jsx("div", { className: "metric-value", children: "75%" })] })] })] })] }) }), a.jsx(Dt, { title: "Stat Cards", icon: _n, children: a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Tj, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Proyectos Activos" }), a.jsx("div", { className: "stat-value", children: "5" })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon tasks", children: a.jsx(Mn, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Tareas Completadas" }), a.jsx("div", { className: "stat-value", children: "127" })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon active", children: a.jsx($e, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "En Progreso" }), a.jsx("div", { className: "stat-value", children: "12" })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(_n, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Agentes Activos" }), a.jsx("div", { className: "stat-value", children: "3" })] })] })] }) }), a.jsx(Dt, { title: "CSS Variables Reference", icon: rg, children: a.jsx(Rt, { children: a.jsxs("div", { className: "grid grid-cols-2 gap-6 text-xs font-mono", children: [a.jsxs("div", { children: [a.jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Colors" }), a.jsxs("div", { className: "space-y-1.5", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#f6921d]" }), a.jsx("span", { children: "--solaria-orange: #f6921d" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#22c55e]" }), a.jsx("span", { children: "--color-positive: #22c55e" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#ef4444]" }), a.jsx("span", { children: "--color-negative: #ef4444" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#3b82f6]" }), a.jsx("span", { children: "--color-info: #3b82f6" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#f59e0b]" }), a.jsx("span", { children: "--color-warning: #f59e0b" })] })] })] }), a.jsxs("div", { children: [a.jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Metrics" }), a.jsxs("div", { className: "space-y-1.5 text-muted-foreground", children: [a.jsx("div", { children: "--metric-card-radius: 12px" }), a.jsx("div", { children: "--metric-card-padding: 16px" }), a.jsx("div", { children: "--metric-label-size: 11px" }), a.jsx("div", { children: "--metric-value-size: 24px" }), a.jsx("div", { children: "--metric-value-weight: 700" })] })] })] }) }) })] })] }); }
const ud = { decision: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }, learning: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }, context: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }, requirement: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }, bug: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }, solution: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" }, pattern: { bg: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }, config: { bg: "rgba(249, 115, 22, 0.15)", color: "#f97316" }, architecture: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }, session: { bg: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" } };
function W2({ memory: l, onClick: i }) { const r = Math.round(l.importance * 100), c = l.tags || []; return a.jsxs("div", { onClick: i, className: "memory-card", children: [a.jsxs("div", { className: "memory-header", children: [a.jsx("div", { className: "memory-icon", children: a.jsx(Lr, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "memory-title-group", children: [a.jsx("h3", { className: "memory-title", children: l.summary || l.content.substring(0, 60) }), a.jsxs("span", { className: "memory-id", children: ["#", l.id] })] }), a.jsxs("div", { className: "memory-importance", children: [a.jsx(Hr, { className: "h-3 w-3" }), a.jsxs("span", { children: [r, "%"] })] })] }), a.jsx("p", { className: "memory-content", children: l.content }), c.length > 0 && a.jsx("div", { className: "memory-tags", children: c.map(d => { const m = ud[d] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }; return a.jsx("span", { className: "memory-tag", style: { backgroundColor: m.bg, color: m.color }, children: d }, d); }) }), a.jsxs("div", { className: "memory-stats", children: [a.jsxs("div", { className: "memory-stat", children: [a.jsx(Nr, { className: "h-3 w-3" }), a.jsxs("span", { children: [l.accessCount, " accesos"] })] }), l.lastAccessed && a.jsxs("div", { className: "memory-stat", children: [a.jsx($e, { className: "h-3 w-3" }), a.jsx("span", { children: st(l.lastAccessed) })] }), a.jsx("div", { className: "memory-stat created", children: st(l.createdAt) })] })] }); }
function I2({ memory: l, onClick: i }) { const r = Math.round(l.importance * 100), c = l.tags || []; return a.jsxs("tr", { onClick: i, className: "memory-row", children: [a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "memory-icon-sm", children: a.jsx(Lr, { className: "h-4 w-4" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "memory-title-sm", children: l.summary || l.content.substring(0, 50) }), a.jsxs("div", { className: "memory-id-sm", children: ["#", l.id] })] })] }) }), a.jsx("td", { children: a.jsx("div", { className: "flex flex-wrap gap-1", children: c.slice(0, 3).map(d => { const m = ud[d] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }; return a.jsx("span", { className: "memory-tag-sm", style: { backgroundColor: m.bg, color: m.color }, children: d }, d); }) }) }), a.jsx("td", { className: "text-center", children: a.jsxs("span", { className: "stat-value-sm", children: [r, "%"] }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-value-sm", children: l.accessCount }) }), a.jsx("td", { className: "text-center text-muted-foreground text-sm", children: st(l.createdAt) })] }); }
function P2() { const [l, i] = U.useState(""), [r, c] = U.useState([]), [d, m] = U.useState("grid"), { data: h, isLoading: x } = ON({ tags: r }), { data: g } = RN(), { data: y } = DN(), { data: v } = zN(l, r), b = l.length > 2 ? v : h, A = (b == null ? void 0 : b.length) || 0, S = N => { c(C => C.includes(N) ? C.filter(_ => _ !== N) : [...C, N]); }; return x ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(We, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Memorias" }), a.jsx("p", { className: "section-subtitle", children: "Sistema de memoria persistente para agentes IA" })] }), a.jsx("div", { className: "section-actions", children: a.jsxs("div", { className: "view-toggle", children: [a.jsx("button", { className: F("view-toggle-btn", d === "grid" && "active"), onClick: () => m("grid"), title: "Vista Grid", children: a.jsx(Bn, { className: "h-4 w-4" }) }), a.jsx("button", { className: F("view-toggle-btn", d === "list" && "active"), onClick: () => m("list"), title: "Vista Lista", children: a.jsx(Un, { className: "h-4 w-4" }) })] }) })] }), a.jsxs("div", { className: "dashboard-stats-row", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Lr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Total Memorias" }), a.jsx("div", { className: "stat-value", children: Su((g == null ? void 0 : g.total_memories) || 0) })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(Hr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Importancia Prom." }), a.jsxs("div", { className: "stat-value", children: [(((g == null ? void 0 : g.avg_importance) || 0) * 100).toFixed(0), "%"] })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon active", children: a.jsx(Nr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Accesos Totales" }), a.jsx("div", { className: "stat-value", children: Su((g == null ? void 0 : g.total_accesses) || 0) })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(lg, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Proyectos" }), a.jsx("div", { className: "stat-value", children: Su((g == null ? void 0 : g.projects_with_memories) || 0) })] })] })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [a.jsxs("div", { className: "relative flex-1", children: [a.jsx(Ln, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), a.jsx("input", { type: "text", placeholder: "Buscar en memorias (min. 3 caracteres)...", value: l, onChange: N => i(N.target.value), className: "w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), a.jsxs("span", { className: "text-sm text-muted-foreground", children: [A, " memorias"] })] }), y && y.length > 0 && a.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [a.jsx(ug, { className: "h-4 w-4 text-muted-foreground" }), y.map(N => { const C = ud[N.name] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }, _ = r.includes(N.name); return a.jsxs("button", { onClick: () => S(N.name), className: F("memory-tag-filter", _ && "selected"), style: _ ? { backgroundColor: C.color, color: "#fff" } : { backgroundColor: C.bg, color: C.color }, children: [N.name, " (", N.usageCount, ")"] }, N.name); })] })] }), d === "grid" ? a.jsx("div", { className: "memories-grid", children: b && b.length > 0 ? b.map(N => a.jsx(W2, { memory: N }, N.id)) : a.jsxs("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: l.length > 2 ? "No se encontraron memorias con ese criterio" : "No hay memorias registradas" })] }) }) : a.jsx("div", { className: "bg-card border border-border rounded-xl", style: { padding: 0, overflow: "hidden" }, children: a.jsxs("table", { className: "list-table", children: [a.jsx("thead", { children: a.jsxs("tr", { children: [a.jsx("th", { style: { width: "35%" }, children: "Memoria" }), a.jsx("th", { style: { width: "25%" }, children: "Tags" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Importancia" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Accesos" }), a.jsx("th", { style: { width: "16%", textAlign: "center" }, children: "Creada" })] }) }), a.jsx("tbody", { children: b && b.length > 0 ? b.map(N => a.jsx(I2, { memory: N }, N.id)) : a.jsx("tr", { children: a.jsx("td", { colSpan: 5, children: a.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: l.length > 2 ? "No se encontraron memorias" : "No hay memorias" })] }) }) }) })] }) })] }); }
function e4() { return a.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: a.jsxs("div", { className: "flex flex-col items-center gap-4", children: [a.jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" }), a.jsx("p", { className: "text-muted-foreground", children: "Verificando sesion..." })] }) }); }
function t4({ children: l }) { return fs(r => r.isAuthenticated) ? a.jsx(a.Fragment, { children: l }) : a.jsx(nx, { to: "/login", replace: !0 }); }
function s4() { const { isChecking: l } = P1(); return l ? a.jsx(e4, {}) : a.jsxs(ob, { children: [a.jsx(dt, { path: "/login", element: a.jsx(IN, {}) }), a.jsxs(dt, { path: "/", element: a.jsx(t4, { children: a.jsx(WN, {}) }), children: [a.jsx(dt, { index: !0, element: a.jsx(nx, { to: "/dashboard", replace: !0 }) }), a.jsx(dt, { path: "dashboard", element: a.jsx(s2, {}) }), a.jsx(dt, { path: "projects", element: a.jsx(r2, {}) }), a.jsx(dt, { path: "projects/:id", element: a.jsx(v2, {}) }), a.jsx(dt, { path: "projects/:id/tasks", element: a.jsx(E2, {}) }), a.jsx(dt, { path: "tasks", element: a.jsx(L2, {}) }), a.jsx(dt, { path: "tasks/archived", element: a.jsx(H2, {}) }), a.jsx(dt, { path: "agents", element: a.jsx(K2, {}) }), a.jsx(dt, { path: "businesses", element: a.jsx(ax, {}) }), a.jsx(dt, { path: "businesses/:businessId", element: a.jsx(ax, {}) }), a.jsx(dt, { path: "infrastructure", element: a.jsx(F2, {}) }), a.jsx(dt, { path: "design-hub", element: a.jsx($2, {}) }), a.jsx(dt, { path: "memories", element: a.jsx(P2, {}) }), a.jsx(dt, { path: "settings", element: a.jsx(V2, {}) })] })] }); }
const a4 = new sb({ defaultOptions: { queries: { staleTime: 1e3 * 60 * 5, refetchOnWindowFocus: !1, retry: 1 } } });
gb.createRoot(document.getElementById("root")).render(a.jsx(An.StrictMode, { children: a.jsx(ab, { client: a4, children: a.jsx(yv, { children: a.jsx(ub, { basename: "/v2", children: a.jsx(s4, {}) }) }) }) }));
//# sourceMappingURL=index-DRu7mWDt.js.map
//# sourceMappingURL=index-DRu7mWDt.js.map