import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://goodbreeze.ai'
  const now = new Date()

  return [
    // Core
    { url: base,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/about`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/contact`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/partners`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

    // Services
    { url: `${base}/services`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/services/workflow-automation`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/ai-agents`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/competitive-intelligence`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/content-management`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/process-optimization`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/custom-solutions`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // Tools (public pages only — individual tools require auth)
    { url: `${base}/tools`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/seo-audit`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // Case studies
    { url: `${base}/case-studies`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/case-studies/marcus-chen`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/case-studies/alana-shaw`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/case-studies/julia-lawson`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/case-studies/rafael-moreno`,lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // Resources
    { url: `${base}/resources`,                                                        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/resources/written-guides`,                                         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/written-guides/business-owners-guide-to-ai-automation`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/written-guides/signs-your-business-is-ready-for-automation`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/written-guides/scale-without-hiring-playbook`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/templates-tools`,                                         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/templates-tools/roi-calculator`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/templates-tools/process-mapping-template`,                lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/templates-tools/automation-readiness-checklist`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources/video-guides`,                                            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

    // Legal
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms-of-use`,   lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
