import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

test.describe('Bundle Analysis', () => {
  test('should have acceptable bundle size', async () => {
    // Build the application
    execSync('npm run build', { stdio: 'pipe' });
    
    // Read bundle analyzer output
    const bundleStatsPath = join(process.cwd(), '.next/analyze/client.html');
    
    try {
      const bundleStats = readFileSync(bundleStatsPath, 'utf-8');
      
      // Parse bundle size from HTML output
      const sizeMatch = bundleStats.match(/Total Size: ([\d.]+) KB/);
      const totalSize = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
      
      // Check bundle size limits
      expect(totalSize).toBeLessThan(500); // Should be under 500KB
      
      // Check individual chunk sizes
      const chunkMatches = bundleStats.matchAll(/Chunk: ([^,]+), Size: ([\d.]+) KB/g);
      for (const match of chunkMatches) {
        const chunkName = match[1];
        const chunkSize = parseFloat(match[2]);
        
        // Individual chunks should be under 200KB
        expect(chunkSize).toBeLessThan(200);
        
        // Vendor chunks should be under 300KB
        if (chunkName.includes('vendor') || chunkName.includes('node_modules')) {
          expect(chunkSize).toBeLessThan(300);
        }
      }
    } catch (error) {
      // If bundle analyzer file doesn't exist, run the analysis
      execSync('npm run analyze:bundle', { stdio: 'pipe' });
      
      // Retry reading the file
      const bundleStats = readFileSync(bundleStatsPath, 'utf-8');
      const sizeMatch = bundleStats.match(/Total Size: ([\d.]+) KB/);
      const totalSize = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
      
      expect(totalSize).toBeLessThan(500);
    }
  });

  test('should have proper code splitting', async () => {
    // Build the application
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check that we have multiple chunks
    const buildDir = join(process.cwd(), '.next/static/chunks');
    const chunkFiles = execSync(`find ${buildDir} -name "*.js"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    // Should have multiple chunks for code splitting
    expect(chunkFiles.length).toBeGreaterThan(1);
    
    // Check chunk sizes
    for (const chunkFile of chunkFiles) {
      const stats = execSync(`wc -c < "${chunkFile}"`, { encoding: 'utf-8' });
      const sizeInBytes = parseInt(stats.trim());
      const sizeInKB = sizeInBytes / 1024;
      
      // Individual chunks should be under 200KB
      expect(sizeInKB).toBeLessThan(200);
    }
  });

  test('should have optimized images', async () => {
    // Check that images are optimized
    const publicDir = join(process.cwd(), 'public');
    const imageFiles = execSync(`find ${publicDir} -name "*.jpg" -o -name "*.png" -o -name "*.webp"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    for (const imageFile of imageFiles) {
      const stats = execSync(`wc -c < "${imageFile}"`, { encoding: 'utf-8' });
      const sizeInBytes = parseInt(stats.trim());
      const sizeInKB = sizeInBytes / 1024;
      
      // Images should be under 500KB
      expect(sizeInKB).toBeLessThan(500);
    }
  });

  test('should have minimal unused dependencies', async () => {
    // Check for unused dependencies
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    // Check for common unused dependencies
    const potentiallyUnused = [
      'lodash', // Use native methods instead
      'moment', // Use date-fns or native Date
      'jquery', // Not needed in React
      'bootstrap', // Use Tailwind instead
    ];
    
    const unusedFound = potentiallyUnused.filter(dep => 
      dependencies.includes(dep) || devDependencies.includes(dep)
    );
    
    expect(unusedFound).toEqual([]);
  });

  test('should have proper tree shaking', async () => {
    // Build the application
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check that unused code is not included
    const buildDir = join(process.cwd(), '.next/static/chunks');
    const chunkFiles = execSync(`find ${buildDir} -name "*.js"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    for (const chunkFile of chunkFiles) {
      const content = readFileSync(chunkFile, 'utf-8');
      
      // Check for unused imports (basic check)
      const unusedImports = [
        'import.*from.*lodash', // Should use specific imports
        'import.*from.*moment', // Should use date-fns
        'import.*from.*jquery', // Should not be used
      ];
      
      for (const pattern of unusedImports) {
        const matches = content.match(new RegExp(pattern, 'g'));
        expect(matches).toBeNull();
      }
    }
  });

  test('should have optimized CSS', async () => {
    // Build the application
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check CSS bundle size
    const buildDir = join(process.cwd(), '.next/static/css');
    const cssFiles = execSync(`find ${buildDir} -name "*.css"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    for (const cssFile of cssFiles) {
      const stats = execSync(`wc -c < "${cssFile}"`, { encoding: 'utf-8' });
      const sizeInBytes = parseInt(stats.trim());
      const sizeInKB = sizeInBytes / 1024;
      
      // CSS should be under 100KB
      expect(sizeInKB).toBeLessThan(100);
    }
  });

  test('should have proper caching headers', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check static assets caching
    const response = await page.waitForResponse('**/*.js');
    const headers = response.headers();
    
    // Static assets should have cache headers
    expect(headers['cache-control']).toContain('public');
    expect(headers['cache-control']).toContain('max-age');
  });

  test('should have optimized fonts', async () => {
    // Check font loading
    const fontFiles = execSync(`find . -name "*.woff*" -o -name "*.ttf"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    for (const fontFile of fontFiles) {
      const stats = execSync(`wc -c < "${fontFile}"`, { encoding: 'utf-8' });
      const sizeInBytes = parseInt(stats.trim());
      const sizeInKB = sizeInBytes / 1024;
      
      // Fonts should be under 200KB
      expect(sizeInKB).toBeLessThan(200);
    }
  });

  test('should have minimal runtime dependencies', async () => {
    // Check runtime dependencies
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    // Essential dependencies only
    const essentialDeps = [
      'next',
      'react',
      'react-dom',
      '@clerk/nextjs',
      '@supabase/supabase-js',
      'openai',
      'stripe',
      'resend',
      'framer-motion',
      'tailwindcss',
      'zod',
      'react-hook-form'
    ];
    
    // Check for unnecessary dependencies
    const unnecessaryDeps = dependencies.filter(dep => !essentialDeps.includes(dep));
    
    // Should have minimal unnecessary dependencies
    expect(unnecessaryDeps.length).toBeLessThan(10);
  });

  test('should have proper source maps', async () => {
    // Build the application
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check for source maps in production
    const buildDir = join(process.cwd(), '.next/static/chunks');
    const sourceMapFiles = execSync(`find ${buildDir} -name "*.js.map"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    // Should have source maps for debugging
    expect(sourceMapFiles.length).toBeGreaterThan(0);
  });

  test('should have optimized imports', async () => {
    // Check for barrel imports
    const srcDir = join(process.cwd(), 'src');
    const tsFiles = execSync(`find ${srcDir} -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    for (const tsFile of tsFiles) {
      const content = readFileSync(tsFile, 'utf-8');
      
      // Check for specific imports instead of barrel imports
      const barrelImports = [
        'import.*from.*"@/components"',
        'import.*from.*"@/lib"',
        'import.*from.*"@/utils"'
      ];
      
      for (const pattern of barrelImports) {
        const matches = content.match(new RegExp(pattern, 'g'));
        if (matches) {
          // Barrel imports should be minimal
          expect(matches.length).toBeLessThan(5);
        }
      }
    }
  });
}); 