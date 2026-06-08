import StackTrace from "stacktrace-js";

const REPO_NAME = "stud-frontend";
const LOG_API = `${process.env.REACT_APP_API_BASE_URL}/api/logs`;

// Resolve any webpack/localhost URL to a clean relative path.
const cleanPath = (raw) => {
    if (!raw || raw === "<anonymous>") return null;
    const webpackInternal = raw.match(/webpack-internal:\/\/\/\.?\/?(.*)/);
    if (webpackInternal) return webpackInternal[1];
    const webpack = raw.match(/webpack:\/\/\/\.?\/?(.*)/);
    if (webpack) return webpack[1];
    const localhost = raw.match(/localhost:\d+\/(.*)/);
    if (localhost) return localhost[1];
    const srcPath = raw.match(/\/src\/(.*)/);
    if (srcPath) return `src/${srcPath[1]}`;
    return raw;
};

const isInternalFrame = (raw = "") =>
    raw.includes("logger.js") ||
    raw.includes("node_modules") ||
    raw.includes("webpack/bootstrap") ||
    raw.includes("webpack-dev-server") ||
    raw.includes("(webpack)");

const getCallerFile = () => {
    try {
        for (const line of new Error().stack.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("at ")) continue;

            const inParens = trimmed.match(/\((.+?):\d+:\d+\)/);
            const raw = inParens
                ? inParens[1]
                : (trimmed.match(/at\s+(.+?):\d+:\d+/) || [])[1];

            if (!raw || isInternalFrame(raw)) continue;

            const cleaned = cleanPath(raw);
            if (cleaned && !isInternalFrame(cleaned)) return cleaned;
        }
        return "unknown";
    } catch {
        return "unknown";
    }
};

const serializeData = (val) => {
    if (val instanceof Error) {
        return {
            name: val.name,
            message: val.message,
            stack: val.stack,
            ...Object.fromEntries(
                Object.entries(val).filter(([k]) => !["name", "message", "stack"].includes(k))
            ),
        };
    }
    return val;
};

const sendLog = (entry) => {
    fetch(LOG_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    }).catch(() => {});
};

const log = (level, message, data = null) => {
    const entry = {
        origin: "frontend",
        file: getCallerFile(),
        repo: REPO_NAME,
        level,
        message,
        data: serializeData(data),
        time: new Date().toISOString(),
    };
    console[level](entry);
    sendLog(entry);
};

const _originalConsoleError = console.error;
console.error = (...args) => {
    _originalConsoleError(...args);
    if (typeof args[0] === "object" && args[0]?.repo === REPO_NAME) return;
    const message = args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
    sendLog({
        origin: "frontend",
        file: getCallerFile(),
        repo: REPO_NAME,
        level: "error",
        message,
        data: null,
        source: "console.error",
        time: new Date().toISOString(),
    });
};

window.onerror = (message, source, lineno, colno, error) => {
    sendLog({
        origin: "frontend",
        file: cleanPath(source) || source || "unknown",
        repo: REPO_NAME,
        level: "error",
        message: String(message),
        data: { lineno, colno, stack: error?.stack ?? null },
        source: "window.onerror",
        time: new Date().toISOString(),
    });
};

window.addEventListener("unhandledrejection", async (event) => {
    const reason = event.reason;
    let file = getCallerFile();
    let resolvedStack = reason?.stack ?? null;

    try {
        if (reason instanceof Error) {
            const frames = await StackTrace.fromError(reason);
            const appFrame =
                frames.find(
                    (f) =>
                        f.fileName &&
                        !f.fileName.includes("node_modules") &&
                        !f.fileName.includes("bundle.js"),
                ) ?? frames[0];
            if (appFrame?.fileName) {
                file = cleanPath(appFrame.fileName) ?? file;
            }
            resolvedStack =
                reason.toString() +
                "\n" +
                frames
                    .map(
                        (f) =>
                            `    at ${f.functionName || "<anonymous>"} (${f.fileName}:${f.lineNumber}:${f.columnNumber})`,
                    )
                    .join("\n");
        }
    } catch {}

    sendLog({
        origin: "frontend",
        file,
        repo: REPO_NAME,
        level: "error",
        message: String(reason),
        data: { stack: resolvedStack },
        source: "unhandledrejection",
        time: new Date().toISOString(),
    });
});

const logAt = (level, message, data, file) => {
    const entry = {
        origin: "frontend",
        file: file ? (cleanPath(file) ?? file) : getCallerFile(),
        repo: REPO_NAME,
        level,
        message,
        data: serializeData(data),
        time: new Date().toISOString(),
    };
    console[level](entry);
    sendLog(entry);
};

export const logger = {
    info: (msg, data) => log("log", msg, data),
    warn: (msg, data) => log("warn", msg, data),
    error: (msg, data) => log("error", msg, data),
    errorAt: (msg, data, file) => logAt("error", msg, data, file),
};

export const logError = (message, err, file) => {
    const entry = {
        origin: "frontend",
        file: file || getCallerFile(),
        repo: REPO_NAME,
        level: "error",
        message,
        data: serializeData(err),
        time: new Date().toISOString(),
    };
    console.error(entry);
    sendLog(entry);
};
