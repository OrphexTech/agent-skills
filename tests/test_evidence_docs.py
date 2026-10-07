import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile


spec = importlib.util.spec_from_file_location('package_evidence_docs', Path(__file__).resolve().parents[1] / 'scripts/package_evidence_docs.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def fixture(overrides=None):
    files = {'README.md': b'Original evaluation documentation.\n'}
    manifest = []
    for index in range(319):
        name = f'runs/record-{index}.json'
        files[name] = json.dumps({'record': index}).encode()
        manifest.append({'path': name, 'normalizedSha256': m.sha256(files[name]), 'selectedFinal': index < 142})
    files['record-manifest.json'] = json.dumps(manifest).encode()
    review = '\n'.join('![Screenshot](' + m.LOCAL_IMAGE_PREFIX + name + ')' for name in m.SCREENSHOTS)
    review += '\n![Earlier mobile directory during third-party player loading](' + m.LOCAL_IMAGE_PREFIX + 'skills-v2-local-mobile.png)\n'
    files['skills-v2-ui-review.md'] = review.encode()
    for name in m.SCREENSHOTS:
        files['ui/' + name] = b'unchanged image fixture'
    files.update(overrides or {})
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w') as archive:
        for name, data in files.items():
            archive.writestr(name, data)
    return output.getvalue()


class EvidenceDocumentationTests(unittest.TestCase):
    def test_preserves_every_record_and_original_document_with_resolving_image_links(self):
        source = fixture()
        output = m.corrected_archive(source, expected_sha256=m.sha256(source))
        before, after = m.read_archive(source), m.read_archive(output)
        for name, data in before.items():
            if name not in m.ROOT_DOCS:
                self.assertEqual(after[name], data, name)
        self.assertEqual(after['historical/README-v2.0.0.md'], before['README.md'])
        self.assertEqual(after['historical/skills-v2-ui-review.md'], before['skills-v2-ui-review.md'])
        review = after['skills-v2-ui-review.md'].decode()
        for name in m.SCREENSHOTS:
            self.assertIn('(ui/' + name + ')', review)
            self.assertIn('ui/' + name, after)
        self.assertNotIn(m.LOCAL_IMAGE_PREFIX, review)
        self.assertIn('absent earlier frame', review)
        self.assertNotIn('ui/skills-v2-local-mobile.png', after)
        self.assertEqual(output, m.corrected_archive(source, expected_sha256=m.sha256(source)))

    def test_rejects_unpinned_input_and_corrupted_hash_bound_evidence(self):
        source = fixture()
        with self.assertRaisesRegex(ValueError, 'pinned published digest'):
            m.corrected_archive(source)
        corrupted = fixture({'runs/record-0.json': b'changed answer'})
        with self.assertRaisesRegex(ValueError, 'Evidence hash mismatch'):
            m.corrected_archive(corrupted, expected_sha256=m.sha256(corrupted))

    def test_rejects_unsafe_paths_and_missing_screenshots(self):
        for name in ['../escape.txt', '/absolute.txt', 'folder\\file.txt']:
            source = fixture({name: b'unsafe'})
            with self.assertRaisesRegex(ValueError, 'unsafe'):
                m.corrected_archive(source, expected_sha256=m.sha256(source))
        source = fixture()
        files = m.read_archive(source)
        del files['ui/' + m.SCREENSHOTS[0]]
        with self.assertRaisesRegex(ValueError, 'Missing included screenshot'):
            m.validate_records(files)

    def test_refuses_to_overwrite_an_existing_output(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'input.zip', Path(directory) / 'output.zip'
            source.write_bytes(b'input')
            output.write_bytes(b'keep this published evidence')
            with patch.object(m, 'corrected_archive', return_value=b'new archive'):
                with self.assertRaises(FileExistsError):
                    m.package_evidence(source, output)
            self.assertEqual(output.read_bytes(), b'keep this published evidence')


if __name__ == '__main__':
    unittest.main()
