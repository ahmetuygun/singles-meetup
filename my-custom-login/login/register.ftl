<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Register</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .solid-shadow-rectangle {
      background-color: #ffc700;
      border: 2px solid #000000;
      box-shadow: 4px 4px 0px #000000;
      transition: all 0.2s ease;
    }
    .solid-shadow-rectangle:hover {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px #000000;
    }
    .solid-shadow-rectangle:active {
      transform: translate(4px, 4px);
      box-shadow: 0px 0px 0px #000000;
    }
    .social-button {
      background-color: #ffffff;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
    }
    .social-button:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body class="bg-white flex items-center justify-center min-h-screen">
  <div class="w-full max-w-md mx-auto p-8 relative">
    <!-- Close button -->
    <div class="flex justify-end mb-6">
      <button class="text-3xl text-gray-600 hover:text-gray-800">&times;</button>
    </div>
    
    <!-- Logo at the top -->
    <div class="flex justify-center mb-8">
      <img src="${url.resourcesPath}/img/logo1.svg" alt="Logo" class="h-16 w-auto">
    </div>
    
    <!-- Title -->
    <h1 class="text-3xl font-bold mb-8 text-center text-black">Register</h1>

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
              class="w-full social-button text-gray-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg"
            >
              <#if p.alias == 'google'>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              <#elseif p.alias == 'linkedin-openid-connect'>
                <img src="${url.resourcesPath}/img/linkedin-logo.png" alt="LinkedIn" class="w-5 h-5">
                Continue with LinkedIn
              <#elseif p.alias == 'apple'>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              <#else>
                ${p.displayName}
              </#if>
            </a>
          </#list>
        </div>
      <#else>
        <!-- Default social buttons if no providers configured -->
        
        <div class="space-y-3">
          <button 
            type="button" 
            class="w-full social-button text-gray-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
                     <button 
             type="button" 
             class="w-full social-button text-gray-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg"
           >
             <img src="${url.resourcesPath}/img/linkedin-logo.png" alt="LinkedIn" class="w-5 h-5">
             Continue with LinkedIn
           </button>
        </div>
           <div class="text-center my-6">
          <span class="text-gray-500 font-medium">OR CONTINUE WITH</span>
        </div>
      </#if>
    
    <!-- Error Messages -->
    <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
      <div class="mb-4 p-4 rounded-lg ${message.type}-message flex items-center gap-2">
        <#if message.type = 'success'>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </#if>
        <#if message.type = 'warning'>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </#if>
        <#if message.type = 'error'>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </#if>
        <#if message.type = 'info'>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </#if>
        <span class="message-text font-medium">${kcSanitize(message.summary)?no_esc}</span>
      </div>
    </#if>
    
    <!-- Registration Form -->
    <form id="kc-register-form" action="${url.registrationAction}" method="post" class="space-y-6">
      
      <!-- Username field is hidden when registrationEmailAsUsername is true -->
      <#if !realm.registrationEmailAsUsername>
        <div>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500"
            placeholder="Username"
            value="${(register.formData.username!'')}"
            required
          >
          <#if messagesPerField.existsError('username')>
            <div class="text-red-500 text-sm mt-1">${kcSanitize(messagesPerField.get('username'))?no_esc}</div>
          </#if>
        </div>
      </#if>
      
      <!-- Email Input -->
      <div>
        <input
          type="email"
          id="email"
          name="email"
          autocomplete="email"
          class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-500"
          placeholder="Email"
          value="${(register.formData.email!'')}"
          required
        >
        <#if messagesPerField.existsError('email')>
          <div class="text-red-500 text-sm mt-1">${kcSanitize(messagesPerField.get('email'))?no_esc}</div>
        </#if>
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
          value="${(register.formData.firstName!'')}"
          required
        >
        <#if messagesPerField.existsError('firstName')>
          <div class="text-red-500 text-sm mt-1">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</div>
        </#if>
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
          value="${(register.formData.lastName!'')}"
          required
        >
        <#if messagesPerField.existsError('lastName')>
          <div class="text-red-500 text-sm mt-1">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</div>
        </#if>
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
        <button type="button" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" onclick="togglePassword('password')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <#if messagesPerField.existsError('password')>
          <div class="text-red-500 text-sm mt-1">${kcSanitize(messagesPerField.get('password'))?no_esc}</div>
        </#if>
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
        <button type="button" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" onclick="togglePassword('password-confirm')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <#if messagesPerField.existsError('password-confirm')>
          <div class="text-red-500 text-sm mt-1">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</div>
        </#if>
      </div>
      
      <!-- Register Button with solid-shadow-rectangle style -->
      <button 
        type="submit" 
        class="w-full solid-shadow-rectangle text-black font-bold py-4 rounded-2xl text-lg"
      >
        Register
      </button>
      
 
      
      <!-- Login Link -->
      <div class="text-center mt-6">
        <span class="text-gray-600">Already have an account? </span>
        <a href="${url.loginUrl}" class="text-black underline hover:no-underline">
          Sign in
        </a>
      </div>
    </form>
  </div>

  <!-- JavaScript for password toggle and error styling -->
  <script>
    function togglePassword(fieldId) {
      const field = document.getElementById(fieldId);
      const button = field.nextElementSibling;
      const svg = button.querySelector('svg');
      
      if (field.type === 'password') {
        field.type = 'text';
        // Change to eye-off icon
        svg.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
      } else {
        field.type = 'password';
        // Change back to eye icon
        svg.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }
    }
  </script>

  <!-- Error message styling -->
  <style>
    .error-message {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }
    .success-message {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
    }
    .warning-message {
      background-color: #fffbeb;
      border: 1px solid #fed7aa;
      color: #d97706;
    }
    .info-message {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
    }
  </style>
</body>
</html>
