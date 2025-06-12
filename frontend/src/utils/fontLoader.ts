// Font loader utility for canvas
export const loadFonts = async (): Promise<void> => {
  // Check if fonts are already loaded
  const existingLink = document.querySelector('link[href*="Playfair+Display"]');
  if (!existingLink) {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Noto+Sans:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Wait for link to load
    await new Promise((resolve) => {
      link.onload = resolve;
      link.onerror = resolve; // Continue even if fonts fail to load
      // Timeout after 2 seconds
      setTimeout(resolve, 2000);
    });
  }

  // Wait for fonts to load with timeout
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('400 24px Playfair Display'),
        document.fonts.load('700 24px Playfair Display'),
        document.fonts.load('400 24px Noto Sans'),
        document.fonts.load('500 24px Noto Sans'),
        document.fonts.load('600 24px Noto Sans')
      ]),
      new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second timeout
    ]);
  } catch {
    // Some fonts may not have loaded properly, continue with fallback fonts
  }
};