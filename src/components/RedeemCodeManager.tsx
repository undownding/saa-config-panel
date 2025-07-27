'use client';

import { useState, useEffect } from 'react';
import { GameConfig, RedeemCode } from '@/types/config';
import LoadingSpinner from './LoadingSpinner';
import { getSavedBearerToken, saveBearerToken } from '@/lib/token-storage';

interface RedeemCodeManagerProps {
  config: GameConfig;
  onUpdate: (newConfig: GameConfig, token: string) => Promise<boolean>;
  showAllCodes: boolean;
}

export default function RedeemCodeManager({ config, onUpdate, showAllCodes }: RedeemCodeManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCodes, setEditingCodes] = useState<RedeemCode[]>([]);
  const [newCode, setNewCode] = useState({ code: '', expiredAt: '' });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // 计算过期和有效的兑换码
  const now = new Date();
  const validCodes = config.redeemCodes.filter(code => new Date(code.expiredAt) > now);
  const expiredCodes = config.redeemCodes.filter(code => new Date(code.expiredAt) <= now);
  const displayCodes = showAllCodes ? config.redeemCodes : validCodes;

  // 组件挂载时加载保存的 token
  useEffect(() => {
    const savedToken = getSavedBearerToken();
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const startEditing = () => {
    setEditingCodes([...config.redeemCodes]);
    setIsEditing(true);
    // 重新加载保存的 token
    const savedToken = getSavedBearerToken();
    if (savedToken) {
      setToken(savedToken);
    }
  };

  const cancelEditing = () => {
    setEditingCodes([]);
    setNewCode({ code: '', expiredAt: '' });
    setIsEditing(false);
  };

  const addNewCode = () => {
    if (newCode.code.trim() && newCode.expiredAt) {
      setEditingCodes([...editingCodes, { ...newCode, code: newCode.code.trim() }]);
      setNewCode({ code: '', expiredAt: '' });
    }
  };

  const removeCode = (index: number) => {
    setEditingCodes(editingCodes.filter((_, i) => i !== index));
  };

  const updateCode = (index: number, field: keyof RedeemCode, value: string) => {
    const updated = [...editingCodes];
    updated[index] = { ...updated[index], [field]: value };
    setEditingCodes(updated);
  };

  const saveChanges = async () => {
    if (!token.trim()) {
      alert('请输入授权令牌');
      return;
    }

    setLoading(true);

    // 保存 token 到 localStorage
    saveBearerToken(token.trim());

    const newConfig = {
      ...config,
      redeemCodes: editingCodes
    };

    const success = await onUpdate(newConfig, token.trim());
    if (success) {
      setIsEditing(false);
      setToken('');
    }
    setLoading(false);
  };

  // 获取默认的过期时间（7天后）
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🎫</span>
          兑换码管理
        </h2>

        {!isEditing ? (
          <button
            onClick={startEditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <span>✏️</span>
            编辑兑换码
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelEditing}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              取消
            </button>
            <button
              onClick={saveChanges}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <span>💾</span>}
              保存更改
            </button>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {config.redeemCodes.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总数</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {validCodes.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">有效</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {expiredCodes.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">过期</div>
        </div>
      </div>

      {isEditing && (
        <>
          {/* 授权令牌输入 */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              授权令牌 (Bearer Token)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="请输入 Bearer Token"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 添加新兑换码 */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              添加新兑换码
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  兑换码
                </label>
                <input
                  type="text"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  placeholder="输入兑换码"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  过期时间
                </label>
                <input
                  type="datetime-local"
                  value={newCode.expiredAt}
                  onChange={(e) => setNewCode({ ...newCode, expiredAt: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  defaultValue={getDefaultExpiryDate()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addNewCode}
                  disabled={!newCode.code.trim() || !newCode.expiredAt}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 兑换码列表 */}
      <div className="space-y-3">
        {(isEditing ? editingCodes : displayCodes).map((code, index) => {
          const isExpired = new Date(code.expiredAt) <= now;
          const expiryDate = new Date(code.expiredAt);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isExpired
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}
            >
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      兑换码
                    </label>
                    <input
                      type="text"
                      value={code.code}
                      onChange={(e) => updateCode(index, 'code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      过期时间
                    </label>
                    <input
                      type="datetime-local"
                      value={code.expiredAt.slice(0, 16)}
                      onChange={(e) => updateCode(index, 'expiredAt', e.target.value + ':00.000Z')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCode(index)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
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
              )}
            </div>
          );
        })}

        {(isEditing ? editingCodes : displayCodes).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isEditing ? '暂无兑换码，请添加新的兑换码' : '暂无兑换码'}
          </div>
        )}
      </div>
    </div>
  );
}
