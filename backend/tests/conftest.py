import sys
from pathlib import Path

# Add venv site-packages to path
_venv_site = Path("d:/MediaTrust/venv/Lib/site-packages")
if _venv_site.exists() and str(_venv_site) not in sys.path:
    sys.path.insert(0, str(_venv_site))

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
