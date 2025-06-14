<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Link Account</title>
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
    .secondary-button {
      background-color: #ffffff;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
    }
    .secondary-button:hover {
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
      <img src="${url.resourcesPath}/img/logo-bg-white.svg" alt="Logo" class="h-16 w-auto">
    </div>
    
    <!-- Title -->
    <h1 class="text-3xl font-bold mb-8 text-center text-black">${msg("confirmLinkIdpTitle")}</h1>
    
    <!-- Link Account Form -->
    <form id="kc-register-form" action="${url.loginAction}" method="post" class="space-y-6">
      <div class="space-y-4">
        <!-- Update Profile Button -->
        <button 
          type="submit" 
          name="submitAction" 
          id="updateProfile" 
          value="updateProfile"
          class="w-full secondary-button text-gray-700 font-semibold py-4 rounded-2xl text-lg"
        >
          ${msg("confirmLinkIdpReviewProfile")}
        </button>
        
        <!-- Continue Button with solid-shadow-rectangle style -->
        <button 
          type="submit" 
          name="submitAction" 
          id="linkAccount" 
          value="linkAccount"
          class="w-full solid-shadow-rectangle text-black font-bold py-4 rounded-2xl text-lg"
        >
          ${msg("confirmLinkIdpContinue", idpDisplayName)}
        </button>
      </div>
    </form>
  </div>
</body>
</html>
