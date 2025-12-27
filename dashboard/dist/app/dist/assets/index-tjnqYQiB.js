import { u as Jt, j as a, a as Pe, b as ss, Q as Zy, c as Jy } from "./query-D0abkBGM.js";
import { a as Fy, b as $y, g as Wy, R as kn, r as H, N as Iy, u as oa, O as Py, c as Sr, d as eb, e as vt, f as Pp, B as tb } from "./vendor-BXhsGKj_.js";
import { c as sb } from "./charts--6qEJHQB.js";
(function () { const i = document.createElement("link").relList; if (i && i.supports && i.supports("modulepreload"))
    return; for (const d of document.querySelectorAll('link[rel="modulepreload"]'))
    c(d); new MutationObserver(d => { for (const h of d)
    if (h.type === "childList")
        for (const m of h.addedNodes)
            m.tagName === "LINK" && m.rel === "modulepreload" && c(m); }).observe(document, { childList: !0, subtree: !0 }); function r(d) { const h = {}; return d.integrity && (h.integrity = d.integrity), d.referrerPolicy && (h.referrerPolicy = d.referrerPolicy), d.crossOrigin === "use-credentials" ? h.credentials = "include" : d.crossOrigin === "anonymous" ? h.credentials = "omit" : h.credentials = "same-origin", h; } function c(d) { if (d.ep)
    return; d.ep = !0; const h = r(d); fetch(d.href, h); } })();
var nu = { exports: {} }, Nn = {}, iu = { exports: {} }, ru = {}; /**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ip;
function ab() { return ip || (ip = 1, (function (l) { function i(O, K) { var L = O.length; O.push(K); e: for (; 0 < L;) {
    var ce = L - 1 >>> 1, ve = O[ce];
    if (0 < d(ve, K))
        O[ce] = K, O[L] = ve, L = ce;
    else
        break e;
} } function r(O) { return O.length === 0 ? null : O[0]; } function c(O) { if (O.length === 0)
    return null; var K = O[0], L = O.pop(); if (L !== K) {
    O[0] = L;
    e: for (var ce = 0, ve = O.length, ge = ve >>> 1; ce < ge;) {
        var me = 2 * (ce + 1) - 1, ae = O[me], ue = me + 1, Fe = O[ue];
        if (0 > d(ae, L))
            ue < ve && 0 > d(Fe, ae) ? (O[ce] = Fe, O[ue] = L, ce = ue) : (O[ce] = ae, O[me] = L, ce = me);
        else if (ue < ve && 0 > d(Fe, L))
            O[ce] = Fe, O[ue] = L, ce = ue;
        else
            break e;
    }
} return K; } function d(O, K) { var L = O.sortIndex - K.sortIndex; return L !== 0 ? L : O.id - K.id; } if (l.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
    var h = performance;
    l.unstable_now = function () { return h.now(); };
}
else {
    var m = Date, x = m.now();
    l.unstable_now = function () { return m.now() - x; };
} var g = [], y = [], v = 1, b = null, D = 3, A = !1, N = !1, T = !1, M = !1, G = typeof setTimeout == "function" ? setTimeout : null, V = typeof clearTimeout == "function" ? clearTimeout : null, X = typeof setImmediate < "u" ? setImmediate : null; function ee(O) { for (var K = r(y); K !== null;) {
    if (K.callback === null)
        c(y);
    else if (K.startTime <= O)
        c(y), K.sortIndex = K.expirationTime, i(g, K);
    else
        break;
    K = r(y);
} } function re(O) { if (T = !1, ee(O), !N)
    if (r(g) !== null)
        N = !0, I || (I = !0, Me());
    else {
        var K = r(y);
        K !== null && he(re, K.startTime - O);
    } } var I = !1, U = -1, Y = 5, we = -1; function ft() { return M ? !0 : !(l.unstable_now() - we < Y); } function et() { if (M = !1, I) {
    var O = l.unstable_now();
    we = O;
    var K = !0;
    try {
        e: {
            N = !1, T && (T = !1, V(U), U = -1), A = !0;
            var L = D;
            try {
                t: {
                    for (ee(O), b = r(g); b !== null && !(b.expirationTime > O && ft());) {
                        var ce = b.callback;
                        if (typeof ce == "function") {
                            b.callback = null, D = b.priorityLevel;
                            var ve = ce(b.expirationTime <= O);
                            if (O = l.unstable_now(), typeof ve == "function") {
                                b.callback = ve, ee(O), K = !0;
                                break t;
                            }
                            b === r(g) && c(g), ee(O);
                        }
                        else
                            c(g);
                        b = r(g);
                    }
                    if (b !== null)
                        K = !0;
                    else {
                        var ge = r(y);
                        ge !== null && he(re, ge.startTime - O), K = !1;
                    }
                }
                break e;
            }
            finally {
                b = null, D = L, A = !1;
            }
            K = void 0;
        }
    }
    finally {
        K ? Me() : I = !1;
    }
} } var Me; if (typeof X == "function")
    Me = function () { X(et); };
else if (typeof MessageChannel < "u") {
    var ut = new MessageChannel, Xe = ut.port2;
    ut.port1.onmessage = et, Me = function () { Xe.postMessage(null); };
}
else
    Me = function () { G(et, 0); }; function he(O, K) { U = G(function () { O(l.unstable_now()); }, K); } l.unstable_IdlePriority = 5, l.unstable_ImmediatePriority = 1, l.unstable_LowPriority = 4, l.unstable_NormalPriority = 3, l.unstable_Profiling = null, l.unstable_UserBlockingPriority = 2, l.unstable_cancelCallback = function (O) { O.callback = null; }, l.unstable_forceFrameRate = function (O) { 0 > O || 125 < O ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Y = 0 < O ? Math.floor(1e3 / O) : 5; }, l.unstable_getCurrentPriorityLevel = function () { return D; }, l.unstable_next = function (O) { switch (D) {
    case 1:
    case 2:
    case 3:
        var K = 3;
        break;
    default: K = D;
} var L = D; D = K; try {
    return O();
}
finally {
    D = L;
} }, l.unstable_requestPaint = function () { M = !0; }, l.unstable_runWithPriority = function (O, K) { switch (O) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5: break;
    default: O = 3;
} var L = D; D = O; try {
    return K();
}
finally {
    D = L;
} }, l.unstable_scheduleCallback = function (O, K, L) { var ce = l.unstable_now(); switch (typeof L == "object" && L !== null ? (L = L.delay, L = typeof L == "number" && 0 < L ? ce + L : ce) : L = ce, O) {
    case 1:
        var ve = -1;
        break;
    case 2:
        ve = 250;
        break;
    case 5:
        ve = 1073741823;
        break;
    case 4:
        ve = 1e4;
        break;
    default: ve = 5e3;
} return ve = L + ve, O = { id: v++, callback: K, priorityLevel: O, startTime: L, expirationTime: ve, sortIndex: -1 }, L > ce ? (O.sortIndex = L, i(y, O), r(g) === null && O === r(y) && (T ? (V(U), U = -1) : T = !0, he(re, L - ce))) : (O.sortIndex = ve, i(g, O), N || A || (N = !0, I || (I = !0, Me()))), O; }, l.unstable_shouldYield = ft, l.unstable_wrapCallback = function (O) { var K = D; return function () { var L = D; D = K; try {
    return O.apply(this, arguments);
}
finally {
    D = L;
} }; }; })(ru)), ru; }
var rp;
function lb() { return rp || (rp = 1, iu.exports = ab()), iu.exports; } /**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var cp;
function nb() {
    if (cp)
        return Nn;
    cp = 1;
    var l = lb(), i = Fy(), r = $y();
    function c(e) { var t = "https://react.dev/errors/" + e; if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var s = 2; s < arguments.length; s++)
            t += "&args[]=" + encodeURIComponent(arguments[s]);
    } return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."; }
    function d(e) { return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11); }
    function h(e) { var t = e, s = e; if (e.alternate)
        for (; t.return;)
            t = t.return;
    else {
        e = t;
        do
            t = e, (t.flags & 4098) !== 0 && (s = t.return), e = t.return;
        while (e);
    } return t.tag === 3 ? s : null; }
    function m(e) { if (e.tag === 13) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null)
            return t.dehydrated;
    } return null; }
    function x(e) { if (e.tag === 31) {
        var t = e.memoizedState;
        if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null)
            return t.dehydrated;
    } return null; }
    function g(e) { if (h(e) !== e)
        throw Error(c(188)); }
    function y(e) { var t = e.alternate; if (!t) {
        if (t = h(e), t === null)
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
    var b = Object.assign, D = Symbol.for("react.element"), A = Symbol.for("react.transitional.element"), N = Symbol.for("react.portal"), T = Symbol.for("react.fragment"), M = Symbol.for("react.strict_mode"), G = Symbol.for("react.profiler"), V = Symbol.for("react.consumer"), X = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), re = Symbol.for("react.suspense"), I = Symbol.for("react.suspense_list"), U = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), we = Symbol.for("react.activity"), ft = Symbol.for("react.memo_cache_sentinel"), et = Symbol.iterator;
    function Me(e) { return e === null || typeof e != "object" ? null : (e = et && e[et] || e["@@iterator"], typeof e == "function" ? e : null); }
    var ut = Symbol.for("react.client.reference");
    function Xe(e) { if (e == null)
        return null; if (typeof e == "function")
        return e.$$typeof === ut ? null : e.displayName || e.name || null; if (typeof e == "string")
        return e; switch (e) {
        case T: return "Fragment";
        case G: return "Profiler";
        case M: return "StrictMode";
        case re: return "Suspense";
        case I: return "SuspenseList";
        case we: return "Activity";
    } if (typeof e == "object")
        switch (e.$$typeof) {
            case N: return "Portal";
            case X: return e.displayName || "Context";
            case V: return (e._context.displayName || "Context") + ".Consumer";
            case ee:
                var t = e.render;
                return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
            case U: return t = e.displayName || null, t !== null ? t : Xe(e.type) || "Memo";
            case Y:
                t = e._payload, e = e._init;
                try {
                    return Xe(e(t));
                }
                catch { }
        } return null; }
    var he = Array.isArray, O = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, K = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, L = { pending: !1, data: null, method: null, action: null }, ce = [], ve = -1;
    function ge(e) { return { current: e }; }
    function me(e) { 0 > ve || (e.current = ce[ve], ce[ve] = null, ve--); }
    function ae(e, t) { ve++, ce[ve] = e.current, e.current = t; }
    var ue = ge(null), Fe = ge(null), Ft = ge(null), Re = ge(null);
    function ua(e, t) { switch (ae(Ft, t), ae(Fe, e), ae(ue, null), t.nodeType) {
        case 9:
        case 11:
            e = (e = t.documentElement) && (e = e.namespaceURI) ? Em(e) : 0;
            break;
        default: if (e = t.tagName, t = t.namespaceURI)
            t = Em(t), e = Mm(t, e);
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
    } me(ue), ae(ue, e); }
    function $t() { me(ue), me(Fe), me(Ft); }
    function Os(e) { e.memoizedState !== null && ae(Re, e); var t = ue.current, s = Mm(t, e.type); t !== s && (ae(Fe, e), ae(ue, s)); }
    function zs(e) { Fe.current === e && (me(ue), me(Fe)), Re.current === e && (me(Re), yn._currentValue = L); }
    var Ds, ld;
    function da(e) {
        if (Ds === void 0)
            try {
                throw Error();
            }
            catch (s) {
                var t = s.stack.trim().match(/\n( *(at )?)/);
                Ds = t && t[1] || "", ld = -1 < s.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < s.stack.indexOf("@") ? "@unknown:0:0" : "";
            }
        return `
` + Ds + e + ld;
    }
    var Vr = !1;
    function Qr(e, t) {
        if (!e || Vr)
            return "";
        Vr = !0;
        var s = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var n = { DetermineComponentFrameRoot: function () { try {
                    if (t) {
                        var B = function () { throw Error(); };
                        if (Object.defineProperty(B.prototype, "props", { set: function () { throw Error(); } }), typeof Reflect == "object" && Reflect.construct) {
                            try {
                                Reflect.construct(B, []);
                            }
                            catch (z) {
                                var E = z;
                            }
                            Reflect.construct(e, [], B);
                        }
                        else {
                            try {
                                B.call();
                            }
                            catch (z) {
                                E = z;
                            }
                            e.call(B.prototype);
                        }
                    }
                    else {
                        try {
                            throw Error();
                        }
                        catch (z) {
                            E = z;
                        }
                        (B = e()) && typeof B.catch == "function" && B.catch(function () { });
                    }
                }
                catch (z) {
                    if (z && E && typeof z.stack == "string")
                        return [z.stack, E.stack];
                } return [null, null]; } };
            n.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var o = Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot, "name");
            o && o.configurable && Object.defineProperty(n.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
            var u = n.DetermineComponentFrameRoot(), f = u[0], p = u[1];
            if (f && p) {
                var j = f.split(`
`), C = p.split(`
`);
                for (o = n = 0; n < j.length && !j[n].includes("DetermineComponentFrameRoot");)
                    n++;
                for (; o < C.length && !C[o].includes("DetermineComponentFrameRoot");)
                    o++;
                if (n === j.length || o === C.length)
                    for (n = j.length - 1, o = C.length - 1; 1 <= n && 0 <= o && j[n] !== C[o];)
                        o--;
                for (; 1 <= n && 0 <= o; n--, o--)
                    if (j[n] !== C[o]) {
                        if (n !== 1 || o !== 1)
                            do
                                if (n--, o--, 0 > o || j[n] !== C[o]) {
                                    var R = `
` + j[n].replace(" at new ", " at ");
                                    return e.displayName && R.includes("<anonymous>") && (R = R.replace("<anonymous>", e.displayName)), R;
                                }
                            while (1 <= n && 0 <= o);
                        break;
                    }
            }
        }
        finally {
            Vr = !1, Error.prepareStackTrace = s;
        }
        return (s = e ? e.displayName || e.name : "") ? da(s) : "";
    }
    function Sg(e, t) { switch (e.tag) {
        case 26:
        case 27:
        case 5: return da(e.type);
        case 16: return da("Lazy");
        case 13: return e.child !== t && t !== null ? da("Suspense Fallback") : da("Suspense");
        case 19: return da("SuspenseList");
        case 0:
        case 15: return Qr(e.type, !1);
        case 11: return Qr(e.type.render, !1);
        case 1: return Qr(e.type, !0);
        case 31: return da("Activity");
        default: return "";
    } }
    function nd(e) {
        try {
            var t = "", s = null;
            do
                t += Sg(e, s), s = e, e = e.return;
            while (e);
            return t;
        }
        catch (n) {
            return `
Error generating stack: ` + n.message + `
` + n.stack;
        }
    }
    var Gr = Object.prototype.hasOwnProperty, Kr = l.unstable_scheduleCallback, Yr = l.unstable_cancelCallback, Ag = l.unstable_shouldYield, kg = l.unstable_requestPaint, St = l.unstable_now, Cg = l.unstable_getCurrentPriorityLevel, id = l.unstable_ImmediatePriority, rd = l.unstable_UserBlockingPriority, Un = l.unstable_NormalPriority, Tg = l.unstable_LowPriority, cd = l.unstable_IdlePriority, Eg = l.log, Mg = l.unstable_setDisableYieldValue, El = null, At = null;
    function Rs(e) { if (typeof Eg == "function" && Mg(e), At && typeof At.setStrictMode == "function")
        try {
            At.setStrictMode(El, e);
        }
        catch { } }
    var kt = Math.clz32 ? Math.clz32 : zg, _g = Math.log, Og = Math.LN2;
    function zg(e) { return e >>>= 0, e === 0 ? 32 : 31 - (_g(e) / Og | 0) | 0; }
    var Ln = 256, Hn = 262144, Vn = 4194304;
    function fa(e) { var t = e & 42; if (t !== 0)
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
    function Qn(e, t, s) { var n = e.pendingLanes; if (n === 0)
        return 0; var o = 0, u = e.suspendedLanes, f = e.pingedLanes; e = e.warmLanes; var p = n & 134217727; return p !== 0 ? (n = p & ~u, n !== 0 ? o = fa(n) : (f &= p, f !== 0 ? o = fa(f) : s || (s = p & ~e, s !== 0 && (o = fa(s))))) : (p = n & ~u, p !== 0 ? o = fa(p) : f !== 0 ? o = fa(f) : s || (s = n & ~e, s !== 0 && (o = fa(s)))), o === 0 ? 0 : t !== 0 && t !== o && (t & u) === 0 && (u = o & -o, s = t & -t, u >= s || u === 32 && (s & 4194048) !== 0) ? t : o; }
    function Ml(e, t) { return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0; }
    function Dg(e, t) { switch (e) {
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
    function od() { var e = Vn; return Vn <<= 1, (Vn & 62914560) === 0 && (Vn = 4194304), e; }
    function Xr(e) { for (var t = [], s = 0; 31 > s; s++)
        t.push(e); return t; }
    function _l(e, t) { e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0); }
    function Rg(e, t, s, n, o, u) { var f = e.pendingLanes; e.pendingLanes = s, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= s, e.entangledLanes &= s, e.errorRecoveryDisabledLanes &= s, e.shellSuspendCounter = 0; var p = e.entanglements, j = e.expirationTimes, C = e.hiddenUpdates; for (s = f & ~s; 0 < s;) {
        var R = 31 - kt(s), B = 1 << R;
        p[R] = 0, j[R] = -1;
        var E = C[R];
        if (E !== null)
            for (C[R] = null, R = 0; R < E.length; R++) {
                var z = E[R];
                z !== null && (z.lane &= -536870913);
            }
        s &= ~B;
    } n !== 0 && ud(e, n, 0), u !== 0 && o === 0 && e.tag !== 0 && (e.suspendedLanes |= u & ~(f & ~t)); }
    function ud(e, t, s) { e.pendingLanes |= t, e.suspendedLanes &= ~t; var n = 31 - kt(t); e.entangledLanes |= t, e.entanglements[n] = e.entanglements[n] | 1073741824 | s & 261930; }
    function dd(e, t) { var s = e.entangledLanes |= t; for (e = e.entanglements; s;) {
        var n = 31 - kt(s), o = 1 << n;
        o & t | e[n] & t && (e[n] |= t), s &= ~o;
    } }
    function fd(e, t) { var s = t & -t; return s = (s & 42) !== 0 ? 1 : Zr(s), (s & (e.suspendedLanes | t)) !== 0 ? 0 : s; }
    function Zr(e) { switch (e) {
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
    function Jr(e) { return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2; }
    function hd() { var e = K.p; return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : Pm(e.type)); }
    function md(e, t) { var s = K.p; try {
        return K.p = e, t();
    }
    finally {
        K.p = s;
    } }
    var qs = Math.random().toString(36).slice(2), tt = "__reactFiber$" + qs, ht = "__reactProps$" + qs, qa = "__reactContainer$" + qs, Fr = "__reactEvents$" + qs, qg = "__reactListeners$" + qs, Bg = "__reactHandles$" + qs, pd = "__reactResources$" + qs, Ol = "__reactMarker$" + qs;
    function $r(e) { delete e[tt], delete e[ht], delete e[Fr], delete e[qg], delete e[Bg]; }
    function Ba(e) { var t = e[tt]; if (t)
        return t; for (var s = e.parentNode; s;) {
        if (t = s[qa] || s[tt]) {
            if (s = t.alternate, t.child !== null || s !== null && s.child !== null)
                for (e = Bm(e); e !== null;) {
                    if (s = e[tt])
                        return s;
                    e = Bm(e);
                }
            return t;
        }
        e = s, s = e.parentNode;
    } return null; }
    function Ua(e) { if (e = e[tt] || e[qa]) {
        var t = e.tag;
        if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
            return e;
    } return null; }
    function zl(e) { var t = e.tag; if (t === 5 || t === 26 || t === 27 || t === 6)
        return e.stateNode; throw Error(c(33)); }
    function La(e) { var t = e[pd]; return t || (t = e[pd] = { hoistableStyles: new Map, hoistableScripts: new Map }), t; }
    function $e(e) { e[Ol] = !0; }
    var xd = new Set, gd = {};
    function ha(e, t) { Ha(e, t), Ha(e + "Capture", t); }
    function Ha(e, t) { for (gd[e] = t, e = 0; e < t.length; e++)
        xd.add(t[e]); }
    var Ug = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), yd = {}, bd = {};
    function Lg(e) { return Gr.call(bd, e) ? !0 : Gr.call(yd, e) ? !1 : Ug.test(e) ? bd[e] = !0 : (yd[e] = !0, !1); }
    function Gn(e, t, s) { if (Lg(t))
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
    function Kn(e, t, s) { if (s === null)
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
    function fs(e, t, s, n) { if (n === null)
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
    function vd(e) { var t = e.type; return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio"); }
    function Hg(e, t, s) { var n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t); if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
        var o = n.get, u = n.set;
        return Object.defineProperty(e, t, { configurable: !0, get: function () { return o.call(this); }, set: function (f) { s = "" + f, u.call(this, f); } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function () { return s; }, setValue: function (f) { s = "" + f; }, stopTracking: function () { e._valueTracker = null, delete e[t]; } };
    } }
    function Wr(e) { if (!e._valueTracker) {
        var t = vd(e) ? "checked" : "value";
        e._valueTracker = Hg(e, t, "" + e[t]);
    } }
    function jd(e) { if (!e)
        return !1; var t = e._valueTracker; if (!t)
        return !0; var s = t.getValue(), n = ""; return e && (n = vd(e) ? e.checked ? "true" : "false" : e.value), e = n, e !== s ? (t.setValue(e), !0) : !1; }
    function Yn(e) { if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u")
        return null; try {
        return e.activeElement || e.body;
    }
    catch {
        return e.body;
    } }
    var Vg = /[\n"\\]/g;
    function Ut(e) { return e.replace(Vg, function (t) { return "\\" + t.charCodeAt(0).toString(16) + " "; }); }
    function Ir(e, t, s, n, o, u, f, p) { e.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.type = f : e.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Bt(t)) : e.value !== "" + Bt(t) && (e.value = "" + Bt(t)) : f !== "submit" && f !== "reset" || e.removeAttribute("value"), t != null ? Pr(e, f, Bt(t)) : s != null ? Pr(e, f, Bt(s)) : n != null && e.removeAttribute("value"), o == null && u != null && (e.defaultChecked = !!u), o != null && (e.checked = o && typeof o != "function" && typeof o != "symbol"), p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" ? e.name = "" + Bt(p) : e.removeAttribute("name"); }
    function Nd(e, t, s, n, o, u, f, p) { if (u != null && typeof u != "function" && typeof u != "symbol" && typeof u != "boolean" && (e.type = u), t != null || s != null) {
        if (!(u !== "submit" && u !== "reset" || t != null)) {
            Wr(e);
            return;
        }
        s = s != null ? "" + Bt(s) : "", t = t != null ? "" + Bt(t) : s, p || t === e.value || (e.value = t), e.defaultValue = t;
    } n = n ?? o, n = typeof n != "function" && typeof n != "symbol" && !!n, e.checked = p ? e.checked : !!n, e.defaultChecked = !!n, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (e.name = f), Wr(e); }
    function Pr(e, t, s) { t === "number" && Yn(e.ownerDocument) === e || e.defaultValue === "" + s || (e.defaultValue = "" + s); }
    function Va(e, t, s, n) { if (e = e.options, t) {
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
    function wd(e, t, s) { if (t != null && (t = "" + Bt(t), t !== e.value && (e.value = t), s == null)) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
    } e.defaultValue = s != null ? "" + Bt(s) : ""; }
    function Sd(e, t, s, n) { if (t == null) {
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
    } s = Bt(t), e.defaultValue = s, n = e.textContent, n === s && n !== "" && n !== null && (e.value = n), Wr(e); }
    function Qa(e, t) { if (t) {
        var s = e.firstChild;
        if (s && s === e.lastChild && s.nodeType === 3) {
            s.nodeValue = t;
            return;
        }
    } e.textContent = t; }
    var Qg = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function Ad(e, t, s) { var n = t.indexOf("--") === 0; s == null || typeof s == "boolean" || s === "" ? n ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : n ? e.setProperty(t, s) : typeof s != "number" || s === 0 || Qg.has(t) ? t === "float" ? e.cssFloat = s : e[t] = ("" + s).trim() : e[t] = s + "px"; }
    function kd(e, t, s) { if (t != null && typeof t != "object")
        throw Error(c(62)); if (e = e.style, s != null) {
        for (var n in s)
            !s.hasOwnProperty(n) || t != null && t.hasOwnProperty(n) || (n.indexOf("--") === 0 ? e.setProperty(n, "") : n === "float" ? e.cssFloat = "" : e[n] = "");
        for (var o in t)
            n = t[o], t.hasOwnProperty(o) && s[o] !== n && Ad(e, o, n);
    }
    else
        for (var u in t)
            t.hasOwnProperty(u) && Ad(e, u, t[u]); }
    function ec(e) { if (e.indexOf("-") === -1)
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
    var Gg = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]), Kg = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Xn(e) { return Kg.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e; }
    function hs() { }
    var tc = null;
    function sc(e) { return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e; }
    var Ga = null, Ka = null;
    function Cd(e) { var t = Ua(e); if (t && (e = t.stateNode)) {
        var s = e[ht] || null;
        e: switch (e = t.stateNode, t.type) {
            case "input":
                if (Ir(e, s.value, s.defaultValue, s.defaultValue, s.checked, s.defaultChecked, s.type, s.name), t = s.name, s.type === "radio" && t != null) {
                    for (s = e; s.parentNode;)
                        s = s.parentNode;
                    for (s = s.querySelectorAll('input[name="' + Ut("" + t) + '"][type="radio"]'), t = 0; t < s.length; t++) {
                        var n = s[t];
                        if (n !== e && n.form === e.form) {
                            var o = n[ht] || null;
                            if (!o)
                                throw Error(c(90));
                            Ir(n, o.value, o.defaultValue, o.defaultValue, o.checked, o.defaultChecked, o.type, o.name);
                        }
                    }
                    for (t = 0; t < s.length; t++)
                        n = s[t], n.form === e.form && jd(n);
                }
                break e;
            case "textarea":
                wd(e, s.value, s.defaultValue);
                break e;
            case "select": t = s.value, t != null && Va(e, !!s.multiple, t, !1);
        }
    } }
    var ac = !1;
    function Td(e, t, s) { if (ac)
        return e(t, s); ac = !0; try {
        var n = e(t);
        return n;
    }
    finally {
        if (ac = !1, (Ga !== null || Ka !== null) && (zi(), Ga && (t = Ga, e = Ka, Ka = Ga = null, Cd(t), e)))
            for (t = 0; t < e.length; t++)
                Cd(e[t]);
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
    var ms = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), lc = !1;
    if (ms)
        try {
            var Rl = {};
            Object.defineProperty(Rl, "passive", { get: function () { lc = !0; } }), window.addEventListener("test", Rl, Rl), window.removeEventListener("test", Rl, Rl);
        }
        catch {
            lc = !1;
        }
    var Bs = null, nc = null, Zn = null;
    function Ed() { if (Zn)
        return Zn; var e, t = nc, s = t.length, n, o = "value" in Bs ? Bs.value : Bs.textContent, u = o.length; for (e = 0; e < s && t[e] === o[e]; e++)
        ; var f = s - e; for (n = 1; n <= f && t[s - n] === o[u - n]; n++)
        ; return Zn = o.slice(e, 1 < n ? 1 - n : void 0); }
    function Jn(e) { var t = e.keyCode; return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0; }
    function Fn() { return !0; }
    function Md() { return !1; }
    function mt(e) { function t(s, n, o, u, f) { this._reactName = s, this._targetInst = o, this.type = n, this.nativeEvent = u, this.target = f, this.currentTarget = null; for (var p in e)
        e.hasOwnProperty(p) && (s = e[p], this[p] = s ? s(u) : u[p]); return this.isDefaultPrevented = (u.defaultPrevented != null ? u.defaultPrevented : u.returnValue === !1) ? Fn : Md, this.isPropagationStopped = Md, this; } return b(t.prototype, { preventDefault: function () { this.defaultPrevented = !0; var s = this.nativeEvent; s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Fn); }, stopPropagation: function () { var s = this.nativeEvent; s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Fn); }, persist: function () { }, isPersistent: Fn }), t; }
    var ma = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function (e) { return e.timeStamp || Date.now(); }, defaultPrevented: 0, isTrusted: 0 }, $n = mt(ma), ql = b({}, ma, { view: 0, detail: 0 }), Yg = mt(ql), ic, rc, Bl, Wn = b({}, ql, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: oc, button: 0, buttons: 0, relatedTarget: function (e) { return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget; }, movementX: function (e) { return "movementX" in e ? e.movementX : (e !== Bl && (Bl && e.type === "mousemove" ? (ic = e.screenX - Bl.screenX, rc = e.screenY - Bl.screenY) : rc = ic = 0, Bl = e), ic); }, movementY: function (e) { return "movementY" in e ? e.movementY : rc; } }), _d = mt(Wn), Xg = b({}, Wn, { dataTransfer: 0 }), Zg = mt(Xg), Jg = b({}, ql, { relatedTarget: 0 }), cc = mt(Jg), Fg = b({}, ma, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), $g = mt(Fg), Wg = b({}, ma, { clipboardData: function (e) { return "clipboardData" in e ? e.clipboardData : window.clipboardData; } }), Ig = mt(Wg), Pg = b({}, ma, { data: 0 }), Od = mt(Pg), e0 = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, t0 = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, s0 = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function a0(e) { var t = this.nativeEvent; return t.getModifierState ? t.getModifierState(e) : (e = s0[e]) ? !!t[e] : !1; }
    function oc() { return a0; }
    var l0 = b({}, ql, { key: function (e) { if (e.key) {
            var t = e0[e.key] || e.key;
            if (t !== "Unidentified")
                return t;
        } return e.type === "keypress" ? (e = Jn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? t0[e.keyCode] || "Unidentified" : ""; }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: oc, charCode: function (e) { return e.type === "keypress" ? Jn(e) : 0; }, keyCode: function (e) { return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0; }, which: function (e) { return e.type === "keypress" ? Jn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0; } }), n0 = mt(l0), i0 = b({}, Wn, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), zd = mt(i0), r0 = b({}, ql, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: oc }), c0 = mt(r0), o0 = b({}, ma, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), u0 = mt(o0), d0 = b({}, Wn, { deltaX: function (e) { return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0; }, deltaY: function (e) { return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0; }, deltaZ: 0, deltaMode: 0 }), f0 = mt(d0), h0 = b({}, ma, { newState: 0, oldState: 0 }), m0 = mt(h0), p0 = [9, 13, 27, 32], uc = ms && "CompositionEvent" in window, Ul = null;
    ms && "documentMode" in document && (Ul = document.documentMode);
    var x0 = ms && "TextEvent" in window && !Ul, Dd = ms && (!uc || Ul && 8 < Ul && 11 >= Ul), Rd = " ", qd = !1;
    function Bd(e, t) { switch (e) {
        case "keyup": return p0.indexOf(t.keyCode) !== -1;
        case "keydown": return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout": return !0;
        default: return !1;
    } }
    function Ud(e) { return e = e.detail, typeof e == "object" && "data" in e ? e.data : null; }
    var Ya = !1;
    function g0(e, t) { switch (e) {
        case "compositionend": return Ud(t);
        case "keypress": return t.which !== 32 ? null : (qd = !0, Rd);
        case "textInput": return e = t.data, e === Rd && qd ? null : e;
        default: return null;
    } }
    function y0(e, t) { if (Ya)
        return e === "compositionend" || !uc && Bd(e, t) ? (e = Ed(), Zn = nc = Bs = null, Ya = !1, e) : null; switch (e) {
        case "paste": return null;
        case "keypress":
            if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                if (t.char && 1 < t.char.length)
                    return t.char;
                if (t.which)
                    return String.fromCharCode(t.which);
            }
            return null;
        case "compositionend": return Dd && t.locale !== "ko" ? null : t.data;
        default: return null;
    } }
    var b0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
    function Ld(e) { var t = e && e.nodeName && e.nodeName.toLowerCase(); return t === "input" ? !!b0[e.type] : t === "textarea"; }
    function Hd(e, t, s, n) { Ga ? Ka ? Ka.push(n) : Ka = [n] : Ga = n, t = Hi(t, "onChange"), 0 < t.length && (s = new $n("onChange", "change", null, s, n), e.push({ event: s, listeners: t })); }
    var Ll = null, Hl = null;
    function v0(e) { wm(e, 0); }
    function In(e) { var t = zl(e); if (jd(t))
        return e; }
    function Vd(e, t) { if (e === "change")
        return t; }
    var Qd = !1;
    if (ms) {
        var dc;
        if (ms) {
            var fc = "oninput" in document;
            if (!fc) {
                var Gd = document.createElement("div");
                Gd.setAttribute("oninput", "return;"), fc = typeof Gd.oninput == "function";
            }
            dc = fc;
        }
        else
            dc = !1;
        Qd = dc && (!document.documentMode || 9 < document.documentMode);
    }
    function Kd() { Ll && (Ll.detachEvent("onpropertychange", Yd), Hl = Ll = null); }
    function Yd(e) { if (e.propertyName === "value" && In(Hl)) {
        var t = [];
        Hd(t, Hl, e, sc(e)), Td(v0, t);
    } }
    function j0(e, t, s) { e === "focusin" ? (Kd(), Ll = t, Hl = s, Ll.attachEvent("onpropertychange", Yd)) : e === "focusout" && Kd(); }
    function N0(e) { if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return In(Hl); }
    function w0(e, t) { if (e === "click")
        return In(t); }
    function S0(e, t) { if (e === "input" || e === "change")
        return In(t); }
    function A0(e, t) { return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t; }
    var Ct = typeof Object.is == "function" ? Object.is : A0;
    function Vl(e, t) { if (Ct(e, t))
        return !0; if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1; var s = Object.keys(e), n = Object.keys(t); if (s.length !== n.length)
        return !1; for (n = 0; n < s.length; n++) {
        var o = s[n];
        if (!Gr.call(t, o) || !Ct(e[o], t[o]))
            return !1;
    } return !0; }
    function Xd(e) { for (; e && e.firstChild;)
        e = e.firstChild; return e; }
    function Zd(e, t) { var s = Xd(e); e = 0; for (var n; s;) {
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
        s = Xd(s);
    } }
    function Jd(e, t) { return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Jd(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1; }
    function Fd(e) { e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window; for (var t = Yn(e.document); t instanceof e.HTMLIFrameElement;) {
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
        t = Yn(e.document);
    } return t; }
    function hc(e) { var t = e && e.nodeName && e.nodeName.toLowerCase(); return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true"); }
    var k0 = ms && "documentMode" in document && 11 >= document.documentMode, Xa = null, mc = null, Ql = null, pc = !1;
    function $d(e, t, s) { var n = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument; pc || Xa == null || Xa !== Yn(n) || (n = Xa, "selectionStart" in n && hc(n) ? n = { start: n.selectionStart, end: n.selectionEnd } : (n = (n.ownerDocument && n.ownerDocument.defaultView || window).getSelection(), n = { anchorNode: n.anchorNode, anchorOffset: n.anchorOffset, focusNode: n.focusNode, focusOffset: n.focusOffset }), Ql && Vl(Ql, n) || (Ql = n, n = Hi(mc, "onSelect"), 0 < n.length && (t = new $n("onSelect", "select", null, t, s), e.push({ event: t, listeners: n }), t.target = Xa))); }
    function pa(e, t) { var s = {}; return s[e.toLowerCase()] = t.toLowerCase(), s["Webkit" + e] = "webkit" + t, s["Moz" + e] = "moz" + t, s; }
    var Za = { animationend: pa("Animation", "AnimationEnd"), animationiteration: pa("Animation", "AnimationIteration"), animationstart: pa("Animation", "AnimationStart"), transitionrun: pa("Transition", "TransitionRun"), transitionstart: pa("Transition", "TransitionStart"), transitioncancel: pa("Transition", "TransitionCancel"), transitionend: pa("Transition", "TransitionEnd") }, xc = {}, Wd = {};
    ms && (Wd = document.createElement("div").style, "AnimationEvent" in window || (delete Za.animationend.animation, delete Za.animationiteration.animation, delete Za.animationstart.animation), "TransitionEvent" in window || delete Za.transitionend.transition);
    function xa(e) { if (xc[e])
        return xc[e]; if (!Za[e])
        return e; var t = Za[e], s; for (s in t)
        if (t.hasOwnProperty(s) && s in Wd)
            return xc[e] = t[s]; return e; }
    var Id = xa("animationend"), Pd = xa("animationiteration"), ef = xa("animationstart"), C0 = xa("transitionrun"), T0 = xa("transitionstart"), E0 = xa("transitioncancel"), tf = xa("transitionend"), sf = new Map, gc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    gc.push("scrollEnd");
    function Wt(e, t) { sf.set(e, t), ha(t, [e]); }
    var Pn = typeof reportError == "function" ? reportError : function (e) { if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var t = new window.ErrorEvent("error", { bubbles: !0, cancelable: !0, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
        if (!window.dispatchEvent(t))
            return;
    }
    else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", e);
        return;
    } console.error(e); }, Lt = [], Ja = 0, yc = 0;
    function ei() { for (var e = Ja, t = yc = Ja = 0; t < e;) {
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
        u !== 0 && af(s, o, u);
    } }
    function ti(e, t, s, n) { Lt[Ja++] = e, Lt[Ja++] = t, Lt[Ja++] = s, Lt[Ja++] = n, yc |= n, e.lanes |= n, e = e.alternate, e !== null && (e.lanes |= n); }
    function bc(e, t, s, n) { return ti(e, t, s, n), si(e); }
    function ga(e, t) { return ti(e, null, null, t), si(e); }
    function af(e, t, s) { e.lanes |= s; var n = e.alternate; n !== null && (n.lanes |= s); for (var o = !1, u = e.return; u !== null;)
        u.childLanes |= s, n = u.alternate, n !== null && (n.childLanes |= s), u.tag === 22 && (e = u.stateNode, e === null || e._visibility & 1 || (o = !0)), e = u, u = u.return; return e.tag === 3 ? (u = e.stateNode, o && t !== null && (o = 31 - kt(s), e = u.hiddenUpdates, n = e[o], n === null ? e[o] = [t] : n.push(t), t.lane = s | 536870912), u) : null; }
    function si(e) { if (50 < dn)
        throw dn = 0, Eo = null, Error(c(185)); for (var t = e.return; t !== null;)
        e = t, t = e.return; return e.tag === 3 ? e.stateNode : null; }
    var Fa = {};
    function M0(e, t, s, n) { this.tag = e, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = n, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null; }
    function Tt(e, t, s, n) { return new M0(e, t, s, n); }
    function vc(e) { return e = e.prototype, !(!e || !e.isReactComponent); }
    function ps(e, t) { var s = e.alternate; return s === null ? (s = Tt(e.tag, t, e.key, e.mode), s.elementType = e.elementType, s.type = e.type, s.stateNode = e.stateNode, s.alternate = e, e.alternate = s) : (s.pendingProps = t, s.type = e.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = e.flags & 65011712, s.childLanes = e.childLanes, s.lanes = e.lanes, s.child = e.child, s.memoizedProps = e.memoizedProps, s.memoizedState = e.memoizedState, s.updateQueue = e.updateQueue, t = e.dependencies, s.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, s.sibling = e.sibling, s.index = e.index, s.ref = e.ref, s.refCleanup = e.refCleanup, s; }
    function lf(e, t) { e.flags &= 65011714; var s = e.alternate; return s === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = s.childLanes, e.lanes = s.lanes, e.child = s.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = s.memoizedProps, e.memoizedState = s.memoizedState, e.updateQueue = s.updateQueue, e.type = s.type, t = s.dependencies, e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), e; }
    function ai(e, t, s, n, o, u) { var f = 0; if (n = e, typeof e == "function")
        vc(e) && (f = 1);
    else if (typeof e == "string")
        f = Ry(e, s, ue.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
        e: switch (e) {
            case we: return e = Tt(31, s, t, o), e.elementType = we, e.lanes = u, e;
            case T: return ya(s.children, o, u, t);
            case M:
                f = 8, o |= 24;
                break;
            case G: return e = Tt(12, s, t, o | 2), e.elementType = G, e.lanes = u, e;
            case re: return e = Tt(13, s, t, o), e.elementType = re, e.lanes = u, e;
            case I: return e = Tt(19, s, t, o), e.elementType = I, e.lanes = u, e;
            default:
                if (typeof e == "object" && e !== null)
                    switch (e.$$typeof) {
                        case X:
                            f = 10;
                            break e;
                        case V:
                            f = 9;
                            break e;
                        case ee:
                            f = 11;
                            break e;
                        case U:
                            f = 14;
                            break e;
                        case Y:
                            f = 16, n = null;
                            break e;
                    }
                f = 29, s = Error(c(130, e === null ? "null" : typeof e, "")), n = null;
        } return t = Tt(f, s, t, o), t.elementType = e, t.type = n, t.lanes = u, t; }
    function ya(e, t, s, n) { return e = Tt(7, e, n, t), e.lanes = s, e; }
    function jc(e, t, s) { return e = Tt(6, e, null, t), e.lanes = s, e; }
    function nf(e) { var t = Tt(18, null, null, 0); return t.stateNode = e, t; }
    function Nc(e, t, s) { return t = Tt(4, e.children !== null ? e.children : [], e.key, t), t.lanes = s, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t; }
    var rf = new WeakMap;
    function Ht(e, t) { if (typeof e == "object" && e !== null) {
        var s = rf.get(e);
        return s !== void 0 ? s : (t = { value: e, source: t, stack: nd(t) }, rf.set(e, t), t);
    } return { value: e, source: t, stack: nd(t) }; }
    var $a = [], Wa = 0, li = null, Gl = 0, Vt = [], Qt = 0, Us = null, ns = 1, is = "";
    function xs(e, t) { $a[Wa++] = Gl, $a[Wa++] = li, li = e, Gl = t; }
    function cf(e, t, s) { Vt[Qt++] = ns, Vt[Qt++] = is, Vt[Qt++] = Us, Us = e; var n = ns; e = is; var o = 32 - kt(n) - 1; n &= ~(1 << o), s += 1; var u = 32 - kt(t) + o; if (30 < u) {
        var f = o - o % 5;
        u = (n & (1 << f) - 1).toString(32), n >>= f, o -= f, ns = 1 << 32 - kt(t) + o | s << o | n, is = u + e;
    }
    else
        ns = 1 << u | s << o | n, is = e; }
    function wc(e) { e.return !== null && (xs(e, 1), cf(e, 1, 0)); }
    function Sc(e) { for (; e === li;)
        li = $a[--Wa], $a[Wa] = null, Gl = $a[--Wa], $a[Wa] = null; for (; e === Us;)
        Us = Vt[--Qt], Vt[Qt] = null, is = Vt[--Qt], Vt[Qt] = null, ns = Vt[--Qt], Vt[Qt] = null; }
    function of(e, t) { Vt[Qt++] = ns, Vt[Qt++] = is, Vt[Qt++] = Us, ns = t.id, is = t.overflow, Us = e; }
    var st = null, Oe = null, ye = !1, Ls = null, Gt = !1, Ac = Error(c(519));
    function Hs(e) { var t = Error(c(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")); throw Kl(Ht(t, e)), Ac; }
    function uf(e) { var t = e.stateNode, s = e.type, n = e.memoizedProps; switch (t[tt] = e, t[ht] = n, s) {
        case "dialog":
            fe("cancel", t), fe("close", t);
            break;
        case "iframe":
        case "object":
        case "embed":
            fe("load", t);
            break;
        case "video":
        case "audio":
            for (s = 0; s < hn.length; s++)
                fe(hn[s], t);
            break;
        case "source":
            fe("error", t);
            break;
        case "img":
        case "image":
        case "link":
            fe("error", t), fe("load", t);
            break;
        case "details":
            fe("toggle", t);
            break;
        case "input":
            fe("invalid", t), Nd(t, n.value, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name, !0);
            break;
        case "select":
            fe("invalid", t);
            break;
        case "textarea": fe("invalid", t), Sd(t, n.value, n.defaultValue, n.children);
    } s = n.children, typeof s != "string" && typeof s != "number" && typeof s != "bigint" || t.textContent === "" + s || n.suppressHydrationWarning === !0 || Cm(t.textContent, s) ? (n.popover != null && (fe("beforetoggle", t), fe("toggle", t)), n.onScroll != null && fe("scroll", t), n.onScrollEnd != null && fe("scrollend", t), n.onClick != null && (t.onclick = hs), t = !0) : t = !1, t || Hs(e, !0); }
    function df(e) { for (st = e.return; st;)
        switch (st.tag) {
            case 5:
            case 31:
            case 13:
                Gt = !1;
                return;
            case 27:
            case 3:
                Gt = !0;
                return;
            default: st = st.return;
        } }
    function Ia(e) { if (e !== st)
        return !1; if (!ye)
        return df(e), ye = !0, !1; var t = e.tag, s; if ((s = t !== 3 && t !== 27) && ((s = t === 5) && (s = e.type, s = !(s !== "form" && s !== "button") || Ko(e.type, e.memoizedProps)), s = !s), s && Oe && Hs(e), df(e), t === 13) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
            throw Error(c(317));
        Oe = qm(e);
    }
    else if (t === 31) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e)
            throw Error(c(317));
        Oe = qm(e);
    }
    else
        t === 27 ? (t = Oe, ea(e.type) ? (e = Fo, Fo = null, Oe = e) : Oe = t) : Oe = st ? Yt(e.stateNode.nextSibling) : null; return !0; }
    function ba() { Oe = st = null, ye = !1; }
    function kc() { var e = Ls; return e !== null && (yt === null ? yt = e : yt.push.apply(yt, e), Ls = null), e; }
    function Kl(e) { Ls === null ? Ls = [e] : Ls.push(e); }
    var Cc = ge(null), va = null, gs = null;
    function Vs(e, t, s) { ae(Cc, t._currentValue), t._currentValue = s; }
    function ys(e) { e._currentValue = Cc.current, me(Cc); }
    function Tc(e, t, s) { for (; e !== null;) {
        var n = e.alternate;
        if ((e.childLanes & t) !== t ? (e.childLanes |= t, n !== null && (n.childLanes |= t)) : n !== null && (n.childLanes & t) !== t && (n.childLanes |= t), e === s)
            break;
        e = e.return;
    } }
    function Ec(e, t, s, n) { var o = e.child; for (o !== null && (o.return = e); o !== null;) {
        var u = o.dependencies;
        if (u !== null) {
            var f = o.child;
            u = u.firstContext;
            e: for (; u !== null;) {
                var p = u;
                u = o;
                for (var j = 0; j < t.length; j++)
                    if (p.context === t[j]) {
                        u.lanes |= s, p = u.alternate, p !== null && (p.lanes |= s), Tc(u.return, s, e), n || (f = null);
                        break e;
                    }
                u = p.next;
            }
        }
        else if (o.tag === 18) {
            if (f = o.return, f === null)
                throw Error(c(341));
            f.lanes |= s, u = f.alternate, u !== null && (u.lanes |= s), Tc(f, s, e), f = null;
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
    function Pa(e, t, s, n) { e = null; for (var o = t, u = !1; o !== null;) {
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
    } e !== null && Ec(t, e, s, n), t.flags |= 262144; }
    function ni(e) { for (e = e.firstContext; e !== null;) {
        if (!Ct(e.context._currentValue, e.memoizedValue))
            return !0;
        e = e.next;
    } return !1; }
    function ja(e) { va = e, gs = null, e = e.dependencies, e !== null && (e.firstContext = null); }
    function at(e) { return ff(va, e); }
    function ii(e, t) { return va === null && ja(e), ff(e, t); }
    function ff(e, t) { var s = t._currentValue; if (t = { context: t, memoizedValue: s, next: null }, gs === null) {
        if (e === null)
            throw Error(c(308));
        gs = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    }
    else
        gs = gs.next = t; return s; }
    var _0 = typeof AbortController < "u" ? AbortController : function () { var e = [], t = this.signal = { aborted: !1, addEventListener: function (s, n) { e.push(n); } }; this.abort = function () { t.aborted = !0, e.forEach(function (s) { return s(); }); }; }, O0 = l.unstable_scheduleCallback, z0 = l.unstable_NormalPriority, Ve = { $$typeof: X, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
    function Mc() { return { controller: new _0, data: new Map, refCount: 0 }; }
    function Yl(e) { e.refCount--, e.refCount === 0 && O0(z0, function () { e.controller.abort(); }); }
    var Xl = null, _c = 0, el = 0, tl = null;
    function D0(e, t) { if (Xl === null) {
        var s = Xl = [];
        _c = 0, el = Ro(), tl = { status: "pending", value: void 0, then: function (n) { s.push(n); } };
    } return _c++, t.then(hf, hf), t; }
    function hf() { if (--_c === 0 && Xl !== null) {
        tl !== null && (tl.status = "fulfilled");
        var e = Xl;
        Xl = null, el = 0, tl = null;
        for (var t = 0; t < e.length; t++)
            (0, e[t])();
    } }
    function R0(e, t) { var s = [], n = { status: "pending", value: null, reason: null, then: function (o) { s.push(o); } }; return e.then(function () { n.status = "fulfilled", n.value = t; for (var o = 0; o < s.length; o++)
        (0, s[o])(t); }, function (o) { for (n.status = "rejected", n.reason = o, o = 0; o < s.length; o++)
        (0, s[o])(void 0); }), n; }
    var mf = O.S;
    O.S = function (e, t) { Wh = St(), typeof t == "object" && t !== null && typeof t.then == "function" && D0(e, t), mf !== null && mf(e, t); };
    var Na = ge(null);
    function Oc() { var e = Na.current; return e !== null ? e : _e.pooledCache; }
    function ri(e, t) { t === null ? ae(Na, Na.current) : ae(Na, t.pool); }
    function pf() { var e = Oc(); return e === null ? null : { parent: Ve._currentValue, pool: e }; }
    var sl = Error(c(460)), zc = Error(c(474)), ci = Error(c(542)), oi = { then: function () { } };
    function xf(e) { return e = e.status, e === "fulfilled" || e === "rejected"; }
    function gf(e, t, s) { switch (s = e[s], s === void 0 ? e.push(t) : s !== t && (t.then(hs, hs), t = s), t.status) {
        case "fulfilled": return t.value;
        case "rejected": throw e = t.reason, bf(e), e;
        default:
            if (typeof t.status == "string")
                t.then(hs, hs);
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
                case "rejected": throw e = t.reason, bf(e), e;
            }
            throw Sa = t, sl;
    } }
    function wa(e) { try {
        var t = e._init;
        return t(e._payload);
    }
    catch (s) {
        throw s !== null && typeof s == "object" && typeof s.then == "function" ? (Sa = s, sl) : s;
    } }
    var Sa = null;
    function yf() { if (Sa === null)
        throw Error(c(459)); var e = Sa; return Sa = null, e; }
    function bf(e) { if (e === sl || e === ci)
        throw Error(c(483)); }
    var al = null, Zl = 0;
    function ui(e) { var t = Zl; return Zl += 1, al === null && (al = []), gf(al, e, t); }
    function Jl(e, t) { t = t.props.ref, e.ref = t !== void 0 ? t : null; }
    function di(e, t) { throw t.$$typeof === D ? Error(c(525)) : (e = Object.prototype.toString.call(t), Error(c(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e))); }
    function vf(e) { function t(S, w) { if (e) {
        var k = S.deletions;
        k === null ? (S.deletions = [w], S.flags |= 16) : k.push(w);
    } } function s(S, w) { if (!e)
        return null; for (; w !== null;)
        t(S, w), w = w.sibling; return null; } function n(S) { for (var w = new Map; S !== null;)
        S.key !== null ? w.set(S.key, S) : w.set(S.index, S), S = S.sibling; return w; } function o(S, w) { return S = ps(S, w), S.index = 0, S.sibling = null, S; } function u(S, w, k) { return S.index = k, e ? (k = S.alternate, k !== null ? (k = k.index, k < w ? (S.flags |= 67108866, w) : k) : (S.flags |= 67108866, w)) : (S.flags |= 1048576, w); } function f(S) { return e && S.alternate === null && (S.flags |= 67108866), S; } function p(S, w, k, q) { return w === null || w.tag !== 6 ? (w = jc(k, S.mode, q), w.return = S, w) : (w = o(w, k), w.return = S, w); } function j(S, w, k, q) { var P = k.type; return P === T ? R(S, w, k.props.children, q, k.key) : w !== null && (w.elementType === P || typeof P == "object" && P !== null && P.$$typeof === Y && wa(P) === w.type) ? (w = o(w, k.props), Jl(w, k), w.return = S, w) : (w = ai(k.type, k.key, k.props, null, S.mode, q), Jl(w, k), w.return = S, w); } function C(S, w, k, q) { return w === null || w.tag !== 4 || w.stateNode.containerInfo !== k.containerInfo || w.stateNode.implementation !== k.implementation ? (w = Nc(k, S.mode, q), w.return = S, w) : (w = o(w, k.children || []), w.return = S, w); } function R(S, w, k, q, P) { return w === null || w.tag !== 7 ? (w = ya(k, S.mode, q, P), w.return = S, w) : (w = o(w, k), w.return = S, w); } function B(S, w, k) { if (typeof w == "string" && w !== "" || typeof w == "number" || typeof w == "bigint")
        return w = jc("" + w, S.mode, k), w.return = S, w; if (typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
            case A: return k = ai(w.type, w.key, w.props, null, S.mode, k), Jl(k, w), k.return = S, k;
            case N: return w = Nc(w, S.mode, k), w.return = S, w;
            case Y: return w = wa(w), B(S, w, k);
        }
        if (he(w) || Me(w))
            return w = ya(w, S.mode, k, null), w.return = S, w;
        if (typeof w.then == "function")
            return B(S, ui(w), k);
        if (w.$$typeof === X)
            return B(S, ii(S, w), k);
        di(S, w);
    } return null; } function E(S, w, k, q) { var P = w !== null ? w.key : null; if (typeof k == "string" && k !== "" || typeof k == "number" || typeof k == "bigint")
        return P !== null ? null : p(S, w, "" + k, q); if (typeof k == "object" && k !== null) {
        switch (k.$$typeof) {
            case A: return k.key === P ? j(S, w, k, q) : null;
            case N: return k.key === P ? C(S, w, k, q) : null;
            case Y: return k = wa(k), E(S, w, k, q);
        }
        if (he(k) || Me(k))
            return P !== null ? null : R(S, w, k, q, null);
        if (typeof k.then == "function")
            return E(S, w, ui(k), q);
        if (k.$$typeof === X)
            return E(S, w, ii(S, k), q);
        di(S, k);
    } return null; } function z(S, w, k, q, P) { if (typeof q == "string" && q !== "" || typeof q == "number" || typeof q == "bigint")
        return S = S.get(k) || null, p(w, S, "" + q, P); if (typeof q == "object" && q !== null) {
        switch (q.$$typeof) {
            case A: return S = S.get(q.key === null ? k : q.key) || null, j(w, S, q, P);
            case N: return S = S.get(q.key === null ? k : q.key) || null, C(w, S, q, P);
            case Y: return q = wa(q), z(S, w, k, q, P);
        }
        if (he(q) || Me(q))
            return S = S.get(k) || null, R(w, S, q, P, null);
        if (typeof q.then == "function")
            return z(S, w, k, ui(q), P);
        if (q.$$typeof === X)
            return z(S, w, k, ii(w, q), P);
        di(w, q);
    } return null; } function J(S, w, k, q) { for (var P = null, je = null, W = w, ie = w = 0, xe = null; W !== null && ie < k.length; ie++) {
        W.index > ie ? (xe = W, W = null) : xe = W.sibling;
        var Ne = E(S, W, k[ie], q);
        if (Ne === null) {
            W === null && (W = xe);
            break;
        }
        e && W && Ne.alternate === null && t(S, W), w = u(Ne, w, ie), je === null ? P = Ne : je.sibling = Ne, je = Ne, W = xe;
    } if (ie === k.length)
        return s(S, W), ye && xs(S, ie), P; if (W === null) {
        for (; ie < k.length; ie++)
            W = B(S, k[ie], q), W !== null && (w = u(W, w, ie), je === null ? P = W : je.sibling = W, je = W);
        return ye && xs(S, ie), P;
    } for (W = n(W); ie < k.length; ie++)
        xe = z(W, S, ie, k[ie], q), xe !== null && (e && xe.alternate !== null && W.delete(xe.key === null ? ie : xe.key), w = u(xe, w, ie), je === null ? P = xe : je.sibling = xe, je = xe); return e && W.forEach(function (na) { return t(S, na); }), ye && xs(S, ie), P; } function te(S, w, k, q) { if (k == null)
        throw Error(c(151)); for (var P = null, je = null, W = w, ie = w = 0, xe = null, Ne = k.next(); W !== null && !Ne.done; ie++, Ne = k.next()) {
        W.index > ie ? (xe = W, W = null) : xe = W.sibling;
        var na = E(S, W, Ne.value, q);
        if (na === null) {
            W === null && (W = xe);
            break;
        }
        e && W && na.alternate === null && t(S, W), w = u(na, w, ie), je === null ? P = na : je.sibling = na, je = na, W = xe;
    } if (Ne.done)
        return s(S, W), ye && xs(S, ie), P; if (W === null) {
        for (; !Ne.done; ie++, Ne = k.next())
            Ne = B(S, Ne.value, q), Ne !== null && (w = u(Ne, w, ie), je === null ? P = Ne : je.sibling = Ne, je = Ne);
        return ye && xs(S, ie), P;
    } for (W = n(W); !Ne.done; ie++, Ne = k.next())
        Ne = z(W, S, ie, Ne.value, q), Ne !== null && (e && Ne.alternate !== null && W.delete(Ne.key === null ? ie : Ne.key), w = u(Ne, w, ie), je === null ? P = Ne : je.sibling = Ne, je = Ne); return e && W.forEach(function (Xy) { return t(S, Xy); }), ye && xs(S, ie), P; } function Ee(S, w, k, q) { if (typeof k == "object" && k !== null && k.type === T && k.key === null && (k = k.props.children), typeof k == "object" && k !== null) {
        switch (k.$$typeof) {
            case A:
                e: {
                    for (var P = k.key; w !== null;) {
                        if (w.key === P) {
                            if (P = k.type, P === T) {
                                if (w.tag === 7) {
                                    s(S, w.sibling), q = o(w, k.props.children), q.return = S, S = q;
                                    break e;
                                }
                            }
                            else if (w.elementType === P || typeof P == "object" && P !== null && P.$$typeof === Y && wa(P) === w.type) {
                                s(S, w.sibling), q = o(w, k.props), Jl(q, k), q.return = S, S = q;
                                break e;
                            }
                            s(S, w);
                            break;
                        }
                        else
                            t(S, w);
                        w = w.sibling;
                    }
                    k.type === T ? (q = ya(k.props.children, S.mode, q, k.key), q.return = S, S = q) : (q = ai(k.type, k.key, k.props, null, S.mode, q), Jl(q, k), q.return = S, S = q);
                }
                return f(S);
            case N:
                e: {
                    for (P = k.key; w !== null;) {
                        if (w.key === P)
                            if (w.tag === 4 && w.stateNode.containerInfo === k.containerInfo && w.stateNode.implementation === k.implementation) {
                                s(S, w.sibling), q = o(w, k.children || []), q.return = S, S = q;
                                break e;
                            }
                            else {
                                s(S, w);
                                break;
                            }
                        else
                            t(S, w);
                        w = w.sibling;
                    }
                    q = Nc(k, S.mode, q), q.return = S, S = q;
                }
                return f(S);
            case Y: return k = wa(k), Ee(S, w, k, q);
        }
        if (he(k))
            return J(S, w, k, q);
        if (Me(k)) {
            if (P = Me(k), typeof P != "function")
                throw Error(c(150));
            return k = P.call(k), te(S, w, k, q);
        }
        if (typeof k.then == "function")
            return Ee(S, w, ui(k), q);
        if (k.$$typeof === X)
            return Ee(S, w, ii(S, k), q);
        di(S, k);
    } return typeof k == "string" && k !== "" || typeof k == "number" || typeof k == "bigint" ? (k = "" + k, w !== null && w.tag === 6 ? (s(S, w.sibling), q = o(w, k), q.return = S, S = q) : (s(S, w), q = jc(k, S.mode, q), q.return = S, S = q), f(S)) : s(S, w); } return function (S, w, k, q) { try {
        Zl = 0;
        var P = Ee(S, w, k, q);
        return al = null, P;
    }
    catch (W) {
        if (W === sl || W === ci)
            throw W;
        var je = Tt(29, W, null, S.mode);
        return je.lanes = q, je.return = S, je;
    }
    finally { } }; }
    var Aa = vf(!0), jf = vf(!1), Qs = !1;
    function Dc(e) { e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, lanes: 0, hiddenCallbacks: null }, callbacks: null }; }
    function Rc(e, t) { e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, callbacks: null }); }
    function Gs(e) { return { lane: e, tag: 0, payload: null, callback: null, next: null }; }
    function Ks(e, t, s) { var n = e.updateQueue; if (n === null)
        return null; if (n = n.shared, (Se & 2) !== 0) {
        var o = n.pending;
        return o === null ? t.next = t : (t.next = o.next, o.next = t), n.pending = t, t = si(e), af(e, null, s), t;
    } return ti(e, n, t, s), si(e); }
    function Fl(e, t, s) { if (t = t.updateQueue, t !== null && (t = t.shared, (s & 4194048) !== 0)) {
        var n = t.lanes;
        n &= e.pendingLanes, s |= n, t.lanes = s, dd(e, s);
    } }
    function qc(e, t) { var s = e.updateQueue, n = e.alternate; if (n !== null && (n = n.updateQueue, s === n)) {
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
    var Bc = !1;
    function $l() { if (Bc) {
        var e = tl;
        if (e !== null)
            throw e;
    } }
    function Wl(e, t, s, n) { Bc = !1; var o = e.updateQueue; Qs = !1; var u = o.firstBaseUpdate, f = o.lastBaseUpdate, p = o.shared.pending; if (p !== null) {
        o.shared.pending = null;
        var j = p, C = j.next;
        j.next = null, f === null ? u = C : f.next = C, f = j;
        var R = e.alternate;
        R !== null && (R = R.updateQueue, p = R.lastBaseUpdate, p !== f && (p === null ? R.firstBaseUpdate = C : p.next = C, R.lastBaseUpdate = j));
    } if (u !== null) {
        var B = o.baseState;
        f = 0, R = C = j = null, p = u;
        do {
            var E = p.lane & -536870913, z = E !== p.lane;
            if (z ? (pe & E) === E : (n & E) === E) {
                E !== 0 && E === el && (Bc = !0), R !== null && (R = R.next = { lane: 0, tag: p.tag, payload: p.payload, callback: null, next: null });
                e: {
                    var J = e, te = p;
                    E = t;
                    var Ee = s;
                    switch (te.tag) {
                        case 1:
                            if (J = te.payload, typeof J == "function") {
                                B = J.call(Ee, B, E);
                                break e;
                            }
                            B = J;
                            break e;
                        case 3: J.flags = J.flags & -65537 | 128;
                        case 0:
                            if (J = te.payload, E = typeof J == "function" ? J.call(Ee, B, E) : J, E == null)
                                break e;
                            B = b({}, B, E);
                            break e;
                        case 2: Qs = !0;
                    }
                }
                E = p.callback, E !== null && (e.flags |= 64, z && (e.flags |= 8192), z = o.callbacks, z === null ? o.callbacks = [E] : z.push(E));
            }
            else
                z = { lane: E, tag: p.tag, payload: p.payload, callback: p.callback, next: null }, R === null ? (C = R = z, j = B) : R = R.next = z, f |= E;
            if (p = p.next, p === null) {
                if (p = o.shared.pending, p === null)
                    break;
                z = p, p = z.next, z.next = null, o.lastBaseUpdate = z, o.shared.pending = null;
            }
        } while (!0);
        R === null && (j = B), o.baseState = j, o.firstBaseUpdate = C, o.lastBaseUpdate = R, u === null && (o.shared.lanes = 0), Fs |= f, e.lanes = f, e.memoizedState = B;
    } }
    function Nf(e, t) { if (typeof e != "function")
        throw Error(c(191, e)); e.call(t); }
    function wf(e, t) { var s = e.callbacks; if (s !== null)
        for (e.callbacks = null, e = 0; e < s.length; e++)
            Nf(s[e], t); }
    var ll = ge(null), fi = ge(0);
    function Sf(e, t) { e = Cs, ae(fi, e), ae(ll, t), Cs = e | t.baseLanes; }
    function Uc() { ae(fi, Cs), ae(ll, ll.current); }
    function Lc() { Cs = fi.current, me(ll), me(fi); }
    var Et = ge(null), Kt = null;
    function Ys(e) { var t = e.alternate; ae(Ue, Ue.current & 1), ae(Et, e), Kt === null && (t === null || ll.current !== null || t.memoizedState !== null) && (Kt = e); }
    function Hc(e) { ae(Ue, Ue.current), ae(Et, e), Kt === null && (Kt = e); }
    function Af(e) { e.tag === 22 ? (ae(Ue, Ue.current), ae(Et, e), Kt === null && (Kt = e)) : Xs(); }
    function Xs() { ae(Ue, Ue.current), ae(Et, Et.current); }
    function Mt(e) { me(Et), Kt === e && (Kt = null), me(Ue); }
    var Ue = ge(0);
    function hi(e) { for (var t = e; t !== null;) {
        if (t.tag === 13) {
            var s = t.memoizedState;
            if (s !== null && (s = s.dehydrated, s === null || Zo(s) || Jo(s)))
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
    var bs = 0, le = null, Ce = null, Qe = null, mi = !1, nl = !1, ka = !1, pi = 0, Il = 0, il = null, q0 = 0;
    function qe() { throw Error(c(321)); }
    function Vc(e, t) { if (t === null)
        return !1; for (var s = 0; s < t.length && s < e.length; s++)
        if (!Ct(e[s], t[s]))
            return !1; return !0; }
    function Qc(e, t, s, n, o, u) { return bs = u, le = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, O.H = e === null || e.memoizedState === null ? ch : ao, ka = !1, u = s(n, o), ka = !1, nl && (u = Cf(t, s, n, o)), kf(e), u; }
    function kf(e) { O.H = tn; var t = Ce !== null && Ce.next !== null; if (bs = 0, Qe = Ce = le = null, mi = !1, Il = 0, il = null, t)
        throw Error(c(300)); e === null || Ge || (e = e.dependencies, e !== null && ni(e) && (Ge = !0)); }
    function Cf(e, t, s, n) { le = e; var o = 0; do {
        if (nl && (il = null), Il = 0, nl = !1, 25 <= o)
            throw Error(c(301));
        if (o += 1, Qe = Ce = null, e.updateQueue != null) {
            var u = e.updateQueue;
            u.lastEffect = null, u.events = null, u.stores = null, u.memoCache != null && (u.memoCache.index = 0);
        }
        O.H = oh, u = t(s, n);
    } while (nl); return u; }
    function B0() { var e = O.H, t = e.useState()[0]; return t = typeof t.then == "function" ? Pl(t) : t, e = e.useState()[0], (Ce !== null ? Ce.memoizedState : null) !== e && (le.flags |= 1024), t; }
    function Gc() { var e = pi !== 0; return pi = 0, e; }
    function Kc(e, t, s) { t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~s; }
    function Yc(e) { if (mi) {
        for (e = e.memoizedState; e !== null;) {
            var t = e.queue;
            t !== null && (t.pending = null), e = e.next;
        }
        mi = !1;
    } bs = 0, Qe = Ce = le = null, nl = !1, Il = pi = 0, il = null; }
    function dt() { var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }; return Qe === null ? le.memoizedState = Qe = e : Qe = Qe.next = e, Qe; }
    function Le() { if (Ce === null) {
        var e = le.alternate;
        e = e !== null ? e.memoizedState : null;
    }
    else
        e = Ce.next; var t = Qe === null ? le.memoizedState : Qe.next; if (t !== null)
        Qe = t, Ce = e;
    else {
        if (e === null)
            throw le.alternate === null ? Error(c(467)) : Error(c(310));
        Ce = e, e = { memoizedState: Ce.memoizedState, baseState: Ce.baseState, baseQueue: Ce.baseQueue, queue: Ce.queue, next: null }, Qe === null ? le.memoizedState = Qe = e : Qe = Qe.next = e;
    } return Qe; }
    function xi() { return { lastEffect: null, events: null, stores: null, memoCache: null }; }
    function Pl(e) { var t = Il; return Il += 1, il === null && (il = []), e = gf(il, e, t), t = le, (Qe === null ? t.memoizedState : Qe.next) === null && (t = t.alternate, O.H = t === null || t.memoizedState === null ? ch : ao), e; }
    function gi(e) { if (e !== null && typeof e == "object") {
        if (typeof e.then == "function")
            return Pl(e);
        if (e.$$typeof === X)
            return at(e);
    } throw Error(c(438, String(e))); }
    function Xc(e) { var t = null, s = le.updateQueue; if (s !== null && (t = s.memoCache), t == null) {
        var n = le.alternate;
        n !== null && (n = n.updateQueue, n !== null && (n = n.memoCache, n != null && (t = { data: n.data.map(function (o) { return o.slice(); }), index: 0 })));
    } if (t == null && (t = { data: [], index: 0 }), s === null && (s = xi(), le.updateQueue = s), s.memoCache = t, s = t.data[t.index], s === void 0)
        for (s = t.data[t.index] = Array(e), n = 0; n < e; n++)
            s[n] = ft; return t.index++, s; }
    function vs(e, t) { return typeof t == "function" ? t(e) : t; }
    function yi(e) { var t = Le(); return Zc(t, Ce, e); }
    function Zc(e, t, s) { var n = e.queue; if (n === null)
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
        var p = f = null, j = null, C = t, R = !1;
        do {
            var B = C.lane & -536870913;
            if (B !== C.lane ? (pe & B) === B : (bs & B) === B) {
                var E = C.revertLane;
                if (E === 0)
                    j !== null && (j = j.next = { lane: 0, revertLane: 0, gesture: null, action: C.action, hasEagerState: C.hasEagerState, eagerState: C.eagerState, next: null }), B === el && (R = !0);
                else if ((bs & E) === E) {
                    C = C.next, E === el && (R = !0);
                    continue;
                }
                else
                    B = { lane: 0, revertLane: C.revertLane, gesture: null, action: C.action, hasEagerState: C.hasEagerState, eagerState: C.eagerState, next: null }, j === null ? (p = j = B, f = u) : j = j.next = B, le.lanes |= E, Fs |= E;
                B = C.action, ka && s(u, B), u = C.hasEagerState ? C.eagerState : s(u, B);
            }
            else
                E = { lane: B, revertLane: C.revertLane, gesture: C.gesture, action: C.action, hasEagerState: C.hasEagerState, eagerState: C.eagerState, next: null }, j === null ? (p = j = E, f = u) : j = j.next = E, le.lanes |= B, Fs |= B;
            C = C.next;
        } while (C !== null && C !== t);
        if (j === null ? f = u : j.next = p, !Ct(u, e.memoizedState) && (Ge = !0, R && (s = tl, s !== null)))
            throw s;
        e.memoizedState = u, e.baseState = f, e.baseQueue = j, n.lastRenderedState = u;
    } return o === null && (n.lanes = 0), [e.memoizedState, n.dispatch]; }
    function Jc(e) { var t = Le(), s = t.queue; if (s === null)
        throw Error(c(311)); s.lastRenderedReducer = e; var n = s.dispatch, o = s.pending, u = t.memoizedState; if (o !== null) {
        s.pending = null;
        var f = o = o.next;
        do
            u = e(u, f.action), f = f.next;
        while (f !== o);
        Ct(u, t.memoizedState) || (Ge = !0), t.memoizedState = u, t.baseQueue === null && (t.baseState = u), s.lastRenderedState = u;
    } return [u, n]; }
    function Tf(e, t, s) { var n = le, o = Le(), u = ye; if (u) {
        if (s === void 0)
            throw Error(c(407));
        s = s();
    }
    else
        s = t(); var f = !Ct((Ce || o).memoizedState, s); if (f && (o.memoizedState = s, Ge = !0), o = o.queue, Wc(_f.bind(null, n, o, e), [e]), o.getSnapshot !== t || f || Qe !== null && Qe.memoizedState.tag & 1) {
        if (n.flags |= 2048, rl(9, { destroy: void 0 }, Mf.bind(null, n, o, s, t), null), _e === null)
            throw Error(c(349));
        u || (bs & 127) !== 0 || Ef(n, t, s);
    } return s; }
    function Ef(e, t, s) { e.flags |= 16384, e = { getSnapshot: t, value: s }, t = le.updateQueue, t === null ? (t = xi(), le.updateQueue = t, t.stores = [e]) : (s = t.stores, s === null ? t.stores = [e] : s.push(e)); }
    function Mf(e, t, s, n) { t.value = s, t.getSnapshot = n, Of(t) && zf(e); }
    function _f(e, t, s) { return s(function () { Of(t) && zf(e); }); }
    function Of(e) { var t = e.getSnapshot; e = e.value; try {
        var s = t();
        return !Ct(e, s);
    }
    catch {
        return !0;
    } }
    function zf(e) { var t = ga(e, 2); t !== null && bt(t, e, 2); }
    function Fc(e) { var t = dt(); if (typeof e == "function") {
        var s = e;
        if (e = s(), ka) {
            Rs(!0);
            try {
                s();
            }
            finally {
                Rs(!1);
            }
        }
    } return t.memoizedState = t.baseState = e, t.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: vs, lastRenderedState: e }, t; }
    function Df(e, t, s, n) { return e.baseState = s, Zc(e, Ce, typeof n == "function" ? n : vs); }
    function U0(e, t, s, n, o) { if (ji(e))
        throw Error(c(485)); if (e = t.action, e !== null) {
        var u = { payload: o, action: e, next: null, isTransition: !0, status: "pending", value: null, reason: null, listeners: [], then: function (f) { u.listeners.push(f); } };
        O.T !== null ? s(!0) : u.isTransition = !1, n(u), s = t.pending, s === null ? (u.next = t.pending = u, Rf(t, u)) : (u.next = s.next, t.pending = s.next = u);
    } }
    function Rf(e, t) { var s = t.action, n = t.payload, o = e.state; if (t.isTransition) {
        var u = O.T, f = {};
        O.T = f;
        try {
            var p = s(o, n), j = O.S;
            j !== null && j(f, p), qf(e, t, p);
        }
        catch (C) {
            $c(e, t, C);
        }
        finally {
            u !== null && f.types !== null && (u.types = f.types), O.T = u;
        }
    }
    else
        try {
            u = s(o, n), qf(e, t, u);
        }
        catch (C) {
            $c(e, t, C);
        } }
    function qf(e, t, s) { s !== null && typeof s == "object" && typeof s.then == "function" ? s.then(function (n) { Bf(e, t, n); }, function (n) { return $c(e, t, n); }) : Bf(e, t, s); }
    function Bf(e, t, s) { t.status = "fulfilled", t.value = s, Uf(t), e.state = s, t = e.pending, t !== null && (s = t.next, s === t ? e.pending = null : (s = s.next, t.next = s, Rf(e, s))); }
    function $c(e, t, s) { var n = e.pending; if (e.pending = null, n !== null) {
        n = n.next;
        do
            t.status = "rejected", t.reason = s, Uf(t), t = t.next;
        while (t !== n);
    } e.action = null; }
    function Uf(e) { e = e.listeners; for (var t = 0; t < e.length; t++)
        (0, e[t])(); }
    function Lf(e, t) { return t; }
    function Hf(e, t) { if (ye) {
        var s = _e.formState;
        if (s !== null) {
            e: {
                var n = le;
                if (ye) {
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
                    Hs(n);
                }
                n = !1;
            }
            n && (t = s[0]);
        }
    } return s = dt(), s.memoizedState = s.baseState = t, n = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Lf, lastRenderedState: t }, s.queue = n, s = nh.bind(null, le, n), n.dispatch = s, n = Fc(!1), u = so.bind(null, le, !1, n.queue), n = dt(), o = { state: t, dispatch: null, action: e, pending: null }, n.queue = o, s = U0.bind(null, le, o, u, s), o.dispatch = s, n.memoizedState = e, [t, s, !1]; }
    function Vf(e) { var t = Le(); return Qf(t, Ce, e); }
    function Qf(e, t, s) { if (t = Zc(e, t, Lf)[0], e = yi(vs)[0], typeof t == "object" && t !== null && typeof t.then == "function")
        try {
            var n = Pl(t);
        }
        catch (f) {
            throw f === sl ? ci : f;
        }
    else
        n = t; t = Le(); var o = t.queue, u = o.dispatch; return s !== t.memoizedState && (le.flags |= 2048, rl(9, { destroy: void 0 }, L0.bind(null, o, s), null)), [n, u, e]; }
    function L0(e, t) { e.action = t; }
    function Gf(e) { var t = Le(), s = Ce; if (s !== null)
        return Qf(t, s, e); Le(), t = t.memoizedState, s = Le(); var n = s.queue.dispatch; return s.memoizedState = e, [t, n, !1]; }
    function rl(e, t, s, n) { return e = { tag: e, create: s, deps: n, inst: t, next: null }, t = le.updateQueue, t === null && (t = xi(), le.updateQueue = t), s = t.lastEffect, s === null ? t.lastEffect = e.next = e : (n = s.next, s.next = e, e.next = n, t.lastEffect = e), e; }
    function Kf() { return Le().memoizedState; }
    function bi(e, t, s, n) { var o = dt(); le.flags |= e, o.memoizedState = rl(1 | t, { destroy: void 0 }, s, n === void 0 ? null : n); }
    function vi(e, t, s, n) { var o = Le(); n = n === void 0 ? null : n; var u = o.memoizedState.inst; Ce !== null && n !== null && Vc(n, Ce.memoizedState.deps) ? o.memoizedState = rl(t, u, s, n) : (le.flags |= e, o.memoizedState = rl(1 | t, u, s, n)); }
    function Yf(e, t) { bi(8390656, 8, e, t); }
    function Wc(e, t) { vi(2048, 8, e, t); }
    function H0(e) { le.flags |= 4; var t = le.updateQueue; if (t === null)
        t = xi(), le.updateQueue = t, t.events = [e];
    else {
        var s = t.events;
        s === null ? t.events = [e] : s.push(e);
    } }
    function Xf(e) { var t = Le().memoizedState; return H0({ ref: t, nextImpl: e }), function () { if ((Se & 2) !== 0)
        throw Error(c(440)); return t.impl.apply(void 0, arguments); }; }
    function Zf(e, t) { return vi(4, 2, e, t); }
    function Jf(e, t) { return vi(4, 4, e, t); }
    function Ff(e, t) { if (typeof t == "function") {
        e = e();
        var s = t(e);
        return function () { typeof s == "function" ? s() : t(null); };
    } if (t != null)
        return e = e(), t.current = e, function () { t.current = null; }; }
    function $f(e, t, s) { s = s != null ? s.concat([e]) : null, vi(4, 4, Ff.bind(null, t, e), s); }
    function Ic() { }
    function Wf(e, t) { var s = Le(); t = t === void 0 ? null : t; var n = s.memoizedState; return t !== null && Vc(t, n[1]) ? n[0] : (s.memoizedState = [e, t], e); }
    function If(e, t) { var s = Le(); t = t === void 0 ? null : t; var n = s.memoizedState; if (t !== null && Vc(t, n[1]))
        return n[0]; if (n = e(), ka) {
        Rs(!0);
        try {
            e();
        }
        finally {
            Rs(!1);
        }
    } return s.memoizedState = [n, t], n; }
    function Pc(e, t, s) { return s === void 0 || (bs & 1073741824) !== 0 && (pe & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = s, e = Ph(), le.lanes |= e, Fs |= e, s); }
    function Pf(e, t, s, n) { return Ct(s, t) ? s : ll.current !== null ? (e = Pc(e, s, n), Ct(e, t) || (Ge = !0), e) : (bs & 42) === 0 || (bs & 1073741824) !== 0 && (pe & 261930) === 0 ? (Ge = !0, e.memoizedState = s) : (e = Ph(), le.lanes |= e, Fs |= e, t); }
    function eh(e, t, s, n, o) { var u = K.p; K.p = u !== 0 && 8 > u ? u : 8; var f = O.T, p = {}; O.T = p, so(e, !1, t, s); try {
        var j = o(), C = O.S;
        if (C !== null && C(p, j), j !== null && typeof j == "object" && typeof j.then == "function") {
            var R = R0(j, n);
            en(e, t, R, zt(e));
        }
        else
            en(e, t, n, zt(e));
    }
    catch (B) {
        en(e, t, { then: function () { }, status: "rejected", reason: B }, zt());
    }
    finally {
        K.p = u, f !== null && p.types !== null && (f.types = p.types), O.T = f;
    } }
    function V0() { }
    function eo(e, t, s, n) { if (e.tag !== 5)
        throw Error(c(476)); var o = th(e).queue; eh(e, o, t, L, s === null ? V0 : function () { return sh(e), s(n); }); }
    function th(e) { var t = e.memoizedState; if (t !== null)
        return t; t = { memoizedState: L, baseState: L, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: vs, lastRenderedState: L }, next: null }; var s = {}; return t.next = { memoizedState: s, baseState: s, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: vs, lastRenderedState: s }, next: null }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t; }
    function sh(e) { var t = th(e); t.next === null && (t = e.alternate.memoizedState), en(e, t.next.queue, {}, zt()); }
    function to() { return at(yn); }
    function ah() { return Le().memoizedState; }
    function lh() { return Le().memoizedState; }
    function Q0(e) { for (var t = e.return; t !== null;) {
        switch (t.tag) {
            case 24:
            case 3:
                var s = zt();
                e = Gs(s);
                var n = Ks(t, e, s);
                n !== null && (bt(n, t, s), Fl(n, t, s)), t = { cache: Mc() }, e.payload = t;
                return;
        }
        t = t.return;
    } }
    function G0(e, t, s) { var n = zt(); s = { lane: n, revertLane: 0, gesture: null, action: s, hasEagerState: !1, eagerState: null, next: null }, ji(e) ? ih(t, s) : (s = bc(e, t, s, n), s !== null && (bt(s, e, n), rh(s, t, n))); }
    function nh(e, t, s) { var n = zt(); en(e, t, s, n); }
    function en(e, t, s, n) { var o = { lane: n, revertLane: 0, gesture: null, action: s, hasEagerState: !1, eagerState: null, next: null }; if (ji(e))
        ih(t, o);
    else {
        var u = e.alternate;
        if (e.lanes === 0 && (u === null || u.lanes === 0) && (u = t.lastRenderedReducer, u !== null))
            try {
                var f = t.lastRenderedState, p = u(f, s);
                if (o.hasEagerState = !0, o.eagerState = p, Ct(p, f))
                    return ti(e, t, o, 0), _e === null && ei(), !1;
            }
            catch { }
            finally { }
        if (s = bc(e, t, o, n), s !== null)
            return bt(s, e, n), rh(s, t, n), !0;
    } return !1; }
    function so(e, t, s, n) { if (n = { lane: 2, revertLane: Ro(), gesture: null, action: n, hasEagerState: !1, eagerState: null, next: null }, ji(e)) {
        if (t)
            throw Error(c(479));
    }
    else
        t = bc(e, s, n, 2), t !== null && bt(t, e, 2); }
    function ji(e) { var t = e.alternate; return e === le || t !== null && t === le; }
    function ih(e, t) { nl = mi = !0; var s = e.pending; s === null ? t.next = t : (t.next = s.next, s.next = t), e.pending = t; }
    function rh(e, t, s) { if ((s & 4194048) !== 0) {
        var n = t.lanes;
        n &= e.pendingLanes, s |= n, t.lanes = s, dd(e, s);
    } }
    var tn = { readContext: at, use: gi, useCallback: qe, useContext: qe, useEffect: qe, useImperativeHandle: qe, useLayoutEffect: qe, useInsertionEffect: qe, useMemo: qe, useReducer: qe, useRef: qe, useState: qe, useDebugValue: qe, useDeferredValue: qe, useTransition: qe, useSyncExternalStore: qe, useId: qe, useHostTransitionStatus: qe, useFormState: qe, useActionState: qe, useOptimistic: qe, useMemoCache: qe, useCacheRefresh: qe };
    tn.useEffectEvent = qe;
    var ch = { readContext: at, use: gi, useCallback: function (e, t) { return dt().memoizedState = [e, t === void 0 ? null : t], e; }, useContext: at, useEffect: Yf, useImperativeHandle: function (e, t, s) { s = s != null ? s.concat([e]) : null, bi(4194308, 4, Ff.bind(null, t, e), s); }, useLayoutEffect: function (e, t) { return bi(4194308, 4, e, t); }, useInsertionEffect: function (e, t) { bi(4, 2, e, t); }, useMemo: function (e, t) { var s = dt(); t = t === void 0 ? null : t; var n = e(); if (ka) {
            Rs(!0);
            try {
                e();
            }
            finally {
                Rs(!1);
            }
        } return s.memoizedState = [n, t], n; }, useReducer: function (e, t, s) { var n = dt(); if (s !== void 0) {
            var o = s(t);
            if (ka) {
                Rs(!0);
                try {
                    s(t);
                }
                finally {
                    Rs(!1);
                }
            }
        }
        else
            o = t; return n.memoizedState = n.baseState = o, e = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: o }, n.queue = e, e = e.dispatch = G0.bind(null, le, e), [n.memoizedState, e]; }, useRef: function (e) { var t = dt(); return e = { current: e }, t.memoizedState = e; }, useState: function (e) { e = Fc(e); var t = e.queue, s = nh.bind(null, le, t); return t.dispatch = s, [e.memoizedState, s]; }, useDebugValue: Ic, useDeferredValue: function (e, t) { var s = dt(); return Pc(s, e, t); }, useTransition: function () { var e = Fc(!1); return e = eh.bind(null, le, e.queue, !0, !1), dt().memoizedState = e, [!1, e]; }, useSyncExternalStore: function (e, t, s) { var n = le, o = dt(); if (ye) {
            if (s === void 0)
                throw Error(c(407));
            s = s();
        }
        else {
            if (s = t(), _e === null)
                throw Error(c(349));
            (pe & 127) !== 0 || Ef(n, t, s);
        } o.memoizedState = s; var u = { value: s, getSnapshot: t }; return o.queue = u, Yf(_f.bind(null, n, u, e), [e]), n.flags |= 2048, rl(9, { destroy: void 0 }, Mf.bind(null, n, u, s, t), null), s; }, useId: function () { var e = dt(), t = _e.identifierPrefix; if (ye) {
            var s = is, n = ns;
            s = (n & ~(1 << 32 - kt(n) - 1)).toString(32) + s, t = "_" + t + "R_" + s, s = pi++, 0 < s && (t += "H" + s.toString(32)), t += "_";
        }
        else
            s = q0++, t = "_" + t + "r_" + s.toString(32) + "_"; return e.memoizedState = t; }, useHostTransitionStatus: to, useFormState: Hf, useActionState: Hf, useOptimistic: function (e) { var t = dt(); t.memoizedState = t.baseState = e; var s = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null }; return t.queue = s, t = so.bind(null, le, !0, s), s.dispatch = t, [e, t]; }, useMemoCache: Xc, useCacheRefresh: function () { return dt().memoizedState = Q0.bind(null, le); }, useEffectEvent: function (e) { var t = dt(), s = { impl: e }; return t.memoizedState = s, function () { if ((Se & 2) !== 0)
            throw Error(c(440)); return s.impl.apply(void 0, arguments); }; } }, ao = { readContext: at, use: gi, useCallback: Wf, useContext: at, useEffect: Wc, useImperativeHandle: $f, useInsertionEffect: Zf, useLayoutEffect: Jf, useMemo: If, useReducer: yi, useRef: Kf, useState: function () { return yi(vs); }, useDebugValue: Ic, useDeferredValue: function (e, t) { var s = Le(); return Pf(s, Ce.memoizedState, e, t); }, useTransition: function () { var e = yi(vs)[0], t = Le().memoizedState; return [typeof e == "boolean" ? e : Pl(e), t]; }, useSyncExternalStore: Tf, useId: ah, useHostTransitionStatus: to, useFormState: Vf, useActionState: Vf, useOptimistic: function (e, t) { var s = Le(); return Df(s, Ce, e, t); }, useMemoCache: Xc, useCacheRefresh: lh };
    ao.useEffectEvent = Xf;
    var oh = { readContext: at, use: gi, useCallback: Wf, useContext: at, useEffect: Wc, useImperativeHandle: $f, useInsertionEffect: Zf, useLayoutEffect: Jf, useMemo: If, useReducer: Jc, useRef: Kf, useState: function () { return Jc(vs); }, useDebugValue: Ic, useDeferredValue: function (e, t) { var s = Le(); return Ce === null ? Pc(s, e, t) : Pf(s, Ce.memoizedState, e, t); }, useTransition: function () { var e = Jc(vs)[0], t = Le().memoizedState; return [typeof e == "boolean" ? e : Pl(e), t]; }, useSyncExternalStore: Tf, useId: ah, useHostTransitionStatus: to, useFormState: Gf, useActionState: Gf, useOptimistic: function (e, t) { var s = Le(); return Ce !== null ? Df(s, Ce, e, t) : (s.baseState = e, [e, s.queue.dispatch]); }, useMemoCache: Xc, useCacheRefresh: lh };
    oh.useEffectEvent = Xf;
    function lo(e, t, s, n) { t = e.memoizedState, s = s(n, t), s = s == null ? t : b({}, t, s), e.memoizedState = s, e.lanes === 0 && (e.updateQueue.baseState = s); }
    var no = { enqueueSetState: function (e, t, s) { e = e._reactInternals; var n = zt(), o = Gs(n); o.payload = t, s != null && (o.callback = s), t = Ks(e, o, n), t !== null && (bt(t, e, n), Fl(t, e, n)); }, enqueueReplaceState: function (e, t, s) { e = e._reactInternals; var n = zt(), o = Gs(n); o.tag = 1, o.payload = t, s != null && (o.callback = s), t = Ks(e, o, n), t !== null && (bt(t, e, n), Fl(t, e, n)); }, enqueueForceUpdate: function (e, t) { e = e._reactInternals; var s = zt(), n = Gs(s); n.tag = 2, t != null && (n.callback = t), t = Ks(e, n, s), t !== null && (bt(t, e, s), Fl(t, e, s)); } };
    function uh(e, t, s, n, o, u, f) { return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(n, u, f) : t.prototype && t.prototype.isPureReactComponent ? !Vl(s, n) || !Vl(o, u) : !0; }
    function dh(e, t, s, n) { e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(s, n), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(s, n), t.state !== e && no.enqueueReplaceState(t, t.state, null); }
    function Ca(e, t) { var s = t; if ("ref" in t) {
        s = {};
        for (var n in t)
            n !== "ref" && (s[n] = t[n]);
    } if (e = e.defaultProps) {
        s === t && (s = b({}, s));
        for (var o in e)
            s[o] === void 0 && (s[o] = e[o]);
    } return s; }
    function fh(e) { Pn(e); }
    function hh(e) { console.error(e); }
    function mh(e) { Pn(e); }
    function Ni(e, t) { try {
        var s = e.onUncaughtError;
        s(t.value, { componentStack: t.stack });
    }
    catch (n) {
        setTimeout(function () { throw n; });
    } }
    function ph(e, t, s) { try {
        var n = e.onCaughtError;
        n(s.value, { componentStack: s.stack, errorBoundary: t.tag === 1 ? t.stateNode : null });
    }
    catch (o) {
        setTimeout(function () { throw o; });
    } }
    function io(e, t, s) { return s = Gs(s), s.tag = 3, s.payload = { element: null }, s.callback = function () { Ni(e, t); }, s; }
    function xh(e) { return e = Gs(e), e.tag = 3, e; }
    function gh(e, t, s, n) { var o = s.type.getDerivedStateFromError; if (typeof o == "function") {
        var u = n.value;
        e.payload = function () { return o(u); }, e.callback = function () { ph(t, s, n); };
    } var f = s.stateNode; f !== null && typeof f.componentDidCatch == "function" && (e.callback = function () { ph(t, s, n), typeof o != "function" && ($s === null ? $s = new Set([this]) : $s.add(this)); var p = n.stack; this.componentDidCatch(n.value, { componentStack: p !== null ? p : "" }); }); }
    function K0(e, t, s, n, o) { if (s.flags |= 32768, n !== null && typeof n == "object" && typeof n.then == "function") {
        if (t = s.alternate, t !== null && Pa(t, s, o, !0), s = Et.current, s !== null) {
            switch (s.tag) {
                case 31:
                case 13: return Kt === null ? Di() : s.alternate === null && Be === 0 && (Be = 3), s.flags &= -257, s.flags |= 65536, s.lanes = o, n === oi ? s.flags |= 16384 : (t = s.updateQueue, t === null ? s.updateQueue = new Set([n]) : t.add(n), Oo(e, n, o)), !1;
                case 22: return s.flags |= 65536, n === oi ? s.flags |= 16384 : (t = s.updateQueue, t === null ? (t = { transitions: null, markerInstances: null, retryQueue: new Set([n]) }, s.updateQueue = t) : (s = t.retryQueue, s === null ? t.retryQueue = new Set([n]) : s.add(n)), Oo(e, n, o)), !1;
            }
            throw Error(c(435, s.tag));
        }
        return Oo(e, n, o), Di(), !1;
    } if (ye)
        return t = Et.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = o, n !== Ac && (e = Error(c(422), { cause: n }), Kl(Ht(e, s)))) : (n !== Ac && (t = Error(c(423), { cause: n }), Kl(Ht(t, s))), e = e.current.alternate, e.flags |= 65536, o &= -o, e.lanes |= o, n = Ht(n, s), o = io(e.stateNode, n, o), qc(e, o), Be !== 4 && (Be = 2)), !1; var u = Error(c(520), { cause: n }); if (u = Ht(u, s), un === null ? un = [u] : un.push(u), Be !== 4 && (Be = 2), t === null)
        return !0; n = Ht(n, s), s = t; do {
        switch (s.tag) {
            case 3: return s.flags |= 65536, e = o & -o, s.lanes |= e, e = io(s.stateNode, n, e), qc(s, e), !1;
            case 1: if (t = s.type, u = s.stateNode, (s.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || u !== null && typeof u.componentDidCatch == "function" && ($s === null || !$s.has(u))))
                return s.flags |= 65536, o &= -o, s.lanes |= o, o = xh(o), gh(o, e, s, n), qc(s, o), !1;
        }
        s = s.return;
    } while (s !== null); return !1; }
    var ro = Error(c(461)), Ge = !1;
    function lt(e, t, s, n) { t.child = e === null ? jf(t, null, s, n) : Aa(t, e.child, s, n); }
    function yh(e, t, s, n, o) { s = s.render; var u = t.ref; if ("ref" in n) {
        var f = {};
        for (var p in n)
            p !== "ref" && (f[p] = n[p]);
    }
    else
        f = n; return ja(t), n = Qc(e, t, s, f, u, o), p = Gc(), e !== null && !Ge ? (Kc(e, t, o), js(e, t, o)) : (ye && p && wc(t), t.flags |= 1, lt(e, t, n, o), t.child); }
    function bh(e, t, s, n, o) { if (e === null) {
        var u = s.type;
        return typeof u == "function" && !vc(u) && u.defaultProps === void 0 && s.compare === null ? (t.tag = 15, t.type = u, vh(e, t, u, n, o)) : (e = ai(s.type, null, n, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
    } if (u = e.child, !xo(e, o)) {
        var f = u.memoizedProps;
        if (s = s.compare, s = s !== null ? s : Vl, s(f, n) && e.ref === t.ref)
            return js(e, t, o);
    } return t.flags |= 1, e = ps(u, n), e.ref = t.ref, e.return = t, t.child = e; }
    function vh(e, t, s, n, o) { if (e !== null) {
        var u = e.memoizedProps;
        if (Vl(u, n) && e.ref === t.ref)
            if (Ge = !1, t.pendingProps = n = u, xo(e, o))
                (e.flags & 131072) !== 0 && (Ge = !0);
            else
                return t.lanes = e.lanes, js(e, t, o);
    } return co(e, t, s, n, o); }
    function jh(e, t, s, n) { var o = n.children, u = e !== null ? e.memoizedState : null; if (e === null && t.stateNode === null && (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), n.mode === "hidden") {
        if ((t.flags & 128) !== 0) {
            if (u = u !== null ? u.baseLanes | s : s, e !== null) {
                for (n = t.child = e.child, o = 0; n !== null;)
                    o = o | n.lanes | n.childLanes, n = n.sibling;
                n = o & ~u;
            }
            else
                n = 0, t.child = null;
            return Nh(e, t, u, s, n);
        }
        if ((s & 536870912) !== 0)
            t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && ri(t, u !== null ? u.cachePool : null), u !== null ? Sf(t, u) : Uc(), Af(t);
        else
            return n = t.lanes = 536870912, Nh(e, t, u !== null ? u.baseLanes | s : s, s, n);
    }
    else
        u !== null ? (ri(t, u.cachePool), Sf(t, u), Xs(), t.memoizedState = null) : (e !== null && ri(t, null), Uc(), Xs()); return lt(e, t, o, s), t.child; }
    function sn(e, t) { return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), t.sibling; }
    function Nh(e, t, s, n, o) { var u = Oc(); return u = u === null ? null : { parent: Ve._currentValue, pool: u }, t.memoizedState = { baseLanes: s, cachePool: u }, e !== null && ri(t, null), Uc(), Af(t), e !== null && Pa(e, t, n, !0), t.childLanes = o, null; }
    function wi(e, t) { return t = Ai({ mode: t.mode, children: t.children }, e.mode), t.ref = e.ref, e.child = t, t.return = e, t; }
    function wh(e, t, s) { return Aa(t, e.child, null, s), e = wi(t, t.pendingProps), e.flags |= 2, Mt(t), t.memoizedState = null, e; }
    function Y0(e, t, s) { var n = t.pendingProps, o = (t.flags & 128) !== 0; if (t.flags &= -129, e === null) {
        if (ye) {
            if (n.mode === "hidden")
                return e = wi(t, n), t.lanes = 536870912, sn(null, e);
            if (Hc(t), (e = Oe) ? (e = Rm(e, Gt), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Us !== null ? { id: ns, overflow: is } : null, retryLane: 536870912, hydrationErrors: null }, s = nf(e), s.return = t, t.child = s, st = t, Oe = null)) : e = null, e === null)
                throw Hs(t);
            return t.lanes = 536870912, null;
        }
        return wi(t, n);
    } var u = e.memoizedState; if (u !== null) {
        var f = u.dehydrated;
        if (Hc(t), o)
            if (t.flags & 256)
                t.flags &= -257, t = wh(e, t, s);
            else if (t.memoizedState !== null)
                t.child = e.child, t.flags |= 128, t = null;
            else
                throw Error(c(558));
        else if (Ge || Pa(e, t, s, !1), o = (s & e.childLanes) !== 0, Ge || o) {
            if (n = _e, n !== null && (f = fd(n, s), f !== 0 && f !== u.retryLane))
                throw u.retryLane = f, ga(e, f), bt(n, e, f), ro;
            Di(), t = wh(e, t, s);
        }
        else
            e = u.treeContext, Oe = Yt(f.nextSibling), st = t, ye = !0, Ls = null, Gt = !1, e !== null && of(t, e), t = wi(t, n), t.flags |= 4096;
        return t;
    } return e = ps(e.child, { mode: n.mode, children: n.children }), e.ref = t.ref, t.child = e, e.return = t, e; }
    function Si(e, t) { var s = t.ref; if (s === null)
        e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
        if (typeof s != "function" && typeof s != "object")
            throw Error(c(284));
        (e === null || e.ref !== s) && (t.flags |= 4194816);
    } }
    function co(e, t, s, n, o) { return ja(t), s = Qc(e, t, s, n, void 0, o), n = Gc(), e !== null && !Ge ? (Kc(e, t, o), js(e, t, o)) : (ye && n && wc(t), t.flags |= 1, lt(e, t, s, o), t.child); }
    function Sh(e, t, s, n, o, u) { return ja(t), t.updateQueue = null, s = Cf(t, n, s, o), kf(e), n = Gc(), e !== null && !Ge ? (Kc(e, t, u), js(e, t, u)) : (ye && n && wc(t), t.flags |= 1, lt(e, t, s, u), t.child); }
    function Ah(e, t, s, n, o) { if (ja(t), t.stateNode === null) {
        var u = Fa, f = s.contextType;
        typeof f == "object" && f !== null && (u = at(f)), u = new s(n, u), t.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, u.updater = no, t.stateNode = u, u._reactInternals = t, u = t.stateNode, u.props = n, u.state = t.memoizedState, u.refs = {}, Dc(t), f = s.contextType, u.context = typeof f == "object" && f !== null ? at(f) : Fa, u.state = t.memoizedState, f = s.getDerivedStateFromProps, typeof f == "function" && (lo(t, s, f, n), u.state = t.memoizedState), typeof s.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (f = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), f !== u.state && no.enqueueReplaceState(u, u.state, null), Wl(t, n, u, o), $l(), u.state = t.memoizedState), typeof u.componentDidMount == "function" && (t.flags |= 4194308), n = !0;
    }
    else if (e === null) {
        u = t.stateNode;
        var p = t.memoizedProps, j = Ca(s, p);
        u.props = j;
        var C = u.context, R = s.contextType;
        f = Fa, typeof R == "object" && R !== null && (f = at(R));
        var B = s.getDerivedStateFromProps;
        R = typeof B == "function" || typeof u.getSnapshotBeforeUpdate == "function", p = t.pendingProps !== p, R || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (p || C !== f) && dh(t, u, n, f), Qs = !1;
        var E = t.memoizedState;
        u.state = E, Wl(t, n, u, o), $l(), C = t.memoizedState, p || E !== C || Qs ? (typeof B == "function" && (lo(t, s, B, n), C = t.memoizedState), (j = Qs || uh(t, s, j, n, E, C, f)) ? (R || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof u.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = n, t.memoizedState = C), u.props = n, u.state = C, u.context = f, n = j) : (typeof u.componentDidMount == "function" && (t.flags |= 4194308), n = !1);
    }
    else {
        u = t.stateNode, Rc(e, t), f = t.memoizedProps, R = Ca(s, f), u.props = R, B = t.pendingProps, E = u.context, C = s.contextType, j = Fa, typeof C == "object" && C !== null && (j = at(C)), p = s.getDerivedStateFromProps, (C = typeof p == "function" || typeof u.getSnapshotBeforeUpdate == "function") || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (f !== B || E !== j) && dh(t, u, n, j), Qs = !1, E = t.memoizedState, u.state = E, Wl(t, n, u, o), $l();
        var z = t.memoizedState;
        f !== B || E !== z || Qs || e !== null && e.dependencies !== null && ni(e.dependencies) ? (typeof p == "function" && (lo(t, s, p, n), z = t.memoizedState), (R = Qs || uh(t, s, R, n, E, z, j) || e !== null && e.dependencies !== null && ni(e.dependencies)) ? (C || typeof u.UNSAFE_componentWillUpdate != "function" && typeof u.componentWillUpdate != "function" || (typeof u.componentWillUpdate == "function" && u.componentWillUpdate(n, z, j), typeof u.UNSAFE_componentWillUpdate == "function" && u.UNSAFE_componentWillUpdate(n, z, j)), typeof u.componentDidUpdate == "function" && (t.flags |= 4), typeof u.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof u.componentDidUpdate != "function" || f === e.memoizedProps && E === e.memoizedState || (t.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && E === e.memoizedState || (t.flags |= 1024), t.memoizedProps = n, t.memoizedState = z), u.props = n, u.state = z, u.context = j, n = R) : (typeof u.componentDidUpdate != "function" || f === e.memoizedProps && E === e.memoizedState || (t.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && E === e.memoizedState || (t.flags |= 1024), n = !1);
    } return u = n, Si(e, t), n = (t.flags & 128) !== 0, u || n ? (u = t.stateNode, s = n && typeof s.getDerivedStateFromError != "function" ? null : u.render(), t.flags |= 1, e !== null && n ? (t.child = Aa(t, e.child, null, o), t.child = Aa(t, null, s, o)) : lt(e, t, s, o), t.memoizedState = u.state, e = t.child) : e = js(e, t, o), e; }
    function kh(e, t, s, n) { return ba(), t.flags |= 256, lt(e, t, s, n), t.child; }
    var oo = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function uo(e) { return { baseLanes: e, cachePool: pf() }; }
    function fo(e, t, s) { return e = e !== null ? e.childLanes & ~s : 0, t && (e |= Ot), e; }
    function Ch(e, t, s) { var n = t.pendingProps, o = !1, u = (t.flags & 128) !== 0, f; if ((f = u) || (f = e !== null && e.memoizedState === null ? !1 : (Ue.current & 2) !== 0), f && (o = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
        if (ye) {
            if (o ? Ys(t) : Xs(), (e = Oe) ? (e = Rm(e, Gt), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Us !== null ? { id: ns, overflow: is } : null, retryLane: 536870912, hydrationErrors: null }, s = nf(e), s.return = t, t.child = s, st = t, Oe = null)) : e = null, e === null)
                throw Hs(t);
            return Jo(e) ? t.lanes = 32 : t.lanes = 536870912, null;
        }
        var p = n.children;
        return n = n.fallback, o ? (Xs(), o = t.mode, p = Ai({ mode: "hidden", children: p }, o), n = ya(n, o, s, null), p.return = t, n.return = t, p.sibling = n, t.child = p, n = t.child, n.memoizedState = uo(s), n.childLanes = fo(e, f, s), t.memoizedState = oo, sn(null, n)) : (Ys(t), ho(t, p));
    } var j = e.memoizedState; if (j !== null && (p = j.dehydrated, p !== null)) {
        if (u)
            t.flags & 256 ? (Ys(t), t.flags &= -257, t = mo(e, t, s)) : t.memoizedState !== null ? (Xs(), t.child = e.child, t.flags |= 128, t = null) : (Xs(), p = n.fallback, o = t.mode, n = Ai({ mode: "visible", children: n.children }, o), p = ya(p, o, s, null), p.flags |= 2, n.return = t, p.return = t, n.sibling = p, t.child = n, Aa(t, e.child, null, s), n = t.child, n.memoizedState = uo(s), n.childLanes = fo(e, f, s), t.memoizedState = oo, t = sn(null, n));
        else if (Ys(t), Jo(p)) {
            if (f = p.nextSibling && p.nextSibling.dataset, f)
                var C = f.dgst;
            f = C, n = Error(c(419)), n.stack = "", n.digest = f, Kl({ value: n, source: null, stack: null }), t = mo(e, t, s);
        }
        else if (Ge || Pa(e, t, s, !1), f = (s & e.childLanes) !== 0, Ge || f) {
            if (f = _e, f !== null && (n = fd(f, s), n !== 0 && n !== j.retryLane))
                throw j.retryLane = n, ga(e, n), bt(f, e, n), ro;
            Zo(p) || Di(), t = mo(e, t, s);
        }
        else
            Zo(p) ? (t.flags |= 192, t.child = e.child, t = null) : (e = j.treeContext, Oe = Yt(p.nextSibling), st = t, ye = !0, Ls = null, Gt = !1, e !== null && of(t, e), t = ho(t, n.children), t.flags |= 4096);
        return t;
    } return o ? (Xs(), p = n.fallback, o = t.mode, j = e.child, C = j.sibling, n = ps(j, { mode: "hidden", children: n.children }), n.subtreeFlags = j.subtreeFlags & 65011712, C !== null ? p = ps(C, p) : (p = ya(p, o, s, null), p.flags |= 2), p.return = t, n.return = t, n.sibling = p, t.child = n, sn(null, n), n = t.child, p = e.child.memoizedState, p === null ? p = uo(s) : (o = p.cachePool, o !== null ? (j = Ve._currentValue, o = o.parent !== j ? { parent: j, pool: j } : o) : o = pf(), p = { baseLanes: p.baseLanes | s, cachePool: o }), n.memoizedState = p, n.childLanes = fo(e, f, s), t.memoizedState = oo, sn(e.child, n)) : (Ys(t), s = e.child, e = s.sibling, s = ps(s, { mode: "visible", children: n.children }), s.return = t, s.sibling = null, e !== null && (f = t.deletions, f === null ? (t.deletions = [e], t.flags |= 16) : f.push(e)), t.child = s, t.memoizedState = null, s); }
    function ho(e, t) { return t = Ai({ mode: "visible", children: t }, e.mode), t.return = e, e.child = t; }
    function Ai(e, t) { return e = Tt(22, e, null, t), e.lanes = 0, e; }
    function mo(e, t, s) { return Aa(t, e.child, null, s), e = ho(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e; }
    function Th(e, t, s) { e.lanes |= t; var n = e.alternate; n !== null && (n.lanes |= t), Tc(e.return, t, s); }
    function po(e, t, s, n, o, u) { var f = e.memoizedState; f === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: n, tail: s, tailMode: o, treeForkCount: u } : (f.isBackwards = t, f.rendering = null, f.renderingStartTime = 0, f.last = n, f.tail = s, f.tailMode = o, f.treeForkCount = u); }
    function Eh(e, t, s) { var n = t.pendingProps, o = n.revealOrder, u = n.tail; n = n.children; var f = Ue.current, p = (f & 2) !== 0; if (p ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, ae(Ue, f), lt(e, t, n, s), n = ye ? Gl : 0, !p && e !== null && (e.flags & 128) !== 0)
        e: for (e = t.child; e !== null;) {
            if (e.tag === 13)
                e.memoizedState !== null && Th(e, s, t);
            else if (e.tag === 19)
                Th(e, s, t);
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
                e = s.alternate, e !== null && hi(e) === null && (o = s), s = s.sibling;
            s = o, s === null ? (o = t.child, t.child = null) : (o = s.sibling, s.sibling = null), po(t, !1, o, s, u, n);
            break;
        case "backwards":
        case "unstable_legacy-backwards":
            for (s = null, o = t.child, t.child = null; o !== null;) {
                if (e = o.alternate, e !== null && hi(e) === null) {
                    t.child = o;
                    break;
                }
                e = o.sibling, o.sibling = s, s = o, o = e;
            }
            po(t, !0, s, null, u, n);
            break;
        case "together":
            po(t, !1, null, null, void 0, n);
            break;
        default: t.memoizedState = null;
    } return t.child; }
    function js(e, t, s) { if (e !== null && (t.dependencies = e.dependencies), Fs |= t.lanes, (s & t.childLanes) === 0)
        if (e !== null) {
            if (Pa(e, t, s, !1), (s & t.childLanes) === 0)
                return null;
        }
        else
            return null; if (e !== null && t.child !== e.child)
        throw Error(c(153)); if (t.child !== null) {
        for (e = t.child, s = ps(e, e.pendingProps), t.child = s, s.return = t; e.sibling !== null;)
            e = e.sibling, s = s.sibling = ps(e, e.pendingProps), s.return = t;
        s.sibling = null;
    } return t.child; }
    function xo(e, t) { return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && ni(e))); }
    function X0(e, t, s) { switch (t.tag) {
        case 3:
            ua(t, t.stateNode.containerInfo), Vs(t, Ve, e.memoizedState.cache), ba();
            break;
        case 27:
        case 5:
            Os(t);
            break;
        case 4:
            ua(t, t.stateNode.containerInfo);
            break;
        case 10:
            Vs(t, t.type, t.memoizedProps.value);
            break;
        case 31:
            if (t.memoizedState !== null)
                return t.flags |= 128, Hc(t), null;
            break;
        case 13:
            var n = t.memoizedState;
            if (n !== null)
                return n.dehydrated !== null ? (Ys(t), t.flags |= 128, null) : (s & t.child.childLanes) !== 0 ? Ch(e, t, s) : (Ys(t), e = js(e, t, s), e !== null ? e.sibling : null);
            Ys(t);
            break;
        case 19:
            var o = (e.flags & 128) !== 0;
            if (n = (s & t.childLanes) !== 0, n || (Pa(e, t, s, !1), n = (s & t.childLanes) !== 0), o) {
                if (n)
                    return Eh(e, t, s);
                t.flags |= 128;
            }
            if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), ae(Ue, Ue.current), n)
                break;
            return null;
        case 22: return t.lanes = 0, jh(e, t, s, t.pendingProps);
        case 24: Vs(t, Ve, e.memoizedState.cache);
    } return js(e, t, s); }
    function Mh(e, t, s) { if (e !== null)
        if (e.memoizedProps !== t.pendingProps)
            Ge = !0;
        else {
            if (!xo(e, s) && (t.flags & 128) === 0)
                return Ge = !1, X0(e, t, s);
            Ge = (e.flags & 131072) !== 0;
        }
    else
        Ge = !1, ye && (t.flags & 1048576) !== 0 && cf(t, Gl, t.index); switch (t.lanes = 0, t.tag) {
        case 16:
            e: {
                var n = t.pendingProps;
                if (e = wa(t.elementType), t.type = e, typeof e == "function")
                    vc(e) ? (n = Ca(e, n), t.tag = 1, t = Ah(null, t, e, n, s)) : (t.tag = 0, t = co(null, t, e, n, s));
                else {
                    if (e != null) {
                        var o = e.$$typeof;
                        if (o === ee) {
                            t.tag = 11, t = yh(null, t, e, n, s);
                            break e;
                        }
                        else if (o === U) {
                            t.tag = 14, t = bh(null, t, e, n, s);
                            break e;
                        }
                    }
                    throw t = Xe(e) || e, Error(c(306, t, ""));
                }
            }
            return t;
        case 0: return co(e, t, t.type, t.pendingProps, s);
        case 1: return n = t.type, o = Ca(n, t.pendingProps), Ah(e, t, n, o, s);
        case 3:
            e: {
                if (ua(t, t.stateNode.containerInfo), e === null)
                    throw Error(c(387));
                n = t.pendingProps;
                var u = t.memoizedState;
                o = u.element, Rc(e, t), Wl(t, n, null, s);
                var f = t.memoizedState;
                if (n = f.cache, Vs(t, Ve, n), n !== u.cache && Ec(t, [Ve], s, !0), $l(), n = f.element, u.isDehydrated)
                    if (u = { element: n, isDehydrated: !1, cache: f.cache }, t.updateQueue.baseState = u, t.memoizedState = u, t.flags & 256) {
                        t = kh(e, t, n, s);
                        break e;
                    }
                    else if (n !== o) {
                        o = Ht(Error(c(424)), t), Kl(o), t = kh(e, t, n, s);
                        break e;
                    }
                    else {
                        switch (e = t.stateNode.containerInfo, e.nodeType) {
                            case 9:
                                e = e.body;
                                break;
                            default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
                        }
                        for (Oe = Yt(e.firstChild), st = t, ye = !0, Ls = null, Gt = !0, s = jf(t, null, n, s), t.child = s; s;)
                            s.flags = s.flags & -3 | 4096, s = s.sibling;
                    }
                else {
                    if (ba(), n === o) {
                        t = js(e, t, s);
                        break e;
                    }
                    lt(e, t, n, s);
                }
                t = t.child;
            }
            return t;
        case 26: return Si(e, t), e === null ? (s = Vm(t.type, null, t.pendingProps, null)) ? t.memoizedState = s : ye || (s = t.type, e = t.pendingProps, n = Vi(Ft.current).createElement(s), n[tt] = t, n[ht] = e, nt(n, s, e), $e(n), t.stateNode = n) : t.memoizedState = Vm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
        case 27: return Os(t), e === null && ye && (n = t.stateNode = Um(t.type, t.pendingProps, Ft.current), st = t, Gt = !0, o = Oe, ea(t.type) ? (Fo = o, Oe = Yt(n.firstChild)) : Oe = o), lt(e, t, t.pendingProps.children, s), Si(e, t), e === null && (t.flags |= 4194304), t.child;
        case 5: return e === null && ye && ((o = n = Oe) && (n = Ny(n, t.type, t.pendingProps, Gt), n !== null ? (t.stateNode = n, st = t, Oe = Yt(n.firstChild), Gt = !1, o = !0) : o = !1), o || Hs(t)), Os(t), o = t.type, u = t.pendingProps, f = e !== null ? e.memoizedProps : null, n = u.children, Ko(o, u) ? n = null : f !== null && Ko(o, f) && (t.flags |= 32), t.memoizedState !== null && (o = Qc(e, t, B0, null, null, s), yn._currentValue = o), Si(e, t), lt(e, t, n, s), t.child;
        case 6: return e === null && ye && ((e = s = Oe) && (s = wy(s, t.pendingProps, Gt), s !== null ? (t.stateNode = s, st = t, Oe = null, e = !0) : e = !1), e || Hs(t)), null;
        case 13: return Ch(e, t, s);
        case 4: return ua(t, t.stateNode.containerInfo), n = t.pendingProps, e === null ? t.child = Aa(t, null, n, s) : lt(e, t, n, s), t.child;
        case 11: return yh(e, t, t.type, t.pendingProps, s);
        case 7: return lt(e, t, t.pendingProps, s), t.child;
        case 8: return lt(e, t, t.pendingProps.children, s), t.child;
        case 12: return lt(e, t, t.pendingProps.children, s), t.child;
        case 10: return n = t.pendingProps, Vs(t, t.type, n.value), lt(e, t, n.children, s), t.child;
        case 9: return o = t.type._context, n = t.pendingProps.children, ja(t), o = at(o), n = n(o), t.flags |= 1, lt(e, t, n, s), t.child;
        case 14: return bh(e, t, t.type, t.pendingProps, s);
        case 15: return vh(e, t, t.type, t.pendingProps, s);
        case 19: return Eh(e, t, s);
        case 31: return Y0(e, t, s);
        case 22: return jh(e, t, s, t.pendingProps);
        case 24: return ja(t), n = at(Ve), e === null ? (o = Oc(), o === null && (o = _e, u = Mc(), o.pooledCache = u, u.refCount++, u !== null && (o.pooledCacheLanes |= s), o = u), t.memoizedState = { parent: n, cache: o }, Dc(t), Vs(t, Ve, o)) : ((e.lanes & s) !== 0 && (Rc(e, t), Wl(t, null, null, s), $l()), o = e.memoizedState, u = t.memoizedState, o.parent !== n ? (o = { parent: n, cache: n }, t.memoizedState = o, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = o), Vs(t, Ve, n)) : (n = u.cache, Vs(t, Ve, n), n !== o.cache && Ec(t, [Ve], s, !0))), lt(e, t, t.pendingProps.children, s), t.child;
        case 29: throw t.pendingProps;
    } throw Error(c(156, t.tag)); }
    function Ns(e) { e.flags |= 4; }
    function go(e, t, s, n, o) { if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
        if (e.flags |= 16777216, (o & 335544128) === o)
            if (e.stateNode.complete)
                e.flags |= 8192;
            else if (am())
                e.flags |= 8192;
            else
                throw Sa = oi, zc;
    }
    else
        e.flags &= -16777217; }
    function _h(e, t) { if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
        e.flags &= -16777217;
    else if (e.flags |= 16777216, !Xm(t))
        if (am())
            e.flags |= 8192;
        else
            throw Sa = oi, zc; }
    function ki(e, t) { t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? od() : 536870912, e.lanes |= t, dl |= t); }
    function an(e, t) { if (!ye)
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
    function Z0(e, t, s) { var n = t.pendingProps; switch (Sc(t), t.tag) {
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
        case 3: return s = t.stateNode, n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), ys(Ve), $t(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), (e === null || e.child === null) && (Ia(t) ? Ns(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, kc())), ze(t), null;
        case 26:
            var o = t.type, u = t.memoizedState;
            return e === null ? (Ns(t), u !== null ? (ze(t), _h(t, u)) : (ze(t), go(t, o, null, n, s))) : u ? u !== e.memoizedState ? (Ns(t), ze(t), _h(t, u)) : (ze(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== n && Ns(t), ze(t), go(t, o, e, n, s)), null;
        case 27:
            if (zs(t), s = Ft.current, o = t.type, e !== null && t.stateNode != null)
                e.memoizedProps !== n && Ns(t);
            else {
                if (!n) {
                    if (t.stateNode === null)
                        throw Error(c(166));
                    return ze(t), null;
                }
                e = ue.current, Ia(t) ? uf(t) : (e = Um(o, n, s), t.stateNode = e, Ns(t));
            }
            return ze(t), null;
        case 5:
            if (zs(t), o = t.type, e !== null && t.stateNode != null)
                e.memoizedProps !== n && Ns(t);
            else {
                if (!n) {
                    if (t.stateNode === null)
                        throw Error(c(166));
                    return ze(t), null;
                }
                if (u = ue.current, Ia(t))
                    uf(t);
                else {
                    var f = Vi(Ft.current);
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
                    u[tt] = t, u[ht] = n;
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
                    e: switch (nt(u, o, n), o) {
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
                    n && Ns(t);
                }
            }
            return ze(t), go(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, s), null;
        case 6:
            if (e && t.stateNode != null)
                e.memoizedProps !== n && Ns(t);
            else {
                if (typeof n != "string" && t.stateNode === null)
                    throw Error(c(166));
                if (e = Ft.current, Ia(t)) {
                    if (e = t.stateNode, s = t.memoizedProps, n = null, o = st, o !== null)
                        switch (o.tag) {
                            case 27:
                            case 5: n = o.memoizedProps;
                        }
                    e[tt] = t, e = !!(e.nodeValue === s || n !== null && n.suppressHydrationWarning === !0 || Cm(e.nodeValue, s)), e || Hs(t, !0);
                }
                else
                    e = Vi(e).createTextNode(n), e[tt] = t, t.stateNode = e;
            }
            return ze(t), null;
        case 31:
            if (s = t.memoizedState, e === null || e.memoizedState !== null) {
                if (n = Ia(t), s !== null) {
                    if (e === null) {
                        if (!n)
                            throw Error(c(318));
                        if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e)
                            throw Error(c(557));
                        e[tt] = t;
                    }
                    else
                        ba(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                    ze(t), e = !1;
                }
                else
                    s = kc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = s), e = !0;
                if (!e)
                    return t.flags & 256 ? (Mt(t), t) : (Mt(t), null);
                if ((t.flags & 128) !== 0)
                    throw Error(c(558));
            }
            return ze(t), null;
        case 13:
            if (n = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                if (o = Ia(t), n !== null && n.dehydrated !== null) {
                    if (e === null) {
                        if (!o)
                            throw Error(c(318));
                        if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o)
                            throw Error(c(317));
                        o[tt] = t;
                    }
                    else
                        ba(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                    ze(t), o = !1;
                }
                else
                    o = kc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = o), o = !0;
                if (!o)
                    return t.flags & 256 ? (Mt(t), t) : (Mt(t), null);
            }
            return Mt(t), (t.flags & 128) !== 0 ? (t.lanes = s, t) : (s = n !== null, e = e !== null && e.memoizedState !== null, s && (n = t.child, o = null, n.alternate !== null && n.alternate.memoizedState !== null && n.alternate.memoizedState.cachePool !== null && (o = n.alternate.memoizedState.cachePool.pool), u = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (u = n.memoizedState.cachePool.pool), u !== o && (n.flags |= 2048)), s !== e && s && (t.child.flags |= 8192), ki(t, t.updateQueue), ze(t), null);
        case 4: return $t(), e === null && Lo(t.stateNode.containerInfo), ze(t), null;
        case 10: return ys(t.type), ze(t), null;
        case 19:
            if (me(Ue), n = t.memoizedState, n === null)
                return ze(t), null;
            if (o = (t.flags & 128) !== 0, u = n.rendering, u === null)
                if (o)
                    an(n, !1);
                else {
                    if (Be !== 0 || e !== null && (e.flags & 128) !== 0)
                        for (e = t.child; e !== null;) {
                            if (u = hi(e), u !== null) {
                                for (t.flags |= 128, an(n, !1), e = u.updateQueue, t.updateQueue = e, ki(t, e), t.subtreeFlags = 0, e = s, s = t.child; s !== null;)
                                    lf(s, e), s = s.sibling;
                                return ae(Ue, Ue.current & 1 | 2), ye && xs(t, n.treeForkCount), t.child;
                            }
                            e = e.sibling;
                        }
                    n.tail !== null && St() > _i && (t.flags |= 128, o = !0, an(n, !1), t.lanes = 4194304);
                }
            else {
                if (!o)
                    if (e = hi(u), e !== null) {
                        if (t.flags |= 128, o = !0, e = e.updateQueue, t.updateQueue = e, ki(t, e), an(n, !0), n.tail === null && n.tailMode === "hidden" && !u.alternate && !ye)
                            return ze(t), null;
                    }
                    else
                        2 * St() - n.renderingStartTime > _i && s !== 536870912 && (t.flags |= 128, o = !0, an(n, !1), t.lanes = 4194304);
                n.isBackwards ? (u.sibling = t.child, t.child = u) : (e = n.last, e !== null ? e.sibling = u : t.child = u, n.last = u);
            }
            return n.tail !== null ? (e = n.tail, n.rendering = e, n.tail = e.sibling, n.renderingStartTime = St(), e.sibling = null, s = Ue.current, ae(Ue, o ? s & 1 | 2 : s & 1), ye && xs(t, n.treeForkCount), e) : (ze(t), null);
        case 22:
        case 23: return Mt(t), Lc(), n = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== n && (t.flags |= 8192) : n && (t.flags |= 8192), n ? (s & 536870912) !== 0 && (t.flags & 128) === 0 && (ze(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ze(t), s = t.updateQueue, s !== null && ki(t, s.retryQueue), s = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (s = e.memoizedState.cachePool.pool), n = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (n = t.memoizedState.cachePool.pool), n !== s && (t.flags |= 2048), e !== null && me(Na), null;
        case 24: return s = null, e !== null && (s = e.memoizedState.cache), t.memoizedState.cache !== s && (t.flags |= 2048), ys(Ve), ze(t), null;
        case 25: return null;
        case 30: return null;
    } throw Error(c(156, t.tag)); }
    function J0(e, t) { switch (Sc(t), t.tag) {
        case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 3: return ys(Ve), $t(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
        case 26:
        case 27:
        case 5: return zs(t), null;
        case 31:
            if (t.memoizedState !== null) {
                if (Mt(t), t.alternate === null)
                    throw Error(c(340));
                ba();
            }
            return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 13:
            if (Mt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
                if (t.alternate === null)
                    throw Error(c(340));
                ba();
            }
            return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 19: return me(Ue), null;
        case 4: return $t(), null;
        case 10: return ys(t.type), null;
        case 22:
        case 23: return Mt(t), Lc(), e !== null && me(Na), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 24: return ys(Ve), null;
        case 25: return null;
        default: return null;
    } }
    function Oh(e, t) { switch (Sc(t), t.tag) {
        case 3:
            ys(Ve), $t();
            break;
        case 26:
        case 27:
        case 5:
            zs(t);
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
            me(Ue);
            break;
        case 10:
            ys(t.type);
            break;
        case 22:
        case 23:
            Mt(t), Lc(), e !== null && me(Na);
            break;
        case 24: ys(Ve);
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
        ke(t, t.return, p);
    } }
    function Zs(e, t, s) { try {
        var n = t.updateQueue, o = n !== null ? n.lastEffect : null;
        if (o !== null) {
            var u = o.next;
            n = u;
            do {
                if ((n.tag & e) === e) {
                    var f = n.inst, p = f.destroy;
                    if (p !== void 0) {
                        f.destroy = void 0, o = t;
                        var j = s, C = p;
                        try {
                            C();
                        }
                        catch (R) {
                            ke(o, j, R);
                        }
                    }
                }
                n = n.next;
            } while (n !== u);
        }
    }
    catch (R) {
        ke(t, t.return, R);
    } }
    function zh(e) { var t = e.updateQueue; if (t !== null) {
        var s = e.stateNode;
        try {
            wf(t, s);
        }
        catch (n) {
            ke(e, e.return, n);
        }
    } }
    function Dh(e, t, s) { s.props = Ca(e.type, e.memoizedProps), s.state = e.memoizedState; try {
        s.componentWillUnmount();
    }
    catch (n) {
        ke(e, t, n);
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
        ke(e, t, o);
    } }
    function rs(e, t) { var s = e.ref, n = e.refCleanup; if (s !== null)
        if (typeof n == "function")
            try {
                n();
            }
            catch (o) {
                ke(e, t, o);
            }
            finally {
                e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
            }
        else if (typeof s == "function")
            try {
                s(null);
            }
            catch (o) {
                ke(e, t, o);
            }
        else
            s.current = null; }
    function Rh(e) { var t = e.type, s = e.memoizedProps, n = e.stateNode; try {
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
        ke(e, e.return, o);
    } }
    function yo(e, t, s) { try {
        var n = e.stateNode;
        xy(n, e.type, s, t), n[ht] = t;
    }
    catch (o) {
        ke(e, e.return, o);
    } }
    function qh(e) { return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && ea(e.type) || e.tag === 4; }
    function bo(e) { e: for (;;) {
        for (; e.sibling === null;) {
            if (e.return === null || qh(e.return))
                return null;
            e = e.return;
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
            if (e.tag === 27 && ea(e.type) || e.flags & 2 || e.child === null || e.tag === 4)
                continue e;
            e.child.return = e, e = e.child;
        }
        if (!(e.flags & 2))
            return e.stateNode;
    } }
    function vo(e, t, s) { var n = e.tag; if (n === 5 || n === 6)
        e = e.stateNode, t ? (s.nodeType === 9 ? s.body : s.nodeName === "HTML" ? s.ownerDocument.body : s).insertBefore(e, t) : (t = s.nodeType === 9 ? s.body : s.nodeName === "HTML" ? s.ownerDocument.body : s, t.appendChild(e), s = s._reactRootContainer, s != null || t.onclick !== null || (t.onclick = hs));
    else if (n !== 4 && (n === 27 && ea(e.type) && (s = e.stateNode, t = null), e = e.child, e !== null))
        for (vo(e, t, s), e = e.sibling; e !== null;)
            vo(e, t, s), e = e.sibling; }
    function Ci(e, t, s) { var n = e.tag; if (n === 5 || n === 6)
        e = e.stateNode, t ? s.insertBefore(e, t) : s.appendChild(e);
    else if (n !== 4 && (n === 27 && ea(e.type) && (s = e.stateNode), e = e.child, e !== null))
        for (Ci(e, t, s), e = e.sibling; e !== null;)
            Ci(e, t, s), e = e.sibling; }
    function Bh(e) { var t = e.stateNode, s = e.memoizedProps; try {
        for (var n = e.type, o = t.attributes; o.length;)
            t.removeAttributeNode(o[0]);
        nt(t, n, s), t[tt] = e, t[ht] = s;
    }
    catch (u) {
        ke(e, e.return, u);
    } }
    var ws = !1, Ke = !1, jo = !1, Uh = typeof WeakSet == "function" ? WeakSet : Set, We = null;
    function F0(e, t) { if (e = e.containerInfo, Qo = Ji, e = Fd(e), hc(e)) {
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
                    var f = 0, p = -1, j = -1, C = 0, R = 0, B = e, E = null;
                    t: for (;;) {
                        for (var z; B !== s || o !== 0 && B.nodeType !== 3 || (p = f + o), B !== u || n !== 0 && B.nodeType !== 3 || (j = f + n), B.nodeType === 3 && (f += B.nodeValue.length), (z = B.firstChild) !== null;)
                            E = B, B = z;
                        for (;;) {
                            if (B === e)
                                break t;
                            if (E === s && ++C === o && (p = f), E === u && ++R === n && (j = f), (z = B.nextSibling) !== null)
                                break;
                            B = E, E = B.parentNode;
                        }
                        B = z;
                    }
                    s = p === -1 || j === -1 ? null : { start: p, end: j };
                }
                else
                    s = null;
            }
        s = s || { start: 0, end: 0 };
    }
    else
        s = null; for (Go = { focusedElem: e, selectionRange: s }, Ji = !1, We = t; We !== null;)
        if (t = We, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
            e.return = t, We = e;
        else
            for (; We !== null;) {
                switch (t = We, u = t.alternate, e = t.flags, t.tag) {
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
                                var J = Ca(s.type, o);
                                e = n.getSnapshotBeforeUpdate(J, u), n.__reactInternalSnapshotBeforeUpdate = e;
                            }
                            catch (te) {
                                ke(s, s.return, te);
                            }
                        }
                        break;
                    case 3:
                        if ((e & 1024) !== 0) {
                            if (e = t.stateNode.containerInfo, s = e.nodeType, s === 9)
                                Xo(e);
                            else if (s === 1)
                                switch (e.nodeName) {
                                    case "HEAD":
                                    case "HTML":
                                    case "BODY":
                                        Xo(e);
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
                    e.return = t.return, We = e;
                    break;
                }
                We = t.return;
            } }
    function Lh(e, t, s) { var n = s.flags; switch (s.tag) {
        case 0:
        case 11:
        case 15:
            As(e, s), n & 4 && ln(5, s);
            break;
        case 1:
            if (As(e, s), n & 4)
                if (e = s.stateNode, t === null)
                    try {
                        e.componentDidMount();
                    }
                    catch (f) {
                        ke(s, s.return, f);
                    }
                else {
                    var o = Ca(s.type, t.memoizedProps);
                    t = t.memoizedState;
                    try {
                        e.componentDidUpdate(o, t, e.__reactInternalSnapshotBeforeUpdate);
                    }
                    catch (f) {
                        ke(s, s.return, f);
                    }
                }
            n & 64 && zh(s), n & 512 && nn(s, s.return);
            break;
        case 3:
            if (As(e, s), n & 64 && (e = s.updateQueue, e !== null)) {
                if (t = null, s.child !== null)
                    switch (s.child.tag) {
                        case 27:
                        case 5:
                            t = s.child.stateNode;
                            break;
                        case 1: t = s.child.stateNode;
                    }
                try {
                    wf(e, t);
                }
                catch (f) {
                    ke(s, s.return, f);
                }
            }
            break;
        case 27: t === null && n & 4 && Bh(s);
        case 26:
        case 5:
            As(e, s), t === null && n & 4 && Rh(s), n & 512 && nn(s, s.return);
            break;
        case 12:
            As(e, s);
            break;
        case 31:
            As(e, s), n & 4 && Qh(e, s);
            break;
        case 13:
            As(e, s), n & 4 && Gh(e, s), n & 64 && (e = s.memoizedState, e !== null && (e = e.dehydrated, e !== null && (s = ly.bind(null, s), Sy(e, s))));
            break;
        case 22:
            if (n = s.memoizedState !== null || ws, !n) {
                t = t !== null && t.memoizedState !== null || Ke, o = ws;
                var u = Ke;
                ws = n, (Ke = t) && !u ? ks(e, s, (s.subtreeFlags & 8772) !== 0) : As(e, s), ws = o, Ke = u;
            }
            break;
        case 30: break;
        default: As(e, s);
    } }
    function Hh(e) { var t = e.alternate; t !== null && (e.alternate = null, Hh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && $r(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null; }
    var De = null, pt = !1;
    function Ss(e, t, s) { for (s = s.child; s !== null;)
        Vh(e, t, s), s = s.sibling; }
    function Vh(e, t, s) { if (At && typeof At.onCommitFiberUnmount == "function")
        try {
            At.onCommitFiberUnmount(El, s);
        }
        catch { } switch (s.tag) {
        case 26:
            Ke || rs(s, t), Ss(e, t, s), s.memoizedState ? s.memoizedState.count-- : s.stateNode && (s = s.stateNode, s.parentNode.removeChild(s));
            break;
        case 27:
            Ke || rs(s, t);
            var n = De, o = pt;
            ea(s.type) && (De = s.stateNode, pt = !1), Ss(e, t, s), pn(s.stateNode), De = n, pt = o;
            break;
        case 5: Ke || rs(s, t);
        case 6:
            if (n = De, o = pt, De = null, Ss(e, t, s), De = n, pt = o, De !== null)
                if (pt)
                    try {
                        (De.nodeType === 9 ? De.body : De.nodeName === "HTML" ? De.ownerDocument.body : De).removeChild(s.stateNode);
                    }
                    catch (u) {
                        ke(s, t, u);
                    }
                else
                    try {
                        De.removeChild(s.stateNode);
                    }
                    catch (u) {
                        ke(s, t, u);
                    }
            break;
        case 18:
            De !== null && (pt ? (e = De, zm(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, s.stateNode), bl(e)) : zm(De, s.stateNode));
            break;
        case 4:
            n = De, o = pt, De = s.stateNode.containerInfo, pt = !0, Ss(e, t, s), De = n, pt = o;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            Zs(2, s, t), Ke || Zs(4, s, t), Ss(e, t, s);
            break;
        case 1:
            Ke || (rs(s, t), n = s.stateNode, typeof n.componentWillUnmount == "function" && Dh(s, t, n)), Ss(e, t, s);
            break;
        case 21:
            Ss(e, t, s);
            break;
        case 22:
            Ke = (n = Ke) || s.memoizedState !== null, Ss(e, t, s), Ke = n;
            break;
        default: Ss(e, t, s);
    } }
    function Qh(e, t) { if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
        e = e.dehydrated;
        try {
            bl(e);
        }
        catch (s) {
            ke(t, t.return, s);
        }
    } }
    function Gh(e, t) { if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
        try {
            bl(e);
        }
        catch (s) {
            ke(t, t.return, s);
        } }
    function $0(e) { switch (e.tag) {
        case 31:
        case 13:
        case 19:
            var t = e.stateNode;
            return t === null && (t = e.stateNode = new Uh), t;
        case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Uh), t;
        default: throw Error(c(435, e.tag));
    } }
    function Ti(e, t) { var s = $0(e); t.forEach(function (n) { if (!s.has(n)) {
        s.add(n);
        var o = ny.bind(null, e, n);
        n.then(o, o);
    } }); }
    function xt(e, t) { var s = t.deletions; if (s !== null)
        for (var n = 0; n < s.length; n++) {
            var o = s[n], u = e, f = t, p = f;
            e: for (; p !== null;) {
                switch (p.tag) {
                    case 27:
                        if (ea(p.type)) {
                            De = p.stateNode, pt = !1;
                            break e;
                        }
                        break;
                    case 5:
                        De = p.stateNode, pt = !1;
                        break e;
                    case 3:
                    case 4:
                        De = p.stateNode.containerInfo, pt = !0;
                        break e;
                }
                p = p.return;
            }
            if (De === null)
                throw Error(c(160));
            Vh(u, f, o), De = null, pt = !1, u = o.alternate, u !== null && (u.return = null), o.return = null;
        } if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null;)
            Kh(t, e), t = t.sibling; }
    var It = null;
    function Kh(e, t) { var s = e.alternate, n = e.flags; switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            xt(t, e), gt(e), n & 4 && (Zs(3, e, e.return), ln(3, e), Zs(5, e, e.return));
            break;
        case 1:
            xt(t, e), gt(e), n & 512 && (Ke || s === null || rs(s, s.return)), n & 64 && ws && (e = e.updateQueue, e !== null && (n = e.callbacks, n !== null && (s = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = s === null ? n : s.concat(n))));
            break;
        case 26:
            var o = It;
            if (xt(t, e), gt(e), n & 512 && (Ke || s === null || rs(s, s.return)), n & 4) {
                var u = s !== null ? s.memoizedState : null;
                if (n = e.memoizedState, s === null)
                    if (n === null)
                        if (e.stateNode === null) {
                            e: {
                                n = e.type, s = e.memoizedProps, o = o.ownerDocument || o;
                                t: switch (n) {
                                    case "title":
                                        u = o.getElementsByTagName("title")[0], (!u || u[Ol] || u[tt] || u.namespaceURI === "http://www.w3.org/2000/svg" || u.hasAttribute("itemprop")) && (u = o.createElement(n), o.head.insertBefore(u, o.querySelector("head > title"))), nt(u, n, s), u[tt] = e, $e(u), n = u;
                                        break e;
                                    case "link":
                                        var f = Km("link", "href", o).get(n + (s.href || ""));
                                        if (f) {
                                            for (var p = 0; p < f.length; p++)
                                                if (u = f[p], u.getAttribute("href") === (s.href == null || s.href === "" ? null : s.href) && u.getAttribute("rel") === (s.rel == null ? null : s.rel) && u.getAttribute("title") === (s.title == null ? null : s.title) && u.getAttribute("crossorigin") === (s.crossOrigin == null ? null : s.crossOrigin)) {
                                                    f.splice(p, 1);
                                                    break t;
                                                }
                                        }
                                        u = o.createElement(n), nt(u, n, s), o.head.appendChild(u);
                                        break;
                                    case "meta":
                                        if (f = Km("meta", "content", o).get(n + (s.content || ""))) {
                                            for (p = 0; p < f.length; p++)
                                                if (u = f[p], u.getAttribute("content") === (s.content == null ? null : "" + s.content) && u.getAttribute("name") === (s.name == null ? null : s.name) && u.getAttribute("property") === (s.property == null ? null : s.property) && u.getAttribute("http-equiv") === (s.httpEquiv == null ? null : s.httpEquiv) && u.getAttribute("charset") === (s.charSet == null ? null : s.charSet)) {
                                                    f.splice(p, 1);
                                                    break t;
                                                }
                                        }
                                        u = o.createElement(n), nt(u, n, s), o.head.appendChild(u);
                                        break;
                                    default: throw Error(c(468, n));
                                }
                                u[tt] = e, $e(u), n = u;
                            }
                            e.stateNode = n;
                        }
                        else
                            Ym(o, e.type, e.stateNode);
                    else
                        e.stateNode = Gm(o, n, e.memoizedProps);
                else
                    u !== n ? (u === null ? s.stateNode !== null && (s = s.stateNode, s.parentNode.removeChild(s)) : u.count--, n === null ? Ym(o, e.type, e.stateNode) : Gm(o, n, e.memoizedProps)) : n === null && e.stateNode !== null && yo(e, e.memoizedProps, s.memoizedProps);
            }
            break;
        case 27:
            xt(t, e), gt(e), n & 512 && (Ke || s === null || rs(s, s.return)), s !== null && n & 4 && yo(e, e.memoizedProps, s.memoizedProps);
            break;
        case 5:
            if (xt(t, e), gt(e), n & 512 && (Ke || s === null || rs(s, s.return)), e.flags & 32) {
                o = e.stateNode;
                try {
                    Qa(o, "");
                }
                catch (J) {
                    ke(e, e.return, J);
                }
            }
            n & 4 && e.stateNode != null && (o = e.memoizedProps, yo(e, o, s !== null ? s.memoizedProps : o)), n & 1024 && (jo = !0);
            break;
        case 6:
            if (xt(t, e), gt(e), n & 4) {
                if (e.stateNode === null)
                    throw Error(c(162));
                n = e.memoizedProps, s = e.stateNode;
                try {
                    s.nodeValue = n;
                }
                catch (J) {
                    ke(e, e.return, J);
                }
            }
            break;
        case 3:
            if (Ki = null, o = It, It = Qi(t.containerInfo), xt(t, e), It = o, gt(e), n & 4 && s !== null && s.memoizedState.isDehydrated)
                try {
                    bl(t.containerInfo);
                }
                catch (J) {
                    ke(e, e.return, J);
                }
            jo && (jo = !1, Yh(e));
            break;
        case 4:
            n = It, It = Qi(e.stateNode.containerInfo), xt(t, e), gt(e), It = n;
            break;
        case 12:
            xt(t, e), gt(e);
            break;
        case 31:
            xt(t, e), gt(e), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, Ti(e, n)));
            break;
        case 13:
            xt(t, e), gt(e), e.child.flags & 8192 && e.memoizedState !== null != (s !== null && s.memoizedState !== null) && (Mi = St()), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, Ti(e, n)));
            break;
        case 22:
            o = e.memoizedState !== null;
            var j = s !== null && s.memoizedState !== null, C = ws, R = Ke;
            if (ws = C || o, Ke = R || j, xt(t, e), Ke = R, ws = C, gt(e), n & 8192)
                e: for (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, o && (s === null || j || ws || Ke || Ta(e)), s = null, t = e;;) {
                    if (t.tag === 5 || t.tag === 26) {
                        if (s === null) {
                            j = s = t;
                            try {
                                if (u = j.stateNode, o)
                                    f = u.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                                else {
                                    p = j.stateNode;
                                    var B = j.memoizedProps.style, E = B != null && B.hasOwnProperty("display") ? B.display : null;
                                    p.style.display = E == null || typeof E == "boolean" ? "" : ("" + E).trim();
                                }
                            }
                            catch (J) {
                                ke(j, j.return, J);
                            }
                        }
                    }
                    else if (t.tag === 6) {
                        if (s === null) {
                            j = t;
                            try {
                                j.stateNode.nodeValue = o ? "" : j.memoizedProps;
                            }
                            catch (J) {
                                ke(j, j.return, J);
                            }
                        }
                    }
                    else if (t.tag === 18) {
                        if (s === null) {
                            j = t;
                            try {
                                var z = j.stateNode;
                                o ? Dm(z, !0) : Dm(j.stateNode, !1);
                            }
                            catch (J) {
                                ke(j, j.return, J);
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
            n & 4 && (n = e.updateQueue, n !== null && (s = n.retryQueue, s !== null && (n.retryQueue = null, Ti(e, s))));
            break;
        case 19:
            xt(t, e), gt(e), n & 4 && (n = e.updateQueue, n !== null && (e.updateQueue = null, Ti(e, n)));
            break;
        case 30: break;
        case 21: break;
        default: xt(t, e), gt(e);
    } }
    function gt(e) { var t = e.flags; if (t & 2) {
        try {
            for (var s, n = e.return; n !== null;) {
                if (qh(n)) {
                    s = n;
                    break;
                }
                n = n.return;
            }
            if (s == null)
                throw Error(c(160));
            switch (s.tag) {
                case 27:
                    var o = s.stateNode, u = bo(e);
                    Ci(e, u, o);
                    break;
                case 5:
                    var f = s.stateNode;
                    s.flags & 32 && (Qa(f, ""), s.flags &= -33);
                    var p = bo(e);
                    Ci(e, p, f);
                    break;
                case 3:
                case 4:
                    var j = s.stateNode.containerInfo, C = bo(e);
                    vo(e, C, j);
                    break;
                default: throw Error(c(161));
            }
        }
        catch (R) {
            ke(e, e.return, R);
        }
        e.flags &= -3;
    } t & 4096 && (e.flags &= -4097); }
    function Yh(e) { if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null;) {
            var t = e;
            Yh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
        } }
    function As(e, t) { if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null;)
            Lh(e, t.alternate, t), t = t.sibling; }
    function Ta(e) { for (e = e.child; e !== null;) {
        var t = e;
        switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                Zs(4, t, t.return), Ta(t);
                break;
            case 1:
                rs(t, t.return);
                var s = t.stateNode;
                typeof s.componentWillUnmount == "function" && Dh(t, t.return, s), Ta(t);
                break;
            case 27: pn(t.stateNode);
            case 26:
            case 5:
                rs(t, t.return), Ta(t);
                break;
            case 22:
                t.memoizedState === null && Ta(t);
                break;
            case 30:
                Ta(t);
                break;
            default: Ta(t);
        }
        e = e.sibling;
    } }
    function ks(e, t, s) { for (s = s && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null;) {
        var n = t.alternate, o = e, u = t, f = u.flags;
        switch (u.tag) {
            case 0:
            case 11:
            case 15:
                ks(o, u, s), ln(4, u);
                break;
            case 1:
                if (ks(o, u, s), n = u, o = n.stateNode, typeof o.componentDidMount == "function")
                    try {
                        o.componentDidMount();
                    }
                    catch (C) {
                        ke(n, n.return, C);
                    }
                if (n = u, o = n.updateQueue, o !== null) {
                    var p = n.stateNode;
                    try {
                        var j = o.shared.hiddenCallbacks;
                        if (j !== null)
                            for (o.shared.hiddenCallbacks = null, o = 0; o < j.length; o++)
                                Nf(j[o], p);
                    }
                    catch (C) {
                        ke(n, n.return, C);
                    }
                }
                s && f & 64 && zh(u), nn(u, u.return);
                break;
            case 27: Bh(u);
            case 26:
            case 5:
                ks(o, u, s), s && n === null && f & 4 && Rh(u), nn(u, u.return);
                break;
            case 12:
                ks(o, u, s);
                break;
            case 31:
                ks(o, u, s), s && f & 4 && Qh(o, u);
                break;
            case 13:
                ks(o, u, s), s && f & 4 && Gh(o, u);
                break;
            case 22:
                u.memoizedState === null && ks(o, u, s), nn(u, u.return);
                break;
            case 30: break;
            default: ks(o, u, s);
        }
        t = t.sibling;
    } }
    function No(e, t) { var s = null; e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (s = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== s && (e != null && e.refCount++, s != null && Yl(s)); }
    function wo(e, t) { e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Yl(e)); }
    function Pt(e, t, s, n) { if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;)
            Xh(e, t, s, n), t = t.sibling; }
    function Xh(e, t, s, n) { var o = t.flags; switch (t.tag) {
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
                    ke(t, t.return, j);
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
            u = t.stateNode, f = t.alternate, t.memoizedState !== null ? u._visibility & 2 ? Pt(e, t, s, n) : rn(e, t) : u._visibility & 2 ? Pt(e, t, s, n) : (u._visibility |= 2, cl(e, t, s, n, (t.subtreeFlags & 10256) !== 0 || !1)), o & 2048 && No(f, t);
            break;
        case 24:
            Pt(e, t, s, n), o & 2048 && wo(t.alternate, t);
            break;
        default: Pt(e, t, s, n);
    } }
    function cl(e, t, s, n, o) { for (o = o && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null;) {
        var u = e, f = t, p = s, j = n, C = f.flags;
        switch (f.tag) {
            case 0:
            case 11:
            case 15:
                cl(u, f, p, j, o), ln(8, f);
                break;
            case 23: break;
            case 22:
                var R = f.stateNode;
                f.memoizedState !== null ? R._visibility & 2 ? cl(u, f, p, j, o) : rn(u, f) : (R._visibility |= 2, cl(u, f, p, j, o)), o && C & 2048 && No(f.alternate, f);
                break;
            case 24:
                cl(u, f, p, j, o), o && C & 2048 && wo(f.alternate, f);
                break;
            default: cl(u, f, p, j, o);
        }
        t = t.sibling;
    } }
    function rn(e, t) { if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;) {
            var s = e, n = t, o = n.flags;
            switch (n.tag) {
                case 22:
                    rn(s, n), o & 2048 && No(n.alternate, n);
                    break;
                case 24:
                    rn(s, n), o & 2048 && wo(n.alternate, n);
                    break;
                default: rn(s, n);
            }
            t = t.sibling;
        } }
    var cn = 8192;
    function ol(e, t, s) { if (e.subtreeFlags & cn)
        for (e = e.child; e !== null;)
            Zh(e, t, s), e = e.sibling; }
    function Zh(e, t, s) { switch (e.tag) {
        case 26:
            ol(e, t, s), e.flags & cn && e.memoizedState !== null && qy(s, It, e.memoizedState, e.memoizedProps);
            break;
        case 5:
            ol(e, t, s);
            break;
        case 3:
        case 4:
            var n = It;
            It = Qi(e.stateNode.containerInfo), ol(e, t, s), It = n;
            break;
        case 22:
            e.memoizedState === null && (n = e.alternate, n !== null && n.memoizedState !== null ? (n = cn, cn = 16777216, ol(e, t, s), cn = n) : ol(e, t, s));
            break;
        default: ol(e, t, s);
    } }
    function Jh(e) { var t = e.alternate; if (t !== null && (e = t.child, e !== null)) {
        t.child = null;
        do
            t = e.sibling, e.sibling = null, e = t;
        while (e !== null);
    } }
    function on(e) { var t = e.deletions; if ((e.flags & 16) !== 0) {
        if (t !== null)
            for (var s = 0; s < t.length; s++) {
                var n = t[s];
                We = n, $h(n, e);
            }
        Jh(e);
    } if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null;)
            Fh(e), e = e.sibling; }
    function Fh(e) { switch (e.tag) {
        case 0:
        case 11:
        case 15:
            on(e), e.flags & 2048 && Zs(9, e, e.return);
            break;
        case 3:
            on(e);
            break;
        case 12:
            on(e);
            break;
        case 22:
            var t = e.stateNode;
            e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ei(e)) : on(e);
            break;
        default: on(e);
    } }
    function Ei(e) { var t = e.deletions; if ((e.flags & 16) !== 0) {
        if (t !== null)
            for (var s = 0; s < t.length; s++) {
                var n = t[s];
                We = n, $h(n, e);
            }
        Jh(e);
    } for (e = e.child; e !== null;) {
        switch (t = e, t.tag) {
            case 0:
            case 11:
            case 15:
                Zs(8, t, t.return), Ei(t);
                break;
            case 22:
                s = t.stateNode, s._visibility & 2 && (s._visibility &= -3, Ei(t));
                break;
            default: Ei(t);
        }
        e = e.sibling;
    } }
    function $h(e, t) { for (; We !== null;) {
        var s = We;
        switch (s.tag) {
            case 0:
            case 11:
            case 15:
                Zs(8, s, t);
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
            n.return = s, We = n;
        else
            e: for (s = e; We !== null;) {
                n = We;
                var o = n.sibling, u = n.return;
                if (Hh(n), n === s) {
                    We = null;
                    break e;
                }
                if (o !== null) {
                    o.return = u, We = o;
                    break e;
                }
                We = u;
            }
    } }
    var W0 = { getCacheForType: function (e) { var t = at(Ve), s = t.data.get(e); return s === void 0 && (s = e(), t.data.set(e, s)), s; }, cacheSignal: function () { return at(Ve).controller.signal; } }, I0 = typeof WeakMap == "function" ? WeakMap : Map, Se = 0, _e = null, de = null, pe = 0, Ae = 0, _t = null, Js = !1, ul = !1, So = !1, Cs = 0, Be = 0, Fs = 0, Ea = 0, Ao = 0, Ot = 0, dl = 0, un = null, yt = null, ko = !1, Mi = 0, Wh = 0, _i = 1 / 0, Oi = null, $s = null, Ze = 0, Ws = null, fl = null, Ts = 0, Co = 0, To = null, Ih = null, dn = 0, Eo = null;
    function zt() { return (Se & 2) !== 0 && pe !== 0 ? pe & -pe : O.T !== null ? Ro() : hd(); }
    function Ph() { if (Ot === 0)
        if ((pe & 536870912) === 0 || ye) {
            var e = Hn;
            Hn <<= 1, (Hn & 3932160) === 0 && (Hn = 262144), Ot = e;
        }
        else
            Ot = 536870912; return e = Et.current, e !== null && (e.flags |= 32), Ot; }
    function bt(e, t, s) { (e === _e && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null) && (hl(e, 0), Is(e, pe, Ot, !1)), _l(e, s), ((Se & 2) === 0 || e !== _e) && (e === _e && ((Se & 2) === 0 && (Ea |= s), Be === 4 && Is(e, pe, Ot, !1)), cs(e)); }
    function em(e, t, s) { if ((Se & 6) !== 0)
        throw Error(c(327)); var n = !s && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Ml(e, t), o = n ? ty(e, t) : _o(e, t, !0), u = n; do {
        if (o === 0) {
            ul && !n && Is(e, t, 0, !1);
            break;
        }
        else {
            if (s = e.current.alternate, u && !P0(s)) {
                o = _o(e, t, !1), u = !1;
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
                        if (j && (hl(p, f).flags |= 256), f = _o(p, f, !1), f !== 2) {
                            if (So && !j) {
                                p.errorRecoveryDisabledLanes |= u, Ea |= u, o = 4;
                                break e;
                            }
                            u = yt, yt = o, u !== null && (yt === null ? yt = u : yt.push.apply(yt, u));
                        }
                        o = f;
                    }
                    if (u = !1, o !== 2)
                        continue;
                }
            }
            if (o === 1) {
                hl(e, 0), Is(e, t, 0, !0);
                break;
            }
            e: {
                switch (n = e, u = o, u) {
                    case 0:
                    case 1: throw Error(c(345));
                    case 4: if ((t & 4194048) !== t)
                        break;
                    case 6:
                        Is(n, t, Ot, !Js);
                        break e;
                    case 2:
                        yt = null;
                        break;
                    case 3:
                    case 5: break;
                    default: throw Error(c(329));
                }
                if ((t & 62914560) === t && (o = Mi + 300 - St(), 10 < o)) {
                    if (Is(n, t, Ot, !Js), Qn(n, 0, !0) !== 0)
                        break e;
                    Ts = t, n.timeoutHandle = _m(tm.bind(null, n, s, yt, Oi, ko, t, Ot, Ea, dl, Js, u, "Throttled", -0, 0), o);
                    break e;
                }
                tm(n, s, yt, Oi, ko, t, Ot, Ea, dl, Js, u, null, -0, 0);
            }
        }
        break;
    } while (!0); cs(e); }
    function tm(e, t, s, n, o, u, f, p, j, C, R, B, E, z) { if (e.timeoutHandle = -1, B = t.subtreeFlags, B & 8192 || (B & 16785408) === 16785408) {
        B = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: !0, waitingForViewTransition: !1, unsuspend: hs }, Zh(t, u, B);
        var J = (u & 62914560) === u ? Mi - St() : (u & 4194048) === u ? Wh - St() : 0;
        if (J = By(B, J), J !== null) {
            Ts = u, e.cancelPendingCommit = J(om.bind(null, e, t, u, s, n, o, f, p, j, R, B, null, E, z)), Is(e, u, f, !C);
            return;
        }
    } om(e, t, u, s, n, o, f, p, j); }
    function P0(e) { for (var t = e;;) {
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
    function Is(e, t, s, n) { t &= ~Ao, t &= ~Ea, e.suspendedLanes |= t, e.pingedLanes &= ~t, n && (e.warmLanes |= t), n = e.expirationTimes; for (var o = t; 0 < o;) {
        var u = 31 - kt(o), f = 1 << u;
        n[u] = -1, o &= ~f;
    } s !== 0 && ud(e, s, t); }
    function zi() { return (Se & 6) === 0 ? (fn(0), !1) : !0; }
    function Mo() { if (de !== null) {
        if (Ae === 0)
            var e = de.return;
        else
            e = de, gs = va = null, Yc(e), al = null, Zl = 0, e = de;
        for (; e !== null;)
            Oh(e.alternate, e), e = e.return;
        de = null;
    } }
    function hl(e, t) { var s = e.timeoutHandle; s !== -1 && (e.timeoutHandle = -1, by(s)), s = e.cancelPendingCommit, s !== null && (e.cancelPendingCommit = null, s()), Ts = 0, Mo(), _e = e, de = s = ps(e.current, null), pe = t, Ae = 0, _t = null, Js = !1, ul = Ml(e, t), So = !1, dl = Ot = Ao = Ea = Fs = Be = 0, yt = un = null, ko = !1, (t & 8) !== 0 && (t |= t & 32); var n = e.entangledLanes; if (n !== 0)
        for (e = e.entanglements, n &= t; 0 < n;) {
            var o = 31 - kt(n), u = 1 << o;
            t |= e[o], n &= ~u;
        } return Cs = t, ei(), s; }
    function sm(e, t) { le = null, O.H = tn, t === sl || t === ci ? (t = yf(), Ae = 3) : t === zc ? (t = yf(), Ae = 4) : Ae = t === ro ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, _t = t, de === null && (Be = 1, Ni(e, Ht(t, e.current))); }
    function am() { var e = Et.current; return e === null ? !0 : (pe & 4194048) === pe ? Kt === null : (pe & 62914560) === pe || (pe & 536870912) !== 0 ? e === Kt : !1; }
    function lm() { var e = O.H; return O.H = tn, e === null ? tn : e; }
    function nm() { var e = O.A; return O.A = W0, e; }
    function Di() { Be = 4, Js || (pe & 4194048) !== pe && Et.current !== null || (ul = !0), (Fs & 134217727) === 0 && (Ea & 134217727) === 0 || _e === null || Is(_e, pe, Ot, !1); }
    function _o(e, t, s) { var n = Se; Se |= 2; var o = lm(), u = nm(); (_e !== e || pe !== t) && (Oi = null, hl(e, t)), t = !1; var f = Be; e: do
        try {
            if (Ae !== 0 && de !== null) {
                var p = de, j = _t;
                switch (Ae) {
                    case 8:
                        Mo(), f = 6;
                        break e;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        Et.current === null && (t = !0);
                        var C = Ae;
                        if (Ae = 0, _t = null, ml(e, p, j, C), s && ul) {
                            f = 0;
                            break e;
                        }
                        break;
                    default: C = Ae, Ae = 0, _t = null, ml(e, p, j, C);
                }
            }
            ey(), f = Be;
            break;
        }
        catch (R) {
            sm(e, R);
        }
    while (!0); return t && e.shellSuspendCounter++, gs = va = null, Se = n, O.H = o, O.A = u, de === null && (_e = null, pe = 0, ei()), f; }
    function ey() { for (; de !== null;)
        im(de); }
    function ty(e, t) { var s = Se; Se |= 2; var n = lm(), o = nm(); _e !== e || pe !== t ? (Oi = null, _i = St() + 500, hl(e, t)) : ul = Ml(e, t); e: do
        try {
            if (Ae !== 0 && de !== null) {
                t = de;
                var u = _t;
                t: switch (Ae) {
                    case 1:
                        Ae = 0, _t = null, ml(e, t, u, 1);
                        break;
                    case 2:
                    case 9:
                        if (xf(u)) {
                            Ae = 0, _t = null, rm(t);
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
                        xf(u) ? (Ae = 0, _t = null, rm(t)) : (Ae = 0, _t = null, ml(e, t, u, 7));
                        break;
                    case 5:
                        var f = null;
                        switch (de.tag) {
                            case 26: f = de.memoizedState;
                            case 5:
                            case 27:
                                var p = de;
                                if (f ? Xm(f) : p.stateNode.complete) {
                                    Ae = 0, _t = null;
                                    var j = p.sibling;
                                    if (j !== null)
                                        de = j;
                                    else {
                                        var C = p.return;
                                        C !== null ? (de = C, Ri(C)) : de = null;
                                    }
                                    break t;
                                }
                        }
                        Ae = 0, _t = null, ml(e, t, u, 5);
                        break;
                    case 6:
                        Ae = 0, _t = null, ml(e, t, u, 6);
                        break;
                    case 8:
                        Mo(), Be = 6;
                        break e;
                    default: throw Error(c(462));
                }
            }
            sy();
            break;
        }
        catch (R) {
            sm(e, R);
        }
    while (!0); return gs = va = null, O.H = n, O.A = o, Se = s, de !== null ? 0 : (_e = null, pe = 0, ei(), Be); }
    function sy() { for (; de !== null && !Ag();)
        im(de); }
    function im(e) { var t = Mh(e.alternate, e, Cs); e.memoizedProps = e.pendingProps, t === null ? Ri(e) : de = t; }
    function rm(e) { var t = e, s = t.alternate; switch (t.tag) {
        case 15:
        case 0:
            t = Sh(s, t, t.pendingProps, t.type, void 0, pe);
            break;
        case 11:
            t = Sh(s, t, t.pendingProps, t.type.render, t.ref, pe);
            break;
        case 5: Yc(t);
        default: Oh(s, t), t = de = lf(t, Cs), t = Mh(s, t, Cs);
    } e.memoizedProps = e.pendingProps, t === null ? Ri(e) : de = t; }
    function ml(e, t, s, n) { gs = va = null, Yc(t), al = null, Zl = 0; var o = t.return; try {
        if (K0(e, o, t, s, pe)) {
            Be = 1, Ni(e, Ht(s, e.current)), de = null;
            return;
        }
    }
    catch (u) {
        if (o !== null)
            throw de = o, u;
        Be = 1, Ni(e, Ht(s, e.current)), de = null;
        return;
    } t.flags & 32768 ? (ye || n === 1 ? e = !0 : ul || (pe & 536870912) !== 0 ? e = !1 : (Js = e = !0, (n === 2 || n === 9 || n === 3 || n === 6) && (n = Et.current, n !== null && n.tag === 13 && (n.flags |= 16384))), cm(t, e)) : Ri(t); }
    function Ri(e) { var t = e; do {
        if ((t.flags & 32768) !== 0) {
            cm(t, Js);
            return;
        }
        e = t.return;
        var s = Z0(t.alternate, t, Cs);
        if (s !== null) {
            de = s;
            return;
        }
        if (t = t.sibling, t !== null) {
            de = t;
            return;
        }
        de = t = e;
    } while (t !== null); Be === 0 && (Be = 5); }
    function cm(e, t) { do {
        var s = J0(e.alternate, e);
        if (s !== null) {
            s.flags &= 32767, de = s;
            return;
        }
        if (s = e.return, s !== null && (s.flags |= 32768, s.subtreeFlags = 0, s.deletions = null), !t && (e = e.sibling, e !== null)) {
            de = e;
            return;
        }
        de = e = s;
    } while (e !== null); Be = 6, de = null; }
    function om(e, t, s, n, o, u, f, p, j) { e.cancelPendingCommit = null; do
        qi();
    while (Ze !== 0); if ((Se & 6) !== 0)
        throw Error(c(327)); if (t !== null) {
        if (t === e.current)
            throw Error(c(177));
        if (u = t.lanes | t.childLanes, u |= yc, Rg(e, s, u, f, p, j), e === _e && (de = _e = null, pe = 0), fl = t, Ws = e, Ts = s, Co = u, To = o, Ih = n, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, iy(Un, function () { return mm(), null; })) : (e.callbackNode = null, e.callbackPriority = 0), n = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || n) {
            n = O.T, O.T = null, o = K.p, K.p = 2, f = Se, Se |= 4;
            try {
                F0(e, t, s);
            }
            finally {
                Se = f, K.p = o, O.T = n;
            }
        }
        Ze = 1, um(), dm(), fm();
    } }
    function um() { if (Ze === 1) {
        Ze = 0;
        var e = Ws, t = fl, s = (t.flags & 13878) !== 0;
        if ((t.subtreeFlags & 13878) !== 0 || s) {
            s = O.T, O.T = null;
            var n = K.p;
            K.p = 2;
            var o = Se;
            Se |= 4;
            try {
                Kh(t, e);
                var u = Go, f = Fd(e.containerInfo), p = u.focusedElem, j = u.selectionRange;
                if (f !== p && p && p.ownerDocument && Jd(p.ownerDocument.documentElement, p)) {
                    if (j !== null && hc(p)) {
                        var C = j.start, R = j.end;
                        if (R === void 0 && (R = C), "selectionStart" in p)
                            p.selectionStart = C, p.selectionEnd = Math.min(R, p.value.length);
                        else {
                            var B = p.ownerDocument || document, E = B && B.defaultView || window;
                            if (E.getSelection) {
                                var z = E.getSelection(), J = p.textContent.length, te = Math.min(j.start, J), Ee = j.end === void 0 ? te : Math.min(j.end, J);
                                !z.extend && te > Ee && (f = Ee, Ee = te, te = f);
                                var S = Zd(p, te), w = Zd(p, Ee);
                                if (S && w && (z.rangeCount !== 1 || z.anchorNode !== S.node || z.anchorOffset !== S.offset || z.focusNode !== w.node || z.focusOffset !== w.offset)) {
                                    var k = B.createRange();
                                    k.setStart(S.node, S.offset), z.removeAllRanges(), te > Ee ? (z.addRange(k), z.extend(w.node, w.offset)) : (k.setEnd(w.node, w.offset), z.addRange(k));
                                }
                            }
                        }
                    }
                    for (B = [], z = p; z = z.parentNode;)
                        z.nodeType === 1 && B.push({ element: z, left: z.scrollLeft, top: z.scrollTop });
                    for (typeof p.focus == "function" && p.focus(), p = 0; p < B.length; p++) {
                        var q = B[p];
                        q.element.scrollLeft = q.left, q.element.scrollTop = q.top;
                    }
                }
                Ji = !!Qo, Go = Qo = null;
            }
            finally {
                Se = o, K.p = n, O.T = s;
            }
        }
        e.current = t, Ze = 2;
    } }
    function dm() { if (Ze === 2) {
        Ze = 0;
        var e = Ws, t = fl, s = (t.flags & 8772) !== 0;
        if ((t.subtreeFlags & 8772) !== 0 || s) {
            s = O.T, O.T = null;
            var n = K.p;
            K.p = 2;
            var o = Se;
            Se |= 4;
            try {
                Lh(e, t.alternate, t);
            }
            finally {
                Se = o, K.p = n, O.T = s;
            }
        }
        Ze = 3;
    } }
    function fm() { if (Ze === 4 || Ze === 3) {
        Ze = 0, kg();
        var e = Ws, t = fl, s = Ts, n = Ih;
        (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Ze = 5 : (Ze = 0, fl = Ws = null, hm(e, e.pendingLanes));
        var o = e.pendingLanes;
        if (o === 0 && ($s = null), Jr(s), t = t.stateNode, At && typeof At.onCommitFiberRoot == "function")
            try {
                At.onCommitFiberRoot(El, t, void 0, (t.current.flags & 128) === 128);
            }
            catch { }
        if (n !== null) {
            t = O.T, o = K.p, K.p = 2, O.T = null;
            try {
                for (var u = e.onRecoverableError, f = 0; f < n.length; f++) {
                    var p = n[f];
                    u(p.value, { componentStack: p.stack });
                }
            }
            finally {
                O.T = t, K.p = o;
            }
        }
        (Ts & 3) !== 0 && qi(), cs(e), o = e.pendingLanes, (s & 261930) !== 0 && (o & 42) !== 0 ? e === Eo ? dn++ : (dn = 0, Eo = e) : dn = 0, fn(0);
    } }
    function hm(e, t) { (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Yl(t))); }
    function qi() { return um(), dm(), fm(), mm(); }
    function mm() { if (Ze !== 5)
        return !1; var e = Ws, t = Co; Co = 0; var s = Jr(Ts), n = O.T, o = K.p; try {
        K.p = 32 > s ? 32 : s, O.T = null, s = To, To = null;
        var u = Ws, f = Ts;
        if (Ze = 0, fl = Ws = null, Ts = 0, (Se & 6) !== 0)
            throw Error(c(331));
        var p = Se;
        if (Se |= 4, Fh(u.current), Xh(u, u.current, f, s), Se = p, fn(0, !1), At && typeof At.onPostCommitFiberRoot == "function")
            try {
                At.onPostCommitFiberRoot(El, u);
            }
            catch { }
        return !0;
    }
    finally {
        K.p = o, O.T = n, hm(e, t);
    } }
    function pm(e, t, s) { t = Ht(s, t), t = io(e.stateNode, t, 2), e = Ks(e, t, 2), e !== null && (_l(e, 2), cs(e)); }
    function ke(e, t, s) { if (e.tag === 3)
        pm(e, e, s);
    else
        for (; t !== null;) {
            if (t.tag === 3) {
                pm(t, e, s);
                break;
            }
            else if (t.tag === 1) {
                var n = t.stateNode;
                if (typeof t.type.getDerivedStateFromError == "function" || typeof n.componentDidCatch == "function" && ($s === null || !$s.has(n))) {
                    e = Ht(s, e), s = xh(2), n = Ks(t, s, 2), n !== null && (gh(s, n, t, e), _l(n, 2), cs(n));
                    break;
                }
            }
            t = t.return;
        } }
    function Oo(e, t, s) { var n = e.pingCache; if (n === null) {
        n = e.pingCache = new I0;
        var o = new Set;
        n.set(t, o);
    }
    else
        o = n.get(t), o === void 0 && (o = new Set, n.set(t, o)); o.has(s) || (So = !0, o.add(s), e = ay.bind(null, e, t, s), t.then(e, e)); }
    function ay(e, t, s) { var n = e.pingCache; n !== null && n.delete(t), e.pingedLanes |= e.suspendedLanes & s, e.warmLanes &= ~s, _e === e && (pe & s) === s && (Be === 4 || Be === 3 && (pe & 62914560) === pe && 300 > St() - Mi ? (Se & 2) === 0 && hl(e, 0) : Ao |= s, dl === pe && (dl = 0)), cs(e); }
    function xm(e, t) { t === 0 && (t = od()), e = ga(e, t), e !== null && (_l(e, t), cs(e)); }
    function ly(e) { var t = e.memoizedState, s = 0; t !== null && (s = t.retryLane), xm(e, s); }
    function ny(e, t) { var s = 0; switch (e.tag) {
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
    } n !== null && n.delete(t), xm(e, s); }
    function iy(e, t) { return Kr(e, t); }
    var Bi = null, pl = null, zo = !1, Ui = !1, Do = !1, Ps = 0;
    function cs(e) { e !== pl && e.next === null && (pl === null ? Bi = pl = e : pl = pl.next = e), Ui = !0, zo || (zo = !0, cy()); }
    function fn(e, t) { if (!Do && Ui) {
        Do = !0;
        do
            for (var s = !1, n = Bi; n !== null;) {
                if (e !== 0) {
                    var o = n.pendingLanes;
                    if (o === 0)
                        var u = 0;
                    else {
                        var f = n.suspendedLanes, p = n.pingedLanes;
                        u = (1 << 31 - kt(42 | e) + 1) - 1, u &= o & ~(f & ~p), u = u & 201326741 ? u & 201326741 | 1 : u ? u | 2 : 0;
                    }
                    u !== 0 && (s = !0, vm(n, u));
                }
                else
                    u = pe, u = Qn(n, n === _e ? u : 0, n.cancelPendingCommit !== null || n.timeoutHandle !== -1), (u & 3) === 0 || Ml(n, u) || (s = !0, vm(n, u));
                n = n.next;
            }
        while (s);
        Do = !1;
    } }
    function ry() { gm(); }
    function gm() { Ui = zo = !1; var e = 0; Ps !== 0 && yy() && (e = Ps); for (var t = St(), s = null, n = Bi; n !== null;) {
        var o = n.next, u = ym(n, t);
        u === 0 ? (n.next = null, s === null ? Bi = o : s.next = o, o === null && (pl = s)) : (s = n, (e !== 0 || (u & 3) !== 0) && (Ui = !0)), n = o;
    } Ze !== 0 && Ze !== 5 || fn(e), Ps !== 0 && (Ps = 0); }
    function ym(e, t) { for (var s = e.suspendedLanes, n = e.pingedLanes, o = e.expirationTimes, u = e.pendingLanes & -62914561; 0 < u;) {
        var f = 31 - kt(u), p = 1 << f, j = o[f];
        j === -1 ? ((p & s) === 0 || (p & n) !== 0) && (o[f] = Dg(p, t)) : j <= t && (e.expiredLanes |= p), u &= ~p;
    } if (t = _e, s = pe, s = Qn(e, e === t ? s : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), n = e.callbackNode, s === 0 || e === t && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null)
        return n !== null && n !== null && Yr(n), e.callbackNode = null, e.callbackPriority = 0; if ((s & 3) === 0 || Ml(e, s)) {
        if (t = s & -s, t === e.callbackPriority)
            return t;
        switch (n !== null && Yr(n), Jr(s)) {
            case 2:
            case 8:
                s = rd;
                break;
            case 32:
                s = Un;
                break;
            case 268435456:
                s = cd;
                break;
            default: s = Un;
        }
        return n = bm.bind(null, e), s = Kr(s, n), e.callbackPriority = t, e.callbackNode = s, t;
    } return n !== null && n !== null && Yr(n), e.callbackPriority = 2, e.callbackNode = null, 2; }
    function bm(e, t) { if (Ze !== 0 && Ze !== 5)
        return e.callbackNode = null, e.callbackPriority = 0, null; var s = e.callbackNode; if (qi() && e.callbackNode !== s)
        return null; var n = pe; return n = Qn(e, e === _e ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), n === 0 ? null : (em(e, n, t), ym(e, St()), e.callbackNode != null && e.callbackNode === s ? bm.bind(null, e) : null); }
    function vm(e, t) { if (qi())
        return null; em(e, t, !0); }
    function cy() { vy(function () { (Se & 6) !== 0 ? Kr(id, ry) : gm(); }); }
    function Ro() { if (Ps === 0) {
        var e = el;
        e === 0 && (e = Ln, Ln <<= 1, (Ln & 261888) === 0 && (Ln = 256)), Ps = e;
    } return Ps; }
    function jm(e) { return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Xn("" + e); }
    function Nm(e, t) { var s = t.ownerDocument.createElement("input"); return s.name = t.name, s.value = t.value, e.id && s.setAttribute("form", e.id), t.parentNode.insertBefore(s, t), e = new FormData(e), s.parentNode.removeChild(s), e; }
    function oy(e, t, s, n, o) { if (t === "submit" && s && s.stateNode === o) {
        var u = jm((o[ht] || null).action), f = n.submitter;
        f && (t = (t = f[ht] || null) ? jm(t.formAction) : f.getAttribute("formAction"), t !== null && (u = t, f = null));
        var p = new $n("action", "action", null, n, o);
        e.push({ event: p, listeners: [{ instance: null, listener: function () { if (n.defaultPrevented) {
                        if (Ps !== 0) {
                            var j = f ? Nm(o, f) : new FormData(o);
                            eo(s, { pending: !0, data: j, method: o.method, action: u }, null, j);
                        }
                    }
                    else
                        typeof u == "function" && (p.preventDefault(), j = f ? Nm(o, f) : new FormData(o), eo(s, { pending: !0, data: j, method: o.method, action: u }, u, j)); }, currentTarget: o }] });
    } }
    for (var qo = 0; qo < gc.length; qo++) {
        var Bo = gc[qo], uy = Bo.toLowerCase(), dy = Bo[0].toUpperCase() + Bo.slice(1);
        Wt(uy, "on" + dy);
    }
    Wt(Id, "onAnimationEnd"), Wt(Pd, "onAnimationIteration"), Wt(ef, "onAnimationStart"), Wt("dblclick", "onDoubleClick"), Wt("focusin", "onFocus"), Wt("focusout", "onBlur"), Wt(C0, "onTransitionRun"), Wt(T0, "onTransitionStart"), Wt(E0, "onTransitionCancel"), Wt(tf, "onTransitionEnd"), Ha("onMouseEnter", ["mouseout", "mouseover"]), Ha("onMouseLeave", ["mouseout", "mouseover"]), Ha("onPointerEnter", ["pointerout", "pointerover"]), Ha("onPointerLeave", ["pointerout", "pointerover"]), ha("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), ha("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), ha("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), ha("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), ha("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), ha("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var hn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), fy = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(hn));
    function wm(e, t) { t = (t & 4) !== 0; for (var s = 0; s < e.length; s++) {
        var n = e[s], o = n.event;
        n = n.listeners;
        e: {
            var u = void 0;
            if (t)
                for (var f = n.length - 1; 0 <= f; f--) {
                    var p = n[f], j = p.instance, C = p.currentTarget;
                    if (p = p.listener, j !== u && o.isPropagationStopped())
                        break e;
                    u = p, o.currentTarget = C;
                    try {
                        u(o);
                    }
                    catch (R) {
                        Pn(R);
                    }
                    o.currentTarget = null, u = j;
                }
            else
                for (f = 0; f < n.length; f++) {
                    if (p = n[f], j = p.instance, C = p.currentTarget, p = p.listener, j !== u && o.isPropagationStopped())
                        break e;
                    u = p, o.currentTarget = C;
                    try {
                        u(o);
                    }
                    catch (R) {
                        Pn(R);
                    }
                    o.currentTarget = null, u = j;
                }
        }
    } }
    function fe(e, t) { var s = t[Fr]; s === void 0 && (s = t[Fr] = new Set); var n = e + "__bubble"; s.has(n) || (Sm(t, e, 2, !1), s.add(n)); }
    function Uo(e, t, s) { var n = 0; t && (n |= 4), Sm(s, e, n, t); }
    var Li = "_reactListening" + Math.random().toString(36).slice(2);
    function Lo(e) { if (!e[Li]) {
        e[Li] = !0, xd.forEach(function (s) { s !== "selectionchange" && (fy.has(s) || Uo(s, !1, e), Uo(s, !0, e)); });
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[Li] || (t[Li] = !0, Uo("selectionchange", !1, t));
    } }
    function Sm(e, t, s, n) { switch (Pm(t)) {
        case 2:
            var o = Hy;
            break;
        case 8:
            o = Vy;
            break;
        default: o = eu;
    } s = o.bind(null, t, s, e), o = void 0, !lc || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), n ? o !== void 0 ? e.addEventListener(t, s, { capture: !0, passive: o }) : e.addEventListener(t, s, !0) : o !== void 0 ? e.addEventListener(t, s, { passive: o }) : e.addEventListener(t, s, !1); }
    function Ho(e, t, s, n, o) { var u = n; if ((t & 1) === 0 && (t & 2) === 0 && n !== null)
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
                    if (f = Ba(p), f === null)
                        return;
                    if (j = f.tag, j === 5 || j === 6 || j === 26 || j === 27) {
                        n = u = f;
                        continue e;
                    }
                    p = p.parentNode;
                }
            }
            n = n.return;
        } Td(function () { var C = u, R = sc(s), B = []; e: {
        var E = sf.get(e);
        if (E !== void 0) {
            var z = $n, J = e;
            switch (e) {
                case "keypress": if (Jn(s) === 0)
                    break e;
                case "keydown":
                case "keyup":
                    z = n0;
                    break;
                case "focusin":
                    J = "focus", z = cc;
                    break;
                case "focusout":
                    J = "blur", z = cc;
                    break;
                case "beforeblur":
                case "afterblur":
                    z = cc;
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
                    z = _d;
                    break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                    z = Zg;
                    break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                    z = c0;
                    break;
                case Id:
                case Pd:
                case ef:
                    z = $g;
                    break;
                case tf:
                    z = u0;
                    break;
                case "scroll":
                case "scrollend":
                    z = Yg;
                    break;
                case "wheel":
                    z = f0;
                    break;
                case "copy":
                case "cut":
                case "paste":
                    z = Ig;
                    break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                    z = zd;
                    break;
                case "toggle":
                case "beforetoggle": z = m0;
            }
            var te = (t & 4) !== 0, Ee = !te && (e === "scroll" || e === "scrollend"), S = te ? E !== null ? E + "Capture" : null : E;
            te = [];
            for (var w = C, k; w !== null;) {
                var q = w;
                if (k = q.stateNode, q = q.tag, q !== 5 && q !== 26 && q !== 27 || k === null || S === null || (q = Dl(w, S), q != null && te.push(mn(w, q, k))), Ee)
                    break;
                w = w.return;
            }
            0 < te.length && (E = new z(E, J, null, s, R), B.push({ event: E, listeners: te }));
        }
    } if ((t & 7) === 0) {
        e: {
            if (E = e === "mouseover" || e === "pointerover", z = e === "mouseout" || e === "pointerout", E && s !== tc && (J = s.relatedTarget || s.fromElement) && (Ba(J) || J[qa]))
                break e;
            if ((z || E) && (E = R.window === R ? R : (E = R.ownerDocument) ? E.defaultView || E.parentWindow : window, z ? (J = s.relatedTarget || s.toElement, z = C, J = J ? Ba(J) : null, J !== null && (Ee = h(J), te = J.tag, J !== Ee || te !== 5 && te !== 27 && te !== 6) && (J = null)) : (z = null, J = C), z !== J)) {
                if (te = _d, q = "onMouseLeave", S = "onMouseEnter", w = "mouse", (e === "pointerout" || e === "pointerover") && (te = zd, q = "onPointerLeave", S = "onPointerEnter", w = "pointer"), Ee = z == null ? E : zl(z), k = J == null ? E : zl(J), E = new te(q, w + "leave", z, s, R), E.target = Ee, E.relatedTarget = k, q = null, Ba(R) === C && (te = new te(S, w + "enter", J, s, R), te.target = k, te.relatedTarget = Ee, q = te), Ee = q, z && J)
                    t: {
                        for (te = hy, S = z, w = J, k = 0, q = S; q; q = te(q))
                            k++;
                        q = 0;
                        for (var P = w; P; P = te(P))
                            q++;
                        for (; 0 < k - q;)
                            S = te(S), k--;
                        for (; 0 < q - k;)
                            w = te(w), q--;
                        for (; k--;) {
                            if (S === w || w !== null && S === w.alternate) {
                                te = S;
                                break t;
                            }
                            S = te(S), w = te(w);
                        }
                        te = null;
                    }
                else
                    te = null;
                z !== null && Am(B, E, z, te, !1), J !== null && Ee !== null && Am(B, Ee, J, te, !0);
            }
        }
        e: {
            if (E = C ? zl(C) : window, z = E.nodeName && E.nodeName.toLowerCase(), z === "select" || z === "input" && E.type === "file")
                var je = Vd;
            else if (Ld(E))
                if (Qd)
                    je = S0;
                else {
                    je = N0;
                    var W = j0;
                }
            else
                z = E.nodeName, !z || z.toLowerCase() !== "input" || E.type !== "checkbox" && E.type !== "radio" ? C && ec(C.elementType) && (je = Vd) : je = w0;
            if (je && (je = je(e, C))) {
                Hd(B, je, s, R);
                break e;
            }
            W && W(e, E, C), e === "focusout" && C && E.type === "number" && C.memoizedProps.value != null && Pr(E, "number", E.value);
        }
        switch (W = C ? zl(C) : window, e) {
            case "focusin":
                (Ld(W) || W.contentEditable === "true") && (Xa = W, mc = C, Ql = null);
                break;
            case "focusout":
                Ql = mc = Xa = null;
                break;
            case "mousedown":
                pc = !0;
                break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
                pc = !1, $d(B, s, R);
                break;
            case "selectionchange": if (k0)
                break;
            case "keydown":
            case "keyup": $d(B, s, R);
        }
        var ie;
        if (uc)
            e: {
                switch (e) {
                    case "compositionstart":
                        var xe = "onCompositionStart";
                        break e;
                    case "compositionend":
                        xe = "onCompositionEnd";
                        break e;
                    case "compositionupdate":
                        xe = "onCompositionUpdate";
                        break e;
                }
                xe = void 0;
            }
        else
            Ya ? Bd(e, s) && (xe = "onCompositionEnd") : e === "keydown" && s.keyCode === 229 && (xe = "onCompositionStart");
        xe && (Dd && s.locale !== "ko" && (Ya || xe !== "onCompositionStart" ? xe === "onCompositionEnd" && Ya && (ie = Ed()) : (Bs = R, nc = "value" in Bs ? Bs.value : Bs.textContent, Ya = !0)), W = Hi(C, xe), 0 < W.length && (xe = new Od(xe, e, null, s, R), B.push({ event: xe, listeners: W }), ie ? xe.data = ie : (ie = Ud(s), ie !== null && (xe.data = ie)))), (ie = x0 ? g0(e, s) : y0(e, s)) && (xe = Hi(C, "onBeforeInput"), 0 < xe.length && (W = new Od("onBeforeInput", "beforeinput", null, s, R), B.push({ event: W, listeners: xe }), W.data = ie)), oy(B, e, C, s, R);
    } wm(B, t); }); }
    function mn(e, t, s) { return { instance: e, listener: t, currentTarget: s }; }
    function Hi(e, t) { for (var s = t + "Capture", n = []; e !== null;) {
        var o = e, u = o.stateNode;
        if (o = o.tag, o !== 5 && o !== 26 && o !== 27 || u === null || (o = Dl(e, s), o != null && n.unshift(mn(e, o, u)), o = Dl(e, t), o != null && n.push(mn(e, o, u))), e.tag === 3)
            return n;
        e = e.return;
    } return []; }
    function hy(e) { if (e === null)
        return null; do
        e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27); return e || null; }
    function Am(e, t, s, n, o) { for (var u = t._reactName, f = []; s !== null && s !== n;) {
        var p = s, j = p.alternate, C = p.stateNode;
        if (p = p.tag, j !== null && j === n)
            break;
        p !== 5 && p !== 26 && p !== 27 || C === null || (j = C, o ? (C = Dl(s, u), C != null && f.unshift(mn(s, C, j))) : o || (C = Dl(s, u), C != null && f.push(mn(s, C, j)))), s = s.return;
    } f.length !== 0 && e.push({ event: t, listeners: f }); }
    var my = /\r\n?/g, py = /\u0000|\uFFFD/g;
    function km(e) {
        return (typeof e == "string" ? e : "" + e).replace(my, `
`).replace(py, "");
    }
    function Cm(e, t) { return t = km(t), km(e) === t; }
    function Te(e, t, s, n, o, u) { switch (s) {
        case "children":
            typeof n == "string" ? t === "body" || t === "textarea" && n === "" || Qa(e, n) : (typeof n == "number" || typeof n == "bigint") && t !== "body" && Qa(e, "" + n);
            break;
        case "className":
            Kn(e, "class", n);
            break;
        case "tabIndex":
            Kn(e, "tabindex", n);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            Kn(e, s, n);
            break;
        case "style":
            kd(e, n, u);
            break;
        case "data": if (t !== "object") {
            Kn(e, "data", n);
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
            n = Xn("" + n), e.setAttribute(s, n);
            break;
        case "action":
        case "formAction":
            if (typeof n == "function") {
                e.setAttribute(s, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                break;
            }
            else
                typeof u == "function" && (s === "formAction" ? (t !== "input" && Te(e, t, "name", o.name, o, null), Te(e, t, "formEncType", o.formEncType, o, null), Te(e, t, "formMethod", o.formMethod, o, null), Te(e, t, "formTarget", o.formTarget, o, null)) : (Te(e, t, "encType", o.encType, o, null), Te(e, t, "method", o.method, o, null), Te(e, t, "target", o.target, o, null)));
            if (n == null || typeof n == "symbol" || typeof n == "boolean") {
                e.removeAttribute(s);
                break;
            }
            n = Xn("" + n), e.setAttribute(s, n);
            break;
        case "onClick":
            n != null && (e.onclick = hs);
            break;
        case "onScroll":
            n != null && fe("scroll", e);
            break;
        case "onScrollEnd":
            n != null && fe("scrollend", e);
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
            s = Xn("" + n), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", s);
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
            fe("beforetoggle", e), fe("toggle", e), Gn(e, "popover", n);
            break;
        case "xlinkActuate":
            fs(e, "http://www.w3.org/1999/xlink", "xlink:actuate", n);
            break;
        case "xlinkArcrole":
            fs(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", n);
            break;
        case "xlinkRole":
            fs(e, "http://www.w3.org/1999/xlink", "xlink:role", n);
            break;
        case "xlinkShow":
            fs(e, "http://www.w3.org/1999/xlink", "xlink:show", n);
            break;
        case "xlinkTitle":
            fs(e, "http://www.w3.org/1999/xlink", "xlink:title", n);
            break;
        case "xlinkType":
            fs(e, "http://www.w3.org/1999/xlink", "xlink:type", n);
            break;
        case "xmlBase":
            fs(e, "http://www.w3.org/XML/1998/namespace", "xml:base", n);
            break;
        case "xmlLang":
            fs(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", n);
            break;
        case "xmlSpace":
            fs(e, "http://www.w3.org/XML/1998/namespace", "xml:space", n);
            break;
        case "is":
            Gn(e, "is", n);
            break;
        case "innerText":
        case "textContent": break;
        default: (!(2 < s.length) || s[0] !== "o" && s[0] !== "O" || s[1] !== "n" && s[1] !== "N") && (s = Gg.get(s) || s, Gn(e, s, n));
    } }
    function Vo(e, t, s, n, o, u) { switch (s) {
        case "style":
            kd(e, n, u);
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
            typeof n == "string" ? Qa(e, n) : (typeof n == "number" || typeof n == "bigint") && Qa(e, "" + n);
            break;
        case "onScroll":
            n != null && fe("scroll", e);
            break;
        case "onScrollEnd":
            n != null && fe("scrollend", e);
            break;
        case "onClick":
            n != null && (e.onclick = hs);
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref": break;
        case "innerText":
        case "textContent": break;
        default: if (!gd.hasOwnProperty(s))
            e: {
                if (s[0] === "o" && s[1] === "n" && (o = s.endsWith("Capture"), t = s.slice(2, o ? s.length - 7 : void 0), u = e[ht] || null, u = u != null ? u[s] : null, typeof u == "function" && e.removeEventListener(t, u, o), typeof n == "function")) {
                    typeof u != "function" && u !== null && (s in e ? e[s] = null : e.hasAttribute(s) && e.removeAttribute(s)), e.addEventListener(t, n, o);
                    break e;
                }
                s in e ? e[s] = n : n === !0 ? e.setAttribute(s, "") : Gn(e, s, n);
            }
    } }
    function nt(e, t, s) { switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "img":
            fe("error", e), fe("load", e);
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
                            default: Te(e, t, u, f, s, null);
                        }
                }
            o && Te(e, t, "srcSet", s.srcSet, s, null), n && Te(e, t, "src", s.src, s, null);
            return;
        case "input":
            fe("invalid", e);
            var p = u = f = o = null, j = null, C = null;
            for (n in s)
                if (s.hasOwnProperty(n)) {
                    var R = s[n];
                    if (R != null)
                        switch (n) {
                            case "name":
                                o = R;
                                break;
                            case "type":
                                f = R;
                                break;
                            case "checked":
                                j = R;
                                break;
                            case "defaultChecked":
                                C = R;
                                break;
                            case "value":
                                u = R;
                                break;
                            case "defaultValue":
                                p = R;
                                break;
                            case "children":
                            case "dangerouslySetInnerHTML":
                                if (R != null)
                                    throw Error(c(137, t));
                                break;
                            default: Te(e, t, n, R, s, null);
                        }
                }
            Nd(e, u, p, j, C, f, o, !1);
            return;
        case "select":
            fe("invalid", e), n = f = u = null;
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
                        default: Te(e, t, o, p, s, null);
                    }
            t = u, s = f, e.multiple = !!n, t != null ? Va(e, !!n, t, !1) : s != null && Va(e, !!n, s, !0);
            return;
        case "textarea":
            fe("invalid", e), u = o = n = null;
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
                        default: Te(e, t, f, p, s, null);
                    }
            Sd(e, n, o, u);
            return;
        case "option":
            for (j in s)
                if (s.hasOwnProperty(j) && (n = s[j], n != null))
                    switch (j) {
                        case "selected":
                            e.selected = n && typeof n != "function" && typeof n != "symbol";
                            break;
                        default: Te(e, t, j, n, s, null);
                    }
            return;
        case "dialog":
            fe("beforetoggle", e), fe("toggle", e), fe("cancel", e), fe("close", e);
            break;
        case "iframe":
        case "object":
            fe("load", e);
            break;
        case "video":
        case "audio":
            for (n = 0; n < hn.length; n++)
                fe(hn[n], e);
            break;
        case "image":
            fe("error", e), fe("load", e);
            break;
        case "details":
            fe("toggle", e);
            break;
        case "embed":
        case "source":
        case "link": fe("error", e), fe("load", e);
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
            for (C in s)
                if (s.hasOwnProperty(C) && (n = s[C], n != null))
                    switch (C) {
                        case "children":
                        case "dangerouslySetInnerHTML": throw Error(c(137, t));
                        default: Te(e, t, C, n, s, null);
                    }
            return;
        default: if (ec(t)) {
            for (R in s)
                s.hasOwnProperty(R) && (n = s[R], n !== void 0 && Vo(e, t, R, n, s, void 0));
            return;
        }
    } for (p in s)
        s.hasOwnProperty(p) && (n = s[p], n != null && Te(e, t, p, n, s, null)); }
    function xy(e, t, s, n) { switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li": break;
        case "input":
            var o = null, u = null, f = null, p = null, j = null, C = null, R = null;
            for (z in s) {
                var B = s[z];
                if (s.hasOwnProperty(z) && B != null)
                    switch (z) {
                        case "checked": break;
                        case "value": break;
                        case "defaultValue": j = B;
                        default: n.hasOwnProperty(z) || Te(e, t, z, null, n, B);
                    }
            }
            for (var E in n) {
                var z = n[E];
                if (B = s[E], n.hasOwnProperty(E) && (z != null || B != null))
                    switch (E) {
                        case "type":
                            u = z;
                            break;
                        case "name":
                            o = z;
                            break;
                        case "checked":
                            C = z;
                            break;
                        case "defaultChecked":
                            R = z;
                            break;
                        case "value":
                            f = z;
                            break;
                        case "defaultValue":
                            p = z;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (z != null)
                                throw Error(c(137, t));
                            break;
                        default: z !== B && Te(e, t, E, z, n, B);
                    }
            }
            Ir(e, f, p, j, C, R, u, o);
            return;
        case "select":
            z = f = p = E = null;
            for (u in s)
                if (j = s[u], s.hasOwnProperty(u) && j != null)
                    switch (u) {
                        case "value": break;
                        case "multiple": z = j;
                        default: n.hasOwnProperty(u) || Te(e, t, u, null, n, j);
                    }
            for (o in n)
                if (u = n[o], j = s[o], n.hasOwnProperty(o) && (u != null || j != null))
                    switch (o) {
                        case "value":
                            E = u;
                            break;
                        case "defaultValue":
                            p = u;
                            break;
                        case "multiple": f = u;
                        default: u !== j && Te(e, t, o, u, n, j);
                    }
            t = p, s = f, n = z, E != null ? Va(e, !!s, E, !1) : !!n != !!s && (t != null ? Va(e, !!s, t, !0) : Va(e, !!s, s ? [] : "", !1));
            return;
        case "textarea":
            z = E = null;
            for (p in s)
                if (o = s[p], s.hasOwnProperty(p) && o != null && !n.hasOwnProperty(p))
                    switch (p) {
                        case "value": break;
                        case "children": break;
                        default: Te(e, t, p, null, n, o);
                    }
            for (f in n)
                if (o = n[f], u = s[f], n.hasOwnProperty(f) && (o != null || u != null))
                    switch (f) {
                        case "value":
                            E = o;
                            break;
                        case "defaultValue":
                            z = o;
                            break;
                        case "children": break;
                        case "dangerouslySetInnerHTML":
                            if (o != null)
                                throw Error(c(91));
                            break;
                        default: o !== u && Te(e, t, f, o, n, u);
                    }
            wd(e, E, z);
            return;
        case "option":
            for (var J in s)
                if (E = s[J], s.hasOwnProperty(J) && E != null && !n.hasOwnProperty(J))
                    switch (J) {
                        case "selected":
                            e.selected = !1;
                            break;
                        default: Te(e, t, J, null, n, E);
                    }
            for (j in n)
                if (E = n[j], z = s[j], n.hasOwnProperty(j) && E !== z && (E != null || z != null))
                    switch (j) {
                        case "selected":
                            e.selected = E && typeof E != "function" && typeof E != "symbol";
                            break;
                        default: Te(e, t, j, E, n, z);
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
            for (var te in s)
                E = s[te], s.hasOwnProperty(te) && E != null && !n.hasOwnProperty(te) && Te(e, t, te, null, n, E);
            for (C in n)
                if (E = n[C], z = s[C], n.hasOwnProperty(C) && E !== z && (E != null || z != null))
                    switch (C) {
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (E != null)
                                throw Error(c(137, t));
                            break;
                        default: Te(e, t, C, E, n, z);
                    }
            return;
        default: if (ec(t)) {
            for (var Ee in s)
                E = s[Ee], s.hasOwnProperty(Ee) && E !== void 0 && !n.hasOwnProperty(Ee) && Vo(e, t, Ee, void 0, n, E);
            for (R in n)
                E = n[R], z = s[R], !n.hasOwnProperty(R) || E === z || E === void 0 && z === void 0 || Vo(e, t, R, E, n, z);
            return;
        }
    } for (var S in s)
        E = s[S], s.hasOwnProperty(S) && E != null && !n.hasOwnProperty(S) && Te(e, t, S, null, n, E); for (B in n)
        E = n[B], z = s[B], !n.hasOwnProperty(B) || E === z || E == null && z == null || Te(e, t, B, E, n, z); }
    function Tm(e) { switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link": return !0;
        default: return !1;
    } }
    function gy() { if (typeof performance.getEntriesByType == "function") {
        for (var e = 0, t = 0, s = performance.getEntriesByType("resource"), n = 0; n < s.length; n++) {
            var o = s[n], u = o.transferSize, f = o.initiatorType, p = o.duration;
            if (u && p && Tm(f)) {
                for (f = 0, p = o.responseEnd, n += 1; n < s.length; n++) {
                    var j = s[n], C = j.startTime;
                    if (C > p)
                        break;
                    var R = j.transferSize, B = j.initiatorType;
                    R && Tm(B) && (j = j.responseEnd, f += R * (j < p ? 1 : (p - C) / (j - C)));
                }
                if (--n, t += 8 * (u + f) / (o.duration / 1e3), e++, 10 < e)
                    break;
            }
        }
        if (0 < e)
            return t / e / 1e6;
    } return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5; }
    var Qo = null, Go = null;
    function Vi(e) { return e.nodeType === 9 ? e : e.ownerDocument; }
    function Em(e) { switch (e) {
        case "http://www.w3.org/2000/svg": return 1;
        case "http://www.w3.org/1998/Math/MathML": return 2;
        default: return 0;
    } }
    function Mm(e, t) { if (e === 0)
        switch (t) {
            case "svg": return 1;
            case "math": return 2;
            default: return 0;
        } return e === 1 && t === "foreignObject" ? 0 : e; }
    function Ko(e, t) { return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null; }
    var Yo = null;
    function yy() { var e = window.event; return e && e.type === "popstate" ? e === Yo ? !1 : (Yo = e, !0) : (Yo = null, !1); }
    var _m = typeof setTimeout == "function" ? setTimeout : void 0, by = typeof clearTimeout == "function" ? clearTimeout : void 0, Om = typeof Promise == "function" ? Promise : void 0, vy = typeof queueMicrotask == "function" ? queueMicrotask : typeof Om < "u" ? function (e) { return Om.resolve(null).then(e).catch(jy); } : _m;
    function jy(e) { setTimeout(function () { throw e; }); }
    function ea(e) { return e === "head"; }
    function zm(e, t) { var s = t, n = 0; do {
        var o = s.nextSibling;
        if (e.removeChild(s), o && o.nodeType === 8)
            if (s = o.data, s === "/$" || s === "/&") {
                if (n === 0) {
                    e.removeChild(o), bl(t);
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
    } while (s); bl(t); }
    function Dm(e, t) { var s = e; e = 0; do {
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
    function Xo(e) { var t = e.firstChild; for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
        var s = t;
        switch (t = t.nextSibling, s.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
                Xo(s), $r(s);
                continue;
            case "SCRIPT":
            case "STYLE": continue;
            case "LINK": if (s.rel.toLowerCase() === "stylesheet")
                continue;
        }
        e.removeChild(s);
    } }
    function Ny(e, t, s, n) { for (; e.nodeType === 1;) {
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
    function wy(e, t, s) { if (t === "")
        return null; for (; e.nodeType !== 3;)
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !s || (e = Yt(e.nextSibling), e === null))
            return null; return e; }
    function Rm(e, t) { for (; e.nodeType !== 8;)
        if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Yt(e.nextSibling), e === null))
            return null; return e; }
    function Zo(e) { return e.data === "$?" || e.data === "$~"; }
    function Jo(e) { return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading"; }
    function Sy(e, t) { var s = e.ownerDocument; if (e.data === "$~")
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
    var Fo = null;
    function qm(e) { e = e.nextSibling; for (var t = 0; e;) {
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
    function Bm(e) { e = e.previousSibling; for (var t = 0; e;) {
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
    function Um(e, t, s) { switch (t = Vi(s), e) {
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
        e.removeAttributeNode(t[0]); $r(e); }
    var Xt = new Map, Lm = new Set;
    function Qi(e) { return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument; }
    var Es = K.d;
    K.d = { f: Ay, r: ky, D: Cy, C: Ty, L: Ey, m: My, X: Oy, S: _y, M: zy };
    function Ay() { var e = Es.f(), t = zi(); return e || t; }
    function ky(e) { var t = Ua(e); t !== null && t.tag === 5 && t.type === "form" ? sh(t) : Es.r(e); }
    var xl = typeof document > "u" ? null : document;
    function Hm(e, t, s) { var n = xl; if (n && typeof t == "string" && t) {
        var o = Ut(t);
        o = 'link[rel="' + e + '"][href="' + o + '"]', typeof s == "string" && (o += '[crossorigin="' + s + '"]'), Lm.has(o) || (Lm.add(o), e = { rel: e, crossOrigin: s, href: t }, n.querySelector(o) === null && (t = n.createElement("link"), nt(t, "link", e), $e(t), n.head.appendChild(t)));
    } }
    function Cy(e) { Es.D(e), Hm("dns-prefetch", e, null); }
    function Ty(e, t) { Es.C(e, t), Hm("preconnect", e, t); }
    function Ey(e, t, s) { Es.L(e, t, s); var n = xl; if (n && e && t) {
        var o = 'link[rel="preload"][as="' + Ut(t) + '"]';
        t === "image" && s && s.imageSrcSet ? (o += '[imagesrcset="' + Ut(s.imageSrcSet) + '"]', typeof s.imageSizes == "string" && (o += '[imagesizes="' + Ut(s.imageSizes) + '"]')) : o += '[href="' + Ut(e) + '"]';
        var u = o;
        switch (t) {
            case "style":
                u = gl(e);
                break;
            case "script": u = yl(e);
        }
        Xt.has(u) || (e = b({ rel: "preload", href: t === "image" && s && s.imageSrcSet ? void 0 : e, as: t }, s), Xt.set(u, e), n.querySelector(o) !== null || t === "style" && n.querySelector(xn(u)) || t === "script" && n.querySelector(gn(u)) || (t = n.createElement("link"), nt(t, "link", e), $e(t), n.head.appendChild(t)));
    } }
    function My(e, t) { Es.m(e, t); var s = xl; if (s && e) {
        var n = t && typeof t.as == "string" ? t.as : "script", o = 'link[rel="modulepreload"][as="' + Ut(n) + '"][href="' + Ut(e) + '"]', u = o;
        switch (n) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script": u = yl(e);
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
            n = s.createElement("link"), nt(n, "link", e), $e(n), s.head.appendChild(n);
        }
    } }
    function _y(e, t, s) { Es.S(e, t, s); var n = xl; if (n && e) {
        var o = La(n).hoistableStyles, u = gl(e);
        t = t || "default";
        var f = o.get(u);
        if (!f) {
            var p = { loading: 0, preload: null };
            if (f = n.querySelector(xn(u)))
                p.loading = 5;
            else {
                e = b({ rel: "stylesheet", href: e, "data-precedence": t }, s), (s = Xt.get(u)) && $o(e, s);
                var j = f = n.createElement("link");
                $e(j), nt(j, "link", e), j._p = new Promise(function (C, R) { j.onload = C, j.onerror = R; }), j.addEventListener("load", function () { p.loading |= 1; }), j.addEventListener("error", function () { p.loading |= 2; }), p.loading |= 4, Gi(f, t, n);
            }
            f = { type: "stylesheet", instance: f, count: 1, state: p }, o.set(u, f);
        }
    } }
    function Oy(e, t) { Es.X(e, t); var s = xl; if (s && e) {
        var n = La(s).hoistableScripts, o = yl(e), u = n.get(o);
        u || (u = s.querySelector(gn(o)), u || (e = b({ src: e, async: !0 }, t), (t = Xt.get(o)) && Wo(e, t), u = s.createElement("script"), $e(u), nt(u, "link", e), s.head.appendChild(u)), u = { type: "script", instance: u, count: 1, state: null }, n.set(o, u));
    } }
    function zy(e, t) { Es.M(e, t); var s = xl; if (s && e) {
        var n = La(s).hoistableScripts, o = yl(e), u = n.get(o);
        u || (u = s.querySelector(gn(o)), u || (e = b({ src: e, async: !0, type: "module" }, t), (t = Xt.get(o)) && Wo(e, t), u = s.createElement("script"), $e(u), nt(u, "link", e), s.head.appendChild(u)), u = { type: "script", instance: u, count: 1, state: null }, n.set(o, u));
    } }
    function Vm(e, t, s, n) { var o = (o = Ft.current) ? Qi(o) : null; if (!o)
        throw Error(c(446)); switch (e) {
        case "meta":
        case "title": return null;
        case "style": return typeof s.precedence == "string" && typeof s.href == "string" ? (t = gl(s.href), s = La(o).hoistableStyles, n = s.get(t), n || (n = { type: "style", instance: null, count: 0, state: null }, s.set(t, n)), n) : { type: "void", instance: null, count: 0, state: null };
        case "link":
            if (s.rel === "stylesheet" && typeof s.href == "string" && typeof s.precedence == "string") {
                e = gl(s.href);
                var u = La(o).hoistableStyles, f = u.get(e);
                if (f || (o = o.ownerDocument || o, f = { type: "stylesheet", instance: null, count: 0, state: { loading: 0, preload: null } }, u.set(e, f), (u = o.querySelector(xn(e))) && !u._p && (f.instance = u, f.state.loading = 5), Xt.has(e) || (s = { rel: "preload", as: "style", href: s.href, crossOrigin: s.crossOrigin, integrity: s.integrity, media: s.media, hrefLang: s.hrefLang, referrerPolicy: s.referrerPolicy }, Xt.set(e, s), u || Dy(o, e, s, f.state))), t && n === null)
                    throw Error(c(528, ""));
                return f;
            }
            if (t && n !== null)
                throw Error(c(529, ""));
            return null;
        case "script": return t = s.async, s = s.src, typeof s == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = yl(s), s = La(o).hoistableScripts, n = s.get(t), n || (n = { type: "script", instance: null, count: 0, state: null }, s.set(t, n)), n) : { type: "void", instance: null, count: 0, state: null };
        default: throw Error(c(444, e));
    } }
    function gl(e) { return 'href="' + Ut(e) + '"'; }
    function xn(e) { return 'link[rel="stylesheet"][' + e + "]"; }
    function Qm(e) { return b({}, e, { "data-precedence": e.precedence, precedence: null }); }
    function Dy(e, t, s, n) { e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? n.loading = 1 : (t = e.createElement("link"), n.preload = t, t.addEventListener("load", function () { return n.loading |= 1; }), t.addEventListener("error", function () { return n.loading |= 2; }), nt(t, "link", s), $e(t), e.head.appendChild(t)); }
    function yl(e) { return '[src="' + Ut(e) + '"]'; }
    function gn(e) { return "script[async]" + e; }
    function Gm(e, t, s) { if (t.count++, t.instance === null)
        switch (t.type) {
            case "style":
                var n = e.querySelector('style[data-href~="' + Ut(s.href) + '"]');
                if (n)
                    return t.instance = n, $e(n), n;
                var o = b({}, s, { "data-href": s.href, "data-precedence": s.precedence, href: null, precedence: null });
                return n = (e.ownerDocument || e).createElement("style"), $e(n), nt(n, "style", o), Gi(n, s.precedence, e), t.instance = n;
            case "stylesheet":
                o = gl(s.href);
                var u = e.querySelector(xn(o));
                if (u)
                    return t.state.loading |= 4, t.instance = u, $e(u), u;
                n = Qm(s), (o = Xt.get(o)) && $o(n, o), u = (e.ownerDocument || e).createElement("link"), $e(u);
                var f = u;
                return f._p = new Promise(function (p, j) { f.onload = p, f.onerror = j; }), nt(u, "link", n), t.state.loading |= 4, Gi(u, s.precedence, e), t.instance = u;
            case "script": return u = yl(s.src), (o = e.querySelector(gn(u))) ? (t.instance = o, $e(o), o) : (n = s, (o = Xt.get(u)) && (n = b({}, s), Wo(n, o)), e = e.ownerDocument || e, o = e.createElement("script"), $e(o), nt(o, "link", n), e.head.appendChild(o), t.instance = o);
            case "void": return null;
            default: throw Error(c(443, t.type));
        }
    else
        t.type === "stylesheet" && (t.state.loading & 4) === 0 && (n = t.instance, t.state.loading |= 4, Gi(n, s.precedence, e)); return t.instance; }
    function Gi(e, t, s) { for (var n = s.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), o = n.length ? n[n.length - 1] : null, u = o, f = 0; f < n.length; f++) {
        var p = n[f];
        if (p.dataset.precedence === t)
            u = p;
        else if (u !== o)
            break;
    } u ? u.parentNode.insertBefore(e, u.nextSibling) : (t = s.nodeType === 9 ? s.head : s, t.insertBefore(e, t.firstChild)); }
    function $o(e, t) { e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title); }
    function Wo(e, t) { e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity); }
    var Ki = null;
    function Km(e, t, s) { if (Ki === null) {
        var n = new Map, o = Ki = new Map;
        o.set(s, n);
    }
    else
        o = Ki, n = o.get(s), n || (n = new Map, o.set(s, n)); if (n.has(e))
        return n; for (n.set(e, null), s = s.getElementsByTagName(e), o = 0; o < s.length; o++) {
        var u = s[o];
        if (!(u[Ol] || u[tt] || e === "link" && u.getAttribute("rel") === "stylesheet") && u.namespaceURI !== "http://www.w3.org/2000/svg") {
            var f = u.getAttribute(t) || "";
            f = e + f;
            var p = n.get(f);
            p ? p.push(u) : n.set(f, [u]);
        }
    } return n; }
    function Ym(e, t, s) { e = e.ownerDocument || e, e.head.insertBefore(s, t === "title" ? e.querySelector("head > title") : null); }
    function Ry(e, t, s) { if (s === 1 || t.itemProp != null)
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
    function Xm(e) { return !(e.type === "stylesheet" && (e.state.loading & 3) === 0); }
    function qy(e, t, s, n) { if (s.type === "stylesheet" && (typeof n.media != "string" || matchMedia(n.media).matches !== !1) && (s.state.loading & 4) === 0) {
        if (s.instance === null) {
            var o = gl(n.href), u = t.querySelector(xn(o));
            if (u) {
                t = u._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Yi.bind(e), t.then(e, e)), s.state.loading |= 4, s.instance = u, $e(u);
                return;
            }
            u = t.ownerDocument || t, n = Qm(n), (o = Xt.get(o)) && $o(n, o), u = u.createElement("link"), $e(u);
            var f = u;
            f._p = new Promise(function (p, j) { f.onload = p, f.onerror = j; }), nt(u, "link", n), s.instance = u;
        }
        e.stylesheets === null && (e.stylesheets = new Map), e.stylesheets.set(s, t), (t = s.state.preload) && (s.state.loading & 3) === 0 && (e.count++, s = Yi.bind(e), t.addEventListener("load", s), t.addEventListener("error", s));
    } }
    var Io = 0;
    function By(e, t) { return e.stylesheets && e.count === 0 && Zi(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function (s) { var n = setTimeout(function () { if (e.stylesheets && Zi(e, e.stylesheets), e.unsuspend) {
        var u = e.unsuspend;
        e.unsuspend = null, u();
    } }, 6e4 + t); 0 < e.imgBytes && Io === 0 && (Io = 62500 * gy()); var o = setTimeout(function () { if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Zi(e, e.stylesheets), e.unsuspend)) {
        var u = e.unsuspend;
        e.unsuspend = null, u();
    } }, (e.imgBytes > Io ? 50 : 800) + t); return e.unsuspend = s, function () { e.unsuspend = null, clearTimeout(n), clearTimeout(o); }; } : null; }
    function Yi() { if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
        if (this.stylesheets)
            Zi(this, this.stylesheets);
        else if (this.unsuspend) {
            var e = this.unsuspend;
            this.unsuspend = null, e();
        }
    } }
    var Xi = null;
    function Zi(e, t) { e.stylesheets = null, e.unsuspend !== null && (e.count++, Xi = new Map, t.forEach(Uy, e), Xi = null, Yi.call(e)); }
    function Uy(e, t) { if (!(t.state.loading & 4)) {
        var s = Xi.get(e);
        if (s)
            var n = s.get(null);
        else {
            s = new Map, Xi.set(e, s);
            for (var o = e.querySelectorAll("link[data-precedence],style[data-precedence]"), u = 0; u < o.length; u++) {
                var f = o[u];
                (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (s.set(f.dataset.precedence, f), n = f);
            }
            n && s.set(null, n);
        }
        o = t.instance, f = o.getAttribute("data-precedence"), u = s.get(f) || n, u === n && s.set(null, o), s.set(f, o), this.count++, n = Yi.bind(this), o.addEventListener("load", n), o.addEventListener("error", n), u ? u.parentNode.insertBefore(o, u.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(o, e.firstChild)), t.state.loading |= 4;
    } }
    var yn = { $$typeof: X, Provider: null, Consumer: null, _currentValue: L, _currentValue2: L, _threadCount: 0 };
    function Ly(e, t, s, n, o, u, f, p, j) { this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Xr(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Xr(0), this.hiddenUpdates = Xr(null), this.identifierPrefix = n, this.onUncaughtError = o, this.onCaughtError = u, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = j, this.incompleteTransitions = new Map; }
    function Zm(e, t, s, n, o, u, f, p, j, C, R, B) { return e = new Ly(e, t, s, f, j, C, R, B, p), t = 1, u === !0 && (t |= 24), u = Tt(3, null, null, t), e.current = u, u.stateNode = e, t = Mc(), t.refCount++, e.pooledCache = t, t.refCount++, u.memoizedState = { element: n, isDehydrated: s, cache: t }, Dc(u), e; }
    function Jm(e) { return e ? (e = Fa, e) : Fa; }
    function Fm(e, t, s, n, o, u) { o = Jm(o), n.context === null ? n.context = o : n.pendingContext = o, n = Gs(t), n.payload = { element: s }, u = u === void 0 ? null : u, u !== null && (n.callback = u), s = Ks(e, n, t), s !== null && (bt(s, e, t), Fl(s, e, t)); }
    function $m(e, t) { if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
        var s = e.retryLane;
        e.retryLane = s !== 0 && s < t ? s : t;
    } }
    function Po(e, t) { $m(e, t), (e = e.alternate) && $m(e, t); }
    function Wm(e) { if (e.tag === 13 || e.tag === 31) {
        var t = ga(e, 67108864);
        t !== null && bt(t, e, 67108864), Po(e, 67108864);
    } }
    function Im(e) { if (e.tag === 13 || e.tag === 31) {
        var t = zt();
        t = Zr(t);
        var s = ga(e, t);
        s !== null && bt(s, e, t), Po(e, t);
    } }
    var Ji = !0;
    function Hy(e, t, s, n) { var o = O.T; O.T = null; var u = K.p; try {
        K.p = 2, eu(e, t, s, n);
    }
    finally {
        K.p = u, O.T = o;
    } }
    function Vy(e, t, s, n) { var o = O.T; O.T = null; var u = K.p; try {
        K.p = 8, eu(e, t, s, n);
    }
    finally {
        K.p = u, O.T = o;
    } }
    function eu(e, t, s, n) { if (Ji) {
        var o = tu(n);
        if (o === null)
            Ho(e, t, n, Fi, s), ep(e, n);
        else if (Gy(o, e, t, s, n))
            n.stopPropagation();
        else if (ep(e, n), t & 4 && -1 < Qy.indexOf(e)) {
            for (; o !== null;) {
                var u = Ua(o);
                if (u !== null)
                    switch (u.tag) {
                        case 3:
                            if (u = u.stateNode, u.current.memoizedState.isDehydrated) {
                                var f = fa(u.pendingLanes);
                                if (f !== 0) {
                                    var p = u;
                                    for (p.pendingLanes |= 2, p.entangledLanes |= 2; f;) {
                                        var j = 1 << 31 - kt(f);
                                        p.entanglements[1] |= j, f &= ~j;
                                    }
                                    cs(u), (Se & 6) === 0 && (_i = St() + 500, fn(0));
                                }
                            }
                            break;
                        case 31:
                        case 13: p = ga(u, 2), p !== null && bt(p, u, 2), zi(), Po(u, 2);
                    }
                if (u = tu(n), u === null && Ho(e, t, n, Fi, s), u === o)
                    break;
                o = u;
            }
            o !== null && n.stopPropagation();
        }
        else
            Ho(e, t, n, null, s);
    } }
    function tu(e) { return e = sc(e), su(e); }
    var Fi = null;
    function su(e) { if (Fi = null, e = Ba(e), e !== null) {
        var t = h(e);
        if (t === null)
            e = null;
        else {
            var s = t.tag;
            if (s === 13) {
                if (e = m(t), e !== null)
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
    } return Fi = e, null; }
    function Pm(e) { switch (e) {
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
        case "message": switch (Cg()) {
            case id: return 2;
            case rd: return 8;
            case Un:
            case Tg: return 32;
            case cd: return 268435456;
            default: return 32;
        }
        default: return 32;
    } }
    var au = !1, ta = null, sa = null, aa = null, bn = new Map, vn = new Map, la = [], Qy = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function ep(e, t) { switch (e) {
        case "focusin":
        case "focusout":
            ta = null;
            break;
        case "dragenter":
        case "dragleave":
            sa = null;
            break;
        case "mouseover":
        case "mouseout":
            aa = null;
            break;
        case "pointerover":
        case "pointerout":
            bn.delete(t.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture": vn.delete(t.pointerId);
    } }
    function jn(e, t, s, n, o, u) { return e === null || e.nativeEvent !== u ? (e = { blockedOn: t, domEventName: s, eventSystemFlags: n, nativeEvent: u, targetContainers: [o] }, t !== null && (t = Ua(t), t !== null && Wm(t)), e) : (e.eventSystemFlags |= n, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e); }
    function Gy(e, t, s, n, o) { switch (t) {
        case "focusin": return ta = jn(ta, e, t, s, n, o), !0;
        case "dragenter": return sa = jn(sa, e, t, s, n, o), !0;
        case "mouseover": return aa = jn(aa, e, t, s, n, o), !0;
        case "pointerover":
            var u = o.pointerId;
            return bn.set(u, jn(bn.get(u) || null, e, t, s, n, o)), !0;
        case "gotpointercapture": return u = o.pointerId, vn.set(u, jn(vn.get(u) || null, e, t, s, n, o)), !0;
    } return !1; }
    function tp(e) { var t = Ba(e.target); if (t !== null) {
        var s = h(t);
        if (s !== null) {
            if (t = s.tag, t === 13) {
                if (t = m(s), t !== null) {
                    e.blockedOn = t, md(e.priority, function () { Im(s); });
                    return;
                }
            }
            else if (t === 31) {
                if (t = x(s), t !== null) {
                    e.blockedOn = t, md(e.priority, function () { Im(s); });
                    return;
                }
            }
            else if (t === 3 && s.stateNode.current.memoizedState.isDehydrated) {
                e.blockedOn = s.tag === 3 ? s.stateNode.containerInfo : null;
                return;
            }
        }
    } e.blockedOn = null; }
    function $i(e) { if (e.blockedOn !== null)
        return !1; for (var t = e.targetContainers; 0 < t.length;) {
        var s = tu(e.nativeEvent);
        if (s === null) {
            s = e.nativeEvent;
            var n = new s.constructor(s.type, s);
            tc = n, s.target.dispatchEvent(n), tc = null;
        }
        else
            return t = Ua(s), t !== null && Wm(t), e.blockedOn = s, !1;
        t.shift();
    } return !0; }
    function sp(e, t, s) { $i(e) && s.delete(t); }
    function Ky() { au = !1, ta !== null && $i(ta) && (ta = null), sa !== null && $i(sa) && (sa = null), aa !== null && $i(aa) && (aa = null), bn.forEach(sp), vn.forEach(sp); }
    function Wi(e, t) { e.blockedOn === t && (e.blockedOn = null, au || (au = !0, l.unstable_scheduleCallback(l.unstable_NormalPriority, Ky))); }
    var Ii = null;
    function ap(e) { Ii !== e && (Ii = e, l.unstable_scheduleCallback(l.unstable_NormalPriority, function () { Ii === e && (Ii = null); for (var t = 0; t < e.length; t += 3) {
        var s = e[t], n = e[t + 1], o = e[t + 2];
        if (typeof n != "function") {
            if (su(n || s) === null)
                continue;
            break;
        }
        var u = Ua(s);
        u !== null && (e.splice(t, 3), t -= 3, eo(u, { pending: !0, data: o, method: s.method, action: n }, n, o));
    } })); }
    function bl(e) { function t(j) { return Wi(j, e); } ta !== null && Wi(ta, e), sa !== null && Wi(sa, e), aa !== null && Wi(aa, e), bn.forEach(t), vn.forEach(t); for (var s = 0; s < la.length; s++) {
        var n = la[s];
        n.blockedOn === e && (n.blockedOn = null);
    } for (; 0 < la.length && (s = la[0], s.blockedOn === null);)
        tp(s), s.blockedOn === null && la.shift(); if (s = (e.ownerDocument || e).$$reactFormReplay, s != null)
        for (n = 0; n < s.length; n += 3) {
            var o = s[n], u = s[n + 1], f = o[ht] || null;
            if (typeof u == "function")
                f || ap(s);
            else if (f) {
                var p = null;
                if (u && u.hasAttribute("formAction")) {
                    if (o = u, f = u[ht] || null)
                        p = f.formAction;
                    else if (su(o) !== null)
                        continue;
                }
                else
                    p = f.action;
                typeof p == "function" ? s[n + 1] = p : (s.splice(n, 3), n -= 3), ap(s);
            }
        } }
    function lp() { function e(u) { u.canIntercept && u.info === "react-transition" && u.intercept({ handler: function () { return new Promise(function (f) { return o = f; }); }, focusReset: "manual", scroll: "manual" }); } function t() { o !== null && (o(), o = null), n || setTimeout(s, 20); } function s() { if (!n && !navigation.transition) {
        var u = navigation.currentEntry;
        u && u.url != null && navigation.navigate(u.url, { state: u.getState(), info: "react-transition", history: "replace" });
    } } if (typeof navigation == "object") {
        var n = !1, o = null;
        return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(s, 100), function () { n = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), o !== null && (o(), o = null); };
    } }
    function lu(e) { this._internalRoot = e; }
    Pi.prototype.render = lu.prototype.render = function (e) { var t = this._internalRoot; if (t === null)
        throw Error(c(409)); var s = t.current, n = zt(); Fm(s, n, e, t, null, null); }, Pi.prototype.unmount = lu.prototype.unmount = function () { var e = this._internalRoot; if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        Fm(e.current, 2, null, e, null, null), zi(), t[qa] = null;
    } };
    function Pi(e) { this._internalRoot = e; }
    Pi.prototype.unstable_scheduleHydration = function (e) { if (e) {
        var t = hd();
        e = { blockedOn: null, target: e, priority: t };
        for (var s = 0; s < la.length && t !== 0 && t < la[s].priority; s++)
            ;
        la.splice(s, 0, e), s === 0 && tp(e);
    } };
    var np = i.version;
    if (np !== "19.2.3")
        throw Error(c(527, np, "19.2.3"));
    K.findDOMNode = function (e) { var t = e._reactInternals; if (t === void 0)
        throw typeof e.render == "function" ? Error(c(188)) : (e = Object.keys(e).join(","), Error(c(268, e))); return e = y(t), e = e !== null ? v(e) : null, e = e === null ? null : e.stateNode, e; };
    var Yy = { bundleType: 0, version: "19.2.3", rendererPackageName: "react-dom", currentDispatcherRef: O, reconcilerVersion: "19.2.3" };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var er = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!er.isDisabled && er.supportsFiber)
            try {
                El = er.inject(Yy), At = er;
            }
            catch { }
    }
    return Nn.createRoot = function (e, t) { if (!d(e))
        throw Error(c(299)); var s = !1, n = "", o = fh, u = hh, f = mh; return t != null && (t.unstable_strictMode === !0 && (s = !0), t.identifierPrefix !== void 0 && (n = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (u = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = Zm(e, 1, !1, null, null, s, n, null, o, u, f, lp), e[qa] = t.current, Lo(e), new lu(t); }, Nn.hydrateRoot = function (e, t, s) { if (!d(e))
        throw Error(c(299)); var n = !1, o = "", u = fh, f = hh, p = mh, j = null; return s != null && (s.unstable_strictMode === !0 && (n = !0), s.identifierPrefix !== void 0 && (o = s.identifierPrefix), s.onUncaughtError !== void 0 && (u = s.onUncaughtError), s.onCaughtError !== void 0 && (f = s.onCaughtError), s.onRecoverableError !== void 0 && (p = s.onRecoverableError), s.formState !== void 0 && (j = s.formState)), t = Zm(e, 1, !0, t, s ?? null, n, o, j, u, f, p, lp), t.context = Jm(null), s = t.current, n = zt(), n = Zr(n), o = Gs(n), o.callback = null, Ks(s, o, n), s = n, t.current.lanes = s, _l(t, s), cs(t), e[qa] = t.current, Lo(e), new Pi(t); }, Nn.version = "19.2.3", Nn;
}
var op;
function ib() { if (op)
    return nu.exports; op = 1; function l() { if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l);
    }
    catch (i) {
        console.error(i);
    } } return l(), nu.exports = nb(), nu.exports; }
var rb = ib();
const cb = Wy(rb), ds = Object.create(null);
ds.open = "0";
ds.close = "1";
ds.ping = "2";
ds.pong = "3";
ds.message = "4";
ds.upgrade = "5";
ds.noop = "6";
const rr = Object.create(null);
Object.keys(ds).forEach(l => { rr[ds[l]] = l; });
const wu = { type: "error", data: "parser error" }, ex = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", tx = typeof ArrayBuffer == "function", sx = l => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(l) : l && l.buffer instanceof ArrayBuffer, Uu = ({ type: l, data: i }, r, c) => ex && i instanceof Blob ? r ? c(i) : up(i, c) : tx && (i instanceof ArrayBuffer || sx(i)) ? r ? c(i) : up(new Blob([i]), c) : c(ds[l] + (i || "")), up = (l, i) => { const r = new FileReader; return r.onload = function () { const c = r.result.split(",")[1]; i("b" + (c || "")); }, r.readAsDataURL(l); };
function dp(l) { return l instanceof Uint8Array ? l : l instanceof ArrayBuffer ? new Uint8Array(l) : new Uint8Array(l.buffer, l.byteOffset, l.byteLength); }
let cu;
function ob(l, i) { if (ex && l.data instanceof Blob)
    return l.data.arrayBuffer().then(dp).then(i); if (tx && (l.data instanceof ArrayBuffer || sx(l.data)))
    return i(dp(l.data)); Uu(l, !1, r => { cu || (cu = new TextEncoder), i(cu.encode(r)); }); }
const fp = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Cn = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let l = 0; l < fp.length; l++)
    Cn[fp.charCodeAt(l)] = l;
const ub = l => { let i = l.length * .75, r = l.length, c, d = 0, h, m, x, g; l[l.length - 1] === "=" && (i--, l[l.length - 2] === "=" && i--); const y = new ArrayBuffer(i), v = new Uint8Array(y); for (c = 0; c < r; c += 4)
    h = Cn[l.charCodeAt(c)], m = Cn[l.charCodeAt(c + 1)], x = Cn[l.charCodeAt(c + 2)], g = Cn[l.charCodeAt(c + 3)], v[d++] = h << 2 | m >> 4, v[d++] = (m & 15) << 4 | x >> 2, v[d++] = (x & 3) << 6 | g & 63; return y; }, db = typeof ArrayBuffer == "function", Lu = (l, i) => { if (typeof l != "string")
    return { type: "message", data: ax(l, i) }; const r = l.charAt(0); return r === "b" ? { type: "message", data: fb(l.substring(1), i) } : rr[r] ? l.length > 1 ? { type: rr[r], data: l.substring(1) } : { type: rr[r] } : wu; }, fb = (l, i) => { if (db) {
    const r = ub(l);
    return ax(r, i);
}
else
    return { base64: !0, data: l }; }, ax = (l, i) => { switch (i) {
    case "blob": return l instanceof Blob ? l : new Blob([l]);
    case "arraybuffer":
    default: return l instanceof ArrayBuffer ? l : l.buffer;
} }, lx = "", hb = (l, i) => { const r = l.length, c = new Array(r); let d = 0; l.forEach((h, m) => { Uu(h, !1, x => { c[m] = x, ++d === r && i(c.join(lx)); }); }); }, mb = (l, i) => { const r = l.split(lx), c = []; for (let d = 0; d < r.length; d++) {
    const h = Lu(r[d], i);
    if (c.push(h), h.type === "error")
        break;
} return c; };
function pb() { return new TransformStream({ transform(l, i) { ob(l, r => { const c = r.length; let d; if (c < 126)
        d = new Uint8Array(1), new DataView(d.buffer).setUint8(0, c);
    else if (c < 65536) {
        d = new Uint8Array(3);
        const h = new DataView(d.buffer);
        h.setUint8(0, 126), h.setUint16(1, c);
    }
    else {
        d = new Uint8Array(9);
        const h = new DataView(d.buffer);
        h.setUint8(0, 127), h.setBigUint64(1, BigInt(c));
    } l.data && typeof l.data != "string" && (d[0] |= 128), i.enqueue(d), i.enqueue(r); }); } }); }
let ou;
function tr(l) { return l.reduce((i, r) => i + r.length, 0); }
function sr(l, i) { if (l[0].length === i)
    return l.shift(); const r = new Uint8Array(i); let c = 0; for (let d = 0; d < i; d++)
    r[d] = l[0][c++], c === l[0].length && (l.shift(), c = 0); return l.length && c < l[0].length && (l[0] = l[0].slice(c)), r; }
function xb(l, i) { ou || (ou = new TextDecoder); const r = []; let c = 0, d = -1, h = !1; return new TransformStream({ transform(m, x) { for (r.push(m);;) {
        if (c === 0) {
            if (tr(r) < 1)
                break;
            const g = sr(r, 1);
            h = (g[0] & 128) === 128, d = g[0] & 127, d < 126 ? c = 3 : d === 126 ? c = 1 : c = 2;
        }
        else if (c === 1) {
            if (tr(r) < 2)
                break;
            const g = sr(r, 2);
            d = new DataView(g.buffer, g.byteOffset, g.length).getUint16(0), c = 3;
        }
        else if (c === 2) {
            if (tr(r) < 8)
                break;
            const g = sr(r, 8), y = new DataView(g.buffer, g.byteOffset, g.length), v = y.getUint32(0);
            if (v > Math.pow(2, 21) - 1) {
                x.enqueue(wu);
                break;
            }
            d = v * Math.pow(2, 32) + y.getUint32(4), c = 3;
        }
        else {
            if (tr(r) < d)
                break;
            const g = sr(r, d);
            x.enqueue(Lu(h ? g : ou.decode(g), i)), c = 0;
        }
        if (d === 0 || d > l) {
            x.enqueue(wu);
            break;
        }
    } } }); }
const nx = 4;
function Ye(l) { if (l)
    return gb(l); }
function gb(l) { for (var i in Ye.prototype)
    l[i] = Ye.prototype[i]; return l; }
Ye.prototype.on = Ye.prototype.addEventListener = function (l, i) { return this._callbacks = this._callbacks || {}, (this._callbacks["$" + l] = this._callbacks["$" + l] || []).push(i), this; };
Ye.prototype.once = function (l, i) { function r() { this.off(l, r), i.apply(this, arguments); } return r.fn = i, this.on(l, r), this; };
Ye.prototype.off = Ye.prototype.removeListener = Ye.prototype.removeAllListeners = Ye.prototype.removeEventListener = function (l, i) { if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this; var r = this._callbacks["$" + l]; if (!r)
    return this; if (arguments.length == 1)
    return delete this._callbacks["$" + l], this; for (var c, d = 0; d < r.length; d++)
    if (c = r[d], c === i || c.fn === i) {
        r.splice(d, 1);
        break;
    } return r.length === 0 && delete this._callbacks["$" + l], this; };
Ye.prototype.emit = function (l) { this._callbacks = this._callbacks || {}; for (var i = new Array(arguments.length - 1), r = this._callbacks["$" + l], c = 1; c < arguments.length; c++)
    i[c - 1] = arguments[c]; if (r) {
    r = r.slice(0);
    for (var c = 0, d = r.length; c < d; ++c)
        r[c].apply(this, i);
} return this; };
Ye.prototype.emitReserved = Ye.prototype.emit;
Ye.prototype.listeners = function (l) { return this._callbacks = this._callbacks || {}, this._callbacks["$" + l] || []; };
Ye.prototype.hasListeners = function (l) { return !!this.listeners(l).length; };
const Ar = typeof Promise == "function" && typeof Promise.resolve == "function" ? i => Promise.resolve().then(i) : (i, r) => r(i, 0), Zt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), yb = "arraybuffer";
function ix(l, ...i) { return i.reduce((r, c) => (l.hasOwnProperty(c) && (r[c] = l[c]), r), {}); }
const bb = Zt.setTimeout, vb = Zt.clearTimeout;
function kr(l, i) { i.useNativeTimers ? (l.setTimeoutFn = bb.bind(Zt), l.clearTimeoutFn = vb.bind(Zt)) : (l.setTimeoutFn = Zt.setTimeout.bind(Zt), l.clearTimeoutFn = Zt.clearTimeout.bind(Zt)); }
const jb = 1.33;
function Nb(l) { return typeof l == "string" ? wb(l) : Math.ceil((l.byteLength || l.size) * jb); }
function wb(l) { let i = 0, r = 0; for (let c = 0, d = l.length; c < d; c++)
    i = l.charCodeAt(c), i < 128 ? r += 1 : i < 2048 ? r += 2 : i < 55296 || i >= 57344 ? r += 3 : (c++, r += 4); return r; }
function rx() { return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5); }
function Sb(l) { let i = ""; for (let r in l)
    l.hasOwnProperty(r) && (i.length && (i += "&"), i += encodeURIComponent(r) + "=" + encodeURIComponent(l[r])); return i; }
function Ab(l) { let i = {}, r = l.split("&"); for (let c = 0, d = r.length; c < d; c++) {
    let h = r[c].split("=");
    i[decodeURIComponent(h[0])] = decodeURIComponent(h[1]);
} return i; }
class kb extends Error {
    constructor(i, r, c) { super(i), this.description = r, this.context = c, this.type = "TransportError"; }
}
class Hu extends Ye {
    constructor(i) { super(), this.writable = !1, kr(this, i), this.opts = i, this.query = i.query, this.socket = i.socket, this.supportsBinary = !i.forceBase64; }
    onError(i, r, c) { return super.emitReserved("error", new kb(i, r, c)), this; }
    open() { return this.readyState = "opening", this.doOpen(), this; }
    close() { return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this; }
    send(i) { this.readyState === "open" && this.write(i); }
    onOpen() { this.readyState = "open", this.writable = !0, super.emitReserved("open"); }
    onData(i) { const r = Lu(i, this.socket.binaryType); this.onPacket(r); }
    onPacket(i) { super.emitReserved("packet", i); }
    onClose(i) { this.readyState = "closed", super.emitReserved("close", i); }
    pause(i) { }
    createUri(i, r = {}) { return i + "://" + this._hostname() + this._port() + this.opts.path + this._query(r); }
    _hostname() { const i = this.opts.hostname; return i.indexOf(":") === -1 ? i : "[" + i + "]"; }
    _port() { return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : ""; }
    _query(i) { const r = Sb(i); return r.length ? "?" + r : ""; }
}
class Cb extends Hu {
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
        return this.onClose({ description: "transport closed by the server" }), !1; this.onPacket(c); }; mb(i, this.socket.binaryType).forEach(r), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll()); }
    doClose() { const i = () => { this.write([{ type: "close" }]); }; this.readyState === "open" ? i() : this.once("open", i); }
    write(i) { this.writable = !1, hb(i, r => { this.doWrite(r, () => { this.writable = !0, this.emitReserved("drain"); }); }); }
    uri() { const i = this.opts.secure ? "https" : "http", r = this.query || {}; return this.opts.timestampRequests !== !1 && (r[this.opts.timestampParam] = rx()), !this.supportsBinary && !r.sid && (r.b64 = 1), this.createUri(i, r); }
}
let cx = !1;
try {
    cx = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest;
}
catch { }
const Tb = cx;
function Eb() { }
class Mb extends Cb {
    constructor(i) { if (super(i), typeof location < "u") {
        const r = location.protocol === "https:";
        let c = location.port;
        c || (c = r ? "443" : "80"), this.xd = typeof location < "u" && i.hostname !== location.hostname || c !== i.port;
    } }
    doWrite(i, r) { const c = this.request({ method: "POST", data: i }); c.on("success", r), c.on("error", (d, h) => { this.onError("xhr post error", d, h); }); }
    doPoll() { const i = this.request(); i.on("data", this.onData.bind(this)), i.on("error", (r, c) => { this.onError("xhr poll error", r, c); }), this.pollXhr = i; }
}
class us extends Ye {
    constructor(i, r, c) { super(), this.createRequest = i, kr(this, c), this._opts = c, this._method = c.method || "GET", this._uri = r, this._data = c.data !== void 0 ? c.data : null, this._create(); }
    _create() { var i; const r = ix(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref"); r.xdomain = !!this._opts.xd; const c = this._xhr = this.createRequest(r); try {
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
        if (this._xhr.onreadystatechange = Eb, i)
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
        attachEvent("onunload", hp);
    else if (typeof addEventListener == "function") {
        const l = "onpagehide" in Zt ? "pagehide" : "unload";
        addEventListener(l, hp, !1);
    }
}
function hp() { for (let l in us.requests)
    us.requests.hasOwnProperty(l) && us.requests[l].abort(); }
const _b = (function () { const l = ox({ xdomain: !1 }); return l && l.responseType !== null; })();
class Ob extends Mb {
    constructor(i) { super(i); const r = i && i.forceBase64; this.supportsBinary = _b && !r; }
    request(i = {}) { return Object.assign(i, { xd: this.xd }, this.opts), new us(ox, this.uri(), i); }
}
function ox(l) { const i = l.xdomain; try {
    if (typeof XMLHttpRequest < "u" && (!i || Tb))
        return new XMLHttpRequest;
}
catch { } if (!i)
    try {
        return new Zt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    }
    catch { } }
const ux = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class zb extends Hu {
    get name() { return "websocket"; }
    doOpen() { const i = this.uri(), r = this.opts.protocols, c = ux ? {} : ix(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity"); this.opts.extraHeaders && (c.headers = this.opts.extraHeaders); try {
        this.ws = this.createSocket(i, r, c);
    }
    catch (d) {
        return this.emitReserved("error", d);
    } this.ws.binaryType = this.socket.binaryType, this.addEventListeners(); }
    addEventListeners() { this.ws.onopen = () => { this.opts.autoUnref && this.ws._socket.unref(), this.onOpen(); }, this.ws.onclose = i => this.onClose({ description: "websocket connection closed", context: i }), this.ws.onmessage = i => this.onData(i.data), this.ws.onerror = i => this.onError("websocket error", i); }
    write(i) { this.writable = !1; for (let r = 0; r < i.length; r++) {
        const c = i[r], d = r === i.length - 1;
        Uu(c, this.supportsBinary, h => { try {
            this.doWrite(c, h);
        }
        catch { } d && Ar(() => { this.writable = !0, this.emitReserved("drain"); }, this.setTimeoutFn); });
    } }
    doClose() { typeof this.ws < "u" && (this.ws.onerror = () => { }, this.ws.close(), this.ws = null); }
    uri() { const i = this.opts.secure ? "wss" : "ws", r = this.query || {}; return this.opts.timestampRequests && (r[this.opts.timestampParam] = rx()), this.supportsBinary || (r.b64 = 1), this.createUri(i, r); }
}
const uu = Zt.WebSocket || Zt.MozWebSocket;
class Db extends zb {
    createSocket(i, r, c) { return ux ? new uu(i, r, c) : r ? new uu(i, r) : new uu(i); }
    doWrite(i, r) { this.ws.send(r); }
}
class Rb extends Hu {
    get name() { return "webtransport"; }
    doOpen() { try {
        this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    }
    catch (i) {
        return this.emitReserved("error", i);
    } this._transport.closed.then(() => { this.onClose(); }).catch(i => { this.onError("webtransport error", i); }), this._transport.ready.then(() => { this._transport.createBidirectionalStream().then(i => { const r = xb(Number.MAX_SAFE_INTEGER, this.socket.binaryType), c = i.readable.pipeThrough(r).getReader(), d = pb(); d.readable.pipeTo(i.writable), this._writer = d.writable.getWriter(); const h = () => { c.read().then(({ done: x, value: g }) => { x || (this.onPacket(g), h()); }).catch(x => { }); }; h(); const m = { type: "open" }; this.query.sid && (m.data = `{"sid":"${this.query.sid}"}`), this._writer.write(m).then(() => this.onOpen()); }); }); }
    write(i) { this.writable = !1; for (let r = 0; r < i.length; r++) {
        const c = i[r], d = r === i.length - 1;
        this._writer.write(c).then(() => { d && Ar(() => { this.writable = !0, this.emitReserved("drain"); }, this.setTimeoutFn); });
    } }
    doClose() { var i; (i = this._transport) === null || i === void 0 || i.close(); }
}
const qb = { websocket: Db, webtransport: Rb, polling: Ob }, Bb = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Ub = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
function Su(l) { if (l.length > 8e3)
    throw "URI too long"; const i = l, r = l.indexOf("["), c = l.indexOf("]"); r != -1 && c != -1 && (l = l.substring(0, r) + l.substring(r, c).replace(/:/g, ";") + l.substring(c, l.length)); let d = Bb.exec(l || ""), h = {}, m = 14; for (; m--;)
    h[Ub[m]] = d[m] || ""; return r != -1 && c != -1 && (h.source = i, h.host = h.host.substring(1, h.host.length - 1).replace(/;/g, ":"), h.authority = h.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), h.ipv6uri = !0), h.pathNames = Lb(h, h.path), h.queryKey = Hb(h, h.query), h; }
function Lb(l, i) { const r = /\/{2,9}/g, c = i.replace(r, "/").split("/"); return (i.slice(0, 1) == "/" || i.length === 0) && c.splice(0, 1), i.slice(-1) == "/" && c.splice(c.length - 1, 1), c; }
function Hb(l, i) { const r = {}; return i.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function (c, d, h) { d && (r[d] = h); }), r; }
const Au = typeof addEventListener == "function" && typeof removeEventListener == "function", cr = [];
Au && addEventListener("offline", () => { cr.forEach(l => l()); }, !1);
class ra extends Ye {
    constructor(i, r) { if (super(), this.binaryType = yb, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, i && typeof i == "object" && (r = i, i = null), i) {
        const c = Su(i);
        r.hostname = c.host, r.secure = c.protocol === "https" || c.protocol === "wss", r.port = c.port, c.query && (r.query = c.query);
    }
    else
        r.host && (r.hostname = Su(r.host).host); kr(this, r), this.secure = r.secure != null ? r.secure : typeof location < "u" && location.protocol === "https:", r.hostname && !r.port && (r.port = this.secure ? "443" : "80"), this.hostname = r.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = r.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, r.transports.forEach(c => { const d = c.prototype.name; this.transports.push(d), this._transportsByName[d] = c; }), this.opts = Object.assign({ path: "/engine.io", agent: !1, withCredentials: !1, upgrade: !0, timestampParam: "t", rememberUpgrade: !1, addTrailingSlash: !0, rejectUnauthorized: !0, perMessageDeflate: { threshold: 1024 }, transportOptions: {}, closeOnBeforeunload: !1 }, r), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Ab(this.opts.query)), Au && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => { this.transport && (this.transport.removeAllListeners(), this.transport.close()); }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => { this._onClose("transport close", { description: "network connection lost" }); }, cr.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open(); }
    createTransport(i) { const r = Object.assign({}, this.opts.query); r.EIO = nx, r.transport = i, this.id && (r.sid = this.id); const c = Object.assign({}, this.opts, { query: r, socket: this, hostname: this.hostname, secure: this.secure, port: this.port }, this.opts.transportOptions[i]); return new this._transportsByName[i](c); }
    _open() { if (this.transports.length === 0) {
        this.setTimeoutFn(() => { this.emitReserved("error", "No transports available"); }, 0);
        return;
    } const i = this.opts.rememberUpgrade && ra.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0]; this.readyState = "opening"; const r = this.createTransport(i); r.open(), this.setTransport(r); }
    setTransport(i) { this.transport && this.transport.removeAllListeners(), this.transport = i, i.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", r => this._onClose("transport close", r)); }
    onOpen() { this.readyState = "open", ra.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush(); }
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
        if (d && (r += Nb(d)), c > 0 && r > this._maxPayload)
            return this.writeBuffer.slice(0, c);
        r += 2;
    } return this.writeBuffer; }
    _hasPingExpired() { if (!this._pingTimeoutTime)
        return !0; const i = Date.now() > this._pingTimeoutTime; return i && (this._pingTimeoutTime = 0, Ar(() => { this._onClose("ping timeout"); }, this.setTimeoutFn)), i; }
    write(i, r, c) { return this._sendPacket("message", i, r, c), this; }
    send(i, r, c) { return this._sendPacket("message", i, r, c), this; }
    _sendPacket(i, r, c, d) { if (typeof r == "function" && (d = r, r = void 0), typeof c == "function" && (d = c, c = null), this.readyState === "closing" || this.readyState === "closed")
        return; c = c || {}, c.compress = c.compress !== !1; const h = { type: i, data: r, options: c }; this.emitReserved("packetCreate", h), this.writeBuffer.push(h), d && this.once("flush", d), this.flush(); }
    close() { const i = () => { this._onClose("forced close"), this.transport.close(); }, r = () => { this.off("upgrade", r), this.off("upgradeError", r), i(); }, c = () => { this.once("upgrade", r), this.once("upgradeError", r); }; return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => { this.upgrading ? c() : i(); }) : this.upgrading ? c() : i()), this; }
    _onError(i) { if (ra.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
        return this.transports.shift(), this._open(); this.emitReserved("error", i), this._onClose("transport error", i); }
    _onClose(i, r) { if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
        if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Au && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
            const c = cr.indexOf(this._offlineEventListener);
            c !== -1 && cr.splice(c, 1);
        }
        this.readyState = "closed", this.id = null, this.emitReserved("close", i, r), this.writeBuffer = [], this._prevBufferLen = 0;
    } }
}
ra.protocol = nx;
class Vb extends ra {
    constructor() { super(...arguments), this._upgrades = []; }
    onOpen() { if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
        for (let i = 0; i < this._upgrades.length; i++)
            this._probe(this._upgrades[i]); }
    _probe(i) { let r = this.createTransport(i), c = !1; ra.priorWebsocketSuccess = !1; const d = () => { c || (r.send([{ type: "ping", data: "probe" }]), r.once("packet", b => { if (!c)
        if (b.type === "pong" && b.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", r), !r)
                return;
            ra.priorWebsocketSuccess = r.name === "websocket", this.transport.pause(() => { c || this.readyState !== "closed" && (v(), this.setTransport(r), r.send([{ type: "upgrade" }]), this.emitReserved("upgrade", r), r = null, this.upgrading = !1, this.flush()); });
        }
        else {
            const D = new Error("probe error");
            D.transport = r.name, this.emitReserved("upgradeError", D);
        } })); }; function h() { c || (c = !0, v(), r.close(), r = null); } const m = b => { const D = new Error("probe error: " + b); D.transport = r.name, h(), this.emitReserved("upgradeError", D); }; function x() { m("transport closed"); } function g() { m("socket closed"); } function y(b) { r && b.name !== r.name && h(); } const v = () => { r.removeListener("open", d), r.removeListener("error", m), r.removeListener("close", x), this.off("close", g), this.off("upgrading", y); }; r.once("open", d), r.once("error", m), r.once("close", x), this.once("close", g), this.once("upgrading", y), this._upgrades.indexOf("webtransport") !== -1 && i !== "webtransport" ? this.setTimeoutFn(() => { c || r.open(); }, 200) : r.open(); }
    onHandshake(i) { this._upgrades = this._filterUpgrades(i.upgrades), super.onHandshake(i); }
    _filterUpgrades(i) { const r = []; for (let c = 0; c < i.length; c++)
        ~this.transports.indexOf(i[c]) && r.push(i[c]); return r; }
}
let Qb = class extends Vb {
    constructor(i, r = {}) { const c = typeof i == "object" ? i : r; (!c.transports || c.transports && typeof c.transports[0] == "string") && (c.transports = (c.transports || ["polling", "websocket", "webtransport"]).map(d => qb[d]).filter(d => !!d)), super(i, c); }
};
function Gb(l, i = "", r) { let c = l; r = r || typeof location < "u" && location, l == null && (l = r.protocol + "//" + r.host), typeof l == "string" && (l.charAt(0) === "/" && (l.charAt(1) === "/" ? l = r.protocol + l : l = r.host + l), /^(https?|wss?):\/\//.test(l) || (typeof r < "u" ? l = r.protocol + "//" + l : l = "https://" + l), c = Su(l)), c.port || (/^(http|ws)$/.test(c.protocol) ? c.port = "80" : /^(http|ws)s$/.test(c.protocol) && (c.port = "443")), c.path = c.path || "/"; const h = c.host.indexOf(":") !== -1 ? "[" + c.host + "]" : c.host; return c.id = c.protocol + "://" + h + ":" + c.port + i, c.href = c.protocol + "://" + h + (r && r.port === c.port ? "" : ":" + c.port), c; }
const Kb = typeof ArrayBuffer == "function", Yb = l => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(l) : l.buffer instanceof ArrayBuffer, dx = Object.prototype.toString, Xb = typeof Blob == "function" || typeof Blob < "u" && dx.call(Blob) === "[object BlobConstructor]", Zb = typeof File == "function" || typeof File < "u" && dx.call(File) === "[object FileConstructor]";
function Vu(l) { return Kb && (l instanceof ArrayBuffer || Yb(l)) || Xb && l instanceof Blob || Zb && l instanceof File; }
function or(l, i) { if (!l || typeof l != "object")
    return !1; if (Array.isArray(l)) {
    for (let r = 0, c = l.length; r < c; r++)
        if (or(l[r]))
            return !0;
    return !1;
} if (Vu(l))
    return !0; if (l.toJSON && typeof l.toJSON == "function" && arguments.length === 1)
    return or(l.toJSON(), !0); for (const r in l)
    if (Object.prototype.hasOwnProperty.call(l, r) && or(l[r]))
        return !0; return !1; }
function Jb(l) { const i = [], r = l.data, c = l; return c.data = ku(r, i), c.attachments = i.length, { packet: c, buffers: i }; }
function ku(l, i) { if (!l)
    return l; if (Vu(l)) {
    const r = { _placeholder: !0, num: i.length };
    return i.push(l), r;
}
else if (Array.isArray(l)) {
    const r = new Array(l.length);
    for (let c = 0; c < l.length; c++)
        r[c] = ku(l[c], i);
    return r;
}
else if (typeof l == "object" && !(l instanceof Date)) {
    const r = {};
    for (const c in l)
        Object.prototype.hasOwnProperty.call(l, c) && (r[c] = ku(l[c], i));
    return r;
} return l; }
function Fb(l, i) { return l.data = Cu(l.data, i), delete l.attachments, l; }
function Cu(l, i) { if (!l)
    return l; if (l && l._placeholder === !0) {
    if (typeof l.num == "number" && l.num >= 0 && l.num < i.length)
        return i[l.num];
    throw new Error("illegal attachments");
}
else if (Array.isArray(l))
    for (let r = 0; r < l.length; r++)
        l[r] = Cu(l[r], i);
else if (typeof l == "object")
    for (const r in l)
        Object.prototype.hasOwnProperty.call(l, r) && (l[r] = Cu(l[r], i)); return l; }
const $b = ["connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener"], Wb = 5;
var be;
(function (l) { l[l.CONNECT = 0] = "CONNECT", l[l.DISCONNECT = 1] = "DISCONNECT", l[l.EVENT = 2] = "EVENT", l[l.ACK = 3] = "ACK", l[l.CONNECT_ERROR = 4] = "CONNECT_ERROR", l[l.BINARY_EVENT = 5] = "BINARY_EVENT", l[l.BINARY_ACK = 6] = "BINARY_ACK"; })(be || (be = {}));
class Ib {
    constructor(i) { this.replacer = i; }
    encode(i) { return (i.type === be.EVENT || i.type === be.ACK) && or(i) ? this.encodeAsBinary({ type: i.type === be.EVENT ? be.BINARY_EVENT : be.BINARY_ACK, nsp: i.nsp, data: i.data, id: i.id }) : [this.encodeAsString(i)]; }
    encodeAsString(i) { let r = "" + i.type; return (i.type === be.BINARY_EVENT || i.type === be.BINARY_ACK) && (r += i.attachments + "-"), i.nsp && i.nsp !== "/" && (r += i.nsp + ","), i.id != null && (r += i.id), i.data != null && (r += JSON.stringify(i.data, this.replacer)), r; }
    encodeAsBinary(i) { const r = Jb(i), c = this.encodeAsString(r.packet), d = r.buffers; return d.unshift(c), d; }
}
function mp(l) { return Object.prototype.toString.call(l) === "[object Object]"; }
class Qu extends Ye {
    constructor(i) { super(), this.reviver = i; }
    add(i) { let r; if (typeof i == "string") {
        if (this.reconstructor)
            throw new Error("got plaintext data when reconstructing a packet");
        r = this.decodeString(i);
        const c = r.type === be.BINARY_EVENT;
        c || r.type === be.BINARY_ACK ? (r.type = c ? be.EVENT : be.ACK, this.reconstructor = new Pb(r), r.attachments === 0 && super.emitReserved("decoded", r)) : super.emitReserved("decoded", r);
    }
    else if (Vu(i) || i.base64)
        if (this.reconstructor)
            r = this.reconstructor.takeBinaryData(i), r && (this.reconstructor = null, super.emitReserved("decoded", r));
        else
            throw new Error("got binary data when not reconstructing a packet");
    else
        throw new Error("Unknown type: " + i); }
    decodeString(i) { let r = 0; const c = { type: Number(i.charAt(0)) }; if (be[c.type] === void 0)
        throw new Error("unknown packet type " + c.type); if (c.type === be.BINARY_EVENT || c.type === be.BINARY_ACK) {
        const h = r + 1;
        for (; i.charAt(++r) !== "-" && r != i.length;)
            ;
        const m = i.substring(h, r);
        if (m != Number(m) || i.charAt(r) !== "-")
            throw new Error("Illegal attachments");
        c.attachments = Number(m);
    } if (i.charAt(r + 1) === "/") {
        const h = r + 1;
        for (; ++r && !(i.charAt(r) === "," || r === i.length);)
            ;
        c.nsp = i.substring(h, r);
    }
    else
        c.nsp = "/"; const d = i.charAt(r + 1); if (d !== "" && Number(d) == d) {
        const h = r + 1;
        for (; ++r;) {
            const m = i.charAt(r);
            if (m == null || Number(m) != m) {
                --r;
                break;
            }
            if (r === i.length)
                break;
        }
        c.id = Number(i.substring(h, r + 1));
    } if (i.charAt(++r)) {
        const h = this.tryParse(i.substr(r));
        if (Qu.isPayloadValid(c.type, h))
            c.data = h;
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
        case be.CONNECT: return mp(r);
        case be.DISCONNECT: return r === void 0;
        case be.CONNECT_ERROR: return typeof r == "string" || mp(r);
        case be.EVENT:
        case be.BINARY_EVENT: return Array.isArray(r) && (typeof r[0] == "number" || typeof r[0] == "string" && $b.indexOf(r[0]) === -1);
        case be.ACK:
        case be.BINARY_ACK: return Array.isArray(r);
    } }
    destroy() { this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null); }
}
class Pb {
    constructor(i) { this.packet = i, this.buffers = [], this.reconPack = i; }
    takeBinaryData(i) { if (this.buffers.push(i), this.buffers.length === this.reconPack.attachments) {
        const r = Fb(this.reconPack, this.buffers);
        return this.finishedReconstruction(), r;
    } return null; }
    finishedReconstruction() { this.reconPack = null, this.buffers = []; }
}
const ev = Object.freeze(Object.defineProperty({ __proto__: null, Decoder: Qu, Encoder: Ib, get PacketType() { return be; }, protocol: Wb }, Symbol.toStringTag, { value: "Module" }));
function es(l, i, r) { return l.on(i, r), function () { l.off(i, r); }; }
const tv = Object.freeze({ connect: 1, connect_error: 1, disconnect: 1, disconnecting: 1, newListener: 1, removeListener: 1 });
class fx extends Ye {
    constructor(i, r, c) { super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = i, this.nsp = r, c && c.auth && (this.auth = c.auth), this._opts = Object.assign({}, c), this.io._autoConnect && this.open(); }
    get disconnected() { return !this.connected; }
    subEvents() { if (this.subs)
        return; const i = this.io; this.subs = [es(i, "open", this.onopen.bind(this)), es(i, "packet", this.onpacket.bind(this)), es(i, "error", this.onerror.bind(this)), es(i, "close", this.onclose.bind(this))]; }
    get active() { return !!this.subs; }
    connect() { return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this); }
    open() { return this.connect(); }
    send(...i) { return i.unshift("message"), this.emit.apply(this, i), this; }
    emit(i, ...r) { var c, d, h; if (tv.hasOwnProperty(i))
        throw new Error('"' + i.toString() + '" is a reserved event name'); if (r.unshift(i), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
        return this._addToQueue(r), this; const m = { type: be.EVENT, data: r }; if (m.options = {}, m.options.compress = this.flags.compress !== !1, typeof r[r.length - 1] == "function") {
        const v = this.ids++, b = r.pop();
        this._registerAckCallback(v, b), m.id = v;
    } const x = (d = (c = this.io.engine) === null || c === void 0 ? void 0 : c.transport) === null || d === void 0 ? void 0 : d.writable, g = this.connected && !(!((h = this.io.engine) === null || h === void 0) && h._hasPingExpired()); return this.flags.volatile && !x || (g ? (this.notifyOutgoingListeners(m), this.packet(m)) : this.sendBuffer.push(m)), this.flags = {}, this; }
    _registerAckCallback(i, r) { var c; const d = (c = this.flags.timeout) !== null && c !== void 0 ? c : this._opts.ackTimeout; if (d === void 0) {
        this.acks[i] = r;
        return;
    } const h = this.io.setTimeoutFn(() => { delete this.acks[i]; for (let x = 0; x < this.sendBuffer.length; x++)
        this.sendBuffer[x].id === i && this.sendBuffer.splice(x, 1); r.call(this, new Error("operation has timed out")); }, d), m = (...x) => { this.io.clearTimeoutFn(h), r.apply(this, x); }; m.withError = !0, this.acks[i] = m; }
    emitWithAck(i, ...r) { return new Promise((c, d) => { const h = (m, x) => m ? d(m) : c(x); h.withError = !0, r.push(h), this.emit(i, ...r); }); }
    _addToQueue(i) { let r; typeof i[i.length - 1] == "function" && (r = i.pop()); const c = { id: this._queueSeq++, tryCount: 0, pending: !1, args: i, flags: Object.assign({ fromQueue: !0 }, this.flags) }; i.push((d, ...h) => c !== this._queue[0] ? void 0 : (d !== null ? c.tryCount > this._opts.retries && (this._queue.shift(), r && r(d)) : (this._queue.shift(), r && r(null, ...h)), c.pending = !1, this._drainQueue())), this._queue.push(c), this._drainQueue(); }
    _drainQueue(i = !1) { if (!this.connected || this._queue.length === 0)
        return; const r = this._queue[0]; r.pending && !i || (r.pending = !0, r.tryCount++, this.flags = r.flags, this.emit.apply(this, r.args)); }
    packet(i) { i.nsp = this.nsp, this.io._packet(i); }
    onopen() { typeof this.auth == "function" ? this.auth(i => { this._sendConnectPacket(i); }) : this._sendConnectPacket(this.auth); }
    _sendConnectPacket(i) { this.packet({ type: be.CONNECT, data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, i) : i }); }
    onerror(i) { this.connected || this.emitReserved("connect_error", i); }
    onclose(i, r) { this.connected = !1, delete this.id, this.emitReserved("disconnect", i, r), this._clearAcks(); }
    _clearAcks() { Object.keys(this.acks).forEach(i => { if (!this.sendBuffer.some(c => String(c.id) === i)) {
        const c = this.acks[i];
        delete this.acks[i], c.withError && c.call(this, new Error("socket has been disconnected"));
    } }); }
    onpacket(i) { if (i.nsp === this.nsp)
        switch (i.type) {
            case be.CONNECT:
                i.data && i.data.sid ? this.onconnect(i.data.sid, i.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                break;
            case be.EVENT:
            case be.BINARY_EVENT:
                this.onevent(i);
                break;
            case be.ACK:
            case be.BINARY_ACK:
                this.onack(i);
                break;
            case be.DISCONNECT:
                this.ondisconnect();
                break;
            case be.CONNECT_ERROR:
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
    ack(i) { const r = this; let c = !1; return function (...d) { c || (c = !0, r.packet({ type: be.ACK, id: i, data: d })); }; }
    onack(i) { const r = this.acks[i.id]; typeof r == "function" && (delete this.acks[i.id], r.withError && i.data.unshift(null), r.apply(this, i.data)); }
    onconnect(i, r) { this.id = i, this.recovered = r && this._pid === r, this._pid = r, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0); }
    emitBuffered() { this.receiveBuffer.forEach(i => this.emitEvent(i)), this.receiveBuffer = [], this.sendBuffer.forEach(i => { this.notifyOutgoingListeners(i), this.packet(i); }), this.sendBuffer = []; }
    ondisconnect() { this.destroy(), this.onclose("io server disconnect"); }
    destroy() { this.subs && (this.subs.forEach(i => i()), this.subs = void 0), this.io._destroy(this); }
    disconnect() { return this.connected && this.packet({ type: be.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this; }
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
class Tu extends Ye {
    constructor(i, r) { var c; super(), this.nsps = {}, this.subs = [], i && typeof i == "object" && (r = i, i = void 0), r = r || {}, r.path = r.path || "/socket.io", this.opts = r, kr(this, r), this.reconnection(r.reconnection !== !1), this.reconnectionAttempts(r.reconnectionAttempts || 1 / 0), this.reconnectionDelay(r.reconnectionDelay || 1e3), this.reconnectionDelayMax(r.reconnectionDelayMax || 5e3), this.randomizationFactor((c = r.randomizationFactor) !== null && c !== void 0 ? c : .5), this.backoff = new Sl({ min: this.reconnectionDelay(), max: this.reconnectionDelayMax(), jitter: this.randomizationFactor() }), this.timeout(r.timeout == null ? 2e4 : r.timeout), this._readyState = "closed", this.uri = i; const d = r.parser || ev; this.encoder = new d.Encoder, this.decoder = new d.Decoder, this._autoConnect = r.autoConnect !== !1, this._autoConnect && this.open(); }
    reconnection(i) { return arguments.length ? (this._reconnection = !!i, i || (this.skipReconnect = !0), this) : this._reconnection; }
    reconnectionAttempts(i) { return i === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = i, this); }
    reconnectionDelay(i) { var r; return i === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = i, (r = this.backoff) === null || r === void 0 || r.setMin(i), this); }
    randomizationFactor(i) { var r; return i === void 0 ? this._randomizationFactor : (this._randomizationFactor = i, (r = this.backoff) === null || r === void 0 || r.setJitter(i), this); }
    reconnectionDelayMax(i) { var r; return i === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = i, (r = this.backoff) === null || r === void 0 || r.setMax(i), this); }
    timeout(i) { return arguments.length ? (this._timeout = i, this) : this._timeout; }
    maybeReconnectOnOpen() { !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect(); }
    open(i) { if (~this._readyState.indexOf("open"))
        return this; this.engine = new Qb(this.uri, this.opts); const r = this.engine, c = this; this._readyState = "opening", this.skipReconnect = !1; const d = es(r, "open", function () { c.onopen(), i && i(); }), h = x => { this.cleanup(), this._readyState = "closed", this.emitReserved("error", x), i ? i(x) : this.maybeReconnectOnOpen(); }, m = es(r, "error", h); if (this._timeout !== !1) {
        const x = this._timeout, g = this.setTimeoutFn(() => { d(), h(new Error("timeout")), r.close(); }, x);
        this.opts.autoUnref && g.unref(), this.subs.push(() => { this.clearTimeoutFn(g); });
    } return this.subs.push(d), this.subs.push(m), this; }
    connect(i) { return this.open(i); }
    onopen() { this.cleanup(), this._readyState = "open", this.emitReserved("open"); const i = this.engine; this.subs.push(es(i, "ping", this.onping.bind(this)), es(i, "data", this.ondata.bind(this)), es(i, "error", this.onerror.bind(this)), es(i, "close", this.onclose.bind(this)), es(this.decoder, "decoded", this.ondecoded.bind(this))); }
    onping() { this.emitReserved("ping"); }
    ondata(i) { try {
        this.decoder.add(i);
    }
    catch (r) {
        this.onclose("parse error", r);
    } }
    ondecoded(i) { Ar(() => { this.emitReserved("packet", i); }, this.setTimeoutFn); }
    onerror(i) { this.emitReserved("error", i); }
    socket(i, r) { let c = this.nsps[i]; return c ? this._autoConnect && !c.active && c.connect() : (c = new fx(this, i, r), this.nsps[i] = c), c; }
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
function ur(l, i) { typeof l == "object" && (i = l, l = void 0), i = i || {}; const r = Gb(l, i.path || "/socket.io"), c = r.source, d = r.id, h = r.path, m = wn[d] && h in wn[d].nsps, x = i.forceNew || i["force new connection"] || i.multiplex === !1 || m; let g; return x ? g = new Tu(c, i) : (wn[d] || (wn[d] = new Tu(c, i)), g = wn[d]), r.query && !i.query && (i.query = r.queryKey), g.socket(r.path, i); }
Object.assign(ur, { Manager: Tu, Socket: fx, io: ur, connect: ur });
const pp = l => { let i; const r = new Set, c = (y, v) => { const b = typeof y == "function" ? y(i) : y; if (!Object.is(b, i)) {
    const D = i;
    i = v ?? (typeof b != "object" || b === null) ? b : Object.assign({}, i, b), r.forEach(A => A(i, D));
} }, d = () => i, x = { setState: c, getState: d, getInitialState: () => g, subscribe: y => (r.add(y), () => r.delete(y)) }, g = i = l(c, d, x); return x; }, sv = (l => l ? pp(l) : pp), av = l => l;
function lv(l, i = av) { const r = kn.useSyncExternalStore(l.subscribe, kn.useCallback(() => i(l.getState()), [l, i]), kn.useCallback(() => i(l.getInitialState()), [l, i])); return kn.useDebugValue(r), r; }
const xp = l => { const i = sv(l), r = c => lv(i, c); return Object.assign(r, i), r; }, hx = (l => l ? xp(l) : xp);
function nv(l, i) { let r; try {
    r = l();
}
catch {
    return;
} return { getItem: d => { var h; const m = g => g === null ? null : JSON.parse(g, void 0), x = (h = r.getItem(d)) != null ? h : null; return x instanceof Promise ? x.then(m) : m(x); }, setItem: (d, h) => r.setItem(d, JSON.stringify(h, void 0)), removeItem: d => r.removeItem(d) }; }
const Eu = l => i => { try {
    const r = l(i);
    return r instanceof Promise ? r : { then(c) { return Eu(c)(r); }, catch(c) { return this; } };
}
catch (r) {
    return { then(c) { return this; }, catch(c) { return Eu(c)(r); } };
} }, iv = (l, i) => (r, c, d) => { let h = { storage: nv(() => localStorage), partialize: T => T, version: 0, merge: (T, M) => ({ ...M, ...T }), ...i }, m = !1; const x = new Set, g = new Set; let y = h.storage; if (!y)
    return l((...T) => { console.warn(`[zustand persist middleware] Unable to update item '${h.name}', the given storage is currently unavailable.`), r(...T); }, c, d); const v = () => { const T = h.partialize({ ...c() }); return y.setItem(h.name, { state: T, version: h.version }); }, b = d.setState; d.setState = (T, M) => (b(T, M), v()); const D = l((...T) => (r(...T), v()), c, d); d.getInitialState = () => D; let A; const N = () => { var T, M; if (!y)
    return; m = !1, x.forEach(V => { var X; return V((X = c()) != null ? X : D); }); const G = ((M = h.onRehydrateStorage) == null ? void 0 : M.call(h, (T = c()) != null ? T : D)) || void 0; return Eu(y.getItem.bind(y))(h.name).then(V => { if (V)
    if (typeof V.version == "number" && V.version !== h.version) {
        if (h.migrate) {
            const X = h.migrate(V.state, V.version);
            return X instanceof Promise ? X.then(ee => [!0, ee]) : [!0, X];
        }
        console.error("State loaded from storage couldn't be migrated since no migrate function was provided");
    }
    else
        return [!1, V.state]; return [!1, void 0]; }).then(V => { var X; const [ee, re] = V; if (A = h.merge(re, (X = c()) != null ? X : D), r(A, !0), ee)
    return v(); }).then(() => { G == null || G(A, void 0), A = c(), m = !0, g.forEach(V => V(A)); }).catch(V => { G == null || G(void 0, V); }); }; return d.persist = { setOptions: T => { h = { ...h, ...T }, T.storage && (y = T.storage); }, clearStorage: () => { y == null || y.removeItem(h.name); }, getOptions: () => h, rehydrate: () => N(), hasHydrated: () => m, onHydrate: T => (x.add(T), () => { x.delete(T); }), onFinishHydration: T => (g.add(T), () => { g.delete(T); }) }, h.skipHydration || N(), A || D; }, rv = iv, _s = hx()(rv(l => ({ user: null, token: null, isAuthenticated: !1, login: (i, r) => l({ user: i, token: r, isAuthenticated: !0 }), logout: () => l({ user: null, token: null, isAuthenticated: !1 }), updateUser: i => l(r => ({ user: r.user ? { ...r.user, ...i } : null })) }), { name: "solaria-auth", partialize: l => ({ user: l.user, token: l.token, isAuthenticated: l.isAuthenticated }) })), mx = H.createContext(null), cv = "";
function ov({ children: l }) { const i = H.useRef(null), [r, c] = H.useState(!1), d = _s(v => v.token), h = _s(v => v.isAuthenticated), m = Jt(); H.useEffect(() => { if (!h || !d) {
    i.current && (i.current.disconnect(), i.current = null, c(!1));
    return;
} i.current = ur(cv, { auth: { token: d }, reconnection: !0, reconnectionAttempts: 5, reconnectionDelay: 1e3, reconnectionDelayMax: 5e3 }); const v = i.current; return v.on("connect", () => { console.log("[Socket] Connected:", v.id), c(!0); }), v.on("disconnect", b => { console.log("[Socket] Disconnected:", b), c(!1); }), v.on("connect_error", b => { console.error("[Socket] Connection error:", b.message), c(!1); }), v.on("agent:status", b => { m.invalidateQueries({ queryKey: ["agents"] }), b != null && b.agentId && m.invalidateQueries({ queryKey: ["agents", b.agentId] }); }), v.on("task:updated", b => { m.invalidateQueries({ queryKey: ["tasks"] }), m.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.taskId && m.invalidateQueries({ queryKey: ["tasks", b.taskId] }), b != null && b.projectId && (m.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }), m.invalidateQueries({ queryKey: ["projects", b.projectId] })); }), v.on("task:created", b => { m.invalidateQueries({ queryKey: ["tasks"] }), m.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.projectId && m.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }); }), v.on("task:completed", b => { m.invalidateQueries({ queryKey: ["tasks"] }), m.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.taskId && m.invalidateQueries({ queryKey: ["tasks", b.taskId] }), b != null && b.projectId && (m.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }), m.invalidateQueries({ queryKey: ["projects", b.projectId] })); }), v.on("task:deleted", b => { m.invalidateQueries({ queryKey: ["tasks"] }), b != null && b.projectId && m.invalidateQueries({ queryKey: ["projects", b.projectId, "tasks"] }); }), v.on("project:updated", b => { m.invalidateQueries({ queryKey: ["projects"] }), m.invalidateQueries({ queryKey: ["dashboard"] }), b != null && b.projectId && m.invalidateQueries({ queryKey: ["projects", b.projectId] }); }), v.on("project:progress", b => { b != null && b.projectId && (m.invalidateQueries({ queryKey: ["projects", b.projectId] }), m.invalidateQueries({ queryKey: ["projects"] })); }), v.on("memory:created", () => { m.invalidateQueries({ queryKey: ["memories"] }); }), v.on("memory:updated", b => { m.invalidateQueries({ queryKey: ["memories"] }), b != null && b.memoryId && m.invalidateQueries({ queryKey: ["memories", b.memoryId] }); }), v.on("alert:critical", () => { m.invalidateQueries({ queryKey: ["dashboard", "alerts"] }), m.invalidateQueries({ queryKey: ["dashboard"] }); }), v.on("taskItem:completed", b => { b != null && b.taskId && (m.invalidateQueries({ queryKey: ["tasks", b.taskId, "items"] }), m.invalidateQueries({ queryKey: ["tasks", b.taskId] }), m.invalidateQueries({ queryKey: ["tasks"] })); }), v.on("taskItem:created", b => { b != null && b.taskId && (m.invalidateQueries({ queryKey: ["tasks", b.taskId, "items"] }), m.invalidateQueries({ queryKey: ["tasks", b.taskId] })); }), v.on("taskItem:updated", b => { b != null && b.taskId && (m.invalidateQueries({ queryKey: ["tasks", b.taskId, "items"] }), m.invalidateQueries({ queryKey: ["tasks", b.taskId] })); }), v.on("activity:new", () => { m.invalidateQueries({ queryKey: ["activity"] }); }), () => { v.disconnect(), i.current = null; }; }, [h, d, m]); const x = H.useCallback((v, b) => { var D; (D = i.current) != null && D.connected && i.current.emit(v, b); }, []), g = H.useCallback((v, b) => { var D; return (D = i.current) == null || D.on(v, b), () => { var A; (A = i.current) == null || A.off(v, b); }; }, []), y = H.useCallback((v, b) => { var D, A; b ? (D = i.current) == null || D.off(v, b) : (A = i.current) == null || A.removeAllListeners(v); }, []); return a.jsx(mx.Provider, { value: { socket: i.current, isConnected: r, emit: x, on: g, off: y }, children: l }); }
function uv() { const l = H.useContext(mx); if (!l)
    throw new Error("useSocketContext must be used within a SocketProvider"); return l; }
function px(l, i) { return function () { return l.apply(i, arguments); }; }
const { toString: dv } = Object.prototype, { getPrototypeOf: Gu } = Object, { iterator: Cr, toStringTag: xx } = Symbol, Tr = (l => i => { const r = dv.call(i); return l[r] || (l[r] = r.slice(8, -1).toLowerCase()); })(Object.create(null)), as = l => (l = l.toLowerCase(), i => Tr(i) === l), Er = l => i => typeof i === l, { isArray: Al } = Array, Nl = Er("undefined");
function On(l) { return l !== null && !Nl(l) && l.constructor !== null && !Nl(l.constructor) && jt(l.constructor.isBuffer) && l.constructor.isBuffer(l); }
const gx = as("ArrayBuffer");
function fv(l) { let i; return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? i = ArrayBuffer.isView(l) : i = l && l.buffer && gx(l.buffer), i; }
const hv = Er("string"), jt = Er("function"), yx = Er("number"), zn = l => l !== null && typeof l == "object", mv = l => l === !0 || l === !1, dr = l => { if (Tr(l) !== "object")
    return !1; const i = Gu(l); return (i === null || i === Object.prototype || Object.getPrototypeOf(i) === null) && !(xx in l) && !(Cr in l); }, pv = l => { if (!zn(l) || On(l))
    return !1; try {
    return Object.keys(l).length === 0 && Object.getPrototypeOf(l) === Object.prototype;
}
catch {
    return !1;
} }, xv = as("Date"), gv = as("File"), yv = as("Blob"), bv = as("FileList"), vv = l => zn(l) && jt(l.pipe), jv = l => { let i; return l && (typeof FormData == "function" && l instanceof FormData || jt(l.append) && ((i = Tr(l)) === "formdata" || i === "object" && jt(l.toString) && l.toString() === "[object FormData]")); }, Nv = as("URLSearchParams"), [wv, Sv, Av, kv] = ["ReadableStream", "Request", "Response", "Headers"].map(as), Cv = l => l.trim ? l.trim() : l.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Dn(l, i, { allOwnKeys: r = !1 } = {}) { if (l === null || typeof l > "u")
    return; let c, d; if (typeof l != "object" && (l = [l]), Al(l))
    for (c = 0, d = l.length; c < d; c++)
        i.call(null, l[c], c, l);
else {
    if (On(l))
        return;
    const h = r ? Object.getOwnPropertyNames(l) : Object.keys(l), m = h.length;
    let x;
    for (c = 0; c < m; c++)
        x = h[c], i.call(null, l[x], x, l);
} }
function bx(l, i) { if (On(l))
    return null; i = i.toLowerCase(); const r = Object.keys(l); let c = r.length, d; for (; c-- > 0;)
    if (d = r[c], i === d.toLowerCase())
        return d; return null; }
const _a = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, vx = l => !Nl(l) && l !== _a;
function Mu() { const { caseless: l, skipUndefined: i } = vx(this) && this || {}, r = {}, c = (d, h) => { const m = l && bx(r, h) || h; dr(r[m]) && dr(d) ? r[m] = Mu(r[m], d) : dr(d) ? r[m] = Mu({}, d) : Al(d) ? r[m] = d.slice() : (!i || !Nl(d)) && (r[m] = d); }; for (let d = 0, h = arguments.length; d < h; d++)
    arguments[d] && Dn(arguments[d], c); return r; }
const Tv = (l, i, r, { allOwnKeys: c } = {}) => (Dn(i, (d, h) => { r && jt(d) ? l[h] = px(d, r) : l[h] = d; }, { allOwnKeys: c }), l), Ev = l => (l.charCodeAt(0) === 65279 && (l = l.slice(1)), l), Mv = (l, i, r, c) => { l.prototype = Object.create(i.prototype, c), l.prototype.constructor = l, Object.defineProperty(l, "super", { value: i.prototype }), r && Object.assign(l.prototype, r); }, _v = (l, i, r, c) => { let d, h, m; const x = {}; if (i = i || {}, l == null)
    return i; do {
    for (d = Object.getOwnPropertyNames(l), h = d.length; h-- > 0;)
        m = d[h], (!c || c(m, l, i)) && !x[m] && (i[m] = l[m], x[m] = !0);
    l = r !== !1 && Gu(l);
} while (l && (!r || r(l, i)) && l !== Object.prototype); return i; }, Ov = (l, i, r) => { l = String(l), (r === void 0 || r > l.length) && (r = l.length), r -= i.length; const c = l.indexOf(i, r); return c !== -1 && c === r; }, zv = l => { if (!l)
    return null; if (Al(l))
    return l; let i = l.length; if (!yx(i))
    return null; const r = new Array(i); for (; i-- > 0;)
    r[i] = l[i]; return r; }, Dv = (l => i => l && i instanceof l)(typeof Uint8Array < "u" && Gu(Uint8Array)), Rv = (l, i) => { const c = (l && l[Cr]).call(l); let d; for (; (d = c.next()) && !d.done;) {
    const h = d.value;
    i.call(l, h[0], h[1]);
} }, qv = (l, i) => { let r; const c = []; for (; (r = l.exec(i)) !== null;)
    c.push(r); return c; }, Bv = as("HTMLFormElement"), Uv = l => l.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (r, c, d) { return c.toUpperCase() + d; }), gp = (({ hasOwnProperty: l }) => (i, r) => l.call(i, r))(Object.prototype), Lv = as("RegExp"), jx = (l, i) => { const r = Object.getOwnPropertyDescriptors(l), c = {}; Dn(r, (d, h) => { let m; (m = i(d, h, l)) !== !1 && (c[h] = m || d); }), Object.defineProperties(l, c); }, Hv = l => { jx(l, (i, r) => { if (jt(l) && ["arguments", "caller", "callee"].indexOf(r) !== -1)
    return !1; const c = l[r]; if (jt(c)) {
    if (i.enumerable = !1, "writable" in i) {
        i.writable = !1;
        return;
    }
    i.set || (i.set = () => { throw Error("Can not rewrite read-only method '" + r + "'"); });
} }); }, Vv = (l, i) => { const r = {}, c = d => { d.forEach(h => { r[h] = !0; }); }; return Al(l) ? c(l) : c(String(l).split(i)), r; }, Qv = () => { }, Gv = (l, i) => l != null && Number.isFinite(l = +l) ? l : i;
function Kv(l) { return !!(l && jt(l.append) && l[xx] === "FormData" && l[Cr]); }
const Yv = l => { const i = new Array(10), r = (c, d) => { if (zn(c)) {
    if (i.indexOf(c) >= 0)
        return;
    if (On(c))
        return c;
    if (!("toJSON" in c)) {
        i[d] = c;
        const h = Al(c) ? [] : {};
        return Dn(c, (m, x) => { const g = r(m, d + 1); !Nl(g) && (h[x] = g); }), i[d] = void 0, h;
    }
} return c; }; return r(l, 0); }, Xv = as("AsyncFunction"), Zv = l => l && (zn(l) || jt(l)) && jt(l.then) && jt(l.catch), Nx = ((l, i) => l ? setImmediate : i ? ((r, c) => (_a.addEventListener("message", ({ source: d, data: h }) => { d === _a && h === r && c.length && c.shift()(); }, !1), d => { c.push(d), _a.postMessage(r, "*"); }))(`axios@${Math.random()}`, []) : r => setTimeout(r))(typeof setImmediate == "function", jt(_a.postMessage)), Jv = typeof queueMicrotask < "u" ? queueMicrotask.bind(_a) : typeof process < "u" && process.nextTick || Nx, Fv = l => l != null && jt(l[Cr]), _ = { isArray: Al, isArrayBuffer: gx, isBuffer: On, isFormData: jv, isArrayBufferView: fv, isString: hv, isNumber: yx, isBoolean: mv, isObject: zn, isPlainObject: dr, isEmptyObject: pv, isReadableStream: wv, isRequest: Sv, isResponse: Av, isHeaders: kv, isUndefined: Nl, isDate: xv, isFile: gv, isBlob: yv, isRegExp: Lv, isFunction: jt, isStream: vv, isURLSearchParams: Nv, isTypedArray: Dv, isFileList: bv, forEach: Dn, merge: Mu, extend: Tv, trim: Cv, stripBOM: Ev, inherits: Mv, toFlatObject: _v, kindOf: Tr, kindOfTest: as, endsWith: Ov, toArray: zv, forEachEntry: Rv, matchAll: qv, isHTMLForm: Bv, hasOwnProperty: gp, hasOwnProp: gp, reduceDescriptors: jx, freezeMethods: Hv, toObjectSet: Vv, toCamelCase: Uv, noop: Qv, toFiniteNumber: Gv, findKey: bx, global: _a, isContextDefined: vx, isSpecCompliantForm: Kv, toJSONObject: Yv, isAsyncFn: Xv, isThenable: Zv, setImmediate: Nx, asap: Jv, isIterable: Fv };
function ne(l, i, r, c, d) { Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = l, this.name = "AxiosError", i && (this.code = i), r && (this.config = r), c && (this.request = c), d && (this.response = d, this.status = d.status ? d.status : null); }
_.inherits(ne, Error, { toJSON: function () { return { message: this.message, name: this.name, description: this.description, number: this.number, fileName: this.fileName, lineNumber: this.lineNumber, columnNumber: this.columnNumber, stack: this.stack, config: _.toJSONObject(this.config), code: this.code, status: this.status }; } });
const wx = ne.prototype, Sx = {};
["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(l => { Sx[l] = { value: l }; });
Object.defineProperties(ne, Sx);
Object.defineProperty(wx, "isAxiosError", { value: !0 });
ne.from = (l, i, r, c, d, h) => { const m = Object.create(wx); _.toFlatObject(l, m, function (v) { return v !== Error.prototype; }, y => y !== "isAxiosError"); const x = l && l.message ? l.message : "Error", g = i == null && l ? l.code : i; return ne.call(m, x, g, r, c, d), l && m.cause == null && Object.defineProperty(m, "cause", { value: l, configurable: !0 }), m.name = l && l.name || "Error", h && Object.assign(m, h), m; };
const $v = null;
function _u(l) { return _.isPlainObject(l) || _.isArray(l); }
function Ax(l) { return _.endsWith(l, "[]") ? l.slice(0, -2) : l; }
function yp(l, i, r) { return l ? l.concat(i).map(function (d, h) { return d = Ax(d), !r && h ? "[" + d + "]" : d; }).join(r ? "." : "") : i; }
function Wv(l) { return _.isArray(l) && !l.some(_u); }
const Iv = _.toFlatObject(_, {}, null, function (i) { return /^is[A-Z]/.test(i); });
function Mr(l, i, r) { if (!_.isObject(l))
    throw new TypeError("target must be an object"); i = i || new FormData, r = _.toFlatObject(r, { metaTokens: !0, dots: !1, indexes: !1 }, !1, function (T, M) { return !_.isUndefined(M[T]); }); const c = r.metaTokens, d = r.visitor || v, h = r.dots, m = r.indexes, g = (r.Blob || typeof Blob < "u" && Blob) && _.isSpecCompliantForm(i); if (!_.isFunction(d))
    throw new TypeError("visitor must be a function"); function y(N) { if (N === null)
    return ""; if (_.isDate(N))
    return N.toISOString(); if (_.isBoolean(N))
    return N.toString(); if (!g && _.isBlob(N))
    throw new ne("Blob is not supported. Use a Buffer instead."); return _.isArrayBuffer(N) || _.isTypedArray(N) ? g && typeof Blob == "function" ? new Blob([N]) : Buffer.from(N) : N; } function v(N, T, M) { let G = N; if (N && !M && typeof N == "object") {
    if (_.endsWith(T, "{}"))
        T = c ? T : T.slice(0, -2), N = JSON.stringify(N);
    else if (_.isArray(N) && Wv(N) || (_.isFileList(N) || _.endsWith(T, "[]")) && (G = _.toArray(N)))
        return T = Ax(T), G.forEach(function (X, ee) { !(_.isUndefined(X) || X === null) && i.append(m === !0 ? yp([T], ee, h) : m === null ? T : T + "[]", y(X)); }), !1;
} return _u(N) ? !0 : (i.append(yp(M, T, h), y(N)), !1); } const b = [], D = Object.assign(Iv, { defaultVisitor: v, convertValue: y, isVisitable: _u }); function A(N, T) { if (!_.isUndefined(N)) {
    if (b.indexOf(N) !== -1)
        throw Error("Circular reference detected in " + T.join("."));
    b.push(N), _.forEach(N, function (G, V) { (!(_.isUndefined(G) || G === null) && d.call(i, G, _.isString(V) ? V.trim() : V, T, D)) === !0 && A(G, T ? T.concat(V) : [V]); }), b.pop();
} } if (!_.isObject(l))
    throw new TypeError("data must be an object"); return A(l), i; }
function bp(l) { const i = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+", "%00": "\0" }; return encodeURIComponent(l).replace(/[!'()~]|%20|%00/g, function (c) { return i[c]; }); }
function Ku(l, i) { this._pairs = [], l && Mr(l, this, i); }
const kx = Ku.prototype;
kx.append = function (i, r) { this._pairs.push([i, r]); };
kx.toString = function (i) { const r = i ? function (c) { return i.call(this, c, bp); } : bp; return this._pairs.map(function (d) { return r(d[0]) + "=" + r(d[1]); }, "").join("&"); };
function Pv(l) { return encodeURIComponent(l).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+"); }
function Cx(l, i, r) { if (!i)
    return l; const c = r && r.encode || Pv; _.isFunction(r) && (r = { serialize: r }); const d = r && r.serialize; let h; if (d ? h = d(i, r) : h = _.isURLSearchParams(i) ? i.toString() : new Ku(i, r).toString(c), h) {
    const m = l.indexOf("#");
    m !== -1 && (l = l.slice(0, m)), l += (l.indexOf("?") === -1 ? "?" : "&") + h;
} return l; }
class vp {
    constructor() { this.handlers = []; }
    use(i, r, c) { return this.handlers.push({ fulfilled: i, rejected: r, synchronous: c ? c.synchronous : !1, runWhen: c ? c.runWhen : null }), this.handlers.length - 1; }
    eject(i) { this.handlers[i] && (this.handlers[i] = null); }
    clear() { this.handlers && (this.handlers = []); }
    forEach(i) { _.forEach(this.handlers, function (c) { c !== null && i(c); }); }
}
const Tx = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 }, e1 = typeof URLSearchParams < "u" ? URLSearchParams : Ku, t1 = typeof FormData < "u" ? FormData : null, s1 = typeof Blob < "u" ? Blob : null, a1 = { isBrowser: !0, classes: { URLSearchParams: e1, FormData: t1, Blob: s1 }, protocols: ["http", "https", "file", "blob", "url", "data"] }, Yu = typeof window < "u" && typeof document < "u", Ou = typeof navigator == "object" && navigator || void 0, l1 = Yu && (!Ou || ["ReactNative", "NativeScript", "NS"].indexOf(Ou.product) < 0), n1 = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function", i1 = Yu && window.location.href || "http://localhost", r1 = Object.freeze(Object.defineProperty({ __proto__: null, hasBrowserEnv: Yu, hasStandardBrowserEnv: l1, hasStandardBrowserWebWorkerEnv: n1, navigator: Ou, origin: i1 }, Symbol.toStringTag, { value: "Module" })), rt = { ...r1, ...a1 };
function c1(l, i) { return Mr(l, new rt.classes.URLSearchParams, { visitor: function (r, c, d, h) { return rt.isNode && _.isBuffer(r) ? (this.append(c, r.toString("base64")), !1) : h.defaultVisitor.apply(this, arguments); }, ...i }); }
function o1(l) { return _.matchAll(/\w+|\[(\w*)]/g, l).map(i => i[0] === "[]" ? "" : i[1] || i[0]); }
function u1(l) { const i = {}, r = Object.keys(l); let c; const d = r.length; let h; for (c = 0; c < d; c++)
    h = r[c], i[h] = l[h]; return i; }
function Ex(l) { function i(r, c, d, h) { let m = r[h++]; if (m === "__proto__")
    return !0; const x = Number.isFinite(+m), g = h >= r.length; return m = !m && _.isArray(d) ? d.length : m, g ? (_.hasOwnProp(d, m) ? d[m] = [d[m], c] : d[m] = c, !x) : ((!d[m] || !_.isObject(d[m])) && (d[m] = []), i(r, c, d[m], h) && _.isArray(d[m]) && (d[m] = u1(d[m])), !x); } if (_.isFormData(l) && _.isFunction(l.entries)) {
    const r = {};
    return _.forEachEntry(l, (c, d) => { i(o1(c), d, r, 0); }), r;
} return null; }
function d1(l, i, r) { if (_.isString(l))
    try {
        return (i || JSON.parse)(l), _.trim(l);
    }
    catch (c) {
        if (c.name !== "SyntaxError")
            throw c;
    } return (r || JSON.stringify)(l); }
const Rn = { transitional: Tx, adapter: ["xhr", "http", "fetch"], transformRequest: [function (i, r) { const c = r.getContentType() || "", d = c.indexOf("application/json") > -1, h = _.isObject(i); if (h && _.isHTMLForm(i) && (i = new FormData(i)), _.isFormData(i))
            return d ? JSON.stringify(Ex(i)) : i; if (_.isArrayBuffer(i) || _.isBuffer(i) || _.isStream(i) || _.isFile(i) || _.isBlob(i) || _.isReadableStream(i))
            return i; if (_.isArrayBufferView(i))
            return i.buffer; if (_.isURLSearchParams(i))
            return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), i.toString(); let x; if (h) {
            if (c.indexOf("application/x-www-form-urlencoded") > -1)
                return c1(i, this.formSerializer).toString();
            if ((x = _.isFileList(i)) || c.indexOf("multipart/form-data") > -1) {
                const g = this.env && this.env.FormData;
                return Mr(x ? { "files[]": i } : i, g && new g, this.formSerializer);
            }
        } return h || d ? (r.setContentType("application/json", !1), d1(i)) : i; }], transformResponse: [function (i) { const r = this.transitional || Rn.transitional, c = r && r.forcedJSONParsing, d = this.responseType === "json"; if (_.isResponse(i) || _.isReadableStream(i))
            return i; if (i && _.isString(i) && (c && !this.responseType || d)) {
            const m = !(r && r.silentJSONParsing) && d;
            try {
                return JSON.parse(i, this.parseReviver);
            }
            catch (x) {
                if (m)
                    throw x.name === "SyntaxError" ? ne.from(x, ne.ERR_BAD_RESPONSE, this, null, this.response) : x;
            }
        } return i; }], timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, maxBodyLength: -1, env: { FormData: rt.classes.FormData, Blob: rt.classes.Blob }, validateStatus: function (i) { return i >= 200 && i < 300; }, headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } } };
_.forEach(["delete", "get", "head", "post", "put", "patch"], l => { Rn.headers[l] = {}; });
const f1 = _.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]), h1 = l => {
    const i = {};
    let r, c, d;
    return l && l.split(`
`).forEach(function (m) { d = m.indexOf(":"), r = m.substring(0, d).trim().toLowerCase(), c = m.substring(d + 1).trim(), !(!r || i[r] && f1[r]) && (r === "set-cookie" ? i[r] ? i[r].push(c) : i[r] = [c] : i[r] = i[r] ? i[r] + ", " + c : c); }), i;
}, jp = Symbol("internals");
function Sn(l) { return l && String(l).trim().toLowerCase(); }
function fr(l) { return l === !1 || l == null ? l : _.isArray(l) ? l.map(fr) : String(l); }
function m1(l) { const i = Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; let c; for (; c = r.exec(l);)
    i[c[1]] = c[2]; return i; }
const p1 = l => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(l.trim());
function du(l, i, r, c, d) { if (_.isFunction(c))
    return c.call(this, i, r); if (d && (i = r), !!_.isString(i)) {
    if (_.isString(c))
        return i.indexOf(c) !== -1;
    if (_.isRegExp(c))
        return c.test(i);
} }
function x1(l) { return l.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (i, r, c) => r.toUpperCase() + c); }
function g1(l, i) { const r = _.toCamelCase(" " + i); ["get", "set", "has"].forEach(c => { Object.defineProperty(l, c + r, { value: function (d, h, m) { return this[c].call(this, i, d, h, m); }, configurable: !0 }); }); }
let Nt = class {
    constructor(i) { i && this.set(i); }
    set(i, r, c) { const d = this; function h(x, g, y) { const v = Sn(g); if (!v)
        throw new Error("header name must be a non-empty string"); const b = _.findKey(d, v); (!b || d[b] === void 0 || y === !0 || y === void 0 && d[b] !== !1) && (d[b || g] = fr(x)); } const m = (x, g) => _.forEach(x, (y, v) => h(y, v, g)); if (_.isPlainObject(i) || i instanceof this.constructor)
        m(i, r);
    else if (_.isString(i) && (i = i.trim()) && !p1(i))
        m(h1(i), r);
    else if (_.isObject(i) && _.isIterable(i)) {
        let x = {}, g, y;
        for (const v of i) {
            if (!_.isArray(v))
                throw TypeError("Object iterator must return a key-value pair");
            x[y = v[0]] = (g = x[y]) ? _.isArray(g) ? [...g, v[1]] : [g, v[1]] : v[1];
        }
        m(x, r);
    }
    else
        i != null && h(r, i, c); return this; }
    get(i, r) { if (i = Sn(i), i) {
        const c = _.findKey(this, i);
        if (c) {
            const d = this[c];
            if (!r)
                return d;
            if (r === !0)
                return m1(d);
            if (_.isFunction(r))
                return r.call(this, d, c);
            if (_.isRegExp(r))
                return r.exec(d);
            throw new TypeError("parser must be boolean|regexp|function");
        }
    } }
    has(i, r) { if (i = Sn(i), i) {
        const c = _.findKey(this, i);
        return !!(c && this[c] !== void 0 && (!r || du(this, this[c], c, r)));
    } return !1; }
    delete(i, r) { const c = this; let d = !1; function h(m) { if (m = Sn(m), m) {
        const x = _.findKey(c, m);
        x && (!r || du(c, c[x], x, r)) && (delete c[x], d = !0);
    } } return _.isArray(i) ? i.forEach(h) : h(i), d; }
    clear(i) { const r = Object.keys(this); let c = r.length, d = !1; for (; c--;) {
        const h = r[c];
        (!i || du(this, this[h], h, i, !0)) && (delete this[h], d = !0);
    } return d; }
    normalize(i) { const r = this, c = {}; return _.forEach(this, (d, h) => { const m = _.findKey(c, h); if (m) {
        r[m] = fr(d), delete r[h];
        return;
    } const x = i ? x1(h) : String(h).trim(); x !== h && delete r[h], r[x] = fr(d), c[x] = !0; }), this; }
    concat(...i) { return this.constructor.concat(this, ...i); }
    toJSON(i) { const r = Object.create(null); return _.forEach(this, (c, d) => { c != null && c !== !1 && (r[d] = i && _.isArray(c) ? c.join(", ") : c); }), r; }
    [Symbol.iterator]() { return Object.entries(this.toJSON())[Symbol.iterator](); }
    toString() {
        return Object.entries(this.toJSON()).map(([i, r]) => i + ": " + r).join(`
`);
    }
    getSetCookie() { return this.get("set-cookie") || []; }
    get [Symbol.toStringTag]() { return "AxiosHeaders"; }
    static from(i) { return i instanceof this ? i : new this(i); }
    static concat(i, ...r) { const c = new this(i); return r.forEach(d => c.set(d)), c; }
    static accessor(i) { const c = (this[jp] = this[jp] = { accessors: {} }).accessors, d = this.prototype; function h(m) { const x = Sn(m); c[x] || (g1(d, m), c[x] = !0); } return _.isArray(i) ? i.forEach(h) : h(i), this; }
};
Nt.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
_.reduceDescriptors(Nt.prototype, ({ value: l }, i) => { let r = i[0].toUpperCase() + i.slice(1); return { get: () => l, set(c) { this[r] = c; } }; });
_.freezeMethods(Nt);
function fu(l, i) { const r = this || Rn, c = i || r, d = Nt.from(c.headers); let h = c.data; return _.forEach(l, function (x) { h = x.call(r, h, d.normalize(), i ? i.status : void 0); }), d.normalize(), h; }
function Mx(l) { return !!(l && l.__CANCEL__); }
function kl(l, i, r) { ne.call(this, l ?? "canceled", ne.ERR_CANCELED, i, r), this.name = "CanceledError"; }
_.inherits(kl, ne, { __CANCEL__: !0 });
function _x(l, i, r) { const c = r.config.validateStatus; !r.status || !c || c(r.status) ? l(r) : i(new ne("Request failed with status code " + r.status, [ne.ERR_BAD_REQUEST, ne.ERR_BAD_RESPONSE][Math.floor(r.status / 100) - 4], r.config, r.request, r)); }
function y1(l) { const i = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l); return i && i[1] || ""; }
function b1(l, i) { l = l || 10; const r = new Array(l), c = new Array(l); let d = 0, h = 0, m; return i = i !== void 0 ? i : 1e3, function (g) { const y = Date.now(), v = c[h]; m || (m = y), r[d] = g, c[d] = y; let b = h, D = 0; for (; b !== d;)
    D += r[b++], b = b % l; if (d = (d + 1) % l, d === h && (h = (h + 1) % l), y - m < i)
    return; const A = v && y - v; return A ? Math.round(D * 1e3 / A) : void 0; }; }
function v1(l, i) { let r = 0, c = 1e3 / i, d, h; const m = (y, v = Date.now()) => { r = v, d = null, h && (clearTimeout(h), h = null), l(...y); }; return [(...y) => { const v = Date.now(), b = v - r; b >= c ? m(y, v) : (d = y, h || (h = setTimeout(() => { h = null, m(d); }, c - b))); }, () => d && m(d)]; }
const pr = (l, i, r = 3) => { let c = 0; const d = b1(50, 250); return v1(h => { const m = h.loaded, x = h.lengthComputable ? h.total : void 0, g = m - c, y = d(g), v = m <= x; c = m; const b = { loaded: m, total: x, progress: x ? m / x : void 0, bytes: g, rate: y || void 0, estimated: y && x && v ? (x - m) / y : void 0, event: h, lengthComputable: x != null, [i ? "download" : "upload"]: !0 }; l(b); }, r); }, Np = (l, i) => { const r = l != null; return [c => i[0]({ lengthComputable: r, total: l, loaded: c }), i[1]]; }, wp = l => (...i) => _.asap(() => l(...i)), j1 = rt.hasStandardBrowserEnv ? ((l, i) => r => (r = new URL(r, rt.origin), l.protocol === r.protocol && l.host === r.host && (i || l.port === r.port)))(new URL(rt.origin), rt.navigator && /(msie|trident)/i.test(rt.navigator.userAgent)) : () => !0, N1 = rt.hasStandardBrowserEnv ? { write(l, i, r, c, d, h, m) { if (typeof document > "u")
        return; const x = [`${l}=${encodeURIComponent(i)}`]; _.isNumber(r) && x.push(`expires=${new Date(r).toUTCString()}`), _.isString(c) && x.push(`path=${c}`), _.isString(d) && x.push(`domain=${d}`), h === !0 && x.push("secure"), _.isString(m) && x.push(`SameSite=${m}`), document.cookie = x.join("; "); }, read(l) { if (typeof document > "u")
        return null; const i = document.cookie.match(new RegExp("(?:^|; )" + l + "=([^;]*)")); return i ? decodeURIComponent(i[1]) : null; }, remove(l) { this.write(l, "", Date.now() - 864e5, "/"); } } : { write() { }, read() { return null; }, remove() { } };
function w1(l) { return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(l); }
function S1(l, i) { return i ? l.replace(/\/?\/$/, "") + "/" + i.replace(/^\/+/, "") : l; }
function Ox(l, i, r) { let c = !w1(i); return l && (c || r == !1) ? S1(l, i) : i; }
const Sp = l => l instanceof Nt ? { ...l } : l;
function za(l, i) { i = i || {}; const r = {}; function c(y, v, b, D) { return _.isPlainObject(y) && _.isPlainObject(v) ? _.merge.call({ caseless: D }, y, v) : _.isPlainObject(v) ? _.merge({}, v) : _.isArray(v) ? v.slice() : v; } function d(y, v, b, D) { if (_.isUndefined(v)) {
    if (!_.isUndefined(y))
        return c(void 0, y, b, D);
}
else
    return c(y, v, b, D); } function h(y, v) { if (!_.isUndefined(v))
    return c(void 0, v); } function m(y, v) { if (_.isUndefined(v)) {
    if (!_.isUndefined(y))
        return c(void 0, y);
}
else
    return c(void 0, v); } function x(y, v, b) { if (b in i)
    return c(y, v); if (b in l)
    return c(void 0, y); } const g = { url: h, method: h, data: h, baseURL: m, transformRequest: m, transformResponse: m, paramsSerializer: m, timeout: m, timeoutMessage: m, withCredentials: m, withXSRFToken: m, adapter: m, responseType: m, xsrfCookieName: m, xsrfHeaderName: m, onUploadProgress: m, onDownloadProgress: m, decompress: m, maxContentLength: m, maxBodyLength: m, beforeRedirect: m, transport: m, httpAgent: m, httpsAgent: m, cancelToken: m, socketPath: m, responseEncoding: m, validateStatus: x, headers: (y, v, b) => d(Sp(y), Sp(v), b, !0) }; return _.forEach(Object.keys({ ...l, ...i }), function (v) { const b = g[v] || d, D = b(l[v], i[v], v); _.isUndefined(D) && b !== x || (r[v] = D); }), r; }
const zx = l => { const i = za({}, l); let { data: r, withXSRFToken: c, xsrfHeaderName: d, xsrfCookieName: h, headers: m, auth: x } = i; if (i.headers = m = Nt.from(m), i.url = Cx(Ox(i.baseURL, i.url, i.allowAbsoluteUrls), l.params, l.paramsSerializer), x && m.set("Authorization", "Basic " + btoa((x.username || "") + ":" + (x.password ? unescape(encodeURIComponent(x.password)) : ""))), _.isFormData(r)) {
    if (rt.hasStandardBrowserEnv || rt.hasStandardBrowserWebWorkerEnv)
        m.setContentType(void 0);
    else if (_.isFunction(r.getHeaders)) {
        const g = r.getHeaders(), y = ["content-type", "content-length"];
        Object.entries(g).forEach(([v, b]) => { y.includes(v.toLowerCase()) && m.set(v, b); });
    }
} if (rt.hasStandardBrowserEnv && (c && _.isFunction(c) && (c = c(i)), c || c !== !1 && j1(i.url))) {
    const g = d && h && N1.read(h);
    g && m.set(d, g);
} return i; }, A1 = typeof XMLHttpRequest < "u", k1 = A1 && function (l) { return new Promise(function (r, c) { const d = zx(l); let h = d.data; const m = Nt.from(d.headers).normalize(); let { responseType: x, onUploadProgress: g, onDownloadProgress: y } = d, v, b, D, A, N; function T() { A && A(), N && N(), d.cancelToken && d.cancelToken.unsubscribe(v), d.signal && d.signal.removeEventListener("abort", v); } let M = new XMLHttpRequest; M.open(d.method.toUpperCase(), d.url, !0), M.timeout = d.timeout; function G() { if (!M)
    return; const X = Nt.from("getAllResponseHeaders" in M && M.getAllResponseHeaders()), re = { data: !x || x === "text" || x === "json" ? M.responseText : M.response, status: M.status, statusText: M.statusText, headers: X, config: l, request: M }; _x(function (U) { r(U), T(); }, function (U) { c(U), T(); }, re), M = null; } "onloadend" in M ? M.onloadend = G : M.onreadystatechange = function () { !M || M.readyState !== 4 || M.status === 0 && !(M.responseURL && M.responseURL.indexOf("file:") === 0) || setTimeout(G); }, M.onabort = function () { M && (c(new ne("Request aborted", ne.ECONNABORTED, l, M)), M = null); }, M.onerror = function (ee) { const re = ee && ee.message ? ee.message : "Network Error", I = new ne(re, ne.ERR_NETWORK, l, M); I.event = ee || null, c(I), M = null; }, M.ontimeout = function () { let ee = d.timeout ? "timeout of " + d.timeout + "ms exceeded" : "timeout exceeded"; const re = d.transitional || Tx; d.timeoutErrorMessage && (ee = d.timeoutErrorMessage), c(new ne(ee, re.clarifyTimeoutError ? ne.ETIMEDOUT : ne.ECONNABORTED, l, M)), M = null; }, h === void 0 && m.setContentType(null), "setRequestHeader" in M && _.forEach(m.toJSON(), function (ee, re) { M.setRequestHeader(re, ee); }), _.isUndefined(d.withCredentials) || (M.withCredentials = !!d.withCredentials), x && x !== "json" && (M.responseType = d.responseType), y && ([D, N] = pr(y, !0), M.addEventListener("progress", D)), g && M.upload && ([b, A] = pr(g), M.upload.addEventListener("progress", b), M.upload.addEventListener("loadend", A)), (d.cancelToken || d.signal) && (v = X => { M && (c(!X || X.type ? new kl(null, l, M) : X), M.abort(), M = null); }, d.cancelToken && d.cancelToken.subscribe(v), d.signal && (d.signal.aborted ? v() : d.signal.addEventListener("abort", v))); const V = y1(d.url); if (V && rt.protocols.indexOf(V) === -1) {
    c(new ne("Unsupported protocol " + V + ":", ne.ERR_BAD_REQUEST, l));
    return;
} M.send(h || null); }); }, C1 = (l, i) => { const { length: r } = l = l ? l.filter(Boolean) : []; if (i || r) {
    let c = new AbortController, d;
    const h = function (y) { if (!d) {
        d = !0, x();
        const v = y instanceof Error ? y : this.reason;
        c.abort(v instanceof ne ? v : new kl(v instanceof Error ? v.message : v));
    } };
    let m = i && setTimeout(() => { m = null, h(new ne(`timeout ${i} of ms exceeded`, ne.ETIMEDOUT)); }, i);
    const x = () => { l && (m && clearTimeout(m), m = null, l.forEach(y => { y.unsubscribe ? y.unsubscribe(h) : y.removeEventListener("abort", h); }), l = null); };
    l.forEach(y => y.addEventListener("abort", h));
    const { signal: g } = c;
    return g.unsubscribe = () => _.asap(x), g;
} }, T1 = function* (l, i) { let r = l.byteLength; if (r < i) {
    yield l;
    return;
} let c = 0, d; for (; c < r;)
    d = c + i, yield l.slice(c, d), c = d; }, E1 = async function* (l, i) { for await (const r of M1(l))
    yield* T1(r, i); }, M1 = async function* (l) { if (l[Symbol.asyncIterator]) {
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
} }, Ap = (l, i, r, c) => { const d = E1(l, i); let h = 0, m, x = g => { m || (m = !0, c && c(g)); }; return new ReadableStream({ async pull(g) { try {
        const { done: y, value: v } = await d.next();
        if (y) {
            x(), g.close();
            return;
        }
        let b = v.byteLength;
        if (r) {
            let D = h += b;
            r(D);
        }
        g.enqueue(new Uint8Array(v));
    }
    catch (y) {
        throw x(y), y;
    } }, cancel(g) { return x(g), d.return(); } }, { highWaterMark: 2 }); }, kp = 64 * 1024, { isFunction: ar } = _, _1 = (({ Request: l, Response: i }) => ({ Request: l, Response: i }))(_.global), { ReadableStream: Cp, TextEncoder: Tp } = _.global, Ep = (l, ...i) => { try {
    return !!l(...i);
}
catch {
    return !1;
} }, O1 = l => { l = _.merge.call({ skipUndefined: !0 }, _1, l); const { fetch: i, Request: r, Response: c } = l, d = i ? ar(i) : typeof fetch == "function", h = ar(r), m = ar(c); if (!d)
    return !1; const x = d && ar(Cp), g = d && (typeof Tp == "function" ? (N => T => N.encode(T))(new Tp) : async (N) => new Uint8Array(await new r(N).arrayBuffer())), y = h && x && Ep(() => { let N = !1; const T = new r(rt.origin, { body: new Cp, method: "POST", get duplex() { return N = !0, "half"; } }).headers.has("Content-Type"); return N && !T; }), v = m && x && Ep(() => _.isReadableStream(new c("").body)), b = { stream: v && (N => N.body) }; d && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach(N => { !b[N] && (b[N] = (T, M) => { let G = T && T[N]; if (G)
    return G.call(T); throw new ne(`Response type '${N}' is not supported`, ne.ERR_NOT_SUPPORT, M); }); }); const D = async (N) => { if (N == null)
    return 0; if (_.isBlob(N))
    return N.size; if (_.isSpecCompliantForm(N))
    return (await new r(rt.origin, { method: "POST", body: N }).arrayBuffer()).byteLength; if (_.isArrayBufferView(N) || _.isArrayBuffer(N))
    return N.byteLength; if (_.isURLSearchParams(N) && (N = N + ""), _.isString(N))
    return (await g(N)).byteLength; }, A = async (N, T) => { const M = _.toFiniteNumber(N.getContentLength()); return M ?? D(T); }; return async (N) => { let { url: T, method: M, data: G, signal: V, cancelToken: X, timeout: ee, onDownloadProgress: re, onUploadProgress: I, responseType: U, headers: Y, withCredentials: we = "same-origin", fetchOptions: ft } = zx(N), et = i || fetch; U = U ? (U + "").toLowerCase() : "text"; let Me = C1([V, X && X.toAbortSignal()], ee), ut = null; const Xe = Me && Me.unsubscribe && (() => { Me.unsubscribe(); }); let he; try {
    if (I && y && M !== "get" && M !== "head" && (he = await A(Y, G)) !== 0) {
        let ge = new r(T, { method: "POST", body: G, duplex: "half" }), me;
        if (_.isFormData(G) && (me = ge.headers.get("content-type")) && Y.setContentType(me), ge.body) {
            const [ae, ue] = Np(he, pr(wp(I)));
            G = Ap(ge.body, kp, ae, ue);
        }
    }
    _.isString(we) || (we = we ? "include" : "omit");
    const O = h && "credentials" in r.prototype, K = { ...ft, signal: Me, method: M.toUpperCase(), headers: Y.normalize().toJSON(), body: G, duplex: "half", credentials: O ? we : void 0 };
    ut = h && new r(T, K);
    let L = await (h ? et(ut, ft) : et(T, K));
    const ce = v && (U === "stream" || U === "response");
    if (v && (re || ce && Xe)) {
        const ge = {};
        ["status", "statusText", "headers"].forEach(Fe => { ge[Fe] = L[Fe]; });
        const me = _.toFiniteNumber(L.headers.get("content-length")), [ae, ue] = re && Np(me, pr(wp(re), !0)) || [];
        L = new c(Ap(L.body, kp, ae, () => { ue && ue(), Xe && Xe(); }), ge);
    }
    U = U || "text";
    let ve = await b[_.findKey(b, U) || "text"](L, N);
    return !ce && Xe && Xe(), await new Promise((ge, me) => { _x(ge, me, { data: ve, headers: Nt.from(L.headers), status: L.status, statusText: L.statusText, config: N, request: ut }); });
}
catch (O) {
    throw Xe && Xe(), O && O.name === "TypeError" && /Load failed|fetch/i.test(O.message) ? Object.assign(new ne("Network Error", ne.ERR_NETWORK, N, ut), { cause: O.cause || O }) : ne.from(O, O && O.code, N, ut);
} }; }, z1 = new Map, Dx = l => { let i = l && l.env || {}; const { fetch: r, Request: c, Response: d } = i, h = [c, d, r]; let m = h.length, x = m, g, y, v = z1; for (; x--;)
    g = h[x], y = v.get(g), y === void 0 && v.set(g, y = x ? new Map : O1(i)), v = y; return y; };
Dx();
const Xu = { http: $v, xhr: k1, fetch: { get: Dx } };
_.forEach(Xu, (l, i) => { if (l) {
    try {
        Object.defineProperty(l, "name", { value: i });
    }
    catch { }
    Object.defineProperty(l, "adapterName", { value: i });
} });
const Mp = l => `- ${l}`, D1 = l => _.isFunction(l) || l === null || l === !1;
function R1(l, i) {
    l = _.isArray(l) ? l : [l];
    const { length: r } = l;
    let c, d;
    const h = {};
    for (let m = 0; m < r; m++) {
        c = l[m];
        let x;
        if (d = c, !D1(c) && (d = Xu[(x = String(c)).toLowerCase()], d === void 0))
            throw new ne(`Unknown adapter '${x}'`);
        if (d && (_.isFunction(d) || (d = d.get(i))))
            break;
        h[x || "#" + m] = d;
    }
    if (!d) {
        const m = Object.entries(h).map(([g, y]) => `adapter ${g} ` + (y === !1 ? "is not supported by the environment" : "is not available in the build"));
        let x = r ? m.length > 1 ? `since :
` + m.map(Mp).join(`
`) : " " + Mp(m[0]) : "as no adapter specified";
        throw new ne("There is no suitable adapter to dispatch the request " + x, "ERR_NOT_SUPPORT");
    }
    return d;
}
const Rx = { getAdapter: R1, adapters: Xu };
function hu(l) { if (l.cancelToken && l.cancelToken.throwIfRequested(), l.signal && l.signal.aborted)
    throw new kl(null, l); }
function _p(l) { return hu(l), l.headers = Nt.from(l.headers), l.data = fu.call(l, l.transformRequest), ["post", "put", "patch"].indexOf(l.method) !== -1 && l.headers.setContentType("application/x-www-form-urlencoded", !1), Rx.getAdapter(l.adapter || Rn.adapter, l)(l).then(function (c) { return hu(l), c.data = fu.call(l, l.transformResponse, c), c.headers = Nt.from(c.headers), c; }, function (c) { return Mx(c) || (hu(l), c && c.response && (c.response.data = fu.call(l, l.transformResponse, c.response), c.response.headers = Nt.from(c.response.headers))), Promise.reject(c); }); }
const qx = "1.13.2", _r = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((l, i) => { _r[l] = function (c) { return typeof c === l || "a" + (i < 1 ? "n " : " ") + l; }; });
const Op = {};
_r.transitional = function (i, r, c) { function d(h, m) { return "[Axios v" + qx + "] Transitional option '" + h + "'" + m + (c ? ". " + c : ""); } return (h, m, x) => { if (i === !1)
    throw new ne(d(m, " has been removed" + (r ? " in " + r : "")), ne.ERR_DEPRECATED); return r && !Op[m] && (Op[m] = !0, console.warn(d(m, " has been deprecated since v" + r + " and will be removed in the near future"))), i ? i(h, m, x) : !0; }; };
_r.spelling = function (i) { return (r, c) => (console.warn(`${c} is likely a misspelling of ${i}`), !0); };
function q1(l, i, r) { if (typeof l != "object")
    throw new ne("options must be an object", ne.ERR_BAD_OPTION_VALUE); const c = Object.keys(l); let d = c.length; for (; d-- > 0;) {
    const h = c[d], m = i[h];
    if (m) {
        const x = l[h], g = x === void 0 || m(x, h, l);
        if (g !== !0)
            throw new ne("option " + h + " must be " + g, ne.ERR_BAD_OPTION_VALUE);
        continue;
    }
    if (r !== !0)
        throw new ne("Unknown option " + h, ne.ERR_BAD_OPTION);
} }
const hr = { assertOptions: q1, validators: _r }, os = hr.validators;
let Oa = class {
    constructor(i) { this.defaults = i || {}, this.interceptors = { request: new vp, response: new vp }; }
    async request(i, r) {
        try {
            return await this._request(i, r);
        }
        catch (c) {
            if (c instanceof Error) {
                let d = {};
                Error.captureStackTrace ? Error.captureStackTrace(d) : d = new Error;
                const h = d.stack ? d.stack.replace(/^.+\n/, "") : "";
                try {
                    c.stack ? h && !String(c.stack).endsWith(h.replace(/^.+\n.+\n/, "")) && (c.stack += `
` + h) : c.stack = h;
                }
                catch { }
            }
            throw c;
        }
    }
    _request(i, r) { typeof i == "string" ? (r = r || {}, r.url = i) : r = i || {}, r = za(this.defaults, r); const { transitional: c, paramsSerializer: d, headers: h } = r; c !== void 0 && hr.assertOptions(c, { silentJSONParsing: os.transitional(os.boolean), forcedJSONParsing: os.transitional(os.boolean), clarifyTimeoutError: os.transitional(os.boolean) }, !1), d != null && (_.isFunction(d) ? r.paramsSerializer = { serialize: d } : hr.assertOptions(d, { encode: os.function, serialize: os.function }, !0)), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), hr.assertOptions(r, { baseUrl: os.spelling("baseURL"), withXsrfToken: os.spelling("withXSRFToken") }, !0), r.method = (r.method || this.defaults.method || "get").toLowerCase(); let m = h && _.merge(h.common, h[r.method]); h && _.forEach(["delete", "get", "head", "post", "put", "patch", "common"], N => { delete h[N]; }), r.headers = Nt.concat(m, h); const x = []; let g = !0; this.interceptors.request.forEach(function (T) { typeof T.runWhen == "function" && T.runWhen(r) === !1 || (g = g && T.synchronous, x.unshift(T.fulfilled, T.rejected)); }); const y = []; this.interceptors.response.forEach(function (T) { y.push(T.fulfilled, T.rejected); }); let v, b = 0, D; if (!g) {
        const N = [_p.bind(this), void 0];
        for (N.unshift(...x), N.push(...y), D = N.length, v = Promise.resolve(r); b < D;)
            v = v.then(N[b++], N[b++]);
        return v;
    } D = x.length; let A = r; for (; b < D;) {
        const N = x[b++], T = x[b++];
        try {
            A = N(A);
        }
        catch (M) {
            T.call(this, M);
            break;
        }
    } try {
        v = _p.call(this, A);
    }
    catch (N) {
        return Promise.reject(N);
    } for (b = 0, D = y.length; b < D;)
        v = v.then(y[b++], y[b++]); return v; }
    getUri(i) { i = za(this.defaults, i); const r = Ox(i.baseURL, i.url, i.allowAbsoluteUrls); return Cx(r, i.params, i.paramsSerializer); }
};
_.forEach(["delete", "get", "head", "options"], function (i) { Oa.prototype[i] = function (r, c) { return this.request(za(c || {}, { method: i, url: r, data: (c || {}).data })); }; });
_.forEach(["post", "put", "patch"], function (i) { function r(c) { return function (h, m, x) { return this.request(za(x || {}, { method: i, headers: c ? { "Content-Type": "multipart/form-data" } : {}, url: h, data: m })); }; } Oa.prototype[i] = r(), Oa.prototype[i + "Form"] = r(!0); });
let B1 = class Bx {
    constructor(i) { if (typeof i != "function")
        throw new TypeError("executor must be a function."); let r; this.promise = new Promise(function (h) { r = h; }); const c = this; this.promise.then(d => { if (!c._listeners)
        return; let h = c._listeners.length; for (; h-- > 0;)
        c._listeners[h](d); c._listeners = null; }), this.promise.then = d => { let h; const m = new Promise(x => { c.subscribe(x), h = x; }).then(d); return m.cancel = function () { c.unsubscribe(h); }, m; }, i(function (h, m, x) { c.reason || (c.reason = new kl(h, m, x), r(c.reason)); }); }
    throwIfRequested() { if (this.reason)
        throw this.reason; }
    subscribe(i) { if (this.reason) {
        i(this.reason);
        return;
    } this._listeners ? this._listeners.push(i) : this._listeners = [i]; }
    unsubscribe(i) { if (!this._listeners)
        return; const r = this._listeners.indexOf(i); r !== -1 && this._listeners.splice(r, 1); }
    toAbortSignal() { const i = new AbortController, r = c => { i.abort(c); }; return this.subscribe(r), i.signal.unsubscribe = () => this.unsubscribe(r), i.signal; }
    static source() { let i; return { token: new Bx(function (d) { i = d; }), cancel: i }; }
};
function U1(l) { return function (r) { return l.apply(null, r); }; }
function L1(l) { return _.isObject(l) && l.isAxiosError === !0; }
const zu = { Continue: 100, SwitchingProtocols: 101, Processing: 102, EarlyHints: 103, Ok: 200, Created: 201, Accepted: 202, NonAuthoritativeInformation: 203, NoContent: 204, ResetContent: 205, PartialContent: 206, MultiStatus: 207, AlreadyReported: 208, ImUsed: 226, MultipleChoices: 300, MovedPermanently: 301, Found: 302, SeeOther: 303, NotModified: 304, UseProxy: 305, Unused: 306, TemporaryRedirect: 307, PermanentRedirect: 308, BadRequest: 400, Unauthorized: 401, PaymentRequired: 402, Forbidden: 403, NotFound: 404, MethodNotAllowed: 405, NotAcceptable: 406, ProxyAuthenticationRequired: 407, RequestTimeout: 408, Conflict: 409, Gone: 410, LengthRequired: 411, PreconditionFailed: 412, PayloadTooLarge: 413, UriTooLong: 414, UnsupportedMediaType: 415, RangeNotSatisfiable: 416, ExpectationFailed: 417, ImATeapot: 418, MisdirectedRequest: 421, UnprocessableEntity: 422, Locked: 423, FailedDependency: 424, TooEarly: 425, UpgradeRequired: 426, PreconditionRequired: 428, TooManyRequests: 429, RequestHeaderFieldsTooLarge: 431, UnavailableForLegalReasons: 451, InternalServerError: 500, NotImplemented: 501, BadGateway: 502, ServiceUnavailable: 503, GatewayTimeout: 504, HttpVersionNotSupported: 505, VariantAlsoNegotiates: 506, InsufficientStorage: 507, LoopDetected: 508, NotExtended: 510, NetworkAuthenticationRequired: 511, WebServerIsDown: 521, ConnectionTimedOut: 522, OriginIsUnreachable: 523, TimeoutOccurred: 524, SslHandshakeFailed: 525, InvalidSslCertificate: 526 };
Object.entries(zu).forEach(([l, i]) => { zu[i] = l; });
function Ux(l) { const i = new Oa(l), r = px(Oa.prototype.request, i); return _.extend(r, Oa.prototype, i, { allOwnKeys: !0 }), _.extend(r, i, null, { allOwnKeys: !0 }), r.create = function (d) { return Ux(za(l, d)); }, r; }
const He = Ux(Rn);
He.Axios = Oa;
He.CanceledError = kl;
He.CancelToken = B1;
He.isCancel = Mx;
He.VERSION = qx;
He.toFormData = Mr;
He.AxiosError = ne;
He.Cancel = He.CanceledError;
He.all = function (i) { return Promise.all(i); };
He.spread = U1;
He.isAxiosError = L1;
He.mergeConfig = za;
He.AxiosHeaders = Nt;
He.formToJSON = l => Ex(_.isHTMLForm(l) ? new FormData(l) : l);
He.getAdapter = Rx.getAdapter;
He.HttpStatusCode = zu;
He.default = He;
const { Axios: t4, AxiosError: s4, CanceledError: a4, isCancel: l4, CancelToken: n4, VERSION: i4, all: r4, Cancel: c4, isAxiosError: o4, spread: u4, toFormData: d4, AxiosHeaders: f4, HttpStatusCode: h4, formToJSON: m4, getAdapter: p4, mergeConfig: x4 } = He, H1 = "/api", se = He.create({ baseURL: H1, headers: { "Content-Type": "application/json" } });
se.interceptors.request.use(l => { const i = _s.getState().token; return i && (l.headers.Authorization = `Bearer ${i}`), l; }, l => Promise.reject(l));
se.interceptors.response.use(l => l, l => { var i; return ((i = l.response) == null ? void 0 : i.status) === 401 && (_s.getState().logout(), window.location.href = "/v2/login"), Promise.reject(l); });
const Lx = { login: (l, i) => se.post("/auth/login", { username: l, password: i }), verify: () => se.get("/auth/verify"), logout: () => se.post("/auth/logout") }, Or = { getAll: () => se.get("/projects"), getById: l => se.get(`/projects/${l}`), create: l => se.post("/projects", l), update: (l, i) => se.put(`/projects/${l}`, i), delete: l => se.delete(`/projects/${l}`), checkCode: l => se.get(`/projects/check-code/${l}`) }, Zu = { getByProject: l => se.get(`/projects/${l}/epics`), create: (l, i) => se.post(`/projects/${l}/epics`, i), update: (l, i) => se.put(`/epics/${l}`, i), delete: l => se.delete(`/epics/${l}`) }, Ju = { getByProject: l => se.get(`/projects/${l}/sprints`), create: (l, i) => se.post(`/projects/${l}/sprints`, i), update: (l, i) => se.put(`/sprints/${l}`, i), delete: l => se.delete(`/sprints/${l}`) }, ls = { getAll: l => se.get("/tasks", { params: l }), getById: l => se.get(`/tasks/${l}`), create: l => se.post("/tasks", l), update: (l, i) => se.put(`/tasks/${l}`, i), complete: (l, i) => se.put(`/tasks/${l}/complete`, { notes: i }), delete: l => se.delete(`/tasks/${l}`), getItems: l => se.get(`/tasks/${l}/items`), createItems: (l, i) => se.post(`/tasks/${l}/items`, { items: i }), completeItem: (l, i, r) => se.put(`/tasks/${l}/items/${i}/complete`, r), getTags: l => se.get(`/tasks/${l}/tags`), addTag: (l, i) => se.post(`/tasks/${l}/tags`, { tag_id: i }), addTagByName: (l, i) => se.post(`/tasks/${l}/tags`, { tag_name: i }), removeTag: (l, i) => se.delete(`/tasks/${l}/tags/${i}`) }, V1 = { getAll: () => se.get("/tags"), getTasksByTag: (l, i) => se.get(`/tasks/by-tag/${l}`, { params: i }) }, Q1 = { getAll: () => se.get("/agents"), getById: l => se.get(`/agents/${l}`), updateStatus: (l, i, r) => se.put(`/agents/${l}/status`, { status: i, currentTask: r }), getTasks: (l, i) => se.get(`/agents/${l}/tasks`, { params: { status: i } }) }, zr = { getAll: l => se.get("/memories", { params: l }), getById: l => se.get(`/memories/${l}`), search: (l, i) => se.get("/memories/search", { params: { q: l, tags: i == null ? void 0 : i.join(",") } }), create: l => se.post("/memories", l), update: (l, i) => se.put(`/memories/${l}`, i), delete: l => se.delete(`/memories/${l}`), boost: (l, i) => se.post(`/memories/${l}/boost`, { amount: i }), getRelated: l => se.get(`/memories/${l}/related`), getTags: () => se.get("/memories/tags"), getStats: () => se.get("/memories/stats") }, Hx = { getOverview: () => se.get("/dashboard/overview"), getAlerts: () => se.get("/dashboard/alerts"), getActivity: l => se.get("/activity", { params: { limit: l } }) };
function G1() { const [l, i] = H.useState(!0), { token: r, isAuthenticated: c, logout: d, login: h } = _s(); return H.useEffect(() => { async function m() { if (!r) {
    i(!1);
    return;
} try {
    const { data: x } = await Lx.verify();
    x.success && x.user ? h(x.user, r) : d();
}
catch {
    d();
}
finally {
    i(!1);
} } m(); }, []), { isChecking: l, isAuthenticated: c }; } /**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const K1 = l => l.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Vx = (...l) => l.filter((i, r, c) => !!i && i.trim() !== "" && c.indexOf(i) === r).join(" ").trim(); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Y1 = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }; /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const X1 = H.forwardRef(({ color: l = "currentColor", size: i = 24, strokeWidth: r = 2, absoluteStrokeWidth: c, className: d = "", children: h, iconNode: m, ...x }, g) => H.createElement("svg", { ref: g, ...Y1, width: i, height: i, stroke: l, strokeWidth: c ? Number(r) * 24 / Number(i) : r, className: Vx("lucide", d), ...x }, [...m.map(([y, v]) => H.createElement(y, v)), ...Array.isArray(h) ? h : [h]])); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Q = (l, i) => { const r = H.forwardRef(({ className: c, ...d }, h) => H.createElement(X1, { ref: h, iconNode: i, className: Vx(`lucide-${K1(l)}`, c), ...d })); return r.displayName = `${l}`, r; }; /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const _n = Q("Activity", [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2", key: "169zse" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Z1 = Q("AlignLeft", [["path", { d: "M15 12H3", key: "6jk70r" }], ["path", { d: "M17 18H3", key: "1amg6g" }], ["path", { d: "M21 6H3", key: "1jwq7v" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Qx = Q("ArrowDown", [["path", { d: "M12 5v14", key: "s699le" }], ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Du = Q("ArrowLeft", [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mr = Q("ArrowUp", [["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }], ["path", { d: "M12 19V5", key: "x0mq9r" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const J1 = Q("Bell", [["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326", key: "11g9vi" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Dr = Q("Bot", [["path", { d: "M12 8V4H8", key: "hb8ula" }], ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }], ["path", { d: "M2 14h2", key: "vft8re" }], ["path", { d: "M20 14h2", key: "4cs60a" }], ["path", { d: "M15 13v2", key: "1xurst" }], ["path", { d: "M9 13v2", key: "rq6x2g" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Rr = Q("Brain", [["path", { d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z", key: "l5xja" }], ["path", { d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z", key: "ep3f8r" }], ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }], ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }], ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }], ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }], ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }], ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }], ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Fu = Q("Briefcase", [["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }], ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const F1 = Q("Building2", [["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }], ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }], ["path", { d: "M10 6h4", key: "1itunk" }], ["path", { d: "M10 10h4", key: "tcdvrf" }], ["path", { d: "M10 14h4", key: "kelpxr" }], ["path", { d: "M10 18h4", key: "1ulq68" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $1 = Q("CalendarDays", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 14h.01", key: "6423bh" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M16 14h.01", key: "1gbofw" }], ["path", { d: "M8 18h.01", key: "lrp35t" }], ["path", { d: "M12 18h.01", key: "mhygvu" }], ["path", { d: "M16 18h.01", key: "kzsmim" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Da = Q("Calendar", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const W1 = Q("ChartColumn", [["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }], ["path", { d: "M18 17V9", key: "2bz60n" }], ["path", { d: "M13 17V5", key: "1frdt8" }], ["path", { d: "M8 17v-3", key: "17ska0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const I1 = Q("ChartNoAxesColumnIncreasing", [["line", { x1: "12", x2: "12", y1: "20", y2: "10", key: "1vz5eb" }], ["line", { x1: "18", x2: "18", y1: "20", y2: "4", key: "cun8e5" }], ["line", { x1: "6", x2: "6", y1: "20", y2: "16", key: "hq0ia6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const P1 = Q("CheckCheck", [["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }], ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Mn = Q("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ej = Q("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Gx = Q("ChevronLeft", [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $u = Q("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wt = Q("CircleAlert", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }], ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xr = Q("CircleCheckBig", [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ct = Q("CircleCheck", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const tj = Q("CircleDot", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Kx = Q("CirclePlus", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M8 12h8", key: "1wcyev" }], ["path", { d: "M12 8v8", key: "napkw2" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const zp = Q("CircleX", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m15 9-6 6", key: "1uzhvr" }], ["path", { d: "m9 9 6 6", key: "z0biqf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ie = Q("Clock", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Dp = Q("Cloud", [["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const sj = Q("Columns3", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M9 3v18", key: "fh3hqa" }], ["path", { d: "M15 3v18", key: "14nvp0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Tn = Q("Copy", [["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const aj = Q("Database", [["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }], ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }], ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Yx = Q("DollarSign", [["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }], ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ts = Q("ExternalLink", [["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "M10 14 21 3", key: "gplh6r" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Xx = Q("FileText", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M10 9H8", key: "b1mrlr" }], ["path", { d: "M16 13H8", key: "t4e002" }], ["path", { d: "M16 17H8", key: "z1uh3a" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const lj = Q("Filter", [["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Zx = Q("Flag", [["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", key: "i9b6wo" }], ["line", { x1: "4", x2: "4", y1: "22", y2: "15", key: "1cm3nv" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const nj = Q("FlaskConical", [["path", { d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2", key: "18mbvz" }], ["path", { d: "M6.453 15h11.094", key: "3shlmq" }], ["path", { d: "M8.5 2h7", key: "csnxdl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const jl = Q("FolderKanban", [["path", { d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z", key: "1fr9dc" }], ["path", { d: "M8 10v4", key: "tgpxqk" }], ["path", { d: "M12 10v2", key: "hh53o1" }], ["path", { d: "M16 10v6", key: "1d6xys" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Jx = Q("Folder", [["path", { d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z", key: "1kt360" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Rp = Q("GitBranch", [["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }], ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }], ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }], ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Fx = Q("Globe", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }], ["path", { d: "M2 12h20", key: "9i4pu4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Wu = Q("GraduationCap", [["path", { d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z", key: "j76jl0" }], ["path", { d: "M22 10v6", key: "1lu8f3" }], ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ij = Q("GripVertical", [["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }], ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }], ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }], ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }], ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }], ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $x = Q("Hourglass", [["path", { d: "M5 22h14", key: "ehvnwv" }], ["path", { d: "M5 2h14", key: "pdyrp9" }], ["path", { d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22", key: "1d314k" }], ["path", { d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2", key: "1vvvr6" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Wx = Q("Info", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 16v-4", key: "1dtifu" }], ["path", { d: "M12 8h.01", key: "e9boi3" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qp = Q("Key", [["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }], ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }], ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const rj = Q("Laptop", [["path", { d: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16", key: "tarvll" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cj = Q("LayoutDashboard", [["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }], ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }], ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }], ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qn = Q("LayoutGrid", [["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }], ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }], ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }], ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ix = Q("Link2", [["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }], ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }], ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const oj = Q("Link", [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const uj = Q("ListChecks", [["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Px = Q("ListTodo", [["rect", { x: "3", y: "5", width: "6", height: "6", rx: "1", key: "1defrl" }], ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }], ["path", { d: "M13 6h8", key: "15sg57" }], ["path", { d: "M13 12h8", key: "h98zly" }], ["path", { d: "M13 18h8", key: "oe0vm4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Bn = Q("List", [["path", { d: "M3 12h.01", key: "nlz23k" }], ["path", { d: "M3 18h.01", key: "1tta3j" }], ["path", { d: "M3 6h.01", key: "1rqtza" }], ["path", { d: "M8 12h13", key: "1za7za" }], ["path", { d: "M8 18h13", key: "1lx6n3" }], ["path", { d: "M8 6h13", key: "ik3vkj" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ot = Q("LoaderCircle", [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const dj = Q("LogOut", [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }], ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const eg = Q("MessageSquare", [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Bp = Q("Moon", [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fj = Q("MousePointer", [["path", { d: "M12.586 12.586 19 19", key: "ea5xo7" }], ["path", { d: "M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z", key: "277e5u" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Up = Q("Network", [["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }], ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }], ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }], ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }], ["path", { d: "M12 12V8", key: "2874zd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const tg = Q("Palette", [["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }], ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }], ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }], ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }], ["path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z", key: "12rzf8" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const hj = Q("PenLine", [["path", { d: "M12 20h9", key: "t2du7b" }], ["path", { d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z", key: "1ykcvy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qt = Q("Plus", [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "M12 5v14", key: "s699le" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mj = Q("RectangleEllipsis", [["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }], ["path", { d: "M12 12h.01", key: "1mp3jc" }], ["path", { d: "M17 12h.01", key: "1m0b6t" }], ["path", { d: "M7 12h.01", key: "eqddd0" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pj = Q("Save", [["path", { d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", key: "1c8476" }], ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }], ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qr = Q("Search", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const xj = Q("Send", [["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z", key: "1ffxy3" }], ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ru = Q("Server", [["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }], ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }], ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }], ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Iu = Q("Settings", [["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", key: "1qme2f" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gj = Q("Shield", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Pu = Q("SquareChartGantt", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M9 8h7", key: "kbo1nt" }], ["path", { d: "M8 12h6", key: "ikassy" }], ["path", { d: "M11 16h5", key: "oq65wt" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const yj = Q("SquareCheckBig", [["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gr = Q("SquarePen", [["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }], ["path", { d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z", key: "ohrbg2" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const bj = Q("Square", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const vj = Q("Star", [["path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z", key: "r04s7s" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const qu = Q("Sun", [["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }], ["path", { d: "M12 2v2", key: "tus03m" }], ["path", { d: "M12 20v2", key: "1lh1kg" }], ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }], ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }], ["path", { d: "M2 12h2", key: "1t8f8n" }], ["path", { d: "M20 12h2", key: "1q8mjw" }], ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }], ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const sg = Q("Tag", [["path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z", key: "vktsd0" }], ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ag = Q("Tags", [["path", { d: "m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19", key: "1cbfv1" }], ["path", { d: "M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z", key: "135mg7" }], ["circle", { cx: "6.5", cy: "9.5", r: ".5", fill: "currentColor", key: "5pm5xn" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const jj = Q("Target", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Nj = Q("Terminal", [["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }], ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const lg = Q("Trash2", [["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Br = Q("TrendingUp", [["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }], ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Lp = Q("TriangleAlert", [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", key: "wmoenq" }], ["path", { d: "M12 9v4", key: "juzpu7" }], ["path", { d: "M12 17h.01", key: "p32p05" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wj = Q("Type", [["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }], ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }], ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Ra = Q("User", [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }], ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const ng = Q("Users", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sj = Q("WifiOff", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }], ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }], ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }], ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }], ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Aj = Q("Wifi", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }], ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const wl = Q("X", [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]]); /**
* @license lucide-react v0.469.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const yr = Q("Zap", [["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z", key: "1xq2db" }]]), ed = hx(l => ({ sidebarOpen: !0, theme: "dark", toggleSidebar: () => l(i => ({ sidebarOpen: !i.sidebarOpen })), setSidebarOpen: i => l({ sidebarOpen: i }), setTheme: i => l({ theme: i }), toggleTheme: () => l(i => ({ theme: i.theme === "light" ? "dark" : "light" })) })), kj = (l, i) => { const r = new Array(l.length + i.length); for (let c = 0; c < l.length; c++)
    r[c] = l[c]; for (let c = 0; c < i.length; c++)
    r[l.length + c] = i[c]; return r; }, Cj = (l, i) => ({ classGroupId: l, validator: i }), ig = (l = new Map, i = null, r) => ({ nextPart: l, validators: i, classGroupId: r }), br = "-", Hp = [], Tj = "arbitrary..", Ej = l => { const i = _j(l), { conflictingClassGroups: r, conflictingClassGroupModifiers: c } = l; return { getClassGroupId: m => { if (m.startsWith("[") && m.endsWith("]"))
        return Mj(m); const x = m.split(br), g = x[0] === "" && x.length > 1 ? 1 : 0; return rg(x, g, i); }, getConflictingClassGroupIds: (m, x) => { if (x) {
        const g = c[m], y = r[m];
        return g ? y ? kj(y, g) : g : y || Hp;
    } return r[m] || Hp; } }; }, rg = (l, i, r) => { if (l.length - i === 0)
    return r.classGroupId; const d = l[i], h = r.nextPart.get(d); if (h) {
    const y = rg(l, i + 1, h);
    if (y)
        return y;
} const m = r.validators; if (m === null)
    return; const x = i === 0 ? l.join(br) : l.slice(i).join(br), g = m.length; for (let y = 0; y < g; y++) {
    const v = m[y];
    if (v.validator(x))
        return v.classGroupId;
} }, Mj = l => l.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => { const i = l.slice(1, -1), r = i.indexOf(":"), c = i.slice(0, r); return c ? Tj + c : void 0; })(), _j = l => { const { theme: i, classGroups: r } = l; return Oj(r, i); }, Oj = (l, i) => { const r = ig(); for (const c in l) {
    const d = l[c];
    td(d, r, c, i);
} return r; }, td = (l, i, r, c) => { const d = l.length; for (let h = 0; h < d; h++) {
    const m = l[h];
    zj(m, i, r, c);
} }, zj = (l, i, r, c) => { if (typeof l == "string") {
    Dj(l, i, r);
    return;
} if (typeof l == "function") {
    Rj(l, i, r, c);
    return;
} qj(l, i, r, c); }, Dj = (l, i, r) => { const c = l === "" ? i : cg(i, l); c.classGroupId = r; }, Rj = (l, i, r, c) => { if (Bj(l)) {
    td(l(c), i, r, c);
    return;
} i.validators === null && (i.validators = []), i.validators.push(Cj(r, l)); }, qj = (l, i, r, c) => { const d = Object.entries(l), h = d.length; for (let m = 0; m < h; m++) {
    const [x, g] = d[m];
    td(g, cg(i, x), r, c);
} }, cg = (l, i) => { let r = l; const c = i.split(br), d = c.length; for (let h = 0; h < d; h++) {
    const m = c[h];
    let x = r.nextPart.get(m);
    x || (x = ig(), r.nextPart.set(m, x)), r = x;
} return r; }, Bj = l => "isThemeGetter" in l && l.isThemeGetter === !0, Uj = l => { if (l < 1)
    return { get: () => { }, set: () => { } }; let i = 0, r = Object.create(null), c = Object.create(null); const d = (h, m) => { r[h] = m, i++, i > l && (i = 0, c = r, r = Object.create(null)); }; return { get(h) { let m = r[h]; if (m !== void 0)
        return m; if ((m = c[h]) !== void 0)
        return d(h, m), m; }, set(h, m) { h in r ? r[h] = m : d(h, m); } }; }, Bu = "!", Vp = ":", Lj = [], Qp = (l, i, r, c, d) => ({ modifiers: l, hasImportantModifier: i, baseClassName: r, maybePostfixModifierPosition: c, isExternal: d }), Hj = l => { const { prefix: i, experimentalParseClassName: r } = l; let c = d => { const h = []; let m = 0, x = 0, g = 0, y; const v = d.length; for (let T = 0; T < v; T++) {
    const M = d[T];
    if (m === 0 && x === 0) {
        if (M === Vp) {
            h.push(d.slice(g, T)), g = T + 1;
            continue;
        }
        if (M === "/") {
            y = T;
            continue;
        }
    }
    M === "[" ? m++ : M === "]" ? m-- : M === "(" ? x++ : M === ")" && x--;
} const b = h.length === 0 ? d : d.slice(g); let D = b, A = !1; b.endsWith(Bu) ? (D = b.slice(0, -1), A = !0) : b.startsWith(Bu) && (D = b.slice(1), A = !0); const N = y && y > g ? y - g : void 0; return Qp(h, A, D, N); }; if (i) {
    const d = i + Vp, h = c;
    c = m => m.startsWith(d) ? h(m.slice(d.length)) : Qp(Lj, !1, m, void 0, !0);
} if (r) {
    const d = c;
    c = h => r({ className: h, parseClassName: d });
} return c; }, Vj = l => { const i = new Map; return l.orderSensitiveModifiers.forEach((r, c) => { i.set(r, 1e6 + c); }), r => { const c = []; let d = []; for (let h = 0; h < r.length; h++) {
    const m = r[h], x = m[0] === "[", g = i.has(m);
    x || g ? (d.length > 0 && (d.sort(), c.push(...d), d = []), c.push(m)) : d.push(m);
} return d.length > 0 && (d.sort(), c.push(...d)), c; }; }, Qj = l => ({ cache: Uj(l.cacheSize), parseClassName: Hj(l), sortModifiers: Vj(l), ...Ej(l) }), Gj = /\s+/, Kj = (l, i) => { const { parseClassName: r, getClassGroupId: c, getConflictingClassGroupIds: d, sortModifiers: h } = i, m = [], x = l.trim().split(Gj); let g = ""; for (let y = x.length - 1; y >= 0; y -= 1) {
    const v = x[y], { isExternal: b, modifiers: D, hasImportantModifier: A, baseClassName: N, maybePostfixModifierPosition: T } = r(v);
    if (b) {
        g = v + (g.length > 0 ? " " + g : g);
        continue;
    }
    let M = !!T, G = c(M ? N.substring(0, T) : N);
    if (!G) {
        if (!M) {
            g = v + (g.length > 0 ? " " + g : g);
            continue;
        }
        if (G = c(N), !G) {
            g = v + (g.length > 0 ? " " + g : g);
            continue;
        }
        M = !1;
    }
    const V = D.length === 0 ? "" : D.length === 1 ? D[0] : h(D).join(":"), X = A ? V + Bu : V, ee = X + G;
    if (m.indexOf(ee) > -1)
        continue;
    m.push(ee);
    const re = d(G, M);
    for (let I = 0; I < re.length; ++I) {
        const U = re[I];
        m.push(X + U);
    }
    g = v + (g.length > 0 ? " " + g : g);
} return g; }, Yj = (...l) => { let i = 0, r, c, d = ""; for (; i < l.length;)
    (r = l[i++]) && (c = og(r)) && (d && (d += " "), d += c); return d; }, og = l => { if (typeof l == "string")
    return l; let i, r = ""; for (let c = 0; c < l.length; c++)
    l[c] && (i = og(l[c])) && (r && (r += " "), r += i); return r; }, Xj = (l, ...i) => { let r, c, d, h; const m = g => { const y = i.reduce((v, b) => b(v), l()); return r = Qj(y), c = r.cache.get, d = r.cache.set, h = x, x(g); }, x = g => { const y = c(g); if (y)
    return y; const v = Kj(g, r); return d(g, v), v; }; return h = m, (...g) => h(Yj(...g)); }, Zj = [], Je = l => { const i = r => r[l] || Zj; return i.isThemeGetter = !0, i; }, ug = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, dg = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Jj = /^\d+\/\d+$/, Fj = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, $j = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Wj = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Ij = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Pj = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, vl = l => Jj.test(l), oe = l => !!l && !Number.isNaN(Number(l)), ia = l => !!l && Number.isInteger(Number(l)), mu = l => l.endsWith("%") && oe(l.slice(0, -1)), Ms = l => Fj.test(l), e2 = () => !0, t2 = l => $j.test(l) && !Wj.test(l), fg = () => !1, s2 = l => Ij.test(l), a2 = l => Pj.test(l), l2 = l => !F(l) && !$(l), n2 = l => Cl(l, pg, fg), F = l => ug.test(l), Ma = l => Cl(l, xg, t2), pu = l => Cl(l, u2, oe), Gp = l => Cl(l, hg, fg), i2 = l => Cl(l, mg, a2), lr = l => Cl(l, gg, s2), $ = l => dg.test(l), An = l => Tl(l, xg), r2 = l => Tl(l, d2), Kp = l => Tl(l, hg), c2 = l => Tl(l, pg), o2 = l => Tl(l, mg), nr = l => Tl(l, gg, !0), Cl = (l, i, r) => { const c = ug.exec(l); return c ? c[1] ? i(c[1]) : r(c[2]) : !1; }, Tl = (l, i, r = !1) => { const c = dg.exec(l); return c ? c[1] ? i(c[1]) : r : !1; }, hg = l => l === "position" || l === "percentage", mg = l => l === "image" || l === "url", pg = l => l === "length" || l === "size" || l === "bg-size", xg = l => l === "length", u2 = l => l === "number", d2 = l => l === "family-name", gg = l => l === "shadow", f2 = () => { const l = Je("color"), i = Je("font"), r = Je("text"), c = Je("font-weight"), d = Je("tracking"), h = Je("leading"), m = Je("breakpoint"), x = Je("container"), g = Je("spacing"), y = Je("radius"), v = Je("shadow"), b = Je("inset-shadow"), D = Je("text-shadow"), A = Je("drop-shadow"), N = Je("blur"), T = Je("perspective"), M = Je("aspect"), G = Je("ease"), V = Je("animate"), X = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], ee = () => ["center", "top", "bottom", "left", "right", "top-left", "left-top", "top-right", "right-top", "bottom-right", "right-bottom", "bottom-left", "left-bottom"], re = () => [...ee(), $, F], I = () => ["auto", "hidden", "clip", "visible", "scroll"], U = () => ["auto", "contain", "none"], Y = () => [$, F, g], we = () => [vl, "full", "auto", ...Y()], ft = () => [ia, "none", "subgrid", $, F], et = () => ["auto", { span: ["full", ia, $, F] }, ia, $, F], Me = () => [ia, "auto", $, F], ut = () => ["auto", "min", "max", "fr", $, F], Xe = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], he = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], O = () => ["auto", ...Y()], K = () => [vl, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...Y()], L = () => [l, $, F], ce = () => [...ee(), Kp, Gp, { position: [$, F] }], ve = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }], ge = () => ["auto", "cover", "contain", c2, n2, { size: [$, F] }], me = () => [mu, An, Ma], ae = () => ["", "none", "full", y, $, F], ue = () => ["", oe, An, Ma], Fe = () => ["solid", "dashed", "dotted", "double"], Ft = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], Re = () => [oe, mu, Kp, Gp], ua = () => ["", "none", N, $, F], $t = () => ["none", oe, $, F], Os = () => ["none", oe, $, F], zs = () => [oe, $, F], Ds = () => [vl, "full", ...Y()]; return { cacheSize: 500, theme: { animate: ["spin", "ping", "pulse", "bounce"], aspect: ["video"], blur: [Ms], breakpoint: [Ms], color: [e2], container: [Ms], "drop-shadow": [Ms], ease: ["in", "out", "in-out"], font: [l2], "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"], "inset-shadow": [Ms], leading: ["none", "tight", "snug", "normal", "relaxed", "loose"], perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"], radius: [Ms], shadow: [Ms], spacing: ["px", oe], text: [Ms], "text-shadow": [Ms], tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"] }, classGroups: { aspect: [{ aspect: ["auto", "square", vl, F, $, M] }], container: ["container"], columns: [{ columns: [oe, F, $, x] }], "break-after": [{ "break-after": X() }], "break-before": [{ "break-before": X() }], "break-inside": [{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] }], "box-decoration": [{ "box-decoration": ["slice", "clone"] }], box: [{ box: ["border", "content"] }], display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"], sr: ["sr-only", "not-sr-only"], float: [{ float: ["right", "left", "none", "start", "end"] }], clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }], isolation: ["isolate", "isolation-auto"], "object-fit": [{ object: ["contain", "cover", "fill", "none", "scale-down"] }], "object-position": [{ object: re() }], overflow: [{ overflow: I() }], "overflow-x": [{ "overflow-x": I() }], "overflow-y": [{ "overflow-y": I() }], overscroll: [{ overscroll: U() }], "overscroll-x": [{ "overscroll-x": U() }], "overscroll-y": [{ "overscroll-y": U() }], position: ["static", "fixed", "absolute", "relative", "sticky"], inset: [{ inset: we() }], "inset-x": [{ "inset-x": we() }], "inset-y": [{ "inset-y": we() }], start: [{ start: we() }], end: [{ end: we() }], top: [{ top: we() }], right: [{ right: we() }], bottom: [{ bottom: we() }], left: [{ left: we() }], visibility: ["visible", "invisible", "collapse"], z: [{ z: [ia, "auto", $, F] }], basis: [{ basis: [vl, "full", "auto", x, ...Y()] }], "flex-direction": [{ flex: ["row", "row-reverse", "col", "col-reverse"] }], "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }], flex: [{ flex: [oe, vl, "auto", "initial", "none", F] }], grow: [{ grow: ["", oe, $, F] }], shrink: [{ shrink: ["", oe, $, F] }], order: [{ order: [ia, "first", "last", "none", $, F] }], "grid-cols": [{ "grid-cols": ft() }], "col-start-end": [{ col: et() }], "col-start": [{ "col-start": Me() }], "col-end": [{ "col-end": Me() }], "grid-rows": [{ "grid-rows": ft() }], "row-start-end": [{ row: et() }], "row-start": [{ "row-start": Me() }], "row-end": [{ "row-end": Me() }], "grid-flow": [{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] }], "auto-cols": [{ "auto-cols": ut() }], "auto-rows": [{ "auto-rows": ut() }], gap: [{ gap: Y() }], "gap-x": [{ "gap-x": Y() }], "gap-y": [{ "gap-y": Y() }], "justify-content": [{ justify: [...Xe(), "normal"] }], "justify-items": [{ "justify-items": [...he(), "normal"] }], "justify-self": [{ "justify-self": ["auto", ...he()] }], "align-content": [{ content: ["normal", ...Xe()] }], "align-items": [{ items: [...he(), { baseline: ["", "last"] }] }], "align-self": [{ self: ["auto", ...he(), { baseline: ["", "last"] }] }], "place-content": [{ "place-content": Xe() }], "place-items": [{ "place-items": [...he(), "baseline"] }], "place-self": [{ "place-self": ["auto", ...he()] }], p: [{ p: Y() }], px: [{ px: Y() }], py: [{ py: Y() }], ps: [{ ps: Y() }], pe: [{ pe: Y() }], pt: [{ pt: Y() }], pr: [{ pr: Y() }], pb: [{ pb: Y() }], pl: [{ pl: Y() }], m: [{ m: O() }], mx: [{ mx: O() }], my: [{ my: O() }], ms: [{ ms: O() }], me: [{ me: O() }], mt: [{ mt: O() }], mr: [{ mr: O() }], mb: [{ mb: O() }], ml: [{ ml: O() }], "space-x": [{ "space-x": Y() }], "space-x-reverse": ["space-x-reverse"], "space-y": [{ "space-y": Y() }], "space-y-reverse": ["space-y-reverse"], size: [{ size: K() }], w: [{ w: [x, "screen", ...K()] }], "min-w": [{ "min-w": [x, "screen", "none", ...K()] }], "max-w": [{ "max-w": [x, "screen", "none", "prose", { screen: [m] }, ...K()] }], h: [{ h: ["screen", "lh", ...K()] }], "min-h": [{ "min-h": ["screen", "lh", "none", ...K()] }], "max-h": [{ "max-h": ["screen", "lh", ...K()] }], "font-size": [{ text: ["base", r, An, Ma] }], "font-smoothing": ["antialiased", "subpixel-antialiased"], "font-style": ["italic", "not-italic"], "font-weight": [{ font: [c, $, pu] }], "font-stretch": [{ "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", mu, F] }], "font-family": [{ font: [r2, F, i] }], "fvn-normal": ["normal-nums"], "fvn-ordinal": ["ordinal"], "fvn-slashed-zero": ["slashed-zero"], "fvn-figure": ["lining-nums", "oldstyle-nums"], "fvn-spacing": ["proportional-nums", "tabular-nums"], "fvn-fraction": ["diagonal-fractions", "stacked-fractions"], tracking: [{ tracking: [d, $, F] }], "line-clamp": [{ "line-clamp": [oe, "none", $, pu] }], leading: [{ leading: [h, ...Y()] }], "list-image": [{ "list-image": ["none", $, F] }], "list-style-position": [{ list: ["inside", "outside"] }], "list-style-type": [{ list: ["disc", "decimal", "none", $, F] }], "text-alignment": [{ text: ["left", "center", "right", "justify", "start", "end"] }], "placeholder-color": [{ placeholder: L() }], "text-color": [{ text: L() }], "text-decoration": ["underline", "overline", "line-through", "no-underline"], "text-decoration-style": [{ decoration: [...Fe(), "wavy"] }], "text-decoration-thickness": [{ decoration: [oe, "from-font", "auto", $, Ma] }], "text-decoration-color": [{ decoration: L() }], "underline-offset": [{ "underline-offset": [oe, "auto", $, F] }], "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"], "text-overflow": ["truncate", "text-ellipsis", "text-clip"], "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }], indent: [{ indent: Y() }], "vertical-align": [{ align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", $, F] }], whitespace: [{ whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"] }], break: [{ break: ["normal", "words", "all", "keep"] }], wrap: [{ wrap: ["break-word", "anywhere", "normal"] }], hyphens: [{ hyphens: ["none", "manual", "auto"] }], content: [{ content: ["none", $, F] }], "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }], "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }], "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }], "bg-position": [{ bg: ce() }], "bg-repeat": [{ bg: ve() }], "bg-size": [{ bg: ge() }], "bg-image": [{ bg: ["none", { linear: [{ to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] }, ia, $, F], radial: ["", $, F], conic: [ia, $, F] }, o2, i2] }], "bg-color": [{ bg: L() }], "gradient-from-pos": [{ from: me() }], "gradient-via-pos": [{ via: me() }], "gradient-to-pos": [{ to: me() }], "gradient-from": [{ from: L() }], "gradient-via": [{ via: L() }], "gradient-to": [{ to: L() }], rounded: [{ rounded: ae() }], "rounded-s": [{ "rounded-s": ae() }], "rounded-e": [{ "rounded-e": ae() }], "rounded-t": [{ "rounded-t": ae() }], "rounded-r": [{ "rounded-r": ae() }], "rounded-b": [{ "rounded-b": ae() }], "rounded-l": [{ "rounded-l": ae() }], "rounded-ss": [{ "rounded-ss": ae() }], "rounded-se": [{ "rounded-se": ae() }], "rounded-ee": [{ "rounded-ee": ae() }], "rounded-es": [{ "rounded-es": ae() }], "rounded-tl": [{ "rounded-tl": ae() }], "rounded-tr": [{ "rounded-tr": ae() }], "rounded-br": [{ "rounded-br": ae() }], "rounded-bl": [{ "rounded-bl": ae() }], "border-w": [{ border: ue() }], "border-w-x": [{ "border-x": ue() }], "border-w-y": [{ "border-y": ue() }], "border-w-s": [{ "border-s": ue() }], "border-w-e": [{ "border-e": ue() }], "border-w-t": [{ "border-t": ue() }], "border-w-r": [{ "border-r": ue() }], "border-w-b": [{ "border-b": ue() }], "border-w-l": [{ "border-l": ue() }], "divide-x": [{ "divide-x": ue() }], "divide-x-reverse": ["divide-x-reverse"], "divide-y": [{ "divide-y": ue() }], "divide-y-reverse": ["divide-y-reverse"], "border-style": [{ border: [...Fe(), "hidden", "none"] }], "divide-style": [{ divide: [...Fe(), "hidden", "none"] }], "border-color": [{ border: L() }], "border-color-x": [{ "border-x": L() }], "border-color-y": [{ "border-y": L() }], "border-color-s": [{ "border-s": L() }], "border-color-e": [{ "border-e": L() }], "border-color-t": [{ "border-t": L() }], "border-color-r": [{ "border-r": L() }], "border-color-b": [{ "border-b": L() }], "border-color-l": [{ "border-l": L() }], "divide-color": [{ divide: L() }], "outline-style": [{ outline: [...Fe(), "none", "hidden"] }], "outline-offset": [{ "outline-offset": [oe, $, F] }], "outline-w": [{ outline: ["", oe, An, Ma] }], "outline-color": [{ outline: L() }], shadow: [{ shadow: ["", "none", v, nr, lr] }], "shadow-color": [{ shadow: L() }], "inset-shadow": [{ "inset-shadow": ["none", b, nr, lr] }], "inset-shadow-color": [{ "inset-shadow": L() }], "ring-w": [{ ring: ue() }], "ring-w-inset": ["ring-inset"], "ring-color": [{ ring: L() }], "ring-offset-w": [{ "ring-offset": [oe, Ma] }], "ring-offset-color": [{ "ring-offset": L() }], "inset-ring-w": [{ "inset-ring": ue() }], "inset-ring-color": [{ "inset-ring": L() }], "text-shadow": [{ "text-shadow": ["none", D, nr, lr] }], "text-shadow-color": [{ "text-shadow": L() }], opacity: [{ opacity: [oe, $, F] }], "mix-blend": [{ "mix-blend": [...Ft(), "plus-darker", "plus-lighter"] }], "bg-blend": [{ "bg-blend": Ft() }], "mask-clip": [{ "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"] }, "mask-no-clip"], "mask-composite": [{ mask: ["add", "subtract", "intersect", "exclude"] }], "mask-image-linear-pos": [{ "mask-linear": [oe] }], "mask-image-linear-from-pos": [{ "mask-linear-from": Re() }], "mask-image-linear-to-pos": [{ "mask-linear-to": Re() }], "mask-image-linear-from-color": [{ "mask-linear-from": L() }], "mask-image-linear-to-color": [{ "mask-linear-to": L() }], "mask-image-t-from-pos": [{ "mask-t-from": Re() }], "mask-image-t-to-pos": [{ "mask-t-to": Re() }], "mask-image-t-from-color": [{ "mask-t-from": L() }], "mask-image-t-to-color": [{ "mask-t-to": L() }], "mask-image-r-from-pos": [{ "mask-r-from": Re() }], "mask-image-r-to-pos": [{ "mask-r-to": Re() }], "mask-image-r-from-color": [{ "mask-r-from": L() }], "mask-image-r-to-color": [{ "mask-r-to": L() }], "mask-image-b-from-pos": [{ "mask-b-from": Re() }], "mask-image-b-to-pos": [{ "mask-b-to": Re() }], "mask-image-b-from-color": [{ "mask-b-from": L() }], "mask-image-b-to-color": [{ "mask-b-to": L() }], "mask-image-l-from-pos": [{ "mask-l-from": Re() }], "mask-image-l-to-pos": [{ "mask-l-to": Re() }], "mask-image-l-from-color": [{ "mask-l-from": L() }], "mask-image-l-to-color": [{ "mask-l-to": L() }], "mask-image-x-from-pos": [{ "mask-x-from": Re() }], "mask-image-x-to-pos": [{ "mask-x-to": Re() }], "mask-image-x-from-color": [{ "mask-x-from": L() }], "mask-image-x-to-color": [{ "mask-x-to": L() }], "mask-image-y-from-pos": [{ "mask-y-from": Re() }], "mask-image-y-to-pos": [{ "mask-y-to": Re() }], "mask-image-y-from-color": [{ "mask-y-from": L() }], "mask-image-y-to-color": [{ "mask-y-to": L() }], "mask-image-radial": [{ "mask-radial": [$, F] }], "mask-image-radial-from-pos": [{ "mask-radial-from": Re() }], "mask-image-radial-to-pos": [{ "mask-radial-to": Re() }], "mask-image-radial-from-color": [{ "mask-radial-from": L() }], "mask-image-radial-to-color": [{ "mask-radial-to": L() }], "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }], "mask-image-radial-size": [{ "mask-radial": [{ closest: ["side", "corner"], farthest: ["side", "corner"] }] }], "mask-image-radial-pos": [{ "mask-radial-at": ee() }], "mask-image-conic-pos": [{ "mask-conic": [oe] }], "mask-image-conic-from-pos": [{ "mask-conic-from": Re() }], "mask-image-conic-to-pos": [{ "mask-conic-to": Re() }], "mask-image-conic-from-color": [{ "mask-conic-from": L() }], "mask-image-conic-to-color": [{ "mask-conic-to": L() }], "mask-mode": [{ mask: ["alpha", "luminance", "match"] }], "mask-origin": [{ "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"] }], "mask-position": [{ mask: ce() }], "mask-repeat": [{ mask: ve() }], "mask-size": [{ mask: ge() }], "mask-type": [{ "mask-type": ["alpha", "luminance"] }], "mask-image": [{ mask: ["none", $, F] }], filter: [{ filter: ["", "none", $, F] }], blur: [{ blur: ua() }], brightness: [{ brightness: [oe, $, F] }], contrast: [{ contrast: [oe, $, F] }], "drop-shadow": [{ "drop-shadow": ["", "none", A, nr, lr] }], "drop-shadow-color": [{ "drop-shadow": L() }], grayscale: [{ grayscale: ["", oe, $, F] }], "hue-rotate": [{ "hue-rotate": [oe, $, F] }], invert: [{ invert: ["", oe, $, F] }], saturate: [{ saturate: [oe, $, F] }], sepia: [{ sepia: ["", oe, $, F] }], "backdrop-filter": [{ "backdrop-filter": ["", "none", $, F] }], "backdrop-blur": [{ "backdrop-blur": ua() }], "backdrop-brightness": [{ "backdrop-brightness": [oe, $, F] }], "backdrop-contrast": [{ "backdrop-contrast": [oe, $, F] }], "backdrop-grayscale": [{ "backdrop-grayscale": ["", oe, $, F] }], "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [oe, $, F] }], "backdrop-invert": [{ "backdrop-invert": ["", oe, $, F] }], "backdrop-opacity": [{ "backdrop-opacity": [oe, $, F] }], "backdrop-saturate": [{ "backdrop-saturate": [oe, $, F] }], "backdrop-sepia": [{ "backdrop-sepia": ["", oe, $, F] }], "border-collapse": [{ border: ["collapse", "separate"] }], "border-spacing": [{ "border-spacing": Y() }], "border-spacing-x": [{ "border-spacing-x": Y() }], "border-spacing-y": [{ "border-spacing-y": Y() }], "table-layout": [{ table: ["auto", "fixed"] }], caption: [{ caption: ["top", "bottom"] }], transition: [{ transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", $, F] }], "transition-behavior": [{ transition: ["normal", "discrete"] }], duration: [{ duration: [oe, "initial", $, F] }], ease: [{ ease: ["linear", "initial", G, $, F] }], delay: [{ delay: [oe, $, F] }], animate: [{ animate: ["none", V, $, F] }], backface: [{ backface: ["hidden", "visible"] }], perspective: [{ perspective: [T, $, F] }], "perspective-origin": [{ "perspective-origin": re() }], rotate: [{ rotate: $t() }], "rotate-x": [{ "rotate-x": $t() }], "rotate-y": [{ "rotate-y": $t() }], "rotate-z": [{ "rotate-z": $t() }], scale: [{ scale: Os() }], "scale-x": [{ "scale-x": Os() }], "scale-y": [{ "scale-y": Os() }], "scale-z": [{ "scale-z": Os() }], "scale-3d": ["scale-3d"], skew: [{ skew: zs() }], "skew-x": [{ "skew-x": zs() }], "skew-y": [{ "skew-y": zs() }], transform: [{ transform: [$, F, "", "none", "gpu", "cpu"] }], "transform-origin": [{ origin: re() }], "transform-style": [{ transform: ["3d", "flat"] }], translate: [{ translate: Ds() }], "translate-x": [{ "translate-x": Ds() }], "translate-y": [{ "translate-y": Ds() }], "translate-z": [{ "translate-z": Ds() }], "translate-none": ["translate-none"], accent: [{ accent: L() }], appearance: [{ appearance: ["none", "auto"] }], "caret-color": [{ caret: L() }], "color-scheme": [{ scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"] }], cursor: [{ cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", $, F] }], "field-sizing": [{ "field-sizing": ["fixed", "content"] }], "pointer-events": [{ "pointer-events": ["auto", "none"] }], resize: [{ resize: ["none", "", "y", "x"] }], "scroll-behavior": [{ scroll: ["auto", "smooth"] }], "scroll-m": [{ "scroll-m": Y() }], "scroll-mx": [{ "scroll-mx": Y() }], "scroll-my": [{ "scroll-my": Y() }], "scroll-ms": [{ "scroll-ms": Y() }], "scroll-me": [{ "scroll-me": Y() }], "scroll-mt": [{ "scroll-mt": Y() }], "scroll-mr": [{ "scroll-mr": Y() }], "scroll-mb": [{ "scroll-mb": Y() }], "scroll-ml": [{ "scroll-ml": Y() }], "scroll-p": [{ "scroll-p": Y() }], "scroll-px": [{ "scroll-px": Y() }], "scroll-py": [{ "scroll-py": Y() }], "scroll-ps": [{ "scroll-ps": Y() }], "scroll-pe": [{ "scroll-pe": Y() }], "scroll-pt": [{ "scroll-pt": Y() }], "scroll-pr": [{ "scroll-pr": Y() }], "scroll-pb": [{ "scroll-pb": Y() }], "scroll-pl": [{ "scroll-pl": Y() }], "snap-align": [{ snap: ["start", "end", "center", "align-none"] }], "snap-stop": [{ snap: ["normal", "always"] }], "snap-type": [{ snap: ["none", "x", "y", "both"] }], "snap-strictness": [{ snap: ["mandatory", "proximity"] }], touch: [{ touch: ["auto", "none", "manipulation"] }], "touch-x": [{ "touch-pan": ["x", "left", "right"] }], "touch-y": [{ "touch-pan": ["y", "up", "down"] }], "touch-pz": ["touch-pinch-zoom"], select: [{ select: ["none", "text", "all", "auto"] }], "will-change": [{ "will-change": ["auto", "scroll", "contents", "transform", $, F] }], fill: [{ fill: ["none", ...L()] }], "stroke-w": [{ stroke: [oe, An, Ma, pu] }], stroke: [{ stroke: ["none", ...L()] }], "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }] }, conflictingClassGroups: { overflow: ["overflow-x", "overflow-y"], overscroll: ["overscroll-x", "overscroll-y"], inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"], "inset-x": ["right", "left"], "inset-y": ["top", "bottom"], flex: ["basis", "grow", "shrink"], gap: ["gap-x", "gap-y"], p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"], px: ["pr", "pl"], py: ["pt", "pb"], m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"], mx: ["mr", "ml"], my: ["mt", "mb"], size: ["w", "h"], "font-size": ["leading"], "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"], "fvn-ordinal": ["fvn-normal"], "fvn-slashed-zero": ["fvn-normal"], "fvn-figure": ["fvn-normal"], "fvn-spacing": ["fvn-normal"], "fvn-fraction": ["fvn-normal"], "line-clamp": ["display", "overflow"], rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"], "rounded-s": ["rounded-ss", "rounded-es"], "rounded-e": ["rounded-se", "rounded-ee"], "rounded-t": ["rounded-tl", "rounded-tr"], "rounded-r": ["rounded-tr", "rounded-br"], "rounded-b": ["rounded-br", "rounded-bl"], "rounded-l": ["rounded-tl", "rounded-bl"], "border-spacing": ["border-spacing-x", "border-spacing-y"], "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"], "border-w-x": ["border-w-r", "border-w-l"], "border-w-y": ["border-w-t", "border-w-b"], "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"], "border-color-x": ["border-color-r", "border-color-l"], "border-color-y": ["border-color-t", "border-color-b"], translate: ["translate-x", "translate-y", "translate-none"], "translate-none": ["translate", "translate-x", "translate-y", "translate-z"], "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"], "scroll-mx": ["scroll-mr", "scroll-ml"], "scroll-my": ["scroll-mt", "scroll-mb"], "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"], "scroll-px": ["scroll-pr", "scroll-pl"], "scroll-py": ["scroll-pt", "scroll-pb"], touch: ["touch-x", "touch-y", "touch-pz"], "touch-x": ["touch"], "touch-y": ["touch"], "touch-pz": ["touch"] }, conflictingClassGroupModifiers: { "font-size": ["leading"] }, orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"] }; }, h2 = Xj(f2);
function Z(...l) { return h2(sb(l)); }
function Ur(l) { return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(l)); }
function it(l) { const i = new Date, r = new Date(l), c = i.getTime() - r.getTime(), d = Math.floor(c / 1e3), h = Math.floor(d / 60), m = Math.floor(h / 60), x = Math.floor(m / 24); return x > 7 ? Ur(l) : x > 0 ? `hace ${x}d` : m > 0 ? `hace ${m}h` : h > 0 ? `hace ${h}m` : "ahora"; }
function xu(l) { return new Intl.NumberFormat("es-MX").format(l); }
function yg(l) { return { active: "bg-green-500", in_progress: "bg-blue-500", pending: "bg-yellow-500", completed: "bg-green-500", blocked: "bg-red-500", review: "bg-purple-500", inactive: "bg-gray-500", error: "bg-red-500", busy: "bg-orange-500" }[l] || "bg-gray-500"; }
function m2(l) { return { critical: "text-red-500 bg-red-500/10", high: "text-orange-500 bg-orange-500/10", medium: "text-yellow-500 bg-yellow-500/10", low: "text-green-500 bg-green-500/10" }[l] || "text-gray-500 bg-gray-500/10"; }
const p2 = [{ name: "Dashboard", href: "/dashboard", icon: cj }, { name: "Proyectos", href: "/projects", icon: jl }, { name: "Negocios", href: "/businesses", icon: Fu }, { name: "Infraestructura", href: "/infrastructure", icon: Ru }, { name: "Design Hub", href: "/design-hub", icon: tg }, { name: "Memorias", href: "/memories", icon: Rr }], x2 = [{ name: "VibeSDK", href: "https://docs.vibe-sdk.com", icon: ts, color: "text-purple-400" }];
function g2() { const { sidebarOpen: l, toggleSidebar: i } = ed(); return a.jsxs("aside", { className: Z("fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col", l ? "w-64" : "w-16"), children: [a.jsxs("div", { className: "flex h-16 items-center justify-between border-b border-border px-4", children: [l ? a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("img", { src: "/solaria-logo.png", alt: "SOLARIA", className: "h-9 w-9", onError: r => { r.currentTarget.style.display = "none"; } }), a.jsxs("div", { className: "flex flex-col", children: [a.jsx("span", { className: "font-bold text-lg solaria-text-gradient", children: "SOLARIA" }), a.jsx("span", { className: "text-[10px] text-muted-foreground -mt-1", children: "Digital Field Operations" })] })] }) : a.jsx("img", { src: "/solaria-logo.png", alt: "S", className: "h-8 w-8 mx-auto", onError: r => { r.currentTarget.style.display = "none"; } }), a.jsx("button", { onClick: i, className: "p-2 rounded-lg hover:bg-accent transition-colors", "aria-label": l ? "Colapsar sidebar" : "Expandir sidebar", children: l ? a.jsx(Gx, { className: "h-5 w-5" }) : a.jsx($u, { className: "h-5 w-5" }) })] }), a.jsxs("nav", { className: "flex flex-col gap-1 p-2 flex-1", children: [l && a.jsx("div", { className: "px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider", children: "Navegacion" }), p2.map(r => a.jsxs(Iy, { to: r.href, className: ({ isActive: c }) => Z("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [a.jsx(r.icon, { className: "h-5 w-5 flex-shrink-0" }), l && a.jsx("span", { children: r.name })] }, r.name)), l && a.jsx("div", { className: "my-2 border-t border-border" }), l && a.jsx("div", { className: "px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider", children: "Enlaces" }), x2.map(r => a.jsxs("a", { href: r.href, target: "_blank", rel: "noopener noreferrer", className: Z("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [a.jsx(r.icon, { className: Z("h-5 w-5 flex-shrink-0", r.color) }), l && a.jsxs(a.Fragment, { children: [a.jsx("span", { children: r.name }), a.jsx(ts, { className: "h-3 w-3 ml-auto opacity-50" })] })] }, r.name))] }), l && a.jsx("div", { className: "p-4 border-t border-border", children: a.jsxs("div", { className: "rounded-lg bg-accent/50 p-3 text-center", children: [a.jsxs("div", { className: "text-xs text-muted-foreground", children: [a.jsx("span", { className: "solaria-text-gradient font-semibold", children: "SOLARIA" }), a.jsx("span", { children: " DFO" })] }), a.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "v3.2.0" })] }) })] }); }
function y2() { return Pe({ queryKey: ["dashboard", "overview"], queryFn: async () => { var r, c, d, h, m, x, g, y, v, b, D; const { data: l } = await Hx.getOverview(), i = l.data || l; return { totalProjects: ((r = i.projects) == null ? void 0 : r.total_projects) || 0, activeProjects: ((c = i.projects) == null ? void 0 : c.active_projects) || 0, completedProjects: ((d = i.projects) == null ? void 0 : d.completed_projects) || 0, totalTasks: ((h = i.tasks) == null ? void 0 : h.total_tasks) || 0, completedTasks: ((m = i.tasks) == null ? void 0 : m.completed_tasks) || 0, pendingTasks: ((x = i.tasks) == null ? void 0 : x.pending_tasks) || 0, inProgressTasks: ((g = i.tasks) == null ? void 0 : g.in_progress_tasks) || 0, totalAgents: ((y = i.agents) == null ? void 0 : y.total_agents) || 0, activeAgents: ((v = i.agents) == null ? void 0 : v.active_agents) || 0, totalMemories: ((b = i.memories) == null ? void 0 : b.total_memories) || 0, criticalAlerts: ((D = i.alerts) == null ? void 0 : D.critical_alerts) || 0 }; }, refetchInterval: 3e4 }); }
function b2() { return Pe({ queryKey: ["dashboard", "alerts"], queryFn: async () => { const { data: l } = await Hx.getAlerts(); return l.data || l.alerts || l || []; }, refetchInterval: 15e3 }); }
function sd() { return Pe({ queryKey: ["projects"], queryFn: async () => { const { data: l } = await Or.getAll(); return l.projects || l.data || []; } }); }
function bg(l) { return Pe({ queryKey: ["projects", l], queryFn: async () => { const { data: i } = await Or.getById(l); return i.project || i.data || i; }, enabled: !!l }); }
function v2() { const l = Jt(); return ss({ mutationFn: ({ id: i, data: r }) => Or.update(i, r), onSuccess: (i, { id: r }) => { l.invalidateQueries({ queryKey: ["projects"] }), l.invalidateQueries({ queryKey: ["projects", r] }); } }); }
function vg(l) { return Pe({ queryKey: ["tasks", l], queryFn: async () => { const { data: i } = await ls.getAll(l); return i.tasks || i.data || i || []; } }); }
function j2(l) { return Pe({ queryKey: ["tasks", l], queryFn: async () => { const { data: i } = await ls.getById(l); return i.data; }, enabled: !!l }); }
function N2() { const l = Jt(); return ss({ mutationFn: i => ls.create(i), onSuccess: () => { l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function w2() { const l = Jt(); return ss({ mutationFn: ({ id: i, data: r }) => ls.update(i, r), onSuccess: (i, { id: r }) => { l.invalidateQueries({ queryKey: ["tasks"] }), l.invalidateQueries({ queryKey: ["tasks", r] }); } }); }
function jg() { return Pe({ queryKey: ["agents"], queryFn: async () => { const { data: l } = await Q1.getAll(); return l.agents || l.data || l || []; }, refetchInterval: 1e4 }); }
function S2(l) { return Pe({ queryKey: ["memories", l], queryFn: async () => { const { data: i } = await zr.getAll(l); return i.memories || i.data || i || []; } }); }
function A2(l, i) { return Pe({ queryKey: ["memories", "search", l, i], queryFn: async () => { const { data: r } = await zr.search(l, i); return r.memories || r.data || r || []; }, enabled: l.length > 2 }); }
function k2() { return Pe({ queryKey: ["memories", "tags"], queryFn: async () => { const { data: l } = await zr.getTags(); return l.tags || l.data || l || []; } }); }
function C2() { return Pe({ queryKey: ["memories", "stats"], queryFn: async () => { const { data: l } = await zr.getStats(); return l.data || l; } }); }
function T2(l) { return Pe({ queryKey: ["tasks", l, "items"], queryFn: async () => { const { data: i } = await ls.getItems(l); return i.items || i.data || i || []; }, enabled: !!l }); }
function E2() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, items: r }) => ls.createItems(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "items"] }), l.invalidateQueries({ queryKey: ["tasks", r] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function M2() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, itemId: r, notes: c, actualMinutes: d }) => ls.completeItem(i, r, { notes: c, actual_minutes: d }), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "items"] }), l.invalidateQueries({ queryKey: ["tasks", r] }), l.invalidateQueries({ queryKey: ["tasks"] }), l.invalidateQueries({ queryKey: ["dashboard"] }); } }); }
function _2() { return Pe({ queryKey: ["tags"], queryFn: async () => { const { data: l } = await V1.getAll(); return l.tags || l.data || l || []; }, staleTime: 1e3 * 60 * 5 }); }
function O2(l) { return Pe({ queryKey: ["tasks", l, "tags"], queryFn: async () => { const { data: i } = await ls.getTags(l); return i.tags || i.data || i || []; }, enabled: !!l }); }
function z2() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, tagId: r }) => ls.addTag(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "tags"] }), l.invalidateQueries({ queryKey: ["tags"] }); } }); }
function D2() { const l = Jt(); return ss({ mutationFn: ({ taskId: i, tagId: r }) => ls.removeTag(i, r), onSuccess: (i, { taskId: r }) => { l.invalidateQueries({ queryKey: ["tasks", r, "tags"] }), l.invalidateQueries({ queryKey: ["tags"] }); } }); }
function Ng(l) { return Pe({ queryKey: ["projects", l, "tasks"], queryFn: async () => { const { data: i } = await ls.getAll({ project_id: l }); return i.tasks || i.data || i || []; }, enabled: !!l, refetchInterval: 1e4 }); }
function R2(l) { return Pe({ queryKey: ["projects", "check-code", l], queryFn: async () => { const { data: i } = await Or.checkCode(l); return i; }, enabled: l.length === 3 && /^[A-Za-z]{3}$/.test(l), staleTime: 1e3 * 30 }); }
function q2(l) { return Pe({ queryKey: ["projects", l, "epics"], queryFn: async () => { const { data: i } = await Zu.getByProject(l); return i.epics || i.data || i || []; }, enabled: !!l }); }
function B2() { const l = Jt(); return ss({ mutationFn: ({ projectId: i, data: r }) => Zu.create(i, r), onSuccess: (i, { projectId: r }) => { l.invalidateQueries({ queryKey: ["projects", r, "epics"] }); } }); }
function U2() { const l = Jt(); return ss({ mutationFn: ({ id: i }) => Zu.delete(i), onSuccess: (i, r) => { l.invalidateQueries({ queryKey: ["projects", r.projectId, "epics"] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function L2(l) { return Pe({ queryKey: ["projects", l, "sprints"], queryFn: async () => { const { data: i } = await Ju.getByProject(l); return i.sprints || i.data || i || []; }, enabled: !!l }); }
function H2() { const l = Jt(); return ss({ mutationFn: ({ projectId: i, data: r }) => Ju.create(i, r), onSuccess: (i, { projectId: r }) => { l.invalidateQueries({ queryKey: ["projects", r, "sprints"] }); } }); }
function V2() { const l = Jt(); return ss({ mutationFn: ({ id: i }) => Ju.delete(i), onSuccess: (i, r) => { l.invalidateQueries({ queryKey: ["projects", r.projectId, "sprints"] }), l.invalidateQueries({ queryKey: ["tasks"] }); } }); }
function Q2() { const l = oa(), { user: i, logout: r } = _s(), { theme: c, toggleTheme: d } = ed(), { data: h } = b2(), { isConnected: m } = uv(), [x, g] = H.useState(!1), [y, v] = H.useState(!1), b = H.useRef(null), D = H.useRef(null); H.useEffect(() => { function V(X) { b.current && !b.current.contains(X.target) && g(!1), D.current && !D.current.contains(X.target) && v(!1); } return document.addEventListener("mousedown", V), () => document.removeEventListener("mousedown", V); }, []); const A = h || [], N = A.filter(V => V.severity === "critical" || V.severity === "high"), T = A.length, M = () => { r(), l("/login"); }, G = V => { switch (V) {
    case "critical":
    case "high": return a.jsx(Lp, { className: "h-4 w-4 text-red-500" });
    case "medium": return a.jsx(Lp, { className: "h-4 w-4 text-yellow-500" });
    case "info": return a.jsx(Wx, { className: "h-4 w-4 text-blue-500" });
    default: return a.jsx(xr, { className: "h-4 w-4 text-green-500" });
} }; return a.jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur", children: [a.jsx("div", { className: "flex items-center gap-4", children: a.jsx("h1", { className: "text-lg font-semibold", children: "Digital Field Operations" }) }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: Z("flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs", m ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"), children: m ? a.jsxs(a.Fragment, { children: [a.jsx(Aj, { className: "h-3.5 w-3.5" }), a.jsx("span", { className: "hidden sm:inline", children: "En vivo" })] }) : a.jsxs(a.Fragment, { children: [a.jsx(Sj, { className: "h-3.5 w-3.5" }), a.jsx("span", { className: "hidden sm:inline", children: "Offline" })] }) }), a.jsxs("div", { className: "relative", ref: b, children: [a.jsxs("button", { onClick: () => g(!x), className: Z("relative rounded-lg p-2 transition-colors hover:bg-accent", N.length > 0 && "text-red-500"), children: [a.jsx(J1, { className: "h-5 w-5" }), T > 0 && a.jsx("span", { className: Z("absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white", N.length > 0 ? "bg-red-500" : "bg-primary"), children: T > 9 ? "9+" : T })] }), x && a.jsxs("div", { className: "absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg", children: [a.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [a.jsx("span", { className: "font-semibold text-sm", children: "Notificaciones" }), a.jsxs("span", { className: "text-xs text-muted-foreground", children: [T, " alertas"] })] }), a.jsx("div", { className: "max-h-80 overflow-y-auto", children: A.length > 0 ? A.slice(0, 10).map(V => a.jsxs("div", { className: "flex gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border last:border-0", children: [G(V.severity), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsx("div", { className: "font-medium text-sm truncate", children: V.title }), a.jsx("div", { className: "text-xs text-muted-foreground truncate", children: V.message }), a.jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: it(V.createdAt) })] })] }, V.id)) : a.jsx("div", { className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "No hay notificaciones" }) })] })] }), a.jsx("button", { onClick: d, className: "rounded-lg p-2 transition-colors hover:bg-accent", title: c === "dark" ? "Modo claro" : "Modo oscuro", children: c === "dark" ? a.jsx(qu, { className: "h-5 w-5" }) : a.jsx(Bp, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "relative", ref: D, children: [a.jsxs("button", { onClick: () => v(!y), className: "flex items-center gap-3 border-l border-border pl-4 ml-2 hover:bg-accent/50 rounded-lg pr-2 py-1 transition-colors", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground", children: a.jsx(Ra, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "text-sm text-left", children: [a.jsx("div", { className: "font-medium", children: i == null ? void 0 : i.name }), a.jsx("div", { className: "text-xs text-muted-foreground capitalize", children: i == null ? void 0 : i.role })] })] }), a.jsx(ej, { className: Z("h-4 w-4 text-muted-foreground transition-transform", y && "rotate-180") })] }), y && a.jsxs("div", { className: "absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden", children: [a.jsxs("div", { className: "px-4 py-3 border-b border-border", children: [a.jsx("div", { className: "font-medium text-sm", children: i == null ? void 0 : i.name }), a.jsx("div", { className: "text-xs text-muted-foreground", children: i == null ? void 0 : i.email })] }), a.jsxs("div", { className: "py-1", children: [a.jsxs("button", { onClick: () => { v(!1); }, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors", children: [a.jsx(Iu, { className: "h-4 w-4 text-muted-foreground" }), "Configuración"] }), a.jsxs("button", { onClick: d, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors", children: [c === "dark" ? a.jsx(qu, { className: "h-4 w-4 text-muted-foreground" }) : a.jsx(Bp, { className: "h-4 w-4 text-muted-foreground" }), c === "dark" ? "Modo claro" : "Modo oscuro"] })] }), a.jsx("div", { className: "border-t border-border py-1", children: a.jsxs("button", { onClick: M, className: "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors", children: [a.jsx(dj, { className: "h-4 w-4" }), "Cerrar sesión"] }) })] })] })] })] }); }
function G2() { const l = ed(i => i.sidebarOpen); return a.jsxs("div", { className: "flex h-screen overflow-hidden bg-background", children: [a.jsx(g2, {}), a.jsxs("div", { className: Z("flex flex-1 flex-col transition-all duration-300", l ? "ml-64" : "ml-16"), children: [a.jsx(Q2, {}), a.jsx("main", { className: "flex-1 overflow-auto p-6", children: a.jsx(Py, {}) })] })] }); }
function K2() { const l = oa(), i = _s(b => b.login), [r, c] = H.useState(""), [d, h] = H.useState(""), [m, x] = H.useState(""), [g, y] = H.useState(!1), v = async (b) => { var D, A; b.preventDefault(), x(""), y(!0); try {
    const { data: N } = await Lx.login(r, d);
    N.token && N.user ? (i(N.user, N.token), l("/dashboard")) : x(N.message || "Error de autenticación");
}
catch (N) {
    x(((A = (D = N.response) == null ? void 0 : D.data) == null ? void 0 : A.message) || "Error de conexión");
}
finally {
    y(!1);
} }; return a.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20", children: a.jsxs("div", { className: "w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-xl", children: [a.jsxs("div", { className: "text-center", children: [a.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full solaria-gradient", children: a.jsx(qu, { className: "h-10 w-10 text-white" }) }), a.jsx("h1", { className: "mt-4 text-2xl font-bold", children: "SOLARIA DFO" }), a.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Digital Field Operations" })] }), a.jsxs("form", { onSubmit: v, className: "mt-8 space-y-4", children: [m && a.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-sm text-destructive", children: m }), a.jsxs("div", { children: [a.jsx("label", { htmlFor: "username", className: "block text-sm font-medium mb-2", children: "Usuario" }), a.jsx("input", { id: "username", type: "text", value: r, onChange: b => c(b.target.value), className: "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Ingresa tu usuario", required: !0 })] }), a.jsxs("div", { children: [a.jsx("label", { htmlFor: "password", className: "block text-sm font-medium mb-2", children: "Contraseña" }), a.jsx("input", { id: "password", type: "password", value: d, onChange: b => h(b.target.value), className: "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Ingresa tu contraseña", required: !0 })] }), a.jsx("button", { type: "submit", disabled: g, className: "w-full rounded-lg solaria-gradient py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50", children: g ? a.jsxs("span", { className: "flex items-center justify-center gap-2", children: [a.jsx(ot, { className: "h-4 w-4 animate-spin" }), "Ingresando..."] }) : "Ingresar" })] }), a.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "© 2024-2025 SOLARIA AGENCY" })] }) }); }
function ir({ title: l, value: i, icon: r, iconClass: c, onClick: d }) { return a.jsxs("div", { onClick: d, className: `stat-card ${d ? "cursor-pointer" : ""}`, title: d ? `Ver ${l.toLowerCase()}` : void 0, children: [a.jsx("div", { className: `stat-icon ${c}`, children: a.jsx(r, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: l }), a.jsx("div", { className: "stat-value", children: i })] })] }); }
function Y2({ task: l, onClick: i }) { return a.jsxs("div", { className: "completed-task-item", onClick: i, children: [a.jsx("div", { className: "task-check-icon", style: { background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }, children: a.jsx(ct, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "task-content", children: [a.jsxs("div", { className: "task-title-row", children: [a.jsx("span", { className: "task-title", children: l.title }), a.jsx("span", { className: "task-priority-badge low", children: "completada" })] }), a.jsxs("div", { className: "task-meta", children: [l.projectName && a.jsxs("span", { className: "task-meta-item", children: [a.jsx(Jx, { className: "h-3 w-3" }), l.projectName] }), a.jsxs("span", { className: "task-meta-item", children: [a.jsx(Ie, { className: "h-3 w-3" }), it(l.completedAt || l.updatedAt)] })] })] })] }); }
function X2({ project: l, onClick: i }) { const r = l.status === "completed" ? "low" : l.status === "active" ? "high" : "medium", c = l.tasksTotal || 0, d = l.tasksCompleted || 0, h = c > 0 ? Math.round(d / c * 100) : l.progress || 0; return a.jsxs("div", { className: "completed-task-item", onClick: i, style: { cursor: "pointer" }, children: [a.jsx("div", { className: "task-check-icon", style: { background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }, children: a.jsx(Jx, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "task-content", children: [a.jsxs("div", { className: "task-title-row", children: [a.jsx("span", { className: "task-title", children: l.name }), a.jsx("span", { className: `task-priority-badge ${r}`, children: l.status || "activo" })] }), a.jsxs("div", { className: "task-meta", children: [a.jsxs("span", { className: "task-meta-item", children: [a.jsx(Px, { className: "h-3 w-3" }), c, " tareas"] }), a.jsxs("span", { className: "task-meta-item", children: [a.jsx(ct, { className: "h-3 w-3" }), h, "%"] })] })] })] }); }
function Z2({ task: l, onClick: i }) { const r = l.priority === "high" || l.priority === "critical" ? "high" : l.priority === "medium" ? "medium" : "low"; return a.jsxs("div", { className: "completed-task-item", onClick: i, style: { cursor: "pointer" }, children: [a.jsx("div", { className: "task-check-icon", style: { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }, children: a.jsx(Kx, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "task-content", children: [a.jsxs("div", { className: "task-title-row", children: [a.jsx("span", { className: "task-title", children: l.title }), a.jsx("span", { className: `task-priority-badge ${r}`, children: l.priority || "normal" })] }), a.jsxs("div", { className: "task-meta", children: [a.jsxs("span", { className: "task-meta-item", children: [a.jsx(Ie, { className: "h-3 w-3" }), it(l.createdAt)] }), l.taskCode && a.jsx("span", { className: "task-meta-item", children: l.taskCode })] })] })] }); }
function gu() { return a.jsxs("div", { className: "feed-loading", children: [a.jsx(ot, { className: "h-5 w-5 animate-spin" }), a.jsx("p", { children: "Cargando..." })] }); }
function yu({ icon: l, message: i }) { return a.jsxs("div", { className: "feed-empty", children: [a.jsx(l, { className: "h-8 w-8" }), a.jsx("p", { children: i })] }); }
function J2() { const l = oa(), { data: i, isLoading: r } = y2(), { data: c, isLoading: d } = sd(), { data: h, isLoading: m } = vg({}), [x, g] = H.useState([]), [y, v] = H.useState([]); H.useEffect(() => { if (h) {
    const A = new Date;
    A.setDate(A.getDate() - 7);
    const N = h.filter(M => new Date(M.createdAt) >= A).slice(0, 10), T = h.filter(M => M.status === "completed").sort((M, G) => { const V = new Date(M.completedAt || M.updatedAt); return new Date(G.completedAt || G.updatedAt).getTime() - V.getTime(); }).slice(0, 15).map(M => { const G = c == null ? void 0 : c.find(V => V.id === M.projectId); return { ...M, projectName: G == null ? void 0 : G.name }; });
    g(N), v(T);
} }, [h, c]); const b = () => l("/projects"), D = A => l(`/projects/${A}`); return a.jsxs("div", { className: "space-y-6", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Dashboard" }), a.jsx("p", { className: "section-subtitle", children: "Vista ejecutiva del estado de operaciones" })] }) }), a.jsxs("div", { className: "dashboard-stats-row", children: [a.jsx(ir, { title: "Proyectos Activos", value: r ? "-" : (i == null ? void 0 : i.activeProjects) || (c == null ? void 0 : c.length) || 0, icon: jl, iconClass: "projects", onClick: b }), a.jsx(ir, { title: "Tareas Completadas", value: r ? "-" : (i == null ? void 0 : i.completedTasks) || 0, icon: ct, iconClass: "tasks" }), a.jsx(ir, { title: "En Progreso", value: r ? "-" : (i == null ? void 0 : i.inProgressTasks) || 0, icon: Ie, iconClass: "active" }), a.jsx(ir, { title: "Agentes Activos", value: r ? "-" : (i == null ? void 0 : i.activeAgents) || 0, icon: Dr, iconClass: "agents" })] }), a.jsxs("div", { className: "dashboard-grid", children: [a.jsxs("div", { className: "completed-tasks-widget", children: [a.jsxs("div", { className: "widget-header", children: [a.jsxs("div", { className: "widget-header-left", children: [a.jsx("div", { className: "widget-icon success", children: a.jsx(P1, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "widget-title", children: "Tareas Completadas" }), a.jsx("div", { className: "widget-subtitle", children: "Feed global en tiempo real" })] })] }), a.jsx("div", { className: "widget-badge", children: y.length })] }), a.jsx("div", { className: "completed-tasks-feed", children: m ? a.jsx(gu, {}) : y.length > 0 ? y.map(A => a.jsx(Y2, { task: A, onClick: () => A.projectId && D(A.projectId) }, A.id)) : a.jsx(yu, { icon: ct, message: "No hay tareas completadas todavia" }) })] }), a.jsxs("div", { className: "completed-tasks-widget", children: [a.jsx("div", { className: "widget-header", children: a.jsxs("div", { className: "widget-header-left", children: [a.jsx("div", { className: "widget-icon info", children: a.jsx(jl, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "widget-title", children: "Proyectos Recientes" }), a.jsx("div", { className: "widget-subtitle", children: "Actividad de proyectos" })] })] }) }), a.jsx("div", { className: "completed-tasks-feed", children: d ? a.jsx(gu, {}) : c && c.length > 0 ? c.slice(0, 5).map(A => a.jsx(X2, { project: A, onClick: () => D(A.id) }, A.id)) : a.jsx(yu, { icon: jl, message: "No hay proyectos" }) })] }), a.jsxs("div", { className: "completed-tasks-widget", children: [a.jsxs("div", { className: "widget-header", children: [a.jsxs("div", { className: "widget-header-left", children: [a.jsx("div", { className: "widget-icon warning", children: a.jsx(Kx, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "widget-title", children: "Nuevas Tareas por Proyecto" }), a.jsx("div", { className: "widget-subtitle", children: "Ultimos 7 dias" })] })] }), a.jsx("div", { className: "widget-badge", children: x.length })] }), a.jsx("div", { className: "completed-tasks-feed", children: m ? a.jsx(gu, {}) : x.length > 0 ? x.map(A => a.jsx(Z2, { task: A, onClick: () => A.projectId && D(A.projectId) }, A.id)) : a.jsx(yu, { icon: wt, message: "No hay tareas nuevas esta semana" }) })] })] })] }); }
const vr = { planning: { label: "Planificacion", color: "#7c3aed" }, active: { label: "Desarrollo", color: "#0891b2" }, paused: { label: "Pausado", color: "#f59e0b" }, completed: { label: "Produccion", color: "#16a34a" }, cancelled: { label: "Cancelado", color: "#ef4444" } };
function F2({ board: l }) { const r = (c, d) => { const h = Math.min(c, 8); return Array.from({ length: 8 }, (m, x) => a.jsx("div", { className: Z("trello-slot", x < h && `filled ${d}`) }, x)); }; return a.jsxs("div", { className: "mini-trello", children: [a.jsxs("div", { className: "trello-column backlog", children: [a.jsx("div", { className: "trello-column-header", children: "BACKLOG" }), a.jsx("div", { className: "trello-slots", children: r(l.backlog, "backlog") })] }), a.jsxs("div", { className: "trello-column todo", children: [a.jsx("div", { className: "trello-column-header", children: "TODO" }), a.jsx("div", { className: "trello-slots", children: r(l.todo, "todo") })] }), a.jsxs("div", { className: "trello-column doing", children: [a.jsx("div", { className: "trello-column-header", children: "DOING" }), a.jsx("div", { className: "trello-slots", children: r(l.doing, "doing") })] }), a.jsxs("div", { className: "trello-column done", children: [a.jsx("div", { className: "trello-column-header", children: "DONE" }), a.jsx("div", { className: "trello-slots", children: r(l.done, "done") })] })] }); }
function $2({ status: l }) { const i = ["planning", "active", "paused", "completed"], r = l === "completed" ? 3 : l === "paused" ? 2 : l === "active" ? 1 : 0; return a.jsx("div", { className: "progress-segments", children: i.map((c, d) => a.jsx("div", { className: Z("progress-segment", d <= r ? c : "inactive") }, c)) }); }
function W2({ project: l, onClick: i }) { const r = vr[l.status] || vr.planning, c = l.tasksTotal || 0, d = l.tasksCompleted || 0, h = c - d, m = Math.min(Math.floor(h * .3), 3), x = { backlog: Math.floor(h * .4), todo: Math.floor(h * .3), doing: m, done: d }, g = l.budgetAllocated ? l.budgetAllocated >= 1e3 ? `$${(l.budgetAllocated / 1e3).toFixed(0)}K` : `$${l.budgetAllocated}` : "-"; return a.jsxs("div", { className: "project-card", onClick: i, children: [a.jsxs("div", { className: "project-header", children: [a.jsx("div", { className: "project-icon-wrapper", children: a.jsx(jl, { className: "project-icon" }) }), a.jsxs("div", { className: "project-title-group", children: [a.jsx("h3", { className: "project-name", children: l.name }), a.jsx("span", { className: "project-code", children: l.code })] }), a.jsx("button", { className: "project-edit-btn", onClick: y => { y.stopPropagation(); }, title: "Editar proyecto", children: a.jsx(qt, { className: "h-4 w-4" }) })] }), a.jsxs("div", { className: "project-tags", children: [a.jsx("span", { className: "project-tag", style: { backgroundColor: `${r.color}20`, color: r.color }, children: r.label }), l.priority && a.jsx("span", { className: Z("project-tag", l.priority === "critical" && "red", l.priority === "high" && "orange", l.priority === "medium" && "yellow", l.priority === "low" && "green"), children: l.priority })] }), a.jsx(F2, { board: x }), a.jsx($2, { status: l.status }), a.jsxs("div", { className: "project-stats", children: [a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon blue", children: a.jsx(ct, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: c }), a.jsx("div", { className: "stat-label", children: "Tareas" })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon yellow", children: a.jsx(Ie, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: h }), a.jsx("div", { className: "stat-label", children: "Pend." })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(ct, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: d }), a.jsx("div", { className: "stat-label", children: "Compl." })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon orange", children: a.jsx(Yx, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: g }), a.jsx("div", { className: "stat-label", children: "Budget" })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon purple", children: a.jsx(ng, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: l.activeAgents || 0 }), a.jsx("div", { className: "stat-label", children: "Agentes" })] }), a.jsxs("div", { className: "stat-item", children: [a.jsx("div", { className: "stat-icon indigo", children: a.jsx(Da, { className: "h-3 w-3" }) }), a.jsx("div", { className: "stat-value", children: l.endDate ? Ur(l.endDate) : "-" }), a.jsx("div", { className: "stat-label", children: "Entrega" })] })] })] }); }
function I2({ project: l, onClick: i }) { const r = vr[l.status] || vr.planning, c = l.tasksTotal || 0, d = l.tasksCompleted || 0, h = c - d, m = l.progress || 0, x = l.budgetAllocated ? l.budgetAllocated >= 1e3 ? `$${(l.budgetAllocated / 1e3).toFixed(0)}K` : `$${l.budgetAllocated}` : "-"; return a.jsxs("tr", { onClick: i, className: "project-row", children: [a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "project-icon-sm", children: a.jsx(jl, { className: "h-4 w-4" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "project-name-sm", children: l.name }), a.jsx("div", { className: "project-code-sm", children: l.code })] })] }) }), a.jsx("td", { children: a.jsx("span", { className: "phase-badge", style: { backgroundColor: `${r.color}20`, color: r.color }, children: r.label }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-blue", children: c }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-yellow", children: h }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-green", children: d }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-orange", children: x }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-purple", children: l.activeAgents || 0 }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-indigo", children: l.endDate ? Ur(l.endDate) : "-" }) }), a.jsxs("td", { className: "text-center", children: [a.jsx("div", { className: "progress-bar-sm", children: a.jsx("div", { className: "progress-fill", style: { width: `${m}%` } }) }), a.jsxs("span", { className: "progress-text", children: [m, "%"] })] })] }); }
function P2() { const { projectId: l } = Sr(), i = oa(), { data: r, isLoading: c } = sd(), [d, h] = H.useState("grid"), [m, x] = H.useState("name"), g = [...r || []].sort((v, b) => { switch (m) {
    case "name": return v.name.localeCompare(b.name);
    case "deadline": return new Date(v.endDate || 0).getTime() - new Date(b.endDate || 0).getTime();
    case "budget": return (b.budgetAllocated || 0) - (v.budgetAllocated || 0);
    case "completion": return (b.progress || 0) - (v.progress || 0);
    case "status": return v.status.localeCompare(b.status);
    default: return 0;
} }), y = v => { i(`/projects/${v}`); }; if (c)
    return a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(ot, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }); if (l) {
    const v = r == null ? void 0 : r.find(b => b.id === parseInt(l));
    if (v)
        return a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: v.name }), a.jsxs("p", { className: "section-subtitle", children: [v.code, " - ", v.description] })] }), a.jsx("button", { onClick: () => i("/projects"), className: "btn-secondary", children: "Volver" })] }), a.jsx("div", { className: "bg-card border border-border rounded-xl p-6", children: a.jsx("p", { className: "text-muted-foreground", children: "Vista detallada del proyecto (en desarrollo)" }) })] });
} return a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Proyectos" }), a.jsxs("p", { className: "section-subtitle", children: [(r == null ? void 0 : r.length) || 0, " proyectos en el pipeline"] })] }), a.jsxs("div", { className: "section-actions", children: [a.jsxs("div", { className: "sort-buttons", children: [a.jsx("button", { className: Z("sort-btn", m === "name" && "active"), onClick: () => x("name"), children: "NOMBRE" }), a.jsx("button", { className: Z("sort-btn", m === "deadline" && "active"), onClick: () => x("deadline"), children: "FECHA" }), a.jsx("button", { className: Z("sort-btn", m === "budget" && "active"), onClick: () => x("budget"), children: "$$$" }), a.jsx("button", { className: Z("sort-btn", m === "completion" && "active"), onClick: () => x("completion"), children: "%" }), a.jsx("button", { className: Z("sort-btn", m === "status" && "active"), onClick: () => x("status"), children: "FASE" })] }), a.jsxs("div", { className: "view-toggle", children: [a.jsx("button", { className: Z("view-toggle-btn", d === "grid" && "active"), onClick: () => h("grid"), title: "Vista Grid", children: a.jsx(qn, { className: "h-4 w-4" }) }), a.jsx("button", { className: Z("view-toggle-btn", d === "list" && "active"), onClick: () => h("list"), title: "Vista Lista", children: a.jsx(Bn, { className: "h-4 w-4" }) })] })] })] }), d === "grid" ? a.jsxs("div", { className: "projects-grid", children: [g.map(v => a.jsx(W2, { project: v, onClick: () => y(v.id) }, v.id)), g.length === 0 && a.jsxs("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: "No hay proyectos todavia" })] })] }) : a.jsxs("div", { className: "project-card", style: { padding: 0, overflow: "hidden" }, children: [a.jsxs("table", { className: "list-table", children: [a.jsx("thead", { children: a.jsxs("tr", { children: [a.jsx("th", { style: { width: "22%" }, children: "Proyecto" }), a.jsx("th", { style: { width: "12%" }, children: "Fase" }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Tareas" }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Pend." }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Compl." }), a.jsx("th", { style: { width: "10%", textAlign: "center" }, children: "Budget" }), a.jsx("th", { style: { width: "8%", textAlign: "center" }, children: "Agentes" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Entrega" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Progreso" })] }) }), a.jsx("tbody", { children: g.map(v => a.jsx(I2, { project: v, onClick: () => y(v.id) }, v.id)) })] }), g.length === 0 && a.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: "No hay proyectos todavia" })] })] })] }); }
function Lr({ isOpen: l, onClose: i, title: r, children: c, maxWidth: d = "max-w-xl", className: h }) { const m = H.useCallback(x => { x.key === "Escape" && i(); }, [i]); return H.useEffect(() => (l && (document.addEventListener("keydown", m), document.body.style.overflow = "hidden"), () => { document.removeEventListener("keydown", m), document.body.style.overflow = "unset"; }), [l, m]), l ? a.jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: x => { x.target === x.currentTarget && i(); }, children: a.jsxs("div", { className: Z("bg-card rounded-2xl border border-border w-full max-h-[90vh] overflow-y-auto", d, h), children: [r && a.jsxs("div", { className: "p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10", children: [a.jsx("h2", { className: "text-xl font-bold text-foreground", children: r }), a.jsx("button", { onClick: i, className: "p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: a.jsx(wl, { className: "h-5 w-5" }) })] }), !r && a.jsx("button", { onClick: i, className: "absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10", children: a.jsx(wl, { className: "h-5 w-5" }) }), c] }) }) : null; }
const eN = [{ key: "backlog", alt: "pending", label: "BL", fullLabel: "BACKLOG", color: "#6b7280" }, { key: "todo", alt: "pending", label: "TD", fullLabel: "TODO", color: "#f59e0b" }, { key: "doing", alt: "in_progress", label: "DO", fullLabel: "DOING", color: "#3b82f6" }, { key: "done", alt: "completed", label: "DN", fullLabel: "DONE", color: "#22c55e" }], Yp = 8;
function tN({ label: l, fullLabel: i, count: r, color: c, showLabel: d = !0, showCount: h = !0, compact: m = !1 }) { const x = Math.min(r, Yp), g = []; for (let y = 0; y < Yp; y++) {
    const v = y < x;
    g.push(a.jsx("div", { className: Z("trello-slot", v && "filled"), style: v ? { background: c, borderColor: "transparent" } : void 0 }, y));
} return a.jsxs("div", { className: "trello-column", children: [d && a.jsx("span", { className: "trello-label", children: m ? l : i }), a.jsx("div", { className: "trello-slots", children: g }), h && a.jsx("span", { className: "trello-count", children: r })] }); }
function sN({ board: l, showLabels: i = !0, showCounts: r = !0, compact: c = !1, className: d }) { const h = m => { const x = l[m.key] ?? 0, g = l[m.alt] ?? 0; return x || g; }; return a.jsx("div", { className: Z("mini-trello", c && "compact", d), children: eN.map(m => a.jsx(tN, { label: m.label, fullLabel: m.fullLabel, count: h(m), color: m.color, showLabel: i, showCount: r, compact: c }, m.key)) }); }
function aN({ project: l, metrics: i, onClick: r }) { var c; return a.jsxs("div", { onClick: r, className: "bg-card rounded-xl border border-border p-4 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para ver informacion completa del proyecto", children: [a.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 sm:gap-6", children: [a.jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center shrink-0", children: a.jsx(Wu, { className: "text-white h-8 w-8 sm:h-10 sm:w-10" }) }), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: [a.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 uppercase", children: "SAAS" }), a.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 uppercase", children: "REACT" }), a.jsx("span", { className: "px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 uppercase", children: "B2B" })] }), a.jsx("p", { className: "text-muted-foreground text-sm line-clamp-2", children: l.description || "Sin descripcion" }), a.jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm text-muted-foreground", children: [a.jsx("span", { className: "text-solaria", children: "●" }), a.jsx("span", { children: ((c = l.client) == null ? void 0 : c.name) || "Sin cliente" })] })] }), a.jsx("div", { className: "hidden sm:flex items-start", children: a.jsx(ts, { className: "h-5 w-5 text-muted-foreground" }) })] }), a.jsxs("div", { className: "mt-4 pt-4 border-t border-border", children: [a.jsxs("div", { className: "flex items-center justify-between mb-2", children: [a.jsx("span", { className: "text-sm text-muted-foreground", children: "Fase" }), a.jsx("span", { className: Z("px-3 py-1 rounded-full text-xs font-medium uppercase", l.status === "active" ? "bg-green-500/20 text-green-400" : l.status === "planning" ? "bg-yellow-500/20 text-yellow-400" : l.status === "completed" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"), children: l.status === "active" ? "Desarrollo" : l.status === "planning" ? "Planificacion" : l.status === "completed" ? "Produccion" : l.status })] }), a.jsxs("div", { className: "flex gap-1 mt-2", children: [a.jsx("div", { className: Z("flex-1 h-1.5 rounded-full", l.status !== "planning" ? "bg-solaria" : "bg-secondary") }), a.jsx("div", { className: Z("flex-1 h-1.5 rounded-full", l.status === "active" || l.status === "completed" ? "bg-solaria" : "bg-secondary") }), a.jsx("div", { className: Z("flex-1 h-1.5 rounded-full", l.status === "completed" ? "bg-solaria" : "bg-secondary") }), a.jsx("div", { className: Z("flex-1 h-1.5 rounded-full", l.status === "completed" ? "bg-solaria" : "bg-secondary") })] }), a.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mt-1", children: [a.jsx("span", { children: "PLAN" }), a.jsx("span", { children: "DEV" }), a.jsx("span", { children: "TEST" }), a.jsx("span", { children: "PROD" })] })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-2 mt-4", children: [a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsxs("p", { className: "text-lg font-bold text-foreground", children: ["$", Math.round((l.budgetAllocated || 0) / 1e3), "K"] }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Presupuesto" })] }), a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-lg font-bold text-foreground", children: i.total }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Tareas" })] }), a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsxs("p", { className: "text-lg font-bold text-green-400", children: [i.progress, "%"] }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Completado" })] }), a.jsxs("div", { className: "text-center p-2 rounded-lg bg-secondary/50", children: [a.jsxs("p", { className: Z("text-lg font-bold", i.daysRemaining < 0 ? "text-red-400" : "text-foreground"), children: [i.daysRemaining, "d"] }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Restantes" })] })] })] }); }
function lN({ metrics: l, tasksByStatus: i, onClick: r }) { return a.jsxs("div", { onClick: r, className: "bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para gestionar tareas", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(ct, { className: "h-4 w-4 text-solaria" }), "TAREAS", a.jsx(ts, { className: "h-3 w-3 text-muted-foreground ml-auto" })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-2 mb-4", children: [a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-foreground", children: l.total }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Total" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-yellow-400", children: l.pending }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Pend" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-blue-400", children: l.inProgress }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Doing" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-xl font-bold text-green-400", children: l.completed }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Done" })] })] }), a.jsx(sN, { board: i, showLabels: !0, showCounts: !0, compact: !1 })] }); }
function nN({ onClick: l }) { const i = []; return a.jsxs("div", { onClick: l, className: "bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors", title: "Click para gestionar URLs", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(Ix, { className: "h-4 w-4 text-solaria" }), "DIRECCIONES", a.jsx(ts, { className: "h-3 w-3 text-muted-foreground ml-auto" })] }), i.length > 0 ? a.jsxs("div", { className: "space-y-2", children: [i.slice(0, 3).map((r, c) => a.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground truncate", children: [a.jsx(ts, { className: "h-3 w-3 shrink-0" }), a.jsx("span", { className: "truncate", children: r })] }, c)), i.length > 3 && a.jsxs("p", { className: "text-xs text-solaria", children: ["+", i.length - 3, " mas..."] })] }) : a.jsx("p", { className: "text-sm text-muted-foreground", children: "No hay URLs" })] }); }
function iN({ activities: l }) { const i = l.slice(0, 5), r = c => c.includes("complete") || c.includes("done") ? a.jsx(ct, { className: "h-4 w-4 text-green-400" }) : c.includes("create") || c.includes("new") ? a.jsx(qt, { className: "h-4 w-4 text-blue-400" }) : c.includes("update") || c.includes("edit") ? a.jsx(gr, { className: "h-4 w-4 text-yellow-400" }) : a.jsx(Ie, { className: "h-4 w-4 text-muted-foreground" }); return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(Ie, { className: "h-4 w-4 text-solaria" }), "Actividad"] }), i.length > 0 ? a.jsx("div", { className: "space-y-3", children: i.map(c => a.jsxs("div", { className: "flex items-start gap-3", children: [r(c.action), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsx("p", { className: "text-sm text-foreground truncate", children: c.description || c.action }), a.jsx("p", { className: "text-xs text-muted-foreground", children: it(c.createdAt) })] })] }, c.id)) }) : a.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin actividad reciente" })] }); }
function rN({ notes: l, onAddNote: i }) { const [r, c] = H.useState(""), d = h => { h.preventDefault(), r.trim() && (i(r.trim()), c("")); }; return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(Xx, { className: "h-4 w-4 text-solaria" }), "Notas", a.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(Agentes leen)" })] }), a.jsxs("form", { onSubmit: d, className: "flex gap-2 mb-3", children: [a.jsx("input", { type: "text", value: r, onChange: h => c(h.target.value), placeholder: "Escribe una nota...", className: "flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria" }), a.jsx("button", { type: "submit", disabled: !r.trim(), className: Z("p-2 rounded-lg transition-colors", r.trim() ? "bg-solaria text-white hover:bg-solaria-dark" : "bg-secondary text-muted-foreground cursor-not-allowed"), children: a.jsx(xj, { className: "h-4 w-4" }) })] }), l.length > 0 ? a.jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto", children: l.map((h, m) => a.jsx("div", { className: "p-2 rounded bg-secondary/50 text-sm text-foreground", children: h }, m)) }) : a.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin notas" })] }); }
function cN({ epics: l, onCreateEpic: i, onDeleteEpic: r }) { const [c, d] = H.useState(!1), [h, m] = H.useState(""), x = () => { h.trim() && (i(h.trim()), m(""), d(!1)); }; return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(jj, { className: "h-4 w-4 text-purple-400" }), "Epics", a.jsxs("span", { className: "text-xs text-muted-foreground font-normal ml-auto", children: [l.length, " total"] })] }), a.jsxs("div", { className: "space-y-2 mb-3 max-h-40 overflow-y-auto", children: [l.map(g => a.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group", children: [a.jsx("div", { className: "w-3 h-3 rounded-full shrink-0", style: { backgroundColor: g.color || "#6366f1" } }), a.jsxs("span", { className: "flex-1 text-sm text-foreground truncate", children: ["EPIC", String(g.epicNumber).padStart(2, "0"), ": ", g.name] }), a.jsx("span", { className: Z("text-xs px-1.5 py-0.5 rounded", g.status === "completed" ? "bg-green-500/20 text-green-400" : g.status === "in_progress" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"), children: g.status }), a.jsx("button", { onClick: () => r(g.id), className: "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all", children: a.jsx(lg, { className: "h-3 w-3" }) })] }, g.id)), l.length === 0 && a.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Sin epics" })] }), c ? a.jsxs("div", { className: "flex gap-2", children: [a.jsx("input", { type: "text", value: h, onChange: g => m(g.target.value), placeholder: "Nombre del epic...", className: "flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria", autoFocus: !0, onKeyDown: g => g.key === "Enter" && x() }), a.jsx("button", { onClick: x, disabled: !h.trim(), className: "p-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed", children: a.jsx(qt, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => { d(!1), m(""); }, className: "p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground", children: a.jsx(wl, { className: "h-4 w-4" }) })] }) : a.jsxs("button", { onClick: () => d(!0), className: "w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2", children: [a.jsx(qt, { className: "h-4 w-4" }), "Crear Epic"] })] }); }
function oN({ sprints: l, onCreateSprint: i, onDeleteSprint: r }) { const [c, d] = H.useState(!1), [h, m] = H.useState(""), x = () => { h.trim() && (i(h.trim()), m(""), d(!1)); }, g = l.find(y => y.status === "active"); return a.jsxs("div", { className: "bg-card rounded-xl border border-border p-4", children: [a.jsxs("h4", { className: "font-semibold text-foreground flex items-center gap-2 mb-3", children: [a.jsx(yr, { className: "h-4 w-4 text-yellow-400" }), "Sprints", a.jsxs("span", { className: "text-xs text-muted-foreground font-normal ml-auto", children: [l.length, " total"] })] }), g && a.jsxs("div", { className: "mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30", children: [a.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [a.jsx(yr, { className: "h-3 w-3 text-yellow-400" }), a.jsx("span", { className: "text-yellow-400 font-medium", children: "Activo:" }), a.jsx("span", { className: "text-foreground", children: g.name })] }), g.endDate && a.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [a.jsx($1, { className: "h-3 w-3" }), "Termina: ", new Date(g.endDate).toLocaleDateString("es-ES")] })] }), a.jsxs("div", { className: "space-y-2 mb-3 max-h-32 overflow-y-auto", children: [l.filter(y => y.id !== (g == null ? void 0 : g.id)).map(y => a.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group", children: [a.jsxs("span", { className: "text-xs font-mono text-muted-foreground", children: ["SP", String(y.sprintNumber).padStart(2, "0")] }), a.jsx("span", { className: "flex-1 text-sm text-foreground truncate", children: y.name }), a.jsx("span", { className: Z("text-xs px-1.5 py-0.5 rounded", y.status === "completed" ? "bg-green-500/20 text-green-400" : y.status === "active" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"), children: y.status }), a.jsx("button", { onClick: () => r(y.id), className: "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all", children: a.jsx(lg, { className: "h-3 w-3" }) })] }, y.id)), l.length === 0 && a.jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Sin sprints" })] }), c ? a.jsxs("div", { className: "flex gap-2", children: [a.jsx("input", { type: "text", value: h, onChange: y => m(y.target.value), placeholder: "Nombre del sprint...", className: "flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria", autoFocus: !0, onKeyDown: y => y.key === "Enter" && x() }), a.jsx("button", { onClick: x, disabled: !h.trim(), className: "p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed", children: a.jsx(qt, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => { d(!1), m(""); }, className: "p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground", children: a.jsx(wl, { className: "h-4 w-4" }) })] }) : a.jsxs("button", { onClick: () => d(!0), className: "w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-yellow-500 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2", children: [a.jsx(qt, { className: "h-4 w-4" }), "Crear Sprint"] })] }); }
function uN({ project: l, isOpen: i, onClose: r, onEdit: c }) { var d; return a.jsxs(Lr, { isOpen: i, onClose: r, title: "Informacion del Proyecto", maxWidth: "max-w-2xl", children: [a.jsxs("div", { className: "p-6 space-y-6", children: [a.jsxs("div", { className: "flex items-start gap-4", children: [a.jsx("div", { className: "w-16 h-16 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center", children: a.jsx(Wu, { className: "text-white h-8 w-8" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("h2", { className: "text-xl font-bold text-foreground", children: l.name }), a.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: l.code })] })] }), a.jsxs("div", { children: [a.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Descripcion" }), a.jsx("p", { className: "text-foreground", children: l.description || "Sin descripcion" })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Cliente" }), a.jsx("p", { className: "text-foreground font-medium", children: ((d = l.client) == null ? void 0 : d.name) || "Sin cliente" })] }), a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Presupuesto" }), a.jsxs("p", { className: "text-foreground font-medium", children: ["$", (l.budgetAllocated || 0).toLocaleString()] })] }), a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Fecha Inicio" }), a.jsx("p", { className: "text-foreground font-medium", children: l.startDate ? new Date(l.startDate).toLocaleDateString("es-ES") : "No definida" })] }), a.jsxs("div", { className: "p-4 rounded-lg bg-secondary/50", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Deadline" }), a.jsx("p", { className: "text-foreground font-medium", children: l.endDate ? new Date(l.endDate).toLocaleDateString("es-ES") : "No definida" })] })] }), a.jsxs("div", { children: [a.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Stack Tecnico" }), a.jsxs("div", { className: "flex flex-wrap gap-2", children: [a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400", children: "React 19" }), a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400", children: "Node.js" }), a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400", children: "PostgreSQL" }), a.jsx("span", { className: "px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400", children: "TailwindCSS" })] })] })] }), a.jsxs("div", { className: "p-6 border-t border-border flex justify-end gap-3", children: [a.jsx("button", { onClick: r, className: "px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: "Cerrar" }), a.jsxs("button", { onClick: () => { r(), c(); }, className: "px-4 py-2 rounded-lg bg-solaria text-white hover:bg-solaria-dark transition-colors flex items-center gap-2", children: [a.jsx(gr, { className: "h-4 w-4" }), "Editar"] })] })] }); }
function dN({ project: l, isOpen: i, onClose: r, onSave: c }) { var N, T, M, G; const [d, h] = H.useState({ name: l.name, code: l.code || "", description: l.description || "", budgetAllocated: l.budgetAllocated || 0, startDate: ((N = l.startDate) == null ? void 0 : N.split("T")[0]) || "", endDate: ((T = l.endDate) == null ? void 0 : T.split("T")[0]) || "" }), m = d.code.length === 3 && d.code.toUpperCase() !== ((M = l.code) == null ? void 0 : M.toUpperCase()), { data: x, isLoading: g } = R2(m ? d.code : ""), y = d.code.length === 3 && /^[A-Za-z]{3}$/.test(d.code), v = d.code.toUpperCase() === ((G = l.code) == null ? void 0 : G.toUpperCase()), b = v || ((x == null ? void 0 : x.available) ?? !0), D = V => { const X = V.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3); h({ ...d, code: X }); }, A = () => { !y || !v && !b || (c(d), r()); }; return a.jsxs(Lr, { isOpen: i, onClose: r, title: "Editar Proyecto", children: [a.jsxs("div", { className: "p-6 space-y-4", children: [a.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [a.jsxs("div", { className: "col-span-2", children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Nombre" }), a.jsx("input", { type: "text", value: d.name, onChange: V => h({ ...d, name: V.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Codigo (3 letras)" }), a.jsxs("div", { className: "relative", children: [a.jsx("input", { type: "text", value: d.code, onChange: D, maxLength: 3, placeholder: "ABC", className: Z("w-full px-3 py-2 rounded-lg bg-secondary border text-foreground font-mono text-center uppercase tracking-wider", !y && d.code.length > 0 ? "border-red-500" : y && !g && !v && b ? "border-green-500" : y && !g && !b ? "border-red-500" : "border-border") }), g && a.jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "..." })] }), !y && d.code.length > 0 && a.jsx("p", { className: "text-xs text-red-400 mt-1", children: "Solo 3 letras A-Z" }), y && !v && !g && !b && a.jsx("p", { className: "text-xs text-red-400 mt-1", children: "Codigo en uso" }), y && !v && !g && b && a.jsx("p", { className: "text-xs text-green-400 mt-1", children: "Disponible ✓" })] })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Presupuesto" }), a.jsx("input", { type: "number", value: d.budgetAllocated, onChange: V => h({ ...d, budgetAllocated: Number(V.target.value) }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Fecha Inicio" }), a.jsx("input", { type: "date", value: d.startDate, onChange: V => h({ ...d, startDate: V.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Deadline" }), a.jsx("input", { type: "date", value: d.endDate, onChange: V => h({ ...d, endDate: V.target.value }), className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground" })] })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-1", children: "Descripcion" }), a.jsx("textarea", { value: d.description, onChange: V => h({ ...d, description: V.target.value }), rows: 4, className: "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground resize-none" })] })] }), a.jsxs("div", { className: "p-6 border-t border-border flex justify-end gap-3", children: [a.jsx("button", { onClick: r, className: "px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors", children: "Cancelar" }), a.jsx("button", { onClick: A, disabled: !y || !v && !b || g, className: Z("px-4 py-2 rounded-lg transition-colors", !y || !v && !b || g ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-solaria text-white hover:bg-solaria-dark"), children: "Guardar" })] })] }); }
function fN() { const { id: l } = Sr(), i = oa(), r = Number(l), [c, d] = H.useState(!1), [h, m] = H.useState(!1), [x, g] = H.useState([]), { data: y, isLoading: v, error: b } = bg(r), { data: D = [] } = Ng(r), { data: A = [] } = q2(r), { data: N = [] } = L2(r), T = v2(), M = B2(), G = U2(), V = H2(), X = V2(), ee = H.useMemo(() => { const he = D.length, O = D.filter(ge => ge.status === "pending").length, K = D.filter(ge => ge.status === "in_progress").length, L = D.filter(ge => ge.status === "completed").length, ce = he > 0 ? Math.round(L / he * 100) : 0; let ve = 0; if (y != null && y.endDate) {
    const ge = new Date(y.endDate), me = new Date;
    ve = Math.ceil((ge.getTime() - me.getTime()) / (1e3 * 60 * 60 * 24));
} return { total: he, pending: O, inProgress: K, completed: L, progress: ce, daysRemaining: ve }; }, [D, y]), re = H.useMemo(() => { const O = D.filter(ce => ce.status === "pending").length, K = D.filter(ce => ce.status === "in_progress").length, L = D.filter(ce => ce.status === "completed").length; return { backlog: 0, todo: O, doing: K, done: L }; }, [D]), I = H.useCallback(() => { d(!0); }, []), U = H.useCallback(() => { i(`/projects/${r}/tasks`); }, [i, r]), Y = H.useCallback(() => { console.log("Direcciones clicked"); }, []), we = H.useCallback(he => { g(O => [he, ...O]); }, []), ft = H.useCallback(he => { T.mutate({ id: r, data: he }); }, [r, T]), et = H.useCallback(he => { M.mutate({ projectId: r, data: { name: he } }); }, [r, M]), Me = H.useCallback(he => { G.mutate({ id: he, projectId: r }); }, [r, G]), ut = H.useCallback(he => { V.mutate({ projectId: r, data: { name: he } }); }, [r, V]), Xe = H.useCallback(he => { X.mutate({ id: he, projectId: r }); }, [r, X]); return v ? a.jsx("div", { className: "flex items-center justify-center h-64", children: a.jsx(ot, { className: "h-8 w-8 animate-spin text-solaria" }) }) : b || !y ? a.jsxs("div", { className: "flex flex-col items-center justify-center h-64 gap-4", children: [a.jsx(wt, { className: "h-12 w-12 text-red-500" }), a.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Proyecto no encontrado" }), a.jsxs("p", { className: "text-muted-foreground", children: ["El proyecto con ID ", r, " no existe o no tienes acceso."] }), a.jsxs("button", { onClick: () => i("/projects"), className: "px-4 py-2 rounded-lg bg-solaria text-white flex items-center gap-2", children: [a.jsx(Du, { className: "h-4 w-4" }), "Volver a Proyectos"] })] }) : a.jsxs("div", { className: "p-4 sm:p-6 space-y-4 sm:space-y-6", children: [a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { className: "flex items-center gap-4", children: [a.jsx("button", { onClick: () => i("/projects"), className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Volver al listado", children: a.jsx(Du, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsx("h1", { className: "text-xl sm:text-2xl font-bold text-foreground", children: y.name }), a.jsx("p", { className: "text-sm text-muted-foreground", children: y.description })] })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsxs("button", { onClick: () => d(!0), className: "px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors", children: [a.jsx(Wx, { className: "h-4 w-4" }), a.jsx("span", { className: "hidden sm:inline", children: "Info" })] }), a.jsx("button", { onClick: () => m(!0), className: "p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors", title: "Configuracion", children: a.jsx(Iu, { className: "h-4 w-4" }) })] })] }), a.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6", children: [a.jsxs("div", { className: "lg:col-span-2 space-y-4 sm:space-y-6", children: [a.jsx(aN, { project: y, metrics: ee, onClick: I }), a.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [a.jsx(lN, { metrics: ee, tasksByStatus: re, onClick: U }), a.jsx(nN, { onClick: Y })] }), a.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [a.jsx(cN, { epics: A, onCreateEpic: et, onDeleteEpic: Me }), a.jsx(oN, { sprints: N, onCreateSprint: ut, onDeleteSprint: Xe })] })] }), a.jsxs("div", { className: "space-y-4 sm:space-y-6", children: [a.jsx(iN, { activities: [] }), a.jsx(rN, { notes: x, onAddNote: we })] })] }), a.jsx(uN, { project: y, isOpen: c, onClose: () => d(!1), onEdit: () => m(!0) }), a.jsx(dN, { project: y, isOpen: h, onClose: () => m(!1), onSave: ft })] }); }
const jr = { critical: 0, high: 1, medium: 2, low: 3 }, Nr = { pending: 0, in_progress: 1, blocked: 2, completed: 3 }, En = { pending: "todo", blocked: "backlog", in_progress: "doing", review: "doing", completed: "done", cancelled: "done" }, hN = [{ key: "backlog", label: "Backlog", color: "#64748b" }, { key: "todo", label: "Por Hacer", color: "#f59e0b" }, { key: "doing", label: "En Progreso", color: "#3b82f6" }, { key: "done", label: "Completadas", color: "#22c55e" }], ca = { critical: { color: "#ef4444", label: "P0", bg: "rgba(239, 68, 68, 0.2)" }, high: { color: "#f59e0b", label: "P1", bg: "rgba(249, 115, 22, 0.2)" }, medium: { color: "#3b82f6", label: "P2", bg: "rgba(59, 130, 246, 0.2)" }, low: { color: "#64748b", label: "P3", bg: "rgba(100, 116, 139, 0.2)" } }, Hr = { pending: "Pendiente", in_progress: "En Progreso", review: "En Revision", completed: "Completada", blocked: "Bloqueada", cancelled: "Cancelada" };
function mN({ task: l, agent: i, onClick: r }) { const c = ca[l.priority] || ca.medium, d = l.status === "in_progress", h = l.taskCode || `#${l.id}`; return a.jsxs("div", { onClick: r, className: "task-card bg-secondary border border-border rounded-lg p-3 cursor-pointer transition-all hover:border-solaria hover:-translate-y-0.5", children: [a.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [a.jsxs("span", { className: "text-[13px] font-medium text-foreground leading-tight", children: [a.jsx("span", { className: "text-solaria font-semibold mr-1.5", children: h }), l.title] }), a.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [a.jsx("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase", style: { background: c.bg, color: c.color }, children: c.label }), l.estimatedHours && l.estimatedHours > 0 && a.jsxs("span", { className: "text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1", children: [a.jsx($x, { className: "h-2.5 w-2.5" }), l.estimatedHours, "h"] })] })] }), l.description && a.jsx("p", { className: "text-[11px] text-muted-foreground mb-2.5 line-clamp-2", children: l.description }), d && l.progress > 0 && a.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [a.jsx("div", { className: "flex-1 h-1 bg-background/50 rounded overflow-hidden", children: a.jsx("div", { className: "h-full rounded transition-all", style: { width: `${l.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}dd)` } }) }), a.jsxs("span", { className: "text-[10px] font-bold min-w-[32px] text-right", style: { color: l.progress >= 100 ? "#22c55e" : c.color }, children: [l.progress, "%"] })] }), a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [i ? a.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-solaria bg-solaria/10 px-1.5 py-0.5 rounded", children: [a.jsx(Dr, { className: "h-3 w-3" }), i.name.replace("SOLARIA-", "")] }) : a.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [a.jsx(Ra, { className: "h-3 w-3" }), "Sin asignar"] }), l.status && l.status !== "in_progress" && a.jsx("span", { className: "text-[8px] px-1 py-0.5 bg-secondary rounded text-muted-foreground", children: Hr[l.status] || l.status })] }), l.createdAt && a.jsxs("span", { className: "text-[9px] text-muted-foreground flex items-center gap-1", children: [a.jsx(Ie, { className: "h-2.5 w-2.5" }), it(l.createdAt)] })] })] }); }
function pN({ column: l, tasks: i, agents: r, onTaskClick: c, onAddTask: d }) { const h = m => r.find(x => x.id === m); return a.jsxs("div", { className: Z("flex-1 min-w-0 bg-secondary/30 rounded-xl flex flex-col h-full overflow-hidden", `kanban-column-${l.key}`), children: [a.jsxs("div", { className: "px-4 py-3 flex items-center justify-between border-b border-border", children: [a.jsxs("span", { className: "text-xs font-semibold uppercase tracking-wide flex items-center gap-2", children: [a.jsx("span", { className: "w-2 h-2 rounded-full", style: { background: l.color } }), l.label] }), a.jsx("span", { className: "text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full", children: i.length })] }), a.jsxs("div", { className: "flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2", children: [i.map(m => a.jsx(mN, { task: m, agent: h(m.assignedAgentId), onClick: () => c(m.id) }, m.id)), l.key === "backlog" && d && a.jsxs("button", { onClick: d, className: "w-full p-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-xs hover:border-solaria hover:text-solaria transition-colors flex items-center justify-center gap-1.5", children: [a.jsx(qt, { className: "h-3.5 w-3.5" }), "Agregar tarea"] }), i.length === 0 && l.key !== "backlog" && a.jsx("div", { className: "text-center py-8 text-muted-foreground text-xs", children: "Sin tareas" })] })] }); }
function xN({ tasks: l, agents: i, onTaskClick: r, onCreateTask: c }) { const d = H.useMemo(() => { const h = { backlog: [], todo: [], doing: [], done: [] }; return l.forEach(m => { const x = En[m.status] || "todo"; h[x].push(m); }), h; }, [l]); return a.jsx("div", { className: "kanban-board flex gap-3 h-[calc(100vh-320px)] min-h-[400px]", children: hN.map(h => a.jsx(pN, { column: h, tasks: d[h.key] || [], agents: i, onTaskClick: r, onAddTask: h.key === "backlog" ? c : void 0 }, h.key)) }); }
function gN({ tasks: l, agents: i, sortBy: r, onTaskClick: c }) { const d = m => i.find(x => x.id === m), h = H.useMemo(() => [...l].sort((m, x) => r === "priority" ? (jr[m.priority] ?? 3) - (jr[x.priority] ?? 3) : r === "status" ? (Nr[m.status] ?? 0) - (Nr[x.status] ?? 0) : r === "progress" ? (x.progress || 0) - (m.progress || 0) : 0), [l, r]); return a.jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: [h.map(m => { var v; const x = d(m.assignedAgentId), g = m.status === "completed", y = ca[m.priority] || ca.medium; return a.jsxs("div", { onClick: () => c(m.id), className: "flex items-center gap-4 p-4 bg-card border-b border-border last:border-b-0 hover:bg-secondary/30 cursor-pointer transition-colors", children: [a.jsx("div", { className: "w-1 h-12 rounded-full flex-shrink-0", style: { background: y.color } }), g && a.jsx(ct, { className: "h-5 w-5 text-green-500 flex-shrink-0" }), a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("h4", { className: Z("font-medium truncate", g && "line-through opacity-70"), children: m.title }), a.jsx("span", { className: "px-2 py-0.5 rounded text-xs", style: { background: y.bg, color: y.color }, children: Hr[m.status] || m.status })] }), a.jsx("p", { className: "text-sm text-muted-foreground truncate", children: m.description || "Sin descripcion" })] }), a.jsxs("div", { className: "w-32 flex-shrink-0", children: [a.jsxs("div", { className: "flex justify-between text-xs mb-1", children: [a.jsx("span", { className: "text-muted-foreground", children: "Progreso" }), a.jsxs("span", { children: [m.progress, "%"] })] }), a.jsx("div", { className: "h-2 bg-secondary rounded-full overflow-hidden", children: a.jsx("div", { className: Z("h-full rounded-full transition-all", g ? "bg-green-500" : "bg-solaria"), style: { width: `${m.progress}%` } }) })] }), a.jsxs("div", { className: "w-32 text-right flex-shrink-0", children: [a.jsx("p", { className: "text-sm", children: ((v = x == null ? void 0 : x.name) == null ? void 0 : v.replace("SOLARIA-", "")) || "Sin asignar" }), a.jsxs("p", { className: "text-xs text-muted-foreground", children: [m.estimatedHours || 0, "h"] })] }), a.jsx($u, { className: "h-5 w-5 text-muted-foreground flex-shrink-0" })] }, m.id); }), h.length === 0 && a.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No hay tareas" })] }); }
function yN({ tasks: l, agents: i, sortBy: r, onTaskClick: c }) { const d = g => i.find(y => y.id === g), h = H.useMemo(() => [...l].sort((g, y) => r === "priority" ? (jr[g.priority] ?? 3) - (jr[y.priority] ?? 3) : r === "status" ? (Nr[g.status] ?? 0) - (Nr[y.status] ?? 0) : r === "progress" ? (y.progress || 0) - (g.progress || 0) : 0), [l, r]), m = H.useMemo(() => Math.max(...l.map(g => g.estimatedHours || 0), 8), [l]), x = g => { switch (g) {
    case "critical": return "linear-gradient(to right, #ef4444, #dc2626)";
    case "high": return "linear-gradient(to right, #f97316, #ea580c)";
    case "medium": return "linear-gradient(to right, #f6921d, #d97b0d)";
    case "low": return "linear-gradient(to right, #6b7280, #4b5563)";
    default: return "linear-gradient(to right, #f6921d, #d97b0d)";
} }; return a.jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden", children: [a.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between", children: [a.jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [a.jsx(Pu, { className: "h-5 w-5 text-solaria" }), "Vista Gantt"] }), a.jsxs("div", { className: "flex gap-4 text-xs", children: [a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#ef4444" } }), "Crítica"] }), a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#f97316" } }), "Alta"] }), a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#f6921d" } }), "Media"] }), a.jsxs("span", { className: "flex items-center gap-1.5", children: [a.jsx("span", { className: "w-3 h-3 rounded", style: { background: "#6b7280" } }), "Baja"] })] })] }), a.jsxs("div", { className: "flex items-center gap-4 px-4 py-2 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [a.jsx("div", { className: "w-72", children: "Tarea" }), a.jsx("div", { className: "w-24 text-center", children: "Estado" }), a.jsx("div", { className: "flex-1", children: "Timeline (horas)" })] }), a.jsxs("div", { className: "divide-y divide-border", children: [h.map(g => { var N; const y = d(g.assignedAgentId), v = g.status === "completed", b = ca[g.priority] || ca.medium, D = (g.estimatedHours || 0) / m * 100, A = g.progress || 0; return a.jsxs("div", { onClick: () => c(g.id), className: "flex items-center gap-4 py-3 px-4 hover:bg-secondary/30 cursor-pointer transition-colors", children: [a.jsxs("div", { className: "w-72 min-w-0", children: [a.jsx("p", { className: Z("text-sm truncate font-medium", v && "line-through opacity-70"), children: g.title }), a.jsx("p", { className: "text-xs text-muted-foreground truncate", children: ((N = y == null ? void 0 : y.name) == null ? void 0 : N.replace("SOLARIA-", "")) || "Sin asignar" })] }), a.jsx("div", { className: "w-24 text-center", children: a.jsx("span", { className: "inline-block px-2 py-1 rounded text-xs", style: { background: b.bg, color: b.color }, children: Hr[g.status] || g.status }) }), a.jsxs("div", { className: "flex-1 h-8 bg-secondary/50 rounded relative overflow-hidden", children: [D > 0 && a.jsxs("div", { className: "absolute inset-y-0 left-0 rounded flex items-center transition-all", style: { width: `${Math.max(D, 10)}%`, background: x(g.priority) }, children: [a.jsx("div", { className: "absolute inset-y-0 left-0 bg-white/30 rounded", style: { width: `${A}%` } }), a.jsxs("span", { className: "text-xs text-white px-2 font-medium relative z-10 drop-shadow", children: [g.estimatedHours || 0, "h - ", A, "%"] })] }), D === 0 && a.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Sin estimación" })] })] }, g.id); }), h.length === 0 && a.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No hay tareas" })] })] }); }
function bN({ task: l, agent: i, isOpen: r, onClose: c }) { const [d, h] = H.useState(!1), { data: m = [], isLoading: x } = O2((l == null ? void 0 : l.id) || 0), { data: g = [] } = _2(), y = z2(), v = D2(), b = H.useMemo(() => { const G = new Set(m.map(V => V.id)); return g.filter(V => !G.has(V.id)); }, [m, g]), D = H.useCallback(G => { l && (y.mutate({ taskId: l.id, tagId: G }), h(!1)); }, [l, y]), A = H.useCallback(G => { l && v.mutate({ taskId: l.id, tagId: G }); }, [l, v]); if (!l)
    return null; const N = ca[l.priority] || ca.medium, T = Hr[l.status] || l.status, M = l.taskCode || `#${l.id}`; return a.jsxs(Lr, { isOpen: r, onClose: c, title: "", maxWidth: "max-w-2xl", children: [a.jsxs("div", { className: "px-6 py-4 border-b border-border", style: { borderLeft: `4px solid ${N.color}` }, children: [a.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [a.jsx("span", { className: "px-2 py-1 rounded text-[11px] font-bold", style: { background: N.bg, color: N.color }, children: N.label }), a.jsx("span", { className: "px-2 py-1 rounded text-[11px] bg-secondary", children: T }), a.jsx("span", { className: "text-[11px] text-muted-foreground", children: M })] }), a.jsx("h3", { className: "text-lg font-semibold", children: l.title })] }), a.jsxs("div", { className: "p-6 space-y-6", children: [a.jsxs("div", { children: [a.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [a.jsx(Z1, { className: "h-4 w-4 text-solaria" }), "Descripcion"] }), a.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: l.description || "Sin descripcion disponible" })] }), l.progress > 0 && a.jsxs("div", { children: [a.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [a.jsx(uj, { className: "h-4 w-4 text-solaria" }), "Progreso"] }), a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "flex-1 h-2 bg-secondary rounded-full overflow-hidden", children: a.jsx("div", { className: "h-full rounded-full", style: { width: `${l.progress}%`, background: N.color } }) }), a.jsxs("span", { className: "text-sm font-semibold", style: { color: N.color }, children: [l.progress, "%"] })] })] }), a.jsxs("div", { children: [a.jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [a.jsx(ag, { className: "h-4 w-4 text-solaria" }), "Etiquetas"] }), a.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [x ? a.jsx(ot, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : m.length === 0 ? a.jsx("span", { className: "text-xs text-muted-foreground", children: "Sin etiquetas" }) : m.map(G => a.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium group", style: { backgroundColor: `${G.color}20`, color: G.color }, children: [G.name, a.jsx("button", { onClick: () => A(G.id), className: "opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5", title: "Eliminar etiqueta", children: a.jsx(wl, { className: "h-3 w-3" }) })] }, G.id)), d ? a.jsx("div", { className: "relative", children: a.jsxs("div", { className: "absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] max-h-[200px] overflow-y-auto", children: [b.length === 0 ? a.jsx("p", { className: "text-xs text-muted-foreground p-2", children: "No hay etiquetas disponibles" }) : b.map(G => a.jsxs("button", { onClick: () => D(G.id), className: "w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors flex items-center gap-2", children: [a.jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: G.color } }), a.jsx("span", { className: "text-sm", children: G.name })] }, G.id)), a.jsx("button", { onClick: () => h(!1), className: "w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors text-xs text-muted-foreground mt-1 border-t border-border", children: "Cancelar" })] }) }) : a.jsx("button", { onClick: () => h(!0), className: "px-2 py-1 rounded text-xs border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-solaria hover:text-solaria transition-colors", children: "+ Agregar" })] })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(Ra, { className: "h-3 w-3 text-blue-400" }), "Asignado a"] }), a.jsx("p", { className: "text-sm font-medium", children: (i == null ? void 0 : i.name) || "Sin asignar" })] }), a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx($x, { className: "h-3 w-3 text-yellow-400" }), "Horas Estimadas"] }), a.jsxs("p", { className: "text-sm font-medium", children: [l.estimatedHours || 0, " horas"] })] }), a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(Da, { className: "h-3 w-3 text-green-400" }), "Fecha Creacion"] }), a.jsx("p", { className: "text-sm font-medium", children: l.createdAt ? new Date(l.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "N/A" })] }), a.jsxs("div", { className: "p-4 bg-secondary/50 rounded-lg", children: [a.jsxs("h4", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [a.jsx(Da, { className: "h-3 w-3 text-red-400" }), "Ultima Actualizacion"] }), a.jsx("p", { className: "text-sm font-medium", children: l.updatedAt ? it(l.updatedAt) : "N/A" })] })] })] }), a.jsxs("div", { className: "px-6 py-4 border-t border-border flex items-center justify-between", children: [a.jsx("button", { onClick: c, className: "px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm", children: "Cerrar" }), a.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg", children: [a.jsx(Dr, { className: "h-3.5 w-3.5" }), "Solo el agente puede completar"] })] })] }); }
function vN({ isOpen: l, onClose: i, projectId: r, onTaskCreated: c }) { const [d, h] = H.useState(""), [m, x] = H.useState(""), [g, y] = H.useState("medium"), [v, b] = H.useState(1), D = N2(), A = async (N) => { if (N.preventDefault(), !!d.trim())
    try {
        await D.mutateAsync({ projectId: r, title: d.trim(), description: m.trim(), priority: g, status: "pending", estimatedHours: v }), h(""), x(""), y("medium"), b(1), c(), i();
    }
    catch (T) {
        console.error("Error creating task:", T);
    } }; return a.jsx(Lr, { isOpen: l, onClose: i, title: "Nueva Tarea", maxWidth: "max-w-lg", children: a.jsxs("form", { onSubmit: A, className: "p-6 space-y-4", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Titulo *" }), a.jsx("input", { type: "text", value: d, onChange: N => h(N.target.value), placeholder: "Nombre de la tarea...", className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none", required: !0, autoFocus: !0 })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Descripcion" }), a.jsx("textarea", { value: m, onChange: N => x(N.target.value), placeholder: "Describe la tarea...", rows: 4, className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none resize-none" })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Prioridad" }), a.jsxs("select", { value: g, onChange: N => y(N.target.value), className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none", children: [a.jsx("option", { value: "low", children: "P3 - Baja" }), a.jsx("option", { value: "medium", children: "P2 - Media" }), a.jsx("option", { value: "high", children: "P1 - Alta" }), a.jsx("option", { value: "critical", children: "P0 - Critica" })] })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-sm font-medium mb-2", children: "Horas Estimadas" }), a.jsx("input", { type: "number", value: v, onChange: N => b(Number(N.target.value)), min: .5, step: .5, className: "w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none" })] })] }), a.jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-border", children: [a.jsx("button", { type: "button", onClick: i, className: "px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors", children: "Cancelar" }), a.jsx("button", { type: "submit", disabled: !d.trim() || D.isPending, className: "px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: D.isPending ? "Creando..." : "Crear Tarea" })] })] }) }); }
function jN() { const { id: l } = Sr(), i = oa(), r = parseInt(l || "0"), [c, d] = H.useState("kanban"), [h, m] = H.useState("priority"), [x, g] = H.useState(!1), [y, v] = H.useState(null), { data: b, isLoading: D } = bg(r), { data: A, isLoading: N, refetch: T } = Ng(r), { data: M } = jg(), G = H.useMemo(() => A ? { backlog: A.filter(U => En[U.status] === "backlog").length, todo: A.filter(U => En[U.status] === "todo").length, doing: A.filter(U => En[U.status] === "doing").length, done: A.filter(U => En[U.status] === "done").length } : { backlog: 0, todo: 0, doing: 0, done: 0 }, [A]), V = H.useMemo(() => !y || !A ? null : A.find(U => U.id === y) || null, [y, A]), X = H.useMemo(() => { if (!(!V || !M))
    return M.find(U => U.id === V.assignedAgentId); }, [V, M]), ee = H.useCallback(U => { v(U); }, []), re = H.useCallback(() => { T(); }, [T]), I = () => { i(`/projects/${r}`); }; return D || N ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(ot, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : b ? a.jsxs("div", { className: "h-full flex flex-col", children: [a.jsxs("div", { className: "flex items-center justify-between mb-4 flex-shrink-0", children: [a.jsxs("div", { className: "flex items-center gap-4", children: [a.jsx("button", { onClick: I, className: "p-2 rounded-lg hover:bg-secondary transition-colors", title: "Volver al proyecto", children: a.jsx(Du, { className: "h-5 w-5" }) }), a.jsxs("div", { children: [a.jsxs("h1", { className: "text-xl font-bold", children: ["Tareas - ", b.name] }), a.jsxs("p", { className: "text-sm text-muted-foreground", children: [(A == null ? void 0 : A.length) || 0, " tareas en total"] })] })] }), a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsxs("div", { className: "flex bg-secondary rounded-lg overflow-hidden", children: [a.jsxs("button", { onClick: () => d("kanban"), className: Z("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "kanban" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [a.jsx(qn, { className: "h-4 w-4" }), "Kanban"] }), a.jsxs("button", { onClick: () => d("list"), className: Z("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "list" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [a.jsx(Bn, { className: "h-4 w-4" }), "Lista"] }), a.jsxs("button", { onClick: () => d("gantt"), className: Z("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2", c === "gantt" ? "bg-solaria text-white" : "text-muted-foreground hover:text-foreground"), children: [a.jsx(Pu, { className: "h-4 w-4" }), "Gantt"] })] }), (c === "list" || c === "gantt") && a.jsxs("select", { value: h, onChange: U => m(U.target.value), className: "px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:border-solaria focus:outline-none transition-colors", children: [a.jsx("option", { value: "priority", children: "Ordenar: Prioridad" }), a.jsx("option", { value: "status", children: "Ordenar: Estado" }), a.jsx("option", { value: "progress", children: "Ordenar: Progreso" })] }), a.jsxs("button", { onClick: () => g(!0), className: "px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium flex items-center gap-2 transition-colors", children: [a.jsx(qt, { className: "h-4 w-4" }), "Nueva Tarea"] })] })] }), a.jsxs("div", { className: "flex items-center gap-1 mb-3 flex-shrink-0 bg-secondary/50 rounded-lg p-2", children: [a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#64748b" }, children: G.backlog }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Backlog" })] }), a.jsx("div", { className: "w-px h-8 bg-border" }), a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#f59e0b" }, children: G.todo }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Por Hacer" })] }), a.jsx("div", { className: "w-px h-8 bg-border" }), a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#3b82f6" }, children: G.doing }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "En Progreso" })] }), a.jsx("div", { className: "w-px h-8 bg-border" }), a.jsxs("div", { className: "flex-1 text-center px-3 py-1", children: [a.jsx("div", { className: "text-base font-bold", style: { color: "#22c55e" }, children: G.done }), a.jsx("div", { className: "text-[9px] text-muted-foreground uppercase", children: "Completadas" })] })] }), a.jsxs("div", { className: "flex-1 min-h-0", children: [c === "kanban" && a.jsx(xN, { tasks: A || [], agents: M || [], onTaskClick: ee, onCreateTask: () => g(!0) }), c === "list" && a.jsx("div", { className: "h-full overflow-auto", children: a.jsx(gN, { tasks: A || [], agents: M || [], sortBy: h, onTaskClick: ee }) }), c === "gantt" && a.jsx("div", { className: "h-full overflow-auto", children: a.jsx(yN, { tasks: A || [], agents: M || [], sortBy: h, onTaskClick: ee }) })] }), a.jsx(vN, { isOpen: x, onClose: () => g(!1), projectId: r, onTaskCreated: re }), a.jsx(bN, { task: V, agent: X, isOpen: !!y, onClose: () => v(null) })] }) : a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx("p", { className: "text-muted-foreground", children: "Proyecto no encontrado" }) }); }
const Xp = { critical: { color: "text-red-500", bg: "bg-red-500/10", label: "Critica" }, high: { color: "text-orange-500", bg: "bg-orange-500/10", label: "Alta" }, medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Media" }, low: { color: "text-green-500", bg: "bg-green-500/10", label: "Baja" } }, Zp = { feature: { color: "text-purple-500", bg: "bg-purple-500/10", label: "Feature" }, bug: { color: "text-red-500", bg: "bg-red-500/10", label: "Bug" }, enhancement: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Mejora" }, documentation: { color: "text-gray-500", bg: "bg-gray-500/10", label: "Docs" }, research: { color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Research" }, maintenance: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Maint." } };
function NN({ task: l, onClick: i, showProject: r = !1, compact: c = !1 }) { const d = Xp[l.priority] || Xp.medium, h = Zp[l.type] || Zp.feature, m = l.itemsTotal || 0, x = l.itemsCompleted || 0, g = m > 0 ? Math.round(x / m * 100) : 0, y = l.dueDate && new Date(l.dueDate) < new Date && l.status !== "completed"; return c ? a.jsxs("div", { onClick: i, className: "task-card-compact", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("span", { className: Z("task-badge", h.bg, h.color), children: h.label }), a.jsx("span", { className: "task-code", children: l.taskCode || `#${l.taskNumber}` })] }), a.jsx("div", { className: "task-title-compact", children: l.title }), m > 0 && a.jsxs("div", { className: "task-progress-mini", children: [a.jsx("div", { className: "task-progress-bar-mini", children: a.jsx("div", { className: "task-progress-fill-mini", style: { width: `${g}%` } }) }), a.jsxs("span", { className: "task-progress-text-mini", children: [x, "/", m] })] })] }) : a.jsxs("div", { onClick: i, className: Z("task-card", l.status === "blocked" && "blocked", y && "overdue"), children: [a.jsxs("div", { className: "task-card-header", children: [a.jsxs("div", { className: "task-badges", children: [a.jsx("span", { className: Z("task-badge", h.bg, h.color), children: h.label }), a.jsxs("span", { className: Z("task-badge", d.bg, d.color), children: [a.jsx(Zx, { className: "h-3 w-3" }), d.label] })] }), a.jsx("span", { className: "task-code", children: l.taskCode || `#${l.taskNumber}` })] }), r && l.projectName && a.jsx("div", { className: "task-project-label", children: l.projectCode || l.projectName }), a.jsx("h4", { className: "task-card-title", children: l.title }), l.description && a.jsx("p", { className: "task-card-description", children: l.description }), m > 0 && a.jsxs("div", { className: "task-items-progress", children: [a.jsxs("div", { className: "flex items-center justify-between mb-1", children: [a.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [a.jsx(ct, { className: "h-3 w-3" }), "Subtareas"] }), a.jsxs("span", { className: "text-xs font-medium", children: [x, "/", m] })] }), a.jsx("div", { className: "task-progress-bar", children: a.jsx("div", { className: Z("task-progress-fill", g === 100 && "complete"), style: { width: `${g}%` } }) })] }), a.jsxs("div", { className: "task-card-footer", children: [l.dueDate && a.jsxs("div", { className: Z("task-meta", y && "text-red-500"), children: [a.jsx(Da, { className: "h-3 w-3" }), a.jsx("span", { children: it(l.dueDate) })] }), l.estimatedHours && a.jsxs("div", { className: "task-meta", children: [a.jsx(Ie, { className: "h-3 w-3" }), a.jsxs("span", { children: [l.estimatedHours, "h"] })] }), l.notes && a.jsx("div", { className: "task-meta", children: a.jsx(eg, { className: "h-3 w-3" }) }), a.jsx("div", { className: "flex-1" }), l.agentName && a.jsxs("div", { className: "task-assignee", children: [a.jsx("div", { className: "task-assignee-avatar", children: a.jsx(Ra, { className: "h-3 w-3" }) }), a.jsx("span", { className: "task-assignee-name", children: l.agentName.split("-").pop() })] }), l.status === "blocked" && a.jsxs("div", { className: "task-blocked-badge", children: [a.jsx(wt, { className: "h-3 w-3" }), "Bloqueado"] })] })] }); }
function wN({ item: l, onComplete: i, disabled: r = !1, showDragHandle: c = !1 }) { const [d, h] = H.useState(!1), [m, x] = H.useState(!1), [g, y] = H.useState(""), [v, b] = H.useState(l.estimatedMinutes || 0), D = async () => { if (!(l.isCompleted || r || d)) {
    if (!m && l.estimatedMinutes) {
        x(!0);
        return;
    }
    h(!0);
    try {
        await i(l.id, g || void 0, v || void 0);
    }
    finally {
        h(!1), x(!1);
    }
} }, A = async () => { if (!(l.isCompleted || r || d)) {
    h(!0);
    try {
        await i(l.id);
    }
    finally {
        h(!1);
    }
} }; return a.jsxs("div", { className: Z("task-item-row", l.isCompleted && "completed"), children: [c && a.jsx("div", { className: "task-item-handle", children: a.jsx(ij, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: A, disabled: l.isCompleted || r || d, className: Z("task-item-checkbox", l.isCompleted && "checked", d && "loading"), children: d ? a.jsx(ot, { className: "h-3 w-3 animate-spin" }) : l.isCompleted ? a.jsx(Mn, { className: "h-3 w-3" }) : null }), a.jsxs("div", { className: "task-item-content", children: [a.jsx("span", { className: Z("task-item-title", l.isCompleted && "completed"), children: l.title }), l.description && a.jsx("span", { className: "task-item-description", children: l.description }), m && !l.isCompleted && a.jsxs("div", { className: "task-item-complete-form", children: [a.jsx("input", { type: "number", value: v, onChange: N => b(Number(N.target.value)), placeholder: "Minutos reales", className: "task-item-minutes-input", min: 0 }), a.jsx("input", { type: "text", value: g, onChange: N => y(N.target.value), placeholder: "Notas (opcional)", className: "task-item-notes-input" }), a.jsx("button", { onClick: D, disabled: d, className: "task-item-complete-btn", children: d ? a.jsx(ot, { className: "h-3 w-3 animate-spin" }) : "Completar" }), a.jsx("button", { onClick: () => x(!1), className: "task-item-cancel-btn", children: "Cancelar" })] })] }), a.jsx("div", { className: "task-item-time", children: l.isCompleted && l.completedAt ? a.jsxs("span", { className: "task-item-completed-at", children: [a.jsx(Mn, { className: "h-3 w-3" }), it(l.completedAt)] }) : l.estimatedMinutes ? a.jsxs("span", { className: "task-item-estimate", children: [a.jsx(Ie, { className: "h-3 w-3" }), l.estimatedMinutes, "m"] }) : null })] }); }
function SN({ taskId: l, editable: i = !0, showAddForm: r = !0 }) { const { data: c, isLoading: d, error: h } = T2(l), m = E2(), x = M2(), [g, y] = H.useState([{ title: "", estimatedMinutes: 30 }]), [v, b] = H.useState(!1), [D, A] = H.useState(!1), N = (c == null ? void 0 : c.filter(I => I.isCompleted).length) || 0, T = (c == null ? void 0 : c.length) || 0, M = T > 0 ? Math.round(N / T * 100) : 0, G = () => { y([...g, { title: "", estimatedMinutes: 30 }]); }, V = I => { g.length > 1 && y(g.filter((U, Y) => Y !== I)); }, X = (I, U, Y) => { const we = [...g]; U === "title" ? we[I].title = Y : we[I].estimatedMinutes = Y, y(we); }, ee = async () => { const I = g.filter(U => U.title.trim()); if (I.length !== 0) {
    b(!0);
    try {
        await m.mutateAsync({ taskId: l, items: I.map(U => ({ title: U.title.trim(), estimatedMinutes: U.estimatedMinutes })) }), y([{ title: "", estimatedMinutes: 30 }]), A(!1);
    }
    finally {
        b(!1);
    }
} }, re = async (I, U, Y) => { await x.mutateAsync({ taskId: l, itemId: I, notes: U, actualMinutes: Y }); }; return d ? a.jsxs("div", { className: "task-items-loading", children: [a.jsx(ot, { className: "h-5 w-5 animate-spin" }), a.jsx("span", { children: "Cargando subtareas..." })] }) : h ? a.jsx("div", { className: "task-items-error", children: "Error al cargar subtareas" }) : a.jsxs("div", { className: "task-items-list", children: [a.jsxs("div", { className: "task-items-header", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx(Px, { className: "h-4 w-4 text-muted-foreground" }), a.jsx("span", { className: "font-medium", children: "Subtareas" }), a.jsxs("span", { className: "text-xs text-muted-foreground", children: ["(", N, "/", T, ")"] })] }), T > 0 && a.jsx("div", { className: "task-items-progress-bar", children: a.jsx("div", { className: Z("task-items-progress-fill", M === 100 && "complete"), style: { width: `${M}%` } }) })] }), a.jsx("div", { className: "task-items-body", children: c && c.length > 0 ? c.sort((I, U) => I.sortOrder - U.sortOrder).map(I => a.jsx(wN, { item: I, onComplete: re, disabled: !i }, I.id)) : a.jsxs("div", { className: "task-items-empty", children: [a.jsx(ct, { className: "h-8 w-8 text-muted-foreground/50" }), a.jsx("p", { children: "No hay subtareas definidas" })] }) }), i && r && a.jsx("div", { className: "task-items-add", children: D ? a.jsxs("div", { className: "add-items-form", children: [g.map((I, U) => a.jsxs("div", { className: "add-item-row", children: [a.jsx("input", { type: "text", value: I.title, onChange: Y => X(U, "title", Y.target.value), placeholder: "Titulo de la subtarea...", className: "add-item-title", autoFocus: U === g.length - 1 }), a.jsx("input", { type: "number", value: I.estimatedMinutes, onChange: Y => X(U, "estimatedMinutes", Number(Y.target.value)), className: "add-item-minutes", min: 5, step: 5 }), a.jsx("span", { className: "add-item-minutes-label", children: "min" }), g.length > 1 && a.jsx("button", { onClick: () => V(U), className: "add-item-remove", children: "×" })] }, U)), a.jsxs("div", { className: "add-items-actions", children: [a.jsxs("button", { onClick: G, className: "add-another-btn", children: [a.jsx(qt, { className: "h-3 w-3" }), "Agregar otra"] }), a.jsxs("div", { className: "flex gap-2", children: [a.jsx("button", { onClick: () => { A(!1), y([{ title: "", estimatedMinutes: 30 }]); }, className: "cancel-btn", children: "Cancelar" }), a.jsx("button", { onClick: ee, disabled: v || !g.some(I => I.title.trim()), className: "submit-items-btn", children: v ? a.jsx(ot, { className: "h-4 w-4 animate-spin" }) : "Guardar" })] })] })] }) : a.jsxs("button", { onClick: () => A(!0), className: "add-items-trigger", children: [a.jsx(qt, { className: "h-4 w-4" }), "Agregar subtareas"] }) })] }); }
const bu = { pending: { label: "Pendiente", color: "text-gray-500", bg: "bg-gray-500/10" }, in_progress: { label: "En Progreso", color: "text-blue-500", bg: "bg-blue-500/10" }, review: { label: "En Revision", color: "text-purple-500", bg: "bg-purple-500/10" }, completed: { label: "Completada", color: "text-green-500", bg: "bg-green-500/10" }, blocked: { label: "Bloqueada", color: "text-red-500", bg: "bg-red-500/10" } }, Jp = { critical: { label: "Critica", color: "text-red-500", bg: "bg-red-500/10" }, high: { label: "Alta", color: "text-orange-500", bg: "bg-orange-500/10" }, medium: { label: "Media", color: "text-yellow-500", bg: "bg-yellow-500/10" }, low: { label: "Baja", color: "text-green-500", bg: "bg-green-500/10" } }, Fp = { feature: { label: "Feature", color: "text-purple-500", bg: "bg-purple-500/10" }, bug: { label: "Bug", color: "text-red-500", bg: "bg-red-500/10" }, enhancement: { label: "Mejora", color: "text-blue-500", bg: "bg-blue-500/10" }, documentation: { label: "Documentacion", color: "text-gray-500", bg: "bg-gray-500/10" }, research: { label: "Investigacion", color: "text-cyan-500", bg: "bg-cyan-500/10" }, maintenance: { label: "Mantenimiento", color: "text-amber-500", bg: "bg-amber-500/10" } };
function AN({ taskId: l, isOpen: i, onClose: r, onNavigateToProject: c }) { const { data: d, isLoading: h } = j2(l || 0), m = w2(), [x, g] = H.useState(!1), [y, v] = H.useState(""), [b, D] = H.useState(""); if (!i)
    return null; const A = () => { d && (v(d.notes || ""), D(d.status), g(!0)); }, N = async () => { d && (await m.mutateAsync({ id: d.id, data: { notes: y, status: b || void 0 } }), g(!1)); }, T = async (U) => { d && await m.mutateAsync({ id: d.id, data: { status: U } }); }, M = d ? bu[d.status] : bu.pending, G = d ? Jp[d.priority] : Jp.medium, V = d ? Fp[d.type] : Fp.feature, X = (d == null ? void 0 : d.dueDate) && new Date(d.dueDate) < new Date && d.status !== "completed", ee = (d == null ? void 0 : d.itemsTotal) || 0, re = (d == null ? void 0 : d.itemsCompleted) || 0, I = ee > 0 ? Math.round(re / ee * 100) : (d == null ? void 0 : d.progress) || 0; return a.jsxs("div", { className: "drawer-container", children: [a.jsx("div", { className: Z("drawer-overlay", i && "active"), onClick: r }), a.jsx("div", { className: Z("drawer-panel max-w-xl", i && "active"), children: h ? a.jsx("div", { className: "flex items-center justify-center h-full", children: a.jsx(ot, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : d ? a.jsxs(a.Fragment, { children: [a.jsxs("div", { className: "drawer-header", children: [a.jsxs("div", { className: "flex-1 min-w-0", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [a.jsx("span", { className: Z("task-badge", V.bg, V.color), children: V.label }), a.jsx("span", { className: "task-code", children: d.taskCode || `#${d.taskNumber}` })] }), a.jsx("h2", { className: "drawer-title", children: d.title }), d.projectName && a.jsxs("button", { onClick: () => c == null ? void 0 : c(d.projectId), className: "drawer-subtitle flex items-center gap-1 hover:text-primary transition-colors", children: [d.projectCode || d.projectName, a.jsx(ts, { className: "h-3 w-3" })] })] }), a.jsx("button", { onClick: r, className: "drawer-close", children: a.jsx(wl, { className: "h-5 w-5" }) })] }), a.jsxs("div", { className: "drawer-content", children: [a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(ct, { className: "h-4 w-4" }), "Estado"] }), a.jsx("div", { className: "task-detail-value", children: x ? a.jsx("select", { value: b, onChange: U => D(U.target.value), className: "task-detail-select", children: Object.entries(bu).map(([U, Y]) => a.jsx("option", { value: U, children: Y.label }, U)) }) : a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("span", { className: Z("status-badge", M.bg, M.color), children: M.label }), a.jsxs("div", { className: "task-status-actions", children: [d.status === "pending" && a.jsx("button", { onClick: () => T("in_progress"), className: "status-action-btn in_progress", children: "Iniciar" }), d.status === "in_progress" && a.jsxs(a.Fragment, { children: [a.jsx("button", { onClick: () => T("review"), className: "status-action-btn review", children: "A Revision" }), a.jsx("button", { onClick: () => T("completed"), className: "status-action-btn completed", children: "Completar" })] }), d.status === "review" && a.jsx("button", { onClick: () => T("completed"), className: "status-action-btn completed", children: "Aprobar" })] })] }) })] }), a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(Zx, { className: "h-4 w-4" }), "Prioridad"] }), a.jsx("div", { className: "task-detail-value", children: a.jsx("span", { className: Z("priority-badge", G.bg, G.color), children: G.label }) })] }), d.agentName && a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(Ra, { className: "h-4 w-4" }), "Asignado"] }), a.jsx("div", { className: "task-detail-value", children: a.jsxs("div", { className: "task-assignee-full", children: [a.jsx("div", { className: "task-assignee-avatar-lg", children: a.jsx(Ra, { className: "h-4 w-4" }) }), a.jsx("span", { children: d.agentName })] }) })] }), d.dueDate && a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(Da, { className: "h-4 w-4" }), "Fecha limite"] }), a.jsxs("div", { className: Z("task-detail-value", X && "text-red-500"), children: [Ur(d.dueDate), X && a.jsxs("span", { className: "ml-2 text-xs", children: [a.jsx(wt, { className: "h-3 w-3 inline" }), " Vencida"] })] })] }), (d.estimatedHours || d.actualHours) && a.jsxs("div", { className: "task-detail-row", children: [a.jsxs("div", { className: "task-detail-label", children: [a.jsx(Ie, { className: "h-4 w-4" }), "Tiempo"] }), a.jsx("div", { className: "task-detail-value", children: d.actualHours ? a.jsxs("span", { children: [d.actualHours, "h / ", d.estimatedHours, "h est."] }) : a.jsxs("span", { children: [d.estimatedHours, "h estimadas"] }) })] })] }), a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-section-title", children: [a.jsx(sg, { className: "h-4 w-4" }), "Progreso"] }), a.jsxs("div", { className: "task-progress-display", children: [a.jsx("div", { className: "task-progress-bar-lg", children: a.jsx("div", { className: Z("task-progress-fill-lg", I === 100 && "complete"), style: { width: `${I}%` } }) }), a.jsxs("span", { className: "task-progress-label", children: [I, "%"] })] })] }), d.description && a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-section-title", children: [a.jsx(Xx, { className: "h-4 w-4" }), "Descripcion"] }), a.jsx("p", { className: "task-description-full", children: d.description })] }), a.jsx("div", { className: "task-detail-section", children: a.jsx(SN, { taskId: d.id, editable: d.status !== "completed", showAddForm: d.status !== "completed" }) }), a.jsxs("div", { className: "task-detail-section", children: [a.jsxs("div", { className: "task-detail-section-header", children: [a.jsxs("div", { className: "task-detail-section-title", children: [a.jsx(eg, { className: "h-4 w-4" }), "Notas"] }), !x && a.jsxs("button", { onClick: A, className: "edit-btn", children: [a.jsx(hj, { className: "h-3 w-3" }), "Editar"] })] }), x ? a.jsxs("div", { className: "task-notes-edit", children: [a.jsx("textarea", { value: y, onChange: U => v(U.target.value), placeholder: "Agregar notas...", className: "task-notes-textarea", rows: 4 }), a.jsxs("div", { className: "task-notes-actions", children: [a.jsx("button", { onClick: () => g(!1), className: "cancel-btn", children: "Cancelar" }), a.jsx("button", { onClick: N, disabled: m.isPending, className: "save-btn", children: m.isPending ? a.jsx(ot, { className: "h-4 w-4 animate-spin" }) : a.jsxs(a.Fragment, { children: [a.jsx(pj, { className: "h-3 w-3" }), "Guardar"] }) })] })] }) : d.notes ? a.jsx("p", { className: "task-notes-content", children: d.notes }) : a.jsx("p", { className: "task-notes-empty", children: "Sin notas" })] }), a.jsxs("div", { className: "task-detail-meta", children: [a.jsxs("span", { children: ["Creada ", it(d.createdAt)] }), a.jsx("span", { className: "meta-separator", children: "•" }), a.jsxs("span", { children: ["Actualizada ", it(d.updatedAt)] }), d.completedAt && a.jsxs(a.Fragment, { children: [a.jsx("span", { className: "meta-separator", children: "•" }), a.jsxs("span", { className: "text-green-500", children: ["Completada ", it(d.completedAt)] })] })] })] })] }) : a.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Tarea no encontrada" }) })] }); }
const kN = { pending: "gantt-bar-pending", in_progress: "gantt-bar-in_progress", review: "gantt-bar-review", completed: "gantt-bar-completed", blocked: "gantt-bar-blocked" };
function CN({ task: l, startDate: i, endDate: r, onClick: c }) { const d = l.createdAt ? new Date(l.createdAt) : i, h = l.dueDate ? new Date(l.dueDate) : new Date(d.getTime() + 10080 * 60 * 1e3), m = i.getTime(), x = r.getTime(), g = x - m, y = Math.max(d.getTime(), m), v = Math.min(h.getTime(), x), b = (y - m) / g * 100, D = (v - y) / g * 100; if (D <= 0 || b >= 100)
    return a.jsxs("div", { className: "gantt-row", onClick: c, children: [a.jsxs("div", { className: "gantt-row-info", children: [a.jsx("span", { className: "gantt-task-code", children: l.taskCode || `#${l.taskNumber}` }), a.jsx("span", { className: "gantt-task-title", children: l.title })] }), a.jsx("div", { className: "gantt-row-timeline", children: a.jsx("div", { className: "gantt-bar-empty", children: "Fuera del rango visible" }) })] }); const A = l.progress || 0, N = l.dueDate && new Date(l.dueDate) < new Date && l.status !== "completed"; return a.jsxs("div", { className: Z("gantt-row", c && "clickable"), onClick: c, children: [a.jsxs("div", { className: "gantt-row-info", children: [a.jsx("span", { className: "gantt-task-code", children: l.taskCode || `#${l.taskNumber}` }), a.jsx("span", { className: "gantt-task-title", children: l.title }), l.agentName && a.jsxs("span", { className: "gantt-task-agent", children: [a.jsx(Ra, { className: "h-3 w-3" }), l.agentName.split("-").pop()] })] }), a.jsx("div", { className: "gantt-row-timeline", children: a.jsxs("div", { className: Z("gantt-bar", kN[l.status], N && "overdue"), style: { left: `${Math.max(0, b)}%`, width: `${Math.min(D, 100 - b)}%` }, children: [a.jsx("div", { className: "gantt-bar-progress", style: { width: `${A}%` } }), a.jsxs("div", { className: "gantt-bar-content", children: [D > 10 && a.jsx("span", { className: "gantt-bar-label", children: l.title.length > 20 ? l.title.substring(0, 20) + "..." : l.title }), N && a.jsx(wt, { className: "h-3 w-3 text-red-500" })] })] }) })] }); }
function TN(l) { const i = new Date(Date.UTC(l.getFullYear(), l.getMonth(), l.getDate())), r = i.getUTCDay() || 7; i.setUTCDate(i.getUTCDate() + 4 - r); const c = new Date(Date.UTC(i.getUTCFullYear(), 0, 1)); return Math.ceil(((i.getTime() - c.getTime()) / 864e5 + 1) / 7); }
function vu(l) { const i = l.getDate(), r = l.toLocaleDateString("es", { month: "short" }); return `${i} ${r}`; }
function EN({ tasks: l, onTaskClick: i, weeksToShow: r = 8 }) { const [c, d] = H.useState(0), { startDate: h, endDate: m, weeks: x } = H.useMemo(() => { const A = new Date, N = A.getDay(), T = N === 0 ? -6 : 1 - N, M = new Date(A); M.setDate(A.getDate() + T + c * 7), M.setHours(0, 0, 0, 0); const G = new Date(M); G.setDate(M.getDate() + r * 7); const V = []; for (let X = 0; X < r; X++) {
    const ee = new Date(M);
    ee.setDate(M.getDate() + X * 7), V.push({ start: ee, label: vu(ee), weekNum: TN(ee) });
} return { startDate: M, endDate: G, weeks: V }; }, [c, r]), g = H.useMemo(() => { const A = new Date, N = h.getTime(), T = m.getTime(), M = A.getTime(); return M < N || M > T ? null : (M - N) / (T - N) * 100; }, [h, m]), y = H.useMemo(() => [...l].sort((A, N) => { const T = A.createdAt ? new Date(A.createdAt).getTime() : 0, M = N.createdAt ? new Date(N.createdAt).getTime() : 0; return T - M; }), [l]), v = () => d(c - r), b = () => d(c + r), D = () => d(0); return a.jsxs("div", { className: "gantt-container", children: [a.jsxs("div", { className: "gantt-nav", children: [a.jsxs("div", { className: "gantt-nav-buttons", children: [a.jsx("button", { onClick: v, className: "gantt-nav-btn", children: a.jsx(Gx, { className: "h-4 w-4" }) }), a.jsxs("button", { onClick: D, className: "gantt-nav-btn today", children: [a.jsx(Da, { className: "h-4 w-4" }), "Hoy"] }), a.jsx("button", { onClick: b, className: "gantt-nav-btn", children: a.jsx($u, { className: "h-4 w-4" }) })] }), a.jsxs("div", { className: "gantt-date-range", children: [vu(h), " - ", vu(m)] })] }), a.jsxs("div", { className: "gantt-header", children: [a.jsx("div", { className: "gantt-header-info", children: "Tarea" }), a.jsx("div", { className: "gantt-header-timeline", children: x.map((A, N) => a.jsxs("div", { className: "gantt-week-column", style: { width: `${100 / r}%` }, children: [a.jsx("div", { className: "gantt-week-label", children: A.label }), a.jsxs("div", { className: "gantt-week-number", children: ["S", A.weekNum] })] }, N)) })] }), a.jsxs("div", { className: "gantt-body", children: [g !== null && a.jsx("div", { className: "gantt-today-marker", style: { left: `calc(200px + ${g}% * (100% - 200px) / 100)` }, children: a.jsx("div", { className: "gantt-today-label", children: "Hoy" }) }), a.jsx("div", { className: "gantt-grid", children: x.map((A, N) => a.jsx("div", { className: "gantt-grid-line", style: { left: `calc(200px + ${N / r * 100}% * (100% - 200px) / 100)` } }, N)) }), y.length > 0 ? y.map(A => a.jsx(CN, { task: A, startDate: h, endDate: m, onClick: () => i == null ? void 0 : i(A) }, A.id)) : a.jsxs("div", { className: "gantt-empty", children: [a.jsx(Da, { className: "h-12 w-12 text-muted-foreground/50" }), a.jsx("p", { children: "No hay tareas para mostrar en el Gantt" })] })] }), a.jsxs("div", { className: "gantt-legend", children: [a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color pending" }), a.jsx("span", { children: "Pendiente" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color in_progress" }), a.jsx("span", { children: "En Progreso" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color review" }), a.jsx("span", { children: "En Revision" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color completed" }), a.jsx("span", { children: "Completada" })] }), a.jsxs("div", { className: "gantt-legend-item", children: [a.jsx("div", { className: "gantt-legend-color blocked" }), a.jsx("span", { children: "Bloqueada" })] })] })] }); }
const ju = [{ id: "pending", label: "Pendiente", color: "border-t-yellow-500", icon: Ie }, { id: "in_progress", label: "En Progreso", color: "border-t-blue-500", icon: ot }, { id: "review", label: "Revision", color: "border-t-purple-500", icon: qr }, { id: "completed", label: "Completado", color: "border-t-green-500", icon: ct }, { id: "blocked", label: "Bloqueado", color: "border-t-red-500", icon: wt }];
function MN({ column: l, tasks: i, onTaskClick: r }) { const c = l.icon; return a.jsxs("div", { className: "kanban-column", children: [a.jsxs("div", { className: Z("kanban-column-header", l.color), children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx(c, { className: Z("h-4 w-4", l.id === "in_progress" && "animate-spin") }), a.jsx("h3", { className: "font-medium", children: l.label })] }), a.jsx("span", { className: "kanban-column-count", children: i.length })] }), a.jsxs("div", { className: "kanban-column-body", children: [i.map(d => a.jsx(NN, { task: d, onClick: () => r(d), compact: !0 }, d.id)), i.length === 0 && a.jsx("div", { className: "kanban-empty", children: a.jsx("span", { children: "Sin tareas" }) })] })] }); }
function _N({ tasks: l, onTaskClick: i }) { return a.jsx("div", { className: "list-table-container", children: a.jsxs("table", { className: "list-table", children: [a.jsx("thead", { children: a.jsxs("tr", { children: [a.jsx("th", { children: "Tarea" }), a.jsx("th", { children: "Proyecto" }), a.jsx("th", { children: "Estado" }), a.jsx("th", { children: "Prioridad" }), a.jsx("th", { children: "Progreso" }), a.jsx("th", { children: "Subtareas" }), a.jsx("th", { children: "Actualizado" })] }) }), a.jsx("tbody", { children: l.map(r => a.jsxs("tr", { onClick: () => i(r), className: "cursor-pointer", children: [a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: r.taskCode || `#${r.taskNumber}` }), a.jsx("span", { className: "font-medium", children: r.title })] }) }), a.jsx("td", { className: "text-muted-foreground", children: r.projectCode || r.projectName }), a.jsx("td", { children: a.jsx("span", { className: Z("status-badge", yg(r.status)), children: r.status.replace("_", " ") }) }), a.jsx("td", { children: a.jsx("span", { className: Z("priority-badge", m2(r.priority)), children: r.priority }) }), a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "h-1.5 w-16 rounded-full bg-muted", children: a.jsx("div", { className: "h-full rounded-full bg-primary", style: { width: `${r.progress}%` } }) }), a.jsxs("span", { className: "text-xs", children: [r.progress, "%"] })] }) }), a.jsx("td", { className: "text-center", children: a.jsxs("span", { className: "text-sm", children: [r.itemsCompleted || 0, "/", r.itemsTotal || 0] }) }), a.jsx("td", { className: "text-muted-foreground", children: it(r.updatedAt) })] }, r.id)) })] }) }); }
function ON() { const l = oa(), [i, r] = H.useState("kanban"), [c, d] = H.useState(""), [h, m] = H.useState(""), [x, g] = H.useState(""), [y, v] = H.useState(null), { data: b, isLoading: D } = vg(), { data: A } = sd(), N = b == null ? void 0 : b.filter(U => { var et, Me; const Y = U.title.toLowerCase().includes(c.toLowerCase()) || ((et = U.taskCode) == null ? void 0 : et.toLowerCase().includes(c.toLowerCase())) || ((Me = U.description) == null ? void 0 : Me.toLowerCase().includes(c.toLowerCase())), we = !h || U.projectId.toString() === h, ft = !x || U.status === x; return Y && we && ft; }), T = ju.reduce((U, Y) => (U[Y.id] = (N == null ? void 0 : N.filter(we => we.status === Y.id)) || [], U), {}), M = H.useCallback(U => { v(U.id); }, []), G = H.useCallback(() => { v(null); }, []), V = H.useCallback(U => { l(`/projects/${U}`); }, [l]), X = (b == null ? void 0 : b.length) || 0, ee = (b == null ? void 0 : b.filter(U => U.status === "completed").length) || 0, re = (b == null ? void 0 : b.filter(U => U.status === "in_progress").length) || 0, I = (b == null ? void 0 : b.filter(U => U.status === "blocked").length) || 0; return D ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(ot, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Tareas" }), a.jsxs("p", { className: "section-subtitle", children: [X, " tareas • ", ee, " completadas • ", re, " en progreso", I > 0 && a.jsxs("span", { className: "text-red-500", children: [" • ", I, " bloqueadas"] })] })] }), a.jsx("div", { className: "section-actions", children: a.jsxs("button", { className: "btn-primary", children: [a.jsx(qt, { className: "h-4 w-4" }), "Nueva Tarea"] }) })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon tasks", children: a.jsx(ct, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Total Tareas" }), a.jsx("div", { className: "stat-value", children: X })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(ct, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Completadas" }), a.jsx("div", { className: "stat-value", children: ee })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon active", children: a.jsx(ot, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "En Progreso" }), a.jsx("div", { className: "stat-value", children: re })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon", style: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }, children: a.jsx(wt, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Bloqueadas" }), a.jsx("div", { className: "stat-value", children: I })] })] })] }), a.jsxs("div", { className: "filters-row", children: [a.jsxs("div", { className: "filter-search", children: [a.jsx(qr, { className: "filter-search-icon" }), a.jsx("input", { type: "text", placeholder: "Buscar tareas...", value: c, onChange: U => d(U.target.value), className: "filter-search-input" })] }), a.jsxs("div", { className: "filter-selects", children: [a.jsxs("div", { className: "filter-select-wrapper", children: [a.jsx(lj, { className: "h-4 w-4 text-muted-foreground" }), a.jsxs("select", { value: h, onChange: U => m(U.target.value), className: "filter-select", children: [a.jsx("option", { value: "", children: "Todos los proyectos" }), A == null ? void 0 : A.map(U => a.jsxs("option", { value: U.id, children: [U.code, " - ", U.name] }, U.id))] })] }), a.jsxs("select", { value: x, onChange: U => g(U.target.value), className: "filter-select", children: [a.jsx("option", { value: "", children: "Todos los estados" }), ju.map(U => a.jsx("option", { value: U.id, children: U.label }, U.id))] })] }), a.jsxs("div", { className: "view-toggle", children: [a.jsx("button", { onClick: () => r("kanban"), className: Z("view-toggle-btn", i === "kanban" && "active"), title: "Vista Kanban", children: a.jsx(qn, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => r("list"), className: Z("view-toggle-btn", i === "list" && "active"), title: "Vista Lista", children: a.jsx(Bn, { className: "h-4 w-4" }) }), a.jsx("button", { onClick: () => r("gantt"), className: Z("view-toggle-btn", i === "gantt" && "active"), title: "Vista Gantt", children: a.jsx(Pu, { className: "h-4 w-4" }) })] })] }), i === "kanban" && a.jsx("div", { className: "kanban-container", children: ju.map(U => a.jsx(MN, { column: U, tasks: T[U.id], onTaskClick: M }, U.id)) }), i === "list" && a.jsx(_N, { tasks: N || [], onTaskClick: M }), i === "gantt" && a.jsx(EN, { tasks: N || [], onTaskClick: M }), a.jsx(AN, { taskId: y, isOpen: y !== null, onClose: G, onNavigateToProject: V })] }); }
const $p = { active: { label: "Activo", icon: _n }, busy: { label: "Ocupado", icon: Ie }, inactive: { label: "Inactivo", icon: wt }, error: { label: "Error", icon: wt }, maintenance: { label: "Mantenimiento", icon: Iu } };
function zN({ agent: l }) { const i = $p[l.status] || $p.inactive, r = i.icon; return a.jsxs("div", { className: "rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors", children: [a.jsxs("div", { className: "flex items-start gap-4", children: [a.jsxs("div", { className: "relative", children: [a.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10", children: l.avatar ? a.jsx("img", { src: l.avatar, alt: l.name, className: "h-16 w-16 rounded-full object-cover" }) : a.jsx(Dr, { className: "h-8 w-8 text-primary" }) }), a.jsx("span", { className: Z("absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card", yg(l.status)) })] }), a.jsxs("div", { className: "flex-1", children: [a.jsx("h3", { className: "font-semibold text-lg", children: l.name }), a.jsx("p", { className: "text-sm text-muted-foreground", children: l.role }), a.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [a.jsx(r, { className: "h-3.5 w-3.5" }), a.jsx("span", { className: "text-sm capitalize", children: i.label })] })] })] }), l.currentTask && a.jsxs("div", { className: "mt-4 rounded-lg bg-muted/50 p-3", children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Tarea actual" }), a.jsx("p", { className: "text-sm font-medium", children: l.currentTask })] }), l.description && a.jsx("p", { className: "mt-4 text-sm text-muted-foreground line-clamp-2", children: l.description }), a.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4", children: [a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-2xl font-bold text-green-500", children: l.tasksCompleted || 0 }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Completadas" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-2xl font-bold text-blue-500", children: l.tasksInProgress || 0 }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "En progreso" })] }), a.jsxs("div", { className: "text-center", children: [a.jsx("p", { className: "text-2xl font-bold", children: l.avgTaskTime ? `${l.avgTaskTime.toFixed(1)}h` : "-" }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Tiempo prom." })] })] }), a.jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground", children: [a.jsxs("span", { children: ["Última actividad: ", l.lastActivity ? it(l.lastActivity) : "Nunca"] }), l.lastHeartbeat && a.jsxs("span", { className: "flex items-center gap-1", children: [a.jsx(_n, { className: "h-3 w-3" }), it(l.lastHeartbeat)] })] })] }); }
function DN({ agents: l }) { const i = l.filter(h => h.status === "active").length, r = l.filter(h => h.status === "busy").length, c = l.filter(h => h.status === "inactive").length, d = l.filter(h => h.status === "error").length; return a.jsxs("div", { className: "grid gap-4 sm:grid-cols-4", children: [a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-green-500/10 p-2", children: a.jsx(_n, { className: "h-5 w-5 text-green-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: i }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Activos" })] })] }) }), a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-blue-500/10 p-2", children: a.jsx(Ie, { className: "h-5 w-5 text-blue-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: r }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Ocupados" })] })] }) }), a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-gray-500/10 p-2", children: a.jsx(ct, { className: "h-5 w-5 text-gray-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: c }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Inactivos" })] })] }) }), a.jsx("div", { className: "rounded-xl border border-border bg-card p-4", children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "rounded-lg bg-red-500/10 p-2", children: a.jsx(wt, { className: "h-5 w-5 text-red-500" }) }), a.jsxs("div", { children: [a.jsx("p", { className: "text-2xl font-bold", children: d }), a.jsx("p", { className: "text-xs text-muted-foreground", children: "Con errores" })] })] }) })] }); }
function RN() { const { data: l, isLoading: i } = jg(); return i ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx("div", { className: "text-muted-foreground", children: "Cargando agentes..." }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "text-2xl font-bold", children: "Agentes IA" }), a.jsxs("p", { className: "text-muted-foreground", children: [(l == null ? void 0 : l.length) || 0, " agentes configurados"] })] }), a.jsx(DN, { agents: l || [] }), a.jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: l && l.length > 0 ? l.map(r => a.jsx(zN, { agent: r }, r.id)) : a.jsx("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: "No hay agentes configurados" }) })] }); }
const Nu = [{ id: 1, name: "Akademate Platform", description: "Plataforma SaaS para academias con 12 tenants activos pagando suscripcion", icon: "graduation-cap", status: "active", metrics: { mrr: 48e3, arr: 576e3, clients: 12, churn: 2.5, growth: 15, ticketPromedio: 4e3 }, billing: { nextInvoice: "2024-02-01", pendingAmount: 12e3 } }, { id: 2, name: "Inscouter", description: "Plataforma de scouting deportivo con suscripciones activas", icon: "search", status: "growing", metrics: { mrr: 25e3, arr: 3e5, clients: 8, churn: 1.5, growth: 25, ticketPromedio: 3125 } }, { id: 3, name: "NazcaTrade", description: "Sistema de trading algoritmico con licencias enterprise", icon: "chart", status: "active", metrics: { mrr: 85e3, arr: 102e4, clients: 5, churn: 0, growth: 8, ticketPromedio: 17e3 } }, { id: 4, name: "SOLARIA Agency", description: "Servicios de consultoria y desarrollo web", icon: "building", status: "active", metrics: { mrr: 35e3, arr: 42e4, clients: 15, churn: 5, growth: 12, ticketPromedio: 2333 } }], wg = { "graduation-cap": a.jsx(Wu, { className: "h-6 w-6" }), search: a.jsx(qr, { className: "h-6 w-6" }), chart: a.jsx(W1, { className: "h-6 w-6" }), building: a.jsx(F1, { className: "h-6 w-6" }) };
function wr(l) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(l); }
function qN({ metrics: l }) { const i = l || { mrr: 0, arr: 0, clients: 0, churn: 0, growth: 0 }; return a.jsxs("div", { className: "metrics-row", children: [a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "MRR" }), a.jsx("div", { className: "metric-value", children: wr(i.mrr) }), a.jsxs("span", { className: `metric-change ${i.growth > 0 ? "positive" : "negative"}`, children: [i.growth > 0 ? a.jsx(mr, { className: "h-3 w-3" }) : a.jsx(Qx, { className: "h-3 w-3" }), Math.abs(i.growth), "%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "ARR" }), a.jsx("div", { className: "metric-value", children: wr(i.arr) })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Clientes" }), a.jsx("div", { className: "metric-value", children: i.clients })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Churn" }), a.jsxs("div", { className: "metric-value", children: [i.churn, "%"] }), a.jsx("span", { className: `metric-change ${i.churn <= 2 ? "positive" : "negative"}`, children: i.churn <= 2 ? "Saludable" : "Atención" })] })] }); }
function BN({ business: l, onClick: i }) { return a.jsxs("div", { onClick: i, className: "bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary transition-all hover:-translate-y-1", children: [a.jsxs("div", { className: "flex items-start justify-between mb-4", children: [a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary", children: wg[l.icon] || a.jsx(Fu, { className: "h-6 w-6" }) }), a.jsxs("div", { children: [a.jsx("h3", { className: "font-semibold text-base", children: l.name }), a.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: l.description })] })] }), a.jsx("span", { className: `business-status ${l.status}`, children: l.status === "active" ? "Activo" : l.status === "growing" ? "Creciendo" : "Pausado" })] }), a.jsx(qN, { metrics: l.metrics })] }); }
function Wp() { const { businessId: l } = Sr(), i = oa(), r = _s(A => A.token), [c, d] = H.useState([]), [h, m] = H.useState(!0), [x, g] = H.useState("grid"); H.useEffect(() => { async function A() { try {
    const N = await fetch("/api/businesses", { headers: { Authorization: `Bearer ${r}` } });
    if (N.ok) {
        const T = await N.json();
        d(T.businesses || Nu);
    }
    else
        d(Nu);
}
catch {
    d(Nu);
}
finally {
    m(!1);
} } A(); }, [r]); const y = c.reduce((A, N) => { var T; return A + (((T = N.metrics) == null ? void 0 : T.mrr) || 0); }, 0), v = c.reduce((A, N) => { var T; return A + (((T = N.metrics) == null ? void 0 : T.clients) || 0); }, 0), b = c.length ? Math.round(c.reduce((A, N) => { var T; return A + (((T = N.metrics) == null ? void 0 : T.growth) || 0); }, 0) / c.length) : 0, D = c.filter(A => A.status === "active").length; return h ? a.jsx("div", { className: "flex items-center justify-center h-96", children: a.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Negocios" }), a.jsxs("p", { className: "section-subtitle", children: [c.length, " negocios operativos"] })] }), a.jsxs("div", { className: "section-actions", children: [a.jsx("button", { onClick: () => g("grid"), className: `p-2 rounded-lg transition-colors ${x === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: a.jsx(qn, { className: "h-5 w-5" }) }), a.jsx("button", { onClick: () => g("list"), className: `p-2 rounded-lg transition-colors ${x === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: a.jsx(Bn, { className: "h-5 w-5" }) })] })] }), a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon orange", children: a.jsx(Yx, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "MRR Total" }), a.jsx("div", { className: "stat-value", children: wr(y) })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(ng, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Clientes Totales" }), a.jsx("div", { className: "stat-value", children: v })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Br, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Crecimiento Prom" }), a.jsxs("div", { className: "stat-value", children: [b, "%"] })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(tj, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Negocios Activos" }), a.jsx("div", { className: "stat-value", children: D })] })] })] }), x === "grid" ? a.jsx("div", { className: "grid grid-cols-2 gap-4", children: c.map(A => a.jsx(BN, { business: A, onClick: () => i(`/businesses/${A.id}`) }, A.id)) }) : a.jsx("div", { className: "space-y-3", children: c.map(A => { var N; return a.jsxs("div", { onClick: () => i(`/businesses/${A.id}`), className: "flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary transition-all", children: [a.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary", children: wg[A.icon] || a.jsx(Fu, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("h3", { className: "font-semibold", children: A.name }), a.jsx("p", { className: "text-xs text-muted-foreground", children: A.description })] }), a.jsxs("div", { className: "text-right", children: [a.jsx("div", { className: "font-bold text-primary", children: wr(((N = A.metrics) == null ? void 0 : N.mrr) || 0) }), a.jsx("div", { className: "text-xs text-muted-foreground", children: "MRR" })] }), a.jsx("span", { className: `business-status ${A.status}`, children: A.status === "active" ? "Activo" : A.status === "growing" ? "Creciendo" : "Pausado" })] }, A.id); }) })] }); }
const UN = { vps: [{ id: 1, name: "SOLARIA Production", provider: "Hetzner", ip: "46.62.222.138", specs: "4 vCPU, 8GB RAM, 160GB SSD", status: "online", services: ["Apache", "PHP 8.4", "MariaDB", "Node.js"] }, { id: 2, name: "NEMESIS Server", provider: "Hostinger", ip: "148.230.118.124", specs: "2 vCPU, 4GB RAM, 100GB SSD", status: "online", services: ["Docker", "PM2", "Redis"] }], nemesis: [{ id: 1, name: "origin-command01", ip: "100.122.193.83", type: "macOS", status: "active" }, { id: 2, name: "Mac-Mini-DRAKE", ip: "100.79.246.5", type: "macOS (M2)", status: "active" }, { id: 3, name: "DRAKE-COMMAND01", ip: "100.64.226.80", type: "Linux", status: "active" }, { id: 4, name: "iPad-Drake-Command", ip: "100.87.12.24", type: "iOS", status: "active" }, { id: 5, name: "iPhone-400i", ip: "100.112.92.21", type: "iOS", status: "active" }], cloudflare: [{ id: 1, domain: "solaria.agency", status: "active", ssl: !0 }, { id: 2, domain: "dfo.solaria.agency", status: "active", ssl: !0 }, { id: 3, domain: "akademate.com", status: "active", ssl: !0 }], sshKeys: [{ id: 1, name: "nemesis_cmdr_key", type: "Ed25519", fingerprint: "SHA256:Gx7..." }, { id: 2, name: "id_ed25519", type: "Ed25519", fingerprint: "SHA256:Hy8..." }, { id: 3, name: "id_solaria_hetzner_prod", type: "Ed25519", fingerprint: "SHA256:Kz9..." }], databases: [{ id: 1, name: "solaria_construction", type: "MariaDB", size: "156 MB" }, { id: 2, name: "akademate_prod", type: "PostgreSQL", size: "2.4 GB" }, { id: 3, name: "cache_redis", type: "Redis", size: "128 MB" }] };
function Ip({ status: l }) { const i = { online: { color: "text-green-400 bg-green-400/20", icon: xr, label: "Online" }, active: { color: "text-green-400 bg-green-400/20", icon: xr, label: "Activo" }, offline: { color: "text-red-400 bg-red-400/20", icon: zp, label: "Offline" }, inactive: { color: "text-gray-400 bg-gray-400/20", icon: zp, label: "Inactivo" }, maintenance: { color: "text-yellow-400 bg-yellow-400/20", icon: Ie, label: "Mantenimiento" }, pending: { color: "text-yellow-400 bg-yellow-400/20", icon: Ie, label: "Pendiente" } }, { color: r, icon: c, label: d } = i[l]; return a.jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r}`, children: [a.jsx(c, { className: "h-3 w-3" }), d] }); }
function LN({ text: l }) { const [i, r] = H.useState(!1), c = () => { navigator.clipboard.writeText(l), r(!0), setTimeout(() => r(!1), 2e3); }; return a.jsx("button", { onClick: c, className: "p-1.5 rounded hover:bg-accent transition-colors", title: "Copiar", children: i ? a.jsx(xr, { className: "h-4 w-4 text-green-400" }) : a.jsx(Tn, { className: "h-4 w-4 text-muted-foreground" }) }); }
function HN() { const { vps: l, nemesis: i, cloudflare: r, sshKeys: c, databases: d } = UN, h = l.length, m = l.filter(y => y.status === "online").length, x = i.filter(y => y.status === "active").length, g = r.filter(y => y.status === "active").length; return a.jsxs("div", { className: "space-y-6", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Infraestructura" }), a.jsx("p", { className: "section-subtitle", children: "VPS, SSH, Cloudflare y accesos de gestion" })] }) }), a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(Ru, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "VPS Online" }), a.jsxs("div", { className: "stat-value", children: [m, "/", h] })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(Up, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "NEMESIS Activos" }), a.jsx("div", { className: "stat-value", children: x })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Dp, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Dominios CF" }), a.jsx("div", { className: "stat-value", children: g })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon orange", children: a.jsx(qp, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Claves SSH" }), a.jsx("div", { className: "stat-value", children: c.length })] })] })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Ru, { className: "h-4 w-4 text-green-400" }), "SERVIDORES VPS"] }), a.jsx("div", { className: "space-y-4", children: l.map(y => a.jsxs("div", { className: "bg-accent/30 rounded-lg p-4", children: [a.jsxs("div", { className: "flex items-start justify-between mb-3", children: [a.jsxs("div", { children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("h4", { className: "font-medium", children: y.name }), a.jsx("span", { className: "text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded", children: y.provider })] }), a.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: y.specs })] }), a.jsx(Ip, { status: y.status })] }), a.jsxs("div", { className: "flex items-center justify-between", children: [a.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [a.jsx(Fx, { className: "h-4 w-4 text-muted-foreground" }), a.jsx("code", { className: "font-mono text-primary", children: y.ip }), a.jsx(LN, { text: `ssh root@${y.ip}` })] }), a.jsx("div", { className: "flex gap-1.5", children: y.services.map(v => a.jsx("span", { className: "project-tag blue", children: v }, v)) })] })] }, y.id)) })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Up, { className: "h-4 w-4 text-purple-400" }), "RED NEMESIS (Tailscale VPN)"] }), a.jsx("div", { className: "grid grid-cols-5 gap-3", children: i.map(y => a.jsxs("div", { className: "bg-accent/30 rounded-lg p-3 text-center", children: [a.jsx("div", { className: `w-2 h-2 rounded-full mx-auto mb-2 ${y.status === "active" ? "bg-green-400" : "bg-gray-400"}` }), a.jsx("div", { className: "text-xs font-medium truncate", title: y.name, children: y.name }), a.jsx("div", { className: "text-[10px] text-muted-foreground", children: y.type }), a.jsx("code", { className: "text-[10px] text-primary font-mono", children: y.ip })] }, y.id)) })] }), a.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Dp, { className: "h-4 w-4 text-blue-400" }), "CLOUDFLARE DOMINIOS"] }), a.jsx("div", { className: "space-y-2", children: r.map(y => a.jsxs("div", { className: "flex items-center justify-between p-2 bg-accent/30 rounded-lg", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [y.ssl && a.jsx(gj, { className: "h-4 w-4 text-green-400" }), a.jsx("span", { className: "text-sm font-mono", children: y.domain })] }), a.jsx(Ip, { status: y.status })] }, y.id)) })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(qp, { className: "h-4 w-4 text-yellow-400" }), "CLAVES SSH"] }), a.jsx("div", { className: "space-y-2", children: c.map(y => a.jsxs("div", { className: "flex items-center justify-between p-2 bg-accent/30 rounded-lg", children: [a.jsxs("div", { children: [a.jsx("div", { className: "text-sm font-medium", children: y.name }), a.jsx("div", { className: "text-[10px] text-muted-foreground", children: y.fingerprint })] }), a.jsx("span", { className: "project-tag green", children: y.type })] }, y.id)) })] })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(aj, { className: "h-4 w-4 text-cyan-400" }), "BASES DE DATOS"] }), a.jsx("div", { className: "metrics-row", children: d.map(y => a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: y.type }), a.jsx("div", { className: "metric-value text-base", children: y.name }), a.jsx("span", { className: "metric-change neutral", children: y.size })] }, y.id)) })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [a.jsx(Nj, { className: "h-4 w-4 text-green-400" }), "COMANDOS RAPIDOS"] }), a.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("ssh root@46.62.222.138"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "SSH SOLARIA"] }), a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("ssh root@148.230.118.124"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "SSH NEMESIS"] }), a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("tailscale status"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "Tailscale Status"] }), a.jsxs("button", { onClick: () => { navigator.clipboard.writeText("pm2 status"), alert("Copiado!"); }, className: "btn-secondary text-sm", children: [a.jsx(Tn, { className: "h-4 w-4" }), "PM2 Status"] })] })] })] }); }
function Dt({ title: l, icon: i, children: r }) { return a.jsxs("div", { className: "mb-8", children: [a.jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [a.jsx(i, { className: "h-5 w-5 text-primary" }), l] }), r] }); }
function Rt({ title: l, children: i }) { return a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [l && a.jsx("h3", { className: "text-sm font-medium mb-4 text-muted-foreground", children: l }), i] }); }
function VN() { return a.jsxs("div", { className: "space-y-6 pb-8", children: [a.jsx("div", { className: "section-header", children: a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Design Hub" }), a.jsx("p", { className: "section-subtitle", children: "Componentes UI, tipografias y elementos graficos" })] }) }), a.jsxs("div", { className: "space-y-8 overflow-y-auto pr-2", children: [a.jsx(Dt, { title: "Brand Identity", icon: vj, children: a.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [a.jsx(Rt, { title: "Logo", children: a.jsx("div", { className: "text-center p-5 bg-accent rounded-lg", children: a.jsx("img", { src: "/solaria-logo.png", alt: "SOLARIA Logo", className: "w-20 h-20 mx-auto", onError: l => { l.currentTarget.style.display = "none"; } }) }) }), a.jsx(Rt, { title: "Brand Colors", children: a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f6921d]", title: "SOLARIA Orange" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#d97706]", title: "Orange Dark" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#0a0a0a]", title: "Background" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#141414]", title: "Secondary BG" })] }) }), a.jsx(Rt, { title: "Phase Colors", children: a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#a855f7]", title: "Planning" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#22d3ee]", title: "Development" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#14b8a6]", title: "Testing" }), a.jsx("div", { className: "w-12 h-12 rounded-lg bg-[#22c55e]", title: "Production" })] }) })] }) }), a.jsx(Dt, { title: "Typography", icon: wj, children: a.jsxs(Rt, { children: [a.jsxs("div", { className: "mb-4", children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase", children: "Font Family" }), a.jsx("div", { className: "text-2xl font-semibold", children: "Inter" })] }), a.jsxs("div", { className: "space-y-3", children: [a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-3xl font-bold", children: "Heading H1" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "32px / 700" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-2xl font-semibold", children: "Heading H2" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "24px / 600" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-lg font-semibold", children: "Heading H3" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "18px / 600" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-sm font-medium", children: "Body Text" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "14px / 500" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-xs text-muted-foreground", children: "Small / Muted" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "12px / 400" })] }), a.jsxs("div", { className: "flex items-baseline gap-4", children: [a.jsx("span", { className: "text-[10px] uppercase font-semibold tracking-wide", children: "LABEL UPPERCASE" }), a.jsx("span", { className: "text-xs text-muted-foreground", children: "10px / 600 / Uppercase" })] })] })] }) }), a.jsx(Dt, { title: "Tags / Badges", icon: ag, children: a.jsxs(Rt, { children: [a.jsxs("div", { className: "mb-4", children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Project Tags (3 Categories)" }), a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("span", { className: "project-tag blue", children: "SaaS" }), a.jsx("span", { className: "project-tag blue", children: "Platform" }), a.jsx("span", { className: "project-tag green", children: "React" }), a.jsx("span", { className: "project-tag green", children: "Node.js" }), a.jsx("span", { className: "project-tag purple", children: "Enterprise" }), a.jsx("span", { className: "project-tag purple", children: "B2B" })] })] }), a.jsxs("div", { children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Phase Badges" }), a.jsxs("div", { className: "flex gap-2 flex-wrap", children: [a.jsx("span", { className: "progress-phase-badge planning", children: "Planificacion" }), a.jsx("span", { className: "progress-phase-badge development", children: "Desarrollo" }), a.jsx("span", { className: "progress-phase-badge testing", children: "Testing" }), a.jsx("span", { className: "progress-phase-badge production", children: "Produccion" })] })] })] }) }), a.jsx(Dt, { title: "Progress Bars", icon: I1, children: a.jsxs(Rt, { children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-3", children: "Segmented Phase Progress" }), a.jsxs("div", { className: "progress-segments mb-2", children: [a.jsx("div", { className: "progress-segment planning" }), a.jsx("div", { className: "progress-segment development" }), a.jsx("div", { className: "progress-segment testing" }), a.jsx("div", { className: "progress-segment inactive" })] }), a.jsxs("div", { className: "progress-labels", children: [a.jsx("span", { className: "progress-label-item completed", children: "Planificacion" }), a.jsx("span", { className: "progress-label-item completed", children: "Desarrollo" }), a.jsx("span", { className: "progress-label-item active", children: "Testing" }), a.jsx("span", { className: "progress-label-item", children: "Produccion" })] })] }) }), a.jsx(Dt, { title: "Mini Trello (Equalizer)", icon: sj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "mini-trello max-w-md", children: [a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "BL" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 3 ? "filled" : ""}`, style: i < 3 ? { background: "#64748b", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "3" })] }), a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "TD" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 5 ? "filled" : ""}`, style: i < 5 ? { background: "#f59e0b", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "5" })] }), a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "DO" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 2 ? "filled" : ""}`, style: i < 2 ? { background: "#3b82f6", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "2" })] }), a.jsxs("div", { className: "trello-column", children: [a.jsx("span", { className: "trello-label", children: "DN" }), a.jsx("div", { className: "trello-slots", children: [...Array(8)].map((l, i) => a.jsx("div", { className: `trello-slot ${i < 7 ? "filled" : ""}`, style: i < 7 ? { background: "#22c55e", borderColor: "transparent" } : {} }, i)) }), a.jsx("span", { className: "trello-count", children: "7" })] })] }) }) }), a.jsx(Dt, { title: "Buttons", icon: fj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "flex gap-3 flex-wrap items-center", children: [a.jsx("button", { className: "btn-primary", children: "Primary" }), a.jsx("button", { className: "btn-secondary", children: "Secondary" }), a.jsx("button", { className: "p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors", children: a.jsx(gr, { className: "h-4 w-4" }) }), a.jsxs("button", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors", children: [a.jsx(gr, { className: "h-3 w-3" }), " Editar"] }), a.jsx("button", { className: "w-7 h-7 rounded bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors", children: a.jsx(qt, { className: "h-4 w-4" }) }), a.jsx("button", { className: "px-2 py-1 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors", children: "→ Task" })] }) }) }), a.jsx(Dt, { title: "URL Items", icon: oj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "space-y-2 max-w-xs", children: [a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon prod", children: a.jsx(Fx, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Prod" }), a.jsx("div", { className: "url-item-url", children: "https://example.com" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] }), a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon staging", children: a.jsx(nj, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Staging" }), a.jsx("div", { className: "url-item-url", children: "https://staging.example.com" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] }), a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon local", children: a.jsx(rj, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Local" }), a.jsx("div", { className: "url-item-url", children: "http://localhost:3000" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] }), a.jsxs("a", { href: "#", className: "url-item", onClick: l => l.preventDefault(), children: [a.jsx("div", { className: "url-item-icon repo", children: a.jsx(Rp, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "url-item-text", children: [a.jsx("div", { className: "url-item-label", children: "Repo" }), a.jsx("div", { className: "url-item-url", children: "github.com/user/repo" })] }), a.jsx(ts, { className: "h-3 w-3 text-muted-foreground" })] })] }) }) }), a.jsx(Dt, { title: "TODO Items", icon: yj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "max-w-xs", children: [a.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [a.jsx("input", { type: "text", placeholder: "Escribe una nota...", className: "flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm" }), a.jsx("button", { className: "w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center", children: a.jsx(qt, { className: "h-4 w-4" }) })] }), a.jsxs("div", { className: "space-y-2", children: [a.jsxs("div", { className: "flex items-center gap-2 p-2 bg-accent/50 rounded-lg", children: [a.jsx("div", { className: "w-4 h-4 rounded border-2 border-primary" }), a.jsx("span", { className: "flex-1 text-xs", children: "Revisar diseno del dashboard" }), a.jsx("span", { className: "text-[9px] text-muted-foreground", children: "12 dic" }), a.jsx("button", { className: "text-[10px] px-1.5 py-0.5 bg-accent rounded", children: "→" })] }), a.jsxs("div", { className: "flex items-center gap-2 p-2 bg-accent/50 rounded-lg opacity-60", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-primary flex items-center justify-center", children: a.jsx(Mn, { className: "h-2.5 w-2.5 text-white" }) }), a.jsx("span", { className: "flex-1 text-xs line-through", children: "Aprobar colores del tema" }), a.jsx("span", { className: "text-[9px] text-muted-foreground", children: "08 dic" })] })] })] }) }) }), a.jsx(Dt, { title: "Activity Items", icon: Ie, children: a.jsx(Rt, { children: a.jsxs("div", { className: "space-y-2 max-w-xs", children: [a.jsxs("div", { className: "flex items-start gap-2 p-2 bg-accent/50 rounded-lg", children: [a.jsx("div", { className: "w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0", children: a.jsx(Mn, { className: "h-3 w-3 text-green-400" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("div", { className: "text-xs font-medium", children: "Tarea completada" }), a.jsx("div", { className: "text-[9px] text-muted-foreground", children: "Hace 2h" })] })] }), a.jsxs("div", { className: "flex items-start gap-2 p-2 bg-accent/50 rounded-lg", children: [a.jsx("div", { className: "w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0", children: a.jsx(Rp, { className: "h-3 w-3 text-blue-400" }) }), a.jsxs("div", { className: "flex-1", children: [a.jsx("div", { className: "text-xs font-medium", children: "Nuevo commit" }), a.jsx("div", { className: "text-[9px] text-muted-foreground", children: "Hace 5h" })] })] })] }) }) }), a.jsx(Dt, { title: "Form Elements", icon: mj, children: a.jsx(Rt, { children: a.jsxs("div", { className: "grid grid-cols-2 gap-4 max-w-lg", children: [a.jsxs("div", { children: [a.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Input Label" }), a.jsx("input", { type: "text", defaultValue: "Input value", className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm" })] }), a.jsxs("div", { children: [a.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Select" }), a.jsxs("select", { className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm", children: [a.jsx("option", { children: "Option 1" }), a.jsx("option", { children: "Option 2" })] })] }), a.jsxs("div", { className: "col-span-2", children: [a.jsx("label", { className: "block text-xs text-muted-foreground mb-1.5", children: "Textarea" }), a.jsx("textarea", { defaultValue: "Textarea content", className: "w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none" })] })] }) }) }), a.jsx("div", { className: "p-5 rounded-xl border border-dashed border-primary bg-gradient-to-br from-primary/10 to-transparent", children: a.jsxs(Dt, { title: "METRICS ROW (Core Component)", icon: Br, children: [a.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Componente central del sistema. Los cambios en CSS Variables se aplican automaticamente a todo el dashboard." }), a.jsxs("div", { className: "mb-6", children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "5 Columns - Full Width" }), a.jsxs("div", { className: "metrics-row", children: [a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Seguidores ✓" }), a.jsxs("div", { className: "metric-value", children: ["1K ", a.jsx("span", { className: "secondary", children: "/ 4.2K" })] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Impresiones" }), a.jsx("div", { className: "metric-value", children: "4.9M" }), a.jsxs("span", { className: "metric-change positive", children: [a.jsx(mr, { className: "h-3 w-3" }), " 334%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Engagement" }), a.jsx("div", { className: "metric-value", children: "4.2%" }), a.jsxs("span", { className: "metric-change negative", children: [a.jsx(Qx, { className: "h-3 w-3" }), " 19%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Engagements" }), a.jsx("div", { className: "metric-value", children: "209.2K" }), a.jsxs("span", { className: "metric-change positive", children: [a.jsx(mr, { className: "h-3 w-3" }), " 248%"] })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Profile Visits" }), a.jsx("div", { className: "metric-value", children: "18.2K" }), a.jsxs("span", { className: "metric-change positive", children: [a.jsx(mr, { className: "h-3 w-3" }), " 88%"] })] })] })] }), a.jsxs("div", { children: [a.jsx("span", { className: "text-[10px] text-muted-foreground uppercase block mb-2", children: "Compact Variant (3 Columns)" }), a.jsxs("div", { className: "metrics-row compact max-w-md", children: [a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Tareas" }), a.jsx("div", { className: "metric-value", children: "24" })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Completadas" }), a.jsx("div", { className: "metric-value", children: "18" })] }), a.jsxs("div", { className: "metric-cell", children: [a.jsx("div", { className: "metric-label", children: "Progreso" }), a.jsx("div", { className: "metric-value", children: "75%" })] })] })] })] }) }), a.jsx(Dt, { title: "Stat Cards", icon: _n, children: a.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(bj, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Proyectos Activos" }), a.jsx("div", { className: "stat-value", children: "5" })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon tasks", children: a.jsx(Mn, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Tareas Completadas" }), a.jsx("div", { className: "stat-value", children: "127" })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon active", children: a.jsx(Ie, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "En Progreso" }), a.jsx("div", { className: "stat-value", children: "12" })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(_n, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Agentes Activos" }), a.jsx("div", { className: "stat-value", children: "3" })] })] })] }) }), a.jsx(Dt, { title: "CSS Variables Reference", icon: tg, children: a.jsx(Rt, { children: a.jsxs("div", { className: "grid grid-cols-2 gap-6 text-xs font-mono", children: [a.jsxs("div", { children: [a.jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Colors" }), a.jsxs("div", { className: "space-y-1.5", children: [a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#f6921d]" }), a.jsx("span", { children: "--solaria-orange: #f6921d" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#22c55e]" }), a.jsx("span", { children: "--color-positive: #22c55e" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#ef4444]" }), a.jsx("span", { children: "--color-negative: #ef4444" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#3b82f6]" }), a.jsx("span", { children: "--color-info: #3b82f6" })] }), a.jsxs("div", { className: "flex items-center gap-2", children: [a.jsx("div", { className: "w-4 h-4 rounded bg-[#f59e0b]" }), a.jsx("span", { children: "--color-warning: #f59e0b" })] })] })] }), a.jsxs("div", { children: [a.jsx("h4", { className: "font-semibold mb-2 text-sm", children: "Metrics" }), a.jsxs("div", { className: "space-y-1.5 text-muted-foreground", children: [a.jsx("div", { children: "--metric-card-radius: 12px" }), a.jsx("div", { children: "--metric-card-padding: 16px" }), a.jsx("div", { children: "--metric-label-size: 11px" }), a.jsx("div", { children: "--metric-value-size: 24px" }), a.jsx("div", { children: "--metric-value-weight: 700" })] })] })] }) }) })] })] }); }
const ad = { decision: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }, learning: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }, context: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }, requirement: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }, bug: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }, solution: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" }, pattern: { bg: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }, config: { bg: "rgba(249, 115, 22, 0.15)", color: "#f97316" }, architecture: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }, session: { bg: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" } };
function QN({ memory: l, onClick: i }) { const r = Math.round(l.importance * 100), c = l.tags || []; return a.jsxs("div", { onClick: i, className: "memory-card", children: [a.jsxs("div", { className: "memory-header", children: [a.jsx("div", { className: "memory-icon", children: a.jsx(Rr, { className: "h-4 w-4" }) }), a.jsxs("div", { className: "memory-title-group", children: [a.jsx("h3", { className: "memory-title", children: l.summary || l.content.substring(0, 60) }), a.jsxs("span", { className: "memory-id", children: ["#", l.id] })] }), a.jsxs("div", { className: "memory-importance", children: [a.jsx(Br, { className: "h-3 w-3" }), a.jsxs("span", { children: [r, "%"] })] })] }), a.jsx("p", { className: "memory-content", children: l.content }), c.length > 0 && a.jsx("div", { className: "memory-tags", children: c.map(d => { const h = ad[d] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }; return a.jsx("span", { className: "memory-tag", style: { backgroundColor: h.bg, color: h.color }, children: d }, d); }) }), a.jsxs("div", { className: "memory-stats", children: [a.jsxs("div", { className: "memory-stat", children: [a.jsx(yr, { className: "h-3 w-3" }), a.jsxs("span", { children: [l.accessCount, " accesos"] })] }), l.lastAccessed && a.jsxs("div", { className: "memory-stat", children: [a.jsx(Ie, { className: "h-3 w-3" }), a.jsx("span", { children: it(l.lastAccessed) })] }), a.jsx("div", { className: "memory-stat created", children: it(l.createdAt) })] })] }); }
function GN({ memory: l, onClick: i }) { const r = Math.round(l.importance * 100), c = l.tags || []; return a.jsxs("tr", { onClick: i, className: "memory-row", children: [a.jsx("td", { children: a.jsxs("div", { className: "flex items-center gap-3", children: [a.jsx("div", { className: "memory-icon-sm", children: a.jsx(Rr, { className: "h-4 w-4" }) }), a.jsxs("div", { children: [a.jsx("div", { className: "memory-title-sm", children: l.summary || l.content.substring(0, 50) }), a.jsxs("div", { className: "memory-id-sm", children: ["#", l.id] })] })] }) }), a.jsx("td", { children: a.jsx("div", { className: "flex flex-wrap gap-1", children: c.slice(0, 3).map(d => { const h = ad[d] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }; return a.jsx("span", { className: "memory-tag-sm", style: { backgroundColor: h.bg, color: h.color }, children: d }, d); }) }) }), a.jsx("td", { className: "text-center", children: a.jsxs("span", { className: "stat-value-sm", children: [r, "%"] }) }), a.jsx("td", { className: "text-center", children: a.jsx("span", { className: "stat-value-sm", children: l.accessCount }) }), a.jsx("td", { className: "text-center text-muted-foreground text-sm", children: it(l.createdAt) })] }); }
function KN() { const [l, i] = H.useState(""), [r, c] = H.useState([]), [d, h] = H.useState("grid"), { data: m, isLoading: x } = S2({ tags: r }), { data: g } = C2(), { data: y } = k2(), { data: v } = A2(l, r), b = l.length > 2 ? v : m, D = (b == null ? void 0 : b.length) || 0, A = N => { c(T => T.includes(N) ? T.filter(M => M !== N) : [...T, N]); }; return x ? a.jsx("div", { className: "flex h-full items-center justify-center", children: a.jsx(ot, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : a.jsxs("div", { className: "space-y-6", children: [a.jsxs("div", { className: "section-header", children: [a.jsxs("div", { children: [a.jsx("h1", { className: "section-title", children: "Memorias" }), a.jsx("p", { className: "section-subtitle", children: "Sistema de memoria persistente para agentes IA" })] }), a.jsx("div", { className: "section-actions", children: a.jsxs("div", { className: "view-toggle", children: [a.jsx("button", { className: Z("view-toggle-btn", d === "grid" && "active"), onClick: () => h("grid"), title: "Vista Grid", children: a.jsx(qn, { className: "h-4 w-4" }) }), a.jsx("button", { className: Z("view-toggle-btn", d === "list" && "active"), onClick: () => h("list"), title: "Vista Lista", children: a.jsx(Bn, { className: "h-4 w-4" }) })] }) })] }), a.jsxs("div", { className: "dashboard-stats-row", children: [a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon projects", children: a.jsx(Rr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Total Memorias" }), a.jsx("div", { className: "stat-value", children: xu((g == null ? void 0 : g.total_memories) || 0) })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon green", children: a.jsx(Br, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Importancia Prom." }), a.jsxs("div", { className: "stat-value", children: [(((g == null ? void 0 : g.avg_importance) || 0) * 100).toFixed(0), "%"] })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon active", children: a.jsx(yr, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Accesos Totales" }), a.jsx("div", { className: "stat-value", children: xu((g == null ? void 0 : g.total_accesses) || 0) })] })] }), a.jsxs("div", { className: "stat-card", children: [a.jsx("div", { className: "stat-icon agents", children: a.jsx(Ix, { className: "h-5 w-5" }) }), a.jsxs("div", { className: "stat-content", children: [a.jsx("div", { className: "stat-label", children: "Proyectos" }), a.jsx("div", { className: "stat-value", children: xu((g == null ? void 0 : g.projects_with_memories) || 0) })] })] })] }), a.jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [a.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [a.jsxs("div", { className: "relative flex-1", children: [a.jsx(qr, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), a.jsx("input", { type: "text", placeholder: "Buscar en memorias (min. 3 caracteres)...", value: l, onChange: N => i(N.target.value), className: "w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), a.jsxs("span", { className: "text-sm text-muted-foreground", children: [D, " memorias"] })] }), y && y.length > 0 && a.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [a.jsx(sg, { className: "h-4 w-4 text-muted-foreground" }), y.map(N => { const T = ad[N.name] || { bg: "rgba(100, 116, 139, 0.15)", color: "#64748b" }, M = r.includes(N.name); return a.jsxs("button", { onClick: () => A(N.name), className: Z("memory-tag-filter", M && "selected"), style: M ? { backgroundColor: T.color, color: "#fff" } : { backgroundColor: T.bg, color: T.color }, children: [N.name, " (", N.usageCount, ")"] }, N.name); })] })] }), d === "grid" ? a.jsx("div", { className: "memories-grid", children: b && b.length > 0 ? b.map(N => a.jsx(QN, { memory: N }, N.id)) : a.jsxs("div", { className: "col-span-full py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: l.length > 2 ? "No se encontraron memorias con ese criterio" : "No hay memorias registradas" })] }) }) : a.jsx("div", { className: "bg-card border border-border rounded-xl", style: { padding: 0, overflow: "hidden" }, children: a.jsxs("table", { className: "list-table", children: [a.jsx("thead", { children: a.jsxs("tr", { children: [a.jsx("th", { style: { width: "35%" }, children: "Memoria" }), a.jsx("th", { style: { width: "25%" }, children: "Tags" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Importancia" }), a.jsx("th", { style: { width: "12%", textAlign: "center" }, children: "Accesos" }), a.jsx("th", { style: { width: "16%", textAlign: "center" }, children: "Creada" })] }) }), a.jsx("tbody", { children: b && b.length > 0 ? b.map(N => a.jsx(GN, { memory: N }, N.id)) : a.jsx("tr", { children: a.jsx("td", { colSpan: 5, children: a.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [a.jsx(wt, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), a.jsx("p", { children: l.length > 2 ? "No se encontraron memorias" : "No hay memorias" })] }) }) }) })] }) })] }); }
function YN() { return a.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: a.jsxs("div", { className: "flex flex-col items-center gap-4", children: [a.jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" }), a.jsx("p", { className: "text-muted-foreground", children: "Verificando sesion..." })] }) }); }
function XN({ children: l }) { return _s(r => r.isAuthenticated) ? a.jsx(a.Fragment, { children: l }) : a.jsx(Pp, { to: "/login", replace: !0 }); }
function ZN() { const { isChecking: l } = G1(); return l ? a.jsx(YN, {}) : a.jsxs(eb, { children: [a.jsx(vt, { path: "/login", element: a.jsx(K2, {}) }), a.jsxs(vt, { path: "/", element: a.jsx(XN, { children: a.jsx(G2, {}) }), children: [a.jsx(vt, { index: !0, element: a.jsx(Pp, { to: "/dashboard", replace: !0 }) }), a.jsx(vt, { path: "dashboard", element: a.jsx(J2, {}) }), a.jsx(vt, { path: "projects", element: a.jsx(P2, {}) }), a.jsx(vt, { path: "projects/:id", element: a.jsx(fN, {}) }), a.jsx(vt, { path: "projects/:id/tasks", element: a.jsx(jN, {}) }), a.jsx(vt, { path: "tasks", element: a.jsx(ON, {}) }), a.jsx(vt, { path: "agents", element: a.jsx(RN, {}) }), a.jsx(vt, { path: "businesses", element: a.jsx(Wp, {}) }), a.jsx(vt, { path: "businesses/:businessId", element: a.jsx(Wp, {}) }), a.jsx(vt, { path: "infrastructure", element: a.jsx(HN, {}) }), a.jsx(vt, { path: "design-hub", element: a.jsx(VN, {}) }), a.jsx(vt, { path: "memories", element: a.jsx(KN, {}) })] })] }); }
const JN = new Zy({ defaultOptions: { queries: { staleTime: 1e3 * 60 * 5, refetchOnWindowFocus: !1, retry: 1 } } });
cb.createRoot(document.getElementById("root")).render(a.jsx(kn.StrictMode, { children: a.jsx(Jy, { client: JN, children: a.jsx(ov, { children: a.jsx(tb, { basename: "/v2", children: a.jsx(ZN, {}) }) }) }) }));
//# sourceMappingURL=index-tjnqYQiB.js.map
//# sourceMappingURL=index-tjnqYQiB.js.map