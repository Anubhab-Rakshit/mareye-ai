import torch
import os

# TRAINING CONFIG
batch_size = 1
lr = 0.0002
num_epochs = 5
step_size = 400
# Device selection: prefer CUDA, then DirectML (AMD/Intel on Windows), else CPU
_device_obj = None
if torch.cuda.is_available():
  _device_obj = torch.device('cuda')
else:
  try:
    import torch_directml
    _device_obj = torch_directml.device()
  except Exception:
    _device_obj = torch.device('cpu')

device = _device_obj


# Training Image Directories(input / label) & training image size
raw_image_path = './data/input/'
clear_image_path = './data/label/'
train_img_size = 256 #KEEP TRAINING IMG SIZE to 256x256! Customized UNET architecture is tailored to this + faster training while outputting good results

# Saving Training Checkpoints
snapshots_folder = './snapshots/unetSSIM/'
snapshot_freq = 5
model_name = 'unetSSIM'

# Testing Image Directories(input / output) & test image size
test_image_path = './data/test_imgs/'
output_images_path = './data/test_output/unetssim/'
test_img_size = 512


# Enter checkpoint filepath if i'm resuming training (DO NOT ENTER MODEL.CKPT FILES!)
ckpt_path = './snapshots/unetDROPn/model_epoch_49_unetDROPn.ckpt'

# Enter model path for TESTING (ENTER MODEL.CKPT FILES!)
test_model_path = './snapshots/unetSSIM/model_epoch_0_unetSSIM.ckpt'
