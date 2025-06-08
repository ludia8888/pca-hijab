// Font loader utility for canvas
export const loadFonts = async (): Promise<void> => {
  // Load Google Fonts
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Noto+Sans:wght@400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Wait for fonts to load
  try {
    await document.fonts.load('400 24px Playfair Display');
    await document.fonts.load('700 24px Playfair Display');
    await document.fonts.load('400 24px Noto Sans');
    await document.fonts.load('500 24px Noto Sans');
    await document.fonts.load('600 24px Noto Sans');
  } catch (error) {
    console.warn('Some fonts may not have loaded properly:', error);
  }
};