// src/components/Admin/UsersTable.tsx
import { useEffect, useState } from 'react'
import { getAllUsers, adminUpdateUser } from '../../services/adminService'
import { User } from '../../types'

export const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    async function fetchUsers() {
      setUsers(await getAllUsers())
    }
    fetchUsers()
  }, [])

  const toggleAdmin = async (user: User) => {
    await adminUpdateUser(user.id, { is_admin: !user.is_admin })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_admin: !u.is_admin } : u))
  }

  return (
    <table>
      <thead>
        <tr><th>Email</th><th>Admin</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.email}</td>
            <td>{u.is_admin ? '✅' : '❌'}</td>
            <td>
              <button onClick={() => toggleAdmin(u)}>Toggle Admin</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
