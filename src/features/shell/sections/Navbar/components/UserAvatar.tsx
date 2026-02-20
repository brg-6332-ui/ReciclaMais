import { USER_ICON_PATH } from '../constants'

interface UserAvatarProps {
  avatarUrl: string | undefined
  size?: 'small' | 'large'
}

/**
 * User avatar component displaying user profile image or fallback icon
 */
export function UserAvatar(props: UserAvatarProps) {
  const isLarge = () => props.size === 'large'

  return (
    <>
      {props.avatarUrl ? (
        <img
          src={props.avatarUrl}
          alt="User avatar"
          class={
            isLarge()
              ? 'h-full w-full object-cover'
              : 'h-8 w-8 rounded-full object-cover'
          }
        />
      ) : (
        <svg
          class={`${isLarge() ? 'h-5 w-5 m-auto' : 'h-5 w-5'} text-muted-foreground`}
          viewBox={USER_ICON_PATH.viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {USER_ICON_PATH.paths.map((pathData) => (
            <path
              d={pathData.d}
              stroke={pathData.stroke}
              stroke-width={pathData.strokeWidth}
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          ))}
        </svg>
      )}
    </>
  )
}
