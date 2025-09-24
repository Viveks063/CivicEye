// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'assigned' | 'in-progress' | 'resolved';
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  image_url?: string;
  reported_by?: string;
  assigned_to?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

// Database functions
export const createIssue = async (issueData: Partial<Issue>) => {
  const { data, error } = await supabase
    .from('issues')
    .insert([issueData])
    .select()
    .single();
  
  return { data, error };
};

export const getIssues = async () => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const updateIssueStatus = async (id: string, status: string, assignedTo?: string) => {
  const updates: any = { status };
  if (assignedTo) updates.assigned_to = assignedTo;
  
  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Real-time subscription
export const subscribeToIssues = (callback: (payload: any) => void) => {
  return supabase
    .channel('issues-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'issues'
      },
      callback
    )
    .subscribe();
};

// File upload function
export const uploadImage = async (file: File, bucket = 'issue-images') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    console.log('Uploading file:', fileName, 'to bucket:', bucket);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return { data: null, error };
    }
    
    console.log('Upload successful:', data);
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    console.log('Public URL:', urlData.publicUrl);
    
    return { data: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload function error:', err);
    return { data: null, error: err };
  }
};