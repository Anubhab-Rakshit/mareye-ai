import os
import sys

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

import test
print("=== RUNNING INFERENCE ON TEST IMAGES ===")
print("Using trained model to enhance test images...")
print("Output will be saved to:", test.output_images_path)
print("=========================================")

test.run_testing()
