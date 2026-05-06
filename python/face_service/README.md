# Face Service (Flask)

This is a small Python microservice that performs **actual face encoding + matching** using the `face_recognition` library.

## Endpoints

- `GET /health`
- `POST /encode` (multipart/form-data)
  - `image`: file
  - Returns: `{ "faces": [{ box, encoding(128 floats) }, ...] }`
- `POST /match` (multipart/form-data)
  - `image`: file (probe)
  - `candidates`: JSON array string
    - Example: `[{"person_id":1,"face_id":10,"template":[...128 floats...]}]`
  - Returns: `{ "matches": [{ person_id, face_id, distance, confidence }, ...] }`

## Run

```powershell
cd python\face_service
python -m venv .venv

# Option A (recommended in PowerShell/VS Code): call the venv interpreter directly
\.\.venv\Scripts\python -m pip install -r requirements.txt
\.\.venv\Scripts\python app.py

# Option B: activate the venv (may be blocked by PowerShell ExecutionPolicy)
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# . .\.venv\Scripts\Activate.ps1
# pip install -r requirements.txt
# python app.py
```

Default URL: `http://127.0.0.1:5005`

## Notes (Windows)

`face_recognition` depends on `dlib` and may require native build tools on Windows. If installation fails:

- Use **WSL** (recommended), or
- Use **conda** (often the easiest on Windows), or
- Install Visual Studio C++ Build Tools + CMake and retry.

### Conda (recommended on Windows)

```powershell
cd python\face_service

# One-command environment creation (avoids building dlib from source)
conda env create -f environment.yml
conda activate face_service

python app.py
```

Note: this conda environment is intentionally **minimal** (no OpenCV) to avoid very large downloads on Windows.
If you need OpenCV later, you can add it with:

```powershell
conda install -c conda-forge opencv -y
```

If you prefer not to use `environment.yml`, you can also try:

```powershell
conda create -n face_service -c conda-forge python=3.11 dlib face_recognition flask numpy pillow opencv -y
conda activate face_service
python app.py
```

### WSL (recommended for dlib)

In WSL Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake
cd python/face_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Docker (no conda / no Windows dlib build)

If you have Docker Desktop installed, this is usually the fastest way on Windows:

```powershell
cd python\face_service
docker compose up --build
```

Then test:

```powershell
curl http://127.0.0.1:5005/health
```
