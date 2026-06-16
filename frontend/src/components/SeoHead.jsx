import { ASSOCIATION_NAME, ASSOCIATION_SHORT, APP_NAME, APP_TAGLINE, PUBLIC_URL, SEO } from '../constants/branding';

export default function SeoHead() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ASSOCIATION_NAME,
    alternateName: ASSOCIATION_SHORT,
    url: PUBLIC_URL,
    description: SEO.description,
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Makerere University',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  );
}

export { APP_NAME, APP_TAGLINE, ASSOCIATION_NAME, ASSOCIATION_SHORT };
