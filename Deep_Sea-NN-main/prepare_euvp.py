import argparse
import os
import shutil
from pathlib import Path
import random
from typing import List, Tuple, Dict, Set
from PIL import Image

# Allowed image extensions
IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}

INPUT_HINTS = {
    "input", "inputs", "raw", "underwater", "a", "traina", "testa", "poor", "source"
}
LABEL_HINTS = {
    "label", "labels", "gt", "gts", "groundtruth", "groundtruths", "b", "trainb", "testb", "clean", "reference", "target"
}


def is_image(p: Path) -> bool:
    return p.suffix.lower() in IMG_EXTS


def find_candidate_dirs(root: Path) -> Tuple[List[Path], List[Path]]:
    """
    Recursively scan for directories that likely contain input (underwater) or label (reference/clean) images.
    Uses directory name hints. Returns lists of candidate input_dirs and label_dirs.
    """
    input_dirs, label_dirs = [], []
    for d in root.rglob("*"):
        if not d.is_dir():
            continue
        name = d.name.lower()
        # Must contain images inside
        try:
            has_img = any(is_image(p) for p in d.iterdir())
        except Exception:
            has_img = False
        if not has_img:
            continue
        if any(h in name for h in INPUT_HINTS):
            input_dirs.append(d)
        if any(h in name for h in LABEL_HINTS):
            label_dirs.append(d)
    return input_dirs, label_dirs


def index_images(dirs: List[Path]) -> Dict[str, Path]:
    """Index images by stem name (filename without extension). If duplicates, prefer shorter path (heuristic)."""
    idx: Dict[str, Path] = {}
    for d in dirs:
        for p in d.iterdir():
            if not is_image(p):
                continue
            stem = p.stem.lower()
            # Prefer first or shorter path
            if stem not in idx or len(str(p)) < len(str(idx[stem])):
                idx[stem] = p
    return idx


def ensure_clean_dir(d: Path):
    d.mkdir(parents=True, exist_ok=True)


def _validate_and_save(src: Path, dst: Path, rgb_jpeg: bool, min_size: int) -> bool:
    """Open image safely, ensure size >= min_size, optionally convert to RGB and save as JPEG."""
    try:
        with Image.open(src) as im:
            im.load()
            # Remove alpha and convert to RGB if requested
            if rgb_jpeg:
                if im.mode != "RGB":
                    im = im.convert("RGB")
                if im.width < min_size or im.height < min_size:
                    return False
                dst = dst.with_suffix(".jpg")
                dst.parent.mkdir(parents=True, exist_ok=True)
                im.save(dst, format="JPEG", quality=95)
            else:
                # Just ensure size
                if im.width < min_size or im.height < min_size:
                    return False
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
        return True
    except Exception as e:
        print(f"[WARN] Invalid/Corrupt image {src}: {e}")
        return False


def copy_pairs(pairs: List[Tuple[Path, Path]], out_input: Path, out_label: Path, limit: int = 0, rgb_jpeg: bool = False, min_size: int = 128) -> int:
    ensure_clean_dir(out_input)
    ensure_clean_dir(out_label)
    if limit and limit > 0:
        pairs = pairs[:limit]
    count = 0
    for src_inp, src_lbl in pairs:
        stem = src_inp.stem
        ext_in = src_inp.suffix.lower() if not rgb_jpeg else ".jpg"
        dst_in = out_input / f"{stem}{ext_in}"
        dst_lb = out_label / f"{stem}{ext_in}"
        ok_in = _validate_and_save(src_inp, dst_in, rgb_jpeg=rgb_jpeg, min_size=min_size)
        ok_lb = _validate_and_save(src_lbl, dst_lb, rgb_jpeg=rgb_jpeg, min_size=min_size)
        if ok_in and ok_lb:
            count += 1
        else:
            # cleanup partial copies
            for p in (dst_in, dst_lb):
                try:
                    if p.exists():
                        p.unlink()
                except Exception:
                    pass
    return count


def prepare_test_images(input_index: Dict[str, Path], out_test: Path, k: int = 50, exclude: Set[str] = None, rgb_jpeg: bool = False, min_size: int = 128):
    ensure_clean_dir(out_test)
    stems = [s for s in input_index.keys() if not exclude or s not in exclude]
    random.shuffle(stems)
    take = stems[:k]
    for s in take:
        src = input_index[s]
        dst = out_test / f"{src.stem}{('.jpg' if rgb_jpeg else src.suffix.lower())}"
        if not _validate_and_save(src, dst, rgb_jpeg=rgb_jpeg, min_size=min_size):
            print(f"[WARN] Skipped test image {src}")
    print(f"Prepared {len(take)} test images at {out_test}")


def main():
    parser = argparse.ArgumentParser(description="Prepare EUVP dataset into repo data/ folders.")
    parser.add_argument("--src", required=True, help="Path to extracted EUVP dataset root")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of training pairs (0 = all)")
    parser.add_argument("--test_k", type=int, default=50, help="Number of test images to create from inputs")
    parser.add_argument("--rgb_jpeg", action="store_true", help="Convert images to RGB and save as JPEG for consistency")
    parser.add_argument("--min_size", type=int, default=128, help="Minimum width/height to keep an image")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent
    data_root = repo_root / "data"
    out_input = data_root / "input"
    out_label = data_root / "label"
    out_test = data_root / "test_imgs"
    readme_log = data_root / "read.txt"

    src = Path(args.src).resolve()
    if not src.exists():
        raise FileNotFoundError(f"Source path not found: {src}")

    # Find candidate dirs
    input_dirs, label_dirs = find_candidate_dirs(src)
    if not input_dirs or not label_dirs:
        print("[ERROR] Could not find candidate input/label directories.\n"
              "Provide --src pointing inside the EUVP Paired dataset root.")
        print("Input-like dirs found:", input_dirs)
        print("Label-like dirs found:", label_dirs)
        return

    print("Input candidate dirs:")
    for d in input_dirs:
        print(" -", d)
    print("Label candidate dirs:")
    for d in label_dirs:
        print(" -", d)

    inp_index = index_images(input_dirs)
    lbl_index = index_images(label_dirs)

    common_stems = sorted(set(inp_index.keys()) & set(lbl_index.keys()))
    missing_in_label = sorted(set(inp_index.keys()) - set(lbl_index.keys()))
    missing_in_input = sorted(set(lbl_index.keys()) - set(inp_index.keys()))

    print(f"Total input imgs: {len(inp_index)} | label imgs: {len(lbl_index)} | paired: {len(common_stems)}")
    if len(common_stems) == 0:
        print("[ERROR] No paired images matched by filename stem. Check dataset structure.")
        return

    # Build pairs
    pairs = [(inp_index[s], lbl_index[s]) for s in common_stems]

    copied = copy_pairs(pairs, out_input, out_label, limit=args.limit, rgb_jpeg=args.rgb_jpeg, min_size=args.min_size)
    print(f"Copied {copied} training pairs to {out_input} and {out_label}")

    # Prepare test images from remaining or from inputs
    exclude = set(common_stems)
    prepare_test_images(inp_index, out_test, k=args.test_k, exclude=exclude, rgb_jpeg=args.rgb_jpeg, min_size=args.min_size)

    # Log summary and missing pairs
    with open(readme_log, "a", encoding="utf-8") as f:
        f.write("\n=== EUVP prepare run ===\n")
        f.write(f"src: {src}\n")
        f.write(f"total_input: {len(inp_index)}, total_label: {len(lbl_index)}, paired: {len(common_stems)}\n")
        if args.limit:
            f.write(f"limited_to: {args.limit}\n")
        if missing_in_label:
            f.write(f"missing_label_count: {len(missing_in_label)} (first 50): {missing_in_label[:50]}\n")
        if missing_in_input:
            f.write(f"missing_input_count: {len(missing_in_input)} (first 50): {missing_in_input[:50]}\n")
        f.write("========================\n")

    print("Done. You can now run training using training.py (CPU).")


if __name__ == "__main__":
    main()
