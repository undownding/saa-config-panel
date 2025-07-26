import ConfigPanel from '@/components/ConfigPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            SAA 配置管理面板
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            游戏配置和兑换码管理系统
          </p>
        </div>
        <ConfigPanel />
      </div>
    </main>
  );
}
