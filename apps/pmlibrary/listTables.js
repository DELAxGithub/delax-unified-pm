import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log('📋 Listing all accessible tables...');
  
  const commonTables = [
    'programs', 'episodes', 'episode_statuses', 'status_history',
    'calendar_events', 'calendar_tasks', 'team_dashboard', 'team_events',
    'clients', 'users'
  ];
  
  const existingTables = [];
  
  for (const tableName of commonTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: accessible (${data.length} sample rows)`);
        existingTables.push(tableName);
        
        // Show sample data if available
        if (data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
        }
      }
    } catch (err) {
      console.log(`💥 ${tableName}: Exception - ${err.message}`);
    }
  }
  
  console.log(`\n📊 Summary: Found ${existingTables.length} accessible tables:`);
  console.log(existingTables.join(', '));
  
  // Try to get table schema info using a different approach
  console.log('\n🔍 Attempting to get database metadata...');
  
  // Try a simple count query on each existing table
  for (const table of existingTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table} count: ${error.message}`);
      } else {
        console.log(`📊 ${table}: ${count} total rows`);
      }
    } catch (err) {
      console.log(`💥 ${table} count: ${err.message}`);
    }
  }
}

// Run the listing
listTables();