import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

const statusData = [
  { status_name: '台本作成中', status_order: 1, color_code: '#6B7280' },
  { status_name: '素材準備', status_order: 2, color_code: '#8B5CF6' },
  { status_name: '素材確定', status_order: 3, color_code: '#6366F1' },
  { status_name: '編集中', status_order: 4, color_code: '#3B82F6' },
  { status_name: '試写1', status_order: 5, color_code: '#06B6D4' },
  { status_name: '修正1', status_order: 6, color_code: '#10B981' },
  { status_name: 'MA中', status_order: 7, color_code: '#84CC16' },
  { status_name: '初稿完成', status_order: 8, color_code: '#EAB308' },
  { status_name: '修正中', status_order: 9, color_code: '#F59E0B' },
  { status_name: '完パケ納品', status_order: 10, color_code: '#22C55E' }
];

async function insertStatusData() {
  try {
    console.log('🚀 Starting episode_statuses data insertion...');
    
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('episode_statuses')
      .select('*');
      
    if (checkError) {
      console.error('❌ Error checking existing data:', checkError.message);
      return;
    }
    
    console.log(`📊 Found ${existingData.length} existing status records`);
    
    if (existingData.length > 0) {
      console.log('ℹ️ Status data already exists. Skipping insertion.');
      console.log('📋 Existing statuses:', existingData.map(s => s.status_name));
      return;
    }
    
    // Insert status data
    console.log(`📤 Inserting ${statusData.length} status records...`);
    
    const { data, error } = await supabase
      .from('episode_statuses')
      .insert(statusData)
      .select();
      
    if (error) {
      console.error('❌ Error inserting status data:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log(`✅ Successfully inserted ${data.length} status records`);
    console.log('📋 Inserted statuses:', data.map(s => `${s.status_order}. ${s.status_name}`));
    
    // Verify insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('episode_statuses')
      .select('*')
      .order('status_order');
      
    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log('\n🔍 Verification successful:');
      verifyData.forEach(status => {
        console.log(`  ${status.status_order}. ${status.status_name} (${status.color_code})`);
      });
    }
    
    console.log('\n🎉 Status data insertion completed!');
    
  } catch (error) {
    console.error('💥 Insertion failed:', error);
    process.exit(1);
  }
}

// Run the insertion
insertStatusData();