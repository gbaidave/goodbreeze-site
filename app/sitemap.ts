import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://goodbreeze.ai'
  const now = new Date()

  return [
    { url: base,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/about`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/tools`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/seo-audit`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/resources`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/case-studies/alana-shaw`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/partners`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,             lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy-policy`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms-of-use`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
