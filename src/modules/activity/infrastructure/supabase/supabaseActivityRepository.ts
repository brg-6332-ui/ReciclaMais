import { activitySchema, NewActivity } from '~/modules/activity/domain/activity'
import { SUPABASE_TABLE_ACTIVITIES } from '~/modules/activity/infrastructure/supabase/constants'
import { User } from '~/modules/user/domain/user'
import { supabase } from '~/shared/infrastructure/supabase/supabase'

export function createSupabaseActivityRepository() {
  return {
    async fetchActivities(user_id: User['id']) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE_ACTIVITIES)
        .select('*')
        .eq('user_id', user_id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching activities:', error)
        throw error
      }

      return data.map((activity) => {
        const { success, data } = activitySchema.safeParse(activity)
        if (!success) {
          console.error('Error parsing activity:', data)
          throw new Error('Error parsing activity')
        }
        return data
      })
    },

    async addActivity(activity: Omit<NewActivity, 'id'>) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE_ACTIVITIES)
        .insert(activity)
        .select()
        .single()

      if (error) {
        console.error('Error adding activity:', error)
        throw error
      }

      return data
    },
  }
}
