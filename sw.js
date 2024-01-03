var xn = Object.defineProperty;
var Nn = (e, t, r) => t in e ? xn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ae = (e, t, r) => (Nn(e, typeof t != "symbol" ? t + "" : t, r), r);
const me = () => {
  throw new Error("不可调用未填充的依赖");
}, k = {
  // 读写配置文件所依赖的副作用
  setItem: me,
  getItem: me,
  // render功能依赖的副作用
  getNodeByID: me,
  getDocPathBySY: me,
  getDocByChildID: me,
  getHPathByID_Node: me
};
function br(e) {
  return `data/${e.box}${e.path}`;
}
function $n(e, t) {
  const r = new Set(e.split(","));
  return t ? (n) => r.has(n.toLowerCase()) : (n) => r.has(n);
}
const U = {}.NODE_ENV !== "production" ? Object.freeze({}) : {}, ve = () => {
}, Q = Object.assign, Rn = (e, t) => {
  const r = e.indexOf(t);
  r > -1 && e.splice(r, 1);
}, Sn = Object.prototype.hasOwnProperty, x = (e, t) => Sn.call(e, t), P = Array.isArray, ye = (e) => ot(e) === "[object Map]", Tn = (e) => ot(e) === "[object Set]", C = (e) => typeof e == "function", st = (e) => typeof e == "string", it = (e) => typeof e == "symbol", K = (e) => e !== null && typeof e == "object", Pn = (e) => (K(e) || C(e)) && C(e.then) && C(e.catch), Cn = Object.prototype.toString, ot = (e) => Cn.call(e), xr = (e) => ot(e).slice(8, -1), Dn = (e) => ot(e) === "[object Object]", Ct = (e) => st(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, In = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (r) => t[r] || (t[r] = e(r));
}, On = In((e) => e.charAt(0).toUpperCase() + e.slice(1)), pe = (e, t) => !Object.is(e, t), kn = (e, t, r) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    value: r
  });
};
let Jt;
const Nr = () => Jt || (Jt = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Yt(e, ...t) {
  console.warn(`[Vue warn] ${e}`, ...t);
}
let $r;
function Mn(e, t = $r) {
  t && t.active && t.effects.push(e);
}
function Bn() {
  return $r;
}
let le;
class Rr {
  constructor(t, r, n, s) {
    this.fn = t, this.trigger = r, this.scheduler = n, this.active = !0, this.deps = [], this._dirtyLevel = 3, this._trackId = 0, this._runnings = 0, this._queryings = 0, this._depsLength = 0, Mn(this, s);
  }
  get dirty() {
    if (this._dirtyLevel === 1) {
      this._dirtyLevel = 0, this._queryings++, Dt();
      for (const t of this.deps)
        if (t.computed && (An(t.computed), this._dirtyLevel >= 2))
          break;
      It(), this._queryings--;
    }
    return this._dirtyLevel >= 2;
  }
  set dirty(t) {
    this._dirtyLevel = t ? 3 : 0;
  }
  run() {
    if (this._dirtyLevel = 0, !this.active)
      return this.fn();
    let t = ie, r = le;
    try {
      return ie = !0, le = this, this._runnings++, Qt(this), this.fn();
    } finally {
      Xt(this), this._runnings--, le = r, ie = t;
    }
  }
  stop() {
    var t;
    this.active && (Qt(this), Xt(this), (t = this.onStop) == null || t.call(this), this.active = !1);
  }
}
function An(e) {
  return e.value;
}
function Qt(e) {
  e._trackId++, e._depsLength = 0;
}
function Xt(e) {
  if (e.deps && e.deps.length > e._depsLength) {
    for (let t = e._depsLength; t < e.deps.length; t++)
      Sr(e.deps[t], e);
    e.deps.length = e._depsLength;
  }
}
function Sr(e, t) {
  const r = e.get(t);
  r !== void 0 && t._trackId !== r && (e.delete(t), e.size === 0 && e.cleanup());
}
let ie = !0, wt = 0;
const Tr = [];
function Dt() {
  Tr.push(ie), ie = !1;
}
function It() {
  const e = Tr.pop();
  ie = e === void 0 ? !0 : e;
}
function Ot() {
  wt++;
}
function kt() {
  for (wt--; !wt && _t.length; )
    _t.shift()();
}
function Pr(e, t, r) {
  var n;
  if (t.get(e) !== e._trackId) {
    t.set(e, e._trackId);
    const s = e.deps[e._depsLength];
    s !== t ? (s && Sr(s, e), e.deps[e._depsLength++] = t) : e._depsLength++, {}.NODE_ENV !== "production" && ((n = e.onTrack) == null || n.call(e, Q({ effect: e }, r)));
  }
}
const _t = [];
function Cr(e, t, r) {
  var n;
  Ot();
  for (const s of e.keys())
    if (!(!s.allowRecurse && s._runnings) && s._dirtyLevel < t && (!s._runnings || t !== 2)) {
      const i = s._dirtyLevel;
      s._dirtyLevel = t, i === 0 && (!s._queryings || t !== 2) && ({}.NODE_ENV !== "production" && ((n = s.onTrigger) == null || n.call(s, Q({ effect: s }, r))), s.trigger(), s.scheduler && _t.push(s.scheduler));
    }
  kt();
}
const Dr = (e, t) => {
  const r = /* @__PURE__ */ new Map();
  return r.cleanup = e, r.computed = t, r;
}, vt = /* @__PURE__ */ new WeakMap(), ue = Symbol({}.NODE_ENV !== "production" ? "iterate" : ""), yt = Symbol({}.NODE_ENV !== "production" ? "Map key iterate" : "");
function M(e, t, r) {
  if (ie && le) {
    let n = vt.get(e);
    n || vt.set(e, n = /* @__PURE__ */ new Map());
    let s = n.get(r);
    s || n.set(r, s = Dr(() => n.delete(r))), Pr(
      le,
      s,
      {}.NODE_ENV !== "production" ? {
        target: e,
        type: t,
        key: r
      } : void 0
    );
  }
}
function oe(e, t, r, n, s, i) {
  const o = vt.get(e);
  if (!o)
    return;
  let a = [];
  if (t === "clear")
    a = [...o.values()];
  else if (r === "length" && P(e)) {
    const c = Number(n);
    o.forEach((l, d) => {
      (d === "length" || !it(d) && d >= c) && a.push(l);
    });
  } else
    switch (r !== void 0 && a.push(o.get(r)), t) {
      case "add":
        P(e) ? Ct(r) && a.push(o.get("length")) : (a.push(o.get(ue)), ye(e) && a.push(o.get(yt)));
        break;
      case "delete":
        P(e) || (a.push(o.get(ue)), ye(e) && a.push(o.get(yt)));
        break;
      case "set":
        ye(e) && a.push(o.get(ue));
        break;
    }
  Ot();
  for (const c of a)
    c && Cr(
      c,
      3,
      {}.NODE_ENV !== "production" ? {
        target: e,
        type: t,
        key: r,
        newValue: n,
        oldValue: s,
        oldTarget: i
      } : void 0
    );
  kt();
}
const Hn = /* @__PURE__ */ $n("__proto__,__v_isRef,__isVue"), Ir = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(it)
), Zt = /* @__PURE__ */ Ln();
function Ln() {
  const e = {};
  return ["includes", "indexOf", "lastIndexOf"].forEach((t) => {
    e[t] = function(...r) {
      const n = m(this);
      for (let i = 0, o = this.length; i < o; i++)
        M(n, "get", i + "");
      const s = n[t](...r);
      return s === -1 || s === !1 ? n[t](...r.map(m)) : s;
    };
  }), ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
    e[t] = function(...r) {
      Dt(), Ot();
      const n = m(this)[t].apply(this, r);
      return kt(), It(), n;
    };
  }), e;
}
function Vn(e) {
  const t = m(this);
  return M(t, "has", e), t.hasOwnProperty(e);
}
class Or {
  constructor(t = !1, r = !1) {
    this._isReadonly = t, this._shallow = r;
  }
  get(t, r, n) {
    const s = this._isReadonly, i = this._shallow;
    if (r === "__v_isReactive")
      return !s;
    if (r === "__v_isReadonly")
      return s;
    if (r === "__v_isShallow")
      return i;
    if (r === "__v_raw")
      return n === (s ? i ? Hr : Ar : i ? Zn : Br).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const o = P(t);
    if (!s) {
      if (o && x(Zt, r))
        return Reflect.get(Zt, r, n);
      if (r === "hasOwnProperty")
        return Vn;
    }
    const a = Reflect.get(t, r, n);
    return (it(r) ? Ir.has(r) : Hn(r)) || (s || M(t, "get", r), i) ? a : V(a) ? o && Ct(r) ? a : a.value : K(a) ? s ? Lr(a) : At(a) : a;
  }
}
class jn extends Or {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, r, n, s) {
    let i = t[r];
    if (!this._shallow) {
      const c = xe(i);
      if (!Re(n) && !xe(n) && (i = m(i), n = m(n)), !P(t) && V(i) && !V(n))
        return c ? !1 : (i.value = n, !0);
    }
    const o = P(t) && Ct(r) ? Number(r) < t.length : x(t, r), a = Reflect.set(t, r, n, s);
    return t === m(s) && (o ? pe(n, i) && oe(t, "set", r, n, i) : oe(t, "add", r, n)), a;
  }
  deleteProperty(t, r) {
    const n = x(t, r), s = t[r], i = Reflect.deleteProperty(t, r);
    return i && n && oe(t, "delete", r, void 0, s), i;
  }
  has(t, r) {
    const n = Reflect.has(t, r);
    return (!it(r) || !Ir.has(r)) && M(t, "has", r), n;
  }
  ownKeys(t) {
    return M(
      t,
      "iterate",
      P(t) ? "length" : ue
    ), Reflect.ownKeys(t);
  }
}
class kr extends Or {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, r) {
    return {}.NODE_ENV !== "production" && Yt(
      `Set operation on key "${String(r)}" failed: target is readonly.`,
      t
    ), !0;
  }
  deleteProperty(t, r) {
    return {}.NODE_ENV !== "production" && Yt(
      `Delete operation on key "${String(r)}" failed: target is readonly.`,
      t
    ), !0;
  }
}
const Fn = /* @__PURE__ */ new jn(), qn = /* @__PURE__ */ new kr(), Wn = /* @__PURE__ */ new kr(!0), Mt = (e) => e, at = (e) => Reflect.getPrototypeOf(e);
function je(e, t, r = !1, n = !1) {
  e = e.__v_raw;
  const s = m(e), i = m(t);
  r || (pe(t, i) && M(s, "get", t), M(s, "get", i));
  const { has: o } = at(s), a = n ? Mt : r ? Vt : Lt;
  if (o.call(s, t))
    return a(e.get(t));
  if (o.call(s, i))
    return a(e.get(i));
  e !== s && e.get(t);
}
function Fe(e, t = !1) {
  const r = this.__v_raw, n = m(r), s = m(e);
  return t || (pe(e, s) && M(n, "has", e), M(n, "has", s)), e === s ? r.has(e) : r.has(e) || r.has(s);
}
function qe(e, t = !1) {
  return e = e.__v_raw, !t && M(m(e), "iterate", ue), Reflect.get(e, "size", e);
}
function er(e) {
  e = m(e);
  const t = m(this);
  return at(t).has.call(t, e) || (t.add(e), oe(t, "add", e, e)), this;
}
function tr(e, t) {
  t = m(t);
  const r = m(this), { has: n, get: s } = at(r);
  let i = n.call(r, e);
  i ? {}.NODE_ENV !== "production" && Mr(r, n, e) : (e = m(e), i = n.call(r, e));
  const o = s.call(r, e);
  return r.set(e, t), i ? pe(t, o) && oe(r, "set", e, t, o) : oe(r, "add", e, t), this;
}
function rr(e) {
  const t = m(this), { has: r, get: n } = at(t);
  let s = r.call(t, e);
  s ? {}.NODE_ENV !== "production" && Mr(t, r, e) : (e = m(e), s = r.call(t, e));
  const i = n ? n.call(t, e) : void 0, o = t.delete(e);
  return s && oe(t, "delete", e, void 0, i), o;
}
function nr() {
  const e = m(this), t = e.size !== 0, r = {}.NODE_ENV !== "production" ? ye(e) ? new Map(e) : new Set(e) : void 0, n = e.clear();
  return t && oe(e, "clear", void 0, void 0, r), n;
}
function We(e, t) {
  return function(n, s) {
    const i = this, o = i.__v_raw, a = m(o), c = t ? Mt : e ? Vt : Lt;
    return !e && M(a, "iterate", ue), o.forEach((l, d) => n.call(s, c(l), c(d), i));
  };
}
function ze(e, t, r) {
  return function(...n) {
    const s = this.__v_raw, i = m(s), o = ye(i), a = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = s[e](...n), d = r ? Mt : t ? Vt : Lt;
    return !t && M(
      i,
      "iterate",
      c ? yt : ue
    ), {
      // iterator protocol
      next() {
        const { value: u, done: h } = l.next();
        return h ? { value: u, done: h } : {
          value: a ? [d(u[0]), d(u[1])] : d(u),
          done: h
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Z(e) {
  return function(...t) {
    if ({}.NODE_ENV !== "production") {
      const r = t[0] ? `on key "${t[0]}" ` : "";
      console.warn(
        `${On(e)} operation ${r}failed: target is readonly.`,
        m(this)
      );
    }
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function zn() {
  const e = {
    get(i) {
      return je(this, i);
    },
    get size() {
      return qe(this);
    },
    has: Fe,
    add: er,
    set: tr,
    delete: rr,
    clear: nr,
    forEach: We(!1, !1)
  }, t = {
    get(i) {
      return je(this, i, !1, !0);
    },
    get size() {
      return qe(this);
    },
    has: Fe,
    add: er,
    set: tr,
    delete: rr,
    clear: nr,
    forEach: We(!1, !0)
  }, r = {
    get(i) {
      return je(this, i, !0);
    },
    get size() {
      return qe(this, !0);
    },
    has(i) {
      return Fe.call(this, i, !0);
    },
    add: Z("add"),
    set: Z("set"),
    delete: Z("delete"),
    clear: Z("clear"),
    forEach: We(!0, !1)
  }, n = {
    get(i) {
      return je(this, i, !0, !0);
    },
    get size() {
      return qe(this, !0);
    },
    has(i) {
      return Fe.call(this, i, !0);
    },
    add: Z("add"),
    set: Z("set"),
    delete: Z("delete"),
    clear: Z("clear"),
    forEach: We(!0, !0)
  };
  return ["keys", "values", "entries", Symbol.iterator].forEach((i) => {
    e[i] = ze(
      i,
      !1,
      !1
    ), r[i] = ze(
      i,
      !0,
      !1
    ), t[i] = ze(
      i,
      !1,
      !0
    ), n[i] = ze(
      i,
      !0,
      !0
    );
  }), [
    e,
    r,
    t,
    n
  ];
}
const [
  Un,
  Kn,
  Gn,
  Jn
] = /* @__PURE__ */ zn();
function Bt(e, t) {
  const r = t ? e ? Jn : Gn : e ? Kn : Un;
  return (n, s, i) => s === "__v_isReactive" ? !e : s === "__v_isReadonly" ? e : s === "__v_raw" ? n : Reflect.get(
    x(r, s) && s in n ? r : n,
    s,
    i
  );
}
const Yn = {
  get: /* @__PURE__ */ Bt(!1, !1)
}, Qn = {
  get: /* @__PURE__ */ Bt(!0, !1)
}, Xn = {
  get: /* @__PURE__ */ Bt(!0, !0)
};
function Mr(e, t, r) {
  const n = m(r);
  if (n !== r && t.call(e, n)) {
    const s = xr(e);
    console.warn(
      `Reactive ${s} contains both the raw and reactive versions of the same object${s === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const Br = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), Ar = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap();
function es(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function ts(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : es(xr(e));
}
function At(e) {
  return xe(e) ? e : Ht(
    e,
    !1,
    Fn,
    Yn,
    Br
  );
}
function Lr(e) {
  return Ht(
    e,
    !0,
    qn,
    Qn,
    Ar
  );
}
function Ue(e) {
  return Ht(
    e,
    !0,
    Wn,
    Xn,
    Hr
  );
}
function Ht(e, t, r, n, s) {
  if (!K(e))
    return {}.NODE_ENV !== "production" && console.warn(`value cannot be made reactive: ${String(e)}`), e;
  if (e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = s.get(e);
  if (i)
    return i;
  const o = ts(e);
  if (o === 0)
    return e;
  const a = new Proxy(
    e,
    o === 2 ? n : r
  );
  return s.set(e, a), a;
}
function Ee(e) {
  return xe(e) ? Ee(e.__v_raw) : !!(e && e.__v_isReactive);
}
function xe(e) {
  return !!(e && e.__v_isReadonly);
}
function Re(e) {
  return !!(e && e.__v_isShallow);
}
function m(e) {
  const t = e && e.__v_raw;
  return t ? m(t) : e;
}
function rs(e) {
  return kn(e, "__v_skip", !0), e;
}
const Lt = (e) => K(e) ? At(e) : e, Vt = (e) => K(e) ? Lr(e) : e;
class Vr {
  constructor(t, r, n, s) {
    this._setter = r, this.dep = void 0, this.__v_isRef = !0, this.__v_isReadonly = !1, this.effect = new Rr(
      () => t(this._value),
      () => Et(this, 1)
    ), this.effect.computed = this, this.effect.active = this._cacheable = !s, this.__v_isReadonly = n;
  }
  get value() {
    const t = m(this);
    return jr(t), (!t._cacheable || t.effect.dirty) && pe(t._value, t._value = t.effect.run()) && Et(t, 2), t._value;
  }
  set value(t) {
    this._setter(t);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(t) {
    this.effect.dirty = t;
  }
  // #endregion
}
function ns(e, t, r = !1) {
  let n, s;
  const i = C(e);
  i ? (n = e, s = {}.NODE_ENV !== "production" ? () => {
    console.warn("Write operation failed: computed value is readonly");
  } : ve) : (n = e.get, s = e.set);
  const o = new Vr(n, s, i || !s, r);
  return {}.NODE_ENV !== "production" && t && !r && (o.effect.onTrack = t.onTrack, o.effect.onTrigger = t.onTrigger), o;
}
function jr(e) {
  ie && le && (e = m(e), Pr(
    le,
    e.dep || (e.dep = Dr(
      () => e.dep = void 0,
      e instanceof Vr ? e : void 0
    )),
    {}.NODE_ENV !== "production" ? {
      target: e,
      type: "get",
      key: "value"
    } : void 0
  ));
}
function Et(e, t = 3, r) {
  e = m(e);
  const n = e.dep;
  n && Cr(
    n,
    t,
    {}.NODE_ENV !== "production" ? {
      target: e,
      type: "set",
      key: "value",
      newValue: r
    } : void 0
  );
}
function V(e) {
  return !!(e && e.__v_isRef === !0);
}
function ss(e) {
  return V(e) ? e.value : e;
}
const is = {
  get: (e, t, r) => ss(Reflect.get(e, t, r)),
  set: (e, t, r, n) => {
    const s = e[t];
    return V(s) && !V(r) ? (s.value = r, !0) : Reflect.set(e, t, r, n);
  }
};
function os(e) {
  return Ee(e) ? e : new Proxy(e, is);
}
class as {
  constructor(t) {
    this.dep = void 0, this.__v_isRef = !0;
    const { get: r, set: n } = t(
      () => jr(this),
      () => Et(this)
    );
    this._get = r, this._set = n;
  }
  get value() {
    return this._get();
  }
  set value(t) {
    this._set(t);
  }
}
function cs(e) {
  return new as(e);
}
const de = [];
function ls(e) {
  de.push(e);
}
function us() {
  de.pop();
}
function T(e, ...t) {
  Dt();
  const r = de.length ? de[de.length - 1].component : null, n = r && r.appContext.config.warnHandler, s = ds();
  if (n)
    he(
      n,
      r,
      11,
      [
        e + t.join(""),
        r && r.proxy,
        s.map(
          ({ vnode: i }) => `at <${Yr(r, i.type)}>`
        ).join(`
`),
        s
      ]
    );
  else {
    const i = [`[Vue warn]: ${e}`, ...t];
    s.length && i.push(`
`, ...hs(s)), console.warn(...i);
  }
  It();
}
function ds() {
  let e = de[de.length - 1];
  if (!e)
    return [];
  const t = [];
  for (; e; ) {
    const r = t[0];
    r && r.vnode === e ? r.recurseCount++ : t.push({
      vnode: e,
      recurseCount: 0
    });
    const n = e.component && e.component.parent;
    e = n && n.vnode;
  }
  return t;
}
function hs(e) {
  const t = [];
  return e.forEach((r, n) => {
    t.push(...n === 0 ? [] : [`
`], ...fs(r));
  }), t;
}
function fs({ vnode: e, recurseCount: t }) {
  const r = t > 0 ? `... (${t} recursive calls)` : "", n = e.component ? e.component.parent == null : !1, s = ` at <${Yr(
    e.component,
    e.type,
    n
  )}`, i = ">" + r;
  return e.props ? [s, ...ps(e.props), i] : [s + i];
}
function ps(e) {
  const t = [], r = Object.keys(e);
  return r.slice(0, 3).forEach((n) => {
    t.push(...Fr(n, e[n]));
  }), r.length > 3 && t.push(" ..."), t;
}
function Fr(e, t, r) {
  return st(t) ? (t = JSON.stringify(t), r ? t : [`${e}=${t}`]) : typeof t == "number" || typeof t == "boolean" || t == null ? r ? t : [`${e}=${t}`] : V(t) ? (t = Fr(e, m(t.value), !0), r ? t : [`${e}=Ref<`, t, ">"]) : C(t) ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`] : (t = m(t), r ? t : [`${e}=`, t]);
}
const qr = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  0: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://github.com/vuejs/core ."
};
function he(e, t, r, n) {
  let s;
  try {
    s = n ? e(...n) : e();
  } catch (i) {
    jt(i, t, r);
  }
  return s;
}
function Qe(e, t, r, n) {
  if (C(e)) {
    const i = he(e, t, r, n);
    return i && Pn(i) && i.catch((o) => {
      jt(o, t, r);
    }), i;
  }
  const s = [];
  for (let i = 0; i < e.length; i++)
    s.push(Qe(e[i], t, r, n));
  return s;
}
function jt(e, t, r, n = !0) {
  const s = t ? t.vnode : null;
  if (t) {
    let i = t.parent;
    const o = t.proxy, a = {}.NODE_ENV !== "production" ? qr[r] : `https://vuejs.org/errors/#runtime-${r}`;
    for (; i; ) {
      const l = i.ec;
      if (l) {
        for (let d = 0; d < l.length; d++)
          if (l[d](e, o, a) === !1)
            return;
      }
      i = i.parent;
    }
    const c = t.appContext.config.errorHandler;
    if (c) {
      he(
        c,
        null,
        10,
        [e, o, a]
      );
      return;
    }
  }
  gs(e, r, s, n);
}
function gs(e, t, r, n = !0) {
  if ({}.NODE_ENV !== "production") {
    const s = qr[t];
    if (r && ls(r), T(`Unhandled error${s ? ` during execution of ${s}` : ""}`), r && us(), n)
      throw e;
    console.error(e);
  } else
    console.error(e);
}
let Ze = !1, bt = !1;
const L = [];
let ne = 0;
const be = [];
let W = null, re = 0;
const Wr = /* @__PURE__ */ Promise.resolve();
let Ft = null;
const ms = 100;
function xt(e) {
  const t = Ft || Wr;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function ws(e) {
  let t = ne + 1, r = L.length;
  for (; t < r; ) {
    const n = t + r >>> 1, s = L[n], i = He(s);
    i < e || i === e && s.pre ? t = n + 1 : r = n;
  }
  return t;
}
function qt(e) {
  (!L.length || !L.includes(
    e,
    Ze && e.allowRecurse ? ne + 1 : ne
  )) && (e.id == null ? L.push(e) : L.splice(ws(e.id), 0, e), zr());
}
function zr() {
  !Ze && !bt && (bt = !0, Ft = Wr.then(Kr));
}
function Ur(e) {
  P(e) ? be.push(...e) : (!W || !W.includes(
    e,
    e.allowRecurse ? re + 1 : re
  )) && be.push(e), zr();
}
function _s(e) {
  if (be.length) {
    const t = [...new Set(be)];
    if (be.length = 0, W) {
      W.push(...t);
      return;
    }
    for (W = t, {}.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), W.sort((r, n) => He(r) - He(n)), re = 0; re < W.length; re++)
      ({}).NODE_ENV !== "production" && Gr(e, W[re]) || W[re]();
    W = null, re = 0;
  }
}
const He = (e) => e.id == null ? 1 / 0 : e.id, vs = (e, t) => {
  const r = He(e) - He(t);
  if (r === 0) {
    if (e.pre && !t.pre)
      return -1;
    if (t.pre && !e.pre)
      return 1;
  }
  return r;
};
function Kr(e) {
  bt = !1, Ze = !0, {}.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), L.sort(vs);
  const t = {}.NODE_ENV !== "production" ? (r) => Gr(e, r) : ve;
  try {
    for (ne = 0; ne < L.length; ne++) {
      const r = L[ne];
      if (r && r.active !== !1) {
        if ({}.NODE_ENV !== "production" && t(r))
          continue;
        he(r, null, 14);
      }
    }
  } finally {
    ne = 0, L.length = 0, _s(e), Ze = !1, Ft = null, (L.length || be.length) && Kr(e);
  }
}
function Gr(e, t) {
  if (!e.has(t))
    e.set(t, 1);
  else {
    const r = e.get(t);
    if (r > ms) {
      const n = t.ownerInstance, s = n && Jr(n.type);
      return jt(
        `Maximum recursive updates exceeded${s ? ` in component <${s}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
        null,
        10
      ), !0;
    } else
      e.set(t, r + 1);
  }
}
const Ne = /* @__PURE__ */ new Set();
({}).NODE_ENV !== "production" && (Nr().__VUE_HMR_RUNTIME__ = {
  createRecord: lt(ys),
  rerender: lt(Es),
  reload: lt(bs)
});
const et = /* @__PURE__ */ new Map();
function ys(e, t) {
  return et.has(e) ? !1 : (et.set(e, {
    initialDef: Ie(t),
    instances: /* @__PURE__ */ new Set()
  }), !0);
}
function Ie(e) {
  return js(e) ? e.__vccOpts : e;
}
function Es(e, t) {
  const r = et.get(e);
  r && (r.initialDef.render = t, [...r.instances].forEach((n) => {
    t && (n.render = t, Ie(n.type).render = t), n.renderCache = [], n.effect.dirty = !0, n.update();
  }));
}
function bs(e, t) {
  const r = et.get(e);
  if (!r)
    return;
  t = Ie(t), sr(r.initialDef, t);
  const n = [...r.instances];
  for (const s of n) {
    const i = Ie(s.type);
    Ne.has(i) || (i !== r.initialDef && sr(i, t), Ne.add(i)), s.appContext.propsCache.delete(s.type), s.appContext.emitsCache.delete(s.type), s.appContext.optionsCache.delete(s.type), s.ceReload ? (Ne.add(i), s.ceReload(t.styles), Ne.delete(i)) : s.parent ? (s.parent.effect.dirty = !0, qt(s.parent.update)) : s.appContext.reload ? s.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
      "[HMR] Root or manually mounted instance modified. Full reload required."
    );
  }
  Ur(() => {
    for (const s of n)
      Ne.delete(
        Ie(s.type)
      );
  });
}
function sr(e, t) {
  Q(e, t);
  for (const r in e)
    r !== "__file" && !(r in t) && delete e[r];
}
function lt(e) {
  return (t, r) => {
    try {
      return e(t, r);
    } catch (n) {
      console.error(n), console.warn(
        "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
      );
    }
  };
}
let Nt = null;
function xs(e, t) {
  t && t.pendingBranch ? P(e) ? t.effects.push(...e) : t.effects.push(e) : Ur(e);
}
const Ns = Symbol.for("v-scx"), $s = () => {
  {
    const e = Ms(Ns);
    return e || {}.NODE_ENV !== "production" && T(
      "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
    ), e;
  }
};
function Rs(e, t) {
  return Wt(e, null, t);
}
const Ke = {};
function $t(e, t, r) {
  return {}.NODE_ENV !== "production" && !C(t) && T(
    "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
  ), Wt(e, t, r);
}
function Wt(e, t, {
  immediate: r,
  deep: n,
  flush: s,
  once: i,
  onTrack: o,
  onTrigger: a
} = U) {
  var c;
  if (t && i) {
    const g = t;
    t = (...F) => {
      g(...F), X();
    };
  }
  ({}).NODE_ENV !== "production" && !t && (r !== void 0 && T(
    'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
  ), n !== void 0 && T(
    'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
  ), i !== void 0 && T(
    'watch() "once" option is only respected when using the watch(source, callback, options?) signature.'
  ));
  const l = (g) => {
    T(
      "Invalid watch source: ",
      g,
      "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
    );
  }, d = Bn() === ((c = ge) == null ? void 0 : c.scope) ? ge : null;
  let u, h = !1, p = !1;
  if (V(e) ? (u = () => e.value, h = Re(e)) : Ee(e) ? (u = Re(e) || n === !1 ? () => se(e, 1) : () => se(e), h = !0) : P(e) ? (p = !0, h = e.some((g) => Ee(g) || Re(g)), u = () => e.map((g) => {
    if (V(g))
      return g.value;
    if (Ee(g))
      return se(g, Re(g) || n === !1 ? 1 : void 0);
    if (C(g))
      return he(g, d, 2);
    ({}).NODE_ENV !== "production" && l(g);
  })) : C(e) ? t ? u = () => he(e, d, 2) : u = () => {
    if (!(d && d.isUnmounted))
      return _ && _(), Qe(
        e,
        d,
        3,
        [w]
      );
  } : (u = ve, {}.NODE_ENV !== "production" && l(e)), t && n) {
    const g = u;
    u = () => se(g());
  }
  let _, w = (g) => {
    _ = N.onStop = () => {
      he(g, d, 4), _ = N.onStop = void 0;
    };
  }, R;
  if (Ut)
    if (w = ve, t ? r && Qe(t, d, 3, [
      u(),
      p ? [] : void 0,
      w
    ]) : u(), s === "sync") {
      const g = $s();
      R = g.__watcherHandles || (g.__watcherHandles = []);
    } else
      return ve;
  let E = p ? new Array(e.length).fill(Ke) : Ke;
  const I = () => {
    if (!(!N.active || !N.dirty))
      if (t) {
        const g = N.run();
        (n || h || (p ? g.some((F, Ve) => pe(F, E[Ve])) : pe(g, E))) && (_ && _(), Qe(t, d, 3, [
          g,
          // pass undefined as the old value when it's changed for the first time
          E === Ke ? void 0 : p && E[0] === Ke ? [] : E,
          w
        ]), E = g);
      } else
        N.run();
  };
  I.allowRecurse = !!t;
  let j;
  s === "sync" ? j = I : s === "post" ? j = () => ur(I, d && d.suspense) : (I.pre = !0, d && (I.id = d.uid), j = () => qt(I));
  const N = new Rr(u, ve, j), X = () => {
    N.stop(), d && d.scope && Rn(d.scope.effects, N);
  };
  return {}.NODE_ENV !== "production" && (N.onTrack = o, N.onTrigger = a), t ? r ? I() : E = N.run() : s === "post" ? ur(
    N.run.bind(N),
    d && d.suspense
  ) : N.run(), R && R.push(X), X;
}
function Ss(e, t, r) {
  const n = this.proxy, s = st(e) ? e.includes(".") ? Ts(n, e) : () => n[e] : e.bind(n, n);
  let i;
  C(t) ? i = t : (i = t.handler, r = t);
  const o = ge;
  dr(this);
  const a = Wt(s, i.bind(n), r);
  return o ? dr(o) : Bs(), a;
}
function Ts(e, t) {
  const r = t.split(".");
  return () => {
    let n = e;
    for (let s = 0; s < r.length && n; s++)
      n = n[r[s]];
    return n;
  };
}
function se(e, t, r = 0, n) {
  if (!K(e) || e.__v_skip)
    return e;
  if (t && t > 0) {
    if (r >= t)
      return e;
    r++;
  }
  if (n = n || /* @__PURE__ */ new Set(), n.has(e))
    return e;
  if (n.add(e), V(e))
    se(e.value, t, r, n);
  else if (P(e))
    for (let s = 0; s < e.length; s++)
      se(e[s], t, r, n);
  else if (Tn(e) || ye(e))
    e.forEach((s) => {
      se(s, t, r, n);
    });
  else if (Dn(e))
    for (const s in e)
      se(e[s], t, r, n);
  return e;
}
const Rt = (e) => e ? As(e) ? Hs(e) || e.proxy : Rt(e.parent) : null, Oe = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Q(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => ({}).NODE_ENV !== "production" ? Ue(e.props) : e.props,
    $attrs: (e) => ({}).NODE_ENV !== "production" ? Ue(e.attrs) : e.attrs,
    $slots: (e) => ({}).NODE_ENV !== "production" ? Ue(e.slots) : e.slots,
    $refs: (e) => ({}).NODE_ENV !== "production" ? Ue(e.refs) : e.refs,
    $parent: (e) => Rt(e.parent),
    $root: (e) => Rt(e.root),
    $emit: (e) => e.emit,
    $options: (e) => Ds(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      e.effect.dirty = !0, qt(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = xt.bind(e.proxy)),
    $watch: (e) => Ss.bind(e)
  })
), Ps = (e) => e === "_" || e === "$", ut = (e, t) => e !== U && !e.__isScriptSetup && x(e, t), Cs = {
  get({ _: e }, t) {
    const { ctx: r, setupState: n, data: s, props: i, accessCache: o, type: a, appContext: c } = e;
    if ({}.NODE_ENV !== "production" && t === "__isVue")
      return !0;
    let l;
    if (t[0] !== "$") {
      const p = o[t];
      if (p !== void 0)
        switch (p) {
          case 1:
            return n[t];
          case 2:
            return s[t];
          case 4:
            return r[t];
          case 3:
            return i[t];
        }
      else {
        if (ut(n, t))
          return o[t] = 1, n[t];
        if (s !== U && x(s, t))
          return o[t] = 2, s[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (l = e.propsOptions[0]) && x(l, t)
        )
          return o[t] = 3, i[t];
        if (r !== U && x(r, t))
          return o[t] = 4, r[t];
        o[t] = 0;
      }
    }
    const d = Oe[t];
    let u, h;
    if (d)
      return (t === "$attrs" || {}.NODE_ENV !== "production" && t === "$slots") && M(e, "get", t), d(e);
    if (
      // css module (injected by vue-loader)
      (u = a.__cssModules) && (u = u[t])
    )
      return u;
    if (r !== U && x(r, t))
      return o[t] = 4, r[t];
    if (
      // global properties
      h = c.config.globalProperties, x(h, t)
    )
      return h[t];
    ({}).NODE_ENV !== "production" && Nt && (!st(t) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    t.indexOf("__v") !== 0) && (s !== U && Ps(t[0]) && x(s, t) ? T(
      `Property ${JSON.stringify(
        t
      )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
    ) : e === Nt && T(
      `Property ${JSON.stringify(t)} was accessed during render but is not defined on instance.`
    ));
  },
  set({ _: e }, t, r) {
    const { data: n, setupState: s, ctx: i } = e;
    return ut(s, t) ? (s[t] = r, !0) : {}.NODE_ENV !== "production" && s.__isScriptSetup && x(s, t) ? (T(`Cannot mutate <script setup> binding "${t}" from Options API.`), !1) : n !== U && x(n, t) ? (n[t] = r, !0) : x(e.props, t) ? ({}.NODE_ENV !== "production" && T(`Attempting to mutate prop "${t}". Props are readonly.`), !1) : t[0] === "$" && t.slice(1) in e ? ({}.NODE_ENV !== "production" && T(
      `Attempting to mutate public property "${t}". Properties starting with $ are reserved and readonly.`
    ), !1) : ({}.NODE_ENV !== "production" && t in e.appContext.config.globalProperties ? Object.defineProperty(i, t, {
      enumerable: !0,
      configurable: !0,
      value: r
    }) : i[t] = r, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: r, ctx: n, appContext: s, propsOptions: i }
  }, o) {
    let a;
    return !!r[o] || e !== U && x(e, o) || ut(t, o) || (a = i[0]) && x(a, o) || x(n, o) || x(Oe, o) || x(s.config.globalProperties, o);
  },
  defineProperty(e, t, r) {
    return r.get != null ? e._.accessCache[t] = 0 : x(r, "value") && this.set(e, t, r.value, null), Reflect.defineProperty(e, t, r);
  }
};
({}).NODE_ENV !== "production" && (Cs.ownKeys = (e) => (T(
  "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
), Reflect.ownKeys(e)));
function ir(e) {
  return P(e) ? e.reduce(
    (t, r) => (t[r] = null, t),
    {}
  ) : e;
}
function Ds(e) {
  const t = e.type, { mixins: r, extends: n } = t, {
    mixins: s,
    optionsCache: i,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = i.get(t);
  let c;
  return a ? c = a : !s.length && !r && !n ? c = t : (c = {}, s.length && s.forEach(
    (l) => tt(c, l, o, !0)
  ), tt(c, t, o)), K(t) && i.set(t, c), c;
}
function tt(e, t, r, n = !1) {
  const { mixins: s, extends: i } = t;
  i && tt(e, i, r, !0), s && s.forEach(
    (o) => tt(e, o, r, !0)
  );
  for (const o in t)
    if (n && o === "expose")
      ({}).NODE_ENV !== "production" && T(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const a = Is[o] || r && r[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Is = {
  data: or,
  props: cr,
  emits: cr,
  // objects
  methods: Se,
  computed: Se,
  // lifecycle
  beforeCreate: D,
  created: D,
  beforeMount: D,
  mounted: D,
  beforeUpdate: D,
  updated: D,
  beforeDestroy: D,
  beforeUnmount: D,
  destroyed: D,
  unmounted: D,
  activated: D,
  deactivated: D,
  errorCaptured: D,
  serverPrefetch: D,
  // assets
  components: Se,
  directives: Se,
  // watch
  watch: ks,
  // provide / inject
  provide: or,
  inject: Os
};
function or(e, t) {
  return t ? e ? function() {
    return Q(
      C(e) ? e.call(this, this) : e,
      C(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Os(e, t) {
  return Se(ar(e), ar(t));
}
function ar(e) {
  if (P(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++)
      t[e[r]] = e[r];
    return t;
  }
  return e;
}
function D(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Se(e, t) {
  return e ? Q(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function cr(e, t) {
  return e ? P(e) && P(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Q(
    /* @__PURE__ */ Object.create(null),
    ir(e),
    ir(t ?? {})
  ) : t;
}
function ks(e, t) {
  if (!e)
    return t;
  if (!t)
    return e;
  const r = Q(/* @__PURE__ */ Object.create(null), e);
  for (const n in t)
    r[n] = D(e[n], t[n]);
  return r;
}
let lr = null;
function Ms(e, t, r = !1) {
  const n = ge || Nt;
  if (n || lr) {
    const s = n ? n.parent == null ? n.vnode.appContext && n.vnode.appContext.provides : n.parent.provides : lr._context.provides;
    if (s && e in s)
      return s[e];
    if (arguments.length > 1)
      return r && C(t) ? t.call(n && n.proxy) : t;
    ({}).NODE_ENV !== "production" && T(`injection "${String(e)}" not found.`);
  } else
    ({}).NODE_ENV !== "production" && T("inject() can only be used inside setup() or functional components.");
}
const ur = xs;
let ge = null, zt;
{
  const e = Nr(), t = (r, n) => {
    let s;
    return (s = e[r]) || (s = e[r] = []), s.push(n), (i) => {
      s.length > 1 ? s.forEach((o) => o(i)) : s[0](i);
    };
  };
  zt = t(
    "__VUE_INSTANCE_SETTERS__",
    (r) => ge = r
  ), t(
    "__VUE_SSR_SETTERS__",
    (r) => Ut = r
  );
}
const dr = (e) => {
  zt(e), e.scope.on();
}, Bs = () => {
  ge && ge.scope.off(), zt(null);
};
function As(e) {
  return e.vnode.shapeFlag & 4;
}
let Ut = !1;
function Hs(e) {
  if (e.exposed)
    return e.exposeProxy || (e.exposeProxy = new Proxy(os(rs(e.exposed)), {
      get(t, r) {
        if (r in t)
          return t[r];
        if (r in Oe)
          return Oe[r](e);
      },
      has(t, r) {
        return r in t || r in Oe;
      }
    }));
}
const Ls = /(?:^|[-_])(\w)/g, Vs = (e) => e.replace(Ls, (t) => t.toUpperCase()).replace(/[-_]/g, "");
function Jr(e, t = !0) {
  return C(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Yr(e, t, r = !1) {
  let n = Jr(t);
  if (!n && t.__file) {
    const s = t.__file.match(/([^/\\]+)\.\w+$/);
    s && (n = s[1]);
  }
  if (!n && e && e.parent) {
    const s = (i) => {
      for (const o in i)
        if (i[o] === t)
          return o;
    };
    n = s(
      e.components || e.parent.type.components
    ) || s(e.appContext.components);
  }
  return n ? Vs(n) : r ? "App" : "Anonymous";
}
function js(e) {
  return C(e) && "__vccOpts" in e;
}
const Fs = (e, t) => ns(e, t, Ut);
function dt(e) {
  return !!(e && e.__v_isShallow);
}
function qs() {
  if ({}.NODE_ENV === "production" || typeof window > "u")
    return;
  const e = { style: "color:#3ba776" }, t = { style: "color:#1677ff" }, r = { style: "color:#f5222d" }, n = { style: "color:#eb2f96" }, s = {
    header(u) {
      return K(u) ? u.__isVue ? ["div", e, "VueInstance"] : V(u) ? [
        "div",
        {},
        ["span", e, d(u)],
        "<",
        a(u.value),
        ">"
      ] : Ee(u) ? [
        "div",
        {},
        ["span", e, dt(u) ? "ShallowReactive" : "Reactive"],
        "<",
        a(u),
        `>${xe(u) ? " (readonly)" : ""}`
      ] : xe(u) ? [
        "div",
        {},
        ["span", e, dt(u) ? "ShallowReadonly" : "Readonly"],
        "<",
        a(u),
        ">"
      ] : null : null;
    },
    hasBody(u) {
      return u && u.__isVue;
    },
    body(u) {
      if (u && u.__isVue)
        return [
          "div",
          {},
          ...i(u.$)
        ];
    }
  };
  function i(u) {
    const h = [];
    u.type.props && u.props && h.push(o("props", m(u.props))), u.setupState !== U && h.push(o("setup", u.setupState)), u.data !== U && h.push(o("data", m(u.data)));
    const p = c(u, "computed");
    p && h.push(o("computed", p));
    const _ = c(u, "inject");
    return _ && h.push(o("injected", _)), h.push([
      "div",
      {},
      [
        "span",
        {
          style: n.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: u }]
    ]), h;
  }
  function o(u, h) {
    return h = Q({}, h), Object.keys(h).length ? [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        u
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(h).map((p) => [
          "div",
          {},
          ["span", n, p + ": "],
          a(h[p], !1)
        ])
      ]
    ] : ["span", {}];
  }
  function a(u, h = !0) {
    return typeof u == "number" ? ["span", t, u] : typeof u == "string" ? ["span", r, JSON.stringify(u)] : typeof u == "boolean" ? ["span", n, u] : K(u) ? ["object", { object: h ? m(u) : u }] : ["span", r, String(u)];
  }
  function c(u, h) {
    const p = u.type;
    if (C(p))
      return;
    const _ = {};
    for (const w in u.ctx)
      l(p, w, h) && (_[w] = u.ctx[w]);
    return _;
  }
  function l(u, h, p) {
    const _ = u[p];
    if (P(_) && _.includes(h) || K(_) && h in _ || u.extends && l(u.extends, h, p) || u.mixins && u.mixins.some((w) => l(w, h, p)))
      return !0;
  }
  function d(u) {
    return dt(u) ? "ShallowRef" : u.effect ? "ComputedRef" : "Ref";
  }
  window.devtoolsFormatters ? window.devtoolsFormatters.push(s) : window.devtoolsFormatters = [s];
}
function Ws() {
  qs();
}
({}).NODE_ENV !== "production" && Ws();
class zs {
  constructor() {
    ae(this, "pending", !1);
    ae(this, "fulfilled", !1);
    ae(this, "rejected", !1);
    ae(this, "data", {});
    ae(this, "error", {});
    ae(this, "_p", Promise.resolve());
  }
  setP(t) {
    this._p = t;
  }
  equalP(t) {
    return this._p === t;
  }
  reLoad() {
  }
  setValue(t) {
  }
}
const Us = Symbol();
function St({
  deps: e,
  getter: t,
  dataMergeFun: r = (s, i) => i,
  defaultData: n
}) {
  const s = new zs();
  return n !== void 0 && (s.data = n), cs((i, o) => {
    if (!e && t)
      Rs(() => a(t()));
    else if (e && t)
      if (e instanceof Function) {
        const c = e();
        Array.isArray(c) && c.length === 0 || $t(e, () => a(t()), { immediate: !0 });
      } else
        $t(e, () => a(t()), { immediate: !0 });
    function a(c) {
      if (s.pending = !0, s.fulfilled = !1, s.rejected = !1, c === Us) {
        xt(o);
        return;
      }
      s.setP(c), xt(o), c.then((l) => {
        s.equalP(c) && (s.pending = !1, s.fulfilled = !0, s.data = r(s.data, l));
      }).catch((l) => {
        s.equalP(c) && (s.pending = !1, s.rejected = !0, s.error = l);
      }).finally(() => {
        s.equalP(c) && o();
      });
    }
    return s.reLoad = () => {
      t && a(t());
    }, s.setValue = (c) => {
      s.pending = !1, s.fulfilled = !0, s.data = r(s.data, c), o();
    }, {
      get() {
        return i(), s;
      },
      set(c) {
        console.warn("不可设置值");
      }
    };
  });
}
((e) => {
  function t(n) {
    return e({
      deps: () => [],
      getter: n
    });
  }
  e.nullDeps = t;
  function r(n) {
    return e({
      getter() {
        return n();
      }
    });
  }
  e.fn = r;
})(St || (St = {}));
function ke(e, t, r = { add: !0, update: !0 }) {
  for (let n in t)
    t.hasOwnProperty(n) && (t[n] instanceof Object && !Array.isArray(t[n]) ? (e.hasOwnProperty(n) || (e[n] = {}), ke(e[n], t[n], r)) : (!e.hasOwnProperty(n) && r.add || r.update) && (e[n] = t[n]));
  return e;
}
const Ks = "0.0.10", Qr = {
  name: "default",
  /** 需要编译的笔记本 */
  notebook: {},
  /** 思源的鉴权key */
  authorized: "",
  /** 思源的api服务地址 */
  apiPrefix: "http://127.0.0.1:6806",
  /** 打包成 zip */
  compressedZip: !0,
  /** 不将 publicZip 打包到 zip 包中 */
  withoutPublicZip: !0,
  /** 不复制 assets/ ，勾选此选项则需要自行处理资源文件 */
  excludeAssetsCopy: !1,
  /** 输出站点地图相关 */
  sitemap: {
    /** 控制是否输出 sitemap.xml,不影响 rss 选项 */
    enable: !0,
    /** 默认为 "." 生成路径例如 "./record/思源笔记.html"
     * 但 sitemap 并不建议采用相对路径所以应该替换成例如 "https://shenzilong.cn"
     * 则会生成 "https://shenzilong.cn/record/思源笔记.html" 这样的绝对路径
     * 参见 https://www.sitemaps.org/protocol.html#escaping
     */
    sitePrefix: ".",
    /** 站点地址 */
    siteLink: "",
    /** 站点描述 */
    description: "",
    /** 站点标题 */
    title: "",
    /** 开启 rss 生成，对于文件名为 .rss.xml 结尾的文档生效 */
    rss: !0
  },
  /** 开启增量编译，当开启增量编译时，
   * 在编译过程中会依据 __skipBuilds__ 的内容来跳过一些没有变化不需要重新输出的内容
   */
  enableIncrementalCompilation: !1,
  /**
   * 要全量编译文档时将此选项设置为false，当OceanPress版本和上次编译时不同时会忽略此属性全量编译文档
   */
  enableIncrementalCompilation_doc: !0,
  /** 跳过编译的资源 */
  __skipBuilds__: {},
  cdn: {
    /** 思源 js、css等文件的前缀 */
    siyuanPrefix: "https://fastly.jsdelivr.net/gh/siyuan-note/oceanpress@v0.0.7/apps/frontend/public/notebook/",
    /** 思源 js、css等文件zip包地址  */
    publicZip: "https://fastly.jsdelivr.net/gh/siyuan-note/oceanpress@v0.0.7/apps/frontend/public/public.zip"
  },
  /** s3 上传配置
   * https://help.aliyun.com/zh/oss/developer-reference/use-amazon-s3-sdks-to-access-oss#section-2ri-suq-pb3
   */
  s3: {
    enable: !1,
    bucket: "",
    region: "",
    pathPrefix: "",
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: ""
  },
  meilisearch: {
    enable: !1,
    host: "",
    apiKey: "",
    indexName: ""
  },
  /** html模板嵌入代码块，会将此处配置中的代码嵌入到生成的html所对应的位置 */
  embedCode: {
    head: "",
    beforeBody: "",
    afterBody: `<footer>
<p style="text-align:center;margin:15px 0;">
  技术支持：
  <a target="_blank" href="https://github.com/2234839/oceanPress_js">OceanPress</a> |
  开发者：
  <a target="_blank" href="https://heartstack.space/user/%E5%AD%90%E8%99%9A/posts">崮生（子虚）</a>
</p>
</footer>`
  },
  OceanPress: {
    /** 此配置文件编译时的版本 */
    version: Ks
  }
}, J = At({
  /** 当前所使用的配置项的 key */
  __current__: "default",
  /** 为true是表示是代码中设置的默认值，不会保存到本地，避免覆盖之前保存的数据，在加载本地配置后会自动修改为false */
  __init__: !0,
  default: ke({}, Qr)
}), Xr = (e) => {
  if (e)
    ke(J, e);
  else {
    const t = k.getItem("configs");
    t && ke(J, JSON.parse(t));
  }
  Object.entries(J).filter(([t]) => t.startsWith("__") === !1).forEach(([t, r]) => {
    ke(r, Qr, { update: !1, add: !0 });
  });
}, fe = Fs(() => J[J.__current__]), Gs = () => {
  J.__init__ === !1 && k.setItem("configs", JSON.stringify(J, null, 2));
};
let Ge = null;
const Js = () => {
  Ge && clearTimeout(Ge), Ge = setTimeout(() => {
    Gs(), Ge = null;
  }, 700);
};
$t(J, Js, { deep: !0 });
J.__init__ = !1;
globalThis.document && Xr();
async function Zr(e, t) {
  const r = fe.value.apiPrefix, n = fe.value.authorized;
  if (e === "get_assets")
    return fetch(`${r}/${t[0].path}`, {
      headers: {
        Authorization: `Token ${n}`
      },
      body: null,
      method: "GET",
      mode: "cors"
    }).then((o) => o.arrayBuffer());
  const s = await fetch(`${r}/api/${e.replace(/_/g, "/")}`, {
    headers: {
      Authorization: `Token ${n}`
    },
    body: JSON.stringify(t[0]),
    method: "POST"
  }).catch((o) => {
    throw o.message = "访问思源接口时出错了，请检查思源服务是否启动", o;
  });
  if (e === "file_getFile") {
    const o = t[0].path;
    if (o.endsWith(".sy"))
      return await s.json();
    {
      const a = await s.arrayBuffer();
      if (a.byteLength < 200) {
        const l = new TextDecoder().decode(a);
        if (JSON.parse(l).code === 404)
          throw new Error(`文件不存在: ${o}`);
      }
      return a;
    }
  }
  const i = await s.json();
  if (i.code !== 0)
    throw new Error(i.msg);
  return i.data;
}
const Kt = new Proxy(
  {},
  {
    get(e, t) {
      return (...r) => Zr(t, r);
    }
  }
);
new Proxy(
  {},
  {
    get(e, t) {
      return (...r) => St.fn(() => Zr(t, r));
    }
  }
);
let Y = !0;
function Ys(e) {
  Y = e;
}
const ht = /* @__PURE__ */ new Map(), hr = /* @__PURE__ */ new Map(), en = /* @__PURE__ */ new Map(), fr = /* @__PURE__ */ new Map();
async function tn(e) {
  if (Y && ht.has(e))
    return ht.get(e);
  const t = await Kt.query_sql({
    stmt: e
  });
  return Y && ht.set(e, t), t;
}
async function rn(e) {
  if (Y) {
    const n = hr.get(e);
    if (n)
      return n;
  }
  const t = (await tn(
    `SELECT * FROM blocks WHERE hpath = '${e}'`
  ))[0];
  if (t === void 0)
    throw new Error(`not doc by:${e}`);
  const r = await Qs(br(t));
  return Y && hr.set(e, r), r;
}
async function Qs(e) {
  const t = on(
    await Kt.file_getFile({
      path: e
    })
  );
  return Y && sn(t), t;
}
async function Gt(e) {
  if (Y) {
    const r = fr.get(e);
    if (r)
      return r;
  }
  const t = await tn(`
          SELECT * from blocks
          WHERE id = '${e}'
        `);
  if (t.length !== 0)
    return Y && fr.set(e, t[0]), t[0];
}
async function nn(e) {
  if (Y) {
    const r = en.get(e);
    if (r) {
      let n = r;
      for (; ; ) {
        if (n.Type === "NodeDocument")
          return n;
        if (n === void 0)
          break;
        n = n.Parent;
      }
    }
  }
  const t = await Gt(e);
  if (t !== void 0)
    return await rn(t.hpath);
}
function sn(e) {
  e.ID && en.set(e.ID, e), e.Children && e.Children.forEach(sn);
}
function on(e) {
  for (const t of (e == null ? void 0 : e.Children) ?? [])
    t.Parent = e, on(t);
  return e;
}
k.getDocByChildID = async (e) => await nn(e);
k.getDocPathBySY = async (e) => {
  if (e != null && e.ID) {
    const t = await Gt(e.ID);
    if (t)
      return br(t);
  }
};
k.getHPathByID_Node = async (e) => {
  const t = typeof e == "string" ? e : e.ID;
  if (t === void 0)
    throw new Error("id is undefined");
  if (await nn(t) === void 0)
    throw new Error("docNode is undefined");
  const n = await Gt(t);
  if (n === void 0)
    throw new Error("docBlock is undefined");
  return n.hpath;
};
k.getNodeByID = async (e) => {
  if (e === void 0)
    return;
  const t = await k.getDocByChildID(e);
  if (t === void 0)
    return;
  return r(t);
  function r(n) {
    if (n.ID === e)
      return n;
    if (n.Children !== void 0)
      for (const s of n.Children) {
        const i = r(s);
        if (i)
          return i;
      }
  }
};
var Xs = (e) => {
  const t = e.split("/");
  return t[0] === "" && t.shift(), t;
}, Zs = (e) => {
  const t = [];
  for (let n = 0; ; ) {
    let s = !1;
    if (e = e.replace(/\{[^}]+\}/g, (i) => {
      const o = `@\\${n}`;
      return t[n] = [o, i], n++, s = !0, o;
    }), !s)
      break;
  }
  const r = e.split("/");
  r[0] === "" && r.shift();
  for (let n = t.length - 1; n >= 0; n--) {
    const [s] = t[n];
    for (let i = r.length - 1; i >= 0; i--)
      if (r[i].indexOf(s) !== -1) {
        r[i] = r[i].replace(s, t[n][1]);
        break;
      }
  }
  return r;
}, Je = {}, pr = (e) => {
  if (e === "*")
    return "*";
  const t = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  return t ? (Je[e] || (t[2] ? Je[e] = [e, t[1], new RegExp("^" + t[2] + "$")] : Je[e] = [e, t[1], !0]), Je[e]) : null;
}, an = (e) => {
  const t = e.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return t ? t[1] : "";
}, ei = (e) => {
  const t = e.indexOf("?", 8);
  return t === -1 ? "" : "?" + e.slice(t + 1);
}, ti = (e) => {
  const t = an(e);
  return t.length > 1 && t[t.length - 1] === "/" ? t.slice(0, -1) : t;
}, $e = (...e) => {
  let t = "", r = !1;
  for (let n of e)
    t[t.length - 1] === "/" && (t = t.slice(0, -1), r = !0), n[0] !== "/" && (n = `/${n}`), n === "/" && r ? t = `${t}/` : n !== "/" && (t = `${t}${n}`), n === "/" && t === "" && (t = "/");
  return t;
}, cn = (e) => {
  const t = e.match(/^(.+|)(\/\:[^\/]+)\?$/);
  if (!t)
    return null;
  const r = t[1], n = r + t[2];
  return [r === "" ? "/" : r.replace(/\/$/, ""), n];
}, ft = (e) => /[%+]/.test(e) ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")), /%/.test(e) ? rt(e) : e) : e, ln = (e, t, r) => {
  let n;
  if (!r && t && !/[%+]/.test(t)) {
    let o = e.indexOf(`?${t}`, 8);
    for (o === -1 && (o = e.indexOf(`&${t}`, 8)); o !== -1; ) {
      const a = e.charCodeAt(o + t.length + 1);
      if (a === 61) {
        const c = o + t.length + 2, l = e.indexOf("&", c);
        return ft(e.slice(c, l === -1 ? void 0 : l));
      } else if (a == 38 || isNaN(a))
        return "";
      o = e.indexOf(`&${t}`, o + 1);
    }
    if (n = /[%+]/.test(e), !n)
      return;
  }
  const s = {};
  n ?? (n = /[%+]/.test(e));
  let i = e.indexOf("?", 8);
  for (; i !== -1; ) {
    const o = e.indexOf("&", i + 1);
    let a = e.indexOf("=", i);
    a > o && o !== -1 && (a = -1);
    let c = e.slice(
      i + 1,
      a === -1 ? o === -1 ? void 0 : o : a
    );
    if (n && (c = ft(c)), i = o, c === "")
      continue;
    let l;
    a === -1 ? l = "" : (l = e.slice(a + 1, o === -1 ? void 0 : o), n && (l = ft(l))), r ? (s[c] && Array.isArray(s[c]) || (s[c] = []), s[c].push(l)) : s[c] ?? (s[c] = l);
  }
  return t ? s[t] : s;
}, ri = ln, ni = (e, t) => ln(e, t, !0), rt = decodeURIComponent, si = /^[\w!#$%&'*.^`|~+-]+$/, ii = /^[ !#-:<-[\]-~]*$/, oi = (e, t) => e.trim().split(";").reduce((n, s) => {
  s = s.trim();
  const i = s.indexOf("=");
  if (i === -1)
    return n;
  const o = s.substring(0, i).trim();
  if (t && t !== o || !si.test(o))
    return n;
  let a = s.substring(i + 1).trim();
  return a.startsWith('"') && a.endsWith('"') && (a = a.slice(1, -1)), ii.test(a) && (n[o] = rt(a)), n;
}, {}), ai = (e, t, r = {}) => {
  let n = `${e}=${t}`;
  return r && typeof r.maxAge == "number" && r.maxAge >= 0 && (n += `; Max-Age=${Math.floor(r.maxAge)}`), r.domain && (n += `; Domain=${r.domain}`), r.path && (n += `; Path=${r.path}`), r.expires && (n += `; Expires=${r.expires.toUTCString()}`), r.httpOnly && (n += "; HttpOnly"), r.secure && (n += "; Secure"), r.sameSite && (n += `; SameSite=${r.sameSite}`), r.partitioned && (n += "; Partitioned"), n;
}, ci = (e, t, r = {}) => (t = encodeURIComponent(t), ai(e, t, r)), un = (e, t) => {
  var n;
  if (!((n = e.callbacks) != null && n.length))
    return Promise.resolve(e);
  const r = e.callbacks;
  return t ? t[0] += e : t = [e], Promise.all(r.map((s) => s({ buffer: t }))).then(
    (s) => Promise.all(s.map((i) => un(i, t))).then(() => t[0])
  );
}, li = class {
  constructor(e) {
    this.writable = e, this.writer = e.getWriter(), this.encoder = new TextEncoder();
  }
  async write(e) {
    try {
      typeof e == "string" && (e = this.encoder.encode(e)), await this.writer.write(e);
    } catch {
    }
    return this;
  }
  async writeln(e) {
    return await this.write(e + `
`), this;
  }
  sleep(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  async close() {
    try {
      await this.writer.close();
    } catch {
    }
  }
  async pipe(e) {
    this.writer.releaseLock(), await e.pipeTo(this.writable, { preventClose: !0 }), this.writer = this.writable.getWriter();
  }
}, dn = (e, t, r) => {
  if (!t.has(e))
    throw TypeError("Cannot " + r);
}, f = (e, t, r) => (dn(e, t, "read from private field"), r ? r.call(e) : t.get(e)), we = (e, t, r) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, r);
}, S = (e, t, r, n) => (dn(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), gr = "text/plain; charset=UTF-8", Te, ee, y, v, q, te, Xe = class {
  constructor(e, t) {
    this.env = {}, this._var = {}, this.finalized = !1, this.error = void 0, we(this, Te, 200), we(this, ee, void 0), we(this, y, void 0), we(this, v, void 0), we(this, q, void 0), we(this, te, !0), this.renderer = (r) => this.html(r), this.notFoundHandler = () => new Response(), this.render = (...r) => this.renderer(...r), this.setRenderer = (r) => {
      this.renderer = r;
    }, this.header = (r, n, s) => {
      if (n === void 0) {
        f(this, y) ? f(this, y).delete(r) : f(this, v) && delete f(this, v)[r.toLocaleLowerCase()], this.finalized && this.res.headers.delete(r);
        return;
      }
      s != null && s.append ? (f(this, y) || (S(this, te, !1), S(this, y, new Headers(f(this, v))), S(this, v, {})), f(this, y).append(r, n)) : f(this, y) ? f(this, y).set(r, n) : (f(this, v) ?? S(this, v, {}), f(this, v)[r.toLowerCase()] = n), this.finalized && (s != null && s.append ? this.res.headers.append(r, n) : this.res.headers.set(r, n));
    }, this.status = (r) => {
      S(this, te, !1), S(this, Te, r);
    }, this.set = (r, n) => {
      this._var ?? (this._var = {}), this._var[r] = n;
    }, this.get = (r) => this._var ? this._var[r] : void 0, this.newResponse = (r, n, s) => {
      if (f(this, te) && !s && !n && f(this, Te) === 200)
        return new Response(r, {
          headers: f(this, v)
        });
      n && typeof n != "number" && (this.res = new Response(r, n));
      const i = typeof n == "number" ? n : n ? n.status : f(this, Te);
      f(this, v) ?? S(this, v, {}), f(this, y) ?? S(this, y, new Headers());
      for (const [o, a] of Object.entries(f(this, v)))
        f(this, y).set(o, a);
      if (f(this, q)) {
        f(this, q).headers.forEach((o, a) => {
          var c;
          (c = f(this, y)) == null || c.set(a, o);
        });
        for (const [o, a] of Object.entries(f(this, v)))
          f(this, y).set(o, a);
      }
      s ?? (s = {});
      for (const [o, a] of Object.entries(s))
        if (typeof a == "string")
          f(this, y).set(o, a);
        else {
          f(this, y).delete(o);
          for (const c of a)
            f(this, y).append(o, c);
        }
      return new Response(r, {
        status: i,
        headers: f(this, y)
      });
    }, this.body = (r, n, s) => typeof n == "number" ? this.newResponse(r, n, s) : this.newResponse(r, n), this.text = (r, n, s) => {
      if (!f(this, v)) {
        if (f(this, te) && !s && !n)
          return new Response(r);
        S(this, v, {});
      }
      return f(this, v)["content-type"] = gr, typeof n == "number" ? this.newResponse(r, n, s) : this.newResponse(r, n);
    }, this.json = (r, n, s) => {
      const i = JSON.stringify(r);
      return f(this, v) ?? S(this, v, {}), f(this, v)["content-type"] = "application/json; charset=UTF-8", typeof n == "number" ? this.newResponse(i, n, s) : this.newResponse(i, n);
    }, this.jsonT = (r, n, s) => this.json(r, n, s), this.html = (r, n, s) => (f(this, v) ?? S(this, v, {}), f(this, v)["content-type"] = "text/html; charset=UTF-8", typeof r == "object" && (r instanceof Promise || (r = r.toString()), r instanceof Promise) ? r.then((i) => un(i)).then((i) => typeof n == "number" ? this.newResponse(i, n, s) : this.newResponse(i, n)) : typeof n == "number" ? this.newResponse(r, n, s) : this.newResponse(r, n)), this.redirect = (r, n = 302) => (f(this, y) ?? S(this, y, new Headers()), f(this, y).set("Location", r), this.newResponse(null, n)), this.streamText = (r, n, s) => (s ?? (s = {}), this.header("content-type", gr), this.header("x-content-type-options", "nosniff"), this.header("transfer-encoding", "chunked"), this.stream(r, n, s)), this.stream = (r, n, s) => {
      const { readable: i, writable: o } = new TransformStream(), a = new li(o);
      return r(a).finally(() => a.close()), typeof n == "number" ? this.newResponse(i, n, s) : this.newResponse(i, n);
    }, this.cookie = (r, n, s) => {
      const i = ci(r, n, s);
      this.header("set-cookie", i, { append: !0 });
    }, this.notFound = () => this.notFoundHandler(this), this.req = e, t && (S(this, ee, t.executionCtx), this.env = t.env, t.notFoundHandler && (this.notFoundHandler = t.notFoundHandler));
  }
  get event() {
    if (f(this, ee) && "respondWith" in f(this, ee))
      return f(this, ee);
    throw Error("This context has no FetchEvent");
  }
  get executionCtx() {
    if (f(this, ee))
      return f(this, ee);
    throw Error("This context has no ExecutionContext");
  }
  get res() {
    return S(this, te, !1), f(this, q) || S(this, q, new Response("404 Not Found", { status: 404 }));
  }
  set res(e) {
    S(this, te, !1), f(this, q) && e && (f(this, q).headers.delete("content-type"), f(this, q).headers.forEach((t, r) => {
      e.headers.set(r, t);
    })), S(this, q, e), this.finalized = !0;
  }
  get var() {
    return { ...this._var };
  }
  get runtime() {
    var t, r;
    const e = globalThis;
    return (e == null ? void 0 : e.Deno) !== void 0 ? "deno" : (e == null ? void 0 : e.Bun) !== void 0 ? "bun" : typeof (e == null ? void 0 : e.WebSocketPair) == "function" ? "workerd" : typeof (e == null ? void 0 : e.EdgeRuntime) == "string" ? "edge-light" : (e == null ? void 0 : e.fastly) !== void 0 ? "fastly" : (e == null ? void 0 : e.__lagon__) !== void 0 ? "lagon" : ((r = (t = e == null ? void 0 : e.process) == null ? void 0 : t.release) == null ? void 0 : r.name) === "node" ? "node" : "other";
  }
};
Te = /* @__PURE__ */ new WeakMap();
ee = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
var mr = (e, t, r) => (n, s) => {
  let i = -1;
  return o(0);
  async function o(a) {
    if (a <= i)
      throw new Error("next() called multiple times");
    i = a;
    let c, l = !1, d;
    if (e[a] ? (d = e[a][0][0], n instanceof Xe && (n.req.routeIndex = a)) : d = a === e.length && s || void 0, !d)
      n instanceof Xe && n.finalized === !1 && r && (c = await r(n));
    else
      try {
        c = await d(n, () => o(a + 1));
      } catch (u) {
        if (u instanceof Error && n instanceof Xe && t)
          n.error = u, c = await t(u, n), l = !0;
        else
          throw u;
      }
    return c && (n.finalized === !1 || l) && (n.res = c), n;
  }
}, ui = class extends Error {
  constructor(e = 500, t) {
    super(t == null ? void 0 : t.message), this.res = t == null ? void 0 : t.res, this.status = e;
  }
  getResponse() {
    return this.res ? this.res : new Response(this.message, {
      status: this.status
    });
  }
}, di = (e) => Array.isArray(e), hi = async (e, t = {
  all: !1
}) => {
  let r = {};
  const n = e.headers.get("Content-Type");
  if (n && (n.startsWith("multipart/form-data") || n.startsWith("application/x-www-form-urlencoded"))) {
    const s = await e.formData();
    if (s) {
      const i = {};
      s.forEach((o, a) => {
        if (!(t.all || a.slice(-2) === "[]")) {
          i[a] = o;
          return;
        }
        if (i[a] && di(i[a])) {
          i[a].push(o);
          return;
        }
        if (i[a]) {
          i[a] = [i[a], o];
          return;
        }
        i[a] = o;
      }), r = i;
    }
  }
  return r;
}, hn = (e, t, r) => {
  if (!t.has(e))
    throw TypeError("Cannot " + r);
}, B = (e, t, r) => (hn(e, t, "read from private field"), r ? r.call(e) : t.get(e)), wr = (e, t, r) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, r);
}, _r = (e, t, r, n) => (hn(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), Pe, O, fi = class {
  constructor(e, t = "/", r = [[]]) {
    wr(this, Pe, void 0), wr(this, O, void 0), this.routeIndex = 0, this.bodyCache = {}, this.cachedBody = (n) => {
      const { bodyCache: s, raw: i } = this, o = s[n];
      return o || (s.arrayBuffer ? (async () => await new Response(s.arrayBuffer)[n]())() : s[n] = i[n]());
    }, this.raw = e, this.path = t, _r(this, O, r), _r(this, Pe, {});
  }
  param(e) {
    if (e) {
      const t = B(this, O)[1] ? B(this, O)[1][B(this, O)[0][this.routeIndex][1][e]] : B(this, O)[0][this.routeIndex][1][e];
      return t ? /\%/.test(t) ? rt(t) : t : void 0;
    } else {
      const t = {}, r = Object.keys(B(this, O)[0][this.routeIndex][1]);
      for (let n = 0, s = r.length; n < s; n++) {
        const i = r[n], o = B(this, O)[1] ? B(this, O)[1][B(this, O)[0][this.routeIndex][1][i]] : B(this, O)[0][this.routeIndex][1][i];
        o && typeof o == "string" && (t[i] = /\%/.test(o) ? rt(o) : o);
      }
      return t;
    }
  }
  query(e) {
    return ri(this.url, e);
  }
  queries(e) {
    return ni(this.url, e);
  }
  header(e) {
    if (e)
      return this.raw.headers.get(e.toLowerCase()) ?? void 0;
    const t = {};
    return this.raw.headers.forEach((r, n) => {
      t[n] = r;
    }), t;
  }
  cookie(e) {
    const t = this.raw.headers.get("Cookie");
    if (!t)
      return;
    const r = oi(t);
    return e ? r[e] : r;
  }
  async parseBody(e) {
    if (this.bodyCache.parsedBody)
      return this.bodyCache.parsedBody;
    const t = await hi(this, e);
    return this.bodyCache.parsedBody = t, t;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(e, t) {
    B(this, Pe)[e] = t;
  }
  valid(e) {
    return B(this, Pe)[e];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return B(this, O)[0].map(([[, e]]) => e);
  }
  get routePath() {
    return B(this, O)[0].map(([[, e]]) => e)[this.routeIndex].path;
  }
  get headers() {
    return this.raw.headers;
  }
  get body() {
    return this.raw.body;
  }
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  get integrity() {
    return this.raw.integrity;
  }
  get keepalive() {
    return this.raw.keepalive;
  }
  get referrer() {
    return this.raw.referrer;
  }
  get signal() {
    return this.raw.signal;
  }
};
Pe = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
var b = "ALL", pi = "all", fn = ["get", "post", "put", "delete", "options", "patch"], pn = "Can not add a route since the matcher is already built.", gn = class extends Error {
}, mn = (e, t, r) => {
  if (!t.has(e))
    throw TypeError("Cannot " + r);
}, Ye = (e, t, r) => (mn(e, t, "read from private field"), r ? r.call(e) : t.get(e)), gi = (e, t, r) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, r);
}, pt = (e, t, r, n) => (mn(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), mi = Symbol("composedHandler");
function wi() {
  return class {
  };
}
var _i = (e) => e.text("404 Not Found", 404), vr = (e, t) => {
  if (e instanceof ui)
    return e.getResponse();
  console.error(e);
  const r = "Internal Server Error";
  return t.text(r, 500);
}, G, wn = class extends wi() {
  constructor(e = {}) {
    super(), this._basePath = "/", gi(this, G, "/"), this.routes = [], this.notFoundHandler = _i, this.errorHandler = vr, this.onError = (n) => (this.errorHandler = n, this), this.notFound = (n) => (this.notFoundHandler = n, this), this.head = () => (console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method."), this), this.handleEvent = (n) => this.dispatch(n.request, n, void 0, n.request.method), this.fetch = (n, s, i) => this.dispatch(n, i, s, n.method), this.request = (n, s, i, o) => {
      if (n instanceof Request)
        return s !== void 0 && (n = new Request(n, s)), this.fetch(n, i, o);
      n = n.toString();
      const a = /^https?:\/\//.test(n) ? n : `http://localhost${$e("/", n)}`, c = new Request(a, s);
      return this.fetch(c, i, o);
    }, this.fire = () => {
      addEventListener("fetch", (n) => {
        n.respondWith(this.dispatch(n.request, n, void 0, n.request.method));
      });
    }, [...fn, pi].map((n) => {
      this[n] = (s, ...i) => (typeof s == "string" ? pt(this, G, s) : this.addRoute(n, Ye(this, G), s), i.map((o) => {
        typeof o != "string" && this.addRoute(n, Ye(this, G), o);
      }), this);
    }), this.on = (n, s, ...i) => {
      if (!n)
        return this;
      pt(this, G, s);
      for (const o of [n].flat())
        i.map((a) => {
          this.addRoute(o.toUpperCase(), Ye(this, G), a);
        });
      return this;
    }, this.use = (n, ...s) => (typeof n == "string" ? pt(this, G, n) : s.unshift(n), s.map((i) => {
      this.addRoute(b, Ye(this, G), i);
    }), this);
    const r = e.strict ?? !0;
    delete e.strict, Object.assign(this, e), this.getPath = r ? e.getPath ?? an : ti;
  }
  clone() {
    const e = new wn({
      router: this.router,
      getPath: this.getPath
    });
    return e.routes = this.routes, e;
  }
  route(e, t) {
    const r = this.basePath(e);
    return t ? (t.routes.map((n) => {
      let s;
      t.errorHandler === vr ? s = n.handler : (s = async (i, o) => (await mr([], t.errorHandler)(i, () => n.handler(i, o))).res, s[mi] = n.handler), r.addRoute(n.method, n.path, s);
    }), this) : r;
  }
  basePath(e) {
    const t = this.clone();
    return t._basePath = $e(this._basePath, e), t;
  }
  showRoutes() {
    this.routes.map((t) => {
      console.log(
        `\x1B[32m${t.method}\x1B[0m ${" ".repeat(8 - t.method.length)} ${t.path}`
      );
    });
  }
  mount(e, t, r) {
    const n = $e(this._basePath, e), s = n === "/" ? 0 : n.length, i = async (o, a) => {
      let c;
      try {
        c = o.executionCtx;
      } catch {
      }
      const l = r ? r(o) : [o.env, c], d = Array.isArray(l) ? l : [l], u = ei(o.req.url), h = await t(
        new Request(
          new URL((o.req.path.slice(s) || "/") + u, o.req.url),
          o.req.raw
        ),
        ...d
      );
      if (h)
        return h;
      await a();
    };
    return this.addRoute(b, $e(e, "*"), i), this;
  }
  get routerName() {
    return this.matchRoute("GET", "/"), this.router.name;
  }
  addRoute(e, t, r) {
    e = e.toUpperCase(), t = $e(this._basePath, t);
    const n = { path: t, method: e, handler: r };
    this.router.add(e, t, [r, n]), this.routes.push(n);
  }
  matchRoute(e, t) {
    return this.router.match(e, t);
  }
  handleError(e, t) {
    if (e instanceof Error)
      return this.errorHandler(e, t);
    throw e;
  }
  dispatch(e, t, r, n) {
    if (n === "HEAD")
      return (async () => new Response(null, await this.dispatch(e, t, r, "GET")))();
    const s = this.getPath(e, { env: r }), i = this.matchRoute(n, s), o = new Xe(new fi(e, s, i), {
      env: r,
      executionCtx: t,
      notFoundHandler: this.notFoundHandler
    });
    if (i[0].length === 1) {
      let c;
      try {
        if (c = i[0][0][0][0](o, async () => {
        }), !c)
          return this.notFoundHandler(o);
      } catch (l) {
        return this.handleError(l, o);
      }
      return c instanceof Response ? c : (async () => {
        let l;
        try {
          if (l = await c, !l)
            return this.notFoundHandler(o);
        } catch (d) {
          return this.handleError(d, o);
        }
        return l;
      })();
    }
    const a = mr(i[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const c = await a(o);
        if (!c.finalized)
          throw new Error(
            "Context is not finalized. You may forget returning Response object or `await next()`"
          );
        return c.res;
      } catch (c) {
        return this.handleError(c, o);
      }
    })();
  }
}, vi = wn;
G = /* @__PURE__ */ new WeakMap();
var nt = "[^/]+", Me = ".*", Be = "(?:|/.*)", Ce = Symbol();
function yi(e, t) {
  return e.length === 1 ? t.length === 1 ? e < t ? -1 : 1 : -1 : t.length === 1 || e === Me || e === Be ? 1 : t === Me || t === Be ? -1 : e === nt ? 1 : t === nt ? -1 : e.length === t.length ? e < t ? -1 : 1 : t.length - e.length;
}
var Tt = class {
  constructor() {
    this.children = {};
  }
  insert(t, r, n, s, i) {
    if (t.length === 0) {
      if (this.index !== void 0)
        throw Ce;
      if (i)
        return;
      this.index = r;
      return;
    }
    const [o, ...a] = t, c = o === "*" ? a.length === 0 ? ["", "", Me] : ["", "", nt] : o === "/*" ? ["", "", Be] : o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let l;
    if (c) {
      const d = c[1];
      let u = c[2] || nt;
      if (d && c[2] && (u = u.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(u)))
        throw Ce;
      if (l = this.children[u], !l) {
        if (Object.keys(this.children).some(
          (h) => h !== Me && h !== Be
        ))
          throw Ce;
        if (i)
          return;
        l = this.children[u] = new Tt(), d !== "" && (l.varIndex = s.varIndex++);
      }
      !i && d !== "" && n.push([d, l.varIndex]);
    } else if (l = this.children[o], !l) {
      if (Object.keys(this.children).some(
        (d) => d.length > 1 && d !== Me && d !== Be
      ))
        throw Ce;
      if (i)
        return;
      l = this.children[o] = new Tt();
    }
    l.insert(a, r, n, s, i);
  }
  buildRegExpStr() {
    const r = Object.keys(this.children).sort(yi).map((n) => {
      const s = this.children[n];
      return (typeof s.varIndex == "number" ? `(${n})@${s.varIndex}` : n) + s.buildRegExpStr();
    });
    return typeof this.index == "number" && r.unshift(`#${this.index}`), r.length === 0 ? "" : r.length === 1 ? r[0] : "(?:" + r.join("|") + ")";
  }
}, Ei = class {
  constructor() {
    this.context = { varIndex: 0 }, this.root = new Tt();
  }
  insert(e, t, r) {
    const n = [], s = [];
    for (let o = 0; ; ) {
      let a = !1;
      if (e = e.replace(/\{[^}]+\}/g, (c) => {
        const l = `@\\${o}`;
        return s[o] = [l, c], o++, a = !0, l;
      }), !a)
        break;
    }
    const i = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let o = s.length - 1; o >= 0; o--) {
      const [a] = s[o];
      for (let c = i.length - 1; c >= 0; c--)
        if (i[c].indexOf(a) !== -1) {
          i[c] = i[c].replace(a, s[o][1]);
          break;
        }
    }
    return this.root.insert(i, t, n, this.context, r), n;
  }
  buildRegExp() {
    let e = this.root.buildRegExpStr();
    if (e === "")
      return [/^$/, [], []];
    let t = 0;
    const r = [], n = [];
    return e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (s, i, o) => typeof i < "u" ? (r[++t] = Number(i), "$()") : (typeof o < "u" && (n[Number(o)] = ++t), "")), [new RegExp(`^${e}`), r, n];
  }
}, gt = [b, ...fn].map((e) => e.toUpperCase()), _n = [], bi = [/^$/, [], {}], Pt = {};
function vn(e) {
  return Pt[e] ?? (Pt[e] = new RegExp(
    e === "*" ? "" : `^${e.replace(/\/\*/, "(?:|/.*)")}$`
  ));
}
function xi() {
  Pt = {};
}
function Ni(e) {
  var l;
  const t = new Ei(), r = [];
  if (e.length === 0)
    return bi;
  const n = e.map(
    (d) => [!/\*|\/:/.test(d[0]), ...d]
  ).sort(
    ([d, u], [h, p]) => d ? 1 : h ? -1 : u.length - p.length
  ), s = {};
  for (let d = 0, u = -1, h = n.length; d < h; d++) {
    const [p, _, w] = n[d];
    p ? s[_] = [w.map(([E]) => [E, {}]), _n] : u++;
    let R;
    try {
      R = t.insert(_, u, p);
    } catch (E) {
      throw E === Ce ? new gn(_) : E;
    }
    p || (r[u] = w.map(([E, I]) => {
      const j = {};
      for (I -= 1; I >= 0; I--) {
        const [N, X] = R[I];
        j[N] = X;
      }
      return [E, j];
    }));
  }
  const [i, o, a] = t.buildRegExp();
  for (let d = 0, u = r.length; d < u; d++)
    for (let h = 0, p = r[d].length; h < p; h++) {
      const _ = (l = r[d][h]) == null ? void 0 : l[1];
      if (!_)
        continue;
      const w = Object.keys(_);
      for (let R = 0, E = w.length; R < E; R++)
        _[w[R]] = a[_[w[R]]];
    }
  const c = [];
  for (const d in o)
    c[d] = r[o[d]];
  return [i, c, s];
}
function _e(e, t) {
  if (e) {
    for (const r of Object.keys(e).sort((n, s) => s.length - n.length))
      if (vn(r).test(t))
        return [...e[r]];
  }
}
var $i = class {
  constructor() {
    this.name = "RegExpRouter", this.middleware = { [b]: {} }, this.routes = { [b]: {} };
  }
  add(e, t, r) {
    var n;
    const { middleware: s, routes: i } = this;
    if (!s || !i)
      throw new Error(pn);
    gt.indexOf(e) === -1 && gt.push(e), s[e] || [s, i].forEach((c) => {
      c[e] = {}, Object.keys(c[b]).forEach((l) => {
        c[e][l] = [...c[b][l]];
      });
    }), t === "/*" && (t = "*");
    const o = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      const c = vn(t);
      e === b ? Object.keys(s).forEach((l) => {
        var d;
        (d = s[l])[t] || (d[t] = _e(s[l], t) || _e(s[b], t) || []);
      }) : (n = s[e])[t] || (n[t] = _e(s[e], t) || _e(s[b], t) || []), Object.keys(s).forEach((l) => {
        (e === b || e === l) && Object.keys(s[l]).forEach((d) => {
          c.test(d) && s[l][d].push([r, o]);
        });
      }), Object.keys(i).forEach((l) => {
        (e === b || e === l) && Object.keys(i[l]).forEach(
          (d) => c.test(d) && i[l][d].push([r, o])
        );
      });
      return;
    }
    const a = cn(t) || [t];
    for (let c = 0, l = a.length; c < l; c++) {
      const d = a[c];
      Object.keys(i).forEach((u) => {
        var h;
        (e === b || e === u) && ((h = i[u])[d] || (h[d] = [
          ..._e(s[u], d) || _e(s[b], d) || []
        ]), i[u][d].push([
          r,
          a.length === 2 && c === 0 ? o - 1 : o
        ]));
      });
    }
  }
  match(e, t) {
    xi();
    const r = this.buildAllMatchers();
    return this.match = (n, s) => {
      const i = r[n], o = i[2][s];
      if (o)
        return o;
      const a = s.match(i[0]);
      if (!a)
        return [[], _n];
      const c = a.indexOf("", 1);
      return [i[1][c], a];
    }, this.match(e, t);
  }
  buildAllMatchers() {
    const e = {};
    return gt.forEach((t) => {
      e[t] = this.buildMatcher(t) || e[b];
    }), this.middleware = this.routes = void 0, e;
  }
  buildMatcher(e) {
    const t = [];
    let r = e === b;
    return [this.middleware, this.routes].forEach((n) => {
      const s = n[e] ? Object.keys(n[e]).map((i) => [i, n[e][i]]) : [];
      s.length !== 0 ? (r || (r = !0), t.push(...s)) : e !== b && t.push(
        ...Object.keys(n[b]).map((i) => [i, n[b][i]])
      );
    }), r ? Ni(t) : null;
  }
}, Ri = class {
  constructor(e) {
    this.name = "SmartRouter", this.routers = [], this.routes = [], Object.assign(this, e);
  }
  add(e, t, r) {
    if (!this.routes)
      throw new Error(pn);
    this.routes.push([e, t, r]);
  }
  match(e, t) {
    if (!this.routes)
      throw new Error("Fatal error");
    const { routers: r, routes: n } = this, s = r.length;
    let i = 0, o;
    for (; i < s; i++) {
      const a = r[i];
      try {
        n.forEach((c) => {
          a.add(...c);
        }), o = a.match(e, t);
      } catch (c) {
        if (c instanceof gn)
          continue;
        throw c;
      }
      this.match = a.match.bind(a), this.routers = [a], this.routes = void 0;
      break;
    }
    if (i === s)
      throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, o;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1)
      throw new Error("No active router has been determined yet.");
    return this.routers[0];
  }
}, yn = class {
  constructor(e, t, r) {
    if (this.order = 0, this.params = {}, this.children = r || {}, this.methods = [], this.name = "", e && t) {
      const n = {};
      n[e] = { handler: t, possibleKeys: [], score: 0, name: this.name }, this.methods = [n];
    }
    this.patterns = [];
  }
  insert(e, t, r) {
    this.name = `${e} ${t}`, this.order = ++this.order;
    let n = this;
    const s = Zs(t), i = [], o = [];
    for (let l = 0, d = s.length; l < d; l++) {
      const u = s[l];
      if (Object.keys(n.children).includes(u)) {
        o.push(...n.patterns), n = n.children[u];
        const p = pr(u);
        p && i.push(p[1]);
        continue;
      }
      n.children[u] = new yn();
      const h = pr(u);
      h && (n.patterns.push(h), o.push(...n.patterns), i.push(h[1])), o.push(...n.patterns), n = n.children[u];
    }
    n.methods.length || (n.methods = []);
    const a = {}, c = {
      handler: r,
      possibleKeys: i,
      name: this.name,
      score: this.order
    };
    return a[e] = c, n.methods.push(a), n;
  }
  gHSets(e, t, r) {
    const n = [];
    for (let s = 0, i = e.methods.length; s < i; s++) {
      const o = e.methods[s], a = o[t] || o[b];
      a !== void 0 && (a.params = {}, a.possibleKeys.map((c) => {
        a.params[c] = r[c];
      }), n.push(a));
    }
    return n;
  }
  search(e, t) {
    const r = [], n = {};
    this.params = {};
    let i = [this];
    const o = Xs(t);
    for (let c = 0, l = o.length; c < l; c++) {
      const d = o[c], u = c === l - 1, h = [];
      for (let p = 0, _ = i.length; p < _; p++) {
        const w = i[p], R = w.children[d];
        R && (R.params = w.params, u === !0 ? (R.children["*"] && r.push(...this.gHSets(R.children["*"], e, w.params)), r.push(...this.gHSets(R, e, w.params))) : h.push(R));
        for (let E = 0, I = w.patterns.length; E < I; E++) {
          const j = w.patterns[E];
          if (j === "*") {
            const ct = w.children["*"];
            ct && (r.push(...this.gHSets(ct, e, w.params)), h.push(ct));
            continue;
          }
          if (d === "")
            continue;
          const [N, X, g] = j, F = w.children[N], Ve = o.slice(c).join("/");
          if (g instanceof RegExp && g.test(Ve)) {
            n[X] = Ve, r.push(...this.gHSets(F, e, { ...n, ...w.params }));
            continue;
          }
          (g === !0 || g instanceof RegExp && g.test(d)) && typeof N == "string" && (n[X] = d, u === !0 ? (r.push(...this.gHSets(F, e, { ...n, ...w.params })), F.children["*"] && r.push(
            ...this.gHSets(F.children["*"], e, { ...n, ...w.params })
          )) : (F.params = { ...n }, h.push(F)));
        }
      }
      i = h;
    }
    return [r.sort((c, l) => c.score - l.score).map(({ handler: c, params: l }) => [c, l])];
  }
}, Si = class {
  constructor() {
    this.name = "TrieRouter", this.node = new yn();
  }
  add(e, t, r) {
    const n = cn(t);
    if (n) {
      for (const s of n)
        this.node.insert(e, s, r);
      return;
    }
    this.node.insert(e, t, r);
  }
  match(e, t) {
    return this.node.search(e, t);
  }
}, En = class extends vi {
  constructor(e = {}) {
    super(e), this.router = e.router ?? new Ri({
      routers: [new $i(), new Si()]
    });
  }
};
async function Ti(e, t) {
  var s, i, o;
  let r = "";
  if (t != null && t.siyuanPrefix)
    r = t.siyuanPrefix;
  else
    for (let a = 0; a < e.level; a++)
      r += "../";
  const n = "2.10.5";
  return `<!DOCTYPE html>
<html lang="zh_CN" data-theme-mode="light" data-light-theme="daylight" data-dark-theme="midnight">
<head>
  ${((s = t == null ? void 0 : t.embedCode) == null ? void 0 : s.head) ?? ""}
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <link rel="stylesheet" type="text/css" id="baseStyle" href="${r}stage/build/export/base.css?${n}"/>
  <script>
  function isNightTime() {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour < 6;
  }
  document.write('<link rel="stylesheet" type="text/css" id="themeDefaultStyle" href="${r}appearance/themes/'+(isNightTime()?'midnight':'daylight')+'/theme.css?${n}"/>');
  <\/script>
  <link rel="stylesheet" type="text/css" href="${r}appearance/oceanpress.css"/>
  <title>${e.title}</title>
</head>
<body>
  ${((i = t == null ? void 0 : t.embedCode) == null ? void 0 : i.beforeBody) ?? ""}
  <div class="protyle-wysiwyg protyle-wysiwyg--attr" id="preview">
  ${e.htmlContent}
  </div>
  <script src="${r}appearance/icons/material/icon.js?${n}"><\/script>
  <script src="${r}stage/build/export/protyle-method.js?${n}"><\/script>
  <script src="${r}stage/protyle/js/lute/lute.min.js?${n}"><\/script>
  <script>
    window.siyuan = {
      config: {
        appearance: {
          mode: isNightTime()?1:0,//主题 明亮=0 暗黑=1
          codeBlockThemeDark: "base16/dracula",
          codeBlockThemeLight: "github",
        },
        editor: {
          codeLineWrap: true,
          codeLigatures: false,
          plantUMLServePath: "https://www.plantuml.com/plantuml/svg/~1",
          codeSyntaxHighlightLineNum: true,
          katexMacros: JSON.stringify({}),
        },
      },
      languages: { copy: "复制" },
    };
    const cdn = "${r}stage/protyle";
    const previewElement = document.getElementById("preview");

    Protyle.highlightRender(previewElement, cdn);
    Protyle.mathRender(previewElement, cdn, false);
    Protyle.mermaidRender(previewElement, cdn);
    Protyle.flowchartRender(previewElement, cdn);
    Protyle.graphvizRender(previewElement, cdn);
    Protyle.chartRender(previewElement, cdn);
    Protyle.mindmapRender(previewElement, cdn);
    Protyle.abcRender(previewElement, cdn);
    Protyle.htmlRender(previewElement);
    Protyle.plantumlRender(previewElement, cdn);
    document.querySelectorAll(".protyle-action__copy").forEach((item) => {
      item.addEventListener("click", (event) => {
        navigator.clipboard.writeText(
          item.parentElement.nextElementSibling.textContent.trimEnd(),
        );
        event.preventDefault();
        event.stopPropagation();
      });
    });
  <\/script>
  ${((o = t == null ? void 0 : t.embedCode) == null ? void 0 : o.afterBody) ?? ""}
</body>
</html>`;
}
function Pi(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos");
}
function yr(e) {
  return e.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (t, r) => String.fromCharCode(Number(r)));
}
async function z(e, t = Ci()) {
  var n, s;
  if (e === void 0)
    return "";
  const r = {
    ...t,
    /** 避免让所有的 renderInstance.nodeStack 是同一个对象 ，所以这里创建一个新 []  */
    nodeStack: [...t.nodeStack]
  };
  if (t.nodeStack.find(
    (i) => i.ID && e.ID && i.ID === e.ID
  ))
    return Ae(
      "循环引用",
      [...t.nodeStack, e].map((i) => i.ID)
    );
  if (r[e.Type] === void 0)
    return Ae(
      `没有找到对应的渲染器 ${e.Type}  ${(n = r.nodeStack[0].Properties) == null ? void 0 : n.title}`
    );
  {
    if (r.nodeStack.push(e), e.ID && ((s = t.nodeStack[0]) != null && s.ID)) {
      const o = await k.getDocByChildID(e.ID), a = t.nodeStack[0];
      (o == null ? void 0 : o.ID) !== void 0 && o.ID !== a.ID && a.ID && r.refs.add(o.ID);
    }
    const i = await r[e.Type](e);
    return r.nodeStack.pop(), i;
  }
}
function Ae(e, ...t) {
  return De(e, ...t), `<div class="ft__smaller ft__secondary b3-form__space--small">${e}</div>`;
}
function bn(e) {
  var r, n;
  const t = atob(
    e.CodeBlockInfo ?? ((n = (r = e.Children) == null ? void 0 : r.find((s) => s.Type === "NodeCodeBlockFenceInfoMarker")) == null ? void 0 : n.CodeBlockInfo) ?? ""
  );
  return [
    [
      "mindmap",
      "mermaid",
      "echarts",
      "abc",
      "graphviz",
      "flowchart",
      "plantuml"
    ].includes(t),
    t
  ];
}
const ce = String.raw;
async function H(e, t) {
  let r = "";
  for await (const n of (e == null ? void 0 : e.Children) ?? [])
    r += await z(n, t);
  return r;
}
function $(e, t = {}) {
  var s, i, o, a, c;
  (t == null ? void 0 : t.subtype_class) === void 0 && (t.subtype_class = (() => {
    var d, u;
    const l = ((d = e.ListData) == null ? void 0 : d.Typ) === 1 ? (
      /** 有序列表 */
      "o"
    ) : ((u = e.ListData) == null ? void 0 : u.Typ) === 3 ? (
      /** 任务列表 */
      "t"
    ) : (
      /** 无序列表 */
      "u"
    );
    if (e.Type === "NodeDocument")
      return "h1";
    if (e.Type === "NodeHeading")
      return `h${e.HeadingLevel}`;
    if (e.Type === "NodeList")
      return [l, "list"];
    if (e.Type === "NodeListItem")
      return [l, "li"];
    if (e.Type === "NodeParagraph")
      return ["", "p"];
    if (e.Type === "NodeImage")
      return ["", "img"];
    if (e.Type === "NodeBlockquote")
      return ["", "bq"];
    if (e.Type === "NodeSuperBlock")
      return ["", "sb"];
    if (e.Type === "NodeCodeBlock") {
      const [h, p] = bn(e);
      return h ? [p, "render-node"] : ["", "code-block"];
    } else
      return e.Type === "NodeTable" ? ["", "table"] : e.Type === "NodeThematicBreak" ? ["", "hr"] : e.Type === "NodeMathBlock" ? ["math", "render-node"] : e.Type === "NodeIFrame" ? ["", "iframe"] : e.Type === "NodeVideo" ? ["", "iframe"] : "";
  })());
  const r = {};
  function n(l, d) {
    r[l] = d;
  }
  return e.ID && (n("id", e.ID), n("data-node-id", e.ID)), (e == null ? void 0 : e.TextMarkType) === "tag" ? n("data-type", e.TextMarkType ?? "") : n("data-type", (t == null ? void 0 : t.data_type) ?? e.Type), (s = e.Properties) != null && s.updated && n("updated", e.Properties.updated), t != null && t.subtype_class && (typeof t.subtype_class == "string" ? (n("data-subtype", t.subtype_class), n("class", t.subtype_class)) : (t.subtype_class[0] !== "" && n("data-subtype", t.subtype_class[0]), t.subtype_class[1] !== "" && n("class", t.subtype_class[1]))), e.Properties && Object.entries(e.Properties).forEach(([l, d]) => n(l, d)), (i = e.ListData) != null && i.Marker && n("data-marker", atob(e.ListData.Marker)), /** 任务列表 */
  ((o = e.ListData) == null ? void 0 : o.Typ) === 3 && /** 该项被选中 */
  ((c = (a = e.Children) == null ? void 0 : a.find(
    (l) => l.Type === "NodeTaskListItemMarker"
  )) != null && c.TaskListItemChecked) && (r.class = (r.class ?? "") + " protyle-task--done "), delete r.fold, e.Type === "NodeDocument" && delete r.title, Object.entries(r).map(([l, d]) => `${l}="${d}"`).join(" ");
}
const A = async (e) => "", mt = async (e) => e.Data ?? "", Ci = () => ({
  ...Di,
  nodeStack: [],
  refs: /* @__PURE__ */ new Set()
}), Di = {
  nodeStack: [],
  refs: /* @__PURE__ */ new Set(),
  async getTopPathPrefix() {
    const e = this.nodeStack[0];
    let t = ".";
    if (e.Type === "NodeDocument" && e.ID) {
      const r = await k.getDocPathBySY(e);
      if (r) {
        const n = r.split("/").length - 3;
        for (let s = 0; s < n; s++)
          t += "/..";
      }
      return t;
    } else
      return console.log("未定义顶层元素非 NodeDocument 时的处理方式", e), "";
  },
  async NodeDocument(e) {
    var r, n, s, i, o;
    let t = "";
    return (
      /** 只有顶层的文档块才渲染题图 */
      this.nodeStack.length === 1 && (t += `<div style="min-height: 150px;" ${$(e)}>`, (r = e.Properties) != null && r["title-img"] && (t += `<div class="protyle-background__img" style="margin-bottom: 30px;position: relative;height: 16vh;${(n = e.Properties) == null ? void 0 : n["title-img"]}"/>${(s = e.Properties) != null && s.icon ? `<div style="position: absolute;bottom:-10px;left:15px;height: 80px;width: 80px;transition: var(--b3-transition);cursor: pointer;font-size: 68px;line-height: 80px;text-align: center;font-family: var(--b3-font-family-emoji);margin-right: 16px;"> &#x${(i = e.Properties) == null ? void 0 : i.icon} </div>` : ""}</div>`), t += "</div>", t += `<div ${$(e)} data-type="NodeHeading" class="h1">${(o = e.Properties) == null ? void 0 : o.title}</div>`), t += await H(e, this), t
    );
  },
  async NodeHeading(e) {
    let t = `<div ${$(e)}><div>${await H(
      e,
      this
    )}</div></div>`;
    const r = this.nodeStack[
      this.nodeStack.length - 2
      /** 最后一个元素是 sy本身(NodeHeading)还得要往前一个，所以是2 */
    ];
    if ((r == null ? void 0 : r.Type) === "NodeBlockQueryEmbedScript") {
      let n = !1;
      for (const s of e.Parent.Children ?? [])
        s === e ? n = !0 : s !== e && s.Type === "NodeHeading" ? n = !1 : n && (t += `
` + await z(s, this));
    }
    return t;
  },
  NodeText: mt,
  async NodeList(e) {
    return ce`<div ${$(e)}>${await H(e, this)}</div>`;
  },
  async NodeListItem(e) {
    var t, r, n, s, i;
    return ce`<div ${await $(e)}>
      <div class="protyle-action">
        ${((t = e.ListData) == null ? void 0 : t.Typ) === 1 ? (
      /** 有序列表 */
      atob(((r = e.ListData) == null ? void 0 : r.Marker) ?? "")
    ) : ((n = e.ListData) == null ? void 0 : n.Typ) === 3 ? (
      /** 任务列表 */
      `<svg><use xlink:href="#${(i = (s = e.Children) == null ? void 0 : s.find((o) => o.Type === "NodeTaskListItemMarker")) != null && i.TaskListItemChecked ? "iconCheck" : "iconUncheck"}"></use></svg>`
    ) : (
      /** 无序列表 */
      '<svg><use xlink:href="#iconDot"></use></svg>'
    )}
      </div>
      ${await H(e, this)}
    </div>`;
  },
  NodeTaskListItemMarker: A,
  async NodeParagraph(e) {
    return ce`<div ${$(e)}>${await H(e, this)}</div>`;
  },
  async NodeTextMark(e) {
    var s;
    const t = this;
    let r = "";
    for (const i of (((s = e.TextMarkType) == null ? void 0 : s.split(" ")) ?? []).reverse())
      r === "" ? r = await n(e, i, e.TextMarkTextContent ?? "") : r = await n(e, i, r);
    return r;
    async function n(i, o, a) {
      var c;
      if (o === "inline-math")
        return `<span data-type="inline-math" data-subtype="math" data-content="${i.TextMarkInlineMathContent}" class="render-node"></span>`;
      if (o === "inline-memo")
        return `${a}<sup>（${i.TextMarkInlineMemoContent}）</sup>`;
      if (o === "block-ref") {
        let l = "";
        if (i.TextMarkBlockRefID) {
          const d = await k.getDocByChildID(i.TextMarkBlockRefID);
          d != null && d.ID ? (l = `${await t.getTopPathPrefix()}${await k.getHPathByID_Node(
            d
          )}.html#${i.TextMarkBlockRefID}`, t.refs.add(d.ID)) : De("未查找到所指向的文档节点", i);
        } else
          De("未查找到所指向的文档节点", i);
        return `<span data-type="${i.TextMarkType}"     data-subtype="${/** "s" */
        i.TextMarkBlockRefSubtype}"     data-id="${/** 被引用块的id */
        i.TextMarkBlockRefID}">
          <a href="${l}">${a}</a>
  </span>`;
      } else if (o === "a") {
        let l = i.TextMarkAHref;
        return l != null && l.startsWith("assets/") && (l = `${await t.getTopPathPrefix()}/${l}`), `<a href="${l}">${a}</a>`;
      } else
        return "strong em u s mark sup sub kbd tag code strong code text".includes(
          o ?? ""
        ) ? `<span ${$(i, { data_type: o })}>${a}</span>` : Ae(
          `没有找到对应的渲染器 ${i.TextMarkType}  ${(c = t.nodeStack[0].Properties) == null ? void 0 : c.title}`
        );
    }
  },
  async NodeImage(e) {
    var i, o, a, c;
    let t = "";
    const r = (i = e.Children) == null ? void 0 : i.filter((l) => l.Type === "NodeLinkDest");
    (r == null ? void 0 : r.length) === 1 ? t = await z(r[0], this) : r != null && r.length && r.length > 1 && De("NodeImage 存在多个 LinkDest", e);
    let n = "";
    const s = (o = e.Children) == null ? void 0 : o.filter((l) => l.Type === "NodeLinkTitle");
    return (s == null ? void 0 : s.length) === 1 ? n = await z(s[0], this) : s != null && s.length && s.length > 1 && De("NodeImage 存在多个 LinkTitle", e), ce`<span ${await $(e)} style="${(a = e.Properties) == null ? void 0 : a["parent-style"]}"
      ><img
        src="${t}"
        data-src="${t}"
        title="${n}"
        style="${(c = e.Properties) == null ? void 0 : c.style}"
        loading="lazy"
      /><span class="protyle-action__title">${n}</span></span
    >`;
  },
  async NodeLinkDest(e) {
    return /^(?:[a-z]+:)?\/\/|^(?:\/)/.test(e.Data ?? "") ? e.Data ?? "" : `${await this.getTopPathPrefix()}/${e.Data}`;
  },
  NodeLinkTitle: mt,
  NodeKramdownSpanIAL: A,
  async NodeSuperBlock(e) {
    return ce`<div
      ${$(e)}
      data-sb-layout="${Er(e, "NodeSuperBlockLayoutMarker")}"
    >
      ${await H(e, this)}
    </div>`;
  },
  NodeSuperBlockOpenMarker: A,
  NodeSuperBlockCloseMarker: A,
  NodeSuperBlockLayoutMarker: A,
  async NodeBlockQueryEmbed(e) {
    return `<div ${$(e)} data-type="NodeBlockquote" class="bq">${await H(e, this)}</div>`;
  },
  NodeOpenBrace: A,
  NodeCloseBrace: A,
  async NodeBlockQueryEmbedScript(e) {
    const t = e.Data;
    if (!t)
      return console.log("no sql", e), ce`<pre>${t}</pre>`;
    let r = "";
    const n = await Kt.query_sql({
      stmt: (
        /** sql 被思源转义了，类似 ：SELECT * FROM blocks WHERE id = &#39;20201227174241-nxny1tq&#39;
        所以这里将它转义回来
        TODO 当用户确实使用了包含转义的字符串时，这个实现是错误的 */
        yr(
          t
        ).replace(
          /** 我不理解lute为什么这样实现 https://github.com/88250/lute/blob/HEAD/editor/const.go#L38
           * https://ld246.com/article/1696750832289
           */
          /_esc_newline_/g,
          `
`
        )
      )
    }).catch((s) => {
      throw new Error(
        `sql error: ${s.message}
rawSql:${t}
unescapingSql:${yr(
          t
        )}`
      );
    });
    for (const s of n) {
      const i = await k.getNodeByID(s.id);
      if (i === void 0)
        return Ae("跨笔记引用", s.id, t, i);
      r += await z(i, this);
    }
    return r;
  },
  async NodeBlockquote(e) {
    return ce`<div ${$(e)}>${await H(e, this)}</div>`;
  },
  NodeBlockquoteMarker: A,
  NodeCodeBlock: async (e) => {
    var n, s, i, o;
    const [t, r] = bn(e);
    return t ? `<div ${$(e)} data-content="${Pi(
      ((s = (n = e.Children) == null ? void 0 : n.find((a) => a.Type === "NodeCodeBlockCode")) == null ? void 0 : s.Data) ?? ""
    )}">
        <div spin="1"></div>
        <div class="protyle-attr" contenteditable="false"></div>
      </div>` : `<div ${$(e)}>
        <div class="protyle-action">
          <span class="protyle-action--first protyle-action__language">${await z(
      (i = e.Children) == null ? void 0 : i.find(
        (a) => a.Type === "NodeCodeBlockFenceInfoMarker"
      ),
      void 0
    )}</span>
          <span class="fn__flex-1"></span><span class="protyle-icon protyle-icon--only protyle-action__copy"><svg><use xlink:href="#iconCopy"></use></svg></span>
        </div>
        ${await z(
      (o = e.Children) == null ? void 0 : o.find((a) => a.Type === "NodeCodeBlockCode"),
      void 0
    )}
      </div>`;
  },
  NodeCodeBlockFenceInfoMarker: async (e) => atob(e.CodeBlockInfo ?? ""),
  NodeCodeBlockCode: async (e) => `<div class="hljs" spellcheck="false">${e.Data}</div>`,
  NodeCodeBlockFenceOpenMarker: A,
  NodeCodeBlockFenceCloseMarker: A,
  async NodeTable(e) {
    var t, r, n;
    return `<div ${$(e)}>
    <div>
      <table spellcheck="false">
        <colgroup>
        ${(t = e.TableAligns) == null ? void 0 : t.map(() => "<col />").join("")}
        </colgroup>
        ${await z(
      (r = e.Children) == null ? void 0 : r.find((s) => s.Type === "NodeTableHead"),
      this
    )}
        <tbody>
        ${(await Promise.all(
      ((n = e.Children) == null ? void 0 : n.filter((s) => s.Type === "NodeTableRow").map(
        (s) => z(s, this)
      )) ?? []
    )).join(`
`)}
        </tbody>
      </table>
    </div>
  </div>`;
  },
  async NodeTableHead(e) {
    return `<${e.Data}>${await H(e, this)}</${e.Data}>`;
  },
  async NodeTableRow(e) {
    return `<tr>${await H(e, this)}</tr>`;
  },
  async NodeTableCell(e) {
    return `<td>${await H(e, this)}</td>`;
  },
  NodeHTMLBlock: async (e) => `<div ${$(e)}>${e.Data}</div>`,
  NodeThematicBreak: async (e) => `<div ${$(e)}><div></div></div>`,
  NodeMathBlock: async (e) => `<div ${$(
    e
  )} data-content="${Er(e, "NodeMathBlockContent")}">
    <div spin="1"></div>
  </div>`,
  NodeMathBlockOpenMarker: A,
  NodeMathBlockCloseMarker: A,
  async NodeIFrame(e) {
    var t;
    return ` <div ${$(e)}>
    <div class="iframe-content">
    ${/** 资源总是被复制到顶层目录，所以直接跳到顶层即可 */
    /** TODO 应该有一个统一处理资源的方案 */
    (t = e.Data) == null ? void 0 : t.replace(
      /src="assets\//,
      `src="${await this.getTopPathPrefix()}/assets/`
    )}
    </div>
  </div>`;
  },
  async NodeVideo(e) {
    return await this.NodeIFrame(e);
  },
  async NodeAudio(e) {
    return await this.NodeIFrame(e);
  },
  /** 虚拟链接 */
  NodeHeadingC8hMarker: A,
  async NodeSoftBreak(e) {
    return "​";
  },
  async NodeBr(e) {
    return `<${e.Data}>`;
  },
  async NodeWidget(e) {
    return `<div ${$(
      e
    )}><img src="${await this.getTopPathPrefix()}/assets/widget/${e.ID}.jpg"/></div>`;
  },
  async NodeBackslash(e) {
    var t;
    return e.Data === void 0 || e.Data === "span" ? `${await H(e, this)}` : Ae(
      `未定义的 NodeBackslash 处理 ${e.Data}`,
      (t = this.nodeStack[0].Properties) == null ? void 0 : t.title
    );
  },
  NodeBackslashContent: mt
};
function Er(e, t) {
  var r, n;
  return (n = (r = e.Children) == null ? void 0 : r.find((s) => s.Type === t)) == null ? void 0 : n.Data;
}
function De(...e) {
  console.warn(`
`, ...e);
}
function Ii() {
  const e = new En();
  return e.use(async (t, r) => {
    console.log("请求到达");
    try {
      await r();
    } catch (n) {
      console.log(n);
    }
  }), e.get("/", (t) => t.redirect("/index.html")), e.get("/assets/*", async (t) => {
    const r = t.req.path, n = await fetch(`${fe.value.apiPrefix}${r}`, {
      headers: {
        Authorization: `Token ${fe.value.authorized}`
      },
      method: "GET"
    });
    return n.body ? t.stream(
      async (s) => {
        const i = n.body.getReader();
        for (console.log(r); ; ) {
          const o = await i.read();
          if (o.done) {
            s.close();
            break;
          } else
            s.write(o.value);
        }
      },
      200,
      {
        "content-type": n.headers.get("content-type")
      }
    ) : t.text("Not Found", 404, { "Content-Type": "text/plain" });
  }), e.get("*", async (t) => {
    const r = decodeURIComponent(t.req.path), n = await Oi(r).catch((s) => (console.log("err"), s.message));
    if (n instanceof Error)
      throw n;
    return t.html(n);
  }), e;
}
async function Oi(e) {
  var n;
  const t = decodeURIComponent(e).replace(/\#(.*)?$/, "").replace(/\.html$/, "");
  console.log(fe.value);
  const r = await rn(t);
  return await Ti(
    {
      title: ((n = r.Properties) == null ? void 0 : n.title) || "",
      htmlContent: await z(r),
      level: e.split("/").length - 1
    },
    {
      ...fe.value.cdn,
      embedCode: fe.value.embedCode
    }
  );
}
k.getItem = Mi;
k.setItem = ki;
Ys(!1);
function ki(e, t) {
  console.log(e);
}
function Mi(e) {
}
const Bi = Ii(), Le = new En();
Le.use("*", async (e, t) => {
  await t();
});
Le.post("/preview/page/configs", async (e) => {
  const t = await e.req.json();
  return console.log("接收配置文件完毕", t), Xr(t), e.json({ ok: !0 });
});
Le.get("/preview/page/*", async (e) => {
  const t = e.req.path.substring(13);
  return Bi.request(t);
});
Le.notFound(async (e) => fetch(e.req.raw));
Le.fire();
self.addEventListener("install", (e) => {
  console.log("Service Worker installed:", e);
});
export {
  Mi as getItem,
  ki as setItem
};
