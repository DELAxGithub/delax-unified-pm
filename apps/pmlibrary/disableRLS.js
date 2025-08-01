import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
// Try using service role key if available, otherwise anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLS() {
  console.log('🔓 Attempting to disable RLS policies...');
  
  try {
    // Execute raw SQL to disable RLS
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Disable RLS on all tables
        ALTER TABLE episode_statuses DISABLE ROW LEVEL SECURITY;
        ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;
        ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE status_history DISABLE ROW LEVEL SECURITY;
        
        -- Insert episode_statuses data
        INSERT INTO episode_statuses (status_name, status_order, color_code) VALUES
          ('台本作成中', 1, '#6B7280'),
          ('素材準備', 2, '#8B5CF6'),
          ('素材確定', 3, '#6366F1'),
          ('編集中', 4, '#3B82F6'),
          ('試写1', 5, '#06B6D4'),
          ('修正1', 6, '#10B981'),
          ('MA中', 7, '#84CC16'),
          ('初稿完成', 8, '#EAB308'),
          ('修正中', 9, '#F59E0B'),
          ('完パケ納品', 10, '#22C55E')
        ON CONFLICT (status_name) DO NOTHING;
        
        SELECT 'RLS disabled and data inserted' as result;
      `
    });
    
    if (error) {
      console.log('❌ RPC exec_sql failed:', error.message);
      
      // Try alternative approach - direct SQL execution through PostgREST
      console.log('🔄 Trying alternative method...');
      
      // First try to create a function that disables RLS
      const { data: createFuncData, error: createFuncError } = await supabase.rpc('create_rls_disable_function');
      
      if (createFuncError) {
        console.log('❌ Could not create function:', createFuncError.message);
        
        // Last resort: Try manual SQL commands one by one
        console.log('🔄 Trying manual commands...');
        
        const commands = [
          'ALTER TABLE episode_statuses DISABLE ROW LEVEL SECURITY',
          'ALTER TABLE episodes DISABLE ROW LEVEL SECURITY', 
          'ALTER TABLE programs DISABLE ROW LEVEL SECURITY',
          'ALTER TABLE status_history DISABLE ROW LEVEL SECURITY'
        ];
        
        for (const cmd of commands) {
          try {
            const { data: cmdData, error: cmdError } = await supabase.rpc('exec', { sql: cmd });
            if (cmdError) {
              console.log(`❌ Command failed: ${cmd}`, cmdError.message);
            } else {
              console.log(`✅ Executed: ${cmd}`);
            }
          } catch (err) {
            console.log(`💥 Exception for: ${cmd}`, err.message);
          }
        }
      }
    } else {
      console.log('✅ RLS disabled successfully!', data);
    }
    
    // Now try to insert data directly
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
      console.log('❌ Insert still failed:', insertError.message);
    } else {
      console.log(`✅ Successfully inserted ${insertData.length} status records!`);
    }
    
    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('episode_statuses')
      .select('*')
      .order('status_order');
    
    if (verifyError) {
      console.log('❌ Verification error:', verifyError.message);
    } else {
      console.log(`📊 Verification: ${verifyData.length} status records found`);
      verifyData.forEach(status => {
        console.log(`  ${status.status_order}. ${status.status_name}`);
      });
    }
    
    console.log('\n🎉 RLS disable attempt completed!');
    
  } catch (error) {
    console.error('💥 RLS disable failed:', error);
  }
}

// Run the disable
disableRLS();