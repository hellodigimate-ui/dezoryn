import { prisma } from '../config/prisma.config';

const db = prisma as any;

/**
 * Default FAQ data.
 * This is ONLY used for initial database seeding.
 * Production data should always come from PostgreSQL.
 */
const DEFAULT_FAQS = [
  {
    question: 'What is Dezoryn Autonomous CRM & ERP?',
    answer:
      'Dezoryn is an enterprise-grade AI operating system unifying CRM, lead scoring, workflow automation, and predictive analytics into a single high-performance platform.',
    category: 'Platform',
    order: 0,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'How fast can we integrate Dezoryn with our existing workflow?',
    answer:
      'Deployment typically takes under 48 hours. Dezoryn features 100+ native connectors for Salesforce, HubSpot, SAP, WhatsApp API, and custom REST/GraphQL endpoints.',
    category: 'Integration',
    order: 1,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Is enterprise customer data secure and compliant?',
    answer:
      'Yes. Dezoryn complies with SOC 2 Type II, GDPR, CCPA, and HIPAA requirements. All data is encrypted at rest (AES-256) and in transit (TLS 1.3) with full RBAC audit logs.',
    category: 'Security',
    order: 2,
    status: 'active',
    isEnabled: true,
  },
  {
    question:
      'Can we customize our subscription tier or request custom SLA?',
    answer:
      'Absolutely. We offer flexible tiering from Starter to Enterprise Custom with dedicated account managers, 99.99% uptime SLAs, and custom AI model fine-tuning.',
    category: 'Pricing',
    order: 3,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Does Dezoryn provide 24/7 technical support?',
    answer:
      'Yes, all Pro and Enterprise tier plans include 24/7 dedicated support via phone, email, and live Slack/Teams channels with guaranteed response times under 15 minutes.',
    category: 'General',
    order: 4,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Can I manage accordion ordering for FAQs dynamically?',
    answer:
      'Yes! In the Dezoryn Admin Panel, you can drag and drop or reorder FAQs, adjust display order values, and toggle statuses in real time.',
    category: 'Platform',
    order: 5,
    status: 'active',
    isEnabled: true,
  },
];

export class FaqService {
  /**
   * ---------------------------------------------------------
   * INITIAL DATABASE SEED
   * ---------------------------------------------------------
   *
   * Runs only when FAQ table is empty.
   *
   * IMPORTANT:
   * PostgreSQL is the permanent source of truth.
   * No JSON/file storage is used.
   */
  private static async ensureInitialSeed(): Promise<void> {
    try {
      const totalCount = await db.faq.count();

      if (totalCount > 0) {
        return;
      }

      await db.faq.createMany({
        data: DEFAULT_FAQS,
      });

      console.log(
        `[FAQ] Initial seed completed: ${DEFAULT_FAQS.length} records created.`
      );
    } catch (error) {
      console.error('[FAQ] Initial seed failed:', error);
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * GET ALL FAQS
   * ---------------------------------------------------------
   */
  static async getAll(filter?: {
    category?: string;
    status?: string;
    isEnabled?: boolean;
    search?: string;
  }) {
    try {
      await this.ensureInitialSeed();

      const where: any = {};

      /**
       * Category filter
       */
      if (filter?.category && filter.category !== 'All') {
        where.category = {
          equals: filter.category,
          mode: 'insensitive',
        };
      }

      /**
       * Status filter
       */
      if (filter?.status && filter.status !== 'All') {
        where.status = filter.status;
      }

      /**
       * Enabled filter
       */
      if (filter?.isEnabled !== undefined) {
        where.isEnabled = filter.isEnabled;
      }

      /**
       * Search
       */
      if (filter?.search?.trim()) {
        const search = filter.search.trim();

        where.OR = [
          {
            question: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            answer: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            category: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      const faqs = await db.faq.findMany({
        where,
        orderBy: [
          {
            order: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],
      });

      return faqs;
    } catch (error) {
      console.error('[FAQ] Error fetching FAQs:', error);

      /**
       * Do NOT return [] here.
       *
       * Returning [] makes the frontend think that
       * there are simply no FAQs, while the real issue
       * could be PostgreSQL connection/database failure.
       */
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * GET FAQ BY ID
   * ---------------------------------------------------------
   */
  static async getById(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('FAQ ID is required');
      }

      const faq = await db.faq.findUnique({
        where: {
          id: id.trim(),
        },
      });

      if (!faq) {
        throw new Error('FAQ not found');
      }

      return faq;
    } catch (error) {
      console.error(`[FAQ] Error fetching FAQ ${id}:`, error);
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * CREATE FAQ
   * ---------------------------------------------------------
   */
  static async create(data: {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    status?: string;
    isEnabled?: boolean;
  }) {
    try {
      if (!data.question?.trim()) {
        throw new Error('FAQ question is required');
      }

      if (!data.answer?.trim()) {
        throw new Error('FAQ answer is required');
      }

      const question = data.question.trim();
      const answer = data.answer.trim();
      const category = data.category?.trim() || 'General';

      const status =
        data.status === 'inactive'
          ? 'inactive'
          : data.status || 'active';

      /**
       * If order is not provided,
       * put FAQ at the end.
       */
      let order = data.order;

      if (order === undefined || order === null) {
        const lastFaq = await db.faq.findFirst({
          orderBy: {
            order: 'desc',
          },
          select: {
            order: true,
          },
        });

        order = lastFaq ? Number(lastFaq.order) + 1 : 0;
      }

      const isEnabled =
        data.isEnabled !== undefined
          ? data.isEnabled
          : status === 'active';

      const faq = await db.faq.create({
        data: {
          question,
          answer,
          category,
          order,
          status,
          isEnabled,
        },
      });

      console.log(`[FAQ] Created: ${faq.id}`);

      return faq;
    } catch (error) {
      console.error('[FAQ] Error creating FAQ:', error);
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * UPDATE FAQ
   * ---------------------------------------------------------
   */
  static async update(
    id: string,
    data: Partial<{
      question: string;
      answer: string;
      category: string;
      order: number;
      status: string;
      isEnabled: boolean;
    }>
  ) {
    try {
      if (!id?.trim()) {
        throw new Error('FAQ ID is required');
      }

      const existing = await db.faq.findUnique({
        where: {
          id: id.trim(),
        },
      });

      if (!existing) {
        throw new Error('FAQ not found');
      }

      const updateData: any = {};

      /**
       * Question
       */
      if (data.question !== undefined) {
        if (!data.question.trim()) {
          throw new Error('FAQ question cannot be empty');
        }

        updateData.question = data.question.trim();
      }

      /**
       * Answer
       */
      if (data.answer !== undefined) {
        if (!data.answer.trim()) {
          throw new Error('FAQ answer cannot be empty');
        }

        updateData.answer = data.answer.trim();
      }

      /**
       * Category
       */
      if (data.category !== undefined) {
        updateData.category =
          data.category.trim() || 'General';
      }

      /**
       * Order
       */
      if (data.order !== undefined) {
        updateData.order = Number(data.order);
      }

      /**
       * Status
       */
      if (data.status !== undefined) {
        const newStatus =
          data.status === 'inactive'
            ? 'inactive'
            : 'active';

        updateData.status = newStatus;

        /**
         * If isEnabled was not explicitly supplied,
         * automatically sync it with status.
         */
        if (data.isEnabled === undefined) {
          updateData.isEnabled = newStatus === 'active';
        }
      }

      /**
       * Explicit isEnabled
       */
      if (data.isEnabled !== undefined) {
        updateData.isEnabled = Boolean(data.isEnabled);
      }

      const updatedFaq = await db.faq.update({
        where: {
          id: id.trim(),
        },
        data: updateData,
      });

      console.log(`[FAQ] Updated: ${updatedFaq.id}`);

      return updatedFaq;
    } catch (error) {
      console.error(`[FAQ] Error updating FAQ ${id}:`, error);
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * DELETE FAQ
   * ---------------------------------------------------------
   */
  static async delete(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('FAQ ID is required');
      }

      const existing = await db.faq.findUnique({
        where: {
          id: id.trim(),
        },
      });

      if (!existing) {
        throw new Error('FAQ not found');
      }

      const deletedFaq = await db.faq.delete({
        where: {
          id: id.trim(),
        },
      });

      console.log(`[FAQ] Deleted: ${deletedFaq.id}`);

      return deletedFaq;
    } catch (error) {
      console.error(`[FAQ] Error deleting FAQ ${id}:`, error);
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * TOGGLE STATUS
   * ---------------------------------------------------------
   */
  static async toggleStatus(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('FAQ ID is required');
      }

      const item = await db.faq.findUnique({
        where: {
          id: id.trim(),
        },
      });

      if (!item) {
        throw new Error('FAQ not found');
      }

      const newStatus =
        item.status === 'active'
          ? 'inactive'
          : 'active';

      const updatedFaq = await db.faq.update({
        where: {
          id: id.trim(),
        },
        data: {
          status: newStatus,
          isEnabled: newStatus === 'active',
        },
      });

      console.log(
        `[FAQ] Status changed: ${updatedFaq.id} → ${newStatus}`
      );

      return updatedFaq;
    } catch (error) {
      console.error(
        `[FAQ] Error toggling status for ${id}:`,
        error
      );

      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * DUPLICATE FAQ
   * ---------------------------------------------------------
   */
  static async duplicate(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('FAQ ID is required');
      }

      const item = await db.faq.findUnique({
        where: {
          id: id.trim(),
        },
      });

      if (!item) {
        throw new Error('FAQ not found');
      }

      /**
       * Get last order instead of using count().
       * This prevents ordering problems after deletions.
       */
      const lastFaq = await db.faq.findFirst({
        orderBy: {
          order: 'desc',
        },
        select: {
          order: true,
        },
      });

      const nextOrder = lastFaq
        ? Number(lastFaq.order) + 1
        : 0;

      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...rest
      } = item;

      const duplicatedFaq = await db.faq.create({
        data: {
          ...rest,
          question: `${rest.question} (Copy)`,
          order: nextOrder,
        },
      });

      console.log(
        `[FAQ] Duplicated: ${item.id} → ${duplicatedFaq.id}`
      );

      return duplicatedFaq;
    } catch (error) {
      console.error(`[FAQ] Error duplicating FAQ ${id}:`, error);
      throw error;
    }
  }

  /**
   * ---------------------------------------------------------
   * REORDER FAQS
   * ---------------------------------------------------------
   */
  static async reorder(orderedIds: string[]) {
    try {
      if (!Array.isArray(orderedIds)) {
        throw new Error('orderedIds must be an array');
      }

      if (orderedIds.length === 0) {
        return [];
      }

      /**
       * Remove duplicate IDs.
       */
      const uniqueIds = [...new Set(orderedIds)];

      /**
       * Use transaction so all ordering changes
       * succeed or fail together.
       *
       * Temporary negative order avoids conflicts if
       * "order" has a UNIQUE constraint.
       */
      const result = await db.$transaction(async (tx: any) => {
        /**
         * STEP 1
         * Give temporary unique negative values.
         */
        await Promise.all(
          uniqueIds.map((id, index) =>
            tx.faq.update({
              where: {
                id,
              },
              data: {
                order: -(index + 1),
              },
            })
          )
        );

        /**
         * STEP 2
         * Set final order.
         */
        await Promise.all(
          uniqueIds.map((id, index) =>
            tx.faq.update({
              where: {
                id,
              },
              data: {
                order: index,
              },
            })
          )
        );

        /**
         * STEP 3
         * Return final sorted data.
         */
        return tx.faq.findMany({
          orderBy: [
            {
              order: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
        });
      });

      console.log(
        `[FAQ] Reordered ${uniqueIds.length} FAQs successfully`
      );

      return result;
    } catch (error) {
      console.error('[FAQ] Error reordering FAQs:', error);
      throw error;
    }
  }
}
