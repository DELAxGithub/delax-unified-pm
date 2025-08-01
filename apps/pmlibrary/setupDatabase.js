import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database with required master data...');
    
    // Step 1: Insert episode statuses master data
    console.log('\n📋 Setting up episode_statuses master data...');
    
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
    
    // First, check if data already exists
    const { data: existingStatuses, error: checkError } = await supabase
      .from('episode_statuses')
      .select('status_name');
    
    if (checkError) {
      console.error('❌ Error checking existing statuses:', checkError.message);
      return;
    }
    
    const existingStatusNames = existingStatuses.map(s => s.status_name);
    const newStatuses = statusData.filter(s => !existingStatusNames.includes(s.status_name));
    
    if (newStatuses.length > 0) {
      console.log(`📤 Inserting ${newStatuses.length} new episode statuses...`);
      
      const { data, error } = await supabase
        .from('episode_statuses')
        .insert(newStatuses)
        .select();
      
      if (error) {
        console.error('❌ Error inserting episode statuses:', error.message);
      } else {
        console.log('✅ Successfully inserted episode statuses:', data.length);
      }
    } else {
      console.log('✅ Episode statuses already exist, skipping insertion');
    }
    
    // Step 2: Verify the episode_statuses data
    const { data: allStatuses, error: verifyError } = await supabase
      .from('episode_statuses')
      .select('*')
      .order('status_order');
    
    if (verifyError) {
      console.error('❌ Error verifying statuses:', verifyError.message);
    } else {
      console.log('✅ Episode statuses in database:', allStatuses.length);
      allStatuses.forEach(status => {
        console.log(`  - ${status.status_order}: ${status.status_name} (${status.color_code})`);
      });
    }
    
    // Step 3: Test episode table structure by inserting a minimal test record
    console.log('\n🧪 Testing episode table structure...');
    
    const testEpisode = {
      episode_id: 'TEST-STRUCTURE-001',
      title: 'Structure Test Episode',
      episode_type: 'vtr',
      season: 1,
      episode_number: 999,
      current_status: '台本作成中'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('episodes')
      .insert([testEpisode])
      .select();
    
    if (insertError) {
      console.error('❌ Episode table structure test failed:', insertError.message);
      console.log('💡 Available columns might be different than expected');
    } else {
      console.log('✅ Episode table structure test passed');
      console.log('📊 Inserted test episode:', insertData[0]);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('episodes')
        .delete()
        .eq('episode_id', 'TEST-STRUCTURE-001');
      
      if (deleteError) {
        console.log('⚠️ Could not clean up test episode:', deleteError.message);
      } else {
        console.log('🧹 Test episode cleaned up');
      }
    }
    
    console.log('\n🎉 Database setup completed!');
    
  } catch (error) {
    console.error('💥 Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();