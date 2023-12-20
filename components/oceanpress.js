function ke(e, t) {
  const n = /* @__PURE__ */ Object.create(null), o = e.split(",");
  for (let r = 0; r < o.length; r++)
    n[o[r]] = !0;
  return t ? (r) => !!n[r.toLowerCase()] : (r) => !!n[r];
}
const B = process.env.NODE_ENV !== "production" ? Object.freeze({}) : {}, mt = process.env.NODE_ENV !== "production" ? Object.freeze([]) : [], Y = () => {
}, hr = () => !1, Ft = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), nn = (e) => e.startsWith("onUpdate:"), k = Object.assign, no = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, _s = Object.prototype.hasOwnProperty, A = (e, t) => _s.call(e, t), C = Array.isArray, gt = (e) => pn(e) === "[object Map]", Es = (e) => pn(e) === "[object Set]", T = (e) => typeof e == "function", q = (e) => typeof e == "string", an = (e) => typeof e == "symbol", K = (e) => e !== null && typeof e == "object", oo = (e) => (K(e) || T(e)) && T(e.then) && T(e.catch), vs = Object.prototype.toString, pn = (e) => vs.call(e), ro = (e) => pn(e).slice(8, -1), Ns = (e) => pn(e) === "[object Object]", so = (e) => q(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Jt = /* @__PURE__ */ ke(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), bs = /* @__PURE__ */ ke(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
), dn = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Os = /-(\w)/g, Et = dn((e) => e.replace(Os, (t, n) => n ? n.toUpperCase() : "")), ys = /\B([A-Z])/g, Ue = dn(
  (e) => e.replace(ys, "-$1").toLowerCase()
), hn = dn((e) => e.charAt(0).toUpperCase() + e.slice(1)), Je = dn((e) => e ? `on${hn(e)}` : ""), vt = (e, t) => !Object.is(e, t), yt = (e, t) => {
  for (let n = 0; n < e.length; n++)
    e[n](t);
}, on = (e, t, n) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    value: n
  });
}, ws = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Po;
const rn = () => Po || (Po = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function io(e) {
  if (C(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const o = e[n], r = q(o) ? Cs(o) : io(o);
      if (r)
        for (const s in r)
          t[s] = r[s];
    }
    return t;
  } else if (q(e) || K(e))
    return e;
}
const xs = /;(?![^(]*\))/g, Ds = /:([^]+)/, Vs = /\/\*[^]*?\*\//g;
function Cs(e) {
  const t = {};
  return e.replace(Vs, "").split(xs).forEach((n) => {
    if (n) {
      const o = n.split(Ds);
      o.length > 1 && (t[o[0].trim()] = o[1].trim());
    }
  }), t;
}
function lo(e) {
  let t = "";
  if (q(e))
    t = e;
  else if (C(e))
    for (let n = 0; n < e.length; n++) {
      const o = lo(e[n]);
      o && (t += o + " ");
    }
  else if (K(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Ts = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", $s = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view", Ps = /* @__PURE__ */ ke(Ts), Is = /* @__PURE__ */ ke($s), As = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Rs = /* @__PURE__ */ ke(As);
function mr(e) {
  return !!e || e === "";
}
function Fn(e, ...t) {
  console.warn(`[Vue warn] ${e}`, ...t);
}
let ue;
class Ms {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this.effects = [], this.cleanups = [], this.parent = ue, !t && ue && (this.index = (ue.scopes || (ue.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  run(t) {
    if (this._active) {
      const n = ue;
      try {
        return ue = this, t();
      } finally {
        ue = n;
      }
    } else
      process.env.NODE_ENV !== "production" && Fn("cannot run an inactive effect scope.");
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ue = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    ue = this.parent;
  }
  stop(t) {
    if (this._active) {
      let n, o;
      for (n = 0, o = this.effects.length; n < o; n++)
        this.effects[n].stop();
      for (n = 0, o = this.cleanups.length; n < o; n++)
        this.cleanups[n]();
      if (this.scopes)
        for (n = 0, o = this.scopes.length; n < o; n++)
          this.scopes[n].stop(!0);
      if (!this.detached && this.parent && !t) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0, this._active = !1;
    }
  }
}
function Ss(e, t = ue) {
  t && t.active && t.effects.push(e);
}
function Fs() {
  return ue;
}
const It = (e) => {
  const t = new Set(e);
  return t.w = 0, t.n = 0, t;
}, gr = (e) => (e.w & Be) > 0, _r = (e) => (e.n & Be) > 0, js = ({ deps: e }) => {
  if (e.length)
    for (let t = 0; t < e.length; t++)
      e[t].w |= Be;
}, Hs = (e) => {
  const { deps: t } = e;
  if (t.length) {
    let n = 0;
    for (let o = 0; o < t.length; o++) {
      const r = t[o];
      gr(r) && !_r(r) ? r.delete(e) : t[n++] = r, r.w &= ~Be, r.n &= ~Be;
    }
    t.length = n;
  }
}, jn = /* @__PURE__ */ new WeakMap();
let Dt = 0, Be = 1;
const Hn = 30;
let ne;
const Xe = Symbol(process.env.NODE_ENV !== "production" ? "iterate" : ""), Ln = Symbol(process.env.NODE_ENV !== "production" ? "Map key iterate" : "");
class co {
  constructor(t, n = null, o) {
    this.fn = t, this.scheduler = n, this.active = !0, this.deps = [], this.parent = void 0, Ss(this, o);
  }
  run() {
    if (!this.active)
      return this.fn();
    let t = ne, n = Le;
    for (; t; ) {
      if (t === this)
        return;
      t = t.parent;
    }
    try {
      return this.parent = ne, ne = this, Le = !0, Be = 1 << ++Dt, Dt <= Hn ? js(this) : Io(this), this.fn();
    } finally {
      Dt <= Hn && Hs(this), Be = 1 << --Dt, ne = this.parent, Le = n, this.parent = void 0, this.deferStop && this.stop();
    }
  }
  stop() {
    ne === this ? this.deferStop = !0 : this.active && (Io(this), this.onStop && this.onStop(), this.active = !1);
  }
}
function Io(e) {
  const { deps: t } = e;
  if (t.length) {
    for (let n = 0; n < t.length; n++)
      t[n].delete(e);
    t.length = 0;
  }
}
let Le = !0;
const Er = [];
function it() {
  Er.push(Le), Le = !1;
}
function lt() {
  const e = Er.pop();
  Le = e === void 0 ? !0 : e;
}
function Z(e, t, n) {
  if (Le && ne) {
    let o = jn.get(e);
    o || jn.set(e, o = /* @__PURE__ */ new Map());
    let r = o.get(n);
    r || o.set(n, r = It());
    const s = process.env.NODE_ENV !== "production" ? { effect: ne, target: e, type: t, key: n } : void 0;
    Un(r, s);
  }
}
function Un(e, t) {
  let n = !1;
  Dt <= Hn ? _r(e) || (e.n |= Be, n = !gr(e)) : n = !e.has(ne), n && (e.add(ne), ne.deps.push(e), process.env.NODE_ENV !== "production" && ne.onTrack && ne.onTrack(
    k(
      {
        effect: ne
      },
      t
    )
  ));
}
function xe(e, t, n, o, r, s) {
  const i = jn.get(e);
  if (!i)
    return;
  let c = [];
  if (t === "clear")
    c = [...i.values()];
  else if (n === "length" && C(e)) {
    const a = Number(o);
    i.forEach((h, p) => {
      (p === "length" || !an(p) && p >= a) && c.push(h);
    });
  } else
    switch (n !== void 0 && c.push(i.get(n)), t) {
      case "add":
        C(e) ? so(n) && c.push(i.get("length")) : (c.push(i.get(Xe)), gt(e) && c.push(i.get(Ln)));
        break;
      case "delete":
        C(e) || (c.push(i.get(Xe)), gt(e) && c.push(i.get(Ln)));
        break;
      case "set":
        gt(e) && c.push(i.get(Xe));
        break;
    }
  const u = process.env.NODE_ENV !== "production" ? { target: e, type: t, key: n, newValue: o, oldValue: r, oldTarget: s } : void 0;
  if (c.length === 1)
    c[0] && (process.env.NODE_ENV !== "production" ? dt(c[0], u) : dt(c[0]));
  else {
    const a = [];
    for (const h of c)
      h && a.push(...h);
    process.env.NODE_ENV !== "production" ? dt(It(a), u) : dt(It(a));
  }
}
function dt(e, t) {
  const n = C(e) ? e : [...e];
  for (const o of n)
    o.computed && Ao(o, t);
  for (const o of n)
    o.computed || Ao(o, t);
}
function Ao(e, t) {
  (e !== ne || e.allowRecurse) && (process.env.NODE_ENV !== "production" && e.onTrigger && e.onTrigger(k({ effect: e }, t)), e.scheduler ? e.scheduler() : e.run());
}
const Ls = /* @__PURE__ */ ke("__proto__,__v_isRef,__isVue"), vr = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(an)
), Ro = /* @__PURE__ */ Us();
function Us() {
  const e = {};
  return ["includes", "indexOf", "lastIndexOf"].forEach((t) => {
    e[t] = function(...n) {
      const o = I(this);
      for (let s = 0, i = this.length; s < i; s++)
        Z(o, "get", s + "");
      const r = o[t](...n);
      return r === -1 || r === !1 ? o[t](...n.map(I)) : r;
    };
  }), ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
    e[t] = function(...n) {
      it();
      const o = I(this)[t].apply(this, n);
      return lt(), o;
    };
  }), e;
}
function Bs(e) {
  const t = I(this);
  return Z(t, "has", e), t.hasOwnProperty(e);
}
class Nr {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._shallow = n;
  }
  get(t, n, o) {
    const r = this._isReadonly, s = this._shallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return s;
    if (n === "__v_raw")
      return o === (r ? s ? Vr : Dr : s ? xr : wr).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(o) ? t : void 0;
    const i = C(t);
    if (!r) {
      if (i && A(Ro, n))
        return Reflect.get(Ro, n, o);
      if (n === "hasOwnProperty")
        return Bs;
    }
    const c = Reflect.get(t, n, o);
    return (an(n) ? vr.has(n) : Ls(n)) || (r || Z(t, "get", n), s) ? c : G(c) ? i && so(n) ? c : c.value : K(c) ? r ? Cr(c) : _n(c) : c;
  }
}
class br extends Nr {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, o, r) {
    let s = t[n];
    if (!this._shallow) {
      const u = rt(s);
      if (!Bn(o) && !rt(o) && (s = I(s), o = I(o)), !C(t) && G(s) && !G(o))
        return u ? !1 : (s.value = o, !0);
    }
    const i = C(t) && so(n) ? Number(n) < t.length : A(t, n), c = Reflect.set(t, n, o, r);
    return t === I(r) && (i ? vt(o, s) && xe(t, "set", n, o, s) : xe(t, "add", n, o)), c;
  }
  deleteProperty(t, n) {
    const o = A(t, n), r = t[n], s = Reflect.deleteProperty(t, n);
    return s && o && xe(t, "delete", n, void 0, r), s;
  }
  has(t, n) {
    const o = Reflect.has(t, n);
    return (!an(n) || !vr.has(n)) && Z(t, "has", n), o;
  }
  ownKeys(t) {
    return Z(
      t,
      "iterate",
      C(t) ? "length" : Xe
    ), Reflect.ownKeys(t);
  }
}
class Or extends Nr {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return process.env.NODE_ENV !== "production" && Fn(
      `Set operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
  deleteProperty(t, n) {
    return process.env.NODE_ENV !== "production" && Fn(
      `Delete operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
}
const Ks = /* @__PURE__ */ new br(), ks = /* @__PURE__ */ new Or(), Ws = /* @__PURE__ */ new br(
  !0
), qs = /* @__PURE__ */ new Or(!0), fo = (e) => e, mn = (e) => Reflect.getPrototypeOf(e);
function Bt(e, t, n = !1, o = !1) {
  e = e.__v_raw;
  const r = I(e), s = I(t);
  n || (vt(t, s) && Z(r, "get", t), Z(r, "get", s));
  const { has: i } = mn(r), c = o ? fo : n ? ao : uo;
  if (i.call(r, t))
    return c(e.get(t));
  if (i.call(r, s))
    return c(e.get(s));
  e !== r && e.get(t);
}
function Kt(e, t = !1) {
  const n = this.__v_raw, o = I(n), r = I(e);
  return t || (vt(e, r) && Z(o, "has", e), Z(o, "has", r)), e === r ? n.has(e) : n.has(e) || n.has(r);
}
function kt(e, t = !1) {
  return e = e.__v_raw, !t && Z(I(e), "iterate", Xe), Reflect.get(e, "size", e);
}
function Mo(e) {
  e = I(e);
  const t = I(this);
  return mn(t).has.call(t, e) || (t.add(e), xe(t, "add", e, e)), this;
}
function So(e, t) {
  t = I(t);
  const n = I(this), { has: o, get: r } = mn(n);
  let s = o.call(n, e);
  s ? process.env.NODE_ENV !== "production" && yr(n, o, e) : (e = I(e), s = o.call(n, e));
  const i = r.call(n, e);
  return n.set(e, t), s ? vt(t, i) && xe(n, "set", e, t, i) : xe(n, "add", e, t), this;
}
function Fo(e) {
  const t = I(this), { has: n, get: o } = mn(t);
  let r = n.call(t, e);
  r ? process.env.NODE_ENV !== "production" && yr(t, n, e) : (e = I(e), r = n.call(t, e));
  const s = o ? o.call(t, e) : void 0, i = t.delete(e);
  return r && xe(t, "delete", e, void 0, s), i;
}
function jo() {
  const e = I(this), t = e.size !== 0, n = process.env.NODE_ENV !== "production" ? gt(e) ? new Map(e) : new Set(e) : void 0, o = e.clear();
  return t && xe(e, "clear", void 0, void 0, n), o;
}
function Wt(e, t) {
  return function(o, r) {
    const s = this, i = s.__v_raw, c = I(i), u = t ? fo : e ? ao : uo;
    return !e && Z(c, "iterate", Xe), i.forEach((a, h) => o.call(r, u(a), u(h), s));
  };
}
function qt(e, t, n) {
  return function(...o) {
    const r = this.__v_raw, s = I(r), i = gt(s), c = e === "entries" || e === Symbol.iterator && i, u = e === "keys" && i, a = r[e](...o), h = n ? fo : t ? ao : uo;
    return !t && Z(
      s,
      "iterate",
      u ? Ln : Xe
    ), {
      // iterator protocol
      next() {
        const { value: p, done: v } = a.next();
        return v ? { value: p, done: v } : {
          value: c ? [h(p[0]), h(p[1])] : h(p),
          done: v
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Se(e) {
  return function(...t) {
    if (process.env.NODE_ENV !== "production") {
      const n = t[0] ? `on key "${t[0]}" ` : "";
      console.warn(
        `${hn(e)} operation ${n}failed: target is readonly.`,
        I(this)
      );
    }
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function zs() {
  const e = {
    get(s) {
      return Bt(this, s);
    },
    get size() {
      return kt(this);
    },
    has: Kt,
    add: Mo,
    set: So,
    delete: Fo,
    clear: jo,
    forEach: Wt(!1, !1)
  }, t = {
    get(s) {
      return Bt(this, s, !1, !0);
    },
    get size() {
      return kt(this);
    },
    has: Kt,
    add: Mo,
    set: So,
    delete: Fo,
    clear: jo,
    forEach: Wt(!1, !0)
  }, n = {
    get(s) {
      return Bt(this, s, !0);
    },
    get size() {
      return kt(this, !0);
    },
    has(s) {
      return Kt.call(this, s, !0);
    },
    add: Se("add"),
    set: Se("set"),
    delete: Se("delete"),
    clear: Se("clear"),
    forEach: Wt(!0, !1)
  }, o = {
    get(s) {
      return Bt(this, s, !0, !0);
    },
    get size() {
      return kt(this, !0);
    },
    has(s) {
      return Kt.call(this, s, !0);
    },
    add: Se("add"),
    set: Se("set"),
    delete: Se("delete"),
    clear: Se("clear"),
    forEach: Wt(!0, !0)
  };
  return ["keys", "values", "entries", Symbol.iterator].forEach((s) => {
    e[s] = qt(
      s,
      !1,
      !1
    ), n[s] = qt(
      s,
      !0,
      !1
    ), t[s] = qt(
      s,
      !1,
      !0
    ), o[s] = qt(
      s,
      !0,
      !0
    );
  }), [
    e,
    n,
    t,
    o
  ];
}
const [
  Js,
  Ys,
  Xs,
  Zs
] = /* @__PURE__ */ zs();
function gn(e, t) {
  const n = t ? e ? Zs : Xs : e ? Ys : Js;
  return (o, r, s) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? o : Reflect.get(
    A(n, r) && r in o ? n : o,
    r,
    s
  );
}
const Qs = {
  get: /* @__PURE__ */ gn(!1, !1)
}, Gs = {
  get: /* @__PURE__ */ gn(!1, !0)
}, ei = {
  get: /* @__PURE__ */ gn(!0, !1)
}, ti = {
  get: /* @__PURE__ */ gn(!0, !0)
};
function yr(e, t, n) {
  const o = I(n);
  if (o !== n && t.call(e, o)) {
    const r = ro(e);
    console.warn(
      `Reactive ${r} contains both the raw and reactive versions of the same object${r === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const wr = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), Dr = /* @__PURE__ */ new WeakMap(), Vr = /* @__PURE__ */ new WeakMap();
function ni(e) {
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
function oi(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : ni(ro(e));
}
function _n(e) {
  return rt(e) ? e : En(
    e,
    !1,
    Ks,
    Qs,
    wr
  );
}
function ri(e) {
  return En(
    e,
    !1,
    Ws,
    Gs,
    xr
  );
}
function Cr(e) {
  return En(
    e,
    !0,
    ks,
    ei,
    Dr
  );
}
function Vt(e) {
  return En(
    e,
    !0,
    qs,
    ti,
    Vr
  );
}
function En(e, t, n, o, r) {
  if (!K(e))
    return process.env.NODE_ENV !== "production" && console.warn(`value cannot be made reactive: ${String(e)}`), e;
  if (e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const s = r.get(e);
  if (s)
    return s;
  const i = oi(e);
  if (i === 0)
    return e;
  const c = new Proxy(
    e,
    i === 2 ? o : n
  );
  return r.set(e, c), c;
}
function Ze(e) {
  return rt(e) ? Ze(e.__v_raw) : !!(e && e.__v_isReactive);
}
function rt(e) {
  return !!(e && e.__v_isReadonly);
}
function Bn(e) {
  return !!(e && e.__v_isShallow);
}
function Kn(e) {
  return Ze(e) || rt(e);
}
function I(e) {
  const t = e && e.__v_raw;
  return t ? I(t) : e;
}
function Tr(e) {
  return on(e, "__v_skip", !0), e;
}
const uo = (e) => K(e) ? _n(e) : e, ao = (e) => K(e) ? Cr(e) : e;
function si(e) {
  Le && ne && (e = I(e), process.env.NODE_ENV !== "production" ? Un(e.dep || (e.dep = It()), {
    target: e,
    type: "get",
    key: "value"
  }) : Un(e.dep || (e.dep = It())));
}
function ii(e, t) {
  e = I(e);
  const n = e.dep;
  n && (process.env.NODE_ENV !== "production" ? dt(n, {
    target: e,
    type: "set",
    key: "value",
    newValue: t
  }) : dt(n));
}
function G(e) {
  return !!(e && e.__v_isRef === !0);
}
function $r(e) {
  return G(e) ? e.value : e;
}
const li = {
  get: (e, t, n) => $r(Reflect.get(e, t, n)),
  set: (e, t, n, o) => {
    const r = e[t];
    return G(r) && !G(n) ? (r.value = n, !0) : Reflect.set(e, t, n, o);
  }
};
function Pr(e) {
  return Ze(e) ? e : new Proxy(e, li);
}
class ci {
  constructor(t, n, o, r) {
    this._setter = n, this.dep = void 0, this.__v_isRef = !0, this.__v_isReadonly = !1, this._dirty = !0, this.effect = new co(t, () => {
      this._dirty || (this._dirty = !0, ii(this));
    }), this.effect.computed = this, this.effect.active = this._cacheable = !r, this.__v_isReadonly = o;
  }
  get value() {
    const t = I(this);
    return si(t), (t._dirty || !t._cacheable) && (t._dirty = !1, t._value = t.effect.run()), t._value;
  }
  set value(t) {
    this._setter(t);
  }
}
function fi(e, t, n = !1) {
  let o, r;
  const s = T(e);
  s ? (o = e, r = process.env.NODE_ENV !== "production" ? () => {
    console.warn("Write operation failed: computed value is readonly");
  } : Y) : (o = e.get, r = e.set);
  const i = new ci(o, r, s || !r, n);
  return process.env.NODE_ENV !== "production" && t && !n && (i.effect.onTrack = t.onTrack, i.effect.onTrigger = t.onTrigger), i;
}
const Qe = [];
function Yt(e) {
  Qe.push(e);
}
function Xt() {
  Qe.pop();
}
function b(e, ...t) {
  if (process.env.NODE_ENV === "production")
    return;
  it();
  const n = Qe.length ? Qe[Qe.length - 1].component : null, o = n && n.appContext.config.warnHandler, r = ui();
  if (o)
    Pe(
      o,
      n,
      11,
      [
        e + t.join(""),
        n && n.proxy,
        r.map(
          ({ vnode: s }) => `at <${wn(n, s.type)}>`
        ).join(`
`),
        r
      ]
    );
  else {
    const s = [`[Vue warn]: ${e}`, ...t];
    r.length && s.push(`
`, ...ai(r)), console.warn(...s);
  }
  lt();
}
function ui() {
  let e = Qe[Qe.length - 1];
  if (!e)
    return [];
  const t = [];
  for (; e; ) {
    const n = t[0];
    n && n.vnode === e ? n.recurseCount++ : t.push({
      vnode: e,
      recurseCount: 0
    });
    const o = e.component && e.component.parent;
    e = o && o.vnode;
  }
  return t;
}
function ai(e) {
  const t = [];
  return e.forEach((n, o) => {
    t.push(...o === 0 ? [] : [`
`], ...pi(n));
  }), t;
}
function pi({ vnode: e, recurseCount: t }) {
  const n = t > 0 ? `... (${t} recursive calls)` : "", o = e.component ? e.component.parent == null : !1, r = ` at <${wn(
    e.component,
    e.type,
    o
  )}`, s = ">" + n;
  return e.props ? [r, ...di(e.props), s] : [r + s];
}
function di(e) {
  const t = [], n = Object.keys(e);
  return n.slice(0, 3).forEach((o) => {
    t.push(...Ir(o, e[o]));
  }), n.length > 3 && t.push(" ..."), t;
}
function Ir(e, t, n) {
  return q(t) ? (t = JSON.stringify(t), n ? t : [`${e}=${t}`]) : typeof t == "number" || typeof t == "boolean" || t == null ? n ? t : [`${e}=${t}`] : G(t) ? (t = Ir(e, I(t.value), !0), n ? t : [`${e}=Ref<`, t, ">"]) : T(t) ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`] : (t = I(t), n ? t : [`${e}=`, t]);
}
const po = {
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
  14: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core"
};
function Pe(e, t, n, o) {
  let r;
  try {
    r = o ? e(...o) : e();
  } catch (s) {
    vn(s, t, n);
  }
  return r;
}
function he(e, t, n, o) {
  if (T(e)) {
    const s = Pe(e, t, n, o);
    return s && oo(s) && s.catch((i) => {
      vn(i, t, n);
    }), s;
  }
  const r = [];
  for (let s = 0; s < e.length; s++)
    r.push(he(e[s], t, n, o));
  return r;
}
function vn(e, t, n, o = !0) {
  const r = t ? t.vnode : null;
  if (t) {
    let s = t.parent;
    const i = t.proxy, c = process.env.NODE_ENV !== "production" ? po[n] : n;
    for (; s; ) {
      const a = s.ec;
      if (a) {
        for (let h = 0; h < a.length; h++)
          if (a[h](e, i, c) === !1)
            return;
      }
      s = s.parent;
    }
    const u = t.appContext.config.errorHandler;
    if (u) {
      Pe(
        u,
        null,
        10,
        [e, i, c]
      );
      return;
    }
  }
  hi(e, n, r, o);
}
function hi(e, t, n, o = !0) {
  if (process.env.NODE_ENV !== "production") {
    const r = po[t];
    if (n && Yt(n), b(`Unhandled error${r ? ` during execution of ${r}` : ""}`), n && Xt(), o)
      throw e;
    console.error(e);
  } else
    console.error(e);
}
let At = !1, kn = !1;
const Q = [];
let ye = 0;
const _t = [];
let Oe = null, Fe = 0;
const Ar = /* @__PURE__ */ Promise.resolve();
let ho = null;
const mi = 100;
function gi(e) {
  const t = ho || Ar;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function _i(e) {
  let t = ye + 1, n = Q.length;
  for (; t < n; ) {
    const o = t + n >>> 1, r = Q[o], s = Rt(r);
    s < e || s === e && r.pre ? t = o + 1 : n = o;
  }
  return t;
}
function Nn(e) {
  (!Q.length || !Q.includes(
    e,
    At && e.allowRecurse ? ye + 1 : ye
  )) && (e.id == null ? Q.push(e) : Q.splice(_i(e.id), 0, e), Rr());
}
function Rr() {
  !At && !kn && (kn = !0, ho = Ar.then(Fr));
}
function Ei(e) {
  const t = Q.indexOf(e);
  t > ye && Q.splice(t, 1);
}
function Mr(e) {
  C(e) ? _t.push(...e) : (!Oe || !Oe.includes(
    e,
    e.allowRecurse ? Fe + 1 : Fe
  )) && _t.push(e), Rr();
}
function Ho(e, t, n = At ? ye + 1 : 0) {
  for (process.env.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map()); n < Q.length; n++) {
    const o = Q[n];
    if (o && o.pre) {
      if (e && o.id !== e.uid || process.env.NODE_ENV !== "production" && mo(t, o))
        continue;
      Q.splice(n, 1), n--, o();
    }
  }
}
function Sr(e) {
  if (_t.length) {
    const t = [...new Set(_t)];
    if (_t.length = 0, Oe) {
      Oe.push(...t);
      return;
    }
    for (Oe = t, process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), Oe.sort((n, o) => Rt(n) - Rt(o)), Fe = 0; Fe < Oe.length; Fe++)
      process.env.NODE_ENV !== "production" && mo(e, Oe[Fe]) || Oe[Fe]();
    Oe = null, Fe = 0;
  }
}
const Rt = (e) => e.id == null ? 1 / 0 : e.id, vi = (e, t) => {
  const n = Rt(e) - Rt(t);
  if (n === 0) {
    if (e.pre && !t.pre)
      return -1;
    if (t.pre && !e.pre)
      return 1;
  }
  return n;
};
function Fr(e) {
  kn = !1, At = !0, process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), Q.sort(vi);
  const t = process.env.NODE_ENV !== "production" ? (n) => mo(e, n) : Y;
  try {
    for (ye = 0; ye < Q.length; ye++) {
      const n = Q[ye];
      if (n && n.active !== !1) {
        if (process.env.NODE_ENV !== "production" && t(n))
          continue;
        Pe(n, null, 14);
      }
    }
  } finally {
    ye = 0, Q.length = 0, Sr(e), At = !1, ho = null, (Q.length || _t.length) && Fr(e);
  }
}
function mo(e, t) {
  if (!e.has(t))
    e.set(t, 1);
  else {
    const n = e.get(t);
    if (n > mi) {
      const o = t.ownerInstance, r = o && as(o.type);
      return b(
        `Maximum recursive updates exceeded${r ? ` in component <${r}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`
      ), !0;
    } else
      e.set(t, n + 1);
  }
}
let Ge = !1;
const pt = /* @__PURE__ */ new Set();
process.env.NODE_ENV !== "production" && (rn().__VUE_HMR_RUNTIME__ = {
  createRecord: Tn(jr),
  rerender: Tn(Oi),
  reload: Tn(yi)
});
const st = /* @__PURE__ */ new Map();
function Ni(e) {
  const t = e.type.__hmrId;
  let n = st.get(t);
  n || (jr(t, e.type), n = st.get(t)), n.instances.add(e);
}
function bi(e) {
  st.get(e.type.__hmrId).instances.delete(e);
}
function jr(e, t) {
  return st.has(e) ? !1 : (st.set(e, {
    initialDef: $t(t),
    instances: /* @__PURE__ */ new Set()
  }), !0);
}
function $t(e) {
  return ps(e) ? e.__vccOpts : e;
}
function Oi(e, t) {
  const n = st.get(e);
  n && (n.initialDef.render = t, [...n.instances].forEach((o) => {
    t && (o.render = t, $t(o.type).render = t), o.renderCache = [], Ge = !0, o.update(), Ge = !1;
  }));
}
function yi(e, t) {
  const n = st.get(e);
  if (!n)
    return;
  t = $t(t), Lo(n.initialDef, t);
  const o = [...n.instances];
  for (const r of o) {
    const s = $t(r.type);
    pt.has(s) || (s !== n.initialDef && Lo(s, t), pt.add(s)), r.appContext.propsCache.delete(r.type), r.appContext.emitsCache.delete(r.type), r.appContext.optionsCache.delete(r.type), r.ceReload ? (pt.add(s), r.ceReload(t.styles), pt.delete(s)) : r.parent ? Nn(r.parent.update) : r.appContext.reload ? r.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
      "[HMR] Root or manually mounted instance modified. Full reload required."
    );
  }
  Mr(() => {
    for (const r of o)
      pt.delete(
        $t(r.type)
      );
  });
}
function Lo(e, t) {
  k(e, t);
  for (const n in e)
    n !== "__file" && !(n in t) && delete e[n];
}
function Tn(e) {
  return (t, n) => {
    try {
      return e(t, n);
    } catch (o) {
      console.error(o), console.warn(
        "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
      );
    }
  };
}
let we, Ct = [], Wn = !1;
function jt(e, ...t) {
  we ? we.emit(e, ...t) : Wn || Ct.push({ event: e, args: t });
}
function Hr(e, t) {
  var n, o;
  we = e, we ? (we.enabled = !0, Ct.forEach(({ event: r, args: s }) => we.emit(r, ...s)), Ct = []) : /* handle late devtools injection - only do this if we are in an actual */ /* browser environment to avoid the timer handle stalling test runner exit */ /* (#4815) */ typeof window < "u" && // some envs mock window but not fully
  window.HTMLElement && // also exclude jsdom
  !((o = (n = window.navigator) == null ? void 0 : n.userAgent) != null && o.includes("jsdom")) ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((s) => {
    Hr(s, t);
  }), setTimeout(() => {
    we || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Wn = !0, Ct = []);
  }, 3e3)) : (Wn = !0, Ct = []);
}
function wi(e, t) {
  jt("app:init", e, t, {
    Fragment: ae,
    Text: Ht,
    Comment: me,
    Static: en
  });
}
function xi(e) {
  jt("app:unmount", e);
}
const Di = /* @__PURE__ */ go(
  "component:added"
  /* COMPONENT_ADDED */
), Lr = /* @__PURE__ */ go(
  "component:updated"
  /* COMPONENT_UPDATED */
), Vi = /* @__PURE__ */ go(
  "component:removed"
  /* COMPONENT_REMOVED */
), Ci = (e) => {
  we && typeof we.cleanupBuffer == "function" && // remove the component if it wasn't buffered
  !we.cleanupBuffer(e) && Vi(e);
};
function go(e) {
  return (t) => {
    jt(
      e,
      t.appContext.app,
      t.uid,
      t.parent ? t.parent.uid : void 0,
      t
    );
  };
}
const Ti = /* @__PURE__ */ Ur(
  "perf:start"
  /* PERFORMANCE_START */
), $i = /* @__PURE__ */ Ur(
  "perf:end"
  /* PERFORMANCE_END */
);
function Ur(e) {
  return (t, n, o) => {
    jt(e, t.appContext.app, t.uid, t, n, o);
  };
}
function Pi(e, t, n) {
  jt(
    "component:emit",
    e.appContext.app,
    e,
    t,
    n
  );
}
function Ii(e, t, ...n) {
  if (e.isUnmounted)
    return;
  const o = e.vnode.props || B;
  if (process.env.NODE_ENV !== "production") {
    const {
      emitsOptions: h,
      propsOptions: [p]
    } = e;
    if (h)
      if (!(t in h))
        (!p || !(Je(t) in p)) && b(
          `Component emitted event "${t}" but it is neither declared in the emits option nor as an "${Je(t)}" prop.`
        );
      else {
        const v = h[t];
        T(v) && (v(...n) || b(
          `Invalid event arguments: event validation failed for event "${t}".`
        ));
      }
  }
  let r = n;
  const s = t.startsWith("update:"), i = s && t.slice(7);
  if (i && i in o) {
    const h = `${i === "modelValue" ? "model" : i}Modifiers`, { number: p, trim: v } = o[h] || B;
    v && (r = n.map((x) => q(x) ? x.trim() : x)), p && (r = n.map(ws));
  }
  if (process.env.NODE_ENV !== "production" && Pi(e, t, r), process.env.NODE_ENV !== "production") {
    const h = t.toLowerCase();
    h !== t && o[Je(h)] && b(
      `Event "${h}" is emitted in component ${wn(
        e,
        e.type
      )} but the handler is registered for "${t}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${Ue(t)}" instead of "${t}".`
    );
  }
  let c, u = o[c = Je(t)] || // also try camelCase event handler (#2249)
  o[c = Je(Et(t))];
  !u && s && (u = o[c = Je(Ue(t))]), u && he(
    u,
    e,
    6,
    r
  );
  const a = o[c + "Once"];
  if (a) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[c])
      return;
    e.emitted[c] = !0, he(
      a,
      e,
      6,
      r
    );
  }
}
function Br(e, t, n = !1) {
  const o = t.emitsCache, r = o.get(e);
  if (r !== void 0)
    return r;
  const s = e.emits;
  let i = {}, c = !1;
  if (!T(e)) {
    const u = (a) => {
      const h = Br(a, t, !0);
      h && (c = !0, k(i, h));
    };
    !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  return !s && !c ? (K(e) && o.set(e, null), null) : (C(s) ? s.forEach((u) => i[u] = null) : k(i, s), K(e) && o.set(e, i), i);
}
function bn(e, t) {
  return !e || !Ft(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), A(e, t[0].toLowerCase() + t.slice(1)) || A(e, Ue(t)) || A(e, t));
}
let ie = null, Kr = null;
function sn(e) {
  const t = ie;
  return ie = e, Kr = e && e.type.__scopeId || null, t;
}
function Ai(e, t = ie, n) {
  if (!t || e._n)
    return e;
  const o = (...r) => {
    o._d && Go(-1);
    const s = sn(t);
    let i;
    try {
      i = e(...r);
    } finally {
      sn(s), o._d && Go(1);
    }
    return process.env.NODE_ENV !== "production" && Lr(t), i;
  };
  return o._n = !0, o._c = !0, o._d = !0, o;
}
let qn = !1;
function ln() {
  qn = !0;
}
function $n(e) {
  const {
    type: t,
    vnode: n,
    proxy: o,
    withProxy: r,
    props: s,
    propsOptions: [i],
    slots: c,
    attrs: u,
    emit: a,
    render: h,
    renderCache: p,
    data: v,
    setupState: x,
    ctx: j,
    inheritAttrs: M
  } = e;
  let W, J;
  const ge = sn(e);
  process.env.NODE_ENV !== "production" && (qn = !1);
  try {
    if (n.shapeFlag & 4) {
      const $ = r || o, De = process.env.NODE_ENV !== "production" && x.__isScriptSetup ? new Proxy($, {
        get(Ee, le, se) {
          return b(
            `Property '${String(
              le
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          ), Reflect.get(Ee, le, se);
        }
      }) : $;
      W = pe(
        h.call(
          De,
          $,
          p,
          s,
          x,
          v,
          j
        )
      ), J = u;
    } else {
      const $ = t;
      process.env.NODE_ENV !== "production" && u === s && ln(), W = pe(
        $.length > 1 ? $(
          s,
          process.env.NODE_ENV !== "production" ? {
            get attrs() {
              return ln(), u;
            },
            slots: c,
            emit: a
          } : { attrs: u, slots: c, emit: a }
        ) : $(
          s,
          null
          /* we know it doesn't need it */
        )
      ), J = t.props ? u : Mi(u);
    }
  } catch ($) {
    Pt.length = 0, vn($, e, 1), W = tt(me);
  }
  let H = W, _e;
  if (process.env.NODE_ENV !== "production" && W.patchFlag > 0 && W.patchFlag & 2048 && ([H, _e] = Ri(W)), J && M !== !1) {
    const $ = Object.keys(J), { shapeFlag: De } = H;
    if ($.length) {
      if (De & 7)
        i && $.some(nn) && (J = Si(
          J,
          i
        )), H = Ke(H, J);
      else if (process.env.NODE_ENV !== "production" && !qn && H.type !== me) {
        const Ee = Object.keys(u), le = [], se = [];
        for (let Ve = 0, Ae = Ee.length; Ve < Ae; Ve++) {
          const ce = Ee[Ve];
          Ft(ce) ? nn(ce) || le.push(ce[2].toLowerCase() + ce.slice(3)) : se.push(ce);
        }
        se.length && b(
          `Extraneous non-props attributes (${se.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes.`
        ), le.length && b(
          `Extraneous non-emits event listeners (${le.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
        );
      }
    }
  }
  return n.dirs && (process.env.NODE_ENV !== "production" && !Uo(H) && b(
    "Runtime directive used on component with non-element root node. The directives will not function as intended."
  ), H = Ke(H), H.dirs = H.dirs ? H.dirs.concat(n.dirs) : n.dirs), n.transition && (process.env.NODE_ENV !== "production" && !Uo(H) && b(
    "Component inside <Transition> renders non-element root node that cannot be animated."
  ), H.transition = n.transition), process.env.NODE_ENV !== "production" && _e ? _e(H) : W = H, sn(ge), W;
}
const Ri = (e) => {
  const t = e.children, n = e.dynamicChildren, o = kr(t);
  if (!o)
    return [e, void 0];
  const r = t.indexOf(o), s = n ? n.indexOf(o) : -1, i = (c) => {
    t[r] = c, n && (s > -1 ? n[s] = c : c.patchFlag > 0 && (e.dynamicChildren = [...n, c]));
  };
  return [pe(o), i];
};
function kr(e) {
  let t;
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    if (Oo(o)) {
      if (o.type !== me || o.children === "v-if") {
        if (t)
          return;
        t = o;
      }
    } else
      return;
  }
  return t;
}
const Mi = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ft(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Si = (e, t) => {
  const n = {};
  for (const o in e)
    (!nn(o) || !(o.slice(9) in t)) && (n[o] = e[o]);
  return n;
}, Uo = (e) => e.shapeFlag & 7 || e.type === me;
function Fi(e, t, n) {
  const { props: o, children: r, component: s } = e, { props: i, children: c, patchFlag: u } = t, a = s.emitsOptions;
  if (process.env.NODE_ENV !== "production" && (r || c) && Ge || t.dirs || t.transition)
    return !0;
  if (n && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return o ? Bo(o, i, a) : !!i;
    if (u & 8) {
      const h = t.dynamicProps;
      for (let p = 0; p < h.length; p++) {
        const v = h[p];
        if (i[v] !== o[v] && !bn(a, v))
          return !0;
      }
    }
  } else
    return (r || c) && (!c || !c.$stable) ? !0 : o === i ? !1 : o ? i ? Bo(o, i, a) : !0 : !!i;
  return !1;
}
function Bo(e, t, n) {
  const o = Object.keys(t);
  if (o.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < o.length; r++) {
    const s = o[r];
    if (t[s] !== e[s] && !bn(n, s))
      return !0;
  }
  return !1;
}
function ji({ vnode: e, parent: t }, n) {
  for (; t && t.subTree === e; )
    (e = t.vnode).el = n, t = t.parent;
}
const Hi = Symbol.for("v-ndc"), Li = (e) => e.__isSuspense;
function Ui(e, t) {
  t && t.pendingBranch ? C(e) ? t.effects.push(...e) : t.effects.push(e) : Mr(e);
}
function Bi(e, t) {
  return _o(e, null, t);
}
const zt = {};
function Pn(e, t, n) {
  return process.env.NODE_ENV !== "production" && !T(t) && b(
    "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
  ), _o(e, t, n);
}
function _o(e, t, { immediate: n, deep: o, flush: r, onTrack: s, onTrigger: i } = B) {
  var c;
  process.env.NODE_ENV !== "production" && !t && (n !== void 0 && b(
    'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
  ), o !== void 0 && b(
    'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
  ));
  const u = ($) => {
    b(
      "Invalid watch source: ",
      $,
      "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
    );
  }, a = Fs() === ((c = X) == null ? void 0 : c.scope) ? X : null;
  let h, p = !1, v = !1;
  if (G(e) ? (h = () => e.value, p = Bn(e)) : Ze(e) ? (h = () => e, o = !0) : C(e) ? (v = !0, p = e.some(($) => Ze($) || Bn($)), h = () => e.map(($) => {
    if (G($))
      return $.value;
    if (Ze($))
      return ht($);
    if (T($))
      return Pe($, a, 2);
    process.env.NODE_ENV !== "production" && u($);
  })) : T(e) ? t ? h = () => Pe(e, a, 2) : h = () => {
    if (!(a && a.isUnmounted))
      return x && x(), he(
        e,
        a,
        3,
        [j]
      );
  } : (h = Y, process.env.NODE_ENV !== "production" && u(e)), t && o) {
    const $ = h;
    h = () => ht($());
  }
  let x, j = ($) => {
    x = H.onStop = () => {
      Pe($, a, 4), x = H.onStop = void 0;
    };
  }, M;
  if (St)
    if (j = Y, t ? n && he(t, a, 3, [
      h(),
      v ? [] : void 0,
      j
    ]) : h(), r === "sync") {
      const $ = Zl();
      M = $.__watcherHandles || ($.__watcherHandles = []);
    } else
      return Y;
  let W = v ? new Array(e.length).fill(zt) : zt;
  const J = () => {
    if (H.active)
      if (t) {
        const $ = H.run();
        (o || p || (v ? $.some((De, Ee) => vt(De, W[Ee])) : vt($, W))) && (x && x(), he(t, a, 3, [
          $,
          // pass undefined as the old value when it's changed for the first time
          W === zt ? void 0 : v && W[0] === zt ? [] : W,
          j
        ]), W = $);
      } else
        H.run();
  };
  J.allowRecurse = !!t;
  let ge;
  r === "sync" ? ge = J : r === "post" ? ge = () => re(J, a && a.suspense) : (J.pre = !0, a && (J.id = a.uid), ge = () => Nn(J));
  const H = new co(h, ge);
  process.env.NODE_ENV !== "production" && (H.onTrack = s, H.onTrigger = i), t ? n ? J() : W = H.run() : r === "post" ? re(
    H.run.bind(H),
    a && a.suspense
  ) : H.run();
  const _e = () => {
    H.stop(), a && a.scope && no(a.scope.effects, H);
  };
  return M && M.push(_e), _e;
}
function Ki(e, t, n) {
  const o = this.proxy, r = q(e) ? e.includes(".") ? Wr(o, e) : () => o[e] : e.bind(o, o);
  let s;
  T(t) ? s = t : (s = t.handler, n = t);
  const i = X;
  Nt(this);
  const c = _o(r, s.bind(o), n);
  return i ? Nt(i) : nt(), c;
}
function Wr(e, t) {
  const n = t.split(".");
  return () => {
    let o = e;
    for (let r = 0; r < n.length && o; r++)
      o = o[n[r]];
    return o;
  };
}
function ht(e, t) {
  if (!K(e) || e.__v_skip || (t = t || /* @__PURE__ */ new Set(), t.has(e)))
    return e;
  if (t.add(e), G(e))
    ht(e.value, t);
  else if (C(e))
    for (let n = 0; n < e.length; n++)
      ht(e[n], t);
  else if (Es(e) || gt(e))
    e.forEach((n) => {
      ht(n, t);
    });
  else if (Ns(e))
    for (const n in e)
      ht(e[n], t);
  return e;
}
function qr(e) {
  bs(e) && b("Do not use built-in directive ids as custom directive id: " + e);
}
function We(e, t, n, o) {
  const r = e.dirs, s = t && t.dirs;
  for (let i = 0; i < r.length; i++) {
    const c = r[i];
    s && (c.oldValue = s[i].value);
    let u = c.dir[o];
    u && (it(), he(u, n, 8, [
      e.el,
      c,
      e,
      t
    ]), lt());
  }
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ki(e, t) {
  return T(e) ? (
    // #8326: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => k({ name: e.name }, t, { setup: e }))()
  ) : e;
}
const Zt = (e) => !!e.type.__asyncLoader, Eo = (e) => e.type.__isKeepAlive;
function Wi(e, t) {
  zr(e, "a", t);
}
function qi(e, t) {
  zr(e, "da", t);
}
function zr(e, t, n = X) {
  const o = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (On(t, o, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      Eo(r.parent.vnode) && zi(o, t, n, r), r = r.parent;
  }
}
function zi(e, t, n, o) {
  const r = On(
    t,
    e,
    o,
    !0
    /* prepend */
  );
  Jr(() => {
    no(o[t], r);
  }, n);
}
function On(e, t, n = X, o = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), s = t.__weh || (t.__weh = (...i) => {
      if (n.isUnmounted)
        return;
      it(), Nt(n);
      const c = he(t, n, e, i);
      return nt(), lt(), c;
    });
    return o ? r.unshift(s) : r.push(s), s;
  } else if (process.env.NODE_ENV !== "production") {
    const r = Je(po[e].replace(/ hook$/, ""));
    b(
      `${r} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
    );
  }
}
const Ie = (e) => (t, n = X) => (
  // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
  (!St || e === "sp") && On(e, (...o) => t(...o), n)
), Ji = Ie("bm"), Yi = Ie("m"), Xi = Ie("bu"), Zi = Ie("u"), Qi = Ie("bum"), Jr = Ie("um"), Gi = Ie("sp"), el = Ie(
  "rtg"
), tl = Ie(
  "rtc"
);
function nl(e, t = X) {
  On("ec", e, t);
}
function ol(e, t, n, o) {
  let r;
  const s = n && n[o];
  if (C(e) || q(e)) {
    r = new Array(e.length);
    for (let i = 0, c = e.length; i < c; i++)
      r[i] = t(e[i], i, void 0, s && s[i]);
  } else if (typeof e == "number") {
    process.env.NODE_ENV !== "production" && !Number.isInteger(e) && b(`The v-for range expect an integer value but got ${e}.`), r = new Array(e);
    for (let i = 0; i < e; i++)
      r[i] = t(i + 1, i, void 0, s && s[i]);
  } else if (K(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (i, c) => t(i, c, void 0, s && s[c])
      );
    else {
      const i = Object.keys(e);
      r = new Array(i.length);
      for (let c = 0, u = i.length; c < u; c++) {
        const a = i[c];
        r[c] = t(e[a], a, c, s && s[c]);
      }
    }
  else
    r = [];
  return n && (n[o] = r), r;
}
const zn = (e) => e ? cs(e) ? xo(e) || e.proxy : zn(e.parent) : null, et = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ k(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => process.env.NODE_ENV !== "production" ? Vt(e.props) : e.props,
    $attrs: (e) => process.env.NODE_ENV !== "production" ? Vt(e.attrs) : e.attrs,
    $slots: (e) => process.env.NODE_ENV !== "production" ? Vt(e.slots) : e.slots,
    $refs: (e) => process.env.NODE_ENV !== "production" ? Vt(e.refs) : e.refs,
    $parent: (e) => zn(e.parent),
    $root: (e) => zn(e.root),
    $emit: (e) => e.emit,
    $options: (e) => No(e),
    $forceUpdate: (e) => e.f || (e.f = () => Nn(e.update)),
    $nextTick: (e) => e.n || (e.n = gi.bind(e.proxy)),
    $watch: (e) => Ki.bind(e)
  })
), vo = (e) => e === "_" || e === "$", In = (e, t) => e !== B && !e.__isScriptSetup && A(e, t), Yr = {
  get({ _: e }, t) {
    const { ctx: n, setupState: o, data: r, props: s, accessCache: i, type: c, appContext: u } = e;
    if (process.env.NODE_ENV !== "production" && t === "__isVue")
      return !0;
    let a;
    if (t[0] !== "$") {
      const x = i[t];
      if (x !== void 0)
        switch (x) {
          case 1:
            return o[t];
          case 2:
            return r[t];
          case 4:
            return n[t];
          case 3:
            return s[t];
        }
      else {
        if (In(o, t))
          return i[t] = 1, o[t];
        if (r !== B && A(r, t))
          return i[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (a = e.propsOptions[0]) && A(a, t)
        )
          return i[t] = 3, s[t];
        if (n !== B && A(n, t))
          return i[t] = 4, n[t];
        Jn && (i[t] = 0);
      }
    }
    const h = et[t];
    let p, v;
    if (h)
      return t === "$attrs" ? (Z(e, "get", t), process.env.NODE_ENV !== "production" && ln()) : process.env.NODE_ENV !== "production" && t === "$slots" && Z(e, "get", t), h(e);
    if (
      // css module (injected by vue-loader)
      (p = c.__cssModules) && (p = p[t])
    )
      return p;
    if (n !== B && A(n, t))
      return i[t] = 4, n[t];
    if (
      // global properties
      v = u.config.globalProperties, A(v, t)
    )
      return v[t];
    process.env.NODE_ENV !== "production" && ie && (!q(t) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    t.indexOf("__v") !== 0) && (r !== B && vo(t[0]) && A(r, t) ? b(
      `Property ${JSON.stringify(
        t
      )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
    ) : e === ie && b(
      `Property ${JSON.stringify(t)} was accessed during render but is not defined on instance.`
    ));
  },
  set({ _: e }, t, n) {
    const { data: o, setupState: r, ctx: s } = e;
    return In(r, t) ? (r[t] = n, !0) : process.env.NODE_ENV !== "production" && r.__isScriptSetup && A(r, t) ? (b(`Cannot mutate <script setup> binding "${t}" from Options API.`), !1) : o !== B && A(o, t) ? (o[t] = n, !0) : A(e.props, t) ? (process.env.NODE_ENV !== "production" && b(`Attempting to mutate prop "${t}". Props are readonly.`), !1) : t[0] === "$" && t.slice(1) in e ? (process.env.NODE_ENV !== "production" && b(
      `Attempting to mutate public property "${t}". Properties starting with $ are reserved and readonly.`
    ), !1) : (process.env.NODE_ENV !== "production" && t in e.appContext.config.globalProperties ? Object.defineProperty(s, t, {
      enumerable: !0,
      configurable: !0,
      value: n
    }) : s[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: o, appContext: r, propsOptions: s }
  }, i) {
    let c;
    return !!n[i] || e !== B && A(e, i) || In(t, i) || (c = s[0]) && A(c, i) || A(o, i) || A(et, i) || A(r.config.globalProperties, i);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : A(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
process.env.NODE_ENV !== "production" && (Yr.ownKeys = (e) => (b(
  "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
), Reflect.ownKeys(e)));
function rl(e) {
  const t = {};
  return Object.defineProperty(t, "_", {
    configurable: !0,
    enumerable: !1,
    get: () => e
  }), Object.keys(et).forEach((n) => {
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !1,
      get: () => et[n](e),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: Y
    });
  }), t;
}
function sl(e) {
  const {
    ctx: t,
    propsOptions: [n]
  } = e;
  n && Object.keys(n).forEach((o) => {
    Object.defineProperty(t, o, {
      enumerable: !0,
      configurable: !0,
      get: () => e.props[o],
      set: Y
    });
  });
}
function il(e) {
  const { ctx: t, setupState: n } = e;
  Object.keys(I(n)).forEach((o) => {
    if (!n.__isScriptSetup) {
      if (vo(o[0])) {
        b(
          `setup() return property ${JSON.stringify(
            o
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(t, o, {
        enumerable: !0,
        configurable: !0,
        get: () => n[o],
        set: Y
      });
    }
  });
}
function Ko(e) {
  return C(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function ll() {
  const e = /* @__PURE__ */ Object.create(null);
  return (t, n) => {
    e[n] ? b(`${t} property "${n}" is already defined in ${e[n]}.`) : e[n] = t;
  };
}
let Jn = !0;
function cl(e) {
  const t = No(e), n = e.proxy, o = e.ctx;
  Jn = !1, t.beforeCreate && ko(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: s,
    methods: i,
    watch: c,
    provide: u,
    inject: a,
    // lifecycle
    created: h,
    beforeMount: p,
    mounted: v,
    beforeUpdate: x,
    updated: j,
    activated: M,
    deactivated: W,
    beforeDestroy: J,
    beforeUnmount: ge,
    destroyed: H,
    unmounted: _e,
    render: $,
    renderTracked: De,
    renderTriggered: Ee,
    errorCaptured: le,
    serverPrefetch: se,
    // public API
    expose: Ve,
    inheritAttrs: Ae,
    // assets
    components: ce,
    directives: Lt,
    filters: Do
  } = t, Re = process.env.NODE_ENV !== "production" ? ll() : null;
  if (process.env.NODE_ENV !== "production") {
    const [S] = e.propsOptions;
    if (S)
      for (const F in S)
        Re("Props", F);
  }
  if (a && fl(a, o, Re), i)
    for (const S in i) {
      const F = i[S];
      T(F) ? (process.env.NODE_ENV !== "production" ? Object.defineProperty(o, S, {
        value: F.bind(n),
        configurable: !0,
        enumerable: !0,
        writable: !0
      }) : o[S] = F.bind(n), process.env.NODE_ENV !== "production" && Re("Methods", S)) : process.env.NODE_ENV !== "production" && b(
        `Method "${S}" has type "${typeof F}" in the component definition. Did you reference the function correctly?`
      );
    }
  if (r) {
    process.env.NODE_ENV !== "production" && !T(r) && b(
      "The data option must be a function. Plain object usage is no longer supported."
    );
    const S = r.call(n, n);
    if (process.env.NODE_ENV !== "production" && oo(S) && b(
      "data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."
    ), !K(S))
      process.env.NODE_ENV !== "production" && b("data() should return an object.");
    else if (e.data = _n(S), process.env.NODE_ENV !== "production")
      for (const F in S)
        Re("Data", F), vo(F[0]) || Object.defineProperty(o, F, {
          configurable: !0,
          enumerable: !0,
          get: () => S[F],
          set: Y
        });
  }
  if (Jn = !0, s)
    for (const S in s) {
      const F = s[S], ve = T(F) ? F.bind(n, n) : T(F.get) ? F.get.bind(n, n) : Y;
      process.env.NODE_ENV !== "production" && ve === Y && b(`Computed property "${S}" has no getter.`);
      const xn = !T(F) && T(F.set) ? F.set.bind(n) : process.env.NODE_ENV !== "production" ? () => {
        b(
          `Write operation failed: computed property "${S}" is readonly.`
        );
      } : Y, bt = Yl({
        get: ve,
        set: xn
      });
      Object.defineProperty(o, S, {
        enumerable: !0,
        configurable: !0,
        get: () => bt.value,
        set: (ct) => bt.value = ct
      }), process.env.NODE_ENV !== "production" && Re("Computed", S);
    }
  if (c)
    for (const S in c)
      Xr(c[S], o, n, S);
  if (u) {
    const S = T(u) ? u.call(n) : u;
    Reflect.ownKeys(S).forEach((F) => {
      ml(F, S[F]);
    });
  }
  h && ko(h, e, "c");
  function oe(S, F) {
    C(F) ? F.forEach((ve) => S(ve.bind(n))) : F && S(F.bind(n));
  }
  if (oe(Ji, p), oe(Yi, v), oe(Xi, x), oe(Zi, j), oe(Wi, M), oe(qi, W), oe(nl, le), oe(tl, De), oe(el, Ee), oe(Qi, ge), oe(Jr, _e), oe(Gi, se), C(Ve))
    if (Ve.length) {
      const S = e.exposed || (e.exposed = {});
      Ve.forEach((F) => {
        Object.defineProperty(S, F, {
          get: () => n[F],
          set: (ve) => n[F] = ve
        });
      });
    } else
      e.exposed || (e.exposed = {});
  $ && e.render === Y && (e.render = $), Ae != null && (e.inheritAttrs = Ae), ce && (e.components = ce), Lt && (e.directives = Lt);
}
function fl(e, t, n = Y) {
  C(e) && (e = Yn(e));
  for (const o in e) {
    const r = e[o];
    let s;
    K(r) ? "default" in r ? s = Qt(
      r.from || o,
      r.default,
      !0
      /* treat default function as factory */
    ) : s = Qt(r.from || o) : s = Qt(r), G(s) ? Object.defineProperty(t, o, {
      enumerable: !0,
      configurable: !0,
      get: () => s.value,
      set: (i) => s.value = i
    }) : t[o] = s, process.env.NODE_ENV !== "production" && n("Inject", o);
  }
}
function ko(e, t, n) {
  he(
    C(e) ? e.map((o) => o.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Xr(e, t, n, o) {
  const r = o.includes(".") ? Wr(n, o) : () => n[o];
  if (q(e)) {
    const s = t[e];
    T(s) ? Pn(r, s) : process.env.NODE_ENV !== "production" && b(`Invalid watch handler specified by key "${e}"`, s);
  } else if (T(e))
    Pn(r, e.bind(n));
  else if (K(e))
    if (C(e))
      e.forEach((s) => Xr(s, t, n, o));
    else {
      const s = T(e.handler) ? e.handler.bind(n) : t[e.handler];
      T(s) ? Pn(r, s, e) : process.env.NODE_ENV !== "production" && b(`Invalid watch handler specified by key "${e.handler}"`, s);
    }
  else
    process.env.NODE_ENV !== "production" && b(`Invalid watch option: "${o}"`, e);
}
function No(e) {
  const t = e.type, { mixins: n, extends: o } = t, {
    mixins: r,
    optionsCache: s,
    config: { optionMergeStrategies: i }
  } = e.appContext, c = s.get(t);
  let u;
  return c ? u = c : !r.length && !n && !o ? u = t : (u = {}, r.length && r.forEach(
    (a) => cn(u, a, i, !0)
  ), cn(u, t, i)), K(t) && s.set(t, u), u;
}
function cn(e, t, n, o = !1) {
  const { mixins: r, extends: s } = t;
  s && cn(e, s, n, !0), r && r.forEach(
    (i) => cn(e, i, n, !0)
  );
  for (const i in t)
    if (o && i === "expose")
      process.env.NODE_ENV !== "production" && b(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const c = ul[i] || n && n[i];
      e[i] = c ? c(e[i], t[i]) : t[i];
    }
  return e;
}
const ul = {
  data: Wo,
  props: qo,
  emits: qo,
  // objects
  methods: Tt,
  computed: Tt,
  // lifecycle
  beforeCreate: te,
  created: te,
  beforeMount: te,
  mounted: te,
  beforeUpdate: te,
  updated: te,
  beforeDestroy: te,
  beforeUnmount: te,
  destroyed: te,
  unmounted: te,
  activated: te,
  deactivated: te,
  errorCaptured: te,
  serverPrefetch: te,
  // assets
  components: Tt,
  directives: Tt,
  // watch
  watch: pl,
  // provide / inject
  provide: Wo,
  inject: al
};
function Wo(e, t) {
  return t ? e ? function() {
    return k(
      T(e) ? e.call(this, this) : e,
      T(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function al(e, t) {
  return Tt(Yn(e), Yn(t));
}
function Yn(e) {
  if (C(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function te(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Tt(e, t) {
  return e ? k(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function qo(e, t) {
  return e ? C(e) && C(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : k(
    /* @__PURE__ */ Object.create(null),
    Ko(e),
    Ko(t ?? {})
  ) : t;
}
function pl(e, t) {
  if (!e)
    return t;
  if (!t)
    return e;
  const n = k(/* @__PURE__ */ Object.create(null), e);
  for (const o in t)
    n[o] = te(e[o], t[o]);
  return n;
}
function Zr() {
  return {
    app: null,
    config: {
      isNativeTag: hr,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let dl = 0;
function hl(e, t) {
  return function(o, r = null) {
    T(o) || (o = k({}, o)), r != null && !K(r) && (process.env.NODE_ENV !== "production" && b("root props passed to app.mount() must be an object."), r = null);
    const s = Zr();
    process.env.NODE_ENV !== "production" && Object.defineProperty(s.config, "unwrapInjectedRef", {
      get() {
        return !0;
      },
      set() {
        b(
          "app.config.unwrapInjectedRef has been deprecated. 3.3 now always unwraps injected refs in Options API."
        );
      }
    });
    const i = /* @__PURE__ */ new WeakSet();
    let c = !1;
    const u = s.app = {
      _uid: dl++,
      _component: o,
      _props: r,
      _container: null,
      _context: s,
      _instance: null,
      version: rr,
      get config() {
        return s.config;
      },
      set config(a) {
        process.env.NODE_ENV !== "production" && b(
          "app.config cannot be replaced. Modify individual options instead."
        );
      },
      use(a, ...h) {
        return i.has(a) ? process.env.NODE_ENV !== "production" && b("Plugin has already been applied to target app.") : a && T(a.install) ? (i.add(a), a.install(u, ...h)) : T(a) ? (i.add(a), a(u, ...h)) : process.env.NODE_ENV !== "production" && b(
          'A plugin must either be a function or an object with an "install" function.'
        ), u;
      },
      mixin(a) {
        return s.mixins.includes(a) ? process.env.NODE_ENV !== "production" && b(
          "Mixin has already been applied to target app" + (a.name ? `: ${a.name}` : "")
        ) : s.mixins.push(a), u;
      },
      component(a, h) {
        return process.env.NODE_ENV !== "production" && Gn(a, s.config), h ? (process.env.NODE_ENV !== "production" && s.components[a] && b(`Component "${a}" has already been registered in target app.`), s.components[a] = h, u) : s.components[a];
      },
      directive(a, h) {
        return process.env.NODE_ENV !== "production" && qr(a), h ? (process.env.NODE_ENV !== "production" && s.directives[a] && b(`Directive "${a}" has already been registered in target app.`), s.directives[a] = h, u) : s.directives[a];
      },
      mount(a, h, p) {
        if (c)
          process.env.NODE_ENV !== "production" && b(
            "App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`"
          );
        else {
          process.env.NODE_ENV !== "production" && a.__vue_app__ && b(
            "There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first."
          );
          const v = tt(o, r);
          return v.appContext = s, process.env.NODE_ENV !== "production" && (s.reload = () => {
            e(Ke(v), a, p);
          }), h && t ? t(v, a) : e(v, a, p), c = !0, u._container = a, a.__vue_app__ = u, process.env.NODE_ENV !== "production" && (u._instance = v.component, wi(u, rr)), xo(v.component) || v.component.proxy;
        }
      },
      unmount() {
        c ? (e(null, u._container), process.env.NODE_ENV !== "production" && (u._instance = null, xi(u)), delete u._container.__vue_app__) : process.env.NODE_ENV !== "production" && b("Cannot unmount an app that is not mounted.");
      },
      provide(a, h) {
        return process.env.NODE_ENV !== "production" && a in s.provides && b(
          `App already provides property with key "${String(a)}". It will be overwritten with the new value.`
        ), s.provides[a] = h, u;
      },
      runWithContext(a) {
        fn = u;
        try {
          return a();
        } finally {
          fn = null;
        }
      }
    };
    return u;
  };
}
let fn = null;
function ml(e, t) {
  if (!X)
    process.env.NODE_ENV !== "production" && b("provide() can only be used inside setup().");
  else {
    let n = X.provides;
    const o = X.parent && X.parent.provides;
    o === n && (n = X.provides = Object.create(o)), n[e] = t;
  }
}
function Qt(e, t, n = !1) {
  const o = X || ie;
  if (o || fn) {
    const r = o ? o.parent == null ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : fn._context.provides;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && T(t) ? t.call(o && o.proxy) : t;
    process.env.NODE_ENV !== "production" && b(`injection "${String(e)}" not found.`);
  } else
    process.env.NODE_ENV !== "production" && b("inject() can only be used inside setup() or functional components.");
}
function gl(e, t, n, o = !1) {
  const r = {}, s = {};
  on(s, yn, 1), e.propsDefaults = /* @__PURE__ */ Object.create(null), Qr(e, t, r, s);
  for (const i in e.propsOptions[0])
    i in r || (r[i] = void 0);
  process.env.NODE_ENV !== "production" && es(t || {}, r, e), n ? e.props = o ? r : ri(r) : e.type.props ? e.props = r : e.props = s, e.attrs = s;
}
function _l(e) {
  for (; e; ) {
    if (e.type.__hmrId)
      return !0;
    e = e.parent;
  }
}
function El(e, t, n, o) {
  const {
    props: r,
    attrs: s,
    vnode: { patchFlag: i }
  } = e, c = I(r), [u] = e.propsOptions;
  let a = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(process.env.NODE_ENV !== "production" && _l(e)) && (o || i > 0) && !(i & 16)
  ) {
    if (i & 8) {
      const h = e.vnode.dynamicProps;
      for (let p = 0; p < h.length; p++) {
        let v = h[p];
        if (bn(e.emitsOptions, v))
          continue;
        const x = t[v];
        if (u)
          if (A(s, v))
            x !== s[v] && (s[v] = x, a = !0);
          else {
            const j = Et(v);
            r[j] = Xn(
              u,
              c,
              j,
              x,
              e,
              !1
              /* isAbsent */
            );
          }
        else
          x !== s[v] && (s[v] = x, a = !0);
      }
    }
  } else {
    Qr(e, t, r, s) && (a = !0);
    let h;
    for (const p in c)
      (!t || // for camelCase
      !A(t, p) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((h = Ue(p)) === p || !A(t, h))) && (u ? n && // for camelCase
      (n[p] !== void 0 || // for kebab-case
      n[h] !== void 0) && (r[p] = Xn(
        u,
        c,
        p,
        void 0,
        e,
        !0
        /* isAbsent */
      )) : delete r[p]);
    if (s !== c)
      for (const p in s)
        (!t || !A(t, p)) && (delete s[p], a = !0);
  }
  a && xe(e, "set", "$attrs"), process.env.NODE_ENV !== "production" && es(t || {}, r, e);
}
function Qr(e, t, n, o) {
  const [r, s] = e.propsOptions;
  let i = !1, c;
  if (t)
    for (let u in t) {
      if (Jt(u))
        continue;
      const a = t[u];
      let h;
      r && A(r, h = Et(u)) ? !s || !s.includes(h) ? n[h] = a : (c || (c = {}))[h] = a : bn(e.emitsOptions, u) || (!(u in o) || a !== o[u]) && (o[u] = a, i = !0);
    }
  if (s) {
    const u = I(n), a = c || B;
    for (let h = 0; h < s.length; h++) {
      const p = s[h];
      n[p] = Xn(
        r,
        u,
        p,
        a[p],
        e,
        !A(a, p)
      );
    }
  }
  return i;
}
function Xn(e, t, n, o, r, s) {
  const i = e[n];
  if (i != null) {
    const c = A(i, "default");
    if (c && o === void 0) {
      const u = i.default;
      if (i.type !== Function && !i.skipFactory && T(u)) {
        const { propsDefaults: a } = r;
        n in a ? o = a[n] : (Nt(r), o = a[n] = u.call(
          null,
          t
        ), nt());
      } else
        o = u;
    }
    i[
      0
      /* shouldCast */
    ] && (s && !c ? o = !1 : i[
      1
      /* shouldCastTrue */
    ] && (o === "" || o === Ue(n)) && (o = !0));
  }
  return o;
}
function Gr(e, t, n = !1) {
  const o = t.propsCache, r = o.get(e);
  if (r)
    return r;
  const s = e.props, i = {}, c = [];
  let u = !1;
  if (!T(e)) {
    const h = (p) => {
      u = !0;
      const [v, x] = Gr(p, t, !0);
      k(i, v), x && c.push(...x);
    };
    !n && t.mixins.length && t.mixins.forEach(h), e.extends && h(e.extends), e.mixins && e.mixins.forEach(h);
  }
  if (!s && !u)
    return K(e) && o.set(e, mt), mt;
  if (C(s))
    for (let h = 0; h < s.length; h++) {
      process.env.NODE_ENV !== "production" && !q(s[h]) && b("props must be strings when using array syntax.", s[h]);
      const p = Et(s[h]);
      zo(p) && (i[p] = B);
    }
  else if (s) {
    process.env.NODE_ENV !== "production" && !K(s) && b("invalid props options", s);
    for (const h in s) {
      const p = Et(h);
      if (zo(p)) {
        const v = s[h], x = i[p] = C(v) || T(v) ? { type: v } : k({}, v);
        if (x) {
          const j = Yo(Boolean, x.type), M = Yo(String, x.type);
          x[
            0
            /* shouldCast */
          ] = j > -1, x[
            1
            /* shouldCastTrue */
          ] = M < 0 || j < M, (j > -1 || A(x, "default")) && c.push(p);
        }
      }
    }
  }
  const a = [i, c];
  return K(e) && o.set(e, a), a;
}
function zo(e) {
  return e[0] !== "$" ? !0 : (process.env.NODE_ENV !== "production" && b(`Invalid prop name: "${e}" is a reserved property.`), !1);
}
function Zn(e) {
  const t = e && e.toString().match(/^\s*(function|class) (\w+)/);
  return t ? t[2] : e === null ? "null" : "";
}
function Jo(e, t) {
  return Zn(e) === Zn(t);
}
function Yo(e, t) {
  return C(t) ? t.findIndex((n) => Jo(n, e)) : T(t) && Jo(t, e) ? 0 : -1;
}
function es(e, t, n) {
  const o = I(t), r = n.propsOptions[0];
  for (const s in r) {
    let i = r[s];
    i != null && vl(
      s,
      o[s],
      i,
      !A(e, s) && !A(e, Ue(s))
    );
  }
}
function vl(e, t, n, o) {
  const { type: r, required: s, validator: i, skipCheck: c } = n;
  if (s && o) {
    b('Missing required prop: "' + e + '"');
    return;
  }
  if (!(t == null && !s)) {
    if (r != null && r !== !0 && !c) {
      let u = !1;
      const a = C(r) ? r : [r], h = [];
      for (let p = 0; p < a.length && !u; p++) {
        const { valid: v, expectedType: x } = bl(t, a[p]);
        h.push(x || ""), u = v;
      }
      if (!u) {
        b(Ol(e, t, h));
        return;
      }
    }
    i && !i(t) && b('Invalid prop: custom validator check failed for prop "' + e + '".');
  }
}
const Nl = /* @__PURE__ */ ke(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function bl(e, t) {
  let n;
  const o = Zn(t);
  if (Nl(o)) {
    const r = typeof e;
    n = r === o.toLowerCase(), !n && r === "object" && (n = e instanceof t);
  } else
    o === "Object" ? n = K(e) : o === "Array" ? n = C(e) : o === "null" ? n = e === null : n = e instanceof t;
  return {
    valid: n,
    expectedType: o
  };
}
function Ol(e, t, n) {
  if (n.length === 0)
    return `Prop type [] for prop "${e}" won't match anything. Did you mean to use type Array instead?`;
  let o = `Invalid prop: type check failed for prop "${e}". Expected ${n.map(hn).join(" | ")}`;
  const r = n[0], s = ro(t), i = Xo(t, r), c = Xo(t, s);
  return n.length === 1 && Zo(r) && !yl(r, s) && (o += ` with value ${i}`), o += `, got ${s} `, Zo(s) && (o += `with value ${c}.`), o;
}
function Xo(e, t) {
  return t === "String" ? `"${e}"` : t === "Number" ? `${Number(e)}` : `${e}`;
}
function Zo(e) {
  return ["string", "number", "boolean"].some((n) => e.toLowerCase() === n);
}
function yl(...e) {
  return e.some((t) => t.toLowerCase() === "boolean");
}
const ts = (e) => e[0] === "_" || e === "$stable", bo = (e) => C(e) ? e.map(pe) : [pe(e)], wl = (e, t, n) => {
  if (t._n)
    return t;
  const o = Ai((...r) => (process.env.NODE_ENV !== "production" && X && b(
    `Slot "${e}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
  ), bo(t(...r))), n);
  return o._c = !1, o;
}, ns = (e, t, n) => {
  const o = e._ctx;
  for (const r in e) {
    if (ts(r))
      continue;
    const s = e[r];
    if (T(s))
      t[r] = wl(r, s, o);
    else if (s != null) {
      process.env.NODE_ENV !== "production" && b(
        `Non-function value encountered for slot "${r}". Prefer function slots for better performance.`
      );
      const i = bo(s);
      t[r] = () => i;
    }
  }
}, os = (e, t) => {
  process.env.NODE_ENV !== "production" && !Eo(e.vnode) && b(
    "Non-function value encountered for default slot. Prefer function slots for better performance."
  );
  const n = bo(t);
  e.slots.default = () => n;
}, xl = (e, t) => {
  if (e.vnode.shapeFlag & 32) {
    const n = t._;
    n ? (e.slots = I(t), on(t, "_", n)) : ns(
      t,
      e.slots = {}
    );
  } else
    e.slots = {}, t && os(e, t);
  on(e.slots, yn, 1);
}, Dl = (e, t, n) => {
  const { vnode: o, slots: r } = e;
  let s = !0, i = B;
  if (o.shapeFlag & 32) {
    const c = t._;
    c ? process.env.NODE_ENV !== "production" && Ge ? (k(r, t), xe(e, "set", "$slots")) : n && c === 1 ? s = !1 : (k(r, t), !n && c === 1 && delete r._) : (s = !t.$stable, ns(t, r)), i = t;
  } else
    t && (os(e, t), i = { default: 1 });
  if (s)
    for (const c in r)
      !ts(c) && i[c] == null && delete r[c];
};
function Qn(e, t, n, o, r = !1) {
  if (C(e)) {
    e.forEach(
      (v, x) => Qn(
        v,
        t && (C(t) ? t[x] : t),
        n,
        o,
        r
      )
    );
    return;
  }
  if (Zt(o) && !r)
    return;
  const s = o.shapeFlag & 4 ? xo(o.component) || o.component.proxy : o.el, i = r ? null : s, { i: c, r: u } = e;
  if (process.env.NODE_ENV !== "production" && !c) {
    b(
      "Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function."
    );
    return;
  }
  const a = t && t.r, h = c.refs === B ? c.refs = {} : c.refs, p = c.setupState;
  if (a != null && a !== u && (q(a) ? (h[a] = null, A(p, a) && (p[a] = null)) : G(a) && (a.value = null)), T(u))
    Pe(u, c, 12, [i, h]);
  else {
    const v = q(u), x = G(u);
    if (v || x) {
      const j = () => {
        if (e.f) {
          const M = v ? A(p, u) ? p[u] : h[u] : u.value;
          r ? C(M) && no(M, s) : C(M) ? M.includes(s) || M.push(s) : v ? (h[u] = [s], A(p, u) && (p[u] = h[u])) : (u.value = [s], e.k && (h[e.k] = u.value));
        } else
          v ? (h[u] = i, A(p, u) && (p[u] = i)) : x ? (u.value = i, e.k && (h[e.k] = i)) : process.env.NODE_ENV !== "production" && b("Invalid template ref type:", u, `(${typeof u})`);
      };
      i ? (j.id = -1, re(j, n)) : j();
    } else
      process.env.NODE_ENV !== "production" && b("Invalid template ref type:", u, `(${typeof u})`);
  }
}
let wt, He;
function Te(e, t) {
  e.appContext.config.performance && un() && He.mark(`vue-${t}-${e.uid}`), process.env.NODE_ENV !== "production" && Ti(e, t, un() ? He.now() : Date.now());
}
function $e(e, t) {
  if (e.appContext.config.performance && un()) {
    const n = `vue-${t}-${e.uid}`, o = n + ":end";
    He.mark(o), He.measure(
      `<${wn(e, e.type)}> ${t}`,
      n,
      o
    ), He.clearMarks(n), He.clearMarks(o);
  }
  process.env.NODE_ENV !== "production" && $i(e, t, un() ? He.now() : Date.now());
}
function un() {
  return wt !== void 0 || (typeof window < "u" && window.performance ? (wt = !0, He = window.performance) : wt = !1), wt;
}
function Vl() {
  const e = [];
  if (process.env.NODE_ENV !== "production" && e.length) {
    const t = e.length > 1;
    console.warn(
      `Feature flag${t ? "s" : ""} ${e.join(", ")} ${t ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
    );
  }
}
const re = Ui;
function Cl(e) {
  return Tl(e);
}
function Tl(e, t) {
  Vl();
  const n = rn();
  n.__VUE__ = !0, process.env.NODE_ENV !== "production" && Hr(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n);
  const {
    insert: o,
    remove: r,
    patchProp: s,
    createElement: i,
    createText: c,
    createComment: u,
    setText: a,
    setElementText: h,
    parentNode: p,
    nextSibling: v,
    setScopeId: x = Y,
    insertStaticContent: j
  } = e, M = (l, f, d, m = null, g = null, N = null, y = !1, E = null, O = process.env.NODE_ENV !== "production" && Ge ? !1 : !!f.dynamicChildren) => {
    if (l === f)
      return;
    l && !xt(l, f) && (m = Ut(l), Me(l, g, N, !0), l = null), f.patchFlag === -2 && (O = !1, f.dynamicChildren = null);
    const { type: _, ref: D, shapeFlag: w } = f;
    switch (_) {
      case Ht:
        W(l, f, d, m);
        break;
      case me:
        J(l, f, d, m);
        break;
      case en:
        l == null ? ge(f, d, m, y) : process.env.NODE_ENV !== "production" && H(l, f, d, y);
        break;
      case ae:
        Lt(
          l,
          f,
          d,
          m,
          g,
          N,
          y,
          E,
          O
        );
        break;
      default:
        w & 1 ? De(
          l,
          f,
          d,
          m,
          g,
          N,
          y,
          E,
          O
        ) : w & 6 ? Do(
          l,
          f,
          d,
          m,
          g,
          N,
          y,
          E,
          O
        ) : w & 64 || w & 128 ? _.process(
          l,
          f,
          d,
          m,
          g,
          N,
          y,
          E,
          O,
          ft
        ) : process.env.NODE_ENV !== "production" && b("Invalid VNode type:", _, `(${typeof _})`);
    }
    D != null && g && Qn(D, l && l.ref, N, f || l, !f);
  }, W = (l, f, d, m) => {
    if (l == null)
      o(
        f.el = c(f.children),
        d,
        m
      );
    else {
      const g = f.el = l.el;
      f.children !== l.children && a(g, f.children);
    }
  }, J = (l, f, d, m) => {
    l == null ? o(
      f.el = u(f.children || ""),
      d,
      m
    ) : f.el = l.el;
  }, ge = (l, f, d, m) => {
    [l.el, l.anchor] = j(
      l.children,
      f,
      d,
      m,
      l.el,
      l.anchor
    );
  }, H = (l, f, d, m) => {
    if (f.children !== l.children) {
      const g = v(l.anchor);
      $(l), [f.el, f.anchor] = j(
        f.children,
        d,
        g,
        m
      );
    } else
      f.el = l.el, f.anchor = l.anchor;
  }, _e = ({ el: l, anchor: f }, d, m) => {
    let g;
    for (; l && l !== f; )
      g = v(l), o(l, d, m), l = g;
    o(f, d, m);
  }, $ = ({ el: l, anchor: f }) => {
    let d;
    for (; l && l !== f; )
      d = v(l), r(l), l = d;
    r(f);
  }, De = (l, f, d, m, g, N, y, E, O) => {
    y = y || f.type === "svg", l == null ? Ee(
      f,
      d,
      m,
      g,
      N,
      y,
      E,
      O
    ) : Ve(
      l,
      f,
      g,
      N,
      y,
      E,
      O
    );
  }, Ee = (l, f, d, m, g, N, y, E) => {
    let O, _;
    const { type: D, props: w, shapeFlag: V, transition: P, dirs: R } = l;
    if (O = l.el = i(
      l.type,
      N,
      w && w.is,
      w
    ), V & 8 ? h(O, l.children) : V & 16 && se(
      l.children,
      O,
      null,
      m,
      g,
      N && D !== "foreignObject",
      y,
      E
    ), R && We(l, null, m, "created"), le(O, l, l.scopeId, y, m), w) {
      for (const L in w)
        L !== "value" && !Jt(L) && s(
          O,
          L,
          null,
          w[L],
          N,
          l.children,
          m,
          g,
          Ce
        );
      "value" in w && s(O, "value", null, w.value), (_ = w.onVnodeBeforeMount) && be(_, m, l);
    }
    process.env.NODE_ENV !== "production" && (Object.defineProperty(O, "__vnode", {
      value: l,
      enumerable: !1
    }), Object.defineProperty(O, "__vueParentComponent", {
      value: m,
      enumerable: !1
    })), R && We(l, null, m, "beforeMount");
    const U = $l(g, P);
    U && P.beforeEnter(O), o(O, f, d), ((_ = w && w.onVnodeMounted) || U || R) && re(() => {
      _ && be(_, m, l), U && P.enter(O), R && We(l, null, m, "mounted");
    }, g);
  }, le = (l, f, d, m, g) => {
    if (d && x(l, d), m)
      for (let N = 0; N < m.length; N++)
        x(l, m[N]);
    if (g) {
      let N = g.subTree;
      if (process.env.NODE_ENV !== "production" && N.patchFlag > 0 && N.patchFlag & 2048 && (N = kr(N.children) || N), f === N) {
        const y = g.vnode;
        le(
          l,
          y,
          y.scopeId,
          y.slotScopeIds,
          g.parent
        );
      }
    }
  }, se = (l, f, d, m, g, N, y, E, O = 0) => {
    for (let _ = O; _ < l.length; _++) {
      const D = l[_] = E ? je(l[_]) : pe(l[_]);
      M(
        null,
        D,
        f,
        d,
        m,
        g,
        N,
        y,
        E
      );
    }
  }, Ve = (l, f, d, m, g, N, y) => {
    const E = f.el = l.el;
    let { patchFlag: O, dynamicChildren: _, dirs: D } = f;
    O |= l.patchFlag & 16;
    const w = l.props || B, V = f.props || B;
    let P;
    d && qe(d, !1), (P = V.onVnodeBeforeUpdate) && be(P, d, f, l), D && We(f, l, d, "beforeUpdate"), d && qe(d, !0), process.env.NODE_ENV !== "production" && Ge && (O = 0, y = !1, _ = null);
    const R = g && f.type !== "foreignObject";
    if (_ ? (Ae(
      l.dynamicChildren,
      _,
      E,
      d,
      m,
      R,
      N
    ), process.env.NODE_ENV !== "production" && Gt(l, f)) : y || ve(
      l,
      f,
      E,
      null,
      d,
      m,
      R,
      N,
      !1
    ), O > 0) {
      if (O & 16)
        ce(
          E,
          f,
          w,
          V,
          d,
          m,
          g
        );
      else if (O & 2 && w.class !== V.class && s(E, "class", null, V.class, g), O & 4 && s(E, "style", w.style, V.style, g), O & 8) {
        const U = f.dynamicProps;
        for (let L = 0; L < U.length; L++) {
          const z = U[L], fe = w[z], ut = V[z];
          (ut !== fe || z === "value") && s(
            E,
            z,
            fe,
            ut,
            g,
            l.children,
            d,
            m,
            Ce
          );
        }
      }
      O & 1 && l.children !== f.children && h(E, f.children);
    } else
      !y && _ == null && ce(
        E,
        f,
        w,
        V,
        d,
        m,
        g
      );
    ((P = V.onVnodeUpdated) || D) && re(() => {
      P && be(P, d, f, l), D && We(f, l, d, "updated");
    }, m);
  }, Ae = (l, f, d, m, g, N, y) => {
    for (let E = 0; E < f.length; E++) {
      const O = l[E], _ = f[E], D = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        O.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (O.type === ae || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !xt(O, _) || // - In the case of a component, it could contain anything.
        O.shapeFlag & 70) ? p(O.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          d
        )
      );
      M(
        O,
        _,
        D,
        null,
        m,
        g,
        N,
        y,
        !0
      );
    }
  }, ce = (l, f, d, m, g, N, y) => {
    if (d !== m) {
      if (d !== B)
        for (const E in d)
          !Jt(E) && !(E in m) && s(
            l,
            E,
            d[E],
            null,
            y,
            f.children,
            g,
            N,
            Ce
          );
      for (const E in m) {
        if (Jt(E))
          continue;
        const O = m[E], _ = d[E];
        O !== _ && E !== "value" && s(
          l,
          E,
          _,
          O,
          y,
          f.children,
          g,
          N,
          Ce
        );
      }
      "value" in m && s(l, "value", d.value, m.value);
    }
  }, Lt = (l, f, d, m, g, N, y, E, O) => {
    const _ = f.el = l ? l.el : c(""), D = f.anchor = l ? l.anchor : c("");
    let { patchFlag: w, dynamicChildren: V, slotScopeIds: P } = f;
    process.env.NODE_ENV !== "production" && // #5523 dev root fragment may inherit directives
    (Ge || w & 2048) && (w = 0, O = !1, V = null), P && (E = E ? E.concat(P) : P), l == null ? (o(_, d, m), o(D, d, m), se(
      f.children,
      d,
      D,
      g,
      N,
      y,
      E,
      O
    )) : w > 0 && w & 64 && V && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    l.dynamicChildren ? (Ae(
      l.dynamicChildren,
      V,
      d,
      g,
      N,
      y,
      E
    ), process.env.NODE_ENV !== "production" ? Gt(l, f) : (
      // #2080 if the stable fragment has a key, it's a <template v-for> that may
      //  get moved around. Make sure all root level vnodes inherit el.
      // #2134 or if it's a component root, it may also get moved around
      // as the component is being moved.
      (f.key != null || g && f === g.subTree) && Gt(
        l,
        f,
        !0
        /* shallow */
      )
    )) : ve(
      l,
      f,
      d,
      D,
      g,
      N,
      y,
      E,
      O
    );
  }, Do = (l, f, d, m, g, N, y, E, O) => {
    f.slotScopeIds = E, l == null ? f.shapeFlag & 512 ? g.ctx.activate(
      f,
      d,
      m,
      y,
      O
    ) : Re(
      f,
      d,
      m,
      g,
      N,
      y,
      O
    ) : oe(l, f, O);
  }, Re = (l, f, d, m, g, N, y) => {
    const E = l.component = Ul(
      l,
      m,
      g
    );
    if (process.env.NODE_ENV !== "production" && E.type.__hmrId && Ni(E), process.env.NODE_ENV !== "production" && (Yt(l), Te(E, "mount")), Eo(l) && (E.ctx.renderer = ft), process.env.NODE_ENV !== "production" && Te(E, "init"), Kl(E), process.env.NODE_ENV !== "production" && $e(E, "init"), E.asyncDep) {
      if (g && g.registerDep(E, S), !l.el) {
        const O = E.subTree = tt(me);
        J(null, O, f, d);
      }
      return;
    }
    S(
      E,
      l,
      f,
      d,
      g,
      N,
      y
    ), process.env.NODE_ENV !== "production" && (Xt(), $e(E, "mount"));
  }, oe = (l, f, d) => {
    const m = f.component = l.component;
    if (Fi(l, f, d))
      if (m.asyncDep && !m.asyncResolved) {
        process.env.NODE_ENV !== "production" && Yt(f), F(m, f, d), process.env.NODE_ENV !== "production" && Xt();
        return;
      } else
        m.next = f, Ei(m.update), m.update();
    else
      f.el = l.el, m.vnode = f;
  }, S = (l, f, d, m, g, N, y) => {
    const E = () => {
      if (l.isMounted) {
        let { next: D, bu: w, u: V, parent: P, vnode: R } = l, U = D, L;
        process.env.NODE_ENV !== "production" && Yt(D || l.vnode), qe(l, !1), D ? (D.el = R.el, F(l, D, y)) : D = R, w && yt(w), (L = D.props && D.props.onVnodeBeforeUpdate) && be(L, P, D, R), qe(l, !0), process.env.NODE_ENV !== "production" && Te(l, "render");
        const z = $n(l);
        process.env.NODE_ENV !== "production" && $e(l, "render");
        const fe = l.subTree;
        l.subTree = z, process.env.NODE_ENV !== "production" && Te(l, "patch"), M(
          fe,
          z,
          // parent may have changed if it's in a teleport
          p(fe.el),
          // anchor may have changed if it's in a fragment
          Ut(fe),
          l,
          g,
          N
        ), process.env.NODE_ENV !== "production" && $e(l, "patch"), D.el = z.el, U === null && ji(l, z.el), V && re(V, g), (L = D.props && D.props.onVnodeUpdated) && re(
          () => be(L, P, D, R),
          g
        ), process.env.NODE_ENV !== "production" && Lr(l), process.env.NODE_ENV !== "production" && Xt();
      } else {
        let D;
        const { el: w, props: V } = f, { bm: P, m: R, parent: U } = l, L = Zt(f);
        if (qe(l, !1), P && yt(P), !L && (D = V && V.onVnodeBeforeMount) && be(D, U, f), qe(l, !0), w && Cn) {
          const z = () => {
            process.env.NODE_ENV !== "production" && Te(l, "render"), l.subTree = $n(l), process.env.NODE_ENV !== "production" && $e(l, "render"), process.env.NODE_ENV !== "production" && Te(l, "hydrate"), Cn(
              w,
              l.subTree,
              l,
              g,
              null
            ), process.env.NODE_ENV !== "production" && $e(l, "hydrate");
          };
          L ? f.type.__asyncLoader().then(
            // note: we are moving the render call into an async callback,
            // which means it won't track dependencies - but it's ok because
            // a server-rendered async wrapper is already in resolved state
            // and it will never need to change.
            () => !l.isUnmounted && z()
          ) : z();
        } else {
          process.env.NODE_ENV !== "production" && Te(l, "render");
          const z = l.subTree = $n(l);
          process.env.NODE_ENV !== "production" && $e(l, "render"), process.env.NODE_ENV !== "production" && Te(l, "patch"), M(
            null,
            z,
            d,
            m,
            l,
            g,
            N
          ), process.env.NODE_ENV !== "production" && $e(l, "patch"), f.el = z.el;
        }
        if (R && re(R, g), !L && (D = V && V.onVnodeMounted)) {
          const z = f;
          re(
            () => be(D, U, z),
            g
          );
        }
        (f.shapeFlag & 256 || U && Zt(U.vnode) && U.vnode.shapeFlag & 256) && l.a && re(l.a, g), l.isMounted = !0, process.env.NODE_ENV !== "production" && Di(l), f = d = m = null;
      }
    }, O = l.effect = new co(
      E,
      () => Nn(_),
      l.scope
      // track it in component's effect scope
    ), _ = l.update = () => O.run();
    _.id = l.uid, qe(l, !0), process.env.NODE_ENV !== "production" && (O.onTrack = l.rtc ? (D) => yt(l.rtc, D) : void 0, O.onTrigger = l.rtg ? (D) => yt(l.rtg, D) : void 0, _.ownerInstance = l), _();
  }, F = (l, f, d) => {
    f.component = l;
    const m = l.vnode.props;
    l.vnode = f, l.next = null, El(l, f.props, m, d), Dl(l, f.children, d), it(), Ho(l), lt();
  }, ve = (l, f, d, m, g, N, y, E, O = !1) => {
    const _ = l && l.children, D = l ? l.shapeFlag : 0, w = f.children, { patchFlag: V, shapeFlag: P } = f;
    if (V > 0) {
      if (V & 128) {
        bt(
          _,
          w,
          d,
          m,
          g,
          N,
          y,
          E,
          O
        );
        return;
      } else if (V & 256) {
        xn(
          _,
          w,
          d,
          m,
          g,
          N,
          y,
          E,
          O
        );
        return;
      }
    }
    P & 8 ? (D & 16 && Ce(_, g, N), w !== _ && h(d, w)) : D & 16 ? P & 16 ? bt(
      _,
      w,
      d,
      m,
      g,
      N,
      y,
      E,
      O
    ) : Ce(_, g, N, !0) : (D & 8 && h(d, ""), P & 16 && se(
      w,
      d,
      m,
      g,
      N,
      y,
      E,
      O
    ));
  }, xn = (l, f, d, m, g, N, y, E, O) => {
    l = l || mt, f = f || mt;
    const _ = l.length, D = f.length, w = Math.min(_, D);
    let V;
    for (V = 0; V < w; V++) {
      const P = f[V] = O ? je(f[V]) : pe(f[V]);
      M(
        l[V],
        P,
        d,
        null,
        g,
        N,
        y,
        E,
        O
      );
    }
    _ > D ? Ce(
      l,
      g,
      N,
      !0,
      !1,
      w
    ) : se(
      f,
      d,
      m,
      g,
      N,
      y,
      E,
      O,
      w
    );
  }, bt = (l, f, d, m, g, N, y, E, O) => {
    let _ = 0;
    const D = f.length;
    let w = l.length - 1, V = D - 1;
    for (; _ <= w && _ <= V; ) {
      const P = l[_], R = f[_] = O ? je(f[_]) : pe(f[_]);
      if (xt(P, R))
        M(
          P,
          R,
          d,
          null,
          g,
          N,
          y,
          E,
          O
        );
      else
        break;
      _++;
    }
    for (; _ <= w && _ <= V; ) {
      const P = l[w], R = f[V] = O ? je(f[V]) : pe(f[V]);
      if (xt(P, R))
        M(
          P,
          R,
          d,
          null,
          g,
          N,
          y,
          E,
          O
        );
      else
        break;
      w--, V--;
    }
    if (_ > w) {
      if (_ <= V) {
        const P = V + 1, R = P < D ? f[P].el : m;
        for (; _ <= V; )
          M(
            null,
            f[_] = O ? je(f[_]) : pe(f[_]),
            d,
            R,
            g,
            N,
            y,
            E,
            O
          ), _++;
      }
    } else if (_ > V)
      for (; _ <= w; )
        Me(l[_], g, N, !0), _++;
    else {
      const P = _, R = _, U = /* @__PURE__ */ new Map();
      for (_ = R; _ <= V; _++) {
        const ee = f[_] = O ? je(f[_]) : pe(f[_]);
        ee.key != null && (process.env.NODE_ENV !== "production" && U.has(ee.key) && b(
          "Duplicate keys found during update:",
          JSON.stringify(ee.key),
          "Make sure keys are unique."
        ), U.set(ee.key, _));
      }
      let L, z = 0;
      const fe = V - R + 1;
      let ut = !1, Co = 0;
      const Ot = new Array(fe);
      for (_ = 0; _ < fe; _++)
        Ot[_] = 0;
      for (_ = P; _ <= w; _++) {
        const ee = l[_];
        if (z >= fe) {
          Me(ee, g, N, !0);
          continue;
        }
        let Ne;
        if (ee.key != null)
          Ne = U.get(ee.key);
        else
          for (L = R; L <= V; L++)
            if (Ot[L - R] === 0 && xt(ee, f[L])) {
              Ne = L;
              break;
            }
        Ne === void 0 ? Me(ee, g, N, !0) : (Ot[Ne - R] = _ + 1, Ne >= Co ? Co = Ne : ut = !0, M(
          ee,
          f[Ne],
          d,
          null,
          g,
          N,
          y,
          E,
          O
        ), z++);
      }
      const To = ut ? Pl(Ot) : mt;
      for (L = To.length - 1, _ = fe - 1; _ >= 0; _--) {
        const ee = R + _, Ne = f[ee], $o = ee + 1 < D ? f[ee + 1].el : m;
        Ot[_] === 0 ? M(
          null,
          Ne,
          d,
          $o,
          g,
          N,
          y,
          E,
          O
        ) : ut && (L < 0 || _ !== To[L] ? ct(Ne, d, $o, 2) : L--);
      }
    }
  }, ct = (l, f, d, m, g = null) => {
    const { el: N, type: y, transition: E, children: O, shapeFlag: _ } = l;
    if (_ & 6) {
      ct(l.component.subTree, f, d, m);
      return;
    }
    if (_ & 128) {
      l.suspense.move(f, d, m);
      return;
    }
    if (_ & 64) {
      y.move(l, f, d, ft);
      return;
    }
    if (y === ae) {
      o(N, f, d);
      for (let w = 0; w < O.length; w++)
        ct(O[w], f, d, m);
      o(l.anchor, f, d);
      return;
    }
    if (y === en) {
      _e(l, f, d);
      return;
    }
    if (m !== 2 && _ & 1 && E)
      if (m === 0)
        E.beforeEnter(N), o(N, f, d), re(() => E.enter(N), g);
      else {
        const { leave: w, delayLeave: V, afterLeave: P } = E, R = () => o(N, f, d), U = () => {
          w(N, () => {
            R(), P && P();
          });
        };
        V ? V(N, R, U) : U();
      }
    else
      o(N, f, d);
  }, Me = (l, f, d, m = !1, g = !1) => {
    const {
      type: N,
      props: y,
      ref: E,
      children: O,
      dynamicChildren: _,
      shapeFlag: D,
      patchFlag: w,
      dirs: V
    } = l;
    if (E != null && Qn(E, null, d, l, !0), D & 256) {
      f.ctx.deactivate(l);
      return;
    }
    const P = D & 1 && V, R = !Zt(l);
    let U;
    if (R && (U = y && y.onVnodeBeforeUnmount) && be(U, f, l), D & 6)
      gs(l.component, d, m);
    else {
      if (D & 128) {
        l.suspense.unmount(d, m);
        return;
      }
      P && We(l, null, f, "beforeUnmount"), D & 64 ? l.type.remove(
        l,
        f,
        d,
        g,
        ft,
        m
      ) : _ && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (N !== ae || w > 0 && w & 64) ? Ce(
        _,
        f,
        d,
        !1,
        !0
      ) : (N === ae && w & 384 || !g && D & 16) && Ce(O, f, d), m && Dn(l);
    }
    (R && (U = y && y.onVnodeUnmounted) || P) && re(() => {
      U && be(U, f, l), P && We(l, null, f, "unmounted");
    }, d);
  }, Dn = (l) => {
    const { type: f, el: d, anchor: m, transition: g } = l;
    if (f === ae) {
      process.env.NODE_ENV !== "production" && l.patchFlag > 0 && l.patchFlag & 2048 && g && !g.persisted ? l.children.forEach((y) => {
        y.type === me ? r(y.el) : Dn(y);
      }) : ms(d, m);
      return;
    }
    if (f === en) {
      $(l);
      return;
    }
    const N = () => {
      r(d), g && !g.persisted && g.afterLeave && g.afterLeave();
    };
    if (l.shapeFlag & 1 && g && !g.persisted) {
      const { leave: y, delayLeave: E } = g, O = () => y(d, N);
      E ? E(l.el, N, O) : O();
    } else
      N();
  }, ms = (l, f) => {
    let d;
    for (; l !== f; )
      d = v(l), r(l), l = d;
    r(f);
  }, gs = (l, f, d) => {
    process.env.NODE_ENV !== "production" && l.type.__hmrId && bi(l);
    const { bum: m, scope: g, update: N, subTree: y, um: E } = l;
    m && yt(m), g.stop(), N && (N.active = !1, Me(y, l, f, d)), E && re(E, f), re(() => {
      l.isUnmounted = !0;
    }, f), f && f.pendingBranch && !f.isUnmounted && l.asyncDep && !l.asyncResolved && l.suspenseId === f.pendingId && (f.deps--, f.deps === 0 && f.resolve()), process.env.NODE_ENV !== "production" && Ci(l);
  }, Ce = (l, f, d, m = !1, g = !1, N = 0) => {
    for (let y = N; y < l.length; y++)
      Me(l[y], f, d, m, g);
  }, Ut = (l) => l.shapeFlag & 6 ? Ut(l.component.subTree) : l.shapeFlag & 128 ? l.suspense.next() : v(l.anchor || l.el), Vo = (l, f, d) => {
    l == null ? f._vnode && Me(f._vnode, null, null, !0) : M(f._vnode || null, l, f, null, null, null, d), Ho(), Sr(), f._vnode = l;
  }, ft = {
    p: M,
    um: Me,
    m: ct,
    r: Dn,
    mt: Re,
    mc: se,
    pc: ve,
    pbc: Ae,
    n: Ut,
    o: e
  };
  let Vn, Cn;
  return t && ([Vn, Cn] = t(
    ft
  )), {
    render: Vo,
    hydrate: Vn,
    createApp: hl(Vo, Vn)
  };
}
function qe({ effect: e, update: t }, n) {
  e.allowRecurse = t.allowRecurse = n;
}
function $l(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Gt(e, t, n = !1) {
  const o = e.children, r = t.children;
  if (C(o) && C(r))
    for (let s = 0; s < o.length; s++) {
      const i = o[s];
      let c = r[s];
      c.shapeFlag & 1 && !c.dynamicChildren && ((c.patchFlag <= 0 || c.patchFlag === 32) && (c = r[s] = je(r[s]), c.el = i.el), n || Gt(i, c)), c.type === Ht && (c.el = i.el), process.env.NODE_ENV !== "production" && c.type === me && !c.el && (c.el = i.el);
    }
}
function Pl(e) {
  const t = e.slice(), n = [0];
  let o, r, s, i, c;
  const u = e.length;
  for (o = 0; o < u; o++) {
    const a = e[o];
    if (a !== 0) {
      if (r = n[n.length - 1], e[r] < a) {
        t[o] = r, n.push(o);
        continue;
      }
      for (s = 0, i = n.length - 1; s < i; )
        c = s + i >> 1, e[n[c]] < a ? s = c + 1 : i = c;
      a < e[n[s]] && (s > 0 && (t[o] = n[s - 1]), n[s] = o);
    }
  }
  for (s = n.length, i = n[s - 1]; s-- > 0; )
    n[s] = i, i = t[i];
  return n;
}
const Il = (e) => e.__isTeleport, ae = Symbol.for("v-fgt"), Ht = Symbol.for("v-txt"), me = Symbol.for("v-cmt"), en = Symbol.for("v-stc"), Pt = [];
let de = null;
function Qo(e = !1) {
  Pt.push(de = e ? null : []);
}
function Al() {
  Pt.pop(), de = Pt[Pt.length - 1] || null;
}
let Mt = 1;
function Go(e) {
  Mt += e;
}
function Rl(e) {
  return e.dynamicChildren = Mt > 0 ? de || mt : null, Al(), Mt > 0 && de && de.push(e), e;
}
function er(e, t, n, o, r, s) {
  return Rl(
    ss(
      e,
      t,
      n,
      o,
      r,
      s,
      !0
      /* isBlock */
    )
  );
}
function Oo(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function xt(e, t) {
  return process.env.NODE_ENV !== "production" && t.shapeFlag & 6 && pt.has(t.type) ? (e.shapeFlag &= -257, t.shapeFlag &= -513, !1) : e.type === t.type && e.key === t.key;
}
const Ml = (...e) => is(
  ...e
), yn = "__vInternal", rs = ({ key: e }) => e ?? null, tn = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? q(e) || G(e) || T(e) ? { i: ie, r: e, k: t, f: !!n } : e : null);
function ss(e, t = null, n = null, o = 0, r = null, s = e === ae ? 0 : 1, i = !1, c = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && rs(t),
    ref: t && tn(t),
    scopeId: Kr,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: s,
    patchFlag: o,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: ie
  };
  return c ? (yo(u, n), s & 128 && e.normalize(u)) : n && (u.shapeFlag |= q(n) ? 8 : 16), process.env.NODE_ENV !== "production" && u.key !== u.key && b("VNode created with invalid key (NaN). VNode type:", u.type), Mt > 0 && // avoid a block node from tracking itself
  !i && // has current parent block
  de && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || s & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && de.push(u), u;
}
const tt = process.env.NODE_ENV !== "production" ? Ml : is;
function is(e, t = null, n = null, o = 0, r = null, s = !1) {
  if ((!e || e === Hi) && (process.env.NODE_ENV !== "production" && !e && b(`Invalid vnode type when creating vnode: ${e}.`), e = me), Oo(e)) {
    const c = Ke(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && yo(c, n), Mt > 0 && !s && de && (c.shapeFlag & 6 ? de[de.indexOf(e)] = c : de.push(c)), c.patchFlag |= -2, c;
  }
  if (ps(e) && (e = e.__vccOpts), t) {
    t = Sl(t);
    let { class: c, style: u } = t;
    c && !q(c) && (t.class = lo(c)), K(u) && (Kn(u) && !C(u) && (u = k({}, u)), t.style = io(u));
  }
  const i = q(e) ? 1 : Li(e) ? 128 : Il(e) ? 64 : K(e) ? 4 : T(e) ? 2 : 0;
  return process.env.NODE_ENV !== "production" && i & 4 && Kn(e) && (e = I(e), b(
    "Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
    `
Component that was made reactive: `,
    e
  )), ss(
    e,
    t,
    n,
    o,
    r,
    i,
    s,
    !0
  );
}
function Sl(e) {
  return e ? Kn(e) || yn in e ? k({}, e) : e : null;
}
function Ke(e, t, n = !1) {
  const { props: o, ref: r, patchFlag: s, children: i } = e, c = t ? jl(o || {}, t) : o;
  return {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: c,
    key: c && rs(c),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && r ? C(r) ? r.concat(tn(t)) : [r, tn(t)] : tn(t)
    ) : r,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: process.env.NODE_ENV !== "production" && s === -1 && C(i) ? i.map(ls) : i,
    target: e.target,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ae ? s === -1 ? 16 : s | 16 : s,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: e.transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && Ke(e.ssContent),
    ssFallback: e.ssFallback && Ke(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
}
function ls(e) {
  const t = Ke(e);
  return C(e.children) && (t.children = e.children.map(ls)), t;
}
function Fl(e = " ", t = 0) {
  return tt(Ht, null, e, t);
}
function pe(e) {
  return e == null || typeof e == "boolean" ? tt(me) : C(e) ? tt(
    ae,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : typeof e == "object" ? je(e) : tt(Ht, null, String(e));
}
function je(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ke(e);
}
function yo(e, t) {
  let n = 0;
  const { shapeFlag: o } = e;
  if (t == null)
    t = null;
  else if (C(t))
    n = 16;
  else if (typeof t == "object")
    if (o & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), yo(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !(yn in t) ? t._ctx = ie : r === 3 && ie && (ie.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else
    T(t) ? (t = { default: t, _ctx: ie }, n = 32) : (t = String(t), o & 64 ? (n = 16, t = [Fl(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function jl(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    for (const r in o)
      if (r === "class")
        t.class !== o.class && (t.class = lo([t.class, o.class]));
      else if (r === "style")
        t.style = io([t.style, o.style]);
      else if (Ft(r)) {
        const s = t[r], i = o[r];
        i && s !== i && !(C(s) && s.includes(i)) && (t[r] = s ? [].concat(s, i) : i);
      } else
        r !== "" && (t[r] = o[r]);
  }
  return t;
}
function be(e, t, n, o = null) {
  he(e, t, 7, [
    n,
    o
  ]);
}
const Hl = Zr();
let Ll = 0;
function Ul(e, t, n) {
  const o = e.type, r = (t ? t.appContext : e.appContext) || Hl, s = {
    uid: Ll++,
    vnode: e,
    type: o,
    parent: t,
    appContext: r,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    scope: new Ms(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(r.provides),
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Gr(o, r),
    emitsOptions: Br(o, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: B,
    // inheritAttrs
    inheritAttrs: o.inheritAttrs,
    // state
    ctx: B,
    data: B,
    props: B,
    attrs: B,
    slots: B,
    refs: B,
    setupState: B,
    setupContext: null,
    attrsProxy: null,
    slotsProxy: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return process.env.NODE_ENV !== "production" ? s.ctx = rl(s) : s.ctx = { _: s }, s.root = t ? t.root : s, s.emit = Ii.bind(null, s), e.ce && e.ce(s), s;
}
let X = null, wo, at, tr = "__VUE_INSTANCE_SETTERS__";
(at = rn()[tr]) || (at = rn()[tr] = []), at.push((e) => X = e), wo = (e) => {
  at.length > 1 ? at.forEach((t) => t(e)) : at[0](e);
};
const Nt = (e) => {
  wo(e), e.scope.on();
}, nt = () => {
  X && X.scope.off(), wo(null);
}, Bl = /* @__PURE__ */ ke("slot,component");
function Gn(e, t) {
  const n = t.isNativeTag || hr;
  (Bl(e) || n(e)) && b(
    "Do not use built-in or reserved HTML elements as component id: " + e
  );
}
function cs(e) {
  return e.vnode.shapeFlag & 4;
}
let St = !1;
function Kl(e, t = !1) {
  St = t;
  const { props: n, children: o } = e.vnode, r = cs(e);
  gl(e, n, r, t), xl(e, o);
  const s = r ? kl(e, t) : void 0;
  return St = !1, s;
}
function kl(e, t) {
  var n;
  const o = e.type;
  if (process.env.NODE_ENV !== "production") {
    if (o.name && Gn(o.name, e.appContext.config), o.components) {
      const s = Object.keys(o.components);
      for (let i = 0; i < s.length; i++)
        Gn(s[i], e.appContext.config);
    }
    if (o.directives) {
      const s = Object.keys(o.directives);
      for (let i = 0; i < s.length; i++)
        qr(s[i]);
    }
    o.compilerOptions && fs() && b(
      '"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.'
    );
  }
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = Tr(new Proxy(e.ctx, Yr)), process.env.NODE_ENV !== "production" && sl(e);
  const { setup: r } = o;
  if (r) {
    const s = e.setupContext = r.length > 1 ? ql(e) : null;
    Nt(e), it();
    const i = Pe(
      r,
      e,
      0,
      [process.env.NODE_ENV !== "production" ? Vt(e.props) : e.props, s]
    );
    if (lt(), nt(), oo(i)) {
      if (i.then(nt, nt), t)
        return i.then((c) => {
          nr(e, c, t);
        }).catch((c) => {
          vn(c, e, 0);
        });
      if (e.asyncDep = i, process.env.NODE_ENV !== "production" && !e.suspense) {
        const c = (n = o.name) != null ? n : "Anonymous";
        b(
          `Component <${c}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
        );
      }
    } else
      nr(e, i, t);
  } else
    us(e, t);
}
function nr(e, t, n) {
  T(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : K(t) ? (process.env.NODE_ENV !== "production" && Oo(t) && b(
    "setup() should not return VNodes directly - return a render function instead."
  ), process.env.NODE_ENV !== "production" && (e.devtoolsRawSetupState = t), e.setupState = Pr(t), process.env.NODE_ENV !== "production" && il(e)) : process.env.NODE_ENV !== "production" && t !== void 0 && b(
    `setup() should return an object. Received: ${t === null ? "null" : typeof t}`
  ), us(e, n);
}
let eo;
const fs = () => !eo;
function us(e, t, n) {
  const o = e.type;
  if (!e.render) {
    if (!t && eo && !o.render) {
      const r = o.template || No(e).template;
      if (r) {
        process.env.NODE_ENV !== "production" && Te(e, "compile");
        const { isCustomElement: s, compilerOptions: i } = e.appContext.config, { delimiters: c, compilerOptions: u } = o, a = k(
          k(
            {
              isCustomElement: s,
              delimiters: c
            },
            i
          ),
          u
        );
        o.render = eo(r, a), process.env.NODE_ENV !== "production" && $e(e, "compile");
      }
    }
    e.render = o.render || Y;
  }
  {
    Nt(e), it();
    try {
      cl(e);
    } finally {
      lt(), nt();
    }
  }
  process.env.NODE_ENV !== "production" && !o.render && e.render === Y && !t && (o.template ? b(
    'Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".'
    /* should not happen */
  ) : b("Component is missing template or render function."));
}
function or(e) {
  return e.attrsProxy || (e.attrsProxy = new Proxy(
    e.attrs,
    process.env.NODE_ENV !== "production" ? {
      get(t, n) {
        return ln(), Z(e, "get", "$attrs"), t[n];
      },
      set() {
        return b("setupContext.attrs is readonly."), !1;
      },
      deleteProperty() {
        return b("setupContext.attrs is readonly."), !1;
      }
    } : {
      get(t, n) {
        return Z(e, "get", "$attrs"), t[n];
      }
    }
  ));
}
function Wl(e) {
  return e.slotsProxy || (e.slotsProxy = new Proxy(e.slots, {
    get(t, n) {
      return Z(e, "get", "$slots"), t[n];
    }
  }));
}
function ql(e) {
  const t = (n) => {
    if (process.env.NODE_ENV !== "production" && (e.exposed && b("expose() should be called only once per setup()."), n != null)) {
      let o = typeof n;
      o === "object" && (C(n) ? o = "array" : G(n) && (o = "ref")), o !== "object" && b(
        `expose() should be passed a plain object, received ${o}.`
      );
    }
    e.exposed = n || {};
  };
  return process.env.NODE_ENV !== "production" ? Object.freeze({
    get attrs() {
      return or(e);
    },
    get slots() {
      return Wl(e);
    },
    get emit() {
      return (n, ...o) => e.emit(n, ...o);
    },
    expose: t
  }) : {
    get attrs() {
      return or(e);
    },
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function xo(e) {
  if (e.exposed)
    return e.exposeProxy || (e.exposeProxy = new Proxy(Pr(Tr(e.exposed)), {
      get(t, n) {
        if (n in t)
          return t[n];
        if (n in et)
          return et[n](e);
      },
      has(t, n) {
        return n in t || n in et;
      }
    }));
}
const zl = /(?:^|[-_])(\w)/g, Jl = (e) => e.replace(zl, (t) => t.toUpperCase()).replace(/[-_]/g, "");
function as(e, t = !0) {
  return T(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function wn(e, t, n = !1) {
  let o = as(t);
  if (!o && t.__file) {
    const r = t.__file.match(/([^/\\]+)\.\w+$/);
    r && (o = r[1]);
  }
  if (!o && e && e.parent) {
    const r = (s) => {
      for (const i in s)
        if (s[i] === t)
          return i;
    };
    o = r(
      e.components || e.parent.type.components
    ) || r(e.appContext.components);
  }
  return o ? Jl(o) : n ? "App" : "Anonymous";
}
function ps(e) {
  return T(e) && "__vccOpts" in e;
}
const Yl = (e, t) => fi(e, t, St), Xl = Symbol.for("v-scx"), Zl = () => {
  {
    const e = Qt(Xl);
    return e || process.env.NODE_ENV !== "production" && b(
      "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
    ), e;
  }
};
function An(e) {
  return !!(e && e.__v_isShallow);
}
function Ql() {
  if (process.env.NODE_ENV === "production" || typeof window > "u")
    return;
  const e = { style: "color:#3ba776" }, t = { style: "color:#1677ff" }, n = { style: "color:#f5222d" }, o = { style: "color:#eb2f96" }, r = {
    header(p) {
      return K(p) ? p.__isVue ? ["div", e, "VueInstance"] : G(p) ? [
        "div",
        {},
        ["span", e, h(p)],
        "<",
        c(p.value),
        ">"
      ] : Ze(p) ? [
        "div",
        {},
        ["span", e, An(p) ? "ShallowReactive" : "Reactive"],
        "<",
        c(p),
        `>${rt(p) ? " (readonly)" : ""}`
      ] : rt(p) ? [
        "div",
        {},
        ["span", e, An(p) ? "ShallowReadonly" : "Readonly"],
        "<",
        c(p),
        ">"
      ] : null : null;
    },
    hasBody(p) {
      return p && p.__isVue;
    },
    body(p) {
      if (p && p.__isVue)
        return [
          "div",
          {},
          ...s(p.$)
        ];
    }
  };
  function s(p) {
    const v = [];
    p.type.props && p.props && v.push(i("props", I(p.props))), p.setupState !== B && v.push(i("setup", p.setupState)), p.data !== B && v.push(i("data", I(p.data)));
    const x = u(p, "computed");
    x && v.push(i("computed", x));
    const j = u(p, "inject");
    return j && v.push(i("injected", j)), v.push([
      "div",
      {},
      [
        "span",
        {
          style: o.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: p }]
    ]), v;
  }
  function i(p, v) {
    return v = k({}, v), Object.keys(v).length ? [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        p
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(v).map((x) => [
          "div",
          {},
          ["span", o, x + ": "],
          c(v[x], !1)
        ])
      ]
    ] : ["span", {}];
  }
  function c(p, v = !0) {
    return typeof p == "number" ? ["span", t, p] : typeof p == "string" ? ["span", n, JSON.stringify(p)] : typeof p == "boolean" ? ["span", o, p] : K(p) ? ["object", { object: v ? I(p) : p }] : ["span", n, String(p)];
  }
  function u(p, v) {
    const x = p.type;
    if (T(x))
      return;
    const j = {};
    for (const M in p.ctx)
      a(x, M, v) && (j[M] = p.ctx[M]);
    return j;
  }
  function a(p, v, x) {
    const j = p[x];
    if (C(j) && j.includes(v) || K(j) && v in j || p.extends && a(p.extends, v, x) || p.mixins && p.mixins.some((M) => a(M, v, x)))
      return !0;
  }
  function h(p) {
    return An(p) ? "ShallowRef" : p.effect ? "ComputedRef" : "Ref";
  }
  window.devtoolsFormatters ? window.devtoolsFormatters.push(r) : window.devtoolsFormatters = [r];
}
const rr = "3.3.13", Gl = "http://www.w3.org/2000/svg", Ye = typeof document < "u" ? document : null, sr = Ye && /* @__PURE__ */ Ye.createElement("template"), ec = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, o) => {
    const r = t ? Ye.createElementNS(Gl, e) : Ye.createElement(e, n ? { is: n } : void 0);
    return e === "select" && o && o.multiple != null && r.setAttribute("multiple", o.multiple), r;
  },
  createText: (e) => Ye.createTextNode(e),
  createComment: (e) => Ye.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Ye.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, o, r, s) {
    const i = n ? n.previousSibling : t.lastChild;
    if (r && (r === s || r.nextSibling))
      for (; t.insertBefore(r.cloneNode(!0), n), !(r === s || !(r = r.nextSibling)); )
        ;
    else {
      sr.innerHTML = o ? `<svg>${e}</svg>` : e;
      const c = sr.content;
      if (o) {
        const u = c.firstChild;
        for (; u.firstChild; )
          c.appendChild(u.firstChild);
        c.removeChild(u);
      }
      t.insertBefore(c, n);
    }
    return [
      // first
      i ? i.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, tc = Symbol("_vtc");
function nc(e, t, n) {
  const o = e[tc];
  o && (t = (t ? [t, ...o] : [...o]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const oc = Symbol("_vod"), rc = Symbol(process.env.NODE_ENV !== "production" ? "CSS_VAR_TEXT" : "");
function sc(e, t, n) {
  const o = e.style, r = q(n);
  if (n && !r) {
    if (t && !q(t))
      for (const s in t)
        n[s] == null && to(o, s, "");
    for (const s in n)
      to(o, s, n[s]);
  } else {
    const s = o.display;
    if (r) {
      if (t !== n) {
        const i = o[rc];
        i && (n += ";" + i), o.cssText = n;
      }
    } else
      t && e.removeAttribute("style");
    oc in e && (o.display = s);
  }
}
const ic = /[^\\];\s*$/, ir = /\s*!important$/;
function to(e, t, n) {
  if (C(n))
    n.forEach((o) => to(e, t, o));
  else if (n == null && (n = ""), process.env.NODE_ENV !== "production" && ic.test(n) && b(
    `Unexpected semicolon at the end of '${t}' style value: '${n}'`
  ), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const o = lc(e, t);
    ir.test(n) ? e.setProperty(
      Ue(o),
      n.replace(ir, ""),
      "important"
    ) : e[o] = n;
  }
}
const lr = ["Webkit", "Moz", "ms"], Rn = {};
function lc(e, t) {
  const n = Rn[t];
  if (n)
    return n;
  let o = Et(t);
  if (o !== "filter" && o in e)
    return Rn[t] = o;
  o = hn(o);
  for (let r = 0; r < lr.length; r++) {
    const s = lr[r] + o;
    if (s in e)
      return Rn[t] = s;
  }
  return t;
}
const cr = "http://www.w3.org/1999/xlink";
function cc(e, t, n, o, r) {
  if (o && t.startsWith("xlink:"))
    n == null ? e.removeAttributeNS(cr, t.slice(6, t.length)) : e.setAttributeNS(cr, t, n);
  else {
    const s = Rs(t);
    n == null || s && !mr(n) ? e.removeAttribute(t) : e.setAttribute(t, s ? "" : n);
  }
}
function fc(e, t, n, o, r, s, i) {
  if (t === "innerHTML" || t === "textContent") {
    o && i(o, r, s), e[t] = n ?? "";
    return;
  }
  const c = e.tagName;
  if (t === "value" && c !== "PROGRESS" && // custom elements may use _value internally
  !c.includes("-")) {
    e._value = n;
    const a = c === "OPTION" ? e.getAttribute("value") : e.value, h = n ?? "";
    a !== h && (e.value = h), n == null && e.removeAttribute(t);
    return;
  }
  let u = !1;
  if (n === "" || n == null) {
    const a = typeof e[t];
    a === "boolean" ? n = mr(n) : n == null && a === "string" ? (n = "", u = !0) : a === "number" && (n = 0, u = !0);
  }
  try {
    e[t] = n;
  } catch (a) {
    process.env.NODE_ENV !== "production" && !u && b(
      `Failed setting prop "${t}" on <${c.toLowerCase()}>: value ${n} is invalid.`,
      a
    );
  }
  u && e.removeAttribute(t);
}
function uc(e, t, n, o) {
  e.addEventListener(t, n, o);
}
function ac(e, t, n, o) {
  e.removeEventListener(t, n, o);
}
const fr = Symbol("_vei");
function pc(e, t, n, o, r = null) {
  const s = e[fr] || (e[fr] = {}), i = s[t];
  if (o && i)
    i.value = o;
  else {
    const [c, u] = dc(t);
    if (o) {
      const a = s[t] = gc(o, r);
      uc(e, c, a, u);
    } else
      i && (ac(e, c, i, u), s[t] = void 0);
  }
}
const ur = /(?:Once|Passive|Capture)$/;
function dc(e) {
  let t;
  if (ur.test(e)) {
    t = {};
    let o;
    for (; o = e.match(ur); )
      e = e.slice(0, e.length - o[0].length), t[o[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Ue(e.slice(2)), t];
}
let Mn = 0;
const hc = /* @__PURE__ */ Promise.resolve(), mc = () => Mn || (hc.then(() => Mn = 0), Mn = Date.now());
function gc(e, t) {
  const n = (o) => {
    if (!o._vts)
      o._vts = Date.now();
    else if (o._vts <= n.attached)
      return;
    he(
      _c(o, n.value),
      t,
      5,
      [o]
    );
  };
  return n.value = e, n.attached = mc(), n;
}
function _c(e, t) {
  if (C(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map((o) => (r) => !r._stopped && o && o(r));
  } else
    return t;
}
const ar = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ec = (e, t, n, o, r = !1, s, i, c, u) => {
  t === "class" ? nc(e, o, r) : t === "style" ? sc(e, n, o) : Ft(t) ? nn(t) || pc(e, t, n, o, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : vc(e, t, o, r)) ? fc(
    e,
    t,
    o,
    s,
    i,
    c,
    u
  ) : (t === "true-value" ? e._trueValue = o : t === "false-value" && (e._falseValue = o), cc(e, t, o, r));
};
function vc(e, t, n, o) {
  if (o)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ar(t) && T(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return ar(t) && q(n) ? !1 : t in e;
}
const Nc = /* @__PURE__ */ k({ patchProp: Ec }, ec);
let pr;
function bc() {
  return pr || (pr = Cl(Nc));
}
const Oc = (...e) => {
  const t = bc().createApp(...e);
  process.env.NODE_ENV !== "production" && (yc(t), wc(t));
  const { mount: n } = t;
  return t.mount = (o) => {
    const r = xc(o);
    if (!r)
      return;
    const s = t._component;
    !T(s) && !s.render && !s.template && (s.template = r.innerHTML), r.innerHTML = "";
    const i = n(r, !1, r instanceof SVGElement);
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), i;
  }, t;
};
function yc(e) {
  Object.defineProperty(e.config, "isNativeTag", {
    value: (t) => Ps(t) || Is(t),
    writable: !1
  });
}
function wc(e) {
  if (fs()) {
    const t = e.config.isCustomElement;
    Object.defineProperty(e.config, "isCustomElement", {
      get() {
        return t;
      },
      set() {
        b(
          "The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead."
        );
      }
    });
    const n = e.config.compilerOptions, o = 'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc';
    Object.defineProperty(e.config, "compilerOptions", {
      get() {
        return b(o), n;
      },
      set() {
        b(o);
      }
    });
  }
}
function xc(e) {
  if (q(e)) {
    const t = document.querySelector(e);
    return process.env.NODE_ENV !== "production" && !t && b(
      `Failed to mount app: mount target selector "${e}" returned null.`
    ), t;
  }
  return process.env.NODE_ENV !== "production" && window.ShadowRoot && e instanceof window.ShadowRoot && e.mode === "closed" && b(
    'mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs'
  ), e;
}
function Dc() {
  Ql();
}
process.env.NODE_ENV !== "production" && Dc();
const ot = _n([]);
function Vc(e) {
  ot.includes(e) || ot.push(e);
}
function dr(e) {
  ot.includes(e) && ot.splice(ot.indexOf(e), 1);
}
const Cc = ["src"], Tc = /* @__PURE__ */ ki({
  __name: "Test_c",
  setup(e) {
    return Bi(() => {
      ot.forEach((t) => {
        console.log(t.href);
      });
    }), (t, n) => (Qo(!0), er(ae, null, ol($r(ot), (o, r) => (Qo(), er("iframe", {
      key: r,
      class: "flow",
      src: o.href
    }, null, 8, Cc))), 128));
  }
});
const ds = document.createElement("div"), $c = Oc(Tc);
$c.mount(ds);
document.addEventListener("DOMContentLoaded", () => document.body.appendChild(ds));
let ze = null, Sn;
function hs(e, t) {
  t === "mouseover" ? ze === e || (clearTimeout(Sn), dr(ze), ze = e, Sn = setTimeout(() => {
    console.log("悬停事件", ze), Vc(ze);
  }, 400)) : (clearTimeout(Sn), dr(ze), ze = null);
}
document.addEventListener("mouseover", (e) => {
  if (e.target instanceof Element) {
    const t = e.target.closest("a");
    t && hs(t, "mouseover");
  }
});
document.addEventListener("mouseout", (e) => {
  if (e.target instanceof Element) {
    const t = e.target.closest("a");
    t && hs(t, "mouseout");
  }
});
