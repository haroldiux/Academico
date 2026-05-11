let sharedAuth = { token: null, user: null }

export function getSharedToken() { return sharedAuth.token }
export function getSharedUser() { return sharedAuth.user }
export function setSharedAuth(token, user) { sharedAuth.token = token; sharedAuth.user = user }
export function hasSharedToken() { return !!sharedAuth.token }
export function clearSharedAuth() { sharedAuth.token = null; sharedAuth.user = null }
