import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAwMDA1MCwiZXhwIjoyMDY4NTc2MDUwfQ.cXYQbZYYjY6ueUH9eCB_DRWCqLbOCkvEkKnCZY2k1A8';

// Create admin client that bypasses RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function quickSetup() {
  try {
    console.log('🚀 Starting quick setup...');
    
    // 1. Insert episode statuses with admin privileges
    console.log('📤 Inserting episode statuses...');
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
    
    const { data: statusResult, error: statusError } = await supabase
      .from('episode_statuses')
      .upsert(statusData, { onConflict: 'status_name' })
      .select();
      
    if (statusError) {
      console.error('❌ Status insertion error:', statusError.message);
      // Try with anon key instead
      console.log('🔄 Retrying with anon key...');
      const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU');
      
      // Create test user first
      const { data: authData, error: authError } = await anonClient.auth.signUp({
        email: 'test@pmlibrary.dev',
        password: 'password123'
      });
      
      if (authError && authError.message !== 'User already registered') {
        console.error('❌ Auth error:', authError.message);
      } else {
        console.log('✅ User created or already exists');
      }
      
      // Sign in the test user
      const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email: 'test@pmlibrary.dev',
        password: 'password123'
      });
      
      if (signInError) {
        console.error('❌ Sign in error:', signInError.message);
      } else {
        console.log('✅ Successfully signed in');
        
        // Try status insertion again with authenticated user
        const { data: statusResult2, error: statusError2 } = await anonClient
          .from('episode_statuses')
          .upsert(statusData, { onConflict: 'status_name' })
          .select();
          
        if (statusError2) {
          console.error('❌ Second status insertion error:', statusError2.message);
        } else {
          console.log(`✅ Successfully inserted ${statusResult2.length} status records`);
        }
      }
    } else {
      console.log(`✅ Successfully inserted ${statusResult.length} status records`);
    }
    
    // 2. Verify status data
    console.log('🔍 Verifying status data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('episode_statuses')
      .select('*')
      .order('status_order');
      
    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log(`📊 Found ${verifyData.length} status records:`);
      verifyData.forEach(status => {
        console.log(`  ${status.status_order}. ${status.status_name}`);
      });
    }
    
    console.log('\n🎉 Quick setup completed!');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

// Run the setup
quickSetup();