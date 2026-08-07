export const IMAGE_MAX_DIMENSION = 800;
export const IMAGE_QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  try {
    const image = await createImageBitmap(file);
    const width = image.width;
    const height = image.height;

    if (width <= IMAGE_MAX_DIMENSION && height <= IMAGE_MAX_DIMENSION && file.size < 200 * 1024) {
      image.close();
      return file;
    }

    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      image.close();
      return file;
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY)
    );

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
  } catch {
    return file;
  }
}
