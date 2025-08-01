import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTableStructure() {
  try {
    console.log('🔍 Inspecting actual table structure...');
    
    // Check what we can access by trying different column combinations
    const tables = [
      { name: 'episodes', expectedCols: ['id', 'episode_id', 'title', 'current_status'] },
      { name: 'episode_statuses', expectedCols: ['id', 'status_name', 'status_order'] },
      { name: 'programs', expectedCols: ['id', 'program_id', 'title'] }
    ];
    
    for (const table of tables) {
      console.log(`\n📋 Analyzing table: ${table.name}`);
      
      // Try to get any record to understand structure
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error accessing ${table.name}:`, error.message);
        
        // Try with individual columns to see which ones exist
        for (const col of table.expectedCols) {
          const { data: colData, error: colError } = await supabase
            .from(table.name)
            .select(col)
            .limit(1);
          
          if (colError) {
            console.log(`  ❌ Column '${col}' not accessible: ${colError.message}`);
          } else {
            console.log(`  ✅ Column '${col}' exists`);
          }
        }
      } else {
        console.log(`✅ ${table.name} accessible, rows: ${data.length}`);
        if (data.length > 0) {
          console.log(`📊 Sample structure:`, Object.keys(data[0]));
          console.log(`📄 Sample data:`, data[0]);
        } else {
          console.log(`📊 Table is empty`);
        }
      }
    }
    
    // Try to access the current user info to understand auth status  
    console.log('\n👤 Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      console.log('💡 Not authenticated - using anonymous access');
    } else if (user) {
      console.log('✅ Authenticated user:', user.id);
    } else {
      console.log('💡 Anonymous access');
    }
    
  } catch (error) {
    console.error('💥 Inspection failed:', error);
  }
}

// Run the inspection
inspectTableStructure();