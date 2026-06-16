/** Official MUYSA branding — use across the app for consistent identity */

export const ASSOCIATION_NAME = 'Makerere University Yumbe Students Association';
export const ASSOCIATION_SHORT = 'MUYSA';
export const APP_NAME = 'MUYSA Connect';
export const APP_TAGLINE = 'The official digital platform for Yumbe students and alumni at Makerere University';
export const UNIVERSITY = 'Makerere University';
export const REGION = 'Yumbe';
export const COPYRIGHT = `© ${new Date().getFullYear()} ${ASSOCIATION_NAME}`;

export const SEO = {
  title: `${ASSOCIATION_NAME} | ${APP_NAME}`,
  description: `${APP_NAME} — official platform of the ${ASSOCIATION_NAME}. Connect with students and alumni, view executives, news, events, and opportunities.`,
  keywords: 'MUYSA, Makerere University, Yumbe Students Association, Yumbe students, Makerere alumni, Uganda',
};

export const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'https://muysa-6962c.web.app';
