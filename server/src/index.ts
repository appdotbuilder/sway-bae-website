import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createSocialMediaInputSchema,
  updateSocialMediaInputSchema,
  createBrandInputSchema,
  updateBrandInputSchema,
  createContactSubmissionInputSchema,
  createSiteContentInputSchema,
  updateSiteContentInputSchema,
  getSiteContentQuerySchema
} from './schema';

// Import handlers
import { getSocialMedia } from './handlers/get_social_media';
import { createSocialMedia } from './handlers/create_social_media';
import { updateSocialMedia } from './handlers/update_social_media';
import { getBrands } from './handlers/get_brands';
import { createBrand } from './handlers/create_brand';
import { updateBrand } from './handlers/update_brand';
import { createContactSubmission } from './handlers/create_contact_submission';
import { getContactSubmissions } from './handlers/get_contact_submissions';
import { getSiteContent } from './handlers/get_site_content';
import { createSiteContent } from './handlers/create_site_content';
import { updateSiteContent } from './handlers/update_site_content';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Social Media routes
  getSocialMedia: publicProcedure
    .query(() => getSocialMedia()),
  
  createSocialMedia: publicProcedure
    .input(createSocialMediaInputSchema)
    .mutation(({ input }) => createSocialMedia(input)),
  
  updateSocialMedia: publicProcedure
    .input(updateSocialMediaInputSchema)
    .mutation(({ input }) => updateSocialMedia(input)),

  // Brand routes
  getBrands: publicProcedure
    .query(() => getBrands()),
  
  createBrand: publicProcedure
    .input(createBrandInputSchema)
    .mutation(({ input }) => createBrand(input)),
  
  updateBrand: publicProcedure
    .input(updateBrandInputSchema)
    .mutation(({ input }) => updateBrand(input)),

  // Contact form routes
  createContactSubmission: publicProcedure
    .input(createContactSubmissionInputSchema)
    .mutation(({ input }) => createContactSubmission(input)),
  
  getContactSubmissions: publicProcedure
    .query(() => getContactSubmissions()),

  // Site content management routes
  getSiteContent: publicProcedure
    .input(getSiteContentQuerySchema.optional())
    .query(({ input }) => getSiteContent(input)),
  
  createSiteContent: publicProcedure
    .input(createSiteContentInputSchema)
    .mutation(({ input }) => createSiteContent(input)),
  
  updateSiteContent: publicProcedure
    .input(updateSiteContentInputSchema)
    .mutation(({ input }) => updateSiteContent(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();