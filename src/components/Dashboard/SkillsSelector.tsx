// src/components/Dashboard/SkillsSelector.tsx
import { useEffect, useState } from 'react'
import { getAllSkills, getUserSkills, addUserSkill, removeUserSkill } from '../../services/skillsService'
import { supabase } from '../../lib/supabaseClient'
import { Skill } from '../../types'

export const SkillsSelector = ({ userId }: { userId: string }) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [userSkills, setUserSkills] = useState<Skill[]>([])
  const [newSkillName, setNewSkillName] = useState('')
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSkills() {
      setSkills(await getAllSkills())
      setUserSkills(await getUserSkills(userId))
    }
    fetchSkills()
  }, [userId])

  const toggleSkill = async (skillId: string) => {
    try {
      if (userSkills.find(s => s.id === skillId)) {
        await removeUserSkill(userId, skillId)
        setUserSkills(prev => prev.filter(s => s.id !== skillId))
      } else {
        await addUserSkill(userId, skillId)
        const skill = skills.find(s => s.id === skillId)
        if (skill) setUserSkills(prev => [...prev, skill])
      }
      setError('')
    } catch (err) {
      setError('Failed to update skill')
    }
  }

  const handleAddNewSkill = async () => {
    const trimmedName = newSkillName.trim()
    
    if (!trimmedName) {
      setError('Please enter a skill name')
      return
    }

    // Check if skill already exists
    const existingSkill = skills.find(
      s => s.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (existingSkill) {
      // If exists, just add it to user's skills if not already added
      if (!userSkills.find(s => s.id === existingSkill.id)) {
        await toggleSkill(existingSkill.id)
      }
      setNewSkillName('')
      setIsAddingSkill(false)
      setError('')
      return
    }

    try {
      // Create new skill directly with Supabase
      const { data: newSkill, error: createError } = await supabase
        .from('skills')
        .insert([{ name: trimmedName }])
        .select()
        .single()
      
      if (createError) throw createError
      
      setSkills(prev => [...prev, newSkill])
      
      // Add to user's skills
      await addUserSkill(userId, newSkill.id)
      setUserSkills(prev => [...prev, newSkill])
      
      // Reset form
      setNewSkillName('')
      setIsAddingSkill(false)
      setError('')
    } catch (err) {
      setError('Failed to add new skill')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNewSkill()
    } else if (e.key === 'Escape') {
      setIsAddingSkill(false)
      setNewSkillName('')
      setError('')
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Skills</h2>
        {!isAddingSkill && (
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsAddingSkill(true)}
          >
            + Add Skill
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAddingSkill && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter skill name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleAddNewSkill}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAddingSkill(false)
              setNewSkillName('')
              setError('')
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <button
            key={skill.id}
            className={`px-3 py-1 rounded transition-colors ${
              userSkills.find(s => s.id === skill.id)
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => toggleSkill(skill.id)}
          >
            {skill.name}
          </button>
        ))}
      </div>
    </div>
  )
}