import { AppDataSource } from '../data-source';
import { seedAdmin } from './admin.seed';

async function runSeeds() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    console.log('\nRunning seeds...');
    await seedAdmin(AppDataSource);

    console.log('\nAll seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();
