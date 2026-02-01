import z from 'zod/v4'

export const userSchema = z.object({
  id: z.uuid(),
  __type: z
    .string()
    .nullish()
    .transform(() => 'User' as const),
})

export type User = z.infer<typeof userSchema>
export type NewUser = Omit<User, 'id'>

export function createNewUser(data: Omit<NewUser, '__type'>): NewUser {
  return userSchema.omit({ id: true }).parse(data)
}
