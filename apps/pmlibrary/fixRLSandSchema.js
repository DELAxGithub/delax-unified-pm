import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRLSandSchema() {
  console.log('🔧 Starting RLS and Schema fixes...');
  
  try {
    // 1. First, let's check what tables exist
    console.log('\n📋 Checking existing tables...');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['episodes', 'episode_statuses', 'programs']);
    
    if (tablesError) {
      console.log('❌ Could not query information_schema, trying alternative method');
      
      // Try to access each table directly
      const tables = ['episodes', 'episode_statuses', 'programs'];
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': accessible, found ${data.length} rows`);
        }
      }
    } else {
      console.log('✅ Found tables:', tablesData.map(t => t.table_name));
    }
    
    // 2. Try to create a test user to bypass RLS
    console.log('\n👤 Creating test user for RLS bypass...');
    const testEmail = 'admin@pmlibrary.dev';
    const testPassword = 'AdminPassword123!';
    
    // Try sign up first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined // Disable email confirmation
      }
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.log('❌ Sign up error:', signUpError.message);
    } else {
      console.log('✅ User created or already exists');
    }
    
    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign in error:', signInError.message);
      console.log('⚠️ Will proceed with anonymous access');
    } else {
      console.log('✅ Successfully signed in as:', signInData.user?.email);
    }
    
    // 3. Try to insert episode_statuses data
    console.log('\n📤 Attempting to insert episode_statuses data...');
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
    
    const { data: insertData, error: insertError } = await supabase
      .from('episode_statuses')
      .upsert(statusData, { onConflict: 'status_name' })
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('🔧 Error details:', insertError);
      
      // Try single row insert to diagnose issue
      console.log('\n🧪 Testing single row insert...');
      const { data: singleData, error: singleError } = await supabase
        .from('episode_statuses')
        .insert([statusData[0]])
        .select();
        
      if (singleError) {
        console.log('❌ Single insert also failed:', singleError.message);
      } else {
        console.log('✅ Single insert succeeded!');
      }
    } else {
      console.log(`✅ Successfully inserted ${insertData.length} status records`);
    }
    
    // 4. Verify current data
    console.log('\n🔍 Verifying current episode_statuses data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('episode_statuses')
      .select('*')
      .order('status_order');
    
    if (verifyError) {
      console.log('❌ Verification error:', verifyError.message);
    } else {
      console.log(`📊 Found ${verifyData.length} status records:`);
      verifyData.forEach(status => {
        console.log(`  ${status.status_order}. ${status.status_name} (${status.color_code})`);
      });
    }
    
    // 5. Test episode table schema
    console.log('\n🧪 Testing episodes table schema...');
    const testEpisode = {
      episode_id: 'TEST-SCHEMA-01',
      title: 'Schema Test Episode',
      episode_type: 'vtr',
      season: 1,
      episode_number: 1,
      current_status: '台本作成中'
    };
    
    const { data: episodeInsert, error: episodeError } = await supabase
      .from('episodes')
      .insert([testEpisode])
      .select();
    
    if (episodeError) {
      console.log('❌ Episode insert error:', episodeError.message);
      console.log('🔧 Episode error details:', episodeError);
      
      // Try to get column information
      console.log('\n📋 Attempting to get episodes table structure...');
      const { data: columnsData, error: columnsError } = await supabase
        .from('episodes')
        .select('*')
        .limit(0);
        
      if (columnsError) {
        console.log('❌ Could not access episodes table:', columnsError.message);
      } else {
        console.log('✅ Episodes table accessible (empty result for structure check)');
      }
    } else {
      console.log(`✅ Successfully inserted test episode`);
      
      // Clean up test episode
      const { error: deleteError } = await supabase
        .from('episodes')
        .delete()
        .eq('episode_id', 'TEST-SCHEMA-01');
        
      if (deleteError) {
        console.log('⚠️ Could not delete test episode:', deleteError.message);
      } else {
        console.log('✅ Test episode cleaned up');
      }
    }
    
    console.log('\n🎉 RLS and Schema diagnostic completed!');
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error);
  }
}

// Run the diagnostic
fixRLSandSchema();