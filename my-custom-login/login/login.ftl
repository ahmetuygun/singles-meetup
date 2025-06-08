<!-- Custom Login Page -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Tailwind CSS CDN (optional) -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
<div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
  <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Welcome to My Custom Login</h1>
  <form action="${url.loginAction}" method="post" class="space-y-4">
    <div>
      <label for="username" class="block text-sm font-medium text-gray-600">Username</label>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Enter your username"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        required
      >
    </div>
    <div>
      <label for="password" class="block text-sm font-medium text-gray-600">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        placeholder="Enter your password"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        required
      >
    </div>
    <div>
      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        Login
      </button>
    </div>
  </form>
</div>
</body>
</html>
