import { useEffect, useId, useRef, useState } from "react";
import { Play, RotateCcw, Terminal, Trash2 } from "lucide-react";

type LogType = "log" | "info" | "warn" | "error";

interface LogLine {
  type: LogType;
  message: string;
}

interface Props {
  html?: string;
  css?: string;
  js?: string;
  title?: string;
  height?: number;
  showHtml?: boolean;
  showCss?: boolean;
  showJs?: boolean;
  showConsole?: boolean;
  showPreview?: boolean;
}

type TabId = "html" | "css" | "js";

type StorageShape = Record<string, string>;

function closeTag(code: string, tag: string): string {
  return code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
}

function loadStorage(key: string): StorageShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as StorageShape;
    }
  } catch {
    // Playground storage is a convenience, never a requirement.
  }
  return {};
}

function saveStorage(key: string, value: StorageShape): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/**
 * Every preview gets a tiny console bridge and a localStorage shim. The shim
 * lets the storage lesson work inside a sandboxed iframe, where the real
 * localStorage is unavailable.
 */
function buildDoc(opts: {
  html: string;
  css: string;
  js: string;
  channel: string;
  storage: StorageShape;
}): string {
  const bridge = `
(function () {
  var channel = ${JSON.stringify(opts.channel)};
  var store = ${JSON.stringify(opts.storage)};
  var originalConsole = {};
  function post(type, payload) {
    try {
      parent.postMessage({ __playground: channel, type: type, payload: payload }, "*");
    } catch (error) {}
  }
  function send(type, args) {
    var parts = [];
    for (var i = 0; i < args.length; i++) {
      var value = args[i];
      if (typeof value === "string") {
        parts.push(value);
      } else if (typeof value === "undefined") {
        parts.push("undefined");
      } else {
        try {
          parts.push(JSON.stringify(value));
        } catch (error) {
          parts.push(String(value));
        }
      }
    }
    post(type, parts.join(" "));
  }
  ["log", "info", "warn", "error"].forEach(function (method) {
    originalConsole[method] = console[method];
    console[method] = function () {
      send(method, Array.prototype.slice.call(arguments));
      if (originalConsole[method]) {
        originalConsole[method].apply(console, arguments);
      }
    };
  });
  window.addEventListener("error", function (event) {
    send("error", [event.message]);
  });
  window.addEventListener("unhandledrejection", function (event) {
    send("error", ["Unhandled promise rejection: " + String(event.reason)]);
  });
  var storage = {
    getItem: function (key) {
      key = String(key);
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem: function (key, value) {
      store[String(key)] = String(value);
      post("storage", store);
    },
    removeItem: function (key) {
      delete store[String(key)];
      post("storage", store);
    },
    clear: function () {
      store = {};
      post("storage", store);
    },
    key: function (index) {
      var keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
  window.__playgroundStorage = storage;
  try {
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
  } catch (error) {}
})();
`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${closeTag(opts.css, "style")}</style>
</head>
<body>
${opts.html}
<script>${bridge}</script>
<script>
(function (localStorage) {
  try {
${closeTag(opts.js, "script")}
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
  }
})(window.__playgroundStorage);
</script>
</body>
</html>`;
}

export default function Playground({
  html = "",
  css = "",
  js = "",
  title = "Code playground",
  height = 320,
  showHtml = true,
  showCss = true,
  showJs = true,
  showConsole = false,
  showPreview = true,
}: Props) {
  const channel = useId();
  const storageKey = `jom-mula-playground:${channel}`;
  const storageRef = useRef<StorageShape>({});
  const [htmlCode, setHtmlCode] = useState(html);
  const [cssCode, setCssCode] = useState(css);
  const [jsCode, setJsCode] = useState(js);
  const [srcDoc, setSrcDoc] = useState("");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [tab, setTab] = useState<TabId>(() => {
    if (showHtml) return "html";
    if (showCss) return "css";
    return "js";
  });

  const tabs: { id: TabId; label: string }[] = [];
  if (showHtml) tabs.push({ id: "html", label: "index.html" });
  if (showCss) tabs.push({ id: "css", label: "style.css" });
  if (showJs) tabs.push({ id: "js", label: "script.js" });

  function run(): void {
    setLogs([]);
    setSrcDoc(
      buildDoc({
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        channel,
        storage: storageRef.current,
      }),
    );
  }

  useEffect(() => {
    storageRef.current = loadStorage(storageKey);
    setSrcDoc(
      buildDoc({
        html,
        css,
        js,
        channel,
        storage: storageRef.current,
      }),
    );
    // The example is intentionally fixed for the mount; Run uses live state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      const data = event.data as
        | { __playground?: string; type?: string; payload?: unknown }
        | null;
      if (!data || data.__playground !== channel) return;

      if (data.type === "storage") {
        if (data.payload && typeof data.payload === "object") {
          storageRef.current = data.payload as StorageShape;
          saveStorage(storageKey, storageRef.current);
        }
        return;
      }

      if (
        data.type === "log" ||
        data.type === "info" ||
        data.type === "warn" ||
        data.type === "error"
      ) {
        const line: LogLine = {
          type: data.type,
          message: String(data.payload ?? ""),
        };
        setLogs((previous) => [...previous, line].slice(-60));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [channel, storageKey]);

  function reset(): void {
    setHtmlCode(html);
    setCssCode(css);
    setJsCode(js);
    setLogs([]);
    setSrcDoc(
      buildDoc({
        html,
        css,
        js,
        channel,
        storage: storageRef.current,
      }),
    );
  }

  const activeValue =
    tab === "html" ? htmlCode : tab === "css" ? cssCode : jsCode;
  const setActiveValue =
    tab === "html" ? setHtmlCode : tab === "css" ? setCssCode : setJsCode;

  return (
    <div className="not-prose my-8">
      <div className="clay overflow-hidden">
        <div className="bg-ink flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="bg-rose size-3 rounded-full" />
            <span className="bg-sun size-3 rounded-full" />
            <span className="bg-mint size-3 rounded-full" />
          </div>
          <p className="text-brand-soft/70 hidden min-w-0 flex-1 truncate font-mono text-xs sm:block">
            {title}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="text-brand-soft/80 hover:text-white inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition-colors hover:bg-white/10"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={run}
              className="bg-mint hover:bg-mint/90 text-ink inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors"
            >
              <Play className="size-3.5" aria-hidden="true" />
              Run
            </button>
          </div>
        </div>

        <div className={showPreview ? "grid lg:grid-cols-2" : "grid grid-cols-1"}>
          <div
            className={
              showPreview
                ? "border-line flex min-w-0 flex-col border-b lg:border-r lg:border-b-0"
                : "border-line flex min-w-0 flex-col"
            }
          >
            <div className="flex items-center gap-1 overflow-x-auto bg-[#262046] px-2 pt-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={
                    item.id === tab
                      ? "rounded-t-lg bg-[#1e1938] px-3 py-2 font-mono text-xs font-bold text-white"
                      : "text-brand-soft/50 hover:text-white rounded-t-lg px-3 py-2 font-mono text-xs font-bold transition-colors"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <textarea
              value={activeValue}
              onChange={(event) => setActiveValue(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  run();
                }
              }}
              spellCheck={false}
              aria-label={`${title} — ${tab} code`}
              style={{ height: `${height}px` }}
              className="w-full resize-y bg-[#1e1938] p-4 font-mono text-xs leading-relaxed text-[#e9e6f7] outline-none"
            />
          </div>

          {showPreview ? (
            <div className="flex min-w-0 flex-col">
              <div className="border-line text-ink-soft flex items-center gap-2 border-b px-3 py-2 text-xs font-bold">
                <span className="bg-mint size-2 rounded-full" aria-hidden="true" />
                Preview
              </div>
              <iframe
                title={`${title} preview`}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
                style={{ height: `${height}px` }}
                className="w-full flex-1 bg-white"
              />
            </div>
          ) : (
            <div className="hidden" aria-hidden="true">
              <iframe
                title={`${title} preview`}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
                style={{ height: `${height}px` }}
              />
            </div>
          )}
        </div>

        {showConsole && (
          <div className="border-line border-t bg-[#1e1938]">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-brand-soft/60 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide uppercase">
                <Terminal className="size-3.5" aria-hidden="true" />
                Console
              </p>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-brand-soft/50 hover:text-white inline-flex min-h-7 items-center gap-1 rounded px-1.5 text-[11px] font-bold transition-colors"
                >
                  <Trash2 className="size-3" aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>
            <div className="max-h-36 overflow-y-auto px-3 pb-3 font-mono text-xs leading-relaxed">
              {logs.length === 0 ? (
                <p className="text-white/30">
                  Console is quiet. Run the code to see output.
                </p>
              ) : (
                logs.map((line, index) => (
                  <p
                    key={index}
                    className={
                      line.type === "error"
                        ? "text-rose"
                        : line.type === "warn"
                          ? "text-sun"
                          : line.type === "info"
                            ? "text-brand-soft"
                            : "text-[#e9e6f7]"
                    }
                  >
                    <span className="text-white/30" aria-hidden="true">
                      ›{" "}
                    </span>
                    {line.message}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-ink-soft mt-3 text-sm leading-relaxed font-bold">
        Edit the code, then hit <strong>Run</strong> (or{" "}
        <span className="font-mono text-xs">Ctrl + Enter</span>) and watch the{" "}
        {showPreview ? "preview" : "console"}. This is a safe sandbox — you
        can't break the page.
      </p>
    </div>
  );
}
