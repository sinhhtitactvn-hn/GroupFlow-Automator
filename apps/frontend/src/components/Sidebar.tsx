import Link from "next/link";

export default function Sidebar() {
  const menus = [
    { name: "Dashboard", icon: "📊", path: "/" },
    { name: "Quản lý Tài khoản", icon: "👥", path: "/accounts" },
    { name: "Chiến dịch Auto-Post", icon: "📝", path: "/campaigns/post" },
    { name: "Chiến dịch Auto-Comment", icon: "💬", path: "/campaigns/comment" },
    { name: "Cấu hình Proxy", icon: "🌐", path: "/proxies" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          GroupFlow Automator
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.path}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="text-xl">{menu.icon}</span>
            <span className="font-medium">{menu.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">License: Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}