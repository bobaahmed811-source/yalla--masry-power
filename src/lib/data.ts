import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder => 
  PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages[0];

export const user = {
  name: 'John Doe',
  avatar: getImage('user-avatar-1'),
};

// Keeping this file for now for user data, but courses and discussions are removed.
