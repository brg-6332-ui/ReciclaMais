export type User = {
  id: string
  __type: 'User'
}

export type NewUser = Omit<User, 'id'>

export function createNewUser(data: Omit<NewUser, '__type'>): NewUser {
  return {
    ...data,
    __type: 'User',
  }
}
