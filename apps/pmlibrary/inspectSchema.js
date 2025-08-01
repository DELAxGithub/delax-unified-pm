import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  try {
    console.log('🔍 Inspecting database schema...');
    
    // Get all tables in the public schema
    console.log('\n📋 Getting all tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info');
    
    if (tablesError) {
      console.log('❌ Could not get tables via RPC, trying alternative method...');
      
      // Try to get table information using a direct query
      // This won't work with RLS but let's see what we can access
      const knownTables = ['episodes', 'programs', 'episode_statuses', 'status_history'];
      
      for (const tableName of knownTables) {
        console.log(`\n🔍 Checking table: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Error accessing ${tableName}:`, error.message);
        } else {
          console.log(`✅ ${tableName} table accessible`);
          if (data.length > 0) {
            console.log(`📊 Sample data structure:`, Object.keys(data[0]));
          } else {
            console.log(`📊 Table is empty, cannot determine structure from data`);
          }
        }
      }
    } else {
      console.log('✅ Tables found:', tables);
    }
    
    // Try to run the migration if tables seem empty
    console.log('\n🛠️ Checking if migration needs to be run...');
    
    // Check if episode_statuses is populated
    const { data: statusCheck, error: statusCheckError } = await supabase
      .from('episode_statuses')
      .select('*')
      .limit(1);
    
    if (statusCheckError) {
      console.log('❌ Cannot check episode_statuses:', statusCheckError.message);
    } else if (statusCheck.length === 0) {
      console.log('⚠️ episode_statuses table is empty - migration data not inserted');
      console.log('💡 This suggests the migration file needs to be applied or re-run');
    } else {
      console.log('✅ episode_statuses has data:', statusCheck);
    }
    
  } catch (error) {
    console.error('💥 Schema inspection failed:', error);
  }
}

// Run the inspection
inspectSchema();