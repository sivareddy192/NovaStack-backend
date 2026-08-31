import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, isDbConnected } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Service from '../models/Service.js';
import Insight from '../models/Insight.js';
import PricingConfig from '../models/PricingConfig.js';
import {
  defaultPricingConfig,
  seedServices,
  seedProjects,
  seedInsights,
} from '../config/seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  if (!isDbConnected()) {
    console.log('[NovaStack Seeder] Database in standalone memory mode. Seeding active in-memory.');
    return;
  }

  try {
    console.log('[NovaStack Seeder] Checking database state...');

    // Seed Admin User (only if explicitly configured in environment)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminEmail = process.env.ADMIN_EMAIL.toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD;
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (!existingAdmin) {
        await User.create({
          name: 'NovaStack Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'superadmin',
        });
        console.log(`[NovaStack Seeder] Created initial admin user from env: ${adminEmail}`);
      }
    }

    // Seed Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(seedServices);
      console.log(`[NovaStack Seeder] Seeded ${seedServices.length} services.`);
    }

    // Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany(seedProjects);
      console.log(`[NovaStack Seeder] Seeded ${seedProjects.length} showcase projects.`);
    }

    // Seed Insights
    const insightCount = await Insight.countDocuments();
    if (insightCount === 0) {
      await Insight.insertMany(seedInsights);
      console.log(`[NovaStack Seeder] Seeded ${seedInsights.length} technical insights.`);
    }

    // Seed Pricing Config
    const pricingCount = await PricingConfig.countDocuments();
    if (pricingCount === 0) {
      await PricingConfig.create(defaultPricingConfig);
      console.log('[NovaStack Seeder] Seeded default pricing engine configuration.');
    }

    console.log('[NovaStack Seeder] Database initialized successfully!');
  } catch (error) {
    console.error('[NovaStack Seeder Error]:', error.message);
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}
