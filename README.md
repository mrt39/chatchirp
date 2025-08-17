# ChatChirp - Real-Time Messaging Platform
![preview1](https://github.com/mrt39/chatchirp/assets/90144973/6078e29a-287b-4e8e-aab9-1c3edfced2d3)


<h2>🖥️ Live Preview</h2>

https://chatchirp.chat/

<h2>📓 Description</h2>
A RESTful, high-performance, real-time messaging platform that delivers instant communication experiences through advanced WebSocket architecture. Built with scalability in mind, ChatChirp leverages Pusher for real-time messaging, sophisticated caching mechanisms, and intelligent state management to provide users with lightning-fast message delivery, instant notifications, and multi-device synchronization. 
After registering (or logging in with a Google account), users can search other users, send messages and images, and engage in real-time conversations with instant notifications.

<h2>⭐ Features</h2>
<ul>
  <li>Real-Time Messaging
    <ul>
      <li>Instant message delivery with no-refresh updates using Pusher WebSockets</li>
      <li>Audio notifications that plays sounds for new received messages</li>
      <li>Real-time contact synchronization - contacts list updates immediately when new conversations start</li>
      <li>Message status tracking with read/unread indicators and last message previews</li>
      <li>Cross-tab synchronization for consistent state across multiple browser sessions</li>
    </ul>
  </li>
  <li>Advanced Authentication System
    <ul>
      <li>Multi-provider authentication supporting Google OAuth and local registration</li>
      <li>Secure session management with MongoDB session store and CSRF protection</li>
      <li>Private channel authentication ensuring only authorized users receive their messages</li>
    </ul>
  </li>
  <li>Caching Architecture
    <ul>
      <li>Multi-layered caching system with sessionStorage for lightning-fast UI responses</li>
      <li>Cache invalidation with additional TTL mechanisms and user-specific isolation</li>
      <li>Request deduplication preventing redundant API calls across components</li>
      <li>Context-based state management eliminating unnecessary re-renders and API requests</li>
    </ul>
  </li>
  <li>Media & Content Management
    <ul>
      <li>Image messaging with Cloudinary integration for optimized storage and delivery</li>
      <li>Profile picture uploads with compression and validation</li>
      <li>Real-time image message previews appearing instantly in conversations</li>
      <li>File validation with type checking and size limits</li>
    </ul>
  </li>
  <li>User Experience
    <ul>
      <li>Dynamic theme switching with persistent light/dark mode preferences</li>
      <li>Responsive contact management with instant search and filtering</li>
      <li>User discovery with "Meet New People" recommendations</li>
      <li>Optimistic UI updates providing immediate visual feedback before server confirmation</li>
      <li>Intelligent form validation with real-time feedback and error handling</li>
    </ul>
  </li>
</ul>

<h2>⚙️ Technical Optimizations</h2>
<ul>
  <li>High-Performance Real-Time Architecture
    <ul>
      <li>Pusher WebSocket implementation</li>
      <li>Private channel authentication with secure user authorization</li>
    </ul>
  </li>
  <li>Advanced Database Operations
    <ul>
      <li>Optimized MongoDB queries with selective field population and parallel operations</li>
      <li>Contact aggregation combining sent/received messages for conversation lists</li>
      <li>Efficient message retrieval with user-specific filtering and date-based organization</li>
      <li>Session-based authentication with secure credential management</li>
    </ul>
  </li>
</ul>

<h2>⚛ Built With</h2>
<ul>
  <li>Node.js/Express</li>
  <li>MongoDB Atlas</li>
  <li>Pusher</li>
  <li>Cloudinary</li>
  <li>Passport.js</li>
  <li>React</li>
  <li>Vite</li>
  <li>Material-UI</li>
  <li>Bootstrap</li>
</ul>
