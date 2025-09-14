import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

export class ImageProcessor {
  private static readonly MAX_WIDTH = 1024;
  private static readonly MAX_HEIGHT = 1024;
  private static readonly QUALITY = 85;
  
  static async processUpload(filePath: string): Promise<ProcessedImage> {
    try {
      // Read the uploaded file
      const fileBuffer = await fs.readFile(filePath);
      
      // Get image metadata
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();
      
      // Optimize image for AI processing
      const optimizedBuffer = await image
        .resize(this.MAX_WIDTH, this.MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.QUALITY })
        .toBuffer();
      
      // Convert to base64
      const base64 = optimizedBuffer.toString('base64');
      
      return {
        base64,
        mimeType: 'image/jpeg',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: optimizedBuffer.length
      };
      
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process uploaded image');
    }
  }

  static async validateImage(filePath: string): Promise<boolean> {
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      // Validate image format
      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        return false;
      }
      
      // Validate dimensions
      if (!metadata.width || !metadata.height) {
        return false;
      }
      
      // Validate size (max 10MB)
      const stats = await fs.stat(filePath);
      if (stats.size > 10 * 1024 * 1024) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Image validation error:', error);
      return false;
    }
  }

  static async createThumbnail(filePath: string, outputPath: string): Promise<string> {
    try {
      await sharp(filePath)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw new Error('Failed to create thumbnail');
    }
  }

  static async extractImageColors(filePath: string): Promise<string[]> {
    try {
      const image = sharp(filePath);
      const { dominant } = await image.stats();
      
      // Convert dominant colors to hex
      const colors = [
        `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`
      ];
      
      return colors;
    } catch (error) {
      console.error('Color extraction error:', error);
      return ['#ffffff'];
    }
  }

  // Cleanup uploaded files after processing
  static async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File cleanup error:', error);
      // Don't throw - cleanup is non-critical
    }
  }
}

export default ImageProcessor;