# Instagram Widget Implementation

## Overview

This Instagram widget displays posts from the @kc360gym Instagram account with a beautiful, responsive interface. The implementation includes fallback data for reliable display and a service architecture ready for Instagram API integration.

## Features

- ✅ Responsive horizontal scrolling feed
- ✅ Post type indicators (carousel, video)
- ✅ Loading states and error handling
- ✅ Like and comment count display
- ✅ Relative timestamp formatting
- ✅ Accessibility features
- ✅ Dark mode support
- ✅ Performance optimizations

## Current Implementation

The widget currently uses fallback data to ensure consistent display. This allows the application to work immediately without requiring Instagram API setup.

### Files Structure

```
src/app/components/social-feed/
├── social-feed.html        # Template with Instagram UI
├── social-feed.scss        # Styling with Instagram branding
├── social-feed.ts          # Component logic
└── README.md              # This documentation

src/app/services/
├── instagram.service.ts    # Instagram data service

src/app/interfaces/
├── instagram.ts           # Instagram type definitions
```

## Instagram API Integration

To connect to live Instagram data, you have several options:

### Option 1: Instagram Basic Display API (Recommended for Personal Accounts)

1. **Create Facebook App**
   ```bash
   # Visit https://developers.facebook.com/apps/
   # Create new app -> Consumer -> Basic Display
   ```

2. **Configure Basic Display**
   ```bash
   # Add Instagram Basic Display product
   # Set OAuth Redirect URIs
   # Get App ID and App Secret
   ```

3. **Update Service Configuration**
   ```typescript
   // In instagram.service.ts
   private config: InstagramConfig = {
     accessToken: 'YOUR_ACCESS_TOKEN',
     accountUsername: 'kc360gym',
     // ... other config
   };
   ```

4. **Implement Authentication Flow**
   ```typescript
   // Add to your auth service or component
   authenticateInstagram() {
     const authUrl = `https://api.instagram.com/oauth/authorize
       ?client_id={app-id}
       &redirect_uri={redirect-uri}
       &scope=user_profile,user_media
       &response_type=code`;
     
     window.location.href = authUrl;
   }
   ```

### Option 2: Instagram Graph API (For Business Accounts)

1. **Business Account Setup**
   - Convert Instagram account to Business
   - Connect to Facebook Page

2. **API Configuration**
   ```typescript
   // Update instagram.service.ts
   getInstagramGraphPosts(accessToken: string, userId: string) {
     // This method is already implemented
     return this.http.get(`${this.INSTAGRAM_BASE_URL}/${userId}/media`);
   }
   ```

### Option 3: Server-Side Proxy (Recommended for Production)

Create a backend service to handle Instagram API calls:

```php
// Example PHP endpoint
<?php
// api/instagram-feed.php
function getInstagramPosts($accessToken, $limit = 12) {
    $url = "https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit={$limit}&access_token={$accessToken}";
    
    $response = file_get_contents($url);
    return json_decode($response, true);
}
?>
```

Then update the Angular service:
```typescript
// In instagram.service.ts
getInstagramPosts(): Observable<ProcessedInstagramPost[]> {
  return this.http.get<any>('/api/instagram-feed.php')
    .pipe(
      map(response => this.processInstagramPosts(response.data)),
      catchError(() => this.getFallbackPosts())
    );
}
```

## Configuration

### Environment Variables

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  instagram: {
    appId: 'YOUR_APP_ID',
    appSecret: 'YOUR_APP_SECRET',
    redirectUri: 'http://localhost:4200/auth/instagram/callback',
    accessToken: 'YOUR_ACCESS_TOKEN'
  }
};
```

### Service Configuration

```typescript
// Update instagram.service.ts constructor
constructor(private http: HttpClient) {
  this.config = {
    ...this.config,
    accessToken: environment.instagram.accessToken,
    // ... other environment config
  };
  this.loadPosts();
}
```

## Security Considerations

1. **Never expose credentials in frontend code**
2. **Use server-side proxy for API calls**
3. **Implement token refresh mechanism**
4. **Store sensitive data in environment variables**
5. **Use HTTPS for all Instagram API communication**

## Rate Limiting

Instagram APIs have rate limits:
- Basic Display API: 200 calls/hour
- Graph API: 240 calls/hour per user

Implement caching:
```typescript
// In instagram.service.ts
private cacheKey = 'instagram_posts_cache';
private cacheTimeout = 30 * 60 * 1000; // 30 minutes

private getCachedPosts(): ProcessedInstagramPost[] | null {
  const cached = localStorage.getItem(this.cacheKey);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > this.cacheTimeout) return null;
  
  return data;
}
```

## Customization

### Styling
- Update colors in `social-feed.scss`
- Modify Instagram brand colors in CSS variables
- Adjust responsive breakpoints

### Data Display
- Modify `ProcessedInstagramPost` interface
- Update template in `social-feed.html`
- Customize fallback data in service

### Post Filtering
```typescript
// Add filtering capability
filterPosts(posts: ProcessedInstagramPost[]): ProcessedInstagramPost[] {
  return posts.filter(post => 
    !post.text.toLowerCase().includes('private') &&
    post.timestamp > this.getDateDaysAgo(30)
  );
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Use server-side proxy or configure CORS headers
   ```

2. **Access Token Expiry**
   ```typescript
   // Implement token refresh
   refreshAccessToken(refreshToken: string) {
     // Already implemented in service
   }
   ```

3. **API Rate Limiting**
   ```typescript
   // Implement exponential backoff
   private retryDelay = 1000;
   
   retryApiCall(fn: () => Observable<any>, attempt = 1): Observable<any> {
     return fn().pipe(
       catchError(error => {
         if (attempt < 3) {
           return timer(this.retryDelay * attempt).pipe(
             switchMap(() => this.retryApiCall(fn, attempt + 1))
           );
         }
         throw error;
       })
     );
   }
   ```

## Performance Optimization

1. **Lazy Loading**: Images load only when needed
2. **TrackBy Function**: Optimizes ngFor rendering
3. **OnPush Strategy**: Consider for better performance
4. **Image Optimization**: Compress images before display
5. **Pagination**: Load posts in chunks

## Testing

```typescript
// Example test
describe('InstagramService', () => {
  it('should handle API failures gracefully', () => {
    // Test fallback data loading
    // Test error state handling
    // Test retry functionality
  });
});
```

## Deployment Notes

1. **Environment Configuration**: Set up production Instagram app
2. **SSL Certificate**: Required for Instagram authentication
3. **Domain Verification**: Register redirect URIs
4. **Webhook Setup**: For real-time updates (optional)

## Support

For Instagram API issues:
- [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Facebook Developer Support](https://developers.facebook.com/support/)

For implementation questions, refer to the service documentation and component comments.