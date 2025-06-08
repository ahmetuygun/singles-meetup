<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Register</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white flex items-center justify-center min-h-screen">
  <div class="w-full max-w-md mx-auto p-8 relative">
    <!-- Close button -->
    <div class="flex justify-end mb-6">
      <button class="text-3xl text-gray-600 hover:text-gray-800">&times;</button>
    </div>
    
    <!-- Title -->
    <h1 class="text-3xl font-bold mb-8 text-center text-black">Register</h1>
    
    <!-- Registration Form -->
    <form id="kc-register-form" action="${url.registrationAction}" method="post" class="space-y-6">
      
      <!-- Email Input -->
      <div>
        <input
          type="email"
          id="email"
          name="email"
          autocomplete="email"
          class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500"
          placeholder="Email"
          required
        >
      </div>
      
      <!-- First Name Input -->
      <div>
        <input
          type="text"
          id="firstName"
          name="firstName"
          autocomplete="given-name"
          class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500"
          placeholder="First Name"
          required
        >
      </div>
      
      <!-- Last Name Input -->
      <div>
        <input
          type="text"
          id="lastName"
          name="lastName"
          autocomplete="family-name"
          class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500"
          placeholder="Last Name"
          required
        >
      </div>
      
      <!-- Password Input -->
      <div class="relative">
        <input
          type="password"
          id="password"
          name="password"
          autocomplete="new-password"
          class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500 pr-12"
          placeholder="Password"
          required
        >
        <!-- Eye icon for password visibility -->
        <button type="button" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      
      <!-- Confirm Password Input -->
      <div class="relative">
        <input
          type="password"
          id="password-confirm"
          name="password-confirm"
          autocomplete="new-password"
          class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500 pr-12"
          placeholder="Confirm Password"
          required
        >
        <!-- Eye icon for password visibility -->
        <button type="button" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      
      <!-- Register Button -->
      <button 
        type="submit" 
        class="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-gray-800 transition-colors text-lg"
      >
        Register
      </button>
      
      <!-- Social Registration Buttons (only show if configured) -->
      <#if social.providers?? && social.providers?size gt 0>
        <!-- OR Divider -->
        <div class="text-center my-6">
          <span class="text-gray-500 font-medium">OR CONTINUE WITH</span>
        </div>
        
        <div class="space-y-3">
          <#list social.providers as p>
            <a 
              href="${p.loginUrl}" 
              class="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 text-lg"
            >
              <#if p.alias == 'apple'>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Sign up with Apple
              <#elseif p.alias == 'google'>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              <#else>
                ${p.displayName}
              </#if>
            </a>
          </#list>
        </div>
      </#if>
      
      <!-- Login Link -->
      <div class="text-center mt-6">
        <span class="text-gray-600">Already have an account? </span>
        <a href="${url.loginUrl}" class="text-black underline hover:no-underline">
          Sign in
        </a>
      </div>
    </form>
  </div>
</body>
</html>
