import os
import sys
import importlib

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

import TRAINING_CONFIG as C
print("Device:", C.device)
print("Original epochs:", C.num_epochs)
C.num_epochs = 1
print("Sanity epochs:", C.num_epochs)

import training
importlib.reload(training)
training.run_training()


