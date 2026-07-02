import { app, ipcMain } from "electron";
import https from "node:https";
import pkg from "../../package.json";

export interface ChangelogSection {
  title?: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

export interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  latestTag: string;
  releaseUrl: string;
  releasesUrl: string;
  changelog?: ChangelogEntry[];
}

export type UpdateCheckResult =
  | {
      status: "available";
      update: AppUpdateInfo;
      message: string;
    }
  | {
      status: "current";
      update: null;
      message: string;
    }
  | {
      status: "error";
      update: null;
      message: string;
    };

export interface CheckUpdatePayload {
  includeChangelog?: boolean;
}

interface GitHubRelease {
  tag_name?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
}

type VersionParts = [number, number, number];

const templateUpdateConfig = pkg.template?.update;

const updateOwner = process.env.VITE_UPDATE_OWNER || templateUpdateConfig?.owner;
const updateRepo = process.env.VITE_UPDATE_REPO || templateUpdateConfig?.repo;
const releasesUrl =
  process.env.VITE_UPDATE_RELEASES_URL ||
  templateUpdateConfig?.releasesUrl ||
  (updateOwner && updateRepo
    ? `https://github.com/${updateOwner}/${updateRepo}/releases`
    : "");
const releasesApiUrl =
  process.env.VITE_UPDATE_RELEASES_API ||
  (updateOwner && updateRepo
    ? `https://api.github.com/repos/${updateOwner}/${updateRepo}/releases`
    : "");
const changelogUrl =
  process.env.VITE_UPDATE_CHANGELOG_URL || templateUpdateConfig?.changelogUrl || "";

export function setupUpdateIPC() {
  ipcMain.handle(
    "check-update",
    async (_event, payload?: CheckUpdatePayload): Promise<UpdateCheckResult> => {
      return checkForUpdates({ includeChangelog: Boolean(payload?.includeChangelog) });
    }
  );
}

async function checkForUpdates(options: {
  includeChangelog: boolean;
}): Promise<UpdateCheckResult> {
  if (!releasesApiUrl || !releasesUrl) {
    return errorResult("Update repository is not configured.");
  }

  const currentVersion = normalizeVersion(app.getVersion() || pkg.version);
  const currentParts = parseVersionParts(currentVersion);
  if (!currentParts) {
    return errorResult(`Unable to parse current version: ${currentVersion}`);
  }

  try {
    const releases = await getJson<GitHubRelease[]>(releasesApiUrl);
    const latestRelease = findLatestStableRelease(releases);
    if (!latestRelease?.tag_name) {
      return {
        status: "current",
        update: null,
        message: "No stable release was found.",
      };
    }

    const latestVersion = normalizeVersion(latestRelease.tag_name);
    const latestParts = parseVersionParts(latestVersion);
    if (!latestParts) {
      return errorResult(`Unable to parse latest version: ${latestRelease.tag_name}`);
    }

    if (compareVersionParts(currentParts, latestParts) >= 0) {
      return {
        status: "current",
        update: null,
        message: `Current version ${currentVersion} is up to date.`,
      };
    }

    const update: AppUpdateInfo = {
      currentVersion,
      latestVersion,
      latestTag: latestRelease.tag_name,
      releaseUrl: latestRelease.html_url || releasesUrl,
      releasesUrl,
    };

    if (options.includeChangelog && changelogUrl) {
      try {
        const changelog = await getText(changelogUrl);
        update.changelog = filterChangelogEntries(
          parseChangelog(changelog),
          currentVersion,
          latestVersion
        );
      } catch {
        update.changelog = [];
      }
    }

    return {
      status: "available",
      update,
      message: `A new version ${latestVersion} is available.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown update error";
    return errorResult(message);
  }
}

function errorResult(message: string): UpdateCheckResult {
  return {
    status: "error",
    update: null,
    message,
  };
}

function getJson<T>(url: string): Promise<T> {
  return request(url, {
    accept: "application/vnd.github+json",
  }).then((text) => JSON.parse(text) as T);
}

function getText(url: string): Promise<string> {
  return request(url, {
    accept: "text/plain",
  });
}

function request(
  url: string,
  options: { accept: string },
  redirectCount = 0
): Promise<string> {
  if (redirectCount > 5) {
    return Promise.reject(new Error("Too many redirects"));
  }

  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          Accept: options.accept,
          "User-Agent": `${pkg.name}-update-checker`,
        },
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const redirectUrl = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && redirectUrl) {
          response.resume();
          const nextUrl = new URL(redirectUrl, url).toString();
          request(nextUrl, options, redirectCount + 1).then(resolve, reject);
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          reject(new Error(`GitHub request failed with status ${statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      }
    );

    req.setTimeout(12_000, () => {
      req.destroy(new Error("Update request timed out"));
    });
    req.on("error", reject);
  });
}

function findLatestStableRelease(releases: GitHubRelease[]) {
  let latestRelease: GitHubRelease | null = null;
  let latestParts: VersionParts | null = null;

  for (const release of releases) {
    if (release.draft || release.prerelease || !release.tag_name) continue;

    const parts = parseVersionParts(release.tag_name);
    if (!parts) continue;

    if (!latestParts || compareVersionParts(parts, latestParts) > 0) {
      latestRelease = release;
      latestParts = parts;
    }
  }

  return latestRelease;
}

function normalizeVersion(version: string) {
  return version.trim().replace(/^v/i, "").split("-")[0];
}

function parseVersionParts(version: string): VersionParts | null {
  const normalized = normalizeVersion(version);
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersionParts(a: VersionParts, b: VersionParts) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function parseChangelog(markdown: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const versionRegex = /^## \[(\d+\.\d+\.\d+)\]\s*-\s*(.+)$/;
  const sectionRegex = /^### (.+)$/;
  const lines = markdown.split("\n");
  let currentEntry: ChangelogEntry | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of lines) {
    const versionMatch = line.match(versionRegex);
    if (versionMatch) {
      if (currentSection?.items.length && currentEntry) {
        currentEntry.sections.push(currentSection);
      }
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2].trim(),
        sections: [],
      };
      currentSection = { items: [] };
      continue;
    }

    if (!currentEntry) continue;

    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      if (currentSection?.items.length) {
        currentEntry.sections.push(currentSection);
      }
      currentSection = { title: sectionMatch[1], items: [] };
      continue;
    }

    const itemMatch = line.match(/^- (.+)$/);
    if (itemMatch && currentSection) {
      currentSection.items.push(itemMatch[1]);
    }
  }

  if (currentSection?.items.length && currentEntry) {
    currentEntry.sections.push(currentSection);
  }
  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

function filterChangelogEntries(
  entries: ChangelogEntry[],
  currentVersion: string,
  latestVersion: string
) {
  const currentParts = parseVersionParts(currentVersion);
  const latestParts = parseVersionParts(latestVersion);
  if (!currentParts || !latestParts) return [];

  return entries.filter((entry) => {
    const entryParts = parseVersionParts(entry.version);
    if (!entryParts) return false;
    return (
      compareVersionParts(entryParts, currentParts) > 0 &&
      compareVersionParts(entryParts, latestParts) <= 0
    );
  });
}
