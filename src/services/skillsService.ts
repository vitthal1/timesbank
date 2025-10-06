import { supabase } from '../lib/supabaseClient'
import { Skill, UserSkill } from '../types'

// Get all skills
export const getAllSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase.from('skills').select('*')
  if (error) throw error
  return data
}

// Get user skills
export const getUserSkills = async (userId: string): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from('user_skills')
    .select('skill:skill_id(name)')
    .eq('user_id', userId)
  if (error) throw error
  return data.map((d: any) => d.skill)
}

// Assign skill to user
export const addUserSkill = async (userId: string, skillId: string) => {
  const { data, error } = await supabase.from('user_skills').insert([{ user_id: userId, skill_id: skillId }])
  if (error) throw error
  return data
}

// Remove skill from user
export const removeUserSkill = async (userId: string, skillId: string) => {
  const { data, error } = await supabase.from('user_skills').delete().eq('user_id', userId).eq('skill_id', skillId)
  if (error) throw error
  return data
}

// Match users by skills
export const matchUsersBySkills = async (skillIds: string[], currentUserId: string) => {
  const { data, error } = await supabase
    .from('user_skills')
    .select('user_id')
    .in('skill_id', skillIds)
    .neq('user_id', currentUserId)
  if (error) throw error
  return data.map(d => d.user_id)
}

export async function createSkill(name: string): Promise<Skill> {
  const response = await fetch('/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  return response.json()
}