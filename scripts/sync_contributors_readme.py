from __future__ import annotations

from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parents[1]
README = ROOT / 'README.md'
CONTRIBUTORS = ROOT / 'contributors.json'


def render_table(contributors: list[dict[str, str]]) -> str:
    rows = [
        '| Avatar | Name | Contact | Course | College | Address | GitHub Username |',
        '| --- | --- | --- | --- | --- | --- | --- |',
    ]
    for contributor in contributors:
        username = contributor.get('github_username', '').strip()
        avatar = f'https://github.com/{username}.png?size=72' if username else 'https://github.com/identicons/placeholder.png'
        github_link = f'[{username}](https://github.com/{username})' if username else ''
        rows.append(
            f"| <img src=\"{avatar}\" width=\"48\" height=\"48\" alt=\"{contributor.get('name', 'Contributor')} avatar\" /> | "
            f"{contributor.get('name', '')} | {contributor.get('contact', '')} | {contributor.get('course', '')} | "
            f"{contributor.get('college', '')} | {contributor.get('address', '')} | {github_link} |"
        )
    return '\n'.join(rows)


def main() -> None:
    if not README.exists() or not CONTRIBUTORS.exists():
        raise FileNotFoundError('README.md or contributors.json not found')

    readme = README.read_text(encoding='utf-8')
    contributors = json.loads(CONTRIBUTORS.read_text(encoding='utf-8')).get('contributors', [])
    section = f"<!-- CONTRIBUTORS:START -->\n{render_table(contributors)}\n<!-- CONTRIBUTORS:END -->"
    pattern = re.compile(r'<!-- CONTRIBUTORS:START -->[\s\S]*?<!-- CONTRIBUTORS:END -->', re.M)

    if not pattern.search(readme):
        raise RuntimeError('Contributor markers not found in README.md')

    README.write_text(pattern.sub(section, readme), encoding='utf-8')


if __name__ == '__main__':
    main()
