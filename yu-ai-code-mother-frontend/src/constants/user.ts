export const DEFAULT_USER_NAME = '匿名用户'
export const DEFAULT_USER_AVATAR = '/default-anonymous-avatar.png'

export const getUserDisplayName = (userName?: string | null) => {
  const normalizedName = userName?.trim()
  return normalizedName && normalizedName !== '无名' ? normalizedName : DEFAULT_USER_NAME
}
