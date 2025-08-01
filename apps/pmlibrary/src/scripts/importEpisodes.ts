import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

interface CSVEpisode {
  episode_id: string;
  title: string;
  episode_type: 'interview' | 'vtr';
  season: number;
  episode_number: number;
  current_status: string;
  director: string | null;
  due_date: string | null;
  script_url: string | null;
  guest_name: string | null;
  recording_date: string | null;
  recording_location: string | null;
  material_status: '○' | '△' | '×' | null;
}

function parseCSV(csvContent: string): CSVEpisode[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  const episodes: CSVEpisode[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    // Parse CSV with proper quote handling
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value
    
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
      continue;
    }
    
    const episode: CSVEpisode = {
      episode_id: values[0] || '',
      title: values[1] || '',
      episode_type: values[2] as 'interview' | 'vtr',
      season: parseInt(values[3]) || 1,
      episode_number: parseInt(values[4]) || 1,
      current_status: values[5] || '台本作成中',
      director: values[6] || null,
      due_date: values[7] || null,
      script_url: values[8] || null,
      guest_name: values[9] || null,
      recording_date: values[10] || null,
      recording_location: values[11] || null,
      material_status: (values[12] as '○' | '△' | '×') || null
    };
    
    // Clean up empty strings to null
    Object.keys(episode).forEach(key => {
      if (episode[key as keyof CSVEpisode] === '') {
        (episode as any)[key] = null;
      }
    });
    
    episodes.push(episode);
  }
  
  return episodes;
}

async function importEpisodes() {
  try {
    console.log('🚀 Starting episode import...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../dummy_episodes.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('📄 CSV file read successfully');
    
    // Parse CSV
    const episodes = parseCSV(csvContent);
    console.log(`📊 Parsed ${episodes.length} episodes from CSV`);
    
    // Clear existing episodes (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing episodes...');
    const { error: deleteError } = await supabase
      .from('episodes')
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (deleteError) {
      console.warn('⚠️  Warning: Could not clear existing episodes:', deleteError.message);
    } else {
      console.log('✅ Existing episodes cleared');
    }
    
    // Insert episodes in batches
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < episodes.length; i += batchSize) {
      const batch = episodes.slice(i, i + batchSize);
      
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(episodes.length / batchSize)}...`);
      
      const { data, error } = await supabase
        .from('episodes')
        .insert(batch)
        .select();
      
      if (error) {
        console.error('❌ Batch insert error:', error.message);
        console.error('📄 Failed batch:', batch);
        errorCount += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${batch.length} episodes`);
        successCount += batch.length;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`✅ Success: ${successCount} episodes`);
    console.log(`❌ Failed: ${errorCount} episodes`);
    console.log(`📈 Total: ${episodes.length} episodes`);
    
    // Verify import
    console.log('\n🔍 Verifying import...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('episodes')
      .select('count', { count: 'exact' });
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log(`✅ Verification: ${verifyData.length || 0} episodes in database`);
    }
    
    console.log('\n🎉 Episode import completed!');
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importEpisodes();