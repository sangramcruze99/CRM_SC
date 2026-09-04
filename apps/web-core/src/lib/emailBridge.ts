/**
 * Email Bridge Utility
 * Seamless bidirectional bridge between Visual Email Builder (/platform/templates/email)
 * and Email Marketing & Automations Studio (/email-marketing).
 */

export interface BridgeTransferPayload {
  source: 'visual-builder' | 'email-marketing' | 'automations';
  targetTab?: 'builder' | 'automations' | 'bulk-blast' | 'templates';
  workflowNodeId?: string;
  workflowNodeTitle?: string;
  templateId?: string;
  templateName?: string;
  subject: string;
  preheader: string;
  blocks?: any[];
  sections?: any[];
  timestamp: number;
}

export interface SharedBridgeTemplate {
  id: string;
  name: string;
  category: 'Sales' | 'Marketing' | 'Customer Success' | 'Onboarding' | 'Automations';
  badge: string;
  subject: string;
  preheader: string;
  sections: any[];
  blocks: any[];
  updatedAt: string;
}

export const BRIDGE_STORAGE_KEYS = {
  ACTIVE_TRANSFER: 'crm_email_bridge_active_transfer',
  SHARED_TEMPLATES: 'crm_email_bridge_shared_templates',
};

/**
 * Convert Visual Email Builder blocks to Email Marketing modular sections
 */
export function convertBlocksToSections(blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((b, idx) => {
    const newId = `sec_bridge_${Date.now()}_${idx}`;

    switch (b.type) {
      case 'HEADER':
      case 'TEXT':
        return {
          id: newId,
          type: 'TEXT_ARTICLE',
          title: b.title || '',
          body: b.body || '',
        };

      case 'IMAGE_BANNER':
        return {
          id: newId,
          type: 'IMAGE_BANNER',
          imageUrl: b.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          imageCaption: b.imageCaption || '',
        };

      case 'VIDEO_PREVIEW':
        return {
          id: newId,
          type: 'VIDEO_EMBED',
          videoTitle: b.title || 'Product Video Walkthrough',
          videoThumbnail: b.videoThumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          videoUrl: b.videoUrl || 'https://youtube.com/watch?v=demo',
          badge: b.badge || '▶ Watch Demo',
        };

      case 'BUTTON_CTA':
      case 'MEETING_SCHEDULER':
        return {
          id: newId,
          type: 'BUTTON_CTA',
          buttonText: b.buttonText || (b.type === 'MEETING_SCHEDULER' ? '📅 Book Intro Call' : 'Learn More'),
          buttonUrl: b.buttonUrl || 'https://businessos.io',
        };

      case 'PRODUCT_CARD':
        return {
          id: newId,
          type: 'PRODUCT_CARD',
          title: b.title || 'Product Spotlight',
          body: b.body || '',
          productPrice: b.productPrice || '$99/mo',
          imageUrl: b.imageUrl || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
          buttonText: b.buttonText || 'Claim Deal',
          buttonUrl: b.buttonUrl || 'https://businessos.io/deals',
        };

      case 'TESTIMONIAL':
      case 'METRIC_STAT':
        return {
          id: newId,
          type: 'CALLOUT_QUOTE',
          body: b.body || (b.metricNumber ? `${b.metricNumber} - ${b.metricLabel}` : 'Executive customer testimonial.'),
          quoteAuthor: b.quoteAuthor || b.metricNumber || 'Customer Success Review',
          quoteRole: b.quoteRole || b.metricChange || 'Verified Enterprise Metric',
        };

      case 'SALES_SIGNATURE':
      case 'SOCIAL_FOOTER':
        return {
          id: newId,
          type: 'AUTHOR_SIGNATURE',
          authorName: b.repName || 'Enterprise Growth Team',
          authorRole: b.repTitle || 'Business OS Solutions',
          authorAvatar: b.repAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          body: b.body || 'Best regards,\nReach out anytime.',
        };

      case 'DIVIDER':
      default:
        return {
          id: newId,
          type: 'DIVIDER',
        };
    }
  });
}

/**
 * Convert Email Marketing modular sections to Visual Email Builder blocks
 */
export function convertSectionsToBlocks(sections: any[]): any[] {
  if (!Array.isArray(sections)) return [];

  return sections.map((s, idx) => {
    const newId = `blk_bridge_${Date.now()}_${idx}`;

    switch (s.type) {
      case 'TEXT_ARTICLE':
        return {
          id: newId,
          type: 'TEXT',
          title: s.title || '',
          body: s.body || '',
          align: 'left',
        };

      case 'IMAGE_BANNER':
        return {
          id: newId,
          type: 'IMAGE_BANNER',
          imageUrl: s.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          imageCaption: s.imageCaption || '',
        };

      case 'VIDEO_EMBED':
        return {
          id: newId,
          type: 'VIDEO_PREVIEW',
          title: s.videoTitle || 'Featured Video',
          videoThumbnail: s.videoThumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          videoUrl: s.videoUrl || 'https://youtube.com/watch?v=demo',
          badge: s.badge || '▶ Watch Demo',
        };

      case 'BUTTON_CTA':
        return {
          id: newId,
          type: 'BUTTON_CTA',
          buttonText: s.buttonText || 'Take Action',
          buttonUrl: s.buttonUrl || 'https://businessos.io',
        };

      case 'PRODUCT_CARD':
        return {
          id: newId,
          type: 'PRODUCT_CARD',
          title: s.title || 'Product Spotlight',
          body: s.body || '',
          productPrice: s.productPrice || '$99/mo',
          imageUrl: s.imageUrl || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
          buttonText: s.buttonText || 'Learn More',
          buttonUrl: s.buttonUrl || 'https://businessos.io',
        };

      case 'CALLOUT_QUOTE':
        return {
          id: newId,
          type: 'TESTIMONIAL',
          body: s.body || 'Client testimonial quote.',
          quoteAuthor: s.quoteAuthor || 'Enterprise Client',
          quoteRole: s.quoteRole || 'Executive Leader',
          rating: 5,
        };

      case 'DYNAMIC_SMART_BLOCK':
        return {
          id: newId,
          type: 'TEXT',
          title: s.title || 'Smart Dynamic Content',
          body: s.body || s.dynamicHealthcareBody || s.dynamicSaaSBody || '',
          align: 'left',
        };

      case 'AUTHOR_SIGNATURE':
        return {
          id: newId,
          type: 'SALES_SIGNATURE',
          repName: s.authorName || 'Business OS Team',
          repTitle: s.authorRole || 'Client Success Director',
          repAvatar: s.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          body: s.body || 'Best regards,\nReach out anytime.',
        };

      case 'DIVIDER':
      default:
        return {
          id: newId,
          type: 'DIVIDER',
        };
    }
  });
}

/**
 * Save active transfer payload to localStorage for cross-page retrieval
 */
export function setBridgeTransfer(payload: BridgeTransferPayload): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRIDGE_STORAGE_KEYS.ACTIVE_TRANSFER, JSON.stringify(payload));
  } catch (err) {
    console.warn('Could not save bridge transfer:', err);
  }
}

/**
 * Read and optionally clear the active transfer payload
 */
export function getBridgeTransfer(clearAfterRead = false): BridgeTransferPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BRIDGE_STORAGE_KEYS.ACTIVE_TRANSFER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BridgeTransferPayload;
    if (clearAfterRead) {
      localStorage.removeItem(BRIDGE_STORAGE_KEYS.ACTIVE_TRANSFER);
    }
    return parsed;
  } catch (err) {
    console.warn('Could not read bridge transfer:', err);
    return null;
  }
}

/**
 * Clear the bridge transfer payload
 */
export function clearBridgeTransfer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BRIDGE_STORAGE_KEYS.ACTIVE_TRANSFER);
}

/**
 * Shared Template Registry helpers
 */
export function getSharedBridgeTemplates(): SharedBridgeTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BRIDGE_STORAGE_KEYS.SHARED_TEMPLATES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSharedBridgeTemplate(template: SharedBridgeTemplate): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSharedBridgeTemplates();
    const updated = [template, ...existing.filter((t) => t.id !== template.id)];
    localStorage.setItem(BRIDGE_STORAGE_KEYS.SHARED_TEMPLATES, JSON.stringify(updated.slice(0, 30)));
  } catch (err) {
    console.warn('Could not save shared bridge template:', err);
  }
}
