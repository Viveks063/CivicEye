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
  video_url?: string;
  media_type?: string;
  reported_by?: string;
  assigned_to?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced media upload function
export const uploadMedia = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const fileType = file.type;
    
    // Determine which bucket to use
    const isVideo = fileType.startsWith('video/');
    const bucketName = isVideo ? 'issue-videos' : 'issue-images';
    
    console.log('Uploading file:', fileName, 'Type:', fileType, 'to bucket:', bucketName);
    
    // Check file size limits
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB vs 10MB
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return { 
        data: null, 
        error: `File too large. Maximum size is ${maxSizeMB}MB for ${isVideo ? 'videos' : 'images'}` 
      };
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: fileType,
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      return { data: null, error: error.message };
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    console.log('Public URL generated:', urlData.publicUrl);
    
    return { 
      data: {
        url: urlData.publicUrl,
        type: isVideo ? 'video' : 'image'
      }, 
      error: null 
    };
    
  } catch (err) {
    console.error('Upload function error:', err);
    return { data: null, error: (err as Error).message };
  }
};

// Keep backward compatibility
export const uploadImage = uploadMedia;

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