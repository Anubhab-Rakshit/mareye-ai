import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import cv2
from pathlib import Path
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Import our evaluation metrics
from evaluation_metrics import calculate_psnr, calculate_ssim, calculate_uiqu

class EnhancementAnalytics:
    def __init__(self, output_dir="analytics_output"):
        """
        Initialize the enhancement analytics system.
        
        Args:
            output_dir (str): Directory to save all analytics outputs
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Set up matplotlib style
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
        # Initialize data storage
        self.image_data = []
        self.video_data = []
        self.batch_results = {}
        
    def analyze_single_image(self, original_path, enhanced_path, image_name=None):
        """
        Perform comprehensive analysis of a single image pair.
        
        Args:
            original_path (str): Path to original image
            enhanced_path (str): Path to enhanced image
            image_name (str): Name for the image (optional)
        
        Returns:
            dict: Comprehensive analysis results
        """
        if not os.path.exists(original_path) or not os.path.exists(enhanced_path):
            raise FileNotFoundError("One or both image files not found")
        
        if image_name is None:
            image_name = os.path.splitext(os.path.basename(original_path))[0]
        
        print(f"Analyzing image: {image_name}")
        
        # Load images
        original_img = Image.open(original_path)
        enhanced_img = Image.open(enhanced_path)
        
        # Basic metrics
        psnr_val = calculate_psnr(original_img, enhanced_img)
        ssim_val = calculate_ssim(original_img, enhanced_img)
        uiqm_orig = calculate_uiqu(original_img)
        uiqm_enh = calculate_uiqu(enhanced_img)
        uiqm_improvement = uiqm_enh - uiqm_orig
        
        # Advanced image analysis
        analysis = self._advanced_image_analysis(original_img, enhanced_img)
        
        # Compile comprehensive results
        results = {
            'image_name': image_name,
            'timestamp': datetime.now().isoformat(),
            'file_paths': {
                'original': original_path,
                'enhanced': enhanced_path
            },
            'basic_metrics': {
                'psnr': psnr_val,
                'ssim': ssim_val,
                'uiqm_original': uiqm_orig,
                'uiqm_enhanced': uiqm_enh,
                'uiqm_improvement': uiqm_improvement
            },
            'advanced_analysis': analysis,
            'quality_assessment': self._assess_quality(psnr_val, ssim_val, uiqm_improvement)
        }
        
        # Store for batch analysis
        self.image_data.append(results)
        
        return results
    
    def _advanced_image_analysis(self, original_img, enhanced_img):
        """
        Perform advanced image analysis including color, texture, and edge analysis.
        
        Args:
            original_img (PIL.Image): Original image
            enhanced_img (PIL.Image): Enhanced image
        
        Returns:
            dict: Advanced analysis results
        """
        # Convert to numpy arrays
        if isinstance(original_img, str):
            original_img = Image.open(original_img)
        if isinstance(enhanced_img, str):
            enhanced_img = Image.open(enhanced_img)
            
        orig_array = np.array(original_img)
        enh_array = np.array(enhanced_img)
        
        # Color analysis
        color_analysis = self._analyze_colors(orig_array, enh_array)
        
        # Texture analysis
        texture_analysis = self._analyze_texture(orig_array, enh_array)
        
        # Edge analysis
        edge_analysis = self._analyze_edges(orig_array, enh_array)
        
        # Histogram analysis
        histogram_analysis = self._analyze_histograms(orig_array, enh_array)
        
        # Brightness and contrast analysis
        brightness_contrast = self._analyze_brightness_contrast(orig_array, enh_array)
        
        return {
            'color_analysis': color_analysis,
            'texture_analysis': texture_analysis,
            'edge_analysis': edge_analysis,
            'histogram_analysis': histogram_analysis,
            'brightness_contrast': brightness_contrast
        }
    
    def _analyze_colors(self, orig_array, enh_array):
        """Analyze color properties of images."""
        # Ensure arrays are in the correct format
        if len(orig_array.shape) == 3 and orig_array.shape[2] == 3:
            # Convert to different color spaces
            orig_lab = cv2.cvtColor(orig_array, cv2.COLOR_RGB2LAB)
            enh_lab = cv2.cvtColor(enh_array, cv2.COLOR_RGB2LAB)
        else:
            # Handle grayscale or other formats
            orig_lab = orig_array
            enh_lab = enh_array
        
        # Color statistics
        orig_mean = np.mean(orig_array, axis=(0, 1))
        enh_mean = np.mean(enh_array, axis=(0, 1))
        orig_std = np.std(orig_array, axis=(0, 1))
        enh_std = np.std(enh_array, axis=(0, 1))
        
        # Color diversity (number of unique colors)
        try:
            if len(orig_array.shape) == 3 and orig_array.shape[2] == 3:
                orig_unique = len(np.unique(orig_array.reshape(-1, 3), axis=0))
                enh_unique = len(np.unique(enh_array.reshape(-1, 3), axis=0))
            else:
                orig_unique = len(np.unique(orig_array))
                enh_unique = len(np.unique(enh_array))
        except:
            orig_unique = 0
            enh_unique = 0
        
        # Colorfulness measure
        try:
            orig_colorfulness = self._calculate_colorfulness(orig_array)
            enh_colorfulness = self._calculate_colorfulness(enh_array)
        except:
            orig_colorfulness = 0
            enh_colorfulness = 0
        
        return {
            'mean_rgb_original': orig_mean.tolist(),
            'mean_rgb_enhanced': enh_mean.tolist(),
            'std_rgb_original': orig_std.tolist(),
            'std_rgb_enhanced': enh_std.tolist(),
            'unique_colors_original': orig_unique,
            'unique_colors_enhanced': enh_unique,
            'colorfulness_original': orig_colorfulness,
            'colorfulness_enhanced': enh_colorfulness,
            'colorfulness_improvement': enh_colorfulness - orig_colorfulness
        }
    
    def _analyze_texture(self, orig_array, enh_array):
        """Analyze texture properties using Local Binary Patterns."""
        # Convert to grayscale
        orig_gray = cv2.cvtColor(orig_array, cv2.COLOR_RGB2GRAY)
        enh_gray = cv2.cvtColor(enh_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate texture using variance of Laplacian
        orig_texture = cv2.Laplacian(orig_gray, cv2.CV_64F).var()
        enh_texture = cv2.Laplacian(enh_gray, cv2.CV_64F).var()
        
        # Calculate gradient magnitude
        orig_grad_x = cv2.Sobel(orig_gray, cv2.CV_64F, 1, 0, ksize=3)
        orig_grad_y = cv2.Sobel(orig_gray, cv2.CV_64F, 0, 1, ksize=3)
        orig_grad_mag = np.sqrt(orig_grad_x**2 + orig_grad_y**2)
        
        enh_grad_x = cv2.Sobel(enh_gray, cv2.CV_64F, 1, 0, ksize=3)
        enh_grad_y = cv2.Sobel(enh_gray, cv2.CV_64F, 0, 1, ksize=3)
        enh_grad_mag = np.sqrt(enh_grad_x**2 + enh_grad_y**2)
        
        return {
            'texture_variance_original': orig_texture,
            'texture_variance_enhanced': enh_texture,
            'texture_improvement': enh_texture - orig_texture,
            'gradient_magnitude_original': np.mean(orig_grad_mag),
            'gradient_magnitude_enhanced': np.mean(enh_grad_mag),
            'gradient_improvement': np.mean(enh_grad_mag) - np.mean(orig_grad_mag)
        }
    
    def _analyze_edges(self, orig_array, enh_array):
        """Analyze edge properties using Canny edge detection."""
        # Convert to grayscale
        orig_gray = cv2.cvtColor(orig_array, cv2.COLOR_RGB2GRAY)
        enh_gray = cv2.cvtColor(enh_array, cv2.COLOR_RGB2GRAY)
        
        # Canny edge detection
        orig_edges = cv2.Canny(orig_gray, 50, 150)
        enh_edges = cv2.Canny(enh_gray, 50, 150)
        
        # Edge statistics
        orig_edge_count = np.sum(orig_edges > 0)
        enh_edge_count = np.sum(enh_edges > 0)
        
        # Edge density
        total_pixels = orig_gray.shape[0] * orig_gray.shape[1]
        orig_edge_density = orig_edge_count / total_pixels
        enh_edge_density = enh_edge_count / total_pixels
        
        return {
            'edge_count_original': orig_edge_count,
            'edge_count_enhanced': enh_edge_count,
            'edge_density_original': orig_edge_density,
            'edge_density_enhanced': enh_edge_density,
            'edge_improvement': enh_edge_density - orig_edge_density
        }
    
    def _analyze_histograms(self, orig_array, enh_array):
        """Analyze histogram properties."""
        # Calculate histograms for each channel
        orig_hist_r = cv2.calcHist([orig_array], [0], None, [256], [0, 256])
        orig_hist_g = cv2.calcHist([orig_array], [1], None, [256], [0, 256])
        orig_hist_b = cv2.calcHist([orig_array], [2], None, [256], [0, 256])
        
        enh_hist_r = cv2.calcHist([enh_array], [0], None, [256], [0, 256])
        enh_hist_g = cv2.calcHist([enh_array], [1], None, [256], [0, 256])
        enh_hist_b = cv2.calcHist([enh_array], [2], None, [256], [0, 256])
        
        # Calculate histogram statistics
        def hist_stats(hist):
            return {
                'mean': np.mean(hist),
                'std': np.std(hist),
                'entropy': -np.sum(hist * np.log2(hist + 1e-10))
            }
        
        return {
            'original_red': hist_stats(orig_hist_r),
            'original_green': hist_stats(orig_hist_g),
            'original_blue': hist_stats(orig_hist_b),
            'enhanced_red': hist_stats(enh_hist_r),
            'enhanced_green': hist_stats(enh_hist_g),
            'enhanced_blue': hist_stats(enh_hist_b)
        }
    
    def _analyze_brightness_contrast(self, orig_array, enh_array):
        """Analyze brightness and contrast properties."""
        # Convert to grayscale
        orig_gray = cv2.cvtColor(orig_array, cv2.COLOR_RGB2GRAY)
        enh_gray = cv2.cvtColor(enh_array, cv2.COLOR_RGB2GRAY)
        
        # Brightness (mean intensity)
        orig_brightness = np.mean(orig_gray)
        enh_brightness = np.mean(enh_gray)
        
        # Contrast (standard deviation)
        orig_contrast = np.std(orig_gray)
        enh_contrast = np.std(enh_gray)
        
        # Dynamic range
        orig_dynamic_range = np.max(orig_gray) - np.min(orig_gray)
        enh_dynamic_range = np.max(enh_gray) - np.min(enh_gray)
        
        return {
            'brightness_original': orig_brightness,
            'brightness_enhanced': enh_brightness,
            'brightness_change': enh_brightness - orig_brightness,
            'contrast_original': orig_contrast,
            'contrast_enhanced': enh_contrast,
            'contrast_change': enh_contrast - orig_contrast,
            'dynamic_range_original': orig_dynamic_range,
            'dynamic_range_enhanced': enh_dynamic_range,
            'dynamic_range_change': enh_dynamic_range - orig_dynamic_range
        }
    
    def _calculate_colorfulness(self, image_array):
        """Calculate colorfulness measure."""
        # Convert to LAB color space
        lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Calculate colorfulness
        mean_a = np.mean(a)
        mean_b = np.mean(b)
        std_a = np.std(a)
        std_b = np.std(b)
        
        colorfulness = np.sqrt(std_a**2 + std_b**2) + 0.3 * np.sqrt(mean_a**2 + mean_b**2)
        return colorfulness
    
    def _assess_quality(self, psnr, ssim, uiqm_improvement):
        """Assess overall quality improvement."""
        # PSNR assessment
        if psnr > 30:
            psnr_quality = "Excellent"
        elif psnr > 20:
            psnr_quality = "Good"
        else:
            psnr_quality = "Poor"
        
        # SSIM assessment
        if ssim > 0.8:
            ssim_quality = "High similarity"
        elif ssim > 0.6:
            ssim_quality = "Moderate similarity"
        else:
            ssim_quality = "Low similarity"
        
        # UIQM assessment
        if uiqm_improvement > 50:
            uiqm_quality = "Significantly improved"
        elif uiqm_improvement > 0:
            uiqm_quality = "Improved"
        else:
            uiqm_quality = "Degraded"
        
        # Overall assessment
        if uiqm_improvement > 0 and ssim > 0.7:
            overall = "Enhancement successful"
        elif uiqm_improvement > 0:
            overall = "Partial enhancement"
        else:
            overall = "Enhancement failed"
        
        return {
            'psnr_quality': psnr_quality,
            'ssim_quality': ssim_quality,
            'uiqm_quality': uiqm_quality,
            'overall_assessment': overall
        }
    
    def create_visualizations(self, results, save_plots=True):
        """
        Create comprehensive visualizations for analysis results.
        
        Args:
            results (dict): Analysis results from analyze_single_image
            save_plots (bool): Whether to save plots to files
        
        Returns:
            list: List of created plot file paths
        """
        image_name = results['image_name']
        plot_files = []
        
        # Create output directory for this image
        img_output_dir = os.path.join(self.output_dir, f"{image_name}_analysis")
        os.makedirs(img_output_dir, exist_ok=True)
        
        # 1. Basic Metrics Comparison
        plot_files.append(self._plot_basic_metrics(results, img_output_dir))
        
        # 2. Color Analysis
        plot_files.append(self._plot_color_analysis(results, img_output_dir))
        
        # 3. Texture and Edge Analysis
        plot_files.append(self._plot_texture_edge_analysis(results, img_output_dir))
        
        # 4. Histogram Comparison
        plot_files.append(self._plot_histogram_comparison(results, img_output_dir))
        
        # 5. Brightness and Contrast Analysis
        plot_files.append(self._plot_brightness_contrast(results, img_output_dir))
        
        # 6. Quality Assessment Dashboard
        plot_files.append(self._plot_quality_dashboard(results, img_output_dir))
        
        return plot_files
    
    def _plot_basic_metrics(self, results, output_dir):
        """Create basic metrics comparison plot."""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Basic Enhancement Metrics - {results["image_name"]}', fontsize=16, fontweight='bold')
        
        # PSNR
        ax1.bar(['Original', 'Enhanced'], [0, results['basic_metrics']['psnr']], 
                color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax1.set_title('PSNR (Peak Signal-to-Noise Ratio)', fontweight='bold')
        ax1.set_ylabel('PSNR (dB)')
        ax1.text(1, results['basic_metrics']['psnr'] + 0.5, 
                f"{results['basic_metrics']['psnr']:.2f} dB", 
                ha='center', fontweight='bold')
        
        # SSIM
        ax2.bar(['Original', 'Enhanced'], [0, results['basic_metrics']['ssim']], 
                color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax2.set_title('SSIM (Structural Similarity Index)', fontweight='bold')
        ax2.set_ylabel('SSIM')
        ax2.set_ylim(0, 1)
        ax2.text(1, results['basic_metrics']['ssim'] + 0.02, 
                f"{results['basic_metrics']['ssim']:.4f}", 
                ha='center', fontweight='bold')
        
        # UIQM Comparison
        uiqm_data = [results['basic_metrics']['uiqm_original'], 
                    results['basic_metrics']['uiqm_enhanced']]
        bars = ax3.bar(['Original', 'Enhanced'], uiqm_data, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax3.set_title('UIQM (Underwater Image Quality Measure)', fontweight='bold')
        ax3.set_ylabel('UIQM')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{uiqm_data[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # UIQM Improvement
        improvement = results['basic_metrics']['uiqm_improvement']
        color = 'green' if improvement > 0 else 'red'
        ax4.bar(['UIQM Improvement'], [improvement], color=color, alpha=0.7)
        ax4.set_title('UIQM Improvement', fontweight='bold')
        ax4.set_ylabel('Improvement')
        ax4.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax4.text(0, improvement + (abs(improvement)*0.1 if improvement != 0 else 1), 
                f'{improvement:+.2f}', ha='center', fontweight='bold')
        
        plt.tight_layout()
        plot_file = os.path.join(output_dir, 'basic_metrics.png')
        plt.savefig(plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return plot_file
    
    def _plot_color_analysis(self, results, output_dir):
        """Create color analysis visualization."""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Color Analysis - {results["image_name"]}', fontsize=16, fontweight='bold')
        
        color_data = results['advanced_analysis']['color_analysis']
        
        # RGB Mean Comparison
        channels = ['Red', 'Green', 'Blue']
        orig_means = color_data['mean_rgb_original']
        enh_means = color_data['mean_rgb_enhanced']
        
        x = np.arange(len(channels))
        width = 0.35
        
        ax1.bar(x - width/2, orig_means, width, label='Original', color='lightcoral', alpha=0.7)
        ax1.bar(x + width/2, enh_means, width, label='Enhanced', color='lightgreen', alpha=0.7)
        ax1.set_title('RGB Channel Means', fontweight='bold')
        ax1.set_ylabel('Intensity')
        ax1.set_xticks(x)
        ax1.set_xticklabels(channels)
        ax1.legend()
        
        # RGB Standard Deviation
        orig_stds = color_data['std_rgb_original']
        enh_stds = color_data['std_rgb_enhanced']
        
        ax2.bar(x - width/2, orig_stds, width, label='Original', color='lightcoral', alpha=0.7)
        ax2.bar(x + width/2, enh_stds, width, label='Enhanced', color='lightgreen', alpha=0.7)
        ax2.set_title('RGB Channel Standard Deviations', fontweight='bold')
        ax2.set_ylabel('Standard Deviation')
        ax2.set_xticks(x)
        ax2.set_xticklabels(channels)
        ax2.legend()
        
        # Colorfulness
        colorfulness_data = [color_data['colorfulness_original'], 
                           color_data['colorfulness_enhanced']]
        bars = ax3.bar(['Original', 'Enhanced'], colorfulness_data, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax3.set_title('Colorfulness Measure', fontweight='bold')
        ax3.set_ylabel('Colorfulness')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{colorfulness_data[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # Unique Colors
        unique_data = [color_data['unique_colors_original'], 
                      color_data['unique_colors_enhanced']]
        bars = ax4.bar(['Original', 'Enhanced'], unique_data, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax4.set_title('Number of Unique Colors', fontweight='bold')
        ax4.set_ylabel('Count')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{unique_data[i]:,}', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        plot_file = os.path.join(output_dir, 'color_analysis.png')
        plt.savefig(plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return plot_file
    
    def _plot_texture_edge_analysis(self, results, output_dir):
        """Create texture and edge analysis visualization."""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Texture & Edge Analysis - {results["image_name"]}', fontsize=16, fontweight='bold')
        
        texture_data = results['advanced_analysis']['texture_analysis']
        edge_data = results['advanced_analysis']['edge_analysis']
        
        # Texture Variance
        texture_values = [texture_data['texture_variance_original'], 
                         texture_data['texture_variance_enhanced']]
        bars = ax1.bar(['Original', 'Enhanced'], texture_values, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax1.set_title('Texture Variance (Laplacian)', fontweight='bold')
        ax1.set_ylabel('Variance')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{texture_values[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # Gradient Magnitude
        grad_values = [texture_data['gradient_magnitude_original'], 
                      texture_data['gradient_magnitude_enhanced']]
        bars = ax2.bar(['Original', 'Enhanced'], grad_values, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax2.set_title('Gradient Magnitude', fontweight='bold')
        ax2.set_ylabel('Magnitude')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{grad_values[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # Edge Count
        edge_counts = [edge_data['edge_count_original'], 
                      edge_data['edge_count_enhanced']]
        bars = ax3.bar(['Original', 'Enhanced'], edge_counts, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax3.set_title('Edge Count (Canny)', fontweight='bold')
        ax3.set_ylabel('Count')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{edge_counts[i]:,}', ha='center', va='bottom', fontweight='bold')
        
        # Edge Density
        edge_density = [edge_data['edge_density_original'], 
                       edge_data['edge_density_enhanced']]
        bars = ax4.bar(['Original', 'Enhanced'], edge_density, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax4.set_title('Edge Density', fontweight='bold')
        ax4.set_ylabel('Density')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{edge_density[i]:.4f}', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        plot_file = os.path.join(output_dir, 'texture_edge_analysis.png')
        plt.savefig(plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return plot_file
    
    def _plot_histogram_comparison(self, results, output_dir):
        """Create histogram comparison visualization."""
        fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 6))
        fig.suptitle(f'Histogram Analysis - {results["image_name"]}', fontsize=16, fontweight='bold')
        
        hist_data = results['advanced_analysis']['histogram_analysis']
        channels = ['Red', 'Green', 'Blue']
        colors = ['red', 'green', 'blue']
        
        for i, (channel, color) in enumerate(zip(channels, colors)):
            ax = [ax1, ax2, ax3][i]
            
            orig_mean = hist_data[f'original_{color.lower()}']['mean']
            orig_std = hist_data[f'original_{color.lower()}']['std']
            orig_entropy = hist_data[f'original_{color.lower()}']['entropy']
            
            enh_mean = hist_data[f'enhanced_{color.lower()}']['mean']
            enh_std = hist_data[f'enhanced_{color.lower()}']['std']
            enh_entropy = hist_data[f'enhanced_{color.lower()}']['entropy']
            
            # Create comparison bars
            metrics = ['Mean', 'Std Dev', 'Entropy']
            orig_values = [orig_mean, orig_std, orig_entropy]
            enh_values = [enh_mean, enh_std, enh_entropy]
            
            x = np.arange(len(metrics))
            width = 0.35
            
            ax.bar(x - width/2, orig_values, width, label='Original', 
                  color='lightcoral', alpha=0.7)
            ax.bar(x + width/2, enh_values, width, label='Enhanced', 
                  color='lightgreen', alpha=0.7)
            
            ax.set_title(f'{channel} Channel', fontweight='bold')
            ax.set_ylabel('Value')
            ax.set_xticks(x)
            ax.set_xticklabels(metrics)
            ax.legend()
            
            # Add value labels
            for j, (orig_val, enh_val) in enumerate(zip(orig_values, enh_values)):
                ax.text(j - width/2, orig_val + max(orig_values)*0.01, 
                       f'{orig_val:.2f}', ha='center', va='bottom', fontsize=8)
                ax.text(j + width/2, enh_val + max(enh_values)*0.01, 
                       f'{enh_val:.2f}', ha='center', va='bottom', fontsize=8)
        
        plt.tight_layout()
        plot_file = os.path.join(output_dir, 'histogram_analysis.png')
        plt.savefig(plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return plot_file
    
    def _plot_brightness_contrast(self, results, output_dir):
        """Create brightness and contrast analysis visualization."""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Brightness & Contrast Analysis - {results["image_name"]}', fontsize=16, fontweight='bold')
        
        bc_data = results['advanced_analysis']['brightness_contrast']
        
        # Brightness
        brightness_values = [bc_data['brightness_original'], bc_data['brightness_enhanced']]
        bars = ax1.bar(['Original', 'Enhanced'], brightness_values, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax1.set_title('Brightness (Mean Intensity)', fontweight='bold')
        ax1.set_ylabel('Intensity')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{brightness_values[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # Contrast
        contrast_values = [bc_data['contrast_original'], bc_data['contrast_enhanced']]
        bars = ax2.bar(['Original', 'Enhanced'], contrast_values, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax2.set_title('Contrast (Standard Deviation)', fontweight='bold')
        ax2.set_ylabel('Standard Deviation')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{contrast_values[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # Dynamic Range
        dr_values = [bc_data['dynamic_range_original'], bc_data['dynamic_range_enhanced']]
        bars = ax3.bar(['Original', 'Enhanced'], dr_values, 
                      color=['lightcoral', 'lightgreen'], alpha=0.7)
        ax3.set_title('Dynamic Range', fontweight='bold')
        ax3.set_ylabel('Range')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{dr_values[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # Changes Summary
        changes = [bc_data['brightness_change'], bc_data['contrast_change'], bc_data['dynamic_range_change']]
        change_labels = ['Brightness', 'Contrast', 'Dynamic Range']
        colors = ['green' if c > 0 else 'red' for c in changes]
        
        bars = ax4.bar(change_labels, changes, color=colors, alpha=0.7)
        ax4.set_title('Changes Summary', fontweight='bold')
        ax4.set_ylabel('Change')
        ax4.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2., 
                    height + (abs(height)*0.1 if height != 0 else 1), 
                    f'{changes[i]:+.2f}', ha='center', fontweight='bold')
        
        plt.tight_layout()
        plot_file = os.path.join(output_dir, 'brightness_contrast_analysis.png')
        plt.savefig(plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return plot_file
    
    def _plot_quality_dashboard(self, results, output_dir):
        """Create comprehensive quality assessment dashboard."""
        fig = plt.figure(figsize=(20, 12))
        gs = fig.add_gridspec(3, 4, hspace=0.3, wspace=0.3)
        
        # Main title
        fig.suptitle(f'Enhancement Quality Dashboard - {results["image_name"]}', 
                    fontsize=20, fontweight='bold')
        
        # 1. Overall Assessment (top-left, spans 2 columns)
        ax1 = fig.add_subplot(gs[0, :2])
        quality = results['quality_assessment']
        
        # Create a summary table
        assessment_data = [
            ['PSNR Quality', quality['psnr_quality']],
            ['SSIM Quality', quality['ssim_quality']],
            ['UIQM Quality', quality['uiqm_quality']],
            ['Overall Assessment', quality['overall_assessment']]
        ]
        
        table = ax1.table(cellText=assessment_data,
                         colLabels=['Metric', 'Assessment'],
                         cellLoc='center',
                         loc='center',
                         bbox=[0, 0, 1, 1])
        table.auto_set_font_size(False)
        table.set_fontsize(12)
        table.scale(1, 2)
        
        # Color code the cells
        for i in range(1, len(assessment_data) + 1):
            if 'Excellent' in assessment_data[i-1][1] or 'High' in assessment_data[i-1][1] or 'Significantly' in assessment_data[i-1][1] or 'successful' in assessment_data[i-1][1]:
                table[(i, 1)].set_facecolor('#90EE90')  # Light green
            elif 'Good' in assessment_data[i-1][1] or 'Moderate' in assessment_data[i-1][1] or 'Improved' in assessment_data[i-1][1] or 'Partial' in assessment_data[i-1][1]:
                table[(i, 1)].set_facecolor('#FFE4B5')  # Light orange
            else:
                table[(i, 1)].set_facecolor('#FFB6C1')  # Light red
        
        ax1.set_title('Quality Assessment Summary', fontweight='bold', fontsize=14)
        ax1.axis('off')
        
        # 2. Metrics Radar Chart (top-right, spans 2 columns)
        ax2 = fig.add_subplot(gs[0, 2:], projection='polar')
        
        # Normalize metrics for radar chart
        metrics = ['PSNR', 'SSIM', 'UIQM_Improvement']
        values = [
            min(results['basic_metrics']['psnr'] / 30, 1),  # Normalize PSNR
            results['basic_metrics']['ssim'],  # SSIM is already 0-1
            max(min(results['basic_metrics']['uiqm_improvement'] / 100, 1), 0)  # Normalize UIQM
        ]
        
        angles = np.linspace(0, 2 * np.pi, len(metrics), endpoint=False).tolist()
        values += values[:1]  # Complete the circle
        angles += angles[:1]
        
        ax2.plot(angles, values, 'o-', linewidth=2, color='blue', alpha=0.7)
        ax2.fill(angles, values, alpha=0.25, color='blue')
        ax2.set_xticks(angles[:-1])
        ax2.set_xticklabels(metrics)
        ax2.set_ylim(0, 1)
        ax2.set_title('Metrics Overview', fontweight='bold', fontsize=14)
        ax2.grid(True)
        
        # 3. Detailed Metrics (bottom row)
        ax3 = fig.add_subplot(gs[1, 0])
        basic_metrics = results['basic_metrics']
        metric_names = ['PSNR', 'SSIM', 'UIQM_Orig', 'UIQM_Enh']
        metric_values = [basic_metrics['psnr'], basic_metrics['ssim'], 
                        basic_metrics['uiqm_original'], basic_metrics['uiqm_enhanced']]
        
        bars = ax3.bar(metric_names, metric_values, color=['skyblue', 'lightgreen', 'lightcoral', 'lightgreen'], alpha=0.7)
        ax3.set_title('Basic Metrics', fontweight='bold')
        ax3.tick_params(axis='x', rotation=45)
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{metric_values[i]:.2f}', ha='center', va='bottom', fontsize=8)
        
        # 4. Color Analysis Summary
        ax4 = fig.add_subplot(gs[1, 1])
        color_data = results['advanced_analysis']['color_analysis']
        color_metrics = ['Colorfulness', 'Unique Colors']
        color_values = [color_data['colorfulness_enhanced'], color_data['unique_colors_enhanced']]
        
        bars = ax4.bar(color_metrics, color_values, color=['orange', 'purple'], alpha=0.7)
        ax4.set_title('Color Enhancement', fontweight='bold')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{color_values[i]:.0f}', ha='center', va='bottom', fontsize=8)
        
        # 5. Texture Analysis Summary
        ax5 = fig.add_subplot(gs[1, 2])
        texture_data = results['advanced_analysis']['texture_analysis']
        texture_metrics = ['Texture Var', 'Gradient Mag']
        texture_values = [texture_data['texture_variance_enhanced'], texture_data['gradient_magnitude_enhanced']]
        
        bars = ax5.bar(texture_metrics, texture_values, color=['brown', 'pink'], alpha=0.7)
        ax5.set_title('Texture Enhancement', fontweight='bold')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax5.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{texture_values[i]:.1f}', ha='center', va='bottom', fontsize=8)
        
        # 6. Edge Analysis Summary
        ax6 = fig.add_subplot(gs[1, 3])
        edge_data = results['advanced_analysis']['edge_analysis']
        edge_metrics = ['Edge Count', 'Edge Density']
        edge_values = [edge_data['edge_count_enhanced'], edge_data['edge_density_enhanced']]
        
        bars = ax6.bar(edge_metrics, edge_values, color=['gray', 'cyan'], alpha=0.7)
        ax6.set_title('Edge Enhancement', fontweight='bold')
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax6.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{edge_values[i]:.0f}', ha='center', va='bottom', fontsize=8)
        
        # 7. Improvement Summary (bottom row, spans all columns)
        ax7 = fig.add_subplot(gs[2, :])
        
        improvements = [
            results['basic_metrics']['uiqm_improvement'],
            results['advanced_analysis']['color_analysis']['colorfulness_improvement'],
            results['advanced_analysis']['texture_analysis']['texture_improvement'],
            results['advanced_analysis']['edge_analysis']['edge_improvement'],
            results['advanced_analysis']['brightness_contrast']['brightness_change'],
            results['advanced_analysis']['brightness_contrast']['contrast_change']
        ]
        
        improvement_labels = ['UIQM', 'Colorfulness', 'Texture', 'Edge', 'Brightness', 'Contrast']
        colors = ['green' if imp > 0 else 'red' for imp in improvements]
        
        bars = ax7.bar(improvement_labels, improvements, color=colors, alpha=0.7)
        ax7.set_title('Improvement Summary (All Metrics)', fontweight='bold', fontsize=14)
        ax7.set_ylabel('Improvement')
        ax7.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax7.tick_params(axis='x', rotation=45)
        
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax7.text(bar.get_x() + bar.get_width()/2., 
                    height + (abs(height)*0.1 if height != 0 else 1), 
                    f'{improvements[i]:+.2f}', ha='center', fontweight='bold')
        
        plt.tight_layout()
        plot_file = os.path.join(output_dir, 'quality_dashboard.png')
        plt.savefig(plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return plot_file
    
    def generate_detailed_report(self, results, output_dir=None):
        """
        Generate a comprehensive detailed report in JSON and text format.
        
        Args:
            results (dict): Analysis results
            output_dir (str): Output directory (optional)
        
        Returns:
            tuple: (json_file, text_file) paths
        """
        if output_dir is None:
            output_dir = os.path.join(self.output_dir, f"{results['image_name']}_analysis")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Save detailed JSON report
        json_file = os.path.join(output_dir, f"{results['image_name']}_detailed_report.json")
        with open(json_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        # Generate comprehensive text report
        text_file = os.path.join(output_dir, f"{results['image_name']}_detailed_report.txt")
        with open(text_file, 'w') as f:
            f.write("="*80 + "\n")
            f.write(f"COMPREHENSIVE ENHANCEMENT ANALYSIS REPORT\n")
            f.write("="*80 + "\n")
            f.write(f"Image Name: {results['image_name']}\n")
            f.write(f"Analysis Date: {results['timestamp']}\n")
            f.write(f"Original File: {results['file_paths']['original']}\n")
            f.write(f"Enhanced File: {results['file_paths']['enhanced']}\n")
            f.write("="*80 + "\n\n")
            
            # Basic Metrics Section
            f.write("BASIC ENHANCEMENT METRICS\n")
            f.write("-"*40 + "\n")
            basic = results['basic_metrics']
            f.write(f"PSNR (Peak Signal-to-Noise Ratio): {basic['psnr']:.4f} dB\n")
            f.write(f"SSIM (Structural Similarity Index): {basic['ssim']:.4f}\n")
            f.write(f"UIQM Original: {basic['uiqm_original']:.4f}\n")
            f.write(f"UIQM Enhanced: {basic['uiqm_enhanced']:.4f}\n")
            f.write(f"UIQM Improvement: {basic['uiqm_improvement']:+.4f}\n\n")
            
            # Quality Assessment Section
            f.write("QUALITY ASSESSMENT\n")
            f.write("-"*40 + "\n")
            quality = results['quality_assessment']
            f.write(f"PSNR Quality: {quality['psnr_quality']}\n")
            f.write(f"SSIM Quality: {quality['ssim_quality']}\n")
            f.write(f"UIQM Quality: {quality['uiqm_quality']}\n")
            f.write(f"Overall Assessment: {quality['overall_assessment']}\n\n")
            
            # Advanced Analysis Section
            f.write("ADVANCED ANALYSIS\n")
            f.write("-"*40 + "\n")
            advanced = results['advanced_analysis']
            
            # Color Analysis
            f.write("Color Analysis:\n")
            color = advanced['color_analysis']
            f.write(f"  RGB Mean Original: {color['mean_rgb_original']}\n")
            f.write(f"  RGB Mean Enhanced: {color['mean_rgb_enhanced']}\n")
            f.write(f"  RGB Std Original: {color['std_rgb_original']}\n")
            f.write(f"  RGB Std Enhanced: {color['std_rgb_enhanced']}\n")
            f.write(f"  Unique Colors Original: {color['unique_colors_original']:,}\n")
            f.write(f"  Unique Colors Enhanced: {color['unique_colors_enhanced']:,}\n")
            f.write(f"  Colorfulness Original: {color['colorfulness_original']:.4f}\n")
            f.write(f"  Colorfulness Enhanced: {color['colorfulness_enhanced']:.4f}\n")
            f.write(f"  Colorfulness Improvement: {color['colorfulness_improvement']:+.4f}\n\n")
            
            # Texture Analysis
            f.write("Texture Analysis:\n")
            texture = advanced['texture_analysis']
            f.write(f"  Texture Variance Original: {texture['texture_variance_original']:.4f}\n")
            f.write(f"  Texture Variance Enhanced: {texture['texture_variance_enhanced']:.4f}\n")
            f.write(f"  Texture Improvement: {texture['texture_improvement']:+.4f}\n")
            f.write(f"  Gradient Magnitude Original: {texture['gradient_magnitude_original']:.4f}\n")
            f.write(f"  Gradient Magnitude Enhanced: {texture['gradient_magnitude_enhanced']:.4f}\n")
            f.write(f"  Gradient Improvement: {texture['gradient_improvement']:+.4f}\n\n")
            
            # Edge Analysis
            f.write("Edge Analysis:\n")
            edge = advanced['edge_analysis']
            f.write(f"  Edge Count Original: {edge['edge_count_original']:,}\n")
            f.write(f"  Edge Count Enhanced: {edge['edge_count_enhanced']:,}\n")
            f.write(f"  Edge Density Original: {edge['edge_density_original']:.6f}\n")
            f.write(f"  Edge Density Enhanced: {edge['edge_density_enhanced']:.6f}\n")
            f.write(f"  Edge Improvement: {edge['edge_improvement']:+.6f}\n\n")
            
            # Brightness and Contrast
            f.write("Brightness & Contrast Analysis:\n")
            bc = advanced['brightness_contrast']
            f.write(f"  Brightness Original: {bc['brightness_original']:.4f}\n")
            f.write(f"  Brightness Enhanced: {bc['brightness_enhanced']:.4f}\n")
            f.write(f"  Brightness Change: {bc['brightness_change']:+.4f}\n")
            f.write(f"  Contrast Original: {bc['contrast_original']:.4f}\n")
            f.write(f"  Contrast Enhanced: {bc['contrast_enhanced']:.4f}\n")
            f.write(f"  Contrast Change: {bc['contrast_change']:+.4f}\n")
            f.write(f"  Dynamic Range Original: {bc['dynamic_range_original']:.4f}\n")
            f.write(f"  Dynamic Range Enhanced: {bc['dynamic_range_enhanced']:.4f}\n")
            f.write(f"  Dynamic Range Change: {bc['dynamic_range_change']:+.4f}\n\n")
            
            # Histogram Analysis
            f.write("Histogram Analysis:\n")
            hist = advanced['histogram_analysis']
            for channel in ['red', 'green', 'blue']:
                f.write(f"  {channel.upper()} Channel:\n")
                f.write(f"    Original - Mean: {hist[f'original_{channel}']['mean']:.4f}, "
                       f"Std: {hist[f'original_{channel}']['std']:.4f}, "
                       f"Entropy: {hist[f'original_{channel}']['entropy']:.4f}\n")
                f.write(f"    Enhanced - Mean: {hist[f'enhanced_{channel}']['mean']:.4f}, "
                       f"Std: {hist[f'enhanced_{channel}']['std']:.4f}, "
                       f"Entropy: {hist[f'enhanced_{channel}']['entropy']:.4f}\n")
            
            f.write("\n" + "="*80 + "\n")
            f.write("END OF REPORT\n")
            f.write("="*80 + "\n")
        
        return json_file, text_file
    
    def batch_analyze_images(self, image_pairs, output_dir=None):
        """
        Perform batch analysis on multiple image pairs.
        
        Args:
            image_pairs (list): List of (original_path, enhanced_path, name) tuples
            output_dir (str): Output directory (optional)
        
        Returns:
            dict: Batch analysis results
        """
        if output_dir is None:
            output_dir = os.path.join(self.output_dir, "batch_analysis")
        
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"Starting batch analysis of {len(image_pairs)} image pairs...")
        
        batch_results = {
            'timestamp': datetime.now().isoformat(),
            'total_images': len(image_pairs),
            'individual_results': [],
            'summary_statistics': {},
            'comparative_analysis': {}
        }
        
        # Analyze each image pair
        for i, (orig_path, enh_path, name) in enumerate(image_pairs):
            print(f"Processing {i+1}/{len(image_pairs)}: {name}")
            try:
                results = self.analyze_single_image(orig_path, enh_path, name)
                batch_results['individual_results'].append(results)
                
                # Create visualizations
                self.create_visualizations(results, save_plots=True)
                
                # Generate detailed report
                self.generate_detailed_report(results)
                
            except Exception as e:
                print(f"Error processing {name}: {str(e)}")
                continue
        
        # Calculate summary statistics
        if batch_results['individual_results']:
            batch_results['summary_statistics'] = self._calculate_batch_statistics(batch_results['individual_results'])
            batch_results['comparative_analysis'] = self._perform_comparative_analysis(batch_results['individual_results'])
            
            # Create batch visualizations
            self._create_batch_visualizations(batch_results, output_dir)
            
            # Generate batch report
            self._generate_batch_report(batch_results, output_dir)
        
        # Save batch results
        batch_file = os.path.join(output_dir, "batch_analysis_results.json")
        with open(batch_file, 'w') as f:
            json.dump(batch_results, f, indent=2, default=str)
        
        print(f"Batch analysis completed. Results saved to {output_dir}")
        return batch_results
    
    def _calculate_batch_statistics(self, individual_results):
        """Calculate summary statistics for batch analysis."""
        if not individual_results:
            return {}
        
        # Extract metrics
        psnr_values = [r['basic_metrics']['psnr'] for r in individual_results]
        ssim_values = [r['basic_metrics']['ssim'] for r in individual_results]
        uiqm_improvements = [r['basic_metrics']['uiqm_improvement'] for r in individual_results]
        
        return {
            'psnr': {
                'mean': np.mean(psnr_values),
                'std': np.std(psnr_values),
                'min': np.min(psnr_values),
                'max': np.max(psnr_values),
                'median': np.median(psnr_values)
            },
            'ssim': {
                'mean': np.mean(ssim_values),
                'std': np.std(ssim_values),
                'min': np.min(ssim_values),
                'max': np.max(ssim_values),
                'median': np.median(ssim_values)
            },
            'uiqm_improvement': {
                'mean': np.mean(uiqm_improvements),
                'std': np.std(uiqm_improvements),
                'min': np.min(uiqm_improvements),
                'max': np.max(uiqm_improvements),
                'median': np.median(uiqm_improvements)
            }
        }
    
    def _perform_comparative_analysis(self, individual_results):
        """Perform comparative analysis across images."""
        if not individual_results:
            return {}
        
        # Find best and worst performing images
        psnr_values = [(r['image_name'], r['basic_metrics']['psnr']) for r in individual_results]
        ssim_values = [(r['image_name'], r['basic_metrics']['ssim']) for r in individual_results]
        uiqm_values = [(r['image_name'], r['basic_metrics']['uiqm_improvement']) for r in individual_results]
        
        return {
            'best_psnr': max(psnr_values, key=lambda x: x[1]),
            'worst_psnr': min(psnr_values, key=lambda x: x[1]),
            'best_ssim': max(ssim_values, key=lambda x: x[1]),
            'worst_ssim': min(ssim_values, key=lambda x: x[1]),
            'best_uiqm': max(uiqm_values, key=lambda x: x[1]),
            'worst_uiqm': min(uiqm_values, key=lambda x: x[1])
        }
    
    def _create_batch_visualizations(self, batch_results, output_dir):
        """Create visualizations for batch analysis."""
        if not batch_results['individual_results']:
            return
        
        # Create batch comparison plots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(20, 15))
        fig.suptitle('Batch Analysis - Enhancement Performance Comparison', fontsize=20, fontweight='bold')
        
        individual_results = batch_results['individual_results']
        image_names = [r['image_name'] for r in individual_results]
        
        # PSNR comparison
        psnr_values = [r['basic_metrics']['psnr'] for r in individual_results]
        bars1 = ax1.bar(range(len(image_names)), psnr_values, color='skyblue', alpha=0.7)
        ax1.set_title('PSNR Comparison Across Images', fontweight='bold')
        ax1.set_ylabel('PSNR (dB)')
        ax1.set_xticks(range(len(image_names)))
        ax1.set_xticklabels(image_names, rotation=45, ha='right')
        for i, bar in enumerate(bars1):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{psnr_values[i]:.1f}', ha='center', va='bottom', fontsize=8)
        
        # SSIM comparison
        ssim_values = [r['basic_metrics']['ssim'] for r in individual_results]
        bars2 = ax2.bar(range(len(image_names)), ssim_values, color='lightgreen', alpha=0.7)
        ax2.set_title('SSIM Comparison Across Images', fontweight='bold')
        ax2.set_ylabel('SSIM')
        ax2.set_ylim(0, 1)
        ax2.set_xticks(range(len(image_names)))
        ax2.set_xticklabels(image_names, rotation=45, ha='right')
        for i, bar in enumerate(bars2):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                    f'{ssim_values[i]:.3f}', ha='center', va='bottom', fontsize=8)
        
        # UIQM improvement comparison
        uiqm_values = [r['basic_metrics']['uiqm_improvement'] for r in individual_results]
        colors = ['green' if v > 0 else 'red' for v in uiqm_values]
        bars3 = ax3.bar(range(len(image_names)), uiqm_values, color=colors, alpha=0.7)
        ax3.set_title('UIQM Improvement Comparison', fontweight='bold')
        ax3.set_ylabel('UIQM Improvement')
        ax3.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax3.set_xticks(range(len(image_names)))
        ax3.set_xticklabels(image_names, rotation=45, ha='right')
        for i, bar in enumerate(bars3):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., 
                    height + (abs(height)*0.1 if height != 0 else 1), 
                    f'{uiqm_values[i]:+.1f}', ha='center', fontweight='bold')
        
        # Summary statistics
        stats = batch_results['summary_statistics']
        metrics = ['PSNR', 'SSIM', 'UIQM_Improvement']
        means = [stats['psnr']['mean'], stats['ssim']['mean'], stats['uiqm_improvement']['mean']]
        stds = [stats['psnr']['std'], stats['ssim']['std'], stats['uiqm_improvement']['std']]
        
        x = np.arange(len(metrics))
        bars4 = ax4.bar(x, means, yerr=stds, capsize=5, color=['skyblue', 'lightgreen', 'orange'], alpha=0.7)
        ax4.set_title('Summary Statistics (Mean ± Std)', fontweight='bold')
        ax4.set_ylabel('Value')
        ax4.set_xticks(x)
        ax4.set_xticklabels(metrics)
        for i, bar in enumerate(bars4):
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2., height + stds[i] + height*0.01,
                    f'{means[i]:.2f}', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        batch_plot_file = os.path.join(output_dir, 'batch_comparison.png')
        plt.savefig(batch_plot_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return batch_plot_file
    
    def _generate_batch_report(self, batch_results, output_dir):
        """Generate comprehensive batch analysis report."""
        report_file = os.path.join(output_dir, "batch_analysis_report.txt")
        
        with open(report_file, 'w') as f:
            f.write("="*80 + "\n")
            f.write("BATCH ENHANCEMENT ANALYSIS REPORT\n")
            f.write("="*80 + "\n")
            f.write(f"Analysis Date: {batch_results['timestamp']}\n")
            f.write(f"Total Images Analyzed: {batch_results['total_images']}\n")
            f.write("="*80 + "\n\n")
            
            # Summary Statistics
            f.write("SUMMARY STATISTICS\n")
            f.write("-"*40 + "\n")
            stats = batch_results['summary_statistics']
            
            f.write("PSNR Statistics:\n")
            f.write(f"  Mean: {stats['psnr']['mean']:.4f} dB\n")
            f.write(f"  Std Dev: {stats['psnr']['std']:.4f} dB\n")
            f.write(f"  Min: {stats['psnr']['min']:.4f} dB\n")
            f.write(f"  Max: {stats['psnr']['max']:.4f} dB\n")
            f.write(f"  Median: {stats['psnr']['median']:.4f} dB\n\n")
            
            f.write("SSIM Statistics:\n")
            f.write(f"  Mean: {stats['ssim']['mean']:.4f}\n")
            f.write(f"  Std Dev: {stats['ssim']['std']:.4f}\n")
            f.write(f"  Min: {stats['ssim']['min']:.4f}\n")
            f.write(f"  Max: {stats['ssim']['max']:.4f}\n")
            f.write(f"  Median: {stats['ssim']['median']:.4f}\n\n")
            
            f.write("UIQM Improvement Statistics:\n")
            f.write(f"  Mean: {stats['uiqm_improvement']['mean']:+.4f}\n")
            f.write(f"  Std Dev: {stats['uiqm_improvement']['std']:.4f}\n")
            f.write(f"  Min: {stats['uiqm_improvement']['min']:+.4f}\n")
            f.write(f"  Max: {stats['uiqm_improvement']['max']:+.4f}\n")
            f.write(f"  Median: {stats['uiqm_improvement']['median']:+.4f}\n\n")
            
            # Comparative Analysis
            f.write("COMPARATIVE ANALYSIS\n")
            f.write("-"*40 + "\n")
            comp = batch_results['comparative_analysis']
            
            f.write(f"Best PSNR: {comp['best_psnr'][0]} ({comp['best_psnr'][1]:.4f} dB)\n")
            f.write(f"Worst PSNR: {comp['worst_psnr'][0]} ({comp['worst_psnr'][1]:.4f} dB)\n")
            f.write(f"Best SSIM: {comp['best_ssim'][0]} ({comp['best_ssim'][1]:.4f})\n")
            f.write(f"Worst SSIM: {comp['worst_ssim'][0]} ({comp['worst_ssim'][1]:.4f})\n")
            f.write(f"Best UIQM Improvement: {comp['best_uiqm'][0]} ({comp['best_uiqm'][1]:+.4f})\n")
            f.write(f"Worst UIQM Improvement: {comp['worst_uiqm'][0]} ({comp['worst_uiqm'][1]:+.4f})\n\n")
            
            # Individual Results Summary
            f.write("INDIVIDUAL RESULTS SUMMARY\n")
            f.write("-"*40 + "\n")
            for result in batch_results['individual_results']:
                f.write(f"{result['image_name']}:\n")
                f.write(f"  PSNR: {result['basic_metrics']['psnr']:.4f} dB\n")
                f.write(f"  SSIM: {result['basic_metrics']['ssim']:.4f}\n")
                f.write(f"  UIQM Improvement: {result['basic_metrics']['uiqm_improvement']:+.4f}\n")
                f.write(f"  Overall Assessment: {result['quality_assessment']['overall_assessment']}\n\n")
            
            f.write("="*80 + "\n")
            f.write("END OF BATCH REPORT\n")
            f.write("="*80 + "\n")
        
        return report_file
