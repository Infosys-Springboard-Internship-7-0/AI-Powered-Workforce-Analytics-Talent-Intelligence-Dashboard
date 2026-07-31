import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const contributorsPath = path.join(rootDir, 'contributors.json');
const readmePath = path.join(rootDir, 'README.md');

const contributors = JSON.parse(fs.readFileSync(contributorsPath, 'utf8')).contributors ?? [];
const readme = fs.readFileSync(readmePath, 'utf8');

const startMarker = '<!-- CONTRIBUTORS:START -->';
const endMarker = '<!-- CONTRIBUTORS:END -->';
const sectionPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);

const rows = [
  '| Avatar | Name | Contact | Course | College | Address | GitHub Username |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...contributors.map((contributor) => {
    const name = contributor.name ?? '';
    const contact = contributor.contact ?? '';
    const course = contributor.course ?? '';
    const college = contributor.college ?? '';
    const address = contributor.address ?? '';
    const githubUsername = contributor.github_username ?? '';
    const avatarUrl = githubUsername
      ? `https://github.com/${encodeURIComponent(githubUsername)}.png?size=72`
      : 'https://github.com/identicons/placeholder.png';
    const githubLink = githubUsername
      ? `[${githubUsername}](https://github.com/${githubUsername})`
      : '';

    return `| <img src="${avatarUrl}" width="48" height="48" alt="${name} avatar" /> | ${name} | ${contact} | ${course} | ${college} | ${address} | ${githubLink} |`;
  }),
];

const generatedSection = `${startMarker}\n${rows.join('\n')}\n${endMarker}`;

if (!sectionPattern.test(readme)) {
  throw new Error('Contributor section markers were not found in README.md');
}

const updatedReadme = readme.replace(sectionPattern, generatedSection);

if (updatedReadme !== readme) {
  fs.writeFileSync(readmePath, updatedReadme);
}
