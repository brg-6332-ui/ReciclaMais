export type User = {
  id: string
  __type: 'User'
}

export type NewUser = Omit<User, 'id'>
