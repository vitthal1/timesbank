// src/components/Dashboard/MatchList.tsx
import { useEffect, useState } from 'react'
import { matchUsersBySkills } from '../../services/skillsService'

export const MatchList = ({ userId, userSkillIds }: { userId: string, userSkillIds: string[] }) => {
  const [matches, setMatches] = useState<string[]>([])

  useEffect(() => {
    async function fetchMatches() {
      const users = await matchUsersBySkills(userSkillIds, userId)
      setMatches(users)
    }
    fetchMatches()
  }, [userId, userSkillIds])

  return (
    <div className="card">
      <h2>Suggested Matches</h2>
      <ul>
        {matches.map(id => <li key={id}>{id}</li>)}
      </ul>
    </div>
  )
}
