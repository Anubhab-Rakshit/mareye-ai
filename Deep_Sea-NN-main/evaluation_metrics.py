import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
import cv2
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import peak_signal_noise_ratio as psnr
import math

def calculate_psnr(img1, img2):
    """
    Calculate Peak Signal-to-Noise Ratio (PSNR) between two images.
    
    Args:
        img1, img2: PIL Images or numpy arrays (0-255 range)
    
    Returns:
        float: PSNR value in dB
    """
    # Convert PIL to numpy if needed
    if isinstance(img1, Image.Image):
        img1 = np.array(img1)
    if isinstance(img2, Image.Image):
        img2 = np.array(img2)
    
    # Ensure both images are the same size
    if img1.shape != img2.shape:
        # Resize img2 to match img1
        img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
    
    # Calculate PSNR
    return psnr(img1, img2, data_range=255)

def calculate_ssim(img1, img2):
    """
    Calculate Structural Similarity Index (SSIM) between two images.
    
    Args:
        img1, img2: PIL Images or numpy arrays (0-255 range)
    
    Returns:
        float: SSIM value (0-1, higher is better)
    """
    # Convert PIL to numpy if needed
    if isinstance(img1, Image.Image):
        img1 = np.array(img1)
    if isinstance(img2, Image.Image):
        img2 = np.array(img2)
    
    # Ensure both images are the same size
    if img1.shape != img2.shape:
        # Resize img2 to match img1
        img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
    
    # Convert to grayscale for SSIM calculation
    if len(img1.shape) == 3:
        img1_gray = cv2.cvtColor(img1, cv2.COLOR_RGB2GRAY)
        img2_gray = cv2.cvtColor(img2, cv2.COLOR_RGB2GRAY)
    else:
        img1_gray = img1
        img2_gray = img2
    
    # Calculate SSIM
    return ssim(img1_gray, img2_gray, data_range=255)

def calculate_uiqu(img):
    """
    Calculate Underwater Image Quality Measure (UIQM) for a single image.
    
    Args:
        img: PIL Image or numpy array (0-255 range)
    
    Returns:
        float: UIQM value (higher is better)
    """
    # Convert PIL to numpy if needed
    if isinstance(img, Image.Image):
        img = np.array(img)
    
    # Convert to float and normalize to [0,1]
    img = img.astype(np.float64) / 255.0
    
    # Calculate UIQM components
    c1 = 0.0282
    c2 = 0.2953
    c3 = 3.5753
    
    # Colorfulness measure
    colorfulness = calculate_colorfulness(img)
    
    # Sharpness measure
    sharpness = calculate_sharpness(img)
    
    # Contrast measure
    contrast = calculate_contrast(img)
    
    # UIQM calculation
    uiqm = c1 * colorfulness + c2 * sharpness + c3 * contrast
    
    return uiqm

def calculate_colorfulness(img):
    """
    Calculate colorfulness measure for UIQM.
    """
    # Convert to LAB color space
    lab = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    # Calculate mean and standard deviation
    mean_a = np.mean(a)
    mean_b = np.mean(b)
    std_a = np.std(a)
    std_b = np.std(b)
    
    # Colorfulness measure
    colorfulness = np.sqrt(std_a**2 + std_b**2) + 0.3 * np.sqrt(mean_a**2 + mean_b**2)
    
    return colorfulness

def calculate_sharpness(img):
    """
    Calculate sharpness measure for UIQM using Laplacian operator.
    """
    # Convert to grayscale
    if len(img.shape) == 3:
        gray = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    else:
        gray = (img * 255).astype(np.uint8)
    
    # Apply Laplacian operator
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    
    # Calculate sharpness as variance of Laplacian
    sharpness = np.var(laplacian)
    
    return sharpness

def calculate_contrast(img):
    """
    Calculate contrast measure for UIQM.
    """
    # Convert to grayscale
    if len(img.shape) == 3:
        gray = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    else:
        gray = (img * 255).astype(np.uint8)
    
    # Calculate contrast as standard deviation
    contrast = np.std(gray)
    
    return contrast

def evaluate_image_pair(original_path, enhanced_path):
    """
    Evaluate a pair of original and enhanced images using PSNR, SSIM, and UIQM.
    
    Args:
        original_path (str): Path to original image
        enhanced_path (str): Path to enhanced image
    
    Returns:
        dict: Dictionary containing PSNR, SSIM, and UIQM values
    """
    try:
        # Load images
        original = Image.open(original_path)
        enhanced = Image.open(enhanced_path)
        
        # Calculate metrics
        psnr_value = calculate_psnr(original, enhanced)
        ssim_value = calculate_ssim(original, enhanced)
        uiqm_original = calculate_uiqu(original)
        uiqm_enhanced = calculate_uiqu(enhanced)
        
        results = {
            'PSNR': psnr_value,
            'SSIM': ssim_value,
            'UIQM_original': uiqm_original,
            'UIQM_enhanced': uiqm_enhanced,
            'UIQM_improvement': uiqm_enhanced - uiqm_original
        }
        
        return results
        
    except Exception as e:
        print(f"Error evaluating images: {str(e)}")
        return None

def print_evaluation_results(results, original_name, enhanced_name):
    """
    Print evaluation results in a formatted way.
    
    Args:
        results (dict): Results from evaluate_image_pair
        original_name (str): Name of original image
        enhanced_name (str): Name of enhanced image
    """
    if results is None:
        print("Failed to evaluate images.")
        return
    
    print("\n" + "="*60)
    print("IMAGE ENHANCEMENT EVALUATION RESULTS")
    print("="*60)
    print(f"Original Image: {original_name}")
    print(f"Enhanced Image: {enhanced_name}")
    print("-"*60)
    print(f"PSNR (Peak Signal-to-Noise Ratio): {results['PSNR']:.4f} dB")
    print(f"SSIM (Structural Similarity Index): {results['SSIM']:.4f}")
    print(f"UIQM Original: {results['UIQM_original']:.4f}")
    print(f"UIQM Enhanced: {results['UIQM_enhanced']:.4f}")
    print(f"UIQM Improvement: {results['UIQM_improvement']:+.4f}")
    print("="*60)
    
    # Interpretation
    print("\nINTERPRETATION:")
    print(f"• PSNR: {'Higher is better' if results['PSNR'] > 20 else 'Low quality'}")
    print(f"• SSIM: {'High similarity' if results['SSIM'] > 0.8 else 'Moderate similarity' if results['SSIM'] > 0.6 else 'Low similarity'}")
    print(f"• UIQM: {'Improved' if results['UIQM_improvement'] > 0 else 'Degraded'}")
    print("="*60)
