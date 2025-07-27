'use client';

import { useState, useEffect } from 'react';
import { GameConfig } from '@/types/config';
import ConfigInfoDisplay from './ConfigInfoDisplay';
import RedeemCodeManager from './RedeemCodeManager';
import UpdateDataEditor from './UpdateDataEditor';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

export default function ConfigPanel() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'redeem' | 'update'>('info');
  const [showAllCodes, setShowAllCodes] = useState(false);

  // 获取配置数据
  const fetchConfig = async (allCodes: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/config${allCodes ? '?allCodes=true' : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`获取配置失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || '获取配置失败');
      }

      setConfig(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 更新配置数据
  const updateConfig = async (newConfig: GameConfig, token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('认证失败：无效的授权令牌');
        }
        throw new Error(`更新配置失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || '更新配置失败');
      }

      setConfig(data.data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchConfig(showAllCodes);
  }, [showAllCodes]);

  // 切换是否显示所有兑换码
  const handleToggleAllCodes = () => {
    setShowAllCodes(!showAllCodes);
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchConfig(showAllCodes);
  };

  if (loading && !config) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 错误提示 */}
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* 工具栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🔄'}
              刷新数据
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAllCodes}
                onChange={handleToggleAllCodes}
                className="rounded"
              />
              显示所有兑换码（包括过期的）
            </label>
          </div>

          {config && (
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
              <div>
                任务名称: <span className="font-mono font-semibold">{config.updateData.questName}</span>
              </div>
              <div>
                SAA版本: <span className="font-mono font-semibold">{config.version}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'info', label: '配置概览', icon: '📊' },
            { key: 'redeem', label: '兑换码管理', icon: '🎫' },
            { key: 'update', label: '更新数据配置', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'info' | 'redeem' | 'update')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 标签页内容 */}
      {config && (
        <div className="space-y-6">
          {activeTab === 'info' && (
            <ConfigInfoDisplay
              config={config}
              showAllCodes={showAllCodes}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'redeem' && (
            <RedeemCodeManager
              config={config}
              onUpdate={updateConfig}
              showAllCodes={showAllCodes}
            />
          )}

          {activeTab === 'update' && (
            <UpdateDataEditor
              config={config}
              onUpdate={updateConfig}
            />
          )}
        </div>
      )}
    </div>
  );
}
