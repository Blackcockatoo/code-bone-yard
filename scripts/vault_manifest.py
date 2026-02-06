from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", ".next", "dist", "build", "__pycache__"}


def sha256_file(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def sniff_kind(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in {".md", ".txt"}:
        return "doc"
    if ext in {".py"}:
        return "python"
    if ext in {".ts", ".tsx"}:
        return "typescript"
    if ext in {".js", ".jsx"}:
        return "javascript"
    if ext in {".html", ".htm"}:
        return "html"
    if ext in {".json"}:
        return "json"
    if ext in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        return "image"
    if ext in {".pdf"}:
        return "pdf"
    return "other"


def main() -> None:
    root = Path(".").resolve()
    out_dir = root / "_vault"
    out_dir.mkdir(exist_ok=True)

    manifest_path = out_dir / "manifest.jsonl"
    index_path = out_dir / "index.md"

    rows: list[dict[str, str | int]] = []
    for dirpath, dirnames, filenames in os.walk(root):
        current_dir = Path(dirpath)
        dirnames[:] = [
            name for name in dirnames if name not in SKIP_DIRS and not name.startswith(".")
        ]
        for filename in filenames:
            if filename.startswith("."):
                continue
            path = current_dir / filename
            if "_vault" in path.parts:
                continue
            try:
                stats = path.stat()
                rows.append(
                    {
                        "path": str(path.relative_to(root)),
                        "bytes": stats.st_size,
                        "mtime_utc": datetime.fromtimestamp(
                            stats.st_mtime, tz=timezone.utc
                        ).isoformat(),
                        "kind": sniff_kind(path),
                        "sha256": sha256_file(path),
                    }
                )
            except Exception as exc:
                rows.append({"path": str(path.relative_to(root)), "error": str(exc)})

    rows.sort(key=lambda row: row.get("path", ""))

    with manifest_path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    by_kind: dict[str, int] = {}
    for row in rows:
        kind = str(row.get("kind", "other"))
        by_kind.setdefault(kind, 0)
        by_kind[kind] += 1

    with index_path.open("w", encoding="utf-8") as handle:
        handle.write("# Vault Index\n\n")
        handle.write(f"Generated: {datetime.now(timezone.utc).isoformat()}\n\n")
        handle.write("## File counts by kind\n")
        for kind in sorted(by_kind):
            handle.write(f"- {kind}: {by_kind[kind]}\n")
        handle.write(
            "\n## Next step\n"
            "- Add NOTES.md per top folder with: purpose, run steps, tags, next upgrades.\n"
        )

    print("Wrote:", manifest_path)
    print("Wrote:", index_path)


if __name__ == "__main__":
    main()
