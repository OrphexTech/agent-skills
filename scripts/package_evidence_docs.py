"""Repackage the pinned v2 evidence with corrected documentation, preserving records."""

import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import stat
import zipfile


INPUT_SHA256 = 'adf91deda5fbc352d392c17d0256aa5c845e2d409f4b526176d822871689abda'
SOURCE_SHA = '83dc5a20963f9990e42f329acdc41f94258dc6eb'
CORRECTION_TAG = 'docs-2026-10-07'
SCREENSHOTS = (
    'skills-v2-local-desktop.png',
    'skills-v2-local-mobile-video-settled.png',
    'skills-v2-local-detail-mobile.png',
)
LOCAL_IMAGE_PREFIX = '/LOCAL_USER/.codex/visualizations/2026/10/06/01a110c0-43da-7ca2-98db-ece9b8220693/'
ROOT_DOCS = ('README.md', 'skills-v2-ui-review.md')


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def read_archive(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        files = {}
        for entry in archive.infolist():
            path = PurePosixPath(entry.filename)
            if (entry.filename in files or path.is_absolute()
                    or '..' in path.parts or '\\' in entry.filename
                    or str(path) != entry.filename or entry.is_dir()
                    or stat.S_ISLNK(entry.external_attr >> 16)):
                raise ValueError('Duplicate, unsafe or unsupported archive entry')
            files[entry.filename] = archive.read(entry)
        return files


def validate_records(files):
    manifest = json.loads(files['record-manifest.json'])
    if not isinstance(manifest, list) or len(manifest) != 319:
        raise ValueError('Expected 319 hash-bound evidence entries')
    paths = [entry['path'] for entry in manifest]
    if len(set(paths)) != len(paths) or any(path in ROOT_DOCS for path in paths):
        raise ValueError('Duplicate manifest entries or hash-bound root documentation')
    for entry in manifest:
        if sha256(files[entry['path']]) != entry['normalizedSha256']:
            raise ValueError('Evidence hash mismatch: ' + entry['path'])
    selected = [entry for entry in manifest if entry['selectedFinal']]
    if len(selected) != 142 or len({PurePosixPath(entry['path']).name for entry in selected}) != 142:
        raise ValueError('Expected 142 uniquely named final measurement records')
    for name in SCREENSHOTS:
        if 'ui/' + name not in files:
            raise ValueError('Missing included screenshot: ' + name)
    return manifest


def corrected_archive(data, *, expected_sha256=INPUT_SHA256):
    """The CLI uses the published digest; tests supply a synthetic fixture digest."""
    if sha256(data) != expected_sha256:
        raise ValueError('Input archive does not match the pinned published digest')
    files = read_archive(data)
    validate_records(files)
    originals = {name: files[name] for name in ROOT_DOCS}
    notice = (
        '# Documentation correction — 2026-10-07\n\n'
        'This supplement preserves the v2.0.0 native evidence. Only this README and '
        'the UI review presentation changed; all 319 hash-bound entries, 142 final '
        'measurement records, grades, source hashes and screenshots remain byte-identical. '
        'No new agent run or skill release is claimed.\n\n'
        'Open the [UI review and included screenshots](skills-v2-ui-review.md). '
        'The original root documents are preserved under [historical/](historical/README-v2.0.0.md). '
        'The original review was written before publication; its pending checks are historical, '
        'not a current deployment assertion. The earlier player-loading screenshot was absent '
        'from the published input archive; this supplement does not invent it.\n\n'
        'See [documentation-corrections.json](documentation-corrections.json) for provenance. '
        'Use the exact v2.0.0 source tag for grading, as described below.\n\n'
    )
    files['README.md'] = (notice + originals['README.md'].decode('utf-8')).encode('utf-8')
    review = originals['skills-v2-ui-review.md'].decode('utf-8')
    for name in SCREENSHOTS:
        old = LOCAL_IMAGE_PREFIX + name
        if review.count(old) != 1:
            raise ValueError('Unexpected screenshot reference: ' + name)
        review = review.replace(old, 'ui/' + name)
    missing_image = ('![Earlier mobile directory during third-party player loading]('
                     + LOCAL_IMAGE_PREFIX + 'skills-v2-local-mobile.png)')
    if review.count(missing_image) != 1:
        raise ValueError('Unexpected missing-screenshot reference')
    review = review.replace(
        'This earlier frame is retained for traceability; the settled capture above resolves the local concern.',
        'The original review referenced an earlier frame that is absent from the published archive. '
        'It is unavailable here. The included settled capture above resolves the local loading concern.'
    ).replace(missing_image, 'No image is supplied for the absent earlier frame.')
    files['skills-v2-ui-review.md'] = (
        '> Documentation presentation corrected on 2026-10-07. This is a historical local review, '
        'not a new live-site verification. The three included images use archive-relative links. '
        'Read the [unchanged original review](historical/skills-v2-ui-review.md) for the original wording.\n\n'
        + review
    ).encode('utf-8')
    files['historical/README-v2.0.0.md'] = originals['README.md']
    files['historical/skills-v2-ui-review.md'] = originals['skills-v2-ui-review.md']
    corrections = {
        'schemaVersion': 1,
        'documentationTag': CORRECTION_TAG,
        'skillVersion': '2.0.0',
        'skillSourceSha': SOURCE_SHA,
        'inputArchiveSha256': expected_sha256,
        'inputArchiveUrl': 'https://github.com/OrphexTech/agent-skills/releases/download/v2.0.0/skills-v2-native-evidence.zip',
        'unchangedHashBoundEntries': 319,
        'unchangedSelectedFinalRecords': 142,
        'changes': [{
            'path': name,
            'originalSha256': sha256(originals[name]),
            'correctedSha256': sha256(files[name]),
            'historicalPath': 'historical/' + ('README-v2.0.0.md' if name == 'README.md' else name),
        } for name in ROOT_DOCS],
        'includedScreenshots': ['ui/' + name for name in SCREENSHOTS],
        'unavailableScreenshot': 'ui/skills-v2-local-mobile.png',
    }
    files['documentation-corrections.json'] = (json.dumps(corrections, indent=2) + '\n').encode('utf-8')
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(files):
            entry = zipfile.ZipInfo(name, (2026, 10, 7, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.create_system = 3
            entry.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(entry, files[name])
    packaged = output.getvalue()
    validate_records(read_archive(packaged))
    return packaged


def package_evidence(input_path, output_path):
    packaged = corrected_archive(Path(input_path).read_bytes())
    with Path(output_path).open('xb') as output:
        output.write(packaged)
    return sha256(packaged)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, help='Original published v2.0.0 ZIP')
    parser.add_argument('--output', required=True, help='New ZIP path; must not exist')
    args = parser.parse_args()
    digest = package_evidence(args.input, args.output)
    print(json.dumps({'sha256': digest, 'hashBoundEntries': 319, 'selectedFinalRecords': 142}))


if __name__ == '__main__':
    main()
