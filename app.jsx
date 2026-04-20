const { useState, useEffect } = React;

const BOOKS = window.BOOKS;
const SHELVES = window.SHELVES;
const DISCOVER_SHELVES = window.DISCOVER_SHELVES;
const byId = (id) => BOOKS.find(b => b.id === id);

const PROGRESS = {
  "small-rains": 0.42,
  "copper-wire": 0.18,
  "field-manual": 0,
  "last-ferry": 0,
  "orchard-debt": 0,
  "blue-hour": 1,
  "paper-birds": 1,
};

function typeLabel(t) {
  if (t === "ebook") return "E-book";
  if (t === "audiobook") return "Audiobook";
  return "Article";
}

function Cover({ book, kicker }) {
  const c = book.cover;
  return (
    <div className={`cover style-${c.style}`} style={{ background: c.bg, color: c.fg }}>
      {kicker && <div className="c-kicker">{kicker}</div>}
      <div className="c-title">{book.title}</div>
      <div className="c-author">{book.author}</div>
    </div>
  );
}

function Nav({ view, setView }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="logo" onClick={() => setView({ name: "library" })} style={{cursor:"pointer"}}>
          Margin<span className="dot">.</span>
        </a>
        <div className="nav-links">
          <button className={`nav-link ${view.name === "library" ? "active" : ""}`} onClick={() => setView({ name: "library" })}>My library</button>
          <button className={`nav-link ${view.name === "discover" ? "active" : ""}`} onClick={() => setView({ name: "discover" })}>Discover</button>
          <button className="nav-link">Highlights</button>
          <button className="nav-link">Lists</button>
        </div>
        <div className="nav-right">
          <div className="search-box"><span>⌕</span><span>Search books, authors…</span></div>
          <div className="avatar">RA</div>
        </div>
      </div>
    </nav>
  );
}

function BookCard({ book, onClick, showProgress }) {
  const p = PROGRESS[book.id] ?? 0;
  return (
    <div className="book-card" onClick={onClick}>
      <Cover book={book} />
      <div>
        <div className="bc-title">{book.title}</div>
        <div className="bc-author">{book.author}</div>
      </div>
      {showProgress && p > 0 && p < 1 && (
        <div>
          <div className="bc-progress"><span style={{ width: `${p*100}%` }} /></div>
          <div className="bc-progress-label" style={{marginTop:4}}>{Math.round(p*100)}% · {Math.round(book.pages * (1-p))} pp left</div>
        </div>
      )}
      {showProgress && p === 1 && <div className="bc-progress-label" style={{color:"var(--sage)"}}>✓ Finished</div>}
      {!showProgress && (
        <div style={{display:"flex", gap:6, alignItems:"center", marginTop:2}}>
          <span className={`pill ${book.type}`}>{typeLabel(book.type)}</span>
          <span className="bc-progress-label">{book.price}</span>
        </div>
      )}
    </div>
  );
}

function Library({ onOpenBook }) {
  const totalBooks = SHELVES.reduce((a, s) => a + s.ids.length, 0);
  const reading = SHELVES[0].ids.length;
  const finished = SHELVES[2].ids.length;
  return (
    <div className="page">
      <div className="lib-head">
        <h1>Your <em>library</em>,<br/>Saturday morning.</h1>
        <div className="meta">
          <div className="big">{totalBooks} titles</div>
          <div style={{marginTop:8}}>{reading} in progress · {finished} finished this year</div>
        </div>
      </div>
      {SHELVES.map(shelf => (
        <section key={shelf.id} className="shelf">
          <div className="shelf-head">
            <h2>{shelf.name}</h2>
            <div className="count">{shelf.ids.length} {shelf.ids.length === 1 ? "book" : "books"}</div>
          </div>
          <div className="grid">
            {shelf.ids.map(id => {
              const b = byId(id);
              return b ? <BookCard key={id} book={b} onClick={() => onOpenBook(id)} showProgress /> : null;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Discover({ onOpenBook }) {
  const featured = byId("small-rains");
  const secondary = byId("blue-hour");
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-text">
          <div className="kicker">Pick of the week</div>
          <h1>A cartographer, a coastline, and a memory that <em>won't hold still.</em></h1>
          <p>{featured.blurb}</p>
          <div className="hero-actions">
            <button className="btn btn-tomato" onClick={() => onOpenBook(featured.id)}>Read sample</button>
            <button className="btn btn-ghost">Add to library</button>
          </div>
        </div>
        <div className="hero-featured">
          <Cover book={featured} />
          <Cover book={secondary} />
        </div>
      </div>
      {DISCOVER_SHELVES.map(shelf => (
        <section key={shelf.id} className="discover-shelf">
          <div className="shelf-head">
            <div>
              <div className="kicker" style={{marginBottom:8}}>{shelf.kicker}</div>
              <h2>{shelf.name}</h2>
            </div>
            <button className="nav-link">See all →</button>
          </div>
          <div className="grid">
            {shelf.ids.map(id => {
              const b = byId(id);
              return b ? <BookCard key={id} book={b} onClick={() => onOpenBook(id)} /> : null;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function BookDetail({ id, onOpenReader, onBack }) {
  const book = byId(id);
  if (!book) return null;
  const inLibrary = SHELVES.some(s => s.ids.includes(id));
  return (
    <div className="page">
      <button className="nav-link" onClick={onBack} style={{marginBottom:24, marginLeft:-14}}>← Back</button>
      <div className="detail">
        <div className="detail-left">
          <Cover book={book} />
          <div className="detail-cta">
            <button className="btn btn-tomato" onClick={() => onOpenReader(id)}>
              {PROGRESS[id] > 0 && PROGRESS[id] < 1 ? "Continue reading" : "Start reading"}
            </button>
            {!inLibrary && <button className="btn btn-ghost">+ Add to library</button>}
            {book.type === "audiobook" && <button className="btn btn-ghost">♪ Preview audio</button>}
          </div>
        </div>
        <div className="detail-right">
          <div className="d-kicker">
            <span className={`pill ${book.type}`}>{typeLabel(book.type)}</span>
            <span className="pill">{book.genre}</span>
            <span className="pill">{book.year}</span>
          </div>
          <h1>{book.title}</h1>
          <div className="d-author">by <a>{book.author}</a></div>
          <div className="d-stats">
            <div className="d-stat"><div className="k">Rating</div><div className="v">{book.rating} <small>/ 5</small></div></div>
            <div className="d-stat"><div className="k">Ratings</div><div className="v">{book.ratings.toLocaleString()}</div></div>
            <div className="d-stat">
              <div className="k">{book.type === "audiobook" ? "Listening" : "Reading"}</div>
              <div className="v">{book.type === "audiobook" ? `${Math.floor(book.minutes/60)}h ${book.minutes%60}m` : `${book.pages} pp`}</div>
            </div>
            <div className="d-stat"><div className="k">Price</div><div className="v">{book.price}</div></div>
          </div>
          <p className="d-blurb">{book.blurb}</p>
          <div className="d-excerpt-head">
            <h3>Excerpt — Chapter One</h3>
            <span className="page-n">pp. 1–2</span>
          </div>
          <div className="d-excerpt">
            {book.excerpt.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div style={{marginTop:32}}>
            <button className="btn btn-primary" onClick={() => onOpenReader(id)}>Continue in reader →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function chapterTitle(book) {
  const titles = {
    "small-rains": "The rocks at low water",
    "copper-wire": "What a house sounds like",
    "field-manual": "On being second-most-interesting",
    "last-ferry": "Forty-three heads",
    "orchard-debt": "The long view",
    "signal-fire": "Producing nothing",
    "blue-hour": "Eleven minutes in June",
    "quiet-engine": "The second city",
    "paper-birds": "The Conti newspaper",
    "north-catalog": "Six hours, one car",
  };
  return titles[book.id] || "The first light";
}

function EXTRA_PARAS(book) {
  const filler = {
    "small-rains": [
      "She had come back because of the letter, though the letter itself said almost nothing. It was the handwriting that had summoned her — thin, careful, the way her aunt had always written shopping lists in pencil on the backs of envelopes. When Mira saw it on the hallway floor of her flat in the city, she had known before she opened it.",
      "The harbor, in late afternoon, smelled the way it had always smelled: diesel and kelp and, faintly, bread from the bakery on the corner, which had survived everything. Mira tried to feel something about this and could not. Feeling, she had learned, was a skill that came and went, like good weather.",
      "At the house she let herself in with the key under the blue pot. The hallway was cold. Someone had taken down all the photographs."
    ],
    "copper-wire": [
      "My grandfather had wired the first three houses on our street and refused to wire the fourth, for reasons he would not explain. For most of my childhood I believed this was a moral position. It turned out to be a dispute about a dog.",
      "When a radio came into the shop, he would place it on the bench and look at it for a long time before he touched it. My father did this too, and so, to my own surprise, do I.",
      "The wire itself was the least interesting part of the work, except when it was everything."
    ]
  };
  return filler[book.id] || [
    "The afternoon light moved across the wall in the way afternoon light does, and she watched it move, and she did not get up.",
    "There would be time for the rest of it later. There was always, it turned out, time for the rest of it later. That was the one reliable thing.",
    "Outside, a bicycle went past. Inside, the kettle had not yet begun to whistle. This, for the moment, was the whole of the world."
  ];
}

function Reader({ id, onClose, fontFamily, fontSize, setFontFamily, setFontSize }) {
  const book = byId(id);
  const [showType, setShowType] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById("reader-scroll");
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setScrollPct(max > 0 ? el.scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [id]);

  useEffect(() => {
    document.documentElement.style.setProperty("--reader-size", fontSize + "px");
    document.documentElement.style.setProperty("--reader-font",
      fontFamily === "serif" ? "Newsreader, Georgia, serif" :
      fontFamily === "sans" ? "Geist, Inter, sans-serif" :
      fontFamily === "mono" ? "'JetBrains Mono', monospace" :
      "'Atkinson Hyperlegible', Inter, sans-serif"
    );
  }, [fontFamily, fontSize]);

  if (!book) return null;
  const paras = book.excerpt.split("\n\n");

  return (
    <>
      <div className="reader open" id="reader-scroll">
        <div className="reader-top">
          <button className="r-icon-btn" onClick={onClose} title="Close">←</button>
          <div className="r-title"><strong>{book.title}</strong> <span>&nbsp;·&nbsp; {book.author}</span></div>
          <div className="r-actions">
            <button className="r-icon-btn" title="Contents">☰</button>
            <button className="r-icon-btn" title="Bookmark">❏</button>
            <button className="r-icon-btn" title="Type settings" onClick={() => setShowType(s => !s)}>Aa</button>
          </div>
        </div>
        <div className="reader-body">
          <div className="chapter-kicker">Chapter One</div>
          <h2>{chapterTitle(book)}</h2>
          <div style={{height: 24}} />
          {paras.map((p, i) => <p key={i}>{p}</p>)}
          {EXTRA_PARAS(book).map((p, i) => <p key={"e"+i}>{p}</p>)}
        </div>
        <div className="reader-progress">
          <span className="pct">{Math.round(scrollPct * 100)}%</span>
          <div className="bar" onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - r.left) / r.width;
            const el = document.getElementById("reader-scroll");
            if (el) el.scrollTop = (el.scrollHeight - el.clientHeight) * pct;
          }}>
            <span style={{ width: `${scrollPct * 100}%` }} />
          </div>
          <span className="pct">{Math.round(book.pages * scrollPct)} / {book.pages}</span>
        </div>
      </div>

      <div className={`type-panel ${showType ? "open" : ""}`} style={{zIndex: 250}}>
        <h4>Type</h4>
        <div className="tp-sub">Adjust how the book reads.</div>
        <div className="tp-row">
          <div className="tp-label"><span>Family</span></div>
          <div className="tp-fonts">
            {[
              { id: "serif", label: "Aa", name: "Newsreader" },
              { id: "sans",  label: "Aa", name: "Geist" },
              { id: "dys",   label: "Aa", name: "Hyperlegible" },
              { id: "mono",  label: "Aa", name: "Mono" },
            ].map(f => (
              <button key={f.id}
                className={`tp-font-btn ${fontFamily === f.id ? "active" : ""}`}
                onClick={() => setFontFamily(f.id)}
                style={{
                  fontFamily:
                    f.id === "serif" ? "Newsreader, Georgia, serif" :
                    f.id === "sans"  ? "Geist, Inter, sans-serif" :
                    f.id === "mono"  ? "'JetBrains Mono', monospace" :
                    "'Atkinson Hyperlegible', Inter, sans-serif",
                }}>
                {f.label}
                <span className="tp-font-name">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="tp-row">
          <div className="tp-label"><span>Size</span><span>{fontSize}px</span></div>
          <div className="tp-size">
            <span style={{fontSize:12}}>A</span>
            <input type="range" min="14" max="28" step="1" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />
            <span style={{fontSize:20}}>A</span>
          </div>
        </div>
      </div>
    </>
  );
}

function TweaksPanel({ fontFamily, setFontFamily, fontSize, setFontSize }) {
  return (
    <div className="type-panel" id="tweaks-panel">
      <h4>Tweaks</h4>
      <div className="tp-sub">Reader type settings. Also visible inside the reader via the <b>Aa</b> button.</div>
      <div className="tp-row">
        <div className="tp-label"><span>Reader font</span></div>
        <div className="tp-fonts">
          {[
            { id: "serif", label: "Aa", name: "Newsreader" },
            { id: "sans",  label: "Aa", name: "Geist" },
            { id: "dys",   label: "Aa", name: "Hyperlegible" },
            { id: "mono",  label: "Aa", name: "Mono" },
          ].map(f => (
            <button key={f.id}
              className={`tp-font-btn ${fontFamily === f.id ? "active" : ""}`}
              onClick={() => {
                setFontFamily(f.id);
                window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { fontFamily: f.id } }, "*");
              }}
              style={{
                fontFamily:
                  f.id === "serif" ? "Newsreader, Georgia, serif" :
                  f.id === "sans"  ? "Geist, Inter, sans-serif" :
                  f.id === "mono"  ? "'JetBrains Mono', monospace" :
                  "'Atkinson Hyperlegible', Inter, sans-serif",
              }}>
              {f.label}
              <span className="tp-font-name">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="tp-row">
        <div className="tp-label"><span>Reader size</span><span>{fontSize}px</span></div>
        <div className="tp-size">
          <span style={{fontSize:12}}>A</span>
          <input type="range" min="14" max="28" step="1" value={fontSize}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setFontSize(v);
              window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { fontSize: v } }, "*");
            }} />
          <span style={{fontSize:20}}>A</span>
        </div>
      </div>
      <div className="tp-sub" style={{marginTop:16, marginBottom:0, fontSize:11}}>
        Tip — open any book and hit <b>Aa</b> in the reader to adjust while reading.
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState({ name: "library" });
  const [reader, setReader] = useState(null);
  const [fontFamily, setFontFamily] = useState(window.TWEAK_DEFAULTS?.fontFamily || "serif");
  const [fontSize, setFontSize] = useState(window.TWEAK_DEFAULTS?.fontSize || 18);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("margin:state") || "{}");
      if (s.view) setView(s.view);
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("margin:state", JSON.stringify({ view }));
  }, [view]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") document.getElementById("tweaks-panel")?.classList.add("open");
      if (e.data.type === "__deactivate_edit_mode") document.getElementById("tweaks-panel")?.classList.remove("open");
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      <Nav view={view} setView={setView} />
      {view.name === "library" && <Library onOpenBook={(id) => setView({ name: "detail", id })} />}
      {view.name === "discover" && <Discover onOpenBook={(id) => setView({ name: "detail", id })} />}
      {view.name === "detail" && <BookDetail id={view.id} onOpenReader={(id) => setReader(id)} onBack={() => setView({ name: "library" })} />}
      {reader && <Reader id={reader} onClose={() => setReader(null)} fontFamily={fontFamily} fontSize={fontSize} setFontFamily={setFontFamily} setFontSize={setFontSize} />}
      <TweaksPanel fontFamily={fontFamily} setFontFamily={setFontFamily} fontSize={fontSize} setFontSize={setFontSize} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
