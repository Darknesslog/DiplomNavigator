"""Source references resolve from the actual output document, at any directory depth."""

import re

import pytest

from backend.scripts.export_method_inventory import ROOT, build_inventory


@pytest.mark.parametrize("relative", [".tmp/reviews/catalog.md", ".tmp/reviews/nested/catalog.md"])
def test_generated_source_links_resolve_to_existing_source_lines(relative):
    output = ROOT / relative
    links = re.findall(r"\]\(<([^>]+)#L(\d+)>\)", build_inventory(output))
    assert links
    for target, line in links:
        source = (output.parent / target).resolve()
        assert source.is_relative_to(ROOT / "backend/app")
        assert 1 <= int(line) <= len(source.read_text(encoding="utf-8-sig").splitlines())
