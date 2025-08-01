import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Try to get episodes table structure by attempting a select with limit 0
    console.log('\n📋 Checking episodes table...');
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Error accessing episodes table:', error.message);
      console.error('Details:', error);
    } else {
      console.log('✅ Episodes table exists and is accessible');
    }
    
    // Try to check what tables exist
    console.log('\n📋 Checking available tables...');
    
    // Try programs table
    const { data: programsData, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .limit(1);
    
    if (programsError) {
      console.log('❌ Programs table error:', programsError.message);
    } else {
      console.log('✅ Programs table exists:', programsData.length, 'records found');
    }
    
    // Try episode_statuses table
    const { data: statusData, error: statusError } = await supabase
      .from('episode_statuses')
      .select('*')
      .limit(5);
    
    if (statusError) {
      console.log('❌ Episode_statuses table error:', statusError.message);
    } else {
      console.log('✅ Episode_statuses table exists:', statusData.length, 'records found');
      console.log('Status records:', statusData);
    }
    
    // Try to get existing episodes count
    console.log('\n📊 Checking existing episodes...');
    const { count, error: countError } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error counting episodes:', countError.message);
    } else {
      console.log('✅ Episodes in database:', count);
    }
    
    // Try a simple insert to see what fields are actually available
    console.log('\n🧪 Testing episode insert with minimal data...');
    const testEpisode = {
      episode_id: 'TEST-001',
      title: 'Test Episode'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('episodes')
      .insert([testEpisode])
      .select();
    
    if (insertError) {
      console.log('❌ Test insert error:', insertError.message);
      console.log('Error details:', insertError);
    } else {
      console.log('✅ Test insert successful:', insertData);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('episodes')
        .delete()
        .eq('episode_id', 'TEST-001');
      
      if (deleteError) {
        console.log('⚠️ Failed to clean up test data:', deleteError.message);
      } else {
        console.log('🧹 Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.error('💥 Database check failed:', error);
  }
}

// Run the check
checkDatabase();