// supabase.js - Supabase Configuration
// Save this file in your src/ folder

import { createClient } from '@supabase/supabase-js'

// ===================================
// SETUP INSTRUCTIONS:
// ===================================
// 1. Create account at https://supabase.com (FREE)
// 2. Create new project (takes 2-3 minutes)
// 3. Go to Settings → API
// 4. Copy your Project URL and Anon Key below
// 5. Install: npm install @supabase/supabase-js
// ===================================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===================================
// HELPER FUNCTIONS FOR YOUR APP
// ===================================

// Upload audio file to Supabase Storage
export const uploadAudio = async (file, metadata = {}) => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `audio/${fileName}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('devotional-audio')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('devotional-audio')
      .getPublicUrl(filePath)

    // Save metadata to database
    const { data: bhajanData, error: dbError } = await supabase
      .from('bhajans')
      .insert({
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata.artist,
        audio_url: urlData.publicUrl,
        category: metadata.category || 'bhajan',
        language: metadata.language || 'hindi',
        duration: metadata.duration
      })
      .select()
      .single()

    if (dbError) throw dbError

    return { success: true, data: bhajanData }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: error.message }
  }
}

// Get all audio files
export const getAllAudio = async (filters = {}) => {
  try {
    let query = supabase
      .from('bhajans')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.language) {
      query = query.eq('language', filters.language)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Fetch error:', error)
    return { success: false, error: error.message }
  }
}

// Add audio by URL (no upload needed)
export const addAudioByUrl = async (audioData) => {
  try {
    const { data, error } = await supabase
      .from('bhajans')
      .insert({
        title: audioData.title,
        artist: audioData.artist,
        audio_url: audioData.url,
        category: audioData.category || 'bhajan',
        language: audioData.language || 'hindi'
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Add URL error:', error)
    return { success: false, error: error.message }
  }
}

// Upload scripture/PDF
export const uploadScripture = async (file, metadata = {}) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `scriptures/${fileName}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scriptures')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('scriptures')
      .getPublicUrl(filePath)

    // Save to database
    const { data: scriptureData, error: dbError } = await supabase
      .from('scriptures')
      .insert({
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        content: metadata.content,
        pdf_url: urlData.publicUrl,
        source: metadata.source,
        language: metadata.language || 'hindi'
      })
      .select()
      .single()

    if (dbError) throw dbError

    return { success: true, data: scriptureData }
  } catch (error) {
    console.error('Scripture upload error:', error)
    return { success: false, error: error.message }
  }
}

// Save user practice
export const savePractice = async (practiceData) => {
  try {
    const { data, error } = await supabase
      .from('user_practices')
      .insert({
        user_id: practiceData.userId,
        practice_type: practiceData.type,
        duration: practiceData.duration,
        notes: practiceData.notes
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Save practice error:', error)
    return { success: false, error: error.message }
  }
}

// Get user's practice history
export const getPracticeHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('user_practices')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Fetch history error:', error)
    return { success: false, error: error.message }
  }
}

// Save user preferences
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Save preferences error:', error)
    return { success: false, error: error.message }
  }
}

// Get user preferences
export const getUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return { success: true, data: data || {} }
  } catch (error) {
    console.error('Fetch preferences error:', error)
    return { success: false, error: error.message }
  }
}

// ===================================
// AUTHENTICATION HELPERS (Optional)
// ===================================

// Sign up new user
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Sign in user
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Sign out user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { success: true, user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ===================================
// STORAGE BUCKET SETUP (Run once)
// ===================================

/*
Run these SQL commands in Supabase SQL Editor (Database → SQL Editor):

-- Create bhajans table
CREATE TABLE bhajans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  category TEXT DEFAULT 'bhajan',
  language TEXT DEFAULT 'hindi',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create scriptures table
CREATE TABLE scriptures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  pdf_url TEXT,
  source TEXT,
  language TEXT DEFAULT 'hindi',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_practices table
CREATE TABLE user_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  practice_type TEXT NOT NULL,
  duration INTEGER,
  notes TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  notification_morning TIME DEFAULT '06:00',
  notification_evening TIME DEFAULT '18:00',
  notifications_enabled BOOLEAN DEFAULT true,
  breathe_ambient_sound TEXT DEFAULT 'ocean',
  breathe_voice_language TEXT DEFAULT 'english',
  theme TEXT DEFAULT 'light',
  text_size TEXT DEFAULT 'normal'
);

-- Create indexes for performance
CREATE INDEX idx_bhajans_category ON bhajans(category);
CREATE INDEX idx_bhajans_language ON bhajans(language);
CREATE INDEX idx_user_practices_user ON user_practices(user_id, completed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE bhajans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scriptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Public read access for bhajans and scriptures
CREATE POLICY "Public read bhajans" ON bhajans FOR SELECT TO public USING (true);
CREATE POLICY "Public read scriptures" ON scriptures FOR SELECT TO public USING (true);

-- Users can only access their own practices and preferences
CREATE POLICY "Users own practices" ON user_practices 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users own preferences" ON user_preferences 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);
*/