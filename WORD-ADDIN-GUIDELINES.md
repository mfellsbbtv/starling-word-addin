# Word Add-in Development Guidelines
*Adapted from augment-guidelines for Office Add-in development*

## 1. General Principles
- Reply clearly and briefly; include code only when it clarifies the answer
- Apply client-side security best practices and Office Add-in security guidelines
- Follow Microsoft Office Add-in development standards

## 2. Technology Stack
- **Runtime**: Client-side JavaScript with Office.js API
- **Development**: Node.js 20 LTS with webpack-dev-server
- **Deployment**: GitHub Pages or CDN for static hosting
- **Testing**: Office Add-in testing tools and manifest validation
- **Bundling**: Webpack with optimization for Office environments

## 3. Add-in Architecture Defaults
- **Manifest**: Valid XML with proper versioning and GUID management
- **Security**: HTTPS-only URLs; Content Security Policy for iframe protection
- **API Integration**: Office.js with comprehensive error handling and fallbacks
- **UI Framework**: Microsoft Fabric UI or vanilla JS with Office styling
- **Error Handling**: Graceful degradation when Office APIs unavailable
- **Performance**: Optimized bundle size for fast loading in Office clients

## 4. Development Conventions
- **File Structure**: Modular organization with separate concerns
  - `/src/taskpane/` - Main add-in UI and logic
  - `/src/commands/` - Ribbon commands and functions
  - `/src/shared/` - Shared utilities and helpers
  - `/assets/` - Icons and static resources
- **Manifests**: Separate manifests for development and production
- **Versioning**: Semantic versioning in manifest files
- **Environment**: Local development with localhost, production with HTTPS CDN

## 5. Security Requirements
- **HTTPS Mandatory**: All add-in URLs must use HTTPS
- **No Client Secrets**: Never store sensitive data in client-side code
- **CSP Headers**: Implement Content Security Policy for iframe security
- **API Security**: Secure communication with backend APIs using proper authentication
- **Manifest Security**: Validate manifest files and use proper GUIDs
- **Office Compliance**: Follow Microsoft's Office Add-in security guidelines

## 6. CI/CD Pipeline
- **GitHub Actions**: Automated build, test, and deployment
- **Build Process**: `npm run build` → optimized bundle → deploy to GitHub Pages
- **Testing**: Manifest validation, ESLint checks, Office.js compatibility tests
- **Versioning**: Git tags with semantic versioning
- **Deployment**: Automated deployment to GitHub Pages on main branch

## 7. Code Quality Standards
- **JavaScript**: ESLint with Office Add-in specific rules
- **Formatting**: Prettier with consistent configuration
- **Line Length**: ≤ 100 characters per line
- **Naming**: Descriptive function and variable names
- **Comments**: Clear documentation for Office.js API usage
- **Error Handling**: Comprehensive try-catch blocks with user-friendly messages

## 8. Office.js Best Practices
- **API Compatibility**: Test across Word Desktop, Word Online, and mobile
- **Error Handling**: Always check for Office.js availability before API calls
- **Fallback Modes**: Provide demo/offline functionality when APIs unavailable
- **Performance**: Minimize Office.js API calls and batch operations when possible
- **Initialization**: Proper Office.onReady() handling with timeout protection

## 9. Scalability Considerations
*When planning for enterprise deployment, consider:*
- Expected number of concurrent users
- Document size and complexity requirements
- Network latency and offline scenarios
- Integration with enterprise systems and APIs

## 10. Forbidden Patterns
- Hard-coded secrets or API keys in client-side code
- HTTP URLs in production manifests (HTTPS required)
- Blocking Office.js API calls without timeout protection
- Large bundle sizes that slow add-in loading
- Deprecated Office.js API versions
- Direct DOM manipulation without Office context consideration

## 11. Testing Strategy
- **Manifest Validation**: Automated testing of manifest XML structure
- **Office.js Compatibility**: Test API availability and fallback scenarios
- **Cross-Platform**: Test in Word Desktop, Word Online, and mobile
- **Error Scenarios**: Test network failures and API unavailability
- **User Experience**: Test loading times and responsiveness

## 12. Performance Optimization
- **Bundle Size**: Minimize JavaScript bundle size for fast loading
- **Lazy Loading**: Load features on-demand when possible
- **Caching**: Implement appropriate caching strategies
- **API Efficiency**: Batch Office.js operations and minimize API calls
- **Resource Optimization**: Optimize images and assets for web delivery

## 13. Documentation Requirements
- **README**: Clear setup and development instructions
- **API Documentation**: Document custom functions and Office.js usage
- **Deployment Guide**: Step-by-step deployment instructions
- **Troubleshooting**: Common issues and solutions
- **Manifest Guide**: Explanation of manifest configurations

## 14. Monitoring and Observability
- **Error Tracking**: Client-side error logging and reporting
- **Usage Analytics**: Track feature usage and performance metrics
- **User Feedback**: Implement feedback collection mechanisms
- **Performance Monitoring**: Track loading times and API response times

---

*These guidelines ensure secure, scalable, and maintainable Office Word Add-in development while following Microsoft's best practices and modern web development standards.*
