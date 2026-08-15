import { z } from 'zod';

export const statCardSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  subtext: z.string().optional(),
});

export const updateHeroSchema = z.object({
  body: z.object({
    badgeText: z.string().min(1, 'Badge text is required'),
    badgeIcon: z.string().default('Sparkles'),
    mainHeading: z.string().min(1, 'Main heading is required'),
    gradientHeading: z.string().min(1, 'Gradient heading is required'),
    description: z.string().min(1, 'Description is required'),
    primaryBtnText: z.string().min(1, 'Primary button text is required'),
    primaryBtnLink: z.string().min(1, 'Primary button link is required'),
    secondaryBtnText: z.string().min(1, 'Secondary button text is required'),
    secondaryBtnLink: z.string().min(1, 'Secondary button link is required'),
    statsCards: z.array(statCardSchema).default([]),
    techTags: z.array(z.string()).default([]),
  }),
});

export type UpdateHeroInput = z.infer<typeof updateHeroSchema>['body'];
