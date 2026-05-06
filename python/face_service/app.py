import json
import os

import numpy as np
from flask import Flask, jsonify, request


def _load_face_recognition():
    try:
        import face_recognition  # type: ignore

        return face_recognition
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "face_recognition is not installed or failed to import. "
            "On Windows this often requires build tools (dlib). "
            "Try using WSL or a prebuilt environment."
        ) from exc


app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"ok": True})


def _read_image_bytes() -> bytes:
    if "image" not in request.files:
        raise ValueError("Missing file field 'image'.")
    file = request.files["image"]
    data = file.read()
    if not data:
        raise ValueError("Empty image file.")
    return data


@app.post("/encode")
def encode():
    try:
        face_recognition = _load_face_recognition()

        from io import BytesIO
        from PIL import Image

        image_bytes = _read_image_bytes()
        pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = np.array(pil_img)

        # Find face(s) and encode.
        boxes = face_recognition.face_locations(img, model=os.getenv("FR_MODEL", "hog"))
        if not boxes:
            return jsonify({"faces": []})

        encodings = face_recognition.face_encodings(img, known_face_locations=boxes)
        faces = []
        for box, enc in zip(boxes, encodings):
            top, right, bottom, left = box
            faces.append(
                {
                    "box": {"top": top, "right": right, "bottom": bottom, "left": left},
                    "encoding": [float(x) for x in enc.tolist()],
                }
            )

        return jsonify({"faces": faces})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/match")
def match():
    """Match a probe image against candidate encodings.

    Expects multipart/form-data:
      - image: probe image file
      - candidates: JSON array [{"person_id": 1, "template": [..128 floats..]}, ...]

    Returns sorted matches with distance and confidence.
    """
    try:
        face_recognition = _load_face_recognition()

        from io import BytesIO
        from PIL import Image

        image_bytes = _read_image_bytes()
        candidates_raw = request.form.get("candidates", "[]")
        candidates = json.loads(candidates_raw)
        if not isinstance(candidates, list):
            raise ValueError("'candidates' must be a JSON array.")

        pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = np.array(pil_img)

        boxes = face_recognition.face_locations(img, model=os.getenv("FR_MODEL", "hog"))
        if not boxes:
            return jsonify({"matches": [], "note": "No face detected"})

        probe_encodings = face_recognition.face_encodings(img, known_face_locations=boxes)
        if not probe_encodings:
            return jsonify({"matches": [], "note": "No encodings produced"})

        probe = probe_encodings[0]

        candidate_vectors = []
        candidate_meta = []
        for cand in candidates:
            if not isinstance(cand, dict):
                continue
            template = cand.get("template")
            person_id = cand.get("person_id")
            face_id = cand.get("face_id")
            if not isinstance(template, list) or len(template) != 128:
                continue
            candidate_vectors.append(np.array(template, dtype=np.float64))
            candidate_meta.append({"person_id": person_id, "face_id": face_id})

        if not candidate_vectors:
            return jsonify({"matches": [], "note": "No valid candidates"})

        distances = face_recognition.face_distance(candidate_vectors, probe)

        results = []
        # Convert distance to a 0-100 confidence for UI (heuristic).
        # Typical threshold ~0.6 for same person.
        for meta, dist in zip(candidate_meta, distances.tolist()):
            dist_val = float(dist)
            conf = (1.0 - (dist_val / 0.6)) * 100.0
            conf = max(0.0, min(100.0, conf))
            results.append(
                {
                    **meta,
                    "distance": dist_val,
                    "confidence": round(conf, 2),
                }
            )

        results.sort(key=lambda r: (-(r.get("confidence") or 0.0), r.get("distance") or 0.0))
        return jsonify({"matches": results[: int(os.getenv("FR_TOP_K", "20"))]})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "5005"))
    app.run(host=host, port=port, debug=True)
