# When In Baguio Eats — Customer Mobile App

![When In Baguio Eats - Customer App](/projects/wibav3/overview.png)

---

## OVERVIEW

When In Baguio Eats serves as Baguio City's premier hyperlocal food discovery and delivery platform. As a Software Developer, I worked on the major **v2.0+ modernization and upgrade** of their existing customer-facing mobile app on iOS and Android (retaining the When in Baguio brand across its 60,000+ existing users). The upgrade re-architected the app in Flutter, implementing real-time push notifications, optimized map-based restaurant discovery, secure payment processing, and persistent cart state management for seamless ordering experiences.

---

## KEY HIGHLIGHTS

- **Cross-Platform Mobile Development** — Flutter app for iOS/Android with responsive UI adapting to 6+ screen sizes, real-time location-aware restaurant browsing, and persistent user sessions

- **Push Notification System** — Firebase Cloud Messaging integration with local notification scheduling, deep-linking support, and multi-channel alert management for order updates

- **Geospatial Features** — Leaflet-based delivery zone mapping, polygon-based restaurant availability filtering, address suggestion with geocoding/reverse-geocoding, and distance-based surcharge calculations

- **Secure Payment Gateway** — GCash payment integration with QR code generation, real-time payment status tracking, receipt generation and PDF export, and PCI-compliant transaction logging

- **State Management & Caching** — Provider-based architecture for predictable cart/user state, cached API responses reducing latency by 40%, offline-first local preferences with Shared Preferences and Secure Storage

- **Performance & Reliability** — Sub-500ms API response times via HTTP request timeout management, comprehensive error handling with retry logic, and 99.2% crash-free rate in production

---

## PROBLEM STATEMENT

Baguio's fragmented food delivery market lacked a unified, location-aware discovery platform. Users faced:

- **Discovery Friction** — No centralized way to browse restaurants within delivery zones, leading to time-consuming manual searches across multiple apps

- **Poor Availability Visibility** — Inability to determine real-time restaurant operating hours, delivery feasibility, or menu availability before placing orders

- **Payment Complexity** — Manual order entry for cash/GCash payments without digital confirmation or tracking, resulting in high cancellation rates and customer support overhead

- **Cart & Session Loss** — Users losing cart items during app navigation or session expiration, forcing re-entry of full orders

- **Notification Gaps** — Missed order status updates due to lack of push notification infrastructure, leaving customers unaware of delivery delays or order confirmations

---

## SOLUTION

Engineered a feature-rich mobile-first platform in Flutter with:

**Restaurant Discovery Engine** — Implemented responsive restaurant cards with real-time availability badges, category-based filtering, search across 500+ menu items, and geospatial polygon querying to show only delivery-eligible venues

**Location Services** — Integrated Google Maps, Leaflet GIS, and geocoding APIs to deliver address autocomplete, reverse-geocoding for dropped-pin locations, visual delivery zone previews, and distance-based fee calculation

**Push Notification Pipeline** — Built Firebase Cloud Messaging with smart scheduling, deep-link routing to order details, local notification caching for offline display, and WebSocket-based real-time order status updates

**Payment & Checkout Flow** — Developed 3-step secure checkout with auto-filled delivery address selection, GCash QR code generation, payment verification via PayMongo webhooks, and receipt persistence with PDF export capability

**State Persistence** — Architected Provider-based cart management with automatic save-to-device, session token refresh on app resume, and encrypted credential storage via Flutter Secure Storage

---

## MY ENGINEERING CONTRIBUTIONS

### Frontend Architecture & UI
- Architected responsive UI system supporting phones (360px–500px), tablets (600px–1200px) with adaptive layouts using custom `responsive.dart` utility
- Built 40+ reusable widgets (e.g., `RestaurantCard`, `FoodItemAddonGroups`, `CheckoutStepper`) with composition-based design for code reuse
- Implemented custom theme system with Material Design 3 compliance, dark mode support, and brand-consistent styling across 8+ feature modules

### State Management & Data Flow
- Designed multi-layered Provider architecture separating UI, business logic, and data access layers for testable, maintainable code
- Implemented cart persistence layer with automatic serialization to Shared Preferences, conflict resolution on concurrent edits, and undo/redo support
- Built user session manager handling OAuth login, token refresh, guest sessions, and seamless re-authentication on app resume

### API Integration & Networking
- Created `ApiService` singleton with declarative HTTP methods, built-in timeout management (30s default, 60s for large payloads), retry logic, and request/response logging
- Implemented request interceptors for auth token injection, device ID tracking, and error normalization across 40+ endpoints
- Built offline-first cache layer with configurable TTL, invalidation on auth state changes, and background sync for offline actions

### Location & Geospatial Features
- Integrated Google Maps/Leaflet for restaurant discovery with real-time marker clustering, custom annotation styling, and camera animation to user location
- Built address suggestion engine combining Google Places API, geocoding fallback, and delivery zone validation via polygon point-in-polygon algorithm
- Implemented distance calculation service (Haversine formula) for dynamic surcharge estimation and ETA prediction

### Push Notifications & Real-Time Updates
- Engineered Firebase Cloud Messaging setup for iOS/Android with platform-specific native code integration via method channels
- Built notification routing system with deep-linking to relevant screens (order tracking, payment confirmation, etc.)
- Implemented local notification caching for reliability when FCM delivery is delayed or device is offline
- Integrated WebSocket listener for real-time order status updates with automatic reconnection on network state changes

### Payment Processing Integration
- Integrated PayMongo payment gateway with secure QR code generation for GCash transactions
- Built payment verification flow with polling mechanism during QR scan, timeout handling, and user-friendly error messages
- Implemented receipt generation and PDF export using custom receipt templates and document creation libraries
- Ensured PCI compliance by never storing card details locally and using platform-secure storage for transaction IDs

### Testing & Quality Assurance
- Wrote 20+ unit tests for critical features (cart calculation, address validation, payment status checks) achieving 75% code coverage
- Created 15+ widget tests for key UI components validating responsive layouts, state changes, and user interactions
- Implemented integration tests for complete user flows (sign up → browse → checkout)
- Set up CI/CD pipeline with automated testing, linting, and build generation

### Performance Optimization
- Reduced app cold-start time by 35% through lazy-loading of heavy features and async Firebase initialization
- Optimized list rendering performance with `ListView.builder` for 1000+ restaurant results, custom caching for menu images
- Implemented image optimization reducing bundle size by 20% via WebP conversion and responsive image delivery
- Achieved sub-500ms API response times through request batching, pagination, and database query optimization

### Analytics & Error Tracking
- Integrated Firebase Analytics for tracking user flows, feature adoption, and funnel analysis
- Implemented Sentry error tracking with custom breadcrumbs, user context, and release management for proactive bug detection
- Built in-app error reporting UI allowing users to submit support tickets with automatic logs, device info, and screenshots

### Code Organization & Documentation
- Established feature-based folder structure following Clean Architecture principles with clear separation of concerns
- Wrote comprehensive inline documentation and README files for onboarding new team members
- Maintained 90%+ code review compliance with automated linting (Dart Analyzer) and custom lint rules
- Created reusable utilities library for common tasks (sanitization, formatting, validation)

---

## TECH STACK

### Mobile Frontend
- **Flutter 3.10+** — Cross-platform UI framework for iOS/Android
- **Dart** — Primary language with null safety, async/await patterns
- **Provider 6.1** — State management and dependency injection
- **Google Fonts** — Brand typography management

### Local Storage & Security
- **Shared Preferences** — Key-value storage for user preferences and lightweight data
- **Flutter Secure Storage** — Encrypted credential storage for auth tokens and sensitive data
- **UUID** — Unique identifiers for cart items and request tracing

### Maps & Location
- **Google Maps Flutter** — Interactive mapping for restaurant discovery and delivery zone preview
- **Leaflet GIS** — Geospatial polygon queries for delivery zone validation
- **Geolocator** — Native location access with permission handling
- **Geocoding** — Address ↔ coordinates conversion

### Networking & APIs
- **HTTP 1.2** — RESTful API calls with timeout management
- **Firebase Cloud Messaging (FCM)** — Push notifications (Firebase Core 4.6, Firebase Messaging 16.1)
- **PayMongo** — Payment processing gateway

### Notifications & Local Alerts
- **Flutter Local Notifications** — In-app and local notification management
- **Firebase Analytics** — User behavior tracking and conversion measurement

### Device & Platform Integration
- **Device Info Plus** — Device metadata for analytics and compatibility checks
- **Package Info Plus** — App version tracking
- **Permission Handler** — Runtime permission management for location, notifications, calendar

### Media & Content
- **Cached Network Image** — Image caching with LRU eviction for faster rendering
- **Flutter Cache Manager** — Custom cache management for media files
- **HTML Unescape** — Sanitizing API responses with HTML entities
- **URL Launcher** — Deep linking and external app navigation

### Build & Development
- **Flutter Lints** — Code quality and style enforcement
- **Flutter Launcher Icons** — Automated icon generation for iOS/Android
- **Connectivity Plus** — Network state monitoring for offline handling

---

## RESULTS & IMPACT

- **60,000+ Downloads** — Successfully launched on Google Play and TestFlight with 4.7+ star ratings
- **99.2% Crash-Free Rate** — Proactive error tracking and rapid bug fixes maintained high app stability in production
- **40% Faster Cart Operations** — Optimized API caching and local storage reduced perceived latency
- **80% Order Completion Rate** — Streamlined checkout and persistent cart state reduced cart abandonment
- **<500ms API Response Times** — Database optimization and pagination achieved sub-second user interactions
- **95%+ Push Notification Delivery** — FCM integration with fallback mechanisms ensured order updates reached users reliably

---

## KEY LEARNINGS

1. **Mobile-First Geospatial Design** — Implementing map-based discovery required careful balance between accuracy (polygon queries) and performance (client-side caching)
2. **Push Notification Reliability** — Multi-layer notification strategy (FCM + local caching + WebSocket fallback) proved essential for reliability in emerging markets with spotty connectivity
3. **State Management at Scale** — Provider architecture scaled well from single-screen prototypes to 40+ interconnected features, but required disciplined separation of concerns
4. **Payment Integration Security** — Partnering with PayMongo for hosted payments vs. handling cards directly eliminated PCI compliance burden and reduced fraud risk
5. **Cross-Platform Testing** — Testing on 6+ device sizes and both iOS/Android revealed platform-specific quirks (e.g., SafeArea differences, permission handling) early

---

## DEPLOYMENT & MAINTENANCE

- **iOS** — TestFlight beta distribution, App Store release with code signing
- **Android** — Google Play release with staged rollout (5% → 25% → 100%)
- **CI/CD** — GitHub Actions for automated testing, linting, and build generation
- **Monitoring** — Sentry error tracking, Firebase Crashlytics, in-app analytics dashboard
- **Support** — In-app feedback form with automatic log attachment, priority bug tracking

---

*This case study represents work completed from Q1 2024–Present. The app is actively maintained with bi-weekly feature releases and continuous performance improvements.*
