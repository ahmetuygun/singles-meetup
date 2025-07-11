<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Review Profile</title>
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
    <h1 class="text-3xl font-bold mb-8 text-center text-black">${msg("loginIdpReviewProfileTitle")}</h1>
    
    <!-- Display global messages if any -->
    <#if messagesPerField.exists('global')>
      <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <#list messagesPerField.get('global') as error>
          <p class="text-red-600 text-sm">${error}</p>
        </#list>
      </div>
    </#if>
    
    <!-- Review Profile Form -->
    <form id="kc-idp-review-profile-form" action="${url.loginAction}" method="post" class="space-y-6">
      
      <!-- User Profile Fields -->
      <#if profile??>
        <#list profile.attributes as attribute>
          <#if attribute.name == "username">
            <div>
              <label for="${attribute.name}" class="block text-sm font-medium text-gray-700 mb-2">
                ${msg("username")} <#if attribute.required><span class="text-red-500">*</span></#if>
              </label>
              <input
                type="text"
                id="${attribute.name}"
                name="${attribute.name}"
                value="${(attribute.value)!}"
                class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                <#if attribute.readOnly>readonly</#if>
                <#if attribute.required>required</#if>
              >
              <#if messagesPerField.exists(attribute.name)>
                <div class="mt-2">
                  <#list messagesPerField.get(attribute.name) as error>
                    <p class="text-red-600 text-sm">${error}</p>
                  </#list>
                </div>
              </#if>
            </div>
          <#elseif attribute.name == "email">
            <div>
              <label for="${attribute.name}" class="block text-sm font-medium text-gray-700 mb-2">
                ${msg("email")} <#if attribute.required><span class="text-red-500">*</span></#if>
              </label>
              <input
                type="email"
                id="${attribute.name}"
                name="${attribute.name}"
                value="${(attribute.value)!}"
                class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                <#if attribute.readOnly>readonly</#if>
                <#if attribute.required>required</#if>
              >
              <#if messagesPerField.exists(attribute.name)>
                <div class="mt-2">
                  <#list messagesPerField.get(attribute.name) as error>
                    <p class="text-red-600 text-sm">${error}</p>
                  </#list>
                </div>
              </#if>
            </div>
          <#elseif attribute.name == "firstName">
            <div>
              <label for="${attribute.name}" class="block text-sm font-medium text-gray-700 mb-2">
                ${msg("firstName")} <#if attribute.required><span class="text-red-500">*</span></#if>
              </label>
              <input
                type="text"
                id="${attribute.name}"
                name="${attribute.name}"
                value="${(attribute.value)!}"
                class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                <#if attribute.readOnly>readonly</#if>
                <#if attribute.required>required</#if>
              >
              <#if messagesPerField.exists(attribute.name)>
                <div class="mt-2">
                  <#list messagesPerField.get(attribute.name) as error>
                    <p class="text-red-600 text-sm">${error}</p>
                  </#list>
                </div>
              </#if>
            </div>
          <#elseif attribute.name == "lastName">
            <div>
              <label for="${attribute.name}" class="block text-sm font-medium text-gray-700 mb-2">
                ${msg("lastName")} <#if attribute.required><span class="text-red-500">*</span></#if>
              </label>
              <input
                type="text"
                id="${attribute.name}"
                name="${attribute.name}"
                value="${(attribute.value)!}"
                class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                <#if attribute.readOnly>readonly</#if>
                <#if attribute.required>required</#if>
              >
              <#if messagesPerField.exists(attribute.name)>
                <div class="mt-2">
                  <#list messagesPerField.get(attribute.name) as error>
                    <p class="text-red-600 text-sm">${error}</p>
                  </#list>
                </div>
              </#if>
            </div>
          <#else>
            <!-- Generic field handling -->
            <div>
              <label for="${attribute.name}" class="block text-sm font-medium text-gray-700 mb-2">
                ${attribute.displayName!attribute.name} <#if attribute.required><span class="text-red-500">*</span></#if>
              </label>
              <input
                type="text"
                id="${attribute.name}"
                name="${attribute.name}"
                value="${(attribute.value)!}"
                class="w-full px-6 py-4 text-lg rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                <#if attribute.readOnly>readonly</#if>
                <#if attribute.required>required</#if>
              >
              <#if messagesPerField.exists(attribute.name)>
                <div class="mt-2">
                  <#list messagesPerField.get(attribute.name) as error>
                    <p class="text-red-600 text-sm">${error}</p>
                  </#list>
                </div>
              </#if>
            </div>
          </#if>
        </#list>
      </#if>
      
      <!-- Submit Button with solid-shadow-rectangle style -->
      <button 
        type="submit" 
        class="w-full solid-shadow-rectangle text-black font-bold py-4 rounded-2xl text-lg"
      >
        ${msg("doSubmit")}
      </button>
    </form>
  </div>
</body>
</html>