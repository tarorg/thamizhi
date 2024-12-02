export const mastodonConfig = {
  clientId: '6buRJBg_ucollhU5JuziMCSHsYRnRuB7apaO-WL6Phw',
  redirectUri: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api/auth/mastodon/callback'
    : 'https://thamizhi.vercel.app/api/auth/mastodon/callback',
  scopes: ['read', 'write', 'follow']
}
