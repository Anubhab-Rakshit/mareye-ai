import os
import sys

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

import TRAINING_CONFIG as C
print("=== TRAINING CONFIGURATION ===")
print("Device:", C.device)
print("Epochs:", C.num_epochs)
print("Batch size:", C.batch_size)
print("Learning rate:", C.lr)
print("Image size:", C.train_img_size)
print("Snapshot folder:", C.snapshots_folder)
print("===============================")

import training
print("Starting full training...")
training.run_training()
