"""Static smoke checks for the no-build vanilla frontend."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class MarkupInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.scripts = []
        self.stylesheets = []
        self.labels_for = []
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'script':
            self.scripts.append(attrs)
        if tag == 'link':
            if attrs.get('rel') == 'stylesheet':
                self.stylesheets.append(attrs.get('href'))
            if attrs.get('href'):
                self.links.append(attrs['href'])
        if tag == 'label' and attrs.get('for'):
            self.labels_for.append(attrs['for'])

class FrontendStaticTests(unittest.TestCase):
    def test_index_uses_classic_javascript_and_local_css(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        parser = MarkupInspector(); parser.feed(html)
        app_scripts = [s for s in parser.scripts if s.get('src') == '/src/scripts/game.js']
        self.assertEqual(len(app_scripts), 1)
        self.assertNotIn('type', app_scripts[0])
        self.assertEqual(parser.stylesheets, ['/styles/game.css'])
        self.assertTrue((ROOT / 'src/scripts/game.js').is_file())
        self.assertTrue((ROOT / 'styles/game.css').is_file())

    def test_ids_are_unique_and_labels_resolve(self):
        parser = MarkupInspector(); parser.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
        self.assertEqual(len(parser.ids), len(set(parser.ids)))
        missing = set(parser.labels_for) - set(parser.ids)
        self.assertFalse(missing, f'Labels point to missing fields: {sorted(missing)}')

    def test_javascript_dom_ids_exist(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        parser = MarkupInspector(); parser.feed(html)
        js = (ROOT / 'src/scripts/game.js').read_text(encoding='utf-8')
        used = set(re.findall(r"\$\('#([A-Za-z][\w-]*)'", js))
        missing = used - set(parser.ids)
        self.assertFalse(missing, f'JavaScript refers to missing IDs: {sorted(missing)}')

    def test_legacy_entry_points_redirect_to_vanilla_app(self):
        for filename, destination in [('login.html', 'view=login'), ('cadastrar.html', 'view=register'), ('dashboard.html', 'view=history')]:
            html = (ROOT / filename).read_text(encoding='utf-8')
            self.assertIn(destination, html)
            self.assertIn('/index.html', html)

    def test_no_framework_or_module_loader_in_active_frontend(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        js = (ROOT / 'src/scripts/game.js').read_text(encoding='utf-8')
        self.assertNotIn('type="module"', html)
        self.assertNotRegex(js, r'(^|\n)\s*import\s+')
        self.assertNotRegex(js, r'(^|\n)\s*export\s+')

    def test_frontend_api_contracts_exist_in_fastapi_backend(self):
        backend = ROOT.parent / 'apisme-main' / 'src' / 'controllers' / 'testeme'
        source = '\n'.join(path.read_text(encoding='utf-8') for path in backend.glob('*.py'))
        source = source.replace("'", '"')
        routes = set(re.findall(r'@router\.(?:get|post|put|delete)\(\s*"([^"]+)"', source))
        expected = {
            '/cadastrar', '/logar', '/users/me', '/characters/me', '/progress/me',
            '/world/map', '/world/spots', '/npcs', '/activities',
            '/activities/{activity_id}/start', '/activities/{activity_id}/submit',
            '/ai/generate-activity', '/ranking/global', '/activities/history',
        }
        missing = expected - routes
        self.assertFalse(missing, f'Rotas consumidas pelo frontend ausentes no backend: {sorted(missing)}')

if __name__ == '__main__':
    unittest.main(verbosity=2)
