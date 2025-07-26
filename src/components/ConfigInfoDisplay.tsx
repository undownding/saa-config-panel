import { GameConfig } from '@/types/config';

interface ConfigInfoDisplayProps {
  config: GameConfig;
  showAllCodes: boolean;
  onRefresh: () => void;
}

export default function ConfigInfoDisplay({ config, showAllCodes }: ConfigInfoDisplayProps) {
  // 计算过期和有效的兑换码
  const now = new Date();
  const validCodes = config.redeemCodes.filter(code => new Date(code.expiredAt) > now);
  const expiredCodes = config.redeemCodes.filter(code => new Date(code.expiredAt) <= now);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 基本信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📋</span>
          基本信息
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">任务名称</span>
            <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
              {config.questName}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">SAA版本</span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              {config.version}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">兑换码总数</span>
            <span className="font-semibold">{config.redeemCodes.length}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">有效兑换码</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {validCodes.length}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">过期兑换码</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {expiredCodes.length}
            </span>
          </div>
        </div>
      </div>

      {/* 更新数据概览 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🖥️</span>
          显示配置
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">在线宽度</span>
            <span className="font-mono font-semibold">{config.updateData.onlineWidth}px</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">在线高度</span>
            <span className="font-mono font-semibold">{config.updateData.onlineHeight}px</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Link ID</span>
            <span className="font-mono font-semibold">{config.updateData.linkId}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">Link Cat ID</span>
            <span className="font-mono font-semibold">{config.updateData.linkCatId}</span>
          </div>
        </div>
      </div>

      {/* Stuff 位置配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📦</span>
          Stuff 位置
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">起始坐标</div>
            <div className="font-mono font-semibold">
              ({config.updateData.stuff.x1}, {config.updateData.stuff.y1})
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">结束坐标</div>
            <div className="font-mono font-semibold">
              ({config.updateData.stuff.x2}, {config.updateData.stuff.y2})
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">区域大小</div>
          <div className="font-mono font-semibold">
            {Math.abs(config.updateData.stuff.x2 - config.updateData.stuff.x1)} × {Math.abs(config.updateData.stuff.y2 - config.updateData.stuff.y1)}
          </div>
        </div>
      </div>

      {/* Chasm 位置配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🕳️</span>
          Chasm 位置
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">起始坐标</div>
            <div className="font-mono font-semibold">
              ({config.updateData.chasm.x1}, {config.updateData.chasm.y1})
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">结束坐标</div>
            <div className="font-mono font-semibold">
              ({config.updateData.chasm.x2}, {config.updateData.chasm.y2})
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">区域大小</div>
          <div className="font-mono font-semibold">
            {Math.abs(config.updateData.chasm.x2 - config.updateData.chasm.x1)} × {Math.abs(config.updateData.chasm.y2 - config.updateData.chasm.y1)}
          </div>
        </div>
      </div>

      {/* 兑换码列表 */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🎫</span>
          兑换码列表
          {!showAllCodes && expiredCodes.length > 0 && (
            <span className="text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
              隐藏了 {expiredCodes.length} 个过期码
            </span>
          )}
        </h2>

        {config.redeemCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无兑换码
          </div>
        ) : (
          <div className="space-y-2">
            {(showAllCodes ? config.redeemCodes : validCodes).map((code, index) => {
              const isExpired = new Date(code.expiredAt) <= now;
              const expiryDate = new Date(code.expiredAt);

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isExpired
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${isExpired ? '❌' : '✅'}`}>
                      {isExpired ? '❌' : '✅'}
                    </span>
                    <div>
                      <div className="font-mono font-semibold text-lg">
                        {code.code}
                      </div>
                      <div className={`text-sm ${
                        isExpired 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {isExpired ? '已过期' : '有效'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      过期时间
                    </div>
                    <div className="font-mono text-sm">
                      {expiryDate.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
