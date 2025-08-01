import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfrzcteapmwufnovmmfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectCurrentSchema() {
  console.log('🔍 Inspecting current database schema...');
  
  try {
    // Get all columns for episodes table using rpc
    console.log('\n📋 Getting episodes table columns...');
    
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_table_columns', { 
      table_name: 'episodes' 
    });
    
    if (rpcError) {
      console.log('❌ RPC call failed, trying alternative method');
      
      // Alternative: try direct query to pg_attribute
      const query = `
        SELECT 
          a.attname as column_name,
          t.typname as data_type,
          a.attnotnull as not_null,
          a.attnum as ordinal_position
        FROM pg_class c
        JOIN pg_attribute a ON a.attrelid = c.oid
        JOIN pg_type t ON a.atttypid = t.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'episodes' 
          AND n.nspname = 'public'
          AND a.attnum > 0
          AND NOT a.attisdropped
        ORDER BY a.attnum
      `;
      
      const { data: schemaData, error: schemaError } = await supabase
        .from('pg_class')
        .select(query);
        
      if (schemaError) {
        console.log('❌ Schema query failed:', schemaError.message);
        
        // Last resort: try to describe table by inserting empty object
        console.log('\n🧪 Testing table structure with empty insert...');
        const { data: testData, error: testError } = await supabase
          .from('episodes')
          .insert([{}])
          .select();
          
        if (testError) {
          console.log('📊 Test insert error (this gives us column info):');
          console.log(testError.message);
          console.log('Full error:', testError);
        }
      }
    } else {
      console.log('✅ Episodes table columns:', rpcData);
    }
    
    // Check episode_statuses table
    console.log('\n📋 Testing episode_statuses access...');
    const { data: statusData, error: statusError } = await supabase
      .from('episode_statuses')
      .select('*')
      .limit(5);
      
    if (statusError) {
      console.log('❌ episode_statuses error:', statusError.message);
    } else {
      console.log(`✅ episode_statuses accessible, ${statusData.length} rows`);
      if (statusData.length > 0) {
        console.log('Sample data:', statusData[0]);
      }
    }
    
    // Check programs table
    console.log('\n📋 Testing programs access...');
    const { data: programsData, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .limit(5);
      
    if (programsError) {
      console.log('❌ programs error:', programsError.message);
    } else {
      console.log(`✅ programs accessible, ${programsData.length} rows`);
      if (programsData.length > 0) {
        console.log('Sample data:', programsData[0]);
      }
    }
    
    console.log('\n🎉 Schema inspection completed!');
    
  } catch (error) {
    console.error('💥 Inspection failed:', error);
  }
}

// Run the inspection
inspectCurrentSchema();