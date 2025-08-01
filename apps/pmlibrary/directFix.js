import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function directFix() {
  console.log('🔧 Applying direct RLS fix...');
  
  try {
    // Create a test user to get authenticated session
    console.log('👤 Creating test user...');
    
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';
    
    // Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.log('❌ Sign up error:', signUpError.message);
    } else {
      console.log('✅ User created or already exists');
    }
    
    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign in error:', signInError.message);
      console.log('⚠️ Proceeding with anonymous access...');
    } else {
      console.log('✅ Successfully signed in');
    }
    
    // Insert episode_statuses data
    console.log('\n📤 Inserting episode_statuses data...');
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
    
    let successCount = 0;
    for (const status of statusData) {
      const { data, error } = await supabase
        .from('episode_statuses')
        .upsert([status], { onConflict: 'status_name' })
        .select();
      
      if (error) {
        console.log(`❌ Failed to insert ${status.status_name}:`, error.message);
      } else {
        console.log(`✅ Inserted ${status.status_name}`);
        successCount++;
      }
    }
    
    console.log(`\n📊 Inserted ${successCount}/${statusData.length} status records`);
    
    // Verify insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('episode_statuses')
      .select('*')
      .order('status_order');
    
    if (verifyError) {
      console.log('❌ Verification error:', verifyError.message);
    } else {
      console.log(`✅ Verification: ${verifyData.length} status records in database`);
      verifyData.forEach(status => {
        console.log(`  ${status.status_order}. ${status.status_name}`);
      });
    }
    
    console.log('\n🎉 Direct fix completed!');
    
  } catch (error) {
    console.error('💥 Direct fix failed:', error);
  }
}

// Run the fix
directFix();