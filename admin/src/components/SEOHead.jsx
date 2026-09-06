import { Helmet } from 'react-helmet-async';

export default function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  favicon,
  twitterCard = 'summary',
  canonical,
  type = 'website',
}) {
  const siteName = 'Quản trị Shop Luan Huỳnh';
  const defaultDescription = 'Trang quản trị Shop Luan Huỳnh - Quản lý tài khoản game, đơn hàng và người dùng.';
  const defaultKeywords = 'quan tri, shop luan huynh, quan ly tai khoan game';
  const defaultOgImage = '/og-image.jpg';

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Favicon - Update dynamically */}
      {favicon && <link rel="icon" type="image/x-icon" href={favicon} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaOgImage} />
      <meta property="og:site_name" content={siteName} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaOgImage} />
    </Helmet>
  );
}
